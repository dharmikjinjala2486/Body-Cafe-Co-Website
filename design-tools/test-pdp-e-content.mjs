// Checks Variant E's product-page additions (web/pdp-e.js) against the owner-selected reference and the final labels.
// Every field matches the reference PRODUCTS exactly, except the documented label corrections (psyllium fibre,
// creatine timing). Label claims and the L-Theanine banner must stay out until the owner decides.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('design-review/story-source-2026-11-02/reference-index.html', 'utf8');
const script = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
const pick = (start, end) => script.slice(script.indexOf(start), script.indexOf(end, script.indexOf(start)));
const ref = {};
vm.runInNewContext(pick('const BRAND', 'const ROUTES') + '\nref.PRODUCTS = JSON.parse(JSON.stringify(PRODUCTS)); ref.product = ' + JSON.stringify(pick('function product', 'function science')) + ';', { ref });

const window = { BCCSite: { themes: { e: {} } }, BCCLivingE: { esc: (s) => s, wrap() {}, onEnhance() {}, frag() {}, cap: () => '', pad: (n) => String(n) }, BCCSuperSevens: {} };
const sandbox = { window };
vm.runInNewContext(fs.readFileSync('web/standards-e.js', 'utf8'), sandbox);
vm.runInNewContext(fs.readFileSync('web/pdp-e.js', 'utf8'), sandbox);
const E = JSON.parse(JSON.stringify(window.BCCPdpE));

// UI labels appear in the reference product() template.
for (const s of ["What's inside", 'Amount', '% RDA', 'When to take it', 'Keep in mind', 'Form', 'Why this form', 'The story', 'How we check it', 'Morning', 'Noon', 'Night', 'Best', 'Also fine', '%RDA as per ICMR 2020 guidelines (men, moderate work). — = %RDA not established.'])
  assert.ok(ref.product.includes(s), 'label not in reference: ' + s);

const FIX = { '1600 mg of dietary fibre': '1,578 mg of dietary fibre', 'dietary fibre 1600 mg; soluble fibre 400 mg': 'dietary fibre 1,578 mg; soluble fibre 1,362 mg', 'including 400 mg of soluble fibre': 'including 1,362 mg of soluble fibre' };
const fixPsyllium = (s) => Object.entries(FIX).reduce((t, [a, b]) => t.split(a).join(b), s);
for (const r of JSON.parse(JSON.stringify(ref.PRODUCTS))) {
  const d = E.P[r.slug];
  assert.ok(d, r.slug);
  assert.equal(d.headline, r.headline, r.slug + ' headline');
  assert.equal(d.keep, r.keep, r.slug + ' keep');
  assert.equal(d.rdaNote, r.rdaNote, r.slug + ' rdaNote');
  assert.equal(d.best, r.best, r.slug + ' best slot');
  const psy = r.slug === 'psyllium-husk';
  for (const k of ['intro', 'trust', 'story']) assert.equal(d[k], psy ? fixPsyllium(r[k]) : r[k], r.slug + ' ' + k);
  const amounts = psy ? [['Psyllium husk (isabgol)', '2000 mg', '—'], ['Dietary fibre', '1,578 mg', '5.26%'], ['Soluble fibre', '1,362 mg', '—'], ['Added sugar', '0 g', '0%']] : r.amounts;
  assert.deepEqual(d.amounts, amounts, r.slug + ' amounts');
}
// Label checks for the corrections.
const labels = JSON.parse(fs.readFileSync('web/label-records.json', 'utf8'));
assert.match(labels['psyllium-husk'].amount_per_serving, /dietary fibre 1,578 mg, including soluble fibre 1,362 mg/);
assert.match(labels['creatine-chews'].nutrition_information, /added sugar 3\.60 g/);
const rendered = JSON.stringify(E.P);
assert.ok(!/1600 mg|400 mg of soluble|soluble fibre 400/.test(rendered), 'reference psyllium fibre values must not appear');
// Claims are shown only from the label records (checked by test-label-records.mjs), never from reference copy; the held banner stays out.
assert.ok(!/Supports |supply being confirmed|shown for review only/.test(rendered), 'no claims or L-Theanine banner in reference-derived copy');
console.log('PDP E content passed: 7 products match the reference (headline, intro, amounts with %RDA, keep, trust, story), psyllium fibre from the final label; claims only from label records, no held banner.');
