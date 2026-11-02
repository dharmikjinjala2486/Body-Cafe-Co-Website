// Checks Variant E's Standards additions (web/standards-e.js) against the owner-selected reference and the final labels:
// every adopted string matches the reference exactly, departures are limited to the documented ADAPTED list,
// and psyllium fibre values match web/label-records.json rather than the reference.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('design-review/story-source-2026-11-02/reference-index.html', 'utf8');
const script = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
const pick = (start, end) => script.slice(script.indexOf(start), script.indexOf(end, script.indexOf(start)));
const ref = {};
vm.runInNewContext([pick('const BRAND', 'const ROUTES'), pick('const esc', 'function glyph'), 'function saucer(){return ""}\nconst doseWord=d=>d;',
  pick('function science', 'let xsel'), pick('function sourcing', 'function contact'),
  'ref.PRODUCTS=PRODUCTS;ref.MAKERS=MAKERS;ref.BRAND=BRAND;ref.science=science();xsel="vitamin-d3-k2";ref.sourcing=sourcing();'].join('\n'), { ref });
const ent = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };
const text = (h) => h.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, (m) => ent[m] ?? m).replace(/\s+/g, ' ');
const refText = text(ref.science) + ' ' + text(ref.sourcing);

const window = { BCCSite: { themes: { e: {} } }, BCCLivingE: { esc: (s) => s, wrap() {}, onEnhance() {}, frag() {}, cap: () => '' }, BCCSuperSevens: {} };
vm.runInNewContext(fs.readFileSync('web/standards-e.js', 'utf8'), { window });
// Values come from separate VM contexts; compare them as plain JSON.
const E = JSON.parse(JSON.stringify(window.BCCStandardsE));

// 1. Page copy appears verbatim in the reference.
const adopted = [E.SCIENCE.eyebrow, E.SCIENCE.title, E.SCIENCE.lede, ...E.SCIENCE.rules.flat(), E.SCIENCE.tableTitle, ...E.SCIENCE.tableHead, E.SCIENCE.cta,
  E.SOURCING.eyebrow, E.SOURCING.title, E.SOURCING.lede, E.SOURCING.explore, ...Object.values(E.SOURCING.labels), E.SOURCING.makersTitle];
for (const s of adopted) assert.ok(refText.includes(s), 'not in reference: ' + s);
assert.equal(E.SOURCING.marketer, `Marketed by ${ref.BRAND.legalEntity}. FSSAI Lic. No. ${ref.BRAND.fssai}.`);
assert.deepEqual(E.MAKERS, JSON.parse(JSON.stringify(ref.MAKERS)));

// 2. Product data matches the reference, except psyllium fibre (label values).
const labels = JSON.parse(fs.readFileSync('web/label-records.json', 'utf8'));
assert.match(labels['psyllium-husk'].amount_per_serving, /dietary fibre 1,578 mg, including soluble fibre 1,362 mg/);
assert.equal(E.PRODUCTS.length, ref.PRODUCTS.length);
for (const p of E.PRODUCTS) {
  const r = ref.PRODUCTS.find((x) => x.slug === p.slug);
  assert.ok(r, p.slug);
  for (const k of ['name', 'dose', 'maker', 'serving', 'key', 'form']) assert.equal(p[k], r[k], p.slug + '.' + k);
  const refAmounts = JSON.parse(JSON.stringify(r.amounts.filter((a) => !/sugar/i.test(a[0])).map((a) => [a[0], a[1]])));
  if (p.slug === 'psyllium-husk') {
    assert.deepEqual(p.amounts, [['Psyllium husk (isabgol)', '2000 mg'], ['Dietary fibre', '1,578 mg'], ['Soluble fibre', '1,362 mg']]);
    assert.equal(p.why, r.why.replace('1600 mg of dietary fibre, of which 400 mg is soluble', '1,578 mg of dietary fibre, of which 1,362 mg is soluble'));
    assert.notEqual(p.why, r.why, 'the reference fibre values must be corrected');
  } else {
    assert.deepEqual(p.amounts, refAmounts, p.slug + ' amounts');
    assert.equal(p.why, r.why, p.slug + ' why');
  }
}
// 3. The one wording addition is documented, and no unpublished document is implied.
assert.ok(E.ADAPTED.checkedNote.includes('not published'));
const all = JSON.stringify([E.SCIENCE, E.SOURCING, E.MAKERS, E.PRODUCTS, E.ADAPTED.checkedNote]); // rendered content only
assert.ok(!/1600 mg|400 mg is soluble/.test(all), 'reference psyllium fibre values must not appear');
console.log('Standards E content passed: ' + adopted.length + ' strings verbatim, 7 products checked against the reference, psyllium fibre from the final label.');
