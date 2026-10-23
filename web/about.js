/* Body Café Co. — About page for all eight directions (A–H).

   One content model, one section order and one behaviour. Each direction composes the same sections in its own
   visual language (about.css, scoped to .ab-a … .ab-h). This file replaces only each theme's `about` renderer:
   /story (the founder's journey) and /standards (ingredients, quality and evidence) are unchanged.

   Sections, in order (each has a shareable anchor):
     #meet     1 Meet Body Café Co.            #values      5 Values in practice
     #why      2 Why we exist                  #collection  6 Our approach to the collection
     #name     3 Why "Body Café Co."?          #behind      7 Behind the scenes
     #people   4 The people behind the brand   #talk        8 Keep the conversation going

   Content rules: approved copy only (BCCSite.copy.about / copy.story and the catalogue). No names, roles,
   credentials, portraits, dates, milestones, customer numbers, awards, facilities, sourcing, testing or
   sustainability claims are invented. People appear only from the PEOPLE record below, which stays empty until
   approved introductions are supplied. Behind-the-scenes images are the brand's own design assets and draft
   packaging renders, captioned as such; no staged or stock imagery. */
(function () {
  "use strict";
  var S = window.BCCSite;
  if (!S || !S.themes) return;

  /* ====================================================================================================
     1. CONTENT
     ==================================================================================================== */

  /* Approved people. Add entries only from approved, verified material:
       { name, role, portrait: { src, alt, w, h }, intro, bio (optional, longer), note (optional founder's note) }
     The page renders portraits, roles, an expandable biography and the founder's note automatically. */
  var PEOPLE = [];

  var NAV = [
    ["meet", "Meet us"], ["why", "Why we exist"], ["name", "The name"], ["people", "People"],
    ["values", "Values"], ["collection", "The collection"], ["behind", "Behind the scenes"], ["talk", "Talk to us"],
  ];

  var C = {
    kicker: "About Body Café Co.",
    title: "A supplement shop that shows its working",
    meet: [
      "We make seven everyday supplements and put the details where you can find them: the ingredient, the format, the label and the record for your lot.",
      "We're making them for curious, sceptical shoppers in India who read labels, compare products and would rather check than be told.",
    ],
    view: "Our point of view is simple: detail you can check comes before badges you can't.",
    why: {
      problem: "Most supplement shopping asks for trust first and offers detail later, if at all. We think it should work the other way round.",
      experience: "Before you choose, you should be able to see what's in a product, in what form, and where the record for your bottle lives. You don't need a science degree. You do deserve straight answers, in plain English first.",
      tone: "We'd like supplements to feel less clinical and more like something you can talk about. But a light tone is never a reason to blur a fact. If something isn't confirmed yet, we say so plainly.",
    },
    name: {
      quote: "A good café is an everyday place. Nobody minds if you ask what's in something, and the menu tells you before you order.",
      body: "That's the counter we want to run: unhurried, curious and specific. The café isn't a theme. It's a standard for how a shop should treat a question.",
      note: "There's no café to visit. The name describes how we want to treat your questions, wherever you shop with us.",
    },
    people: {
      empty: "We'd rather introduce ourselves properly than fill this space with stock faces or an invented history. The people behind Body Café Co. will introduce themselves here, in their own words.",
      story: "Read our story",
    },
    values: [
      { id: "clarity", title: "Clarity", line: "Understandable product and ingredient details.",
        practice: "Every product page separates what's confirmed now from what the approved rear label will add, in readable text rather than small print.",
        links: [["/products/iron-bisglycinate#ingredients", "See a product's ingredient details"], ["/learn/reading-a-label", "How to read a label"]] },
      { id: "curiosity", title: "Curiosity", line: "Questions are welcome, and unfamiliar terms get explained.",
        practice: "Short guides and a glossary explain serving sizes, ingredient forms and lot numbers. Product pages take questions, answered by our support team after review.",
        links: [["/learn", "Open the guides"], ["/products/omega-3-fish-oil#questions", "Ask about a product"]] },
      { id: "accountability", title: "Accountability", line: "Statements connect to the records behind them.",
        practice: "Each pack carries a lot number that leads to its batch record. Where an approval or document is still on its way, the page says so. Records in this preview are demonstrations.",
        links: [["/standards#lot", "How packs link to lots"], ["/reports", "Look up a lot"]] },
      { id: "care", title: "Care", line: "A clear, accessible route to a person.",
        practice: "Support works through cases: each one gets an ID you can follow in your account. Product safety questions are flagged as a priority.",
        links: [["/contact", "Open a support case"], ["/help", "Visit the help centre"]] },
    ],
    collection: {
      lead: "We start with seven everyday supplements. Each is named for what's in it, and each has its own cap colour, so the range is easy to read from across the room.",
      packaging: "Packaging is a draft. Amounts, directions and cautions will come from approved rear labels; until then, product pages show them as awaiting approval rather than guessing.",
    },
    gallery: [
      { src: "/web/media/premium/iron-bisglycinate-detail.webp", w: 1800, h: 2400, alt: "Close-up of the Iron Bisglycinate pack: the Body Café Co. wordmark beneath a rust-red cap", title: "The pack, up close", caption: "Draft packaging for Iron Bisglycinate: the wordmark and cap. A studio render of the pack design, not a photograph." },
      { src: "/web/media/about/caps-row.webp", w: 2340, h: 360, alt: "Seven product caps seen from above, in rust, olive, indigo, grey-blue, lilac, teal and sand", title: "Seven caps, seen from above", caption: "One cap colour per product, in catalogue order from Iron Bisglycinate to Psyllium Husk. Studio renders." },
      { src: "/web/media/about/cap-colours.webp", w: 980, h: 850, alt: "Brand colour sheet listing each of the seven products beside its Pantone cap colour", title: "The cap-colour sheet", caption: "From our brand colour guide: the Pantone reference assigned to each product's cap." },
      { src: "/web/media/about/logo-clear-space.webp", w: 1000, h: 1024, alt: "The Body Café Co. logo inside a construction grid showing its clear space", title: "Room to breathe", caption: "From our brand guide: the clear space kept around the logo so it always reads cleanly." },
      { src: "/web/media/about/type-specimen.webp", w: 1400, h: 812, alt: "Type specimen showing LEMON MILK styles and the Aileron family", title: "Two typefaces", caption: "From our brand guide: LEMON MILK for the logo family, Aileron for everything you read." },
    ],
    behindNote: "These are our own design files and packaging renders. Photographs of the team at work will be added as they're taken.",
    talk: {
      lead: "Questions about who we are, the name or how we work are welcome. Send one to the team and you'll get a case ID to follow.",
      contact: "Support runs through cases on this site. WhatsApp, email and phone details will be published once confirmed.",
    },
  };

  /* ====================================================================================================
     2. BUILDERS — semantic HTML with ab-* hooks; directions restyle these and never change facts.
     ==================================================================================================== */
  function h(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function arrow(href, label, cls) { return '<a class="' + (cls || "ab-link") + '" href="' + href + '"><span>' + label + '</span><span class="ab-arr" aria-hidden="true">→</span></a>'; }

  function nav(v) {
    return '<nav class="ab-nav" aria-label="On this page"><p class="ab-nav-k" aria-hidden="true">' + (v.navLabel || "On this page") + '</p><ol>' + NAV.map(function (x, i) {
      return '<li><a href="#' + x[0] + '" data-ab-nav="' + x[0] + '"><span class="ab-nav-n" aria-hidden="true">' + (v.num ? v.num(i + 1) : pad(i + 1)) + "</span>" + x[1] + "</a></li>";
    }).join("") + "</ol></nav>";
  }
  function section(v, id, n, title, inner, cls) {
    return '<section class="ab-sec ab-sec-' + id + (cls ? " " + cls : "") + '" id="' + id + '" aria-labelledby="' + id + '-t"><div class="ab-sec-in">' +
      '<header class="ab-head"><p class="ab-k">' + (v.k ? v.k(n, NAV[n - 1][1]) : pad(n) + " · " + NAV[n - 1][1]) + '</p><h2 id="' + id + '-t">' + title + "</h2></header>" +
      '<div class="ab-body">' + inner + "</div></div></section>";
  }

  function lineup(ctx) {
    return '<figure class="ab-lineup"><div class="ab-lineup-row">' + ctx.published.map(function (p, i) {
      var w = (ctx.bottleWidth && ctx.bottleWidth[p.id]) || 720;
      return '<img src="/web/media/' + p.id + '.webp" alt="" width="' + w + '" height="1000" decoding="async"' + (i < 4 ? ' fetchpriority="high"' : ' loading="lazy"') + ' style="--i:' + i + '">';
    }).join("") + '</div><figcaption class="ab-cap">The seven, as draft packaging: ' + ctx.published.map(function (p) { return h(p.name); }).join(", ") + ".</figcaption></figure>";
  }

  function meet(v, ctx) {
    return '<section class="ab-meet" id="meet" aria-labelledby="ab-h1"><div class="ab-meet-in">' +
      '<div class="ab-meet-text">' + (v.pre ? v.pre(ctx) : "") + '<p class="ab-kicker">' + (v.kicker || C.kicker) + '</p><h1 class="ab-h1" id="ab-h1">' + (v.title ? v.title(C.title) : C.title) + "</h1>" +
      C.meet.map(function (p, i) { return '<p class="' + (i ? "ab-p" : "ab-lede") + '">' + p + "</p>"; }).join("") +
      '<p class="ab-view">' + C.view + '</p><p class="ab-meet-links">' + arrow("#people", "Meet the people", "ab-btn") + arrow("#values", "How we work", "ab-btn is-quiet") + "</p></div>" +
      '<div class="ab-meet-media">' + lineup(ctx) + "</div></div></section>";
  }
  function why(v) {
    return section(v, "why", 2, v.whyTitle || "Why we exist",
      '<p class="ab-lead">' + C.why.problem + '</p><p class="ab-p">' + C.why.experience + '</p><p class="ab-p ab-tone">' + C.why.tone + "</p>");
  }
  function name(v) {
    return section(v, "name", 3, "Why “Body Café Co.”?",
      '<blockquote class="ab-quote"><p>' + C.name.quote + '</p></blockquote><p class="ab-p">' + C.name.body + '</p><p class="ab-note">' + C.name.note + "</p>" +
      '<p class="ab-more">' + arrow("/story", "Read the fuller story") + "</p>");
  }
  function person(p, i) {
    var pid = "ab-person-" + i;
    return '<li class="ab-person">' +
      (p.portrait ? '<figure class="ab-portrait"><img src="' + h(p.portrait.src) + '" alt="' + h(p.portrait.alt) + '" width="' + (p.portrait.w || 800) + '" height="' + (p.portrait.h || 1000) + '" loading="lazy" decoding="async"></figure>' : "") +
      '<div class="ab-person-text"><h3 id="' + pid + '">' + h(p.name) + '</h3><p class="ab-role">' + h(p.role) + "</p>" + (p.intro ? '<p class="ab-p">' + h(p.intro) + "</p>" : "") +
      (p.bio ? '<details class="ab-bio"><summary>More about ' + h(String(p.name).split(" ")[0]) + "</summary><p>" + h(p.bio) + "</p></details>" : "") + "</div></li>";
  }
  function people(v) {
    var list = (window.BCCAbout && window.BCCAbout.people) || PEOPLE;
    var note = list.filter(function (p) { return p.note; })[0];
    var inner = list.length
      ? '<ul class="ab-people">' + list.map(person).join("") + "</ul>" +
        (note ? '<figure class="ab-founder"><blockquote><p>' + h(note.note) + '</p></blockquote><figcaption>' + h(note.name) + ", " + h(note.role) + "</figcaption></figure>" : "")
      : '<div class="ab-people-empty"><p class="ab-lead">' + C.people.empty + "</p></div>";
    return section(v, "people", 4, "The people behind the brand", inner + '<p class="ab-more">' + arrow("/story", C.people.story) + arrow("/contact?kind=brand", "Ask the team a question") + "</p>");
  }
  function values(v) {
    return section(v, "values", 5, "Values in practice",
      '<ol class="ab-values">' + C.values.map(function (x, i) {
        return '<li class="ab-value" id="value-' + x.id + '"><p class="ab-value-n" aria-hidden="true">' + pad(i + 1) + '</p><h3>' + x.title + '</h3><p class="ab-value-line">' + x.line + '</p><p class="ab-p">' + x.practice + '</p><ul class="ab-links">' +
          x.links.map(function (l) { return "<li>" + arrow(l[0], l[1]) + "</li>"; }).join("") + "</ul></li>";
      }).join("") + "</ol>");
  }
  function collection(v, ctx) {
    var groups = {};
    ctx.published.forEach(function (p) { var f = ctx.format[p.id] || ""; (groups[f] = groups[f] || []).push(p); });
    var words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
    var fmts = Object.keys(groups).map(function (f) {
      var n = groups[f].length;
      return '<li><span class="ab-fmt-n">' + (words[n] || n) + "</span> " + h(f.toLowerCase()) + '<span class="ab-fmt-p">' + groups[f].map(function (p) { return h(p.name); }).join(", ") + "</span></li>";
    }).join("");
    var caps = '<ul class="ab-caps" aria-label="Cap colours">' + ctx.published.map(function (p) {
      return '<li style="--dot:' + h(p.color) + '"><a href="/products/' + p.id + '"><span class="ab-cap-dot" aria-hidden="true"></span><span>' + h(p.name) + "</span></a></li>";
    }).join("") + "</ul>";
    return section(v, "collection", 6, "Our approach to the collection",
      '<p class="ab-lead">' + C.collection.lead + '</p><ul class="ab-fmts">' + fmts + "</ul>" + caps + '<p class="ab-p">' + C.collection.packaging + "</p>" +
      '<p class="ab-more">' + arrow("/shop", "Browse the collection") + arrow("/standards", "Read our standards") + "</p>");
  }
  function behind(v) {
    var items = C.gallery.map(function (g, i) {
      return '<li class="ab-shot ab-shot-' + (i + 1) + '"><figure><button type="button" class="ab-open" data-ab-open="' + i + '" aria-label="Enlarge: ' + h(g.title) + '">' +
        '<img src="' + g.src + '" alt="' + h(g.alt) + '" width="' + g.w + '" height="' + g.h + '" loading="lazy" decoding="async"><span class="ab-zoom" aria-hidden="true">+</span></button>' +
        '<figcaption><strong>' + h(g.title) + "</strong> " + h(g.caption) + "</figcaption></figure></li>";
    }).join("");
    return section(v, "behind", 7, "Behind the scenes", '<ul class="ab-gallery">' + items + '</ul><p class="ab-small">' + C.behindNote + "</p>");
  }
  function talk(v) {
    var routes = [
      ["/contact?kind=brand", "Ask the team a question", "Opens a support case with “About the brand” selected."],
      ["/story", "Read the story", "Where Body Café Co. comes from."],
      ["/standards", "Explore our standards", "Ingredients, lots and what a report can show."],
      ["/shop", "Browse the collection", "All seven, with formats and sample prices."],
    ];
    return section(v, "talk", 8, "Keep the conversation going",
      '<p class="ab-lead">' + C.talk.lead + '</p><ul class="ab-routes">' + routes.map(function (r, i) {
        return '<li><a class="ab-route' + (i === 0 ? " is-primary" : "") + '" href="' + r[0] + '"><strong>' + r[1] + '</strong><span>' + r[2] + '</span><span class="ab-arr" aria-hidden="true">→</span></a></li>';
      }).join("") + '</ul><p class="ab-small">' + C.talk.contact + "</p>");
  }
  function lightbox() {
    return '<dialog class="ab-lightbox" aria-labelledby="ab-lb-t" data-ab-lightbox><div class="ab-lb-in"><div class="ab-lb-top"><p class="ab-lb-count" data-ab-lb-count aria-live="polite"></p>' +
      '<button type="button" class="ab-lb-btn" data-ab-close aria-label="Close">×</button></div><figure class="ab-lb-fig"><img data-ab-lb-img alt=""><figcaption><strong id="ab-lb-t" data-ab-lb-title></strong> <span data-ab-lb-cap></span></figcaption></figure>' +
      '<div class="ab-lb-nav"><button type="button" class="ab-lb-btn" data-ab-prev aria-label="Previous image">←</button><button type="button" class="ab-lb-btn" data-ab-next aria-label="Next image">→</button></div></div></dialog>';
  }

  function compose(v, ctx) {
    return '<div class="ab ab-' + v.key + '" data-ab data-ab-design="' + v.key + '">' + meet(v, ctx) + nav(v) +
      why(v) + name(v) + people(v) + values(v) + collection(v, ctx) + behind(v) + talk(v) + lightbox() + "</div>";
  }

  /* ====================================================================================================
     3. DIRECTIONS
     ==================================================================================================== */
  var ROMAN = ["", "i", "ii", "iii", "iv", "v", "vi", "vii", "viii"];
  var V = {
    /* A — State of Play: a poster index. Anton headlines, bracketed numbers, lime highlighter, graph paper. */
    a: { key: "a", kicker: "BCC / About", num: function (n) { return "[" + pad(n) + "]"; }, k: function (n, l) { return "[" + pad(n) + "] " + l; } },
    /* B — Expressive everyday: a lilac table of colour fields, rounded bands and a speech-bubble quote. */
    b: { key: "b", kicker: "Pull up a chair", k: function (n, l) { return '<span class="ab-disc">' + pad(n) + "</span> " + l; } },
    /* C — Everyday Elsewhere: butter paper, Gloock serif, chapters with stamps, the line-up in an arched window. */
    c: { key: "c", kicker: "Body Café Co. / An introduction", title: function (t) { return t.replace("shows its working", "<em>shows its working</em>"); }, k: function (n, l) { return "Chapter " + pad(n) + " · " + l; } },
    /* D — The Other Side: after hours. A lit vitrine for the line-up, gold wall labels, centred captions. */
    d: { key: "d", kicker: "Body Café Co. / After hours", title: function (t) { return t.replace("shows its working", "<em>shows its working.</em>"); }, k: function (n, l) { return "Room " + pad(n) + " · " + l; } },
    /* E — Fan Deck: each section is a swatch: a cap-colour band over a cream body. */
    e: { key: "e", kicker: "About · Body Café Co.", k: function (n, l) { return '<span class="ab-k-n">' + pad(n) + '</span><span class="ab-k-l">' + l + '</span><span class="ab-k-of">/ 08</span>'; } },
    /* F — Edition: a printed feature. Folio, ultralight headline, drop cap, pull quote. */
    f: { key: "f", kicker: "Feature · About us", pre: function () { return '<p class="ab-folio"><span>Edition 01</span><span>About Body Café Co.</span></p>'; }, k: function (n, l) { return "No. " + pad(n) + " · " + l; } },
    /* G — Darkroom: a contact sheet. Black and white sections in turn, frame numbers, a lit gallery wall. */
    g: { key: "g", kicker: "About / 8 frames", num: function (n) { return "F" + pad(n); }, k: function (n, l) { return "Frame " + pad(n) + " / 08 · " + l; } },
    /* H — Folio: a reference page. A sticky margin contents, § heads, ruled entries. */
    h: { key: "h", kicker: "About · Reference", navLabel: "Contents", num: function (n) { return "§ " + n; }, k: function (n, l) { return "§ " + n + " · " + l; } },
  };

  Object.keys(V).forEach(function (d) {
    if (!S.themes[d]) return;
    var base = S.themes[d], next = {};
    Object.keys(base).forEach(function (k) { next[k] = base[k]; });
    next.about = function (ctx) { return compose(V[d], ctx); };
    S.themes[d] = next;
  });

  /* ====================================================================================================
     4. BEHAVIOUR — section highlight, in-page anchors and the image viewer.
     ==================================================================================================== */
  var cleanup = function () {};
  var reduced = function () { return matchMedia("(prefers-reduced-motion: reduce)").matches; };

  function enhance() {
    cleanup();
    var root = document.querySelector("[data-ab]");
    if (!root) return;
    var abort = new AbortController(), signal = abort.signal, observers = [];
    var on = function (el, ev, fn) { if (el) el.addEventListener(ev, fn, { signal: signal }); };

    /* Section navigation: highlight the section in view; in-page links update the address so it can be shared. */
    var links = [].slice.call(root.querySelectorAll("[data-ab-nav]"));
    var mark = function (id) { links.forEach(function (a) { if (a.getAttribute("data-ab-nav") === id) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current"); }); };
    /* The current section is the last one whose top has passed the upper third of the screen. */
    var sections = NAV.map(function (x) { return document.getElementById(x[0]); }).filter(Boolean);
    var ticking = false, lockUntil = 0;
    var spy = function () {
      ticking = false;
      if (Date.now() < lockUntil) return;
      var line = innerHeight * 0.34, cur = sections[0];
      sections.forEach(function (el) { if (el.getBoundingClientRect().top <= line) cur = el; });
      if (cur) mark(cur.id);
    };
    on(window, "scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(spy); } });
    spy();
    on(root, "click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a || !root.contains(a)) return;
      var id = a.getAttribute("href").slice(1), target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var u = new URL(location.href);
      u.hash = id;
      history.replaceState(history.state, "", u.pathname + u.search + u.hash);
      /* Keep the chosen section highlighted while the smooth scroll passes the others. */
      lockUntil = Date.now() + (reduced() ? 0 : 900);
      setTimeout(spy, reduced() ? 0 : 950);
      target.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
      var focusable = target.querySelector("h2") || target;
      focusable.setAttribute("tabindex", "-1");
      focusable.focus({ preventScroll: true });
      mark(id);
    });

    /* Image viewer: a native modal dialog (focus contained, Escape closes, focus returns to the opened image). */
    var dlg = root.querySelector("[data-ab-lightbox]"), img = root.querySelector("[data-ab-lb-img]");
    var at = 0, opener = null;
    var show = function (i) {
      at = (i + C.gallery.length) % C.gallery.length;
      var g = C.gallery[at];
      img.src = g.src; img.alt = g.alt; img.width = g.w; img.height = g.h;
      root.querySelector("[data-ab-lb-title]").textContent = g.title;
      root.querySelector("[data-ab-lb-cap]").textContent = g.caption;
      root.querySelector("[data-ab-lb-count]").textContent = "Image " + (at + 1) + " of " + C.gallery.length;
    };
    on(root, "click", function (e) {
      var b = e.target.closest("[data-ab-open]");
      if (!b || !dlg) return;
      opener = b;
      show(Number(b.getAttribute("data-ab-open")));
      dlg.showModal();
      root.querySelector("[data-ab-close]").focus();
    });
    on(root.querySelector("[data-ab-close]"), "click", function () { dlg.close(); });
    on(root.querySelector("[data-ab-prev]"), "click", function () { show(at - 1); });
    on(root.querySelector("[data-ab-next]"), "click", function () { show(at + 1); });
    on(dlg, "keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); show(at - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); show(at + 1); }
    });
    on(dlg, "click", function (e) { if (e.target === dlg) dlg.close(); });
    on(dlg, "close", function () {
      var b = root.querySelector('[data-ab-open="' + at + '"]') || opener;
      if (b) b.focus();
    });

    cleanup = function () {
      abort.abort();
      observers.forEach(function (o) { o.disconnect(); });
      if (dlg && dlg.open) dlg.close();
    };
  }

  window.BCCAbout = window.BCCAbout || {};
  window.BCCAbout.enhance = enhance;
  window.BCCAbout.nav = NAV;
  window.BCCAbout.gallery = C.gallery;
})();
