/* Body Café Co. — Variant E · page families beyond the homepage and product pages.
   Each block wraps the FINAL E renderer for one route family and changes presentation only: ids, data-* hooks, form
   names and behaviour from the shared modules are kept. Colour identifies a product; status is always written out. */
(function () {
  "use strict";
  var L = window.BCCLivingE, S = window.BCCSite;
  if (!L || !S) return;
  var esc = L.esc, pad = L.pad, frag = L.frag;
  var RELEASE = window.BCCRelease || {};
  function store(k, v) { try { if (v === undefined) return JSON.parse(sessionStorage.getItem(k) || "null"); sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

  /* ====================================================================== Shop: the colour index */
  L.wrap("shop", function (root, ctx) {
    var page = root.querySelector(".sp-e") || root.querySelector(".sp"); if (!page) return;
    page.classList.add("ezs");
    var list = ctx.published;
    // A named index replaces the unlabelled colour bars.
    var sw = page.querySelector(".sp-swatches");
    var index = '<nav class="ez-index" aria-label="Go to a product"><ol>' + list.map(function (p) {
      return '<li><a href="/products/' + esc(p.id) + '" data-ez-jump="' + esc(p.id) + '" style="' + ctx.capStyle(p) + '"><span class="ez-chip-dot" aria-hidden="true"></span><span class="ez-index-no">' + L.no(ctx, p) + "</span>" + esc(p.name) + "</a></li>";
    }).join("") + "</ol></nav>";
    if (sw) sw.remove();
    var bar = page.querySelector(".sp-bar");
    if (bar) bar.parentNode.insertBefore(frag(index), bar); else page.insertAdjacentHTML("afterbegin", index);
    page.querySelectorAll(".sp-card").forEach(function (li) {
      var id = li.getAttribute("data-sp-item");
      li.id = "sp-" + id;
      var r = li.querySelector(".sp-rating.is-empty"); if (r) r.textContent = "No reviews yet";
      var acts = li.querySelector(".sp-actions");
      if (acts) acts.insertAdjacentHTML("beforeend", '<label class="ez-cmp-pick"><input type="checkbox" data-ez-compare="' + esc(id) + '"><span>Compare</span></label>');
    });
    // The Standards panel repeats what Standards and Reports already say; the shop stays about choosing.
    var std = page.querySelector("#shop-standards"); if (std) std.remove();
    var data = list.map(function (p) {
      return { id: p.id, name: p.name, color: p.color, ink: ctx.onCap(p.color), format: ctx.format[p.id] || p.format || "", pack: p.pack_size || "", serving: p.serving_size || "", servings: p.servings_per_pack || "", allergens: p.allergens || "", diet: p.dietary_suitability || "", price: ctx.money(p.price), stock: p.published && p.stock > 0 ? "In stock" : "Unavailable" };
    });
    page.insertAdjacentHTML("beforeend",
      '<div class="ez-cmp-shelf" data-ez-shelf hidden><p class="ez-cmp-count" data-ez-cmp-count aria-live="polite"></p><ol class="ez-cmp-chips" data-ez-cmp-chips></ol><div class="ez-cmp-acts"><button type="button" class="x-btn" data-ez-cmp-open><span>View differences</span></button><button type="button" class="x-link ez-linkbtn" data-ez-cmp-clear>Clear</button></div></div>' +
      '<dialog class="ez-cmp-dialog" data-ez-cmp-dialog aria-labelledby="ez-cmp-t"><div class="ez-cmp-head"><h2 id="ez-cmp-t">Pack facts, side by side</h2><button type="button" class="ez-close" data-ez-cmp-close aria-label="Close comparison">×</button></div><p class="ez-cmp-note">From each product’s label. This compares formats, packs and servings. It is not a guide to which supplement suits you, and different ingredients aren’t ranked by amount.</p><div class="ez-cmp-table" data-ez-cmp-table></div></dialog>' +
      '<script type="application/json" data-ez-cmp-data>' + JSON.stringify(data).replace(/</g, "\\u003c") + "</script>");
  });

  function shopBehaviour(main, signal) {
    var page = main.querySelector(".ezs"); if (!page) return;
    var data = []; try { data = JSON.parse(page.querySelector("[data-ez-cmp-data]").textContent); } catch (e) { return; }
    var byId = {}; data.forEach(function (d) { byId[d.id] = d; });
    var shelf = page.querySelector("[data-ez-shelf]"), chips = page.querySelector("[data-ez-cmp-chips]"), count = page.querySelector("[data-ez-cmp-count]");
    var dialog = page.querySelector("[data-ez-cmp-dialog]"), table = page.querySelector("[data-ez-cmp-table]");
    var picked = (store("ez-compare") || []).filter(function (id) { return byId[id]; }).slice(0, 3);
    function sync() {
      store("ez-compare", picked);
      page.querySelectorAll("[data-ez-compare]").forEach(function (cb) {
        var id = cb.getAttribute("data-ez-compare");
        cb.checked = picked.indexOf(id) !== -1;
        cb.disabled = !cb.checked && picked.length >= 3;
        cb.closest(".ez-cmp-pick").title = cb.disabled ? "Compare up to three products" : "";
      });
      shelf.hidden = !picked.length;
      count.textContent = picked.length + " of 3 chosen" + (picked.length < 2 ? " · choose one more to compare" : "");
      chips.innerHTML = picked.map(function (id) { var d = byId[id]; return '<li style="--cap:' + d.color + '"><span class="ez-chip-dot" aria-hidden="true"></span>' + esc(d.name) + '<button type="button" data-ez-cmp-remove="' + esc(id) + '" aria-label="Remove ' + esc(d.name) + ' from comparison">×</button></li>'; }).join("");
      page.querySelector("[data-ez-cmp-open]").disabled = picked.length < 2;
    }
    function render() {
      var rows = [["Format", "format"], ["Pack", "pack"], ["Serving size", "serving"], ["Servings per pack", "servings"], ["Allergens", "allergens"], ["Dietary marks", "diet"], ["Price", "price"], ["Availability", "stock"]];
      var cols = picked.map(function (id) { return byId[id]; });
      table.innerHTML = '<table><caption class="sr-only">Pack facts for ' + cols.map(function (c) { return esc(c.name); }).join(", ") + '</caption><thead><tr><td></td>' + cols.map(function (c) { return '<th scope="col" style="--cap:' + c.color + '"><span class="ez-cmp-band"></span><a class="e-name" href="/products/' + esc(c.id) + '">' + esc(c.name) + "</a></th>"; }).join("") + "</tr></thead><tbody>" +
        rows.map(function (r) { return '<tr><th scope="row">' + r[0] + "</th>" + cols.map(function (c) { return "<td>" + (c[r[1]] ? esc(c[r[1]]) : '<span class="ez-pending">Not stated</span>') + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>";
    }
    page.addEventListener("change", function (e) {
      var cb = e.target.closest && e.target.closest("[data-ez-compare]"); if (!cb) return;
      var id = cb.getAttribute("data-ez-compare");
      if (cb.checked && picked.indexOf(id) === -1 && picked.length < 3) picked.push(id);
      if (!cb.checked) picked = picked.filter(function (x) { return x !== id; });
      sync();
    }, { signal: signal });
    page.addEventListener("click", function (e) {
      var rm = e.target.closest && e.target.closest("[data-ez-cmp-remove]");
      if (rm) { picked = picked.filter(function (x) { return x !== rm.getAttribute("data-ez-cmp-remove"); }); sync(); return; }
      if (e.target.closest("[data-ez-cmp-clear]")) { picked = []; sync(); return; }
      if (e.target.closest("[data-ez-cmp-open]")) { render(); dialog.showModal(); return; }
      if (e.target.closest("[data-ez-cmp-close]")) { dialog.close(); return; }
      var jump = e.target.closest("[data-ez-jump]");
      if (jump) {
        var card = page.querySelector("#sp-" + CSS.escape(jump.getAttribute("data-ez-jump")));
        if (!card || !card.offsetParent) return; // hidden by a filter: follow the link to the product page
        e.preventDefault(); e.stopPropagation();
        page.querySelectorAll("[data-ez-jump]").forEach(function (a) { a.removeAttribute("aria-current"); });
        jump.setAttribute("aria-current", "true");
        card.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        card.classList.remove("is-flash"); void card.offsetWidth; card.classList.add("is-flash");
        var link = card.querySelector(".sp-name a"); if (link) link.focus({ preventScroll: true });
      }
    }, { signal: signal, capture: true });
    dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); }, { signal: signal });
    sync();
  }
  L.onEnhance(shopBehaviour);

  /* ====================================================================== About: Seven colours. One point of view. */
  function capRow(ctx, cls) {
    return '<ol class="' + (cls || "ez-caprow") + '" aria-hidden="true">' + ctx.published.map(function (p, i) { return '<li style="--i:' + i + ";" + ctx.capStyle(p) + '">' + L.cap(ctx, p, "ez-caprow-img") + "</li>"; }).join("") + "</ol>";
  }
  function arrow(href, label) { return '<a class="x-link" href="' + href + '">' + label + "</a>"; }
  L.replace("about", function (ctx) {
    var A = window.BCCAbout && window.BCCAbout.copy; if (!A) throw new Error("About copy unavailable");
    var list = ctx.published;
    var index = '<table class="eza-index"><caption class="sr-only">The seven products by name, cap colour, format and one label line</caption><thead><tr><th scope="col">Name</th><th scope="col">Colour</th><th scope="col">Format</th><th scope="col">From the label</th></tr></thead><tbody>' +
      list.map(function (p) { return '<tr style="' + ctx.capStyle(p) + '"><th scope="row"><a class="e-name" href="/products/' + esc(p.id) + '">' + esc(p.name) + '</a></th><td><span class="eza-swatch" aria-hidden="true"></span><span class="sr-only">Its own cap colour</span></td><td>' + esc(ctx.format[p.id] || p.format || "") + "</td><td>" + esc(p.subtitle || "") + "</td></tr>"; }).join("") + "</tbody></table>";
    return '<div class="x-page eza">' +
      '<header class="eza-hero"><p class="ez-k">About Body Café Co.</p><h1>Seven colours. <br><span>One point of view.</span></h1>' + capRow(ctx, "ez-caprow eza-caps") +
      '<div class="eza-hero-text"><p class="eza-view">' + esc(A.view) + '</p><div class="eza-meet">' + A.meet.map(function (m) { return "<p>" + esc(m) + "</p>"; }).join("") + "</div></div></header>" +
      '<section class="eza-why" aria-labelledby="eza-why-t"><p class="ez-k">Why we exist</p><h2 id="eza-why-t">' + esc(A.why.problem) + '</h2><div class="eza-cols"><p>' + esc(A.why.experience) + "</p><p>" + esc(A.why.tone) + "</p></div></section>" +
      '<section class="eza-colour" aria-labelledby="eza-col-t"><header class="ez-sec-head"><p class="ez-k">Why colour?</p><h2 id="eza-col-t">Name, colour, format, label.</h2><p>' + esc(A.collection.lead) + "</p></header>" + index + "</section>" +
      '<section class="eza-name" aria-labelledby="eza-name-t"><p class="ez-k" id="eza-name-t">Why “café”</p><blockquote><p>' + esc(A.name.quote) + "</p></blockquote><p>" + esc(A.name.body) + '</p><p class="ez-small">' + esc(A.name.note) + "</p></section>" +
      '<section class="eza-values" aria-labelledby="eza-val-t"><header class="ez-sec-head"><p class="ez-k">How we behave</p><h2 id="eza-val-t">Four values, each with something to check.</h2></header><ol>' +
      A.values.map(function (v, i) { return '<li><p class="eza-v-n">' + pad(i + 1) + "</p><h3>" + esc(v.title) + '</h3><p class="eza-v-line">' + esc(v.line) + "</p><p>" + esc(v.practice) + '</p><p class="eza-v-links">' + v.links.map(function (l) { return arrow(l[0], esc(l[1])); }).join("") + "</p></li>"; }).join("") + "</ol></section>" +
      '<nav class="eza-next" aria-label="Keep going"><a href="/story"><span class="ez-k">Story</span><strong>How seven became a system</strong></a><a href="/standards"><span class="ez-k">Standards</span><strong>Behind every colour, a record</strong></a><a href="/shop"><span class="ez-k">Shop</span><strong>All ' + (list.length === 7 ? "seven" : list.length) + ", side by side</strong></a></nav></div>";
  });

  /* ====================================================================== Story: How seven became a system. */
  L.replace("story", function (ctx) {
    var B = window.BCCStory || {}, f = B.founder || {};
    var founderMaterial = (f.before && f.before.paragraphs && f.before.paragraphs.length) || (f.note && f.note.paragraphs && f.note.paragraphs.length) || (f.timeline && f.timeline.length);
    if (founderMaterial || !B.objects) throw new Error("Use the full story renderer");
    var order = ["cap", "colours", "bottle", "type", "wordmark"], objs = order.map(function (id) { return B.objects.find(function (o) { return o.id === id; }); }).filter(Boolean);
    return '<div class="x-page ezst"><header class="ezst-hero"><p class="ez-k">Our story</p><h1>How seven became a system.</h1><p class="ez-lede">Not a founder biography: the design decisions behind the bottles, told through the objects themselves. No dates are shown, because none are documented yet.</p></header>' +
      '<ol class="ezst-objects">' + objs.map(function (o, i) {
        return '<li class="ezst-obj ezst-' + esc(o.id) + '"><figure><img src="' + esc(o.src) + '" alt="' + esc(o.alt) + '" width="' + o.w + '" height="' + o.h + '" loading="' + (i ? "lazy" : "eager") + '" decoding="async"></figure><div class="ezst-copy"><p class="ezst-n">' + pad(i + 1) + " / " + pad(objs.length + 1) + "</p><h2>" + esc(o.name) + '</h2><p class="ezst-why">' + esc(o.why) + '</p><p class="ezst-what">' + esc(o.what) + "</p></div></li>";
      }).join("") +
      '<li class="ezst-obj ezst-all"><figure><img src="/web/media/about/caps-row.webp" alt="Seven product caps seen from above, in catalogue order" width="2340" height="360" loading="lazy" decoding="async"></figure><div class="ezst-copy"><p class="ezst-n">' + pad(objs.length + 1) + " / " + pad(objs.length + 1) + '</p><h2>Seven, together.</h2><p class="ezst-why">One cap colour per product, in catalogue order. Put together, the decisions become a system you can read from across a room, and then up close.</p><p class="ez-actions"><a class="x-btn" href="/shop"><span>Meet the seven</span></a><a class="x-link" href="/about">About us today</a><a class="x-link" href="/standards">What a record shows</a></p></div></li></ol></div>';
  });

  /* ====================================================================== Standards: Behind every colour, a record. */
  function record(ctx, p) {
    var demo = !RELEASE.production;
    var rows = [
      ["Label facts", p.label_source ? "in" : "pending", p.label_source ? "Published" : "Awaiting the approved label", p.label_source ? esc(p.amount_per_serving) + " · " + esc(p.serving_size) + " a serving · " + esc(p.pack_size) : "Amounts, directions and cautions will come from the approved label.", "/products/" + p.id + "#ingredients", "Read the label facts"],
      ["Named manufacturer", p.manufacturer ? "in" : "pending", p.manufacturer ? "Published" : "Not yet published", p.manufacturer ? esc(p.manufacturer) : "Not yet published.", "", ""],
      ["Ingredient origin", p.ingredient_sourcing ? "in" : "none", p.ingredient_sourcing ? "Published" : "Not published", p.ingredient_sourcing ? esc(p.ingredient_sourcing) : "Where an ingredient was grown or made isn’t published. A manufacturer’s address doesn’t show it.", "", ""],
      ["Testing documents", p.testing_performed || p.supporting_documents ? "in" : "none", p.testing_performed || p.supporting_documents ? "Published" : "None published", esc(p.testing_performed || p.supporting_documents || "No test results or documents are published for this product yet."), "", ""],
      ["Certifications", p.certifications ? "in" : "none", p.certifications ? "Stated" : "None claimed", esc(p.certifications || "No certification is claimed."), "", ""],
      ["Lot record", "in", "Look up by lot number", "A report describes a sample from one lot. Enter the lot number printed on your pack.", "/reports?product=" + encodeURIComponent(p.id), "Look up a lot"],
    ];
    return '<div class="ezr-sheet-head" style="' + ctx.capStyle(p) + '"><span class="ezr-band" aria-hidden="true"></span><p class="ez-k">' + L.no(ctx, p) + " · " + esc(ctx.format[p.id] || "") + '</p><h2 class="e-name" id="ezr-t-' + esc(p.id) + '">' + esc(p.name) + '</h2><p class="ezr-src">' + (p.label_source ? "Source: " + esc(p.label_source) : "No label source recorded") + "</p></div>" +
      '<dl class="ezr-rows">' + rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd><p class="ez-status" data-state="' + r[1] + '">' + r[2] + "</p><p>" + r[3] + "</p>" + (r[4] ? '<a class="x-link" href="' + r[4] + '">' + r[5] + "</a>" : "") + "</dd></div>"; }).join("") + "</dl>";
  }
  L.wrap("standards", function (root, ctx) {
    var sx = root.querySelector(".sx"); if (!sx) return;
    sx.classList.add("ezx");
    var list = ctx.published; if (!list.length) return;
    var sheets = list.map(function (p, i) { return '<section class="ezr-sheet" data-ezr-sheet="' + esc(p.id) + '" aria-labelledby="ezr-t-' + esc(p.id) + '"' + (i ? " hidden" : "") + ">" + record(ctx, p) + "</section>"; }).join("");
    var chain = [["Ingredient", "Where an ingredient comes from and how it was made.", "Origin records"], ["Finished product", "Who made the finished product, and what its label states.", "Label and manufacturer"], ["Lot", "Which batch your pack came from.", "Lot number on the pack"], ["Document", "What was tested in a sample from that lot, by whom and how.", "Lot report"]];
    var top = '<header class="ezx-hero"><p class="ez-k">Standards</p><h1>Behind every colour, a record.</h1><p class="ez-lede">Choose a product to see what is published for it today, and what isn’t yet. The colour tells you which product; the words tell you the status.</p></header>' +
      '<section class="ezx-record" aria-label="Product records"><div class="ezx-pick" role="group" aria-label="Choose a product">' + list.map(function (p, i) {
        return '<button type="button" data-ezr-pick="' + esc(p.id) + '" aria-pressed="' + (i === 0) + '" style="' + ctx.capStyle(p) + '">' + L.cap(ctx, p, "ezx-pick-img") + "<span>" + esc(p.name) + "</span></button>";
      }).join("") + "</div>" + sheets + "</section>" +
      '<section class="ezx-chain" aria-labelledby="ezx-chain-t"><header class="ez-sec-head"><p class="ez-k">Four kinds of record</p><h2 id="ezx-chain-t">Each stage proves something different.</h2><p>A record at one stage doesn’t stand in for another. A manufacturer’s address doesn’t show ingredient origin, and one lot’s report doesn’t cover another lot.</p></header><ol>' +
      chain.map(function (c, i) { return '<li><p class="ezx-chain-n">' + pad(i + 1) + "</p><h3>" + c[0] + "</h3><p>" + c[1] + '</p><p class="ezx-chain-k">' + c[2] + "</p></li>"; }).join("") + "</ol></section>" +
      '<h2 class="ezx-method-t" id="ezx-method"><span class="ez-k">The method, in full</span>How we work, and what is still to come.</h2>';
    var hero = sx.querySelector(".sx-hero");
    if (hero) hero.replaceWith(frag(top)); else sx.insertAdjacentHTML("afterbegin", top);
    var formula = sx.querySelector("#formula"); if (formula) formula.remove(); // its product picker is now the record sheet above
  });
  function standardsBehaviour(main, signal) {
    var root = main.querySelector(".ezx-record"); if (!root) return;
    var btns = [].slice.call(root.querySelectorAll("[data-ezr-pick]"));
    function pick(id, focus) {
      btns.forEach(function (b) { var on = b.getAttribute("data-ezr-pick") === id; b.setAttribute("aria-pressed", String(on)); if (on && focus) b.focus(); });
      root.querySelectorAll("[data-ezr-sheet]").forEach(function (s) { s.hidden = s.getAttribute("data-ezr-sheet") !== id; });
    }
    btns.forEach(function (b, i) {
      b.addEventListener("click", function () { pick(b.getAttribute("data-ezr-pick")); }, { signal: signal });
      b.addEventListener("keydown", function (e) {
        var k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (k === undefined) return;
        e.preventDefault(); pick(btns[(i + k + btns.length) % btns.length].getAttribute("data-ezr-pick"), true);
      }, { signal: signal });
    });
    var q = new URL(location.href).searchParams.get("product");
    if (q && btns.some(function (b) { return b.getAttribute("data-ezr-pick") === q; })) pick(q);
  }
  L.onEnhance(standardsBehaviour);

  /* ====================================================================== Learn: a small publication */
  var QUESTION = {
    "iron-bisglycinate": "What does elemental iron mean on a label?",
    "l-theanine": "What does the full ingredient name tell you?",
    "vitamin-d3-k2": "Why are these values written in different units?",
    "omega-3-fish-oil": "How are fish oil, omega-3, EPA and DHA related?",
    "myo-d-chiro-inositol": "How do you read a 40:1 ratio?",
    "creatine-chews": "What changes when the format is a chewable tablet?",
    "psyllium-husk": "Why is husk weight different from fibre content?",
  };
  function num(s) { var m = String(s || "").replace(/,/g, "").match(/\d+(\.\d+)?/); return m ? Number(m[0]) : 0; }
  var TOOLS = {
    "reading-a-label": function () {
      var zones = [["1", "Product name and form", "The ingredient named in full, including its form."], ["2", "Serving size", "How many units make one serving, and servings per pack."], ["3", "Amount per serving", "Each ingredient, its amount and its unit, for one serving."], ["4", "Other ingredients", "Capsule shells, fillers, flavours and sweeteners."], ["5", "Directions, cautions, allergens", "How to take it and who should check first."], ["6", "Lot number and expiry", "Printed on the pack. It links the pack to its batch record."]];
      return '<figure class="ezl-tool ezl-lbl-fig"><p class="ezl-tool-k">Example label · not a Body Café Co. product · amounts left blank on purpose</p><div class="ezl-lbl" aria-hidden="true">' +
        '<div class="z z1"><b>EXAMPLE INGREDIENT CAPSULES</b><span>Ingredient (as named form)</span><i>1</i></div><div class="z z2"><span>Serving size: — capsule(s) · Servings per pack: —</span><i>2</i></div>' +
        '<div class="z z3"><span class="row"><span>Ingredient A (as named form)</span><span>— mg</span></span><span class="row"><span>Ingredient B (as named form)</span><span>— mcg</span></span><i>3</i></div>' +
        '<div class="z z4"><span>Other ingredients: ————————</span><i>4</i></div><div class="z z5"><span>Directions · Warnings · Allergens: ———————</span><i>5</i></div><div class="z z6"><span>LOT ▢▢▢▢▢▢ · EXP ▢▢/▢▢</span><i>6</i></div></div>' +
        '<ol class="ezl-key">' + zones.map(function (z) { return "<li><span>" + z[0] + "</span><strong>" + z[1] + "</strong><small>" + z[2] + "</small></li>"; }).join("") + "</ol></figure>";
    },
    "understanding-reports": function () {
      var rows = [["What was tested", "The ingredient or contaminant measured"], ["Result", "The measured value"], ["Unit", "For example mg per capsule"], ["Method", "The named test method used"], ["Limit or specification", "The range the result is judged against"]];
      return '<figure class="ezl-tool ezl-rep"><p class="ezl-tool-k">Example report anatomy · not a real document · no results shown</p><div class="ezl-rep-sheet"><div class="ezl-rep-head"><span>Product: Example capsules</span><span>Lot: EXAMPLE-LOT</span><span>Laboratory · date · version</span></div>' +
        '<table><thead><tr>' + rows.map(function (r) { return '<th scope="col">' + r[0] + "</th>"; }).join("") + "</tr></thead><tbody><tr>" + rows.map(function (r) { return "<td>" + r[1] + "</td>"; }).join("") + "</tr></tbody></table></div><figcaption>A report describes a sample from one lot. Read the result together with its unit, method and limit.</figcaption></figure>";
    },
    "ingredient-forms": function () {
      var bars = [["Ferrous fumarate", 33], ["Ferrous sulfate", 20], ["Ferrous gluconate", 12]];
      return '<figure class="ezl-tool ezl-forms"><p class="ezl-tool-k">Compound weight versus elemental iron · per 100 mg of each compound</p><ul>' + bars.map(function (b) { return '<li><span class="ezl-forms-l">' + b[0] + '</span><span class="ezl-forms-bar" style="--v:' + b[1] + '%"><span>' + b[1] + " mg iron</span></span></li>"; }).join("") +
        "</ul><figcaption>Percentages from the NIH Office of Dietary Supplements iron fact sheet, cited in the iron guide. The same 100 mg of compound gives different amounts of iron, so compare the elemental amount.</figcaption></figure>";
    },
    "serving-sizes": function (ctx) {
      var list = ctx.published.filter(function (p) { return num(p.pack_size) && num(p.serving_size); });
      if (!list.length) return "";
      return '<figure class="ezl-tool ezl-calc" data-ezl-calc><p class="ezl-tool-k">Serving arithmetic · arithmetic only, not a dose recommendation</p><label for="ezl-calc-p">Choose a product</label><select id="ezl-calc-p" data-ezl-calc-pick>' +
        list.map(function (p) { return '<option value="' + esc(p.id) + '" data-pack="' + num(p.pack_size) + '" data-unit="' + esc(String(p.pack_size).replace(/^[\d,]+\s*/, "")) + '" data-serving="' + num(p.serving_size) + '" data-label="' + esc(p.servings_per_pack || "") + '">' + esc(p.name) + "</option>"; }).join("") +
        '</select><p class="ezl-calc-out" data-ezl-calc-out aria-live="polite"></p><figcaption>Units per pack ÷ units per serving = servings per pack. Values come from each product’s label.</figcaption></figure>';
    },
    "understanding-evidence": function () {
      var E = (window.BCCLearnContent && window.BCCLearnContent.EVIDENCE) || [];
      if (!E.length) return "";
      return '<figure class="ezl-tool ezl-ev"><p class="ezl-tool-k">Four kinds of evidence, four different questions</p><ol>' + E.map(function (e, i) { return "<li><span>" + pad(i + 1) + "</span><strong>" + esc(e.title) + "</strong><p><b>Can show:</b> " + esc(e.can) + "</p><p><b>Can’t show:</b> " + esc(e.cant) + "</p></li>"; }).join("") + "</ol></figure>";
    },
  };
  L.wrap("learn", function (root, ctx) {
    var lr = root.querySelector(".lr"); if (!lr) return;
    lr.classList.add("ezl");
    var LC = window.BCCLearnContent;
    if (lr.classList.contains("lr-hub")) {
      ["#start", "#products", "#essentials", "#label", "#evidence", "#inside", "#explore"].forEach(function (s) { var el = lr.querySelector(s); if (el) el.remove(); });
      var topics = lr.querySelector(".lr-topics"); if (topics) topics.remove();
      var rl = LC && LC.foundation ? LC.foundation("reading-a-label") : null;
      var found = (LC && LC.FOUNDATION ? LC.FOUNDATION : []).map(function (slug) { var g = LC.foundation(slug); return g ? [slug, g.title, g.summary || ""] : null; }).filter(Boolean);
      var html = '<section class="ezl-feature" aria-labelledby="ezl-feature-t"><div class="ezl-feature-copy"><p class="ez-k">Start here</p><h2 id="ezl-feature-t">How do you read a supplement label?</h2><p>' + esc(rl ? rl.summary : "") + ' Start with the serving, then the full ingredient name.</p><a class="x-btn" href="/learn/reading-a-label"><span>Read the guide</span></a></div>' + TOOLS["reading-a-label"]().replace("ezl-tool ezl-lbl-fig", "ezl-tool ezl-lbl-fig is-mini") + "</section>" +
        '<section class="ezl-shelf" aria-labelledby="ezl-shelf-t"><header class="ez-sec-head"><p class="ez-k">Seven ingredient guides</p><h2 id="ezl-shelf-t">One ingredient. A better question.</h2><p>General ingredient research, kept separate from the facts about our own product.</p></header><ol>' +
        ctx.published.filter(function (p) { return LC && LC.PRODUCTS && LC.PRODUCTS[p.id]; }).map(function (p) {
          return '<li style="' + ctx.capStyle(p) + '"><a href="/learn/' + esc(p.id) + '"><span class="ezl-spine" aria-hidden="true"></span><span class="ezl-no">' + L.no(ctx, p) + '</span><span class="e-name">' + esc(p.name) + '</span><span class="ezl-q">' + esc(QUESTION[p.id] || "") + '</span><span class="ezl-arrow" aria-hidden="true">→</span></a></li>';
        }).join("") + "</ol></section>" +
        '<section class="ezl-found" aria-labelledby="ezl-found-t"><header class="ez-sec-head"><p class="ez-k">Five foundations</p><h2 id="ezl-found-t">Skills for any label.</h2><p>These apply to any supplement, so they carry no product colour.</p></header><ol>' +
        found.map(function (g, i) { return '<li><a href="/learn/' + g[0] + '"><span class="ezl-no">' + pad(i + 1) + "</span><strong>" + esc(g[1]) + "</strong><span>" + esc(g[2]) + "</span></a></li>"; }).join("") +
        '<li class="ezl-gloss"><a href="/learn/glossary"><span class="ezl-no">A–Z</span><strong>The glossary</strong><span>Plain definitions of the terms used across the guides.</span></a></li></ol></section>';
      var hero = lr.querySelector("#top");
      if (hero) hero.after(frag(html)); else lr.insertAdjacentHTML("afterbegin", html);
      return;
    }
    if (!lr.classList.contains("lr-article")) return;
    var slug = (location.pathname.split("/")[2] || "").replace(/\/$/, "");
    var p = ctx.catalog.find(function (x) { return x.id === slug; });
    var h1 = lr.querySelector(".lr-h1");
    if (p && QUESTION[slug]) {
      if (h1) { h1.classList.add("ez-product-name"); h1.insertAdjacentHTML("afterend", '<p class="ezl-dek">' + esc(QUESTION[slug]) + "</p>"); }
      var ins = lr.querySelector("#inside .lr-tag");
      var fig = L.sig(ctx, p);
      if (ins && fig) ins.insertAdjacentHTML("afterend", '<div class="ezl-inside-sig">' + fig + "</div>");
    } else if (TOOLS[slug]) {
      var tool = TOOLS[slug](ctx);
      var minute = lr.querySelector("#minute");
      if (tool && minute) minute.insertAdjacentHTML("beforeend", tool);
    }
  });
  function learnBehaviour(main, signal) {
    var calc = main.querySelector("[data-ezl-calc]"); if (!calc) return;
    var sel = calc.querySelector("[data-ezl-calc-pick]"), out = calc.querySelector("[data-ezl-calc-out]");
    function show() {
      var o = sel.options[sel.selectedIndex]; if (!o) return;
      var pack = Number(o.getAttribute("data-pack")), serving = Number(o.getAttribute("data-serving")), unit = o.getAttribute("data-unit"), label = o.getAttribute("data-label");
      var n = serving ? Math.floor(pack / serving) : 0;
      out.innerHTML = "<b>" + pack + " " + esc(unit) + "</b> ÷ <b>" + serving + "</b> per serving = <b>" + n + " servings</b>" + (label ? "<small>The label states " + esc(label) + " servings per pack.</small>" : "");
    }
    sel.addEventListener("change", show, { signal: signal });
    show();
  }
  L.onEnhance(learnBehaviour);


  /* ====================================================================== Reports, bundles, bag, 404 */
  L.wrap("reports", function (root) {
    var h1 = root.querySelector(".lt-h1"); if (h1) h1.textContent = "Your colour. Your lot. Its record.";
    var lt = root.querySelector(".lt"); if (lt) lt.classList.add("ezrep");
  });
  L.wrap("bundles", function (root) {
    root.querySelectorAll(".x-lines").forEach(function (ul) {
      var total = ul.querySelector(".is-total"); if (!total) return;
      var prices = [].slice.call(ul.querySelectorAll("li:not(.is-total) > span:last-child")).map(function (s) { return s.textContent.trim(); });
      var sum = total.querySelector("span:last-child");
      if (prices.length > 1 && sum) total.insertAdjacentHTML("afterend", '<li class="ez-sum"><span>' + prices.map(esc).join(" + ") + " = " + esc(sum.textContent.trim()) + '</span><span>Each at its listed price. No bundle saving is applied.</span></li>');
    });
  });
  L.wrap("cart", function (root, ctx) {
    var empty = root.querySelector(".bg-empty"); if (!empty) return;
    var hh = empty.querySelector(".bg-sec-h"), p = empty.querySelector("p");
    if (hh) hh.textContent = "Your bag is waiting for a colour.";
    if (p) p.textContent = "Nothing in it yet. Each of the seven has its own cap, so you’ll recognise what you chose.";
  });
  L.wrap("notFound", function (root, ctx) {
    var h1 = root.querySelector("h1"); if (!h1) return;
    h1.textContent = "That colour isn’t on this shelf.";
    h1.insertAdjacentHTML("afterend", '<div class="ez-404-caps">' + capRow(ctx) + "</div>");
  });

  window.BCCLivingEPages = { store: store, capRow: capRow };
})();
