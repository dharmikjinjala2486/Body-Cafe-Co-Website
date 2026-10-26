/* Responsive enhancements move the original nodes, preserving form state and handlers. */
(function () {
  "use strict";
  var dispose = function () {};
  function element(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text) el.textContent = text;
    return el;
  }
  function enhance() {
    dispose();
    if (location.pathname.startsWith("/ops")) return;
    var media = matchMedia("(max-width: 760px)"), undo = [], observers = [];
    function move(node, target) {
      if (!node || !target) return;
      var mark = document.createComment("mobile position");
      node.before(mark); target.append(node);
      undo.push(function () { mark.replaceWith(node); });
    }
    function replaceText(node, text) {
      if (!node) return;
      var children = Array.from(node.childNodes);
      node.textContent = text;
      undo.push(function () { node.replaceChildren.apply(node, children); });
    }
    function reset() {
      observers.forEach(function (o) { o.disconnect(); }); observers = [];
      undo.reverse().forEach(function (fn) { fn(); }); undo = [];
    }
    function apply() {
      reset();
      if (!media.matches) return;
      var product = document.querySelector("[data-pp]"), grid = product && product.querySelector(".pp-hero-grid");
      if (grid) {
        var title = product.querySelector(".pp-title"), band = product.querySelector(".pp-band");
        var intro = band || element("div", "ms-product-intro");
        if (!band) { grid.before(intro); undo.push(function () { intro.remove(); }); move(title, intro); }
        move(product.querySelector(".pp-pricebox"), intro);
        move(product.querySelector("[data-pp-buy]"), intro);
      }
      var mast = document.querySelector(".live-top, .cin-mast");
      if (mast) {
        var shop = element("a", "ms-home-shop", "Shop all seven ↗");
        shop.href = "/shop" + location.search;
        mast.prepend(shop); undo.push(function () { shop.remove(); });
      }
      var form = document.querySelector("#checkout-form");
      if (form) {
        var root = form.closest(".r-checkout, .tb-checkout, .x-checkout") || form.parentElement.parentElement;
        var head = root.querySelector("header"), h1 = root.querySelector("h1");
        if (head) { head.classList.add("ms-checkout-head"); undo.push(function () { head.classList.remove("ms-checkout-head"); }); }
        root.classList.add("ms-checkout"); undo.push(function () { root.classList.remove("ms-checkout"); });
        replaceText(h1, "Checkout");
        replaceText(head && head.querySelector("p:not(.r-label):not(.tb-kicker):not(.x-kicker)"), "Guest checkout. No payment is taken in this preview.");
        var guest = form.querySelector(".ac-co-note"), signIn = guest && guest.querySelector("a");
        if (guest && signIn) {
          var guestNodes = Array.from(guest.childNodes);
          guest.replaceChildren(document.createTextNode("Guest checkout · "), signIn, document.createTextNode(" (optional)"));
          undo.push(function () { guest.replaceChildren.apply(guest, guestNodes); });
        }
        Array.from(form.querySelectorAll("section h2, .x-co-step h2")).forEach(function (heading, i) {
          if (i < 3) replaceText(heading, ["1 · Delivery", "2 · Payment", "3 · Confirmation"][i]);
        });
        var summary = root.querySelector(".r-checkout-summary, .tb-sum, .x-summary");
        if (summary) {
          var marker = document.createComment("desktop summary"); summary.before(marker); form.before(summary);
          undo.push(function () { marker.replaceWith(summary); });
          var details = element("details", "ms-order-summary"), label = element("summary");
          var total = element("span", "ms-order-total"), contents = element("div", "ms-order-contents");
          label.append(element("span", "", "Order summary"), total); details.append(label, contents);
          var original = Array.from(summary.childNodes); original.forEach(function (n) { contents.append(n); }); summary.append(details);
          undo.push(function () { summary.replaceChildren.apply(summary, original); });
          function updateTotal() { var n = contents.querySelector("#checkout-total"); var value = n ? n.textContent : ""; if (total.textContent !== value) total.textContent = value; }
          updateTotal(); var observer = new MutationObserver(updateTotal); observer.observe(contents, { subtree: true, childList: true, characterData: true }); observers.push(observer);
        }
      }
      var footer = Array.from(document.querySelectorAll("#app footer")).filter(function (f) { return !f.closest("main"); }).pop();
      if (footer) {
        footer.querySelectorAll(".r-footer-links > div, .w-footer-groups > div, .tb-foot-cols > div, .e-foot-grid > div:not(.e-foot-brand), .f-foot-cols > div, .g-foot-grid > div, .h-foot-cols > div").forEach(function (group) {
          var heading = group.querySelector("h2, h3"); if (!heading || !group.querySelector("a")) return;
          var original = Array.from(group.childNodes), details = element("details", "ms-footer-group"), summary = element("summary"), links = element("div", "ms-footer-links");
          summary.append(heading); original.filter(function (n) { return n !== heading; }).forEach(function (n) { links.append(n); });
          details.append(summary, links); group.append(details);
          undo.push(function () { group.replaceChildren.apply(group, original); });
        });
      }
      window.dispatchEvent(new Event("bcc:mobile-layout"));
    }
    media.addEventListener("change", apply); apply();
    dispose = function () { media.removeEventListener("change", apply); reset(); };
  }
  window.BCCMobileShopping = { enhance: enhance };
})();
