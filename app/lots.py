"""Versioned product-and-lot reports managed by the single admin.

Drafts accept PDF and image evidence stored outside the web root. The admin
chooses public sections and publishes directly. Replacements retain the prior
published version and explain corrections; withdrawals retain their reason.
Files become public only with a published version. Seeded DEMO lots are
explicitly labelled demonstrations, never evidence of real testing.
"""
import hashlib
import json
import os
import re
import secrets
import time

PDF_MAX = 15 * 1024 * 1024
LOT_MAX = 40
# Lot-number handling. The manufacturer's lot-code format has not been supplied, so only changes that cannot alter a
# meaningful character are applied: surrounding whitespace is ignored and letters are compared case-insensitively.
# Nothing else (hyphens, spaces inside the code, O/0, I/1) is altered, and the response says what was searched for.
LOT_RULES = {'trim': True, 'case_insensitive': True, 'allowed': r'[\x21-\x7e ]{1,%d}' % LOT_MAX}
DATE = re.compile(r'\d{4}-\d{2}(-\d{2})?')
SAMPLE_TYPES = {'finished_product': 'Finished product', 'raw_material': 'Raw ingredient', 'other': 'Other specified material'}
ASSESSMENTS = ('meets', 'does_not_meet', 'not_assessed')
NOTICE_KINDS = {'restriction': 'Release restriction', 'withdrawal': 'Batch withdrawal', 'instruction': 'Instruction for this batch'}
PUBLIC_STATES = ('published', 'superseded', 'withdrawn')
DEMO_SPECIAL = ('DEMO-UNPUBLISHED', 'DEMO-WITHDRAWN', 'DEMO-NOTICE', 'DEMO-SUPERSEDED', 'DEMO-OUTAGE')
LOT_TOPIC = re.compile(r'/reports/[a-z0-9-]{1,60}/[A-Za-z0-9._~%-]{1,120}')


