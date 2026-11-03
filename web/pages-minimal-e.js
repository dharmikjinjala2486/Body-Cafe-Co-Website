/* Body Café Co. — Variant E · lighter, more visual pages (owner's team feedback, 3 November 2026: "too much text";
   "no one reads big paragraphs, make it like Amazon bullet points").
   Loaded after every other E page layer; Home itself is rebuilt by home-v2-e.js (loaded after this file).
   1. Intro and explanation paragraphs under headings go. A paragraph holding a link or control is always kept.
   2. Long paragraphs become bullet lists, one sentence per bullet, in the same words (nothing reworded or added).
      Story chapters, Learn articles and policies keep their prose.
   3. Product pages get "At a glance" icon tiles under Add to bag (glance-e.js), built only from the label record.
   4. The format stripe on product cards ("01 CAPSULES") goes; the format is already under the name. */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE;
  if (!S || !S.themes || !S.themes.e || !L) return;
  var esc = L.esc;

  /* ---------- 1 · Paragraphs that go ---------- */
  var SHARED = ['.ez-lede', '.ez-sec-head > p:not(.ez-k)'];
  var CUT = {
    shop: ['.sp-lede', '.sp-note', '.sp-sec-body > .sp-lead', '.sp-fmt > p:not(.sp-fmt-in)', '.sp-sec-body > .sp-small'],
    product: ['.spe-story', '.pp-body > .pp-lead', '.ss-whoami', '.ss-pour-ui > .ez-small', '.ppf-lasts'],
    reports: ['.lt-lede', '.ss-rep-base .ez-small'],
    standards: ['.ssx-lede', '.sx-mean', '.sx-note'],
    story: ['.sca-why .sca-stack > p', '.eza-name > .ez-small'],
    learn: ['.lr-hero-lede', '.ezl-feature-copy > p'],
    help: ['.su-lede'],
    contact: ['.su-lede'],
    notFound: [] // also draws /super-sevens
  };
  var KEEP = ':not(:has(a, button, input, select, textarea))';

  /* ---------- 2 · Long paragraphs → bullets ---------- */
  var BULLETS = ['shop', 'product', 'reports', 'standards', 'help', 'contact', 'notFound', 'bundles'];
  var MIN_WORDS = 20;
  // Never split after these ("Pvt. Ltd.", "Lic. No.", "Mfg. Date", "M.R.P.").
  var ABBR = /(?:\b(?:Pvt|Ltd|Lic|No|Nos|Mfg|Exp|Dr|St|vs|approx|incl|e\.g|i\.e)|\b[A-Z](?:\.[A-Z])+)\.$/;
  function sentences(text) {
    var parts = text.trim().split(/(?<=[.!?])\s+(?=[A-Z0-9“"(])/), out = [];
    parts.forEach(function (s) { if (out.length && ABBR.test(out[out.length - 1])) out[out.length - 1] += ' ' + s; else out.push(s); });
    return out;
  }
  // Only plain text with simple emphasis is split, so links, numerals and inline art are never broken.
  function plain(el) { return !el.querySelector('*:not(strong):not(em):not(b):not(i):not(br)'); }
  function bulletise(root) {
    root.querySelectorAll('p, dd').forEach(function (el) {
      if (el.closest('.ssy-ch, .lr-article, .sx-status, form, nav, label, button, .hm-bullets') || !plain(el)) return;
      var text = el.textContent.replace(/\s+/g, ' ').trim();
      if (text.split(' ').length < MIN_WORDS) return;
      // A short answer ("Not necessarily.", "Not yet.") stays with the sentence that explains it.
      var list = sentences(text).reduce(function (out, s, i, all) {
        var prev = out[out.length - 1];
        if (prev && /^(?:Yes|No|Not)\b/.test(prev) && prev.split(' ').length < 3) out[out.length - 1] = prev + ' ' + s; else out.push(s);
        return out;
      }, []);
      if (list.length < 2) return;
      var ul = '<ul class="hm-bullets' + (el.className ? ' ' + el.className : '') + '">' + list.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>';
      if (el.tagName === 'DD') el.innerHTML = ul; else el.replaceWith(L.frag(ul));
    });
  }

  /* ---------- 3 · At a glance: icon tiles from the label, cautions one tap away ---------- */
  var G = window.BCCGlanceE, FACT = (window.BCCHomeHeroE || {}).FACT || {};
  function aboutItem(p) {
    if (!G) return '';
    var warn = sentences(p.warnings || '');
    return '<div class="hm-item"><h2 class="hm-item-t">At a glance</h2>' + G.tiles(p, FACT[p.id]) +
      (warn.length ? '<details class="hm-cautions"><summary>Cautions <span>(' + warn.length + ')</span></summary><ul class="hm-bullets hm-warn">' + warn.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul></details>' : '') + '</div>';
  }
  // Product cards and the homepage day plan: an icon row in place of the directions sentence.
  function idFrom(a) { var m = a && (a.getAttribute('href') || '').match(/\/(?:products\/)?([a-z0-9-]+)$/); return m && m[1]; }
  function cardChips(root, ctx) {
    if (!G || !ctx || !ctx.product) return;
    root.querySelectorAll('.hr-card, .sp-card').forEach(function (card) {
      var id = card.getAttribute('data-sp-item') || idFrom(card.querySelector('.hr-name a')), p = id && ctx.product(id);
      var pack = card.querySelector('.hr-pack, .sp-pack'); if (p && pack && !card.querySelector('.gl-chips')) pack.after(L.frag(G.chips(p)));
      // The dose chip already says how many per serving; the pack-size line under the name goes (owner, 3 November 2026).
      if (pack && card.querySelector('.gl-chips')) pack.remove();
      // Owner, 3 November 2026: the veg / non-veg mark sits at the right of the name; price and Add to bag share one row.
      var name = card.querySelector('.hr-name, .sp-name'), diet = card.querySelector('.gl-chips .gl-chip-diet');
      if (name && diet && !card.querySelector('.gl-namerow')) {
        var row = document.createElement('div'); row.className = 'gl-namerow';
        name.before(row); row.appendChild(name); row.appendChild(diet);
      }
      // The pack's own printed front-label line as the card's main line (owner, 3 November 2026), word for word.
      var claim = p && p.label_front && p.label_front.claim, nr = card.querySelector('.gl-namerow');
      if (claim && nr && !card.querySelector('.gl-claim')) nr.after(L.frag('<p class="gl-claim">' + esc(claim) + '</p>'));
      var buy = card.querySelector('.hr-buy, .sp-buy'), add = card.querySelector('.hr-add, .sp-add');
      if (buy && add) {
        buy.classList.add('gl-buyrow'); buy.appendChild(add);
        buy.querySelectorAll('.hr-avail, .sp-avail').forEach(function (n) { n.remove(); }); // the button already says "Out of stock"
        var acts = card.querySelector('.hr-actions'); if (acts && !acts.children.length) acts.remove();
      }
    });
    root.querySelectorAll('.hx-day-parts li li > a').forEach(function (a) {
      var p = ctx.product(idFrom(a)), line = a.querySelector('strong + span');
      if (p && line) line.replaceWith(L.frag(G.chips(p)));
    });
  }

  /* ---------- Wiring ---------- */
  var names = {};
  Object.keys(CUT).concat(BULLETS, ['home']).forEach(function (n) { names[n] = 1; });
  Object.keys(names).forEach(function (name) {
    var cut = CUT[name] ? SHARED.concat(CUT[name]).map(function (sel) { return sel + KEEP; }).join(', ') : '';
    L.wrap(name, function (root, ctx, args) {
      root.querySelectorAll('.hr-band, .sp-band').forEach(function (n) { n.remove(); });
      if (cut) root.querySelectorAll(cut).forEach(function (n) { n.remove(); });
      if (name === 'product' && args && args[0]) {
        var trust = root.querySelector('#buy .ppf-trust');
        if (trust) trust.after(L.frag(aboutItem(args[0])));
      }
      if (name === 'home' || name === 'shop') cardChips(root, ctx);
      // Price amounts stand alone; the supplied labels and policy wording remain unchanged.
      root.querySelectorAll('.hr-price span, .sp-price span, .pp-price-note, .ss-deck-buy small').forEach(function (n) {
        if (n.textContent.trim() === 'MRP') n.remove();
      });
      if (BULLETS.indexOf(name) !== -1) bulletise(root);
    });
  });
})();

/* Menu labels that say where they lead (owner, 3 November 2026). Page addresses are unchanged; only the words move:
   Standards → Quality · Story → About us · Lot report(s) / Find a lot report → Check your lot. Header, mobile menu, footer. */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE;
  if (!S || !S.themes || !S.themes.e || !L) return;
  var NAMES = { 'Standards': 'Quality', 'Story': 'About us', 'Lot report': 'Check your lot', 'Lot reports': 'Check your lot', 'Find a lot report': 'Check your lot' };
  L.wrap('chrome', function (root) {
    root.querySelectorAll('header a, nav a, footer a, .e-mnav a').forEach(function (a) {
      var t = [].slice.call(a.childNodes).filter(function (n) { return n.nodeType === 3 && n.textContent.trim(); }).pop();
      if (t && NAMES[t.textContent.trim()]) t.textContent = NAMES[t.textContent.trim()];
    });
  });
})();
