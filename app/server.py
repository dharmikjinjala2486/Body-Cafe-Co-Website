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

ROOT = Path(__file__).resolve().parent.parent
PRODUCTS = [
    ('iron-bisglycinate','Iron Bisglycinate','Iron, with the details in view.','Iron bisglycinate',799,'#aa472e','Daily essentials'),
    ('l-theanine','L-Theanine','Get to know your everyday ingredient.','L-Theanine',899,'#777d51','Daily essentials'),
    ('vitamin-d3-k2','Vitamin D3 + K2','With Omega-3 as triglycerides.','Vitamin D3, Vitamin K2 and Omega-3 as triglycerides',999,'#35306f','Daily essentials'),
    ('omega-3-fish-oil','Omega-3 Fish Oil','A closer look at your Omega-3.','Omega-3 fish oil',1199,'#84919b','Daily essentials'),
    ('myo-d-chiro-inositol','Myo & D-Chiro Inositol','Two ingredients. All the details.','Myo-inositol and D-chiro inositol',1299,'#b184b9','Ingredient pairs'),
    ('creatine-chews','Creatine Chews','Meet creatine in a chew.','Creatine; complete formulation pending',1099,'#07566a','Chews'),
    ('psyllium-husk','Psyllium Husk','Make room for a little curiosity.','Psyllium husk',699,'#9c9274','Daily essentials'),
]
BUNDLES = [
    {'id':'daily-edit','name':'The daily edit','description':'An example collection of D3 + K2 and Omega-3.','items':['vitamin-d3-k2','omega-3-fish-oil']},
    {'id':'curious-edit','name':'The curious edit','description':'An example collection of L-Theanine and Creatine Chews.','items':['l-theanine','creatine-chews']},
]

