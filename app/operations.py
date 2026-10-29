"""Single-owner operations, persistent catalog drafts, stock ledger and operational records."""
import hashlib
import hmac
import json
import os
import re
import secrets
import time
from pathlib import Path
try:
    from app.errors import Error
    from app import media
except ImportError:
    from errors import Error
    import media

OWNER = 'store-owner'
FLAG_DEFAULTS = {'ingredient_library': True, 'reviews': True, 'questions': True, 'checkout_enabled': True}
FIELDS = {'name': 160, 'subtitle': 300, 'description': 6000, 'ingredients': 4000,
          'directions': 3000, 'warnings': 3000, 'storage': 1500, 'allergens': 1500,
          'pack_size': 160, 'format': 100, 'category': 100, 'sku': 80, 'color': 7,
          'seo_title': 160, 'seo_description': 320}

class OperationsMixin:
    def operations_init(self, c):
        c.executescript('''
        CREATE TABLE IF NOT EXISTS operation_requests(id TEXT PRIMARY KEY, actor TEXT NOT NULL, action TEXT NOT NULL, fingerprint TEXT NOT NULL, response TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS admin_credential(singleton INTEGER PRIMARY KEY CHECK(singleton=1), username TEXT NOT NULL, salt TEXT NOT NULL, digest TEXT NOT NULL, updated INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS admin_attempts(bucket TEXT PRIMARY KEY, failures INTEGER NOT NULL, until_at INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS product_drafts(product TEXT PRIMARY KEY, data TEXT NOT NULL, version INTEGER NOT NULL, updated INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS product_versions(id INTEGER PRIMARY KEY, product TEXT, data TEXT, created INTEGER, actor TEXT);
        CREATE TABLE IF NOT EXISTS catalog_media(id TEXT PRIMARY KEY, mime TEXT, ext TEXT, width INTEGER, height INTEGER, created INTEGER);
        CREATE TABLE IF NOT EXISTS stock_moves(id TEXT PRIMARY KEY, batch TEXT, quantity INTEGER, kind TEXT, reason TEXT, actor TEXT, created INTEGER);
        CREATE TABLE IF NOT EXISTS batch_meta(batch TEXT PRIMARY KEY, data TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS operation_details(audit_id INTEGER PRIMARY KEY, before_data TEXT, after_data TEXT, remarks TEXT);
        ''')
        # Retain historical actors without retaining usable demo administrator accounts.
        c.execute("DELETE FROM sessions WHERE user_id IN ('admin-a','admin-b','viewer')")
        c.execute("UPDATE users SET role='retired' WHERE id IN ('admin-a','admin-b','viewer')")
        c.execute("INSERT OR IGNORE INTO users VALUES(?,?,?,?)", (OWNER, 'Store admin', '', 'admin'))
        formats={'iron-bisglycinate':'Capsules','l-theanine':'Capsules','vitamin-d3-k2':'Softgels','omega-3-fish-oil':'Softgels','myo-d-chiro-inositol':'Capsules','creatine-chews':'Chewable tablets','psyllium-husk':'Capsules'}
        for row in c.execute('SELECT id,data FROM products').fetchall():
            p=json.loads(row['data']);p.setdefault('sku',row['id'].upper());p.setdefault('format',formats.get(row['id'],''))
            c.execute('UPDATE products SET data=? WHERE id=?',(json.dumps(p),row['id']))
        for b in c.execute('SELECT * FROM batches').fetchall():
            if not c.execute('SELECT 1 FROM stock_moves WHERE batch=?',(b['id'],)).fetchone():
                self.stock_move(c,{'user_id':'system'},b['id'],b['available'],'migrated_balance','Available balance migrated from the preview; earlier movements remain in the legacy audit.')
        self.catalog_dir = Path(self.path).parent / (Path(self.path).stem + '-catalog-media')
        self.catalog_dir.mkdir(exist_ok=True)
        flags = json.loads(c.execute("SELECT data FROM settings WHERE id='flags'").fetchone()[0])
        for k, v in FLAG_DEFAULTS.items(): flags.setdefault(k, v)
        c.execute("UPDATE settings SET data=? WHERE id='flags'", (json.dumps(flags),))

    def operation_log(self, c, actor, action, target, before=None, after=None, remarks=''):
        cur = c.execute('INSERT INTO audit(actor,action,target,created) VALUES(?,?,?,?)', (actor, action, target, int(time.time())))
        c.execute('INSERT INTO operation_details VALUES(?,?,?,?)', (cur.lastrowid, json.dumps(before), json.dumps(after), remarks))

    def setup_admin(self, username, password):
        username = str(username).strip().lower()
        if not 3 <= len(username) <= 120 or not 8 <= len(password) <= 256:
            raise Error('Use a login name of 3–120 characters and a password of at least 8 characters.')
        salt = secrets.token_hex(24)
        digest = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=16384, r=8, p=1).hex()
        with self.db() as c:
            if c.execute('SELECT 1 FROM admin_credential').fetchone(): raise Error('The admin account already exists. Use password change or the local recovery command.', 409)
            c.execute('INSERT INTO admin_credential VALUES(1,?,?,?,?)', (username, salt, digest, int(time.time())))
            self.operation_log(c, OWNER, 'admin_configured', OWNER)
        return {'ok': True}

    def credential_matches(self, row, username, password):
        salt = bytes.fromhex(row['salt']) if row else b'\0' * 24
        digest = hashlib.scrypt(str(password).encode()[:1024], salt=salt, n=16384, r=8, p=1).hex()
        return bool(row and hmac.compare_digest(digest, row['digest']) and hmac.compare_digest(str(username).strip().lower().encode(), row['username'].encode()))

    def admin_signin(self, s, data, bucket='local'):
        blocked = False
        valid = False
        with self.db() as c:
            now = int(time.time())
            attempt = c.execute('SELECT * FROM admin_attempts WHERE bucket=?', (bucket,)).fetchone()
            if attempt and attempt['failures'] >= 5 and attempt['until_at'] > now:
                blocked = True
            else:
                row = c.execute('SELECT * FROM admin_credential WHERE singleton=1').fetchone()
                valid = self.credential_matches(row, data.get('username', ''), data.get('password', ''))
                if not valid:
                    count = attempt['failures'] + 1 if attempt and attempt['until_at'] > now else 1
                    c.execute('INSERT OR REPLACE INTO admin_attempts VALUES(?,?,?)', (bucket, count, now + 300))
                else:
                    c.execute('DELETE FROM admin_attempts WHERE bucket=?', (bucket,))
                    c.execute('DELETE FROM sessions WHERE id=?', (s['id'],))
                    sid, csrf = secrets.token_hex(32), secrets.token_hex(24)
                    c.execute('INSERT INTO sessions VALUES(?,?,?,?)', (sid, OWNER, csrf, now + 8 * 3600))
                    self.operation_log(c, OWNER, 'admin_signed_in', OWNER)
        if blocked: raise Error('Too many login attempts. Try again in five minutes.', 429)
        if not valid: raise Error('The username or password is incorrect.', 401)
        return {'ok': True, '_sid': sid}

    def admin_password(self, s, data):
        self.require(s, 'admin')
        password = data.get('new_password', '')
        if not isinstance(password, str) or not 12 <= len(password) <= 256: raise Error('Choose a new password with at least 12 characters.')
        with self.db() as c:
            row = c.execute('SELECT * FROM admin_credential WHERE singleton=1').fetchone()
            if not self.credential_matches(row, row['username'], data.get('current_password', '')): raise Error('The current password is incorrect.', 403)
            salt = secrets.token_hex(24)
            digest = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=16384, r=8, p=1).hex()
            c.execute('UPDATE admin_credential SET salt=?,digest=?,updated=? WHERE singleton=1', (salt, digest, int(time.time())))
            c.execute('DELETE FROM sessions WHERE user_id=?', (OWNER,))
            self.operation_log(c, OWNER, 'admin_password_changed', OWNER)
        return {'ok': True}

    def operations_snapshot(self, c, result):
        drafts = {r['product']: dict(r) for r in c.execute('SELECT * FROM product_drafts')}
        result['products'] = []
        for row in c.execute('SELECT * FROM products'):
            p = json.loads(row['data'])
            draft = drafts.get(row['id'])
            p['draft'] = json.loads(draft['data']) if draft else None
            p['edit_version'] = draft['version'] if draft else p.get('version', 0)
            result['products'].append(p)
        for b in result['batches']:
            meta = c.execute('SELECT data FROM batch_meta WHERE batch=?', (b['id'],)).fetchone()
            b['meta'] = json.loads(meta['data']) if meta else {}
            b['reserved'] = c.execute("SELECT COALESCE(SUM(quantity),0) FROM reservations WHERE batch=? AND state='held'", (b['id'],)).fetchone()[0]
        for o in result['orders']:
            o['allocations'] = [dict(r) for r in c.execute('SELECT batch,quantity,state FROM reservations WHERE order_id=?', (o['id'],))]
        for event in result.get('audit',[]):
            detail = c.execute('SELECT * FROM operation_details WHERE audit_id=?', (event['id'],)).fetchone()
            if detail:
                event.update({'before': json.loads(detail['before_data']), 'after': json.loads(detail['after_data']), 'remarks': detail['remarks']})
        result['movements'] = [dict(r) for r in c.execute('SELECT * FROM stock_moves ORDER BY created DESC,rowid DESC LIMIT 1000')]
        result['integrations'] = [
            {'id': 'payments', 'name': 'Payments', 'state': 'not_connected', 'description': 'Payment simulation remains enabled locally. Provider credentials, signed webhooks and reconciliation are needed for live payments.'},
            {'id': 'shipping', 'name': 'Shipping', 'state': 'not_connected', 'description': 'Manual tracking can be recorded. Courier booking and status webhooks need a provider connection.'},
            {'id': 'messaging', 'name': 'Email & messaging', 'state': 'not_connected', 'description': 'Replies are saved in the customer portal. External email and WhatsApp delivery are not configured.'},
            {'id': 'marketplace', 'name': 'Amazon', 'state': 'not_connected', 'description': 'Marketplace orders and FBA stock are not imported. D2C inventory remains separate.'}]
        return result

    def product_save(self, c, s, data):
        raw = data.get('product')
        if not isinstance(raw, dict): raise Error('Complete the product details.')
        pid = raw.get('id', '')
        if not isinstance(pid, str) or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', pid) or len(pid) > 60: raise Error('Use a product ID with lowercase letters, numbers and hyphens (up to 60 characters).')
        row = c.execute('SELECT data FROM products WHERE id=?', (pid,)).fetchone()
        old = json.loads(row['data']) if row else None
        dr = c.execute('SELECT * FROM product_drafts WHERE product=?', (pid,)).fetchone()
        current_version = dr['version'] if dr else (old or {}).get('version', 0)
        if data.get('version', 0) != current_version: raise Error('This product changed in another window. Reload it before saving.', 409)
        p = {**(json.loads(dr['data']) if dr else old or {}), 'id': pid}
        for key, limit in FIELDS.items():
            value = raw.get(key, p.get(key, ''))
            if not isinstance(value, str) or len(value) > limit: raise Error('Check the ' + key.replace('_', ' ') + ' field.')
            p[key] = value.strip()
        if not p['name'] or not p['sku']: raise Error('Product name and SKU are required.')
        if not re.fullmatch(r'#[0-9a-fA-F]{6}', p['color']): raise Error('Choose a valid product color.')
        for other in c.execute('SELECT id,data FROM products WHERE id!=?', (pid,)):
            if json.loads(other['data']).get('sku', '').lower() == p['sku'].lower(): raise Error('Another product uses this SKU.', 409)
        for other in c.execute('SELECT product,data FROM product_drafts WHERE product!=?', (pid,)):
            if json.loads(other['data']).get('sku', '').lower() == p['sku'].lower(): raise Error('Another draft uses this SKU.', 409)
        if type(raw.get('price')) != int or not 0 <= raw['price'] <= 1000000: raise Error('Enter a price in whole rupees between 0 and 1,000,000.')
        p['price'] = raw['price']
        gallery = raw.get('gallery', p.get('gallery', []))
        if not isinstance(gallery, list) or len(gallery) > 12: raise Error('Use up to 12 gallery images.')
        p['gallery'] = []
        for item in gallery:
            if not isinstance(item, dict): raise Error('Check the product gallery.')
            src = item.get('src', '')
            if not isinstance(src, str) or not re.fullmatch(r'/(?:api/catalog-media/CM-[a-f0-9]{16}|web/media/[A-Za-z0-9_./-]+\.(?:webp|png|jpg|jpeg)|concepts/media/[A-Za-z0-9_-]+\.webp)', src) or '..' in src: raise Error('Upload a product image or select an existing local image.')
            if src.startswith('/api/catalog-media/') and not c.execute('SELECT 1 FROM catalog_media WHERE id=?', (src.rsplit('/', 1)[1],)).fetchone(): raise Error('An uploaded image is missing.')
            alt = item.get('alt', p['name'])
            if not isinstance(alt, str) or not 1 <= len(alt.strip()) <= 300: raise Error('Add image alt text (up to 300 characters).')
            dimensions=c.execute('SELECT width,height FROM catalog_media WHERE id=?',(src.rsplit('/',1)[1],)).fetchone() if src.startswith('/api/') else None
            p['gallery'].append({'src': src, 'alt': alt.strip(), 'w': dimensions['width'] if dimensions else 720, 'h': dimensions['height'] if dimensions else 1000})
        p['version'] = current_version + 1
        p['preview'] = True
        p.setdefault('published', False)
        if not row:
            placeholder = {**p, 'published': False, 'version': 0}
            c.execute('INSERT INTO products VALUES(?,?)', (pid, json.dumps(placeholder)))
        c.execute('INSERT OR REPLACE INTO product_drafts VALUES(?,?,?,?)', (pid, json.dumps(p), p['version'], int(time.time())))
        self.operation_log(c, s['user_id'], 'product_draft_saved', pid, old, p, str(data.get('remarks', ''))[:1000])
        return {'ok': True, 'id': pid, 'version': p['version']}

    def catalog_upload(self, s, raw):
        self.require(s, 'admin')
        try: _, mime, ext, clean, w, h = media.sanitise(raw)
        except media.MediaError as e: raise Error(str(e), 415)
        mid = 'CM-' + secrets.token_hex(8)
        path = self.catalog_dir / (mid + ext)
        try:
            with path.open('xb') as file: file.write(clean)
            with self.db() as c:
                c.execute('INSERT INTO catalog_media VALUES(?,?,?,?,?,?)', (mid, mime, ext, w, h, int(time.time())))
                self.operation_log(c, s['user_id'], 'catalog_image_uploaded', mid)
        except Exception:
            path.unlink(missing_ok=True)
            raise
        return {'src': '/api/catalog-media/' + mid, 'alt': 'Product image', 'w': w, 'h': h}

    def catalog_file(self, s, mid):
        with self.db() as c:
            row = c.execute('SELECT * FROM catalog_media WHERE id=?', (mid,)).fetchone()
            public = any(any(g.get('src') == '/api/catalog-media/' + mid for g in json.loads(p['data']).get('gallery', []) if g.get('visible',True)) for p in c.execute('SELECT data FROM products') if json.loads(p['data']).get('published'))
            if not row or (not public and s['role'] != 'admin'): raise Error('Image not found.', 404)
            path = self.catalog_dir / (mid + row['ext'])
            if not path.is_file(): raise Error('Image not found.', 404)
            return row['mime'], path.read_bytes()

    def operations_dispatch(self, c, s, action, data):
        key = data.get('request_id')
        if key is not None and (not isinstance(key,str) or not re.fullmatch(r'[A-Za-z0-9-]{16,100}',key)):
            raise Error('Invalid operation request identifier.')
        fingerprint=hashlib.sha256(json.dumps({k:v for k,v in data.items() if k!='request_id'},sort_keys=True).encode()).hexdigest()
        if key:
            previous=c.execute('SELECT * FROM operation_requests WHERE id=?',(key,)).fetchone()
            if previous:
                if previous['actor']!=s['user_id'] or previous['action']!=action or previous['fingerprint']!=fingerprint:
                    raise Error('This request was already used for a different change. Reload the record.',409)
                return {**json.loads(previous['response']),'idempotent':True}
        response=self.operations_action(c,s,action,data)
        if key:c.execute('INSERT INTO operation_requests VALUES(?,?,?,?,?)',(key,s['user_id'],action,fingerprint,json.dumps(response)))
        return response

    def operations_action(self, c, s, action, data):
        reason = str(data.get('remarks', '')).strip()
        if action == 'product_save': return self.product_save(c, s, data)
        if action == 'product_publish':
            row = c.execute('SELECT * FROM product_drafts WHERE product=?', (data.get('id'),)).fetchone()
            if not row: raise Error('Save a product draft first.', 409)
            if row['version'] != data.get('version'): raise Error('The draft has changed. Reload and review it.', 409)
            p = json.loads(row['data'])
            if not p.get('gallery'): raise Error('Add at least one product image before publishing.')
            if len(reason) < 5: raise Error('Add a publication remark.')
            old = json.loads(c.execute('SELECT data FROM products WHERE id=?', (row['product'],)).fetchone()[0])
            p['published'] = True
            c.execute('INSERT INTO product_versions(product,data,created,actor) VALUES(?,?,?,?)', (p['id'], json.dumps(old), int(time.time()), s['user_id']))
            c.execute('UPDATE products SET data=? WHERE id=?', (json.dumps(p), p['id']))
            c.execute('DELETE FROM product_drafts WHERE product=?', (p['id'],))
            self.operation_log(c, s['user_id'], 'product_published', p['id'], old, p, reason)
            return {'ok': True}
        if action == 'product_archive':
            row = c.execute('SELECT data FROM products WHERE id=?', (data.get('id'),)).fetchone()
            if not row: raise Error('Product not found.', 404)
            if len(reason) < 5: raise Error('Add an archive remark.')
            p = json.loads(row[0]); old = dict(p)
            p['published'] = False; p['version'] = p.get('version', 0) + 1
            c.execute('UPDATE products SET data=? WHERE id=?', (json.dumps(p), p['id']))
            self.operation_log(c, s['user_id'], 'product_archived', p['id'], old, p, reason)
            return {'ok': True}
        if action == 'batch_create':
            bid = data.get('id', '')
            if not isinstance(bid, str) or not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._-]{0,39}', bid): raise Error('Use a lot number of up to 40 letters, numbers, dots, underscores or hyphens.')
            if not c.execute('SELECT 1 FROM products WHERE id=?', (data.get('product'),)).fetchone(): raise Error('Choose an existing product.')
            if c.execute('SELECT 1 FROM batches WHERE upper(id)=upper(?)', (bid,)).fetchone(): raise Error('This batch number already exists.', 409)
            expiry = data.get('expiry')
            qty = data.get('quantity')
            if type(expiry) != int or expiry <= time.time(): raise Error('Choose a future expiry date.')
            if data.get('manufactured') and (not re.fullmatch(r'\d{4}-\d{2}-\d{2}',str(data['manufactured'])) or data['manufactured']>time.strftime('%Y-%m-%d')):raise Error('Choose a valid manufacturing date that is not in the future.')
            if type(qty) != int or not 0 <= qty <= 1000000: raise Error('Enter a valid opening quantity.')
            if len(reason) < 5: raise Error('Add an opening-stock remark.')
            c.execute('INSERT INTO batches VALUES(?,?,?,?,?,?)', (bid, data['product'], expiry, qty, 'quarantined', 0))
            c.execute('INSERT INTO batch_meta VALUES(?,?)', (bid, json.dumps({'location': str(data.get('location', 'Main warehouse'))[:160], 'manufactured': str(data.get('manufactured', ''))[:10]})))
            self.stock_move(c, s, bid, qty, 'opening', reason)
            self.operation_log(c, s['user_id'], 'batch_created', bid, None, data, reason)
            return {'ok': True}
        if action == 'batch_adjust':
            b = c.execute('SELECT * FROM batches WHERE id=?', (data.get('id'),)).fetchone()
            qty = data.get('quantity')
            if not b: raise Error('Batch not found.', 404)
            if type(qty) != int or not -1000000 <= qty <= 1000000 or qty == 0 or b['available'] + qty < 0: raise Error('Enter a nonzero adjustment that does not make available stock negative.')
            if len(reason) < 5: raise Error('Explain this stock adjustment.')
            c.execute('UPDATE batches SET available=available+? WHERE id=?', (qty, b['id']))
            self.stock_move(c, s, b['id'], qty, 'adjustment', reason)
            self.operation_log(c, s['user_id'], 'stock_adjusted', b['id'], {'available': b['available']}, {'available': b['available'] + qty}, reason)
            return {'ok': True}
        if action == 'batch_release':
            b = c.execute('SELECT * FROM batches WHERE id=?', (data.get('id'),)).fetchone()
            if not b: raise Error('Batch not found.', 404)
            if b['expiry'] <= time.time(): raise Error('Expired stock cannot be released.', 409)
            if len(reason) < 5 or data.get('evidence_confirmed') is not True: raise Error('Confirm that batch evidence has been checked and add a release remark.')
            c.execute("UPDATE batches SET proof=1,state='released' WHERE id=?", (b['id'],))
            self.operation_log(c, s['user_id'], 'batch_released', b['id'], dict(b), {'state': 'released', 'proof': 1}, reason)
            return {'ok': True}
        if action == 'order_update':
            r, p = self.owned_order(c, s, data.get('id'))
            if len(reason) < 5: raise Error('Add a remark for this order action.')
            target = data.get('state', '')
            old = {'state': r['state'], 'provider': p.get('provider'), 'tracking': p.get('tracking')}
            if target not in ('note', 'packing', 'shipped', 'delivered', 'cancelled'): raise Error('Choose a supported order action.')
            allowed = {'packing': ['paid'], 'shipped': ['paid', 'packing'], 'delivered': ['shipped'], 'cancelled': ['pending', 'paid', 'packing']}
            if target != 'note' and r['state'] not in allowed[target]: raise Error('This action is not valid for the current order state.', 409)
            if target == 'shipped':
                bad = c.execute("SELECT 1 FROM reservations r JOIN batches b ON b.id=r.batch WHERE r.order_id=? AND (b.state!='released' OR b.proof!=1 OR b.expiry<=?)", (r['id'], int(time.time()))).fetchone()
                if bad: raise Error('Resolve quarantined, expired or unreleased batches before shipping.', 409)
                provider, tracking = str(data.get('provider', '')).strip(), str(data.get('tracking', '')).strip()
                if not provider or not tracking or len(provider) > 120 or len(tracking) > 160: raise Error('Enter the courier and tracking number.')
                p['provider'], p['tracking'] = provider, tracking
            if target == 'cancelled':
                if self.payment_status(c, r['id']) == 'processing': raise Error('Reconcile the uncertain payment before cancelling.', 409)
                for held in c.execute("SELECT * FROM reservations WHERE order_id=? AND state IN ('held','consumed')", (r['id'],)).fetchall():
                    c.execute('UPDATE batches SET available=available+? WHERE id=?', (held['quantity'], held['batch']))
                    c.execute("UPDATE reservations SET state='released' WHERE id=?", (held['id'],))
                    self.stock_move(c, s, held['batch'], held['quantity'], 'cancellation', reason)
                if self.payment_status(c, r['id']) == 'captured': p['refund'] = 'pending_refund'
            # Private remarks are never inserted into the public customer timeline.
            p.setdefault('internal_notes', []).append({'text': reason, 'at': int(time.time()), 'actor': s['user_id']})
            public = str(data.get('public_note', '')).strip()[:1000]
            if target != 'note' or public:
                p['history'].append({'state': target if target != 'note' else r['state'], 'at': int(time.time()), **({'note': public} if public else {})})
            state = r['state'] if target == 'note' else target
            c.execute('UPDATE orders SET state=?,data=? WHERE id=?', (state, json.dumps(p), r['id']))
            self.operation_log(c, s['user_id'], 'order_' + target, r['id'], old, {'state': state, 'provider': p.get('provider'), 'tracking': p.get('tracking')}, reason)
            return {'ok': True}
        if action == 'flags_update':
            key, value = data.get('key'), data.get('value')
            if key not in FLAG_DEFAULTS or type(value) != bool: raise Error('Choose a supported feature flag.')
            if len(reason) < 5: raise Error('Explain the feature change.')
            flags = json.loads(c.execute("SELECT data FROM settings WHERE id='flags'").fetchone()[0]); old = dict(flags)
            flags[key] = value
            c.execute("UPDATE settings SET data=? WHERE id='flags'", (json.dumps(flags),))
            self.operation_log(c, s['user_id'], 'feature_flag_changed', key, old, flags, reason)
            return {'ok': True}
        raise Error('Unknown operation.', 404)

    def stock_move(self, c, s, batch, quantity, kind, reason):
        c.execute('INSERT INTO stock_moves VALUES(?,?,?,?,?,?,?)', ('MOV-' + secrets.token_hex(8), batch, quantity, kind, reason, s['user_id'], int(time.time())))
