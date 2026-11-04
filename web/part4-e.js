/* Body Café Co. — Variant E Part 4 · "The Café" (rebuilt 4 Nov 2026).
   Only active when body[data-variant-e-part="4"]. Uses the Part 2 layer (web/part2-e.js) for data helpers, bottles, spins and the
   shared behaviours (add, lot picker, format filter, frequently-bought-with), but nothing of its look: Part 4 has its own chrome.
   The idea: the brand is a café. It serves seven things and says exactly what is in each. The site is the menu and the counter,
   in the seven cap colours, with the bottle photography filling the screen. The mechanic is Service (Morning · Noon · Night):
   a switch in the header that changes the whole palette and, from each label's own timing, which items step forward.
   Same content, flow and data as Parts 2 and 3. No manufacturer names. Nothing that suggests taking all seven. */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE, P = window.BCCPart2E;
  if (!S || !S.themes || !S.themes.e || !L || !P) return;
  var esc = L.esc;

  function on() { return document.body.dataset.variantEPart === "4"; }
  function part4(name, fn) {
    var base = S.themes.e[name];
    if (typeof base !== "function") return;
    L.replace(name, function () { return on() ? fn.apply(this, arguments) : base.apply(this, arguments); });
  }
  function still() { return matchMedia("(prefers-reduced-motion: reduce)").matches; }

  /* ---------- Service: morning, noon or night. The label says when each product is best; the page follows. ---------- */
  var SERVICES = [["morning", "Morning"], ["noon", "Noon"], ["night", "Night"]], KEY = "bcc-p4-service";
  var WHEN = { morning: "in the morning", noon: "at noon", night: "at night" };
  function bestOf(p) { var t = p.label_timing || {}; for (var k in t) if (/^best/i.test(String(t[k]))) return k; return "morning"; }
  function current() {
    try { var v = sessionStorage.getItem(KEY); if (SERVICES.some(function (s) { return s[0] === v; })) return v; } catch (e) {}
    var h = new Date().getHours(); return h < 11 ? "morning" : h < 17 ? "noon" : "night"; // the café opens in the service you are in
  }
  function apply(v, remember) {
    document.body.dataset.p4Service = v;
    if (remember) { try { sessionStorage.setItem(KEY, v); } catch (e) {} }
    document.querySelectorAll("[data-p4-service]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.p4Service === v)); });
  }
  function svcButtons(cls) { return '<div class="' + (cls || "p4-svc") + '" role="group" aria-label="Service"><span class="p4-k">Service</span>' + SERVICES.map(function (s) { return '<button type="button" data-p4-service="' + s[0] + '" aria-pressed="false">' + s[1] + "</button>"; }).join("") + "</div>"; }

  /* ---------- Pieces ---------- */
  function photo(p, kind, o) {
    o = o || {}; var w = kind === "detail" ? 1800 : 1196, h = kind === "detail" ? 2400 : 1315;
    return '<img class="' + (o.cls || "p4-photo") + '" src="/web/media/premium/' + esc(p.id) + "-" + kind + '.webp" alt="' + esc(o.alt || "") + '" width="' + w + '" height="' + h + '"' + (o.eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async">';
  }
  function k(t) { return '<p class="p4-k">' + t + "</p>"; }
  function lead() { return '<span class="p4-lead" aria-hidden="true"></span>'; }
  function head(o) { return '<header class="p4-page-head">' + (o.k ? k(o.k) : "") + "<h1" + (o.id ? ' id="' + o.id + '"' : "") + ">" + o.title + "</h1>" + (o.lede ? '<p class="p4-lede">' + o.lede + "</p>" : "") + (o.extra || "") + "</header>"; }
  function sechead(title, side, id) { return '<header class="p4-sec-head"><h2' + (id ? ' id="' + id + '"' : "") + ">" + title + "</h2>" + (side || "") + "</header>"; }
  function tag(t) { return '<b class="p4-tag ' + (t === "In place" ? "is-done" : "is-soon") + '">' + t + "</b>"; }
  // One line of the menu: dot · NAME · fact · leaders · price · Add. data-best is the service its label says is best.
  function line(ctx, p, o) {
    o = o || {}; var ok = L.avail(p), best = bestOf(p);
    return '<li class="p4-line" data-best="' + best + '" data-p2-format="' + P.formatGroup(ctx, p) + '" data-p4-line="' + esc(p.id) + '" style="' + ctx.capStyle(p) + '">' +
      '<i class="p4-dot" aria-hidden="true"></i><a class="p4-line-name" href="' + P.href(p) + '">' + esc(p.name) + "</a>" +
      '<span class="p4-line-fact">' + P.fact(ctx, p) + (o.format ? " · " + P.formatGroup(ctx, p) : "") + '<small class="p4-line-also">Also fine now · best ' + WHEN[best] + "</small></span>" +
      lead() + '<span class="p4-line-price">' + ctx.money(p.price) + "</span>" +
      (o.noAdd ? "" : '<button type="button" class="p4-add" data-add="' + esc(p.id) + '" aria-label="Add ' + esc(p.name) + ' to bag"' + (ok ? "" : " disabled") + ">" + (ok ? "Add" : "Unavailable") + "</button>") + "</li>";
  }
  function menu(ctx, list, o) { return '<ol class="p4-menu' + (o && o.cls ? " " + o.cls : "") + '" data-p4-menu>' + list.map(function (p) { return line(ctx, p, o); }).join("") + "</ol>"; }
  function ticket(form, title) { return '<div class="p4-ticket"><p class="p4-ticket-k">' + (title || "Order number") + "</p>" + form + "</div>"; }
  function lotBlock(ctx, p, o) {
    return '<section class="p4-lotsec" id="' + (o.id || "p4-lot") + '" aria-labelledby="' + (o.id || "p4-lot") + '-t"><div class="p4-lot-block" data-p4-lotblock style="' + ctx.capStyle(p) + '">' + k("Lot record") + '<h2 id="' + (o.id || "p4-lot") + '-t">' + o.title + "</h2><p>" + o.text + '</p></div><div class="p4-lot-paper">' + ticket(o.form) + "</div></section>";
  }
  // Regulars: a quote on its product's colour. The first sentence is the big line.
  function regulars(ctx, list, o) {
    o = o || {}; if (!list.length) return "";
    return '<ul class="p4-regs-row">' + list.map(function (r) {
      var p = ctx.product(r[0]); if (!p) return "";
      var parts = String(r[3]).split(/(?<=[.!?])\s+/), first = parts.shift() || "", rest = parts.join(" ");
      return '<li style="' + ctx.capStyle(p) + '"><div class="p4-reg-top">' + P.stars(r[1]) + '<span class="p4-sample">Sample</span></div><blockquote><p class="p4-reg-lead">' + esc(first) + "</p>" + (rest ? "<p>" + esc(rest) + "</p>" : "") + "</blockquote>" +
        '<footer><b>' + esc(r[4]) + "</b><span>" + esc(r[5]) + "</span>" + (o.noLink ? "" : '<a href="' + P.href(p) + '">' + esc(p.name) + "</a>") + "</footer></li>";
    }).join("") + "</ul>";
  }
  function notes(list) {
    return '<div class="p4-notelist" data-p4-notes>' + list.map(function (f) { return '<details class="p4-note"><summary><span>' + esc(f[0]) + "</span>" + lead() + '<i aria-hidden="true"></i></summary><div class="p4-note-body">' + P.para(f[1]) + "</div></details>"; }).join("") + "</div>";
  }

  /* ---------- Chrome: the sign, the menu, the service switch, the counter ---------- */
  var NAV = [["/shop", "Menu"], ["/standards", "Our standard"], ["/learn", "Learn"], ["/story", "Story"], ["/help", "Help"]];
  var MENU = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>';
  part4("chrome", function (ctx, content) {
    if (document.body.dataset.p4Pin) delete document.body.dataset.p4Pin; else apply(current());
    var path = ctx.path, cur = function (h) { return path === h || path.indexOf(h + "/") === 0 ? ' aria-current="page"' : ""; };
    var F = window.BCCFooterE || {}, care = S.careGroups();
    var head =
      // The real mark (web/media/brand-original.svg), drawn as a mask so it takes the service colour.
      '<header class="p4-head"><a class="p4-logo" href="/" aria-label="Body Café Co. home"><span class="p4-mark" aria-hidden="true"></span></a>' +
      '<nav class="p4-nav" aria-label="Main">' + NAV.map(function (n) { return '<a href="' + n[0] + '"' + cur(n[0]) + ">" + n[1] + "</a>"; }).join("") + "</nav>" +
      svcButtons("p4-svc") +
      '<div class="p4-tools"><button class="p4-icon" data-action="search" aria-label="Search">' + ctx.icon("search") + "</button>" +
      '<a class="p4-icon" href="/account" aria-label="Your account"' + cur("/account") + ">" + ctx.icon("user") + "</a>" +
      '<a class="p4-icon bag-link" href="/cart" aria-label="Bag, ' + ctx.count + ' items">' + ctx.icon("bag") + '<span class="p4-count" data-cart-count' + (ctx.count ? "" : " data-empty") + ">" + ctx.count + "</span></a>" +
      '<button class="p4-icon p4-menu-btn menu-button" data-action="menu" aria-expanded="false" aria-controls="mobile-nav">' + MENU + '<span class="sr-only">Menu</span></button></div></header>';
    var mnav = '<nav id="mobile-nav" class="p4-mnav" hidden aria-label="Mobile"><ul>' + NAV.concat([["/reports", "Look up a lot"], ["/account", "Account"]]).map(function (n) { return '<li><a href="' + n[0] + '">' + n[1] + "</a></li>"; }).join("") + "</ul>" + svcButtons("p4-svc p4-svc-m") + "</nav>";
    var foot =
      '<footer class="p4-foot"><span class="p4-foot-logo" role="img" aria-label="Body Café Co."></span>' +
      '<div class="p4-foot-grid"><div><h2>Menu</h2><a href="/shop">All seven</a>' + ctx.published.map(function (p) { return '<a href="' + P.href(p) + '">' + esc(p.name) + "</a>"; }).join("") + "</div>" +
      '<div><h2>Know more</h2><a href="/standards">Our standard</a><a href="/learn">Learn</a><a href="/story">Story</a><a href="/reports">Look up a lot</a></div>' +
      care.map(function (g) { return "<div><h2>" + g.group + "</h2>" + g.items.map(function (x) { return '<a href="' + x[1] + '">' + x[0] + "</a>"; }).join("") + "</div>"; }).join("") + "</div>" +
      '<p class="p4-hours"><span>Opening hours</span>Morning · Noon · Night. The label on each bottle says when it is best; so does the menu.</p>' +
      (F.LEGAL ? '<p class="p4-foot-legal">' + esc(F.LEGAL) + "</p>" : "") +
      '<p class="p4-foot-base">© ' + new Date().getFullYear() + " " + esc(F.OWNER || "Body Café Co.") + "</p></footer>";
    return '<div class="eh eh-e p4">' + head + mnav + '<main id="main" tabindex="-1">' + content + "</main>" + foot + "</div>";
  });

  /* ---------- Home: now serving → house rules → the menu → the standard → order number → regulars → house notes ---------- */
  part4("home", function (ctx) {
    var list = ctx.published, first = list[0], cs = ctx.catalog, all = P.reviewsFor(), rv = all.slice(0, 3);
    if (!first) return head({ title: "Closed for a moment." });
    return '<div class="p4-home">' +
      /* 1 · Now serving */
      '<section class="p4-hero" data-p4-hero style="' + ctx.capStyle(first) + '" aria-labelledby="p4-hero-t">' +
      '<div class="p4-hero-block">' + k("Now serving") + '<h1 id="p4-hero-t" class="p4-word-big">Super<br> Sevens</h1>' +
      '<p class="p4-hero-sub"><a href="' + P.href(first) + '" data-p4-hero-link><span data-p4-hero-name>' + esc(first.name) + '</span><span data-p4-hero-fact>' + P.fact(ctx, first) + "</span></a></p>" +
      '<div class="p4-hero-cta"><a class="p4-btn" href="/shop">See the menu</a><a class="p4-btn p4-btn-ghost" href="/standards">Our standard</a></div></div>' +
      '<div class="p4-hero-photo" data-p4-photo>' + list.map(function (p, i) { return photo(p, "still", { cls: "p4-hero-still" + (i ? "" : " is-on"), eager: i < 2, alt: i ? "" : p.name + " bottle" }); }).join("") + "</div>" +
      '<ol class="p4-hero-strip" aria-label="The seven">' + list.map(function (p, i) {
        return '<li><button type="button" data-p4-pick="' + i + '" data-href="' + P.href(p) + '" data-name="' + esc(p.name) + '" data-fact="' + P.fact(ctx, p) + '" aria-pressed="' + (i === 0) + '" style="' + ctx.capStyle(p) + '"><i class="p4-dot" aria-hidden="true"></i>' + esc(p.name) + "</button></li>";
      }).join("") + "</ol></section>" +

      /* 2 · House rules */
      '<div class="p4-rules" role="list" aria-label="Our assurances">' + P.CLAIMS.map(function (c, i) { return '<span role="listitem"><i class="p4-dot" aria-hidden="true" style="--cap:' + esc((cs[i] || {}).color || "#999") + '"></i>' + c + "</span>"; }).join("") + "</div>" +

      /* 3 · The menu */
      '<section class="p4-menusec" data-p4-menusec aria-labelledby="p4-menu-t"><div class="p4-menu-bg" aria-hidden="true">' + list.map(function (p) { return photo(p, "still", { cls: "p4-menu-still" }); }).join("") + "</div>" +
      '<div class="p4-wrap">' + sechead("The menu", '<p class="p4-k">Seven. No more. · Dimmed items are also fine now; the label says when they are best.</p>', "p4-menu-t") + menu(ctx, list) +
      '<p class="p4-fine">MRP, inclusive of all taxes. Delivery is free on orders of ₹1,499 or more.</p></div></section>' +

      /* 4 · The standard */
      '<section class="p4-std" style="--img:url(/web/media/premium/' + esc((cs[2] || first).id) + '-detail.webp)" aria-labelledby="p4-std-t"><div class="p4-wrap">' + k("The standard") + '<h2 id="p4-std-t" class="sr-only">One uncompromising standard</h2>' +
      '<ol class="p4-std-lines">' + P.PROOF.map(function (r, i) { return '<li style="--cap:' + esc((cs[(i * 2) % cs.length] || {}).color || "#999") + '"><strong>' + r[0] + "</strong><span>" + r[1] + "</span>" + tag(r[2]) + "</li>"; }).join("") + "</ol>" +
      '<a class="p4-btn p4-btn-paper" href="/standards">Read our standard</a></div></section>' +

      /* 5 · Order number */
      lotBlock(ctx, first, { title: "Every bottle has a number.", text: "Choose your product by its cap, type the number from the pack, and see the record for that batch.", form: P.lotForm(ctx) }) +

      /* 6 · Regulars */
      (rv.length ? '<section class="p4-regs" aria-labelledby="p4-regs-t"><div class="p4-wrap">' + sechead("Regulars", P.reviewSummary(all), "p4-regs-t") + "</div>" + regulars(ctx, rv) + '<p class="p4-wrap p4-fine">' + P.REVIEW_RULE + "</p></section>" : "") +

      /* 7 · House notes */
      '<section class="p4-notes" aria-labelledby="p4-notes-t"><div class="p4-wrap">' + sechead("House notes", '<a class="p4-link" href="/help">Visit Help</a>', "p4-notes-t") + notes(P.homeFaqs()) + "</div></section>" +
      "</div>";
  });

  /* ---------- Shop: the full menu, grouped by when the label says each is best ---------- */
  function shopPage(ctx, title) {
    var list = ctx.published, groups = ["Capsules", "Softgels", "Chews"].filter(function (g) { return list.some(function (p) { return P.formatGroup(ctx, p) === g; }); });
    var n = function (g) { return list.filter(function (p) { return P.formatGroup(ctx, p) === g; }).length; };
    var tabs = '<div class="p4-tabs" role="group" aria-label="Filter by format"><button type="button" data-p2-filter="" aria-pressed="true">All ' + list.length + "</button>" +
      groups.map(function (g) { return '<button type="button" data-p2-filter="' + g + '" aria-pressed="false">' + g + " " + n(g) + "</button>"; }).join("") + "</div>";
    return '<div class="p4-shop">' + head({ k: "The menu", title: title || "Seven. No more.", lede: "Everything we serve, and when the label says it is best." }) +
      '<div class="p4-wrap p4-shop-body">' + tabs + SERVICES.map(function (s) {
        var g = list.filter(function (p) { return bestOf(p) === s[0]; }); if (!g.length) return "";
        return '<section class="p4-group" data-group="' + s[0] + '" aria-label="Best ' + WHEN[s[0]] + '"><h2 class="p4-k">Best ' + WHEN[s[0]] + "</h2>" + menu(ctx, g, { format: true }) + "</section>";
      }).join("") + '<p class="p4-fine">MRP, inclusive of all taxes. Delivery is free on orders of ₹1,499 or more.</p></div></div>';
  }
  part4("shop", function (ctx) { return shopPage(ctx); });

  /* ---------- Product page: the menu item ----------
     Part 1's content and order: the bottle and the price first, then what's in it, how it's served, why this form, cautions,
     lot record, often on the same bill, regulars, the rest of the menu. Opens in the service its label says is best. */
  part4("product", function (ctx, p) {
    var m = window.BCCEH.h.pdp(ctx, p), h = window.BCCEH.h, c = P.copy(p.id), sd = P.std(p.id) || {}, front = p.label_front || {}, best = bestOf(p);
    document.body.dataset.p4Service = best; document.body.dataset.p4Pin = "1";
    var serves = parseInt(p.servings_per_pack, 10), perServe = serves ? "₹" + (p.price / serves).toFixed(2) + " per serving" : "";
    var sentences = function (t) { return String(t || "").split(/(?<=[.!?])\s+/).map(function (x) { return x.trim(); }).filter(Boolean); };
    var norm = function (t) { return String(t || "").toLowerCase().replace(/[^a-z0-9]/g, ""); };
    var uniq = function (xs) { var seen = {}; return xs.filter(function (x) { var kk = norm(x); if (!kk || seen[kk]) return false; seen[kk] = 1; return true; }); };
    var why = uniq(sentences(P.clean(sd.why))), cautions = uniq(sentences(p.warnings));
    var timing = p.label_timing || {}, slots = [["morning", "Morning"], ["noon", "Noon"], ["night", "Night"]];
    var keep = c.keep && c.keep !== "—" && !norm(p.directions).includes(norm(c.keep).replace(/^avoid|^always/, "")) ? c.keep : "";
    var others = ctx.published.filter(function (x) { return x.id !== p.id; }), rv = P.reviewsFor(p.id);
    var pair = (Array.isArray(p.related_product_ids) ? p.related_product_ids.map(function (id) { return others.filter(function (x) { return x.id === id; })[0]; }).filter(Boolean) : m.related || others).slice(0, 2);
    var rows = (p.supplement_facts && p.supplement_facts.rows) || [];
    var dl = function (items) { items = items.filter(function (x) { return x[1]; }); return items.length ? '<dl class="p4-dl">' + items.map(function (x) { return "<div><dt>" + x[0] + "</dt><dd>" + esc(x[1]) + "</dd></div>"; }).join("") + "</dl>" : ""; };
    var fbtLine = function (x, self) {
      return '<li class="p4-line p4-line-fbt' + (self ? " is-self" : "") + '" style="' + ctx.capStyle(x) + '">' + (self ? '<span class="p4-tick is-fixed" aria-hidden="true">✓</span>' : '<label class="p4-tick"><input type="checkbox" checked data-p2-fbt="' + esc(x.id) + '" data-price="' + (+x.price || 0) + '"' + (L.avail(x) ? "" : " disabled") + '><i aria-hidden="true"></i><span class="sr-only">Add ' + esc(x.name) + "</span></label>") +
        '<a class="p4-line-name" href="' + P.href(x) + '">' + esc(x.name) + (self ? ' <small>this item</small>' : "") + '</a><span class="p4-line-fact">' + P.fact(ctx, x) + "</span>" + lead() + '<span class="p4-line-price">' + ctx.money(x.price) + "</span></li>";
    };
    return '<article class="p4-item-page" style="' + ctx.capStyle(p) + '">' +
      /* The item */
      '<section class="p4-item"><div class="p4-item-block"><nav class="p4-crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/shop">Menu</a><span>/</span><span aria-current="page">' + esc(p.name) + "</span></nav>" +
      k(esc(P.formatOf(ctx, p)) + (p.dietary_suitability ? " · " + esc(String(p.dietary_suitability).split(/[.(]/)[0].trim()) : "")) +
      "<h1>" + esc(p.name) + '</h1><p class="p4-item-fact">' + esc(p.subtitle || "") + "</p>" +
      '<p class="p4-item-served"><span class="p4-k">Served</span>' + esc(p.serving_size || "") + " · best " + WHEN[best] + "</p>" +
      '<div class="p4-item-buy" data-pk-scope>' +
      // Choose your pack (owner, 4 Nov 2026); mounted by the shared Part 2 enhance (web/packs-e.js).
      (window.BCCPacks ? window.BCCPacks.picker(p, { max: m.max, off: !!m.off, cls: "pk-p4" }) : "") +
      '<p class="p4-item-price"><s class="p4-was" data-pk-was hidden></s><strong data-pk-total>' + ctx.money(p.price) + "</strong><small>Inclusive of all taxes" + (p.pack_size ? " · " + esc(p.pack_size) + " per bottle" : "") + (perServe ? " · " + perServe : "") + "</small></p>" +
      '<div class="p4-buyrow" data-pd-buy><div class="sr-only" aria-hidden="true" inert>' + h.qtySelect(m, "p4-qty") + "</div>" + h.addMain(m, "p4-btn p4-item-add") + "</div>" +
      (window.BCCPacks ? window.BCCPacks.pincode("pc-p4") : "") +
      '<ul class="p4-item-notes"><li>' + esc(m.stockLine || "In stock") + '</li><li>Ships in 3–4 days</li><li>Free delivery on orders of ₹1,499 or more</li><li><a href="#p4-lot">Look up your lot</a></li>' + (rv.length ? '<li><a href="#p4-reviews">' + rv.length + " sample review" + (rv.length === 1 ? "" : "s") + "</a></li>" : "") + "</ul></div></div>" +
      '<div class="p4-item-photo">' + P.spin(p, { eager: true, cls: "p4-item-spin" }) + '<p class="p4-hint" aria-hidden="true">Drag to turn</p></div></section>' +

      /* What's in it */
      '<section class="p4-paper" id="p4-facts"><div class="p4-wrap p4-two"><div>' + k("What’s in it") + "<h2>Supplement facts</h2><p class=\"p4-sub\">Per " + esc((p.supplement_facts && p.supplement_facts.serving) || p.serving_size || "serving") + (p.servings_per_pack ? " · " + esc(p.servings_per_pack) + " servings per pack" : "") + "</p></div><div>" +
      (rows.length ? '<table class="p4-table"><thead><tr><th scope="col">Nutrient</th><th scope="col">Amount</th><th scope="col">% RDA</th></tr></thead><tbody>' + rows.map(function (r) { return '<tr class="lvl-' + (r.level || 0) + (r.active ? " is-active" : "") + '"><th scope="row">' + esc(r.name) + "</th><td>" + esc(r.amount) + "</td><td>" + esc(r.rda) + "</td></tr>"; }).join("") + '</tbody></table><p class="p4-small">%RDA as per ICMR 2020. # %RDA not established.</p>' : P.para(p.nutrition_information)) +
      // Ingredients: only the other-ingredients list, as in Parts 1–3 (owner, 4 Nov 2026).
      (p.other_ingredients ? '<div class="p4-others"><p class="p4-k">Other ingredients</p>' + P.otherIngredients(p.other_ingredients) + "</div>" : "") + "</div></div></section>" +

      /* How it's served */
      '<section class="p4-paper p4-served"><div class="p4-wrap p4-two"><div>' + k("How it’s served") + "<h2>" + esc(p.serving_size || "One serving") + ", " + WHEN[best] + ".</h2></div><div>" +
      '<div class="p4-slots">' + slots.map(function (s) { var t = String(timing[s[0]] || ""), b = /^best/i.test(t); return '<div class="p4-slot' + (b ? " is-best" : t ? " is-ok" : "") + '"><strong>' + s[1] + "</strong><span>" + (b ? "Best" : t ? "Also fine" : "—") + "</span></div>"; }).join("") + "</div>" +
      dl([["How to take", p.directions], ["With food?", p.directions_tag], ["Keep in mind", keep], ["Age", p.age_guidance]]) + "</div></div></section>" +

      /* Why this form */
      '<section class="p4-why" style="--img:url(/web/media/premium/' + esc(p.id) + '-detail.webp)"><div class="p4-wrap p4-two"><div>' + k("Why this form") + "<h2>" + esc(c.headline || p.name) + "</h2></div><div>" + P.para(P.clean(c.intro || p.description)) +
      (why.length ? '<ul class="p4-ticks">' + why.map(function (w) { return "<li>" + esc(w) + "</li>"; }).join("") + "</ul>" : "") + (front.claim ? '<p class="p4-claim"><span class="p4-k">On the front</span>' + esc(front.claim) + "</p>" : "") + "</div></div></section>" +

      /* Cautions and storage */
      ((cautions.length || p.storage) ? '<section class="p4-paper p4-caut"><div class="p4-wrap p4-two"><div>' + k("Cautions and storage") + "</div><div>" + (cautions.length ? '<ul class="p4-dash">' + cautions.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "") + P.para(p.storage) + "</div></div></section>" : "") +

      /* Lot record */
      lotBlock(ctx, p, { id: "p4-lot", title: "Check the lot printed on your pack.", text: "A lot report describes the sample tested from one production lot. Records appear as reports are published.", form: h.pdpLotForm(m, "p4-lotform") }) +

      /* Often on the same bill (frequently bought with; the shared Part 2 behaviour totals and adds) */
      (pair.length ? '<section class="p4-fbt" data-p2-fbt-box data-self="' + esc(p.id) + '" data-self-price="' + (+p.price || 0) + '"><div class="p4-wrap">' + sechead("Often on the same bill") + '<ol class="p4-menu p4-menu-fbt">' + fbtLine(p, true) + pair.map(function (x) { return fbtLine(x); }).join("") + "</ol>" +
        '<div class="p4-fbt-foot"><p>Your total <b data-p2-fbt-total>' + ctx.money([p].concat(pair).reduce(function (t, x) { return t + (+x.price || 0); }, 0)) + '</b></p><button type="button" class="p4-btn" data-p2-fbt-add>Add these to your bag</button></div></div></section>' : "") +

      /* Regulars */
      '<section class="p4-regs" id="p4-reviews" aria-labelledby="p4-reviews-t"><div class="p4-wrap">' + sechead(rv.length ? "Regulars" : "Reviews open with the first deliveries.", P.reviewSummary(rv), "p4-reviews-t") + "</div>" + regulars(ctx, rv.slice(0, 3), { noLink: true }) + '<p class="p4-wrap p4-fine">' + P.REVIEW_RULE + "</p></section>" +

      /* The rest of the menu */
      '<section class="p4-rest"><div class="p4-wrap">' + sechead("The rest of the menu", '<a class="p4-link" href="/shop">See the menu</a>') + menu(ctx, others, { format: true }) + "</div></section>" +
      "</article>";
  });

  /* ---------- Our standard: four rules, four blocks ---------- */
  part4("standards", function (ctx) {
    var list = ctx.published, cs = ctx.catalog;
    var form = function (p) { var x = P.std(p.id); return x ? P.clean(x.form) : ""; };
    var dose = function (p) { var x = P.std(p.id); return x ? x.key + (x.serving ? " per " + x.serving : "") : p.subtitle; };
    var rows = function (fn) { return '<ul class="p4-facts">' + list.map(function (p) { var v = fn(p); return v ? '<li style="' + ctx.capStyle(p) + '"><i class="p4-dot" aria-hidden="true"></i><a href="' + P.href(p) + '">' + esc(p.name) + "</a>" + lead() + "<span>" + esc(v) + "</span></li>" : ""; }).join("") + "</ul>"; };
    var rule = function (i, title, text, body) { return '<section class="p4-rule" style="' + ctx.capStyle(cs[(i * 2) % cs.length] || list[0]) + '"><div class="p4-wrap p4-two"><div>' + k("Rule " + (i + 1) + " of 4") + "<h2>" + title + "</h2><p>" + text + "</p></div><div>" + body + "</div></div></section>"; };
    return '<div class="p4-standards">' + head({ k: "Our standard", title: "One uncompromising standard.", lede: "Four rules, every bottle. Here is what that means in practice." }) +
      rule(0, "Right form.", "We choose the form of each ingredient first, then name it on the label. Form decides what you are actually taking.", rows(form)) +
      rule(1, "Exact dose, stated.", "The amount in every serving is printed on the label and on this site.", rows(dose)) +
      rule(2, "Every lot tested.", "GMP-certified production and third-party testing for all seven. Every lot carries its own number.",
        '<ul class="p4-status"><li>' + tag("In place") + "GMP-certified production for all seven</li><li>" + tag("In place") + "Third-party testing for every product</li><li>" + tag("In place") + "A lot number printed on every pack</li><li>" + tag("Coming") + 'Certificates and lot reports published on this site</li></ul><a class="p4-link" href="/reports">Look up your lot</a>') +
      rule(3, "Nothing hidden.", "Full ingredients, nutrition, directions, storage and cautions for every product, on the pack and on its page here. No proprietary blends.", rows(function (p) { return "Read the label"; })) +
      '<p class="p4-wrap p4-fine">Body Café Co. · FSSAI Lic. No. 10726994000121</p></div>';
  });

  /* ---------- Story ---------- */
  function storyPage(ctx) {
    var list = ctx.published, pick = list[2] || list[0];
    return '<article class="p4-story">' + head({ k: "Our story", title: "You should always know what you’re being served." }) +
      // The opener: twelve seconds of dawn on water (owner's footage, 4 Nov 2026), muted; a still under reduced motion.
      '<figure class="p4-story-film"><video class="p4-film" muted loop playsinline autoplay preload="metadata" poster="/web/media/e/story-dawn.jpg" aria-hidden="true"><source src="/web/media/e/story-dawn.mp4" type="video/mp4"></video></figure>' +
      '<div class="p4-wrap p4-two p4-essay"><div>' + k("Seven, and only seven") + '</div><div><p class="p4-lead-p">A good café shows you the menu. So do we.</p>' +
      "<h2>The front of the label shouts. The back whispers.</h2><p>Most supplement labels lead with promises and leave the facts in small print: which form the ingredient is in, how much you actually get, and when to take it. We turned that around.</p>" +
      "<h2>Seven, and only seven.</h2><p>We make seven supplements. Each one is an everyday essential, and each one is made the same way. A small range lets us hold every product to the same standard, and say exactly what is in it.</p>" +
      "<h2>One colour each.</h2><p>Every product has its own cap colour, so you can tell them apart at a glance: on a shelf, in a bag, or half-awake in the morning.</p>" +
      '<div class="p4-cta"><a class="p4-btn" href="/shop">See the menu</a><a class="p4-link" href="/standards">Our standard</a></div></div></div>' +
      '<div class="p4-wrap">' + menu(ctx, list, { noAdd: true }) + "</div></article>";
  }
  part4("story", storyPage);
  part4("about", storyPage);

  var LEARN_BASE = S.themes.e.learn;
  part4("learn", function (ctx, seg) {
    if (seg) return LEARN_BASE.apply(this, arguments);
    var guides = [["/learn/reading-a-label", "Read a label with confidence", "Serving sizes, ingredient names and the other details on a pack."], ["/learn/ingredient-forms", "Why ingredient forms matter", "Why the full ingredient name matters when you compare products."], ["/learn/understanding-reports", "What a lot record shows", "The difference between a product, a lot and a tested sample."]];
    var row = function (href, t, text, style) { return '<li class="p4-row"' + (style ? ' style="' + style + '"' : "") + '><a href="' + href + '"><span class="p4-row-t">' + t + "</span>" + lead() + '<span class="p4-row-go">Read</span></a><span class="p4-row-text">' + text + "</span></li>"; };
    return '<div class="p4-learn">' + head({ k: "Learn", title: "Read the label. Know the form." }) + '<div class="p4-wrap p4-two"><div>' + k("One guide for each") + '</div><ul class="p4-rows">' + ctx.published.map(function (p) { return row("/learn/" + p.id, esc(p.name), esc(P.copy(p.id).headline || p.subtitle || ""), ctx.capStyle(p)); }).join("") + "</ul></div>" +
      '<div class="p4-wrap p4-two"><div>' + k("Reading any label") + '</div><ul class="p4-rows">' + guides.map(function (g) { return row(g[0], g[1], g[2]); }).join("") + "</ul></div></div>";
  });

  var HELP_BASE = S.themes.e.help;
  part4("help", function (ctx) {
    if (ctx.path !== "/help") return HELP_BASE.apply(this, arguments);
    var C = window.BCCSupportContent || {}, cats = C.CATEGORIES || [], cs = ctx.catalog;
    var faqs = (ctx.faqs || []).filter(function (f) { return !P.MAKER.test(f[1]); });
    var quick = [["/account", "Track an order", "See where your order is"], ["/help/returns/something-wrong", "Report an issue", "Damaged, wrong, missing or late"], ["/reports", "Look up a lot", "The record for your pack"], ["/contact", "Talk to us", "care@bodycafeco.com"]];
    return '<div class="p4-help">' + head({ k: "Help", title: "How can we help?" }) +
      '<ul class="p4-tiles">' + quick.map(function (q, i) { return '<li style="' + ctx.capStyle(cs[(i * 2) % cs.length] || cs[0]) + '"><a href="' + q[0] + '"><strong>' + q[1] + "</strong><span>" + q[2] + "</span></a></li>"; }).join("") + "</ul>" +
      (cats.length ? '<div class="p4-wrap p4-two"><div>' + k("Topics") + '</div><ul class="p4-rows">' + cats.map(function (c) { return '<li class="p4-row"><a href="/help/' + c.id + '"><span class="p4-row-t">' + esc(c.title) + "</span>" + lead() + '<span class="p4-row-go">Open</span></a><span class="p4-row-text">' + esc(c.blurb) + "</span></li>"; }).join("") + "</ul></div>" : "") +
      (faqs.length ? '<div class="p4-wrap p4-two"><div>' + k("House notes") + "</div>" + notes(faqs) + "</div>" : "") +
      '<p class="p4-wrap p4-fine">Still stuck? Email <a href="mailto:care@bodycafeco.com">care@bodycafeco.com</a> or message <a href="https://wa.me/919274248974">+91 92742 48974</a> on WhatsApp.</p></div>';
  });

  /* ---------- Reports: the order ticket, full page ---------- */
  part4("reports", function (ctx) {
    var pid = ctx.product(ctx.query.get("product")) ? ctx.query.get("product") : (ctx.published[0] || ctx.catalog[0]).id, cur = ctx.product(pid) || ctx.catalog[0];
    var picker = '<div class="p4-capick report-product-picker" role="group" aria-label="Choose your product">' + ctx.catalog.map(function (p) {
      return '<button type="button" style="' + ctx.capStyle(p) + '" class="' + (p.id === pid ? "selected" : "") + '" data-report-product="' + p.id + '" aria-pressed="' + (p.id === pid) + '">' + esc(p.name) + "</button>";
    }).join("") + "</div>";
    return '<div class="p4-reports report-page" style="' + ctx.capStyle(cur) + '">' + head({ k: "Lot record", title: "Look up your lot." }) +
      lotBlock(ctx, cur, { id: "p4-rep", title: "Every bottle has a number.", text: "Pick your product, then type the lot number printed on the pack. It is not your order number or the barcode.", form: picker + ctx.forms.reportForm(pid, ctx.query.get("lot")) }) +
      '<div class="p4-wrap p4-two"><div>' + k("What a record shows") + '</div><ul class="p4-dash"><li>The product and the lot it belongs to.</li><li>What was tested on a sample from that lot, and how.</li><li>The result, with its units and limits.</li><li>A record describes a tested sample from one lot. It does not promise a health outcome.</li></ul></div></div>';
  });

  /* ---------- 404 ---------- */
  part4("notFound", function (ctx) {
    if (/^\/super-sevens\/?$/.test(ctx.path)) return shopPage(ctx, "Meet the seven.");
    return '<div class="p4-404"><section class="p4-404-block">' + k("Page not found") + "<h1>Not on the menu.</h1><p>The page you were looking for isn’t served here. The seven are.</p>" +
      '<div class="p4-cta"><a class="p4-btn p4-btn-paper" href="/shop">See the menu</a><a class="p4-link" href="/help">Help</a></div></section></div>';
  });

  /* ---------- Behaviour ---------- */
  function mountHero(hero, signal) {
    var picks = [].slice.call(hero.querySelectorAll("[data-p4-pick]")), stills = [].slice.call(hero.querySelectorAll(".p4-hero-still"));
    var name = hero.querySelector("[data-p4-hero-name]"), fact = hero.querySelector("[data-p4-hero-fact]"), link = hero.querySelector("[data-p4-hero-link]");
    var cur = 0, timer = 0;
    function show(i) {
      var b = picks[i]; if (!b) return; cur = i;
      hero.style.setProperty("--cap", b.style.getPropertyValue("--cap")); hero.style.setProperty("--on-cap", b.style.getPropertyValue("--on-cap"));
      stills.forEach(function (s, kk) { s.classList.toggle("is-on", kk === i); });
      picks.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      name.textContent = b.dataset.name; fact.textContent = b.dataset.fact; link.href = b.dataset.href;
    }
    function stop() { clearInterval(timer); timer = 0; }
    picks.forEach(function (b, i) {
      b.addEventListener("click", function () { stop(); show(i); }, { signal: signal });
      b.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { stop(); show(i); } }, { signal: signal });
      b.addEventListener("focus", function () { stop(); show(i); }, { signal: signal });
    });
    if (!still()) timer = setInterval(function () { if (!document.hidden) show((cur + 1) % picks.length); }, 4200);
    if (signal) signal.addEventListener("abort", stop);
  }
  // Hovering a menu line colours the section and shows that bottle behind the list.
  function mountMenu(sec, signal) {
    var lines = [].slice.call(sec.querySelectorAll(".p4-line")), stills = [].slice.call(sec.querySelectorAll(".p4-menu-still"));
    lines.forEach(function (li, i) {
      var hot = function () { sec.style.setProperty("--hc", li.style.getPropertyValue("--cap")); sec.style.setProperty("--on-hc", li.style.getPropertyValue("--on-cap")); sec.classList.add("is-hot"); stills.forEach(function (s, kk) { s.classList.toggle("is-on", kk === i); }); };
      li.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") hot(); }, { signal: signal });
      li.addEventListener("focusin", hot, { signal: signal });
    });
    var cool = function () { sec.classList.remove("is-hot"); stills.forEach(function (s) { s.classList.remove("is-on"); }); };
    var ol = sec.querySelector("[data-p4-menu]"); if (ol) { ol.addEventListener("pointerleave", cool, { signal: signal }); ol.addEventListener("focusout", function (e) { if (!ol.contains(e.relatedTarget)) cool(); }, { signal: signal }); }
  }
  L.onEnhance(function (main, signal) {
    if (!on()) return;
    document.addEventListener("click", function (e) { var b = e.target.closest("[data-p4-service]"); if (b) apply(b.dataset.p4Service, true); }, { signal: signal });
    apply(document.body.dataset.p4Service || current());
    var hero = main.querySelector("[data-p4-hero]"); if (hero) mountHero(hero, signal);
    main.querySelectorAll("[data-p4-menusec]").forEach(function (s) { mountMenu(s, signal); });
    main.querySelectorAll("[data-p4-notes]").forEach(function (box) {
      box.addEventListener("toggle", function (e) { if (e.target.open) box.querySelectorAll("details[open]").forEach(function (d) { if (d !== e.target) d.open = false; }); }, { capture: true, signal: signal });
    });
    // The lot block takes the colour of the cap you pick.
    main.querySelectorAll("[data-p4-lotblock]").forEach(function (block) {
      var sec = block.closest(".p4-lotsec");
      sec.querySelectorAll("[data-p2-lotpick], [data-report-product]").forEach(function (b) {
        b.addEventListener("click", function () { block.style.setProperty("--cap", b.style.getPropertyValue("--cap")); block.style.setProperty("--on-cap", b.style.getPropertyValue("--on-cap")); }, { signal: signal });
      });
    });
    // Lines rise in once.
    if (!("IntersectionObserver" in window) || still()) return;
    var els = main.querySelectorAll(".p4-line, .p4-std-lines li, .p4-regs-row li, .p4-sec-head, .p4-rule, .p4-tiles li");
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el, i) { el.classList.add("p4-rise"); el.style.setProperty("--d", (i % 7) * 45 + "ms"); io.observe(el); });
    if (signal) signal.addEventListener("abort", function () { io.disconnect(); });
  });
})();
