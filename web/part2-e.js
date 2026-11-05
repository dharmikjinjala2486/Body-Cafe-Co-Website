/* Body Café Co. — Variant E Part 2 · "One uncompromising standard" (rebuild from 4 Nov 2026).
   Only active when body[data-variant-e-part="2"]; Part 1 and every other variant fall through to their own renderers.
   The seven caps are the only decoration. No segment numerals. No manufacturer names anywhere.
   Plan: ~/.claude/plans/legal-label-details-indian-serialized-kurzweil.md */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE;
  if (!S || !S.themes || !S.themes.e || !L) return;
  var esc = L.esc;

  // Parts 3 and 4 build on this layer: they share the chrome, inner pages and turning bottles, and replace home, shop and
  // product with their own compositions (web/part3-e.js, web/part4-e.js).
  function on() { var v = document.body.dataset.variantEPart; return v === "2" || v === "3" || v === "4"; }
  // Replace a renderer for Part 2 only. L.replace falls back to the Part 1 pipeline if the Part 2 renderer throws.
  function part2(name, fn) {
    var base = S.themes.e[name];
    if (typeof base !== "function") return;
    L.replace(name, function () { return on() ? fn.apply(this, arguments) : base.apply(this, arguments); });
  }

  /* Bottle renders: transparent, tightly cropped fronts. Sizes keep layout stable while images load. */
  var BOTTLE = {
    "creatine-chews": [470, 886], "iron-bisglycinate": [536, 815], "l-theanine": [538, 810], "myo-d-chiro-inositol": [471, 887],
    "omega-3-fish-oil": [470, 884], "psyllium-husk": [470, 881], "vitamin-d3-k2": [662, 996],
  };
  function bottle(p, o) {
    o = o || {};
    var s = BOTTLE[p.id] || [500, 860];
    return '<img class="' + (o.cls || "p2-bottle") + '" src="/web/media/premium/front-' + esc(p.id) + '.webp" alt="' + esc(o.alt == null ? p.name : o.alt) + '" width="' + s[0] + '" height="' + s[1] + '"' + (o.eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async">';
  }
  function href(p) { return "/products/" + p.id; }
  function caps(ctx, cls) { return '<span class="p2-caps ' + (cls || "") + '" aria-hidden="true">' + ctx.catalog.map(function (p) { return '<i style="--cap:' + esc(p.color) + '"></i>'; }).join("") + "</span>"; }
  function fact(ctx, p) { return esc(p.subtitle || ctx.format[p.id] || ""); }

  /* ---------- Chrome: header, mobile menu, footer ---------- */
  var NAV = [["/shop", "Shop"], ["/standards", "Our standard"], ["/learn", "Learn"], ["/story", "Story"], ["/help", "Help"]];
  var MENU = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16M4 15h16"/></svg>';

  part2("chrome", function (ctx, content) {
    var path = ctx.path;
    var cur = function (h) { return path === h || path.indexOf(h + "/") === 0 ? ' aria-current="page"' : ""; };
    var F = window.BCCFooterE || {}, care = S.careGroups();
    var head =
      '<header class="p2-head"><a class="p2-logo" href="/" aria-label="Body Café Co. home"><img src="/web/media/brand-original.svg" alt="" width="456" height="443"></a>' +
      '<nav class="p2-nav" aria-label="Main">' + NAV.map(function (n) { return '<a href="' + n[0] + '"' + cur(n[0]) + ">" + n[1] + "</a>"; }).join("") + "</nav>" +
      '<div class="p2-tools"><button class="p2-icon" data-action="search" aria-label="Search">' + ctx.icon("search") + "</button>" +
      '<a class="p2-icon" href="/account" aria-label="Your account"' + cur("/account") + ">" + ctx.icon("user") + "</a>" +
      '<a class="p2-icon bag-link" href="/cart" aria-label="Bag, ' + ctx.count + ' items">' + ctx.icon("bag") + '<span class="p2-count" data-cart-count' + (ctx.count ? "" : " data-empty") + ">" + ctx.count + "</span></a>" +
      '<a class="p2-btn p2-btn-sm p2-head-shop" href="/shop">Shop</a>' +
      '<button class="p2-icon p2-menu menu-button" data-action="menu" aria-expanded="false" aria-controls="mobile-nav">' + MENU + '<span class="sr-only">Menu</span></button></div></header>' +
      caps(ctx, "p2-stripe");
    var mnav =
      '<nav id="mobile-nav" class="p2-mnav" hidden aria-label="Mobile"><ul class="p2-mnav-links">' +
      NAV.concat([["/reports", "Look up a lot"], ["/account", "Account"]]).map(function (n) { return '<li><a href="' + n[0] + '">' + n[1] + "</a></li>"; }).join("") + "</ul>" +
      '<ul class="p2-mnav-products">' + ctx.published.map(function (p) { return '<li><a href="' + href(p) + '"><i class="p2-dot" style="--cap:' + esc(p.color) + '"></i>' + esc(p.name) + "</a></li>"; }).join("") + "</ul></nav>";
    var foot =
      '<footer class="p2-foot"><div class="p2-foot-caps" aria-hidden="true">' + ctx.catalog.map(function (p) { return capImg(p); }).join("") + "</div>" +
      '<div class="p2-foot-grid" style="--p2-foot-cols:' + (2 + care.length) + '"><div class="p2-foot-brand"><img src="/web/media/brand-original.svg" alt="Body Café Co." width="456" height="443"><p>Seven supplements.<br>One uncompromising standard.</p></div>' +
      '<div><h2>Shop</h2><a href="/shop">All seven</a>' + ctx.published.map(function (p) { return '<a href="' + href(p) + '">' + esc(p.name) + "</a>"; }).join("") + "</div>" +
      '<div><h2>Know more</h2><a href="/standards">Our standard</a><a href="/learn">Learn</a><a href="/story">Story</a><a href="/reports">Look up a lot</a></div>' +
      care.map(function (g) { return "<div><h2>" + g.group + "</h2>" + g.items.map(function (x) { return '<a href="' + x[1] + '">' + x[0] + "</a>"; }).join("") + "</div>"; }).join("") + "</div>" +
      (F.LEGAL ? '<p class="p2-foot-legal">' + esc(F.LEGAL) + "</p>" : "") +
      '<p class="p2-foot-base"><span>© ' + new Date().getFullYear() + " " + esc(F.OWNER || "Body Café Co.") + "</span></p></footer>";
    return '<div class="eh eh-e p2">' + head + mnav + '<main id="main" tabindex="-1">' + content + "</main>" + foot + "</div>";
  });

  /* ---------- Home: promise → the seven → the standard → proof ---------- */
  var STANDARD = [
    ["Right form", "We choose the form first, then name it on the label: iron as bisglycinate, vitamin K2 as MK-7, omega-3 as triglycerides."],
    ["Exact dose, stated", "The amount in every serving is printed on the label, and on this site. Never a vague blend."],
    ["Every lot tested", "GMP-certified production and third-party testing. Every lot carries its own number."],
    ["Nothing hidden", "Full ingredients, nutrition and directions for all seven, on the pack and on this site."],
  ];

  function tile(ctx, p) {
    var ok = L.avail(p);
    return '<li class="p2-tile" style="--cap:' + esc(p.color) + '"><a class="p2-tile-media" href="' + href(p) + '" tabindex="-1" aria-hidden="true">' + bottle(p, { alt: "" }) + "</a>" +
      '<div class="p2-tile-body"><h3><a href="' + href(p) + '"><i class="p2-dot"></i>' + esc(p.name) + '</a></h3><p class="p2-fact">' + fact(ctx, p) + "</p>" +
      '<div class="p2-tile-foot"><span class="p2-price">' + ctx.money(p.price) + '</span><button class="p2-add" data-add="' + esc(p.id) + '" aria-label="Add ' + esc(p.name) + ' to bag"' + (ok ? "" : " disabled") + ">" + (ok ? "Add" : "Unavailable") + "</button></div></div></li>";
  }

  /* ---------- Images ----------
     Variant B's editorial scenes (web/media/editorial-b/) do not belong to E and are no longer drawn. New E images are
     commissioned in design-review/parts-2-3-rework-2026-11-04/IMAGE-BRIEF.md and saved to web/media/e/; list each delivered
     file in E_IMAGES (name without .webp: [width, height]) to switch it on. Until then only the real bottle and cap renders show. */
  var E_IMAGES = {};
  var WORLD = {}; // product id -> "pdp-<id>-why" once delivered
  var RULE_ART = ["standard-form", "standard-dose", "standard-tested", "standard-hidden"];
  function scene(path, o) {
    o = o || {}; var name = String(path).replace(/^e\//, ""), size = E_IMAGES[name];
    if (!size) return "";
    return '<img class="' + (o.cls || "p2-scene") + '" src="/web/media/e/' + esc(name) + '.webp" alt="' + esc(o.alt || "") + '" width="' + size[0] + '" height="' + size[1] + '"' + (o.eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async">';
  }
  function world(p, o) { return scene(WORLD[p.id] || "pdp-" + p.id + "-why", o); }
  function capImg(p, cls) { return '<img class="' + (cls || "p2-capimg") + '" src="/web/media/renders/' + esc(p.id) + '-cap.webp" alt="" width="400" height="400" loading="lazy" decoding="async">'; }
  // A bottle you can turn: front image first, the 24-frame sprite (6 × 4) swaps in once it has loaded.
  // Only the turning bottle: the first spin frame holds the place until the sprite loads, so no second image is ever drawn.
  function frame0(p, o) { return '<img class="p2-spin-poster" src="/web/media/spin/' + esc(p.id) + '-00.webp" alt="" width="520" height="860"' + (o.eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async">'; }
  function spin(p, o) {
    o = o || {};
    return '<div class="p2-spin ' + (o.cls || "") + '" data-p2-spin="' + esc(p.id) + '" tabindex="0" role="img" aria-label="' + esc(p.name) + ' bottle. Drag or use the arrow keys to turn it.">' +
      '<span class="p2-spin-sprite" aria-hidden="true"><i class="p2-spin-blend"></i></span>' + (o.only ? frame0(p, o) : bottle(p, { alt: "", eager: o.eager, cls: "p2-spin-poster" })) + "</div>";
  }

  /* ---------- Home building blocks, shared by Part 2 and Part 3 ---------- */
  var CLAIMS = ["FSSAI licensed", "GMP-certified production", "Third-party tested", "Lot number on every pack", "Free delivery from ₹1,499"];
  // The four rules, with what is in place now and what is still coming (never shown as done before it is).
  var PROOF = [
    ["Right form", "Named on every label.", "In place"],
    ["Exact dose, stated", "The amount per serving, on every label.", "In place"],
    ["Every lot tested", "GMP-certified production, third-party testing, a lot number on every pack.", "In place"],
    ["Nothing hidden", "Full label on every product page. Certificates and lot reports are being published here.", "Coming"],
  ];
  function article(id) { var C = window.BCCSupportContent; return C && C.ARTICLES ? C.ARTICLES.filter(function (a) { return a.id === id; })[0] : null; }
  function homeFaqs() {
    var a = function (id, q, fallback) { var x = article(id); return [q, x ? x.answer : fallback]; };
    return [
      ["What do the prices include?", "Prices are shown as MRP, inclusive of all taxes."],
      a("delivery-charges", "How much is delivery?", "Delivery is ₹75, free when the subtotal after discount is ₹1,499 or more."),
      ["When should I take a product?", "Follow the directions on your pack. Each product page shows the timing, serving size and whether to take it with food."],
      ["Where do I find my lot number?", "It is printed on the pack, separate from the barcode. Choose your product, enter the lot number, and see the record for that batch."],
      a("change-of-mind", "Can I return a product?", "We only take back items that arrived damaged, wrong, missing, faulty or expired."),
    ].filter(function (f) { return !MAKER.test(f[1]); });
  }
  function reviewsFor(id) { var V = window.BCCVoicesE; // Samples that say the dose is printed on the pack front are left out: the real fronts do not print it.
    return ((V && V.samples) || []).filter(function (r) { return (!id || r[0] === id) && !/on the front|right on the front/i.test(r[2] + " " + r[3]); }); }
  function stars(n) { var s = ""; for (var i = 1; i <= 5; i++) s += '<i class="' + (i <= n ? "is-on" : "") + '"></i>'; return '<span class="p2-stars" role="img" aria-label="' + n + ' out of 5">' + s + "</span>"; }
  function reviewSummary(list) {
    if (!list.length) return "";
    var avg = list.reduce(function (t, r) { return t + r[1]; }, 0) / list.length;
    return '<div class="p2-rsum"><b>' + avg.toFixed(1) + "</b>" + stars(Math.round(avg)) + "<span>" + list.length + " sample review" + (list.length === 1 ? "" : "s") + "</span></div>";
  }
  function reviewCard(ctx, r) {
    var p = ctx.product(r[0]); if (!p) return "";
    return '<li class="p2-review" style="--cap:' + esc(p.color) + '"><div class="p2-review-top">' + stars(r[1]) + '<span class="p2-sample">Sample</span></div><p class="p2-review-title">' + esc(r[2]) + "</p><blockquote><p>" + esc(r[3]) + "</p></blockquote>" +
      '<p class="p2-review-who"><b>' + esc(r[4]) + "</b> · " + esc(r[5]) + ' · <a href="' + href(p) + '"><i class="p2-dot"></i>' + esc(p.name) + "</a></p></li>";
  }
  var REVIEW_RULE = "Only customers whose order was delivered can review. Every rating is published, low ones too. Sample reviews fill this preview until real reviews arrive.";
  // Inline lot lookup: pick by cap, type the number. Submits as #home-lot (app.js opens /reports with the result).
  function lotForm(ctx, o) {
    o = o || {}; var list = ctx.catalog, first = list[0];
    return '<form id="home-lot" class="p2-lot ' + (o.cls || "") + '" data-p2-lot><div class="p2-lot-caps" role="group" aria-label="Choose your product">' + list.map(function (p, i) {
      return '<button type="button" data-p2-lotpick="' + esc(p.id) + '" aria-pressed="' + (i === 0) + '" aria-label="' + esc(p.name) + '" style="--cap:' + esc(p.color) + '">' + capImg(p) + "<span>" + esc(p.name) + "</span></button>";
    }).join("") + '</div>' +
      // Name of the chosen cap. Shown in Part 2 only; Parts 3 and 4 label their caps their own way.
      '<p class="p2-lot-now" data-p2-lot-now aria-hidden="true"' + (first ? ' style="--cap:' + esc(first.color) + '"' : "") + ">" + (first ? esc(first.name) : "") + '</p><select id="home-lot-product" name="product" hidden>' + list.map(function (p, i) { return '<option value="' + esc(p.id) + '" data-sample="' + esc(p.sample_lot || "DEMO-" + (i < 9 ? "0" : "") + (i + 1) + "-01") + '">' + esc(p.name) + "</option>"; }).join("") + "</select>" +
      '<label class="p2-lot-label" for="home-lot-number">Lot number on your pack</label><div class="p2-lot-row"><input id="home-lot-number" name="lot" placeholder="e.g. ' + esc((first && first.sample_lot) || "DEMO-01-01") + '" maxlength="60" required autocomplete="off"><button class="p2-btn' + (o.light ? " p2-btn-light" : "") + '" type="submit">Look up</button></div>' +
      '<p class="p2-lot-note">Not your order number or barcode. Preview records only: try <button type="button" class="p2-linkbtn" data-fill-lot>the sample lot</button>.</p>' + (first ? "" : "") + "</form>";
  }

  /* ---------- Part 2 home: hero → claims → products → transparency → lot record → reviews → FAQ ---------- */
  function columns(ctx, list) {
    return '<ul class="p2-cols">' + list.map(function (p, i) {
      var c = copy(p.id), ok = L.avail(p);
      return '<li class="p2-col" style="--cap:' + esc(p.color) + ";--on-cap:" + esc(ctx.onCap(p.color)) + '"' + (i === 0 ? ' data-open="true"' : "") + ">" +
        '<a class="p2-col-art" href="' + href(p) + '" tabindex="-1" aria-hidden="true">' + bottle(p, { alt: "" }) + "</a>" +
        '<div class="p2-col-body"><h3><a href="' + href(p) + '">' + esc(p.name).replace(/(\S+-\S+)/g, '<span class="p2-nobr">$1</span>') + "</a></h3>" + (c.headline ? '<p class="p2-col-line">' + esc(c.headline) + "</p>" : "") + '<p class="p2-col-fact">' + fact(ctx, p).replace(/(\S+-\S+)/g, '<span class="p2-nobr">$1</span>') + "</p>" +
        '<div class="p2-col-foot"><span class="p2-price">' + ctx.money(p.price) + '</span><button class="p2-add" data-add="' + esc(p.id) + '" aria-label="Add ' + esc(p.name) + ' to bag"' + (ok ? "" : " disabled") + ">" + (ok ? "Add" : "Unavailable") + "</button></div></div></li>";
    }).join("") + "</ul>";
  }
  part2("home", function (ctx) {
    var list = ctx.published, first = list[0], rv = reviewsFor().slice(0, 3);
    if (!first) return head({ title: "The seven are resting." });
    return '<div class="p2-home">' +
      /* 1 · Hero: words first, then the seven caps in a row. No bottle. */
      '<section class="p2-hero2c" data-p2-hero aria-labelledby="p2-hero-t">' +
      '<div class="p2-wrap p2-hc-copy"><p class="p2-eyebrow">The Super Sevens</p>' +
      '<h1 id="p2-hero-t"><b>Seven supplements.</b> <span><b>One uncompromising</b> <b>standard.</b></span></h1>' +
      '<div class="p2-actions"><a class="p2-btn" href="/shop">Shop the seven</a><a class="p2-link" href="/standards">Our standard</a></div></div>' +
      '<ul class="p2-hc-caps" aria-label="The seven">' + list.map(function (p, i) {
        return '<li style="--cap:' + esc(p.color) + ';--i:' + i + '"><a href="' + href(p) + '" data-p2-pick data-name="' + esc(p.name) + '" data-fact="' + fact(ctx, p) + '" data-color="' + esc(p.color) + '" aria-label="' + esc(p.name) + '">' + capImg(p) + '<span class="p2-hc-name">' + esc(p.name) + "</span></a></li>";
      }).join("") + "</ul>" +
      '<p class="p2-hc-now" aria-hidden="true"><strong data-p2-now-name></strong><small data-p2-now-fact></small></p></section>' +

      /* 2 · Trust claims stripe */
      '<div class="p2-claims" role="list" aria-label="Our assurances"><div class="p2-claims-track">' + [0, 1].map(function (k) { return CLAIMS.map(function (c, i) { return '<span role="listitem"' + (k ? ' aria-hidden="true"' : "") + '><i style="--cap:' + esc((ctx.catalog[i] || {}).color || "#999") + '"></i>' + c + "</span>"; }).join(""); }).join("") + "</div></div>" +

      /* 3 · Products: seven colour columns; one opens at a time */
      '<section class="p2-section p2-seven3" aria-labelledby="p2-seven-t"><div class="p2-wrap"><header class="p2-sec-head"><div><p class="p2-eyebrow">The range</p><h2 id="p2-seven-t">Seven. Each in its own colour.</h2></div>' +
      '<a class="p2-link" href="/shop">Shop all seven</a></header>' + columns(ctx, list) + "</div></section>" +

      /* 5 · Lot record */
      '<section class="p2-lotband" aria-labelledby="p2-lot-t"><div class="p2-wrap p2-lotband-in"><div><p class="p2-eyebrow">Lot record</p><h2 id="p2-lot-t">Every bottle carries a lot number.</h2><p>Choose your product by its cap, type the number from the pack, and see the record for that batch.</p></div>' + lotForm(ctx, { light: true }) + "</div></section>" +

      /* 6 · Testimonials */
      (rv.length ? '<section class="p2-section p2-voices" aria-labelledby="p2-voices-t"><div class="p2-wrap"><header class="p2-sec-head"><div><p class="p2-eyebrow">Reviews</p><h2 id="p2-voices-t">In their words.</h2></div>' + reviewSummary(reviewsFor()) + "</header>" +
        '<ul class="p2-reviews-list">' + rv.map(function (r) { return reviewCard(ctx, r); }).join("") + '</ul><p class="p2-fine">' + REVIEW_RULE + "</p></div></section>" : "") +

      /* 7 · FAQ */
      '<section class="p2-section p2-faq" aria-labelledby="p2-faq-t"><div class="p2-wrap p2-faq-in"><header><p class="p2-eyebrow">Good to know</p><h2 id="p2-faq-t">Questions, answered.</h2><a class="p2-link" href="/help">Visit Help</a></header>' +
      '<div class="p2-accs">' + homeFaqs().map(function (f) { return acc(esc(f[0]), para(f[1])); }).join("") + "</div></div></section>" +
      "</div>";
  });

  /* ---------- Shared pieces for inner pages ---------- */
  // Safety net for copy pulled from earlier layers: drop any sentence that names who makes a product.
  var MAKER = /manufactur|vebe|u-liva|asoj|lic\. no\.?\s*1(0017|0725|0721)|named on (every|the) pack|we name on/i;
  function clean(text) { return String(text || "").replace(/manufacturing lot/gi, "production lot").split(/(?<=[.!?])\s+/).filter(function (s) { return s && !MAKER.test(s); }).join(" "); }
  function head(o) {
    var text = (o.eyebrow ? '<p class="p2-eyebrow">' + o.eyebrow + "</p>" : "") + "<h1>" + o.title + "</h1>" + (o.lede ? '<p class="p2-lede">' + o.lede + "</p>" : "") + (o.extra || "");
    if (o.art) return '<header class="p2-wrap p2-page-head p2-page-head-art"><div class="p2-page-head-text">' + text + '</div><figure class="p2-page-art">' + o.art + "</figure></header>";
    return '<header class="p2-wrap p2-page-head">' + text + "</header>";
  }
  function sec(o, body) {
    return '<section class="p2-section ' + (o.cls || "") + '"' + (o.id ? ' id="' + o.id + '"' : "") + '><div class="p2-wrap"><header class="p2-sec-head"><div>' + (o.eyebrow ? '<p class="p2-eyebrow">' + o.eyebrow + "</p>" : "") + "<h2>" + o.title + "</h2></div>" + (o.note ? '<p class="p2-sec-note">' + o.note + "</p>" : "") + (o.link || "") + "</header>" + body + "</div></section>";
  }
  function acc(title, body, open) { return '<details class="p2-acc"' + (open ? " open" : "") + "><summary><span>" + title + '</span><i aria-hidden="true"></i></summary><div class="p2-acc-body">' + body + "</div></details>"; }
  function para(t) { return t ? "<p>" + esc(t) + "</p>" : ""; }
  function std(id) { var E = window.BCCStandardsE; return E && E.PRODUCTS ? E.PRODUCTS.filter(function (x) { return x.slug === id; })[0] || null : null; }
  function copy(id) { var C = window.BCCPdpE; return (C && C.P && C.P[id]) || {}; }
  function veg(p) { var d = String(p.dietary_suitability || ""); return /^vegetarian/i.test(d) ? true : /^non-vegetarian/i.test(d) ? false : null; }
  function dietMark(p) {
    var v = veg(p); if (v === null) return "";
    return '<span class="p2-diet ' + (v ? "is-veg" : "is-nonveg") + '"><i aria-hidden="true"></i>' + (v ? "Vegetarian" : "Non-vegetarian") + "</span>";
  }
  function formatOf(ctx, p) { return String(ctx.format[p.id] || ""); }
  function formatGroup(ctx, p) { var f = formatOf(ctx, p).toLowerCase(); return /softgel/.test(f) ? "Softgels" : /chew/.test(f) ? "Chews" : "Capsules"; }

  /* ---------- Shop: the seven, one quiet filter ---------- */
  function shopPage(ctx, title) {
    var list = ctx.published; // All seven in one grid; no format tabs.
    return '<div class="p2-shop">' + head({ eyebrow: "The Super Sevens", title: title || "Shop the seven.", lede: "Seven supplements, each made to one uncompromising standard.", art: scene("home-hero-lineup", { eager: true, alt: "The seven Body Café Co. bottles in a row" }) }) +
      '<div class="p2-wrap">' +
      '<ul class="p2-tiles p2-tiles-shop">' + list.map(function (p) { return tile(ctx, p); }).join("") + "</ul>" +
      '<p class="p2-shop-note">All prices are MRP, inclusive of all taxes. Delivery is free on orders of ₹1,499 or more.</p></div></div>';
  }
  part2("shop", function (ctx) { return shopPage(ctx); });

  /* ---------- Product page: Part 1's content and order, kept short (owner, 4 Nov 2026) ----------
     Left: gallery, then Part 1's five sections as accordions (Description open). Right: the buy box, sticky.
     Below, full width and compact: lot report, customer reviews, recommended. No manufacturer details (owner decision);
     each fact is stated once inside its section. */
  function sentences(t) { return String(t || "").split(/(?<=[.!?])\s+/).map(function (x) { return x.trim(); }).filter(Boolean); }
  function norm(t) { return String(t || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
  function uniq(list) { var seen = {}; return list.filter(function (x) { var k = norm(x); if (!k || seen[k]) return false; seen[k] = 1; return true; }); }
  // "A, B (C, D), E." → a plain list, split on commas outside brackets.
  function otherIngredients(text) {
    var out = [], cur = "", depth = 0;
    String(text || "").replace(/\.\s*$/, "").split("").forEach(function (ch) {
      if (ch === "(" || ch === "[") depth++; else if (ch === ")" || ch === "]") depth = Math.max(0, depth - 1);
      if (ch === "," && !depth) { if (cur.trim()) out.push(cur.trim()); cur = ""; } else cur += ch;
    });
    if (cur.trim()) out.push(cur.trim());
    return out.length ? '<ul class="p2-dash">' + out.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "";
  }
  function dlist(rows) { rows = rows.filter(function (x) { return x[1]; }); return rows.length ? '<dl class="p2-dl">' + rows.map(function (x) { return "<div><dt>" + x[0] + "</dt><dd>" + esc(x[1]) + "</dd></div>"; }).join("") + "</dl>" : ""; }
  /* Product page copy (6 Nov 2026): short, and only what the label states. "claim" is the front-of-pack claim as printed;
     the points are label facts. How long a bottle lasts is worked out from servings_per_pack and added after them. */
  var PDP = {
    "omega-3-fish-oil": { desc: "Fish oil concentrate from anchovy, with its omega-3 kept in triglyceride form.",
      points: ["800 mg omega-3 per softgel", "400 mg EPA and 300 mg DHA", "Triglyceride form, from anchovy"] },
    "vitamin-d3-k2": { desc: "Three nutrients in one softgel: vitamin D3, vitamin K2 (MK-7) and omega-3 from anchovy fish oil.",
      points: ["600 IU vitamin D3", "55 mcg vitamin K2 as MK-7", "200 mg omega-3: 100 mg EPA and 75 mg DHA"] },
    "creatine-chews": { desc: "Creatine monohydrate in an orange chewable tablet. No powder, no shaker.",
      points: ["3,000 mg creatine monohydrate per serving", "Orange-flavoured chewable tablets"] },
    "iron-bisglycinate": { desc: "Iron as Ferrochel® ferrous bisglycinate chelate: iron bound to glycine.",
      points: ["29 mg elemental iron per capsule", "Ferrochel® chelate, neutrally charged", "Vegetarian capsule"] },
    "l-theanine": { desc: "L-Theanine, an amino acid naturally found in green tea.",
      points: ["200 mg L-Theanine per capsule", "Vegetarian capsule"] },
    "myo-d-chiro-inositol": { desc: "Myo-Inositol and D-Chiro Inositol in a 40:1 ratio, with each amount printed on the label.",
      points: ["2,000 mg Myo-Inositol per serving", "50 mg D-Chiro Inositol per serving", "40:1 Myo-to-D-Chiro ratio"] },
    "psyllium-husk": { desc: "Psyllium husk (isabgol) in capsules: a measured amount of fibre, with nothing to stir.",
      points: ["2,000 mg psyllium husk per serving", "1,578 mg dietary fibre, of which 1,362 mg soluble", "Vegetarian capsules"] },
  };
  part2("product", function (ctx, p) {
    var m = window.BCCEH.h.pdp(ctx, p), h = window.BCCEH.h, c = copy(p.id), front = p.label_front || {};
    var prem = function (name, w, hh, alt, eager) { return '<img src="/web/media/premium/' + esc(name) + '.webp" alt="' + esc(alt || "") + '" width="' + w + '" height="' + hh + '"' + (eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async">'; };
    // Gallery (6 Nov 2026): the bottle-on-cloth mockup first, then the cap close-up. The turning 3D bottle is gone from product pages.
    var shots = [
      { cls: "photo", main: prem(p.id + "-still", 1196, 1315, p.name + " bottle", true), thumb: prem(p.id + "-still", 1196, 1315), label: "Bottle" },
      { cls: "photo", main: prem(p.id + "-detail", 1800, 2400, p.name + " cap, close up"), thumb: prem(p.id + "-detail", 1800, 2400), label: "Cap, close up" },
    ];
    var serves = parseInt(p.servings_per_pack, 10);
    var timing = p.label_timing || {}, slots = [["morning", "Morning"], ["noon", "Noon"], ["night", "Night"]];
    var rows = (p.supplement_facts && p.supplement_facts.rows) || [];
    var cautions = uniq(sentences(p.warnings));
    var others = ctx.published.filter(function (x) { return x.id !== p.id; });
    var rv = reviewsFor(p.id);
    var avg = rv.length ? rv.reduce(function (t, r) { return t + r[1]; }, 0) / rv.length : 0;
    var pair = (Array.isArray(p.related_product_ids) ? p.related_product_ids.map(function (id) { return others.filter(function (x) { return x.id === id; })[0]; }).filter(Boolean) : m.related || others).slice(0, 2);
    var fbtItem = function (x, current) {
      return '<div class="p2-fbt-i' + (current ? " is-current" : "") + '" style="--cap:' + esc(x.color) + '">' + (current ? "" : '<label class="p2-fbt-check"><input type="checkbox" checked data-p2-fbt="' + esc(x.id) + '" data-price="' + (+x.price || 0) + '"' + (L.avail(x) ? "" : " disabled") + '><span class="sr-only">Add ' + esc(x.name) + "</span></label>") +
        '<a class="p2-fbt-img" href="' + href(x) + '">' + bottle(x, { alt: "" }) + '</a><div class="p2-fbt-t"><a href="' + href(x) + '">' + esc(x.name) + " · " + esc(formatOf(ctx, x)) + "</a><b>" + ctx.money(x.price) + "</b><small>Inclusive of all taxes</small></div></div>";
    };
    var fbt = pair.length ? '<section class="p2-section p2-fbt" data-p2-fbt-box data-self="' + esc(p.id) + '" data-self-price="' + (+p.price || 0) + '"><div class="p2-wrap"><div class="p2-fbt-card"><header><h2>Frequently bought with</h2><p>Complete your routine with products that sit well together</p></header>' +
      '<div class="p2-fbt-grid"><div class="p2-fbt-cur"><p class="p2-fbt-k">Current item selected</p>' + fbtItem(p, true) + '</div><span class="p2-fbt-plus" aria-hidden="true">+</span><div class="p2-fbt-list">' + pair.map(function (x) { return fbtItem(x); }).join("") + "</div></div>" +
      '<div class="p2-fbt-foot"><p>Your total: <b data-p2-fbt-total>' + ctx.money([p].concat(pair).reduce(function (n, x) { return n + (+x.price || 0); }, 0)) + '</b></p><button type="button" class="p2-btn" data-p2-fbt-add>Add these to your bag</button></div></div></div></section>' : "";

    var pc = PDP[p.id] || {}, lasts = serves ? "One bottle lasts " + serves + " days" : "";
    var points = (pc.points || []).concat(lasts ? [lasts] : []);
    var sections = [
      ["Description", '<h3 class="p2-acc-h">' + esc(c.headline || p.name) + "</h3>" + para(pc.desc || clean(c.intro || p.description))],
      ["Key Benefits", (front.claim ? '<p class="p2-claim">' + esc(front.claim) + "</p>" : "") +
        (points.length ? '<ul class="p2-ticks">' + points.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "")],
      ["Direction for Use", '<ol class="p2-slots">' + slots.map(function (s) { var t = String(timing[s[0]] || ""), best = /^best/i.test(t); return '<li class="' + (best ? "is-best" : "") + '"><span>' + s[1] + "</span><b>" + (best ? "Best" : t ? "Also fine" : "—") + "</b></li>"; }).join("") + "</ol>" +
        (p.directions ? '<p class="p2-use">' + esc(p.directions) + "</p>" : "") +
        (cautions.length || p.allergens ? '<p class="p2-small p2-cautions">' + esc(cautions.concat(p.allergens ? [String(p.allergens).trim()] : []).join(" ")) + "</p>" : "")],
      ["Supplement Facts", rows.length ? '<table class="p2-table p2-table-sm"><caption>Per ' + esc((p.supplement_facts && p.supplement_facts.serving) || p.serving_size || "serving") + " (approximate values)</caption><thead><tr><th scope=\"col\">Nutrient</th><th scope=\"col\">Amount</th><th scope=\"col\">% RDA</th></tr></thead><tbody>" +
        rows.map(function (r) { return '<tr class="lvl-' + (r.level || 0) + (r.active ? " is-active" : "") + '"><th scope="row">' + esc(r.name) + "</th><td>" + esc(r.amount) + "</td><td>" + esc(r.rda) + "</td></tr>"; }).join("") + '</tbody></table><p class="p2-small">%RDA as per ICMR 2020. # %RDA not established.</p>' : para(p.nutrition_information)],
      ["Other Ingredients", (p.other_ingredients ? '<p class="p2-others-p">' + esc(String(p.other_ingredients).trim()) + "</p>" : "")],
    ];

    return '<article class="p2-pdp p2-pdp3" style="--cap:' + esc(p.color) + '">' +
      '<div class="p2-capband" aria-hidden="true"></div>' +
      '<div class="p2-pdp-top"><div class="p2-wrap"><nav class="p2-crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/shop">Shop</a><span aria-hidden="true">/</span><span aria-current="page">' + esc(p.name) + "</span></nav>" +
      '<div class="p2-pdp-grid"><div class="p2-pdp-left">' +
      '<div class="p2-gallery"><div class="p2-gallery-main" data-p2-main>' + shots.map(function (s, i) { return '<figure class="p2-shot p2-shot-' + s.cls + '"' + (i ? " hidden" : "") + ' data-p2-shot="' + i + '">' + s.main + "</figure>"; }).join("") + "</div>" +
      '<div class="p2-thumbs" role="group" aria-label="Product images">' + shots.map(function (s, i) { return '<button type="button" data-p2-thumb="' + i + '" aria-pressed="' + (i === 0) + '" aria-label="' + s.label + '" class="p2-thumb-' + s.cls + '">' + s.thumb + "</button>"; }).join("") + "</div></div>" +
      '<div class="p2-accs p2-pdp-accs">' + sections.map(function (s) { return acc(s[0], s[1], s[2]); }).join("") + "</div></div>" +

      '<aside class="p2-buy" data-pk-scope aria-label="Buy ' + esc(p.name) + '"><div class="p2-buy-chips"><span class="p2-chip">' + esc(p.pack_size || formatOf(ctx, p)) + "</span>" + dietMark(p) + "</div>" +
      (rv.length ? '<a class="p2-buy-rating" href="#p2-reviews">' + stars(Math.round(avg)) + "<span>" + rv.length + " sample review" + (rv.length === 1 ? "" : "s") + "</span></a>" : "") +
      "<h1>" + esc(p.name) + '</h1><p class="p2-buy-sub">' + esc(String(p.subtitle || "").split(" · ").filter(function (x) { return !p.pack_size || x.trim().toLowerCase() !== String(p.pack_size).toLowerCase(); }).join(" · ")) + "</p>" +
      // Choose your pack (owner, 4 Nov 2026): the cards drive the hidden quantity select that add-product reads (web/packs-e.js).
      (window.BCCPacks ? window.BCCPacks.picker(p, { max: m.max, off: !!m.off, cls: "pk-p2", months: true }) : "") +
      // Price and Add to bag on one line.
      '<div class="p2-buy-line"><div class="p2-buy-price"><s class="p2-buy-was" data-pk-was hidden></s><strong data-pk-total>' + ctx.money(p.price) + "</strong><span>Inclusive of all taxes</span></div>" +
      '<div class="p2-buy-row" data-pd-buy><div class="sr-only" aria-hidden="true" inert>' + h.qtySelect(m, "p2-qty") + "</div>" + h.addMain(m, "p2-btn p2-buy-add") + "</div></div>" +
      (window.BCCPacks ? window.BCCPacks.pincode("pc-p2") : "") +
      '<ul class="p2-buy-notes"><li>' + esc(m.stockLine || "In stock") + '</li><li>Ships in 3–4 days</li><li>Free delivery on orders of ₹1,499 or more</li><li><a href="#p2-lot">Look up your lot online</a></li></ul>' +
      (m.off ? "" : '<button type="button" class="p2-btn p2-sticky-add" data-action="add-product" data-id="' + esc(p.id) + '">Add to bag · <span data-pk-total-page>' + ctx.money(p.price) + "</span></button>") +
      "</aside></div></div></div>" +

      /* Lot report */
      '<section class="p2-section p2-pdp-lot" id="p2-lot"><div class="p2-wrap p2-lot-band"><div><p class="p2-eyebrow">Lot report</p><h2>Check the lot printed on your pack.</h2><p>A lot report describes the sample tested from one production lot. Records appear as reports are published.</p></div>' + h.pdpLotForm(m, "p2-lotform") + "</div></section>" +

      /* Frequently bought with (Part 1's position: after the lot report) */
      fbt +

      /* Customer reviews */
      '<section class="p2-section p2-pdp-reviews" id="p2-reviews"><div class="p2-wrap"><header class="p2-sec-head"><div><p class="p2-eyebrow">Customer reviews</p><h2>' + (rv.length ? "What people say." : "Reviews open with the first deliveries.") + "</h2></div>" + reviewSummary(rv) + "</header>" +
      (rv.length ? '<ul class="p2-reviews-list">' + rv.slice(0, 3).map(function (r) { return reviewCard(ctx, r); }).join("") + "</ul>" : "") + '<p class="p2-fine">' + REVIEW_RULE + "</p></div></section>" +

      /* Recommended for you */
      sec({ cls: "p2-others", eyebrow: "Recommended for you", title: "The rest of the seven." }, '<ul class="p2-mini">' + others.map(function (o) { return '<li style="--cap:' + esc(o.color) + '"><a href="' + href(o) + '"><span class="p2-mini-media">' + bottle(o, { alt: "" }) + '</span><span class="p2-mini-name"><i class="p2-dot"></i>' + esc(o.name) + '</span><span class="p2-mini-price">' + ctx.money(o.price) + "</span></a></li>"; }).join("") + "</ul>") +
      "</article>";
  });

  /* ---------- Checkout (/checkout, 6 Nov 2026) ----------
     The shared form pieces (ctx.forms: field names, validation, the Place order button) inside Part 2's cards. The
     summary comes from a fresh server bag check (web/bag.js), and the form carries the total the customer saw, so the
     API can refuse an order whose price changed. Sample states (fx) and the static preview keep Variant E's page. */
  var baseCheckout = S.themes.e.checkout;
  function coMonths(p) { var d = window.BCCPacks ? window.BCCPacks.days(p) : 0; return !d ? "" : d % 30 === 0 ? (d / 30) + " month" + (d > 30 ? "s" : "") : d + " days"; }
  function coSummary(ctx, q) {
    var items = ctx.state.cart, code = window.BCCBag ? window.BCCBag.discount() : "";
    var line = function (i) {
      var p = ctx.product(i.id); if (!p) return "";
      var ql = q && q.lines.filter(function (x) { return x.id === i.id; })[0], m = coMonths(p);
      return '<li class="p2-co-line" style="--cap:' + esc(p.color) + '"><span class="p2-co-tile">' + bottle(p, { alt: "" }) + '<b class="p2-co-qty">' + i.quantity + "</b></span>" +
        '<span class="p2-co-name"><strong>' + esc(p.name) + "</strong><small>" + esc(p.pack_size || "") + (m ? " · " + (i.quantity > 1 ? i.quantity + " bottles, " : "") + "lasts " + (i.quantity > 1 ? coMonths({ servings_per_pack: (window.BCCPacks.days(p) * i.quantity) }) : m) : "") + "</small></span>" +
        '<span class="p2-co-price">' + (ql ? ctx.money(ql.line_total - (ql.pack_saving || 0)) : ctx.money(p.price * i.quantity)) + "</span></li>";
    };
    var issue = q && q.lines.some(function (l) { return l.status !== "ok"; });
    var rows = !q ? '<p class="p2-co-wait">Checking prices and stock…</p>' :
      '<div class="p2-co-row"><span>Subtotal</span><span>' + ctx.money(q.subtotal) + "</span></div>" +
      (q.pack_saving ? '<div class="p2-co-row is-save"><span>Pack saving</span><span>−' + ctx.money(q.pack_saving) + "</span></div>" : "") +
      (q.discount ? '<div class="p2-co-row is-save"><span>Code ' + esc(code) + "</span><span>−" + ctx.money(q.discount) + "</span></div>" : "") +
      '<div class="p2-co-row"><span>Delivery</span><span>' + (q.shipping ? ctx.money(q.shipping) : "Free") + "</span></div>" +
      '<div class="p2-co-row is-total"><span>Total</span><span>' + ctx.money(q.total) + '</span></div><p class="p2-co-note">' + esc(q.tax_note || "Prices are MRP, inclusive of all taxes.") + "</p>" +
      (issue ? '<p class="p2-co-issue" role="alert">Something in your bag changed. <a href="/cart">Review your bag</a> before placing the order.</p>' : "");
    return '<div class="p2-co-sum-head"><h2>Order summary</h2><a class="p2-link" href="/cart">Edit bag</a></div><ul class="p2-co-lines">' + items.map(line).join("") + "</ul>" + rows;
  }
  part2("checkout", function (ctx, fx) {
    if (fx || ctx.staticPreview) return baseCheckout.apply(this, arguments);
    if (!ctx.state.cart.length) return '<div class="p2-co"><div class="p2-wrap p2-co-empty"><p class="p2-eyebrow">Checkout</p><h1>Your bag is empty.</h1><p>Add something before checking out.</p><a class="p2-btn" href="/shop">Shop the seven</a></div></div>';
    var q = window.BCCBag && window.BCCBag.quote(), code = window.BCCBag ? window.BCCBag.discount() : "";
    var step = function (n, title, body) { return '<section class="p2-co-step" aria-labelledby="p2-co-s' + n + '"><h2 id="p2-co-s' + n + '"><span aria-hidden="true">' + n + "</span>" + title + "</h2>" + body + "</section>"; };
    return '<div class="p2-co"><header class="p2-wrap p2-co-head"><p class="p2-eyebrow">Checkout</p><h1>Checkout.</h1><p class="p2-co-lede">No account needed. Every order is prepaid.</p></header>' +
      '<div class="p2-wrap p2-co-grid"><form id="checkout-form" class="p2-co-form checkout-form" novalidate data-p2-co>' +
      (code ? '<input type="hidden" name="discount" value="' + esc(code) + '">' : "") +
      step(1, "Delivery details", ctx.forms.delivery({ mobile: (ctx.user && ctx.user.mobile) || "" })) +
      step(2, "Payment", ctx.forms.payment()) +
      step(3, "Review and place order", ctx.forms.confirm()) +
      '</form><aside class="p2-co-sum" data-p2-co-sum aria-label="Order summary">' + coSummary(ctx, q) + "</aside></div></div>";
  });
  // While ordering is paused (the store's checkout_enabled flag), Part 2 shows its own page; app.js asks for it.
  S.themes.e.checkoutPaused = function () {
    if (document.body.dataset.variantEPart !== "2") return undefined;
    return '<div class="p2-co"><div class="p2-wrap p2-co-empty"><div class="p2-co-caps" aria-hidden="true">' + (window.BCCApp ? window.BCCApp.catalog() : []).map(function (p) { return capImg(p); }).join("") + '</div><p class="p2-eyebrow">Checkout</p><h1>Ordering opens soon.</h1><p>Your bag is kept in this browser until then. You can still browse the seven and look up a batch report.</p><a class="p2-btn" href="/cart">Back to your bag</a></div></div>';
  };
  L.onEnhance(function (main, signal) {
    var form = main.querySelector("[data-p2-co]"), sum = main.querySelector("[data-p2-co-sum]");
    if (!form || !sum || !window.BCCBag || document.body.dataset.variantEPart !== "2") return;
    var ctx = { state: { cart: window.BCCApp.cart() }, product: function (id) { return window.BCCApp.catalog().filter(function (p) { return p.id === id; })[0]; }, money: function (n) { return "₹" + Number(n || 0).toLocaleString("en-IN"); } };
    var submit = form.querySelector("button[type=submit]");
    // Every field that needs attention is marked at once, before anything is sent (the API checks again).
    var RULES = [
      ["name", function (v) { return v.trim().length >= 2; }, "Enter the name for the delivery."],
      ["mobile", function (v) { return /^[6-9][0-9]{9}$/.test(v.replace(/\D/g, "")); }, "Enter a 10-digit mobile number starting with 6, 7, 8 or 9."],
      ["email", function (v) { return !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }, "Enter a valid email address, or leave it blank."],
      ["pincode", function (v) { return /^[1-9][0-9]{5}$/.test(v.trim()); }, "Enter a 6-digit pincode that doesn’t start with 0."],
      ["address", function (v) { return v.trim().length >= 5; }, "Enter your house or flat, street and area."],
      ["city", function (v) { return v.trim().length >= 2; }, "Enter your city."],
      ["state", function (v) { return v.trim().length >= 2; }, "Enter your state."],
    ];
    function mark(el, msg) {
      var box = el.closest(".field, .check") || el.parentElement, id = "p2-err-" + el.name, old = form.querySelector("#" + id);
      if (old) old.remove();
      el.removeAttribute("aria-invalid");
      if (box) box.classList.toggle("has-error", !!msg);
      if (!msg) return;
      var p = document.createElement("p"); p.className = "field-error"; p.id = id; p.textContent = msg;
      (el.type === "checkbox" ? box : el).insertAdjacentElement("afterend", p);
      el.setAttribute("aria-invalid", "true"); el.setAttribute("aria-describedby", id);
    }
    function validate() {
      var first = null;
      RULES.forEach(function (r) { var el = form.elements[r[0]]; if (!el) return; var bad = !r[1](el.value || ""); mark(el, bad ? r[2] : ""); if (bad && !first) first = el; });
      var adult = form.elements.adult; if (adult) { mark(adult, adult.checked ? "" : "Confirm the purchaser is 18 or older."); if (!adult.checked && !first) first = adult; }
      return first;
    }
    form.addEventListener("submit", function (e) {
      var first = validate();
      if (!first) return;
      e.preventDefault(); e.stopImmediatePropagation();
      var box = form.querySelector(".form-error"); if (box) box.textContent = "Some details need attention before the order can be placed.";
      first.focus();
    }, { capture: true, signal: signal });
    form.addEventListener("input", function (e) { var el = e.target; if (el.getAttribute && el.getAttribute("aria-invalid") === "true") { var r = RULES.filter(function (x) { return x[0] === el.name; })[0]; if (r ? r[1](el.value || "") : el.checked) mark(el, ""); } }, { signal: signal });
    window.BCCBag.check().then(function () {
      if (signal && signal.aborted) return;
      var q = window.BCCBag.quote(); ctx.state.cart = window.BCCApp.cart();
      sum.innerHTML = coSummary(ctx, q);
      if (!q) { var w = sum.querySelector(".p2-co-wait"); if (w) w.textContent = "We couldn’t check prices just now. Your order is checked again when you place it, and you’ll see any change before paying."; return; }
      // The total the customer is looking at travels with the order; the API refuses it if prices changed since.
      form.dataset.expectedTotal = String(q.total);
      var issue = q.lines.some(function (l) { return l.status !== "ok"; });
      if (submit) { submit.disabled = issue; var label = submit.querySelector("span"); if (label) label.textContent = "Place order · " + ctx.money(q.total); }
    });
  });

  /* ---------- Our standard ---------- */
  part2("standards", function (ctx) {
    var list = ctx.published;
    var rows = function (fn) { return '<ul class="p2-std-list">' + list.map(function (p) { var v = fn(p); return v ? '<li><a href="' + href(p) + '"><i class="p2-dot" style="--cap:' + esc(p.color) + '"></i><span>' + esc(p.name) + "</span></a><span>" + esc(v) + "</span></li>" : ""; }).join("") + "</ul>"; };
    var form = function (p) { var s = std(p.id); return s ? clean(s.form) : ""; };
    var dose = function (p) { var s = std(p.id); return s ? s.key + (s.serving ? " · " + s.serving : "") : p.subtitle; };
    var art = { form: RULE_ART[0], dose: RULE_ART[1], tested: RULE_ART[2], hidden: RULE_ART[3] };
    var block = function (id, title, text, extra) { return '<section class="p2-std" id="' + id + '"><div class="p2-std-copy"><figure class="p2-std-art">' + scene(art[id]) + "</figure><h2>" + title + "</h2><p>" + text + "</p></div><div class=\"p2-std-proof\">" + extra + "</div></section>"; };
    return '<div class="p2-standards">' + head({ eyebrow: "Our standard", title: "One uncompromising standard.", lede: "Seven supplements. Four rules we never bend. This is what they look like on every bottle.", art: scene("blogs/blog_evidence", { eager: true }) }) +
      '<div class="p2-wrap p2-std-wrap">' +
      block("form", "Right form", "We choose the form of each ingredient first, then name it on the label. Form decides what you are actually taking, so you should never have to guess it.", rows(form)) +
      block("dose", "Exact dose, stated", "The amount in every serving is printed on the label and on this site. Where two ingredients work together, you see both numbers.", rows(dose)) +
      block("tested", "Every lot tested", "Every product is made in GMP-certified facilities and third-party tested. Every lot carries its own number, so a record can be traced to the batch in your hand.",
        '<ul class="p2-std-status"><li><span class="is-done">In place</span>GMP-certified production for all seven</li><li><span class="is-done">In place</span>Third-party testing for every product</li><li><span class="is-done">In place</span>A lot number printed on every pack</li><li><span class="is-soon">Coming</span>Certificates and lot reports published on this site</li></ul><a class="p2-link" href="/reports">Look up your lot</a>') +
      block("hidden", "Nothing hidden", "Full ingredients, nutrition information, directions, storage and cautions for every product, on the pack and on its page here. No proprietary blends.",
        '<ul class="p2-std-links">' + list.map(function (p) { return '<li><a href="' + href(p) + '"><i class="p2-dot" style="--cap:' + esc(p.color) + '"></i>' + esc(p.name) + "<span>Read the label</span></a></li>"; }).join("") + "</ul>") +
      '<p class="p2-std-licence">Body Café Co. · FSSAI Lic. No. 10726994000121</p></div></div>';
  });

  /* ---------- Lot reports ---------- */
  part2("reports", function (ctx) {
    var pid = ctx.product(ctx.query.get("product")) ? ctx.query.get("product") : (ctx.published[0] || ctx.catalog[0]).id, cur = ctx.product(pid);
    var picker = '<div class="p2-picker report-product-picker" role="group" aria-label="Choose your product">' + ctx.catalog.map(function (p) {
      return '<button type="button" style="' + ctx.capStyle(p) + '" class="' + (p.id === pid ? "selected" : "") + '" data-report-product="' + p.id + '" aria-pressed="' + (p.id === pid) + '"><i class="p2-dot"></i><span>' + esc(p.name) + "</span></button>";
    }).join("") + "</div>";
    return '<div class="p2-reports report-page" style="--cap:' + esc(cur ? cur.color : "") + '">' + head({ eyebrow: "Lot record", title: "Look up your lot.", lede: "Choose your product, then type the lot number printed on the pack." }) +
      '<div class="p2-wrap p2-rep-grid"><div class="p2-rep-form"><p class="p2-step">Your product</p>' + picker + '<p class="p2-step">Lot number</p>' + ctx.forms.reportForm(pid, ctx.query.get("lot")) + "</div>" +
      '<aside class="p2-rep-aside"><figure>' + scene("blogs/blog_reports") + '</figure><h2>What a lot record shows</h2><ul><li>The product and the lot it belongs to.</li><li>What was tested on a sample from that lot, and how.</li><li>The result, with its units and limits.</li></ul><p class="p2-small">A record describes a tested sample from one lot. It does not promise a health outcome.</p>' +
      '<p class="p2-small"><strong>Not the order number.</strong> The lot number is printed on the pack, separate from the barcode.</p><a class="p2-link" href="/contact">Ask about a lot</a></aside></div></div>';
  });

  /* ---------- Story (also /about) ---------- */
  var FILM = '<video class="p2-film" muted loop playsinline autoplay preload="metadata" poster="/web/media/e/story-dawn.jpg" aria-hidden="true"><source src="/web/media/e/story-dawn.mp4" type="video/mp4"></video>';
  function storyPage(ctx) {
    var list = ctx.published;
    return '<div class="p2-story">' + head({ eyebrow: "Our story", title: "You should always know what you’re being served.", lede: "A good café shows you the menu. So do we." }) +
      // Until the seven-from-above image is delivered, the opener is twelve seconds of dawn on water (owner's footage, 4 Nov 2026).
      '<figure class="p2-wide">' + (scene("story-seven", { eager: true, alt: "The seven bottles from above" }) || FILM) + "</figure>" +
      '<div class="p2-wrap p2-prose"><h2>The front of the label shouts. The back whispers.</h2><p>Most supplement labels lead with promises and leave the facts in small print: which form the ingredient is in, how much you actually get, and when to take it. We turned that around.</p>' +
      "<h2>Seven, and only seven.</h2><p>We make seven supplements. Each one is an everyday essential, and each one is made the same way. A small range lets us hold every product to the same standard, and say exactly what is in it.</p>" +
      '<h2>One colour each.</h2><p>Every product has its own cap colour, so you can tell them apart at a glance on a shelf, in a bag, or half-awake in the morning.</p><ul class="p2-capnames">' + list.map(function (p) { return '<li><a href="' + href(p) + '">' + capImg(p) + "<span>" + esc(p.name) + "</span></a></li>"; }).join("") + "</ul>" +
      '<figure class="p2-prose-art">' + (scene("about/about_curiosity", { alt: "" }) || '<img src="/web/media/e/story-sky.webp" alt="" width="2560" height="1460" loading="lazy" decoding="async">') + "</figure>" +
      '<h2>How we work.</h2><ol class="p2-rules"><li><strong>Name the form.</strong> On the front, every time.</li><li><strong>State the amount.</strong> Per serving, in plain numbers.</li><li><strong>Make the routine obvious.</strong> When to take it, with what, and what to avoid.</li><li><strong>Test every lot.</strong> And print the lot number on every pack.</li></ol>' +
      '<div class="p2-actions p2-actions-left"><a class="p2-btn" href="/shop">Shop the seven</a><a class="p2-link" href="/standards">Our standard</a></div></div></div>';
  }
  part2("story", storyPage);
  part2("about", storyPage);

  var LEARN_BASE = S.themes.e.learn;
  /* ---------- Learn (index only; guides keep their own pages) ---------- */
  part2("learn", function (ctx, seg) {
    if (seg) return LEARN_BASE.apply(this, arguments);
    var guides = [["/learn/reading-a-label", "Read a label with confidence", "Serving sizes, ingredient names and the other details on a pack."], ["/learn/ingredient-forms", "Why ingredient forms matter", "Why the full ingredient name matters when you compare products."], ["/learn/understanding-reports", "What a lot record shows", "The difference between a product, a lot and a tested sample."]];
    var gArt = ["blogs/blog_label", "blogs/blog_forms", "blogs/blog_reports"];
    return '<div class="p2-learn">' + head({ eyebrow: "Learn", title: "Read the label. Know the form.", lede: "Short, plain guides to the seven and to reading any supplement label.", art: scene("learn/learn_hub", { eager: true }) }) +
      sec({ eyebrow: "The seven", title: "One guide for each." }, '<ul class="p2-guides">' + ctx.published.map(function (p) { return '<li style="--cap:' + esc(p.color) + '"><a href="/learn/' + p.id + '"><span class="p2-guide-media">' + world(p) + '<span class="p2-guide-bottle">' + bottle(p, { alt: "" }) + '</span></span><span class="p2-guide-copy"><strong>' + esc(p.name) + "</strong><span>" + esc(copy(p.id).headline || p.subtitle || "") + "</span></span></a></li>"; }).join("") + "</ul>") +
      sec({ eyebrow: "Guides", title: "Reading any label." }, '<ul class="p2-articles">' + guides.map(function (g, i) { return '<li><a href="' + g[0] + '"><figure>' + scene(gArt[i]) + "</figure><strong>" + g[1] + "</strong><span>" + g[2] + "</span></a></li>"; }).join("") + "</ul>") + "</div>";
  });

  /* ---------- Help (index only; articles and forms keep their own pages) ---------- */
  var HELP_BASE = S.themes.e.help;
  part2("help", function (ctx) {
    if (ctx.path !== "/help") return HELP_BASE.apply(this, arguments);
    var C = window.BCCSupportContent || {}, cats = C.CATEGORIES || [], arts = C.ARTICLES || [];
    var faqs = (ctx.faqs || []).filter(function (f) { return !MAKER.test(f[1]); });
    return '<div class="p2-help">' + head({ eyebrow: "Help", title: "How can we help?", lede: "Answers to common questions, and a real person when you need one.", art: scene("help-hands", { eager: true, alt: "Hands lifting a bottle out of its box" }) }) +
      '<div class="p2-wrap"><ul class="p2-quick"><li><a href="/account"><strong>Track an order</strong><span>See where your order is.</span></a></li><li><a href="/help/returns/something-wrong"><strong>Report an issue</strong><span>Damaged, wrong, missing or late.</span></a></li><li><a href="/reports"><strong>Look up a lot</strong><span>Find the record for your pack.</span></a></li><li><a href="/contact"><strong>Contact us</strong><span>care@bodycafeco.com</span></a></li></ul></div>' +
      (cats.length ? sec({ eyebrow: "Topics", title: "Browse by topic." }, '<ul class="p2-rows p2-rows-2">' + cats.map(function (c) { return '<li><a href="/help/' + c.id + '"><strong>' + esc(c.title) + "</strong><span>" + esc(c.blurb) + "</span></a></li>"; }).join("") + "</ul>") : "") +
      (faqs.length ? sec({ eyebrow: "Good to know", title: "Before you order." }, '<div class="p2-accs">' + faqs.map(function (f) { return acc(esc(f[0]), para(f[1])); }).join("") + "</div>") : "") + "</div>";
  });

  /* ---------- 404, and the retired /super-sevens page ---------- */
  part2("notFound", function (ctx) {
    if (/^\/super-sevens\/?$/.test(ctx.path)) return shopPage(ctx, "Meet the seven.");
    return '<div class="p2-404">' + head({ eyebrow: "Page not found", title: "One of the seven rolled away.", lede: "The page you were looking for isn’t here. The seven are.", art: scene("hero/collection-stage", { w: 900, h: 900, eager: true, alt: "An empty pedestal under a lilac arch" }) }) +
      '<div class="p2-wrap">' + caps(ctx, "p2-404-caps") + '<div class="p2-actions p2-actions-left"><a class="p2-btn" href="/shop">Shop the seven</a><a class="p2-link" href="/help">Help</a></div></div></div>';
  });

  /* Safety net for pages still drawn by Part 1 renderers (learn guides, help articles, policies, bag): no sentence that names
     who makes a product reaches the page. */
  function scrub(root) {
    var walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), hits = [], n;
    while ((n = walk.nextNode())) if (MAKER.test(n.nodeValue) || /manufacturing lot/i.test(n.nodeValue)) hits.push(n);
    hits.forEach(function (t) {
      t.nodeValue = clean(t.nodeValue);
      var el = t.parentElement;
      while (el && el !== root && !el.textContent.trim() && !el.querySelector("img, svg, input, button")) { var up = el.parentElement; el.hidden = true; el = up; }
    });
  }

  /* ---------- Turning bottles ----------
     Sprite: /web/media/spin/<id>-atlas.webp, 24 frames of 520 × 860 in a 6 × 4 grid. Frame 0 faces front. */
  var FRAMES = 24, COLS = 6, ROWS = 4, atlases = {};
  var still = function () { return matchMedia("(prefers-reduced-motion: reduce)").matches; };
  function atlas(id, cb) {
    var a = atlases[id];
    if (a && a.ok) return cb();
    if (!a) { a = atlases[id] = { ok: false, q: [] }; var im = new Image(); im.decoding = "async"; im.onload = function () { a.ok = true; a.q.forEach(function (f) { f(); }); a.q = []; }; im.src = "/web/media/spin/" + id + "-atlas.webp"; }
    a.q.push(cb);
  }
  function cell(f) { f = ((f % FRAMES) + FRAMES) % FRAMES; return (f % COLS) / (COLS - 1) * 100 + "% " + Math.floor(f / COLS) / (ROWS - 1) * 100 + "%"; }
  // Positions are fractional: the next frame fades in over the current one, so the turn reads as one motion, not 24 steps.
  function frame(el, f) {
    var base = Math.floor(f), mix = f - base;
    el._pos = f; el._f = ((Math.round(f) % FRAMES) + FRAMES) % FRAMES;
    var s = el.querySelector(".p2-spin-sprite"); if (!s) return;
    s.style.backgroundPosition = cell(base);
    var b = s.firstElementChild; if (b) { b.style.backgroundPosition = cell(base + 1); b.style.opacity = mix.toFixed(3); }
  }
  function arm(el) {
    var id = el.dataset.p2Spin;
    atlas(id, function () {
      if (el.dataset.p2Spin !== id) return; // switched product while loading
      var sp = el.querySelector(".p2-spin-sprite"), url = "url(/web/media/spin/" + id + "-atlas.webp)";
      sp.style.backgroundImage = url; if (sp.firstElementChild) sp.firstElementChild.style.backgroundImage = url;
      frame(el, el._f || 0); el.classList.add("is-ready");
      if (el._twirl) { el._twirl = false; setTimeout(function () { twirl(el); }, 120); }
    });
  }
  // Animate to a frame, then hand back to the crisp front render when it faces you.
  function turnTo(el, from, to, dur) {
    cancelAnimationFrame(el._raf); el.classList.add("is-turning");
    var t0 = performance.now();
    (function step(t) {
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); frame(el, from + e * (to - from));
      if (k < 1) el._raf = requestAnimationFrame(step); else if (el._f === 0) el.classList.remove("is-turning");
    })(t0);
  }
  // One full turn, easing out to the front: the bottle "presents" itself.
  function twirl(el) {
    if (still() || !el.classList.contains("is-ready")) return;
    var from = el._f || 0; turnTo(el, from, from > 0 ? FRAMES : FRAMES, 1200);
  }
  // Come to rest on the nearest whole frame, where the bottle was let go; facing front hands back to the crisp render.
  function settle(el) {
    var f = el._pos == null ? el._f || 0 : el._pos, to = Math.round(f);
    if (Math.abs(to - f) < 0.01) { frame(el, to); if (!el._f) el.classList.remove("is-turning"); return; }
    turnTo(el, f, to, 220);
  }
  /* Drag to turn. The pointer sets a target; the bottle eases toward it every frame, and a flick keeps it
     turning with friction. About one turn per two widths of the bottle, so small moves stay controllable. */
  function mountSpin(el, signal) {
    arm(el);
    var down = null, target = 0, vel = 0, last = 0, samples = [];
    function ppf() { return Math.min(22, Math.max(10, el.getBoundingClientRect().width / 14)); }
    function loop(t) {
      var dt = Math.min(48, t - (last || t)); last = t;
      var pos = el._pos == null ? el._f || 0 : el._pos;
      if (!down && vel) { target += vel * dt; vel *= Math.pow(0.93, dt / 16.7); if (Math.abs(vel) < 0.0015) vel = 0; }
      pos += (target - pos) * (1 - Math.pow(1 - 0.3, dt / 16.7));
      if (Math.abs(target - pos) < 0.002) pos = target;
      frame(el, pos);
      if (down || vel || pos !== target) el._raf = requestAnimationFrame(loop); else { last = 0; settle(el); }
    }
    function run() { cancelAnimationFrame(el._raf); last = 0; el._raf = requestAnimationFrame(loop); }
    el.addEventListener("dragstart", function (e) { e.preventDefault(); }, { signal: signal });
    el.addEventListener("pointerdown", function (e) {
      if (e.button) return;
      cancelAnimationFrame(el._raf);
      var pos = el._pos == null ? el._f || 0 : el._pos;
      down = { x: e.clientX, pos: pos, ppf: ppf() }; target = pos; vel = 0; samples = [{ t: e.timeStamp, x: e.clientX }];
      el.setPointerCapture(e.pointerId); el.classList.add("is-drag", "is-turning");
      el.dispatchEvent(new CustomEvent("p2-touch", { bubbles: true }));
      if (el.classList.contains("is-ready")) run();
    }, { signal: signal });
    el.addEventListener("pointermove", function (e) {
      if (!down) return;
      target = down.pos - (e.clientX - down.x) / down.ppf;
      samples.push({ t: e.timeStamp, x: e.clientX }); while (samples.length > 2 && e.timeStamp - samples[0].t > 90) samples.shift();
    }, { signal: signal });
    var up = function (e) {
      if (!down) return;
      var a = samples[0], b = samples[samples.length - 1], span = b.t - a.t;
      // A flick carries on; a slow release just stops. Capped so a hard flick is a couple of turns, not a blur.
      vel = !still() && span > 0 && (e && e.timeStamp - b.t < 60) ? Math.max(-0.06, Math.min(0.06, -(b.x - a.x) / span / down.ppf)) : 0;
      down = null; el.classList.remove("is-drag");
      if (el.classList.contains("is-ready")) run();
    };
    el.addEventListener("pointerup", up, { signal: signal }); el.addEventListener("pointercancel", up, { signal: signal });
    el.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault(); if (!el.classList.contains("is-ready")) return;
      var pos = el._pos == null ? el._f || 0 : el._pos;
      el.classList.add("is-turning"); vel = 0; target = Math.round(pos) + (e.key === "ArrowRight" ? 1 : -1); run();
    }, { signal: signal });
  }

  /* ---------- Home hero: pointing at a cap names it and tints the page ---------- */
  function mountHero(hero, signal) {
    var picks = [].slice.call(hero.querySelectorAll("[data-p2-pick]")), name = hero.querySelector("[data-p2-now-name]"), fct = hero.querySelector("[data-p2-now-fact]");
    function show(b) {
      picks.forEach(function (x) { x.classList.toggle("is-on", x === b); });
      hero.classList.add("has-pick"); hero.style.setProperty("--hc", b.dataset.color);
      name.textContent = b.dataset.name; fct.textContent = b.dataset.fact;
    }
    picks.forEach(function (b) {
      b.addEventListener("pointerenter", function () { show(b); }, { signal: signal });
      b.addEventListener("focus", function () { show(b); }, { signal: signal });
    });
    // Nothing is chosen until a cap is pointed at; the last one pointed at stays chosen.
    // The whole hero fits the first screen: size it to whatever sits above it (header, preview bar).
    function fit() { var top = Math.max(0, hero.getBoundingClientRect().top + window.scrollY); hero.style.setProperty("--p2-hc-u", Math.max(3.6, (window.innerHeight - top) / 100) + "px"); }
    fit(); window.addEventListener("resize", fit, { signal: signal });
  }

  /* Gallery thumbnails and shop filter. */
  L.onEnhance(function (main, signal) {
    if (!on()) return;
    scrub(main);
    main.querySelectorAll("[data-p2-spin]").forEach(function (el) { mountSpin(el, signal); });
    if (window.BCCPacks) window.BCCPacks.mount(main, signal); // pack cards on the product page (Parts 2, 3 and 4)
    var hero = main.querySelector("[data-p2-hero]"); if (hero) mountHero(hero, signal);
    var thumbs = main.querySelectorAll("[data-p2-thumb]");
    thumbs.forEach(function (b) {
      b.addEventListener("click", function () {
        var i = b.dataset.p2Thumb;
        main.querySelectorAll("[data-p2-shot]").forEach(function (s) { s.hidden = s.dataset.p2Shot !== i; });
        thumbs.forEach(function (t) { t.setAttribute("aria-pressed", String(t === b)); });
      }, { signal: signal });
    });
    main.querySelectorAll("[data-p2-lot]").forEach(function (form) {
      var sel = form.querySelector("#home-lot-product"), picks = form.querySelectorAll("[data-p2-lotpick]");
      picks.forEach(function (b) {
        b.addEventListener("click", function () {
          sel.value = b.dataset.p2Lotpick;
          picks.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
          form.style.setProperty("--cap", b.style.getPropertyValue("--cap"));
          var now = form.querySelector("[data-p2-lot-now]"); if (now) { now.textContent = b.getAttribute("aria-label"); now.style.setProperty("--cap", b.style.getPropertyValue("--cap")); }
          var input = form.querySelector("#home-lot-number"); if (input) input.placeholder = "e.g. " + sel.selectedOptions[0].dataset.sample;
        }, { signal: signal });
      });
    });
    var cols = [].slice.call(main.querySelectorAll(".p2-col"));
    cols.forEach(function (col) {
      var open = function () { cols.forEach(function (x) { if (x === col) x.setAttribute("data-open", "true"); else x.removeAttribute("data-open"); }); };
      col.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") open(); }, { signal: signal });
      col.addEventListener("focusin", open, { signal: signal });
    });
    main.querySelectorAll("[data-p2-fbt-box]").forEach(function (box) {
      var A = window.BCCApp || {};
      var total = function () { var sum = +box.dataset.selfPrice; box.querySelectorAll("[data-p2-fbt]:checked").forEach(function (c) { sum += +c.dataset.price; }); box.querySelector("[data-p2-fbt-total]").textContent = "₹" + sum.toLocaleString("en-IN"); };
      box.addEventListener("change", function (e) { if (e.target.matches("[data-p2-fbt]")) total(); }, { signal: signal });
      box.querySelector("[data-p2-fbt-add]").addEventListener("click", function () {
        var ids = [box.dataset.self]; box.querySelectorAll("[data-p2-fbt]:checked").forEach(function (c) { ids.push(c.dataset.p2Fbt); });
        var bad = ids.map(function (id) { return A.addToBag ? A.addToBag(id, 1) : { ok: false }; }).filter(function (r) { return !r || !r.ok; });
        if (A.toast) A.toast(bad.length ? (bad[0] && bad[0].message) || "Some items couldn't be added." : ids.length + " items added to your bag.");
      }, { signal: signal });
    });
    var filters = main.querySelectorAll("[data-p2-filter]");
    filters.forEach(function (b) {
      b.addEventListener("click", function () {
        var g = b.dataset.p2Filter;
        filters.forEach(function (f) { f.setAttribute("aria-pressed", String(f === b)); });
        main.querySelectorAll("[data-p2-format]").forEach(function (t) { t.hidden = !!g && t.dataset.p2Format !== g; });
      }, { signal: signal });
    });
  });

  /* Quiet scroll reveal; skipped entirely under reduced motion (CSS keeps everything visible). */
  L.onEnhance(function (main, signal) {
    if (!on() || !("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var els = main.querySelectorAll(".p2-section .p2-sec-head, .p2-tile, .p2-promises li, .p2-proof .p2-wrap");
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("p2-in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el, i) { el.classList.add("p2-reveal"); el.style.setProperty("--d", (i % 7) * 50 + "ms"); io.observe(el); });
    if (signal) signal.addEventListener("abort", function () { io.disconnect(); });
  });

  window.BCCPart2E = {
    on: on, part2: part2, bottle: bottle, caps: caps, capImg: capImg, spin: spin, scene: scene, world: world, tile: tile, fact: fact, href: href,
    head: head, sec: sec, acc: acc, FILM: FILM, otherIngredients: otherIngredients, para: para, clean: clean, std: std, copy: copy, dietMark: dietMark, formatOf: formatOf, formatGroup: formatGroup,
    STANDARD: STANDARD, BOTTLE: BOTTLE, MAKER: MAKER,
    CLAIMS: CLAIMS, PROOF: PROOF, homeFaqs: homeFaqs, reviewsFor: reviewsFor, reviewCard: reviewCard, reviewSummary: reviewSummary, stars: stars, REVIEW_RULE: REVIEW_RULE, lotForm: lotForm,
    // The sprite engine, for layers that drive a bottle themselves (Part 4 turns it with the scroll).
    FRAMES: FRAMES, atlas: atlas, frame: frame, arm: arm, turnTo: turnTo,
  };
})();
