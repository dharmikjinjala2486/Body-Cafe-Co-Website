import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Pinned tester comments (web/tester-feedback-e.js): which pins are drawn and where each one goes when the page has
// changed since it was left. Runs the real functions against a small stand-in page, without the DOM or the app.
const source = fs.readFileSync('web/tester-feedback-e.js', 'utf8');
const pathOf = source.match(/ {2}var pathOf = .*\n/)[0];
const rules = pathOf + source.slice(source.indexOf('  function norm('), source.indexOf('  /* The highlighted words inside'));
assert.ok(rules.includes('function locate(') && rules.includes('function unresolved('));

// A stand-in element: a tag, its own words, children, and whether it can be seen at this screen width.
function page(tree) {
  const byId = {};
  const make = (spec, parent) => {
    const e = {nodeType: 1, localName: spec.tag, id: spec.id || '', parentElement: parent, hidden: !!spec.hidden, kids: [], own: spec.text || '',
      closest: sel => sel === '.tf, .tf-pins' ? null : null,
      get gone() { return this.hidden || !!(this.parentElement && this.parentElement.gone); }, // hidden with everything inside it
      getBoundingClientRect() { return this.gone ? {width: 0, height: 0} : {width: 100, height: 20}; },
      checkVisibility() { return !this.gone; },
      get textContent() { return [this.own, ...this.kids.map(k => k.textContent)].join(' '); },
      get firstElementChild() { return this.kids[0] || null; },
      get nextElementSibling() { const s = parent ? parent.kids : []; return s[s.indexOf(this) + 1] || null; },
      get previousElementSibling() { const s = parent ? parent.kids : []; return s[s.indexOf(this) - 1] || null; }};
    if (e.id) byId[e.id] = e;
    e.kids = (spec.kids || []).map(k => make(k, e));
    return e;
  };
  const body = make({tag: 'body', kids: [tree]}, null);
  // Only the selectors a pin stores: "#id" or "body", then "tag:nth-of-type(n)" steps joined by " > ".
  const querySelector = sel => {
    const [first, ...steps] = sel.split(' > ');
    let e = first === 'body' ? body : first.startsWith('#') ? byId[first.slice(1)] : null;
    for (const step of steps) {
      const m = /^([a-z0-9]+):nth-of-type\((\d+)\)$/.exec(step);
      if (!e || !m) return null;
      e = e.kids.filter(k => k.localName === m[1])[m[2] - 1] || null;
    }
    return e || null;
  };
  return {document: {body, querySelector, querySelectorAll: sel => [querySelector(sel)].filter(Boolean)}, byId};
}
function run({tree, notes = [], design = 'Content Focus', path = '/'}) {
  const {document, byId} = page(tree);
  const sandbox = {document, location: {pathname: path}, notes, design: () => design};
  vm.runInNewContext(rules + '\nthis.api = {locate, seen, unresolved, number};', sandbox);
  return {...sandbox.api, byId};
}

// The Content Focus home rewrites Part 2's words: the hero heading is new, Part 2's heading words moved into the lede.
const home = {tag: 'main', id: 'main', kids: [{tag: 'div', kids: [
  {tag: 'section', id: 'hero', kids: [
    {tag: 'div', kids: [{tag: 'p', text: 'The Super Sevens'}, {tag: 'h1', id: 'p2-hero-t', kids: [{tag: 'b', text: 'It’s not the list.'}]},
      {tag: 'p', text: 'Seven supplements. Every ingredient, form and amount chosen for a reason you can read.'}]}]},
  {tag: 'section', kids: [{tag: 'h2', text: 'Seven formulas. Nothing along for the ride.'}, {tag: 'nav', hidden: true, kids: [{tag: 'a', text: 'Desktop only link'}]}]}]}]};

{ // Its element is still there with the same words.
  const {locate, byId} = run({tree: home});
  const at = locate({sel: '#main > div:nth-of-type(1) > section:nth-of-type(1) > div:nth-of-type(1) > p:nth-of-type(1)', text: 'Th', hl: true});
  assert.equal(at.how, 'here'); assert.equal(at.el.own, 'The Super Sevens');
  assert.equal(locate({sel: '#p2-hero-t > b:nth-of-type(1)', text: 'It’s not the list.'}).el, byId['p2-hero-t'].kids[0]);
}
{ // Its element was reworded: the pin follows its words to where they went.
  const at = run({tree: home}).locate({sel: '#p2-hero-t > b:nth-of-type(1)', x: 0.131, y: 0.593, text: 'Seven supplements.', hl: false});
  assert.equal(at.how, 'words'); assert.match(at.el.own, /^Seven supplements\./);
}
{ // Its words are gone but its element is still there: it stays on its element.
  const at = run({tree: home}).locate({sel: '#p2-hero-t > b:nth-of-type(1)', text: 'Seven. Each in its own colour.'});
  assert.equal(at.how, 'spot'); assert.equal(at.el.own, 'It’s not the list.');
}
{ // Both are gone: the nearest part of the page still there, found by shortening its address a step at a time.
  const at = run({tree: home}).locate({sel: '#main > div:nth-of-type(1) > section:nth-of-type(2) > div:nth-of-type(4) > p:nth-of-type(2)', text: 'Words that were reworded away'});
  assert.equal(at.how, 'moved'); assert.equal(at.el.localName, 'section'); assert.match(at.el.textContent, /Seven formulas/);
}
{ // Nothing of it is left at all: the top of the page, never hidden. Short highlighted words are not searched page-wide.
  const {locate, byId} = run({tree: home});
  for (const pin of [{sel: '#gone > p:nth-of-type(2)', text: 'Also not on the page'}, {sel: '', text: 'Th', hl: true}, {sel: 'body > aside:nth-of-type(3)', text: ''}]) {
    const at = locate(pin); assert.equal(at.how, 'moved'); assert.equal(at.el, byId.main);
  }
}
{ // An element hidden at this screen width: the nearest part around it that can be seen.
  const {locate, seen} = run({tree: home});
  const at = locate({sel: '#main > div:nth-of-type(1) > section:nth-of-type(2) > nav:nth-of-type(1) > a:nth-of-type(1)', text: 'Desktop only link'});
  assert.equal(at.how, 'here'); assert.equal(seen(at.el).localName, 'section');
}
{ // Every unresolved note on this page is drawn, from Part 2 or Content Focus; resolved notes and other pages' are not.
  const notes = [
    {id: 'a', pin: {sel: '', text: 'x'}, page: '/?design=e', design: 'Part 2', status: 'open'},
    {id: 'b', pin: {sel: '', text: 'x'}, page: '/?design=e&part=5', design: 'Content Focus', status: 'in_progress'},
    {id: 'c', pin: {sel: '', text: 'x'}, page: '/', design: 'Part 2', status: 'resolved'},
    {id: 'd', pin: {sel: '', text: 'x'}, page: '/shop?design=e', design: 'Part 2', status: 'open'},
    {id: 'e', pin: null, page: '/', design: 'Part 2', status: 'open'}];
  for (const design of ['Part 2', 'Content Focus']) {
    const {unresolved, number} = run({tree: home, notes, design});
    assert.deepEqual(unresolved().map(n => n.id), ['a', 'b']);
    number(); assert.deepEqual(notes.map(n => n.no), [3, 2, 1, undefined, undefined]); // numbers count resolved ones too, so they never change
  }
}
console.log('tester pins: ok');
