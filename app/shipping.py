"""Shipneer courier booking (https://shipneer.com/apiv2).

The API key is read from the environment (SHIPNEER_API_KEY) or the git-ignored .env file at the repository root.
It never reaches a browser: Shipneer's own label and tracking links carry the key in their query string (u=...),
so labels are fetched here and served to signed-in staff, and customers see our own tracking timeline.

Flow (staff-driven): "Get courier prices" calls add_order (sends the order, returns couriers and prices for it);
staff pick one and "Book" calls book_parcel (returns the AWB and shipneer_ordref); then print_label / track_parcel /
cancel_shipment, each keyed by shipneer_ordref. Tracking is checked hourly in the background.
"""
import calendar
import json
import threading
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

try:
    from app.errors import Error
except ImportError:
    from errors import Error

BASE = 'https://shipneer.com/apiv2/'
ROOT = Path(__file__).resolve().parent.parent

# Vebe life care, Plot 6,7,8, Por Industrial Park Phase 2, Por, Vadodara 391243 (chosen by the owner, 12 Nov 2026).
DEFAULT_PICKUP_ID = '3c87da04d17a04279e35ebfbf6cf44455f4aa3'
DEFAULT_PICKUP_PIN = '391243'

# Standard parcels until real packed sizes are measured; staff can change them per order.
# Couriers charge by size as well as weight (L x W x H / 5000 kg), so small orders get a small box.
SMALL_BOX = {'length': 15, 'width': 10, 'height': 8}   # 1-2 items, counts as 0.24 kg
BOX = {'length': 20, 'width': 15, 'height': 10}        # 3+ items, counts as 0.6 kg
BASE_GRAMS, GRAMS_PER_UNIT = 100, 150

STATES = {
    'AN': 'Andaman and Nicobar Islands', 'AP': 'Andhra Pradesh', 'AR': 'Arunachal Pradesh', 'AS': 'Assam', 'BR': 'Bihar',
    'CH': 'Chandigarh', 'DN': 'Dadra and Nagar Haveli', 'DD': 'Daman and Diu', 'DL': 'Delhi', 'GA': 'Goa', 'GJ': 'Gujarat',
    'HR': 'Haryana', 'HP': 'Himachal Pradesh', 'JK': 'Jammu and Kashmir', 'KA': 'Karnataka', 'KL': 'Kerala',
    'LD': 'Lakshadweep', 'MP': 'Madhya Pradesh', 'MH': 'Maharashtra', 'MN': 'Manipur', 'ML': 'Meghalaya', 'MZ': 'Mizoram',
    'NL': 'Nagaland', 'OR': 'Odisha', 'PY': 'Puducherry', 'PB': 'Punjab', 'RJ': 'Rajasthan', 'SK': 'Sikkim',
    'TN': 'Tamil Nadu', 'TR': 'Tripura', 'UP': 'Uttar Pradesh', 'WB': 'West Bengal', 'TS': 'Telangana',
    'JH': 'Jharkhand', 'UK': 'Uttarakhand', 'CG': 'Chhattisgarh', 'LA': 'Ladakh',
}
_ALIASES = {'orissa': 'OR', 'pondicherry': 'PY', 'uttaranchal': 'UK', 'chattisgarh': 'CG', 'new delhi': 'DL',
            'nct of delhi': 'DL', 'jammu & kashmir': 'JK', 'andaman & nicobar islands': 'AN', 'telengana': 'TS',
            'dadra and nagar haveli and daman and diu': 'DN', 'the dadra and nagar haveli and daman and diu': 'DN'}
_BY_NAME = {v.lower(): k for k, v in STATES.items()} | _ALIASES

# Shipneer tracking notes -> our order states. Anything else is kept as an event for staff to read.
DELIVERED = {'delivered'}
RETURNED = {'rto delivered', 'rto', 'returned', 'return to origin', 'rto in transit', 'rto initiated'}


_SHORT = {'j&k': 'JK', 'delhi ncr': 'DL'}
NAMES = {'AN': 'Andaman and Nicobar Islands', 'DN': 'Dadra and Nagar Haveli and Daman and Diu', 'DD': 'Dadra and Nagar Haveli and Daman and Diu'}


