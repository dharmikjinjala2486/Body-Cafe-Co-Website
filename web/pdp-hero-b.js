/* Variant B — product-page hero concepts (preview releases only, for team review).
   Seven selling approaches share one hero frame: cap-colour product stage (the unchanged static first image and the
   admin gallery after it), a short message, up to three value points, one genuine proof cue, a concept offer module
   and the existing standard purchase controls.
   Integrity rules: offer values here are SAMPLES. They are displayed only; the bag, checkout, stock and backend keep
   using the standard listed price and quantity. Nothing here issues credit, gifts, free delivery or recurring billing.
   Production releases keep the standard hero. Detailed ingredients, education, evidence and FAQs stay below. */
(function () {
  'use strict';
  var S = window.BCCSite;
  if (!S || !S.themes || !S.themes.b) return;
  var RELEASE = window.BCCRelease || { preview: true };

  function inr(n, decimals) {
    return '₹' + Number(n).toLocaleString('en-IN', decimals ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumFractionDigits: 0 });
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var LOT = '<a class="bxh-proof" href="/reports?product={id}"><span class="bxh-proof-mark" aria-hidden="true">✓</span><span>Every lot has its own record you can look up</span><span aria-hidden="true">↗</span></a>';
  var SAMPLE = '<span class="bxh-sample">Sample offer · for review</span>';
  function demoPackCount(id) {
    var d = window.BCCDemo && window.BCCDemo.packs && window.BCCDemo.packs[id];
    var m = d && /^(\d+)\s+(\w+)/.exec(d);
    return m ? { n: +m[1], unit: m[2] } : null;
  }

  /* ---------- Concepts: headline, one sentence, ≤3 value points and the offer module ---------- */
  var IRON_TIERS = [ // Sample serving prices for review; comparison = listed price per 30 servings × multiple.
    { servings: 30, price: 799 }, { servings: 60, price: 1499 }, { servings: 90, price: 2099 }
  ];
  var CONCEPTS = {
    'iron-bisglycinate': {
      key: 'iron', promise: 'Iron, priced by the serving.',
      lede: 'Choose the supply that suits you — every option shows its price per serving up front.',
      points: ['Iron bisglycinate, named in full', 'Capsules · one-time purchase', 'Same bottle, same label, every option'],
      offer: function (p) {
        var base = p.price; // Comparison basis: the listed price for 30 servings in this sample.
        return '<fieldset class="bxh-tiers" data-bxh-tiers><legend><span>Choose your servings</span>' + SAMPLE + '</legend>' +
          IRON_TIERS.map(function (t, i) {
            var compare = base * t.servings / 30, per = t.price / t.servings;
            return '<label class="bxh-tier"><input type="radio" name="bxh-tier" value="' + i + '"' + (i === 1 ? ' checked' : '') + ' data-servings="' + t.servings + '" data-price="' + t.price + '" data-compare="' + compare + '">' +
              '<span class="bxh-tier-name">' + t.servings + ' Servings</span>' +
              '<span class="bxh-tier-price"><s><span class="sr-only">Was </span>' + inr(compare) + '</s> <strong><span class="sr-only">now </span>' + inr(t.price) + '</strong></span>' +
              '<span class="bxh-tier-per">' + inr(per, true) + ' per serving</span></label>';
          }).join('') +
          '<p class="bxh-tier-summary" data-bxh-tier-summary aria-live="polite"></p></fieldset>';
      }
    },
    'l-theanine': {
      key: 'theanine', promise: 'Found in green tea. Kept for your everyday.',
      lede: 'L-Theanine in simple capsules, at its everyday price — nothing to unlock, nothing to work out.',
      points: ['L-Theanine, the amino acid found in tea leaves', 'Capsules · one-time purchase', 'Full price, no conditions'],
      backdrop: 'L-THEANINE',
      offer: function () { return ''; }
    },
    'vitamin-d3-k2': {
      key: 'd3', promise: 'One price. Delivered.',
      lede: 'Vitamin D3, vitamin K2 and omega-3 as triglycerides in one softgel — with the delivered total shown before you start.',
      points: ['Three named parts in one formula', 'Softgels · one-time purchase', 'Know the total before checkout'],
      offer: function (p) {
        return '<div class="bxh-offer bxh-delivered" data-bxh-delivered data-price="' + p.price + '"><div class="bxh-offer-head"><strong>Delivery included</strong>' + SAMPLE + '</div>' +
          '<dl class="bxh-sum"><div><dt>Product</dt><dd data-bxh-d-product></dd></div><div><dt>Delivery today</dt><dd data-bxh-d-today></dd></div><div><dt>Delivery with this offer</dt><dd><s data-bxh-d-was></s> <strong>₹0</strong></dd></div><div class="is-total"><dt>Delivered total</dt><dd data-bxh-d-total></dd></div></dl>' +
          '<p class="bxh-terms-mini" data-bxh-d-note></p>' +
          '<p class="bxh-terms-mini">Proposed eligibility: deliveries within India to pincodes confirmed at checkout. Delivery areas and dates aren’t set up yet, so nothing here is promised.</p></div>';
      }
    },
    'omega-3-fish-oil': {
      key: 'omega', promise: 'Omega-3, with its record in view.',
      lede: 'A full-price fish oil you can trace from the bottle in your hand to the record for its lot.',
      points: ['Omega-3 fish oil softgels', 'Listed price, no promotions', 'Composition and records in full below'],
      offer: function (p) {
        var pack = demoPackCount(p.id);
        return '<div class="bxh-offer bxh-premium"><div class="bxh-offer-head"><strong>What your price covers</strong></div><dl class="bxh-sum">' +
          '<div><dt>Listed price</dt><dd>' + inr(p.price) + '</dd></div>' +
          (pack ? '<div><dt>Softgels in this preview pack</dt><dd>' + pack.n + '</dd></div><div class="is-total"><dt>Price per softgel</dt><dd>' + inr(p.price / pack.n, true) + '</dd></div>' : '<div><dt>Price per softgel</dt><dd>Shown once the pack quantity is confirmed</dd></div>') +
          '</dl><p class="bxh-terms-mini">Per-softgel price, not per serving: serving size comes from the approved label.</p></div>';
      }
    },
    'myo-d-chiro-inositol': {
      key: 'inositol', promise: 'Two inositols. One bottle.',
      lede: 'Myo-inositol and D-chiro inositol together, each named on its own — and a little back on your next order.',
      points: ['Myo- and D-chiro inositol, named separately', 'Capsules · one-time purchase', 'Today’s price stays the same'],
      offer: function (p) {
        return '<div class="bxh-offer bxh-credit"><div class="bxh-offer-head"><strong>₹150 credit for your next order</strong>' + SAMPLE + '</div>' +
          '<dl class="bxh-sum"><div class="is-total"><dt>You pay today</dt><dd data-bxh-pay>' + inr(p.price) + '</dd></div><div><dt>Credit toward a later order</dt><dd>₹150</dd></div></dl>' +
          '<ul class="bxh-conditions"><li>Proposed: added after this order is delivered</li><li>Use within 60 days on an order of ₹999 or more</li><li>One credit per customer; no cash value</li></ul>' +
          '<p class="bxh-terms-mini">No credit is issued from this page yet.</p></div>';
      }
    },
    'creatine-chews': {
      key: 'creatine', promise: 'Creatine, without the shaker.',
      lede: 'Creatine in a chewable tablet — no scoop, no powder, nothing to mix.',
      points: ['Chewable tablets', 'Nothing to measure or mix', 'Full formulation details below'],
      offer: function () {
        return '<div class="bxh-offer bxh-gift"><span class="bxh-gift-tag" aria-hidden="true">+ gift</span><div class="bxh-offer-head"><strong>A pocket tin for your chews</strong>' + SAMPLE + '</div>' +
          '<p>Proposed gift with this order: a reusable Body Café Co. tin sized for a day out. Same price, a little extra in the box.</p>' +
          '<p class="bxh-terms-mini">Gift idea for review only — it isn’t included with orders.</p></div>';
      }
    },
    'psyllium-husk': {
      key: 'psyllium', promise: 'Fibre, kept simple.',
      lede: 'Psyllium husk in capsules — with a modest welcome on your first order.',
      points: ['Psyllium husk, a source of fibre', 'Capsules · one-time purchase', 'Lot record for every batch'],
      offer: function (p) {
        var offer = Math.round(p.price * 0.9);
        return '<div class="bxh-offer bxh-first" data-bxh-first data-price="' + p.price + '" data-offer="' + offer + '"><div class="bxh-offer-head"><strong>10% off your first order</strong>' + SAMPLE + '</div>' +
          '<dl class="bxh-sum"><div><dt>Listed price</dt><dd data-bxh-f-was></dd></div><div><dt>First-order saving</dt><dd data-bxh-f-save></dd></div><div class="is-total"><dt>First-order total</dt><dd data-bxh-f-total></dd></div></dl>' +
          '<p class="bxh-terms-mini">Proposed eligibility: your first order with Body Café Co., one bottle, not combined with other offers. Your bag shows the listed price.</p></div>';
      }
    }
  };
  function generic(p) {
    return { key: 'standard', promise: p.subtitle || p.name, lede: '', points: [], offer: function () { return ''; } };
  }

  /* ---------- Hero frame built around the existing gallery and purchase controls ---------- */
  function build(html, ctx, p) {
    var t = document.createElement('template');
    t.innerHTML = html;
    var hero = t.content.querySelector('.pp-hero'), panel = hero && hero.querySelector('[data-pp-panel]'), gallery = hero && hero.querySelector('[data-pp-gallery]');
    if (!hero || !panel || !gallery) return html;
    var c = CONCEPTS[p.id] || generic(p);
    var take = function (sel) { return panel.querySelector(sel); };
    var crumbs = hero.querySelector('.pp-crumbs'), title = take('.pp-title'), buy = take('[data-pp-buy]'), stock = take('.pp-stock'),
      price = take('.pp-pricebox'), pack = take('.pp-pack'), micro = buy && buy.nextElementSibling && buy.nextElementSibling.matches('.pp-micro') ? buy.nextElementSibling : null,
      pin = take('.pp-pincode'), terms = take('.pp-terms'), quick = take('.pp-quick');
    var head = document.createElement('div'); head.className = 'bxh-head';
    if (title) {
      head.appendChild(title);
      // One message: the promise replaces the subtitle (kept when a new product falls back to its subtitle).
      var sub = title.querySelector('.pp-sub'); if (sub) sub.remove();
      title.insertAdjacentHTML('beforeend', '<p class="bxh-promise">' + esc(c.promise) + '</p>' + (c.lede ? '<p class="bxh-lede">' + esc(c.lede) + '</p>' : ''));
    }
    var stage = document.createElement('div'); stage.className = 'bxh-stage';
    if (c.backdrop) stage.insertAdjacentHTML('beforeend', '<span class="bxh-backdrop" aria-hidden="true">' + c.backdrop + '</span>');
    stage.appendChild(gallery);
    var side = document.createElement('div'); side.className = 'bxh-buy pp-panel'; side.setAttribute('data-pp-panel', '');
    var parts = '';
    if (c.points.length) parts += '<ul class="bxh-points">' + c.points.slice(0, 3).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
    parts += LOT.replace('{id}', encodeURIComponent(p.id));
    // Value points and the proof cue: beside the message on desktop, after the buying controls on phones.
    var value = document.createElement('div'); value.className = 'bxh-value'; value.innerHTML = parts;
    if (price) side.appendChild(price);
    side.insertAdjacentHTML('beforeend', c.offer(p));
    if (stock) side.appendChild(stock);
    var offer = side.querySelector('.bxh-tiers, .bxh-offer:not(.bxh-premium)');
    if (offer && buy && !buy.querySelector('[disabled]')) side.insertAdjacentHTML('beforeend', '<p class="bxh-cta-note">' + (c.key === 'iron' ? 'Serving prices aren’t available to order yet. Add to bag adds the standard pack at ' + inr(p.price) + '.' : 'The offer above isn’t applied yet. Add to bag adds the standard pack at its listed price.') + '</p>');
    if (buy) {
      var add = buy.querySelector('[data-action="add-product"]');
      if (add && !add.disabled) add.insertAdjacentHTML('beforeend', '<span class="bxh-cta-total" data-bxh-total data-price="' + p.price + '">' + inr(p.price) + '</span>');
      side.appendChild(buy);
    }
    if (micro) side.appendChild(micro);
    if (pack) { var d = document.createElement('details'); d.className = 'pp-terms bxh-pack'; d.innerHTML = '<summary>Pack and serving details</summary>'; d.appendChild(pack); side.appendChild(d); }
    if (terms) side.appendChild(terms);
    if (pin) side.appendChild(pin);
    if (quick) side.appendChild(quick);
    var grid = document.createElement('div'); grid.className = 'bxh-grid';
    grid.append(head, value, stage, side);
    hero.replaceChildren();
    if (crumbs) hero.appendChild(crumbs);
    hero.appendChild(grid);
    hero.classList.add('bxh', 'bxh--' + c.key);
    hero.style.setProperty('--cap', p.color);
    return t.innerHTML;
  }

  var base = S.themes.b.product;
  if (typeof base === 'function') {
    S.themes.b = Object.assign({}, S.themes.b, {
      product: function (ctx, p) {
        var html = base.apply(this, arguments);
        if (!RELEASE.preview || typeof html !== 'string' || !p) return html;
        return build(html, ctx, p);
      }
    });
  }

  /* ---------- Behaviour: local, display-only arithmetic ---------- */
  function qtyValue(root) { var q = root.querySelector('#product-quantity'); return q ? Math.max(1, +q.value || 1) : 1; }
  function update(root) {
    var q = qtyValue(root);
    var total = root.querySelector('[data-bxh-total]');
    if (total) total.textContent = inr(q * +total.dataset.price);
    var tiers = root.querySelector('[data-bxh-tiers]');
    if (tiers) {
      var sel = tiers.querySelector('input:checked');
      if (sel) {
        var save = +sel.dataset.compare - +sel.dataset.price;
        tiers.querySelector('[data-bxh-tier-summary]').innerHTML = '<strong>' + sel.dataset.servings + ' servings selected</strong> · sample total ' + inr(+sel.dataset.price) + ' · saves ' + inr(save) + ' against the comparison price';
      }
    }
    var dl = root.querySelector('[data-bxh-delivered]');
    if (dl) {
      var sub = q * +dl.dataset.price, fee = sub >= 1499 ? 0 : 75; // Preview delivery terms: ₹75, waived from ₹1,499.
      dl.querySelector('[data-bxh-d-product]').textContent = (q > 1 ? q + ' × ' + inr(+dl.dataset.price) + ' = ' : '') + inr(sub);
      dl.querySelector('[data-bxh-d-today]').textContent = fee ? inr(fee) : 'Free at this quantity';
      dl.querySelector('[data-bxh-d-was]').textContent = fee ? inr(fee) : '';
      dl.querySelector('[data-bxh-d-total]').textContent = inr(sub);
      dl.querySelector('[data-bxh-d-note]').textContent = fee ? 'Today this order would total ' + inr(sub + fee) + ' with delivery. With the offer: ' + inr(sub) + '.' : 'At this quantity, delivery is already free under the current preview terms.';
    }
    var pay = root.querySelector('[data-bxh-pay]');
    if (pay && total) pay.textContent = inr(q * +total.dataset.price);
    var first = root.querySelector('[data-bxh-first]');
    if (first) {
      var was = +first.dataset.price, off = +first.dataset.offer;
      first.querySelector('[data-bxh-f-was]').textContent = inr(was);
      first.querySelector('[data-bxh-f-save]').textContent = '− ' + inr(was - off);
      first.querySelector('[data-bxh-f-total]').textContent = inr(off);
    }
  }
  function enhance() {
    var root = document.querySelector('.pp-hero.bxh');
    if (!root) return;
    root.closest('[data-pp]').addEventListener('change', function (e) {
      if (e.target.matches('#product-quantity, [data-bxh-tiers] input')) update(root);
    });
    update(root);
  }
  window.BCCBPdpHero = { enhance: enhance, concepts: CONCEPTS, tiers: IRON_TIERS };
})();
