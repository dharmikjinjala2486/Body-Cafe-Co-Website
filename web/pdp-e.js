/* Body Café Co. — Variant E · product pages: the reference product copy.
   From the owner-selected reference (design-review/story-source-2026-11-02/reference-index.html: product(slug), PRODUCTS),
   reproduced verbatim except where the supplied master label differs; every change is listed in ADAPTED and checked by
   design-tools/test-pdp-e-content.mjs. "Why this form" and "Form" come from standards-e.js so both pages share one text.
   Label facts (Supplement Facts panel, front-of-label text including the claim as printed, directions tag, timing wording,
   customer care, pack-printed fields) come from web/label-records.json, checked against the master label by
   design-tools/test-label-records.mjs. The L-Theanine supply banner waits on an owner decision. Admin fields are untouched:
   this adds sections, it never replaces catalogue text. */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE, SE = window.BCCStandardsE;
  if (!S || !S.themes || !S.themes.e || !L || !SE) return;
  var esc = L.esc;

  var LABELS = { whatsInside: "What's inside", per: "Per ", amount: "Amount", rda: "% RDA", rdaNote: "%RDA as per ICMR 2020 guidelines (men, moderate work). — = %RDA not established.",
    when: "When to take it", keep: "Keep in mind", form: "Form", why: "Why this form", story: "The story", check: "How we check it",
    slots: [["morning", "Morning"], ["noon", "Noon"], ["night", "Night"]], best: "Best", fine: "Also fine" };
  // Per product, in reference order. `best` is the slot the supplied label marks "Best"; the label marks the other two "Also fine".
  var P = {
    "vitamin-d3-k2": { headline: "Two fat-soluble vitamins. One oil. On purpose.", best: "morning", keep: "Contains gelatin, fish oil and soy.",
      intro: "Vitamin D3 and vitamin K2 (as MK-7) in one softgel, carried in omega-3 fish oil as triglycerides. 600 IU of D3 and 55 mcg of K2 per softgel, each 100% of the ICMR RDA. One softgel every morning, with food.",
      amounts: [["Vitamin D3 (cholecalciferol)", "600 IU", "100% RDA"], ["Vitamin K2 (as MK-7)", "55 mcg", "100% RDA"], ["Fish oil concentrate (anchovy)", "250 mg", "—"], ["Omega-3 as triglycerides", "200 mg", "—"], ["EPA as TG", "100 mg", "—"], ["DHA as TG", "75 mg", "—"]],
      trust: "Made by Asoj Soft Caps Pvt. Ltd., Baroda, Gujarat, in a GMP-certified facility. Third-party tested, made with traceable ingredients, with no hidden blends. %RDA values as per ICMR 2020. 60 softgels per bottle. Scan the code on the pack for more.",
      story: "Vitamin D3 and vitamin K2 are both fat-soluble, which means they belong in oil. So rather than pressing them into a dry tablet, we put them in a softgel filled with omega-3 fish oil, in triglyceride form. Then we told you everything. Each softgel contains 600 IU of vitamin D3 and 55 mcg of vitamin K2 as MK-7, each 100% of the ICMR recommended daily allowance, plus 200 mg of omega-3. The label also tells you when to take it: one softgel in the morning, with food. That is how we approach every product. Name the form. State the amount. Make the routine obvious. Prove it, with a named manufacturer and third-party testing. What is left for you is simple: a softgel beside breakfast, and the quiet confidence of knowing exactly what it is." },
    "omega-3-fish-oil": { headline: "Count the omega-3, not the oil.", best: "morning", keep: "Contains gelatin, fish oil and soy.",
      intro: "Anchovy fish-oil concentrate with 800 mg of omega-3 per softgel, in triglyceride form: 400 mg EPA and 300 mg DHA. One softgel every morning with food. Third-party tested, with every amount on the label.",
      amounts: [["Fish oil concentrate (anchovy)", "1000 mg", "—"], ["Total omega-3 as triglycerides", "800 mg", "—"], ["EPA as TG", "400 mg", "—"], ["DHA as TG", "300 mg", "—"]],
      trust: "Made by Asoj Soft Caps Pvt. Ltd., Baroda, Gujarat, in a GMP-certified facility. Third-party tested, traceable ingredients, no hidden blends. Per softgel: fish oil concentrate 1000 mg, omega-3 800 mg as triglycerides (EPA 400 mg, DHA 300 mg). 60 softgels. Contains fish, gelatin and soy.",
      story: "Fish oil labels love a big number. Often it is the weight of the oil, not the omega-3 inside it. We think you deserve both numbers, clearly separated. Each of our softgels holds 1000 mg of anchovy fish-oil concentrate, which contains 800 mg of omega-3: 400 mg of EPA and 300 mg of DHA. We also tell you the form. Our omega-3 is in triglyceride form, and we print that on the front, because form is one of the first things a careful buyer asks about. The routine is simple: one softgel each morning, with food. It is made by a manufacturer we name on the pack, in a GMP-certified facility in Gujarat, and it is third-party tested. No guesswork, no small print. Just one softgel, and everything you need to know about it." },
    "iron-bisglycinate": { headline: "Iron first. Chai later.", best: "morning", keep: "Avoid milk for 2 hours before or after taking the capsule.",
      intro: "29 mg of iron per capsule, as Ferrochel® ferrous bisglycinate chelate, 100% of the ICMR RDA. Take one capsule each morning on an empty stomach, and keep milk away for two hours before or after. Iron first, chai later.",
      amounts: [["Iron (as Ferrochel® ferrous bisglycinate chelate)", "29 mg", "100% RDA*"]], rdaNote: "*%RDA as per ICMR 2020 guidelines (women, moderate work).",
      trust: "Made by Vebe Lifecare Pvt. Ltd., Baroda, Gujarat, in a GMP-certified facility. Third-party tested, traceable ingredients, no hidden blends. Per capsule: iron 29 mg as Ferrochel® ferrous bisglycinate chelate, 100% RDA as per ICMR 2020 (women, moderate work). 60 HPMC capsules per bottle.",
      story: "Iron is one of the most common supplements in Indian homes, and one of the least explained. Which form is it? How much iron does each capsule actually give you? When should you take it, and with what? We answer all three on the label. Our iron is Ferrochel® ferrous bisglycinate chelate: iron bound to the amino acid glycine. Each capsule provides 29 mg of iron, 100% of the ICMR recommended daily allowance for women doing moderate work. And the routine matters as much as the form: one capsule in the morning, on an empty stomach, with no milk for two hours before or after. In most Indian homes, that means one simple rule: iron first, chai later. It is made by a manufacturer we name on the pack, in a GMP-certified facility, and third-party tested. Nothing hidden, including the timing." },
    "psyllium-husk": { headline: "The isabgol you know, measured in capsules.", best: "night", keep: "Always take with a full glass of water.",
      intro: "Psyllium husk, the isabgol you already know, measured into capsules. Five capsules give you 2000 mg of psyllium husk and 1,578 mg of dietary fibre. Take once daily at night, with food and a full glass of water. 150 capsules: 30 servings.",
      amounts: [["Psyllium husk (isabgol)", "2000 mg", "—"], ["Dietary fibre", "1,578 mg", "5.26%"], ["Soluble fibre", "1,362 mg", "—"], ["Added sugar", "0 g", "0%"]],
      trust: "Made by U-Liva Nutrition LLP, Rajkot, Gujarat, in a GMP-certified facility. Third-party tested, traceable ingredients, no hidden blends. Per 5 capsules: psyllium husk 2000 mg; dietary fibre 1,578 mg; soluble fibre 1,362 mg; no added sugar. 150 capsules per bottle.",
      story: "Isabgol needs no introduction in most Indian homes. What it usually lacks is measurement. A spoonful here, a heaped spoon there, stirred into water and finished in a hurry. We kept the ingredient everyone knows and made the amount exact. Five capsules give you 2000 mg of psyllium husk, which provides 1,578 mg of dietary fibre, including 1,362 mg of soluble fibre. The label also tells you when: once a day, at night, with food and a full glass of water. That last part matters, so we put it where you can see it. As with everything we make, the manufacturer is named on the pack: U-Liva Nutrition LLP, Rajkot, in a GMP-certified facility. It is third-party tested, with no hidden blends. Familiar ingredient, clear amount, simple routine." },
    "myo-d-chiro-inositol": { headline: "Two inositols. One ratio. 40:1, on the front.", best: "morning", keep: "—",
      intro: "Myo-inositol and D-chiro-inositol in a 40:1 ratio, printed on the front. Three capsules give you 2000 mg of myo-inositol and 50 mg of D-chiro-inositol. Take three capsules each morning with food. 90 capsules: 30 servings.",
      amounts: [["Myo-inositol", "2000 mg", "—"], ["D-chiro-inositol", "50 mg", "—"]],
      trust: "Made by U-Liva Nutrition LLP, Rajkot, Gujarat, in a GMP-certified facility. Third-party tested, traceable ingredients, no hidden blends. Per 3 capsules: myo-inositol 2000 mg, D-chiro-inositol 50 mg (40:1). 90 capsules per bottle. Consult a healthcare professional if pregnant, lactating or under medical care.",
      story: "Some products are easy to misread. Inositol is one of them, because two different forms are often sold together, and labels rarely show how much of each you get. We print both, and the ratio between them. Three capsules give you 2000 mg of myo-inositol and 50 mg of D-chiro-inositol: a 40:1 ratio, stated on the front of the pack. The routine is simple: three capsules in the morning, with food. It is made by U-Liva Nutrition LLP in Rajkot, Gujarat, in a GMP-certified facility, and third-party tested, with no hidden blends. This is the same principle behind every Body Café Co. product. Name the form. State the amount. Tell you when. When two ingredients work together, you deserve to see both numbers, not one total." },
    "creatine-chews": { headline: "3 grams of creatine. Two chews. Your time.", best: "morning", keep: "Chew; do not swallow the tablets whole.",
      intro: "3000 mg of creatine monohydrate in two orange chewable tablets. Choose one time of day, morning, noon or night, and stay consistent. Chew; don't swallow whole. 60 chewable tablets: 30 servings. Contains 3.6 g added sugar per serving.",
      amounts: [["Creatine monohydrate", "3000 mg", "—"], ["Added sugar", "3.6 g", "7.2%"]],
      trust: "Made by Vebe Lifecare Pvt. Ltd., Baroda, Gujarat, in a GMP-certified facility. Third-party tested, traceable ingredients, no hidden blends. Per 2 tablets: creatine monohydrate 3000 mg; added sugar 3.6 g. 60 chewable tablets per bottle. Adults only. Not for medicinal use.",
      story: "Creatine is one of the simplest supplements there is, and one of the easiest to forget. Scoops get skipped, shakers get left at the gym. So we made it something you chew. Two orange-flavoured chewable tablets give you 3000 mg of creatine monohydrate. The label is honest about everything else, too: the flavour comes with 3.6 g of added sugar per serving, and we print that clearly. The routine on the label is the one that actually works with creatine: choose one time, morning, noon or night, and stay consistent. Chew the tablets; do not swallow them whole. Like every Body Café Co. product, it is made by a manufacturer we name on the pack, Vebe Lifecare in Baroda, in a GMP-certified facility, and it is third-party tested. One form, one number, and a routine you can actually keep." },
    "l-theanine": { headline: "One amino acid. 200 mg. Nothing else active.", best: "morning", keep: "—",
      intro: "200 mg of L-theanine, the amino acid found naturally in green tea, in one capsule. Take one capsule a day, best in the morning, with food or on an empty stomach. A single ingredient, clearly measured.",
      amounts: [["L-Theanine", "200 mg", "—"]],
      trust: "Made by U-Liva Nutrition LLP, Rajkot, Gujarat, in a GMP-certified facility. Third-party tested, traceable ingredients, no hidden blends. Per capsule: L-theanine 200 mg. 30 capsules per bottle.",
      story: "L-theanine is an amino acid found naturally in green tea. You may have met it already, in your evening cup. We offer it in a simple, measured form: 200 mg in one capsule, with nothing else alongside it except what is listed on the label. The routine is flexible: one capsule a day, best in the morning, with food or on an empty stomach. That is the whole product, and we like it that way. Every Body Café Co. label follows the same rules: name the ingredient, state the amount, tell you when, and show who made it. This one is made by U-Liva Nutrition LLP in Rajkot, Gujarat, in a GMP-certified facility, and third-party tested. One ingredient, one number, one capsule. Easy to understand, easy to keep." },
  };
  /* Departures from the reference, all from the supplied final label. Checked by design-tools/test-pdp-e-content.mjs. */
  var ADAPTED = {
    psyllium: "Dietary fibre 1,578 mg (5.26%) and soluble fibre 1,362 mg replace the reference's 1600 mg and 400 mg in intro, amounts, trust and story.",
    creatineTiming: "The Creatine label marks Morning \"Best\" and Noon/Night \"Also fine\"; the reference showed \"Pick one\" for all three.",
    checkNote: "Test reports and certificates aren't published on this site yet.",
    held: ["The L-Theanine supply banner waits on the owner's status decision."],
    claims: "Front-of-label claims are shown exactly as printed, from the label records, at the owner's instruction (2 November 2026).",
  };

  // Headings for the label-record fields (web/label-records.json); the values themselves are the label's own.
  var FRONT = { title: "On the pack", type: "Product type", descriptor: "Description", claim: "Claim", claimNote: "",
    pack: "Pack", mark: "Diet mark", badges: "Also printed", barcode: "Barcode (EAN-13)", facts: "Supplement facts", serving: "Serving size: ",
    nutrition: "Nutritional information (approx. values)", amount: "Amount per serving", care: "Customer care", printed: "Printed on each pack" };
  function why(slug) { var x = SE.PRODUCTS.filter(function (p) { return p.slug === slug; })[0]; return x || null; }
  function renumber(pp) {
    var secs = pp.querySelectorAll(".pp-sec"), total = secs.length + 1;
    secs.forEach(function (sec, k) { var n = sec.querySelector(".pp-k-n"), of = sec.querySelector(".pp-k-of"); if (n) n.textContent = L.pad(k + 2); if (of) of.textContent = "/ " + L.pad(total); });
  }
  function head(id, label, title) {
    return '<header class="pp-head"><p class="pp-k"><span class="pp-k-n">00</span><span class="pp-k-l">' + esc(label) + '</span><span class="pp-k-of">/ 00</span></p><h2 id="' + id + '">' + esc(title) + "</h2></header>";
  }

  L.wrap("product", function (root, ctx, args) {
    var p = args[0], seed = p && P[p.id], base = p && why(p.id); if (!seed || !base) return;
    var d = Object.assign({}, seed, { headline: p.headline ?? seed.headline, intro: p.product_intro ?? seed.intro,
      story: p.product_story ?? seed.story, keep: p.keep_in_mind ?? seed.keep, trust: p.quality_summary ?? seed.trust });
    var w = Object.assign({}, base, { form: p.form_description ?? base.form, why: p.why_this_form ?? base.why });
    var pp = root.querySelector(".pp-e"); if (!pp) return;
    // 1 · The product's own words: headline, introduction, why this form, the story.
    var about = '<section class="pp-sec spe-about" id="about-product" aria-labelledby="spe-about-t"><div class="pp-sec-in">' + head("spe-about-t", "In a sentence", d.headline) +
      '<div class="pp-body"><p class="spe-intro">' + esc(d.intro) + "</p>" +
      '<div class="spe-twin"><div class="spe-why"><h3 class="pp-sub-h">' + LABELS.why + "</h3><p>" + esc(w.why) + "</p></div>" +
      '<div class="spe-story"><h3 class="pp-sub-h">' + LABELS.story + "</h3><p>" + esc(d.story) + "</p></div></div></div></div></section>";
    var detail = pp.querySelector("#detail");
    if (detail) detail.after(L.frag(about));
    // 2 · The front of the label, then the full Supplement Facts panel (label records), with %RDA.
    var ing = pp.querySelector("#ingredients .pp-body");
    if (ing) {
      var front = p.label_front, sf = p.supplement_facts, table;
      var frontHtml = front ? '<div class="spe-front"><h3 class="pp-sub-h">' + FRONT.title + '</h3><dl class="spe-kv">' +
        [[FRONT.type, front.category], [FRONT.descriptor, front.descriptor], [FRONT.claim, front.claim, FRONT.claimNote], [FRONT.pack, p.pack_size], [FRONT.mark, front.mark], [FRONT.badges, (p.label_badges || []).join(" · ")], [FRONT.barcode, front.barcode]]
          .filter(function (x) { return x[1]; }).map(function (x) { return "<div><dt>" + x[0] + "</dt><dd>" + esc(x[1]) + (x[2] ? ' <small class="spe-asprinted">' + x[2] + "</small>" : "") + "</dd></div>"; }).join("") + "</dl></div>" : "";
      if (sf && Array.isArray(sf.rows)) {
        table = '<div class="spe-inside spe-facts"><div class="spe-facts-head"><h3 class="pp-sub-h">' + FRONT.facts + '</h3><p>' + FRONT.serving + esc(sf.serving) + '</p></div><div class="spe-tbl"><table><thead><tr><th scope="col">' + FRONT.nutrition + '</th><th scope="col">' + FRONT.amount + '</th><th scope="col">' + LABELS.rda + "</th></tr></thead><tbody>" +
          sf.rows.map(function (row, k) {
            var first = row.active && !(sf.rows[k - 1] || {}).active;
            return '<tr class="' + (row.active ? "is-active" : "") + (first ? " is-first-active" : "") + '"><th scope="row" style="--lvl:' + (row.level || 0) + '">' + esc(row.name) + '</th><td class="spe-num">' + esc(row.amount) + '</td><td class="spe-num">' + esc(row.rda) + "</td></tr>";
          }).join("") + "</tbody></table></div>" + sf.notes.map(function (n) { return '<p class="spe-note">' + esc(n) + "</p>"; }).join("") + "</div>";
      } else {
        table = '<div class="spe-inside"><h3 class="pp-sub-h">' + LABELS.whatsInside + '</h3><div class="spe-tbl"><table><thead><tr><th scope="col">' + LABELS.per + esc(w.serving) + '</th><th scope="col">' + LABELS.amount + '</th><th scope="col">' + LABELS.rda + "</th></tr></thead><tbody>" +
          d.amounts.map(function (a) { return '<tr><th scope="row">' + esc(a[0]) + '</th><td class="spe-num">' + esc(a[1]) + '</td><td class="spe-num">' + esc(a[2]) + "</td></tr>"; }).join("") +
          '</tbody></table></div><p class="spe-note">' + esc(d.rdaNote || LABELS.rdaNote) + "</p></div>";
      }
      var lead = ing.querySelector(".pp-lead");
      if (lead) lead.after(L.frag(frontHtml + table)); else ing.insertAdjacentHTML("afterbegin", frontHtml + table);
    }
    // 3 · When to take it: the label's timing strip and directions tag, plus what to keep in mind and the form.
    var use = pp.querySelector("#use .pp-body");
    if (use) {
      var timing = p.label_timing;
      var strip = '<div class="spe-when"><h3 class="pp-sub-h">' + LABELS.when + (p.directions_tag ? ' <span class="spe-tag">' + esc(p.directions_tag) + "</span>" : "") + '</h3><ol class="spe-slots">' + LABELS.slots.map(function (s) {
        var text = timing ? timing[s[0]] : (s[0] === d.best ? LABELS.best : LABELS.fine), best = /^Best/.test(text);
        return '<li class="' + (best ? "is-best" : "") + '"><b>' + s[1] + "</b><span>" + esc(text) + "</span></li>";
      }).join("") + "</ol>" +
        '<dl class="spe-kv">' + (d.keep && d.keep !== "—" ? "<div><dt>" + LABELS.keep + "</dt><dd>" + esc(d.keep) + "</dd></div>" : "") + "<div><dt>" + LABELS.form + "</dt><dd>" + esc(w.form) + "</dd></div></dl></div>";
      var ul = use.querySelector(".pp-lead");
      if (ul) ul.after(L.frag(strip)); else use.insertAdjacentHTML("afterbegin", strip);
    }
    // 4 · How we check it, with what is and isn't published.
    var q = pp.querySelector("#quality .pp-body");
    if (q) {
      var check = '<div class="spe-check"><h3 class="pp-sub-h">' + LABELS.check + "</h3><p>" + esc(d.trust) + ' <span class="spe-check-note">' + esc(p.quality_note ?? ADAPTED.checkNote) + "</span></p></div>" +
        (p.customer_care || p.pack_printed ? '<dl class="spe-kv spe-care">' + (p.customer_care ? "<div><dt>" + FRONT.care + "</dt><dd>" + esc(p.customer_care) + "</dd></div>" : "") + (p.pack_printed ? "<div><dt>" + FRONT.printed + "</dt><dd>" + esc(p.pack_printed) + "</dd></div>" : "") + "</dl>" : "");
      var ql = q.querySelector(".pp-lead");
      if (ql) ql.after(L.frag(check)); else q.insertAdjacentHTML("afterbegin", check);
    }
    renumber(pp);
    var quick = pp.querySelector(".pp-quick");
    if (quick) { var first = quick.querySelector('a[href="#detail"]'); var a = L.frag('<a href="#about-product">' + LABELS.why + "</a>"); if (first) first.after(a); else quick.prepend(a); }
  });

  window.BCCPdpE = { P: P, LABELS: LABELS, ADAPTED: ADAPTED, defaults: function (id) {
    var d = P[id], w = why(id); if (!d || !w) return {};
    return { headline: d.headline, product_intro: d.intro, product_story: d.story, keep_in_mind: d.keep,
      quality_summary: d.trust, quality_note: ADAPTED.checkNote, form_description: w.form, why_this_form: w.why };
  } };
})();
