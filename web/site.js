/* Body Café Co. — shared site content for all four design directions.

   Everything a customer reads outside the product pages lives here once: page copy, guides, ingredient notes,
   policies, help topics, report-state wording and the synthetic fixtures used for visual design states.
   The four theme modules (site-a.js … site-d.js) only compose this content differently.

   Content rules:
   - No doses, amounts, ratios, pack counts, benefits, suitability, reviews, certifications, delivery dates,
     return windows or founder facts are invented. Missing approved facts are named precisely.
   - Technical statements in the guides are limited to points checked against the primary sources listed with them.
   - Sample prices, lots and fixtures stay labelled as samples. Fixtures never call the API or save anything. */
(function () {
  "use strict";

  var SRC = {
    fssai: ["FSS (Health Supplements, Nutraceuticals, Food for Special Dietary Use, Food for Special Medical Purpose, Functional Food and Novel Food) Regulations, 2016 — FAO FAOLEX copy, version I dated 29.09.2021", "https://faolex.fao.org/docs/pdf/IND168163.pdf"],
    iron: ["NIH Office of Dietary Supplements — Iron: Fact Sheet for Health Professionals", "https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/"],
    vitd: ["NIH Office of Dietary Supplements — Vitamin D: Fact Sheet for Health Professionals", "https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/"],
    vitk: ["NIH Office of Dietary Supplements — Vitamin K: Fact Sheet for Health Professionals", "https://ods.od.nih.gov/factsheets/VitaminK-HealthProfessional/"],
    omega: ["NIH Office of Dietary Supplements — Omega-3 Fatty Acids: Fact Sheet for Health Professionals", "https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/"],
    creatine: ["NIH Office of Dietary Supplements — Dietary Supplements for Exercise and Athletic Performance: Fact Sheet for Health Professionals", "https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/"],
  };

  /* ---------- Shared phrases ---------- */
  var STATUS = {
    label: "Awaiting approved label",
    sample: "Sample price",
    demo: "Demonstration record",
    pending: "Not yet approved",
  };

  var CARE_NOTE = "If you have a health condition, are pregnant or breastfeeding, or take regular medication, speak with a qualified health professional before adding a supplement. Nothing on this site is a diagnosis or personal advice.";

  /* ---------- Page copy ---------- */
  var copy = {
    shop: {
      lede: "Seven everyday supplements. Each one shows its ingredient and format up front, and links to its label details and lot record.",
      guidanceTitle: "How to browse without guessing",
      guidance: [
        ["Start with the ingredient", "Every product is named after what's in it. If you already know the ingredient you're looking for, go straight to it."],
        ["Then pick the format", "Capsules, softgels or chewable tablets. Format changes how you take it, not what the label must tell you."],
        ["Read before you add", "Each page separates what's confirmed now from what the approved rear label will add: amounts, directions, cautions and allergens."],
      ],
      care: CARE_NOTE,
      compareTitle: "The seven, side by side",
      compareNote: "Serving sizes and pack contents appear here once each rear label is approved. Prices are samples.",
      noMatch: ["Nothing in that format yet.", "Try another format, or see all seven products together."],
    },
    bundles: {
      lede: "An edit puts two products on one page, so you can compare their labels side by side and add both in one step.",
      status: "These are example pairings for browsing. Bundle rules and any savings haven't been approved, and an edit isn't a recommendation to take the products together.",
      why: [
        ["Two labels, one place", "Each edit lists both products with their ingredient, format and sample price, and links to each full product page."],
        ["No invented savings", "The total is simply the two sample prices added together. No discount is applied or implied."],
        ["Checked one by one", "Adding an edit checks stock for each product separately. If one is unavailable, nothing is added."],
      ],
    },
    search: {
      lede: "Search by product name, ingredient or format. Results include products and the guides that explain them.",
      hints: ["Iron", "Creatine", "Softgels", "Omega-3", "Psyllium", "Lot report", "Label"],
      noResults: "Nothing matched that search. Try an ingredient name, a format, or one of the suggestions below.",
    },
    standards: {
      lede: "Clarity starts with being specific: what a label should tell you, how a pack connects to its manufacturing lot, and what a report can and can't show.",
      intro: "A supplement asks for a lot of trust. We'd rather earn it with detail you can check than with badges you can't. This page explains the standard we're building towards, and is plain about which parts are documented today and which are still being prepared.",
      pillars: [
        {
          id: "label",
          title: "The label tells the whole story",
          summary: "A product page should carry everything the approved rear label carries.",
          body: "That means the full product name, the form of each ingredient, the amount per serving, the serving size, units per pack, directions, storage, allergens, cautions and the manufacturer's details. A headline ingredient on its own isn't enough to compare products.",
          points: ["Amounts are given per serving, with the serving size stated", "Each ingredient is named in full, including its form", "Directions, cautions and allergens sit next to the facts, not behind a link"],
          now: "Product names, ingredients in view and formats are published. Approved rear labels haven't been supplied yet, so amounts, directions and cautions are marked as awaiting approval on every product page.",
        },
        {
          id: "identity",
          title: "Ingredient identity comes first",
          summary: "The form of an ingredient is part of its identity.",
          body: "Iron bisglycinate isn't simply “iron”; vitamin K2 comes in more than one form; an omega-3 amount means little without knowing how much is EPA and DHA. We keep the full name next to the quantity, so like can be compared with like.",
          points: ["Full ingredient names, never shortened to a marketing word", "Compound weight and active amount kept separate where they differ", "Units stated plainly (for example mg, mcg or IU)"],
          now: "Ingredient names in view are published for all seven products. Forms and amounts per serving await the approved product records.",
        },
        {
          id: "lot",
          title: "Every pack points to its lot",
          summary: "A lot number connects the bottle in your hand to a manufacturing batch.",
          body: "One product can be made in many lots. The lot number printed on the pack is how you find the record for your batch. It is different from an order number, a barcode or a product code.",
          points: ["Choose the product, then enter the lot number from the pack", "The record names the exact product and lot it describes", "A guide to where the lot number sits on each pack will follow the final label"],
          now: "The lot lookup works with clearly marked sample records (for example DEMO-01-01). No real lot records are connected yet.",
        },
        {
          id: "testing",
          title: "Testing is described, not decorated",
          summary: "A report should say what was tested, how, and against what.",
          body: "A useful lot report identifies the product and lot, the sample tested, each test performed, the method, the result with its units, and the reviewed limit it is compared against. It should link to the source document. A result shouldn't be called a pass unless there's a reviewed specification to compare it with.",
          points: ["Tests, methods, units and limits read together", "The source document linked, in a version that can be published", "No “tested” badge without the document behind it"],
          now: "No laboratory reports, laboratory names, certifications or results have been supplied or published. The report layout on this site is a demonstration of structure only.",
        },
        {
          id: "limits",
          title: "Evidence has edges",
          summary: "Knowing what a report can't tell you matters as much.",
          body: "A lot report describes a sample from one batch. It isn't a clinical study, it doesn't promise a health outcome, and it doesn't prove that a single pack is authentic. Verifying individual units would need a separate concealed code, and that scope hasn't been decided.",
          points: ["A report is not a diagnosis or a promise of results", "Ingredient research isn't the same as testing a finished product", "Lot lookup does not authenticate an individual pack"],
          now: "Unit-level authentication is not offered. Its scope is unresolved.",
        },
      ],
      documented: ["Seven product names, ingredients in view and formats", "A product-and-lot lookup with clearly marked sample states", "Plain explanations of what a report should identify and its limits", "Prices and stock shown as preview samples"],
      planned: ["Approved rear labels and complete product records for all seven", "Lot-linked report summaries with publishable source documents", "Report versions and withdrawal notices", "A pack guide showing where to find the lot number"],
      wont: ["Display testing or certification badges without documents", "Turn an ingredient name into a health claim", "Publish reviews, ratings or results that haven't happened"],
    },
    story: {
      lede: "Body Café Co. is built around one idea: the details should be easy to find.",
      opening: "Most supplement shopping asks for trust first and offers detail later, if at all. We think it should work the other way round. Before you choose, you should be able to see what's in a product, in what form, and where the record for your bottle lives.",
      chapters: [
        {
          title: "Why a café?",
          body: "A good café is an everyday place. Nobody minds if you ask what's in something, and the menu tells you before you order. We wanted buying supplements to feel the same: unhurried, curious and specific. The café isn't a theme. It's a standard for how a counter should treat a question.",
        },
        {
          title: "Who it's for",
          body: "We're making this for curious, sceptical shoppers in India who read labels, compare products and would rather check than be told. You don't need a science degree. You do deserve straight answers, in plain English first, with room for more languages later.",
        },
        {
          title: "Seven on the counter",
          body: "We start with seven everyday supplements: Iron Bisglycinate, L-Theanine, Vitamin D3 + K2, Omega-3 Fish Oil, Myo & D-Chiro Inositol, Creatine Chews and Psyllium Husk. Each is named for what's in it. Each gets its own cap colour, so the range is easy to read from across the room.",
        },
        {
          title: "Playful, never vague",
          body: "We'd like supplements to feel less clinical and more like something you can talk about. But a light tone is never a reason to blur a fact. If something isn't confirmed yet, we say so plainly instead of filling the gap with a claim.",
        },
      ],
      promises: [
        ["Show the label", "Approved label information on every product page, in readable text."],
        ["Connect the lot", "A way to find the record for the batch your bottle came from."],
        ["Say what's missing", "Clear status wherever an approval or document is still on its way."],
        ["Listen properly", "Reviews only from customers whose order was delivered, published after moderation."],
      ],
      wont: ["Promise results or diagnose anything", "Invent reviews, endorsements or certificates", "Rush you with countdowns or false scarcity"],
      people: "The founder's own story, the team and real photography will appear here in their own words. We're not filling this space with stock faces or an invented history.",
      peopleNeeds: ["Founder story, in their words", "Founder and team portraits", "Original product-in-hand photography"],
    },
    learn: {
      lede: "Short, practical guides to reading labels, comparing ingredient forms and understanding what a lot report can show.",
      intro: "Learn is a reading room, not a sales page. The guides explain how to read any supplement label, not just ours. The ingredient notes show what to check for each of our seven products, and which details are still waiting on approved labels.",
      topics: [
        ["labels", "Labels", "How to read serving sizes, amounts and the statements every label should carry."],
        ["evidence", "Evidence", "The difference between a product, a lot and a tested sample, and how to read a result."],
        ["forms", "Ingredient forms", "Why the full name of an ingredient matters when you compare products."],
        ["notes", "Ingredient notes", "What to look for on each of our seven product labels."],
      ],
      glossary: [
        ["Serving size", "The amount the amounts on a label refer to, such as one capsule or two chews. Always read the two together."],
        ["Amount per serving", "How much of an ingredient is in one serving, with its unit."],
        ["Ingredient form", "The specific compound used, such as a particular salt, chelate or ester. It's part of the ingredient's identity."],
        ["Elemental amount", "For minerals, the amount of the mineral itself, as opposed to the weight of the whole compound."],
        ["mcg and IU", "Micrograms and International Units. For vitamin D, 1 mcg equals 40 IU."],
        ["Lot number", "The code that links a pack to its manufacturing batch. Not the same as an order number or barcode."],
        ["Specification", "The reviewed limits a result is compared against. Without one, a result can't be called a pass."],
      ],
    },
    reports: {
      lede: "Choose your product, then enter the lot number printed on the pack.",
      what: "A lot report connects a pack to the record for its manufacturing batch: what was tested on a sample from that lot, how, and against which limits.",
      steps: [
        ["Choose the product", "Lot numbers belong to one product, so the product comes first."],
        ["Enter the lot number", "Type it exactly as printed on the pack. It's not your order number or the barcode."],
        ["Read the record", "See the product and lot, the report status and what the record can and can't tell you."],
      ],
      locationStatus: "A guide to where the lot number sits on each pack will be added from the final rear label.",
      demo: "This preview uses sample records only. Try DEMO-0X-01 for the product you picked, where X is its number in the collection. No laboratory document is connected.",
      limits: ["A report describes a sample from one lot, not every unit in it.", "It doesn't prove an individual pack is authentic.", "It isn't a diagnosis or a promise of results."],
      hierarchy: [
        ["Product & lot", "The exact product and manufacturing lot the record describes."],
        ["Status", "Whether the report is published, still being prepared, or withdrawn."],
        ["Tests & methods", "Each test performed on the sample, with the method used."],
        ["Results & limits", "Each result with its unit, read against the reviewed specification."],
        ["Source document", "The publishable version of the laboratory document, with its version."],
      ],
      states: {
        sample_match: ["Lot found", "This sample lot belongs to the product you chose. In the live experience, the report summary and source document would appear below.", "match"],
        not_found: ["No matching lot", "We couldn't match that lot number to this product. Check the number and the product, then try again. If it still doesn't match, contact support and include a photo of the pack.", ""],
        unpublished: ["Report not published yet", "A record exists for this lot, but its report isn't ready to view. That doesn't mean a test passed or failed. Check back, or contact support.", ""],
        withdrawn: ["This lot has been withdrawn", "In the live experience, reviewed safety instructions and a direct support route would appear here. If you have this product, contact support and choose Product safety.", "warning"],
      },
      unavailable: ["Lookup unavailable", "The lot service didn't respond. Your entry hasn't been lost: try again in a moment."],
    },
    cart: {
      empty: ["Your bag is empty", "Start with an ingredient you already know, or browse all seven."],
      note: "One-time purchases. Prices, tax and delivery shown here are samples, and no money is collected in the preview.",
      next: [["/policies/shipping", "How delivery works"], ["/policies/returns", "Returns and refunds"], ["/help", "Help centre"]],
    },
    checkout: {
      lede: "Check out as a guest. Use sample details only: no payment is taken and no messages are sent.",
      steps: ["Delivery", "Payment", "Confirm"],
      after: [
        ["We hold your items", "Creating the order reserves preview stock for 15 minutes."],
        ["You complete payment", "The preview payment step lets you try a success or a failure."],
        ["You can sign in later", "Use your mobile number to bring guest orders into an account."],
      ],
      privacy: "We use these details only to fulfil and support this preview order. Marketing choices are separate and start unticked.",
      cod: "Cash on delivery isn't available yet. How the ₹150 COD amount and courier charge would work is still being decided.",
    },
    account: {
      lede: "Track orders, keep addresses and follow support cases with your mobile number.",
      signIn: "Sign in with your mobile number to see orders from this session and pick up matching guest orders.",
      otp: "A local code appears on screen in the preview. No SMS is sent. Real OTP and email fallback need provider setup.",
    },
    help: {
      lede: "Find a quick answer, or open a case and keep the whole conversation in one place.",
      topics: [
        ["orders", "Orders & delivery", "Track a preview order, understand delivery charges and what happens after you pay.", "/account", "Track an order"],
        ["returns", "Returns & replacements", "What's decided, what isn't, and how to raise an issue with an order.", "/policies/returns", "Read the working policy"],
        ["labels", "Products & labels", "Ingredients, formats and which label details are still awaiting approval.", "/learn/reading-a-label", "Read the label guide"],
        ["reports", "Lot reports", "Find the record for your pack, and what each result state means.", "/reports", "Look up a lot"],
        ["account", "Account & sign-in", "Sign in with your mobile number and claim orders placed as a guest.", "/account", "Go to your account"],
        ["safety", "Product safety", "Something wrong with a product? Open a priority case and we'll keep it separate.", "/contact?kind=safety", "Report a product issue"],
      ],
      faqs: [
        ["orders", "Can I buy without an account?", "Yes. Checkout works as a guest. Sign in later with your mobile number and matching guest orders from the same session move into your account."],
        ["orders", "When will my order arrive?", "Delivery dates depend on courier setup that isn't connected yet, so the preview doesn't promise a date. The pincode check confirms the format only."],
        ["orders", "Are these the final prices?", "No. Every price in the preview is a sample. Final prices, GST, shipping rules and offers are still being approved."],
        ["returns", "How do returns work?", "Return eligibility, timing and remedies are still being approved. The working policy explains what's undecided; the preview doesn't promise a return window."],
        ["returns", "Can I cancel an order?", "In the preview you can cancel while an order is pending or paid. Once it's marked shipped, open a support case. The final cancellation rule is still being confirmed."],
        ["labels", "Where are the full product details?", "Each product page separates what's confirmed now from the amounts, directions, cautions and allergens that will come from the approved rear label."],
        ["labels", "Is everything vegetarian?", "Not necessarily. Omega-3 Fish Oil comes from fish, and capsule and softgel materials aren't confirmed yet. Dietary marks will appear only from approved labels."],
        ["reports", "Where do I find my lot report?", "Choose your product on the lot reports page and enter the lot number printed on the pack. The preview has sample records so you can try it."],
        ["reports", "Does a report prove my bottle is genuine?", "No. A report describes a sample from one lot. Checking an individual pack would need a separate unit code, and that hasn't been decided."],
        ["account", "How do I sign in?", "Use your Indian mobile number. In the preview, a code appears on screen instead of an SMS."],
        ["safety", "Who do I contact about a product issue?", "Open a support case and choose Product safety. It's flagged as a priority and you get a case ID to follow."],
      ],
    },
    contact: {
      lede: "Every case gets an ID and stays in your account. The preview sends no external messages.",
      channels: [["WhatsApp", "Business number to be confirmed"], ["Email", "Support address to be confirmed"], ["Phone", "Initial phone support planned; number and hours to be confirmed"]],
      privacy: "Share only what we need to help: your order ID and a short description. Please don't include medical records, card numbers or passwords.",
      safety: "Choose Product safety for a dedicated priority case. In this preview the case stays local; no safety outreach or recall starts automatically.",
    },
    settings: {
      lede: "Choose which optional messages and analytics you allow. In the preview, these choices are stored in this browser only.",
      groups: [
        { title: "Always on", items: [["Necessary records", "Your session, bag and preview orders. The site can't work without these, and they're never used for marketing."]] },
        { title: "Optional messages", items: [["email", "Email updates", "News about products and the shop. Unticked unless you choose it."], ["whatsapp", "WhatsApp updates", "The same, on WhatsApp. Unticked unless you choose it."]] },
        { title: "Optional analytics", items: [["analytics", "First-party usage events", "Lets the preview count simple events such as page views and bag adds, without contact details. No external analytics tools are connected."]] },
      ],
    },
    notFound: ["Page not found", "That link doesn't lead anywhere. It may have moved, or the address may be mistyped."],
  };

  /* ---------- Guides ---------- */
  var guides = {
    "reading-a-label": {
      topic: "labels",
      title: "Read a label with confidence",
      short: "Read a label",
      summary: "Ingredient names, serving sizes and the other details on your pack.",
      opening: "A supplement label is a short document with a lot to say. Read in the right order, it tells you what you're taking, how much of it, and what to watch for. This guide works for any label, not only ours.",
      takeaways: ["Read every amount together with its serving size.", "Look for the full ingredient name, including its form.", "Find directions, warnings, allergens and storage before you buy.", "Keep the lot number: it links your pack to its batch."],
      sections: [
        { id: "serving", h: "Start with the serving", html: "<p>Every amount on a label refers to a serving, and a serving isn't always one unit. If the serving is two capsules, the amount per serving comes from two capsules together. Before comparing two products, check that you're comparing the same thing: the amount per serving, the number of units in that serving, and how many servings are in the pack.</p><p>The serving size is set by the label's directions. It isn't a suggestion from us, and it isn't something to work out from the front of the pack.</p>" },
        { id: "names", h: "Read the full ingredient name", html: "<p>The headline on the front of a pack is a summary. The ingredient list tells you exactly what's inside, including the form of each ingredient: a mineral as a particular salt or chelate, a vitamin in a named form, an oil with its active fatty acids. The form can change how much of the active ingredient a given weight contains, so it belongs next to the quantity. Our guide to <a href=\"/learn/ingredient-forms\">ingredient forms</a> goes further.</p><p>Also look at what else is in the product. Capsule shells, softgel materials, sweeteners in chews and other added ingredients should all be listed.</p>" },
        { id: "statements", h: "The statements an Indian health supplement label carries", html: "<p>In India, health supplements are regulated by FSSAI. Its health-supplement regulations require the label to carry, among other things:</p><ul><li>the words <strong>“HEALTH SUPPLEMENT”</strong>;</li><li>the amount of each nutrient or substance with a nutritional or physiological effect;</li><li>the advisory <strong>“NOT FOR MEDICINAL USE”</strong>, displayed prominently;</li><li>where applicable, amounts as a percentage of the ICMR recommended daily allowances, with the warning “Not to exceed the recommended daily usage”;</li><li>a statement that the product isn't a substitute for a varied diet;</li><li>warnings, precautions, known side effects, contraindications and interactions, as applicable;</li><li>a statement that the product should be stored out of the reach of children.</li></ul><p>The same regulations don't allow a health supplement to claim that it prevents, treats or cures a disease. If a product makes that kind of promise, read it as a warning sign.</p><p class=\"bcc-aside\">This is a reading aid, not a legal assessment. It summarises the regulation text listed in the sources below; check the current consolidated regulations for anything you rely on.</p>" },
        { id: "warnings", h: "Find directions, warnings and allergens", html: "<p>Directions tell you how much to take, how often and how. Warnings and precautions tell you who should take extra care. Allergen information tells you whether the product contains, for example, fish. Read all three before you buy, not after the pack arrives.</p><p>If you have a health condition, are pregnant or breastfeeding, or take regular medication, ask a qualified health professional before adding a supplement.</p>" },
        { id: "lot", h: "Keep the lot number", html: "<p>Your pack's lot number links it to the manufacturing batch it came from. It's different from a barcode, a product code or your order number. Keep it handy: it's what you'll need to <a href=\"/reports\">look up a lot record</a>, and what support will ask for if something seems wrong.</p>" },
      ],
      example: {
        title: "An illustrative label, read in order",
        note: "Fictional example for reading practice only. These numbers don't describe any Body Café Co. product.",
        rows: [["Serving size", "2 capsules"], ["Servings per pack", "30"], ["Example mineral (as a named compound)", "20 mg per serving"], ["Other ingredients", "Capsule shell (material named), bulking agent"], ["Warnings", "Listed in full"], ["Lot", "EX-0000-00"]],
        reading: "Here the 20 mg refers to two capsules together, so one capsule holds half that amount. The compound is named, so you can check whether 20 mg is the mineral itself or the whole compound. The pack holds 60 capsules in total.",
      },
      checklist: ["Serving size and units per serving", "Amount per serving, with units", "Full ingredient names, including forms", "Other ingredients and shell materials", "Directions for use", "Warnings, precautions and allergens", "Storage instructions", "Manufacturer or marketer details", "Lot number and dates"],
      related: ["ingredient-forms", "understanding-reports"],
      sources: [SRC.fssai],
    },
    "understanding-reports": {
      topic: "evidence",
      title: "What a lot report shows",
      short: "Read a lot report",
      summary: "The difference between a product, a manufacturing lot and a tested sample.",
      opening: "“Tested” can mean almost anything. A good lot report is specific: which batch, which sample, which tests, which limits. This guide explains how to read one, and how to spot what a report can't tell you.",
      takeaways: ["A product is made in many lots; a report describes one.", "Results only mean something next to their units and limits.", "A pass needs a reviewed specification to compare against.", "A report doesn't authenticate an individual pack."],
      sections: [
        { id: "lot", h: "A product is not a lot", html: "<p>A product is a recipe and a label. A lot (or batch) is one production run of that product. A sample is the portion of a lot that was actually tested. A report should name all three, so you can tell whether it describes the pack in your hand or just the product in general.</p>" },
        { id: "identify", h: "What a report should identify", html: "<ul><li><strong>The product and lot</strong> it describes, matching the lot number on your pack.</li><li><strong>The sample</strong>: when it was taken and what it was.</li><li><strong>Each test</strong> performed, and the method used.</li><li><strong>Each result</strong>, with its unit.</li><li><strong>The specification</strong> the result is compared against.</li><li><strong>The source document</strong>, in a version that can be published, with its version and date.</li></ul><p>If any of these is missing, the report is telling you less than it seems to.</p>" },
        { id: "results", h: "Reading a result", html: "<p>A number on its own isn't a verdict. Read the test, the result, the unit and the limit together. A result described as a “pass” should point to the specification it passed. Where a laboratory reports that something wasn't detected, the report should say what level the method can detect, so you know what “not detected” means for that test.</p>" },
        { id: "limits", h: "What a report can't prove", html: "<p>A lot report describes a sample from one batch at one time. It isn't a clinical trial, it doesn't predict how a product will work for you, and it doesn't prove that one particular pack is genuine. Research about an ingredient isn't the same thing as testing a finished product, either.</p>" },
        { id: "states", h: "What you may see on our lookup", html: "<p>When you look up a lot, the result is one of a few states. <strong>Lot found</strong> means the lot belongs to the product you chose. <strong>No matching lot</strong> usually means a typo or the wrong product. <strong>Not published yet</strong> means a record exists but isn't ready to view; it doesn't mean anything passed or failed. <strong>Withdrawn</strong> means the lot has been taken off sale and you should follow the instructions shown. The preview uses sample records for each of these states.</p>" },
      ],
      example: {
        title: "An illustrative result line",
        note: "Fictional example for reading practice only. Not a Body Café Co. result, laboratory or document.",
        rows: [["Test", "Example contaminant screen"], ["Method", "Named method reference"], ["Result", "Not detected"], ["Detection level", "Stated, with unit"], ["Specification", "Reviewed limit, with unit"], ["Document", "Report version and date"]],
        reading: "“Not detected” is only meaningful because the detection level is given. The specification tells you what the result is being judged against.",
      },
      checklist: ["Product and lot match your pack", "Sample described", "Each test and method named", "Results given with units", "Specification stated", "Source document and version linked", "Limits of the report explained"],
      related: ["reading-a-label", "ingredient-forms"],
      sources: [],
    },
    "ingredient-forms": {
      topic: "forms",
      title: "Why ingredient forms matter",
      short: "Compare ingredient forms",
      summary: "Why the full ingredient name matters when you compare products.",
      opening: "Two labels can name the same ingredient and still not be comparable. The form an ingredient comes in, and whether an amount refers to the whole compound or just its active part, can change what a number means.",
      takeaways: ["The form is part of the ingredient's identity.", "Check whether an amount is the compound or the active part.", "Compare amounts in the same unit.", "For oils, look at the active fatty acids, not just the total."],
      sections: [
        { id: "compound", h: "Compound weight versus active amount", html: "<p>Minerals and some other ingredients come bound to something else. The weight of the whole compound isn't the same as the weight of the active part. The NIH Office of Dietary Supplements gives iron as an example: ferrous fumarate is 33% elemental iron by weight, ferrous sulfate 20% and ferrous gluconate 12%. So “100 mg” of one iron compound and “100 mg” of another don't contain the same amount of iron.</p><p>Creatine is similar. The same source notes that creatine monohydrate, the most widely studied form, is 88% creatine by weight.</p>" },
        { id: "units", h: "Same nutrient, different units", html: "<p>Vitamin D can be stated in micrograms (mcg) or International Units (IU). According to the NIH Office of Dietary Supplements, 1 mcg of vitamin D equals 40 IU. Convert before you compare, so you're comparing like with like.</p>" },
        { id: "named", h: "Named forms", html: "<p>Some vitamins come in several named forms. Vitamin D appears in supplements as D2 or D3. Vitamin K appears as K1 (phylloquinone) or as K2 menaquinones such as MK-4 or MK-7. A label should say which.</p>" },
        { id: "oils", h: "Oils: the total and the actives", html: "<p>For fish oil, the amount of oil and the amount of omega-3s are different numbers. The NIH Office of Dietary Supplements describes a typical fish oil supplement as about 1,000 mg of fish oil containing around 180 mg EPA and 120 mg DHA, and notes that amounts vary widely. Look for EPA and DHA stated separately.</p><p>Omega-3s also come in different chemical forms, including natural triglycerides, ethyl esters, re-esterified triglycerides, free fatty acids and phospholipids. Our Vitamin D3 + K2 includes omega-3 as triglycerides; its amounts await the approved label.</p>" },
        { id: "compare", h: "Compare like with like", html: "<p>For a formula with several ingredients, compare each declared component on its own. Line up the form, the amount, the unit and the serving size. If any of these is missing, you can't make a fair comparison yet. Our product pages will use the approved quantities and wording from each label.</p>" },
      ],
      example: {
        title: "An illustrative comparison",
        note: "Fictional example for reading practice only. Not Body Café Co. products or amounts.",
        rows: [["Label A", "Example mineral, 100 mg (as compound)"], ["Label B", "Example mineral, 30 mg (elemental)"], ["Serving A", "1 capsule"], ["Serving B", "2 tablets"]],
        reading: "These numbers can't be compared directly. Label A gives the compound weight, Label B the elemental amount, and the servings differ. You'd need the compound's elemental percentage and the same serving basis first.",
      },
      checklist: ["Full ingredient name and form", "Compound or active amount", "Unit, converted if needed", "Serving size on the same basis", "Each component of a formula compared separately"],
      related: ["reading-a-label", "understanding-reports"],
      sources: [SRC.iron, SRC.creatine, SRC.vitd, SRC.vitk, SRC.omega],
    },
  };

  /* ---------- Ingredient notes (all seven) ---------- */
  var notes = {
    "iron-bisglycinate": {
      lead: "Iron bisglycinate is iron bound to the amino acid glycine. As with any iron compound, the key number is how much iron itself a serving provides.",
      check: [["Elemental iron per serving", "The amount of iron itself, stated separately from the weight of the bisglycinate compound."], ["Serving size and count", "How many units make a serving, and how many units are in the pack."], ["Form named in full", "“Iron (as iron bisglycinate)” tells you more than “Iron”."], ["Warnings", "Iron products carry warnings and storage instructions; read them on the approved label."]],
      compound: "Different iron compounds contain different proportions of iron by weight. NIH's Office of Dietary Supplements, for example, lists ferrous fumarate at 33% elemental iron and ferrous sulfate at 20%. That's why compound weight and elemental iron should never be confused.",
      sources: [SRC.iron],
    },
    "l-theanine": {
      lead: "L-Theanine is an amino acid. The “L-” is part of its name and tells you which form it is.",
      check: [["Amount per serving", "The amount of L-theanine in one serving, with its unit."], ["Dosage form", "How it's presented, and how many units make a serving."], ["Free-from statements", "Statements such as caffeine-free belong on a label only when they're substantiated."], ["Other ingredients", "Capsule shell material and any other added ingredients."]],
      compound: "",
      sources: [],
    },
    "vitamin-d3-k2": {
      lead: "This is a formula with three named parts: vitamin D3, vitamin K2 and omega-3 as triglycerides. Each needs its own amount, unit and form.",
      check: [["Vitamin D3 amount and unit", "In mcg or IU. For vitamin D, 1 mcg equals 40 IU, so convert before comparing."], ["Vitamin K2 form and amount", "K2 comes as menaquinones such as MK-4 or MK-7. The label should say which, and how much."], ["Omega-3 amounts", "Omega-3 is included as triglycerides. Look for the amount, ideally with EPA and DHA stated."], ["Serving and source", "Serving size, and the dietary source of each ingredient."]],
      compound: "Vitamin D appears in supplements as D2 or D3, and vitamin K as K1 or K2 forms such as MK-4 and MK-7, according to NIH's Office of Dietary Supplements. Naming the form is part of naming the ingredient.",
      sources: [SRC.vitd, SRC.vitk, SRC.omega],
    },
    "omega-3-fish-oil": {
      lead: "With fish oil, the amount of oil and the amount of omega-3s are two different numbers. The useful ones are EPA and DHA.",
      check: [["Fish oil per serving", "The total amount of oil in a serving."], ["EPA and DHA", "Stated separately from the fish oil total."], ["Form", "Triglycerides, ethyl esters or another form."], ["Source and allergens", "The fish source, the softgel shell material and the allergen statement. Check these first if you avoid fish or other animal products; the approved label will state them."]],
      compound: "NIH's Office of Dietary Supplements describes a typical fish oil supplement as about 1,000 mg of fish oil with around 180 mg EPA and 120 mg DHA, and notes that amounts vary widely. Read the actives, not just the total.",
      sources: [SRC.omega],
    },
    "myo-d-chiro-inositol": {
      lead: "Two related ingredients in one product: myo-inositol and D-chiro inositol. A fair comparison needs both amounts, not just the combined total.",
      check: [["Each ingredient's amount", "Myo-inositol and D-chiro inositol stated separately, with units."], ["Ratio", "Any ratio should follow from the two stated amounts on the approved label, not from the front of a pack."], ["Serving size", "How many units make a serving."], ["Units per pack", "The total count, to work out servings per pack."]],
      compound: "",
      sources: [],
    },
    "creatine-chews": {
      lead: "A chew is a convenient format, but it adds a few things to check: how much creatine is in each chew, how many chews make a serving, and what else the chew contains.",
      check: [["Creatine form", "Which form of creatine is used. Our complete formulation is still pending."], ["Per chew and per serving", "Creatine per chew, and per serving if a serving is more than one chew."], ["Chews per pack, flavour and texture", "The count, the flavour and what the chew is like."], ["Nutrition information", "Chews can contain sugars, sweeteners and other ingredients; the full nutrition panel matters."]],
      compound: "Different creatine forms contain different amounts of creatine by weight. NIH's Office of Dietary Supplements notes that creatine monohydrate, the most widely used and studied form, is 88% creatine by weight.",
      sources: [SRC.creatine],
    },
    "psyllium-husk": {
      lead: "Psyllium husk is a source of fibre. The details that matter most are the form, the serving and how to take it.",
      check: [["Form and net weight", "How the product is presented and how much is in the pack."], ["Serving amount and fibre", "The amount per serving and the fibre it provides."], ["Directions", "How to take it, including any instructions about water."], ["Warnings", "The approved label's warnings, read in full."]],
      compound: "",
      sources: [],
    },
  };

  /* ---------- Policies ---------- */
  var policies = {
    shipping: {
      title: "Shipping & delivery",
      plain: "Delivery fees, serviceable pincodes and delivery dates aren't final. The preview uses an illustrative delivery charge and never promises a date.",
      sections: [
        ["How orders will ship", "Orders are planned to ship from one active warehouse, with two delivery partners named in the working plan: Vayuvega and Shipneer.", "Working direction"],
        ["Delivery charges", "The preview uses an illustrative ₹75 delivery charge, waived on a sample subtotal after discount of ₹1,499 or more. This is not the approved shipping policy.", "Preview behaviour"],
        ["Serviceability and dates", "The pincode check confirms format only. Serviceable areas and delivery estimates need courier configuration and haven't been set.", "Unresolved"],
        ["Cash on delivery", "Cash on delivery isn't available. Whether the ₹150 COD amount would be collected in advance or as a fee, and how the courier's charge would apply, is still being decided.", "Unresolved"],
      ],
    },
    returns: {
      title: "Returns & refunds",
      plain: "Return eligibility, timing and remedies haven't been decided. If something's wrong with an order, open a support case and we'll keep it on record.",
      sections: [
        ["What's decided", "Returns and replacements will be handled through support cases, so every request has an ID and a record.", "Working direction"],
        ["What isn't decided", "Which items can be returned, how long you'll have, who pays return shipping and which remedies apply are all still being approved. No return window is promised in the preview.", "Unresolved"],
        ["Product issues and safety", "Product safety concerns are always handled as a separate priority case, regardless of return eligibility.", "Working direction"],
        ["Refunds in the preview", "Preview refunds are accounting demonstrations. They need a second person's approval and don't move money.", "Preview behaviour"],
      ],
    },
    cancellation: {
      title: "Cancellation",
      plain: "The working direction allows cancellation before shipment begins. Exactly where that line falls, and who approves it, is still being confirmed.",
      sections: [
        ["Working direction", "Orders can be cancelled before shipment is initiated.", "Working direction"],
        ["Still being confirmed", "The exact boundary, and whether cancellation is self-service or approved by support, haven't been finalised.", "Unresolved"],
        ["In the preview", "You can cancel while an order is pending or paid. Once it's marked shipped, a support case is needed.", "Preview behaviour"],
        ["Refunds after cancellation", "A paid cancellation restores preview stock and marks a refund pending. One Admin requests the refund and a different Admin must approve it.", "Preview behaviour"],
      ],
    },
    privacy: {
      title: "Privacy & your choices",
      plain: "The preview keeps session, order, address and support records in a local database. No marketing provider receives them, and optional choices start unticked.",
      sections: [
        ["What the preview stores", "Session, order, address and support data, in a local SQLite database. No marketing provider receives this data.", "Preview behaviour"],
        ["Your choices", "Email and WhatsApp marketing choices are separate and unticked by default. You can change them in Preferences.", "Working direction"],
        ["Still to come", "The production retention schedule, contact details and final privacy notice need approval.", "Unresolved"],
        ["Using the preview", "Please use sample data. Local demo sign-in is not production authentication.", "Preview behaviour"],
      ],
    },
    terms: {
      title: "Terms of the preview",
      plain: "This website is a working preview, not a live offer for sale. Prices, stock, reports and transactions are all illustrative.",
      sections: [
        ["Not a live store", "This website is a local functional preview, not a live offer for sale. All prices, stock, reports and transactions are illustrative.", "Preview behaviour"],
        ["Nothing real happens", "No real payments are accepted, shipments booked, laboratory reports issued or external messages sent.", "Preview behaviour"],
        ["Before launch", "Final terms of sale, business disclosures, taxes, product information and integration acceptance are required.", "Unresolved"],
      ],
    },
  };

  /* ---------- Synthetic fixtures for design states (never saved, never sent) ---------- */
  var now = Math.floor(Date.UTC(2026, 9, 18, 6, 30) / 1000);
  var fixtures = {
    contact: { name: "Sample Customer", mobile: "9000000000", email: "", pincode: "560001", address: "Flat 0, Sample Residency, Example Road", city: "Bengaluru", state: "Karnataka" },
    order: function (state, catalog) {
      var p = function (id) { return (catalog || []).find(function (x) { return x.id === id; }) || { id: id, name: id, price: 0 }; };
      var a = p("vitamin-d3-k2"), b = p("omega-3-fish-oil");
      var items = [{ id: a.id, name: a.name, quantity: 1, unit_price: a.price }, { id: b.id, name: b.name, quantity: 2, unit_price: b.price }];
      var subtotal = items.reduce(function (n, i) { return n + i.unit_price * i.quantity; }, 0);
      var steps = ["pending", "paid", "shipped", "delivered"];
      var upto = state === "cancelled" ? 1 : Math.max(0, steps.indexOf(state));
      var history = steps.slice(0, upto + 1).map(function (s, i) { return { state: s, at: now + i * 86400 }; });
      return {
        id: "SAMPLE-1042", sample: true, state: state, created: now, expires: now + 900, items: items, subtotal: subtotal, discount: 0, shipping: subtotal >= 1499 ? 0 : 75,
        total: subtotal + (subtotal >= 1499 ? 0 : 75), history: history, contact: fixtures.contact, policy_version: "preview-sample",
        provider: ["shipped", "delivered"].indexOf(state) >= 0 ? "Sample courier" : "", tracking: ["shipped", "delivered"].indexOf(state) >= 0 ? "SAMPLE-TRACK-0000" : "",
        refund: state === "cancelled" ? "approval_pending" : "none",
      };
    },
    addresses: function () { return [fixtures.contact]; },
    cases: [{ id: "SAMPLE-CASE-01", kind: "delivery", state: "investigating", message: "Sample case: asking when my preview order will be shipped.", owner: "Support", sla: "Sample status", order_id: "SAMPLE-1042" }],
  };

  /* Every visual state a reviewer can open, per route. Used by /preview/states and the static export. */
  var states = [
    ["Checkout", [["/checkout?state=sample", "Filled checkout (sample details, disabled)"], ["/checkout?state=errors", "Field errors"], ["/checkout?state=unavailable", "Ordering unavailable"]]],
    ["Payment", [["/payment/SAMPLE-1042?state=pending", "Payment pending"], ["/payment/SAMPLE-1042?state=failed", "Payment failed, retry"], ["/payment/SAMPLE-1042?state=paid", "Payment received"], ["/payment/SAMPLE-1042?state=expired", "Reservation expired"], ["/payment/SAMPLE-1042?state=unavailable", "Payment service unavailable"]]],
    ["Order", [["/orders/SAMPLE-1042?state=paid", "Confirmed"], ["/orders/SAMPLE-1042?state=shipped", "On its way"], ["/orders/SAMPLE-1042?state=delivered", "Delivered, review invitation"], ["/orders/SAMPLE-1042?state=cancelled", "Cancelled, refund pending"]]],
    ["Account", [["/account?state=signed-out", "Sign in"], ["/account?state=code", "Code entry"], ["/account?state=empty", "Signed in, no orders"], ["/account?state=orders", "Signed in, orders"], ["/account/addresses?state=sample", "Saved addresses"], ["/account/cases?state=sample", "Support cases"]]],
    ["Contact", [["/contact?state=errors", "Form errors"], ["/contact?state=submitted", "Case created"], ["/contact?state=unavailable", "Support unavailable"]]],
    ["Lot reports", [["/reports?product=vitamin-d3-k2&lot=DEMO-03-01", "Sample match"], ["/reports?product=vitamin-d3-k2&lot=UNKNOWN", "No match"], ["/reports?product=vitamin-d3-k2&lot=DEMO-UNPUBLISHED", "Not published"], ["/reports?product=vitamin-d3-k2&lot=DEMO-WITHDRAWN", "Withdrawn"], ["/reports?product=vitamin-d3-k2&lot=DEMO-OUTAGE", "Service unavailable"]]],
    ["Shop & search", [["/shop?format=Softgels", "Filtered"], ["/shop?format=Gummies", "No match"], ["/search?q=omega", "Search results"], ["/search?q=xyz", "No results"]]],
  ];

  /* ---------- Shared helpers ---------- */
  function words(html) { return String(html).replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length; }
  function minutes(g) {
    var n = words(g.opening) + g.sections.reduce(function (s, x) { return s + words(x.html); }, 0) + words(g.example.reading);
    return Math.max(2, Math.round(n / 200));
  }
  function sourceList(list, cls) {
    if (!list || !list.length) return "";
    return '<ol class="' + (cls || "bcc-sources") + '">' + list.map(function (s) { return '<li><a href="' + s[1] + '" rel="noopener" target="_blank">' + s[0] + "</a></li>"; }).join("") + "</ol>";
  }
  function noteSummary(id) { var n = notes[id]; return n ? n.lead : ""; }
  function guideMatches(q) {
    q = String(q || "").toLowerCase().trim();
    if (!q) return [];
    var out = [];
    Object.keys(guides).forEach(function (slug) {
      var g = guides[slug];
      var text = (g.title + " " + g.summary + " " + g.sections.map(function (s) { return s.h + " " + s.html; }).join(" ")).toLowerCase();
      if (text.indexOf(q) >= 0) out.push(["/learn/" + slug, g.title, g.summary, "Guide"]);
    });
    return out;
  }

  window.BCCSite = {
    themes: {},
    STATUS: STATUS,
    CARE_NOTE: CARE_NOTE,
    copy: copy,
    guides: guides,
    guideOrder: ["reading-a-label", "understanding-reports", "ingredient-forms"],
    notes: notes,
    policies: policies,
    policyOrder: ["shipping", "returns", "cancellation", "privacy", "terms"],
    fixtures: fixtures,
    states: states,
    minutes: minutes,
    sourceList: sourceList,
    noteSummary: noteSummary,
    guideMatches: guideMatches,
  };
})();
