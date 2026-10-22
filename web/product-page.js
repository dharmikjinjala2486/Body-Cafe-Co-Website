/* Body Café Co. — product detail page for all eight directions (A–H).

   One content model and one section order; each direction composes the same sections in its own visual language
   (product-page.css, scoped to .pp-a … .pp-h). This file replaces only each theme's `product` renderer.

   Sections, in order:
     1 Gallery + purchase panel   2 Overview   3 Ingredients and product facts   4 How to use + cautions
     5 Quality, sourcing and lot report   6 Customer reviews   7 Questions and answers   8 Other products

   Behaviour reuses the application:
   - Add to bag: [data-action="add-product"] + #product-quantity (app.js). Pincode: #pincode-form (app.js).
     Lot lookup: #pdp-lot + [data-fill-pdp-lot] (app.js / pdp.js).
   - API, session and sign-in: window.BCCApp (app.js). Reviews, photos and questions use the server's
     /api/reviews, /api/review-media and /api/questions endpoints, which enforce eligibility and moderation.

   Content rules: only catalogue facts, the sourced ingredient notes in site.js and approved site copy. Anything an
   approved label must supply is shown as awaiting it. No doses, pack counts, claims, sources, certifications,
   results, ratings or reviews are invented. Pack images are draft artwork and are captioned as such. */
