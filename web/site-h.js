/* Body Café Co. — Direction H · Folio. Minimal, black and white.
   Idea: a well-set reference book. White page, black type, one wide margin column that carries running heads,
   sidenotes and small museum-style captions. The bottles appear small and in their real colour, like plates in a
   catalogue raisonné. Where G is cinematic and dark, H is quiet, typographic and light.
   Signature: the margin. Disclosures are sidenotes (¹ sample prices, ² draft packaging, ³ demo reports). */
(function () {
  "use strict";
  var S = window.BCCSite, E = window.BCCEH, h = E.h;
  var MENU = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16M4 6h16M4 18h10"/></svg>';
  var ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  var NOTES = {
    1: "Prices throughout are samples. Final prices, GST and offers are still being approved.",
    2: "Packaging shown is a draft. Amounts, directions and cautions come from the approved rear label.",
    3: "Lot reports in the preview are demonstration records. No laboratory document is connected.",
  };
  function sup(n) { return '<sup class="h-sup"><a href="#h-note-' + n + '" aria-label="Note ' + n + '">' + n + "</a></sup>"; }
  function note(n) { return '<p class="h-note" id="h-note-' + n + '"><span>' + n + "</span>" + NOTES[n] + "</p>"; }
  function roman(ctx, p) { return ROMAN[ctx.catalog.indexOf(p)] || h.no(ctx, p); }

  var kit = {
    head: function (o) {
      return '<header class="h-row h-head"><div class="h-margin">' + (o.kicker ? '<p class="x-kicker">' + o.kicker + "</p>" : "") + (o.crumbs ? this.crumbs(o.crumbs) : "") + '</div><div class="h-main"><h1>' + o.title + "</h1>" + (o.lede ? '<p class="x-lede">' + o.lede + "</p>" : "") + (o.aside ? '<div class="x-head-aside">' + o.aside + "</div>" : "") + "</div></header>";
    },
    sec: function (o) {
      var id = o.id || "s" + Math.abs(String(o.title).split("").reduce(function (a, c) { return (a * 31 + c.charCodeAt(0)) | 0; }, 7));
      return '<section class="h-row h-sec ' + (o.cls || "") + '" id="' + id + '" aria-labelledby="' + id + '-t"><div class="h-margin">' + (o.kicker ? '<p class="x-kicker">' + o.kicker + "</p>" : "") + (o.aside ? '<div class="h-aside">' + o.aside + "</div>" : "") + '</div><div class="h-main"><h2 id="' + id + '-t">' + o.title + "</h2>" + o.body + "</div></section>";
    },
    row: function (ctx, p, href, end, sub) {
      return '<li class="x-row h-xrow"><a href="' + href + '"><span class="x-row-media">' + h.front(ctx, p, { alt: "" }) + '</span><span class="x-row-main"><strong>' + ctx.escape(p.name) + "</strong><small>" + (sub || ctx.escape(ctx.format[p.id])) + '</small></span><span class="x-row-end">' + end + "</span></a></li>";
    },
  };
  var K = Object.assign({}, h.KIT, kit);

  function chrome(ctx, content) {
    var path = ctx.path;
    var cur = function (href) { return path === href || path.indexOf(href + "/") === 0 ? ' aria-current="page"' : ""; };
    var nav = [["/shop", "Shop"], ["/standards", "Standards"], ["/about", "About"], ["/learn", "Learn"], ["/story", "Story"]];
    return '<div class="eh eh-h">' +
      '<header class="h-header"><a class="h-logo" href="/" aria-label="Body Café Co. home"><img src="/web/media/brand-original.svg" alt="" width="456" height="443"></a>' +
      '<nav class="h-nav" aria-label="Main">' + nav.map(function (n) { return '<a href="' + n[0] + '"' + cur(n[0]) + ">" + n[1] + "</a>"; }).join("") + "</nav>" +
      '<div class="h-tools"><button class="h-icon" data-action="search" aria-label="Search">' + ctx.icon("search") + '</button><a class="h-lotbtn" href="/reports"' + cur("/reports") + '>Lot report</a><a class="h-icon" href="/account" aria-label="Your account"' + cur("/account") + ">" + ctx.icon("user") + '</a><a class="h-icon bag-link" href="/cart" aria-label="Bag, ' + ctx.count + ' items">' + ctx.icon("bag") + '<span class="h-count" data-cart-count' + (ctx.count ? "" : " data-empty") + ">" + ctx.count + '</span></a><button class="h-icon h-menu menu-button" data-action="menu" aria-expanded="false" aria-controls="mobile-nav">' + MENU + '<span class="sr-only">Menu</span></button></div></header>' +
      '<nav id="mobile-nav" class="x-mnav h-mnav" hidden aria-label="Mobile"><p class="x-kicker">Contents</p><ol>' +
      [["/shop", "Shop"]].concat(nav.slice(1)).concat([["/reports", "Lot report"], ["/search", "Search"], ["/help", "Help"]]).map(function (n, i) { return '<li><a href="' + n[0] + '"><span>' + (ROMAN[i] || i + 1) + "</span>" + n[1] + "</a></li>"; }).join("") + '</ol><p class="h-mnav-foot"><a href="/account">Account</a><a href="/cart">Bag (<span data-cart-count>' + ctx.count + "</span>)</a></p></nav>" +
      '<main id="main" tabindex="-1">' + content + "</main>" +
      '<footer class="h-footer"><div class="h-row"><div class="h-margin"><img class="h-foot-logo" src="/web/media/brand-original.svg" alt="Body Café Co." width="456" height="443"></div><div class="h-main h-foot-cols">' +
      '<div><h2>The collection</h2><ol>' + ctx.published.map(function (p) { return '<li><a href="/products/' + p.id + '"><span>' + roman(ctx, p) + "</span>" + ctx.escape(p.name) + "</a></li>"; }).join("") + '</ol></div><div><h2>Reading</h2><ol><li><a href="/about">About</a></li><li><a href="/story">Story</a></li><li><a href="/standards">Standards</a></li><li><a href="/learn">Learn</a></li><li><a href="/reports">Lot reports</a></li></ol></div>' + S.careGroups().map(function (g) { return '<div><h2>' + g.group + '</h2><ol>' + g.items.map(function (x) { return '<li><a href="' + x[1] + '">' + x[0] + '</a></li>'; }).join('') + '</ol></div>'; }).join('') + "</div></div>" +
      '<div class="h-row h-foot-legal"><div class="h-margin"><span>© ' + new Date().getFullYear() + ' Body Café Co.</span></div><div class="h-main"><span>Preview store. Prices are samples, packaging is a draft and lot reports are demonstration records.</span><a href="/preview/states">Design states</a></div></div></footer></div>';
  }

  /* ---------- Home ---------- */
  function home(ctx) {
    var list = ctx.published, H = h.HOME;
    if (!list.length) return K.head({ title: "The catalogue is resting" });
    var first = list[0];
    return (
      /* 1 · Hero */
      '<section class="h-row h-hero" data-home-section="hero" aria-labelledby="h-hero-t"><div class="h-margin"><p class="x-kicker">Folio · Body Café Co.</p><p class="h-runhead">A catalogue of seven everyday supplements, with notes.</p>' + note(1) + note(2) + '</div><div class="h-main"><h1 id="h-hero-t">Seven supplements, each with its notes in the margin.</h1><p class="x-lede">' + H.hero + sup(2) + '</p><div class="h-actions"><a class="x-btn" href="/shop"><span>Shop the collection</span></a><a class="x-link" href="/reports">Find a lot report</a></div>' +
      '<figure class="h-plate"><ol>' + list.map(function (p) { return '<li><a href="/products/' + p.id + '">' + h.front(ctx, p, { alt: ctx.escape(p.name) + ", draft packaging", eager: true }) + "<span>" + roman(ctx, p) + "</span></a></li>"; }).join("") + "</ol><figcaption><em>Plate I.</em> The collection, left to right, numbered as in the index below. Draft packaging." + sup(2) + "</figcaption></figure></div></section>" +

      /* 2 · Meet the collection: the index */
      '<section class="h-row h-index" data-home-section="collection" aria-labelledby="h-idx-t"><div class="h-margin"><p class="x-kicker">Index</p><figure class="h-pv" aria-hidden="true">' + h.front(ctx, first, { alt: "" }) + "<figcaption><span>" + roman(ctx, first) + "</span> " + ctx.escape(first.name) + "</figcaption></figure></div>" +
      '<div class="h-main"><h2 id="h-idx-t">Meet the collection</h2><ol class="h-idx">' + list.map(function (p) {
        return '<li><a href="/products/' + p.id + '" data-h-pv="' + p.id + '" data-h-name="' + ctx.escape(p.name) + '" data-h-no="' + roman(ctx, p) + '" data-h-w="' + ((ctx.bottleWidth && ctx.bottleWidth[p.id]) || 720) + '"><span class="h-idx-no">' + roman(ctx, p) + '</span><span class="h-idx-name">' + ctx.escape(p.name) + '<em>' + ctx.escape(p.subtitle) + '</em></span><span class="h-idx-dots" aria-hidden="true"></span><span class="h-idx-end">' + ctx.escape(ctx.format[p.id]) + " · " + ctx.money(p.price) + '<span class="sr-only">, sample price</span></span></a>' + h.addBtn(ctx, p, "h-add", "Add") + "</li>";
      }).join("") + '</ol><p class="x-small">All prices are samples.' + sup(1) + "</p></div></section>" +

      /* 3 · Generate curiosity: seven questions */
      '<section class="h-row h-ask" data-home-section="curiosity" aria-labelledby="h-ask-t"><div class="h-margin"><p class="x-kicker">Queries</p><p class="h-aside-t">' + H.curiosity + '</p></div><div class="h-main"><h2 id="h-ask-t">Seven questions to bring to a label</h2><div class="h-qs">' +
      list.map(function (p, i) { var a = h.ask(p); return '<details class="h-q"' + (i === 0 ? " open" : "") + '><summary><span class="h-q-no">' + roman(ctx, p) + '</span><span class="h-q-t">' + a.q + "<small>" + ctx.escape(p.name) + '</small></span><span class="h-q-mark" aria-hidden="true"></span></summary><div class="h-q-body"><figure>' + h.front(ctx, p, { alt: "" }) + "<figcaption>" + ctx.escape(p.name) + ". Draft packaging.</figcaption></figure><div><p><strong>" + a.d + "</strong></p><p>" + a.lead + '</p><p class="h-links"><a class="x-link" href="/learn/' + p.id + '">Ingredient note</a><a class="x-link" href="/products/' + p.id + '">Product page</a></p></div></div></details>'; }).join("") + "</div></div></section>" +

      /* 4 · Trust and transparency: the ledger */
      '<section class="h-row h-ledger" data-home-section="trust" aria-labelledby="h-tr-t"><div class="h-margin"><p class="x-kicker">Ledger</p><p class="h-aside-t">What is documented, what is planned and what we won’t do — kept in separate columns so they can’t blur together.</p><a class="x-link" href="/standards">The standards in full</a></div><div class="h-main"><h2 id="h-tr-t">Trust, accounted for</h2><p class="x-lede">' + H.trust + '</p><div class="h-ledger-cols">' +
      [["Documented now", S.copy.standards.documented], ["Planned before launch", S.copy.standards.planned], ["What we won't do", S.copy.standards.wont]].map(function (c) { return '<div><h3>' + c[0] + ' <span>' + c[1].length + "</span></h3><ol>" + c[1].map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol></div>"; }).join("") + "</div></div></section>" +

      /* 5 · Lot report: form + ruled specimen record */
      '<section class="h-row h-lot" data-home-section="lot" aria-labelledby="h-lot-t"><div class="h-margin"><p class="x-kicker">Lot report</p>' + note(3) + '</div><div class="h-main"><h2 id="h-lot-t">Look up the record for a lot' + sup(3) + "</h2><p class=\"x-lede\">" + S.copy.reports.what + '</p><div class="h-lot-grid"><div>' + h.homeLotForm(ctx, "x-lotform h-lotform", "x-btn") + h.numbered(S.copy.reports.steps, "x-steps h-steps") + '</div><figure class="h-specimen"><figcaption><em>Specimen.</em> The fields a record shows, left blank until you look one up.</figcaption><dl>' +
      [["Product", ""], ["Lot number", ""], ["Report status", ""], ["Sample tested", ""], ["Method", ""], ["Limits", ""], ["Result", ""]].map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>&nbsp;</dd></div>"; }).join("") + "</dl></figure></div></div></section>" +

      /* 6 · Customer voices */
      '<section class="h-row h-voices" data-home-section="voices" aria-labelledby="h-vo-t"><div class="h-margin"><p class="x-kicker" id="h-vo-t">Customer voices</p></div><div class="h-main"><p class="h-count-big"><span>Customer reviews published</span><strong>0</strong></p><p class="x-lede">' + H.voices + " " + H.voicesBody + '</p><p class="x-small">' + H.voicesSmall + "</p></div></section>" +

      /* 7 · Before you order */
      '<section class="h-row h-faq" data-home-section="faq" aria-labelledby="h-faq-t"><div class="h-margin"><p class="x-kicker">Before you order</p><a class="x-link" href="/help">Visit the help centre</a></div><div class="h-main"><h2 id="h-faq-t">Good questions welcome here.</h2><ol class="h-faqs">' + H.faq.map(function (f, i) { return '<li><details class="x-faq"><summary><span><span class="h-faq-no">' + (i + 1) + ".</span> " + f[0] + '</span><span class="x-faq-mark" aria-hidden="true">+</span></summary><p>' + f[1] + "</p></details></li>"; }).join("") + "</ol></div></section>"
    );
  }

  /* ---------- Shop: catalogue entries ---------- */
  function shop(ctx) {
    var st = h.shopList(ctx), c = S.copy.shop;
    return '<div class="h-page h-shop">' + K.head({ kicker: "Catalogue · " + ctx.published.length + " entries", title: "The collection", lede: c.lede }) +
      '<div class="h-row h-shopbar"><div class="h-margin"><p class="x-kicker">Refine</p></div><div class="h-main x-shopbar">' + h.filterNav(ctx, st, "x-filter h-filter") + h.sortForm(ctx, st) + "</div></div>" +
      (st.list.length && st.known
        ? '<ol class="h-entries">' + st.list.map(function (p) {
            return '<li class="h-row h-entry"><div class="h-margin"><a href="/products/' + p.id + '" tabindex="-1" aria-hidden="true" class="h-entry-img">' + h.front(ctx, p, { alt: "" }) + '</a></div><div class="h-main"><p class="h-entry-text"><span class="h-entry-no">' + roman(ctx, p) + '.</span> <a class="h-entry-name" href="/products/' + p.id + '">' + ctx.escape(p.name) + "</a>. " + ctx.escape(ctx.format[p.id]) + ". <em>" + ctx.escape(p.subtitle) + "</em> In view: " + ctx.escape(h.inView(p)) + ". " + ctx.money(p.price) + ", sample price." + sup(1) + '</p><p class="h-entry-act">' + h.addBtn(ctx, p, "h-add", "Add to bag") + '<a class="x-link" href="/products/' + p.id + '">Read the entry</a></p></div></li>';
          }).join("") + "</ol>"
        : '<div class="h-row"><div class="h-margin"></div><div class="h-main">' + K.empty(ctx, { title: c.noMatch[0], text: c.noMatch[1], cta: "Show all seven" }) + "</div></div>") +
      K.sec({ id: "guide", kicker: "Reader’s guide", title: c.guidanceTitle, body: h.numbered(c.guidance) + '<p class="x-small">' + c.care + "</p>", aside: note(1) }) + "</div>";
  }

  /* ---------- Product page: a ruled entry ---------- */
  function product(ctx, p) {
    var m = h.pdp(ctx, p);
    return '<article class="h-page h-pdp"><div class="h-row h-pdp-head"><div class="h-margin">' + K.crumbs([["/", "Home"], ["/shop", "Catalogue"], ["", m.name]]) + '<figure class="h-pdp-fig">' + h.front(ctx, p, { eager: true }) + "<figcaption><em>Entry " + roman(ctx, p) + ".</em> " + m.name + ". " + m.format + ". Draft packaging." + sup(2) + "</figcaption></figure>" + note(1) + note(2) + "</div>" +
      '<div class="h-main"><p class="x-kicker">Entry ' + roman(ctx, p) + " of " + ROMAN[ctx.catalog.length - 1] + "</p><h1>" + m.name + '</h1><p class="x-lede">' + m.sub + "</p>" +
      '<dl class="h-spec"><div><dt>Format</dt><dd>' + m.format + "</dd></div><div><dt>In view</dt><dd>" + m.inView + (m.note ? ". " + m.note : "") + "</dd></div><div><dt>Price</dt><dd>" + m.price + ", sample price" + sup(1) + "</dd></div><div><dt>Purchase</dt><dd>One-time purchase. No payment is taken in the preview.</dd></div><div><dt>Availability</dt><dd" + (m.off ? ' class="is-off"' : "") + ">" + m.stockLine + "</dd></div></dl>" +
      '<div class="h-buy" data-pd-buy>' + h.qtySelect(m, "x-qty h-qty") + h.addMain(m, "x-btn h-buy-add") + "</div>" +
      '<figure class="h-pdp-views"><div>' + h.render(ctx, p, "tq", { alt: "" }) + "</div><div>" + h.render(ctx, p, "cap", { alt: "" }) + "</div><figcaption><em>Figs. 1–2.</em> Three-quarter view and cap, from studio renders of the draft pack.</figcaption></figure></div></div>" +
      K.sec({ id: "h-facts", kicker: "§ 1", title: "The facts, so far", body: h.dl(m.facts.filter(function (f) { return f[0] !== "Ingredient in view"; })) + '<h3 class="x-subhead">What the approved label will add</h3>' + h.dash(m.confirm), aside: "<p>Rows in italic are waiting on the approved rear label.</p>" }) +
      K.sec({ id: "h-care", kicker: "§ 2", title: "Use and care", body: '<div class="x-faqs">' + m.care.map(function (c) { return '<details class="x-faq"><summary><span>' + c[0] + '</span><span class="x-faq-mark" aria-hidden="true">+</span></summary><p><em>' + h.PENDING + ".</em> " + c[1] + "</p></details>"; }).join("") + '<details class="x-faq"><summary><span>Delivery and returns</span><span class="x-faq-mark" aria-hidden="true">+</span></summary><p>Sample delivery is ₹75, waived on sample orders of ₹1,499 or more. Final return eligibility, timing and remedies are still being approved.</p>' + h.pincodeForm() + "</details></div>" }) +
      K.sec({ id: "h-pdp-lot", kicker: "§ 3", title: "The record for your lot", body: '<p class="x-lede">' + S.copy.reports.what + "</p>" + h.pdpLotForm(m), aside: note(3) }) +
      K.sec({ id: "h-faqs", kicker: "§ 4", title: "Questions, answered plainly", body: '<div class="x-faqs">' + h.faqs(m.faqs) + "</div>" }) +
      (m.next ? '<nav class="h-row h-nextentry" aria-label="Next entry"><div class="h-margin"><p class="x-kicker">Next entry</p></div><div class="h-main"><a href="/products/' + m.next.id + '"><span>' + roman(ctx, m.next) + ".</span> " + ctx.escape(m.next.name) + " <em>" + ctx.escape(m.next.subtitle) + "</em> →</a></div></nav>" : "") + "</article>";
  }

  /* ---------- Lot reports ---------- */
  function reports(ctx) {
    var c = S.copy.reports, pid = ctx.product(ctx.query.get("product")) ? ctx.query.get("product") : "vitamin-d3-k2";
    var picker = '<div class="report-product-picker h-pick" role="group" aria-label="Choose your product">' + ctx.catalog.map(function (p) { return '<button type="button" class="' + (p.id === pid ? "selected" : "") + '" data-report-product="' + p.id + '" aria-pressed="' + (p.id === pid) + '"><span>' + roman(ctx, p) + "</span>" + ctx.escape(p.name) + "</button>"; }).join("") + "</div>";
    return '<div class="h-page h-reports report-page">' + K.head({ kicker: "Lot reports", title: "Find the record for your lot", lede: c.lede }) +
      '<section class="h-row h-rep" aria-labelledby="h-rep-t"><div class="h-margin"><p class="x-kicker">1 · Product</p>' + picker + '</div><div class="h-main"><h2 id="h-rep-t">2 · The lot number</h2>' + ctx.forms.reportForm(pid, ctx.query.get("lot")) + '<p class="x-small">' + c.demo + "</p></div></section>" +
      K.sec({ id: "how", kicker: "Method", title: "Three steps", body: h.numbered(c.steps) + '<p class="x-small">' + c.locationStatus + "</p>" }) +
      K.sec({ id: "anatomy", kicker: "Anatomy", title: "What a record should show", body: h.dl(c.hierarchy, "x-dl is-numbered"), aside: '<p class="x-aside-k">Its limits</p>' + h.dash(c.limits) }) +
      '<nav class="h-row x-next" aria-label="Keep reading"><div class="h-margin"></div><div class="h-main h-nextlinks"><a class="x-link" href="/learn/understanding-reports">What a lot report shows</a><a class="x-link" href="/standards#lot">How packs link to lots</a><a class="x-link" href="/contact">Ask about a lot</a></div></nav></div>';
  }

  function plate(ctx, ids, cap) { return '<figure class="h-artplate"><div>' + ids.map(function (id) { var p = ctx.product(id); return p ? h.front(ctx, p, { alt: "" }) : ""; }).join("") + "</div><figcaption>" + cap + "</figcaption></figure>"; }

  S.themes.h = E.make({
    key: "h", kit: kit, chrome: chrome, home: home, shop: shop, product: product, reports: reports,
    standardsArt: function (ctx) { return plate(ctx, ["omega-3-fish-oil"], "<em>Plate.</em> Omega-3 Fish Oil, draft packaging. The front is a summary; the detail is on the rear label."); },
    storyArt: function (ctx) { return plate(ctx, ctx.catalog.map(function (p) { return p.id; }), "<em>Plate.</em> The seven, draft packaging."); },
    aboutArt: function (ctx) { return plate(ctx, ["l-theanine", "psyllium-husk"], "<em>Plate.</em> Two of seven, draft packaging."); },
  });

  /* Index: hovering or focusing an entry shows its bottle in the margin (decorative; the entry text carries the name). */
  E.onEnhance("h", function (main) {
    var pv = main.querySelector(".h-pv");
    if (!pv) return;
    var img = pv.querySelector("img"), cap = pv.querySelector("figcaption");
    [].slice.call(main.querySelectorAll("[data-h-pv]")).forEach(function (a) {
      function show() {
        img.src = "/web/media/" + a.getAttribute("data-h-pv") + ".webp";
        img.setAttribute("width", a.getAttribute("data-h-w"));
        cap.innerHTML = "<span>" + a.getAttribute("data-h-no") + "</span> " + a.getAttribute("data-h-name");
        pv.classList.remove("is-swap"); void pv.offsetWidth; pv.classList.add("is-swap");
      }
      a.addEventListener("pointerenter", show);
      a.addEventListener("focus", show);
    });
  });
})();
