/* Body Café Co. — Variant E · Standards, rebuilt to the Page Flow Plan (owner approved, 3 November 2026).
   Thirteen sections become five, each one visual + one headline. Nothing is deleted: a merged section's content sits
   behind a tap-to-open row under the section it joined, titled with its own heading.
   1 Hero + record: the title, four icon tabs (with each one's publication status), the product record picker.
   2 The chain: ingredient → product → lot → document; folds: what we can show, where ingredients come from, how quality
     is checked, published today and still to come.
   3 Makers: the ingredient explorer; fold: every label, side by side.
   4 Your lot: the lot picture and status.
   5 How we communicate: three practices; folds: evidence, good questions; then the next-step links.
   Loaded last of the standards layers; the team's renderers are unchanged. */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE;
  if (!S || !S.themes || !S.themes.e || !L) return;
  var V = window.BCCVisualsE;
  function icon(k) { return V ? V.icon(k) : ''; }

  var TABS = [['form', 'Formula', '#ingredients'], ['pin', 'Source', '#chain'], ['check', 'Checks', '#chain'], ['record', 'Record', '#lot']];

  function title(sec) { var h = sec && sec.querySelector('h2'); return h ? h.textContent.trim() : ''; }
  function body(sec) { return sec && (sec.querySelector('.sx-body') || sec); }
  // Moves the given nodes into a tap-to-open row at the end of host, under the heading they came with.
  function fold(host, label, nodes, id) {
    nodes = nodes.filter(Boolean); if (!host || !nodes.length) return;
    var d = document.createElement('details'); d.className = 'pv-fold sv2-fold'; if (id) d.id = id;
    d.innerHTML = '<summary>' + L.esc(label) + '</summary>';
    nodes.forEach(function (n) { d.appendChild(n); });
    host.appendChild(d);
  }
  function kids(sec) { var b = body(sec); return b ? [].slice.call(b.children).filter(function (c) { return !c.matches('header, .sx-head, .ez-sec-head, .ssx-sci-head'); }) : []; }

  L.wrap('standards', function (root) {
    var page = root.querySelector('.sx'); if (!page) return;
    page.setAttribute('data-std', '');
    var q = function (s) { return page.querySelector(s); };
    var hero = q('.ezx-hero'), record = q('.ezx-record'), science = q('#science'), chain = q('.ezx-chain'), side = q('#side-by-side'),
      glance = q('#glance'), source = q('#source'), makers = q('#ingredients'), checks = q('#checks'), evidence = q('#evidence'),
      lot = q('#lot'), talk = q('#communicate'), faq = q('#questions'), next = q('#next');

    // Small labels and section counters go; the headings carry each section.
    page.querySelectorAll('.ez-k, .sx-k').forEach(function (n) { n.remove(); });

    // 1 · Hero: four icon tabs, each with the status the "at a glance" list gave it.
    if (hero) {
      var states = glance ? [].slice.call(glance.querySelectorAll('.sx-principles > li')).map(function (li) {
        var st = li.querySelector('[class*="state"], [class*="status"], .sx-badge, .sx-tag'); return st ? st.textContent.trim() : '';
      }) : [];
      hero.appendChild(L.frag('<nav class="std-tabs" aria-label="On this page"><ul>' + TABS.map(function (t, i) {
        var s = states[i] || '', on = /available|published$/i.test(s) && !/not|partly/i.test(s), part = /partly/i.test(s);
        return '<li><a href="' + t[2] + '">' + icon(t[0]) + '<span><b>' + t[1] + '</b>' + (s ? '<small class="std-st' + (on ? ' is-on' : part ? ' is-part' : '') + '">' + L.esc(s) + '</small>' : '') + '</span></a></li>';
      }).join('') + '</ul></nav>'));
    }
    if (record) record.id = record.id || 'records';

    // 2 · The chain, with the sections it explains folded beneath it.
    if (chain) {
      chain.id = 'chain';
      var cb = chain.querySelector('.ez-sec-head') ? chain : body(chain);
      fold(cb, title(science), science ? [science.querySelector('.ssx-rules')] : []);
      fold(cb, title(source), kids(source), 'source');
      fold(cb, title(checks), kids(checks), 'checks');
      var now = glance && glance.querySelector('details.sx-more');
      if (now) { var ns = now.querySelector('summary'); fold(cb, ns ? ns.textContent.trim() : 'Published today, and still to come', [].slice.call(now.children).filter(function (c) { return c.tagName !== 'SUMMARY'; })); }
    }
    [science, source, checks, glance].forEach(function (s) { if (s) s.remove(); });

    // 3 · Makers: the ingredient explorer; the side-by-side table on tap.
    if (makers && side) { var tbl = side.querySelector('.ssx-tbl'); fold(makers, title(side), [tbl]); side.remove(); }

    // 4 · Your lot: the picture and status; the sub-labels go.
    if (lot) lot.querySelectorAll('h3.sx-sub').forEach(function (n) { n.remove(); });

    // 5 · How we communicate: the three practices; evidence and questions on tap; the next-step links close the page.
    if (talk) {
      talk.querySelectorAll('h3.sx-sub').forEach(function (n) { n.remove(); });
      var tb = body(talk);
      fold(tb, title(evidence), kids(evidence), 'evidence');
      fold(tb, title(faq), kids(faq), 'questions');
      if (next) { var acts = next.querySelector('.sx-actions'); if (acts) tb.appendChild(acts); }
    }
    [evidence, faq, next].forEach(function (s) { if (s) s.remove(); });
    // Every tap-to-open row starts closed.
    // (standards.js re-opens [data-sx-wide-open] boxes on wide screens, so they opt out.)
    page.querySelectorAll('[data-sx-wide-open]').forEach(function (d) { d.removeAttribute('data-sx-wide-open'); d.removeAttribute('open'); });
    if (talk) talk.querySelectorAll('details[open]').forEach(function (d) { d.removeAttribute('open'); });
    // The "How we work, and what is still to come." divider introduced the sections that are now folded away.
    page.querySelectorAll(':scope > .ezx-method').forEach(function (n) { n.remove(); });
  });
})();
