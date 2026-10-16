import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const catalog = JSON.parse(fs.readFileSync('dist/web/catalog-preview.json'));
const sandbox = {window: {}, location: {origin: 'https://example.netlify.app'}, URL,
  fetch: async (url) => {assert.equal(url, '/web/catalog-preview.json'); return {ok: true, json: async () => catalog};}};
vm.runInNewContext(fs.readFileSync('deploy/hosted-preview.js', 'utf8'), sandbox);
const api = sandbox.window.BCCStaticPreview.api;
assert.equal((await api('/catalog')).products.length, 7);
assert.equal((await api('/session')).user.role, 'customer');
assert.equal((await api('/account')).orders.length, 0);
assert.equal((await api('/reports?product=iron-bisglycinate&lot=DEMO-01-01')).state, 'sample_match');
assert.equal((await api('/reports?product=l-theanine&lot=DEMO-01-01')).state, 'not_found');
assert.equal((await api('/reports?product=l-theanine&lot=DEMO-WITHDRAWN')).state, 'withdrawn');
assert.equal((await api('/reports?product=l-theanine&lot=DEMO-UNPUBLISHED')).state, 'unpublished');
await assert.rejects(api('/reports?product=invalid&lot=DEMO-01-01'), /Choose a product/);
await assert.rejects(api('/reports?product=l-theanine&lot=DEMO-OUTAGE'), /service-unavailable/);
await assert.rejects(api('/orders', {contact: {name: 'Synthetic test'}}), /does not save/);
assert.ok(fs.existsSync('dist/index.html'));
assert.ok(fs.readFileSync('dist/_redirects', 'utf8').includes('/* /index.html 200'));
assert.ok(!fs.existsSync('dist/.local'));
assert.ok(!fs.existsSync('dist/app'));
assert.ok(!fs.existsSync('dist/assets/source'));
assert.ok(!fs.existsSync('dist/web/qa'));
console.log('Hosted preview API and publish-boundary checks passed.');
