"""Sign-up, email and password sign-in, labelled addresses and tokenised saved cards."""
from pathlib import Path
import tempfile
import time
import unittest
from app.server import Store, Error

ADDR = {'name': 'Asha Patel', 'address': '12 Ring Road', 'city': 'Surat', 'state': 'Gujarat', 'pincode': '395001'}


class AuthTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.store = Store(Path(self.temp.name) / 'auth.db')

    def tearDown(self):
        self.temp.cleanup()

    def fresh(self):
        return self.store.session('')[0]

    def wait_resend(self):
        with self.store.db() as c:
            c.execute('UPDATE otps SET sent=sent-60')

    def signup(self, s, **kw):
        data = {'name': 'Asha Patel', 'mobile': '9876543210', 'email': 'asha@example.com', 'password': 'chai2026x', **kw}
        out = self.store.signup(s, data)
        r = self.store.verify(s, {'mobile': data['mobile'], 'code': out['preview_code']})
        return self.store.session(s['id'])[0], r

    def test_signup_creates_named_account_and_flags_email(self):
        s, r = self.signup(self.fresh())
        self.assertTrue(r['created']); self.assertEqual(r['email_pending'], 'asha@example.com')
        self.assertEqual(s['name'], 'Asha Patel')
        v = self.store.account_view(s)['profile']
        self.assertTrue(v['has_password']); self.assertFalse(v['email_verified'])
        with self.assertRaises(Error) as e:
            self.store.signup(self.fresh(), {'name': 'X', 'mobile': '9876543210'})
        self.assertEqual(e.exception.extra['reason'], 'exists')

    def test_signup_validates_fields(self):
        with self.assertRaises(Error) as e:
            self.store.signup(self.fresh(), {'name': '', 'mobile': '123', 'email': 'nope', 'password': 'short'})
        self.assertEqual(set(e.exception.extra['fields']), {'name', 'mobile', 'email', 'password'})

    def test_email_signs_in_only_once_confirmed(self):
        s, _ = self.signup(self.fresh())
        with self.assertRaises(Error):
            self.store.otp(self.fresh(), {'email': 'asha@example.com'})
        code = self.store.email_code(s, {'email': 'asha@example.com'})['preview_code']
        self.store.email_verify(s, {'email': 'asha@example.com', 'code': code})
        self.assertTrue(self.store.account_view(s)['profile']['email_verified'])
        g = self.fresh()
        out = self.store.otp(g, {'email': 'ASHA@example.com'})
        self.assertEqual(out['channel'], 'email')
        self.store.verify(g, {'email': 'asha@example.com', 'code': out['preview_code']})
        self.assertEqual(self.store.session(g['id'])[0]['user_id'], s['user_id'])
        # Changing the email takes away its sign-in until it's confirmed again.
        self.store.profile_update(s, {'name': 'Asha', 'email': 'new@example.com'})
        self.assertFalse(self.store.account_view(s)['profile']['email_verified'])

    def test_password_sign_in_by_mobile_or_email_with_limits(self):
        s, _ = self.signup(self.fresh())
        g = self.fresh()
        self.store.password_signin(g, {'identifier': '+91 98765 43210', 'password': 'chai2026x'})
        self.assertEqual(self.store.session(g['id'])[0]['user_id'], s['user_id'])
        g = self.fresh()
        for _ in range(5):
            with self.assertRaises(Error):
                self.store.password_signin(g, {'identifier': '9876543210', 'password': 'wrong1234'})
        with self.assertRaises(Error) as e:
            self.store.password_signin(g, {'identifier': '9876543210', 'password': 'chai2026x'})
        self.assertEqual(e.exception.extra['reason'], 'locked')
        with self.assertRaises(Error):  # unconfirmed email can't sign in
            self.store.password_signin(self.fresh(), {'identifier': 'asha@example.com', 'password': 'chai2026x'})

    def test_set_and_change_password(self):
        s, _ = self.signup(self.fresh(), password='')
        self.assertFalse(self.store.account_view(s)['profile']['has_password'])
        self.store.set_password(s, {'password': 'first1234'})
        with self.assertRaises(Error):
            self.store.set_password(s, {'password': 'second1234', 'current': 'nope'})
        self.store.set_password(s, {'password': 'second1234', 'current': 'first1234'})
        self.store.password_signin(self.fresh(), {'identifier': '9876543210', 'password': 'second1234'})

    def test_addresses_have_labels_and_a_cap_of_five(self):
        s, _ = self.signup(self.fresh())
        self.store.address_save(s, {**ADDR, 'label': 'office', 'mobile': '9123456780', 'landmark': 'Near the station'})
        with self.assertRaises(Error) as e:
            self.store.address_save(s, {**ADDR, 'label': 'other'})
        self.assertIn('label_name', e.exception.extra['fields'])
        self.store.address_save(s, {**ADDR, 'label': 'other', 'label_name': 'Parents'})
        a = self.store.account_view(s)['addresses']
        self.assertEqual({x['label'] for x in a}, {'office', 'other'})
        for _ in range(3):
            self.store.address_save(s, ADDR)
        with self.assertRaises(Error):
            self.store.address_save(s, ADDR)

    def test_cards_store_only_display_details(self):
        s, _ = self.signup(self.fresh())
        y = time.gmtime().tm_year + 2
        with self.assertRaises(Error) as e:
            self.store.card_save(s, {'number': '4111111111111111', 'network': 'visa', 'kind': 'credit', 'last4': '1111', 'exp_month': 1, 'exp_year': y, 'name': 'A'})
        self.assertEqual(e.exception.extra['reason'], 'raw_card')
        card = {'network': 'visa', 'kind': 'credit', 'last4': '1111', 'exp_month': 4, 'exp_year': y, 'name': 'Asha Patel', 'nickname': 'Travel'}
        cid = self.store.card_save(s, card)['id']
        with self.assertRaises(Error):
            self.store.card_save(s, card)
        with self.assertRaises(Error) as e:
            self.store.card_save(s, {**card, 'last4': '2222', 'exp_year': 2001})
        self.assertIn('expiry', e.exception.extra['fields'])
        v = self.store.account_view(s)
        self.assertEqual(v['profile']['default_card'], cid)
        self.assertNotIn('token', v['cards'][0]); self.assertEqual(v['cards'][0]['last4'], '1111')
        cid2 = self.store.card_save(s, {**card, 'network': 'rupay', 'kind': 'debit', 'last4': '4321'})['id']
        self.store.card_action(s, cid2, 'default')
        self.store.card_action(s, cid2, 'delete')
        self.assertEqual(self.store.account_view(s)['profile']['default_card'], cid)
        with self.assertRaises(Error):
            self.store.card_save(self.fresh(), card)


if __name__ == '__main__':
    unittest.main()
