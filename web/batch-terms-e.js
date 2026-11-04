/* Body Café Co. — "lot" is called "batch" on the storefront (owner, 4 Nov 2026): "lot number" → "Batch No.", "lot" → "batch".
   Variant E only (all four parts); the archived variants and the operations portal keep their wording. The copy lives in many
   files that the archived variants share, so the wording is swapped as pages render: every text node and the readable attributes
   (placeholder, aria-label, title, alt) under <body>, plus the document title. Idioms ("a lot of care", "a lot more") are left
   alone. Links, ids, form names and API fields are not text, so nothing functional changes. */
(function () {
  "use strict";
  var WORD = /\b(lot \(or batch\)|lot numbers|lot number|lot no\.|lots|lot)(?![a-z])(\.?)/gi;
  var ATTRS = ["placeholder", "aria-label", "title", "alt"];
  function on() { return document.body && document.body.dataset.design === "e" && location.pathname.indexOf("/ops") !== 0; }
  function cased(src, out) {
    if (src === src.toUpperCase() && /[A-Z]/.test(src)) return out.toUpperCase();
    return /^[A-Z]/.test(src) ? out.charAt(0).toUpperCase() + out.slice(1) : out;
  }
  function swap(text) {
    if (!text || !/lot/i.test(text)) return text;
    return text.replace(WORD, function (m, word, dot, at, all) {
      var w = word.toLowerCase(), before = all.slice(Math.max(0, at - 2), at).toLowerCase(), after = all.slice(at + word.length, at + word.length + 6).toLowerCase();
      if ((w === "lot" || w === "lots") && /\ba $/.test(" " + before) && /^ (of|more)\b/.test(after)) return m; // "a lot of", "a lot more"
      if (w === "lot (or batch)") return cased(word, "batch") + dot;
      // The abbreviation's own full stop also ends a sentence, so a following "." is dropped.
      if (w === "lot number" || w === "lot no.") return word === word.toUpperCase() ? "BATCH NO." : "Batch No.";
      if (w === "lot numbers") return word === word.toUpperCase() ? "BATCH NOS." : "Batch Nos.";
      return cased(word, w === "lots" ? "batches" : "batch") + dot;
    });
  }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { var v = swap(root.nodeValue); if (v !== root.nodeValue) root.nodeValue = v; return; }
    if (root.nodeType !== 1 || /^(SCRIPT|STYLE|TEXTAREA|CODE|PRE)$/.test(root.tagName)) return;
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (n) {
      var p = n.parentElement; return p && !/^(SCRIPT|STYLE|TEXTAREA|CODE|PRE)$/.test(p.tagName) && /lot/i.test(n.nodeValue) ? 1 : 3; } });
    var n, list = []; while ((n = tw.nextNode())) list.push(n);
    list.forEach(function (t) { var v = swap(t.nodeValue); if (v !== t.nodeValue) t.nodeValue = v; });
    var els = [root].concat([].slice.call(root.querySelectorAll("[placeholder],[aria-label],[title],[alt]")));
    els.forEach(function (el) { ATTRS.forEach(function (a) { var v = el.getAttribute && el.getAttribute(a); if (v && /lot/i.test(v)) { var s = swap(v); if (s !== v) el.setAttribute(a, s); } }); });
  }
  function title() { var t = swap(document.title); if (t !== document.title) document.title = t; }
  var mo = new MutationObserver(function (records) {
    if (!on()) return;
    records.forEach(function (r) {
      if (r.type === "characterData") walk(r.target);
      else if (r.type === "attributes") walk(r.target);
      else r.addedNodes.forEach(walk);
    });
    title();
  });
  function start() {
    mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    new MutationObserver(function () { if (on()) title(); }).observe(document.head, { subtree: true, childList: true, characterData: true });
    if (on()) { walk(document.body); title(); }
  }
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
  window.BCCBatchTerms = { swap: swap };
})();
