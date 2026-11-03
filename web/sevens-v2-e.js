/* Body Café Co. — Variant E · /super-sevens, rebuilt to the Page Flow Plan (owner approved, 3 November 2026).
   The brand's playful page: it should feel like opening a card pack, not reading a manual. Same four parts, far fewer words:
   1 Hero · 2 Meet the seven (cards; the back keeps three facts) · 3 The digit (names move behind each number) · 4 The rules.
   The rules are required guardrails and keep every word. Applies to /super-sevens only; the Shop's Cards view is untouched. */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE;
  if (!S || !S.themes || !S.themes.e || !L) return;
  var V = window.BCCVisualsE;
  var KEEP = ['Per serving', 'Serving', 'Pack'];

  L.wrap('notFound', function (root) {
    var cards = root.querySelector('.ss-page-cards'); if (!cards) return;
    var page = cards.parentNode; page.setAttribute('data-s7', '');
    page.querySelectorAll('.ez-k').forEach(function (n) { n.remove(); });

    // 1 · Hero: the name and one line.
    var h1 = page.querySelector('.ss-page-head h1');
    if (h1 && !page.querySelector('.s7-sub')) h1.insertAdjacentHTML('afterend', '<p class="s7-sub">Seven caps. One number.</p>');

    // 2 · Meet the seven: the back of each card keeps amount, serving and pack; the line says when.
    var ch = cards.querySelector('h2'); if (ch) ch.textContent = 'Meet the seven.';
    cards.querySelectorAll('.ss-card-facts > div').forEach(function (row) {
      var dt = row.querySelector('dt'); if (dt && KEEP.indexOf(dt.textContent.trim()) === -1) row.remove();
    });

    // 3 · The digit: the drawing shows which caps light; the names move behind each number (hover, and screen readers).
    page.querySelectorAll('.ss-digits > li').forEach(function (li) {
      var who = li.querySelector('.ss-digit-who'); if (!who) return;
      li.setAttribute('title', who.textContent.trim());
      who.className = 'sr-only';
    });

    // 4 · The rules: each one marked with a no-sign, words unchanged.
    if (V) page.querySelectorAll('.ss-rules .ss-rule-n').forEach(function (n) { n.outerHTML = '<span class="ss-rule-n s7-no">' + V.icon('no') + '</span>'; });
  });
})();
