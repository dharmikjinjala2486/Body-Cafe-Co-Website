// Checks Variant E's Shop additions (web/shop-e.js) against the owner-selected reference and the final labels:
// lede, headlines and chips are verbatim except psyllium's fibre chip; time groups follow the label timing strips
// that web/pdp-e.js also uses; the time filter is limited to design E.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('design-review/story-source-2026-11-02/reference-index.html', 'utf8');
const script = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
const pick = (start, end) => script.slice(script.indexOf(start), script.indexOf(end, script.indexOf(start)));
const ref = {};
vm.runInNewContext(pick('const BRAND', 'const ROUTES') + '\nref.PRODUCTS = JSON.parse(JSON.stringify(PRODUCTS)); ref.products = ' + JSON.stringify(pick('function products', 'function product(')) + ';', { ref });

const window = { BCCSite: { themes: { e: {} } }, BCCLivingE: { esc: (s) => s, wrap() {}, onEnhance() {}, frag() {}, cap: () => '', pad: String }, BCCSuperSevens: {} };
const sandbox = { window };
for (const f of ['web/standards-e.js', 'web/pdp-e.js', 'web/shop-e.js']) vm.runInNewContext(fs.readFileSync(f, 'utf8'), sandbox);
const E = JSON.parse(JSON.stringify(window.BCCShopE)), P = JSON.parse(JSON.stringify(window.BCCPdpE.P));

assert.ok(ref.products.includes(E.LEDE), 'lede is the reference products() lede');
for (const g of E.TIMES.groups) assert.ok(ref.products.includes('"' + g.label + '"'), 'time label in reference filters: ' + g.label);
assert.deepEqual(E.TIMES.designs, ['e'], 'time filter only for design E');
for (const r of JSON.parse(JSON.stringify(ref.PRODUCTS))) {
  const want = r.slug === 'psyllium-husk' ? r.chips.map((c) => (c === 'Fibre 1600 mg' ? 'Fibre 1,578 mg' : c)) : r.chips;
  assert.deepEqual(E.CHIPS[r.slug], want, r.slug + ' chips');
  assert.equal(P[r.slug].headline, r.headline, r.slug + ' headline');
  // Time groups match the label's "Best" slot used on the product page.
  const inMorning = E.TIMES.groups.find((g) => g.id === 'morning').ids.includes(r.slug), inNight = E.TIMES.groups.find((g) => g.id === 'night').ids.includes(r.slug);
  assert.equal(inMorning, P[r.slug].best === 'morning', r.slug + ' morning group');
  assert.equal(inNight, P[r.slug].best === 'night', r.slug + ' night group');
}
const labels = JSON.parse(fs.readFileSync('web/label-records.json', 'utf8'));
assert.match(labels['psyllium-husk'].amount_per_serving, /dietary fibre 1,578 mg/);
assert.ok(!JSON.stringify(E.CHIPS).includes('1600'), 'reference fibre value must not appear');
// Shared shop.js: the time filter only appears for designs that the data names.
const shop = fs.readFileSync('web/shop.js', 'utf8');
assert.match(shop, /t\.designs\.indexOf\(DESIGN\) >= 0/);
console.log('Shop E content passed: lede and 7 products’ headlines and chips match the reference (psyllium fibre from the label); time groups follow the label timing; E only.');
