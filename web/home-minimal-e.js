/* Body Café Co. — Variant E · minimal homepage (owner's team feedback, 3 November 2026: "too much clutter, too much text").
   Loaded after every other home layer. Five sections: hero, the seven, one proof strip, one story line, footer.
   The removed sections still live on their own pages (Standards, Story, Learn, Help, Lot reports). */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE;
  if (!S || !S.themes || !S.themes.e || !L) return;

  var DROP = ['trustbar', 'proof', 'lot', 'everyday', 'pour', 'voices', 'belief', 'trust', 'sourcing', 'learn', 'faq', 'invitation', 'curiosity', 'cards'];

  L.wrap('home', function (root) {
    var page = root.querySelector('.ss-home'); if (!page) return;
    page.setAttribute('data-hm', '');
    DROP.forEach(function (key) { page.querySelectorAll(':scope > [data-home-section="' + key + '"]').forEach(function (s) { s.remove(); }); });

    // Hero · headline, one line, one button.
    var hero = page.querySelector('[data-home-section="hero"]');
    if (hero) hero.querySelectorAll('.ez-lede, .ez-actions .x-link, .hk-facts-line').forEach(function (n) { n.remove(); });

    // The seven · number, image, name, price.
    var range = page.querySelector('[data-home-section="collection"]');
    if (range) {
      range.querySelector('.hx-split').outerHTML = '<div class="hm-head"><h2 id="hr-range-t">The seven.</h2><a class="x-link" href="/shop">Shop all</a></div>';
      range.querySelectorAll('.hr-band span:last-child, .hr-pack, .hr-avail, .hr-actions').forEach(function (n) { n.remove(); });
    }

    // Proof · one strip in place of six sections.
    page.appendChild(L.frag('<section class="hm-proof" data-home-section="proof" aria-label="Why you can trust us"><ul>' +
      '<li>FSSAI licensed</li><li>Every lot traceable</li><li>Plain labels</li></ul>' +
      '<p><a class="x-btn" href="/reports"><span>Check a lot</span></a><a class="x-link" href="/standards">Our standards</a></p></section>'));

    // Story · one line.
    page.appendChild(L.frag('<section class="hm-story" data-home-section="story" aria-labelledby="hm-story-t">' +
      '<h2 id="hm-story-t">You should always know what you’re being served.</h2><a class="x-link" href="/story">Read our story</a></section>'));
  });
})();
