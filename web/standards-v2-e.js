/* Variant E Quality: one product record, named makers, lot lookup and concise supporting answers.
   Product facts use the enriched live catalogue; form descriptions and makers use the approved reference data. */
(function () {
  'use strict';
  var S = window.BCCSite, L = window.BCCLivingE, E = window.BCCStandardsE;
  if (!S || !S.themes || !S.themes.e || !L || !E) return;
  var esc = L.esc;
  function productHref(p) { return '/products/' + encodeURIComponent(p.id) + '#ingredients'; }
  function row(label, value) { return '<div><dt>' + esc(label) + '</dt><dd>' + esc(value || 'Not published') + '</dd></div>'; }
  function fold(id, title, content) { return '<details class="std-fold"' + (id ? ' id="' + id + '"' : '') + '><summary>' + esc(title) + '</summary><div class="std-answer">' + content + '</div></details>'; }
  function record(p, i) {
    var ref = E.PRODUCTS.find(function (r) { return r.slug === p.id; });
    var form = p.label_diagram_current && ref ? ref.form : p.ingredients;
    var certification = /GMP certified/i.test(p.certifications || '') && !p.supporting_documents
      ? 'Label states GMP certified. Certificate not published.' : (p.certifications || 'No certification published.');
    return '<section class="std-record" data-std-record="' + esc(p.id) + '" aria-labelledby="std-name-' + esc(p.id) + '"' + (i ? ' hidden' : '') + ' style="--product-colour:' + esc(p.color) + '">' +
      '<header class="std-record-head"><h3 id="std-name-' + esc(p.id) + '">' + esc(p.name) + '</h3><p>' + esc(p.label_source ? 'Published label facts' : 'Label source not published') + '</p></header>' +
      '<dl class="std-facts">' + row('Ingredient form', form) + row('Per serving', p.amount_per_serving) + row('Serving / pack', [p.serving_size, p.pack_size].filter(Boolean).join(' · ')) + row('Made by', p.manufacturer) + row('Ingredient origin', p.ingredient_sourcing) + row('Test reports', p.testing_performed || p.supporting_documents || 'Not published. The label states third-party tested; results are not available here.') + row('Certification', certification) + '</dl>' +
      fold('', 'Allergens & other ingredients', '<dl>' + row('Allergens', p.allergens) + row('Dietary suitability', p.dietary_suitability) + row('Other ingredients', p.other_ingredients) + '</dl>') +
      '<div class="std-record-links"><a class="std-button" href="' + productHref(p) + '">Read the full label</a></div></section>';
  }
  function makers(list) {
    return Object.keys(E.MAKERS).map(function (key) {
      var m = E.MAKERS[key];
      var products = list.filter(function (p) { return E.PRODUCTS.some(function (r) { return r.slug === p.id && r.maker === key; }); });
      return '<article class="std-maker"><h3>' + esc(m.name) + '</h3><p>' + esc(m.place) + '</p><ul>' + products.map(function (p) { return '<li><span style="background:' + esc(p.color) + '" aria-hidden="true"></span>' + esc(p.name) + '</li>'; }).join('') + '</ul>' + fold('', 'Licence details', '<p>FSSAI licence: ' + esc(m.lic) + '</p>') + '</article>';
    }).join('');
  }
  L.wrap('standards', function (root, ctx) {
    var old = root.querySelector('.sx'), list = ctx.published;
    if (!old || !list.length) return;
    var first = list[0];
    old.replaceWith(L.frag('<div class="sx sx-e std-page" data-std>' +
      '<header class="std-hero"><h1>Know what’s in your bottle.</h1><p>Label facts, makers and available lot records.</p><nav aria-label="On this page"><a href="#records">Formula</a><a href="#source" data-std-open>Source</a><a href="#checks" data-std-open>Checks</a><a href="#lot">Lot record</a></nav></header>' +
      '<section class="std-section std-products" id="records" aria-labelledby="std-records-title"><h2 id="std-records-title">Your product, in detail.</h2><div class="std-product-layout"><div class="std-picker" role="group" aria-label="Choose a product">' + list.map(function (p, i) { return '<button type="button" data-std-pick="' + esc(p.id) + '" aria-pressed="' + !i + '" style="--product-colour:' + esc(p.color) + '"><span aria-hidden="true"></span>' + esc(p.name) + '</button>'; }).join('') + '</div><div>' + list.map(record).join('') + '</div></div></section>' +
      '<section class="std-section" aria-labelledby="std-makers-title"><div class="std-section-intro"><h2 id="std-makers-title">Meet the makers.</h2><p>Three finished-product manufacturers, all in Gujarat.</p></div><div class="std-makers">' + makers(list) + '</div>' + fold('', 'Marketed by', '<p>' + esc(E.SOURCING.marketer.replace(/^Marketed by /, '')) + '</p>') + '</section>' +
      '<section class="std-section std-lot" id="lot" aria-labelledby="std-lot-title"><div><h2 id="std-lot-title">Check your lot.</h2><p>Find the lot or batch number printed on your pack, then enter it in the lookup.</p></div><div class="std-lot-action"><p data-std-lot-name>' + esc(first.name) + '</p><a class="std-button" data-std-lot-link href="/reports?product=' + encodeURIComponent(first.id) + '">Check your lot</a><p class="std-secondary">Records appear as reports are published. A lookup does not mean a report is available for every lot.</p></div></section>' +
      '<section class="std-section std-faq" aria-labelledby="std-faq-title"><h2 id="std-faq-title">Quality, explained.</h2><div>' +
      fold('source', 'Where do the ingredients come from?', '<p>The named makers manufacture the finished products. Their addresses do not establish where raw ingredients were grown or made. Check your selected product’s ingredient-origin status above.</p>') +
      fold('checks', 'What testing and certificates can I read?', '<p>The current labels state “third-party tested” and “GMP certified”. Test reports and the GMP certificate are not published on this site yet. A label statement is separate from a supporting document.</p>') +
      fold('std-allergens', 'Where can I check allergens and dietary suitability?', '<p>Open “Allergens & other ingredients” in your selected product’s record, or read its full label for directions and cautions. These details come from the published product label; always check your own pack too.</p>') +
      fold('std-scope', 'What does a lot report cover?', '<p>A report describes a tested sample from one manufacturing lot. It does not cover every lot, authenticate an individual bottle or promise a health outcome.</p>') +
      fold('std-chain', 'How do the records fit together?', '<ol class="std-chain"><li><b>Ingredient</b><span>Raw-material origin</span></li><li><b>Product</b><span>Label and named maker</span></li><li><b>Lot</b><span>The batch on your pack</span></li><li><b>Document</b><span>Evidence for that sample</span></li></ol>') +
      fold('std-communication', 'How do you keep information clear?', '<p>Guides link to their sources. Missing information is marked as unpublished, and ingredient research is kept separate from product test results and customer reviews.</p><p>Found something unclear or out of date? <a href="/contact">Ask a question or report a correction</a>.</p>') +
      '</div></section></div>'));
  });
  L.onEnhance(function (main, signal) {
    var page = main.querySelector('.std-page'); if (!page) return;
    var buttons = [].slice.call(page.querySelectorAll('[data-std-pick]'));
    function pick(id, updateURL) {
      var active = buttons.find(function (b) { return b.dataset.stdPick === id; }); if (!active) return;
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === active)); });
      page.querySelectorAll('[data-std-record]').forEach(function (r) { r.hidden = r.dataset.stdRecord !== id; });
      page.querySelector('[data-std-lot-name]').textContent = active.textContent;
      page.querySelector('[data-std-lot-link]').setAttribute('href', '/reports?product=' + encodeURIComponent(id));
      if (updateURL) { var url = new URL(location.href); url.searchParams.set('product', id); history.replaceState(history.state, '', url); }
    }
    buttons.forEach(function (button, i) {
      button.addEventListener('click', function () { pick(button.dataset.stdPick, true); }, { signal: signal });
      button.addEventListener('keydown', function (event) {
        var n = buttons.length, next = null;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (i + 1) % n;
        if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (i - 1 + n) % n;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = n - 1;
        if (next === null) return;
        event.preventDefault(); buttons[next].focus(); pick(buttons[next].dataset.stdPick, true);
      }, { signal: signal });
    });
    pick(new URL(location.href).searchParams.get('product'), false);
    function openHash() {
      var target = page.querySelectorAll('details');
      target.forEach(function (d) { if ('#' + d.id === location.hash) { d.open = true; requestAnimationFrame(function () { d.scrollIntoView({ block: 'start' }); }); } });
    }
    page.querySelectorAll('[data-std-open]').forEach(function (a) { a.addEventListener('click', function () { var d = page.querySelector(a.hash); if (d) d.open = true; }, { signal: signal }); });
    window.addEventListener('hashchange', openHash, { signal: signal });
    openHash();
  });
})();
