// Exact-copy check for Variant E's Story page against the owner-selected reference ourStory().
// Renders web/story-e.js with stubbed site helpers and compares visible text (whitespace ignored) with the reference.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

// One owner-approved change (2026-11-02): the site speaks for itself, so the board footer no longer cites "the label".
const reference = execFileSync('node', ['design-tools/story-source-text.mjs']).toString()
  .replace('Every amount above is printed on the label.', 'Every amount above is stated in full.')
  // L-Theanine supply received (SharePoint › Material › Material_Tracker_Status.xlsx), so it is no longer held:
  // no "supply being confirmed" note, and it joins the Morning group.
  .replace('1 capsule · morning · supply being confirmed', '1 capsule · morning')
  .replace('Myo & D-Chiro Inositol\nYour chosen time', 'Myo & D-Chiro Inositol\nL-Theanine\nYour chosen time')
  .replace('Timings as printed on each label.', "Timings from each product's directions.");
const ids = ['iron-bisglycinate', 'l-theanine', 'vitamin-d3-k2', 'omega-3-fish-oil', 'myo-d-chiro-inositol', 'creatine-chews', 'psyllium-husk'];
const catalog = ids.map((id) => ({ id, name: id, color: '#123456', published: true }));
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const window = {
  BCCSite: { themes: { e: { story: () => 'OLD STORY' } } },
  BCCLivingE: { esc, cap: () => '<img alt="">', onEnhance: () => {} },
  BCCSuperSevens: { cast: () => {}, glyph: () => '<svg></svg>', num: () => '<span aria-hidden="true"><svg></svg></span>', mark: () => '<svg></svg>' },
};
vm.runInNewContext(fs.readFileSync('web/story-e.js', 'utf8'), { window, matchMedia: () => ({ matches: false }), document: {}, setTimeout });
const ctx = { catalog, product: (id) => catalog.find((p) => p.id === id) };
const html = window.BCCSite.themes.e.story(ctx);
assert.ok(!html.includes('OLD STORY'), 'the earlier story renderer must not be used');

const ent = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };
const text = (h) => h.replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/g, (m) => ent[m] ?? m).replace(/\s+/g, '');
const got = text(html), want = reference.replace(/\s+/g, '');
if (got !== want) {
  let i = 0; while (i < got.length && got[i] === want[i]) i++;
  assert.fail('Story copy differs at character ' + i + '\n  rendered:  …' + got.slice(Math.max(0, i - 40), i + 60) + '\n  reference: …' + want.slice(Math.max(0, i - 40), i + 60));
}
// Every product link points to a current catalogue route; the CTA goes to the shop.
const links = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
for (const l of links) assert.ok(l === '/shop' || ids.some((id) => l === '/products/' + id), 'unexpected link ' + l);
assert.equal(links.filter((l) => l.startsWith('/products/')).length, 13, '7 menu lines + 6 table rows');
console.log('Story E copy parity passed: ' + want.length + ' characters match the reference ourStory(); ' + links.length + ' links mapped.');
