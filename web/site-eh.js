/* Body Café Co. — shared engine for directions E, F, G and H.

   Every customer route for E–H is composed here from the shared content in web/site.js, through a small "kit" of
   layout primitives that each direction overrides (web/site-e.js … site-h.js). Directions also supply their own
   chrome, homepage, shop, product page and lot-report page, so the signature compositions stay bespoke while the
   long tail (help, policies, account, checkout states…) shares one tested structure.

   Behaviour stays in app.js: every form id, field name and data-* action used here is the one app.js already handles.
   Content rules are unchanged: no invented amounts, claims, reviews, ratings, certifications or results. Sample
   prices, draft packaging and demonstration records are always labelled. Nothing here fetches or saves data. */
(function () {
  "use strict";
  var S = window.BCCSite;
  var REVIEWS = "Reviews appear only after a verified delivery and moderation. We won't fill this space with made-up ones.";
  var MOCKUP = "Front-of-pack design mockup. Wording printed on the pack is draft label artwork, not a claim made on this site.";
  var PENDING = S.STATUS.label;

  /* ---------- Small shared helpers ---------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function no(ctx, p) { return pad(ctx.catalog.indexOf(p) + 1); }
  function esc(ctx, s) { return ctx.escape(s); }
  function inView(p) { return String(p.ingredients || "").split(";")[0]; }
  function front(ctx, p, o) {
    o = o || {};
    return '<img class="' + (o.cls || "x-bottle") + '" src="/web/media/' + p.id + '.webp" alt="' + (o.alt === "" ? "" : ctx.escape(p.name) + " bottle, draft packaging") + '" width="' + ((ctx.bottleWidth && ctx.bottleWidth[p.id]) || 720) + '" height="1000" decoding="async" ' + (o.eager ? 'fetchpriority="high"' : 'loading="lazy"') + ">";
  }
  function render(ctx, p, view, o) {
    o = o || {};
    var file = view === "cap" ? p.id + "-cap" : p.id + "-three-quarter";
    var dims = view === "cap" ? ' width="400" height="400"' : ' width="' + (/iron|theanine|vitamin/.test(p.id) ? 629 : 517) + '" height="1000"';
    return '<img class="' + (o.cls || "x-render") + '" src="/web/media/renders/' + file + '.webp" alt="' + (o.alt === "" ? "" : ctx.escape(p.name) + (view === "cap" ? " cap, seen from above" : " bottle, three-quarter view, draft packaging")) + '"' + dims + ' decoding="async" ' + (o.eager ? 'fetchpriority="high"' : 'loading="lazy"') + ">";
  }
  function dash(list, cls) { return '<ul class="' + (cls || "x-list") + '">' + list.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>"; }
  function numbered(items, cls) {
    return '<ol class="' + (cls || "x-steps") + '">' + items.map(function (it, i) { return '<li><span class="x-step-no" aria-hidden="true">' + pad(i + 1) + '</span><div><h3>' + it[0] + "</h3><p>" + it[1] + "</p></div></li>"; }).join("") + "</ol>";
  }
  function dl(rows, cls) { return '<dl class="' + (cls || "x-dl") + '">' + rows.map(function (r) { return '<div' + (r[2] ? ' class="is-pending"' : "") + "><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; }).join("") + "</dl>"; }
  function faqs(items, iconHtml) {
    return items.map(function (f) { return '<details class="x-faq"><summary><span>' + f[0] + '</span><span class="x-faq-mark" aria-hidden="true">' + (iconHtml || "+") + "</span></summary><p>" + f[1] + "</p></details>"; }).join("");
  }
  function addBtn(ctx, p, cls, label) {
    var off = !p.stock || !p.published;
    return '<button type="button" class="' + (cls || "x-add") + '" data-add="' + p.id + '" aria-label="Add ' + ctx.escape(p.name) + ' to bag"' + (off ? " disabled" : "") + "><span>" + (off ? "Unavailable" : label || "Add to bag") + "</span></button>";
  }
  function formatCounts(ctx) {
    var all = ctx.published;
    return ["all", "Capsules", "Softgels", "Chewable tablets"].map(function (f) {
      return { id: f, label: f === "all" ? "All" : f, n: all.filter(function (p) { return f === "all" || ctx.format[p.id] === f; }).length, href: "/shop" + (f === "all" ? "" : "?format=" + encodeURIComponent(f)) };
    });
  }
  /* Shop state from the URL: format filter + sort. */
  function shopList(ctx) {
    var sel = ctx.query.get("format") || "all";
    var sort = ctx.query.get("sort") || "catalogue";
    var list = ctx.published.filter(function (p) { return sel === "all" || ctx.format[p.id] === sel; });
    if (sort === "price-asc") list = list.slice().sort(function (a, b) { return a.price - b.price; });
    if (sort === "price-desc") list = list.slice().sort(function (a, b) { return b.price - a.price; });
    if (sort === "name") list = list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
    return { sel: sel, sort: sort, list: list, known: sel === "all" || ["Capsules", "Softgels", "Chewable tablets"].indexOf(sel) >= 0 };
  }
  /* Native, keyboard-friendly sort control. It submits as a GET form; app.js routes it as a normal navigation. */
  function sortForm(ctx, st, cls) {
    var opts = [["catalogue", "Catalogue order"], ["price-asc", "Price, low to high"], ["price-desc", "Price, high to low"], ["name", "Name, A to Z"]];
    return '<form class="' + (cls || "x-sort") + '" action="/shop" method="get" data-eh-sort>' + (st.sel !== "all" ? '<input type="hidden" name="format" value="' + ctx.escape(st.sel) + '">' : "") +
      '<label for="eh-sort">Sort</label><select id="eh-sort" name="sort">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === st.sort ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + '</select><noscript><button type="submit">Apply</button></noscript></form>';
  }
  function filterNav(ctx, st, cls) {
    return '<nav class="' + (cls || "x-filter") + '" aria-label="Filter by format">' + formatCounts(ctx).map(function (f) {
      return '<a href="' + f.href + (st.sort !== "catalogue" ? (f.id === "all" ? "?" : "&") + "sort=" + st.sort : "") + '"' + (f.id === st.sel ? ' aria-current="page"' : "") + '><span>' + f.label + '</span> <span class="x-count">' + f.n + "</span></a>";
    }).join("") + "</nav>";
  }

  /* ---------- Homepage content (shared facts for the seven sections) ---------- */
  var HOME = {
    hero: "The ingredient in view, what the approved label will add, and the record for a particular lot.",
    curiosity: "Every product has one detail worth checking first. Pick a bottle and see what to look for on its label.",
    trust: S.copy.standards.lede,
    voices: "There are no published customer reviews yet.",
    voicesBody: REVIEWS,
    voicesSmall: "Until then there are no sample quotes, star ratings or testimonials on this site.",
    faq: [
      ["Where are the full product details?", "Each product page separates what's confirmed now from the amounts, directions, cautions and allergens that will come from the approved rear label."],
      ["Are these the final prices?", "No. Every price in the preview is a sample. Final prices, GST, shipping rules and offers are still being approved."],
      ["When will my order arrive?", "Delivery dates depend on courier setup that isn't connected yet, so the preview doesn't promise a date. The pincode check confirms the format only."],
      ["How do returns work?", "Return eligibility, timing and remedies are still being approved. The working policy explains what's undecided; the preview doesn't promise a return window."],
      ["Where do I find my lot report?", "Choose your product on the lot reports page and enter the lot number printed on the pack. The preview has sample records so you can try it."],
      ["How can I ask a question?", "Open a support case from Contact. Every case gets an ID and stays in your account. Product safety issues get their own priority case."],
    ],
  };
  /* The first thing to check on each label, from the ingredient notes. */
  function ask(p) { var n = S.notes[p.id]; return n ? { q: n.check[0][0], d: n.check[0][1], lead: n.lead } : { q: p.name, d: "", lead: "" }; }

  function homeLotForm(ctx, cls, btnCls) {
    return '<form id="home-lot" class="' + (cls || "x-lotform") + '"><div class="x-field"><label for="home-lot-product">Product</label><select id="home-lot-product" name="product">' +
      ctx.catalog.map(function (p, i) { return '<option value="' + p.id + '" data-sample="DEMO-' + pad(i + 1) + '-01">' + ctx.escape(p.name) + "</option>"; }).join("") +
      '</select></div><div class="x-field"><label for="home-lot-number">Lot number</label><input id="home-lot-number" name="lot" placeholder="DEMO-01-01" maxlength="60" required autocomplete="off"></div><button class="' + (btnCls || "x-btn") + '" type="submit"><span>Look up</span></button>' +
      '<p class="x-micro">Demonstration only. Try <button type="button" class="x-linkbtn" data-fill-lot>the sample lot</button> for the product you picked. No laboratory document is connected.</p></form>';
  }

  /* ---------- Product page model (shared by the four product pages) ---------- */
  var TO_CONFIRM_ALWAYS = "Complete ingredient list, allergens, storage and manufacturer details";
  function pdp(ctx, p) {
    var idx = ctx.catalog.indexOf(p);
    var raw = String(p.ingredients || "");
    var main = raw.split(";")[0];
    var note = raw.split(";").slice(1).join(";").trim();
    var off = !p.published ? "unpublished" : !(p.stock > 0) ? "stock" : "";
    var max = off ? 1 : Math.max(1, Math.min(5, p.stock));
    var published = ctx.catalog.filter(function (x) { return x.published && x.id !== p.id; });
    var after = published.filter(function (x) { return ctx.catalog.indexOf(x) > idx; });
    var related = after.concat(published.filter(function (x) { return ctx.catalog.indexOf(x) < idx; }));
    var confirm = ((window.BCCProductPage && window.BCCProductPage.toConfirm && window.BCCProductPage.toConfirm[p.id]) || []).concat([TO_CONFIRM_ALWAYS]);
    var m = {
      p: p, id: p.id, name: ctx.escape(p.name), sub: ctx.escape(p.subtitle), no: pad(idx + 1), total: pad(ctx.catalog.length),
      format: ctx.escape(ctx.format[p.id] || ""), inView: ctx.escape(main), note: note ? ctx.escape(note.charAt(0).toUpperCase() + note.slice(1)) + "." : "",
      price: ctx.money(p.price), off: off, max: max, stock: p.stock, sample: "DEMO-" + pad(idx + 1) + "-01", confirm: confirm, related: related, next: related[0] || null,
      notes: S.notes[p.id] || { lead: "", check: [], compound: "", sources: [] },
    };
    m.stockLine = off === "unpublished" ? "Not available. This product isn't published right now." : off === "stock" ? "Out of preview stock" : p.stock <= 5 ? "Only " + p.stock + " left in preview stock" : "In preview stock";
    m.facts = [["Format", m.format], ["Ingredient in view", m.inView], ["Purchase", "One-time purchase"], ["Serving size", PENDING, true], ["Amount per serving", PENDING, true], ["Pack contents", PENDING, true]];
    m.care = [["Directions", "Directions are waiting on approved label data. The preview doesn't suggest a dose."], ["Storage", "Storage conditions will be added from the approved label."], ["Allergens", "Allergen information will be added from the approved label."], ["Cautions and warnings", "Cautions and warnings will be added from reviewed material. Nothing here is a diagnosis or personal health advice."]];
    m.faqs = [
      ["How much is in each serving?", "Amounts per serving come from the approved rear label, which hasn't been supplied yet. The preview doesn't suggest a dose."],
      ["Where's the lot number on my pack?", S.copy.reports.locationStatus + " Your lot number is different from your order number or barcode."],
      ["Are these the final prices?", "No. Every price in the preview is a sample. Final prices, shipping rules and offers are still being approved."],
      ["How do returns work?", "Final return eligibility, timing and remedies are still being approved. See the working returns policy; this preview does not promise a return window."],
      ["Who do I contact about a product issue?", "Open a support case and choose Product safety. It's flagged as a priority and you get a case ID to follow."],
    ];
    return m;
  }
  function qtySelect(m, cls) {
    var o = "";
    for (var i = 1; i <= m.max; i++) o += '<option value="' + i + '">' + i + "</option>";
    return '<div class="' + (cls || "x-qty") + '"><label for="product-quantity">Quantity</label><select id="product-quantity"' + (m.off ? " disabled" : "") + ">" + o + "</select></div>";
  }
  function addMain(m, cls, label) {
    return '<button type="button" class="' + (cls || "x-btn x-btn-main") + '" data-action="add-product" data-id="' + m.id + '"' + (m.off ? " disabled" : "") + "><span>" + (m.off ? "Unavailable" : label || "Add to bag") + "</span></button>";
  }
  function pincodeForm(cls) {
    return '<form id="pincode-form" class="' + (cls || "x-inline-form") + '" novalidate><label for="pincode">Check delivery to your pincode</label><div class="x-inline"><input id="pincode" name="pincode" inputmode="numeric" autocomplete="postal-code" pattern="[1-9][0-9]{5}" maxlength="6" placeholder="6-digit pincode" required aria-describedby="pincode-result"><button type="submit">Check</button></div><p id="pincode-result" class="x-micro" role="status"></p></form>';
  }
  function pdpLotForm(m, cls) {
    return '<form id="pdp-lot" class="' + (cls || "x-inline-form") + '"><input type="hidden" name="product" value="' + m.id + '"><label for="pdp-lot-number">Lot number on your pack</label><div class="x-inline"><input id="pdp-lot-number" name="lot" maxlength="60" required autocomplete="off" placeholder="e.g. ' + m.sample + '"><button type="submit">Look up</button></div><p class="x-micro">Demonstration only. Try <button type="button" class="x-linkbtn" data-fill-pdp-lot="' + m.sample + '">the sample lot ' + m.sample + '</button>, or open <a href="/reports?product=' + m.id + '">all lot reports</a>.</p></form>';
  }

  /* ---------- Default kit (each direction overrides what it needs) ---------- */
  var KIT = {
    btn: function (href, label, kind) { return '<a class="x-btn' + (kind ? " x-btn-" + kind : "") + '" href="' + href + '"><span>' + label + "</span></a>"; },
    link: function (href, label) { return '<a class="x-link" href="' + href + '">' + label + "</a>"; },
    kicker: function (t) { return '<p class="x-kicker">' + t + "</p>"; },
    head: function (o) {
      return '<header class="x-head">' + (o.crumbs ? this.crumbs(o.crumbs) : "") + (o.kicker ? this.kicker(o.kicker) : "") + "<h1>" + o.title + "</h1>" + (o.lede ? '<p class="x-lede">' + o.lede + "</p>" : "") + (o.aside ? '<div class="x-head-aside">' + o.aside + "</div>" : "") + "</header>";
    },
    sec: function (o) {
      var id = o.id || "s" + Math.abs(String(o.title).split("").reduce(function (a, c) { return (a * 31 + c.charCodeAt(0)) | 0; }, 7));
      return '<section class="x-sec ' + (o.cls || "") + '" id="' + id + '" aria-labelledby="' + id + '-t"><div class="x-sec-head">' + (o.kicker ? this.kicker(o.kicker) : "") + '<h2 id="' + id + '-t">' + o.title + "</h2></div>" + '<div class="x-sec-body">' + o.body + "</div>" + (o.aside ? '<aside class="x-sec-aside">' + o.aside + "</aside>" : "") + "</section>";
    },
    crumbs: function (list) { return '<nav class="x-crumbs" aria-label="Breadcrumb"><ol>' + list.map(function (c, i) { return "<li>" + (i < list.length - 1 ? '<a href="' + c[0] + '">' + c[1] + "</a>" : '<span aria-current="page">' + c[1] + "</span>") + "</li>"; }).join("") + "</ol></nav>"; },
    sample: function (t) { return '<p class="x-sample" role="note"><strong>Sample state.</strong> ' + t + "</p>"; },
    note: function (t) { return '<p class="x-note">' + t + "</p>"; },
    next: function (links) { return '<nav class="x-next" aria-label="Keep going">' + links.map(function (l) { return KIT.link(l[0], l[1]); }).join("") + "</nav>"; },
    empty: function (ctx, o) { return '<div class="x-empty"><h' + (o.h || 2) + ">" + o.title + "</h" + (o.h || 2) + "><p>" + o.text + "</p>" + this.btn(o.href || "/shop", o.cta || "Shop all seven") + "</div>"; },
    pic: function (ctx, p, o) { return front(ctx, p, o); },
    row: function (ctx, p, href, end, sub) {
      return '<li class="x-row" style="' + ctx.capStyle(p) + '"><a href="' + href + '"><span class="x-row-media">' + this.pic(ctx, p, { alt: "" }) + '</span><span class="x-row-main"><strong>' + ctx.escape(p.name) + "</strong><small>" + (sub || ctx.escape(ctx.format[p.id])) + '</small></span><span class="x-row-end">' + end + "</span></a></li>";
    },
  };

  /* ---------- Routes ---------- */
  function make(V) {
    var K = Object.assign({}, KIT, V.kit || {});
    var W = function (cls, html) { return '<div class="x-page ' + (cls || "") + '">' + html + "</div>"; };

    function notFound(ctx) {
      var c = S.copy.notFound;
      return W("x-404", K.head({ kicker: "404", title: c[0], lede: c[1] }) + K.next([["/shop", "Shop all seven"], ["/learn", "Learn"], ["/help", "Help centre"], ["/", "Home"]]));
    }

    function about(ctx) {
      var c = S.copy.about;
      return W("x-about", K.head({ kicker: "About", title: c.title, lede: c.lede }) +
        (V.aboutArt ? V.aboutArt(ctx) : "") +
        c.blocks.map(function (b, i) { return K.sec({ id: "about-" + i, kicker: pad(i + 1), title: b[0], body: '<p class="x-body">' + b[1] + "</p>" }); }).join("") +
        K.sec({ id: "about-next", kicker: "Keep reading", title: "Where to go next", body: K.next(c.next) }));
    }

    function bundles(ctx, id) {
      var c = S.copy.bundles, B = ctx.state.bundles, b = B.find(function (x) { return x.id === id; });
      if (id && !b) return notFound(ctx);
      if (!b) {
        return W("x-bundles", K.head({ kicker: "The edits · examples for browsing", title: "Two labels, one page", lede: c.lede }) + K.note("<strong>Status.</strong> " + c.status) +
          '<ul class="x-cards">' + B.map(function (x) {
            var items = x.items.map(ctx.product).filter(Boolean), sum = items.reduce(function (n, p) { return n + p.price; }, 0);
            return '<li class="x-card"><a href="/bundles/' + x.id + '"><span class="x-card-media is-pair">' + items.map(function (p) { return K.pic(ctx, p, { alt: "" }); }).join("") + '</span><span class="x-card-body"><strong>' + ctx.escape(x.name) + "</strong><small>" + items.map(function (p) { return ctx.escape(p.name); }).join(" and ") + '</small><span class="x-card-price">' + ctx.money(sum) + " sample total, no discount</span></span></a></li>";
          }).join("") + "</ul>" + K.sec({ id: "why", kicker: "Why edits exist", title: "A shortcut, not a regimen", body: numbered(c.why) }));
      }
      var items = b.items.map(ctx.product).filter(Boolean), sum = items.reduce(function (n, p) { return n + p.price; }, 0);
      return W("x-bundle", K.head({ crumbs: [["/", "Home"], ["/bundles", "The edits"], ["", ctx.escape(b.name)]], kicker: "An edit · example pairing", title: ctx.escape(b.name), lede: ctx.escape(b.description) }) +
        '<div class="x-split"><div class="x-split-media is-pair">' + items.map(function (p) { return '<a href="/products/' + p.id + '">' + K.pic(ctx, p) + "</a>"; }).join("") + '</div><div class="x-split-body"><h2>In this edit</h2><ul class="x-lines">' +
        items.map(function (p) { return '<li style="' + ctx.capStyle(p) + '"><span class="x-tick" aria-hidden="true"></span><a href="/products/' + p.id + '">' + ctx.escape(p.name) + "</a><small>" + ctx.escape(ctx.format[p.id]) + "</small><span>" + ctx.money(p.price) + "</span></li>"; }).join("") +
        '<li class="is-total"><span>Sample total, no discount</span><span>' + ctx.money(sum) + '</span></li></ul><button class="x-btn x-btn-main" data-bundle="' + b.id + '"><span>Add both to bag</span></button>' + K.note("<strong>Status.</strong> " + c.status) + "</div></div>");
    }

    function search(ctx) {
      var c = S.copy.search, q = ctx.query.get("q") || "", ql = q.toLowerCase().trim();
      var prods = ctx.catalog.filter(function (p) { return ql && (p.name + " " + p.ingredients + " " + ctx.format[p.id] + " " + p.subtitle).toLowerCase().indexOf(ql) >= 0; });
      var gs = S.guideMatches(q);
      var notesHit = ctx.catalog.filter(function (p) { return ql && S.notes[p.id] && (p.name + " " + S.notes[p.id].lead).toLowerCase().indexOf(ql) >= 0; });
      var report = /report|lot|test|proof|batch/i.test(q);
      var total = prods.length + gs.length + notesHit.length;
      return W("x-search", K.head({ kicker: "Search", title: q ? "Results for “" + ctx.escape(q) + "”" : "What are you looking for?", lede: c.lede }) +
        '<div class="x-searchbox">' + ctx.forms.search(q) + '<p class="x-hints">Try ' + c.hints.map(function (h) { return '<a href="/search?q=' + encodeURIComponent(h) + '">' + h + "</a>"; }).join("") + "</p></div>" +
        (q ? '<p class="x-status" role="status">' + total + " result" + (total === 1 ? "" : "s") + "</p>" : "") +
        (report ? K.note("<strong>Looking for a lot record?</strong> Lot reports have their own lookup. " + K.link("/reports", "Find a lot report")) : "") +
        (prods.length ? '<section class="x-results" aria-labelledby="r-p"><h2 id="r-p">Products <span class="x-count">' + prods.length + '</span></h2><ol class="x-rows">' + prods.map(function (p) { return K.row(ctx, p, "/products/" + p.id, ctx.money(p.price), ctx.escape(inView(p)) + " · " + ctx.escape(ctx.format[p.id])); }).join("") + "</ol></section>" : "") +
        (gs.length || notesHit.length ? '<section class="x-results" aria-labelledby="r-g"><h2 id="r-g">Reading <span class="x-count">' + (gs.length + notesHit.length) + '</span></h2><ol class="x-rows is-text">' + gs.map(function (g) { return '<li class="x-row"><a href="' + g[0] + '"><span class="x-row-main"><strong>' + g[1] + "</strong><small>" + g[2] + '</small></span><span class="x-row-end">Guide</span></a></li>'; }).join("") + notesHit.map(function (p) { return '<li class="x-row"><a href="/learn/' + p.id + '"><span class="x-row-main"><strong>' + ctx.escape(p.name) + "</strong><small>" + S.notes[p.id].lead + '</small></span><span class="x-row-end">Ingredient note</span></a></li>'; }).join("") + "</ol></section>" : "") +
        (q && !total ? K.empty(ctx, { title: "Nothing matched “" + ctx.escape(q) + "”", text: c.noResults, cta: "Browse all seven" }) : "") +
        (!q ? '<section class="x-results" aria-labelledby="r-b"><h2 id="r-b">Browse the collection</h2><ol class="x-rows">' + ctx.published.map(function (p) { return K.row(ctx, p, "/products/" + p.id, ctx.money(p.price)); }).join("") + "</ol></section>" : ""));
    }

    function standards(ctx) {
      var c = S.copy.standards;
      return W("x-standards", K.head({ kicker: "Standards", title: "The detail behind the bottle", lede: c.lede }) + (V.standardsArt ? V.standardsArt(ctx) : "") +
        '<p class="x-intro">' + c.intro + "</p>" +
        '<nav class="x-toc" aria-label="On this page"><ol>' + c.pillars.map(function (p, i) { return '<li><a href="#' + p.id + '"><span>' + pad(i + 1) + "</span>" + p.title + "</a></li>"; }).join("") + '<li><a href="#ledger"><span>06</span>Documented, planned, ruled out</a></li></ol></nav>' +
        c.pillars.map(function (p, i) { return K.sec({ id: p.id, kicker: pad(i + 1) + " · " + p.summary, title: p.title, body: '<p class="x-body">' + p.body + "</p>" + dash(p.points), aside: '<p class="x-aside-k">Where it stands today</p><p>' + p.now + "</p>" }); }).join("") +
        K.sec({ id: "ledger", kicker: "06 · The honest ledger", title: "Documented now, still to come", cls: "x-ledger", body: '<div class="x-cols3"><div><h3>Documented now</h3>' + dash(c.documented) + "</div><div><h3>Planned before launch</h3>" + dash(c.planned) + "</div><div><h3>What we won't do</h3>" + dash(c.wont) + "</div></div>" }) +
        K.next([["/reports", "Try a lot lookup"], ["/learn/understanding-reports", "What a lot report shows"], ["/learn/reading-a-label", "Read a label with confidence"]]));
    }

    function story(ctx) {
      var c = S.copy.story;
      return W("x-story", K.head({ kicker: "Story", title: "Curiosity is a good place to start", lede: c.lede }) + (V.storyArt ? V.storyArt(ctx) : "") +
        '<p class="x-intro">' + c.opening + "</p>" +
        c.chapters.map(function (ch, i) { return K.sec({ id: "chapter-" + (i + 1), kicker: "Chapter " + pad(i + 1), title: ch.title, body: '<p class="x-body">' + ch.body + "</p>" }); }).join("") +
        K.sec({ id: "promises", kicker: "What you can hold us to", title: "Four promises, three refusals", body: numbered(c.promises) + '<h3 class="x-subhead">We won\'t</h3>' + dash(c.wont) }) +
        K.sec({ id: "people", kicker: "The people behind it", title: "In their own words, soon", body: '<p class="x-body">' + c.people + "</p>", aside: '<p class="x-aside-k">Waiting on</p>' + dash(c.peopleNeeds) }) +
        K.next([["/about", "About Body Café Co."], ["/standards", "Our standards"], ["/shop", "Meet the seven"]]));
    }

    function learn(ctx, slug) {
      if (slug && S.guides[slug]) return guide(ctx, slug);
      if (slug && ctx.product(slug)) return note(ctx, ctx.product(slug));
      if (slug) return notFound(ctx);
      var c = S.copy.learn, order = S.guideOrder;
      return W("x-learn", K.head({ kicker: "Learn · the reading room", title: "Read the label, then the lot", lede: c.lede }) +
        '<p class="x-intro">' + c.intro + "</p>" +
        '<ol class="x-guides">' + order.map(function (s, i) { var g = S.guides[s]; return '<li class="x-guide' + (i === 0 ? " is-lead" : "") + '"><a href="/learn/' + s + '"><span class="x-guide-k">Guide ' + pad(i + 1) + " · " + S.minutes(g) + ' min read</span><strong>' + g.title + "</strong><span class=\"x-guide-d\">" + (i === 0 ? g.opening : g.summary) + '</span><span class="x-guide-go">Read the guide</span></a></li>'; }).join("") + "</ol>" +
        K.sec({ id: "notes", kicker: "Ingredient notes · all seven", title: "What to check, product by product", body: '<ol class="x-rows">' + ctx.catalog.map(function (p) { return K.row(ctx, p, "/learn/" + p.id, no(ctx, p), S.noteSummary(p.id)); }).join("") + "</ol>" }) +
        K.sec({ id: "glossary", kicker: "A short glossary", title: "Words worth knowing", body: dl(c.glossary, "x-dl x-gloss") }) +
        K.next([["/help", "Help centre"], ["/contact", "Ask a person"]]));
    }
    function guide(ctx, slug) {
      var g = S.guides[slug], idx = S.guideOrder.indexOf(slug) + 1;
      return '<article class="x-page x-article">' + K.head({ crumbs: [["/", "Home"], ["/learn", "Learn"], ["", g.title]], kicker: "Guide " + pad(idx) + " · " + S.minutes(g) + " min read", title: g.title, lede: g.summary }) +
        '<div class="x-article-grid"><nav class="x-article-toc" aria-label="In this guide"><p class="x-kicker">In this guide</p><ol>' + g.sections.map(function (s) { return '<li><a href="#' + s.id + '">' + s.h + "</a></li>"; }).join("") + '<li><a href="#checklist">Checklist</a></li></ol></nav>' +
        '<div class="x-article-body"><p class="x-opening">' + g.opening + '</p><div class="x-takeaways"><p class="x-kicker">The short version</p>' + dash(g.takeaways) + "</div>" +
        g.sections.map(function (s) { return '<section id="' + s.id + '" class="x-article-sec"><h2>' + s.h + "</h2>" + s.html + "</section>"; }).join("") +
        '<figure class="x-example"><figcaption><span class="x-tag">Illustrative</span><strong>' + g.example.title + "</strong><small>" + g.example.note + "</small></figcaption>" + dl(g.example.rows) + "<p>" + g.example.reading + "</p></figure>" +
        '<section id="checklist" class="x-article-sec"><h2>Checklist</h2><ol class="x-check">' + g.checklist.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol></section>" +
        (g.sources.length ? '<section class="x-article-sec"><h2>Sources</h2>' + S.sourceList(g.sources, "x-sources") + "</section>" : '<p class="x-small">This guide explains how to read reports in general. It describes no specific laboratory, report or result.</p>') +
        '<p class="x-small">Written as general information, not personal advice. No author or reviewer is credited until the guide has been reviewed.</p></div></div>' +
        K.next(g.related.map(function (r) { return ["/learn/" + r, S.guides[r].title]; }).concat([["/reports", "Find a lot report"], ["/shop", "See the collection"]])) + "</article>";
    }
    function note(ctx, p) {
      var n = S.notes[p.id] || { lead: "", check: [], compound: "", sources: [] };
      var confirm = ((window.BCCProductPage && window.BCCProductPage.toConfirm && window.BCCProductPage.toConfirm[p.id]) || []).concat([TO_CONFIRM_ALWAYS]);
      return '<article class="x-page x-notepage" style="' + ctx.capStyle(p) + '">' + K.head({ crumbs: [["/", "Home"], ["/learn", "Learn"], ["", ctx.escape(p.name)]], kicker: "Ingredient note · " + no(ctx, p) + " of " + pad(ctx.catalog.length), title: ctx.escape(p.name), lede: n.lead, aside: '<figure class="x-fig">' + K.pic(ctx, p, { eager: true }) + "<figcaption>" + MOCKUP + "</figcaption></figure>" }) +
        '<p class="x-inview"><span>In view now</span> ' + ctx.escape(p.ingredients) + " · " + ctx.escape(ctx.format[p.id]) + "</p>" +
        K.sec({ id: "check", kicker: "What to check", title: "On this label", body: numbered(n.check), aside: n.compound ? '<p class="x-aside-k">A note on forms</p><p>' + n.compound + "</p>" : "" }) +
        K.sec({ id: "pending", kicker: "Waiting on the approved label", title: "Not confirmed yet", body: '<p class="x-body">These details for our ' + ctx.escape(p.name) + " will be published from the approved rear label. Until then, the product page shows them as awaiting approval.</p>" + dash(confirm) + '<p class="x-small">' + S.CARE_NOTE + "</p>" }) +
        (n.sources.length ? K.sec({ id: "sources", kicker: "Sources", title: "Where these points come from", body: S.sourceList(n.sources, "x-sources") }) : "") +
        K.next([["/products/" + p.id, "View " + ctx.escape(p.name)], ["/reports?product=" + p.id, "Look up a lot"], ["/learn/ingredient-forms", "Why ingredient forms matter"]]) +
        '<nav class="x-chips" aria-label="Other ingredient notes">' + ctx.catalog.filter(function (x) { return x.id !== p.id; }).map(function (o) { return '<a href="/learn/' + o.id + '" style="' + ctx.capStyle(o) + '"><span class="x-tick" aria-hidden="true"></span>' + ctx.escape(o.name) + "</a>"; }).join("") + "</nav></article>";
    }

    /* Default lot-report page; directions may override with their own composition. */
    function reports(ctx) {
      var c = S.copy.reports, pid = ctx.product(ctx.query.get("product")) ? ctx.query.get("product") : "vitamin-d3-k2", cur = ctx.product(pid);
      return '<div class="x-page x-reports report-page" style="' + (cur ? ctx.capStyle(cur) : "") + '">' + K.head({ kicker: "Lot reports", title: "Your lot, your record", lede: c.lede }) +
        '<div class="x-rep-grid"><div class="x-rep-form"><p class="x-kicker">Choose your product</p>' + ctx.forms.productPicker(pid) + ctx.forms.reportForm(pid, ctx.query.get("lot")) + '<p class="x-small">' + c.demo + "</p></div>" +
        '<div class="x-rep-copy"><p class="x-body">' + c.what + "</p>" + numbered(c.steps) + K.note("<strong>Where's my lot number?</strong> " + c.locationStatus) + "</div></div>" +
        K.sec({ id: "anatomy", kicker: "Anatomy of a report", title: "What a record should show", body: dl(c.hierarchy, "x-dl is-numbered"), aside: '<p class="x-aside-k">Its limits</p>' + dash(c.limits) }) +
        K.next([["/learn/understanding-reports", "What a lot report shows"], ["/standards#lot", "How packs link to lots"], ["/contact", "Ask about a lot"]]) + "</div>";
    }

    function cart(ctx) {
      var c = S.copy.cart;
      var items = ctx.state.cart.map(function (i) { return { p: ctx.product(i.id), q: i.quantity }; }).filter(function (x) { return x.p; });
      if (!items.length) {
        return W("x-bag", K.head({ kicker: "Your bag", title: c.empty[0], lede: c.empty[1] }) + '<ol class="x-rows">' + ctx.published.map(function (p) { return K.row(ctx, p, "/products/" + p.id, ctx.money(p.price)); }).join("") + "</ol>" + K.next([["/shop", "See all seven"], ["/bundles", "Browse the edits"]]));
      }
      return W("x-bag", K.head({ kicker: "Your bag · " + ctx.count + " item" + (ctx.count === 1 ? "" : "s"), title: "Your bag", lede: c.note }) +
        '<div class="x-bag-grid"><ol class="x-bag-lines">' + items.map(function (x) {
          var p = x.p;
          return '<li class="x-bag-line" style="' + ctx.capStyle(p) + '"><a class="x-bag-media" href="/products/' + p.id + '" aria-label="' + ctx.escape(p.name) + '">' + K.pic(ctx, p, { alt: "" }) + '</a><div class="x-bag-info"><h2><a href="/products/' + p.id + '">' + ctx.escape(p.name) + "</a></h2><p>" + ctx.escape(ctx.format[p.id]) + " · " + ctx.money(p.price) + ' each, sample price</p><div class="x-stepper quantity-control"><button data-quantity="' + p.id + '" data-change="-1" aria-label="Decrease ' + ctx.escape(p.name) + ' quantity">−</button><span aria-label="Quantity">' + x.q + '</span><button data-quantity="' + p.id + '" data-change="1" aria-label="Increase ' + ctx.escape(p.name) + ' quantity">+</button></div><button class="x-linkbtn remove" data-remove="' + p.id + '">Remove</button></div><strong class="x-bag-total">' + ctx.money(p.price * x.q) + "</strong></li>";
        }).join("") + "</ol>" +
        '<aside class="x-summary"><p class="x-kicker">Order summary</p><div class="sum-row"><span>Sample subtotal</span><strong>' + ctx.money(ctx.total) + '</strong></div><div class="sum-row"><span>Delivery</span><span>Calculated at checkout</span></div><p class="x-small">' + c.note + "</p>" + K.btn("/checkout", "Continue to checkout", "main") + '<p class="x-small">No money is collected.</p></aside></div>' +
        K.next(c.next.concat([["/shop", "Keep shopping"]])));
    }

    function unavailable(ctx, path) {
      var group = path.split("/")[1];
      var map = { checkout: "Checkout", payment: "Payment", orders: "Order", account: "Account", contact: "Contact" };
      var st = (S.states.find(function (s) { return s[0] === map[group]; }) || [0, []])[1];
      return W("x-unavailable", K.head({ kicker: "Shared design preview", title: "This part of the store is switched off here", lede: "You can browse every design, inspect product details and try the sample bag and lot lookup. Ordering, sign-in and support submissions aren't enabled on this shared preview, and nothing you type here is collected." }) +
        (st.length ? K.sec({ id: "states", kicker: "See the designed states instead", title: map[group] + " states", body: '<ol class="x-rows is-text">' + st.map(function (s) { return '<li class="x-row"><a href="' + s[0] + '"><span class="x-row-main"><strong>' + s[1] + '</strong><small>Synthetic fixture · nothing is saved</small></span><span class="x-row-end">View</span></a></li>'; }).join("") + "</ol>" }) : "") +
        K.next([["/shop", "Continue shopping"], ["/preview/states", "All design states"]]));
    }

    function checkout(ctx, fx) {
      var c = S.copy.checkout;
      if (fx === "unavailable" || (!fx && ctx.staticPreview)) return unavailable(ctx, "/checkout");
      var sample = fx === "sample" || fx === "errors";
      var items = sample ? [{ id: "vitamin-d3-k2", quantity: 1 }, { id: "omega-3-fish-oil", quantity: 2 }] : ctx.state.cart;
      if (!items.length) return W("x-checkout", K.head({ kicker: "Checkout", title: "Your bag is empty", lede: "Add a product before checking out." }) + K.next([["/shop", "Shop all seven"]]));
      var err = fx === "errors" ? { name: "Enter the name for the delivery.", mobile: "Enter a 10-digit mobile number starting with 6, 7, 8 or 9.", pincode: "Enter a 6-digit pincode that doesn't start with 0.", adult: "Please confirm the purchaser is 18 or older.", form: "Some details need attention before the order can be created." } : null;
      var vals = fx === "sample" ? S.fixtures.contact : fx === "errors" ? { address: S.fixtures.contact.address, city: "Bengaluru", state: "Karnataka", mobile: "12345", pincode: "012345" } : { mobile: (ctx.user && ctx.user.mobile) || "" };
      var sm = ctx.forms.summary(items, sample);
      return W("x-checkout", (sample ? K.sample("Synthetic details for reviewing the design. Every field is disabled and nothing can be submitted or saved.") : "") +
        K.head({ kicker: "Checkout · guest", title: "Checkout", lede: c.lede }) +
        '<ol class="x-progress" aria-label="Checkout steps">' + c.steps.map(function (s, i) { return '<li><span aria-hidden="true">' + pad(i + 1) + "</span>" + s + "</li>"; }).join("") + "</ol>" +
        '<div class="x-co-grid"><form id="checkout-form" class="x-co-form checkout-form" novalidate>' +
        '<div class="x-co-step"><h2><span aria-hidden="true">01</span> ' + c.steps[0] + "</h2>" + ctx.forms.delivery(vals, sample, err) + "</div>" +
        '<div class="x-co-step"><h2><span aria-hidden="true">02</span> ' + c.steps[1] + "</h2>" + ctx.forms.payment(sample) + "</div>" +
        '<div class="x-co-step"><h2><span aria-hidden="true">03</span> ' + c.steps[2] + "</h2>" + ctx.forms.confirm(sample, err) + '<p class="x-small">' + c.privacy + "</p></div></form>" +
        '<aside class="x-summary order-summary checkout-summary"><p class="x-kicker">In your bag (' + sm.count + ")</p>" + sm.lines + sm.discount + sm.totals + '<p class="x-small">Sample pricing only; no final GST calculation is shown.</p><div class="x-after"><p class="x-kicker">What happens next</p>' + numbered(c.after) + "</div></aside></div>");
    }

    function payView(o, fx) { if (fx) return fx; if (!o) return "missing"; if (o.state === "paid") return "paid"; if (o.state === "pending") return o.expires < Date.now() / 1000 ? "expired" : "pending"; return "inactive"; }
    function payment(ctx, o, fx) {
      var v = payView(o, fx);
      if (v === "missing") return notFound(ctx);
      if (v === "unavailable" && !o) return unavailable(ctx, "/payment");
      var sample = !!fx;
      var heads = {
        pending: ["Complete your payment", "Try a success or a failure to see the order journey. Your items are held for 15 minutes."],
        failed: ["That payment didn't go through", "No money moved. Your items are still held, so you can try again before the reservation ends."],
        paid: ["Payment received", "No money moved. Your preview order is confirmed and ready to explore."],
        expired: ["This reservation has ended", "The 15-minute hold on your items has expired. Start a new checkout to check availability again."],
        unavailable: ["Payment is unavailable right now", "The payment service didn't respond. Nothing was charged. Try again shortly, or keep your bag and come back later."],
        inactive: ["No payment is needed", "This order no longer has an active payment step."],
      }[v];
      var actions = v === "pending" || v === "failed"
        ? '<button class="x-btn x-btn-main" data-pay="success" data-id="' + o.id + '"' + (sample ? " disabled" : "") + '><span>Simulate successful payment</span></button><button class="x-btn x-btn-ghost" data-pay="failure" data-id="' + o.id + '"' + (sample ? " disabled" : "") + '><span>Simulate failed payment</span></button>' + (sample ? "" : '<p class="reservation-time x-small" data-expires="' + o.expires + '"></p>') + '<p id="payment-result" role="status">' + (v === "failed" ? "Preview payment failed. You can try again." : "") + "</p>"
        : v === "expired" ? K.btn("/cart", "Return to your bag", "main")
        : v === "unavailable" ? '<button class="x-btn x-btn-main" disabled><span>Try again</span></button>' + K.link("/cart", "Back to your bag")
        : K.btn("/orders/" + o.id, "View your order", "main");
      return W("x-pay x-pay-" + v, (sample ? K.sample("Synthetic order SAMPLE-1042. No payment, order or record exists.") : "") +
        '<div class="x-pay-grid"><div class="x-pay-main">' + K.head({ kicker: "Payment · " + ctx.escape(o.id), title: heads[0], lede: heads[1] }) + '<div class="x-amount"><span>Sample order total</span><strong>' + ctx.money(o.total) + '</strong></div><div class="x-actions">' + actions + "</div></div>" +
        '<aside class="x-summary"><p class="x-kicker">Order record</p>' + o.items.map(function (i) { return '<div class="sum-row"><span>' + ctx.escape(i.name) + " × " + i.quantity + "</span><strong>" + ctx.money(i.unit_price * i.quantity) + "</strong></div>"; }).join("") + '<div class="sum-row"><span>Sample discount</span><span>−' + ctx.money(o.discount) + '</span></div><div class="sum-row"><span>Sample shipping</span><span>' + ctx.money(o.shipping) + '</span></div><div class="sum-row summary-total"><span>Total</span><strong>' + ctx.money(o.total) + '</strong></div><p class="x-small">Real payments need Razorpay credentials, signature verification, webhook reconciliation and settlement testing. None is connected.</p></aside></div>');
    }

    function order(ctx, o, fx) {
      if (!o) return W("x-order", K.head({ kicker: "Order", title: "Order not found", lede: "Sign in to the customer session that owns this order." }) + K.next([["/account", "Your account"], ["/help", "Help centre"]]));
      var sample = !!fx, st = o.state;
      var head = { pending: "Your order is waiting for payment", paid: "We have your order", shipped: "Your order is on its way", delivered: "Delivered", cancelled: "This order was cancelled", expired: "This order expired" }[st] || "Your order";
      var steps = [["pending", "Order created"], ["paid", "Payment received"], ["shipped", "Shipped"], ["delivered", "Delivered"]];
      var customer = sample || (ctx.user && ctx.user.role === "customer");
      var canCancel = customer && ["pending", "paid"].indexOf(st) >= 0;
      var reviewed = (ctx.account && ctx.account.reviews) || [];
      var reviewItems = o.items.filter(function (i) { return !reviewed.some(function (r) { return r.order_id === o.id && r.product === i.id; }); });
      var review = customer && st === "delivered" ? (reviewItems.length ? '<section class="x-review" aria-labelledby="rv-t"><p class="x-kicker">Verified delivery</p><h2 id="rv-t">How was it?</h2><p>Only delivered orders can be reviewed, and every review is moderated before it appears.</p>' + ctx.forms.reviewForm(o, reviewItems, sample) + "</section>" : '<section class="x-review" role="status"><h2>Review submitted</h2><p>Your review is awaiting moderation.</p></section>') : "";
      return W("x-order", (sample ? K.sample("Synthetic order with a fictional address. No order, shipment or customer record exists.") : "") +
        K.head({ kicker: "Order " + ctx.escape(o.id) + " · created " + ctx.date(o.created), title: head, lede: "Preview transaction only. Nothing was charged or shipped." }) +
        '<ol class="x-timeline">' + steps.map(function (s, i) { var h = (o.history || []).find(function (x) { return x.state === s[0]; }); return '<li class="' + (h ? "is-done" : "") + '"><span aria-hidden="true">' + (h ? "✓" : pad(i + 1)) + "</span><strong>" + s[1] + "</strong><small>" + (h ? ctx.date(h.at) : "Not yet") + "</small></li>"; }).join("") + "</ol>" +
        (o.provider ? K.note("<strong>Tracking.</strong> " + ctx.escape(o.provider) + " · " + ctx.escape(o.tracking) + ". Simulated: no shipment was booked.") : "") +
        (o.refund && o.refund !== "none" ? K.note("<strong>Refund.</strong> " + ctx.badge(o.refund) + " A refund needs a second person's approval and moves no money in the preview.") : "") +
        '<div class="x-order-grid"><div><h2 class="x-subhead">In this order</h2><ol class="x-rows">' + o.items.map(function (i) { var p = ctx.product(i.id); return p ? K.row(ctx, p, "/products/" + i.id, ctx.money(i.quantity * i.unit_price), "Quantity " + i.quantity) : ""; }).join("") + "</ol>" +
        '<div class="x-actions">' + (st === "pending" ? K.btn("/payment/" + o.id + (sample ? "?state=pending" : ""), "Continue payment", "main") : "") + (canCancel ? '<button class="x-btn x-btn-ghost" data-cancel="' + o.id + '"' + (sample ? " disabled" : "") + "><span>Cancel order</span></button>" : "") + '<button class="x-btn x-btn-ghost" data-reorder="' + o.id + '"' + (sample ? " disabled" : "") + "><span>Reorder items</span></button>" + K.link("/contact?order=" + o.id, "Get help with this order") + "</div>" + review + "</div>" +
        '<aside class="x-summary"><p class="x-kicker">Summary</p><div class="sum-row"><span>Sample subtotal</span><span>' + ctx.money(o.subtotal) + '</span></div><div class="sum-row"><span>Sample discount</span><span>−' + ctx.money(o.discount) + '</span></div><div class="sum-row"><span>Sample delivery</span><span>' + ctx.money(o.shipping) + '</span></div><div class="sum-row summary-total"><span>Total</span><strong>' + ctx.money(o.total) + '</strong></div><p class="x-kicker">Delivering to</p><address>' + ctx.escape(o.contact.name) + "<br>" + ctx.escape(o.contact.address) + "<br>" + ctx.escape(o.contact.city) + ", " + ctx.escape(o.contact.state) + "<br>" + ctx.escape(o.contact.pincode) + '</address><p class="x-small">Policy snapshot: ' + ctx.escape(o.policy_version) + "</p></aside></div>");
    }

    function account(ctx, tab, fx) {
      var c = S.copy.account, a = ctx.account || { orders: [], addresses: [], cases: [] }, sample = !!fx;
      var guest = fx ? fx === "signed-out" || fx === "code" : !ctx.user || ctx.user.id.indexOf("guest-") === 0;
      if (fx) a = { orders: fx === "orders" ? [S.fixtures.order("delivered", ctx.catalog), Object.assign(S.fixtures.order("paid", ctx.catalog), { id: "SAMPLE-1037" })] : [], addresses: fx === "sample" ? S.fixtures.addresses() : [], cases: fx === "sample" ? S.fixtures.cases : [] };
      var tabs = '<nav class="x-tabs" aria-label="Account sections">' + [["orders", "Orders", "/account"], ["addresses", "Addresses", "/account/addresses"], ["cases", "Support cases", "/account/cases"], ["preferences", "Preferences", "/settings"]].map(function (t) { return '<a href="' + t[2] + (sample && t[0] !== "preferences" ? "?state=" + (t[0] === "orders" ? "orders" : "sample") : "") + '"' + (t[0] === tab ? ' aria-current="page"' : "") + ">" + t[1] + "</a>"; }).join("") + (guest ? "" : '<button class="x-linkbtn" data-action="logout"' + (sample ? " disabled" : "") + ">Sign out</button>") + "</nav>";
      var login = guest ? '<section class="x-login" aria-labelledby="login-t"><div><p class="x-kicker">Sign in</p><h2 id="login-t">Your orders, in one place</h2><p>' + c.signIn + "</p></div><div>" + (fx === "code" ? ctx.forms.codeEntry("482913") : ctx.forms.otp(sample)) + "</div></section>" : "";
      var body;
      if (tab === "addresses") body = '<div class="x-acc-grid"><div><h2 class="x-subhead">Saved addresses</h2>' + (a.addresses.length ? a.addresses.map(function (v) { return '<address class="x-addr"><strong>' + ctx.escape(v.name) + "</strong><br>" + ctx.escape(v.address) + "<br>" + ctx.escape(v.city) + ", " + ctx.escape(v.state) + " " + ctx.escape(v.pincode) + "</address>"; }).join("") : '<p class="x-small">No saved addresses yet. Add one and it\'ll be ready at checkout.</p>') + '</div><div><h2 class="x-subhead">Add an address</h2>' + ctx.forms.address(sample) + "</div></div>";
      else if (tab === "cases") body = '<div class="x-acc-head"><h2 class="x-subhead">Your cases</h2>' + K.link("/contact", "Open a new case") + "</div>" + (a.cases.length ? '<ol class="x-cases">' + a.cases.map(function (k) { return '<li><p class="x-kicker">' + ctx.escape(k.id) + " · " + ctx.escape(k.kind) + "</p>" + ctx.badge(k.state) + "<p>" + ctx.escape(k.message) + "</p><small>" + ctx.escape(k.owner) + " · " + ctx.escape(k.sla) + "</small>" + (k.order_id ? K.link("/orders/" + k.order_id + (sample ? "?state=paid" : ""), k.order_id) : "") + "</li>"; }).join("") + "</ol>" : K.empty(ctx, { title: "No open cases", text: "Cases and their updates will show up here.", cta: "Contact support", href: "/contact", h: 3 }));
      else body = '<h2 class="x-subhead">Your orders</h2>' + (a.orders.length ? '<ol class="x-rows is-text">' + a.orders.map(function (o) { return '<li class="x-row"><a href="/orders/' + o.id + (sample ? "?state=" + o.state : "") + '"><span class="x-row-main"><strong>' + ctx.escape(o.id) + "</strong><small>" + ctx.date(o.created) + " · " + o.items.reduce(function (n, i) { return n + i.quantity; }, 0) + " items · " + ctx.money(o.total) + ' sample</small></span><span class="x-row-end">' + ctx.badge(o.state) + "</span></a></li>"; }).join("") + "</ol>" : K.empty(ctx, { title: "No orders yet", text: "Orders you place in this session will show up here.", h: 3 }));
      return W("x-account", (sample ? K.sample("Synthetic account data for reviewing the design. No sign-in, address or case exists.") : "") +
        K.head({ kicker: "Your account", title: guest ? "Hello, guest" : "Hello again", lede: guest ? c.lede : "Signed in with mobile ending " + ctx.escape(sample ? "0000" : ctx.user.mobile.slice(-4)) + "." }) + login + tabs + '<div class="x-acc-body">' + body + "</div>");
    }

    function help(ctx) {
      var c = S.copy.help;
      return W("x-help", K.head({ kicker: "Help centre", title: "A clear next step, a person to ask", lede: c.lede }) +
        '<ol class="x-topics">' + c.topics.map(function (t, i) { return '<li id="' + t[0] + '"' + (t[0] === "safety" ? ' class="is-safety"' : "") + '><span class="x-step-no" aria-hidden="true">' + pad(i + 1) + "</span><h2>" + t[1] + "</h2><p>" + t[2] + "</p>" + K.link(t[3], t[4]) + "</li>"; }).join("") + "</ol>" +
        c.topics.filter(function (t) { return c.faqs.some(function (f) { return f[0] === t[0]; }); }).map(function (t) { return K.sec({ id: "faq-" + t[0], kicker: "Questions", title: t[1], body: '<div class="x-faqs">' + faqs(c.faqs.filter(function (f) { return f[0] === t[0]; }).map(function (f) { return [f[1], f[2]]; })) + "</div>" }); }).join("") +
        K.sec({ id: "stuck", kicker: "Still stuck?", title: "Open a case, keep one record", cls: "x-cta", body: "<p>" + S.copy.contact.lede + '</p><div class="x-actions">' + K.btn("/contact", "Contact support", "main") + K.link("/contact?kind=safety", "Report a product safety issue") + "</div>" }));
    }
    function contact(ctx, fx) {
      var c = S.copy.contact;
      if (fx === "unavailable" || (!fx && ctx.staticPreview)) return unavailable(ctx, "/contact");
      var sample = !!fx, oid = ctx.query.get("order") || "", kind = ctx.query.get("kind") || "general";
      var right = fx === "submitted"
        ? '<div class="report-result case-created x-created" role="status"><p class="x-kicker">Case created · sample</p><h2>SAMPLE-CASE-01</h2><p>This is how a confirmation looks. In this design state, no case was saved and no message was sent.</p>' + K.link("/account/cases?state=sample", "Follow your case") + "</div>"
        : ctx.forms.caseForm(oid, kind, sample, fx === "errors" ? { message: "Tell us a little more: at least 10 characters." } : null);
      return W("x-contact", (sample ? K.sample("Visual state only. Nothing is sent or saved.") : "") + K.head({ kicker: "Contact", title: "Talk to a person", lede: c.lede }) +
        '<div class="x-contact-grid"><div><h2 class="x-subhead">Ways to reach us</h2>' + dl(c.channels) + '<div class="x-safety"><p class="x-kicker">Product issue?</p><p>' + c.safety + '</p></div><p class="x-small">' + c.privacy + "</p></div><div>" + right + "</div></div>");
    }
    function policy(ctx, kind) {
      var p = S.policies[kind];
      if (!p) return notFound(ctx);
      return W("x-policy", '<div class="x-pol-grid"><nav class="x-pol-nav" aria-label="Policies"><p class="x-kicker">Policies · working drafts</p><ol>' + S.policyOrder.map(function (k) { return '<li><a href="/policies/' + k + '"' + (k === kind ? ' aria-current="page"' : "") + ">" + S.policies[k].title + "</a></li>"; }).join("") + "</ol></nav>" +
        '<article class="x-pol-body">' + K.head({ crumbs: [["/", "Home"], ["/help", "Help"], ["", p.title]], kicker: "Policy draft · not final terms", title: p.title }) + '<div class="x-plain"><p class="x-kicker">In plain words</p><p>' + p.plain + "</p></div>" +
        p.sections.map(function (s, i) { return '<section class="x-pol-sec"><h2><span>' + (i + 1) + ".</span> " + s[0] + ' <span class="x-pstatus" data-status="' + s[2].toLowerCase().replace(/\s+/g, "-") + '">' + s[2] + "</span></h2><p>" + s[1] + "</p></section>"; }).join("") +
        '<p class="x-small">These are working drafts for review. They aren\'t the final terms for a live store, and anything marked unresolved hasn\'t been decided.</p>' + K.next([["/help", "Help centre"], ["/contact", "Ask a question"]]) + "</article></div>");
    }
    function settings(ctx) {
      var c = S.copy.settings;
      return W("x-settings", K.head({ kicker: "Preferences", title: "Your choices, kept simple", lede: c.lede }) + '<div class="x-narrow">' + ctx.forms.preferences(c.groups) + '<p class="x-small">Read the <a href="/policies/privacy">privacy draft</a> for what the preview stores.</p></div>');
    }
    function states(ctx) {
      return W("x-states", K.head({ kicker: "Design states", title: "Every state, one index", lede: "Synthetic fixtures for reviewing transactional and edge states. None of them creates an order, payment, message or account record." }) +
        S.states.map(function (g, i) { return K.sec({ id: "state-" + i, kicker: "Route", title: g[0], body: '<ol class="x-rows is-text">' + g[1].map(function (s) { return '<li class="x-row"><a href="' + s[0] + '"><span class="x-row-main"><strong>' + s[1] + "</strong><small>" + s[0] + '</small></span><span class="x-row-end">View</span></a></li>'; }).join("") + "</ol>" }); }).join(""));
    }
    function learnOffline(ctx) { return W("x-learn", K.head({ kicker: "Learn", title: "The reading room is closed for now", lede: "The ingredient library isn't published right now." }) + K.next([["/shop", "Shop all seven"]])); }

    /* Default shop (directions override). */
    function shop(ctx) {
      var st = shopList(ctx);
      return W("x-shop", K.head({ kicker: "Shop", title: "Shop all seven", lede: S.copy.shop.lede }) + '<div class="x-shopbar">' + filterNav(ctx, st) + sortForm(ctx, st) + "</div>" +
        (st.list.length && st.known ? '<ol class="x-rows">' + st.list.map(function (p) { return K.row(ctx, p, "/products/" + p.id, ctx.money(p.price)); }).join("") + "</ol>" : K.empty(ctx, { title: S.copy.shop.noMatch[0], text: S.copy.shop.noMatch[1], cta: "Show all seven" })));
    }

    var T = {
      chrome: V.chrome, home: V.home, shop: V.shop || shop, product: V.product, reports: V.reports || reports,
      about: about, bundles: bundles, search: search, standards: standards, story: story, learn: learn, cart: cart, checkout: checkout,
      payment: payment, order: order, account: account, help: help, contact: contact, policy: policy, settings: settings,
      notFound: notFound, unavailable: unavailable, states: states, learnOffline: learnOffline,
    };
    Object.keys(V.routes || {}).forEach(function (k) { T[k] = V.routes[k]; });
    return T;
  }

  /* ---------- Behaviour ---------- */
  var variantEnhance = {};
  var reduced = function () { return matchMedia("(prefers-reduced-motion: reduce)").matches; };
  /* A set of buttons that switch panels: [data-eh-tabs] > [data-eh-tab="i"] + [data-eh-panel="i"]. Arrow keys, Home, End. */
  function tabs(root) {
    var btns = [].slice.call(root.querySelectorAll("[data-eh-tab]"));
    var panels = [].slice.call(root.querySelectorAll("[data-eh-panel]"));
    if (!btns.length) return;
    function pick(i, focus) {
      btns.forEach(function (b, n) {
        var on = n === i;
        /* Only the state attribute that matches the control's role: tabs select, toggles press, disclosures expand. */
        if (b.getAttribute("role") === "tab") { b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; }
        else if (b.hasAttribute("aria-expanded")) b.setAttribute("aria-expanded", String(on));
        else b.setAttribute("aria-pressed", String(on));
        b.classList.toggle("is-on", on);
        if (focus && on) b.focus();
      });
      panels.forEach(function (p) { p.hidden = p.getAttribute("data-eh-panel") !== String(i); });
      root.setAttribute("data-current", String(i));
      var b = btns[i];
      if (b && b.getAttribute("data-cap")) root.style.setProperty("--pick", b.getAttribute("data-cap"));
      root.dispatchEvent(new CustomEvent("eh:pick", { detail: { index: i, button: b } }));
    }
    btns.forEach(function (b, i) {
      b.addEventListener("click", function () { pick(i, false); });
      b.addEventListener("keydown", function (e) {
        var vertical = root.getAttribute("data-eh-orient") === "vertical";
        var k = e.key, n = btns.length, j = null;
        if (k === (vertical ? "ArrowDown" : "ArrowRight") || (!vertical && k === "ArrowDown")) j = (i + 1) % n;
        else if (k === (vertical ? "ArrowUp" : "ArrowLeft") || (!vertical && k === "ArrowUp")) j = (i - 1 + n) % n;
        else if (k === "Home") j = 0;
        else if (k === "End") j = n - 1;
        if (j === null) return;
        e.preventDefault();
        pick(j, true);
      });
      if (root.hasAttribute("data-eh-hover")) b.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") pick(i, false); });
    });
    var start = btns.findIndex(function (b) { return b.classList.contains("is-on") || b.getAttribute("aria-selected") === "true" || b.getAttribute("aria-pressed") === "true" || b.getAttribute("aria-expanded") === "true"; });
    pick(start < 0 ? 0 : start, false);
  }
  function enhance() {
    var d = document.body.dataset.theme;
    if (["e", "f", "g", "h"].indexOf(d) < 0) return;
    var main = document.getElementById("main");
    if (!main) return;
    [].slice.call(document.querySelectorAll("[data-eh-tabs]")).forEach(tabs);
    /* Sort select: navigate on change (the form still works as a plain GET without script). */
    var sort = main.querySelector("[data-eh-sort] select");
    if (sort) sort.addEventListener("change", function () {
      var u = new URL(location.href);
      if (sort.value === "catalogue") u.searchParams.delete("sort"); else u.searchParams.set("sort", sort.value);
      /* Route through a normal in-app link so history, design persistence and focus behave like any navigation. */
      var a = document.createElement("a");
      a.href = u.pathname + u.search;
      a.hidden = true;
      document.getElementById("app").appendChild(a);
      a.click();
      a.remove();
    });
    if (variantEnhance[d]) variantEnhance[d](main, { reduced: reduced() });
  }
  /* Mobile drawer: open below the header (and the preview bar, when present) so the menu button stays reachable. */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("[data-action=menu]");
    if (!btn || ["e", "f", "g", "h"].indexOf(document.body.dataset.theme) < 0) return;
    requestAnimationFrame(function () {
      var head = btn.closest("header"), nav = document.getElementById("mobile-nav");
      if (head && nav) nav.style.setProperty("--mnav-top", Math.max(0, Math.round(head.getBoundingClientRect().bottom)) + "px");
    });
  });
  /* The sort form must not reach app.js's generic submit handler (it would be ignored and block the page). */
  document.addEventListener("submit", function (e) {
    var f = e.target;
    if (!(f instanceof HTMLFormElement) || !f.hasAttribute("data-eh-sort")) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    var sel = f.querySelector("select");
    if (sel) sel.dispatchEvent(new Event("change"));
  }, true);

  window.BCCEH = {
    make: make, enhance: enhance, onEnhance: function (key, fn) { variantEnhance[key] = fn; },
    h: { pad: pad, no: no, front: front, render: render, dash: dash, numbered: numbered, dl: dl, faqs: faqs, addBtn: addBtn, inView: inView, formatCounts: formatCounts, shopList: shopList, sortForm: sortForm, filterNav: filterNav, ask: ask, homeLotForm: homeLotForm, pdp: pdp, qtySelect: qtySelect, addMain: addMain, pincodeForm: pincodeForm, pdpLotForm: pdpLotForm, HOME: HOME, MOCKUP: MOCKUP, PENDING: PENDING, REVIEWS: REVIEWS, KIT: KIT },
  };
})();
