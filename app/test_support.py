"""Support: case routing and contact details, follow-up, help feedback, cancellation checks, return requests,
privacy requests and the personal-data export."""
import json
import os
from pathlib import Path
import tempfile
import unittest
from app.server import Store, Error

CONTACT = {'name': 'Preview Customer', 'mobile': '9876543210', 'address': '123 Sample Street', 'city': 'Surat', 'state': 'Gujarat', 'pincode': '395001'}


class SupportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.store = Store(Path(self.temp.name) / 'support.db')
        self.guest = self.store.session('')[0]

    def tearDown(self):
        self.temp.cleanup()

    def sign_in(self, s, mobile='9876543210'):
        otp = self.store.otp(s, {'mobile': mobile})
        self.store.verify(s, {'mobile': mobile, 'code': otp['preview_code']})
        return self.store.session(s['id'])[0]

    def order(self, s):
        return self.store.order(s, {'items': [{'id': 'l-theanine', 'quantity': 2}], 'adult': True, 'method': 'prepaid', 'contact': CONTACT})

    def set_state(self, oid, state):
        with self.store.db() as c:
            c.execute('UPDATE orders SET state=? WHERE id=?', (state, oid))

    def test_case_routing_contact_details_and_follow_up(self):
        with self.assertRaises(Error) as e:
            self.store.case(self.guest, {'kind': 'business', 'message': 'Wholesale enquiry about stocking.', 'contact': {'name': 'A'}})
        self.assertIn('name', e.exception.extra['fields']); self.assertIn('mobile', e.exception.extra['fields'])
        c = self.store.case(self.guest, {'kind': 'business', 'message': 'Wholesale enquiry about stocking.', 'contact': {'name': 'Asha', 'email': 'asha@example.com'}})
        self.assertEqual((c['queue'], c['sla']), ('Business enquiries', 'Response time not yet confirmed'))
        self.assertEqual(c['contact'], {'name': 'Asha', 'email': 'asha@example.com'})
        safety = self.store.case(self.guest, {'kind': 'safety', 'message': 'The seal was broken on arrival.', 'contact': {'name': 'Asha', 'mobile': '+91 98765 43210'}})
        self.assertEqual((safety['queue'], safety['sla'], safety['contact']['mobile']), ('Product safety · priority', 'Priority review', '9876543210'))
        with self.assertRaises(Error) as e:
            self.store.case(self.guest, {'kind': 'delivery', 'message': 'Where is my parcel please?', 'order_id': 'BCC-00000000', 'contact': {'name': 'Asha', 'mobile': '9876543210'}})
        self.assertEqual((e.exception.status, e.exception.extra['field']), (404, 'order_id'))
        view = self.store.case_reply(self.guest, c['id'], {'message': 'Adding our GSTIN later.'})
        self.assertEqual(view['history'][-1]['state'], 'customer_reply')
        other = self.store.session('')[0]
        for call in (lambda: self.store.case_view(other, c['id']), lambda: self.store.case_reply(other, c['id'], {'message': 'Not mine'})):
            with self.assertRaises(Error) as e:
                call()
            self.assertEqual(e.exception.status, 404)

    def test_reply_reopens_resolved_case_and_admin_note_is_visible(self):
        c = self.store.case(self.guest, {'kind': 'general', 'message': 'A general question here.', 'contact': {'name': 'Asha', 'mobile': '9876543210'}})
        admin = self.store.session('')[0]
        self.store.login(admin, {'identity': 'admin-a'}); admin = self.store.session(admin['id'])[0]
        self.store.admin(admin, 'case', {'id': c['id'], 'state': 'resolved', 'note': 'Answered by phone.'})
        v = self.store.case_view(self.guest, c['id'])
        self.assertEqual((v['state'], v['history'][-1]['note']), ('resolved', 'Answered by phone.'))
        v = self.store.case_reply(self.guest, c['id'], {'message': 'One more thing.'})
        self.assertEqual(v['state'], 'open')

    def test_help_feedback_is_one_answer_per_session(self):
        self.store.help_feedback(self.guest, {'article': 'track-order', 'helpful': False, 'reason': 'unclear'})
        self.store.help_feedback(self.guest, {'article': 'track-order', 'helpful': True})
        with self.store.db() as c:
            self.assertEqual(self.store.help_feedback_summary(c), [{'article': 'track-order', 'yes': 1, 'no': 0}])
        for bad in ({'article': '../x', 'helpful': True}, {'article': 'a-b', 'helpful': 'yes'}, {'article': 'a-b', 'helpful': False, 'reason': 'rude'}):
            with self.assertRaises(Error):
                self.store.help_feedback(self.guest, bad)

    def test_cancel_check_explains_before_confirming(self):
        o = self.order(self.guest)
        chk = self.store.cancel_check(self.guest, o['id'])
        self.assertEqual((chk['eligible'], chk['refund'], chk['charge']), (True, 'none', 0))
        self.store.pay(self.guest, o['id'], {'outcome': 'uncertain'})
        chk = self.store.cancel_check(self.guest, o['id'])
        self.assertEqual((chk['eligible'], chk['reason']), (False, 'processing'))
        with self.assertRaises(Error) as e:
            self.store.cancel(self.guest, o['id'])
        self.assertEqual(e.exception.extra['reason'], 'processing')
        self.store.reconcile(self.guest, o['id'], {'outcome': 'success'})
        chk = self.store.cancel_check(self.guest, o['id'])
        self.assertEqual((chk['eligible'], chk['refund']), (True, 'full'))
        self.set_state(o['id'], 'shipped')
        self.assertEqual(self.store.cancel_check(self.guest, o['id'])['reason'], 'dispatched')
        with self.assertRaises(Error):
            self.store.cancel_check(self.store.session('')[0], o['id'])

    def test_return_requests_follow_the_order(self):
        o = self.order(self.guest)
        self.store.pay(self.guest, o['id'], {'outcome': 'success'})
        req = {'reason': 'damaged', 'remedy': 'either', 'message': 'The tub was cracked on arrival.', 'items': [{'id': 'l-theanine', 'quantity': 1}]}
        with self.assertRaises(Error) as e:
            self.store.return_request(self.guest, o['id'], req)
        self.assertEqual(e.exception.extra['reason'], 'not_dispatched')
        self.set_state(o['id'], 'shipped')
        with self.assertRaises(Error) as e:
            self.store.return_request(self.guest, o['id'], req)
        self.assertEqual(e.exception.extra['reason'], 'not_delivered')
        self.assertEqual(self.store.return_request(self.guest, o['id'], {**req, 'reason': 'missing'})['request']['reason'], 'missing')
        self.set_state(o['id'], 'delivered')
        with self.assertRaises(Error) as e:
            self.store.return_request(self.guest, o['id'], req)
        self.assertEqual(e.exception.extra['reason'], 'duplicate')
        with self.store.db() as c:
            c.execute('DELETE FROM cases')
        for bad in ({**req, 'items': [{'id': 'l-theanine', 'quantity': 3}]}, {**req, 'items': [{'id': 'omega-3-fish-oil', 'quantity': 1}]}, {**req, 'reason': 'whim'}, {**req, 'message': 'short'}):
            with self.assertRaises(Error):
                self.store.return_request(self.guest, o['id'], bad)
        r = self.store.return_request(self.guest, o['id'], req)
        self.assertEqual((r['kind'], r['queue'], r['order_id']), ('replacement', 'Orders · problem with an item', o['id']))
        self.assertEqual(self.store.account_view(self.guest)['cases'][0]['id'], r['id'])
        with self.assertRaises(Error) as e:
            self.store.return_request(self.store.session('')[0], o['id'], req)
        self.assertEqual(e.exception.status, 404)

    def test_privacy_requests_need_a_verified_customer(self):
        with self.assertRaises(Error) as e:
            self.store.privacy_request(self.guest, {'request': 'access'})
        self.assertEqual((e.exception.status, e.exception.extra['reason']), (401, 'verify'))
        with self.assertRaises(Error) as e:
            self.store.data_export(self.guest)
        self.assertEqual(e.exception.status, 401)
        a = self.sign_in(self.guest)
        r = self.store.privacy_request(a, {'request': 'erasure'})
        self.assertEqual((r['kind'], r['queue']), ('privacy', 'Privacy requests'))
        with self.assertRaises(Error) as e:
            self.store.privacy_request(a, {'request': 'erasure'})
        self.assertEqual(e.exception.extra['case'], r['id'])
        with self.assertRaises(Error):
            self.store.privacy_request(a, {'request': 'correction', 'message': 'x'})

    def test_export_contains_only_this_customers_data(self):
        a = self.sign_in(self.guest)
        self.store.address_save(a, {'name': 'Owner', 'address': '1 Sample Road', 'city': 'Surat', 'state': 'Gujarat', 'pincode': '395001'})
        self.order(a)
        b = self.sign_in(self.store.session('')[0], '9123456789')
        self.order(b)
        out = self.store.data_export(a)
        self.assertEqual(out['account']['mobile'], '9876543210')
        self.assertEqual(len(out['orders']), 1); self.assertEqual(len(out['addresses']), 1)
        self.assertNotIn('9123456789', json.dumps(out))


if __name__ == '__main__':
    unittest.main()
