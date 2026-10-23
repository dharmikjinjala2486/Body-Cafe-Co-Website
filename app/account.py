"""Account, bag and checkout continuity for the local preview (mixed into Store).

* Bag: a server price/stock check (`bag_quote`) used by the bag page and by checkout, so both show the same numbers.
  Signed-in customers also keep an account bag; guests keep theirs in the browser. Combining the two is done by the
  page, which explains the result (the larger quantity per product wins; nothing is silently doubled).
* Sign-in: mobile one-time codes behind a sender boundary. The only sender implemented is the honest local preview
  sender, which shows the code on the page and sends nothing. Setting BCC_OTP_PROVIDER to anything else makes code
  requests fail with "unavailable" until a real provider adapter is written; nothing pretends to send an SMS.
  Expiry (5 min), resend wait (20 s), attempt limit (5 per code) and an hourly cap (5 codes per number, 10 per
  session) are enforced here.
* Account: addresses (add, edit, remove, default) with ownership checks, profile name and optional unverified email,
  communication preferences, sign out on this device or everywhere.
* Orders: an idempotency key per checkout so a resubmitted form returns the existing order; payment outcomes success,
  failure, cancelled and uncertain. An uncertain payment must be checked (reconciled) before any retry. Each order
  in the account view carries its payment status, its allocated lots and the next useful step.
"""
import hashlib
import hmac
import json
import os
import re
import secrets
import time

try:
    from app.errors import Error
except ImportError:
    from errors import Error

OTP_TTL = 300
OTP_RESEND = 20
OTP_ATTEMPTS = 5
OTP_HOURLY_PER_MOBILE = 5
OTP_HOURLY_PER_SESSION = 10
MAX_QTY = 10
DISCOUNTS = {'PREVIEW10': {'label': 'PREVIEW10 · sample 10% off', 'condition': 'Sample code for testing the preview. 10% off the subtotal, rounded to the nearest rupee.'}}
SHIPPING_RULE = {'fee': 75, 'free_from': 1499, 'note': 'Sample delivery rule: ₹75, free when the subtotal after discount is ₹1,499 or more. Not an approved shipping policy.'}
TAX_NOTE = 'Sample prices include illustrative tax. Actual GST awaits approved rates.'
KEY = re.compile(r'[A-Za-z0-9-]{8,64}')

SCHEMA = '''
CREATE TABLE IF NOT EXISTS bags(user_id TEXT PRIMARY KEY, data TEXT, updated INTEGER);
CREATE TABLE IF NOT EXISTS profiles(user_id TEXT PRIMARY KEY, data TEXT);
CREATE TABLE IF NOT EXISTS otp_requests(id INTEGER PRIMARY KEY, mobile TEXT, session TEXT, created INTEGER);
CREATE TABLE IF NOT EXISTS order_keys(key TEXT PRIMARY KEY, user_id TEXT, order_id TEXT, created INTEGER);
'''


class PreviewOtpSender:
    """Local preview: the code is returned to the page. No message is sent."""
    mode = 'preview'

    def send(self, mobile, code):
        return {'mode': 'preview'}


class UnconfiguredOtpSender:
    """A provider was named but no adapter exists yet. Requests fail honestly instead of pretending to send."""
    def __init__(self, name):
        self.mode = name

    def send(self, mobile, code):
        raise Error('Sign-in codes can’t be sent right now. Try again later.', 503, reason='unavailable')


def otp_sender():
    name = os.getenv('BCC_OTP_PROVIDER', 'preview')
    return PreviewOtpSender() if name == 'preview' else UnconfiguredOtpSender(name)


def is_customer(s):
    return s['role'] == 'customer' and str(s['user_id']).startswith('customer-')


def clean_items(raw, allow_zero=False):
    if not isinstance(raw, list) or len(raw) > 30:
        raise Error('Your bag is invalid.')
    out, seen = [], set()
    for it in raw:
        if not isinstance(it, dict):
            raise Error('Your bag contains an invalid item.')
        pid, q = it.get('id'), it.get('quantity')
        if not isinstance(pid, str) or not 1 <= len(pid) <= 100 or pid in seen:
            raise Error('Your bag contains an invalid item.')
        if type(q) != int or not (0 if allow_zero else 1) <= q <= 99:
            raise Error('Choose a quantity between 1 and 10.')
        price = it.get('price')
        seen.add(pid)
        out.append({'id': pid, 'quantity': q, 'price': price if type(price) == int and price >= 0 else None})
    return out


