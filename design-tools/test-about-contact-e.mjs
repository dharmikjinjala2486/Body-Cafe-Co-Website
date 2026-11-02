// Checks Variant E's Contact and About additions (web/about-contact-e.js) against the owner-selected reference:
// every string must appear verbatim in the reference contact() or home() output, and the Story link text must be the
// Story page's own headline.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('design-review/story-source-2026-11-02/reference-index.html', 'utf8');
const script = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
const pick = (start, end) => script.slice(script.indexOf(start), script.indexOf(end, script.indexOf(start)));
const ref = {};
vm.runInNewContext([pick('const BRAND', 'const ROUTES'), pick('const esc', 'function glyph'), 'function saucer(){return ""}\nconst doseWord = (d) => d;', pick('function boardHTML', 'function cardHTML'),
  pick('function cardHTML', 'function dayHTML'), pick('function dayHTML', 'function manifestoHTML'), pick('function manifestoHTML', 'function finalCTA'), pick('function finalCTA', 'function home'),
  pick('function home', 'function ourStory'), pick('function contact', 'const DIMS'), 'ref.home = home(); ref.contact = contact();'].join('\n'), { ref });
const ent = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };
const text = (h) => h.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, (m) => ent[m] ?? m).replace(/\s+/g, ' ');
const home = text(ref.home), contact = text(ref.contact);

const window = { BCCSite: { themes: { e: {} } }, BCCLivingE: { esc: (s) => s, wrap() {}, frag() {} } };
vm.runInNewContext(fs.readFileSync('web/about-contact-e.js', 'utf8'), { window });
const E = JSON.parse(JSON.stringify(window.BCCAboutContactE));

for (const [k, v] of Object.entries(E.CONTACT)) assert.ok(contact.includes(v), 'Contact ' + k + ' not in reference: ' + v);
for (const v of [E.BELIEF.eyebrow, E.BELIEF.title, E.BELIEF.lede, E.BELIEF.body, E.WHY.eyebrow, E.WHY.title, ...E.WHY.body]) assert.ok(home.includes(v), 'About string not in reference home(): ' + v);
assert.ok(home.includes(E.WHY.shout.join(' ')), 'struck promises');
assert.ok(ref.home.includes(E.WHY.shout.map((s) => '<s>' + s + '</s>').join(' ')), 'promises are struck through in the reference');
const story = fs.readFileSync('web/story-e.js', 'utf8');
assert.ok(story.includes('title: "' + E.STORY_LINK + '"'), 'Story link uses the Story headline');
// The homepage hero renderer is not touched by this module.
assert.ok(!fs.readFileSync('web/about-contact-e.js', 'utf8').includes('"home"'), 'no homepage wrap');
console.log('About and Contact E content passed: ' + (Object.keys(E.CONTACT).length + 10) + ' strings verbatim from the reference contact() and home().');
