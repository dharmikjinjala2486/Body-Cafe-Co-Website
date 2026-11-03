/* Body Café Co. — Variant E homepage. Owner revision, 3 November 2026:
   Hero · trust strip · collection · lot lookup · Voices · FAQ.
   Timing, Proof and the closing invitation are removed at the owner’s request. */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE;
  if (!S || !S.themes || !S.themes.e || !L) return;
  var V = window.BCCVisualsE, G = window.BCCGlanceE, esc = L.esc;
  function icon(k) { return V ? V.icon(k) : ''; }

  var DROP = ['trustbar', 'belief', 'trust', 'sourcing', 'learn', 'pour', 'cards', 'curiosity', 'everyday', 'proof', 'invitation'];
  var ORDER = ['hero', 'trust-strip', 'collection', 'lot', 'voices', 'faq'];
  var KEEP_LABEL = ['hero', 'proof', 'voices', 'faq'];
  var TRUST = [['check', 'FSSAI licensed'], ['factory', 'GMP certified'], ['flask', 'Third-party tested'], ['tag', 'Every lot traceable']];
  var STEPS = [['bottle', 'Find the lot number on your pack'], ['tag', 'Type it in'], ['record', "See that batch's record"]];

  function setHead(sec, text) { var h = sec && sec.querySelector('h2'); if (h) h.textContent = text; }

  L.wrap('home', function (root, ctx) {
    var page = root.querySelector('.ss-home'); if (!page) return;
    page.setAttribute('data-hv', '');
    DROP.forEach(function (k) { page.querySelectorAll(':scope > [data-home-section="' + k + '"]').forEach(function (s) { s.remove(); }); });
    // Small all-caps labels above headings go; the headings say it. The hero keeps its line (what the brand is), and
    // Proof, Reviews and FAQ keep theirs ("Proof, not promises", "Voices", "Before you order").
    page.querySelectorAll(':scope > section .ez-k').forEach(function (n) {
      if (KEEP_LABEL.indexOf(n.closest('section').getAttribute('data-home-section')) === -1) n.remove();
    });
    // Proof and Reviews: the intro paragraphs stay trimmed, as agreed for Home's text.
    page.querySelectorAll('[data-home-section="proof"] .hx-lede, [data-home-section="proof"] .hp-checks li > span, [data-home-section="voices"] .ez-sec-head > p:not(.ez-k), [data-home-section="voices"] .ss-voices-how li > p').forEach(function (n) { n.remove(); });

    // 1 · Hero: headline, one line, one action.
    var hero = page.querySelector('[data-home-section="hero"]');
    if (hero) hero.querySelectorAll('.ez-lede, .ez-actions .x-link, .hk-facts-line').forEach(function (n) { n.remove(); });

    // 2 · Trust strip: four icons, said once.
    var strip = L.frag('<section class="hv-trust" data-home-section="trust-strip" aria-label="Why you can trust us"><ul>' +
      TRUST.map(function (t) { return '<li>' + icon(t[0]) + '<span>' + t[1] + '</span></li>'; }).join('') + '</ul></section>');
    if (hero) hero.after(strip);

    // 3 · The seven: bottle, name, icon chips, price, Add.
    var range = page.querySelector('[data-home-section="collection"]');
    if (range) {
      var split = range.querySelector('.hx-split');
      if (split) split.outerHTML = '<div class="hv-head"><h2 id="hr-range-t">Seven everyday essentials.</h2><a class="x-link" href="/shop">Shop all</a></div>';
      range.querySelectorAll('.hr-view, .hr-avail[data-state="in"]').forEach(function (n) { n.remove(); });
    }

    // 4 · Your day: three time-of-day cards (owner, 3 November 2026: "make it better"). Each product sits in its slot as
    // its cap, its name and its label icons; Creatine, taken at any one time, sits at noon with that tag.
    var day = page.querySelector('[data-home-section="everyday"]');
    setHead(day, 'When to take each one.');
    if (day && G && ctx && ctx.published) {
      day.querySelectorAll('.hx-lede, .hx-day-band, .hx-day-parts').forEach(function (n) { n.remove(); });
      var slots = { morning: [], noon: [], night: [] };
      ctx.published.forEach(function (p) {
        var w = G.facts(p).when; if (!w.length) return;
        if (w.length > 1) slots.noon.push([p, true]); else if (slots[w[0]]) slots[w[0]].push([p, false]);
      });
      day.appendChild(L.frag('<div class="hd-day">' + [['morning', 'Morning'], ['noon', 'Noon'], ['night', 'Night']].map(function (s) {
        var list = slots[s[0]];
        return '<article class="hd-slot hd-' + s[0] + '"><header><span class="hd-ic" aria-hidden="true">' + (G.IC[s[0]] || '') + '</span><h3>' + s[1] + '</h3>' +
          '<span class="hd-n">' + list.length + '</span></header><ul>' + list.map(function (x) {
            var p = x[0];
            return '<li style="' + ctx.capStyle(p) + '"><a href="/products/' + esc(p.id) + '"><img class="hd-cap" src="/web/media/renders/' + esc(p.id) + '-cap.webp" alt="" width="400" height="400" loading="lazy" decoding="async">' +
              '<span class="hd-txt"><span class="hd-name">' + esc(p.name) + (x[1] ? ' <em class="hd-tag">Any one time</em>' : '') + '</span>' + G.chips(p) + '</span></a></li>';
          }).join('') + '</ul></article>';
      }).join('') + '</div>'));
      // Inside a slot the time chip repeats the slot, so it goes.
      day.querySelectorAll('.hd-slot .gl-chip').forEach(function (c) { if (/^(Morning|Noon|Night|Any time)$/.test(c.textContent.trim())) c.remove(); });
    }

    // Voices: an honest empty state. The seven "first review will appear here" cards and the empty average hide until
    // a real review is published (home-v2-e.css); the three review rules carry icons.
    var voices = page.querySelector('[data-home-section="voices"]');
    if (voices) {
      voices.querySelectorAll('.ss-voices-how > li').forEach(function (li, i) {
        var n = li.querySelector('.ss-voices-step'); if (n) n.innerHTML = icon(['box', 'check', 'flag'][i] || 'check');
      });
    }

    // 5 · Check any bottle: three steps beside the lot disc and the lookup.
    var lot = page.querySelector('[data-home-section="lot"]');
    if (lot) {
      setHead(lot, 'Your bottle has a record.');
      lot.querySelectorAll('.ez-lot-copy > p:not(.ez-k)').forEach(function (n) { n.remove(); });
      var copy = lot.querySelector('.ez-lot-copy');
      if (copy) copy.appendChild(L.frag('<ol class="hv-steps">' + STEPS.map(function (s) { return '<li>' + icon(s[0]) + '<span>' + s[1] + '</span></li>'; }).join('') + '</ol>'));
    }

    // 6 · Close: the brand line once, and two ways on.
    var close = page.querySelector('[data-home-section="invitation"]');
    if (close) {
      close.querySelectorAll('.hx-invite-copy > p, .hx-invite-copy > ul').forEach(function (n) { n.remove(); });
      var ask = close.querySelector('.ez-actions .x-link');
      if (ask) { ask.setAttribute('href', '/story'); ask.textContent = 'Read our story'; }
    }

    var faq = page.querySelector('[data-home-section="faq"]');
    if (faq) {
      var label = faq.querySelector('.ez-k'), help = faq.querySelector('.ez-sec-head a');
      if (label) label.textContent = 'Good to know';
      setHead(faq, 'Your questions, answered.');
      if (help) help.textContent = 'Find more answers';
    }
    ORDER.forEach(function (k) { var s = page.querySelector(':scope > [data-home-section="' + k + '"]'); if (s) page.appendChild(s); });
  });
})();
