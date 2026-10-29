/* Body Café Co. — Direction B, Expressive everyday: the complete site.
   Grammar: confident colour fields (lilac, sage, lime, peach, indigo + each cap colour), heavy tight Aileron,
   pills and stickers, arch frames, tilted photo cards and speech bubbles, used with discipline on purchase surfaces.
   Content comes from BCCSite; behaviour from app.js. */
(function () {
  "use strict";
  var S = window.BCCSite;
  var TINTS = ["lilac", "sage", "lime", "peach"];

  function pill(t, cls) { return '<span class="tb-pill ' + (cls || "") + '">' + t + "</span>"; }
  function big(a, b, tag, cls) { tag = tag || "h1"; return "<" + tag + ' class="tb-big ' + (cls || "") + '">' + a + (b ? " <em>" + b + "</em>" : "") + "</" + tag + ">"; }
  function chip(href, label, cls) { return '<a class="tb-chip ' + (cls || "") + '" href="' + href + '">' + label + ' <span aria-hidden="true">↗</span></a>'; }
  function btn(href, label, cls) { return '<a class="tb-btn ' + (cls || "") + '" href="' + href + '"><span>' + label + '</span><span aria-hidden="true">→</span></a>'; }
  function photo(p, eager) { return '<img src="' + window.BCCBottleAssets.url(p.id, '/concepts/media/' + p.id + '.webp') + '" alt="' + p.name.replace(/"/g, "&quot;") + ' bottle, front-of-pack design mockup" width="1196" height="1315" ' + (eager ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async">'; }
  function no(ctx, p) { var i = ctx.catalog.indexOf(p) + 1; return (i < 10 ? "0" : "") + i; }
  function band(tint, inner, cls) { return '<section class="tb-band tb-' + tint + " " + (cls || "") + '">' + inner + "</section>"; }
  function header(tint, kicker, a, b, lede, side) {
    return '<header class="tb-head tb-' + tint + '"><div class="tb-head-main">' + pill(kicker, "is-dark") + big(a, b) + (lede ? '<p class="tb-lede">' + lede + "</p>" : "") + "</div>" + (side ? '<div class="tb-head-side">' + side + "</div>" : "") + "</header>";
  }
  function sample(text) { return '<p class="tb-sample" role="note"><span>Sample state</span> ' + text + "</p>"; }
  function ticks(list, cls) { return '<ul class="tb-ticks ' + (cls || "") + '">' + list.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>"; }
  function bubble(inner, cls) { return '<div class="tb-bubble ' + (cls || "") + '">' + inner + "</div>"; }
  function addBtn(ctx, p, label) {
    var off = !p.stock || !p.published;
    return '<button type="button" class="tb-add" data-add="' + p.id + '" aria-label="Add ' + ctx.escape(p.name) + ' to bag"' + (off ? " disabled" : "") + ">" + ctx.icon("plus") + "<span>" + (off ? "Unavailable" : label || "Add") + "</span></button>";
  }
  function arch(ctx, p) {
    return '<article class="tb-arch" style="' + ctx.capStyle(p) + '"><a class="tb-arch-photo" href="/products/' + p.id + '">' + photo(p) + '<span class="tb-arch-no" aria-hidden="true">' + no(ctx, p) + '</span><span class="sr-only">' + ctx.escape(p.name) + '</span></a><span class="tb-sku" aria-hidden="true"></span><p class="tb-arch-format">' + pill(ctx.escape(ctx.format[p.id])) + '</p><h3><a href="/products/' + p.id + '">' + ctx.escape(p.name) + '</a></h3><p class="tb-arch-sub">' + ctx.escape(p.subtitle) + '</p><div class="tb-arch-foot"><p><strong>' + ctx.money(p.price) + "</strong> <small>Sample price</small></p>" + addBtn(ctx, p) + "</div></article>";
  }
  function numbered(items, tintStart) {
    return '<ol class="tb-steps">' + items.map(function (it, i) { return '<li class="tb-' + TINTS[(i + (tintStart || 0)) % 4] + '"><span class="tb-num">' + (i + 1) + "</span><h3>" + it[0] + "</h3><p>" + it[1] + "</p></li>"; }).join("") + "</ol>";
  }

  /* ---------- Chrome ---------- */
  function chrome(ctx, content) {
    var path = ctx.path;
    var cur = function (h) { return path === h || path.indexOf(h + "/") === 0 ? ' aria-current="page"' : ""; };
    var nav = [["/shop", "Shop"], ["/standards", "Standards"], ["/about", "About"], ["/learn", "Learn"], ["/story", "Story"]];
    var mob = nav.map(function (n, i) { return [n[0], n[1], ["lilac", "sage", "lime", "peach", "lilac"][i]]; }).concat([["/reports", "Lot report", "sage"], ["/search", "Search", "lime"]]);
    return (
      '<header class="site-header tb-header"><a class="logo" href="/" aria-label="Body Café Co. home"><img src="/web/media/brand-original.svg" alt="" width="465" height="451"></a>' +
      '<nav class="main-nav tb-nav" aria-label="Main">' + nav.map(function (n) { return '<a href="' + n[0] + '"' + cur(n[0]) + ">" + n[1] + "</a>"; }).join("") + "</nav>" +
      '<div class="header-tools tb-tools"><a class="tb-lot" href="/reports"' + cur("/reports") + ">Lot report</a>" +
      '<button class="icon-button tb-ico" data-action="search" aria-label="Search">' + ctx.icon("search") + '</button><a class="icon-button tb-ico" href="/account" aria-label="Your account">' + ctx.icon("user") + "</a>" +
      '<a class="bag-link tb-bag" href="/cart" aria-label="Cart, ' + ctx.count + ' items">' + ctx.icon("bag") + "<span data-cart-count" + (ctx.count ? "" : " data-empty") + ">" + ctx.count + "</span></a>" +
      '<button class="menu-button tb-menu" data-action="menu" aria-expanded="false" aria-controls="mobile-nav"><span>Menu</span></button></div></header>' +
      '<nav id="mobile-nav" class="tb-mnav" hidden aria-label="Mobile"><div class="mobile-nav-links">' + mob.map(function (n, i) { return '<a href="' + n[0] + '"><span class="tb-mnum tb-' + n[2] + '">0' + (i + 1) + "</span>" + n[1] + "</a>"; }).join("") + '</div><div class="mobile-nav-foot"><a href="/account">Account</a><a href="/cart">Cart (<span data-cart-count>' + ctx.count + '</span>)</a></div></nav>' +
      '<main id="main" tabindex="-1" class="tb-main">' + content + "</main>" +
      '<footer class="site-footer tb-footer"><div class="tb-foot-top"><div class="tb-foot-pitch"><p class="tb-foot-sticker" aria-hidden="true">A curious mind<b>✳</b>A clearer choice</p><p class="tb-foot-line">Your body.<br>Your curiosity.<br><em>Your café.</em></p>' + btn("/shop", "Shop all seven", "is-ink") + "</div>" +
      '<div class="tb-foot-cols"><div><h2>Shop</h2><a href="/shop">All seven</a><a href="/bundles">The edits</a><a href="/reports">Lot reports</a><a href="/search">Search</a></div><div><h2>Read</h2><a href="/standards">Standards</a><a href="/learn">Learn</a><a href="/story">Story</a></div>' + S.careGroups().map(function (g) { return '<div><h2>' + g.group + '</h2>' + g.items.map(function (x) { return '<a href="' + x[1] + '">' + x[0] + '</a>'; }).join('') + '</div>'; }).join('') + "</div></div>" +
      '<p class="tb-foot-word" ><img src="/web/media/brand-horizontal.svg" alt="Body Cafe Co." width="1160" height="140"></p><div class="tb-foot-bottom"><span>© ' + new Date().getFullYear() + ' Body Café Co.</span><span>Draft copy · sample prices · preview commerce</span><a href="/preview/states">Design states</a></div></footer>'
    );
  }

  /* ---------- Home ---------- */
  function home(ctx) {
    var H = window.BCCHome;
    var d3 = ctx.product("vitamin-d3-k2") || ctx.published[0];
    var th = ctx.product("l-theanine") || ctx.published[1];
    return (
      '<section class="tb-hero" aria-labelledby="tb-hero-t"><div class="tb-hero-copy"><p class="tb-eyebrow"><span aria-hidden="true">✳</span> A little more knowing. Every day.</p><h1 id="tb-hero-t" class="tb-big tb-hero-title">Your body.<br>Your curiosity.<br><em>Your café.</em></h1><p class="tb-lede">Seven everyday supplements. A fresh perspective, clear details, and a place to find your lot report.</p><div class="tb-actions">' + btn("/shop", "Explore all seven", "is-ink") + chip("/standards", "Explore our approach") + '</div><div class="tb-hero-foot"><span>Body Café Co.</span><span>Made for the curious.</span></div></div>' +
      '<div class="tb-hero-art">' + (d3 ? '<a class="tb-frame" href="/products/' + d3.id + '">' + photo(d3, true) + '<span class="sr-only">' + ctx.escape(d3.name) + "</span></a>" : "") + (th ? '<a class="tb-float" href="/products/' + th.id + '">' + photo(th) + "<span>Small habits.<br>Room to grow.</span>" + '<span class="sr-only">' + ctx.escape(th.name) + "</span></a>" : "") + '<p class="tb-stamp" aria-hidden="true">A curious mind<b>✳</b>A clearer choice</p><p class="tb-hero-cap"><span>01 / The everyday collection</span><span>Design mockups</span></p></div></section>' +
      (H ? H.strip() : "") +
      '<section id="shop" class="tb-coll" aria-labelledby="tb-coll-t"><div class="tb-coll-head"><div>' + pill("01 — Meet the collection") + '<h2 id="tb-coll-t" class="tb-big">Seven essentials.<br><em>Which is your thing?</em></h2></div><p>Different essentials. The same clear approach.<small>Seven products · one-time purchases</small></p></div><div class="tb-archgrid">' + ctx.published.map(function (p) { return arch(ctx, p); }).join("") + '</div><p class="tb-footnote">Sample prices. Serving quantities and full label information will appear after content approval.</p></section>' +
      (H ? H.evidence() + H.voices() : "") + '<div class="tb-home-lot">' + ctx.homeLot() + "</div>" + (H ? H.story() + H.learn() + H.care() : "")
    );
  }

  /* ---------- Shop ---------- */
  function shop(ctx) {
    var c = S.copy.shop;
    var sel = ctx.query.get("format") || "all";
    var all = ctx.published;
    var list = all.filter(function (p) { return sel === "all" || ctx.format[p.id] === sel; });
    var formats = [["all", "All seven"], ["Capsules", "Capsules"], ["Softgels", "Softgels"], ["Chewable tablets", "Chewable tablets"]];
    var sw = '<nav class="tb-switch" aria-label="Filter by format">' + formats.map(function (f, i) {
      var ps = all.filter(function (p) { return f[0] === "all" || ctx.format[p.id] === f[0]; });
      return '<a class="tb-' + TINTS[i] + '" href="/shop' + (f[0] === "all" ? "" : "?format=" + encodeURIComponent(f[0])) + '"' + (f[0] === sel ? ' aria-current="page"' : "") + '><span class="tb-switch-dots" aria-hidden="true">' + ps.map(function (p) { return '<i style="background:' + p.color + '"></i>'; }).join("") + "</span><strong>" + f[1] + "</strong><small>" + ps.length + " product" + (ps.length === 1 ? "" : "s") + "</small></a>";
    }).join("") + "</nav>";
    return '<div class="tb-page tb-shop">' + header("lilac", "The collection", "Seven essentials.", "Which is your thing?", c.lede, '<div class="tb-guide">' + c.guidance.map(function (g, i) { return bubble("<strong>" + g[0] + "</strong><span>" + g[1] + "</span>", "tb-" + ["paper", "lime", "sage"][i]); }).join("") + "</div>") +
      '<div class="tb-wrap">' + sw + '<p class="tb-count" role="status">Showing ' + list.length + " of " + all.length + (sel !== "all" ? " · " + ctx.escape(sel) : "") + "</p>" +
      (list.length ? '<div class="tb-archgrid">' + list.map(function (p) { return arch(ctx, p); }).join("") + "</div>" : '<div class="tb-nomatch">' + bubble("<strong>" + c.noMatch[0] + "</strong><span>" + c.noMatch[1] + "</span>", "tb-peach is-big") + btn("/shop", "Show all seven", "is-ink") + "</div>") +
      '<p class="tb-care"><span aria-hidden="true">✳</span> ' + c.care + "</p></div>" +
      band("indigo", '<div class="tb-cheat"><div>' + pill("Cheat sheet", "is-lime") + '<h2 class="tb-big">The seven,<br><em>side by side.</em></h2><p>' + c.compareNote + '</p></div><div class="tb-cheat-card"><table><caption class="sr-only">' + c.compareTitle + '</caption><thead><tr><th scope="col">Product</th><th scope="col">Format</th><th scope="col">Serving &amp; pack</th><th scope="col">Sample price</th></tr></thead><tbody>' + all.map(function (p) { return '<tr><th scope="row"><a href="/products/' + p.id + '"><i style="background:' + p.color + '" aria-hidden="true"></i>' + ctx.escape(p.name) + "</a><small>" + ctx.escape(p.ingredients.split(";")[0]) + "</small></th><td>" + ctx.escape(ctx.format[p.id]) + '</td><td><span class="tb-pend">' + S.STATUS.label + "</span></td><td>" + ctx.money(p.price) + "</td></tr>"; }).join("") + "</tbody></table></div></div>") + "</div>";
  }

  /* ---------- Bundles ---------- */
  function bundles(ctx, id) {
    var c = S.copy.bundles;
    var B = ctx.state.bundles;
    var b = B.find(function (x) { return x.id === id; });
    if (id && !b) return notFound(ctx);
    if (!b) {
      return '<div class="tb-page">' + header("sage", "The edits", "Two products.", "One page.", c.lede, bubble("<strong>Heads up</strong><span>" + c.status + "</span>", "tb-lime")) +
        '<div class="tb-wrap tb-duos">' + B.map(function (x, i) {
          var items = x.items.map(ctx.product).filter(Boolean);
          var sum = items.reduce(function (n, p) { return n + p.price; }, 0);
          return '<article class="tb-duo tb-' + TINTS[(i * 2 + 1) % 4] + '"><a class="tb-duo-photos" href="/bundles/' + x.id + '">' + items.map(function (p, j) { return '<span class="tb-duo-p tb-duo-' + j + '">' + photo(p) + "</span>"; }).join("") + '<span class="sr-only">' + ctx.escape(x.name) + '</span></a><div class="tb-duo-copy">' + pill("Example edit 0" + (i + 1)) + '<h2 class="tb-mid"><a href="/bundles/' + x.id + '">' + ctx.escape(x.name) + "</a></h2><p>" + ctx.escape(x.description) + '</p><ul class="tb-pillrows">' + items.map(function (p) { return '<li><i style="background:' + p.color + '" aria-hidden="true"></i>' + ctx.escape(p.name) + "<span>" + ctx.money(p.price) + "</span></li>"; }).join("") + '<li class="is-total">Sample total<span>' + ctx.money(sum) + "</span></li></ul>" + btn("/bundles/" + x.id, "See this edit", "is-ink") + "</div></article>";
        }).join("") + "</div>" + '<div class="tb-wrap"><h2 class="tb-mid">Why edits exist</h2>' + numbered(c.why) + "</div></div>";
    }
    var items = b.items.map(ctx.product).filter(Boolean);
    var sum = items.reduce(function (n, p) { return n + p.price; }, 0);
    return '<div class="tb-page"><section class="tb-edit-hero tb-sage"><div class="tb-duo-photos is-big">' + items.map(function (p, j) { return '<a class="tb-duo-p tb-duo-' + j + '" href="/products/' + p.id + '">' + photo(p) + '<span class="sr-only">' + ctx.escape(p.name) + "</span></a>"; }).join("") + '</div><div class="tb-edit-copy"><nav class="tb-crumbs" aria-label="Breadcrumb"><a href="/bundles">← All edits</a></nav>' + pill("Example edit", "is-dark") + big(ctx.escape(b.name), "") + '<p class="tb-lede">' + ctx.escape(b.description) + '</p><ul class="tb-pillrows is-big">' + items.map(function (p) { return '<li><i style="background:' + p.color + '" aria-hidden="true"></i><a href="/products/' + p.id + '">' + ctx.escape(p.name) + "</a><small>" + ctx.escape(ctx.format[p.id]) + "</small><span>" + ctx.money(p.price) + "</span></li>"; }).join("") + '<li class="is-total">Sample total · no discount<span>' + ctx.money(sum) + '</span></li></ul><button class="tb-btn is-ink is-full" data-bundle="' + b.id + '"><span>Add both to bag</span>' + ctx.icon("plus") + "</button>" + bubble("<strong>Not a regimen</strong><span>" + c.status + "</span>", "tb-paper") + "</div></section></div>";
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
    return '<div class="tb-page tb-search"><section class="tb-search-hero tb-lime">' + pill("Search", "is-dark") + big("Looking for", "something?") + ctx.forms.search(q) + '<p class="tb-hints">' + c.hints.map(function (h, i) { return '<a class="tb-' + TINTS[i % 4] + '" href="/search?q=' + encodeURIComponent(h) + '">' + h + "</a>"; }).join("") + "</p></section>" +
      '<div class="tb-wrap">' + (q ? '<p class="tb-count" role="status"><strong>' + total + "</strong> result" + (total === 1 ? "" : "s") + " for “" + ctx.escape(q) + "”</p>" : '<p class="tb-count">' + c.lede + "</p>") +
      (report ? bubble("<strong>Got a bottle in hand?</strong><span>Lot reports have their own lookup.</span>" + chip("/reports", "Find your lot report"), "tb-lilac") : "") +
      (prods.length ? '<h2 class="tb-mid">Products</h2><div class="tb-archgrid is-compact">' + prods.map(function (p) { return arch(ctx, p); }).join("") + "</div>" : "") +
      (gs.length || nt.length ? '<h2 class="tb-mid">Reading</h2><div class="tb-readcards">' + gs.map(function (g, i) { return '<a class="tb-readcard tb-' + TINTS[i % 4] + '" href="' + g[0] + '">' + pill("Guide") + "<strong>" + g[1] + "</strong><span>" + g[2] + "</span></a>"; }).join("") + nt.map(function (p) { return '<a class="tb-readcard tb-paper" href="/learn/' + p.id + '" style="' + ctx.capStyle(p) + '">' + pill("Ingredient note") + "<strong>" + ctx.escape(p.name) + "</strong><span>" + S.notes[p.id].lead + "</span></a>"; }).join("") + "</div>" : "") +
      (q && !total ? '<div class="tb-nomatch">' + bubble("<strong>Nothing for “" + ctx.escape(q) + "”.</strong><span>" + c.noResults + "</span>", "tb-peach is-big") + btn("/shop", "Browse all seven", "is-ink") + "</div>" : "") +
      (!q ? '<h2 class="tb-mid">Or start with the seven</h2><div class="tb-archgrid is-compact">' + ctx.published.map(function (p) { return arch(ctx, p); }).join("") + "</div>" : "") + "</div></div>";
  }

  /* ---------- Standards ---------- */
  function standards(ctx) {
    var c = S.copy.standards;
    return '<div class="tb-page tb-standards">' + header("sage", "Our standards", "The detail", "behind the bottle.", c.lede, bubble("<span>" + c.intro + "</span>", "tb-paper is-big")) +
      '<nav class="tb-jump" aria-label="On this page">' + c.pillars.map(function (p, i) { return '<a href="#' + p.id + '"><span class="tb-num tb-' + TINTS[i % 4] + '">' + (i + 1) + "</span>" + p.title + "</a>"; }).join("") + "</nav>" +
      '<div class="tb-pillars">' + c.pillars.map(function (p, i) {
        return '<section class="tb-pillar tb-' + TINTS[i % 4] + (i % 2 ? " is-flip" : "") + '" id="' + p.id + '" aria-labelledby="' + p.id + '-t"><div class="tb-pillar-badge"><span>' + (i + 1) + "</span></div><div class=\"tb-pillar-copy\">" + pill(p.summary) + '<h2 class="tb-mid" id="' + p.id + '-t">' + p.title + "</h2><p>" + p.body + "</p>" + ticks(p.points) + "</div>" + bubble('<strong>Where it stands today</strong><span>' + p.now + "</span>", "tb-paper") + "</section>";
      }).join("") + "</div>" +
      band("indigo", '<div class="tb-ledger">' + pill("The honest ledger", "is-lime") + '<h2 class="tb-big">Documented now.<br><em>Still to come.</em></h2><div class="tb-ledger-cols"><div class="tb-sage"><h3>Documented now</h3>' + ticks(c.documented) + '</div><div class="tb-lime"><h3>Planned before launch</h3>' + ticks(c.planned, "is-plan") + '</div><div class="tb-peach"><h3>What we won\'t do</h3>' + ticks(c.wont, "is-cross") + "</div></div></div>") +
      '<div class="tb-wrap tb-chipsrow">' + chip("/reports", "Try a lot lookup", "tb-lilac") + chip("/learn/understanding-reports", "What a lot report shows", "tb-sage") + chip("/learn/reading-a-label", "Read a label with confidence", "tb-lime") + "</div></div>";
  }

  /* ---------- Story ---------- */
  function story(ctx) {
    var c = S.copy.story;
    return '<div class="tb-page tb-story"><section class="tb-manifesto tb-lilac"><p class="tb-eyebrow">Our story</p><h1 class="tb-mega"><span>Make</span> <span>room</span> <span>for</span> <em>understanding.</em></h1><p class="tb-lede">' + c.lede + '</p><div class="tb-capline" aria-hidden="true">' + ctx.catalog.map(function (p) { return '<i style="background:' + p.color + '"></i>'; }).join("") + "</div></section>" +
      '<div class="tb-wrap"><p class="tb-opening">' + c.opening + "</p></div>" +
      '<div class="tb-chapters">' + c.chapters.map(function (ch, i) { return '<article class="tb-chapter tb-' + TINTS[i % 4] + '">' + pill("Chapter " + (i + 1)) + '<h2 class="tb-mid">' + ch.title + "</h2><p>" + ch.body + "</p></article>"; }).join("") + "</div>" +
      band("indigo", '<div class="tb-promises">' + pill("What you can hold us to", "is-lime") + '<h2 class="tb-big">Four promises.<br><em>Three refusals.</em></h2><div class="tb-prom-grid">' + c.promises.map(function (p, i) { return '<div class="tb-' + TINTS[i % 4] + '"><span class="tb-num">' + (i + 1) + "</span><h3>" + p[0] + "</h3><p>" + p[1] + "</p></div>"; }).join("") + '</div><ul class="tb-refuse">' + c.wont.map(function (w) { return "<li>" + w + "</li>"; }).join("") + "</ul></div>") +
      '<section class="tb-people tb-wrap"><div class="tb-polaroid" role="img" aria-label="Space reserved for a founder photo, not yet supplied"><span>Founder photo</span><small>Coming, in their own words</small></div><div>' + pill("The people behind it", "is-dark") + '<h2 class="tb-big">Real people.<br><em>Not stock ones.</em></h2><p class="tb-lede">' + c.people + "</p>" + bubble("<strong>What we're waiting on</strong>" + ticks(c.peopleNeeds, "is-plan"), "tb-lime") + "</div></section>" +
      '<div class="tb-wrap tb-chipsrow">' + chip("/standards", "Our standards", "tb-sage") + chip("/shop", "Meet the seven", "tb-lilac") + chip("/learn", "Learn", "tb-lime") + "</div></div>";
  }

  /* ---------- Learn ---------- */
  function learn(ctx, slug) {
    if (slug && S.guides[slug]) return guide(ctx, slug);
    if (slug && ctx.product(slug)) return note(ctx, ctx.product(slug));
    if (slug) return notFound(ctx);
    var c = S.copy.learn;
    return '<div class="tb-page tb-learn">' + header("indigo", "Learn", "Read the label,", "then the lot.", c.lede, '<nav class="tb-topicpills" aria-label="Topics">' + c.topics.map(function (t, i) { return '<a class="tb-' + TINTS[i] + '" href="#' + t[0] + '"><strong>' + t[1] + "</strong><span>" + t[2] + "</span></a>"; }).join("") + "</nav>") +
      '<div class="tb-wrap"><p class="tb-opening">' + c.intro + '</p><div class="tb-guides">' + S.guideOrder.map(function (s, i) { var g = S.guides[s]; return '<a class="tb-guidecard tb-' + TINTS[i] + '" id="' + g.topic + '" href="/learn/' + s + '"><span class="tb-sticker">0' + (i + 1) + "</span>" + pill(S.minutes(g) + " min read") + '<strong class="tb-mid">' + g.title + "</strong><span>" + g.summary + '</span><span class="tb-go">Read the guide →</span></a>'; }).join("") + "</div></div>" +
      '<section class="tb-wrap" id="notes" aria-labelledby="notes-t">' + pill("Ingredient notes · all seven", "is-dark") + '<h2 class="tb-big" id="notes-t">What to check,<br><em>product by product.</em></h2><div class="tb-notegrid">' + ctx.catalog.map(function (p) { return '<a class="tb-notecard" href="/learn/' + p.id + '" style="' + ctx.capStyle(p) + '"><span class="tb-notecard-top"><img src="/web/media/' + p.id + '.webp" alt="" width="' + (ctx.bottleWidth[p.id] || 720) + '" height="1000" loading="lazy"></span><strong>' + ctx.escape(p.name) + "</strong><small>" + S.noteSummary(p.id) + "</small></a>"; }).join("") + "</div></section>" +
      band("peach", '<div class="tb-gloss-wrap">' + pill("Glossary", "is-dark") + '<h2 class="tb-big">Words worth<br><em>knowing.</em></h2><dl class="tb-gloss">' + c.glossary.map(function (g, i) { return '<div class="tb-' + ["paper", "lime", "lilac", "sage"][i % 4] + '"><dt>' + g[0] + "</dt><dd>" + g[1] + "</dd></div>"; }).join("") + "</dl></div>") +
      '<div class="tb-wrap tb-chipsrow">' + chip("/help", "Help centre", "tb-sage") + chip("/contact", "Ask a person", "tb-lilac") + "</div></div>";
  }
  function guide(ctx, slug) {
    var g = S.guides[slug];
    var i = S.guideOrder.indexOf(slug);
    var tint = TINTS[i];
    return '<article class="tb-page tb-article"><header class="tb-art-head tb-' + tint + '"><nav class="tb-crumbs" aria-label="Breadcrumb"><a href="/learn">← Learn</a></nav><span class="tb-sticker">0' + (i + 1) + "</span>" + pill("Guide · " + S.minutes(g) + " min read", "is-dark") + big(g.title, "") + '<p class="tb-lede">' + g.summary + "</p></header>" +
      '<div class="tb-art-wrap">' + bubble("<strong>The short version</strong>" + ticks(g.takeaways), "tb-paper is-big tb-takeaways") + '<p class="tb-opening">' + g.opening + '</p><nav class="tb-art-toc" aria-label="In this guide">' + g.sections.map(function (s, j) { return '<a href="#' + s.id + '"><span class="tb-num tb-' + TINTS[j % 4] + '">' + (j + 1) + "</span>" + s.h + "</a>"; }).join("") + '<a href="#checklist"><span class="tb-num tb-' + TINTS[g.sections.length % 4] + '">✓</span>Checklist</a></nav>' +
      g.sections.map(function (s, j) { return '<section id="' + s.id + '" class="tb-art-sec"><h2 class="tb-mid"><span class="tb-num tb-' + TINTS[j % 4] + '">' + (j + 1) + "</span>" + s.h + "</h2>" + s.html + "</section>"; }).join("") +
      '<figure class="tb-worksheet">' + pill("Illustrative", "is-dark") + "<figcaption><strong>" + g.example.title + "</strong><small>" + g.example.note + "</small></figcaption><dl>" + g.example.rows.map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; }).join("") + "</dl><p>" + g.example.reading + "</p></figure>" +
      '<section id="checklist" class="tb-art-sec"><h2 class="tb-mid"><span class="tb-num tb-lime">✓</span>Checklist</h2>' + ticks(g.checklist, "is-check") + "</section>" +
      (g.sources.length ? '<section class="tb-sources"><h2>Sources</h2>' + S.sourceList(g.sources) + "</section>" : '<p class="tb-small">This guide explains reports in general. It describes no specific laboratory, report or result.</p>') +
      '<p class="tb-small">General information, not personal advice. No author or reviewer is credited until the guide has been reviewed.</p></div>' +
      '<div class="tb-wrap tb-chipsrow">' + g.related.map(function (r, k) { return chip("/learn/" + r, S.guides[r].title, "tb-" + TINTS[(k + 1) % 4]); }).join("") + chip("/reports", "Find your lot report", "tb-lilac") + chip("/shop", "See the collection", "tb-sage") + "</div></article>";
  }
  function note(ctx, p) {
    var n = S.notes[p.id] || { lead: "", check: [], compound: "", sources: [] };
    var confirm = ((window.BCCProductPage && window.BCCProductPage.toConfirm && window.BCCProductPage.toConfirm[p.id]) || []).concat(["Complete ingredient list, allergens, storage and manufacturer details"]);
    return '<article class="tb-page tb-note" style="' + ctx.capStyle(p) + '"><header class="tb-note-head"><div class="tb-note-copy"><nav class="tb-crumbs" aria-label="Breadcrumb"><a href="/learn#notes">← All ingredient notes</a></nav>' + pill("Ingredient note · " + no(ctx, p) + " / " + ctx.catalog.length, "is-dark") + big(ctx.escape(p.name), "") + '<p class="tb-lede">' + n.lead + '</p><p class="tb-inview">' + pill("In view now") + " " + ctx.escape(p.ingredients) + " · " + ctx.escape(ctx.format[p.id]) + '</p></div><div class="tb-note-art"><span class="tb-frame">' + photo(p, true) + '</span><p class="tb-note-cap">Design mockup. Printed wording is a draft, not the approved label.</p></div></header>' +
      '<div class="tb-wrap"><h2 class="tb-big">What to check<br><em>on this label.</em></h2><div class="tb-checkgrid">' + n.check.map(function (x, i) { return '<div class="tb-' + TINTS[i % 4] + '"><span class="tb-num">' + (i + 1) + "</span><h3>" + x[0] + "</h3><p>" + x[1] + "</p></div>"; }).join("") + "</div>" +
      (n.compound ? bubble("<strong>A note on forms</strong><span>" + n.compound + "</span>", "tb-paper is-big") : "") +
      bubble("<strong>Waiting on our approved label</strong><span>These details for our " + ctx.escape(p.name) + " will come from the approved rear label. Until then, the product page shows them as awaiting approval.</span>" + ticks(confirm, "is-plan"), "tb-lime is-big") + '<p class="tb-small">' + S.CARE_NOTE + "</p>" +
      (n.sources.length ? '<section class="tb-sources"><h2>Sources</h2>' + S.sourceList(n.sources) + "</section>" : "") + "</div>" +
      '<div class="tb-wrap tb-chipsrow">' + chip("/products/" + p.id, "View " + ctx.escape(p.name), "tb-lilac") + chip("/reports?product=" + p.id, "Look up a lot", "tb-sage") + chip("/learn/ingredient-forms", "Why ingredient forms matter", "tb-lime") + '</div><nav class="tb-wrap tb-capnav" aria-label="Other ingredient notes">' + ctx.catalog.filter(function (o) { return o.id !== p.id; }).map(function (o) { return '<a href="/learn/' + o.id + '"><i style="background:' + o.color + '" aria-hidden="true"></i>' + ctx.escape(o.name) + "</a>"; }).join("") + "</nav></article>";
  }

  /* ---------- Reports ---------- */
  function reports(ctx) {
    var c = S.copy.reports;
    var pid = ctx.product(ctx.query.get("product")) ? ctx.query.get("product") : "vitamin-d3-k2";
    var cur = ctx.product(pid);
    return '<div class="tb-page tb-reports report-page" style="' + (cur ? ctx.capStyle(cur) : "") + '"><section class="tb-rep tb-indigo"><div class="tb-rep-copy">' + pill("From your bottle to the details", "is-lime") + '<h1 class="tb-big">Your lot.<br><em>Your closer look.</em></h1><p class="tb-lede">' + c.what + '</p><ol class="tb-repsteps">' + c.steps.map(function (s, i) { return '<li><span class="tb-num tb-' + TINTS[i] + '">' + (i + 1) + "</span><strong>" + s[0] + "</strong><span>" + s[1] + "</span></li>"; }).join("") + '</ol><p class="tb-small">' + c.locationStatus + '</p></div><div class="tb-rep-card"><p class="tb-card-k">Find your lot report <span aria-hidden="true">↗</span></p><p class="tb-small">1 · Pick your product</p>' + ctx.forms.productPicker(pid) + '<p class="tb-small">2 · Enter the lot</p>' + ctx.forms.reportForm(pid, ctx.query.get("lot")) + '<p class="tb-small">' + c.demo + "</p></div></section>" +
      '<div class="tb-wrap">' + pill("Anatomy of a report", "is-dark") + '<h2 class="tb-big">What a record<br><em>should show.</em></h2><div class="tb-anatomy">' + c.hierarchy.map(function (h, i) { return '<div class="tb-' + TINTS[i % 4] + '"><span class="tb-num">' + (i + 1) + "</span><h3>" + h[0] + "</h3><p>" + h[1] + "</p></div>"; }).join("") + "</div>" + bubble("<strong>Its limits</strong>" + ticks(c.limits, "is-cross"), "tb-peach is-big") + '</div><div class="tb-wrap tb-chipsrow">' + chip("/learn/understanding-reports", "What a lot report shows", "tb-lime") + chip("/standards#lot", "How packs link to lots", "tb-sage") + chip("/contact", "Ask about a lot", "tb-lilac") + "</div></div>";
  }

  /* ---------- Bag ---------- */
  function cart(ctx) {
    var c = S.copy.cart;
    var items = ctx.state.cart.map(function (i) { return { p: ctx.product(i.id), q: i.quantity }; }).filter(function (x) { return x.p; });
    if (!items.length) return '<div class="tb-page tb-bagpage"><section class="tb-emptybag tb-peach"><h1 class="sr-only">Your bag</h1>' + bubble('<strong class="tb-big">' + c.empty[0] + ".</strong><span>" + c.empty[1] + "</span>", "tb-paper is-big") + '<div class="tb-actions">' + btn("/shop", "Shop all seven", "is-ink") + chip("/bundles", "Browse the edits") + '</div></section><div class="tb-wrap"><h2 class="tb-mid">A few to start with</h2><div class="tb-archgrid is-compact">' + ctx.published.slice(0, 3).map(function (p) { return arch(ctx, p); }).join("") + "</div></div></div>";
    return '<div class="tb-page tb-bagpage">' + header("lime", "Your bag · " + ctx.count + " item" + (ctx.count === 1 ? "" : "s"), "Good picks.", "Let's check out.", c.note) +
      '<div class="tb-wrap tb-bag-grid"><ol class="tb-baglines">' + items.map(function (x) {
        var p = x.p;
        return '<li class="tb-bagline" style="' + ctx.capStyle(p) + '"><a class="tb-bag-photo" href="/products/' + p.id + '">' + photo(p) + '<span class="sr-only">' + ctx.escape(p.name) + '</span></a><div class="tb-bag-info"><h2><a href="/products/' + p.id + '">' + ctx.escape(p.name) + "</a></h2><p>" + pill(ctx.escape(ctx.format[p.id])) + " " + ctx.money(p.price) + ' each · sample</p><div class="tb-qty quantity-control"><button data-quantity="' + p.id + '" data-change="-1" aria-label="Decrease ' + ctx.escape(p.name) + ' quantity">−</button><span aria-label="Quantity">' + x.q + '</span><button data-quantity="' + p.id + '" data-change="1" aria-label="Increase ' + ctx.escape(p.name) + ' quantity">+</button></div><button class="tb-remove remove" data-remove="' + p.id + '">Remove</button></div><strong class="tb-bag-total">' + ctx.money(p.price * x.q) + "</strong></li>";
      }).join("") + '</ol><aside class="tb-sum"><p class="tb-card-k">Order summary</p><div class="sum-row"><span>Sample subtotal</span><strong>' + ctx.money(ctx.total) + '</strong></div><div class="sum-row"><span>Delivery</span><span>At checkout</span></div>' + btn("/checkout", "Continue to checkout", "is-ink is-full") + '<p class="tb-small">No money is collected in the preview.</p></aside></div><div class="tb-wrap tb-chipsrow">' + c.next.map(function (n, i) { return chip(n[0], n[1], "tb-" + TINTS[i]); }).join("") + chip("/shop", "Keep shopping", "tb-peach") + "</div></div>";
  }

  /* ---------- Checkout ---------- */
  function checkout(ctx, fx) {
    var c = S.copy.checkout;
    if (fx === "unavailable" || (!fx && ctx.staticPreview)) return unavailable(ctx, "/checkout");
    var sm = fx === "sample" || fx === "errors";
    var items = sm ? [{ id: "vitamin-d3-k2", quantity: 1 }, { id: "omega-3-fish-oil", quantity: 2 }] : ctx.state.cart;
    if (!items.length) return '<div class="tb-page"><section class="tb-emptybag tb-peach"><h1 class="sr-only">Checkout</h1>' + bubble('<strong class="tb-big">Your bag is empty.</strong><span>Add a product before checking out.</span>', "tb-paper is-big") + btn("/shop", "Shop all seven", "is-ink") + "</section></div>";
    var err = fx === "errors" ? { name: "Add the name for the delivery.", mobile: "Use a 10-digit mobile starting with 6, 7, 8 or 9.", pincode: "Use a 6-digit pincode that doesn't start with 0.", adult: "Please confirm the purchaser is 18 or older.", form: "A few details need fixing before we can create the order." } : null;
    var vals = fx === "sample" ? S.fixtures.contact : fx === "errors" ? { address: S.fixtures.contact.address, city: "Bengaluru", state: "Karnataka", mobile: "12345", pincode: "012345" } : { mobile: (ctx.user && ctx.user.mobile) || "" };
    var s = ctx.forms.summary(items, sm);
    return '<div class="tb-page tb-checkout">' + (sm ? sample("Synthetic details for reviewing the design. Every field is disabled; nothing is submitted or saved.") : "") + header("lilac", "Checkout · as a guest", "Nearly there.", "Nothing is charged.", c.lede) +
      '<div class="tb-wrap tb-co-grid"><form id="checkout-form" class="tb-co-form checkout-form">' +
      '<section class="tb-co-panel tb-paper"><h2 class="tb-mid"><span class="tb-num tb-lilac">1</span>' + c.steps[0] + "</h2>" + ctx.forms.delivery(vals, sm, err) + "</section>" +
      '<section class="tb-co-panel tb-paper"><h2 class="tb-mid"><span class="tb-num tb-sage">2</span>' + c.steps[1] + "</h2>" + ctx.forms.payment(sm) + "</section>" +
      '<section class="tb-co-panel tb-paper"><h2 class="tb-mid"><span class="tb-num tb-lime">3</span>' + c.steps[2] + "</h2>" + ctx.forms.confirm(sm, err) + '<p class="tb-small">' + c.privacy + "</p></section></form>" +
      '<aside class="tb-sum order-summary checkout-summary"><p class="tb-card-k">In your bag · ' + s.count + "</p>" + s.lines + s.discount + s.totals + '<p class="tb-small">Sample pricing only; no final GST calculation is shown.</p><div class="tb-after"><p class="tb-card-k">Then what?</p>' + numbered(c.after, 1) + "</div></aside></div></div>";
  }

  /* ---------- Payment ---------- */
  function view(o, fx) { if (fx) return fx; if (!o) return "missing"; if (o.state === "paid") return "paid"; if (o.state === "pending") return o.expires < Date.now() / 1000 ? "expired" : "pending"; return "inactive"; }
  function payment(ctx, o, fx) {
    var v = view(o, fx);
    if (v === "missing") return notFound(ctx);
    var sm = !!fx;
    var t = { pending: ["lime", "Ready when", "you are.", "Try a success or a failure. Your items are held for 15 minutes.", "⏱"], failed: ["peach", "That didn't", "go through.", "No money moved. Your items are still held, so you can try again.", "!"], paid: ["sage", "Payment", "received.", "No money moved. Your preview order is confirmed.", "✓"], expired: ["peach", "Time's", "up on this one.", "The 15-minute hold has ended. Start a new checkout to check availability again.", "⌛"], unavailable: ["lilac", "Payments are", "taking a break.", "The payment service didn't respond. Nothing was charged; try again shortly.", "…"], inactive: ["paper", "No payment", "needed.", "This order no longer has an active payment step.", "·"] }[v];
    var act = v === "pending" || v === "failed"
      ? '<button class="tb-btn is-ink is-full" data-pay="success" data-id="' + o.id + '"' + (sm ? " disabled" : "") + '><span>Simulate successful payment</span></button><button class="tb-btn is-ghost is-full" data-pay="failure" data-id="' + o.id + '"' + (sm ? " disabled" : "") + '><span>Simulate failed payment</span></button>' + (sm ? "" : '<p class="reservation-time" data-expires="' + o.expires + '"></p>') + '<p id="payment-result" role="status">' + (v === "failed" ? "Preview payment failed. You can try again." : "") + "</p>"
      : v === "expired" ? btn("/cart", "Back to your bag", "is-ink") : v === "unavailable" ? '<button class="tb-btn is-ink" disabled><span>Try again</span></button>' + chip("/cart", "Back to your bag") : btn("/orders/" + o.id, "View your order", "is-ink");
    return '<div class="tb-page tb-pay">' + (sm ? sample("Synthetic order SAMPLE-1042. No payment, order or record exists.") : "") + '<section class="tb-paystate tb-' + t[0] + '"><span class="tb-payicon" aria-hidden="true">' + t[4] + "</span>" + pill("Payment · " + ctx.escape(o.id), "is-dark") + big(t[1], t[2]) + '<p class="tb-lede">' + t[3] + '</p><p class="tb-payamt"><span>Sample total</span><strong>' + ctx.money(o.total) + '</strong></p><div class="tb-payact">' + act + "</div></section>" +
      '<div class="tb-wrap"><aside class="tb-sum is-wide"><p class="tb-card-k">Order record</p>' + o.items.map(function (i) { return '<div class="sum-row"><span>' + ctx.escape(i.name) + " × " + i.quantity + "</span><strong>" + ctx.money(i.unit_price * i.quantity) + "</strong></div>"; }).join("") + '<div class="sum-row"><span>Sample discount</span><span>−' + ctx.money(o.discount) + '</span></div><div class="sum-row"><span>Sample shipping</span><span>' + ctx.money(o.shipping) + '</span></div><div class="sum-row summary-total"><span>Total</span><strong>' + ctx.money(o.total) + '</strong></div><p class="tb-small">Real payments need Razorpay credentials, signature verification, webhook reconciliation and settlement testing. None is connected.</p></aside></div></div>';
  }

  /* ---------- Order ---------- */
  function order(ctx, o, fx) {
    if (!o) return '<div class="tb-page"><section class="tb-emptybag tb-peach"><h1 class="sr-only">Order</h1>' + bubble('<strong class="tb-big">Order not found.</strong><span>Sign in to the customer session that owns this order.</span>', "tb-paper is-big") + btn("/account", "Your account", "is-ink") + "</section></div>";
    var sm = !!fx, st = o.state;
    var t = { pending: ["lime", "Waiting for", "payment."], paid: ["sage", "We've got", "your order."], shipped: ["lilac", "It's on", "its way."], delivered: ["lime", "At your", "door!"], cancelled: ["peach", "Order", "cancelled."], expired: ["peach", "Order", "expired."] }[st] || ["paper", "Your", "order."];
    var steps = [["pending", "Created"], ["paid", "Paid"], ["shipped", "Shipped"], ["delivered", "Delivered"]];
    var customer = sm || (ctx.user && ctx.user.role === "customer");
    var canCancel = customer && ["pending", "paid"].indexOf(st) >= 0;
    var reviewed = (ctx.account && ctx.account.reviews) || [];
    var ri = o.items.filter(function (i) { return !reviewed.some(function (r) { return r.order_id === o.id && r.product === i.id; }); });
    var review = customer && st === "delivered" ? (ri.length ? '<section class="tb-co-panel tb-lilac">' + pill("Verified delivery", "is-dark") + '<h2 class="tb-mid">How was it?</h2><p>Only delivered orders can be reviewed, and every review is moderated first.</p>' + ctx.forms.reviewForm(o, ri, sm) + "</section>" : bubble("<strong>Review submitted</strong><span>Your review is awaiting moderation.</span>", "tb-sage is-big")) : "";
    return '<div class="tb-page tb-order">' + (sm ? sample("Synthetic order with a fictional address. Nothing was ordered or shipped.") : "") + '<section class="tb-orderhead tb-' + t[0] + '">' + pill("Order " + ctx.escape(o.id) + " · " + ctx.date(o.created), "is-dark") + big(t[1], t[2]) + '<p class="tb-lede">Preview transaction only. Nothing was charged or shipped.</p><ol class="tb-progress">' + steps.map(function (s) { var h = (o.history || []).find(function (x) { return x.state === s[0]; }); return '<li class="' + (h ? "is-done" : "") + '"><strong>' + s[1] + "</strong><small>" + (h ? ctx.date(h.at) : "Not yet") + "</small></li>"; }).join("") + "</ol></section>" +
      '<div class="tb-wrap tb-co-grid"><div>' + (o.provider ? bubble("<strong>Tracking</strong><span>" + ctx.escape(o.provider) + " · " + ctx.escape(o.tracking) + ". Simulated; no shipment was booked.</span>", "tb-paper") : "") + (o.refund && o.refund !== "none" ? bubble("<strong>Refund " + ctx.escape(o.refund.replace(/_/g, " ")) + "</strong><span>Refunds are recorded by store support. No money moves in this local preview.</span>", "tb-peach") : "") +
      '<ol class="tb-baglines">' + o.items.map(function (i) { var p = ctx.product(i.id); return '<li class="tb-bagline" style="' + (p ? ctx.capStyle(p) : "") + '"><a class="tb-bag-photo" href="/products/' + i.id + '">' + (p ? photo(p) : "") + '<span class="sr-only">' + ctx.escape(i.name) + '</span></a><div class="tb-bag-info"><h2><a href="/products/' + i.id + '">' + ctx.escape(i.name) + "</a></h2><p>Quantity " + i.quantity + '</p></div><strong class="tb-bag-total">' + ctx.money(i.quantity * i.unit_price) + "</strong></li>"; }).join("") + "</ol>" +
      '<div class="tb-actions">' + (st === "pending" ? btn("/payment/" + o.id + (sm ? "?state=pending" : ""), "Continue payment", "is-ink") : "") + (canCancel ? '<button class="tb-btn is-ghost" data-cancel="' + o.id + '"' + (sm ? " disabled" : "") + "><span>Cancel order</span></button>" : "") + '<button class="tb-btn is-ghost" data-reorder="' + o.id + '"' + (sm ? " disabled" : "") + "><span>Reorder</span></button>" + chip("/contact?order=" + o.id, "Get help with this order") + "</div>" + review + "</div>" +
      '<aside class="tb-sum"><p class="tb-card-k">Summary</p><div class="sum-row"><span>Sample subtotal</span><span>' + ctx.money(o.subtotal) + '</span></div><div class="sum-row"><span>Sample discount</span><span>−' + ctx.money(o.discount) + '</span></div><div class="sum-row"><span>Sample delivery</span><span>' + ctx.money(o.shipping) + '</span></div><div class="sum-row summary-total"><span>Total</span><strong>' + ctx.money(o.total) + '</strong></div><p class="tb-card-k">Delivering to</p><address>' + ctx.escape(o.contact.name) + "<br>" + ctx.escape(o.contact.address) + "<br>" + ctx.escape(o.contact.city) + ", " + ctx.escape(o.contact.state) + " " + ctx.escape(o.contact.pincode) + '</address><p class="tb-small">Policy snapshot: ' + ctx.escape(o.policy_version) + "</p></aside></div></div>";
  }

  /* ---------- Account ---------- */
  function account(ctx, tab, fx) {
    var c = S.copy.account;
    var a = ctx.account || { orders: [], addresses: [], cases: [] };
    var sm = !!fx;
    var guest = fx ? fx === "signed-out" || fx === "code" : !ctx.user || ctx.user.id.indexOf("guest-") === 0;
    if (fx) a = { orders: fx === "orders" ? [S.fixtures.order("delivered", ctx.catalog), Object.assign(S.fixtures.order("paid", ctx.catalog), { id: "SAMPLE-1037" })] : [], addresses: fx === "sample" ? S.fixtures.addresses() : [], cases: fx === "sample" ? S.fixtures.cases : [] };
    var tabs = '<nav class="tb-tabs" aria-label="Account sections">' + [["orders", "Orders", "/account"], ["addresses", "Addresses", "/account/addresses"], ["cases", "Support cases", "/account/cases"], ["preferences", "Preferences", "/settings"]].map(function (x) { return '<a href="' + x[2] + (sm ? "?state=" + (x[0] === "orders" ? "orders" : "sample") : "") + '"' + (x[0] === tab ? ' aria-current="page"' : "") + ">" + x[1] + "</a>"; }).join("") + (guest ? "" : '<button data-action="logout"' + (sm ? " disabled" : "") + ">Sign out</button>") + "</nav>";
    var login = guest ? '<section class="tb-login tb-lilac"><div>' + pill("Sign in", "is-dark") + '<h2 class="tb-big">Your orders,<br><em>one place.</em></h2><p>' + c.signIn + '</p></div><div class="tb-login-card">' + (fx === "code" ? ctx.forms.codeEntry("482913") : ctx.forms.otp(sm)) + "</div></section>" : "";
    var body;
    if (tab === "addresses") body = '<div class="tb-co-grid"><div><h2 class="tb-mid">Saved addresses</h2>' + (a.addresses.length ? a.addresses.map(function (v, i) { return '<address class="tb-addr tb-' + TINTS[i % 4] + '"><strong>' + ctx.escape(v.name) + "</strong><br>" + ctx.escape(v.address) + "<br>" + ctx.escape(v.city) + ", " + ctx.escape(v.state) + " " + ctx.escape(v.pincode) + "</address>"; }).join("") : bubble("<strong>No saved addresses yet.</strong><span>Add one and it'll be ready at checkout.</span>", "tb-paper")) + '</div><section class="tb-co-panel tb-paper"><h2 class="tb-mid">Add an address</h2>' + ctx.forms.address(sm) + "</section></div>";
    else if (tab === "cases") body = '<div class="tb-row-head"><h2 class="tb-mid">Your support cases</h2>' + chip("/contact", "Open a new case", "tb-lime") + "</div>" + (a.cases.length ? '<div class="tb-cases">' + a.cases.map(function (k, i) { return '<article class="tb-case tb-' + TINTS[i % 4] + '">' + pill(ctx.escape(k.kind)) + pill(ctx.escape(k.state), "is-dark") + "<h3>" + ctx.escape(k.id) + "</h3><p>" + ctx.escape(k.message) + "</p><small>" + ctx.escape(k.owner) + " · " + ctx.escape(k.sla) + "</small>" + (k.order_id ? chip("/orders/" + k.order_id + (sm ? "?state=paid" : ""), k.order_id) : "") + "</article>"; }).join("") + "</div>" : bubble("<strong>No open cases.</strong><span>Cases and their updates will show up here.</span>" + chip("/contact", "Contact support"), "tb-paper is-big"));
    else body = '<h2 class="tb-mid">Your orders</h2>' + (a.orders.length ? '<div class="tb-orders">' + a.orders.map(function (o, i) { return '<a class="tb-ordercard tb-' + TINTS[i % 4] + '" href="/orders/' + o.id + (sm ? "?state=" + o.state : "") + '">' + pill(ctx.escape(o.state), "is-dark") + "<strong>" + ctx.escape(o.id) + "</strong><span>" + ctx.date(o.created) + " · " + o.items.reduce(function (n, x) { return n + x.quantity; }, 0) + " items · " + ctx.money(o.total) + ' sample</span><span class="tb-go">View order →</span></a>'; }).join("") + "</div>" : bubble("<strong>No orders yet.</strong><span>Orders you place in this session will show up here.</span>" + btn("/shop", "Shop all seven", "is-ink"), "tb-paper is-big"));
    return '<div class="tb-page tb-account">' + (sm ? sample("Synthetic account data. No sign-in, address or case exists.") : "") + header("peach", "Your account", "Hey,", guest ? "you." : "welcome back.", guest ? c.lede : "Signed in with mobile ending " + ctx.escape(sm ? "0000" : ctx.user.mobile.slice(-4)) + ".") + login + '<div class="tb-wrap">' + tabs + body + "</div></div>";
  }

  /* ---------- Help & contact ---------- */
  function help(ctx) {
    var c = S.copy.help;
    var tints = ["lilac", "sage", "lime", "peach", "lilac", "sage"];
    return '<div class="tb-page tb-help">' + header("lime", "Help centre", "How can", "we help?", c.lede) +
      '<div class="tb-wrap"><div class="tb-topics">' + c.topics.map(function (t, i) { return '<a class="tb-topic tb-' + (t[0] === "safety" ? "peach is-safety" : tints[i]) + '" id="' + t[0] + '" href="' + t[3] + '"><span class="tb-num">' + (i + 1) + "</span><strong>" + t[1] + "</strong><span>" + t[2] + '</span><span class="tb-go">' + t[4] + " →</span></a>"; }).join("") + "</div>" +
      c.topics.filter(function (t) { return c.faqs.some(function (f) { return f[0] === t[0]; }); }).map(function (t) { return '<section class="tb-faqset"><h2 class="tb-mid">' + t[1] + '</h2><div class="tb-faq">' + c.faqs.filter(function (f) { return f[0] === t[0]; }).map(function (f) { return "<details><summary><span>" + f[1] + '</span><span class="tb-plus" aria-hidden="true">＋</span></summary><p>' + f[2] + "</p></details>"; }).join("") + "</div></section>"; }).join("") + "</div>" +
      band("indigo", '<div class="tb-helpcta">' + pill("Still stuck?", "is-lime") + '<h2 class="tb-big">Open a case.<br><em>Keep one record.</em></h2><p>' + S.copy.contact.lede + '</p><div class="tb-actions">' + btn("/contact", "Contact support", "is-lime") + chip("/contact?kind=safety", "Report a product safety issue") + "</div></div>") + "</div>";
  }
  function contact(ctx, fx) {
    var c = S.copy.contact;
    if (fx === "unavailable" || (!fx && ctx.staticPreview)) return unavailable(ctx, "/contact");
    var sm = !!fx;
    var right = fx === "submitted" ? '<div class="report-result case-created tb-created" role="status">' + pill("Case created · sample", "is-dark") + '<h2 class="tb-big">SAMPLE-CASE-01</h2><p>This is how a confirmation looks. In this design state, nothing was saved or sent.</p>' + chip("/account/cases?state=sample", "Follow your case") + "</div>" : ctx.forms.caseForm(ctx.query.get("order") || "", ctx.query.get("kind") || "general", sm, fx === "errors" ? { message: "Tell us a little more: at least 10 characters." } : null);
    return '<div class="tb-page tb-contact">' + (sm ? sample("Visual state only. Nothing is sent or saved.") : "") + header("lilac", "Contact", "Talk to", "a person.", c.lede) +
      '<div class="tb-wrap tb-co-grid"><div><h2 class="tb-mid">Ways to reach us</h2><div class="tb-channels">' + c.channels.map(function (ch, i) { return '<div class="tb-' + TINTS[i] + '"><strong>' + ch[0] + "</strong><span>" + ch[1] + "</span></div>"; }).join("") + "</div>" + bubble("<strong>Product issue?</strong><span>" + c.safety + "</span>", "tb-peach is-big") + '<p class="tb-small">' + c.privacy + '</p></div><section class="tb-co-panel tb-paper">' + right + "</section></div></div>";
  }

  /* ---------- Policies ---------- */
  function policy(ctx, kind) {
    var p = S.policies[kind];
    if (!p) return notFound(ctx);
    var colors = { "working-direction": "sage", unresolved: "peach", "preview-behaviour": "lilac" };
    return '<div class="tb-page tb-policy"><nav class="tb-polnav" aria-label="Policies">' + S.policyOrder.map(function (k) { return '<a href="/policies/' + k + '"' + (k === kind ? ' aria-current="page"' : "") + ">" + S.policies[k].title + "</a>"; }).join("") + "</nav>" + header("sage", "Policy draft · not final terms", p.title, "", "", bubble("<strong>In plain words</strong><span>" + p.plain + "</span>", "tb-paper is-big")) +
      '<div class="tb-wrap tb-polcards">' + p.sections.map(function (s) { var k = s[2].toLowerCase().replace(/\s+/g, "-"); return '<section class="tb-polcard tb-' + (colors[k] || "paper") + '">' + pill(s[2], "is-dark") + '<h2 class="tb-mid">' + s[0] + "</h2><p>" + s[1] + "</p></section>"; }).join("") + '</div><div class="tb-wrap"><p class="tb-small">These are working drafts for review, not final terms for a live store. Anything marked unresolved hasn\'t been decided.</p><div class="tb-chipsrow">' + chip("/help", "Help centre", "tb-lime") + chip("/contact", "Ask a question", "tb-lilac") + "</div></div></div>";
  }

  function settings(ctx) {
    var c = S.copy.settings;
    return '<div class="tb-page tb-settings">' + header("lime", "Preferences", "Your choices.", "Your call.", c.lede) + '<div class="tb-wrap tb-narrow"><section class="tb-co-panel tb-paper">' + ctx.forms.preferences(c.groups) + '</section><p class="tb-small">Read the <a href="/policies/privacy">privacy draft</a> for what the preview stores.</p></div></div>';
  }
  function notFound(ctx) {
    var c = S.copy.notFound;
    return '<div class="tb-page"><section class="tb-emptybag tb-lilac"><p class="tb-mega" aria-hidden="true">404</p><h1 class="sr-only">' + c[0] + "</h1>" + bubble('<strong class="tb-big">' + c[0] + ".</strong><span>" + c[1] + "</span>", "tb-paper is-big") + '<div class="tb-actions">' + btn("/shop", "Shop all seven", "is-ink") + chip("/learn", "Learn") + chip("/help", "Help centre") + "</div></section></div>";
  }
  function unavailable(ctx, path) {
    var map = { checkout: "Checkout", payment: "Payment", orders: "Order", account: "Account", contact: "Contact" };
    var st = (S.states.find(function (s) { return s[0] === map[path.split("/")[1]]; }) || [0, []])[1];
    return '<div class="tb-page"><section class="tb-emptybag tb-lime"><h1 class="sr-only">Not available in this preview</h1>' + bubble('<strong class="tb-big">This bit is switched off here.</strong><span>You can browse all four designs, look at every product and try the sample bag and lot lookup. Ordering, sign-in and support submissions aren\'t enabled on this shared preview, and nothing you type is collected.</span>', "tb-paper is-big") + '</section><div class="tb-wrap"><h2 class="tb-mid">See the designed states instead</h2><div class="tb-readcards">' + st.map(function (s, i) { return '<a class="tb-readcard tb-' + TINTS[i % 4] + '" href="' + s[0] + '">' + pill("Synthetic fixture") + "<strong>" + s[1] + "</strong><span>Nothing is saved</span></a>"; }).join("") + '</div><div class="tb-chipsrow">' + btn("/shop", "Continue shopping", "is-ink") + chip("/preview/states", "All design states") + "</div></div></div>";
  }
  function states(ctx) {
    return '<div class="tb-page">' + header("peach", "Design states", "Every state.", "One index.", "Synthetic fixtures for reviewing transactional and edge states. None creates an order, payment, message or account record.") + '<div class="tb-wrap">' + S.states.map(function (g, i) { return '<section class="tb-faqset"><h2 class="tb-mid">' + g[0] + '</h2><div class="tb-readcards">' + g[1].map(function (s, j) { return '<a class="tb-readcard tb-' + TINTS[(i + j) % 4] + '" href="' + s[0] + '"><strong>' + s[1] + "</strong><span>" + s[0] + "</span></a>"; }).join("") + "</div></section>"; }).join("") + "</div></div>";
  }
  function learnOffline() { return '<div class="tb-page"><section class="tb-emptybag tb-peach"><h1 class="sr-only">Learn</h1>' + bubble('<strong class="tb-big">Learn is offline.</strong><span>The ingredient library isn\'t published right now.</span>', "tb-paper is-big") + btn("/shop", "Shop all seven", "is-ink") + "</section></div>"; }

  S.themes.b = { chrome: chrome, home: home, shop: shop, bundles: bundles, search: search, standards: standards, story: story, learn: learn, reports: reports, cart: cart, checkout: checkout, payment: payment, order: order, account: account, help: help, contact: contact, policy: policy, settings: settings, notFound: notFound, unavailable: unavailable, states: states, learnOffline: learnOffline };
})();
