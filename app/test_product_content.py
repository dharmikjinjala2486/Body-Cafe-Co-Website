"""The seven-product admin editor persists E copy and structured pack fields."""
import copy
import json
import tempfile
import unittest
from pathlib import Path
from app.server import Store, Error
from app.product_content import TEXT_FIELDS

class ProductContentTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'store.db')
        self.admin={'role':'admin','user_id':'store-owner','name':'Admin'}
    def tearDown(self): self.tmp.cleanup()
    def product(self):
        p=self.store.products()[0]
        p.update({k:'Editable '+k for k in TEXT_FIELDS})
        p.update({'gallery':[{'src':'/web/media/iron-bisglycinate.webp','alt':'Iron bottle','visible':True}],
          'home_highlight':'29 mg iron', 'label_front':{'category':'Health Supplement','descriptor':'Chelated iron','claim':'Pack claim','mark':'Vegetarian','barcode':'8908032859035'},
          'label_timing':{'morning':'Best','noon':'Also fine','night':'Also fine'},'label_badges':['GMP certified'],
          'supplement_facts':{'serving':'1 capsule','rows':[{'name':'Iron','amount':'29 mg','rda':'100%','level':0,'active':True}],'notes':['Women, moderate work.']}})
        return p
    def test_all_e_fields_draft_publish_and_restart(self):
        p=self.product();r=self.store.admin(self.admin,'product_save',{'product':p,'version':0})
        self.assertNotIn('headline',self.store.products()[0])
        self.store.admin(self.admin,'product_publish',{'id':p['id'],'version':r['version'],'remarks':'Reviewed complete E product content.'})
        public=Store(self.store.path).products()[0]
        for k in [*TEXT_FIELDS,'label_front','label_timing','label_badges','supplement_facts']:self.assertEqual(public[k],p[k])
        self.assertEqual(len(self.store.products()),7)
    def test_new_product_is_rejected_without_creating_record(self):
        with self.assertRaises(Error) as err:self.store.admin(self.admin,'product_save',{'product':{**self.product(),'id':'not-an-existing-product'},'version':0})
        self.assertEqual(err.exception.status,403)
        self.assertEqual(len(self.store.products(include_hidden=True)),7)
    def test_invalid_structured_facts_and_long_highlights_are_rejected(self):
        for patch in [{'home_highlight':'This has more than four words'}, {'label_timing':[]},
          {'supplement_facts':{'rows':[{'name':'Iron','amount':''}]}},
          {'supplement_facts':{'rows':[{'name':'Iron','amount':'29 mg','active':'true'}]}}]:
            with self.subTest(patch=patch),self.assertRaises(Error):self.store.admin(self.admin,'product_save',{'product':{**self.product(),**patch},'version':0})
