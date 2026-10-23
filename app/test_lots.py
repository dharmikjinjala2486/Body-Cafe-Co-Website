"""Lot reports: lookup states, transcription rules, two-person publication, versions, notices and documents."""
import json
from pathlib import Path
import tempfile
import unittest
from app.server import Store, Error
from app import lots
from app.lots import LotError

PDF = b'%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n'


def record(**over):
    r = {
        'formulation_version': 'QA fixture formulation v1', 'manufactured': '2026-05', 'expiry': '2028-04',
        'lab_report_no': 'QA-REPORT-001', 'lab_sample_ref': 'QA-SAMPLE-01',
        'sample': {'type': 'finished_product', 'description': 'QA fixture sample'},
        'dates': {'sampled': '2026-06-01', 'tested_from': '2026-06-03', 'tested_to': '2026-06-09', 'issued': '2026-06-12'},
        'lab': {'name': 'QA Fixture Laboratory', 'accreditation': {'body': 'QA Accreditation Body', 'certificate': 'QA-CERT-1', 'scope': 'QA scope', 'covers': 'some', 'verify_url': 'https://example.org/verify'}},
        'commissioned_by': 'QA fixture', 'summary': 'QA fixture summary.',
        'results': [
            {'parameter': 'Lead (Pb)', 'result': '<0.05', 'unit': 'mg/kg', 'spec': '≤ 1.0 mg/kg', 'spec_source': 'QA spec v1', 'method': 'QA method', 'assessment': 'meets', 'ref': 'p. 2'},
            {'parameter': 'Appearance', 'result': 'Conforms', 'assessment': 'not_assessed'},
            {'parameter': 'Assay', 'result': '95.1–98.0', 'unit': '%', 'note': 'Range as reported'},
        ],
    }
    r.update(over)
    return r


class LotTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.store = Store(Path(self.temp.name) / 'lots.db')
        self.a = self.store.session('')[0]; self.store.login(self.a, {'identity': 'admin-a'}); self.a = self.store.session(self.a['id'])[0]
        self.b = self.store.session('')[0]; self.store.login(self.b, {'identity': 'admin-b'}); self.b = self.store.session(self.b['id'])[0]
        self.customer = self.store.session('')[0]

    def tearDown(self):
        self.temp.cleanup()

    def publish(self, lot='DEMO-01-02', product='iron-bisglycinate', rec=None):
        d = self.store.admin(self.a, 'lot_draft', {'product': product, 'lot': lot})
        self.store.admin(self.a, 'lot_update', {'id': d['id'], 'record': rec or record()})
        doc = self.store.lot_upload(self.a, d['id'], PDF, 'Certificate of analysis', 'original', False, '')
        apr = self.store.admin(self.a, 'lot_submit', {'id': d['id']})
        self.store.admin(self.b, 'approve', {'id': apr['id'], 'decision': 'approve'})
        return d['id'], doc['id']

    def test_lookup_states_are_exact(self):
        self.assertEqual(self.store.lots_lookup('iron-bisglycinate', 'DEMO-01-01')['state'], 'match')
        r = self.store.lots_lookup('iron-bisglycinate', '  demo-01-01 ')
        self.assertEqual((r['state'], r['searched'], r['changed']), ('match', 'DEMO-01-01', True))
        self.assertEqual(self.store.lots_lookup('iron-bisglycinate', 'DEMO-01-0l')['state'], 'not_found')
        self.assertEqual(self.store.lots_lookup('iron-bisglycinate', 'DEMO 01 01')['state'], 'not_found')
        self.assertEqual(self.store.lots_lookup('iron-bisglycinate', 'DEMO-01-0')['state'], 'not_found')
        other = self.store.lots_lookup('vitamin-d3-k2', 'DEMO-01-01')
        self.assertEqual((other['state'], other['other_products']), ('other_product', ['iron-bisglycinate']))
        with self.assertRaises(LotError): self.store.lots_lookup('iron-bisglycinate', '   ')
        with self.assertRaises(LotError): self.store.lots_lookup('nope', 'DEMO-01-01')
        with self.assertRaises(LotError) as e: self.store.lots_lookup('iron-bisglycinate', 'DEMO-OUTAGE')
        self.assertEqual(e.exception.status, 503)

    def test_demo_records_carry_no_evidence(self):
        for lot in ['DEMO-01-01', 'DEMO-UNPUBLISHED', 'DEMO-NOTICE', 'DEMO-SUPERSEDED']:
            r = self.store.lots_lookup('iron-bisglycinate', lot)
            self.assertTrue(r['demo']); self.assertIsNone(r['current']); self.assertFalse(r['lab_document_connected'])
        self.assertEqual(self.store.lots_lookup('iron-bisglycinate', 'DEMO-01-01')['availability'], 'unavailable')
        self.assertEqual(self.store.lots_lookup('iron-bisglycinate', 'DEMO-UNPUBLISHED')['availability'], 'under_review')
        n = self.store.lots_lookup('iron-bisglycinate', 'DEMO-NOTICE')
        self.assertEqual(n['availability'], 'unavailable'); self.assertIn('demonstration', n['notices'][0]['kind_label'])

    def test_quarantine_is_not_a_public_withdrawal(self):
        self.store.admin(self.a, 'quarantine', {'batch': 'DEMO-03-01', 'reason': 'Internal investigation'})
        r = self.store.lots_lookup('vitamin-d3-k2', 'DEMO-03-01')
        self.assertEqual(r['availability'], 'unavailable'); self.assertEqual(r['notices'], [])

    def test_transcription_rules(self):
        v = lots.validate_record(record())
        self.assertEqual([x['result'] for x in v['results']], ['<0.05', 'Conforms', '95.1–98.0'])
        self.assertEqual(lots.assessment_summary(v['results'])['overall'], 'partly_assessed')
        with self.assertRaises(LotError): lots.validate_record(record(results=[{'parameter': 'Lead', 'result': '<0.05', 'assessment': 'meets'}]))
        with self.assertRaises(LotError): lots.validate_record(record(results=[{'parameter': 'Lead', 'result': '', 'unit': 'mg/kg'}]))
        with self.assertRaises(LotError): lots.validate_record(record(dates={'tested_from': '2026-06-09', 'tested_to': '2026-06-01'}))
        with self.assertRaises(LotError): lots.validate_record(record(lab={'name': 'X', 'accreditation': {'certificate': 'C-1'}}))
        with self.assertRaises(LotError): lots.validate_record(record(lab={'name': 'X', 'accreditation': {'verify_url': 'http://insecure'}}))
        self.assertEqual(lots.assessment_summary([])['overall'], 'none')

    def test_publication_needs_a_second_admin_and_complete_record(self):
        d = self.store.admin(self.a, 'lot_draft', {'product': 'iron-bisglycinate', 'lot': 'DEMO-01-02'})
        with self.assertRaises(LotError): self.store.admin(self.a, 'lot_draft', {'product': 'vitamin-d3-k2', 'lot': 'DEMO-01-01'})
        with self.assertRaises(LotError): self.store.admin(self.a, 'lot_submit', {'id': d['id']})
        self.store.admin(self.a, 'lot_update', {'id': d['id'], 'record': record()})
        with self.assertRaises(LotError) as e: self.store.admin(self.a, 'lot_submit', {'id': d['id']})
        self.assertIn('source document', str(e.exception))
        with self.assertRaises(LotError): self.store.lot_upload(self.a, d['id'], b'not a pdf', 'CoA', 'original', False, '')
        with self.assertRaises(LotError): self.store.lot_upload(self.a, d['id'], PDF, 'CoA', 'redacted_copy', True, '')
        with self.assertRaises(Error): self.store.lot_upload(self.customer, d['id'], PDF, 'CoA', 'original', False, '')
        self.store.lot_upload(self.a, d['id'], PDF, 'Certificate of analysis', 'original', False, '')
        apr = self.store.admin(self.a, 'lot_submit', {'id': d['id']})
        self.assertEqual(self.store.lots_lookup('iron-bisglycinate', 'DEMO-01-02')['availability'], 'under_review')
        with self.assertRaises(Error): self.store.admin(self.a, 'approve', {'id': apr['id'], 'decision': 'approve'})
        self.store.admin(self.b, 'approve', {'id': apr['id'], 'decision': 'approve'})
        r = self.store.lots_lookup('iron-bisglycinate', 'DEMO-01-02')
        self.assertEqual(r['availability'], 'published'); self.assertTrue(r['demo'])
        self.assertEqual(r['current']['record']['results'][0]['result'], '<0.05')
        self.assertEqual(r['current']['assessment']['meets'], 1); self.assertEqual(r['current']['assessment']['not_assessed'], 2)
        self.assertEqual(len(r['current']['documents']), 1)
        audit = [x['action'] for x in self.store.snapshot(self.a)['audit']]
        for a in ['lot_report_drafted', 'lot_document_uploaded', 'lot_report_submitted', 'lot_report_published']: self.assertIn(a, audit)

    def test_rejection_returns_to_draft_and_drafts_stay_private(self):
        d = self.store.admin(self.a, 'lot_draft', {'product': 'iron-bisglycinate', 'lot': 'DEMO-01-02'})
        self.store.admin(self.a, 'lot_update', {'id': d['id'], 'record': record()})
        doc = self.store.lot_upload(self.a, d['id'], PDF, 'Certificate of analysis', 'original', False, '')
        with self.assertRaises(LotError): self.store.lots_document(self.customer, doc['id'], False)
        self.assertEqual(self.store.lots_document(self.a, doc['id'], True)[0], PDF)
        apr = self.store.admin(self.a, 'lot_submit', {'id': d['id']})
        self.store.admin(self.b, 'approve', {'id': apr['id'], 'decision': 'reject'})
        snap = {r['id']: r for r in self.store.snapshot(self.a)['lot_reports']}
        self.assertEqual(snap[d['id']]['state'], 'draft')
        self.assertIsNone(self.store.lots_lookup('iron-bisglycinate', 'DEMO-01-02')['current'])

    def test_new_version_supersedes_and_keeps_history(self):
        v1, doc1 = self.publish()
        d = self.store.admin(self.a, 'lot_draft', {'product': 'iron-bisglycinate', 'lot': 'DEMO-01-02'})
        self.assertEqual(d['version'], 2)
        self.store.lot_upload(self.a, d['id'], PDF + b' ', 'Amended certificate', 'amendment', False, '')
        with self.assertRaises(LotError): self.store.admin(self.a, 'lot_submit', {'id': d['id']})
        self.store.admin(self.a, 'lot_update', {'id': d['id'], 'record': record(change_note='Corrected the unit for one result, as amended by the laboratory.')})
        apr = self.store.admin(self.a, 'lot_submit', {'id': d['id']})
        self.store.admin(self.b, 'approve', {'id': apr['id'], 'decision': 'approve'})
        r = self.store.lots_lookup('iron-bisglycinate', 'DEMO-01-02')
        self.assertEqual(r['current']['version'], 2)
        self.assertEqual([h['state'] for h in r['history']], ['published', 'superseded'])
        self.assertIn('Corrected', r['history'][0]['change_note'])
        self.assertEqual(self.store.lots_document(self.customer, doc1, False)[0], PDF)
        with self.assertRaises(LotError): self.store.admin(self.a, 'lot_update', {'id': v1, 'record': record()})

    def test_withdrawal_and_notices_need_approval_and_stay_distinct(self):
        v1, doc = self.publish()
        with self.assertRaises(LotError): self.store.admin(self.a, 'lot_withdraw_request', {'id': v1, 'reason': 'short'})
        apr = self.store.admin(self.a, 'lot_withdraw_request', {'id': v1, 'reason': 'The laboratory withdrew this certificate.'})
        self.assertEqual(self.store.lots_lookup('iron-bisglycinate', 'DEMO-01-02')['availability'], 'published')
        self.store.admin(self.b, 'approve', {'id': apr['id'], 'decision': 'approve'})
        r = self.store.lots_lookup('iron-bisglycinate', 'DEMO-01-02')
        self.assertEqual(r['availability'], 'withdrawn'); self.assertEqual(r['notices'], [])
        self.assertIn('withdrew', r['history'][0]['withdrawn_reason'])
        with self.assertRaises(LotError): self.store.lots_document(self.customer, doc, False)
        n = self.store.admin(self.a, 'lot_notice_request', {'product': 'iron-bisglycinate', 'lot': 'DEMO-01-02', 'kind': 'restriction', 'title': 'Do not use this batch', 'body': 'Stop using packs from this lot and contact Product safety support.'})
        self.assertEqual(self.store.lots_lookup('iron-bisglycinate', 'DEMO-01-02')['notices'], [])
        self.store.admin(self.b, 'approve', {'id': n['id'], 'decision': 'approve'})
        self.assertEqual(self.store.lots_lookup('iron-bisglycinate', 'DEMO-01-02')['notices'][0]['kind'], 'restriction')
        with self.assertRaises(LotError): self.store.admin(self.a, 'lot_notice_request', {'product': 'vitamin-d3-k2', 'lot': 'DEMO-01-02', 'kind': 'restriction', 'title': 'Wrong product', 'body': 'This should fail because the lot belongs to another product.'})

    def test_archive_lists_published_and_demo_lots(self):
        self.publish()
        a = self.store.lots_archive('iron-bisglycinate', '')
        self.assertEqual(a['items'][0]['availability'], 'published')
        self.assertTrue(all(i['product'] == 'iron-bisglycinate' for i in a['items']))
        self.assertEqual(len(self.store.lots_archive('', 'DEMO-01-0')['items']), 2)
        self.assertEqual(self.store.lots_archive('', 'NOPE')['total'], 0)

    def test_lot_cases_keep_product_and_lot(self):
        c = self.store.case(self.customer, {'kind': 'report', 'topic': '/reports/iron-bisglycinate/DEMO-01-01', 'lot': 'DEMO-01-01', 'message': 'I cannot find the report for my pack.'})
        self.assertEqual(c['topic'], '/reports/iron-bisglycinate/DEMO-01-01'); self.assertEqual(c['lot'], 'DEMO-01-01')
        self.assertIn('Lot report question', c['subject'])
        with self.assertRaises(Error): self.store.case(self.customer, {'kind': 'report', 'topic': '/reports/../admin', 'message': 'Invalid page reference here.'})
        with self.assertRaises(Error): self.store.case(self.customer, {'kind': 'report', 'media': ['IMG-0000000000000000'], 'message': 'Photo that was never uploaded.'})


if __name__ == '__main__':
    unittest.main()
