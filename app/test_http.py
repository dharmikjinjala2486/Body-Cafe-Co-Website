import http.client
import json
from pathlib import Path
import tempfile
import threading
import unittest
from http.server import ThreadingHTTPServer
from app.server import Handler, Store

class HttpTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp=tempfile.TemporaryDirectory();Handler.store=Store(Path(cls.temp.name)/'http.db')
        cls.server=ThreadingHTTPServer(('127.0.0.1',0),Handler);cls.port=cls.server.server_port
        cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start()
    @classmethod
    def tearDownClass(cls):cls.server.shutdown();cls.server.server_close();cls.thread.join();cls.temp.cleanup()
    def setUp(self):
        status,headers,body=self.request('GET','/api/session');self.cookie=headers['Set-Cookie'].split(';')[0];self.csrf=json.loads(body)['csrf']
    def request(self,method,path,data=None,headers=None):
        h={'Content-Type':'application/json'}
        if hasattr(self,'cookie'):h['Cookie']=self.cookie;h['X-CSRF-Token']=self.csrf
        h.update(headers or {});conn=http.client.HTTPConnection('127.0.0.1',self.port);conn.request(method,path,json.dumps(data) if data is not None else None,h);r=conn.getresponse();body=r.read();result=(r.status,dict(r.getheaders()),body);conn.close();return result
    def test_encoded_logo_and_static_allowlist(self):
        status,headers,body=self.request('GET','/assets/brand/logos/Body%20Cafe%20Co%20logo.svg');self.assertEqual(status,200);self.assertIn(b'<svg',body)
        status,headers,body=self.request('GET','/assets/source/blender/BCC_Final_Varient_1_Garden_SpotUV_Corrected.blend.gz');self.assertNotEqual(headers.get('Content-Type'),'application/gzip');self.assertNotIn(b'BLENDER',body)
    def test_csrf_and_origin_required(self):
        status,_,_=self.request('POST','/api/cases',{'message':'A sample support question.'},headers={'X-CSRF-Token':'wrong'});self.assertEqual(status,403)
        status,_,_=self.request('POST','/api/cases',{'message':'A sample support question.'},headers={'Origin':'https://other.example'});self.assertEqual(status,403)
    def test_untrusted_host_denied(self):
        status,_,_=self.request('GET','/api/session',headers={'Host':'other.example'});self.assertEqual(status,403)
    def test_viewer_server_endpoints_are_read_only(self):
        self.assertEqual(self.request('POST','/api/demo/login',{'identity':'viewer'})[0],200)
        self.assertEqual(self.request('GET','/api/admin')[0],200)
        for path,data in [('/api/cases',{'message':'A sample support question.'}),('/api/admin/quarantine',{'batch':'DEMO-01-01','reason':'Viewer attempt'}),('/api/auth/otp',{'mobile':'9876543210'})]:self.assertEqual(self.request('POST',path,data)[0],403)
    def test_checkout_contract_and_duplicate_payment(self):
        payload={'adult':True,'items':[{'id':'iron-bisglycinate','quantity':1}],'discount':'PREVIEW10','contact':{'name':'Preview Customer','mobile':'9876543210','address':'123 Sample Street','city':'Surat','state':'Gujarat','pincode':'395001'}}
        status,_,body=self.request('POST','/api/orders',payload);self.assertEqual(status,200);order=json.loads(body);self.assertEqual(order['total'],794);oid=order['id']
        self.assertEqual(self.request('POST',f'/api/orders/{oid}/pay',{'outcome':'failure'})[0],200)
        self.assertEqual(self.request('POST',f'/api/orders/{oid}/pay',{'outcome':'success'})[0],200)
        result=json.loads(self.request('POST',f'/api/orders/{oid}/pay',{'outcome':'success'})[2]);self.assertTrue(result['idempotent'])
    def test_checkout_rejects_malformed_nested_values(self):
        payload={'adult':True,'items':[{'id':'iron-bisglycinate','quantity':1}], 'contact':{'name':'Preview Customer','mobile':'9876543210','address':'123 Sample Street','city':'Surat','state':'Gujarat','pincode':'395001'}}
        for contact in [None, [], 'invalid']:
            with self.subTest(contact=contact):
                self.assertEqual(self.request('POST','/api/orders',{**payload,'contact':contact})[0],400)
        for item in [None, [], 'invalid', {'id':['iron-bisglycinate'],'quantity':1}, {'id':'iron-bisglycinate','quantity':True}]:
            with self.subTest(item=item):
                self.assertEqual(self.request('POST','/api/orders',{**payload,'items':[item]})[0],400)

    def test_lot_lookup_states_and_documents(self):
        for lot,expected in [('DEMO-03-01','match'),('UNKNOWN','not_found'),('DEMO-01-01','other_product'),('DEMO-UNPUBLISHED','match')]:
            result=json.loads(self.request('GET','/api/lots?product=vitamin-d3-k2&lot='+lot)[2]);self.assertEqual(result['state'],expected);self.assertIsNone(result.get('current'))
        self.assertEqual(json.loads(self.request('GET','/api/lots?product=vitamin-d3-k2&lot=DEMO-UNPUBLISHED')[2])['availability'],'under_review')
        self.assertEqual(self.request('GET','/api/lots?product=vitamin-d3-k2&lot=DEMO-OUTAGE')[0],503)
        self.assertEqual(self.request('GET','/api/lots?product=vitamin-d3-k2&lot=%20%20')[0],400)
        self.assertEqual(self.request('GET','/api/reports?product=vitamin-d3-k2&lot=DEMO-03-01')[0],404)
        self.assertEqual(json.loads(self.request('GET','/api/lots/archive?product=vitamin-d3-k2')[2])['total'],2)
        self.assertEqual(self.request('GET','/api/lots/documents/DOC-0000000000000000')[0],404)
    def test_lot_document_upload_is_admin_only_and_private_until_published(self):
        pdf=b'%PDF-1.4\n%%EOF\n'
        status,_,_=self.request('POST','/api/admin-lot-document?report=LR-X&title=CoA&kind=original',headers={'Content-Type':'application/pdf'});self.assertIn(status,(400,403))
        self.assertEqual(self.request('POST','/api/demo/login',{'identity':'admin-a'})[0],200)
        d=json.loads(self.request('POST','/api/admin/lot_draft',{'product':'omega-3-fish-oil','lot':'DEMO-04-02'})[2])
        conn=http.client.HTTPConnection('127.0.0.1',self.port)
        conn.request('POST','/api/admin-lot-document?report='+d['id']+'&title=Certificate&kind=original',b'GIF89a not a pdf',{'Cookie':self.cookie,'X-CSRF-Token':self.csrf,'Content-Type':'application/pdf'});r=conn.getresponse();r.read();conn.close();self.assertEqual(r.status,415)
        conn=http.client.HTTPConnection('127.0.0.1',self.port)
        conn.request('POST','/api/admin-lot-document?report='+d['id']+'&title=Certificate&kind=original',pdf,{'Cookie':self.cookie,'X-CSRF-Token':self.csrf,'Content-Type':'application/pdf'});r=conn.getresponse();doc=json.loads(r.read());conn.close()
        status,headers,body=self.request('GET','/api/lots/documents/'+doc['id'])
        self.assertEqual((status,headers['Content-Type']),(200,'application/pdf'));self.assertIn('sandbox',headers['Content-Security-Policy'])
        self.request('POST','/api/logout',{});self.setUp()
        self.assertEqual(self.request('GET','/api/lots/documents/'+doc['id'])[0],404)