def state_name(value):
    """The canonical state name for an order or saved address, or an Error asking the customer to choose from the list."""
    try: code = state_code(value)
    except Error: raise Error('Choose your state from the list.', 400, field='state')
    return NAMES.get(code) or STATES[code]


def state_code(name):
    """Exact names (any case), two-letter codes and a few official alternatives. Checkout offers a list, so nothing is guessed."""
    s = re.sub(r'\s+', ' ', str(name or '').strip().strip('.,'))
    low = s.lower().replace(' & ', ' and ')
    if s.upper() in STATES: return s.upper()
    code = _BY_NAME.get(low) or _SHORT.get(low) or _SHORT.get(s.lower())
    if not code: raise Error(f'Shipneer needs a recognised Indian state; “{s}” is not one. Correct the order address first.')
    return code


def _env_file():
    path = ROOT / '.env'
    out = {}
    if path.is_file():
        for line in path.read_text().splitlines():
            m = re.match(r'\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$', line)
            if m and not line.lstrip().startswith('#'): out[m.group(1)] = m.group(2).strip('"\'')
    return out


def config():
    env = _env_file()
    get = lambda k, d='': os.getenv(k) or env.get(k) or d
    return {'key': get('SHIPNEER_API_KEY'), 'pickup_id': get('SHIPNEER_PICKUP_ID', DEFAULT_PICKUP_ID),
            'pickup_pin': get('SHIPNEER_PICKUP_PIN', DEFAULT_PICKUP_PIN)}


def configured():
    return bool(config()['key'])


def _key():
    k = config()['key']
    if not k: raise Error('Shipneer is not connected. Add SHIPNEER_API_KEY to the server settings.', 503)
    return k


def _ok(body):
    return isinstance(body, dict) and (body.get('status') == 'success' or body.get('success') is True)


def _fail(body, fallback):
    msg = body.get('message') or body.get('error') or body.get('msg') if isinstance(body, dict) else None
    if isinstance(msg, (list, dict)): msg = json.dumps(msg)
    raise Error('Shipneer: ' + (str(msg)[:300] if msg else fallback), 502)


def _request(method, endpoint, payload=None, query=None, raw=False, opener=None, timeout=30):
    key = _key()
    url = BASE + endpoint
    if query: url += '?' + urllib.parse.urlencode({'u': key, **query})
    req = urllib.request.Request(url, method=method, headers={'X-API-KEY': key, 'Content-Type': 'application/json', 'Accept': '*/*',
                                                              'User-Agent': 'BodyCafeCo-Operations/1.0'},
                                 data=json.dumps(payload).encode() if payload is not None else None)
    try:
        with (opener or urllib.request.urlopen)(req, timeout=timeout) as r:
            body, ctype = r.read(), r.headers.get('Content-Type', '')
    except urllib.error.HTTPError as e:
        body, ctype = e.read(), e.headers.get('Content-Type', '')
        try: _fail(json.loads(body), f'request failed ({e.code}).')
        except ValueError: raise Error(f'Shipneer: request failed ({e.code}).', 502)
    except (urllib.error.URLError, TimeoutError, OSError):
        raise Error('Shipneer could not be reached. Try again in a minute.', 502)
    if raw: return body, ctype
    try: return json.loads(body)
    except ValueError: raise Error('Shipneer sent an unexpected reply. Try again, or check the order in the Shipneer dashboard.', 502)


def default_parcel(items):
    units = sum(int(i.get('quantity', 0)) for i in items)
    return {'weight_g': BASE_GRAMS + GRAMS_PER_UNIT * max(units, 1), **(SMALL_BOX if units <= 2 else BOX)}


def clean_parcel(data, items):
    d = default_parcel(items)
    out = {}
    for k, lo, hi in (('weight_g', 10, 30000), ('length', 1, 150), ('width', 1, 150), ('height', 1, 150)):
        v = data.get(k, d[k])
        if isinstance(v, str) and v.strip().isdigit(): v = int(v)
        if type(v) not in (int, float) or not lo <= v <= hi: raise Error('Enter the parcel weight in grams and its size in cm.')
        out[k] = int(round(v))
    return out


