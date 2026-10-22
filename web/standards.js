/* Body Café Co. — the Standards page for all eight directions (A–H).

   One content model, one set of facts, one section order. Each direction composes the same sections in its own
   visual language (see standards.css). This file replaces only the `standards` renderer of each theme; every other
   route, the headers, the lot lookup and all commerce flows are untouched.

   Content rules (from the approved plan):
   - Lead with what is confirmed. Say plainly, once per section, what isn't published yet.
   - Never invent sources, suppliers, manufacturers, checks, laboratories, results, certifications, reviewers,
     review dates, health benefits or sustainability claims. Planned work is worded as planned, never as practice.
   - Product facts come from the live catalogue (name, ingredient in view, format) and from the sourced ingredient
     notes in site.js. Pack images are draft packaging and are labelled as such.
   - Every link points at an existing route: /shop, /products/:id, /reports?product=:id, /learn/…, /story, /contact,
     /help. Section ids keep the existing `/standards#lot` links working. */
(function () {
  "use strict";
  var S = window.BCCSite;
  if (!S || !S.themes) return;

  /* ====================================================================================================
     1. CONTENT MODEL — the only place Standards facts and wording live.
     ==================================================================================================== */
  var STATE = {
    live: "Published",
    partial: "Partly published",
    pending: "Not yet published",
    demo: "Demonstration only",
  };

  /* Per-product records. Every field that has not been supplied is null and renders as a status, never as a value.
     When an approved record arrives, fill the field here and every direction shows it. */
  var RECORDS = {
    "iron-bisglycinate": {},
    "l-theanine": {},
    "vitamin-d3-k2": {},
    "omega-3-fish-oil": {},
    "myo-d-chiro-inositol": {},
    "creatine-chews": { formulation: "pending" },
    "psyllium-husk": {},
  };
  var RECORD_FIELDS = { label: null, origin: null, processing: null, manufacturer: null, quality: null, documents: [], certifications: [] };
  Object.keys(RECORDS).forEach(function (id) { Object.keys(RECORD_FIELDS).forEach(function (k) { if (!(k in RECORDS[id])) RECORDS[id][k] = RECORD_FIELDS[k]; }); });

  var M = {
    /* Set to an ISO date (e.g. "2026-11-15") only after a recorded editorial review. Nothing renders while null. */
    reviewed: null,

    hero: {
      kicker: "Our standards",
      title: "The detail behind the bottle.",
      statement: "We'd rather earn your confidence with detail you can check than with badges you can't. This page explains what each of our products is made of, what each kind of record can show, and how to find the one for your bottle.",
      caption: "Draft packaging. Front-of-pack design mockups; wording printed on the pack is label artwork, not a claim made on this site.",
      primary: ["#glance", "Explore our standards"],
      secondary: ["/reports", "Find a lot report"],
    },

    index: [
      ["glance", "At a glance"],
      ["formula", "The formula"],
      ["source", "Sources"],
      ["checks", "Quality checks"],
      ["evidence", "Evidence"],
      ["lot", "Your lot"],
      ["communicate", "How we communicate"],
      ["questions", "Questions"],
      ["next", "Next step"],
    ],

    /* Sections 2–10. `q` is the visitor's question each section answers. */
    sections: {
      glance: { n: 2, label: "At a glance", q: "What can I hold you to?", title: "Our standards, at a glance" },
      formula: { n: 3, label: "The formula", q: "What's actually in it?", title: "What goes into the formula" },
      source: { n: 4, label: "Sources", q: "Where does it come from?", title: "Where ingredients come from" },
      checks: { n: 5, label: "Quality checks", q: "Who checks it, and when?", title: "How quality is checked" },
      evidence: { n: 6, label: "Evidence", q: "What proves what?", title: "The evidence behind the standard" },
      lot: { n: 7, label: "Your lot", q: "Can I check my bottle?", title: "Follow your lot" },
      communicate: { n: 8, label: "How we communicate", q: "How do you decide what to say?", title: "How we communicate responsibly" },
      questions: { n: 9, label: "Questions", q: "Anything else?", title: "Good questions about our standards" },
      next: { n: 10, label: "Next step", q: "Where now?", title: "A clear next step" },
    },

    principles: [
      { id: "formula", title: "Know the formula.", text: "Every ingredient by its full name and form, with the amount per serving and the serving size.", state: "partial" },
      { id: "source", title: "Know the source.", text: "Where ingredients originate, where they're processed and who makes the finished product, kept apart and named only when confirmed.", state: "pending" },
      { id: "checks", title: "Understand the checks.", text: "Which checks happen, at which stage and by whom, and what each kind of evidence can and can't show.", state: "pending" },
      { id: "lot", title: "Read the record.", text: "Find the record for the lot your bottle came from, and see exactly what it covers.", state: "demo" },
    ],
    glanceNow: {
      published: ["Product names, ingredients in view and formats for all seven", "A working lot lookup, with clearly labelled demonstration records", "Sourced guides to reading labels and lot reports"],
      pending: ["Approved rear labels", "Sourcing and manufacturer details", "The documented quality process", "Laboratory documents"],
    },

    formula: {
      mean: "The front of a pack names the headline ingredient. The formula is everything else you need to compare two products fairly: what each ingredient is, in what form, how much, and what comes with it.",
      fields: [
        ["Ingredient, in full", "The ingredient and its form, such as “Iron (as iron bisglycinate)”. The form is part of the ingredient's identity."],
        ["Amount per serving", "Stated with its unit (mg, mcg or IU), and kept separate from the weight of the compound where the two differ."],
        ["Serving size", "How many capsules, softgels or chews make one serving. Every amount refers to this."],
        ["Units per pack", "How many units the pack holds, so you know how many servings you're buying."],
        ["Other ingredients", "Capsule or softgel shell, fillers, flavours and anything else added, and what each one is there to do."],
        ["Allergens", "For example fish, which matters for Omega-3 Fish Oil."],
        ["Directions", "How much to take, how often and how."],
        ["Cautions and storage", "Who should take extra care, and how to keep the product."],
      ],
      front: [["Product name", "Names the headline ingredient."], ["Form line", "Where shown, names the form, such as “as Triglycerides”."]],
      compare: [
        ["Compare per serving, not per pack.", "Two packs of the same size can hold very different servings."],
        ["Match the form, not just the name.", "Different compounds of one nutrient deliver different amounts of it."],
        ["Convert before comparing.", "For vitamin D, 1 mcg equals 40 IU, according to NIH's Office of Dietary Supplements."],
        ["Read the actives, not the total.", "With fish oil, EPA and DHA matter more than the total amount of oil."],
      ],
      pendingList: "amount per serving, serving size, units per pack, other ingredients, allergens, directions and cautions",
      status: "Product names, ingredients in view and formats are published for all seven products. Approved rear labels haven't been supplied, so amounts, serving sizes, other ingredients, allergens, directions and cautions aren't published yet. Creatine Chews' complete formulation is still pending.",
      care: S.CARE_NOTE,
    },

    source: {
      mean: "“Where it comes from” can mean three different places. A useful answer keeps them apart.",
      places: [
        ["Ingredient origin", "Where the raw ingredient is grown, harvested or first produced."],
        ["Processing location", "Where the ingredient is purified or converted into the form named on the label."],
        ["Finished-product manufacturer", "The facility that blends, fills and packs the product you buy."],
      ],
      check: "When these details are confirmed, each product will list all three separately. A single line that merges them can't tell you which step happened where.",
      status: "No ingredient origins, processing locations, suppliers or manufacturer details have been published yet. We don't name a source we can't confirm.",
    },

    checks: {
      mean: "A quality check means something only when you know what was checked, at which stage, and who checked it.",
      questions: [
        ["When ingredients arrive", "What is checked before an ingredient is used, and by whom?"],
        ["During manufacture", "Which controls confirm the right ingredient goes in, in the right amount?"],
        ["Before release", "What is checked on the finished product, and against which specification?"],
        ["Over shelf life", "How is it confirmed that the product still matches its label by the date on the pack?"],
      ],
      questionsIntro: "These are the questions worth asking any supplement brand, including us. They describe what a documented process would answer, not checks we have published.",
      status: "Our documented quality process hasn't been published. Until it is, we don't describe any check as completed, and we don't name a laboratory or quality partner.",
    },

    evidence: {
      mean: "“Tested” and “backed by research” can mean very different things. Each kind of evidence answers a different question, and none of them answers all of them.",
      cols: ["What it checks", "What it covers", "What it can't tell you", "Where to verify it", "Body Café Co. today"],
      rows: [
        { kind: "Ingredient research", cells: ["What studies have found about an ingredient, usually in a particular form and amount.", "The ingredient as studied, not a particular product.", "What's in a specific bottle, or how a product will work for you.", "The study itself, or an independent summary such as an NIH fact sheet.", "Cited as background in our guides. Not used as product claims."], state: "live" },
        { kind: "Finished-product testing", cells: ["Whether a sample of the finished product meets its specification, using stated methods.", "The sample and lot that were tested.", "Other lots, an individual pack, or a health outcome.", "The report: laboratory, method, result with units, limit and date.", "No results published."], state: "pending" },
        { kind: "Certification", cells: ["That an independent body assessed something against its own standard.", "Exactly what the certificate names: a facility, a process or a product.", "Anything outside that named scope.", "The certifier's own public listing, not the brand's page.", "None claimed."], state: "pending" },
        { kind: "Lot report", cells: ["The records for one manufacturing lot, gathered in one place.", "One lot, through the sample tested from it.", "Whether a single pack is genuine, or how it will work for you.", "Our lot lookup, using the number printed on your pack.", "Demonstration records only."], state: "demo" },
      ],
      libraryFields: [["Product and lot", "Which product, and which lot, the document describes."], ["Source", "Who issued it."], ["Date and version", "When it was issued, and whether it replaces an earlier version."], ["Scope", "What it covers, and what it doesn't."], ["Verification", "Where to confirm it independently, when that's possible."]],
      libraryStatus: "No documents have been published yet. When one is, it will appear here with each of these details.",
      status: "No test reports, certificates or laboratory documents have been published. Ingredient research is cited only as background in Learn, with its sources linked.",
    },

    lot: {
      mean: "A lot number connects the bottle in your hand to the manufacturing batch it came from. One product is made in many lots.",
      steps: [
        ["Choose the product", "Pick the product you have. Each product's lots are kept separate."],
        ["Find the lot number", "It's printed on the pack, separate from the barcode, product code and your order number. A photo showing exactly where will be added with the final label."],
        ["Open its record", "Enter the number to see the record for that lot."],
      ],
      scope: "A lot report describes a tested sample from one batch. It doesn't authenticate an individual bottle, and it doesn't promise a health outcome.",
      status: "The lookup works today with demonstration records, such as DEMO-01-01, each clearly labelled. No real lot records are connected yet.",
    },

    communicate: {
      mean: "How we say something matters as much as what we say. These are the practices already in place across this site.",
      practices: [
        ["Sources are cited, and linked.", "Technical points in our guides are limited to what their linked primary sources state, such as NIH Office of Dietary Supplements fact sheets and the FSSAI health supplement regulations."],
        ["Missing facts are marked, not filled.", "Where an approved label or document hasn't arrived, the page says so instead of estimating."],
        ["No claims we can't support.", "No health claims, invented reviews, ratings, endorsements or badges."],
      ],
      kinds: [
        ["Ingredient research", "What studies found about an ingredient. Background, not a promise about our product."],
        ["Product testing", "What a test of a sample from one of our lots showed. None published yet."],
        ["Customer experience", "What customers tell us. Reviews come only from delivered orders, after moderation. None published yet."],
      ],
      correction: "Spotted something unclear, out of date or wrong? Tell us and include the page and the sentence.",
      status: "A formal editorial review process hasn't been set up yet, so this page shows no review date.",
    },

    faqs: [
      ["Where do your ingredients come from?", "We haven't published sourcing or manufacturing details yet. When we do, each product will show the ingredient origin, processing location and finished-product manufacturer separately. Until then, we don't describe a source we can't confirm."],
      ["Are your products tested?", "No test results or laboratory documents have been published, so we don't describe any product as tested. When a report is published, it will be linked to the lot it describes."],
      ["Do you hold any certifications?", "None is claimed on this site. A certification would only appear with exactly what it covers, a facility, a process or a product, and a link to the certifier's own listing."],
      ["Is an FSSAI licence a quality certification?", "No. An FSSAI licence or registration is what a food business needs to operate in India. It isn't a test of a particular product's quality."],
      ["What about allergens and dietary needs?", "Allergen statements come from approved labels, which haven't been published yet. Omega-3 Fish Oil comes from fish, and capsule and softgel materials aren't confirmed. Vitamin D3 + K2 includes omega-3 as triglycerides; its source will be stated on the approved label."],
      ["Does a lot report prove my bottle is genuine?", "No. A report describes a sample from one lot. Checking an individual pack would need a separate unit code, and that hasn't been decided."],
      ["Why isn't a document available yet?", "Because it hasn't been supplied in a version we can publish. We'd rather show a clear status than a placeholder badge. You can ask about a specific product or lot at any time."],
    ],

    next: {
      lede: "Compare the seven, look up a lot, or ask us anything this page didn't answer.",
      actions: [["/shop", "Explore the collection"], ["/reports", "Find your lot report"], ["/contact", "Ask a question"]],
      related: [["/story", "Our story"], ["/learn", "Learn"], ["/help", "Help centre"]],
    },
  };

  /* ====================================================================================================
     2. SHARED BUILDERS — semantic HTML with sx-* hooks. Directions restyle these; they never change facts.
     ==================================================================================================== */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function list(items, cls) { return '<ul class="' + (cls || "sx-list") + '">' + items.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>"; }
  function pairs(items, cls, tag) {
    tag = tag || "ol";
    return "<" + tag + ' class="' + cls + '">' + items.map(function (x, i) { return '<li><span class="sx-pn" aria-hidden="true">' + pad(i + 1) + '</span><div><h3>' + x[0] + "</h3><p>" + x[1] + "</p></div></li>"; }).join("") + "</" + tag + ">";
  }
  function pill(state) { return '<span class="sx-state" data-state="' + state + '">' + STATE[state] + "</span>"; }
  function status(text, state) {
    return '<div class="sx-status" data-state="' + (state || "pending") + '"><p class="sx-status-k">Current status</p><p>' + text + "</p></div>";
  }
  function sub(title) { return '<h3 class="sx-sub">' + title + "</h3>"; }
  /* Optional expansion: open on wide screens, collapsed to its summary on phones (see enhance). */
  function more(title, html, cls) {
    return '<details class="sx-more' + (cls ? " " + cls : "") + '" data-sx-wide-open open><summary><span class="sx-sub">' + title + '</span><span class="sx-faq-mark" aria-hidden="true"></span></summary><div class="sx-more-body">' + html + "</div></details>";
  }
  function mean(text) { return '<p class="sx-mean">' + text + "</p>"; }
  function inView(p) { return String(p.ingredients || "").split(";")[0]; }
  function bottle(ctx, p, cls, alt, eager) {
    var w = (ctx.bottleWidth && ctx.bottleWidth[p.id]) || 715;
    return '<img class="' + (cls || "sx-bottle") + '" src="/web/media/' + p.id + '.webp" alt="' + (alt === "" ? "" : ctx.escape(p.name) + ", draft packaging") + '" width="' + w + '" height="1000" ' + (eager ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async">';
  }
  function link(href, text, cls) { return '<a class="' + (cls || "sx-link") + '" href="' + href + '">' + text + "</a>"; }
  function btn(href, text, cls) { return '<a class="' + (cls || "sx-btn") + '" href="' + href + '"><span>' + text + '</span><span class="sx-arrow" aria-hidden="true">' + (href.charAt(0) === "#" ? "↓" : "→") + "</span></a>"; }

  function indexNav(cls) {
    return '<nav class="sx-index ' + (cls || "") + '" aria-label="On this page"><p class="sx-index-k">On this page</p><ol>' +
      M.index.map(function (x) { return '<li><a href="#' + x[0] + '" data-sx-spy="' + x[0] + '"><span class="sx-pn" aria-hidden="true">' + pad(M.sections[x[0]].n) + "</span>" + x[1] + "</a></li>"; }).join("") + "</ol></nav>";
  }

  function principles() {
    return '<ol class="sx-principles">' + M.principles.map(function (p, i) {
      return '<li><a href="#' + p.id + '"><span class="sx-pn" aria-hidden="true">' + pad(i + 1) + '</span><strong class="sx-pt">' + p.title + '</strong><span class="sx-ptext">' + p.text + "</span>" + pill(p.state) + '<span class="sx-go">Read more<span class="sr-only"> about ' + p.title.replace(/\.$/, "") + "</span></span></a></li>";
    }).join("") + "</ol>";
  }
  function glanceNow() {
    return more("Published today, and still to come", '<div class="sx-now"><div><h3 class="sx-sub">Published today</h3>' + list(M.glanceNow.published) + '</div><div><h3 class="sx-sub">Not yet published</h3>' + list(M.glanceNow.pending) + "</div></div>", "is-now");
  }

  /* An annotated pack: the real front (draft packaging) and a diagram of the rear-label fields. */
  function anatomy(ctx) {
    var p = ctx.product("omega-3-fish-oil") || ctx.published[0];
    var f = M.formula;
    return '<figure class="sx-anatomy" data-sx-anatomy>' +
      '<div class="sx-anat-front"><div class="sx-anat-img">' + (p ? bottle(ctx, p, "sx-anat-bottle") : "") +
        f.front.map(function (x, i) { return '<span class="sx-anat-pin sx-anat-pin-' + (i + 1) + '" aria-hidden="true">' + String.fromCharCode(65 + i) + "</span>"; }).join("") + "</div>" +
        '<p class="sx-anat-k">Front of pack</p><ol class="sx-anat-front-list" type="A">' + f.front.map(function (x) { return "<li><strong>" + x[0] + "</strong> " + x[1] + "</li>"; }).join("") + '<li class="sx-anat-more">Everything else lives on the rear label.</li></ol></div>' +
      '<div class="sx-anat-rear"><p class="sx-anat-k">Rear label <span>· diagram of its fields, not an approved label</span></p>' +
        '<div class="sx-anat-diagram" aria-hidden="true">' + f.fields.map(function (x, i) { return '<span class="sx-zone" data-sx-zone="' + i + '"><b>' + (i + 1) + "</b><i></i><i></i></span>"; }).join("") + "</div>" +
        more("What each field tells you", '<ol class="sx-fields">' + f.fields.map(function (x, i) { return '<li tabindex="0" data-sx-field="' + i + '"><span class="sx-pn" aria-hidden="true">' + (i + 1) + "</span><div><strong>" + x[0] + "</strong><span>" + x[1] + "</span></div></li>"; }).join("") + "</ol>", "is-fields") + "</div>" +
      '<figcaption class="sx-caption">' + M.hero.caption + "</figcaption></figure>";
  }

  /* Choose a product: confirmed facts first, then one line for everything awaiting the approved label. */
  function picker(ctx, cls) {
    var ps = ctx.catalog.filter(function (p) { return RECORDS[p.id]; });
    if (!ps.length) return "";
    return '<div class="sx-picker ' + (cls || "") + '" data-sx-picker><p class="sx-picker-k" id="sx-pick-k">Choose a product</p><div class="sx-picker-btns" role="group" aria-labelledby="sx-pick-k">' +
      ps.map(function (p, i) { return '<button type="button" class="sx-pick" data-sx-pick="' + p.id + '" aria-pressed="' + (i === 0) + '" aria-controls="sx-panel-' + p.id + '" style="--cap:' + p.color + '"><span class="sx-pick-dot" aria-hidden="true"></span><span>' + ctx.escape(p.name) + "</span></button>"; }).join("") +
      "</div>" + ps.map(function (p, i) {
        var r = RECORDS[p.id], n = (S.notes && S.notes[p.id]) || { check: [] };
        var pendingForm = r.formulation === "pending";
        return '<section class="sx-panel" id="sx-panel-' + p.id + '" data-sx-panel="' + p.id + '" aria-label="' + ctx.escape(p.name) + '"' + (i ? " hidden" : "") + ' style="--cap:' + p.color + '">' +
          '<div class="sx-panel-img">' + bottle(ctx, p, "sx-panel-bottle") + "</div>" +
          '<div class="sx-panel-body"><h3>' + ctx.escape(p.name) + "</h3>" +
          '<dl class="sx-facts"><div><dt>Format</dt><dd>' + ctx.escape(ctx.format[p.id] || "") + "</dd></div><div><dt>Ingredient in view</dt><dd>" + ctx.escape(inView(p)) + (pendingForm ? " <em>(complete formulation pending)</em>" : "") + "</dd></div>" +
          '<div class="is-pending"><dt>Awaiting approved label</dt><dd>' + M.formula.pendingList.charAt(0).toUpperCase() + M.formula.pendingList.slice(1) + "</dd></div></dl>" +
          (n.check && n.check.length ? '<p class="sx-panel-k">Check first on this label</p><ul class="sx-checkfirst">' + n.check.slice(0, 2).map(function (c) { return "<li><strong>" + c[0] + "</strong> " + c[1] + "</li>"; }).join("") + "</ul>" : "") +
          '<p class="sx-panel-links">' + link("/products/" + p.id, "Product page") + link("/learn/" + p.id, "Ingredient note") + link("/reports?product=" + p.id, "Lot record") + "</p></div></section>";
      }).join("") + "</div>";
  }

  function compareTips() { return pairs(M.formula.compare, "sx-tips"); }

  function places() {
    return '<ol class="sx-places">' + M.source.places.map(function (x, i) {
      return '<li><span class="sx-pn" aria-hidden="true">' + pad(i + 1) + '</span><h3>' + x[0] + "</h3><p>" + x[1] + '</p><p class="sx-place-state">' + STATE.pending + "</p></li>";
    }).join("") + "</ol>";
  }

  function checkQuestions() {
    return '<p class="sx-note">' + M.checks.questionsIntro + "</p>" + '<ol class="sx-questions">' + M.checks.questions.map(function (x, i) {
      return '<li><span class="sx-pn" aria-hidden="true">' + pad(i + 1) + "</span><h3>" + x[0] + "</h3><p>" + x[1] + "</p></li>";
    }).join("") + "</ol>";
  }

  /* “What does this prove?” — a real table (headers scoped), restacked as labelled cards on small screens. */
  function proves() {
    var e = M.evidence;
    return '<div class="sx-proves-wrap" role="region" aria-label="What each kind of evidence proves" tabindex="0"><table class="sx-proves"><caption class="sr-only">What each kind of evidence checks, covers and can\'t tell you</caption><thead><tr><th scope="col">Kind of evidence</th>' +
      e.cols.map(function (c) { return '<th scope="col">' + c + "</th>"; }).join("") + "</tr></thead><tbody>" +
      e.rows.map(function (r) {
        return '<tr data-state="' + r.state + '"><th scope="row">' + r.kind + "</th>" + r.cells.map(function (c, i) { return '<td data-label="' + e.cols[i] + '">' + (i === 4 ? pill(r.state) + " " : "") + c + "</td>"; }).join("") + "</tr>";
      }).join("") + "</tbody></table></div>" +
      /* Phones: one expandable entry per kind of evidence, its status visible without opening it. */
      '<div class="sx-proves-list">' + e.rows.map(function (r) {
        return '<details class="sx-prove"><summary><span class="sx-prove-kind">' + r.kind + "</span>" + pill(r.state) + '<span class="sx-faq-mark" aria-hidden="true"></span></summary><dl>' +
          r.cells.map(function (c, i) { return "<div><dt>" + e.cols[i] + "</dt><dd>" + c + "</dd></div>"; }).join("") + "</dl></details>";
      }).join("") + "</div>";
  }
  function library() {
    var e = M.evidence;
    return '<div class="sx-library"><h3 class="sx-sub">The document library</h3><p class="sx-library-empty">' + e.libraryStatus + "</p>" +
      more("What every document will name", '<dl class="sx-libfields">' + e.libraryFields.map(function (f) { return "<div><dt>" + f[0] + "</dt><dd>" + f[1] + "</dd></div>"; }).join("") + "</dl>") + "</div>";
  }

  function lotPath(ctx) {
    var l = M.lot;
    return '<ol class="sx-path">' + l.steps.map(function (s, i) {
      return '<li><span class="sx-pn" aria-hidden="true">' + (i + 1) + "</span><h3>" + s[0] + "</h3><p>" + s[1] + "</p></li>";
    }).join("") + "</ol>" +
      '<div class="sx-lotpick"><p class="sx-lotpick-k">Open the lookup for</p><ul>' + ctx.published.map(function (p) {
        return '<li><a href="/reports?product=' + p.id + '" style="--cap:' + p.color + '"><span class="sx-pick-dot" aria-hidden="true"></span>' + ctx.escape(p.name) + "</a></li>";
      }).join("") + "</ul></div>" +
      '<p class="sx-scope"><strong>What a report covers.</strong> ' + l.scope + "</p>";
  }
  function lotFigure(ctx) {
    /* No real photograph of the lot-number position exists yet, so this is a labelled schematic, not a photo. */
    var p = ctx.product("iron-bisglycinate") || ctx.published[0];
    return '<figure class="sx-lotfig"><div class="sx-lotfig-art" aria-hidden="true">' + (p ? bottle(ctx, p, "sx-lotfig-bottle", "") : "") + '<span class="sx-lotfig-tag">LOT · DEMO-01-01</span></div><figcaption>Schematic only. A photograph of where the lot number sits on each pack will replace it with the final label.</figcaption></figure>';
  }

  function practices() { return pairs(M.communicate.practices, "sx-practices", "ul"); }
  function kinds() {
    return '<dl class="sx-kinds">' + M.communicate.kinds.map(function (k) { return "<div><dt>" + k[0] + "</dt><dd>" + k[1] + "</dd></div>"; }).join("") + "</dl>";
  }
  function correction() {
    return '<div class="sx-correction"><p>' + M.communicate.correction + "</p>" + btn("/contact", "Ask a question or report a correction", "sx-btn is-quiet") + "</div>";
  }
  function faqs() {
    return '<div class="sx-faqs">' + M.faqs.map(function (f) {
      return '<details class="sx-faq"><summary><span>' + f[0] + '</span><span class="sx-faq-mark" aria-hidden="true"></span></summary><p>' + f[1] + "</p></details>";
    }).join("") + '<p class="sx-faq-more">Still unsure? ' + link("/help", "Visit the help centre") + " or " + link("/contact", "ask us directly") + ".</p></div>";
  }
  function nextActions(cls) {
    return '<div class="sx-actions ' + (cls || "") + '">' + M.next.actions.map(function (a, i) { return btn(a[0], a[1], "sx-btn" + (i ? " is-quiet" : "")); }).join("") + "</div>" +
      '<p class="sx-related">Related: ' + M.next.related.map(function (r) { return link(r[0], r[1]); }).join(" · ") + "</p>" +
      (M.reviewed ? '<p class="sx-reviewed">Last reviewed <time datetime="' + M.reviewed + '">' + new Date(M.reviewed + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) + "</time></p>" : "");
  }

  /* The body of each section, identical for every direction. Directions only choose how to frame it. */
  function bodies(ctx) {
    return {
      glance: { lead: "Four principles. Each links to the detail behind it, and says how much of it is published today.", html: principles() + glanceNow() },
      formula: { lead: M.formula.mean, html: sub("How it works") + anatomy(ctx) + more("How to compare two products", compareTips()) + sub("What you can check") + picker(ctx) + '<p class="sx-care">' + M.formula.care + "</p>", status: [M.formula.status, "partial"] },
      source: { lead: M.source.mean, html: sub("How it works") + places() + sub("What you can check") + '<p class="sx-p">' + M.source.check + "</p>", status: [M.source.status, "pending"] },
      checks: { lead: M.checks.mean, html: sub("Questions a quality process should answer") + checkQuestions(), status: [M.checks.status, "pending"] },
      evidence: { lead: M.evidence.mean, html: sub("What does each kind of evidence prove?") + proves() + library(), status: [M.evidence.status, "pending"] },
      lot: { lead: M.lot.mean, html: sub("How it works") + '<div class="sx-lotgrid">' + lotFigure(ctx) + '<div>' + lotPath(ctx) + "</div></div>" + sub("What you can check") + '<p class="sx-p">' + link("/reports", "Try the lot lookup") + " with a demonstration record, or read " + link("/learn/understanding-reports", "what a lot report shows") + ".</p>", status: [M.lot.status, "demo"] },
      communicate: { lead: M.communicate.mean, html: sub("How it works") + practices() + more("Three kinds of statement, kept apart", kinds()) + sub("What you can check") + '<p class="sx-p">Every guide lists its sources at the end. ' + link("/learn/reading-a-label", "Read a label with confidence") + " is a good place to start.</p>" + correction(), status: [M.communicate.status, "pending"] },
      questions: { lead: "", html: faqs() },
      next: { lead: M.next.lede, html: nextActions() },
    };
  }

  /* ====================================================================================================
     3. DIRECTIONS — the same ten sections, composed in each direction's own language.
     ==================================================================================================== */
  var ORDER = ["glance", "formula", "source", "checks", "evidence", "lot", "communicate", "questions", "next"];
  var CAPS = ["#aa472e", "#777d51", "#35306f", "#84919b", "#b184b9", "#07566a", "#9c9274"];
  function heroBottles(ctx, ids, cls) {
    return ids.map(function (id) { return ctx.product(id); }).filter(Boolean).map(function (p, i) { return '<span class="sx-hb sx-hb-' + (i + 1) + '" style="--cap:' + p.color + '">' + bottle(ctx, p, "sx-hero-bottle", i ? "" : undefined, true) + "</span>"; }).join("");
  }
  function heroCopy(cls) {
    var h = M.hero;
    return '<p class="sx-kicker">' + h.kicker + '</p><h1 class="sx-h1">' + (cls || h.title) + '</h1><p class="sx-statement">' + h.statement + '</p><div class="sx-hero-actions">' + btn(h.primary[0], h.primary[1]) + btn(h.secondary[0], h.secondary[1], "sx-btn is-quiet") + "</div>";
  }
  function head(s, o) {
    o = o || {};
    return '<header class="sx-head">' + (o.pre || "") + '<p class="sx-k"><span class="sx-k-n">' + pad(s.n) + '</span><span class="sx-k-l">' + (o.label || s.label) + '</span></p><h2 id="' + s.id + '-t">' + (o.title || s.title) + "</h2>" + (o.q ? '<p class="sx-q">' + s.q + "</p>" : "") + "</header>";
  }
  function compose(v, ctx) {
    var B = bodies(ctx);
    return '<div class="sx sx-' + v.key + '" data-sx>' + v.hero(ctx) +
      ORDER.map(function (id, i) {
        var s = Object.assign({ id: id, i: i }, M.sections[id]), b = B[id];
        return v.section(ctx, s, b);
      }).join("") + "</div>";
  }
  function plainSection(s, b, o) {
    o = o || {};
    return '<section class="sx-sec' + (o.cls ? " " + o.cls : "") + '" id="' + s.id + '" aria-labelledby="' + s.id + '-t"' + (o.style ? ' style="' + o.style + '"' : "") + ">" + (o.inner ? '<div class="sx-inner">' : "") +
      head(s, o) + '<div class="sx-body">' + (b.lead ? mean(b.lead) : "") + b.html + (b.status ? status(b.status[0], b.status[1]) : "") + "</div>" + (o.inner ? "</div>" : "") + "</section>";
  }

  var V = {
    /* A — State of Play: poster type, electric blue on fog, lime highlighter, scattered bottles. */
    a: {
      key: "a",
      hero: function (ctx) {
        return '<header class="sx-hero"><div class="sx-hero-copy">' + heroCopy("The detail<br>behind<br>the bottle.") + "</div>" +
          '<figure class="sx-hero-art">' + heroBottles(ctx, ["omega-3-fish-oil", "iron-bisglycinate", "l-theanine"]) + '<figcaption class="sx-caption">' + M.hero.caption + "</figcaption></figure>" + indexNav() + "</header>";
      },
      section: function (ctx, s, b) { return plainSection(s, b, { inner: true }); },
    },
    /* B — Expressive everyday: each section opens with the visitor's question in a bubble, on its own colour. */
    b: {
      key: "b",
      hero: function (ctx) {
        return '<header class="sx-hero"><div class="sx-hero-copy">' + heroCopy('The detail <span>behind the bottle.</span>') + "</div>" +
          '<figure class="sx-hero-art"><div class="sx-blob">' + heroBottles(ctx, ["vitamin-d3-k2", "omega-3-fish-oil"]) + '</div><p class="sx-bubble" aria-hidden="true">What\'s on the back?</p><figcaption class="sx-caption">' + M.hero.caption + "</figcaption></figure>" + indexNav() + "</header>";
      },
      section: function (ctx, s, b) {
        var tones = ["sage", "lilac", "lime", "peach", "sage", "lilac", "lime", "peach", "paper"];
        return plainSection(s, b, { inner: true, cls: "is-" + tones[s.i], pre: '<p class="sx-bubble">' + s.q + "</p>" });
      },
    },
    /* C — Everyday Elsewhere: a little journey in chapters, each stamped like a postcard. */
    c: {
      key: "c",
      hero: function (ctx) {
        return '<header class="sx-hero"><div class="sx-hero-copy">' + heroCopy("The detail <em>behind the bottle.</em>") + "</div>" +
          '<figure class="sx-hero-art"><div class="sx-postcard">' + heroBottles(ctx, ["psyllium-husk"]) + '<span class="sx-stamp" aria-hidden="true"><b>BCC</b><i>Standards</i></span></div><figcaption class="sx-caption">' + M.hero.caption + "</figcaption></figure>" + indexNav() + "</header>";
      },
      section: function (ctx, s, b) {
        return plainSection(s, b, { inner: true, label: "Chapter " + pad(s.n) + " · " + s.label, pre: '<span class="sx-chapter-stamp" aria-hidden="true">' + pad(s.n) + "</span>" });
      },
    },
    /* D — The Other Side: an after-hours exhibition. Rooms, wall text and lit vitrines on midnight blue. */
    d: {
      key: "d",
      hero: function (ctx) {
        return '<header class="sx-hero"><div class="sx-hero-copy">' + heroCopy("The detail<br><em>behind the bottle.</em>") + "</div>" +
          '<figure class="sx-hero-art"><div class="sx-vitrine">' + heroBottles(ctx, ["myo-d-chiro-inositol"]) + '</div><figcaption class="sx-caption"><b>Exhibit 01.</b> ' + M.hero.caption + "</figcaption></figure>" + indexNav() + "</header>";
      },
      section: function (ctx, s, b) { return plainSection(s, b, { inner: true, label: "Room " + pad(s.n) + " · " + s.label }); },
    },
    /* E — Fan Deck: every section is headed by a cap-colour band, numbered like the deck. */
    e: {
      key: "e",
      hero: function (ctx) {
        return '<header class="sx-hero"><div class="sx-hero-copy">' + heroCopy() + "</div>" +
          '<figure class="sx-hero-art"><div class="sx-deck">' + ctx.published.map(function (p) { return '<span class="sx-chip" style="--cap:' + p.color + '">' + bottle(ctx, p, "sx-chip-bottle", "") + "</span>"; }).join("") + '</div><figcaption class="sx-caption">All seven, draft packaging. ' + M.hero.caption.replace(/^Draft packaging\. /, "") + "</figcaption></figure>" + indexNav() + "</header>";
      },
      section: function (ctx, s, b) {
        return plainSection(s, b, { inner: true, style: "--band:" + CAPS[s.i % CAPS.length], label: s.label + ' <span class="sx-of">/ 10</span>' });
      },
    },
    /* F — Edition: a feature article. Folios, an ultralight headline, italic deks and figure captions. */
    f: {
      key: "f",
      hero: function (ctx) {
        var p = ctx.product("vitamin-d3-k2");
        return '<header class="sx-hero"><p class="sx-folio">Edition 01 · Standards</p><div class="sx-hero-copy">' + heroCopy("The detail behind the bottle.") + "</div>" +
          '<figure class="sx-hero-art"' + (p ? ' style="--cap:' + p.color + '"' : "") + ">" + heroBottles(ctx, ["vitamin-d3-k2"]) + '<figcaption class="sx-caption"><b>Fig. 01</b> ' + M.hero.caption + "</figcaption></figure>" + indexNav("is-contents") + "</header>";
      },
      section: function (ctx, s, b) { return plainSection(s, b, { inner: true, label: "No. " + pad(s.n) + " · " + s.label, q: true }); },
    },
    /* G — Darkroom: a black stage, sections that develop black and white in turn, frames numbered like film. */
    g: {
      key: "g",
      hero: function (ctx) {
        return '<header class="sx-hero"><div class="sx-hero-copy">' + heroCopy("The detail behind the bottle.") + "</div>" +
          '<figure class="sx-hero-art"><div class="sx-spot">' + heroBottles(ctx, ["creatine-chews"]) + '</div><figcaption class="sx-caption"><b>Frame 01 / 10</b> ' + M.hero.caption + "</figcaption></figure>" + indexNav() + "</header>";
      },
      section: function (ctx, s, b) { return plainSection(s, b, { inner: true, cls: s.i % 2 ? "is-print" : "is-negative", label: "Frame " + pad(s.n) + " / 10 · " + s.label }); },
    },
    /* H — Folio: a well-set book. Running heads in the margin; every status is a numbered sidenote. */
    h: {
      key: "h",
      hero: function (ctx) {
        return '<header class="sx-hero"><div class="sx-margin"><p class="sx-rh">§ 1</p><figure class="sx-plate">' + heroBottles(ctx, ["l-theanine"]) + '<figcaption><em>Plate.</em> ' + M.hero.caption + "</figcaption></figure></div>" +
          '<div class="sx-main">' + heroCopy("The detail behind the bottle.") + indexNav() + "</div></header>";
      },
      section: function (ctx, s, b) {
        var note = b.status ? '<div class="sx-sidenote" role="note"><span class="sx-sn" aria-hidden="true">' + s.n + '</span><p class="sx-status-k">Current status · ' + STATE[b.status[1]] + "</p><p>" + b.status[0] + "</p></div>" : "";
        return '<section class="sx-sec" id="' + s.id + '" aria-labelledby="' + s.id + '-t"><div class="sx-margin"><p class="sx-rh">§ ' + s.n + "</p><p class=\"sx-rh-l\">" + s.label + "</p>" + note + "</div>" +
          '<div class="sx-main">' + head(s) + '<div class="sx-body">' + (b.lead ? mean(b.lead + (b.status ? '<sup class="sx-ref" aria-hidden="true">' + s.n + "</sup>" : "")) : "") + b.html + "</div>" + note.replace('class="sx-sidenote"', 'class="sx-sidenote sx-footnote"') + "</div></section>";
      },
    },
  };

  Object.keys(V).forEach(function (d) {
    if (!S.themes[d]) return;
    var base = S.themes[d];
    var next = {};
    Object.keys(base).forEach(function (k) { next[k] = base[k]; });
    next.standards = function (ctx) { return compose(V[d], ctx); };
    S.themes[d] = next;
  });

  /* ====================================================================================================
     4. BEHAVIOUR — only what helps a visitor inspect the information. Keyboard first; nothing animates.
     ==================================================================================================== */
  var cleanup = function () {};
  function enhance() {
    cleanup();
    var root = document.querySelector("[data-sx]");
    if (!root) return;
    var abort = new AbortController(), signal = abort.signal, io = null, heroIo = null;

    /* Product picker: one pressed button, its panel shown. Arrow keys move between products. */
    root.querySelectorAll("[data-sx-picker]").forEach(function (pk) {
      var btns = [].slice.call(pk.querySelectorAll("[data-sx-pick]"));
      function pick(id, focus) {
        btns.forEach(function (b) { var on = b.dataset.sxPick === id; b.setAttribute("aria-pressed", String(on)); if (on && focus) b.focus(); });
        pk.querySelectorAll("[data-sx-panel]").forEach(function (p) { p.hidden = p.dataset.sxPanel !== id; });
      }
      btns.forEach(function (b, i) {
        b.addEventListener("click", function () { pick(b.dataset.sxPick); }, { signal: signal });
        b.addEventListener("keydown", function (e) {
          var k = e.key, j = k === "ArrowRight" || k === "ArrowDown" ? i + 1 : k === "ArrowLeft" || k === "ArrowUp" ? i - 1 : k === "Home" ? 0 : k === "End" ? btns.length - 1 : null;
          if (j === null) return;
          e.preventDefault();
          j = (j + btns.length) % btns.length;
          pick(btns[j].dataset.sxPick, true);
        }, { signal: signal });
      });
    });

    /* Label anatomy: hovering or focusing a field lights its zone on the diagram. */
    root.querySelectorAll("[data-sx-anatomy]").forEach(function (fig) {
      function light(i) { fig.querySelectorAll("[data-sx-zone]").forEach(function (z) { z.classList.toggle("is-lit", z.dataset.sxZone === i); }); fig.querySelectorAll("[data-sx-field]").forEach(function (f) { f.classList.toggle("is-lit", f.dataset.sxField === i); }); }
      fig.querySelectorAll("[data-sx-field]").forEach(function (f) {
        ["mouseenter", "focus"].forEach(function (ev) { f.addEventListener(ev, function () { light(f.dataset.sxField); }, { signal: signal }); });
        ["mouseleave", "blur"].forEach(function (ev) { f.addEventListener(ev, function () { light(null); }, { signal: signal }); });
      });
    });

    /* Section index: mark the section being read. */
    var links = [].slice.call(root.querySelectorAll("[data-sx-spy]"));
    if (links.length && "IntersectionObserver" in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (a) { if (a.dataset.sxSpy === en.target.id) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
        });
      }, { rootMargin: "-35% 0px -55% 0px" });
      ORDER.forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
      /* Back at the top: no section is being read. */
      var hero = root.querySelector(".sx-hero");
      if (hero) {
        heroIo = new IntersectionObserver(function (en) { if (en[0].isIntersecting) links.forEach(function (a) { a.removeAttribute("aria-current"); }); }, { rootMargin: "0px 0px -60% 0px" });
        heroIo.observe(hero);
      }
    }
    /* Optional expansion: open on wide screens, summary-only on phones. A visitor's own toggle is kept until resize. */
    var wide = matchMedia("(min-width: 761px)");
    function sync() { root.querySelectorAll("[data-sx-wide-open]").forEach(function (d) { d.open = wide.matches; }); }
    sync();
    wide.addEventListener("change", sync, { signal: signal });
    cleanup = function () { abort.abort(); if (io) io.disconnect(); if (heroIo) heroIo.disconnect(); };
  }

  window.BCCStandards = { model: M, records: RECORDS, enhance: enhance };
})();
