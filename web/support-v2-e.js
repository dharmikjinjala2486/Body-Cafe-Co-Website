/* Body Café Co. — Variant E · Lot reports, Learn, Help and Contact, to the Page Flow Plan (owner approved, 3 November 2026).
   Task pages: the task comes first, explanation waits behind a tap. Nothing is deleted except true repeats.
   Lot reports: lookup first; the result area shows once there is a result; the nine terms open on tap.
   Learn:       the seven cap-coloured guide cards carry each guide's question; the repeated list of the same seven goes;
                each question opens on tap (the filter still searches them).
   Help:        an icon on every quick action and topic.
   Contact:     the big phone and topic picker stay first; "Ways to reach us" (a repeat of them) is hidden; business details
                open on tap. Hours and the complaints and grievance details stay open.
   Loaded last of these pages' layers; forms, lookups and filters are untouched. */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE;
  if (!S || !S.themes || !S.themes.e || !L) return;
  var V = window.BCCVisualsE, esc = L.esc;
  function icon(k) { return V ? V.icon(k) : ''; }
  function fold(label, nodes, cls) {
    nodes = nodes.filter(Boolean); if (!nodes.length) return null;
    var d = document.createElement('details'); d.className = 'pv-fold ' + (cls || '');
    d.innerHTML = '<summary>' + esc(label) + '</summary>';
    nodes[0].before(d); nodes.forEach(function (n) { d.appendChild(n); });
    return d;
  }
  function iconize(links, map) {
    links.forEach(function (a) {
      var t = a.textContent.trim(), k = null;
      Object.keys(map).some(function (re) { if (new RegExp('^' + re, 'i').test(t)) { k = map[re]; return true; } return false; });
      if (k && !a.querySelector('.vx-ic')) a.insertAdjacentHTML('afterbegin', icon(k));
    });
  }

  /* ---------- Lot reports ---------- */
  L.wrap('reports', function (root) {
    var page = root.querySelector('.lt'); if (!page) return;
    page.setAttribute('data-sp2', 'reports');
    page.querySelectorAll('.lt-kicker, .lt-k').forEach(function (n) { n.remove(); });
    var fh = page.querySelector('#find-t'); if (fh) fh.textContent = fh.textContent.replace(/^\s*\d+\s*/, '');
    var terms = page.querySelector('#understand .lt-terms');
    if (terms) fold('The ' + terms.querySelectorAll('dt').length + ' terms on a report', [terms]);
  });

  /* ---------- Learn ---------- */
  L.wrap('learn', function (root) {
    var shelf = root.querySelector('.ezl-shelf'), drawer = root.querySelector('.ss-drawer'); if (!drawer) return;
    var page = drawer.parentNode; page.setAttribute('data-sp2', 'learn');
    page.querySelectorAll('.lr-kicker, .lr-k, .ez-k').forEach(function (n) { n.remove(); });
    // The seven guide cards carry each guide's question, then the list that repeated them goes.
    if (shelf) {
      var qOf = {};
      // (The page is still a detached template here, so read the leaf elements rather than innerText.)
      shelf.querySelectorAll('a[href]').forEach(function (a) {
        var q = [].slice.call(a.querySelectorAll('*')).filter(function (e) { return !e.children.length && /\?\s*$/.test(e.textContent); })[0];
        if (q) qOf[a.getAttribute('href')] = q.textContent.trim();
      });
      drawer.querySelectorAll('a[href]').forEach(function (a) {
        var q = qOf[a.getAttribute('href')], b = a.querySelector('.ss-drawer-body');
        if (q && b) b.insertAdjacentHTML('beforeend', '<em class="sp2-q">' + esc(q) + '</em>');
      });
      shelf.remove();
    }
    drawer.insertAdjacentHTML('afterbegin', '<h2 class="sp2-h">Seven product guides.</h2>');
    // Each question opens on tap; the filter still finds it (the words stay in the item).
    page.querySelectorAll('.lr-qlist > li').forEach(function (li) {
      var h = li.querySelector('h3'); if (!h || li.querySelector('details')) return;
      var d = document.createElement('details'); d.className = 'pv-row';
      var s = document.createElement('summary'); s.appendChild(h); d.appendChild(s);
      var v = document.createElement('div'); v.className = 'pv-row-v';
      [].slice.call(li.childNodes).forEach(function (n) { v.appendChild(n); });
      d.appendChild(v); li.appendChild(d);
    });
  });

  /* ---------- Help ---------- */
  L.wrap('help', function (root) {
    var quick = root.querySelector('.su-quick'), cats = root.querySelector('.su-cats'); if (!quick && !cats) return;
    root.querySelectorAll('.su-head .su-k').forEach(function (n) { n.remove(); });
    if (quick) { quick.classList.add('sp2-icons'); iconize([].slice.call(quick.querySelectorAll('a')), { 'track': 'truck', 'report': 'flag', 'request cancel': 'no', 'contact': 'question' }); }
    if (cats) { cats.classList.add('sp2-icons'); iconize([].slice.call(cats.querySelectorAll('a')), { 'orders': 'receipt', 'delivery': 'truck', 'returns': 'back', 'payments': 'card', 'account': 'person', 'products': 'bottle', 'lot': 'tag' }); }
  });

  /* ---------- Contact ---------- */
  L.wrap('contact', function (root) {
    var info = root.querySelector('.su-contact-info'); if (!info) return;
    root.querySelectorAll('.su-head .su-k').forEach(function (n) { n.remove(); });
    if (info) {
      // "Ways to reach us" stays in the page: the phone switchboard above is built from its links after render, and
      // support-v2-e.css hides the list once that switchboard is there.
      var biz = info.querySelector('#su-biz-h');
      if (biz) { var bs = biz.closest('section'), dl = bs && bs.querySelector('.su-dl'); if (dl) { fold(biz.textContent.trim(), [dl]); biz.remove(); } }
    }
  });
})();
