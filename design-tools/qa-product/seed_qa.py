"""Create clearly labelled QA records through the real preview API, for checking the published-review display.

Run against a disposable QA database only, never a shared preview:
    python3 app/server.py --port 4174 --db /tmp/bcc-qa.sqlite3
    python3 design-tools/qa-product/seed_qa.py http://127.0.0.1:4174

Every record goes through the same server rules a customer meets: OTP sign-in, checkout, preview payment, Admin
shipment and delivery, then review submission (with photos) and Admin moderation. Display names and text are
marked "QA" so the records can never be mistaken for customer reviews.
"""
import http.client
import json
import sys
from urllib.parse import urlparse

sys.path.insert(0, __file__.rsplit('/design-tools/', 1)[0])
from app import test_media_fixtures as fx  # noqa: E402

BASE = urlparse(sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:4174')
ADDRESS = {'name': 'QA Tester', 'address': 'QA address only', 'city': 'Surat', 'state': 'Gujarat', 'pincode': '395001'}


class Client:
    def __init__(self):
        self.cookie = ''
        self.csrf = ''
        s = self.call('GET', '/api/session')
        self.csrf = s['csrf']

    def call(self, method, path, data=None, raw=None, ctype='application/json'):
        conn = http.client.HTTPConnection(BASE.hostname, BASE.port)
        headers = {'Content-Type': ctype, 'X-CSRF-Token': self.csrf}
        if self.cookie:
            headers['Cookie'] = self.cookie
        body = raw if raw is not None else (json.dumps(data) if data is not None else None)
        conn.request(method, path, body, headers)
        r = conn.getresponse()
        out = r.read()
        c = r.getheader('Set-Cookie')
        if c:
            self.cookie = c.split(';')[0]
        value = json.loads(out)
        if r.status != 200:
            raise RuntimeError(f'{method} {path}: {r.status} {value}')
        return value

    def sign_in(self, mobile):
        code = self.call('POST', '/api/auth/otp', {'mobile': mobile})['preview_code']
        self.call('POST', '/api/auth/verify', {'mobile': mobile, 'code': code})
        self.csrf = self.call('GET', '/api/session')['csrf']


def main():
    admin = Client()
    admin.call('POST', '/api/demo/login', {'identity': 'admin-a'})
    admin.csrf = admin.call('GET', '/api/session')['csrf']
    plan = [
        ('9100000001', 'iron-bisglycinate', 5, 'QA test: arrived sealed', 'QA test review. The pack arrived sealed and the label was easy to read.', 'none', [fx.JPEG], 'publish'),
        ('9100000002', 'iron-bisglycinate', 2, 'QA test: cap was stiff', 'QA test review. The cap was stiff to open the first time. Testing a low rating.', 'free_product', [], 'publish'),
        ('9100000003', 'iron-bisglycinate', 4, 'QA test: clear details', 'QA test review. Product page details matched what arrived.', 'none', [fx.PNG], 'publish'),
        ('9100000004', 'iron-bisglycinate', 1, 'QA test: rejected example', 'QA test review that includes a phone number 9100000004, so moderation rejects it.', 'none', [], 'reject'),
        ('9100000005', 'iron-bisglycinate', 3, 'QA test: pending example', 'QA test review left waiting for moderation.', 'none', [], None),
        ('9100000006', 'iron-bisglycinate', 5, 'QA test: second page', 'QA test review used to check Load more.', 'other', [], 'publish'),
        ('9100000007', 'iron-bisglycinate', 4, 'QA test: another', 'QA test review used to check sorting.', 'none', [], 'publish'),
        ('9100000008', 'iron-bisglycinate', 5, 'QA test: sixth', 'QA test review used to check pagination.', 'none', [], 'publish'),
    ]
    first_published = None
    for mobile, product, rating, title, text, incentive, photos, decision in plan:
        c = Client()
        c.sign_in(mobile)
        order = c.call('POST', '/api/orders', {'adult': True, 'method': 'prepaid', 'contact': {**ADDRESS, 'mobile': mobile}, 'items': [{'id': product, 'quantity': 1}]})
        c.call('POST', f"/api/orders/{order['id']}/pay", {'outcome': 'success'})
        admin.call('POST', '/api/admin/ship', {'id': order['id']})
        admin.call('POST', '/api/admin/ship', {'id': order['id']})
        media = [c.call('POST', f'/api/review-media?product={product}', raw=img, ctype='application/octet-stream')['id'] for img in photos]
        rid = c.call('POST', '/api/reviews', {'product': product, 'rating': rating, 'title': title, 'text': text, 'display_name': 'QA tester ' + mobile[-1],
                                              'incentive': incentive, 'media': media, 'request_id': 'qa-' + mobile})['id']
        if decision == 'publish':
            admin.call('POST', '/api/admin/review', {'id': rid, 'decision': 'publish', 'media': {m: 'approve' for m in media}})
            first_published = first_published or rid
        elif decision == 'reject':
            admin.call('POST', '/api/admin/review', {'id': rid, 'decision': 'reject', 'reason': 'personal_information'})
    admin.call('POST', '/api/admin/review_reply', {'id': first_published, 'text': 'QA test reply from the brand account.'})
    asker = Client()
    q = asker.call('POST', '/api/questions', {'product': 'iron-bisglycinate', 'question': 'QA test question: is the pack resealable?'})
    admin.call('POST', '/api/admin/question', {'id': q['id'], 'answer': 'QA test answer. Placeholder text for checking the layout only.', 'publish': True})
    print(json.dumps(admin.call('GET', '/api/reviews?product=iron-bisglycinate&size=20')['summary']))


if __name__ == '__main__':
    main()
