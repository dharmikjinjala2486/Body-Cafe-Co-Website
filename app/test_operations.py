"""Acceptance checks for the single-admin portal and its shared data contracts."""
import http.client
import json
import tempfile
import threading
import time
import unittest
from pathlib import Path
from http.server import ThreadingHTTPServer
from app.server import Store, Handler, Error
from app.test_lots import record, PDF

class OperationsTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.path=Path(self.tmp.name)/'operations.db';self.store=Store(self.path)
        self.store.setup_admin('owner.example','fixture-password-123')
        anon=self.store.session('')[0];login=self.store.admin_signin(anon,{'username':'owner.example','password':'fixture-password-123'})
        self.admin=self.store.session(login['_sid'])[0];self.customer=self.store.session('')[0]
    def tearDown(self):self.tmp.cleanup()
    def product(self):
        return {'id':'new-product','sku':'NEW-01','name':'A new product','subtitle':'A clear description','description':'Details entered by the admin.','ingredients':'Ingredient list','format':'Capsules','price':825,'color':'#35306f','gallery':[{'src':'/web/media/l-theanine.webp','alt':'Product bottle'}]}
    def save(self,p=None,version=0):return self.store.admin(self.admin,'product_save',{'product':p or self.product(),'version':version})
    def publish(self,pid,version):return self.store.admin(self.admin,'product_publish',{'id':pid,'version':version,'remarks':'Reviewed catalog details.'})
    def batch(self):
        self.store.admin(self.admin,'batch_create',{'id':'NEW-LOT-001','product':'new-product','expiry':int(time.time())+86400*90,'quantity':3,'remarks':'Opening stock received.'})
        self.store.admin(self.admin,'batch_release',{'id':'NEW-LOT-001','evidence_confirmed':True,'remarks':'Reviewed batch evidence.'})
    def test_owner_is_the_only_seeded_admin_and_demo_login_is_retired(self):
        with self.store.db() as c:
            self.assertEqual([r['id'] for r in c.execute("SELECT id FROM users WHERE role='admin'")],['store-owner'])
        with self.assertRaises(Error):self.store.login(self.customer,{'identity':'admin-a'})
        with self.assertRaises(Error):self.store.setup_admin('other','another-password')
    def test_login_rotates_session_and_does_not_change_customer(self):
        anon=self.store.session('')[0];old=anon['id'];login=self.store.admin_signin(anon,{'username':'owner.example','password':'fixture-password-123'})
        self.assertNotEqual(old,login['_sid']);self.assertEqual(self.store.session(old)[0]['role'],'customer')
        self.assertEqual(self.store.session(self.customer['id'])[0]['role'],'customer')
    def test_failed_login_attempts_persist_and_throttle(self):
        for _ in range(5):
            with self.assertRaises(Error) as err:self.store.admin_signin(self.customer,{'username':'owner.example','password':'incorrect'})
            self.assertEqual(err.exception.status,401)
        with self.assertRaises(Error) as err:self.store.admin_signin(self.customer,{'username':'owner.example','password':'fixture-password-123'})
        self.assertEqual(err.exception.status,429)
    def test_password_change_revokes_all_admin_sessions(self):
        self.store.admin_password(self.admin,{'current_password':'fixture-password-123','new_password':'replacement-pass-123'})
        self.assertEqual(self.store.session(self.admin['id'])[0]['role'],'customer')
        new=self.store.admin_signin(self.customer,{'username':'owner.example','password':'replacement-pass-123'});self.assertTrue(new['_sid'])
    def test_new_product_draft_publish_inventory_order_and_history(self):
        r=self.save();self.assertNotIn('new-product',[p['id'] for p in self.store.products()])
        self.assertEqual(self.store.snapshot(self.admin)['products'][-1]['draft']['name'],'A new product')
        self.publish(r['id'],r['version']);self.batch()
        public=next(p for p in self.store.products() if p['id']=='new-product');self.assertEqual(public['stock'],3)
        payload={'adult':True,'items':[{'id':'new-product','quantity':1}],'contact':{'name':'Test buyer','mobile':'9876543210','address':'Test address 123','city':'Surat','state':'Gujarat','pincode':'395001'}}
        order=self.store.order(self.customer,payload)
        changed={**self.product(),'name':'Changed product','price':950};r=self.save(changed,r['version']);self.publish(r['id'],r['version'])
        self.assertEqual(self.store.account_view(self.customer)['orders'][0]['items'][0]['name'],'A new product')
        self.assertEqual(self.store.account_view(self.customer)['orders'][0]['items'][0]['unit_price'],825)
        reopened=Store(self.path);self.assertEqual(next(p for p in reopened.products() if p['id']=='new-product')['price'],950)
        self.assertEqual(reopened.snapshot(self.admin)['movements'][0]['kind'],'reservation')
        self.assertEqual(order['items'][0]['id'],'new-product')
    def test_stale_draft_and_duplicate_sku_are_rejected(self):
        self.save()
        with self.assertRaises(Error):self.save()
        with self.assertRaises(Error):self.save({**self.product(),'id':'another-product'})
        with self.assertRaises(Error):self.publish('new-product',0)
    def test_publish_requires_image_and_remarks(self):
        r=self.save({**self.product(),'gallery':[]})
        with self.assertRaises(Error):self.publish(r['id'],r['version'])
    def test_inventory_adjustment_cannot_go_negative_and_release_requires_confirmation(self):
        self.save();self.batch()
        with self.assertRaises(Error):self.store.admin(self.admin,'batch_adjust',{'id':'NEW-LOT-001','quantity':-4,'remarks':'Incorrect removal.'})
        with self.assertRaises(Error):self.store.admin(self.admin,'batch_release',{'id':'NEW-LOT-001','remarks':'Missing confirmation.'})
        self.store.admin(self.admin,'batch_adjust',{'id':'NEW-LOT-001','quantity':-1,'remarks':'Damaged unit removed.'})
        self.assertEqual(next(b for b in self.store.snapshot(self.admin)['batches'] if b['id']=='NEW-LOT-001')['available'],2)
    def test_owner_publishes_product_and_report_without_queue(self):
        product=next(p for p in self.store.products() if p['id']=='l-theanine')
        product.update({'price':1700,'gallery':[{'src':'/web/media/l-theanine.webp','alt':'L-Theanine'}]})
        draft=self.store.admin(self.admin,'product_save',{'product':product,'version':0})
        self.publish(draft['id'],draft['version'])
        self.assertEqual(next(p for p in self.store.products() if p['id']=='l-theanine')['price'],1700)
        report=self.store.admin(self.admin,'lot_draft',{'product':'l-theanine','lot':'DEMO-02-01'})
        self.store.admin(self.admin,'lot_update',{'id':report['id'],'record':record()})
        self.store.lot_upload(self.admin,report['id'],PDF,'Fixture report','original',False,'')
        self.store.admin(self.admin,'lot_publish',{'id':report['id'],'remarks':'Checked laboratory report.'})
        self.assertEqual(self.store.lots_lookup('l-theanine','DEMO-02-01')['current']['state'],'published')
        self.assertNotIn('approvals',self.store.snapshot(self.admin))

    def test_customer_cannot_modify_catalog(self):
        with self.assertRaises(Error):self.store.admin(self.customer,'product_save',{'product':self.product(),'version':0})
    def test_order_actions_require_remarks_and_validate_states(self):
        r=self.save();self.publish(r['id'],r['version']);self.batch()
        order=self.store.order(self.customer,{'adult':True,'items':[{'id':'new-product','quantity':1}],'contact':{'name':'Test buyer','mobile':'9876543210','address':'Test address 123','city':'Surat','state':'Gujarat','pincode':'395001'}})
        with self.assertRaises(Error):self.store.admin(self.admin,'order_update',{'id':order['id'],'state':'delivered','remarks':'Invalid transition.'})
        self.store.pay(self.customer,order['id'],{'outcome':'success'})
        self.store.admin(self.admin,'order_update',{'id':order['id'],'state':'packing','remarks':'Private fulfillment instructions.','public_note':'Your order is being packed.'})
        self.store.admin(self.admin,'order_update',{'id':order['id'],'state':'cancelled','remarks':'Cancellation requested.'})
        self.assertEqual(next(p for p in self.store.products() if p['id']=='new-product')['stock'],3)
        with self.assertRaises(Error):self.store.admin(self.admin,'order_update',{'id':order['id'],'state':'cancelled','remarks':'Duplicate cancellation.'})
        self.assertEqual(next(p for p in self.store.products() if p['id']=='new-product')['stock'],3)
    def test_repeated_stock_operation_applies_once(self):
        self.save();self.batch()
        payload={'id':'NEW-LOT-001','quantity':2,'remarks':'Receive additional units.','request_id':'stock-request-00000001'}
        self.store.admin(self.admin,'batch_adjust',payload)
        repeated=self.store.admin(self.admin,'batch_adjust',payload)
        self.assertTrue(repeated['idempotent'])
        self.assertEqual(next(b for b in self.store.snapshot(self.admin)['batches'] if b['id']=='NEW-LOT-001')['available'],5)
        with self.assertRaises(Error):self.store.admin(self.admin,'batch_adjust',{**payload,'quantity':3})

    def test_checkout_flag_is_enforced_on_server(self):
        self.store.admin(self.admin,'flags_update',{'key':'checkout_enabled','value':False,'remarks':'Pause for maintenance.'})
        with self.assertRaises(Error) as err:self.store.order(self.customer,{'adult':True,'items':[{'id':'l-theanine','quantity':1}],'contact':{'name':'Test buyer','mobile':'9876543210','address':'Test address 123','city':'Surat','state':'Gujarat','pincode':'395001'}})
        self.assertEqual(err.exception.status,409)

class OperationsHttpTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp=tempfile.TemporaryDirectory();Handler.store=Store(Path(cls.tmp.name)/'http.db');Handler.store.setup_admin('owner.example','fixture-password-123')
        cls.server=ThreadingHTTPServer(('127.0.0.1',0),Handler);cls.port=cls.server.server_port;cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start()
    @classmethod
    def tearDownClass(cls):cls.server.shutdown();cls.server.server_close();cls.thread.join();cls.tmp.cleanup()
    def request(self,method,path,data=None,cookie='',csrf=''):
        conn=http.client.HTTPConnection('127.0.0.1',self.port);conn.request(method,path,json.dumps(data) if data is not None else None,{'Cookie':cookie,'X-CSRF-Token':csrf,'Content-Type':'application/json'})
        r=conn.getresponse();status,headers,body=r.status,dict(r.getheaders()),r.read();conn.close();return status,headers,json.loads(body)
    def test_credential_login_cookie_rotation_logout_and_no_demo_backdoor(self):
        status,headers,session=self.request('GET','/api/admin/session');cookie=headers['Set-Cookie'].split(';')[0]
        self.assertTrue(cookie.startswith('bcc_admin='));self.assertEqual(self.request('GET','/api/admin',cookie=cookie)[0],403)
        status,headers,out=self.request('POST','/api/admin/login',{'username':'owner.example','password':'fixture-password-123'},cookie,session['csrf']);self.assertEqual(status,200)
        rotated=headers['Set-Cookie'].split(';')[0];self.assertNotEqual(rotated,cookie)
        self.assertEqual(self.request('GET','/api/admin',cookie=rotated)[0],200)
        self.assertEqual(self.request('GET','/api/admin',cookie=cookie)[0],403)
        _,_,active=self.request('GET','/api/admin/session',cookie=rotated)
        self.assertEqual(self.request('POST','/api/admin/logout',{},rotated,active['csrf'])[0],200)
        self.assertEqual(self.request('GET','/api/admin',cookie=rotated)[0],403)
        _,customer_headers,customer=self.request('GET','/api/session');customer_cookie=customer_headers['Set-Cookie'].split(';')[0]
        self.assertEqual(self.request('POST','/api/demo/login',{'identity':'admin-a'},customer_cookie,customer['csrf'])[0],404)

if __name__=='__main__':unittest.main()
