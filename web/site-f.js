/* Body Café Co. — Direction F · Edition. Premium, minimal and clean, in the brand colours.
   Idea: the site reads like a printed edition about seven supplements. Bottle-cream paper, ink, folios and figure
   captions. Display type in Aileron UltraLight, deks and captions in Aileron Light Italic, folios in LEMON MILK.
   Signature: "close reading" — large cropped bottle figures on cap-colour fields, captioned as figures. */
(function () {
  "use strict";
  var S = window.BCCSite, E = window.BCCEH, h = E.h;
  var MENU = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16M4 15h16"/></svg>';
  var SECTION = { "/": "Edition 01", "/shop": "Contents", "/standards": "Standards", "/about": "About", "/learn": "The reading room", "/story": "Story", "/reports": "Lot reports", "/search": "Search", "/cart": "Your bag", "/checkout": "Checkout", "/account": "Account", "/help": "Help", "/contact": "Contact" };

  function fig(n) { return "Fig. " + n; }
  var kit = {
    kicker: function (t) { return '<p class="x-kicker f-folio">' + t + "</p>"; },
    head: function (o) {
      return '<header class="x-head f-head">' + (o.crumbs ? this.crumbs(o.crumbs) : "") + (o.kicker ? this.kicker(o.kicker) : "") + "<h1>" + o.title + "</h1>" + (o.lede ? '<p class="x-lede f-dek">' + o.lede + "</p>" : "") + (o.aside ? '<div class="x-head-aside">' + o.aside + "</div>" : "") + "</header>";
    },
    btn: function (href, label, kind) { return '<a class="x-btn f-pill' + (kind ? " x-btn-" + kind : "") + '" href="' + href + '"><span>' + label + "</span></a>"; },
    row: function (ctx, p, href, end, sub) {
      return '<li class="x-row f-row" style="' + ctx.capStyle(p) + '"><a href="' + href + '"><span class="x-row-media f-row-media">' + h.front(ctx, p, { alt: "" }) + '</span><span class="x-row-main"><strong>' + ctx.escape(p.name) + "</strong><small>" + (sub || ctx.escape(ctx.format[p.id])) + '</small></span><span class="x-row-end">' + end + "</span></a></li>";
    },
  };
  var K = Object.assign({}, h.KIT, kit);

  function chrome(ctx, content) {
    var path = ctx.path;
    var cur = function (href) { return path === href || path.indexOf(href + "/") === 0 ? ' aria-current="page"' : ""; };
    var nav = [["/shop", "Shop"], ["/standards", "Standards"], ["/about", "About"], ["/learn", "Learn"], ["/story", "Story"]];
    var section = SECTION["/" + (path.split("/")[1] || "")] || (path.indexOf("/products/") === 0 ? "The collection" : path.indexOf("/policies/") === 0 ? "Policies" : "Body Café Co.");
    return '<div class="eh eh-f">' +
      '<header class="f-header"><nav class="f-nav" aria-label="Main">' + nav.map(function (n) { return '<a href="' + n[0] + '"' + cur(n[0]) + ">" + n[1] + "</a>"; }).join("") + "</nav>" +
      '<button class="f-icon f-menu menu-button" data-action="menu" aria-expanded="false" aria-controls="mobile-nav">' + MENU + '<span class="sr-only">Menu</span></button>' +
      '<a class="f-logo" href="/" aria-label="Body Café Co. home"><img src="/web/media/brand-original.svg" alt="" width="456" height="443"></a>' +
      '<div class="f-tools"><button class="f-icon" data-action="search" aria-label="Search">' + ctx.icon("search") + '</button><a class="f-lotbtn" href="/reports"' + cur("/reports") + '>Lot report</a><a class="f-icon" href="/account" aria-label="Your account"' + cur("/account") + ">" + ctx.icon("user") + '</a><a class="f-icon bag-link" href="/cart" aria-label="Bag, ' + ctx.count + ' items">' + ctx.icon("bag") + '<span class="f-count" data-cart-count' + (ctx.count ? "" : " data-empty") + ">" + ctx.count + "</span></a></div></header>" +
      '<div class="f-strip"><span>' + section + '</span><span class="f-strip-mid">Seven supplements, read closely</span><span>Prices are samples · Draft packaging</span></div>' +
      '<nav id="mobile-nav" class="x-mnav f-mnav" hidden aria-label="Mobile"><p class="x-kicker f-folio">Contents</p><ol>' +
      [["/shop", "Shop the collection"]].concat(nav.slice(1)).concat([["/reports", "Lot reports"], ["/search", "Search"], ["/help", "Help"]]).map(function (n, i) { return '<li><a href="' + n[0] + '"><span>' + h.pad(i + 1) + "</span>" + n[1] + "</a></li>"; }).join("") + '</ol><p class="f-mnav-foot"><a href="/account">Account</a><a href="/cart">Bag (<span data-cart-count>' + ctx.count + "</span>)</a></p></nav>" +
      '<main id="main" tabindex="-1">' + content + "</main>" +
      '<footer class="f-footer"><div class="f-foot-top"><div><p class="x-kicker f-folio">Colophon</p><p class="f-foot-line">Seven supplements, read closely. Each with its ingredient in view, its own cap colour and a place for its lot record.</p></div>' +
      '<div class="f-foot-cols"><div><h2>Contents</h2><a href="/shop">The collection</a>' + ctx.published.map(function (p) { return '<a href="/products/' + p.id + '"><span>' + h.no(ctx, p) + "</span>" + ctx.escape(p.name) + "</a>"; }).join("") + '</div><div><h2>Features</h2><a href="/about">About</a><a href="/story">Story</a><a href="/standards">Standards</a><a href="/learn">Learn</a><a href="/reports">Lot reports</a></div>' + S.careGroups().map(function (g) { return '<div><h2>' + g.group + '</h2>' + g.items.map(function (x) { return '<a href="' + x[1] + '">' + x[0] + '</a>'; }).join('') + '</div>'; }).join('') + "</div></div>" +
      '<img class="f-foot-word" src="/web/media/brand-horizontal.svg" alt="" width="1160" height="140"><p class="f-foot-legal"><span>© ' + new Date().getFullYear() + ' Body Café Co. · Edition 01</span><span>Preview store. Prices are samples, packaging is a draft and lot reports are demonstration records.</span><a href="/preview/states">Design states</a></p></footer></div>';
  }

  /* ---------- Home ---------- */
  function home(ctx) {
    var list = ctx.published, H = h.HOME;
    var cover = ctx.product("l-theanine") || list[0];
    if (!cover) return K.head({ title: "This edition is resting" });
    var ci = h.no(ctx, cover);
    var topics = [
      ["Ingredients", "Start with what’s inside.", "Explore the ingredient notes and the details to check when comparing products.", "/learn/ingredient-forms", "Read the ingredient guide", "Ingredient notes available"],
      ["Product labels", "Read the small print.", "Amounts, directions and cautions belong together. Full rear-label information is pending approval.", "/learn/reading-a-label", "Learn to read a label", "Rear labels pending approval"],
      ["Testing records", "Look at the evidence.", "A lot number connects a bottle to its batch record. Try the demonstration before real reports are published.", "/reports", "Explore lot reports", "Demonstration records"]
    ];
    var questions = [
      ["Which formats can I explore?", "The collection includes capsules, softgels and chewable tablets. Each product card shows its format; its product page brings together the ingredient notes and available details."],
      ["Where can I check ingredients and directions?", "Open a product to explore its ingredient notes. Full ingredient lists, amounts, directions, allergens and cautions depend on approved labels. This preview does not provide a dosage."],
      ["Where can I find storage information?", "Check the storage information on your pack. Final product-specific storage instructions will be published with the approved label details."],
      ["How do I check a lot record?", "Choose your product below and enter its lot number. You can try the demo number to explore the lookup; no real laboratory document is connected."],
      H.faq[1], H.faq[2], H.faq[3], H.faq[5]
    ];
    return (
      /* 1 · Hero: the cover */
      '<section class="f-cover" data-home-section="hero" aria-labelledby="f-cover-t"><figure class="f-cover-fig" style="' + ctx.capStyle(cover) + '"><a href="/products/' + cover.id + '" tabindex="-1" aria-hidden="true">' + h.front(ctx, cover, { eager: true, alt: "" }) + '</a><figcaption>' + fig(ci) + " — " + ctx.escape(cover.name) + ", " + ctx.escape(ctx.format[cover.id]).toLowerCase() + ". Draft packaging.</figcaption></figure>" +
      '<div class="f-cover-copy"><p class="x-kicker f-folio">Edition 01 · No. ' + ci + ' of 07 on the cover</p><h1 id="f-cover-t">Everyday essentials.<br>Read closely.</h1><p class="f-dek">Seven supplements. Explore the ingredients, find your format and get to know what’s inside.</p><div class="f-actions"><a class="x-btn f-pill" href="/shop"><span>Shop the collection</span></a><a class="x-link" href="#contents">Meet all seven</a></div>' +
      '<a class="f-reading" href="/products/' + cover.id + '"><span class="f-folio">Now reading</span><span>' + ctx.escape(cover.name) + " — " + ctx.escape(cover.subtitle) + "</span><span>" + ctx.money(cover.price) + "</span></a></div></section>" +

      /* 2 · Meet the collection: contents */
      '<section class="f-contents" id="contents" data-home-section="collection" aria-labelledby="f-con-t"><header class="f-sec-head"><h2 id="f-con-t">Find your format.</h2><p class="f-dek">Seven supplements. Each with a format, a colour and details to explore.</p></header><ol class="f-con-list">' +
      list.map(function (p) { return '<li style="' + ctx.capStyle(p) + '"><a class="f-con-item" href="/products/' + p.id + '"><span class="f-con-top"><span class="f-folio">No. ' + h.no(ctx, p) + '</span><i aria-hidden="true"></i></span><span class="f-con-media">' + h.front(ctx, p, { alt: "" }) + '</span><strong>' + ctx.escape(p.name) + '</strong><span class="f-con-description">' + ctx.escape(h.inView(p)) + '</span><span class="f-con-meta">' + ctx.escape(ctx.format[p.id]) + '</span><span class="f-con-price">' + ctx.money(p.price) + ' <small>MRP</small></span><span class="f-con-explore">Explore product <span aria-hidden="true">↗</span></span></a>' + h.addBtn(ctx, p, "f-con-add", "Add to bag") + "</li>"; }).join("") +
      '</ol><p class="x-small">Explore ingredient notes before choosing. Full label information will follow approval. Checkout is simulated in this preview.</p></section>' +

      /* 3 · Generate curiosity: one question, set as a spread */
      '<section class="f-spread" data-home-section="curiosity" aria-labelledby="f-q-t"><header class="f-sec-head"><h2 id="f-q-t">One question per bottle</h2><p class="f-dek">' + H.curiosity + '</p></header><div class="f-ask" data-eh-tabs><div class="f-ask-tabs" role="tablist" aria-label="Choose a product">' +
      list.map(function (p, i) { return '<button type="button" role="tab" id="f-ask-t' + i + '" aria-controls="f-ask-p' + i + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" data-eh-tab="' + i + '" style="' + ctx.capStyle(p) + '"><span class="f-folio">No. ' + h.no(ctx, p) + "</span>" + ctx.escape(p.name) + "</button>"; }).join("") + "</div>" +
      list.map(function (p, i) { var a = h.ask(p); return '<div class="f-ask-panel" role="tabpanel" id="f-ask-p' + i + '" aria-labelledby="f-ask-t' + i + '" data-eh-panel="' + i + '"' + (i ? " hidden" : "") + ' style="' + ctx.capStyle(p) + '"><figure class="f-ask-fig">' + h.render(ctx, p, "tq", { alt: "" }) + "<figcaption>" + fig(h.no(ctx, p)) + " — " + ctx.escape(p.name) + ', three-quarter view.</figcaption></figure><div class="f-ask-copy"><p class="x-kicker f-folio">The question</p><h3>' + a.q + '</h3><p class="f-dek">' + a.d + '</p><p class="f-drop">' + a.lead + '</p><p class="f-ask-links"><a class="x-link" href="/learn/' + p.id + '">Read the ingredient note</a><a class="x-link" href="/products/' + p.id + '">View ' + ctx.escape(p.name) + "</a></p></div></div>"; }).join("") + "</div></section>" +

      /* 4 · Three routes into the existing evidence pages. */
      '<section class="f-trust" data-home-section="trust" aria-labelledby="f-tr-t"><div class="f-trust-head"><p class="x-kicker f-folio">Before you choose</p><h2 id="f-tr-t">A little more understanding.</h2><p class="f-dek">Know the ingredient. Read the label. Check the available evidence.</p><a class="x-link" href="/standards">Our standards in full</a></div><div class="f-trust-cols">' +
      topics.map(function (t, i) { return '<article><p class="f-folio">' + h.pad(i + 1) + ' / ' + t[0] + '</p><h3>' + t[1] + '</h3><p>' + t[2] + '</p><span class="f-trust-status">' + t[5] + '</span><a class="x-link" href="' + t[3] + '">' + t[4] + '</a></article>'; }).join("") + "</div></section>" +

      /* 5 · Illustrative rear view; the real label position is not yet approved. */
      '<section class="f-lot" data-home-section="lot" aria-labelledby="f-lot-t"><div class="f-lot-head"><p class="x-kicker f-folio">The record behind the bottle</p><h2 id="f-lot-t">One bottle.<br>One lot number.</h2><p class="f-dek">Start with the number on your pack. It connects your product to the record for its lot.</p><p class="f-lot-demo">Demonstration lookup · No real laboratory reports published.</p></div>' +
      '<figure class="f-lot-visual"><div class="f-lot-diagram"><svg viewBox="0 0 340 370" role="img" aria-labelledby="f-bottle-title f-bottle-desc"><title id="f-bottle-title">Illustration of a lot number on a bottle</title><desc id="f-bottle-desc">A simplified rear bottle with the example code DEMO-01-01 highlighted. The final printed position is awaiting label approval.</desc><rect x="111" y="16" width="118" height="57" rx="12" fill="' + ctx.escape(cover.color) + '"/><path d="M123 73v19c-35 10-49 31-49 62v155q0 36 36 36h120q36 0 36-36V154c0-31-14-52-49-62V73" fill="#f3f0ea" stroke="#c5bfb4" stroke-width="2"/><rect x="92" y="143" width="156" height="151" rx="3" fill="#e9e4da"/><g stroke="#b4ab9c" stroke-width="3"><path d="M112 164h116M112 177h94M112 190h116M112 203h72"/></g><rect x="103" y="226" width="134" height="48" rx="4" fill="#2d2926"/><text x="170" y="245" text-anchor="middle" fill="#f3f0ea" font-family="sans-serif" font-size="10" letter-spacing="2">LOT NUMBER</text><text x="170" y="263" text-anchor="middle" fill="#f3f0ea" font-family="monospace" font-size="15">DEMO-01-01</text><circle cx="237" cy="249" r="5" fill="#f3f0ea" stroke="#2d2926" stroke-width="2"/><path d="M243 249h64" stroke="#f3f0ea" stroke-width="1.5"/></svg><div class="f-lot-callout"><span class="f-folio">Look for</span><strong>LOT / BATCH</strong><span>Use the code, not the barcode.</span></div></div><figcaption>Illustrative rear view. Final code position will be confirmed with approved packaging.</figcaption></figure>' +
      '<ol class="f-lot-steps">' + [["Find your lot", "Look for LOT or BATCH on your pack. The illustration shows an example code."], ["Enter the number", "Select the matching product and enter the full code, including any hyphens."], ["View its record", "See the record and document status for that lot. Demo records contain no real lab report."]].map(function (s, i) { return '<li><span class="f-folio">' + h.pad(i + 1) + '</span><h3>' + s[0] + '</h3><p>' + s[1] + '</p></li>'; }).join("") + '</ol>' +
      '<div class="f-lot-form"><p class="x-kicker f-folio">Try the demonstration</p>' + h.homeLotForm(ctx, "x-lotform f-lotform", "x-btn f-pill") + '</div><p class="f-lot-limits"><em>What a report can’t tell you.</em> ' + S.copy.reports.limits.join(" ") + '</p></section>' +

      /* Customer voices return when real, approved reviews are available. */
      /* 7 · Before you order */
      '<section class="f-faq" data-home-section="faq" aria-labelledby="f-faq-t"><header><p class="x-kicker f-folio">Before you order</p><h2 id="f-faq-t">Good questions welcome here.</h2><a class="x-link" href="/help">Visit the help centre</a></header><div class="x-faqs">' + h.faqs(questions) + "</div></section>"
    );
  }

  /* ---------- Shop: contents + editorial rhythm ---------- */
  function shop(ctx) {
    var st = h.shopList(ctx), c = S.copy.shop;
    var rhythm = st.list.length === 7 && st.sort === "catalogue";
    return '<div class="x-page f-shop">' + K.head({ kicker: "Contents · " + ctx.published.length + " products", title: "The collection", lede: c.lede }) +
      '<div class="x-shopbar f-shopbar">' + h.filterNav(ctx, st, "x-filter f-tabs") + h.sortForm(ctx, st) + "</div>" +
      (st.list.length && st.known
        ? '<ol class="f-grid' + (rhythm ? " has-rhythm" : "") + '">' + st.list.map(function (p) {
            return '<li class="f-item" style="' + ctx.capStyle(p) + '"><a class="f-item-field" href="/products/' + p.id + '" aria-label="' + ctx.escape(p.name) + '">' + h.front(ctx, p, { alt: "" }) + '</a><div class="f-item-cap"><p class="f-folio">No. ' + h.no(ctx, p) + " · " + ctx.escape(ctx.format[p.id]) + '</p><h2><a href="/products/' + p.id + '">' + ctx.escape(p.name) + "</a></h2><p class=\"f-dek\">" + ctx.escape(p.subtitle) + '</p><div class="f-item-foot"><p class="f-price">' + ctx.money(p.price) + " <em>sample price</em></p>" + h.addBtn(ctx, p, "x-btn f-pill f-add", "Add to bag") + "</div></div></li>";
          }).join("") + "</ol>"
        : K.empty(ctx, { title: c.noMatch[0], text: c.noMatch[1], cta: "Show all seven" })) +
      '<section class="f-guide" aria-labelledby="f-g-t"><p class="x-kicker f-folio">Reader’s guide</p><h2 id="f-g-t">' + c.guidanceTitle + '</h2><ol class="f-guide-cols">' + c.guidance.map(function (g, i) { return '<li><span class="f-folio">' + h.pad(i + 1) + "</span><h3>" + g[0] + "</h3><p>" + g[1] + "</p></li>"; }).join("") + '</ol><p class="x-small">' + c.care + "</p></section></div>";
  }

  /* ---------- Product page: the spread ---------- */
  function product(ctx, p) {
    var m = h.pdp(ctx, p);
    return '<article class="f-pdp" style="' + ctx.capStyle(p) + '"><div class="f-pdp-spread"><figure class="f-pdp-field">' + h.front(ctx, p, { eager: true, cls: "f-pdp-bottle" }) + "<figcaption><span>" + fig(m.no) + " — " + m.name + ", " + m.format.toLowerCase() + ".</span><span>Draft packaging</span></figcaption></figure>" +
      '<div class="f-pdp-copy">' + K.crumbs([["/", "Home"], ["/shop", "Contents"], ["", m.name]]) + '<p class="x-kicker f-folio">No. ' + m.no + " of " + m.total + " · " + m.format + "</p><h1>" + m.name + '</h1><p class="f-dek f-pdp-dek">' + m.sub + "</p>" +
      '<div class="f-buy" data-pd-buy><p class="f-price f-price-lg">' + m.price + ' <em>sample price</em></p>' + h.qtySelect(m, "x-qty f-qty") + h.addMain(m, "x-btn f-pill f-buy-add") + '</div><p class="f-stock' + (m.off ? " is-off" : "") + '">' + m.stockLine + ' · One-time purchase · No payment in the preview</p>' +
      '<section class="f-close" aria-labelledby="f-cl-t"><h2 id="f-cl-t" class="f-folio">Close reading</h2><div class="f-close-grid"><figure><div class="f-crop is-cap">' + h.render(ctx, p, "cap", { alt: "" }) + '</div><figcaption>The cap, seen from above.</figcaption></figure><figure><div class="f-crop is-mark">' + h.front(ctx, p, { alt: "" }) + '</div><figcaption>The wordmark.</figcaption></figure><figure><div class="f-crop is-rear"><span>Rear label — awaiting approval</span></div><figcaption>The facts, when approved.</figcaption></figure></div></section>' +
      '<div class="f-pdp-cols"><p>In view: ' + m.inView + ". The approved label will state each amount per serving, the directions and the cautions." + (m.note ? " " + m.note : "") + '</p><p>Every pack carries a lot number. <a class="x-link" href="#f-pdp-lot">Look up its record</a> once reports are published.</p></div></div></div>' +
      '<div class="f-pdp-body"><section class="f-pdp-sec" aria-labelledby="f-facts-t"><header><p class="x-kicker f-folio">At a glance</p><h2 id="f-facts-t">The facts, so far</h2></header><div>' + h.dl(m.facts.filter(function (f) { return f[0] !== "Ingredient in view"; })) + '<h3 class="x-subhead">What the approved label will add</h3>' + h.dash(m.confirm) + "</div></section>" +
      '<section class="f-pdp-sec" aria-labelledby="f-care-t"><header><p class="x-kicker f-folio">Use and care</p><h2 id="f-care-t">Directions, storage, cautions</h2></header><div class="x-faqs">' + m.care.map(function (c) { return '<details class="x-faq"><summary><span>' + c[0] + '</span><span class="x-faq-mark" aria-hidden="true">+</span></summary><p><em>' + h.PENDING + ".</em> " + c[1] + "</p></details>"; }).join("") + '<details class="x-faq"><summary><span>Delivery and returns</span><span class="x-faq-mark" aria-hidden="true">+</span></summary><p>Sample delivery is ₹75, waived on sample orders of ₹1,499 or more. Final return eligibility, timing and remedies are still being approved.</p>' + h.pincodeForm("x-inline-form f-pin") + "</details></div></section>" +
      '<section class="f-pdp-sec" id="f-pdp-lot" aria-labelledby="f-lot-t2"><header><p class="x-kicker f-folio">Service</p><h2 id="f-lot-t2">The record for your lot</h2></header><div><p class="f-dek">' + S.copy.reports.what + "</p>" + h.pdpLotForm(m, "x-inline-form f-pdp-lot") + "</div></section>" +
      '<section class="f-pdp-sec" aria-labelledby="f-q-t2"><header><p class="x-kicker f-folio">Letters</p><h2 id="f-q-t2">Questions, answered plainly</h2></header><div class="x-faqs">' + h.faqs(m.faqs) + "</div></section>" +
      (m.next ? '<a class="f-next" href="/products/' + m.next.id + '" style="' + ctx.capStyle(m.next) + '"><span class="f-folio">Next · No. ' + h.no(ctx, m.next) + '</span><strong>' + ctx.escape(m.next.name) + '</strong><em>' + ctx.escape(m.next.subtitle) + "</em>" + h.front(ctx, m.next, { alt: "" }) + "</a>" : "") + "</div></article>";
  }

  /* ---------- Lot reports: an essay with the form in the margin ---------- */
  function reports(ctx) {
    var c = S.copy.reports, pid = ctx.product(ctx.query.get("product")) ? ctx.query.get("product") : "vitamin-d3-k2", cur = ctx.product(pid);
    var picker = '<div class="report-product-picker f-pick" role="group" aria-label="Choose your product">' + ctx.catalog.map(function (p) { return '<button type="button" style="' + ctx.capStyle(p) + '" class="' + (p.id === pid ? "selected" : "") + '" data-report-product="' + p.id + '" aria-pressed="' + (p.id === pid) + '"><span class="f-folio">' + h.no(ctx, p) + "</span><span>" + ctx.escape(p.name) + "</span></button>"; }).join("") + "</div>";
    return '<div class="x-page f-reports report-page" style="' + (cur ? ctx.capStyle(cur) : "") + '">' + K.head({ kicker: "Service · Lot reports", title: "The record for your lot", lede: c.lede }) +
      '<div class="f-rep-grid"><div class="f-rep-form"><p class="x-kicker f-folio">Choose your product</p>' + picker + ctx.forms.reportForm(pid, ctx.query.get("lot")) + '<p class="x-small">' + c.demo + "</p></div>" +
      '<div class="f-rep-essay"><p class="f-drop f-lead">' + c.what + "</p>" + c.steps.map(function (s, i) { return '<h2><span class="f-folio">' + h.pad(i + 1) + "</span> " + s[0] + "</h2><p>" + s[1] + "</p>"; }).join("") + '<p class="f-dek">' + c.locationStatus + '</p><h2><span class="f-folio">04</span> What a record should show</h2>' + h.dl(c.hierarchy) + '<h2><span class="f-folio">05</span> Its limits</h2>' + h.dash(c.limits) + "</div></div>" +
      '<nav class="x-next" aria-label="Keep reading"><a class="x-link" href="/learn/understanding-reports">What a lot report shows</a><a class="x-link" href="/standards#lot">How packs link to lots</a><a class="x-link" href="/contact">Ask about a lot</a></nav></div>';
  }

  function plate(ctx, id, caption) { var p = ctx.product(id); return p ? '<figure class="f-plate" style="' + ctx.capStyle(p) + '">' + h.render(ctx, p, "tq", { alt: "" }) + "<figcaption>" + caption + "</figcaption></figure>" : ""; }

  S.themes.f = E.make({
    key: "f", kit: kit, chrome: chrome, home: home, shop: shop, product: product, reports: reports,
    standardsArt: function (ctx) { return plate(ctx, "omega-3-fish-oil", "Fig. 04 — The front of the pack is a summary. The label on the back is what this page is about."); },
    storyArt: function (ctx) { return '<div class="f-shelf" aria-hidden="true">' + ctx.catalog.map(function (p) { return '<span style="' + ctx.capStyle(p) + '">' + h.front(ctx, p, { alt: "" }) + "</span>"; }).join("") + "</div>"; },
    aboutArt: function (ctx) { return plate(ctx, "myo-d-chiro-inositol", "Fig. 05 — One of seven. Draft packaging."); },
  });
})();
