from app.test_identity import fixture_identity
"""Product-page reviews, review photos, moderation and product questions."""
import http.client
import json
from pathlib import Path
import struct
import tempfile
import threading
import unittest
from http.server import ThreadingHTTPServer

from app import media
from app.server import Error, Handler, Store
from app import test_media_fixtures as fx

ORDER = {'adult': True, 'method': 'prepaid', 'contact': {'name': 'Preview Customer', 'mobile': '9876543210', 'address': '123 Sample Street', 'city': 'Surat', 'state': 'Gujarat', 'pincode': '395001'}}


class ReviewTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.store = Store(Path(self.temp.name) / 'reviews.db')
        self.admin = self.session_as('admin-a')

    def tearDown(self):
        self.temp.cleanup()

    def session_as(self, identity):
        s = self.store.session('')[0]
        fixture_identity(self.store, s, {'identity': identity})
        return self.store.session(s['id'])[0]

    def customer(self, mobile='9876543210'):
        s = self.store.session('')[0]
        code = self.store.otp(s, {'mobile': mobile})['preview_code']
        self.store.verify(s, {'mobile': mobile, 'code': code})
        return self.store.session(s['id'])[0]

    def deliver(self, s, product='iron-bisglycinate', mobile='9876543210'):
        o = self.store.order(s, {**ORDER, 'contact': {**ORDER['contact'], 'mobile': mobile}, 'items': [{'id': product, 'quantity': 1}]})
        self.store.pay(s, o['id'], {'outcome': 'success'})
        self.store.admin(self.admin, 'ship', {'id': o['id']})
        self.store.admin(self.admin, 'ship', {'id': o['id']})
        return o['id']

    def submit(self, s, **kw):
        data = {'product': 'iron-bisglycinate', 'rating': 4, 'title': 'Easy to read label', 'text': 'Arrived sealed and the capsules were easy to take.', 'display_name': 'Asha', 'incentive': 'none'}
        data.update(kw)
        return self.store.review(s, data)

    def publish(self, rid, media=None):
        with self.store.db() as c:
            self.store.moderate(c, self.admin, 'review', {'id': rid, 'decision': 'publish', 'media': media or {}})

    # ---------- Eligibility ----------
    def test_eligibility_states_are_enforced_on_the_server(self):
        guest = self.store.session('')[0]
        self.assertEqual(self.store.eligibility(guest, 'iron-bisglycinate')['state'], 'sign_in')
        with self.assertRaises(Error) as e:
            self.submit(guest)
        self.assertEqual(e.exception.status, 401)
        s = self.customer()
        self.assertEqual(self.store.eligibility(s, 'iron-bisglycinate')['state'], 'no_purchase')
        with self.assertRaises(Error) as e:
            self.submit(s)
        self.assertEqual(e.exception.status, 403)
        o = self.store.order(s, {**ORDER, 'items': [{'id': 'iron-bisglycinate', 'quantity': 1}]})
        self.store.pay(s, o['id'], {'outcome': 'success'})
        self.assertEqual(self.store.eligibility(s, 'iron-bisglycinate')['state'], 'not_delivered')
        self.store.admin(self.admin, 'ship', {'id': o['id']}); self.store.admin(self.admin, 'ship', {'id': o['id']})
        self.assertEqual(self.store.eligibility(s, 'iron-bisglycinate')['state'], 'eligible')
        # Delivered iron does not make another product reviewable.
        self.assertEqual(self.store.eligibility(s, 'l-theanine')['state'], 'no_purchase')
        self.assertEqual(self.store.eligibility(self.admin, 'iron-bisglycinate')['state'], 'operations')
        with self.assertRaises(Error):
            self.store.eligibility(s, 'not-a-product')

    def test_submission_validation_duplicates_and_idempotence(self):
        s = self.customer(); self.deliver(s)
        for bad in [{'rating': 0}, {'rating': '5'}, {'text': 'short'}, {'title': 'x'}, {'display_name': 'A'}, {'incentive': 'paid'}, {'media': 'IMG'}]:
            with self.subTest(bad=bad), self.assertRaises(Error):
                self.submit(s, **bad)
        first = self.submit(s, request_id='req-1')
        self.assertEqual(first['state'], 'pending_moderation')
        again = self.submit(s, request_id='req-1')
        self.assertTrue(again['idempotent']); self.assertEqual(again['id'], first['id'])
        with self.assertRaises(Error) as e:
            self.submit(s, request_id='req-2')
        self.assertEqual(e.exception.status, 409)
        self.assertEqual(self.store.eligibility(s, 'iron-bisglycinate')['state'], 'already_reviewed')
        # Pending reviews are not public and not counted.
        listing = self.store.public_reviews(s, {'product': ['iron-bisglycinate']})
        self.assertEqual(listing['summary']['count'], 0); self.assertEqual(listing['reviews'], [])

    def test_moderation_publishes_any_rating_and_requires_a_real_reason_to_reject(self):
        s = self.customer(); self.deliver(s)
        rid = self.submit(s, rating=1, text='Did not suit me at all, and the cap was hard to open.')['id']
        with self.store.db() as c:
            with self.assertRaises(Error):
                self.store.moderate(c, self.admin, 'review', {'id': rid, 'decision': 'reject', 'reason': 'negative'})
        self.publish(rid)
        listing = self.store.public_reviews(s, {'product': ['iron-bisglycinate']})
        self.assertEqual(listing['summary'], {'count': 1, 'average': 1.0, 'breakdown': {'5': 0, '4': 0, '3': 0, '2': 0, '1': 1}})
        review = listing['reviews'][0]
        self.assertTrue(review['verified']); self.assertEqual(review['display_name'], 'Asha'); self.assertEqual(review['incentive'], 'none')
        catalog = {p['id']: p for p in self.store.products()}
        self.assertEqual(catalog['iron-bisglycinate']['rating'], {'count': 1, 'average': 1.0})
        self.assertEqual(catalog['l-theanine']['rating'], {'count': 0, 'average': None})
        # Brand reply, then a legitimate rejection removes it from public view.
        with self.store.db() as c:
            self.store.moderate(c, self.admin, 'review_reply', {'id': rid, 'text': 'Thank you. We have opened a case about the cap.'})
        self.assertEqual(self.store.public_reviews(s, {'product': ['iron-bisglycinate']})['reviews'][0]['reply']['text'], 'Thank you. We have opened a case about the cap.')
        with self.store.db() as c:
            self.store.moderate(c, self.admin, 'review', {'id': rid, 'decision': 'reject', 'reason': 'personal_information'})
        self.assertEqual(self.store.public_reviews(s, {'product': ['iron-bisglycinate']})['summary']['count'], 0)

    def test_listing_filters_sorts_paginates_and_stays_with_its_product(self):
        ratings = [5, 2, 4, 5, 1, 3]
        for i, r in enumerate(ratings):
            mobile = '98765432' + str(10 + i)
            s = self.customer(mobile); self.deliver(s, mobile=mobile)
            self.publish(self.submit(s, rating=r, text='Review number %d about this product.' % i)['id'])
        other = self.customer('9000000001'); self.deliver(other, 'l-theanine', '9000000001')
        self.publish(self.submit(other, product='l-theanine', rating=5)['id'])
        q = lambda **k: self.store.public_reviews(other, {'product': ['iron-bisglycinate'], **{a: [str(b)] for a, b in k.items()}})
        all_ = q(size=20)
        self.assertEqual(all_['summary']['count'], 6); self.assertEqual(all_['summary']['average'], 3.3)
        self.assertEqual(all_['summary']['breakdown'], {'5': 2, '4': 1, '3': 1, '2': 1, '1': 1})
        self.assertEqual([r['rating'] for r in q(sort='highest', size=20)['reviews']], [5, 5, 4, 3, 2, 1])
        self.assertEqual([r['rating'] for r in q(sort='lowest', size=20)['reviews']], [1, 2, 3, 4, 5, 5])
        self.assertEqual([r['rating'] for r in q(rating=5, size=20)['reviews']], [5, 5])
        page = q(size=4, page=2)
        self.assertEqual((page['total'], page['pages'], len(page['reviews'])), (6, 2, 2))
        self.assertEqual(self.store.public_reviews(other, {'product': ['l-theanine']})['summary']['count'], 1)
        for bad in [{'sort': 'random'}, {'rating': '6'}, {'page': 'x'}]:
            with self.subTest(bad=bad), self.assertRaises(Error):
                self.store.public_reviews(other, {'product': ['iron-bisglycinate'], **{k: [v] for k, v in bad.items()}})

    def test_helpful_and_report_persist_once_per_person(self):
        s = self.customer(); self.deliver(s)
        rid = self.submit(s)['id']
        reader = self.store.session('')[0]
        with self.assertRaises(Error):
            self.store.helpful(reader, rid)  # not published yet
        self.publish(rid)
        with self.assertRaises(Error):
            self.store.helpful(s, rid)  # own review
        self.assertEqual(self.store.helpful(reader, rid)['helpful'], 1)
        self.assertEqual(self.store.helpful(reader, rid)['helpful'], 1)
        self.assertTrue(self.store.public_reviews(reader, {'product': ['iron-bisglycinate']})['reviews'][0]['voted'])
        with self.assertRaises(Error):
            self.store.report(reader, rid, {'reason': 'dislike'})
        self.assertEqual(self.store.report(reader, rid, {'reason': 'spam', 'note': 'Looks promotional'}), {'ok': True})
        self.assertTrue(self.store.report(reader, rid, {'reason': 'spam'})['idempotent'])
        snap = self.store.snapshot(self.admin)
        self.assertEqual(len(snap['review_reports']), 1)
        # A report does not hide the review; only moderation can.
        self.assertEqual(self.store.public_reviews(reader, {'product': ['iron-bisglycinate']})['summary']['count'], 1)

    # ---------- Photos ----------
    def test_photo_sanitising_removes_metadata_and_refuses_unsupported_files(self):
        kind, mime, ext, data, w, h = media.sanitise(fx.JPEG)
        self.assertEqual((kind, mime, w, h), ('jpeg', 'image/jpeg', 24, 16))
        for secret in [b'CameraMaker', b'SECRETNOTE']:
            self.assertNotIn(secret, data)
        self.assertEqual(media._exif_orientation(data[data.index(b'Exif'):]), 6)  # orientation alone is kept
        _, _, _, data, _, _ = media.sanitise(fx.PNG)
        self.assertNotIn(b'Private Person', data); self.assertNotIn(b'tEXt', data)
        _, _, _, data, w, h = media.sanitise(fx.WEBP)
        self.assertNotIn(b'CameraMaker', data); self.assertNotIn(b'EXIF', data); self.assertEqual((w, h), (24, 16))
        self.assertEqual(struct.unpack('<I', data[4:8])[0] + 8, len(data))
        for bad in [fx.GIF, fx.APNG, b'', b'not an image', b'\xff\xd8\xff' + b'\x00' * 10, b'<svg xmlns="http://www.w3.org/2000/svg"/>']:
            with self.subTest(bad=bad[:12]), self.assertRaises(media.MediaError):
                media.sanitise(bad)
        with self.assertRaises(media.MediaError):
            media.sanitise(fx.JPEG + b'\x00' * media.MAX_BYTES)

    def test_photos_need_an_eligible_review_and_moderation_before_publication(self):
        stranger = self.customer('9000000002')
        with self.assertRaises(Error):
            self.store.upload_media(stranger, 'iron-bisglycinate', fx.JPEG)
        s = self.customer(); self.deliver(s)
        up = self.store.upload_media(s, 'iron-bisglycinate', fx.JPEG)
        unused = self.store.upload_media(s, 'iron-bisglycinate', fx.PNG)
        self.assertEqual(self.store.delete_media(s, unused['id']), {'ok': True})
        # The uploader can see their own pending photo; nobody else can.
        self.assertEqual(self.store.media_file(s, up['id'])[0], 'image/jpeg')
        with self.assertRaises(Error):
            self.store.media_file(stranger, up['id'])
        with self.assertRaises(Error):
            self.submit(stranger, media=[up['id']])
        rid = self.submit(s, media=[up['id']])['id']
        with self.assertRaises(Error):
            self.publish(rid)  # every photo needs a decision
        self.publish(rid, {up['id']: 'approve'})
        mime, body, public = self.store.media_file(stranger, up['id'])
        self.assertTrue(public); self.assertNotIn(b'CameraMaker', body)
        self.assertEqual(self.store.public_reviews(stranger, {'product': ['iron-bisglycinate']})['reviews'][0]['media'][0]['id'], up['id'])

    # ---------- Questions ----------
    def test_questions_are_private_support_cases_until_an_official_answer_is_published(self):
        guest = self.store.session('')[0]
        with self.assertRaises(Error):
            self.store.question(guest, {'product': 'psyllium-husk', 'question': 'short'})
        q = self.store.question(guest, {'product': 'psyllium-husk', 'question': 'Is the husk powder or capsules in this pack?'})
        self.assertEqual(self.store.public_questions({'product': ['psyllium-husk']})['questions'], [])
        case = self.store.snapshot(guest)['cases'][0]
        self.assertEqual((case['kind'], case['product']), ('product_question', 'psyllium-husk'))
        with self.store.db() as c:
            with self.assertRaises(Error):
                self.store.moderate(c, self.admin, 'question', {'id': q['id'], 'answer': 'x', 'publish': True})
            self.store.moderate(c, self.admin, 'question', {'id': q['id'], 'answer': 'Psyllium Husk is sold as capsules.', 'publish': True})
        published = self.store.public_questions({'product': ['psyllium-husk']})['questions']
        self.assertEqual(published[0]['answer'], 'Psyllium Husk is sold as capsules.')
        self.assertEqual(self.store.public_questions({'product': ['l-theanine']})['questions'], [])


class ReviewHttpTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory(); Handler.store = Store(Path(cls.temp.name) / 'http.db')
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), Handler); cls.port = cls.server.server_port
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True); cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown(); cls.server.server_close(); cls.thread.join(); cls.temp.cleanup()

    def request(self, method, path, body=None, headers=None, raw=False):
        h = {'Content-Type': 'application/json'}
        if hasattr(self, 'cookie'):
            h['Cookie'] = self.cookie; h['X-CSRF-Token'] = self.csrf
        h.update(headers or {})
        conn = http.client.HTTPConnection('127.0.0.1', self.port)
        conn.request(method, path, body if raw else (json.dumps(body) if body is not None else None), h)
        r = conn.getresponse(); data = r.read()
        return r.status, dict(r.getheaders()), data

    def setUp(self):
        status, headers, body = self.request('GET', '/api/session')
        self.cookie = headers['Set-Cookie'].split(';')[0]; self.csrf = json.loads(body)['csrf']

    def test_review_endpoints_end_to_end(self):
        store = Handler.store
        self.assertEqual(json.loads(self.request('GET', '/api/reviews/eligibility?product=iron-bisglycinate')[2])['state'], 'sign_in')
        code = json.loads(self.request('POST', '/api/auth/otp', {'mobile': '9811111111'})[2])['preview_code']
        self.assertEqual(self.request('POST', '/api/auth/verify', {'mobile': '9811111111', 'code': code})[0], 200)
        order = json.loads(self.request('POST', '/api/orders', {**ORDER, 'contact': {**ORDER['contact'], 'mobile': '9811111111'}, 'items': [{'id': 'iron-bisglycinate', 'quantity': 1}]})[2])
        self.request('POST', f"/api/orders/{order['id']}/pay", {'outcome': 'success'})
        admin = store.session('')[0]; fixture_identity(store, admin, {'identity': 'admin-a'}); admin = store.session(admin['id'])[0]
        store.admin(admin, 'ship', {'id': order['id']}); store.admin(admin, 'ship', {'id': order['id']})
        self.assertEqual(json.loads(self.request('GET', '/api/reviews/eligibility?product=iron-bisglycinate')[2])['state'], 'eligible')
        # Upload: CSRF required, type detected from bytes, oversize refused before reading.
        self.assertEqual(self.request('POST', '/api/review-media?product=iron-bisglycinate', fx.JPEG, {'Content-Type': 'image/jpeg', 'X-CSRF-Token': 'wrong'}, raw=True)[0], 403)
        self.assertEqual(self.request('POST', '/api/review-media?product=iron-bisglycinate', fx.GIF, {'Content-Type': 'image/jpeg'}, raw=True)[0], 415)
        self.assertEqual(self.request('POST', '/api/review-media?product=iron-bisglycinate', None, {'Content-Type': 'image/jpeg', 'Content-Length': str(media.MAX_BYTES + 1)}, raw=True)[0], 413)
        status, _, body = self.request('POST', '/api/review-media?product=iron-bisglycinate', fx.JPEG, {'Content-Type': 'application/octet-stream'}, raw=True)
        self.assertEqual(status, 200); img = json.loads(body)
        status, headers, body = self.request('GET', '/api/review-media/' + img['id'])
        self.assertEqual((status, headers['Content-Type'], headers['X-Content-Type-Options']), (200, 'image/jpeg', 'nosniff'))
        self.assertIn('no-store', headers['Cache-Control']); self.assertNotIn(b'CameraMaker', body)
        review = {'product': 'iron-bisglycinate', 'rating': 5, 'title': 'Clear details', 'text': 'Exactly what the page described.', 'display_name': 'R.', 'incentive': 'free_product', 'media': [img['id']], 'request_id': 'r1'}
        status, _, body = self.request('POST', '/api/reviews', review)
        self.assertEqual(status, 200); rid = json.loads(body)['id']
        self.assertTrue(json.loads(self.request('POST', '/api/reviews', review)[2])['idempotent'])
        store.admin(admin, 'review', {'id': rid, 'decision': 'publish', 'media': {img['id']: 'approve'}})
        listing = json.loads(self.request('GET', '/api/reviews?product=iron-bisglycinate&sort=highest&rating=5')[2])
        self.assertEqual(listing['summary']['count'], 1)
        self.assertEqual((listing['reviews'][0]['incentive'], listing['reviews'][0]['own']), ('free_product', True))
        self.assertEqual(self.request('POST', f'/api/reviews/{rid}/helpful', {})[0], 403)  # own review
        self.assertEqual(self.request('POST', f'/api/reviews/{rid}/report', {'reason': 'spam'})[0], 200)
        q = self.request('POST', '/api/questions', {'product': 'iron-bisglycinate', 'question': 'Is the capsule shell vegetarian?'})
        self.assertEqual(q[0], 200)
        self.assertEqual(json.loads(self.request('GET', '/api/questions?product=iron-bisglycinate')[2])['questions'], [])
        catalog = json.loads(self.request('GET', '/api/catalog')[2])
        self.assertEqual({p['id']: p['rating']['count'] for p in catalog['products']}['iron-bisglycinate'], 1)


if __name__ == '__main__':
    unittest.main()