def order_payload(oid, order, parcel, created, ship_id=None):
    c = order['contact']
    address = re.sub(r'\s+', ' ', str(c.get('address', ''))).strip()
    line1, line2 = address, ''
    if len(address) > 100:  # split long single-line addresses at a comma near the middle
        cut = address.rfind(',', 0, 100)
        cut = cut if cut > 20 else 100
        line1, line2 = address[:cut].strip(' ,'), address[cut:].strip(' ,')
    value = int(order['total'])
    units = sum(i['quantity'] for i in order['items']) or 1
    per_unit_kg = round(parcel['weight_g'] / 1000 / units, 3)
    return {
        'order': {'order_id': ship_id if ship_id is not None else oid, 'order_number': oid, 'date': time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(created)),
                  'shipment_type': 'P', 'shipment_value': value, 'cod_collect': 0},
        'delivery': {'name': c['name'], 'phone': '91' + str(c['mobile']), 'email': c.get('email') or '',
                     'address_line1': line1, 'address_line2': line2 or c.get('city', ''), 'city': c['city'],
                     'state': state_code(c.get('state')), 'pincode': str(c['pincode']), 'country': 'IN'},
        'pickup_id': config()['pickup_id'],
        'weight': round(parcel['weight_g'] / 1000, 3), 'length': parcel['length'], 'width': parcel['width'], 'height': parcel['height'],
        'items': [{'sku': i.get('sku') or i['id'], 'name': i['name'], 'qty': i['quantity'], 'price': i['unit_price'], 'weight': per_unit_kg}
                  for i in order['items']],
    }


def _couriers(body):
    out = []
    for x in body.get('courier_list') or []:
        r = x.get('rate') or {}
        if x.get('courier_code'):
            out.append({'name': str(x.get('courier_name', '')).strip(), 'code': str(x['courier_code']),
                        'price': r.get('price'), 'gst': r.get('gst'), 'rate': r.get('rate')})
    return sorted(out, key=lambda x: (x['rate'] is None, x['rate'] or 0))


def add_order(payload, opener=None):
    body = _request('POST', 'add_order', payload, opener=opener)
    if not _ok(body): _fail(body, 'the order could not be sent.')
    couriers = _couriers(body)
    if not couriers: raise Error('Shipneer returned no couriers for this pincode and parcel.', 502)
    return {'chargeable_weight': body.get('chargeable_weight'), 'couriers': couriers}


def rates(destination_pin, weight_g, box, value, opener=None):
    body = _request('POST', 'rate_calculator', {'pickup_pin': config()['pickup_pin'], 'destination_pin': str(destination_pin), 'weight': weight_g,
                                                **box, 'shipment_type': 'P', 'shipment_value': value}, opener=opener)
    if not _ok(body): _fail(body, 'rates are unavailable.')
    return _couriers(body)


def book(oid, code, opener=None):
    body = _request('POST', 'book_parcel', {'order_id': oid, 'book_code': code}, opener=opener)
    if not _ok(body) or not body.get('shipneer_ordref'): _fail(body, 'the courier could not be booked.')
    return {'awb': str(body.get('awb_number') or ''), 'courier': str(body.get('courier_name') or '').strip(),
            'ordref': str(body['shipneer_ordref']), 'charge': body.get('courier_charge')}


def cancel(ordref, opener=None):
    body = _request('POST', 'cancel_shipment', {'cancel_order': ordref}, opener=opener)
    if not _ok(body): _fail(body, 'the shipment could not be cancelled.')
    return True


