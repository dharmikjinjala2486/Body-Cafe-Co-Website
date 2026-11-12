"""Shipneer and stock, end to end, against a fake Shipneer: no request leaves this machine."""
import http.client
import json
import os
import tempfile
import threading
import time
import unittest
from http.server import ThreadingHTTPServer
from pathlib import Path
from unittest import mock
from urllib.parse import urlparse, parse_qs

from app import shipping
from app.server import Store, Handler, Error


class FakeShipneer:
    def __init__(self):
        self.calls, self.status, self.label_fails = [], 'In Transit', 0

    def __call__(self, req, timeout=30):
        url = urlparse(req.full_url)
        endpoint = url.path.rsplit('/', 1)[1]
        body = json.loads(req.data) if req.data else None
        self.calls.append((endpoint, body, parse_qs(url.query), dict(req.header_items())))
        reply, ctype = {'status': 'success'}, 'application/json'
        if endpoint in ('add_order', 'rate_calculator'):
            reply = {'status': 'success', 'chargeable_weight': 0.5, 'courier_list': [
                {'courier_name': 'BlueDart 0.5Kg', 'courier_code': 'CODE-BD', 'rate': {'price': 63.5, 'gst': 11.5, 'rate': 75.0}},
                {'courier_name': 'Xpressbees 0.5Kg', 'courier_code': 'CODE-XB', 'rate': {'price': 43.2, 'gst': 7.8, 'rate': 51.0}}]}
        elif endpoint == 'book_parcel':
            name = 'BlueDart' if body['book_code'] == 'CODE-BD' else 'Xpressbees'
            reply = {'status': 'success', 'order_id': body['order_id'], 'awb_number': '375212486387', 'courier_name': name,
                     'shipneer_ordref': 'REF123', 'courier_charge': '75.0', 'tracking_link': 'https://x?u=SECRET', 'label_print': 'https://x?u=SECRET'}
        elif endpoint == 'track_parcel':
            reply = {'success': True, 'data': {'awb': '375212486387', 'courier': 'BlueDart', 'status': self.status, 'tracking': [
                {'datetime': '04/11/26 19:29:00', 'location': 'VARANASI', 'notes': self.status},
                {'datetime': '02/11/26 10:46:27', 'location': '', 'notes': 'Shipping Label Generated'}]}}
        elif endpoint == 'print_label':
            if self.label_fails:
                self.label_fails -= 1
                raise shipping.urllib.error.HTTPError(req.full_url, 500, 'err', {'Content-Type': 'text/html'}, None)
            reply, ctype = b'%PDF-1.4 label', 'application/pdf'
        raw = reply if isinstance(reply, bytes) else json.dumps(reply).encode()
        resp = mock.MagicMock()
        resp.__enter__.return_value = resp
        resp.read.return_value = raw
        resp.headers = {'Content-Type': ctype}
        return resp


ADDRESS = {'name': 'Test buyer', 'mobile': '9876543210', 'address': '704, HG Heights, XYZ road, near ABC circle',
           'city': 'Vadodara', 'state': 'gujarat', 'pincode': '390001', 'email': 'buyer@example.com'}


class Base(unittest.TestCase):
    def setUp(self):
        self.env = mock.patch.dict(os.environ, {'SHIPNEER_API_KEY': 'test-key', 'SHIPNEER_PICKUP_ID': 'PICKUP-1'}); self.env.start()
        self.fake = FakeShipneer()
        self.net = mock.patch('urllib.request.urlopen', self.fake); self.net.start()
        self.sleep = mock.patch.object(shipping.time, 'sleep', lambda s: None); self.sleep.start()
        self.tmp = tempfile.TemporaryDirectory()
        self.store = Store(Path(self.tmp.name) / 'ship.db')
        self.store.setup_admin('owner.example', 'fixture-password-123')
        login = self.store.admin_signin(self.store.session('')[0], {'username': 'owner.example', 'password': 'fixture-password-123'})
        self.admin = self.store.session(login['_sid'])[0]
        self.customer = self.store.session('')[0]
        with self.store.db() as c:
            c.execute("UPDATE batches SET state='released',proof=1")

    def tearDown(self):
        self.sleep.stop(); self.net.stop(); self.env.stop(); self.tmp.cleanup()

    def paid_order(self, qty=2, **contact):
        o = self.store.order(self.customer, {'adult': True, 'items': [{'id': 'l-theanine', 'quantity': qty}], 'contact': {**ADDRESS, **contact}})
        self.store.pay(self.customer, o['id'], {'outcome': 'success'})
        return o['id']

    def get(self, oid):
        return next(o for o in self.store.snapshot(self.admin)['orders'] if o['id'] == oid)

    def batches(self):
        return {b['id']: b for b in self.store.snapshot(self.admin)['batches'] if b['product'] == 'l-theanine'}

    def book(self, oid, code='CODE-BD', **extra):
        self.store.admin(self.admin, 'ship_quote', {'id': oid})
        return self.store.admin(self.admin, 'ship_book', {'id': oid, 'code': code, **extra})


