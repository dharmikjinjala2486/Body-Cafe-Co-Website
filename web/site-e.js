/* Body Café Co. — Direction E · Fan Deck. Minimal and clean, in the brand colours.
   Idea: each bottle is a swatch, a coloured cap over a cream body. The interface is built from that unit: a cap band on
   top, a body below. Cap colours are information, never decoration. Product names are set in LEMON MILK, as printed.
   Signature: the collection as a fan deck of seven chips; the product page is the bottle (cap band over cream body). */
(function () {
  "use strict";
  var S = window.BCCSite, E = window.BCCEH, h = E.h;
  var MENU = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>';

  function capInk(ctx, p) { return ctx.onCap(p.color); }
  function name(ctx, p, tag, cls) { tag = tag || "span"; return "<" + tag + ' class="e-name ' + (cls || "") + '">' + ctx.escape(p.name) + "</" + tag + ">"; }
  function stripe(ctx, cls) { return '<div class="e-stripe ' + (cls || "") + '" aria-hidden="true">' + ctx.catalog.map(function (p) { return '<span style="background:' + p.color + '"></span>'; }).join("") + "</div>"; }

  var kit = {
    head: function (o) {
      return '<header class="x-head e-head">' + (o.crumbs ? this.crumbs(o.crumbs) : "") + (o.kicker ? '<p class="x-kicker">' + o.kicker + "</p>" : "") + "<h1>" + o.title + "</h1>" + (o.lede ? '<p class="x-lede">' + o.lede + "</p>" : "") + (o.aside ? '<div class="x-head-aside">' + o.aside + "</div>" : "") + "</header>";
    },
    row: function (ctx, p, href, end, sub) {
      return '<li class="x-row e-row" style="' + ctx.capStyle(p) + '"><a href="' + href + '"><span class="x-row-media e-row-cap">' + h.render(ctx, p, "cap", { alt: "" }) + '</span><span class="x-row-main"><strong>' + ctx.escape(p.name) + "</strong><small>" + (sub || ctx.escape(ctx.format[p.id])) + '</small></span><span class="x-row-end">' + end + "</span></a></li>";
    },
  };

  var K = Object.assign({}, h.KIT, kit);

  /* ---------- Chrome ---------- */
  function chrome(ctx, content) {
    var path = ctx.path;
    var cur = function (href) { return path === href || path.indexOf(href + "/") === 0 ? ' aria-current="page"' : ""; };
    var nav = [["/shop", "Shop"], ["/standards", "Standards"], ["/about", "About"], ["/learn", "Learn"], ["/story", "Story"]];
    return '<div class="eh eh-e">' +
      '<header class="e-header"><a class="e-logo" href="/" aria-label="Body Café Co. home"><img src="/web/media/brand-original.svg" alt="" width="456" height="443"></a>' +
      '<nav class="e-nav" aria-label="Main">' + nav.map(function (n) { return '<a href="' + n[0] + '"' + cur(n[0]) + ">" + n[1] + "</a>"; }).join("") + "</nav>" +
      '<div class="e-tools"><button class="e-icon" data-action="search" aria-label="Search">' + ctx.icon("search") + "</button>" +
      '<a class="e-lot" href="/reports"' + cur("/reports") + '><span class="e-lot-caps" aria-hidden="true"><i style="background:#aa472e"></i><i style="background:#35306f"></i><i style="background:#07566a"></i></span>Lot report</a>' +
      '<a class="e-icon" href="/account" aria-label="Your account"' + cur("/account") + ">" + ctx.icon("user") + "</a>" +
      '<a class="e-icon bag-link" href="/cart" aria-label="Bag, ' + ctx.count + ' items">' + ctx.icon("bag") + '<span class="e-count" data-cart-count' + (ctx.count ? "" : " data-empty") + ">" + ctx.count + "</span></a>" +
      '<button class="e-icon e-menu menu-button" data-action="menu" aria-expanded="false" aria-controls="mobile-nav">' + MENU + '<span class="sr-only">Menu</span></button></div></header>' +
      stripe(ctx, "e-stripe-head") +
      '<nav id="mobile-nav" class="x-mnav e-mnav" hidden aria-label="Mobile"><a class="e-mnav-lot" href="/reports">Find a lot report</a><ol>' +
      [["/shop", "Shop all seven"]].concat(nav.slice(1)).concat([["/search", "Search"], ["/help", "Help centre"]]).map(function (n, i) { return '<li><a href="' + n[0] + '"><span>' + h.pad(i + 1) + "</span>" + n[1] + "</a></li>"; }).join("") + "</ol>" +
      '<div class="e-mnav-caps">' + ctx.published.map(function (p) { return '<a href="/products/' + p.id + '" style="background:' + p.color + ";color:" + capInk(ctx, p) + '"><span>' + h.no(ctx, p) + "</span>" + ctx.escape(p.name) + "</a>"; }).join("") + "</div>" +
      '<p class="e-mnav-foot"><a href="/account">Account</a><a href="/cart">Bag (<span data-cart-count>' + ctx.count + "</span>)</a></p></nav>" +
      '<main id="main" tabindex="-1">' + content + "</main>" +
      '<footer class="e-footer">' + stripe(ctx, "e-stripe-foot") + '<div class="e-foot-grid"><div class="e-foot-brand"><img src="/web/media/brand-original.svg" alt="Body Café Co." width="456" height="443"><p>Seven everyday supplements, each with its own cap colour.</p></div>' +
      '<div><h2>Shop</h2><a href="/shop">All seven</a>' + ctx.published.map(function (p) { return '<a href="/products/' + p.id + '"><i style="background:' + p.color + '" aria-hidden="true"></i>' + ctx.escape(p.name) + "</a>"; }).join("") + "</div>" +
      '<div><h2>Read</h2><a href="/about">About</a><a href="/story">Story</a><a href="/standards">Standards</a><a href="/learn">Learn</a><a href="/reports">Lot reports</a></div>' +
      S.careGroups().map(function (g) { return '<div><h2>' + g.group + '</h2>' + g.items.map(function (x) { return '<a href="' + x[1] + '">' + x[0] + '</a>'; }).join('') + '</div>'; }).join('') + "</div>" +
      '<p class="e-foot-legal"><span>© ' + new Date().getFullYear() + " Body Café Co.</span><span>Preview store. Prices are samples, packaging is a draft and lot reports are demonstration records.</span><a href=\"/preview/states\">Design states</a></p></footer></div>";
  }

  /* ---------- Home: seven sections ---------- */
  function home(ctx) {
    var list = ctx.published, H = h.HOME;
    if (!list.length) return K.head({ title: "The collection is resting" });
    var first = ctx.product("iron-bisglycinate") || list[0];
    return (
      /* 1 · Hero */
      '<section class="e-hero" data-home-section="hero" aria-labelledby="e-hero-t"><div class="e-hero-copy"><p class="x-kicker">01 — 07 · Seven daily supplements</p><h1 id="e-hero-t">Seven supplements. <span>One colour each.</span></h1><p class="x-lede">' + H.hero + '</p><div class="e-actions"><a class="x-btn" href="/shop"><span>Shop all seven</span></a><a class="x-link" href="/reports">Find a lot report</a></div><p class="x-small">Prices are samples. Packaging shown is a draft.</p></div>' +
      '<ol class="e-tray" aria-label="The seven, by cap colour">' + list.map(function (p) { return '<li style="' + ctx.capStyle(p) + '"><a href="/products/' + p.id + '"><span class="e-tray-cap">' + h.render(ctx, p, "cap", { alt: "", eager: true }) + '</span><span class="e-tray-no">' + h.no(ctx, p) + "</span>" + name(ctx, p) + "</a></li>"; }).join("") + "</ol></section>" +

      /* 2 · Meet the collection: the fan deck */
      '<section class="e-collection" id="collection" data-home-section="collection" aria-labelledby="e-col-t"><header class="e-sec-head"><p class="x-kicker">Meet the collection</p><h2 id="e-col-t">Open a colour.</h2><p>Every chip is a product. Choose one to see the bottle, the format and the sample price.</p></header>' +
      '<div class="e-deck" data-eh-tabs data-eh-hover>' + list.map(function (p, i) {
        var on = p.id === first.id;
        return '<div class="e-chip" style="' + ctx.capStyle(p) + '"><button type="button" class="e-chip-cap" data-eh-tab="' + i + '" aria-expanded="' + on + '" aria-controls="e-chip-' + p.id + '"><span class="e-chip-no">' + h.no(ctx, p) + '</span><span class="e-chip-fmt">' + ctx.escape(ctx.format[p.id]) + '</span><span class="e-chip-label">' + ctx.escape(p.name) + "</span></button>" +
          '<div class="e-chip-body"><span class="e-chip-vert" aria-hidden="true">' + ctx.escape(p.name) + '</span><div class="e-chip-panel" id="e-chip-' + p.id + '" data-eh-panel="' + i + '"' + (on ? "" : " hidden") + '><a class="e-chip-media" href="/products/' + p.id + '" tabindex="-1" aria-hidden="true">' + h.front(ctx, p, { alt: "" }) + "</a>" + name(ctx, p, "h3") + '<p class="e-chip-sub">' + ctx.escape(p.subtitle) + '</p><div class="e-chip-foot"><p class="e-price">' + ctx.money(p.price) + '<small>Sample price</small></p>' + h.addBtn(ctx, p, "x-btn e-add") + '</div><a class="x-link" href="/products/' + p.id + '">View ' + ctx.escape(p.name) + "</a></div></div></div>";
      }).join("") + "</div></section>" +

      /* 3 · Generate curiosity */
      '<section class="e-curious" data-home-section="curiosity" aria-labelledby="e-cur-t"><header class="e-sec-head"><p class="x-kicker">One question per cap</p><h2 id="e-cur-t">Start with the detail that matters.</h2><p>' + H.curiosity + '</p></header><div class="e-ask" data-eh-tabs data-eh-orient="vertical"><div class="e-ask-list" role="tablist" aria-label="Choose a product" aria-orientation="vertical">' +
      list.map(function (p, i) { return '<button type="button" role="tab" id="e-ask-t' + i + '" aria-controls="e-ask-p' + i + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" data-eh-tab="' + i + '" style="' + ctx.capStyle(p) + '"><i aria-hidden="true"></i>' + ctx.escape(p.name) + "</button>"; }).join("") + "</div>" +
      list.map(function (p, i) { var a = h.ask(p); return '<div class="e-ask-panel" role="tabpanel" id="e-ask-p' + i + '" aria-labelledby="e-ask-t' + i + '" data-eh-panel="' + i + '"' + (i ? " hidden" : "") + ' style="' + ctx.capStyle(p) + '"><div class="e-ask-art">' + h.render(ctx, p, "tq", { alt: "" }) + '</div><div class="e-ask-copy"><p class="x-kicker">' + ctx.escape(p.name) + " · " + ctx.escape(ctx.format[p.id]) + "</p><h3>" + a.q + '</h3><p class="e-ask-d">' + a.d + "</p><p>" + a.lead + '</p><p class="e-ask-links"><a class="x-link" href="/learn/' + p.id + '">Read the ingredient note</a><a class="x-link" href="/products/' + p.id + '">View the product</a></p></div></div>'; }).join("") + "</div></section>" +

      /* 4 · Trust and transparency */
      '<section class="e-trust" data-home-section="trust" aria-labelledby="e-tr-t"><header class="e-sec-head"><p class="x-kicker">Trust and transparency</p><h2 id="e-tr-t">What you can check today.</h2><p>' + H.trust + '</p></header><div class="e-ledger">' +
      [["Published now", S.copy.standards.documented, "#07566a"], ["Planned before launch", S.copy.standards.planned, "#9c9274"], ["What we won't do", S.copy.standards.wont, "#aa472e"]].map(function (c) { return '<div class="e-ledger-col" style="--cap:' + c[2] + '"><h3>' + c[0] + "</h3>" + h.dash(c[1]) + "</div>"; }).join("") + '</div><a class="x-link" href="/standards">Read our standards</a></section>' +

      /* 5 · Lot report */
      '<section class="e-lot-sec" data-home-section="lot" aria-labelledby="e-lot-t"><div class="e-lot-copy"><p class="x-kicker">Lot report</p><h2 id="e-lot-t">Find the lot. Read its record.</h2><p>' + S.copy.reports.what + "</p>" + h.numbered(S.copy.reports.steps) + '</div><div class="e-lot-panel"><p class="x-kicker">Try a lookup</p>' + h.homeLotForm(ctx, "x-lotform e-lotform") + '<h3>What a report can’t tell you</h3>' + h.dash(S.copy.reports.limits) + "</div></section>" +

      /* 6 · Customer voices */
      '<section class="e-voices" data-home-section="voices" aria-labelledby="e-vo-t"><p class="x-kicker" id="e-vo-t">Customer voices</p><p class="e-voices-lead">' + H.voices + '</p><div class="e-voices-body"><p>' + H.voicesBody + '</p><p class="x-small">' + H.voicesSmall + "</p></div>" + stripe(ctx, "e-stripe-thin") + "</section>" +

      /* 7 · Before you order */
      '<section class="e-faq" data-home-section="faq" aria-labelledby="e-faq-t"><header><p class="x-kicker">Before you order</p><h2 id="e-faq-t">Good questions welcome here.</h2><a class="x-link" href="/help">Visit the help centre</a></header><div class="x-faqs">' + h.faqs(H.faq) + "</div></section>"
    );
  }

  /* ---------- Shop ---------- */
  function shop(ctx) {
    var st = h.shopList(ctx), c = S.copy.shop;
    return '<div class="x-page e-shop">' + K.head({ kicker: "Shop · " + ctx.published.length + " products", title: "Shop all seven", lede: c.lede }) +
      '<div class="x-shopbar e-shopbar">' + h.filterNav(ctx, st, "x-filter e-filter") + h.sortForm(ctx, st) + '<p class="x-status" role="status">' + st.list.length + " product" + (st.list.length === 1 ? "" : "s") + "</p></div>" +
      (st.list.length && st.known
        ? '<ol class="e-cards">' + st.list.map(function (p) {
            return '<li class="e-card" style="' + ctx.capStyle(p) + '"><a class="e-card-cap" href="/products/' + p.id + '" aria-label="' + ctx.escape(p.name) + '"><span>' + h.no(ctx, p) + "</span><span>" + ctx.escape(ctx.format[p.id]) + '</span></a><div class="e-card-body"><a class="e-card-media" href="/products/' + p.id + '" tabindex="-1" aria-hidden="true">' + h.front(ctx, p, { alt: "" }) + '</a><h2><a href="/products/' + p.id + '">' + ctx.escape(p.name) + '</a></h2><p class="e-card-sub">' + ctx.escape(h.inView(p)) + '</p><div class="e-card-foot"><p class="e-price">' + ctx.money(p.price) + "<small>Sample price</small></p>" + h.addBtn(ctx, p, "x-btn e-add", "Add") + "</div></div></li>";
          }).join("") + "</ol>"
        : K.empty(ctx, { title: c.noMatch[0], text: c.noMatch[1], cta: "Show all seven" })) +
      '<section class="e-guidance" aria-labelledby="e-gd-t"><h2 id="e-gd-t">' + c.guidanceTitle + "</h2>" + h.numbered(c.guidance) + '<p class="x-small">' + c.care + "</p></section></div>";
  }

  /* ---------- Product page: the page is the bottle ---------- */
  function product(ctx, p) {
    var m = h.pdp(ctx, p), ink = capInk(ctx, p);
    var others = ctx.catalog.filter(function (x) { return x.published || x.id === p.id; });
    return '<article class="e-pdp" style="' + ctx.capStyle(p) + '">' +
      '<div class="e-pdp-band"><div class="e-pdp-band-in">' + K.crumbs([["/", "Home"], ["/shop", "Shop"], ["/shop?format=" + encodeURIComponent(ctx.format[p.id]), m.format], ["", m.name]]) + '<p class="e-pdp-no">' + m.no + " / " + m.total + " · " + m.format + "</p><h1>" + m.name + '</h1><p class="e-pdp-sub">' + m.sub + "</p></div></div>" +
      '<div class="e-pdp-body"><figure class="e-pdp-fig">' + h.front(ctx, p, { eager: true, cls: "e-pdp-bottle" }) + "<figcaption>" + h.MOCKUP + "</figcaption></figure>" +
      '<div class="e-pdp-main"><p class="e-pdp-inview"><span>Ingredients in view</span>' + m.inView + "</p>" + (m.note ? '<p class="x-small">' + m.note + "</p>" : "") +
      h.dl(m.facts.filter(function (f) { return f[0] !== "Ingredient in view"; }), "x-dl e-facts") +
      '<details class="x-faq" open><summary><span>What the approved label will add</span><span class="x-faq-mark" aria-hidden="true">+</span></summary>' + h.dash(m.confirm) + "</details>" +
      m.care.map(function (c) { return '<details class="x-faq"><summary><span>' + c[0] + '</span><span class="x-faq-mark" aria-hidden="true">+</span></summary><p><strong>' + h.PENDING + ".</strong> " + c[1] + "</p></details>"; }).join("") +
      '<details class="x-faq"><summary><span>Delivery and returns</span><span class="x-faq-mark" aria-hidden="true">+</span></summary><p>Pincode estimates are illustrative. Sample delivery is ₹75, waived on sample orders of ₹1,499 or more. Final return eligibility, timing and remedies are still being approved.</p><p><a class="x-link" href="/policies/shipping">Shipping</a> · <a class="x-link" href="/policies/returns">Returns</a></p></details></div>' +
      '<aside class="e-buy" aria-label="Buy ' + m.name + '"><div class="e-buy-top"><p class="e-price e-price-lg">' + m.price + '</p><p class="x-small">Sample price</p></div><p class="e-stock' + (m.off ? " is-off" : "") + '">' + m.stockLine + '</p><p class="x-small">One-time purchase. Prices, tax and delivery are samples.</p><div class="e-buy-row" data-pd-buy>' + h.qtySelect(m) + h.addMain(m, "x-btn e-buy-add") + '</div><p class="x-small">Preview order only. No payment or dispatch.</p>' + h.pincodeForm("x-inline-form e-pin") + "</aside></div>" +
      '<section class="e-pdp-lot" aria-labelledby="e-pl-t"><div><p class="x-kicker">Lot report</p><h2 id="e-pl-t">Every pack points to its lot.</h2><p>' + S.copy.reports.what + "</p>" + h.dash(S.copy.reports.limits) + "</div>" + h.pdpLotForm(m, "x-inline-form e-pdp-lotform") + "</section>" +
      '<section class="e-pdp-faq" aria-labelledby="e-pf-t"><h2 id="e-pf-t">Questions about ' + m.name + '</h2><div class="x-faqs">' + h.faqs(m.faqs) + '</div><p class="e-pdp-links"><a class="x-link" href="/learn/' + p.id + '">Ingredient note</a><a class="x-link" href="/learn/reading-a-label">Read a label with confidence</a><a class="x-link" href="/contact">Contact support</a></p></section>' +
      '<nav class="e-sibs" aria-label="Other products">' + others.map(function (o) { var on = o.id === p.id; return '<a href="/products/' + o.id + '" style="background:' + o.color + ";color:" + capInk(ctx, o) + '"' + (on ? ' aria-current="page"' : "") + '><span>' + h.no(ctx, o) + '</span><span class="e-sib-name">' + ctx.escape(o.name) + "</span></a>"; }).join("") + "</nav></article>";
  }

  /* ---------- Lot reports: pick by cap ---------- */
  function reports(ctx) {
    var c = S.copy.reports, pid = ctx.product(ctx.query.get("product")) ? ctx.query.get("product") : "vitamin-d3-k2", cur = ctx.product(pid);
    var picker = '<div class="report-product-picker e-capick" role="group" aria-label="Choose your product">' + ctx.catalog.map(function (p) { return '<button type="button" style="' + ctx.capStyle(p) + '" class="' + (p.id === pid ? "selected" : "") + '" data-report-product="' + p.id + '" aria-pressed="' + (p.id === pid) + '">' + h.render(ctx, p, "cap", { alt: "" }) + "<span>" + ctx.escape(p.name) + "</span></button>"; }).join("") + "</div>";
    return '<div class="x-page e-reports report-page" style="' + (cur ? ctx.capStyle(cur) : "") + '">' + K.head({ kicker: "Lot reports", title: "Your lot, your record", lede: c.lede }) +
      '<div class="e-rep-grid"><div class="e-rep-form"><p class="x-kicker">1 · Choose your product by its cap</p>' + picker + '<p class="x-kicker">2 · Enter the lot number</p>' + ctx.forms.reportForm(pid, ctx.query.get("lot")) + '<p class="x-small">' + c.demo + "</p></div>" +
      '<div class="e-rep-copy"><p class="x-body">' + c.what + "</p>" + h.numbered(c.steps) + '<p class="x-note"><strong>Where\'s my lot number?</strong> ' + c.locationStatus + "</p></div></div>" +
      '<section class="x-sec" id="anatomy" aria-labelledby="anatomy-t"><div class="x-sec-head"><p class="x-kicker">Anatomy of a report</p><h2 id="anatomy-t">What a record should show</h2></div><div class="x-sec-body">' + h.dl(c.hierarchy, "x-dl is-numbered") + '</div><aside class="x-sec-aside"><p class="x-aside-k">Its limits</p>' + h.dash(c.limits) + "</aside></section>" +
      '<nav class="x-next" aria-label="Keep going"><a class="x-link" href="/learn/understanding-reports">What a lot report shows</a><a class="x-link" href="/standards#lot">How packs link to lots</a><a class="x-link" href="/contact">Ask about a lot</a></nav></div>';
  }

  function art(ctx, ids) { return '<div class="e-art" aria-hidden="true">' + ids.map(ctx.product).filter(Boolean).map(function (p) { return '<span style="' + ctx.capStyle(p) + '">' + h.render(ctx, p, "cap", { alt: "" }) + "</span>"; }).join("") + "</div>"; }

  S.themes.e = E.make({
    key: "e", kit: kit, chrome: chrome, home: home, shop: shop, product: product, reports: reports,
    standardsArt: function (ctx) { return art(ctx, ["omega-3-fish-oil", "iron-bisglycinate", "l-theanine"]); },
    storyArt: function (ctx) { return art(ctx, ctx.catalog.map(function (p) { return p.id; })); },
    aboutArt: function (ctx) { return art(ctx, ctx.catalog.map(function (p) { return p.id; })); },
  });

  /* Behaviour: the open chip tints the stripe under the header. */
  E.onEnhance("e", function (main) {
    var deck = main.querySelector(".e-deck");
    if (deck) deck.addEventListener("eh:pick", function (e) {
      var chip = e.detail.button && e.detail.button.closest(".e-chip");
      [].slice.call(deck.querySelectorAll(".e-chip")).forEach(function (c) { c.classList.toggle("is-open", c === chip); });
    });
    if (deck) { var on = deck.querySelector('[aria-expanded="true"]'); if (on) on.closest(".e-chip").classList.add("is-open"); }
  });
})();
