/* Body Café Co. — Learn, the knowledge hub, for all eight directions (A–H).

   Routes (all under the existing /learn route):
     /learn                     hub: search, paths, products, essentials, label explorer, evidence, inside, questions, keep exploring
     /learn/<product-id>        seven product guides (11 sections each)
     /learn/<foundation-slug>   five foundation guides
     /learn/glossary            connected glossary
   Content comes from learn-content.js (and the three original guides in site.js). This file renders it and adds
   the behaviour: search, product explorer, inline glossary, label explorer, report walkthrough, save/resume (this
   browser only), section links, feedback (server-backed) and printable learning sheets.
   Each direction composes the same pages in its own visual language (learn.css, scoped to .lr-a … .lr-h). */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLearnContent;
  if (!S || !S.themes || !L) return;

  /* ====================================================================================================
     1. HELPERS
     ==================================================================================================== */
  function h(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function strip(html) { return String(html || "").replace(/\{\{[a-z0-9-]+\|([^}]+)\}\}/g, "$1").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(); }
  function minutes(text) { var w = strip(text).split(" ").filter(Boolean).length; return { words: w, min: Math.max(1, Math.round(w / 200)) }; }
  function arrow(href, label, cls) { return '<a class="' + (cls || "lr-link") + '" href="' + href + '"><span>' + label + '</span><span class="lr-arr" aria-hidden="true">→</span></a>'; }
  var GLOSS = {}; L.GLOSSARY.forEach(function (g) { GLOSS[g[0]] = g; });
  var termN = 0;
  /* {{term-id|visible text}} → an inline, keyboard-operable definition with a link to the glossary entry. */
  function terms(html) {
    return String(html || "").replace(/\{\{([a-z0-9-]+)\|([^}]+)\}\}/g, function (m, id, text) {
      var g = GLOSS[id];
      if (!g) return text;
      var tid = "lr-tip-" + (++termN);
      return '<span class="lr-term"><button type="button" class="lr-term-btn" aria-expanded="false" aria-controls="' + tid + '" data-lr-term>' + text + '</button><span class="lr-tip" id="' + tid + '" hidden><strong>' + h(g[1]) + ".</strong> " + h(g[2]) + ' <a href="/learn/glossary#term-' + id + '">In the glossary</a></span></span>';
    });
  }
  function srcList(keys, cls) {
    keys = (keys || []).filter(function (k) { return L.SRC[k]; });
    if (!keys.length) return "";
    return '<p class="' + (cls || "lr-src") + '"><span class="lr-src-k">Source' + (keys.length > 1 ? "s" : "") + ":</span> " + keys.map(function (k) { return '<a href="' + L.SRC[k].u + '" rel="noopener" target="_blank">' + h(L.SRC[k].t) + "</a>"; }).join("; ") + "</p>";
  }
  function product(ctx, id) { return ctx.catalog.filter(function (p) { return p.id === id; })[0]; }
  var TO_CONFIRM = (window.BCCProductPage && window.BCCProductPage.toConfirm) || {};

  /* ====================================================================================================
     2. SEARCH INDEX — products, guides (by section), glossary and questions. Built from approved content only.
     ==================================================================================================== */
  var INDEX = [];
  function buildIndex(ctx) {
    var out = [];
    ctx.published.forEach(function (p) {
      var d = L.PRODUCTS[p.id];
      if (!d) return;
      var base = "/learn/" + p.id;
      out.push({ kind: "Product guide", title: p.name, sec: "In a minute", href: base + "#minute", text: p.name + " " + p.ingredients + " " + (ctx.format[p.id] || "") + " " + d.minute });
      out.push({ kind: "Product guide", title: p.name, sec: "What it is", href: base + "#what", text: strip(d.what) });
      out.push({ kind: "Product guide", title: p.name, sec: "Names, forms and terms", href: base + "#name", text: strip(d.name) });
      out.push({ kind: "Product guide", title: p.name, sec: "How to read this label", href: base + "#label", text: d.label.map(function (r) { return r[0] + ". " + r[1]; }).join(" ") });
      d.faq.forEach(function (q) { out.push({ kind: "Question", title: q[0], sec: p.name, href: base + "#questions", text: q[0] + " " + q[1] }); });
    });
    L.FOUNDATION.forEach(function (slug) {
      var g = L.foundation(slug);
      if (!g) return;
      out.push({ kind: "Guide", title: g.title, sec: "In a minute", href: "/learn/" + slug + "#minute", text: g.title + " " + g.summary + " " + g.opening });
      g.sections.forEach(function (s) { out.push({ kind: "Guide", title: g.title, sec: s.h, href: "/learn/" + slug + "#" + s.id, text: s.h + " " + strip(s.html) }); });
    });
    L.GLOSSARY.forEach(function (t) { out.push({ kind: "Glossary", title: t[1], sec: "Glossary", href: "/learn/glossary#term-" + t[0], text: t[1] + " " + t[2] }); });
    L.QUESTIONS.forEach(function (q) { out.push({ kind: "Question", title: q[0], sec: "Good questions", href: q[2], text: q[0] + " " + q[1] }); });
    return out;
  }
  function search(q) {
    var words = String(q || "").toLowerCase().replace(/[^a-z0-9+&\- ]/g, " ").split(/\s+/).filter(function (w) { return w.length > 1 && ["the", "is", "a", "an", "of", "to", "in", "on", "and", "or", "what", "how", "does", "do", "my", "your", "for", "it", "i", "with", "are", "why", "can"].indexOf(w) < 0; });
    if (!words.length) return [];
    var res = [];
    INDEX.forEach(function (e) {
      var t = (e.title + " " + e.sec).toLowerCase(), b = e.text.toLowerCase(), score = 0, hits = 0;
      words.forEach(function (w) { var a = t.indexOf(w) >= 0, c = b.indexOf(w) >= 0; if (a || c) hits++; score += (a ? 5 : 0) + (c ? 1 : 0); });
      if (hits === words.length) res.push({ e: e, score: score + (e.kind === "Glossary" ? 1 : 0) });
    });
    res.sort(function (a, b) { return b.score - a.score; });
    var seen = {};
    return res.filter(function (r) { if (seen[r.e.href]) return false; seen[r.e.href] = 1; return true; }).slice(0, 12).map(function (r) { return { e: r.e, excerpt: excerpt(r.e.text, words) }; });
  }
  function excerpt(text, words) {
    var low = text.toLowerCase(), at = -1;
    words.forEach(function (w) { var i = low.indexOf(w); if (i >= 0 && (at < 0 || i < at)) at = i; });
    var start = Math.max(0, at - 60), end = Math.min(text.length, start + 190);
    var s = (start ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
    var out = h(s);
    words.forEach(function (w) { out = out.replace(new RegExp("(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"), "<mark>$1</mark>"); });
    return out;
  }
  function resultsHtml(q) {
    if (!q) return "";
    var r = search(q);
    var head = '<p class="lr-results-k" role="status">' + (r.length ? r.length + " result" + (r.length === 1 ? "" : "s") + " for “" + h(q) + "”" : "No results for “" + h(q) + "”") + "</p>";
    if (!r.length) return head + '<div class="lr-noresults"><p>Try a product name (such as “omega-3”), an ingredient, a label term (such as “serving size”) or an everyday question.</p><p><button type="button" class="lr-btn is-quiet" data-lr-reset>Clear search</button> ' + arrow("/learn/glossary", "Browse the glossary") + "</p></div>";
    return head + '<ol class="lr-results">' + r.map(function (x) {
      return '<li><a href="' + x.e.href + '"><span class="lr-res-kind">' + h(x.e.kind) + '</span><strong>' + h(x.e.title) + '</strong><span class="lr-res-sec">' + h(x.e.sec) + '</span><span class="lr-res-ex">' + x.excerpt + "</span></a></li>";
    }).join("") + '</ol><p><button type="button" class="lr-btn is-quiet" data-lr-reset>Clear search</button></p>';
  }

  /* ====================================================================================================
     3. HUB
     ==================================================================================================== */
  var EXAMPLES = ["What is elemental iron?", "mcg and IU", "EPA and DHA", "lot number", "serving size"];
  function hubSection(v, id, n, title, inner, lede) {
    return '<section class="lr-sec lr-sec-' + id + '" id="' + id + '" aria-labelledby="' + id + '-t"><div class="lr-sec-in"><header class="lr-head"><p class="lr-k">' + (v.k ? v.k(n) : pad(n)) + '</p><h2 id="' + id + '-t">' + title + "</h2>" + (lede ? '<p class="lr-lede">' + lede + "</p>" : "") + '</header><div class="lr-body">' + inner + "</div></div></section>";
  }
  function explorer(ctx) {
    var steps = [["what", "What is it?"], ["formula", "Formula"], ["label", "Label"], ["evidence", "Evidence"], ["records", "Records"]];
    var picks = ctx.published.map(function (p, i) {
      return '<button type="button" role="radio" aria-checked="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" data-lr-pick="' + p.id + '" style="--dot:' + h(p.color) + '"><span class="lr-dot" aria-hidden="true"></span>' + h(p.name) + "</button>";
    }).join("");
    var panels = ctx.published.map(function (p, i) {
      var d = L.PRODUCTS[p.id] || {}, base = "/learn/" + p.id, idx = ctx.catalog.indexOf(p) + 1;
      var body = {
        what: "<p>" + h((d.minute || "").split(". ")[0]) + '.</p><p class="lr-ex-links">' + arrow(base + "#what", "What it is") + arrow(base + "#name", "Names and forms") + "</p>",
        formula: '<p><strong>In view:</strong> ' + h(p.ingredients) + ". <strong>Format:</strong> " + h(ctx.format[p.id]) + ".</p><p>" + h(p.label_note || "") + '</p><p class="lr-ex-links">' + arrow(base + "#inside", "Inside our product") + arrow("/products/" + p.id + "#ingredients", "Ingredients on the product page") + "</p>",
        label: "<p>" + h((d.label && d.label[0] ? d.label[0][0] + ": " + d.label[0][1] : "")) + '</p><p class="lr-ex-links">' + arrow(base + "#label", "How to read this label") + arrow("/learn/reading-a-label", "Any label, in order") + "</p>",
        evidence: '<p>Ingredient research describes the ingredient, not our product. A reviewed research summary for this guide is still being prepared, so we don\'t summarise outcomes yet.</p><p class="lr-ex-links">' + arrow(base + "#research", "Research and independent sources") + arrow("/learn/understanding-evidence", "Understanding evidence") + "</p>",
        records: "<p>Look up a lot with the number printed on the pack. Records in this preview are demonstrations; try DEMO-" + pad(idx) + '-01.</p><p class="lr-ex-links">' + arrow("/reports?product=" + p.id, "Look up a lot report") + arrow(base + "#records", "Records for this product") + "</p>",
      };
      return '<div class="lr-ex-product" data-lr-ex-product="' + p.id + '"' + (i ? " hidden" : "") + ' style="' + ctx.capStyle(p) + '">' +
        '<div class="lr-ex-media"><img src="/web/media/' + p.id + '.webp" alt="' + h(p.name) + ', front of the bottle (draft packaging)" width="' + ((ctx.bottleWidth && ctx.bottleWidth[p.id]) || 720) + '" height="1000" loading="lazy" decoding="async"></div>' +
        '<div class="lr-ex-main"><p class="lr-ex-name">' + h(p.name) + '</p><div role="tablist" aria-label="Explore ' + h(p.name) + '" class="lr-steps">' + steps.map(function (s, k) {
          return '<button type="button" role="tab" id="lr-tab-' + p.id + "-" + s[0] + '" aria-controls="lr-panel-' + p.id + "-" + s[0] + '" aria-selected="' + (k === 0) + '" tabindex="' + (k === 0 ? 0 : -1) + '" data-lr-step="' + s[0] + '"><span class="lr-step-n" aria-hidden="true">' + (k + 1) + "</span>" + s[1] + "</button>";
        }).join("") + "</div>" + steps.map(function (s, k) {
          return '<div role="tabpanel" id="lr-panel-' + p.id + "-" + s[0] + '" aria-labelledby="lr-tab-' + p.id + "-" + s[0] + '" class="lr-panel"' + (k ? " hidden" : "") + ">" + body[s[0]] + "</div>";
        }).join("") + "</div></div>";
    }).join("");
    return '<div class="lr-explorer" data-lr-explorer><div class="lr-picks" role="radiogroup" aria-label="Choose a product to explore">' + picks + "</div>" + panels + "</div>";
  }
  function labelExplorer() {
    var x = L.LABEL;
    return '<div class="lr-label-x" data-lr-label><p class="lr-example-tag">' + h(x.note) + '</p><div class="lr-label-grid"><figure class="lr-label" aria-label="Educational example label"><p class="lr-label-title">EXAMPLE SUPPLEMENT<br><small>HEALTH SUPPLEMENT · NOT FOR MEDICINAL USE</small></p>' +
      x.parts.map(function (p, i) { return '<button type="button" class="lr-label-part" data-lr-part="' + p.id + '" aria-pressed="' + (i === 0) + '"><span class="lr-label-n" aria-hidden="true">' + (i + 1) + "</span>" + h(p.shows) + "</button>"; }).join("") +
      '</figure><div class="lr-label-detail" aria-live="polite" data-lr-part-detail>' + partDetail(x.parts[0], 0) + "</div></div>" +
      '<details class="lr-plain"><summary>The same information, in text</summary><dl>' + x.parts.map(function (p) { return "<div><dt>" + h(p.name) + "</dt><dd>" + h(p.explain) + ' <a href="' + p.link + '">Read more</a></dd></div>'; }).join("") + "</dl></details></div>";
  }
  function partDetail(p, i) { return '<p class="lr-label-k">' + (i + 1) + " · " + h(p.name) + "</p><p>" + h(p.explain) + "</p>" + arrow(p.link, "Read more"); }
  function evidenceGrid() {
    return '<div class="lr-evidence">' + L.EVIDENCE.map(function (e, i) {
      return '<article class="lr-ev"><p class="lr-ev-n" aria-hidden="true">' + pad(i + 1) + "</p><h3>" + h(e.title) + '</h3><dl><div><dt>Can establish</dt><dd>' + h(e.can) + '</dd></div><div><dt>Can\'t establish</dt><dd>' + h(e.cant) + '</dd></div><div><dt>At Body Café Co.</dt><dd>' + h(e.ours) + "</dd></div></dl>" + arrow(e.link[0], e.link[1]) + "</article>";
    }).join("") + "</div>";
  }
  function reportWalk() {
    var r = L.REPORT;
    return '<div class="lr-walk" data-lr-walk><p class="lr-example-tag">' + h(r.note) + '</p><div class="lr-walk-grid"><table class="lr-walk-table"><caption class="sr-only">Example report</caption><tbody>' +
      r.rows.map(function (x, i) { return '<tr data-lr-row="' + i + '"' + (i === 0 ? ' class="is-on"' : "") + '><th scope="row">' + h(x.k) + "</th><td>" + h(x.v) + "</td></tr>"; }).join("") +
      '</tbody></table><div class="lr-walk-side"><p class="lr-walk-step" aria-live="polite" data-lr-walk-text><strong>' + h(r.rows[0].k) + ".</strong> " + h(r.rows[0].explain) + '</p><p class="lr-walk-ctl"><button type="button" class="lr-btn is-quiet" data-lr-walk="-1">Previous</button><button type="button" class="lr-btn" data-lr-walk="1">Next</button><span data-lr-walk-count>Step 1 of ' + r.rows.length + "</span></p>" + arrow("/reports", "Look up a real lot record", "lr-btn") + "</div></div>" +
      '<details class="lr-plain"><summary>All steps, in text</summary><dl>' + r.rows.map(function (x) { return "<div><dt>" + h(x.k) + "</dt><dd>" + h(x.explain) + "</dd></div>"; }).join("") + "</dl></details></div>";
  }
  function hub(v, ctx) {
    var q = ctx.query.get("q") || "";
    var intro = '<header class="lr-hero" id="top"><div class="lr-hero-in"><p class="lr-kicker">' + (v.kicker || "Learn") + '</p><h1 class="lr-h1">A little more knowing.</h1><p class="lr-hero-lede">Short, sourced guides to our seven products, to reading any supplement label, and to what evidence and lot reports can and can\'t show. Free to read; no account needed.</p>' +
      '<form class="lr-search" role="search" data-lr-search action="/learn" method="get"><label for="lr-q">Search Learn</label><div class="lr-search-row"><input id="lr-q" name="q" type="search" value="' + h(q) + '" placeholder="Try “elemental iron” or “mcg and IU”" autocomplete="off" maxlength="80"><button type="submit" class="lr-btn">Search</button></div>' +
      '<p class="lr-try">Try: ' + EXAMPLES.map(function (e) { return '<button type="button" class="lr-chip" data-lr-try="' + h(e) + '">' + h(e) + "</button>"; }).join("") + '</p></form><div class="lr-results-box" data-lr-results>' + resultsHtml(q) + "</div></div></header>";
    var start = hubSection(v, "start", 1, "Start here", '<ol class="lr-paths">' + [
      ["Understand a product", "What's in each of our seven products, in plain terms, and how to read its label.", "#products", "Choose a product"],
      ["Read labels and evidence", "Serving sizes, units, ingredient forms, research and lot reports, explained once.", "#essentials", "The essentials"],
      ["Get to know Body Café Co.", "Who we are, why we started and how we show our working.", "#inside", "Inside Body Café Co."],
    ].map(function (x, i) { return '<li class="lr-path"><p class="lr-path-n" aria-hidden="true">' + (i + 1) + "</p><h3>" + x[0] + "</h3><p>" + x[1] + "</p>" + arrow(x[2], x[3]) + "</li>"; }).join("") + "</ol>");
    var products = hubSection(v, "products", 2, "Explore all seven products", '<ul class="lr-products">' + ctx.published.map(function (p) {
      var d = L.PRODUCTS[p.id] || {}, w = (ctx.bottleWidth && ctx.bottleWidth[p.id]) || 720;
      var g = guideText(ctx, p.id);
      return '<li class="lr-prod" style="' + ctx.capStyle(p) + '"><a class="lr-prod-media" href="/learn/' + p.id + '" tabindex="-1" aria-hidden="true"><img src="/web/media/' + p.id + '.webp" alt="" width="' + w + '" height="1000" loading="lazy" decoding="async"></a><div class="lr-prod-body"><p class="lr-prod-k">' + h(ctx.format[p.id]) + " · " + minutes(g).min + ' min read</p><h3><a href="/learn/' + p.id + '">' + h(p.name) + '</a></h3><p>' + h((d.minute || "").split(". ")[0]) + ".</p></div></li>";
    }).join("") + '</ul><div class="lr-explorer-wrap"><h3 class="lr-sub-h">Understand this bottle</h3><p class="lr-sub-lede">Pick a product, then step through it: what it is, its formula, its label, the evidence and its records.</p>' + explorer(ctx) + "</div>",
      "Each guide keeps general ingredient information separate from facts about our product.");
    var essentials = hubSection(v, "essentials", 3, "The supplement essentials", '<ol class="lr-guides">' + L.FOUNDATION.map(function (slug, i) {
      var g = L.foundation(slug);
      return '<li class="lr-guide-card"><p class="lr-guide-n" aria-hidden="true">' + pad(i + 1) + '</p><h3><a href="/learn/' + slug + '">' + h(g.title) + "</a></h3><p>" + h(g.summary) + '</p><p class="lr-meta">' + minutes(foundationText(slug)).min + " min read</p></li>";
    }).join("") + "</ol>", "Five short guides that work for any supplement label, not just ours.");
    var label = hubSection(v, "label", 4, "Look beyond the front label", labelExplorer(), "The back of the pack carries the details that matter. Select a part of this example label to see what it tells you.");
    var evidence = hubSection(v, "evidence", 5, "Understand the evidence", evidenceGrid() + '<h3 class="lr-sub-h">Walk through a report</h3>' + reportWalk(), "Four kinds of evidence, four different questions. Each can establish something specific, and each has limits.");
    var inside = hubSection(v, "inside", 6, "Inside Body Café Co.", '<ul class="lr-inside">' + L.INSIDE.map(function (x) { return '<li><h3>' + h(x.title) + "</h3><p>" + h(x.text) + "</p>" + arrow(x.href, x.cta) + "</li>"; }).join("") + "</ul>");
    var questions = hubSection(v, "questions", 7, "Good questions, clearly answered", '<div class="lr-qs" data-lr-qs><label for="lr-qfilter">Filter these questions</label><input id="lr-qfilter" type="search" data-lr-qfilter autocomplete="off" placeholder="Type a word, such as “iron” or “lot”"><p class="lr-qcount" role="status" data-lr-qcount>' + L.QUESTIONS.length + ' questions</p><ul class="lr-qlist">' +
      L.QUESTIONS.map(function (q) { return '<li data-lr-q><h3>' + h(q[0]) + "</h3><p>" + h(q[1]) + "</p>" + arrow(q[2], "Read the answer in full") + "</li>"; }).join("") +
      '</ul><p class="lr-qempty" data-lr-qempty hidden>No questions match. <button type="button" class="lr-btn is-quiet" data-lr-qclear>Show all questions</button></p><div class="lr-ask"><p><strong>Didn\'t find your question?</strong> Ask it privately; you\'ll get a case ID to follow. For a question about one product, you can also ask on its product page, where answers are published after review.</p>' + arrow("/contact?kind=learn&topic=" + encodeURIComponent("/learn"), "Ask a new question", "lr-btn") + "</div></div>");
    var explore = hubSection(v, "explore", 8, "Keep exploring", '<div class="lr-mine" data-lr-mine></div><h3 class="lr-sub-h">Good places to start</h3><ul class="lr-start">' + ["reading-a-label", "serving-sizes", "understanding-evidence"].map(function (s) { var g = L.foundation(s); return "<li>" + arrow("/learn/" + s, h(g.title)) + "</li>"; }).join("") + "<li>" + arrow("/learn/glossary", "The glossary") + "</li></ul>");
    return intro + hubNav(v) + start + products + essentials + label + evidence + inside + questions + explore;
  }
  function hubNav(v) {
    var items = [["start", "Start here"], ["products", "Products"], ["essentials", "Essentials"], ["label", "Labels"], ["evidence", "Evidence"], ["inside", "Inside"], ["questions", "Questions"], ["explore", "Your reading"]];
    return '<nav class="lr-topics" aria-label="Learn topics"><ol>' + items.map(function (x) { return '<li><a href="#' + x[0] + '">' + x[1] + "</a></li>"; }).join("") + '<li><a href="/learn/glossary">Glossary</a></li></ol></nav>';
  }

  /* ====================================================================================================
     4. GUIDES (articles)
     ==================================================================================================== */
  function guideText(ctx, id) {
    var d = L.PRODUCTS[id];
    return d ? [d.minute, d.what, d.name, d.label.map(function (r) { return r.join(" "); }).join(" "), d.faq.map(function (q) { return q[0] + " " + q[1]; }).join(" "), d.caution || "", L.CARE].join(" ") : "";
  }
  function foundationText(slug) {
    var g = L.foundation(slug);
    return [g.opening, g.takeaways.join(" "), g.sections.map(function (s) { return s.h + " " + s.html; }).join(" "), g.example.reading, g.checklist.join(" ")].join(" ");
  }
  function crumbs(trail) {
    return '<nav class="lr-crumbs" aria-label="Breadcrumb"><ol>' + trail.map(function (c, i) { return "<li>" + (c[1] && i < trail.length - 1 ? '<a href="' + c[1] + '">' + h(c[0]) + "</a>" : '<span aria-current="page">' + h(c[0]) + "</span>") + "</li>"; }).join("") + "</ol></nav>";
  }
  function toc(list) {
    return '<nav class="lr-toc" aria-label="In this guide"><p class="lr-toc-k">In this guide</p><ol>' + list.map(function (x, i) { return '<li><a href="#' + x[0] + '" data-lr-toc="' + x[0] + '"><span class="lr-toc-n" aria-hidden="true">' + (i + 1) + "</span>" + x[1] + "</a></li>"; }).join("") + "</ol></nav>";
  }
  function asec(id, title, inner, tag) {
    return '<section class="lr-asec" id="' + id + '" aria-labelledby="' + id + '-t"><div class="lr-asec-head"><h2 id="' + id + '-t">' + title + '</h2><button type="button" class="lr-share" data-lr-share="' + id + '" aria-label="Copy link to section: ' + h(strip(title)) + '">#</button></div>' + (tag ? '<p class="lr-tag lr-tag-' + tag + '">' + (tag === "general" ? "About the ingredient · general information" : "In our product · Body Café Co. facts") + "</p>" : "") + inner + "</section>";
  }
  function meta(text) {
    var m = minutes(text);
    return '<p class="lr-meta-line"><span>' + m.min + " min read</span><span>" + h(L.BYLINE) + "</span><span>" + h(L.REVIEW) + "</span><span>Version " + L.VERSION.v + ' · <time datetime="' + L.VERSION.date + '">' + L.VERSION.label + "</time></span></p>";
  }
  function actions(slug, title) {
    return '<div class="lr-actions" data-lr-actions data-lr-slug="' + slug + '" data-lr-title="' + h(title) + '"><button type="button" class="lr-btn is-quiet" data-lr-save aria-pressed="false">Save guide</button><button type="button" class="lr-btn is-quiet" data-lr-print>Print learning sheet</button><button type="button" class="lr-btn is-quiet" data-lr-share="">Copy link</button><span class="lr-act-msg" role="status" data-lr-act-msg></span></div>';
  }
  function feedback(slug) {
    return '<section class="lr-feedback" aria-labelledby="lr-fb-t" data-lr-feedback data-lr-topic="/learn/' + slug + '"><h2 id="lr-fb-t">Was this explanation clear?</h2><div class="lr-fb-vote"><button type="button" class="lr-btn is-quiet" data-lr-vote="yes">Yes</button><button type="button" class="lr-btn is-quiet" data-lr-vote="no">Not quite</button></div><p class="lr-fb-msg" role="status" data-lr-vote-msg></p>' +
      '<div class="lr-fb-forms">' + fbForm("correction", "Suggest a correction", "What looks wrong or unclear, and where? Point to the section if you can.") + fbForm("followup", "Ask a follow-up", "Your question goes to our support team privately, with a case ID you can follow. We don't give personal medical advice.") + "</div>" +
      '<p class="lr-small">Please don\'t include health details, medical records or contact details in these messages.</p></section>';
  }
  function fbForm(kind, title, help) {
    var id = "lr-fb-" + kind;
    return '<details class="lr-fb"><summary>' + title + '</summary><form class="lr-fb-form" data-lr-fb="' + kind + '" novalidate><label for="' + id + '-sec">Section (optional)</label><select id="' + id + '-sec" name="section" data-lr-fb-sections></select><label for="' + id + '-msg">' + (kind === "correction" ? "Your suggestion" : "Your question") + '</label><p class="lr-help" id="' + id + '-help">' + help + '</p><textarea id="' + id + '-msg" name="message" minlength="10" maxlength="1500" required aria-describedby="' + id + '-help ' + id + '-err"></textarea><p class="lr-err" id="' + id + '-err" role="alert"></p><button type="submit" class="lr-btn">Send privately</button><div class="lr-fb-result" role="status"></div></form></details>';
  }
  function printSheet(title, rows, sources, slug) {
    return '<section class="lr-print" aria-hidden="true"><p class="lr-print-k">Body Café Co. · Learning sheet</p><h2>' + h(title) + "</h2>" + rows.map(function (r) { return "<h3>" + h(r[0]) + "</h3>" + (Array.isArray(r[1]) ? "<ul>" + r[1].map(function (x) { return "<li>" + h(x) + "</li>"; }).join("") + "</ul>" : "<p>" + h(r[1]) + "</p>"); }).join("") +
      "<h3>Sources</h3><ul>" + sources.filter(function (k) { return L.SRC[k]; }).map(function (k) { return "<li>" + h(L.SRC[k].t) + " — " + h(L.SRC[k].u) + "</li>"; }).join("") + "</ul>" +
      '<p class="lr-print-foot">General information for reading labels; not personal advice or a treatment plan. ' + h(L.BYLINE) + " · " + h(L.REVIEW) + " · Version " + L.VERSION.v + ", " + L.VERSION.label + ' · <span data-lr-print-url>/learn/' + slug + "</span></p></section>";
  }

  function productGuide(v, ctx, id) {
    var p = product(ctx, id), d = L.PRODUCTS[id];
    if (!p || !d) return null;
    var idx = ctx.catalog.indexOf(p) + 1, pi = ctx.published.indexOf(p), nextP = ctx.published[(pi + 1) % ctx.published.length];
    var pending = (TO_CONFIRM[id] || []).concat(["Complete ingredient list, allergens, storage and manufacturer details"]);
    var allSrc = [].concat(d.whatSrc || [], d.nameSrc || [], d.cautionSrc || [], L.RESEARCH[d.research] || []).filter(function (k, i, a) { return a.indexOf(k) === i; });
    var sections = [
      ["minute", "In a minute"], ["what", "What it is"], ["name", "Names, forms and terms"], ["research", "What the research says"], ["inside", "Inside our product"],
      ["label", "How to read this label"], ["use", "Usage, cautions and storage"], ["records", "Quality, sourcing and lot records"], ["questions", "Common questions"], ["sources", "Sources and versions"], ["next", "Keep going"],
    ];
    var caution = '<aside class="lr-caution" aria-label="Before you take it"><p class="lr-caution-k">Before you take it</p><p>' + h(L.CARE) + "</p>" + (d.caution ? "<p>" + h(d.caution) + "</p>" + srcList(d.cautionSrc) : "") + "<p><strong>Directions, cautions and storage for our product:</strong> " + h(L.PENDING).toLowerCase() + ".</p></aside>";
    var body =
      asec("minute", "In a minute", '<p class="lr-minute">' + h(d.minute) + "</p>" + caution) +
      asec("what", "What it is", terms(d.what) + srcList(d.whatSrc), "general") +
      asec("name", "Names, forms and terms", terms(d.name) + srcList(d.nameSrc), "general") +
      asec("research", "What the research says", '<div class="lr-status"><p><strong>A reviewed research summary is being prepared.</strong> Research summaries on this site are published only after specialist review, so this guide doesn\'t yet summarise findings or outcomes.</p><p>Research on an ingredient describes that ingredient, in the form, amount and people studied. It isn\'t evidence about our finished product. ' + arrow("/learn/understanding-evidence#transfer", "Why that matters") + '</p></div><p>Independent summaries you can read now:</p>' + srcList(L.RESEARCH[d.research], "lr-src is-list"), "general") +
      asec("inside", "Inside our product", '<div class="lr-inside-grid"><figure class="lr-figure"><img src="/web/media/' + id + '.webp" alt="' + h(p.name) + ', front of the bottle (draft packaging)" width="' + ((ctx.bottleWidth && ctx.bottleWidth[id]) || 720) + '" height="1000" loading="lazy" decoding="async"><figcaption>Draft packaging. Wording printed on the pack is label artwork, not a claim made in this guide.</figcaption></figure><div>' +
        '<dl class="lr-facts"><div><dt>Product</dt><dd>' + h(p.name) + "</dd></div><div><dt>Ingredient in view</dt><dd>" + h(p.ingredients) + "</dd></div><div><dt>Format</dt><dd>" + h(ctx.format[id]) + "</dd></div><div><dt>Cap colour</dt><dd><span class=\"lr-dot\" style=\"--dot:" + h(p.color) + '" aria-hidden="true"></span> Its own colour in the range</dd></div>' +
        (d.allergen ? "<div><dt>Allergen information</dt><dd>" + h(d.allergen) + "</dd></div>" : "") + '<div><dt>Formulation status</dt><dd>' + h(p.label_note || L.PENDING) + "</dd></div></dl>" +
        '<h3 class="lr-sub-h">Awaiting the approved label</h3><ul class="lr-pending">' + pending.map(function (x) { return "<li>" + h(x) + "</li>"; }).join("") + "</ul>" + arrow("/products/" + id + "#ingredients", "See the product page", "lr-link") + "</div></div>", "ours") +
      asec("label", "How to read this label", '<dl class="lr-check">' + d.label.map(function (r) { return "<div><dt>" + h(r[0]) + "</dt><dd>" + h(r[1]) + "</dd></div>"; }).join("") + "</dl>" + arrow("/learn/reading-a-label", "How to read any label")) +
      asec("use", "Usage, cautions and storage", '<dl class="lr-facts"><div><dt>Directions</dt><dd>' + h(L.PENDING) + ". We don't suggest a dose.</dd></div><div><dt>Cautions</dt><dd>" + h(L.PENDING) + ". The general note in “Before you take it” above always applies.</dd></div><div><dt>Storage</dt><dd>" + h(L.PENDING) + ".</dd></div></dl>", "ours") +
      asec("records", "Quality, sourcing and lot records", '<dl class="lr-facts"><div><dt>Ingredient sourcing</dt><dd>Not yet published.</dd></div><div><dt>Finished-product test results</dt><dd>None published yet.</dd></div><div><dt>Certifications</dt><dd>None claimed.</dd></div><div><dt>Lot records</dt><dd>Look up a lot with the number on your pack. Preview records are demonstrations; try DEMO-' + pad(idx) + "-01.</dd></div></dl>" + '<p class="lr-ex-links">' + arrow("/reports?product=" + id, "Look up a lot report") + arrow("/standards#lot", "How packs link to lots") + arrow("/learn/understanding-reports", "Read a lot report") + "</p>", "ours") +
      asec("questions", "Common questions", '<dl class="lr-faq">' + d.faq.map(function (q) { return "<div><dt>" + h(q[0]) + "</dt><dd>" + h(q[1]) + ' <a href="#' + q[2] + '">Go to the section</a></dd></div>'; }).join("") + "</dl>" + arrow("/products/" + id + "#questions", "Questions answered on the product page")) +
      asec("sources", "Sources and versions", '<ol class="lr-sources">' + allSrc.map(function (k) { return '<li><a href="' + L.SRC[k].u + '" rel="noopener" target="_blank">' + h(L.SRC[k].t) + "</a></li>"; }).join("") + '</ol><dl class="lr-facts"><div><dt>Written by</dt><dd>' + h(L.BYLINE) + "</dd></div><div><dt>Review</dt><dd>" + h(L.REVIEW) + "</dd></div><div><dt>Version</dt><dd>" + L.VERSION.v + ', <time datetime="' + L.VERSION.date + '">' + L.VERSION.label + "</time> (first version)</dd></div></dl>") +
      asec("next", "Keep going", '<ul class="lr-next">' + ["<li>" + arrow("/products/" + id, "View the " + h(p.name) + " product page") + "</li>", "<li>" + arrow("/learn/ingredient-forms", "Why ingredient forms matter") + "</li>", "<li>" + arrow("/learn/serving-sizes", "Serving sizes, amounts and units") + "</li>", "<li>" + arrow("/learn/" + nextP.id, "Next product guide: " + h(nextP.name)) + "</li>", "<li>" + arrow("/contact?kind=learn&topic=" + encodeURIComponent("/learn/" + id), "Ask our support team") + "</li>"].join("") + "</ul>");
    var sheet = printSheet(p.name, [["In a minute", d.minute], ["Confirmed facts", ["Product: " + p.name, "Ingredient in view: " + p.ingredients, "Format: " + ctx.format[id]].concat(d.allergen ? [d.allergen] : [])], ["Awaiting the approved label", pending], ["What to check on the label", d.label.map(function (r) { return r[0] + ": " + r[1]; })], ["Before you take it", [L.CARE].concat(d.caution ? [d.caution] : [])]], allSrc, id);
    return article(v, ctx, { slug: id, title: p.name, kind: "Product guide", trail: [["Learn", "/learn"], ["Products", "/learn#products"], [p.name]], summary: d.minute, sections: sections, body: body, text: guideText(ctx, id), sheet: sheet, style: ctx.capStyle(p), related: ["serving-sizes", "ingredient-forms", "understanding-evidence"] });
  }
  function foundationGuide(v, ctx, slug) {
    var g = L.foundation(slug);
    if (!g) return null;
    var sections = [["minute", "In a minute"]].concat(g.sections.map(function (s) { return [s.id, s.h]; })).concat([["example", "Worked example"], ["checklist", "Checklist"], ["sources", "Sources and versions"]]);
    var body = asec("minute", "In a minute", '<p class="lr-minute">' + h(g.opening) + '</p><ul class="lr-takeaways">' + g.takeaways.map(function (t) { return "<li>" + h(t) + "</li>"; }).join("") + "</ul>") +
      g.sections.map(function (s) { return asec(s.id, h(s.h), terms(s.html) + srcList(s.src)); }).join("") +
      asec("example", "Worked example", '<div class="lr-example"><p class="lr-example-tag">' + h(g.example.note) + "</p><h3>" + h(g.example.title) + '</h3><dl class="lr-facts">' + g.example.rows.map(function (r) { return "<div><dt>" + h(r[0]) + "</dt><dd>" + h(r[1]) + "</dd></div>"; }).join("") + "</dl><p>" + h(g.example.reading) + "</p></div>") +
      asec("checklist", "Checklist", '<ul class="lr-checklist">' + g.checklist.map(function (t) { return "<li>" + h(t) + "</li>"; }).join("") + "</ul>") +
      asec("sources", "Sources and versions", (g.sources.length ? '<ol class="lr-sources">' + g.sources.filter(function (k) { return L.SRC[k]; }).map(function (k) { return '<li><a href="' + L.SRC[k].u + '" rel="noopener" target="_blank">' + h(L.SRC[k].t) + "</a></li>"; }).join("") + "</ol>" : "<p>This guide explains general reading practice and doesn't rely on an external source.</p>") + '<dl class="lr-facts"><div><dt>Written by</dt><dd>' + h(L.BYLINE) + "</dd></div><div><dt>Review</dt><dd>" + h(L.REVIEW) + "</dd></div><div><dt>Version</dt><dd>" + L.VERSION.v + ', <time datetime="' + L.VERSION.date + '">' + L.VERSION.label + "</time></dd></div></dl>");
    var sheet = printSheet(g.title, [["In a minute", g.opening], ["Key points", g.takeaways], ["Checklist", g.checklist], [g.example.title + " (fictional example)", g.example.rows.map(function (r) { return r[0] + ": " + r[1]; }).concat([g.example.reading])]], g.sources, slug);
    return article(v, ctx, { slug: slug, title: g.title, kind: "Essentials", trail: [["Learn", "/learn"], ["Essentials", "/learn#essentials"], [g.title]], summary: g.summary, sections: sections, body: body, text: foundationText(slug), sheet: sheet, related: g.related });
  }
  function article(v, ctx, a) {
    var related = '<section class="lr-related" aria-labelledby="lr-rel-t"><h2 id="lr-rel-t">Related guides</h2><ul>' + a.related.filter(function (s) { return s !== a.slug; }).slice(0, 3).map(function (s) { var g = L.foundation(s); return "<li>" + arrow("/learn/" + s, h(g.title)) + "<p>" + h(g.summary) + "</p></li>"; }).join("") + "</ul>" + arrow("/learn", "Back to the Learn hub", "lr-btn is-quiet") + "</section>";
    return '<div class="lr lr-' + v.key + ' lr-article" data-lr data-lr-page="guide" data-lr-slug="' + a.slug + '"' + (a.style ? ' style="' + a.style + '"' : "") + ">" +
      '<header class="lr-ahead"><div class="lr-ahead-in">' + crumbs(a.trail) + '<p class="lr-kicker">' + (v.guideKicker ? v.guideKicker(a.kind) : a.kind) + '</p><h1 class="lr-h1" id="lr-h1">' + h(a.title) + '</h1><p class="lr-summary">' + h(a.summary) + "</p>" + meta(a.text) + actions(a.slug, a.title) + "</div></header>" +
      '<div class="lr-alayout">' + toc(a.sections) + '<article class="lr-abody" aria-labelledby="lr-h1">' + a.body + feedback(a.slug) + related + "</article></div>" + a.sheet + "</div>";
  }

  function glossary(v, ctx) {
    var letters = {};
    var sorted = L.GLOSSARY.slice().sort(function (a, b) { return a[1].localeCompare(b[1]); });
    sorted.forEach(function (t) { var k = t[1].replace(/^[“"]/, "")[0].toUpperCase(); (letters[k] = letters[k] || []).push(t); });
    return '<div class="lr lr-' + v.key + ' lr-article lr-glossary" data-lr data-lr-page="glossary" data-lr-slug="glossary"><header class="lr-ahead"><div class="lr-ahead-in">' + crumbs([["Learn", "/learn"], ["Glossary"]]) + '<p class="lr-kicker">Glossary</p><h1 class="lr-h1">The words on the label</h1><p class="lr-summary">Plain definitions for the terms used across our guides. Each links to the guide that explains it in full.</p></div></header>' +
      '<div class="lr-gloss-in"><div class="lr-gloss-tools"><label for="lr-gfilter">Filter terms</label><input id="lr-gfilter" type="search" data-lr-gfilter autocomplete="off" placeholder="For example “unit” or “omega”"><p role="status" data-lr-gcount>' + L.GLOSSARY.length + ' terms</p></div><p class="lr-gempty" data-lr-gempty hidden>No terms match. <button type="button" class="lr-btn is-quiet" data-lr-gclear>Show all terms</button></p>' +
      Object.keys(letters).sort().map(function (k) {
        return '<section class="lr-gl" aria-labelledby="gl-' + k + '"><h2 id="gl-' + k + '">' + k + '</h2><dl>' + letters[k].map(function (t) { return '<div class="lr-gterm" id="term-' + t[0] + '" data-lr-gterm><dt>' + h(t[1]) + "</dt><dd>" + h(t[2]) + ' <a href="' + t[3] + '">Read more</a></dd></div>'; }).join("") + "</dl></section>";
      }).join("") + '<p class="lr-gloss-back">' + arrow("/learn", "Back to the Learn hub", "lr-btn is-quiet") + "</p></div></div>";
  }

  function compose(v, ctx, slug, base) {
    termN = 0;
    INDEX = buildIndex(ctx);
    if (!slug) return '<div class="lr lr-' + v.key + ' lr-hub" data-lr data-lr-page="hub">' + hub(v, ctx) + "</div>";
    if (slug === "glossary") return glossary(v, ctx);
    var out = L.PRODUCTS[slug] ? productGuide(v, ctx, slug) : L.FOUNDATION.indexOf(slug) >= 0 ? foundationGuide(v, ctx, slug) : null;
    return out || (base && base.learn ? base.learn(ctx, slug) : undefined);
  }

  /* ====================================================================================================
     5. DIRECTIONS
     ==================================================================================================== */
  var V = {
    a: { key: "a", kicker: "BCC / Learn", k: function (n) { return "[" + pad(n) + "]"; }, guideKicker: function (k) { return "BCC / " + k; } },
    b: { key: "b", kicker: "Learn · Pull up a chair", k: function (n) { return pad(n); } },
    c: { key: "c", kicker: "Body Café Co. / The reading room", k: function (n) { return "Chapter " + pad(n); }, guideKicker: function (k) { return "The reading room · " + k; } },
    d: { key: "d", kicker: "Body Café Co. / The reading room, after hours", k: function (n) { return "Room " + pad(n); } },
    e: { key: "e", kicker: "Learn · 7 products · 5 essentials", k: function (n) { return pad(n) + " / 08"; } },
    f: { key: "f", kicker: "Edition 01 · Learn", k: function (n) { return "No. " + pad(n); }, guideKicker: function (k) { return "Feature · " + k; } },
    g: { key: "g", kicker: "Learn / contact sheet", k: function (n) { return "Frame " + pad(n) + " / 08"; } },
    h: { key: "h", kicker: "Learn · Reference", k: function (n) { return "§ " + n; }, guideKicker: function (k) { return "Reference · " + k; } },
  };
  Object.keys(V).forEach(function (d) {
    if (!S.themes[d]) return;
    var base = S.themes[d], next = {};
    Object.keys(base).forEach(function (k) { next[k] = base[k]; });
    next.learn = function (ctx, slug) { return compose(V[d], ctx, slug, base); };
    S.themes[d] = next;
  });

  /* ====================================================================================================
     6. BEHAVIOUR
     ==================================================================================================== */
  var KEY = "bcc-learn";
  function store() { try { var x = JSON.parse(localStorage.getItem(KEY) || "{}"); return { saved: Array.isArray(x.saved) ? x.saved : [], history: Array.isArray(x.history) ? x.history : [] }; } catch (e) { return null; } }
  function put(x) { try { localStorage.setItem(KEY, JSON.stringify(x)); return true; } catch (e) { return false; } }
  function App() { return window.BCCApp || null; }
  var cleanup = function () {};
  var reduced = function () { return matchMedia("(prefers-reduced-motion: reduce)").matches; };

  function enhance() {
    cleanup();
    var root = document.querySelector("[data-lr]");
    if (!root) return;
    var abort = new AbortController(), signal = abort.signal;
    var on = function (el, ev, fn, opt) { if (el) el.addEventListener(ev, fn, Object.assign({ signal: signal }, opt || {})); };
    var page = root.getAttribute("data-lr-page"), slug = root.getAttribute("data-lr-slug") || "";

    /* Inline glossary: a disclosure button; Escape closes; one open at a time. */
    on(root, "click", function (e) {
      var b = e.target.closest("[data-lr-term]");
      if (!b) return;
      var tip = document.getElementById(b.getAttribute("aria-controls")), open = b.getAttribute("aria-expanded") !== "true";
      root.querySelectorAll('[data-lr-term][aria-expanded="true"]').forEach(function (o) { if (o !== b) { o.setAttribute("aria-expanded", "false"); document.getElementById(o.getAttribute("aria-controls")).hidden = true; } });
      b.setAttribute("aria-expanded", String(open)); tip.hidden = !open;
    });
    on(root, "keydown", function (e) {
      if (e.key !== "Escape") return;
      var b = e.target.closest(".lr-term") && e.target.closest(".lr-term").querySelector("[data-lr-term]");
      if (b && b.getAttribute("aria-expanded") === "true") { b.click(); b.focus(); }
    });

    /* Copy a link to a section (or the page). The link keeps the design. */
    on(root, "click", function (e) {
      var b = e.target.closest("[data-lr-share]");
      if (!b) return;
      var id = b.getAttribute("data-lr-share"), u = new URL(location.href);
      u.hash = id ? id : "";
      var link = u.toString(), msg = root.querySelector("[data-lr-act-msg]");
      var done = function (ok) {
        var text = ok ? "Link copied" + (id ? " to this section" : "") + "." : "Copy this link: " + link;
        if (msg) msg.textContent = text;
        if (id) { history.replaceState(history.state, "", u.pathname + u.search + u.hash); }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(function () { done(true); }, function () { done(false); });
      else done(false);
    });

    if (page === "hub") hubBehaviour(root, on);
    if (page === "guide") guideBehaviour(root, on, slug);
    if (page === "glossary") filterList(root, on, "[data-lr-gfilter]", "[data-lr-gterm]", "[data-lr-gcount]", "[data-lr-gempty]", "[data-lr-gclear]", "terms", function (el) { return el.textContent; });

    cleanup = function () { abort.abort(); };
  }

  function filterList(root, on, inputSel, itemSel, countSel, emptySel, clearSel, noun, text) {
    var input = root.querySelector(inputSel), items = [].slice.call(root.querySelectorAll(itemSel));
    var run = function () {
      var q = input.value.trim().toLowerCase(), n = 0;
      items.forEach(function (el) { var show = !q || text(el).toLowerCase().indexOf(q) >= 0; el.hidden = !show; if (show) n++; });
      root.querySelectorAll(".lr-gl").forEach(function (s) { s.hidden = !s.querySelector("[data-lr-gterm]:not([hidden])"); });
      root.querySelector(countSel).textContent = q ? n + " of " + items.length + " " + noun : items.length + " " + noun;
      root.querySelector(emptySel).hidden = n > 0;
    };
    on(input, "input", run);
    on(root.querySelector(clearSel), "click", function () { input.value = ""; run(); input.focus(); });
  }

  function hubBehaviour(root, on) {
    /* Search in place; the query is kept in the address (?q=) so results can be shared and survive refresh. */
    var form = root.querySelector("[data-lr-search]"), input = root.querySelector("#lr-q"), box = root.querySelector("[data-lr-results]");
    var runSearch = function (q, push) {
      box.innerHTML = resultsHtml(q);
      var u = new URL(location.href);
      if (q) u.searchParams.set("q", q); else u.searchParams.delete("q");
      var href = u.pathname + u.search + u.hash;
      if (href !== location.pathname + location.search + location.hash) {
        if (push) history.pushState({}, "", href); else history.replaceState(history.state, "", href);
        if (App() && App().routeChanged) App().routeChanged();
      }
      if (App() && App().keepDesignOnLinks) App().keepDesignOnLinks();
    };
    on(form, "submit", function (e) { e.preventDefault(); e.stopPropagation(); runSearch(input.value.trim(), true); }, { capture: true });
    on(root, "click", function (e) {
      var t = e.target.closest("[data-lr-try]"), r = e.target.closest("[data-lr-reset]");
      if (t) { input.value = t.getAttribute("data-lr-try"); runSearch(input.value, true); }
      if (r) { input.value = ""; runSearch("", true); input.focus(); }
    });

    /* Product explorer: a radio group of products and a tab list of steps, both with arrow keys. */
    var ex = root.querySelector("[data-lr-explorer]");
    if (ex) {
      var picks = [].slice.call(ex.querySelectorAll("[data-lr-pick]"));
      var choose = function (b, focus) {
        picks.forEach(function (x) { var onx = x === b; x.setAttribute("aria-checked", String(onx)); x.tabIndex = onx ? 0 : -1; });
        ex.querySelectorAll("[data-lr-ex-product]").forEach(function (p) { p.hidden = p.getAttribute("data-lr-ex-product") !== b.getAttribute("data-lr-pick"); });
        if (focus) b.focus();
      };
      picks.forEach(function (b, i) {
        on(b, "click", function () { choose(b, false); });
        on(b, "keydown", function (e) {
          var k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
          if (e.key === "Home") k = -i; if (e.key === "End") k = picks.length - 1 - i;
          if (k === undefined) return;
          e.preventDefault(); choose(picks[(i + k + picks.length) % picks.length], true);
        });
      });
      ex.querySelectorAll('[role="tablist"]').forEach(function (list) {
        var tabs = [].slice.call(list.querySelectorAll('[role="tab"]'));
        var sel = function (t, focus) {
          tabs.forEach(function (x) { var onx = x === t; x.setAttribute("aria-selected", String(onx)); x.tabIndex = onx ? 0 : -1; document.getElementById(x.getAttribute("aria-controls")).hidden = !onx; });
          if (focus) t.focus();
        };
        tabs.forEach(function (t, i) {
          on(t, "click", function () { sel(t, false); });
          on(t, "keydown", function (e) {
            var k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
            if (e.key === "Home") k = -i; if (e.key === "End") k = tabs.length - 1 - i;
            if (k === undefined) return;
            e.preventDefault(); sel(tabs[(i + k + tabs.length) % tabs.length], true);
          });
        });
      });
    }

    /* Label explorer. */
    var lx = root.querySelector("[data-lr-label]");
    if (lx) on(lx, "click", function (e) {
      var b = e.target.closest("[data-lr-part]");
      if (!b) return;
      var parts = L.LABEL.parts, i = parts.map(function (p) { return p.id; }).indexOf(b.getAttribute("data-lr-part"));
      lx.querySelectorAll("[data-lr-part]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      lx.querySelector("[data-lr-part-detail]").innerHTML = partDetail(parts[i], i);
      if (App() && App().keepDesignOnLinks) App().keepDesignOnLinks();
    });

    /* Report walkthrough. */
    var wk = root.querySelector("[data-lr-walk]");
    if (wk) {
      var at = 0, rows = L.REPORT.rows;
      on(wk, "click", function (e) {
        var b = e.target.closest("[data-lr-walk]");
        if (!b || b === wk) return;
        at = Math.max(0, Math.min(rows.length - 1, at + Number(b.getAttribute("data-lr-walk"))));
        wk.querySelectorAll("[data-lr-row]").forEach(function (r) { r.classList.toggle("is-on", Number(r.getAttribute("data-lr-row")) === at); });
        wk.querySelector("[data-lr-walk-text]").innerHTML = "<strong>" + h(rows[at].k) + ".</strong> " + h(rows[at].explain);
        wk.querySelector("[data-lr-walk-count]").textContent = "Step " + (at + 1) + " of " + rows.length;
        wk.querySelector('[data-lr-walk="-1"]').disabled = at === 0;
        wk.querySelector('[data-lr-walk="1"]').disabled = at === rows.length - 1;
      });
      wk.querySelector('[data-lr-walk="-1"]').disabled = true;
    }

    /* Question filter. */
    filterList(root, on, "[data-lr-qfilter]", "[data-lr-q]", "[data-lr-qcount]", "[data-lr-qempty]", "[data-lr-qclear]", "questions", function (el) { return el.textContent; });

    /* Saved guides and reading history (this browser only). */
    renderMine(root, on);
  }

  function renderMine(root, on) {
    var box = root.querySelector("[data-lr-mine]");
    if (!box) return;
    var draw = function () {
      var s = store();
      if (!s) { box.innerHTML = '<p class="lr-small">Saving isn\'t available in this browser, so saved guides and reading history can\'t be shown.</p>'; return; }
      var saved = s.saved.length ? '<ul class="lr-mine-list">' + s.saved.map(function (x) { return '<li><a href="/learn/' + h(x.slug) + '">' + h(x.title) + '</a><button type="button" class="lr-x" data-lr-unsave="' + h(x.slug) + '" aria-label="Remove ' + h(x.title) + ' from saved guides">Remove</button></li>'; }).join("") + "</ul>" : '<p class="lr-small">Nothing saved yet. Use “Save guide” on any guide to keep it here.</p>';
      var hist = s.history.length ? '<ul class="lr-mine-list">' + s.history.map(function (x) { return '<li><a href="/learn/' + h(x.slug) + (x.section ? "#" + h(x.section) : "") + '">' + h(x.title) + (x.sectionTitle ? " — " + h(x.sectionTitle) : "") + "</a></li>"; }).join("") + "</ul>" : '<p class="lr-small">No reading history yet.</p>';
      box.innerHTML = '<div class="lr-mine-grid"><div><h3 class="lr-sub-h">Saved guides</h3>' + saved + (s.saved.length ? '<button type="button" class="lr-btn is-quiet" data-lr-clear="saved">Clear saved guides</button>' : "") + '</div><div><h3 class="lr-sub-h">Continue reading</h3>' + hist + (s.history.length ? '<button type="button" class="lr-btn is-quiet" data-lr-clear="history">Clear reading history</button>' : "") +
        '</div></div><p class="lr-small">Saved guides and reading history stay in this browser only. They aren\'t sent to us and don\'t need an account.</p><p class="lr-small" role="status" data-lr-mine-msg></p>';
      if (App() && App().keepDesignOnLinks) App().keepDesignOnLinks();
    };
    draw();
    on(box, "click", function (e) {
      var u = e.target.closest("[data-lr-unsave]"), c = e.target.closest("[data-lr-clear]"), s = store();
      if (!s || (!u && !c)) return;
      var msg = "";
      if (u) { s.saved = s.saved.filter(function (x) { return x.slug !== u.getAttribute("data-lr-unsave"); }); msg = "Removed from saved guides."; }
      if (c) { s[c.getAttribute("data-lr-clear")] = []; msg = c.getAttribute("data-lr-clear") === "saved" ? "Saved guides cleared." : "Reading history cleared."; }
      put(s); draw();
      box.querySelector("[data-lr-mine-msg]").textContent = msg;
      (box.querySelector("button") || root.querySelector("#explore-t")).focus && (box.querySelector("button") || root.querySelector("#explore-t")).focus();
    });
  }

  function guideBehaviour(root, on, slug) {
    var title = root.querySelector(".lr-h1").textContent;
    /* Save / unsave. */
    var save = root.querySelector("[data-lr-save]"), msg = root.querySelector("[data-lr-act-msg]");
    var sync = function () { var s = store(); var saved = !!s && s.saved.some(function (x) { return x.slug === slug; }); save.setAttribute("aria-pressed", String(saved)); save.textContent = saved ? "Saved" : "Save guide"; if (!s) save.disabled = true; };
    sync();
    on(save, "click", function () {
      var s = store();
      if (!s) { msg.textContent = "Saving isn't available in this browser."; return; }
      var was = s.saved.some(function (x) { return x.slug === slug; });
      s.saved = s.saved.filter(function (x) { return x.slug !== slug; });
      if (!was) s.saved.unshift({ slug: slug, title: title });
      s.saved = s.saved.slice(0, 20);
      msg.textContent = put(s) ? (was ? "Removed from your saved guides." : "Saved in this browser. Find it on the Learn hub.") : "Saving isn't available in this browser.";
      sync();
    });
    /* Print the learning sheet: during printing, the sheet is the only thing on the page (also for Ctrl/Cmd+P). */
    on(root.querySelector("[data-lr-print]"), "click", function () { window.print(); });
    on(window, "beforeprint", function () {
      var sheet = root.querySelector(".lr-print");
      if (!sheet || document.getElementById("lr-print-root")) return;
      var box = document.createElement("div");
      box.id = "lr-print-root";
      var copy = sheet.cloneNode(true), u = copy.querySelector("[data-lr-print-url]");
      if (u) u.textContent = location.origin + "/learn/" + slug;
      box.appendChild(copy);
      document.body.appendChild(box);
      document.documentElement.classList.add("lr-printing");
    });
    on(window, "afterprint", function () {
      var box = document.getElementById("lr-print-root");
      if (box) box.remove();
      document.documentElement.classList.remove("lr-printing");
    });

    /* Contents: highlight the section in view, and remember it as the place to resume. */
    var links = [].slice.call(root.querySelectorAll("[data-lr-toc]"));
    var secs = links.map(function (a) { return document.getElementById(a.getAttribute("data-lr-toc")); }).filter(Boolean);
    var ticking = false, last = "";
    var remember = function (id, t) {
      var s = store(); if (!s) return;
      s.history = s.history.filter(function (x) { return x.slug !== slug; });
      s.history.unshift({ slug: slug, title: title, section: id, sectionTitle: t });
      s.history = s.history.slice(0, 6); put(s);
    };
    var spy = function () {
      ticking = false;
      var line = innerHeight * 0.3, cur = secs[0];
      secs.forEach(function (el) { if (el.getBoundingClientRect().top <= line) cur = el; });
      if (!cur) return;
      links.forEach(function (a) { if (a.getAttribute("data-lr-toc") === cur.id) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current"); });
      if (cur.id !== last) { last = cur.id; remember(cur.id, cur.querySelector("h2").textContent); }
    };
    on(window, "scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
    spy();
    on(root, "click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a || !root.contains(a)) return;
      var t = document.getElementById(a.getAttribute("href").slice(1));
      if (!t) return;
      e.preventDefault();
      var u = new URL(location.href); u.hash = t.id;
      history.replaceState(history.state, "", u.pathname + u.search + u.hash);
      t.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
      var hd = t.querySelector("h2") || t; hd.setAttribute("tabindex", "-1"); hd.focus({ preventScroll: true });
    });

    /* Feedback: anonymous clarity vote, and private correction / follow-up cases. */
    var fb = root.querySelector("[data-lr-feedback]");
    if (!fb) return;
    var topic = fb.getAttribute("data-lr-topic"), app = App(), staticPreview = !app || (app.staticPreview && app.staticPreview());
    var opts = '<option value="">Whole guide</option>' + secs.map(function (s) { return '<option value="' + s.id + '">' + h(s.querySelector("h2").textContent) + "</option>"; }).join("");
    fb.querySelectorAll("[data-lr-fb-sections]").forEach(function (sel) { sel.innerHTML = opts; });
    if (staticPreview) {
      fb.querySelectorAll("button, textarea, select").forEach(function (x) { x.disabled = true; });
      fb.querySelector("[data-lr-vote-msg]").textContent = "Feedback and questions can't be sent from this shared design preview. They work in the full store.";
      return;
    }
    fb.querySelectorAll("[data-lr-vote]").forEach(function (b) {
      on(b, "click", function () {
        var m = fb.querySelector("[data-lr-vote-msg]");
        fb.querySelectorAll("[data-lr-vote]").forEach(function (x) { x.disabled = true; });
        m.textContent = "Sending…";
        app.api("/learn/feedback", { page: topic, section: last || "", clear: b.getAttribute("data-lr-vote") === "yes" }).then(function () {
          m.textContent = b.getAttribute("data-lr-vote") === "yes" ? "Thanks. Your answer was recorded, without your name or contact details." : "Thanks. Your answer was recorded, without your name or contact details. If you can, tell us what was unclear below.";
          if (b.getAttribute("data-lr-vote") === "no") { var d = fb.querySelector(".lr-fb"); d.open = true; d.querySelector("textarea").focus(); }
        }, function (err) { m.textContent = "That didn't send: " + err.message + " Please try again."; fb.querySelectorAll("[data-lr-vote]").forEach(function (x) { x.disabled = false; }); });
      });
    });
    fb.querySelectorAll("[data-lr-fb]").forEach(function (form) {
      on(form, "submit", function (e) {
        e.preventDefault(); e.stopPropagation();
        var ta = form.querySelector("textarea"), err = form.querySelector(".lr-err"), out = form.querySelector(".lr-fb-result"), btn = form.querySelector('button[type="submit"]');
        var text = ta.value.trim();
        err.textContent = ""; ta.removeAttribute("aria-invalid");
        if (text.length < 10) { err.textContent = "Please write at least 10 characters."; ta.setAttribute("aria-invalid", "true"); ta.focus(); return; }
        if (btn.disabled) return;
        btn.disabled = true; out.textContent = "Sending…";
        var sec = form.querySelector("select").value;
        app.api("/cases", { kind: "learn", feedback: form.getAttribute("data-lr-fb"), topic: topic + (sec ? "#" + sec : ""), message: text }).then(function (c) {
          out.innerHTML = "<strong>Sent privately.</strong> Your case ID is " + h(c.id) + '. <a href="/account/cases">Follow it in your account</a>.';
          ta.value = ""; btn.disabled = false;
          if (app.keepDesignOnLinks) app.keepDesignOnLinks();
        }, function (er) { out.textContent = ""; err.textContent = er.message; btn.disabled = false; });
      }, { capture: true });
    });
  }

  window.BCCLearn = { enhance: enhance, search: search, index: function () { return INDEX; } };
})();
