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

KEY, SECRET = 'rzp_test_STANDIN0000001', 'stand-in-secret-000000'
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
        for p in (mock.patch.dict(os.environ, {'RAZORPAY_KEY_ID': KEY, 'RAZORPAY_KEY_SECRET': SECRET}), mock.patch.object(razorpay, 'urlopen', self.fake)):
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


if __name__ == '__main__':
    unittest.main()
