"""MSG91 in the local preview, against a fake MSG91: no message leaves this machine."""
import io
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock
from urllib.parse import urlparse, parse_qs

from app import msg91, razorpay, account, shipping
from app.server import Store, Error
from app.test_razorpay import FakeRazorpay, sign, KEY, SECRET, CONTACT

AUTH = 'msg91-stand-in-key-0001'
SETTINGS = {
    'MSG91_AUTHKEY': AUTH, 'MSG91_OTP_TEMPLATE': 'otp-tpl', 'BCC_OTP_PROVIDER': 'msg91', 'BCC_ORDER_MESSAGES': 'msg91',
    'MSG91_SMS_ORDER_PAID': 'sms-paid', 'MSG91_SMS_ORDER_SHIPPED': 'sms-shipped', 'MSG91_SMS_ORDER_DELIVERED': 'sms-delivered', 'MSG91_SMS_ORDER_CANCELLED': 'sms-cancelled',
    'MSG91_WA_NUMBER': '91 92742 48974', 'MSG91_WA_ORDER_PAID': 'bcc_order_paid', 'MSG91_WA_ORDER_SHIPPED': 'bcc_order_shipped',
    'MSG91_EMAIL_DOMAIN': 'mail.example.com', 'MSG91_EMAIL_FROM': 'orders@mail.example.com', 'MSG91_EMAIL_CODE': 'bcc-sign-in-code',
    'MSG91_EMAIL_ORDER_PAID': 'bcc-order-paid', 'BCC_PUBLIC_ORIGIN': 'https://shop.example.com/',
}


class FakeMsg91:
    def __init__(self):
        self.sent, self.refuse = [], None

    def __call__(self, req, timeout=15):
        url = urlparse(req.full_url)
        assert url.netloc == 'control.msg91.com' and req.headers.get('Authkey') == AUTH, (url.netloc, req.headers)
        path = url.path.replace('/api/v5/', '')
        body = json.loads(req.data) if req.data else None
        self.sent.append({'path': path, 'query': {k: v[0] for k, v in parse_qs(url.query).items()}, 'body': body})
        if self.refuse: return io.BytesIO(json.dumps({'type': 'error', 'message': self.refuse}).encode())
        return io.BytesIO(json.dumps({'type': 'success', 'request_id': 'r1', 'message': 'ok'}).encode())

    def to(self, path):
        return [x for x in self.sent if x['path'] == path]