class StateTests(Base):
    def test_states_are_exact_names_or_codes(self):
        for typed, code in [('Gujarat', 'GJ'), ('GUJARAT', 'GJ'), ('gj', 'GJ'), ('Tamil Nadu', 'TN'), ('Orissa', 'OR'), ('Jammu & Kashmir', 'JK')]:
            self.assertEqual(shipping.state_code(typed), code, typed)
        for typo in ('Gujrat', 'Maharastra', 'Kansas', ''):
            with self.assertRaises(Error): shipping.state_code(typo)

    def test_checkout_stores_the_proper_state_name_and_refuses_unknown_ones(self):
        oid = self.paid_order(state='GUJARAT')
        self.assertEqual(self.get(oid)['contact']['state'], 'Gujarat')
        with self.assertRaises(Error) as e:
            self.store.order(self.customer, {'adult': True, 'items': [{'id': 'l-theanine', 'quantity': 1}], 'contact': {**ADDRESS, 'state': 'Gujrat'}})
        self.assertEqual(e.exception.extra.get('field'), 'state')


class BookingTests(Base):
    def test_prices_are_sent_correctly_and_listed_cheapest_first(self):
        oid = self.paid_order()
        couriers = self.store.admin(self.admin, 'ship_quote', {'id': oid})['couriers']
        self.assertEqual([x['code'] for x in couriers], ['CODE-XB', 'CODE-BD'])
        endpoint, body, _, headers = self.fake.calls[0]
        self.assertEqual(endpoint, 'add_order')
        self.assertEqual(headers.get('X-api-key'), 'test-key')
        self.assertIsInstance(body['order']['order_id'], int)
        self.assertEqual(body['order']['order_number'], oid)
        self.assertEqual((body['pickup_id'], body['delivery']['state'], body['delivery']['phone']), ('PICKUP-1', 'GJ', '919876543210'))
        self.assertEqual((body['order']['shipment_type'], body['order']['cod_collect']), ('P', 0))
        self.assertEqual((body['weight'], body['length'], body['width'], body['height']), (0.4, 15, 10, 8))
        self.assertFalse([c for c in self.fake.calls if c[0] == 'book_parcel'])  # getting prices books nothing

    def test_staff_choose_the_courier(self):
        oid = self.paid_order()
        with self.assertRaises(Error): self.store.admin(self.admin, 'ship_book', {'id': oid, 'code': 'CODE-BD'})  # no prices yet
        self.store.admin(self.admin, 'ship_quote', {'id': oid})
        with self.assertRaises(Error): self.store.admin(self.admin, 'ship_book', {'id': oid, 'code': ''})  # nothing chosen
        r = self.store.admin(self.admin, 'ship_book', {'id': oid, 'code': 'CODE-BD'})  # not the cheapest: staff's choice
        self.assertEqual(r['courier'], 'BlueDart')
        self.assertEqual([c[1]['book_code'] for c in self.fake.calls if c[0] == 'book_parcel'], ['CODE-BD'])
        o = self.get(oid)
        self.assertEqual((o['state'], o['provider'], o['tracking'], o['shipneer']['ordref']), ('shipped', 'BlueDart', '375212486387', 'REF123'))
        self.assertNotIn('SECRET', json.dumps(o))  # Shipneer's own links carry the API key and are never stored

    def test_each_price_request_uses_a_new_number_and_booking_uses_the_latest(self):
        oid = self.paid_order()
        self.store.admin(self.admin, 'ship_quote', {'id': oid})
        self.store.admin(self.admin, 'ship_quote', {'id': oid})
        self.store.admin(self.admin, 'ship_book', {'id': oid, 'code': 'CODE-XB'})
        ids = [c[1]['order']['order_id'] for c in self.fake.calls if c[0] == 'add_order']
        self.assertEqual(len(set(ids)), 2)
        self.assertEqual([c[1]['order_id'] for c in self.fake.calls if c[0] == 'book_parcel'], [ids[1]])

    def test_an_order_cannot_be_booked_twice(self):
        oid = self.paid_order()
        self.book(oid, request_id='book-request-0001')
        self.assertTrue(self.store.admin(self.admin, 'ship_book', {'id': oid, 'code': 'CODE-BD', 'request_id': 'book-request-0001'}).get('idempotent'))
        with self.assertRaises(Error): self.store.admin(self.admin, 'ship_book', {'id': oid, 'code': 'CODE-BD'})
        with self.assertRaises(Error): self.store.admin(self.admin, 'ship_quote', {'id': oid})
        self.assertEqual(sum(1 for c in self.fake.calls if c[0] == 'book_parcel'), 1)

    def test_two_clicks_at_once_book_once(self):
        oid = self.paid_order()
        self.store.admin(self.admin, 'ship_quote', {'id': oid})
        errors = []
        def click():
            try: self.store.admin(self.admin, 'ship_book', {'id': oid, 'code': 'CODE-BD'})
            except Error as e: errors.append(str(e))
        threads = [threading.Thread(target=click) for _ in range(2)]
        for t in threads: t.start()
        for t in threads: t.join()
        self.assertEqual(sum(1 for c in self.fake.calls if c[0] == 'book_parcel'), 1)
        self.assertEqual(len(errors), 1)

    def test_old_prices_and_unreleased_batches_are_refused(self):
        oid = self.paid_order()
        self.store.admin(self.admin, 'ship_quote', {'id': oid})
        with self.store.db() as c:
            r = c.execute('SELECT data FROM orders WHERE id=?', (oid,)).fetchone(); p = json.loads(r[0])
            p['shipneer']['quoted'] -= 7 * 3600
            c.execute('UPDATE orders SET data=? WHERE id=?', (json.dumps(p), oid))
        with self.assertRaises(Error): self.store.admin(self.admin, 'ship_book', {'id': oid, 'code': 'CODE-BD'})
        with self.store.db() as c: c.execute("UPDATE batches SET state='quarantined'")
        with self.assertRaises(Error): self.store.admin(self.admin, 'ship_quote', {'id': oid})

    def test_customer_sees_tracking_but_no_provider_details(self):
        oid = self.paid_order(); self.book(oid)
        mine = next(x for x in self.store.account_view(self.customer)['orders'] if x['id'] == oid)
        self.assertEqual(mine['tracking'], '375212486387')
        self.assertNotIn('shipneer', mine)

    def test_manual_changes_are_blocked_while_booked(self):
        oid = self.paid_order(); self.book(oid)
        for state in ('cancelled', 'shipped', 'packing'):
            with self.assertRaises(Error): self.store.admin(self.admin, 'order_update', {'id': oid, 'state': state, 'remarks': 'Trying a manual change.'})
        with self.assertRaises(Error): self.store.cancel(self.customer, oid)  # customers can't cancel a booked parcel

    def test_not_configured(self):
        oid = self.paid_order()
        with mock.patch.dict(os.environ, {'SHIPNEER_API_KEY': ''}), mock.patch.object(shipping, '_env_file', lambda: {}):
            self.assertFalse(shipping.configured())
            with self.assertRaises(Error): self.store.admin(self.admin, 'ship_quote', {'id': oid})


