/* Body Café Co. — Direction C, Pick a cap: the complete site.
   Grammar: the cap seen from above is the navigation and the key; LEMON MILK uppercase display on cool Pantone 656 paper;
   café menu boards with dotted leaders; cut-out bottles on cap-tinted tiles; full-bleed cap-colour bands with oversized
   watermark type; order tickets for the bag, checkout and payment. Content comes from BCCSite; behaviour from app.js. */
(function () {
  "use strict";
  var S = window.BCCSite;
  var INK = { color: "#2d2926" };

  function disp(text, tag, cls) { tag = tag || "h2"; return "<" + tag + ' class="tc-d ' + (cls || "") + '">' + text + "</" + tag + ">"; }
  function kick(text, cls) { return '<p class="tc-kick ' + (cls || "") + '"><span class="tc-dot" aria-hidden="true"></span>' + text + "</p>"; }
  function btn(href, label, cls) { return '<a class="tc-btn ' + (cls || "") + '" href="' + href + '"><span>' + label + '</span><span aria-hidden="true">→</span></a>'; }
  function tlink(href, label) { return '<a class="tc-link" href="' + href + '">' + label + ' <span aria-hidden="true">↗</span></a>'; }
  function capOf(ctx, p, size) { return '<span class="cap" style="--cap:' + p.color + ";--size:" + (size || 44) + 'px" aria-hidden="true"></span>'; }
  function inkCap(size) { return '<span class="cap" style="--cap:' + INK.color + ";--size:" + (size || 44) + 'px" aria-hidden="true"></span>'; }
  function row(label, value, extra) { return '<div class="tc-row"><span class="tc-row-l">' + label + '</span><span class="tc-leader" aria-hidden="true"></span><span class="tc-row-v">' + value + "</span>" + (extra || "") + "</div>"; }
  function sample(text) { return '<p class="tc-sample" role="note"><strong>Sample state</strong> ' + text + "</p>"; }
  function bullets(list, cls) { return '<ul class="tc-bul ' + (cls || "") + '">' + list.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>"; }
  function head(ctx, kicker, title, lede, side, cls) {
    return '<header class="tc-head ' + (cls || "") + '"><div>' + kick(kicker) + disp(title, "h1", "tc-h1") + (lede ? '<p class="tc-lede">' + lede + "</p>" : "") + "</div>" + (side ? '<div class="tc-head-side">' + side + "</div>" : "") + "</header>";
  }
  function capRail(ctx, label, hrefFor, current) {
    return '<nav class="tc-caprail" aria-label="' + label + '">' + ctx.catalog.map(function (p) {
      return '<a href="' + hrefFor(p) + '"' + (p.id === current ? ' aria-current="page"' : "") + ">" + capOf(ctx, p, 46) + "<span>" + ctx.escape(ctx.shortName[p.id] || p.name) + "</span></a>";
    }).join("") + "</nav>";
  }
  function tile(ctx, p) {
    var off = !p.stock || !p.published;
    return '<article class="tc-tile" style="' + ctx.capStyle(p) + '"><a class="tc-tile-media" href="/products/' + p.id + '">' + ctx.image(p) + capOf(ctx, p, 38) + '<span class="sr-only">' + ctx.escape(p.name) + '</span></a><div class="tc-tile-body"><p class="tc-tile-k">' + ctx.escape(ctx.format[p.id]) + '</p><h3 class="tc-d"><a href="/products/' + p.id + '">' + ctx.escape(p.name) + "</a></h3><p>" + ctx.escape(p.subtitle) + '</p><div class="tc-tile-foot"><p><strong>' + ctx.money(p.price) + '</strong><small>Sample price</small></p><button type="button" class="tc-add" data-add="' + p.id + '" aria-label="Add ' + ctx.escape(p.name) + ' to bag"' + (off ? " disabled" : "") + ">" + ctx.icon("plus") + "<span>" + (off ? "Unavailable" : "Add") + "</span></button></div></div></article>";
  }
  function menuRow(ctx, p) {
    var off = !p.stock || !p.published;
    return '<li class="menu-row" style="' + ctx.capStyle(p) + '" data-peek="' + p.id + '"><a href="/products/' + p.id + '" class="menu-link">' + ctx.cap(p, "menu-cap") + '<span class="hc-menu-name"><span class="menu-name">' + ctx.escape(p.name) + '</span><span class="menu-summary">' + ctx.escape(p.subtitle) + '</span></span><span class="menu-format">' + ctx.escape(ctx.format[p.id]) + '</span><span class="menu-leader" aria-hidden="true"></span><span class="menu-price">' + ctx.money(p.price) + '</span></a><button class="menu-add" data-add="' + p.id + '" aria-label="Add ' + ctx.escape(p.name) + ' to bag"' + (off ? " disabled" : "") + ">" + ctx.icon("plus") + "</button></li>";
  }
  function peek(ctx, list) { return '<div class="menu-peek" aria-hidden="true">' + list.map(function (p) { return '<img src="/web/media/' + p.id + '.webp" alt="" data-peek-img="' + p.id + '" width="' + (ctx.bottleWidth[p.id] || 720) + '" height="1000" loading="lazy">'; }).join("") + "</div>"; }
  function ticket(inner, cls) { return '<div class="tc-ticket ' + (cls || "") + '">' + inner + "</div>"; }
  function numbered(items) { return '<ol class="tc-numbered">' + items.map(function (it, i) { return '<li><span class="tc-n">' + (i < 9 ? "0" : "") + (i + 1) + "</span><div><h3>" + it[0] + "</h3><p>" + it[1] + "</p></div></li>"; }).join("") + "</ol>"; }
  function band(ctx, p, inner, word, cls) {
    return '<section class="tc-band ' + (cls || "") + '" style="' + (p ? ctx.capStyle(p) : "") + '">' + (word ? '<p class="tc-water" aria-hidden="true">' + word + "</p>" : "") + '<div class="tc-band-in">' + inner + "</div></section>";
  }
  function pick(ctx, i) { return ctx.catalog[i % ctx.catalog.length]; }

  /* ---------- Chrome ---------- */
  function chrome(ctx, content) {
    var path = ctx.path;
    var cur = function (h) { return path === h || path.indexOf(h + "/") === 0 ? ' aria-current="page"' : ""; };
    var nav = [["/shop", "Shop"], ["/standards", "Standards"], ["/about", "About"], ["/learn", "Learn"], ["/story", "Story"]];
    return (
      '<header class="site-header tc-header"><a class="logo" href="/" aria-label="Body Café Co. home"><img src="/web/media/logo.svg" alt="" width="465" height="451"></a><nav class="main-nav" aria-label="Main">' + nav.map(function (n) { return '<a href="' + n[0] + '"' + cur(n[0]) + ">" + n[1] + "</a>"; }).join("") + "</nav>" +
      '<div class="header-tools"><a class="tc-report" href="/reports"' + cur("/reports") + '>Lot report</a><button class="icon-button" data-action="search" aria-label="Search">' + ctx.icon("search") + '</button><a class="icon-button" href="/account" aria-label="Your account">' + ctx.icon("user") + '</a><a class="bag-link" href="/cart" aria-label="Cart, ' + ctx.count + ' items">' + ctx.icon("bag") + "<span data-cart-count" + (ctx.count ? "" : " data-empty") + ">" + ctx.count + '</span></a><button class="menu-button" data-action="menu" aria-expanded="false" aria-controls="mobile-nav"><span>Menu</span></button></div></header>' +
      '<nav id="mobile-nav" hidden aria-label="Mobile"><div class="mobile-nav-links">' + nav.concat([["/reports", "Lot report"], ["/search", "Search"]]).map(function (n) { return '<a href="' + n[0] + '">' + n[1] + "</a>"; }).join("") + '</div><div class="mobile-nav-foot"><a href="/account">Account</a><a href="/cart">Cart (<span data-cart-count>' + ctx.count + '</span>)</a></div><div class="mobile-nav-caps" aria-hidden="true">' + ctx.catalog.map(function (p) { return ctx.cap(p); }).join("") + "</div></nav>" +
      '<main id="main" tabindex="-1" class="tc-main">' + content + "</main>" +
      '<footer class="site-footer tc-footer"><div class="footer-top"><div class="footer-pitch"><p class="tc-d tc-foot-line">Pick a cap.<br>Read the label.<br>Find the lot.</p><p>Seven everyday supplements, each with its own colour, its ingredient in view and a place for its lot report.</p>' + btn("/shop", "Shop all seven", "is-light") + '</div><div class="footer-cols"><div><h3>Shop</h3><a href="/shop">All seven</a><a href="/bundles">The edits</a><a href="/reports">Lot reports</a><a href="/search">Search</a></div><div><h3>About</h3><a href="/standards">Standards</a><a href="/learn">Learn</a><a href="/story">Story</a></div><div><h3>Help</h3><a href="/help">Help centre</a><a href="/contact">Contact</a><a href="/account">Track an order</a><a href="/settings">Preferences</a></div><div><h3>Policies</h3>' + S.policyOrder.map(function (k) { return '<a href="/policies/' + k + '">' + S.policies[k].title + "</a>"; }).join("") + '</div></div></div><nav class="footer-caps tc-foot-caps" aria-label="Products by cap">' + ctx.catalog.map(function (p) { return '<a href="/products/' + p.id + '" aria-label="' + ctx.escape(p.name) + '">' + ctx.cap(p) + "</a>"; }).join("") + '</nav><p class="footer-word" aria-hidden="true">Body Cafe Co</p><div class="footer-bottom"><span>© ' + new Date().getFullYear() + ' Body Café Co.</span><span>Draft copy · sample prices · preview commerce</span><a href="/preview/states">Design states</a></div></footer>'
    );
  }

  /* ---------- Shop ---------- */
  function shop(ctx) {
    var c = S.copy.shop;
    var sel = ctx.query.get("format") || "all";
    var all = ctx.published;
    var formats = ["Capsules", "Softgels", "Chewable tablets"];
    var groups = (sel === "all" ? formats : [sel]).map(function (f) { return [f, all.filter(function (p) { return ctx.format[p.id] === f; })]; });
    var count = groups.reduce(function (n, g) { return n + g[1].length; }, 0);
    var tabs = '<nav class="tc-tabs" aria-label="Filter by format">' + [["all", "All seven"]].concat(formats.map(function (f) { return [f, f]; })).map(function (f) {
      var n = f[0] === "all" ? all.length : all.filter(function (p) { return ctx.format[p.id] === f[0]; }).length;
      return '<a href="/shop' + (f[0] === "all" ? "" : "?format=" + encodeURIComponent(f[0])) + '"' + (f[0] === sel ? ' aria-current="page"' : "") + ">" + f[1] + " <sup>" + n + "</sup></a>";
    }).join("") + "</nav>";
    var board = count
      ? '<section class="menu tc-menu" aria-label="Menu board"><ul class="menu-board">' + groups.filter(function (g) { return g[1].length; }).map(function (g) { return '<li class="tc-menu-group"><h2 class="tc-d">' + g[0] + "</h2><span>" + g[1].length + " on the board</span></li>" + g[1].map(function (p) { return menuRow(ctx, p); }).join(""); }).join("") + "</ul>" + peek(ctx, all) + "</section>"
      : '<div class="tc-empty">' + inkCap(64) + disp(c.noMatch[0], "h2") + "<p>" + c.noMatch[1] + "</p>" + btn("/shop", "Show all seven") + "</div>";
    return '<div class="tc-page tc-shop">' + head(ctx, "The menu · " + all.length + " essentials", "Pick a cap.", c.lede, capRail(ctx, "Jump to a product", function (p) { return "/products/" + p.id; })) +
      '<div class="tc-wrap"><div class="tc-toolbar">' + tabs + '<p class="tc-count" role="status">' + count + " of " + all.length + " shown</p></div>" + board + '<p class="tc-foot-note">' + c.care + "</p></div>" +
      '<section class="tc-wrap tc-guidance" aria-labelledby="tc-guide-t">' + kick(c.guidanceTitle || "How to choose") + disp("Three ways to read the board.", "h2", "tc-h2", "") + '<div class="tc-guidance-grid">' + c.guidance.map(function (g, i) { return '<div class="tc-card">' + capOf(ctx, pick(ctx, i * 2), 34) + "<h3>" + g[0] + "</h3><p>" + g[1] + "</p></div>"; }).join("") + "</div></section>" +
      (count ? '<section class="tc-wrap" aria-labelledby="tc-front-t">' + kick("Seen from the front") + disp("Every bottle.", "h2", "tc-h2") + '<div class="tc-tiles">' + groups.reduce(function (a, g) { return a.concat(g[1]); }, []).map(function (p) { return tile(ctx, p); }).join("") + "</div></section>" : "") +
      '<section class="tc-wrap tc-compare" aria-labelledby="tc-compare-t"><div class="tc-split">' + kick("Side by side") + disp(c.compareTitle, "h2", "tc-h2") + "<p>" + c.compareNote + '</p></div><div class="tc-scroll"><table class="tc-table"><thead><tr><th scope="col">Product</th><th scope="col">In view now</th><th scope="col">Format</th><th scope="col">Serving &amp; pack</th><th scope="col">Sample price</th></tr></thead><tbody>' + all.map(function (p) { return '<tr style="' + ctx.capStyle(p) + '"><th scope="row"><a href="/products/' + p.id + '">' + capOf(ctx, p, 26) + ctx.escape(p.name) + "</a></th><td>" + ctx.escape(p.ingredients) + "</td><td>" + ctx.escape(ctx.format[p.id]) + '</td><td><span class="tc-chip">' + S.STATUS.label + "</span></td><td>" + ctx.money(p.price) + "</td></tr>"; }).join("") + "</tbody></table></div></section></div>";
  }

  /* ---------- Bundles ---------- */
  function bundles(ctx, id) {
    var c = S.copy.bundles;
    var B = ctx.state.bundles;
    var b = B.find(function (x) { return x.id === id; });
    if (id && !b) return notFound(ctx);
    if (!b) {
      return '<div class="tc-page">' + head(ctx, "The edits · examples only", "Two caps. One page.", c.lede, '<p class="tc-flag">' + c.status + "</p>") +
        '<div class="tc-wrap tc-edits">' + B.map(function (x, i) {
          var items = x.items.map(ctx.product).filter(Boolean);
          var sum = items.reduce(function (n, p) { return n + p.price; }, 0);
          return '<article class="tc-edit"><a class="tc-edit-art" href="/bundles/' + x.id + '" style="--c1:' + items[0].color + ";--c2:" + (items[1] || items[0]).color + '"><span class="tc-edit-caps">' + items.map(function (p) { return capOf(ctx, p, 120); }).join("") + "</span>" + items.map(function (p) { return ctx.image(p, "tc-edit-bottle"); }).join("") + '<span class="sr-only">' + ctx.escape(x.name) + '</span></a><div class="tc-edit-body"><p class="tc-tile-k">Example edit 0' + (i + 1) + "</p>" + disp('<a href="/bundles/' + x.id + '">' + ctx.escape(x.name) + "</a>", "h2", "tc-h3") + "<p>" + ctx.escape(x.description) + '</p><div class="tc-rows">' + items.map(function (p) { return row(capOf(ctx, p, 22) + ctx.escape(p.name), ctx.money(p.price)); }).join("") + row("<strong>Sample total</strong>", "<strong>" + ctx.money(sum) + "</strong>") + "</div>" + btn("/bundles/" + x.id, "Open this edit") + "</div></article>";
        }).join("") + '</div><section class="tc-wrap">' + kick("How edits work") + disp("No regimen. No invented savings.", "h2", "tc-h2") + numbered(c.why) + "</section></div>";
    }
    var items = b.items.map(ctx.product).filter(Boolean);
    var sum = items.reduce(function (n, p) { return n + p.price; }, 0);
    return '<div class="tc-page"><section class="tc-edit-hero" style="--c1:' + items[0].color + ";--c2:" + (items[1] || items[0]).color + '"><div class="tc-edit-halves" aria-hidden="true"><span></span><span></span></div><div class="tc-edit-hero-art">' + items.map(function (p) { return '<a href="/products/' + p.id + '">' + ctx.image(p, "", true) + '<span class="sr-only">' + ctx.escape(p.name) + "</span></a>"; }).join("") + '</div></section><div class="tc-wrap tc-edit-detail"><div><nav class="tc-crumbs" aria-label="Breadcrumb"><a href="/bundles">← All edits</a></nav>' + kick("Example edit · two products") + disp(ctx.escape(b.name), "h1", "tc-h1") + '<p class="tc-lede">' + ctx.escape(b.description) + '</p></div><div class="tc-card is-ticket"><div class="tc-rows">' + items.map(function (p) { return row(capOf(ctx, p, 26) + '<a href="/products/' + p.id + '">' + ctx.escape(p.name) + "</a> <small>" + ctx.escape(ctx.format[p.id]) + "</small>", ctx.money(p.price)); }).join("") + row("<strong>Sample total · no discount</strong>", "<strong>" + ctx.money(sum) + "</strong>") + '</div><button class="tc-btn is-full" data-bundle="' + b.id + '"><span>Add both to bag</span>' + ctx.icon("plus") + '</button><p class="tc-small">' + c.status + "</p></div></div></div>";
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
    return '<div class="tc-page tc-search"><section class="tc-search-hero">' + kick("Search the café") + disp("What are you looking for?", "h1", "tc-h1") + ctx.forms.search(q) + '<p class="tc-hints"><span>Try</span>' + c.hints.map(function (h) { return '<a href="/search?q=' + encodeURIComponent(h) + '">' + h + "</a>"; }).join("") + "</p></section>" +
      '<div class="tc-wrap">' + (q ? '<p class="tc-count" role="status">' + total + " result" + (total === 1 ? "" : "s") + " for “" + ctx.escape(q) + "”</p>" : '<p class="tc-lede">' + c.lede + "</p>") +
      (report ? '<div class="tc-card is-ink">' + kick("Got a bottle in hand?") + "<p>Lot reports have their own lookup, by product and lot number.</p>" + btn("/reports", "Find your lot report", "is-light") + "</div>" : "") +
      (prods.length ? '<section class="menu tc-menu" aria-label="Products"><h2 class="tc-d tc-h3">Products</h2><ul class="menu-board">' + prods.map(function (p) { return menuRow(ctx, p); }).join("") + "</ul>" + peek(ctx, prods) + "</section>" : "") +
      (gs.length || nt.length ? '<section class="tc-results"><h2 class="tc-d tc-h3">Reading</h2><div class="tc-rows is-links">' + gs.map(function (g) { return '<a class="tc-row" href="' + g[0] + '"><span class="tc-row-l">' + inkCap(22) + g[1] + '</span><span class="tc-leader" aria-hidden="true"></span><span class="tc-row-v">Guide</span></a>'; }).join("") + nt.map(function (p) { return '<a class="tc-row" href="/learn/' + p.id + '"><span class="tc-row-l">' + capOf(ctx, p, 22) + ctx.escape(p.name) + '</span><span class="tc-leader" aria-hidden="true"></span><span class="tc-row-v">Ingredient note</span></a>'; }).join("") + "</div></section>" : "") +
      (q && !total ? '<div class="tc-empty">' + inkCap(64) + disp("Nothing on the board for “" + ctx.escape(q) + "”.", "h2") + "<p>" + c.noResults + "</p>" + btn("/shop", "Browse all seven") + "</div>" : "") +
      (!q ? '<h2 class="tc-d tc-h3">Or pick a cap</h2>' + capRail(ctx, "Products", function (p) { return "/products/" + p.id; }) : "") + "</div></div>";
  }

  /* ---------- Standards ---------- */
  function standards(ctx) {
    var c = S.copy.standards;
    return '<div class="tc-page tc-standards">' + head(ctx, "Our standards · the house rules", "The detail behind the bottle.", c.lede, '<p class="tc-head-note">' + c.intro + "</p>") +
      '<div class="tc-wrap"><ol class="tc-rules">' + c.pillars.map(function (p, i) {
        var cp = pick(ctx, i + 2);
        return '<li id="' + p.id + '" class="tc-rule" style="' + ctx.capStyle(cp) + '"><details' + (i === 0 ? " open" : "") + '><summary><span class="tc-rule-n">0' + (i + 1) + "</span>" + capOf(ctx, cp, 40) + '<span class="tc-rule-t"><span class="tc-d">' + p.title + "</span><small>" + p.summary + '</small></span><span class="tc-plus" aria-hidden="true">+</span></summary><div class="tc-rule-body"><div><p>' + p.body + "</p>" + bullets(p.points) + '</div><div class="tc-card"><p class="tc-tile-k">Where it stands today</p><p>' + p.now + "</p></div></div></details></li>";
      }).join("") + "</ol></div>" +
      '<section class="tc-band tc-ink-band"><div class="tc-band-in">' + kick("The honest ledger") + disp("What's documented, what's next, what we won't do.", "h2", "tc-h2") + '<div class="tc-ledger">' + [["Documented now", c.documented, "is-done"], ["Planned before launch", c.planned, "is-plan"], ["We won't", c.wont, "is-no"]].map(function (col) { return '<div class="tc-ledger-col ' + col[2] + '"><h3 class="tc-d">' + col[0] + "</h3>" + bullets(col[1]) + "</div>"; }).join("") + "</div></div></section>" +
      '<div class="tc-wrap tc-next">' + tlink("/reports", "Try a lot lookup") + tlink("/learn/understanding-reports", "What a lot report shows") + tlink("/learn/reading-a-label", "Read a label with confidence") + "</div></div>";
  }

  /* ---------- Story ---------- */
  function story(ctx) {
    var c = S.copy.story;
    return '<div class="tc-page tc-story"><section class="tc-story-hero"><div class="tc-story-caps" aria-hidden="true">' + ctx.catalog.map(function (p, i) { return '<span style="--i:' + i + '">' + capOf(ctx, p, 120) + "</span>"; }).join("") + "</div>" + kick("Our story") + disp("Seven caps. One idea.", "h1", "tc-h1 tc-mega") + '<p class="tc-lede">' + c.lede + "</p></section>" +
      '<div class="tc-wrap"><p class="tc-opening">' + c.opening + "</p></div>" +
      c.chapters.map(function (ch, i) { var p = pick(ctx, [6, 1, 2, 4][i]); return band(ctx, p, '<p class="tc-kick is-on">Chapter 0' + (i + 1) + "</p>" + disp(ch.title, "h2", "tc-h2") + '<p class="tc-band-p">' + ch.body + "</p>", "0" + (i + 1), "tc-chapter" + (i % 2 ? " is-right" : "")); }).join("") +
      '<section class="tc-wrap tc-promises">' + kick("What you can hold us to") + disp("On the menu. Off the menu.", "h2", "tc-h2") + '<div class="tc-prom"><div class="tc-rows">' + c.promises.map(function (p, i) { return '<div class="tc-row is-tall"><span class="tc-row-l">' + capOf(ctx, pick(ctx, i * 2 + 1), 26) + "<span><strong>" + p[0] + "</strong><small>" + p[1] + '</small></span></span><span class="tc-leader" aria-hidden="true"></span><span class="tc-row-v">On</span></div>'; }).join("") + '</div><div class="tc-card is-ink"><p class="tc-tile-k">Off the menu</p>' + bullets(c.wont, "is-no") + "</div></div></section>" +
      '<section class="tc-wrap tc-people"><div class="tc-portrait" role="img" aria-label="Space reserved for a founder photo, not yet supplied">' + inkCap(72) + "<span>Founder photo to come</span></div><div>" + kick("The people behind it") + disp("In their own words, soon.", "h2", "tc-h2") + '<p class="tc-lede">' + c.people + '</p><div class="tc-card"><p class="tc-tile-k">Waiting on</p>' + bullets(c.peopleNeeds) + "</div></div></section>" +
      '<div class="tc-wrap tc-next">' + tlink("/standards", "Our standards") + tlink("/shop", "Meet the seven") + tlink("/learn", "Learn") + "</div></div>";
  }

  /* ---------- Learn ---------- */
  function learn(ctx, slug) {
    if (slug && S.guides[slug]) return guide(ctx, slug);
    if (slug && ctx.product(slug)) return note(ctx, ctx.product(slug));
    if (slug) return notFound(ctx);
    var c = S.copy.learn;
    return '<div class="tc-page tc-learn">' + head(ctx, "Learn · the reading room", "Read the label. Then the lot.", c.lede, '<nav class="tc-topics" aria-label="Topics">' + c.topics.map(function (t) { return '<a href="#' + t[0] + '"><strong>' + t[1] + "</strong><span>" + t[2] + "</span></a>"; }).join("") + "</nav>") +
      '<section class="tc-specials" aria-labelledby="tc-specials-t"><div class="tc-specials-in"><p class="tc-kick is-on"><span class="tc-dot" aria-hidden="true"></span>Today\'s specials · three guides</p><h2 id="tc-specials-t" class="tc-d tc-h2">On the board</h2><ul class="tc-board">' + S.guideOrder.map(function (s, i) { var g = S.guides[s]; return '<li id="' + g.topic + '"><a href="/learn/' + s + '"><span class="tc-n">0' + (i + 1) + '</span><span class="tc-board-t"><span class="tc-d">' + g.title + "</span><small>" + g.summary + '</small></span><span class="tc-leader" aria-hidden="true"></span><span class="tc-board-v">' + S.minutes(g) + " min</span></a></li>"; }).join("") + '</ul><p class="tc-small is-on">' + c.intro + "</p></div></section>" +
      '<section class="tc-wrap" id="notes" aria-labelledby="notes-t">' + kick("Ingredient notes · all seven") + disp("Pick a cap to read its note.", "h2", "tc-h2") + '<div class="tc-notes">' + ctx.catalog.map(function (p) { return '<a class="tc-note-card" href="/learn/' + p.id + '" style="' + ctx.capStyle(p) + '"><span class="tc-note-top">' + capOf(ctx, p, 92) + '</span><strong class="tc-d">' + ctx.escape(p.name) + "</strong><small>" + S.noteSummary(p.id) + "</small></a>"; }).join("") + "</div></section>" +
      '<section class="tc-wrap tc-glossary" aria-labelledby="gloss-t">' + kick("Glossary") + disp("Words on the label.", "h2", "tc-h2") + '<dl class="tc-gloss">' + c.glossary.map(function (g) { return '<div class="tc-row is-tall"><dt class="tc-row-l"><strong>' + g[0] + '</strong></dt><dd class="tc-row-v">' + g[1] + "</dd></div>"; }).join("") + "</dl></section>" +
      '<div class="tc-wrap tc-next">' + tlink("/help", "Help centre") + tlink("/contact", "Ask a person") + "</div></div>";
  }
  function guide(ctx, slug) {
    var g = S.guides[slug];
    var i = S.guideOrder.indexOf(slug);
    var p = pick(ctx, [2, 0, 5][i] || 0);
    return '<article class="tc-page tc-article">' + band(ctx, p, '<nav class="tc-crumbs is-on" aria-label="Breadcrumb"><a href="/learn">← Learn</a></nav><p class="tc-kick is-on">Guide 0' + (i + 1) + " · " + S.minutes(g) + " min read</p>" + disp(g.title, "h1", "tc-h1") + '<p class="tc-band-p">' + g.summary + "</p>", "0" + (i + 1), "tc-art-band") +
      '<div class="tc-wrap tc-art"><aside class="tc-art-side"><div class="tc-card"><p class="tc-tile-k">In short</p>' + bullets(g.takeaways) + '</div><nav class="tc-toc" aria-label="In this guide"><p class="tc-tile-k">Contents</p>' + g.sections.map(function (s, j) { return '<a href="#' + s.id + '"><span class="tc-n">0' + (j + 1) + "</span>" + s.h + "</a>"; }).join("") + '<a href="#checklist"><span class="tc-n">✓</span>Checklist</a></nav></aside><div class="tc-art-body"><p class="tc-opening">' + g.opening + "</p>" +
      g.sections.map(function (s, j) { return '<section id="' + s.id + '" class="tc-art-sec"><h2 class="tc-d tc-h3"><span class="tc-n">0' + (j + 1) + "</span>" + s.h + "</h2>" + s.html + "</section>"; }).join("") +
      ticket('<p class="tc-tile-k">Illustrative example · not a product record</p><h3 class="tc-d">' + g.example.title + '</h3><p class="tc-small">' + g.example.note + '</p><div class="tc-rows">' + g.example.rows.map(function (r) { return row(r[0], r[1]); }).join("") + "</div><p>" + g.example.reading + "</p>") +
      '<section id="checklist" class="tc-art-sec"><h2 class="tc-d tc-h3"><span class="tc-n">✓</span>Checklist</h2>' + bullets(g.checklist, "is-check") + "</section>" +
      (g.sources.length ? '<section class="tc-sources"><h2 class="tc-tile-k">Sources</h2>' + S.sourceList(g.sources) + "</section>" : '<p class="tc-small">This guide explains reports in general. It describes no specific laboratory, report or result.</p>') +
      '<p class="tc-small">General information, not personal advice. No author or reviewer is credited until the guide has been reviewed.</p></div></div><div class="tc-wrap tc-next">' + g.related.map(function (r) { return tlink("/learn/" + r, S.guides[r].title); }).join("") + tlink("/reports", "Find your lot report") + tlink("/shop", "See the collection") + "</div></article>";
  }
  function note(ctx, p) {
    var n = S.notes[p.id] || { lead: "", check: [], compound: "", sources: [] };
    var confirm = ((window.BCCProductPage && window.BCCProductPage.toConfirm && window.BCCProductPage.toConfirm[p.id]) || []).concat(["Complete ingredient list, allergens, storage and manufacturer details"]);
    var idx = ctx.catalog.indexOf(p) + 1;
    return '<article class="tc-page tc-note">' + band(ctx, p, '<div class="tc-note-grid"><div><nav class="tc-crumbs is-on" aria-label="Breadcrumb"><a href="/learn#notes">← All ingredient notes</a></nav><p class="tc-kick is-on">Ingredient note · 0' + idx + " / 0" + ctx.catalog.length + "</p>" + disp(ctx.escape(p.name), "h1", "tc-h1") + '<p class="tc-band-p">' + n.lead + '</p><div class="tc-inview"><p class="tc-tile-k">In view now</p><p>' + ctx.escape(p.ingredients) + " · " + ctx.escape(ctx.format[p.id]) + '</p></div></div><div class="tc-note-art">' + ctx.image(p, "", true) + '<p class="tc-small is-on">Design mockup. Printed wording is a draft, not the approved label.</p></div></div>', ctx.escape(ctx.shortName[p.id] || p.name), "tc-note-band") +
      '<div class="tc-wrap tc-note-body"><div>' + kick("What to check on this label") + disp("Read it in this order.", "h2", "tc-h2") + '<ol class="tc-numbered">' + n.check.map(function (x, i) { return '<li><span class="tc-n">0' + (i + 1) + "</span><div><h3>" + x[0] + "</h3><p>" + x[1] + "</p></div></li>"; }).join("") + "</ol>" + (n.compound ? '<div class="tc-card"><p class="tc-tile-k">A note on forms</p><p>' + n.compound + "</p></div>" : "") + '</div><aside class="tc-card is-ticket" style="' + ctx.capStyle(p) + '"><p class="tc-tile-k">Waiting on our approved label</p><p>These details for our ' + ctx.escape(p.name) + " come from the approved rear label. Until then, the product page shows them as awaiting approval.</p>" + bullets(confirm, "is-plan") + '<p class="tc-small">' + S.CARE_NOTE + "</p></aside></div>" +
      (n.sources.length ? '<div class="tc-wrap"><section class="tc-sources"><h2 class="tc-tile-k">Sources</h2>' + S.sourceList(n.sources) + "</section></div>" : "") +
      '<div class="tc-wrap tc-next">' + tlink("/products/" + p.id, "View " + ctx.escape(p.name)) + tlink("/reports?product=" + p.id, "Look up a lot") + tlink("/learn/ingredient-forms", "Why ingredient forms matter") + "</div>" + '<div class="tc-wrap">' + capRail(ctx, "Other ingredient notes", function (o) { return "/learn/" + o.id; }, p.id) + "</div></article>";
  }

  /* ---------- Reports ---------- */
  function reports(ctx) {
    var c = S.copy.reports;
    var pid = ctx.product(ctx.query.get("product")) ? ctx.query.get("product") : "vitamin-d3-k2";
    var cur = ctx.product(pid);
    return '<div class="tc-page tc-reports report-page" style="' + (cur ? ctx.capStyle(cur) : "") + '"><section class="tc-rep"><div class="tc-rep-copy">' + kick("Lot reports", "is-on") + disp("Turn the bottle over.", "h1", "tc-h1") + '<p class="tc-band-p">' + c.what + '</p><ol class="tc-numbered is-on">' + c.steps.map(function (s, i) { return '<li><span class="tc-n">0' + (i + 1) + "</span><div><h3>" + s[0] + "</h3><p>" + s[1] + "</p></div></li>"; }).join("") + '</ol><p class="tc-small is-on">' + c.locationStatus + '</p></div><div class="tc-rep-card"><p class="tc-tile-k">01 · Pick a cap</p>' + ctx.forms.productPicker(pid) + '<p class="tc-tile-k">02 · Enter the lot</p>' + ctx.forms.reportForm(pid, ctx.query.get("lot")) + '<p class="tc-small">' + c.demo + "</p></div></section>" +
      '<section class="tc-wrap">' + kick("Anatomy of a record") + disp("What a report should show.", "h2", "tc-h2") + '<div class="tc-anatomy">' + numbered(c.hierarchy) + '<div class="tc-card is-ink"><p class="tc-tile-k">Its limits</p>' + bullets(c.limits, "is-no") + "</div></div></section>" +
      '<div class="tc-wrap tc-next">' + tlink("/learn/understanding-reports", "What a lot report shows") + tlink("/standards#lot", "How packs link to lots") + tlink("/contact", "Ask about a lot") + "</div></div>";
  }

  /* ---------- Bag ---------- */
  function cart(ctx) {
    var c = S.copy.cart;
    var items = ctx.state.cart.map(function (i) { return { p: ctx.product(i.id), q: i.quantity }; }).filter(function (x) { return x.p; });
    if (!items.length) return '<div class="tc-page tc-bagpage"><section class="tc-empty is-page"><div class="tc-empty-caps" aria-hidden="true">' + ctx.catalog.map(function (p) { return capOf(ctx, p, 64); }).join("") + "</div>" + disp(c.empty[0] + ".", "h1", "tc-h1") + "<p>" + c.empty[1] + '</p><div class="tc-actions">' + btn("/shop", "Shop all seven") + tlink("/bundles", "Browse the edits") + "</div></section>" + '<div class="tc-wrap">' + kick("Pick a cap to start") + capRail(ctx, "Products", function (p) { return "/products/" + p.id; }) + "</div></div>";
    return '<div class="tc-page tc-bagpage">' + head(ctx, "Your bag · " + ctx.count + " item" + (ctx.count === 1 ? "" : "s"), "Your order.", c.note) +
      '<div class="tc-wrap tc-bag-grid"><ul class="tc-lines">' + items.map(function (x) {
        var p = x.p;
        return '<li class="tc-line" style="' + ctx.capStyle(p) + '"><a class="tc-line-media" href="/products/' + p.id + '">' + ctx.image(p) + '<span class="sr-only">' + ctx.escape(p.name) + '</span></a><div class="tc-line-info"><h2 class="tc-d"><a href="/products/' + p.id + '">' + ctx.escape(p.name) + "</a></h2><p>" + ctx.escape(ctx.format[p.id]) + " · " + ctx.money(p.price) + ' each · sample</p><div class="tc-qty quantity-control"><button data-quantity="' + p.id + '" data-change="-1" aria-label="Decrease ' + ctx.escape(p.name) + ' quantity">−</button><span aria-label="Quantity">' + x.q + '</span><button data-quantity="' + p.id + '" data-change="1" aria-label="Increase ' + ctx.escape(p.name) + ' quantity">+</button></div><button class="tc-remove remove" data-remove="' + p.id + '">Remove</button></div><strong class="tc-line-total">' + ctx.money(p.price * x.q) + "</strong></li>";
      }).join("") + "</ul>" + ticket('<p class="tc-tile-k">Order ticket</p><div class="tc-rows">' + items.map(function (x) { return row(ctx.escape(x.p.name) + " × " + x.q, ctx.money(x.p.price * x.q)); }).join("") + row("Delivery", "At checkout") + row("<strong>Sample subtotal</strong>", "<strong>" + ctx.money(ctx.total) + "</strong>") + "</div>" + btn("/checkout", "Continue to checkout", "is-full") + '<p class="tc-small">No money is collected in the preview.</p>', "tc-sum") + '</div><div class="tc-wrap tc-next">' + c.next.map(function (n) { return tlink(n[0], n[1]); }).join("") + tlink("/shop", "Keep shopping") + "</div></div>";
  }

  /* ---------- Checkout ---------- */
  function checkout(ctx, fx) {
    var c = S.copy.checkout;
    if (fx === "unavailable" || (!fx && ctx.staticPreview)) return unavailable(ctx, "/checkout");
    var sm = fx === "sample" || fx === "errors";
    var items = sm ? [{ id: "vitamin-d3-k2", quantity: 1 }, { id: "omega-3-fish-oil", quantity: 2 }] : ctx.state.cart;
    if (!items.length) return '<div class="tc-page"><section class="tc-empty is-page">' + inkCap(64) + disp("Your bag is empty.", "h1", "tc-h1") + "<p>Add a product before checking out.</p>" + btn("/shop", "Shop all seven") + "</section></div>";
    var err = fx === "errors" ? { name: "Add the name for the delivery.", mobile: "Use a 10-digit mobile starting with 6, 7, 8 or 9.", pincode: "Use a 6-digit pincode that doesn't start with 0.", adult: "Please confirm the purchaser is 18 or older.", form: "A few details need fixing before we can create the order." } : null;
    var vals = fx === "sample" ? S.fixtures.contact : fx === "errors" ? { address: S.fixtures.contact.address, city: "Bengaluru", state: "Karnataka", mobile: "12345", pincode: "012345" } : { mobile: (ctx.user && ctx.user.mobile) || "" };
    var s = ctx.forms.summary(items, sm);
    var caps = ["iron-bisglycinate", "vitamin-d3-k2", "creatine-chews"].map(ctx.product);
    return '<div class="tc-page tc-checkout">' + (sm ? sample("Synthetic details for reviewing the design. Every field is disabled; nothing is submitted or saved.") : "") + head(ctx, "Checkout · guest", "Checkout.", c.lede) +
      '<div class="tc-wrap tc-co-grid"><form id="checkout-form" class="tc-co-form checkout-form">' + c.steps.map(function (st, i) {
        var body = i === 0 ? ctx.forms.delivery(vals, sm, err) : i === 1 ? ctx.forms.payment(sm) : ctx.forms.confirm(sm, err) + '<p class="tc-small">' + c.privacy + "</p>";
        return '<section class="tc-co-step"><h2 class="tc-d tc-h3">' + (caps[i] ? capOf(ctx, caps[i], 34) : "") + '<span class="tc-n">0' + (i + 1) + "</span>" + st + "</h2>" + body + "</section>";
      }).join("") + "</form>" +
      '<aside class="tc-ticket tc-sum order-summary checkout-summary"><p class="tc-tile-k">Order ticket · ' + s.count + " items</p>" + s.lines + s.discount + s.totals + '<p class="tc-small">Sample pricing only; no final GST calculation is shown.</p><div class="tc-after"><p class="tc-tile-k">Then what?</p>' + numbered(c.after) + "</div></aside></div></div>";
  }

  /* ---------- Payment ---------- */
  function view(o, fx) { if (fx) return fx; if (!o) return "missing"; if (o.state === "paid") return "paid"; if (o.state === "pending") return o.expires < Date.now() / 1000 ? "expired" : "pending"; return "inactive"; }
  function payment(ctx, o, fx) {
    var v = view(o, fx);
    if (v === "missing") return notFound(ctx);
    var sm = !!fx;
    var t = { pending: ["Ready to pay.", "Try a success or a failure. Your items are held for 15 minutes.", "Awaiting payment", "vitamin-d3-k2"], failed: ["Payment didn't go through.", "No money moved. Your items are still held, so you can try again.", "Failed", "iron-bisglycinate"], paid: ["Payment received.", "No money moved. Your preview order is confirmed.", "Paid", "l-theanine"], expired: ["The hold has ended.", "The 15-minute hold is over. Start a new checkout to check availability again.", "Expired", "psyllium-husk"], unavailable: ["Payments are unavailable.", "The payment service didn't respond. Nothing was charged; try again shortly.", "Service down", "omega-3-fish-oil"], inactive: ["No payment needed.", "This order no longer has an active payment step.", "Closed", "creatine-chews"] }[v];
    var cp = ctx.product(t[3]) || ctx.catalog[0];
    var act = v === "pending" || v === "failed"
      ? '<button class="tc-btn is-full" data-pay="success" data-id="' + o.id + '"' + (sm ? " disabled" : "") + '><span>Simulate successful payment</span></button><button class="tc-btn is-ghost is-full" data-pay="failure" data-id="' + o.id + '"' + (sm ? " disabled" : "") + '><span>Simulate failed payment</span></button>' + (sm ? "" : '<p class="reservation-time" data-expires="' + o.expires + '"></p>') + '<p id="payment-result" role="status">' + (v === "failed" ? "Preview payment failed. You can try again." : "") + "</p>"
      : v === "expired" ? btn("/cart", "Back to your bag") : v === "unavailable" ? '<button class="tc-btn" disabled><span>Try again</span></button>' + tlink("/cart", "Back to your bag") : btn("/orders/" + o.id, "View your order");
    return '<div class="tc-page tc-pay">' + (sm ? sample("Synthetic order SAMPLE-1042. No payment, order or record exists.") : "") + band(ctx, cp, '<div class="tc-pay-grid"><div><p class="tc-kick is-on">Payment · ' + ctx.escape(o.id) + "</p>" + disp(t[0], "h1", "tc-h1") + '<p class="tc-band-p">' + t[1] + '</p></div><div class="tc-ticket tc-pay-ticket"><p class="tc-stamp">' + t[2] + '</p><div class="tc-rows">' + o.items.map(function (i) { return row(ctx.escape(i.name) + " × " + i.quantity, ctx.money(i.unit_price * i.quantity)); }).join("") + row("Sample discount", "−" + ctx.money(o.discount)) + row("Sample shipping", ctx.money(o.shipping)) + row("<strong>Total</strong>", "<strong>" + ctx.money(o.total) + "</strong>") + '</div><div class="tc-pay-act">' + act + "</div></div></div>", "", "tc-pay-band") +
      '<div class="tc-wrap"><p class="tc-small">Real payments need Razorpay credentials, signature verification, webhook reconciliation and settlement testing. None is connected.</p></div></div>';
  }

  /* ---------- Order ---------- */
  function order(ctx, o, fx) {
    if (!o) return '<div class="tc-page"><section class="tc-empty is-page">' + inkCap(64) + disp("Order not found.", "h1", "tc-h1") + "<p>Sign in to the customer session that owns this order.</p>" + btn("/account", "Your account") + "</section></div>";
    var sm = !!fx, st = o.state;
    var title = { pending: "Waiting for payment.", paid: "Order received.", shipped: "On its way.", delivered: "Delivered.", cancelled: "Order cancelled.", expired: "Order expired." }[st] || "Your order.";
    var steps = [["pending", "Created"], ["paid", "Paid"], ["shipped", "Shipped"], ["delivered", "Delivered"]];
    var customer = sm || (ctx.user && ctx.user.role === "customer");
    var canCancel = customer && ["pending", "paid"].indexOf(st) >= 0;
    var reviewed = (ctx.account && ctx.account.reviews) || [];
    var ri = o.items.filter(function (i) { return !reviewed.some(function (r) { return r.order_id === o.id && r.product === i.id; }); });
    var review = customer && st === "delivered" ? (ri.length ? '<section class="tc-card tc-review"><p class="tc-tile-k">Verified delivery · moderated</p><h2 class="tc-d tc-h3">How was it?</h2><p>Only delivered orders can be reviewed, and every review is moderated first.</p>' + ctx.forms.reviewForm(o, ri, sm) + "</section>" : '<div class="tc-card"><p class="tc-tile-k">Review submitted</p><p>Your review is awaiting moderation.</p></div>') : "";
    return '<div class="tc-page tc-order">' + (sm ? sample("Synthetic order with a fictional address. Nothing was ordered or shipped.") : "") + head(ctx, "Order " + ctx.escape(o.id) + " · " + ctx.date(o.created), title, "Preview transaction only. Nothing was charged or shipped.", '<ol class="tc-track">' + steps.map(function (s, i) { var h = (o.history || []).find(function (x) { return x.state === s[0]; }); var p = pick(ctx, [0, 2, 5, 1][i]); return '<li class="' + (h ? "is-done" : "") + '">' + (h ? capOf(ctx, p, 30) : '<span class="tc-ring" aria-hidden="true"></span>') + "<strong>" + s[1] + "</strong><small>" + (h ? ctx.date(h.at) : "Not yet") + "</small></li>"; }).join("") + "</ol>") +
      '<div class="tc-wrap tc-bag-grid"><div>' + (o.provider ? '<div class="tc-card"><p class="tc-tile-k">Tracking</p><p>' + ctx.escape(o.provider) + " · " + ctx.escape(o.tracking) + ". Simulated; no shipment was booked.</p></div>" : "") + (o.refund && o.refund !== "none" ? '<div class="tc-card is-warn"><p class="tc-tile-k">Refund ' + ctx.escape(o.refund.replace(/_/g, " ")) + "</p><p>A refund needs a second person's approval and moves no money in the preview.</p></div>" : "") +
      '<ul class="tc-lines">' + o.items.map(function (i) { var p = ctx.product(i.id); return '<li class="tc-line" style="' + (p ? ctx.capStyle(p) : "") + '"><a class="tc-line-media" href="/products/' + i.id + '">' + (p ? ctx.image(p) : "") + '<span class="sr-only">' + ctx.escape(i.name) + '</span></a><div class="tc-line-info"><h2 class="tc-d"><a href="/products/' + i.id + '">' + ctx.escape(i.name) + "</a></h2><p>Quantity " + i.quantity + '</p></div><strong class="tc-line-total">' + ctx.money(i.quantity * i.unit_price) + "</strong></li>"; }).join("") + "</ul>" +
      '<div class="tc-actions">' + (st === "pending" ? btn("/payment/" + o.id + (sm ? "?state=pending" : ""), "Continue payment") : "") + (canCancel ? '<button class="tc-btn is-ghost" data-cancel="' + o.id + '"' + (sm ? " disabled" : "") + "><span>Cancel order</span></button>" : "") + '<button class="tc-btn is-ghost" data-reorder="' + o.id + '"' + (sm ? " disabled" : "") + "><span>Reorder</span></button>" + tlink("/contact?order=" + o.id, "Get help with this order") + "</div>" + review + "</div>" +
      ticket('<p class="tc-tile-k">Order ticket</p><div class="tc-rows">' + row("Sample subtotal", ctx.money(o.subtotal)) + row("Sample discount", "−" + ctx.money(o.discount)) + row("Sample delivery", ctx.money(o.shipping)) + row("<strong>Total</strong>", "<strong>" + ctx.money(o.total) + "</strong>") + '</div><p class="tc-tile-k">Delivering to</p><address>' + ctx.escape(o.contact.name) + "<br>" + ctx.escape(o.contact.address) + "<br>" + ctx.escape(o.contact.city) + ", " + ctx.escape(o.contact.state) + " " + ctx.escape(o.contact.pincode) + '</address><p class="tc-small">Policy snapshot: ' + ctx.escape(o.policy_version) + "</p>", "tc-sum") + "</div></div>";
  }

  /* ---------- Account ---------- */
  function account(ctx, tab, fx) {
    var c = S.copy.account;
    var a = ctx.account || { orders: [], addresses: [], cases: [] };
    var sm = !!fx;
    var guest = fx ? fx === "signed-out" || fx === "code" : !ctx.user || ctx.user.id.indexOf("guest-") === 0;
    if (fx) a = { orders: fx === "orders" ? [S.fixtures.order("delivered", ctx.catalog), Object.assign(S.fixtures.order("paid", ctx.catalog), { id: "SAMPLE-1037" })] : [], addresses: fx === "sample" ? S.fixtures.addresses() : [], cases: fx === "sample" ? S.fixtures.cases : [] };
    var tabs = '<nav class="tc-tabs" aria-label="Account sections">' + [["orders", "Orders", "/account"], ["addresses", "Addresses", "/account/addresses"], ["cases", "Support cases", "/account/cases"], ["preferences", "Preferences", "/settings"]].map(function (x) { return '<a href="' + x[2] + (sm ? "?state=" + (x[0] === "orders" ? "orders" : "sample") : "") + '"' + (x[0] === tab ? ' aria-current="page"' : "") + ">" + x[1] + "</a>"; }).join("") + (guest ? "" : '<button class="tc-signout" data-action="logout"' + (sm ? " disabled" : "") + ">Sign out</button>") + "</nav>";
    var login = guest ? '<section class="tc-wrap tc-login"><div>' + kick("Sign in with your mobile") + disp("Your orders, in one place.", "h2", "tc-h2") + "<p>" + c.signIn + '</p></div><div class="tc-card">' + (fx === "code" ? ctx.forms.codeEntry("482913") : ctx.forms.otp(sm)) + "</div></section>" : "";
    var body;
    if (tab === "addresses") body = '<div class="tc-acc-grid"><div><h2 class="tc-d tc-h3">Saved addresses</h2>' + (a.addresses.length ? a.addresses.map(function (v, i) { return '<address class="tc-card tc-addr">' + capOf(ctx, pick(ctx, i + 3), 26) + "<strong>" + ctx.escape(v.name) + "</strong><br>" + ctx.escape(v.address) + "<br>" + ctx.escape(v.city) + ", " + ctx.escape(v.state) + " " + ctx.escape(v.pincode) + "</address>"; }).join("") : '<div class="tc-card"><p>No saved addresses yet. Add one and it\'ll be ready at checkout.</p></div>') + '</div><section class="tc-card"><h2 class="tc-d tc-h3">Add an address</h2>' + ctx.forms.address(sm) + "</section></div>";
    else if (tab === "cases") body = '<div class="tc-row-head"><h2 class="tc-d tc-h3">Support cases</h2>' + tlink("/contact", "Open a new case") + "</div>" + (a.cases.length ? '<div class="tc-rows is-links">' + a.cases.map(function (k) { return '<div class="tc-row is-tall"><span class="tc-row-l"><span><strong>' + ctx.escape(k.id) + " · " + ctx.escape(k.kind) + "</strong><small>" + ctx.escape(k.message) + "</small><small>" + ctx.escape(k.owner) + " · " + ctx.escape(k.sla) + (k.order_id ? ' · <a href="/orders/' + k.order_id + (sm ? "?state=paid" : "") + '">' + k.order_id + "</a>" : "") + '</small></span></span><span class="tc-leader" aria-hidden="true"></span><span class="tc-row-v"><span class="tc-chip">' + ctx.escape(k.state) + "</span></span></div>"; }).join("") + "</div>" : '<div class="tc-card"><p>No open cases. Cases and their updates will show up here.</p>' + tlink("/contact", "Contact support") + "</div>");
    else body = '<h2 class="tc-d tc-h3">Your orders</h2>' + (a.orders.length ? '<div class="tc-rows is-links">' + a.orders.map(function (o) { return '<a class="tc-row is-tall" href="/orders/' + o.id + (sm ? "?state=" + o.state : "") + '"><span class="tc-row-l"><span><strong>' + ctx.escape(o.id) + "</strong><small>" + ctx.date(o.created) + " · " + o.items.reduce(function (n, x) { return n + x.quantity; }, 0) + ' items · <span class="tc-chip">' + ctx.escape(o.state) + '</span></small></span></span><span class="tc-leader" aria-hidden="true"></span><span class="tc-row-v">' + ctx.money(o.total) + "</span></a>"; }).join("") + "</div>" : '<div class="tc-card"><p>No orders yet. Orders you place in this session will show up here.</p>' + btn("/shop", "Shop all seven") + "</div>");
    return '<div class="tc-page tc-account">' + (sm ? sample("Synthetic account data. No sign-in, address or case exists.") : "") + head(ctx, "Account", guest ? "Your account." : "Welcome back.", guest ? c.lede : "Signed in with mobile ending " + ctx.escape(sm ? "0000" : ctx.user.mobile.slice(-4)) + ".") + login + '<div class="tc-wrap">' + tabs + body + "</div></div>";
  }

  /* ---------- Help & contact ---------- */
  function help(ctx) {
    var c = S.copy.help;
    return '<div class="tc-page tc-help">' + head(ctx, "Help centre", "How can we help?", c.lede) +
      '<div class="tc-wrap"><div class="tc-help-grid">' + c.topics.map(function (t, i) { var p = pick(ctx, i); return '<a class="tc-help-tile' + (t[0] === "safety" ? " is-safety" : "") + '" id="' + t[0] + '" href="' + t[3] + '" style="' + ctx.capStyle(p) + '">' + (t[0] === "safety" ? inkCap(44) : capOf(ctx, p, 44)) + '<strong class="tc-d">' + t[1] + "</strong><span>" + t[2] + '</span><span class="tc-go">' + t[4] + " →</span></a>"; }).join("") + "</div>" +
      c.topics.filter(function (t) { return c.faqs.some(function (f) { return f[0] === t[0]; }); }).map(function (t) { return '<section class="tc-faq"><h2 class="tc-d tc-h3">' + t[1] + "</h2>" + c.faqs.filter(function (f) { return f[0] === t[0]; }).map(function (f) { return "<details><summary><span>" + f[1] + '</span><span class="tc-plus" aria-hidden="true">+</span></summary><p>' + f[2] + "</p></details>"; }).join("") + "</section>"; }).join("") + "</div>" +
      '<section class="tc-band tc-ink-band"><div class="tc-band-in tc-help-cta"><div>' + kick("Still stuck?", "is-on") + disp("Open a case. Keep one record.", "h2", "tc-h2") + '<p class="tc-band-p">' + S.copy.contact.lede + '</p></div><div class="tc-actions">' + btn("/contact", "Contact support", "is-light") + tlink("/contact?kind=safety", "Report a product safety issue") + "</div></div></section></div>";
  }
  function contact(ctx, fx) {
    var c = S.copy.contact;
    if (fx === "unavailable" || (!fx && ctx.staticPreview)) return unavailable(ctx, "/contact");
    var sm = !!fx;
    var right = fx === "submitted" ? '<div class="report-result case-created tc-created" role="status"><p class="tc-tile-k">Case created · sample</p><p class="tc-d tc-h2">SAMPLE-CASE-01</p><p>This is how a confirmation looks. In this design state, nothing was saved or sent.</p>' + tlink("/account/cases?state=sample", "Follow your case") + "</div>" : ctx.forms.caseForm(ctx.query.get("order") || "", ctx.query.get("kind") || "general", sm, fx === "errors" ? { message: "Tell us a little more: at least 10 characters." } : null);
    return '<div class="tc-page tc-contact">' + (sm ? sample("Visual state only. Nothing is sent or saved.") : "") + head(ctx, "Contact", "Talk to a person.", c.lede) +
      '<div class="tc-wrap tc-co-grid"><div><h2 class="tc-d tc-h3">Ways to reach us</h2><div class="tc-rows">' + c.channels.map(function (ch, i) { return row(capOf(ctx, pick(ctx, i * 2), 22) + "<strong>" + ch[0] + "</strong>", '<span class="tc-chip">' + ch[1] + "</span>"); }).join("") + '</div><div class="tc-card is-warn"><p class="tc-tile-k">Product issue?</p><p>' + c.safety + '</p></div><p class="tc-small">' + c.privacy + '</p></div><section class="tc-card">' + right + "</section></div></div>";
  }

  /* ---------- Policies ---------- */
  function policy(ctx, kind) {
    var p = S.policies[kind];
    if (!p) return notFound(ctx);
    var cls = { "working-direction": "is-plan", unresolved: "is-warn", "preview-behaviour": "is-done" };
    return '<div class="tc-page tc-policy">' + head(ctx, "Policy draft · not final terms", p.title + ".", p.plain) + '<div class="tc-wrap tc-pol-grid"><nav class="tc-pol-nav" aria-label="Policies"><p class="tc-tile-k">All policies</p>' + S.policyOrder.map(function (k, i) { return '<a href="/policies/' + k + '"' + (k === kind ? ' aria-current="page"' : "") + '><span class="tc-n">0' + (i + 1) + "</span>" + S.policies[k].title + "</a>"; }).join("") + '</nav><div class="tc-pol-body">' + p.sections.map(function (s) { var k = s[2].toLowerCase().replace(/\s+/g, "-"); return '<section class="tc-pol-sec"><p class="tc-chip ' + (cls[k] || "") + '">' + s[2] + '</p><h2 class="tc-d tc-h3">' + s[0] + "</h2><p>" + s[1] + "</p></section>"; }).join("") + '<p class="tc-small">These are working drafts for review, not final terms for a live store. Anything marked unresolved hasn\'t been decided.</p><div class="tc-next">' + tlink("/help", "Help centre") + tlink("/contact", "Ask a question") + "</div></div></div></div>";
  }
  function settings(ctx) {
    var c = S.copy.settings;
    return '<div class="tc-page tc-settings">' + head(ctx, "Preferences", "Your choices.", c.lede) + '<div class="tc-wrap tc-narrow"><section class="tc-card">' + ctx.forms.preferences(c.groups) + '</section><p class="tc-small">Read the <a href="/policies/privacy">privacy draft</a> for what the preview stores.</p></div></div>';
  }
  function notFound(ctx) {
    var c = S.copy.notFound;
    return '<div class="tc-page"><section class="tc-empty is-page is-404"><p class="tc-d tc-404" aria-hidden="true">4' + inkCap(140) + "4</p>" + disp(c[0] + ".", "h1", "tc-h1") + "<p>" + c[1] + '</p><div class="tc-actions">' + btn("/shop", "Shop all seven") + tlink("/learn", "Learn") + tlink("/help", "Help centre") + "</div></section></div>";
  }
  function unavailable(ctx, path) {
    var map = { checkout: "Checkout", payment: "Payment", orders: "Order", account: "Account", contact: "Contact" };
    var st = (S.states.find(function (s) { return s[0] === map[path.split("/")[1]]; }) || [0, []])[1];
    return '<div class="tc-page"><section class="tc-empty is-page">' + inkCap(64) + '<h1 class="tc-d tc-h1">Not on this preview.</h1><p>You can browse all four designs, look at every product and try the sample bag and lot lookup. Ordering, sign-in and support submissions aren\'t enabled on this shared preview, and nothing you type is collected.</p></section><div class="tc-wrap">' + kick("Designed states instead") + '<div class="tc-rows is-links">' + st.map(function (s) { return '<a class="tc-row" href="' + s[0] + '"><span class="tc-row-l">' + s[1] + '</span><span class="tc-leader" aria-hidden="true"></span><span class="tc-row-v">Synthetic fixture</span></a>'; }).join("") + '</div><div class="tc-next">' + btn("/shop", "Continue shopping") + tlink("/preview/states", "All design states") + "</div></div></div>";
  }
  function states(ctx) {
    return '<div class="tc-page">' + head(ctx, "Design states", "Every state, on one board.", "Synthetic fixtures for reviewing transactional and edge states. None creates an order, payment, message or account record.") + '<div class="tc-wrap">' + S.states.map(function (g) { return '<section class="tc-faq"><h2 class="tc-d tc-h3">' + g[0] + '</h2><div class="tc-rows is-links">' + g[1].map(function (s) { return '<a class="tc-row" href="' + s[0] + '"><span class="tc-row-l">' + s[1] + '</span><span class="tc-leader" aria-hidden="true"></span><span class="tc-row-v">' + s[0] + "</span></a>"; }).join("") + "</div></section>"; }).join("") + "</div></div>";
  }
  function learnOffline() { return '<div class="tc-page"><section class="tc-empty is-page"><h1 class="tc-d tc-h1">Learn is offline.</h1><p>The ingredient library isn\'t published right now.</p>' + btn("/shop", "Shop all seven") + "</section></div>"; }

  /* C keeps the existing storefront homepage (the original "Pick a cap" direction); everything else is designed here. */
  S.themes.c = { chrome: chrome, shop: shop, bundles: bundles, search: search, standards: standards, story: story, learn: learn, reports: reports, cart: cart, checkout: checkout, payment: payment, order: order, account: account, help: help, contact: contact, policy: policy, settings: settings, notFound: notFound, unavailable: unavailable, states: states, learnOffline: learnOffline };
})();
