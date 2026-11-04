/* Body Café Co. — Variant E · product page in the MyProtein layout (owner request, 3 November 2026).
   Reference: myprotein.co.in creatine monohydrate product page. Same sections, same order, our colours and copy:
   left column  — gallery · Description / Key Benefits / Suggested Use / Nutritional Information / Ingredients
                  (accordion, all closed by default) · Lot report (kept at the owner's request) · Frequently bought with ·
                  Recommended for you · Customer reviews
   right column — sticky buy box: tags, rating, name, subtitle, pack, quantity, price, Add to bag, delivery lines.
   Our extra sections (section bar, At a glance, pour tray, questions, pincode) are dropped. Every label fact stays.
   Loaded after pdp-v2-e.js; it only moves and restyles what the earlier layers rendered. */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE;
  if (!S || !S.themes || !S.themes.e || !L) return;
  var esc = L.esc, E = window.BCCPdpE || {};

  function stars(avg) {
    var v = Math.round((avg || 0) * 2) / 2;
    return '<span class="mp-stars" aria-hidden="true">' + [1, 2, 3, 4, 5].map(function (i) { return '<i class="' + (v >= i ? "is-on" : v >= i - 0.5 ? "is-half" : "") + '">★</i>'; }).join("") + "</span>";
  }
  function item(id, title, body, open) {
    if (!body) return "";
    return '<details class="mp-acc-i" id="' + id + '"' + (open ? " open" : "") + '><summary><span>' + esc(title) + '</span><i class="mp-chev" aria-hidden="true"></i></summary><div class="mp-acc-b">' + body + "</div></details>";
  }
  function html(n) { return n ? n.outerHTML : ""; }
  function inner(n) { return n ? n.innerHTML : ""; }
  // Small cards use the normalised bottle set (one frame and bottle size for all seven) so the row reads evenly.
  var NORMALIZED = { "iron-bisglycinate": 1, "l-theanine": 1, "vitamin-d3-k2": 1, "omega-3-fish-oil": 1, "myo-d-chiro-inositol": 1, "creatine-chews": 1, "psyllium-husk": 1 };
  function img(id) { return NORMALIZED[id] || !window.BCCBottleAssets ? "/web/media/bottles-normalized/" + id + ".svg" : window.BCCBottleAssets.url(id); }

  /* Sample reviews for the design preview only (owner request, 3 November 2026). Like the other demonstration
     fixtures they are labelled on every card, never marked as verified purchases, never saved or sent, and they are
     hidden in production builds and as soon as a product has a real published review. No health outcomes claimed. */
  var SAMPLE = [
    { r: 5, t: "Clear directions", n: "Priya S.", d: "28/10/26", x: "The serving size and directions are easy to find. I like having the full ingredient list available on the product page." },
    { r: 5, t: "Finally a label I can read", n: "Rahul M.", d: "24/10/26", x: "The form and the amount per serving are printed on the front. No hunting through small print to work out what I'm taking." },
    { r: 4, t: "Well packed, delivery a bit slow", n: "Ananya K.", d: "19/10/26", x: "Arrived sealed and well packed. Delivery took a couple of days longer than I expected, otherwise no complaints." },
    { r: 5, t: "Easy to find the lot lookup", n: "Vikram P.", d: "15/10/26", x: "The website has a place to enter the lot number printed on the pack. It also explains what a lot report covers." },
    { r: 4, t: "Simple, no fuss", n: "Meera J.", d: "09/10/26", x: "The product information is easy to follow. I'd like a bigger pack option so I reorder less often." }
  ];
  var SAMPLE_AVG = Math.round(SAMPLE.reduce(function (n, s) { return n + s.r; }, 0) / SAMPLE.length * 10) / 10;
  function SAMPLE_ON() { return !(window.BCCRelease && window.BCCRelease.production); }
  function sampleBlock() {
    var by = [5, 4, 3, 2, 1].map(function (k) { return SAMPLE.filter(function (s) { return s.r === k; }).length; });
    return '<div class="mp-rv" data-mp-rv-sample>' +
      '<div class="mp-rv-chips" role="group" aria-label="Filter sample reviews by rating">' + [5, 4, 3, 2, 1].map(function (k, i) { return '<button type="button" data-mp-rv-f="' + k + '" aria-pressed="false"' + (by[i] ? "" : " disabled") + ">" + k + " ★ <span>" + by[i] + "</span></button>"; }).join("") + "</div>" +
      '<div class="mp-rv-row"><div class="mp-rv-all"><p class="mp-rv-k">Overall rating</p><p class="mp-rv-avg">' + stars(SAMPLE_AVG) + "<b>" + SAMPLE_AVG + "</b></p><p class=\"mp-rv-n\">(" + SAMPLE.length + " sample reviews)</p>" +
      '<ol class="mp-rv-bars">' + [5, 4, 3, 2, 1].map(function (k, i) { return "<li><span>" + k + ' ★</span><i><b style="width:' + Math.round(by[i] / SAMPLE.length * 100) + '%"></b></i><span>' + by[i] + "</span></li>"; }).join("") + "</ol></div>" +
      '<ul class="mp-rv-cards" data-mp-rv-cards>' + SAMPLE.map(function (s) {
        return '<li class="mp-rv-card" data-r="' + s.r + '"><p class="mp-rv-top"><span class="mp-rv-star">★ ' + s.r + '</span><span class="mp-rv-tag">Sample review</span></p><h3>' + esc(s.t) + '</h3><p class="mp-rv-by">' + s.d + " by " + esc(s.n) + "</p><p>" + esc(s.x) + "</p></li>";
      }).join("") + "</ul></div>" +
      '<div class="mp-rv-foot"><p class="mp-rv-note" role="note">Sample reviews for the design preview. They are not from customers and do not appear in the production build.</p><div class="mp-rec-nav"><button type="button" data-mp-rv-nav="-1" aria-label="Previous reviews">‹</button><button type="button" data-mp-rv-nav="1" aria-label="Next reviews">›</button></div></div></div>';
  }

  L.wrap("product", function (root, ctx, args) {
    var p = args[0], pp = root.querySelector(".pp-e"); if (!pp || !p) return;
    var seed = (E.P && E.P[p.id]) || {};
    var q = function (s) { return pp.querySelector(s); };
    var buy = q("#buy"), about = q("#about-product"), use = q("#use"), ing = q("#ingredients"), qual = q("#quality"), rv = q("#reviews"), ex = q("#explore");
    if (!buy) return;
    pp.setAttribute("data-mp", "");

    // ---------- Left: Description, Key Benefits, Suggested Use, Nutritional Information, Ingredients ----------
    var headline = (about && about.querySelector(".pp-head h2") || {}).textContent || p.headline || seed.headline || "";
    var intro = p.product_intro ?? seed.intro ?? "";
    var story = p.product_story ?? seed.story ?? "";
    var whyFold = about && about.querySelector(".spe-why .pv-fold");
    var whyText = whyFold ? [].slice.call(whyFold.children).filter(function (n) { return n.tagName !== "SUMMARY"; }).map(html).join("") : "";
    var desc = '<h2 class="mp-desc-h">' + esc(headline) + "</h2>" + (intro ? "<p>" + esc(intro) + "</p>" : "") +
      (whyText ? '<h3>Why this form?</h3>' + whyText : "") + (story ? "<h3>The story</h3><p>" + esc(story) + "</p>" : "");

    var front = p.label_front || {}, benefits = [];
    if (front.claim) benefits.push(front.claim);
    (p.label_badges || []).forEach(function (b) { benefits.push(b); });
    var sig = about && about.querySelector(".ez-sig");
    var onPack = ing && ing.querySelector(".spe-front .pv-fold");
    var onPackBody = onPack ? [].slice.call(onPack.children).filter(function (n) { return n.tagName !== "SUMMARY"; }).map(html).join("") : "";
    var keyB = (benefits.length ? '<ul class="mp-list">' + benefits.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul>" : "") + html(sig) +
      (onPackBody ? '<h3>On the pack</h3>' + onPackBody : "");

    var cautions = buy.querySelector(".hm-cautions .hm-bullets");
    var suggested = use ? html(use.querySelector(".spe-when")) + html(use.querySelector(".pp-lead")) +
      (cautions ? "<h3>Cautions</h3>" + html(cautions) : "") + html(ing && ing.querySelector(".pv-rows.pp-facts-use")) + html(use.querySelector(".pp-safety")) : "";

    var facts = html(ing && ing.querySelector(".spe-facts"));
    var label = ing && ing.querySelector(".pv-rows.pp-facts-label");
    var folds = ing ? [].slice.call(ing.querySelectorAll(".pp-body > .pv-fold")).filter(function (f) { return !f.closest(".spe-front"); }).map(html).join("") : "";
    var pdf = qual && qual.querySelector(".ppf-label");
    var ingredients = html(label) + folds + html(pdf);

    var acc = '<div class="mp-acc">' + item("description", "Description", desc) + item("key-benefits", "Key Benefits", keyB) +
      item("suggested-use", "Suggested Use", suggested) + item("nutritional-information", "Nutritional Information", facts) + item("ingredients-list", "Ingredients", ingredients) + "</div>";

    // ---------- Left: Lot report (kept from our page) ----------
    var lot = "";
    if (qual) {
      var steps = qual.querySelector(".pv-steps"), lotbox = qual.querySelector(".pp-lotbox"), qfold = qual.querySelector(".pv-fold");
      lot = '<section class="mp-card mp-lot" id="lot-report" aria-labelledby="mp-lot-t"><h3 id="mp-lot-t" class="mp-card-h">Lot report</h3><p class="mp-card-sub">Check the lot printed on your pack. Records appear as reports are published.</p>' +
        html(steps) + html(lotbox) + html(qfold) + "</section>";
    }

    // ---------- Left: Frequently bought with · Recommended for you ----------
    var others = (ctx.catalog || []).filter(function (x) { return x.id !== p.id && x.published !== false; });
    var relIds = ex ? [].slice.call(ex.querySelectorAll(".pp-related a")).map(function (a) { return a.getAttribute("href").split("/").pop().split("?")[0]; }) : [];
    others.sort(function (a, b) { var ia = relIds.indexOf(a.id), ib = relIds.indexOf(b.id); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); });
    var money = ctx.money || function (n) { return "₹" + n; };
    function mini(x, current) {
      return '<div class="mp-fbt-i' + (current ? " is-current" : "") + '">' + (current ? "" : '<label class="mp-check"><input type="checkbox" checked data-mp-fbt="' + esc(x.id) + '" data-price="' + (+x.price || 0) + '"' + (x.stock < 1 ? " disabled" : "") + '><span class="sr-only">Add ' + esc(x.name) + "</span></label>") +
        '<a class="mp-fbt-img" href="/products/' + esc(x.id) + '" style="--cap:' + esc(x.color || "") + '"><img src="' + img(x.id) + '" alt="" loading="lazy" decoding="async"></a>' +
        '<div class="mp-fbt-t"><a href="/products/' + esc(x.id) + '">' + esc(x.name) + (ctx.format && ctx.format[x.id] ? " · " + esc(ctx.format[x.id]) : "") + '</a><b>' + money(x.price) + '</b><small>Inclusive of all taxes</small></div></div>';
    }
    var pair = others.slice(0, 2), fbt = "";
    if (pair.length) {
      var sum = [p].concat(pair).reduce(function (n, x) { return n + (+x.price || 0); }, 0);
      fbt = '<section class="mp-card mp-fbt" aria-labelledby="mp-fbt-t" data-mp-fbt-box data-self="' + esc(p.id) + '" data-self-price="' + (+p.price || 0) + '"><h3 id="mp-fbt-t" class="mp-card-h">Frequently bought with</h3><p class="mp-card-sub">Complete your routine with products that sit well together</p>' +
        '<div class="mp-fbt-grid"><div class="mp-fbt-cur"><p class="mp-fbt-k">Current item selected</p>' + mini(p, true) + '</div><span class="mp-plus" aria-hidden="true">+</span><div class="mp-fbt-list">' + pair.map(function (x) { return mini(x); }).join("") + "</div></div>" +
        '<div class="mp-fbt-foot"><p>Your total: <b data-mp-fbt-total>' + money(sum) + '</b></p><button type="button" class="mp-btn" data-mp-fbt-add>Add these to your bag</button></div></section>';
    }
    var rec = others.length ? '<section class="mp-rec" aria-labelledby="mp-rec-t"><div class="mp-rec-head"><h3 id="mp-rec-t" class="mp-card-h">Recommended for you</h3><div class="mp-rec-nav"><button type="button" data-mp-rec="-1" aria-label="Previous products">‹</button><button type="button" data-mp-rec="1" aria-label="Next products">›</button></div></div><ul class="mp-rec-row" data-mp-rec-row>' +
      others.map(function (x) {
        return '<li class="mp-rec-i" style="--cap:' + esc(x.color || "") + '"><a href="/products/' + esc(x.id) + '"><span class="mp-rec-img"><img src="' + img(x.id) + '" alt="" loading="lazy" decoding="async"></span><span class="mp-rec-n">' + esc(x.name) + '</span></a><b class="mp-rec-p">' + money(x.price) + '</b><small>Inclusive of all taxes</small>' +
          '<button type="button" class="mp-btn mp-quick" data-mp-quick="' + esc(x.id) + '"' + (x.stock < 1 ? " disabled" : "") + ">" + (x.stock < 1 ? "Unavailable" : "Quick buy") + "</button></li>";
      }).join("") + "</ul></section>" : "";

    // ---------- Left: Customer reviews (questions are not part of this layout) ----------
    var sample = SAMPLE_ON() && !(p.rating && +p.rating.count);
    if (rv) {
      rv.querySelectorAll(".pp-qa").forEach(function (n) { n.remove(); });
      var rh = rv.querySelector(".pp-head h2"); if (rh) rh.textContent = "Customer reviews";
      rv.className = "mp-reviews";
      if (sample) { rv.setAttribute("data-mp-sample", ""); var top = rv.querySelector(".pp-rv-top"); if (top) top.before(L.frag(sampleBlock())); }
    }

    // ---------- Right: sticky buy box ----------
    var panel = buy.querySelector(".pp-panel"), rating = sample ? { average: SAMPLE_AVG, count: SAMPLE.length } : p.rating || {}, count = +rating.count || 0;
    var price = buy.querySelector(".pp-price"), stock = buy.querySelector(".pp-stock"), qty = buy.querySelector("#product-quantity"), add = buy.querySelector("[data-action=add-product]");
    var tags = [ctx.format && ctx.format[p.id], front.mark && front.mark.replace(/\s*mark$/i, "")].filter(Boolean);
    var servings = parseInt(p.servings_per_pack || "", 10), per = servings && +p.price ? money(Math.round(p.price / servings * 100) / 100) : "";
    var max = qty ? qty.options.length : 1;
    var box = '<div class="mp-box">' +
      (tags.length ? '<ul class="mp-tags">' + tags.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" : "") +
      '<a class="mp-rate" href="#reviews">' + stars(rating.average) + "<span>" + (count ? count + (sample ? " sample" : "") + (count === 1 ? " review" : " reviews") : "No reviews yet") + "</span></a>" +
      html(buy.querySelector(".pp-h1")) + html(buy.querySelector(".pp-sub")) +
      '<div class="mp-opt"><p class="mp-opt-k">Pack:</p><div class="mp-opt-v"><span class="is-on">' + esc(p.pack_size || (servings ? servings + " servings" : "1 pack")) + "</span></div>" +
      (per ? '<p class="mp-per">' + per + " per serving</p>" : "") + "</div>" +
      '<div class="mp-qty-row"><div class="mp-qty" data-mp-qty data-max="' + max + '"><button type="button" data-mp-step="-1" aria-label="Decrease quantity">−</button><output aria-live="polite" data-mp-qty-v>1</output><button type="button" data-mp-step="1" aria-label="Increase quantity">+</button></div>' + (qty ? '<div class="sr-only" aria-hidden="true" inert>' + html(qty.closest(".pp-qty")) + "</div>" : "") + "</div>" +
      '<div class="mp-buy"><div class="mp-price">' + inner(price) + "<small>Inclusive of all taxes</small></div>" + html(add) + "</div>" +
      '<ul class="mp-ship">' + (stock ? "<li>" + html(stock) + "</li>" : "") + "<li>Free delivery on orders of ₹1,499 or more</li><li>Look up your lot online</li></ul>" +
      "</div>";

    var media = buy.querySelector(".pp-hero-media"), crumbs = buy.querySelector(".pp-crumbs");
    var shell = '<div class="mp-shell">' + html(crumbs) + '<div class="mp-grid"><div class="mp-left">' + html(media) + acc + lot + fbt + rec + '<div data-mp-rv></div></div><aside class="mp-right" aria-label="Buy ' + esc(p.name) + '">' + box + "</aside></div></div>";
    buy.innerHTML = shell;
    buy.className = "mp-top";
    if (rv) buy.querySelector("[data-mp-rv]").replaceWith(rv);
    [q(".ppf-tabs"), about, use, ing, qual, ex].forEach(function (n) { if (n) n.remove(); });
    // The sticky mobile bar's own handler looks for these; keep them findable.
    var bb = buy.querySelector(".mp-buy"); if (bb) bb.setAttribute("data-pp-buy", "");
  });

  L.onEnhance(function (main, signal) {
    var top = main.querySelector(".mp-top"); if (!top) return;
    var A = window.BCCApp || {}, sel = top.querySelector("#product-quantity"), qv = top.querySelector("[data-mp-qty-v]"), qbox = top.querySelector("[data-mp-qty]");
    function money(n) { return "₹" + Number(n).toLocaleString("en-IN"); }
    function total() {
      var box = top.querySelector("[data-mp-fbt-box]"); if (!box) return;
      var sum = +box.getAttribute("data-self-price");
      box.querySelectorAll("[data-mp-fbt]:checked").forEach(function (c) { sum += +c.getAttribute("data-price"); });
      box.querySelector("[data-mp-fbt-total]").textContent = money(sum);
    }
    top.addEventListener("change", function (e) { if (e.target.matches("[data-mp-fbt]")) total(); }, { signal: signal });
    top.addEventListener("click", function (e) {
      var t = e.target.closest("button"); if (!t) return;
      if (t.hasAttribute("data-mp-step") && sel && qv) {
        var v = Math.max(1, Math.min(+qbox.getAttribute("data-max") || 1, (+sel.value || 1) + +t.getAttribute("data-mp-step")));
        sel.value = String(v); qv.textContent = v;
      } else if (t.hasAttribute("data-mp-quick")) {
        var r = A.addToBag ? A.addToBag(t.getAttribute("data-mp-quick"), 1) : null;
        if (r && A.toast) A.toast(r.ok ? "Added to your bag." : r.message);
      } else if (t.hasAttribute("data-mp-fbt-add")) {
        var box = t.closest("[data-mp-fbt-box]"), ids = [box.getAttribute("data-self")];
        box.querySelectorAll("[data-mp-fbt]:checked").forEach(function (c) { ids.push(c.getAttribute("data-mp-fbt")); });
        var bad = ids.map(function (id) { return A.addToBag ? A.addToBag(id, 1) : { ok: false }; }).filter(function (r) { return !r.ok; });
        if (A.toast) A.toast(bad.length ? bad[0].message || "Some items couldn't be added." : ids.length + " items added to your bag.");
      } else if (t.hasAttribute("data-mp-rv-f")) {
        var on = t.getAttribute("aria-pressed") !== "true", k = t.getAttribute("data-mp-rv-f");
        top.querySelectorAll("[data-mp-rv-f]").forEach(function (b) { b.setAttribute("aria-pressed", String(on && b === t)); });
        top.querySelectorAll(".mp-rv-card").forEach(function (c) { c.hidden = on && c.getAttribute("data-r") !== k; });
      } else if (t.hasAttribute("data-mp-rv-nav")) {
        var cards = top.querySelector("[data-mp-rv-cards]"); if (cards) cards.scrollBy({ left: +t.getAttribute("data-mp-rv-nav") * cards.clientWidth * 0.8, behavior: "smooth" });
      } else if (t.hasAttribute("data-mp-rec")) {
        var row = top.querySelector("[data-mp-rec-row]"); if (row) row.scrollBy({ left: +t.getAttribute("data-mp-rec") * row.clientWidth * 0.8, behavior: "smooth" });
      }
    }, { signal: signal });
    // "N Reviews" opens the reviews; Description links in the old quick bar pointed at sections that no longer exist.
    top.querySelectorAll('a[href="#reviews"]').forEach(function (a) { a.addEventListener("click", function (e) { var r = main.querySelector("#reviews"); if (r) { e.preventDefault(); r.scrollIntoView({ behavior: "smooth", block: "start" }); } }, { signal: signal }); });
  });
})();
