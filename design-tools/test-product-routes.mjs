import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const window = {};
vm.runInNewContext(fs.readFileSync('web/product-routes.js', 'utf8'), { window, URL, location: { origin: 'https://bodycafeco.com' } });
const R = window.BCCProductRoutes;
const expected = {
  'vitamin-d3-k2': 'vitamin-d3k2', 'creatine-chews': 'creatine-chews',
  'l-theanine': 'l-theanine', 'omega-3-fish-oil': 'omega3-fishoil',
  'psyllium-husk': 'psyllium-husk', 'iron-bisglycinate': 'iron-bisglycinate',
  'myo-d-chiro-inositol': 'myo-and-dchiro-inositol'
};
for (const [id, slug] of Object.entries(expected)) {
  assert.equal(R.productId('/' + slug), id);
  assert.equal(R.productId('/' + slug + '/'), id);
  assert.equal(R.internalPath('/' + slug), '/products/' + id);
  assert.equal(R.href('/products/' + id + '?design=e#detail', 'e'), '/' + slug + '#detail');
  assert.equal(R.href('/products/' + id + '?design=b#reviews', 'b'), '/' + slug + '?design=b#reviews');
  assert.equal(R.href('/' + slug + '?lot=EXAMPLE#detail', 'e'), '/' + slug + '?lot=EXAMPLE#detail');
}
assert.equal(R.productId('/not-a-product'), null);
assert.equal(R.href('/shop?format=capsules', 'e'), '/shop?format=capsules');
assert.equal(R.href('https://example.com/products/creatine-chews', 'e'), 'https://example.com/products/creatine-chews');
console.log('Seven QR routes, legacy links, trailing slash, query/hash preservation and other designs passed.');
