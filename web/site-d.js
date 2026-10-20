/* Body Café Co. — Direction D, Still life: the complete site.
   Grammar: each bottle is an object on a porcelain plinth in morning window light, shown with a museum wall label;
   pages are set like the packaging's own documents (boxed facts panels with heavy rules, spec rows, catalogue numbers);
   Aileron Light at display sizes, LEMON MILK only for small tracked labels; roast-dark rooms for "turning the bottle over".
   Cap colours stay accents, never floods. Content comes from BCCSite; behaviour from app.js. */
(function () {
  "use strict";
  var S = window.BCCSite;

  function k(text, cls) { return '<p class="td-k ' + (cls || "") + '">' + text + "</p>"; }
  function title(text, tag, cls) { tag = tag || "h2"; return "<" + tag + ' class="td-title ' + (cls || "") + '">' + text + "</" + tag + ">"; }
  function btn(href, label, cls) { return '<a class="td-btn ' + (cls || "") + '" href="' + href + '"><span>' + label + '</span><span aria-hidden="true">→</span></a>'; }
  function tlink(href, label) { return '<a class="td-link" href="' + href + '">' + label + "</a>"; }
  function no(ctx, p) { var i = ctx.catalog.indexOf(p) + 1; return "No. " + (i < 10 ? "0" : "") + i + " of 0" + ctx.catalog.length; }
  function dot(p) { return '<span class="td-dot" style="--cap:' + p.color + '" aria-hidden="true"></span>'; }
  function sample(text) { return '<p class="td-sample" role="note"><span>Sample state</span>' + text + "</p>"; }
  function dash(list, cls) { return '<ul class="td-dash ' + (cls || "") + '">' + list.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>"; }
  function stage(ctx, p, cls, eager) {
    return '<div class="td-stage ' + (cls || "") + '" style="' + (p ? ctx.capStyle(p) : "") + '"><span class="td-room" aria-hidden="true"><span class="td-sun"></span><span class="td-blinds"></span><span class="td-pool"></span></span><span class="td-object">' + (p ? ctx.image(p, "td-bottle", eager) : "") + '<span class="td-cast" aria-hidden="true"></span><span class="td-plinth" aria-hidden="true"></span></span>' + (p ? '<span class="td-side" aria-hidden="true">' + ctx.escape(ctx.shortName[p.id] || p.name) + "</span>" : "") + "</div>";
  }
  function facts(t, sub, rows, foot, cls) {
    return '<div class="td-facts ' + (cls || "") + '"><p class="td-facts-t">' + t + "</p>" + (sub ? '<p class="td-facts-s">' + sub + "</p>" : "") + '<dl class="td-facts-rows">' + rows.map(function (r) { return '<div class="' + (r[2] || "") + '"><dt>' + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; }).join("") + "</dl>" + (foot ? '<p class="td-facts-foot">' + foot + "</p>" : "") + "</div>";
  }
  function head(kicker, t, lede, side, cls) {
    return '<header class="td-head ' + (cls || "") + '"><div>' + k(kicker) + title(t, "h1", "td-h1") + "</div>" + (lede || side ? '<div class="td-head-side">' + (lede ? '<p class="td-lede">' + lede + "</p>" : "") + (side || "") + "</div>" : "") + "</header>";
  }
  function index(items) {
    return '<ol class="td-index">' + items.map(function (it, i) { return '<li><span class="td-n">' + (i < 9 ? "0" : "") + (i + 1) + "</span><div><h3>" + it[0] + "</h3><p>" + it[1] + "</p></div></li>"; }).join("") + "</ol>";
  }
  function piece(ctx, p) {
    var off = !p.stock || !p.published;
    return '<article class="td-piece"><a class="td-piece-media" href="/products/' + p.id + '">' + stage(ctx, p) + '</a><div class="td-wall"><p class="td-k">' + no(ctx, p) + " · " + ctx.escape(ctx.format[p.id]) + '</p><h3><a href="/products/' + p.id + '">' + ctx.escape(p.name) + "</a></h3><p>" + ctx.escape(p.subtitle) + '</p><div class="td-wall-foot"><p><strong>' + ctx.money(p.price) + '</strong> <small>Sample price</small></p><button type="button" class="td-add" data-add="' + p.id + '" aria-label="Add ' + ctx.escape(p.name) + ' to bag"' + (off ? " disabled" : "") + ">" + ctx.icon("plus") + "<span>" + (off ? "Unavailable" : "Add") + "</span></button></div></div></article>";
  }

  /* ---------- Chrome ---------- */
  function chrome(ctx, content) {
    var path = ctx.path;
    var cur = function (h) { return path === h || path.indexOf(h + "/") === 0 ? ' aria-current="page"' : ""; };
    return (
      '<header class="site-header td-header"><nav class="td-nav" aria-label="Main">' + [["/shop", "Collection"], ["/standards", "Standards"], ["/learn", "Learn"], ["/story", "Story"]].map(function (n) { return '<a href="' + n[0] + '"' + cur(n[0]) + ">" + n[1] + "</a>"; }).join("") + '</nav><a class="logo td-logo" href="/" aria-label="Body Café Co. home"><img src="/web/media/logo.svg" alt="" width="465" height="451"></a>' +
      '<div class="header-tools td-tools"><a class="td-toolink" href="/reports"' + cur("/reports") + '>Lot reports</a><button class="icon-button" data-action="search" aria-label="Search">' + ctx.icon("search") + '</button><a class="icon-button td-acc" href="/account" aria-label="Your account">' + ctx.icon("user") + '</a><a class="bag-link td-bag" href="/cart" aria-label="Bag, ' + ctx.count + ' items"><span class="td-bag-word">Bag</span><span data-cart-count' + (ctx.count ? "" : " data-empty") + ">" + ctx.count + '</span></a><button class="menu-button td-menu" data-action="menu" aria-expanded="false" aria-controls="mobile-nav"><span>Menu</span></button></div></header>' +
      '<nav id="mobile-nav" class="td-mnav" hidden aria-label="Mobile"><div class="mobile-nav-links">' + [["/shop", "The collection"], ["/bundles", "The edits"], ["/standards", "Standards"], ["/learn", "Learn"], ["/story", "Story"], ["/reports", "Lot reports"], ["/help", "Help"]].map(function (n, i) { return '<a href="' + n[0] + '"><span>0' + (i + 1) + "</span>" + n[1] + "</a>"; }).join("") + '</div><div class="mobile-nav-foot"><a href="/account">Account</a><a href="/settings">Preferences</a><a href="/cart">Bag (<span data-cart-count>' + ctx.count + "</span>)</a></div></nav>" +
      '<main id="main" tabindex="-1" class="td-main">' + content + "</main>" +
      '<footer class="site-footer td-footer"><div class="td-foot-grid"><div class="td-foot-intro"><img class="td-foot-logo" src="/web/media/logo-light.svg" alt="" width="465" height="451"><p class="td-title">Seven objects, each with its label in view and a record for its lot.</p>' + btn("/shop", "View the collection", "is-light") + '</div><div class="td-foot-cat"><p class="td-k">Catalogue</p><ol>' + ctx.catalog.map(function (p, i) { return '<li><a href="/products/' + p.id + '"><span>0' + (i + 1) + "</span>" + dot(p) + ctx.escape(p.name) + "</a></li>"; }).join("") + '</ol></div><div class="td-foot-cols"><div><p class="td-k">Visit</p><a href="/bundles">The edits</a><a href="/reports">Lot reports</a><a href="/search">Search</a><a href="/standards">Standards</a><a href="/learn">Learn</a><a href="/story">Story</a></div><div><p class="td-k">Help</p><a href="/help">Help centre</a><a href="/contact">Contact</a><a href="/account">Account</a><a href="/settings">Preferences</a></div><div><p class="td-k">Policies</p>' + S.policyOrder.map(function (k2) { return '<a href="/policies/' + k2 + '">' + S.policies[k2].title + "</a>"; }).join("") + '</div></div></div><div class="td-colophon"><span>© ' + new Date().getFullYear() + ' Body Café Co.</span><span>Draft copy · sample prices · preview commerce · design mockups</span><a href="/preview/states">Design states</a></div></footer>'
    );
  }

  /* ---------- Collection ---------- */
  function shop(ctx) {
    var c = S.copy.shop;
    var sel = ctx.query.get("format") || "all";
    var all = ctx.published;
    var list = all.filter(function (p) { return sel === "all" || ctx.format[p.id] === sel; });
    var tabs = '<nav class="td-tabs" aria-label="Filter by format">' + [["all", "All seven"], ["Capsules", "Capsules"], ["Softgels", "Softgels"], ["Chewable tablets", "Chewable tablets"]].map(function (f) {
      var n = f[0] === "all" ? all.length : all.filter(function (p) { return ctx.format[p.id] === f[0]; }).length;
      return '<a href="/shop' + (f[0] === "all" ? "" : "?format=" + encodeURIComponent(f[0])) + '"' + (f[0] === sel ? ' aria-current="page"' : "") + ">" + f[1] + "<span>" + n + "</span></a>";
    }).join("") + "</nav>";
    return '<div class="td-page td-shop">' + head("The collection · seven objects", "Seven everyday essentials, <em>each on its own plinth.</em>", c.lede) +
      '<div class="td-wrap"><div class="td-bar">' + tabs + '<p class="td-count" role="status">Showing ' + list.length + " of " + all.length + "</p></div>" +
      (list.length ? '<div class="td-gallery">' + list.map(function (p) { return piece(ctx, p); }).join("") + "</div>" : '<div class="td-nomatch">' + stage(ctx, null, "is-empty") + '<div><p class="td-k">Nothing on this plinth</p>' + title(c.noMatch[0], "h2", "td-h2") + '<p class="td-lede">' + c.noMatch[1] + "</p>" + btn("/shop", "Show all seven") + "</div></div>") +
      '<p class="td-care">' + c.care + "</p></div>" +
      '<section class="td-wrap td-guide" aria-labelledby="td-guide-t">' + k(c.guidanceTitle || "How to choose") + title("How to look at the collection.", "h2", "td-h2", "") + index(c.guidance) + "</section>" +
      '<section class="td-wrap td-compare" aria-labelledby="td-compare-t"><div class="td-split"><div>' + k("Side by side") + '<h2 class="td-title td-h2" id="td-compare-t">' + c.compareTitle + '</h2></div><p class="td-lede">' + c.compareNote + '</p></div><div class="td-tablewrap"><table class="td-table"><thead><tr><th scope="col">No.</th><th scope="col">Object</th><th scope="col">In view now</th><th scope="col">Format</th><th scope="col">Serving &amp; pack</th><th scope="col">Sample price</th></tr></thead><tbody>' + all.map(function (p, i) { return "<tr><td>0" + (i + 1) + '</td><th scope="row"><a href="/products/' + p.id + '">' + dot(p) + ctx.escape(p.name) + "</a></th><td>" + ctx.escape(p.ingredients) + "</td><td>" + ctx.escape(ctx.format[p.id]) + '</td><td><em class="td-pend">' + S.STATUS.label + "</em></td><td>" + ctx.money(p.price) + "</td></tr>"; }).join("") + "</tbody></table></div></section></div>";
  }

  /* ---------- Edits ---------- */
  function pair(ctx, items, eager) {
    return '<div class="td-stage is-pair"><span class="td-room" aria-hidden="true"><span class="td-sun"></span><span class="td-blinds"></span></span><span class="td-object is-pair">' + items.map(function (p) { return ctx.image(p, "td-bottle", eager); }).join("") + '<span class="td-cast" aria-hidden="true"></span><span class="td-plinth" aria-hidden="true"></span></span></div>';
  }
  function bundles(ctx, id) {
    var c = S.copy.bundles;
    var B = ctx.state.bundles;
    var b = B.find(function (x) { return x.id === id; });
    if (id && !b) return notFound(ctx);
    if (!b) {
      return '<div class="td-page">' + head("The edits · examples, not regimens", "Two objects, <em>shown together.</em>", c.lede, '<p class="td-flag">' + c.status + "</p>") +
        '<div class="td-wrap td-pairs">' + B.map(function (x, i) {
          var items = x.items.map(ctx.product).filter(Boolean);
          var sum = items.reduce(function (n, p) { return n + p.price; }, 0);
          return '<article class="td-pairpiece"><a href="/bundles/' + x.id + '" class="td-piece-media">' + pair(ctx, items) + '<span class="sr-only">' + ctx.escape(x.name) + '</span></a><div class="td-wall">' + k("Edit 0" + (i + 1) + " · two products") + '<h2 class="td-title td-h3"><a href="/bundles/' + x.id + '">' + ctx.escape(x.name) + "</a></h2><p>" + ctx.escape(x.description) + "</p>" + facts("Contents", "Sample prices, added together", items.map(function (p) { return [dot(p) + ctx.escape(p.name), ctx.money(p.price)]; }).concat([["Sample total", ctx.money(sum), "is-total"]])) + btn("/bundles/" + x.id, "View this edit") + "</div></article>";
        }).join("") + '</div><section class="td-wrap">' + k("How edits work") + title("Shown together, chosen separately.", "h2", "td-h2") + index(c.why) + "</section></div>";
    }
    var items = b.items.map(ctx.product).filter(Boolean);
    var sum = items.reduce(function (n, p) { return n + p.price; }, 0);
    return '<div class="td-page"><div class="td-wrap td-edit"><div>' + pair(ctx, items, true) + '<p class="td-cap">Design mockups, shown together for comparison. Not a suggested combination.</p></div><div class="td-edit-copy"><nav class="td-crumbs" aria-label="Breadcrumb"><a href="/bundles">The edits</a><span aria-hidden="true">/</span><span>' + ctx.escape(b.name) + "</span></nav>" + k("Example edit") + title(ctx.escape(b.name), "h1", "td-h1") + '<p class="td-lede">' + ctx.escape(b.description) + "</p>" + facts("Contents", "Two products · one-time purchase", items.map(function (p) { return [dot(p) + '<a href="/products/' + p.id + '">' + ctx.escape(p.name) + "</a> <small>" + ctx.escape(ctx.format[p.id]) + "</small>", ctx.money(p.price)]; }).concat([["Sample total · no discount", ctx.money(sum), "is-total"]]), c.status) + '<button class="td-btn is-full" data-bundle="' + b.id + '"><span>Add both to bag</span>' + ctx.icon("plus") + "</button></div></div></div>";
  }

  /* ---------- Search ---------- */
  function search(ctx) {
    var c = S.copy.search;
    var q = ctx.query.get("q") || "";
    var ql = q.toLowerCase().trim();
    var prods = ctx.catalog.filter(function (p) { return ql && (p.name + " " + p.ingredients + " " + ctx.format[p.id] + " " + p.subtitle).toLowerCase().indexOf(ql) >= 0; });
    var gs = S.guideMatches(q);
    var nt = ctx.catalog.filter(function (p) { return ql && S.notes[p.id] && (p.name + " " + S.notes[p.id].lead).toLowerCase().indexOf(ql) >= 0; });
    var total = prods.length + gs.length + nt.length;
    var report = /report|lot|test|proof|batch/i.test(q);
    return '<div class="td-page td-search"><header class="td-head is-search"><div>' + k("Search the catalogue") + title("What are you looking for?", "h1", "td-h1") + ctx.forms.search(q) + '<p class="td-hints">' + c.hints.map(function (h) { return '<a href="/search?q=' + encodeURIComponent(h) + '">' + h + "</a>"; }).join("") + "</p></div></header>" +
      '<div class="td-wrap">' + (q ? '<p class="td-count" role="status">' + total + " result" + (total === 1 ? "" : "s") + " for “" + ctx.escape(q) + "”</p>" : '<p class="td-lede">' + c.lede + "</p>") +
      (report ? '<div class="td-callout">' + k("Have the bottle in hand?") + "<p>Lot reports have their own lookup, by product and lot number.</p>" + tlink("/reports", "Find your lot report") + "</div>" : "") +
      (prods.length ? '<section class="td-results">' + k("Objects · " + prods.length) + '<div class="td-gallery is-small">' + prods.map(function (p) { return piece(ctx, p); }).join("") + "</div></section>" : "") +
      (gs.length || nt.length ? '<section class="td-results">' + k("Reading · " + (gs.length + nt.length)) + '<ol class="td-cat">' + gs.map(function (g) { return '<li><a href="' + g[0] + '"><span class="td-n">Guide</span><strong>' + g[1] + "</strong><small>" + g[2] + "</small></a></li>"; }).join("") + nt.map(function (p) { return '<li><a href="/learn/' + p.id + '"><span class="td-n">Note</span><strong>' + dot(p) + ctx.escape(p.name) + "</strong><small>" + S.notes[p.id].lead + "</small></a></li>"; }).join("") + "</ol></section>" : "") +
      (q && !total ? '<div class="td-nomatch">' + stage(ctx, null, "is-empty") + "<div>" + k("No match") + title("Nothing for “" + ctx.escape(q) + "”.", "h2", "td-h2") + '<p class="td-lede">' + c.noResults + "</p>" + btn("/shop", "View the collection") + "</div></div>" : "") +
      (!q ? '<section class="td-results">' + k("The collection") + '<div class="td-gallery is-small">' + ctx.published.map(function (p) { return piece(ctx, p); }).join("") + "</div></section>" : "") + "</div></div>";
  }

  /* ---------- Standards: a label document ---------- */
  function standards(ctx) {
    var c = S.copy.standards;
    return '<div class="td-page td-standards">' + head("Our standards · a working document", "The detail <em>behind the bottle.</em>", c.lede) +
      '<div class="td-wrap td-doc"><nav class="td-doc-nav" aria-label="On this page">' + k("Contents") + '<ol>' + c.pillars.map(function (p, i) { return '<li><a href="#' + p.id + '"><span>0' + (i + 1) + "</span>" + p.title + "</a></li>"; }).join("") + '<li><a href="#ledger"><span>06</span>Where it stands</a></li></ol></nav><div class="td-doc-body"><p class="td-intro">' + c.intro + "</p>" +
      c.pillars.map(function (p, i) {
        return '<section class="td-panel" id="' + p.id + '" aria-labelledby="' + p.id + '-t"><div class="td-panel-head"><span class="td-k">Section 0' + (i + 1) + '</span><h2 class="td-title td-h3" id="' + p.id + '-t">' + p.title + '</h2><p class="td-panel-sum">' + p.summary + '</p></div><div class="td-panel-body"><p>' + p.body + "</p>" + dash(p.points) + "</div>" + facts("Where it stands today", "", [["Status", p.now]], "", "is-inline") + "</section>";
      }).join("") +
      '<section class="td-ledger" id="ledger" aria-labelledby="ledger-t">' + k("Where it stands") + '<h2 class="td-title td-h2" id="ledger-t">Documented, planned, <em>and ruled out.</em></h2><div class="td-ledger-cols">' + [["Documented now", c.documented], ["Planned before launch", c.planned], ["What we won't do", c.wont]].map(function (col, i) { return '<div><p class="td-facts-t">' + col[0] + "</p>" + dash(col[1], ["", "is-plan", "is-no"][i]) + "</div>"; }).join("") + "</div></section></div></div>" +
      '<div class="td-wrap td-next">' + tlink("/reports", "Try a lot lookup") + tlink("/learn/understanding-reports", "What a lot report shows") + tlink("/learn/reading-a-label", "Read a label with confidence") + "</div></div>";
  }

  /* ---------- Story: brand essay ---------- */
  function story(ctx) {
    var c = S.copy.story;
    return '<div class="td-page td-story"><header class="td-essay-head">' + k("Our story · an essay in four parts") + title("Make room for <em>understanding.</em>", "h1", "td-h1 td-display") + '<p class="td-lede">' + c.lede + '</p></header><div class="td-shelf" aria-hidden="true"><div class="td-shelf-row">' + ctx.catalog.map(function (p) { return ctx.image(p, "td-bottle"); }).join("") + '</div><span class="td-shelf-board"></span></div><p class="td-cap td-wrap-narrow">The seven, on one shelf. Front-of-pack design mockups.</p>' +
      '<article class="td-essay"><p class="td-essay-open">' + c.opening + "</p>" + c.chapters.map(function (ch, i) { return '<section class="td-essay-sec"><p class="td-k">Part ' + ["one", "two", "three", "four"][i] + '</p><h2 class="td-title td-h3">' + ch.title + "</h2><p>" + ch.body + "</p></section>"; }).join("") + "</article>" +
      '<section class="td-wrap td-promises">' + k("What you can hold us to") + title("Four promises, <em>three refusals.</em>", "h2", "td-h2") + '<div class="td-prom-grid">' + facts("Promises", "", c.promises.map(function (p, i) { return ["0" + (i + 1) + " · " + p[0], p[1]]; }), "", "is-wide") + facts("Refusals", "", c.wont.map(function (w, i) { return ["0" + (i + 1), w]; }), "", "is-wide") + "</div></section>" +
      '<section class="td-wrap td-people"><div class="td-portrait">' + stage(ctx, null, "is-empty") + '<p class="td-cap">A plinth reserved for a founder portrait. No photograph has been supplied.</p></div><div>' + k("The people behind it") + title("In their own words, <em>when they're ready.</em>", "h2", "td-h2") + '<p class="td-lede">' + c.people + "</p>" + facts("Still to come", "", c.peopleNeeds.map(function (n, i) { return ["0" + (i + 1), n]; }), "", "is-wide") + "</div></section>" +
      '<div class="td-wrap td-next">' + tlink("/standards", "Our standards") + tlink("/shop", "The collection") + tlink("/learn", "Learn") + "</div></div>";
  }

  /* ---------- Learn: indexed ---------- */
  function learn(ctx, slug) {
    if (slug && S.guides[slug]) return guide(ctx, slug);
    if (slug && ctx.product(slug)) return note(ctx, ctx.product(slug));
    if (slug) return notFound(ctx);
    var c = S.copy.learn;
    return '<div class="td-page td-learn">' + head("Learn · an index", "Read the label, <em>then the lot.</em>", c.lede) +
      '<div class="td-wrap td-learn-grid"><nav class="td-doc-nav" aria-label="Topics">' + k("Topics") + "<ol>" + c.topics.map(function (t, i) { return '<li><a href="#' + t[0] + '"><span>' + String.fromCharCode(65 + i) + "</span>" + t[1] + "</a></li>"; }).join("") + '</ol></nav><div><p class="td-intro">' + c.intro + "</p>" +
      '<section aria-labelledby="guides-t">' + k("A · B · C — Guides") + '<h2 class="td-title td-h2" id="guides-t">Three guides.</h2><ol class="td-cat is-guides">' + S.guideOrder.map(function (s, i) { var g = S.guides[s]; return '<li id="' + g.topic + '"><a href="/learn/' + s + '"><span class="td-n">' + String.fromCharCode(65 + i) + '</span><strong class="td-title">' + g.title + "</strong><small>" + g.summary + '</small><span class="td-min">' + S.minutes(g) + " min</span></a></li>"; }).join("") + "</ol></section>" +
      '<section id="notes" aria-labelledby="notes-t">' + k("D — Ingredient notes") + '<h2 class="td-title td-h2" id="notes-t">One note for each object.</h2><div class="td-notes">' + ctx.catalog.map(function (p, i) { return '<a class="td-notecard" href="/learn/' + p.id + '">' + stage(ctx, p, "is-thumb") + '<span class="td-k">D' + (i + 1) + " · " + no(ctx, p) + "</span><strong>" + ctx.escape(p.name) + "</strong><small>" + S.noteSummary(p.id) + "</small></a>"; }).join("") + "</div></section>" +
      '<section aria-labelledby="gloss-t">' + k("Glossary") + '<h2 class="td-title td-h2" id="gloss-t">Terms, defined.</h2><dl class="td-gloss">' + c.glossary.map(function (g) { return "<div><dt>" + g[0] + "</dt><dd>" + g[1] + "</dd></div>"; }).join("") + "</dl></section></div></div>" +
      '<div class="td-wrap td-next">' + tlink("/help", "Help centre") + tlink("/contact", "Ask a person") + "</div></div>";
  }
  function guide(ctx, slug) {
    var g = S.guides[slug];
    var i = S.guideOrder.indexOf(slug);
    return '<article class="td-page td-article"><header class="td-essay-head"><nav class="td-crumbs" aria-label="Breadcrumb"><a href="/learn">Learn</a><span aria-hidden="true">/</span><span>Guide ' + String.fromCharCode(65 + i) + "</span></nav>" + k("Guide " + String.fromCharCode(65 + i) + " · " + S.minutes(g) + " min read") + title(g.title, "h1", "td-h1 td-display") + '<p class="td-lede">' + g.summary + "</p></header>" +
      '<div class="td-wrap td-art"><aside class="td-art-side"><nav class="td-doc-nav" aria-label="In this guide">' + k("In this guide") + "<ol>" + g.sections.map(function (s, j) { return '<li><a href="#' + s.id + '"><span>0' + (j + 1) + "</span>" + s.h + "</a></li>"; }).join("") + '<li><a href="#checklist"><span>✓</span>Checklist</a></li></ol></nav></aside><div class="td-art-body">' + facts("The short version", "", g.takeaways.map(function (t, j) { return ["0" + (j + 1), t]; }), "", "is-inline") + '<p class="td-essay-open">' + g.opening + "</p>" +
      g.sections.map(function (s, j) { return '<section id="' + s.id + '" class="td-art-sec"><p class="td-k">0' + (j + 1) + '</p><h2 class="td-title td-h3">' + s.h + "</h2>" + s.html + "</section>"; }).join("") +
      facts(g.example.title, "Illustrative · " + g.example.note, g.example.rows, g.example.reading, "is-example") +
      '<section id="checklist" class="td-art-sec"><p class="td-k">✓</p><h2 class="td-title td-h3">Checklist</h2>' + dash(g.checklist, "is-check") + "</section>" +
      (g.sources.length ? '<section class="td-sources"><p class="td-k">Sources</p>' + S.sourceList(g.sources) + "</section>" : '<p class="td-small">This guide explains reports in general. It describes no specific laboratory, report or result.</p>') +
      '<p class="td-small">General information, not personal advice. No author or reviewer is credited until the guide has been reviewed.</p></div></div><div class="td-wrap td-next">' + g.related.map(function (r) { return tlink("/learn/" + r, S.guides[r].title); }).join("") + tlink("/reports", "Find your lot report") + tlink("/shop", "The collection") + "</div></article>";
  }
  function note(ctx, p) {
    var n = S.notes[p.id] || { lead: "", check: [], compound: "", sources: [] };
    var confirm = ((window.BCCProductPage && window.BCCProductPage.toConfirm && window.BCCProductPage.toConfirm[p.id]) || []).concat(["Complete ingredient list, allergens, storage and manufacturer details"]);
    return '<article class="td-page td-note"><div class="td-wrap td-note-head"><div>' + stage(ctx, p, "is-large", true) + '<p class="td-cap">Design mockup. Printed wording is a draft, not the approved label.</p></div><div><nav class="td-crumbs" aria-label="Breadcrumb"><a href="/learn#notes">Ingredient notes</a><span aria-hidden="true">/</span><span>' + ctx.escape(p.name) + "</span></nav>" + k("Ingredient note · " + no(ctx, p)) + title(ctx.escape(p.name), "h1", "td-h1") + '<p class="td-lede">' + n.lead + "</p>" + facts("In view now", "From the published product record", [["Ingredient", ctx.escape(p.ingredients)], ["Format", ctx.escape(ctx.format[p.id])], ["Amounts per serving", "<em>Awaiting approved label</em>"]], "") + "</div></div>" +
      '<div class="td-wrap td-note-body"><section>' + k("What to check on this label") + title("Read it in this order.", "h2", "td-h2") + index(n.check) + (n.compound ? '<div class="td-callout">' + k("A note on forms") + "<p>" + n.compound + "</p></div>" : "") + "</section><aside>" + facts("Waiting on our approved label", "These details come from the approved rear label", confirm.map(function (x, i) { return ["0" + (i + 1), x]; }), S.CARE_NOTE, "is-wide") + "</aside></div>" +
      (n.sources.length ? '<div class="td-wrap"><section class="td-sources"><p class="td-k">Sources</p>' + S.sourceList(n.sources) + "</section></div>" : "") +
      '<div class="td-wrap td-next">' + tlink("/products/" + p.id, "View " + ctx.escape(p.name)) + tlink("/reports?product=" + p.id, "Look up a lot") + tlink("/learn/ingredient-forms", "Why ingredient forms matter") + '</div><nav class="td-wrap td-others" aria-label="Other ingredient notes">' + k("Other notes") + "<ol>" + ctx.catalog.filter(function (o) { return o.id !== p.id; }).map(function (o) { return '<li><a href="/learn/' + o.id + '">' + dot(o) + ctx.escape(o.name) + "</a></li>"; }).join("") + "</ol></nav></article>";
  }

  /* ---------- Reports: the bottle, turned over ---------- */
  function reports(ctx) {
    var c = S.copy.reports;
    var pid = ctx.product(ctx.query.get("product")) ? ctx.query.get("product") : "vitamin-d3-k2";
    var cur = ctx.product(pid);
    return '<div class="td-page td-reports report-page" style="' + (cur ? ctx.capStyle(cur) : "") + '"><section class="td-roast"><div class="td-roast-in"><div>' + k("Lot reports · the bottle, turned over") + title("Your lot, <em>looked at closely.</em>", "h1", "td-h1") + '<p class="td-lede">' + c.what + '</p><ol class="td-steps">' + c.steps.map(function (s, i) { return '<li><span class="td-n">0' + (i + 1) + "</span><strong>" + s[0] + "</strong><span>" + s[1] + "</span></li>"; }).join("") + '</ol><p class="td-small">' + c.locationStatus + '</p></div><div class="td-rep-card"><p class="td-facts-t">Find a lot record</p><p class="td-facts-s">01 · Choose the product</p>' + ctx.forms.productPicker(pid) + '<p class="td-facts-s">02 · Enter the lot number</p>' + ctx.forms.reportForm(pid, ctx.query.get("lot")) + '<p class="td-small">' + c.demo + "</p></div></div></section>" +
      '<div class="td-wrap td-anatomy"><div>' + k("Anatomy of a record") + title("What a report <em>should show.</em>", "h2", "td-h2") + "</div>" + facts("A lot record", "In the order you'll read it", c.hierarchy.map(function (h, i) { return ["0" + (i + 1) + " · " + h[0], h[1]]; }), "", "is-wide") + facts("Its limits", "", c.limits.map(function (l, i) { return ["0" + (i + 1), l]; }), "", "is-wide") + "</div>" +
      '<div class="td-wrap td-next">' + tlink("/learn/understanding-reports", "What a lot report shows") + tlink("/standards#lot", "How packs link to lots") + tlink("/contact", "Ask about a lot") + "</div></div>";
  }

  /* ---------- Bag ---------- */
  function cart(ctx) {
    var c = S.copy.cart;
    var items = ctx.state.cart.map(function (i) { return { p: ctx.product(i.id), q: i.quantity }; }).filter(function (x) { return x.p; });
    if (!items.length) return '<div class="td-page td-bagpage"><div class="td-wrap td-nomatch">' + stage(ctx, null, "is-empty") + "<div>" + k("Your bag") + title(c.empty[0] + ".", "h1", "td-h1") + '<p class="td-lede">' + c.empty[1] + '</p><div class="td-actions">' + btn("/shop", "View the collection") + tlink("/bundles", "The edits") + "</div></div></div></div>";
    return '<div class="td-page td-bagpage">' + head("Your bag · " + ctx.count + " item" + (ctx.count === 1 ? "" : "s"), "Your selection.", c.note) +
      '<div class="td-wrap td-bag-grid"><ol class="td-lines">' + items.map(function (x) {
        var p = x.p;
        return '<li class="td-line"><a class="td-line-media" href="/products/' + p.id + '">' + stage(ctx, p, "is-thumb") + '<span class="sr-only">' + ctx.escape(p.name) + '</span></a><div class="td-line-info"><p class="td-k">' + no(ctx, p) + " · " + ctx.escape(ctx.format[p.id]) + '</p><h2><a href="/products/' + p.id + '">' + ctx.escape(p.name) + "</a></h2><p>" + ctx.money(p.price) + ' each · sample price</p><div class="td-qty quantity-control"><button data-quantity="' + p.id + '" data-change="-1" aria-label="Decrease ' + ctx.escape(p.name) + ' quantity">−</button><span aria-label="Quantity">' + x.q + '</span><button data-quantity="' + p.id + '" data-change="1" aria-label="Increase ' + ctx.escape(p.name) + ' quantity">+</button></div><button class="td-remove remove" data-remove="' + p.id + '">Remove</button></div><strong class="td-line-total">' + ctx.money(p.price * x.q) + "</strong></li>";
      }).join("") + '</ol><aside class="td-sum">' + facts("Summary", "One-time purchase · sample prices", items.map(function (x) { return [ctx.escape(x.p.name) + " × " + x.q, ctx.money(x.p.price * x.q)]; }).concat([["Delivery", "At checkout"], ["Sample subtotal", ctx.money(ctx.total), "is-total"]]), "No money is collected in the preview.") + btn("/checkout", "Continue to checkout", "is-full") + '</aside></div><div class="td-wrap td-next">' + c.next.map(function (n) { return tlink(n[0], n[1]); }).join("") + tlink("/shop", "Keep browsing") + "</div></div>";
  }

  /* ---------- Checkout ---------- */
  function checkout(ctx, fx) {
    var c = S.copy.checkout;
    if (fx === "unavailable" || (!fx && ctx.staticPreview)) return unavailable(ctx, "/checkout");
    var sm = fx === "sample" || fx === "errors";
    var items = sm ? [{ id: "vitamin-d3-k2", quantity: 1 }, { id: "omega-3-fish-oil", quantity: 2 }] : ctx.state.cart;
    if (!items.length) return '<div class="td-page"><div class="td-wrap td-nomatch">' + stage(ctx, null, "is-empty") + "<div>" + k("Checkout") + title("Your bag is empty.", "h1", "td-h1") + '<p class="td-lede">Add a product before checking out.</p>' + btn("/shop", "View the collection") + "</div></div></div>";
    var err = fx === "errors" ? { name: "Add the name for the delivery.", mobile: "Use a 10-digit mobile starting with 6, 7, 8 or 9.", pincode: "Use a 6-digit pincode that doesn't start with 0.", adult: "Please confirm the purchaser is 18 or older.", form: "A few details need fixing before we can create the order." } : null;
    var vals = fx === "sample" ? S.fixtures.contact : fx === "errors" ? { address: S.fixtures.contact.address, city: "Bengaluru", state: "Karnataka", mobile: "12345", pincode: "012345" } : { mobile: (ctx.user && ctx.user.mobile) || "" };
    var s = ctx.forms.summary(items, sm);
    return '<div class="td-page td-checkout">' + (sm ? sample("Synthetic details for reviewing the design. Every field is disabled; nothing is submitted or saved.") : "") + head("Checkout · as a guest", "Checkout.", c.lede) +
      '<div class="td-wrap td-co-grid"><form id="checkout-form" class="td-co-form checkout-form">' + c.steps.map(function (st, i) {
        var body = i === 0 ? ctx.forms.delivery(vals, sm, err) : i === 1 ? ctx.forms.payment(sm) : ctx.forms.confirm(sm, err) + '<p class="td-small">' + c.privacy + "</p>";
        return '<section class="td-co-step"><div class="td-co-label"><span class="td-k">Step 0' + (i + 1) + " of 03</span><h2 class=\"td-title td-h3\">" + st + "</h2></div><div>" + body + "</div></section>";
      }).join("") + "</form>" +
      '<aside class="td-sum order-summary checkout-summary"><div class="td-facts"><p class="td-facts-t">Order summary</p><p class="td-facts-s">' + s.count + " items · sample prices</p>" + s.lines + s.discount + s.totals + '<p class="td-facts-foot">Sample pricing only; no final GST calculation is shown.</p></div><div class="td-after">' + k("Then what?") + index(c.after) + "</div></aside></div></div>";
  }

  /* ---------- Payment ---------- */
  function view(o, fx) { if (fx) return fx; if (!o) return "missing"; if (o.state === "paid") return "paid"; if (o.state === "pending") return o.expires < Date.now() / 1000 ? "expired" : "pending"; return "inactive"; }
  function payment(ctx, o, fx) {
    var v = view(o, fx);
    if (v === "missing") return notFound(ctx);
    var sm = !!fx;
    var t = { pending: ["Payment pending", "Ready when <em>you are.</em>", "Try a success or a failure. Your items are held for 15 minutes."], failed: ["Payment failed", "That didn't <em>go through.</em>", "No money moved. Your items are still held, so you can try again."], paid: ["Payment received", "Thank you. <em>It's confirmed.</em>", "No money moved. Your preview order is confirmed."], expired: ["Hold expired", "The hold <em>has ended.</em>", "The 15-minute hold is over. Start a new checkout to check availability again."], unavailable: ["Service unavailable", "Payments are <em>unavailable.</em>", "The payment service didn't respond. Nothing was charged; try again shortly."], inactive: ["No payment step", "Nothing to <em>pay here.</em>", "This order no longer has an active payment step."] }[v];
    var act = v === "pending" || v === "failed"
      ? '<button class="td-btn is-full" data-pay="success" data-id="' + o.id + '"' + (sm ? " disabled" : "") + '><span>Simulate successful payment</span></button><button class="td-btn is-ghost is-full" data-pay="failure" data-id="' + o.id + '"' + (sm ? " disabled" : "") + '><span>Simulate failed payment</span></button>' + (sm ? "" : '<p class="reservation-time" data-expires="' + o.expires + '"></p>') + '<p id="payment-result" role="status">' + (v === "failed" ? "Preview payment failed. You can try again." : "") + "</p>"
      : v === "expired" ? btn("/cart", "Back to your bag") : v === "unavailable" ? '<button class="td-btn" disabled><span>Try again</span></button>' + tlink("/cart", "Back to your bag") : btn("/orders/" + o.id, "View your order");
    return '<div class="td-page td-pay is-' + v + '">' + (sm ? sample("Synthetic order SAMPLE-1042. No payment, order or record exists.") : "") + '<div class="td-wrap td-pay-grid"><div>' + k("Payment · " + ctx.escape(o.id)) + '<p class="td-status"><span aria-hidden="true"></span>' + t[0] + "</p>" + title(t[1], "h1", "td-h1") + '<p class="td-lede">' + t[2] + '</p><div class="td-pay-act">' + act + "</div></div>" + facts("Order record", ctx.escape(o.id) + " · sample", o.items.map(function (i) { return [ctx.escape(i.name) + " × " + i.quantity, ctx.money(i.unit_price * i.quantity)]; }).concat([["Sample discount", "−" + ctx.money(o.discount)], ["Sample shipping", ctx.money(o.shipping)], ["Total", ctx.money(o.total), "is-total"]]), "Real payments need Razorpay credentials, signature verification, webhook reconciliation and settlement testing. None is connected.") + "</div></div>";
  }

  /* ---------- Order ---------- */
  function order(ctx, o, fx) {
    if (!o) return '<div class="td-page"><div class="td-wrap td-nomatch">' + stage(ctx, null, "is-empty") + "<div>" + k("Order") + title("Order not found.", "h1", "td-h1") + '<p class="td-lede">Sign in to the customer session that owns this order.</p>' + btn("/account", "Your account") + "</div></div></div>";
    var sm = !!fx, st = o.state;
    var t = { pending: "Waiting for <em>payment.</em>", paid: "Your order is <em>in.</em>", shipped: "On its <em>way.</em>", delivered: "Delivered.", cancelled: "Order <em>cancelled.</em>", expired: "Order <em>expired.</em>" }[st] || "Your order.";
    var steps = [["pending", "Created"], ["paid", "Paid"], ["shipped", "Shipped"], ["delivered", "Delivered"]];
    var customer = sm || (ctx.user && ctx.user.role === "customer");
    var canCancel = customer && ["pending", "paid"].indexOf(st) >= 0;
    var reviewed = (ctx.account && ctx.account.reviews) || [];
    var ri = o.items.filter(function (i) { return !reviewed.some(function (r) { return r.order_id === o.id && r.product === i.id; }); });
    var review = customer && st === "delivered" ? (ri.length ? '<section class="td-callout td-review">' + k("Verified delivery · moderated") + '<h2 class="td-title td-h3">How was it?</h2><p>Only delivered orders can be reviewed, and every review is moderated first.</p>' + ctx.forms.reviewForm(o, ri, sm) + "</section>" : '<div class="td-callout">' + k("Review submitted") + "<p>Your review is awaiting moderation.</p></div>") : "";
    return '<div class="td-page td-order">' + (sm ? sample("Synthetic order with a fictional address. Nothing was ordered or shipped.") : "") + head("Order " + ctx.escape(o.id) + " · " + ctx.date(o.created), t, "Preview transaction only. Nothing was charged or shipped.") +
      '<div class="td-wrap"><ol class="td-timeline">' + steps.map(function (s, i) { var h = (o.history || []).find(function (x) { return x.state === s[0]; }); return '<li class="' + (h ? "is-done" : "") + '"><span class="td-n">0' + (i + 1) + "</span><strong>" + s[1] + "</strong><small>" + (h ? ctx.date(h.at) : "Not yet") + "</small></li>"; }).join("") + "</ol></div>" +
      '<div class="td-wrap td-bag-grid"><div>' + (o.provider ? '<div class="td-callout">' + k("Tracking") + "<p>" + ctx.escape(o.provider) + " · " + ctx.escape(o.tracking) + ". Simulated; no shipment was booked.</p></div>" : "") + (o.refund && o.refund !== "none" ? '<div class="td-callout is-warn">' + k("Refund " + ctx.escape(o.refund.replace(/_/g, " "))) + "<p>A refund needs a second person's approval and moves no money in the preview.</p></div>" : "") +
      '<ol class="td-lines">' + o.items.map(function (i) { var p = ctx.product(i.id); return '<li class="td-line"><a class="td-line-media" href="/products/' + i.id + '">' + stage(ctx, p, "is-thumb") + '<span class="sr-only">' + ctx.escape(i.name) + '</span></a><div class="td-line-info"><p class="td-k">' + (p ? no(ctx, p) : "") + '</p><h2><a href="/products/' + i.id + '">' + ctx.escape(i.name) + "</a></h2><p>Quantity " + i.quantity + '</p></div><strong class="td-line-total">' + ctx.money(i.quantity * i.unit_price) + "</strong></li>"; }).join("") + "</ol>" +
      '<div class="td-actions">' + (st === "pending" ? btn("/payment/" + o.id + (sm ? "?state=pending" : ""), "Continue payment") : "") + (canCancel ? '<button class="td-btn is-ghost" data-cancel="' + o.id + '"' + (sm ? " disabled" : "") + "><span>Cancel order</span></button>" : "") + '<button class="td-btn is-ghost" data-reorder="' + o.id + '"' + (sm ? " disabled" : "") + "><span>Reorder</span></button>" + tlink("/contact?order=" + o.id, "Get help with this order") + "</div>" + review + "</div>" +
      '<aside class="td-sum">' + facts("Summary", "Sample prices", [["Subtotal", ctx.money(o.subtotal)], ["Discount", "−" + ctx.money(o.discount)], ["Delivery", ctx.money(o.shipping)], ["Total", ctx.money(o.total), "is-total"]], "Policy snapshot: " + ctx.escape(o.policy_version)) + '<div class="td-callout">' + k("Delivering to") + "<address>" + ctx.escape(o.contact.name) + "<br>" + ctx.escape(o.contact.address) + "<br>" + ctx.escape(o.contact.city) + ", " + ctx.escape(o.contact.state) + " " + ctx.escape(o.contact.pincode) + "</address></div></aside></div></div>";
  }

  /* ---------- Account ---------- */
  function account(ctx, tab, fx) {
    var c = S.copy.account;
    var a = ctx.account || { orders: [], addresses: [], cases: [] };
    var sm = !!fx;
    var guest = fx ? fx === "signed-out" || fx === "code" : !ctx.user || ctx.user.id.indexOf("guest-") === 0;
    if (fx) a = { orders: fx === "orders" ? [S.fixtures.order("delivered", ctx.catalog), Object.assign(S.fixtures.order("paid", ctx.catalog), { id: "SAMPLE-1037" })] : [], addresses: fx === "sample" ? S.fixtures.addresses() : [], cases: fx === "sample" ? S.fixtures.cases : [] };
    var tabs = '<nav class="td-tabs" aria-label="Account sections">' + [["orders", "Orders", "/account"], ["addresses", "Addresses", "/account/addresses"], ["cases", "Support cases", "/account/cases"], ["preferences", "Preferences", "/settings"]].map(function (x) { return '<a href="' + x[2] + (sm ? "?state=" + (x[0] === "orders" ? "orders" : "sample") : "") + '"' + (x[0] === tab ? ' aria-current="page"' : "") + ">" + x[1] + "</a>"; }).join("") + (guest ? "" : '<button class="td-signout" data-action="logout"' + (sm ? " disabled" : "") + ">Sign out</button>") + "</nav>";
    var login = guest ? '<section class="td-wrap td-login"><div>' + k("Sign in") + title("Your orders, <em>kept together.</em>", "h2", "td-h2") + '<p class="td-lede">' + c.signIn + '</p></div><div class="td-callout">' + (fx === "code" ? ctx.forms.codeEntry("482913") : ctx.forms.otp(sm)) + "</div></section>" : "";
    var body;
    if (tab === "addresses") body = '<div class="td-acc-grid"><div>' + k("Saved addresses") + (a.addresses.length ? a.addresses.map(function (v, i) { return '<address class="td-addr"><span class="td-k">Address 0' + (i + 1) + "</span><strong>" + ctx.escape(v.name) + "</strong><br>" + ctx.escape(v.address) + "<br>" + ctx.escape(v.city) + ", " + ctx.escape(v.state) + " " + ctx.escape(v.pincode) + "</address>"; }).join("") : '<p class="td-lede">No saved addresses yet. Add one and it\'ll be ready at checkout.</p>') + '</div><section class="td-callout">' + k("Add an address") + ctx.forms.address(sm) + "</section></div>";
    else if (tab === "cases") body = '<div class="td-row-head">' + k("Support cases") + tlink("/contact", "Open a new case") + "</div>" + (a.cases.length ? '<ol class="td-cat">' + a.cases.map(function (kk) { return '<li><div class="td-cat-row"><span class="td-n">' + ctx.escape(kk.state) + "</span><strong>" + ctx.escape(kk.id) + " · " + ctx.escape(kk.kind) + "</strong><small>" + ctx.escape(kk.message) + "<br>" + ctx.escape(kk.owner) + " · " + ctx.escape(kk.sla) + (kk.order_id ? ' · <a href="/orders/' + kk.order_id + (sm ? "?state=paid" : "") + '">' + kk.order_id + "</a>" : "") + "</small></div></li>"; }).join("") + "</ol>" : '<p class="td-lede">No open cases. Cases and their updates will show up here.</p>' + tlink("/contact", "Contact support"));
    else body = k("Your orders") + (a.orders.length ? '<ol class="td-cat">' + a.orders.map(function (o) { return '<li><a href="/orders/' + o.id + (sm ? "?state=" + o.state : "") + '"><span class="td-n">' + ctx.escape(o.state) + "</span><strong>" + ctx.escape(o.id) + "</strong><small>" + ctx.date(o.created) + " · " + o.items.reduce(function (n, x) { return n + x.quantity; }, 0) + " items · " + ctx.money(o.total) + " sample</small></a></li>"; }).join("") + "</ol>" : '<p class="td-lede">No orders yet. Orders you place in this session will show up here.</p>' + btn("/shop", "View the collection"));
    return '<div class="td-page td-account">' + (sm ? sample("Synthetic account data. No sign-in, address or case exists.") : "") + head("Your account", guest ? "Your account." : "Welcome <em>back.</em>", guest ? c.lede : "Signed in with mobile ending " + ctx.escape(sm ? "0000" : ctx.user.mobile.slice(-4)) + ".") + login + '<div class="td-wrap">' + tabs + body + "</div></div>";
  }

  /* ---------- Help & contact ---------- */
  function help(ctx) {
    var c = S.copy.help;
    return '<div class="td-page td-help">' + head("Help centre", "How can <em>we help?</em>", c.lede) +
      '<div class="td-wrap"><ol class="td-cat is-topics">' + c.topics.map(function (t, i) { return '<li id="' + t[0] + '"' + (t[0] === "safety" ? ' class="is-safety"' : "") + '><a href="' + t[3] + '"><span class="td-n">0' + (i + 1) + '</span><strong class="td-title">' + t[1] + "</strong><small>" + t[2] + '</small><span class="td-min">' + t[4] + " →</span></a></li>"; }).join("") + "</ol>" +
      '<div class="td-faqs">' + c.topics.filter(function (t) { return c.faqs.some(function (f) { return f[0] === t[0]; }); }).map(function (t) { return '<section class="td-faq">' + k(t[1]) + c.faqs.filter(function (f) { return f[0] === t[0]; }).map(function (f) { return "<details><summary><span>" + f[1] + '</span><span class="td-plus" aria-hidden="true"></span></summary><p>' + f[2] + "</p></details>"; }).join("") + "</section>"; }).join("") + "</div></div>" +
      '<section class="td-roast"><div class="td-roast-in is-cta"><div>' + k("Still need a hand?") + title("Open a case. <em>Keep one record.</em>", "h2", "td-h2") + '<p class="td-lede">' + S.copy.contact.lede + '</p></div><div class="td-actions">' + btn("/contact", "Contact support", "is-light") + tlink("/contact?kind=safety", "Report a product safety issue") + "</div></div></section></div>";
  }
  function contact(ctx, fx) {
    var c = S.copy.contact;
    if (fx === "unavailable" || (!fx && ctx.staticPreview)) return unavailable(ctx, "/contact");
    var sm = !!fx;
    var right = fx === "submitted" ? '<div class="report-result case-created td-created" role="status">' + k("Case created · sample") + '<p class="td-title td-h2">SAMPLE-CASE-01</p><p>This is how a confirmation looks. In this design state, nothing was saved or sent.</p>' + tlink("/account/cases?state=sample", "Follow your case") + "</div>" : ctx.forms.caseForm(ctx.query.get("order") || "", ctx.query.get("kind") || "general", sm, fx === "errors" ? { message: "Tell us a little more: at least 10 characters." } : null);
    return '<div class="td-page td-contact">' + (sm ? sample("Visual state only. Nothing is sent or saved.") : "") + head("Contact", "Talk to <em>a person.</em>", c.lede) +
      '<div class="td-wrap td-co-grid"><div>' + facts("Ways to reach us", "Contact details are being confirmed", c.channels.map(function (ch) { return [ch[0], ch[1]]; }), "", "is-wide") + '<div class="td-callout is-warn">' + k("Product issue?") + "<p>" + c.safety + '</p></div><p class="td-small">' + c.privacy + '</p></div><section class="td-callout is-form">' + right + "</section></div></div>";
  }

  /* ---------- Policies ---------- */
  function policy(ctx, kind) {
    var p = S.policies[kind];
    if (!p) return notFound(ctx);
    return '<div class="td-page td-policy">' + head("Policy · working draft, not final terms", p.title + ".", p.plain) + '<div class="td-wrap td-doc"><nav class="td-doc-nav" aria-label="Policies">' + k("Policies") + "<ol>" + S.policyOrder.map(function (k2, i) { return '<li><a href="/policies/' + k2 + '"' + (k2 === kind ? ' aria-current="page"' : "") + "><span>0" + (i + 1) + "</span>" + S.policies[k2].title + "</a></li>"; }).join("") + '</ol></nav><div class="td-doc-body">' + p.sections.map(function (s, i) { var cls = { "working direction": "is-plan", unresolved: "is-warn", "preview behaviour": "is-done" }[s[2].toLowerCase()] || ""; return '<section class="td-pol-sec"><div class="td-pol-head"><span class="td-k">§ ' + (i + 1) + '</span><span class="td-status ' + cls + '"><span aria-hidden="true"></span>' + s[2] + '</span></div><h2 class="td-title td-h3">' + s[0] + "</h2><p>" + s[1] + "</p></section>"; }).join("") + '<p class="td-small">These are working drafts for review, not final terms for a live store. Anything marked unresolved hasn\'t been decided.</p><div class="td-next">' + tlink("/help", "Help centre") + tlink("/contact", "Ask a question") + "</div></div></div></div>";
  }
  function settings(ctx) {
    var c = S.copy.settings;
    return '<div class="td-page td-settings">' + head("Preferences", "Your choices.", c.lede) + '<div class="td-wrap td-narrow"><section class="td-callout is-form">' + ctx.forms.preferences(c.groups) + '</section><p class="td-small">Read the <a href="/policies/privacy">privacy draft</a> for what the preview stores.</p></div></div>';
  }
  function notFound(ctx) {
    var c = S.copy.notFound;
    return '<div class="td-page"><div class="td-wrap td-nomatch is-404">' + stage(ctx, null, "is-empty") + "<div>" + k("Error 404 · an empty plinth") + title(c[0] + ".", "h1", "td-h1") + '<p class="td-lede">' + c[1] + '</p><div class="td-actions">' + btn("/shop", "View the collection") + tlink("/learn", "Learn") + tlink("/help", "Help centre") + "</div></div></div></div>";
  }
  function unavailable(ctx, path) {
    var map = { checkout: "Checkout", payment: "Payment", orders: "Order", account: "Account", contact: "Contact" };
    var st = (S.states.find(function (s) { return s[0] === map[path.split("/")[1]]; }) || [0, []])[1];
    return '<div class="td-page"><div class="td-wrap td-nomatch">' + stage(ctx, null, "is-empty") + "<div>" + k("Shared design preview") + '<h1 class="td-title td-h1">Not available <em>in this preview.</em></h1><p class="td-lede">You can browse all four designs, look at every product and try the sample bag and lot lookup. Ordering, sign-in and support submissions aren\'t enabled on this shared preview, and nothing you type is collected.</p></div></div><div class="td-wrap">' + k("Designed states instead") + '<ol class="td-cat">' + st.map(function (s) { return '<li><a href="' + s[0] + '"><span class="td-n">Fixture</span><strong>' + s[1] + "</strong><small>Synthetic; nothing is saved</small></a></li>"; }).join("") + '</ol><div class="td-next">' + btn("/shop", "Continue browsing") + tlink("/preview/states", "All design states") + "</div></div></div>";
  }
  function states(ctx) {
    return '<div class="td-page">' + head("Design states", "Every state, <em>catalogued.</em>", "Synthetic fixtures for reviewing transactional and edge states. None creates an order, payment, message or account record.") + '<div class="td-wrap">' + S.states.map(function (g) { return '<section class="td-faq">' + k(g[0]) + '<ol class="td-cat">' + g[1].map(function (s) { return '<li><a href="' + s[0] + '"><span class="td-n">State</span><strong>' + s[1] + "</strong><small>" + s[0] + "</small></a></li>"; }).join("") + "</ol></section>"; }).join("") + "</div></div>";
  }
  function learnOffline(ctx) { return '<div class="td-page"><div class="td-wrap td-nomatch">' + stage(ctx, null, "is-empty") + "<div>" + k("Learn") + title("Learn is offline.", "h1", "td-h1") + '<p class="td-lede">The ingredient library isn\'t published right now.</p>' + btn("/shop", "View the collection") + "</div></div></div>"; }

  /* D keeps its Still life homepage (direction-d.js); everything else is designed here. */
  S.themes.d = { chrome: chrome, shop: shop, bundles: bundles, search: search, standards: standards, story: story, learn: learn, reports: reports, cart: cart, checkout: checkout, payment: payment, order: order, account: account, help: help, contact: contact, policy: policy, settings: settings, notFound: notFound, unavailable: unavailable, states: states, learnOffline: learnOffline };
})();
