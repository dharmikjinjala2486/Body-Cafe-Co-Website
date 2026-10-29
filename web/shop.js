/* Body Café Co. — Shop (collection listing) for all eight directions (A–H).

   One content model, one section order and one behaviour; each direction composes the same sections in its own
   visual language (shop.css, scoped to .sp-a … .sp-h). This file replaces only each theme's `shop` renderer.

   Sections, in order:
     1 Compact collection introduction   2 Browse controls (format, availability, sort, active filters)
     3 The full collection                4 Capsules, softgels and chews   5 Standards and lot reports   6 Need a hand?

   State lives in the URL:  /shop?format=capsules,softgels&stock=in&sort=price-asc&design=e
   - format: one or more of capsules, softgels, chews (OR within the group). Older links (?format=Softgels,
     ?format=Chewable%20tablets) are understood. Unknown values match nothing and show the no-results state.
   - stock=in: only products with preview stock (AND with format).
   - sort: recommended (catalogue order, the default), price-asc, price-desc, name. "catalogue" is accepted.
   Changes update the page in place and push a history entry, so Back/Forward, refresh and shared links reopen the
   same view. app.js restores the scroll position when returning to Shop from a product page.

   Add to bag reuses the application's cart (window.BCCApp.addToBag → app.js add()), with its publication, stock and
   quantity limits. Content: only catalogue records and approved site copy. Pack sizes and servings are shown as
   awaiting the approved label; ratings appear only from published reviews; no offers, claims or scarcity. */