class Msg91Tests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.msg, self.rzp = FakeMsg91(), FakeRazorpay()
        self.env = dict(SETTINGS, RAZORPAY_KEY_ID=KEY, RAZORPAY_KEY_SECRET=SECRET)
        # The real .env holds the real key: every test reads only the settings above.
        for p in (mock.patch.dict(os.environ, self.env), mock.patch.object(shipping, '_env_file', lambda: {}),
                  mock.patch.object(msg91, 'urlopen', self.msg),
                  mock.patch.object(razorpay, 'urlopen', self.rzp)):
            p.start(); self.addCleanup(p.stop)
        self.store = Store(Path(self.temp.name) / 'msg.db')
        self.guest = self.store.session('')[0]
        self.store.setup_admin('owner.example', 'fixture-password-123')
        login = self.store.admin_signin(self.store.session('')[0], {'username': 'owner.example', 'password': 'fixture-password-123'})
        self.admin = self.store.session(login['_sid'])[0]

    def tearDown(self):
        self.temp.cleanup()

    def order(self, **contact):
        return self.store.order(self.guest, {'items': [{'id': 'l-theanine', 'quantity': 2}], 'adult': True, 'method': 'prepaid', 'contact': {**CONTACT, **contact}})

    def paid(self, **contact):
        o = self.order(**contact)
        ro = self.store.razorpay_start(self.guest, o['id'])['rzp_order']; pay = self.rzp.pay(ro)
        self.store.razorpay_verify(self.guest, o['id'], {'razorpay_order_id': ro, 'razorpay_payment_id': pay, 'razorpay_signature': sign(ro, pay)})
        return o

    def notices(self):
        with self.store.db() as c:
            return {(r['order_id'], r['event']): json.loads(r['result']) if r['result'] else None for r in c.execute('SELECT * FROM notices')}

    def test_rupees_use_indian_grouping(self):
        self.assertEqual([msg91.inr(x) for x in (0, 75, 999, 1299, 123456, 12345678)], ['0', '75', '999', '1,299', '1,23,456', '1,23,45,678'])

    def test_sign_in_code_goes_by_msg91_and_is_never_shown(self):
        r = self.store.otp(self.guest, {'mobile': '9825012345'})
        self.assertEqual(r['mode'], 'live'); self.assertNotIn('preview_code', r)
        sent = self.msg.to('otp'); self.assertEqual(len(sent), 1)
        q = sent[0]['query']
        self.assertEqual((q['template_id'], q['mobile'], q['otp_length'], q['otp_expiry']), ('otp-tpl', '919825012345', '6', '5'))
        self.assertTrue(self.store.verify(self.guest, {'mobile': '9825012345', 'code': q['otp']})['ok'])
        self.assertNotIn(AUTH, json.dumps(r))

    def test_a_refused_code_is_not_stored_and_can_be_asked_for_again(self):
        self.msg.refuse = 'The provided flow ID or template ID is invalid.'
        with self.assertRaises(Error) as e: self.store.otp(self.guest, {'mobile': '9825012345'})
        self.assertEqual((e.exception.status, e.exception.extra['reason']), (503, 'unavailable'))
        self.msg.refuse = None
        self.assertEqual(self.store.otp(self.guest, {'mobile': '9825012345'})['mode'], 'live')  # no resend wait: nothing went out

    def test_email_code_uses_the_email_template(self):
        self.store.otp(self.guest, {'mobile': '9825012345'}); self.store.verify(self.guest, {'mobile': '9825012345', 'code': self.msg.to('otp')[0]['query']['otp']})
        me = self.store.session(self.guest['id'])[0]  # the same browser session, now signed in
        r = self.store.email_code(me, {'email': 'asha@example.com'}); self.assertNotIn('preview_code', r)
        b = self.msg.to('email/send')[0]['body']
        self.assertEqual((b['template_id'], b['domain'], b['from']['email']), ('bcc-sign-in-code', 'mail.example.com', 'orders@mail.example.com'))
        self.assertEqual(b['recipients'][0]['to'], [{'email': 'asha@example.com'}]); self.assertEqual(b['recipients'][0]['variables']['minutes'], '5')
        self.assertRegex(b['recipients'][0]['variables']['code'], r'^[0-9]{6}$')

    def test_paid_order_texts_and_emails_once(self):
        o = self.paid(email='asha@example.com')
        self.assertEqual(self.store.notices_flush(), 1)
        sms = self.msg.to('flow')[0]['body']
        self.assertEqual(sms['template_id'], 'sms-paid')
        self.assertEqual(sms['recipients'], [{'mobiles': '919825012345', 'amount': msg91.inr(o['total']), 'order': o['id'], 'link': 'https://shop.example.com/account/orders'}])
        mail = self.msg.to('email/send')[0]['body']['recipients'][0]
        self.assertEqual(mail['to'], [{'email': 'asha@example.com', 'name': 'Preview'}]); self.assertIn('× 2', mail['variables']['items'])
        self.assertEqual(self.notices()[(o['id'], 'order_paid')], {'sms': 'sent', 'email': 'sent', 'whatsapp': 'skipped: not asked for'})
        self.assertEqual(self.store.notices_flush(), 0); self.assertEqual(len(self.msg.to('flow')), 1)

    def test_whatsapp_only_when_the_customer_asked(self):
        o = self.paid(whatsapp_updates=True)
        self.store.notices_flush()
        b = self.msg.to('whatsapp/whatsapp-outbound-message/bulk/')[0]['body']
        t = b['payload']['template']
        self.assertEqual((b['integrated_number'], t['name'], t['language']['code']), ('919274248974', 'bcc_order_paid', 'en'))
        self.assertEqual(t['to_and_components'][0]['to'], ['919825012345'])
        self.assertEqual([t['to_and_components'][0]['components']['body_%d' % i]['value'] for i in (1, 2, 3, 4)],
                         ['Preview', o['id'], msg91.inr(o['total']), 'https://shop.example.com/account/orders'])

    def test_shipping_and_cancelling(self):
        o = self.paid()
        self.store.admin(self.admin, 'order_update', {'id': o['id'], 'state': 'shipped', 'provider': 'Delhivery', 'tracking': 'AWB123456', 'remarks': 'Packed and handed over'})
        self.store.notices_flush()
        sms = self.msg.to('flow')[-1]['body']
        self.assertEqual(sms['template_id'], 'sms-shipped')
        self.assertEqual({k: sms['recipients'][0][k] for k in ('order', 'courier', 'awb')}, {'order': o['id'], 'courier': 'Delhivery', 'awb': 'AWB123456'})
        unpaid = self.order()
        self.store.admin(self.admin, 'order_update', {'id': unpaid['id'], 'state': 'cancelled', 'remarks': 'Customer asked by phone'})
        paid = self.paid()
        self.store.admin(self.admin, 'order_update', {'id': paid['id'], 'state': 'cancelled', 'remarks': 'Customer asked by phone'})
        self.store.notices_flush()
        events = {k for k in self.notices()}
        self.assertNotIn((unpaid['id'], 'order_cancelled'), events)  # never paid: no message
        self.assertIn((paid['id'], 'order_cancelled'), events)

    def test_a_message_without_a_template_or_address_is_skipped(self):
        with mock.patch.dict(os.environ, {'MSG91_SMS_ORDER_PAID': ''}):
            o = self.paid()  # no email given at checkout
            self.store.notices_flush()
        self.assertEqual(self.msg.sent, [])
        self.assertEqual(self.notices()[(o['id'], 'order_paid')]['sms'], 'skipped: no template')
        self.assertEqual(self.notices()[(o['id'], 'order_paid')]['email'], 'skipped: no email')

    def test_failure_is_recorded(self):
        o = self.paid(); self.msg.refuse = 'Insufficient balance'
        self.store.notices_flush()
        self.assertTrue(self.notices()[(o['id'], 'order_paid')]['sms'].startswith('failed: MSG91 refused the request. Insufficient balance'))

    def test_nothing_is_queued_without_the_switch_or_for_a_simulated_payment(self):
        with mock.patch.dict(os.environ, {'BCC_ORDER_MESSAGES': ''}):
            self.paid()
        o = self.order(); self.store.pay(self.guest, o['id'], {'outcome': 'success'})
        self.assertEqual(self.notices(), {}); self.assertEqual(self.store.notices_flush(), 0); self.assertEqual(self.msg.sent, [])


if __name__ == '__main__':
    unittest.main()
