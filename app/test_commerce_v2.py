"""Commerce acceptance: stock conservation, sales periods, full catalog content and report presentation."""
import json
import tempfile
import time
import unittest
from pathlib import Path
from datetime import datetime
from app.server import Store, Error
from app.commerce import IST, allocate, CONTENT_FIELDS
from app.lots import LotError
from app.test_lots import PDF
from app.test_media_fixtures import PNG

class RevisedCommerceTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'test.db')
        self.customer=self.store.session('')[0]
        self.admin={'role':'admin','user_id':'store-owner','name':'Store admin'}
        self.contact={'name':'Test Buyer','mobile':'9876543210','address':'123 Test Street','city':'Surat','state':'Gujarat','pincode':'395001'}
    def tearDown(self):self.tmp.cleanup()
    def order(self,items=None,discount=''):
        return self.store.order(self.customer,{'adult':True,'contact':self.contact,'items':items or [{'id':'iron-bisglycinate','quantity':1}],'discount':discount})
    def report(self,query=None):
        with self.store.db() as c:return self.store.sales_report(c,query or {})
    def batch(self,bid='DEMO-01-01'):
        return next(b for b in self.store.snapshot(self.admin)['batches'] if b['id']==bid)
    def timestamp(self,value):return int(datetime.fromisoformat(value).replace(tzinfo=IST).timestamp())
    def test_every_product_detail_field_and_ordered_image_visibility_persists(self):
        p=next(p for p in self.store.products() if p['id']=='iron-bisglycinate')
        p.update({k:'Custom '+k.replace('_',' ') for k in CONTENT_FIELDS})
        p.update({'faqs':[{'question':'A question?','answer':'An answer.'}],'sources':[{'title':'Source','url':'https://example.org/source'}],'related_product_ids':['l-theanine'],
          'gallery':[{'src':'/web/media/l-theanine.webp','alt':'First','caption':'Website image 1','label':'Primary','visible':True},{'src':'/web/media/iron-bisglycinate.webp','alt':'Hidden','visible':False},{'src':'/web/media/vitamin-d3-k2.webp','alt':'Second','visible':True}]})
        saved=self.store.admin(self.admin,'product_save',{'product':p,'version':0})
        self.store.admin(self.admin,'product_publish',{'id':p['id'],'version':saved['version'],'remarks':'Publish complete details.'})
        public=next(x for x in self.store.products() if x['id']==p['id'])
        self.assertEqual([g['alt'] for g in public['gallery']],['First','Second'])
        self.assertEqual(public['gallery'][0]['caption'],'Website image 1')
        self.assertEqual(public['faqs'],p['faqs'])
        for key in CONTENT_FIELDS:self.assertEqual(public[key],p[key])
        private=next(x for x in self.store.snapshot(self.admin)['products'] if x['id']==p['id']);self.assertEqual(len(private['gallery']),3)
    def test_all_hidden_gallery_cannot_publish_and_invalid_sources_are_rejected(self):
        p=next(p for p in self.store.products() if p['id']=='iron-bisglycinate')
        p['gallery']=[{'src':'/web/media/iron-bisglycinate.webp','alt':'Hidden','visible':False}]
        saved=self.store.admin(self.admin,'product_save',{'product':p,'version':0})
        with self.assertRaises(Error):self.store.admin(self.admin,'product_publish',{'id':p['id'],'version':saved['version'],'remarks':'Cannot publish hidden image.'})
        with self.assertRaises(Error):self.store.admin(self.admin,'product_save',{'product':{**p,'sources':[{'title':'Unsafe','url':'javascript:alert(1)'}]},'version':saved['version']})
    def test_checkout_capture_and_cancel_conserve_stock(self):
        before=self.batch();order=self.order()
        held=self.batch();self.assertEqual(held['available'],before['available']-1);self.assertEqual(held['reserved'],1);self.assertEqual(held['on_hand'],before['on_hand'])
        self.store.pay(self.customer,order['id'],{'outcome':'success'})
        paid=self.batch();self.assertEqual(paid['available'],held['available']);self.assertEqual(paid['committed'],1);self.assertEqual(paid['on_hand'],before['on_hand'])
        self.store.pay(self.customer,order['id'],{'outcome':'success'});self.assertEqual(self.batch()['available'],paid['available'])
        self.store.cancel(self.customer,order['id']);self.store.cancel(self.customer,order['id'])
        self.assertEqual(self.batch()['available'],before['available']);self.assertEqual(self.batch()['reserved'],0)
    def test_damage_preserves_physical_units_but_reduces_sellable(self):
        before=self.batch()
        self.store.admin(self.admin,'batch_adjust',{'id':before['id'],'quantity':-2,'kind':'damage','remarks':'Two damaged sealed units.'})
        after=self.batch();self.assertEqual(after['on_hand'],before['on_hand']);self.assertEqual(after['damaged'],2);self.assertEqual(after['sellable'],before['sellable']-2)
        with self.assertRaises(Error):self.store.admin(self.admin,'batch_adjust',{'id':before['id'],'quantity':1,'kind':'damage','remarks':'Invalid damage direction.'})
    def test_low_stock_threshold_and_quarantine_change_sellability(self):
        self.store.admin(self.admin,'batch_settings',{'id':'DEMO-01-01','location':'Rack A','low_stock_threshold':21,'remarks':'Set replenishment threshold.'})
        self.assertTrue(self.batch()['low_stock'])
        self.store.admin(self.admin,'quarantine',{'batch':'DEMO-01-01','reason':'Check this batch.'})
        self.assertEqual(self.batch()['sellable'],0);self.assertEqual(self.batch()['quarantined'],20)
    def test_pending_and_failed_payments_are_not_sales(self):
        order=self.order();self.assertEqual(self.report()['totals']['orders'],0)
        self.store.pay(self.customer,order['id'],{'outcome':'failure'});self.assertEqual(self.report()['totals']['units'],0)
        self.store.pay(self.customer,order['id'],{'outcome':'success'});self.store.pay(self.customer,order['id'],{'outcome':'success'})
        result=self.report();self.assertEqual(result['totals']['orders'],1);self.assertEqual(result['totals']['units'],1);self.assertEqual(result['totals']['net_sales'],order['total'])
    def test_discount_and_shipping_allocations_reconcile_product_filter_and_totals(self):
        order=self.order([{'id':'iron-bisglycinate','quantity':1},{'id':'creatine-chews','quantity':1}],discount='PREVIEW10')
        self.store.pay(self.customer,order['id'],{'outcome':'success'})
        report=self.report()
        self.assertEqual(report['totals']['discounts'],order['discount'])
        self.assertEqual(sum(p['net_sales'] for p in report['products']),order['total'])
        self.assertEqual(sum(p['shipping'] for p in report['products']),order['shipping'])
        for product in report['products']:
            filtered=self.report({'product':product['id']});self.assertEqual(filtered['totals']['net_sales'],product['net_sales']);self.assertEqual(filtered['totals']['orders'],1)
        self.assertEqual(sum(allocate(11,[1,1,1])),11)
    def test_sales_dates_use_ist_and_weeks_begin_monday(self):
        order=self.order();self.store.pay(self.customer,order['id'],{'outcome':'success'})
        with self.store.db() as c:c.execute('UPDATE sales_receipts SET captured=? WHERE order_id=?',(self.timestamp('2026-10-05T00:15:00'),order['id']))
        daily=self.report({'from':'2026-10-05','to':'2026-10-05'});self.assertEqual(daily['totals']['orders'],1)
        previous=self.report({'from':'2026-10-04','to':'2026-10-04'});self.assertEqual(previous['totals']['orders'],0)
        weekly=self.report({'from':'2026-10-01','to':'2026-10-10','group':'week'})
        self.assertEqual(next(p for p in weekly['periods'] if p['orders'])['period'],'2026-10-05')
        monthly=self.report({'from':'2026-10-01','to':'2026-10-31','group':'month'});self.assertEqual(monthly['periods'][0]['period'],'2026-10-01')
    def test_refund_is_recorded_once_on_refund_date_and_requires_cancellation(self):
        order=self.order();self.store.pay(self.customer,order['id'],{'outcome':'success'})
        with self.assertRaises(Error):self.store.admin(self.admin,'refund',{'id':order['id'],'remarks':'Cannot refund active order.'})
        self.store.cancel(self.customer,order['id'])
        self.store.admin(self.admin,'refund',{'id':order['id'],'remarks':'Full cancellation refund.'})
        self.assertTrue(self.store.admin(self.admin,'refund',{'id':order['id'],'remarks':'Repeated refund.'})['idempotent'])
        result=self.report();self.assertEqual(result['totals']['net_sales'],0);self.assertEqual(result['totals']['refunds'],order['total'])
        with self.store.db() as c:
            c.execute('UPDATE sales_receipts SET captured=? WHERE order_id=?',(self.timestamp('2026-09-30T23:59:00'),order['id']))
            c.execute('UPDATE sales_refunds SET refunded=? WHERE order_id=?',(self.timestamp('2026-10-01T00:01:00'),order['id']))
        refund_day=self.report({'from':'2026-10-01','to':'2026-10-01'});self.assertEqual(refund_day['totals']['net_sales'],-order['total']);self.assertEqual(refund_day['totals']['orders'],0)
    def test_image_only_report_can_publish_and_hidden_details_are_not_exposed(self):
        draft=self.store.admin(self.admin,'lot_draft',{'product':'iron-bisglycinate','lot':'DEMO-01-01'})
        record={'title':'Batch certificate image','summary':'Hidden summary','lab':{'name':'Private lab'},'presentation':{'show_documents':True,'show_summary':False,'show_results':False,'show_lab':False,'show_dates':False}}
        self.store.admin(self.admin,'lot_update',{'id':draft['id'],'record':record})
        doc=self.store.lot_image_upload(self.admin,draft['id'],PNG,'Certificate image','Page 1')
        with self.assertRaises(LotError):self.store.lots_document(self.customer,doc['id'],False)
        self.store.admin(self.admin,'lot_publish',{'id':draft['id'],'remarks':'Publish image only.'})
        public=self.store.lots_lookup('iron-bisglycinate','DEMO-01-01')['current']
        self.assertIsNone(public['record']['summary']);self.assertIsNone(public['record']['lab']['name'])
        raw,meta=self.store.lots_document(self.customer,doc['id'],False);self.assertEqual(meta['mime'],'image/png');self.assertTrue(raw.startswith(b'\x89PNG'))
        self.assertEqual(public['documents'][0]['caption'],'Page 1')
    def test_report_requires_only_selected_fields_and_right_product_lot(self):
        with self.assertRaises(LotError):self.store.admin(self.admin,'lot_draft',{'product':'l-theanine','lot':'DEMO-01-01'})
        draft=self.store.admin(self.admin,'lot_draft',{'product':'iron-bisglycinate','lot':'DEMO-01-01'})
        record={'title':'Certificate','presentation':{'show_documents':True,'show_summary':True}}
        self.store.admin(self.admin,'lot_update',{'id':draft['id'],'record':record})
        self.store.lot_upload(self.admin,draft['id'],PDF,'Certificate source','original',False,'')
        with self.assertRaises(LotError):self.store.admin(self.admin,'lot_publish',{'id':draft['id'],'remarks':'Missing selected summary.'})
        record['summary']='A short record summary.';self.store.admin(self.admin,'lot_update',{'id':draft['id'],'record':record})
        self.store.admin(self.admin,'lot_publish',{'id':draft['id'],'remarks':'Ready for publication.'})
    def test_removed_workflows_are_unavailable(self):
        for action in ('request','approve','lot_submit','lot_notice_request'):
            with self.assertRaises(Error) as exc:self.store.admin(self.admin,action,{})
            self.assertEqual(exc.exception.status,404)
        state=self.store.snapshot(self.admin);self.assertNotIn('audit',state);self.assertNotIn('approvals',state)

if __name__=='__main__':unittest.main()
