/* Body Café Co. — the bag, for all eight directions (A–H).

   One behaviour, eight looks (bag.css, scoped .bg-a … .bg-h). Replaces only each theme's `cart` renderer.

   * Every line, the summary and the header count come from one server check (POST /api/bag/quote): current sample
     price, real preview stock, the 10-per-product limit, the PREVIEW10 sample code and the sample delivery rule.
     If stock or price changed, the bag is corrected and the change is explained before checkout.
   * Quantity changes apply straight away; one update runs at a time, the newest change wins, failures are explained
     with Retry, and nothing is lost on refresh (browser storage) or sign-in (account bag for signed-in customers).
   * Remove offers Undo. Save for later keeps items in this browser without signing in.
   * Combining a guest bag with an account bag keeps the larger quantity per product and says so; nothing is doubled.
   * No automatic additions, preselected extras, timers or scarcity messages. */
(function () {
  "use strict";
  var S = window.BCCSite;
  if (!S || !S.themes) return;
  var A = function () { return window.BCCApp; };

  function h(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function money(n) { return "₹" + Number(n || 0).toLocaleString("en-IN"); }
  function read(key, fallback) { try { var v = JSON.parse(localStorage.getItem(key) || "null"); return v == null ? fallback : v; } catch (e) { return fallback; } }
  function write(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function sread(key) { try { return sessionStorage.getItem(key) || ""; } catch (e) { return ""; } }
  function swrite(key, v) { try { if (v) sessionStorage.setItem(key, v); else sessionStorage.removeItem(key); } catch (e) {} }
  var FORMAT = { "iron-bisglycinate": "Capsules", "l-theanine": "Capsules", "vitamin-d3-k2": "Softgels", "omega-3-fish-oil": "Softgels", "myo-d-chiro-inositol": "Capsules", "creatine-chews": "Chewable tablets", "psyllium-husk": "Capsules" };

  /* ---------------- state ---------------- */
  function bag() { return A().cart(); }
  function saved() { return (read("bcc-saved", []) || []).filter(function (x) { return x && typeof x.id === "string"; }); }
  function setSaved(list) { write("bcc-saved", list); }
  function product(id) { return (A().catalog() || []).filter(function (p) { return p.id === id; })[0]; }
  function discountCode() { return sread("bcc-discount"); }

  var quote = null, busy = null, queued = false, lastError = "", undo = null, notices = [];

  async function check() {
    if (busy) { queued = true; return busy; }
    busy = (async function () {
      do {
        queued = false;
        var items = bag().map(function (i) { return { id: i.id, quantity: i.quantity, price: typeof i.price === "number" ? i.price : undefined }; });
        try {
          quote = await A().api("/bag/quote", { items: items, discount: discountCode() });
          lastError = "";
          applyCorrections();
        } catch (e) {
          lastError = e.message || "We couldn’t check your bag.";
        }
      } while (queued);
      busy = null;
    })();
    return busy;
  }
  /* Server corrections are applied and explained, never silent. */
  function note(t) { if (notices.indexOf(t) < 0) notices.push(t); }
  function applyCorrections() {
    if (!quote) return;
    var items = bag().slice(), changed = false;
    quote.changes.forEach(function (c) {
      var p = product(c.id), name = p ? p.name : "A product";
      var i = items.filter(function (x) { return x.id === c.id; })[0];
      if (!i) return;
      if (c.kind === "reduced") { i.quantity = c.to; changed = true; note(name + ": reduced from " + c.from + " to " + c.to + ", the most available right now."); }
      else if (c.kind === "unavailable") { note(name + " isn’t available right now. Move it to Saved for later or remove it to check out."); }
      else if (c.kind === "price") { i.price = c.to; changed = true; note(name + ": the sample price changed from " + money(c.from) + " to " + money(c.to) + "."); }
      else if (c.kind === "unknown") { items = items.filter(function (x) { return x.id !== c.id; }); changed = true; note("A product that’s no longer in the catalogue was removed."); }
    });
    if (changed) { A().setCart(items); quote = null; queued = true; }
  }
  function sync() { if (A().user() && String(A().user().id).indexOf("customer-") === 0) A().api("/bag", { items: bag().map(function (i) { return { id: i.id, quantity: i.quantity, price: i.price }; }) }).catch(function () {}); }

  /* After sign-in: combine the browser bag with the account bag, keeping the larger quantity and saying so. */
  async function afterSignIn() {
    var account;
    try { account = await A().api("/bag"); } catch (e) { return ""; }
    var local = bag(), remote = (account.items || []).filter(function (x) { return product(x.id); });
    if (!remote.length) { sync(); return ""; }
    if (!local.length) { A().setCart(remote.map(function (x) { return { id: x.id, quantity: Math.min(10, x.quantity), price: x.price }; })); return "We restored the bag saved to your account."; }
    var out = local.map(function (x) { return { id: x.id, quantity: x.quantity, price: x.price }; }), notes = [];
    remote.forEach(function (r) {
      var l = out.filter(function (x) { return x.id === r.id; })[0], p = product(r.id);
      if (!l) { out.push({ id: r.id, quantity: Math.min(10, r.quantity), price: r.price }); notes.push((p ? p.name : r.id) + " (" + r.quantity + ") added from your account bag"); }
      else if (l.quantity !== r.quantity) { var keep = Math.max(l.quantity, r.quantity); notes.push((p ? p.name : r.id) + ": kept " + keep + ", the larger of " + l.quantity + " and " + r.quantity); l.quantity = Math.min(10, keep); }
    });
    A().setCart(out); sync();
    return notes.length ? "We combined this bag with the one saved to your account: " + notes.join("; ") + ". Adjust anything below before checkout." : "";
  }

  /* ---------------- markup ---------------- */
  function line(v, i, q) {
    var p = product(i.id);
    if (!p) return "";
    var ql = q && q.lines.filter(function (x) { return x.id === i.id; })[0];
    var max = ql ? ql.max : Math.min(10, p.stock || 0);
    var status = ql ? ql.status : "checking";
    var avail = status === "unavailable" ? '<span class="bg-av is-out">Not available right now</span>' : status === "checking" ? '<span class="bg-av">Checking availability…</span>' : max < 10 ? '<span class="bg-av">Available · up to ' + max + " per order in preview stock</span>" : '<span class="bg-av is-ok">Available · up to 10 per order</span>';
    return '<li class="bg-line' + (status === "unavailable" ? " is-out" : "") + '" data-bg-line="' + h(p.id) + '" style="--bg-cap:' + h(p.color) + '">' +
      '<a class="bg-thumb" href="/products/' + h(p.id) + '" tabindex="-1" aria-hidden="true"><img src="/web/media/' + h(p.id) + '.webp" alt="" width="720" height="1000" loading="lazy" decoding="async"></a>' +
      '<div class="bg-line-main"><h3><a href="/products/' + h(p.id) + '">' + h(p.name) + '</a></h3><p class="bg-meta">' + h(FORMAT[p.id] || "") + ' · pack size awaiting approved label</p><p class="bg-meta">Sample price ' + money(ql && ql.unit_price != null ? ql.unit_price : p.price) + " each</p>" + avail +
      '<div class="bg-line-actions"><button type="button" class="bg-quiet" data-bg-save="' + h(p.id) + '">Save for later</button><button type="button" class="bg-quiet" data-bg-remove="' + h(p.id) + '">Remove<span class="bg-sr"> ' + h(p.name) + "</span></button></div></div>" +
      '<div class="bg-line-end"><div class="bg-qty" role="group" aria-label="Quantity for ' + h(p.name) + '"><button type="button" data-bg-qty="' + h(p.id) + '" data-d="-1" aria-label="' + (i.quantity === 1 ? "Remove " + h(p.name) : "Decrease " + h(p.name) + " quantity") + '">−</button><output aria-live="off">' + i.quantity + '</output><button type="button" data-bg-qty="' + h(p.id) + '" data-d="1" aria-label="Increase ' + h(p.name) + ' quantity"' + (i.quantity >= max ? " disabled" : "") + ">+</button></div>" +
      '<strong class="bg-line-total">' + (ql ? money(ql.line_total) : "—") + "</strong></div></li>";
  }
  function summary(v, q) {
    var code = discountCode();
    var rows = q ? '<div class="bg-row"><span>Subtotal</span><strong>' + money(q.subtotal) + "</strong></div>" +
      (q.discount_applied ? '<div class="bg-row is-disc"><span>' + h(q.discount_applied.label) + '<small>' + h(q.discount_applied.condition) + "</small></span><strong>−" + money(q.discount) + "</strong></div>" : "") +
      '<div class="bg-row"><span>Delivery<small>' + h(q.shipping_rule.note) + "</small></span><strong>" + (q.subtotal ? (q.shipping ? money(q.shipping) : "Free") : "—") + "</strong></div>" +
      '<div class="bg-row is-total"><span>Sample total<small>' + h(q.tax_note) + "</small></span><strong>" + money(q.total) + "</strong></div>" : '<p class="bg-meta">Checking prices and stock…</p>';
    var blocked = !q || !q.ready;
    var why = !q ? "" : q.discount_error ? "Fix or remove the discount code to continue." : q.lines.some(function (x) { return x.status === "unavailable"; }) ? "Move unavailable items to Saved for later, or remove them, to continue." : "";
    return '<aside class="bg-summary" aria-labelledby="bg-sum-h"><h2 id="bg-sum-h" class="bg-sum-h">Order summary</h2>' + rows +
      '<details class="bg-disc"' + (code ? " open" : "") + '><summary>Have a discount code?</summary><form class="bg-disc-form" data-bg-disc novalidate><label for="bg-code">Discount code</label><div class="bg-inline"><input id="bg-code" name="code" value="' + h(code) + '" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="30"' + (q && q.discount_error ? ' aria-invalid="true" aria-describedby="bg-code-err"' : "") + '><button type="submit">Apply</button></div>' +
      (q && q.discount_error ? '<p class="bg-err" id="bg-code-err">' + h(q.discount_error) + "</p>" : "") + (code ? '<button type="button" class="bg-quiet" data-bg-disc-remove>Remove code</button>' : "") + '<p class="bg-meta">The preview has one sample code, PREVIEW10. No real offers are running.</p></form></details>' +
      '<a class="bg-checkout' + (blocked ? " is-blocked" : "") + '" href="/checkout"' + (blocked ? ' aria-disabled="true" data-bg-blocked' : "") + '>Checkout<span aria-hidden="true">→</span></a>' + (why ? '<p class="bg-why" id="bg-why">' + why + "</p>" : "") +
      '<p class="bg-meta">' + (window.BCCStaticPreview ? 'Checkout is switched off on this shared preview. Your bag is kept in this browser; checkout works in the local preview.' : 'No account needed. Prices are samples and no money is taken in the preview.') + '</p><a class="bg-link" href="/shop">Continue shopping</a>' +
      '<details class="bg-pin"><summary>Check a pincode</summary><form id="pincode-form" class="bg-pin-form" novalidate><label for="pincode">Pincode</label><div class="bg-inline"><input id="pincode" name="pincode" inputmode="numeric" autocomplete="postal-code" maxlength="6" pattern="[1-9][0-9]{5}"><button type="submit">Check</button></div><p id="pincode-result" role="status" class="bg-meta"></p></form></details>' +
      '<p class="bg-policy"><a href="/policies/shipping">Shipping &amp; Delivery</a> · <a href="/policies/returns">Returns &amp; Refunds</a> · <a href="/help">Help Centre</a></p></aside>';
  }
  function savedList(v) {
    var list = saved();
    if (!list.length) return "";
    return '<section class="bg-saved" aria-labelledby="bg-saved-h"><h2 id="bg-saved-h" class="bg-sec-h">Saved for later <span class="bg-count">' + list.length + '</span></h2><p class="bg-meta">Kept in this browser. Not reserved, and not part of your total.</p><ul>' + list.map(function (s) {
      var p = product(s.id); if (!p) return "";
      return '<li style="--bg-cap:' + h(p.color) + '"><img src="/web/media/' + h(p.id) + '.webp" alt="" width="720" height="1000" loading="lazy"><span><a href="/products/' + h(p.id) + '">' + h(p.name) + "</a><small>Sample price " + money(p.price) + (p.price !== s.price && typeof s.price === "number" ? " (was " + money(s.price) + ")" : "") + (p.stock < 1 || !p.published ? " · not available right now" : "") + '</small></span><button type="button" class="bg-quiet" data-bg-restore="' + h(p.id) + '"' + (p.stock < 1 || !p.published ? " disabled" : "") + '>Move to bag</button><button type="button" class="bg-quiet" data-bg-forget="' + h(p.id) + '">Remove<span class="bg-sr"> ' + h(p.name) + " from saved</span></button></li>";
    }).join("") + "</ul></section>";
  }
  function body(v) {
    var items = bag(), q = quote;
    var notes = notices.length ? '<div class="bg-notice" role="status"><p><strong>Your bag was updated.</strong></p><ul>' + notices.map(function (n) { return "<li>" + h(n) + "</li>"; }).join("") + '</ul><button type="button" class="bg-quiet" data-bg-dismiss>OK</button></div>' : "";
    var err = lastError ? '<div class="bg-notice is-error" role="alert"><p><strong>We couldn’t update your bag.</strong> ' + h(lastError) + ' Your items are kept.</p><button type="button" class="bg-btn" data-bg-retry>Try again</button></div>' : "";
    var u = undo ? '<div class="bg-undo" role="status"><span>' + h(undo.text) + '</span><button type="button" class="bg-btn" data-bg-undo>Undo</button></div>' : "";
    if (!items.length) {
      return u + notes + '<div class="bg-empty"><div class="bg-caps" aria-hidden="true">' + (A().catalog() || []).map(function (p) { return '<span style="--bg-cap:' + h(p.color) + '"></span>'; }).join("") + '</div><h2 class="bg-sec-h">Your bag is empty</h2><p>Pick a cap and add something to it.</p><a class="bg-btn" href="/shop">Shop all seven</a></div>' + savedList(v);
    }
    var n = items.reduce(function (s, i) { return s + i.quantity; }, 0);
    return u + notes + err + '<div class="bg-grid"><div class="bg-lines-col"><p class="bg-count-line">' + n + " item" + (n === 1 ? "" : "s") + '</p><ul class="bg-lines" aria-busy="' + (busy ? "true" : "false") + '">' + items.map(function (i) { return line(v, i, q); }).join("") + "</ul>" + savedList(v) + "</div>" + summary(v, q) + "</div>" +
      '<div class="bg-bar" aria-hidden="false"><span><small>Sample total</small><strong>' + (q ? money(q.total) : "—") + '</strong></span><a class="bg-checkout' + (!q || !q.ready ? " is-blocked" : "") + '" href="/checkout"' + (!q || !q.ready ? ' aria-disabled="true" data-bg-blocked' : "") + '>Checkout<span aria-hidden="true">→</span></a></div>';
  }
  function compose(v) {
    return '<div class="bg bg-' + v.key + '" data-bg data-bg-design="' + v.key + '"><header class="bg-head"><p class="bg-kicker">' + v.kicker + '</p><h1 class="bg-h1">' + (v.title || "Your bag") + '</h1></header><p class="bg-sr" role="status" id="bg-status"></p><div class="bg-body" id="bg-body">' + body(v) + "</div></div>";
  }

  /* ---------------- directions ---------------- */
  var V = {
    a: { key: "a", kicker: "BCC / Bag" , title: "YOUR BAG." },
    b: { key: "b", kicker: "Your bag" },
    c: { key: "c", kicker: "The counter", title: "Your <em>bag</em>" },
    d: { key: "d", kicker: "Your selection · after hours" },
    e: { key: "e", kicker: "Bag · Body Café Co." },
    f: { key: "f", kicker: "Edition 01 · Your bag" },
    g: { key: "g", kicker: "Bag / contact sheet" },
    h: { key: "h", kicker: "Bag · Reference" },
  };
  Object.keys(V).forEach(function (d) {
    if (!S.themes[d]) return;
    var base = S.themes[d], next = {};
    Object.keys(base).forEach(function (k) { next[k] = base[k]; });
    next.cart = function () { return compose(V[d]); };
    S.themes[d] = next;
  });

  /* ---------------- behaviour ---------------- */
  var cleanup = function () {};
  function enhance() {
    cleanup();
    var root = document.querySelector("[data-bg]");
    if (!root) return;
    var v = V[root.getAttribute("data-bg-design")] || V.a;
    var abort = new AbortController(), on = function (el, ev, fn, o) { if (el) el.addEventListener(ev, fn, Object.assign({ signal: abort.signal }, o || {})); };
    var status = root.querySelector("#bg-status");
    notices = []; undo = null;
    var carried = sread("bcc-bag-notice"); if (carried) { note(carried); swrite("bcc-bag-notice", ""); }
    function paint(focusSel) {
      var active = document.activeElement, key = focusSel || (active && root.contains(active) ? keyOf(active) : null);
      root.querySelector("#bg-body").innerHTML = body(v);
      watchBar();
      A().renderCount();
      A().keepDesignOnLinks();
      if (key) { var el = root.querySelector(key); if (el && !el.disabled) el.focus({ preventScroll: true }); else { var hd = root.querySelector(".bg-count-line, .bg-empty h2"); if (hd) { hd.setAttribute("tabindex", "-1"); hd.focus({ preventScroll: true }); } } }
    }
    /* The compact mobile bar steps aside while the summary's own Checkout button is on screen, so the two never compete. */
    var io = null;
    function watchBar() {
      if (io) io.disconnect();
      var bar = root.querySelector(".bg-bar"), main = root.querySelector(".bg-summary .bg-checkout");
      if (!bar || !main || !("IntersectionObserver" in window)) return;
      io = new IntersectionObserver(function (en) { bar.classList.toggle("is-away", en[0].isIntersecting); });
      io.observe(main);
    }
    function keyOf(el) {
      for (var i = 0, a = ["data-bg-qty", "data-bg-save", "data-bg-remove", "data-bg-restore", "data-bg-forget"]; i < a.length; i++) if (el.hasAttribute(a[i])) return "[" + a[i] + '="' + el.getAttribute(a[i]) + '"]' + (el.hasAttribute("data-d") ? '[data-d="' + el.getAttribute("data-d") + '"]' : "");
      if (el.id) return "#" + el.id;
      return null;
    }
    async function refresh(msg, focusSel) {
      paint(focusSel);
      await check();
      paint(focusSel);
      if (msg) status.textContent = msg + (quote ? " Sample total " + money(quote.total) + "." : "");
    }
    function setQty(id, qty) {
      var items = bag().map(function (x) { return { id: x.id, quantity: x.id === id ? qty : x.quantity, price: x.price }; }).filter(function (x) { return x.quantity > 0; });
      A().setCart(items); sync();
    }
    function remove(id, how) {
      var items = bag(), idx = items.findIndex(function (x) { return x.id === id; }), it = items[idx], p = product(id);
      if (!it) return;
      undo = { item: it, index: idx, text: (p ? p.name : "Item") + (how === "save" ? " moved to Saved for later." : " removed from your bag."), how: how };
      if (how === "save") { var s = saved().filter(function (x) { return x.id !== id; }); s.unshift({ id: id, price: p ? p.price : it.price, quantity: it.quantity, saved: Date.now() }); setSaved(s.slice(0, 30)); }
      A().setCart(items.filter(function (x) { return x.id !== id; })); sync();
      refresh(undo.text, "[data-bg-undo]");
    }
    on(root, "click", function (e) {
      var t = e.target.closest("button, a"); if (!t || !root.contains(t)) return;
      if (t.matches("[data-bg-blocked]")) { e.preventDefault(); e.stopPropagation(); var w = root.querySelector("#bg-why"); status.textContent = w ? w.textContent : "Your bag is still being checked."; if (w) { w.setAttribute("tabindex", "-1"); w.focus(); } return; }
      if (t.hasAttribute("data-bg-qty")) {
        var id = t.getAttribute("data-bg-qty"), cur = (bag().filter(function (x) { return x.id === id; })[0] || {}).quantity || 0, nq = cur + Number(t.getAttribute("data-d"));
        if (nq < 1) return remove(id, "remove");
        var ql = quote && quote.lines.filter(function (x) { return x.id === id; })[0];
        if (ql && nq > ql.max) { status.textContent = "That’s the most available for " + ql.name + "."; return; }
        undo = null; setQty(id, nq); refresh((product(id) || {}).name + " quantity " + nq + ".");
      } else if (t.hasAttribute("data-bg-remove")) remove(t.getAttribute("data-bg-remove"), "remove");
      else if (t.hasAttribute("data-bg-save")) remove(t.getAttribute("data-bg-save"), "save");
      else if (t.hasAttribute("data-bg-undo") && undo) {
        var items = bag().filter(function (x) { return x.id !== undo.item.id; }); items.splice(Math.min(undo.index, items.length), 0, undo.item);
        A().setCart(items); if (undo.how === "save") setSaved(saved().filter(function (x) { return x.id !== undo.item.id; })); sync();
        var back = undo.item.id; undo = null; refresh("Restored " + ((product(back) || {}).name || "item") + ".", '[data-bg-qty="' + back + '"][data-d="1"]');
      } else if (t.hasAttribute("data-bg-restore")) {
        var rid = t.getAttribute("data-bg-restore"), s = saved().filter(function (x) { return x.id === rid; })[0];
        var items2 = bag(); if (!items2.some(function (x) { return x.id === rid; })) items2.push({ id: rid, quantity: Math.min(10, (s && s.quantity) || 1), price: (product(rid) || {}).price });
        A().setCart(items2); setSaved(saved().filter(function (x) { return x.id !== rid; })); sync(); undo = null;
        refresh(((product(rid) || {}).name || "Item") + " moved back to your bag.");
      } else if (t.hasAttribute("data-bg-forget")) { setSaved(saved().filter(function (x) { return x.id !== t.getAttribute("data-bg-forget"); })); refresh("Removed from Saved for later."); }
      else if (t.hasAttribute("data-bg-retry")) refresh("Checked again.");
      else if (t.hasAttribute("data-bg-dismiss")) { notices = []; paint(".bg-count-line"); }
      else if (t.hasAttribute("data-bg-disc-remove")) { swrite("bcc-discount", ""); refresh("Discount code removed.", "#bg-code"); }
    }, { capture: true });
    on(root, "submit", function (e) {
      var f = e.target.closest("[data-bg-disc]"); if (!f) return;
      e.preventDefault(); e.stopPropagation();
      var code = f.elements.code.value.trim().toUpperCase();
      swrite("bcc-discount", code);
      refresh(code ? "Discount code checked." : "Discount code removed.", "#bg-code").then(function () { if (quote && quote.discount_applied) status.textContent = quote.discount_applied.label + " applied. Sample total " + money(quote.total) + "."; else if (quote && quote.discount_error) status.textContent = quote.discount_error; });
    }, { capture: true });
    on(window, "storage", function (e) { if (e.key === "bcc-cart" || e.key === "bcc-saved") { A().reloadCart(); refresh("Your bag changed in another tab."); } });
    on(window, "online", function () { if (lastError) refresh("Back online."); });
    refresh();
    cleanup = function () { abort.abort(); if (io) io.disconnect(); };
  }

  window.BCCBag = { enhance: enhance, check: check, afterSignIn: afterSignIn, sync: sync, quote: function () { return quote; }, discount: discountCode, saved: saved };
})();
