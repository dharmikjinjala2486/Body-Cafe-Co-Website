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
      ["The softgel contains fish oil and gelatin, and the pack says so clearly. Other brands hid that in small print.", "The softgel contains fish oil and gelatin, and the pack says so clearly, right on the front."]
    ],
    shop: [ // 28
      ["Seven supplements, each made to one uncompromising standard.", "Five single-ingredient formulas. Two deliberate combinations. Every amount printed."]
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
      ["A good café shows you the menu. So do we.", "Meet Dr. Nayan Solanki, our Scientific Founder & Formulation Lead, and the decisions behind our seven."],
      ["The front of the label shouts. The back whispers.", "A longer list isn’t a better formula."],
      ["Most supplement labels lead with promises and leave the facts in small print: which form the ingredient is in, how much you actually get, and when to take it. We turned that around.", "Supplements are often judged by how many ingredients they contain. But a list can’t tell you why each ingredient was chosen, whether the amount means anything, or whether the ingredients work well together. Sometimes one ingredient is right. Sometimes a combination is justified. The reason is what matters."],
      ["Seven, and only seven.", "Trained where every milligram must be justified."],
      ["We make seven supplements. Each one is an everyday essential, and each one is made the same way. A small range lets us hold every product to the same standard, and say exactly what is in it.", "Dr. Nayan Solanki holds a PhD in Industrial Pharmacy. His career has been in pharmaceutical development: formulating medicines, preparing the chemistry, manufacturing and controls (CMC) work that regulators review, validating processes and scaling products up for manufacture. In that work, every ingredient, dose and form is a decision you must be able to explain. He brought the same discipline to Body Café Co., personally selecting the ingredient, form, dose and combination in each of our seven products."],
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
      ["Nothing is ticked. Add one only if you need it.", "Each one has its own timing. Follow every label."],
      ["Recommended for you", "Also in the range"],
      ["The softgel contains fish oil and gelatin, and the pack says so clearly. Other brands hid that in small print.", "The softgel contains fish oil and gelatin, and the pack says so clearly, right on the front."]
    ]
  };
  var RULES = [["Is this the right ingredient?", "Chosen for the purpose, never to lengthen a label."], ["Is this the right form?", "The form decides what you actually take."], ["Is this the right amount?", "Set against a reference, printed per serving."], ["Does it belong with anything else?", "Combined only when there’s a reason."]]; // 52–55
  var STORY_LINK = "See the reasoning"; // 57
  var TESTING = ["FROM BATCH ONE", "Independent testing by Choksi Laboratories and Eurofins"]; // 39
  var FOOTER = "No ingredient without a reason."; // 72
  // Product Pages sheet, the seven launched products. Magnesium Glycinate and Beetroot are not launched and stay out.
  var PRODUCTS = {
    "iron-bisglycinate": {
      "headline": "Iron first. Chai later.",
      "support": "29 mg of elemental iron per capsule, as Ferrochel® ferrous bisglycinate chelate. Taken alone, on an empty stomach, away from milk.",
      "ingredient": "Iron is a nutrient many Indian women fall short of, and its ICMR daily requirement for adult women is 29 mg.",
      "form": "Ferrous bisglycinate chelate is iron bound to glycine, an amino acid. We use Ferrochel®, a named branded source of this form, and print the brand name on the front so you know exactly which form is inside.",
      "amount": "29 mg of elemental iron: 100% of the ICMR RDA. We print the iron you actually get, not the weight of the compound it comes in.",
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
      "ingredient": "Creatine is one of the most researched sports-nutrition ingredients, and it only helps if you take it every day.",
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
      headlines();
      var html = base.apply(this, arguments);
      if (typeof html !== "string") return html;
      var t = document.createElement("template"); t.innerHTML = html;
      try { fn(t.content, arguments); } catch (e) { if (window.console) console.warn("Content Focus copy skipped:", e); return html; }
      return t.innerHTML;
    };
    S.themes.e = next;
  }

  page("home", function (root) {
    var h1 = root.querySelector("#p2-hero-t");
    if (h1) {
      h1.innerHTML = "<b>" + esc(HERO.lines[0]) + "</b> <span><b>" + esc(HERO.lines[1]) + "</b></span>";
      h1.insertAdjacentHTML("afterend", '<p class="p2-lede cf-hero-lede">' + esc(HERO.lede) + "</p>");
    }
    var link = root.querySelector(".p2-hc-copy .p2-link"); if (link) link.textContent = HERO.link;
    swap(root, TEXT.home);
  });
  page("shop", function (root) { swap(root, TEXT.shop); });
  page("standards", function (root) {
    swap(root, TEXT.standards);
    [].forEach.call(root.querySelectorAll(".p2-std-status li"), function (li) {
      if (/Third-party testing/.test(li.textContent)) li.innerHTML = '<span class="is-soon">' + esc(TESTING[0].charAt(0) + TESTING[0].slice(1).toLowerCase()) + "</span>" + esc(TESTING[1]);
    });
  });
  function story(root) {
    swap(root, TEXT.story);
    var rules = root.querySelector(".p2-rules");
    if (rules) rules.innerHTML = RULES.map(function (r) { return "<li><strong>" + esc(r[0]) + "</strong> " + esc(r[1]) + "</li>"; }).join("");
    var link = root.querySelector(".p2-actions-left .p2-link"); if (link) link.textContent = STORY_LINK;
  }
  page("story", story);
  page("about", story);
  page("learn", function (root) { swap(root, TEXT.learn); });
  page("product", function (root, args) {
    swap(root, TEXT.product);
    var c = PRODUCTS[args[1] && args[1].id], h = root.querySelector(".p2-acc-h");
    if (c && h) {
      var q = function (t, x) { return '<h4 class="cf-q">' + t + "</h4><p>" + esc(x) + "</p>"; };
      h.parentNode.innerHTML = '<h3 class="p2-acc-h">' + esc(c.headline) + '</h3><p class="cf-support">' + esc(c.support) + "</p>" +
        q("Why this ingredient?", c.ingredient) + q("Why this form?", c.form) + q("Why this amount?", c.amount) + q("The decision", c.decision);
    }
  });

  // The chrome carries the whole page, so only the footer line is swapped, in place.
  var chrome = S.themes.e.chrome;
  if (typeof chrome === "function") {
    var withFooter = Object.assign({}, S.themes.e);
    withFooter.chrome = function () {
      var html = chrome.apply(this, arguments);
      return focus() && typeof html === "string" ? html.replace("<br>One uncompromising standard.</p>", "<br>" + esc(FOOTER) + "</p>") : html;
    };
    S.themes.e = withFooter;
  }
})();
