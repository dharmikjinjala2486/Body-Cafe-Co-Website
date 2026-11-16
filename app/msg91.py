"""MSG91 for the local preview (16 Nov 2026): sign-in codes by SMS or email, and order messages by SMS, WhatsApp and email.

Settings come from the environment or the git-ignored .env file (see MSG91-TEMPLATES.md for every name and template).
MSG91_AUTHKEY is the account key; it never leaves this process. Each message is sent only when its template setting is
filled in, so an unapproved template is simply skipped. The live site has the same rules in
supabase/functions/operations/msg91.js; keep the two in step.

Sign-in codes: the site makes and checks its own code (app/account.py). MSG91 only delivers it: SendOTP with our code
for a mobile (its template must contain ##OTP##), an email template for an address.

Order messages: an order that becomes paid, shipped, delivered or (after payment) cancelled gets one message per event
(the `notices` table is the outbox, filled in the same transaction as the change). Here they also need
BCC_ORDER_MESSAGES=msg91; a simulated preview payment never queues one, only a payment Razorpay confirms. They are sent after the request,
never while the database is held, and a failure is recorded on the outbox row rather than shown to the customer.
WhatsApp goes only to orders whose contact asked for it (contact.whatsapp_updates).
"""
import json
import os
import re
import threading
import time
import urllib.error
import urllib.parse
import urllib.request

try:
    from app.errors import Error
    from app import shipping
except ImportError:  # run as a script: python3 app/server.py
    from errors import Error
    import shipping

API = 'https://control.msg91.com/api/v5/'
urlopen = urllib.request.urlopen  # replaced by a fake in the tests
EVENTS = ('order_paid', 'order_shipped', 'order_delivered', 'order_cancelled')
# Variables each order message fills, in order. SMS uses them by name (##order##), WhatsApp by position ({{1}}).
SMS_VARS = {'order_paid': ('amount', 'order', 'link'), 'order_shipped': ('order', 'courier', 'awb', 'link'),
            'order_delivered': ('order', 'link'), 'order_cancelled': ('order', 'link')}
WA_VARS = {'order_paid': ('name', 'order', 'amount', 'link'), 'order_shipped': ('name', 'order', 'courier', 'awb', 'link'),
           'order_delivered': ('name', 'order', 'link'), 'order_cancelled': ('name', 'order', 'link')}
EMAIL_VARS = {'order_paid': ('name', 'order', 'amount', 'items', 'link'), 'order_shipped': ('name', 'order', 'courier', 'awb', 'link'),
              'order_delivered': ('name', 'order', 'link'), 'order_cancelled': ('name', 'order', 'link')}
EMAIL_SHAPE = re.compile(r'[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}')


class Msg91Error(Exception):
    pass


def config():
    env = shipping._env_file()
    get = lambda k: (os.getenv(k) or env.get(k) or '').strip()
    up = lambda e: e.upper()
    return {
        'key': get('MSG91_AUTHKEY'),
        'otp_template': get('MSG91_OTP_TEMPLATE'),
        'sms': {e: get('MSG91_SMS_' + up(e)) for e in EVENTS},
        'wa_number': re.sub(r'\D', '', get('MSG91_WA_NUMBER')),
        'wa_lang': get('MSG91_WA_LANG') or 'en',
        'wa': {e: get('MSG91_WA_' + up(e)) for e in EVENTS},
        'email_domain': get('MSG91_EMAIL_DOMAIN'),
        'email_from': get('MSG91_EMAIL_FROM'),
        'email_from_name': get('MSG91_EMAIL_FROM_NAME') or 'Body Cafe Co.',
        'email_code': get('MSG91_EMAIL_CODE'),
        'email': {e: get('MSG91_EMAIL_' + up(e)) for e in EVENTS},
        'origin': (get('BCC_PUBLIC_ORIGIN') or 'https://body-cafe-co-website.vercel.app').rstrip('/'),
    }


def configured():
    return bool(config()['key'])


def orders_on():
    """Order messages in the local preview need BCC_ORDER_MESSAGES=msg91 as well as the key, so testing orders here
    texts nobody by accident. (The live site sends them whenever the key and a template are set.)"""
    return configured() and (os.getenv('BCC_ORDER_MESSAGES') or '').strip() == 'msg91'  # app/server.py copies it from .env


