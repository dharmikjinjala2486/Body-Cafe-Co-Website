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
  // The review note under the home and product page reviews (fewer words, owner, 19 Nov 2026).
  var REVIEW_NOTE = ["Only customers whose order was delivered can review. Every rating is published, low ones too. Sample reviews fill this preview until real reviews arrive.", "Only delivered orders can review. Low ratings are published too."];
  var TEXT = {
    home: [ // 6, 9, 20, 21, 24
      REVIEW_NOTE,
      ["Third-party tested", "Independent testing from batch one"],
      ["Seven. Each in its own colour.", "Seven formulas. Nothing along for the ride."],
      ["Four rules we never bend.", "Every formula is four decisions."], ["Right form", "Form first"], ["Exact dose, stated", "Amounts that mean something"], ["Every lot tested", "Checked, not assumed"],
      ["Every bottle carries a lot number.", "Your bottle has a paper trail."],
      ["Choose your product by its cap, type the number from the pack, and see the record for that batch.", "Every pack has a Batch No. Pick your product, type the number and see its record."],
      ["The softgel contains fish oil and gelatin, and the pack says so clearly. Other brands hid that in small print.", "The softgel contains fish oil and gelatin, and the pack says so clearly, right on the front."],
      // Fewer words (owner, 19 Nov 2026): no paragraph past three lines on a phone. These are the home FAQ answers.
      ["Follow the directions on your pack. Each product page shows the timing, serving size and whether to take it with food.", "Follow your pack. Each product page shows when, how many, and whether with food."],
      ["It is printed on the pack, separate from the barcode. Choose your product, enter the lot number, and see the record for that batch.", "It’s on the label, beside the barcode. Enter it on the batch page to see that batch’s record."]
      // The returns answer is the Help library's own, shortened in SHORT_DATA below.
    ],
    shop: [ // 28 (owner, 17 Nov 2026: every row as the workbook has it); the two Barista prompts are the shop refinements (16 Nov)
      ["Seven supplements, each made to one uncompromising standard.", "Five single-ingredient formulas. Two deliberate combinations. Every amount printed."],
      ["Ask about any of the seven.", "Not sure which one fits? Ask about any of the seven."],
      ["Not sure where to start?", "Ask Barista"],
      ["Barista answers from our labels and help pages. For your own health, ask your doctor.", "Answers from our labels. Not medical advice."]
    ],
    standards: [ // 31–38; fewer words (owner, 19 Nov 2026): each paragraph cut to three lines on a phone
      ["One uncompromising standard.", "Every formula is four decisions."],
      ["Seven supplements. Four rules we never bend. This is what they look like on every bottle.", "Which ingredient. Which form. How much. What it belongs with. Our answers, bottle by bottle."],
      ["Right form", "Form first"],
      ["We choose the form of each ingredient first, then name it on the label. Form decides what you are actually taking, so you should never have to guess it.", "The form decides what you actually take. So we choose it first, and name it on the label."],
      ["Exact dose, stated", "Amounts that mean something"],
      ["The amount in every serving is printed on the label and on this site. Where two ingredients work together, you see both numbers.", "We print what you actually get: the iron, not the compound; the omega-3, not just the oil."],
      ["Every lot tested", "Checked, not assumed"],
      ["Every product is made in GMP-certified facilities and third-party tested. Every lot carries its own number, so a record can be traced to the batch in your hand.", "GMP-certified facilities. From our first production batch, independent laboratories test each batch."],
      ["Full ingredients, nutrition information, directions, storage and cautions for every product, on the pack and on its page here. No proprietary blends.", "Every ingredient, direction and caution, on the pack and on this site. No proprietary blends."]
    ],
    story: [ // 44–49, 51
      ["You should always know what you’re being served.", "The questions come before the capsule."],
      ["A good café shows you the menu. So do we.", "Meet Dr. Nayan Solanki, our Scientific Founder & Formulation Lead, and the decisions behind our seven."],
      ["The front of the label shouts. The back whispers.", "A longer list isn’t a better formula."],
      ["Most supplement labels lead with promises and leave the facts in small print: which form the ingredient is in, how much you actually get, and when to take it. We turned that around.", "A list can’t say why each ingredient is there. Sometimes one is right, sometimes two. The reason is what matters."],
      ["Seven, and only seven.", "Trained where every milligram must be justified."],
      // Rows 47 and 49 cut to three lines on a phone (fewer words, owner, 19 Nov 2026).
      ["We make seven supplements. Each one is an everyday essential, and each one is made the same way. A small range lets us hold every product to the same standard, and say exactly what is in it.", "A PhD in Industrial Pharmacy, and a career developing medicines. Dr. Solanki chose our seven the same way."],
      ["How we work.", "Four questions, asked of every formula."],
      ["Every product has its own cap colour, so you can tell them apart at a glance on a shelf, in a bag, or half-awake in the morning.", "Each has its own cap colour, so you can tell them apart at a glance, even half-awake."]
    ],
    learn: [ // 59, 60, 62, 64
      ["Read the label. Know the form.", "Ask what’s in it. Then ask why."],
      ["Short, plain guides to the seven and to reading any supplement label.", "Plain-English guides to each of the seven, and to the questions worth asking of any supplement label."],
      ["Reading any label.", "The label, decoded."],
      ["Why the full ingredient name matters when you compare products.", "Same nutrient, different form: why the full name matters."]
    ],
    product: [ // 68, 69, 70, 24
      // The workbook, rows 68–70. Row 67 keeps the buy box and the batch report as they are. Nothing suggests taking more than one.
      ["Frequently bought with", "Build your routine"],
      // Copy review 02 (20 Nov 2026): the same rule, softer ("Follow every label" read as a warning).
      ["Nothing is ticked. Add one only if you need it.", "Each has its own time of day. Follow each label."],
      ["Recommended for you", "Also in the range"],
      ["The rest of the seven.", "Each one, for its own reason."],
      ["The softgel contains fish oil and gelatin, and the pack says so clearly. Other brands hid that in small print.", "The softgel contains fish oil and gelatin, and the pack says so clearly, right on the front."]
    ]
  };
  var RULES = [["Is this the right ingredient?", "Chosen for the purpose, never to lengthen a label."], ["Is this the right form?", "The form decides what you actually take."], ["Is this the right amount?", "Set against a reference, printed per serving."], ["Does it belong with anything else?", "Combined only when there’s a reason."]]; // 52–55
  var STORY_LINK = "See the reasoning"; // 57
  // 39. The laboratories are named as the workbook has them (owner, 17 Nov 2026; Approval Register A6 lists signed agreements and their consent).
  var TESTING = ["FROM BATCH ONE", "Independent testing by Choksi Laboratories and Eurofins"];
  var FOOTER = "No ingredient without a reason."; // 72
  /* Product Pages sheet, the seven launched products, every line in the workbook's words (owner, 17 Nov 2026: "Workbook wins"
     over copy review 01, then the three 16 Nov holdbacks dropped too). Magnesium Glycinate and Beetroot are not launched and stay out. */
  var PRODUCTS = {
    "iron-bisglycinate": {
      "headline": "Iron first. Chai later.",
      "support": "29 mg iron as Ferrochel®. Empty stomach, away from milk.",
      "ingredient": "Many Indian women don’t get enough iron from food. ICMR sets 29 mg a day for women.",
      "form": "Ferrochel®: iron bound to glycine, an amino acid. A named form, so you know exactly what’s inside.",
      "amount": "29 mg of the iron itself, not the compound’s weight. A full day’s ICMR amount.",
      "decision": "Iron comes alone because calcium can lower how much you absorb. So no milk or chai for 2 hours."
    },
    "vitamin-d3-k2": {
      "headline": "D3 and K2, in the oil they need.",
      "support": "600 IU D3 and 55 mcg K2 (MK-7), in anchovy fish oil.",
      "ingredient": "Vitamin D helps your body absorb calcium. Vitamin K2 is needed for proteins in bone.",
      "form": "Both dissolve in fat, so they come in fish oil, not a dry tablet. K2 is MK-7, named on the front.",
      "amount": "A full day’s ICMR amount of each. Enough, not a megadose.",
      "decision": "Same need for fat, so one softgel carries both, plus 200 mg omega-3 from the oil. Take it with a meal."
    },
    "omega-3-fish-oil": {
      "headline": "One softgel. The omega-3 of three regular ones.",
      "support": "800 mg omega-3 in every 1,000 mg softgel: 400 mg EPA, 300 mg DHA.",
      "ingredient": "EPA and DHA: omega-3s your body makes very little of, so they have to come from food, mostly fish.",
      "form": "Concentrated anchovy oil, kept as triglycerides: the same form as in the fish.",
      "amount": "800 mg omega-3 in one softgel, so you swallow one, not three.",
      "decision": "We concentrated the oil so one softgel is enough, and print the omega-3 so you can check."
    },
    "l-theanine": {
      "headline": "Green tea’s amino acid. 200 mg. No blend.",
      "support": "200 mg L-theanine in one capsule, morning, with or without food.",
      "ingredient": "The amino acid tea is known for. One simple ingredient.",
      "form": "Free-form L-theanine, not mixed into a blend, so all 200 mg is L-theanine.",
      "amount": "200 mg in one capsule, an amount used in published studies. Nothing to split.",
      "decision": "We left out blends and add-ons, so you know exactly what you’re taking."
    },
    "myo-d-chiro-inositol": {
      "headline": "40 parts myo to 1 part D-chiro. In every batch.",
      "support": "2,000 mg myo and 50 mg D-chiro per serving: 40:1.",
      "ingredient": "Myo- and D-chiro-inositol: two forms of inositol your body uses side by side.",
      "form": "Research looks at the two together at 40:1, so that is how we make it.",
      "amount": "2,000 mg + 50 mg in three capsules. We check every batch stays between 36:1 and 44:1.",
      "decision": "The ratio is the product, so we test it in every batch and print it on the front."
    },
    "creatine-chews": {
      "headline": "3 g creatine. Two chews. No shaker.",
      "support": "3,000 mg creatine monohydrate in two orange chews, once a day.",
      "ingredient": "One of the most researched sports ingredients. It’s taken every day, training day or not.",
      "form": "Monohydrate, the most studied form, as a chew: nothing to mix, easy to carry.",
      "amount": "3 g a day, within the 3–5 g used in research.",
      "decision": "A chew is easy to keep up daily. It needs 3.6 g sugar per serving, and we print it."
    },
    "psyllium-husk": {
      "headline": "The isabgol you know, measured in capsules.",
      "support": "2,000 mg husk in five capsules: 1,578 mg fibre, 1,362 mg soluble.",
      "ingredient": "Isabgol: the soluble fibre most Indian homes know.",
      "form": "Whole husk in capsules. Nothing to stir.",
      "amount": "2,000 mg husk gives 1,578 mg fibre. We print both, so you know the fibre you get.",
      "decision": "Capsules give the same measured amount every night. Take them with a full glass of water."
    }
  };
  /* Copy review 01's lines (17 Nov 2026), replaced the same day by the Version E workbook's own text (owner: "Workbook wins").
     A stored admin field that still holds one of these exactly was saved from that default, not written on purpose, so it
     gives way to the workbook text above (stale()). A key may list several, the 16 Nov holdbacks with copy review 01's line. */
  var PREV = {
    "iron-bisglycinate": {"cf_support":["One capsule in the morning, on an empty stomach. Milk and chai wait two hours, before and after.","29 mg of elemental iron per capsule, as Ferrochel® ferrous bisglycinate chelate. Taken alone, on an empty stomach, away from milk.","29 mg of elemental iron per capsule, as Ferrochel® bisglycinate. Taken alone, on an empty stomach, away from milk."],"cf_ingredient":["Iron is an essential mineral. The body can’t make it, so it has to come from your diet. That’s why the amount is the first number we print.","Iron is an essential mineral. The ICMR daily requirement for adult women is 29 mg, the amount in one capsule.","Iron is a nutrient many Indian women fall short of, and its ICMR daily requirement for adult women is 29 mg.","Many Indian women fall short of iron. The ICMR daily requirement for adult women is 29 mg.","Many Indian women fall short. ICMR sets 29 mg a day for women."],"cf_form":["Iron bound to glycine, an amino acid: ferrous bisglycinate chelate. We use Ferrochel®, a named source of this form, and print its name on the front, so you never have to guess.","Ferrous bisglycinate chelate is iron bound to glycine, an amino acid. We use Ferrochel®, a named branded source of this form, and print the brand name on the front so you know exactly which form is inside.","Iron bound to glycine, an amino acid. We use Ferrochel® and name it on the front.","Iron bound to glycine. Ferrochel®, named on the front."],"cf_amount":["29 mg of elemental iron: 100% of the ICMR RDA for adult women. “Elemental” means the iron itself, not the weight of the compound around it, and that’s the number we print.","29 mg of elemental iron: 100% of the ICMR RDA for adult women. We print the iron you actually get, not the weight of the compound it comes in.","29 mg of elemental iron: 100% of the ICMR RDA. We print the iron you actually get, not the weight of the compound it comes in.","29 mg of elemental iron: 100% of the ICMR RDA. The iron you get, not the compound’s weight.","29 mg elemental iron: 100% of the ICMR RDA."],"cf_decision":["Iron stands alone. Calcium in the same meal can reduce how much iron is absorbed, so the directions keep milk and chai two hours away.","Iron stands alone. Calcium can reduce how much iron is absorbed, so milk and chai wait two hours.","Calcium can cut iron absorption. Milk and chai wait 2 hours.","Iron goes alone. Calcium can lower iron uptake, so no milk or chai for 2 hours."]},
    "vitamin-d3-k2": {"cf_support":["Both vitamins dissolve in fat, so they’re carried in anchovy fish oil, which adds 200 mg of omega-3. One softgel in the morning, with food.","600 IU vitamin D3 and 55 mcg vitamin K2 as MK-7, dissolved in anchovy fish oil in one softgel."],"cf_ingredient":["Vitamin D helps the body absorb calcium. Vitamin K is needed for proteins involved in bone. Both have roles in bone health, which is why they’re paired.","Vitamin D helps the body absorb calcium, and vitamin K is needed for proteins involved in bone. They are paired because both have roles in bone health.","Vitamin D helps the body absorb calcium. Vitamin K is needed for proteins in bone.","D helps the body absorb calcium. K is needed for proteins in bone."],"cf_form":["D3 as cholecalciferol, the form the body makes in sunlight. K2 as MK-7, named on the front. Both sit in oil, not in a dry tablet, because both dissolve in fat.","D3 as cholecalciferol and K2 as MK-7, both fat-soluble, so they are carried in oil rather than pressed into a dry tablet. The oil also adds 200 mg of omega-3.","D3 as cholecalciferol, K2 as MK-7. Both dissolve in fat, so they sit in oil, not a dry tablet.","D3 as cholecalciferol, K2 as MK-7. Both dissolve in fat, so: oil."],"cf_decision":["One of our two deliberate pairs. D3 and K2 have related roles and the same need for fat, so one softgel carries both, taken with a meal.","A deliberate combination. Both vitamins dissolve in fat, so one softgel of oil carries both. Take it with a meal.","A deliberate pair. Both dissolve in fat, so one softgel of oil carries both. Take it with a meal.","One softgel carries both. Take it with a meal.","D3 and K2 both need fat, so one softgel of oil carries both. Take it with a meal."],"cf_amount":["600 IU of D3 and 55 mcg of K2, each 100% of the ICMR RDA: a daily amount at the reference level, not a megadose.","600 IU of D3 and 55 mcg of K2, each 100% of the ICMR RDA. The reference level, not a megadose.","Each 100% of the ICMR RDA. Not a megadose."],"cf_headline":["Two fat-soluble vitamins. One oil. On purpose."]},
    "omega-3-fish-oil": {"cf_support":["Every softgel holds 1,000 mg of anchovy oil. 800 mg of it is omega-3, and that’s the number on the front.","1,000 mg of anchovy fish oil concentrate per softgel, carrying 800 mg of omega-3: 400 mg EPA and 300 mg DHA.","1,000 mg of anchovy fish oil concentrate per softgel. 800 mg of it is omega-3: 400 mg EPA and 300 mg DHA."],"cf_ingredient":["EPA and DHA are the omega-3 fatty acids people look for in fish oil. The body makes very little of them, so they come mainly from fish.","EPA and DHA are the omega-3s people look for in fish oil. The body makes very little, so they come mainly from fish.","EPA and DHA: the omega-3s your body barely makes. They come mainly from fish.","EPA and DHA: the omega-3s people look for in fish oil. Your body barely makes them, so they come mainly from fish.","EPA and DHA. Your body makes little, so they come from fish."],"cf_form":["Concentrated anchovy oil, with the omega-3 kept as triglycerides, the form it takes in the fish itself.","Concentrated anchovy oil, with the omega-3 kept in triglyceride form, the form found in fish.","Concentrated anchovy oil. The omega-3 stays as triglycerides, the form found in fish.","Triglycerides, the form found in fish. From concentrated anchovy oil.","Triglycerides, as found in fish. From anchovy oil."],"cf_amount":["800 mg of omega-3 per softgel. A typical 1,000 mg fish oil contains about 300 mg of EPA and DHA, so the number that matters is the omega-3, and we print it.","800 mg of omega-3 per softgel. A typical 1,000 mg fish oil has about 300 mg of EPA and DHA. The omega-3 is the number that matters, so we print it.","800 mg of omega-3 per softgel. A typical 1,000 mg fish oil has about 300 mg of EPA and DHA.","800 mg of omega-3 per softgel. The omega-3 is the number that matters, so we print it.","800 mg omega-3 per softgel, printed on the front."],"cf_decision":["Fish oil needs no partner. It needs clear numbers: the oil, the omega-3 inside it, and EPA and DHA, each shown separately.","One softgel, two numbers on the label: the oil and the omega-3 inside it, with EPA and DHA shown separately.","One softgel, two numbers on the label: the oil and the omega-3 inside it. EPA and DHA are shown separately.","Two numbers on the label: the oil and the omega-3 in it. EPA and DHA shown separately.","Oil and omega-3, both printed. EPA and DHA too.","We print the omega-3, not just the oil, so you know what you get."],"cf_headline":["Count the omega-3, not the oil."]},
    "l-theanine": {"cf_headline":["The green-tea amino acid. 200 mg, on its own.","One amino acid. 200 mg. Nothing else active."],"cf_support":["One capsule in the morning, with or without food. One active ingredient, with its amount printed.","200 mg of L-theanine, the amino acid naturally found in green tea, in one vegetarian capsule.","200 mg L-theanine, the green-tea amino acid, in one capsule."],"cf_ingredient":["L-theanine is an amino acid found naturally in green tea. It’s a simple, well-characterised ingredient that makes sense on its own.","L-theanine is the amino acid that tea is known for. It is a simple, well-characterised single ingredient.","The amino acid tea is known for. A simple, well-characterised single ingredient."],"cf_form":["Free-form L-theanine, on its own rather than in a blend, so the 200 mg on the label is 200 mg of L-theanine.","Free-form L-theanine, on its own, so the amount you take is the amount on the label.","Free-form L-theanine, on its own. The amount on the label is the amount you take.","Free-form, on its own. What the label says is what you take."],"cf_amount":["200 mg per capsule, an amount used in published studies. One capsule is one serving, so there’s nothing to divide.","200 mg, an amount used in published studies.","200 mg, as used in published studies."],"cf_decision":["One ingredient, one number, one capsule. No blend sharing the dose.","One ingredient, one number, one capsule. No blend to divide the dose.","One ingredient, one number. No blend.","Only L-theanine, no blend, so all 200 mg is the one ingredient."]},
    "myo-d-chiro-inositol": {"cf_headline":["The ratio is the formula. 40:1.","Two inositols. One ratio. 40:1, on the front."],"cf_support":["40 parts myo-inositol to 1 part D-chiro-inositol, printed on the front and checked in every batch. Three capsules in the morning, with food.","2,000 mg myo-inositol and 50 mg D-chiro-inositol per serving: a 40:1 ratio, printed on the front."],"cf_form":["Both forms are included because research has looked at them together, in a set ratio, rather than either one alone.","Both forms are included because research has looked at them together, in a defined ratio, rather than either alone.","Research has looked at the two together, in a set ratio, not either one alone.","Research studies them together, in a set ratio."],"cf_decision":["One of our two deliberate pairs. Either inositol alone would be a different product; the 40:1 balance between them is the point.","A deliberate combination where the ratio is the formula, so the ratio goes on the front.","A deliberate pair. The ratio is the formula, so it goes on the front.","The ratio is the formula, so it’s on the front.","Both inositols at 40:1, checked in every batch and printed on the front."],"cf_ingredient":["Myo-inositol and D-chiro-inositol are two forms of inositol that the body uses side by side.","Two forms of inositol that the body uses side by side.","Two forms of inositol the body uses together."],"cf_amount":["2,000 mg + 50 mg per three capsules: 40:1, a ratio used in published research. Our specification checks that each batch stays between 36:1 and 44:1.","2,000 mg + 50 mg per three capsules: 40:1, a ratio used in research. Each batch stays within 36:1–44:1.","40:1 in three capsules. Each batch stays within 36:1–44:1."]},
    "creatine-chews": {"cf_support":["Pick one time of day, morning, noon or night, and keep to it. Chew both tablets; don’t swallow them whole.","3,000 mg of creatine monohydrate in two orange chewable tablets. No powder, no shaker.","3,000 mg creatine monohydrate in two orange chews. No powder."],"cf_ingredient":["Creatine is one of the most studied ingredients in sports nutrition, and it’s taken once a day, every day, not only on training days.","Creatine is one of the most researched sports-nutrition ingredients, and it is meant to be taken every day.","Creatine is one of the most researched sports-nutrition ingredients, and it only helps if you take it every day.","One of the most researched sports-nutrition ingredients. It only helps if you take it daily.","One of the most researched sports ingredients. Take it daily."],"cf_amount":["3,000 mg (3 g) per serving, within the 3–5 g a day commonly used in research.","3 g per serving, within the 3–5 g daily intake commonly used in research."],"cf_decision":["Creatine needs no partner, so the chew holds creatine and what makes it a chew: orange flavour and 3.6 g of sugar per serving, which we print.","We chose a chewable format for consistency, and we print the sugar it needs: 3.6 g per serving.","A chew keeps the habit easy. We print the sugar it needs: 3.6 g per serving.","Chews keep the habit easy. Sugar printed: 3.6 g.","Chews, so you don’t skip a day. They need 3.6 g sugar, and we say so."],"cf_form":["Creatine monohydrate, the most studied form. It comes as a chew because a daily habit is easier when nothing needs mixing.","Creatine monohydrate, the most studied form. A chew, so there’s nothing to mix.","Monohydrate, the most studied form. Nothing to mix."],"cf_headline":["3 grams of creatine. Two chews. Your time."]},
    "psyllium-husk": {"cf_support":["Five capsules at night, with food and a full glass of water. The same isabgol, with nothing to stir.","2,000 mg of psyllium husk in five capsules, giving 1,578 mg of dietary fibre, 1,362 mg of it soluble."],"cf_form":["Whole psyllium husk, filled into vegetarian capsules: the same ingredient as the isabgol at home, in a measured amount.","Whole psyllium husk in capsules: the same ingredient, with nothing to stir."],"cf_amount":["2,000 mg of husk per serving, giving 1,578 mg of fibre, 1,362 mg of it soluble. We print both, because husk weight and fibre aren’t the same number.","2,000 mg per serving, a measured daily top-up of fibre. We print both the husk weight and the fibre it gives, because they are different numbers.","2,000 mg of husk per serving. We print the fibre too, because husk and fibre are different numbers.","2,000 mg husk per serving. Fibre printed too: a different number."],"cf_decision":["Isabgol needs nothing added. What it does need is water, so every serving comes with a full glass.","Isabgol, measured. Always with a full glass of water.","Isabgol without the stirring. Always take it with a full glass of water."],"cf_ingredient":["Psyllium (isabgol) is a familiar source of soluble fibre in most Indian homes.","Isabgol: a familiar source of soluble fibre in most Indian homes."]}
  };


  /* What each product is for (16 Nov 2026, owner-approved). Only the front-label Key Benefit, which the Version E workbook keeps
     as the permitted claim (Claims sheet, C20, FSSAI consultant to verify), then the label amounts behind it. No condition,
     outcome or timing promise. [shop card, one line · range, at most two lines · product page claim · product page facts] */
  /* 17 Nov 2026 (owner): all three lines are the front label's words exactly (label-records.json "claim"), in sentence case;
     the shop card no longer shortens them to tags ("Calm · Focus"), and the product page keeps the label's "&". */
  var USE = {
    "omega-3-fish-oil": ["Supports heart, brain & joint health", "Supports heart, brain & joint health", "Supports heart, brain & joint health.", "Each softgel gives 800 mg omega-3 as triglycerides: 400 mg EPA and 300 mg DHA."],
    "vitamin-d3-k2": ["Supports bone, muscle & heart health", "Supports bone, muscle & heart health", "Supports bone, muscle & heart health.", "One softgel gives 600 IU vitamin D3, 55 mcg vitamin K2 as MK-7 and 200 mg omega-3."],
    "creatine-chews": ["Supports strength & performance", "Supports strength & performance", "Supports strength & performance.", "Two orange chewable tablets give 3,000 mg creatine monohydrate, with no powder to mix."],
    "iron-bisglycinate": ["Supports hemoglobin formation & energy metabolism", "Supports hemoglobin formation & energy metabolism", "Supports hemoglobin formation & energy metabolism.", "Each capsule gives 29 mg iron as Ferrochel® ferrous bisglycinate chelate."],
    "l-theanine": ["Supports calm mind & clear focus", "Supports calm mind & clear focus", "Supports calm mind & clear focus.", "Each capsule gives 200 mg L-Theanine, the amino acid naturally found in green tea."],
    "myo-d-chiro-inositol": ["Supports hormonal & metabolic balance", "Supports hormonal & metabolic balance", "Supports hormonal & metabolic balance.", "Three capsules give 2,000 mg Myo-Inositol and 50 mg D-Chiro Inositol, a 40:1 ratio."],
    "psyllium-husk": ["Supports digestive health & regularity", "Supports digestive health & regularity", "Supports digestive health & regularity.", "Five capsules give 2,000 mg psyllium husk (isabgol), with 1,578 mg dietary fibre."]
  };
  // The product page claims these replaced (saved in the admin as defaults); a stored copy of one gives way to the line above.
  var PREV_CLAIM = {
    "omega-3-fish-oil": "Supports heart, brain and joint health.", "vitamin-d3-k2": "Supports bone, muscle and heart health.",
    "creatine-chews": "Supports strength and performance.", "iron-bisglycinate": "Supports hemoglobin formation and energy metabolism.",
    "l-theanine": "Supports a calm mind and clear focus.", "myo-d-chiro-inositol": "Supports hormonal and metabolic balance.",
    "psyllium-husk": "Supports digestive health and regularity."
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
  /* "Key benefits" defaults to Part 2's points (BCCPart2E.PDP): the workbook keeps the label content as it is (row 67). These
     are copy review 01's four lines (17 Nov 2026), kept so an admin field saved from them shows Part 2's points again. */
  var PREV_POINTS = {
    "iron-bisglycinate": ["29 mg elemental iron per capsule", "Ferrochel® bisglycinate, named on the front", "One capsule, morning, empty stomach", "Vegetarian capsule"],
    "l-theanine": ["200 mg L-Theanine per capsule", "Naturally found in green tea", "One capsule, morning, with or without food", "Vegetarian capsule"],
    "vitamin-d3-k2": ["600 IU vitamin D3 and 55 mcg K2 as MK-7", "200 mg omega-3 (100 mg EPA, 75 mg DHA)", "One softgel, morning, with food", "Non-vegetarian: fish oil and gelatin"],
    "omega-3-fish-oil": ["800 mg omega-3 per softgel", "400 mg EPA and 300 mg DHA", "Triglyceride form, from anchovy", "Non-vegetarian: fish oil and gelatin"],
    "myo-d-chiro-inositol": ["2,000 mg Myo-Inositol and 50 mg D-Chiro Inositol", "40:1 ratio, checked batch by batch", "Three capsules, morning, with food", "Vegetarian capsules"],
    "creatine-chews": ["3,000 mg creatine monohydrate per serving", "Two orange chews, at one time you choose", "Not sugar-free: 3.6 g sugar per serving", "Vegetarian"],
    "psyllium-husk": ["2,000 mg psyllium husk per serving", "1,578 mg dietary fibre, 1,362 mg soluble", "Five capsules, at night, with a full glass of water", "Vegetarian capsules"]
  };
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
  /* Copy review 02 (20 Nov 2026, owner: "Yes, apply those"): Content Focus's own "Key benefits" lines where they differ from
     Part 2's (Part 2 keeps BCCPart2E.PDP). An admin field still holding Part 2's points was saved from the old default. */
  var POINTS = {
    "omega-3-fish-oil": ["800 mg omega-3 in one softgel", "400 mg EPA and 300 mg DHA", "From anchovy, as triglycerides"],
    "iron-bisglycinate": ["29 mg elemental iron per capsule", "Ferrochel® bisglycinate: iron bound to glycine", "Vegetarian capsule"],
    "l-theanine": ["200 mg L-Theanine per capsule", "Naturally found in green tea", "Vegetarian capsule"],
    "creatine-chews": ["3,000 mg creatine monohydrate per serving", "Orange-flavoured chewable tablets", "Not sugar-free: 3.6 g sugar per serving"]
  };
  function points(id) { return POINTS[id] ? POINTS[id].join("\n") : oldPoints(id); }
  window.BCCContentFocusCopy = {
    defaults: function (id) {
      var c = BASE.P[id], u = BASE.U[id]; if (!c || !u) return {};
      return { cf_claim: u[2], cf_facts: u[3], cf_headline: c.headline, cf_support: c.support, cf_ingredient: c.ingredient, cf_form: c.form,
        cf_amount: c.amount, cf_decision: c.decision, cf_points: points(id) };
    },
    // True when a stored admin field is a copy of a replaced default (web/label-content.js then shows the new default).
    stale: function (id, key, value) {
      if (typeof value !== "string" || !value.trim()) return false;
      var v = value.trim();
      if (key === "cf_points") return (!!PREV_POINTS[id] && v === PREV_POINTS[id].join("\n")) || (!!POINTS[id] && v === oldPoints(id));
      if (key === "cf_claim" && PREV_CLAIM[id] === v) return true;
      var old = PREV[id] && PREV[id][key];
      return Array.isArray(old) ? old.indexOf(v) > -1 : old === v;
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
    // Fewer words (owner, 19 Nov 2026): the intro, the founder paragraph and the testing note, each cut to three lines on a phone.
    intro: "A long list can look impressive. It can’t tell you why. Every formula answers four questions first.",
    // The four decisions, each with a real example from the seven: [product whose cap colours it, label, heading, example].
    decisions: [
      ["iron-bisglycinate", "Ingredient", "The right ingredient", "Iron stands alone, as Ferrochel® bisglycinate."],
      ["omega-3-fish-oil", "Form", "The right form", "K2 as MK-7. Omega-3 as triglycerides."],
      ["iron-bisglycinate", "Amount", "The right amount", "29 mg of iron you actually get, not the compound’s weight."],
      ["vitamin-d3-k2", "Combination", "A reason to combine", "D3 and K2 share one oil, because both dissolve in fat."]
    ],
    /* The founder band (workbook, Founder sheet, home founder intro; owner, 17 Nov 2026), word for word. */
    founder: ["Formulated by a pharmaceutical scientist", "The questions come before the capsule.",
      "Dr. Nayan Solanki (PhD, Industrial Pharmacy) has spent his career developing medicines. He chose every ingredient, form and dose in our seven.",
      "Meet the scientist"],
    // Testing moves here from the standard band: it starts with the first production batch (claim C6).
    testing: "From our first production batch, independent laboratories test each batch. Records appear here."
  };
  /* The product page's Questions (copy review 02, 20 Nov 2026, owner: "Yes, apply those"). Every answer is the label's:
     its caution, its directions, its diet mark and allergens, and (Iron) the decision. No advice, no promise of results. */
  var QA_WHO = ["Who is it for?", "Adults. Pregnant, breastfeeding or under medical care? Ask your doctor first."];
  var QA_NONVEG = ["Is it vegetarian?", "No. It contains fish oil and gelatin, and also soy."];
  var QA_VEG = ["Is it vegetarian?", "Yes, a vegetarian capsule. It may contain nuts."];
  var QA = {
    "omega-3-fish-oil": [["How do I take it?", "One softgel each morning, with food."], QA_NONVEG],
    "vitamin-d3-k2": [["How do I take it?", "One softgel each morning, with food."], QA_NONVEG],
    "iron-bisglycinate": [["How do I take it?", "One capsule each morning on an empty stomach. No milk or chai for 2 hours before or after."], QA_VEG,
      ["Can I take it with my other supplements?", "Take it on its own. Calcium can lower how much iron you absorb."]],
    "l-theanine": [["How do I take it?", "One capsule each morning, with or without food."], QA_VEG],
    "myo-d-chiro-inositol": [["How do I take it?", "Three capsules in the morning, with food."], QA_VEG],
    "creatine-chews": [["How do I take it?", "Chew two tablets once a day, at the same time each day. Don’t swallow them whole."],
      ["Is it vegetarian?", "Yes. It isn’t sugar-free: 3.6 g sugar per serving. It may contain nuts."]],
    "psyllium-husk": [["How do I take it?", "Five capsules once a day at night, with food and a full glass of water."], QA_VEG]
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
      headlines(); shortenData();
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
    if (stdH) stdH.insertAdjacentHTML("afterend", '<p class="cf-sec-lede">' + esc(HOME.intro) + "</p>");
    // The scientist behind the four decisions, straight after them.
    var F = HOME.founder;
    if (std) std.insertAdjacentHTML("afterend", '<section class="p2-section cf-founder-band" aria-labelledby="cf-founder-t"><div class="p2-wrap cf-fb-in">' +
      '<div><p class="p2-eyebrow">' + esc(F[0]) + '</p><h2 id="cf-founder-t">' + esc(F[1]) + "</h2></div>" +
      '<div><p class="cf-fb-p">' + esc(F[2]) + '</p><a class="p2-link" href="/story">' + esc(F[3]) + "</a></div></div></section>");
    if (list) {
      list.classList.add("cf-decisions");
      list.innerHTML = HOME.decisions.map(function (d) { return '<li style="--cap:' + esc(colour(d[0])) + '"><b class="p2-std4-tag">' + esc(d[1]) + "</b><h3>" + esc(d[2]) + "</h3><p>" + esc(d[3]) + "</p></li>"; }).join("");
    }
    // Batch band: where testing now stands.
    var lot = root.querySelector(".p2-lotband-in > div > p:not(.p2-eyebrow)");
    if (lot) lot.insertAdjacentHTML("afterend", '<p class="cf-testing">' + esc(HOME.testing) + "</p>");
  });
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
    });
  });
  /* Our standard (16 Nov 2026, owner-approved): the page delivers the four decisions its heading names, in the home page's
     words, then the two proof sections. The reasons are the product pages' own "why" lines, shortened for the amounts. */
  var STD = {
    decisions: [["ingredient", "The right ingredient"], ["form", "The right form"], ["dose", "The right amount"], ["combine", "A reason to combine"]],
    // The intro is the Version E workbook's own sentence (Text Replacements, row 15). The amount section keeps its paragraph.
    // Rows 33–35 (owner, 17 Nov 2026: the workbook's headings and paragraph, not the 16 Nov ones).
    pick: ["Form first", "The form decides what you actually take. So we choose it first, and name it on the label."],
    amount: ["Amounts that mean something", ""],
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
  /* Story (16 Nov 2026, owner-approved). Since 17 Nov (owner) the founder's title and his career paragraph are the Version E
     workbook's exactly (rows 45 and 49); the paragraph is marked data-maker-ok so the manufacturer-name filter keeps it. The
     seven bottles get their own chapter back, as the Super Sevens. */
  var SEVENS = ["The Super Sevens.", "Five single ingredients. Two deliberate pairs. Every amount on the front. Take what you need. Skip what you don’t."];
  function story(root) {
    swap(root, TEXT.story);
    /* Row 49 used to speak of manufacturing as his career and was marked data-maker-ok for the manufacturer-name filter (scrub
       in web/part2-e.js). Its short version (19 Nov 2026) avoids the word, so it needs no mark. */
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
  // Fewer words (owner, 19 Nov 2026): each answer fits three lines on a phone.
  var HELP_FAQS = [
    ["Should I take all seven?", "No. Take only what you need, and follow its label. Pregnant, breastfeeding or under medical care? Ask a doctor first."],
    ["Are they vegetarian?", "Five are. Omega-3 Fish Oil and Vitamin D3 + K2 are non-vegetarian: fish oil in gelatin softgels."],
    ["When should I take a product?", "Each label says when. Six are best in the morning, Psyllium Husk at night. Iron goes on an empty stomach."],
    ["What do the prices include?", "Prices are shown as MRP, inclusive of all taxes."],
    ["How much is delivery?", "Delivery is ₹75, free when the subtotal after discount is ₹1,499 or more."],
    ["How can I pay?", "UPI, card, wallet or net banking, through Razorpay. No cash on delivery."],
    ["Can I return a product?", "No change-of-mind returns. Damaged, wrong, missing, faulty or expired? Tell us within 7 days for a refund or replacement."],
    ["Where do I find my batch report?", "Pick your product on the batch reports page and enter the Batch No. from the pack."]
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
  /* Contact (fewer words, owner, 19 Nov 2026): the two safety notes, the same meaning in fewer words. The first is drawn after
     the page renders (web/super-sevens.js), so it is swapped from the observer at the end, like the bag. */
  var CONTACT = [
    ["We can explain our products, but we can't give medical advice. For questions about your health, please speak with a doctor.", "We can explain our products, not give medical advice. For your health, please ask a doctor."],
    ["If someone needs urgent medical care, contact a doctor or emergency services first. Stop using the product and keep the pack.", "Urgent medical need? Contact a doctor or emergency services first. Stop using the product and keep the pack."]
  ];
  page("contact", function (root) { swap(root, CONTACT); });
  function dressContact() {
    if (!focus()) return;
    var n = document.querySelector("#main .ss-switch-note"); if (n && n.textContent.trim() === CONTACT[0][0]) n.textContent = CONTACT[0][1];
    // The social icons sit under the WhatsApp and email pills in the "Call or WhatsApp" card.
    var alt = document.querySelector("#main .ss-switch-alt");
    if (alt && !alt.parentNode.querySelector(".cf-social")) alt.insertAdjacentHTML("afterend", social("cf-social-contact"));
  }
  /* Social media (owner, 19 Nov 2026), Content Focus only: Instagram, Facebook and X, in the footer and on Contact. "For now
     add icons only": with no address the icon is shown but isn't a link. Put each profile's full https:// address in its
     third slot and it becomes a link that opens in a new tab, in both places. */
  var SOCIAL = [
    ["instagram", "Instagram", "", '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" class="cf-social-dot"/>'],
    ["facebook", "Facebook", "", '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>'],
    ["x", "X", "", '<path class="cf-social-fill" transform="translate(3 3) scale(.75)" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>']
  ];
  function social(cls) {
    return '<ul class="cf-social ' + cls + '" aria-label="Body Café Co. on social media">' + SOCIAL.map(function (s) {
      var svg = '<svg viewBox="0 0 24 24" aria-hidden="true">' + s[3] + "</svg>";
      return "<li>" + (s[2] ? '<a class="cf-social-i is-' + s[0] + '" href="' + esc(s[2]) + '" target="_blank" rel="noopener" aria-label="' + s[1] + ' (opens in a new tab)">' + svg + "</a>"
        : '<span class="cf-social-i is-' + s[0] + '" role="img" aria-label="' + s[1] + '">' + svg + "</span>") + "</li>";
    }).join("") + "</ul>";
  }
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
    // Row 67: "Key benefits" stays as it is, claim included; the admin's points (cf_points) fill its list.
    [].forEach.call(root.querySelectorAll(".p2-pdp-accs > details"), function (d) {
      var s = d.querySelector("summary span"), title = s && s.textContent.trim();
      if (title !== "Key benefits") return;
      // The points are the admin's lines; how long a bottle lasts stays worked out from the servings.
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
    // Questions, the last section (copy review 02, 20 Nov 2026): the buyer's own questions, answered from the label only.
    var qa = QA[p.id], accs = root.querySelector(".p2-pdp-accs");
    if (qa && accs && !accs.querySelector(".cf-qa")) accs.insertAdjacentHTML("beforeend", '<details class="p2-acc cf-qa"><summary><span>Questions</span><i aria-hidden="true"></i></summary><div class="p2-acc-body">' +
      [QA_WHO].concat(qa).map(function (x) { return '<h4 class="cf-q">' + esc(x[0]) + "</h4><p>" + esc(x[1]) + "</p>"; }).join("") + "</div></details>");
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
      return html.replace("<br>One uncompromising standard.</p>", "<br>" + esc(FOOTER) + "</p>" + social("cf-social-foot"))
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
    notes: ["Ships in 3–4 days.", "No change-of-mind returns. Damaged, wrong, missing, faulty or expired? Tell us within 7 days."],
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
    // Fewer words (owner, 19 Nov 2026).
    where: ["Where to find it.", "On the label, beside the barcode. Not your order number."],
    status: "Reports are published batch by batch, from our first production batch. Not listed yet? It isn’t published yet.",
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
  /* The review section, laid out like a marketplace's (owner, 19 Nov 2026, Amazon's as the reference). Content Focus only.
     Left: the average, the 5 → 1 star bars (each one filters the list), how reviews work, and "Write a review".
     Right: what the reviews mention (topics found in their words, each one filters the list), customer photos (the
     photos published with customer reviews, checked in the admin portal first), and the reviews, sortable, five at a time.
     The rating counts published customer reviews only; until there are some, it counts the sample reviews and says so.
     Sample reviews are always tagged "Sample". Topics are found by words, never invented: a topic shows only when a
     review on the page uses its words, and its arrow is from those reviews' own ratings (4 or more on average: mostly
     positive). No photos are shown that a customer didn't publish; until there are some, the strip says so. */
  var RX = {
    title: "What people say.", eyebrow: "Customer reviews",
    none: "No ratings yet.", outOf: " out of 5",
    how: ["How reviews work", "Delivered orders only, once per product. Low ratings are published too. Reviews tagged Sample are ours."],
    reviewThis: ["Bought this?", "Your review helps the next person decide."],
    topics: ["What reviews mention", "Tap a topic to read those reviews."],
    photos: ["Customer photos", "No customer photos yet."],
    list: "Top reviews", more: "See more reviews", clear: "Clear filters", empty: "No reviews match these filters.",
    sort: [["top", "Top reviews"], ["recent", "Most recent"], ["low", "Lowest rating first"]]
  };
  // [key, chip label, words that count]. Things a review can say about the product itself, never what it did for someone.
  var RX_TOPICS = [
    ["label", "Clear label", /\blabels?\b|\bstated\b|\blisted\b|written|\bamounts?\b|\bratio\b|\bIU\b|\bmcg\b|decode|breaks down/i],
    ["easy", "Easy to take", /swallow|goes down|easy to remember|one a day|one capsule|one softgel|two chews|no powder|no shaker|instead of a spoon/i],
    ["taste", "Taste", /\btastes?\b|flavou?r|chalk/i],
    ["pack", "Packaging", /\bpacked\b|packaging|\bsealed\b|\bbox\b/i],
    ["order", "Ordering & delivery", /deliver|arrived|checkout|ordering|to order\b/i],
    ["value", "Value", /\bvalue\b|\bprice\b|worth|money|reorder|exactly a month|two months/i],
    ["batch", "Batch lookup", /lot number|batch (number|record|lookup)/i]
  ];
  function rxStars(v, cls) {
    var s = ""; for (var i = 1; i <= 5; i++) s += '<i style="--f:' + Math.max(0, Math.min(1, v - i + 1)).toFixed(2) + '"></i>';
    return '<span class="cf-rx-stars' + (cls ? " " + cls : "") + '" role="img" aria-label="' + (+v).toFixed(1).replace(/\.0$/, "") + ' out of 5 stars">' + s + "</span>";
  }
  function rxWhen(t) { var d = Date.parse("1 " + t); return isNaN(d) ? 0 : d / 1000; }
  function rxSamples(id) {
    var P2 = window.BCCPart2E || {};
    return (P2.reviewsFor ? P2.reviewsFor(id) : []).map(function (r, i) {
      return { key: "s" + i, rating: r[1], title: r[2], text: r[3], name: r[4], where: r[5], when: r[6], at: rxWhen(r[6]), sample: true, media: [] };
    });
  }
  function rxReal(r) {
    var at = r.published || r.created || 0;
    return { key: r.id, rating: r.rating, title: r.title || "", text: r.text, name: r.display_name || "Verified customer", when: at ? day(at) : "", at: at,
      verified: r.verified !== false, incentive: r.incentive, reply: r.reply, media: r.media || [] };
  }
  // The rating: published customer reviews when there are any, else the samples.
  function rxSummary(st) {
    var base = st.real.length ? st.real : st.samples, s = st.summary || {}, br = {};
    [1, 2, 3, 4, 5].forEach(function (n) { br[n] = 0; }); base.forEach(function (r) { br[r.rating] = (br[r.rating] || 0) + 1; });
    if (st.real.length && s.breakdown) [1, 2, 3, 4, 5].forEach(function (n) { if (s.breakdown[n] != null) br[n] = +s.breakdown[n]; });
    var n = st.real.length && s.count ? s.count : base.length, sum = 0; [1, 2, 3, 4, 5].forEach(function (k) { sum += k * br[k]; });
    return { n: n, avg: n ? (st.real.length && s.average ? +s.average : sum / n) : 0, br: br, sample: !st.real.length };
  }
  function rxTopicsOf(r) { var t = (r.title + " " + r.text); return RX_TOPICS.filter(function (x) { return x[2].test(t); }).map(function (x) { return x[0]; }); }
  function rxAll(st) { return st.real.concat(st.samples); }
  function rxShown(st) {
    var list = rxAll(st).filter(function (r) { return (!st.star || r.rating === st.star) && (!st.topic || rxTopicsOf(r).indexOf(st.topic) >= 0); });
    var by = { top: function (a, b) { return (a.sample - b.sample) || (b.rating - a.rating) || (b.at - a.at); },
      recent: function (a, b) { return (b.at - a.at) || (a.sample - b.sample); },
      low: function (a, b) { return (a.rating - b.rating) || (b.at - a.at); } }[st.sort] || null;
    return by ? list.slice().sort(by) : list;
  }
  function rxSide(st) {
    var s = rxSummary(st), pct = function (k) { return s.n ? Math.round(s.br[k] / s.n * 100) : 0; };
    return '<p class="p2-eyebrow">' + RX.eyebrow + '</p><h2 id="cf-rx-t">' + RX.title + "</h2>" +
      (s.n ? '<div class="cf-rx-avg">' + rxStars(s.avg, "is-big") + "<b>" + s.avg.toFixed(1) + RX.outOf + "</b></div>" +
        '<p class="cf-rx-n">' + s.n + (s.sample ? " sample" : "") + " rating" + (s.n === 1 ? "" : "s") + "</p>" : '<p class="cf-rx-n">' + RX.none + "</p>") +
      '<ul class="cf-rx-bars">' + [5, 4, 3, 2, 1].map(function (k) {
        var on = st.star === k, c = s.br[k] || 0;
        return '<li><button type="button" data-cf-rx-star="' + k + '" aria-pressed="' + on + '"' + (c ? "" : " disabled") +
          ' aria-label="' + k + " star: " + pct(k) + "% of ratings" + (c ? ". Show these reviews" : "") + '"><span class="cf-rx-k">' + k + ' star</span><span class="cf-rx-track"><i style="width:' + pct(k) + '%"></i></span><span class="cf-rx-p">' + pct(k) + "%</span></button></li>";
      }).join("") + "</ul>" +
      '<details class="cf-rx-how"><summary>' + RX.how[0] + "</summary><p>" + RX.how[1] + "</p></details>" +
      '<div class="cf-rx-write"><h3>' + RX.reviewThis[0] + "</h3><p>" + RX.reviewThis[1] + "</p>" +
      '<button type="button" class="p2-btn p2-btn-ghost cf-rv-write" data-cf-rv-write aria-expanded="false" aria-controls="cf-rv-panel">' + RV.write + "</button></div>";
  }
  function rxTopics(st) {
    var all = rxAll(st), found = RX_TOPICS.map(function (t) {
      var rs = all.filter(function (r) { return rxTopicsOf(r).indexOf(t[0]) >= 0; });
      return { k: t[0], label: t[1], n: rs.length, up: rs.length && rs.reduce(function (a, r) { return a + r.rating; }, 0) / rs.length >= 4 };
    }).filter(function (t) { return t.n; }).sort(function (a, b) { return b.n - a.n; });
    if (!found.length) return "";
    return '<section class="cf-rx-block" aria-labelledby="cf-rx-topics-t"><h3 id="cf-rx-topics-t">' + RX.topics[0] + '</h3><p class="cf-rx-sub">' + RX.topics[1] + '</p><ul class="cf-rx-topics">' +
      found.map(function (t) {
        return '<li><button type="button" data-cf-rx-topic="' + t.k + '" aria-pressed="' + (st.topic === t.k) + '"><svg viewBox="0 0 24 24" aria-hidden="true">' +
          (t.up ? '<path d="M6 18L18 6M9 6h9v9"/>' : '<path d="M3 13c3-4 6-4 9 0s6 4 9 0"/>') + '</svg><span class="sr-only">' + (t.up ? "Mostly positive: " : "Mixed: ") + "</span>" +
          esc(t.label) + " <small>(" + t.n + ")</small></button></li>";
      }).join("") + "</ul></section>";
  }
  function rxPhotos(st) {
    var ph = []; st.real.forEach(function (r) { r.media.forEach(function (m) { ph.push({ m: m, r: r }); }); });
    return '<section class="cf-rx-block" aria-labelledby="cf-rx-photos-t"><div class="cf-rx-bh"><h3 id="cf-rx-photos-t">' + RX.photos[0] + "</h3>" +
      (ph.length > 4 ? '<div class="cf-rx-arrows"><button type="button" data-cf-rx-scroll="-1" aria-label="Previous photos">‹</button><button type="button" data-cf-rx-scroll="1" aria-label="Next photos">›</button></div>' : "") + "</div>" +
      (ph.length ? '<ul class="cf-rx-photos" data-cf-rx-strip>' + ph.map(function (x, i) {
        return '<li><button type="button" data-cf-rx-photo="' + i + '"><img src="/api/review-media/' + esc(x.m.id) + '" alt="Customer photo ' + (i + 1) + " from " + esc(x.r.name) + '" width="' + (+x.m.width || 400) + '" height="' + (+x.m.height || 400) + '" loading="lazy" decoding="async">' + rxStars(x.r.rating) + "</button></li>";
      }).join("") + "</ul>"
        : '<div class="cf-rx-nophoto"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg><p>' + RX.photos[1] + "</p></div>") + "</section>";
  }
  function rxCard(r) {
    var initial = (r.name || "?").trim().charAt(0).toUpperCase();
    return '<li class="cf-rx-r"><div class="cf-rx-who"><span class="cf-rx-av" aria-hidden="true">' + esc(initial) + "</span><b>" + esc(r.name) + "</b></div>" +
      '<p class="cf-rx-head">' + rxStars(r.rating) + (r.title ? "<b>" + esc(r.title) + "</b>" : "") + "</p>" +
      '<p class="cf-rx-meta">' + (r.where ? esc(r.where) + " · " : "") + esc(r.when) + "</p>" +
      (r.sample ? '<p class="cf-rx-tags"><span class="p2-sample">Sample</span></p>' : r.verified ? '<p class="cf-rx-tags"><span class="cf-rx-ver">' + RV.verified + "</span></p>" : "") +
      '<p class="cf-rx-text">' + esc(r.text) + "</p>" +
      (r.media.length ? '<ul class="cf-rx-thumbs">' + r.media.map(function (m, i) { return '<li><button type="button" data-cf-rx-rphoto="' + esc(r.key) + '" data-i="' + i + '"><img src="/api/review-media/' + esc(m.id) + '" alt="Customer photo ' + (i + 1) + " from " + esc(r.name) + '" loading="lazy" decoding="async"></button></li>'; }).join("") + "</ul>" : "") +
      (r.incentive && r.incentive !== "none" ? '<p class="cf-rv-note">' + (r.incentive === "free_product" ? "Received this product free." : "Received an incentive for this review.") + "</p>" : "") +
      (r.reply && r.reply.text ? '<div class="cf-rv-reply"><b>' + RV.reply + "</b><p>" + esc(r.reply.text) + "</p></div>" : "") + "</li>";
  }
  function rxList(st) {
    var shown = rxShown(st), lim = st.limit || 5, label = RX_TOPICS.filter(function (t) { return t[0] === st.topic; })[0];
    var bits = []; if (st.star) bits.push("rated " + st.star + " star" + (st.star > 1 ? "s" : "")); if (label) bits.push("mentioning " + label[1].toLowerCase());
    return '<section class="cf-rx-block" aria-labelledby="cf-rx-list-t"><div class="cf-rx-bh"><h3 id="cf-rx-list-t">' + RX.list + "</h3>" +
      '<label class="cf-rx-sort"><span class="sr-only">Sort reviews</span><select data-cf-rx-sort>' + RX.sort.map(function (o) { return '<option value="' + o[0] + '"' + (st.sort === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></label></div>" +
      (bits.length ? '<p class="cf-rx-filter" role="status">' + shown.length + " review" + (shown.length === 1 ? "" : "s") + " " + bits.join(", ") + ' · <button type="button" class="p2-linkbtn" data-cf-rx-clear>' + RX.clear + "</button></p>" : "") +
      (shown.length ? '<ul class="cf-rx-list">' + shown.slice(0, lim).map(rxCard).join("") + "</ul>" : '<p class="cf-rx-filter">' + RX.empty + "</p>") +
      (shown.length > lim ? '<button type="button" class="p2-btn p2-btn-ghost cf-rx-more" data-cf-rx-more>' + RX.more + "</button>" : "") + "</section>";
  }
  function rxDraw(box, part) {
    var st = box._rx; if (!st) return;
    var side = box.querySelector("[data-cf-rx-side]"), main = box.querySelector("[data-cf-rx-main]");
    if (side && (!part || part === "side")) {
      // Keep the open "Write a review" state across a redraw.
      var w = side.querySelector("[data-cf-rv-write]"), open = w && w.getAttribute("aria-expanded");
      side.innerHTML = rxSide(st); if (open) side.querySelector("[data-cf-rv-write]").setAttribute("aria-expanded", open);
    }
    if (main) {
      var top = main.querySelector("[data-cf-rx-top]"), rest = main.querySelector("[data-cf-rx-list]");
      if (!part || part === "side") top.innerHTML = rxTopics(st) + rxPhotos(st);
      else [].forEach.call(top.querySelectorAll("[data-cf-rx-topic]"), function (b) { b.setAttribute("aria-pressed", String(b.dataset.cfRxTopic === st.topic)); });
      rest.innerHTML = rxList(st);
    }
    [].forEach.call(box.querySelectorAll("[data-cf-rx-star]"), function (b) { b.setAttribute("aria-pressed", String(+b.dataset.cfRxStar === st.star)); });
  }
  function rxState(id) { return { id: id, real: [], samples: rxSamples(id), summary: null, star: 0, topic: "", sort: "top", limit: 5 }; }

  page("product", function (root, args) {
    var p = args[1] || {}, sec = root.querySelector("#p2-reviews"), wrap = sec && sec.querySelector(".p2-wrap");
    if (!p.id || !wrap || root.querySelector("[data-cf-rv]")) return;
    sec.classList.add("cf-rx-sec"); sec.setAttribute("aria-labelledby", "cf-rx-t");
    var st = rxState(p.id);
    wrap.outerHTML = '<div class="p2-wrap cf-rx" data-cf-rv="' + esc(p.id) + '" style="--cap:' + esc(p.color || "") + '">' +
      '<div class="cf-rx-side" data-cf-rx-side>' + rxSide(st) + "</div>" +
      '<div class="cf-rx-main" data-cf-rx-main><div class="cf-rv-panel" id="cf-rv-panel" data-cf-rv-panel role="region" aria-label="' + RV.write + '" hidden></div>' +
      '<div data-cf-rx-top>' + rxTopics(st) + rxPhotos(st) + '</div><div data-cf-rx-list>' + rxList(st) + "</div></div></div>";
  });
  function day(t) { try { return new Date(t * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); } catch (e) { return ""; } }
  function starsOf(n) { var S2 = window.BCCPart2E || {}; return S2.stars ? S2.stars(n) : n + " out of 5"; }
  // Published customer reviews, once per product page; the section is drawn again with them.
  function mountReviews() {
    if (!focus()) return;
    [].forEach.call(document.querySelectorAll("#main [data-cf-rv]:not([data-cf-rv-ready])"), function (box) {
      box.setAttribute("data-cf-rv-ready", "");
      box._rx = rxState(box.dataset.cfRv);
      if (!A().api) return;
      A().api("/reviews?product=" + encodeURIComponent(box.dataset.cfRv) + "&sort=newest&size=20").then(function (r) {
        var items = (r && r.reviews) || [];
        if (!items.length || !box.isConnected) return;
        box._rx.real = items.map(rxReal); box._rx.summary = (r && r.summary) || null;
        rxDraw(box);
        // The rating under the product name, from published customer reviews only.
        var s = rxSummary(box._rx), count = s.n + " review" + (s.n === 1 ? "" : "s"), html = starsOf(Math.round(s.avg)) + "<span>" + count + "</span>";
        var link = document.querySelector("#main .p2-buy-rating"), h1 = document.querySelector("#main .p2-buy h1");
        if (link) link.innerHTML = html; else if (h1) h1.insertAdjacentHTML("beforebegin", '<a class="p2-buy-rating" href="#p2-reviews">' + html + "</a>");
      }).catch(function () {});
    });
  }
  function rxBox(el) { var b = el.closest("[data-cf-rv]"); return b && b._rx ? b : null; }
  function rxLight(photos, i, opener) {
    var d = document.getElementById("cf-rx-dlg");
    if (!d) { d = document.createElement("dialog"); d.id = "cf-rx-dlg"; d.className = "cf-rx-dlg"; d.setAttribute("aria-label", "Customer photo"); document.body.appendChild(d);
      d.addEventListener("click", function (e) { if (e.target === d || e.target.closest("[data-cf-rx-close]")) d.close(); });
      d.addEventListener("close", function () { if (d._opener) d._opener.focus(); }); }
    var x = photos[i];
    d._opener = opener;
    d.innerHTML = '<div class="cf-rx-dlg-in"><button type="button" class="cf-rx-dlg-x" data-cf-rx-close aria-label="Close">×</button><img src="/api/review-media/' + esc(x.m.id) + '" alt="Customer photo from ' + esc(x.r.name) + '">' +
      '<div class="cf-rx-dlg-t">' + rxStars(x.r.rating) + (x.r.title ? "<b>" + esc(x.r.title) + "</b>" : "") + "<p>" + esc(x.r.text) + "</p><small>" + esc(x.r.name) + (x.r.when ? " · " + esc(x.r.when) : "") + "</small></div></div>";
    if (!d.open) d.showModal();
  }
  document.addEventListener("click", function (e) {
    if (!focus() || !e.target.closest) return;
    var t = e.target.closest("[data-cf-rx-star], [data-cf-rx-topic], [data-cf-rx-clear], [data-cf-rx-more], [data-cf-rx-photo], [data-cf-rx-rphoto], [data-cf-rx-scroll]"); if (!t) return;
    var box = rxBox(t); if (!box) return; var st = box._rx;
    if (t.hasAttribute("data-cf-rx-star")) { var k = +t.dataset.cfRxStar; st.star = st.star === k ? 0 : k; st.limit = 5; rxDraw(box, "list"); }
    else if (t.hasAttribute("data-cf-rx-topic")) { var k2 = t.dataset.cfRxTopic; st.topic = st.topic === k2 ? "" : k2; st.limit = 5; rxDraw(box, "list"); }
    else if (t.hasAttribute("data-cf-rx-clear")) { st.star = 0; st.topic = ""; rxDraw(box, "list"); var h = box.querySelector("#cf-rx-list-t"); if (h) { h.tabIndex = -1; h.focus(); } }
    else if (t.hasAttribute("data-cf-rx-more")) { st.limit += 5; rxDraw(box, "list"); }
    else if (t.hasAttribute("data-cf-rx-scroll")) { var strip = box.querySelector("[data-cf-rx-strip]"); if (strip) strip.scrollBy({ left: +t.dataset.cfRxScroll * strip.clientWidth * .8, behavior: "smooth" }); }
    else {
      var ph = []; st.real.forEach(function (r) { r.media.forEach(function (m) { ph.push({ m: m, r: r }); }); });
      var i = t.hasAttribute("data-cf-rx-photo") ? +t.dataset.cfRxPhoto : ph.findIndex(function (x) { return x.r.key === t.dataset.cfRxRphoto && x.r.media.indexOf(x.m) === +t.dataset.i; });
      if (ph[i]) rxLight(ph, i, t);
    }
  });
  document.addEventListener("change", function (e) {
    var s = focus() && e.target.closest && e.target.closest("[data-cf-rx-sort]"); if (!s) return;
    var box = rxBox(s); if (!box) return; box._rx.sort = s.value; box._rx.limit = 5; rxDraw(box, "list");
    var again = box.querySelector("[data-cf-rx-sort]"); if (again) again.focus();
  });
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
    // The panel sits at the top of the reviews column, which is usually above the screen by the time the button is reached.
    var at = panel.getBoundingClientRect();
    if (at.top < 90 || at.top > innerHeight - 120) panel.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    A().api("/reviews/eligibility?product=" + encodeURIComponent(id)).then(function (r) {
      var st = r && r.state;
      if (st === "eligible") { rvForm(panel, id, r.order_id); var first = panel.querySelector("input[name=rating]"); if (first) first.focus({ preventScroll: true }); }
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


  /* The visual product page (17 Nov 2026, owner's note). Content Focus only, and only for the products listed in VIS:
     Omega-3 Fish Oil first, then the other six (18 Nov 2026). Same content and positions as before, shown as graphics where a
     graphic says it faster: the product's own figures under the description headline,
     the four questions as cards, the label claim as tiles, the directions as a dose strip, and the cautions as lists. The word
     "MRP" is not shown. A product with no entry here keeps the page it had.
     Every number is the label's (web/label-records.json) or the Version E workbook's (PRODUCTS / USE above). The description
     figures, each optional: versus (the owner's Omega-3 comparison; no other product has one), ratio (two amounts as pills),
     win (the time around a dose), rda (amounts against the ICMR RDA the label prints) and inside (a stacked bar of one serving). */
  var ICON = {
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    brain: '<path d="M12 6.5A2.5 2.5 0 0 0 7 6.6 3 3 0 0 0 5 9.5c0 .9.4 1.7 1 2.2A3 3 0 0 0 7 16.8v.7a2.5 2.5 0 0 0 5 0v-11zM12 6.5a2.5 2.5 0 0 1 5 .1 3 3 0 0 1 2 2.9c0 .9-.4 1.7-1 2.2a3 3 0 0 1-1 5.1v.7a2.5 2.5 0 0 1-5 0"/>',
    joint: '<path d="M17 10c.7-.7 1.7 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .8.7 1.8 0 2.5l-7 7c-.7.7-1.7 0-2.5 0a2.5 2.5 0 0 0 0 5c.3 0 .5.2.5.5a2.5 2.5 0 1 0 5 0c0-.8-.7-1.8 0-2.5z"/>',
    muscle: '<path d="M6 7v10M18 7v10M3 9.5v5M21 9.5v5M6 12h12"/>',
    gauge: '<path d="M12 14l4-4M3.3 19a10 10 0 1 1 17.4 0"/>',
    drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
    bolt: '<path d="M13 2 4 14h8l-1 8 9-12h-8z"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    scale: '<path d="M12 3v18M7 21h10M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2M2 16l3-8 3 8a5 5 0 0 1-6 0zM16 16l3-8 3 8a5 5 0 0 1-6 0z"/>',
    cycle: '<path d="M3 12a9 9 0 0 1 15.7-6L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.7 6L3 16M8 16H3v5"/>',
    gut: '<path d="M9 3v3.5c0 1.8-3 2.6-3 6.5a7 7 0 0 0 7 7h1a5 5 0 0 0 5-5c0-3.3-3.3-4.1-5.3-2.8-1.4.9-2.7.2-2.7-1.5V3"/>',
    calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 15.5l2 2 4-4"/>',
    softgel: '<rect x="8" y="3" width="8" height="18" rx="4"/>',
    capsule: '<path d="M10.5 20.5l-7-7a5 5 0 1 1 7-7l7 7a5 5 0 1 1-7 7zM7 7l3.5 3.5"/><path d="M8.5 8.5l7 7"/>',
    chew: '<circle cx="12" cy="12" r="8"/><path d="M8 12h8"/>',
    plate: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
    glass: '<path d="M5 3h14l-2 18H7zM6 8h12"/>',
    food: '<path d="M3 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3zm0 0v7"/>'
  };
  function icon(k) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICON[k] || "") + "</svg>"; }
  // Shorter notes, the same on every visual page. The pack note becomes the pack size (from the catalogue).
  /* Copy review 02 (20 Nov 2026, owner: "Yes, apply those"): the batch block says what it proves and what the reader does
     (Part 2's words are still "lot" here; the lot→batch swap runs later), and the figures share one explainer line. */
  var VIS_SWAP = [
    ["Check the lot printed on your pack.", "Tested, batch by batch."],
    ["A lot report describes what was tested from one production lot. Records appear as reports are published.", "Type the Batch No. from your bottle to see its lab report."],
    ["Demonstration only. Try", "Demo: try"], [", or open", ", or see"],
    REVIEW_NOTE,
    ["We deliver across India. If we can’t reach your pincode, we tell you before you pay. Delivery dates are estimates.", "All-India delivery. We confirm your pincode before you pay."]
  ];
  var PACK_NOTE = "2 bottles save 5%, 3 save 10%. The saving is applied in your bag.";
  var ROW = "Each row is part of the row above it.";
  /* says: the figures say the support sentence in full, so it is kept for screen readers only (unless the admin rewrote it).
     daily: how many a day, from the label's directions, for the pack note ("60 softgels a bottle, 1 a day."). */
  var VIS = {
    "omega-3-fish-oil": {
      // The owner's graphic (17 Nov 2026): three regular softgels against one of ours.
      versus: [[3, "266.7 mg each", "3 regular softgels"], [1, "800 mg", "1 Body Café Co. softgel"], "For 800 mg of omega-3"],
      // The label's numbers: 1,000 mg of oil, 800 mg omega-3, 400 mg EPA, 300 mg DHA. [name, mg], then the omega-3 total.
      inside: ["Inside one softgel", [["Anchovy fish oil", 1000, 0], ["Omega-3", 800, 1], ["EPA", 400, 2], ["DHA", 300, 2]], ROW],
      says: true,
      supports: [["heart", "Heart health"], ["brain", "Brain health"], ["joint", "Joint health"]],
      dose: [["softgel", "1 softgel"], ["sun", "Daily, in the morning"], ["food", "With food"]], daily: "1 a day"
    },
    "vitamin-d3-k2": {
      // Label: D3 600 IU and K2 55 mcg, each 100% RDA (ICMR 2020, men moderate work); 250 mg oil with 200 mg omega-3, EPA 100 mg, DHA 75 mg.
      rda: ["Inside one softgel", [["Vitamin D3", "600 IU", 100], ["Vitamin K2 as MK-7", "55 mcg", 100]], "RDA as per ICMR guidelines 2020 (men, moderate work)."],
      inside: ["The oil it’s dissolved in", [["Anchovy fish oil", 250, 0], ["Omega-3", 200, 1], ["EPA", 100, 2], ["DHA", 75, 2]], ROW],
      says: true,
      supports: [["joint", "Bone health"], ["muscle", "Muscle health"], ["heart", "Heart health"]],
      dose: [["softgel", "1 softgel"], ["sun", "Daily, in the morning"], ["food", "With food"]], daily: "1 a day"
    },
    "creatine-chews": {
      supports: [["muscle", "Strength"], ["gauge", "Performance"]],
      dose: [["chew", "Chew 2 tablets"], ["clock", "Once a day, same time"], ["food", "With or without food"]], daily: "2 a day"
    },
    "iron-bisglycinate": {
      // Label directions: on an empty stomach; no milk for 2 hours before or after (the workbook's decision adds chai).
      win: ["Around your capsule", "2 hours before", "2 hours after", "No milk or chai", "1 capsule, empty stomach"],
      rda: ["Against the ICMR RDA", [["Elemental iron", "29 mg", 100]], "RDA as per ICMR guidelines 2020 (women, moderate work)."],
      says: true,
      supports: [["drop", "Hemoglobin formation"], ["bolt", "Energy metabolism"]],
      dose: [["capsule", "1 capsule"], ["sun", "Daily, in the morning"], ["plate", "On an empty stomach"]], daily: "1 a day"
    },
    "l-theanine": {
      supports: [["leaf", "Calm mind"], ["target", "Clear focus"]],
      dose: [["capsule", "1 capsule"], ["sun", "Daily, in the morning"], ["food", "With or without food"]], daily: "1 a day"
    },
    "myo-d-chiro-inositol": {
      ratio: [[40, "2,000 mg", "Myo-inositol"], [1, "50 mg", "D-chiro-inositol"], "40 parts myo to 1 part D-chiro, in every serving"],
      says: true,
      supports: [["scale", "Hormonal balance"], ["cycle", "Metabolic balance"]],
      dose: [["capsule", "3 capsules"], ["sun", "In the morning"], ["food", "With food"]], daily: "3 a day"
    },
    "psyllium-husk": {
      // Label: 2,000 mg husk giving 1,578 mg dietary fibre, 1,362 mg of it soluble. The other two parts are the differences.
      inside: ["Inside one serving (5 capsules)", [["Psyllium husk (isabgol)", 2000, 0], ["Dietary fibre", 1578, 1], ["Soluble fibre", 1362, 2]], ROW],
      says: true,
      supports: [["gut", "Digestive health"], ["calendar", "Regularity"]],
      dose: [["capsule", "5 capsules"], ["moon", "Once a day, at night"], ["glass", "With food and a full glass of water"]], daily: "5 a night"
    }
  };
  function num(n) { return Number(n).toLocaleString("en-IN"); }
  function tiles(list, label) {
    return '<ul class="cf-tiles" style="--n:' + list.length + '"' + (label ? ' aria-label="' + esc(label) + '"' : "") + ">" + list.map(function (t) { return "<li><i>" + icon(t[0]) + "</i><span>" + esc(t[1]) + "</span></li>"; }).join("") + "</ul>";
  }
  // The description figures, in order; each is a picture of facts the page also gives in words, hidden from screen readers when `says`.
  function figures(v, hide) {
    var out = [], img = function (label) { return hide ? ' aria-hidden="true"' : ' role="img" aria-label="' + esc(label) + '"'; };
    var pills = function (n) { return '<span class="cf-vs-pills" aria-hidden="true">' + new Array(n + 1).join("<i></i>") + "</span>"; };
    var side = function (x, cls) { return '<div class="cf-vs-side' + cls + '">' + pills(x[0]) + "<b>" + esc(x[1]) + "</b><span>" + esc(x[2]) + "</span></div>"; };
    if (v.versus) {
      var a = v.versus;
      out.push('<figure class="cf-vs is-versus"><figcaption>' + esc(a[2]) + "</figcaption>" + side(a[0], "") + '<div class="cf-vs-mid" aria-hidden="true"><em>or</em></div>' + side(a[1], " is-us") + "</figure>");
    }
    if (v.ratio) {
      var r = v.ratio;
      out.push('<figure class="cf-vs is-ratio"' + img(r[0][0] + " parts " + r[0][2] + " to " + r[1][0] + " part " + r[1][2] + ": " + r[0][1] + " and " + r[1][1]) + ">" + side(r[0], " is-us") + '<div class="cf-vs-mid" aria-hidden="true"><em>:</em></div>' + side(r[1], " is-two") + "<figcaption>" + esc(r[2]) + "</figcaption></figure>");
    }
    if (v.win) {
      var w = v.win;
      out.push('<figure class="cf-win"' + img(w[4] + ". " + w[3] + ", " + w[1] + " and " + w[2] + ".") + '><p class="cf-in-k">' + esc(w[0]) + "</p>" +
        '<div class="cf-win-track"><span class="cf-win-zone"><b>' + esc(w[3]) + "</b><small>" + esc(w[1]) + '</small></span><span class="cf-win-dose"><i>' + icon("capsule") + "</i></span>" +
        '<span class="cf-win-zone"><b>' + esc(w[3]) + "</b><small>" + esc(w[2]) + '</small></span></div><p class="cf-win-mid">' + esc(w[4]) + "</p></figure>");
    }
    if (v.rda) {
      var d = v.rda;
      out.push('<div class="cf-rda"' + img(d[1].map(function (x) { return x[0] + " " + x[1] + ", " + x[2] + "% of the RDA"; }).join("; ") + ". " + d[2]) + '><p class="cf-in-k">' + esc(d[0]) + "</p><ul>" +
        d[1].map(function (x) { return '<li><span class="cf-rda-n">' + esc(x[0]) + "</span><b>" + esc(x[1]) + '</b><span class="cf-rda-m"><i style="width:' + Math.min(100, x[2]) + '%"></i></span><small>' + x[2] + "% RDA</small></li>"; }).join("") +
        '</ul><p class="cf-rda-note">' + esc(d[2]) + "</p></div>");
    }
    if (v.inside) {
      // One serving, row by row: each indented row is part of the row above it; the bars share one scale (the first row).
      var ins = v.inside, all = ins[1][0][1];
      out.push('<div class="cf-in cf-bd"' + img(ins[0] + ": " + ins[1].map(function (x) { return x[0] + " " + num(x[1]) + " mg"; }).join(", ") + ". " + ins[2]) + '><p class="cf-in-k">' + esc(ins[0]) + "</p><ul>" +
        ins[1].map(function (x) { return '<li class="d' + x[2] + '"><span class="cf-rda-n">' + esc(x[0]) + "</span><b>" + num(x[1]) + ' mg</b><span class="cf-rda-m"><i style="width:' + (x[1] / all * 100).toFixed(1) + '%"></i></span></li>'; }).join("") +
        '</ul><p class="cf-rda-note">' + esc(ins[2]) + "</p></div>");
    }
    return out.join("");
  }
  page("product", function (root, args) {
    var id = args[1] && args[1].id, v = VIS[id], grid = root.querySelector(".p2-pdp-grid");
    if (!v || !grid) return;
    grid.classList.add("cf-vis");
    var pack = String(args[1].pack_size || "").trim();
    swap(root, VIS_SWAP.concat(pack ? [[PACK_NOTE, pack + " a bottle" + (v.daily ? ", " + v.daily : "") + "."]] : []));
    // "MRP" goes; the space it held stays, so the three pack cards keep their lines level.
    [].forEach.call(root.querySelectorAll(".pk-save.is-mrp"), function (n) { n.innerHTML = "&nbsp;"; n.setAttribute("aria-hidden", "true"); });
    // Owner, 18 Nov 2026: each pack card gives its servings (60, 120, 180 for a 60-serving bottle) where it said 1, 2 or 3 bottles.
    var serv = parseInt(args[1].servings_per_pack, 10);
    if (serv > 0) [].forEach.call(root.querySelectorAll(".pk-card"), function (c) {
      var n = [].filter.call(c.querySelectorAll(".pk-n, .pk-days"), function (x) { return /\bbottles?$/.test(x.textContent); })[0];
      if (n) n.textContent = serv * +c.dataset.pkQ + " servings";
    });
    // Owner, 17 Nov 2026: the rating sits at the right end of the pack-size and diet line; "Best value" goes
    // (the Save chip takes its place on the card's top edge, in the style sheet); and there is no − n + stepper: the pack
    // cards choose 1, 2 or 3 bottles.
    var chips = root.querySelector(".p2-buy-chips"), rating = root.querySelector(".p2-buy > .p2-buy-rating");
    if (chips && rating) chips.appendChild(rating);
    [].forEach.call(root.querySelectorAll(".pk-flag, .p2-buy .cf-qty, .p2-buy-chips .p2-chip"), function (n) { n.remove(); });
    // Buy card (owner, 19 Nov 2026): the name is the first thing read, so under it is only the claim, as a plain line, and the
    // amounts line goes (the description figures and the label facts give the amounts). A line the admin rewrote stays.
    var forK = root.querySelector(".p2-buy .cf-for-k"); if (forK) forK.remove();
    var how = root.querySelector(".p2-buy .cf-for-how");
    if (how && how.textContent.trim() === BASE.U[id][3]) how.remove();
    // Description: the product's figures under the headline, then the four questions as cards.
    var h = root.querySelector(".p2-pdp-accs .p2-acc-h"), body = h && h.parentNode;
    if (body) {
      var sup = body.querySelector(".cf-support");
      // When the figures say the support line in full, the sentence is kept for screen readers only, unless the admin rewrote it.
      var hide = !!(v.says && sup && sup.textContent.trim() === BASE.P[id].support);
      if (hide) sup.classList.add("sr-only");
      h.insertAdjacentHTML("afterend", figures(v, hide));
      var qs = [].slice.call(body.querySelectorAll(".cf-q"));
      if (qs.length) {
        var wrap = document.createElement("div"); wrap.className = "cf-why"; body.insertBefore(wrap, qs[0]);
        qs.forEach(function (q) { var c = document.createElement("div"), p = q.nextElementSibling; wrap.appendChild(c); c.appendChild(q); if (p && p.tagName === "P") c.appendChild(p); });
      }
    }
    // Key benefits: the label claim as tiles (only while the claim is the label's own line).
    var claim = root.querySelector(".p2-pdp-accs .p2-claim");
    if (claim && claim.textContent.trim().toLowerCase() === BASE.U[id][0].toLowerCase()) claim.outerHTML = '<p class="cf-tiles-k">Supports</p>' + tiles(v.supports, claim.textContent.trim());
    // Directions: the dose as a strip in place of the food tag; the label's sentence stays under it.
    var use = root.querySelector(".p2-use"), food = root.querySelector(".cf-food");
    if (use) { if (food) food.remove(); use.insertAdjacentHTML("beforebegin", tiles(v.dose, "How to take it")); }
    // Allergens, cautions and storage: one sentence to a line.
    [].forEach.call(root.querySelectorAll(".cf-care dd"), function (dd) {
      var parts = dd.textContent.trim().split(/\.\s+/).filter(Boolean).map(function (x) { return /\.$/.test(x) ? x : x + "."; });
      if (parts.length > 1) dd.innerHTML = "<ul>" + parts.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
    });
  });


  /* Fewer words in the Learn guides and the Help library (owner, 19 Nov 2026: no paragraph past three lines on a phone).
     Their text is shared data (web/learn-content.js, web/site.js, web/support-content.js) with glossary links written
     inside it, so it is shortened in the data itself, once, the first time a Content Focus page renders. The design is fixed
     for a page load (web/app.js), so Part 2, the other designs and Barista's knowledge (built from the files) keep the long
     text. Each entry is [where, how the original starts, the short text]; an entry whose original no longer starts that way
     is skipped, so an edited source line is never covered by a stale one. Where: P.<product>… (Learn product guides),
     G.<guide>… (the five foundation guides), A.<help article>… (the Help library), L.<key> (the Learn content itself).
     Facts are unchanged. Label wording, legal statements, source lists and the safety meaning of every caution stay. */
  var SHORT_DATA = [
    // The care note in every product guide.
    ["L.CARE", "If you have a health condition", "Health condition, pregnancy or medication? Ask a health professional first. Not personal advice."],
    // The "fictional example" tags on the worked examples.
    ["G.reading-a-label.example.note", "Fictional example for reading", "Made-up example for practice. Not a Body Café Co. product."],
    ["G.ingredient-forms.example.note", "Fictional example for reading", "Made-up example for practice. Not our products or amounts."],
    ["G.serving-sizes.example.note", "Fictional example for reading", "Made-up example for practice. Not a Body Café Co. product."],
    ["G.understanding-reports.example.note", "Fictional example for reading", "Made-up example for practice. Not a Body Café Co. result."],
    ["G.understanding-evidence.example.note", "General guide for reading claims", "A guide to reading claims. Not about any Body Café Co. product."],
    // Reading a label
    ["G.reading-a-label.opening", "A supplement label is a short", "A label tells you what you’re taking, how much, and what to watch for. This works for any label, not only ours."],
    ["G.reading-a-label.sections.0.html", "<p>Every amount on a label refers", "<p>Every amount refers to a serving, and a serving can be more than one unit. Compare like with like.</p><p>The serving comes from the label’s directions, not the front of the pack.</p>"],
    ["G.reading-a-label.sections.1.html", "<p>The headline on the front", "<p>The ingredient list names each form, which changes how much active ingredient a weight holds. See <a href=\"/learn/ingredient-forms\">ingredient forms</a>.</p><p>Shells, softgel materials and sweeteners should be listed too.</p>"],
    ["G.reading-a-label.sections.2.html", "<p>In India, health supplements", "<p>FSSAI regulates health supplements in India. The label must carry, among other things:</p><ul><li>the words <strong>“HEALTH SUPPLEMENT”</strong>;</li><li>the amount of each nutrient or substance with a nutritional or physiological effect;</li><li>the advisory <strong>“NOT FOR MEDICINAL USE”</strong>, displayed prominently;</li><li>where applicable, % of the ICMR daily allowance, with “Not to exceed the recommended daily usage”;</li><li>a statement that the product isn’t a substitute for a varied diet;</li><li>warnings, precautions, side effects, contraindications and interactions, as applicable;</li><li>a statement to store it out of the reach of children.</li></ul><p>A supplement can’t claim to prevent, treat or cure a disease. If one does, treat it as a warning sign.</p><p class=\"bcc-aside\">A reading aid, not a legal assessment. Check the current regulations for anything you rely on.</p>"],
    ["G.reading-a-label.sections.3.html", "<p>Directions tell you how much", "<p>Directions: how much and how often. Warnings: who should take care. Allergens: what it contains. Read all three first.</p><p>Health condition, pregnancy, breastfeeding or medication? Ask a health professional first.</p>"],
    ["G.reading-a-label.sections.4.html", "<p>Your pack's lot number", "<p>The Batch No. links your pack to its production batch. It isn’t the barcode or your order number. Use it to <a href=\"/reports\">look up a batch record</a>.</p>"],
    ["G.reading-a-label.example.reading", "Here the 20 mg refers", "The 20 mg is for two capsules, so one holds 10 mg. The compound is named, so you can check what the 20 mg means."],
    // Ingredient forms
    ["G.ingredient-forms.opening", "Two labels can name the same", "The same ingredient can come in different forms. The form changes what the number means."],
    ["G.ingredient-forms.sections.0.html", "<p>Minerals and some other", "<p>Minerals come bound to something else, so the compound’s weight isn’t the mineral’s weight.</p><p>NIH figures: ferrous fumarate is 33% iron, ferrous sulfate 20%, ferrous gluconate 12%. Creatine monohydrate is 88% creatine.</p>"],
    ["G.ingredient-forms.sections.1.html", "<p>Vitamin D can be stated", "<p>Vitamin D is given in mcg or IU. Per the NIH, 1 mcg equals 40 IU. Convert before you compare.</p>"],
    ["G.ingredient-forms.sections.2.html", "<p>Some vitamins come in several", "<p>Vitamin D comes as D2 or D3. Vitamin K comes as K1 or K2 (such as MK-4 or MK-7). A label should say which.</p>"],
    ["G.ingredient-forms.sections.3.html", "<p>For fish oil, the amount", "<p>Oil and omega-3 are different numbers. A typical 1,000 mg fish oil has about 180 mg EPA and 120 mg DHA (NIH).</p><p>Omega-3 comes as triglycerides, ethyl esters and other forms. Look for EPA and DHA, stated separately.</p>"],
    ["G.ingredient-forms.sections.4.html", "<p>For a formula with several", "<p>With several ingredients, compare each one: form, amount, unit, serving. Missing one? No fair comparison.</p>"],
    ["G.ingredient-forms.example.reading", "These numbers can't be compared", "These can’t be compared yet: A gives the compound’s weight, B the elemental amount, and the servings differ."],
    // Serving sizes
    ["G.serving-sizes.opening", "Three numbers do most", "Three numbers do the work: serving size, amount per serving and unit. Read them together."],
    ["G.serving-sizes.sections.0.html", "<p>Every amount on a label is an", "<p>Every amount is an {{amount-per-serving|amount per serving}}. If the {{serving-size|serving size}} is two capsules, one capsule holds half.</p><p>The serving comes from the directions, not the front of the pack.</p>"],
    ["G.serving-sizes.sections.1.html", "<p>Amounts are usually in grams", "<p>1 g is 1,000 mg; 1 mg is 1,000 mcg. So 0.5 mg and 500 mcg are the same.</p><p>For vitamin D, 1 mcg equals 40 {{iu|IU}} (NIH). Convert before comparing.</p>"],
    ["G.serving-sizes.sections.2.html", "<p>The pack count tells you", "<p>Units in the pack ÷ units per serving = {{servings-per-pack|servings per pack}}. 60 capsules at two a serving make 30 servings.</p><p>That’s arithmetic, not a recommendation. Follow the directions.</p>"],
    ["G.serving-sizes.sections.3.html", "<p>Under FSSAI's health supplement", "<p>A label may give a % of the ICMR daily allowance. Read it next to the amount and serving it refers to.</p>"],
    ["G.serving-sizes.sections.4.html", "<p>Format changes what a unit is", "<p>A serving can be several chews, softgels or capsules. For chews, check the sugar too.</p>"],
    // Understanding evidence
    ["G.understanding-evidence.opening", "“Backed by research”", "“Backed by research”, “tested”, “certified”: each is a different kind of evidence. Here’s which is which."],
    ["G.understanding-evidence.sections.0.html", "<p>Ingredient research, finished", "<ul><li><strong>Research</strong> studies an ingredient.</li><li><strong>Testing</strong> checks a product.</li><li>{{certification|Certification}} checks against a standard.</li><li>A <strong>batch report</strong> covers one batch.</li></ul>"],
    ["G.understanding-evidence.sections.1.html", "<p>An {{observational", "<ul><li>An {{observational|observational study}} shows links, not cause.</li><li>A {{rct|randomised controlled trial}} tests cause and effect.</li><li>A {{systematic-review|systematic review}} weighs all the trials on a question.</li></ul><p>Results hold for the people, form and amount studied, not beyond.</p>"],
    ["G.understanding-evidence.sections.2.html", "<p>Research on an ingredient tells", "<p>Ingredient research describes that ingredient, not a finished product. So we don’t turn research into promises.</p>"],
    ["G.understanding-evidence.sections.3.html", "<p>Testing a finished product", "<p>Testing checks what’s in a product, not what it does in your body. Read any certification’s scope, issuer and date.</p><p>Body Café Co. doesn’t claim any certification.</p>"],
    ["G.understanding-evidence.sections.4.html", "<p>Under FSSAI's health supplement", "<p>A supplement can’t claim to prevent, treat or cure a disease. Treat that promise as a warning sign.</p>"],
    // Batch reports
    ["G.understanding-reports.opening", "“Tested” can mean almost", "A good batch report is specific: which batch, which sample, which tests, which limits. Here’s how to read one."],
    ["G.understanding-reports.sections.0.html", "<p>A product is a recipe", "<p>Product: the recipe. Batch: one production run. Sample: the part tested. A report should name all three.</p>"],
    ["G.understanding-reports.sections.2.html", "<p>A number on its own", "<p>Read each result with its unit and limit. “Not detected” means little without the detection level.</p>"],
    ["G.understanding-reports.sections.3.html", "<p>A lot report describes", "<p>A report covers one sample at one time. It doesn’t predict results for you or prove a pack is genuine.</p>"],
    ["G.understanding-reports.sections.4.html", "<p>When you look up a lot", "<ul><li><strong>Batch found</strong>: it belongs to your product.</li><li><strong>No matching batch</strong>: usually a typo or the wrong product.</li><li><strong>Not published yet</strong>: not ready to view. No pass or fail.</li><li><strong>Withdrawn</strong>: off sale. Follow the steps shown.</li></ul>"],
    ["G.understanding-reports.example.reading", "“Not detected” is only", "“Not detected” means something only with the detection level. The limit says what the result is judged against."],
    // Product guides
    ["P.iron-bisglycinate.minute", "Iron bisglycinate is iron bound", "Iron bound to glycine. On any iron label, find the elemental iron. Ours: 29 mg per capsule, as Ferrochel®."],
    ["P.iron-bisglycinate.what", "<p>Iron is a mineral.", "<p>Iron is part of hemoglobin, which carries oxygen (NIH). In supplements it’s bound, here as a {{chelate|chelate}}.</p>"],
    ["P.iron-bisglycinate.name", "<p><strong>“Bis-”</strong>", "<p><strong>“Bis-”</strong> means two; <strong>“glycinate”</strong> is glycine, an {{amino-acid|amino acid}}. Iron bound to two glycines.</p><p>So the compound’s weight isn’t the iron’s. Look for the {{elemental|elemental}} iron.</p>"],
    ["P.iron-bisglycinate.label.3.1", "Iron products carry warnings", "Read the warnings and storage in full on the label, including keeping it away from children."],
    ["P.iron-bisglycinate.caution", "The NIH Office of Dietary Supplements notes that accidental", "Iron overdose is a leading cause of fatal poisoning in children under 6 (NIH). Keep it out of their reach."],
    ["P.iron-bisglycinate.faq.0.1", "No. Iron bisglycinate is a compound", "No. Only part of the compound’s weight is iron. Look for the elemental iron."],
    ["P.iron-bisglycinate.faq.1.1", "Our label states 29 mg", "29 mg elemental iron per capsule, as Ferrochel® ferrous bisglycinate chelate. One capsule is a serving."],
    ["P.l-theanine.minute", "L-theanine is an amino acid", "An amino acid found in the tea plant. Look for the amount per serving. Ours: 200 mg per capsule."],
    ["P.l-theanine.what", "<p>L-theanine is a non-protein", "<p>A non-protein {{amino-acid|amino acid}}, found in the tea plant, <em>Camellia sinensis</em>. It adds to tea’s taste.</p>"],
    ["P.l-theanine.name", "<p>The “theanine” part", "<p>“Theanine” comes from tea (<em>thea</em>). The {{l-form|“L-”}} marks one of two mirror-image forms. You may see just “theanine”.</p>"],
    ["P.l-theanine.faq.0.1", "No. Both occur in tea", "No. Both are in tea, but they’re different compounds."],
    ["P.vitamin-d3-k2.minute", "This formula has three named parts", "Three parts, read one by one. Ours per softgel: 600 IU D3, 55 mcg K2 (MK-7), 200 mg omega-3."],
    ["P.vitamin-d3-k2.what", "<p>Vitamin D and vitamin K are", "<p>Three distinct ingredients: vitamin D3, vitamin K2 and omega-3 in {{triglyceride|triglyceride form}}. Read each on its own.</p>"],
    ["P.vitamin-d3-k2.name", "<p><strong>Vitamin D3</strong>", "<p><strong>D3</strong> is {{cholecalciferol|cholecalciferol}}; the other form is D2.</p><p><strong>K2</strong> is a family of {{menaquinone|menaquinones}}. A label should name one, such as MK-7.</p><p>Vitamin D is in mcg or {{iu|IU}} (1 mcg = 40 IU). Vitamin K is in mcg.</p>"],
    ["P.vitamin-d3-k2.caution", "The NIH Office of Dietary Supplements advises", "Taking warfarin or a similar anticoagulant? Ask your doctor first: vitamin K intake needs to stay steady (NIH)."],
    ["P.vitamin-d3-k2.faq.0.1", "Both contain omega-3s", "Both have omega-3, but the formulas differ. Ours: 250 mg anchovy oil per softgel, giving 200 mg omega-3."],
    ["P.omega-3-fish-oil.minute", "With fish oil, the amount", "Oil and omega-3 are different numbers. Ours: 800 mg omega-3 in 1,000 mg of oil."],
    ["P.omega-3-fish-oil.what", "<p>Fish oil is an oil", "<p>Fish oil carries omega-3s. The main ones are ALA, EPA and DHA (NIH); EPA and DHA are the ones in fish oil.</p>"],
    ["P.omega-3-fish-oil.name", "<p>{{epa-dha|EPA and DHA}}", "<p>{{epa-dha|EPA and DHA}} are named for their structure. A typical 1,000 mg fish oil has 180 mg EPA and 120 mg DHA (NIH).</p><p>So “1,000 mg fish oil” alone doesn’t tell you the omega-3.</p>"],
    ["P.omega-3-fish-oil.allergen", "Omega-3 Fish Oil comes from fish", "From anchovy (Engraulis ringens). Contains gelatin, fish oil and soy."],
    ["P.myo-d-chiro-inositol.minute", "Myo-inositol and D-chiro-inositol are two", "Two forms of inositol, each with its own amount. Ours: 2,000 mg myo and 50 mg D-chiro per 3 capsules: 40:1."],
    ["P.myo-d-chiro-inositol.what", "<p>Inositol is a carbocyclic", "<p>Inositol is a sugar alcohol. Myo- and D-chiro-inositol are two of its forms, stored in organs such as the liver.</p>"],
    ["P.myo-d-chiro-inositol.name", "<p>Inositol's hydroxyl groups", "<p>Inositol has nine {{stereoisomer|stereoisomers}}; “myo-” and “D-chiro-” are two. Compare both amounts, not just the total.</p><p>A <strong>ratio</strong> like 40:1 should match the two amounts.</p>"],
    ["P.myo-d-chiro-inositol.faq.0.1", "Our label states myo-inositol", "2,000 mg myo-inositol and 50 mg D-chiro-inositol per 3 capsules. 2,000 ÷ 50 = 40:1."],
    ["P.creatine-chews.minute", "Creatine is a compound", "Check the form, amount per serving and what else is in a chew. Ours: 3,000 mg per 2 chews."],
    ["P.creatine-chews.what", "<p>Creatine is made in the body", "<p>The body makes creatine in the liver and kidneys and stores most of it in muscle (NIH). Diet adds a little.</p>"],
    ["P.creatine-chews.name", "<p>Creatine comes in several forms", "<p>{{creatine-monohydrate|Creatine monohydrate}} is the most studied form, 88% creatine by weight.</p><p>If a {{serving-size|serving}} is two chews, each chew holds half.</p>"],
    ["P.psyllium-husk.minute", "Psyllium husk is the seed coat", "The seed coat of Plantago ovata, a source of fibre. Check the serving, the fibre per serving and the directions."],
    ["P.psyllium-husk.what", "<p>{{husk|Psyllium husk}}", "<p>{{husk|Psyllium husk}}, or ispaghula husk, is the seed coat of <em>Plantago ovata</em> (European Medicines Agency).</p>"],
    ["P.psyllium-husk.name", "<p>“Psyllium” and “ispaghula”", "<p>Psyllium and ispaghula are the same plant material: the seed coat of <em>Plantago ovata</em>.</p><p>On a fibre product, read the husk and the fibre it gives as two numbers.</p>"],
    ["P.psyllium-husk.caution", "Fibre products usually come", "Follow the label’s water directions exactly. Ours: 5 capsules at night, with food and a full glass of water."],
    ["P.psyllium-husk.faq.1.1", "Read the directions and cautions", "Read the directions on the product page and your pack. Ours: with food and a full glass of water."],
    // The Help library (answer = the line under the question; body.n = the paragraphs after it)
    ["A.track-order.body.0", "Every order has a page", "Your order page shows each step: created, paid, shipped, delivered. Once shipped, the tracking number appears there."],
    ["A.track-order.body.1", "Ordered as a guest?", "Ordered as a guest? Sign in with your checkout mobile number, and orders from that browser join your account."],
    ["A.guest-order.answer", "In the same browser", "It’s under Account in the same browser. Sign in with your checkout mobile number to keep it."],
    ["A.guest-order.body.0", "Signing in uses a one-time code", "Sign-in uses a one-time code sent to your mobile. Orders with that number join your account."],
    ["A.cancel-order.answer", "You can cancel from the order page", "Cancel from the order page until it’s dispatched. You’ll see what happens to your payment first."],
    ["A.cancel-order.body.0", "Open the order and choose Cancel", "Open the order, choose Cancel order. Paid? Full refund. Payment still confirming? Check its status first."],
    ["A.cancel-order.body.1", "Once an order has been dispatched", "Once dispatched, it can’t be cancelled. Contact us, or see Returns & Refunds when it arrives."],
    ["A.change-order.answer", "Orders can’t be edited", "Orders can’t be edited. Before dispatch, cancel and reorder, or contact us to change the address."],
    ["A.delivery-areas.answer", "We deliver across India", "Across India, through our courier partners. Check your pincode in your bag or at checkout."],
    ["A.delivery-areas.body.0", "If our courier partners", "Can’t reach your pincode? We tell you before you pay. Delivery dates are estimates."],
    ["A.parcel-problem.answer", "Tell us from the order page", "Tell us from the order page or contact form, with your order reference. A photo helps but isn’t required."],
    ["A.parcel-problem.body.0", "Late or lost:", "Late or lost: we check with the courier. Damaged, wrong or late: you’re entitled to a refund or replacement."],
    ["A.change-address.answer", "Before dispatch, contact us", "Before dispatch, contact us with the order reference and new address. It changes once we confirm."],
    ["A.change-address.body.0", "After dispatch the courier", "After dispatch, the courier decides. We’ll ask them and tell you on your case."],
    ["A.something-wrong.answer", "Start a request from the order page", "Start from the order page: pick the item, what went wrong, and refund or replacement."],
    ["A.something-wrong.body.0", "Damaged, wrong, missing", "We always look at damaged, wrong, missing, faulty or expired items. A photo helps, but isn’t required."],
    ["A.something-wrong.body.1", "If you think a product", "Think a product made someone unwell? Report it as a safety concern, so it’s handled first."],
    ["A.change-of-mind.answer", "We don’t accept change-of-mind", "No change-of-mind returns. Damaged, wrong, missing, faulty or expired? Tell us within 7 days."],
    ["A.refund-status.body.0", "Refunds go back to the original", "Refunds go to your original payment method. UPI takes a few days; cards and net banking up to 7 business days more."],
    ["A.payment-methods.answer", "Pay online by UPI", "UPI, card, wallet or net banking, through Razorpay. No cash on delivery."],
    ["A.payment-unclear.answer", "Don’t pay again yet.", "Don’t pay again yet. Open the order and choose Check payment status."],
    ["A.payment-unclear.body.0", "If money left your account", "Charged but the order shows unpaid? Contact us with the order reference. Never send card or bank details."],
    ["A.gst-invoice.answer", "Yes. Every order comes with a tax invoice", "Yes, a tax invoice comes with every order. Add your GSTIN at checkout to have it on the invoice."],
    ["A.all-seven.body.0", "If you’re pregnant, breastfeeding", "Pregnant, breastfeeding, under medical care or unsure? Ask a healthcare professional first."],
    ["A.vegetarian.answer", "Five are vegetarian.", "Five are. Omega-3 Fish Oil and Vitamin D3 + K2 are non-vegetarian: fish oil in gelatin softgels."],
    ["A.vegetarian.body.0", "Creatine Chews, Iron Bisglycinate", "The other five carry the green vegetarian mark. Their labels say they may contain nuts."],
    ["A.when-to-take.answer", "Each label says when.", "Each label says when. Six are best in the morning, Psyllium Husk at night. Follow your pack."],
    ["A.when-to-take.body.2", "Creatine Chews: chew 2 tablets", "Creatine Chews: chew 2 tablets once a day, at one time you keep to. Don’t swallow them whole."],
    ["A.check-first.answer", "All seven are for adults only.", "All seven are for adults only. Pregnant, breastfeeding or under medical care? Ask a healthcare professional first."],
    ["A.product-question.answer", "Ask on the product page", "Ask on the product page or contact us. For your own health, please ask a doctor."],
    ["A.safety.answer", "Stop using it and report", "Stop using it and report a safety concern. Urgent? Contact a doctor or emergency services first."],
    ["A.your-data.answer", "Yes. Signed-in customers can download", "Yes. Download your data and make privacy requests from Profile & security."],
    ["A.lot-not-found.answer", "Check for letters that look", "Check look-alikes (O and 0, I and 1). Still not found? Ask us from the result page."]
  ];
  function shortenData() {
    if (shortenData.done) return; shortenData.done = true;
    var L = window.BCCLearnContent || {}, C = window.BCCSupportContent || {};
    SHORT_DATA.forEach(function (x) {
      var parts = x[0].split("."), root = parts.shift(), o = null, key;
      if (root === "L") o = L;
      else if (root === "P") o = L.PRODUCTS;
      else if (root === "G") { key = parts.shift(); var g = L.foundation && L.foundation(key); o = g && g === L.foundation(key) ? g : S.guides && S.guides[key]; } // a new guide, or the site.js one it copies
      else if (root === "A") { key = parts.shift(); o = (C.ARTICLES || []).filter(function (a) { return a.id === key; })[0]; }
      for (var i = 0; o && i < parts.length - 1; i++) o = o[parts[i]];
      var k = parts[parts.length - 1];
      if (o && typeof o[k] === "string" && o[k].indexOf(x[1]) === 0) o[k] = x[2];
      else if (window.console) console.warn("Content Focus: no short text for", x[0]);
    });
  }
  // Lines the Learn pages write themselves: two on every product guide (web/learn.js), one under the iron-forms chart (web/living-e-pages.js).
  page("learn", function (root) {
    swap(root, [
      ["Percentages from the NIH Office of Dietary Supplements iron fact sheet, cited in the iron guide. The same 100 mg of compound gives different amounts of iron, so compare the elemental amount.", "NIH figures. The same 100 mg of compound gives different amounts of iron, so compare the elemental amount."],
      ["Research summaries on this site are published only after specialist review, so this guide doesn't yet summarise findings or outcomes.", "Published only after specialist review."],
      ["Research on an ingredient describes that ingredient, in the form, amount and people studied. It isn't evidence about our finished product.", "Ingredient research isn’t evidence about our finished product."]
    ]);
  });

  var app = document.getElementById("app");
  if (app && "MutationObserver" in window) new MutationObserver(function () { dressBag(); dressReport(); dressSearch(); dressContact(); mountReviews(); }).observe(app, { childList: true, subtree: true });
})();
