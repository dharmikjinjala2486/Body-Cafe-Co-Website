/* Body Café Co. — "Choose your pack" (owner, 4 Nov 2026), shared by every Variant E part.
   The rule: on one product line, 2 bottles save 5% and 3 or more save 10%, rounded to the nearest rupee. One bottle is always
   the MRP. The same rule runs on the server (supabase/functions/operations/core.js quote(), deploy/hosted-preview.js,
   app/server.py), which is what the bag and checkout charge; this file only shows it and keeps #product-quantity in step,
   so the existing add-product action in app.js adds the chosen number of bottles. */
(function () {
  "use strict";
  var PACKS = [1, 2, 3];
  function pct(q) { return q >= 3 ? 10 : q === 2 ? 5 : 0; }
  function saving(price, q) { return Math.round((+price || 0) * q * pct(q) / 100); }
  function packPrice(price, q) { return (+price || 0) * q - saving(price, q); }
  // Every label is one serving a day, so a bottle lasts servings_per_pack days.
  function days(p) { var n = parseInt(p && p.servings_per_pack, 10); return n > 0 ? n : 0; }
  function money(n) { return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 }); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* Three cards. max: how many bottles can be added (stock, from h.pdp); cards above it are disabled.
     o.cls adds a part-specific class for theming. o.months (Part 2) leads each card with the supply in months, worked out
     from the label (a 60-day bottle is 2 months), and puts the bottle count under it; it falls back to bottles and days. */
  function supply(n) { return n + " month" + (n > 1 ? "s" : ""); }
  function picker(p, o) {
    o = o || {};
    var max = Math.max(1, o.max || 3), d = days(p), price = +p.price || 0;
    return '<div class="pk' + (o.cls ? " " + o.cls : "") + '" data-pk data-price="' + price + '">' +
      '<p class="pk-k" id="pk-k-' + esc(p.id) + '">Choose your pack</p>' +
      '<div class="pk-cards" role="radiogroup" aria-labelledby="pk-k-' + esc(p.id) + '">' + PACKS.map(function (q) {
        var off = q > max || !!o.off, s = saving(price, q), total = packPrice(price, q), perDay = d ? total / (d * q) : 0;
        return '<button type="button" class="pk-card" role="radio" data-pk-q="' + q + '" aria-checked="' + (q === 1) + '" tabindex="' + (q === 1 ? 0 : -1) + '"' + (off ? " disabled" : "") + ">" +
          (q === 3 ? '<span class="pk-flag">Best value</span>' : "") +
          (o.months && d && d % 30 === 0
            ? '<span class="pk-n">' + supply(d * q / 30) + '</span><span class="pk-days">' + q + " bottle" + (q > 1 ? "s" : "") + "</span>"
            : '<span class="pk-n">' + q + " bottle" + (q > 1 ? "s" : "") + "</span>" + (d ? '<span class="pk-days">' + d * q + " days</span>" : "")) +
          '<span class="pk-was' + (s ? "" : " is-empty") + '"' + (s ? "" : ' aria-hidden="true"') + ">" + (s ? money(price * q) : "&nbsp;") + "</span>" +
          '<strong class="pk-price">' + money(total) + "</strong>" +
          (s ? '<span class="pk-save">Save ' + pct(q) + "%</span>" : '<span class="pk-save is-mrp">MRP</span>') +
          (perDay ? '<small class="pk-per">' + money(Math.round(perDay * 100) / 100) + " a day</small>" : "") +
          "</button>";
      }).join("") + "</div>" +
      '<p class="pk-note">2 bottles save 5%, 3 save 10%. The saving is applied in your bag.</p></div>';
  }

  /* Wire every picker under root: choosing a card sets #product-quantity and updates any [data-pk-total] / [data-pk-was]. */
  function mount(root, signal) {
    root.querySelectorAll("[data-pk]").forEach(function (box) {
      var cards = [].slice.call(box.querySelectorAll("[data-pk-q]")), price = +box.dataset.price || 0;
      var scope = box.closest("[data-pk-scope]") || root, sel = scope.querySelector("#product-quantity");
      function choose(card, focus) {
        if (!card || card.disabled) return;
        var q = +card.dataset.pkQ;
        cards.forEach(function (c) { var on = c === card; c.setAttribute("aria-checked", String(on)); c.tabIndex = on ? 0 : -1; });
        if (focus) card.focus();
        if (sel) {
          if (![].some.call(sel.options, function (op) { return +op.value === q; })) sel.add(new Option(String(q), String(q)));
          sel.value = String(q); sel.dispatchEvent(new Event("change", { bubbles: true }));
        }
        scope.querySelectorAll("[data-pk-total]").forEach(function (n) { n.textContent = money(packPrice(price, q)); });
        scope.querySelectorAll("[data-pk-was]").forEach(function (n) { var s = saving(price, q); n.textContent = s ? money(price * q) : ""; n.hidden = !s; });
        scope.querySelectorAll("[data-pk-count]").forEach(function (n) { n.textContent = q + " bottle" + (q > 1 ? "s" : ""); });
        // Sticky bars sit outside the buy box; they show the chosen pack's price too.
        root.querySelectorAll("[data-pk-total-page]").forEach(function (n) { n.textContent = money(packPrice(price, q)) + (q > 1 ? " · " + q + " bottles" : ""); });
      }
      box.addEventListener("click", function (e) { var c = e.target.closest("[data-pk-q]"); if (c) choose(c); }, { signal: signal });
      box.addEventListener("keydown", function (e) {
        var i = cards.indexOf(document.activeElement); if (i < 0) return;
        var step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0; if (!step) return;
        e.preventDefault();
        for (var k = 1; k <= cards.length; k++) { var n = cards[(i + step * k + cards.length * k) % cards.length]; if (!n.disabled) { choose(n, true); break; } }
      }, { signal: signal });
      choose(cards[0]);
    });
  }

  /* Delivery check under Add to bag (owner, 4 Nov 2026). Submits as #pincode-form, which app.js already handles
     (format check only until courier serviceability is connected; it never promises a date). */
  function pincode(cls) {
    return '<form id="pincode-form" class="pc' + (cls ? " " + cls : "") + '" novalidate><label class="pc-k" for="pincode">Check delivery to your pincode</label>' +
      '<div class="pc-row"><input id="pincode" name="pincode" inputmode="numeric" autocomplete="postal-code" pattern="[1-9][0-9]{5}" maxlength="6" placeholder="6-digit pincode" required aria-describedby="pincode-help pincode-result"><button type="submit">Check</button></div>' +
      '<p id="pincode-help" class="pc-note">We deliver across India. If we can\u2019t reach your pincode, we tell you before you pay. Delivery dates are estimates.</p>' +
      '<p id="pincode-result" class="pc-result" role="status"></p></form>';
  }

  window.BCCPacks = { pct: pct, saving: saving, packPrice: packPrice, days: days, picker: picker, mount: mount, pincode: pincode };
})();