def call(method, path, body=None, query=None):
    """One MSG91 request. MSG91 often answers a refusal with HTTP 200 and type/status 'error', so both are checked."""
    k = config()['key']
    if not k:
        raise Msg91Error('MSG91 is not connected. Add MSG91_AUTHKEY to the server settings.')
    url = API + path + ('?' + urllib.parse.urlencode(query) if query else '')
    req = urllib.request.Request(url, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={'authkey': k, 'Content-Type': 'application/json', 'Accept': 'application/json'})
    try:
        with urlopen(req, timeout=15) as res:
            text = res.read().decode() or '{}'
    except urllib.error.HTTPError as e:
        try: text = e.read().decode()
        except Exception: text = ''
        raise Msg91Error('MSG91 refused the request (HTTP %d). %s' % (e.code, _reason(text)))
    except (urllib.error.URLError, TimeoutError, ValueError):
        raise Msg91Error('MSG91 did not respond.')
    try: out = json.loads(text)
    except ValueError: raise Msg91Error('MSG91 sent an unreadable answer.')
    if isinstance(out, dict) and (out.get('type') == 'error' or out.get('status') in ('error', 'fail') or out.get('hasError') is True):
        raise Msg91Error('MSG91 refused the request. ' + _reason(text))
    return out


def _reason(text):
    try: d = json.loads(text)
    except ValueError: return ''
    m = d.get('message') or d.get('msg') or d.get('errors') or '' if isinstance(d, dict) else ''
    return (m if isinstance(m, str) else json.dumps(m))[:200]


# ---------- sign-in codes ----------

def send_code(key, code, minutes):
    """Deliver a sign-in code. key is a 10-digit mobile, 'email:<address>' or 'confirm:<user>:<address>'."""
    c = config()
    if re.fullmatch(r'[0-9]{10}', key):
        if not c['otp_template']:
            raise Msg91Error('MSG91_OTP_TEMPLATE is not set.')
        return call('POST', 'otp', {}, {'template_id': c['otp_template'], 'mobile': '91' + key, 'otp': code,
                                        'otp_length': len(code), 'otp_expiry': minutes})
    email = key.split(':')[-1]
    if not c['email_code']:
        raise Msg91Error('MSG91_EMAIL_CODE is not set.')
    return send_email(email, '', c['email_code'], {'code': code, 'minutes': str(minutes)})


# ---------- order messages ----------

def inr(n):
    """1299 -> '1,299'; 123456 -> '1,23,456' (Indian grouping)."""
    s = str(int(round(float(n or 0))))
    if len(s) <= 3: return s
    head, tail = s[:-3], s[-3:]
    head = re.sub(r'(\d)(?=(\d\d)+$)', r'\1,', head)
    return head + ',' + tail


def _clean(v, limit=120):
    # WhatsApp rejects variables with new lines, tabs or more than four spaces in a row; nothing here needs them.
    return re.sub(r'\s+', ' ', str(v or '')).strip()[:limit]


def order_values(oid, p, origin):
    contact = p.get('contact') or {}
    sn = p.get('shipneer') or {}
    first = _clean(contact.get('name', '')).split(' ')[0][:30] or 'there'
    items = ', '.join('%s × %d' % (_clean(x.get('name'), 60), int(x.get('quantity') or 0)) for x in p.get('items') or [])
    return {'name': first, 'order': oid, 'amount': inr(p.get('total')), 'items': _clean(items, 600),
            'courier': _clean(sn.get('courier') or p.get('provider')) or 'our courier',
            'awb': _clean(sn.get('awb') or p.get('tracking')) or 'to follow', 'link': origin + '/account/orders'}


def send_email(to, name, template, variables):
    c = config()
    if not (c['email_domain'] and c['email_from']):
        raise Msg91Error('MSG91_EMAIL_DOMAIN and MSG91_EMAIL_FROM are not set.')
    return call('POST', 'email/send', {
        'recipients': [{'to': [{'email': to, **({'name': name} if name else {})}], 'variables': variables}],
        'from': {'email': c['email_from'], 'name': c['email_from_name']},
        'domain': c['email_domain'], 'template_id': template})


