/* Body Café Co. — Direction G · Darkroom. Very premium, black and white.
   Idea: the collection photographed. The interface is strictly black and white, like a darkroom print; the only colour
   on the site is the bottles themselves, lit like objects on a plinth. Product pages read like gallery wall labels.
   Signature: a spotlight hero with a film-strip picker; the collection as a contact sheet; frames and exposure numbers. */
(function () {
  "use strict";
  var S = window.BCCSite, E = window.BCCEH, h = E.h;
  var MENU = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg>';
  function frame(ctx, p) { return "Frame " + h.no(ctx, p) + "A"; }

  var kit = {
    head: function (o) {
      return '<header class="x-head g-head">' + (o.crumbs ? this.crumbs(o.crumbs) : "") + (o.kicker ? '<p class="x-kicker">' + o.kicker + "</p>" : "") + "<h1>" + o.title + "</h1>" + (o.lede ? '<p class="x-lede">' + o.lede + "</p>" : "") + (o.aside ? '<div class="x-head-aside">' + o.aside + "</div>" : "") + "</header>";
    },
    row: function (ctx, p, href, end, sub) {
      return '<li class="x-row g-row"><a href="' + href + '"><span class="x-row-media g-row-media">' + h.render(ctx, p, "tq", { alt: "" }) + '</span><span class="x-row-main"><strong>' + ctx.escape(p.name) + "</strong><small>" + (sub || ctx.escape(ctx.format[p.id])) + '</small></span><span class="x-row-end">' + end + "</span></a></li>";
    },
  };
  var K = Object.assign({}, h.KIT, kit);

  function chrome(ctx, content) {
    var path = ctx.path;
    var cur = function (href) { return path === href || path.indexOf(href + "/") === 0 ? ' aria-current="page"' : ""; };
    var nav = [["/shop", "Shop"], ["/standards", "Standards"], ["/about", "About"], ["/learn", "Learn"], ["/story", "Story"]];
    return '<div class="eh eh-g">' +
      '<header class="g-header"><a class="g-logo" href="/" aria-label="Body Café Co. home"><img src="/web/media/brand-original-white.svg" alt="" width="456" height="443"></a>' +
      '<nav class="g-nav" aria-label="Main">' + nav.map(function (n) { return '<a href="' + n[0] + '"' + cur(n[0]) + ">" + n[1] + "</a>"; }).join("") + "</nav>" +
      '<div class="g-tools"><button class="g-icon" data-action="search" aria-label="Search">' + ctx.icon("search") + '</button><a class="g-lotbtn" href="/reports"' + cur("/reports") + '>Lot report</a><a class="g-icon" href="/account" aria-label="Your account"' + cur("/account") + ">" + ctx.icon("user") + '</a><a class="g-icon bag-link" href="/cart" aria-label="Bag, ' + ctx.count + ' items">' + ctx.icon("bag") + '<span class="g-count" data-cart-count' + (ctx.count ? "" : " data-empty") + ">" + ctx.count + '</span></a><button class="g-icon g-menu menu-button" data-action="menu" aria-expanded="false" aria-controls="mobile-nav">' + MENU + '<span class="sr-only">Menu</span></button></div></header>' +
      '<nav id="mobile-nav" class="x-mnav g-mnav" hidden aria-label="Mobile"><ol>' +
      [["/shop", "Shop"]].concat(nav.slice(1)).concat([["/reports", "Lot report"], ["/search", "Search"], ["/help", "Help"]]).map(function (n) { return '<li><a href="' + n[0] + '">' + n[1] + "</a></li>"; }).join("") + '</ol><p class="g-mnav-foot"><a href="/account">Account</a><a href="/cart">Bag (<span data-cart-count>' + ctx.count + "</span>)</a></p></nav>" +
      '<main id="main" tabindex="-1">' + content + "</main>" +
      '<footer class="g-footer"><img class="g-foot-word" src="/web/media/brand-horizontal-white.svg" alt="Body Café Co." width="1160" height="140"><div class="g-foot-grid"><p class="g-foot-line">Seven supplements, photographed plainly. The details live on the label and in the lot record.</p>' +
      '<div><h2>Collection</h2>' + ctx.published.map(function (p) { return '<a href="/products/' + p.id + '">' + ctx.escape(p.name) + "</a>"; }).join("") + '</div><div><h2>Read</h2><a href="/about">About</a><a href="/story">Story</a><a href="/standards">Standards</a><a href="/learn">Learn</a><a href="/reports">Lot reports</a></div>' + S.careGroups().map(function (g) { return '<div><h2>' + g.group + '</h2>' + g.items.map(function (x) { return '<a href="' + x[1] + '">' + x[0] + '</a>'; }).join('') + '</div>'; }).join('') + "</div>" +
      '<p class="g-foot-legal"><span>© ' + new Date().getFullYear() + ' Body Café Co.</span><span>Preview store. Prices are samples, packaging is a draft and lot reports are demonstration records.</span><a href="/preview/states">Design states</a></p></footer></div>';
  }

  /* ---------- Home ---------- */
  function home(ctx) {
    var list = ctx.published, H = h.HOME;
    if (!list.length) return K.head({ title: "The darkroom is closed" });
    return (
      /* 1 · Hero: spotlight with a film strip */
      '<section class="g-hero" data-home-section="hero" aria-labelledby="g-hero-t" data-eh-tabs><div class="g-hero-copy"><p class="x-kicker">Seven supplements · One light</p><h1 id="g-hero-t">Nothing to hide. <em>Everything in view.</em></h1><p class="x-lede">' + H.hero + '</p><div class="g-actions"><a class="x-btn" href="/shop"><span>Shop the collection</span></a><a class="x-link" href="/reports">Find a lot report</a></div></div>' +
      '<div class="g-stage">' + list.map(function (p, i) { return '<figure class="g-spot" role="tabpanel" id="g-sp' + i + '" aria-labelledby="g-st' + i + '" data-eh-panel="' + i + '"' + (i ? " hidden" : "") + '><a href="/products/' + p.id + '" tabindex="-1" aria-hidden="true">' + h.render(ctx, p, "tq", { eager: i === 0, alt: "" }) + '</a><figcaption><span>' + frame(ctx, p) + '</span><strong>' + ctx.escape(p.name) + "</strong><span>" + ctx.escape(ctx.format[p.id]) + " · " + ctx.money(p.price) + ' sample · Draft packaging</span><a class="x-link" href="/products/' + p.id + '">View ' + ctx.escape(p.name) + "</a></figcaption></figure>"; }).join("") + "</div>" +
      '<div class="g-strip" role="tablist" aria-label="Choose a bottle">' + list.map(function (p, i) { return '<button type="button" role="tab" id="g-st' + i + '" aria-controls="g-sp' + i + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" data-eh-tab="' + i + '"><span class="g-strip-img">' + h.front(ctx, p, { alt: "" }) + '</span><span class="g-strip-no">' + h.no(ctx, p) + 'A</span><span class="sr-only">' + ctx.escape(p.name) + "</span></button>"; }).join("") + "</div></section>" +

      /* 2 · Meet the collection: contact sheet */
      '<section class="g-sheet g-light" data-home-section="collection" aria-labelledby="g-sheet-t"><header class="g-sec-head"><p class="x-kicker">Contact sheet · 07 frames</p><h2 id="g-sheet-t">Meet the collection</h2><a class="x-link" href="/shop">See all seven</a></header><ol class="g-frames">' +
      list.map(function (p) { return '<li class="g-frame"><a href="/products/' + p.id + '"><span class="g-frame-img">' + h.front(ctx, p, { alt: "" }) + '</span><span class="g-frame-no">' + frame(ctx, p) + '</span><strong>' + ctx.escape(p.name) + "</strong><small>" + ctx.escape(ctx.format[p.id]) + " · " + ctx.money(p.price) + '<span class="sr-only">, sample price</span></small></a>' + h.addBtn(ctx, p, "g-frame-add", "Add") + "</li>"; }).join("") +
      '</ol><p class="x-small">Prices are samples. Packaging shown is a draft.</p></section>' +

      /* 3 · Generate curiosity */
      '<section class="g-ask" data-home-section="curiosity" aria-labelledby="g-ask-t"><header class="g-sec-head"><p class="x-kicker">Develop the detail</p><h2 id="g-ask-t">Seven questions worth asking.</h2><p class="x-lede">' + H.curiosity + '</p></header><div class="g-ask-grid" data-eh-tabs data-eh-orient="vertical"><div class="g-ask-list" role="tablist" aria-orientation="vertical" aria-label="Choose a product">' +
      list.map(function (p, i) { var a = h.ask(p); return '<button type="button" role="tab" id="g-at' + i + '" aria-controls="g-ap' + i + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" data-eh-tab="' + i + '"><span>' + h.no(ctx, p) + "</span><strong>" + a.q + "</strong><em>" + ctx.escape(p.name) + "</em></button>"; }).join("") + "</div>" +
      list.map(function (p, i) { var a = h.ask(p); return '<div class="g-ask-panel" role="tabpanel" id="g-ap' + i + '" aria-labelledby="g-at' + i + '" data-eh-panel="' + i + '"' + (i ? " hidden" : "") + '><figure>' + h.render(ctx, p, "tq", { alt: "" }) + '</figure><div><p class="g-ask-d">' + a.d + "</p><p>" + a.lead + '</p><p class="g-ask-links"><a class="x-link" href="/learn/' + p.id + '">Read the ingredient note</a><a class="x-link" href="/products/' + p.id + '">View the product</a></p></div></div>'; }).join("") + "</div></section>" +

      /* 4 · Trust and transparency */
      '<section class="g-trust g-light" data-home-section="trust" aria-labelledby="g-tr-t"><header class="g-sec-head"><p class="x-kicker">Trust and transparency</p><h2 id="g-tr-t">Printed in plain black and white.</h2><p class="x-lede">' + H.trust + '</p></header><div class="g-trust-cols">' +
      [["Documented now", S.copy.standards.documented], ["Planned before launch", S.copy.standards.planned], ["What we won't do", S.copy.standards.wont]].map(function (c, i) { return '<article><p class="g-trust-no">' + h.pad(i + 1) + "</p><h3>" + c[0] + "</h3>" + h.dash(c[1]) + "</article>"; }).join("") + '</div><p class="g-trust-more"><a class="x-btn x-btn-ghost" href="/standards"><span>Read the standards</span></a></p></section>' +

      /* 5 · Lot report */
      '<section class="g-lot" data-home-section="lot" aria-labelledby="g-lot-t"><div class="g-lot-head"><p class="x-kicker">Lot report</p><h2 id="g-lot-t">Every pack has a negative on file.</h2><p class="x-lede">' + S.copy.reports.what + "</p></div>" + h.numbered(S.copy.reports.steps, "x-steps g-steps") +
      '<div class="g-lot-form">' + h.homeLotForm(ctx, "x-lotform g-lotform", "x-btn") + '</div><p class="g-lot-limits">' + S.copy.reports.limits.join(" ") + "</p></section>" +

      /* 6 · Customer voices */
      '<section class="g-voices g-light" data-home-section="voices" aria-labelledby="g-vo-t"><p class="x-kicker" id="g-vo-t">Customer voices</p><div class="g-voices-frame"><p class="g-voices-lead">' + H.voices + '</p><p class="x-lede">' + H.voicesBody + '</p><p class="x-small">' + H.voicesSmall + "</p></div></section>" +

      /* 7 · Before you order */
      '<section class="g-faq g-light" data-home-section="faq" aria-labelledby="g-faq-t"><header class="g-sec-head"><p class="x-kicker">Before you order</p><h2 id="g-faq-t">Good questions welcome here.</h2><a class="x-link" href="/help">Visit the help centre</a></header><div class="x-faqs">' + h.faqs(H.faq) + "</div></section>"
    );
  }

  /* ---------- Shop: contact sheet, or list ---------- */
  function shop(ctx) {
    var st = h.shopList(ctx), c = S.copy.shop, list = ctx.query.get("view") === "list";
    var q = function (v) { var u = new URLSearchParams(ctx.query); if (v) u.set("view", v); else u.delete("view"); var s = u.toString(); return "/shop" + (s ? "?" + s : ""); };
    return '<div class="x-page g-shop">' + K.head({ kicker: "The collection · " + ctx.published.length + " frames", title: "Shop", lede: c.lede }) +
      '<div class="x-shopbar g-shopbar">' + h.filterNav(ctx, st, "x-filter g-filter") + '<div class="g-bar-end"><nav class="g-view" aria-label="View"><a href="' + q("") + '"' + (list ? "" : ' aria-current="page"') + '>Frames</a><a href="' + q("list") + '"' + (list ? ' aria-current="page"' : "") + ">List</a></nav>" + h.sortForm(ctx, st) + "</div></div>" +
      (st.list.length && st.known
        ? list
          ? '<ol class="g-list">' + st.list.map(function (p) { return '<li><a href="/products/' + p.id + '"><span class="g-list-no">' + h.no(ctx, p) + '</span><span class="g-list-img">' + h.front(ctx, p, { alt: "" }) + '</span><span class="g-list-main"><strong>' + ctx.escape(p.name) + "</strong><small>" + ctx.escape(p.subtitle) + '</small></span><span class="g-list-fmt">' + ctx.escape(ctx.format[p.id]) + '</span><span class="g-list-price">' + ctx.money(p.price) + '<small>sample</small></span></a>' + h.addBtn(ctx, p, "g-frame-add", "Add") + "</li>"; }).join("") + "</ol>"
          : '<ol class="g-shot">' + st.list.map(function (p) { return '<li class="g-shot-item"><a class="g-shot-frame" href="/products/' + p.id + '" aria-label="' + ctx.escape(p.name) + '">' + h.render(ctx, p, "tq", { alt: "" }) + '<span class="g-shot-no">' + frame(ctx, p) + '</span></a><div class="g-shot-cap"><div><h2><a href="/products/' + p.id + '">' + ctx.escape(p.name) + "</a></h2><p>" + ctx.escape(p.subtitle) + '</p></div><p class="g-price">' + ctx.money(p.price) + "<small>" + ctx.escape(ctx.format[p.id]) + " · sample price</small></p>" + h.addBtn(ctx, p, "x-btn g-shot-add", "Add to bag") + "</div></li>"; }).join("") + "</ol>"
        : K.empty(ctx, { title: c.noMatch[0], text: c.noMatch[1], cta: "Show all seven" })) +
      '<section class="g-guide" aria-labelledby="g-g-t"><h2 id="g-g-t">' + c.guidanceTitle + "</h2>" + h.numbered(c.guidance, "x-steps g-guide-steps") + '<p class="x-small">' + c.care + "</p></section></div>";
  }

  /* ---------- Product page: gallery frames + wall label ---------- */
  function product(ctx, p) {
    var m = h.pdp(ctx, p);
    return '<article class="g-pdp"><div class="g-pdp-grid"><div class="g-gallery" aria-label="Pictures of ' + m.name + '">' +
      '<figure class="g-plate is-main">' + h.render(ctx, p, "tq", { eager: true }) + "<figcaption>" + frame(ctx, p) + " · Three-quarter view · Draft packaging</figcaption></figure>" +
      '<div class="g-plates"><figure class="g-plate">' + h.front(ctx, p, {}) + '<figcaption>Front label</figcaption></figure><figure class="g-plate">' + h.render(ctx, p, "cap", {}) + '<figcaption>Cap, from above</figcaption></figure></div></div>' +
      '<div class="g-label">' + K.crumbs([["/", "Home"], ["/shop", "Shop"], ["", m.name]]) + '<p class="x-kicker">' + m.no + " / " + m.total + " · " + m.format + "</p><h1>" + m.name + '</h1><p class="g-sub">' + m.sub + "</p>" +
      '<div class="g-buy" data-pd-buy><p class="g-price g-price-lg">' + m.price + "<small>Sample price · one-time purchase</small></p>" + h.qtySelect(m, "x-qty g-qty") + h.addMain(m, "x-btn g-buy-add") + '<p class="g-stock' + (m.off ? " is-off" : "") + '">' + m.stockLine + "</p></div>" +
      '<dl class="g-wall"><div><dt>In view</dt><dd>' + m.inView + (m.note ? ". " + m.note : "") + '</dd></div><div><dt>Label</dt><dd>Draft. The approved rear label will add amounts, directions and cautions.</dd></div><div><dt>Lot record</dt><dd><a class="x-link" href="#g-pdp-lot">Look up your lot</a></dd></div></dl></div></div>' +
      '<div class="g-pdp-body">' +
      K.sec({ id: "g-facts", kicker: "At a glance", title: "The facts, so far", body: h.dl(m.facts.filter(function (f) { return f[0] !== "Ingredient in view"; })) + '<h3 class="x-subhead">What the approved label will add</h3>' + h.dash(m.confirm) }) +
      K.sec({ id: "g-care", kicker: "Use and care", title: "Directions, storage, cautions", body: '<div class="x-faqs">' + m.care.map(function (c) { return '<details class="x-faq"><summary><span>' + c[0] + '</span><span class="x-faq-mark" aria-hidden="true">+</span></summary><p><em>' + h.PENDING + ".</em> " + c[1] + "</p></details>"; }).join("") + '<details class="x-faq"><summary><span>Delivery and returns</span><span class="x-faq-mark" aria-hidden="true">+</span></summary><p>Sample delivery is ₹75, waived on sample orders of ₹1,499 or more. Final return eligibility, timing and remedies are still being approved.</p>' + h.pincodeForm() + "</details></div>" }) +
      K.sec({ id: "g-pdp-lot", kicker: "Lot report", title: "The record for your lot", body: '<p class="x-lede">' + S.copy.reports.what + "</p>" + h.pdpLotForm(m) }) +
      K.sec({ id: "g-faqs", kicker: "Questions", title: "Asked plainly", body: '<div class="x-faqs">' + h.faqs(m.faqs) + "</div>" }) +
      (m.related.length ? '<nav class="g-more" aria-label="More from the collection"><h2>Next frames</h2><ol>' + m.related.slice(0, 3).map(function (r) { return '<li><a href="/products/' + r.id + '">' + h.render(ctx, r, "tq", { alt: "" }) + "<span>" + frame(ctx, r) + "</span><strong>" + ctx.escape(r.name) + "</strong></a></li>"; }).join("") + "</ol></nav>" : "") +
      "</div></article>";
  }

  /* ---------- Lot reports ---------- */
  function reports(ctx) {
    var c = S.copy.reports, pid = ctx.product(ctx.query.get("product")) ? ctx.query.get("product") : "vitamin-d3-k2";
    var picker = '<div class="report-product-picker g-pick" role="group" aria-label="Choose your product">' + ctx.catalog.map(function (p) { return '<button type="button" class="' + (p.id === pid ? "selected" : "") + '" data-report-product="' + p.id + '" aria-pressed="' + (p.id === pid) + '">' + h.front(ctx, p, { alt: "" }) + "<span>" + ctx.escape(p.name) + "</span></button>"; }).join("") + "</div>";
    return '<div class="x-page g-reports report-page">' + K.head({ kicker: "Lot reports", title: "Find the record for your lot", lede: c.lede }) +
      '<div class="g-rep-panel"><h2 class="x-subhead">1 · Choose your product</h2>' + picker + '<h2 class="x-subhead">2 · Enter the lot number</h2>' + ctx.forms.reportForm(pid, ctx.query.get("lot")) + '<p class="x-small">' + c.demo + "</p></div>" +
      K.sec({ id: "how", kicker: "How it works", title: "Three steps", body: h.numbered(c.steps) + '<p class="x-small">' + c.locationStatus + "</p>" }) +
      K.sec({ id: "anatomy", kicker: "Anatomy of a report", title: "What a record should show", body: h.dl(c.hierarchy, "x-dl is-numbered"), aside: '<p class="x-aside-k">Its limits</p>' + h.dash(c.limits) }) +
      '<nav class="x-next" aria-label="Keep reading"><a class="x-link" href="/learn/understanding-reports">What a lot report shows</a><a class="x-link" href="/standards#lot">How packs link to lots</a><a class="x-link" href="/contact">Ask about a lot</a></nav></div>';
  }

  function plinth(ctx, ids, cap) { return '<figure class="g-plinth">' + ids.map(function (id) { var p = ctx.product(id); return p ? h.render(ctx, p, "tq", { alt: "" }) : ""; }).join("") + "<figcaption>" + cap + "</figcaption></figure>"; }

  S.themes.g = E.make({
    key: "g", kit: kit, chrome: chrome, home: home, shop: shop, product: product, reports: reports,
    standardsArt: function (ctx) { return plinth(ctx, ["omega-3-fish-oil", "vitamin-d3-k2"], "Two of seven, draft packaging. The rear label is where the detail lives."); },
    storyArt: function (ctx) { return plinth(ctx, ["iron-bisglycinate", "l-theanine", "creatine-chews"], "Three of seven, draft packaging."); },
    aboutArt: function (ctx) { return plinth(ctx, ["psyllium-husk", "myo-d-chiro-inositol"], "Two of seven, draft packaging."); },
  });
})();
