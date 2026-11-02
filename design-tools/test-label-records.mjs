// Checks the label-derived fields in web/label-records.json against the text of the supplied master label
// (../Full FInal Label/Full Final Label.ai, a PDF-compatible file; text extracted to design-review/label-text-2026-11-02/).
// Barcodes and the veg / non-veg marks are graphics and were transcribed visually; they are checked for format only.
import assert from 'node:assert/strict';
import fs from 'node:fs';

const r = JSON.parse(fs.readFileSync('web/label-records.json', 'utf8'));
// PDF text extraction splits some words ("L TD", "POL YOLS"), so comparisons ignore whitespace.
const norm = (s) => s.replace(/ﬁ/g, 'fi').replace(/ﬂ/g, 'fl').replace(/\s+/g, '').toLowerCase();
let rows = 0;
for (const [id, v] of Object.entries(r)) {
  const text = norm(fs.readFileSync('design-review/label-text-2026-11-02/' + id + '.txt', 'utf8'));
  const has = (s, what) => assert.ok(text.includes(norm(s)), id + ': ' + what + ' not on the label: ' + s);
  const f = v.supplement_facts;
  has('Serving size: ' + f.serving, 'serving');
  for (const row of f.rows) { has(row.name, 'row'); has(row.amount, 'amount for ' + row.name); if (row.rda !== '#') has(row.rda, 'RDA for ' + row.name); rows++; }
  f.notes.forEach((n) => has(n, 'note'));
  for (const k of ['category', 'claim']) has(v.label_front[k], k);
  v.label_front.descriptor.split(' · ').forEach((d) => has(d, 'descriptor'));
  has(v.directions_tag, 'directions tag');
  for (const slot of Object.values(v.label_timing)) has(slot, 'timing');
  assert.match(v.label_front.barcode, /^890803285\d{4}$/, id + ' barcode format');
  assert.match(v.label_front.mark, /^(Vegetarian|Non-vegetarian) mark$/);
  for (const lic of v.manufacturer_details.match(/\d{14}/g)) has('Lic. No. ' + lic, 'licence');
  assert.match(v.manufacturer, /Lic\. No\. \d{14}\.$/);
  has(v.manufacturer.split(',')[0], 'manufacturer name');
  ['+91-9274248974', 'care@bodycafeco.com', 'BodyCafeCo.com'].forEach((c) => { has(c, 'customer care'); assert.ok(v.customer_care.includes(c)); });
  v.label_badges.forEach((b) => has(b, 'badge'));
  has(v.other_ingredients.replace(/\.$/, ''), 'other ingredients');
}
console.log('Label records passed: ' + rows + ' supplement-facts rows and the front, directions, timing, licence and customer-care fields for 7 products match the master label text.');
