/* Body Café Co. — Variant E · The Living Fan Deck.
   The finalized E storefront. One idea carried through every room: cap → bottle → swatch → label → shelf → record.
   This layer wraps the FINAL E renderers (after the shared page modules), so it only ever changes what is shown.
   Facts come from the catalogue and the supplied label records (web/label-records.json via label-content.js); a label
   diagram is shown only while the product's own label amounts still match it, so an admin edit never leaves it stale.
   No invented claims, reviews, results, certifications or availability. Event hooks, ids and field names are kept. */
(function () {
  "use strict";
  var S = window.BCCSite, EH = window.BCCEH;
  if (!S || !S.themes || !S.themes.e || !EH) return;
  var h = EH.h;
  var RELEASE = window.BCCRelease || {};

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function frag(html) { var t = document.createElement("template"); t.innerHTML = html; return t.content; }
  function wrap(name, fn) {
    var base = S.themes.e[name];
    if (typeof base !== "function") return;
    var next = Object.assign({}, S.themes.e);
    next[name] = function (ctx) {
      var html = base.apply(this, arguments);
      if (typeof html !== "string") return html;
      var t = document.createElement("template");
      t.innerHTML = html;
      try { fn(t.content, ctx, [].slice.call(arguments, 1)); } catch (e) { if (window.console) console.warn("Variant E layout skipped:", e); return html; }
      return t.innerHTML;
    };
    S.themes.e = next;
  }
  function replace(name, fn) {
    var base = S.themes.e[name];
    var next = Object.assign({}, S.themes.e);
    next[name] = function () {
      try { return fn.apply(this, arguments); } catch (e) { if (window.console) console.warn("Variant E page fell back:", e); return base ? base.apply(this, arguments) : ""; }
    };
    S.themes.e = next;
  }
  function amount(p) { return String(p.amount_per_serving || ""); }
  function has(p) { var a = amount(p); for (var i = 1; i < arguments.length; i++) if (a.indexOf(arguments[i]) === -1) return false; return true; }
  function no(ctx, p) { return pad(Math.max(0, ctx.catalog.indexOf(p)) + 1); }
  function avail(p) { return p.published && p.stock > 0; }
  function cap(p, cls) { return '<img class="' + (cls || "ez-capimg") + '" src="/web/media/renders/' + esc(p.id) + '-cap.webp" alt="" width="400" height="400" decoding="async">'; }
  function hasRenders(ctx, p) { return Object.prototype.hasOwnProperty.call(ctx.bottleWidth || {}, p.id); }
  function capOrDot(ctx, p, cls) { return hasRenders(ctx, p) ? cap(p, cls) : '<span class="' + (cls || "ez-capimg") + ' ez-capdot" style="background:' + esc(p.color) + '"></span>'; }

  /* ====================================================================== 1. Seven label diagrams
     One explanatory visual per product, drawn from its label record. `mini` is the homepage card version. */
  var SIG = {
    "iron-bisglycinate": {
      hook: "The iron number, clearly stated.",
      ok: function (p) { return has(p, "29 mg", "elemental iron"); },
      draw: function () {
        return '<div class="ez-d ez-d-iron"><div class="ez-ring" aria-hidden="true"><span class="ez-ring-in"><b>29</b><i>mg</i></span></div>' +
          '<dl class="ez-d-key"><div><dt>Inner circle</dt><dd><strong>29 mg elemental iron</strong> per capsule: the iron itself.</dd></div>' +
          '<div><dt>Outer ring</dt><dd>Bound as <strong>Ferrochel® ferrous bisglycinate chelate</strong>. The compound’s own weight is not the number on the label.</dd></div></dl></div>';
      },
      cap: "Serving: 1 capsule · Pack: 60 capsules",
    },
    "l-theanine": {
      hook: "200 mg. A clear starting point.",
      ok: function (p) { return has(p, "200 mg") && /30 capsules/.test(p.pack_size || ""); },
      draw: function () {
        var dots = ""; for (var i = 0; i < 30; i++) dots += "<i" + (i === 0 ? ' class="is-one"' : "") + "></i>";
        return '<div class="ez-d ez-d-theanine"><div class="ez-unit"><span class="ez-capsule" aria-hidden="true"></span><p><b>200 mg</b> L-Theanine in 1 capsule</p></div>' +
          '<div class="ez-pack"><div class="ez-dots" aria-hidden="true">' + dots + '</div><p><b>30 capsules</b> in a pack · 30 servings of 1 capsule</p></div></div>';
      },
      cap: "The full ingredient name is L-Theanine. Ingredient origin is not stated on the label.",
    },
    "vitamin-d3-k2": {
      hook: "Three nutrient entries. One softgel.",
      ok: function (p) { return has(p, "600 IU", "55 mcg", "200 mg"); },
      draw: function () {
        return '<div class="ez-d ez-d-d3"><ol class="ez-windows">' +
          '<li><span class="ez-w-k">Vitamin D3</span><b>600<i>IU</i></b><small>cholecalciferol</small></li>' +
          '<li><span class="ez-w-k">Vitamin K2</span><b>55<i>mcg</i></b><small>MK-7</small></li>' +
          '<li><span class="ez-w-k">Omega-3</span><b>200<i>mg</i></b><small>from 250 mg fish oil · includes EPA 100 mg, DHA 75 mg</small></li></ol>' +
          '<p class="ez-d-rule"><span aria-hidden="true">IU ≠ mcg ≠ mg</span> Three different units. They are never added together.</p></div>';
      },
      cap: "Per 1 softgel · 60 softgels",
    },
    "omega-3-fish-oil": {
      hook: "Read inside the 1,000 mg.",
      ok: function (p) { return has(p, "1,000 mg", "800 mg", "EPA 400 mg", "DHA 300 mg"); },
      draw: function () {
        return '<div class="ez-d ez-d-nest" role="img" aria-label="Fish oil concentrate 1,000 mg contains total Omega-3 800 mg, which includes EPA 400 mg and DHA 300 mg.">' +
          '<div class="ez-n ez-n-1" style="--w:100%"><span class="ez-n-l">Fish oil concentrate <b>1,000 mg</b></span>' +
          '<div class="ez-n ez-n-2" style="--w:80%"><span class="ez-n-l">Total Omega-3 <b>800 mg</b></span>' +
          '<div class="ez-n-row"><div class="ez-n ez-n-3" style="--w:50%"><span class="ez-n-l">EPA <b>400 mg</b></span></div><div class="ez-n ez-n-3 is-alt" style="--w:37.5%"><span class="ez-n-l">DHA <b>300 mg</b></span></div><div class="ez-n ez-n-rest" style="--w:12.5%"><span class="ez-n-l">not itemised</span></div></div></div>' +
          '<span class="ez-n-rest-l">rest of the oil · not itemised on the label</span></div></div>' +
          '<p class="ez-d-rule">EPA and DHA are part of the 800 mg, not added to it. Widths are drawn to scale.</p>';
      },
      cap: "Per 1 softgel · Anchovy (Engraulis ringens) · 60 softgels",
    },
    "myo-d-chiro-inositol": {
      hook: "A ratio you can read.",
      ok: function (p) { return has(p, "2,000 mg", "50 mg", "40:1"); },
      draw: function () {
        var sq = ""; for (var i = 0; i < 40; i++) sq += "<i></i>";
        return '<div class="ez-d ez-d-ratio"><div class="ez-ratio" aria-hidden="true"><div class="ez-sq">' + sq + '</div><span class="ez-colon">:</span><div class="ez-sq is-one"><i></i></div></div>' +
          '<p class="ez-ratio-t"><b>40 : 1</b> Myo-Inositol to D-Chiro Inositol</p>' +
          '<div class="ez-unit"><span class="ez-capsule" aria-hidden="true"></span><span class="ez-capsule" aria-hidden="true"></span><span class="ez-capsule" aria-hidden="true"></span><p><b>2,000 mg</b> + <b>50 mg</b> in a 3-capsule serving</p></div></div>';
      },
      cap: "A ratio describes the two amounts. It does not describe an outcome. 90 capsules · 30 servings.",
    },
    "creatine-chews": {
      hook: "Two tablets. The full details.",
      ok: function (p) { return has(p, "3,000 mg", "2 tablets"); },
      draw: function () {
        return '<div class="ez-d ez-d-creatine"><div class="ez-eq" aria-hidden="true"><span class="ez-tab">1</span><span class="ez-plus">+</span><span class="ez-tab">2</span><span class="ez-arrow">=</span></div>' +
          '<p class="ez-big"><b>3,000 mg</b> creatine monohydrate</p>' +
          '<dl class="ez-d-key"><div><dt>Format</dt><dd>Chewable tablets, chewed, not swallowed whole. Not gummies.</dd></div>' +
          '<div><dt>Sugar</dt><dd><strong>Not sugar-free:</strong> 3.60 g total sugar, all of it added, per 2 tablets.</dd></div>' +
          '<div><dt>Flavour</dt><dd>Orange. Sweetened with steviol glycosides and dextrose.</dd></div></dl></div>';
      },
      cap: "Per 2 chewable tablets · 60 tablets · 30 servings. Tablets drawn as symbols, not their actual appearance.",
    },
    "psyllium-husk": {
      hook: "Husk and fibre, separately.",
      ok: function (p) { return has(p, "2,000 mg", "1,578 mg", "1,362 mg"); },
      draw: function () {
        return '<div class="ez-d ez-d-nest" role="img" aria-label="Psyllium husk 2,000 mg provides dietary fibre 1,578 mg, which includes soluble fibre 1,362 mg.">' +
          '<div class="ez-n ez-n-1" style="--w:100%"><span class="ez-n-l">Psyllium husk (Isabgol) <b>2,000 mg</b></span>' +
          '<div class="ez-n ez-n-2" style="--w:78.9%"><span class="ez-n-l">Dietary fibre <b>1,578 mg</b></span>' +
          '<div class="ez-n-row"><div class="ez-n ez-n-3" style="--w:86.3%"><span class="ez-n-l">Soluble fibre <b>1,362 mg</b></span></div></div></div></div></div>' +
          '<p class="ez-d-rule">Husk weight and fibre are different values. Widths are drawn to scale.</p>';
      },
      cap: "Per 5 capsules, at night with food and a full glass of water (label directions) · 150 capsules",
    },
  };
  function sigOf(p) { var s = SIG[p.id]; return s && s.ok(p) ? s : null; }
  function sigFigure(ctx, p, mini) {
    var s = sigOf(p);
    if (!s) return "";
    return '<figure class="ez-sig' + (mini ? " is-mini" : "") + '" style="' + ctx.capStyle(p) + '"><div class="ez-sig-art">' + s.draw(p) + '</div><figcaption>' + esc(s.cap) + "</figcaption></figure>";
  }

  /* ====================================================================== 2. Home: the Living Fan Deck */
  function bottleImg(ctx, p, eager) {
    return hasRenders(ctx, p)
      ? '<img src="/web/media/renders/' + esc(p.id) + '-three-quarter.webp" alt="" width="' + (/iron|theanine|vitamin/.test(p.id) ? 629 : 517) + '" height="1000" decoding="async"' + (eager ? ' fetchpriority="high"' : "") + ">"
      : h.front(ctx, p, { alt: "", eager: eager });
  }
  function infoFor(ctx, p) {
    var on = avail(p);
    return '<p class="ez-info-k"><span>' + no(ctx, p) + " / " + pad(ctx.published.length) + "</span><span>" + esc(ctx.format[p.id] || p.format || "") + "</span></p>" +
      '<h2 class="ez-info-name e-name">' + esc(p.name) + "</h2>" +
      '<p class="ez-info-fact">' + esc(p.subtitle || "") + "</p>" +
      '<div class="ez-info-buy"><p class="ez-info-price">' + ctx.money(p.price) + ' <small>MRP</small></p><p class="ez-avail" data-state="' + (on ? "in" : "out") + '">' + (on ? "In stock" : !p.published ? "Not available" : "Out of stock") + "</p>" +
      '<a class="x-btn ez-view" href="/products/' + esc(p.id) + '" data-ez-view><span>View ' + esc(p.name) + "</span></a>" + h.addBtn(ctx, p, "x-link ez-add", "Add to bag") + "</div>";
  }
  function hero(ctx) {
    var list = ctx.published, start = Math.min(3, list.length - 1), n = list.length;
    var data = list.map(function (p) { return { id: p.id, color: p.color, ink: ctx.onCap(p.color), html: infoFor(ctx, p) }; });
    return '<section class="ez-hero" data-home-section="hero" aria-labelledby="ez-hero-t" style="--n:' + n + '">' +
      '<div class="ez-hero-copy"><p class="ez-k">Body Café Co. · ' + pad(1) + "–" + pad(n) + '</p><h1 id="ez-hero-t">Seven supplements. <span>One colour each.</span></h1>' +
      '<p class="ez-lede">Seven everyday supplements. Each has its own cap colour, and every label fact in readable text.</p>' +
      '<div class="ez-actions"><a class="x-btn" href="/shop"><span>Shop all ' + (n === 7 ? "seven" : n) + '</span></a><a class="x-link" href="/reports">Find a lot report</a></div>' +
      (RELEASE.production ? "" : '<p class="ez-small">Review preview · current project prices · ordering is not live.</p>') + "</div>" +
      '<div class="ez-deck" data-ez-deck data-ez-start="' + start + '">' +
      '<div class="ez-fan" data-ez-fan aria-hidden="true">' + list.map(function (p, i) {
        return '<span class="ez-fan-b" data-ez-b="' + i + '" style="--i:' + i + ";--o:" + (i - (n - 1) / 2) + ";z-index:" + (n - Math.abs(Math.round(i - (n - 1) / 2))) + ";" + ctx.capStyle(p) + '"' + (i === start ? " data-on" : "") + ">" + bottleImg(ctx, p, true) + "</span>";
      }).join("") + '<span class="ez-fan-shelf"></span></div>' +
      '<div class="ez-info" data-ez-info aria-live="polite" style="' + ctx.capStyle(list[start]) + '"><span class="ez-swatch" data-ez-swatch aria-hidden="true"></span><div class="ez-info-in" data-ez-info-in>' + data[start].html + "</div></div>" +
      '<div class="ez-caps" role="group" aria-label="Choose a colour">' + list.map(function (p, i) {
        return '<button type="button" class="ez-cap" data-ez-pick="' + i + '" aria-pressed="' + (i === start) + '" style="' + ctx.capStyle(p) + '">' + capOrDot(ctx, p, "ez-cap-img") + '<span class="ez-cap-no" aria-hidden="true">' + no(ctx, p) + '</span><span class="ez-cap-name">' + esc(p.name) + "</span></button>";
      }).join("") + "</div>" +
      '<script type="application/json" data-ez-data>' + JSON.stringify(data).replace(/</g, "\\u003c") + "</script></div></section>";
  }
  function collection(ctx) {
    var list = ctx.published;
    return '<section class="ez-shelf" id="collection" data-home-section="collection" aria-labelledby="ez-shelf-t"><header class="ez-sec-head"><p class="ez-k">The collection</p><h2 id="ez-shelf-t">Seven, side by side.</h2><p>Every product keeps its number, its colour and its name. Here is what is in each pack.</p></header>' +
      '<ol class="ez-shelf-list">' + list.map(function (p) {
        var on = avail(p);
        return '<li class="ez-unitcard" style="' + ctx.capStyle(p) + '"><a class="ez-unitcard-media" href="/products/' + esc(p.id) + '" tabindex="-1" aria-hidden="true">' + h.front(ctx, p, { alt: "" }) + '</a><p class="ez-unitcard-k"><span class="ez-chip-dot" aria-hidden="true"></span>' + no(ctx, p) + " · " + esc(ctx.format[p.id] || "") + '</p><h3><a class="e-name" href="/products/' + esc(p.id) + '">' + esc(p.name) + "</a></h3>" +
          '<p class="ez-unitcard-fact">' + esc(p.pack_size || "") + (p.serving_size ? " · " + esc(p.serving_size) + " a serving" : "") + "</p>" +
          '<div class="ez-unitcard-foot"><p class="ez-unitcard-price">' + ctx.money(p.price) + '<small>' + (on ? "In stock" : "Unavailable") + "</small></p>" + h.addBtn(ctx, p, "ez-mini-add", "Add") + "</div></li>";
      }).join("") + '</ol><p class="ez-sec-foot"><a class="x-link" href="/shop">Compare and filter in the shop</a></p></section>';
  }
  function details(ctx) {
    var list = ctx.published.filter(function (p) { return sigOf(p); });
    if (!list.length) return "";
    return '<section class="ez-details" data-home-section="curiosity" aria-labelledby="ez-det-t"><header class="ez-sec-head"><p class="ez-k">From the labels</p><h2 id="ez-det-t">One colour. One useful detail.</h2><p>Every label has one number worth reading slowly. Each card is drawn from that product’s own label.</p></header>' +
      '<ol class="ez-det-list">' + list.map(function (p) {
        return '<li class="ez-det" style="' + ctx.capStyle(p) + '"><p class="ez-det-k"><span class="ez-chip-dot" aria-hidden="true"></span>' + esc(p.name) + '</p><h3>' + esc(SIG[p.id].hook) + "</h3>" + sigFigure(ctx, p, true) + '<a class="x-link" href="/products/' + esc(p.id) + '#detail">Read the ' + esc(p.name) + " label</a></li>";
      }).join("") + "</ol></section>";
  }
  function evidence() {
    var rows = [
      ["Label facts", "Available for all seven", "Amounts, serving, directions, cautions, allergens and the named manufacturer, transcribed from the supplied final label artwork.", "/standards#record", "See the record sheet", "in"],
      ["Ingredient origin and testing documents", "Not yet published", "These stay marked as unpublished until real documents are supplied. A manufacturer’s address doesn’t show where an ingredient comes from.", "/standards", "How we separate evidence", "pending"],
      ["Lot records", RELEASE.production ? "Lookup by lot number" : "Demonstration records in this preview", "Each pack carries a lot number. A report describes a sample from one lot, not your individual pack.", "/reports", "Look up a lot", RELEASE.production ? "in" : "demo"],
    ];
    return '<section class="ez-evidence" data-home-section="trust" aria-labelledby="ez-ev-t"><header class="ez-sec-head"><p class="ez-k">Behind the colour</p><h2 id="ez-ev-t">What you can check today.</h2></header><ol class="ez-ev-list">' +
      rows.map(function (r, i) { return '<li><p class="ez-ev-n">' + pad(i + 1) + '</p><h3>' + r[0] + '</h3><p class="ez-status" data-state="' + r[5] + '">' + r[1] + "</p><p>" + r[2] + '</p><a class="x-link" href="' + r[3] + '">' + r[4] + "</a></li>"; }).join("") + "</ol></section>";
  }
  function lot(ctx) {
    var c = S.copy.reports;
    return '<section class="ez-lot" data-home-section="lot" aria-labelledby="ez-lot-t"><div class="ez-lot-copy"><p class="ez-k">Lot report</p><h2 id="ez-lot-t">Your bottle has a reference.</h2><p>' + c.what + '</p><p class="ez-small"><a class="x-link" href="/learn/understanding-reports">What a lot report shows, and what it can’t</a></p></div><div class="ez-lot-form">' + h.homeLotForm(ctx, "x-lotform e-lotform") + "</div></section>";
  }
  function learnInvite() {
    var picks = [["/learn/reading-a-label", "Read a label with confidence", "Start with the serving, then the full ingredient name."], ["/learn/ingredient-forms", "Why ingredient forms matter", "Compound weight versus the amount that counts."], ["/learn/understanding-evidence", "Understanding evidence", "Four kinds of evidence, and what each one proves."]];
    return '<section class="ez-learn" data-home-section="learn" aria-labelledby="ez-learn-t"><header class="ez-sec-head"><p class="ez-k">Learn</p><h2 id="ez-learn-t">A little more knowing.</h2><p>Short, sourced guides to reading what is on a label. General explanations, kept separate from our product facts.</p></header><ol class="ez-learn-list">' +
      picks.map(function (x, i) { return '<li><a href="' + x[0] + '"><span class="ez-learn-n">' + pad(i + 1) + "</span><strong>" + x[1] + "</strong><span>" + x[2] + "</span></a></li>"; }).join("") + '</ol><p class="ez-sec-foot"><a class="x-link" href="/learn">All guides and the glossary</a></p></section>';
  }
  function faq() {
    var H = h.HOME;
    return '<section class="ez-faq" data-home-section="faq" aria-labelledby="ez-faq-t"><header class="ez-sec-head"><p class="ez-k">Before you order</p><h2 id="ez-faq-t">Good questions welcome here.</h2><a class="x-link" href="/help">Visit the help centre</a></header><div class="x-faqs">' + h.faqs(H.faq) + "</div></section>";
  }
  replace("home", function (ctx) {
    if (!ctx.published.length) return '<section class="ez-hero is-empty"><div class="ez-hero-copy"><h1>Seven supplements. <span>One colour each.</span></h1><p class="ez-lede">The collection is resting right now. Please check back soon.</p></div></section>';
    return hero(ctx) + collection(ctx) + details(ctx) + evidence() + lot(ctx) + learnInvite() + faq();
  });

  /* ====================================================================== 3. Product page: One colour, in detail */
  wrap("product", function (root, ctx, args) {
    var p = args[0]; if (!p) return;
    var pp = root.querySelector(".pp-e"); if (!pp) return;
    pp.classList.add("ezp");
    var band = pp.querySelector(".pp-band"); if (band) band.setAttribute("data-ez-band", "");
    var s = sigOf(p), ov = pp.querySelector("#overview");
    var desc = p.description || "";
    var detail = '<section class="pp-sec ezp-detail" id="detail" aria-labelledby="detail-t"><div class="pp-sec-in"><header class="pp-head"><p class="pp-k"><span class="pp-k-n">02</span><span class="pp-k-l">The defining detail</span><span class="pp-k-of">/ 08</span></p><h2 id="detail-t">' + esc(s ? s.hook : "What is it?") + "</h2></header>" +
      '<div class="pp-body">' + (desc ? '<p class="pp-lead">' + esc(desc) + "</p>" : "") + (s ? sigFigure(ctx, p) : (ov ? ov.querySelector(".pp-body").innerHTML : "")) + "</div></div></section>";
    if (ov) ov.replaceWith(frag(detail));
    // Section numbers follow the order on the page.
    var secs = pp.querySelectorAll(".pp-sec"), total = secs.length + 1;
    secs.forEach(function (sec, i) {
      var n = sec.querySelector(".pp-k-n"), of = sec.querySelector(".pp-k-of");
      if (n) n.textContent = pad(i + 2);
      if (of) of.textContent = "/ " + pad(total);
    });
    var quick = pp.querySelector(".pp-quick");
    if (quick && s) quick.insertAdjacentHTML("afterbegin", '<a href="#detail">The detail</a>');
  });

  /* ====================================================================== 4. Behaviour */
  var run = { abort: null };
  function reduced() { return matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function fine() { return matchMedia("(hover: hover) and (pointer: fine)").matches; }
  function deckBehaviour(main, signal) {
    var deck = main.querySelector("[data-ez-deck]"); if (!deck) return;
    var data = []; try { data = JSON.parse(deck.querySelector("[data-ez-data]").textContent); } catch (e) { return; }
    var picks = [].slice.call(deck.querySelectorAll("[data-ez-pick]")), bottles = [].slice.call(deck.querySelectorAll("[data-ez-b]"));
    var info = deck.querySelector("[data-ez-info]"), inner = deck.querySelector("[data-ez-info-in]");
    var cur = Number(deck.getAttribute("data-ez-start")) || 0;
    function select(i, focus) {
      if (i === cur || !data[i]) { if (focus) picks[i].focus(); return; }
      cur = i;
      picks.forEach(function (b, k) { b.setAttribute("aria-pressed", String(k === i)); });
      bottles.forEach(function (b, k) { if (k === i) b.setAttribute("data-on", ""); else b.removeAttribute("data-on"); });
      info.style.setProperty("--cap", data[i].color);
      info.style.setProperty("--on-cap", data[i].ink);
      inner.innerHTML = data[i].html;
      if (!reduced()) { info.classList.remove("is-swap"); void info.offsetWidth; info.classList.add("is-swap"); }
      if (focus) picks[i].focus();
    }
    picks.forEach(function (b, i) {
      b.addEventListener("click", function () { select(i); }, { signal: signal });
      b.addEventListener("focus", function () { select(i); }, { signal: signal });
      b.addEventListener("pointerenter", function () { if (fine()) select(i); }, { signal: signal });
      b.addEventListener("keydown", function (e) {
        var k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (e.key === "Home") { e.preventDefault(); select(0, true); return; }
        if (e.key === "End") { e.preventDefault(); select(picks.length - 1, true); return; }
        if (k === undefined) return;
        e.preventDefault(); select((cur + k + picks.length) % picks.length, true);
      }, { signal: signal });
    });
    bottles.forEach(function (b, i) { b.addEventListener("click", function () { select(i); }, { signal: signal }); });
  }

  /* The chosen swatch carries into the product page's cap band. */
  var handoff = null;
  document.addEventListener("click", function (e) {
    if (document.body.dataset.theme !== "e" || reduced() || !document.startViewTransition) return;
    var a = e.target.closest && e.target.closest("a[data-ez-view], .e-sibs a, .ez-unitcard a, a.e-name");
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var path = (a.getAttribute("href") || "").split("#")[0];
    if (!/^\/products\//.test(path)) return;
    var sw = a.closest("[data-ez-deck]") ? a.closest("[data-ez-deck]").querySelector("[data-ez-swatch]") : a.closest("li, .ez-unitcard");
    if (!sw) return;
    document.querySelectorAll("[data-ez-vt]").forEach(function (x) { x.style.viewTransitionName = ""; x.removeAttribute("data-ez-vt"); });
    sw.style.viewTransitionName = "ez-swatch"; sw.setAttribute("data-ez-vt", "");
    handoff = { path: path.split("?")[0], at: Date.now() };
    setTimeout(function () { if (sw.isConnected) { sw.style.viewTransitionName = ""; sw.removeAttribute("data-ez-vt"); } }, 1500);
  }, true);
  function receive(main) {
    if (!handoff || Date.now() - handoff.at > 2500) { handoff = null; return; }
    var path = handoff.path; handoff = null;
    if (location.pathname !== path) return;
    var band = main.querySelector("[data-ez-band]"); if (!band) return;
    band.style.viewTransitionName = "ez-swatch"; band.setAttribute("data-ez-vt", "");
    setTimeout(function () { band.style.viewTransitionName = ""; band.removeAttribute("data-ez-vt"); }, 1500);
  }

  var hooks = [];
  function enhance() {
    var main = document.querySelector("#main");
    if (!main || document.body.dataset.theme !== "e") return;
    if (run.abort) run.abort.abort();
    run.abort = new AbortController();
    var signal = run.abort.signal;
    receive(main);
    deckBehaviour(main, signal);
    hooks.forEach(function (fn) { try { fn(main, signal); } catch (e) { if (window.console) console.warn(e); } });
  }
  // Run after every shared module's own behaviour (the B layer's hook is called last by app.js).
  var VB = window.BCCVariantB;
  if (VB && typeof VB.enhance === "function") {
    var vbEnhance = VB.enhance;
    VB.enhance = function () { var r = vbEnhance.apply(this, arguments); enhance(); return r; };
  } else if (window.BCCEH) {
    var ehEnhance = window.BCCEH.enhance;
    window.BCCEH.enhance = function () { var r = ehEnhance.apply(this, arguments); setTimeout(enhance, 0); return r; };
  }
  window.BCCLivingE = { wrap: wrap, replace: replace, esc: esc, pad: pad, frag: frag, sig: sigFigure, sigOf: sigOf, SIG: SIG, cap: capOrDot, no: no, avail: avail, onEnhance: function (fn) { hooks.push(fn); } };
})();
