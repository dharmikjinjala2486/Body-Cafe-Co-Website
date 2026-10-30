/* Variant B — The Curious Everyday. Final B-only layer, loaded after every other B decorator.
   1. Media: one resolver for every B product image. The FIRST image of each existing product is the intentional static
      studio artwork in /web/media/bottles-normalized and must stay that way; later images come from the admin gallery
      (order, alt text, captions and visibility). New products without legacy artwork use their first admin image or a
      neutral cap-colour placeholder.
   2. Catalogue: stable editorial order, published-only promotion and counts that follow the live catalogue.
   3. Home: the Curiosity Cabinet (product → label → ingredient context → lot record) and honest feedback states.
   4. Behaviour: one short entrance, restrained hero depth, Cabinet selection, add-to-bag results, offscreen pausing,
      route metadata. Everything degrades to static, fully usable markup and respects prefers-reduced-motion. */
(function () {
  'use strict';
  var S = window.BCCSite;
  if (!S || !S.themes || !S.themes.b) return;
  var RELEASE = window.BCCRelease || { preview: true, production: false };

  /* ---------- 1. Media ---------- */
  var LEGACY = ['iron-bisglycinate', 'l-theanine', 'vitamin-d3-k2', 'omega-3-fish-oil', 'myo-d-chiro-inositol', 'creatine-chews', 'psyllium-husk'];
  var STATIC_ROOT = '/web/media/bottles-normalized/';
  function isLegacy(id) { return LEGACY.indexOf(id) >= 0; }
  function attr(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function visible(p) { return (p && Array.isArray(p.gallery) ? p.gallery : []).filter(function (g) { return g && g.src && g.visible !== false; }); }
  /* A neutral bottle silhouette in the product's cap colour; no label wording, so it can't misstate a product. */
  function placeholder(p) {
    var cap = /^#[0-9a-f]{3,8}$/i.test(p && p.color || '') ? p.color : '#35306f';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 1040"><ellipse cx="360" cy="1000" rx="230" ry="18" fill="#2e2926" opacity=".12"/>' +
      '<rect x="150" y="300" width="420" height="690" rx="64" fill="#fbf7ef" stroke="#2e2926" stroke-width="6"/>' +
      '<rect x="182" y="150" width="356" height="180" rx="36" fill="' + cap + '" stroke="#2e2926" stroke-width="6"/>' +
      '<rect x="150" y="470" width="420" height="300" fill="' + cap + '" opacity=".14"/>' +
      '<circle cx="360" cy="620" r="54" fill="none" stroke="#2e2926" stroke-width="6" opacity=".45"/></svg>';
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }
  function first(p) {
    var name = (p && p.name) || 'Product';
    if (isLegacy(p.id)) return { kind: 'front', src: STATIC_ROOT + p.id + '.svg', w: 720, h: 1040, alt: name + ', front of the bottle', label: 'Front of the bottle', caption: 'Front of the bottle · Studio product image.', isStatic: true };
    var g = visible(p)[0];
    if (g) return { kind: 'front', src: g.src, w: g.w || 1000, h: g.h || 1000, alt: g.alt || name, label: g.label || 'Product image 1', caption: g.caption || g.alt || name };
    return { kind: 'front', src: placeholder(p), w: 720, h: 1040, alt: name + ', product photograph to follow', label: 'Product image to follow', caption: 'Product photography for ' + name + ' will be added here.', isPlaceholder: true };
  }
  /* Images after the first, in admin order. Legacy products without any gallery keep their studio cap render. */
  function rest(p) {
    var g = visible(p);
    if (!g.length && isLegacy(p.id) && !Array.isArray(p.gallery)) return [{ kind: 'cap', src: '/web/media/renders/' + p.id + '-cap.webp', w: 400, h: 400, alt: p.name + ' cap, seen from above', label: 'Cap colour, from above', caption: 'Each product has its own cap colour. Studio render.' }];
    return g.slice(1).map(function (x, i) {
      return { kind: 'gallery', src: x.src, w: x.w || 1000, h: x.h || 1000, alt: x.alt || p.name, label: x.label || 'Product image ' + (i + 2), caption: x.caption || x.alt || p.name };
    });
  }
  function gallery(p) {
    // The PDP model escapes nothing itself, so return attribute-safe strings.
    return [first(p)].concat(rest(p)).map(function (x) { return Object.assign({}, x, { src: attr(x.src), alt: attr(x.alt), label: attr(x.label), caption: attr(x.caption) }); });
  }
  function secondary(p) { var g = visible(p); return g.length > 1 ? g[1] : null; }
  function img(p, o) {
    o = o || {};
    var f = first(p);
    return '<img src="' + attr(f.src) + '" alt="' + attr(o.alt != null ? o.alt : f.alt) + '" width="' + f.w + '" height="' + f.h + '"' +
      (o.eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async"' + (o.cls ? ' class="' + o.cls + '"' : '') + ' data-b-first="' + (f.isStatic ? 'static' : f.isPlaceholder ? 'placeholder' : 'admin') + '">';
  }
  window.BCCBMedia = { first: first, rest: rest, gallery: gallery, secondary: secondary, img: img, placeholder: placeholder, isLegacy: isLegacy };

  /* ---------- 2. Catalogue order and counts ---------- */
  function rank(p, i) {
    var explicit = Number(p.sort_order != null ? p.sort_order : p.position);
    if (isFinite(explicit) && (p.sort_order != null || p.position != null)) return explicit;
    var k = LEGACY.indexOf(p.id);
    return k >= 0 ? k : 1000 + i;
  }
  function ordered(list) {
    return (list || []).map(function (p, i) { return [rank(p, i), i, p]; })
      .sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }).map(function (x) { return x[2]; });
  }
  var WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
  function word(n) { return WORDS[n] || String(n); }
  function cap1(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function orderedCtx(ctx) {
    if (!ctx || ctx.bOrdered) return ctx;
    var published = ordered(ctx.published || []);
    return Object.assign({}, ctx, {
      bOrdered: true, catalog: ordered(ctx.catalog || []), published: published,
      // Featured campaign products are only promoted while they are published.
      live: function (id) { return published.find(function (p) { return p.id === id; }) || null; },
      countWord: word(published.length),
    });
  }
  /* Copy across the shared modules says "seven"; restate it from the published count when the catalogue changes. */
  function recount(root, n) {
    if (n === 7) return;
    var w = word(n);
    var fix = function (s) {
      return s.replace(/\bSEVEN\b/g, w.toUpperCase()).replace(/\bSeven\b/g, cap1(w)).replace(/\bseven\b/g, w)
        .replace(/\b0?7 products\b/g, n + ' products').replace(/(\d{2}) \/ 07\b/g, '$1 / ' + String(n).padStart(2, '0'));
    };
    var walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) {
      var node = walk.currentNode;
      if (node.parentElement && node.parentElement.closest('script,style,textarea')) continue;
      if (/seven|\/ 07|7 products/i.test(node.nodeValue)) node.nodeValue = fix(node.nodeValue);
    }
    root.querySelectorAll('[aria-label]').forEach(function (el) { el.setAttribute('aria-label', fix(el.getAttribute('aria-label'))); });
  }

  /* ---------- 3. Home: the Curiosity Cabinet and customer feedback ---------- */
  function learnHref(id) {
    var L = window.BCCLearnContent;
    return L && L.PRODUCTS && L.PRODUCTS[id] ? '/learn/' + id : '/learn';
  }
  function packLabel(p) {
    if (p.pack_size) return String(p.pack_size);
    var demo = window.BCCDemo && window.BCCDemo.packInfo && window.BCCDemo.packInfo(p.id);
    return demo ? demo.label : '';
  }
  function cabinet(ctx) {
    var ps = ctx.published;
    if (!ps.length) return '';
    var e = ctx.escape, n = ps.length;
    var shelf = ps.map(function (p, i) {
      return '<button type="button" class="bx-shelf-item" role="radio" aria-checked="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" data-bx-pick="' + i + '" style="--cap:' + p.color + ';--i:' + i + '">' +
        '<span class="bx-shelf-no" aria-hidden="true">' + String(i + 1).padStart(2, '0') + '</span>' + img(p, { alt: '' }) + '<span class="bx-shelf-name">' + e(p.name) + '</span></button>';
    }).join('');
    var panels = ps.map(function (p, i) {
      var inView = String(p.ingredients || '').split(';')[0];
      var note = S.notes && S.notes[p.id] && S.notes[p.id].lead;
      var pack = packLabel(p), fmt = ctx.format[p.id] || p.format || '';
      var available = p.published && p.stock > 0;
      return '<article class="bx-panel" data-bx-panel="' + i + '"' + (i ? ' hidden' : '') + ' style="--cap:' + p.color + '" aria-labelledby="bx-panel-' + i + '-t">' +
        '<div class="bx-specimen" aria-hidden="true"><span class="bx-specimen-arch"></span>' + img(p, { alt: '', cls: 'bx-specimen-img' }) + '</div>' +
        '<div class="bx-panel-copy"><p class="bx-panel-meta"><span>' + String(i + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0') + '</span>' + (fmt ? '<span>' + e(fmt) + '</span>' : '') + '</p>' +
        '<h3 id="bx-panel-' + i + '-t">' + e(p.name) + '</h3>' + (p.subtitle ? '<p class="bx-panel-sub">' + e(p.subtitle) + '</p>' : '') +
        '<p class="bx-panel-buy"><strong>' + ctx.money(p.price) + '</strong> <span>MRP</span> <span class="bx-avail" data-state="' + (available ? 'in' : 'out') + '">' + (available ? 'In stock' : 'Out of stock') + '</span></p>' +
        '<ol class="bx-trail">' +
        '<li><span class="bx-trail-n">01</span><strong>The product</strong><small>' + e(fmt || 'Format to follow') + (pack ? ' · ' + e(pack) : '') + '</small><a href="/products/' + p.id + '">See the product<span class="sr-only">: ' + e(p.name) + '</span></a></li>' +
        '<li><span class="bx-trail-n">02</span><strong>The label</strong><small>Ingredient in view: ' + e(inView || 'to follow') + '</small><a href="/products/' + p.id + '#ingredients">Read the label facts<span class="sr-only"> for ' + e(p.name) + '</span></a></li>' +
        '<li><span class="bx-trail-n">03</span><strong>Ingredient context</strong><small>' + (note ? e(note) : 'Ingredient notes for this product are being prepared.') + '</small><a href="' + learnHref(p.id) + '">' + (learnHref(p.id) === '/learn' ? 'Browse ingredient guides' : 'Open the ingredient notes') + '<span class="sr-only"> for ' + e(p.name) + '</span></a></li>' +
        '<li><span class="bx-trail-n">04</span><strong>The lot record</strong><small>Keep the lot number printed on your pack, then look up its record.</small><a href="/reports?product=' + p.id + '">Find a lot record<span class="sr-only"> for ' + e(p.name) + '</span></a></li>' +
        '</ol></div></article>';
    }).join('');
    return '<section class="atelier-lab bx-cabinet" data-bx-cabinet data-home-section="curiosity" aria-labelledby="bx-cabinet-t">' +
      '<header class="bx-cab-head"><p class="hc-kicker">02 — The Curiosity Cabinet</p><h2 id="bx-cabinet-t" class="tb-big">Pick a bottle.<br><em>Follow it all the way.</em></h2>' +
      '<p>Every bottle opens the same four-step trail: the product, its label, the ingredient context and the record for your lot.</p></header>' +
      '<div class="bx-cab-body"><div class="bx-shelf" role="radiogroup" aria-label="Choose one of ' + word(n) + ' products to explore" style="--n:' + n + '">' + shelf + '</div>' +
      '<div class="bx-panels">' + panels + '</div></div></section>';
  }
  function emptyVoices() {
    return '<section class="hc-section hc-voices bx-voices-empty" data-home-section="voices" aria-labelledby="bx-voices-t"><div class="bx-voices-in"><p class="hc-kicker">04 — Customer voices</p>' +
      '<h2 id="bx-voices-t" class="tb-big">Real feedback.<br><em>When it’s real.</em></h2><p>Reviews appear on each product page after a verified delivery and moderation. We don’t show sample quotes, invented names or star ratings in their place.</p>' +
      '<a class="tb-chip" href="/shop">Browse the collection <span aria-hidden="true">↗</span></a></div></section>';
  }
  function homeFinish(html, ctx) {
    var t = document.createElement('template');
    t.innerHTML = html;
    var lab = t.content.querySelector('.atelier-lab');
    if (lab) { var c = document.createElement('template'); c.innerHTML = cabinet(ctx); if (c.content.firstElementChild) lab.replaceWith(c.content.firstElementChild); else lab.remove(); }
    var voices = t.content.querySelector('[data-home-section="voices"]');
    if (voices && RELEASE.production) { var v = document.createElement('template'); v.innerHTML = emptyVoices(); voices.replaceWith(v.content.firstElementChild); }
    else if (voices) voices.setAttribute('data-bx-loop', '');
    return t.innerHTML;
  }

  /* ---------- Wrap every B renderer ---------- */
  var base = S.themes.b, next = {};
  Object.keys(base).forEach(function (k) {
    var fn = base[k];
    if (typeof fn !== 'function') { next[k] = fn; return; }
    next[k] = function (ctx) {
      var args = [].slice.call(arguments);
      args[0] = orderedCtx(ctx);
      var html = fn.apply(this, args);
      if (k === 'home' && typeof html === 'string') html = homeFinish(html, args[0]);
      // A production release states availability and ordering from real capability rather than preview wording.
      if (k === 'product' && typeof html === 'string' && RELEASE.production) {
        var paused = args[0].state && args[0].state.flags && args[0].state.flags.checkout_enabled === false;
        html = html.replace(/Out of stock in the preview/g, 'Out of stock').replace(/In stock in the preview/g, 'In stock')
          .replace('One-time purchase. Preview order only: no payment or dispatch.', 'One-time purchase. ' + (paused ? 'Online ordering opens soon; your bag is saved on this device.' : 'Payment is confirmed at checkout.'))
          .replace('The approved rear label is not available in this preview.', 'The approved rear label isn’t available yet.');
      }
      // Long admin-entered names get a calmer title size instead of a towering block.
      if (k === 'product' && typeof html === 'string' && args[1] && String(args[1].name || '').length > 24) html = html.replace('class="pp-h1"', 'class="pp-h1 bx-long"');
      if (k === 'chrome' && typeof html === 'string') {
        var t = document.createElement('template');
        t.innerHTML = html;
        recount(t.content, args[0].published.length);
        if (RELEASE.production) t.content.querySelectorAll('a[href="/preview/states"]').forEach(function (a) { a.remove(); });
        html = t.innerHTML;
      }
      return html;
    };
  });
  S.themes.b = next;

  /* ---------- 4. Behaviour ---------- */
  var cleanup = function () {};
  var introDone = false;
  function reduced() { return matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function finePointer() { return matchMedia('(hover: hover) and (pointer: fine)').matches; }

  function heroDepth(main, signal) {
    var hero = main.querySelector('.tb-hero');
    if (!hero) return;
    if (!introDone && !reduced()) { hero.classList.add('bx-intro'); setTimeout(function () { hero.classList.remove('bx-intro'); }, 1200); }
    introDone = true;
    var art = hero.querySelector('.tb-hero-art');
    if (!art || reduced() || !finePointer()) return;
    var frame = 0, x = 0, y = 0;
    art.addEventListener('pointermove', function (ev) {
      var r = art.getBoundingClientRect();
      x = (ev.clientX - r.left) / r.width - 0.5; y = (ev.clientY - r.top) / r.height - 0.5;
      if (!frame) frame = requestAnimationFrame(function () { frame = 0; art.style.setProperty('--bx-dx', x.toFixed(3)); art.style.setProperty('--bx-dy', y.toFixed(3)); });
    }, { signal: signal });
    art.addEventListener('pointerleave', function () { art.style.setProperty('--bx-dx', 0); art.style.setProperty('--bx-dy', 0); }, { signal: signal });
  }

  function cabinetBehaviour(main, signal) {
    main.querySelectorAll('[data-bx-cabinet]').forEach(function (root) {
      var picks = [].slice.call(root.querySelectorAll('[data-bx-pick]'));
      var panels = [].slice.call(root.querySelectorAll('[data-bx-panel]'));
      var current = 0;
      function select(i, focus) {
        if (i === current) { if (focus) picks[i].focus(); return; }
        var prev = panels[current];
        current = i;
        picks.forEach(function (b, n) { b.setAttribute('aria-checked', String(n === i)); b.tabIndex = n === i ? 0 : -1; });
        panels.forEach(function (p, n) { p.hidden = n !== i; p.classList.toggle('is-entering', n === i && !reduced()); });
        if (prev && !reduced()) setTimeout(function () { panels[i].classList.remove('is-entering'); }, 460);
        root.style.setProperty('--bx-cap', picks[i].style.getPropertyValue('--cap'));
        if (focus) picks[i].focus();
        // Keep the chosen bottle in view on the scrollable phone shelf without moving the page.
        var shelf = picks[i].parentElement;
        if (shelf.scrollWidth > shelf.clientWidth) shelf.scrollTo({ left: picks[i].offsetLeft - shelf.clientWidth / 2 + picks[i].offsetWidth / 2, behavior: reduced() ? 'auto' : 'smooth' });
      }
      picks.forEach(function (b, i) {
        b.addEventListener('click', function () { select(i, false); }, { signal: signal });
        b.addEventListener('keydown', function (ev) {
          var k = ev.key, n = picks.length, to = null;
          if (k === 'ArrowRight' || k === 'ArrowDown') to = (i + 1) % n;
          else if (k === 'ArrowLeft' || k === 'ArrowUp') to = (i - 1 + n) % n;
          else if (k === 'Home') to = 0; else if (k === 'End') to = n - 1;
          if (to === null) return;
          ev.preventDefault(); select(to, true);
        }, { signal: signal });
      });
      if (picks[0]) root.style.setProperty('--bx-cap', picks[0].style.getPropertyValue('--cap'));
    });
  }

  /* Add-to-bag buttons report the actual result (app.js decides; we read the bag count it updated).
     Capture phase so the 'before' count is read ahead of app.js's own click handler. */
  function addFeedback(signal) {
    document.addEventListener('click', function (ev) {
      var b = ev.target.closest && ev.target.closest('button[data-add]');
      if (!b || document.body.dataset.theme !== 'b' || b.disabled) return;
      var countEl = document.querySelector('[data-cart-count]'), before = countEl ? +countEl.textContent : 0;
      setTimeout(function () {
        var after = countEl ? +(document.querySelector('[data-cart-count]') || countEl).textContent : before;
        var label = b.querySelector('span:last-child'), original = b.getAttribute('data-bx-label') || (label ? label.textContent : '');
        b.setAttribute('data-bx-label', original);
        var ok = after > before;
        b.dataset.bxResult = ok ? 'added' : 'failed';
        if (label) label.textContent = ok ? 'Added' : 'Not added';
        clearTimeout(b.bxTimer);
        b.bxTimer = setTimeout(function () { delete b.dataset.bxResult; if (label) label.textContent = original; }, 1800);
      }, 0);
    }, { signal: signal, capture: true });
  }

  function loops(main, signal) {
    var items = [].slice.call(main.querySelectorAll('[data-bx-loop]'));
    if (!items.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('bx-offscreen', !e.isIntersecting); }); });
    items.forEach(function (el) { el.classList.add('bx-offscreen'); io.observe(el); });
    signal.addEventListener('abort', function () { io.disconnect(); });
  }

  /* Route metadata for sharing; the preview stays noindex until a production release changes the robots meta. */
  function meta(name, value, prop) {
    var sel = prop ? 'meta[property="' + name + '"]' : 'meta[name="' + name + '"]';
    var el = document.head.querySelector(sel);
    if (!el) { el = document.createElement('meta'); el.setAttribute(prop ? 'property' : 'name', name); document.head.appendChild(el); }
    el.setAttribute('content', value);
  }
  function seo(main) {
    var url = location.origin + location.pathname;
    var canon = document.head.querySelector('link[rel="canonical"]');
    if (!canon) { canon = document.createElement('link'); canon.rel = 'canonical'; document.head.appendChild(canon); }
    canon.href = url;
    var desc = (document.head.querySelector('meta[name="description"]') || {}).content || '';
    var pp = main.querySelector('[data-pp-product]');
    var image = pp ? (pp.querySelector('.pp-slide img') || {}).src : location.origin + '/web/media/editorial-b/hero/home-hero-panel.webp';
    meta('og:type', pp ? 'product' : 'website', true); meta('og:title', document.title, true); meta('og:description', desc, true);
    meta('og:url', url, true); if (image && !/^data:/.test(image)) meta('og:image', image, true);
    meta('twitter:card', 'summary_large_image');
    var old = document.getElementById('bx-ld'); if (old) old.remove();
    if (!pp || !window.BCCVariantB.product) return;
    var p = window.BCCVariantB.product(pp.getAttribute('data-pp-product'));
    if (!p) return;
    var ld = { '@context': 'https://schema.org', '@type': 'Product', name: p.name, sku: p.sku || undefined, description: p.seo_description || p.subtitle || undefined, brand: { '@type': 'Brand', name: 'Body Café Co.' },
      image: image && !/^data:/.test(image) ? [image] : undefined,
      offers: { '@type': 'Offer', priceCurrency: 'INR', price: String(p.price), availability: 'https://schema.org/' + (p.published && p.stock > 0 ? 'InStock' : 'OutOfStock'), url: url } };
    var s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'bx-ld'; s.textContent = JSON.stringify(ld).replace(/</g, '\\u003c');
    document.head.appendChild(s);
  }

  var addBound = false;
  function enhance(lookup) {
    if (typeof lookup === 'function') window.BCCVariantB.product = lookup;
    cleanup();
    var main = document.querySelector('#main');
    if (!main || document.body.dataset.theme !== 'b') { cleanup = function () {}; return; }
    var abort = new AbortController(), signal = abort.signal;
    if (!addBound) { addBound = true; addFeedback(new AbortController().signal); }
    heroDepth(main, signal);
    cabinetBehaviour(main, signal);
    if (window.BCCBPdpHero) window.BCCBPdpHero.enhance();
    if (window.BCCBPages) window.BCCBPages.enhance();
    loops(main, signal);
    var seoTimer = setTimeout(function () { seo(main); }, 30);
    cleanup = function () { abort.abort(); clearTimeout(seoTimer); };
  }
  window.BCCVariantB = { enhance: enhance, ordered: ordered, word: word, product: null };
})();
