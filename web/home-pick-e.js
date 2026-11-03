/* Body Café Co. — Variant E · homepage hero finishing layer, on the committed cap hero (owner, 2 November 2026).
   Right: the seven caps, still links to their product pages, served on a café saucer with each name underneath.
   Left: the headline's full stop is a real cap (Iron's), "Seven colours" is underlined with the seven cap colours,
   and a short line of facts sits under the buttons. No badge, no product ticket; nothing moves by itself. */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE;
  if (!S || !S.themes || !S.themes.e || !L) return;
  var esc = L.esc;

  L.wrap('home', function (root, ctx) {
    var hero = root.querySelector('[data-home-section="hero"]'); if (!hero) return;
    var stage = hero.querySelector('.ht-stage'), list = ctx.published.slice(0, 7);
    hero.setAttribute('data-hk', '');

    // Right · names under the caps, and the saucer.
    if (stage) {
      stage.querySelectorAll('.ht-caps > li').forEach(function (li, i) {
        var p = list[i]; if (!p) return;
        li.setAttribute('data-hk-i', String(i));
        li.appendChild(L.frag('<span class="hk-name" aria-hidden="true"><b>' + L.pad(i + 1) + '</b>' + esc(p.name) + '</span>'));
      });
      var ol = stage.querySelector('.ht-caps');
      if (ol) { var wrap = document.createElement('div'); wrap.className = 'hk-cluster'; ol.before(wrap); wrap.appendChild(L.frag('<span class="hk-saucer" aria-hidden="true"></span>')); wrap.appendChild(ol); }
    }

    // Left · a cap for a full stop, a seven-colour underline, and three facts.
    var stop = hero.querySelector('.ht-copy h1 span');
    if (stop && list[0]) stop.outerHTML = '<span class="hk-stop"><span class="sr-only">.</span><img src="/web/media/renders/' + esc(list[0].id) + '-cap.webp" alt="" width="400" height="400" decoding="async"></span>';
    var sub = hero.querySelector('.ht-sub');
    if (sub) sub.innerHTML = sub.innerHTML.replace('Seven colours.', '<span class="hk-spectrum" style="--stripe:' + stripe(list) + '">Seven colours.</span>');
    var actions = hero.querySelector('.ht-copy .ez-actions');
    var from = list.reduce(function (m, p) { return typeof p.price === 'number' && p.price < m ? p.price : m; }, Infinity);
    if (actions) actions.after(L.frag('<ul class="hk-facts-line">' + (isFinite(from) ? '<li>From ' + ctx.money(from) + ' MRP</li>' : '') + '<li>FSSAI licensed</li><li>Every lot traceable</li></ul>'));
  });

  // A hard-stop gradient: one equal band per cap colour.
  function stripe(list) {
    var n = list.length;
    return 'linear-gradient(90deg,' + list.map(function (p, i) { return p.color + ' ' + (i / n * 100).toFixed(2) + '% ' + ((i + 1) / n * 100).toFixed(2) + '%'; }).join(',') + ')';
  }
})();
