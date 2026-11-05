"""Account, bag and checkout continuity for the local preview (mixed into Store).

* Bag: a server price/stock check (`bag_quote`) used by the bag page and by checkout, so both show the same numbers.
  Signed-in customers also keep an account bag; guests keep theirs in the browser. Combining the two is done by the
  page, which explains the result (the larger quantity per product wins; nothing is silently doubled).
* Sign-in: mobile one-time codes behind a sender boundary. The only sender implemented is the honest local preview
  sender, which shows the code on the page and sends nothing. Setting BCC_OTP_PROVIDER to anything else makes code
  requests fail with "unavailable" until a real provider adapter is written; nothing pretends to send an SMS.
  Expiry (5 min), resend wait (20 s), attempt limit (5 per code) and an hourly cap (5 codes per number, 10 per
  session) are enforced here.
* Account: addresses (add, edit, remove, default) with ownership checks, profile name and optional unverified email,
  communication preferences, sign out on this device or everywhere.
* Orders: an idempotency key per checkout so a resubmitted form returns the existing order; payment outcomes success,
  failure, cancelled and uncertain. An uncertain payment must be checked (reconciled) before any retry. Each order
  in the account view carries its payment status, its allocated lots and the next useful step.
"""
import hashlib
import hmac
import json
import os
import re
import secrets
import time

try:
    from app.errors import Error
except ImportError:
    from errors import Error

OTP_TTL = 300
OTP_RESEND = 20
OTP_ATTEMPTS = 5
OTP_HOURLY_PER_MOBILE = 5
OTP_HOURLY_PER_SESSION = 10
MAX_QTY = 10


def pack_pct(q):
    """Pack saving (owner, 4 Nov 2026): on one product line, 2 bottles save 5% and 3 or more save 10%. Same rule as web/packs-e.js."""
    return 10 if q >= 3 else 5 if q == 2 else 0


def pack_saving(price, q):
    return int(price * q * pack_pct(q) / 100 + 0.5)  # round half up, as Math.round does for these positive amounts


DISCOUNTS = {'PREVIEW10': {'label': 'PREVIEW10 · sample 10% off', 'condition': 'Sample code for testing the preview. 10% off the subtotal after any pack saving, rounded to the nearest rupee.'}}
SHIPPING_RULE = {'fee': 75, 'free_from': 1499, 'note': 'Delivery is ₹75, free when your subtotal after discount is ₹1,499 or more.'}
TAX_NOTE = 'Prices are MRP, inclusive of all taxes.'
KEY = re.compile(r'[A-Za-z0-9-]{8,64}')

SCHEMA = '''
CREATE TABLE IF NOT EXISTS bags(user_id TEXT PRIMARY KEY, data TEXT, updated INTEGER);
CREATE TABLE IF NOT EXISTS profiles(user_id TEXT PRIMARY KEY, data TEXT);
CREATE TABLE IF NOT EXISTS otp_requests(id INTEGER PRIMARY KEY, mobile TEXT, session TEXT, created INTEGER);
CREATE TABLE IF NOT EXISTS order_keys(key TEXT PRIMARY KEY, user_id TEXT, order_id TEXT, created INTEGER);
CREATE TABLE IF NOT EXISTS credentials(user_id TEXT PRIMARY KEY, email TEXT, email_verified INTEGER DEFAULT 0, pw_hash TEXT, pw_updated INTEGER);
CREATE UNIQUE INDEX IF NOT EXISTS credentials_verified_email ON credentials(email) WHERE email_verified=1;
CREATE TABLE IF NOT EXISTS signups(mobile TEXT PRIMARY KEY, data TEXT, created INTEGER);
CREATE TABLE IF NOT EXISTS pw_attempts(id INTEGER PRIMARY KEY, key TEXT, created INTEGER);
CREATE TABLE IF NOT EXISTS cards(id TEXT PRIMARY KEY, user_id TEXT, data TEXT);
'''
MAX_ADDRESSES = 5
MAX_CARDS = 5
ADDRESS_LABELS = ('home', 'office', 'other')
CARD_NETWORKS = ('visa', 'mastercard', 'rupay', 'amex', 'diners')
EMAIL = re.compile(r'[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}')
PW_WINDOW = 900
PW_ATTEMPTS = 5


def hash_password(pw):
    salt = secrets.token_hex(16)
    return 'pbkdf2$200000$%s$%s' % (salt, hashlib.pbkdf2_hmac('sha256', pw.encode(), bytes.fromhex(salt), 200000).hex())


def check_password(pw, stored):
    try:
        _, n, salt, digest = stored.split('$')
        return hmac.compare_digest(digest, hashlib.pbkdf2_hmac('sha256', pw.encode(), bytes.fromhex(salt), int(n)).hex())
    except (ValueError, AttributeError):
        return False


def clean_password(pw):
    pw = str(pw or '')
    if not 8 <= len(pw) <= 128 or not re.search(r'[A-Za-z]', pw) or not re.search(r'[0-9]', pw):
        raise Error('Use at least 8 characters, with a letter and a number.', field='password')
    return pw


def uid_for(mobile):
    return 'customer-' + hashlib.sha256(mobile.encode()).hexdigest()[:20]


class PreviewOtpSender:
    """Local preview: the code is returned to the page. No message is sent."""
    mode = 'preview'

    def send(self, mobile, code):
        return {'mode': 'preview'}


