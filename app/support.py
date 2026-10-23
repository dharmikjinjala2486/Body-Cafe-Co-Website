"""Support and policy back end: help feedback, case follow-up, order-aware cancellation checks, return and
replacement requests, privacy requests and a personal-data export.

Everything here reuses the existing support-case table (cases) and order records, so Operations sees one inbox.
Nothing sends an email, SMS or WhatsApp message: no messaging provider is connected.
"""
import json
import re
import secrets
import time

try:
    from app.errors import Error
except ImportError:  # run as a script from app/
    from errors import Error

SCHEMA = """
CREATE TABLE IF NOT EXISTS help_feedback(session TEXT, article TEXT, helpful INTEGER, reason TEXT, created INTEGER,
  PRIMARY KEY(session, article));
"""

ARTICLE_ID = re.compile(r'[a-z0-9][a-z0-9-]{1,60}')
FEEDBACK_REASONS = ('unclear', 'incomplete', 'not_my_question', 'outdated')

# Contact topics and the queue each one lands in. Order issues, product questions, product safety and business
# enquiries are routed separately; safety is always a priority case.
QUEUES = {
    'general': 'General', 'delivery': 'Orders · delivery', 'return': 'Orders · returns', 'replacement': 'Orders · problem with an item',
    'cancellation': 'Orders · cancellation', 'product': 'Product questions', 'safety': 'Product safety · priority',
    'business': 'Business enquiries', 'privacy': 'Privacy requests', 'brand': 'General', 'learn': 'Learn', 'report': 'Lot reports',
}
ORDER_KINDS = ('delivery', 'return', 'replacement', 'cancellation')
PRIVACY_REQUESTS = {
    'access': 'A copy of my personal data', 'correction': 'Correct or update my data', 'erasure': 'Delete my account and data',
    'withdraw': 'Withdraw a consent', 'nominate': 'Nominate someone to act for me', 'grievance': 'A privacy complaint', 'other': 'Something else',
}
RETURN_REASONS = {
    'damaged': 'Arrived damaged', 'wrong': 'Wrong item sent', 'missing': 'Item missing from the parcel', 'defective': 'Problem with the product',
    'expiry': 'Expired or close to expiry', 'change_of_mind': 'I changed my mind', 'other': 'Something else',
}
NO_FAULT = ('change_of_mind',)


def contact_details(data, s):
    """Validated contact details for a case. Name, plus a mobile or email to identify the request."""
    raw = data.get('contact') if isinstance(data.get('contact'), dict) else {}
    name = str(raw.get('name', '')).strip()
    email = str(raw.get('email', '')).strip()
    mobile = re.sub(r'[\s-]', '', str(raw.get('mobile', '')).strip())
    if mobile.startswith('+91'):
        mobile = mobile[3:]
    fields = {}
    if not 2 <= len(name) <= 80:
        fields['name'] = 'Enter your name.'
    if email and not re.fullmatch(r'[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}', email):
        fields['email'] = 'Enter a valid email address, or leave it blank.'
    if mobile and not re.fullmatch(r'[6-9][0-9]{9}', mobile):
        fields['mobile'] = 'Enter a 10-digit Indian mobile number, or leave it blank.'
    if not email and not mobile and not str(s['user_id']).startswith('customer-'):
        fields['mobile'] = 'Give a mobile number or an email so we can match replies to you.'
    if fields:
        raise Error('Check the highlighted fields.', fields=fields)
    out = {'name': name}
    if email:
        out['email'] = email
    if mobile:
        out['mobile'] = mobile
    return out