def label(ordref, opener=None):
    """Fetch the label, trying twice: Shipneer sometimes needs a moment after booking before the label exists."""
    body, ctype, last = b'', '', None
    for attempt in range(2):
        try:
            body, ctype = _request('GET', 'print_label', query={'ord': ordref}, raw=True, opener=opener)
            if body: break
        except Error as e:
            last = e
        if attempt == 0: time.sleep(2)
    if not body:
        if last and 'request failed' not in str(last): raise last
        raise Error('Shipneer couldn’t produce the label just now. Try again in a minute, or print it from the Shipneer dashboard.', 502)
    if 'json' in ctype:
        try: _fail(json.loads(body), 'the label is unavailable.')
        except ValueError: pass
    return (ctype.split(';')[0].strip() or 'application/octet-stream'), body


def ist_epoch(text):
    """Shipneer times look like 04/11/26 19:29:00 (day/month/year, India time, UTC+5:30)."""
    for fmt in ('%d/%m/%y %H:%M:%S', '%d/%m/%Y %H:%M:%S', '%Y-%m-%d %H:%M:%S', '%d-%m-%Y %H:%M:%S'):
        try:
            return calendar.timegm(time.strptime(str(text).strip(), fmt)) - 19800
        except (ValueError, OverflowError):
            continue
    return None


def track(ordref, opener=None, timeout=30):
    body = _request('GET', 'track_parcel', query={'ord': ordref}, opener=opener, timeout=timeout)
    if not _ok(body): _fail(body, 'tracking is unavailable.')
    d = body.get('data') or {}
    events = []
    for e in d.get('tracking') or []:
        note = str(e.get('notes') or '').strip()
        if not note: continue
        events.append({'at': ist_epoch(e.get('datetime')), 'text': str(e.get('datetime') or ''), 'location': str(e.get('location') or '').strip().title(), 'note': note})
    events.sort(key=lambda e: e['at'] or 0, reverse=True)
    status = str(d.get('status') or (events[0]['note'] if events else '')).strip()
    low = status.lower()
    outcome = 'delivered' if low in DELIVERED else 'returned' if low in RETURNED or low.startswith('rto') else None
    return {'awb': str(d.get('awb') or ''), 'courier': str(d.get('courier') or ''), 'status': status, 'outcome': outcome,
            'events': events[:60], 'checked': int(time.time())}


SHIP_ACTIONS = ('ship_quote', 'ship_book', 'ship_track', 'ship_cancel', 'ship_restock')
FIRST_SHIP_ID = 10001
EPOCH_2026 = 1767225600
QUOTE_TTL = 6 * 3600   # courier prices older than this must be fetched again before booking
TRACK_EVERY = 3600     # each booked parcel is checked about once an hour
TICK = 600             # the background checker wakes every 10 minutes