class UnconfiguredOtpSender:
    """A provider was named but no adapter exists yet. Requests fail honestly instead of pretending to send."""
    def __init__(self, name):
        self.mode = name

    def send(self, mobile, code):
        raise Error('Sign-in codes can’t be sent right now. Try again later.', 503, reason='unavailable')


def otp_sender():
    name = os.getenv('BCC_OTP_PROVIDER', 'preview')
    return PreviewOtpSender() if name == 'preview' else UnconfiguredOtpSender(name)


def is_customer(s):
    return s['role'] == 'customer' and str(s['user_id']).startswith('customer-')


def clean_items(raw, allow_zero=False):
    if not isinstance(raw, list) or len(raw) > 30:
        raise Error('Your bag is invalid.')
    out, seen = [], set()
    for it in raw:
        if not isinstance(it, dict):
            raise Error('Your bag contains an invalid item.')
        pid, q = it.get('id'), it.get('quantity')
        if not isinstance(pid, str) or not 1 <= len(pid) <= 100 or pid in seen:
            raise Error('Your bag contains an invalid item.')
        if type(q) != int or not (0 if allow_zero else 1) <= q <= 99:
            raise Error('Choose a quantity between 1 and 10.')
        price = it.get('price')
        seen.add(pid)
        out.append({'id': pid, 'quantity': q, 'price': price if type(price) == int and price >= 0 else None})
    return out