class StockTests(Base):
    """Stock and shipping stay in step: reserve at checkout, leave on booking, back on cancel or return."""
    def test_stock_through_checkout_booking_and_delivery(self):
        start = self.batches()
        avail0, onhand0 = sum(b['available'] for b in start.values()), sum(b['on_hand'] for b in start.values())
        oid = self.paid_order(qty=2)
        mid = self.batches()
        self.assertEqual(sum(b['available'] for b in mid.values()), avail0 - 2)  # reserved at checkout
        self.assertEqual(sum(b['on_hand'] for b in mid.values()), onhand0)      # still on the shelf
        self.assertEqual(sum(b['reserved'] for b in mid.values()), 2)
        self.book(oid)
        after = self.batches()
        self.assertEqual(sum(b['on_hand'] for b in after.values()), onhand0 - 2)  # left the warehouse
        self.assertEqual(sum(b['reserved'] for b in after.values()), 0)
        moves = [m for m in self.store.snapshot(self.admin)['movements'] if m['kind'] == 'ship']
        self.assertEqual(sum(m['quantity'] for m in moves), -2)
        self.assertIn(oid, moves[0]['reason'])
        self.fake.status = 'Delivered'
        self.store.admin(self.admin, 'ship_track', {'id': oid})
        self.assertEqual(self.get(oid)['state'], 'delivered')
        self.assertEqual(sum(b['on_hand'] for b in self.batches().values()), onhand0 - 2)  # delivery changes no stock

    def test_cancelled_booking_puts_units_back_in_packing(self):
        onhand0 = sum(b['on_hand'] for b in self.batches().values())
        oid = self.paid_order(qty=1); self.book(oid)
        with self.assertRaises(Error): self.store.admin(self.admin, 'ship_cancel', {'id': oid, 'remarks': 'x'})
        self.store.admin(self.admin, 'ship_cancel', {'id': oid, 'remarks': 'Wrong parcel size.'})
        o = self.get(oid)
        self.assertEqual((o['state'], o['tracking']), ('packing', None))
        self.assertEqual([c[1] for c in self.fake.calls if c[0] == 'cancel_shipment'], [{'cancel_order': 'REF123'}])
        self.assertEqual(sum(b['on_hand'] for b in self.batches().values()), onhand0)  # back on the shelf, still reserved
        self.assertEqual(sum(m['quantity'] for m in self.store.snapshot(self.admin)['movements'] if m['kind'] in ('ship', 'unship')), 0)
        self.book(oid, code='CODE-XB')  # and it can be booked again
        self.assertEqual(self.get(oid)['provider'], 'Xpressbees')

    def test_returned_parcel_goes_back_into_stock(self):
        avail0 = sum(b['available'] for b in self.batches().values())
        oid = self.paid_order(qty=2); self.book(oid)
        with self.assertRaises(Error): self.store.admin(self.admin, 'ship_restock', {'id': oid, 'remarks': 'Box intact, seal unbroken.'})
        self.fake.status = 'RTO Delivered'
        self.store.admin(self.admin, 'ship_track', {'id': oid})
        o = self.get(oid)
        self.assertEqual(o['state'], 'shipped')  # a return is never treated as a delivery
        self.assertTrue(o['shipneer']['returned'])
        self.store.admin(self.admin, 'ship_restock', {'id': oid, 'remarks': 'Box intact, seal unbroken.'})
        o = self.get(oid)
        self.assertEqual((o['state'], o['refund']), ('cancelled', 'pending_refund'))
        self.assertEqual(sum(b['available'] for b in self.batches().values()), avail0)  # sellable again
        self.assertEqual(sum(m['quantity'] for m in self.store.snapshot(self.admin)['movements'] if m['kind'] == 'return'), 2)
        with self.assertRaises(Error): self.store.admin(self.admin, 'ship_restock', {'id': oid, 'remarks': 'Box intact, seal unbroken.'})
        self.store.admin(self.admin, 'refund', {'id': oid, 'remarks': 'Refund for the returned parcel.'})
        self.assertEqual(sum(b['available'] for b in self.batches().values()), avail0)  # the refund doesn't restock twice


