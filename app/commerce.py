"""Direct single-admin commerce: catalog content, stock controls, sales and report publication."""
import hashlib
import json
import re
import secrets
import time
from datetime import datetime, date, timedelta, timezone
try:
    from app.errors import Error
    from app import media, lots
except ImportError:
    from errors import Error
    import media, lots

IST = timezone(timedelta(hours=5, minutes=30))
CONTENT_FIELDS = {'purpose':1500,'amount_per_serving':3000,'serving_size':3000,'servings_per_pack':3000,
    'other_ingredients':3000,'flavour_sweeteners':3000,'nutrition_information':3000,'dietary_suitability':3000,
    'manufacturer_details':3000,'ingredient_sourcing':3000,'manufacturer':3000,'testing_performed':3000,
    'supporting_documents':3000,'certifications':3000,'preparation':3000,'age_guidance':3000,'suitability':3000,
    'rear_label_note':3000,'label_checklist':3000,'ingredient_note':4000,'ingredient_checks':3000}
PRESENTATION = {'show_summary':True,'show_results':False,'show_lab':False,'show_dates':False,'show_documents':True}
RETIRED_ACTIONS = {'request','approve','lot_submit','lot_notice_request','lot_notice_retire_request','lot_withdraw_request'}

def allocate(amount, weights):
    """Deterministic integer allocation whose shares always add back to the original amount."""
    total=sum(weights)
    if not weights:return []
    if not total:
        result=[0]*len(weights);result[0]=amount;return result
    shares=[amount*w//total for w in weights]
    remainder=amount-sum(shares)
    indices=sorted(range(len(weights)),key=lambda i:(-(amount*weights[i]%total),i))
    for i in indices[:remainder]:shares[i]+=1
    return shares

class CommerceMixin:
    def operations_init(self,c):
        super().operations_init(c)
        c.executescript('''
        CREATE TABLE IF NOT EXISTS sales_receipts(order_id TEXT PRIMARY KEY, captured INTEGER NOT NULL, amount INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS sales_refunds(order_id TEXT PRIMARY KEY, refunded INTEGER NOT NULL, amount INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS lot_document_meta(document TEXT PRIMARY KEY, mime TEXT NOT NULL, ext TEXT NOT NULL, caption TEXT NOT NULL DEFAULT '');
        ''')
        # Retire queues without applying pending changes. Historical rows remain in the private backup/database.
        c.execute("UPDATE approvals SET state='retired' WHERE state='pending'")
        c.execute("UPDATE lot_reports SET state='draft' WHERE state='in_review'")
        for order in c.execute('SELECT id,data FROM orders').fetchall():
            payload=json.loads(order['data'])
            if payload.get('refund')=='approval_pending':
                payload['refund']='pending_refund';c.execute('UPDATE orders SET data=? WHERE id=?',(json.dumps(payload),order['id']))
        for row in c.execute("SELECT o.*,p.status AS payment_status FROM orders o JOIN payments p ON p.order_id=o.id WHERE p.status IN ('captured','refunded_preview')").fetchall():
            p=json.loads(row['data']);paid=next((x['at'] for x in p.get('history',[]) if x.get('state')=='paid'),row['created'])
            c.execute('INSERT OR IGNORE INTO sales_receipts VALUES(?,?,?)',(row['id'],p.get('paid_at',paid),p['total']))
            if row['payment_status']=='refunded_preview':
                refund=p.get('refunded_at') or next((x['at'] for x in reversed(p.get('history',[])) if x.get('state')=='cancelled'),paid)
                c.execute('INSERT OR IGNORE INTO sales_refunds VALUES(?,?,?)',(row['id'],refund,p['total']))

    def capture(self,c,s,oid,p):
        super().capture(c,s,oid,p)
        captured=int(time.time());p['paid_at']=captured
        c.execute('UPDATE orders SET data=? WHERE id=?',(json.dumps(p),oid))
        c.execute('INSERT OR IGNORE INTO sales_receipts VALUES(?,?,?)',(oid,captured,p['total']))

    def product_save(self,c,s,data):
        raw=data.get('product')
        if not isinstance(raw,dict):raise Error('Complete the product details.')
        extras={}
        for key,limit in CONTENT_FIELDS.items():
            if key in raw:
                if not isinstance(raw[key],str) or len(raw[key])>limit:raise Error('Check the '+key.replace('_',' ')+' field.')
                extras[key]=raw[key].strip()
        for key,cols in [('faqs',('question','answer')),('sources',('title','url'))]:
            if key not in raw:continue
            rows=raw[key]
            if not isinstance(rows,list) or len(rows)>20:raise Error('Use up to 20 '+key+' entries.')
            entries=[]
            for row in rows:
                if not isinstance(row,dict):raise Error('Check the '+key+' entries.')
                if not any(row.get(k) for k in cols):continue
                entry={}
                for col in cols:
                    text=row.get(col,'')
                    if not isinstance(text,str) or not text.strip() or len(text)> (3000 if col=='answer' else 1000 if col=='url' else 600):raise Error('Complete every '+key+' entry.')
                    entry[col]=text.strip()
                if key=='sources' and not re.fullmatch(r'https://[^\s<>"\']{4,990}',entry['url']):raise Error('Source links must be valid HTTPS URLs.')
                entries.append(entry)
            extras[key]=entries
        if 'related_product_ids' in raw:
            ids=raw['related_product_ids']
            if not isinstance(ids,list) or len(ids)>6 or not all(isinstance(v,str) for v in ids) or len(ids)!=len(set(ids)):raise Error('Choose up to six distinct related products.')
            if raw.get('id') in ids:raise Error('A product cannot be related to itself.')
            for pid in ids:
                if not c.execute('SELECT 1 FROM products WHERE id=?',(pid,)).fetchone():raise Error('A related product does not exist.')
            extras['related_product_ids']=ids
        gallery=raw.get('gallery')
        metadata=[]
        if gallery is not None:
            if not isinstance(gallery,list):raise Error('Check the gallery.')
            for image in gallery:
                if not isinstance(image,dict) or type(image.get('visible',True))!=bool:raise Error('Choose whether each image is visible.')
                meta={'visible':image.get('visible',True)}
                for key in ('label','caption'):
                    v=image.get(key,'')
                    if not isinstance(v,str) or len(v)>600:raise Error('Image captions and labels must be 600 characters or fewer.')
                    meta[key]=v.strip()
                metadata.append(meta)
        result=super().product_save(c,s,data)
        row=c.execute('SELECT data FROM product_drafts WHERE product=?',(result['id'],)).fetchone()
        p=json.loads(row['data']);p.update(extras)
        if gallery is not None:
            for image,meta in zip(p['gallery'],metadata):image.update(meta)
        c.execute('UPDATE product_drafts SET data=? WHERE product=?',(json.dumps(p),p['id']))
        return result

    def operations_snapshot(self,c,result):
        super().operations_snapshot(c,result)
        result.pop('approvals',None);result.pop('audit',None);result.pop('lot_notices',None)
        summary={key:0 for key in ('on_hand','available','reserved','quarantined','damaged','expired','low_stock_batches','expiring_batches')}
        now=int(time.time())
        for b in result['batches']:
            meta=b['meta'];meta.setdefault('low_stock_threshold',5);meta.setdefault('damaged',0);meta.setdefault('returned_pending',0)
            allocations=c.execute("SELECT r.quantity,r.state,o.state AS order_state FROM reservations r JOIN orders o ON o.id=r.order_id WHERE r.batch=?",(b['id'],)).fetchall()
            b['held']=sum(x['quantity'] for x in allocations if x['state']=='held')
            b['committed']=sum(x['quantity'] for x in allocations if x['state']=='consumed' and x['order_state'] in ('paid','packing'))
            b['reserved']=b['held']+b['committed']
            b['damaged']=meta['damaged'];b['on_hand']=b['available']+b['reserved']+b['damaged']+meta['returned_pending']
            b['expired']=b['on_hand'] if b['expiry']<=now else 0
            b['sellable']=b['available'] if b['state']=='released' and b['proof'] and not b['expired'] else 0
            b['sold']=sum(x['quantity'] for x in allocations if x['state']=='consumed')
            b['low_stock']=b['state']=='released' and not b['expired'] and b['sellable']<=meta['low_stock_threshold']
            b['expiring_soon']=now<b['expiry']<=now+60*86400
            b['quarantined']=b['available']+b['reserved'] if b['state']=='quarantined' and not b['expired'] else 0
            for key in ('on_hand','reserved','quarantined','damaged','expired'):summary[key]+=b[key]
            summary['available']+=b['sellable'];summary['low_stock_batches']+=int(b['low_stock']);summary['expiring_batches']+=int(b['expiring_soon'])
        result['inventory_summary']=summary
        result['sales']=self.sales_report(c,{})
        # PDFs predate document metadata. Their MIME defaults safely to application/pdf.
        for report in result.get('lot_reports',[]):
            for doc in report['documents']:
                meta=c.execute('SELECT * FROM lot_document_meta WHERE document=?',(doc['id'],)).fetchone()
                doc['mime']=meta['mime'] if meta else 'application/pdf';doc['caption']=meta['caption'] if meta else ''
            report['record'].setdefault('presentation',dict(PRESENTATION))
        return result

    def admin(self,s,action,data):
        self.require(s,'admin')
        if action in RETIRED_ACTIONS:raise Error('This workflow has been removed. Apply the change directly from its record.',404)
        if action in ('batch_settings','refund','lot_publish','lot_withdraw'):
            with self.db() as c:return self.operations_dispatch(c,s,action,data)
        return self.legacy_admin(s,action,data)

    def operations_action(self,c,s,action,data):
        reason=str(data.get('remarks','')).strip()
        if action=='product_publish':
            row=c.execute('SELECT data FROM product_drafts WHERE product=?',(data.get('id'),)).fetchone()
            if row and not any(g.get('visible',True) for g in json.loads(row[0]).get('gallery',[])):raise Error('Choose at least one visible website image before publishing.')
        if action=='batch_create':
            threshold=data.get('low_stock_threshold',5)
            if type(threshold)!=int or not 0<=threshold<=1000000:raise Error('Enter a valid low-stock threshold.')
            if data.get('manufactured'):
                try:manufactured=date.fromisoformat(data['manufactured'])
                except (TypeError,ValueError):raise Error('Choose a valid manufacturing date.')
                if manufactured>datetime.now(IST).date():raise Error('Manufacturing date cannot be in the future.')
            result=super().operations_action(c,s,action,data)
            row=c.execute('SELECT data FROM batch_meta WHERE batch=?',(data['id'],)).fetchone();meta=json.loads(row[0]);meta.update({'low_stock_threshold':threshold,'damaged':0,'returned_pending':0})
            c.execute('UPDATE batch_meta SET data=? WHERE batch=?',(json.dumps(meta),data['id']))
            return result
        if action=='batch_settings':
            b=c.execute('SELECT * FROM batches WHERE id=?',(data.get('id'),)).fetchone()
            if not b:raise Error('Batch not found.',404)
            threshold=data.get('low_stock_threshold',5);location=data.get('location','')
            if type(threshold)!=int or not 0<=threshold<=1000000:raise Error('Enter a non-negative low-stock threshold.')
            if not isinstance(location,str) or not 1<=len(location.strip())<=160 or len(reason)<5:raise Error('Add a storage location and change remark.')
            row=c.execute('SELECT data FROM batch_meta WHERE batch=?',(b['id'],)).fetchone();meta=json.loads(row[0]) if row else {}
            meta.update({'location':location.strip(),'low_stock_threshold':threshold})
            c.execute('INSERT OR REPLACE INTO batch_meta VALUES(?,?)',(b['id'],json.dumps(meta)))
            return {'ok':True}
        if action=='batch_adjust':
            qty=data.get('quantity');kind=data.get('kind','count_correction')
            if kind not in ('receive','damage','write_off','count_correction'):raise Error('Choose receive, damage, write-off or count correction.')
            if type(qty)!=int or qty==0 or (kind=='receive' and qty<0) or (kind in ('damage','write_off') and qty>0):raise Error('Stock receipts must be positive; damage and write-off quantities must be negative.')
            result=super().operations_action(c,s,action,data)
            c.execute("UPDATE stock_moves SET kind=? WHERE id=(SELECT id FROM stock_moves WHERE batch=? ORDER BY rowid DESC LIMIT 1)",(kind,data['id']))
            if kind=='damage':
                row=c.execute('SELECT data FROM batch_meta WHERE batch=?',(data['id'],)).fetchone();meta=json.loads(row[0]) if row else {}
                meta['damaged']=meta.get('damaged',0)-qty
                c.execute('INSERT OR REPLACE INTO batch_meta VALUES(?,?)',(data['id'],json.dumps(meta)))
            return result
        if action=='refund':
            r,p=self.owned_order(c,s,data.get('id'))
            if c.execute('SELECT 1 FROM sales_refunds WHERE order_id=?',(r['id'],)).fetchone():return {'ok':True,'idempotent':True}
            if r['state']!='cancelled' or self.payment_status(c,r['id'])!='captured':raise Error('Only a paid, cancelled order can receive a full refund.',409)
            if data.get('amount',p['total'])!=p['total']:raise Error('This workflow supports the full cancellation amount only.',409)
            if len(reason)<5:raise Error('Add a refund remark.')
            now=int(time.time());p['refund']='refunded_preview';p['refunded_at']=now
            p.setdefault('internal_notes',[]).append({'text':reason,'at':now,'actor':s['user_id']})
            p['history'].append({'state':'cancelled','at':now,'note':'Refund recorded in the local preview. No money moved.'})
            c.execute('UPDATE orders SET data=? WHERE id=?',(json.dumps(p),r['id']));c.execute("UPDATE payments SET status='refunded_preview' WHERE order_id=?",(r['id'],))
            c.execute('INSERT INTO sales_refunds VALUES(?,?,?)',(r['id'],now,p['total']))
            return {'ok':True,'preview':True}
        if action in ('lot_publish','lot_withdraw'):return self.report_direct(c,s,action,data)
        return super().operations_action(c,s,action,data)

    def sales_report(self,c,query):
        def value(k,default=''):
            v=query.get(k,default);return v[0] if isinstance(v,list) else v
        group=value('group','day')
        if group not in ('day','week','month'):raise Error('Choose daily, weekly or monthly sales.')
        today=datetime.now(IST).date()
        try:
            start=date.fromisoformat(value('from',(today-timedelta(days=29)).isoformat()));end=date.fromisoformat(value('to',today.isoformat()))
        except (TypeError,ValueError):raise Error('Choose a valid sales date range.')
        if start>end or (end-start).days>3660:raise Error('Choose an ordered date range of up to ten years.')
        pid=value('product')
        if pid and not c.execute('SELECT 1 FROM products WHERE id=?',(pid,)).fetchone():raise Error('Choose an existing product.')
        def period(d):
            if group=='week':return (d-timedelta(days=d.weekday())).isoformat()
            if group=='month':return d.replace(day=1).isoformat()
            return d.isoformat()
        def blank():return {'orders':0,'units':0,'gross_sales':0,'discounts':0,'shipping':0,'refunds':0,'net_sales':0,'refunded_units':0}
        periods={};day=start
        while day<=end:
            k=period(day);periods.setdefault(k,{'period':k,'label':k[:7] if group=='month' else k,**blank()});day+=timedelta(days=1)
        products={};total=blank();order_sets={k:set() for k in periods};all_orders=set()
        rows=c.execute('SELECT r.order_id,r.captured,r.amount,o.data FROM sales_receipts r JOIN orders o ON o.id=r.order_id').fetchall()
        for row in rows:
            p=json.loads(row['data']);lines=p['items'];weights=[i['unit_price']*i['quantity'] for i in lines]
            discounts=allocate(p.get('discount',0),weights);shipping=allocate(p.get('shipping',0),weights)
            ref=c.execute('SELECT * FROM sales_refunds WHERE order_id=?',(row['order_id'],)).fetchone()
            paid=[w-d+sh for w,d,sh in zip(weights,discounts,shipping)]
            refund_shares=allocate(ref['amount'],paid) if ref else [0]*len(lines)
            captured_date=datetime.fromtimestamp(row['captured'],IST).date()
            refund_date=datetime.fromtimestamp(ref['refunded'],IST).date() if ref else None
            for index,line in enumerate(lines):
                if pid and pid!=line['id']:continue
                captured_in=start<=captured_date<=end;refunded_in=refund_date is not None and start<=refund_date<=end
                if not captured_in and not refunded_in:continue
                product=products.setdefault(line['id'],{'id':line['id'],'name':line['name'],**blank()})
                if captured_in:
                    bucket=periods[period(captured_date)];order_sets[bucket['period']].add(row['order_id']);all_orders.add(row['order_id'])
                    values={'units':line['quantity'],'gross_sales':weights[index],'discounts':discounts[index],'shipping':shipping[index],'net_sales':paid[index]}
                    for target in (bucket,product,total):
                        for key,n in values.items():target[key]+=n
                if refunded_in:
                    bucket=periods[period(refund_date)]
                    for target in (bucket,product,total):
                        target['refunds']+=refund_shares[index];target['net_sales']-=refund_shares[index]
                        if ref['amount']==row['amount']:target['refunded_units']+=line['quantity']
        for k,ids in order_sets.items():periods[k]['orders']=len(ids)
        total['orders']=len(all_orders)
        return {'group':group,'from':start.isoformat(),'to':end.isoformat(),'product':pid,'timezone':'Asia/Kolkata','totals':total,'periods':list(periods.values()),'products':sorted(products.values(),key=lambda p:-p['net_sales']),'definition':'Sales use captured payment time. Refunds use refund time. Net sales include allocated shipping. Units are gross sold units; refunded units are separate. Weeks begin Monday.'}

    def report_direct(self,c,s,action,data):
        r=c.execute('SELECT * FROM lot_reports WHERE id=?',(data.get('id'),)).fetchone()
        if not r:raise lots.LotError('Report not found.',404)
        if action=='lot_withdraw':
            reason=str(data.get('reason','')).strip()
            if len(reason)<10:raise lots.LotError('Explain why the report is withdrawn (at least 10 characters).')
            if r['state']!='published':raise lots.LotError('Only a published report can be withdrawn.',409)
            c.execute("UPDATE lot_reports SET state='withdrawn',withdrawn=?,withdrawn_reason=?,updated=? WHERE id=?",(int(time.time()),reason,int(time.time()),r['id']))
            return {'ok':True}
        if r['state']=='published':return {'ok':True,'idempotent':True}
        if r['state'] not in ('draft','in_review'):raise lots.LotError('Start a corrected version to publish this report.',409)
        rec=lots.validate_record(json.loads(r['data'] or '{}'));presentation=rec['presentation']
        if not rec.get('title'):raise lots.LotError('Give this report a title.')
        if not presentation['show_documents']:raise lots.LotError('A published report must show its source document or image.')
        if not c.execute('SELECT 1 FROM lot_documents WHERE report_id=?',(r['id'],)).fetchone():raise lots.LotError('Upload at least one source document or image.')
        missing=[]
        if presentation['show_summary'] and not rec['summary']:missing.append('summary')
        if presentation['show_results'] and not rec['results']:missing.append('results')
        if presentation['show_lab']:
            for v,k in [(rec['lab']['name'],'laboratory name'),(rec['lab_report_no'],'report number'),(rec['sample']['type'],'sample material')]:
                if not v:missing.append(k)
        if presentation['show_dates'] and not rec['dates']['issued']:missing.append('issue date')
        if r['version']>1 and not rec['change_note']:missing.append('correction note')
        if missing:raise lots.LotError('Complete the displayed fields: '+', '.join(missing)+'.')
        previous=c.execute("SELECT id FROM lot_reports WHERE product=? AND lot=? AND state='published'",(r['product'],r['lot'])).fetchone();now=int(time.time())
        if previous:c.execute("UPDATE lot_reports SET state='superseded',superseded=?,superseded_by=? WHERE id=?",(now,r['id'],previous['id']))
        c.execute("UPDATE lot_reports SET state='published',approved_by=?,published=?,updated=?,data=? WHERE id=?",(s['user_id'],now,now,json.dumps(rec),r['id']))
        return {'ok':True,'id':r['id']}

    def lot_image_upload(self,s,rid,raw,title,caption=''):
        self.require(s,'admin')
        try:_,mime,ext,clean,w,h=media.sanitise(raw)
        except media.MediaError as exc:raise lots.LotError(str(exc),415)
        title=str(title).strip();caption=str(caption).strip()
        if not 3<=len(title)<=160 or len(caption)>600:raise lots.LotError('Add an image title (3–160 characters) and a caption up to 600 characters.')
        did='DOC-'+secrets.token_hex(8);path=self.lot_dir/(did+ext)
        with self.db() as c:
            r=c.execute('SELECT * FROM lot_reports WHERE id=?',(rid,)).fetchone()
            if not r or r['state'] not in ('draft','in_review'):raise lots.LotError('Choose an editable report draft.',409)
            if c.execute('SELECT COUNT(*) FROM lot_documents WHERE report_id=?',(rid,)).fetchone()[0]>=6:raise lots.LotError('Use up to six report files.',409)
            with path.open('xb') as file:file.write(clean)
            c.execute('INSERT INTO lot_documents VALUES(?,?,?,?,?,?,?,?,?,?)',(did,rid,title,'image',0,None,hashlib.sha256(clean).hexdigest(),len(clean),int(time.time()),s['user_id']))
            c.execute('INSERT INTO lot_document_meta VALUES(?,?,?,?)',(did,mime,ext,caption))
        return {'id':did,'mime':mime,'bytes':len(clean),'width':w,'height':h}

    def lot_public_version(self,c,r,privileged=False):
        version=super().lot_public_version(c,r,privileged)
        rec=version.get('record')
        if rec is not None:
            presentation=rec.get('presentation') or dict(PRESENTATION)
            for doc in version['documents']:
                meta=c.execute('SELECT * FROM lot_document_meta WHERE document=?',(doc['id'],)).fetchone();doc['mime']=meta['mime'] if meta else 'application/pdf';doc['caption']=meta['caption'] if meta else ''
            if not privileged:
                rec=dict(rec)
                if not presentation.get('show_summary',True):rec['summary']=None
                if not presentation.get('show_results',False):rec['results']=[];version['assessment']=lots.assessment_summary([])
                if not presentation.get('show_lab',False):rec['lab']={'name':None,'accreditation':{}};rec['lab_report_no']=None;rec['lab_sample_ref']=None;rec['sample']={};rec['commissioned_by']=None;rec['lab_notes']=None
                if not presentation.get('show_dates',False):rec['dates']={};rec['manufactured']=None;rec['expiry']=None
                version['record']=rec
        return version

    def lots_document(self,s,did,privileged):
        with self.db() as c:
            d=c.execute('SELECT d.*,r.state FROM lot_documents d JOIN lot_reports r ON r.id=d.report_id WHERE d.id=?',(did,)).fetchone()
            if not d or (not privileged and d['state'] not in ('published','superseded')):raise lots.LotError('Document not found.',404)
            meta=c.execute('SELECT * FROM lot_document_meta WHERE document=?',(did,)).fetchone()
            ext=meta['ext'] if meta else '.pdf';path=self.lot_dir/(did+ext)
            if not path.is_file():raise lots.LotError('Document not found.',404)
            raw=path.read_bytes()
            if hashlib.sha256(raw).hexdigest()!=d['sha256']:raise lots.LotError('Document integrity check failed.',409)
            info=dict(d);info['mime']=meta['mime'] if meta else 'application/pdf';info['ext']=ext;info['caption']=meta['caption'] if meta else ''
            return raw,info