class AccountMixin:

    def account_init(self, c):
        c.executescript(SCHEMA)

    # ---------------- profile helpers ----------------
    def profile(self, c, uid):
        r = c.execute('SELECT data FROM profiles WHERE user_id=?', (uid,)).fetchone()
        p = json.loads(r['data']) if r else {}
        p.setdefault('email', '')
        p.setdefault('prefs', {'email': False, 'whatsapp': False})
        p.setdefault('default_address', None)
        return p

    def save_profile(self, c, uid, p):
        c.execute('INSERT OR REPLACE INTO profiles VALUES(?,?)', (uid, json.dumps(p)))

    # ---------------- bag ----------------
    def bag_quote(self, s, data):
        items = clean_items(data.get('items', []), allow_zero=False) if data.get('items') else []
        code = str(data.get('discount', '') or '').strip().upper()
        now = int(time.time())
        lines, changes = [], []
        with self.db() as c:
            self.expire(c)
            for it in items:
                r = c.execute('SELECT data FROM products WHERE id=?', (it['id'],)).fetchone()
                if not r:
                    lines.append({'id': it['id'], 'name': None, 'quantity': it['quantity'], 'status': 'unknown', 'available': 0, 'max': 0, 'unit_price': None, 'line_total': 0})
                    changes.append({'id': it['id'], 'kind': 'unknown'})
                    continue
                p = json.loads(r['data'])
                stock = c.execute("SELECT COALESCE(SUM(available),0) FROM batches WHERE product=? AND state='released' AND proof=1 AND expiry>?", (p['id'], now)).fetchone()[0]
                mx = min(MAX_QTY, stock) if p.get('published') else 0
                q = it['quantity']
                status = 'ok'
                if mx == 0:
                    status = 'unavailable'
                elif q > mx:
                    status = 'reduced'
                payable = 0 if status == 'unavailable' else min(q, mx)
                line = {'id': p['id'], 'name': p['name'], 'quantity': q, 'payable_quantity': payable, 'status': status, 'available': stock, 'max': mx,
                        'limit': MAX_QTY, 'unit_price': p['price'], 'line_total': p['price'] * payable, 'pack_pct': pack_pct(payable), 'pack_saving': pack_saving(p['price'], payable), 'color': p.get('color'),
                        'price_changed': it['price'] is not None and it['price'] != p['price'], 'seen_price': it['price']}
                if status != 'ok':
                    changes.append({'id': p['id'], 'kind': status, 'from': q, 'to': payable})
                if line['price_changed']:
                    changes.append({'id': p['id'], 'kind': 'price', 'from': it['price'], 'to': p['price']})
                lines.append(line)
        subtotal = sum(x['line_total'] for x in lines)
        packs = sum(x.get('pack_saving', 0) for x in lines)
        discount, discount_error, applied = 0, None, None
        if code:
            if code in DISCOUNTS:
                discount = (subtotal - packs + 5) // 10
                applied = {'code': code, **DISCOUNTS[code], 'amount': discount}
            else:
                discount_error = 'That code isn’t valid. Check it, or remove it to continue.'
        shipping = 0 if subtotal == 0 or subtotal - packs - discount >= SHIPPING_RULE['free_from'] else SHIPPING_RULE['fee']
        ready = bool(lines) and all(x['status'] == 'ok' for x in lines) and not discount_error and not any(x['price_changed'] for x in lines)
        return {'lines': lines, 'changes': changes, 'subtotal': subtotal, 'pack_saving': packs, 'discount': discount, 'discount_applied': applied, 'discount_error': discount_error,
                'shipping': shipping, 'shipping_rule': SHIPPING_RULE, 'tax_note': TAX_NOTE, 'total': subtotal - packs - discount + shipping,
                'count': sum(x['payable_quantity'] if 'payable_quantity' in x else 0 for x in lines), 'ready': ready, 'sample': True, 'checked': now}

    def bag_get(self, s):
        if not is_customer(s):
            return {'items': [], 'account': False}
        with self.db() as c:
            r = c.execute('SELECT * FROM bags WHERE user_id=?', (s['user_id'],)).fetchone()
        return {'items': json.loads(r['data']) if r else [], 'updated': r['updated'] if r else None, 'account': True}

    def bag_save(self, s, data):
        if not is_customer(s):
            return {'ok': True, 'account': False}
        items = clean_items(data.get('items', []))
        for it in items:
            if it['quantity'] > MAX_QTY:
                raise Error('Maximum quantity is 10 per product.')
        with self.db() as c:
            c.execute('INSERT OR REPLACE INTO bags VALUES(?,?,?)', (s['user_id'], json.dumps(items), int(time.time())))
        return {'ok': True, 'account': True}

    # ---------------- sign-in ----------------
    def _issue(self, s, key, destination):
        """Issue a one-time code for a key: a mobile, 'email:<address>' or 'confirm:<user>:<address>'. Same limits for all."""
        now = int(time.time())
        sender = otp_sender()
        with self.db() as c:
            previous = c.execute('SELECT * FROM otps WHERE mobile=?', (key,)).fetchone()
            if previous and now - previous['sent'] < OTP_RESEND:
                wait = OTP_RESEND - (now - previous['sent'])
                raise Error('Please wait %d seconds before requesting another code.' % wait, 429, reason='resend_wait', retry_after=wait)
            c.execute('DELETE FROM otp_requests WHERE created<?', (now - 3600,))
            by_mobile = c.execute('SELECT COUNT(*), MIN(created) FROM otp_requests WHERE mobile=?', (key,)).fetchone()
            by_session = c.execute('SELECT COUNT(*) FROM otp_requests WHERE session=?', (s['id'],)).fetchone()[0]
            if by_mobile[0] >= OTP_HOURLY_PER_MOBILE or by_session >= OTP_HOURLY_PER_SESSION:
                wait = max(60, (by_mobile[1] or now) + 3600 - now) if by_mobile[0] >= OTP_HOURLY_PER_MOBILE else 3600
                raise Error('Too many codes requested. Try again in about %d minutes.' % max(1, wait // 60), 429, reason='rate_limited', retry_after=wait)
            code = f'{secrets.randbelow(1000000):06d}'
            delivery = sender.send(key, code)
            c.execute('INSERT OR REPLACE INTO otps VALUES(?,?,?,?,?)', (key, hashlib.sha256(code.encode()).hexdigest(), now + OTP_TTL, 0, now))
            c.execute('INSERT INTO otp_requests(mobile,session,created) VALUES(?,?,?)', (key, s['id'], now))
        channel = 'sms' if re.fullmatch(r'[0-9]{10}', key) else 'email'
        out = {'expires_in': OTP_TTL, 'resend_in': OTP_RESEND, 'destination': destination, 'mode': delivery['mode'], 'attempts': OTP_ATTEMPTS, 'channel': channel}
        if delivery['mode'] == 'preview':
            out.update({'preview_code': code, 'message': 'Local preview code. No %s was sent.' % ('SMS' if channel == 'sms' else 'email')})
        return out

    def _check_code(self, c, key, code):
        """None when the code matches (it is used up), else the attempts left. Raises when expired or locked."""
        r = c.execute('SELECT * FROM otps WHERE mobile=?', (key,)).fetchone()
        if not r:
            raise Error('That code has expired or was replaced. Request a new code.', reason='expired')
        if r['attempts'] >= OTP_ATTEMPTS:
            raise Error('Too many incorrect attempts. Request a new code.', 429, reason='locked')
        if r['expires'] < time.time():
            raise Error('That code has expired. Request a new code.', reason='expired')
        if not hmac.compare_digest(r['digest'], hashlib.sha256(code.encode()).hexdigest()):
            c.execute('UPDATE otps SET attempts=attempts+1 WHERE mobile=?', (key,))
            return OTP_ATTEMPTS - r['attempts'] - 1
        c.execute('DELETE FROM otps WHERE mobile=?', (key,))
        return None

    @staticmethod
    def _mismatch(left):
        if left <= 0:
            raise Error('That code doesn’t match, and no attempts are left. Request a new code.', 429, reason='locked', attempts_left=0)
        raise Error('That code doesn’t match. %d attempt%s left.' % (left, '' if left == 1 else 's'), reason='mismatch', attempts_left=left)

    def _start_session(self, c, s, uid, mobile, event='customer_signed_in'):
        """Move this browser session onto the account; claim this guest session's orders placed with the same mobile."""
        claimed = 0
        if s['user_id'].startswith('guest-'):
            for order in c.execute('SELECT * FROM orders WHERE user_id=?', (s['user_id'],)).fetchall():
                if json.loads(order['data']).get('contact', {}).get('mobile') == mobile:
                    c.execute('UPDATE orders SET user_id=? WHERE id=?', (uid, order['id']))
                    c.execute('UPDATE order_keys SET user_id=? WHERE order_id=?', (uid, order['id']))
                    claimed += 1
            # Support cases opened in this same browser session follow the customer into the account.
            c.execute('UPDATE cases SET user_id=? WHERE user_id=?', (uid, s['user_id']))
        c.execute('UPDATE sessions SET user_id=? WHERE id=?', (uid, s['id']))
        self.log(c, uid, event, uid)
        return claimed

    def _email_owner(self, c, email):
        r = c.execute('SELECT u.id, u.mobile FROM credentials k JOIN users u ON u.id=k.user_id WHERE k.email=? AND k.email_verified=1', (email,)).fetchone()
        return (r['id'], r['mobile']) if r else (None, None)

    @staticmethod
    def _mask_email(email):
        name, dom = email.split('@', 1)
        return name[:2] + '•••@' + dom

    def otp(self, s, data):
        """A sign-in code to a mobile number, or to a confirmed email on an existing account."""
        if data.get('email') is not None:
            email = str(data.get('email', '')).strip().lower()
            if not EMAIL.fullmatch(email):
                raise Error('Enter a valid email address.', reason='email')
            with self.db() as c:
                uid, _ = self._email_owner(c, email)
            if not uid:
                raise Error('No account uses this email yet. Sign in with your mobile number, or create an account.', 404, reason='unknown_email')
            return self._issue(s, 'email:' + email, self._mask_email(email))
        mobile = str(data.get('mobile', '')).strip()
        if not re.fullmatch(r'[6-9][0-9]{9}', mobile):
            raise Error('Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9.', reason='mobile')
        return self._issue(s, mobile, '+91 ' + mobile[:2] + '••••••' + mobile[-2:])

    def verify(self, s, data):
        code = re.sub(r'\D', '', str(data.get('code', '')))
        if not re.fullmatch(r'[0-9]{6}', code):
            raise Error('Enter the 6-digit code.', reason='format')
        email = str(data.get('email') or '').strip().lower()
        mobile = str(data.get('mobile', '')).strip()
        created, pending_email, claimed = False, '', 0
        with self.db() as c:
            left = self._check_code(c, 'email:' + email if email else mobile, code)
            if left is None:
                if email:
                    uid, mobile = self._email_owner(c, email)
                    if not uid:
                        raise Error('No account uses this email.', 404, reason='unknown_email')
                else:
                    uid = uid_for(mobile)
                    created = not c.execute('SELECT 1 FROM users WHERE id=?', (uid,)).fetchone()
                    row = c.execute('SELECT data FROM signups WHERE mobile=?', (mobile,)).fetchone()
                    su = json.loads(row['data']) if row and created else {}
                    c.execute('INSERT OR IGNORE INTO users VALUES(?,?,?,?)', (uid, su.get('name') or 'Customer', mobile, 'customer'))
                    if su:
                        c.execute('INSERT OR REPLACE INTO credentials(user_id,email,email_verified,pw_hash,pw_updated) VALUES(?,?,0,?,?)',
                                  (uid, su.get('email') or None, su.get('pw_hash'), int(time.time()) if su.get('pw_hash') else None))
                        if su.get('email'):
                            p = self.profile(c, uid); p['email'] = su['email']; self.save_profile(c, uid, p)
                            pending_email = su['email']
                    c.execute('DELETE FROM signups WHERE mobile=?', (mobile,))
                claimed = self._start_session(c, s, uid, mobile, 'customer_signed_up' if created else 'customer_signed_in')
        if left is not None:
            self._mismatch(left)
        return {'ok': True, 'created': created, 'claimed_orders': claimed, 'email_pending': pending_email}

    def signup(self, s, data):
        """Create an account: name and mobile (required), email and password (optional). Confirmed by a code to the mobile."""
        errors = {}
        name = str(data.get('name', '')).strip()
        mobile = str(data.get('mobile', '')).strip()
        email = str(data.get('email', '') or '').strip().lower()
        pw = data.get('password') or ''
        if not 1 <= len(name) <= 80:
            errors['name'] = 'Enter your name.'
        if not re.fullmatch(r'[6-9][0-9]{9}', mobile):
            errors['mobile'] = 'Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9.'
        if email and not EMAIL.fullmatch(email):
            errors['email'] = 'Enter a valid email address, or leave it blank.'
        if pw:
            try:
                clean_password(pw)
            except Error as e:
                errors['password'] = str(e)
        if errors:
            raise Error('Check the highlighted fields.', fields=errors)
        with self.db() as c:
            if c.execute('SELECT 1 FROM users WHERE id=?', (uid_for(mobile),)).fetchone():
                raise Error('This number already has an account. Sign in instead.', 409, reason='exists', fields={'mobile': 'This number already has an account.'})
            if email and self._email_owner(c, email)[0]:
                raise Error('Check the highlighted fields.', 409, fields={'email': 'Another account already uses this email.'})
            c.execute('INSERT OR REPLACE INTO signups VALUES(?,?,?)', (mobile, json.dumps({'name': name, 'email': email, 'pw_hash': hash_password(pw) if pw else None}), int(time.time())))
        out = self.otp(s, {'mobile': mobile})
        out['signup'] = True
        return out

    def password_signin(self, s, data):
        ident = re.sub(r'\s', '', str(data.get('identifier', ''))).lower()
        if re.fullmatch(r'(\+?91)?[6-9][0-9]{9}', ident):
            ident = ident[-10:]
        pw = str(data.get('password', ''))
        if not ident or not pw:
            raise Error('Enter your mobile number or email, and your password.')
        now = int(time.time())
        key = 'pw:' + ident
        claimed, ok = 0, False
        with self.db() as c:
            c.execute('DELETE FROM pw_attempts WHERE created<?', (now - PW_WINDOW,))
            if c.execute('SELECT COUNT(*) FROM pw_attempts WHERE key=?', (key,)).fetchone()[0] >= PW_ATTEMPTS:
                raise Error('Too many attempts. Sign in with a one-time code, or try again in 15 minutes.', 429, reason='locked')
            if re.fullmatch(r'[6-9][0-9]{9}', ident):
                uid, mobile = uid_for(ident), ident
            else:
                uid, mobile = self._email_owner(c, ident)
            k = c.execute('SELECT pw_hash FROM credentials WHERE user_id=?', (uid,)).fetchone() if uid else None
            ok = bool(k and k['pw_hash'] and check_password(pw, k['pw_hash']))
            if not ok:
                c.execute('INSERT INTO pw_attempts(key,created) VALUES(?,?)', (key, now))
            else:
                c.execute('DELETE FROM pw_attempts WHERE key=?', (key,))
                claimed = self._start_session(c, s, uid, mobile)
        if not ok:
            raise Error('That password doesn’t match, or this account has no password yet. Try a one-time code instead.', reason='mismatch')
        return {'ok': True, 'created': False, 'claimed_orders': claimed}

    def set_password(self, s, data):
        if not is_customer(s):
            raise Error('Sign in to set a password.', 401)
        pw = clean_password(data.get('password'))
        with self.db() as c:
            k = c.execute('SELECT * FROM credentials WHERE user_id=?', (s['user_id'],)).fetchone()
            if k and k['pw_hash'] and not check_password(str(data.get('current', '')), k['pw_hash']):
                raise Error('Your current password doesn’t match.', field='current')
            if k:
                c.execute('UPDATE credentials SET pw_hash=?, pw_updated=? WHERE user_id=?', (hash_password(pw), int(time.time()), s['user_id']))
            else:
                c.execute('INSERT INTO credentials(user_id,email,email_verified,pw_hash,pw_updated) VALUES(?,?,0,?,?)', (s['user_id'], None, hash_password(pw), int(time.time())))
            self.log(c, s['user_id'], 'password_set', s['user_id'])
        return {'ok': True}

    def email_code(self, s, data):
        """Confirm an email on a signed-in account. Once confirmed, it can be used to sign in."""
        if not is_customer(s):
            raise Error('Sign in to confirm an email.', 401)
        email = str(data.get('email', '')).strip().lower()
        if not EMAIL.fullmatch(email):
            raise Error('Enter a valid email address.', field='email')
        with self.db() as c:
            owner = self._email_owner(c, email)[0]
        if owner and owner != s['user_id']:
            raise Error('Another account already uses this email.', 409, field='email')
        return self._issue(s, 'confirm:' + s['user_id'] + ':' + email, self._mask_email(email))

    def email_verify(self, s, data):
        if not is_customer(s):
            raise Error('Sign in to confirm an email.', 401)
        email = str(data.get('email', '')).strip().lower()
        code = re.sub(r'\D', '', str(data.get('code', '')))
        if not re.fullmatch(r'[0-9]{6}', code):
            raise Error('Enter the 6-digit code.', reason='format')
        with self.db() as c:
            left = self._check_code(c, 'confirm:' + s['user_id'] + ':' + email, code)
            if left is None:
                owner = self._email_owner(c, email)[0]
                if owner and owner != s['user_id']:
                    raise Error('Another account already uses this email.', 409)
                if c.execute('SELECT 1 FROM credentials WHERE user_id=?', (s['user_id'],)).fetchone():
                    c.execute('UPDATE credentials SET email=?, email_verified=1 WHERE user_id=?', (email, s['user_id']))
                else:
                    c.execute('INSERT INTO credentials(user_id,email,email_verified) VALUES(?,?,1)', (s['user_id'], email))
                p = self.profile(c, s['user_id']); p['email'] = email; self.save_profile(c, s['user_id'], p)
                self.log(c, s['user_id'], 'email_verified', s['user_id'])
        if left is not None:
            self._mismatch(left)
        return {'ok': True}

    def logout(self, s, data):
        with self.db() as c:
            if data.get('everywhere') and is_customer(s):
                n = c.execute('DELETE FROM sessions WHERE user_id=?', (s['user_id'],)).rowcount
                self.log(c, s['user_id'], 'signed_out_everywhere', str(n))
            else:
                c.execute('DELETE FROM sessions WHERE id=?', (s['id'],))
        return {'ok': True}

    # ---------------- profile, preferences, addresses ----------------
    def profile_update(self, s, data):
        if not is_customer(s):
            raise Error('Sign in to update your profile.', 401)
        name = str(data.get('name', '')).strip()
        email = str(data.get('email', '')).strip()
        if not 1 <= len(name) <= 80:
            raise Error('Enter your name (up to 80 characters).', field='name')
        if email and not re.fullmatch(r'[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}', email):
            raise Error('Enter a valid email address, or leave it blank.', field='email')
        with self.db() as c:
            c.execute('UPDATE users SET name=? WHERE id=?', (name, s['user_id']))
            p = self.profile(c, s['user_id'])
            p['email'] = email
            k = c.execute('SELECT email FROM credentials WHERE user_id=?', (s['user_id'],)).fetchone()
            if k and (k['email'] or '') != email.lower():
                # A changed email can't sign in until it is confirmed with a code.
                c.execute('UPDATE credentials SET email=?, email_verified=0 WHERE user_id=?', (email.lower() or None, s['user_id']))
            self.save_profile(c, s['user_id'], p)
            self.log(c, s['user_id'], 'profile_updated', s['user_id'])
        return {'ok': True}

    def preferences(self, s, data):
        if not is_customer(s):
            raise Error('Sign in to save preferences to your account.', 401)
        prefs = {k: data.get(k) is True for k in ('email', 'whatsapp')}
        with self.db() as c:
            p = self.profile(c, s['user_id'])
            p['prefs'] = prefs
            p['prefs_updated'] = int(time.time())
            self.save_profile(c, s['user_id'], p)
            self.log(c, s['user_id'], 'preferences_updated', json.dumps(prefs))
        return {'ok': True, 'prefs': prefs}

    def address_save(self, s, data):
        if not is_customer(s):
            raise Error('Sign in to manage saved addresses.', 401)
        errors = {}
        if not re.fullmatch(r'[1-9][0-9]{5}', str(data.get('pincode', ''))):
            errors['pincode'] = 'Enter a 6-digit pincode that doesn’t start with 0.'
        for k, label in [('name', 'name'), ('address', 'address'), ('city', 'city'), ('state', 'state')]:
            if not 2 <= len(str(data.get(k, '')).strip()) <= 200:
                errors[k] = 'Enter the ' + label + '.'
        label = str(data.get('label') or 'home').strip().lower()
        if label not in ADDRESS_LABELS:
            errors['label'] = 'Choose Home, Office or Other.'
        label_name = str(data.get('label_name') or '').strip()[:24]
        if label == 'other' and not label_name:
            errors['label_name'] = 'Name this address, for example Parents or Gym.'
        phone = str(data.get('mobile') or '').strip()
        if phone and not re.fullmatch(r'[6-9][0-9]{9}', phone):
            errors['mobile'] = 'Enter a 10-digit mobile number, or leave it blank.'
        if errors:
            raise Error('Check the highlighted fields.', fields=errors)
        clean = {k: str(data[k]).strip()[:200] for k in ['name', 'address', 'city', 'state', 'pincode']}
        clean.update({'label': label, 'label_name': label_name if label == 'other' else '', 'mobile': phone, 'landmark': str(data.get('landmark') or '').strip()[:120]})
        with self.db() as c:
            aid = data.get('id')
            if aid:
                r = c.execute('SELECT * FROM addresses WHERE id=?', (aid,)).fetchone()
                if not r or r['user_id'] != s['user_id']:
                    raise Error('Address not found.', 404)
                c.execute('UPDATE addresses SET data=? WHERE id=?', (json.dumps(clean), aid))
            else:
                if c.execute('SELECT COUNT(*) FROM addresses WHERE user_id=?', (s['user_id'],)).fetchone()[0] >= MAX_ADDRESSES:
                    raise Error('You can save up to %d addresses. Remove one to add another.' % MAX_ADDRESSES, 409)
                aid = 'ADDR-' + secrets.token_hex(5)
                c.execute('INSERT INTO addresses VALUES(?,?,?)', (aid, s['user_id'], json.dumps(clean)))
            if data.get('default') is True or not c.execute('SELECT 1 FROM addresses WHERE user_id=? AND id!=?', (s['user_id'], aid)).fetchone():
                p = self.profile(c, s['user_id'])
                p['default_address'] = aid
                self.save_profile(c, s['user_id'], p)
        return {'id': aid}

    def address_action(self, s, aid, action):
        if not is_customer(s):
            raise Error('Sign in to manage saved addresses.', 401)
        with self.db() as c:
            r = c.execute('SELECT * FROM addresses WHERE id=?', (aid,)).fetchone()
            if not r or r['user_id'] != s['user_id']:
                raise Error('Address not found.', 404)
            p = self.profile(c, s['user_id'])
            if action == 'delete':
                c.execute('DELETE FROM addresses WHERE id=?', (aid,))
                if p['default_address'] == aid:
                    nxt = c.execute('SELECT id FROM addresses WHERE user_id=? ORDER BY rowid LIMIT 1', (s['user_id'],)).fetchone()
                    p['default_address'] = nxt['id'] if nxt else None
            elif action == 'default':
                p['default_address'] = aid
            else:
                raise Error('Unknown address action.', 404)
            self.save_profile(c, s['user_id'], p)
        return {'ok': True}

    # ---------------- saved cards ----------------
    # Cards are saved as a token by the payment provider (RBI card-on-file tokenisation). We keep only what is needed to
    # show the card: network, credit or debit, last four digits, expiry, name and a nickname. Full numbers and CVVs are refused.
    def card_save(self, s, data):
        if not is_customer(s):
            raise Error('Sign in to save a card.', 401)
        if 'cvv' in data or 'number' in data or any(re.search(r'\d{9,}', re.sub(r'[\s-]', '', str(v))) for v in data.values()):
            raise Error('Full card numbers and CVVs are never sent to us. Save cards through the secure card form.', reason='raw_card')
        errors = {}
        network = str(data.get('network', '')).lower()
        kind = str(data.get('kind', '')).lower()
        last4 = str(data.get('last4', ''))
        name = str(data.get('name', '')).strip()
        try:
            mm, yy = int(data.get('exp_month')), int(data.get('exp_year'))
        except (TypeError, ValueError):
            mm, yy = 0, 0
        now = time.gmtime()
        if not re.fullmatch(r'[0-9]{4}', last4):
            errors['number'] = 'Enter the card number.'
        elif network not in CARD_NETWORKS:
            errors['number'] = 'We accept Visa, Mastercard, RuPay, American Express and Diners Club.'
        if kind not in ('credit', 'debit'):
            errors['kind'] = 'Choose credit or debit.'
        if not (1 <= mm <= 12 and now.tm_year <= yy <= now.tm_year + 20) or (yy == now.tm_year and mm < now.tm_mon):
            errors['expiry'] = 'Enter a valid expiry date (MM/YY) that hasn’t passed.'
        if not 2 <= len(name) <= 60:
            errors['name'] = 'Enter the name on the card.'
        if errors:
            raise Error('Check the highlighted fields.', fields=errors)
        clean = {'network': network, 'kind': kind, 'last4': last4, 'exp_month': mm, 'exp_year': yy, 'name': name[:60],
                 'nickname': str(data.get('nickname') or '').strip()[:24], 'token': 'tok_preview_' + secrets.token_hex(8), 'added': int(time.time())}
        with self.db() as c:
            rows = [json.loads(r['data']) for r in c.execute('SELECT data FROM cards WHERE user_id=?', (s['user_id'],))]
            if len(rows) >= MAX_CARDS:
                raise Error('You can save up to %d cards. Remove one to add another.' % MAX_CARDS, 409)
            if any(r['network'] == network and r['last4'] == last4 and r['exp_month'] == mm and r['exp_year'] == yy for r in rows):
                raise Error('Check the highlighted fields.', 409, fields={'number': 'This card is already saved.'})
            cid = 'CARD-' + secrets.token_hex(5)
            c.execute('INSERT INTO cards VALUES(?,?,?)', (cid, s['user_id'], json.dumps(clean)))
            if not rows or data.get('default') is True:
                p = self.profile(c, s['user_id'])
                p['default_card'] = cid
                self.save_profile(c, s['user_id'], p)
            self.log(c, s['user_id'], 'card_saved', cid)
        return {'id': cid}

    def card_action(self, s, cid, action):
        if not is_customer(s):
            raise Error('Sign in to manage saved cards.', 401)
        with self.db() as c:
            r = c.execute('SELECT * FROM cards WHERE id=?', (cid,)).fetchone()
            if not r or r['user_id'] != s['user_id']:
                raise Error('Card not found.', 404)
            p = self.profile(c, s['user_id'])
            if action == 'delete':
                c.execute('DELETE FROM cards WHERE id=?', (cid,))
                if p.get('default_card') == cid:
                    nxt = c.execute('SELECT id FROM cards WHERE user_id=? ORDER BY rowid LIMIT 1', (s['user_id'],)).fetchone()
                    p['default_card'] = nxt['id'] if nxt else None
                self.log(c, s['user_id'], 'card_removed', cid)
            elif action == 'default':
                p['default_card'] = cid
            else:
                raise Error('Unknown card action.', 404)
            self.save_profile(c, s['user_id'], p)
        return {'ok': True}

    # ---------------- orders and payment ----------------
    def order_existing(self, c, s, key):
        if not key:
            return None
        if not KEY.fullmatch(key):
            raise Error('Refresh the checkout and try again.')
        k = c.execute('SELECT * FROM order_keys WHERE key=?', (key,)).fetchone()
        if not k:
            return None
        r = c.execute('SELECT * FROM orders WHERE id=?', (k['order_id'],)).fetchone()
        if not r or r['user_id'] != s['user_id']:
            raise Error('This checkout was already submitted from another session. Open your orders to continue.', 409, reason='other_session')
        return {'id': r['id'], **json.loads(r['data']), 'state': r['state'], 'idempotent': True}

    def order_key_record(self, c, s, key, oid):
        if key:
            c.execute('INSERT INTO order_keys VALUES(?,?,?,?)', (key, s['user_id'], oid, int(time.time())))

    def payment_status(self, c, oid):
        p = c.execute('SELECT status FROM payments WHERE order_id=?', (oid,)).fetchone()
        return p['status'] if p else None

    def order_status(self, s, oid):
        with self.db() as c:
            self.expire(c)
            r, p = self.owned_order(c, s, oid)
            return {'id': oid, 'state': r['state'], 'payment': self.payment_status(c, oid), 'expires': p.get('expires')}

    def reconcile(self, s, oid, data):
        """Preview stand-in for the payment provider's later answer about an uncertain payment."""
        outcome = data.get('outcome')
        if outcome not in ('success', 'failure'):
            raise Error('Choose the provider’s answer.')
        with self.db() as c:
            self.expire(c)
            r, p = self.owned_order(c, s, oid)
            if r['user_id'] != s['user_id']:
                raise Error('Use the purchasing customer session.', 403)
            if self.payment_status(c, oid) != 'processing':
                return {'id': oid, 'state': r['state'], 'payment': self.payment_status(c, oid), 'idempotent': True}
            if outcome == 'failure':
                c.execute("UPDATE payments SET status='failed' WHERE order_id=?", (oid,))
                self.log(c, s['user_id'], 'preview_payment_reconciled_failed', oid)
                return {'id': oid, 'state': r['state'], 'payment': 'failed'}
            self.capture(c, s, oid, p)
            return {'id': oid, 'state': 'paid', 'payment': 'captured'}

    def capture(self, c, s, oid, p):
        invalid = c.execute("SELECT r.id FROM reservations r JOIN batches b ON r.batch=b.id WHERE r.order_id=? AND (b.state!='released' OR b.proof!=1 OR b.expiry<=?)", (oid, int(time.time()))).fetchone()
        if invalid:
            raise Error('A reserved lot is no longer released. Contact support or cancel this order.', 409)
        c.execute("UPDATE reservations SET state='consumed' WHERE order_id=? AND state='held'", (oid,))
        c.execute("UPDATE payments SET status='captured' WHERE order_id=?", (oid,))
        p['history'].append({'state': 'paid', 'at': int(time.time())})
        c.execute("UPDATE orders SET state='paid',data=? WHERE id=?", (json.dumps(p), oid))
        self.log(c, s['user_id'], 'preview_payment_captured', oid)

    def pay(self, s, oid, data):
        outcome = data.get('outcome')
        if outcome not in ('success', 'failure', 'cancelled', 'uncertain'):
            raise Error('Choose a preview payment outcome.')
        with self.db() as c:
            self.expire(c)
            r, p = self.owned_order(c, s, oid)
            if r['user_id'] != s['user_id']:
                raise Error('Use the purchasing customer session.', 403)
            status = self.payment_status(c, oid)
            if r['state'] == 'paid' or status == 'captured':
                return {'id': oid, 'state': 'paid', 'payment': 'captured', 'idempotent': True}
            if status == 'processing':
                raise Error('We’re still confirming your last payment attempt. Check its status before trying again.', 409, reason='processing')
            if r['state'] != 'pending':
                raise Error('This payment reservation is no longer active. Start a new checkout.', 409, reason='inactive')
            if outcome in ('failure', 'cancelled'):
                c.execute('UPDATE payments SET status=? WHERE order_id=?', ('failed' if outcome == 'failure' else 'cancelled', oid))
                self.log(c, s['user_id'], 'preview_payment_' + ('failed' if outcome == 'failure' else 'cancelled'), oid)
                return {'id': oid, 'state': 'pending', 'payment': 'failed' if outcome == 'failure' else 'cancelled',
                        'message': 'No money moved. You can try again while the reservation is active.'}
            if outcome == 'uncertain':
                c.execute("UPDATE payments SET status='processing' WHERE order_id=?", (oid,))
                self.log(c, s['user_id'], 'preview_payment_uncertain', oid)
                return {'id': oid, 'state': 'pending', 'payment': 'processing',
                        'message': 'We didn’t get a final answer from the payment provider. Don’t pay again: check the status first.'}
            self.capture(c, s, oid, p)
        return {'id': oid, 'state': 'paid', 'payment': 'captured', 'message': 'Payment received. Thank you.'}

    # ---------------- account view ----------------
    NEXT = {
        'pending': ('Complete payment', 'Your stock is reserved while the payment step is open.'),
        'paid': ('Preparing your order', 'Next: we pack it and hand it to our courier partner. Tracking appears here once it ships.'),
        'shipped': ('On its way', 'Next: delivery. Follow the courier’s tracking below.'),
        'delivered': ('Delivered', 'You can review what you received.'),
        'cancelled': ('Cancelled', 'Nothing further is needed unless a refund is pending.'),
        'expired': ('Reservation expired', 'This order wasn’t paid in time. Start a new checkout if you still want these products.'),
    }

    def account_view(self, s):
        snap = self.snapshot(s)
        if s['role'] not in ('customer',):
            return snap
        with self.db() as c:
            for o in snap['orders']:
                o['payment'] = self.payment_status(c, o['id'])
                o['lots'] = [{'batch': r['batch'], 'product': r['product'], 'quantity': r['quantity'], 'state': r['state']} for r in c.execute(
                    "SELECT r.batch, r.quantity, r.state, b.product FROM reservations r JOIN batches b ON b.id=r.batch WHERE r.order_id=? AND r.state='consumed' ORDER BY r.batch", (o['id'],))]
                n = self.NEXT.get(o['state'])
                if o['state'] == 'pending' and o['payment'] == 'processing':
                    n = ('Payment being confirmed', 'Check the payment status before trying again.')
                o['next'] = {'title': n[0], 'text': n[1]} if n else None
                o['invoice'] = None
            p = self.profile(c, s['user_id'])
            snap['profile'] = {'name': s['name'], 'mobile': s['mobile'], 'email': p['email'], 'email_verified': False, 'prefs': p['prefs'], 'prefs_updated': p.get('prefs_updated'),
                               'default_address': p['default_address'], 'default_card': p.get('default_card'), 'signed_in': is_customer(s)}
            k = c.execute('SELECT * FROM credentials WHERE user_id=?', (s['user_id'],)).fetchone()
            snap['profile'].update({'email_verified': bool(k and k['email_verified'] and (k['email'] or '') == (p['email'] or '').lower()),
                                    'has_password': bool(k and k['pw_hash']), 'pw_updated': k['pw_updated'] if k else None})
            snap['cards'] = [dict(json.loads(r['data']), id=r['id']) for r in c.execute('SELECT * FROM cards WHERE user_id=? ORDER BY rowid', (s['user_id'],))]
            for card in snap['cards']:
                card.pop('token', None)
            snap['sessions'] = c.execute('SELECT COUNT(*) FROM sessions WHERE user_id=? AND expires>?', (s['user_id'], int(time.time()))).fetchone()[0] if is_customer(s) else 1
            snap['otp_mode'] = otp_sender().mode
        return snap