class TrackingAndLabelTests(Base):
    def test_hourly_check_updates_tracking_and_closes_delivered_orders(self):
        oid = self.paid_order(); self.book(oid)
        self.fake.status = 'Delivered'
        self.assertEqual(self.store.shipping_tick(), 1)
        self.assertEqual(self.store.shipping_tick(), 0)  # delivered: nothing left to check
        o = self.get(oid)
        self.assertEqual(o['state'], 'delivered')
        self.assertEqual(o['tracking_events'][0]['location'], 'Varanasi')
        self.assertEqual(o['tracking_events'][0]['at'], 1793800740)  # 4 Nov 2026 19:29 IST
        self.store.account_view(self.customer)
        self.assertEqual(sum(1 for c in self.fake.calls if c[0] == 'track_parcel'), 1)  # page views never call Shipneer

    def test_label_is_admin_only_and_retries_once(self):
        oid = self.paid_order(); self.book(oid)
        self.fake.label_fails = 1
        self.assertEqual(self.store.shipping_label(self.admin, oid), ('application/pdf', b'%PDF-1.4 label'))
        self.assertEqual(sum(1 for c in self.fake.calls if c[0] == 'print_label'), 2)
        self.assertEqual(self.fake.calls[-1][2]['ord'], ['REF123'])
        with self.assertRaises(Error): self.store.shipping_label(self.customer, oid)

    def test_label_failure_message_is_readable(self):
        oid = self.paid_order(); self.book(oid)
        self.fake.label_fails = 2
        with self.assertRaises(Error) as e: self.store.shipping_label(self.admin, oid)
        self.assertIn('Shipneer dashboard', str(e.exception))