class AccountMixin:

    def account_init(self, c):
        c.executescript(SCHEMA)

    # ---------------- profile helpers ----------------
    def profile(self, c, uid):
        r = c.execute('SELECT data FROM profiles WHERE user_id=?', (uid,)).fetchone()
        p = json.loads(r['data']) if r else {}
        p.setdefault('email', '')
        p.setdefault('prefs', {'email': False, 'whatsapp': False})
        p.setdefault('default_address', None)
        return p

    def save_profile(self, c, uid, p):
        c.execute('INSERT OR REPLACE INTO profiles VALUES(?,?)', (uid, json.dumps(p)))

    # ---------------- bag ----------------
    def bag_quote(self, s, data):
        items = clean_items(data.get('items', []), allow_zero=False) if data.get('items') else []
        code = str(data.get('discount', '') or '').strip().upper()
        now = int(time.time())
        lines, changes = [], []
        with self.db() as c:
            self.expire(c)
            for it in items:
                r = c.execute('SELECT data FROM products WHERE id=?', (it['id'],)).fetchone()
                if not r:
                    lines.append({'id': it['id'], 'name': None, 'quantity': it['quantity'], 'status': 'unknown', 'available': 0, 'max': 0, 'unit_price': None, 'line_total': 0})
                    changes.append({'id': it['id'], 'kind': 'unknown'})
                    continue
                p = json.loads(r['data'])
                stock = c.execute("SELECT COALESCE(SUM(available),0) FROM batches WHERE product=? AND state='released' AND proof=1 AND expiry>?", (p['id'], now)).fetchone()[0]
                mx = min(MAX_QTY, stock) if p.get('published') else 0
                q = it['quantity']
                status = 'ok'
                if mx == 0:
                    status = 'unavailable'
                elif q > mx:
                    status = 'reduced'
                payable = 0 if status == 'unavailable' else min(q, mx)
                line = {'id': p['id'], 'name': p['name'], 'quantity': q, 'payable_quantity': payable, 'status': status, 'available': stock, 'max': mx,
                        'limit': MAX_QTY, 'unit_price': p['price'], 'line_total': p['price'] * payable, 'color': p.get('color'),
                        'price_changed': it['price'] is not None and it['price'] != p['price'], 'seen_price': it['price']}
                if status != 'ok':
                    changes.append({'id': p['id'], 'kind': status, 'from': q, 'to': payable})
                if line['price_changed']:
                    changes.append({'id': p['id'], 'kind': 'price', 'from': it['price'], 'to': p['price']})
                lines.append(line)
        subtotal = sum(x['line_total'] for x in lines)
        discount, discount_error, applied = 0, None, None
        if code:
            if code in DISCOUNTS:
                discount = (subtotal + 5) // 10
                applied = {'code': code, **DISCOUNTS[code], 'amount': discount}
            else:
                discount_error = 'That code isn’t valid. Check it, or remove it to continue.'
        shipping = 0 if subtotal == 0 or subtotal - discount >= SHIPPING_RULE['free_from'] else SHIPPING_RULE['fee']
        ready = bool(lines) and all(x['status'] == 'ok' for x in lines) and not discount_error and not any(x['price_changed'] for x in lines)
        return {'lines': lines, 'changes': changes, 'subtotal': subtotal, 'discount': discount, 'discount_applied': applied, 'discount_error': discount_error,
                'shipping': shipping, 'shipping_rule': SHIPPING_RULE, 'tax_note': TAX_NOTE, 'total': subtotal - discount + shipping,
                'count': sum(x['payable_quantity'] if 'payable_quantity' in x else 0 for x in lines), 'ready': ready, 'sample': True, 'checked': now}

    def bag_get(self, s):
        if not is_customer(s):
            return {'items': [], 'account': False}
        with self.db() as c:
            r = c.execute('SELECT * FROM bags WHERE user_id=?', (s['user_id'],)).fetchone()
        return {'items': json.loads(r['data']) if r else [], 'updated': r['updated'] if r else None, 'account': True}

    def bag_save(self, s, data):
        if not is_customer(s):
            return {'ok': True, 'account': False}
        items = clean_items(data.get('items', []))
        for it in items:
            if it['quantity'] > MAX_QTY:
                raise Error('Maximum quantity is 10 per product.')
        with self.db() as c:
            c.execute('INSERT OR REPLACE INTO bags VALUES(?,?,?)', (s['user_id'], json.dumps(items), int(time.time())))
        return {'ok': True, 'account': True}

    # ---------------- sign-in ----------------
    def otp(self, s, data):
        mobile = str(data.get('mobile', '')).strip()
        if not re.fullmatch(r'[6-9][0-9]{9}', mobile):
            raise Error('Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9.', reason='mobile')
        now = int(time.time())
        sender = otp_sender()
        with self.db() as c:
            previous = c.execute('SELECT * FROM otps WHERE mobile=?', (mobile,)).fetchone()
            if previous and now - previous['sent'] < OTP_RESEND:
                wait = OTP_RESEND - (now - previous['sent'])
                raise Error('Please wait %d seconds before requesting another code.' % wait, 429, reason='resend_wait', retry_after=wait)
            c.execute('DELETE FROM otp_requests WHERE created<?', (now - 3600,))
            by_mobile = c.execute('SELECT COUNT(*), MIN(created) FROM otp_requests WHERE mobile=?', (mobile,)).fetchone()
            by_session = c.execute('SELECT COUNT(*) FROM otp_requests WHERE session=?', (s['id'],)).fetchone()[0]
            if by_mobile[0] >= OTP_HOURLY_PER_MOBILE or by_session >= OTP_HOURLY_PER_SESSION:
                wait = max(60, (by_mobile[1] or now) + 3600 - now) if by_mobile[0] >= OTP_HOURLY_PER_MOBILE else 3600
                raise Error('Too many codes requested. Try again in about %d minutes.' % max(1, wait // 60), 429, reason='rate_limited', retry_after=wait)
            code = f'{secrets.randbelow(1000000):06d}'
            delivery = sender.send(mobile, code)
            c.execute('INSERT OR REPLACE INTO otps VALUES(?,?,?,?,?)', (mobile, hashlib.sha256(code.encode()).hexdigest(), now + OTP_TTL, 0, now))
            c.execute('INSERT INTO otp_requests(mobile,session,created) VALUES(?,?,?)', (mobile, s['id'], now))
        out = {'expires_in': OTP_TTL, 'resend_in': OTP_RESEND, 'destination': '+91 ' + mobile[:2] + '••••••' + mobile[-2:], 'mode': delivery['mode'],
               'attempts': OTP_ATTEMPTS}
        if delivery['mode'] == 'preview':
            out.update({'preview_code': code, 'message': 'Local preview code. No SMS was sent.'})
        return out

    def verify(self, s, data):
        mobile = str(data.get('mobile', '')).strip()
        code = re.sub(r'\D', '', str(data.get('code', '')))
        if not re.fullmatch(r'[0-9]{6}', code):
            raise Error('Enter the 6-digit code.', reason='format')
        invalid = None
        created = False
        with self.db() as c:
            r = c.execute('SELECT * FROM otps WHERE mobile=?', (mobile,)).fetchone()
            if not r:
                raise Error('That code has expired or was replaced. Request a new code.', reason='expired')
            if r['attempts'] >= OTP_ATTEMPTS:
                raise Error('Too many incorrect attempts. Request a new code.', 429, reason='locked')
            if r['expires'] < time.time():
                raise Error('That code has expired. Request a new code.', reason='expired')
            if not hmac.compare_digest(r['digest'], hashlib.sha256(code.encode()).hexdigest()):
                c.execute('UPDATE otps SET attempts=attempts+1 WHERE mobile=?', (mobile,))
                invalid = OTP_ATTEMPTS - r['attempts'] - 1
            else:
                uid = 'customer-' + hashlib.sha256(mobile.encode()).hexdigest()[:20]
                created = not c.execute('SELECT 1 FROM users WHERE id=?', (uid,)).fetchone()
                c.execute('INSERT OR IGNORE INTO users VALUES(?,?,?,?)', (uid, 'Customer', mobile, 'customer'))
                claimed = 0
                # Only this guest session's orders whose checkout mobile matches the verified mobile move to the account.
                if s['user_id'].startswith('guest-'):
                    for order in c.execute('SELECT * FROM orders WHERE user_id=?', (s['user_id'],)).fetchall():
                        if json.loads(order['data']).get('contact', {}).get('mobile') == mobile:
                            c.execute('UPDATE orders SET user_id=? WHERE id=?', (uid, order['id']))
                            c.execute('UPDATE order_keys SET user_id=? WHERE order_id=?', (uid, order['id']))
                            claimed += 1
                    # Support cases opened in this same browser session follow the customer into the account.
                    c.execute('UPDATE cases SET user_id=? WHERE user_id=?', (uid, s['user_id']))
                c.execute('UPDATE sessions SET user_id=? WHERE id=?', (uid, s['id']))
                c.execute('DELETE FROM otps WHERE mobile=?', (mobile,))
                self.log(c, uid, 'customer_signed_in', uid)
        if invalid is not None:
            if invalid <= 0:
                raise Error('That code doesn’t match, and no attempts are left. Request a new code.', 429, reason='locked', attempts_left=0)
            raise Error('That code doesn’t match. %d attempt%s left.' % (invalid, '' if invalid == 1 else 's'), reason='mismatch', attempts_left=invalid)
        return {'ok': True, 'created': created, 'claimed_orders': claimed}

    def logout(self, s, data):
        with self.db() as c:
            if data.get('everywhere') and is_customer(s):
                n = c.execute('DELETE FROM sessions WHERE user_id=?', (s['user_id'],)).rowcount
                self.log(c, s['user_id'], 'signed_out_everywhere', str(n))
            else:
                c.execute('DELETE FROM sessions WHERE id=?', (s['id'],))
        return {'ok': True}

    # ---------------- profile, preferences, addresses ----------------
    def profile_update(self, s, data):
        if not is_customer(s):
            raise Error('Sign in to update your profile.', 401)
        name = str(data.get('name', '')).strip()
        email = str(data.get('email', '')).strip()
        if not 1 <= len(name) <= 80:
            raise Error('Enter your name (up to 80 characters).', field='name')
        if email and not re.fullmatch(r'[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}', email):
            raise Error('Enter a valid email address, or leave it blank.', field='email')
        with self.db() as c:
            c.execute('UPDATE users SET name=? WHERE id=?', (name, s['user_id']))
            p = self.profile(c, s['user_id'])
            p['email'] = email
            p['email_verified'] = False
            self.save_profile(c, s['user_id'], p)
            self.log(c, s['user_id'], 'profile_updated', s['user_id'])
        return {'ok': True}

    def preferences(self, s, data):
        if not is_customer(s):
            raise Error('Sign in to save preferences to your account.', 401)
        prefs = {k: data.get(k) is True for k in ('email', 'whatsapp')}
        with self.db() as c:
            p = self.profile(c, s['user_id'])
            p['prefs'] = prefs
            p['prefs_updated'] = int(time.time())
            self.save_profile(c, s['user_id'], p)
            self.log(c, s['user_id'], 'preferences_updated', json.dumps(prefs))
        return {'ok': True, 'prefs': prefs}

    def address_save(self, s, data):
        if not is_customer(s):
            raise Error('Sign in to manage saved addresses.', 401)
        errors = {}
        if not re.fullmatch(r'[1-9][0-9]{5}', str(data.get('pincode', ''))):
            errors['pincode'] = 'Enter a 6-digit pincode that doesn’t start with 0.'
        for k, label in [('name', 'name'), ('address', 'address'), ('city', 'city'), ('state', 'state')]:
            if not 2 <= len(str(data.get(k, '')).strip()) <= 200:
                errors[k] = 'Enter the ' + label + '.'
        if errors:
            raise Error('Check the highlighted fields.', fields=errors)
        clean = {k: str(data[k]).strip()[:200] for k in ['name', 'address', 'city', 'state', 'pincode']}
        with self.db() as c:
            aid = data.get('id')
            if aid:
                r = c.execute('SELECT * FROM addresses WHERE id=?', (aid,)).fetchone()
                if not r or r['user_id'] != s['user_id']:
                    raise Error('Address not found.', 404)
                c.execute('UPDATE addresses SET data=? WHERE id=?', (json.dumps(clean), aid))
            else:
                if c.execute('SELECT COUNT(*) FROM addresses WHERE user_id=?', (s['user_id'],)).fetchone()[0] >= 20:
                    raise Error('You can save up to 20 addresses.', 409)
                aid = 'ADDR-' + secrets.token_hex(5)
                c.execute('INSERT INTO addresses VALUES(?,?,?)', (aid, s['user_id'], json.dumps(clean)))
            if data.get('default') is True or not c.execute('SELECT 1 FROM addresses WHERE user_id=? AND id!=?', (s['user_id'], aid)).fetchone():
                p = self.profile(c, s['user_id'])
                p['default_address'] = aid
                self.save_profile(c, s['user_id'], p)
        return {'id': aid}

    def address_action(self, s, aid, action):
        if not is_customer(s):
            raise Error('Sign in to manage saved addresses.', 401)
        with self.db() as c:
            r = c.execute('SELECT * FROM addresses WHERE id=?', (aid,)).fetchone()
            if not r or r['user_id'] != s['user_id']:
                raise Error('Address not found.', 404)
            p = self.profile(c, s['user_id'])
            if action == 'delete':
                c.execute('DELETE FROM addresses WHERE id=?', (aid,))
                if p['default_address'] == aid:
                    nxt = c.execute('SELECT id FROM addresses WHERE user_id=? ORDER BY rowid LIMIT 1', (s['user_id'],)).fetchone()
                    p['default_address'] = nxt['id'] if nxt else None
            elif action == 'default':
                p['default_address'] = aid
            else:
                raise Error('Unknown address action.', 404)
            self.save_profile(c, s['user_id'], p)
        return {'ok': True}

    # ---------------- orders and payment ----------------
    def order_existing(self, c, s, key):
        if not key:
            return None
        if not KEY.fullmatch(key):
            raise Error('Refresh the checkout and try again.')
        k = c.execute('SELECT * FROM order_keys WHERE key=?', (key,)).fetchone()
        if not k:
            return None
        r = c.execute('SELECT * FROM orders WHERE id=?', (k['order_id'],)).fetchone()
        if not r or r['user_id'] != s['user_id']:
            raise Error('This checkout was already submitted from another session. Open your orders to continue.', 409, reason='other_session')
        return {'id': r['id'], **json.loads(r['data']), 'state': r['state'], 'idempotent': True}

    def order_key_record(self, c, s, key, oid):
        if key:
            c.execute('INSERT INTO order_keys VALUES(?,?,?,?)', (key, s['user_id'], oid, int(time.time())))

    def payment_status(self, c, oid):
        p = c.execute('SELECT status FROM payments WHERE order_id=?', (oid,)).fetchone()
        return p['status'] if p else None

    def order_status(self, s, oid):
        with self.db() as c:
            self.expire(c)
            r, p = self.owned_order(c, s, oid)
            return {'id': oid, 'state': r['state'], 'payment': self.payment_status(c, oid), 'expires': p.get('expires')}

    def reconcile(self, s, oid, data):
        """Preview stand-in for the payment provider's later answer about an uncertain payment."""
        outcome = data.get('outcome')
        if outcome not in ('success', 'failure'):
            raise Error('Choose the provider’s answer.')
        with self.db() as c:
            self.expire(c)
            r, p = self.owned_order(c, s, oid)
            if r['user_id'] != s['user_id']:
                raise Error('Use the purchasing customer session.', 403)
            if self.payment_status(c, oid) != 'processing':
                return {'id': oid, 'state': r['state'], 'payment': self.payment_status(c, oid), 'idempotent': True}
            if outcome == 'failure':
                c.execute("UPDATE payments SET status='failed' WHERE order_id=?", (oid,))
                self.log(c, s['user_id'], 'preview_payment_reconciled_failed', oid)
                return {'id': oid, 'state': r['state'], 'payment': 'failed'}
            self.capture(c, s, oid, p)
            return {'id': oid, 'state': 'paid', 'payment': 'captured'}

    def capture(self, c, s, oid, p):
        invalid = c.execute("SELECT r.id FROM reservations r JOIN batches b ON r.batch=b.id WHERE r.order_id=? AND (b.state!='released' OR b.proof!=1 OR b.expiry<=?)", (oid, int(time.time()))).fetchone()
        if invalid:
            raise Error('A reserved lot is no longer released. Contact support or cancel this order.', 409)
        c.execute("UPDATE reservations SET state='consumed' WHERE order_id=? AND state='held'", (oid,))
        c.execute("UPDATE payments SET status='captured' WHERE order_id=?", (oid,))
        p['history'].append({'state': 'paid', 'at': int(time.time())})
        c.execute("UPDATE orders SET state='paid',data=? WHERE id=?", (json.dumps(p), oid))
        self.log(c, s['user_id'], 'preview_payment_captured', oid)

    def pay(self, s, oid, data):
        outcome = data.get('outcome')
        if outcome not in ('success', 'failure', 'cancelled', 'uncertain'):
            raise Error('Choose a preview payment outcome.')
        with self.db() as c:
            self.expire(c)
            r, p = self.owned_order(c, s, oid)
            if r['user_id'] != s['user_id']:
                raise Error('Use the purchasing customer session.', 403)
            status = self.payment_status(c, oid)
            if r['state'] == 'paid' or status == 'captured':
                return {'id': oid, 'state': 'paid', 'payment': 'captured', 'idempotent': True}
            if status == 'processing':
                raise Error('We’re still confirming your last payment attempt. Check its status before trying again.', 409, reason='processing')
            if r['state'] != 'pending':
                raise Error('This payment reservation is no longer active. Start a new checkout.', 409, reason='inactive')
            if outcome in ('failure', 'cancelled'):
                c.execute('UPDATE payments SET status=? WHERE order_id=?', ('failed' if outcome == 'failure' else 'cancelled', oid))
                self.log(c, s['user_id'], 'preview_payment_' + ('failed' if outcome == 'failure' else 'cancelled'), oid)
                return {'id': oid, 'state': 'pending', 'payment': 'failed' if outcome == 'failure' else 'cancelled',
                        'message': 'No money moved. You can try again while the reservation is active.'}
            if outcome == 'uncertain':
                c.execute("UPDATE payments SET status='processing' WHERE order_id=?", (oid,))
                self.log(c, s['user_id'], 'preview_payment_uncertain', oid)
                return {'id': oid, 'state': 'pending', 'payment': 'processing',
                        'message': 'We didn’t get a final answer from the payment provider. Don’t pay again: check the status first.'}
            self.capture(c, s, oid, p)
        return {'id': oid, 'state': 'paid', 'payment': 'captured', 'message': 'Preview payment only. No money moved.'}

    # ---------------- account view ----------------
    NEXT = {
        'pending': ('Complete payment', 'Your stock is reserved while the payment step is open.'),
        'paid': ('Preparing your order', 'Next: it ships. Shipping isn’t connected in the preview, so this step is simulated by operations.'),
        'shipped': ('On its way', 'Next: delivery. Tracking is simulated in the preview.'),
        'delivered': ('Delivered', 'You can review what you received.'),
        'cancelled': ('Cancelled', 'Nothing further is needed unless a refund is pending.'),
        'expired': ('Reservation expired', 'This order wasn’t paid in time. Start a new checkout if you still want these products.'),
    }

    def account_view(self, s):
        snap = self.snapshot(s)
        if s['role'] not in ('customer',):
            return snap
        with self.db() as c:
            for o in snap['orders']:
                o['payment'] = self.payment_status(c, o['id'])
                o['lots'] = [{'batch': r['batch'], 'product': r['product'], 'quantity': r['quantity'], 'state': r['state']} for r in c.execute(
                    "SELECT r.batch, r.quantity, r.state, b.product FROM reservations r JOIN batches b ON b.id=r.batch WHERE r.order_id=? AND r.state='consumed' ORDER BY r.batch", (o['id'],))]
                n = self.NEXT.get(o['state'])
                if o['state'] == 'pending' and o['payment'] == 'processing':
                    n = ('Payment being confirmed', 'Check the payment status before trying again.')
                o['next'] = {'title': n[0], 'text': n[1]} if n else None
                o['invoice'] = None
            p = self.profile(c, s['user_id'])
            snap['profile'] = {'name': s['name'], 'mobile': s['mobile'], 'email': p['email'], 'email_verified': False, 'prefs': p['prefs'], 'prefs_updated': p.get('prefs_updated'),
                               'default_address': p['default_address'], 'signed_in': is_customer(s)}
            snap['sessions'] = c.execute('SELECT COUNT(*) FROM sessions WHERE user_id=? AND expires>?', (s['user_id'], int(time.time()))).fetchone()[0] if is_customer(s) else 1
            snap['otp_mode'] = otp_sender().mode
        return snap
