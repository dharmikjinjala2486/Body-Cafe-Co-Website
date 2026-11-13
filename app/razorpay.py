"""Razorpay Standard Checkout for the local preview (13 Nov 2026). Test or live is decided by the keys alone.

The keys are read from the environment (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) or the git-ignored .env file at the
repository root. The key id is public (the browser needs it to open Checkout); the secret never leaves this process.

Flow, following Razorpay's integration steps:
  1. POST /api/orders/<id>/pay          -> a Razorpay order for our order's total (reused while it is still open)
  2. the browser opens Checkout with it  (web/part2-e.js)
  3. POST /api/orders/<id>/pay/verify   -> signature check, then the Razorpay order itself is read back and must carry
                                           our order number as its receipt, our total, and be paid. Only then: captured.
Nothing about a Razorpay order is stored before payment: it is found again by its receipt (our order number), so a
customer who paid but lost the page is recognised the next time the payment step is opened.
"""
import base64
import hashlib
import hmac
import json
import os
import re
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

API = 'https://api.razorpay.com/v1/'
urlopen = urllib.request.urlopen  # replaced by a fake in the tests
RZP_ID = re.compile(r'(order|pay)_[A-Za-z0-9]{6,40}')


def config():
    env = shipping._env_file()
    get = lambda k: (os.getenv(k) or env.get(k) or '').strip()
    return {'key': get('RAZORPAY_KEY_ID'), 'secret': get('RAZORPAY_KEY_SECRET')}


def configured():
    k = config()
    return bool(k['key'] and k['secret'])


