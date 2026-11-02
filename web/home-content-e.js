/* Homepage copy from the owner's localhost:8000 reference and final label records.
   Hero is deliberately excluded. Product values use the current catalogue.
   Each section is drawn in the Super Sevens system: seven-segment numerals, cap colours, one product per segment. */
(function () {
  'use strict';
  var L = window.BCCLivingE, S = window.BCCSite, SS = window.BCCSuperSevens;
  if (!L || !S) return;
  var esc = L.esc;
  function num(n, label) { return SS ? SS.num(String(n), { label: label || String(n) }) : '<span>' + esc(n) + '</span>'; }
  function capStyle(ctx, p) { return ctx.capStyle ? ctx.capStyle(p) : '--cap:' + (p.color || '#2d2926'); }
  // Short label facts for the large roll-call line (four words maximum).
  var rollHighlights = {
    'iron-bisglycinate': 'Ferrochel® chelated iron',
    'l-theanine': '200 mg L-Theanine',
    'vitamin-d3-k2': 'D3, K2 and Omega-3',
    'omega-3-fish-oil': '800 mg Omega-3',
    'myo-d-chiro-inositol': '40:1 inositol ratio',
    'creatine-chews': '3 g creatine monohydrate',
    'psyllium-husk': '2,000 mg psyllium husk'
  };
  // The ingredient form, as each product's label amounts state it.
  var FORMS = {
    'iron-bisglycinate': 'Ferrous bisglycinate chelate (Ferrochel®), in a capsule',
    'l-theanine': 'L-Theanine, in a capsule',
    'vitamin-d3-k2': 'D3 as cholecalciferol and K2 as MK-7, with Omega-3, in a softgel',
    'omega-3-fish-oil': 'Omega-3 as triglycerides, from anchovy fish oil, in a softgel',
    'myo-d-chiro-inositol': 'Myo-inositol and D-chiro inositol at 40:1, in capsules',
    'creatine-chews': 'Creatine monohydrate, in an orange chewable tablet',
    'psyllium-husk': 'Psyllium husk (isabgol), in capsules'
  };
  function paragraphs(items) { return items.map(function (s) { return '<p>' + esc(s) + '</p>'; }).join(''); }
  function head(key, eyebrow, title) { return '<p class="ez-k">' + eyebrow + '</p><h2 id="hx-' + key + '-t">' + title + '</h2>'; }

  /* Our belief: the statement across the page, and the three questions answered for any of the seven. */
  function belief(ctx) {
    var list = ctx.published;
    var panels = list.map(function (p, i) {
      var rows = [['Which form?', FORMS[p.id] || ctx.format[p.id] || ''], ['How much?', p.amount_per_serving || ''], ['When?', p.directions || '']];
      return '<div class="hx-menu-panel" data-hx-panel="' + i + '"' + (i ? ' hidden' : '') + ' style="' + capStyle(ctx, p) + '"><p class="hx-menu-name"><a href="/products/' + esc(p.id) + '">' + esc(p.name) + '</a></p><ol class="hx-menu-rows">' +
        rows.map(function (r, k) { return '<li><span class="hx-menu-n">' + num(k + 1) + '</span><span class="hx-menu-q">' + r[0] + '</span><span class="hx-menu-a">' + esc(r[1]) + '</span></li>'; }).join('') + '</ol></div>';
    }).join('');
    var picks = list.map(function (p, i) { return '<button type="button" class="hx-pick" data-hx-pick="' + i + '" aria-pressed="' + (i ? 'false' : 'true') + '" style="' + capStyle(ctx, p) + '"><span class="sr-only">' + esc(p.name) + '</span></button>'; }).join('');
    return '<section class="hx hx-belief" data-home-section="belief" aria-labelledby="hx-belief-t">' + head('belief', 'Our belief', "You should always know what you're being served.") +
      '<div class="hx-belief-grid"><div class="hx-belief-copy">' + paragraphs([
        'A good café never hides the recipe. You can read the menu, see what goes into your cup, and ask what you like. We think supplements deserve the same openness.',
        'So every label we print answers the three questions careful people ask: what form is this ingredient in, how much of it do I get, and when should I take it? If a label cannot answer those, it is not finished.'
      ]) + '<a class="x-link" href="/story">Read our story</a></div>' +
      '<div class="hx-menu" data-hx-menu><div class="hx-menu-top"><p class="ez-k">Three answers, for each of the seven</p><div class="hx-picks" role="group" aria-label="Choose a product">' + picks + '</div></div>' + panels + '</div></div></section>';
  }

  /* Everyday life: a day in three parts, with each product placed where its directions put it. */
  function everyday(ctx) {
    var parts = [['morning', 'Morning'], ['noon', 'Noon'], ['night', 'Night']];
    function when(p) {
      if (/choose one time/i.test(p.directions || '')) return 'any';
      var t = p.label_timing || {}, best = parts.filter(function (x) { return /best/i.test(t[x[0]] || ''); })[0];
      if (best) return best[0];
      return /night/i.test(p.directions || '') ? 'night' : 'morning';
    }
    function item(p) {
      return '<li style="' + capStyle(ctx, p) + '"><a href="/products/' + esc(p.id) + '"><span class="ez-chip-dot" aria-hidden="true"></span><strong>' + esc(p.name) + '</strong><span>' + esc(p.directions || 'Follow the directions on your pack.') + '</span></a></li>';
    }
    var cols = parts.map(function (x) {
      var here = ctx.published.filter(function (p) { return when(p) === x[0] || (x[0] === 'noon' && when(p) === 'any'); });
      return '<li class="hx-day-part hx-day-' + x[0] + '"><p class="hx-day-h">' + x[1] + '</p>' + (here.length ? '<ul>' + here.map(item).join('') + '</ul>' : '') + '</li>';
    }).join('');
    return '<section class="hx hx-day" data-home-section="everyday" aria-labelledby="hx-everyday-t"><div class="hx-split"><div>' + head('everyday', 'Everyday life', 'A small part of a good day.') + '</div>' +
      '<div class="hx-lede">' + paragraphs(['Supplements should sit quietly inside the day you already have, not take it over. A good life is built mostly elsewhere: in meals, sleep, movement and the people around you. Our job is to make the small part clear, so you can get on with the rest.']) + '</div></div>' +
      '<div class="hx-day-band" aria-hidden="true"><span class="hx-sun"></span></div><ol class="hx-day-parts" aria-label="When to take each product">' + cols + '</ol></section>';
  }

  /* Product philosophy: four rules, four segment numerals. */
  var RULES = [
    ['We name the form.', 'Triglyceride-form omega-3. Vitamin K2 as MK-7. Ferrochel® ferrous bisglycinate chelate. If a form was chosen for a reason, you should see it.'],
    ['We state the amount.', 'Per serving, ingredient by ingredient. No hidden blends, no totals that could mean anything.'],
    ['We tell you when.', 'Morning, noon or night; with food or without; what to keep apart. It is on every pack.'],
    ['We show our work.', 'Every manufacturer is named on the pack. Every product is GMP certified and third-party tested, and a code on every bottle leads to more about what is inside.']
  ];
  function rules() {
    var colors = (SS && SS.CAST && SS.CAST.colors) || [];
    return '<section class="hx hx-rules" data-home-section="trust" aria-labelledby="hx-trust-t"><div class="hx-split hx-split-end"><div>' + head('trust', 'Our product philosophy', 'Four rules on every bottle.') + '</div><p><a class="x-link" href="/standards">How we approach science</a></p></div>' +
      '<ol class="hx-rules-list">' + RULES.map(function (r, i) {
        return '<li style="--cap:' + (colors[i] || 'var(--ink)') + '"><span class="hx-rule-n">' + num(i + 1, 'Rule ' + (i + 1)) + '</span><h3>' + esc(r[0]) + '</h3><p>' + esc(r[1]) + '</p></li>';
      }).join('') + '</ol></section>';
  }

  /* Sourcing: the three makers, each with the products they make, then what is and isn't published yet. */
  function sourcing(ctx) {
    var makers = [], by = {};
    ctx.published.forEach(function (p) {
      var raw = String(p.manufacturer || ''), m = raw.split(',');
      if (!m[0]) return;
      var key = m[0].trim();
      if (!by[key]) { by[key] = { name: key, city: (m[1] || '').trim(), lic: (raw.match(/Lic\. No\. ([0-9]+)/) || [])[1] || '', items: [] }; makers.push(by[key]); }
      by[key].items.push(p);
    });
    var cards = makers.map(function (m, i) {
      return '<li><p class="hx-maker-n">' + num(i + 1, 'Maker ' + (i + 1)) + '</p><p class="hx-maker-city">' + esc(m.city) + '</p><h3>' + esc(m.name) + '</h3>' + (m.lic ? '<p class="hx-maker-lic">FSSAI Lic. No. ' + esc(m.lic) + '</p>' : '') +
        '<ul class="hx-maker-items">' + m.items.map(function (p) { return '<li style="' + capStyle(ctx, p) + '"><a href="/products/' + esc(p.id) + '"><span class="ez-chip-dot" aria-hidden="true"></span>' + esc(p.name) + '</a></li>'; }).join('') + '</ul></li>';
    }).join('');
    var checks = [['yes', 'Manufacturer named', 'On every pack'], ['yes', 'GMP certified · third-party tested', 'Every product'], ['soon', 'Raw-material origin', 'Added as supplier documents are confirmed'], ['soon', 'Certificates and lot reports', 'Not published on this site yet']];
    return '<section class="hx hx-source" data-home-section="sourcing" aria-labelledby="hx-sourcing-t"><div class="hx-split"><div>' + head('sourcing', 'Sourcing and transparency', "Who makes it, where, and how it's checked.") + '</div>' +
      '<div class="hx-lede">' + paragraphs([
        'Our softgels are made by Asoj Soft Caps in Baroda. Our iron and creatine chews are made by Vebe Lifecare in Baroda. Our capsules for psyllium, inositol and L-theanine are made by U-Liva Nutrition in Rajkot.',
        'Every manufacturer is named on the pack. We are adding the origin of each raw material to our sourcing page as supplier documents are confirmed.'
      ]) + '</div></div>' +
      (cards ? '<ol class="hx-makers">' + cards + '</ol>' : '') +
      '<ul class="hx-checks">' + checks.map(function (c) { return '<li class="is-' + c[0] + '"><span class="hx-check-mark" aria-hidden="true"></span><strong>' + c[1] + '</strong><span>' + c[2] + '</span></li>'; }).join('') + '</ul>' +
      '<p class="ez-sec-foot"><a class="x-link" href="/standards#ingredients">Ingredients and sourcing</a></p></section>';
  }

  /* The invitation: a dark close with the mark lit. */
  function invitation() {
    return '<section class="hx hx-invite" data-home-section="invitation" aria-labelledby="hx-invitation-t"><div class="hx-invite-copy">' + head('invitation', 'Built on research. Made for real life.', "You should always know what you're being served.") +
      paragraphs(["Start with one product. Read the whole label. If something isn't clear, ask us, and expect an answer you can check."]) +
      '<div class="ez-actions"><a class="x-btn" href="/shop"><span>Shop the range</span></a><a class="x-link" href="/contact">Ask us anything</a></div></div>' +
      '<div class="hx-invite-mark" aria-hidden="true">' + (SS ? SS.mark({ cls: 'hx-mark' }) : '') + '</div></section>';
  }

  L.wrap('home', function (root, ctx) {
    var page = root.querySelector('.ss-home'); if (!page) return;
    var roll = page.querySelector('[data-home-section="collection"]');
    if (roll) {
      roll.before(L.frag(belief(ctx)));
      roll.querySelector('.ss-roll-head .ez-k').textContent = 'The launch range';
      roll.querySelector('#ss-roll-t').textContent = 'A short menu, made with care.';
      roll.querySelector('.ss-roll-head > p:last-child').textContent = 'Each product earns its place on the shelf, and each one is explained the same way.';
      roll.querySelectorAll('.ss-member').forEach(function (member, i) {
        var p = ctx.published[i]; if (!p) return;
        member.querySelector('.ss-member-nick').textContent = rollHighlights[p.id] || 'Label facts';
        member.querySelector('.ss-member-line').textContent = p.directions || '';
      });
    }
    var pour = page.querySelector('[data-home-section="pour"] .ez-sec-head');
    if (pour) pour.querySelector('p:last-child').textContent = 'Every amount on the label is per serving. Choose a product to see its serving size and the number of servings in each pack.';
    var cards = page.querySelector('[data-home-section="cards"]');
    if (cards) cards.querySelector('.ez-sec-head p:last-child').textContent = 'The ingredient form, amount per serving and pack size, together in one place. Turn a card to read the label facts.';
    page.querySelectorAll('[data-ss-card]').forEach(function (card) {
      var p = ctx.product(card.getAttribute('data-ss-card')); if (!p) return;
      var nick = card.querySelector('.ss-card-nick'), line = card.querySelector('.ss-card-line');
      if (nick) nick.textContent = ctx.format[p.id] || '';
      if (line) line.textContent = p.directions || '';
    });
    page.querySelectorAll('[data-ss-deck-panel]').forEach(function (panel, i) {
      var p = ctx.published[i]; if (!p) return;
      panel.querySelector('.ss-deck-nick').textContent = p.pack_size || '';
      panel.querySelector('.ss-deck-line').textContent = p.amount_per_serving || '';
    });
    // Everyday life sits just before the testimonials, which stay: real, verified reviews only.
    var voices = page.querySelector('[data-home-section="voices"]'), day = L.frag(everyday(ctx));
    if (voices) voices.before(day); else if (cards) cards.after(day);
    var trust = page.querySelector('[data-home-section="trust"]');
    if (trust) trust.replaceWith(L.frag(rules() + sourcing(ctx)));
    var learn = page.querySelector('[data-home-section="learn"]');
    if (learn) {
      learn.classList.add('hx-journal');
      learn.querySelector('.ez-k').textContent = 'Journal';
      learn.querySelector('h2').textContent = 'Learn to read any label. Including ours.';
      learn.querySelector('.ez-sec-head > p:last-child').textContent = 'Three questions that tell you more than any front-of-pack promise: which form, how much, and when.';
      learn.querySelectorAll('.ez-learn-n').forEach(function (n, i) { n.innerHTML = num(i + 1, 'Guide ' + (i + 1)); });
    }
    var faq = page.querySelector('[data-home-section="faq"]');
    if (faq) {
      var answers = [
        ['Where are the full product details?', 'Each product page includes ingredient amounts, serving and pack sizes, directions, allergens, storage and cautions. Check your own pack for its lot number and expiry date.'],
        ['What do the prices include?', 'Prices are shown as MRP, inclusive of all taxes.'],
        ['When should I take a product?', 'Follow the directions on your pack. Each product page shows the timing, serving size and whether to take it with food.'],
        ['Where do I find my lot report?', 'Choose your product on the lot reports page and enter the lot number on your pack. Published documents appear with the matching record.'],
        ['How can I ask a question?', 'Email care@bodycafeco.com or call +91-9274248974. You can also find product questions on our Contact page.']
      ];
      faq.querySelectorAll('details').forEach(function (d) { d.remove(); });
      var box = faq.querySelector('.x-faqs') || faq.querySelector('.e-faqs') || faq;
      box.appendChild(L.frag(answers.map(function (x) { return '<details><summary>' + esc(x[0]) + '</summary><p>' + esc(x[1]) + '</p></details>'; }).join('')));
    }
    page.appendChild(L.frag(invitation()));

    // Flow, after the owner's team review and five benchmark sites (2 November 2026): trust bar under the hero, the
    // range, then proof (documents and the lot lookup) in place of the repeated Super Sevens cards, then daily use,
    // voices and the brand's thinking. The hero itself is untouched.
    var hero = page.querySelector('[data-home-section="hero"]');
    if (hero) hero.after(L.frag(trustBar()));
    var deck = page.querySelector('[data-home-section="cards"]');
    if (deck) deck.replaceWith(L.frag(proof(ctx)));
    var FLOW = ['hero', 'trustbar', 'collection', 'proof', 'lot', 'everyday', 'pour', 'voices', 'belief', 'trust', 'sourcing', 'learn', 'faq', 'invitation'];
    FLOW.forEach(function (key) { var s = page.querySelector(':scope > [data-home-section="' + key + '"]'); if (s) page.appendChild(s); });
  });

  /* A short trust bar straight under the hero: facts only. */
  function trustBar() {
    var items = [['FSSAI licensed', 'Central Lic. No. 10726994000121'], ['GMP-certified manufacturing', 'Named makers in Gujarat'], ['Third-party tested', 'Every product'], ['Lot lookup on every pack', 'Trace your bottle'], ['MRP, all taxes included', 'Delivery free from ₹1,499']];
    return '<section class="hx-trustbar" data-home-section="trustbar" aria-label="Why you can trust us"><ul>' + items.map(function (x) {
      return '<li><span class="hx-tb-tick" aria-hidden="true"></span><span><strong>' + esc(x[0]) + '</strong><small>' + esc(x[1]) + '</small></span></li>';
    }).join('') + '</ul></section>';
  }

  /* Proof, not promises: the documents behind the brand, each with what you can do with it today. */
  var LABEL_PDF = { 'iron-bisglycinate': 1, 'l-theanine': 1, 'vitamin-d3-k2': 1, 'omega-3-fish-oil': 1, 'creatine-chews': 1, 'psyllium-husk': 1 };
  function proof(ctx) {
    var makers = {};
    ctx.published.forEach(function (p) {
      var raw = String(p.manufacturer || ''), name = raw.split(',')[0].trim(), lic = (raw.match(/Lic\. No\. ([0-9]+)/) || [])[1];
      if (name && lic) makers[name] = lic;
    });
    var labels = '<ul class="hx-doc-chips">' + ctx.published.map(function (p) {
      return LABEL_PDF[p.id]
        ? '<li style="' + capStyle(ctx, p) + '"><a href="/web/media/labels/' + esc(p.id) + '.pdf" target="_blank" rel="noopener" download><span class="ez-chip-dot" aria-hidden="true"></span>' + esc(p.name) + ' <small>PDF</small></a></li>'
        : '<li style="' + capStyle(ctx, p) + '"><a href="/contact?topic=product"><span class="ez-chip-dot" aria-hidden="true"></span>' + esc(p.name) + ' <small>On request</small></a></li>';
    }).join('') + '</ul>';
    var docs = [
      ['fssai', 'Licence', 'FSSAI Central Licence', 'Bluebell Lifecare Pvt. Ltd. · Lic. No. 10726994000121 · valid to 2 February 2029.', '<a class="x-link" href="https://foscos.fssai.gov.in/" target="_blank" rel="noopener">Verify on FSSAI FoSCoS</a>', 'Verified'],
      ['labels', 'PDF', 'Full product labels', 'The complete label for each product: ingredients, amounts, directions, cautions and maker.', labels, 'Download'],
      ['lots', 'Report', 'Lot reports', 'Every pack carries a lot number. Enter it to see that lot’s record and any published report.', '<a class="x-link" href="/reports">Look up your lot</a>', 'Live'],
      ['makers', 'Licence', 'Manufacturer licences', Object.keys(makers).map(function (m) { return m + ' · Lic. No. ' + makers[m]; }).join(' · ') || 'Each manufacturer is named on the pack.', '<span class="hx-doc-note">Printed on every pack</span>', 'On pack'],
      ['gst', 'Registration', 'GST registration', 'GSTIN 24AAOCB2181Q1Z6 · every order comes with a tax invoice.', '<a class="x-link" href="https://services.gst.gov.in/services/searchtp" target="_blank" rel="noopener">Verify on the GST portal</a>', 'Verified'],
      ['tests', 'Certificate', 'GMP certificates and test reports', 'Our products are GMP certified and third-party tested. Ask us for the certificate or the report for your lot.', '<a class="x-link" href="/contact?topic=report">Ask for a copy</a>', 'On request']
    ];
    return '<section class="hx hx-proof" data-home-section="proof" aria-labelledby="hx-proof-t"><div class="hx-split"><div>' + head('proof', 'Certificates, documents and reports', 'Proof, not promises.') + '</div>' +
      '<div class="hx-lede">' + paragraphs(['Anyone can print “quality” on a box. Here is what stands behind ours: the licences, the full labels and a record for every lot, each one something you can open, verify or ask for.']) + '</div></div>' +
      '<ol class="hx-docs">' + docs.map(function (d, i) {
        return '<li class="hx-doc hx-doc-' + d[0] + '"><div class="hx-doc-top"><span class="hx-doc-type">' + d[1] + '</span><span class="hx-doc-state">' + d[5] + '</span></div>' +
          '<p class="hx-doc-n">' + num(i + 1, 'Document ' + (i + 1)) + '</p><h3>' + esc(d[2]) + '</h3><p class="hx-doc-body">' + esc(d[3]) + '</p><div class="hx-doc-act">' + d[4] + '</div></li>';
      }).join('') + '</ol></section>';
  }

  // The belief menu: seven colour buttons switch which product answers the three questions.
  L.onEnhance(function (main, signal) {
    var menu = main.querySelector('[data-hx-menu]'); if (!menu) return;
    var picks = [].slice.call(menu.querySelectorAll('[data-hx-pick]')), panels = [].slice.call(menu.querySelectorAll('[data-hx-panel]'));
    function show(i) {
      picks.forEach(function (b, k) { b.setAttribute('aria-pressed', String(k === i)); });
      panels.forEach(function (p, k) { p.hidden = k !== i; });
      if (panels[i]) menu.style.setProperty('--cap', panels[i].style.getPropertyValue('--cap'));
    }
    picks.forEach(function (b, i) { b.addEventListener('click', function () { show(i); }, { signal: signal }); });
    show(0);
  });
})();
