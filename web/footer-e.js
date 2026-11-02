/* Body Café Co. — Variant E · footer legal line from the owner-selected reference
   (design-review/story-source-2026-11-02/reference-index.html: footerHTML()). Verbatim; checked by
   design-tools/test-footer-e.mjs. E's preview notice and internal "Design states" link are removed (launch-ready). */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE;
  if (!S || !S.themes || !S.themes.e || !L) return;
  var esc = L.esc;

  var LEGAL = "Body Café Co. is a brand of Bluebell Lifecare Pvt. Ltd., Ahmedabad, Gujarat 380054, India. FSSAI Lic. No. 10726994000121. Nutraceuticals and health supplements are not for medicinal use and are not intended to diagnose, treat, cure or prevent any disease. Do not exceed the recommended dose. Not a substitute for a varied diet. Pregnant or lactating women and people under medical care should consult a healthcare professional before use.";
  var OWNER = "Bluebell Lifecare Pvt. Ltd.";

  L.wrap("chrome", function (root) {
    var row = root.querySelector(".e-footer .e-foot-legal"); if (!row) return;
    row.before(L.frag('<p class="sfe-legal">' + esc(LEGAL) + "</p>"));
    var c = row.querySelector("span");
    if (c && /^©/.test(c.textContent)) c.textContent = "© " + new Date().getFullYear() + " " + OWNER;
    // Launch-ready storefront: no preview notice and no internal "Design states" link.
    row.querySelectorAll("span").forEach(function (s) { if (s !== c) s.remove(); });
    row.querySelectorAll('a[href^="/preview/"]').forEach(function (a) { a.remove(); });
  });

  window.BCCFooterE = { LEGAL: LEGAL, OWNER: OWNER };
})();
