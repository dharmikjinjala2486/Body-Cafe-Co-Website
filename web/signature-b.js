/* Variant B — signature layer: the home brand manifesto, the home composition below the hero, scroll-linked motion
   and the bottle hand-off between pages. It keeps B's existing look (palette, Aileron, pills, arches, ink rules).
   The manifesto is the brand's own approved line from About ("The name"); nothing is invented, and it shows no bottles,
   so the home's first three sections don't repeat the product. */
(function () {
  'use strict';
  var S = window.BCCSite, P = window.BCCBPages;
  if (!S || !S.themes || !S.themes.b || !P || !P.lib) return;
  var L = P.lib, esc = L.esc;
  function reduced() { return matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function two(n) { return String(n).padStart(2, '0'); }

  /* ====================================================================== 1. The manifesto's words
     Highlighted words take one of B's colours as they fill. */
  var MANIFESTO = [
    ['A'], ['good'], ['café', 'peach'], ['is'], ['an'], ['everyday', 'lime'], ['place.'],
    ['Nobody'], ['minds'], ['if'], ['you'], ['ask', 'paper'], ['what’s'], ['in'], ['something,'],
    ['and'], ['the'], ['menu', 'sage'], ['tells'], ['you'], ['before'], ['you'], ['order.'],
    ['That’s'], ['the'], ['counter'], ['we'], ['want'], ['to'], ['run:'],
    ['unhurried,', 'lime'], ['curious', 'paper'], ['and'], ['specific.', 'indigo']
  ];
  var VALUES = ['Clarity', 'Curiosity', 'Accountability', 'Care'];

  /* ====================================================================== 2. The manifesto's markup */
  function scene(ctx) {
    var ps = L.pub(ctx), n = ps.length;
    var words = MANIFESTO.map(function (w) {
      return '<span class="bzm-w' + (w[1] ? ' bzm-hl bzm-' + w[1] : '') + '">' + esc(w[0]) + '</span>';
    }).join(' ');
    var caps = ps.map(function (p) { return '<li style="--cap:' + esc(p.color) + '"><span class="sr-only">' + esc(p.name) + '</span></li>'; }).join('');
    return '<section class="bzh bzm" data-home-section="curiosity" aria-labelledby="bzh-t">' +
      '<div class="bzh-track"><div class="bzh-stage">' +
      '<header class="bzm-top"><span class="tb-pill bzm-k">02 — The name</span><h2 id="bzh-t" class="bzm-title">Why a café?</h2>' +
      (n ? '<div class="bzm-caps"><ol aria-label="' + n + ' essentials, one cap colour each">' + caps + '</ol><small aria-hidden="true">One cap colour per essential</small></div>' : '') + '</header>' +
      '<blockquote class="bzm-quote"><span class="bzm-mark" aria-hidden="true">“</span><p>' + words + '</p></blockquote>' +
      '<figure class="bzm-art bzm-art-1" aria-hidden="true"><img src="' + L.ED + 'about/about_curiosity.webp" alt="" width="1600" height="1000" loading="lazy" decoding="async"></figure>' +
      '<figure class="bzm-art bzm-art-2" aria-hidden="true"><img src="' + L.ED + 'about/about-seven-colours.webp" alt="" width="1600" height="1000" loading="lazy" decoding="async"></figure>' +
      '<div class="bzm-end"><p class="bzm-view">Detail you can check comes before badges you can’t.</p>' +
      '<ul class="bzm-values" aria-label="Our values">' + VALUES.map(function (v) { return '<li>' + v + '</li>'; }).join('') + '</ul>' +
      '<a class="tb-chip" href="/about">Meet Body Café Co. <span aria-hidden="true">↗</span></a></div>' +
      '</div></div></section>';
  }

  /* ====================================================================== 3. The home below the hero
     Collection: the heading joins the grid as its first cell, so seven bottles fill two even rows.
     The manifesto replaces the old cabinet, the proof cards become a ruled ledger, and sample quotes give way to the
     honest reviews note already used in production. */
  var VOICES = '<section class="hc-section hc-voices bzh-voices" data-home-section="voices" aria-labelledby="bzh-voices-t"><div class="bzh-voices-in"><span class="tb-pill">Customer voices</span>' +
    '<h2 id="bzh-voices-t" class="tb-big">Real feedback.<br><em>When it’s real.</em></h2><p>Reviews appear on each product page after a verified delivery and moderation. We don’t show sample quotes, invented names or star ratings in their place.</p>' +
    '<a class="tb-chip" href="/shop">Browse the collection <span aria-hidden="true">↗</span></a></div></section>';
  L.wrap('home', function (root, ctx) {
    var coll = root.querySelector('.tb-coll');
    if (coll) {
      coll.classList.add('bzh-coll');
      var head = coll.querySelector('.tb-coll-head'), grid = coll.querySelector('.tb-archgrid');
      if (head && grid) { head.classList.add('bzh-coll-cell'); grid.insertBefore(head, grid.firstChild); }
    }
    var lab = root.querySelector('[data-home-section="curiosity"]'), sc = scene(ctx);
    if (lab && sc) lab.replaceWith(L.frag(sc));
    else if (lab) lab.remove();
    var trust = root.querySelector('[data-home-section="trust"]');
    if (trust) trust.classList.add('bzh-ledger');
    var voices = root.querySelector('[data-home-section="voices"]');
    if (voices) voices.replaceWith(L.frag(VOICES));
    // Section numbers follow the page order.
    var n = 0;
    root.querySelectorAll('.tb-coll-head .tb-pill, .bzm-k, .hc-kicker').forEach(function (k) {
      var m = /^\s*\d{2}\s*[—–-]\s*/.exec(k.textContent);
      if (m) k.textContent = two(++n) + ' — ' + k.textContent.slice(m[0].length);
    });
  });

  /* ====================================================================== 4. Manifesto behaviour
     Everything is driven continuously by scroll, eased so wheel steps glide rather than jump:
     - the panel grows from an inset card to full width as it arrives,
     - a soft reading head passes over the words (each one inks in and settles), highlights sweep behind them,
     - the cap colours fill one after another, and the closing row rises at the end.
     It falls back to the finished state in normal flow for reduced motion, short screens, or whenever the quote
     wouldn't fit between its heading and closing rows. */
  var run = { abort: null };
  function headerH() { var h = document.querySelector('.site-header'); return h ? h.offsetHeight : 0; }
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp01(x); return x * x * (3 - 2 * x); }
  function sceneBehaviour(main, signal) {
    var root = main.querySelector('.bzm');
    if (!root) return;
    var stage = root.querySelector('.bzh-stage'), track = root.querySelector('.bzh-track');
    var words = [].slice.call(root.querySelectorAll('.bzm-w')), caps = [].slice.call(root.querySelectorAll('.bzm-caps li'));
    var hls = words.map(function (w) { return w.classList.contains('bzm-hl'); });
    var last = new Map();
    var still = false, cur = null, target = 0, frame = 0, settle = 0;
    function set(el, k, v) {
      var r = Math.round(v * 1000) / 1000, m = last.get(el) || {};
      if (m[k] === r) return;
      m[k] = r; last.set(el, m);
      el.style.setProperty(k, String(r));
    }
    function mode() {
      document.documentElement.style.setProperty('--bzh-top', headerH() + 'px');
      root.classList.remove('bzh-still');
      still = reduced() || innerHeight < 620 || stage.scrollHeight > stage.clientHeight + 2 || crowded();
      root.classList.toggle('bzh-still', still);
      cur = null;
      measure();
      guardArt();
    }
    function guardArt() {
      root.classList.remove('bzm-tight');
      var q = root.querySelector('.bzm-quote').getBoundingClientRect();
      var hit = [].some.call(root.querySelectorAll('.bzm-art'), function (a) {
        var r = a.getBoundingClientRect();
        return r.width && r.left < q.right + 16 && q.left - 16 < r.right && r.top < q.bottom && q.top < r.bottom;
      });
      root.classList.toggle('bzm-tight', hit);
    }
    // The quote must sit between the heading row and the closing row with room to spare.
    function crowded() {
      var q = root.querySelector('.bzm-quote').getBoundingClientRect();
      var t = root.querySelector('.bzm-top').getBoundingClientRect(), e = root.querySelector('.bzm-end').getBoundingClientRect();
      return q.top < t.bottom + 8 || q.bottom > e.top - 30;
    }
    // Scroll position → a single 0..1 value: the entrance takes the first part, then the pinned reading.
    function measure() {
      if (still) { target = 1; cur = 1; paint(1); return; }
      var r = track.getBoundingClientRect(), span = track.offsetHeight - stage.offsetHeight, top = headerH();
      var enter = clamp01(1 - (r.top - top) / (innerHeight * 0.75));
      var read = span > 0 ? clamp01((top - r.top) / span) : 0;
      target = enter < 1 ? enter * 0.12 : 0.12 + read * 0.88;
      if (cur === null || document.hidden) cur = target;
      if (!frame) tick();
    }
    function tick() {
      frame = 0;
      var d = target - cur;
      cur = Math.abs(d) < 0.0006 ? target : cur + d * 0.16;
      paint(cur);
      if (cur !== target) {
        frame = requestAnimationFrame(tick);
        // If the browser stops drawing frames (a hidden or throttled view), settle on the final state.
        clearTimeout(settle);
        settle = setTimeout(function () { if (frame) { cancelAnimationFrame(frame); frame = 0; cur = target; paint(cur); } }, 400);
      }
    }
    function paint(v) {
      var e = ease(v / 0.12);                       // entrance
      var p = clamp01((v - 0.12) / 0.88);           // pinned reading
      var n = words.length, head = clamp01(p / 0.7) * (n + 1.5);
      set(stage, '--e', e);
      set(stage, '--p', p);
      words.forEach(function (w, i) {
        set(w, '--f', ease((head - i) / 1.6));
        if (hls[i]) set(w, '--h', ease((head - i - 0.7) / 1.3));
      });
      var c = clamp01(p / 0.7) * caps.length;
      caps.forEach(function (li, i) { set(li, '--d', ease(c - i)); });
      set(stage, '--end', ease((p - 0.68) / 0.16));
    }
    function onScroll() { if (!still) { measure(); } }
    addEventListener('scroll', onScroll, { passive: true, signal: signal });
    addEventListener('resize', mode, { signal: signal });
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', mode, { signal: signal });
    signal.addEventListener('abort', function () { if (frame) cancelAnimationFrame(frame); clearTimeout(settle); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!signal.aborted) mode(); });
    mode();
  }

  /* ====================================================================== 5. The bottle hand-off between pages
     Following a product link carries its bottle into the product page's stage (a shared-element view transition). */
  var handoff = null;
  document.addEventListener('click', function (e) {
    if (document.body.dataset.theme !== 'b' || reduced() || !document.startViewTransition) return;
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href^="/products/"]');
    if (!a || /[#]/.test(a.getAttribute('href'))) return;
    var id = a.getAttribute('href').split('/')[2].split('?')[0];
    var box = a.querySelector('img') ? a : a.closest('.tb-arch, .tb-frame, .bzh-stage, .sp-card, .bz-shelf a, article');
    var im = box && (box.querySelector('.bzh-bottle img') || box.querySelector('img'));
    if (!im || !im.getBoundingClientRect().width) return;
    document.querySelectorAll('[data-bz-vt]').forEach(function (x) { x.style.viewTransitionName = ''; x.removeAttribute('data-bz-vt'); });
    im.style.viewTransitionName = 'bz-bottle'; im.setAttribute('data-bz-vt', '');
    handoff = { id: id, at: Date.now() };
    setTimeout(function () { if (im.isConnected) { im.style.viewTransitionName = ''; im.removeAttribute('data-bz-vt'); } }, 1600);
  }, true);
  function receiveHandoff(main) {
    if (!handoff || Date.now() - handoff.at > 2500) { handoff = null; return; }
    var id = handoff.id; handoff = null;
    if (location.pathname !== '/products/' + id) return;
    var im = main.querySelector('.pp-slide img, .pp-gallery img');
    if (!im) return;
    im.style.viewTransitionName = 'bz-bottle'; im.setAttribute('data-bz-vt', '');
    setTimeout(function () { im.style.viewTransitionName = ''; im.removeAttribute('data-bz-vt'); }, 1600);
  }

  /* ====================================================================== 6. Scroll-linked motion
     Progressive: browsers with scroll-driven animations get them from CSS. Elsewhere a light observer adds the
     same rise once, using transforms only, so nothing is ever hidden waiting for a script. */
  var CSS_TIMELINE = window.CSS && CSS.supports && CSS.supports('animation-timeline: view()');
  function motion(main, signal) {
    if (CSS_TIMELINE || reduced() || !('IntersectionObserver' in window)) return;
    var els = main.querySelectorAll('.bz-rise');
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('bz-risen'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { el.classList.add('bz-rise-js'); io.observe(el); });
    signal.addEventListener('abort', function () { io.disconnect(); });
  }
  // Headings and ledger rows only: cards already have B's own reveal, and the hero stays still.
  var RISE = ['h2.tb-big', '.hc-section h2', '.bzh-ledger .hc-proof-grid article', '.bzh-voices-in'];
  function markRise(main) {
    RISE.forEach(function (s) {
      main.querySelectorAll(s).forEach(function (el) { if (!el.closest('.bzh-stage, .tb-hero, .atelier-reveal')) el.classList.add('bz-rise'); });
    });
  }

  // Hero price tags that would run past the edge of the screen are nudged back inside it.
  function keepTags(main, signal) {
    if (!main.querySelector('.tb-hero')) return;
    // The tags are added by the hero's own script, so look for them each time.
    function place() {
      main.querySelectorAll('.tb-hero .bx-hotspot').forEach(function (t) {
        t.style.removeProperty('margin-left');
        if (getComputedStyle(t).position !== 'absolute') return;
        var r = t.getBoundingClientRect(), edge = document.documentElement.clientWidth - 12;
        if (r.right > edge) t.style.marginLeft = Math.round(edge - r.right) + 'px';
        else if (r.left < 12) t.style.marginLeft = Math.round(12 - r.left) + 'px';
      });
    }
    [0, 300, 1200].forEach(function (ms) { var id = setTimeout(place, ms); signal.addEventListener('abort', function () { clearTimeout(id); }); });
    addEventListener('resize', place, { signal: signal });
  }

  function enhance(main) {
    if (run.abort) run.abort.abort();
    run.abort = new AbortController();
    var signal = run.abort.signal;
    receiveHandoff(main);
    markRise(main);
    sceneBehaviour(main, signal);
    keepTags(main, signal);
    motion(main, signal);
  }
  window.BCCBSignature = { enhance: enhance };
})();
