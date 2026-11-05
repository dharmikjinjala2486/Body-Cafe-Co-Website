/* Body Café Co. — Variant E · Our story.
   Copy is the owner-selected "Our story" page from the reference site, preserved exactly
   (design-review/story-source-2026-11-02/reference-index.html: ourStory(), boardHTML(true), dayHTML(), PRODUCTS, BRAND).
   Only presentation and routes are adapted: product lines link to /products/<slug>, "Explore our products" to /shop.
   Colour comes from the live catalogue's cap colours; the reference accent colours are not used.
   Loads after super-sevens.js and replaces E's story renderer outright, with no fallback to the earlier object story. */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE, SS = window.BCCSuperSevens;
  if (!S || !S.themes || !S.themes.e || !L || !SS) return;
  var esc = L.esc;

  /* ---------------------------------------------------------------- Source content (verbatim) */
  var BRAND = { tagline: "Built on research. Made for real life.", fssai: "10726994000121" };
  // Order, names and menu lines as in the reference PRODUCTS array.
  var PRODUCTS = [
    { slug: "vitamin-d3-k2", name: "Vitamin D3 + K2", key: "600 IU D3 · 55 mcg K2", keySub: "Softgel · morning, with food", time: ["morning"] },
    { slug: "omega-3-fish-oil", name: "Omega-3 Fish Oil", key: "800 mg omega-3", keySub: "EPA 400 · DHA 300 · as triglycerides", time: ["morning"] },
    { slug: "iron-bisglycinate", name: "Iron Bisglycinate", key: "29 mg iron", keySub: "Ferrochel® · morning, empty stomach", time: ["morning"] },
    { slug: "psyllium-husk", name: "Psyllium Husk (Isabgol)", key: "2000 mg husk", keySub: "5 capsules · night, with water", time: ["night"] },
    { slug: "myo-d-chiro-inositol", name: "Myo & D-Chiro Inositol", key: "2000 + 50 mg", keySub: "40:1 · 3 capsules, morning", time: ["morning"] },
    { slug: "creatine-chews", name: "Creatine Chews", key: "3000 mg creatine", keySub: "2 orange chews · your chosen time", time: ["any"] },
    { slug: "l-theanine", name: "L-Theanine", key: "200 mg", keySub: "1 capsule · morning", time: ["morning"] },
  ];
  function P(slug) { return PRODUCTS.filter(function (p) { return p.slug === slug; })[0]; }

  var HERO = { eyebrow: "Our story", title: "You should always know what you're being served.", lede: "A good café shows you the menu. So do we." };
  var CH = [
    { n: "I", title: "Careful people.", paras: [
      ["first", "Think about how carefully you choose things."],
      ["", "You check the expiry date on the milk packet. You read three reviews before buying a phone cover. You ask the chemist which brand to take, and then you ask a friend whether the chemist is right. When something goes into your body, or into your family's, you want to know what it is."],
      ["", "And then there is the supplement shelf."]] },
    { n: "II", title: "An opaque shelf.", paras: [
      ["", "It is loud. Every bottle promises more energy, more strength, more glow. The front of the label shouts and the back of it whispers. The facts that matter most are buried in small type, folded into a \"proprietary blend\", or missing altogether: what form the ingredient is in, how much of it you actually get, and when you should take it."],
      ["", "Advice arrives from everywhere: a forwarded message, a trainer at the gym, a relative who swears by something. Most of it is well meant. Very little of it is clear."],
      ["", "So people do one of two things. They buy on faith and hope it works. Or they quietly give up, because it was never clear why they started."],
      ["pull", "Neither is a real choice. A choice needs information."]] },
    { n: "III", title: "Why Body Café Co. exists.", paras: [
      ["", "Body Café Co. began with a simple belief: you should always know exactly what you are taking, and why."],
      ["", "It is the idea behind every good café. You can read the menu. You can see what goes into your cup. Nobody hides the recipe, because the recipe is the reason you walked in. We wanted supplements to feel like that: open, specific, and made with care for the person who will actually use them."],
      ["", "That belief shapes everything we make."]] },
    { n: "IV", title: "The thinking behind our products.", steps: [
      ["It starts with the form.", "The same nutrient can come in very different forms, so we name the one we chose, every time. If a form was chosen for a reason, you deserve to see it."],
      ["Then the amount.", "Every label states how much is in a serving, ingredient by ingredient. There are no hidden blends and no totals that could mean anything."],
      ["Then the moment.", "A supplement only earns its place if it fits into a real day, so every bottle tells you when to take it, whether to take it with food, and what to keep apart."],
      ["And then the proof.", "Our products are made in GMP-certified facilities in Gujarat, by manufacturers we name on every pack. They are third-party tested. Their ingredients are traceable. Scan the code on any bottle and there is more to read."]],
      table: { head: ["Product", "The decision", "Why we show it"], rows: [
        ["omega-3-fish-oil", "Omega-3 as triglycerides; oil and omega-3 listed separately", "So 1000 mg of oil is never mistaken for 1000 mg of omega-3"],
        ["vitamin-d3-k2", "D3 and K2 (as MK-7) in a softgel of omega-3 oil, not a dry tablet", "Both vitamins are fat-soluble; the label asks you to take it with food"],
        ["creatine-chews", "Creatine monohydrate as an orange chew; added sugar printed", "Easier to take every day, and you should know about the sugar too"],
        ["iron-bisglycinate", "Ferrochel® ferrous bisglycinate chelate; elemental iron stated", "You see the iron you get (29 mg), plus when to take it and what to avoid"],
        ["myo-d-chiro-inositol", "Both forms listed separately, 40:1 ratio on the front", "A single total would hide how much of each you get"],
        ["psyllium-husk", "Familiar isabgol, measured into capsules", "Every serving is the same: 2000 mg, with water, at night"]] } },
    { n: "V", title: "What we believe.", beliefs: [
      "We believe the form of an ingredient deserves a name.",
      "We believe an amount should be a number, not a blend.",
      "We believe “when” and “with what” matter as much as “what”.",
      "We believe a label is a promise you should be able to check.",
      "We believe in a short shelf, made with care."] },
    { n: "VI", title: "What we can demonstrate.", proof: [
      ["Amounts", "Every active ingredient listed with its own amount per serving, on every label."],
      ["Forms", "The form of each ingredient named on the pack."],
      ["Directions", "When and how to take each product, printed on the bottle."],
      ["Makers", "Asoj Soft Caps (Baroda), Vebe Lifecare (Baroda), U-Liva Nutrition (Rajkot), all GMP-certified."],
      ["Standards", "%RDA values calculated as per ICMR 2020 guidelines where established."],
      ["Licence", "FSSAI licence for Bluebell Lifecare Pvt. Ltd.: " + BRAND.fssai + "."]] },
    { n: "VII", title: "Our place in everyday life.", paras: [
      ["", "None of this is complicated. That is the point. Care, done properly, usually looks simple from the outside."],
      ["", "We do not think supplements should take over your life. They are a small part of it: a softgel with breakfast, a few capsules before bed, a habit that sits quietly between the alarm and the first meeting of the day. A good life is built mostly elsewhere, in meals and sleep, in movement, in time with the people you love. Our job is to make the small part honest, so you can stop thinking about it and get on with the rest."],
      ["", "So we keep our shelf short and make each product with care. We would rather explain one thing well than sell you ten things you do not understand. If a question is not answered on the label, ask us, and expect an answer you can check."],
      ["pull", "Because trust is not built by promises. It is built by being able to look."]] },
  ];
  var BOARD = { title: "Today's menu", eyebrow: "Amount per serving", hold: " · supply being confirmed", foot: "Every amount above is stated in full. No hidden blends." };
  var DAY = { slots: [["Morning", "morning"], ["Your chosen time", "any"], ["Night", "night"]], chai: "(before chai)", foot: "Timings from each product's directions." };
  var MANIFESTO = { dim: ["We don't make loud promises.", "We don't hide behind small print.", "We don't sell miracles in a bottle."], lines: ["We name the form. We state the amount. We tell you when. We show our work.", "Read the label. Ask your question. Take what makes sense for you."] };
  var FINAL = { title: "Start with one. Read the whole label.", cta: "Explore our products" };

  /* ---------------------------------------------------------------- Presentation */
  var LETTERS = "abcdefg";
  function live(ctx, slug) { return ctx.product(slug); }
  function colour(ctx, slug) { var p = live(ctx, slug); return p ? p.color : "#2d2926"; }
  function capArt(ctx, slug, cls) { var p = live(ctx, slug); return p ? L.cap(ctx, p, cls) : '<span class="' + cls + '"></span>'; }
  function href(slug) { return "/products/" + esc(slug); }
  function chColour(ctx, i) { var p = ctx.catalog[i]; return p ? p.color : "#2d2926"; }

  function board(ctx) {
    return '<div class="ssy-board" role="group" aria-label="Today\'s menu"><div class="ssy-board-head"><h3>' + esc(BOARD.title) + '</h3><span class="ez-k">' + esc(BOARD.eyebrow) + "</span></div>" +
      '<ul class="ssy-menu">' + PRODUCTS.map(function (p) {
        return '<li style="--cap:' + colour(ctx, p.slug) + '"><a class="ssy-mline" href="' + href(p.slug) + '">' + capArt(ctx, p.slug, "ssy-mline-cap") +
          '<span class="ssy-mline-nm">' + esc(p.name) + '</span><span class="ssy-mline-dots" aria-hidden="true"></span><span class="ssy-mline-amt">' + esc(p.key) + "</span>" +
          '<span class="ssy-mline-sub">' + esc(p.keySub) + (p.hold ? esc(BOARD.hold) : "") + "</span></a></li>";
      }).join("") + "</ul>" +
      '<p class="ssy-board-foot">' + esc(BOARD.foot) + "</p></div>";
  }
  function day(ctx) {
    var groups = { morning: PRODUCTS.filter(function (p) { return p.time.indexOf("morning") !== -1 && !p.hold; }), any: PRODUCTS.filter(function (p) { return p.time.indexOf("any") !== -1; }), night: PRODUCTS.filter(function (p) { return p.time.indexOf("night") !== -1; }) };
    return '<div class="ssy-day">' + DAY.slots.map(function (s) {
      return '<div class="ssy-slot is-' + s[1] + '"><p class="ez-k">' + esc(s[0]) + "</p><ul>" + groups[s[1]].map(function (p) {
        return '<li style="--cap:' + colour(ctx, p.slug) + '">' + capArt(ctx, p.slug, "ssy-slot-cap") + "<span>" + esc(p.name) + (p.slug === "iron-bisglycinate" ? ' <span class="ssy-muted">' + esc(DAY.chai) + "</span>" : "") + "</span></li>";
      }).join("") + "</ul></div>";
    }).join("") + '</div><p class="ssy-day-foot">' + esc(DAY.foot) + "</p>";
  }
  function paras(list) {
    return list.map(function (x) { return "<p" + (x[0] ? ' class="ssy-' + x[0] + '"' : "") + ">" + esc(x[1]) + "</p>"; }).join("");
  }
  function chapter(ctx, c, i) {
    var body = "";
    if (c.paras && c.n === "III") body = '<div class="ssy-split"><div class="ssy-prose">' + paras(c.paras) + "</div>" + board(ctx) + "</div>";
    else if (c.paras && c.n === "VII") body = '<div class="ssy-prose">' + paras(c.paras) + "</div>" + day(ctx);
    else if (c.paras) body = '<div class="ssy-prose">' + paras(c.paras) + "</div>";
    if (c.steps) body = '<div class="ssy-steps">' + c.steps.map(function (s, k) {
      return '<div class="ssy-step" style="--cap:' + chColour(ctx, k) + '"><span class="ssy-step-g" aria-hidden="true">' + SS.num(String(k + 1), { color: "var(--cap)", ghost: true, label: false }) + "</span><p><b>" + esc(s[0]) + "</b> " + esc(s[1]) + "</p></div>";
    }).join("") + "</div>" +
      '<div class="ssy-tbl"><table><thead><tr>' + c.table.head.map(function (hd) { return '<th scope="col">' + esc(hd) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      c.table.rows.map(function (r) { return '<tr style="--cap:' + colour(ctx, r[0]) + '"><th scope="row"><a href="' + href(r[0]) + '"><span class="ssy-dot" aria-hidden="true"></span><b>' + esc(P(r[0]).name) + "</b></a></th><td>" + esc(r[1]) + "</td><td>" + esc(r[2]) + "</td></tr>"; }).join("") +
      "</tbody></table></div>";
    if (c.beliefs) body = '<ul class="ssy-beliefs">' + c.beliefs.map(function (b, k) { return '<li style="--cap:' + chColour(ctx, k) + '"><p>' + esc(b) + "</p></li>"; }).join("") + "</ul>";
    if (c.proof) body = '<div class="ssy-proof">' + c.proof.map(function (x, k) { return '<div style="--cap:' + chColour(ctx, k) + '"><b>' + esc(x[0]) + "</b><p>" + esc(x[1]) + "</p></div>"; }).join("") + "</div>";
    return '<section class="ssy-ch ssy-ch-' + (i + 1) + '" id="chapter-' + (i + 1) + '" data-ssy-ch="' + i + '" aria-labelledby="ssy-ch-t' + (i + 1) + '" style="--cap:' + chColour(ctx, i) + '">' +
      '<header class="ssy-ch-head"><p class="ssy-num"><span class="ssy-num-t">' + c.n + '</span><span class="ssy-num-g" aria-hidden="true">' + SS.glyph("8", { only: i, ghost: true }) + "</span></p>" +
      '<h2 id="ssy-ch-t' + (i + 1) + '">' + esc(c.title) + "</h2></header>" + body + "</section>";
  }

  function story(ctx) {
    if (SS.cast) SS.cast(ctx);
    var marks = SS.mark({ cls: "is-story" });
    return '<div class="x-page ssy">' +
      '<header class="ssy-hero"><div class="ssy-hero-copy"><p class="ez-k">' + esc(HERO.eyebrow) + "</p><h1>" + esc(HERO.title) + '</h1><p class="ssy-lede">' + esc(HERO.lede) + "</p></div>" +
      '<div class="ssy-hero-art" aria-hidden="true"><div class="ssy-hero-mark">' + marks + '</div><ol class="ssy-hero-caps">' + ctx.catalog.slice(0, 7).map(function (p, k) { return '<li style="--cap:' + p.color + ";--i:" + k + '">' + L.cap(ctx, p, "ssy-hero-cap") + "</li>"; }).join("") + "</ol></div></header>" +
      '<div class="ssy-body"><aside class="ssy-rail" aria-hidden="true"><div class="ssy-rail-in" data-ssy-rail>' + marks + '<ol class="ssy-rail-ticks">' + CH.map(function (c, i) { return '<li style="--cap:' + chColour(ctx, i) + '"></li>'; }).join("") + "</ol></div></aside>" +
      '<div class="ssy-chapters">' + CH.map(function (c, i) { return chapter(ctx, c, i); }).join("") + "</div></div>" +
      '<section class="ssy-manifesto" aria-label="What we stand for"><div class="ssy-manifesto-in">' + MANIFESTO.dim.map(function (t) { return '<p class="ssy-dim">' + esc(t) + "</p>"; }).join("") + MANIFESTO.lines.map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("") +
      '<p class="ez-k ssy-tagline">' + esc(BRAND.tagline) + "</p></div></section>" +
      '<section class="ssy-final"><h2>' + esc(FINAL.title) + '</h2><div class="ssy-final-btns"><a class="ss-pill is-solid is-big" href="/shop"><span>' + esc(FINAL.cta) + '</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13"/><path d="m13 6 6 6-6 6"/></svg></a></div></section></div>';
  }
  var next = Object.assign({}, S.themes.e);
  next.story = function (ctx) { return story(ctx); };
  S.themes.e = next;

  /* ---------------------------------------------------------------- Behaviour: the rail lights one segment per chapter */
  L.onEnhance(function (main, signal) {
    var page = main.querySelector(".ssy"); if (!page) return;
    setTimeout(function () { if (document.querySelector(".ssy")) document.title = "Our story — Body Café Co."; }, 0);
    var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var rail = page.querySelector("[data-ssy-rail]"), segs = rail ? [].slice.call(rail.querySelectorAll("[data-ss-seg]")) : [], ticks = rail ? [].slice.call(rail.querySelectorAll(".ssy-rail-ticks li")) : [];
    var chs = [].slice.call(page.querySelectorAll("[data-ssy-ch]"));
    function light(n) {
      segs.forEach(function (s) { s.classList.toggle("is-lit", Number(s.getAttribute("data-ss-seg")) <= n); });
      ticks.forEach(function (t, k) { t.classList.toggle("is-lit", k <= n); t.classList.toggle("is-now", k === n); });
    }
    function onScroll() {
      var mid = window.innerHeight * 0.45, cur = -1;
      chs.forEach(function (c, k) { if (c.getBoundingClientRect().top < mid) cur = k; });
      light(cur);
    }
    window.addEventListener("scroll", onScroll, { passive: true, signal: signal });
    onScroll();
    if (reduced || !("IntersectionObserver" in window)) return;
    page.classList.add("is-js");
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }); }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    page.querySelectorAll(".ssy-ch-head, .ssy-prose > p, .ssy-board, .ssy-step, .ssy-tbl, .ssy-beliefs li, .ssy-proof > div, .ssy-slot, .ssy-manifesto p, .ssy-final h2").forEach(function (el) { el.classList.add("ssy-rv"); io.observe(el); });
    signal.addEventListener("abort", function () { io.disconnect(); });
  });
})();