class DeliveryCheckTests(Base):
    def setUp(self):
        super().setUp(); shipping._cache.clear(); shipping._checks.clear()

    def test_deliverable_pincode_with_estimate_and_one_shipneer_call_per_day(self):
        r = shipping.delivery_check('visitor', '394210')
        self.assertEqual((r['status'], r['days']), ('yes', [2, 3]))
        shipping.delivery_check('other-visitor', '394210')
        rate_calls = [c for c in self.fake.calls if c[0] == 'rate_calculator']
        self.assertEqual(len(rate_calls), 1)  # cached
        self.assertEqual((rate_calls[0][1]['destination_pin'], rate_calls[0][1]['pickup_pin']), ('394210', '391243'))
        self.assertFalse([c for c in self.fake.calls if c[0] in ('add_order', 'book_parcel')])  # a check never creates an order

    def test_undeliverable_and_unreachable(self):
        with mock.patch.object(shipping, 'rates', side_effect=Error('Shipneer: Invalid destination_pin', 502)):
            self.assertEqual(shipping.delivery_check('v', '999999')['status'], 'no')
        with mock.patch.object(shipping, 'rates', side_effect=Error('Shipneer could not be reached. Try again in a minute.', 502)):
            self.assertEqual(shipping.delivery_check('v', '400001')['status'], 'unknown')
        self.assertNotIn('400001', shipping._cache)  # an outage is never cached as an answer
        with self.assertRaises(Error): shipping.delivery_check('v', '012345')

    def test_estimates_by_region(self):
        for pin, days in [('390001', (2, 3)), ('400001', (3, 5)), ('110001', (4, 6)), ('781001', (5, 8)), ('744101', (5, 8)), ('190001', (5, 8))]:
            self.assertEqual(shipping.delivery_days(pin), days, pin)

    def test_visitors_are_limited(self):
        with mock.patch.object(shipping, 'rates', return_value=[{'name': 'X'}]):
            for n in range(shipping.CHECK_LIMIT): shipping.delivery_check('busy', str(400000 + n))
            with self.assertRaises(Error): shipping.delivery_check('busy', '499999')