def call(method, path, body=None, query=None):
    k = config()
    if not (k['key'] and k['secret']):
        raise Error('Online payment is not connected. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the server settings.', 503)
    url = API + path + ('?' + urllib.parse.urlencode(query) if query else '')
    auth = base64.b64encode((k['key'] + ':' + k['secret']).encode()).decode()
    req = urllib.request.Request(url, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json', 'Accept': 'application/json'})
    try:
        with urlopen(req, timeout=20) as res:
            return json.loads(res.read().decode() or '{}')
    except urllib.error.HTTPError as e:
        try: detail = json.loads(e.read().decode()).get('error', {}).get('description', '')
        except Exception: detail = ''
        if e.code == 401:
            raise Error('The payment keys were not accepted. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.', 503)
        raise Error('The payment service didn’t accept the request. Nothing was charged.' + (' (' + detail + ')' if detail else ''), 502)
    except (urllib.error.URLError, TimeoutError, ValueError):
        raise Error('The payment service didn’t respond. Nothing was charged. Try again shortly.', 503, reason='unavailable')


def order_for(receipt, paise):
    """The Razorpay order for one of our orders: a paid one if there is one, else an open one for this amount, else new."""
    found = call('GET', 'orders', query={'receipt': receipt, 'count': 20}).get('items') or []
    mine = [o for o in found if o.get('receipt') == receipt and o.get('amount') == paise and o.get('currency') == 'INR']
    for o in mine:
        if o.get('status') == 'paid': return o
    for o in mine:
        if o.get('status') in ('created', 'attempted'): return o
    return call('POST', 'orders', {'amount': paise, 'currency': 'INR', 'receipt': receipt, 'notes': {'order': receipt}})


def signature_ok(rzp_order, rzp_payment, signature):
    want = hmac.new(config()['secret'].encode(), (rzp_order + '|' + rzp_payment).encode(), hashlib.sha256).hexdigest()
    return isinstance(signature, str) and hmac.compare_digest(want, signature)


def paid_payment(rzp_order):
    """The id of the payment that paid a Razorpay order, or ''."""
    items = call('GET', 'orders/' + rzp_order + '/payments').get('items') or []
    return next((p.get('id', '') for p in items if p.get('status') == 'captured'), '')


class RazorpayMixin:
    def _rzp_settle(self, s, oid, ro, payment_id):
        """Record a payment Razorpay confirms as paid. Called with no database connection held."""
        with self.db() as c:
            self.expire(c)
            r, p = self.owned_order(c, s, oid)
            if r['state'] == 'paid' or self.payment_status(c, oid) == 'captured':
                return {'id': oid, 'state': 'paid', 'payment': 'captured', 'idempotent': True}
            p['razorpay'] = {'order': ro['id'], 'payment': payment_id, 'at': int(time.time())}
            if r['state'] != 'pending':
                # Paid after the 15-minute hold ended: the money is with us but the stock went back. A person decides.
                p['payment_after_hold'] = True
                c.execute('UPDATE orders SET data=? WHERE id=?', (json.dumps(p), oid))
                self.log(c, s['user_id'], 'razorpay_paid_after_hold', oid)
                late = True
            else:
                self.capture(c, s, oid, p)
                self.log(c, s['user_id'], 'razorpay_payment_captured', oid)
                late = False
        if late:
            raise Error('Your payment went through, but the hold on your items had already ended. Contact us with order ' + oid + ' and we’ll ship it or refund you in full.', 409, reason='paid_after_hold')
        return {'id': oid, 'state': 'paid', 'payment': 'captured', 'message': 'Payment received. Thank you.'}

    def razorpay_start(self, s, oid):
        with self.db() as c:
            self.expire(c)
            r, p = self.owned_order(c, s, oid)
            if r['user_id'] != s['user_id']:
                raise Error('Use the purchasing customer session.', 403)
            if r['state'] == 'paid' or self.payment_status(c, oid) == 'captured':
                return {'id': oid, 'state': 'paid', 'payment': 'captured', 'idempotent': True}
            state, total, contact, expires = r['state'], int(p['total']), p.get('contact') or {}, int(p.get('expires') or 0)
        ro = order_for(oid, total * 100)
        if ro.get('status') == 'paid':
            return self._rzp_settle(s, oid, ro, paid_payment(ro['id']))
        if state != 'pending':
            raise Error('This payment reservation is no longer active. Start a new checkout.', 409, reason='inactive')
        mobile = re.sub(r'\D', '', str(contact.get('mobile', '')))[-10:]
        mobile = '+91' + mobile if len(mobile) == 10 else ''
        left = expires - int(time.time())
        if left < 60:
            raise Error('The hold on your items is about to end. Start a new checkout so they stay reserved while you pay.', 409, reason='inactive')
        return {'id': oid, 'state': 'pending', 'payment': 'pending', 'gateway': 'razorpay', 'key': config()['key'], 'rzp_order': ro['id'],
                'amount': total * 100, 'currency': 'INR', 'timeout': left - 30, 'test': config()['key'].startswith('rzp_test_'),
                'prefill': {'name': contact.get('name', ''), 'contact': mobile, 'email': contact.get('email', '')}}

    def razorpay_verify(self, s, oid, data):
        ro_id, pay_id, sig = (str(data.get(k) or '') for k in ('razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'))
        if not (RZP_ID.fullmatch(ro_id) and RZP_ID.fullmatch(pay_id)) or not signature_ok(ro_id, pay_id, sig):
            raise Error('We couldn’t confirm that payment. If money left your account, contact us with order ' + oid + '.', 400, reason='signature')
        with self.db() as c:
            r, p = self.owned_order(c, s, oid)
            if r['user_id'] != s['user_id']:
                raise Error('Use the purchasing customer session.', 403)
            total = int(p['total'])
        ro = call('GET', 'orders/' + ro_id)
        if ro.get('receipt') != oid or ro.get('amount') != total * 100 or ro.get('currency') != 'INR':
            raise Error('That payment doesn’t belong to this order. Contact us with order ' + oid + '.', 400, reason='mismatch')
        if ro.get('status') != 'paid':
            # The order turns "paid" at capture, which can trail the callback by a moment. A signed payment that Razorpay
            # reports as authorised or captured against this order is a successful payment (integration step 5).
            pay = call('GET', 'payments/' + pay_id)
            if pay.get('order_id') != ro_id or pay.get('amount') != total * 100 or pay.get('status') not in ('authorized', 'captured'):
                raise Error('That payment didn’t complete. Nothing was confirmed; you can try again.', 409, reason='not_paid')
        return self._rzp_settle(s, oid, ro, pay_id)
