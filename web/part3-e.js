/* Body Café Co. — Variant E Part 3 · minimal, colour-led (started 4 Nov 2026).
   Only active when body[data-variant-e-part="3"]. Builds on the Part 2 layer (web/part2-e.js): shares its chrome, inner pages
   and turning bottles, and replaces the home page and product page with quieter compositions.
   Rules: the caps and bottles carry the creativity; editorial images are used sparingly (one per product page, one on Story);
   no section that does not help someone choose, trust or buy. No manufacturer names. No segment numerals. */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE, P = window.BCCPart2E;
  if (!S || !S.themes || !S.themes.e || !L || !P) return;
  var esc = L.esc;

  function on() { return document.body.dataset.variantEPart === "3"; }
  function part3(name, fn) {
    var base = S.themes.e[name];
    if (typeof base !== "function") return;
    L.replace(name, function () { return on() ? fn.apply(this, arguments) : base.apply(this, arguments); });
  }
  function trim(name, fn) { L.wrap(name, function (root, ctx, args) { if (on()) fn(root, ctx, args); }); }
  function frag(html) { return L.frag(html); }

  /* ---------- Product cards: Variant B's homepage "Meet the collection" card, exactly (owner, 4 Nov 2026) ----------
     Markup as B renders it (site-b.js arch(), with variant-b.js's pack and availability). Styles are B's own rules, rescoped
     to Part 3 in part3-e.css under .p3-tb. The first cell of the grid holds the section head, as in B (signature-b.js). */
  var PLUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>';
  function pad2(n) { return (n < 9 ? "0" : "") + (n + 1); }
  function arch(ctx, p, i, eager) {
    var href = P.href(p), B = window.BCCBMedia, ok = L.avail(p), fmt = String(ctx.format[p.id] || "");
    var img = B && B.img ? B.img(p, { alt: "", eager: eager }) : '<img src="/web/media/bottles-normalized/' + esc(p.id) + '.svg" alt="" width="720" height="1040" decoding="async"' + (eager ? ' fetchpriority="high"' : ' loading="lazy"') + ">";
    var second = B && B.secondary ? B.secondary(p) : null;
    if (second) img += '<img class="bx-second" src="' + esc(second.src) + '" alt="" width="' + (second.w || 1000) + '" height="' + (second.h || 1000) + '" loading="lazy" decoding="async">';
    return '<article class="tb-arch" data-p2-format="' + P.formatGroup(ctx, p) + '" style="' + ctx.capStyle(p) + '"><a class="tb-arch-photo" href="' + href + '" tabindex="-1" aria-hidden="true">' + img + '<span class="tb-arch-no">' + pad2(i) + "</span></a>" +
      '<span class="tb-sku" aria-hidden="true"></span><h3><a href="' + href + '">' + esc(p.name) + '</a></h3><p class="tb-arch-sub">' + esc(p.subtitle || "") + "</p>" +
      '<p class="tb-arch-format">' + (fmt ? '<span class="tb-pill ">' + esc(fmt) + "</span>" : "") + (p.pack_size ? '<span class="bx-pack">' + esc(p.pack_size) + "</span>" : "") + "</p>" +
      '<div class="tb-arch-foot"><p><strong>' + ctx.money(p.price) + '</strong> <small>MRP</small><span class="bx-avail" data-state="' + (ok ? "in" : "out") + '">' + (ok ? "In stock" : "Out of stock") + "</span></p>" +
      '<button type="button" class="tb-add" data-add="' + esc(p.id) + '" aria-label="Add ' + esc(p.name) + ' to bag"' + (ok ? "" : " disabled") + ">" + PLUS + "<span>Add</span></button></div></article>";
  }
  // The collection: head cell + the seven cards, as on B's homepage. o.h1 for the Shop page; o.tools adds the format filter.
  function collection(ctx, list, o) {
    o = o || {}; var tag = o.h1 ? "h1" : "h2";
    return '<div class="p3-tb"><section class="tb-coll bzh-coll" aria-labelledby="p3-coll-t"><div class="tb-archgrid">' +
      '<div class="tb-coll-head bzh-coll-cell"><div><span class="tb-pill ">' + (o.pill || "01 — Meet the collection") + "</span><" + tag + ' id="p3-coll-t" class="tb-big">Seven essentials.<br> <em>Which is your thing?</em></' + tag + ">" + (o.tools || "") + "</div>" +
      "<p>Different essentials. The same clear approach.<small>Seven products · one-time purchases</small></p></div>" +
      list.map(function (p, i) { return arch(ctx, p, i, i < 3); }).join("") + "</div></section></div>";
  }

  function reviewCarousel(ctx) {
    var all = P.reviewsFor(); if (!all.length) return "";
    var card = function (r, hidden) {
      var p = ctx.product(r[0]); if (!p) return "";
      return '<li class="p3-rcard" style="--cap:' + esc(p.color) + '"' + (hidden ? ' aria-hidden="true"' : "") + '><div class="p3-rcard-top">' + P.stars(r[1]) + '<span class="p2-sample">Sample</span></div>' +
        '<p class="p3-rcard-title">' + esc(r[2]) + '</p><blockquote><p>“' + esc(r[3]) + '”</p></blockquote>' +
        '<div class="p3-rcard-foot"><span class="p3-rcard-who"><b>' + esc(r[4]) + "</b>" + esc(r[5]) + " · " + esc(r[6]) + '</span><a href="' + P.href(p) + '"' + (hidden ? ' tabindex="-1"' : "") + ">" + P.capImg(p, "p3-rcard-cap") + "<span>" + esc(p.name) + "</span></a></div></li>";
    };
    return '<section class="p2-section p3-voices" aria-labelledby="p3-voices-t"><div class="p2-wrap"><header class="p2-sec-head"><div><p class="p2-eyebrow">Reviews</p><h2 id="p3-voices-t">In their words.</h2></div>' +
      '<div class="p3-voices-side">' + P.reviewSummary(all) + '<button type="button" class="p3-carousel-toggle" data-p3-pause aria-pressed="false">Pause</button></div></header></div>' +
      '<div class="p3-carousel" data-p3-carousel role="region" aria-label="Customer reviews" tabindex="0"><ul class="p3-carousel-track">' +
      all.map(function (r) { return card(r); }).join("") + all.map(function (r) { return card(r, true); }).join("") + "</ul></div>" +
      '<p class="p2-wrap p2-fine">' + P.REVIEW_RULE + "</p></section>";
  }

  /* ---------- Home: hero → claims → products → transparency → lot record → reviews → FAQ (same flow as Part 2, quieter) ---------- */
  part3("home", function (ctx) {
    var list = ctx.published, first = list[0], cs = ctx.catalog;
    if (!first) return P.head({ title: "The seven are resting." });
    return '<div class="p3-home">' +
      /* 1 · Hero: lift a cap. Every bottle rests on the shelf until you hover one (owner, 4 Nov 2026); the stage stays neutral till then. */
      '<section class="p3-hero" data-p3-hero style="--hc:' + REST + '" aria-labelledby="p3-hero-t">' +
      '<div class="p2-wrap p3-hero-head"><p class="p2-eyebrow">The Super Sevens</p><h1 id="p3-hero-t">Seven supplements.<br><span>One uncompromising standard.</span></h1></div>' +
      '<div class="p3-shelf" aria-label="The seven">' + list.map(function (p, i) {
        return '<a class="p3-bottle" href="' + P.href(p) + '" data-p3-i="' + i + '" data-name="' + esc(p.name) + '" data-fact="' + P.fact(ctx, p) + '" data-price="' + ctx.money(p.price) + '" data-color="' + esc(p.color) + '" style="--cap:' + esc(p.color) + '">' +
          P.bottle(p, { alt: p.name, eager: true }) + "</a>";
      }).join("") + "</div>" +
      '<div class="p2-wrap p3-hero-foot"><a class="p3-now is-rest" href="/shop" data-p3-now><i class="p2-dot" aria-hidden="true"></i><strong data-p3-name>The seven</strong><span data-p3-fact>Hover over a bottle to lift it.</span><span class="p3-now-price" data-p3-price></span></a>' +
      '<div class="p2-actions p2-actions-left"><a class="p2-btn" href="/shop">Shop the seven</a><a class="p2-link" href="/standards">Our standard</a></div></div></section>' +

      /* 2 · Trust claims: one quiet line */
      '<div class="p2-wrap"><ul class="p3-claims" aria-label="Our assurances">' + P.CLAIMS.map(function (c, i) { return '<li><i style="--cap:' + esc((cs[i] || {}).color || "#999") + '"></i>' + c + "</li>"; }).join("") + "</ul></div>" +

      /* 3 · Products: Variant B's collection */
      collection(ctx, list) +

      /* 4 · Transparency: the standard in one sentence, and where each rule stands */
      '<section class="p2-section p3-standard" aria-labelledby="p3-std-t"><div class="p2-wrap"><p class="p2-eyebrow">Transparency</p>' +
      '<h2 id="p3-std-t" class="p3-statement">' + P.PROOF.map(function (r, i) { return '<span style="--cap:' + esc((cs[(i * 2) % cs.length] || {}).color || "#999") + '">' + r[0] + ".</span>"; }).join(" ") + "</h2>" +
      '<ol class="p3-std-notes">' + P.PROOF.map(function (r) { return '<li><b class="p3-tag ' + (r[2] === "In place" ? "is-done" : "is-soon") + '">' + r[2] + "</b><strong>" + r[0] + "</strong><p>" + r[1] + "</p></li>"; }).join("") + "</ol>" +
      '<a class="p2-link p3-std-link" href="/standards">Read our standard</a></div></section>' +

      /* 5 · Lot record */
      '<section class="p2-section p3-lot" aria-labelledby="p3-lot-t"><div class="p2-wrap p3-lot-in"><div><p class="p2-eyebrow">Lot record</p><h2 id="p3-lot-t">Every bottle carries a lot number.</h2><p>Pick your product by its cap, then type the number printed on the pack.</p></div>' + P.lotForm(ctx) + "</div></section>" +

      /* 6 · Reviews: an auto-scrolling carousel (pauses on hover, focus or the button; swipeable under reduced motion) */
      reviewCarousel(ctx) +

      /* 7 · FAQ */
      '<section class="p2-section p3-faq" aria-labelledby="p3-faq-t"><div class="p2-wrap p2-faq-in"><header><p class="p2-eyebrow">Good to know</p><h2 id="p3-faq-t">Questions, answered.</h2><a class="p2-link" href="/help">Visit Help</a></header>' +
      '<div class="p2-accs">' + P.homeFaqs().map(function (f) { return P.acc(esc(f[0]), P.para(f[1])); }).join("") + "</div></div></section>" +
      "</div>";
  });

  /* Lift a cap: nothing is lifted until you hover (or focus) a bottle; then it rises and the stage takes its colour.
     The last one you chose stays up. */
  var REST = "#8f8a82";
  function mountShelf(hero, signal) {
    var items = [].slice.call(hero.querySelectorAll("[data-p3-i]")), now = hero.querySelector("[data-p3-now]");
    if (!matchMedia("(hover: hover)").matches) now.querySelector("[data-p3-fact]").textContent = "Tap a bottle to see it.";
    function lift(i) {
      var b = items[i]; if (!b) return;
      now.classList.remove("is-rest");
      items.forEach(function (x) { if (x === b) x.setAttribute("aria-current", "true"); else x.removeAttribute("aria-current"); });
      hero.style.setProperty("--hc", b.dataset.color);
      now.href = b.getAttribute("href");
      now.querySelector("[data-p3-name]").textContent = b.dataset.name;
      now.querySelector("[data-p3-fact]").textContent = b.dataset.fact;
      now.querySelector("[data-p3-price]").textContent = b.dataset.price;
    }
    items.forEach(function (b, i) {
      b.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") lift(i); }, { signal: signal });
      b.addEventListener("focus", function () { lift(i); }, { signal: signal });
    });
  }

  /* ---------- Product page: the shared 8 blocks, with one stage instead of a gallery and caps for the other six ---------- */
  trim("product", function (root, ctx, args) {
    var p = args && args[0], art = root.querySelector(".p2-pdp"); if (!art || !p) return;
    art.classList.add("p3-pdp");
    var gal = art.querySelector(".p2-gallery"), sp = gal && gal.querySelector("[data-p2-spin]");
    if (gal && sp) {
      var stage = frag('<div class="p3-stage"><span class="p3-stage-disc" aria-hidden="true"></span><p class="p2-hint" aria-hidden="true">Drag to turn</p></div>').firstElementChild;
      stage.insertBefore(sp, stage.lastElementChild);
      gal.replaceChildren(stage);
    }
    var others = art.querySelector(".p2-others");
    if (others) {
      var sibs = ctx.published.filter(function (x) { return x.id !== p.id; });
      others.replaceWith(frag('<nav class="p2-wrap p3-sibs" aria-label="The rest of the seven"><p class="p2-eyebrow">The rest of the seven</p><ul>' +
        sibs.map(function (o) { return '<li><a href="' + P.href(o) + '" style="--cap:' + esc(o.color) + '">' + P.capImg(o) + "<span>" + esc(o.name) + "</span></a></li>"; }).join("") + "</ul></nav>"));
    }
  });

  /* ---------- Shared pieces for Part 3 pages ---------- */
  function head(o) {
    return '<header class="p2-wrap p3-head">' + (o.eyebrow ? '<p class="p2-eyebrow">' + o.eyebrow + "</p>" : "") + "<h1>" + o.title + "</h1>" + (o.lede ? '<p class="p2-lede">' + o.lede + "</p>" : "") + (o.extra || "") + "</header>";
  }
  function arrowRow(href, title, text, lead) {
    return '<li><a class="p3-line" href="' + href + '">' + (lead || "") + '<span class="p3-line-title">' + title + '</span><span class="p3-line-text">' + (text || "") + '</span><span class="p3-line-go" aria-hidden="true">→</span></a></li>';
  }
  function block(o, body) {
    return '<section class="p2-wrap p3-block' + (o.cls ? " " + o.cls : "") + '"' + (o.id ? ' id="' + o.id + '"' : "") + '><header class="p3-block-head">' + (o.eyebrow ? '<p class="p2-eyebrow">' + o.eyebrow + "</p>" : "") + "<h2>" + o.title + "</h2>" + (o.note ? "<p>" + o.note + "</p>" : "") + "</header>" + body + "</section>";
  }
  function capOf(ctx, i) { var cs = ctx.catalog; return cs[i % cs.length]; }

  /* ---------- Shop: one grid, a colour disc behind each bottle; the eighth cell holds the standard ---------- */
  function shopPage(ctx, title) {
    var list = ctx.published, groups = ["Capsules", "Softgels", "Chews"].filter(function (g) { return list.some(function (p) { return P.formatGroup(ctx, p) === g; }); });
    var n = function (g) { return list.filter(function (p) { return P.formatGroup(ctx, p) === g; }).length; };
    var tabs = '<div class="p3-tabs" role="group" aria-label="Filter by format"><button type="button" data-p2-filter="" aria-pressed="true">All <sup>' + list.length + "</sup></button>" +
      groups.map(function (g) { return '<button type="button" data-p2-filter="' + g + '" aria-pressed="false">' + g + " <sup>" + n(g) + "</sup></button>"; }).join("") + "</div>";
    return '<div class="p3-shop">' + collection(ctx, list, { h1: true, pill: title || "Shop · The collection", tools: tabs }) +
      '<p class="p2-wrap p3-fine">MRP, inclusive of all taxes. Delivery is free on orders of ₹1,499 or more.</p></div>';
  }
  part3("shop", function (ctx) { return shopPage(ctx); });

  /* ---------- Our standard: four rules, each marked by a cap, each shown across the seven ---------- */
  part3("standards", function (ctx) {
    var list = ctx.published;
    var rows = function (fn) { return '<ul class="p3-facts">' + list.map(function (p) { var v = fn(p); return v ? '<li><a href="' + P.href(p) + '"><i class="p2-dot" style="--cap:' + esc(p.color) + '"></i>' + esc(p.name) + "</a><span>" + esc(v) + "</span></li>" : ""; }).join("") + "</ul>"; };
    var form = function (p) { var x = P.std(p.id); return x ? P.clean(x.form) : ""; };
    var dose = function (p) { var x = P.std(p.id); return x ? x.key + (x.serving ? " · " + x.serving : "") : p.subtitle; };
    var rule = function (i, id, title, text, body) {
      return '<section class="p3-rule" id="' + id + '" style="--cap:' + esc(capOf(ctx, i * 2).color) + '"><div class="p3-rule-head">' + P.capImg(capOf(ctx, i * 2), "p3-rule-cap") + "<h2>" + title + "</h2><p>" + text + "</p></div>" + body + "</section>";
    };
    return '<div class="p3-standards">' + head({ eyebrow: "Our standard", title: "Four rules.<br> Every bottle.", lede: "Seven supplements, made to one uncompromising standard. Here is what that means in practice." }) +
      '<div class="p2-wrap">' +
      rule(0, "form", "Right form.", "We choose the form of each ingredient first, then name it on the label. Form decides what you are actually taking.", rows(form)) +
      rule(1, "dose", "Exact dose, stated.", "The amount in every serving is printed on the label and on this site. Where two ingredients work together, you see both numbers.", rows(dose)) +
      rule(2, "tested", "Every lot tested.", "GMP-certified production and third-party testing for all seven. Every lot carries its own number.",
        '<ul class="p3-status"><li><b class="is-done">In place</b>GMP-certified production for all seven</li><li><b class="is-done">In place</b>Third-party testing for every product</li><li><b class="is-done">In place</b>A lot number printed on every pack</li><li><b class="is-soon">Coming</b>Certificates and lot reports published on this site</li></ul><a class="p2-link" href="/reports">Look up your lot</a>') +
      rule(3, "hidden", "Nothing hidden.", "Full ingredients, nutrition, directions, storage and cautions for every product, on the pack and on its page here. No proprietary blends.",
        '<ul class="p3-lines">' + list.map(function (p) { return arrowRow(P.href(p), esc(p.name), "Read the label", '<i class="p2-dot" style="--cap:' + esc(p.color) + '"></i>'); }).join("") + "</ul>") +
      '<p class="p3-fine">Body Café Co. · FSSAI Lic. No. 10726994000121</p></div></div>';
  });

  /* ---------- Story: a short essay, the seven as one colour bar, one image ---------- */
  function storyPage(ctx) {
    var list = ctx.published;
    return '<article class="p3-story"><header class="p2-wrap p3-head p3-story-head"><p class="p2-eyebrow">Our story</p><h1>You should always know what you’re being served.</h1></header>' +
      '<div class="p2-wrap"><div class="p3-bar" aria-hidden="true">' + list.map(function (p) { return '<i style="--cap:' + esc(p.color) + '"></i>'; }).join("") + "</div></div>" +
      '<div class="p2-wrap p3-essay"><p class="p3-lead">A good café shows you the menu. So do we.</p>' +
      "<h2>The front of the label shouts. The back whispers.</h2><p>Most supplement labels lead with promises and leave the facts in small print: which form the ingredient is in, how much you actually get, and when to take it. We turned that around.</p>" +
      "<h2>Seven, and only seven.</h2><p>We make seven supplements. Each one is an everyday essential, and each one is made the same way. A small range lets us hold every product to the same standard, and say exactly what is in it.</p>" +
      '<blockquote class="p3-quote">Name the form. State the amount. Make the routine obvious. Test every lot.</blockquote>' +
      '<h2>One colour each.</h2><p>Every product has its own cap colour, so you can tell them apart at a glance: on a shelf, in a bag, or half-awake in the morning.</p>' +
      '<ul class="p3-capset">' + list.map(function (p) { return '<li><a href="' + P.href(p) + '" style="--cap:' + esc(p.color) + '">' + P.capImg(p) + "<span>" + esc(p.name) + "</span></a></li>"; }).join("") + "</ul></div>" +
      '<figure class="p2-wrap p3-figure">' + (P.scene("story-seven", { alt: "The seven bottles from above" }) || P.FILM) + "</figure>" +
      '<div class="p2-wrap p3-essay p3-essay-end"><div class="p2-actions p2-actions-left"><a class="p2-btn" href="/shop">Shop the seven</a><a class="p2-link" href="/standards">Our standard</a></div></div></article>';
  }
  part3("story", storyPage);
  part3("about", storyPage);

  var LEARN_BASE = S.themes.e.learn;
  /* ---------- Learn (index): two quiet lists ---------- */
  part3("learn", function (ctx, seg) {
    if (seg) return LEARN_BASE.apply(this, arguments);
    var guides = [["/learn/reading-a-label", "Read a label with confidence", "Serving sizes, ingredient names and the other details on a pack."], ["/learn/ingredient-forms", "Why ingredient forms matter", "Why the full ingredient name matters when you compare products."], ["/learn/understanding-reports", "What a lot record shows", "The difference between a product, a lot and a tested sample."]];
    return '<div class="p3-learn">' + head({ eyebrow: "Learn", title: "Read the label.<br> Know the form.", lede: "Short, plain guides to the seven, and to reading any supplement label." }) +
      block({ eyebrow: "The seven", title: "One guide for each." }, '<ul class="p3-lines">' + ctx.published.map(function (p) { return arrowRow("/learn/" + p.id, esc(p.name), esc(P.copy(p.id).headline || p.subtitle || ""), P.capImg(p, "p3-line-cap")); }).join("") + "</ul>") +
      block({ eyebrow: "Guides", title: "Reading any label." }, '<ul class="p3-lines">' + guides.map(function (g) { return arrowRow(g[0], g[1], g[2]); }).join("") + "</ul>") + "</div>";
  });

  /* ---------- Help (index): four ways in, topics, common questions ---------- */
  var HELP_BASE = S.themes.e.help;
  part3("help", function (ctx) {
    if (ctx.path !== "/help") return HELP_BASE.apply(this, arguments);
    var C = window.BCCSupportContent || {}, cats = C.CATEGORIES || [], arts = C.ARTICLES || [];
    var faqs = (ctx.faqs || []).filter(function (f) { return !P.MAKER.test(f[1]); });
    var quick = [["/account", "Track an order", "See where your order is"], ["/help/returns/something-wrong", "Report an issue", "Damaged, wrong, missing or late"], ["/reports", "Look up a lot", "The record for your pack"], ["/contact", "Talk to us", "care@bodycafeco.com"]];
    return '<div class="p3-help">' + head({ eyebrow: "Help", title: "How can we help?", lede: "Answers to common questions, and a real person when you need one." }) +
      '<div class="p2-wrap"><ul class="p3-quick">' + quick.map(function (q, i) { return '<li style="--cap:' + esc(capOf(ctx, i * 2).color) + '"><a href="' + q[0] + '"><i class="p2-dot"></i><strong>' + q[1] + "</strong><span>" + q[2] + "</span></a></li>"; }).join("") + "</ul></div>" +
      (cats.length ? block({ eyebrow: "Topics", title: "Browse by topic." }, '<ul class="p3-lines">' + cats.map(function (c) { return arrowRow("/help/" + c.id, esc(c.title), esc(c.blurb)); }).join("") + "</ul>") : "") +
      (faqs.length ? block({ eyebrow: "Good to know", title: "Before you order." }, '<div class="p2-accs">' + faqs.map(function (f) { return P.acc(esc(f[0]), P.para(f[1])); }).join("") + "</div>") : "") +
      '<p class="p2-wrap p3-fine">Still stuck? Email <a href="mailto:care@bodycafeco.com">care@bodycafeco.com</a> or message <a href="https://wa.me/919274248974">+91 92742 48974</a> on WhatsApp.</p></div>';
  });

  /* ---------- Lot lookup: choose by cap, type the number ---------- */
  part3("reports", function (ctx) {
    var pid = ctx.product(ctx.query.get("product")) ? ctx.query.get("product") : (ctx.published[0] || ctx.catalog[0]).id, cur = ctx.product(pid);
    var picker = '<div class="p3-capick report-product-picker" role="group" aria-label="Choose your product">' + ctx.catalog.map(function (p) {
      return '<button type="button" style="' + ctx.capStyle(p) + '" class="' + (p.id === pid ? "selected" : "") + '" data-report-product="' + p.id + '" aria-pressed="' + (p.id === pid) + '">' + P.capImg(p) + "<span>" + esc(p.name) + "</span></button>";
    }).join("") + "</div>";
    return '<div class="p3-reports report-page" style="' + (cur ? ctx.capStyle(cur) : "") + '">' + head({ eyebrow: "Lot record", title: "Look up your lot.", lede: "Pick your product by its cap, then type the lot number printed on the pack." }) +
      '<div class="p2-wrap p3-rep"><p class="p2-step">Your product</p>' + picker + '<p class="p2-step">Lot number</p><div class="p3-rep-form">' + ctx.forms.reportForm(pid, ctx.query.get("lot")) + "</div>" +
      '<div class="p2-accs p3-rep-more">' + P.acc("What a lot record shows", "<p>The product and the lot it belongs to, what was tested on a sample from that lot and how, and the result with its units and limits.</p><p>A record describes a tested sample from one lot. It does not promise a health outcome.</p>") +
      P.acc("Where is the lot number?", "<p>It is printed on the pack, separate from the barcode. It is not your order number.</p>") + "</div></div></div>";
  });

  /* ---------- 404: one cap rolled away ---------- */
  part3("notFound", function (ctx) {
    if (/^\/super-sevens\/?$/.test(ctx.path)) return shopPage(ctx, "Meet the seven.");
    var list = ctx.catalog, gone = 3;
    return '<div class="p3-404">' + head({ eyebrow: "Page not found", title: "One of the seven<br> rolled away.", lede: "The page you were looking for isn’t here. The rest of the seven are." }) +
      '<div class="p2-wrap"><div class="p3-lost" aria-hidden="true">' + list.map(function (p, i) { return i === gone ? '<span class="p3-lost-gap"></span>' : '<span>' + P.capImg(p) + "</span>"; }).join("") + '<span class="p3-lost-roll">' + (list[gone] ? P.capImg(list[gone]) : "") + "</span></div>" +
      '<div class="p2-actions p2-actions-left"><a class="p2-btn" href="/shop">Shop the seven</a><a class="p2-link" href="/help">Help</a></div></div></div>';
  });

  L.onEnhance(function (main, signal) {
    if (!on()) return;
    var hero = main.querySelector("[data-p3-hero]"); if (hero) mountShelf(hero, signal);
    var btn = main.querySelector("[data-p3-pause]"), car = main.querySelector("[data-p3-carousel]");
    if (btn && car) btn.addEventListener("click", function () {
      var paused = car.classList.toggle("is-paused");
      btn.setAttribute("aria-pressed", String(paused)); btn.textContent = paused ? "Play" : "Pause";
    }, { signal: signal });
  });
})();