class ShippingMixin:
    """Shipneer for the operations portal: staff get prices, choose a courier and book; tracking updates by itself.

    Booking is one request inside one database transaction (BEGIN IMMEDIATE), so two clicks can't book twice:
    the second waits for the first and then finds the booking. request_id makes a resent click a no-op.
    Stock: booking records a "Shipped" movement per batch; cancelling records it coming back; a returned parcel
    can be restocked from the order.
    """

    def _ship_lots_ok(self, c, oid):
        bad = c.execute("SELECT 1 FROM reservations r JOIN batches b ON b.id=r.batch WHERE r.order_id=? AND (b.state!='released' OR b.proof!=1 OR b.expiry<=?)", (oid, int(time.time()))).fetchone()
        if bad: raise Error('Resolve quarantined, expired or unreleased batches before shipping.', 409)

    def _ship_next_id(self, c):
        # Shipneer accepts only a numeric order_id, and each number only once ("Order already processed"), so every
        # price request gets a fresh one; our BCC-... id goes in order_number, which is what the label prints.
        row = c.execute("SELECT data FROM settings WHERE id='shipneer_seq'").fetchone()
        n = max((json.loads(row[0]) if row else FIRST_SHIP_ID - 1) + 1, int((time.time() - EPOCH_2026) * 10))
        c.execute("INSERT OR REPLACE INTO settings VALUES('shipneer_seq',?)", (json.dumps(n),))
        return n

    def _ship_save(self, c, oid, state, p):
        c.execute('UPDATE orders SET state=?,data=? WHERE id=?', (state, json.dumps(p), oid))

    def _ship_order(self, c, oid):
        r = c.execute('SELECT * FROM orders WHERE id=?', (oid,)).fetchone()
        if not r: raise Error('Order not found.', 404)
        return r, json.loads(r['data'])

    def _ship_stock(self, c, s, oid, sign, kind, reason):
        for res in c.execute("SELECT batch,quantity FROM reservations WHERE order_id=? AND state='consumed'", (oid,)).fetchall():
            self.stock_move(c, s, res['batch'], sign * res['quantity'], kind, reason)

    def shipping_action(self, c, s, action, data):
        r, p = self.owned_order(c, s, data.get('id'))
        oid, sn, now = r['id'], dict(p.get('shipneer') or {}), int(time.time())
        before = {'state': r['state'], 'provider': p.get('provider'), 'tracking': p.get('tracking')}
        if action == 'ship_quote':
            if r['state'] not in ('paid', 'packing'): raise Error('Only paid or packing orders can be booked.', 409)
            if sn.get('ordref'): raise Error('This order is already booked with Shipneer. Cancel that booking first.', 409)
            self._ship_lots_ok(c, oid)
            parcel = clean_parcel(data, p['items'])
            ship_id = self._ship_next_id(c)
            quote = add_order(order_payload(oid, p, parcel, r['created'], ship_id))
            sn.update({'ship_id': ship_id, 'parcel': parcel, 'couriers': quote['couriers'], 'chargeable_weight': quote['chargeable_weight'], 'quoted': now})
            p['shipneer'] = sn
            self._ship_save(c, oid, r['state'], p)
            self.operation_log(c, s['user_id'], 'shipment_quoted', oid, None, {'parcel': parcel, 'couriers': len(quote['couriers'])}, 'Sent to Shipneer')
            return {'ok': True, 'couriers': quote['couriers']}
        if action == 'ship_book':
            if r['state'] not in ('paid', 'packing'): raise Error('Only paid or packing orders can be booked.', 409)
            if sn.get('ordref'): raise Error('This order is already booked with Shipneer.', 409)
            code = str(data.get('code', ''))
            courier = next((x for x in sn.get('couriers') or [] if x['code'] == code), None)
            if not courier: raise Error('Choose a courier from the list.', 409)
            if now - sn.get('quoted', 0) > QUOTE_TTL: raise Error('These prices are over six hours old. Get courier prices again.', 409)
            self._ship_lots_ok(c, oid)
            booked = book(sn['ship_id'], code)
            sn.update({'ordref': booked['ordref'], 'awb': booked['awb'], 'courier': booked['courier'] or courier['name'],
                       'charge': booked['charge'], 'rate': courier['rate'], 'booked': now, 'booked_by': s['user_id']})
            sn.pop('couriers', None)
            p.update({'shipneer': sn, 'provider': sn['courier'], 'tracking': booked['awb'], 'tracking_status': 'Booked', 'tracking_events': []})
            p['history'].append({'state': 'shipped', 'at': now, 'note': f"Packed and booked with {sn['courier']}. Tracking number {booked['awb']}."})
            p.setdefault('internal_notes', []).append({'text': f"Shipneer booking {booked['ordref']} · {sn['courier']} · ₹{booked['charge']}", 'at': now, 'actor': s['user_id']})
            self._ship_save(c, oid, 'shipped', p)
            self._ship_stock(c, s, oid, -1, 'ship', f"{oid} · {sn['courier']} {booked['awb']}")
            self.operation_log(c, s['user_id'], 'order_shipped', oid, before, {'state': 'shipped', 'provider': sn['courier'], 'tracking': booked['awb']}, 'Booked with Shipneer')
            return {'ok': True, 'awb': booked['awb'], 'courier': sn['courier']}
        if action == 'ship_track':
            if not sn.get('ordref'): raise Error('This order has no Shipneer booking.', 409)
            return {'ok': True, **self._apply_tracking(c, r, p, track(sn['ordref']))}
        if action == 'ship_cancel':
            if not sn.get('ordref'): raise Error('This order has no Shipneer booking.', 409)
            if r['state'] != 'shipped': raise Error('Only a booked, undelivered shipment can be cancelled.', 409)
            reason = str(data.get('remarks', '')).strip()
            if len(reason) < 5: raise Error('Add a remark for cancelling this booking.')
            cancel(sn['ordref'])
            sn.update({'cancelled': {'ordref': sn['ordref'], 'awb': sn.get('awb'), 'at': now}})
            for k in ('ordref', 'awb', 'courier', 'charge', 'booked', 'booked_by', 'couriers', 'quoted', 'tracking_checked', 'rate', 'returned'): sn.pop(k, None)
            p.update({'shipneer': sn, 'provider': None, 'tracking': None, 'tracking_status': None, 'tracking_events': []})
            p['history'].append({'state': 'packing', 'at': now, 'note': 'The courier booking was changed. A new tracking number follows.'})
            p.setdefault('internal_notes', []).append({'text': 'Shipneer booking cancelled: ' + reason, 'at': now, 'actor': s['user_id']})
            self._ship_save(c, oid, 'packing', p)
            self._ship_stock(c, s, oid, 1, 'unship', f'{oid} · booking cancelled, parcel back in packing')
            self.operation_log(c, s['user_id'], 'shipment_cancelled', oid, before, {'state': 'packing'}, reason)
            return {'ok': True}
        if action == 'ship_restock':
            # The courier brought the parcel back (return to origin): its units go back on the shelf and the order is
            # closed as cancelled with a refund to make.
            if r['state'] != 'shipped' or not sn.get('ordref'): raise Error('Only a shipped parcel that came back can be restocked.', 409)
            if not sn.get('returned'): raise Error('The courier hasn’t reported this parcel as returned. Refresh tracking first.', 409)
            reason = str(data.get('remarks', '')).strip()
            if len(reason) < 5: raise Error('Add a remark, for example the parcel’s condition.')
            for res in c.execute("SELECT * FROM reservations WHERE order_id=? AND state='consumed'", (oid,)).fetchall():
                c.execute('UPDATE batches SET available=available+? WHERE id=?', (res['quantity'], res['batch']))
                c.execute("UPDATE reservations SET state='returned' WHERE id=?", (res['id'],))
                self.stock_move(c, s, res['batch'], res['quantity'], 'return', f'{oid} · returned by courier · {reason}')
            sn['restocked'] = now
            p['shipneer'] = sn
            if self.payment_status(c, oid) == 'captured': p['refund'] = 'pending_refund'
            p['history'].append({'state': 'cancelled', 'at': now, 'note': 'The parcel came back to us. Your refund follows.'})
            p.setdefault('internal_notes', []).append({'text': 'Returned parcel restocked: ' + reason, 'at': now, 'actor': s['user_id']})
            self._ship_save(c, oid, 'cancelled', p)
            self.operation_log(c, s['user_id'], 'order_returned', oid, before, {'state': 'cancelled'}, reason)
            return {'ok': True}
        raise Error('Unsupported shipping action.', 404)

    def _apply_tracking(self, c, r, p, t):
        sn = p.get('shipneer') or {}
        now = int(time.time())
        sn['tracking_checked'] = now
        p['shipneer'] = sn
        p['tracking_status'] = t['status'] or p.get('tracking_status')
        p['tracking_events'] = t['events']
        state = r['state']
        if t['outcome'] == 'delivered' and state == 'shipped' and not sn.get('returned'):
            state = 'delivered'
            at = next((e['at'] for e in t['events'] if e['note'].lower() == 'delivered' and e['at']), now)
            p['history'].append({'state': 'delivered', 'at': at})
            self.operation_log(c, 'shipneer', 'order_delivered', r['id'], {'state': 'shipped'}, {'state': 'delivered'}, 'Courier reported delivery')
        elif t['outcome'] == 'returned' and not sn.get('returned'):
            sn['returned'] = now
            p.setdefault('internal_notes', []).append({'text': 'Courier reports a return to origin (' + t['status'] + '). When the parcel arrives, use Restock returned parcel.', 'at': now, 'actor': 'shipneer'})
        self._ship_save(c, r['id'], state, p)
        return {'state': state, 'status': p['tracking_status'], 'events': t['events']}

    def shipping_tick(self):
        """Check every booked, undelivered parcel that wasn't checked in the last hour. Returns how many were checked."""
        if not configured(): return 0
        now = int(time.time())
        with self.db() as c:
            due = []
            for r in c.execute("SELECT id,data FROM orders WHERE state='shipped'"):
                sn = json.loads(r['data']).get('shipneer') or {}
                if sn.get('ordref') and now - (sn.get('tracking_checked') or 0) >= TRACK_EVERY: due.append((r['id'], sn['ordref']))
        done = 0
        for oid, ref in due:
            try: t = track(ref, timeout=20)
            except Error: break  # Shipneer slow or down: try the rest next time
            with self.db() as c:
                r, p = self._ship_order(c, oid)
                if (p.get('shipneer') or {}).get('ordref') == ref and r['state'] == 'shipped':
                    self._apply_tracking(c, r, p, t); done += 1
        return done

    def shipping_scheduler(self):
        def loop():
            while True:
                try: self.shipping_tick()
                except Exception: pass
                time.sleep(TICK)
        threading.Thread(target=loop, daemon=True, name='shipneer-tracking').start()

    def shipping_label(self, s, oid):
        self.require(s, 'admin')
        with self.db() as c:
            r, p = self.owned_order(c, s, oid)
        ref = (p.get('shipneer') or {}).get('ordref')
        if not ref: raise Error('This order has no Shipneer booking.', 404)
        return label(ref)


