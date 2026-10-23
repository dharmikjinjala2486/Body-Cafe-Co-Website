/* Body Café Co. — Learn content (the knowledge hub's single source of truth, shared by A–H).

   Rules for everything in this file:
   - General ingredient education is kept separate from facts about Body Café Co.'s products.
   - Product facts come only from the catalogue and approved site copy. Amounts, doses, pack counts, directions,
     cautions, storage, sourcing, test results and certifications are shown as awaiting the approved label/record.
   - Ingredient statements are identity and terminology facts, each cited to a primary source. No outcome, benefit
     or suitability statements are published: research summaries await specialist review (see LEARN-REVIEW-PACK.md).
   - No authors, reviewers or dates are invented. Version and date are the real date this content was written.
   - The three original guides (reading-a-label, ingredient-forms, understanding-reports) are reused from site.js. */
(function () {
  "use strict";
  var S = window.BCCSite;
  if (!S) return;

  var VERSION = { v: "0.1", date: "2026-10-22", label: "22 October 2026" };
  var BYLINE = "Body Café Co. editorial";
  var REVIEW = "Not yet specialist-reviewed";
  var PENDING = (S.STATUS && S.STATUS.label) || "Awaiting approved label";

  /* ---------- Sources (primary). Accessed 22 October 2026. ---------- */
  var SRC = {
    fssai: { t: "FSSAI — Health Supplements, Nutraceuticals … Regulations, 2016 (FAO FAOLEX copy, version dated 29.09.2021)", u: "https://faolex.fao.org/docs/pdf/IND168163.pdf" },
    iron: { t: "NIH Office of Dietary Supplements — Iron: Fact Sheet for Health Professionals (updated 4 Sep 2025)", u: "https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/" },
    vitd: { t: "NIH Office of Dietary Supplements — Vitamin D: Fact Sheet for Health Professionals", u: "https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/" },
    vitk: { t: "NIH Office of Dietary Supplements — Vitamin K: Fact Sheet for Health Professionals (updated 29 Mar 2021)", u: "https://ods.od.nih.gov/factsheets/VitaminK-HealthProfessional/" },
    omega: { t: "NIH Office of Dietary Supplements — Omega-3 Fatty Acids: Fact Sheet for Health Professionals", u: "https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/" },
    creatine: { t: "NIH Office of Dietary Supplements — Dietary Supplements for Exercise and Athletic Performance (creatine section)", u: "https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/" },
    theanine: { t: "Vuong QV, Bowyer MC, Roach PD. L-Theanine: properties, synthesis and isolation from tea. J Sci Food Agric. 2011;91(11):1931–1939", u: "https://agris.fao.org/search/en/records/65dff7de0f3e94b9e5de2746" },
    theaninePubchem: { t: "PubChem — L-Theanine (CID 439378), US National Library of Medicine", u: "https://pubchem.ncbi.nlm.nih.gov/compound/439378" },
    inositol: { t: "Kiani AK, et al. From myo-inositol to D-chiro-inositol molecular pathways. Eur Rev Med Pharmacol Sci. 2021;25(5):2390–2402", u: "https://doi.org/10.26355/eurrev_202103_25279" },
    psyllium: { t: "European Medicines Agency — Plantaginis ovatae seminis tegumentum (ispaghula husk), herbal summary and monograph", u: "https://www.ema.europa.eu/en/medicines/herbal/plantaginis-ovatae-seminis-tegumentum" },
    odsHub: { t: "NIH Office of Dietary Supplements — Health information and fact sheets", u: "https://ods.od.nih.gov/HealthInformation/" },
  };

  /* ---------- Glossary. Plain definitions; `see` links to fuller material. ---------- */
  var GLOSSARY = [
    ["health-supplement", "Health supplement", "In India, a category of food regulated by FSSAI. Labels must carry the words “HEALTH SUPPLEMENT” and “NOT FOR MEDICINAL USE”.", "/learn/reading-a-label#statements"],
    ["serving-size", "Serving size", "The amount the label's numbers refer to, such as one capsule or two chews. Always read amounts together with it.", "/learn/serving-sizes#serving"],
    ["amount-per-serving", "Amount per serving", "How much of an ingredient one serving contains, with its unit.", "/learn/serving-sizes#serving"],
    ["servings-per-pack", "Servings per pack", "How many servings the pack holds. Units in the pack ÷ units per serving.", "/learn/serving-sizes#pack"],
    ["unit", "Units (g, mg, mcg)", "1 g = 1,000 mg and 1 mg = 1,000 mcg. Compare amounts only in the same unit.", "/learn/serving-sizes#units"],
    ["iu", "IU (International Unit)", "A unit used for some vitamins. For vitamin D, 1 mcg equals 40 IU.", "/learn/serving-sizes#units"],
    ["ingredient-form", "Ingredient form", "The specific compound used, such as a particular salt, chelate or ester. It's part of the ingredient's identity.", "/learn/ingredient-forms#named"],
    ["elemental", "Elemental amount", "For minerals, the amount of the mineral itself, as opposed to the weight of the whole compound it's bound in.", "/learn/ingredient-forms#compound"],
    ["chelate", "Chelate / bisglycinate", "A mineral bound to another molecule. “Bisglycinate” means bound to two molecules of the amino acid glycine.", "/learn/iron-bisglycinate#name"],
    ["amino-acid", "Amino acid", "A building-block molecule. L-theanine and glycine are amino acids; L-theanine isn't used to build proteins.", "/learn/l-theanine#what"],
    ["l-form", "“L-” in a name", "Marks one of two mirror-image forms of a molecule. It's part of the ingredient's name, not a brand prefix.", "/learn/l-theanine#name"],
    ["cholecalciferol", "Vitamin D3 (cholecalciferol)", "One of the two main forms of vitamin D in supplements; the other is D2 (ergocalciferol).", "/learn/vitamin-d3-k2#name"],
    ["menaquinone", "Vitamin K2 (menaquinones)", "A family of vitamin K forms named MK-4 to MK-13. Vitamin K1 is phylloquinone.", "/learn/vitamin-d3-k2#name"],
    ["epa-dha", "EPA and DHA", "Eicosapentaenoic acid and docosahexaenoic acid: the long-chain omega-3s a fish oil label should state separately.", "/learn/omega-3-fish-oil#name"],
    ["triglyceride", "Triglyceride form", "One chemical form omega-3s come in. Others include ethyl esters, re-esterified triglycerides, free fatty acids and phospholipids.", "/learn/ingredient-forms#oils"],
    ["stereoisomer", "Stereoisomer", "Molecules with the same atoms arranged differently in space. Myo-inositol and D-chiro-inositol are two stereoisomers of inositol.", "/learn/myo-d-chiro-inositol#name"],
    ["creatine-monohydrate", "Creatine monohydrate", "The most widely used and studied form of creatine; 88% creatine by weight.", "/learn/creatine-chews#name"],
    ["husk", "Psyllium husk", "The seed coats of the Plantago ovata plant, also called ispaghula husk.", "/learn/psyllium-husk#what"],
    ["other-ingredients", "Other ingredients", "Everything in the product besides the headline ingredients: shells, fillers, sweeteners, flavours.", "/learn/reading-a-label#names"],
    ["allergen", "Allergen statement", "Tells you whether a product contains a common allergen, such as fish. Read it before you buy.", "/learn/reading-a-label#warnings"],
    ["lot", "Lot number", "The code that links a pack to its manufacturing batch. Not the same as an order number or barcode.", "/learn/understanding-reports#lot"],
    ["sample", "Sample", "The portion of a lot that was actually tested.", "/learn/understanding-reports#lot"],
    ["method", "Test method", "The named procedure a laboratory used. A result means little without it.", "/learn/understanding-reports#identify"],
    ["specification", "Specification", "The reviewed limits a result is compared against. Without one, a result can't be called a pass.", "/learn/understanding-reports#results"],
    ["detection-limit", "Detection level", "The lowest amount a method can detect. “Not detected” only means something next to it.", "/learn/understanding-reports#results"],
    ["certification", "Certification", "A third party's statement that a product or site met a defined standard, for a defined scope and period.", "/learn/understanding-evidence#types"],
    ["rct", "Randomised controlled trial", "A study that assigns people by chance to receive something or a comparison, to test cause and effect.", "/learn/understanding-evidence#studies"],
    ["observational", "Observational study", "A study that watches what people already do. It can show links, not prove cause.", "/learn/understanding-evidence#studies"],
    ["systematic-review", "Systematic review", "A study that gathers and appraises all the research on a question using a set method.", "/learn/understanding-evidence#studies"],
  ];

  /* ---------- Two new foundation guides (same shape as site.js guides). ---------- */
  var NEW_GUIDES = {
    "serving-sizes": {
      topic: "labels",
      title: "Serving sizes, amounts and units",
      short: "Serving sizes and units",
      summary: "How the serving, the amount and the unit fit together, so you can compare labels fairly.",
      opening: "Three numbers do most of the work on a label: the serving size, the amount per serving and the unit. Read them together and comparisons become simple. Read one without the others and they mislead.",
      takeaways: ["An amount always belongs to a serving.", "A serving can be more than one unit.", "Convert to the same unit before comparing.", "Servings per pack = units in the pack ÷ units per serving."],
      sections: [
        { id: "serving", h: "The serving comes first", html: "<p>Every amount on a label is an {{amount-per-serving|amount per serving}}. If the {{serving-size|serving size}} is two capsules, the amount comes from both capsules together, and one capsule holds half of it.</p><p>The serving is set by the label's directions. It isn't something to guess from the front of the pack.</p>" },
        { id: "units", h: "Same unit, then compare", html: "<p>Amounts are usually in grams (g), milligrams (mg) or micrograms (mcg). 1 g is 1,000 mg, and 1 mg is 1,000 mcg, so 0.5 mg and 500 mcg are the same amount.</p><p>Some vitamins also use International Units ({{iu|IU}}). For vitamin D, the NIH Office of Dietary Supplements gives 1 mcg as equal to 40 IU. Convert before comparing two labels.</p>", src: ["vitd"] },
        { id: "pack", h: "Servings per pack", html: "<p>The pack count tells you how many units are inside. Divide it by the number of units in a serving to get the {{servings-per-pack|servings per pack}}. A pack of 60 capsules with a two-capsule serving holds 30 servings.</p><p>That's arithmetic, not a recommendation. How much to take and how often comes from the approved directions.</p>" },
        { id: "rda", h: "Percentages of a daily allowance", html: "<p>Under FSSAI's health supplement regulations, where it applies, a label shows amounts as a percentage of the ICMR recommended daily allowance, with the warning “Not to exceed the recommended daily usage”. A percentage is only meaningful next to the amount and serving it refers to.</p>", src: ["fssai"] },
        { id: "chews", h: "Chews, softgels and capsules", html: "<p>Format changes what a unit is. A chew, a softgel and a capsule can each be a single unit, and a serving can be one or several of them. For chews, also read the nutrition information: a chew can carry sugars or sweeteners alongside its main ingredient.</p>" },
      ],
      example: {
        title: "An illustrative serving calculation",
        note: "Fictional example for reading practice only. These numbers don't describe any Body Café Co. product.",
        rows: [["Serving size", "2 chews"], ["Amount per serving", "3 g of an example ingredient"], ["Chews per pack", "60"], ["Per chew", "1.5 g"], ["Servings per pack", "30"]],
        reading: "The 3 g refers to two chews, so each chew holds 1.5 g. Sixty chews at two per serving make 30 servings.",
      },
      checklist: ["Serving size and units per serving", "Amount per serving, with unit", "Same unit before comparing (mcg, mg, g, IU)", "Units per pack and servings per pack", "Any % of a daily allowance, read next to the amount"],
      related: ["reading-a-label", "ingredient-forms"],
      sources: ["vitd", "fssai"],
    },
    "understanding-evidence": {
      topic: "evidence",
      title: "Understanding evidence",
      short: "Understand the evidence",
      summary: "Ingredient research, product testing, certification and lot reports answer different questions.",
      opening: "“Backed by research”, “tested”, “certified”: each phrase points to a different kind of evidence, and each can only answer certain questions. Knowing which is which helps you read any brand's claims, including ours.",
      takeaways: ["Research on an ingredient isn't research on a finished product.", "Testing a product describes what's in it, not what it does.", "A certification covers a stated scope and period.", "A lot report describes one batch."],
      sections: [
        { id: "types", h: "Four kinds of evidence", html: "<p>Ingredient research, finished-product testing, {{certification|certification}} and lot reports are often blurred together. The table on the Learn hub sets out what each can establish and where it stops. In short: research studies an ingredient, testing checks a product, certification checks against a standard, and a lot report records one batch.</p>" },
        { id: "studies", h: "How studies differ", html: "<p>An {{observational|observational study}} watches what people already do and can show that two things go together, not that one causes the other. A {{rct|randomised controlled trial}} assigns people by chance to compare an intervention with a control, which is how cause and effect is tested. A {{systematic-review|systematic review}} gathers and appraises all the trials on a question, and often grades how certain the overall evidence is.</p><p>Results also depend on who was studied, the form and amount used, and for how long. A finding in one group, form or amount doesn't automatically carry over to another.</p>" },
        { id: "transfer", h: "Ingredient research isn't product proof", html: "<p>Research on an ingredient tells you about that ingredient, in the form, amount and people studied. It doesn't show that a particular finished product, with its own formula and amount, will have the same result. That's why our guides keep general ingredient information separate from facts about our products, and why we don't turn research into promises.</p>" },
        { id: "testing", h: "Testing and certification", html: "<p>Testing a finished product can check its identity, how much of an ingredient it contains, and whether named contaminants are below a limit. It doesn't test what the product does in your body. A certification is a third party's statement that something met a defined standard; read what it covers, who issued it and when. Body Café Co. doesn't currently claim any certification.</p>" },
        { id: "rules", h: "What labels can't claim", html: "<p>Under FSSAI's health supplement regulations, a health supplement can't claim to prevent, treat or cure a disease. Treat that kind of promise as a warning sign, whoever makes it.</p>", src: ["fssai"] },
      ],
      example: {
        title: "Matching the question to the evidence",
        note: "General guide for reading claims. Not a statement about any Body Café Co. product.",
        rows: [["“What does this ingredient do?”", "Ingredient research, in its stated form and amount"], ["“Is the amount on the label in the pack?”", "Finished-product testing"], ["“Was it made to a stated standard?”", "Certification, within its scope and dates"], ["“What was found in my batch?”", "The lot report for your lot number"]],
        reading: "Each question has its own kind of evidence. A strong answer to one doesn't answer the others.",
      },
      checklist: ["Which kind of evidence is this?", "Ingredient or finished product?", "Which form, amount and people were studied?", "What scope and dates does a certification cover?", "Which lot does a report describe?"],
      related: ["understanding-reports", "reading-a-label"],
      sources: ["fssai", "odsHub"],
    },
  };
  var FOUNDATION = ["reading-a-label", "ingredient-forms", "serving-sizes", "understanding-evidence", "understanding-reports"];

  /* Map the site.js guides (string sources) onto this file's source keys, and add glossary links. */
  var LEGACY_SRC = { "reading-a-label": ["fssai"], "understanding-reports": [], "ingredient-forms": ["iron", "creatine", "vitd", "vitk", "omega"] };
  function foundation(slug) {
    if (NEW_GUIDES[slug]) return NEW_GUIDES[slug];
    var g = S.guides[slug];
    if (!g) return null;
    var out = {}; Object.keys(g).forEach(function (k) { out[k] = g[k]; });
    out.sources = LEGACY_SRC[slug] || [];
    out.related = slug === "understanding-reports" ? ["understanding-evidence", "reading-a-label"] : slug === "reading-a-label" ? ["serving-sizes", "ingredient-forms"] : ["serving-sizes", "reading-a-label"];
    return out;
  }

  /* ---------- Evidence types (hub section 6) ---------- */
  var EVIDENCE = [
    { id: "research", title: "Ingredient research", can: "What studies found about an ingredient, in the form, amount, people and time studied.", cant: "That a different product, amount or person will get the same result.", ours: "Our guides link to independent summaries. Reviewed research summaries are still being prepared.", link: ["/learn/understanding-evidence#transfer", "Research isn't product proof"] },
    { id: "testing", title: "Finished-product testing", can: "What a sample of the product contains: identity, amount of an ingredient, named contaminants against limits.", cant: "What the product does in the body, or whether every pack is the same.", ours: "No finished-product test results are published yet.", link: ["/learn/understanding-evidence#testing", "Testing explained"] },
    { id: "certification", title: "Certification", can: "That a product or site met a defined standard, as checked by a named third party, for a stated scope and period.", cant: "Anything outside its scope or dates, or how well a product works.", ours: "Body Café Co. doesn't claim any certification.", link: ["/learn/understanding-evidence#testing", "Reading a certification"] },
    { id: "lot", title: "Lot reports", can: "What was tested on a sample from one manufacturing batch, by which method, against which limits.", cant: "Results for other batches, health outcomes, or that a single pack is authentic.", ours: "Lot records in this preview are demonstrations; no laboratory document is connected.", link: ["/learn/understanding-reports", "Read a lot report"] },
  ];

  /* ---------- Label explorer (hub section 5): an educational example, not a Body Café Co. label. ---------- */
  var LABEL = {
    note: "Educational example. This isn't a Body Café Co. label, and its numbers don't describe any of our products.",
    parts: [
      { id: "serving", name: "Serving size", shows: "Serving size: 2 capsules", explain: "Every amount below refers to two capsules together. One capsule holds half of each amount.", link: "/learn/serving-sizes#serving" },
      { id: "amounts", name: "Ingredient amounts", shows: "Example mineral (as a named compound) 20 mg", explain: "Check the unit, and whether the amount is the mineral itself or the whole compound. The form should be named.", link: "/learn/ingredient-forms#compound" },
      { id: "other", name: "Other ingredients", shows: "Other ingredients: capsule shell (material named), bulking agent", explain: "Everything besides the headline ingredient, including the shell material. Useful if you avoid particular ingredients.", link: "/learn/reading-a-label#names" },
      { id: "allergens", name: "Allergens", shows: "Allergen statement: contains / free from (as applicable)", explain: "Tells you whether the product contains a common allergen such as fish. Read it before you buy.", link: "/learn/reading-a-label#warnings" },
      { id: "cautions", name: "Cautions", shows: "Warnings, precautions, “Keep out of reach of children”", explain: "Who should take extra care, and how to store the product safely. Read them in full on the actual label.", link: "/learn/reading-a-label#warnings" },
      { id: "lot", name: "Lot number", shows: "Lot: EX-0000-00", explain: "Links the pack to its manufacturing batch. Use it to look up a lot record, and quote it if you contact support.", link: "/learn/understanding-reports#lot" },
    ],
  };

  /* ---------- Report walkthrough: a clearly marked example ---------- */
  var REPORT = {
    note: "Example for learning only. Not a Body Café Co. result, laboratory or document.",
    rows: [
      { id: "product", k: "Product", v: "Example product", explain: "The product the report describes. It should match the product you bought." },
      { id: "lot", k: "Lot", v: "EX-0000-00", explain: "The batch. It must match the lot number printed on your pack, or the report isn't about your pack." },
      { id: "test", k: "Test", v: "Example contaminant screen", explain: "What was measured. One report can contain many tests." },
      { id: "method", k: "Method", v: "Named method reference", explain: "How it was measured. Different methods can detect different levels." },
      { id: "result", k: "Result", v: "Not detected", explain: "What was found. “Not detected” needs the detection level next to it to mean anything." },
      { id: "units", k: "Units and detection level", v: "Stated, e.g. mg/kg", explain: "Results only compare fairly in the same unit." },
      { id: "limits", k: "Specification (limit)", v: "Reviewed limit, with unit", explain: "The limit the result is judged against. Without it, a result can't be called a pass." },
    ],
  };

  /* ---------- Inside Body Café Co. (hub section 7): short summaries that point to the full pages ---------- */
  var INSIDE = [
    { title: "The people and the brand", text: "Who we are, what we make and the values behind it. Introductions to the people will come in their own words.", href: "/about", cta: "About us" },
    { title: "The origin story", text: "Why a café, who it's for and what we promise. The founder's own journey will be added there.", href: "/story", cta: "Read the story" },
    { title: "The collection", text: "Seven everyday supplements, each named for what's in it, each with its own cap colour.", href: "/about#collection", cta: "Our approach to the collection" },
    { title: "Standards and transparency", text: "What we show, how packs link to lots, and what a report can and can't tell you.", href: "/standards", cta: "Our standards" },
  ];

  /* ---------- Product guides (seven). General = about the ingredient; ours = Body Café Co. product facts. ---------- */
  var P = {
    "iron-bisglycinate": {
      minute: "Iron bisglycinate is iron bound to two molecules of the amino acid glycine. On any iron label, the number to find is the elemental iron per serving, not the weight of the whole compound. Our approved label, with its amounts and warnings, is still on its way.",
      what: "<p>Iron is a mineral. The NIH Office of Dietary Supplements describes it as an essential component of hemoglobin, the red blood cell protein that carries oxygen. In supplements it's always bound to something else, as a salt or a {{chelate|chelate}}, and iron bisglycinate is one such form.</p>",
      whatSrc: ["iron"],
      name: "<p><strong>“Bis-”</strong> means two and <strong>“glycinate”</strong> refers to glycine, an {{amino-acid|amino acid}}. So the name describes iron bound to two glycine molecules. The NIH fact sheet groups forms like this as iron amino-acid chelates.</p><p>Because the iron is bound to glycine, the weight of iron bisglycinate isn't the weight of iron. The {{elemental|elemental}} iron is only part of it. The same source gives other iron compounds as examples: ferrous fumarate is 33% elemental iron by weight, ferrous sulfate 20% and ferrous gluconate 12%.</p>",
      nameSrc: ["iron"],
      label: [["Elemental iron per serving", "Listed separately from the weight of the bisglycinate compound."], ["Serving size and count", "How many units make a serving, and how many are in the pack."], ["Form named in full", "“Iron (as iron bisglycinate)” tells you more than “Iron”."], ["Warnings", "Iron products carry warnings and storage instructions, including keeping them away from children. Read them on the approved label."]],
      caution: "The NIH Office of Dietary Supplements notes that accidental overdose of iron-containing products is a leading cause of fatal poisoning in children under 6. Keep any iron product out of children's reach.",
      cautionSrc: ["iron"],
      faq: [["Is 100 mg of iron bisglycinate 100 mg of iron?", "No. Iron bisglycinate is a compound; only part of its weight is iron. Look for the elemental iron amount stated separately.", "name"], ["How much iron is in your product?", "The elemental iron per serving will be on the approved label. It isn't published yet, so we don't state a number.", "inside"]],
      research: "iron",
    },
    "l-theanine": {
      minute: "L-theanine is an amino acid that occurs naturally in the tea plant. The “L-” is part of its name. On a label, look for the amount of L-theanine per serving and the other ingredients. Our approved label, with its amount, is still on its way.",
      what: "<p>L-theanine is a non-protein {{amino-acid|amino acid}}: an amino acid that isn't used to build proteins. It occurs naturally in the tea plant, <em>Camellia sinensis</em>, and contributes to the taste of tea.</p>",
      whatSrc: ["theanine"],
      name: "<p>The “theanine” part comes from tea (<em>thea</em>). The {{l-form|“L-”}} marks which of two mirror-image forms of the molecule it is; PubChem records L-theanine by its chemical name, (2S)-2-amino-5-(ethylamino)-5-oxopentanoic acid. You may also see it written simply as theanine.</p>",
      nameSrc: ["theaninePubchem", "theanine"],
      label: [["Amount per serving", "The amount of L-theanine in one serving, with its unit."], ["Dosage form", "How it's presented, and how many units make a serving."], ["Free-from statements", "Statements such as caffeine-free belong on a label only when they're substantiated."], ["Other ingredients", "Capsule shell material and anything else added."]],
      faq: [["Is L-theanine the same as caffeine?", "No. Both occur in tea, but they're different compounds. Any caffeine-related statement on our label will appear only if it's substantiated.", "what"], ["How much L-theanine is in each serving?", "That amount will come from the approved label. We don't publish a number until then.", "inside"]],
      research: "theanine",
    },
    "vitamin-d3-k2": {
      minute: "This formula has three named parts: vitamin D3, vitamin K2 and omega-3 as triglycerides. Each needs its own amount, unit and form on the label, and should be read separately. The approved amounts are still on their way.",
      what: "<p>Vitamin D and vitamin K are vitamins; each comes in more than one form. This product names three components: vitamin D3, vitamin K2, and omega-3 fatty acids in {{triglyceride|triglyceride form}}. They're distinct ingredients, so each is read on its own.</p>",
      whatSrc: ["vitd", "vitk", "omega"],
      name: "<p><strong>Vitamin D3</strong> is {{cholecalciferol|cholecalciferol}}; the other common supplement form is D2, ergocalciferol. <strong>Vitamin K2</strong> is a family of {{menaquinone|menaquinones}} named MK-4 to MK-13; vitamin K1 is phylloquinone. A label should say which menaquinone it uses, such as MK-7.</p><p><strong>Units:</strong> vitamin D may be given in mcg or {{iu|IU}} (1 mcg = 40 IU); vitamin K is given in mcg.</p>",
      nameSrc: ["vitd", "vitk"],
      label: [["Vitamin D3 amount and unit", "In mcg or IU. Convert before comparing: 1 mcg equals 40 IU."], ["Vitamin K2 form and amount", "Which menaquinone (for example MK-7), and how much, in mcg."], ["Omega-3 amount", "Omega-3 is included as triglycerides. Look for the amount, ideally with EPA and DHA stated."], ["Serving and source", "Serving size, and the dietary source of each ingredient."]],
      caution: "The NIH Office of Dietary Supplements advises that people taking warfarin and similar anticoagulants need to keep their vitamin K intake consistent. If that applies to you, speak with your doctor before taking a product that contains vitamin K.",
      cautionSrc: ["vitk"],
      faq: [["Is the omega-3 here the same as in your fish oil?", "Both contain omega-3s, but they're different products with different formulas. The omega-3 source for this product will be stated on the approved label.", "inside"], ["Why read D3 and K2 separately?", "They're different vitamins with different units and forms. A combined product still needs an amount for each.", "name"]],
      research: "dk",
    },
    "omega-3-fish-oil": {
      minute: "With fish oil, the amount of oil and the amount of omega-3s are different numbers. The ones to find are EPA and DHA, stated separately. Omega-3 Fish Oil comes from fish. Approved amounts and the full allergen statement are still on their way.",
      what: "<p>Fish oil is an oil that contains omega-3 fatty acids. The NIH Office of Dietary Supplements names the main omega-3s as alpha-linolenic acid (ALA), eicosapentaenoic acid (EPA) and docosahexaenoic acid (DHA); EPA and DHA are the long-chain omega-3s found in fish oil.</p>",
      whatSrc: ["omega"],
      name: "<p>{{epa-dha|EPA and DHA}} are named for their structure: EPA has 20 carbon atoms and DHA 22. The same source describes a typical fish oil supplement as about 1,000 mg of fish oil containing 180 mg EPA and 120 mg DHA, and notes that amounts vary widely. So “1,000 mg fish oil” on its own doesn't tell you how much omega-3 you get.</p><p>Omega-3s in supplements come in several chemical forms: natural triglycerides, free fatty acids, ethyl esters, re-esterified triglycerides and phospholipids.</p>",
      nameSrc: ["omega"],
      label: [["Fish oil per serving", "The total amount of oil in a serving."], ["EPA and DHA", "Stated separately from the fish oil total."], ["Form", "Triglycerides, ethyl esters or another form."], ["Source and allergens", "The fish source, the softgel shell material and the allergen statement."]],
      allergen: "Omega-3 Fish Oil comes from fish. The full allergen statement and fish source will be on the approved label.",
      faq: [["Is 1,000 mg of fish oil 1,000 mg of omega-3?", "No. The oil contains omega-3s; EPA and DHA are only part of it. Look for them listed separately.", "name"], ["What fish is it from?", "The fish source will be stated on the approved label. We don't publish it until then.", "inside"]],
      research: "omega",
    },
    "myo-d-chiro-inositol": {
      minute: "Myo-inositol and D-chiro-inositol are two different forms of inositol. A label should give each one's amount separately, and any ratio should follow from those two amounts. The approved amounts are still on their way.",
      what: "<p>Inositol is a carbocyclic sugar alcohol. Myo-inositol and D-chiro-inositol are two of its forms, and the body stores both in organs such as the kidneys, brain and liver.</p>",
      whatSrc: ["inositol"],
      name: "<p>Inositol's hydroxyl groups can be arranged in nine ways, giving nine possible {{stereoisomer|stereoisomers}}. “Myo-” and “D-chiro-” name two of them. Because they're distinct ingredients, a fair comparison needs both amounts, not just the combined total.</p><p>A <strong>ratio</strong> (for example, “40:1”) describes how the two amounts relate. It should be checked against the stated amounts of each.</p>",
      nameSrc: ["inositol"],
      label: [["Each ingredient's amount", "Myo-inositol and D-chiro-inositol stated separately, with units."], ["Ratio", "Any ratio should follow from the two stated amounts on the approved label, not from the front of a pack."], ["Serving size", "How many units make a serving."], ["Units per pack", "The total count, to work out servings per pack."]],
      faq: [["What ratio does your product use?", "The individual amounts, and any ratio, will come from the approved label. We don't state one until then.", "inside"], ["Are myo-inositol and D-chiro-inositol the same thing?", "No. They're two different stereoisomers of inositol, so each has its own amount.", "name"]],
      research: "inositol",
    },
    "creatine-chews": {
      minute: "Creatine is a compound the body makes and stores mostly in muscle. In a chew, check three things: the creatine form, how much creatine is in each chew versus each serving, and what else the chew contains. Our complete formulation is still pending.",
      what: "<p>Creatine is made in the body and also comes from the diet in small amounts. According to the NIH Office of Dietary Supplements, the liver and kidneys make it from the amino acids glycine, arginine and methionine, and most of it is stored in muscle.</p>",
      whatSrc: ["creatine"],
      name: "<p>Creatine comes in several forms. {{creatine-monohydrate|Creatine monohydrate}} is the most widely used and studied form, and it's 88% creatine by weight. So the weight of a creatine compound isn't always the weight of creatine.</p><p>In a chew, the amount per chew and the amount per {{serving-size|serving}} can differ if a serving is more than one chew.</p>",
      nameSrc: ["creatine"],
      label: [["Creatine form", "Which form of creatine is used. Our complete formulation is still pending."], ["Per chew and per serving", "Creatine per chew, and per serving if a serving is more than one chew."], ["Chews per pack and flavour", "The count, the flavour and what the chew is like."], ["Nutrition information", "Chews can contain sugars, sweeteners and other ingredients; read the full nutrition panel."]],
      faq: [["Which creatine form do the chews use?", "Our complete formulation, including the creatine form, is still pending. We'll state it once the label is approved.", "inside"], ["Why does the number of chews per serving matter?", "Because the amount per serving may come from more than one chew. Divide to find the amount per chew.", "name"]],
      research: "creatine",
    },
    "psyllium-husk": {
      minute: "Psyllium husk is the seed coat of the Plantago ovata plant, a source of fibre. The details that matter are the product format, the serving, the fibre per serving and the preparation directions. The approved directions and cautions are still on their way.",
      what: "<p>{{husk|Psyllium husk}}, also called ispaghula husk, is the seed coat of the plant <em>Plantago ovata</em>. The European Medicines Agency's herbal monograph describes it this way.</p>",
      whatSrc: ["psyllium"],
      name: "<p>“Psyllium” and “ispaghula” are two names for the same plant material; the Latin name of the husk is <em>Plantaginis ovatae seminis tegumentum</em>, which literally means the seed coat of <em>Plantago ovata</em>.</p><p>Our Psyllium Husk is presented as capsules. On a fibre product, read the amount of husk per serving and the fibre it provides as separate numbers.</p>",
      nameSrc: ["psyllium"],
      label: [["Form and net weight", "How the product is presented and how much is in the pack."], ["Serving amount and fibre", "The amount per serving and the fibre it provides."], ["Preparation directions", "How to take it, including any instructions about water. Follow the approved label."], ["Warnings", "The approved label's warnings, read in full."]],
      caution: "Fibre products usually come with instructions about how much liquid to take them with. Follow the approved label's preparation directions exactly when they're published.",
      cautionSrc: ["psyllium"],
      faq: [["Is psyllium the same as ispaghula?", "Yes. They're two names for the husk of the Plantago ovata seed.", "name"], ["How should it be taken?", "Preparation directions and cautions will come from the approved label. We don't give our own until then.", "use"]],
      research: "psyllium",
    },
  };

  /* Where to read independent summaries while ours await review (no outcome statements are made here). */
  var RESEARCH = {
    iron: ["iron"], theanine: ["theanine"], dk: ["vitd", "vitk", "omega"], omega: ["omega"], inositol: ["inositol"], creatine: ["creatine"], psyllium: ["psyllium"],
  };

  /* ---------- Hub questions (searchable), each answered by a reviewed guide section ---------- */
  var QUESTIONS = [
    ["How do I read a serving size?", "Every amount refers to a serving, and a serving can be more than one unit.", "/learn/serving-sizes#serving"],
    ["What's the difference between mcg and IU?", "They're different units. For vitamin D, 1 mcg equals 40 IU.", "/learn/serving-sizes#units"],
    ["Why does the ingredient form matter?", "The form can change how much of the active part a given weight contains.", "/learn/ingredient-forms#compound"],
    ["What is elemental iron?", "The amount of iron itself, not the weight of the whole compound.", "/learn/iron-bisglycinate#name"],
    ["Is fish oil the same as omega-3?", "No. Fish oil contains omega-3s; EPA and DHA should be listed separately.", "/learn/omega-3-fish-oil#name"],
    ["What's the difference between myo-inositol and D-chiro-inositol?", "They're two stereoisomers of inositol, each with its own amount.", "/learn/myo-d-chiro-inositol#name"],
    ["What does a lot report show?", "What was tested on a sample from one batch, by which method, against which limits.", "/learn/understanding-reports#identify"],
    ["Does research on an ingredient prove a product works?", "No. Ingredient research isn't proof about a finished product.", "/learn/understanding-evidence#transfer"],
    ["Where is the lot number on my pack?", "On the pack, separate from the barcode. A location guide will be added from the final label.", "/learn/understanding-reports#lot"],
    ["What must an Indian health supplement label carry?", "Statements such as “HEALTH SUPPLEMENT” and “NOT FOR MEDICINAL USE”, among others.", "/learn/reading-a-label#statements"],
  ];

  window.BCCLearnContent = {
    VERSION: VERSION, BYLINE: BYLINE, REVIEW: REVIEW, PENDING: PENDING, SRC: SRC, GLOSSARY: GLOSSARY,
    FOUNDATION: FOUNDATION, foundation: foundation, EVIDENCE: EVIDENCE, LABEL: LABEL, REPORT: REPORT, INSIDE: INSIDE,
    PRODUCTS: P, RESEARCH: RESEARCH, QUESTIONS: QUESTIONS, CARE: S.CARE_NOTE,
  };
})();
