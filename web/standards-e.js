/* Body Café Co. — Variant E · Standards: science, side-by-side labels, forms and makers.
   Copy comes from the owner-selected reference site (design-review/story-source-2026-11-02/reference-index.html:
   science(), sourcing(), PRODUCTS, MAKERS, BRAND). It is reproduced verbatim except where the reference conflicts with
   the supplied master label or with what this site has published; each such change is listed in ADAPTED below and in
   design-review/OTHER-CONTENT-MAP-2026-11-02.md. Ingredient supplier and raw-material origin stay "Being confirmed". */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE, SS = window.BCCSuperSevens;
  if (!S || !S.themes || !S.themes.e || !L || !SS) return;
  var esc = L.esc;

  /* ---------------------------------------------------------------- Reference content */
  var SCIENCE = {
    eyebrow: "Science and quality",
    title: "What we can show you, and what we won't claim.",
    lede: "Science, for us, starts with honesty about what a supplement is. Our products are nutraceuticals: they are not medicines, and they are not intended to diagnose, treat, cure or prevent any disease. What we can do is make every product easy to understand and easy to check.",
    rules: [
      ["How we choose a form", "We pick the ingredient form for each product and name it on the label, so you can compare it with anything else on the shelf. Where a form needs particular directions, such as iron on an empty stomach, or D3 and K2 with food, those directions are on the bottle."],
      ["How products are made", "Each product is made in a GMP-certified facility in Gujarat by a manufacturer we name on the label: Asoj Soft Caps (Baroda), Vebe Lifecare (Baroda) and U-Liva Nutrition (Rajkot)."],
      ["How products are checked", "Every product carries the third-party tested mark on its label, and every bottle has a code that leads to more about what is inside."],
      ["How amounts are reported", "Each active ingredient has its own amount per serving. Where a recommended daily allowance exists, the %RDA follows ICMR 2020 guidelines and the label says which reference group it uses."],
    ],
    tableTitle: "Every label, side by side.",
    tableHead: ["Product", "Form", "Per serving", "Serving", "Made by"],
    cta: "Ask us anything",
  };
  var SOURCING = {
    eyebrow: "Ingredients and sourcing",
    title: "Every ingredient, and who makes the product.",
    lede: "Below is every active ingredient in our range, the form we use, and the manufacturer that makes the finished product. We are adding the origin of each raw material as supplier documents are confirmed, and we will update this page when we do.",
    explore: "Explore the forms.",
    labels: { form: "Ingredient form", per: "Per serving", made: "Finished product made by", supplier: "Ingredient supplier", origin: "Raw material origin", pending: "Being confirmed", more: "See the full product" },
    makersTitle: "Three makers, all in Gujarat.",
    marketer: "Marketed by Bluebell Lifecare Pvt. Ltd., Ahmedabad, Gujarat 380054, India. FSSAI Lic. No. 10726994000121.",
  };
  var MAKERS = {
    asoj: { name: "Asoj Soft Caps Pvt. Ltd.", place: "Baroda, Gujarat", lic: "10721024000068", what: "Softgels" },
    vebe: { name: "Vebe Lifecare Pvt. Ltd.", place: "Baroda, Gujarat", lic: "10725997000051", what: "Capsules and chewable tablets" },
    uliva: { name: "U-Liva Nutrition LLP", place: "Rajkot, Gujarat", lic: "10017021002540", what: "Capsules" },
  };
  // Reference PRODUCTS fields used here, in reference order. Amounts exclude sugar rows, as sourcing() does.
  var PRODUCTS = [
    { slug: "vitamin-d3-k2", name: "Vitamin D3 + K2", dose: "softgel", maker: "asoj", serving: "1 softgel", key: "600 IU D3 · 55 mcg K2",
      form: "Vitamin D3 (cholecalciferol); vitamin K2 as MK-7; in anchovy fish oil, omega-3 as triglycerides",
      amounts: [["Vitamin D3 (cholecalciferol)", "600 IU"], ["Vitamin K2 (as MK-7)", "55 mcg"], ["Fish oil concentrate (anchovy)", "250 mg"], ["Omega-3 as triglycerides", "200 mg"], ["EPA as TG", "100 mg"], ["DHA as TG", "75 mg"]],
      why: "Vitamin D3 is cholecalciferol. Vitamin K2 exists in several forms; we use MK-7, also called menaquinone-7, and we name it on the front of the pack. Because both vitamins are fat-soluble, they come dissolved in a softgel of anchovy fish-oil concentrate rather than a dry tablet, and the label asks you to take it with food. That oil is in triglyceride form and adds 200 mg of omega-3 per softgel, including 100 mg EPA and 75 mg DHA." },
    { slug: "omega-3-fish-oil", name: "Omega-3 Fish Oil", dose: "softgel", maker: "asoj", serving: "1 softgel", key: "800 mg omega-3",
      form: "Anchovy (Engraulis ringens) fish oil concentrate; omega-3 as triglycerides",
      amounts: [["Fish oil concentrate (anchovy)", "1000 mg"], ["Total omega-3 as triglycerides", "800 mg"], ["EPA as TG", "400 mg"], ["DHA as TG", "300 mg"]],
      why: "Omega-3s in fish oil are found as triglycerides. During concentration, fish oil can be converted into other forms, so the form on a label is worth reading. Ours is supplied as triglycerides, and the label says so. The source is anchovy (Engraulis ringens). We list the oil (1000 mg) and the omega-3 inside it (800 mg) separately, and break the omega-3 down into EPA (400 mg) and DHA (300 mg), so you can compare like with like." },
    { slug: "iron-bisglycinate", name: "Iron Bisglycinate", dose: "capsule", maker: "vebe", serving: "1 capsule", key: "29 mg iron",
      form: "Ferrochel® ferrous bisglycinate chelate",
      amounts: [["Iron (as Ferrochel® ferrous bisglycinate chelate)", "29 mg"]],
      why: "Ferrous bisglycinate chelate is iron bound to two molecules of glycine, an amino acid. Ferrochel® is a branded version of this form, and we name it on the front of the pack. The label states the elemental iron per capsule, 29 mg, so you know exactly how much iron you get rather than the weight of the compound. The label also explains when to take it and what to avoid alongside." },
    { slug: "psyllium-husk", name: "Psyllium Husk (Isabgol)", dose: "capsule", maker: "uliva", serving: "5 capsules", key: "2000 mg husk",
      form: "Psyllium husk (isabgol)",
      amounts: [["Psyllium husk (isabgol)", "2000 mg"], ["Dietary fibre", "1,578 mg"], ["Soluble fibre", "1,362 mg"]],
      why: "Psyllium husk, known in India as isabgol, is the outer coat of psyllium seeds and a familiar source of dietary fibre. Ours comes in capsules so each serving is the same: 2000 mg of husk across five capsules, giving 1,578 mg of dietary fibre, of which 1,362 mg is soluble. Because fibre needs water, the label asks for a full glass with every serving." },
    { slug: "myo-d-chiro-inositol", name: "Myo & D-Chiro Inositol", dose: "capsule", maker: "uliva", serving: "3 capsules", key: "2000 + 50 mg",
      form: "Myo-inositol + D-chiro-inositol, 40:1 ratio",
      amounts: [["Myo-inositol", "2000 mg"], ["D-chiro-inositol", "50 mg"]],
      why: "Inositol occurs in more than one form. Myo-inositol and D-chiro-inositol are two of them, and they are often combined. Because a combined total hides how much of each you get, we list them separately: 2000 mg of myo-inositol and 50 mg of D-chiro-inositol per three-capsule serving. The ratio, 40:1, is printed on the pack so you can compare like with like." },
    { slug: "creatine-chews", name: "Creatine Chews", dose: "chew", maker: "vebe", serving: "2 chewable tablets", key: "3000 mg creatine",
      form: "Creatine monohydrate",
      amounts: [["Creatine monohydrate", "3000 mg"]],
      why: "Creatine monohydrate is creatine bound to one molecule of water, and it is the form we use and name on the pack. Two chewable tablets deliver 3000 mg. Because the tablets are flavoured with orange, they contain dextrose and steviol glycosides, listed in full on the label. Creatine works through regular use, which is why the label stresses consistency over timing." },
    { slug: "l-theanine", name: "L-Theanine", dose: "capsule", maker: "uliva", serving: "1 capsule", key: "200 mg",
      form: "L-Theanine (naturally found in green tea)",
      amounts: [["L-Theanine", "200 mg"]],
      why: "L-theanine is an amino acid that occurs naturally in tea leaves, including green tea. In our capsule it is the only active ingredient: 200 mg per serving, with the supporting ingredients listed in full on the label (microcrystalline cellulose, magnesium stearate, silicon dioxide and an HPMC capsule). There is no blend, so the number on the label is the number you take." },
  ];
  /* Where this page departs from the reference, and why. Checked by design-tools/test-standards-e-content.mjs. */
  var ADAPTED = {
    checkedNote: "Test reports and certificates are not published on this site yet.",
    psyllium: "Psyllium fibre values follow the supplied final label (1,578 mg dietary, 1,362 mg soluble), not the reference (1600 mg, 400 mg).",
    omitted: ["The reference's fifth rule, \"How we write claims\", waits on the owner's decision about label claims.", "The reference's \"Held\" tag for L-Theanine waits on the owner's decision about its status."],
  };
  function doseWord(d) { return d === "softgel" ? "Softgel" : d === "capsule" ? "Capsule" : "Chewable tablet"; }

  /* ---------------------------------------------------------------- Markup */
  var ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13"/><path d="m13 6 6 6-6 6"/></svg>';
  function col(ctx, slug) { var p = ctx.product(slug); return p ? p.color : "#2d2926"; }
  function inCatalogueOrder(ctx) {
    return PRODUCTS.slice().sort(function (a, b) {
      var ia = ctx.catalog.findIndex(function (p) { return p.id === a.slug; }), ib = ctx.catalog.findIndex(function (p) { return p.id === b.slug; });
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
  }
  function science(ctx) {
    return '<section class="ssx-science" id="science" aria-labelledby="ssx-sci-t"><div class="ssx-sci-head"><p class="ez-k">' + esc(SCIENCE.eyebrow) + '</p><h2 id="ssx-sci-t">' + esc(SCIENCE.title) + '</h2><p class="ssx-lede">' + esc(SCIENCE.lede) + "</p></div>" +
      '<ol class="ssx-rules">' + SCIENCE.rules.map(function (r, i) {
        var p = ctx.catalog[i];
        return '<li style="--cap:' + (p ? p.color : "#2d2926") + '"><span class="ssx-rule-n" aria-hidden="true">' + SS.num(String(i + 1), { color: "var(--cap)", ghost: true, label: false }) + "</span><h3>" + esc(r[0]) + "</h3><p>" + esc(r[1]) + (i === 2 ? ' <span class="ssx-note">' + esc(ADAPTED.checkedNote) + "</span>" : "") + "</p></li>";
      }).join("") + "</ol></section>";
  }
  function sideBySide(ctx) {
    return '<section class="ssx-side" id="side-by-side" aria-labelledby="ssx-side-t"><h2 id="ssx-side-t">' + esc(SCIENCE.tableTitle) + "</h2>" +
      '<div class="ssx-tbl"><table><thead><tr>' + SCIENCE.tableHead.map(function (h) { return '<th scope="col">' + esc(h) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      inCatalogueOrder(ctx).map(function (p) {
        return '<tr style="--cap:' + col(ctx, p.slug) + '"><th scope="row"><a href="/products/' + esc(p.slug) + '"><span class="ssx-dot" aria-hidden="true"></span><b>' + esc(p.name) + "</b></a></th><td>" + esc(p.form) + '</td><td class="ssx-num">' + esc(p.key) + "</td><td>" + esc(p.serving) + "</td><td>" + esc(MAKERS[p.maker].name) + "</td></tr>";
      }).join("") + "</tbody></table></div>" +
      '<p class="ssx-cta"><a class="ss-pill is-solid" href="/contact"><span>' + esc(SCIENCE.cta) + "</span>" + ARROW + "</a></p></section>";
  }
  function sourcing(ctx) {
    var list = inCatalogueOrder(ctx), Lb = SOURCING.labels;
    return '<section class="ssx-sourcing" id="ingredients" aria-labelledby="ssx-src-t"><div class="ssx-sci-head"><p class="ez-k">' + esc(SOURCING.eyebrow) + '</p><h2 id="ssx-src-t">' + esc(SOURCING.title) + '</h2><p class="ssx-lede">' + esc(SOURCING.lede) + "</p></div>" +
      '<h3 class="ssx-h3" id="ssx-forms-t">' + esc(SOURCING.explore) + "</h3>" +
      '<div class="ssx-explorer" data-ssx-explorer><div class="ssx-xlist" role="tablist" aria-labelledby="ssx-forms-t">' + list.map(function (p, i) {
        return '<button type="button" role="tab" id="ssx-tab-' + esc(p.slug) + '" aria-controls="ssx-panel-' + esc(p.slug) + '" aria-selected="' + (i === 0) + '" tabindex="' + (i ? -1 : 0) + '" style="--cap:' + col(ctx, p.slug) + '"><span class="ssx-dot" aria-hidden="true"></span>' + esc(p.name) + "</button>";
      }).join("") + "</div>" +
      list.map(function (p, i) {
        var m = MAKERS[p.maker], live = ctx.product(p.slug);
        return '<div class="ssx-xpanel" role="tabpanel" id="ssx-panel-' + esc(p.slug) + '" aria-labelledby="ssx-tab-' + esc(p.slug) + '" tabindex="0" style="--cap:' + col(ctx, p.slug) + '"' + (i ? " hidden" : "") + ">" +
          '<div class="ssx-xhead">' + (live ? L.cap(ctx, live, "ssx-xcap") : "") + '<div><p class="ez-k">' + doseWord(p.dose) + "</p><h4>" + esc(p.name) + "</h4></div></div>" +
          '<p class="ssx-why">' + esc(p.why) + "</p>" +
          '<dl class="ssx-kv"><div><dt>' + Lb.form + "</dt><dd>" + esc(p.form) + "</dd></div>" +
          "<div><dt>" + Lb.per + "</dt><dd>" + p.amounts.map(function (a) { return esc(a[0] + ": " + a[1]); }).join("<br>") + "</dd></div>" +
          "<div><dt>" + Lb.made + "</dt><dd>" + esc(m.name) + ", " + esc(m.place) + "</dd></div>" +
          "<div><dt>" + Lb.supplier + '</dt><dd class="ssx-pending">' + Lb.pending + "</dd></div>" +
          "<div><dt>" + Lb.origin + '</dt><dd class="ssx-pending">' + Lb.pending + "</dd></div></dl>" +
          '<p><a class="ss-pill" href="/products/' + esc(p.slug) + '"><span>' + Lb.more + "</span>" + ARROW + "</a></p></div>";
      }).join("") + "</div>" +
      '<h3 class="ssx-h3">' + esc(SOURCING.makersTitle) + "</h3>" +
      '<div class="ssx-makers">' + Object.keys(MAKERS).map(function (k) {
        var m = MAKERS[k];
        return '<div class="ssx-maker"><p class="ssx-where">' + esc(m.place) + " · FSSAI Lic. " + m.lic + "</p><h4>" + esc(m.name) + '</h4><p class="ssx-what">' + esc(m.what) + "</p><ul>" +
          list.filter(function (p) { return p.maker === k; }).map(function (p) { return '<li style="--cap:' + col(ctx, p.slug) + '"><span class="ssx-dot" aria-hidden="true"></span>' + esc(p.name) + "</li>"; }).join("") + "</ul></div>";
      }).join("") + "</div>" +
      '<p class="ssx-marketer">' + esc(SOURCING.marketer) + "</p></section>";
  }

  L.wrap("standards", function (root, ctx) {
    var sx = root.querySelector(".ezx"); if (!sx) return;
    if (SS.cast) SS.cast(ctx);
    var hero = sx.querySelector(".ezx-hero"), chain = sx.querySelector(".ezx-chain"), source = sx.querySelector("#source");
    if (hero) hero.after(L.frag(science(ctx)));
    if (chain) chain.after(L.frag(sideBySide(ctx)));
    if (source) source.after(L.frag(sourcing(ctx)));
  });

  /* ---------------------------------------------------------------- Explorer tabs */
  L.onEnhance(function (main, signal) {
    var ex = main.querySelector("[data-ssx-explorer]"); if (!ex) return;
    var tabs = [].slice.call(ex.querySelectorAll('[role="tab"]')), panels = [].slice.call(ex.querySelectorAll('[role="tabpanel"]'));
    function pick(i, focus) {
      tabs.forEach(function (t, k) { t.setAttribute("aria-selected", String(k === i)); t.tabIndex = k === i ? 0 : -1; });
      panels.forEach(function (p, k) { p.hidden = k !== i; });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { pick(i); }, { signal: signal });
      t.addEventListener("keydown", function (e) {
        var cur = tabs.indexOf(document.activeElement), n = tabs.length, j = null;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") j = (cur + 1) % n;
        else if (e.key === "ArrowUp" || e.key === "ArrowLeft") j = (cur - 1 + n) % n;
        else if (e.key === "Home") j = 0;
        else if (e.key === "End") j = n - 1;
        if (j === null) return;
        e.preventDefault(); pick(j, true);
      }, { signal: signal });
    });
  });

  window.BCCStandardsE = { SCIENCE: SCIENCE, SOURCING: SOURCING, MAKERS: MAKERS, PRODUCTS: PRODUCTS, ADAPTED: ADAPTED };
})();
