"""Body Cafe Co local preview. Standard library only; never a live payment server."""
import argparse
import contextlib
import hashlib
import hmac
import json
import mimetypes
import os
from pathlib import Path
import re
import secrets
import sqlite3
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs, unquote

try:
    from app import media, lots, account, support, operations, commerce
    from app.errors import Error
except ImportError:  # run as a script: python3 app/server.py
    import media, lots, account, support, operations, commerce
    from errors import Error

ROOT = Path(__file__).resolve().parent.parent
PRODUCTS = [
    ('iron-bisglycinate','Iron Bisglycinate','Iron, with the details in view.','Iron bisglycinate',899,'#aa472e','Daily essentials'),
    ('l-theanine','L-Theanine','Get to know your everyday ingredient.','L-Theanine',1699,'#777d51','Daily essentials'),
    ('vitamin-d3-k2','Vitamin D3 + K2','With Omega-3 as triglycerides.','Vitamin D3, Vitamin K2 and Omega-3 as triglycerides',1049,'#35306f','Daily essentials'),
    ('omega-3-fish-oil','Omega-3 Fish Oil','A closer look at your Omega-3.','Omega-3 fish oil',1949,'#84919b','Daily essentials'),
    ('myo-d-chiro-inositol','Myo & D-Chiro Inositol','Two ingredients. All the details.','Myo-inositol and D-chiro inositol',1499,'#b184b9','Ingredient pairs'),
    ('creatine-chews','Creatine Chews','Meet creatine in a chew.','Creatine; complete formulation pending',749,'#07566a','Chews'),
    ('psyllium-husk','Psyllium Husk','Make room for a little curiosity.','Psyllium husk',949,'#9c9274','Daily essentials'),
]
BUNDLES = [
    {'id':'daily-edit','name':'The daily edit','description':'An example collection of D3 + K2 and Omega-3.','items':['vitamin-d3-k2','omega-3-fish-oil']},
    {'id':'curious-edit','name':'The curious edit','description':'An example collection of L-Theanine and Creatine Chews.','items':['l-theanine','creatine-chews']},
]

LEARN_TOPIC=re.compile(r'/learn(/[a-z0-9-]{1,60})?(#[a-z0-9-]{1,40})?')
CASE_TOPIC=re.compile(r'/(learn(/[a-z0-9-]{1,60})?|story|about|help/[a-z]{2,20}/[a-z0-9-]{2,60}|policies/(shipping|returns|cancellation|privacy|terms)|products/[a-z0-9-]{1,60})(#[a-z0-9-]{1,40})?')

