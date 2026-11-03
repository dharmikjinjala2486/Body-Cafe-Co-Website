/* Body Café Co. — Variant E · /super-sevens, rebuilt to the Page Flow Plan (owner approved, 3 November 2026).
   The brand's playful page: it should feel like opening a card pack, not reading a manual. Three parts:
   1 Hero · 2 Meet the seven (cards; the back keeps three facts) · 3 The rules.
   The rules are required guardrails and keep every word. Applies to /super-sevens only; the Shop's Cards view is untouched. */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE;
  if (!S || !S.themes || !S.themes.e || !L) return;
  var V = window.BCCVisualsE;
  var KEEP = ['Per serving', 'Serving', 'Pack'];

  L.wrap('notFound', function (root, ctx) {
    var cards = root.querySelector('.ss-page-cards'); if (!cards) return;
    var page = cards.parentNode; page.setAttribute('data-s7', ''); page.setAttribute('data-hv', '');
    page.querySelectorAll('.ez-k').forEach(function (n) { n.remove(); });

    // Reuse Home's balanced hero composition and responsive sizing, with an on-page card action.
    var oldHero = page.querySelector('.ss-page-head'), home = L.frag(S.themes.e.home(ctx)), hero = home.querySelector('.ht-hero');
    if (oldHero && hero) {
      hero.classList.add('s7-hero'); hero.removeAttribute('data-home-section');
      var saucer = hero.querySelector('.hk-saucer'); if (saucer) saucer.remove();
      var action = hero.querySelector('.ez-actions .x-btn');
      if (action) { action.setAttribute('href', '#ss-pc-t'); action.querySelector('span').textContent = 'Meet the seven'; }
      oldHero.replaceWith(hero);
    }

    // 2 · Meet the seven: the back of each card keeps amount, serving and pack; the line says when.
    var ch = cards.querySelector('h2'); if (ch) ch.textContent = 'Meet the seven.';
    cards.querySelectorAll('.ss-card-facts > div').forEach(function (row) {
      var dt = row.querySelector('dt'); if (dt && KEEP.indexOf(dt.textContent.trim()) === -1) row.remove();
    });
    // A quiet front: bottle and name, with its nickname in the coloured bottom strip.
    cards.querySelectorAll('.ss-card').forEach(function (card) {
      var nickname = card.querySelector('.ss-card-nick'), foot = card.querySelector('.ss-card-front .ss-card-foot');
      if (nickname && foot) foot.textContent = nickname.textContent;
      card.querySelectorAll('.ss-card-band, .ss-card-nick, .ss-card-corner, [data-ss-flip], [data-ss-save]').forEach(function (n) { n.remove(); });
      // The card itself remains operable by touch and keyboard without a separate Flip button.
      var face = card.querySelector('.ss-card-in'), name = card.querySelector('.ss-card-front .ss-card-name');
      if (face) {
        face.tabIndex = 0;
        face.setAttribute('role', 'button');
        face.setAttribute('aria-label', 'Turn the ' + (name ? name.textContent : '') + ' card');
        face.setAttribute('aria-pressed', 'false');
      }
    });

    // The number explainer is removed from this page.
    var numbers = page.querySelector('.ss-page-seg'); if (numbers) numbers.remove();

    // 4 · The rules: each one marked with a no-sign, words unchanged.
    if (V) page.querySelectorAll('.ss-rules .ss-rule-n').forEach(function (n) { n.outerHTML = '<span class="ss-rule-n s7-no">' + V.icon('no') + '</span>'; });
  });

  L.onEnhance(function (main, signal) {
    main.querySelectorAll('[data-s7] .ss-card-in').forEach(function (face) {
      face.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); face.click(); }
      }, { signal: signal });
    });
    // This listener runs after the shared card listener on main has turned the card.
    main.addEventListener('click', function (e) {
      var face = e.target.closest('[data-s7] .ss-card-in');
      if (face) face.setAttribute('aria-pressed', String(face.closest('.ss-card').classList.contains('is-flipped')));
    }, { signal: signal });
  });
})();
