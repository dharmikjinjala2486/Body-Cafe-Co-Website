/* Body Café Co. — Variant E · Voices, the homepage reviews section, redesigned (owner, 3 November 2026: "one of our main
   sections; make it the best"). Plus the phone layout for "Proof, not promises".

   Voices: a rating summary (average, stars, 5→1 bars), a featured review, product filter chips (the seven caps),
   review cards (stars, title, words, reviewer, product, date), and the three review rules as a slim trust row.

   SAMPLE REVIEWS: until real reviews exist, eight sample reviews fill the design — in PREVIEW releases only
   (window.BCCRelease.preview, the same rule as demo-content.js). Every one is tagged "Sample", none says "Verified",
   none claims a health effect or result (they speak about the label, format, taste, delivery and the lot lookup), and
   one is a 3-star review because low ratings are published too. They disappear by themselves when the reviews API
   returns real reviews (super-sevens.js replaces the list), and production builds never show them.
   REMOVE THE SAMPLES before launch by deleting the SAMPLES array. */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE;
  if (!S || !S.themes || !S.themes.e || !L) return;
  var esc = L.esc, V = window.BCCVisualsE;
  function icon(k) { return V ? V.icon(k) : ''; }
  var PREVIEW = !window.BCCRelease || window.BCCRelease.preview;

  // [product id, rating, title, words, first name, city, month]
  var SAMPLES = [
    ['iron-bisglycinate', 5, 'The iron number, right on the front', 'I used to work out how much iron I was actually getting. Here it is 29 mg, written plainly, and the label says to take it in the morning away from milk.', 'Ananya', 'Pune', 'Oct 2026'],
    ['l-theanine', 5, 'Simple label, simple routine', 'One capsule, 200 mg, with or without food. Nothing to decode, which is exactly what I wanted.', 'Meera', 'Ahmedabad', 'Oct 2026'],
    ['vitamin-d3-k2', 4, 'Glad it says non-veg up front', 'The softgel contains fish oil and gelatin, and the pack says so clearly. Other brands hid that in small print.', 'Nisha', 'Delhi', 'Oct 2026'],
    ['creatine-chews', 4, 'Orange, not chalk', 'Two chews, easy to remember. Tastes like orange rather than powder. I would like a bigger pack.', 'Kabir', 'Mumbai', 'Sep 2026'],
    ['omega-3-fish-oil', 5, 'Every number is there', 'EPA and DHA are both listed, with the total. The softgels are easy to swallow.', 'Rohan', 'Bengaluru', 'Sep 2026'],
    ['myo-d-chiro-inositol', 5, 'The 40:1 ratio, stated', 'I had read about the ratio before buying. Both amounts are on the label, so I did not have to guess.', 'Fatima', 'Hyderabad', 'Sep 2026'],
    ['psyllium-husk', 3, 'Clear label, but five capsules', 'Everything is explained, but five capsules at night is more than I expected. I would prefer a powder option.', 'Suresh', 'Jaipur', 'Aug 2026'],
    ['iron-bisglycinate', 4, 'Looked up my lot number', 'Typed the lot number from my bottle into the site and found its record. Delivery took four days.', 'Arjun', 'Kochi', 'Aug 2026']
  ];

  function stars(n, cls) { var s = ''; for (var i = 1; i <= 5; i++) s += '<i class="' + (i <= n ? 'is-on' : '') + '"></i>'; return '<span class="vv-stars ' + (cls || '') + '" role="img" aria-label="' + n + ' out of 5">' + s + '</span>'; }
  function card(ctx, x, featured) {
    var p = ctx.product(x[0]); if (!p) return '';
    return '<li class="ss-quote vv-card' + (featured ? ' is-featured' : '') + '" data-sample data-vv-product="' + esc(p.id) + '" style="' + ctx.capStyle(p) + '">' +
      '<div class="vv-top">' + stars(x[1]) + '<span class="vv-sample">Sample</span></div>' +
      '<p class="vv-title">' + esc(x[2]) + '</p><blockquote class="vv-text"><p>' + esc(x[3]) + '</p></blockquote>' +
      '<div class="vv-foot"><span class="vv-avatar" aria-hidden="true">' + esc(x[4].charAt(0)) + '</span><span class="vv-who"><b>' + esc(x[4]) + '</b><small>' + esc(x[5]) + ' · ' + esc(x[6]) + '</small></span>' +
      '<a class="vv-prod" href="/products/' + esc(p.id) + '"><img src="/web/media/renders/' + esc(p.id) + '-cap.webp" alt="" width="400" height="400" loading="lazy" decoding="async"><span>' + esc(p.name) + '</span></a></div></li>';
  }

  L.wrap('home', function (root, ctx) {
    var sec = root.querySelector('[data-home-section="voices"]'); if (!sec || !ctx || !ctx.product) return;
    sec.classList.add('vv');
    var head = sec.querySelector('.ez-sec-head'), list = sec.querySelector('.ss-voices-list'), how = sec.querySelector('.ss-voices-how');

    // The three review rules: a slim trust row under the reviews.
    if (how) { how.classList.add('vv-rules'); sec.appendChild(how); }
    var foot = sec.querySelector('.ez-sec-foot'); if (foot) sec.appendChild(foot);

    if (!PREVIEW || !list) return;
    // Summary from the samples, marked as such.
    var n = SAMPLES.length, sum = 0, dist = [0, 0, 0, 0, 0];
    SAMPLES.forEach(function (x) { sum += x[1]; dist[x[1] - 1]++; });
    var avg = (sum / n).toFixed(1);
    var summary = '<div class="vv-summary" data-vv-summary><div class="vv-avg"><b>' + avg + '</b>' + stars(Math.round(sum / n), 'is-big') +
      '<small>' + n + ' sample reviews</small></div><ol class="vv-dist" aria-label="Ratings">' + [5, 4, 3, 2, 1].map(function (r) {
        return '<li><span>' + r + '★</span><i style="--w:' + Math.round(dist[r - 1] / n * 100) + '%"></i><span>' + dist[r - 1] + '</span></li>';
      }).join('') + '</ol><p class="vv-note">Sample reviews for the design preview. Real, verified reviews replace them before launch.</p></div>';
    if (head) head.after(L.frag(summary));
    // Heading + summary share one left column that stays in view while the reviews scroll (owner, 3 November 2026),
    // and stops where the reviews end, above the review rules.
    if (head) {
      var side = document.createElement('div'); side.className = 'vv-side';
      var inner = document.createElement('div'); inner.className = 'vv-side-in'; side.appendChild(inner);
      head.before(side);
      [head, sec.querySelector('.vv-summary'), sec.querySelector('.ss-voices-stats')].forEach(function (n) { if (n) inner.appendChild(n); });
    }

    // Filter chips: All + the seven caps.
    var chips = '<div class="vv-filter" role="group" aria-label="Show reviews for"><button type="button" data-vv-pick="" aria-pressed="true">All</button>' +
      ctx.published.map(function (p) { return '<button type="button" data-vv-pick="' + esc(p.id) + '" aria-pressed="false" title="' + esc(p.name) + '"><img src="/web/media/renders/' + esc(p.id) + '-cap.webp" alt="" width="400" height="400" loading="lazy" decoding="async"><span class="sr-only">' + esc(p.name) + '</span></button>'; }).join('') + '</div>';
    list.before(L.frag(chips));
    list.innerHTML = SAMPLES.map(function (x, i) { return card(ctx, x, i === 0); }).join('');
    list.classList.add('vv-list');
    list.after(L.frag('<button type="button" class="vv-more" data-vv-more>Show all ' + n + ' reviews</button>'));
  });

  // Filter, "show all" on phones, and the Proof tiles on phones.
  L.onEnhance(function (main, signal) {
    var sec = main.querySelector('.vv');
    if (sec) {
      var picks = [].slice.call(sec.querySelectorAll('[data-vv-pick]'));
      picks.forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-vv-pick');
          picks.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          sec.querySelectorAll('[data-vv-product]').forEach(function (c) { c.hidden = !!id && c.getAttribute('data-vv-product') !== id; });
          sec.classList.toggle('is-filtered', !!id);
        }, { signal: signal });
      });
      var more = sec.querySelector('[data-vv-more]');
      if (more) more.addEventListener('click', function () { sec.classList.add('is-all'); more.hidden = true; }, { signal: signal });
    }
    main.querySelectorAll('[data-hp-tile]').forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.closest('article'), open = !a.classList.contains('is-open');
        a.parentNode.querySelectorAll(':scope > article.is-open').forEach(function (x) { x.classList.remove('is-open'); x.querySelector('[data-hp-tile]').setAttribute('aria-expanded', 'false'); });
        a.classList.toggle('is-open', open); b.setAttribute('aria-expanded', String(open));
      }, { signal: signal });
    });
  });

  /* Proof, not promises on phones: four tiles in a 2 × 2 grid; a tap opens that record full width. */
  var TILES = [['.hp-record', 'check', 'Licence record'], ['.hp-labels', 'record', 'Full labels'], ['.hp-checks', 'flask', 'Checks'], ['.hp-makers', 'factory', 'Makers']];
  L.wrap('home', function (root) {
    var grid = root.querySelector('[data-home-section="proof"] .hp-grid'); if (!grid) return;
    TILES.forEach(function (t) {
      var a = grid.querySelector(t[0]); if (!a) return;
      a.insertAdjacentHTML('afterbegin', '<button type="button" class="hp-tile" data-hp-tile aria-expanded="false">' + icon(t[1]) + '<span>' + t[2] + '</span><i aria-hidden="true"></i></button>');
    });
  });
})();
