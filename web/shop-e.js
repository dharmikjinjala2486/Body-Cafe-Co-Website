/* Body Café Co. — Variant E · Shop: compact cards and the time-of-day filter.
   From the owner-selected reference (design-review/story-source-2026-11-02/reference-index.html: products(), cardHTML(),
   PRODUCTS). The lede, card headlines and chips are verbatim except psyllium's fibre chip (final label value). Time groups
   follow each supplied label's own timing strip, so Creatine sits under Morning (its label marks Morning "Best"); the
   reference listed it under neither. Checked by design-tools/test-shop-e-content.mjs. Prices, stock and filters are untouched. */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE, PDP = window.BCCPdpE;
  if (!S || !S.themes || !S.themes.e || !L || !PDP) return;
  var esc = L.esc;

  var LEDE = "Every product below names its form, states its amount and tells you when to take it. Tap any one to see the full label.";
  var CHIPS = {
    "vitamin-d3-k2": ["D3 600 IU", "K2 55 mcg (MK-7)", "Softgel", "Morning, with food"],
    "omega-3-fish-oil": ["Omega-3 800 mg", "EPA 400 · DHA 300", "Triglyceride form", "Morning, with food"],
    "iron-bisglycinate": ["Iron 29 mg", "Ferrochel®", "Capsule", "Morning, empty stomach"],
    "psyllium-husk": ["Psyllium 2000 mg", "Fibre 1,578 mg", "5 capsules", "Night, with water"],
    "myo-d-chiro-inositol": ["Myo 2000 mg", "D-chiro 50 mg", "40:1", "Morning, with food"],
    "creatine-chews": ["Creatine 3000 mg", "Monohydrate", "Orange chewable", "One time daily"],
    "l-theanine": ["L-Theanine 200 mg", "Capsule", "Morning", "With or without food"],
  };
  var TIMES = {
    designs: ["e"], label: "When to take it", allLabel: "Any time",
    groups: [
      { id: "morning", label: "Morning", ids: ["vitamin-d3-k2", "omega-3-fish-oil", "iron-bisglycinate", "myo-d-chiro-inositol", "creatine-chews", "l-theanine"] },
      { id: "night", label: "Night", ids: ["psyllium-husk"] },
    ],
  };
  var ADAPTED = {
    psyllium: "Chip \"Fibre 1600 mg\" shows the label's 1,578 mg.",
    creatine: "Creatine is listed under Morning because its label marks Morning \"Best\"; the reference showed it under neither time.",
    times: "\"Any time\" (all products) and the legend \"When to take it\" label the group; the reference filter row had no legend.",
  };
  window.BCCShopTimes = TIMES;

  L.wrap("shop", function (root, ctx) {
    var page = root.querySelector(".ezs") || root.querySelector(".sp"); if (!page) return;
    var lede = page.querySelector(".sp-intro .sp-lede"); if (lede) lede.textContent = LEDE;
    page.querySelectorAll(".sp-card[data-sp-item]").forEach(function (li) {
      var id = li.getAttribute("data-sp-item");
      // Keep collection cards concise; amounts and directions belong on the product page.
      li.querySelectorAll('.sp-sub, .sp-facts, .sp-rating, .spx-headline, .spx-chips').forEach(function (node) { node.remove(); });
      var p = ctx.product(id), title = li.querySelector('.sp-name');
      var image = li.querySelector('.sp-media img');
      if (image && image.getAttribute('src') === '/web/media/' + id + '.webp') {
        image.setAttribute('src', '/web/media/bottles-normalized/' + id + '.svg');
        image.setAttribute('width', '720'); image.setAttribute('height', '1040');
      }
      if (p && title) title.after(L.frag('<p class="sp-pack">' + esc(p.pack_size || '') + '</p>'));

    });
  });

  window.BCCShopE = { LEDE: LEDE, CHIPS: CHIPS, TIMES: TIMES, ADAPTED: ADAPTED };
})();