def order_messages(event, oid, p):
    """The messages this event would send for this order, as (channel, send-function) pairs, plus skipped channels."""
    c = config()
    v = order_values(oid, p, c['origin'])
    contact = p.get('contact') or {}
    mobile = re.sub(r'\D', '', str(contact.get('mobile', '')))[-10:]
    email = str(contact.get('email') or '').strip()
    out, skipped = [], {}
    if not c['sms'][event]: skipped['sms'] = 'no template'
    elif not re.fullmatch(r'[6-9][0-9]{9}', mobile): skipped['sms'] = 'no mobile'
    else:
        body = {'template_id': c['sms'][event], 'short_url': '0',
                'recipients': [{'mobiles': '91' + mobile, **{k: v[k] for k in SMS_VARS[event]}}]}
        out.append(('sms', lambda: call('POST', 'flow', body)))
    if not (c['wa'][event] and c['wa_number']): skipped['whatsapp'] = 'no template'
    elif contact.get('whatsapp_updates') is not True: skipped['whatsapp'] = 'not asked for'
    elif not re.fullmatch(r'[6-9][0-9]{9}', mobile): skipped['whatsapp'] = 'no mobile'
    else:
        components = {'body_%d' % (i + 1): {'type': 'text', 'value': v[k]} for i, k in enumerate(WA_VARS[event])}
        body = {'integrated_number': c['wa_number'], 'content_type': 'template', 'payload': {
            'messaging_product': 'whatsapp', 'type': 'template', 'template': {
                'name': c['wa'][event], 'language': {'code': c['wa_lang'], 'policy': 'deterministic'},
                'to_and_components': [{'to': ['91' + mobile], 'components': components}]}}}
        out.append(('whatsapp', lambda: call('POST', 'whatsapp/whatsapp-outbound-message/bulk/', body)))
    if not c['email'][event]: skipped['email'] = 'no template'
    elif not EMAIL_SHAPE.fullmatch(email): skipped['email'] = 'no email'
    else:
        tpl, variables = c['email'][event], {k: v[k] for k in EMAIL_VARS[event]}
        out.append(('email', lambda: send_email(email, v['name'], tpl, variables)))
    return out, skipped


def deliver(event, oid, p):
    """Send every message for one event. Returns {channel: 'sent' | 'skipped: …' | 'failed: …'}; never raises."""
    result = {}
    try:
        messages, skipped = order_messages(event, oid, p)
    except Exception as e:  # a malformed order must not stop the outbox
        return {'all': 'failed: ' + type(e).__name__}
    result.update({k: 'skipped: ' + v for k, v in skipped.items()})
    for channel, send in messages:
        try:
            send(); result[channel] = 'sent'
        except Msg91Error as e:
            result[channel] = 'failed: ' + str(e)[:240]
    return result


class Msg91Mixin:
    """The order-message outbox. notice() is called inside the transaction that changes the order."""
    _notice_lock = threading.Lock()

    def msg91_init(self, c):
        c.execute('CREATE TABLE IF NOT EXISTS notices(order_id TEXT, event TEXT, created INTEGER, sent INTEGER, result TEXT, PRIMARY KEY(order_id, event))')

    def notice(self, c, oid, event):
        """Queue one order message. Each order gets each event once, however often the change is repeated."""
        if event in EVENTS and orders_on():
            c.execute('INSERT OR IGNORE INTO notices(order_id,event,created) VALUES(?,?,?)', (oid, event, int(time.time())))

    def notices_flush(self):
        """Send queued order messages. Safe to call from several threads: one sends, the others return."""
        if not self._notice_lock.acquire(blocking=False): return 0
        try:
            with self.db() as c:
                due = c.execute('SELECT n.order_id,n.event,o.data FROM notices n JOIN orders o ON o.id=n.order_id WHERE n.sent IS NULL ORDER BY n.created LIMIT 20').fetchall()
            for row in due:
                result = deliver(row['event'], row['order_id'], json.loads(row['data']))
                with self.db() as c:
                    c.execute('UPDATE notices SET sent=?,result=? WHERE order_id=? AND event=?', (int(time.time()), json.dumps(result), row['order_id'], row['event']))
            return len(due)
        finally:
            self._notice_lock.release()

    def notices_flush_later(self):
        if orders_on():
            threading.Thread(target=self.notices_flush, daemon=True, name='msg91-notices').start()
