/* Body Café Co. — Variant E · Story, rebuilt to the Page Flow Plan (owner approved, 3 November 2026).
   Fourteen parts become a short film: problem → idea → how → promise → invitation. Each part is one headline and one
   visual; the original chapters and About sections sit word for word behind a "Read" row in the part they belong to.
   1 The problem: the label's loud front and quiet back, in the chapter's own words.   (Chapters I–II, Why we exist)
   2 The idea: the café menu board.                                                    (Chapter III, Why "café")
   3 How: the four cards — form, amount, moment, proof.                                (Chapters IV–VI, Most supplement shopping…, Name, colour, format, label)
   4 The promise: the manifesto badges, then the four values.                          (Chapter VII)
   5 Invitation.
   Loaded last of the story layers; /about still lands here at #about. */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE;
  if (!S || !S.themes || !S.themes.e || !L) return;
  var esc = L.esc;

  function headOf(el) { var h = el && el.querySelector('h2'); return h ? h.textContent.trim() : ''; }
  function fold(nodes) {
    nodes = nodes.filter(Boolean); if (!nodes.length) return null;
    var names = nodes.map(headOf).filter(Boolean);
    var d = document.createElement('details'); d.className = 'pv-fold sy2-fold';
    d.innerHTML = '<summary>Read: ' + (names.length ? esc(names[0].replace(/\.$/, '')) + (names.length > 1 ? ' <span>+ ' + (names.length - 1) + ' more</span>' : '') : 'more') + '</summary>';
    nodes.forEach(function (n) { d.appendChild(n); });
    return d;
  }
  function section(id, title, visual, more) {
    var s = document.createElement('section'); s.className = 'sy2-sec'; if (id) s.id = id;
    s.setAttribute('aria-labelledby', id + '-t');
    s.innerHTML = '<h2 id="' + id + '-t">' + esc(title) + '</h2>';
    if (visual) { var v = document.createElement('div'); v.className = 'sy2-visual'; v.appendChild(visual); s.appendChild(v); }
    if (more) s.appendChild(more);
    return s;
  }

  L.wrap('story', function (root) {
    var page = root.querySelector('.ssy'); if (!page) return;
    page.setAttribute('data-sy2', '');
    var q = function (s) { return page.querySelector(s); };
    var ch = function (n) { return q('#chapter-' + n); };
    var body = q('.ssy-body'), about = q('#about'), manifesto = q('.ssy-manifesto'), final = q('.ssy-final');
    if (!body) return;

    page.querySelectorAll('.ez-k:not(.ssy-tagline)').forEach(function (n) { n.remove(); });

    // 1 · The problem, drawn with chapter II's own words: the loud front, the quiet back.
    var p2 = ch(2) && ch(2).querySelector('.ssy-prose p'), txt = p2 ? p2.textContent : '';
    var loud = (txt.match(/promises (more [^.]+)\./) || [])[1] || '', quiet = (txt.match(/: (what form[^.]+)\./) || [])[1] || '';
    var label = L.frag('<div class="sy2-label" aria-hidden="true"><div class="sy2-front"><small>Front</small><b>' + esc(loud.replace(/,? and /, ', ').replace(/^m/, 'M')) + '.</b></div>' +
      '<div class="sy2-back"><small>Back</small><p>' + esc(quiet) + '.</p></div></div>');
    var why = about && about.querySelector('.sca-why'), whyTitle = headOf(why) || 'The front of the label shouts. The back whispers.';
    var s1 = section('about', whyTitle, loud && quiet ? label : null, fold([ch(1), ch(2), why]));
    if (about) about.removeAttribute('id');

    // 2 · The idea: the café menu board.
    var board = ch(3) && ch(3).querySelector('.ssy-board');
    var s2 = section('idea', 'A good café never hides the recipe.', board, fold([ch(3), about && about.querySelector('.eza-name')]));

    // 3 · How: the four cards.
    var steps = ch(4) && ch(4).querySelector('.ssy-steps');
    var s3 = section('how', 'Form. Amount. Moment. Proof.', steps, fold([ch(4), ch(5), ch(6), about && about.querySelector('.eza-why'), about && about.querySelector('.eza-colour')]));

    // 4 · The promise: the manifesto band stays as it is; the four values follow, chapter VII behind a tap.
    var values = about && about.querySelector('.eza-values');
    var s4 = values ? section('values', headOf(values) || 'Four values', values.querySelector('ol'), fold([ch(7)])) : null;

    body.replaceWith(s1);
    s1.after(s2); s2.after(s3);
    if (manifesto) s3.after(manifesto);
    if (s4) (manifesto || s3).after(s4);
    if (about) about.remove();
    if (final) page.appendChild(final);
  });
})();
