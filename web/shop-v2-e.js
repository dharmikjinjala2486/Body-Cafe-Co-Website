/* Body Café Co. — Variant E · Shop, rebuilt to the Page Flow Plan (owner approved, 3 November 2026).
   One job: pick and add to bag in under a minute. Three parts:
   1 "Shop the seven." heading · 2 Format filters with shapes + product cards (one view; owner removed the line-up, the "View as"
   switch and the time filter, 3 November 2026)
   3 "Not sure which one?" with one way to ask. The formats section goes: the filter row now shows each format's shape.
   Loaded last of the shop layers; filter, sort, compare and Add to bag behaviour are untouched. */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE;
  if (!S || !S.themes || !S.themes.e || !L) return;

  var SHAPE = { capsules: 'cap', softgels: 'gel', chews: 'chew' };

  L.wrap('shop', function (root) {
    var page = root.querySelector('.ezs'); if (!page) return;
    page.setAttribute('data-sv', '');

    // 1 · Header: the line-up of bottles carries it. The "07 Shop all seven" title goes from view (owner, 3 November
    // 2026); screen readers still get the page heading.
    page.querySelectorAll('.sp-kicker, .sp-intro .ss-h-num').forEach(function (n) { n.remove(); });
    // Later the same day the owner removed the bottle line-up too; a plain heading opens the page instead.
    page.querySelectorAll('.ss-shelfnav, .ez-index').forEach(function (n) { n.remove(); });
    var h1 = page.querySelector('.sp-intro h1');
    if (h1) {
      h1.textContent = 'Shop the seven.';
      h1.insertAdjacentHTML('afterend', '<p class="sv-sub">Seven everyday supplements. One cap colour each, every label fact in plain view.</p>');
    }

    // One view only: the product cards. The "View as" switch and the Super Sevens card view go.
    page.querySelectorAll('.ss-lens-bar, [data-ss-shop-cards]').forEach(function (n) { n.remove(); });
    page.querySelectorAll('[data-ss-shop-line]').forEach(function (n) { n.hidden = false; });

    // 2 · Filters: format only, each button showing its shape. "When to take it" goes (the card chips show it).
    page.querySelectorAll('.sp-times').forEach(function (n) { n.remove(); });
    page.querySelectorAll('.sp-legend > span').forEach(function (n) { n.remove(); });
    page.querySelectorAll('[data-sp-format]').forEach(function (b) {
      var k = SHAPE[b.getAttribute('data-sp-format')];
      if (k) b.insertAdjacentHTML('afterbegin', '<i class="gl-u gl-u-' + k + '" aria-hidden="true"></i>');
    });

    // Cards: bottle, name, pack, icon chips, price, Add. The number/format line repeats the chips, and the card
    // itself opens the product, so those go; "In stock" shows only when it isn't.
    page.querySelectorAll('.sp-card').forEach(function (card) {
      card.querySelectorAll('.sp-meta, .sp-view, .sp-avail[data-state="in"]').forEach(function (n) { n.remove(); });
    });

    // The formats section is now the filter row.
    var formats = page.querySelector('#shop-formats'); if (formats) formats.remove();

    // 3 · Help: one question, one way to ask.
    var help = page.querySelector('#shop-help');
    if (help) {
      help.querySelectorAll('.sp-k, .sp-policies, .sp-btn.is-quiet').forEach(function (n) { n.remove(); });
      var h = help.querySelector('h2'); if (h) h.textContent = 'Not sure which one?';
      var ask = help.querySelector('.sp-btn span'); if (ask) ask.textContent = 'Ask us';
    }
  });
})();