class Error(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status

class Store:
    def __init__(self, path):
        self.path = str(path)
        Path(path).parent.mkdir(parents=True, exist_ok=True)
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
            ''')
            for i,p in enumerate(PRODUCTS):
                data = dict(zip(['id','name','subtitle','ingredients','price','color','category'],p))
                data.update({'preview':True,'published':True,'formula_approved':False,'label_note':'Full formulation, quantities, directions and warnings await approved rear labels.'})
                c.execute('INSERT OR IGNORE INTO products VALUES(?,?)',(p[0],json.dumps(data)))
                for j,days in enumerate([180,365]):
                    c.execute('INSERT OR IGNORE INTO batches VALUES(?,?,?,?,?,?)',(f'DEMO-{i+1:02d}-{j+1:02d}',p[0],int(time.time())+days*86400,20,'released',1))
            for uid,name,role in [('admin-a','Preview Admin A','admin'),('admin-b','Preview Admin B','admin'),('viewer','Preview Viewer','viewer')]:
                c.execute('INSERT OR IGNORE INTO users VALUES(?,?,?,?)',(uid,name,'',role))
            c.execute('INSERT OR IGNORE INTO settings VALUES(?,?)',('flags',json.dumps({'ingredient_library':True,'referrals':False,'amazon_sync':False})))

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
        rows=c.execute("SELECT * FROM reservations WHERE state='held' AND expires<=?",(int(time.time()),)).fetchall()
        for r in rows:
            c.execute('UPDATE batches SET available=available+? WHERE id=?',(r['quantity'],r['batch']))
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

    def products(self):
        with self.db() as c:
            self.expire(c)
            items=[]
            for r in c.execute('SELECT * FROM products'):
                p=json.loads(r['data']);p['stock']=c.execute("SELECT COALESCE(SUM(available),0) FROM batches WHERE product=? AND state='released' AND proof=1 AND expiry>?",(p['id'],int(time.time()))).fetchone()[0]
                items.append(p)
            return items

    def require(self,s,role):
        if s['role']!=role:raise Error('This action requires an Admin session.',403)

    def login(self,s,data):
        # Explicitly local demo identities. Real SSO is intentionally not simulated as verified.
        uid=data.get('identity')
        if uid not in ['admin-a','admin-b','viewer']:raise Error('Unknown preview identity.')
        with self.db() as c:
            c.execute('UPDATE sessions SET user_id=? WHERE id=?',(uid,s['id']))
            self.log(c,uid,'preview_login',uid)
        return {'ok':True}

    def otp(self,s,data):
        mobile=str(data.get('mobile','')).strip()
        if not re.fullmatch(r'[6-9][0-9]{9}',mobile):raise Error('Enter a valid 10-digit Indian mobile number.')
        now=int(time.time())
        with self.db() as c:
            previous=c.execute('SELECT * FROM otps WHERE mobile=?',(mobile,)).fetchone()
            if previous and now-previous['sent']<20:raise Error('Please wait 20 seconds before requesting another preview code.',429)
            code=f'{secrets.randbelow(1000000):06d}'
            c.execute('INSERT OR REPLACE INTO otps VALUES(?,?,?,?,?)',(mobile,hashlib.sha256(code.encode()).hexdigest(),now+300,0,now))
        return {'preview_code':code,'expires_in':300,'message':'Local preview code. No SMS was sent.'}

    def verify(self,s,data):
        mobile=str(data.get('mobile',''));code=str(data.get('code',''))
        invalid=False
        with self.db() as c:
            r=c.execute('SELECT * FROM otps WHERE mobile=?',(mobile,)).fetchone()
            if not r or r['expires']<time.time() or r['attempts']>=5:raise Error('Code expired or unavailable. Request a new preview code.')
            if not hmac.compare_digest(r['digest'],hashlib.sha256(code.encode()).hexdigest()):
                c.execute('UPDATE otps SET attempts=attempts+1 WHERE mobile=?',(mobile,));invalid=True
            else:
                uid='customer-'+hashlib.sha256(mobile.encode()).hexdigest()[:20]
                c.execute('INSERT OR IGNORE INTO users VALUES(?,?,?,?)',(uid,'Customer',mobile,'customer'))
                # Only merge this guest session's orders whose checkout mobile matches verified mobile.
                if s['user_id'].startswith('guest-'):
                    for order in c.execute('SELECT * FROM orders WHERE user_id=?',(s['user_id'],)).fetchall():
                        if json.loads(order['data']).get('contact',{}).get('mobile')==mobile:
                            c.execute('UPDATE orders SET user_id=? WHERE id=?',(uid,order['id']))
                c.execute('UPDATE sessions SET user_id=? WHERE id=?',(uid,s['id']))
                c.execute('DELETE FROM otps WHERE mobile=?',(mobile,))
        if invalid:raise Error('The preview code does not match.')
        return {'ok':True}

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
        with self.db() as c:
            self.expire(c)
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
            self.log(c,s['user_id'],'reservation_created',oid)
        return {'id':oid,**payload,'state':'pending'}

    def owned_order(self,c,s,oid):
        r=c.execute('SELECT * FROM orders WHERE id=?',(oid,)).fetchone()
        if not r or (r['user_id']!=s['user_id'] and s['role'] not in ['admin','viewer']):raise Error('Order not found.',404)
        return r,json.loads(r['data'])

    def pay(self,s,oid,data):
        with self.db() as c:
            self.expire(c);r,p=self.owned_order(c,s,oid)
            if r['user_id']!=s['user_id']:raise Error('Use the purchasing customer session.',403)
            if r['state']=='paid':return {'id':oid,'state':'paid','idempotent':True}
            if r['state']!='pending':raise Error('This payment reservation is no longer active. Start a new checkout.',409)
            if data.get('outcome') not in ['success','failure']:raise Error('Choose a preview payment outcome.')
            if data['outcome']=='failure':
                c.execute("UPDATE payments SET status='failed' WHERE order_id=?",(oid,));self.log(c,s['user_id'],'preview_payment_failed',oid)
                return {'id':oid,'state':'pending','payment':'failed','message':'No money moved. Retry while the reservation is active.'}
            invalid=c.execute("SELECT r.id FROM reservations r JOIN batches b ON r.batch=b.id WHERE r.order_id=? AND (b.state!='released' OR b.proof!=1 OR b.expiry<=?)",(oid,int(time.time()))).fetchone()
            if invalid:raise Error('A reserved lot is no longer released. Contact preview support or cancel this order.',409)
            c.execute("UPDATE reservations SET state='consumed' WHERE order_id=? AND state='held'",(oid,))
            c.execute("UPDATE payments SET status='captured' WHERE order_id=?",(oid,))
            p['history'].append({'state':'paid','at':int(time.time())})
            c.execute("UPDATE orders SET state='paid',data=? WHERE id=?",(json.dumps(p),oid));self.log(c,s['user_id'],'preview_payment_captured',oid)
        return {'id':oid,'state':'paid','message':'Preview payment only. No money moved.'}

    def cancel(self,s,oid):
        with self.db() as c:
            self.expire(c);r,p=self.owned_order(c,s,oid)
            if r['user_id']!=s['user_id']:raise Error('Use the purchasing customer session.',403)
            if r['state']=='cancelled':return {'ok':True,'idempotent':True}
            if r['state'] not in ['pending','paid']:raise Error('Shipment has started or the reservation expired. Open a support case.',409)
            for held in c.execute("SELECT * FROM reservations WHERE order_id=? AND state IN ('held','consumed')",(oid,)).fetchall():
                c.execute('UPDATE batches SET available=available+? WHERE id=?',(held['quantity'],held['batch']))
                c.execute("UPDATE reservations SET state='released' WHERE id=?",(held['id'],))
            if r['state']=='paid':
                p['refund']='approval_pending'
            p['history'].append({'state':'cancelled','at':int(time.time())})
            c.execute("UPDATE orders SET state='cancelled',data=? WHERE id=?",(json.dumps(p),oid));self.log(c,s['user_id'],'order_cancelled',oid)
        return {'ok':True}

    def case(self,s,data):
        if s['role']!='customer':raise Error('Use a customer session to open a case.',403)
        kind=data.get('kind','general');text=str(data.get('message','')).strip()
        if kind not in ['general','delivery','return','replacement','safety']:raise Error('Select a valid case type.')
        if not 10<=len(text)<=3000:raise Error('Describe the issue in 10–3000 characters.')
        with self.db() as c:
            oid=str(data.get('order_id','')).strip()
            if oid:self.owned_order(c,s,oid)
            cid='CASE-'+secrets.token_hex(4).upper()
            payload={'kind':kind,'message':text,'order_id':oid,'state':'open','owner':'Unassigned','sla':'Priority review' if kind=='safety' else 'Preview target: 1 business day','preview':True,'history':[]}
            c.execute('INSERT INTO cases VALUES(?,?,?,?)',(cid,s['user_id'],json.dumps(payload),int(time.time())))
            self.log(c,s['user_id'],'safety_case_created' if kind=='safety' else 'case_created',cid)
        return {'id':cid,**payload}

    def admin(self,s,action,data):
        self.require(s,'admin')
        with self.db() as c:
            self.expire(c)
            if action=='quarantine':
                batch=c.execute('SELECT * FROM batches WHERE id=?',(data.get('batch'),)).fetchone()
                if not batch:raise Error('Batch not found.',404)
                if len(str(data.get('reason','')).strip())<5:raise Error('Add a quarantine reason.')
                c.execute("UPDATE batches SET state='quarantined' WHERE id=?",(batch['id'],));self.log(c,s['user_id'],'batch_quarantined',batch['id'])
            elif action=='request':
                kind=data.get('kind');target=data.get('target');value=data.get('value')
                if kind not in ['price','stock','release','publication','refund','flags']:raise Error('Unsupported critical change.')
                if kind in ['price','stock'] and (type(value)!=int or value<0 or value>100000):raise Error('Enter a valid non-negative integer.')
                if kind=='publication' and type(value)!=bool:raise Error('Publication value must be true or false.')
                if kind in ['price','publication'] and not c.execute('SELECT id FROM products WHERE id=?',(target,)).fetchone():raise Error('Product not found.',404)
                if kind in ['stock','release'] and not c.execute('SELECT id FROM batches WHERE id=?',(target,)).fetchone():raise Error('Batch not found.',404)
                if kind=='flags' and (target not in ['ingredient_library','referrals','amazon_sync'] or type(value)!=bool):raise Error('Invalid feature flag.')
                if kind=='refund':
                    r=c.execute('SELECT * FROM orders WHERE id=?',(target,)).fetchone()
                    if not r or r['state']!='cancelled' or json.loads(r['data'])['refund']!='approval_pending':raise Error('No refundable cancelled order found.')
                # One pending request per change: a duplicate could never be approved after the first resolved.
                if c.execute("SELECT id FROM approvals WHERE kind=? AND target=? AND state='pending'",(kind,target)).fetchone():raise Error('A request for this change is already awaiting approval.',409)
                aid='APR-'+secrets.token_hex(4).upper()
                c.execute('INSERT INTO approvals VALUES(?,?,?,?,?,?,?,?)',(aid,s['user_id'],kind,target,json.dumps({'value':value,'reason':str(data.get('reason',''))[:500]}),'pending',None,int(time.time())))
                self.log(c,s['user_id'],'approval_requested',aid)
                return {'id':aid}
            elif action=='approve':
                r=c.execute('SELECT * FROM approvals WHERE id=?',(data.get('id'),)).fetchone()
                if not r:raise Error('Approval not found.',404)
                if r['creator']==s['user_id']:raise Error('A different Admin must approve this change.',403)
                if r['state']!='pending':raise Error('This request has already been resolved.',409)
                if data.get('decision') not in ['approve','reject']:raise Error('Select approve or reject.')
                approve=data['decision']=='approve';value=json.loads(r['payload']).get('value')
                if approve:
                    if r['kind'] in ['price','publication']:
                        pr=c.execute('SELECT data FROM products WHERE id=?',(r['target'],)).fetchone();p=json.loads(pr['data']);p['price' if r['kind']=='price' else 'published']=value;c.execute('UPDATE products SET data=? WHERE id=?',(json.dumps(p),r['target']))
                    elif r['kind']=='stock':c.execute('UPDATE batches SET available=available+? WHERE id=?',(value,r['target']))
                    elif r['kind']=='release':
                        batch=c.execute('SELECT * FROM batches WHERE id=?',(r['target'],)).fetchone()
                        if not batch['proof'] or batch['expiry']<=time.time():raise Error('Evidence and unexpired stock are required before release.',409)
                        c.execute("UPDATE batches SET state='released' WHERE id=?",(r['target'],))
                    elif r['kind']=='refund':
                        order=c.execute('SELECT * FROM orders WHERE id=?',(r['target'],)).fetchone();p=json.loads(order['data'])
                        if p['refund']!='approval_pending':raise Error('Refund already resolved.',409)
                        p['refund']='refunded_preview';c.execute('UPDATE orders SET data=? WHERE id=?',(json.dumps(p),r['target']));c.execute("UPDATE payments SET status='refunded_preview' WHERE order_id=?",(r['target'],))
                    elif r['kind']=='flags':
                        flags=json.loads(c.execute("SELECT data FROM settings WHERE id='flags'").fetchone()[0]);flags[r['target']]=value;c.execute("UPDATE settings SET data=? WHERE id='flags'",(json.dumps(flags),))
                c.execute('UPDATE approvals SET state=?,approver=? WHERE id=?',('approved' if approve else 'rejected',s['user_id'],r['id']));self.log(c,s['user_id'],'approval_approved' if approve else 'approval_rejected',r['id'])
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
                p=json.loads(r['data']);p['state']=data['state'];p['owner']=s['name'];p['history'].append({'state':data['state'],'at':int(time.time())});c.execute('UPDATE cases SET data=? WHERE id=?',(json.dumps(p),r['id']));self.log(c,s['user_id'],'case_updated',r['id'])
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
            result['flags']=json.loads(c.execute("SELECT data FROM settings WHERE id='flags'").fetchone()[0])
            if privileged:
                for t in ['batches','approvals','audit','payments']:result[t]=[decode(r) for r in rows(t)]
                result['events']=[dict(r) for r in c.execute('SELECT name,COUNT(*) AS count FROM events GROUP BY name')]
            return result

    def address(self,s,data):
        if s['role']!='customer':raise Error('Use a customer session.',403)
        if not re.fullmatch(r'[1-9][0-9]{5}',str(data.get('pincode',''))):raise Error('Enter a valid pincode.')
        if not all(2<=len(str(data.get(k,'')))<=200 for k in ['name','address','city','state']):raise Error('Complete the address.')
        with self.db() as c:
            aid='ADDR-'+secrets.token_hex(5);clean={k:str(data[k])[:200] for k in ['name','address','city','state','pincode']};c.execute('INSERT INTO addresses VALUES(?,?,?)',(aid,s['user_id'],json.dumps(clean)))
        return {'id':aid}

    def review(self,s,data):
        rating=data.get('rating');text=str(data.get('text','')).strip()
        if type(rating)!=int or not 1<=rating<=5 or not 10<=len(text)<=1000:raise Error('Choose 1–5 stars and write 10–1000 characters.')
        with self.db() as c:
            r,p=self.owned_order(c,s,data.get('order_id'))
            if r['user_id']!=s['user_id'] or r['state']!='delivered' or data.get('product') not in [x['id'] for x in p['items']]:raise Error('Reviews require your own delivered order for this product.',403)
            try:c.execute('INSERT INTO reviews VALUES(?,?,?,?,?)',('REV-'+secrets.token_hex(5),s['user_id'],data['product'],r['id'],json.dumps({'rating':rating,'text':text,'state':'pending_moderation','preview':True})))
            except sqlite3.IntegrityError:raise Error('You already submitted a review for this product and order.',409)
        return {'ok':True}

class Handler(BaseHTTPRequestHandler):
    store=None
    def log_message(self,*args):pass
    def valid_host(self):
        return self.headers.get('Host') in [f'127.0.0.1:{self.server.server_port}',f'localhost:{self.server.server_port}']
    def json(self,status,data,cookie=None):
        body=json.dumps(data).encode();self.send_response(status);self.send_header('Content-Type','application/json');self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff')
        if cookie:self.send_header('Set-Cookie',f'bcc_session={cookie}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400')
        self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
    def api(self):
        path=urlparse(self.path).path;sid=''
        for part in self.headers.get('Cookie','').split(';'):
            if part.strip().startswith('bcc_session='):sid=part.strip().split('=',1)[1]
        s,new=self.store.session(sid);cookie=s['id'] if new else None
        try:
            data={}
            if self.command=='POST':
                if s['role']=='viewer' and path not in ['/api/demo/login','/api/logout']:raise Error('Viewer sessions are read-only.',403)
                origin=self.headers.get('Origin')
                if origin and urlparse(origin).netloc!=self.headers.get('Host'):raise Error('Cross-origin requests are not allowed.',403)
                if not hmac.compare_digest(self.headers.get('X-CSRF-Token',''),s['csrf']):raise Error('Refresh the page and retry.',403)
                length=int(self.headers.get('Content-Length','0'))
                if length<0 or length>20000:raise Error('Request too large or invalid.',413)
                data=json.loads(self.rfile.read(length) or b'{}')
                if not isinstance(data,dict):raise Error('Invalid request.')
            if self.command=='GET':
                if path=='/api/session':result={'user':{'id':s['user_id'],'name':s['name'],'role':s['role'],'mobile':s['mobile']},'csrf':s['csrf'],'preview':True}
                elif path=='/api/catalog':
                    with self.store.db() as c:flags=json.loads(c.execute("SELECT data FROM settings WHERE id='flags'").fetchone()[0])
                    result={'products':self.store.products(),'bundles':BUNDLES,'flags':flags,'preview':True}
                elif path=='/api/account':result=self.store.snapshot(s)
                elif path=='/api/admin':
                    if s['role'] not in ['admin','viewer']:raise Error('An operations session is required.',403)
                    result=self.store.snapshot(s)
                elif path=='/api/reports':
                    q=parse_qs(urlparse(self.path).query);pid=q.get('product',[''])[0];lot=q.get('lot',[''])[0].strip().upper()
                    if pid not in [p[0] for p in PRODUCTS]:raise Error('Choose a product.')
                    if lot=='DEMO-OUTAGE':raise Error('Sample service-unavailable state. Please try again.',503)
                    with self.store.db() as c:r=c.execute('SELECT * FROM batches WHERE id=? AND product=?',(lot,pid)).fetchone()
                    state='not_found' if not r else 'withdrawn' if r['state']=='quarantined' else 'unpublished' if not r['proof'] else 'sample_match'
                    if lot=='DEMO-UNPUBLISHED':state='unpublished'
                    if lot=='DEMO-WITHDRAWN':state='withdrawn'
                    result={'state':state,'lot':lot,'product':pid,'preview':True,'document':None,'message':'Illustrative record only. No laboratory result or authenticity claim.'}
                else:raise Error('Endpoint not found.',404)
            else:
                if path=='/api/demo/login':result=self.store.login(s,data)
                elif path=='/api/logout':
                    with self.store.db() as c:c.execute('DELETE FROM sessions WHERE id=?',(s['id'],))
                    result={'ok':True}
                elif path=='/api/auth/otp':result=self.store.otp(s,data)
                elif path=='/api/auth/verify':result=self.store.verify(s,data)
                elif path=='/api/orders':result=self.store.order(s,data)
                elif re.fullmatch(r'/api/orders/[^/]+/pay',path):result=self.store.pay(s,path.split('/')[3],data)
                elif re.fullmatch(r'/api/orders/[^/]+/cancel',path):result=self.store.cancel(s,path.split('/')[3])
                elif path=='/api/cases':result=self.store.case(s,data)
                elif path=='/api/addresses':result=self.store.address(s,data)
                elif path=='/api/reviews':result=self.store.review(s,data)
                elif path.startswith('/api/admin/'):result=self.store.admin(s,path.rsplit('/',1)[1],data)
                elif path=='/api/events':
                    if data.get('name') not in ['product_view','report_lookup','cart_add','checkout_start','consent_updated']:raise Error('Unknown event.')
                    with self.store.db() as c:c.execute('INSERT INTO events(user_id,name,created) VALUES(?,?,?)',(s['user_id'],data['name'],int(time.time())))
                    result={'ok':True}
                else:raise Error('Endpoint not found.',404)
            self.json(200,result,cookie)
        except Error as e:self.json(e.status,{'error':str(e)},cookie)
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
        if path.startswith('/web/'):file=ROOT/path.lstrip('/')
        elif path.startswith('/concepts/media/'):file=ROOT/path.lstrip('/')
        elif path.startswith('/assets/brand/logos/') or path.startswith('/assets/brand/fonts/'):file=ROOT/path.lstrip('/')
        elif path.startswith('/concepts/') and path.endswith(('.html','.css','.js')):file=ROOT/path.lstrip('/')
        elif path=='/favicon.ico':return self.json(404,{'error':'No favicon'})
        else:file=ROOT/'web/index.html'
        resolved=file.resolve()
        if not resolved.is_relative_to(ROOT) or '..' in path.split('/') or not resolved.is_file():return self.json(404,{'error':'Not found'})
        content=resolved.read_bytes();self.send_response(200);self.send_header('Content-Type',mimetypes.guess_type(str(resolved))[0] or 'application/octet-stream');self.send_header('X-Content-Type-Options','nosniff');self.send_header('Referrer-Policy','same-origin');self.send_header('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");self.send_header('Cache-Control','no-cache');self.send_header('Content-Length',str(len(content)));self.end_headers();self.wfile.write(content)

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=4174);parser.add_argument('--db',default=str(ROOT/'.local/preview.sqlite3'));args=parser.parse_args()
    if os.getenv('BCC_MODE','preview')!='preview':raise SystemExit('Live mode is not implemented. Configure real authentication, payment and provider adapters before production.')
    Handler.store=Store(args.db)
    server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
    print(f'Body Cafe Co local preview: http://127.0.0.1:{args.port}',flush=True)
    try:server.serve_forever()
    except KeyboardInterrupt:server.server_close()

if __name__=='__main__':main()
