import concurrent.futures
from pathlib import Path
import tempfile
import time
import unittest
from app.server import Store, Error

class CommerceTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.store=Store(Path(self.temp.name)/'test.db');self.customer=self.store.session('')[0]
        self.payload={'items':[{'id':'vitamin-d3-k2','quantity':2}],'adult':True,'method':'prepaid','contact':{'name':'Preview Customer','mobile':'9876543210','address':'123 Sample Street','city':'Surat','state':'Gujarat','pincode':'395001'}}
        self.admin_a=self.store.session('')[0];self.store.login(self.admin_a,{'identity':'admin-a'});self.admin_a=self.store.session(self.admin_a['id'])[0]
        self.admin_b=self.store.session('')[0];self.store.login(self.admin_b,{'identity':'admin-b'});self.admin_b=self.store.session(self.admin_b['id'])[0]
    def tearDown(self):self.temp.cleanup()
    def stock(self,pid='vitamin-d3-k2'):
        return next(p['stock'] for p in self.store.products() if p['id']==pid)
    def test_fefo_and_atomic_reservation(self):
        order=self.store.order(self.customer,self.payload)
        self.assertEqual(self.stock(),38)
        with self.store.db() as c:
            r=c.execute('SELECT batch,quantity FROM reservations WHERE order_id=?',(order['id'],)).fetchone()
            self.assertEqual(r['batch'],'DEMO-03-01');self.assertEqual(r['quantity'],2)
    def test_transaction_rollback_when_one_product_has_no_stock(self):
        payload={**self.payload,'items':[{'id':'vitamin-d3-k2','quantity':2},{'id':'invalid','quantity':1}]}
        with self.assertRaises(Error):self.store.order(self.customer,payload)
        self.assertEqual(self.stock(),40)
    def test_concurrent_checkouts_cannot_oversell(self):
        payload={**self.payload,'items':[{'id':'vitamin-d3-k2','quantity':10}]}
        def reserve(_):
            try:self.store.order(self.customer,payload);return True
            except Error:return False
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:results=list(pool.map(reserve,range(6)))
        self.assertEqual(sum(results),4);self.assertEqual(self.stock(),0)
    def test_payment_idempotence(self):
        order=self.store.order(self.customer,self.payload)
        self.store.pay(self.customer,order['id'],{'outcome':'success'})
        repeat=self.store.pay(self.customer,order['id'],{'outcome':'success'})
        self.assertTrue(repeat['idempotent']);self.assertEqual(self.stock(),38)
    def test_failed_payment_can_retry(self):
        order=self.store.order(self.customer,self.payload)
        failure=self.store.pay(self.customer,order['id'],{'outcome':'failure'})
        self.assertEqual(failure['state'],'pending');self.assertEqual(self.stock(),38)
        self.assertEqual(self.store.pay(self.customer,order['id'],{'outcome':'success'})['state'],'paid')
    def test_expired_payment_cannot_capture_and_stock_restores_once(self):
        order=self.store.order(self.customer,self.payload)
        with self.store.db() as c:c.execute('UPDATE reservations SET expires=? WHERE order_id=?',(int(time.time())-1,order['id']))
        with self.assertRaises(Error):self.store.pay(self.customer,order['id'],{'outcome':'success'})
        self.assertEqual(self.stock(),40);self.assertEqual(self.stock(),40)
    def test_quarantined_lot_blocks_capture_and_new_allocation(self):
        order=self.store.order(self.customer,self.payload)
        self.store.admin(self.admin_a,'quarantine',{'batch':'DEMO-03-01','reason':'Preview safety investigation'})
        with self.assertRaises(Error):self.store.pay(self.customer,order['id'],{'outcome':'success'})
        self.assertEqual(self.stock(),20)
        next_order=self.store.order(self.customer,self.payload)
        with self.store.db() as c:self.assertEqual(c.execute('SELECT batch FROM reservations WHERE order_id=?',(next_order['id'],)).fetchone()[0],'DEMO-03-02')
    def test_unreleased_proof_blocks_sale(self):
        with self.store.db() as c:c.execute("UPDATE batches SET proof=0 WHERE product='vitamin-d3-k2'")
        with self.assertRaises(Error):self.store.order(self.customer,self.payload)
    def test_separate_person_approval_and_viewer_denial(self):
        request=self.store.admin(self.admin_a,'request',{'kind':'price','target':'vitamin-d3-k2','value':1200})
        with self.assertRaises(Error):self.store.admin(self.admin_a,'approve',{'id':request['id'],'decision':'approve'})
        viewer={**self.admin_a,'role':'viewer'}
        with self.assertRaises(Error):self.store.admin(viewer,'approve',{'id':request['id'],'decision':'approve'})
        self.store.admin(self.admin_b,'approve',{'id':request['id'],'decision':'approve'})
        self.assertEqual(next(p['price'] for p in self.store.products() if p['id']=='vitamin-d3-k2'),1200)
        with self.assertRaises(Error):self.store.admin(self.admin_b,'approve',{'id':request['id'],'decision':'approve'})
    def test_paid_cancel_refund_requires_two_admins(self):
        order=self.store.order(self.customer,self.payload);self.store.pay(self.customer,order['id'],{'outcome':'success'});self.store.cancel(self.customer,order['id'])
        self.assertEqual(self.stock(),40)
        self.store.cancel(self.customer,order['id']);self.assertEqual(self.stock(),40)
        request=self.store.admin(self.admin_a,'request',{'kind':'refund','target':order['id']})
        with self.assertRaises(Error):self.store.admin(self.admin_a,'approve',{'id':request['id'],'decision':'approve'})
        self.store.admin(self.admin_b,'approve',{'id':request['id'],'decision':'approve'})
        self.assertEqual(self.store.snapshot(self.customer)['orders'][0]['refund'],'refunded_preview')
    def test_shipped_order_cannot_cancel_review_requires_delivery(self):
        order=self.store.order(self.customer,self.payload);self.store.pay(self.customer,order['id'],{'outcome':'success'})
        review={'order_id':order['id'],'product':'vitamin-d3-k2','rating':5,'text':'A preview review of a delivered order.'}
        with self.assertRaises(Error):self.store.review(self.customer,review)
        self.store.admin(self.admin_a,'ship',{'id':order['id']})
        with self.assertRaises(Error):self.store.cancel(self.customer,order['id'])
        self.store.admin(self.admin_a,'ship',{'id':order['id']});self.store.review(self.customer,review)
        self.assertEqual(len(self.store.snapshot(self.customer)['reviews']),1)
    def test_paid_lot_expiry_blocks_dispatch(self):
        order=self.store.order(self.customer,self.payload)
        self.store.pay(self.customer,order['id'],{'outcome':'success'})
        with self.store.db() as c:
            c.execute("UPDATE batches SET expiry=? WHERE id='DEMO-03-01'",(int(time.time())-1,))
        with self.assertRaises(Error):self.store.admin(self.admin_a,'ship',{'id':order['id']})
        self.assertEqual(self.store.snapshot(self.customer)['orders'][0]['state'],'paid')
    def test_customers_cannot_access_other_orders(self):
        order=self.store.order(self.customer,self.payload);other=self.store.session('')[0]
        with self.assertRaises(Error):self.store.pay(other,order['id'],{'outcome':'success'})
        self.assertEqual(self.store.snapshot(other)['orders'],[])
    def test_otp_claims_only_matching_guest_orders(self):
        order=self.store.order(self.customer,self.payload)
        otp=self.store.otp(self.customer,{'mobile':'9876543210'})
        with self.assertRaises(Error):self.store.verify(self.customer,{'mobile':'9876543210','code':'wrong'})
        self.store.verify(self.customer,{'mobile':'9876543210','code':otp['preview_code']})
        signed=self.store.session(self.customer['id'])[0]
        self.assertEqual(self.store.snapshot(signed)['orders'][0]['id'],order['id'])
        self.assertFalse(signed['user_id'].startswith('guest-'))
    def test_policy_pending_cod_and_invalid_quantities_rejected(self):
        with self.assertRaises(Error):self.store.order(self.customer,{**self.payload,'method':'cod'})
        with self.assertRaises(Error):self.store.order(self.customer,{**self.payload,'items':[{'id':'vitamin-d3-k2','quantity':-1}]})
        with self.assertRaises(Error):self.store.order(self.customer,{**self.payload,'adult':False})
        self.assertEqual(self.stock(),40)

if __name__=='__main__':unittest.main()
