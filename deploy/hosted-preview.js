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
  window.BCCStaticPreview = {
    async api(path, data) {
      if (data !== undefined) throw new Error('This shared design preview does not save orders, sign-ins or support requests.');
      if (path === '/session') return {user: {id: 'design-preview', name: 'Guest', role: 'customer', mobile: ''}, csrf: '', preview: true};
      if (path === '/catalog') return loadCatalog();
      if (path === '/account') return {orders: [], cases: [], addresses: [], reviews: []};
      const url = new URL(path, location.origin);
      if (url.pathname === '/reports') {
        const c = await loadCatalog();
        const pid = url.searchParams.get('product');
        const index = c.products.findIndex(p => p.id === pid);
        if (index < 0) throw new Error('Choose a product.');
        const lot = (url.searchParams.get('lot') || '').trim().toUpperCase();
        if (lot === 'DEMO-OUTAGE') throw new Error('Sample service-unavailable state. Please try again.');
        const prefix = `DEMO-${String(index + 1).padStart(2, '0')}-`;
        const state = lot === 'DEMO-UNPUBLISHED' ? 'unpublished' : lot === 'DEMO-WITHDRAWN' ? 'withdrawn' : [prefix+'01', prefix+'02'].includes(lot) ? 'sample_match' : 'not_found';
        return {state, lot, product: pid, preview: true, document: null, message: 'Illustrative record only. No laboratory result or authenticity claim.'};
      }
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
