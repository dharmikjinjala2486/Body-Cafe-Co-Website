/* Body Café Co. — Story page for all eight directions (A–H).

   Page roles: About = who we are today · Story = how it began and developed · Standards = quality and evidence ·
   Learn = product and ingredient education. This file replaces only each theme's `story` renderer.

   Chapters, in order (each has a shareable anchor):
     #opening 1 The opening moment                 #lessons   6 What the journey taught us
     #before  2 Before there was a brand           #founder   7 A note from the founder
     #question 3 The question we kept asking       #next      8 The next chapter
     #name    4 Becoming Body Café Co.
     #collection 5 Making the first collection

   Content rules: approved brand copy only (BCCSite.copy.story / copy.standards / catalogue) and the brand's own design
   assets. Chapters 2, 6 and 7, the timeline, the packaging-evolution viewer, founder media and the "decision that
   changed" are driven by the FOUNDER record below and render only when genuine, approved material is added. Nothing
   is invented: no personal history, names, dates, milestones, prototypes, documents, achievements or commitments. */
(function () {
  "use strict";
  var S = window.BCCSite;
  if (!S || !S.themes) return;
  var ST = S.copy.story, SD = S.copy.standards;

  /* Approved founder material. Leave fields empty until the founder supplies and approves them; empty fields hide
     their chapter or component entirely.
       before:    { paragraphs: [..], photos: [{ src, alt, w, h, caption, date }] }        → chapter 2
       lessons:   [{ title, text, link: [href, label] }]                                  → chapter 6
       changed:   { title, before, after, why }                                           → "A decision that changed" (chapter 5)
       timeline:  [{ date, title, text }]   (4–6 documented milestones)                   → chapter 5 timeline
       packaging: [{ label, date, src, alt, w, h, changed }]  (2+ real versions)          → chapter 5 viewer
       note:      { paragraphs: [..], name, role, portrait: { src, alt, w, h } }          → chapter 7
       media:     { kind: "video"|"audio", src, captions (VTT), transcript: [..] }       → chapter 7
       objects:   extra genuine objects for the object table (e.g. a notebook), same shape as OBJECTS */
  var FOUNDER = { before: null, lessons: [], changed: null, timeline: [], packaging: [], note: null, media: null, objects: [] };

  var CH = [
    ["opening", "The opening moment"], ["before", "Before there was a brand"], ["question", "The question we kept asking"], ["name", "Becoming Body Café Co."],
    ["collection", "Making the first collection"], ["lessons", "What the journey taught us"], ["founder", "A note from the founder"], ["next", "The next chapter"],
  ];

  /* Genuine objects: the brand's own design files and draft-packaging renders. No dates are shown because none are documented. */
  var OBJECTS = [
    { id: "cap", name: "A cap", src: "/web/media/renders/iron-bisglycinate-cap.webp", w: 400, h: 400, alt: "A rust-red product cap seen from above", what: "Studio render of the Iron Bisglycinate cap.", why: "Each of the seven products has its own cap colour, so the range is easy to read from across the room." },
    { id: "bottle", name: "A draft bottle", src: "/web/media/l-theanine.webp", w: 774, h: 1000, alt: "Draft front-of-pack design for L-Theanine: a cream bottle with an olive cap", what: "Draft packaging for L-Theanine, front of pack. Wording printed on the pack is label artwork, not a claim made on this page.", why: "Every product is named for what's in it, and the name leads the front of the pack." },
    { id: "colours", name: "The colour sheet", src: "/web/media/about/cap-colours.webp", w: 980, h: 850, alt: "Brand colour sheet listing each of the seven products beside its Pantone cap colour", what: "From the brand colour guide: the Pantone reference assigned to each product's cap.", why: "Colour does a job here: it tells one product from another before you read a word." },
    { id: "wordmark", name: "The wordmark", src: "/web/media/about/logo-clear-space.webp", w: 1000, h: 1024, alt: "The Body Café Co. logo inside a construction grid showing its clear space", what: "From the brand guide: the logo and the clear space kept around it.", why: "A plain, stacked wordmark that reads cleanly on a small bottle as well as a large page." },
    { id: "type", name: "Two typefaces", src: "/web/media/about/type-specimen.webp", w: 1400, h: 812, alt: "Type specimen showing LEMON MILK styles and the Aileron family", what: "From the brand guide: LEMON MILK for the logo family and Aileron for everything you read.", why: "One typeface to be recognised by, one to read comfortably at any size." },
  ];

  /* ====================================================================================================
     BUILDERS
     ==================================================================================================== */
  function h(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function arrow(href, label, cls) { return '<a class="' + (cls || "st-link") + '" href="' + href + '"><span>' + label + '</span><span class="st-arr" aria-hidden="true">→</span></a>'; }
  function founder() { var f = (window.BCCStory && window.BCCStory.founder) || FOUNDER; return f; }
  function present(f) {
    return {
      before: !!(f.before && f.before.paragraphs && f.before.paragraphs.length),
      lessons: !!(f.lessons && f.lessons.length),
      founder: !!(f.note && f.note.paragraphs && f.note.paragraphs.length && f.note.portrait),
    };
  }
  var GALLERY = [];
  function openable(img, cls) {
    var i = GALLERY.push(img) - 1;
    return '<figure class="st-fig ' + (cls || "") + '"><button type="button" class="st-open" data-st-open="' + i + '" aria-label="Enlarge: ' + h(img.title || img.alt) + '"><img src="' + h(img.src) + '" alt="' + h(img.alt) + '" width="' + (img.w || 800) + '" height="' + (img.h || 800) + '" loading="lazy" decoding="async"><span class="st-zoom" aria-hidden="true">+</span></button>' + (img.caption ? "<figcaption>" + h(img.caption) + "</figcaption>" : "") + "</figure>";
  }
  function chapter(v, id, n, title, inner) {
    return '<section class="st-ch st-ch-' + id + '" id="' + id + '" aria-labelledby="' + id + '-t"><div class="st-ch-in"><header class="st-head"><p class="st-k">' + (v.k ? v.k(n) : "Chapter " + n) + '</p><h2 id="' + id + '-t">' + title + '</h2><button type="button" class="st-share" data-st-share="' + id + '" aria-label="Copy link to chapter: ' + h(title) + '">#</button></header><div class="st-body">' + inner + "</div>" +
      (id === "next" ? "" : '<p class="st-ask"><a href="/contact?kind=brand&amp;topic=' + encodeURIComponent("/story#" + id) + '">Ask about this chapter</a></p>') + "</div></section>";
  }

  function opening(v, ctx) {
    var caps = '<div class="st-caps" aria-hidden="true">' + ctx.published.map(function (p, i) { return '<span style="--dot:' + h(p.color) + ";--i:" + i + '"></span>'; }).join("") + "</div>";
    return '<header class="st-hero" id="top"><div class="st-hero-in"><p class="st-kicker">' + (v.kicker || "Our story") + '</p><h1 class="st-h1" id="st-h1">' + (v.title ? v.title() : "Curiosity is a good place to start") + '</h1>' + caps +
      '<div class="st-summary" role="note" aria-label="The story in short"><p class="st-summary-k">The story in short</p><p>Body Café Co. is built around one idea: the details of a supplement should be easy to find before you choose it, not after. The name comes from the kind of place where asking what\'s in something is normal. Our first seven products each have their own cap colour, and we\'re building the records that let you check what we say.</p></div></div></header>';
  }
  function nav(v, shown) {
    var list = CH.filter(function (c) { return shown[c[0]] !== false; });
    return '<nav class="st-nav" aria-label="Chapters"><p class="st-nav-k" aria-hidden="true">Chapters</p><ol>' + list.map(function (c, i) {
      return '<li><a href="#' + c[0] + '" data-st-nav="' + c[0] + '"><span class="st-nav-n" aria-hidden="true">' + (i + 1) + "</span>" + c[1] + "</a></li>";
    }).join("") + '</ol><div class="st-progress" aria-hidden="true"><span data-st-progress></span></div></nav>';
  }
  function objectsTable() {
    var all = OBJECTS.concat(founder().objects || []);
    return '<div class="st-objects" data-st-objects><h3 class="st-sub-h">The objects that tell our story</h3><p class="st-sub-lede">Select an object to see it and what it means. These are our own design files and packaging renders.</p>' +
      '<div class="st-obj-row" role="tablist" aria-label="Objects">' + all.map(function (o, i) {
        return '<button type="button" role="tab" id="st-tab-' + o.id + '" aria-controls="st-obj-' + o.id + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" data-st-obj="' + o.id + '"><img src="' + h(o.src) + '" alt="" width="' + o.w + '" height="' + o.h + '" loading="lazy" decoding="async"><span>' + h(o.name) + "</span></button>";
      }).join("") + "</div>" + all.map(function (o, i) {
        return '<div role="tabpanel" id="st-obj-' + o.id + '" aria-labelledby="st-tab-' + o.id + '" class="st-obj-panel"' + (i ? " hidden" : "") + ">" + openable({ src: o.src, w: o.w, h: o.h, alt: o.alt, title: o.name, caption: o.what }, "st-obj-fig") +
          '<div class="st-obj-text"><h4>' + h(o.name) + "</h4>" + (o.date ? '<p class="st-obj-date">' + h(o.date) + "</p>" : "") + "<p>" + h(o.why) + "</p></div></div>";
      }).join("") + "</div>";
  }
  function timeline(f) {
    var t = (f.timeline || []).filter(function (x) { return x && x.date && x.title; });
    if (t.length < 4) return "";
    return '<div class="st-timeline"><h3 class="st-sub-h">Milestones</h3><ol>' + t.slice(0, 6).map(function (x) {
      return "<li><details><summary><time>" + h(x.date) + "</time> " + h(x.title) + "</summary><p>" + h(x.text || "") + "</p></details></li>";
    }).join("") + "</ol></div>";
  }
  function packaging(f) {
    var p = (f.packaging || []).filter(function (x) { return x && x.src && x.label; });
    if (p.length < 2) return "";
    return '<div class="st-pack" data-st-pack><h3 class="st-sub-h">How the packaging changed</h3><div class="st-pack-tabs" role="tablist" aria-label="Packaging versions">' + p.map(function (x, i) {
      return '<button type="button" role="tab" id="st-pv-' + i + '" aria-controls="st-pp-' + i + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' + h(x.label) + (x.date ? " · " + h(x.date) : "") + "</button>";
    }).join("") + "</div>" + p.map(function (x, i) {
      return '<div role="tabpanel" id="st-pp-' + i + '" aria-labelledby="st-pv-' + i + '"' + (i ? " hidden" : "") + ' class="st-pack-panel">' + openable({ src: x.src, w: x.w, h: x.h, alt: x.alt, title: x.label, caption: x.label }, "") + "<p>" + h(x.changed || "") + "</p></div>";
    }).join("") + "</div>";
  }
  function changed(f) {
    var c = f.changed;
    if (!c || !c.title || !c.before || !c.after) return "";
    return '<aside class="st-changed" aria-label="A decision that changed"><p class="st-changed-k">A decision that changed</p><h3>' + h(c.title) + '</h3><dl><div><dt>At first</dt><dd>' + h(c.before) + "</dd></div><div><dt>Then</dt><dd>" + h(c.after) + "</dd></div>" + (c.why ? "<div><dt>Why</dt><dd>" + h(c.why) + "</dd></div>" : "") + "</dl></aside>";
  }
  function media(f) {
    var m = f.media;
    if (!m || !m.src || !(m.captions || (m.transcript && m.transcript.length))) return "";
    var tag = m.kind === "audio" ? "audio" : "video";
    return '<figure class="st-media"><' + tag + ' controls preload="none"' + (tag === "video" ? ' playsinline width="1280" height="720"' : "") + ' src="' + h(m.src) + '">' + (m.captions ? '<track kind="captions" srclang="en" label="English" src="' + h(m.captions) + '" default>' : "") + "</" + tag + ">" +
      (m.transcript && m.transcript.length ? '<details class="st-transcript"><summary>Read the transcript</summary>' + m.transcript.map(function (p) { return "<p>" + h(p) + "</p>"; }).join("") + "</details>" : "") + "</figure>";
  }

  function body(v, ctx) {
    var f = founder(), has = present(f), n = 0;
    var num = function () { return ++n; };
    var groups = {};
    ctx.published.forEach(function (p) { var k = ctx.format[p.id] || ""; (groups[k] = groups[k] || []).push(p); });
    var words = ["zero", "one", "two", "three", "four", "five", "six", "seven"];
    var out = [];
    var q = ST.opening.split(". ");
    out.push(chapter(v, "opening", num(), "The opening moment",
      '<p class="st-lead">' + h(ST.lede) + '</p><p>Seven caps, seven everyday supplements, and one question every label should answer clearly: what exactly is in this?</p>' + openable({ src: "/web/media/about/caps-row.webp", w: 2340, h: 360, alt: "Seven product caps seen from above, in rust, olive, indigo, grey-blue, lilac, teal and sand", title: "Seven caps", caption: "The seven caps, seen from above. Studio renders." }, "st-wide")));
    if (has.before) out.push(chapter(v, "before", num(), "Before there was a brand", f.before.paragraphs.map(function (p) { return "<p>" + h(p) + "</p>"; }).join("") + ((f.before.photos || []).length ? '<div class="st-photos">' + f.before.photos.map(function (ph) { return openable({ src: ph.src, w: ph.w, h: ph.h, alt: ph.alt, title: ph.caption, caption: ph.caption + (ph.date ? " · " + ph.date : "") }); }).join("") + "</div>" : "")));
    var who = ST.chapters.filter(function (c) { return c.title === "Who it's for"; })[0];
    out.push(chapter(v, "question", num(), "The question we kept asking",
      '<blockquote class="st-quote"><p>' + h(q[0]) + ".</p></blockquote><p>" + h(q.slice(1).join(". ")) + "</p>" + (who ? "<p>" + h(who.body) + "</p>" : "") + '<p class="st-more">' + arrow("/standards", "How we show our working") + "</p>"));
    var cafe = ST.chapters.filter(function (c) { return c.title === "Why a café?"; })[0], tone = ST.chapters.filter(function (c) { return c.title === "Playful, never vague"; })[0];
    out.push(chapter(v, "name", num(), "Becoming Body Café Co.",
      (cafe ? '<h3 class="st-sub-h">Why a café?</h3><p class="st-lead">' + h(cafe.body) + "</p>" : "") + '<p class="st-note">There\'s no café to visit. The name describes how we want to treat a question, wherever you shop with us.</p>' +
      (tone ? '<h3 class="st-sub-h">' + h(tone.title) + "</h3><p>" + h(tone.body) + "</p>" : "") + objectsTable()));
    var seven = ST.chapters.filter(function (c) { return c.title === "Seven on the counter"; })[0];
    out.push(chapter(v, "collection", num(), "Making the first collection",
      (seven ? '<p class="st-lead">' + h(seven.body) + "</p>" : "") +
      '<ul class="st-formats">' + Object.keys(groups).map(function (k) { var c = groups[k].length; return "<li><strong>" + h(k) + "</strong><span>" + (c === 1 ? "One product: " : (words[c] || c).replace(/^./, function (x) { return x.toUpperCase(); }) + " products: ") + groups[k].map(function (p) { return '<a href="/products/' + p.id + '">' + h(p.name) + "</a>"; }).join(", ") + "</span></li>"; }).join("") + "</ul>" +
      '<div class="st-lineup">' + ctx.published.map(function (p) { return '<a href="/products/' + p.id + '" style="' + ctx.capStyle(p) + '"><img src="/web/media/' + p.id + '.webp" alt="' + h(p.name) + ', draft packaging" width="' + ((ctx.bottleWidth && ctx.bottleWidth[p.id]) || 720) + '" height="1000" loading="lazy" decoding="async"><span>' + h(p.name) + "</span></a>"; }).join("") + "</div>" +
      '<p class="st-small">The bottles are draft packaging. Amounts, directions and cautions will come from the approved rear labels.</p>' + changed(f) + packaging(f) + timeline(f) +
      '<p class="st-more">' + arrow("/shop", "Meet the seven") + arrow("/learn", "Learn about each one") + "</p>"));
    if (has.lessons) out.push(chapter(v, "lessons", num(), "What the journey taught us", '<ol class="st-lessons">' + f.lessons.map(function (l) { return "<li><h3>" + h(l.title) + "</h3><p>" + h(l.text) + "</p>" + (l.link ? arrow(l.link[0], h(l.link[1])) : "") + "</li>"; }).join("") + "</ol>"));
    if (has.founder) out.push(chapter(v, "founder", num(), "A note from the founder",
      '<div class="st-letter">' + openable({ src: f.note.portrait.src, w: f.note.portrait.w, h: f.note.portrait.h, alt: f.note.portrait.alt, title: f.note.name, caption: f.note.name + ", " + f.note.role }, "st-portrait") + '<div class="st-letter-text">' + f.note.paragraphs.map(function (p) { return "<p>" + h(p) + "</p>"; }).join("") + '<p class="st-sign">' + h(f.note.name) + "<span>" + h(f.note.role) + "</span></p></div></div>" + media(f)));
    out.push(chapter(v, "next", num(), "The next chapter",
      '<div class="st-next"><div><h3 class="st-sub-h">Where things stand now</h3><ul class="st-list is-now">' + SD.documented.map(function (x) { return "<li>" + h(x) + "</li>"; }).join("") + '</ul></div><div><h3 class="st-sub-h">What we\'re working towards</h3><p class="st-small">Planned, not yet in place. No dates are promised.</p><ul class="st-list is-plan">' + SD.planned.map(function (x) { return "<li>" + h(x) + "</li>"; }).join("") + "</ul></div>" +
      '<div><h3 class="st-sub-h">What we won\'t do</h3><ul class="st-list is-wont">' + ST.wont.map(function (x) { return "<li>" + h(x) + "</li>"; }).join("") + "</ul></div></div>" +
      '<ul class="st-routes">' + [["/about", "About us", "Who we are today"], ["/standards", "Our standards", "What we show, and its limits"], ["/learn", "Learn", "Guides to labels and our seven"], ["/shop", "Shop", "All seven, with sample prices"], ["/contact?kind=brand&topic=" + encodeURIComponent("/story"), "Ask about our story", "A support case, with this page attached"]].map(function (r) {
        return '<li><a class="st-route" href="' + r[0] + '"><strong>' + r[1] + "</strong><span>" + r[2] + '</span><span class="st-arr" aria-hidden="true">→</span></a></li>';
      }).join("") + "</ul>"));
    return { html: out.join(""), has: has };
  }
  function lightbox() {
    return '<dialog class="st-lightbox" aria-labelledby="st-lb-t" data-st-lightbox><div class="st-lb-in"><div class="st-lb-top"><p data-st-lb-count aria-live="polite"></p><button type="button" class="st-lb-btn" data-st-close aria-label="Close">×</button></div><figure><img data-st-lb-img alt=""><figcaption><strong id="st-lb-t" data-st-lb-title></strong> <span data-st-lb-cap></span></figcaption></figure><div class="st-lb-nav"><button type="button" class="st-lb-btn" data-st-prev aria-label="Previous image">←</button><button type="button" class="st-lb-btn" data-st-next aria-label="Next image">→</button></div></div></dialog>';
  }
  function compose(v, ctx) {
    GALLERY = [];
    var b = body(v, ctx);
    var html = '<div class="st st-' + v.key + '" data-st data-st-design="' + v.key + '">' + opening(v, ctx) + nav(v, { before: b.has.before, lessons: b.has.lessons, founder: b.has.founder }) + '<div class="st-chapters">' + b.html + "</div>" + lightbox() + "</div>";
    window.BCCStory = window.BCCStory || {};
    window.BCCStory.gallery = GALLERY.slice();
    return html;
  }

  /* ====================================================================================================
     DIRECTIONS
     ==================================================================================================== */
  var V = {
    a: { key: "a", kicker: "BCC / Our story", k: function (n) { return "[" + pad(n) + "]"; } },
    b: { key: "b", kicker: "How it started", k: function (n) { return pad(n); } },
    c: { key: "c", kicker: "Body Café Co. / The story so far", k: function (n) { return "Chapter " + pad(n); }, title: function () { return "Curiosity is a good place <em>to start</em>"; } },
    d: { key: "d", kicker: "Body Café Co. / The story, after hours", k: function (n) { return "Room " + pad(n); }, title: function () { return "Curiosity is a good place <em>to start.</em>"; } },
    e: { key: "e", kicker: "Our story · Body Café Co.", k: function (n) { return pad(n); } },
    f: { key: "f", kicker: "Edition 01 · The story", k: function (n) { return "No. " + pad(n); } },
    g: { key: "g", kicker: "Our story / frames", k: function (n) { return "Frame " + pad(n); } },
    h: { key: "h", kicker: "Story · Reference", k: function (n) { return "§ " + n; } },
  };
  Object.keys(V).forEach(function (d) {
    if (!S.themes[d]) return;
    var base = S.themes[d], next = {};
    Object.keys(base).forEach(function (k) { next[k] = base[k]; });
    next.story = function (ctx) { return compose(V[d], ctx); };
    S.themes[d] = next;
  });

  /* ====================================================================================================
     BEHAVIOUR
     ==================================================================================================== */
  var cleanup = function () {};
  var reduced = function () { return matchMedia("(prefers-reduced-motion: reduce)").matches; };
  function tabs(list, on) {
    var t = [].slice.call(list.querySelectorAll('[role="tab"]'));
    var sel = function (x, focus) { t.forEach(function (y) { var o = y === x; y.setAttribute("aria-selected", String(o)); y.tabIndex = o ? 0 : -1; document.getElementById(y.getAttribute("aria-controls")).hidden = !o; }); if (focus) x.focus(); };
    t.forEach(function (x, i) {
      on(x, "click", function () { sel(x, false); });
      on(x, "keydown", function (e) {
        var k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (e.key === "Home") k = -i; if (e.key === "End") k = t.length - 1 - i;
        if (k === undefined) return; e.preventDefault(); sel(t[(i + k + t.length) % t.length], true);
      });
    });
  }
  function enhance() {
    cleanup();
    var root = document.querySelector("[data-st]");
    if (!root) return;
    var abort = new AbortController(), signal = abort.signal;
    var on = function (el, ev, fn, o) { if (el) el.addEventListener(ev, fn, Object.assign({ signal: signal }, o || {})); };
    var app = window.BCCApp;

    /* The chapter rail sticks just below a sticky site header, whatever its height in this direction. */
    var offset = function () {
      var top = 0;
      [].slice.call(document.querySelectorAll("header")).forEach(function (el) {
        if (root.contains(el)) return;
        var cs = getComputedStyle(el);
        if (cs.position === "sticky" || cs.position === "fixed") top = Math.max(top, (parseFloat(cs.top) || 0) + el.getBoundingClientRect().height);
      });
      root.style.setProperty("--st-top", Math.round(top) + "px");
    };
    offset();
    on(window, "resize", offset, { passive: true });

    /* Chapter navigation, highlight and a restrained reading-progress bar. */
    var links = [].slice.call(root.querySelectorAll("[data-st-nav]"));
    var secs = links.map(function (a) { return document.getElementById(a.getAttribute("data-st-nav")); }).filter(Boolean);
    var bar = root.querySelector("[data-st-progress]"), chapters = root.querySelector(".st-chapters");
    var ticking = false, lockUntil = 0;
    var spy = function () {
      ticking = false;
      var r = chapters.getBoundingClientRect(), total = r.height - innerHeight * 0.6;
      var p = Math.max(0, Math.min(1, (-r.top + innerHeight * 0.4) / Math.max(1, total)));
      if (bar) bar.style.transform = "scaleX(" + p.toFixed(3) + ")";
      if (Date.now() < lockUntil) return;
      var line = innerHeight * 0.34, cur = null;
      secs.forEach(function (el) { if (el.getBoundingClientRect().top <= line) cur = el; });
      links.forEach(function (a) { if (cur && a.getAttribute("data-st-nav") === cur.id) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current"); });
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
      lockUntil = Date.now() + (reduced() ? 0 : 900);
      links.forEach(function (x) { if (x.getAttribute("data-st-nav") === t.id) x.setAttribute("aria-current", "location"); else x.removeAttribute("aria-current"); });
      setTimeout(spy, reduced() ? 0 : 950);
      t.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
      var hd = t.querySelector("h2") || t; hd.setAttribute("tabindex", "-1"); hd.focus({ preventScroll: true });
    });
    /* Copy a chapter link. */
    on(root, "click", function (e) {
      var b = e.target.closest("[data-st-share]");
      if (!b) return;
      var id = b.getAttribute("data-st-share"), u = new URL(location.href); u.hash = id;
      history.replaceState(history.state, "", u.pathname + u.search + u.hash);
      var done = function (ok) { b.setAttribute("aria-label", ok ? "Link copied" : "Copy failed; the address bar now shows this chapter's link"); b.textContent = ok ? "✓" : "#"; setTimeout(function () { if (b.isConnected) { b.textContent = "#"; b.setAttribute("aria-label", "Copy link to chapter"); } }, 2000); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u.toString()).then(function () { done(true); }, function () { done(false); }); else done(false);
    });

    /* Object table and packaging viewer: tabs with arrow keys. */
    root.querySelectorAll('[role="tablist"]').forEach(function (l) { tabs(l, on); });

    /* Image viewer (native modal dialog). */
    var gallery = (window.BCCStory && window.BCCStory.gallery) || [];
    var dlg = root.querySelector("[data-st-lightbox]"), img = root.querySelector("[data-st-lb-img]"), at = 0;
    var show = function (i) {
      at = (i + gallery.length) % gallery.length; var g = gallery[at];
      img.src = g.src; img.alt = g.alt; img.width = g.w || 800; img.height = g.h || 800;
      root.querySelector("[data-st-lb-title]").textContent = g.title || "";
      root.querySelector("[data-st-lb-cap]").textContent = g.caption || "";
      root.querySelector("[data-st-lb-count]").textContent = "Image " + (at + 1) + " of " + gallery.length;
    };
    on(root, "click", function (e) { var b = e.target.closest("[data-st-open]"); if (!b) return; show(Number(b.getAttribute("data-st-open"))); dlg.showModal(); root.querySelector("[data-st-close]").focus(); });
    on(root.querySelector("[data-st-close]"), "click", function () { dlg.close(); });
    on(root.querySelector("[data-st-prev]"), "click", function () { show(at - 1); });
    on(root.querySelector("[data-st-next]"), "click", function () { show(at + 1); });
    on(dlg, "keydown", function (e) { if (e.key === "ArrowLeft") { e.preventDefault(); show(at - 1); } if (e.key === "ArrowRight") { e.preventDefault(); show(at + 1); } });
    on(dlg, "click", function (e) { if (e.target === dlg) dlg.close(); });
    on(dlg, "close", function () { var b = root.querySelector('[data-st-open="' + at + '"]'); if (b) { var p = b.closest("[hidden]"); (p ? root.querySelector("[data-st-obj][aria-selected=true]") : b).focus(); } });

    /* A shared chapter link opens at that chapter. */
    var start = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (start && root.contains(start)) {
      /* Fonts and images above the chapter can change its position after the first jump, so re-align until they
         settle, unless the reader has already started scrolling. */
      var moved = false, go = function () { if (!moved && start.isConnected) { start.scrollIntoView({ block: "start" }); spy(); } };
      ["wheel", "touchstart", "keydown", "pointerdown"].forEach(function (ev) { on(window, ev, function () { moved = true; }, { passive: true, once: true }); });
      requestAnimationFrame(go);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
      [].slice.call(root.querySelectorAll("img")).filter(function (i) { return !i.complete && i.compareDocumentPosition(start) & 4; }).forEach(function (i) { on(i, "load", go, { once: true }); });
      setTimeout(go, 400); setTimeout(go, 1200);
    }

    cleanup = function () { abort.abort(); if (dlg && dlg.open) dlg.close(); };
    if (app && app.keepDesignOnLinks) app.keepDesignOnLinks();
  }

  window.BCCStory = window.BCCStory || {};
  window.BCCStory.enhance = enhance;
  window.BCCStory.chapters = CH;
})();
