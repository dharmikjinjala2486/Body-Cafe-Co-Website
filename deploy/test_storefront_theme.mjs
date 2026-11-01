import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Exercise the real theme selection without starting the DOM/application runtime.
const source = fs.readFileSync('web/app.js', 'utf8');
const selection = source.split('const $ =')[0];
function select({connected = false, production = false, requested = '', stored = null} = {}) {
  const body = {dataset: {}};
  const window = {BCCConnectedHosted: connected, BCCRelease: {production},
    BCCSite: {themes: Object.fromEntries(['e', 'f', 'g', 'h'].map(d => [d, {}]))}};
  const sandbox = {window, URL, location: {href: 'https://store.example/' + requested},
    document: {body}, sessionStorage: {getItem: () => stored, setItem: (_key, value) => {stored = value;}}};
  vm.runInNewContext(selection + '\n' + source.slice(source.indexOf('function designHref('), source.indexOf('function shell(')) + '\nwindow.bar = previewBar();', sandbox);
  return {design: body.dataset.design, stored, bar: window.bar};
}
for (const options of [
  {}, {requested: '?design=b', stored: 'b'}, {requested: '?design=h', stored: 'f'}, {stored: 'b'},
]) {
  const result = select({...options, production: true});
  assert.equal(result.design, 'e');
  assert.equal(result.stored, 'e');
  assert.equal(result.bar, '');
}
assert.equal(select().design, 'e');
assert.equal(select({requested: '?design=b'}).design, 'b');
assert.equal(select({stored: 'h'}).design, 'h');
assert.equal(select({requested: '?design=e', stored: 'b'}).design, 'e');
for (const connected of [false, true]) {
  assert.equal(select({connected}).design, 'e');
  for (const design of 'abcdefgh') {
    const result = select({connected, requested: '/products/l-theanine?design=' + design + '&view=details#facts'});
    assert.equal(result.design, design);
    assert.equal((result.bar.match(/data-design-switch/g) || []).length, 8);
    assert.equal((result.bar.match(/<option /g) || []).length, 8);
    assert.ok(result.bar.includes('/products/l-theanine?design=' + design + '&view=details#facts'));
    assert.ok(result.bar.includes('href="/ops"'));
  }
}
const ops = fs.readFileSync('web/operations.js', 'utf8');
assert.ok(!ops.includes('?design=b'));
assert.ok(ops.includes("'/products/' + saved.id + '?design=e'"));

// E's homepage uses the shared media helpers. Admin-created products need a real image
// rather than a fabricated render path; original product cap renders remain available.
const sandbox = {document: {addEventListener() {}}, window: {BCCSite: {STATUS: {label: "Pending"}}, BCCBottleAssets: {url: id => '/api/media/' + id}}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('web/site.js', 'utf8'), sandbox);
vm.runInContext(fs.readFileSync('web/site-eh.js', 'utf8'), sandbox);
const helpers = sandbox.window.BCCEH.h;
const ctx = {escape: s => s, bottleWidth: {'iron-bisglycinate': 774}};
assert.ok(helpers.front(ctx, {id: 'new-product', name: 'New'}).includes('/api/media/new-product'));
assert.ok(helpers.render(ctx, {id: 'new-product', name: 'New'}, 'cap').includes('/api/media/new-product'));
assert.ok(helpers.render(ctx, {id: 'iron-bisglycinate', name: 'Iron'}, 'cap').includes('/web/media/renders/iron-bisglycinate-cap.webp'));
console.log('A–H preview tabs, E production/default selection, admin links and catalogue media checks passed.');

const labels = JSON.parse(fs.readFileSync('web/label-records.json', 'utf8'));
vm.runInContext(fs.readFileSync('web/label-content.js', 'utf8'), sandbox);
const merge = sandbox.window.BCCLabelContent.merge;
const initial = {id:'creatine-chews', subtitle:'Meet creatine in a chew.', ingredients:'Creatine; complete formulation pending',
  label_note:'Full formulation, quantities, directions and warnings await approved rear labels.', price:749, stock:9, published:true};
const merged = merge([initial], labels)[0];
assert.equal(merged.pack_size, '60 chewable tablets');
assert.equal(merged.serving_size, '2 chewable tablets');
assert.equal(merged.ingredients, 'Creatine monohydrate');
assert.equal(merged.price, 749);
assert.equal(merged.stock, 9);
assert.equal(merged.published, true);
assert.equal(initial.pack_size, undefined);
const edited = merge([{...initial, subtitle:'Admin copy', pack_size:'Updated pack', directions:'Updated directions', description:''}], labels)[0];
assert.equal(edited.subtitle, 'Admin copy');
assert.equal(edited.pack_size, 'Updated pack');
assert.equal(edited.directions, 'Updated directions');
assert.equal(edited.description, '');
const fresh = {id:'admin-product',name:'New product',price:100,stock:2,published:true};
assert.equal(merge([fresh], labels)[0], fresh);
assert.equal(Object.keys(labels).length, 7);
for (const product of Object.values(labels)) {
  for (const field of ['pack_size','serving_size','amount_per_serving','allergens','warnings','directions','label_source']) assert.ok(product[field]);
  for (const field of ['price','stock','published','rating']) assert.equal(product[field], undefined);
}
console.log('Label defaults preserve admin edits, commerce data and source records.');
