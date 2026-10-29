/* Body Café Co. — Operations (Variant B).
   Calm admin built on the storefront's paper, indigo and lilac. Every mutation goes to an authenticated server
   endpoint and applies directly: there is no approval queue. Lot reports live in lots-ops.js. */
(() => {
  'use strict';

  /* ---------------------------------------------------------------- helpers */
  const h = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = v => Number(v) || 0;
  const fmt = n => num(n).toLocaleString('en-IN');
  const cash = n => (num(n) < 0 ? '−₹' : '₹') + Math.abs(Math.round(num(n))).toLocaleString('en-IN');
  const TZ = 'Asia/Kolkata';
  const when = n => n ? new Date(n * 1000).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: TZ }) : '—';
  const day = n => n ? new Date(n * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ }) : '—';
  const istToday = () => new Date(Date.now() + 19800000).toISOString().slice(0, 10);
  const addDays = (iso, n) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const lines = v => h(v).replace(/\n/g, '<br>');
  const uuid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
  const A = () => window.BCCApp;
  const q = () => new URLSearchParams(location.search);
  let uid = 0;
  const nid = p => 'op-' + (p || 'f') + '-' + (++uid);
  const DAY = 86400;

  const NAV = [
    ['', [['overview', 'Overview', '◉']]],
    ['Sell', [['orders', 'Orders', '▤'], ['sales', 'Sales', '↗']]],
    ['Catalogue', [['products', 'Products', '◇'], ['inventory', 'Inventory', '▦'], ['lots', 'Lot reports', '▧']]],
    ['Customers', [['cases', 'Support & safety', '♡'], ['reviews', 'Reviews & questions', '☆']]],
    ['Settings', [['channels', 'Channels', '⇄'], ['flags', 'Feature flags', '⚑']]],
  ];
  const TABS = NAV.flatMap(g => g[1]);

  let records = null, dirty = false;
  const productName = id => records?.products.find(p => p.id === id)?.name || id;

  /* ---------------------------------------------------------------- UI primitives */
  const button = (text, action, id = '', cls = '', attrs = '') => `<button type="button" class="op-btn ${cls}" data-op="${action}" data-id="${h(id)}" ${attrs}>${h(text)}</button>`;
  const link = (text, url, cls = '', attrs = '') => `<a class="op-btn ${cls}" href="${h(url)}" ${attrs}>${h(text)}</a>`;
  const TONE = {
    success: ['published', 'released', 'delivered', 'enabled', 'captured', 'resolved', 'live', 'connected', 'receive', 'received', 'opening'],
    info: ['paid', 'packing', 'shipped', 'investigating', 'reserve', 'reserved', 'allocate', 'ship'],
    warning: ['pending', 'quarantined', 'hidden', 'paused', 'draft', 'open', 'escalated', 'low', 'expiring', 'count_correction', 'unpublished', 'not_connected'],
    danger: ['cancelled', 'expired', 'rejected', 'withdrawn', 'damage', 'damaged', 'write_off', 'refund', 'refunded', 'safety'],
  };
  const toneOf = t => { const k = String(t).toLowerCase().replace(/[\s-]+/g, '_'); return Object.keys(TONE).find(x => TONE[x].includes(k)) || 'neutral'; };
  const tag = (text, tone) => `<span class="op-tag op-tag-${tone || toneOf(text)}">${h(String(text).replaceAll('_', ' '))}</span>`;
  const empty = (title, text, action = '') => `<div class="op-empty"><h2>${h(title)}</h2><p>${h(text)}</p>${action}</div>`;
  const notice = (text, tone = '') => `<div class="op-notice ${tone ? 'op-notice-' + tone : ''}">${text}</div>`;
  const helpEl = (id, text) => text ? `<small class="op-help" id="${id}-h">${text}</small>` : '';
  const desc = (id, text) => text ? ` aria-describedby="${id}-h"` : '';
  const reqMark = r => r ? ' <b class="op-req">Required</b>' : '';
  function field({ name, label, value = '', type = 'text', attrs = '', help = '', wide = false, required = false, id }) {
    id = id || nid(name);
    return `<div class="op-field${wide ? ' op-wide' : ''}"><label for="${id}">${h(label)}${reqMark(required)}</label><input id="${id}" name="${h(name)}" type="${type}" value="${h(value)}" ${required ? 'required' : ''} ${attrs}${desc(id, help)}>${helpEl(id, help)}</div>`;
  }
  function area({ name, label, value = '', rows = 3, attrs = '', help = '', wide = true, required = false, id }) {
    id = id || nid(name);
    return `<div class="op-field${wide ? ' op-wide' : ''}"><label for="${id}">${h(label)}${reqMark(required)}</label><textarea id="${id}" name="${h(name)}" rows="${rows}" ${required ? 'required' : ''} ${attrs}${desc(id, help)}>${h(value)}</textarea>${helpEl(id, help)}</div>`;
  }
  function select({ name, label, items, value = '', attrs = '', help = '', wide = false, id }) {
    id = id || nid(name);
    return `<div class="op-field${wide ? ' op-wide' : ''}"><label for="${id}">${h(label)}</label><select id="${id}" name="${h(name)}" ${attrs}${desc(id, help)}>${items.map(([v, t]) => `<option value="${h(v)}" ${String(v) === String(value) ? 'selected' : ''}>${h(t)}</option>`).join('')}</select>${helpEl(id, help)}</div>`;
  }
  const formEnd = (text = 'Save changes', cls = 'op-primary') => `<div class="op-error" role="alert"></div><div class="op-form-actions"><button class="op-btn ${cls}" type="submit">${h(text)}</button></div>`;
  function metrics(items) {
    return `<div class="op-metrics">${items.map(([label, value, sub, tone]) => `<article class="${tone ? 'op-metric-' + tone : ''}"><p>${h(label)}</p><strong>${h(value)}</strong>${sub ? `<small>${h(sub)}</small>` : ''}</article>`).join('')}</div>`;
  }
  /* headers: strings, or [text, 'num'] for right-aligned numbers. */
  function table(headers, rows, opts = {}) {
    if (!rows.length) return opts.emptyHTML || empty(opts.emptyTitle || 'Nothing here yet', opts.emptyText || 'Records will appear here as they are created.');
    const key = opts.pageKey || 'page', size = opts.size || 40;
    const pages = Math.ceil(rows.length / size), active = Math.min(Math.max(1, Number(q().get(key)) || 1), pages);
    const href = p => { const u = new URL(location.href); u.searchParams.set(key, p); return u.pathname + u.search; };
    const cls = headers.map(x => Array.isArray(x) && x[1] === 'num' ? ' class="op-num"' : '');
    return `<div class="op-table-wrap"><table class="op-table">${opts.caption ? `<caption class="sr-only">${h(opts.caption)}</caption>` : ''}<thead><tr>${headers.map((x, i) => `<th scope="col"${cls[i]}>${Array.isArray(x) ? x[0] : x}</th>`).join('')}</tr></thead><tbody>${rows.slice((active - 1) * size, active * size).map(r => `<tr>${r.map((c, i) => `<td${cls[i]}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${pages > 1 ? `<nav class="op-pagination" aria-label="Pages"><span>${rows.length} records · page ${active} of ${pages}</span><div>${active > 1 ? link('← Previous', href(active - 1)) : ''}${active < pages ? link('Next →', href(active + 1)) : ''}</div></nav>` : `<p class="op-count">${rows.length} record${rows.length === 1 ? '' : 's'}</p>`}`;
  }
  function filtered(list) {
    const search = (q().get('q') || '').trim().toLowerCase(), status = q().get('status') || '';
    return list.filter(r => (!search || JSON.stringify(r).toLowerCase().includes(search)) && (!status || r.state === status));
  }
  /* Search + status filter. `extra` adds fields; `clear` lists the query keys this form owns. */
  function tools({ statuses = [], extra = '', clear = 'q,status,page', exportable = true } = {}) {
    return `<form class="op-tools" data-op-form="filter" data-clear="${clear}" role="search"><div class="op-field op-tools-search"><label for="op-q">Search</label><input id="op-q" name="q" type="search" placeholder="Name, ID, phone…" value="${h(q().get('q') || '')}"></div>${statuses.length ? select({ name: 'status', label: 'Status', items: [['', 'All statuses'], ...statuses.map(s => [s, s.replaceAll('_', ' ')])], value: q().get('status') || '', id: 'op-status' }) : ''}${extra}<div class="op-tools-actions"><button class="op-btn op-primary" type="submit">Apply</button>${link('Reset', location.pathname)}${exportable ? button('Export CSV', 'export') : ''}</div></form>`;
  }
  function downloadCSV(name, headers, rows) {
    const cell = v => { let t = v != null && typeof v === 'object' ? JSON.stringify(v) : String(v ?? ''); if (/^[=+@\-\t\r]/.test(t)) t = "'" + t; return '"' + t.replaceAll('"', '""') + '"'; };
    const text = [headers.map(cell).join(','), ...rows.map(r => r.map(cell).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' }));
    /* Detached on purpose: the app's link router listens on document and would treat the same-origin blob link as navigation. */
    const a = document.createElement('a'); a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ---------------------------------------------------------------- sign-in */
  function login() {
    return `<main id="main" tabindex="-1" class="op-login"><div class="op-login-story"><a href="/?design=b"><img src="/web/media/brand-horizontal.svg" alt="Body Café Co."></a><span class="op-eyebrow">Operations</span><h1>A little order.<br>A lot of care.</h1><p>Products, stock, orders and lot reports in one calm place.</p></div><div class="op-login-panel"><div><span class="op-eyebrow">Welcome back</span><h2>Sign in</h2><p>Use your store admin account.</p><form data-op-form="login">${field({ name: 'username', label: 'Username', attrs: 'autocomplete="username"', required: true })}${field({ name: 'password', label: 'Password', type: 'password', attrs: 'autocomplete="current-password"', required: true })}${formEnd('Sign in')}</form>${link('View storefront ↗', '/?design=b', 'op-quiet')}</div></div></main>`;
  }

  /* ---------------------------------------------------------------- inventory model */
  function batchView(b) {
    const now = Date.now() / 1000, meta = b.meta || {};
    const expired = !!b.expiry && b.expiry < now;
    const reserved = num(b.reserved), available = num(b.available);
    const onHand = b.on_hand != null ? num(b.on_hand) : available + reserved;
    const sellable = b.sellable != null ? num(b.sellable) : (b.state === 'released' && !expired ? available : 0);
    const held = Math.max(0, onHand - reserved - sellable);
    const setThreshold = meta.low_stock_threshold != null && meta.low_stock_threshold !== '';
    const threshold = setThreshold ? num(meta.low_stock_threshold) : 5;
    const low = b.state === 'released' && !expired && sellable <= threshold;
    const expiring = !expired && !!b.expiry && b.expiry < now + 60 * DAY;
    return { b, expired, reserved, available, onHand, sellable, held, threshold, setThreshold, low, expiring,
      heldReason: b.state === 'quarantined' ? 'Quarantined' : expired ? 'Expired' : held ? 'Not sellable' : '',
      damaged: num(b.damaged ?? meta.damaged), returned: num(meta.returned_pending), location: meta.location || 'Main warehouse',
      status: expired ? 'expired' : b.state };
  }
  function invSummary(o) {
    const views = o.batches.map(batchView);
    const s = o.inventory_summary || {};
    const sum = f => views.reduce((n, v) => n + f(v), 0);
    return {
      on_hand: s.on_hand ?? sum(v => v.onHand), available: s.available ?? sum(v => v.sellable), reserved: s.reserved ?? sum(v => v.reserved),
      quarantined: s.quarantined ?? sum(v => v.b.state === 'quarantined' ? v.held : 0), expired: s.expired ?? sum(v => v.expired ? v.held : 0),
      damaged: s.damaged ?? sum(v => v.damaged), low_stock_batches: s.low_stock_batches ?? views.filter(v => v.low).length,
      expiring_batches: s.expiring_batches ?? views.filter(v => v.expiring).length,
    };
  }

  /* ---------------------------------------------------------------- overview */
  function overview(o) {
    const toFulfil = o.orders.filter(x => ['paid', 'packing'].includes(x.state));
    const open = o.cases.filter(x => x.state !== 'resolved'), safety = open.filter(c => c.kind === 'safety');
    const inv = invSummary(o), drafts = o.products.filter(p => p.draft);
    const attention = [
      ['Orders to fulfil', toFulfil.length, '/ops/orders?status=paid'],
      ['Open safety cases', safety.length, '/ops/cases?status=open'],
      ['Low-stock batches', inv.low_stock_batches, '/ops/inventory?alert=low'],
      ['Batches expiring within 60 days', inv.expiring_batches, '/ops/inventory?alert=expiring'],
      ['Quarantined batches', o.batches.filter(b => b.state === 'quarantined').length, '/ops/inventory?status=quarantined'],
      ['Products with unpublished changes', drafts.length, '/ops/products?status=draft'],
    ];
    const recent = [...o.orders].sort((a, b) => b.created - a.created).slice(0, 6);
    return metrics([
      ['Orders to fulfil', fmt(toFulfil.length), 'Paid or packing'],
      ['Open cases', fmt(open.length), safety.length ? `${safety.length} safety priority` : 'No safety cases open', safety.length ? 'warning' : ''],
      ['Available units', fmt(inv.available), `${fmt(inv.reserved)} reserved · ${fmt(inv.quarantined)} quarantined`],
      ['Stock alerts', fmt(inv.low_stock_batches + inv.expiring_batches), `${inv.low_stock_batches} low · ${inv.expiring_batches} expiring`, inv.low_stock_batches + inv.expiring_batches ? 'warning' : ''],
    ]) + `<div class="op-two"><section class="op-card" aria-labelledby="att-t"><div class="op-card-title"><h2 id="att-t">Needs attention</h2></div><ul class="op-attention">${attention.map(([l, n, u]) => `<li><a href="${u}"><span>${h(l)}</span><strong class="${n ? 'is-on' : ''}">${fmt(n)}</strong></a></li>`).join('')}</ul></section><section class="op-card" aria-labelledby="ro-t"><div class="op-card-title"><h2 id="ro-t">Recent orders</h2>${link('All orders', '/ops/orders', 'op-small')}</div>${recent.length ? `<ul class="op-list">${recent.map(x => `<li><a href="/ops/orders?order=${encodeURIComponent(x.id)}"><span><strong>${h(x.id)}</strong><small>${h(x.contact?.name || '')} · ${when(x.created)}</small></span><span class="op-list-end">${tag(x.state)}<b>${cash(x.total)}</b></span></a></li>`).join('')}</ul>` : '<p class="op-muted">No orders yet.</p>'}</section></div><div class="op-quicklinks">${link('＋ Add product', '/ops/products?product=new')}${link('＋ Add batch', '/ops/inventory?new=1')}${link('View sales', '/ops/sales')}${link('Lot reports', '/ops/lots')}</div>`;
  }

  /* ---------------------------------------------------------------- products */
  const DEFAULT_IMG = ['iron-bisglycinate', 'l-theanine', 'vitamin-d3-k2', 'omega-3-fish-oil', 'myo-d-chiro-inositol', 'creatine-chews', 'psyllium-husk'];
  const F = (name, label, o = {}) => ({ name, label, max: 3000, rows: 3, type: 'area', ...o });
  const AWAIT = 'Leave blank to show “Awaiting approved label”.';
  const SECTIONS = [
    { id: 'essentials', label: 'Essentials', intro: 'Name, identifiers, price and the purchase panel at the top of the product page.' },
    { id: 'images', label: 'Images', intro: 'Website order is the order below. Image 1 is the product card, image 2 is the card hover, and the product page gallery follows the same order.' },
    { id: 'overview', label: 'Overview', intro: 'Product page section 2 · Overview.', fields: [
      F('description', 'Product description', { max: 6000, rows: 6, help: 'Opening paragraph of the Overview.' }),
      F('purpose', 'Purpose statement', { max: 1500, help: 'Approved purpose wording. Leave blank to keep the “no purpose supplied” note.' }) ] },
    { id: 'ingredients', label: 'Ingredients & label', intro: 'Product page section 3 · Ingredients and product facts.', fields: [
      F('ingredients', 'Ingredients and forms', { max: 4000, rows: 4, help: 'Complete list with each ingredient’s form. The first item (before “;”) is the ingredient in view.' }),
      F('amount_per_serving', 'Amount per serving', { help: AWAIT }),
      F('serving_size', 'Serving size', { type: 'text', help: AWAIT }),
      F('servings_per_pack', 'Servings per pack', { type: 'text', help: AWAIT }),
      F('other_ingredients', 'Other ingredients / shell or chew base', { help: AWAIT }),
      F('flavour_sweeteners', 'Flavour and sweeteners', { help: 'Only for flavoured formats.' }),
      F('nutrition_information', 'Nutrition information', { rows: 4, help: AWAIT }),
      F('allergens', 'Allergens', { max: 1500, help: 'Shown in Ingredients and in How to use.' }),
      F('dietary_suitability', 'Dietary suitability', { help: AWAIT }),
      F('manufacturer_details', 'Manufacturer and licence details', { help: AWAIT }),
      F('ingredient_note', 'Reading this ingredient', { max: 4000, rows: 4, help: 'Side note under Ingredients. Its sources are set under FAQs & sources.' }),
      F('label_checklist', 'What the approved label will state', { rows: 4, help: 'One item per line.' }),
      F('rear_label_note', 'Rear label note', { help: 'Shown beside the label checklist.' }) ] },
    { id: 'use', label: 'How to use', intro: 'Product page section 4 · How to use and cautions.', fields: [
      F('directions', 'Recommended use', { help: 'From the approved label. Leave blank to keep the “no dose suggested” note.' }),
      F('preparation', 'Preparation', { help: AWAIT }),
      F('age_guidance', 'Age', { type: 'text', help: 'Leave blank to show the 18+ purchase note.' }),
      F('suitability', 'Suitability', { help: AWAIT }),
      F('warnings', 'Cautions and interactions', { rows: 4 }),
      F('storage', 'Storage', { max: 1500 }),
      F('ingredient_checks', 'What to check on the label', { rows: 4, help: 'One per line, written as: Title | explanation' }) ] },
    { id: 'quality', label: 'Quality & sourcing', intro: 'Product page section 5 · Quality, sourcing and lot report. Blank fields show “Not yet published”.', fields: [
      F('ingredient_sourcing', 'Ingredient sourcing'), F('manufacturer', 'Manufacturer', { type: 'text' }), F('testing_performed', 'Testing performed'),
      F('supporting_documents', 'Supporting documents'), F('certifications', 'Certifications', { help: 'Blank shows “None claimed”.' }) ] },
    { id: 'faqs', label: 'FAQs & sources', intro: 'Common questions (section 7) and the sources listed under “Reading this ingredient”. Customer questions and reviews stay in Reviews & questions.' },
    { id: 'related', label: 'Related & search', intro: 'Other products to explore (section 8) and search-engine text.' },
  ];
  const SCALARS = ['id', 'sku', 'name', 'subtitle', 'category', 'format', 'pack_size', 'color', 'seo_title', 'seo_description', ...SECTIONS.flatMap(s => (s.fields || []).map(f => f.name))];

  function normGallery(p, saved) {
    let g = Array.isArray(p.gallery) ? p.gallery : [];
    if (!g.length && saved && DEFAULT_IMG.includes(p.id)) g = [{ src: '/web/media/' + p.id + '.webp', alt: (p.name || '') + ' bottle' }];
    return g.map(x => ({ ...x, alt: x.alt || '', label: x.label || '', caption: x.caption || '', visible: x.visible !== false }));
  }
  const visibleImages = g => (g || []).filter(x => x.visible !== false);
  function galleryRole(pos) { return pos === 1 ? 'Primary card image' : pos === 2 ? 'Hover image on cards' : 'Product page gallery'; }
  function galleryRows(gallery) {
    let pos = 0;
    const shown = visibleImages(gallery).length;
    const rows = gallery.map((g, i) => {
      const visible = g.visible !== false, n = visible ? ++pos : 0, id = nid('img');
      return `<li class="op-media-row${visible ? '' : ' is-hidden'}" data-gallery-row data-meta="${h(JSON.stringify(g))}"><div class="op-media-pos" aria-hidden="true">${visible ? n : '–'}</div><img src="${h(g.src)}" alt="" loading="lazy"><div class="op-media-fields"><p class="op-media-role"><strong>${visible ? 'Website image ' + n : 'Hidden'}</strong> · ${visible ? galleryRole(n) : 'kept in admin, not shown on the website'}</p><div class="op-form-grid">${field({ name: '', label: 'Alt text', value: g.alt, attrs: 'data-g="alt" maxlength="300"', required: true, id: id + '-alt', help: 'Describe the image for screen readers.' })}${field({ name: '', label: 'Label', value: g.label, attrs: 'data-g="label" maxlength="120"', id: id + '-label', help: 'Short name, e.g. “Front of the bottle”.' })}${field({ name: '', label: 'Caption', value: g.caption, attrs: 'data-g="caption" maxlength="300"', wide: true, id: id + '-cap', help: 'Shown under the image on the product page.' })}</div></div><div class="op-media-controls" role="group" aria-label="Image ${i + 1} controls"><label class="op-switch"><input type="checkbox" data-g="visible" data-gallery-visible ${visible ? 'checked' : ''}><span>Show on website</span></label>${button('Move up', 'image-up', i, 'op-small', `aria-label="Move image ${i + 1} up" ${i === 0 ? 'disabled' : ''}`)}${button('Move down', 'image-down', i, 'op-small', `aria-label="Move image ${i + 1} down" ${i === gallery.length - 1 ? 'disabled' : ''}`)}${button('Make image 1', 'image-first', i, 'op-small', `${visible && n === 1 ? 'disabled' : ''}`)}${button('Remove', 'image-remove', i, 'op-small op-danger', `aria-label="Remove image ${i + 1}"`)}</div></li>`;
    }).join('');
    return `<p class="op-gallery-summary" role="status">${shown} shown on the website · ${gallery.length - shown} hidden · ${gallery.length} of 12</p>${shown ? '' : notice('<strong>No visible image.</strong> Publishing needs at least one image shown on the website.', 'warning')}<ol class="op-media-list">${rows}</ol>`;
  }
  function galleryFromForm(form) {
    return [...form.querySelectorAll('[data-gallery-row]')].map(row => {
      let meta = {}; try { meta = JSON.parse(row.dataset.meta || '{}'); } catch { meta = {}; }
      const v = k => row.querySelector(`[data-g="${k}"]`);
      return { ...meta, alt: v('alt').value.trim(), label: v('label').value.trim(), caption: v('caption').value.trim(), visible: v('visible').checked };
    });
  }
  function faqRows(list) {
    return list.map((f, i) => { const id = nid('faq'); return `<li class="op-repeat-row" data-faq-row><div class="op-form-grid">${field({ name: '', label: `Question ${i + 1}`, value: f.question, attrs: 'data-k="question" maxlength="300"', wide: true, id: id + 'q' })}${area({ name: '', label: `Answer ${i + 1}`, value: f.answer, attrs: 'data-k="answer" maxlength="3000"', id: id + 'a' })}</div>${button('Remove', 'faq-remove', i, 'op-small op-danger', `aria-label="Remove question ${i + 1}"`)}</li>`; }).join('');
  }
  function sourceRows(list) {
    return list.map((s, i) => { const id = nid('src'); return `<li class="op-repeat-row" data-source-row><div class="op-form-grid">${field({ name: '', label: `Source ${i + 1} title`, value: s.title, attrs: 'data-k="title" maxlength="300"', id: id + 't' })}${field({ name: '', label: `Source ${i + 1} link`, value: s.url, type: 'url', attrs: 'data-k="url" maxlength="1000" pattern="https://.+" placeholder="https://"', id: id + 'u', help: 'https links only.' })}</div>${button('Remove', 'source-remove', i, 'op-small op-danger', `aria-label="Remove source ${i + 1}"`)}</li>`; }).join('');
  }
  const rowsFrom = (form, sel, keys) => [...form.querySelectorAll(sel)].map(r => Object.fromEntries(keys.map(k => [k, r.querySelector(`[data-k="${k}"]`).value.trim()])));
  const filledRows = (list, keys) => list.filter(x => keys.some(k => x[k]));

  function sectionCount(s, p) {
    if (s.fields) return `${s.fields.filter(f => String(p[f.name] ?? '').trim()).length}/${s.fields.length}`;
    if (s.id === 'images') return `${visibleImages(p.gallery).length} shown`;
    if (s.id === 'faqs') return `${(p.faqs || []).length} · ${(p.sources || []).length}`;
    if (s.id === 'related') return `${(p.related_product_ids || []).length}/6`;
    return '';
  }
  function sectionFields(s, p) {
    return `<div class="op-form-grid">${s.fields.map(f => f.type === 'text'
      ? field({ name: f.name, label: f.label, value: p[f.name], attrs: `maxlength="${f.max}"`, help: f.help })
      : area({ name: f.name, label: f.label, value: p[f.name], rows: f.rows, attrs: `maxlength="${f.max}"`, help: f.help })).join('')}</div>`;
  }
  function panelBody(s, p, saved, o) {
    if (s.fields) return sectionFields(s, p);
    if (s.id === 'essentials') return `<div class="op-form-grid">${field({ name: 'name', label: 'Product name', value: p.name, attrs: 'maxlength="160"', required: true })}${field({ name: 'price', label: 'Selling price (₹, MRP)', value: p.price, type: 'number', attrs: 'min="0" max="1000000" step="1" inputmode="numeric"', required: true })}${field({ name: 'subtitle', label: 'Short description', value: p.subtitle, attrs: 'maxlength="300"', wide: true, help: 'Under the product name and on product cards.' })}${field({ name: 'id', label: 'Product ID / URL', value: p.id, attrs: `${saved ? 'readonly' : ''} pattern="[a-z0-9]+(-[a-z0-9]+)*" maxlength="60" spellcheck="false"`, required: true, help: saved ? 'Fixed after creation.' : 'Lowercase words and hyphens, e.g. vitamin-d3-k2.' })}${field({ name: 'sku', label: 'SKU', value: p.sku || (p.id || '').toUpperCase(), attrs: 'maxlength="80" spellcheck="false"', required: true })}${field({ name: 'category', label: 'Collection', value: p.category, attrs: 'maxlength="100"' })}${field({ name: 'format', label: 'Format', value: p.format, attrs: 'maxlength="100" list="op-formats"', help: 'e.g. Capsules, Softgels, Chewable tablets.' })}<datalist id="op-formats"><option value="Capsules"><option value="Softgels"><option value="Chewable tablets"><option value="Powder"></datalist>${field({ name: 'pack_size', label: 'Pack size', value: p.pack_size, attrs: 'maxlength="160"', help: 'Shown as Pack quantity. Leave blank to show “Awaiting approved label”.' })}${field({ name: 'color', label: 'Cap colour', value: p.color || '#35306f', type: 'color', help: 'Used for accents on the product page.' })}</div>`;
    if (s.id === 'images') return `<div id="op-gallery">${galleryRows(p.gallery)}</div><label class="op-upload"><span class="op-upload-title">＋ Upload images</span><input id="op-image-upload" type="file" accept="image/jpeg,image/png,image/webp" multiple aria-describedby="op-upload-h"><small id="op-upload-h">JPEG, PNG or WebP · up to 5 MB each · 12 images in total, including hidden ones. New images are shown and added at the end.</small></label><p id="op-upload-status" class="op-help" role="status"></p>`;
    if (s.id === 'faqs') return `<h3 class="op-h3">Common questions</h3><p class="op-muted">Up to 20. Leave empty to hide the common questions list.</p><ol class="op-repeat" id="op-faqs">${faqRows(p.faqs || [])}</ol>${button('＋ Add a question', 'faq-add', '', '', (p.faqs || []).length >= 20 ? 'disabled' : '')}<h3 class="op-h3">Sources</h3><p class="op-muted">Up to 20 references for “Reading this ingredient”.</p><ol class="op-repeat" id="op-sources">${sourceRows(p.sources || [])}</ol>${button('＋ Add a source', 'source-add', '', '', (p.sources || []).length >= 20 ? 'disabled' : '')}`;
    if (s.id === 'related') {
      const others = o.products.filter(x => x.id !== p.id), sel = p.related_product_ids || [];
      return `<fieldset class="op-fieldset"><legend>Other products to explore <span class="op-muted">· choose up to 6</span></legend><p class="op-help">Leave all unchecked to hide the related-products section.</p><div class="op-related">${others.map(x => `<label class="op-related-item"><input type="checkbox" name="related" value="${h(x.id)}" ${sel.includes(x.id) ? 'checked' : ''}><img src="${h(visibleImages(x.gallery)[0]?.src || (window.BCCBottleAssets ? window.BCCBottleAssets.url(x.id) : '/web/media/' + x.id + '.webp'))}" alt=""><span><strong>${h(x.name)}</strong><small>${x.published ? 'Published' : 'Hidden'}</small></span></label>`).join('') || '<p class="op-muted">No other products yet.</p>'}</div></fieldset><div class="op-form-grid">${field({ name: 'seo_title', label: 'Search title', value: p.seo_title, attrs: 'maxlength="160"', wide: true })}${area({ name: 'seo_description', label: 'Search description', value: p.seo_description, rows: 3, attrs: 'maxlength="320"' })}</div>`;
    }
    return '';
  }
  function productEditor(o, id) {
    const saved = o.products.find(p => p.id === id);
    if (id !== 'new' && !saved) return empty('Product not found', 'Return to products and choose an existing record.', link('← All products', '/ops/products'));
    const base = saved?.draft || saved || { id: '', name: '', price: 0, color: '#35306f', sku: '', format: 'Capsules' };
    const p = { ...base, gallery: normGallery(base, saved) };
    const version = saved?.edit_version || 0;
    const section = SECTIONS.some(s => s.id === q().get('section')) ? q().get('section') : 'essentials';
    const savedGallery = saved ? (saved.draft || saved).gallery : null;
    const savedVisible = visibleImages(savedGallery).length;
    const canPublish = saved && (saved.draft || !saved.published);
    const status = !saved ? tag('New product', 'info') : `${tag(saved.published ? 'Published' : 'Hidden')}${saved.draft ? tag('Unpublished changes', 'warning') : ''}`;
    return `<div class="op-subnav">${link('← All products', '/ops/products', 'op-quiet')}<span>${status}</span></div><form data-op-form="product" data-version="${version}" novalidate><div class="op-editor"><div class="op-editor-main"><div class="op-tabs" role="tablist" aria-label="Product page sections">${SECTIONS.map((s, i) => `<button type="button" role="tab" id="pt-${s.id}" aria-controls="pp-${s.id}" aria-selected="${s.id === section}" tabindex="${s.id === section ? 0 : -1}" data-op="editor-tab" data-id="${s.id}"><span class="op-tab-n">${i + 1}</span><span>${s.label}</span><small data-count="${s.id}">${sectionCount(s, p)}</small></button>`).join('')}</div>${SECTIONS.map(s => `<section class="op-card op-panel" role="tabpanel" id="pp-${s.id}" aria-labelledby="pt-${s.id}" tabindex="-1" ${s.id === section ? '' : 'hidden'}><div class="op-card-title"><h2>${s.label}</h2></div><p class="op-intro">${s.intro}</p>${panelBody(s, p, saved, o)}</section>`).join('')}</div><aside class="op-editor-side"><section class="op-card op-sticky" aria-labelledby="pub-t"><h2 id="pub-t">Save &amp; publish</h2><p class="op-muted">Saving keeps a private draft. The website changes only when you publish.</p>${area({ name: 'remarks', label: 'Change note (optional)', rows: 2, attrs: 'maxlength="1000"' })}${formEnd(saved ? 'Save draft' : 'Create draft')}${saved ? `<ul class="op-checklist" aria-label="Publish checklist"><li class="${(saved.draft || saved).name ? 'is-ok' : ''}">Name and price</li><li class="${savedVisible ? 'is-ok' : ''}">At least one visible image${savedVisible ? '' : ' in the saved draft'}</li></ul>` : ''}${canPublish ? button(saved.draft ? 'Publish saved draft' : 'Publish product', 'product-publish', saved.id, 'op-primary op-block', savedVisible ? '' : 'disabled aria-describedby="pub-why"') + (savedVisible ? '' : '<p class="op-help" id="pub-why">Save the draft with a visible image first.</p>') : ''}${saved?.draft ? button('Preview saved draft', 'product-preview', saved.id, 'op-block') : ''}${saved?.published ? link('View on website ↗', '/products/' + saved.id + '?design=b', 'op-block') : ''}${saved?.published ? button('Hide from website', 'product-archive', saved.id, 'op-danger op-block') : ''}</section></aside></div></form>`;
  }
  function products(o) {
    const id = q().get('product');
    if (id) return productEditor(o, id);
    const list = filtered(o.products.map(p => ({ ...p, state: p.draft ? 'draft' : p.published ? 'published' : 'hidden' })));
    return tools({ statuses: ['published', 'draft', 'hidden'] }) + `<section class="op-card op-flush">${table(['Product', 'SKU', ['Price', 'num'], 'Website', 'Images', ''], list.map(p => {
      const img = visibleImages(p.draft?.gallery || p.gallery)[0]?.src || (window.BCCBottleAssets ? window.BCCBottleAssets.url(p.id) : '/web/media/' + p.id + '.webp');
      return [`<div class="op-product-cell"><img src="${h(img)}" alt=""><div><strong>${h(p.name)}</strong><small>${h(p.id)}</small></div></div>`, h(p.sku || p.id), cash(p.price), `${tag(p.published ? 'Published' : 'Hidden')}${p.draft ? tag('Unpublished changes', 'warning') : ''}`, `${visibleImages(p.draft?.gallery || p.gallery).length} shown`, link('Edit', '/ops/products?product=' + encodeURIComponent(p.id), 'op-small', `aria-label="Edit ${h(p.name)}"`)];
    }), { caption: 'Products', emptyTitle: 'No products match', emptyText: 'Try another filter, or add a product.' })}</section>`;
  }

  /* ---------------------------------------------------------------- inventory */
  const MOVES = { receive: 'Received', opening: 'Opening stock', damage: 'Damaged', write_off: 'Written off', count_correction: 'Count correction', reserve: 'Reserved', unreserve: 'Reservation released', allocate: 'Allocated', ship: 'Shipped', return: 'Returned', release: 'Released', quarantine: 'Quarantined', adjust: 'Adjustment' };
  const moveLabel = k => MOVES[k] || String(k || '').replaceAll('_', ' ').replace(/^./, c => c.toUpperCase());
  function inventory(o) {
    const p = q(), pf = p.get('product') || '', st = p.get('status') || '', alert = p.get('alert') || '', search = (p.get('q') || '').trim().toLowerCase(), bf = p.get('batch') || '';
    const inv = invSummary(o);
    const views = o.batches.map(batchView).filter(v => (!pf || v.b.product === pf) && (!st || v.status === st) && (!alert || (alert === 'low' ? v.low : v.expiring)) && (!search || JSON.stringify(v.b).toLowerCase().includes(search) || productName(v.b.product).toLowerCase().includes(search)));
    const anyFilter = st || alert || search;
    const opts = o.products.map(x => [x.id, x.name]);
    const create = `<details class="op-card op-create" ${p.has('new') ? 'open' : ''}><summary><span>＋ Add a batch</span></summary><form data-op-form="batch"><div class="op-form-grid">${select({ name: 'product', label: 'Product', items: opts, value: pf })}${field({ name: 'id', label: 'Batch / lot number', attrs: 'maxlength="40" spellcheck="false" autocapitalize="characters"', required: true })}${field({ name: 'manufactured', label: 'Manufacturing date', type: 'date' })}${field({ name: 'expiry', label: 'Expiry date', type: 'date', required: true })}${field({ name: 'quantity', label: 'Opening quantity (units)', value: 0, type: 'number', attrs: 'min="0" step="1" inputmode="numeric"', required: true })}${field({ name: 'low_stock_threshold', label: 'Low-stock alert at (units)', value: 20, type: 'number', attrs: 'min="0" step="1" inputmode="numeric"' })}${field({ name: 'location', label: 'Storage location', value: 'Main warehouse', attrs: 'maxlength="120"' })}${area({ name: 'remarks', label: 'Opening-stock note', rows: 2, attrs: 'minlength="5" maxlength="1000"', required: true })}</div><p class="op-help">New batches start quarantined. Release them once the batch evidence is checked.</p>${formEnd('Create batch')}</form></details>`;
    const alerts = (inv.low_stock_batches || inv.expiring_batches) ? `<div class="op-alerts">${inv.low_stock_batches ? `<a class="op-alert" href="/ops/inventory?alert=low"><strong>${inv.low_stock_batches}</strong> low-stock batch${inv.low_stock_batches === 1 ? '' : 'es'} →</a>` : ''}${inv.expiring_batches ? `<a class="op-alert" href="/ops/inventory?alert=expiring"><strong>${inv.expiring_batches}</strong> expiring within 60 days →</a>` : ''}</div>` : '';
    const filters = tools({ statuses: ['released', 'quarantined', 'expired'], clear: 'q,status,product,alert,page,mpage,batch', extra: select({ name: 'product', label: 'Product', items: [['', 'All products'], ...opts], value: pf, id: 'op-inv-product' }) + select({ name: 'alert', label: 'Alerts', items: [['', 'Any'], ['low', 'Low stock'], ['expiring', 'Expiring ≤ 60 days']], value: alert, id: 'op-inv-alert' }) });
    const groups = o.products.filter(x => !pf || x.id === pf).map(prod => {
      const bs = views.filter(v => v.b.product === prod.id).sort((a, b) => num(a.b.expiry) - num(b.b.expiry));
      if (!bs.length && anyFilter) return '';
      const t = k => bs.reduce((n, v) => n + v[k], 0);
      const flags = `${bs.some(v => v.low) ? tag('Low stock', 'warning') : ''}${bs.some(v => v.expiring) ? tag('Expiring', 'warning') : ''}`;
      const rows = bs.map(v => [
        `<strong>${h(v.b.id)}</strong><small>${h(v.location)}</small>${v.damaged ? `<small>${fmt(v.damaged)} damaged recorded</small>` : ''}${v.returned ? `<small>${fmt(v.returned)} returns pending</small>` : ''}`,
        `${day(v.b.expiry)}${v.expiring ? '<small class="op-warn-text">Within 60 days</small>' : ''}`,
        fmt(v.onHand), fmt(v.reserved),
        `<strong>${fmt(v.sellable)}</strong><small>Alert at ${fmt(v.threshold)}${v.setThreshold ? '' : ' (default)'}</small>`,
        v.held ? `${fmt(v.held)}<small>${v.heldReason}</small>` : '0',
        `${tag(v.status)}${v.low ? tag('Low', 'warning') : ''}`,
        `<div class="op-row-actions">${button('Adjust', 'batch-adjust', v.b.id, 'op-small', `aria-label="Adjust stock for ${h(v.b.id)}"`)}${button('Settings', 'batch-settings', v.b.id, 'op-small', `aria-label="Location and alert for ${h(v.b.id)}"`)}${v.b.state === 'quarantined' ? button('Release', 'batch-release', v.b.id, 'op-small') : button('Quarantine', 'batch-quarantine', v.b.id, 'op-small')}${link('Movements', `/ops/inventory?batch=${encodeURIComponent(v.b.id)}${pf ? '&product=' + encodeURIComponent(pf) : ''}`, 'op-small op-quiet')}</div>`,
      ]);
      return `<section class="op-card op-stock-group" aria-labelledby="sg-${h(prod.id)}"><header class="op-stock-head"><div><h2 id="sg-${h(prod.id)}">${h(prod.name)}</h2><small>${bs.length} batch${bs.length === 1 ? '' : 'es'} ${flags}</small></div><dl class="op-stock-totals"><div><dt>On hand</dt><dd>${fmt(t('onHand'))}</dd></div><div><dt>Reserved</dt><dd>${fmt(t('reserved'))}</dd></div><div><dt>Available</dt><dd>${fmt(t('sellable'))}</dd></div><div><dt>Not sellable</dt><dd>${fmt(t('held'))}</dd></div></dl></header>${bs.length ? table(['Batch', 'Expiry', ['On hand', 'num'], ['Reserved', 'num'], ['Available', 'num'], ['Not sellable', 'num'], 'Status', 'Actions'], rows, { size: 200, pageKey: 'bp', caption: prod.name + ' batches' }) : `<div class="op-inline-empty"><p>No batches recorded for this product.</p>${link('＋ Add a batch', '/ops/inventory?new=1&product=' + encodeURIComponent(prod.id), 'op-small')}</div>`}</section>`;
    }).join('') || empty('No batches match', 'Change or reset the filters.', link('Reset filters', '/ops/inventory'));

    const batchProduct = Object.fromEntries(o.batches.map(b => [b.id, b.product]));
    const moves = [...o.movements].filter(m => (!bf || m.batch === bf) && (!pf || batchProduct[m.batch] === pf)).sort((a, b) => num(b.created) - num(a.created));
    const ledger = `<section class="op-card op-flush" id="ledger" aria-labelledby="ledger-t"><div class="op-card-title op-pad"><div><h2 id="ledger-t">Stock movements${bf ? ' · ' + h(bf) : pf ? ' · ' + h(productName(pf)) : ''}</h2><small class="op-muted">Every receipt, reservation, shipment and correction, newest first.</small></div>${bf ? link('Show all batches', '/ops/inventory' + (pf ? '?product=' + encodeURIComponent(pf) : ''), 'op-small') : ''}</div>${table(['When', 'Batch', 'Movement', ['Change', 'num'], 'Reference', 'Note'], moves.map(m => [when(m.created), `<strong>${h(m.batch)}</strong><small>${h(productName(batchProduct[m.batch]))}</small>`, tag(moveLabel(m.kind), toneOf(m.kind)), `<span class="${num(m.quantity) < 0 ? 'op-neg' : 'op-pos'}">${num(m.quantity) > 0 ? '+' : num(m.quantity) < 0 ? '−' : ''}${fmt(Math.abs(num(m.quantity)))}</span>`, m.order_id ? `<a href="/ops/orders?order=${encodeURIComponent(m.order_id)}">${h(m.order_id)}</a>` : h(m.reference || '—'), `${h(m.reason || m.remarks || '—')}${m.actor ? `<small>${h(m.actor)}</small>` : ''}`]), { pageKey: 'mpage', caption: 'Stock movements', emptyTitle: 'No movements yet', emptyText: 'Stock changes will be listed here.' })}</section>`;

    return create + metrics([
      ['On hand', fmt(inv.on_hand), 'Physical units in stock'],
      ['Available', fmt(inv.available), 'Sellable, not reserved'],
      ['Reserved', fmt(inv.reserved), 'Unpaid holds + paid orders awaiting shipment'],
      ['Quarantined', fmt(inv.quarantined), 'Held until release', inv.quarantined ? 'warning' : ''],
      ['Expired / damaged', `${fmt(inv.expired)} / ${fmt(inv.damaged)}`, 'Not sellable', inv.expired + inv.damaged ? 'danger' : ''],
    ]) + alerts + filters + (bf ? ledger + groups : groups + ledger);
  }

  /* ---------------------------------------------------------------- orders */
  function orders(o) {
    const id = q().get('order'), order = o.orders.find(x => x.id === id);
    if (id && !order) return empty('Order not found', 'It may have been removed or the link is incomplete.', link('← All orders', '/ops/orders'));
    if (order) {
      const pay = o.payments.find(p => p.order_id === order.id);
      const canRefund = order.state === 'cancelled' && pay && pay.status === 'captured' && !['refunded', 'refunded_preview'].includes(order.refund);
      const actions = [['note', 'Add a note'], ...(order.state === 'paid' ? [['packing', 'Mark packing']] : []), ...(['paid', 'packing'].includes(order.state) ? [['shipped', 'Record shipment']] : []), ...(order.state === 'shipped' ? [['delivered', 'Mark delivered']] : []), ...(['pending', 'paid', 'packing'].includes(order.state) ? [['cancelled', 'Cancel order']] : [])];
      const c = order.contact || {};
      return `<div class="op-subnav">${link('← All orders', '/ops/orders', 'op-quiet')}</div><div class="op-two op-two-wide"><section class="op-card"><div class="op-card-title"><h2>${h(order.id)}</h2>${tag(order.state)}</div>${table(['Item', ['Qty', 'num'], ['Unit price', 'num'], ['Line total', 'num']], order.items.map(i => [h(i.name), fmt(i.quantity), cash(i.unit_price), cash(i.unit_price * i.quantity)]), { size: 100, pageKey: 'ip' })}<dl class="op-dl"><div><dt>Total</dt><dd><strong>${cash(order.total)}</strong>${order.discount ? ` · discount ${cash(order.discount)}` : ''}${order.shipping ? ` · shipping ${cash(order.shipping)}` : ''}</dd></div><div><dt>Payment</dt><dd>${tag(pay?.status || 'unknown')}${order.refund && order.refund !== 'none' ? ' ' + tag('Refund: ' + order.refund, 'danger') : ''}</dd></div><div><dt>Customer</dt><dd>${h(c.name)} · ${h(c.mobile)}${c.email ? ' · ' + h(c.email) : ''}</dd></div><div><dt>Address</dt><dd>${h([c.address, c.city, c.state, c.pincode].filter(Boolean).join(', '))}</dd></div><div><dt>Courier / tracking</dt><dd>${h(order.provider || 'Unassigned')} / ${h(order.tracking || '—')}</dd></div><div><dt>Allocated batches</dt><dd>${(order.allocations || []).map(a => `${h(a.batch)} × ${fmt(a.quantity)} <small class="op-muted">${h(a.state)}</small>`).join('<br>') || '—'}</dd></div></dl><h3 class="op-h3">Customer timeline</h3><ol class="op-timeline">${(order.history || []).map(x => `<li>${tag(x.state)}<span>${when(x.at)}</span>${x.note ? `<p>${h(x.note)}</p>` : ''}</li>`).join('')}</ol><h3 class="op-h3">Internal notes</h3>${(order.internal_notes || []).map(x => `<p class="op-note">${h(x.text)}<small>${when(x.at)}</small></p>`).join('') || '<p class="op-muted">No internal notes.</p>'}</section><section class="op-card"><h2>Next step</h2><form data-op-form="order" data-id="${h(order.id)}">${select({ name: 'state', label: 'Action', items: actions, wide: true })}<div class="op-form-grid">${field({ name: 'provider', label: 'Courier', value: order.provider || '', attrs: 'maxlength="80"' })}${field({ name: 'tracking', label: 'Tracking number', value: order.tracking || '', attrs: 'maxlength="80"' })}</div>${area({ name: 'remarks', label: 'Internal note', rows: 2, attrs: 'minlength="5" maxlength="1000"', required: true })}${area({ name: 'public_note', label: 'Update for the customer (optional)', rows: 2, attrs: 'maxlength="1000"', help: 'Shown on the customer’s order page.' })}${formEnd('Update order')}</form>${canRefund ? `<div class="op-divider"></div><h3 class="op-h3">Refund</h3><p class="op-muted">Record the full cancellation refund in this local preview. No money moves; it appears in Sales as a refund.</p>${button('Record refund', 'refund', order.id, 'op-danger')}` : ''}${notice('Recording a shipment does not book a courier.')}</section></div>`;
    }
    return tools({ statuses: ['pending', 'paid', 'packing', 'shipped', 'delivered', 'cancelled', 'expired'] }) + `<section class="op-card op-flush">${table(['Order', 'Customer', 'Status', ['Total', 'num'], 'Created', ''], filtered([...o.orders].sort((a, b) => b.created - a.created)).map(x => [`<strong>${h(x.id)}</strong>`, h(x.contact?.name), tag(x.state), cash(x.total), when(x.created), link('Open', '/ops/orders?order=' + encodeURIComponent(x.id), 'op-small', `aria-label="Open order ${h(x.id)}"`)]), { caption: 'Orders', emptyTitle: 'No orders match', emptyText: 'Change the filters to see more orders.' })}</section>`;
  }

  /* ---------------------------------------------------------------- sales */
  function niceStep(x) { if (!(x > 0)) return 1; const p = Math.pow(10, Math.floor(Math.log10(x))), f = x / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; }
  function chart(periods, title) {
    const n = periods.length; if (!n) return '';
    const W = Math.max(640, n * 26), H = 250, L = 70, R = 12, T = 14, B = 42;
    const vals = periods.map(x => num(x.net_sales));
    let max = Math.max(0, ...vals), min = Math.min(0, ...vals); if (max === min) max = min + 1;
    const step = niceStep((max - min) / 4); max = Math.ceil(max / step) * step; min = Math.floor(min / step) * step;
    const y = v => T + (max - v) / (max - min) * (H - T - B), bw = (W - L - R) / n, every = Math.ceil(n / Math.floor((W - L - R) / 72));
    let g = '';
    for (let v = min; v <= max + step / 2; v += step) g += `<line class="op-chart-grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="op-chart-axis" x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${h(cash(v))}</text>`;
    const bars = periods.map((p, i) => { const v = num(p.net_sales), x = L + i * bw + bw * .16, top = y(Math.max(v, 0)), hgt = Math.max(1, Math.abs(y(v) - y(0))); return `<rect class="op-chart-bar${v < 0 ? ' is-neg' : ''}" x="${x.toFixed(1)}" y="${top.toFixed(1)}" width="${(bw * .68).toFixed(1)}" height="${hgt.toFixed(1)}" rx="3"><title>${h(p.label || p.period)}: ${h(cash(v))} net · ${fmt(p.orders)} orders · ${fmt(p.units)} units</title></rect>${i % every === 0 ? `<text class="op-chart-axis" x="${(L + i * bw + bw / 2).toFixed(1)}" y="${H - B + 18}" text-anchor="middle">${h(p.label || p.period)}</text>` : ''}`; }).join('');
    return `<div class="op-chart-wrap"><svg class="op-chart" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${h(title)}. Values are listed in the table below.">${g}<line class="op-chart-zero" x1="${L}" x2="${W - R}" y1="${y(0)}" y2="${y(0)}"/>${bars}</svg></div>`;
  }
  function salesHref(over) { const p = q(), s = records?.sales || {}; const v = { group: p.get('group') || s.group || 'day', from: p.get('from') || s.from || '', to: p.get('to') || s.to || '', product: p.get('product') || '', ...over }; const u = new URLSearchParams(); Object.entries(v).forEach(([k, x]) => { if (x) u.set(k, x); }); return '/ops/sales?' + u; }
  function sales(o) {
    const s = o.sales, p = q();
    const group = p.get('group') || s?.group || 'day', from = p.get('from') || s?.from || '', to = p.get('to') || s?.to || '', prod = p.get('product') || '';
    const today = istToday();
    const presets = [['Last 7 days', addDays(today, -6), today], ['Last 30 days', addDays(today, -29), today], ['This month', today.slice(0, 8) + '01', today], ['Last 90 days', addDays(today, -89), today], ['This year', today.slice(0, 5) + '01-01', today]];
    const head = `<div class="op-sales-bar"><nav class="op-seg" aria-label="Group sales by">${[['day', 'Day'], ['week', 'Week'], ['month', 'Month']].map(([g, l]) => `<a href="${h(salesHref({ group: g }))}" ${g === group ? 'aria-current="true" class="is-on"' : ''}>${l}</a>`).join('')}</nav><div class="op-presets" aria-label="Quick date ranges">${presets.map(([l, f, t]) => `<a href="${h(salesHref({ from: f, to: t }))}" class="${f === from && t === to ? 'is-on' : ''}">${l}</a>`).join('')}</div></div><form class="op-tools" data-op-form="sales-filter">${field({ name: 'from', label: 'From', value: from, type: 'date', id: 'op-s-from', attrs: `max="${today}"` })}${field({ name: 'to', label: 'To', value: to, type: 'date', id: 'op-s-to', attrs: `max="${today}"` })}${select({ name: 'product', label: 'Product', items: [['', 'All products'], ...o.products.map(x => [x.id, x.name])], value: prod, id: 'op-s-product' })}<div class="op-tools-actions"><button class="op-btn op-primary" type="submit">Apply</button>${link('Reset', '/ops/sales?group=' + group)}</div></form>`;
    const foot = `<p class="op-footnote">Paid orders counted at payment capture, in India time (IST). Weeks start on Monday. Pending checkouts are not sales. Amounts are whole rupees. Net sales are gross sales minus discounts, plus shipping, minus completed refunds. Refunded units are separate from gross units sold.</p>`;
    if (!s) return head + empty('Sales figures aren’t available', 'They load from the server for the selected range. Try Refresh.', button('Refresh', 'refresh'));
    const T = s.totals || {}, periods = s.periods || [], prods = [...(s.products || [])].sort((a, b) => num(b.net_sales) - num(a.net_sales));
    const gl = { day: 'day', week: 'week', month: 'month' }[s.group] || 'period';
    const periodTable = `<div class="op-table-wrap op-scroll-y"><table class="op-table"><caption class="sr-only">Sales by ${gl}</caption><thead><tr><th scope="col">${gl[0].toUpperCase() + gl.slice(1)}</th><th scope="col" class="op-num">Orders</th><th scope="col" class="op-num">Units</th><th scope="col" class="op-num">Gross</th><th scope="col" class="op-num">Discounts</th><th scope="col" class="op-num">Shipping</th><th scope="col" class="op-num">Refunds</th><th scope="col" class="op-num">Net sales</th></tr></thead><tbody>${periods.map(x => `<tr><th scope="row">${h(x.label || x.period)}</th><td class="op-num">${fmt(x.orders)}</td><td class="op-num">${fmt(x.units)}</td><td class="op-num">${cash(x.gross_sales)}</td><td class="op-num">${cash(x.discounts)}</td><td class="op-num">${cash(x.shipping)}</td><td class="op-num">${cash(x.refunds)}</td><td class="op-num"><strong>${cash(x.net_sales)}</strong></td></tr>`).join('') || `<tr><td colspan="8">No paid orders in this range.</td></tr>`}</tbody><tfoot><tr><th scope="row">Total</th><td class="op-num">${fmt(T.orders)}</td><td class="op-num">${fmt(T.units)}</td><td class="op-num">${cash(T.gross_sales)}</td><td class="op-num">${cash(T.discounts)}</td><td class="op-num">${cash(T.shipping)}</td><td class="op-num">${cash(T.refunds)}</td><td class="op-num"><strong>${cash(T.net_sales)}</strong></td></tr></tfoot></table></div>`;
    const productTable = `<div class="op-table-wrap"><table class="op-table"><caption class="sr-only">Sales by product</caption><thead><tr><th scope="col">Product</th><th scope="col" class="op-num">Units</th><th scope="col" class="op-num">Gross</th><th scope="col" class="op-num">Discounts</th><th scope="col" class="op-num">Refunds</th><th scope="col" class="op-num">Net sales</th><th scope="col" class="op-num">Share</th></tr></thead><tbody>${prods.map(x => `<tr><th scope="row">${h(x.name || productName(x.id))}</th><td class="op-num">${fmt(x.units)}</td><td class="op-num">${cash(x.gross_sales)}</td><td class="op-num">${cash(x.discounts)}</td><td class="op-num">${cash(x.refunds)}</td><td class="op-num"><strong>${cash(x.net_sales)}</strong></td><td class="op-num">${num(T.net_sales) > 0 ? Math.round(num(x.net_sales) / num(T.net_sales) * 100) + '%' : '—'}</td></tr>`).join('') || `<tr><td colspan="7">No product sales in this range.</td></tr>`}</tbody></table></div>`;
    return head + `<p class="op-range">${h(day(Date.parse(s.from + 'T12:00:00+05:30') / 1000))} – ${h(day(Date.parse(s.to + 'T12:00:00+05:30') / 1000))}${prod ? ' · ' + h(productName(prod)) : ' · All products'}</p>` + metrics([
      ['Net sales', cash(T.net_sales), 'Includes shipping; after discounts and refunds'],
      ['Gross sales', cash(T.gross_sales), `Shipping charged ${cash(T.shipping)}`],
      ['Orders', fmt(T.orders), num(T.orders) ? `Average ${cash(num(T.net_sales) / num(T.orders))}` : 'Paid orders'],
      ['Units', fmt(T.units), 'Units sold'],
      ['Discounts / refunds', `${cash(T.discounts)} / ${cash(T.refunds)}`, 'Deducted from gross', num(T.refunds) ? 'danger' : ''],
    ]) + `<section class="op-card" aria-labelledby="sc-t"><div class="op-card-title"><h2 id="sc-t">Net sales by ${gl}</h2>${button('Export periods CSV', 'sales-export-periods', '', 'op-small')}</div>${periods.length ? chart(periods, `Net sales by ${gl}`) : ''}${periodTable}</section><section class="op-card" aria-labelledby="sp-t"><div class="op-card-title"><h2 id="sp-t">By product</h2>${button('Export products CSV', 'sales-export-products', '', 'op-small')}</div>${productTable}</section>` + foot;
  }

  /* ---------------------------------------------------------------- support, channels, flags */
  function cases(o) {
    return tools({ statuses: ['open', 'investigating', 'escalated', 'resolved'] }) + (filtered(o.cases).map(c => `<details class="op-card op-case"><summary><span class="op-case-title"><strong>${h(c.subject || c.kind)}</strong><small>${h(c.id)} · ${when(c.created)}</small></span><span>${tag(c.state)}${c.kind === 'safety' ? tag('Safety priority', 'danger') : ''}</span></summary><p class="op-case-message">${lines(c.message)}</p><dl class="op-dl"><div><dt>Queue</dt><dd>${h(c.queue || 'General')}</dd></div><div><dt>Order / lot</dt><dd>${c.order_id ? `<a href="/ops/orders?order=${encodeURIComponent(c.order_id)}">${h(c.order_id)}</a>` : '—'} ${h(c.lot || '')}</dd></div><div><dt>Contact</dt><dd>${h([c.contact?.name, c.contact?.email, c.contact?.mobile].filter(Boolean).join(' · ') || '—')}</dd></div></dl>${(c.history || []).length ? `<ol class="op-timeline">${c.history.map(x => `<li>${tag(x.state)}<span>${when(x.at)}</span>${x.note || x.message ? `<p>${h(x.note || x.message)}</p>` : ''}</li>`).join('')}</ol>` : ''}${(c.internal || []).map(n => `<p class="op-note"><strong>Internal:</strong> ${h(n.text)}<small>${when(n.at)}</small></p>`).join('')}${(c.media || []).map((m, i) => link('Attachment ' + (i + 1) + ' ↗', '/api/review-media/' + m, 'op-small', 'target="_blank" rel="noopener"')).join('')}<form data-op-form="case" data-id="${h(c.id)}"><div class="op-form-grid">${select({ name: 'state', label: 'Status', items: ['open', 'investigating', 'escalated', 'resolved'].map(s => [s, s[0].toUpperCase() + s.slice(1)]), value: c.state })}<span></span>${area({ name: 'internal_note', label: 'Internal note (admins only)', rows: 2, attrs: 'maxlength="2000"' })}${area({ name: 'note', label: 'Reply to the customer', rows: 3, attrs: 'maxlength="2000"' })}</div>${formEnd('Save & reply')}</form></details>`).join('') || empty('No cases', 'Support and safety submissions will appear here.'));
  }
  function channels(o) { return notice('Provider accounts must be set up before real payments, courier booking, messages or marketplace sync can run.') + `<div class="op-grid3">${(o.integrations || []).map(i => `<section class="op-card"><div class="op-card-title"><h2>${h(i.name)}</h2>${tag(i.state)}</div><p class="op-muted">${h(i.description)}</p></section>`).join('')}</div>`; }
  function flags(o) {
    const labels = { ingredient_library: ['Ingredient library', 'Show the Learn knowledge hub.'], reviews: ['Review submissions', 'Let eligible customers submit product reviews.'], questions: ['Question submissions', 'Let customers submit product questions.'], checkout_enabled: ['Checkout', 'Let customers create new orders. Existing orders stay available.'] };
    return `<section class="op-card">${Object.entries(labels).map(([key, [name, d]]) => `<div class="op-flag"><div><h2>${name}</h2><p>${d}</p></div><div>${tag(o.flags[key] ? 'Enabled' : 'Paused')}${button(o.flags[key] ? 'Pause' : 'Enable', 'flag', key, o.flags[key] ? '' : 'op-primary', `aria-label="${o.flags[key] ? 'Pause' : 'Enable'} ${name}"`)}</div></div>`).join('')}</section>`;
  }
  const account = () => `<section class="op-card op-narrow"><h2>Change your password</h2><form data-op-form="password">${field({ name: 'current_password', label: 'Current password', type: 'password', attrs: 'autocomplete="current-password"', required: true })}${field({ name: 'new_password', label: 'New password', type: 'password', attrs: 'autocomplete="new-password" minlength="12"', required: true, help: 'At least 12 characters.' })}${field({ name: 'confirm_password', label: 'Confirm new password', type: 'password', attrs: 'autocomplete="new-password" minlength="12"', required: true })}${formEnd('Change password & sign out')}</form></section>`;

  /* ---------------------------------------------------------------- shell */
  function render(o, user, reviewsRenderer) {
    if (user?.role !== 'admin') return login();
    records = o;
    const tab = location.pathname.split('/')[2] || 'overview', found = TABS.find(t => t[0] === tab);
    const pid = q().get('product');
    const titles = { products: pid ? (pid === 'new' ? 'Add a product' : 'Edit product') : 'Products', orders: q().get('order') ? 'Order' : 'Orders', account: 'Account', analytics: 'Sales' };
    let content;
    try {
      content = ({ overview, products, inventory, orders, sales, cases, channels, flags, account })[tab]?.(o)
        ?? (tab === 'reviews' ? reviewsRenderer(o, false)
          : tab === 'lots' ? window.BCCLotsOps.render(o, false)
          : tab === 'analytics' ? empty('Analytics has moved', 'Sales now shows period totals, products and refunds.', link('Open Sales', '/ops/sales', 'op-primary'))
          : empty('Page not found', 'Choose a section from the menu.'));
    } catch (err) { console.error(err); content = empty('This page couldn’t load', err.message || 'Try Refresh.', button('Refresh', 'refresh')); }
    const badge = { orders: o.orders.filter(x => ['paid', 'packing'].includes(x.state)).length, cases: o.cases.filter(x => x.state !== 'resolved' && x.kind === 'safety').length };
    const pageAction = tab === 'products' && !pid ? link('＋ Add product', '/ops/products?product=new', 'op-primary') : tab === 'inventory' ? link('＋ Add batch', '/ops/inventory?new=1' + (q().get('product') ? '&product=' + encodeURIComponent(q().get('product')) : ''), 'op-primary') : '';
    const nav = NAV.map(([group, items]) => `${group ? `<p class="op-nav-label">${group}</p>` : ''}${items.map(([id, label, icon]) => `<a class="${id === tab ? 'is-active' : ''}" href="/ops${id === 'overview' ? '' : '/' + id}" ${id === tab ? 'aria-current="page"' : ''}><span class="op-nav-icon" aria-hidden="true">${icon}</span><span>${label}</span>${badge[id] ? `<b aria-label="${badge[id]} need attention">${badge[id]}</b>` : ''}</a>`).join('')}`).join('');
    return `<div class="op-layout"><a class="op-skip" href="#main">Skip to content</a><aside class="op-sidebar"><a class="op-brand" href="/ops" aria-label="Operations overview"><img src="/web/media/brand-horizontal.svg" alt="Body Café Co."><span>Operations</span></a><nav class="op-nav" aria-label="Operations sections">${nav}</nav><div class="op-sidebar-bottom">${link('View storefront ↗', '/?design=b', 'op-quiet op-block')}<a href="/ops/account" class="op-owner" ${tab === 'account' ? 'aria-current="page"' : ''}><span aria-hidden="true">BC</span><div><strong>Store admin</strong><small>Account & password</small></div></a>${button('Sign out', 'logout', '', 'op-block')}</div></aside><main id="main" class="op-main" tabindex="-1"><header class="op-topbar"><span class="op-crumb">Operations <i aria-hidden="true">/</i> ${h(found?.[1] || titles[tab] || 'Account')}</span><div class="op-topbar-actions">${button('Refresh', 'refresh', '', 'op-small')}<span class="op-mobile-account">${link('Account', '/ops/account', 'op-small')}${button('Sign out', 'logout', '', 'op-small')}</span></div></header><div class="op-content"><div class="op-page-title"><h1>${h(titles[tab] || found?.[1] || 'Account')}</h1>${pageAction}</div>${content}</div></main></div>`;
  }

  /* ---------------------------------------------------------------- dialogs & mutations */
  function modal(title, body, opener) {
    document.getElementById('op-dialog')?.remove();
    const d = document.createElement('dialog'); d.id = 'op-dialog'; d.className = 'op-dialog'; d.setAttribute('aria-labelledby', 'op-dialog-t');
    d.innerHTML = `<div class="op-card-title"><h2 id="op-dialog-t">${h(title)}</h2>${button('Close', 'close-dialog', '', 'op-small')}</div>${body}`;
    document.body.appendChild(d);
    d.addEventListener('close', () => { if (opener && opener.isConnected) opener.focus(); d.remove(); });
    d.showModal();
    d.querySelector('input:not([type=hidden]),select,textarea')?.focus();
  }
  async function mutate(action, data) {
    await A().api('/admin/' + action, data);
    dirty = false;
    document.getElementById('op-dialog')?.close();
    await A().refreshCatalog(); await A().rerender(); A().toast('Changes saved.');
  }
  const batchById = id => records.batches.find(b => b.id === id);
  function actionModal(action, id, opener) {
    const note = (label = 'Note', required = true) => area({ name: 'remarks', label, rows: 2, attrs: `${required ? 'minlength="5"' : ''} maxlength="1000"`, required });
    const form = (op, body, submit, extra = '') => `<form data-op-form="action" data-action="${op}" data-id="${h(id)}" ${extra}>${body}${formEnd(submit)}</form>`;
    if (action === 'batch-adjust') {
      const v = batchView(batchById(id));
      return modal('Adjust stock · ' + id, form('batch_adjust', `<p class="op-modal-summary">${h(productName(v.b.product))} · on hand <strong>${fmt(v.onHand)}</strong> · reserved ${fmt(v.reserved)} · available ${fmt(v.sellable)}</p>${select({ name: 'kind', label: 'What happened?', items: [['receive', 'Received more stock'], ['damage', 'Units damaged'], ['write_off', 'Write off units'], ['count_correction', 'Physical count correction']], attrs: 'data-adjust-kind', wide: true })}${field({ name: 'units', label: 'Units received', type: 'number', attrs: 'min="0" step="1" inputmode="numeric" data-adjust-units', required: true, id: 'op-adjust-units' })}<p class="op-adjust-preview" data-adjust-preview role="status"></p>${note('Reason')}`, 'Apply adjustment', `data-on-hand="${v.onHand}" data-free-stock="${num(v.b.available)}"`), opener);
    }
    if (action === 'batch-settings') {
      const v = batchView(batchById(id));
      return modal('Batch settings · ' + id, form('batch_settings', `<div class="op-form-grid">${field({ name: 'location', label: 'Storage location', value: v.location, attrs: 'maxlength="120"', required: true })}${field({ name: 'low_stock_threshold', label: 'Low-stock alert at (units)', value: v.setThreshold ? v.threshold : '', type: 'number', attrs: 'min="0" step="1" inputmode="numeric"', required: true })}</div>${note('Note')}`, 'Save settings'), opener);
    }
    if (action === 'batch-release') return modal('Release batch · ' + id, form('batch_release', `<p class="op-muted">Released units can be allocated to new orders straight away.</p><label class="op-check"><input type="checkbox" name="evidence_confirmed" required><span>I have checked the batch evidence and it is eligible for release.</span></label>${note('Release note')}`, 'Release batch'), opener);
    if (action === 'batch-quarantine') return modal('Quarantine batch · ' + id, form('quarantine', `<p class="op-muted">Quarantine stops new allocation and shipping from this batch immediately. Customers don’t see it.</p>${note('Reason')}`, 'Quarantine batch', ''), opener);
    if (action === 'product-publish') {
      if (dirty) throw Error('Save your edits as a draft before publishing.');
      const p = records.products.find(x => x.id === id), d = p.draft || p;
      if (!visibleImages(d.gallery).length) throw Error('Publishing needs at least one visible image in the saved draft.');
      return modal('Publish ' + p.name, form('product_publish', `<p class="op-muted">The saved draft goes live on the website now. ${visibleImages(d.gallery).length} image${visibleImages(d.gallery).length === 1 ? '' : 's'} will be shown.</p>${note('Change note')}`, 'Publish now', `data-version="${h(p.edit_version || 0)}"`), opener);
    }
    if (action === 'product-archive') { if (dirty) throw Error('Save or discard your edits first.'); const p = records.products.find(x => x.id === id); return modal('Hide ' + p.name, form('product_archive', `<p class="op-muted">The product page and cards are removed from the website. Orders and records are kept.</p>${note('Reason')}`, 'Hide product'), opener); }
    if (action === 'refund') {
      const o = records.orders.find(x => x.id === id), max = Math.max(0, num(o.total) - num(o.refunded_amount));
      return modal('Record refund · ' + id, form('refund', `${field({ name: 'amount', label: 'Refund amount (₹)', value: max, type: 'number', attrs: `readonly min="1" max="${max}" step="1" inputmode="numeric"`, required: true, help: `Order total ${cash(o.total)}.` })}${note('Reason')}`, 'Record refund'), opener);
    }
    if (action === 'flag') { const on = !!records.flags[id]; return modal((on ? 'Pause ' : 'Enable ') + id.replaceAll('_', ' '), form('flags_update', `<input type="hidden" name="key" value="${h(id)}"><input type="hidden" name="value" value="${!on}"><p class="op-muted">${on ? 'Enabled → paused' : 'Paused → enabled'}. This applies straight away.</p>${note('Note')}`, on ? 'Pause' : 'Enable'), opener); }
  }
  function adjustPreview(form) {
    const kind = form.querySelector('[data-adjust-kind]')?.value, units = parseInt(form.querySelector('[data-adjust-units]')?.value, 10), onHand = num(form.dataset.onHand);
    const label = form.querySelector('label[for="op-adjust-units"]'), out = form.querySelector('[data-adjust-preview]');
    if (label) label.firstChild.textContent = { receive: 'Units received', damage: 'Units damaged', write_off: 'Units to write off', count_correction: 'Counted units on hand' }[kind] + ' ';
    if (!out) return;
    if (!Number.isInteger(units)) { out.textContent = ''; return; }
    const delta = kind === 'receive' ? units : kind === 'count_correction' ? units - onHand : -units;
    out.textContent = `Change ${delta > 0 ? '+' : delta < 0 ? '−' : ''}${fmt(Math.abs(delta))} · on hand becomes ${fmt(kind === 'damage' ? onHand : onHand + delta)}${kind === 'damage' ? ' · damaged units stay in physical stock and cannot sell' : ''}`;
    out.classList.toggle('is-neg', delta < 0);
  }
  function buildAction(f, data, requestId) {
    const op = f.dataset.action, id = f.dataset.id, base = { id, remarks: (data.remarks || '').trim(), request_id: requestId };
    if (op === 'batch_adjust') {
      const units = parseInt(data.units, 10), onHand = num(f.dataset.onHand);
      if (!Number.isInteger(units) || units < 0) throw Error('Enter a whole number of units.');
      let quantity = data.kind === 'receive' ? units : data.kind === 'count_correction' ? units - onHand : -units;
      if (data.kind !== 'count_correction' && units < 1) throw Error('Enter at least 1 unit.');
      if (data.kind === 'count_correction' && quantity === 0) throw Error('The count matches the recorded on-hand quantity. Nothing to correct.');
      if (quantity < 0 && onHand + quantity < 0) throw Error('That would take on-hand stock below zero.');
      return { ...base, quantity, kind: data.kind };
    }
    if (op === 'batch_settings') return { ...base, location: (data.location || '').trim(), low_stock_threshold: parseInt(data.low_stock_threshold, 10) };
    if (op === 'batch_release') return { ...base, evidence_confirmed: data.evidence_confirmed === 'on' };
    if (op === 'quarantine') return { ...base, batch: id, reason: base.remarks };
    if (op === 'product_publish') return { ...base, version: Number(f.dataset.version) };
    if (op === 'refund') { const amount = parseInt(data.amount, 10); if (!(amount >= 1)) throw Error('Enter a refund amount of at least ₹1.'); return { ...base, amount }; }
    if (op === 'flags_update') return { ...base, key: data.key, value: data.value === 'true' };
    return base;
  }

  /* ---------------------------------------------------------------- product editor behaviour */
  function showSection(form, sid, focus) {
    form.querySelectorAll('[role=tab]').forEach(t => { const on = t.dataset.id === sid; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
    form.querySelectorAll('[role=tabpanel]').forEach(p => { p.hidden = p.id !== 'pp-' + sid; });
    const u = new URL(location.href); u.searchParams.set('section', sid); history.replaceState(history.state, '', u.pathname + u.search);
  }
  function productFromForm(f) {
    const v = k => { const el = f.elements.namedItem(k); return el && 'value' in el ? String(el.value).trim() : ''; };
    const product = Object.fromEntries(SCALARS.map(k => [k, v(k)]));
    product.price = Number(v('price'));
    product.gallery = galleryFromForm(f);
    product.faqs = filledRows(rowsFrom(f, '[data-faq-row]', ['question', 'answer']), ['question', 'answer']);
    product.sources = filledRows(rowsFrom(f, '[data-source-row]', ['title', 'url']), ['title', 'url']);
    product.related_product_ids = [...f.querySelectorAll('[name=related]:checked')].map(x => x.value).slice(0, 6);
    return product;
  }
  function invalid(f, el, msg) {
    const panel = el.closest('[role=tabpanel]');
    if (panel?.hidden) showSection(f, panel.id.slice(3));
    if (msg) el.setCustomValidity(msg);
    el.reportValidity(); el.focus();
    if (msg) el.addEventListener('input', () => el.setCustomValidity(''), { once: true });
    return false;
  }
  function validateProduct(f, p) {
    const bad = [...f.elements].find(el => el.willValidate && !el.checkValidity());
    if (bad) return invalid(f, bad);
    if (p.gallery.length > 12) throw Error('Use up to 12 images, including hidden ones.');
    const faq = [...f.querySelectorAll('[data-faq-row]')].find(r => { const a = r.querySelector('[data-k=question]').value.trim(), b = r.querySelector('[data-k=answer]').value.trim(); return !!a !== !!b; });
    if (faq) { const el = faq.querySelector('[data-k=question]').value.trim() ? faq.querySelector('[data-k=answer]') : faq.querySelector('[data-k=question]'); return invalid(f, el, 'Each question needs an answer.'); }
    const src = [...f.querySelectorAll('[data-source-row]')].find(r => { const t = r.querySelector('[data-k=title]').value.trim(), u = r.querySelector('[data-k=url]').value.trim(); return (t || u) && (!t || !/^https:\/\/\S+$/.test(u)); });
    if (src) { const t = src.querySelector('[data-k=title]'); return invalid(f, t.value.trim() ? src.querySelector('[data-k=url]') : t, t.value.trim() ? 'Use a full https:// link.' : 'Add a title for this source.'); }
    const checks = f.elements.namedItem('ingredient_checks');
    if (checks && checks.value.split('\n').some(l => l.trim() && !l.includes('|'))) return invalid(f, checks, 'Write each line as: Title | explanation');
    if (p.faqs.length > 20 || p.sources.length > 20) throw Error('Use up to 20 questions and 20 sources.');
    return true;
  }
  function refreshCounts(f) {
    const p = productFromForm(f);
    SECTIONS.forEach(s => { const el = f.querySelector(`[data-count="${s.id}"]`); if (el) el.textContent = sectionCount(s, p); });
  }
  function rerenderGallery(f, gallery, focusSel) {
    document.getElementById('op-gallery').innerHTML = galleryRows(gallery);
    dirty = true; refreshCounts(f);
    if (!focusSel) return;
    const el = document.querySelector(focusSel);
    (el && !el.disabled ? el : el?.closest('[data-gallery-row]')?.querySelector('input:not(:disabled),button:not(:disabled)') || document.getElementById('op-image-upload'))?.focus();
  }
  function rerenderRepeat(f, kind, mutateList) {
    const isFaq = kind === 'faq', keys = isFaq ? ['question', 'answer'] : ['title', 'url'];
    const list = rowsFrom(f, isFaq ? '[data-faq-row]' : '[data-source-row]', keys); mutateList(list);
    const box = document.getElementById(isFaq ? 'op-faqs' : 'op-sources');
    box.innerHTML = isFaq ? faqRows(list) : sourceRows(list);
    const add = f.querySelector(`[data-op="${kind}-add"]`); if (add) add.disabled = list.length >= 20;
    dirty = true; refreshCounts(f);
    return box;
  }
  function previewModal(id, opener) {
    const p = records.products.find(x => x.id === id).draft, shown = visibleImages(p.gallery);
    const blocks = SECTIONS.filter(s => s.fields).map(s => { const items = s.fields.filter(f => String(p[f.name] || '').trim()); return items.length ? `<h3 class="op-h3">${s.label}</h3><dl class="op-dl">${items.map(f => `<div><dt>${h(f.label)}</dt><dd>${lines(p[f.name])}</dd></div>`).join('')}</dl>` : ''; }).join('');
    modal('Saved draft preview', `<div class="op-draft-preview"><div class="op-draft-images">${shown.map((g, i) => `<figure><img src="${h(g.src)}" alt="${h(g.alt)}"><figcaption><strong>${i + 1}</strong> ${h(i === 0 ? 'Card' : i === 1 ? 'Hover' : 'Gallery')}${g.caption ? ' · ' + h(g.caption) : ''}</figcaption></figure>`).join('') || '<p class="op-muted">No visible images.</p>'}</div><p class="op-eyebrow">${h(p.category)} · ${h(p.format)}</p><h3 class="op-draft-name">${h(p.name)}</h3><p>${h(p.subtitle)}</p><p><strong>${cash(p.price)}</strong>${p.pack_size ? ' · ' + h(p.pack_size) : ''}</p>${blocks}${(p.faqs || []).length ? `<h3 class="op-h3">FAQs</h3><dl class="op-dl">${p.faqs.map(x => `<div><dt>${h(x.question)}</dt><dd>${lines(x.answer)}</dd></div>`).join('')}</dl>` : ''}${(p.sources || []).length ? `<h3 class="op-h3">Sources</h3><ol>${p.sources.map(x => `<li><a href="${h(x.url)}" target="_blank" rel="noopener">${h(x.title)}</a></li>`).join('')}</ol>` : ''}${(p.related_product_ids || []).length ? `<h3 class="op-h3">Related</h3><p>${p.related_product_ids.map(r => h(productName(r))).join(', ')}</p>` : ''}</div>`, opener);
  }
  function exportCurrent() {
    const tab = location.pathname.split('/')[2];
    if (tab === 'inventory') {
      const rows = records.batches.map(batchView).map(v => [productName(v.b.product), v.b.product, v.b.id, v.location, v.b.expiry ? new Date(v.b.expiry * 1000).toISOString().slice(0, 10) : '', v.onHand, v.reserved, v.sellable, v.held, v.heldReason, v.damaged, v.threshold, v.status]);
      return downloadCSV('body-cafe-inventory.csv', ['Product', 'Product ID', 'Batch', 'Location', 'Expiry', 'On hand', 'Reserved', 'Available', 'Not sellable', 'Reason', 'Damaged', 'Low-stock alert', 'Status'], rows);
    }
    const source = { products: records.products.map(p => ({ ...p, state: p.draft ? 'draft' : p.published ? 'published' : 'hidden' })), orders: records.orders, cases: records.cases }[tab] || [];
    const list = filtered(source), keys = [...new Set(list.flatMap(Object.keys))].filter(k => !['draft', 'data', 'internal_notes', 'internal'].includes(k));
    downloadCSV('body-cafe-' + tab + '.csv', keys, list.map(x => keys.map(k => x[k])));
  }
  function exportSales(kind) {
    const s = records.sales; if (!s) throw Error('Sales figures aren’t loaded.');
    const name = `body-cafe-sales-${kind}-${s.group}-${s.from}-to-${s.to}.csv`, T = s.totals || {};
    if (kind === 'periods') return downloadCSV(name, ['Period', 'Label', 'Orders', 'Units', 'Gross sales (INR)', 'Discounts (INR)', 'Shipping (INR)', 'Refunds (INR)', 'Net sales (INR)'], [...(s.periods || []).map(p => [p.period, p.label, p.orders, p.units, p.gross_sales, p.discounts, p.shipping, p.refunds, p.net_sales]), ['Total', '', T.orders, T.units, T.gross_sales, T.discounts, T.shipping, T.refunds, T.net_sales]]);
    downloadCSV(name, ['Product ID', 'Product', 'Units', 'Gross sales (INR)', 'Discounts (INR)', 'Refunds (INR)', 'Net sales (INR)'], (s.products || []).map(p => [p.id, p.name, p.units, p.gross_sales, p.discounts, p.refunds, p.net_sales]));
  }

  /* ---------------------------------------------------------------- events */
  document.addEventListener('submit', async e => {
    const f = e.target; if (!(f instanceof HTMLFormElement) || !f.matches('[data-op-form]')) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const data = Object.fromEntries(new FormData(f)), kind = f.dataset.opForm, submit = f.querySelector('[type=submit]'), box = f.querySelector('.op-error');
    if (box) box.textContent = '';
    const requestId = f.dataset.requestId || (f.dataset.requestId = uuid());
    if (submit) submit.disabled = true;
    try {
      if (kind === 'filter') { const u = new URL(location.href); (f.dataset.clear || 'q,status,page').split(',').forEach(k => u.searchParams.delete(k)); Object.entries(data).forEach(([k, v]) => { if (v) u.searchParams.set(k, v); }); A().navigate(u.pathname + u.search); return; }
      if (kind === 'sales-filter') { if (data.from && data.to && data.from > data.to) throw Error('The start date must be on or before the end date.'); A().navigate(salesHref({ from: data.from, to: data.to, product: data.product })); return; }
      if (kind === 'login') { await A().api('/admin/login', data); f.reset(); await A().session(); await A().rerender(); return; }
      if (kind === 'password') { if (data.new_password !== data.confirm_password) throw Error('The new passwords don’t match.'); await A().api('/admin/password', data); f.reset(); await A().session(); await A().rerender(); A().toast('Password changed. Sign in with your new password.'); return; }
      if (kind === 'product') {
        const product = productFromForm(f);
        if (!validateProduct(f, product)) return;
        const section = f.querySelector('[role=tab][aria-selected=true]')?.dataset.id || 'essentials';
        const r = await A().api('/admin/product_save', { product, version: Number(f.dataset.version), remarks: (data.remarks || '').trim(), request_id: requestId });
        dirty = false; await A().refreshCatalog();
        A().navigate('/ops/products?product=' + encodeURIComponent(r.id || product.id) + '&section=' + section);
        A().toast('Draft saved. Publish when you’re ready.'); return;
      }
      if (kind === 'batch') return await mutate('batch_create', { product: data.product, id: data.id.trim(), manufactured: data.manufactured, expiry: Date.parse(data.expiry + 'T23:59:59+05:30') / 1000, quantity: Number(data.quantity), location: (data.location || '').trim(), low_stock_threshold: data.low_stock_threshold === '' ? undefined : Number(data.low_stock_threshold), remarks: data.remarks, request_id: requestId });
      if (kind === 'order') return await mutate('order_update', { ...data, request_id: requestId, id: f.dataset.id });
      if (kind === 'case') return await mutate('case', { ...data, id: f.dataset.id });
      if (kind === 'action') return await mutate(f.dataset.action, buildAction(f, data, requestId));
    } catch (err) { if (box) box.textContent = err.message; else A().toast(err.message); }
    finally { if (submit && submit.isConnected) submit.disabled = false; }
  }, true);

  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-op]'); if (!b) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const action = b.dataset.op, id = b.dataset.id, form = b.closest('form');
    try {
      if (action === 'logout') { await A().api('/admin/logout', {}); dirty = false; await A().session(); await A().rerender(); return; }
      if (action === 'refresh') { A().invalidateOps(); await A().session(); await A().refreshCatalog(); await A().rerender(); A().toast('Up to date.'); return; }
      if (action === 'close-dialog') { document.getElementById('op-dialog')?.close(); return; }
      if (action === 'editor-tab') { showSection(form, id); return; }
      if (action.startsWith('image-')) {
        const g = galleryFromForm(form), i = Number(id);
        if (action === 'image-remove') { if (!confirm('Remove this image from the product? Save the draft to apply.')) return; g.splice(i, 1); return rerenderGallery(form, g, `#op-gallery [data-gallery-row]:nth-child(${Math.min(i, g.length - 1) + 1}) [data-op="image-remove"]`); }
        let to = i;
        if (action === 'image-up' && i > 0) to = i - 1;
        if (action === 'image-down' && i < g.length - 1) to = i + 1;
        if (action === 'image-first') { g[i].visible = true; to = 0; }
        const [item] = g.splice(i, 1); g.splice(to, 0, item);
        return rerenderGallery(form, g, `#op-gallery [data-gallery-row]:nth-child(${to + 1}) [data-op="${action}"]`);
      }
      if (action === 'faq-add' || action === 'source-add') { const k = action.split('-')[0], box = rerenderRepeat(form, k, l => l.push(k === 'faq' ? { question: '', answer: '' } : { title: '', url: '' })); box.lastElementChild?.querySelector('input')?.focus(); return; }
      if (action === 'faq-remove' || action === 'source-remove') { const k = action.split('-')[0], box = rerenderRepeat(form, k, l => l.splice(Number(id), 1)); const next = (box.children[Number(id)] || box.lastElementChild)?.querySelector('input'); (next || form.querySelector(`[data-op="${k}-add"]`))?.focus(); return; }
      if (action === 'product-preview') return previewModal(id, b);
      if (action === 'export') return exportCurrent();
      if (action === 'sales-export-periods') return exportSales('periods');
      if (action === 'sales-export-products') return exportSales('products');
      actionModal(action, id, b);
    } catch (err) { A().toast(err.message); }
  }, true);

  document.addEventListener('keydown', e => {
    const t = e.target.closest?.('.op-tabs [role=tab]'); if (!t || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const tabs = [...t.parentElement.querySelectorAll('[role=tab]')], i = tabs.indexOf(t);
    const n = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    showSection(t.closest('form'), tabs[n].dataset.id, true);
  });

  document.addEventListener('change', async e => {
    const t = e.target;
    if (t.matches('[data-gallery-visible]')) { const f = t.closest('form'), row = t.closest('[data-gallery-row]'), i = [...row.parentElement.children].indexOf(row); return rerenderGallery(f, galleryFromForm(f), `#op-gallery [data-gallery-row]:nth-child(${i + 1}) [data-gallery-visible]`); }
    if (t.matches('[name=related]')) { const f = t.closest('form'), all = [...f.querySelectorAll('[name=related]')], n = all.filter(x => x.checked).length; all.forEach(x => { x.disabled = !x.checked && n >= 6; }); refreshCounts(f); }
    if (t.matches('[data-adjust-kind]')) adjustPreview(t.closest('form'));
    if (t.id !== 'op-image-upload') return;
    const form = t.closest('form'), status = document.getElementById('op-upload-status'); const gallery = galleryFromForm(form);
    try {
      for (const file of t.files) {
        if (gallery.length >= 12) throw Error('A product can have up to 12 images, including hidden ones.');
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw Error(file.name + ': use JPEG, PNG or WebP.');
        if (file.size > 5 * 1024 * 1024) throw Error(file.name + ' is larger than 5 MB.');
        status.textContent = 'Uploading ' + file.name + '…';
        const r = await fetch('/api/admin/catalog-image', { method: 'POST', headers: { 'X-CSRF-Token': A().csrf(), 'Content-Type': file.type }, body: file });
        const out = await r.json().catch(() => ({}));
        if (!r.ok) throw Error(out.error || 'Upload failed.');
        gallery.push({ ...out, alt: out.alt || form.elements.namedItem('name')?.value || file.name.replace(/\.[^.]+$/, ''), label: out.label || '', caption: out.caption || '', visible: true });
        rerenderGallery(form, gallery);
      }
      status.textContent = 'Uploaded. Check the alt text, then save the draft to attach the images.';
    } catch (err) { status.textContent = err.message; }
    t.value = '';
  });
  document.addEventListener('input', e => {
    const f = e.target.closest('[data-op-form="product"]');
    if (f) { dirty = true; if (e.target.matches('textarea,input:not([type=file])')) { clearTimeout(f._c); f._c = setTimeout(() => refreshCounts(f), 250); } }
    if (e.target.matches('[data-adjust-units]')) adjustPreview(e.target.closest('form'));
  });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (dirty && a && !a.getAttribute('href').startsWith('#') && location.pathname.startsWith('/ops')) { if (!confirm('Leave the product editor? Unsaved changes will be lost.')) { e.preventDefault(); e.stopImmediatePropagation(); } else dirty = false; }
  }, true);
  window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  window.BCCOps = { render };
})();
