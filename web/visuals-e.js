/* Body Café Co. — Variant E · concept icons for the text-led pages (owner, 3 November 2026: "no visual understanding").
   One line-icon set for the ideas the site repeats (form, amount, when, record, maker, check, origin…), placed on the
   headings of the structured lists on Standards, Lot reports, Story and the homepage rules. Each list is matched by
   selector and item count, so a changed list is simply left as it was. Copy is untouched. */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE;
  if (!S || !S.themes || !S.themes.e || !L) return;

  var P = {
    form: '<circle cx="6" cy="7" r="2.5"/><circle cx="18" cy="7" r="2.5"/><circle cx="12" cy="17" r="2.5"/><path d="M8.3 8.6 10.8 15M15.7 8.6 13.2 15M8.5 7h7"/>',
    amount: '<path d="M12 4v16M6 20h12M5 8h14"/><path d="M5 8l-2.5 6h5zM19 8l-2.5 6h5z"/>',
    when: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
    record: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M9.5 12h6M9.5 15.5h6"/>',
    factory: '<path d="M3 20V10l5 3v-3l5 3V5h4v15z"/><path d="M2 20h20M14.5 9h1"/>',
    check: '<path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
    pin: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
    leaf: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l7-7"/>',
    bottle: '<path d="M9 3h6v3H9z"/><rect x="7" y="6" width="10" height="15" rx="2"/><path d="M7 11h10"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
    box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
    hourglass: '<path d="M7 3h10M7 21h10M8 3v3l4 6-4 6v3M16 3v3l-4 6 4 6v3"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    book: '<path d="M3.5 5.5c3-1.5 5.5-1.5 8.5 0v14c-3-1.5-5.5-1.5-8.5 0zM20.5 5.5c-3-1.5-5.5-1.5-8.5 0v14c3-1.5 5.5-1.5 8.5 0z"/>',
    flask: '<path d="M9 3h6M10 3v6L5 19a1.5 1.5 0 0 0 1.3 2h11.4a1.5 1.5 0 0 0 1.3-2l-5-10V3"/><path d="M7.5 15h9"/>',
    person: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    barcode: '<path d="M4 5v14M6.5 5v14M10 5v14M12 5v14M15.5 5v14M18 5v14M20 5v14"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01"/>',
    heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    no: '<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>',
    truck: '<path d="M2.5 6h11v10h-11zM13.5 9.5h4l3 3.5V16h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    back: '<path d="M9 7 4.5 11.5 9 16"/><path d="M4.5 11.5H15a4.5 4.5 0 0 1 0 9h-3"/>',
    card: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/>'
  };
  function icon(k) { return '<span class="vx-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + P[k] + '</svg></span>'; }

  // [list selector, icon per item in order]. Checked against each list's headings on 3 November 2026.
  var LISTS = {
    standards: [
      ['.ssx-rules', ['form', 'factory', 'check', 'amount']],          // choose a form · made · checked · amounts
      ['.ezx-chain ol', ['leaf', 'factory', 'tag', 'record']],         // ingredient · finished product · lot · document
      ['.sx-principles', ['form', 'pin', 'check', 'record']],          // formula · source · checks · record
      ['.sx-places', ['pin', 'gear', 'factory']],                      // origin · processing · manufacturer
      ['.sx-questions', ['box', 'gear', 'check', 'hourglass']],        // arrive · manufacture · release · shelf life
      ['.sx-path', ['bottle', 'tag', 'record']],                       // product · lot number · record
      ['.sx-practices', ['link', 'flag', 'no']],                       // cited · marked · no claims
      ['.sx-kinds', ['book', 'flask', 'person']]                       // research · testing · customer experience
    ],
    reports: [
      ['.lt-steps', ['search', 'book', 'record']],                     // match · understand · inspect
      ['.lt-numbers', ['tag', 'receipt', 'barcode', 'box']]            // lot · order · barcode · SKU
    ],
    story: [
      ['.eza-values ol', ['eye', 'question', 'check', 'heart']]        // clarity · curiosity · accountability · care
    ]
  };
  var FOUR = ['form', 'amount', 'when', 'record'];

  function head(item) { return item.querySelector('h3, h4, dt, strong, b'); }
  function mark(root, sel, icons) {
    root.querySelectorAll(sel).forEach(function (list) {
      var items = [].slice.call(list.children).filter(head);
      if (items.length !== icons.length) return;
      list.classList.add('vx-list');
      items.forEach(function (it, i) { var h = head(it); if (!h.querySelector('.vx-ic')) h.insertAdjacentHTML('afterbegin', icon(icons[i])); });
    });
  }

  Object.keys(LISTS).forEach(function (name) {
    L.wrap(name, function (root) {
      LISTS[name].forEach(function (x) { mark(root, x[0], x[1]); });
      if (name !== 'story') return;
      // Chapter 4: the form, the amount, the moment, the proof.
      var steps = root.querySelectorAll('.ssy-ch-4 .ssy-step');
      if (steps.length === 4) steps.forEach(function (s, i) { var g = s.querySelector('.ssy-step-g'); if (g) g.insertAdjacentHTML('afterend', icon(FOUR[i])); });
      // The manifesto's promise line becomes four icon badges, same words.
      root.querySelectorAll('.ssy-manifesto-in > p').forEach(function (p) {
        var parts = p.textContent.trim().split(/(?<=\.)\s+/);
        if (parts.length !== 4 || !/^We name the form/.test(parts[0])) return;
        p.outerHTML = '<ul class="vx-badges ssy-rv">' + parts.map(function (t, i) { return '<li>' + icon(FOUR[i]) + '<span>' + L.esc(t) + '</span></li>'; }).join('') + '</ul>';
      });
    });
  });

  window.BCCVisualsE = { icon: icon };
})();
