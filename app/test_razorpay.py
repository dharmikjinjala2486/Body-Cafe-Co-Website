"""Razorpay in the local preview, against a fake Razorpay: no request leaves this machine."""
import hashlib
import hmac
import io
import json
import os
import tempfile
import unittest
import urllib.error
from pathlib import Path
from unittest import mock
from urllib.parse import urlparse, parse_qs

from app import razorpay
from app.server import Store, Error

KEY, SECRET, HOOK = 'rzp_test_STANDIN0000001', 'stand-in-secret-000000', 'stand-in-webhook-secret-0000'
CONTACT = {'name': 'Preview Customer', 'mobile': '9825012345', 'address': '123 Sample Street', 'city': 'Surat', 'state': 'Gujarat', 'pincode': '395001'}


class FakeRazorpay:
    def __init__(self):
        self.orders, self.payments, self.n, self.down, self.lag = [], [], 0, False, False

    def pay(self, order, status='captured'):
        o = next(x for x in self.orders if x['id'] == order)
        self.n += 1
        p = {'id': 'pay_STANDIN%06d' % self.n, 'order_id': order, 'amount': o['amount'], 'status': status}
        self.payments.append(p)
        o['status'] = 'paid' if status == 'captured' else 'attempted'
        return p['id']

    def __call__(self, req, timeout=20):
        if self.down: raise urllib.error.URLError('down')
        url = urlparse(req.full_url); path = url.path.replace('/v1/', ''); q = parse_qs(url.query)
        reply = lambda x: io.BytesIO(json.dumps(x).encode())
        if req.get_method() == 'POST' and path == 'orders':
            self.n += 1
            o = {'id': 'order_STANDIN%06d' % self.n, **json.loads(req.data), 'status': 'created'}
            self.orders.append(o); return reply(o)
        if path == 'orders': return reply({'items': [] if self.lag else [o for o in self.orders if o['receipt'] == q['receipt'][0]]})
        if path.endswith('/payments'): return reply({'items': [p for p in self.payments if p['order_id'] == path.split('/')[1]]})
        if path.startswith('orders/'): return reply(next(o for o in self.orders if o['id'] == path.split('/')[1]))
        if path.startswith('payments/'): return reply(next(p for p in self.payments if p['id'] == path.split('/')[1]))
        raise AssertionError(path)


def sign(order, payment, secret=SECRET):
    return hmac.new(secret.encode(), (order + '|' + payment).encode(), hashlib.sha256).hexdigest()


class RazorpayTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.store = Store(Path(self.temp.name) / 'rzp.db')
        self.guest = self.store.session('')[0]
        self.fake = FakeRazorpay()
        for p in (mock.patch.dict(os.environ, {'RAZORPAY_MODE': '', 'RAZORPAY_KEY_ID': KEY, 'RAZORPAY_KEY_SECRET': SECRET, 'RAZORPAY_WEBHOOK_SECRET': HOOK}), mock.patch.object(razorpay, 'urlopen', self.fake)):
            p.start(); self.addCleanup(p.stop)

    def tearDown(self):
        self.temp.cleanup()

    def order(self, quantity=1):
        return self.store.order(self.guest, {'items': [{'id': 'l-theanine', 'quantity': quantity}], 'adult': True, 'method': 'prepaid', 'contact': CONTACT})

    def verify(self, oid, ro, pay, secret=SECRET):
        return self.store.razorpay_verify(self.guest, oid, {'razorpay_order_id': ro, 'razorpay_payment_id': pay, 'razorpay_signature': sign(ro, pay, secret)})

    def state(self, oid):
        r = self.store.order_status(self.guest, oid)
        return r['state'], r['payment']

    def test_start_creates_and_reuses_the_razorpay_order(self):
        o = self.order()
        r = self.store.razorpay_start(self.guest, o['id'])
        self.assertEqual((r['gateway'], r['key'], r['amount'], r['currency'], r['test']), ('razorpay', KEY, o['total'] * 100, 'INR', True))
        self.assertEqual(r['prefill']['contact'], '+919825012345'); self.assertTrue(600 < r['timeout'] <= 872)
        self.assertEqual([(x['receipt'], x['amount']) for x in self.fake.orders], [(o['id'], o['total'] * 100)])
        self.fake.lag = True  # the real receipt search trails new orders by ~30 s: the recorded id is used instead
        self.assertEqual(self.store.razorpay_start(self.guest, o['id'])['rzp_order'], r['rzp_order']); self.assertEqual(len(self.fake.orders), 1)
        self.fake.lag = False
        self.assertNotIn(SECRET, json.dumps(r))
        with self.assertRaises(Error) as e: self.store.razorpay_start(self.store.session('')[0], o['id'])
        self.assertEqual(e.exception.status, 404)

    def test_verify_refuses_what_razorpay_does_not_confirm(self):
        a, b = self.order(), self.order(2)
        ra = self.store.razorpay_start(self.guest, a['id'])['rzp_order']; rb = self.store.razorpay_start(self.guest, b['id'])['rzp_order']
        for args in [(ra, 'pay_FORGED0000001', 'wrong-secret')]:
            with self.assertRaises(Error) as e: self.verify(a['id'], *args)
            self.assertEqual(e.exception.extra['reason'], 'signature')
        failed = self.fake.pay(ra, 'failed')
        with self.assertRaises(Error) as e: self.verify(a['id'], ra, failed)
        self.assertEqual(e.exception.extra['reason'], 'not_paid')
        other = self.fake.pay(rb)
        with self.assertRaises(Error) as e: self.verify(a['id'], rb, other)
        self.assertEqual(e.exception.extra['reason'], 'mismatch')
        self.assertEqual(self.state(a['id']), ('pending', 'pending'))

    def test_a_verified_payment_marks_the_order_paid_once(self):
        o = self.order(); ro = self.store.razorpay_start(self.guest, o['id'])['rzp_order']; pay = self.fake.pay(ro)
        r = self.verify(o['id'], ro, pay); self.assertEqual((r['state'], r['payment']), ('paid', 'captured'))
        self.assertEqual(self.state(o['id']), ('paid', 'captured'))
        saved = next(x for x in self.store.account_view(self.guest)['orders'] if x['id'] == o['id'])
        self.assertEqual(saved['razorpay']['payment'], pay)
        self.assertTrue(self.verify(o['id'], ro, pay)['idempotent']); self.assertTrue(self.store.razorpay_start(self.guest, o['id'])['idempotent'])

    def test_authorised_payment_and_lost_page(self):
        a = self.order(); ra = self.store.razorpay_start(self.guest, a['id'])['rzp_order']; pa = self.fake.pay(ra, 'authorized')
        self.assertEqual(self.verify(a['id'], ra, pa)['state'], 'paid')
        b = self.order(); rb = self.store.razorpay_start(self.guest, b['id'])['rzp_order']; self.fake.pay(rb)
        self.assertEqual(self.store.razorpay_start(self.guest, b['id'])['state'], 'paid')  # paid, page lost before verify
        self.assertEqual(self.state(b['id']), ('paid', 'captured'))

    def test_payment_after_the_hold_is_recorded_not_captured(self):
        o = self.order(); ro = self.store.razorpay_start(self.guest, o['id'])['rzp_order']
        with self.store.db() as c:
            c.execute('UPDATE reservations SET expires=1 WHERE order_id=?', (o['id'],))
        with self.assertRaises(Error) as e: self.store.razorpay_start(self.guest, o['id'])
        self.assertEqual(e.exception.extra['reason'], 'inactive')
        pay = self.fake.pay(ro)
        with self.assertRaises(Error) as e: self.verify(o['id'], ro, pay)
        self.assertEqual(e.exception.extra['reason'], 'paid_after_hold')
        self.assertEqual(self.state(o['id'])[0], 'expired')
        saved = next(x for x in self.store.account_view(self.guest)['orders'] if x['id'] == o['id'])
        self.assertTrue(saved['payment_after_hold'])

    def test_unreachable_and_unconfigured(self):
        o = self.order(); self.fake.down = True
        with self.assertRaises(Error) as e: self.store.razorpay_start(self.guest, o['id'])
        self.assertEqual((e.exception.status, e.exception.extra['reason']), (503, 'unavailable'))
        self.assertEqual(self.state(o['id']), ('pending', 'pending'))
        with mock.patch.dict(os.environ, {'RAZORPAY_KEY_ID': '', 'RAZORPAY_KEY_SECRET': ''}), mock.patch.object(razorpay.shipping, '_env_file', lambda: {}):
            self.assertFalse(razorpay.configured())
            with self.assertRaises(Error) as e: self.store.razorpay_start(self.guest, o['id'])
            self.assertEqual(e.exception.status, 503)


    # Webhook (18 Nov 2026): Razorpay's own server reports the payment, so a closed page doesn't leave a paid order unpaid.
    def hook(self, kind, ro, pay=None, secret=HOOK, raw=None):
        body = raw if raw is not None else json.dumps({'event': kind, 'payload': {
            'payment': {'entity': next((dict(p) for p in self.fake.payments if p['id'] == pay), {'id': pay, 'order_id': ro})},
            'order': {'entity': {'id': ro}}}}).encode()
        return self.store.razorpay_webhook(body, hmac.new(secret.encode(), body, hashlib.sha256).hexdigest())

    def audit(self, action, oid):
        with self.store.db() as c:
            return c.execute('SELECT COUNT(*) n FROM audit WHERE action=? AND target=?', (action, oid)).fetchone()['n']

    def test_webhook_marks_a_paid_order_paid_when_the_page_was_closed(self):
        o = self.order(); ro = self.store.razorpay_start(self.guest, o['id'])['rzp_order']; pay = self.fake.pay(ro)
        r = self.hook('payment.captured', ro, pay)
        self.assertEqual((r['ok'], r['state'], r['payment']), (True, 'paid', 'captured'))
        self.assertEqual(self.state(o['id']), ('paid', 'captured'))
        saved = next(x for x in self.store.account_view(self.guest)['orders'] if x['id'] == o['id'])
        self.assertEqual((saved['razorpay']['order'], saved['razorpay']['payment']), (ro, pay))
        self.assertTrue(self.hook('order.paid', ro, pay)['idempotent'])  # Razorpay sends both events, and may resend
        self.assertTrue(self.verify(o['id'], ro, pay)['idempotent'])  # the page coming back later changes nothing
        self.assertEqual(self.audit('razorpay_payment_captured', o['id']), 1)
        with mock.patch('app.msg91.orders_on', lambda: True):
            c2 = self.order(); r2 = self.store.razorpay_start(self.guest, c2['id'])['rzp_order']; p2 = self.fake.pay(r2)
            self.hook('payment.captured', r2, p2); self.hook('order.paid', r2, p2)
        with self.store.db() as c:  # one "paid" message, however many events arrive
            self.assertEqual(c.execute("SELECT COUNT(*) n FROM notices WHERE order_id=? AND event='order_paid'", (c2['id'],)).fetchone()['n'], 1)
        b = self.order(); rb = self.store.razorpay_start(self.guest, b['id'])['rzp_order']; pb = self.fake.pay(rb, 'authorized')
        self.assertEqual(self.hook('payment.authorized', rb, pb)['state'], 'paid')  # authorised counts, as on the page

    def test_webhook_refuses_unsigned_and_ignores_what_is_not_a_payment_of_ours(self):
        o = self.order(); ro = self.store.razorpay_start(self.guest, o['id'])['rzp_order']; pay = self.fake.pay(ro)
        for secret in ('wrong-secret', SECRET):  # signed with another secret, or with the API secret instead of the webhook's
            with self.assertRaises(Error) as e: self.hook('payment.captured', ro, pay, secret=secret)
            self.assertEqual((e.exception.status, e.exception.extra['reason']), (400, 'signature'))
        with self.assertRaises(Error) as e: self.store.razorpay_webhook(b'{}', '')
        self.assertEqual(e.exception.status, 400)
        with self.assertRaises(Error) as e: self.hook('', '', raw=b'not json')
        self.assertEqual(e.exception.status, 400)
        self.assertEqual(self.hook('refund.processed', ro, pay)['ignored'], 'refund.processed')
        self.assertEqual(self.hook('', '', raw=json.dumps({'event': 'payment.captured', 'payload': {'payment': {'entity': {'id': pay, 'order_id': 'not-an-id'}}}}).encode())['ignored'], 'no_order')
        self.assertEqual(self.hook('', '', raw=json.dumps({'event': 'order.paid', 'payload': {'order': 'x', 'payment': []}}).encode())['ignored'], 'no_order')
        self.fake.orders.append({'id': 'order_ELSEWHERE01', 'amount': 100, 'currency': 'INR', 'receipt': 'payment-link-7', 'status': 'paid'})
        self.assertEqual(self.hook('order.paid', 'order_ELSEWHERE01')['ignored'], 'not_ours')
        self.fake.orders.append({'id': 'order_NOSUCHORDER', 'amount': 100, 'currency': 'INR', 'receipt': 'BCC-00000000', 'status': 'paid'})
        self.assertEqual(self.hook('order.paid', 'order_NOSUCHORDER')['ignored'], 'unknown_order')
        self.fake.orders.append({'id': 'order_WRONGTOTAL1', 'amount': 100, 'currency': 'INR', 'receipt': o['id'], 'status': 'paid'})
        self.assertEqual(self.hook('order.paid', 'order_WRONGTOTAL1')['ignored'], 'mismatch')  # our number, but not our total
        b = self.order(); rb = self.store.razorpay_start(self.guest, b['id'])['rzp_order']; failed = self.fake.pay(rb, 'failed')
        self.assertEqual(self.hook('payment.captured', rb, failed)['ignored'], 'not_paid')  # the event says captured; Razorpay says not
        self.assertEqual(self.state(o['id']), ('pending', 'pending')); self.assertEqual(self.state(b['id']), ('pending', 'pending'))
        with mock.patch.dict(os.environ, {'RAZORPAY_WEBHOOK_SECRET': ''}), mock.patch.object(razorpay.shipping, '_env_file', lambda: {}):
            with self.assertRaises(Error) as e: self.hook('payment.captured', ro, pay)
            self.assertEqual(e.exception.status, 503)
        self.fake.down = True
        with self.assertRaises(Error) as e: self.hook('payment.captured', ro, pay)
        self.assertEqual(e.exception.status, 503)  # Razorpay retries a 5xx later

    def test_webhook_after_the_hold_is_recorded_once_for_a_person(self):
        o = self.order(); ro = self.store.razorpay_start(self.guest, o['id'])['rzp_order']
        with self.store.db() as c:
            c.execute('UPDATE reservations SET expires=1 WHERE order_id=?', (o['id'],))
        pay = self.fake.pay(ro)
        self.assertEqual(self.hook('payment.captured', ro, pay)['state'], 'paid_after_hold')
        self.assertEqual(self.hook('order.paid', ro, pay)['state'], 'paid_after_hold')
        with self.assertRaises(Error) as e: self.verify(o['id'], ro, pay)
        self.assertEqual(e.exception.extra['reason'], 'paid_after_hold')
        self.assertEqual(self.state(o['id'])[0], 'expired')
        self.assertEqual(self.audit('razorpay_paid_after_hold', o['id']), 1)

    def test_mode_chooses_the_keys_and_refuses_the_wrong_kind(self):
        o = self.order()
        live = {'RAZORPAY_MODE': 'live', 'RAZORPAY_LIVE_KEY_ID': 'rzp_live_STANDIN000001', 'RAZORPAY_LIVE_KEY_SECRET': 'live-secret-0000'}
        with mock.patch.dict(os.environ, live):
            self.assertEqual((razorpay.config()['mode'], razorpay.config()['key']), ('live', 'rzp_live_STANDIN000001'))
            r = self.store.razorpay_start(self.guest, o['id']); self.assertEqual((r['key'], r['test']), ('rzp_live_STANDIN000001', False))
        with mock.patch.dict(os.environ, {**live, 'RAZORPAY_LIVE_KEY_ID': KEY}):  # live mode never runs on a test key
            with self.assertRaises(Error) as e: self.store.razorpay_start(self.guest, o['id'])
            self.assertIn('RAZORPAY_MODE', str(e.exception))
        with mock.patch.dict(os.environ, {'RAZORPAY_KEY_ID': 'rzp_live_STANDIN000001'}):  # test mode never takes real money
            with self.assertRaises(Error) as e: self.store.razorpay_start(self.guest, o['id'])
            self.assertEqual(e.exception.status, 503); self.assertIn('RAZORPAY_MODE', str(e.exception))
        with mock.patch.dict(os.environ, {'RAZORPAY_MODE': 'live', 'RAZORPAY_LIVE_KEY_ID': '', 'RAZORPAY_LIVE_KEY_SECRET': ''}), mock.patch.object(razorpay.shipping, '_env_file', lambda: {}):
            self.assertFalse(razorpay.configured())  # the test keys are not borrowed for live
        self.assertEqual(razorpay.config()['mode'], 'test')



if __name__ == '__main__':
    unittest.main()
