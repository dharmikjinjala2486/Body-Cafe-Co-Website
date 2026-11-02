/* Supplied final label facts. Catalogue edits from Operations take precedence.
   This adds display defaults only; it never changes prices, stock, publication or provider capabilities. */
(function () {
  'use strict';
  var records;
  function merge(products, labels) {
    return products.map(function (product) {
      var label = labels[product.id];
      if (!label) return product;
      var defaults = window.BCCPdpE?.defaults?.(product.id) || {};
      var result = Object.assign({}, defaults, label, product);
      if (product.draft) {
        var draft = Object.assign({}, product, product.draft); delete draft.draft;
        result.draft = merge([draft], labels)[0];
      }
      var note = window.BCCSite?.notes?.[product.id];
      if (note && !Object.prototype.hasOwnProperty.call(product,'ingredient_note')) result.ingredient_note = note.compound || '';
      if (note && !Object.prototype.hasOwnProperty.call(product,'sources')) result.sources = (note.sources || []).map(function(s){return {title:s[0],url:s[1]};});
      // Replace only the original seeded placeholder copy. Deliberate admin copy is retained.
      if (product.label_note === 'Full formulation, quantities, directions and warnings await approved rear labels.') {
        result.label_note = label.label_note;
        if (["Iron, with the details in view.", "Get to know your everyday ingredient.", "With Omega-3 as triglycerides.", "A closer look at your Omega-3.", "Two ingredients. All the details.", "Meet creatine in a chew.", "Make room for a little curiosity."].includes(product.subtitle)) result.subtitle = label.subtitle;
        if (product.id === 'creatine-chews' && product.ingredients === 'Creatine; complete formulation pending') result.ingredients = 'Creatine monohydrate';
      }
      result.label_diagram_current = ['amount_per_serving','pack_size','serving_size','directions'].every(function(k){return result[k] === label[k];});
      if (!Object.prototype.hasOwnProperty.call(product,'detail_title')) result.detail_title = window.BCCLivingE?.SIG?.[product.id]?.hook || 'What is it?';
      if (!Object.prototype.hasOwnProperty.call(product,'segment_name')) {
        var role = window.BCCSuperSevens?.role?.(result);
        result.segment_name = role?.nick || ''; result.segment_description = role?.line || '';
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
