/* Body Café Co. — Variant E · "at a glance" icons (owner, 3 November 2026: "no visual understanding, only text").
   One small icon set read straight from each product's label record, so every page shows the same facts the same way:
   when to take it (sun / noon / moon), the dose (that many capsule, softgel or tablet shapes), food, the one special
   instruction, how long a pack lasts, and India's veg / non-veg mark. Nothing is inferred beyond the label text. */
(function () {
  "use strict";
  var L = window.BCCLivingE; if (!L) return;
  var esc = L.esc;

  function svg(body) { return '<svg class="gl-ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>'; }
  var IC = {
    morning: svg('<path d="M3 18h18M6.5 18a5.5 5.5 0 0 1 11 0"/><path d="M12 6.5V9M5.2 10.2l1.6 1.6M18.8 10.2l-1.6 1.6"/>'),
    noon: svg('<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>'),
    night: svg('<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>'),
    food: svg('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/>'),
    empty: svg('<circle cx="12" cy="12" r="8" stroke-dasharray="2.4 2.4"/>'),
    either: svg('<circle cx="12" cy="12" r="8"/><path d="M12 7.5a4.5 4.5 0 0 1 0 9z" fill="currentColor" stroke="none"/>'),
    nomilk: svg('<path d="M8 3h8M9 3v3l-2 3v12h10V9l-2-3V3"/><path d="M4 4l16 16"/>'),
    water: svg('<path d="M6 3h12l-1.5 18h-9z"/><path d="M7 10c2 1 4-1 5 0s3 1 5 0"/>'),
    chew: svg('<circle cx="12" cy="12" r="7"/><path d="M12 5v14"/><path d="M3 3l3 3M21 3l-3 3"/>'),
    days: svg('<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>')
  };
  // FSSAI marks: green square with a dot (veg), brown square with a triangle (non-veg). The dot and triangle carry stroke="none":
  // style.css outlines every svg in currentColor, which on product cards is the cap colour.
  function diet(veg) {
    return veg ? '<svg class="gl-ic gl-diet" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="#1f8a3b" stroke-width="2"/><circle cx="12" cy="12" r="5" fill="#1f8a3b" stroke="none"/></svg>'
      : '<svg class="gl-ic gl-diet" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="#7a3b16" stroke-width="2"/><path d="M12 6.5 17.5 16.5h-11z" fill="#7a3b16" stroke="none"/></svg>';
  }
  function unit(form) {
    if (/softgel/i.test(form)) return '<i class="gl-u gl-u-gel"></i>';
    if (/chew|tablet/i.test(form)) return '<i class="gl-u gl-u-chew"></i>';
    return '<i class="gl-u gl-u-cap"></i>';
  }

  /* Facts, read from the label record. */
  function facts(p) {
    var d = String(p.directions || ''), serving = String(p.serving_size || ''), n = parseInt(serving, 10) || 1;
    var form = /softgel/i.test(serving) ? 'softgel' : /tablet|chew/i.test(serving) ? 'tablet' : 'capsule';
    var when = /choose one time/i.test(d) ? ['morning', 'noon', 'night'] : /night/i.test(d) ? ['night'] : /morning/i.test(d) ? ['morning'] : [];
    var food = /empty stomach/i.test(d) && /with food/i.test(d) ? 'either' : /empty stomach/i.test(d) ? 'empty' : /with food/i.test(d) ? 'food' : '';
    var milk = d.match(/avoid milk for (\d+) hours?/i);
    var extra = milk ? ['nomilk', 'No milk', milk[1] + ' h before/after'] : /full glass of water/i.test(d) ? ['water', 'Full glass', 'of water'] : /do not swallow/i.test(d) ? ['chew', 'Chew it', "don't swallow whole"] : null;
    var days = parseInt(p.servings_per_pack || '', 10);
    var diet = String(p.dietary_suitability || '');
    return { n: n, form: form, serving: serving, when: when, food: food, extra: extra, days: days, veg: /^vegetarian/i.test(diet) ? true : /^non-vegetarian/i.test(diet) ? false : null };
  }
  var WHEN = { morning: 'Morning', noon: 'Noon', night: 'Night' };
  var FOOD = { food: ['With food', ''], empty: ['Empty stomach', ''], either: ['With or empty stomach', ''] };
  function dose(f) { var s = ''; for (var i = 0; i < Math.min(f.n, 5); i++) s += unit(f.form); return '<span class="gl-dose" aria-hidden="true">' + s + '</span>'; }

  /* Large tiles for the product page. */
  function tiles(p, keyFact) {
    var f = facts(p), t = [];
    function tile(icon, big, small, cls) { t.push('<li class="gl-tile' + (cls ? ' ' + cls : '') + '">' + icon + '<b>' + esc(big) + '</b>' + (small ? '<small>' + esc(small) + '</small>' : '') + '</li>'); }
    if (keyFact) t.push('<li class="gl-tile gl-key"><b>' + esc(keyFact) + '</b><small>per serving</small></li>');
    tile(dose(f), f.serving, 'once a day');
    if (f.when.length) tile('<span class="gl-icons">' + f.when.map(function (w) { return IC[w]; }).join('') + '</span>', f.when.length > 1 ? 'Any one time' : WHEN[f.when[0]], f.when.length > 1 ? 'and stay consistent' : '');
    if (f.food) tile(IC[f.food], FOOD[f.food][0], FOOD[f.food][1]);
    if (f.extra) tile(IC[f.extra[0]], f.extra[1], f.extra[2]);
    if (f.days) tile(IC.days, f.days + ' days', 'per pack');
    if (f.veg !== null) tile(diet(f.veg), f.veg ? 'Vegetarian' : 'Non-veg', f.veg ? '' : 'gelatin, fish oil');
    return '<ul class="gl-tiles" aria-label="At a glance">' + t.join('') + '</ul>';
  }

  /* A compact row for product cards and lists. */
  function chips(p) {
    var f = facts(p), c = [];
    c.push('<span class="gl-chip">' + dose(f) + '<span>' + esc(f.serving) + '</span></span>');
    if (f.when.length) c.push('<span class="gl-chip">' + (f.when.length > 1 ? IC.noon : IC[f.when[0]]) + '<span>' + (f.when.length > 1 ? 'Any time' : WHEN[f.when[0]]) + '</span></span>');
    if (f.food) c.push('<span class="gl-chip gl-chip-food">' + IC[f.food] + '<span>' + FOOD[f.food][0] + '</span></span>');
    if (f.veg !== null) c.push('<span class="gl-chip gl-chip-diet" title="' + (f.veg ? 'Vegetarian' : 'Non-vegetarian') + '">' + diet(f.veg) + '<span class="sr-only">' + (f.veg ? 'Vegetarian' : 'Non-vegetarian') + '</span></span>');
    return '<p class="gl-chips">' + c.join('') + '</p>';
  }

  window.BCCGlanceE = { facts: facts, tiles: tiles, chips: chips, IC: IC };
})();