# ---------------------------------------------------------------- product-page delivery check
# Uses Shipneer's free rate check (no order is created). Answers are cached per pincode for a day, and each visitor
# gets a modest number of checks, so the page can't be used to hammer Shipneer.
CHECK_TTL = 24 * 3600
CHECK_LIMIT = 30           # checks per visitor per hour
_checks = {}               # session id -> [timestamps]
_cache = {}                # pincode -> (expires, answer)
_cache_lock = threading.Lock()


def delivery_days(pincode):
    """A plain estimate from Vadodara by destination region, counted from dispatch. Shown as "usually", never promised."""
    p = str(pincode)
    if p[:2] in ('36', '37', '38', '39'): return (2, 3)                       # Gujarat, Daman and Diu
    if p[:3] in ('744', '737') or p[:4] == '6825' or p[:2] in ('18', '19', '78', '79'):
        return (5, 8)                                                         # islands, J&K, Ladakh, the North East, Sikkim
    if p[:2] in ('30', '31', '32', '33', '34', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49'):
        return (3, 5)                                                         # Rajasthan, Maharashtra, MP, Chhattisgarh, Goa
    return (4, 6)


def delivery_check(visitor, pincode, opener=None):
    pin = str(pincode or '').strip()
    if not re.fullmatch(r'[1-9][0-9]{5}', pin): raise Error('Enter a 6-digit pincode that doesn’t start with 0.', field='pincode')
    now = time.time()
    with _cache_lock:
        hit = _cache.get(pin)
        if hit and hit[0] > now: return hit[1]
        recent = [t for t in _checks.get(visitor, []) if now - t < 3600]
        if len(recent) >= CHECK_LIMIT: raise Error('You’ve checked a lot of pincodes. Please try again in a while.', 429)
        _checks[visitor] = recent + [now]
    if not configured():
        return {'pincode': pin, 'status': 'unknown'}
    try:
        couriers = rates(pin, BASE_GRAMS + GRAMS_PER_UNIT, SMALL_BOX, 1000, opener=opener)
        status = 'yes' if couriers else 'no'
    except Error as e:
        if 'destination_pin' in str(e) or 'pincode' in str(e).lower(): status = 'no'
        else: return {'pincode': pin, 'status': 'unknown'}  # Shipneer slow or down: don't cache, don't guess
    answer = {'pincode': pin, 'status': status}
    if status == 'yes': answer['days'] = list(delivery_days(pin))
    with _cache_lock:
        _cache[pin] = (now + CHECK_TTL, answer)
    return answer
