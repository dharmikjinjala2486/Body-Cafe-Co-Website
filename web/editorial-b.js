/* Theme B editorial artwork. Decorate final render output before app.js attaches behaviour.
   Live text, links, forms and data attributes remain in their existing renderers. */
(function () {
  'use strict';
  var S = window.BCCSite;
  if (!S || !S.themes.b) return;
  var ROOT = '/web/media/editorial-b/';
  var guides = {
    'iron-bisglycinate': ['learn/learn_iron', 'Abstract terracotta and cream ingredient-form illustration.'],
    'l-theanine': ['learn/learn_theanine', 'Tea leaves beside sculptural sage glass.'],
    'vitamin-d3-k2': ['learn/learn_d3k2', 'Indigo and lilac glass panels separated by warm light.'],
    'omega-3-fish-oil': ['learn/learn_omega', 'Golden oil in a glass dish; ingredient illustration.'],
    'myo-d-chiro-inositol': ['learn/learn_inositol', 'Two interlocking lilac ceramic loops; paired-ingredient illustration.'],
    'creatine-chews': ['learn/learn_creatine', 'Orange, a teal towel and an indigo dumbbell.'],
    'psyllium-husk': ['learn/learn_psyllium', 'Psyllium husks in a glass bowl; ingredient illustration.'],
    'reading-a-label': ['blogs/blog_label', 'Magnifying glass over an abstract paper layout.'],
    'ingredient-forms': ['blogs/blog_forms', 'Three different terracotta sculptural forms.'],
    'serving-sizes': ['blogs/blog_servings', 'Playful measurement objects on peach and indigo platforms.'],
    'understanding-evidence': ['blogs/blog_evidence', 'A glass lens over blank research-style index cards.'],
    'understanding-reports': ['blogs/blog_reports', 'Three blank tags connected by a cord; a record-connection illustration.']
  };
  function img(key, alt, w, h, eager) {
    var el = document.createElement('img');
    el.src = ROOT + key + '.webp'; el.alt = alt || ''; el.width = w; el.height = h;
    el.decoding = 'async';
    if (eager) el.setAttribute('fetchpriority', 'high'); else el.loading = 'lazy';
    el.setAttribute('data-editorial-image', key);
    return el;
  }
  function figure(key, alt, cls, w, h, caption, eager) {
    var f = document.createElement('figure'); f.className = 'bi-art ' + (cls || '');
    f.appendChild(img(key, alt, w, h, eager));
    if (caption) { var c = document.createElement('figcaption'); c.textContent = caption; f.appendChild(c); }
    return f;
  }
  function cardCover(container, key, href) {
    var link = document.createElement('a'); link.href = href; link.tabIndex = -1;
    link.setAttribute('aria-hidden', 'true'); link.className = 'bi-cover-link';
    link.appendChild(img(key, '', 1600, 1000, false)); container.prepend(link);
  }
  function home(t) {
    // Use the same transparent framing for all seven homepage bottles.
    t.querySelectorAll('.tb-coll .tb-arch-photo, .atelier-fan [data-curiosity-pick]').forEach(function (card) {
      var link = card.getAttribute('href');
      var id = link ? link.split('/').pop() : JSON.parse(t.querySelector('[data-curiosity-products]').textContent)[Number(card.dataset.curiosityPick)].id;
      var bottle = card.querySelector('img');
      if (bottle && productIds[id]) {
        bottle.src = '/web/media/bottles-normalized/' + id + '.svg';
        bottle.width = 720; bottle.height = 1040;
      }
    });
    var art = t.querySelector('.tb-hero-art');
    if (art) {
      art.classList.add('bi-hero-art'); art.replaceChildren();
      var picture = document.createElement('picture'), source = document.createElement('source');
      source.media = '(max-width: 640px)'; source.srcset = ROOT + 'hero/home-hero-mobile.webp';
      source.setAttribute('width', '1080'); source.setAttribute('height', '1350'); picture.appendChild(source);
      picture.appendChild(img('hero/home-hero-panel', 'Vitamin D3 + K2 and L-Theanine bottles on an indigo and lilac stage.', 1400, 1400, true)); art.appendChild(picture);
      var nav = document.createElement('nav'); nav.className = 'bi-hero-links'; nav.setAttribute('aria-label', 'Products shown in the hero');
      [['vitamin-d3-k2','Vitamin D3 + K2'],['l-theanine','L-Theanine']].forEach(function (p) {
        var a = document.createElement('a'); a.href = '/products/' + p[0]; a.textContent = p[1] + ' ↗'; nav.appendChild(a);
      }); art.appendChild(nav);
    }
    var voices = t.querySelector('.bi-voices-heading');
    if (voices) voices.appendChild(figure('reviews/reviews_conversation', '', 'bi-voices-art', 1600, 900));
    var faq = t.querySelector('[data-home-section="faq"]');
    if (faq && faq.firstElementChild) faq.firstElementChild.appendChild(figure('faq/faq_questions', '', 'bi-faq-art', 1200, 900));
  }
  function product(t) {
    var gallery = t.querySelector('[data-pp-gallery]');
    var id = location.pathname.split('/').filter(Boolean).pop();
    if (!gallery || !productIds[id]) return;
    gallery.setAttribute('data-bottle-id', id);
    gallery.classList.add('pp-bottle-stage');
    var front = gallery.querySelector('.pp-slide-front img');
    if (front) {
      var bottleSrc = '/web/media/bottles-normalized/' + id + '.svg';
      front.src = bottleSrc;
      front.width = 720; front.height = 1040;
      front.alt = front.alt || id.replaceAll('-', ' ') + ', front-of-pack design mockup';
      var thumb = gallery.querySelector('[data-pp-thumb="0"] img');
      if (thumb) { thumb.src = bottleSrc; thumb.width = 720; thumb.height = 1040; }
    }
  }
  function bundles(t) {
    t.querySelectorAll('a.tb-duo-photos').forEach(function (a) {
      var id = new URL(a.getAttribute('href'), location.origin).pathname.split('/').pop();
      if (id !== 'daily-edit' && id !== 'curious-edit') return;
      a.replaceChildren(img('bundle/' + id + '-card', id === 'daily-edit' ? 'Vitamin D3 + K2 and Omega-3 Fish Oil bottles.' : 'L-Theanine and Creatine Chews bottles.', 1200, 1200)); a.classList.add('bi-bundle-art');
    });
    var detail = t.querySelector('.tb-edit-hero .tb-duo-photos'), id = location.pathname.split('/').filter(Boolean).pop();
    if (detail && (id === 'daily-edit' || id === 'curious-edit')) {
      detail.replaceChildren(img('bundle/' + id + '-detail', id === 'daily-edit' ? 'Vitamin D3 + K2 and Omega-3 Fish Oil bottles.' : 'L-Theanine and Creatine Chews bottles.', 1600, 1200)); detail.classList.add('bi-bundle-art');
    }
  }
  function learn(t) {
    var hub = t.querySelector('.lr-hero');
    if (hub) {
      hub.classList.add('bi-header-art'); hub.appendChild(figure('learn/learn_hub', 'An open book with sculptural arches and a bookmark.', 'bi-learn-hub-art', 1600, 1000, '', true));
      t.querySelectorAll('.lr-prod-media').forEach(function (a) {
        var id = a.getAttribute('href').split('/').pop(), g = guides[id];
        if (g) { a.replaceChildren(img(g[0], '', 1600, 1000)); a.classList.add('bi-guide-cover'); }
      });
      t.querySelectorAll('.lr-guide-card').forEach(function (card) {
        var a = card.querySelector('h3 a'), g = a && guides[a.getAttribute('href').split('/').pop()];
        if (g) cardCover(card, g[0], a.getAttribute('href'));
      });
    }
    var article = t.querySelector('[data-lr-page="guide"]');
    if (article) {
      var id = article.getAttribute('data-lr-slug'), g = guides[id], head = article.querySelector('.lr-ahead');
      if (g && head) { head.classList.add('bi-header-art'); head.appendChild(figure(g[0], g[1], 'bi-guide-hero', 1600, 1000, id in productIds ? 'Ingredient / context illustration.' : '', true)); }
    }
  }
  var productIds = {'iron-bisglycinate':1,'l-theanine':1,'vitamin-d3-k2':1,'omega-3-fish-oil':1,'myo-d-chiro-inositol':1,'creatine-chews':1,'psyllium-husk':1};
  function about(t) {
    var media = t.querySelector('.ab-meet-media');
    if (media) {
      var art = figure('about/about-seven-colours', 'Seven product bottles displayed on their matching coloured stands.', 'bi-about-identity', 1600, 1000, 'Our seven products, each on its cap-colour stand.', true);
      var lineup = document.createElement('span'); lineup.className = 'bi-about-products'; lineup.setAttribute('aria-hidden', 'true');
      var stands = [[11.5,70.9],[24.4,67.8],[36.9,65.9],[49.4,64.6],[61.9,65.9],[74.4,67.8],[88,70.9]];
      ['iron-bisglycinate','l-theanine','vitamin-d3-k2','omega-3-fish-oil','myo-d-chiro-inositol','creatine-chews','psyllium-husk'].forEach(function (id, i) {
        var mount = document.createElement('span'); mount.className = 'bi-about-bottle'; mount.style.setProperty('--stand-x', stands[i][0] + '%'); mount.style.setProperty('--stand-y', stands[i][1] + '%');
        var bottle = document.createElement('img'); bottle.src = '/web/media/bottles-normalized/' + id + '.svg'; bottle.alt = ''; bottle.width = 720; bottle.height = 1040; bottle.loading = 'eager'; bottle.decoding = 'async'; mount.appendChild(bottle); lineup.appendChild(mount);
      });
      var scene = document.createElement('div'); scene.className = 'bi-about-scene'; art.insertBefore(scene, art.firstChild); scene.appendChild(art.querySelector('img')); scene.appendChild(lineup); media.replaceChildren(art);
    }
    var why = t.querySelector('#name .ab-body');
    if (why) why.appendChild(figure('about/about_curiosity', 'Abstract arch and speech-bubble forms around a conversation table.', 'bi-about-curiosity', 1600, 1000, 'A conceptual illustration of curiosity and conversation.'));
  }
  function help(t) {
    var head = t.querySelector('[data-su-page="help"] .su-head');
    if (!head) return;
    var copy = document.createElement('div'); copy.className = 'bi-help-copy';
    while (head.firstChild) copy.appendChild(head.firstChild);
    head.classList.add('bi-header-art'); head.appendChild(copy);
    head.appendChild(figure('faq/faq_orders', '', 'bi-help-art', 1200, 900, '', true));
  }
  var decorators = {home:home,product:product,bundles:bundles,learn:learn,about:about,help:help};
  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-review-pause]');
    if (!button) return;
    var paused = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? 'Play feedback →' : 'Pause feedback Ⅱ';
    button.closest('[data-home-section="voices"]').classList.toggle('bi-reviews-paused', paused);
  });
  Object.keys(decorators).forEach(function (name) {
    var render = S.themes.b[name]; if (typeof render !== 'function') return;
    S.themes.b[name] = function () {
      var html = render.apply(this, arguments);
      var template = document.createElement('template'); template.innerHTML = html;
      decorators[name](template.content); return template.innerHTML;
    };
  });
})();