class LotError(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status


SCHEMA = '''
CREATE TABLE IF NOT EXISTS lot_reports(id TEXT PRIMARY KEY, product TEXT, lot TEXT, version INTEGER, state TEXT, data TEXT,
  created_by TEXT, submitted_by TEXT, approved_by TEXT, created INTEGER, updated INTEGER, published INTEGER,
  superseded_by TEXT, superseded INTEGER, withdrawn INTEGER, withdrawn_reason TEXT, review_note TEXT);
CREATE TABLE IF NOT EXISTS lot_documents(id TEXT PRIMARY KEY, report_id TEXT, title TEXT, kind TEXT, redacted INTEGER,
  redaction_note TEXT, sha256 TEXT, bytes INTEGER, created INTEGER, created_by TEXT);
CREATE TABLE IF NOT EXISTS lot_notices(id TEXT PRIMARY KEY, product TEXT, lot TEXT, kind TEXT, title TEXT, body TEXT,
  state TEXT, created_by TEXT, approved_by TEXT, created INTEGER, activated INTEGER, retired INTEGER, retired_reason TEXT);
'''


def _s(v, n=300):
    return str(v if v is not None else '').strip()[:n]


def _date(v, label):
    v = _s(v, 10)
    if v and not DATE.fullmatch(v):
        raise LotError(label + ' must be a date like 2026-10-23 (or 2026-10 for a month).')
    return v or None


def _url(v, label):
    v = _s(v, 300)
    if v and not re.fullmatch(r'https://[^\s<>"]{4,290}', v):
        raise LotError(label + ' must be an https:// link.')
    return v or None


def clean_lot(raw):
    """Return (entered, searched) or raise. Never alters a meaningful character."""
    entered = str(raw or '')
    lot = entered.strip() if LOT_RULES['trim'] else entered
    if not lot:
        raise LotError('Enter the lot number printed on your pack.')
    if not re.fullmatch(LOT_RULES['allowed'], lot):
        raise LotError('That lot number has characters we can’t search for. Check it against the pack and try again.')
    return entered, (lot.upper() if LOT_RULES['case_insensitive'] else lot)


def validate_record(data):
    """Validate a transcription. Results keep the laboratory's wording: the reported value is text, never a number."""
    if not isinstance(data, dict):
        raise LotError('Invalid record.')
    out = {}
    out['title'] = _s(data.get('title'),160) or None
    presentation = data.get('presentation')
    if presentation is None:
        presentation = {'show_summary':True,'show_results':bool(data.get('results')),'show_lab':bool((data.get('lab') or {}).get('name')),'show_dates':bool((data.get('dates') or {}).get('issued')),'show_documents':True}
    if not isinstance(presentation,dict) or any(type(v)!=bool for v in presentation.values()):raise LotError('Choose valid report display options.')
    out['presentation']={k:presentation.get(k,False) for k in ('show_summary','show_results','show_lab','show_dates','show_documents')}
    out['formulation_version'] = _s(data.get('formulation_version'), 80) or None
    out['manufactured'] = _date(data.get('manufactured'), 'Manufacturing date')
    out['expiry'] = _date(data.get('expiry'), 'Expiry date')
    out['lab_report_no'] = _s(data.get('lab_report_no'), 80) or None
    out['lab_sample_ref'] = _s(data.get('lab_sample_ref'), 80) or None
    sample = data.get('sample') or {}
    stype = _s(sample.get('type'), 30)
    if stype and stype not in SAMPLE_TYPES:
        raise LotError('Choose the material that was tested.')
    out['sample'] = {'type': stype or None, 'description': _s(sample.get('description'), 300) or None}
    dates = data.get('dates') or {}
    out['dates'] = {k: _date(dates.get(k), label) for k, label in [('sampled', 'Sampling date'), ('received', 'Receipt date'), ('tested_from', 'Testing start date'), ('tested_to', 'Testing end date'), ('issued', 'Report issue date')]}
    d = out['dates']
    if d['tested_from'] and d['tested_to'] and d['tested_to'] < d['tested_from']:
        raise LotError('Testing end date is before the start date.')
    if d['issued'] and d['sampled'] and d['issued'] < d['sampled']:
        raise LotError('Report issue date is before the sampling date.')
    lab = data.get('lab') or {}
    acc = lab.get('accreditation') or {}
    out['lab'] = {
        'name': _s(lab.get('name'), 160) or None,
        'address': _s(lab.get('address'), 300) or None,
        'accreditation': {
            'body': _s(acc.get('body'), 160) or None, 'certificate': _s(acc.get('certificate'), 80) or None,
            'scope': _s(acc.get('scope'), 600) or None, 'valid_from': _date(acc.get('valid_from'), 'Accreditation valid-from date'),
            'valid_to': _date(acc.get('valid_to'), 'Accreditation valid-to date'), 'verify_url': _url(acc.get('verify_url'), 'Verification link'),
            'covers': _s(acc.get('covers'), 30) or None,
        },
    }
    a = out['lab']['accreditation']
    if a['certificate'] and not a['body']:
        raise LotError('Name the accreditation body for the certificate.')
    if a['covers'] and a['covers'] not in ('all', 'some', 'none', 'unknown'):
        raise LotError('Say whether the accreditation scope covers the reported tests.')
    out['commissioned_by'] = _s(data.get('commissioned_by'), 160) or None
    out['summary'] = _s(data.get('summary'), 1500) or None
    out['lab_notes'] = _s(data.get('lab_notes'), 1500) or None
    out['change_note'] = _s(data.get('change_note'), 600) or None
    out['partial'] = _s(data.get('partial'), 600) or None
    rows = data.get('results') or []
    if not isinstance(rows, list) or len(rows) > 120:
        raise LotError('Too many result rows.')
    results = []
    for i, r in enumerate(rows):
        if not isinstance(r, dict):
            raise LotError('Invalid result row.')
        row = {k: _s(r.get(k), n) or None for k, n in [('parameter', 160), ('result', 80), ('unit', 40), ('spec', 120), ('spec_source', 160), ('method', 160), ('ref', 80), ('note', 300), ('group', 80)]}
        if not any(row.values()):
            continue
        if not row['parameter'] or not row['result']:
            raise LotError('Row %d needs both a test and the result as reported.' % (i + 1))
        assess = _s(r.get('assessment'), 20) or 'not_assessed'
        if assess not in ASSESSMENTS:
            raise LotError('Row %d has an unknown assessment.' % (i + 1))
        if assess != 'not_assessed' and not (row['spec'] and row['spec_source']):
            raise LotError('Row %d: an assessment needs the specification and where that specification comes from.' % (i + 1))
        row['assessment'] = assess
        results.append(row)
    out['results'] = results
    return out


def assessment_summary(results):
    n = len(results)
    meets = sum(1 for r in results if r['assessment'] == 'meets')
    fails = sum(1 for r in results if r['assessment'] == 'does_not_meet')
    open_ = n - meets - fails
    if not n:
        overall = 'none'
    elif fails:
        overall = 'does_not_meet'
    elif open_ == 0:
        overall = 'meets'
    elif meets:
        overall = 'partly_assessed'
    else:
        overall = 'not_assessed'
    return {'overall': overall, 'total': n, 'meets': meets, 'does_not_meet': fails, 'not_assessed': open_}


def is_pdf(raw):
    return raw[:5] == b'%PDF-' and b'%%EOF' in raw[-2048:]


class LotsMixin:
    """Mixed into Store. Uses self.db(), self.log(), self.require(), self.product_ids() and self.lot_dir."""

    def lots_init(self, c):
        c.executescript(SCHEMA)

    # ---------------- public ----------------
    def lot_public_version(self, c, r, privileged=False):
        d = json.loads(r['data'] or '{}')
        docs = [dict(x) for x in c.execute('SELECT id,title,kind,redacted,redaction_note,sha256,bytes,created FROM lot_documents WHERE report_id=? ORDER BY created', (r['id'],))]
        show_docs = privileged or r['state'] in ('published', 'superseded')
        return {
            'id': r['id'], 'version': r['version'], 'state': r['state'], 'published': r['published'], 'updated': r['updated'],
            'superseded': r['superseded'], 'withdrawn': r['withdrawn'], 'withdrawn_reason': r['withdrawn_reason'],
            'record': d if r['state'] in ('published', 'superseded') or privileged else None,
            'assessment': assessment_summary(d.get('results') or []) if r['state'] in ('published', 'superseded') or privileged else None,
            'documents': docs if show_docs else [],
        }

    def lots_lookup(self, product, raw_lot):
        if product not in self.product_ids():
            raise LotError('Choose a product.')
        entered, lot = clean_lot(raw_lot)
        if lot == 'DEMO-OUTAGE':
            raise LotError('The lot service didn’t respond (sample outage). Your entry is kept: try again in a moment.', 503)
        base = {'entered': entered, 'searched': lot, 'changed': entered != lot, 'product': product, 'lot': lot,
                'url': '/reports/' + product + '/' + lot, 'demo': lot.startswith('DEMO-')}
        if lot in DEMO_SPECIAL:
            return {**base, **self.lots_demo(product, lot)}
        with self.db() as c:
            batch = c.execute('SELECT id,product FROM batches WHERE UPPER(id)=?', (lot,)).fetchone()
            versions = c.execute('SELECT * FROM lot_reports WHERE UPPER(lot)=? ORDER BY version DESC', (lot,)).fetchall()
            owners = {r['product'] for r in versions} | ({batch['product']} if batch else set())
            if not owners:
                return {**base, 'state': 'not_found'}
            if product not in owners:
                return {**base, 'state': 'other_product', 'other_products': sorted(owners)}
            mine = [r for r in versions if r['product'] == product]
            public = [self.lot_public_version(c, r) for r in mine if r['state'] in PUBLIC_STATES]
            current = next((v for v in public if v['state'] == 'published'), None)
            pending = any(r['state'] in ('draft', 'in_review') for r in mine)
            if current:
                availability = 'published'
            elif public and public[0]['state'] == 'withdrawn':
                availability = 'withdrawn'
            elif pending:
                availability = 'under_review'
            else:
                availability = 'unavailable'
            notices = [dict(n) for n in c.execute("SELECT id,kind,title,body,activated FROM lot_notices WHERE product=? AND UPPER(lot)=? AND state='active' ORDER BY activated DESC", (product, lot))]
            for n in notices:
                n['kind_label'] = NOTICE_KINDS.get(n['kind'], n['kind'])
        return {**base, 'state': 'match', 'availability': availability, 'partial': bool(current and current['record'] and current['record'].get('partial')),
                'current': current, 'history': [{k: v[k] for k in ('id', 'version', 'state', 'published', 'superseded', 'withdrawn', 'withdrawn_reason')} | {'change_note': (v['record'] or {}).get('change_note')} for v in public],
                'notices': notices, 'lab_document_connected': bool(current and current['documents'])}

    def lots_demo(self, product, lot):
        """Clearly labelled demonstration states. No laboratory, result, date or file is invented."""
        out = {'state': 'match', 'demo': True, 'partial': False, 'current': None, 'history': [], 'notices': [], 'lab_document_connected': False}
        if lot == 'DEMO-UNPUBLISHED':
            out['availability'] = 'under_review'
        elif lot in ('DEMO-WITHDRAWN', 'DEMO-NOTICE'):
            out['availability'] = 'unavailable'
            out['notices'] = [{'id': 'DEMO-NOTICE', 'kind': 'withdrawal', 'kind_label': 'Batch withdrawal · demonstration',
                               'title': 'Demonstration: how a confirmed batch notice appears',
                               'body': 'This is not a real notice. If a batch were withdrawn, the approved instructions would appear here, with a direct route to Product safety support.',
                               'activated': None}]
        elif lot == 'DEMO-SUPERSEDED':
            out['availability'] = 'unavailable'
            out['history'] = [
                {'id': 'DEMO-V2', 'version': 2, 'state': 'demo', 'published': None, 'superseded': None, 'withdrawn': None, 'withdrawn_reason': None,
                 'change_note': 'Demonstration: version 2 would replace version 1 and say why, for example a corrected transcription.'},
                {'id': 'DEMO-V1', 'version': 1, 'state': 'superseded', 'published': None, 'superseded': None, 'withdrawn': None, 'withdrawn_reason': None,
                 'change_note': 'Demonstration: a superseded version stays listed. Replacing a document does not by itself mean the batch was withdrawn.'},
            ]
        return out

    def lots_archive(self, product='', q=''):
        q = _s(q, 40).upper()
        if product and product not in self.product_ids():
            raise LotError('Choose a product.')
        items = {}
        with self.db() as c:
            for r in c.execute("SELECT * FROM lot_reports WHERE state IN ('published','superseded','withdrawn') ORDER BY version DESC"):
                key = (r['product'], r['lot'].upper())
                if key in items:
                    continue
                if r['state'] == 'superseded':
                    cur = c.execute("SELECT 1 FROM lot_reports WHERE product=? AND UPPER(lot)=? AND state='published'", key).fetchone()
                    if cur:
                        continue
                d = json.loads(r['data'] or '{}')
                items[key] = {'product': r['product'], 'lot': r['lot'], 'availability': 'published' if r['state'] == 'published' else r['state'],
                              'version': r['version'], 'published': r['published'], 'withdrawn': r['withdrawn'],
                              'manufactured': d.get('manufactured'), 'expiry': d.get('expiry'), 'demo': r['lot'].upper().startswith('DEMO-'),
                              'notice': bool(c.execute("SELECT 1 FROM lot_notices WHERE product=? AND UPPER(lot)=? AND state='active'", key).fetchone())}
            for b in c.execute("SELECT id,product FROM batches WHERE id LIKE 'DEMO-%' ORDER BY id"):
                key = (b['product'], b['id'].upper())
                if key not in items:
                    items[key] = {'product': b['product'], 'lot': b['id'], 'availability': 'unavailable', 'version': None, 'published': None,
                                  'withdrawn': None, 'manufactured': None, 'expiry': None, 'demo': True, 'notice': False}
        order = {p: i for i, p in enumerate(self.product_ids())}
        rows = [v for v in items.values() if (not product or v['product'] == product) and (not q or q in v['lot'].upper())]
        rows.sort(key=lambda v: (order.get(v['product'], 99), v['demo'], -(v['published'] or 0), v['lot']))
        return {'items': rows, 'total': len(rows)}

    def lots_document(self, s, did, privileged):
        with self.db() as c:
            d = c.execute('SELECT d.*, r.state AS rstate FROM lot_documents d JOIN lot_reports r ON r.id=d.report_id WHERE d.id=?', (did,)).fetchone()
        if not d or not (privileged or d['rstate'] in ('published', 'superseded')):
            raise LotError('Document not found.', 404)
        path = self.lot_dir / (d['id'] + '.pdf')
        if not path.is_file():
            raise LotError('Document not found.', 404)
        raw = path.read_bytes()
        if hashlib.sha256(raw).hexdigest() != d['sha256']:
            raise LotError('This document failed its integrity check and is not being served.', 409)
        return raw, d

    # ---------------- operations ----------------
    def lot_admin(self, c, s, action, data):
        if action == 'lot_draft':
            product = _s(data.get('product'), 60)
            lot = _s(data.get('lot'), LOT_MAX)
            batch = c.execute('SELECT * FROM batches WHERE id=?', (lot,)).fetchone()
            if not batch:
                raise LotError('Lot not found in the batch register.', 404)
            if batch['product'] != product:
                raise LotError('That lot belongs to a different product in the batch register.', 409)
            if c.execute("SELECT 1 FROM lot_reports WHERE product=? AND lot=? AND state IN ('draft','in_review')", (product, lot)).fetchone():
                raise LotError('A version for this lot is already in progress.', 409)
            prev = c.execute("SELECT * FROM lot_reports WHERE product=? AND lot=? ORDER BY version DESC LIMIT 1", (product, lot)).fetchone()
            version = (prev['version'] + 1) if prev else 1
            data_copy = json.loads(prev['data']) if prev and prev['state'] in ('published', 'superseded') else {}
            data_copy.pop('change_note', None)
            rid = 'LR-' + secrets.token_hex(5).upper()
            now = int(time.time())
            c.execute('INSERT INTO lot_reports(id,product,lot,version,state,data,created_by,created,updated) VALUES(?,?,?,?,?,?,?,?,?)',
                      (rid, product, lot, version, 'draft', json.dumps(data_copy), s['user_id'], now, now))
            self.log(c, s['user_id'], 'lot_report_drafted', rid)
            return {'id': rid, 'version': version}
        r = None
        if action in ('lot_update', 'lot_discard', 'lot_document_remove'):
            target = data.get('report') if action == 'lot_document_remove' else data.get('id')
            r = c.execute('SELECT * FROM lot_reports WHERE id=?', (target,)).fetchone()
            if not r:
                raise LotError('Report version not found.', 404)
        if action == 'lot_update':
            if r['state'] != 'draft':
                raise LotError('Only a draft can be edited. Start a new version to correct a published report.', 409)
            rec = validate_record(data.get('record') or {})
            c.execute('UPDATE lot_reports SET data=?,updated=? WHERE id=?', (json.dumps(rec), int(time.time()), r['id']))
            self.log(c, s['user_id'], 'lot_report_edited', r['id'])
            return {'ok': True}
        if action == 'lot_document_remove':
            if r['state'] != 'draft':
                raise LotError('Documents can only be removed from a draft.', 409)
            d = c.execute('SELECT * FROM lot_documents WHERE id=? AND report_id=?', (data.get('id'), r['id'])).fetchone()
            if not d:
                raise LotError('Document not found.', 404)
            c.execute('DELETE FROM lot_documents WHERE id=?', (d['id'],))
            meta=c.execute('SELECT ext FROM lot_document_meta WHERE document=?',(d['id'],)).fetchone()
            (self.lot_dir / (d['id'] + (meta['ext'] if meta else '.pdf'))).unlink(missing_ok=True)
            c.execute('DELETE FROM lot_document_meta WHERE document=?',(d['id'],))
            self.log(c, s['user_id'], 'lot_document_removed', d['id'])
            return {'ok': True}
        if action == 'lot_discard':
            if r['state'] != 'draft':
                raise LotError('Only a draft can be discarded.', 409)
            for d in c.execute('SELECT id FROM lot_documents WHERE report_id=?', (r['id'],)).fetchall():
                meta=c.execute('SELECT ext FROM lot_document_meta WHERE document=?',(d['id'],)).fetchone()
                (self.lot_dir / (d['id'] + (meta['ext'] if meta else '.pdf'))).unlink(missing_ok=True)
                c.execute('DELETE FROM lot_document_meta WHERE document=?',(d['id'],))
            c.execute('DELETE FROM lot_documents WHERE report_id=?', (r['id'],))
            c.execute('DELETE FROM lot_reports WHERE id=?', (r['id'],))
            self.log(c, s['user_id'], 'lot_report_discarded', r['id'])
            return {'ok': True}
        raise LotError('Unknown operation.', 404)

    def lot_upload(self, s, rid, raw, title, kind, redacted, note):
        self.require(s, 'admin')
        if not is_pdf(raw):
            raise LotError('Upload the laboratory document as a PDF.', 415)
        if len(raw) > PDF_MAX:
            raise LotError('The PDF must be 15 MB or smaller.', 413)
        title = _s(title, 160)
        if len(title) < 3:
            raise LotError('Give the document a title, for example “Certificate of analysis”.')
        kind = kind if kind in ('original', 'redacted_copy', 'amendment') else ''
        if not kind:
            raise LotError('Say whether this is the original document, an authorised redacted copy or an amendment.')
        redacted = kind == 'redacted_copy' or bool(redacted)
        note = _s(note, 400)
        if redacted and len(note) < 10:
            raise LotError('Describe what was redacted and why.')
        did = 'DOC-' + secrets.token_hex(8)
        with self.db() as c:
            r = c.execute('SELECT * FROM lot_reports WHERE id=?', (rid,)).fetchone()
            if not r:
                raise LotError('Report version not found.', 404)
            if r['state'] != 'draft':
                raise LotError('Documents can only be added to a draft version.', 409)
            if c.execute('SELECT COUNT(*) FROM lot_documents WHERE report_id=?', (rid,)).fetchone()[0] >= 6:
                raise LotError('A version holds at most six documents.', 409)
            path = self.lot_dir / (did + '.pdf')
            fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            with os.fdopen(fd, 'wb') as f:
                f.write(raw)
            digest = hashlib.sha256(raw).hexdigest()
            c.execute('INSERT INTO lot_documents VALUES(?,?,?,?,?,?,?,?,?,?)', (did, rid, title, kind, int(redacted), note or None, digest, len(raw), int(time.time()), s['user_id']))
            self.log(c, s['user_id'], 'lot_document_uploaded', did)
        return {'id': did, 'sha256': digest, 'bytes': len(raw)}

    def lot_snapshot(self, c):
        reports = []
        for r in c.execute('SELECT * FROM lot_reports ORDER BY product, lot, version DESC'):
            d = dict(r)
            d['record'] = json.loads(d.pop('data') or '{}')
            d['documents'] = [dict(x) for x in c.execute('SELECT * FROM lot_documents WHERE report_id=? ORDER BY created', (r['id'],))]
            reports.append(d)
        notices = [dict(n) for n in c.execute('SELECT * FROM lot_notices ORDER BY created DESC')]
        return {'lot_reports': reports, 'lot_notices': notices, 'lot_rules': {'trim': True, 'case_insensitive': True, 'max': LOT_MAX}}
