/* Body Café Co. — Variant E · homepage hero, launch range and proof. */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE;
  if (!S || !S.themes || !S.themes.e || !L) return;
  var esc = L.esc;
  function bottle(id) { return '/web/media/renders/' + esc(id) + '-three-quarter.webp'; }

  /* ---------- Hero: seven equal-sized caps, seen from above ---------- */
  var FACT = {
    'iron-bisglycinate': 'Ferrochel® iron · 29 mg', 'l-theanine': 'L-Theanine · 200 mg', 'vitamin-d3-k2': 'D3 600 IU + K2 55 mcg',
    'omega-3-fish-oil': 'Omega-3 · 800 mg', 'myo-d-chiro-inositol': 'Myo + D-Chiro · 40:1', 'creatine-chews': 'Creatine · 3 g', 'psyllium-husk': 'Psyllium husk · 2,000 mg'
  };
  function capStage(ctx) {
    var list = ctx.published.slice(0, 7);
    return '<div class="ht-stage"><ol class="ht-caps" aria-label="Explore the seven supplements">' + list.map(function (p) {
        return '<li style="' + ctx.capStyle(p) + '"><a href="/products/' + esc(p.id) + '" aria-label="' + esc(p.name) + '">' +
          '<img class="ht-cap" src="/web/media/renders/' + esc(p.id) + '-cap.webp" alt="" width="400" height="400" decoding="async">' +
          '<span class="ht-cap-name" aria-hidden="true">' + esc(p.name) + '</span></a></li>';
      }).join('') + '</ol></div>';
  }
  function hero(ctx) {
    var list = ctx.published.slice(0, 7);
    return '<div class="ht-copy"><p class="ez-k">Seven everyday supplements</p>' +
      '<h1 id="ss-hero-t">The Super Sevens<span>.</span></h1>' +
      '<p class="ht-sub">Seven caps. Seven colours. Seven clear label.</p>' +
      '<p class="ez-lede">Every supplement wears its own cap colour, so the range reads at a glance, and every label fact is in plain, readable text: the form, the amount and when to take it.</p>' +
      '<div class="ez-actions"><a class="x-btn" href="/shop"><span>Shop all seven</span></a><a class="x-link" href="/super-sevens">Meet the Super Sevens</a></div>' +
      '<p class="ht-dots" aria-hidden="true">' + list.map(function (p) { return '<i style="' + ctx.capStyle(p) + '"></i>'; }).join('') + '</p></div>' +
      capStage(ctx);
  }

  /* ---------- Launch range: the shop card, exactly ---------- */
  var FORMAT = { 'iron-bisglycinate': 'Capsules', 'l-theanine': 'Capsules', 'vitamin-d3-k2': 'Softgels', 'omega-3-fish-oil': 'Softgels', 'myo-d-chiro-inositol': 'Capsules', 'creatine-chews': 'Chewable tablets', 'psyllium-husk': 'Capsules' };
  function range(ctx) {
    var list = ctx.published;
    return '<section class="hx hr-range" data-home-section="collection" id="collection" aria-labelledby="hr-range-t">' +
      '<div class="hx-split"><div><p class="ez-k">The launch range</p><h2 id="hr-range-t">A short menu, made with care.</h2></div>' +
      '<div class="hx-lede"><p>Each product earns its place on the shelf, and each one is explained the same way.</p><p><a class="x-link" href="/shop">Open the shop</a></p></div></div>' +
      '<ol class="hr-grid">' + list.map(function (p, i) {
        var ok = L.avail ? L.avail(p) : true, href = '/products/' + esc(p.id), fmt = ctx.format[p.id] || FORMAT[p.id] || '';
        return '<li class="hr-card" style="' + ctx.capStyle(p) + '">' +
          '<p class="hr-band"><span>' + L.pad(i + 1) + '</span><span>' + esc(fmt) + '</span></p>' +
          '<a class="hr-media" href="' + href + '" tabindex="-1" aria-hidden="true"><img src="' + '/web/media/bottles-normalized/' + esc(p.id) + '.svg' + '" alt="" width="720" height="1040" loading="lazy" decoding="async"></a>' +
          '<div class="hr-body"><h3 class="hr-name"><a href="' + href + '">' + esc(p.name) + '</a></h3>' +
          '<p class="hr-pack">' + esc(p.pack_size || '') + '</p>' +
          '<div class="hr-buy"><p class="hr-price"><strong>' + ctx.money(p.price) + '</strong> <span>MRP</span></p><p class="hr-avail" data-state="' + (ok ? 'in' : 'out') + '"><span aria-hidden="true"></span>' + (ok ? 'In stock' : 'Out of stock') + '</p></div>' +
          '<div class="hr-actions"><a class="hr-view" href="' + href + '">View product<span class="sr-only">: ' + esc(p.name) + '</span></a>' +
          '<button type="button" class="hr-add" data-add="' + esc(p.id) + '"' + (ok ? '' : ' disabled') + '><span>' + (ok ? 'Add to bag' : 'Out of stock') + '</span><span class="sr-only">: ' + esc(p.name) + '</span></button></div></div></li>';
      }).join('') + '</ol></section>';
  }

  /* ---------- Proof: records anyone can check ---------- */
  var LABEL_PDF = { 'iron-bisglycinate': 1, 'l-theanine': 1, 'vitamin-d3-k2': 1, 'omega-3-fish-oil': 1, 'creatine-chews': 1, 'psyllium-husk': 1 };
  function seal() {
    return '<svg class="hp-seal" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="hp-ring" d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0"/></defs>' +
      '<circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
      '<text font-size="13.5" letter-spacing="3.2" font-family="Lemon Milk, sans-serif" fill="currentColor"><textPath href="#hp-ring">LICENSED · LABELLED · TESTED · TRACEABLE ·</textPath></text>' +
      '<path d="M78 101l15 15 30-32" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function proof(ctx) {
    var makers = [], by = {};
    ctx.published.forEach(function (p) {
      var raw = String(p.manufacturer || ''), m = raw.split(','), name = (m[0] || '').trim(); if (!name) return;
      if (!by[name]) { by[name] = { name: name, city: (m[1] || '').trim(), lic: (raw.match(/Lic\. No\. ([0-9]+)/) || [])[1] || '', items: [] }; makers.push(by[name]); }
      by[name].items.push(p);
    });
    var record = [
      ['FSSAI licence', 'Central Licence · Lic. No.', '10726994000121', 'Valid to 2 Feb 2029', 'https://foscos.fssai.gov.in/', 'Verify on FoSCoS'],
      ['GST registration', 'GSTIN', '24AAOCB2181Q1Z6', 'Tax invoice with every order', 'https://services.gst.gov.in/services/searchtp', 'Verify on GST portal'],
      ['Licensee', 'Company', 'Bluebell Lifecare Pvt. Ltd.', 'Bodakdev, Ahmedabad, Gujarat 380054', '', ''],
      ['Customer care', 'Email · phone · WhatsApp', 'care@bodycafeco.com', '+91-9274248974 · Mon–Sat, 10:00–18:00 IST', '/contact', 'Contact us']
    ];
    var fan = ctx.published.filter(function (p) { return LABEL_PDF[p.id]; }).slice(0, 4);
    return '<section class="hx hp" data-home-section="proof" aria-labelledby="hp-t">' +
      '<div class="hx-split"><div><p class="ez-k">Proof, not promises</p><h2 id="hp-t">Licensed. Labelled. Traceable.</h2></div>' +
      '<div class="hx-lede"><p>Anyone can print “quality” on a box. These are the records behind ours, each one something you can open, verify or ask for.</p></div></div>' +
      '<div class="hp-grid">' +
        // 1 · The licence record
        '<article class="hp-record"><div class="hp-record-head"><div><p class="hp-k">The licence record</p><h3>Registered, and checkable by anyone.</h3></div>' + seal() + '</div>' +
          '<dl class="hp-rows">' + record.map(function (r) {
            return '<div><dt>' + r[0] + '</dt><dd><small>' + r[1] + '</small><span class="hp-id">' + esc(r[2]) + '</span><small>' + r[3] + '</small></dd>' +
              (r[4] ? '<a class="hp-verify" href="' + r[4] + '"' + (/^https?:/.test(r[4]) ? ' target="_blank" rel="noopener"' : '') + '>' + r[5] + ' <span aria-hidden="true">↗</span></a>' : '<span></span>') + '</div>';
          }).join('') + '</dl></article>' +
        // 2 · Published labels
        '<article class="hp-labels"><p class="hp-k">Full labels, published</p><h3>Read the whole label before you buy.</h3>' +
          '<div class="hp-fan" aria-hidden="true">' + fan.map(function (p, i) { return '<img src="' + bottle(p.id) + '" alt="" width="630" height="1000" loading="lazy" style="--i:' + i + '">'; }).join('') + '</div>' +
          '<ul class="hp-pdfs">' + ctx.published.map(function (p) {
            return '<li style="' + ctx.capStyle(p) + '">' + (LABEL_PDF[p.id]
              ? '<a href="/web/media/labels/' + esc(p.id) + '.pdf" target="_blank" rel="noopener" download><i></i>' + esc(p.name) + '<small>PDF ↓</small></a>'
              : '<a href="/contact?topic=product"><i></i>' + esc(p.name) + '<small>On request</small></a>') + '</li>';
          }).join('') + '</ul></article>' +
        // 4 · Checks
        '<article class="hp-checks"><ul>' +
          '<li><b>GMP certified</b><span>Every product is made in a GMP-certified facility.</span></li>' +
          '<li><b>Third-party tested</b><span>Each product is tested by an independent laboratory.</span></li>' +
          '<li><b>Every lot traceable</b><span>The lot number on your pack leads to that lot’s record.</span></li></ul>' +
          '<div class="hp-ctas"><a class="hp-btn" href="#ez-lot-t">Look up your lot</a><a class="x-link" href="/contact?topic=report">Ask for a certificate or test report</a></div></article>' +
        // 3 · Named makers
        '<article class="hp-makers"><p class="hp-k">Made by named, licensed manufacturers</p><ol>' + makers.map(function (m) {
          return '<li><p class="hp-city">' + esc(m.city) + '</p><h4>' + esc(m.name) + '</h4><p class="hp-lic">FSSAI Lic. No. <span class="hp-id">' + esc(m.lic) + '</span></p>' +
            '<p class="hp-makes">' + m.items.map(function (p) { return '<span style="' + ctx.capStyle(p) + '"><i></i>' + esc(p.name) + '</span>'; }).join('') + '</p></li>';
        }).join('') + '</ol></article>' +
      '</div></section>';
  }

  L.wrap('home', function (root, ctx) {
    var page = root.querySelector('.ss-home'); if (!page) return;
    var h = page.querySelector('[data-home-section="hero"]');
    if (h) { h.className = 'ss-hero ht-hero'; h.innerHTML = ''; h.appendChild(L.frag(hero(ctx))); }
    var inviteArt = page.querySelector('.hx-invite-mark');
    if (inviteArt) inviteArt.replaceWith(L.frag(capStage(ctx)));
    var roll = page.querySelector('[data-home-section="collection"]'); if (roll) roll.replaceWith(L.frag(range(ctx)));
    var old = page.querySelector('[data-home-section="proof"]'); if (old) old.replaceWith(L.frag(proof(ctx)));
    // The pour animation leaves the homepage (it stays on each product page).
    var pour = page.querySelector(':scope > [data-home-section="pour"]'); if (pour) pour.remove();
    // "Look up your lot" lands on the lot section that follows.
    var lotH = page.querySelector('[data-home-section="lot"] h2'); if (lotH && !lotH.id) lotH.id = 'ez-lot-t';
    var cta = page.querySelector('.hp-ctas a[href^="#"]'); if (cta && lotH) cta.setAttribute('href', '#' + lotH.id);
  });

  L.wrap('notFound', function (root, ctx) {
    var head = root.querySelector('.ss-page-head');
    var art = head && head.querySelector('.ss-page-mark');
    if (!art) return;
    head.classList.add('ss-caps-hero');
    art.replaceWith(L.frag(capStage(ctx)));
  });

  window.BCCHomeHeroE = { FACT: FACT };
})();
