/* Variant B — The Curious Everyday: inner-page compositions.
   One vocabulary, many layouts: open typography, ruled ledgers, annotated specimens, editorial spreads, the
   product → label → ingredient → record trail, and quiet utility sections. Each renderer's markup, data hooks and
   behaviour stay intact; this layer adds a page class, explanatory figures and a few structural wrappers.
   Facts come only from the catalogue and existing copy. Images: the unchanged static first artwork, accurate packaging
   crops/stills, existing editorial illustrations and genuine brand design artefacts. */
(function () {
  'use strict';
  var S = window.BCCSite;
  if (!S || !S.themes || !S.themes.b) return;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function frag(html) { var t = document.createElement('template'); t.innerHTML = html; return t.content; }
  function wrap(name, fn) {
    var base = S.themes.b[name];
    if (typeof base !== 'function') return;
    var next = Object.assign({}, S.themes.b);
    next[name] = function (ctx) {
      var html = base.apply(this, arguments);
      if (typeof html !== 'string') return html;
      var t = document.createElement('template');
      t.innerHTML = html;
      try { fn(t.content, ctx, [].slice.call(arguments, 1)); } catch (e) { if (window.console) console.warn('Variant B layout skipped:', e); return html; }
      return t.innerHTML;
    };
    S.themes.b = next;
  }
  var LEGACY = ['iron-bisglycinate', 'l-theanine', 'vitamin-d3-k2', 'omega-3-fish-oil', 'myo-d-chiro-inositol', 'creatine-chews', 'psyllium-husk'];
  var ED = '/web/media/editorial-b/';
  var ILLUSTRATION = {
    'iron-bisglycinate': ['learn/learn_iron', 'Abstract terracotta and cream forms: an ingredient-form illustration.'],
    'l-theanine': ['learn/learn_theanine', 'Tea leaves beside sculptural sage glass.'],
    'vitamin-d3-k2': ['learn/learn_d3k2', 'Indigo and lilac glass panels separated by warm light.'],
    'omega-3-fish-oil': ['learn/learn_omega', 'Golden oil in a glass dish.'],
    'myo-d-chiro-inositol': ['learn/learn_inositol', 'Two interlocking lilac ceramic loops.'],
    'creatine-chews': ['learn/learn_creatine', 'An orange, a teal towel and an indigo dumbbell.'],
    'psyllium-husk': ['learn/learn_psyllium', 'Psyllium husks in a glass bowl.']
  };
  /* Ingredient context lines are restatements of existing, sourced Learn copy — never benefits or quantities. */
  var CONTEXT = {
    'l-theanine': 'L-theanine is an amino acid found in tea leaves.',
    'vitamin-d3-k2': 'Three named parts in one softgel: vitamin D3, vitamin K2, and omega-3 as triglycerides.',
    'myo-d-chiro-inositol': 'Two forms of inositol, each named on its own.',
    'psyllium-husk': 'Psyllium husk is a source of fibre.',
    'creatine-chews': 'Creatine, in a chewable tablet.',
    'iron-bisglycinate': 'Iron bound to the amino acid glycine. The number to find on a label is the elemental iron.',
    'omega-3-fish-oil': 'Fish oil, and the omega-3 it contains, are two different numbers on a label.'
  };
  function img(src, alt, w, h, cls, eager) {
    return '<img src="' + src + '" alt="' + esc(alt) + '" width="' + w + '" height="' + h + '"' + (cls ? ' class="' + cls + '"' : '') + (eager ? '' : ' loading="lazy"') + ' decoding="async" data-bz-img>';
  }
  function first(p) { return window.BCCBMedia ? window.BCCBMedia.first(p) : { src: '/web/media/bottles-normalized/' + p.id + '.svg', w: 720, h: 1040 }; }
  function parts(p) {
    return String(p.ingredients || p.name || '').split(';')[0].split(/,\s*|\s+and\s+/).map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 4);
  }
  function pub(ctx) { var l = (ctx && ctx.published) || []; return window.BCCVariantB && window.BCCVariantB.ordered ? window.BCCVariantB.ordered(l) : l; }
  function packOf(p) { if (p.pack_size) return esc(p.pack_size); var d = window.BCCDemo && window.BCCDemo.packInfo && window.BCCDemo.packInfo(p.id); return d ? esc(d.label) : '<span class="bz-pending">Awaiting approved label</span>'; }
  function guideHref(id) { var L = window.BCCLearnContent; return L && L.PRODUCTS && L.PRODUCTS[id] ? '/learn/' + id : '/learn'; }
  function trail(p, here) {
    var steps = [['product', 'The product', '#overview', 'What it is'], ['label', 'The label', '#ingredients', 'What’s inside'], ['ingredient', 'Ingredient context', guideHref(p.id), 'Read the guide'], ['record', 'The lot record', here === 'reports' ? '#find' : '/reports?product=' + encodeURIComponent(p.id), 'Find your lot']];
    return '<nav class="bz-trail" aria-label="Follow ' + esc(p.name) + ' from bottle to record" style="--cap:' + p.color + '"><ol>' + steps.map(function (s, i) {
      return '<li' + (s[0] === here ? ' aria-current="step"' : '') + '><a href="' + s[2] + '"><span class="bz-trail-n" aria-hidden="true">' + String(i + 1).padStart(2, '0') + '</span><span class="bz-trail-t">' + s[1] + '</span><span class="bz-trail-s">' + s[3] + '</span></a></li>';
    }).join('') + '</ol></nav>';
  }

  /* ====================================================================== 1. Product page below the hero */
  function formula(p) {
    var list = parts(p), n = list.length, ill = ILLUSTRATION[p.id];
    var discs = '<div class="bz-formula" data-n="' + n + '" style="--cap:' + p.color + '" role="img" aria-label="Named parts: ' + esc(list.join(', ')) + '">' + list.map(function (x, i) { return '<span class="bz-disc bz-disc-' + (i + 1) + '"><span>' + esc(x) + '</span></span>'; }).join('') + '</div>';
    return '<figure class="bz-formula-fig">' + discs +
      '<figcaption>' + (n > 1 ? 'The ' + ['', 'one', 'two', 'three', 'four'][n] + ' named parts of this formula. Amounts and proportions come from the approved label, not from this drawing.' : 'One named ingredient. Its amount per serving comes from the approved label.') + '</figcaption></figure>' +
      (ill ? '<figure class="bz-ingredient-art">' + img(ED + ill[0] + '.webp', ill[1], 1600, 1000) + '<figcaption>' + esc(CONTEXT[p.id] || '') + ' <span>Illustration.</span></figcaption></figure>' : '');
  }
  function specimen(p) {
    var f = first(p);
    return '<figure class="bz-specimen" style="--cap:' + p.color + '"><div class="bz-specimen-stage"><span class="bz-bottle" style="aspect-ratio:' + f.w + ' / ' + f.h + '">' + img(f.src, '', f.w, f.h, 'bz-specimen-img') +
      '<span class="bz-pin bz-pin-1" aria-hidden="true">1</span><span class="bz-pin bz-pin-2" aria-hidden="true">2</span><span class="bz-pin bz-pin-3" aria-hidden="true">3</span></span></div>' +
      '<figcaption><ol class="bz-pin-notes"><li><strong>Cap colour</strong> Identifies this product across the collection.</li><li><strong>Front label</strong> Product name and format.</li><li><strong>Rear label</strong> Amounts, serving size, directions and cautions — shown here once the approved label is supplied.</li></ol><p class="bz-fineprint">Front-of-bottle studio image. The rear label isn’t pictured.</p></figcaption></figure>';
  }
  wrap('product', function (root, ctx, args) {
    var p = args[0], pp = root.querySelector('.pp-b');
    if (!p || !pp) return;
    pp.classList.add('bzp');
    pp.style.setProperty('--cap', p.color);
    var hero = pp.querySelector('.pp-hero');
    if (hero) hero.after(frag(trail(p, 'product')));
    var ov = pp.querySelector('#overview .pp-body');
    if (ov) { var lead = ov.querySelector('.pp-lead'); var box = document.createElement('div'); box.className = 'bz-formula-wrap'; box.append(frag(formula(p))); (lead ? lead.after(box) : ov.prepend(box)); }
    var ing = pp.querySelector('#ingredients .pp-sec-in');
    if (ing) { ing.classList.add('bz-has-specimen'); ing.append(frag(specimen(p))); }
    pp.querySelectorAll('.pp-sec').forEach(function (s) { s.classList.add('bz-ch'); });
  });

  /* ====================================================================== 2. Lot reports */
  wrap('reports', function (root, ctx) {
    var lt = root.querySelector('.lt-b');
    if (!lt) return;
    lt.classList.add('bzr');
    var list = pub(ctx);
    var q = new URL(location.href).searchParams.get('product');
    var p = list.find(function (x) { return x.id === q; }) || list[0];
    var intro = lt.querySelector('.lt-intro');
    if (intro && p) {
      var f = first(p);
      intro.append(frag('<figure class="bz-lot-art" data-bz-lot-art style="--cap:' + p.color + '"><div class="bz-lot-stage">' + img(f.src, '', f.w, f.h, 'bz-lot-bottle', true) +
        '<div class="bz-lot-tag" aria-hidden="true"><span>LOT</span><b></b><i>Printed on your pack, separate from the barcode</i></div></div>' +
        '<figcaption data-bz-lot-name>' + esc(p.name) + ' · front of the bottle. Your lot number is printed on the pack.</figcaption></figure>'));
    }
    // A data map lets the stage follow the chosen product without re-rendering the form.
    lt.setAttribute('data-bz-products', JSON.stringify(list.map(function (x) { var f = first(x); return [x.id, f.src, x.color, x.name]; })));
  });
  function reportsBehaviour(main) {
    var lt = main.querySelector('.bzr'); if (!lt) return;
    var map = {}; try { JSON.parse(lt.getAttribute('data-bz-products') || '[]').forEach(function (x) { map[x[0]] = x; }); } catch (e) {}
    var art = lt.querySelector('[data-bz-lot-art]'); if (!art) return;
    var sync = function () {
      var r = lt.querySelector('input[name="product"]:checked'), x = r && map[r.value]; if (!x) return;
      var im = art.querySelector('.bz-lot-bottle'); if (im.getAttribute('src') !== x[1]) im.setAttribute('src', x[1]);
      art.style.setProperty('--cap', x[2]);
      art.querySelector('[data-bz-lot-name]').textContent = x[3] + ' · front of the bottle. Your lot number is printed on the pack.';
    };
    lt.addEventListener('change', function (e) { if (e.target.name === 'product') sync(); });
    sync();
  }

  /* ====================================================================== 3. Learn: a small publication */
  var LABEL_CALLOUTS = [
    ['1', '#names', 'Name and form', 'The ingredient named in full, including its form.'],
    ['2', '#serving', 'Serving size', 'How many units make one serving.'],
    ['3', '#serving', 'Amount per serving', 'Each ingredient’s amount and unit, per serving.'],
    ['4', '#statements', 'Required statements', 'Wording such as “HEALTH SUPPLEMENT”.'],
    ['5', '#warnings', 'Directions and warnings', 'How to use it, and who should check first.'],
    ['6', '#lot', 'Lot and dates', 'The batch code and expiry, printed on the pack.']
  ];
  function labelDiagram() {
    var row = function (n) { return '<tr><th>Ingredient ' + n + ' <span>(as named form)</span></th><td>— mg</td><td>— %</td></tr>'; };
    return '<figure class="bz-label-fig" aria-labelledby="bz-label-cap"><div class="bz-label-layout">' +
      '<div class="bz-label" aria-hidden="true"><p class="bz-label-tag">Example label · not a Body Café Co. product</p>' +
      '<div class="bz-z bz-z1"><b>Example Ingredient Capsules</b><span>Ingredient (as named form)</span></div>' +
      '<div class="bz-z bz-z2">Serving size: — capsule(s) · Servings per pack: —</div>' +
      '<div class="bz-z bz-z3"><table><thead><tr><th>Per serving</th><th>Amount</th><th>%RDA</th></tr></thead><tbody>' + row('A') + row('B') + '</tbody></table></div>' +
      '<div class="bz-z bz-z4">HEALTH SUPPLEMENT · NOT FOR MEDICINAL USE</div>' +
      '<div class="bz-z bz-z5"><b>Directions</b> ———— <b>Warnings</b> ———— ———</div>' +
      '<div class="bz-z bz-z6"><span>LOT</span> ▢▢▢▢▢▢ <span>EXP</span> ▢▢/▢▢</div></div>' +
      '<ol class="bz-callouts">' + LABEL_CALLOUTS.map(function (c) { return '<li><a href="' + c[1] + '" data-z="' + c[0] + '"><span class="bz-callout-n" aria-hidden="true">' + c[0] + '</span><strong>' + c[2] + '</strong><small>' + c[3] + '</small></a></li>'; }).join('') + '</ol></div>' +
      '<figcaption id="bz-label-cap">An educational drawing for this guide. It isn’t a Body Café Co. label and shows no real amounts. Select a part to jump to its explanation.</figcaption></figure>';
  }
  wrap('learn', function (root, ctx, args) {
    var lr = root.querySelector('.lr-b');
    if (!lr) return;
    lr.classList.add('bzl');
    if (lr.classList.contains('lr-hub')) {
      lr.classList.add('bzl-hub');
      var leadCard = lr.querySelector('#essentials .lr-guide-card'), topics = lr.querySelector('.lr-topics');
      if (leadCard && topics) {
        var a = leadCard.querySelector('h3 a'), ps = leadCard.querySelectorAll('p:not(.lr-guide-n):not(.lr-meta)'), meta = leadCard.querySelector('.lr-meta'), im = leadCard.querySelector('img');
        var href = a.getAttribute('href');
        topics.after(frag('<section class="bz-lead" aria-labelledby="bz-lead-t"><a class="bz-lead-media" href="' + href + '" tabindex="-1" aria-hidden="true">' + (im ? img(im.getAttribute('src'), '', 1600, 1000, '', true) : '') + '</a>' +
          '<div class="bz-lead-copy"><p class="bz-kicker">Lead guide · Essentials' + (meta ? ' · ' + esc(meta.textContent) : '') + '</p><h2 id="bz-lead-t"><a href="' + href + '">' + esc(a.textContent) + '</a></h2>' +
          (ps[0] ? '<p class="bz-lead-sum">' + esc(ps[0].textContent) + '</p>' : '') + '<a class="bz-lead-cta" href="' + href + '">Read the guide <span aria-hidden="true">→</span></a></div></section>' +
          '<section class="bz-tools" aria-label="Tools in Learn"><a href="#explorer"><span class="bz-tool-k">Tool</span><strong>Understand this bottle</strong><small>Step through any of our products, from name to lot record.</small></a>' +
          '<a href="#label"><span class="bz-tool-k">Tool</span><strong>Look beyond the front label</strong><small>An educational example label, explained part by part.</small></a>' +
          '<a href="/learn/understanding-reports"><span class="bz-tool-k">Walkthrough</span><strong>What a lot report shows</strong><small>Read a report from lot number to result.</small></a></section>'));
      }
      var ex = lr.querySelector('.lr-explorer-wrap'); if (ex && !ex.id) ex.id = 'explorer';
    } else if (lr.classList.contains('lr-article')) {
      lr.classList.add('bzl-article');
      var slug = location.pathname.split('/').filter(Boolean).pop();
      var minute = slug === 'reading-a-label' && lr.querySelector('#minute');
      if (minute) minute.append(frag(labelDiagram()));
    }
  });

  /* ====================================================================== 4. Standards: Formula → Source → Checks → Record */
  var ICONS = {
    formula: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="14" y="8" width="36" height="48" rx="5"/><path d="M21 20h22M21 28h22M21 36h14M21 44h18"/></svg>',
    source: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 46c10-2 14-14 24-14s12 10 20 8"/><circle cx="10" cy="46" r="4"/><circle cx="34" cy="32" r="4"/><path d="M54 14c-6 0-10 4-10 9 0 7 10 17 10 17s10-10 10-17c0-5-4-9-10-9Z" transform="translate(-6 0)"/><circle cx="48" cy="23" r="3"/></svg>',
    checks: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="10" width="30" height="40" rx="4"/><path d="M16 22l3 3 6-6M16 34l3 3 6-6"/><circle cx="42" cy="40" r="10"/><path d="M49 47l8 8"/></svg>',
    record: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M16 6h24l10 10v42H16Z"/><path d="M40 6v10h10M22 28h22M22 36h22"/><rect x="22" y="44" width="18" height="8" rx="2"/></svg>'
  };
  wrap('standards', function (root) {
    var sx = root.querySelector('.sx-b');
    if (!sx) return;
    sx.classList.add('bzs');
    var keys = ['formula', 'source', 'checks', 'record'];
    sx.querySelectorAll('.sx-principles > li').forEach(function (li, i) {
      var a = li.querySelector('a') || li; li.setAttribute('data-step', keys[i] || '');
      if (ICONS[keys[i]]) a.insertAdjacentHTML('afterbegin', '<span class="bz-step-art">' + ICONS[keys[i]] + '</span>');
    });
    sx.querySelectorAll('.sx-sec').forEach(function (sec) { sec.classList.add('bz-sx-' + sec.id); });
  });

  /* ====================================================================== 5. Shop: a curated collection */
  wrap('shop', function (root, ctx) {
    var sp = root.querySelector('.sp-b') || root.querySelector('[data-sp]');
    if (!sp) return;
    sp.classList.add('bzshop');
    var list = pub(ctx);
    var sw = sp.querySelector('.sp-swatches');
    if (sw && list.length) {
      sw.replaceWith(frag('<div class="bz-shelf" aria-hidden="true">' + list.map(function (p, i) { var f = first(p); return '<span class="bz-shelf-b" style="--cap:' + p.color + ';--i:' + i + '">' + img(f.src, '', f.w, f.h, '', true) + '</span>'; }).join('') + '<span class="bz-shelf-line"></span></div>'));
    }
    var col = sp.querySelector('.sp-collection');
    if (col && list.length) {
      var money = ctx.money || function (n) { return '₹' + n; };
      col.after(frag('<section class="bz-compare" aria-labelledby="bz-compare-t"><div class="bz-compare-in"><header><p class="bz-kicker">At a glance</p><h2 id="bz-compare-t">The collection, side by side</h2><p>Format, pack and price for every product — the same facts as each product page.</p></header>' +
        '<div class="bz-table-wrap" role="region" aria-labelledby="bz-compare-t" tabindex="0"><table class="bz-table"><thead><tr><th scope="col">Product</th><th scope="col">Format</th><th scope="col">Pack</th><th scope="col">Price</th><th scope="col">Availability</th></tr></thead><tbody>' +
        list.map(function (p) { var live = p.published && p.stock > 0; return '<tr style="--cap:' + p.color + '"><th scope="row"><a href="/products/' + p.id + '"><i aria-hidden="true"></i>' + esc(p.name) + '</a></th><td>' + esc((ctx.format && ctx.format[p.id]) || p.format || '—') + '</td><td>' + packOf(p) + '</td><td>' + money(p.price) + ' <small>MRP</small></td><td><span class="bz-avail" data-state="' + (live ? 'in' : 'out') + '">' + (live ? 'In stock' : 'Out of stock') + '</span></td></tr>'; }).join('') +
        '</tbody></table></div></div></section>'));
    }
    var std = sp.querySelector('#shop-standards'); if (std) std.remove();
    var help = sp.querySelector('#shop-help'); if (help) { help.classList.add('bz-slim'); var k = help.querySelector('.sp-k'); if (k) k.textContent = '02'; }
  });

  /* ====================================================================== 6. About: a short manifesto (Story carries the long form) */
  function aboutCompose(root) {
    var ab = root.querySelector('.ab-b');
    if (!ab) return false;
    ab.classList.add('bza');
    ['.ab-nav', '#collection', '#behind'].forEach(function (sel) { var el = ab.querySelector(sel); if (el) el.remove(); });
    var media = ab.querySelector('.ab-meet-media'), meet = ab.querySelector('#meet');
    if (media && meet) { media.classList.add('bz-spread'); meet.after(media); }
    var n = 0; ab.querySelectorAll('.ab-sec .ab-k').forEach(function (k) { n += 1; k.textContent = String(n).padStart(2, '0') + ' · ' + k.textContent.replace(/^\d+\s*/, ''); });
    var links = ab.querySelector('.ab-meet-links'); if (links) links.querySelectorAll('a[href="#people"]').forEach(function (a) { a.setAttribute('href', '/story'); a.textContent = 'Read our story →'; });
    return true;
  }
  wrap('about', function (root) { aboutCompose(root); });

  /* ====================================================================== 7. Story: a visual essay */
  wrap('story', function (root) {
    if (aboutCompose(root)) return; // /about falls back to story() only when no about renderer exists
    var st = root.querySelector('.st-b');
    if (!st) return;
    st.classList.add('bzst');
    st.querySelectorAll('.st-ch').forEach(function (ch, i) { ch.classList.add(i % 2 ? 'bz-even' : 'bz-odd'); });
  });

  /* ====================================================================== 8. Bundles: edits as editorial spreads */
  wrap('bundles', function (root, ctx, args) {
    var page = root.querySelector('.tb-page');
    if (!page) return;
    page.classList.add('bzb', args[0] ? 'bzb-detail' : 'bzb-list');
    // The pair is the subject of the first screen: load it straight away.
    page.querySelectorAll('.tb-edit-hero img, .tb-duo:first-child img').forEach(function (im) { im.removeAttribute('loading'); });
    page.querySelectorAll('.tb-duo').forEach(function (d, i) { d.classList.add(i % 2 ? 'bz-flip' : 'bz-keep'); });
  });

  /* ====================================================================== 9. Service pages: quietly distinctive */
  wrap('help', function (root) { var su = root.querySelector('.su-b'); if (su) su.classList.add('bzhelp'); });
  wrap('contact', function (root) { var su = root.querySelector('.su-b'); if (su) su.classList.add('bzhelp', 'bzhelp-form'); });
  wrap('policy', function (root) { var su = root.querySelector('.su-b'); if (su) su.classList.add('bzhelp', 'bzhelp-doc'); });
  wrap('cart', function (root) { var bg = root.querySelector('.bg-b'); if (bg) bg.classList.add('bzbag'); });
  wrap('account', function (root) { var ac = root.querySelector('.ac-b'); if (ac) ac.classList.add('bzacc'); });

  /* ====================================================================== 10. Section-bounded sticky left columns
     A left heading/intro/image beside longer right-hand content stays in view below the sticky header, inside its own
     section only (its grid/flex parent is the containing block, so it scrolls away before the next section).
     It pins only when it is genuinely beside the right column and fits the visible height; otherwise it stays in flow. */
  var PIN = [
    '.bzp .pp-sec:not(.pp-sec-overview) .pp-head', '.bzp .bz-specimen',
    '.bzr .lt-sec .lt-head', '.bzr .lt-intro',
    '.bzs .sx-sec .sx-head', '.bza .ab-sec .ab-head',
    '.bzshop .sp-sec .sp-head', '.bz-compare-in > header',
    '.bzl .lr-sec-in > .lr-head', '.bzl-article .lr-toc',
    '.bzhelp .su-toc', '.bzb-detail .tb-duo-photos',
    '[data-home-section="trust"] .hc-heading', '[data-home-section="faq"] > div:first-child', '.tb-home-lot .lot-copy'
  ];
  var pinState = { els: [], ro: null, raf: 0 };
  function pinTop() {
    var t = 0;
    ['.site-header', '.st-nav', '.atelier-reading-trail'].forEach(function (sel) {
      var e = document.querySelector(sel); if (!e || !e.offsetHeight) return;
      var cs = getComputedStyle(e);
      if (cs.position === 'sticky' || cs.position === 'fixed') t = Math.max(t, (parseFloat(cs.top) || 0) + e.offsetHeight);
    });
    return Math.round(t + 24);
  }
  function layoutPins() {
    pinState.raf = 0;
    var top = pinTop(), room = innerHeight - top - 24;
    document.documentElement.style.setProperty('--bz-pin-top', top + 'px');
    pinState.els.forEach(function (el) { el.classList.remove('bz-stick'); });
    pinState.els.forEach(function (el) {
      if (!el.isConnected || !el.offsetHeight) return;
      var r = el.getBoundingClientRect(), parent = el.parentElement;
      var partners = [].slice.call(parent.children).filter(function (c) {
        if (c === el || !c.offsetHeight) return false;
        var cr = c.getBoundingClientRect();
        return cr.left >= r.right - 4 && cr.bottom > r.top; // beside it, not stacked under it
      });
      if (!partners.length) return;
      var reach = Math.max.apply(null, partners.map(function (c) { return c.getBoundingClientRect().bottom; })) - r.top;
      if (reach > el.offsetHeight + 48 && el.offsetHeight <= room) el.classList.add('bz-stick');
    });
  }
  // A short timer rather than requestAnimationFrame: it also runs while the tab is in the background.
  function queuePins() { if (!pinState.raf) pinState.raf = setTimeout(layoutPins, 30); }
  function setupPins(main) {
    if (pinState.ro) pinState.ro.disconnect();
    pinState.els = [];
    PIN.forEach(function (sel) { main.querySelectorAll(sel).forEach(function (el) { el.classList.add('bz-stick-c'); pinState.els.push(el); }); });
    if (!pinState.els.length) return;
    if ('ResizeObserver' in window) { pinState.ro = new ResizeObserver(queuePins); pinState.ro.observe(main); }
    main.querySelectorAll('img').forEach(function (im) { if (!im.complete) im.addEventListener('load', queuePins, { once: true }); });
    queuePins();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(queuePins);
  }
  window.addEventListener('resize', queuePins);
  document.addEventListener('toggle', queuePins, true);

  function enhance() {
    var main = document.querySelector('#main'); if (!main || document.body.dataset.theme !== 'b') return;
    reportsBehaviour(main); setupPins(main);
    if (window.BCCBSignature) window.BCCBSignature.enhance(main);
  }
  window.BCCBPages = { trail: trail, parts: parts, enhance: enhance, queuePins: queuePins,
    lib: { esc: esc, frag: frag, wrap: wrap, first: first, pub: pub, guideHref: guideHref, ILLUSTRATION: ILLUSTRATION, CONTEXT: CONTEXT, ED: ED } };
})();