class SupportMixin:
    def support_init(self, c):
        c.executescript(SCHEMA)

    # ---------------- help ----------------
    def help_feedback(self, s, data):
        article = str(data.get('article', ''))
        if not ARTICLE_ID.fullmatch(article):
            raise Error('Unknown article.')
        if not isinstance(data.get('helpful'), bool):
            raise Error('Choose yes or no.')
        reason = data.get('reason')
        if reason is not None and reason not in FEEDBACK_REASONS:
            raise Error('Choose a reason from the list.')
        with self.db() as c:
            c.execute('INSERT OR REPLACE INTO help_feedback VALUES(?,?,?,?,?)', (s['id'], article, int(data['helpful']), reason, int(time.time())))
        return {'ok': True, 'article': article, 'helpful': data['helpful']}

    def help_feedback_summary(self, c):
        return [dict(r) for r in c.execute('SELECT article, SUM(helpful) AS yes, COUNT(*) - SUM(helpful) AS no FROM help_feedback GROUP BY article ORDER BY no DESC, article')]

    # ---------------- cases ----------------
    def owned_case(self, c, s, cid):
        r = c.execute('SELECT * FROM cases WHERE id=?', (cid,)).fetchone()
        if not r or r['user_id'] != s['user_id']:
            raise Error('Case not found.', 404)
        return r, json.loads(r['data'])

    def case_view(self, s, cid):
        with self.db() as c:
            r, p = self.owned_case(c, s, cid)
        p = {k: v for k, v in p.items() if k not in ('internal',)}
        return {'id': r['id'], 'created': r['created'], **p, 'media_count': len(p.get('media') or [])}

    def case_reply(self, s, cid, data):
        text = str(data.get('message', '')).strip()
        if not 2 <= len(text) <= 3000:
            raise Error('Write your message (up to 3,000 characters).', field='message')
        with self.db() as c:
            r, p = self.owned_case(c, s, cid)
            now = int(time.time())
            p['history'].append({'state': 'customer_reply', 'at': now, 'message': text})
            if p.get('state') == 'resolved':
                p['state'] = 'open'
                p['history'].append({'state': 'open', 'at': now, 'note': 'Reopened by your reply'})
            c.execute('UPDATE cases SET data=? WHERE id=?', (json.dumps(p), cid))
            self.log(c, s['user_id'], 'case_customer_reply', cid)
        return self.case_view(s, cid)

    # ---------------- cancellation ----------------
    def cancel_check(self, s, oid):
        """What would happen if this order were cancelled now. Shown before the customer confirms."""
        with self.db() as c:
            self.expire(c)
            r, p = self.owned_order(c, s, oid)
            pay = self.payment_status(c, oid)
            state = r['state']
            base = {'id': oid, 'state': state, 'payment': pay, 'total': p.get('total'), 'refund_state': p.get('refund')}
            if r['user_id'] != s['user_id']:
                return {**base, 'eligible': False, 'reason': 'session', 'message': 'Use the account or browser session that placed this order.'}
            if state == 'cancelled':
                return {**base, 'eligible': False, 'reason': 'cancelled', 'message': 'This order is already cancelled.'}
            if pay == 'processing':
                return {**base, 'eligible': False, 'reason': 'processing', 'message': 'We’re still confirming your payment. Check its status first, then you can cancel.'}
            if state in ('shipped', 'delivered'):
                return {**base, 'eligible': False, 'reason': 'dispatched', 'message': 'This order has been dispatched, so it can’t be cancelled here. Contact support about it, or see Returns & Refunds once it arrives.'}
            if state not in ('pending', 'paid'):
                return {**base, 'eligible': False, 'reason': 'unavailable', 'message': 'This order can’t be cancelled here. Contact support about it.'}
            paid = state == 'paid'
            return {**base, 'eligible': True, 'reason': None, 'refund': 'full' if paid else 'none',
                    'message': ('You’ll get a refund of the full amount paid. Refunds are reviewed before release; in this preview no money moves.' if paid
                                else 'No payment has been taken, so nothing needs refunding. The reserved stock is released.'),
                    'charge': 0}

    # ---------------- returns and replacements ----------------
    def return_request(self, s, oid, data):
        reason = data.get('reason')
        if reason not in RETURN_REASONS:
            raise Error('Choose what went wrong.', field='reason')
        remedy = data.get('remedy', 'either')
        if remedy not in ('refund', 'replacement', 'either'):
            raise Error('Choose refund, replacement or either.', field='remedy')
        text = str(data.get('message', '')).strip()
        if not 10 <= len(text) <= 3000:
            raise Error('Tell us a little more (at least 10 characters).', field='message')
        items = data.get('items')
        if not isinstance(items, list) or not items:
            raise Error('Choose at least one item.', field='items')
        media_ids = data.get('media') or []
        if not isinstance(media_ids, list) or len(media_ids) > 2 or not all(isinstance(m, str) and re.fullmatch(r'IMG-[0-9a-f]{16}', m) for m in media_ids):
            raise Error('Attach at most two photos.')
        with self.db() as c:
            self.expire(c)
            r, p = self.owned_order(c, s, oid)
            if r['user_id'] != s['user_id']:
                raise Error('Use the account or browser session that placed this order.', 403)
            if r['state'] not in ('shipped', 'delivered'):
                raise Error('A return or replacement request opens once the order has been dispatched. Before that, you can cancel it.', 409, reason='not_dispatched')
            if reason != 'missing' and r['state'] != 'delivered':
                raise Error('Once the order is delivered you can ask about a return or replacement. For a delayed parcel, contact support.', 409, reason='not_delivered')
            ordered = {i['id']: i for i in p['items']}
            chosen = []
            for it in items:
                if not isinstance(it, dict) or it.get('id') not in ordered or not isinstance(it.get('quantity'), int) or isinstance(it.get('quantity'), bool):
                    raise Error('Choose items from this order.', field='items')
                q = it['quantity']
                if not 1 <= q <= ordered[it['id']]['quantity']:
                    raise Error('Choose a quantity you received.', field='items')
                chosen.append({'id': it['id'], 'name': ordered[it['id']]['name'], 'quantity': q})
            for row in c.execute('SELECT id, data FROM cases WHERE user_id=?', (s['user_id'],)).fetchall():
                d = json.loads(row['data'])
                if d.get('order_id') == oid and d.get('request', {}).get('type') == 'return' and d.get('state') != 'resolved':
                    raise Error('There’s already an open request for this order.', 409, reason='duplicate', case=row['id'])
            kind = 'return' if reason in NO_FAULT else 'replacement'
            cid = 'CASE-' + secrets.token_hex(4).upper()
            now = int(time.time())
            payload = {'kind': kind, 'message': text, 'order_id': oid, 'state': 'open', 'owner': 'Unassigned', 'queue': QUEUES[kind],
                       'sla': 'Response time not yet confirmed', 'preview': True,
                       'subject': RETURN_REASONS[reason] + ' · ' + oid,
                       'request': {'type': 'return', 'reason': reason, 'remedy': remedy, 'items': chosen},
                       'history': [{'state': 'open', 'at': now, 'note': 'Request received'}]}
            for mid in media_ids:
                m = c.execute("SELECT * FROM review_media WHERE id=? AND user_id=? AND state='case_uploaded'", (mid, s['user_id'])).fetchone()
                if not m:
                    raise Error('A photo could not be attached. Upload it again.', 409)
                c.execute("UPDATE review_media SET review_id=?,state='case' WHERE id=?", (cid, mid))
            if media_ids:
                payload['media'] = media_ids
            c.execute('INSERT INTO cases VALUES(?,?,?,?)', (cid, s['user_id'], json.dumps(payload), now))
            self.log(c, s['user_id'], 'return_requested', cid)
        return {'id': cid, **payload}

    # ---------------- privacy ----------------
    def privacy_request(self, s, data):
        if not str(s['user_id']).startswith('customer-'):
            raise Error('Sign in with your mobile number first, so we know the request is yours.', 401, reason='verify')
        kind = data.get('request')
        if kind not in PRIVACY_REQUESTS:
            raise Error('Choose the kind of request.', field='request')
        text = str(data.get('message', '')).strip()
        if len(text) > 3000 or (kind in ('correction', 'nominate', 'grievance', 'other') and len(text) < 10):
            raise Error('Tell us what you need (at least 10 characters).', field='message')
        now = int(time.time())
        cid = 'CASE-' + secrets.token_hex(4).upper()
        payload = {'kind': 'privacy', 'message': text or PRIVACY_REQUESTS[kind], 'order_id': '', 'state': 'open', 'owner': 'Unassigned',
                   'queue': QUEUES['privacy'], 'sla': 'Response time not yet confirmed', 'preview': True,
                   'subject': 'Privacy request · ' + PRIVACY_REQUESTS[kind], 'request': {'type': 'privacy', 'kind': kind},
                   'history': [{'state': 'open', 'at': now, 'note': 'Request received'}]}
        with self.db() as c:
            for row in c.execute('SELECT id, data FROM cases WHERE user_id=?', (s['user_id'],)).fetchall():
                d = json.loads(row['data'])
                if d.get('request', {}).get('type') == 'privacy' and d['request'].get('kind') == kind and d.get('state') != 'resolved':
                    raise Error('You already have an open request of this kind.', 409, reason='duplicate', case=row['id'])
            c.execute('INSERT INTO cases VALUES(?,?,?,?)', (cid, s['user_id'], json.dumps(payload), now))
            self.log(c, s['user_id'], 'privacy_request_' + kind, cid)
        return {'id': cid, **payload}

    def data_export(self, s):
        """A copy of the personal data this preview holds for the signed-in customer."""
        if not str(s['user_id']).startswith('customer-'):
            raise Error('Sign in to download your data.', 401, reason='verify')
        uid = s['user_id']
        with self.db() as c:
            u = c.execute('SELECT id, name, mobile FROM users WHERE id=?', (uid,)).fetchone()
            prof = self.profile(c, uid)
            out = {
                'generated_at': int(time.time()), 'note': 'Local preview data. Payment card details are never stored here.',
                'account': {'mobile': u['mobile'], 'name': u['name'], 'email': prof.get('email'), 'email_verified': False},
                'preferences': prof.get('prefs', {}),
                'addresses': [json.loads(r['data']) for r in c.execute('SELECT data FROM addresses WHERE user_id=?', (uid,))],
                'orders': [{'id': r['id'], 'state': r['state'], **{k: v for k, v in json.loads(r['data']).items() if k in ('items', 'contact', 'total', 'created', 'history', 'refund')}}
                           for r in c.execute('SELECT id, state, data FROM orders WHERE user_id=?', (uid,))],
                'support_cases': [{'id': r['id'], **{k: v for k, v in json.loads(r['data']).items() if k in ('kind', 'subject', 'message', 'state', 'history', 'order_id', 'contact')}}
                                  for r in c.execute('SELECT id, data FROM cases WHERE user_id=?', (uid,))],
                'reviews': [{'product': r['product'], 'order_id': r['order_id'], **json.loads(r['data'])} for r in c.execute('SELECT * FROM reviews WHERE user_id=?', (uid,))],
            }
            self.log(c, uid, 'data_export', uid)
        return out