class Store(commerce.CommerceMixin, operations.OperationsMixin, lots.LotsMixin, account.AccountMixin, support.SupportMixin):
    def __init__(self, path):
        self.path = str(path)
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        # Review photos live beside the database, outside the web root, and are served only through the API.
        self.media_dir = Path(path).parent / (Path(path).stem + '-review-media')
        self.media_dir.mkdir(parents=True, exist_ok=True)
        # Laboratory documents also live outside the web root; only published versions are served, through the API.
        self.lot_dir = Path(path).parent / (Path(path).stem + '-lot-documents')
        self.lot_dir.mkdir(parents=True, exist_ok=True)
        with self.db() as c:
            c.executescript('''
            CREATE TABLE IF NOT EXISTS products(id TEXT PRIMARY KEY, data TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS batches(id TEXT PRIMARY KEY, product TEXT, expiry INTEGER, available INTEGER, state TEXT, proof INTEGER);
            CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, name TEXT, mobile TEXT, role TEXT);
            CREATE TABLE IF NOT EXISTS sessions(id TEXT PRIMARY KEY, user_id TEXT, csrf TEXT, expires INTEGER);
            CREATE TABLE IF NOT EXISTS otps(mobile TEXT PRIMARY KEY, digest TEXT, expires INTEGER, attempts INTEGER, sent INTEGER);
            CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY, user_id TEXT, state TEXT, data TEXT, created INTEGER);
            CREATE TABLE IF NOT EXISTS reservations(id TEXT PRIMARY KEY, order_id TEXT, batch TEXT, quantity INTEGER, expires INTEGER, state TEXT);
            CREATE TABLE IF NOT EXISTS payments(id TEXT PRIMARY KEY, order_id TEXT UNIQUE, status TEXT, amount INTEGER);
            CREATE TABLE IF NOT EXISTS cases(id TEXT PRIMARY KEY, user_id TEXT, data TEXT, created INTEGER);
            CREATE TABLE IF NOT EXISTS approvals(id TEXT PRIMARY KEY, creator TEXT, kind TEXT, target TEXT, payload TEXT, state TEXT, approver TEXT, created INTEGER);
            CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY, actor TEXT, action TEXT, target TEXT, created INTEGER);
            CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY, user_id TEXT, name TEXT, created INTEGER);
            CREATE TABLE IF NOT EXISTS addresses(id TEXT PRIMARY KEY, user_id TEXT, data TEXT);
            CREATE TABLE IF NOT EXISTS reviews(id TEXT PRIMARY KEY, user_id TEXT, product TEXT, order_id TEXT, data TEXT, UNIQUE(user_id,product,order_id));
            CREATE TABLE IF NOT EXISTS settings(id TEXT PRIMARY KEY,data TEXT);
            CREATE TABLE IF NOT EXISTS review_media(id TEXT PRIMARY KEY, user_id TEXT, product TEXT, review_id TEXT, mime TEXT, ext TEXT, bytes INTEGER, width INTEGER, height INTEGER, state TEXT, created INTEGER);
            CREATE TABLE IF NOT EXISTS review_votes(review_id TEXT, user_id TEXT, created INTEGER, PRIMARY KEY(review_id,user_id));
            CREATE TABLE IF NOT EXISTS learn_feedback(id INTEGER PRIMARY KEY, page TEXT, section TEXT, clear INTEGER, session TEXT, created INTEGER);
            CREATE TABLE IF NOT EXISTS theme_feedback(id TEXT PRIMARY KEY, data TEXT NOT NULL, created INTEGER NOT NULL);
            CREATE TABLE IF NOT EXISTS review_reports(id INTEGER PRIMARY KEY, review_id TEXT, user_id TEXT, reason TEXT, note TEXT, state TEXT, created INTEGER, UNIQUE(review_id,user_id));
            ''')
            self.lots_init(c)
            self.account_init(c)
            self.support_init(c)
            for i,p in enumerate(PRODUCTS):
                data = dict(zip(['id','name','subtitle','ingredients','price','color','category'],p))
                data.update({'preview':True,'published':True,'formula_approved':False,'label_note':'Full formulation, quantities, directions and warnings await approved rear labels.'})
                c.execute('INSERT OR IGNORE INTO products VALUES(?,?)',(p[0],json.dumps(data)))
                for j,days in enumerate([180,365]):
                    c.execute('INSERT OR IGNORE INTO batches VALUES(?,?,?,?,?,?)',(f'DEMO-{i+1:02d}-{j+1:02d}',p[0],int(time.time())+days*86400,20,'released',1))
            # One-time price-sheet update; preserve later deliberate operations edits.
            price_version = 'price-sheet-2026-10-24'
            if not c.execute('SELECT 1 FROM settings WHERE id=?', (price_version,)).fetchone():
                for p in PRODUCTS:
                    row = c.execute('SELECT data FROM products WHERE id=?', (p[0],)).fetchone()
                    data = json.loads(row['data'])
                    data['price'] = p[4]
                    c.execute('UPDATE products SET data=? WHERE id=?', (json.dumps(data), p[0]))
                c.execute('INSERT INTO settings VALUES(?,?)', (price_version, 'true'))
            c.execute('INSERT OR IGNORE INTO settings VALUES(?,?)',('flags',json.dumps({'ingredient_library':True,'referrals':False,'amazon_sync':False})))
            self.operations_init(c)


    @contextlib.contextmanager
    def db(self):
        c = sqlite3.connect(self.path, timeout=20)
        c.row_factory = sqlite3.Row
        c.execute('PRAGMA foreign_keys=ON')
        try:
            c.execute('BEGIN IMMEDIATE')
            yield c
            c.commit()
        except Exception:
            c.rollback()
            raise
        finally:
            c.close()

    def log(self,c,actor,action,target):
        c.execute('INSERT INTO audit(actor,action,target,created) VALUES(?,?,?,?)',(actor,action,target,int(time.time())))

    def expire(self,c):
        # A reservation whose payment is still being confirmed is kept until the payment's outcome is known.
        rows=c.execute("SELECT * FROM reservations WHERE state='held' AND expires<=? AND order_id NOT IN (SELECT order_id FROM payments WHERE status='processing')",(int(time.time()),)).fetchall()
        for r in rows:
            c.execute('UPDATE batches SET available=available+? WHERE id=?',(r['quantity'],r['batch']))
            self.stock_move(c,{'user_id':'system'},r['batch'],r['quantity'],'reservation_expired',r['order_id'])
            c.execute("UPDATE reservations SET state='expired' WHERE id=?",(r['id'],))
            c.execute("UPDATE orders SET state='expired' WHERE id=? AND state='pending'",(r['order_id'],))

    def session(self,sid):
        with self.db() as c:
            self.expire(c)
            row=c.execute('SELECT s.*,u.name,u.mobile,u.role FROM sessions s JOIN users u ON s.user_id=u.id WHERE s.id=? AND s.expires>?',(sid,int(time.time()))).fetchone()
            if row:return dict(row),False
            uid='guest-'+secrets.token_hex(10);sid=secrets.token_hex(32);csrf=secrets.token_hex(24)
            c.execute('INSERT INTO users VALUES(?,?,?,?)',(uid,'Guest','','customer'))
            c.execute('INSERT INTO sessions VALUES(?,?,?,?)',(sid,uid,csrf,int(time.time())+86400))
            return {'id':sid,'user_id':uid,'csrf':csrf,'name':'Guest','mobile':'','role':'customer'},True

    def products(self, include_hidden=False):
        with self.db() as c:
            self.expire(c)
            items=[]
            for r in c.execute('SELECT * FROM products'):
                p=json.loads(r['data'])
                if not include_hidden and not p.get('published'):continue
                p['stock']=c.execute("SELECT COALESCE(SUM(available),0) FROM batches WHERE product=? AND state='released' AND proof=1 AND expiry>?",(p['id'],int(time.time()))).fetchone()[0]
                if not include_hidden:p['gallery']=[g for g in p.get('gallery',[]) if g.get('visible',True)]
                p['rating']=self.rating_summary(c,p['id'],detail=False)
                items.append(p)
            return items

    def require(self,s,role):
        if s['role']!=role:raise Error('This action requires an Admin session.',403)

    def login(self,s,data):
        raise Error('Demo identities have been retired. Use admin credential login.', 404)

    def order(self,s,data):
        if s['role']!='customer':raise Error('Use a customer session to place a preview order.',403)
        if data.get('adult') is not True:raise Error('Confirm that the purchaser is 18 or older.')
        contact=data.get('contact',{})
        if not isinstance(contact,dict):raise Error('Complete your delivery address.')
        if not re.fullmatch(r'[6-9][0-9]{9}',str(contact.get('mobile',''))):raise Error('Enter a valid mobile number.')
        if not re.fullmatch(r'[1-9][0-9]{5}',str(contact.get('pincode',''))):raise Error('Enter a valid six-digit pincode.')
        for key in ['name','address','city','state']:
            if not isinstance(contact.get(key),str) or not 2<=len(contact[key].strip())<=200:raise Error('Complete your delivery address.')
        if contact.get('email') and not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+',str(contact['email'])):raise Error('Enter a valid email address or leave it blank.')
        gst=str(data.get('gstin','')).upper().strip()
        if gst and (not re.fullmatch(r'[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]',gst) or not str(data.get('legal_name','')).strip()):raise Error('Enter a valid GSTIN and legal name.')
        if data.get('method','prepaid')!='prepaid':raise Error('COD is pending a policy decision and is unavailable in this preview.',409)
        raw=data.get('items',[])
        if not isinstance(raw,list) or not 1<=len(raw)<=30:raise Error('Your bag is empty or invalid.')
        merged={}
        for item in raw:
            if not isinstance(item,dict):raise Error('Your bag contains an invalid item.')
            qty=item.get('quantity');pid=item.get('id')
            if not isinstance(pid,str) or not 1<=len(pid)<=100:raise Error('Choose a valid product.')
            if type(qty)!=int or not 1<=qty<=10:raise Error('Choose a quantity between 1 and 10.')
            merged[pid]=merged.get(pid,0)+qty
            if merged[pid]>10:raise Error('Maximum preview quantity is 10 per product.')
        oid='BCC-'+secrets.token_hex(4).upper();now=int(time.time());lines=[];allocations=[]
        key=str(data.get('idempotency_key','') or '')
        with self.db() as c:
            self.expire(c)
            # The same checkout submitted twice (double click, retry after a network error) returns the first order.
            existing=self.order_existing(c,s,key)
            if existing:return existing
            flags=json.loads(c.execute("SELECT data FROM settings WHERE id='flags'").fetchone()[0])
            if flags.get('checkout_enabled') is False:raise Error('Checkout is temporarily paused. Your bag is saved.',409)
            for pid,qty in merged.items():
                r=c.execute('SELECT data FROM products WHERE id=?',(pid,)).fetchone()
                if not r:raise Error('Product not found.',404)
                p=json.loads(r['data'])
                if not p['published']:raise Error('This product is not available.',409)
                remaining=qty
                for batch in c.execute("SELECT * FROM batches WHERE product=? AND state='released' AND proof=1 AND expiry>? AND available>0 ORDER BY expiry,id",(pid,now)).fetchall():
                    take=min(remaining,batch['available'])
                    if take:
                        allocations.append((batch['id'],take));remaining-=take
                        c.execute('UPDATE batches SET available=available-? WHERE id=?',(take,batch['id']))
                        self.stock_move(c,s,batch['id'],-take,'reservation',oid)
                    if remaining==0:break
                if remaining:raise Error(p['name']+' does not have enough released preview stock.',409)
                lines.append({'id':pid,'name':p['name'],'quantity':qty,'unit_price':p['price'],'color':p['color']})
            subtotal=sum(x['unit_price']*x['quantity'] for x in lines)
            code=str(data.get('discount','')).strip().upper()
            if code and code!='PREVIEW10':raise Error('Use PREVIEW10 to test discounts, or remove the code.')
            discount=(subtotal+5)//10 if code else 0
            shipping=0 if subtotal-discount>=1499 else 75
            payload={'items':lines,'subtotal':subtotal,'discount':discount,'discount_code':code,'shipping':shipping,'total':subtotal-discount+shipping,'tax_note':'Sample price is inclusive of illustrative tax; actual GST awaits approved rates.','contact':contact,'gstin':gst,'legal_name':data.get('legal_name',''),'method':'prepaid','expires':now+900,'preview':True,'policy_version':'preview-2026-10-16','consent':{'email':data.get('email_consent') is True,'whatsapp':data.get('whatsapp_consent') is True},'history':[{'state':'pending','at':now}],'provider':None,'refund':'none'}
            c.execute('INSERT INTO orders VALUES(?,?,?,?,?)',(oid,s['user_id'],'pending',json.dumps(payload),now))
            for batch,qty in allocations:c.execute('INSERT INTO reservations VALUES(?,?,?,?,?,?)',(secrets.token_hex(12),oid,batch,qty,now+900,'held'))
            c.execute('INSERT INTO payments VALUES(?,?,?,?)',('PAY-'+secrets.token_hex(8),oid,'pending',payload['total']))
            self.order_key_record(c,s,key,oid)
            self.log(c,s['user_id'],'reservation_created',oid)
        return {'id':oid,**payload,'state':'pending'}

    def owned_order(self,c,s,oid):
        r=c.execute('SELECT * FROM orders WHERE id=?',(oid,)).fetchone()
        if not r or (r['user_id']!=s['user_id'] and s['role'] not in ['admin','viewer']):raise Error('Order not found.',404)
        return r,json.loads(r['data'])

    def cancel(self,s,oid):
        with self.db() as c:
            self.expire(c);r,p=self.owned_order(c,s,oid)
            if r['user_id']!=s['user_id']:raise Error('Use the purchasing customer session.',403)
            if r['state']=='cancelled':return {'ok':True,'idempotent':True}
            if r['state'] not in ['pending','paid']:raise Error('Shipment has started or the reservation expired. Open a support case.',409)
            if self.payment_status(c,oid)=='processing':raise Error('We’re still confirming your payment. Check its status first, then you can cancel.',409,reason='processing')
            for held in c.execute("SELECT * FROM reservations WHERE order_id=? AND state IN ('held','consumed')",(oid,)).fetchall():
                c.execute('UPDATE batches SET available=available+? WHERE id=?',(held['quantity'],held['batch']))
                self.stock_move(c,s,held['batch'],held['quantity'],'cancellation',oid)
                c.execute("UPDATE reservations SET state='released' WHERE id=?",(held['id'],))
            if r['state']=='paid':
                p['refund']='pending_refund'
            p['history'].append({'state':'cancelled','at':int(time.time())})
            c.execute("UPDATE orders SET state='cancelled',data=? WHERE id=?",(json.dumps(p),oid));self.log(c,s['user_id'],'order_cancelled',oid)
        return {'ok':True}

    def case(self,s,data):
        if s['role']!='customer':raise Error('Use a customer session to open a case.',403)
        kind=data.get('kind','general');text=str(data.get('message','')).strip()
        if kind not in ['general','brand','learn','report','delivery','return','replacement','safety','cancellation','product','business']:raise Error('Select a valid case type.',field='kind')
        topic=str(data.get('topic','') or '').strip()
        if topic and not (CASE_TOPIC.fullmatch(topic) or lots.LOT_TOPIC.fullmatch(topic) or topic=='/reports'):raise Error('That page reference is not valid.')
        lot_entered=str(data.get('lot','') or '').strip()[:lots.LOT_MAX]
        media_ids=data.get('media') or []
        if not isinstance(media_ids,list) or len(media_ids)>2 or not all(isinstance(m,str) and re.fullmatch(r'IMG-[0-9a-f]{16}',m) for m in media_ids):raise Error('Attach at most two photos.')
        feedback=str(data.get('feedback','') or '')
        if feedback and feedback not in ('correction','followup'):raise Error('Choose correction or follow-up.')
        if not 10<=len(text)<=3000:raise Error('Describe the issue in 10–3000 characters.',field='message')
        contact=support.contact_details(data,s) if isinstance(data.get('contact'),dict) else None
        with self.db() as c:
            oid=str(data.get('order_id','')).strip()
            if oid:
                try:self.owned_order(c,s,oid)
                except Error:raise Error('We couldn’t find that order in this account or browser session. Check the reference, or leave it blank.',404,field='order_id')
            cid='CASE-'+secrets.token_hex(4).upper()
            payload={'kind':kind,'message':text,'order_id':oid,'state':'open','owner':'Unassigned','sla':'Priority review' if kind=='safety' else 'Response time not yet confirmed','preview':True,'queue':support.QUEUES.get(kind,'General'),'history':[{'state':'open','at':int(time.time()),'note':'Case received'}]}
            if contact:payload['contact']=contact
            if topic and 'topic' not in payload and topic.startswith(('/help/','/policies/','/products/')):payload['topic']=topic
            if kind=='product' and topic.startswith('/products/'):payload['topic']=topic;payload['subject']='Product question · '+topic
            for mid in media_ids:
                m=c.execute("SELECT * FROM review_media WHERE id=? AND user_id=? AND state='case_uploaded'",(mid,s['user_id'])).fetchone()
                if not m:raise Error('A photo could not be attached. Upload it again.',409)
                c.execute("UPDATE review_media SET review_id=?,state='case' WHERE id=?",(cid,mid))
            if media_ids:payload['media']=media_ids
            if kind in ('report','safety','general','replacement') and (topic.startswith('/reports') or lot_entered):
                if topic:payload['topic']=topic
                if lot_entered:payload['lot']=lot_entered
                payload['subject']={'report':'Lot report question','safety':'Product safety · lot','replacement':'Product issue · lot'}.get(kind,'Lot question')+' · '+(topic or '/reports')+(' · lot '+lot_entered if lot_entered else '')
            if topic and kind in ('learn','brand'):
                payload['topic']=topic
                payload['subject']=({'correction':'Suggested correction','followup':'Follow-up question'}.get(feedback,'Learn question') if kind=='learn' else 'About the brand')+' · '+topic
                if feedback:payload['feedback']=feedback
            c.execute('INSERT INTO cases VALUES(?,?,?,?)',(cid,s['user_id'],json.dumps(payload),int(time.time())))
            self.log(c,s['user_id'],'safety_case_created' if kind=='safety' else 'case_created',cid)
        return {'id':cid,**payload}

    def legacy_admin(self,s,action,data):
        self.require(s,'admin')
        with self.db() as c:
            self.expire(c)
            if action in ('product_save','product_publish','product_archive','batch_create','batch_adjust','batch_release','order_update','flags_update'):
                return self.operations_dispatch(c,s,action,data)
            if action=='quarantine':
                batch=c.execute('SELECT * FROM batches WHERE id=?',(data.get('batch'),)).fetchone()
                if not batch:raise Error('Batch not found.',404)
                if len(str(data.get('reason','')).strip())<5:raise Error('Add a quarantine reason.')
                c.execute("UPDATE batches SET state='quarantined' WHERE id=?",(batch['id'],));self.operation_log(c,s['user_id'],'batch_quarantined',batch['id'],dict(batch),{'state':'quarantined'},str(data.get('reason','')))
            elif action=='ship':
                r,p=self.owned_order(c,s,data.get('id'))
                next_state={'paid':'shipped','shipped':'delivered'}.get(r['state'])
                if not next_state:raise Error('Only paid orders can ship, and shipped orders can be delivered.',409)
                if next_state=='shipped':
                    invalid=c.execute("SELECT r.id FROM reservations r JOIN batches b ON b.id=r.batch WHERE r.order_id=? AND (b.state!='released' OR b.proof!=1 OR b.expiry<=?)",(r['id'],int(time.time()))).fetchone()
                    if invalid:raise Error('A lot is not released, lacks evidence, or has expired. Resolve it before shipping.',409)
                    zone=p['contact']['pincode'][0];weight=sum(x['quantity'] for x in p['items']);index=int(hashlib.sha256((r['id']+zone+str(weight)).encode()).hexdigest(),16)%2
                    p['provider']=['Vayuvega','Shipneer'][index];p['tracking']='PREVIEW-'+r['id'];p['allocation']={'zone':zone,'weight_band':weight,'method':'deterministic preview assignment'}
                p['history'].append({'state':next_state,'at':int(time.time())});c.execute('UPDATE orders SET state=?,data=? WHERE id=?',(next_state,json.dumps(p),r['id']));self.log(c,s['user_id'],'preview_'+next_state,r['id'])
            elif action=='case':
                r=c.execute('SELECT * FROM cases WHERE id=?',(data.get('id'),)).fetchone()
                if not r:raise Error('Case not found.',404)
                if data.get('state') not in ['open','investigating','resolved','escalated']:raise Error('Invalid case state.')
                p=json.loads(r['data']);before=dict(p)
                internal=str(data.get('internal_note','')).strip()[:2000]
                if internal:p.setdefault('internal',[]).append({'text':internal,'at':int(time.time()),'actor':s['user_id']})
                p['state']=data['state'];p['owner']=s['name'];note=str(data.get('note','') or '').strip()[:2000];p['history'].append({'state':data['state'],'at':int(time.time()),**({'note':note,'from':'Body Café Co.'} if note else {})});c.execute('UPDATE cases SET data=? WHERE id=?',(json.dumps(p),r['id']));self.operation_log(c,s['user_id'],'case_updated',r['id'],{'state':r['state'] if 'state' in r.keys() else before.get('state')},{'state':p['state']},internal or note)
            elif action in ('review','review_reply','question'):return self.moderate(c,s,action,data)
            elif action.startswith('lot_'):return self.lot_admin(c,s,action,data)
            else:raise Error('Unknown operation.',404)
        return {'ok':True}

    def snapshot(self,s):
        with self.db() as c:
            self.expire(c)
            privileged=s['role'] in ['admin','viewer']
            def rows(table):
                query='SELECT * FROM '+table
                if not privileged and table in ['orders','cases','addresses','reviews']:return c.execute(query+' WHERE user_id=? ORDER BY rowid DESC',(s['user_id'],)).fetchall()
                return c.execute(query+' ORDER BY rowid DESC').fetchall()
            def decode(r):
                d=dict(r)
                if 'data' in d:d.update(json.loads(d.pop('data')))
                if 'payload' in d:d['payload']=json.loads(d['payload'])
                return d
            result={t:[decode(r) for r in rows(t)] for t in ['orders','cases','addresses','reviews']}
            if not privileged:
                for item in result['orders']:item.pop('internal_notes',None)
                for item in result['cases']:item.pop('internal',None)
            result['flags']=json.loads(c.execute("SELECT data FROM settings WHERE id='flags'").fetchone()[0])
            if privileged:
                for t in ['batches','payments']:result[t]=[decode(r) for r in rows(t)]
                result['review_media']=[dict(r) for r in c.execute('SELECT * FROM review_media ORDER BY created DESC')]
                result['review_reports']=[dict(r) for r in c.execute('SELECT * FROM review_reports ORDER BY created DESC')]
                result['events']=[dict(r) for r in c.execute('SELECT name,COUNT(*) AS count FROM events GROUP BY name')]
                result.update(self.lot_snapshot(c))
                result['help_feedback']=self.help_feedback_summary(c)
                result['learn_feedback']=[dict(r) for r in c.execute('SELECT page,SUM(clear) AS clear,SUM(1-clear) AS unclear,COUNT(*) AS total FROM learn_feedback GROUP BY page ORDER BY page')]
                self.operations_snapshot(c,result)
            return result

    def theme_feedback(self, data):
        themes = set('ABCDEFGH')
        favourite = data.get('favourite')
        if not isinstance(favourite, str) or favourite not in themes | {'none'}:
            raise Error('Choose your favourite theme, or none.')
        if not isinstance(data.get('fit'), str) or data['fit'] not in {'1', '2', '3', '4', '5', 'na'}:
            raise Error('Rate the fit with our logo and bottles.')
        runner = data.get('runner-up', '')
        least = data.get('least', '')
        if not isinstance(runner, str) or not isinstance(least, str) or runner not in themes | {'', 'none'} or least not in themes | {'', 'none'}:
            raise Error('Choose a valid theme.')
        if favourite in themes and favourite in (runner, least):
            raise Error('Your favourite must differ from your runner-up and least suitable theme.')
        if runner in themes and runner == least:
            raise Error('Your runner-up cannot also be the least suitable theme.')
        allowed = {
            'reasons': {'Colours', 'Typography', 'Layout', 'Packaging fit', 'Product presentation', 'Motion', 'Distinctiveness', 'Overall mood'},
            'feelings': {'Premium', 'Approachable', 'Playful', 'Calm', 'Modern', 'Distinctive', 'Trustworthy', 'Generic', 'Clinical', 'Overwhelming'},
        }
        payload = {'favourite': favourite, 'runner-up': runner, 'least': least, 'fit': data['fit']}
        for field, values in allowed.items():
            selected = data.get(field, [])
            if not isinstance(selected, list) or len(selected) > 3 or any(not isinstance(v, str) or v not in values for v in selected) or len(set(selected)) != len(selected):
                raise Error('Choose up to three valid ' + field + '.')
            payload[field] = selected
        for field, limit in [('why', 1500), ('improve', 1500), ('least-why', 1000), ('reviewer-name', 80)]:
            value = data.get(field, '')
            if not isinstance(value, str) or len(value) > limit:
                raise Error('Please shorten your ' + field + ' answer.')
            payload[field] = self.clean_text(value, limit)
        if len(payload['why'].strip()) < 5:
            raise Error('Tell us a little about why you made this choice.')
        if not payload['reviewer-name'].strip():
            raise Error('Please enter your name.')
        response_id = data.get('response-id', '')
        if not isinstance(response_id, str) or not re.fullmatch(r'[A-Za-z0-9-]{10,80}', response_id):
            raise Error('Refresh the form and try again.')
        if data.get('bot-field'):
            raise Error('Could not save this response.')
        payload['review-version'] = '2026-10-23'
        with self.db() as c:
            # Stable IDs make network retries safe without dropping another person's response.
            c.execute('INSERT OR IGNORE INTO theme_feedback VALUES(?,?,?)', (response_id, json.dumps(payload), int(time.time())))
        return {'ok': True, 'id': response_id}

    def learn_feedback(self,s,data):
        """Anonymous 'Was this clear?' answer for a Learn page. Stores the page, section and answer only; one answer per
        session per page and section (a repeat replaces the earlier one)."""
        page=str(data.get('page','')).strip();section=str(data.get('section','') or '').strip()
        if not LEARN_TOPIC.fullmatch(page) or '#' in page:raise Error('That page reference is not valid.')
        if section and not re.fullmatch(r'[a-z0-9-]{1,40}',section):raise Error('That section reference is not valid.')
        if not isinstance(data.get('clear'),bool):raise Error('Answer yes or no.')
        with self.db() as c:
            c.execute('DELETE FROM learn_feedback WHERE session=? AND page=? AND section=?',(s['id'],page,section))
            c.execute('INSERT INTO learn_feedback(page,section,clear,session,created) VALUES(?,?,?,?,?)',(page,section,1 if data['clear'] else 0,s['id'],int(time.time())))
        return {'ok':True}

    # ---------- Reviews ----------
    # Eligibility: a signed-in customer (OTP-verified mobile) whose own order containing this product was delivered.
    # One review per customer per product. Every review is moderated before publication; a low rating is never a
    # reason to reject. Purchase verification is re-checked whenever a review is displayed.
    INCENTIVES = {'none', 'free_product', 'other'}
    REJECT_REASONS = {
        'personal_information': 'Contains personal information',
        'offensive': 'Abusive or offensive language',
        'not_about_product': 'Not about this product',
        'spam_or_promotion': 'Spam or promotion',
        'medical_or_safety': 'Medical claim or safety issue, handled privately instead',
    }
    REPORT_REASONS = {'inappropriate', 'personal_information', 'not_about_product', 'spam', 'safety_concern'}

    @staticmethod
    def clean_text(value, limit):
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', str(value or '')).strip()
        return re.sub(r'[ \t]+', ' ', text)[:limit + 1]

    def product_ids(self):
        with sqlite3.connect(self.path) as c:return [r[0] for r in c.execute('SELECT id FROM products')]

    def delivered_orders(self, c, user_id, product):
        found = []
        for r in c.execute("SELECT * FROM orders WHERE user_id=? AND state='delivered' ORDER BY created DESC", (user_id,)).fetchall():
            if product in [x['id'] for x in json.loads(r['data'])['items']]:
                found.append(r)
        return found

    def own_review(self, c, user_id, product):
        r = c.execute('SELECT * FROM reviews WHERE user_id=? AND product=? ORDER BY rowid DESC', (user_id, product)).fetchone()
        return (r, json.loads(r['data'])) if r else (None, None)

    def eligibility(self, s, product):
        if product not in self.product_ids():
            raise Error('Choose a product.')
        if s['role'] != 'customer':
            return {'state': 'operations'}
        if not s['user_id'].startswith('customer-'):
            return {'state': 'sign_in'}
        with self.db() as c:
            r, d = self.own_review(c, s['user_id'], product)
            if r:
                return {'state': 'already_reviewed', 'review_state': d.get('state'), 'review_id': r['id']}
            delivered = self.delivered_orders(c, s['user_id'], product)
            if delivered:
                return {'state': 'eligible', 'order_id': delivered[0]['id']}
            pending = [o for o in c.execute("SELECT * FROM orders WHERE user_id=? AND state IN ('pending','paid','shipped')", (s['user_id'],)).fetchall()
                       if product in [x['id'] for x in json.loads(o['data'])['items']]]
            return {'state': 'not_delivered' if pending else 'no_purchase'}

    def review(self, s, data):
        with self.db() as c:
            flags=json.loads(c.execute("SELECT data FROM settings WHERE id='flags'").fetchone()[0])
            if flags.get('reviews') is False:raise Error('Review submissions are temporarily paused.',409)
        product = data.get('product')
        if product not in self.product_ids():
            raise Error('Choose a product.')
        if s['role'] != 'customer':
            raise Error('Use a customer session to write a review.', 403)
        if not s['user_id'].startswith('customer-'):
            raise Error('Sign in with your mobile number to write a review.', 401)
        rating = data.get('rating')
        text = self.clean_text(data.get('text'), 2000)
        title = self.clean_text(data.get('title'), 120)
        name = self.clean_text(data.get('display_name'), 40)
        incentive = data.get('incentive', 'none')
        request_id = str(data.get('request_id', ''))[:64]
        if type(rating) != int or not 1 <= rating <= 5:
            raise Error('Choose a rating from 1 to 5 stars.')
        if not 10 <= len(text) <= 2000:
            raise Error('Write your review in 10–2000 characters.')
        if title and not 3 <= len(title) <= 120:
            raise Error('Give your review a title of 3–120 characters.')
        if name and not 2 <= len(name) <= 40:
            raise Error('Use a display name of 2–40 characters.')
        if incentive not in self.INCENTIVES:
            raise Error('Tell us whether you received this product free or with another incentive.')
        media_ids = data.get('media', [])
        if not isinstance(media_ids, list) or len(media_ids) > 4 or not all(isinstance(m, str) for m in media_ids):
            raise Error('Attach up to four photos.')
        with self.db() as c:
            existing, existing_data = self.own_review(c, s['user_id'], product)
            if existing:
                if request_id and existing_data.get('request_id') == request_id:
                    return {'ok': True, 'id': existing['id'], 'state': existing_data['state'], 'idempotent': True}
                raise Error("You've already reviewed this product. Each customer can review a product once.", 409)
            if data.get('order_id'):
                r, p = self.owned_order(c, s, data.get('order_id'))
                if r['user_id'] != s['user_id'] or r['state'] != 'delivered' or product not in [x['id'] for x in p['items']]:
                    raise Error('Reviews require your own delivered order for this product.', 403)
                order = r
            else:
                delivered = self.delivered_orders(c, s['user_id'], product)
                if not delivered:
                    raise Error('Reviews require your own delivered order for this product.', 403)
                order = delivered[0]
            for mid in media_ids:
                m = c.execute('SELECT * FROM review_media WHERE id=?', (mid,)).fetchone()
                if not m or m['user_id'] != s['user_id'] or m['product'] != product or m['state'] != 'uploaded':
                    raise Error('One of the photos is no longer available. Remove it and try again.', 409)
            rid = 'REV-' + secrets.token_hex(5)
            now = int(time.time())
            payload = {'rating': rating, 'text': text, 'title': title, 'display_name': name or 'Verified customer', 'incentive': incentive,
                       'media': media_ids, 'state': 'pending_moderation', 'created': now, 'request_id': request_id, 'preview': True, 'reply': None}
            try:
                c.execute('INSERT INTO reviews VALUES(?,?,?,?,?)', (rid, s['user_id'], product, order['id'], json.dumps(payload)))
            except sqlite3.IntegrityError:
                raise Error('You already submitted a review for this product and order.', 409)
            for mid in media_ids:
                c.execute("UPDATE review_media SET review_id=?, state='pending' WHERE id=?", (rid, mid))
            self.log(c, s['user_id'], 'review_submitted', rid)
        return {'ok': True, 'id': rid, 'state': 'pending_moderation'}

    def verified(self, c, review):
        o = c.execute('SELECT * FROM orders WHERE id=?', (review['order_id'],)).fetchone()
        return bool(o and o['user_id'] == review['user_id'] and o['state'] == 'delivered' and review['product'] in [x['id'] for x in json.loads(o['data'])['items']])

    def rating_summary(self, c, product, detail=True):
        ratings = [json.loads(r['data'])['rating'] for r in c.execute('SELECT data FROM reviews WHERE product=?', (product,)) if json.loads(r['data']).get('state') == 'published']
        out = {'count': len(ratings), 'average': round(sum(ratings) / len(ratings), 1) if ratings else None}
        if detail:
            out['breakdown'] = {str(n): ratings.count(n) for n in range(5, 0, -1)}
        return out

    def public_reviews(self, s, query):
        product = query.get('product', [''])[0]
        if product not in self.product_ids():
            raise Error('Choose a product.')
        sort = query.get('sort', ['newest'])[0]
        if sort not in ('newest', 'highest', 'lowest'):
            raise Error('Choose a valid sort order.')
        rating = query.get('rating', [''])[0]
        if rating and rating not in ('1', '2', '3', '4', '5'):
            raise Error('Choose a rating from 1 to 5.')
        try:
            page = max(1, int(query.get('page', ['1'])[0]))
            size = min(20, max(1, int(query.get('size', ['5'])[0])))
        except ValueError:
            raise Error('Invalid page.')
        with self.db() as c:
            rows = []
            for r in c.execute('SELECT * FROM reviews WHERE product=?', (product,)).fetchall():
                d = json.loads(r['data'])
                if d.get('state') == 'published' and (not rating or d['rating'] == int(rating)):
                    rows.append((r, d))
            key = {'newest': lambda x: -x[1].get('published', x[1].get('created', 0)),
                   'highest': lambda x: (-x[1]['rating'], -x[1].get('published', 0)),
                   'lowest': lambda x: (x[1]['rating'], -x[1].get('published', 0))}[sort]
            rows.sort(key=key)
            total = len(rows)
            chunk = rows[(page - 1) * size: page * size]
            items = []
            for r, d in chunk:
                media_rows = [m for m in c.execute("SELECT * FROM review_media WHERE review_id=? AND state='approved'", (r['id'],))]
                helpful = c.execute('SELECT COUNT(*) FROM review_votes WHERE review_id=?', (r['id'],)).fetchone()[0]
                items.append({
                    'id': r['id'], 'rating': d['rating'], 'title': d.get('title', ''), 'text': d['text'], 'display_name': d.get('display_name') or 'Verified customer',
                    'created': d.get('created'), 'published': d.get('published'), 'verified': self.verified(c, r), 'incentive': d.get('incentive', 'none'),
                    'media': [{'id': m['id'], 'width': m['width'], 'height': m['height']} for m in media_rows],
                    'reply': d.get('reply'), 'helpful': helpful,
                    'voted': bool(c.execute('SELECT 1 FROM review_votes WHERE review_id=? AND user_id=?', (r['id'], s['user_id'])).fetchone()),
                    'reported': bool(c.execute('SELECT 1 FROM review_reports WHERE review_id=? AND user_id=?', (r['id'], s['user_id'])).fetchone()),
                    'own': r['user_id'] == s['user_id'],
                })
            return {'product': product, 'summary': self.rating_summary(c, product), 'reviews': items, 'page': page, 'size': size, 'total': total,
                    'pages': max(1, -(-total // size)), 'sort': sort, 'rating': rating or None}

    def published_review(self, c, rid):
        r = c.execute('SELECT * FROM reviews WHERE id=?', (rid,)).fetchone()
        if not r or json.loads(r['data']).get('state') != 'published':
            raise Error('Review not found.', 404)
        return r

    def helpful(self, s, rid):
        with self.db() as c:
            r = self.published_review(c, rid)
            if r['user_id'] == s['user_id']:
                raise Error("You can't mark your own review as helpful.", 403)
            c.execute('INSERT OR IGNORE INTO review_votes VALUES(?,?,?)', (rid, s['user_id'], int(time.time())))
            return {'ok': True, 'helpful': c.execute('SELECT COUNT(*) FROM review_votes WHERE review_id=?', (rid,)).fetchone()[0], 'voted': True}

    def report(self, s, rid, data):
        reason = data.get('reason')
        if reason not in self.REPORT_REASONS:
            raise Error('Choose a reason for the report.')
        note = self.clean_text(data.get('note'), 500)
        with self.db() as c:
            self.published_review(c, rid)
            try:
                c.execute('INSERT INTO review_reports(review_id,user_id,reason,note,state,created) VALUES(?,?,?,?,?,?)', (rid, s['user_id'], reason, note, 'open', int(time.time())))
            except sqlite3.IntegrityError:
                return {'ok': True, 'idempotent': True}
            self.log(c, s['user_id'], 'review_reported', rid)
        return {'ok': True}

    # ---------- Review photos ----------
    def upload_media(self, s, product, raw):
        if product not in self.product_ids():
            raise Error('Choose a product.')
        state = self.eligibility(s, product)['state']
        if state != 'eligible':
            raise Error('Photos can be added only while writing an eligible review.', 403)
        try:
            kind, mime, ext, cleaned, w, h = media.sanitise(raw)
        except media.MediaError as e:
            raise Error(str(e), 415 if 'JPEG, PNG or WebP' in str(e) else 400)
        now = int(time.time())
        with self.db() as c:
            # Abandoned uploads are removed after a day; a review holds at most four photos.
            for old in c.execute("SELECT * FROM review_media WHERE state='uploaded' AND created<?", (now - 86400,)).fetchall():
                (self.media_dir / (old['id'] + old['ext'])).unlink(missing_ok=True)
                c.execute('DELETE FROM review_media WHERE id=?', (old['id'],))
            if c.execute("SELECT COUNT(*) FROM review_media WHERE user_id=? AND state='uploaded'", (s['user_id'],)).fetchone()[0] >= 8:
                raise Error('Remove an unused photo before uploading another.', 429)
            mid = 'IMG-' + secrets.token_hex(8)
            path = self.media_dir / (mid + ext)
            fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            with os.fdopen(fd, 'wb') as f:
                f.write(cleaned)
            c.execute('INSERT INTO review_media VALUES(?,?,?,?,?,?,?,?,?,?,?)', (mid, s['user_id'], product, None, mime, ext, len(cleaned), w, h, 'uploaded', now))
            self.log(c, s['user_id'], 'review_media_uploaded', mid)
        return {'id': mid, 'width': w, 'height': h, 'bytes': len(cleaned), 'type': mime}

    def upload_case_media(self, s, raw):
        """An optional pack photo for a support case. Cleaned exactly like review photos; never public."""
        if s['role'] != 'customer':
            raise Error('Use a customer session to add a photo.', 403)
        try:
            kind, mime, ext, cleaned, w, h = media.sanitise(raw)
        except media.MediaError as e:
            raise Error(str(e), 415 if 'JPEG, PNG or WebP' in str(e) else 400)
        now = int(time.time())
        with self.db() as c:
            for old in c.execute("SELECT * FROM review_media WHERE state='case_uploaded' AND created<?", (now - 86400,)).fetchall():
                (self.media_dir / (old['id'] + old['ext'])).unlink(missing_ok=True)
                c.execute('DELETE FROM review_media WHERE id=?', (old['id'],))
            if c.execute("SELECT COUNT(*) FROM review_media WHERE user_id=? AND state='case_uploaded'", (s['user_id'],)).fetchone()[0] >= 4:
                raise Error('Remove an unused photo before uploading another.', 429)
            mid = 'IMG-' + secrets.token_hex(8)
            path = self.media_dir / (mid + ext)
            fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            with os.fdopen(fd, 'wb') as f:
                f.write(cleaned)
            c.execute('INSERT INTO review_media VALUES(?,?,?,?,?,?,?,?,?,?,?)', (mid, s['user_id'], None, None, mime, ext, len(cleaned), w, h, 'case_uploaded', now))
            self.log(c, s['user_id'], 'case_media_uploaded', mid)
        return {'id': mid, 'width': w, 'height': h, 'bytes': len(cleaned), 'type': mime}

    def delete_media(self, s, mid):
        with self.db() as c:
            m = c.execute('SELECT * FROM review_media WHERE id=?', (mid,)).fetchone()
            if not m or m['user_id'] != s['user_id'] or m['state'] != 'uploaded':
                raise Error('Photo not found.', 404)
            (self.media_dir / (m['id'] + m['ext'])).unlink(missing_ok=True)
            c.execute('DELETE FROM review_media WHERE id=?', (mid,))
        return {'ok': True}

    def media_file(self, s, mid):
        with self.db() as c:
            m = c.execute('SELECT * FROM review_media WHERE id=?', (mid,)).fetchone()
            if not m:
                raise Error('Not found.', 404)
            public = False
            if m['state'] == 'approved' and m['review_id']:
                r = c.execute('SELECT data FROM reviews WHERE id=?', (m['review_id'],)).fetchone()
                public = bool(r and json.loads(r['data']).get('state') == 'published')
            if not (public or m['user_id'] == s['user_id'] or s['role'] in ['admin', 'viewer']):
                raise Error('Not found.', 404)
        path = self.media_dir / (m['id'] + m['ext'])
        if not path.is_file():
            raise Error('Not found.', 404)
        return m['mime'], path.read_bytes(), public

    # ---------- Product questions (handled as support cases) ----------
    def question(self, s, data):
        with self.db() as c:
            flags=json.loads(c.execute("SELECT data FROM settings WHERE id='flags'").fetchone()[0])
            if flags.get('questions') is False:raise Error('Product question submissions are temporarily paused.',409)
        if s['role'] != 'customer':
            raise Error('Use a customer session to ask a question.', 403)
        product = data.get('product')
        if product not in self.product_ids():
            raise Error('Choose a product.')
        text = self.clean_text(data.get('question'), 600)
        if not 10 <= len(text) <= 600:
            raise Error('Write your question in 10–600 characters.')
        now = int(time.time())
        with self.db() as c:
            recent = [r for r in c.execute('SELECT data FROM cases WHERE user_id=? AND created>?', (s['user_id'], now - 86400)) if json.loads(r['data']).get('kind') == 'product_question']
            if len(recent) >= 10:
                raise Error('You have asked several questions today. Please wait for an answer, or contact support.', 429)
            cid = 'CASE-' + secrets.token_hex(4).upper()
            name = next((p[1] for p in PRODUCTS if p[0] == product), product)
            payload = {'kind': 'product_question', 'product': product, 'message': text, 'order_id': '', 'state': 'open', 'owner': 'Unassigned',
                       'sla': 'Preview target: 2 business days', 'preview': True, 'history': [], 'subject': 'Question about ' + name,
                       'public': {'state': 'private', 'answer': None, 'answered': None}}
            c.execute('INSERT INTO cases VALUES(?,?,?,?)', (cid, s['user_id'], json.dumps(payload), now))
            self.log(c, s['user_id'], 'question_created', cid)
        return {'id': cid, 'state': 'open', 'public': 'private'}

    def public_questions(self, query):
        product = query.get('product', [''])[0]
        if product not in self.product_ids():
            raise Error('Choose a product.')
        with self.db() as c:
            out = []
            for r in c.execute('SELECT * FROM cases ORDER BY created DESC').fetchall():
                d = json.loads(r['data'])
                if d.get('kind') == 'product_question' and d.get('product') == product and (d.get('public') or {}).get('state') == 'published':
                    out.append({'id': r['id'], 'question': d['public'].get('question') or d['message'], 'answer': d['public']['answer'], 'answered': d['public']['answered'], 'asked': r['created']})
        return {'product': product, 'questions': out}

    # ---------- Moderation (Admin) ----------
    def moderate(self, c, s, action, data):
        now = int(time.time())
        if action == 'review':
            r = c.execute('SELECT * FROM reviews WHERE id=?', (data.get('id'),)).fetchone()
            if not r:
                raise Error('Review not found.', 404)
            d = json.loads(r['data'])
            decision = data.get('decision')
            if decision not in ('publish', 'reject'):
                raise Error('Choose publish or reject.')
            if decision == 'reject':
                reason = data.get('reason')
                if reason not in self.REJECT_REASONS:
                    raise Error('Choose a moderation reason. A low rating or criticism is not a reason to reject a review.')
                d.update({'state': 'rejected', 'reject_reason': reason, 'moderated': now, 'moderator': s['user_id']})
                c.execute("UPDATE review_media SET state='rejected' WHERE review_id=?", (r['id'],))
            else:
                if not self.verified(c, r):
                    raise Error('This review no longer matches a delivered order, so it cannot be published as verified.', 409)
                decisions = data.get('media', {}) or {}
                if not isinstance(decisions, dict):
                    raise Error('Invalid photo decisions.')
                for mid in d.get('media', []):
                    choice = decisions.get(mid)
                    if choice not in ('approve', 'reject'):
                        raise Error('Approve or reject each photo before publishing.')
                    c.execute('UPDATE review_media SET state=? WHERE id=? AND review_id=?', ('approved' if choice == 'approve' else 'rejected', mid, r['id']))
                d.update({'state': 'published', 'published': d.get('published') or now, 'moderated': now, 'moderator': s['user_id'], 'reject_reason': None})
            c.execute('UPDATE reviews SET data=? WHERE id=?', (json.dumps(d), r['id']))
            c.execute("UPDATE review_reports SET state='reviewed' WHERE review_id=?", (r['id'],))
            self.log(c, s['user_id'], 'review_' + ('published' if decision == 'publish' else 'rejected'), r['id'])
        elif action == 'review_reply':
            r = c.execute('SELECT * FROM reviews WHERE id=?', (data.get('id'),)).fetchone()
            if not r:
                raise Error('Review not found.', 404)
            d = json.loads(r['data'])
            if d.get('state') != 'published':
                raise Error('Reply to a published review.', 409)
            text = self.clean_text(data.get('text'), 1000)
            if text and not 2 <= len(text) <= 1000:
                raise Error('Write a reply of 2–1000 characters.')
            d['reply'] = {'text': text, 'at': now} if text else None
            c.execute('UPDATE reviews SET data=? WHERE id=?', (json.dumps(d), r['id']))
            self.log(c, s['user_id'], 'review_reply_saved' if text else 'review_reply_removed', r['id'])
        elif action == 'question':
            r = c.execute('SELECT * FROM cases WHERE id=?', (data.get('id'),)).fetchone()
            if not r:
                raise Error('Question not found.', 404)
            d = json.loads(r['data'])
            if d.get('kind') != 'product_question':
                raise Error('Only product questions can be answered publicly.', 409)
            answer = self.clean_text(data.get('answer'), 2000)
            publish = data.get('publish') is True
            question = self.clean_text(data.get('question') or d['message'], 600)
            if not 5 <= len(answer) <= 2000:
                raise Error('Write an official answer of 5–2000 characters.')
            if publish and not 10 <= len(question) <= 600:
                raise Error('The published question must be 10–600 characters.')
            d['public'] = {'state': 'published' if publish else 'private', 'answer': answer, 'answered': now, 'question': question if publish else None}
            d['history'].append({'state': 'answered', 'at': now})
            c.execute('UPDATE cases SET data=? WHERE id=?', (json.dumps(d), r['id']))
            self.log(c, s['user_id'], 'question_answered_public' if publish else 'question_answered_private', r['id'])
        else:
            raise Error('Unknown operation.', 404)
        return {'ok': True}

class Handler(BaseHTTPRequestHandler):
    store=None
    def log_message(self,*args):pass
    def valid_host(self):
        return self.headers.get('Host') in [f'127.0.0.1:{self.server.server_port}',f'localhost:{self.server.server_port}']
    def json(self,status,data,cookie=None):
        if getattr(self,'cookie_name','bcc_session')=='bcc_session':
            def public(v):
                if isinstance(v,dict):return {k:public(x) for k,x in v.items() if k not in ('internal_notes','internal')}
                if isinstance(v,list):return [public(x) for x in v]
                return v
            data=public(data)
        body=json.dumps(data).encode();self.send_response(status);self.send_header('Content-Type','application/json');self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff')
        if cookie:self.send_header('Set-Cookie',f'{getattr(self,"cookie_name","bcc_session")}={cookie}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800')
        self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
    def api(self):
        path=urlparse(self.path).path;sid=''
        self.cookie_name='bcc_admin' if path.startswith('/api/admin') or ('bcc_admin=' in self.headers.get('Cookie','') and (path.startswith('/api/catalog-media/') or path.startswith('/api/lots/documents/') or path.startswith('/api/review-media/'))) else 'bcc_session'
        for part in self.headers.get('Cookie','').split(';'):
            if part.strip().startswith(self.cookie_name+'='):sid=part.strip().split('=',1)[1]
        s,new=self.store.session(sid);cookie=s['id'] if new else None
        try:
            data={}
            if self.command=='POST':
                if s['role']=='viewer' and path not in ['/api/demo/login','/api/logout']:raise Error('Viewer sessions are read-only.',403)
                origin=self.headers.get('Origin')
                if origin and urlparse(origin).netloc!=self.headers.get('Host'):raise Error('Cross-origin requests are not allowed.',403)
                if not hmac.compare_digest(self.headers.get('X-CSRF-Token',''),s['csrf']):raise Error('Refresh the page and retry.',403)
                length=int(self.headers.get('Content-Length','0'))
                if path=='/api/admin/lot-image':
                    if not 0<length<=media.MAX_BYTES:raise Error('Choose an image of 5 MB or smaller.',413)
                    q=parse_qs(urlparse(self.path).query);g=lambda key:q.get(key,[''])[0]
                    return self.json(200,self.store.lot_image_upload(s,g('report'),self.rfile.read(length),g('title'),g('caption')),cookie)
                if path=='/api/admin/catalog-image':
                    if not 0<length<=media.MAX_BYTES:raise Error('Choose an image of 5 MB or smaller.',413)
                    return self.json(200,self.store.catalog_upload(s,self.rfile.read(length)),cookie)
                if path=='/api/review-media':
                    # Raw image body. Type and size are checked from the bytes; metadata is removed before storage.
                    if length<=0:raise Error('Choose an image to upload.')
                    if length>media.MAX_BYTES:raise Error('Each photo must be 5 MB or smaller.',413)
                    pid=parse_qs(urlparse(self.path).query).get('product',[''])[0]
                    return self.json(200,self.store.upload_media(s,pid,self.rfile.read(length)),cookie)
                if path=='/api/case-media':
                    if length<=0:raise Error('Choose an image to upload.')
                    if length>media.MAX_BYTES:raise Error('Each photo must be 5 MB or smaller.',413)
                    return self.json(200,self.store.upload_case_media(s,self.rfile.read(length)),cookie)
                if path=='/api/admin-lot-document':
                    # Raw PDF body. Checked from its bytes, hashed and stored privately; public only once its version is published.
                    if length<=0:raise Error('Choose a PDF to upload.')
                    if length>lots.PDF_MAX:raise Error('The PDF must be 15 MB or smaller.',413)
                    q=parse_qs(urlparse(self.path).query);g=lambda k:q.get(k,[''])[0]
                    return self.json(200,self.store.lot_upload(s,g('report'),self.rfile.read(length),g('title'),g('kind'),g('redacted')=='1',g('note')),cookie)
                if length<0 or length>(65536 if path.startswith('/api/admin/') else 20000):raise Error('Request too large or invalid.',413)
                data=json.loads(self.rfile.read(length) or b'{}')
                if not isinstance(data,dict):raise Error('Invalid request.')
            if self.command=='GET':
                if path=='/api/session':result={'user':{'id':s['user_id'],'name':s['name'],'role':s['role'],'mobile':s['mobile']},'csrf':s['csrf'],'preview':True}
                elif path=='/api/admin/session':
                    with self.store.db() as c:configured=bool(c.execute('SELECT 1 FROM admin_credential').fetchone())
                    result={'user':{'id':s['user_id'],'name':s['name'],'role':s['role'],'mobile':s['mobile']},'csrf':s['csrf'],'configured':configured}
                elif re.fullmatch(r'/api/catalog-media/CM-[0-9a-f]{16}',path):
                    mime,body=self.store.catalog_file(s,path.rsplit('/',1)[1])
                    self.send_response(200);self.send_header('Content-Type',mime);self.send_header('Content-Length',str(len(body)));self.send_header('X-Content-Type-Options','nosniff');self.send_header('Cache-Control','private, no-store');self.end_headers();self.wfile.write(body);return
                elif path=='/api/catalog':
                    with self.store.db() as c:flags=json.loads(c.execute("SELECT data FROM settings WHERE id='flags'").fetchone()[0])
                    result={'products':self.store.products(),'bundles':BUNDLES,'flags':flags,'preview':True}
                elif path=='/api/account':result=self.store.account_view(s)
                elif path=='/api/bag':result=self.store.bag_get(s)
                elif re.fullmatch(r'/api/orders/BCC-[0-9A-F]{8}/status',path):result=self.store.order_status(s,path.split('/')[3])
                elif re.fullmatch(r'/api/orders/BCC-[0-9A-F]{8}/cancel-check',path):result=self.store.cancel_check(s,path.split('/')[3])
                elif re.fullmatch(r'/api/cases/CASE-[0-9A-F]{8}',path):result=self.store.case_view(s,path.split('/')[3])
                elif path=='/api/account/export':result=self.store.data_export(s)
                elif path=='/api/admin/sales':
                    self.store.require(s,'admin')
                    with self.store.db() as c:result=self.store.sales_report(c,parse_qs(urlparse(self.path).query))
                elif path=='/api/admin':
                    if s['role'] not in ['admin','viewer']:raise Error('An operations session is required.',403)
                    result=self.store.snapshot(s)
                elif path=='/api/reviews':result=self.store.public_reviews(s,parse_qs(urlparse(self.path).query))
                elif path=='/api/reviews/eligibility':result=self.store.eligibility(s,parse_qs(urlparse(self.path).query).get('product',[''])[0])
                elif path=='/api/questions':result=self.store.public_questions(parse_qs(urlparse(self.path).query))
                elif re.fullmatch(r'/api/review-media/IMG-[0-9a-f]{16}',path):
                    mime,body,public=self.store.media_file(s,path.rsplit('/',1)[1])
                    self.send_response(200);self.send_header('Content-Type',mime);self.send_header('Content-Length',str(len(body)));self.send_header('X-Content-Type-Options','nosniff')
                    self.send_header('Content-Security-Policy',"default-src 'none'; img-src 'self'; style-src 'unsafe-inline'");self.send_header('Content-Disposition','inline')
                    self.send_header('Cache-Control','public, max-age=300' if public else 'private, no-store')
                    if cookie:self.send_header('Set-Cookie',f'{getattr(self,"cookie_name","bcc_session")}={cookie}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800')
                    self.end_headers();self.wfile.write(body);return
                elif path=='/api/lots':
                    q=parse_qs(urlparse(self.path).query)
                    result=self.store.lots_lookup(q.get('product',[''])[0],q.get('lot',[''])[0])
                elif path=='/api/lots/archive':
                    q=parse_qs(urlparse(self.path).query)
                    result=self.store.lots_archive(q.get('product',[''])[0],q.get('q',[''])[0])
                elif re.fullmatch(r'/api/lots/documents/DOC-[0-9a-f]{16}',path):
                    raw,d=self.store.lots_document(s,path.rsplit('/',1)[1],s['role'] in ['admin','viewer'])
                    download=parse_qs(urlparse(self.path).query).get('download',[''])[0]=='1'
                    name=re.sub(r'[^A-Za-z0-9._-]+','-',d['title'])[:60].strip('-') or 'document'
                    self.send_response(200);self.send_header('Content-Type',d.get('mime','application/pdf'));self.send_header('Content-Length',str(len(raw)));self.send_header('X-Content-Type-Options','nosniff')
                    self.send_header('Content-Security-Policy',"sandbox; default-src 'none'");self.send_header('Content-Disposition',('attachment' if download else 'inline')+f'; filename="{name}-{d["id"][4:12]}{d.get("ext",".pdf")}"')
                    self.send_header('Cache-Control','no-cache');self.send_header('X-Document-SHA256',d['sha256'])
                    if cookie:self.send_header('Set-Cookie',f'{getattr(self,"cookie_name","bcc_session")}={cookie}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800')
                    self.end_headers();self.wfile.write(raw);return
                else:raise Error('Endpoint not found.',404)
            else:
                if path=='/api/admin/login':
                    result=self.store.admin_signin(s,data,self.client_address[0]);cookie=result.pop('_sid')
                elif path=='/api/admin/password':result=self.store.admin_password(s,data)
                elif path=='/api/admin/logout':result=self.store.logout(s,data)
                elif path=='/api/demo/login':raise Error('Demo access is disabled. Use credential login.',404)
                elif path=='/api/logout':result=self.store.logout(s,data)
                elif path=='/api/auth/otp':result=self.store.otp(s,data)
                elif path=='/api/auth/verify':result=self.store.verify(s,data)
                elif path=='/api/orders':result=self.store.order(s,data)
                elif re.fullmatch(r'/api/orders/[^/]+/pay',path):result=self.store.pay(s,path.split('/')[3],data)
                elif re.fullmatch(r'/api/orders/[^/]+/cancel',path):result=self.store.cancel(s,path.split('/')[3])
                elif path=='/api/cases':result=self.store.case(s,data)
                elif re.fullmatch(r'/api/cases/CASE-[0-9A-F]{8}/reply',path):result=self.store.case_reply(s,path.split('/')[3],data)
                elif re.fullmatch(r'/api/orders/BCC-[0-9A-F]{8}/return',path):result=self.store.return_request(s,path.split('/')[3],data)
                elif path=='/api/privacy-requests':result=self.store.privacy_request(s,data)
                elif path=='/api/help/feedback':result=self.store.help_feedback(s,data)
                elif path=='/api/learn/feedback':result=self.store.learn_feedback(s,data)
                elif path=='/api/theme-feedback':result=self.store.theme_feedback(data)
                elif path=='/api/addresses':result=self.store.address_save(s,data)
                elif re.fullmatch(r'/api/addresses/ADDR-[0-9a-f]{10}/(delete|default)',path):result=self.store.address_action(s,path.split('/')[3],path.split('/')[4])
                elif path=='/api/bag':result=self.store.bag_save(s,data)
                elif path=='/api/bag/quote':result=self.store.bag_quote(s,data)
                elif path=='/api/profile':result=self.store.profile_update(s,data)
                elif path=='/api/preferences':result=self.store.preferences(s,data)
                elif re.fullmatch(r'/api/orders/[^/]+/reconcile',path):result=self.store.reconcile(s,path.split('/')[3],data)
                elif path=='/api/reviews':result=self.store.review(s,data)
                elif re.fullmatch(r'/api/reviews/REV-[0-9a-f]{10}/helpful',path):result=self.store.helpful(s,path.split('/')[3])
                elif re.fullmatch(r'/api/reviews/REV-[0-9a-f]{10}/report',path):result=self.store.report(s,path.split('/')[3],data)
                elif re.fullmatch(r'/api/review-media/IMG-[0-9a-f]{16}/delete',path):result=self.store.delete_media(s,path.split('/')[3])
                elif path=='/api/questions':result=self.store.question(s,data)
                elif path.startswith('/api/admin/'):result=self.store.admin(s,path.rsplit('/',1)[1],data)
                elif path=='/api/events':
                    if data.get('name') not in ['product_view','report_lookup','cart_add','checkout_start','consent_updated','review_start','question_start']:raise Error('Unknown event.')
                    with self.store.db() as c:c.execute('INSERT INTO events(user_id,name,created) VALUES(?,?,?)',(s['user_id'],data['name'],int(time.time())))
                    result={'ok':True}
                else:raise Error('Endpoint not found.',404)
            self.json(200,result,cookie)
        except (Error,lots.LotError) as e:self.json(e.status,{'error':str(e),**getattr(e,'extra',{})},cookie)
        except (ValueError,TypeError,KeyError):self.json(400,{'error':'Invalid request data.'},cookie)
        except Exception as e:
            print('API error:',type(e).__name__,flush=True);self.json(500,{'error':'The preview could not complete that action. Please retry.'},cookie)
    def do_POST(self):
        if not self.valid_host():return self.json(403,{'error':'Local preview host required.'})
        if self.path.startswith('/api/'):self.api()
        else:self.json(404,{'error':'Not found.'})
    def do_GET(self):
        if not self.valid_host():return self.json(403,{'error':'Local preview host required.'})
        path=unquote(urlparse(self.path).path)
        if path.startswith('/api/'):return self.api()
        # Explicit static allowlist: never serve database, requirements, archives or Git metadata.
        if path in ('/feedback', '/feedback/'):file=ROOT/'web/feedback.html'
        elif path.startswith('/web/'):file=ROOT/path.lstrip('/')
        elif path.startswith('/concepts/media/'):file=ROOT/path.lstrip('/')
        elif path.startswith('/assets/brand/logos/') or path.startswith('/assets/brand/fonts/'):file=ROOT/path.lstrip('/')
        elif path.startswith('/concepts/') and path.endswith(('.html','.css','.js')):file=ROOT/path.lstrip('/')
        elif path=='/favicon.ico':return self.json(404,{'error':'No favicon'})
        else:file=ROOT/'web/index.html'
        resolved=file.resolve()
        if not resolved.is_relative_to(ROOT) or '..' in path.split('/') or not resolved.is_file():return self.json(404,{'error':'Not found'})
        content=resolved.read_bytes();self.send_response(200);self.send_header('Content-Type',mimetypes.guess_type(str(resolved))[0] or 'application/octet-stream');self.send_header('X-Content-Type-Options','nosniff');self.send_header('Referrer-Policy','same-origin');self.send_header('Content-Security-Policy',"default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");self.send_header('Cache-Control','no-cache');self.send_header('Content-Length',str(len(content)));self.end_headers();self.wfile.write(content)

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=4174);parser.add_argument('--db',default=str(ROOT/'.local/preview.sqlite3'));args=parser.parse_args()
    if os.getenv('BCC_MODE','preview')!='preview':raise SystemExit('Live mode is not implemented. Configure real authentication, payment and provider adapters before production.')
    Handler.store=Store(args.db)
    server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
    print(f'Body Cafe Co local preview: http://127.0.0.1:{args.port}',flush=True)
    try:server.serve_forever()
    except KeyboardInterrupt:server.server_close()

if __name__=='__main__':main()
