/* Body Café Co. — Direction A, Warm editorial: the complete site.
   Grammar: warm ivory paper, product photography, numbered editorial spreads ("01 — …"), a heading-left / content-right
   reading rhythm, hairline rules, olive emphasis, footnote-style annotations and calm square controls.
   Content comes from BCCSite; behaviour (ids, data-* actions) from app.js. Nothing here saves or fetches data. */
(function () {
  "use strict";
  var S = window.BCCSite;

  /* ---------- Small helpers ---------- */
  function eyebrow(t) { return '<p class="ta-eyebrow">' + t + "</p>"; }
  function title(a, b, tag) { tag = tag || "h1"; return "<" + tag + ' class="ta-title">' + a + (b ? "<br><em>" + b + "</em>" : "") + "</" + tag + ">"; }
  function arrow() { return '<span aria-hidden="true">↗</span>'; }
  function tlink(href, label, cls) { return '<a class="ta-link ' + (cls || "") + '" href="' + href + '">' + label + " " + arrow() + "</a>"; }
  function btn(href, label) { return '<a class="ta-btn" href="' + href + '"><span>' + label + "</span>" + arrow() + "</a>"; }
  function photo(p, lazy) { return '<img src="/concepts/media/' + p.id + '.webp" alt="' + p.name.replace(/"/g, "&quot;") + ' bottle, front-of-pack design mockup" width="1196" height="1315" ' + (lazy === false ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async">'; }
  function no(ctx, p) { var i = ctx.catalog.indexOf(p) + 1; return (i < 10 ? "0" : "") + i; }
  function masthead(kicker, a, b, lede, aside) {
    return '<header class="ta-mast">' + '<div class="ta-mast-main">' + eyebrow(kicker) + title(a, b) + (lede ? '<p class="ta-lede">' + lede + "</p>" : "") + "</div>" + (aside ? '<div class="ta-mast-aside">' + aside + "</div>" : "") + "</header>";
  }
  function sampleBanner(text) { return '<p class="ta-sample" role="note"><strong>Sample state.</strong> ' + text + "</p>"; }
  function addBtn(ctx, p) {
    var off = !p.stock || !p.published;
    return '<button type="button" class="ta-add" data-add="' + p.id + '" aria-label="Add ' + ctx.escape(p.name) + ' to bag"' + (off ? " disabled" : "") + "><span>" + (off ? "Unavailable" : "Add to bag") + "</span>" + ctx.icon("plus") + "</button>";
  }
  function card(ctx, p, big) {
    return '<article class="ta-card' + (big ? " is-big" : "") + '" style="' + ctx.capStyle(p) + '"><a class="ta-card-photo" href="/products/' + p.id + '">' + photo(p) + '<span class="ta-card-no" aria-hidden="true">' + no(ctx, p) + '</span><span class="ta-card-arrow" aria-hidden="true">↗</span><span class="sr-only">' + ctx.escape(p.name) + '</span></a><div class="ta-card-meta"><span class="ta-sku" aria-hidden="true"></span><h3><a href="/products/' + p.id + '">' + ctx.escape(p.name) + '</a></h3><p class="ta-card-sub">' + ctx.escape(p.subtitle) + '</p><p class="ta-card-facts"><span>' + ctx.escape(ctx.format[p.id] || "") + "</span><span>" + ctx.escape(p.ingredients.split(";")[0]) + '</span></p><div class="ta-card-foot"><p class="ta-price">' + ctx.money(p.price) + " <small>Sample price</small></p>" + addBtn(ctx, p) + "</div></div></article>";
  }
  function lines(items) { return '<div class="ta-lines">' + items.map(function (it, i) { return '<div><span class="ta-num">' + (i < 9 ? "0" : "") + (i + 1) + "</span><div><h3>" + it[0] + "</h3><p>" + it[1] + "</p></div></div>"; }).join("") + "</div>"; }
  function dash(list) { return '<ul class="ta-dash">' + list.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>"; }
  function spread(id, kicker, a, b, body, extraCls) {
    return '<section class="ta-spread ' + (extraCls || "") + '"' + (id ? ' id="' + id + '"' : "") + ' aria-labelledby="' + (id || kicker.replace(/\W+/g, "")) + '-t"><div class="ta-spread-head">' + eyebrow(kicker) + '<h2 class="ta-title" id="' + (id || kicker.replace(/\W+/g, "")) + '-t">' + a + (b ? "<br><em>" + b + "</em>" : "") + "</h2></div><div class=\"ta-spread-body\">" + body + "</div></section>";
  }
  function crumbs(list) { return '<nav class="ta-crumbs" aria-label="Breadcrumb"><ol>' + list.map(function (c, i) { return "<li>" + (i < list.length - 1 ? '<a href="' + c[0] + '">' + c[1] + "</a>" : '<span aria-current="page">' + c[1] + "</span>") + "</li>"; }).join("") + "</ol></nav>"; }

  /* ---------- Chrome ---------- */
  function chrome(ctx, content) {
    var path = ctx.path;
    var cur = function (h) { return path === h || path.indexOf(h + "/") === 0 ? ' aria-current="page"' : ""; };
    var nav = [["/shop", "Shop"], ["/standards", "Standards"], ["/about", "About"], ["/learn", "Learn"], ["/story", "Story"]];
    var mobile = nav.concat([["/reports", "Lot report"], ["/search", "Search"]]);
    return (
      '<header class="site-header ta-header"><a class="logo" href="/" aria-label="Body Café Co. home"><img src="/web/media/logo.svg" alt="" width="465" height="451"></a>' +
      '<nav class="main-nav ta-nav" aria-label="Main">' + nav.map(function (n) { return '<a href="' + n[0] + '"' + cur(n[0]) + ">" + n[1] + "</a>"; }).join("") + "</nav>" +
      '<div class="header-tools ta-tools"><a class="ta-lotlink" href="/reports"' + cur("/reports") + '>Lot report <span aria-hidden="true">↗</span></a>' +
      '<button class="icon-button" data-action="search" aria-label="Search">' + ctx.icon("search") + '</button><a class="icon-button" href="/account" aria-label="Your account">' + ctx.icon("user") + "</a>" +
      '<a class="bag-link ta-bag" href="/cart" aria-label="Cart, ' + ctx.count + ' items">' + ctx.icon("bag") + '<span data-cart-count' + (ctx.count ? "" : " data-empty") + ">" + ctx.count + "</span></a>" +
      '<button class="menu-button ta-menu" data-action="menu" aria-expanded="false" aria-controls="mobile-nav"><span>Menu</span></button></div></header>' +
      '<nav id="mobile-nav" class="ta-mnav" hidden aria-label="Mobile"><ol class="mobile-nav-links">' + mobile.map(function (n, i) { return '<li><a href="' + n[0] + '"><span>0' + (i + 1) + "</span>" + n[1] + "</a></li>"; }).join("") + '</ol><div class="mobile-nav-foot"><a href="/account">Account</a><a href="/cart">Cart (<span data-cart-count>' + ctx.count + '</span>)</a></div></nav>' +
      '<main id="main" tabindex="-1" class="ta-main">' + content + "</main>" +
      '<footer class="site-footer ta-footer"><div class="ta-foot-top"><div class="ta-foot-pitch"><img src="/web/media/logo.svg" alt="Body Café Co." width="465" height="451" class="ta-foot-logo"><p>Good questions.<br>Clear intentions.</p><a class="ta-link" href="/shop">The collection ' + arrow() + "</a></div>" +
      '<div class="ta-foot-cols"><div><h2>Shop</h2><a href="/shop">All seven</a><a href="/bundles">The edits</a><a href="/reports">Lot reports</a><a href="/search">Search</a></div><div><h2>Read</h2><a href="/standards">Our standards</a><a href="/learn">Learn</a><a href="/story">Our story</a></div><div><h2>Help</h2><a href="/help">Help centre</a><a href="/contact">Contact</a><a href="/account">Your account</a><a href="/settings">Preferences</a></div><div><h2>Policies</h2>' + S.policyOrder.map(function (k) { return '<a href="/policies/' + k + '">' + S.policies[k].title + "</a>"; }).join("") + "</div></div></div>" +
      '<p class="ta-foot-word" aria-hidden="true">Body Café Co.</p><div class="ta-foot-bottom"><span>© ' + new Date().getFullYear() + " Body Café Co.</span><span>Draft copy · preview commerce · sample prices</span><a href=\"/preview/states\">Design states</a></div></footer>"
    );
  }

  /* ---------- Home ---------- */
  function home(ctx) {
    var H = window.BCCHome;
    var list = ctx.published;
    var d3 = ctx.product("vitamin-d3-k2") || list[0];
    var th = ctx.product("l-theanine") || list[1];
    return (
      '<section class="ta-hero" aria-labelledby="ta-hero-t"><div class="ta-hero-copy">' + '<p class="ta-eyebrow"><span class="ta-sun" aria-hidden="true">✳</span> A little more knowing. Every day.</p>' +
      '<h1 id="ta-hero-t" class="ta-title ta-hero-title">Good things.<br>Clear intentions.<br><em>Your everyday.</em></h1>' +
      '<p class="ta-lede">Seven everyday supplements. Clear product details, and a place to find the record for your lot.</p>' +
      '<div class="ta-actions">' + btn("/shop", "Explore all seven") + tlink("/standards", "Read our standards") + "</div>" +
      '<div class="ta-hero-foot"><span>Body Café Co.</span><span>Made for the curious.</span></div></div>' +
      '<div class="ta-hero-art">' + (d3 ? '<a class="ta-hero-main" href="/products/' + d3.id + '">' + photo(d3, false) + '<span class="sr-only">' + ctx.escape(d3.name) + "</span></a>" : "") +
      (th ? '<a class="ta-hero-float" href="/products/' + th.id + '">' + photo(th) + '<span>Small habits.<br>Room to grow.</span><span class="sr-only">' + ctx.escape(th.name) + "</span></a>" : "") +
      '<p class="ta-stamp" aria-hidden="true">A curious mind<br><b>✳</b><br>A clearer choice</p>' +
      '<p class="ta-hero-caption"><span>01 / The everyday collection</span><span>Front-of-pack design mockups</span></p></div></section>' +
      (H ? H.strip() : "") +
      '<section id="shop" class="ta-collection" aria-labelledby="ta-coll-t"><div class="ta-section-head">' + eyebrow("01 — Meet the collection") + '<h2 id="ta-coll-t" class="ta-title">Find your<br><em>everyday thing.</em></h2><div class="ta-head-aside"><p>Different essentials. The same clear approach.</p><small>Seven products · one-time purchases</small></div></div>' +
      '<div class="ta-coll-bar"><p>Take a closer look at what\'s inside.</p><span>01—07</span></div><div class="ta-grid">' + list.map(function (p) { return card(ctx, p); }).join("") + "</div>" +
      '<p class="ta-note">Sample prices. Serving quantities and full label information will appear after content approval.</p></section>' +
      (H ? H.evidence() + H.voices() : "") +
      '<div class="ta-home-lot">' + ctx.homeLot() + "</div>" +
      (H ? H.story() + H.learn() + H.care() : "")
    );
  }

  /* ---------- Shop ---------- */
  function shop(ctx) {
    var c = S.copy.shop;
    var sel = ctx.query.get("format") || "all";
    var all = ctx.published;
    var list = all.filter(function (p) { return sel === "all" || ctx.format[p.id] === sel; });
    var formats = ["all", "Capsules", "Softgels", "Chewable tablets"];
    var tabs = '<nav class="ta-filter" aria-label="Filter by format">' + formats.map(function (f) {
      var n = all.filter(function (p) { return f === "all" || ctx.format[p.id] === f; }).length;
      return '<a href="/shop' + (f === "all" ? "" : "?format=" + encodeURIComponent(f)) + '"' + (f === sel ? ' aria-current="page"' : "") + ">" + (f === "all" ? "All" : f) + " <sup>" + n + "</sup></a>";
    }).join("") + "</nav>";
    var lead = sel === "all" && list.length > 2;
    return (
      '<div class="ta-page ta-shop">' + masthead("The everyday collection · " + all.length + " products", "Find your", "everyday thing.", c.lede, '<p class="ta-aside-title">' + c.guidanceTitle + "</p>" + lines(c.guidance)) +
      '<div class="ta-shop-bar">' + tabs + '<p class="ta-count" role="status">' + list.length + " product" + (list.length === 1 ? "" : "s") + (sel !== "all" ? " · " + ctx.escape(sel) : "") + "</p></div>" +
      (list.length
        ? '<div class="ta-grid' + (lead ? " has-lead" : "") + '">' + list.map(function (p, i) { return card(ctx, p, lead && i < 2); }).join("") + "</div>"
        : '<div class="ta-empty"><p class="ta-eyebrow">No match</p><h2 class="ta-title">' + c.noMatch[0] + "</h2><p>" + c.noMatch[1] + "</p>" + btn("/shop", "Show all seven") + "</div>") +
      '<p class="ta-footnote"><sup>*</sup> ' + c.care + "</p>" +
      spread("compare", "At a glance", "The seven,", "side by side.", '<div class="ta-table-wrap"><table class="ta-table"><caption class="sr-only">' + c.compareTitle + '</caption><thead><tr><th scope="col">Product</th><th scope="col">Ingredient in view</th><th scope="col">Format</th><th scope="col">Serving &amp; pack</th><th scope="col">Sample price</th></tr></thead><tbody>' +
        all.map(function (p) { return '<tr style="' + ctx.capStyle(p) + '"><th scope="row"><a href="/products/' + p.id + '"><span class="ta-sku" aria-hidden="true"></span>' + ctx.escape(p.name) + "</a></th><td>" + ctx.escape(p.ingredients.split(";")[0]) + "</td><td>" + ctx.escape(ctx.format[p.id]) + '</td><td class="is-pending">' + S.STATUS.label + "</td><td>" + ctx.money(p.price) + "</td></tr>"; }).join("") +
        '</tbody></table></div><p class="ta-small">' + c.compareNote + "</p>") +
      "</div>"
    );
  }

  /* ---------- Bundles ---------- */
  function bundles(ctx, id) {
    var c = S.copy.bundles;
    var B = ctx.state.bundles;
    var b = B.find(function (x) { return x.id === id; });
    if (id && !b) return notFound(ctx);
    if (!b) {
      return '<div class="ta-page">' + masthead("The edits · examples for browsing", "Two labels.", "One page.", c.lede, '<p class="ta-annot"><strong>Status —</strong> ' + c.status + "</p>") +
        '<div class="ta-edits">' + B.map(function (x, i) {
          var items = x.items.map(ctx.product).filter(Boolean);
          var sum = items.reduce(function (n, p) { return n + p.price; }, 0);
          return '<article class="ta-edit"><a class="ta-edit-photos" href="/bundles/' + x.id + '">' + items.map(function (p) { return photo(p); }).join("") + '<span class="sr-only">' + ctx.escape(x.name) + '</span></a><div class="ta-edit-copy">' + eyebrow("Edit 0" + (i + 1)) + '<h2 class="ta-title ta-title-sm"><a href="/bundles/' + x.id + '">' + ctx.escape(x.name) + "</a></h2><p>" + ctx.escape(x.description) + "</p>" + '<ul class="ta-itemlines">' + items.map(function (p) { return '<li style="' + ctx.capStyle(p) + '"><span class="ta-sku" aria-hidden="true"></span>' + ctx.escape(p.name) + "<span>" + ctx.money(p.price) + "</span></li>"; }).join("") + '<li class="is-total">Sample total<span>' + ctx.money(sum) + "</span></li></ul>" + tlink("/bundles/" + x.id, "See this edit") + "</div></article>";
        }).join("") + "</div>" + spread("", "Why edits exist", "A shortcut,", "not a regimen.", lines(c.why)) + "</div>";
    }
    var items = b.items.map(ctx.product).filter(Boolean);
    var sum = items.reduce(function (n, p) { return n + p.price; }, 0);
    return '<div class="ta-page">' + '<div class="ta-topline">' + crumbs([["/", "Home"], ["/bundles", "The edits"], ["", ctx.escape(b.name)]]) + "</div>" +
      '<section class="ta-bundle"><div class="ta-bundle-photos">' + items.map(function (p) { return '<a href="/products/' + p.id + '">' + photo(p) + '<span class="sr-only">' + ctx.escape(p.name) + "</span></a>"; }).join("") + "</div>" +
      '<div class="ta-bundle-copy">' + eyebrow("An edit · example pairing") + '<h1 class="ta-title">' + ctx.escape(b.name) + '</h1><p class="ta-lede">' + ctx.escape(b.description) + "</p>" +
      '<h2 class="ta-subhead">In this edit</h2><ul class="ta-itemlines is-big">' + items.map(function (p) { return '<li style="' + ctx.capStyle(p) + '"><span class="ta-sku" aria-hidden="true"></span><a href="/products/' + p.id + '">' + ctx.escape(p.name) + "</a><small>" + ctx.escape(ctx.format[p.id]) + "</small><span>" + ctx.money(p.price) + "</span></li>"; }).join("") + '<li class="is-total">Sample total, no discount<span>' + ctx.money(sum) + "</span></li></ul>" +
      '<button class="ta-btn ta-btn-full" data-bundle="' + b.id + '"><span>Add both to bag</span>' + ctx.icon("plus") + "</button>" +
      '<p class="ta-annot"><strong>Status —</strong> ' + c.status + "</p></div></section></div>";
  }

  /* ---------- Search ---------- */
  function search(ctx) {
    var c = S.copy.search;
    var q = ctx.query.get("q") || "";
    var ql = q.toLowerCase().trim();
    var prods = ctx.catalog.filter(function (p) { return ql && (p.name + " " + p.ingredients + " " + ctx.format[p.id] + " " + p.subtitle).toLowerCase().indexOf(ql) >= 0; });
    var gs = S.guideMatches(q);
    var notesHit = ctx.catalog.filter(function (p) { return ql && S.notes[p.id] && (p.name + " " + S.notes[p.id].lead).toLowerCase().indexOf(ql) >= 0; });
    var report = /report|lot|test|proof|batch/i.test(q);
    var total = prods.length + gs.length + notesHit.length;
    var sugg = '<p class="ta-suggest">Try: ' + c.hints.map(function (h) { return '<a href="/search?q=' + encodeURIComponent(h) + '">' + h + "</a>"; }).join(" · ") + "</p>";
    return '<div class="ta-page ta-search">' + masthead("Search", "What are you", "looking for?", c.lede) +
      '<div class="ta-searchbox">' + ctx.forms.search(q) + sugg + "</div>" +
      (q ? '<p class="ta-count" role="status">' + total + " result" + (total === 1 ? "" : "s") + " for “" + ctx.escape(q) + "”</p>" : "") +
      (report ? '<div class="ta-annot ta-annot-box"><strong>Looking for a lot record?</strong> Lot reports have their own lookup. ' + tlink("/reports", "Find your lot report") + "</div>" : "") +
      (prods.length ? '<section class="ta-results"><h2 class="ta-subhead">Products <sup>' + prods.length + '</sup></h2><ol class="ta-rows">' + prods.map(function (p) { return '<li style="' + ctx.capStyle(p) + '"><a href="/products/' + p.id + '">' + photo(p) + '<span class="ta-row-main"><strong>' + ctx.escape(p.name) + "</strong><small>" + ctx.escape(p.ingredients.split(";")[0]) + " · " + ctx.escape(ctx.format[p.id]) + '</small></span><span class="ta-row-end">' + ctx.money(p.price) + "</span></a></li>"; }).join("") + "</ol></section>" : "") +
      (gs.length || notesHit.length ? '<section class="ta-results"><h2 class="ta-subhead">Reading <sup>' + (gs.length + notesHit.length) + '</sup></h2><ol class="ta-rows is-text">' + gs.map(function (g) { return '<li><a href="' + g[0] + '"><span class="ta-row-main"><strong>' + g[1] + "</strong><small>" + g[2] + '</small></span><span class="ta-row-end">Guide</span></a></li>'; }).join("") + notesHit.map(function (p) { return '<li><a href="/learn/' + p.id + '"><span class="ta-row-main"><strong>' + ctx.escape(p.name) + "</strong><small>" + S.notes[p.id].lead + '</small></span><span class="ta-row-end">Ingredient note</span></a></li>'; }).join("") + "</ol></section>" : "") +
      (q && !total ? '<div class="ta-empty"><p class="ta-eyebrow">No results</p><h2 class="ta-title">Nothing for “' + ctx.escape(q) + '”.</h2><p>' + c.noResults + "</p>" + btn("/shop", "Browse all seven") + "</div>" : "") +
      (!q ? '<section class="ta-results"><h2 class="ta-subhead">Browse the collection</h2><ol class="ta-rows">' + ctx.published.map(function (p) { return '<li style="' + ctx.capStyle(p) + '"><a href="/products/' + p.id + '">' + photo(p) + '<span class="ta-row-main"><strong>' + ctx.escape(p.name) + "</strong><small>" + ctx.escape(ctx.format[p.id]) + '</small></span><span class="ta-row-end">' + ctx.money(p.price) + "</span></a></li>"; }).join("") + "</ol></section>" : "") +
      "</div>";
  }

  /* ---------- Standards ---------- */
  function standards(ctx) {
    var c = S.copy.standards;
    var trio = ["omega-3-fish-oil", "iron-bisglycinate", "l-theanine"].map(ctx.product).filter(Boolean);
    return '<div class="ta-page ta-essay">' + masthead("Our standards", "The detail", "behind the bottle.", c.lede) +
      '<figure class="ta-triptych">' + trio.map(function (p) { return photo(p); }).join("") + "<figcaption>Front-of-pack design mockups. The label on the back is what this page is about.</figcaption></figure>" +
      '<p class="ta-intro ta-dropcap">' + c.intro + "</p>" +
      '<nav class="ta-toc" aria-label="On this page"><p class="ta-eyebrow">In this essay</p><ol>' + c.pillars.map(function (p, i) { return '<li><a href="#' + p.id + '"><span>0' + (i + 1) + "</span>" + p.title + "</a></li>"; }).join("") + '<li><a href="#ledger"><span>06</span>Documented, planned, ruled out</a></li></ol></nav>' +
      c.pillars.map(function (p, i) {
        return '<section class="ta-spread ta-pillar" id="' + p.id + '" aria-labelledby="' + p.id + '-t"><div class="ta-spread-head">' + eyebrow("0" + (i + 1) + " — " + p.summary) + '<h2 class="ta-title ta-title-md" id="' + p.id + '-t">' + p.title + '</h2></div><div class="ta-spread-body"><p class="ta-body-lg">' + p.body + "</p>" + dash(p.points) + '<aside class="ta-margin"><p class="ta-eyebrow">Where it stands today</p><p>' + p.now + "</p></aside></div></section>";
      }).join("") +
      '<section class="ta-ledger" id="ledger" aria-labelledby="ledger-t">' + eyebrow("06 — The honest ledger") + '<h2 class="ta-title" id="ledger-t">Documented now.<br><em>Still to come.</em></h2><div class="ta-ledger-cols"><div><h3>Documented now</h3>' + dash(c.documented) + "</div><div><h3>Planned before launch</h3>" + dash(c.planned) + "</div><div><h3>What we won't do</h3>" + dash(c.wont) + "</div></div></section>" +
      '<section class="ta-next"><p class="ta-eyebrow">Keep reading</p><div class="ta-next-row">' + tlink("/reports", "Try a lot lookup") + tlink("/learn/understanding-reports", "What a lot report shows") + tlink("/learn/reading-a-label", "Read a label with confidence") + "</div></section></div>";
  }

  /* ---------- Story ---------- */
  function story(ctx) {
    var c = S.copy.story;
    var shelf = ctx.published;
    return '<div class="ta-page ta-essay ta-story">' + masthead("Our story", "Make room for", "understanding.", c.lede) +
      '<figure class="ta-shelf">' + shelf.map(function (p) { return photo(p); }).join("") + "<figcaption>Seven on the counter, each with its own cap colour.</figcaption></figure>" +
      '<p class="ta-intro ta-dropcap">' + c.opening + "</p>" +
      c.chapters.map(function (ch, i) {
        return '<section class="ta-spread ta-chapter' + (i % 2 ? " is-flip" : "") + '"><div class="ta-spread-head">' + eyebrow("Chapter 0" + (i + 1)) + '<h2 class="ta-title ta-title-md">' + ch.title + '</h2></div><div class="ta-spread-body"><p class="ta-body-lg">' + ch.body + "</p></div></section>";
      }).join("") +
      '<blockquote class="ta-pull"><p>“If something isn\'t confirmed yet, we say so plainly instead of filling the gap with a claim.”</p></blockquote>' +
      spread("promises", "What you can hold us to", "Four promises.", "Three refusals.", lines(c.promises) + '<h3 class="ta-subhead">We won\'t</h3>' + dash(c.wont)) +
      '<section class="ta-people" aria-labelledby="people-t"><div class="ta-portrait" role="img" aria-label="Space reserved for a founder portrait, not yet supplied"><span>Founder portrait</span><small>To be supplied</small></div><div>' + eyebrow("The people behind it") + '<h2 class="ta-title ta-title-md" id="people-t">In their own words,<br><em>soon.</em></h2><p class="ta-body-lg">' + c.people + '</p><p class="ta-eyebrow">Waiting on</p>' + dash(c.peopleNeeds) + "</div></section>" +
      '<section class="ta-next"><p class="ta-eyebrow">Keep reading</p><div class="ta-next-row">' + tlink("/standards", "Our standards") + tlink("/shop", "Meet the seven") + tlink("/learn", "Learn") + "</div></section></div>";
  }

  /* ---------- Learn ---------- */
  function learn(ctx, slug) {
    if (slug && S.guides[slug]) return guide(ctx, slug);
    if (slug && ctx.product(slug)) return note(ctx, ctx.product(slug));
    if (slug) return notFound(ctx);
    var c = S.copy.learn;
    var order = S.guideOrder;
    var g0 = S.guides[order[0]];
    return '<div class="ta-page ta-learn">' + masthead("Learn · the reading room", "Read the label,", "then the lot.", c.lede, '<p class="ta-aside-title">Topics</p><ol class="ta-topics">' + c.topics.map(function (t, i) { return '<li><a href="#' + t[0] + '"><span>0' + (i + 1) + "</span>" + t[1] + "</a><small>" + t[2] + "</small></li>"; }).join("") + "</ol>") +
      '<p class="ta-intro">' + c.intro + "</p>" +
      '<section class="ta-features" aria-label="Guides"><a class="ta-feature is-lead" id="labels" href="/learn/' + order[0] + '"><span class="ta-eyebrow">Field notes / 01 · Labels · ' + S.minutes(g0) + ' min read</span><strong class="ta-title ta-title-md">' + g0.title + "</strong><p>" + g0.opening + '</p><span class="ta-link">Read the guide ' + arrow() + "</span></a>" +
      order.slice(1).map(function (s, i) { var g = S.guides[s]; return '<a class="ta-feature" id="' + g.topic + '" href="/learn/' + s + '"><span class="ta-eyebrow">Field notes / 0' + (i + 2) + " · " + (g.topic === "evidence" ? "Evidence" : "Ingredient forms") + " · " + S.minutes(g) + ' min read</span><strong class="ta-title ta-title-sm">' + g.title + "</strong><p>" + g.summary + '</p><span class="ta-link">Read the guide ' + arrow() + "</span></a>"; }).join("") + "</section>" +
      '<section class="ta-notes" id="notes" aria-labelledby="notes-t"><div class="ta-section-head">' + eyebrow("Ingredient notes · all seven") + '<h2 class="ta-title" id="notes-t">What to check,<br><em>product by product.</em></h2></div><ol class="ta-note-list">' +
      ctx.catalog.map(function (p) { return '<li style="' + ctx.capStyle(p) + '"><a href="/learn/' + p.id + '">' + photo(p) + '<span class="ta-note-copy"><span class="ta-eyebrow">' + no(ctx, p) + " · " + ctx.escape(ctx.format[p.id]) + "</span><strong>" + ctx.escape(p.name) + "</strong><small>" + S.noteSummary(p.id) + '</small></span><span class="ta-card-arrow" aria-hidden="true">↗</span></a></li>'; }).join("") + "</ol></section>" +
      spread("glossary", "A short glossary", "Words worth", "knowing.", '<dl class="ta-gloss">' + c.glossary.map(function (g) { return "<div><dt>" + g[0] + "</dt><dd>" + g[1] + "</dd></div>"; }).join("") + "</dl>") +
      '<section class="ta-next"><p class="ta-eyebrow">Still have a question?</p><div class="ta-next-row">' + tlink("/help", "Help centre") + tlink("/contact", "Ask a person") + "</div></section></div>";
  }
  function guide(ctx, slug) {
    var g = S.guides[slug];
    var idx = S.guideOrder.indexOf(slug) + 1;
    return '<article class="ta-page ta-article">' + '<div class="ta-topline">' + crumbs([["/", "Home"], ["/learn", "Learn"], ["", g.title]]) + "</div>" +
      '<header class="ta-art-head">' + eyebrow("Field notes / 0" + idx + " · " + S.minutes(g) + " min read") + '<h1 class="ta-title">' + g.title + '</h1><p class="ta-lede">' + g.summary + "</p></header>" +
      '<div class="ta-art-grid"><aside class="ta-art-side"><nav aria-label="In this guide"><p class="ta-eyebrow">In this guide</p><ol>' + g.sections.map(function (s) { return '<li><a href="#' + s.id + '">' + s.h + "</a></li>"; }).join("") + '<li><a href="#checklist">Checklist</a></li></ol></nav></aside>' +
      '<div class="ta-art-body"><p class="ta-body-lg ta-opening">' + g.opening + '</p><div class="ta-takeaways"><p class="ta-eyebrow">The short version</p>' + dash(g.takeaways) + "</div>" +
      g.sections.map(function (s) { return '<section id="' + s.id + '"><h2>' + s.h + "</h2>" + s.html + "</section>"; }).join("") +
      '<figure class="ta-example"><figcaption><span class="ta-tag">Illustrative</span><strong>' + g.example.title + "</strong><small>" + g.example.note + '</small></figcaption><dl>' + g.example.rows.map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; }).join("") + "</dl><p>" + g.example.reading + "</p></figure>" +
      '<section id="checklist"><h2>Checklist</h2><ol class="ta-check">' + g.checklist.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol></section>" +
      (g.sources.length ? '<section class="ta-sources-wrap"><h2>Sources</h2>' + S.sourceList(g.sources, "ta-sources") + "</section>" : '<p class="ta-small">This guide explains how to read reports in general. It describes no specific laboratory, report or result.</p>') +
      '<p class="ta-small">Written as general information, not personal advice. No author or reviewer is credited until the guide has been reviewed.</p></div></div>' +
      '<section class="ta-next"><p class="ta-eyebrow">Read next</p><div class="ta-next-row">' + g.related.map(function (r) { return tlink("/learn/" + r, S.guides[r].title); }).join("") + tlink("/reports", "Find your lot report") + tlink("/shop", "See the collection") + "</div></section></article>";
  }
  function note(ctx, p) {
    var n = S.notes[p.id] || { lead: "", check: [], compound: "", sources: [] };
    var confirm = (window.BCCProductPage && window.BCCProductPage.toConfirm && window.BCCProductPage.toConfirm[p.id]) || [];
    var others = ctx.catalog.filter(function (x) { return x.id !== p.id; });
    return '<article class="ta-page ta-note" style="' + ctx.capStyle(p) + '">' + '<div class="ta-topline">' + crumbs([["/", "Home"], ["/learn", "Learn"], ["", ctx.escape(p.name)]]) + "</div>" +
      '<header class="ta-note-head"><figure>' + photo(p, false) + '<figcaption>Front-of-pack design mockup. Its printed wording is a draft, not the approved label.</figcaption></figure><div>' + eyebrow("Ingredient note · " + no(ctx, p) + " of " + ctx.catalog.length) + '<h1 class="ta-title">' + ctx.escape(p.name) + '</h1><p class="ta-lede">' + n.lead + '</p><p class="ta-inview"><span>In view now</span>' + ctx.escape(p.ingredients) + " · " + ctx.escape(ctx.format[p.id]) + "</p></div></header>" +
      spread("check", "What to check", "On this", "label.", lines(n.check) + (n.compound ? '<aside class="ta-margin"><p class="ta-eyebrow">A note on forms</p><p>' + n.compound + "</p></aside>" : "")) +
      spread("pending", "Waiting on our approved label", "Not confirmed", "yet.", '<p class="ta-body-lg">These details for our ' + ctx.escape(p.name) + " will be published from the approved rear label. Until then, the product page shows them as awaiting approval.</p>" + dash(confirm.concat(["Complete ingredient list, allergens, storage and manufacturer details"])) + '<p class="ta-small">' + S.CARE_NOTE + "</p>") +
      (n.sources.length ? '<section class="ta-sources-wrap ta-wrap"><h2 class="ta-subhead">Sources</h2>' + S.sourceList(n.sources, "ta-sources") + "</section>" : "") +
      '<section class="ta-next"><p class="ta-eyebrow">From here</p><div class="ta-next-row">' + tlink("/products/" + p.id, "View " + ctx.escape(p.name)) + tlink("/reports?product=" + p.id, "Look up a lot") + tlink("/learn/ingredient-forms", "Why ingredient forms matter") + '</div><p class="ta-eyebrow ta-mt">Other notes</p><div class="ta-chiprow">' + others.map(function (o) { return '<a href="/learn/' + o.id + '" style="' + ctx.capStyle(o) + '"><span class="ta-sku" aria-hidden="true"></span>' + ctx.escape(o.name) + "</a>"; }).join("") + "</div></section></article>";
  }

  /* ---------- Reports ---------- */
  function reports(ctx) {
    var c = S.copy.reports;
    var pid = ctx.product(ctx.query.get("product")) ? ctx.query.get("product") : "vitamin-d3-k2";
    var cur = ctx.product(pid);
    return '<div class="ta-page ta-reports report-page" style="' + (cur ? ctx.capStyle(cur) : "") + '">' +
      '<section class="ta-rep-grid"><div class="ta-rep-copy">' + eyebrow("Lot reports · from your bottle to the details") + '<h1 class="ta-title">Your lot.<br><em>Your closer look.</em></h1><p class="ta-lede">' + c.what + "</p>" + lines(c.steps) +
      '<p class="ta-annot"><strong>Where\'s my lot number? —</strong> ' + c.locationStatus + "</p></div>" +
      '<div class="ta-rep-card"><p class="ta-eyebrow ta-card-head">Find your lot report <span aria-hidden="true">↗</span></p><p class="ta-small">Choose your product</p>' + ctx.forms.productPicker(pid) + ctx.forms.reportForm(pid, ctx.query.get("lot")) + '<p class="ta-small">' + c.demo + "</p></div></section>" +
      spread("anatomy", "Anatomy of a report", "What a record", "should show.", '<dl class="ta-gloss is-numbered">' + c.hierarchy.map(function (h) { return "<div><dt>" + h[0] + "</dt><dd>" + h[1] + "</dd></div>"; }).join("") + '</dl><aside class="ta-margin"><p class="ta-eyebrow">Its limits</p>' + dash(c.limits) + "</aside>") +
      '<section class="ta-next"><p class="ta-eyebrow">Read more</p><div class="ta-next-row">' + tlink("/learn/understanding-reports", "What a lot report shows") + tlink("/standards#lot", "How packs link to lots") + tlink("/contact", "Ask about a lot") + "</div></section></div>";
  }

  /* ---------- Bag ---------- */
  function cart(ctx) {
    var c = S.copy.cart;
    var items = ctx.state.cart.map(function (i) { return { p: ctx.product(i.id), q: i.quantity }; }).filter(function (x) { return x.p; });
    if (!items.length) {
      return '<div class="ta-page ta-bag-page">' + masthead("Your bag", c.empty[0] + ".", "For now.", c.empty[1]) +
        '<div class="ta-grid is-three">' + ctx.published.slice(0, 3).map(function (p) { return card(ctx, p); }).join("") + "</div>" +
        '<section class="ta-next"><div class="ta-next-row">' + btn("/shop", "See all seven") + tlink("/bundles", "Browse the edits") + "</div></section></div>";
    }
    var sub = ctx.total;
    return '<div class="ta-page ta-bag-page">' + masthead("Your bag · " + ctx.count + " item" + (ctx.count === 1 ? "" : "s"), "Your bag.", "", c.note) +
      '<div class="ta-bag-grid"><ol class="ta-bag-lines">' + items.map(function (x) {
        var p = x.p;
        return '<li class="ta-bag-line" style="' + ctx.capStyle(p) + '"><a class="ta-bag-photo" href="/products/' + p.id + '">' + photo(p) + '<span class="sr-only">' + ctx.escape(p.name) + '</span></a><div class="ta-bag-info"><h2><a href="/products/' + p.id + '">' + ctx.escape(p.name) + "</a></h2><p>" + ctx.escape(ctx.format[p.id]) + " · " + ctx.money(p.price) + ' each, sample price</p><div class="ta-qty quantity-control"><button data-quantity="' + p.id + '" data-change="-1" aria-label="Decrease ' + ctx.escape(p.name) + ' quantity">−</button><span aria-label="Quantity">' + x.q + '</span><button data-quantity="' + p.id + '" data-change="1" aria-label="Increase ' + ctx.escape(p.name) + ' quantity">+</button></div><button class="ta-remove remove" data-remove="' + p.id + '">Remove</button></div><strong class="ta-bag-total">' + ctx.money(p.price * x.q) + "</strong></li>";
      }).join("") + "</ol>" +
      '<aside class="ta-summary"><p class="ta-eyebrow">Order summary</p><div class="sum-row"><span>Sample subtotal</span><strong>' + ctx.money(sub) + '</strong></div><div class="sum-row"><span>Delivery</span><span>Calculated at checkout</span></div><p class="ta-small">' + c.note + "</p>" + btn("/checkout", "Continue to checkout") + '<p class="ta-small">No money is collected.</p></aside></div>' +
      '<section class="ta-next"><p class="ta-eyebrow">Before you check out</p><div class="ta-next-row">' + c.next.map(function (n) { return tlink(n[0], n[1]); }).join("") + tlink("/shop", "Keep shopping") + "</div></section></div>";
  }

  /* ---------- Checkout ---------- */
  function checkout(ctx, fx) {
    var c = S.copy.checkout;
    if (fx === "unavailable" || (!fx && ctx.staticPreview)) return unavailable(ctx, "/checkout");
    var sample = fx === "sample" || fx === "errors";
    var items = sample ? [{ id: "vitamin-d3-k2", quantity: 1 }, { id: "omega-3-fish-oil", quantity: 2 }] : ctx.state.cart;
    if (!items.length) return '<div class="ta-page">' + masthead("Checkout", "Your bag is", "empty.", "Add a product before checking out.") + '<div class="ta-next-row ta-wrap">' + btn("/shop", "Shop all seven") + "</div></div>";
    var err = fx === "errors" ? { name: "Enter the name for the delivery.", mobile: "Enter a 10-digit mobile number starting with 6, 7, 8 or 9.", pincode: "Enter a 6-digit pincode that doesn't start with 0.", adult: "Please confirm the purchaser is 18 or older.", form: "Some details need attention before the order can be created." } : null;
    var vals = fx === "sample" ? S.fixtures.contact : fx === "errors" ? { address: S.fixtures.contact.address, city: "Bengaluru", state: "Karnataka", mobile: "12345", pincode: "012345" } : { mobile: (ctx.user && ctx.user.mobile) || "" };
    var sm = ctx.forms.summary(items, sample);
    return '<div class="ta-page ta-checkout">' + (sample ? sampleBanner("Synthetic details for reviewing the design. Every field is disabled and nothing can be submitted or saved.") : "") +
      masthead("Checkout · guest", "Almost yours.", "Nothing is charged.", c.lede) +
      '<div class="ta-co-grid"><form id="checkout-form" class="ta-co-form checkout-form"' + (sample ? ' aria-describedby="ta-sample-note"' : "") + ">" +
      '<section class="ta-co-step"><h2><span>I.</span> ' + c.steps[0] + "</h2>" + ctx.forms.delivery(vals, sample, err) + "</section>" +
      '<section class="ta-co-step"><h2><span>II.</span> ' + c.steps[1] + "</h2>" + ctx.forms.payment(sample) + "</section>" +
      '<section class="ta-co-step"><h2><span>III.</span> ' + c.steps[2] + "</h2>" + ctx.forms.confirm(sample, err) + '<p class="ta-small">' + c.privacy + "</p></section></form>" +
      '<aside class="ta-summary order-summary checkout-summary"><p class="ta-eyebrow">In your bag (' + sm.count + ")</p>" + sm.lines + sm.discount + sm.totals + '<p class="ta-small">Sample pricing only; no final GST calculation is shown.</p><div class="ta-after"><p class="ta-eyebrow">What happens next</p>' + lines(c.after) + "</div></aside></div></div>";
  }

  /* ---------- Payment ---------- */
  function payView(o, fx) {
    if (fx) return fx;
    if (!o) return "missing";
    if (o.state === "paid") return "paid";
    if (o.state === "pending") return o.expires < Date.now() / 1000 ? "expired" : "pending";
    return "inactive";
  }
  function payment(ctx, o, fx) {
    var v = payView(o, fx);
    if (v === "missing") return notFound(ctx);
    var sample = !!fx;
    var heads = {
      pending: ["Complete your", "payment.", "Try a success or a failure to see the order journey. Your items are held for 15 minutes."],
      failed: ["That payment", "didn't go through.", "No money moved. Your items are still held, so you can try again before the reservation ends."],
      paid: ["Payment", "received.", "No money moved. Your preview order is confirmed and ready to explore."],
      expired: ["This reservation", "has ended.", "The 15-minute hold on your items has expired. Start a new checkout to check availability again."],
      unavailable: ["Payment is", "unavailable right now.", "The payment service didn't respond. Nothing was charged. Try again shortly, or keep your bag and come back later."],
      inactive: ["No payment", "is needed.", "This order no longer has an active payment step."],
    }[v];
    var actions =
      v === "pending" || v === "failed"
        ? '<button class="ta-btn ta-btn-full" data-pay="success" data-id="' + o.id + '"' + (sample ? " disabled" : "") + '><span>Simulate successful payment</span></button><button class="ta-btn ta-btn-ghost ta-btn-full" data-pay="failure" data-id="' + o.id + '"' + (sample ? " disabled" : "") + '><span>Simulate failed payment</span></button>' + (sample ? "" : '<p class="reservation-time" data-expires="' + o.expires + '"></p>') + '<p id="payment-result" role="status">' + (v === "failed" ? "Preview payment failed. You can try again." : "") + "</p>"
        : v === "expired" ? btn("/cart", "Return to your bag")
        : v === "unavailable" ? '<button class="ta-btn ta-btn-full" disabled><span>Try again</span></button>' + tlink("/cart", "Back to your bag")
        : btn("/orders/" + o.id, "View your order");
    return '<div class="ta-page ta-pay">' + (sample ? sampleBanner("Synthetic order SAMPLE-1042. No payment, order or record exists.") : "") +
      '<section class="ta-pay-grid ta-pay-' + v + '"><div>' + eyebrow("Payment · " + ctx.escape(o.id)) + '<h1 class="ta-title">' + heads[0] + "<br><em>" + heads[1] + '</em></h1><p class="ta-lede">' + heads[2] + '</p><div class="ta-pay-amount"><span>Sample order total</span><strong>' + ctx.money(o.total) + "</strong></div>" + actions + "</div>" +
      '<aside class="ta-summary"><p class="ta-eyebrow">Order record</p>' + o.items.map(function (i) { return '<div class="sum-row"><span>' + ctx.escape(i.name) + " × " + i.quantity + "</span><strong>" + ctx.money(i.unit_price * i.quantity) + "</strong></div>"; }).join("") + '<div class="sum-row"><span>Sample discount</span><span>−' + ctx.money(o.discount) + '</span></div><div class="sum-row"><span>Sample shipping</span><span>' + ctx.money(o.shipping) + '</span></div><div class="sum-row summary-total"><span>Total</span><strong>' + ctx.money(o.total) + '</strong></div><p class="ta-small">Real payments need Razorpay credentials, signature verification, webhook reconciliation and settlement testing. None is connected.</p></aside></section></div>';
  }

  /* ---------- Order ---------- */
  function order(ctx, o, fx) {
    if (!o) return '<div class="ta-page">' + masthead("Order", "Order not", "found.", "Sign in to the customer session that owns this order.") + '<div class="ta-wrap">' + btn("/account", "Your account") + "</div></div>";
    var sample = !!fx;
    var st = o.state;
    var head = { pending: ["Your order", "is waiting for payment."], paid: ["We have", "your order."], shipped: ["Your order", "is on its way."], delivered: ["At your", "door."], cancelled: ["This order", "was cancelled."], expired: ["This order", "expired."] }[st] || ["Your", "order."];
    var steps = [["pending", "Order created"], ["paid", "Payment received"], ["shipped", "Shipped"], ["delivered", "Delivered"]];
    var customer = sample || (ctx.user && ctx.user.role === "customer");
    var canCancel = customer && ["pending", "paid"].indexOf(st) >= 0;
    var reviewed = ((ctx.account && ctx.account.reviews) || []);
    var reviewItems = o.items.filter(function (i) { return !reviewed.some(function (r) { return r.order_id === o.id && r.product === i.id; }); });
    var review = customer && st === "delivered" ? (reviewItems.length ? '<section class="ta-review">' + eyebrow("Verified delivery") + '<h2 class="ta-title ta-title-sm">How was it?</h2><p>Only delivered orders can be reviewed, and every review is moderated before it appears.</p>' + ctx.forms.reviewForm(o, reviewItems, sample) + "</section>" : '<section class="ta-review" role="status"><h2 class="ta-title ta-title-sm">Review submitted</h2><p>Your review is awaiting moderation.</p></section>') : "";
    return '<div class="ta-page ta-order">' + (sample ? sampleBanner("Synthetic order with a fictional address. No order, shipment or customer record exists.") : "") +
      '<header class="ta-mast"><div class="ta-mast-main">' + eyebrow("Order " + ctx.escape(o.id) + " · created " + ctx.date(o.created)) + '<h1 class="ta-title">' + head[0] + "<br><em>" + head[1] + '</em></h1><p class="ta-lede">Preview transaction only. Nothing was charged or shipped.</p></div></header>' +
      '<ol class="ta-timeline">' + steps.map(function (s, i) { var h = (o.history || []).find(function (x) { return x.state === s[0]; }); return '<li class="' + (h ? "is-done" : "") + '"><span>' + (h ? "✓" : "0" + (i + 1)) + "</span><strong>" + s[1] + "</strong><small>" + (h ? ctx.date(h.at) : "Not yet") + "</small></li>"; }).join("") + "</ol>" +
      (o.provider ? '<p class="ta-annot"><strong>Tracking —</strong> ' + ctx.escape(o.provider) + " · " + ctx.escape(o.tracking) + ". Simulated: no shipment was booked.</p>" : "") +
      (o.refund && o.refund !== "none" ? '<p class="ta-annot"><strong>Refund —</strong> ' + ctx.badge(o.refund) + " A refund needs a second person's approval and moves no money in the preview.</p>" : "") +
      '<div class="ta-order-grid"><div><h2 class="ta-subhead">In this order</h2><ol class="ta-rows">' + o.items.map(function (i) { var p = ctx.product(i.id); return '<li><a href="/products/' + i.id + '">' + (p ? photo(p) : "") + '<span class="ta-row-main"><strong>' + ctx.escape(i.name) + "</strong><small>Quantity " + i.quantity + '</small></span><span class="ta-row-end">' + ctx.money(i.quantity * i.unit_price) + "</span></a></li>"; }).join("") + "</ol>" +
      '<div class="ta-order-actions">' + (st === "pending" ? btn("/payment/" + o.id + (sample ? "?state=pending" : ""), "Continue payment") : "") + (canCancel ? '<button class="ta-btn ta-btn-ghost" data-cancel="' + o.id + '"' + (sample ? " disabled" : "") + "><span>Cancel order</span></button>" : "") + '<button class="ta-btn ta-btn-ghost" data-reorder="' + o.id + '"' + (sample ? " disabled" : "") + "><span>Reorder items</span></button>" + tlink("/contact?order=" + o.id, "Get help with this order") + "</div>" + review + "</div>" +
      '<aside class="ta-summary"><p class="ta-eyebrow">Summary</p><div class="sum-row"><span>Sample subtotal</span><span>' + ctx.money(o.subtotal) + '</span></div><div class="sum-row"><span>Sample discount</span><span>−' + ctx.money(o.discount) + '</span></div><div class="sum-row"><span>Sample delivery</span><span>' + ctx.money(o.shipping) + '</span></div><div class="sum-row summary-total"><span>Total</span><strong>' + ctx.money(o.total) + '</strong></div><p class="ta-eyebrow ta-mt">Delivering to</p><address>' + ctx.escape(o.contact.name) + "<br>" + ctx.escape(o.contact.address) + "<br>" + ctx.escape(o.contact.city) + ", " + ctx.escape(o.contact.state) + "<br>" + ctx.escape(o.contact.pincode) + '</address><p class="ta-small">Policy snapshot: ' + ctx.escape(o.policy_version) + "</p></aside></div></div>";
  }

  /* ---------- Account ---------- */
  function account(ctx, tab, fx) {
    var c = S.copy.account;
    var a = ctx.account || { orders: [], addresses: [], cases: [] };
    var sample = !!fx;
    var guest = fx ? fx === "signed-out" || fx === "code" : !ctx.user || ctx.user.id.indexOf("guest-") === 0;
    if (fx) a = { orders: fx === "orders" ? [S.fixtures.order("delivered", ctx.catalog), Object.assign(S.fixtures.order("paid", ctx.catalog), { id: "SAMPLE-1037" })] : [], addresses: fx === "sample" ? S.fixtures.addresses() : [], cases: fx === "sample" ? S.fixtures.cases : [] };
    var tabs = '<nav class="ta-tabs" aria-label="Account sections">' + [["orders", "Orders", "/account"], ["addresses", "Addresses", "/account/addresses"], ["cases", "Support cases", "/account/cases"], ["preferences", "Preferences", "/settings"]].map(function (t) { return '<a href="' + t[2] + (sample ? "?state=" + (t[0] === "orders" ? "orders" : "sample") : "") + '"' + (t[0] === tab ? ' aria-current="page"' : "") + ">" + t[1] + "</a>"; }).join("") + (guest ? "" : '<button data-action="logout"' + (sample ? " disabled" : "") + ">Sign out</button>") + "</nav>";
    var login = guest ? '<section class="ta-login"><div>' + eyebrow("Sign in") + '<h2 class="ta-title ta-title-md">Your orders,<br><em>in one place.</em></h2><p>' + c.signIn + "</p></div><div>" + (fx === "code" ? ctx.forms.codeEntry("482913") : ctx.forms.otp(sample)) + "</div></section>" : "";
    var body;
    if (tab === "addresses") body = '<div class="ta-acc-grid"><div><h2 class="ta-subhead">Saved addresses</h2>' + (a.addresses.length ? a.addresses.map(function (v) { return '<address class="ta-addr"><strong>' + ctx.escape(v.name) + "</strong><br>" + ctx.escape(v.address) + "<br>" + ctx.escape(v.city) + ", " + ctx.escape(v.state) + " " + ctx.escape(v.pincode) + "</address>"; }).join("") : '<p class="ta-small">No saved addresses yet. Add one and it\'ll be ready at checkout.</p>') + '</div><div><h2 class="ta-subhead">Add an address</h2>' + ctx.forms.address(sample) + "</div></div>";
    else if (tab === "cases") body = '<div class="ta-section-head">' + eyebrow("Support") + '<h2 class="ta-title ta-title-sm">Your cases</h2>' + tlink("/contact", "Open a new case") + "</div>" + (a.cases.length ? '<ol class="ta-cases">' + a.cases.map(function (k) { return '<li><p class="ta-eyebrow">' + ctx.escape(k.id) + " · " + ctx.escape(k.kind) + "</p><strong>" + ctx.badge(k.state) + "</strong><p>" + ctx.escape(k.message) + '</p><small>' + ctx.escape(k.owner) + " · " + ctx.escape(k.sla) + "</small>" + (k.order_id ? tlink("/orders/" + k.order_id + (sample ? "?state=paid" : ""), k.order_id) : "") + "</li>"; }).join("") + "</ol>" : '<div class="ta-empty is-small"><h3>No open cases</h3><p>Cases and their updates will show up here.</p>' + tlink("/contact", "Contact support") + "</div>");
    else body = '<h2 class="ta-subhead">Your orders</h2>' + (a.orders.length ? '<ol class="ta-rows is-orders">' + a.orders.map(function (o) { return '<li><a href="/orders/' + o.id + (sample ? "?state=" + o.state : "") + '"><span class="ta-row-main"><strong>' + ctx.escape(o.id) + "</strong><small>" + ctx.date(o.created) + " · " + o.items.reduce(function (n, i) { return n + i.quantity; }, 0) + " items · " + ctx.money(o.total) + ' sample</small></span><span class="ta-row-end">' + ctx.badge(o.state) + "</span></a></li>"; }).join("") + "</ol>" : '<div class="ta-empty is-small"><h3>No orders yet</h3><p>Orders you place in this session will show up here.</p>' + btn("/shop", "Shop all seven") + "</div>");
    return '<div class="ta-page ta-account">' + (sample ? sampleBanner("Synthetic account data for reviewing the design. No sign-in, address or case exists.") : "") +
      masthead("Your account", "Hello,", guest ? "guest." : "again.", guest ? c.lede : "Signed in with mobile ending " + ctx.escape(sample ? "0000" : ctx.user.mobile.slice(-4)) + ".") + login + tabs + '<div class="ta-acc-body">' + body + "</div></div>";
  }

  /* ---------- Help & contact ---------- */
  function help(ctx) {
    var c = S.copy.help;
    return '<div class="ta-page ta-help">' + masthead("Help centre", "A clear next step.", "A person to ask.", c.lede) +
      '<ol class="ta-help-topics">' + c.topics.map(function (t, i) { return '<li id="' + t[0] + '"><span class="ta-num">0' + (i + 1) + "</span><div><h2>" + t[1] + "</h2><p>" + t[2] + "</p>" + tlink(t[3], t[4]) + "</div></li>"; }).join("") + "</ol>" +
      c.topics.filter(function (t) { return c.faqs.some(function (f) { return f[0] === t[0]; }); }).map(function (t) {
        return '<section class="ta-spread ta-faq-group"><div class="ta-spread-head">' + eyebrow("Questions") + '<h2 class="ta-title ta-title-sm">' + t[1] + '</h2></div><div class="ta-spread-body ta-faq">' + c.faqs.filter(function (f) { return f[0] === t[0]; }).map(function (f) { return "<details><summary><span>" + f[1] + '</span><span class="ta-plus" aria-hidden="true">＋</span></summary><p>' + f[2] + "</p></details>"; }).join("") + "</div></section>";
      }).join("") +
      '<section class="ta-cta"><div>' + eyebrow("Still stuck?") + '<h2 class="ta-title ta-title-md">Open a case.<br><em>Keep one record.</em></h2><p>' + S.copy.contact.lede + "</p></div><div>" + btn("/contact", "Contact support") + tlink("/contact?kind=safety", "Report a product safety issue") + "</div></section></div>";
  }
  function contact(ctx, fx) {
    var c = S.copy.contact;
    if (fx === "unavailable" || (!fx && ctx.staticPreview)) return unavailable(ctx, "/contact");
    var sample = !!fx;
    var oid = ctx.query.get("order") || "";
    var kind = ctx.query.get("kind") || "general";
    var right = fx === "submitted"
      ? '<div class="report-result case-created ta-created" role="status"><p class="ta-eyebrow">Case created · sample</p><h2 class="ta-title ta-title-sm">SAMPLE-CASE-01</h2><p>This is how a confirmation looks. In this design state, no case was saved and no message was sent.</p>' + tlink("/account/cases?state=sample", "Follow your case") + "</div>"
      : ctx.forms.caseForm(oid, kind, sample, fx === "errors" ? { message: "Tell us a little more: at least 10 characters." } : null);
    return '<div class="ta-page ta-contact">' + (sample ? sampleBanner("Visual state only. Nothing is sent or saved.") : "") + masthead("Contact", "Talk to", "a person.", c.lede) +
      '<div class="ta-contact-grid"><div><h2 class="ta-subhead">Ways to reach us</h2><dl class="ta-gloss">' + c.channels.map(function (ch) { return "<div><dt>" + ch[0] + "</dt><dd>" + ch[1] + "</dd></div>"; }).join("") + '</dl><aside class="ta-margin is-warm"><p class="ta-eyebrow">Product issue?</p><p>' + c.safety + '</p></aside><p class="ta-small">' + c.privacy + "</p></div><div>" + right + "</div></div></div>";
  }

  /* ---------- Policies ---------- */
  function policy(ctx, kind) {
    var p = S.policies[kind];
    if (!p) return notFound(ctx);
    return '<div class="ta-page ta-policy"><div class="ta-topline">' + crumbs([["/", "Home"], ["/help", "Help"], ["", p.title]]) + "</div>" +
      '<div class="ta-pol-grid"><nav class="ta-pol-nav" aria-label="Policies"><p class="ta-eyebrow">Policies · working drafts</p><ol>' + S.policyOrder.map(function (k) { return '<li><a href="/policies/' + k + '"' + (k === kind ? ' aria-current="page"' : "") + ">" + S.policies[k].title + "</a></li>"; }).join("") + "</ol></nav>" +
      '<article class="ta-pol-body">' + eyebrow("Policy draft · not final terms") + '<h1 class="ta-title">' + p.title + '</h1><div class="ta-plain"><p class="ta-eyebrow">In plain words</p><p>' + p.plain + "</p></div>" +
      p.sections.map(function (s, i) { return '<section><h2><span>' + (i + 1) + ".</span> " + s[0] + ' <span class="ta-status" data-status="' + s[2].toLowerCase().replace(/\s+/g, "-") + '">' + s[2] + "</span></h2><p>" + s[1] + "</p></section>"; }).join("") +
      '<p class="ta-small">These are working drafts for review. They aren\'t the final terms for a live store, and anything marked unresolved hasn\'t been decided.</p><div class="ta-next-row">' + tlink("/help", "Help centre") + tlink("/contact", "Ask a question") + "</div></article></div></div>";
  }

  /* ---------- Preferences ---------- */
  function settings(ctx) {
    var c = S.copy.settings;
    return '<div class="ta-page ta-settings">' + masthead("Preferences", "Your choices,", "kept simple.", c.lede) + '<div class="ta-wrap ta-narrow">' + ctx.forms.preferences(c.groups) + '<p class="ta-small">Read the <a href="/policies/privacy">privacy draft</a> for what the preview stores.</p></div></div>';
  }

  /* ---------- Not found, unavailable, design states ---------- */
  function notFound(ctx) {
    var c = S.copy.notFound;
    return '<div class="ta-page">' + masthead("404", c[0] + ".", "Let's find your place.", c[1]) + '<div class="ta-next-row ta-wrap">' + btn("/shop", "Shop all seven") + tlink("/learn", "Learn") + tlink("/help", "Help centre") + "</div></div>";
  }
  function unavailable(ctx, path) {
    var group = path.split("/")[1];
    var map = { checkout: "Checkout", payment: "Payment", orders: "Order", account: "Account", contact: "Contact" };
    var st = (S.states.find(function (s) { return s[0] === map[group]; }) || [0, []])[1];
    return '<div class="ta-page">' + masthead("Shared design preview", "This part of the store", "is switched off here.", "You can browse all four designs, inspect product details and try the sample bag and lot lookup. Ordering, sign-in and support submissions aren't enabled on this shared preview, and nothing you type here is collected.") +
      (st.length ? '<section class="ta-wrap"><p class="ta-eyebrow">See the designed states instead</p><ol class="ta-rows is-text">' + st.map(function (s) { return '<li><a href="' + s[0] + '"><span class="ta-row-main"><strong>' + s[1] + '</strong><small>Synthetic fixture · nothing is saved</small></span><span class="ta-row-end">View ↗</span></a></li>'; }).join("") + "</ol></section>" : "") +
      '<div class="ta-next-row ta-wrap">' + btn("/shop", "Continue shopping") + tlink("/preview/states", "All design states") + "</div></div>";
  }
  function states(ctx) {
    return '<div class="ta-page">' + masthead("Design states", "Every state,", "one index.", "Synthetic fixtures for reviewing transactional and edge states. None of them creates an order, payment, message or account record.") +
      S.states.map(function (g) { return spread("", "Route", g[0], "", '<ol class="ta-rows is-text">' + g[1].map(function (s) { return '<li><a href="' + s[0] + '"><span class="ta-row-main"><strong>' + s[1] + "</strong><small>" + s[0] + '</small></span><span class="ta-row-end">↗</span></a></li>'; }).join("") + "</ol>"); }).join("") + "</div>";
  }
  function learnOffline() { return '<div class="ta-page">' + masthead("Learn", "The reading room", "is closed for now.", "The ingredient library isn't published right now.") + '<div class="ta-wrap">' + btn("/shop", "Shop all seven") + "</div></div>"; }

  S.themes.a = { chrome: chrome, home: home, shop: shop, bundles: bundles, search: search, standards: standards, story: story, learn: learn, reports: reports, cart: cart, checkout: checkout, payment: payment, order: order, account: account, help: help, contact: contact, policy: policy, settings: settings, notFound: notFound, unavailable: unavailable, states: states, learnOffline: learnOffline };
})();