(function () {
  "use strict";
  var S = window.BCCSite;
  if (!S || !S.themes) return;

  /* ====================================================================================================
     1. CONTENT AND STATE
     ==================================================================================================== */
  var FORMATS = [
    { id: "capsules", label: "Capsules", value: "Capsules" },
    { id: "softgels", label: "Softgels", value: "Softgels" },
    { id: "chews", label: "Chews", value: "Chewable tablets" },
  ];
  var SORTS = [
    ["recommended", "Recommended"],
    ["price-asc", "Price: low to high"],
    ["price-desc", "Price: high to low"],
    ["name", "Name: A–Z"],
  ];
  var ALIAS = { capsule: "capsules", capsules: "capsules", softgel: "softgels", softgels: "softgels", chew: "chews", chews: "chews", "chewable tablets": "chews", "chewable-tablets": "chews", chewable: "chews" };
  var PENDING = "Awaiting approved label";

  var COPY = {
    lede: "Seven everyday supplements in capsules, softgels and chews. Each one shows its ingredient and format up front, and links to its label details and lot record.",
    note: "MRPs follow the current price sheet. Explore pack details and ingredient notes on each product page.",
    emptyTitle: "No products match these filters.",
    emptyText: "Try a different format, turn off “In stock only”, or show the whole collection.",
    formatsTitle: "Capsules, softgels and chews",
    formatsLede: "Format changes how you take a product, not what its label has to tell you. No format is better for everyone.",
    formats: {
      capsules: "A shell holding a dry fill, swallowed whole. Check the pack for the full ingredient and shell information.",
      softgels: "A soft, sealed shell holding a liquid fill, swallowed whole. Our softgel products carry oil-based ingredients.",
      chews: "Chewable tablets, chewed before swallowing. Read the pack for the full formulation and flavour details.",
    },
    formatsUnsure: "If you're unsure which format suits you, read the approved label and ask a pharmacist or doctor.",
    standardsTitle: "Standards and lot reports",
    standardsText: "Explore ingredient notes, formats and pack details on every product page. The lot number on a pack connects it to the record for its manufacturing batch.",
    standardsDemo: "Lot records in this preview are demonstrations. No laboratory document is connected yet.",
    helpTitle: "Need a hand?",
    helpText: "Questions about a product, an order or a delivery? Open a support case and we'll keep the whole conversation in one place.",
    helpPolicy: "Find delivery charges, demonstration timelines and return information on the policy pages.",
  };

  function formatId(ctx, p) {
    var v = String(ctx.format[p.id] || "").toLowerCase();
    return ALIAS[v] || v;
  }
  function parse(query) {
    var raw = (query.get("format") || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean);
    var formats = [], unknown = [];
    raw.forEach(function (x) {
      var k = x.toLowerCase();
      if (k === "all") return;
      var id = ALIAS[k];
      if (id) { if (formats.indexOf(id) < 0) formats.push(id); }
      else if (unknown.indexOf(x) < 0) unknown.push(x.slice(0, 40));
    });
    var sort = query.get("sort") || "recommended";
    if (sort === "catalogue") sort = "recommended";
    if (!SORTS.some(function (s) { return s[0] === sort; })) sort = "recommended";
    return { formats: formats, unknown: unknown, stock: query.get("stock") === "in", sort: sort };
  }
  function isDefault(st) { return !st.formats.length && !st.unknown.length && !st.stock && st.sort === "recommended"; }
  function hasFilters(st) { return !!(st.formats.length || st.unknown.length || st.stock); }

  /* Product facts for the listing. Order index is the catalogue order (the brand's numbered set, 01–07). */
  function items(ctx) {
    return ctx.published.map(function (p, i) {
      var r = p.rating || { count: 0, average: null };
      return {
        p: p, id: p.id, i: i, name: p.name, sub: p.subtitle || "", format: ctx.format[p.id] || "", fid: formatId(ctx, p),
        price: Number(p.price) || 0, available: p.published && p.stock > 0, rating: r && r.count > 0 && r.average != null ? r : null,
      };
    });
  }
  function matchFormat(st, x) { return !(st.formats.length || st.unknown.length) || st.formats.indexOf(x.fid) >= 0; }
  function matchStock(st, x) { return !st.stock || x.available; }
  function compute(st, list) {
    var shown = list.filter(function (x) { return matchFormat(st, x) && matchStock(st, x); });
    var order = list.slice();
    if (st.sort === "price-asc") order.sort(function (a, b) { return a.price - b.price || a.i - b.i; });
    else if (st.sort === "price-desc") order.sort(function (a, b) { return b.price - a.price || a.i - b.i; });
    else if (st.sort === "name") order.sort(function (a, b) { return a.name.localeCompare(b.name, "en") || a.i - b.i; });
    else order.sort(function (a, b) { return a.i - b.i; });
    /* Counts are faceted: each option shows how many results choosing it would give with the other group applied. */
    var counts = { all: list.filter(function (x) { return matchStock(st, x); }).length, stock: list.filter(function (x) { return x.available && matchFormat(st, x); }).length };
    FORMATS.forEach(function (f) { counts[f.id] = list.filter(function (x) { return x.fid === f.id && matchStock(st, x); }).length; });
    return { shown: shown, order: order, counts: counts, total: list.length };
  }
  function countText(r) {
    var n = r.shown.length;
    return n === r.total ? "Showing all " + r.total + " products" : "Showing " + n + " of " + r.total + " product" + (r.total === 1 ? "" : "s");
  }
  function sortLabel(id) { for (var i = 0; i < SORTS.length; i++) if (SORTS[i][0] === id) return SORTS[i][1]; return ""; }

  /* ====================================================================================================
     2. BUILDERS — semantic HTML with sp-* hooks; directions restyle these and never change facts.
     ==================================================================================================== */
  function h(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  var ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii"];

  function chips(st) {
    var out = st.formats.map(function (id) {
      var f = FORMATS.filter(function (x) { return x.id === id; })[0];
      return '<li><button type="button" class="sp-chip" data-sp-remove="format:' + id + '" aria-label="Remove filter: ' + f.label + '">' + f.label + '<span aria-hidden="true">×</span></button></li>';
    });
    st.unknown.forEach(function (u) {
      out.push('<li><button type="button" class="sp-chip is-unknown" data-sp-remove="format:' + h(u) + '" aria-label="Remove filter: ' + h(u) + ' (not a format in this range)">' + h(u) + ' <em>not in this range</em><span aria-hidden="true">×</span></button></li>');
    });
    if (st.stock) out.push('<li><button type="button" class="sp-chip" data-sp-remove="stock" aria-label="Remove filter: In stock only">In stock only<span aria-hidden="true">×</span></button></li>');
    return out.join("");
  }

  function controls(v, st, r) {
    var all = !(st.formats.length || st.unknown.length);
    var fmt = '<button type="button" class="sp-opt" data-sp-format="all" aria-pressed="' + all + '"><span class="sp-opt-l">All products</span> <span class="sp-n">' + r.counts.all + "</span></button>" +
      FORMATS.map(function (f) {
        var on = st.formats.indexOf(f.id) >= 0;
        return '<button type="button" class="sp-opt" data-sp-format="' + f.id + '" aria-pressed="' + on + '"><span class="sp-opt-l">' + f.label + '</span> <span class="sp-n">' + r.counts[f.id] + "</span></button>";
      }).join("");
    var sort = '<div class="sp-sort"><label for="sp-sort">Sort</label><select id="sp-sort" data-sp-sort>' + SORTS.map(function (s) { return '<option value="' + s[0] + '"' + (s[0] === st.sort ? " selected" : "") + ">" + s[1] + "</option>"; }).join("") + "</select></div>";
    var stock = '<label class="sp-stock"><input type="checkbox" data-sp-stock' + (st.stock ? " checked" : "") + '><span class="sp-stock-l">In stock only</span> <span class="sp-n" data-sp-n="stock">' + r.counts.stock + "</span></label>";
    return '<div class="sp-bar" role="group" aria-label="Filter and sort products">' +
      '<fieldset class="sp-formats"><legend class="sp-legend">Format <span>· choose any</span></legend><div class="sp-opts">' + fmt + "</div></fieldset>" +
      '<div class="sp-tools">' + stock + sort + "</div></div>" +
      '<div class="sp-state"><p class="sp-count" role="status" data-sp-count>' + countText(r) + "</p>" +
      '<ul class="sp-chips" data-sp-chips aria-label="Active filters">' + chips(st) + "</ul>" +
      '<button type="button" class="sp-clear" data-sp-clear' + (isDefault(st) ? " hidden" : "") + ">Clear all</button></div>";
  }

  function ratingLine(x) {
    if (!x.rating) return '<p class="sp-rating is-empty">Illustrative feedback</p>';
    var a = Number(x.rating.average), c = x.rating.count;
    return '<p class="sp-rating"><span class="sp-star" aria-hidden="true">★</span> <span>' + a.toFixed(1) + '<span class="sr-only"> out of 5</span> · ' + c + " review" + (c === 1 ? "" : "s") + "</span></p>";
  }
  function card(v, ctx, x, st, shown, lead, eager) {
    var p = x.p, href = "/products/" + p.id, w = (ctx.bottleWidth && ctx.bottleWidth[p.id]) || 720;
    var num = v.num ? v.num(x.i, ctx.published.length) : "No. " + pad(x.i + 1);
    var img = '<img src="' + window.BCCBottleAssets.url(p.id) + '" alt="" width="' + w + '" height="1000" decoding="async"' + (eager ? ' fetchpriority="high"' : ' loading="lazy"') + ">";
    if (ctx.design === "b" && window.BCCCatalogSecondary && window.BCCCatalogSecondary[p.id]) img += '<img class="sp-secondary" src="'+h(window.BCCCatalogSecondary[p.id])+'" alt="" width="'+w+'" height="1000" loading="lazy">';
    if (ctx.design === "a") img = S.cardBottlePicture(ctx, p);
    return '<li class="sp-card" data-sp-item="' + p.id + '" data-format="' + x.fid + '" data-price="' + x.price + '" data-i="' + x.i + '" data-available="' + x.available + '"' +
      (shown ? "" : " hidden") + (lead ? " data-lead" : "") + ' style="' + ctx.capStyle(p) + '">' +
      '<a class="sp-media" href="' + href + '" tabindex="-1" aria-hidden="true">' + (v.deco ? v.deco(x) : "") + '<span class="sp-plate">' + img + '<span class="sp-fallback">' + h(p.name) + "</span></span></a>" +
      '<div class="sp-body">' +
      '<p class="sp-meta"><span class="sp-num">' + num + '</span><span class="sp-format">' + h(x.format) + "</span></p>" +
      '<h3 class="sp-name"><a href="' + href + '">' + h(p.name) + "</a></h3>" +
      '<p class="sp-sub">' + h(x.sub) + "</p>" +
      '<dl class="sp-facts"><div><dt>Format</dt><dd>' + h(x.format) + '</dd></div><div><dt>Pack &amp; servings</dt><dd>' + (h(p.pack_size) || (window.BCCDemo && window.BCCDemo.packs[p.id]) || PENDING) + "</dd></div></dl>" +
      ratingLine(x) +
      '<div class="sp-buy"><p class="sp-price"><strong>' + ctx.money(p.price) + '</strong> <span>MRP</span></p>' +
      '<p class="sp-avail" data-state="' + (x.available ? "in" : "out") + '"><span class="sp-dot" aria-hidden="true"></span>' + (x.available ? "In stock" : "Out of stock") + "</p></div>" +
      '<div class="sp-actions"><a class="sp-view" href="' + href + '">View product<span class="sr-only">: ' + h(p.name) + "</span></a>" +
      '<button type="button" class="sp-add" data-sp-add="' + p.id + '"' + (x.available ? "" : " disabled") + ' aria-describedby="sp-msg-' + p.id + '"><span class="sp-add-l">' + (x.available ? "Add to bag" : "Out of stock") + '</span><span class="sr-only">: ' + h(p.name) + "</span></button></div>" +
      '<p class="sp-msg" id="sp-msg-' + p.id + '" data-sp-msg></p>' +
      "</div></li>";
  }
  function collection(v, ctx, st, r) {
    var firstShown = r.order.filter(function (x) { return r.shown.indexOf(x) >= 0; })[0];
    var cards = r.order.map(function (x, k) { return card(v, ctx, x, st, r.shown.indexOf(x) >= 0, x === firstShown, k < 2); }).join("");
    return '<section class="sp-collection" aria-labelledby="sp-collection-t"><h2 id="sp-collection-t" class="sr-only">The collection</h2>' +
      '<ol class="sp-grid" data-sp-grid>' + cards + "</ol>" +
      '<div class="sp-empty" data-sp-empty' + (r.shown.length ? " hidden" : "") + '><h3 class="sp-empty-t">' + COPY.emptyTitle + "</h3><p>" + COPY.emptyText + '</p><button type="button" class="sp-btn" data-sp-clear>Show all ' + r.total + " products</button></div>" +
      '<p class="sp-note">' + COPY.note + "</p></section>";
  }

  function block(v, id, n, title, inner) {
    var k = v.k ? v.k(n) : pad(n);
    return '<section class="sp-sec sp-sec-' + id + '" id="shop-' + id + '" aria-labelledby="shop-' + id + '-t"><div class="sp-sec-in"><header class="sp-head"><p class="sp-k">' + k + "</p><h2 id=\"shop-" + id + '-t">' + title + '</h2></header><div class="sp-sec-body">' + inner + "</div></div></section>";
  }
  function arrow(href, label, cls) { return '<a class="' + (cls || "sp-link") + '" href="' + href + '"><span>' + label + '</span><span class="sp-arr" aria-hidden="true">→</span></a>'; }
  function formatsSection(v, ctx, list) {
    var rows = FORMATS.map(function (f) {
      var names = list.filter(function (x) { return x.fid === f.id; }).map(function (x) { return h(x.name); });
      return '<li class="sp-fmt" data-fmt="' + f.id + '"><h3>' + (f.id === "chews" ? "Chews <small>(chewable tablets)</small>" : f.label) + '</h3><p>' + COPY.formats[f.id] + "</p>" +
        (names.length ? '<p class="sp-fmt-in"><span>In the range: </span>' + names.join(", ") + "</p>" : "") + "</li>";
    }).join("");
    return block(v, "formats", 1, COPY.formatsTitle, '<p class="sp-lead">' + COPY.formatsLede + '</p><ul class="sp-fmts">' + rows + '</ul><p class="sp-small">' + COPY.formatsUnsure + "</p>" +
      '<ul class="sp-links" aria-label="Guides">' + ["<li>" + arrow("/learn/reading-a-label", "Read a label with confidence") + "</li>", "<li>" + arrow("/learn/ingredient-forms", "Why ingredient forms matter") + "</li>", "<li>" + arrow("/learn", "Ingredient notes for all seven") + "</li>"].join("") + "</ul>");
  }
  function standardsSection(v) {
    return block(v, "standards", 2, COPY.standardsTitle, '<p class="sp-lead">' + COPY.standardsText + '</p><p class="sp-demo"><strong>Demonstration records.</strong> ' + COPY.standardsDemo + "</p>" +
      '<ul class="sp-links">' + ["<li>" + arrow("/standards", "Read our standards") + "</li>", "<li>" + arrow("/reports", "Look up a lot report") + "</li>", "<li>" + arrow("/standards#lot", "What a lot report can and can't show") + "</li>"].join("") + "</ul>");
  }
  function helpSection(v) {
    return block(v, "help", 3, COPY.helpTitle, '<p class="sp-lead">' + COPY.helpText + '</p><div class="sp-help-actions">' + arrow("/contact", "Contact support", "sp-btn") + arrow("/help", "Visit the help centre", "sp-btn is-quiet") + "</div>" +
      '<ul class="sp-links sp-policies" aria-label="Policies">' + ["<li>" + arrow("/policies/shipping", "Delivery and shipping") + "</li>", "<li>" + arrow("/policies/returns", "Returns") + "</li>"].join("") + '</ul><p class="sp-small">' + COPY.helpPolicy + "</p>");
  }

  function intro(v, ctx, list) {
    var n = list.length;
    var t = v.intro(ctx, n);
    return '<header class="sp-intro">' + (t.pre || "") + '<div class="sp-intro-text"><p class="sp-kicker">' + t.kicker + '</p><h1 class="sp-h1">' + t.title + '</h1><p class="sp-lede">' + COPY.lede + "</p></div>" + (t.post || "") + "</header>";
  }

  function compose(v, ctx) {
    var list = items(ctx);
    var st = parse(ctx.query);
    if (!list.length) {
      return '<div class="sp sp-' + v.key + '" data-sp data-sp-design="' + v.key + '"><header class="sp-intro"><div class="sp-intro-text"><h1 class="sp-h1">' + v.intro(ctx, 0).title + '</h1></div></header><div class="sp-empty"><h2 class="sp-empty-t">The collection isn\'t available right now.</h2><p>No products are published at the moment. Please check back soon, or contact support.</p>' + arrow("/contact", "Contact support", "sp-btn") + "</div></div>";
    }
    var r = compute(st, list);
    return '<div class="sp sp-' + v.key + '" data-sp data-sp-design="' + v.key + '">' +
      intro(v, ctx, list) + controls(v, st, r) + collection(v, ctx, st, r) +
      formatsSection(v, ctx, list) + standardsSection(v) + helpSection(v) +
      '<p class="sr-only" aria-live="polite" data-sp-announce></p></div>';
  }

  /* ====================================================================================================
     3. DIRECTIONS — the same content, composed in each direction's language.
     ==================================================================================================== */
  function swatches(ctx) { return '<span class="sp-swatches" aria-hidden="true">' + ctx.published.map(function (p) { return '<span style="--cap:' + p.color + '"></span>'; }).join("") + "</span>"; }
  var V = {
    /* A — State of Play: a product index. Electric blue on fog, a giant count, graph-paper specimen cells. */
    a: {
      key: "a",
      intro: function (ctx, n) { return { pre: '<span class="sp-giant" aria-hidden="true">' + pad(n) + "</span>", kicker: "BCC / Product index", title: "Shop all " + (n === 7 ? "seven" : n) + "." }; },
      num: function (i) { return "No. " + pad(i + 1); },
      k: function (n) { return "[" + pad(n) + "]"; },
    },
    /* B — Expressive everyday: a soft colour band, rounded fields in each cap colour, pill controls. */
    b: {
      key: "b",
      intro: function (ctx, n) { return { kicker: "The collection", title: "Meet the collection.", post: swatches(ctx) }; },
      num: function (i) { return pad(i + 1); },
    },
    /* C — Everyday Elsewhere: butter paper, Gloock serif, a record rack of arched sleeves, a red stamp. */
    c: {
      key: "c",
      intro: function (ctx, n) { return { post: '<span class="sp-stamp" aria-hidden="true">' + pad(n) + "<small>on the shelf</small></span>", kicker: "Body Café Co. / Catalogue 001–" + String(n).padStart(3, "0"), title: "Shop all <em>" + (n === 7 ? "seven" : n) + "</em>." }; },
      num: function (i, n) { return pad(i + 1) + " / " + pad(n); },
      k: function (n) { return "Side " + "ABC"[n - 1]; },
    },
    /* D — The Other Side: after hours. Midnight blue, lit vitrines, gold wall labels. */
    d: {
      key: "d",
      intro: function (ctx, n) { return { kicker: "Body Café Co. / The complete programme", title: "The collection.<br><em>Now showing.</em>" }; },
      num: function (i) { return "No. " + pad(i + 1); },
      k: function (n) { return "Room " + pad(n); },
    },
    /* E — Fan Deck: every product is a swatch card; the cap colour is the band at the top. */
    e: {
      key: "e",
      intro: function (ctx, n) { return { kicker: "Shop · " + n + " products", title: "Shop all " + (n === 7 ? "seven" : n), post: swatches(ctx) }; },
      num: function (i) { return pad(i + 1); },
      deco: function (x) { return '<span class="sp-band" aria-hidden="true"><span>' + pad(x.i + 1) + "</span><span>" + h(x.format) + "</span></span>"; },
      k: function (n) { return pad(n) + " / 03"; },
    },
    /* F — Edition: a printed contents page. Colour-field plates, ultralight names, italic deks, folios. */
    f: {
      key: "f",
      intro: function (ctx, n) { return { pre: '<p class="sp-folio"><span>Edition 01</span><span>Contents · ' + n + " products</span></p>", kicker: "The collection", title: "Meet the collection" }; },
      num: function (i) { return "No. " + pad(i + 1); },
      k: function (n) { return "Notes · " + pad(n); },
    },
    /* G — Darkroom: frames on a black wall; information develops in white beneath each one. */
    g: {
      key: "g",
      intro: function (ctx, n) { return { kicker: "The collection / " + n + " frames", title: "Shop" }; },
      num: function (i, n) { return "Frame " + pad(i + 1) + " / " + pad(n); },
      k: function (n) { return "Frame " + pad(n) + " / 03"; },
    },
    /* H — Folio: a reference index. Ruled entries, small plates, roman numerals in the margin. */
    h: {
      key: "h",
      intro: function (ctx, n) { return { kicker: "Catalogue · " + n + " entries", title: "The collection" }; },
      num: function (i) { return ROMAN[i] + "."; },
      k: function (n) { return "§ " + n; },
    },
  };

  Object.keys(V).forEach(function (d) {
    if (!S.themes[d]) return;
    var base = S.themes[d], next = {};
    Object.keys(base).forEach(function (k) { next[k] = base[k]; });
    next.shop = function (ctx) { return compose(V[d], ctx); };
    S.themes[d] = next;
  });

  /* ====================================================================================================
     4. BEHAVIOUR — filters and sorting in place, URL state, add to bag.
     ==================================================================================================== */
  var cleanup = function () {};
  var App = function () { return window.BCCApp || null; };
  var reduced = function () { return matchMedia("(prefers-reduced-motion: reduce)").matches; };

  function readItems(root) {
    return [].slice.call(root.querySelectorAll("[data-sp-item]")).map(function (el) {
      return { el: el, id: el.getAttribute("data-sp-item"), i: Number(el.getAttribute("data-i")), fid: el.getAttribute("data-format"), price: Number(el.getAttribute("data-price")),
        available: el.getAttribute("data-available") === "true", name: el.querySelector(".sp-name a").textContent };
    });
  }
  function urlFor(st) {
    var u = new URL(location.href);
    u.searchParams.delete("format"); u.searchParams.delete("stock"); u.searchParams.delete("sort");
    var f = st.formats.concat(st.unknown);
    if (f.length) u.searchParams.set("format", f.join(","));
    if (st.stock) u.searchParams.set("stock", "in");
    if (st.sort !== "recommended") u.searchParams.set("sort", st.sort);
    /* Keep the design last so URLs read naturally; it is preserved, never dropped. */
    var d = u.searchParams.get("design");
    if (d) { u.searchParams.delete("design"); u.searchParams.set("design", d); }
    return u.pathname + u.search.replace(/%2C/gi, ",") + u.hash;
  }

  function apply(root, st, opts) {
    opts = opts || {};
    var list = readItems(root), r = compute(st, list), grid = root.querySelector("[data-sp-grid]");
    /* Visibility and order. Reordering moves existing nodes, so images and focus are not recreated. */
    var active = document.activeElement;
    r.order.forEach(function (x) { grid.appendChild(x.el); });
    if (active && root.contains(active) && document.activeElement !== active) active.focus({ preventScroll: true });
    var first = null;
    r.order.forEach(function (x) {
      var on = r.shown.indexOf(x) >= 0;
      x.el.hidden = !on;
      x.el.removeAttribute("data-lead");
      if (on && !first) first = x;
    });
    if (first) first.el.setAttribute("data-lead", "");
    /* Controls. */
    var all = !(st.formats.length || st.unknown.length);
    root.querySelectorAll("[data-sp-format]").forEach(function (b) {
      var id = b.getAttribute("data-sp-format");
      b.setAttribute("aria-pressed", String(id === "all" ? all : st.formats.indexOf(id) >= 0));
      b.querySelector(".sp-n").textContent = r.counts[id];
    });
    var stock = root.querySelector("[data-sp-stock]");
    if (stock) stock.checked = st.stock;
    var n = root.querySelector('[data-sp-n="stock"]');
    if (n) n.textContent = r.counts.stock;
    var sort = root.querySelector("[data-sp-sort]");
    if (sort) sort.value = st.sort;
    root.querySelector("[data-sp-chips]").innerHTML = chips(st);
    root.querySelector(".sp-state [data-sp-clear]").hidden = isDefault(st);
    root.querySelector("[data-sp-empty]").hidden = r.shown.length > 0;
    var count = root.querySelector("[data-sp-count]"), text = countText(r);
    /* The status region announces the new result count (and the sort, when only the order changed). */
    if (opts.announce !== false) count.textContent = opts.sortOnly ? text + ", sorted " + sortLabel(st.sort).toLowerCase().replace("recommended", "in recommended order") : text;
    else count.textContent = text;
    var App_ = App();
    if (App_ && App_.keepDesignOnLinks) App_.keepDesignOnLinks();
    return r;
  }

  function current() { return parse(new URL(location.href).searchParams); }
  function commit(root, st, opts) {
    var href = urlFor(st);
    if (href !== location.pathname + location.search + location.hash) {
      try { history.pushState(Object.assign({}, history.state || {}, { shopScroll: null }), "", href); } catch (e) {}
      if (App() && App().routeChanged) App().routeChanged();
    }
    apply(root, st, opts);
  }

  function addBehaviour(root, on) {
    var busy = {};
    on(root, "click", function (e) {
      var b = e.target.closest("[data-sp-add]");
      if (!b || !root.contains(b)) return;
      var id = b.getAttribute("data-sp-add");
      if (busy[id] || b.disabled) return;
      var app = App();
      var card = b.closest("[data-sp-item]"), msg = card.querySelector("[data-sp-msg]"), label = b.querySelector(".sp-add-l");
      var name = card.querySelector(".sp-name a").textContent;
      busy[id] = true;
      b.setAttribute("aria-busy", "true");
      b.classList.add("is-busy");
      label.textContent = "Adding…";
      msg.textContent = "";
      msg.removeAttribute("data-kind");
      setTimeout(function () {
        var res = app && app.addToBag ? app.addToBag(id, 1) : { ok: false, message: "The bag isn't available right now. Please reload the page." };
        b.removeAttribute("aria-busy");
        b.classList.remove("is-busy");
        var announce = root.querySelector("[data-sp-announce]");
        if (res && res.ok) {
          b.classList.add("is-done");
          label.textContent = "Added";
          msg.setAttribute("data-kind", "ok");
          msg.innerHTML = 'Added to your bag. <a href="/cart">View bag (' + res.count + ")</a>";
          if (announce) announce.textContent = name + " added to your bag. Your bag has " + res.count + " item" + (res.count === 1 ? "" : "s") + ".";
        } else {
          msg.setAttribute("data-kind", "error");
          msg.textContent = (res && res.message) || "That couldn't be added. Please try again.";
          label.textContent = "Add to bag";
          if (announce) announce.textContent = name + ": " + msg.textContent;
        }
        if (app && app.keepDesignOnLinks) app.keepDesignOnLinks();
        /* A short pause before the button accepts another add prevents accidental double submissions. */
        setTimeout(function () {
          busy[id] = false;
          if (!b.isConnected) return;
          b.classList.remove("is-done");
          if (res && res.ok) label.textContent = "Add another";
        }, 1400);
      }, reduced() ? 0 : 280);
    });
  }

  function enhance() {
    cleanup();
    var root = document.querySelector("[data-sp]");
    if (!root || !root.querySelector("[data-sp-grid]")) return;
    var abort = new AbortController(), signal = abort.signal;
    var on = function (el, ev, fn) { if (el) el.addEventListener(ev, fn, { signal: signal }); };

    on(root, "click", function (e) {
      var f = e.target.closest("[data-sp-format]"), rm = e.target.closest("[data-sp-remove]"), clr = e.target.closest("[data-sp-clear]");
      if (!f && !rm && !clr) return;
      var st = current();
      if (f) {
        var id = f.getAttribute("data-sp-format");
        if (id === "all") { st.formats = []; st.unknown = []; }
        else {
          st.unknown = [];
          var at = st.formats.indexOf(id);
          if (at >= 0) st.formats.splice(at, 1); else st.formats.push(id);
          st.formats.sort(function (a, b) { return FORMATS.map(function (x) { return x.id; }).indexOf(a) - FORMATS.map(function (x) { return x.id; }).indexOf(b); });
        }
        commit(root, st);
      } else if (rm) {
        var what = rm.getAttribute("data-sp-remove");
        if (what === "stock") st.stock = false;
        else {
          var v = what.slice(7);
          st.formats = st.formats.filter(function (x) { return x !== v; });
          st.unknown = st.unknown.filter(function (x) { return x !== v; });
        }
        commit(root, st);
        /* The chip is gone; keep focus in the controls rather than losing it to the page. */
        var next = root.querySelector("[data-sp-chips] button") || root.querySelector('[data-sp-format="all"]');
        if (next) next.focus();
      } else {
        commit(root, { formats: [], unknown: [], stock: false, sort: "recommended" });
        var all = root.querySelector('[data-sp-format="all"]');
        if (all) all.focus();
      }
    });
    on(root.querySelector("[data-sp-stock]"), "change", function (e) { var st = current(); st.stock = e.target.checked; commit(root, st); });
    on(root.querySelector("[data-sp-sort]"), "change", function (e) { var st = current(); st.sort = e.target.value; commit(root, st, { sortOnly: true }); });
    addBehaviour(root, on);

    /* No broken images: if a pack image fails, the card shows its cap colour and name instead. */
    root.querySelectorAll(".sp-plate img").forEach(function (img) {
      var fail = function () { var c = img.closest("[data-sp-item]"); if (c) c.classList.add("is-noimg"); };
      if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) fail();
      on(img, "error", fail);
    });

    cleanup = function () { abort.abort(); };
  }

  /* Back/Forward between two Shop states: update in place instead of re-rendering (app.js asks first). */
  function popstate() {
    var root = document.querySelector("[data-sp]");
    if (!root || location.pathname !== "/shop" || !root.querySelector("[data-sp-grid]")) return false;
    var d = new URL(location.href).searchParams.get("design");
    if (d && d !== root.getAttribute("data-sp-design")) return false;
    apply(root, current());
    return true;
  }

  window.BCCShop = { enhance: enhance, popstate: popstate, parse: parse, compute: compute, FORMATS: FORMATS, SORTS: SORTS };
})();
