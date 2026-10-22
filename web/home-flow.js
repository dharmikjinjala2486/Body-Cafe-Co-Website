/* Homepage flow, October 2026.
   Final homepage layer for A–D. It runs after every earlier home layer (site → creative → world → cinema → live → atelier),
   keeps each direction's own hero, collection and curiosity markup, and renders the remaining sections in that
   direction's own class vocabulary, so every direction follows the same seven-part order:
     1 hero · 2 collection · 3 curiosity · 4 trust · 5 lot report · 6 customer voices · 7 before you order
   Every factual sentence comes from BCCSite.copy (see SITE-COPY-LEDGER.md) or restates its status lines. */
(function () {
  'use strict';
  const S = window.BCCSite;
  if (!S) return;
  const R = S.copy.reports;
  const ORDER = ['hero', 'collection', 'curiosity', 'trust', 'lot', 'voices', 'faq'];
  const no = (i) => String(i + 1).padStart(2, '0');

  /* ---------- shared content (facts only) ---------- */
  const TRUST = [
    { k: 'Ingredient details', st: 'Published', p: 'The product name, ingredient in view and format are published for all seven. Ingredient forms and amounts per serving will follow the approved product records.', href: '/learn', l: 'Read the ingredient notes' },
    { k: 'Label status', st: 'Awaiting approved label', p: 'Approved rear labels haven’t been supplied yet. Serving size, amounts, directions, cautions and allergens are marked “Awaiting approved label” on every product page.', href: '/learn/reading-a-label', l: 'How to read a label' },
    { k: 'Sourcing', st: 'Not yet published', p: 'Ingredient sourcing and manufacturer details haven’t been published. They will appear only once they are confirmed.', href: '/standards', l: 'Read our standards' },
    { k: 'Testing documents', st: 'Sample records only', p: 'No laboratory reports, laboratory names, certifications or results have been published. The lot lookup uses clearly marked sample records for now.', href: '/reports', l: 'See how lot reports work' }
  ];
  const faqA = (q) => (S.copy.help.faqs.find((x) => x[1] === q) || [])[2] || '';
  const FAQ = [
    { q: 'Where are the full product details?', a: faqA('Where are the full product details?'), href: '/learn/reading-a-label', l: 'How to read a label' },
    { q: 'Are these the final prices?', a: faqA('Are these the final prices?'), href: '/help', l: 'Visit help' },
    { q: 'When will my order arrive?', a: faqA('When will my order arrive?'), href: '/policies/shipping', l: 'Shipping policy draft' },
    { q: 'How do returns work?', a: faqA('How do returns work?'), href: '/policies/returns', l: 'Returns policy draft' },
    { q: 'Where do I find my lot report?', a: faqA('Where do I find my lot report?'), href: '/reports', l: 'Find a lot report' },
    { q: 'How can I ask a question?', a: 'Open a support case from the contact page; every case gets an ID you can follow. Public email, WhatsApp and phone details will be added once they are confirmed.', href: '/contact', l: 'Contact support' }
  ];
  const VOICES = {
    lead: 'There are no published customer reviews yet.',
    body: 'Feedback will appear here only from real customers, with their permission and after review, shown alongside the product it relates to.',
    small: 'Until then there are no sample quotes, star ratings or testimonials on this site.'
  };
  window.BCCHomeFlow = { ORDER, TRUST, FAQ, VOICES };

  const arrow = '<span aria-hidden="true">↗</span>';
  const attr = (slot) => `data-home-section="${slot}"`;
  const lotMeta = `${R.locationStatus} ${R.demo}`;

  /* ---------- A and D: the creative "r-" vocabulary ---------- */
  const rTag = (t, cls = '') => `<p class="r-label ${cls}">${t}</p>`;
  const rLink = (href, t) => `<a class="r-link" href="${href}"><span>${t}</span>${arrow}</a>`;
  const rButton = (href, t) => `<a class="r-button" href="${href}"><span>${t}</span>${arrow}</a>`;
  const rCopy = {
    a: { trust: ['02 / What you can check', 'WHAT’S PUBLISHED.<br>WHAT’S PENDING.', 'Know what’s confirmed<br>before you choose.'], lot: 'PRODUCT → LOT → RECORD.', voices: 'IN THEIR<br>OWN WORDS.' },
    d: { trust: ['02 / What you can check', 'What you can check.<br><em>What’s still to come.</em>', 'Know what’s confirmed<br>before you choose.'], lot: 'Find your lot.<br><em>Read its record.</em>', voices: 'Real people.<br><em>Their own words.</em>' }
  };
  const r = {
    trust: (d) => `<section class="r-principles hf-trust" ${attr('trust')}><header class="r-section-head">${rTag(rCopy[d].trust[0])}<h2>${rCopy[d].trust[1]}</h2>${rLink('/standards', 'Explore our standards')}</header><div class="r-principle-body"><p class="r-statement">${rCopy[d].trust[2]}</p><div class="r-principle-notes">${TRUST.map((t, i) => `<article><span class="r-section-number">${no(i)}</span><span class="r-pending hf-status">${t.st}</span><h3>${t.k}</h3><p>${t.p}</p>${rLink(t.href, t.l)}</article>`).join('')}</div></div></section>`,
    lot: (d) => `<section class="r-home-report hf-lot" ${attr('lot')}><div>${rTag('03 / Keep the number on your pack')}<h2>${rCopy[d].lot}</h2><p>${R.what}</p><ol class="hf-steps">${R.steps.map((s, i) => `<li><span>${no(i)}</span><strong>${s[0]}</strong><small>${s[1]}</small></li>`).join('')}</ol><p class="hf-note">${lotMeta}</p>${rButton('/reports', 'Find your lot report')}</div><div class="hf-lot-side"><div class="r-report-graphic" aria-hidden="true"><span>BODY CAFÉ CO.</span><strong>LOT<br>NO.</strong><code>DEMO — 03 — 01</code><span>PRODUCT / LOT / RECORD</span></div><div class="hf-limits"><p class="r-label">What a report can’t tell you</p><ul>${R.limits.map((x) => `<li>${x}</li>`).join('')}</ul></div></div></section>`,
    voices: (d) => `<section class="hf-voices" ${attr('voices')} aria-labelledby="hf-voices-title"><header class="r-section-head">${rTag('04 / Customer voices')}<h2 id="hf-voices-title">${rCopy[d].voices}</h2></header><div class="hf-voices-body"><p class="hf-voices-lead">${VOICES.lead}</p><p>${VOICES.body}</p><p class="hf-voices-small"><span class="r-pending">Preview store</span>${VOICES.small}</p></div></section>`,
    faq: () => `<section class="r-home-care hf-faq" ${attr('faq')}>${rTag('Before you order')}<h2>Good questions<br><em>welcome here.</em></h2><div>${FAQ.map((f) => `<details><summary>${f.q}<span aria-hidden="true">+</span></summary><p>${f.a}</p>${rLink(f.href, f.l)}</details>`).join('')}${rLink('/help', 'Visit the help centre')}</div></section>`
  };

  /* ---------- B: the expressive "tb-/hc-" vocabulary ---------- */
  const hcLink = (href, t) => `<a href="${href}">${t} ↗</a>`;
  const b = {
    trust: () => `<section id="home-evidence" class="hc-section hc-evidence hf-trust" ${attr('trust')}><div class="hc-heading"><p class="hc-kicker">02 — WHAT YOU CAN CHECK</p><h2>What we can show.<br><em>What’s still to come.</em></h2><p>Everything published now, and everything still waiting for approval, in one place.</p></div><div class="hc-proof-grid">${TRUST.map((t, i) => `<article><span class="hc-index">${no(i)} / ${t.st.toUpperCase()}</span><h3>${t.k}</h3><p>${t.p}</p>${hcLink(t.href, t.l)}</article>`).join('')}</div></section>`,
    voices: () => `<section class="hc-section hc-voices" ${attr('voices')} aria-labelledby="hc-voices-title"><p class="hc-kicker">04 — CUSTOMER VOICES</p><div class="hc-split"><h2 id="hc-voices-title">Real people.<br><em>Their own words.</em></h2><div><p class="hc-lede">${VOICES.lead}</p><p>${VOICES.body}</p><p class="hc-small">${VOICES.small}</p></div></div></section>`,
    faq: () => `<section id="home-care" class="hc-section hc-care hf-faq" ${attr('faq')}><div><p class="hc-kicker">BEFORE YOU ORDER</p><h2>Good questions<br><em>welcome here.</em></h2><p>This is a working preview. No payment is taken and no products are dispatched.</p>${hcLink('/help', 'Visit the help centre')}</div><div class="hc-faq">${FAQ.map((f) => `<details><summary>${f.q}<span aria-hidden="true">＋</span></summary><p>${f.a}</p><p class="hf-faq-link">${hcLink(f.href, f.l)}</p></details>`).join('')}</div></section>`,
    lotExtra: () => `<ol class="hf-steps">${R.steps.map((s, i) => `<li><span>${no(i)}</span><strong>${s[0]}</strong><small>${s[1]}</small></li>`).join('')}</ol><div class="hf-limits"><p class="hf-limits-title">What a report can’t tell you</p><ul>${R.limits.map((x) => `<li>${x}</li>`).join('')}</ul></div><p class="hf-note">${R.locationStatus}</p>`
  };

  /* ---------- C: the Everyday Elsewhere "w-" vocabulary ---------- */
  const go = (href, t, cls = '') => `<a class="w-button ${cls}" href="${href}">${t}${arrow}</a>`;
  const c = {
    trust: () => `<section class="hf-c hf-c-trust hf-trust" ${attr('trust')}><header><span class="w-eyebrow">02 / WHAT YOU CAN CHECK</span><h2>Published now.<br><em>Pending, plainly.</em></h2>${go('/standards', 'Our approach')}</header><div class="hf-c-cards">${TRUST.map((t, i) => `<article style="--tilt:${[-1.5, 1, -1, 1.5][i]}deg"><span class="w-eyebrow">${no(i)} / ${t.st}</span><h3>${t.k}</h3><p>${t.p}</p><a href="${t.href}">${t.l} ${arrow}</a></article>`).join('')}</div></section>`,
    lot: () => `<section class="hf-c hf-c-lot hf-lot" ${attr('lot')}><div><span class="w-eyebrow">03 / KEEP THE NUMBER ON YOUR PACK</span><h2>Every lot.<br><em>Its own record.</em></h2><p>${R.what}</p>${go('/reports', 'Find your lot report')}</div><div><ol class="hf-steps">${R.steps.map((s, i) => `<li><span>${no(i)}</span><strong>${s[0]}</strong><small>${s[1]}</small></li>`).join('')}</ol><div class="hf-limits"><p class="w-eyebrow">What a report can’t tell you</p><ul>${R.limits.map((x) => `<li>${x}</li>`).join('')}</ul></div><p class="hf-note">${lotMeta}</p></div></section>`,
    voices: () => `<section class="hf-c hf-c-voices" ${attr('voices')} aria-labelledby="hf-voices-title"><div class="hf-c-bubble" aria-hidden="true"><span>“</span><i>NOTHING<br>MADE UP</i></div><div><span class="w-eyebrow">04 / CUSTOMER VOICES</span><h2 id="hf-voices-title">Real people.<br><em>Their own words.</em></h2><p class="hf-voices-lead">${VOICES.lead}</p><p>${VOICES.body}</p><p class="hf-voices-small">${VOICES.small}</p></div></section>`,
    faq: () => `<section class="hf-c hf-c-faq hf-faq" ${attr('faq')}><header><span class="w-eyebrow">BEFORE YOU ORDER</span><h2>Good questions<br><em>welcome here.</em></h2>${go('/help', 'Visit the help centre')}</header><div>${FAQ.map((f) => `<details><summary>${f.q}<span aria-hidden="true">+</span></summary><p>${f.a}</p><a href="${f.href}">${f.l} ${arrow}</a></details>`).join('')}</div></section>`
  };

  /* Which already-rendered blocks each direction keeps, by slot. Anything not listed is retired from the homepage
     (its content stays on /learn, /story and /standards and in the navigation). */
  const KEEP = {
    a: { hero: ['.live-shell'], collection: ['.r-home-collection'], curiosity: ['.atelier-lab'] },
    b: { hero: ['.tb-hero'], collection: ['.tb-coll'], curiosity: ['.atelier-lab'], lot: ['.tb-home-lot'] },
    c: { hero: ['.cin-journey'], collection: ['.w-collection'], curiosity: ['.atelier-lab'] },
    d: { hero: ['.live-shell'], collection: ['.r-home-collection'], curiosity: ['.atelier-lab'] }
  };
  const BUILD = {
    a: { trust: () => r.trust('a'), lot: () => r.lot('a'), voices: () => r.voices('a'), faq: r.faq },
    b: { trust: b.trust, voices: b.voices, faq: b.faq },
    c: { trust: c.trust, lot: c.lot, voices: c.voices, faq: c.faq },
    d: { trust: () => r.trust('d'), lot: () => r.lot('d'), voices: () => r.voices('d'), faq: r.faq }
  };

  function compose(d, html) {
    const t = document.createElement('template');
    t.innerHTML = html;
    const top = [...t.content.children];
    const out = [];
    for (const slot of ORDER) {
      for (const sel of (KEEP[d][slot] || [])) {
        const el = top.find((x) => x.matches(sel));
        if (!el) continue;
        el.setAttribute('data-home-section', slot);
        if (d === 'b' && slot === 'lot') {
          const copy = el.querySelector('.lot-copy');
          if (copy) copy.insertAdjacentHTML('beforeend', b.lotExtra());
          el.classList.add('hf-lot');
        }
        out.push(el.outerHTML);
      }
      if (BUILD[d][slot]) out.push(BUILD[d][slot]());
    }
    return out.join('');
  }

  for (const d of ['a', 'b', 'c', 'd']) {
    const base = S.themes[d];
    if (!base || typeof base.home !== 'function') continue;
    S.themes[d] = { ...base, home: (ctx, ...args) => compose(d, base.home(ctx, ...args)) };
  }
})();
