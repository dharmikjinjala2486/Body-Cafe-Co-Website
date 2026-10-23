/* Body Café Co. — the "Reduce motion" preference (Preferences › This browser).
   Loaded before every other script. When the shopper turns it on, the site behaves exactly as it does for a device
   set to reduce motion: CSS animations and transitions stop (html[data-motion="reduce"], see support.css), and every
   script that asks matchMedia("(prefers-reduced-motion: reduce)") gets "yes", so scripted scenes stay still too.
   The device's own setting always applies as well; this can only add calm, never remove it. */
(function () {
  "use strict";
  var real = window.matchMedia ? window.matchMedia.bind(window) : null;
  function on() { try { return localStorage.getItem("bcc-motion") === "reduce"; } catch (e) { return false; } }
  if (real) {
    window.matchMedia = function (q) {
      var m = real(q);
      if (!on() || !/prefers-reduced-motion\s*:\s*reduce/.test(String(q))) return m;
      return { matches: true, media: m.media, onchange: null, addListener: function () {}, removeListener: function () {}, addEventListener: function () {}, removeEventListener: function () {}, dispatchEvent: function () { return false; } };
    };
  }
  function apply() {
    if (on()) document.documentElement.setAttribute("data-motion", "reduce");
    else document.documentElement.removeAttribute("data-motion");
  }
  apply();
  window.BCCMotion = { apply: apply, reduced: function () { return on() || (real ? real("(prefers-reduced-motion: reduce)").matches : false); } };
})();
