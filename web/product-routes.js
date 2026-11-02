/* Public paths match the QR codes already printed on the product labels.
   Keep catalogue IDs and API product identifiers unchanged. */
(function () {
  'use strict';
  var slugs = {
    'vitamin-d3-k2': 'vitamin-d3k2',
    'creatine-chews': 'creatine-chews',
    'l-theanine': 'l-theanine',
    'omega-3-fish-oil': 'omega3-fishoil',
    'psyllium-husk': 'psyllium-husk',
    'iron-bisglycinate': 'iron-bisglycinate',
    'myo-d-chiro-inositol': 'myo-and-dchiro-inositol'
  };
  function productId(path) {
    path = path.split(/[?#]/)[0].replace(/\/$/, '');
    var legacy = path.match(/^\/products\/([^/]+)$/);
    if (legacy) return legacy[1];
    return Object.keys(slugs).find(function (id) { return path === '/' + slugs[id]; }) || null;
  }
  function href(value, design) {
    var url = new URL(value, location.origin), id = productId(url.pathname);
    if (url.origin !== location.origin || !id || !slugs[id]) return value;
    url.pathname = '/' + slugs[id];
    if (design === 'e' || url.searchParams.get('design') === 'e') url.searchParams.delete('design');
    return url.pathname + url.search + url.hash;
  }
  window.BCCProductRoutes = { slugs: slugs, productId: productId, href: href,
    internalPath: function (path) { var id = productId(path); return id ? '/products/' + id : path; }
  };
})();
