/* Body Café Co. — Version E content layer.
   One place for the Version E brand story and site copy ("Ask what's in it" / "A little more knowing.").
   It changes words only: no layout, colour, type, image, interaction or data changes.

   Scope: active only when the page loads with direction E (?design=e, or E remembered in this tab).
   Other directions (A–D, F–H) never see these overrides.

   Facts policy: nothing here states an amount, a test result, a supplier, a country of origin or a health outcome.
   Product facts still come from the catalogue and the approved rear labels. See docs/version-e/ for the
   master brand story, the content replacement register and the claims that need approval. */
(function () {
  "use strict";

  function designOnLoad() {
    try { if (window.BCCRelease && window.BCCRelease.production) return "b"; } catch (e) {}
    var all = ["a", "b", "c", "d", "e", "f", "g", "h"], req = null, stored = null;
    try { req = new URL(location.href).searchParams.get("design"); } catch (e) {}
    try { stored = sessionStorage.getItem("bcc-design"); } catch (e) {}
    return all.indexOf(req) > -1 ? req : all.indexOf(stored) > -1 ? stored : "b";
  }
  var active = designOnLoad() === "e";

  /* ---------------------------------------------------------------- the brand, in one place */
  var BRAND = {
    belief: "Before you take something every day, you should be able to know exactly what it is.",
    tagline: "A little more knowing.",
    signature: "Ask what's in it.",
    intro: "Body Café Co. makes everyday supplements that tell you what's in them. Every product is named for its ingredient, in the form it actually takes, with its own cap colour, and every pack leads to the record for its batch. Detail first, trust after. Ask what's in it.",
  };

  /* Product lines: one consistent system. [What it is, named properly] + [the detail we make plain].
     No amounts, outcomes or sourcing claims: those come from the approved label. */
  var PRODUCTS = {
    "iron-bisglycinate": { line: "Iron as bisglycinate, with the iron itself counted." },
    "l-theanine": { line: "An amino acid also found in tea, measured on its own." },
    "vitamin-d3-k2": { line: "Two vitamins and an omega-3 oil, each named in full." },
    "omega-3-fish-oil": { line: "The omega-3 counted apart from the oil around it." },
    "myo-d-chiro-inositol": { line: "Two inositols, two amounts, never one total." },
    "creatine-chews": { line: "Creatine as a chew, so the routine is easy to keep." },
    "psyllium-husk": { line: "Isabgol, the fibre you know, in measured capsules." },
  };

  var DATA = {
    /* site.js shared copy (S.copy): only keys listed here change */
    copy: {
      shop: {
        lede: "Seven everyday supplements, each named for what's in it and given its own cap colour. Every page shows the ingredient and format first, then links to its label details and lot record.",
        guidanceTitle: "How to choose without guessing",
      },
      standards: {
        lede: "Detail first, trust after. Here's what you can already check, what's still being prepared, and what we've decided never to do.",
      },
      story: {
        lede: "Asking what's in something is one of the most ordinary habits we have.",
        opening: "Most supplement shopping asks for trust first and offers detail later, if at all. A big number on the front can measure the oil rather than the omega-3 inside it, or the weight of a compound rather than the mineral. Blends hide individual amounts. Badges arrive without documents. So the careful buyer does the work alone, with a screenshot of the back label and a search late at night. We think it should work the other way round: detail first, trust after.",
        chapters: [
          { title: "Why a café?", body: "A good café is an everyday place. Nobody minds if you ask what's in something, and the menu tells you before you order. That's the standard we hold ourselves to: before you take something every day, you should be able to know exactly what it is. The café isn't a theme. It's how a counter should treat a question." },
          { title: "Who it's for", body: "We're making this for people who read labels, compare products and would rather check than be told, and for anyone who has ever wondered what exactly is in the bottle. You don't need a science degree. You do deserve straight answers, in plain English first, with room for more languages later." },
          { title: "Seven on the counter", body: "Our first collection is seven everyday supplements, from iron to isabgol, and each one follows the same rules. We name the form, because it's part of the ingredient. We state the amount of the thing itself, per serving. We put how and when to take it in plain words, next to the facts. And every pack carries a lot number that leads to the record for its batch. Each gets its own cap colour, so the range is easy to read from across a kitchen shelf." },
          { title: "Playful, never vague", body: "We'd like supplements to feel less clinical and more like something you can talk about. But a light tone is never a reason to blur a fact. If something isn't confirmed yet, we say so plainly instead of filling the gap with a claim." },
        ],
      },
      learn: {
        lede: "Short, practical guides to reading any supplement label, comparing ingredient forms and understanding what a lot report can show. A little more knowing, without the jargon.",
      },
    },

    /* Version E homepage (site-e.js) */
    e: {
      heroKicker: "01 — 07 · Seven everyday supplements",
      heroTitle: "Ask what's <span>in it.</span>",
      heroLede: "Seven everyday supplements, one cap colour each. Every label names the ingredient's form and the amount that matters, and every pack leads to the record for its batch.",
      colTitle: "Open a colour.",
      colLede: "Every colour is one product, named for what's in it. Open one to see the bottle, the format and the sample price.",
      curLede: "Every product has one question worth asking first. Choose a colour and see what to look for on its label, or on anyone's.",
      voices: "No reviews yet. We'll wait for real ones.",
      faqTitle: "Good questions welcome here.",
      footer: "Everyday supplements that tell you what's in them. One cap colour each.",
      pdpLotTitle: "Every pack points to its batch.",
      reportsTitle: "Your lot, your record",
    },

    /* about.js content object */
    about: {
      title: "A supplement shop that shows its working",
      meet: [
        "We make everyday supplements that tell you what's in them: the ingredient, the form it takes, the label and the record for your lot.",
        "We believe that before you take something every day, you should be able to know exactly what it is. We're making this for people in India who read labels, compare products and would rather check than be told.",
      ],
      view: "Our point of view is simple: detail first, trust after.",
      why: {
        problem: "Most supplement shopping asks for trust first and offers detail later, if at all. We think it should work the other way round.",
        experience: "Before you choose, you should be able to see what's in a product, in what form, how much of the thing itself, and where the record for your bottle lives. You don't need a science degree. You do deserve straight answers, in plain English first.",
      },
      name: {
        body: "That's the counter we want to run: unhurried, curious and specific. The café isn't a theme. It's a standard: a question is always welcome, and the answer comes before you order.",
      },
      values: [
        { id: "clarity", title: "Clarity", line: "Name it properly. State the number that matters.", practice: "Every ingredient is named with its form, and every amount refers to the thing itself, per serving. Product pages separate what's confirmed now from what the approved rear label will add, in readable text rather than small print.", links: [["/products/iron-bisglycinate#ingredients", "See a product's ingredient details"], ["/learn/reading-a-label", "How to read a label"]] },
        { id: "curiosity", title: "Curiosity", line: "Questions are welcome. Unfamiliar words get explained.", practice: "Short guides and a glossary explain serving sizes, ingredient forms and lot numbers. Product pages take questions, answered by our support team after review.", links: [["/learn", "Open the guides"], ["/products/omega-3-fish-oil#questions", "Ask about a product"]] },
        { id: "accountability", title: "Accountability", line: "Show the record. Say what isn't ready.", practice: "Each pack carries a lot number that leads to its batch record. Where an approval or document is still on its way, the page says so. Records in this preview are demonstrations.", links: [["/standards#lot", "How packs link to lots"], ["/reports", "Look up a lot"]] },
        { id: "care", title: "Care", line: "A clear route to a person, and no promises we can't keep.", practice: "Support works through cases: each one gets an ID you can follow in your account. Product safety questions are flagged as a priority. We don't promise how a product will make you feel.", links: [["/contact", "Open a support case"], ["/help", "Visit the help centre"]] },
      ],
      collection: {
        lead: "Our first collection is seven everyday supplements, from iron to isabgol. Each is named for what's in it and follows the same rules: the form named, the amount that matters stated, the routine in plain words and the record one lot number away. Each has its own cap colour, so the range is easy to read from across the room.",
      },
      talk: {
        lead: "Ask us what's in something, why we chose a form, or how we work. Send a question to the team and you'll get a case ID to follow.",
      },
    },

    /* standards.js model: hero only */
    standards: {
      hero: {
        statement: "A good counter tells you what's in something before you order. This page does the same for every bottle: what it's made of, what each kind of record can show, and how to find the one for your batch.",
      },
    },

    /* lots.js content object */
    lots: {
      lede: "Every pack carries a lot number: the code for the batch it was made in. Choose your product, enter that number and see that batch's record: what was tested, how, and the documents behind it.",
    },

    /* story.js direction-E settings */
    storyV: {
      summary: "Body Café Co. began with an ordinary habit: asking what's in something before you have it. We do it at every café counter and every sweet shop, yet supplements we take every day are often bought on trust, with the detail left for later. We believe it should work the other way round. So every Body Café Co. product names its ingredient in the form it actually takes, states the amount of the thing itself, explains how to take it in plain words, and carries a lot number that leads to the record for its batch. Each has its own cap colour, so the range is easy to read at a glance. Where something isn't ready yet, we say so. Ask what's in it.",
      titles: { opening: "Ask what's in it", question: "The question we kept asking", name: "Becoming Body Café Co.", collection: "Making the first collection", next: "The next chapter" },
      openingLine: "We turn the biscuit packet over to look for the green dot. We ask whether the mithai is made in ghee. At a good café we read the menu before we order, and nobody minds a question. Then we reach the supplements we take every day, and the habit quietly disappears.",
      nextLead: "There will be more products, in new forms and formats, made wherever the right ingredient is made. The rules won't change: name it, state it, explain it, show the record. Curiosity is a good place to start. It's how we choose what we eat and who we trust, and it deserves a place in what we take every day.",
    },

    /* learn.js direction-E settings */
    learnV: {
      lede: "Short, sourced guides to our seven products, to reading any supplement label, and to what evidence and lot reports can and can't show. Free to read, no account needed. Curiosity is a good place to start.",
    },

    seo: {
      home: "Ask what's in it — Body Café Co.",
      description: "Body Café Co. makes everyday supplements that tell you what's in them: the ingredient and its form, the amount that matters, plain directions and a lot number that leads to the batch record. Seven to start, one cap colour each.",
    },
  };

  /* ---------------------------------------------------------------- helpers */
  function isObj(x) { return x && typeof x === "object" && !Array.isArray(x); }
  function deep(target, src) {
    Object.keys(src).forEach(function (k) {
      if (isObj(src[k]) && isObj(target[k])) deep(target[k], src[k]);
      else target[k] = src[k];
    });
    return target;
  }
  /* Merge a named block into a module's own content object, in place, only for direction E. */
  function merge(name, target) { if (active && target && DATA[name]) deep(target, DATA[name]); return target; }
  function line(p) { return active && p && PRODUCTS[p.id] && PRODUCTS[p.id].line ? PRODUCTS[p.id].line : p ? p.subtitle : ""; }
  function seo(path, shown) {
    if (!active) return;
    if (path === "/") document.title = DATA.seo.home;
    var m = document.querySelector('meta[name="description"]');
    if (m && !shown) m.setAttribute("content", DATA.seo.description);
    if (m && shown) m.setAttribute("content", shown.name + ": " + line(shown) + " " + "Body Café Co. — a little more knowing.");
  }

  /* site.js has already run: apply its shared copy and the notes now. */
  if (active && window.BCCSite) {
    deep(window.BCCSite.copy, DATA.copy);
  }

  window.BCCContentE = { active: active, brand: BRAND, products: PRODUCTS, data: DATA, e: DATA.e, merge: merge, line: line, seo: seo };
})();
