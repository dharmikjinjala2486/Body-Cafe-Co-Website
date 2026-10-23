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
const reviews = await api('/reviews?product=iron-bisglycinate');
assert.equal(reviews.summary.count, 0);
assert.equal(reviews.reviews.length, 0);
assert.equal((await api('/reviews/eligibility?product=iron-bisglycinate')).state, 'static_preview');
assert.equal((await api('/questions?product=iron-bisglycinate')).questions.length, 0);
await assert.rejects(api('/reviews', {product: 'iron-bisglycinate', rating: 5}), /does not save/);
await assert.rejects(api('/questions', {product: 'iron-bisglycinate', question: 'Synthetic question text'}), /does not save/);
assert.ok(catalog.products.every((p) => p.rating && p.rating.count === 0));
assert.ok(fs.existsSync('dist/index.html'));
assert.ok(fs.readFileSync('dist/_redirects', 'utf8').includes('/* /index.html 200'));
assert.ok(!fs.existsSync('dist/.local'));
assert.ok(!fs.existsSync('dist/app'));
assert.ok(!fs.existsSync('dist/assets/source'));
assert.ok(!fs.existsSync('dist/web/qa'));
const feedback = fs.readFileSync('dist/feedback/index.html', 'utf8');
assert.ok(feedback.includes('data-submission-mode="netlify"'));
assert.ok(feedback.includes('data-netlify="true"'));
assert.ok(feedback.includes('https://body-cafe-co-website.netlify.app/?design=a'));
assert.equal((feedback.match(/id="website-preview"/g) || []).length, 1);
for (const field of ['form-name', 'response-id', 'review-version', 'favourite', 'runner-up', 'fit', 'reasons', 'feelings', 'why', 'improve', 'least', 'least-why', 'reviewer-name', 'bot-field']) {
  assert.ok(feedback.includes(`name="${field}"`), `Static Netlify field missing: ${field}`);
}
for (const theme of 'ABCDEFGH') assert.ok(feedback.includes(`name="favourite" value="${theme}"`));
assert.ok(!fs.existsSync('dist/web/feedback.html'));
assert.ok(fs.existsSync('dist/web/feedback-media/logo.svg'));
assert.ok(fs.readFileSync('dist/_redirects', 'utf8').includes('/feedback /feedback/index.html 200'));
console.log('Hosted preview API and publish-boundary checks passed.');
