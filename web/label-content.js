/* Supplied final label facts. Catalogue edits from Operations take precedence.
   This adds display defaults only; it never changes prices, stock, publication or provider capabilities. */
(function () {
  'use strict';
  var records;
  function merge(products, labels) {
    return products.map(function (product) {
      var label = labels[product.id];
      if (!label) return product;
      var result = Object.assign({}, label, product);
      // Replace only the original seeded placeholder copy. Deliberate admin copy is retained.
      if (product.label_note === 'Full formulation, quantities, directions and warnings await approved rear labels.') {
        result.label_note = label.label_note;
        if (["Iron, with the details in view.", "Get to know your everyday ingredient.", "With Omega-3 as triglycerides.", "A closer look at your Omega-3.", "Two ingredients. All the details.", "Meet creatine in a chew.", "Make room for a little curiosity."].includes(product.subtitle)) result.subtitle = label.subtitle;
        if (product.id === 'creatine-chews' && product.ingredients === 'Creatine; complete formulation pending') result.ingredients = 'Creatine monohydrate';
      }
      return result;
    });
  }
  window.BCCLabelContent = {
    merge: merge,
    enrich: async function (products) {
      if (!records) records = fetch('/web/label-records.json').then(function (response) {
        if (!response.ok) throw new Error('Product label information could not load. Please reload.');
        return response.json();
      }).catch(function (error) { records = null; throw error; });
      return merge(products, await records);
    }
  };
})();
