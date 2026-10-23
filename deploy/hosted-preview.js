/* Loaded only by the Netlify export. Local Python previews keep their real local API. */
(function () {
  "use strict";
  let catalog;
  async function loadCatalog() {
    if (!catalog) catalog = fetch('/web/catalog-preview.json').then((r) => {
      if (!r.ok) throw new Error('The preview catalogue could not load. Please reload.');
      return r.json();
    });
    return catalog;
  }
  /* Lot reports in the shared preview: demonstration lots only (no laboratory, result, date or document), using the
     same exact-match rules as the local API. */
  async function lots(url) {
    const c = await loadCatalog();
    const ids = c.products.map((p) => p.id);
    const demoLots = ids.flatMap((id, i) => [1, 2].map((j) => ({product: id, lot: `DEMO-${String(i + 1).padStart(2, '0')}-${String(j).padStart(2, '0')}`})));
    if (url.pathname === '/lots/archive') {
      const p = url.searchParams.get('product') || '', q = (url.searchParams.get('q') || '').trim().toUpperCase();
      if (p && !ids.includes(p)) throw new Error('Choose a product.');
      const items = demoLots.filter((x) => (!p || x.product === p) && (!q || x.lot.includes(q))).map((x) => ({...x, availability: 'unavailable', version: null, published: null, withdrawn: null, manufactured: null, expiry: null, demo: true, notice: false}));
      return {items, total: items.length};
    }
    const product = url.searchParams.get('product') || '';
    if (!ids.includes(product)) throw new Error('Choose a product.');
    const entered = url.searchParams.get('lot') || '';
    const lot = entered.trim().toUpperCase();
    if (!lot) throw new Error('Enter the lot number printed on your pack.');
    if (lot.length > 40 || !/^[\x21-\x7e ]+$/.test(lot)) throw new Error('That lot number has characters we can’t search for. Check it against the pack and try again.');
    if (lot === 'DEMO-OUTAGE') throw new Error('The lot service didn’t respond (sample outage). Your entry is kept: try again in a moment.');
    const base = {entered, searched: lot, changed: entered !== lot, product, lot, url: `/reports/${product}/${lot}`, demo: lot.startsWith('DEMO-')};
    const empty = {state: 'match', demo: true, partial: false, current: null, history: [], notices: [], lab_document_connected: false};
    if (lot === 'DEMO-UNPUBLISHED') return {...base, ...empty, availability: 'under_review'};
    if (lot === 'DEMO-NOTICE' || lot === 'DEMO-WITHDRAWN') return {...base, ...empty, availability: 'unavailable', notices: [{id: 'DEMO-NOTICE', kind: 'withdrawal', kind_label: 'Batch withdrawal · demonstration', title: 'Demonstration: how a confirmed batch notice appears', body: 'This is not a real notice. If a batch were withdrawn, the approved instructions would appear here, with a direct route to Product safety support.', activated: null}]};
    if (lot === 'DEMO-SUPERSEDED') return {...base, ...empty, availability: 'unavailable', history: [
      {id: 'DEMO-V2', version: 2, state: 'demo', published: null, superseded: null, withdrawn: null, withdrawn_reason: null, change_note: 'Demonstration: version 2 would replace version 1 and say why, for example a corrected transcription.'},
      {id: 'DEMO-V1', version: 1, state: 'superseded', published: null, superseded: null, withdrawn: null, withdrawn_reason: null, change_note: 'Demonstration: a superseded version stays listed. Replacing a document does not by itself mean the batch was withdrawn.'}]};
    const owner = demoLots.find((x) => x.lot === lot);
    if (!owner) return {...base, state: 'not_found'};
    if (owner.product !== product) return {...base, state: 'other_product', other_products: [owner.product]};
    return {...base, ...empty, availability: 'unavailable'};
  }
  window.BCCStaticPreview = {
    async api(path, data) {
      if (data !== undefined) throw new Error('This shared design preview does not save orders, sign-ins or support requests.');
      if (path === '/session') return {user: {id: 'design-preview', name: 'Guest', role: 'customer', mobile: ''}, csrf: '', preview: true};
      if (path === '/catalog') return loadCatalog();
      if (path === '/account') return {orders: [], cases: [], addresses: [], reviews: []};
      const url = new URL(path, location.origin);
      if (url.pathname === '/lots' || url.pathname === '/lots/archive') return lots(url);
      if (url.pathname === '/reviews') {
        // No customer data is published with the static design preview, so no reviews exist here.
        return {product: url.searchParams.get('product'), summary: {count: 0, average: null, breakdown: {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}}, reviews: [], page: 1, pages: 1, total: 0, staticPreview: true};
      }
      if (url.pathname === '/reviews/eligibility') return {state: 'static_preview'};
      if (url.pathname === '/questions') return {product: url.searchParams.get('product'), questions: [], staticPreview: true};
      throw new Error('This action needs the connected store, which is not enabled in this shared design preview.');
    }
  };
})();
