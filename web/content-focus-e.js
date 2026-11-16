/* Body Café Co. — "Part 2 · Content Focus" (?design=e&part=5): Part 2 with the new copy from
   Body_Cafe_Co_VersionE_Copy_Transformation.xlsx (Before & After, Hero Options A, Product Pages). The numbers in the comments are its Sr. rows.
   Part 2 itself is untouched: every change here runs only when body[data-content-focus="1"]. Pages are rewritten as they render,
   before they reach the screen. The left-hand texts are the source strings, so "lot" here is what batch-terms-e.js shows as "batch". */
(function () {
  "use strict";
  var S = window.BCCSite;
  if (!S || !S.themes || !S.themes.e) return;
  function focus() { return document.body.dataset.contentFocus === "1"; }

  var HERO = {
    lines: ["It’s not the list.", "It’s the logic."], // 2
    lede: "Seven supplements. Every ingredient, form and amount chosen by a formulation scientist, for a reason you can read.", // 3
    link: "See the reasoning" // 5
  };
  var TEXT = {
    home: [ // 6, 9, 20, 21, 24
      ["Third-party tested", "Independent testing from batch one"],
      ["Seven. Each in its own colour.", "Seven formulas. Nothing along for the ride."],
      ["Four rules we never bend.", "Every formula is four decisions."], ["Right form", "Form first"], ["Exact dose, stated", "Amounts that mean something"], ["Every lot tested", "Checked, not assumed"],
      ["Every bottle carries a lot number.", "Your bottle has a paper trail."],
      ["Choose your product by its cap, type the number from the pack, and see the record for that batch.", "Every pack carries a Batch No. Choose your product by its cap, type the number, and see the record for that batch."],
      ["The softgel contains fish oil and gelatin, and the pack says so clearly. Other brands hid that in small print.", "The softgel contains fish oil and gelatin, and the label says so clearly."]
    ],
    shop: [ // 28; the rest from the shop refinements (16 Nov 2026, owner-approved)
      ["Seven supplements, each made to one uncompromising standard.", "Five single-ingredient formulas. Two deliberate combinations. Every amount printed. Take what you need. Skip what you don’t."],
      ["All prices are MRP, inclusive of all taxes. Delivery is free on orders of ₹1,499 or more.", "All prices are MRP, inclusive of all taxes. Delivery is ₹75, free on orders of ₹1,499 or more."],
      ["Ask about any of the seven.", "Not sure which one fits? Ask about any of the seven."],
      ["Not sure where to start?", "Ask Barista"]
    ],
    standards: [ // 31–38
      ["One uncompromising standard.", "Every formula is four decisions."],
      ["Seven supplements. Four rules we never bend. This is what they look like on every bottle.", "Which ingredient. Which form. How much. And what, if anything, it belongs with. Here are our answers, bottle by bottle."],
      ["Right form", "Form first"],
      ["We choose the form of each ingredient first, then name it on the label. Form decides what you are actually taking, so you should never have to guess it.", "The same nutrient comes in different forms, and the form decides what you are actually taking. We choose it first, then name it on the label: iron as Ferrochel® bisglycinate, K2 as MK-7, omega-3 as triglycerides."],
      ["Exact dose, stated", "Amounts that mean something"],
      ["The amount in every serving is printed on the label and on this site. Where two ingredients work together, you see both numbers.", "We print the amount you actually get: 29 mg of elemental iron, not the weight of the compound; the omega-3, not just the oil. Where two ingredients share a product, there is a reason, and you see both numbers."],
      ["Every lot tested", "Checked, not assumed"],
      ["Every product is made in GMP-certified facilities and third-party tested. Every lot carries its own number, so a record can be traced to the batch in your hand.", "Every product is made in GMP-certified facilities against a written specification. From our first production batch, independent laboratories test each batch, and its Batch No. links the result to the bottle in your hand."]
    ],
    story: [ // 44–49, 51
      ["You should always know what you’re being served.", "The questions come before the capsule."],
      ["A good café shows you the menu. So do we.", "Meet Dr. Nayan Solanki (PhD, Industrial Pharmacy), the formulation scientist behind our seven, and the decisions he made for each."],
      ["The front of the label shouts. The back whispers.", "A longer list isn’t a better formula."],
      ["Most supplement labels lead with promises and leave the facts in small print: which form the ingredient is in, how much you actually get, and when to take it. We turned that around.", "Supplements are often judged by how many ingredients they contain. But a list can’t tell you why each ingredient was chosen, whether the amount means anything, or whether the ingredients work well together. Sometimes one ingredient is right. Sometimes a combination is justified. The reason is what matters."],
      ["Seven, and only seven.", "Trained where every milligram must be justified."],
      ["We make seven supplements. Each one is an everyday essential, and each one is made the same way. A small range lets us hold every product to the same standard, and say exactly what is in it.", "Dr. Nayan Solanki holds a PhD in Industrial Pharmacy. His career has been in developing medicines: choosing the form of each ingredient, setting specifications, and checking compatibility and stability. In that work, every ingredient, dose and form is a decision you must be able to explain. He brought the same discipline to Body Café Co., personally selecting the ingredient, form, dose and combination in each of our seven products."],
      ["How we work.", "Four questions, asked of every formula."]
    ],
    learn: [ // 59, 60, 62, 64
      ["Read the label. Know the form.", "Ask what’s in it. Then ask why."],
      ["Short, plain guides to the seven and to reading any supplement label.", "Plain-English guides to each of the seven, and to the questions worth asking of any supplement label."],
      ["Reading any label.", "The label, decoded."],
      ["Why the full ingredient name matters when you compare products.", "Same nutrient, different form: why the full name matters."]
    ],
    product: [ // 68, 69, 70, 24
      ["Frequently bought with", "Build your routine"],
      ["Nothing is ticked. Add one only if you need it.", "Add one only if you need it. Each has its own timing, so follow every label."],
      ["Free delivery on orders of ₹1,499 or more", "Delivery ₹75, free on orders of ₹1,499 or more"],
      ["Recommended for you", "Also in the range"],
      ["The softgel contains fish oil and gelatin, and the pack says so clearly. Other brands hid that in small print.", "The softgel contains fish oil and gelatin, and the label says so clearly."]
    ]
  };
  var RULES = [["Is this the right ingredient?", "Chosen for the purpose, never to lengthen a label."], ["Is this the right form?", "The form decides what you actually take."], ["Is this the right amount?", "Set against a reference, printed per serving."], ["Does it belong with anything else?", "Combined only when there’s a reason."]]; // 52–55
  var STORY_LINK = "See the reasoning"; // 57
  // 39. The laboratories are not named until their agreements are signed and they consent to it (claim C6).
  var TESTING = ["FROM BATCH ONE", "Independent laboratory testing of every batch"];
  var FOOTER = "No ingredient without a reason."; // 72
  // Product Pages sheet, the seven launched products. Magnesium Glycinate and Beetroot are not launched and stay out.
  var PRODUCTS = {
    "iron-bisglycinate": {
      "headline": "Iron first. Chai later.",
      "support": "29 mg of elemental iron per capsule, as Ferrochel® ferrous bisglycinate chelate. Taken alone, on an empty stomach, away from milk.",
      "ingredient": "Iron is an essential mineral. The ICMR daily requirement for adult women is 29 mg, the amount in one capsule.",
      "form": "Ferrous bisglycinate chelate is iron bound to glycine, an amino acid. We use Ferrochel®, a named branded source of this form, and print the brand name on the front so you know exactly which form is inside.",
      "amount": "29 mg of elemental iron: 100% of the ICMR RDA for adult women. We print the iron you actually get, not the weight of the compound it comes in.",
      "decision": "Iron stands alone. Calcium in the same meal can reduce how much iron is absorbed, so the directions keep milk and chai two hours away."
    },
    "vitamin-d3-k2": {
      "headline": "Two fat-soluble vitamins. One oil. On purpose.",
      "support": "600 IU vitamin D3 and 55 mcg vitamin K2 as MK-7, dissolved in anchovy fish oil in one softgel.",
      "ingredient": "Vitamin D helps the body absorb calcium, and vitamin K is needed for proteins involved in bone. They are paired because both have roles in bone health.",
      "form": "D3 as cholecalciferol and K2 as MK-7, both fat-soluble, so they are carried in oil rather than pressed into a dry tablet. The oil also adds 200 mg of omega-3.",
      "amount": "600 IU of D3 and 55 mcg of K2, each 100% of the ICMR RDA: a daily amount at the reference level, not a megadose.",
      "decision": "A deliberate combination. Both vitamins dissolve in fat, so one softgel of oil carries both. Take it with a meal."
    },
    "omega-3-fish-oil": {
      "headline": "Count the omega-3, not the oil.",
      "support": "1,000 mg of anchovy fish oil concentrate per softgel, carrying 800 mg of omega-3: 400 mg EPA and 300 mg DHA.",
      "ingredient": "EPA and DHA are the omega-3 fatty acids people look for in fish oil. The body makes very little of them, so they come mainly from fish.",
      "form": "Concentrated anchovy oil, with the omega-3 kept in triglyceride form, the form found in fish.",
      "amount": "800 mg of omega-3 per softgel. A typical 1,000 mg fish oil contains about 300 mg of EPA and DHA, so the number that matters is the omega-3, and we print it.",
      "decision": "One softgel, two numbers on the label: the oil and the omega-3 inside it, with EPA and DHA shown separately."
    },
    "l-theanine": {
      "headline": "One amino acid. 200 mg. Nothing else active.",
      "support": "200 mg of L-theanine, the amino acid naturally found in green tea, in one vegetarian capsule.",
      "ingredient": "L-theanine is the amino acid that tea is known for. It is a simple, well-characterised single ingredient.",
      "form": "Free-form L-theanine, on its own, so the amount you take is the amount on the label.",
      "amount": "200 mg, an amount used in published studies.",
      "decision": "One ingredient, one number, one capsule. No blend to divide the dose."
    },
    "myo-d-chiro-inositol": {
      "headline": "Two inositols. One ratio. 40:1, on the front.",
      "support": "2,000 mg myo-inositol and 50 mg D-chiro-inositol per serving: a 40:1 ratio, printed on the front.",
      "ingredient": "Myo-inositol and D-chiro-inositol are two forms of inositol that the body uses side by side.",
      "form": "Both forms are included because research has looked at them together, in a defined ratio, rather than either alone.",
      "amount": "2,000 mg + 50 mg per three capsules: 40:1, a ratio used in published research. Our specification checks that each batch stays between 36:1 and 44:1.",
      "decision": "A deliberate combination where the ratio is the formula, so the ratio goes on the front."
    },
    "creatine-chews": {
      "headline": "3 grams of creatine. Two chews. Your time.",
      "support": "3,000 mg of creatine monohydrate in two orange chewable tablets. No powder, no shaker.",
      "ingredient": "Creatine is one of the most researched sports-nutrition ingredients, and it is meant to be taken every day.",
      "form": "Creatine monohydrate, the most studied form. It comes as a chew because a daily habit is easier when nothing needs mixing.",
      "amount": "3 g per serving, within the 3–5 g daily intake commonly used in research.",
      "decision": "We chose a chewable format for consistency, and we print the sugar it needs: 3.6 g per serving."
    },
    "psyllium-husk": {
      "headline": "The isabgol you know, measured in capsules.",
      "support": "2,000 mg of psyllium husk in five capsules, giving 1,578 mg of dietary fibre, 1,362 mg of it soluble.",
      "ingredient": "Psyllium (isabgol) is a familiar source of soluble fibre in most Indian homes.",
      "form": "Whole psyllium husk in capsules: the same ingredient, with nothing to stir.",
      "amount": "2,000 mg per serving, a measured daily top-up of fibre. We print both the husk weight and the fibre it gives, because they are different numbers.",
      "decision": "Isabgol, measured. Always with a full glass of water."
    }
  };

  /* What each product is for (16 Nov 2026, owner-approved). Only the front-label Key Benefit, which the Version E workbook keeps
     as the permitted claim (Claims sheet, C20, FSSAI consultant to verify), then the label amounts behind it. No condition,
     outcome or timing promise. [shop card, one line · range, at most two lines · product page claim · product page facts] */
  var USE = {
    "omega-3-fish-oil": ["Heart · Brain · Joints", "Supports heart, brain & joint health", "Supports heart, brain and joint health.", "Each softgel gives 800 mg omega-3 as triglycerides: 400 mg EPA and 300 mg DHA."],
    "vitamin-d3-k2": ["Bones · Muscles · Heart", "Supports bone, muscle & heart health", "Supports bone, muscle and heart health.", "One softgel gives 600 IU vitamin D3, 55 mcg vitamin K2 as MK-7 and 200 mg omega-3."],
    "creatine-chews": ["Strength · Performance", "Supports strength & performance", "Supports strength and performance.", "Two orange chewable tablets give 3,000 mg creatine monohydrate, with no powder to mix."],
    "iron-bisglycinate": ["Hemoglobin · Energy", "Supports hemoglobin formation & energy metabolism", "Supports hemoglobin formation and energy metabolism.", "Each capsule gives 29 mg iron as Ferrochel® ferrous bisglycinate chelate."],
    "l-theanine": ["Calm · Focus", "Supports a calm mind & clear focus", "Supports a calm mind and clear focus.", "Each capsule gives 200 mg L-Theanine, the amino acid naturally found in green tea."],
    "myo-d-chiro-inositol": ["Hormones · Metabolism", "Supports hormonal & metabolic balance", "Supports hormonal and metabolic balance.", "Three capsules give 2,000 mg Myo-Inositol and 50 mg D-Chiro Inositol, a 40:1 ratio."],
    "psyllium-husk": ["Digestion · Regularity", "Supports digestive health & regularity", "Supports digestive health and regularity.", "Five capsules give 2,000 mg psyllium husk (isabgol), with 1,578 mg dietary fibre."]
  };
  /* The admin portal decides this copy (16 Nov 2026): a product's "Content Focus copy" fields (cf_…), when the catalogue
     carries them, replace the lines in PRODUCTS and USE above before each page renders. The lines above stay as the
     defaults: web/label-content.js offers them to the admin form through BCCContentFocusCopy.defaults(). */
  var COPY = { cf_headline: "headline", cf_support: "support", cf_ingredient: "ingredient", cf_form: "form", cf_amount: "amount", cf_decision: "decision" };
  var BASE = JSON.parse(JSON.stringify({ P: PRODUCTS, U: USE }));
  function has(o, k) { return !!o && Object.prototype.hasOwnProperty.call(o, k) && typeof o[k] === "string"; }
  function fromAdmin(list) {
    (list || []).forEach(function (p) {
      var c = p && BASE.P[p.id], u = p && BASE.U[p.id]; if (!c || !u) return;
      Object.keys(COPY).forEach(function (k) { PRODUCTS[p.id][COPY[k]] = has(p, k) ? p[k].trim() : c[COPY[k]]; });
      USE[p.id][2] = has(p, "cf_claim") ? p.cf_claim.trim() : u[2];
      USE[p.id][3] = has(p, "cf_facts") ? p.cf_facts.trim() : u[3];
    });
  }
  window.BCCContentFocusCopy = { defaults: function (id) {
    var c = BASE.P[id], u = BASE.U[id], pts = ((window.BCCPart2E || {}).PDP || {})[id]; if (!c || !u) return {};
    return { cf_claim: u[2], cf_facts: u[3], cf_headline: c.headline, cf_support: c.support, cf_ingredient: c.ingredient, cf_form: c.form,
      cf_amount: c.amount, cf_decision: c.decision, cf_points: ((pts && pts.points) || []).join("\n") };
  } };
  /* Home refinements (16 Nov 2026, owner-approved). Sources: the Version E workbook (addition D1, row 43, claims C4–C6) and
     the product presentation ("Take what you need. Skip what you don't."). */
  var HOME = {
    range: "Five single-ingredient formulas. Two deliberate combinations. Take what you need. Skip what you don’t.",
    intro: "A long ingredient list can look impressive. It can’t tell you why each ingredient was chosen, whether each amount means anything, or whether a combination makes sense. Every formula answers four questions first.",
    // The four decisions, each with a real example from the seven: [product whose cap colours it, label, heading, example].
    decisions: [
      ["iron-bisglycinate", "Ingredient", "The right ingredient", "Iron stands alone, as Ferrochel® bisglycinate."],
      ["omega-3-fish-oil", "Form", "The right form", "K2 as MK-7. Omega-3 as triglycerides."],
      ["iron-bisglycinate", "Amount", "The right amount", "29 mg of iron you actually get, not the compound’s weight."],
      ["vitamin-d3-k2", "Combination", "A reason to combine", "D3 and K2 share one oil, because both dissolve in fat."]
    ],
    scientist: "Meet the scientist behind them",
    // Testing moves here from the standard band: it starts with the first production batch (claim C6).
    testing: "From our first production batch, independent laboratories test each batch, and its record appears here.",
    faqs: [
      ["Should I take all seven?", "No. Each of the seven is made for its own purpose. Choose only what you need and follow its label. If you’re pregnant, breastfeeding, under medical care or unsure, ask a healthcare professional first."],
      ["Are they vegetarian?", "Five are vegetarian. Omega-3 Fish Oil and Vitamin D3 + K2 are softgels made with fish oil and gelatin, so they are non-vegetarian."]
    ]
  };
  function idOf(a) { var m = a && /\/products\/([^/?#]+)/.exec(a.getAttribute("href") || ""); return m ? m[1] : ""; }

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function swap(root, pairs) {
    var map = {}, n, tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    pairs.forEach(function (p) { map[p[0]] = p[1]; });
    while ((n = tw.nextNode())) { var k = n.nodeValue.trim(); if (Object.prototype.hasOwnProperty.call(map, k)) n.nodeValue = n.nodeValue.replace(k, map[k]); }
  }
  // The range cards, Learn cards and product panels read their line from the product-page headlines.
  function headlines() {
    var P = window.BCCPdpE && window.BCCPdpE.P; if (!P) return;
    Object.keys(PRODUCTS).forEach(function (id) { if (P[id]) P[id].headline = PRODUCTS[id].headline; });
  }
  function page(name, fn) {
    var base = S.themes.e[name];
    if (typeof base !== "function") return;
    var next = Object.assign({}, S.themes.e);
    next[name] = function () {
      if (!focus()) return base.apply(this, arguments);
      var ctx0 = arguments[0] || {}; fromAdmin(ctx0.catalog || ctx0.published);
      headlines();
      var html = base.apply(this, arguments);
      if (typeof html !== "string") return html;
      var t = document.createElement("template"); t.innerHTML = html;
      try { fn(t.content, arguments); } catch (e) { if (window.console) console.warn("Content Focus copy skipped:", e); return html; }
      return t.innerHTML;
    };
    S.themes.e = next;
  }

  page("home", function (root, args) {
    var ctx = args[0] || {}, colour = function (id) { var p = (ctx.catalog || []).filter(function (x) { return x.id === id; })[0]; return p ? p.color : "#999"; };
    var h1 = root.querySelector("#p2-hero-t");
    if (h1) {
      h1.innerHTML = "<b>" + esc(HERO.lines[0]) + "</b> <span><b>" + esc(HERO.lines[1]) + "</b></span>";
      h1.insertAdjacentHTML("afterend", '<p class="p2-lede cf-hero-lede">' + esc(HERO.lede) + "</p>");
    }
    var link = root.querySelector(".p2-hc-copy .p2-link"); if (link) link.textContent = HERO.link;
    swap(root, TEXT.home);
    // The range: what each product is for, under its name, open or closed.
    [].forEach.call(root.querySelectorAll(".p2-col h3"), function (h) {
      // Shown in the open column and in the list rows; a closed column on wide screens shows only its name (content-focus-e.css).
      var u = USE[idOf(h.querySelector("a"))]; if (u) h.insertAdjacentHTML("afterend", '<p class="cf-use cf-use-range">' + esc(u[1]) + "</p>");
    });
    var rangeH = root.querySelector("#p2-seven-t");
    if (rangeH) rangeH.insertAdjacentHTML("afterend", '<p class="cf-sec-lede">' + esc(HOME.range) + "</p>");
    // Our standard: the four decisions the heading names, each with an example, instead of the status list.
    var std = root.querySelector(".p2-stdband"), stdH = std && std.querySelector("#p2-std-t"), list = std && std.querySelector(".p2-std4");
    if (stdH) stdH.insertAdjacentHTML("afterend", '<p class="cf-sec-lede">' + esc(HOME.intro) + '</p><a class="p2-link cf-sec-link" href="/story">' + esc(HOME.scientist) + "</a>");
    if (list) {
      list.classList.add("cf-decisions");
      list.innerHTML = HOME.decisions.map(function (d) { return '<li style="--cap:' + esc(colour(d[0])) + '"><b class="p2-std4-tag">' + esc(d[1]) + "</b><h3>" + esc(d[2]) + "</h3><p>" + esc(d[3]) + "</p></li>"; }).join("");
    }
    // Batch band: where testing now stands.
    var lot = root.querySelector(".p2-lotband-in > div > p:not(.p2-eyebrow)");
    if (lot) lot.insertAdjacentHTML("afterend", '<p class="cf-testing">' + esc(HOME.testing) + "</p>");
    // FAQ: the two questions the Super Sevens raise first.
    var accs = root.querySelector(".p2-faq .p2-accs");
    if (accs) accs.insertAdjacentHTML("afterbegin", HOME.faqs.map(function (f) { return '<details class="p2-acc"><summary><span>' + esc(f[0]) + '</span><i aria-hidden="true"></i></summary><div class="p2-acc-body"><p>' + esc(f[1]) + "</p></div></details>"; }).join(""));
  });
  // Shop card facts: the amount per serving, then how many days a bottle lasts (its servings per pack, from the catalogue).
  var CARD = {
    "omega-3-fish-oil": "800 mg omega-3 per softgel", "vitamin-d3-k2": "600 IU D3 + 55 mcg K2 per softgel", "creatine-chews": "3,000 mg per 2 orange chews",
    "iron-bisglycinate": "29 mg iron per capsule", "l-theanine": "200 mg per capsule", "myo-d-chiro-inositol": "40:1 ratio per 3 capsules", "psyllium-husk": "2,000 mg husk per 5 capsules"
  };
  page("shop", function (root, args) {
    var ctx = args[0] || {}, find = function (id) { return (ctx.catalog || ctx.published || []).filter(function (x) { return x.id === id; })[0] || {}; };
    swap(root, TEXT.shop);
    [].forEach.call(root.querySelectorAll(".p2-tile h3"), function (h) {
      var id = idOf(h.querySelector("a")), p = find(id), u = USE[id], days = parseInt(p.servings_per_pack, 10), fact = h.parentNode.querySelector(".p2-fact");
      // The veg / non-veg mark, as printed on the label.
      var diet = String(p.dietary_suitability || "");
      // In the top corner of the product image, where shoppers in India look for it; the name keeps its full width.
      var media = h.closest(".p2-tile") && h.closest(".p2-tile").querySelector(".p2-tile-media");
      if (diet && media) {
        var veg = !/^non/i.test(diet), label = veg ? "Vegetarian" : "Non-vegetarian";
        media.insertAdjacentHTML("afterend", '<span class="cf-diet ' + (veg ? "is-veg" : "is-nonveg") + '" role="img" aria-label="' + label + '" title="' + label + '"><i></i></span>');
      }
      if (u) h.insertAdjacentHTML("afterend", '<p class="cf-use cf-use-card" title="' + esc(u[1]) + '">' + esc(u[0]) + "</p>");
      if (fact && CARD[id] && days) fact.textContent = CARD[id] + " · " + days + " days";
    });
  });
  /* Our standard (16 Nov 2026, owner-approved): the page delivers the four decisions its heading names, in the home page's
     words, then the two proof sections. The reasons are the product pages' own "why" lines, shortened for the amounts. */
  var STD = {
    decisions: [["ingredient", "The right ingredient"], ["form", "The right form"], ["dose", "The right amount"], ["combine", "A reason to combine"]],
    // The intro is the Version E workbook's own sentence (Text Replacements, row 15). The amount section keeps its paragraph.
    pick: ["The right ingredient, in the right form", "We start with the purpose, choose the ingredient that serves it, then choose its form. Both are named on the label, because form decides what you are actually taking."],
    amount: ["The right amount", ""],
    amounts: {
      "omega-3-fish-oil": ["800 mg omega-3", "400 mg EPA + 300 mg DHA, from 1,000 mg of oil"],
      "vitamin-d3-k2": ["600 IU D3 · 55 mcg K2", "Each 100% of the ICMR RDA"],
      "creatine-chews": ["3,000 mg creatine", "Within the 3–5 g a day used in research"],
      "iron-bisglycinate": ["29 mg iron", "100% of the ICMR RDA for adult women"],
      "l-theanine": ["200 mg L-Theanine", "An amount used in published studies"],
      "myo-d-chiro-inositol": ["2,000 mg + 50 mg", "A 40:1 ratio used in published research"],
      "psyllium-husk": ["2,000 mg husk", "Gives 1,578 mg of dietary fibre"]
    },
    combine: ["A reason to combine", "Five of the seven hold one active ingredient. Two combine, each for a stated reason."],
    combos: [
      ["vitamin-d3-k2", "Combination", "Vitamin D3 + K2", "Both vitamins dissolve in fat, so one softgel of oil carries both."],
      ["myo-d-chiro-inositol", "Combination", "Myo & D-Chiro Inositol", "The ratio is the formula: 40:1, printed on the front."],
      ["iron-bisglycinate", "Stands alone", "Iron Bisglycinate", "Calcium in the same meal can reduce how much iron is absorbed, so iron stands alone."]
    ],
    proof: "The proof",
    scientist: "Meet the scientist behind them"
  };
  page("standards", function (root, args) {
    var ctx = args[0] || {}, colour = function (id) { var p = (ctx.catalog || []).filter(function (x) { return x.id === id; })[0]; return p ? p.color : "#999"; };
    swap(root, TEXT.standards);
    [].forEach.call(root.querySelectorAll(".p2-std-status li"), function (li) {
      if (/Third-party testing/.test(li.textContent)) li.innerHTML = '<span class="is-soon">' + esc(TESTING[0].charAt(0) + TESTING[0].slice(1).toLowerCase()) + "</span>" + esc(TESTING[1]);
    });
    var dots = function (on) { return '<p class="p2p-rule-k" aria-hidden="true">' + STD.decisions.map(function (x, k) { return '<i class="' + (on.indexOf(k) > -1 ? "is-on" : "") + '"></i>'; }).join("") + "</p>"; };
    var head = function (sec, on, t) { var c = sec && sec.querySelector(".p2p-rule-copy"); if (c) { var k = c.querySelector(".p2p-rule-k"), h = c.querySelector("h2"), p = c.querySelector("p:not(.p2p-rule-k)"); if (k) k.outerHTML = dots(on); if (h) h.textContent = t[0]; if (p && t[1]) p.textContent = t[1]; } };
    // The four labels around the bottle name the four decisions.
    [].forEach.call(root.querySelectorAll(".p2p-chips .p2p-chip"), function (a, i) {
      var d = STD.decisions[i]; if (!d) return;
      a.setAttribute("href", "#" + d[0]); a.innerHTML = '<i aria-hidden="true"></i>' + esc(d[1]);
    });
    // 1 and 2 · Ingredient and form share the cap picker: why the ingredient, then the form and why.
    var form = root.querySelector("#form");
    if (form) {
      form.id = "ingredient"; form.insertAdjacentHTML("afterbegin", '<span id="form" class="cf-anchor"></span>');
      head(form, [0, 1], STD.pick);
      [].forEach.call(form.querySelectorAll("[data-p2p-panel]"), function (panel) {
        var c = PRODUCTS[panel.getAttribute("data-p2p-panel")], val = panel.querySelector(".p2p-pick-val");
        if (!c || !val) return;
        val.insertAdjacentHTML("beforebegin", '<p class="cf-pick-k">Why this ingredient?</p><p class="cf-pick-why">' + esc(c.ingredient) + '</p><p class="cf-pick-k">The form</p>');
        val.insertAdjacentHTML("afterend", '<p class="cf-pick-why">' + esc(c.form) + "</p>");
      });
    }
    // 3 · Amount: each card says how much and against which reference.
    var dose = root.querySelector("#dose");
    if (dose) {
      head(dose, [2], STD.amount);
      [].forEach.call(dose.querySelectorAll(".p2p-doses a"), function (a) {
        var x = STD.amounts[idOf(a)], k = a.querySelector(".p2p-dose-k"), s = a.querySelector(".p2p-dose-s");
        if (!x || !k) return;
        k.textContent = x[0];
        (s || k).insertAdjacentHTML("afterend", '<span class="cf-dose-why">' + esc(x[1]) + "</span>");
      });
      // 4 · Combination: which two combine and why, and why iron does not.
      dose.insertAdjacentHTML("afterend", '<section class="p2p-rule cf-combine" id="combine"><div class="p2-wrap"><div class="p2p-rule-copy" data-p2p-reveal>' + dots([3]) + "<h2>" + esc(STD.combine[0]) + "</h2><p>" + esc(STD.combine[1]) + "</p></div>" +
        '<ul class="p2-std4 cf-decisions cf-combos">' + STD.combos.map(function (c) { return '<li data-p2p-reveal style="--cap:' + esc(colour(c[0])) + '"><b class="p2-std4-tag">' + esc(c[1]) + '</b><h3><a href="/products/' + esc(c[0]) + '">' + esc(c[2]) + "</a></h3><p>" + esc(c[3]) + "</p></li>"; }).join("") + "</ul></div></section>");
    }
    // The two proof sections follow the decisions: no decision dots, a plain label instead.
    ["#tested", "#hidden"].forEach(function (sel) {
      var k = root.querySelector(sel + " .p2p-rule-k"); if (k) k.outerHTML = '<p class="p2-eyebrow cf-proof">' + esc(STD.proof) + "</p>";
    });
    var end = root.querySelector(".p2p-end .p2-actions");
    if (end) end.insertAdjacentHTML("beforeend", '<a class="p2-link" href="/story">' + esc(STD.scientist) + "</a>");
  });
  /* Story (16 Nov 2026, owner-approved). The founder line avoids the title "Scientific Founder" until it is approved (claim
     C5), and his career sentence is the Text Replacements workbook's (row 30): the earlier one said "manufacturing", which
     the site's manufacturer-name filter removes. The seven bottles get their own chapter back, as the Super Sevens. */
  var SEVENS = ["The Super Sevens.", "We launch with seven. Five single-ingredient formulas and two deliberate combinations. A small range lets us ask the same four questions of every product, and say exactly what is in it. Take what you need. Skip what you don’t."];
  function story(root) {
    swap(root, TEXT.story);
    var seven = root.querySelector(".p2p-chap-seven"), founder = seven && seven.querySelector(".p2p-chap-copy"), lineup = seven && seven.querySelector(".p2p-lineup");
    if (founder && lineup) {
      var sec = document.createElement("section"); sec.className = "p2p-chap cf-founder";
      var wrap = document.createElement("div"); wrap.className = "p2-wrap"; sec.appendChild(wrap);
      seven.parentNode.insertBefore(sec, seven); wrap.appendChild(founder);
      lineup.insertAdjacentHTML("beforebegin", '<div class="p2p-chap-copy p2p-chap-center" data-p2p-reveal><h2>' + esc(SEVENS[0]) + "</h2><p>" + esc(SEVENS[1]) + "</p></div>");
    }
    var rules = root.querySelector(".p2-rules");
    if (rules) rules.innerHTML = RULES.map(function (r) { return "<li><strong>" + esc(r[0]) + "</strong> " + esc(r[1]) + "</li>"; }).join("");
    var link = root.querySelector(".p2-actions-left .p2-link"); if (link) link.textContent = STORY_LINK;
  }
  page("story", story);
  page("about", story);
  /* Help (16 Nov 2026, owner-approved). "Before you order" held old preview answers that contradicted the published policies.
     These come from the Help articles, the policies (web/support-content.js) and the labels. The contact band gains WhatsApp
     and the opening hours, both from the business details in the same file. */
  var HELP_FAQS = [
    ["Should I take all seven?", "No. Each of the seven is made for its own purpose. Choose only what you need and follow its label. If you’re pregnant, breastfeeding, under medical care or unsure, ask a healthcare professional first."],
    ["Are they vegetarian?", "Five are vegetarian. Omega-3 Fish Oil and Vitamin D3 + K2 are softgels made with fish oil and gelatin, so they are non-vegetarian."],
    ["When should I take a product?", "Each label says when. Six are best in the morning; Psyllium Husk is best at night. Iron is taken on an empty stomach, and the product page shows whether each of the others goes with food."],
    ["What do the prices include?", "Prices are shown as MRP, inclusive of all taxes."],
    ["How much is delivery?", "Delivery is ₹75, free when the subtotal after discount is ₹1,499 or more."],
    ["How can I pay?", "Pay online by UPI, card, wallet or net banking, through our payment partner Razorpay. Cash on delivery isn’t available."],
    ["Can I return a product?", "We don’t accept change-of-mind returns. If something arrives damaged, wrong, missing, faulty or expired, tell us within 7 days of delivery and we’ll arrange a refund or replacement."],
    ["Where do I find my batch report?", "Choose your product on the batch reports page and enter the Batch No. printed on the pack. Records appear as reports are published."]
  ];
  page("help", function (root) {
    var accs = root.querySelector(".p2p-help .p2p-faq .p2-accs");
    if (accs) accs.innerHTML = HELP_FAQS.map(function (f) { return '<details class="p2-acc"><summary><span>' + esc(f[0]) + '</span><i aria-hidden="true"></i></summary><div class="p2-acc-body"><p>' + esc(f[1]) + "</p></div></details>"; }).join("");
    var B = (window.BCCSupportContent || {}).BUSINESS || {}, wa = B.channels && B.channels.whatsapp, band = root.querySelector(".p2p-help .p2p-contact"), list = band && band.querySelector(".p2p-contact-list");
    var tel = list && list.querySelector('a[href^="tel:"]');
    if (wa && wa.live && wa.href && tel) {
      var li = tel.parentNode.cloneNode(true), a = li.querySelector("a"), small = li.querySelector("small"), span = small && small.parentNode; // the text, not the icon's wrapper
      a.setAttribute("href", wa.href); a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener");
      if (span) span.innerHTML = "<small>WhatsApp</small>" + esc(wa.detail || "");
      tel.parentNode.insertAdjacentElement("afterend", li);
    }
    var h2 = band && band.querySelector("h2");
    if (h2 && B.hours) h2.insertAdjacentHTML("afterend", '<p class="cf-hours">' + esc(B.hours) + "</p>");
  });
  /* Learn (16 Nov 2026, owner-approved). Each product card shows the question its guide answers (the guides' own questions,
     from web/living-e-pages.js); the two general guides and the glossary that were written but not linked get their cards. */
  var LEARN = {
    questions: {
      "omega-3-fish-oil": "How are fish oil, omega-3, EPA and DHA related?", "vitamin-d3-k2": "Why are these values written in different units?",
      "creatine-chews": "What changes when the format is a chewable tablet?", "iron-bisglycinate": "What does elemental iron mean on a label?",
      "l-theanine": "What does the full ingredient name tell you?", "myo-d-chiro-inositol": "How do you read a 40:1 ratio?",
      "psyllium-husk": "Why is husk weight different from fibre content?"
    },
    // [link, title, line, illustration (small words · large words), link text, product whose cap colours it]
    more: [
      ["/learn/serving-sizes", "Serving sizes, amounts and units", "How the serving, the amount and the unit fit together, so you can compare labels fairly.", ["2 capsules", "= 1 serving"], "Read", "creatine-chews"],
      ["/learn/understanding-evidence", "Understanding evidence", "Ingredient research, product testing, certification and batch reports answer different questions.", ["A study", "≠ a product"], "Read", "l-theanine"],
      ["/learn/glossary", "The words on the label", "The glossary: 29 terms, plainly defined. Each links to the guide that explains it in full.", ["A to Z", "29 terms"], "Open the glossary", "omega-3-fish-oil"]
    ]
  };
  page("learn", function (root, args) {
    var ctx = args[0] || {}, seg = args[1], find = function (id) { return (ctx.catalog || []).filter(function (x) { return x.id === id; })[0] || {}; };
    swap(root, TEXT.learn);
    // The index.
    [].forEach.call(root.querySelectorAll(".p2p-guides a"), function (a) {
      var m = /\/learn\/([^/?#]+)/.exec(a.getAttribute("href") || ""), q = m && LEARN.questions[m[1]], line = a.querySelector(".p2p-guide-copy > span");
      if (q && line) line.textContent = q;
    });
    var cards = root.querySelector(".p2p-articles"), arrow = cards && cards.querySelector(".p2p-go svg");
    if (cards) cards.insertAdjacentHTML("beforeend", LEARN.more.map(function (g) {
      return '<li data-p2p-reveal style="--cap:' + esc(find(g[5]).color || "#8a8f98") + '"><a href="' + g[0] + '"><span class="p2p-art" aria-hidden="true"><span class="cf-art"><em>' + esc(g[3][0]) + "</em><b>" + esc(g[3][1]) + "</b></span></span><strong>" + esc(g[1]) + "</strong><span>" + esc(g[2]) + '</span><span class="p2p-go">' + esc(g[4]) + (arrow ? arrow.outerHTML : "") + "</span></a></li>";
    }).join(""));
    // A product guide: the label's "For adults only" leads its cautions, as on the product page.
    var age = PRODUCTS[seg] && String(find(seg).age_guidance || "").trim();
    if (age) [].forEach.call(root.querySelectorAll(".lr-facts dt"), function (dt) {
      var dd = dt.nextElementSibling;
      if (dt.textContent.trim() === "Cautions" && dd && dd.textContent.indexOf(age) === -1) dd.insertAdjacentText("afterbegin", age + " ");
    });
  });
  page("product", function (root, args) {
    swap(root, TEXT.product);
    // What it's for, straight under the product name: the first thing read in the buy box.
    var u = USE[args[1] && args[1].id], h1 = root.querySelector(".p2-buy h1");
    if (u && h1 && (u[2] || u[3])) h1.insertAdjacentHTML("afterend", '<div class="cf-for"><p class="cf-for-k">What it’s for</p>' + (u[2] ? '<p class="cf-for-claim">' + esc(u[2]) + "</p>" : "") + (u[3] ? '<p class="cf-for-how">' + esc(u[3]) + "</p>" : "") + "</div>");
    var c = PRODUCTS[args[1] && args[1].id], h = root.querySelector(".p2-acc-h");
    if (c && h) {
      var q = function (t, x) { return x ? '<h4 class="cf-q">' + t + "</h4><p>" + esc(x) + "</p>" : ""; };
      h.parentNode.innerHTML = '<h3 class="p2-acc-h">' + esc(c.headline || (args[1] && args[1].name) || "") + "</h3>" + (c.support ? '<p class="cf-support">' + esc(c.support) + "</p>" : "") +
        q("Why this ingredient?", c.ingredient) + q("Why this form?", c.form) + q("Why this amount?", c.amount) + q("The decision", c.decision);
    }
    /* Product page refinements (16 Nov 2026, owner-approved). Everything below is the label's own text, from the catalogue. */
    var p = args[1] || {}, line = function (t) { return String(t || "").trim(); };
    // The amount is already in "What it's for", so the old sub-line under the name goes.
    var sub = root.querySelector(".p2-buy-sub"); if (sub) sub.remove();
    // "Key benefits" repeated the claim that now leads the page: the facts stay, as "At a glance".
    [].forEach.call(root.querySelectorAll(".p2-pdp-accs > details"), function (d) {
      var s = d.querySelector("summary span");
      if (!s || s.textContent.trim() !== "Key benefits") return;
      s.textContent = "At a glance"; var claim = d.querySelector(".p2-claim"); if (claim) claim.remove();
      // The points are the admin's "At a glance" lines; how long a bottle lasts stays worked out from the servings.
      var ul = d.querySelector(".p2-ticks"), last = ul && ul.lastElementChild;
      if (ul && has(p, "cf_points")) ul.innerHTML = p.cf_points.split(/\n+/).map(line).filter(Boolean).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") +
        (last && /^One bottle lasts/.test(last.textContent) ? last.outerHTML : "");
    });
    // Directions: the label's food tag above its sentence, then allergens, cautions and storage as three labelled lines.
    var use = root.querySelector(".p2-use");
    if (use && line(p.directions_tag)) use.insertAdjacentHTML("beforebegin", '<p class="cf-food">' + esc(line(p.directions_tag)) + "</p>");
    var care = [["Allergens", line(p.allergens)], ["Caution", [line(p.age_guidance), line(p.warnings)].filter(Boolean).join(" ")], ["Storage", line(p.storage)]].filter(function (x) { return x[1]; });
    var old = root.querySelector(".p2-cautions"), slot = old || use;
    if (slot && care.length) {
      slot.insertAdjacentHTML("afterend", '<dl class="cf-care">' + care.map(function (x) { return "<div><dt>" + x[0] + "</dt><dd>" + esc(x[1]) + "</dd></div>"; }).join("") + "</dl>");
      if (old) old.remove();
    }
    // Supplement facts: the label's own footnotes (whose RDA it is, and what the asterisk means).
    var notes = (p.supplement_facts && p.supplement_facts.notes) || [], table = root.querySelector(".p2-pdp-accs .p2-table"), foot = table && table.nextElementSibling;
    if (notes.length && foot && foot.classList.contains("p2-small")) foot.innerHTML = notes.map(function (n) { return esc(line(n).replace(/^#(?=%)/, "# ")); }).join("<br>");
  });

  // The chrome carries the whole page, so the footer is changed in place: its line, and (16 Nov 2026, owner-approved) a
  // WhatsApp link and the opening hours after the phone number, both from the business details in web/support-content.js.
  var chrome = S.themes.e.chrome;
  if (typeof chrome === "function") {
    var withFooter = Object.assign({}, S.themes.e);
    withFooter.chrome = function () {
      var html = chrome.apply(this, arguments);
      if (!focus() || typeof html !== "string") return html;
      var B = (window.BCCSupportContent || {}).BUSINESS || {}, wa = B.channels && B.channels.whatsapp, hours = String(B.hours || "").replace(/\s*\(.*\)\s*$/, "");
      var extra = (wa && wa.live && wa.href ? '<a href="' + esc(wa.href) + '" target="_blank" rel="noopener">WhatsApp</a>' : "") + (hours ? '<span class="cf-foot-hours">' + esc(hours) + "</span>" : "");
      return html.replace("<br>One uncompromising standard.</p>", "<br>" + esc(FOOTER) + "</p>")
        .replace(/(<footer class="p2-foot">[\s\S]*?<a href="tel:[^"]*">[^<]*<\/a>)/, function (m) { return m + extra; });
    };
    S.themes.e = withFooter;
  }
  // The search box is part of the page itself, not of any one design: its example text gains a use, here only.
  function dressSearch() { var i = focus() && document.getElementById("search-input"); if (i && i.getAttribute("placeholder") === "Creatine, iron, softgels…") i.setAttribute("placeholder", "Creatine, iron, heart, softgels…"); }

  /* Bag (16 Nov 2026, owner-approved). The bag redraws its own body whenever a quantity, a code or the server's quote changes
     (web/bag.js), without going back through the page renderer, so these are put on after each redraw. Every step checks
     whether it is already there, so running it twice changes nothing. */
  var BAG = {
    empty: "Take what you need. Skip what you don’t.",
    account: ["No account needed. Prices are MRP, inclusive of all taxes.", "No account needed."],
    notes: ["Ships in 3–4 days.", "Supplements can’t be returned for a change of mind. If something arrives damaged, wrong, missing, faulty or expired, tell us within 7 days."],
    labels: "Each product has its own directions. Follow every label."
  };
  function dressBag() {
    if (!focus()) return;
    var body = document.querySelector("[data-bg] #bg-body"); if (!body) return;
    var empty = body.querySelector(".bg-empty > p");
    if (empty && empty.textContent !== BAG.empty) empty.textContent = BAG.empty;
    var sum = body.querySelector(".bg-summary"), pay = sum && sum.querySelector(".bg-checkout");
    if (sum) [].forEach.call(sum.querySelectorAll(":scope > .bg-meta"), function (p) { if (p.textContent.trim() === BAG.account[0]) p.textContent = BAG.account[1]; });
    if (pay && !sum.querySelector(".cf-bag-notes")) pay.insertAdjacentHTML("beforebegin", '<ul class="cf-bag-notes">' + BAG.notes.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("") + "</ul>");
    var lines = body.querySelectorAll(".bg-lines > .bg-line"), list = body.querySelector(".bg-lines");
    if (list && lines.length > 1 && !body.querySelector(".cf-bag-labels")) list.insertAdjacentHTML("afterend", '<p class="cf-bag-labels">' + esc(BAG.labels) + "</p>");
    var catalog = (window.BCCApp && window.BCCApp.catalog && window.BCCApp.catalog()) || [];
    [].forEach.call(lines, function (li) {
      var h = li.querySelector(".bg-line-main h3"), p = catalog.filter(function (x) { return x.id === li.getAttribute("data-bg-line"); })[0], diet = p && String(p.dietary_suitability || "");
      if (!h || !diet || h.querySelector(".cf-diet")) return;
      var veg = !/^non/i.test(diet), label = veg ? "Vegetarian" : "Non-vegetarian";
      h.insertAdjacentHTML("beforeend", ' <span class="cf-diet ' + (veg ? "is-veg" : "is-nonveg") + '" role="img" aria-label="' + label + '" title="' + label + '"><i></i></span>');
    });
  }

  /* Look up a batch (16 Nov 2026, owner-approved). No reports are published yet, so the page says how they will appear, and
     a number that isn't found is not made to look like a faulty pack. The Batch No. location is the final labels': beside
     the barcode, above the manufacturing and expiry dates. Results are drawn after a lookup (web/app.js), so their two
     wording changes are put on as they appear, like the bag's. */
  var REPORTS = {
    // "Mfg. Date", as the label prints it: the site's manufacturer-name filter drops any sentence with the full word.
    where: ["Where to find it.", "The Batch No. is printed on the label beside the barcode, above the Mfg. Date and Exp. Date. It isn’t the barcode number or your order number."],
    status: "Reports are published batch by batch, starting with our first production batch. A batch that isn’t listed yet hasn’t had its report published.",
    notFound: "Reports are published batch by batch, so a newer batch may not be listed yet.",
    pack: ["This pack", "A batch record covers the whole batch. It doesn’t verify one bottle."],
    guide: "How to read a batch record"
  };
  page("reports", function (root) {
    var where = root.querySelector(".p2p-rep-where > span:last-child");
    if (where) where.innerHTML = "<strong>" + esc(REPORTS.where[0]) + "</strong> " + esc(REPORTS.where[1]);
    var lede = root.querySelector(".p2p-rep-main .p2-lede");
    if (lede) lede.insertAdjacentHTML("afterend", '<p class="cf-rep-status">' + esc(REPORTS.status) + "</p>");
    var ask = root.querySelector(".p2p-rep-what .p2-link");
    if (ask) ask.insertAdjacentHTML("beforebegin", '<a class="p2-link cf-rep-guide" href="/learn/understanding-reports">' + esc(REPORTS.guide) + "</a>");
  });
  function dressReport() {
    if (!focus()) return;
    [].forEach.call(document.querySelectorAll("#main .rr"), function (r) {
      var lede = r.querySelector(".rr-lede");
      if (r.classList.contains("rr-not_found") && lede && !r.querySelector(".cf-rr-note")) lede.insertAdjacentHTML("afterend", '<p class="rr-lede cf-rr-note">' + esc(REPORTS.notFound) + "</p>");
      [].forEach.call(r.querySelectorAll(".rr-facts dt"), function (dt) {
        if (dt.textContent.trim() !== "Individual pack") return;
        dt.textContent = REPORTS.pack[0]; if (dt.nextElementSibling) dt.nextElementSibling.textContent = REPORTS.pack[1];
      });
    });
  }
  var app = document.getElementById("app");
  if (app && "MutationObserver" in window) new MutationObserver(function () { dressBag(); dressReport(); dressSearch(); }).observe(app, { childList: true, subtree: true });
})();