(function () {
  "use strict";
  var S = window.BCCSite;
  if (!S || !S.themes) return;

  /* ====================================================================================================
     1. CONTENT
     ==================================================================================================== */
  var PENDING = "Awaiting approved label";
  var DRAFT = "Draft packaging. Front-of-pack design mockup; wording printed on the pack is label artwork, not a claim made on this site.";
  var IMG_W = { "creatine-chews": 716, "iron-bisglycinate": 774, "l-theanine": 774, "myo-d-chiro-inositol": 716, "omega-3-fish-oil": 715, "psyllium-husk": 714, "vitamin-d3-k2": 667 };

  /* Product-specific facts that are confirmed. Fields left out are shown as awaiting the approved label.
     Add approved values here (and approved images to `images`) as records arrive; every direction updates. */
  var FACTS = {
    "iron-bisglycinate": {},
    "l-theanine": {},
    "vitamin-d3-k2": { allergenNote: "Includes omega-3 as triglycerides. Its source will be stated on the approved label." },
    "omega-3-fish-oil": { allergenNote: "Omega-3 Fish Oil comes from fish." },
    "myo-d-chiro-inositol": {},
    "creatine-chews": { formulationPending: true, flavourPending: true },
    "psyllium-husk": {},
  };

  /* Approved images per product, in gallery order. Only accurate, available assets. The 3D three-quarter renders are
     not used: their printed wording differs from the approved front mockups. */
  function images(p) {
    var name = p.name;
    var list = [
      { kind: "front", src: "/web/media/" + p.id + ".webp", w: IMG_W[p.id] || 715, h: 1000, alt: name + ", front of the bottle (draft packaging)", label: "Front of the bottle", caption: DRAFT },
      { kind: "cap", src: "/web/media/renders/" + p.id + "-cap.webp", w: 400, h: 400, alt: name + " cap, seen from above", label: "Cap colour, from above", caption: "Each product has its own cap colour. Studio render." },
    ];
    var extra = (FACTS[p.id] && FACTS[p.id].images) || [];
    return list.concat(extra);
  }

  var COPY = {
    purpose: "An approved purpose statement for this product hasn't been supplied yet, so this page doesn't describe benefits or results.",
    tax: "Sample price, inclusive of illustrative tax. Final GST rates await approval.",
    offer: "No offers are running.",
    shipping: "Illustrative ₹75 delivery charge, waived on a sample order subtotal of ₹1,499 or more after any discount.",
    returns: "Return eligibility, timing and remedies haven't been decided yet. If something's wrong with an order, open a support case.",
    delivery: "The check confirms the pincode format. Serviceability and delivery dates aren't set up yet, so no date is promised.",
    directions: "Directions will come from the approved label. This page doesn't suggest a dose.",
    storage: "Storage instructions will come from the approved label.",
    age: "Purchases are limited to adults: checkout asks you to confirm you're 18 or older.",
    reportScope: "A lot report describes the sample tested from one manufacturing lot. It doesn't authenticate an individual pack or promise a health outcome.",
    reportDemo: "Preview records are demonstrations. No laboratory document is connected.",
    reviewsRule: "Reviews come from signed-in customers whose order containing this product was delivered. Every review and photo is checked by our moderators before it appears, whatever its rating.",
    noReviews: "There are no published reviews for this product yet. Reviews appear after a verified delivery and moderation; we don't add sample or invented ones.",
    questionsRule: "Questions are answered by Body Café Co. support. An answer is published here only after review, and only from approved product information. We don't give personal medical advice.",
    privateIssue: "For an order, delivery or account issue, contact support privately instead.",
    explore: "Shown for browsing. Products aren't recommended to be taken together.",
  };

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function esc(ctx, s) { return ctx.escape(String(s == null ? "" : s)); }
  function stars(n, label) {
    var full = Math.round(n * 2) / 2, out = "";
    for (var i = 1; i <= 5; i++) out += '<span class="pp-star' + (i <= full ? " is-on" : i - 0.5 === full ? " is-half" : "") + '" aria-hidden="true"></span>';
    return '<span class="pp-stars" role="img" aria-label="' + (label || n + " out of 5 stars") + '">' + out + "</span>";
  }

  function model(ctx, p) {
    var idx = Math.max(0, ctx.catalog.indexOf(p));
    var notes = (S.notes && S.notes[p.id]) || { lead: "", check: [], compound: "", sources: [] };
    var f = FACTS[p.id] || {};
    var raw = String(p.ingredients || "");
    var off = !p.published ? "unpublished" : !(p.stock > 0) ? "stock" : "";
    var published = ctx.catalog.filter(function (x) { return x.published && x.id !== p.id; });
    var after = published.filter(function (x) { return ctx.catalog.indexOf(x) > idx; });
    var confirm = ((window.BCCProductPage && window.BCCProductPage.toConfirm && window.BCCProductPage.toConfirm[p.id]) || []).concat(["Complete ingredient list, allergens, storage and manufacturer details"]);
    var rating = p.rating || { count: 0, average: null };
    return {
      p: p, ctx: ctx, id: p.id, n: idx + 1, no: pad(idx + 1), total: pad(ctx.catalog.length),
      name: esc(ctx, p.name), sub: esc(ctx, p.subtitle), format: esc(ctx, ctx.format[p.id] || ""), category: esc(ctx, p.category || ""),
      inView: esc(ctx, raw.split(";")[0]), formulationPending: !!f.formulationPending, flavourPending: !!f.flavourPending, allergenNote: f.allergenNote || "",
      price: ctx.money(p.price), off: off, stock: p.stock, max: off ? 1 : Math.max(1, Math.min(5, p.stock)),
      sample: "DEMO-" + pad(idx + 1) + "-01", notes: notes, confirm: confirm, images: images(p), rating: rating,
      related: after.concat(published.filter(function (x) { return ctx.catalog.indexOf(x) < idx; })).slice(0, 3),
      color: p.color, staticPreview: !!ctx.staticPreview,
    };
  }

  /* ====================================================================================================
     2. BUILDERS — semantic HTML with pp-* hooks; directions restyle these and never change facts.
     ==================================================================================================== */
  function stockLine(m) {
    var t = m.off === "unpublished" ? "Not available. This product isn't published right now."
      : m.off === "stock" ? "Out of stock in the preview"
      : m.stock <= 5 ? "In stock in the preview: " + m.stock + " left"
      : "In stock in the preview";
    return '<p class="pp-stock" data-state="' + (m.off || "in") + '"><span class="pp-dot" aria-hidden="true"></span>' + t + "</p>";
  }
  function ratingLink(m) {
    var r = m.rating;
    if (!r.count) return '<a class="pp-rating is-empty" href="#reviews">No reviews yet</a>';
    return '<a class="pp-rating" href="#reviews">' + stars(r.average, r.average + " out of 5 stars") + "<span>" + r.average + " · " + r.count + " review" + (r.count === 1 ? "" : "s") + "</span></a>";
  }
  function qty(m) {
    var o = "";
    for (var i = 1; i <= m.max; i++) o += '<option value="' + i + '">' + i + "</option>";
    return '<div class="pp-qty"><label for="product-quantity">Quantity</label><select id="product-quantity"' + (m.off ? " disabled" : "") + ">" + o + "</select></div>";
  }
  function addBtn(m, cls) {
    return '<button type="button" class="pp-add ' + (cls || "") + '" data-action="add-product" data-id="' + m.id + '"' + (m.off ? " disabled" : "") + "><span>" + (m.off ? "Unavailable" : "Add to bag") + "</span></button>";
  }
  function pincode() {
    return '<form id="pincode-form" class="pp-pincode" novalidate><label for="pincode">Check delivery to your pincode</label><div class="pp-inline"><input id="pincode" name="pincode" inputmode="numeric" autocomplete="postal-code" pattern="[1-9][0-9]{5}" maxlength="6" placeholder="6-digit pincode" required aria-describedby="pincode-help pincode-result"><button type="submit">Check</button></div><p id="pincode-help" class="pp-micro">' + COPY.delivery + '</p><p id="pincode-result" class="pp-micro pp-result" role="status"></p></form>';
  }
  function packFacts(m) {
    return '<dl class="pp-pack"><div><dt>Format</dt><dd>' + m.format + "</dd></div><div><dt>Pack quantity</dt><dd class=\"is-pending\">" + PENDING + "</dd></div><div><dt>Serving size</dt><dd class=\"is-pending\">" + PENDING + "</dd></div><div><dt>Servings per pack</dt><dd class=\"is-pending\">" + PENDING + "</dd></div></dl>";
  }
  function quickLinks() {
    return '<nav class="pp-quick" aria-label="On this page"><a href="#ingredients">Ingredients</a><a href="#use">How to use</a><a href="#reviews">Reviews</a><a href="#quality">Lot report</a></nav>';
  }
  function terms() {
    return '<details class="pp-terms"><summary>Delivery, returns and tax</summary><dl><div><dt>Delivery</dt><dd>' + COPY.shipping + ' <a href="/policies/shipping">Shipping policy</a></dd></div><div><dt>Returns</dt><dd>' + COPY.returns + ' <a href="/policies/returns">Returns policy</a></dd></div><div><dt>Tax</dt><dd>' + COPY.tax + "</dd></div><div><dt>Offers</dt><dd>" + COPY.offer + "</dd></div></dl></details>";
  }
  /* The purchase panel. `head` lets a direction place the title block elsewhere (E puts it in the cap band). */
  function panel(m, o) {
    o = o || {};
    return '<div class="pp-panel" data-pp-panel>' +
      (o.noHead ? "" : titleBlock(m)) +
      '<div class="pp-pricebox"><p class="pp-price"><span class="pp-price-num">' + m.price + '</span><span class="pp-price-note">Sample price · incl. illustrative tax</span></p>' + ratingLink(m) + "</div>" +
      stockLine(m) + packFacts(m) +
      '<div class="pp-buyrow" data-pp-buy>' + qty(m) + addBtn(m, "pp-add-main") + "</div>" +
      '<p class="pp-micro">One-time purchase. Preview order only: no payment or dispatch.</p>' +
      pincode() + terms() + quickLinks() + "</div>";
  }
  function titleBlock(m) {
    return '<div class="pp-title"><p class="pp-eyebrow"><span>' + m.no + " / " + m.total + "</span><span>" + m.format + "</span></p><h1 class=\"pp-h1\" id=\"pp-h1\">" + m.name + '</h1><p class="pp-sub">' + m.sub + "</p></div>";
  }
  function crumbs(m) {
    return '<nav class="pp-crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/shop">Shop</a></li><li aria-current="page">' + m.name + "</li></ol></nav>";
  }

  function gallery(m) {
    var im = m.images, many = im.length > 1;
    return '<div class="pp-gallery" data-pp-gallery data-count="' + im.length + '" style="--ratio:' + im[0].w + "/" + im[0].h + '">' +
      '<div class="pp-stage"><ul class="pp-slides" data-pp-slides aria-label="Product images" tabindex="0">' +
      im.map(function (x, i) {
        return '<li class="pp-slide pp-slide-' + x.kind + '" data-pp-slide="' + i + '" data-caption="' + attr(x.caption) + '" aria-roledescription="slide" aria-label="' + (i + 1) + " of " + im.length + ": " + x.label + '"><button type="button" class="pp-open" data-pp-open="' + i + '" aria-label="Enlarge image ' + (i + 1) + ": " + x.label + '"><img src="' + x.src + '" alt="' + x.alt + '" width="' + x.w + '" height="' + x.h + '"' + (i ? ' loading="lazy"' : ' fetchpriority="high"') + ' decoding="async"></button></li>';
      }).join("") + "</ul>" +
      (many ? '<div class="pp-stage-ctl"><button type="button" class="pp-nav" data-pp-step="-1" aria-label="Previous image">‹</button><p class="pp-count" data-pp-count aria-live="polite">1 / ' + im.length + '</p><button type="button" class="pp-nav" data-pp-step="1" aria-label="Next image">›</button></div>' : "") +
      '<button type="button" class="pp-enlarge" data-pp-open="current"><span>Enlarge</span></button></div>' +
      (many ? '<div class="pp-thumbs" role="group" aria-label="Choose an image">' + im.map(function (x, i) {
        return '<button type="button" class="pp-thumb" data-pp-thumb="' + i + '" aria-pressed="' + (i === 0) + '" aria-label="Show image ' + (i + 1) + ": " + x.label + '"><img src="' + x.src + '" alt="" width="' + x.w + '" height="' + x.h + '" loading="lazy" decoding="async"></button>';
      }).join("") + "</div>" : "") +
      '<p class="pp-caption" data-pp-caption>' + im[0].caption + "</p></div>";
  }

  function attr(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); }
  function lead(text) { return '<p class="pp-lead">' + text + "</p>"; }
  function sub(t) { return '<h3 class="pp-sub-h">' + t + "</h3>"; }
  function factRows(rows, cls) {
    return '<dl class="' + (cls || "pp-facts") + '">' + rows.map(function (r) { return '<div' + (r[2] ? ' class="is-pending"' : "") + "><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; }).join("") + "</dl>";
  }
  function sources(list) {
    if (!list || !list.length) return "";
    return '<p class="pp-sources-k">Sources</p><ol class="pp-sources">' + list.map(function (s) { return '<li><a href="' + s[1] + '" rel="noopener" target="_blank">' + s[0] + "</a></li>"; }).join("") + "</ol>";
  }

  function overview(m) {
    return lead(m.notes.lead || m.sub) +
      factRows([["Format", m.format], ["Ingredient in view", m.inView + (m.formulationPending ? " (complete formulation pending)" : "")], ["Collection", m.category], ["Purchase", "One-time purchase"]], "pp-facts pp-facts-overview") +
      '<p class="pp-status"><strong>Purpose.</strong> ' + COPY.purpose + "</p>";
  }
  function ingredients(m) {
    var rows = [
      ["Ingredients and forms", "In view: " + m.inView + ". The complete list with each ingredient's form comes from the approved label.", false],
      ["Amount per serving", PENDING, true],
      ["Serving size", PENDING, true],
      ["Servings per pack", PENDING, true],
      ["Other ingredients and " + (m.p.id === "creatine-chews" ? "chew base" : "capsule or softgel shell"), PENDING, true],
    ];
    if (m.flavourPending) rows.push(["Flavour and sweeteners", PENDING, true]);
    rows.push(["Nutrition information", PENDING, true]);
    rows.push(["Allergens", m.allergenNote ? m.allergenNote + " Full allergen statement: " + PENDING.toLowerCase() + "." : PENDING, !m.allergenNote]);
    rows.push(["Dietary suitability", PENDING, true]);
    rows.push(["Manufacturer and licence details", PENDING, true]);
    return lead("What's inside, in readable text. Everything here comes from confirmed records; the rest will come from the approved rear label.") +
      factRows(rows, "pp-facts pp-facts-label") +
      '<div class="pp-cols">' +
        '<div>' + sub("What the approved label will state") + '<ul class="pp-list">' + m.confirm.map(function (c) { return "<li>" + c + "</li>"; }).join("") + "</ul></div>" +
        '<div>' + sub("Approved label image") + '<p class="pp-p">The approved rear label hasn\'t been supplied, so there\'s no label image yet. When it arrives it will be shown here and in the gallery, and can be enlarged to read.</p></div>' +
      "</div>" +
      (m.notes.compound ? '<aside class="pp-aside"><p class="pp-aside-k">Reading this ingredient</p><p>' + m.notes.compound + "</p>" + sources(m.notes.sources) + "</aside>" : "");
  }
  function use(m) {
    var checks = (m.notes.check || []).slice(0, 4);
    return lead("Approved directions and cautions belong together. Until the approved label arrives, here is what's confirmed, and what to look for.") +
      factRows([
        ["Recommended use", COPY.directions, true],
        ["Preparation", PENDING, true],
        ["Age", COPY.age],
        ["Suitability", PENDING, true],
        ["Cautions and interactions", PENDING + ". " + S.CARE_NOTE, true],
        ["Allergens", m.allergenNote || PENDING, !m.allergenNote],
        ["Storage", COPY.storage, true],
      ], "pp-facts pp-facts-use") +
      (checks.length ? sub("What to check on the label") + '<ul class="pp-checks">' + checks.map(function (c) { return "<li><strong>" + c[0] + "</strong><span>" + c[1] + "</span></li>"; }).join("") + "</ul>" : "") +
      '<p class="pp-safety"><strong>Something wrong with a product?</strong> <a href="/contact?kind=safety">Report a safety concern privately</a>. It opens a priority support case, separate from reviews.</p>';
  }
  function quality(m) {
    return lead("Sourcing, testing and documents are shown here only when they're confirmed for this product.") +
      factRows([
        ["Ingredient sourcing", "Not yet published", true],
        ["Manufacturer", "Not yet published", true],
        ["Testing performed", "No test results published", true],
        ["Supporting documents", "None published", true],
        ["Certifications", "None claimed", true],
      ], "pp-facts pp-facts-quality") +
      '<div class="pp-lotbox"><h3 class="pp-sub-h">Find a lot report</h3><p class="pp-p">Enter the lot number printed on your pack of ' + m.name + '. It\'s different from the barcode and your order number.</p>' +
      '<form id="pdp-lot" class="pp-lotform"><input type="hidden" name="product" value="' + m.id + '"><label for="pdp-lot-number">Lot number on your pack</label><div class="pp-inline"><input id="pdp-lot-number" name="lot" maxlength="60" required autocomplete="off" placeholder="e.g. ' + m.sample + '"><button type="submit">Find a lot report</button></div>' +
      '<p class="pp-micro"><span class="pp-demo">Demonstration record</span> Try <button type="button" class="pp-linkbtn" data-fill-pdp-lot="' + m.sample + '">the sample lot ' + m.sample + '</button>, or <a href="/reports?product=' + m.id + '">open the lot lookup for this product</a>.</p></form>' +
      '<p class="pp-micro">' + COPY.reportScope + " " + COPY.reportDemo + "</p></div>" +
      '<p class="pp-p"><a href="/standards#evidence">How we approach quality and evidence</a> · <a href="/learn/understanding-reports">What a lot report shows</a></p>';
  }
  function reviews(m) {
    return '<div class="pp-reviews" data-pp-reviews data-product="' + m.id + '">' +
      '<div class="pp-rv-top"><div class="pp-rv-summary" data-pp-rv-summary aria-live="polite"><p class="pp-p">Loading the review summary…</p></div>' +
      '<div class="pp-rv-write"><button type="button" class="pp-btn" data-pp-write aria-expanded="false" aria-controls="pp-write-panel">Write a review</button><p class="pp-micro">' + COPY.reviewsRule + "</p></div></div>" +
      '<section class="pp-write" id="pp-write-panel" data-pp-write-panel hidden aria-labelledby="pp-write-t" tabindex="-1"><h3 class="pp-sub-h" id="pp-write-t">Review ' + m.name + '</h3><div data-pp-write-body></div></section>' +
      '<div class="pp-rv-controls" data-pp-rv-controls hidden><div class="pp-rv-filter" role="group" aria-label="Filter by rating">' +
      ["", "5", "4", "3", "2", "1"].map(function (r) { return '<button type="button" class="pp-chip" data-pp-rating="' + r + '" aria-pressed="' + (r === "") + '">' + (r ? r + " ★" : "All") + "</button>"; }).join("") +
      '</div><div class="pp-rv-sort"><label for="pp-sort">Sort</label><select id="pp-sort" data-pp-sort><option value="newest">Newest</option><option value="highest">Highest rated</option><option value="lowest">Lowest rated</option></select></div></div>' +
      '<div class="pp-rv-list" data-pp-rv-list aria-live="polite" aria-busy="true"></div>' +
      '<p class="pp-p pp-rv-more-wrap"><button type="button" class="pp-btn is-quiet" data-pp-more hidden>Load more reviews</button></p>' +
      "</div>";
  }
  function productFaqs(m) {
    return [
      ["How much is in each serving?", "Amounts per serving come from the approved rear label, which hasn't been supplied yet. This page doesn't suggest a dose."],
      ["How many " + (m.format ? m.format.toLowerCase() : "units") + " are in a pack?", "The pack quantity will come from the approved label. The count printed on the draft packaging image isn't confirmed."],
      ["Where's the lot number on my pack?", "A guide will be added with the final rear label. Your lot number is different from your order number or the barcode."],
      ["Are these the final prices?", "No. Every price in the preview is a sample. Final prices, GST, shipping rules and offers are still being approved."],
    ];
  }
  function questions(m) {
    return '<div class="pp-qa" data-pp-qa data-product="' + m.id + '">' +
      sub("Common questions") + '<div class="pp-faqs">' + productFaqs(m).map(function (f) { return '<details class="pp-faq"><summary><span>' + f[0] + '</span><span class="pp-mark" aria-hidden="true"></span></summary><p>' + f[1] + "</p></details>"; }).join("") + "</div>" +
      sub("Answered questions") + '<div class="pp-qa-list" data-pp-qa-list aria-live="polite"><p class="pp-p">Loading answered questions…</p></div>' +
      '<div class="pp-ask"><h3 class="pp-sub-h" id="pp-ask-t">Ask a question about ' + m.name + "</h3><p class=\"pp-micro\">" + COPY.questionsRule + " " + COPY.privateIssue.replace("contact support privately", '<a href="/contact">contact support privately</a>') + "</p>" +
      (m.staticPreview ? '<p class="pp-note">Questions can\'t be sent from this shared design preview.</p>' :
        '<form class="pp-askform" data-pp-ask novalidate aria-labelledby="pp-ask-t"><label for="pp-question">Your question</label><textarea id="pp-question" name="question" minlength="10" maxlength="600" required aria-describedby="pp-question-help"></textarea><p id="pp-question-help" class="pp-micro">10–600 characters. Please don\'t include order numbers, contact details or health information.</p><div class="pp-form-error" role="alert"></div><button type="submit" class="pp-btn">Send question</button><div class="pp-ask-result" data-pp-ask-result role="status"></div></form>') +
      "</div></div>";
  }
  function explore(m, ctx) {
    if (!m.related.length) return "";
    return '<p class="pp-micro">' + COPY.explore + '</p><ul class="pp-related">' + m.related.map(function (r) {
      return '<li style="--cap:' + r.color + '"><a href="/products/' + r.id + '"><span class="pp-rel-img"><img src="/web/media/' + r.id + '.webp" alt="" width="' + (IMG_W[r.id] || 715) + '" height="1000" loading="lazy" decoding="async"></span><span class="pp-rel-name">' + esc(ctx, r.name) + '</span><span class="pp-rel-meta">' + esc(ctx, ctx.format[r.id] || "") + " · " + ctx.money(r.price) + " sample price</span></a></li>";
    }).join("") + '</ul><p class="pp-p"><a href="/shop">See all seven products</a></p>';
  }
  function sticky(m) {
    return '<div class="pp-sticky" data-pp-sticky hidden><div class="pp-sticky-in"><span class="pp-sticky-dot" aria-hidden="true"></span><span class="pp-sticky-text"><strong>' + m.name + "</strong><span>" + m.price + " · " + (m.off ? "Unavailable" : "In stock") + "</span></span>" + '<button type="button" class="pp-add pp-add-sticky" data-pp-sticky-add' + (m.off ? " disabled" : "") + "><span>" + (m.off ? "Unavailable" : "Add to bag") + "</span></button></div></div>";
  }
  function lightbox(m) {
    return '<dialog class="pp-lightbox" data-pp-lightbox aria-label="' + m.name + ' images"><div class="pp-lb-bar"><p class="pp-lb-count" data-pp-lb-count aria-live="polite"></p><div class="pp-lb-tools"><button type="button" data-pp-zoom="out" aria-label="Zoom out">−</button><button type="button" data-pp-zoom="in" aria-label="Zoom in">+</button><button type="button" data-pp-lb-close aria-label="Close">×</button></div></div>' +
      '<div class="pp-lb-stage" data-pp-lb-stage tabindex="0" aria-describedby="pp-lb-help"><img data-pp-lb-img alt="" draggable="false"></div>' +
      '<div class="pp-lb-foot"><button type="button" class="pp-nav" data-pp-lb-step="-1" aria-label="Previous image">‹</button><p class="pp-lb-caption" data-pp-lb-caption></p><button type="button" class="pp-nav" data-pp-lb-step="1" aria-label="Next image">›</button></div>' +
      '<p id="pp-lb-help" class="sr-only">Use plus and minus to zoom, arrow keys to move around a zoomed image or change image, and Escape to close.</p></dialog>';
  }

  /* ====================================================================================================
     3. DIRECTIONS — the same sections, composed in each direction's own language.
     ==================================================================================================== */
  var SECTIONS = [
    ["overview", "Overview", "What is it?"],
    ["ingredients", "Ingredients and product facts", "What's inside?"],
    ["use", "How to use and cautions", "How do I take it?"],
    ["quality", "Quality, sourcing and lot report", "How can I check it?"],
    ["reviews", "Customer reviews", "What do customers say?"],
    ["questions", "Questions and answers", "Still wondering?"],
    ["explore", "Other products to explore", "What else is there?"],
  ];
  function bodyFor(id, m, ctx) {
    return { overview: overview, ingredients: ingredients, use: use, quality: quality, reviews: reviews, questions: questions, explore: function (mm) { return explore(mm, ctx); } }[id](m);
  }
  function section(v, m, ctx, s, i) {
    var id = s[0], label = s[1], q = s[2], n = pad(i + 2);
    var k = v.k ? v.k(n, label, q) : '<span class="pp-k-n">' + n + '</span><span class="pp-k-l">' + label + "</span>";
    var title = v.title ? v.title(id, label, m) : label;
    return '<section class="pp-sec pp-sec-' + id + '" id="' + id + '" aria-labelledby="' + id + '-t"><div class="pp-sec-in">' +
      '<header class="pp-head">' + (v.pre ? v.pre(n, label, q) : "") + '<p class="pp-k">' + k + '</p><h2 id="' + id + '-t">' + title + "</h2></header>" +
      '<div class="pp-body">' + bodyFor(id, m, ctx) + "</div></div></section>";
  }
  function compose(v, ctx, p) {
    var m = model(ctx, p);
    return '<div class="pp pp-' + v.key + '" data-pp data-pp-product="' + m.id + '" style="--cap:' + m.color + ";" + "--on-cap:" + (ctx.onCap ? ctx.onCap(m.color) : "#fff") + '">' +
      v.hero(m, ctx) +
      SECTIONS.map(function (s, i) { return section(v, m, ctx, s, i); }).join("") +
      sticky(m) + lightbox(m) + "</div>";
  }
  function heroGrid(m, inner, cls) {
    return '<section class="pp-hero' + (cls ? " " + cls : "") + '" id="buy" aria-labelledby="pp-h1">' + inner + "</section>";
  }
  function std(m) { return crumbs(m) + '<div class="pp-hero-grid"><div class="pp-hero-media">' + gallery(m) + '</div><div class="pp-hero-panel">' + panel(m) + "</div></div>"; }

  var V = {
    /* A — State of Play: poster type in electric blue, a lime highlighter, a tilted specimen card for the gallery. */
    a: { key: "a", hero: function (m) { return heroGrid(m, std(m)); }, k: function (n, l) { return '<span class="pp-k-n">[' + n + ']</span><span class="pp-k-l">' + l + "</span>"; } },
    /* B — Expressive everyday: soft colour fields, rounded shapes and the visitor's question in a bubble. */
    b: { key: "b", hero: function (m) { return heroGrid(m, std(m)); }, pre: function (n, l, q) { return '<p class="pp-bubble">' + q + "</p>"; } },
    /* C — Everyday Elsewhere: butter-yellow paper, serif display, the gallery as a postcard, chapters with stamps. */
    c: { key: "c", hero: function (m) { return heroGrid(m, std(m)); }, pre: function (n) { return '<span class="pp-stamp" aria-hidden="true">' + n + "</span>"; }, k: function (n, l) { return "Chapter " + n + " · " + l; } },
    /* D — The Other Side: after hours in the museum. Midnight blue, a lit vitrine, gold wall labels. */
    d: { key: "d", hero: function (m) { return heroGrid(m, std(m)); }, k: function (n, l) { return "Room " + n + " · " + l; } },
    /* E — Fan Deck: the page is the bottle. The cap-colour band holds the title; the cream body holds the panel. */
    e: {
      key: "e",
      hero: function (m) {
        return heroGrid(m, '<div class="pp-band">' + crumbs(m) + titleBlock(m) + "</div>" + '<div class="pp-hero-grid"><div class="pp-hero-media">' + gallery(m) + '</div><div class="pp-hero-panel">' + panel(m, { noHead: true }) + "</div></div>");
      },
      k: function (n, l) { return '<span class="pp-k-n">' + n + '</span><span class="pp-k-l">' + l + '</span><span class="pp-k-of">/ 08</span>'; },
    },
    /* F — Edition: a printed feature. Colour-field figure plate, ultralight headline, folios and italic deks. */
    f: {
      key: "f",
      hero: function (m) { return heroGrid(m, '<p class="pp-folio"><span>Edition 01</span><span>No. ' + m.no + " of " + m.total + "</span></p>" + std(m)); },
      k: function (n, l) { return "No. " + n + " · " + l; },
      pre: null,
      title: function (id, l) { return l; },
    },
    /* G — Darkroom: a black gallery beside a white reading column; sections develop black and white in turn. */
    g: { key: "g", hero: function (m) { return heroGrid(m, std(m)); }, k: function (n, l) { return '<span class="pp-k-l">Frame ' + n + " / 08</span><span>" + l + "</span>"; } },
    /* H — Folio: a well-set reference page. Running heads in a margin, small plates, ruled facts. */
    h: { key: "h", hero: function (m) { return heroGrid(m, std(m)); }, k: function (n, l) { return "§ " + parseInt(n, 10) + " · " + l; } },
  };

  Object.keys(V).forEach(function (d) {
    if (!S.themes[d]) return;
    var base = S.themes[d], next = {};
    Object.keys(base).forEach(function (k) { next[k] = base[k]; });
    next.product = function (ctx, p) { return compose(V[d], ctx, p); };
    S.themes[d] = next;
  });

  /* ====================================================================================================
     4. BEHAVIOUR
     ==================================================================================================== */
  var App = function () { return window.BCCApp || null; };
  var cleanup = function () {};
  var reducedMotion = function () { return matchMedia("(prefers-reduced-motion: reduce)").matches; };

  function enhance() {
    cleanup();
    var root = document.querySelector("[data-pp]");
    if (!root) return;
    var abort = new AbortController(), signal = abort.signal, observers = [];
    var on = function (el, ev, fn, opt) { if (el) el.addEventListener(ev, fn, Object.assign({ signal: signal }, opt || {})); };
    var product = root.getAttribute("data-pp-product");
    galleryBehaviour(root, on, observers);
    stickyBehaviour(root, on, observers);
    lightboxBehaviour(root, on);
    reviewsBehaviour(root, on, product, signal);
    questionsBehaviour(root, on, product, signal);
    cleanup = function () {
      abort.abort();
      observers.forEach(function (o) { o.disconnect(); });
      document.body.classList.remove("pp-sticky-on");
    };
  }

  /* ---------- Gallery: thumbnails, arrows, keyboard, swipe (native scroll-snap) and a live count ---------- */
  function galleryBehaviour(root, on, observers) {
    var g = root.querySelector("[data-pp-gallery]");
    if (!g) return;
    var track = g.querySelector("[data-pp-slides]"), slides = [].slice.call(g.querySelectorAll("[data-pp-slide]"));
    var thumbs = [].slice.call(g.querySelectorAll("[data-pp-thumb]")), count = g.querySelector("[data-pp-count]"), cap = g.querySelector("[data-pp-caption]");
    var caps = DATA.captions(root);
    var current = 0;
    function set(i, scroll) {
      current = (i + slides.length) % slides.length;
      thumbs.forEach(function (t, n) { t.setAttribute("aria-pressed", String(n === current)); });
      if (count) count.textContent = current + 1 + " / " + slides.length;
      if (cap) cap.textContent = caps[current] || "";
      g.setAttribute("data-current", current);
      if (scroll) track.scrollTo({ left: slides[current].offsetLeft - track.offsetLeft, behavior: reducedMotion() ? "auto" : "smooth" });
    }
    g.ppCurrent = function () { return current; };
    thumbs.forEach(function (t) { on(t, "click", function () { set(+t.getAttribute("data-pp-thumb"), true); }); });
    g.querySelectorAll("[data-pp-step]").forEach(function (b) { on(b, "click", function () { set(current + +b.getAttribute("data-pp-step"), true); }); });
    on(track, "keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); set(current + (e.key === "ArrowRight" ? 1 : -1), true); }
    });
    if ("IntersectionObserver" in window && slides.length > 1) {
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (x) { if (x.isIntersecting && x.intersectionRatio > 0.6) set(+x.target.getAttribute("data-pp-slide"), false); });
      }, { root: track, threshold: [0.6] });
      slides.forEach(function (s) { io.observe(s); });
      observers.push(io);
    }
  }

  /* Gallery captions live on each slide's data attribute (set at render) so the count and caption stay in sync. */
  var DATA = {
    captions: function (root) {
      return [].slice.call(root.querySelectorAll("[data-pp-slide]")).map(function (li) { return li.getAttribute("data-caption") || ""; });
    },
  };

  /* ---------- Mobile sticky purchase bar ---------- */
  function stickyBehaviour(root, on, observers) {
    var bar = root.querySelector("[data-pp-sticky]"), buy = root.querySelector("[data-pp-buy]");
    if (!bar || !buy) return;
    var narrow = matchMedia("(max-width: 760px)");
    var tick = 0;
    function check() {
      tick = 0;
      var footer = document.querySelector(".site-footer") || [].slice.call(document.querySelectorAll("footer")).filter(function (f) { return !f.closest("[data-pp]"); }).pop();
      var show = narrow.matches && buy.getBoundingClientRect().bottom < 0 && (!footer || footer.getBoundingClientRect().top > innerHeight);
      if (bar.hidden === !show) return;
      bar.hidden = !show;
      document.body.classList.toggle("pp-sticky-on", show);
    }
    var queue = function () { if (!tick) tick = requestAnimationFrame(check); };
    on(window, "scroll", queue, { passive: true });
    on(window, "resize", queue);
    /* The bar's button reuses the page's own Add to bag (and its quantity) instead of duplicating the cart contract. */
    on(bar.querySelector("[data-pp-sticky-add]"), "click", function () { var main = root.querySelector("[data-action=add-product]"); if (main && !main.disabled) main.click(); });
    check();
  }

  /* ---------- Full-screen viewer with zoom ---------- */
  function lightboxBehaviour(root, on) {
    var dlg = root.querySelector("[data-pp-lightbox]");
    var g = root.querySelector("[data-pp-gallery]");
    if (!dlg || !g) return;
    var stage = dlg.querySelector("[data-pp-lb-stage]"), img = dlg.querySelector("[data-pp-lb-img]");
    var count = dlg.querySelector("[data-pp-lb-count]"), cap = dlg.querySelector("[data-pp-lb-caption]");
    var list = [], i = 0, z = 1, x = 0, y = 0, opener = null;
    function load(set, start) { list = set; show(start); }
    function show(n) {
      i = (n + list.length) % list.length;
      var it = list[i];
      img.src = it.src; img.alt = it.alt; img.width = it.w; img.height = it.h;
      count.textContent = list.length > 1 ? i + 1 + " / " + list.length : "";
      cap.textContent = it.caption || "";
      dlg.querySelectorAll("[data-pp-lb-step]").forEach(function (b) { b.hidden = list.length < 2; });
      zoom(1);
    }
    function apply() {
      var maxX = Math.max(0, (img.clientWidth * z - stage.clientWidth) / 2), maxY = Math.max(0, (img.clientHeight * z - stage.clientHeight) / 2);
      x = Math.max(-maxX, Math.min(maxX, x)); y = Math.max(-maxY, Math.min(maxY, y));
      img.style.transform = "translate(" + x + "px," + y + "px) scale(" + z + ")";
      stage.classList.toggle("is-zoomed", z > 1);
      dlg.querySelector("[data-pp-zoom=out]").disabled = z <= 1;
      dlg.querySelector("[data-pp-zoom=in]").disabled = z >= 4;
    }
    function zoom(nz, cx, cy) {
      nz = Math.max(1, Math.min(4, nz));
      if (nz === 1) { x = 0; y = 0; }
      else if (cx != null) { var r = stage.getBoundingClientRect(), dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2); x = (x - dx) * (nz / z) + dx; y = (y - dy) * (nz / z) + dy; }
      z = nz; apply();
    }
    function open(set, start, from) {
      opener = from || document.activeElement;
      load(set, start);
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
      document.body.classList.add("pp-lb-open");
      stage.focus();
    }
    function close() { if (dlg.open) dlg.close(); }
    on(dlg, "close", function () { document.body.classList.remove("pp-lb-open"); img.removeAttribute("src"); if (opener && opener.focus) opener.focus(); });
    root.ppOpenLightbox = open;
    function galleryList() {
      return [].slice.call(g.querySelectorAll("[data-pp-slide]")).map(function (li) {
        var im = li.querySelector("img");
        return { src: im.getAttribute("src"), alt: im.getAttribute("alt"), w: +im.getAttribute("width"), h: +im.getAttribute("height"), caption: li.getAttribute("data-caption") || "" };
      });
    }
    g.querySelectorAll("[data-pp-open]").forEach(function (b) {
      on(b, "click", function () {
        var v = b.getAttribute("data-pp-open");
        open(galleryList(), v === "current" ? (g.ppCurrent ? g.ppCurrent() : 0) : +v, b);
      });
    });
    on(dlg.querySelector("[data-pp-lb-close]"), "click", close);
    dlg.querySelectorAll("[data-pp-lb-step]").forEach(function (b) { on(b, "click", function () { show(i + +b.getAttribute("data-pp-lb-step")); }); });
    on(dlg.querySelector("[data-pp-zoom=in]"), "click", function () { zoom(z + 1); });
    on(dlg.querySelector("[data-pp-zoom=out]"), "click", function () { zoom(z - 1); });
    on(img, "click", function (e) { zoom(z > 1 ? 1 : 2.5, e.clientX, e.clientY); });
    on(dlg, "click", function (e) { if (e.target === dlg) close(); });
    on(stage, "keydown", function (e) {
      var k = e.key;
      if (k === "+" || k === "=") { e.preventDefault(); zoom(z + 1); }
      else if (k === "-" || k === "_") { e.preventDefault(); zoom(z - 1); }
      else if (/^Arrow/.test(k) && z > 1) { e.preventDefault(); var d = 60; if (k === "ArrowLeft") x += d; if (k === "ArrowRight") x -= d; if (k === "ArrowUp") y += d; if (k === "ArrowDown") y -= d; apply(); }
      else if ((k === "ArrowRight" || k === "ArrowLeft") && list.length > 1) { e.preventDefault(); show(i + (k === "ArrowRight" ? 1 : -1)); }
    });
    var drag = null;
    on(stage, "pointerdown", function (e) { if (z <= 1) return; drag = { px: e.clientX, py: e.clientY, x: x, y: y, moved: false }; stage.setPointerCapture(e.pointerId); });
    on(stage, "pointermove", function (e) { if (!drag) return; x = drag.x + e.clientX - drag.px; y = drag.y + e.clientY - drag.py; drag.moved = drag.moved || Math.abs(e.clientX - drag.px) + Math.abs(e.clientY - drag.py) > 4; apply(); });
    on(stage, "pointerup", function (e) { if (drag && drag.moved) e.preventDefault(); setTimeout(function () { drag = null; }, 0); });
    on(stage, "wheel", function (e) { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); zoom(z + (e.deltaY < 0 ? 0.5 : -0.5), e.clientX, e.clientY); }, { passive: false });
    on(window, "resize", function () { if (dlg.open) apply(); });
  }

  /* ---------- Reviews ---------- */
  var INCENTIVE = { free_product: "Received this product free", other: "Received another incentive for this review" };
  function fmtDate(t) { return t ? new Date(t * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : ""; }
  function h(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function reviewsBehaviour(root, on, product, signal) {
    var box = root.querySelector("[data-pp-reviews]");
    if (!box) return;
    var summary = box.querySelector("[data-pp-rv-summary]"), list = box.querySelector("[data-pp-rv-list]"), controls = box.querySelector("[data-pp-rv-controls]");
    var more = box.querySelector("[data-pp-more]"), sortSel = box.querySelector("[data-pp-sort]");
    var st = { sort: "newest", rating: "", page: 1, items: [], pages: 1, total: 0 };
    var app = App();

    function query() { return "/reviews?product=" + encodeURIComponent(product) + "&sort=" + st.sort + (st.rating ? "&rating=" + st.rating : "") + "&page=" + st.page + "&size=5"; }
    function renderSummary(sm) {
      if (!sm.count) {
        summary.innerHTML = '<p class="pp-rv-avg is-empty">No reviews yet</p><p class="pp-p">' + COPY.noReviews + "</p>";
        controls.hidden = true;
        return;
      }
      controls.hidden = false;
      summary.innerHTML = '<p class="pp-rv-avg"><span class="pp-rv-num">' + sm.average + "</span>" + stars(sm.average, sm.average + " out of 5 stars") + '<span class="pp-rv-total">' + sm.count + " published review" + (sm.count === 1 ? "" : "s") + "</span></p>" +
        '<ol class="pp-bars" aria-label="Rating breakdown">' + ["5", "4", "3", "2", "1"].map(function (r) {
          var n = sm.breakdown[r] || 0, pc = Math.round((n / sm.count) * 100);
          return '<li><button type="button" class="pp-bar" data-pp-rating="' + r + '" aria-pressed="' + (st.rating === r) + '"' + (n ? "" : " disabled") + '><span class="pp-bar-l">' + r + ' ★<span class="sr-only"> stars:</span></span><span class="pp-bar-track" aria-hidden="true"><span style="width:' + pc + '%"></span></span><span class="pp-bar-n">' + n + '<span class="sr-only"> review' + (n === 1 ? "" : "s") + ". Show only these.</span></span></button></li>";
        }).join("") + "</ol>";
    }
    function item(r) {
      return '<article class="pp-review" data-review="' + h(r.id) + '"><header>' + stars(r.rating, r.rating + " out of 5 stars") + (r.title ? '<h3 class="pp-rv-title">' + h(r.title) + "</h3>" : "") +
        '<p class="pp-rv-meta"><span>' + h(r.display_name) + "</span><span>" + fmtDate(r.created) + "</span>" + (r.verified ? '<span class="pp-verified">Verified purchase</span>' : "") + "</p></header>" +
        (r.incentive && r.incentive !== "none" ? '<p class="pp-incentive">' + INCENTIVE[r.incentive] + "</p>" : "") +
        '<p class="pp-rv-text">' + h(r.text).replace(/\n/g, "<br>") + "</p>" +
        (r.media && r.media.length ? '<ul class="pp-rv-photos" aria-label="Customer photos">' + r.media.map(function (m, i) {
          return '<li><button type="button" data-pp-photo="' + h(r.id) + '" data-index="' + i + '" aria-label="Enlarge customer photo ' + (i + 1) + '"><img src="/api/review-media/' + h(m.id) + '" alt="Customer photo ' + (i + 1) + " from " + h(r.display_name) + '" width="' + m.width + '" height="' + m.height + '" loading="lazy" decoding="async"></button></li>';
        }).join("") + "</ul>" : "") +
        (r.reply && r.reply.text ? '<div class="pp-reply"><p class="pp-reply-k">Reply from Body Café Co.</p><p>' + h(r.reply.text) + "</p></div>" : "") +
        '<footer class="pp-rv-actions">' + (r.own ? '<span class="pp-micro">Your review</span>' :
          '<button type="button" class="pp-linkbtn" data-pp-helpful="' + h(r.id) + '"' + (r.voted ? " disabled" : "") + ">" + (r.voted ? "Marked helpful" : "Helpful") + ' <span data-pp-helpful-n>(' + r.helpful + ")</span></button>" +
          (r.reported ? '<span class="pp-micro">Reported for moderation</span>' : '<button type="button" class="pp-linkbtn" data-pp-report="' + h(r.id) + '" aria-expanded="false">Report</button>')) +
        '</footer><div class="pp-report-slot" data-pp-report-slot="' + h(r.id) + '"></div></article>';
    }
    function load(append) {
      list.setAttribute("aria-busy", "true");
      if (!append) list.innerHTML = '<p class="pp-p pp-loading">Loading reviews…</p>';
      more.disabled = true;
      var a = App();
      if (!a) return;
      a.api(query()).then(function (res) {
        if (signal.aborted) return;
        renderSummary(res.summary);
        st.pages = res.pages; st.total = res.total;
        st.items = append ? st.items.concat(res.reviews) : res.reviews;
        if (!res.summary.count) list.innerHTML = "";
        else if (!st.items.length) list.innerHTML = '<p class="pp-p">No published reviews with this rating.</p>';
        else if (append) { list.insertAdjacentHTML("beforeend", res.reviews.map(item).join("")); var first = list.querySelector('[data-review="' + res.reviews[0].id + '"] header'); if (first) { first.setAttribute("tabindex", "-1"); first.focus(); } }
        else list.innerHTML = st.items.map(item).join("");
        more.hidden = st.page >= st.pages;
        more.disabled = false;
        list.setAttribute("aria-busy", "false");
        updateRatingLink(root, res.summary);
      }).catch(function (err) {
        if (signal.aborted) return;
        list.setAttribute("aria-busy", "false");
        summary.innerHTML = '<p class="pp-p">The review summary couldn\'t load.</p>';
        list.innerHTML = '<div class="pp-error" role="alert"><p>Reviews couldn\'t load: ' + h(err.message) + '</p><button type="button" class="pp-btn is-quiet" data-pp-rv-retry>Try again</button></div>';
      });
    }
    function setRating(r) {
      st.rating = st.rating === r ? "" : r; st.page = 1;
      box.querySelectorAll("[data-pp-rating]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-pp-rating") === st.rating)); });
      load(false);
    }
    on(box, "click", function (e) {
      var t = e.target.closest("button");
      if (!t) return;
      if (t.hasAttribute("data-pp-rating")) setRating(t.getAttribute("data-pp-rating"));
      else if (t.hasAttribute("data-pp-rv-retry")) load(false);
      else if (t.hasAttribute("data-pp-helpful")) helpful(t);
      else if (t.hasAttribute("data-pp-report")) reportForm(t);
      else if (t.hasAttribute("data-pp-photo")) {
        var r = st.items.filter(function (x) { return x.id === t.getAttribute("data-pp-photo"); })[0];
        if (r && root.ppOpenLightbox) root.ppOpenLightbox(r.media.map(function (m, i) { return { src: "/api/review-media/" + m.id, alt: "Customer photo " + (i + 1) + " from " + r.display_name, w: m.width, h: m.height, caption: "Customer photo from " + r.display_name + ", published after moderation." }; }), +t.getAttribute("data-index"), t);
      }
    });
    on(sortSel, "change", function () { st.sort = sortSel.value; st.page = 1; load(false); });
    on(more, "click", function () { st.page += 1; load(true); });

    function helpful(btn) {
      var id = btn.getAttribute("data-pp-helpful");
      btn.disabled = true;
      App().api("/reviews/" + id + "/helpful", {}).then(function (r) {
        btn.innerHTML = 'Marked helpful <span data-pp-helpful-n>(' + r.helpful + ")</span>";
      }).catch(function (err) { btn.disabled = false; App().toast(err.message); });
    }
    function reportForm(btn) {
      var id = btn.getAttribute("data-pp-report"), slot = box.querySelector('[data-pp-report-slot="' + id + '"]');
      if (slot.innerHTML) { slot.innerHTML = ""; btn.setAttribute("aria-expanded", "false"); return; }
      btn.setAttribute("aria-expanded", "true");
      slot.innerHTML = '<form class="pp-reportform" data-pp-reportform="' + id + '" novalidate><label for="rp-' + id + '">Why are you reporting this review?</label><select id="rp-' + id + '" name="reason" required><option value="">Choose a reason</option><option value="inappropriate">Inappropriate or offensive</option><option value="personal_information">Shares personal information</option><option value="not_about_product">Not about this product</option><option value="spam">Spam or promotion</option><option value="safety_concern">Describes a safety concern</option></select><label for="rn-' + id + '">Details (optional)</label><textarea id="rn-' + id + '" name="note" maxlength="500"></textarea><p class="pp-micro">Reports go to our moderators. A report doesn\'t remove a review on its own. For a safety issue with your own product, <a href="/contact?kind=safety">open a private safety case</a>.</p><div class="pp-form-error" role="alert"></div><button type="submit" class="pp-btn is-quiet">Send report</button></form>';
      slot.querySelector("select").focus();
      if (App()) App().keepDesignOnLinks();
    }
    on(box, "submit", function (e) {
      var f = e.target;
      if (!f.hasAttribute("data-pp-reportform")) return;
      var id = f.getAttribute("data-pp-reportform"), err = f.querySelector(".pp-form-error"), btn = f.querySelector("button[type=submit]");
      if (!f.elements.reason.value) { err.textContent = "Choose a reason."; f.elements.reason.focus(); return; }
      btn.disabled = true;
      App().api("/reviews/" + id + "/report", { reason: f.elements.reason.value, note: f.elements.note.value }).then(function () {
        f.outerHTML = '<p class="pp-micro" role="status">Thanks. Your report is with our moderators.</p>';
        var b = box.querySelector('[data-pp-report="' + id + '"]');
        if (b) b.outerHTML = '<span class="pp-micro">Reported for moderation</span>';
      }).catch(function (x) { btn.disabled = false; err.textContent = x.message; });
    });

    writeBehaviour(root, box, on, product, signal, function () { st.page = 1; load(false); });
    load(false);
  }
  function updateRatingLink(root, sm) {
    var a = root.querySelector(".pp-panel .pp-rating");
    if (!a) return;
    if (!sm.count) { a.className = "pp-rating is-empty"; a.textContent = "No reviews yet"; return; }
    a.className = "pp-rating";
    a.innerHTML = stars(sm.average, sm.average + " out of 5 stars") + "<span>" + sm.average + " · " + sm.count + " review" + (sm.count === 1 ? "" : "s") + "</span>";
  }

  /* ---------- Writing a review: eligibility, inline sign-in, the form, photos and submission ---------- */
  function writeBehaviour(root, box, on, product, signal, reload) {
    var btn = box.querySelector("[data-pp-write]"), panel = box.querySelector("[data-pp-write-panel]"), body = box.querySelector("[data-pp-write-body]");
    var name = root.querySelector(".pp-h1") ? root.querySelector(".pp-h1").textContent : "this product";
    var uploads = [], requestId = "";
    function setOpen(open) {
      panel.hidden = !open; btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "Close the review form" : "Write a review";
    }
    on(btn, "click", function () {
      if (!panel.hidden) { setOpen(false); return; }
      setOpen(true);
      if (App()) App().event("review_start");
      check(true);
    });
    function message(html, focus) {
      body.innerHTML = html;
      if (App()) App().keepDesignOnLinks();
      if (focus) panel.focus();
    }
    function check(focus) {
      message('<p class="pp-p" role="status">Checking whether you can review ' + h(name) + "…</p>", focus);
      App().api("/reviews/eligibility?product=" + encodeURIComponent(product)).then(function (r) {
        if (signal.aborted) return;
        var support = '<p class="pp-p"><a href="#questions">Ask a question</a> or <a href="/contact">contact support</a>.</p>';
        if (r.state === "eligible") return form(focus);
        if (r.state === "static_preview") return message('<div class="pp-note"><p>Reviews can\'t be written in this shared design preview. In the store, customers whose order was delivered can review here.</p></div>', focus);
        if (r.state === "operations") return message('<div class="pp-note"><p>Operations sessions can\'t write customer reviews. Leave operations and sign in as a customer.</p></div>', focus);
        if (r.state === "sign_in") return signIn(focus);
        if (r.state === "already_reviewed") return message('<div class="pp-note"><p><strong>You\'ve already reviewed ' + h(name) + ".</strong> " + ({ pending_moderation: "It's waiting for moderation and will appear here once approved.", published: "It's published below.", rejected: "It wasn't published because it didn't meet our review guidelines. Contact support if you'd like to know more." }[r.review_state] || "") + "</p>" + support + "</div>", focus);
        if (r.state === "not_delivered") return message('<div class="pp-note"><p><strong>Your order hasn\'t been delivered yet.</strong> You can review ' + h(name) + " once the order containing it is marked delivered.</p>" + support + "</div>", focus);
        return message('<div class="pp-note"><p><strong>Reviews come from verified purchases.</strong> We couldn\'t find a delivered order containing ' + h(name) + ' on this account. If you ordered as a guest, sign in with the same mobile number to bring that order into your account.</p>' + support + "</div>", focus);
      }).catch(function (err) {
        message('<div class="pp-error" role="alert"><p>We couldn\'t check your eligibility: ' + h(err.message) + '</p><button type="button" class="pp-btn is-quiet" data-pp-recheck>Try again</button></div>', focus);
      });
    }
    on(body, "click", function (e) { if (e.target.closest("[data-pp-recheck]")) check(true); });

    function signIn(focus) {
      message('<div class="pp-signin"><p class="pp-p"><strong>Sign in to write a review.</strong> Use the mobile number from your order. You\'ll stay on this page.</p>' +
        '<form data-pp-otp novalidate><label for="pp-otp-mobile">Mobile number</label><div class="pp-inline"><input id="pp-otp-mobile" name="mobile" inputmode="tel" autocomplete="tel-national" pattern="[6-9][0-9]{9}" maxlength="10" required placeholder="10-digit Indian number"><button type="submit">Get code</button></div><div class="pp-form-error" role="alert"></div></form>' +
        '<form data-pp-verify novalidate hidden><p class="pp-preview-code" data-pp-code role="status"></p><label for="pp-otp-code">Code</label><div class="pp-inline"><input id="pp-otp-code" name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required><button type="submit">Verify and continue</button></div><div class="pp-form-error" role="alert"></div></form></div>', focus);
      var mobile = "";
      on(body.querySelector("[data-pp-otp]"), "submit", function (e) {
        var f = e.target, err = f.querySelector(".pp-form-error"), b = f.querySelector("button");
        mobile = f.elements.mobile.value.trim();
        if (!/^[6-9][0-9]{9}$/.test(mobile)) { err.textContent = "Enter a valid 10-digit Indian mobile number."; f.elements.mobile.setAttribute("aria-invalid", "true"); f.elements.mobile.focus(); return; }
        f.elements.mobile.removeAttribute("aria-invalid"); err.textContent = ""; b.disabled = true;
        App().api("/auth/otp", { mobile: mobile }).then(function (r) {
          var v = body.querySelector("[data-pp-verify]");
          v.hidden = false;
          v.querySelector("[data-pp-code]").textContent = "Preview code: " + r.preview_code + ". No SMS was sent.";
          v.elements.code.focus();
        }).catch(function (x) { err.textContent = x.message; }).finally(function () { b.disabled = false; });
      });
      on(body.querySelector("[data-pp-verify]"), "submit", function (e) {
        var f = e.target, err = f.querySelector(".pp-form-error"), b = f.querySelector("button");
        if (!/^[0-9]{6}$/.test(f.elements.code.value)) { err.textContent = "Enter the 6-digit code."; f.elements.code.focus(); return; }
        b.disabled = true;
        App().api("/auth/verify", { mobile: mobile, code: f.elements.code.value }).then(function () {
          return App().signedIn();
        }).then(function () { check(true); }).catch(function (x) { err.textContent = x.message; b.disabled = false; });
      });
    }

    function form(focus) {
      uploads = [];
      requestId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
      message('<form class="pp-reviewform" data-pp-reviewform novalidate>' +
        '<div class="pp-form-summary" data-pp-summary role="alert" tabindex="-1"></div>' +
        '<fieldset class="pp-rate"><legend>Overall rating <span class="pp-req">required</span></legend><div class="pp-rate-stars">' +
        [1, 2, 3, 4, 5].map(function (n) { return '<input type="radio" id="pp-r' + n + '" name="rating" value="' + n + '"><label for="pp-r' + n + '"><span class="sr-only">' + n + " star" + (n > 1 ? "s" : "") + "</span></label>"; }).join("") +
        '</div><p class="pp-micro" data-pp-rate-text aria-live="polite">Choose 1 to 5 stars.</p></fieldset>' +
        '<label for="pp-title">Review title <span class="pp-req">required</span></label><input id="pp-title" name="title" maxlength="120" required>' +
        '<label for="pp-text">Your experience <span class="pp-req">required</span></label><textarea id="pp-text" name="text" minlength="10" maxlength="2000" required aria-describedby="pp-text-help"></textarea><p id="pp-text-help" class="pp-micro"><span data-pp-chars>0</span> / 2000. Describe your own experience. Please don\'t include personal details or medical information.</p>' +
        '<label for="pp-name">Public display name <span class="pp-req">required</span></label><input id="pp-name" name="display_name" maxlength="40" autocomplete="nickname" required aria-describedby="pp-name-help"><p id="pp-name-help" class="pp-micro">Shown with your review. A first name or initials is enough.</p>' +
        '<fieldset class="pp-incentive-q"><legend>Did you receive this product free, or any other incentive for this review?</legend><label class="pp-check"><input type="radio" name="incentive" value="none" checked> No</label><label class="pp-check"><input type="radio" name="incentive" value="free_product"> Yes, I received the product free</label><label class="pp-check"><input type="radio" name="incentive" value="other"> Yes, another incentive</label><p class="pp-micro">Gifted or incentivised experiences are labelled on the review.</p></fieldset>' +
        '<div class="pp-photos"><label for="pp-files">Photos of the product (optional)</label><input id="pp-files" type="file" accept="image/jpeg,image/png,image/webp" multiple aria-describedby="pp-files-help"><p id="pp-files-help" class="pp-micro">Up to 4 JPEG, PNG or WebP photos, 5 MB each. Location and camera details are removed before storage. Photos are moderated before they appear.</p><ul class="pp-uploads" data-pp-uploads aria-live="polite"></ul></div>' +
        '<p class="pp-micro">' + COPY.reviewsRule + ' Something wrong with a product? <a href="/contact?kind=safety">Report it privately</a> instead.</p>' +
        '<button type="submit" class="pp-btn" data-pp-submit>Submit review for moderation</button></form>', focus);
      var f = body.querySelector("[data-pp-reviewform]");
      if (focus) f.querySelector("legend").setAttribute("tabindex", "-1");
      on(f.elements.text, "input", function () { f.querySelector("[data-pp-chars]").textContent = f.elements.text.value.length; });
      f.querySelectorAll("input[name=rating]").forEach(function (r) { on(r, "change", function () { f.querySelector("[data-pp-rate-text]").textContent = r.value + " of 5 stars selected."; }); });
      on(f.querySelector("#pp-files"), "change", function (e) { addFiles([].slice.call(e.target.files)); e.target.value = ""; });
      on(f.querySelector("[data-pp-uploads]"), "click", function (e) { var b = e.target.closest("[data-pp-remove]"); if (b) removeUpload(b.getAttribute("data-pp-remove")); });
      on(f, "submit", submit);
    }
    function renderUploads() {
      var ul = body.querySelector("[data-pp-uploads]");
      if (!ul) return;
      ul.innerHTML = uploads.map(function (u) {
        return '<li data-state="' + u.state + '"><span class="pp-up-name">' + h(u.name) + "</span>" +
          (u.state === "uploading" ? '<progress max="100" value="' + u.progress + '" aria-label="Uploading ' + h(u.name) + '">' + u.progress + "%</progress>" : "") +
          (u.state === "done" ? '<span class="pp-up-ok">Uploaded</span>' : "") + (u.state === "error" ? '<span class="pp-up-err">' + h(u.error) + "</span>" : "") +
          (u.state !== "uploading" ? '<button type="button" class="pp-linkbtn" data-pp-remove="' + u.key + '">Remove<span class="sr-only"> ' + h(u.name) + "</span></button>" : "") + "</li>";
      }).join("");
    }
    function addFiles(files) {
      files.forEach(function (file) {
        var key = String(Math.random()).slice(2);
        var u = { key: key, name: file.name, state: "uploading", progress: 0, id: null, error: "" };
        if (uploads.filter(function (x) { return x.state !== "error"; }).length >= 4) { u.state = "error"; u.error = "You can add up to 4 photos."; uploads.push(u); return; }
        if (["image/jpeg", "image/png", "image/webp"].indexOf(file.type) < 0) { u.state = "error"; u.error = "Use a JPEG, PNG or WebP photo."; uploads.push(u); return; }
        if (file.size > 5 * 1024 * 1024) { u.state = "error"; u.error = "This photo is larger than 5 MB."; uploads.push(u); return; }
        uploads.push(u);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/review-media?product=" + encodeURIComponent(product));
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.setRequestHeader("X-CSRF-Token", App().csrf());
        xhr.upload.onprogress = function (e) { if (e.lengthComputable) { u.progress = Math.round((e.loaded / e.total) * 100); var p = body.querySelector('[data-pp-uploads] li progress[aria-label="Uploading ' + CSS.escape(u.name) + '"]'); if (p) p.value = u.progress; } };
        xhr.onload = function () {
          var res = {};
          try { res = JSON.parse(xhr.responseText); } catch (e) {}
          if (xhr.status === 200 && res.id) { u.state = "done"; u.id = res.id; }
          else { u.state = "error"; u.error = res.error || "The photo couldn't be uploaded."; }
          renderUploads();
        };
        xhr.onerror = function () { u.state = "error"; u.error = "The photo couldn't be uploaded. Check your connection."; renderUploads(); };
        xhr.send(file);
      });
      renderUploads();
    }
    function removeUpload(key) {
      var u = uploads.filter(function (x) { return x.key === key; })[0];
      if (!u) return;
      uploads = uploads.filter(function (x) { return x !== u; });
      renderUploads();
      if (u.id) App().api("/review-media/" + u.id + "/delete", {}).catch(function () {});
      var input = body.querySelector("#pp-files");
      if (input) input.focus();
    }
    function submit(e) {
      var f = e.target, sum = f.querySelector("[data-pp-summary]"), b = f.querySelector("[data-pp-submit]");
      var errors = [];
      var rating = f.querySelector("input[name=rating]:checked");
      var mark = function (el, bad) { if (bad) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid"); };
      if (!rating) errors.push(["pp-r1", "Choose an overall rating."]);
      var title = f.elements.title.value.trim(), text = f.elements.text.value.trim(), dn = f.elements.display_name.value.trim();
      mark(f.elements.title, title.length < 3); if (title.length < 3) errors.push(["pp-title", "Add a review title of at least 3 characters."]);
      mark(f.elements.text, text.length < 10); if (text.length < 10) errors.push(["pp-text", "Write at least 10 characters about your experience."]);
      mark(f.elements.display_name, dn.length < 2); if (dn.length < 2) errors.push(["pp-name", "Add a display name of at least 2 characters."]);
      if (uploads.some(function (u) { return u.state === "uploading"; })) errors.push(["pp-files", "Wait for your photos to finish uploading."]);
      if (errors.length) {
        sum.innerHTML = "<p><strong>Please fix " + (errors.length === 1 ? "this" : "these " + errors.length) + ":</strong></p><ul>" + errors.map(function (x) { return '<li><a href="#' + x[0] + '">' + x[1] + "</a></li>"; }).join("") + "</ul>";
        sum.focus();
        return;
      }
      sum.innerHTML = "";
      b.disabled = true; b.textContent = "Submitting…";
      App().api("/reviews", {
        product: product, rating: +rating.value, title: title, text: text, display_name: dn, incentive: f.querySelector("input[name=incentive]:checked").value,
        media: uploads.filter(function (u) { return u.state === "done"; }).map(function (u) { return u.id; }), request_id: requestId,
      }).then(function () {
        message('<div class="pp-success" role="status" tabindex="-1"><p><strong>Thank you. Your review has been submitted.</strong></p><p>Our moderators check every review and photo before it appears here. Low ratings and criticism are published like any other review.</p></div>', false);
        var ok = body.querySelector(".pp-success"); if (ok) ok.focus();
        uploads = [];
        reload();
      }).catch(function (err) {
        b.disabled = false; b.textContent = "Submit review for moderation";
        sum.innerHTML = "<p><strong>Your review wasn't submitted.</strong> " + h(err.message) + "</p>";
        sum.focus();
      });
    }
  }

  /* ---------- Questions and answers ---------- */
  function questionsBehaviour(root, on, product, signal) {
    var qa = root.querySelector("[data-pp-qa]");
    if (!qa) return;
    var list = qa.querySelector("[data-pp-qa-list]");
    function load() {
      App().api("/questions?product=" + encodeURIComponent(product)).then(function (r) {
        if (signal.aborted) return;
        list.innerHTML = r.questions.length ? '<ul class="pp-qa-items">' + r.questions.map(function (q) {
          return '<li><p class="pp-q"><span class="pp-q-k">Question</span> ' + h(q.question) + '</p><div class="pp-ans"><p class="pp-ans-k">Answer from Body Café Co. · ' + fmtDate(q.answered) + "</p><p>" + h(q.answer) + "</p></div></li>";
        }).join("") + "</ul>" : '<p class="pp-p">No questions have been answered publicly for this product yet.</p>';
      }).catch(function (err) {
        list.innerHTML = '<div class="pp-error" role="alert"><p>Answered questions couldn\'t load: ' + h(err.message) + '</p><button type="button" class="pp-btn is-quiet" data-pp-qa-retry>Try again</button></div>';
      });
    }
    on(qa, "click", function (e) { if (e.target.closest("[data-pp-qa-retry]")) load(); });
    var form = qa.querySelector("[data-pp-ask]");
    if (form) {
      var started = false;
      on(form.elements.question, "focus", function () { if (!started && App()) { started = true; App().event("question_start"); } });
      on(form, "submit", function (e) {
        var err = form.querySelector(".pp-form-error"), res = form.querySelector("[data-pp-ask-result]"), b = form.querySelector("button[type=submit]");
        var text = form.elements.question.value.trim();
        err.textContent = ""; res.innerHTML = "";
        if (text.length < 10) { err.textContent = "Write at least 10 characters."; form.elements.question.setAttribute("aria-invalid", "true"); form.elements.question.focus(); return; }
        form.elements.question.removeAttribute("aria-invalid");
        b.disabled = true; b.textContent = "Sending…";
        App().api("/questions", { product: product, question: text }).then(function (c) {
          form.elements.question.value = "";
          res.innerHTML = '<p><strong>Question sent. Reference ' + h(c.id) + ".</strong> Support will answer it privately in your account, and it may be published here with an official answer after review. <a href=\"/account/cases\">Follow it in your account</a>.</p>";
          if (App()) App().keepDesignOnLinks();
        }).catch(function (x) { err.textContent = x.message; }).finally(function () { b.disabled = false; b.textContent = "Send question"; });
      });
    }
    load();
  }

  window.BCCPDP = { enhance: enhance, model: model, facts: FACTS, copy: COPY };
})();
