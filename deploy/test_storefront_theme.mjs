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
  const sandbox = {window, URL, location: {href: 'https://store.example/' + requested, pathname: new URL('https://store.example/' + requested).pathname},
    document: {body}, sessionStorage: {getItem: () => stored, setItem: (_key, value) => {stored = value;}}};
  vm.runInNewContext(selection + '\n' + source.slice(source.indexOf('function designHref('), source.indexOf('function shell(')) + '\nwindow.bar = previewBar(); window.links = [designHref("e"), designHref("e2"), designHref("e3"), designHref("e4"), designHref("h")];', sandbox);
  return {design: body.dataset.design, stored, part: body.dataset.variantEPart, bar: window.bar, links: [...window.links]};
}
for (const options of [
  {}, {requested: '?design=b', stored: 'b'}, {requested: '?design=h', stored: 'f'}, {stored: 'b'}, {requested: '?design=e&part=2'}, {requested: '?design=e&part=3'},
]) {
  const result = select({...options, production: true});
  assert.equal(result.design, 'e');
  assert.equal(result.stored, 'e');
  assert.equal(result.bar, '');
  assert.equal(result.part, '1');
}
assert.equal(select().design, 'e');
assert.equal(select({requested:'ops?design=b',stored:'h'}).design, 'e');
assert.equal(select({requested: '?design=b'}).design, 'b');
assert.equal(select({stored: 'h'}).design, 'h');
assert.equal(select({requested: '?design=e', stored: 'b'}).design, 'e');
for (const connected of [false, true]) {
  assert.equal(select({connected}).design, 'e');
  for (const design of 'abcdefgh') {
    const result = select({connected, requested: 'products/l-theanine?design=' + design + '&view=details#facts'});
    assert.equal(result.design, design);
    const [, variant, archive] = result.bar.match(/<optgroup label="Variant E">(.*?)<\/optgroup><optgroup label="Archive">(.*?)<\/optgroup>/);
    assert.deepEqual([...variant.matchAll(/value="(.*?)"/g)].map(match => match[1]), ['e', 'e2', 'e3', 'e4']);
    assert.deepEqual([...archive.matchAll(/value="(.*?)"/g)].map(match => match[1]), [...'abcdfgh']);
    assert.ok(result.bar.includes('value="' + design + '" selected'));
    assert.ok(result.bar.includes('href="/ops"'));
  }
}
const ops = fs.readFileSync('web/operations.js', 'utf8');
assert.ok(!ops.includes('?design=b'));
assert.ok(ops.includes("BCCProductRoutes.href('/products/' + saved.id + '?design=e', 'e')"));

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
const working = select({requested: 'l-theanine?view=details&part=2#facts', stored: 'h'});
assert.equal(working.design, 'e');
assert.equal(working.part, '2');
assert.ok(working.bar.includes('value="e2" selected'));
assert.deepEqual(working.links, [
  '/l-theanine?view=details&design=e#facts',
  '/l-theanine?view=details&part=2&design=e#facts',
  '/l-theanine?view=details&part=3&design=e#facts',
  '/l-theanine?view=details&part=4&design=e#facts',
  '/l-theanine?view=details&design=h#facts',
]);
const third = select({requested: 'shop?part=3', stored: 'b'});
assert.equal(third.design, 'e');
assert.equal(third.part, '3');
assert.ok(third.bar.includes('value="e3" selected'));
const fourth = select({requested: 'shop?part=4', stored: 'b'});
assert.equal(fourth.design, 'e');
assert.equal(fourth.part, '4');
assert.ok(fourth.bar.includes('value="e4" selected'));
assert.equal(select({requested: '?design=e&part=5'}).part, '1');
// The Design dropdown must accept every working part (Part 2 → Part 3 used to be ignored).
assert.ok(/matches\("\[data-design-select\]"\) && \(WORKING_PARTS\.some\(\(n\) => e\.target\.value === "e" \+ n\)/.test(source), 'design dropdown accepts every working part');
assert.equal(select({requested: '?design=h&part=2'}).part, '');
assert.equal(select({requested: 'ops?design=e&part=2'}).part, '1');
console.log('Grouped Variant E and Archive previews, production selection, admin links and catalogue media checks passed.');

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

// Choose your pack (owner, 4 Nov 2026): 2 bottles of one product save 5%, 3 or more 10%. The product page (web/packs-e.js),
// the hosted API (supabase/functions/operations/core.js) and the static preview (deploy/hosted-preview.js) must agree.
const packWin = {};
vm.runInNewContext(fs.readFileSync('web/packs-e.js', 'utf8'), {window: packWin});
const pk = packWin.BCCPacks;
assert.deepEqual([1, 2, 3, 4].map(pk.pct), [0, 5, 10, 10]);
assert.equal(pk.packPrice(899, 2), 1708);
assert.equal(pk.packPrice(899, 3), 2427);
assert.equal(pk.packPrice(1699, 1), 1699);
assert.equal(pk.days({servings_per_pack: '60'}), 60);
const serverRule = (file, pctName, savingName) => {
  const src = fs.readFileSync(file, 'utf8');
  const pick = (name) => (src.match(new RegExp('function ' + name + '\\([^)]*\\)\\{[^}]*\\}')) || src.match(new RegExp('const ' + name + ' = [^;]*;')))[0];
  return vm.runInNewContext(pick(pctName) + '\n' + pick(savingName) + '\n;(' + savingName + ')');
};
for (const [file, a, b] of [['supabase/functions/operations/core.js', 'packPct', 'packSaving'], ['deploy/hosted-preview.js', 'packPct', 'packSaving']]) {
  const saving = serverRule(file, a, b);
  for (const price of [749, 899, 949, 1049, 1499, 1699, 1949]) for (const q of [1, 2, 3, 5]) assert.equal(saving(price, q), pk.saving(price, q), file + ' ' + price + ' x ' + q);
}
console.log('Pack savings agree between the product page, the hosted API and the static preview.');
