/* Body Café Co. — Variant E · product page, rebuilt to the Page Flow Plan (owner approved, 3 November 2026).
   Eleven sections become six, each one visual + one headline:
   1 Buy box · 2 Highlights · 3 How to take it · 4 Label facts · 5 Check your bottle · 6 Reviews & questions · + more of the seven.
   Every label fact, caution and record stays on the page: long ones open on tap instead of standing open.
   Loaded last of the product layers; the team's renderers are unchanged. */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE;
  if (!S || !S.themes || !S.themes.e || !L) return;
  var V = window.BCCVisualsE;
  function icon(k) { return V ? V.icon(k) : ''; }

  var ORDER = ['#about-product', '#use', '#ingredients', '#quality', '#reviews', '#explore'];
  var TABS = [['#about-product', 'Overview'], ['#use', 'How to take'], ['#ingredients', 'Label'], ['#quality', 'Lot record'], ['#reviews', 'Reviews']];
  var TRUST = [['check', 'FSSAI licensed'], ['factory', 'GMP certified'], ['flask', 'Third-party tested'], ['tag', 'Lot lookup']];
  var STEPS = [['bottle', 'Find the lot number on your pack'], ['tag', 'Type it in below'], ['record', "See that batch's record"]];

  function setHead(sec, text) { var h = sec && sec.querySelector('.pp-head h2'); if (h) h.textContent = text; }
  // A fact list becomes tap-to-open rows: the name shows, the value opens. Nothing is removed.
  function toRows(dl, open) {
    if (!dl) return;
    var rows = [].slice.call(dl.children).map(function (d) {
      var dt = d.querySelector('dt'), dd = d.querySelector('dd'); if (!dt || !dd) return '';
      return '<details class="pv-row' + (d.classList.contains('is-pending') ? ' is-pending' : '') + '"' + (open ? ' open' : '') + '><summary>' + dt.innerHTML + '</summary><div class="pv-row-v">' + dd.innerHTML + '</div></details>';
    }).join('');
    dl.outerHTML = '<div class="pv-rows ' + dl.className + '">' + rows + '</div>';
  }
  function fold(nodes, label) {
    nodes = nodes.filter(Boolean); if (!nodes.length) return;
    var d = document.createElement('details'); d.className = 'pv-fold';
    d.innerHTML = '<summary>' + label + '</summary>';
    nodes[0].before(d); nodes.forEach(function (n) { d.appendChild(n); });
  }

  L.wrap('product', function (root) {
    var pp = root.querySelector('.pp-e'); if (!pp) return;
    pp.setAttribute('data-pv', '');
    // Section counters and the hero's "01 / 07 · Capsules · nickname" line and giant number go.
    pp.querySelectorAll('.pp-k, .pp-eyebrow, .ss-band-no').forEach(function (n) { n.remove(); });

    // 1 · Buy box: the At a glance tiles carry format, pack and serving, so the pack table goes; trust becomes icons.
    var buy = pp.querySelector('#buy');
    if (buy) {
      buy.querySelectorAll('.pp-pack, .gl-key').forEach(function (n) { n.remove(); });
      var trust = buy.querySelector('.ppf-trust');
      if (trust) trust.innerHTML = TRUST.map(function (t) { return '<li>' + icon(t[0]) + '<span>' + t[1] + '</span></li>'; }).join('');
    }

    // 2 · Highlights: the product's own hook, its label diagram, three lines; "why this form" on tap.
    var about = pp.querySelector('#about-product'), detail = pp.querySelector('#detail');
    if (about) {
      var body = about.querySelector('.pp-body'), sig = detail && detail.querySelector('.ez-sig');
      if (body && sig) { body.classList.add('pv-hl'); body.prepend(sig); }
      var why = about.querySelector('.spe-why');
      if (why) { var h = why.querySelector('h3'); fold([].slice.call(why.children).filter(function (n) { return n !== h; }), h ? h.textContent + '?' : 'Why this form?'); if (h) h.remove(); }
    }
    if (detail) detail.remove();

    // 3 · How to take it: the time-of-day picture and the pour tray; the long label rows move to Label facts.
    var use = pp.querySelector('#use'), pour = pp.querySelector('.ss-pour');
    setHead(use, 'How to take it.');
    var useFacts = use && use.querySelector('.pp-facts-use');
    if (use && pour) { var tray = pour.querySelector('.ss-pour-ui'); if (tray) use.querySelector('.pp-body').appendChild(tray); pour.remove(); }

    // 4 · Label facts: the supplement facts table stays open; everything else opens on tap.
    var ing = pp.querySelector('#ingredients');
    setHead(ing, 'Everything on the label.');
    if (ing) {
      var front = ing.querySelector('.spe-front');
      if (front) { var fh = front.querySelector('h3'); fold([].slice.call(front.children).filter(function (n) { return n !== fh; }), fh ? fh.textContent : 'On the pack'); if (fh) fh.remove(); }
      var ib = ing.querySelector('.pp-body'), labelRows = ing.querySelector('.pp-facts-label');
      toRows(labelRows); labelRows = ing.querySelector('.pv-rows.pp-facts-label');
      if (useFacts && labelRows) { labelRows.after(useFacts); toRows(useFacts); }
      // A row both lists carry (Allergens) shows once.
      var seen = {};
      ing.querySelectorAll('.pv-row > summary').forEach(function (s) { var k = s.textContent.trim(); if (seen[k]) s.parentNode.remove(); seen[k] = 1; });
      var checksH = use && use.querySelector('.pp-body > h3.pp-sub-h'), checks = use && use.querySelector('.pp-checks');
      if (checks) { ib.appendChild(checks); if (checksH) checksH.remove(); }
      fold([ing.querySelector('.pp-cols'), checks], 'What to check on your pack');
      var aside = ing.querySelector('.pp-aside');
      if (aside) { var ah = aside.querySelector('h2, h3, .pp-aside-k, p:first-child'); ib.appendChild(aside); fold([aside], ah ? ah.textContent.trim() : 'About this ingredient'); if (ah) ah.remove(); }
    }

    // 5 · Check your bottle: three steps, the lookup and the label PDF up front; the record details on tap.
    var q = pp.querySelector('#quality');
    setHead(q, 'This bottle has a record.');
    if (q) {
      var qb = q.querySelector('.pp-body');
      fold([q.querySelector('.spe-check'), q.querySelector('.spe-care'), q.querySelector('.pp-facts-quality')], 'Quality and sourcing details');
      qb.prepend(L.frag('<ol class="hv-steps pv-steps">' + STEPS.map(function (s) { return '<li>' + icon(s[0]) + '<span>' + s[1] + '</span></li>'; }).join('') + '</ol>'));
      var lot = q.querySelector('.pp-lotbox'); if (lot) { lot.querySelectorAll('.pp-sub-h, .hm-bullets.pp-p, .pp-p:not(:has(a))').forEach(function (n) { n.remove(); }); }
    }

    // 6 · Reviews & questions in one place.
    var rv = pp.querySelector('#reviews'), qa = pp.querySelector('#questions');
    setHead(rv, 'Reviews & questions');
    if (rv && qa) { var qaBody = qa.querySelector('.pp-body'); if (qaBody) rv.querySelector('.pp-sec-in').appendChild(qaBody); qa.remove(); }

    // The Super Sevens card lives on the Super Sevens page.
    var turn = pp.querySelector('#turn'); if (turn) turn.remove();

    // + More of the seven.
    var ex = pp.querySelector('#explore');
    setHead(ex, 'More of the seven.');
    if (ex) ex.querySelectorAll('.pp-body > .pp-micro').forEach(function (n) { n.remove(); });

    // Order and the section bar.
    var nodes = ORDER.map(function (s) { return pp.querySelector(s); }).filter(Boolean), bar = pp.querySelector('.ppf-tabs'), after = bar || buy;
    if (after) nodes.forEach(function (n) { after.after(n); after = n; });
    var tabs = bar && bar.querySelector('.ppf-tabs-in');
    if (tabs) tabs.innerHTML = TABS.filter(function (t) { return pp.querySelector(t[0]); }).map(function (t) { return '<a href="' + t[0] + '" data-ppf-tab="' + t[0] + '">' + t[1] + '</a>'; }).join('');
  });
})();