class HttpEndToEndTests(unittest.TestCase):
    """Through the real web routes: checkout, payment, prices, booking, label, stock, customer view, delivery."""
    def setUp(self):
        self.env = mock.patch.dict(os.environ, {'SHIPNEER_API_KEY': 'test-key', 'SHIPNEER_PICKUP_ID': 'PICKUP-1'}); self.env.start()
        self.fake = FakeShipneer(); self.net = mock.patch('urllib.request.urlopen', self.fake); self.net.start()
        self.tmp = tempfile.TemporaryDirectory()
        Handler.store = self.store = Store(Path(self.tmp.name) / 'http.db')
        self.store.setup_admin('owner.example', 'fixture-password-123')
        with self.store.db() as c: c.execute("UPDATE batches SET state='released',proof=1")
        self.server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True); self.thread.start()

    def tearDown(self):
        self.server.shutdown(); self.server.server_close(); self.thread.join()
        self.net.stop(); self.env.stop(); self.tmp.cleanup()

    def call(self, who, method, path, data=None):
        h = {'Content-Type': 'application/json'}
        if who.get('cookie'): h.update({'Cookie': who['cookie'], 'X-CSRF-Token': who['csrf']})
        conn = http.client.HTTPConnection('127.0.0.1', self.server.server_port)
        conn.request(method, path, json.dumps(data) if data is not None else None, h)
        r = conn.getresponse(); body = r.read(); headers = dict(r.getheaders()); conn.close()
        if 'Set-Cookie' in headers: who['cookie'] = headers['Set-Cookie'].split(';')[0]
        return r.status, headers, body

    def session(self, path):
        who = {}
        who['csrf'] = json.loads(self.call(who, 'GET', path)[2])['csrf']
        return who

    def test_checkout_to_delivery(self):
        customer = self.session('/api/session')
        bad = dict(name='Web buyer', mobile='9876543210', address='12 Market road', city='Pune', state='Maharastra', pincode='411001')
        status, _, body = self.call(customer, 'POST', '/api/orders', {'adult': True, 'items': [{'id': 'l-theanine', 'quantity': 1}], 'contact': bad})
        self.assertEqual(status, 400); self.assertIn(b'state', body)
        status, _, body = self.call(customer, 'POST', '/api/orders', {'adult': True, 'items': [{'id': 'l-theanine', 'quantity': 1}], 'contact': {**bad, 'state': 'Maharashtra'}})
        self.assertEqual(status, 200, body); oid = json.loads(body)['id']
        self.assertEqual(self.call(customer, 'POST', f'/api/orders/{oid}/pay', {'outcome': 'success'})[0], 200)

        admin = self.session('/api/admin/session')
        self.assertEqual(self.call(admin, 'POST', '/api/admin/login', {'username': 'owner.example', 'password': 'fixture-password-123'})[0], 200)
        admin['csrf'] = json.loads(self.call(admin, 'GET', '/api/admin/session')[2])['csrf']
        snap = lambda: json.loads(self.call(admin, 'GET', '/api/admin')[2])
        order = lambda: next(o for o in snap()['orders'] if o['id'] == oid)
        time.sleep(0.3)
        self.assertEqual(order()['state'], 'paid')  # nothing is booked without staff
        self.assertFalse(self.fake.calls)
        onhand = lambda: sum(b['on_hand'] for b in snap()['batches'] if b['product'] == 'l-theanine')
        before = onhand()

        status, _, body = self.call(admin, 'POST', '/api/admin/ship_quote', {'id': oid, 'weight_g': 300, 'length': 15, 'width': 10, 'height': 8})
        self.assertEqual(status, 200, body)
        self.assertEqual(self.call(admin, 'POST', '/api/admin/ship_book', {'id': oid, 'code': 'CODE-XB', 'request_id': 'web-book-000000001'})[0], 200)
        self.assertEqual((order()['state'], order()['provider']), ('shipped', 'Xpressbees'))
        self.assertEqual(onhand(), before - 1)
        add = next(c for c in self.fake.calls if c[0] == 'add_order')[1]
        self.assertEqual((add['delivery']['state'], add['order']['order_number'], add['weight']), ('MH', oid, 0.3))

        status, headers, body = self.call(admin, 'GET', f'/api/admin/shipping-label/{oid}')
        self.assertEqual((status, headers['Content-Type'], body), (200, 'application/pdf', b'%PDF-1.4 label'))
        self.assertNotEqual(self.call(dict(customer), 'GET', f'/api/admin/shipping-label/{oid}')[0], 200)  # a copy: the reply sets an admin cookie

        account = self.call(customer, 'GET', '/api/account')[2]
        self.assertNotIn(b'test-key', account); self.assertNotIn(b'REF123', account)
        mine = next(o for o in json.loads(account)['orders'] if o['id'] == oid)
        self.assertEqual(mine['tracking'], '375212486387')

        self.fake.status = 'Delivered'
        self.assertEqual(self.call(admin, 'POST', '/api/admin/ship_track', {'id': oid})[0], 200)
        mine = next(o for o in json.loads(self.call(customer, 'GET', '/api/account')[2])['orders'] if o['id'] == oid)
        self.assertEqual(mine['state'], 'delivered')


if __name__ == '__main__':
    unittest.main()
