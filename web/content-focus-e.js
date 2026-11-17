/* Body Café Co. — "Part 2 · Content Focus" (?design=e&part=5): Part 2 with the new copy from
   Body_Cafe_Co_VersionE_Copy_Transformation.xlsx (Before & After, Hero Options A, Product Pages). The numbers in the comments are its Sr. rows.
   Part 2 itself is untouched, except for what each product is for (part2(), near the end, 17 Nov 2026): every other change
   here runs only when body[data-content-focus="1"]. Pages are rewritten as they render,
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
      // Copy review 01 (17 Nov 2026, owner-approved): A8, A9, A11–A13, A15. Nothing here suggests taking more than one.
      ["Frequently bought with", "Anything else you came for?"],
      ["Nothing is ticked. Add one only if you need it.", "Add one only if you need it. Each has its own timing, so follow every label."],
      ["Free delivery on orders of ₹1,499 or more", "Delivery ₹75, free on orders of ₹1,499 or more"],
      ["Recommended for you", "Also in the range"],
      ["The rest of the seven.", "Each one, for its own reason."],
      ["Best value", "Lowest price a day"],
      ["2 bottles save 5%, 3 save 10%. The saving is applied in your bag.", "Two bottles save 5%. Three save 10%. You’ll see the saving in your bag."],
      ["Check the lot printed on your pack.", "Look up the batch in your hand."],
      ["A lot report describes the sample tested from one production lot. Records appear as reports are published.", "Type the Batch No. from your pack to see that batch’s record. Reports are published batch by batch, from our first production batch."],
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
      "support": "One capsule in the morning, on an empty stomach. Milk and chai wait two hours, before and after.",
      "ingredient": "Iron is an essential mineral. The body can’t make it, so it has to come from your diet. That’s why the amount is the first number we print.",
      "form": "Iron bound to glycine, an amino acid: ferrous bisglycinate chelate. We use Ferrochel®, a named source of this form, and print its name on the front, so you never have to guess.",
      "amount": "29 mg of elemental iron: 100% of the ICMR RDA for adult women. “Elemental” means the iron itself, not the weight of the compound around it, and that’s the number we print.",
      "decision": "Iron stands alone. Calcium in the same meal can reduce how much iron is absorbed, so the directions keep milk and chai two hours away."
    },
    "vitamin-d3-k2": {
      "headline": "Two fat-soluble vitamins. One oil. On purpose.",
      "support": "Both vitamins dissolve in fat, so they’re carried in anchovy fish oil, which adds 200 mg of omega-3. One softgel in the morning, with food.",
      "ingredient": "Vitamin D helps the body absorb calcium. Vitamin K is needed for proteins involved in bone. Both have roles in bone health, which is why they’re paired.",
      "form": "D3 as cholecalciferol, the form the body makes in sunlight. K2 as MK-7, named on the front. Both sit in oil, not in a dry tablet, because both dissolve in fat.",
      "amount": "600 IU of D3 and 55 mcg of K2, each 100% of the ICMR RDA: a daily amount at the reference level, not a megadose.",
      "decision": "One of our two deliberate pairs. D3 and K2 have related roles and the same need for fat, so one softgel carries both, taken with a meal."
    },
    "omega-3-fish-oil": {
      "headline": "Count the omega-3, not the oil.",
      "support": "Every softgel holds 1,000 mg of anchovy oil. 800 mg of it is omega-3, and that’s the number on the front.",
      "ingredient": "EPA and DHA are the omega-3 fatty acids people look for in fish oil. The body makes very little of them, so they come mainly from fish.",
      "form": "Concentrated anchovy oil, with the omega-3 kept as triglycerides, the form it takes in the fish itself.",
      "amount": "800 mg of omega-3 per softgel. A typical 1,000 mg fish oil contains about 300 mg of EPA and DHA, so the number that matters is the omega-3, and we print it.",
      "decision": "Fish oil needs no partner. It needs clear numbers: the oil, the omega-3 inside it, and EPA and DHA, each shown separately."
    },
    "l-theanine": {
      "headline": "The green-tea amino acid. 200 mg, on its own.",
      "support": "One capsule in the morning, with or without food. One active ingredient, with its amount printed.",
      "ingredient": "L-theanine is an amino acid found naturally in green tea. It’s a simple, well-characterised ingredient that makes sense on its own.",
      "form": "Free-form L-theanine, on its own rather than in a blend, so the 200 mg on the label is 200 mg of L-theanine.",
      "amount": "200 mg per capsule, an amount used in published studies. One capsule is one serving, so there’s nothing to divide.",
      "decision": "One ingredient, one number, one capsule. No blend sharing the dose."
    },
    "myo-d-chiro-inositol": {
      "headline": "The ratio is the formula. 40:1.",
      "support": "40 parts myo-inositol to 1 part D-chiro-inositol, printed on the front and checked in every batch. Three capsules in the morning, with food.",
      "ingredient": "Myo-inositol and D-chiro-inositol are two forms of inositol that the body uses side by side.",
      "form": "Both forms are included because research has looked at them together, in a set ratio, rather than either one alone.",
      "amount": "2,000 mg + 50 mg per three capsules: 40:1, a ratio used in published research. Our specification checks that each batch stays between 36:1 and 44:1.",
      "decision": "One of our two deliberate pairs. Either inositol alone would be a different product; the 40:1 balance between them is the point."
    },
    "creatine-chews": {
      "headline": "3 grams of creatine. Two chews. Your time.",
      "support": "Pick one time of day, morning, noon or night, and keep to it. Chew both tablets; don’t swallow them whole.",
      "ingredient": "Creatine is one of the most studied ingredients in sports nutrition, and it’s taken once a day, every day, not only on training days.",
      "form": "Creatine monohydrate, the most studied form. It comes as a chew because a daily habit is easier when nothing needs mixing.",
      "amount": "3,000 mg (3 g) per serving, within the 3–5 g a day commonly used in research.",
      "decision": "Creatine needs no partner, so the chew holds creatine and what makes it a chew: orange flavour and 3.6 g of sugar per serving, which we print."
    },
    "psyllium-husk": {
      "headline": "The isabgol you know, measured in capsules.",
      "support": "Five capsules at night, with food and a full glass of water. The same isabgol, with nothing to stir.",
      "ingredient": "Psyllium (isabgol) is a familiar source of soluble fibre in most Indian homes.",
      "form": "Whole psyllium husk, filled into vegetarian capsules: the same ingredient as the isabgol at home, in a measured amount.",
      "amount": "2,000 mg of husk per serving, giving 1,578 mg of fibre, 1,362 mg of it soluble. We print both, because husk weight and fibre aren’t the same number.",
      "decision": "Isabgol needs nothing added. What it does need is water, so every serving comes with a full glass."
    }
  };
  /* The defaults that copy review 01 replaced (17 Nov 2026, owner-approved). A stored admin field that still holds one of
     these exactly was saved from the old default, not written on purpose, so it gives way to the new default (stale()). */
  var PREV = {
    "iron-bisglycinate": {"cf_support":"29 mg of elemental iron per capsule, as Ferrochel® ferrous bisglycinate chelate. Taken alone, on an empty stomach, away from milk.","cf_ingredient":"Iron is an essential mineral. The ICMR daily requirement for adult women is 29 mg, the amount in one capsule.","cf_form":"Ferrous bisglycinate chelate is iron bound to glycine, an amino acid. We use Ferrochel®, a named branded source of this form, and print the brand name on the front so you know exactly which form is inside.","cf_amount":"29 mg of elemental iron: 100% of the ICMR RDA for adult women. We print the iron you actually get, not the weight of the compound it comes in."},
    "l-theanine": {"cf_headline":"One amino acid. 200 mg. Nothing else active.","cf_support":"200 mg of L-theanine, the amino acid naturally found in green tea, in one vegetarian capsule.","cf_ingredient":"L-theanine is the amino acid that tea is known for. It is a simple, well-characterised single ingredient.","cf_form":"Free-form L-theanine, on its own, so the amount you take is the amount on the label.","cf_amount":"200 mg, an amount used in published studies.","cf_decision":"One ingredient, one number, one capsule. No blend to divide the dose."},
    "vitamin-d3-k2": {"cf_support":"600 IU vitamin D3 and 55 mcg vitamin K2 as MK-7, dissolved in anchovy fish oil in one softgel.","cf_ingredient":"Vitamin D helps the body absorb calcium, and vitamin K is needed for proteins involved in bone. They are paired because both have roles in bone health.","cf_form":"D3 as cholecalciferol and K2 as MK-7, both fat-soluble, so they are carried in oil rather than pressed into a dry tablet. The oil also adds 200 mg of omega-3.","cf_decision":"A deliberate combination. Both vitamins dissolve in fat, so one softgel of oil carries both. Take it with a meal."},
    "omega-3-fish-oil": {"cf_support":"1,000 mg of anchovy fish oil concentrate per softgel, carrying 800 mg of omega-3: 400 mg EPA and 300 mg DHA.","cf_form":"Concentrated anchovy oil, with the omega-3 kept in triglyceride form, the form found in fish.","cf_decision":"One softgel, two numbers on the label: the oil and the omega-3 inside it, with EPA and DHA shown separately."},
    "myo-d-chiro-inositol": {"cf_headline":"Two inositols. One ratio. 40:1, on the front.","cf_support":"2,000 mg myo-inositol and 50 mg D-chiro-inositol per serving: a 40:1 ratio, printed on the front.","cf_form":"Both forms are included because research has looked at them together, in a defined ratio, rather than either alone.","cf_decision":"A deliberate combination where the ratio is the formula, so the ratio goes on the front."},
    "creatine-chews": {"cf_support":"3,000 mg of creatine monohydrate in two orange chewable tablets. No powder, no shaker.","cf_ingredient":"Creatine is one of the most researched sports-nutrition ingredients, and it is meant to be taken every day.","cf_amount":"3 g per serving, within the 3–5 g daily intake commonly used in research.","cf_decision":"We chose a chewable format for consistency, and we print the sugar it needs: 3.6 g per serving."},
    "psyllium-husk": {"cf_support":"2,000 mg of psyllium husk in five capsules, giving 1,578 mg of dietary fibre, 1,362 mg of it soluble.","cf_form":"Whole psyllium husk in capsules: the same ingredient, with nothing to stir.","cf_amount":"2,000 mg per serving, a measured daily top-up of fibre. We print both the husk weight and the fibre it gives, because they are different numbers.","cf_decision":"Isabgol, measured. Always with a full glass of water."}
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
  /* "At a glance" (copy review 01, 17 Nov 2026): four lines on every product, the signature number, the form, how to take it
     and the veg / non-veg mark. They used to default to Part 2's points (BCCPart2E.PDP), which Part 2 still shows. */
  var POINTS = {
    "iron-bisglycinate": ["29 mg elemental iron per capsule", "Ferrochel® bisglycinate, named on the front", "One capsule, morning, empty stomach", "Vegetarian capsule"],
    "l-theanine": ["200 mg L-Theanine per capsule", "Naturally found in green tea", "One capsule, morning, with or without food", "Vegetarian capsule"],
    "vitamin-d3-k2": ["600 IU vitamin D3 and 55 mcg K2 as MK-7", "200 mg omega-3 (100 mg EPA, 75 mg DHA)", "One softgel, morning, with food", "Non-vegetarian: fish oil and gelatin"],
    "omega-3-fish-oil": ["800 mg omega-3 per softgel", "400 mg EPA and 300 mg DHA", "Triglyceride form, from anchovy", "Non-vegetarian: fish oil and gelatin"],
    "myo-d-chiro-inositol": ["2,000 mg Myo-Inositol and 50 mg D-Chiro Inositol", "40:1 ratio, checked batch by batch", "Three capsules, morning, with food", "Vegetarian capsules"],
    "creatine-chews": ["3,000 mg creatine monohydrate per serving", "Two orange chews, at one time you choose", "Not sugar-free: 3.6 g sugar per serving", "Vegetarian"],
    "psyllium-husk": ["2,000 mg psyllium husk per serving", "1,578 mg dietary fibre, 1,362 mg soluble", "Five capsules, at night, with a full glass of water", "Vegetarian capsules"]
  };
  // The fourth question names what the Super Sevens are made of: five single ingredients and two deliberate pairs.
  var PAIRS = { "vitamin-d3-k2": 1, "myo-d-chiro-inositol": 1 };
  /* Page title and search description, Content Focus only (web/app.js asks for them). The admin's SEO title wins when it is
     filled in; its SEO description wins when it says something other than the label description it was copied from. */
  var SEO = {
    "iron-bisglycinate": ["Iron Bisglycinate · 29 mg per capsule", "29 mg elemental iron per capsule, as Ferrochel® ferrous bisglycinate chelate. One capsule each morning on an empty stomach. 60 capsules a bottle."],
    "l-theanine": ["L-Theanine · 200 mg per capsule", "200 mg L-Theanine per capsule, the amino acid naturally found in green tea. One capsule each morning, with or without food. 30 capsules a bottle."],
    "vitamin-d3-k2": ["Vitamin D3 + K2 · 600 IU + 55 mcg", "600 IU vitamin D3 and 55 mcg K2 as MK-7 in anchovy fish oil, with 200 mg omega-3. One softgel each morning with food. 60 softgels a bottle."],
    "omega-3-fish-oil": ["Omega-3 Fish Oil · 800 mg omega-3", "800 mg omega-3 per softgel as triglycerides, with 400 mg EPA and 300 mg DHA, from 1,000 mg anchovy oil. One softgel each morning with food."],
    "myo-d-chiro-inositol": ["Myo & D-Chiro Inositol · 40:1 ratio", "2,000 mg Myo-Inositol and 50 mg D-Chiro Inositol per serving: a 40:1 ratio, printed on the front. Three capsules each morning with food. 30 servings."],
    "creatine-chews": ["Creatine Chews · 3,000 mg per serving", "3,000 mg creatine monohydrate in two orange chewable tablets, with no powder and no shaker. Once a day, at one time you choose. 30 servings."],
    "psyllium-husk": ["Psyllium Husk (Isabgol) · 2,000 mg husk", "Isabgol in capsules: 2,000 mg psyllium husk with 1,578 mg dietary fibre per serving. Five capsules at night with a full glass of water. 30 servings."]
  };
  function oldPoints(id) { var pts = ((window.BCCPart2E || {}).PDP || {})[id]; return ((pts && pts.points) || []).join("\n"); }
  window.BCCContentFocusCopy = {
    defaults: function (id) {
      var c = BASE.P[id], u = BASE.U[id]; if (!c || !u) return {};
      return { cf_claim: u[2], cf_facts: u[3], cf_headline: c.headline, cf_support: c.support, cf_ingredient: c.ingredient, cf_form: c.form,
        cf_amount: c.amount, cf_decision: c.decision, cf_points: (POINTS[id] || []).join("\n") };
    },
    // True when a stored admin field is a copy of a replaced default (web/label-content.js then shows the new default).
    stale: function (id, key, value) {
      if (typeof value !== "string" || !value.trim()) return false;
      var v = value.trim();
      if (key === "cf_points") return !!POINTS[id] && v === oldPoints(id) && v !== POINTS[id].join("\n");
      return !!(PREV[id] && PREV[id][key] === v);
    },
    seo: function (p) {
      var s = p && focus() && SEO[p.id]; if (!s) return null;
      var own = String(p.seo_description || "").trim();
      return { title: String(p.seo_title || "").trim() || s[0], description: own && own !== String(p.description || "").trim() ? own : s[1] };
    }
  };
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
        q("Why this ingredient?", c.ingredient) + q("Why this form?", c.form) + q("Why this amount?", c.amount) + q(PAIRS[args[1] && args[1].id] ? "Why together?" : "Why on its own?", c.decision);
    }
    /* Product page refinements (16 Nov 2026, owner-approved). Everything below is the label's own text, from the catalogue. */
    var p = args[1] || {}, line = function (t) { return String(t || "").trim(); };
    // The amount is already in "What it's for", so the old sub-line under the name goes.
    var sub = root.querySelector(".p2-buy-sub"); if (sub) sub.remove();
    // "Key benefits" repeated the claim that now leads the page: the facts stay, as "At a glance".
    [].forEach.call(root.querySelectorAll(".p2-pdp-accs > details"), function (d) {
      var s = d.querySelector("summary span"), title = s && s.textContent.trim();
      // Copy review 01 (A1, A6): the sections say what is in them.
      if (title === "Description") s.textContent = "Why it’s made this way";
      if (title === "Directions for use") s.textContent = "How to take it";
      if (title !== "Key benefits") return;
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
  /* Part 2 shows what each product is for too (owner, 17 Nov 2026): the same lines in the same places (range, shop cards,
     product page) and nothing else from Content Focus. Part 2 keeps its own copy from the code, so it reads the default
     lines (BASE.U), never the admin's cf_claim / cf_facts. Parts 3 and 4 are untouched. */
  function part2(name, fn) {
    var base = S.themes.e[name];
    if (typeof base !== "function") return;
    var next = Object.assign({}, S.themes.e);
    next[name] = function () {
      var html = base.apply(this, arguments);
      if (focus() || document.body.dataset.variantEPart !== "2" || typeof html !== "string") return html;
      var t = document.createElement("template"); t.innerHTML = html;
      try { fn(t.content, arguments); } catch (e) { if (window.console) console.warn("Part 2 use lines skipped:", e); return html; }
      return t.innerHTML;
    };
    S.themes.e = next;
  }
  part2("home", function (root) {
    [].forEach.call(root.querySelectorAll(".p2-col h3"), function (h) {
      var u = BASE.U[idOf(h.querySelector("a"))]; if (u) h.insertAdjacentHTML("afterend", '<p class="cf-use cf-use-range">' + esc(u[1]) + "</p>");
    });
  });
  part2("shop", function (root) {
    [].forEach.call(root.querySelectorAll(".p2-tile h3"), function (h) {
      var u = BASE.U[idOf(h.querySelector("a"))]; if (u) h.insertAdjacentHTML("afterend", '<p class="cf-use cf-use-card" title="' + esc(u[1]) + '">' + esc(u[0]) + "</p>");
    });
  });
  part2("product", function (root, args) {
    var u = BASE.U[args[1] && args[1].id], h1 = root.querySelector(".p2-buy h1");
    if (!u || !h1) return;
    h1.insertAdjacentHTML("afterend", '<div class="cf-for"><p class="cf-for-k">What it’s for</p><p class="cf-for-claim">' + esc(u[2]) + '</p><p class="cf-for-how">' + esc(u[3]) + "</p></div>");
    // The amount line under the name is now in "What it's for".
    var sub = root.querySelector(".p2-buy-sub"); if (sub) sub.remove();
  });

  /* Quantity (17 Nov 2026, owner). Content Focus only.
     Product page: a − n + stepper beside Add to bag. It drives the same hidden #product-quantity select the pack cards drive
     (web/packs-e.js), so Add to bag and the phone's sticky bar add that many bottles. 1–3 select the matching pack card; above
     3 no card is selected and the price shows the 3-or-more saving (the rule the server charges). Choosing a card moves the
     stepper too. Shop cards (owner, 17 Nov 2026): the price sits beside the name, and the bottom row is a − n + selector (how
     many to add, from 1) on the left and Add on the right, which adds that many and says Added for a moment. */
  var MINUS = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10"/></svg>', PLUS = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M8 3v10"/></svg>';
  function A() { return window.BCCApp || {}; }
  function rupees(n) { return "₹" + Math.round(n).toLocaleString("en-IN"); }

  page("product", function (root) {
    var row = root.querySelector(".p2-buy-row"), add = row && row.querySelector(".p2-buy-add"), sel = root.querySelector("#product-quantity");
    if (!row || !add || !sel || add.disabled || row.querySelector(".cf-qty")) return;
    var max = sel.options.length || 1;
    add.insertAdjacentHTML("beforebegin", '<div class="cf-qty" role="group" aria-label="Quantity, in bottles" data-cf-qty data-max="' + max + '">' +
      '<button type="button" data-cf-qty-step="-1" aria-label="One bottle fewer" disabled>' + MINUS + "</button>" +
      '<output aria-live="polite">1</output>' +
      '<button type="button" data-cf-qty-step="1" aria-label="One bottle more"' + (max > 1 ? "" : " disabled") + ">" + PLUS + "</button></div>");
  });
  function showQty(box, q) {
    var max = +box.dataset.max || 1, out = box.querySelector("output");
    if (out.textContent !== String(q)) out.textContent = String(q);
    box.querySelector('[data-cf-qty-step="-1"]').disabled = q <= 1;
    box.querySelector('[data-cf-qty-step="1"]').disabled = q >= max;
  }
  function setQty(box, q) {
    var scope = box.closest("[data-pk-scope]") || document, sel = scope.querySelector("#product-quantity"), P = window.BCCPacks;
    var card = scope.querySelector('[data-pk-q="' + q + '"]');
    if (card && !card.disabled) { card.click(); return; } // packs-e.js sets the select and every price, then fires "change"
    if (!sel || !P) return;
    if (![].some.call(sel.options, function (op) { return +op.value === q; })) sel.add(new Option(String(q), String(q)));
    sel.value = String(q);
    [].forEach.call(scope.querySelectorAll("[data-pk-q]"), function (c) { c.setAttribute("aria-checked", "false"); });
    var pk = scope.querySelector("[data-pk]"), price = pk ? +pk.dataset.price || 0 : 0, save = P.saving(price, q);
    [].forEach.call(scope.querySelectorAll("[data-pk-total]"), function (n) { n.textContent = rupees(P.packPrice(price, q)); });
    [].forEach.call(scope.querySelectorAll("[data-pk-was]"), function (n) { n.textContent = save ? rupees(price * q) : ""; n.hidden = !save; });
    [].forEach.call(document.querySelectorAll("[data-pk-total-page]"), function (n) { n.textContent = rupees(P.packPrice(price, q)) + " · " + q + " bottles"; });
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  }

  page("shop", function (root) {
    [].forEach.call(root.querySelectorAll(".p2-tiles-shop .p2-tile"), function (t) {
      var h3 = t.querySelector(".p2-tile-body > h3"), foot = t.querySelector(".p2-tile-foot"), price = foot && foot.querySelector(".p2-price"), add = foot && foot.querySelector(".p2-add[data-add]");
      if (!h3 || !price || !add || t.querySelector(".cf-tile-head")) return;
      var head = document.createElement("div"); head.className = "cf-tile-head";
      h3.parentNode.insertBefore(head, h3); head.appendChild(h3); head.appendChild(price);
      if (add.disabled) return;
      var name = (add.getAttribute("aria-label") || "").replace(/^Add /, "").replace(/ to bag$/, "");
      add.insertAdjacentHTML("beforebegin", '<div class="cf-pick" role="group" aria-label="How many ' + esc(name) + ' to add" data-cf-pick>' +
        '<button type="button" data-cf-pick-step="-1" aria-label="One fewer" disabled>' + MINUS + "</button>" +
        '<output aria-live="polite">1</output>' +
        '<button type="button" data-cf-pick-step="1" aria-label="One more">' + PLUS + "</button></div>");
      add.insertAdjacentHTML("afterend", '<span class="sr-only" role="status" data-cf-pick-status></span>');
    });
  });
  var PICK_MAX = 10; // the bag's limit per product (web/app.js); stock is checked again when adding
  function pickShow(box, q) {
    box.querySelector("output").textContent = String(q);
    box.querySelector('[data-cf-pick-step="-1"]').disabled = q <= 1;
    box.querySelector('[data-cf-pick-step="1"]').disabled = q >= PICK_MAX;
  }
  // Capture phase, so a card's Add is handled here and not also by the shared add in web/app.js.
  document.addEventListener("click", function (e) {
    if (!focus() || !e.target.closest) return;
    var ps = e.target.closest("[data-cf-pick] [data-cf-pick-step]");
    if (ps) {
      var pick = ps.closest("[data-cf-pick]"), cur = +pick.querySelector("output").textContent || 1;
      pickShow(pick, Math.min(PICK_MAX, Math.max(1, cur + +ps.dataset.cfPickStep)));
      return;
    }
    var add = e.target.closest("#main .p2-tiles-shop .p2-add[data-add]");
    if (add && !add.disabled) {
      e.preventDefault(); e.stopPropagation();
      var foot = add.parentNode, box = foot.querySelector("[data-cf-pick]"), q = box ? +box.querySelector("output").textContent || 1 : 1;
      var r = A().addToBag ? A().addToBag(add.dataset.add, q) : { ok: false, message: "Your bag couldn’t be updated." };
      if (!r.ok) { if (A().toast) A().toast(r.message); return; }
      var status = foot.querySelector("[data-cf-pick-status]"); if (status) status.textContent = r.message;
      if (box) pickShow(box, 1);
      clearTimeout(add._cfAdded); add.classList.add("is-added"); add.textContent = "Added";
      add._cfAdded = setTimeout(function () { add.classList.remove("is-added"); add.textContent = "Add"; if (status) status.textContent = ""; }, 1600);
      return;
    }
    var qb = e.target.closest("[data-cf-qty] [data-cf-qty-step]");
    if (qb) {
      var qbox = qb.closest("[data-cf-qty]"), qcur = +qbox.querySelector("output").textContent || 1;
      setQty(qbox, Math.min(+qbox.dataset.max || 1, Math.max(1, qcur + +qb.dataset.cfQtyStep)));
    }
  }, true);
  // A pack card (or the stepper itself) changed the quantity: the stepper shows it.
  document.addEventListener("change", function (e) {
    if (!focus() || !e.target || e.target.id !== "product-quantity") return;
    var box = document.querySelector("[data-cf-qty]"); if (box) showQty(box, +e.target.value || 1);
  });

  /* Write a review (17 Nov 2026, owner). Content Focus only. The product page's review section gains "Write a review": it asks
     the API who may review (/api/reviews/eligibility: a signed-in customer with a delivered order for this product, once) and
     shows the form or the reason. Submitted reviews wait for approval in the admin portal (Reviews). Published customer reviews
     (/api/reviews) are listed above the samples. Both servers apply the same rules (app/server.py, core.js). */
  var RV = {
    write: "Write a review",
    sign_in: ["Sign in to write a review. Reviews come from customers whose order has been delivered.", "Sign in"],
    no_purchase: "Reviews come from customers who bought this product. Once your order is delivered, you can review it here.",
    not_delivered: "Your order is on its way. You can review this product once it’s delivered.",
    pending_moderation: "Thank you. We have your review and check it before it appears here.",
    published: "You’ve reviewed this product. Thank you.",
    rejected: ["Your review of this product couldn’t be published. If you have a question about it,", "contact us"],
    operations: "Reviews are written from a customer account.",
    failed: "We couldn’t check that just now. Please try again.",
    rule: "Every review is checked before it appears. Low ratings are published too.",
    textHint: "How you take it and how it fits your day. Please leave out personal health details.",
    nameHint: "Left blank, it shows as Verified customer.",
    verified: "Verified purchase", reply: "Reply from Body Café Co."
  };
  page("product", function (root, args) {
    var p = args[1] || {}, head = root.querySelector("#p2-reviews .p2-sec-head");
    if (!p.id || !head || root.querySelector("[data-cf-rv]")) return;
    head.insertAdjacentHTML("afterend", '<div class="cf-rv" data-cf-rv="' + esc(p.id) + '" style="--cap:' + esc(p.color || "") + '">' +
      '<button type="button" class="p2-btn cf-rv-write" data-cf-rv-write aria-expanded="false" aria-controls="cf-rv-panel">' + RV.write + "</button>" +
      '<div class="cf-rv-panel" id="cf-rv-panel" data-cf-rv-panel role="region" aria-label="' + RV.write + '" hidden></div>' +
      '<ul class="p2-reviews-list cf-rv-list" data-cf-rv-list hidden></ul></div>');
  });
  function day(t) { try { return new Date(t * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); } catch (e) { return ""; } }
  function starsOf(n) { var S2 = window.BCCPart2E || {}; return S2.stars ? S2.stars(n) : n + " out of 5"; }
  function realCard(r) {
    return '<li class="p2-review cf-rv-real"><div class="p2-review-top">' + starsOf(r.rating) + '<span class="cf-rv-verified">' + RV.verified + "</span></div>" +
      (r.title ? '<p class="p2-review-title">' + esc(r.title) + "</p>" : "") + "<blockquote><p>" + esc(r.text) + "</p></blockquote>" +
      (r.incentive && r.incentive !== "none" ? '<p class="cf-rv-note">' + (r.incentive === "free_product" ? "Received this product free." : "Received an incentive for this review.") + "</p>" : "") +
      (r.reply && r.reply.text ? '<div class="cf-rv-reply"><b>' + RV.reply + "</b><p>" + esc(r.reply.text) + "</p></div>" : "") +
      '<p class="p2-review-who"><b>' + esc(r.display_name || "Verified customer") + "</b>" + (r.published || r.created ? " · " + day(r.published || r.created) : "") + "</p></li>";
  }
  // Published customer reviews, once per product page.
  function mountReviews() {
    if (!focus() || !A().api) return;
    [].forEach.call(document.querySelectorAll("#main [data-cf-rv]:not([data-cf-rv-ready])"), function (box) {
      box.setAttribute("data-cf-rv-ready", "");
      A().api("/reviews?product=" + encodeURIComponent(box.dataset.cfRv) + "&sort=newest&size=6").then(function (r) {
        var list = box.querySelector("[data-cf-rv-list]"), items = (r && r.reviews) || [];
        if (!list || !items.length) return;
        list.innerHTML = items.map(realCard).join(""); list.hidden = false;
        var h2 = box.closest("#p2-reviews").querySelector(".p2-sec-head h2"); if (h2 && /^Reviews open/.test(h2.textContent)) h2.textContent = "What people say.";
      }).catch(function () {});
    });
  }
  function rvMessage(panel, text, link) {
    panel.innerHTML = '<p class="cf-rv-msg" role="status">' + esc(text) + (link ? ' <a class="p2-link" href="' + esc(link[1]) + '">' + esc(link[0]) + "</a>" + (link[2] || "") : "") + "</p>";
  }
  function rvForm(panel, id, order) {
    var stars = [5, 4, 3, 2, 1].map(function (n) { return '<input type="radio" id="cf-rv-s' + n + '" name="rating" value="' + n + '" required><label for="cf-rv-s' + n + '" title="' + n + " star" + (n > 1 ? "s" : "") + '"><span class="sr-only">' + n + " star" + (n > 1 ? "s" : "") + "</span></label>"; }).join("");
    panel.innerHTML = '<form class="cf-rv-form" data-cf-rv-form novalidate><input type="hidden" name="product" value="' + esc(id) + '"><input type="hidden" name="order_id" value="' + esc(order || "") + '">' +
      '<fieldset class="cf-rv-field"><legend>Your rating</legend><div class="cf-rv-stars">' + stars + "</div></fieldset>" +
      '<label class="cf-rv-field"><span>Title <small>(optional)</small></span><input name="title" maxlength="120" autocomplete="off"></label>' +
      '<label class="cf-rv-field"><span>Your review</span><textarea name="text" rows="5" minlength="10" maxlength="2000" required aria-describedby="cf-rv-text-hint"></textarea><small id="cf-rv-text-hint">' + RV.textHint + "</small></label>" +
      '<label class="cf-rv-field"><span>Name shown <small>(optional)</small></span><input name="display_name" maxlength="40" autocomplete="nickname" aria-describedby="cf-rv-name-hint"><small id="cf-rv-name-hint">' + RV.nameHint + "</small></label>" +
      '<label class="cf-rv-field"><span>Did you get this product free or for a reward?</span><select name="incentive"><option value="none">No</option><option value="free_product">Yes, it was free</option><option value="other">Yes, another reward</option></select></label>' +
      '<p class="cf-rv-err" data-cf-rv-err role="alert" hidden></p>' +
      '<div class="cf-rv-actions"><button type="submit" class="p2-btn">Submit review</button><p>' + RV.rule + "</p></div></form>";
  }
  function openReview(btn) {
    var box = btn.closest("[data-cf-rv]"), panel = box.querySelector("[data-cf-rv-panel]"), id = box.dataset.cfRv;
    var open = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(open)); panel.hidden = !open;
    if (!open) return;
    panel.innerHTML = '<p class="cf-rv-msg" role="status">Checking…</p>';
    A().api("/reviews/eligibility?product=" + encodeURIComponent(id)).then(function (r) {
      var st = r && r.state;
      if (st === "eligible") { rvForm(panel, id, r.order_id); var first = panel.querySelector("input[name=rating]"); if (first) first.focus(); }
      else if (st === "sign_in") rvMessage(panel, RV.sign_in[0], [RV.sign_in[1], "/account?next=" + encodeURIComponent(location.pathname + location.search)]);
      else if (st === "already_reviewed") { if (r.review_state === "rejected") rvMessage(panel, RV.rejected[0], [RV.rejected[1], "/contact", "."]); else rvMessage(panel, r.review_state === "published" ? RV.published : RV.pending_moderation); }
      else rvMessage(panel, RV[st] || RV.no_purchase);
    }).catch(function () { rvMessage(panel, RV.failed); });
  }
  document.addEventListener("click", function (e) {
    var b = focus() && e.target.closest && e.target.closest("[data-cf-rv-write]"); if (b) openReview(b);
  });
  document.addEventListener("submit", function (e) {
    var f = focus() && e.target.closest && e.target.closest("[data-cf-rv-form]"); if (!f) return;
    e.preventDefault();
    var err = f.querySelector("[data-cf-rv-err]"), btn = f.querySelector("[type=submit]"), el = f.elements, rating = f.querySelector("input[name=rating]:checked");
    var text = el.text.value.trim(), say = function (m, focusEl) { err.textContent = m; err.hidden = false; if (focusEl) focusEl.focus(); };
    if (!rating) return say("Choose a rating from 1 to 5 stars.", f.querySelector("input[name=rating]"));
    if (text.length < 10) return say("Write your review in at least 10 characters.", el.text);
    var title = el.title.value.trim(), name = el.display_name.value.trim();
    if (title && title.length < 3) return say("Give your review a title of at least 3 characters, or leave it blank.", el.title);
    if (name && name.length < 2) return say("Use a name of at least 2 characters, or leave it blank.", el.display_name);
    err.hidden = true; btn.disabled = true; btn.textContent = "Sending…";
    f._rid = f._rid || ("rv-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
    A().api("/reviews", { product: el.product.value, order_id: el.order_id.value || undefined, rating: +rating.value, title: title, text: text, display_name: name, incentive: el.incentive.value, request_id: f._rid })
      .then(function () { var panel = f.closest("[data-cf-rv-panel]"); rvMessage(panel, RV.pending_moderation); var m = panel.querySelector(".cf-rv-msg"); if (m) { m.tabIndex = -1; m.focus(); } })
      .catch(function (x) { btn.disabled = false; btn.textContent = "Submit review"; say((x && x.message) || RV.failed); });
  });

  var app = document.getElementById("app");
  if (app && "MutationObserver" in window) new MutationObserver(function () { dressBag(); dressReport(); dressSearch(); mountReviews(); }).observe(app, { childList: true, subtree: true });
})();
