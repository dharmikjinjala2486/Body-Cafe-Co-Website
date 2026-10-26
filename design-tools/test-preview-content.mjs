import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

// Exercise the real policy content and demo adapter, without changing any preview records.
const root = new URL('../', import.meta.url);
const context = vm.createContext({ window: {
  BCCSite: { CARE_NOTE: 'Care note' }, BCCPDP: { copy: {} },
  BCCEH: { h: { HOME: { faq: [['Are these the final prices?', ''], ['When will my order arrive?', ''], ['How do returns work?', '']] } } }
} });
const run = path => vm.runInContext(readFileSync(fileURLToPath(new URL(path, root)), 'utf8'), context);
run('web/support-content.js');
const policies = context.window.BCCSupportContent.POLICIES;
const retention = JSON.stringify(policies.privacy.sections.find(s => s.id === 'retention'));
// Editorial headings can change; matching must remain tied to the policy and section IDs.
policies.shipping.sections.find(s => s.id === 'charges').h = 'Shipping costs';
run('web/demo-content.js');
const section = (policy, id) => policies[policy].sections.find(s => s.id === id).p.join(' ');
assert.match(section('shipping', 'charges'), /₹75/);
assert.match(section('shipping', 'charges'), /after discounts/);
assert.doesNotMatch(section('shipping', 'charges'), /3–7 business days/);
assert.match(section('shipping', 'estimates'), /3–7 business days/);
assert.match(section('shipping', 'processing'), /1–2 business days/);
assert.match(section('shipping', 'failed'), /returned-parcel handling/);
assert.doesNotMatch(section('shipping', 'failed'), /3–7 business days/);
assert.match(section('returns', 'refunds'), /5–7 business days/);
assert.match(section('returns', 'charges'), /part-return calculations/);
assert.match(section('returns', 'windows'), /7 days/);
assert.equal(JSON.stringify(policies.privacy.sections.find(s => s.id === 'retention')), retention);
assert.equal(context.window.BCCPDP.copy.shipping, section('shipping', 'charges'));
assert.equal(policies.shipping.summary[1], section('shipping', 'charges'));
assert.equal(policies.returns.summary[1], section('returns', 'windows'));
const home = context.window.BCCEH.h.HOME;
assert.equal(home.faq[1][1], section('shipping', 'estimates'));
assert.equal(home.faq[2][1], section('returns', 'windows'));
assert.match(home.voicesSmall, /illustrative feedback/);
const demo = context.window.BCCDemo;
assert.equal(demo.packInfo('unknown'), null);
for (const id of Object.keys(demo.packs)) {
  const pack = demo.packInfo(id);
  assert.equal(pack.status, 'demo');
  assert.equal(pack.label, 'Demo pack: ' + pack.value);
  assert.ok(pack.description.includes(pack.value));
  assert.match(pack.description, /approved label/);
}
console.log('Preview content regression checks passed (policy routing, pending facts, shared pack status).');
