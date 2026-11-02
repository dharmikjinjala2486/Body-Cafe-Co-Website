/* Homepage copy from the owner's localhost:8000 reference and final label records.
   Hero is deliberately excluded. Product values use the current catalogue. */
(function () {
  'use strict';
  var L = window.BCCLivingE, S = window.BCCSite;
  if (!L || !S) return;
  var esc = L.esc;
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
  function section(key, eyebrow, title, body) {
    return '<section class="home-e-copy" data-home-section="' + key + '"><header class="ez-sec-head"><p class="ez-k">' + eyebrow + '</p><h2>' + title + '</h2></header><div class="home-e-body">' + body + '</div></section>';
  }
  function paragraphs(items) { return items.map(function (s) { return '<p>' + esc(s) + '</p>'; }).join(''); }
  function list(items) { return '<ol class="home-e-points">' + items.map(function (x) { return '<li><h3>' + esc(x[0]) + '</h3><p>' + esc(x[1]) + '</p></li>'; }).join('') + '</ol>'; }
  L.wrap('home', function (root, ctx) {
    var page = root.querySelector('.ss-home'); if (!page) return;
    var roll = page.querySelector('[data-home-section="collection"]');
    if (roll) {
      roll.before(L.frag(section('belief', 'Our belief', "You should always know what you're being served.", paragraphs([
        'A good café never hides the recipe. You can read the menu, see what goes into your cup, and ask what you like. We think supplements deserve the same openness.',
        'So every label we print answers the three questions careful people ask: what form is this ingredient in, how much of it do I get, and when should I take it? If a label cannot answer those, it is not finished.'
      ]) + '<a class="x-link" href="/story">Read our story</a>')));
      roll.querySelector('.ss-roll-head .ez-k').textContent = 'The launch range';
      roll.querySelector('#ss-roll-t').textContent = 'A short menu, made with care.';
      roll.querySelector('.ss-roll-head > p:last-child').textContent = 'Each product earns its place on the shelf, and each one is explained the same way.';
      roll.querySelectorAll('.ss-member').forEach(function (member, i) {
        var p = ctx.published[i]; if (!p) return;
        member.querySelector('.ss-member-nick').textContent = p.home_highlight || rollHighlights[p.id] || 'Label facts';
        member.querySelector('.ss-member-line').textContent = p.directions || '';
      });
    }
    var pour = page.querySelector('[data-home-section="pour"] .ez-sec-head');
    if (pour) pour.querySelector('p:last-child').textContent = 'Every amount on the label is per serving. Choose a product to see its serving size and the number of servings in each pack.';
    var cards = page.querySelector('[data-home-section="cards"] .ez-sec-head');
    if (cards) cards.querySelector('p:last-child').textContent = 'The ingredient form, amount per serving and pack size, together in one place. Turn a card to read the label facts.';
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
    // A product's actual directions replace the seven empty testimonial placeholders.
    var voices = page.querySelector('[data-home-section="voices"]');
    if (voices) voices.replaceWith(L.frag(section('everyday', 'Everyday life', 'A small part of a good day.', paragraphs([
      'Supplements should sit quietly inside the day you already have, not take it over. A good life is built mostly elsewhere: in meals, sleep, movement and the people around you. Our job is to make the small part clear, so you can get on with the rest.'
    ]) + '<details class="home-e-directions"><summary>When to take each product</summary>' + list(ctx.published.map(function (p) { return [p.name, p.directions || 'Read the directions on your pack.']; })) + '</details>')));
    var trust = page.querySelector('[data-home-section="trust"]');
    if (trust) trust.replaceWith(L.frag(section('trust', 'Our product philosophy', 'Four rules on every bottle.', list([
      ['We name the form.', 'Triglyceride-form omega-3. Vitamin K2 as MK-7. Ferrochel® ferrous bisglycinate chelate. If a form was chosen for a reason, you should see it.'],
      ['We state the amount.', 'Per serving, ingredient by ingredient. No hidden blends, no totals that could mean anything.'],
      ['We tell you when.', 'Morning, noon or night; with food or without; what to keep apart. It is printed on every pack.'],
      ['We show our work.', 'Every manufacturer is named on the label. The labels carry GMP-certified and third-party tested marks, and a code on every bottle leads to more about what is inside.']
    ]) + '<a class="x-link" href="/standards">How we approach science</a>') + section('sourcing', 'Sourcing and transparency', "Who makes it, where, and how it's checked.", paragraphs([
      'Our softgels are made by Asoj Soft Caps in Baroda. Our iron and creatine chews are made by Vebe Lifecare in Baroda. Our capsules for psyllium, inositol and L-theanine are made by U-Liva Nutrition in Rajkot.',
      'Every manufacturer is named on the label. We are adding the origin of each raw material to our sourcing page as supplier documents are confirmed.',
      'The labels state GMP certified and third-party tested. Certificates and lot-specific laboratory reports are separate documents; they are not published on this site yet.'
    ]) + '<a class="x-link" href="/standards#ingredients">Ingredients and sourcing</a>')));
    var learn = page.querySelector('[data-home-section="learn"]');
    if (learn) {
      learn.querySelector('.ez-k').textContent = 'Journal';
      learn.querySelector('h2').textContent = 'Learn to read any label. Including ours.';
      learn.querySelector('.ez-sec-head > p:last-child').textContent = 'Three questions that tell you more than any front-of-pack promise: which form, how much, and when.';
    }
    var faq = page.querySelector('[data-home-section="faq"]');
    if (faq) {
      var answers = [
        ['Where are the full product details?', 'Each product page includes ingredient amounts, serving and pack sizes, directions, allergens, storage and cautions from the label. Check your own pack for its lot number and expiry date.'],
        ['What do the prices include?', 'Prices are shown as MRP, inclusive of all taxes.'],
        ['When should I take a product?', 'Follow the directions on its label. Each product page shows the timing, serving size and whether to take it with food.'],
        ['Where do I find my lot report?', 'Choose your product on the lot reports page and enter the lot number printed on your pack. Published documents appear with the matching record.'],
        ['How can I ask a question?', 'Email care@bodycafeco.com or call +91-9274248974. You can also find product and label questions on our Contact page.']
      ];
      faq.querySelectorAll('details').forEach(function (d) { d.remove(); });
      var box = faq.querySelector('.x-faqs') || faq.querySelector('.e-faqs') || faq;
      box.appendChild(L.frag(answers.map(function (x) { return '<details><summary>' + esc(x[0]) + '</summary><p>' + esc(x[1]) + '</p></details>'; }).join('')));
    }
    page.appendChild(L.frag(section('invitation', 'Built on research. Made for real life.', "You should always know what you're being served.", paragraphs([
      "Start with one product. Read the whole label. If something isn't clear, ask us, and expect an answer you can check."
    ]) + '<div class="ez-actions"><a class="x-btn" href="/shop"><span>Shop the range</span></a><a class="x-link" href="/contact">Ask us anything</a></div>')));
  });
})();
