/* Body Café Co. — product detail pages for the four design directions.

   One content model (built from the catalogue record plus approved planning notes) feeds four compositions:
     A  Warm editorial      .pdp-a   photograph-led editorial spreads
     B  Expressive everyday .pdp-b   bold colour blocks, jump strip, modular tiles
     C  Pick a cap          .pdp-c   cap-coloured stage, cap rail, café-menu label, detail tabs
     D  Still life          .pdp-d   lit plinth, numbered contents, packaging facts panel

   Contract: window.BCCProductPage(ctx) returns the page HTML; window.BCCProductPage.enhance() runs after each render.
   ctx = { p, design, catalog, flags, image, cap, capStyle, escape, money, format, shortName, icon, faqs, learning, homeHref, collectionHref }
   Commerce stays in app.js: [data-action="add-product"] + #product-quantity, [data-add], #pincode-form and #pdp-lot.
   No product facts are invented here. Anything not in the record is shown as awaiting the approved label.
   No inline handlers and no external resources. */
(function () {
  "use strict";

  var PENDING = "Awaiting approved label";

  /* What each approved label still has to state, from Website-Research-and-Plan.md ("fields to confirm"). */
  var TO_CONFIRM = {
    "iron-bisglycinate": ["Elemental iron per serving, listed separately from the compound weight", "Dosage form and count"],
    "l-theanine": ["Active amount per serving", "Dosage form", "Any substantiated caffeine or free-from statements"],
    "vitamin-d3-k2": ["Vitamin D3 amount and units", "Vitamin K2 amount and form", "Serving size and dietary source"],
    "omega-3-fish-oil": ["Fish-oil quantity, listed separately from EPA and DHA quantities", "Source and allergen details"],
    "myo-d-chiro-inositol": ["Amount of each ingredient and their ratio", "Serving size and units per pack"],
    "creatine-chews": ["Creatine per chew and per serving", "Chews per pack, flavour and texture", "Full nutrition details"],
    "psyllium-husk": ["Product form and net weight", "Serving amount and fibre content", "Directions and approved label warnings"],
  };
  var ALWAYS_CONFIRM = "Complete ingredient list, allergens, storage and manufacturer details";

  /* Long display names: never break inside a hyphenated word ("D-Chiro", "Omega-3", "L-Theanine"). */
  function titleHtml(name) {
    return name.split(" ").map(function (w) { return w.indexOf("-") > 0 ? '<span class="pd-nobreak">' + w + "</span>" : w; }).join(" ");
  }

  /* ---------- Model ---------- */
  function model(ctx) {
    var p = ctx.p;
    var esc = ctx.escape;
    var catalog = ctx.catalog || [];
    var idx = Math.max(0, catalog.findIndex(function (x) { return x.id === p.id; }));
    var n = idx + 1;
    var no = (n < 10 ? "0" : "") + n;
    var total = catalog.length || 7;
    var raw = String(p.ingredients || "");
    var main = raw.split(";")[0];
    var note = raw.split(";").slice(1).join(";").trim();
    var parts = main.split(/,\s*|\s+and\s+/).map(function (s) { return s.trim(); }).filter(Boolean);
    var fmt = ctx.format[p.id] || "";
    var off = !p.published ? "unpublished" : !(p.stock > 0) ? "stock" : "";
    var max = off ? 1 : Math.max(1, Math.min(5, p.stock));
    var published = catalog.filter(function (x) { return x.published && x.id !== p.id; });
    var after = published.filter(function (x) { return catalog.indexOf(x) > idx; });
    var related = after.concat(published.filter(function (x) { return catalog.indexOf(x) < idx; })).slice(0, 3);
    var learning = ctx.flags && ctx.flags.ingredient_library === false ? [] : ctx.learning || [];
    return {
      p: p, ctx: ctx, esc: esc, id: p.id,
      name: esc(p.name), sub: esc(p.subtitle), title: titleHtml(esc(p.name)), short: esc((ctx.shortName && ctx.shortName[p.id]) || p.name),
      no: no, n: n, total: total, totalNo: (total < 10 ? "0" : "") + total,
      format: esc(fmt), formatLower: esc(fmt.toLowerCase()),
      category: esc(p.category || ""),
      inView: esc(main), parts: parts.map(esc), partsNote: note ? esc(note.charAt(0).toUpperCase() + note.slice(1)) + "." : "",
      price: ctx.money(p.price),
      off: off, max: max, stock: p.stock,
      sample: "DEMO-" + no + "-01",
      confirm: (TO_CONFIRM[p.id] || []).concat([ALWAYS_CONFIRM]),
      related: related, learning: learning, faqs: ctx.faqs || [],
      home: ctx.homeHref, collection: ctx.collectionHref,
    };
  }

  /* ---------- Shared content (copy is reused from the existing storefront unless it is a status line) ---------- */
  var COPY = {
    overview: "Read what's inside, how the format works, and the record for your lot, before you decide.",
    purpose: "An approved purpose statement hasn't been supplied yet. This page doesn't turn an ingredient name into a health claim.",
    mockup: "Front-of-pack design mockup. Wording printed on this render is a draft, not the approved label.",
    formula: "Full ingredients, amounts per serving, allergens and nutrition facts will come from the approved rear label.",
    reportIs: "A report describes the sample tested from a specific lot. It doesn't prove an individual pack is authentic.",
    reportDemo: "Preview records are demonstrations. No laboratory document is connected.",
    reviews: "Reviews appear only after a verified delivery and moderation. We won't fill this space with made-up ones.",
    support: "Every case gets an ID and stays in your account. Public email, WhatsApp and service hours will be added once confirmed.",
    delivery: "Pincode estimates are illustrative. Production serviceability and delivery dates require courier configuration.",
    returns: "Final return eligibility, timing and remedies are still being approved. This preview does not promise a return window.",
  };
  function care(m) {
    return [
      ["Directions", "Directions are waiting on approved label data. The preview doesn't suggest a dose."],
      ["Storage", "Storage conditions will be added from the approved label."],
      ["Allergens", "Allergen information will be added from the approved label."],
      ["Cautions and warnings", "Cautions and warnings will be added from reviewed material. Nothing here is a diagnosis or personal health advice."],
    ];
  }
  function facts(m) {
    return [
      ["Format", m.format],
      ["Ingredient in view", m.inView],
      ["Collection", m.category],
      ["Purchase", "One-time purchase"],
      ["Serving size", PENDING, true],
      ["Pack contents", PENDING, true],
    ];
  }
  function does() {
    return [
      "Connects the lot number printed on a pack to its manufacturing batch record.",
      "Describes what was tested on a sample from that lot: the test, method, units and stated limits.",
    ];
  }
  function doesnt() {
    return ["It isn't a diagnosis or a promise of results.", "It doesn't prove that an individual pack is authentic."];
  }
  function productFaqs(m) {
    return [
      ["How much is in each serving?", "Amounts per serving come from the approved rear label, which hasn't been supplied yet. The preview doesn't suggest a dose."],
      ["Where's the lot number on my pack?", "A location guide will be added from the final rear label. Your lot number is different from your order number or barcode."],
    ].concat(m.faqs.filter(function (f) { return !/lot report/i.test(f[0]); }));
  }
  function guides(m) {
    if (!m.learning.length) return [];
    return [["/learn/" + m.id, "Ingredient notes", m.name]].concat(
      m.learning.map(function (g) { return ["/learn/" + g[0], "Guide", m.esc(g[1])]; })
    );
  }
  function services() {
    return [
      ["/policies/shipping", "Shipping & delivery"],
      ["/policies/returns", "Returns & refunds"],
      ["/policies/cancellation", "Cancellation"],
      ["/help", "Help centre"],
      ["/contact", "Contact support"],
    ];
  }

  /* ---------- Shared components (structure shared, appearance per theme) ---------- */
  function stock(m) {
    var t =
      m.off === "unpublished" ? "Not available. This product isn't published right now."
      : m.off === "stock" ? "Out of preview stock"
      : m.stock <= 5 ? "Only " + m.stock + " left in preview stock"
      : "In preview stock";
    return '<p class="pd-stock ' + (m.off ? "is-off" : "is-on") + '"><span class="pd-dot" aria-hidden="true"></span>' + t + "</p>";
  }
  function qty(m) {
    var opts = "";
    for (var i = 1; i <= m.max; i++) opts += '<option value="' + i + '">' + i + "</option>";
    return '<div class="pd-qty"><label for="product-quantity">Quantity</label><select id="product-quantity"' + (m.off ? " disabled" : "") + ">" + opts + "</select></div>";
  }
  function addButton(m, cls, label) {
    var ic = m.ctx.icon("plus");
    return '<button type="button" class="pd-add ' + (cls || "") + '" data-action="add-product" data-id="' + m.id + '"' + (m.off ? " disabled" : "") + "><span>" + (m.off ? "Unavailable" : label || "Add to bag") + "</span>" + ic + "</button>";
  }
  function priceLine(m) {
    return '<p class="pd-price"><span class="pd-price-num">' + m.price + '</span><span class="pd-price-note">Sample price</span></p>';
  }
  function purchase() {
    return '<p class="pd-purchase"><span class="pd-check" aria-hidden="true"></span><span><strong>One-time purchase</strong><small>Prices, tax and delivery are samples.</small></span></p>';
  }
  function buy(m, opts) {
    opts = opts || {};
    return (
      '<div class="pd-buy">' +
        (opts.noPrice ? "" : priceLine(m)) +
        stock(m) +
        purchase() +
        '<div class="pd-buy-row" data-pd-buy>' + qty(m) + addButton(m, "pd-add-main " + (opts.addClass || "")) + "</div>" +
        '<p class="pd-micro">Preview order only. No payment or dispatch.</p>' +
      "</div>"
    );
  }
  function pincode() {
    return (
      '<form id="pincode-form" class="pd-pincode" novalidate>' +
        '<label for="pincode">Check delivery to your pincode</label>' +
        '<div class="pd-inline"><input id="pincode" name="pincode" inputmode="numeric" autocomplete="postal-code" pattern="[1-9][0-9]{5}" maxlength="6" placeholder="6-digit pincode" required aria-describedby="pincode-result"><button type="submit">Check</button></div>' +
        '<p id="pincode-result" class="pd-micro" role="status"></p>' +
      "</form>"
    );
  }
  function lotForm(m, btnCls) {
    return (
      '<form id="pdp-lot" class="pd-lot-form">' +
        '<input type="hidden" name="product" value="' + m.id + '">' +
        '<p class="pd-lot-for">For <strong>' + m.name + "</strong></p>" +
        '<label for="pdp-lot-number">Lot number on your pack</label>' +
        '<div class="pd-inline"><input id="pdp-lot-number" name="lot" maxlength="60" required autocomplete="off" placeholder="e.g. ' + m.sample + '"><button type="submit" class="' + (btnCls || "") + '">Look up</button></div>' +
        '<p class="pd-micro">Demonstration only. Try <button type="button" class="link-button" data-fill-pdp-lot="' + m.sample + '">the sample lot ' + m.sample + "</button>, or open <a href=\"/reports?product=" + m.id + '">all lot reports</a>.</p>' +
      "</form>"
    );
  }
  function list(items, cls) {
    return '<ul class="' + cls + '">' + items.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>";
  }
  function formulaTable(m) {
    return (
      '<table class="pd-formula"><caption class="sr-only">Declared ingredients for ' + m.name + "</caption>" +
        '<thead><tr><th scope="col">Declared ingredient</th><th scope="col">Amount per serving</th></tr></thead><tbody>' +
        m.parts.map(function (x) { return '<tr><th scope="row">' + x + '</th><td><span class="pd-pending">' + PENDING + "</span></td></tr>"; }).join("") +
        "</tbody></table>" +
      (m.partsNote ? '<p class="pd-micro">' + m.partsNote + "</p>" : "")
    );
  }
  function faqList(m, iconHtml) {
    return productFaqs(m)
      .map(function (f) { return '<details class="pd-faq"><summary><span>' + f[0] + "</span>" + (iconHtml || m.ctx.icon("plus")) + "</summary><p>" + f[1] + "</p></details>"; })
      .join("");
  }
  function sticky(m) {
    if (m.off) return "";
    return (
      '<div class="pd-sticky" data-pd-sticky hidden>' +
        '<p class="pd-sticky-name"><strong>' + m.name + "</strong><span>" + m.price + ' · sample · <span data-pd-sticky-qty>Qty 1</span></span></p>' +
        addButton(m, "pd-add-sticky") +
      "</div>"
    );
  }
  function photo(m) {
    return '<img class="pd-photo" src="/concepts/media/' + m.id + '.webp" alt="' + m.name + ' bottle, front-of-pack design mockup" width="1196" height="1315" fetchpriority="high" decoding="async">';
  }
  function cutout(m, cls) {
    return m.ctx.image(m.p, cls || "", true).replace(' bottle"', ' bottle, front-of-pack design mockup"');
  }
  function thumb(m, p) {
    return '<img src="/concepts/media/' + p.id + '.webp" alt="" width="1196" height="1315" loading="lazy" decoding="async">';
  }
  function views(m) {
    return ["Readable rear label", "Close-up of the " + m.formatLower, "Pack in hand, for scale"];
  }
  function crumbs(m, collectionLabel, cls) {
    return (
      '<nav class="pd-crumbs ' + (cls || "") + '" aria-label="Breadcrumb"><ol>' +
        '<li><a href="' + m.home + '">Home</a></li>' +
        '<li><a href="' + m.collection + '">' + (collectionLabel || "Shop") + "</a></li>" +
        '<li><span aria-current="page">' + m.name + "</span></li>" +
      "</ol></nav>"
    );
  }
  function relatedAdd(m, p, cls) {
    var off = !p.stock || !p.published;
    return '<button type="button" class="' + cls + '" data-add="' + p.id + '" aria-label="Add ' + m.esc(p.name) + ' to bag"' + (off ? " disabled" : "") + ">" + m.ctx.icon("plus") + "<span>" + (off ? "Unavailable" : "Add") + "</span></button>";
  }
  function numberOf(m, p) {
    var i = (m.ctx.catalog || []).indexOf(p) + 1;
    return (i < 10 ? "0" : "") + i;
  }

  /* ==========================================================================
     A — Warm editorial
     ========================================================================== */
  function pageA(m) {
    var esc = m.esc;
    var glance = facts(m)
      .map(function (f) { return '<div class="a-glance-cell"><dt>' + f[0] + '</dt><dd' + (f[2] ? ' class="is-pending"' : "") + ">" + f[1] + "</dd></div>"; })
      .join("");
    return (
      '<article class="pdp-a" style="' + m.ctx.capStyle(m.p) + '" aria-labelledby="pd-title">' +
        '<div class="a-top">' + crumbs(m, "The collection") + '<span class="a-folio" aria-hidden="true">' + m.no + " / " + m.totalNo + "</span></div>" +
        '<section class="a-hero">' +
          '<figure class="a-figure">' + photo(m) +
            '<figcaption class="a-caption"><span>' + m.no + " / The everyday collection</span><span>" + COPY.mockup + "</span></figcaption>" +
          "</figure>" +
          '<div class="a-info">' +
            '<p class="a-eyebrow"><span class="a-sun" aria-hidden="true">✳</span> ' + m.no + " — " + m.format + "</p>" +
            '<h1 id="pd-title" class="a-title">' + m.title + "</h1>" +
            '<p class="a-sub">' + m.sub + "</p>" +
            '<p class="a-lede">' + COPY.overview + "</p>" +
            buy(m, { addClass: "a-dark" }) +
            pincode() +
            '<p class="a-help"><a href="#pd-service">Delivery, returns and help</a><a href="#pd-lot">Find your lot report</a></p>' +
          "</div>" +
        "</section>" +
        '<dl class="a-glance" aria-label="At a glance">' + glance + "</dl>" +

        '<section class="a-spread a-reading" aria-labelledby="a-reading-title">' +
          '<div class="a-spread-head"><p class="a-eyebrow">01 — Reading this page</p><h2 id="a-reading-title">What we know.<br><em>What is still to come.</em></h2></div>' +
          '<div class="a-lines">' +
            '<div><span>01</span><div><h3>In view now</h3><p>' + m.inView + ", in " + m.formatLower + ". " + m.sub + "</p></div></div>" +
            '<div><span>02</span><div><h3>Purpose and benefits</h3><p>' + COPY.purpose + "</p></div></div>" +
            '<div><span>03</span><div><h3>Still to confirm on the label</h3>' + list(m.confirm, "a-dash") + "</div></div>" +
          "</div>" +
        "</section>" +

        '<section class="a-spread a-inside" aria-labelledby="a-inside-title">' +
          '<div class="a-spread-head"><p class="a-eyebrow">02 — What’s inside</p><h2 id="a-inside-title">The formula,<br><em>in full.</em></h2><p>' + COPY.formula + "</p></div>" +
          '<div class="a-inside-body">' + formulaTable(m) +
            '<div class="a-views"><p class="a-eyebrow">Label and gallery</p><p>' + COPY.mockup + " Further views will be added once they are photographed and approved:</p>" + list(views(m), "a-dash") + "</div>" +
          "</div>" +
        "</section>" +

        '<section class="a-spread a-care" aria-labelledby="a-care-title">' +
          '<div class="a-spread-head"><p class="a-eyebrow">03 — Use and care</p><h2 id="a-care-title">Before you<br><em>open the bottle.</em></h2></div>' +
          '<div class="a-lines">' +
            care(m).map(function (c, i) { return '<div><span>0' + (i + 1) + "</span><div><h3>" + c[0] + '</h3><p class="a-pending">' + PENDING + "</p><p>" + c[1] + "</p></div></div>"; }).join("") +
          "</div>" +
        "</section>" +

        '<section id="pd-lot" class="a-lot" aria-labelledby="a-lot-title">' +
          '<div class="a-lot-copy"><p class="a-eyebrow">04 — From your bottle to the details</p><h2 id="a-lot-title">Your lot.<br><em>Your closer look.</em></h2>' +
            "<p>" + COPY.reportIs + "</p>" +
            '<div class="a-lot-cols"><div><h3>What a lot report does</h3>' + list(does(), "a-dash") + "</div><div><h3>What it can’t tell you</h3>" + list(doesnt(), "a-dash") + "</div></div>" +
            '<p class="a-small">' + COPY.reportDemo + "</p>" +
          "</div>" +
          '<div class="a-lot-card"><p class="a-eyebrow">Find your lot report <span aria-hidden="true">↗</span></p>' + lotForm(m, "a-dark") + "</div>" +
        "</section>" +

        '<section id="pd-service" class="a-spread a-service" aria-labelledby="a-service-title">' +
          '<div class="a-spread-head"><p class="a-eyebrow">05 — Delivery and help</p><h2 id="a-service-title">A clear next step.<br><em>A person to ask.</em></h2></div>' +
          '<div class="a-service-grid">' +
            "<div><h3>Delivery</h3><p>" + COPY.delivery + "</p><p>Sample delivery is ₹75, waived on sample orders of ₹1,499 or more. This is not the approved shipping policy.</p></div>" +
            "<div><h3>Returns and cancellation</h3><p>" + COPY.returns + "</p></div>" +
            "<div><h3>Support</h3><p>" + COPY.support + "</p></div>" +
          "</div>" +
          '<p class="a-links">' + services().map(function (s) { return '<a href="' + s[0] + '">' + s[1] + ' <span aria-hidden="true">↗</span></a>'; }).join("") + "</p>" +
        "</section>" +

        '<section class="a-voices" aria-labelledby="a-voices-title">' +
          '<p class="a-eyebrow">06 — Customer experiences</p>' +
          '<div class="a-voices-split"><h2 id="a-voices-title">Real people.<br><em>Their own words.</em></h2>' +
            '<div class="a-frame"><p class="a-frame-lede">No reviews have been published for ' + m.name + " yet.</p><p>" + COPY.reviews + '</p><a class="a-link" href="/account">Leave a review for a delivered order <span aria-hidden="true">↗</span></a></div>' +
          "</div>" +
        "</section>" +

        '<section class="a-spread a-faq" aria-labelledby="a-faq-title">' +
          '<div class="a-spread-head"><p class="a-eyebrow">07 — Questions</p><h2 id="a-faq-title">Ask before<br><em>you choose.</em></h2></div>' +
          '<div class="a-faq-list">' + faqList(m, '<span class="a-plus" aria-hidden="true">＋</span>') + "</div>" +
        "</section>" +

        (guides(m).length
          ? '<section class="a-notes" aria-labelledby="a-notes-title"><p class="a-eyebrow">08 — A little more knowing</p><h2 id="a-notes-title">Field notes.</h2><div class="a-notes-grid">' +
            guides(m).map(function (g, i) { return '<a href="' + g[0] + '"><span class="a-eyebrow">Field notes / 0' + (i + 1) + " · " + g[1] + "</span><strong>" + g[2] + '</strong><span class="a-arrow" aria-hidden="true">↗</span></a>'; }).join("") +
            "</div></section>"
          : "") +

        (m.related.length
          ? '<section class="a-more" aria-labelledby="a-more-title"><div class="a-more-head"><h2 id="a-more-title">More from<br><em>the collection.</em></h2><a class="a-link" href="' + m.collection + '">See all seven <span aria-hidden="true">↗</span></a></div><div class="a-more-grid">' +
            m.related.map(function (p) {
              return '<article class="a-card" style="' + m.ctx.capStyle(p) + '"><a class="a-card-photo" href="/products/' + p.id + '?design=' + m.ctx.design + '">' + thumb(m, p) + '<span class="a-card-no" aria-hidden="true">' + numberOf(m, p) + '</span><span class="a-card-arrow" aria-hidden="true">↗</span><span class="sr-only">' + esc(p.name) + '</span></a><div class="a-card-meta"><span class="a-sku" aria-hidden="true"></span><h3><a href="/products/' + p.id + '?design=' + m.ctx.design + '">' + esc(p.name) + "</a></h3><p>" + esc(p.subtitle) + "</p><p class=\"a-card-price\">" + m.ctx.money(p.price) + " <small>Sample price</small></p></div></article>";
            }).join("") +
            "</div></section>"
          : "") +
        sticky(m) +
      "</article>"
    );
  }

  /* ==========================================================================
     B — Expressive everyday
     ========================================================================== */
  function pageB(m) {
    var esc = m.esc;
    var tiles = facts(m)
      .map(function (f, i) { return '<div class="b-tile b-tile-' + (i + 1) + (f[2] ? " is-pending" : "") + '"><dt>' + f[0] + "</dt><dd>" + f[1] + "</dd></div>"; })
      .join("");
    var colours = ["b-lilac", "b-sage", "b-lime", "b-peach"];
    return (
      '<article class="pdp-b" style="' + m.ctx.capStyle(m.p) + '" aria-labelledby="pd-title">' +
        '<section class="b-hero">' +
          '<div class="b-info">' +
            crumbs(m, "The collection") +
            '<p class="b-pills"><span class="b-pill b-pill-cap">' + m.no + " / " + m.totalNo + '</span><span class="b-pill">' + m.format + '</span><span class="b-pill">' + m.category + "</span></p>" +
            '<h1 id="pd-title" class="b-title">' + m.title + "</h1>" +
            '<p class="b-sub">' + m.sub + "</p>" +
            '<p class="b-lede">' + COPY.overview + "</p>" +
            buy(m, { addClass: "b-ink" }) +
            pincode() +
          "</div>" +
          '<div class="b-art"><figure class="b-frame">' + photo(m) + "</figure>" +
            '<p class="b-stamp" aria-hidden="true"><span>' + m.short + "</span><b>✳</b><span>" + m.format + "</span></p>" +
            '<p class="b-art-caption">' + COPY.mockup + "</p>" +
          "</div>" +
        "</section>" +

        '<nav class="b-jump" aria-label="On this page">' +
          [["#b-inside", "What’s inside"], ["#b-care", "Use and care"], ["#pd-lot", "Your lot report"], ["#b-service", "Delivery and help"]]
            .map(function (j, i) { return '<a href="' + j[0] + '"><span class="b-num">0' + (i + 1) + "</span>" + j[1] + ' <span aria-hidden="true">↓</span></a>'; }).join("") +
        "</nav>" +

        '<section class="b-section b-facts" aria-labelledby="b-facts-title"><h2 id="b-facts-title">The quick facts.</h2><dl class="b-bento">' + tiles + "</dl></section>" +

        '<section id="b-inside" class="b-section b-inside" aria-labelledby="b-inside-title">' +
          '<div class="b-head"><p class="b-pill b-pill-dark">What’s inside</p><h2 id="b-inside-title">More than<br><em>a name.</em></h2><p>' + COPY.formula + "</p></div>" +
          '<div class="b-inside-grid">' +
            '<div class="b-card">' + formulaTable(m) + "</div>" +
            '<div class="b-bubble"><p class="b-pill">Still to confirm</p>' + list(m.confirm, "b-ticks") + "</div>" +
            '<div class="b-card b-purpose"><p class="b-pill">Purpose and benefits</p><p>' + COPY.purpose + '</p><p class="b-pill">Label and gallery</p><p>' + COPY.mockup + " Coming later: " + views(m).join(", ").toLowerCase() + ".</p></div>" +
          "</div>" +
        "</section>" +

        '<section id="b-care" class="b-section b-care" aria-labelledby="b-care-title">' +
          '<div class="b-head"><p class="b-pill b-pill-dark">Use and care</p><h2 id="b-care-title">Read it<br><em>before you open it.</em></h2></div>' +
          '<div class="b-arches">' +
            care(m).map(function (c, i) { return '<article class="b-arch ' + colours[i] + '"><p class="b-pill">' + PENDING + "</p><h3>" + c[0] + "</h3><p>" + c[1] + "</p></article>"; }).join("") +
          "</div>" +
        "</section>" +

        '<section id="pd-lot" class="b-lot" aria-labelledby="b-lot-title">' +
          '<div class="b-lot-copy"><p class="b-pill b-pill-lime">From your bottle to the details</p><h2 id="b-lot-title">Your lot.<br><em>Your closer look.</em></h2><p>' + COPY.reportIs + "</p>" +
            '<div class="b-lot-lists"><div><h3>It does</h3>' + list(does(), "b-ticks") + "</div><div><h3>It doesn’t</h3>" + list(doesnt(), "b-crosses") + "</div></div>" +
            '<p class="b-small">' + COPY.reportDemo + "</p>" +
          "</div>" +
          '<div class="b-lot-card"><p class="b-card-kicker">Find your lot report <span aria-hidden="true">↗</span></p>' + lotForm(m, "b-ink") + "</div>" +
        "</section>" +

        '<section id="b-service" class="b-section b-service" aria-labelledby="b-service-title">' +
          '<div class="b-head"><p class="b-pill b-pill-dark">Delivery and help</p><h2 id="b-service-title">The practical bits.</h2></div>' +
          '<div class="b-service-grid">' +
            '<article class="b-lilac"><h3>Delivery</h3><p>' + COPY.delivery + "</p><p>Sample delivery is ₹75, waived on sample orders of ₹1,499 or more. This is not the approved shipping policy.</p></article>" +
            '<article class="b-sage"><h3>Returns and cancellation</h3><p>' + COPY.returns + "</p></article>" +
            '<article class="b-lime"><h3>Support</h3><p>' + COPY.support + "</p></article>" +
          "</div>" +
          '<p class="b-links">' + services().map(function (s) { return '<a href="' + s[0] + '">' + s[1] + ' <span aria-hidden="true">↗</span></a>'; }).join("") + "</p>" +
        "</section>" +

        '<section class="b-voices" aria-labelledby="b-voices-title">' +
          '<p class="b-pill b-pill-dark">Customer experiences</p>' +
          '<div class="b-voices-split"><h2 id="b-voices-title">Real people.<br><em>Their own words.</em></h2>' +
            '<div class="b-note"><p class="b-note-lede">No reviews have been published for ' + m.name + " yet.</p><p>" + COPY.reviews + '</p><a class="b-chip" href="/account">Leave a review for a delivered order ↗</a></div>' +
          "</div>" +
        "</section>" +

        '<section class="b-section b-faq" aria-labelledby="b-faq-title"><div class="b-head"><p class="b-pill b-pill-dark">Questions</p><h2 id="b-faq-title">Ask away.</h2></div><div class="b-faq-list">' + faqList(m, '<span class="b-plus" aria-hidden="true">＋</span>') + "</div></section>" +

        (guides(m).length
          ? '<section class="b-section b-learn" aria-labelledby="b-learn-title"><h2 id="b-learn-title">Learn a little more.</h2><div class="b-chips">' +
            guides(m).map(function (g, i) { return '<a class="b-chip ' + colours[i % 4] + '" href="' + g[0] + '"><small>' + g[1] + "</small>" + g[2] + " ↗</a>"; }).join("") + "</div></section>"
          : "") +

        (m.related.length
          ? '<section class="b-section b-more" aria-labelledby="b-more-title"><div class="b-more-head"><h2 id="b-more-title">Seven essentials.<br><em>Which is your next?</em></h2><a class="b-chip" href="' + m.collection + '">See all seven ↗</a></div><div class="b-more-grid">' +
            m.related.map(function (p) {
              return '<article class="b-card-p" style="' + m.ctx.capStyle(p) + '"><a class="b-card-photo" href="/products/' + p.id + '?design=' + m.ctx.design + '">' + thumb(m, p) + '<span class="b-card-no" aria-hidden="true">' + numberOf(m, p) + '</span><span class="sr-only">' + esc(p.name) + '</span></a><span class="b-sku" aria-hidden="true"></span><h3><a href="/products/' + p.id + '?design=' + m.ctx.design + '">' + esc(p.name) + "</a></h3><p>" + esc(p.subtitle) + '</p><div class="b-card-foot"><span><strong>' + m.ctx.money(p.price) + "</strong> <small>Sample price</small></span>" + relatedAdd(m, p, "b-add") + "</div></article>";
            }).join("") + "</div></section>"
          : "") +
        sticky(m) +
      "</article>"
    );
  }

  /* ==========================================================================
     C — Pick a cap
     ========================================================================== */
  function pageC(m) {
    var esc = m.esc;
    var catalog = (m.ctx.catalog || []).filter(function (x) { return x.published || x.id === m.id; });
    var rail = catalog
      .map(function (p) {
        var on = p.id === m.id;
        return '<a class="c-rail-cap" href="/products/' + p.id + '?design=' + m.ctx.design + '"' + (on ? ' aria-current="page"' : "") + ' style="' + m.ctx.capStyle(p) + '">' + m.ctx.cap(p) + '<span class="c-rail-label">' + esc((m.ctx.shortName && m.ctx.shortName[p.id]) || p.name) + "</span></a>";
      })
      .join("");
    var board = facts(m)
      .concat([["Sample price", m.price]])
      .map(function (f) { return '<li class="c-line' + (f[2] ? " is-pending" : "") + '"><span class="c-line-k">' + f[0] + '</span><span class="c-leader" aria-hidden="true"></span><span class="c-line-v">' + f[1] + "</span></li>"; })
      .join("");
    var tabs = [
      ["inside", "What’s inside", formulaTable(m) + "<p>" + COPY.formula + '</p><h3 class="c-sub-h">Still to confirm on the label</h3>' + list(m.confirm, "c-dots")],
      ["use", "How to use", care(m).slice(0, 2).map(function (c) { return '<h3 class="c-sub-h">' + c[0] + '</h3><p class="c-pending">' + PENDING + "</p><p>" + c[1] + "</p>"; }).join("")],
      ["before", "Before you choose", care(m).slice(2).map(function (c) { return '<h3 class="c-sub-h">' + c[0] + '</h3><p class="c-pending">' + PENDING + "</p><p>" + c[1] + "</p>"; }).join("") + '<h3 class="c-sub-h">Purpose and benefits</h3><p>' + COPY.purpose + "</p>"],
      ["delivery", "Delivery & returns", "<p>" + COPY.delivery + "</p><p>Sample delivery is ₹75, waived on sample orders of ₹1,499 or more. This is not the approved shipping policy.</p><p>" + COPY.returns + "</p><p>" + COPY.support + '</p><p class="c-links">' + services().map(function (s) { return '<a class="small-link" href="' + s[0] + '">' + s[1] + "</a>"; }).join("") + "</p>"],
    ];
    var tablist = tabs
      .map(function (t, i) { return '<button type="button" role="tab" id="c-tab-' + t[0] + '" aria-controls="c-panel-' + t[0] + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" data-pd-tab>' + t[1] + "</button>"; })
      .join("");
    var panels = tabs
      .map(function (t, i) { return '<div class="c-panel" role="tabpanel" id="c-panel-' + t[0] + '" aria-labelledby="c-tab-' + t[0] + '" tabindex="0"' + (i === 0 ? "" : " hidden") + ">" + t[2] + "</div>"; })
      .join("");
    return (
      '<article class="pdp-c" style="' + m.ctx.capStyle(m.p) + '" aria-labelledby="pd-title">' +
        '<section class="c-hero">' +
          '<div class="c-stage">' +
            crumbs(m, "Shop") +
            '<span class="c-ghost" aria-hidden="true">' + m.short + "</span>" +
            cutout(m, "c-bottle") +
            '<p class="c-stage-note">' + COPY.mockup + "</p>" +
          "</div>" +
          '<div class="c-info">' +
            '<p class="c-chip">' + m.ctx.cap(m.p) + "<span>" + m.format + " · " + m.category + "</span></p>" +
            '<h1 id="pd-title" class="c-title">' + m.title + "</h1>" +
            '<p class="c-sub">' + m.sub + "</p>" +
            buy(m, { addClass: "c-cap-button" }) +
            pincode() +
            '<a class="c-lot-callout" href="#pd-lot"><span>Have this bottle already?</span><strong>Find your lot report</strong>' + m.ctx.icon("arrow") + "</a>" +
            '<nav class="c-rail" aria-label="Pick another cap">' + rail + "</nav>" +
          "</div>" +
        "</section>" +

        '<section class="c-section c-board" aria-labelledby="c-board-title"><div class="c-head"><h2 id="c-board-title" class="c-display">On the label</h2><p>' + COPY.overview + '</p></div><ul class="c-lines">' + board + "</ul></section>" +

        '<section class="c-section c-details" aria-labelledby="c-details-title"><h2 id="c-details-title" class="c-display">The details</h2>' +
          '<div class="c-tabs" data-pd-tabs><div class="c-tablist" role="tablist" aria-label="Product details">' + tablist + "</div>" + panels + "</div>" +
        "</section>" +

        '<section id="pd-lot" class="c-lot" aria-labelledby="c-lot-title"><div class="c-lot-inner">' +
          '<div class="c-lot-copy"><h2 id="c-lot-title" class="c-display">Turn the bottle over.</h2><p>' + COPY.reportIs + "</p>" +
            '<div class="c-lot-lists"><div><h3>What it does</h3>' + list(does(), "c-dots") + "</div><div><h3>What it can’t tell you</h3>" + list(doesnt(), "c-dots") + "</div></div>" +
            '<p class="pd-micro">' + COPY.reportDemo + "</p>" +
          "</div>" +
          '<div class="c-lot-form">' + lotForm(m, "c-light") + "</div>" +
        "</div></section>" +

        '<section class="c-section c-voices" aria-labelledby="c-voices-title"><div class="c-voices-card"><div><p class="c-kicker">' + m.ctx.cap(m.p) + "Customer experiences</p><h2 id=\"c-voices-title\" class=\"c-display\">Real people. Their own words.</h2></div><div><p><strong>No reviews have been published for " + m.name + " yet.</strong></p><p>" + COPY.reviews + '</p><a class="text-link" href="/account">Leave a review for a delivered order</a></div></div></section>' +

        '<section class="c-section c-faq" aria-labelledby="c-faq-title"><h2 id="c-faq-title" class="c-display">Questions</h2><div class="c-faq-list">' + faqList(m) + "</div></section>" +

        (guides(m).length
          ? '<section class="c-section c-learn" aria-labelledby="c-learn-title"><h2 id="c-learn-title" class="c-display">Read the label, then the lot</h2><ul class="c-learn-list">' +
            guides(m).map(function (g) { return '<li><a href="' + g[0] + '"><small>' + g[1] + "</small><span>" + g[2] + "</span>" + m.ctx.icon("arrow") + "</a></li>"; }).join("") + "</ul></section>"
          : "") +

        (m.related.length
          ? '<section class="c-section c-more" aria-labelledby="c-more-title"><h2 id="c-more-title" class="c-display">Also on the menu</h2><ul class="c-menu">' +
            m.related.map(function (p) {
              return '<li class="c-menu-row" style="' + m.ctx.capStyle(p) + '"><a class="c-menu-link" href="/products/' + p.id + '?design=' + m.ctx.design + '">' + m.ctx.cap(p, "c-menu-cap") + '<span class="c-menu-name"><span>' + esc(p.name) + "</span><small>" + esc(p.subtitle) + '</small></span><span class="c-menu-format">' + esc(m.ctx.format[p.id] || "") + '</span><span class="c-leader" aria-hidden="true"></span><span class="c-menu-price">' + m.ctx.money(p.price) + "</span></a>" + relatedAdd(m, p, "c-menu-add") + "</li>";
            }).join("") + '</ul><p class="pd-micro">All prices are samples.</p></section>'
          : "") +
        sticky(m) +
      "</article>"
    );
  }

  /* ==========================================================================
     D — Still life
     ========================================================================== */
  function pageD(m) {
    var esc = m.esc;
    var contents = [
      ["sl-facts", "Facts panel"],
      ["sl-care", "Directions and care"],
      ["pd-lot", "The lot record"],
      ["sl-service", "Delivery and help"],
      ["sl-voices", "Customer experiences"],
      ["sl-faq", "Questions"],
    ];
    if (guides(m).length) contents.push(["sl-reading", "Further reading"]);
    if (m.related.length) contents.push(["sl-shelf", "The rest of the shelf"]);
    var num = function (id) {
      var i = contents.findIndex(function (c) { return c[0] === id; });
      return (i < 9 ? "0" : "") + (i + 1);
    };
    var head = function (id, title) {
      return '<header class="sl-sec-head"><span class="sl-sec-no">' + num(id) + "</span><h2 id=\"" + id + '-title">' + title + "</h2></header>";
    };
    return (
      '<article class="pdp-d" style="' + m.ctx.capStyle(m.p) + '" aria-labelledby="pd-title">' +
        '<header class="sl-mast">' +
          crumbs(m, "Shop") +
          '<p class="sl-label">No. ' + m.no + " of " + m.totalNo + " · " + m.format + "</p>" +
          '<h1 id="pd-title" class="sl-title">' + m.title + "</h1>" +
          '<div class="sl-mast-aside"><p class="sl-sub">' + m.sub + '</p><p class="sl-lede">' + COPY.overview + "</p></div>" +
        "</header>" +
        '<section class="sl-top" aria-label="Product and purchase">' +
          '<figure class="sl-stage">' +
            '<div class="sl-room" aria-hidden="true"><span class="sl-sun"></span><span class="sl-blinds"></span><span class="sl-pool"></span><span class="sl-grain"></span></div>' +
            '<span class="sl-side" aria-hidden="true">' + m.short + "</span>" +
            '<div class="sl-object">' + cutout(m, "sl-bottle") + '<span class="sl-cast" aria-hidden="true"></span><span class="sl-plinth" aria-hidden="true"></span></div>' +
            '<figcaption class="sl-spec">' +
              '<span class="sl-spec-cell"><small class="sl-label">Format</small>' + m.format + "</span>" +
              '<span class="sl-spec-cell"><small class="sl-label">Ingredient</small>' + m.inView + "</span>" +
              '<span class="sl-spec-cell"><small class="sl-label">Purchase</small>One-time</span>' +
              '<span class="sl-spec-cell sl-spec-note">' + COPY.mockup + "</span>" +
            "</figcaption>" +
          "</figure>" +
          '<div class="sl-buy">' +
            '<ol class="sl-buy-steps">' +
              '<li><span class="sl-label">01 · Price</span>' + priceLine(m) + "</li>" +
              '<li><span class="sl-label">02 · Availability</span>' + stock(m) + purchase() + "</li>" +
              '<li><span class="sl-label">03 · Quantity</span><div class="pd-buy-row" data-pd-buy>' + qty(m) + addButton(m, "pd-add-main sl-ink") + '</div><p class="pd-micro">Preview order only. No payment or dispatch.</p></li>' +
              '<li><span class="sl-label">04 · Delivery</span>' + pincode() + "</li>" +
            "</ol>" +
          "</div>" +
        "</section>" +
        '<nav class="sl-contents" aria-label="Contents"><p class="sl-label">Contents</p><ol>' +
          contents.map(function (c, i) { return '<li><a href="#' + c[0] + '"><span>' + (i < 9 ? "0" : "") + (i + 1) + "</span>" + c[1] + "</a></li>"; }).join("") +
        "</ol></nav>" +

        '<section id="sl-facts" class="sl-sec" aria-labelledby="sl-facts-title">' + head("sl-facts", "What’s in the bottle") +
          '<div class="sl-sec-body sl-facts-grid">' +
            '<div class="sl-panel"><p class="sl-panel-title">Facts panel</p><p class="sl-panel-status">' + PENDING + "</p>" +
              '<dl class="sl-panel-rows"><div><dt>Serving size</dt><dd>—</dd></div><div><dt>Servings per pack</dt><dd>—</dd></div><div><dt>Format</dt><dd>' + m.format + "</dd></div></dl>" +
              formulaTable(m) +
              '<p class="sl-panel-foot">' + COPY.formula + "</p>" +
            "</div>" +
            '<div class="sl-facts-side"><h3>Still to confirm on the label</h3>' + list(m.confirm, "sl-ticks") +
              "<h3>Purpose and benefits</h3><p>" + COPY.purpose + "</p>" +
              "<h3>Further views</h3><p>" + COPY.mockup + " Still to come:</p>" + list(views(m), "sl-ticks") +
            "</div>" +
          "</div>" +
        "</section>" +

        '<section id="sl-care" class="sl-sec" aria-labelledby="sl-care-title">' + head("sl-care", "Directions and care") +
          '<div class="sl-sec-body"><dl class="sl-care-grid">' +
            care(m).map(function (c, i) { return '<div><dt><span class="sl-label">' + String.fromCharCode(97 + i) + "</span>" + c[0] + '</dt><dd><span class="sl-pending">' + PENDING + "</span>" + c[1] + "</dd></div>"; }).join("") +
          "</dl></div>" +
        "</section>" +

        '<section id="pd-lot" class="sl-lot" aria-labelledby="pd-lot-title">' +
          '<div class="sl-lot-inner">' +
            '<header class="sl-sec-head"><span class="sl-sec-no">' + num("pd-lot") + '</span><h2 id="pd-lot-title">The bottle, turned over.</h2></header>' +
            '<div class="sl-lot-body"><p>' + COPY.reportIs + "</p>" +
              '<div class="sl-lot-lists"><div><h3>It does</h3>' + list(does(), "sl-ticks") + "</div><div><h3>It doesn’t</h3>" + list(doesnt(), "sl-ticks") + "</div></div>" +
              lotForm(m, "sl-light") +
              '<p class="pd-micro">' + COPY.reportDemo + "</p>" +
            "</div>" +
            '<div class="sl-lot-object" aria-hidden="true"><span class="sl-lot-turn">' + m.ctx.image(m.p) + "</span></div>" +
          "</div>" +
        "</section>" +

        '<section id="sl-service" class="sl-sec" aria-labelledby="sl-service-title">' + head("sl-service", "Delivery and help") +
          '<div class="sl-sec-body"><dl class="sl-rows">' +
            "<div><dt>Delivery</dt><dd>" + COPY.delivery + " Sample delivery is ₹75, waived on sample orders of ₹1,499 or more. This is not the approved shipping policy.</dd></div>" +
            "<div><dt>Returns and cancellation</dt><dd>" + COPY.returns + "</dd></div>" +
            "<div><dt>Support</dt><dd>" + COPY.support + "</dd></div>" +
          '</dl><p class="sl-links">' + services().map(function (s) { return '<a href="' + s[0] + '">' + s[1] + m.ctx.icon("arrow") + "</a>"; }).join("") + "</p></div>" +
        "</section>" +

        '<section id="sl-voices" class="sl-sec sl-voices" aria-labelledby="sl-voices-title">' + head("sl-voices", "Customer experiences") +
          '<div class="sl-sec-body"><p class="sl-voices-lede">No reviews have been published for ' + m.name + " yet.</p><p>" + COPY.reviews + '</p><a class="sl-text-link" href="/account">Leave a review for a delivered order</a></div>' +
        "</section>" +

        '<section id="sl-faq" class="sl-sec" aria-labelledby="sl-faq-title">' + head("sl-faq", "Questions") +
          '<div class="sl-sec-body sl-faq-list">' + faqList(m, '<span class="sl-plus" aria-hidden="true"></span>') + "</div>" +
        "</section>" +

        (guides(m).length
          ? '<section id="sl-reading" class="sl-sec" aria-labelledby="sl-reading-title">' + head("sl-reading", "Further reading") +
            '<div class="sl-sec-body"><ol class="sl-reading-list">' +
            guides(m).map(function (g, i) { return '<li><a href="' + g[0] + '"><span class="sl-label">' + String.fromCharCode(97 + i) + " · " + g[1] + "</span><span>" + g[2] + "</span>" + m.ctx.icon("arrow") + "</a></li>"; }).join("") +
            "</ol></div></section>"
          : "") +

        (m.related.length
          ? '<section id="sl-shelf" class="sl-sec sl-shelf-sec" aria-labelledby="sl-shelf-title">' + head("sl-shelf", "The rest of the shelf") +
            '<div class="sl-sec-body"><ul class="sl-shelf">' +
            m.related.map(function (p) {
              return '<li class="sl-shelf-item" style="' + m.ctx.capStyle(p) + '"><a class="sl-shelf-link" href="/products/' + p.id + '?design=' + m.ctx.design + '"><span class="sl-shelf-photo">' + m.ctx.image(p) + '</span><span class="sl-label">' + numberOf(m, p) + '</span><span class="sl-shelf-name">' + esc(p.name) + '</span><span class="sl-shelf-sub">' + esc(p.subtitle) + '</span></a><p class="sl-shelf-meta"><span>' + esc(m.ctx.format[p.id] || "") + "</span><span><strong>" + m.ctx.money(p.price) + "</strong> <small>Sample price</small></span></p>" + relatedAdd(m, p, "sl-shelf-add") + "</li>";
            }).join("") + "</ul></div></section>"
          : "") +
        sticky(m) +
      "</article>"
    );
  }

  var PAGES = { a: pageA, b: pageB, c: pageC, d: pageD };

  window.BCCProductPage = function (ctx) {
    var m = model(ctx);
    return (PAGES[ctx.design] || pageC)(m);
  };
  /* Per-product "still to confirm" fields, shared with the ingredient notes in site-*.js. */
  window.BCCProductPage.toConfirm = TO_CONFIRM;

  /* ---------- Behaviour ---------- */
  /* Show the bar once the main purchase row has scrolled above the viewport; hide it again while the footer is in view
     (so it never covers the footer) and on wider screens. Rect checks on scroll are cheap and handle jumps, unlike
     intersection events, which don't fire when an element moves from above the viewport to below it. */
  var tick = 0;
  var narrow = window.matchMedia ? window.matchMedia("(max-width: 760px)") : null;
  function checkSticky() {
    tick = 0;
    var bar = document.querySelector("[data-pd-sticky]");
    var main = document.querySelector("[data-pd-buy]");
    if (!bar || !main) return document.body.classList.remove("pd-sticky-on");
    var footer = document.querySelector(".site-footer");
    var show = !!(narrow && narrow.matches) && main.getBoundingClientRect().bottom < 0 && (!footer || footer.getBoundingClientRect().top > window.innerHeight);
    if (bar.hidden === !show) return;
    bar.hidden = !show;
    document.body.classList.toggle("pd-sticky-on", show);
  }
  function queueSticky() { if (!tick) tick = requestAnimationFrame(checkSticky); }
  addEventListener("scroll", queueSticky, { passive: true });
  addEventListener("resize", queueSticky);
  window.BCCProductPage.enhance = function () {
    document.body.classList.remove("pd-sticky-on");
    checkSticky();
  };

  function selectTab(tab, focus) {
    var list = tab.closest("[role=tablist]");
    Array.prototype.forEach.call(list.querySelectorAll("[role=tab]"), function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
  }
  document.addEventListener("click", function (e) {
    var tab = e.target.closest && e.target.closest("[data-pd-tab]");
    if (tab) return selectTab(tab, false);
    var fill = e.target.closest && e.target.closest("[data-fill-pdp-lot]");
    if (fill) {
      var input = document.getElementById("pdp-lot-number");
      if (input) { input.value = fill.getAttribute("data-fill-pdp-lot"); input.focus(); }
    }
  });
  document.addEventListener("keydown", function (e) {
    var tab = e.target.closest && e.target.closest("[data-pd-tab]");
    if (!tab) return;
    var tabs = Array.prototype.slice.call(tab.closest("[role=tablist]").querySelectorAll("[role=tab]"));
    var i = tabs.indexOf(tab);
    var next = e.key === "ArrowRight" ? tabs[(i + 1) % tabs.length]
      : e.key === "ArrowLeft" ? tabs[(i - 1 + tabs.length) % tabs.length]
      : e.key === "Home" ? tabs[0]
      : e.key === "End" ? tabs[tabs.length - 1] : null;
    if (!next) return;
    e.preventDefault();
    selectTab(next, true);
  });
  document.addEventListener("change", function (e) {
    if (e.target && e.target.id === "product-quantity") {
      var q = document.querySelector("[data-pd-sticky-qty]");
      if (q) q.textContent = "Qty " + e.target.value;
    }
  });
})();
