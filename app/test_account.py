"""Account and bag: quotes, account bag, sign-in codes, profile, addresses, idempotent orders, payment outcomes."""
import json
import os
from pathlib import Path
import tempfile
import time
import unittest
from app.server import Store, Error

CONTACT = {'name': 'Preview Customer', 'mobile': '9876543210', 'address': '123 Sample Street', 'city': 'Surat', 'state': 'Gujarat', 'pincode': '395001'}


class AccountTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.store = Store(Path(self.temp.name) / 'acct.db')
        self.guest = self.store.session('')[0]

    def tearDown(self):
        self.temp.cleanup()
        os.environ.pop('BCC_OTP_PROVIDER', None)

    def sign_in(self, s, mobile='9876543210'):
        otp = self.store.otp(s, {'mobile': mobile})
        r = self.store.verify(s, {'mobile': mobile, 'code': otp['preview_code']})
        return self.store.session(s['id'])[0], r

    def order(self, s, **extra):
        return self.store.order(s, {'items': [{'id': 'l-theanine', 'quantity': 1}], 'adult': True, 'method': 'prepaid', 'contact': CONTACT, **extra})

    def test_quote_explains_stock_price_and_discount(self):
        q = self.store.bag_quote(self.guest, {'items': [{'id': 'l-theanine', 'quantity': 2, 'price': 1699}], 'discount': ''})
        self.assertTrue(q['ready']); self.assertEqual(q['subtotal'], 3398); self.assertEqual(q['shipping'], 0); self.assertTrue(q['sample'])
        q = self.store.bag_quote(self.guest, {'items': [{'id': 'psyllium-husk', 'quantity': 1, 'price': 600}]})
        self.assertFalse(q['ready']); self.assertTrue(q['lines'][0]['price_changed']); self.assertEqual(q['shipping'], 75)
        self.assertEqual(q['changes'][0]['kind'], 'price')
        q = self.store.bag_quote(self.guest, {'items': [{'id': 'l-theanine', 'quantity': 12}]})
        self.assertEqual((q['lines'][0]['status'], q['lines'][0]['payable_quantity']), ('reduced', 10))
        with self.store.db() as c: c.execute("UPDATE batches SET available=0 WHERE product='iron-bisglycinate'")
        q = self.store.bag_quote(self.guest, {'items': [{'id': 'iron-bisglycinate', 'quantity': 1}]})
        self.assertEqual(q['lines'][0]['status'], 'unavailable'); self.assertEqual(q['subtotal'], 0); self.assertEqual(q['shipping'], 0)
        q = self.store.bag_quote(self.guest, {'items': [{'id': 'l-theanine', 'quantity': 1}], 'discount': 'preview10'})
        self.assertEqual(q['discount'], 170); self.assertEqual(q['discount_applied']['code'], 'PREVIEW10')
        q = self.store.bag_quote(self.guest, {'items': [{'id': 'l-theanine', 'quantity': 1}], 'discount': 'FREE50'})
        self.assertEqual(q['discount'], 0); self.assertTrue(q['discount_error']); self.assertFalse(q['ready'])
        with self.assertRaises(Error): self.store.bag_quote(self.guest, {'items': [{'id': 'l-theanine', 'quantity': 1}, {'id': 'l-theanine', 'quantity': 1}]})

    def test_account_bag_is_per_customer(self):
        self.assertEqual(self.store.bag_get(self.guest), {'items': [], 'account': False})
        self.assertFalse(self.store.bag_save(self.guest, {'items': [{'id': 'l-theanine', 'quantity': 1}]})['account'])
        a, _ = self.sign_in(self.guest)
        self.store.bag_save(a, {'items': [{'id': 'l-theanine', 'quantity': 3, 'price': 1699}]})
        self.assertEqual(self.store.bag_get(a)['items'][0]['quantity'], 3)
        other, _ = self.sign_in(self.store.session('')[0], '9123456789')
        self.assertEqual(self.store.bag_get(other)['items'], [])
        with self.assertRaises(Error): self.store.bag_save(a, {'items': [{'id': 'l-theanine', 'quantity': 11}]})

    def test_codes_expire_lock_and_rate_limit(self):
        otp = self.store.otp(self.guest, {'mobile': '9876543210'})
        self.assertEqual(otp['resend_in'], 20); self.assertIn('••', otp['destination']); self.assertEqual(otp['mode'], 'preview')
        with self.assertRaises(Error) as e: self.store.otp(self.guest, {'mobile': '9876543210'})
        self.assertEqual((e.exception.status, e.exception.extra['reason']), (429, 'resend_wait'))
        wrong = '000000' if otp['preview_code'] != '000000' else '111111'
        with self.assertRaises(Error) as e: self.store.verify(self.guest, {'mobile': '9876543210', 'code': wrong})
        self.assertEqual(e.exception.extra['attempts_left'], 4)
        for _ in range(4):
            with self.assertRaises(Error): self.store.verify(self.guest, {'mobile': '9876543210', 'code': wrong})
        with self.assertRaises(Error) as e: self.store.verify(self.guest, {'mobile': '9876543210', 'code': otp['preview_code']})
        self.assertEqual(e.exception.extra['reason'], 'locked')
        with self.store.db() as c: c.execute('UPDATE otps SET sent=0, attempts=0, expires=? WHERE mobile=?', (int(time.time()) - 1, '9876543210'))
        with self.assertRaises(Error) as e: self.store.verify(self.guest, {'mobile': '9876543210', 'code': otp['preview_code']})
        self.assertEqual(e.exception.extra['reason'], 'expired')
        for _ in range(4):
            with self.store.db() as c: c.execute('UPDATE otps SET sent=0')
            self.store.otp(self.guest, {'mobile': '9876543210'})
        with self.store.db() as c: c.execute('UPDATE otps SET sent=0')
        with self.assertRaises(Error) as e: self.store.otp(self.guest, {'mobile': '9876543210'})
        self.assertEqual(e.exception.extra['reason'], 'rate_limited')
        with self.assertRaises(Error): self.store.otp(self.guest, {'mobile': '5876543210'})

    def test_unconfigured_provider_fails_honestly(self):
        os.environ['BCC_OTP_PROVIDER'] = 'some-sms-provider'
        with self.assertRaises(Error) as e: self.store.otp(self.guest, {'mobile': '9876543210'})
        self.assertEqual((e.exception.status, e.exception.extra['reason']), (503, 'unavailable'))

    def test_sign_in_reports_new_or_returning_and_claims_matching_orders(self):
        o = self.order(self.guest)
        a, r = self.sign_in(self.guest)
        self.assertEqual((r['created'], r['claimed_orders']), (True, 1))
        self.assertEqual(self.store.account_view(a)['orders'][0]['id'], o['id'])
        _, r2 = self.sign_in(self.store.session('')[0])
        self.assertFalse(r2['created'])

    def test_sign_in_carries_this_sessions_support_cases(self):
        case = self.store.case(self.guest, {'kind': 'brand', 'message': 'A question about the brand, from a guest.'})
        other = self.store.session('')[0]
        self.store.case(other, {'kind': 'general', 'message': 'Someone else in another browser.'})
        a, _ = self.sign_in(self.guest)
        self.assertEqual([c['id'] for c in self.store.account_view(a)['cases']], [case['id']])

    def test_sign_out_everywhere(self):
        a, _ = self.sign_in(self.guest)
        b, _ = self.sign_in(self.store.session('')[0])
        self.store.logout(a, {'everywhere': True})
        self.assertTrue(self.store.session(b['id'])[1])

    def test_profile_preferences_and_addresses(self):
        with self.assertRaises(Error): self.store.profile_update(self.guest, {'name': 'X'})
        a, _ = self.sign_in(self.guest)
        with self.assertRaises(Error) as e: self.store.profile_update(a, {'name': 'Asha', 'email': 'nope'})
        self.assertEqual(e.exception.extra['field'], 'email')
        self.store.profile_update(a, {'name': 'Asha', 'email': 'asha@example.com'})
        self.store.preferences(a, {'email': True, 'whatsapp': 'yes'})
        v = self.store.account_view(self.store.session(a['id'])[0])
        self.assertEqual((v['profile']['name'], v['profile']['email'], v['profile']['email_verified']), ('Asha', 'asha@example.com', False))
        self.assertEqual(v['profile']['prefs'], {'email': True, 'whatsapp': False})
        with self.assertRaises(Error) as e: self.store.address_save(a, {'name': 'A', 'pincode': '012345'})
        self.assertIn('pincode', e.exception.extra['fields'])
        first = self.store.address_save(a, {'name': 'Asha', 'address': '1 Road', 'city': 'Pune', 'state': 'MH', 'pincode': '411001'})['id']
        second = self.store.address_save(a, {'name': 'Asha', 'address': '2 Road', 'city': 'Pune', 'state': 'MH', 'pincode': '411002'})['id']
        self.assertEqual(self.store.account_view(a)['profile']['default_address'], first)
        self.store.address_action(a, second, 'default')
        self.store.address_save(a, {'id': second, 'name': 'Asha R', 'address': '2 Road', 'city': 'Pune', 'state': 'MH', 'pincode': '411002'})
        other, _ = self.sign_in(self.store.session('')[0], '9123456789')
        for call in [lambda: self.store.address_action(other, second, 'delete'), lambda: self.store.address_save(other, {'id': second, 'name': 'X Y', 'address': 'Z road', 'city': 'Pune', 'state': 'MH', 'pincode': '411002'})]:
            with self.assertRaises(Error) as e: call()
            self.assertEqual(e.exception.status, 404)
        self.store.address_action(a, second, 'delete')
        v = self.store.account_view(a)
        self.assertEqual(v['profile']['default_address'], first); self.assertEqual(len(v['addresses']), 1)
        self.assertEqual(self.store.account_view(other)['addresses'], [])

    def test_resubmitted_checkout_returns_the_same_order(self):
        o1 = self.order(self.guest, idempotency_key='checkout-key-0001')
        o2 = self.order(self.guest, idempotency_key='checkout-key-0001')
        self.assertEqual(o1['id'], o2['id']); self.assertTrue(o2['idempotent'])
        with self.store.db() as c: self.assertEqual(c.execute('SELECT COUNT(*) FROM orders').fetchone()[0], 1)
        with self.assertRaises(Error) as e: self.order(self.store.session('')[0], idempotency_key='checkout-key-0001')
        self.assertEqual(e.exception.status, 409)
        with self.assertRaises(Error): self.order(self.guest, idempotency_key='bad key!')

    def test_uncertain_payment_blocks_retry_until_checked(self):
        o = self.order(self.guest)
        r = self.store.pay(self.guest, o['id'], {'outcome': 'cancelled'}); self.assertEqual(r['payment'], 'cancelled')
        r = self.store.pay(self.guest, o['id'], {'outcome': 'uncertain'}); self.assertEqual(r['payment'], 'processing')
        with self.assertRaises(Error) as e: self.store.pay(self.guest, o['id'], {'outcome': 'success'})
        self.assertEqual(e.exception.extra['reason'], 'processing')
        # The reservation is kept while the outcome is unknown, even past its expiry.
        with self.store.db() as c: c.execute("UPDATE reservations SET expires=0 WHERE order_id=?", (o['id'],))
        self.assertEqual(self.store.order_status(self.guest, o['id'])['state'], 'pending')
        self.assertEqual(self.store.reconcile(self.guest, o['id'], {'outcome': 'success'})['payment'], 'captured')
        self.assertTrue(self.store.pay(self.guest, o['id'], {'outcome': 'success'})['idempotent'])
        with self.assertRaises(Error): self.store.order_status(self.store.session('')[0], o['id'])
        v = self.store.account_view(self.guest)['orders'][0]
        self.assertEqual(v['payment'], 'captured'); self.assertEqual(v['lots'][0]['product'], 'l-theanine'); self.assertEqual(v['lots'][0]['batch'], 'DEMO-02-01')
        self.assertEqual(v['next']['title'], 'Preparing your order'); self.assertIsNone(v['invoice'])


if __name__ == '__main__':
    unittest.main()
