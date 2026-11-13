/* Body Café Co. — Variant E Part 2 · inner pages (12 Nov 2026).
   Our standard, Learn, Story, Help, Look up a lot, and the finishing touches on the bag, checkout and sign-in, drawn in the
   language of the Part 2 home, shop and product pages: cream paper, a disc in the cap colour with the bottle inside it, the
   seven real caps as selectors, cap-tinted cards and the indigo band.
   Only active when body[data-variant-e-part="2"] (Part 2 and its Content Focus copy); Parts 3 and 4 keep the shared pages
   from web/part2-e.js. Styles: web/part2-pages-e.css.
   Copy: the sentences are Part 2's own, kept whole, because web/content-focus-e.js swaps them by exact text and reads
   .p2-std-status, .p2-rules and .p2-actions-left. "Lot" in this file is shown as "batch" (web/batch-terms-e.js).
   Images: front renders, cap renders, the bottle stills and the cap close-ups only. No label photographs. */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE, P = window.BCCPart2E;
  if (!S || !S.themes || !S.themes.e || !L || !P) return;
  var esc = L.esc, bottle = P.bottle, capImg = P.capImg, href = P.href;
  function on2() { return document.body.dataset.variantEPart === "2"; }
  /* Same rule as onCap in app.js: brand ink or cream, black when neither reaches 4.5:1. */
  function onCap(hex) {
    var n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    var l = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2], r = function (a, b) { return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };
    if (Math.max(r(l, 0.0236), r(l, 0.925)) < 4.5) return "#000000";
    return r(l, 0.0236) >= r(l, 0.925) ? "#2d2926" : "#f8f7f3";
  }
  // Replace a page for Part 2 only; the renderer receives the page it replaces first (for sub-routes it does not draw).
  function page(name, fn) {
    var base = S.themes.e[name];
    if (typeof base !== "function") return;
    L.replace(name, function () { return on2() ? fn.apply(this, [base].concat([].slice.call(arguments))) : base.apply(this, arguments); });
  }
  function svg(d) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + "</svg>"; }
  var I = {
    arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    soon: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
    box: svg('<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>'),
    truck: svg('<path d="M2.5 6.5h11v10h-11zM13.5 10h4l3 3v3.5h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
    back: svg('<path d="M8 5 4 9l4 4"/><path d="M4 9h10a5.5 5.5 0 0 1 0 11H9"/>'),
    card: svg('<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/>'),
    user: svg('<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.6 3.5-5.5 7-5.5s6.2 1.9 7 5.5"/>'),
    bottle: svg('<path d="M8.5 3.5h7v3h-7zM7.5 6.5h9A1.5 1.5 0 0 1 18 8v11a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V8a1.5 1.5 0 0 1 1.5-1.5zM6 11.5h12M6 16h12"/>'),
    doc: svg('<path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5z"/><path d="M14 3.5v4h4M9.5 12.5h5M9.5 16h5"/>'),
    mail: svg('<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m3.5 7 8.5 6.5L20.5 7"/>'),
    alert: svg('<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2v.3"/>'),
    search: svg('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>'),
    phone: svg('<path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z"/>'),
    lock: svg('<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'),
    cancel: svg('<circle cx="12" cy="12" r="8.5"/><path d="m9 9 6 6M15 9l-6 6"/>'),
    sliders: svg('<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>'),
    pause: svg('<path d="M9 6v12M15 6v12"/>'),
    play: svg('<path d="M8 5.5v13l11-6.5z"/>'),
  };
  function ic(name, cls) { return '<span class="p2p-ic ' + (cls || "") + '" aria-hidden="true">' + I[name] + "</span>"; }
  function still(p, o) {
    o = o || {};
    return '<img src="/web/media/premium/' + esc(p.id) + '-still.webp" alt="' + esc(o.alt || "") + '" width="1196" height="1315"' + (o.eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async">';
  }
  // A disc in the cap colour with the bottles stacked inside it; one shows at a time (the home hero's circle).
  function disc(list, o) {
    o = o || {};
    var first = o.first || (list[0] && list[0].id);
    return '<span class="p2p-disc ' + (o.cls || "") + '" aria-hidden="true">' + list.map(function (p) {
      return '<span class="p2p-disc-b' + (p.id === first ? " is-on" : "") + '" data-id="' + esc(p.id) + '" data-color="' + esc(p.color) + '">' + bottle(p, { alt: "", eager: !!o.eager && p.id === first }) + "</span>";
    }).join("") + "</span>";
  }
  function hero(o) {
    return '<header class="p2p-hero ' + (o.cls || "") + '"><div class="p2-wrap p2p-hero-in"><div class="p2p-hero-copy" data-p2p-rise>' +
      (o.eyebrow ? '<p class="p2-eyebrow">' + o.eyebrow + "</p>" : "") + "<h1>" + o.title + "</h1>" + (o.lede ? '<p class="p2-lede">' + o.lede + "</p>" : "") + (o.extra || "") + "</div>" +
      (o.art ? '<div class="p2p-hero-art" data-p2p-rise>' + o.art + "</div>" : "") + "</div></header>";
  }
  function secHead(o) {
    return '<header class="p2p-sec-head" data-p2p-reveal><div>' + (o.eyebrow ? '<p class="p2-eyebrow">' + o.eyebrow + "</p>" : "") + "<h2" + (o.id ? ' id="' + o.id + '"' : "") + ">" + o.title + "</h2></div>" + (o.note ? '<p class="p2p-sec-note">' + o.note + "</p>" : "") + (o.link || "") + "</header>";
  }

  /* ---------- Our standard ---------- */
  var RULES = [
    ["form", "Right form", "We choose the form of each ingredient first, then name it on the label. Form decides what you are actually taking, so you should never have to guess it."],
    ["dose", "Exact dose, stated", "The amount in every serving is printed on the label and on this site. Where two ingredients work together, you see both numbers."],
    ["tested", "Every lot tested", "Every product is made in GMP-certified facilities and third-party tested. Every lot carries its own number, so a record can be traced to the batch in your hand."],
    ["hidden", "Nothing hidden", "Full ingredients, nutrition information, directions, storage and cautions for every product, on the pack and on its page here. No proprietary blends."],
  ];
  page("standards", function (base, ctx) {
    var list = ctx.published, first = list[0];
    if (!first) return base.apply(this, [].slice.call(arguments, 1));
    var form = function (p) { var s = P.std(p.id); return s ? P.clean(s.form) : ""; };
    var ruleHead = function (i) {
      var r = RULES[i];
      return '<div class="p2p-rule-copy" data-p2p-reveal><p class="p2p-rule-k" aria-hidden="true">' + RULES.map(function (x, k) { return '<i class="' + (k === i ? "is-on" : "") + '"></i>'; }).join("") + "</p><h2>" + r[1] + "</h2><p>" + r[2] + "</p></div>";
    };
    var chips = '<nav class="p2p-chips" aria-label="The four rules">' + RULES.map(function (r, i) { return '<a class="p2p-chip p2p-chip-' + (i + 1) + '" href="#' + r[0] + '"><i aria-hidden="true"></i>' + r[1] + "</a>"; }).join("") + "</nav>";

    var pick = '<div class="p2p-pick" data-p2p-pick data-p2p-reveal style="--cap:' + esc(first.color) + '"><div class="p2p-pick-stage">' + disc(list) + "</div>" +
      '<div class="p2p-pick-body"><div class="p2p-pick-caps" role="group" aria-label="Choose a product">' + list.map(function (p, i) {
        return '<button type="button" data-p2p-pickbtn="' + esc(p.id) + '" data-color="' + esc(p.color) + '" aria-pressed="' + (i === 0) + '" aria-label="' + esc(p.name) + '">' + capImg(p) + "</button>";
      }).join("") + '</div><div class="p2p-pick-panels" aria-live="polite">' + list.map(function (p, i) {
        return '<div class="p2p-pick-panel" data-p2p-panel="' + esc(p.id) + '"' + (i ? " hidden" : "") + '><p class="p2p-pick-name">' + esc(p.name) + '</p><p class="p2p-pick-val">' + esc(form(p)) + '</p><a class="p2-link" href="' + href(p) + '">Read the label</a></div>';
      }).join("") + "</div></div></div>";

    var doses = '<ul class="p2p-doses">' + list.map(function (p) {
      var s = P.std(p.id), key = s ? s.key : p.subtitle, serving = s ? s.serving : "";
      return '<li data-p2p-reveal style="--cap:' + esc(p.color) + '"><a href="' + href(p) + '"><span class="p2p-dose-n"><i class="p2-dot"></i>' + esc(p.name) + '</span><strong class="p2p-dose-k">' + esc(key || "") + "</strong>" + (serving ? '<span class="p2p-dose-s">per ' + esc(serving.replace(/^1 /, "")) + "</span>" : "") +
        '<span class="p2p-dose-b" aria-hidden="true">' + bottle(p, { alt: "" }) + "</span></a></li>";
    }).join("") + "</ul>";

    var status = '<ul class="p2-std-status" data-p2p-reveal><li><span class="is-done">In place</span>GMP-certified production for all seven</li><li><span class="is-done">In place</span>Third-party testing for every product</li><li><span class="is-done">In place</span>A lot number printed on every pack</li><li><span class="is-soon">Coming</span>Certificates and lot reports published on this site</li></ul>';

    var shelf = '<ul class="p2-std-links p2p-shelf">' + list.map(function (p) {
      return '<li data-p2p-reveal style="--cap:' + esc(p.color) + '"><a href="' + href(p) + '"><span class="p2p-shelf-b" aria-hidden="true">' + bottle(p, { alt: "" }) + '</span><b><i class="p2-dot"></i>' + esc(p.name) + "</b><span>Read the label</span></a></li>";
    }).join("") + "</ul>";

    return '<div class="p2p p2p-standards p2-standards">' +
      hero({ cls: "p2p-hero-split", eyebrow: "Our standard", title: "One uncompromising standard.", lede: "Seven supplements. Four rules we never bend. This is what they look like on every bottle.",
        art: '<div class="p2p-orbit" data-p2p-cycle style="--cap:' + esc(first.color) + '">' + disc(list, { eager: true }) + chips + "</div>" }) +
      '<section class="p2p-rule p2p-rule-form" id="form"><div class="p2-wrap">' + ruleHead(0) + pick + "</div></section>" +
      '<section class="p2p-rule p2p-rule-dose" id="dose"><div class="p2-wrap">' + ruleHead(1) + doses + "</div></section>" +
      '<section class="p2p-rule p2p-rule-tested" id="tested"><div class="p2p-band"><div class="p2-wrap p2p-band-in">' + ruleHead(2).replace("</div>", '<a class="p2-link" href="/reports">Look up your lot</a></div>') + status + "</div></div></section>" +
      '<section class="p2p-rule p2p-rule-hidden" id="hidden"><div class="p2-wrap">' + ruleHead(3) + shelf + "</div></section>" +
      '<div class="p2-wrap p2p-end" data-p2p-reveal><div class="p2-actions p2-actions-left"><a class="p2-btn" href="/shop">Shop the seven</a><a class="p2-link" href="/learn">Learn</a></div><p class="p2-std-licence">Body Café Co. · FSSAI Lic. No. 10726994000121</p></div></div>';
  });

  /* ---------- Learn (index only; each guide keeps its own page) ---------- */
  // Three small drawings for the label guides: a facts panel, a short name beside its full name, a lot stamp.
  var GUIDE_ART = [
    '<span class="p2p-art" aria-hidden="true"><span class="p2p-facts"><b>Serving size</b><i></i><i class="is-key"><em>Amount per serving</em></i><i></i><i></i></span></span>',
    '<span class="p2p-art" aria-hidden="true"><span class="p2p-names"><em>Vitamin K2</em><b>Vitamin K2 <strong>as MK-7</strong></b></span></span>',
    '<span class="p2p-art" aria-hidden="true"><span class="p2p-stamp"><em>Lot No.</em><b>· · · · · ·</b>' + I.check + "</span></span>",
  ];
  page("learn", function (base, ctx, seg) {
    if (seg) return base.apply(this, [].slice.call(arguments, 1));
    var list = ctx.published, lead = ctx.product("vitamin-d3-k2") || list[0];
    if (!lead) return base.apply(this, [].slice.call(arguments, 1));
    var guides = [["/learn/reading-a-label", "Read a label with confidence", "Serving sizes, ingredient names and the other details on a pack."], ["/learn/ingredient-forms", "Why ingredient forms matter", "Why the full ingredient name matters when you compare products."], ["/learn/understanding-reports", "What a lot record shows", "The difference between a product, a lot and a tested sample."]];
    var art = '<figure class="p2p-photo" style="--cap:' + esc(lead.color) + '">' + still(lead, { eager: true, alt: lead.name + " bottle" }) + "</figure>" +
      '<ul class="p2p-tags" aria-hidden="true"><li class="p2p-tag-1"><i></i>Which form</li><li class="p2p-tag-2"><i></i>How much</li><li class="p2p-tag-3"><i></i>Which lot</li></ul>';
    return '<div class="p2p p2p-learn p2-learn">' +
      hero({ cls: "p2p-hero-split", eyebrow: "Learn", title: "Read the label. Know the form.", lede: "Short, plain guides to the seven and to reading any supplement label.", art: art }) +
      '<section class="p2p-sec" aria-labelledby="p2p-guides-t"><div class="p2-wrap">' + secHead({ eyebrow: "The seven", title: "One guide for each.", id: "p2p-guides-t" }) +
      '<ul class="p2p-guides">' + list.map(function (p) {
        return '<li data-p2p-reveal style="--cap:' + esc(p.color) + '"><a href="/learn/' + esc(p.id) + '"><span class="p2p-guide-art" aria-hidden="true"><i></i>' + bottle(p, { alt: "" }) + '</span><span class="p2p-guide-copy"><strong>' + esc(p.name) + "</strong><span>" + esc(P.copy(p.id).headline || p.subtitle || "") + '</span></span><span class="p2p-go">Read the guide' + I.arrow + "</span></a></li>";
      }).join("") + "</ul></div></section>" +
      '<section class="p2p-sec p2p-sec-plate" aria-labelledby="p2p-articles-t"><div class="p2-wrap">' + secHead({ eyebrow: "Guides", title: "Reading any label.", id: "p2p-articles-t" }) +
      '<ul class="p2p-articles">' + guides.map(function (g, i) {
        return '<li data-p2p-reveal style="--cap:' + esc((list[[1, 3, 5][i]] || lead).color) + '"><a href="' + g[0] + '">' + GUIDE_ART[i] + "<strong>" + g[1] + "</strong><span>" + g[2] + '</span><span class="p2p-go">Read' + I.arrow + "</span></a></li>";
      }).join("") + "</ul></div></section>" +
      '<div class="p2-wrap p2p-end" data-p2p-reveal><div class="p2-actions p2-actions-left"><a class="p2-btn" href="/shop">Shop the seven</a><a class="p2-link" href="/standards">Our standard</a></div></div></div>';
  });

  /* ---------- Story (also /about) ---------- */
  function storyPage(base, ctx) {
    var list = ctx.published, lead = ctx.product("omega-3-fish-oil") || list[0];
    if (!lead) return base.apply(this, [].slice.call(arguments, 1));
    return '<div class="p2p p2p-story p2-story">' +
      hero({ cls: "p2p-hero-wide", eyebrow: "Our story", title: "You should always know what you’re being served.", lede: "A good café shows you the menu. So do we." }) +
      '<figure class="p2p-capstrip" data-p2p-rise aria-hidden="true">' + list.map(function (p, i) { return '<span style="--cap:' + esc(p.color) + ";--i:" + i + '"><img src="/web/media/premium/' + esc(p.id) + '-detail.webp" alt="" width="1800" height="2400"></span>'; }).join("") + "</figure>" +

      '<section class="p2p-chap"><div class="p2-wrap p2p-chap-in"><div class="p2p-chap-copy" data-p2p-reveal><h2>The front of the label shouts. The back whispers.</h2><p>Most supplement labels lead with promises and leave the facts in small print: which form the ingredient is in, how much you actually get, and when to take it. We turned that around.</p></div>' +
      '<figure class="p2p-photo p2p-chap-photo" data-p2p-reveal style="--cap:' + esc(lead.color) + '">' + still(lead, { alt: lead.name + " bottle" }) + "</figure></div></section>" +

      '<section class="p2p-chap p2p-chap-seven"><div class="p2-wrap"><div class="p2p-chap-copy p2p-chap-center" data-p2p-reveal><h2>Seven, and only seven.</h2><p>We make seven supplements. Each one is an everyday essential, and each one is made the same way. A small range lets us hold every product to the same standard, and say exactly what is in it.</p></div>' +
      '<ul class="p2p-lineup" aria-label="The seven">' + list.map(function (p, i) { return '<li data-p2p-reveal style="--cap:' + esc(p.color) + ";--i:" + i + '"><a href="' + href(p) + '" aria-label="' + esc(p.name) + '">' + bottle(p, { alt: "" }) + "</a></li>"; }).join("") + "</ul></div></section>" +

      '<section class="p2p-chap p2p-chap-colour" data-p2p-tint style="--cap:' + esc(list[0].color) + '"><div class="p2-wrap"><div class="p2p-chap-copy p2p-chap-center" data-p2p-reveal><h2>One colour each.</h2><p>Every product has its own cap colour, so you can tell them apart at a glance on a shelf, in a bag, or half-awake in the morning.</p></div>' +
      '<ul class="p2-capnames" data-p2p-reveal>' + list.map(function (p) { return '<li style="--cap:' + esc(p.color) + '"><a href="' + href(p) + '" data-color="' + esc(p.color) + '">' + capImg(p) + "<span>" + esc(p.name) + "</span></a></li>"; }).join("") + "</ul></div></section>" +

      '<section class="p2p-chap p2p-chap-work"><div class="p2-wrap p2p-chap-in"><figure class="p2p-photo p2p-chap-sky" data-p2p-reveal><img src="/web/media/e/story-sky.webp" alt="" width="2560" height="1460" loading="lazy" decoding="async"></figure>' +
      '<div class="p2p-chap-copy" data-p2p-reveal><h2>How we work.</h2><ol class="p2-rules"><li><strong>Name the form.</strong> On the front, every time.</li><li><strong>State the amount.</strong> Per serving, in plain numbers.</li><li><strong>Make the routine obvious.</strong> When to take it, with what, and what to avoid.</li><li><strong>Test every lot.</strong> And print the lot number on every pack.</li></ol>' +
      '<div class="p2-actions p2-actions-left"><a class="p2-btn" href="/shop">Shop the seven</a><a class="p2-link" href="/standards">Our standard</a></div></div></div></section></div>';
  }
  page("story", storyPage);
  page("about", storyPage);

  /* ---------- Help (index only; articles and forms keep their own pages) ---------- */
  var CAT_ICON = { orders: "box", delivery: "truck", returns: "back", payments: "card", account: "user", products: "bottle", reports: "doc" };
  page("help", function (base, ctx) {
    if (ctx.path !== "/help") return base.apply(this, [].slice.call(arguments, 1));
    var C = window.BCCSupportContent || {}, cats = C.CATEGORIES || [], arts = C.ARTICLES || [], colours = ctx.catalog.map(function (p) { return p.color; });
    var faqs = (ctx.faqs || []).filter(function (f) { return !P.MAKER.test(f[1]); });
    var contact = { mail: "", tel: "" };
    S.careGroups().forEach(function (g) { g.items.forEach(function (x) { if (/^mailto:/.test(x[1])) contact.mail = x; if (/^tel:/.test(x[1])) contact.tel = x; }); });
    var quick = [["/account", "box", "Track an order", "See where your order is."], ["/help/returns/something-wrong", "alert", "Report an issue", "Damaged, wrong, missing or late."], ["/reports", "doc", "Look up a lot", "Find the record for your pack."], ["/contact", "mail", "Contact us", "care@bodycafeco.com"]];
    var count = function (id) { var n = arts.filter(function (a) { return a.cat === id; }).length; return n ? n + " answer" + (n === 1 ? "" : "s") : ""; };
    return '<div class="p2p p2p-help p2-help">' +
      hero({ cls: "p2p-hero-center", eyebrow: "Help", title: "How can we help?", lede: "Answers to common questions, and a real person when you need one.",
        extra: (arts.length ? '<form class="p2p-hsearch" role="search" data-p2p-hsearch novalidate><label class="sr-only" for="p2p-hq">Search help</label>' + ic("search") + '<input id="p2p-hq" type="search" placeholder="Search help: delivery, returns, payments…" autocomplete="off" aria-controls="p2p-hresults"><ul id="p2p-hresults" class="p2p-hresults" hidden></ul></form>' : "") +
          '<div class="p2p-hero-caps" aria-hidden="true">' + ctx.catalog.map(function (p, i) { return '<i style="--cap:' + esc(p.color) + ";--i:" + i + '"></i>'; }).join("") + "</div>" }) +
      '<div class="p2-wrap"><ul class="p2p-quick">' + quick.map(function (q, i) {
        return '<li data-p2p-reveal style="--cap:' + esc(colours[[1, 3, 2, 5][i]] || "#35306f") + '"><a href="' + q[0] + '">' + ic(q[1]) + "<strong>" + q[2] + "</strong><span>" + q[3] + "</span>" + ic("arrow", "p2p-ic-go") + "</a></li>";
      }).join("") + "</ul></div>" +
      (cats.length ? '<section class="p2p-sec" aria-labelledby="p2p-topics-t"><div class="p2-wrap">' + secHead({ eyebrow: "Topics", title: "Browse by topic.", id: "p2p-topics-t" }) +
        '<ul class="p2p-topics">' + cats.map(function (c, i) {
          return '<li data-p2p-reveal style="--cap:' + esc(colours[i % (colours.length || 1)] || "#35306f") + '"><a href="/help/' + esc(c.id) + '">' + ic(CAT_ICON[c.id] || "doc") + "<strong>" + esc(c.title) + "</strong><span>" + esc(c.blurb) + '</span><small>' + count(c.id) + "</small></a></li>";
        }).join("") + "</ul></div></section>" : "") +
      (faqs.length ? '<section class="p2p-sec p2p-faq" aria-labelledby="p2p-faq-t"><div class="p2-wrap p2p-faq-in"><header data-p2p-reveal><p class="p2-eyebrow">Good to know</p><h2 id="p2p-faq-t">Before you order.</h2></header>' +
        '<div class="p2-accs" data-p2p-reveal>' + faqs.map(function (f) { return P.acc(esc(f[0]), P.para(f[1])); }).join("") + "</div></div></section>" : "") +
      '<section class="p2p-sec p2p-contact"><div class="p2p-band"><div class="p2-wrap p2p-band-in"><div data-p2p-reveal><p class="p2-eyebrow">Contact</p><h2>A real person, when you need one.</h2><div class="p2-actions p2-actions-left"><a class="p2-btn p2-btn-light" href="/contact">Contact us</a></div></div>' +
      '<ul class="p2p-contact-list" data-p2p-reveal>' + (contact.mail ? '<li><a href="' + esc(contact.mail[1]) + '">' + ic("mail") + "<span><small>Email</small>" + esc(contact.mail[0]) + "</span></a></li>" : "") + (contact.tel ? '<li><a href="' + esc(contact.tel[1]) + '">' + ic("phone") + "<span><small>Phone</small>" + esc(contact.tel[0]) + "</span></a></li>" : "") +
      '<li><a href="/help/returns/something-wrong">' + ic("alert") + "<span><small>Something wrong with an order?</small>Report an issue</span></a></li></ul></div></div></section></div>";
  });

  /* ---------- Look up a lot ---------- */
  page("reports", function (base, ctx) {
    var all = ctx.catalog, pid = ctx.product(ctx.query.get("product")) ? ctx.query.get("product") : (ctx.published[0] || all[0] || {}).id, cur = ctx.product(pid);
    if (!cur) return base.apply(this, [].slice.call(arguments, 1));
    var picker = '<div class="p2-picker p2p-rep-picker report-product-picker" role="group" aria-label="Choose your product">' + all.map(function (p) {
      return '<button type="button" style="' + ctx.capStyle(p) + '" class="' + (p.id === pid ? "selected" : "") + '" data-report-product="' + esc(p.id) + '" aria-pressed="' + (p.id === pid) + '">' + capImg(p) + "<span>" + esc(p.name) + "</span></button>";
    }).join("") + "</div>";
    return '<div class="p2p p2p-reports p2-reports report-page" style="' + ctx.capStyle(cur) + '">' +
      '<div class="p2-wrap p2p-rep"><div class="p2p-rep-stage" data-p2p-rep-stage data-p2p-rise>' + disc(all, { first: pid, eager: true }) + '<p class="p2p-rep-where"><span class="p2p-stamp" aria-hidden="true"><em>Lot No.</em><b>· · · · · ·</b></span><span><strong>Not the order number.</strong> The lot number is printed on the pack, separate from the barcode.</span></p></div>' +
      '<div class="p2p-rep-main" data-p2p-rise><p class="p2-eyebrow">Lot record</p><h1>Look up your lot.</h1><p class="p2-lede">Choose your product, then type the lot number printed on the pack.</p>' +
      '<div class="p2-rep-form p2p-rep-form"><p class="p2-step">Your product</p>' + picker + '<p class="p2-step">Lot number</p>' + ctx.forms.reportForm(pid, ctx.query.get("lot")) + "</div></div></div>" +
      '<section class="p2p-sec p2p-rep-what" aria-labelledby="p2p-rep-what-t"><div class="p2-wrap">' + secHead({ eyebrow: "The record", title: "What a lot record shows", id: "p2p-rep-what-t", link: '<a class="p2-link" href="/contact">Ask about a lot</a>' }) +
      '<ul class="p2p-rep-shows">' + [["bottle", "The product and the lot it belongs to."], ["search", "What was tested on a sample from that lot, and how."], ["check", "The result, with its units and limits."]].map(function (x) { return "<li data-p2p-reveal>" + ic(x[0]) + "<p>" + x[1] + "</p></li>"; }).join("") + "</ul>" +
      '<p class="p2-small" data-p2p-reveal>A record describes a tested sample from one lot. It does not promise a health outcome.</p></div></section></div>';
  });

  /* ---------- Contact, the policies and Preferences ----------
     These keep the shared support pages (web/support.js: the case form, the print link, the preference forms and all
     their behaviour) and are dressed for Part 2: the page gains a policy switcher and a few hooks, the rest is CSS. */
  var POL_ICON = { shipping: "truck", returns: "back", cancellation: "cancel", privacy: "lock", terms: "doc", settings: "sliders" };
  function suPage(name, fn) {
    page(name, function (base) {
      var args = [].slice.call(arguments, 1), html = base.apply(this, args);
      if (typeof html !== "string") return html;
      var t = document.createElement("template"); t.innerHTML = html;
      var root = t.content.querySelector(".su"); if (!root) return html;
      root.classList.add("p2p", "p2p-su", "p2p-su-" + name);
      fn(root, args[0], args[1]);
      return t.innerHTML;
    });
  }
  function eyebrow(root, text) {
    var head = root.querySelector(".su-head"); if (!head) return;
    var k = head.querySelector(".su-k"); if (k) k.remove();
    head.insertAdjacentHTML("afterbegin", '<p class="p2-eyebrow">' + text + "</p>");
  }
  // One row to move between the five policies and Preferences.
  function polTabs(root, ctx, current) {
    var C = window.BCCSupportContent || {}, pols = C.POLICIES || {}, head = root.querySelector(".su-head"); if (!head) return;
    var items = Object.keys(pols).map(function (k) { return [k, pols[k].path, pols[k].title]; }).concat([["settings", "/settings", "Preferences"]]);
    var at = Math.max(0, items.map(function (x) { return x[0]; }).indexOf(current)), colours = ctx.catalog.map(function (p) { return p.color; });
    root.style.setProperty("--cap", colours[at % (colours.length || 1)] || "#35306f");
    var h1 = head.querySelector("h1"); if (h1) h1.insertAdjacentHTML("beforebegin", ic(POL_ICON[current] || "doc", "p2p-pol-ic"));
    head.insertAdjacentHTML("afterend", '<nav class="p2p-pol-tabs" aria-label="Policies and preferences"><div>' + items.map(function (x) { return '<a href="' + x[1] + '"' + (x[0] === current ? ' aria-current="page"' : "") + ">" + esc(x[2]) + "</a>"; }).join("") + "</div></nav>");
  }
  suPage("policy", function (root, ctx, kind) {
    eyebrow(root, "Policies");
    polTabs(root, ctx, kind);
    // The switcher above replaces the "Other policies" list in the contents card.
    var toc = root.querySelector(".su-toc");
    if (toc) { var hs = toc.querySelectorAll("h2"); if (hs[1]) { var ul = hs[1].nextElementSibling; if (ul && ul.tagName === "UL") ul.remove(); hs[1].remove(); } }
  });
  suPage("settings", function (root, ctx) { eyebrow(root, "Preferences"); polTabs(root, ctx, "settings"); });
  suPage("contact", function (root) { var head = root.querySelector(".su-head"); if (head && !head.querySelector(".p2-eyebrow")) head.insertAdjacentHTML("afterbegin", '<p class="p2-eyebrow">Contact</p>'); });
  // Contact's switchboard is drawn after render (web/super-sevens.js). Its number was set in segment numerals, which Part 2
  // retired, so the digits are written as plain text; each topic takes one of the cap colours.
  function mountContact(root) {
    var tel = root.querySelector(".ss-switch-phone"), num = tel && tel.querySelector(".ss-num");
    if (num && !num.dataset.p2p) {
      var d = (tel.getAttribute("href") || "").replace(/\D/g, "").slice(-10);
      if (d.length === 10) { num.dataset.p2p = "1"; num.removeAttribute("aria-hidden"); num.textContent = d.slice(0, 5) + " " + d.slice(5); }
    }
    var colours = (window.BCCApp && window.BCCApp.catalog() || []).map(function (p) { return p.color; });
    root.querySelectorAll("[data-ss-topic]").forEach(function (b, i) { if (colours.length) b.style.setProperty("--cap", colours[i % colours.length]); });
  }
  // The contents card follows the reader: the section in view is marked.
  function mountSpy(root, signal) {
    var links = {}, toc = root.querySelector(".su-toc"); if (!toc || !("IntersectionObserver" in window)) return;
    toc.querySelectorAll("a[href*='#']").forEach(function (a) { links[a.getAttribute("href").split("#")[1]] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting || !links[e.target.id]) return;
        Object.keys(links).forEach(function (k) { if (k === e.target.id) links[k].setAttribute("aria-current", "true"); else links[k].removeAttribute("aria-current"); });
      });
    }, { rootMargin: "-18% 0px -70% 0px" });
    root.querySelectorAll(".su-summary[id], .su-sec[id]").forEach(function (s) { io.observe(s); });
    signal.addEventListener("abort", function () { io.disconnect(); });
  }

  /* ---------- Behaviour ---------- */
  var calm = function () { return matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduce"; };
  function showIn(root, id) {
    var color = "";
    root.querySelectorAll(".p2p-disc-b").forEach(function (b) { var hit = b.dataset.id === id; b.classList.toggle("is-on", hit); if (hit) color = b.dataset.color; });
    return color;
  }
  // The hero disc of Our standard: the seven take turns, as on the home page.
  function mountCycle(el, signal) {
    var items = [].slice.call(el.querySelectorAll(".p2p-disc-b")), at = 0, seen = true, timer = 0;
    if (items.length < 2 || calm()) return;
    var io = "IntersectionObserver" in window ? new IntersectionObserver(function (e) { seen = e[0].isIntersecting; }) : null;
    if (io) io.observe(el);
    timer = setInterval(function () {
      if (document.hidden || !seen) return;
      at = (at + 1) % items.length;
      el.style.setProperty("--cap", showIn(el, items[at].dataset.id));
    }, 2800);
    signal.addEventListener("abort", function () { clearInterval(timer); if (io) io.disconnect(); });
  }
  function mountPick(el, signal) {
    var btns = el.querySelectorAll("[data-p2p-pickbtn]");
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.dataset.p2pPickbtn;
        btns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        el.querySelectorAll("[data-p2p-panel]").forEach(function (p) { p.hidden = p.dataset.p2pPanel !== id; });
        el.style.setProperty("--cap", showIn(el, id) || b.dataset.color);
      }, { signal: signal });
    });
  }
  function mountFilm(fig, signal) {
    var v = fig.querySelector("video"), b = fig.querySelector("[data-p2p-film-btn]");
    if (!v || !b) return;
    var paint = function () { var off = v.paused; b.setAttribute("aria-pressed", String(off)); b.setAttribute("aria-label", off ? "Play the film" : "Pause the film"); b.innerHTML = off ? I.play : I.pause; };
    b.addEventListener("click", function () { if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); }, { signal: signal });
    v.addEventListener("play", paint, { signal: signal }); v.addEventListener("pause", paint, { signal: signal });
    if (calm()) v.pause();
    paint();
  }
  // Help search: the articles already on the site, matched as you type.
  function mountSearch(form, signal) {
    var input = form.querySelector("input"), out = form.querySelector(".p2p-hresults"), C = window.BCCSupportContent || {}, arts = C.ARTICLES || [], cats = {};
    (C.CATEGORIES || []).forEach(function (c) { cats[c.id] = c.title; });
    function run() {
      var words = input.value.toLowerCase().split(/\s+/).filter(function (w) { return w.length > 1; });
      if (!words.length) { out.hidden = true; out.innerHTML = ""; return; }
      var hits = arts.map(function (a) {
        var t = String(a.title || "").toLowerCase(), body = (String(a.answer || "") + " " + (a.body || []).join(" ")).toLowerCase(), score = 0;
        for (var i = 0; i < words.length; i++) { var inT = t.indexOf(words[i]) >= 0, inB = body.indexOf(words[i]) >= 0; if (!inT && !inB) return null; score += inT ? 3 : 1; }
        return { a: a, score: score };
      }).filter(Boolean).sort(function (x, y) { return y.score - x.score; }).slice(0, 6);
      out.innerHTML = hits.length ? hits.map(function (h) { return '<li><a href="/help/' + esc(h.a.cat) + "/" + esc(h.a.id) + '"><strong>' + esc(h.a.title) + "</strong><span>" + esc(cats[h.a.cat] || "") + "</span></a></li>"; }).join("") :
        '<li class="is-none">No answer matches that yet. <a href="/contact">Contact us</a> and a person will help.</li>';
      out.hidden = false;
    }
    input.addEventListener("input", run, { signal: signal });
    form.addEventListener("submit", function (e) { e.preventDefault(); var a = out.querySelector("a"); if (a) a.click(); }, { signal: signal });
    input.addEventListener("keydown", function (e) { if (e.key === "Escape") { input.value = ""; run(); } }, { signal: signal });
  }
  // Bag: how far the order is from free delivery, kept above the lines while the bag redraws itself (web/bag.js).
  function mountBag(bag, signal) {
    var body = bag.querySelector("#bg-body"), B = window.BCCBag;
    if (!body || !B || !B.quote) return;
    var bar = document.createElement("div"); bar.className = "p2p-ship"; bar.hidden = true;
    body.parentNode.insertBefore(bar, body);
    var money = function (n) { return "₹" + Number(n || 0).toLocaleString("en-IN"); };
    function paint() {
      var q = B.quote(), rule = (q && q.shipping_rule) || {}, at = Number(rule.free_from || rule.threshold || rule.free_over || 1499);
      if (!q || !q.subtotal || !at) { bar.hidden = true; return; }
      var paid = Math.max(0, q.subtotal - (q.pack_saving || 0) - (q.discount || 0)), left = Math.max(0, at - paid), free = !q.shipping;
      bar.hidden = false; bar.classList.toggle("is-free", free);
      bar.innerHTML = '<p role="status">' + (free ? "<strong>Free delivery</strong> on this order." : "<strong>" + money(left) + "</strong> away from free delivery.") + '</p><span class="p2p-ship-track" aria-hidden="true"><i style="width:' + (free ? 100 : Math.max(6, Math.min(100, Math.round(paid / at * 100)))) + '%"></i></span>';
    }
    var mo = new MutationObserver(paint); mo.observe(body, { childList: true, subtree: true });
    signal.addEventListener("abort", function () { mo.disconnect(); });
    paint();
  }
  // Checkout: where you are (bag, details, payment, done), and what the summary card promises.
  function mountCheckout(co) {
    var head = co.querySelector(".p2-co-head"), sum = co.querySelector(".p2-co-sum"), od = co.hasAttribute("data-p2-od");
    if (head && !co.querySelector(".p2p-steps")) {
      var paid = od && !co.querySelector("[data-p2-hold]") && !/hold has ended|can’t find/i.test(head.textContent), at = od ? (paid ? 3 : 2) : 1;
      head.insertAdjacentHTML("afterbegin", '<ol class="p2p-steps" aria-label="Checkout progress">' + ["Bag", "Details", "Payment", "Done"].map(function (s, i) {
        return '<li class="' + (i < at ? "is-done" : i === at ? "is-now" : "") + '"' + (i === at ? ' aria-current="step"' : "") + ">" + (i === 0 ? '<a href="/cart">' + s + "</a>" : s) + "</li>";
      }).join("") + "</ol>");
    }
    if (sum && !od && !co.querySelector(".p2p-assure")) {
      var wrap = document.createElement("div"); wrap.className = "p2p-co-side";
      sum.parentNode.insertBefore(wrap, sum); wrap.appendChild(sum);
      wrap.insertAdjacentHTML("beforeend", '<ul class="p2p-assure"><li>' + ic("lock") + "<span>Nothing is charged until you pay on the next step.</span></li><li>" + ic("truck") + "<span>Free delivery on orders of ₹1,499 or more.</span></li><li>" + ic("doc") + "<span>A lot number on every pack.</span></li></ul>");
    }
  }
  L.onEnhance(function (main, signal) {
    if (!on2()) return;
    var root = main.querySelector(".p2p");
    main.querySelectorAll("[data-p2p-cycle]").forEach(function (el) { mountCycle(el, signal); });
    main.querySelectorAll("[data-p2p-pick]").forEach(function (el) { mountPick(el, signal); });
    main.querySelectorAll("[data-p2p-film]").forEach(function (el) { mountFilm(el, signal); });
    main.querySelectorAll("[data-p2p-hsearch]").forEach(function (el) { mountSearch(el, signal); });
    main.querySelectorAll("[data-p2p-tint]").forEach(function (band) {
      band.querySelectorAll("a[data-color]").forEach(function (a) {
        var tint = function () { band.style.setProperty("--cap", a.dataset.color); };
        a.addEventListener("pointerenter", tint, { signal: signal }); a.addEventListener("focus", tint, { signal: signal });
      });
    });
    var stage = main.querySelector("[data-p2p-rep-stage]");
    if (stage) main.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-report-product]"); if (b) showIn(stage, b.dataset.reportProduct); }, { signal: signal });
    var su = main.querySelector(".p2p-su");
    if (su && su.classList.contains("p2p-su-contact")) mountContact(su);
    if (su && su.classList.contains("p2p-su-policy")) mountSpy(su, signal);
    // Product page: text on the cap colour (the "Best" time, the pack flag) takes whichever of ink, cream or black reads on it.
    var pdp = main.querySelector(".p2-pdp");
    if (pdp) { var cap = pdp.style.getPropertyValue("--cap").trim(); if (/^#[0-9a-f]{6}$/i.test(cap)) pdp.style.setProperty("--on-cap", onCap(cap)); }
    // Product page on a phone: the fixed Add bar steps aside while the Add button in the page is on screen, so there is only ever one.
    var addIn = main.querySelector(".p2-buy-add"), addBar = main.querySelector(".p2-sticky-add");
    if (addIn && addBar && "IntersectionObserver" in window) {
      var addIo = new IntersectionObserver(function (es) { addBar.classList.toggle("is-aside", es[es.length - 1].isIntersecting); });
      addIo.observe(addIn);
      signal.addEventListener("abort", function () { addIo.disconnect(); });
    }
    var bag = main.querySelector('[data-bg][data-bg-design="p2"]'); if (bag) mountBag(bag, signal);
    var co = main.querySelector(".p2-co"); if (co) mountCheckout(co);
    var auth = main.querySelector("[data-p2a-auth]");
    if (auth && !auth.querySelector(".p2p-hero-caps") && window.BCCApp) auth.insertAdjacentHTML("afterbegin", '<div class="p2p-hero-caps" aria-hidden="true">' + (window.BCCApp.catalog() || []).map(function (p, i) { return '<i style="--cap:' + esc(p.color) + ";--i:" + i + '"></i>'; }).join("") + "</div>");

    // Sections rise into place as they are reached. Without the observer, or with reduced motion, everything simply shows.
    if (!root || calm() || !("IntersectionObserver" in window)) return;
    var els = root.querySelectorAll("[data-p2p-reveal]");
    root.classList.add("p2p-anim");
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("p2p-in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { var sibs = el.parentNode ? [].indexOf.call(el.parentNode.children, el) : 0; el.style.setProperty("--p2p-d", Math.min(sibs, 7) * 60 + "ms"); io.observe(el); });
    requestAnimationFrame(function () { root.classList.add("p2p-ready"); });
    signal.addEventListener("abort", function () { io.disconnect(); });
  });
})();
