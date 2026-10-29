/* Body Café Co. — sign-in, account, order and payment pages for all eight directions (A–H).

   One behaviour, eight looks (account.css, scoped .ac-a … .ac-h). Replaces each theme's `account`, `order` and
   `payment` renderers for real records; the synthetic design states (?state=… on SAMPLE- records) still use the
   theme's own renderers. Also adds the /sign-in page and the checkout and support-form continuity.

   Sign-in: mobile one-time code (POST /api/auth/otp, /api/auth/verify). In the local preview the code is shown on the
   page and nothing is sent; the page never says a message was sent. After verification the shopper returns to the
   task they came from (?next=, internal destinations only), with their bag combined with any account bag.

   Accuracy rules carried in code: no invoices are shown because none are issued; tracking is labelled simulated;
   lots come from the order's own allocation, never the newest lot; cancellation follows the existing order states
   and returns/refunds point to support because the terms aren't approved; an uncertain payment must be checked
   before any retry. */
(function () {
  "use strict";
  var S = window.BCCSite;
  if (!S || !S.themes) return;
  var A = function () { return window.BCCApp; };

  function h(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function money(n) { return "₹" + Number(n || 0).toLocaleString("en-IN"); }
  function day(n) { return n ? new Date(n * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""; }
  function sread(k) { try { return sessionStorage.getItem(k) || ""; } catch (e) { return ""; } }
  function swrite(k, v) { try { if (v) sessionStorage.setItem(k, v); else sessionStorage.removeItem(k); } catch (e) {} }
  function product(id) { return (A().catalog() || []).filter(function (p) { return p.id === id; })[0]; }
  function isCustomer(u) { return !!(u && String(u.id).indexOf("customer-") === 0); }
  function design() { return new URL(location.href).searchParams.get("design") || ""; }

  /* ---------------- safe return destinations ---------------- */
  var NEXT_OK = [/^\/checkout$/, /^\/cart$/, /^\/orders\/BCC-[0-9A-F]{8}$/, /^\/payment\/BCC-[0-9A-F]{8}$/, /^\/products\/[a-z0-9-]{1,60}$/, /^\/contact$/,
    /^\/account(\/(orders|addresses|support|reviews|profile|preferences))?$/];
  function safeNext(raw) {
    if (!raw) return "/account";
    var u;
    try { u = new URL(raw, location.origin); } catch (e) { return "/account"; }
    if (u.origin !== location.origin || !NEXT_OK.some(function (r) { return r.test(u.pathname); })) return "/account";
    u.searchParams.delete("design");
    if (u.pathname !== "/contact") ["order", "kind", "topic", "lot"].forEach(function (k) { if (u.pathname !== "/contact") u.searchParams.delete(k); });
    if (u.hash && !/^#[a-z0-9-]{1,40}$/.test(u.hash)) u.hash = "";
    return u.pathname + u.search + u.hash;
  }
  function signInHref(next) { return "/sign-in?next=" + encodeURIComponent(next); }
  var TASK = { "/checkout": "checkout", "/cart": "your bag", "/contact": "your support message", "/account": "your account" };
  function taskName(next) {
    if (/^\/orders\//.test(next)) return "order " + next.split("/")[2];
    if (/^\/payment\//.test(next)) return "payment for " + next.split("/")[2];
    if (/^\/products\//.test(next)) { var p = product(next.split("/")[2].split("#")[0]); return p ? "reviewing " + p.name : "the product page"; }
    return TASK[next.split("?")[0]] || (next.indexOf("/account") === 0 ? "your account" : "where you were");
  }

  /* ---------------- labels shared by every direction ---------------- */
  var FUL = { pending: "Awaiting payment", paid: "Preparing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled", expired: "Expired" };
  var PAY = { pending: "Not paid yet", captured: "Paid (preview)", failed: "Payment failed", cancelled: "Payment cancelled", processing: "Being confirmed" };
  function chip(text, kind) { return '<span class="ac-chip' + (kind ? " is-" + kind : "") + '">' + h(text) + "</span>"; }
  function stateChips(o) {
    var payKind = o.payment === "captured" ? "ok" : o.payment === "processing" ? "warn" : o.payment === "failed" ? "bad" : "";
    return chip(FUL[o.state] || o.state, o.state === "delivered" ? "ok" : o.state === "cancelled" || o.state === "expired" ? "muted" : "") + chip(PAY[o.payment] || "Payment: " + (o.payment || "unknown"), payKind);
  }
  function thumb(id) { var p = product(id); return p ? '<img src="' + window.BCCBottleAssets.url(h(p.id)) + '" alt="" width="720" height="1000" loading="lazy" decoding="async" style="--ac-cap:' + h(p.color) + '">' : ""; }

  /* ---------------- sign-in ---------------- */
  function signInBlock(v, next, embedded) {
    if (window.BCCConnectedHosted) return '<section class="ac-strip"><h2 class="ac-h3">Customer sign-in opens soon</h2><p>Support cases from this browser remain available below. Customer accounts will open when ordering launches.</p></section>';

    var pending = JSON.parse(sread("bcc-otp") || "null");
    var mobile = pending && pending.mobile || "";
    return '<section class="ac-signin' + (embedded ? " is-embedded" : "") + '" data-ac-signin data-next="' + h(next) + '" aria-labelledby="ac-si-h">' +
      '<div class="ac-si-intro"><p class="ac-k">' + h(v.k("Sign in")) + '</p><h' + (embedded ? 2 : 1) + ' class="ac-' + (embedded ? "h2" : "h1") + '" id="ac-si-h">' + (embedded ? "Sign in or create your account" : v.signTitle || "Sign in or create your account") + "</h" + (embedded ? 2 : 1) + ">" +
      '<p class="ac-lede">Use your mobile number. We check it with a one-time code so only you can see your orders, addresses and cases.</p>' +
      '<ul class="ac-ticks"><li><strong>Returning?</strong> You’ll go straight back to ' + h(taskName(next)) + ".</li><li><strong>New number?</strong> Verifying it creates your account. Orders you placed as a guest in this browser with the same number join it.</li><li>Your bag and any details you’ve typed are kept.</li></ul></div>" +
      '<div class="ac-si-steps"><form class="ac-form" data-ac-mobile novalidate' + (pending ? " hidden" : "") + '><label for="ac-mobile">Mobile number</label><span class="ac-hint" id="ac-mobile-hint">10-digit Indian mobile number</span><div class="ac-phone"><span class="ac-cc" aria-hidden="true">+91</span><input id="ac-mobile" name="mobile" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="10" value="' + h(mobile) + '" aria-describedby="ac-mobile-hint ac-mobile-err"></div><p class="ac-err" id="ac-mobile-err" hidden></p>' +
      '<button type="submit" class="ac-btn">Send code</button><p class="ac-small">Sign-in is optional for checkout. You can also <a href="/checkout">check out as a guest</a>.</p></form>' +
      '<form class="ac-form" data-ac-code novalidate' + (pending ? "" : " hidden") + '><p class="ac-dest" data-ac-dest>' + (pending ? destText(pending) : "") + '</p><button type="button" class="ac-quiet" data-ac-change>Change number</button>' +
      '<div class="ac-preview" data-ac-preview' + (pending && pending.preview_code ? "" : " hidden") + ' role="status">' + (pending && pending.preview_code ? previewText(pending.preview_code) : "") + "</div>" +
      '<label for="ac-code">6-digit code</label><input id="ac-code" class="ac-code" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="12" spellcheck="false" aria-describedby="ac-code-hint ac-code-err"><span class="ac-hint" id="ac-code-hint">You can paste the whole code.</span><p class="ac-err" id="ac-code-err" hidden></p>' +
      '<button type="submit" class="ac-btn">Verify and continue</button><p class="ac-small" data-ac-timers aria-live="off"></p><button type="button" class="ac-quiet" data-ac-resend hidden>Resend code</button></form></div></section>';
  }
  function destText(p) { return "Code for <strong>" + h(p.destination || "") + "</strong>" + (p.mode === "preview" ? ". Preview: no SMS is sent." : "."); }
  function previewText(code) { return '<p class="ac-small">Preview only. In the live store this code would arrive by SMS.</p><p class="ac-preview-code">Your code: <strong>' + h(code) + "</strong></p>"; }

  /* ---------------- account ---------------- */
  var TABS = [["overview", "Overview", "/account"], ["orders", "Orders", "/account/orders"], ["addresses", "Addresses", "/account/addresses"], ["support", "Support", "/account/support"], ["reviews", "Reviews", "/account/reviews"], ["profile", "Profile & security", "/account/profile"], ["preferences", "Preferences", "/account/preferences"]];
  function nav(tab, signed) {
    return '<nav class="ac-nav" aria-label="Account"><ul>' + TABS.filter(function (t) { return signed || ["overview", "orders", "support", "preferences"].indexOf(t[0]) >= 0; }).map(function (t) { return '<li><a href="' + t[2] + '"' + (t[0] === tab ? ' aria-current="page"' : "") + ">" + t[1] + "</a></li>"; }).join("") + "</ul></nav>";
  }
  function orderRow(o) {
    var n = o.items.reduce(function (s, i) { return s + i.quantity; }, 0);
    return '<li class="ac-order"><a href="/orders/' + h(o.id) + '"><span class="ac-thumbs" aria-hidden="true">' + o.items.slice(0, 4).map(function (i) { return thumb(i.id); }).join("") + '</span><span class="ac-order-main"><strong>' + h(o.id) + "</strong><small>" + day(o.created) + " · " + n + " item" + (n === 1 ? "" : "s") + " · " + money(o.total) + " sample total</small><small>" + o.items.map(function (i) { return h(i.name); }).join(", ") + '</small></span><span class="ac-order-st">' + stateChips(o) + '</span><span class="ac-arr" aria-hidden="true">→</span></a></li>';
  }
  function overview(a, u) {
    var active = a.orders.filter(function (o) { return ["pending", "paid", "shipped"].indexOf(o.state) >= 0; });
    var delivered = a.orders.filter(function (o) { return o.state === "delivered"; });
    var cards = active.map(function (o) {
      var act = o.state === "pending" ? (o.payment === "processing" ? ["Check payment status", "/payment/" + o.id] : ["Complete payment", "/payment/" + o.id]) : ["View order", "/orders/" + o.id];
      return '<li class="ac-next"><p class="ac-k">' + h(o.id) + " · " + day(o.created) + "</p><h3>" + h(o.next ? o.next.title : FUL[o.state]) + "</h3><p>" + h(o.next ? o.next.text : "") + '</p><p class="ac-next-st">' + stateChips(o) + '</p><a class="ac-btn" href="' + act[1] + '">' + act[0] + "</a></li>";
    }).join("");
    var open = (a.cases || []).filter(function (c) { return c.state !== "resolved"; });
    return '<div class="ac-overview">' + (cards ? '<section aria-labelledby="ac-active-h"><h2 class="ac-h2" id="ac-active-h">Active orders</h2><ul class="ac-nexts">' + cards + "</ul></section>" : '<section class="ac-empty"><h2 class="ac-h2">No active orders</h2><p>When you order, its next step shows here.</p><a class="ac-btn" href="/shop">Shop all seven</a></section>') +
      (delivered.length && isCustomer(u) ? '<section class="ac-strip"><h2 class="ac-h3">Delivered</h2><p>' + delivered.length + " delivered order" + (delivered.length === 1 ? "" : "s") + '. You can review what you received.</p><a class="ac-link" href="/account/reviews">Your reviews →</a></section>' : "") +
      (open.length ? '<section class="ac-strip"><h2 class="ac-h3">Support</h2><p>' + open.length + " open case" + (open.length === 1 ? "" : "s") + '.</p><a class="ac-link" href="/account/support">Follow your cases →</a></section>' : "") +
      '<section class="ac-strip"><h2 class="ac-h3">Lot reports</h2><p>Each delivered or paid order lists the lots it was allocated, with a link to their records.</p><a class="ac-link" href="/account/orders">Your orders →</a></section></div>';
  }
  function orders(a) {
    return a.orders.length ? '<ul class="ac-orders">' + a.orders.map(orderRow).join("") + "</ul>" : '<div class="ac-empty"><h2 class="ac-h2">No orders yet</h2><p>Orders you place show here, with their payment and delivery status.</p><a class="ac-btn" href="/shop">Shop all seven</a></div>';
  }
  var ADDR = [["name", "Full name", "name"], ["address", "House or flat, street and area", "street-address"], ["city", "City", "address-level2"], ["state", "State", "address-level1"], ["pincode", "Pincode", "postal-code"]];
  function addressForm(id, v, title) {
    v = v || {};
    return '<form class="ac-form ac-addr-form" data-ac-address="' + h(id || "") + '" novalidate><h3 class="ac-h3">' + title + '</h3><div class="ac-grid">' + ADDR.map(function (f) {
      var fid = "ac-a-" + (id || "new") + "-" + f[0];
      return '<div class="ac-field' + (f[0] === "address" ? " is-wide" : "") + '"><label for="' + fid + '">' + f[1] + '</label><input id="' + fid + '" name="' + f[0] + '" autocomplete="' + f[2] + '" value="' + h(v[f[0]] || "") + '"' + (f[0] === "pincode" ? ' inputmode="numeric" maxlength="6"' : ' maxlength="200"') + ' aria-describedby="' + fid + '-err"><p class="ac-err" id="' + fid + '-err" hidden></p></div>';
    }).join("") + '</div><label class="ac-check"><input type="checkbox" name="default"' + (v.isDefault ? " checked disabled" : "") + "> Use as my default address</label><p class=\"ac-err\" data-ac-form-err hidden></p>" +
      '<div class="ac-row"><button type="submit" class="ac-btn">Save address</button>' + (id ? '<button type="button" class="ac-quiet" data-ac-cancel-edit>Cancel</button>' : "") + "</div></form>";
  }
  function addresses(a) {
    var def = a.profile && a.profile.default_address;
    return '<div class="ac-cols"><section aria-labelledby="ac-addr-h"><h2 class="ac-h2" id="ac-addr-h">Saved addresses</h2>' + (a.addresses.length ? '<ul class="ac-addrs">' + a.addresses.map(function (x) {
      var isDef = x.id === def;
      return '<li class="ac-addr" data-ac-addr-item="' + h(x.id) + '"><address><strong>' + h(x.name) + "</strong><br>" + h(x.address) + "<br>" + h(x.city) + ", " + h(x.state) + " " + h(x.pincode) + "</address>" + (isDef ? chip("Default", "ok") : "") +
        '<div class="ac-row"><button type="button" class="ac-quiet" data-ac-edit="' + h(x.id) + '">Edit</button>' + (isDef ? "" : '<button type="button" class="ac-quiet" data-ac-default="' + h(x.id) + '">Set as default</button>') + '<button type="button" class="ac-quiet" data-ac-delete="' + h(x.id) + '">Remove</button></div><div data-ac-edit-slot hidden>' + addressForm(x.id, Object.assign({ isDefault: isDef }, x), "Edit address") + "</div></li>";
    }).join("") + "</ul>" : '<p class="ac-small">No saved addresses yet. Add one and it’s filled in at checkout.</p>') + "</section><section>" + addressForm("", {}, "Add an address") + "</section></div>";
  }
  function support(a, u, v) {
    var cases = a.cases || [];
    var m = location.pathname.match(/^\/account\/support\/(CASE-[0-9A-F]{8})$/);
    if (m && window.BCCSupport) return '<p><a class="ac-link" href="/account/support">← All your cases</a></p><div class="su su-' + v.key + ' su-embed">' + window.BCCSupport.caseDetail(null, cases.filter(function (c) { return c.id === m[1]; })[0], isCustomer(u)) + "</div>";
    return '<section aria-labelledby="ac-sup-h"><div class="ac-head-row"><h2 class="ac-h2" id="ac-sup-h">Your support cases</h2><a class="ac-btn" href="/contact">Open a case</a></div>' +
      (a.orders.length ? '<form class="ac-form ac-inline-form" data-ac-order-case><label for="ac-case-order">About an order</label><select id="ac-case-order" name="order">' + a.orders.map(function (o) { return '<option value="' + h(o.id) + '">' + h(o.id) + " · " + day(o.created) + " · " + h(FUL[o.state] || o.state) + "</option>"; }).join("") + '</select><button type="submit" class="ac-btn">Start a case about this order</button></form>' : "") +
      (cases.length ? '<ul class="ac-cases">' + cases.map(function (c) {
        return '<li class="ac-case"><p class="ac-k"><a href="/account/support/' + h(c.id) + '">' + h(c.id) + "</a> · " + h(({ product_question: "Product question", brand: "About the brand", learn: "Learn guide", report: "Lot report", delivery: "Delivery", "return": "Return", replacement: "Replacement", safety: "Product safety", general: "General" })[c.kind] || c.kind) + "</p>" + chip(({ open: "Open", investigating: "Investigating", escalated: "Escalated", resolved: "Resolved" })[c.state] || c.state, c.state === "resolved" ? "ok" : "") +
          (c.subject ? "<p><strong>" + h(c.subject) + "</strong></p>" : "") + "<p>" + h(c.message) + "</p>" + (c.order_id ? '<p class="ac-small">Order <a href="/orders/' + h(c.order_id) + '">' + h(c.order_id) + "</a></p>" : "") +
          ((c.history || []).length ? '<ol class="ac-hist">' + c.history.map(function (x) { return "<li>" + h(x.state) + " · " + day(x.at) + "</li>"; }).join("") + "</ol>" : "") +
          (c.public && c.public.answer ? '<div class="ac-answer"><p class="ac-k">Answer from Body Café Co.</p><p>' + h(c.public.answer) + "</p></div>" : "") + '<p class="ac-small">' + h(c.owner || "") + " · " + h(c.sla || "") + "</p></li>";
      }).join("") + "</ul>" : '<div class="ac-empty"><p>No cases yet. A case keeps the whole conversation, with your order attached, in one place.</p></div>') + "</section>";
  }
  function reviews(a) {
    var delivered = [];
    a.orders.filter(function (o) { return o.state === "delivered"; }).forEach(function (o) { o.items.forEach(function (i) { if (!delivered.some(function (d) { return d.id === i.id; })) delivered.push({ id: i.id, name: i.name, order: o.id }); }); });
    var mine = a.reviews || [];
    var RS = { pending: "Awaiting moderation", published: "Published", rejected: "Not published" };
    return '<section aria-labelledby="ac-rev-h"><h2 class="ac-h2" id="ac-rev-h">Reviews</h2><p class="ac-small">You can review products from delivered orders. Every review is moderated before it appears, and a low rating is never a reason to reject one.</p>' +
      (delivered.length ? '<ul class="ac-revs">' + delivered.map(function (d) {
        var r = mine.filter(function (x) { return x.product === d.id; })[0];
        return '<li class="ac-rev">' + thumb(d.id) + '<span><strong>' + h(d.name) + "</strong><small>From order " + h(d.order) + "</small></span>" + (r ? chip(RS[r.state] || r.state, r.state === "published" ? "ok" : "") : '<a class="ac-btn" href="/products/' + h(d.id) + '#reviews">Write a review</a>') + "</li>";
      }).join("") + "</ul>" : '<div class="ac-empty"><p>Nothing to review yet. Products appear here once an order is delivered.</p></div>') + "</section>";
  }
  function profile(a, u) {
    var p = a.profile || {};
    return '<div class="ac-cols"><form class="ac-form" data-ac-profile novalidate><h2 class="ac-h2">Profile</h2><div class="ac-field"><label for="ac-name">Name</label><input id="ac-name" name="name" autocomplete="name" maxlength="80" value="' + h(p.name === "Customer" ? "" : p.name) + '" aria-describedby="ac-name-err"><p class="ac-err" id="ac-name-err" hidden></p></div>' +
      '<div class="ac-field"><label for="ac-email">Email (optional)</label><span class="ac-hint" id="ac-email-hint">Not verified: email isn’t connected in the preview, so nothing is sent to it.</span><input id="ac-email" name="email" type="email" autocomplete="email" maxlength="254" value="' + h(p.email) + '" aria-describedby="ac-email-hint ac-email-err"><p class="ac-err" id="ac-email-err" hidden></p></div><button type="submit" class="ac-btn">Save profile</button></form>' +
      '<section class="ac-sec"><h2 class="ac-h2">Security</h2><dl class="ac-dl"><div><dt>Verified mobile</dt><dd>+91 ' + h(String(p.mobile || "").slice(0, 2)) + "••••••" + h(String(p.mobile || "").slice(-2)) + ' <small>Verified by one-time code</small></dd></div><div><dt>Signed-in sessions</dt><dd>' + h(a.sessions || 1) + "</dd></div></dl>" +
      '<p class="ac-small">To change your verified number, <a href="/contact?kind=general">contact support</a>. Number changes need a support check because your orders are tied to it.</p><div class="ac-row"><button type="button" class="ac-btn" data-action="logout">Sign out</button><button type="button" class="ac-quiet" data-ac-everywhere>Sign out on all devices</button></div></section>' + privacySection() + "</div>";
  }
  var PRIV = [["access", "A copy of my personal data"], ["correction", "Correct or update my data"], ["erasure", "Delete my account and data"], ["withdraw", "Withdraw a consent"], ["nominate", "Nominate someone to act for me"], ["grievance", "A privacy complaint"], ["other", "Something else"]];
  function privacySection() {
    return '<section class="ac-sec ac-privacy" id="privacy" aria-labelledby="ac-priv-h"><h2 class="ac-h2" id="ac-priv-h">Your data and privacy</h2>' +
      '<p>Download a copy of what we hold for this account now, or make a request. Requests are tied to your verified number, get a reference and appear under Support.</p>' +
      '<div class="ac-row"><button type="button" class="ac-btn" data-ac-export>Download my data</button></div><p class="ac-small" role="status" data-ac-export-status></p>' +
      '<form class="ac-form" data-ac-privacy novalidate><div class="ac-field"><label for="ac-priv-kind">Request</label><select id="ac-priv-kind" name="request" aria-describedby="ac-priv-kind-err"><option value="">Choose a request</option>' + PRIV.map(function (x) { return '<option value="' + x[0] + '">' + x[1] + "</option>"; }).join("") + '</select><p class="ac-err" id="ac-priv-kind-err" hidden></p></div>' +
      '<p class="ac-small" data-ac-priv-hint>To stop marketing, you don’t need a request: turn it off in <a href="/account/preferences">Preferences</a>.</p>' +
      '<div class="ac-field"><label for="ac-priv-msg">Details <small>(needed for corrections, nominations, complaints and “something else”)</small></label><textarea id="ac-priv-msg" name="message" rows="3" maxlength="3000" aria-describedby="ac-priv-msg-err"></textarea><p class="ac-err" id="ac-priv-msg-err" hidden></p></div>' +
      '<button type="submit" class="ac-btn">Send request</button><p class="ac-small" role="status" data-ac-priv-status></p></form>' +
      '<p class="ac-small">How we handle your data: <a href="/policies/privacy">Privacy</a>.</p></section>';
  }
  function prefs(a, u, v) {
    if (window.BCCSupport) return '<section aria-labelledby="ac-prefs-h"><h2 class="ac-h2" id="ac-prefs-h">Privacy & communication preferences</h2>' + '<div class="su su-' + v.key + ' su-embed">' + window.BCCSupport.prefsBody(null, { embedded: true }) + "</div></section>";
    var signed = isCustomer(u), p = signed ? (a.profile && a.profile.prefs) || {} : (function () { try { return JSON.parse(localStorage.getItem("bcc-preferences") || "{}"); } catch (e) { return {}; } })();
    return '<form class="ac-form" data-ac-prefs novalidate><h2 class="ac-h2">Communication preferences</h2><fieldset><legend>Order and service messages</legend><p class="ac-small">Messages about an order you place, a case you open or a safety notice for something you bought. They aren’t marketing, so there’s no switch. In the preview, no messages are sent at all.</p></fieldset>' +
      '<fieldset><legend>Optional marketing</legend><label class="ac-check"><input type="checkbox" name="email"' + (p.email ? " checked" : "") + '> Email updates about new products and guides</label><label class="ac-check"><input type="checkbox" name="whatsapp"' + (p.whatsapp ? " checked" : "") + '> WhatsApp updates</label><p class="ac-small">Off unless you turn them on. ' + (signed ? "Saved to your account" + (a.profile && a.profile.prefs_updated ? " (last changed " + day(a.profile.prefs_updated) + ")" : "") + "." : "Saved in this browser only. Sign in to save them to your account.") + "</p></fieldset>" +
      '<button type="submit" class="ac-btn">Save preferences</button><p class="ac-small" role="status" data-ac-prefs-status></p></form>';
  }
  function accountPage(v, ctx, tab) {
    var a = ctx.account || { orders: [], addresses: [], cases: [], reviews: [] }, u = ctx.user, signed = isCustomer(u);
    var map = { orders: "orders", addresses: "addresses", support: "support", cases: "support", reviews: "reviews", profile: "profile", preferences: "preferences" };
    tab = map[tab] || "overview";
    if (!signed && ["addresses", "reviews", "profile"].indexOf(tab) >= 0) tab = "overview";
    var title = signed ? (a.profile && a.profile.name && a.profile.name !== "Customer" ? "Hello, " + h(a.profile.name.split(" ")[0]) : "Your account") : "Your account";
    var lede = signed ? "Signed in with +91 ••••••" + h(String(u.mobile).slice(-4)) + "." : "You’re not signed in. Orders and support cases from this browser session are listed here. Sign in to keep them with your account.";
    var body = tab === "orders" ? orders(a) : tab === "addresses" ? addresses(a) : tab === "support" ? support(a, u, v) : tab === "reviews" ? reviews(a) : tab === "profile" ? profile(a, u) : tab === "preferences" ? prefs(a, u, v) : overview(a, u);
    return '<div class="ac ac-' + v.key + '" data-ac data-ac-page="account"><header class="ac-head"><p class="ac-k">' + h(v.k("Account")) + '</p><h1 class="ac-h1">' + title + '</h1><p class="ac-lede">' + lede + "</p>" + (signed ? '<button type="button" class="ac-quiet ac-signout" data-action="logout">Sign out</button>' : "") + "</header>" +
      (signed ? "" : signInBlock(v, location.pathname === "/account" ? "/account" : location.pathname, true)) + nav(tab, signed) + '<div class="ac-body" id="ac-body">' + body + '</div><p class="ac-sr" role="status" id="ac-status"></p></div>';
  }

  /* ---------------- order ---------------- */
  function timeline(o) {
    var steps = [["pending", "Order created"], ["paid", "Payment received"], ["shipped", "Shipped"], ["delivered", "Delivered"]];
    return '<ol class="ac-steps">' + steps.map(function (s, i) {
      var x = (o.history || []).filter(function (y) { return y.state === s[0]; })[0];
      return '<li class="' + (x ? "is-done" : "") + '"><span class="ac-step-n" aria-hidden="true">' + (x ? "✓" : i + 1) + "</span><strong>" + s[1] + "</strong><small>" + (x ? day(x.at) : "Not yet") + "</small></li>";
    }).join("") + (o.state === "cancelled" ? '<li class="is-done is-cancel"><span class="ac-step-n" aria-hidden="true">×</span><strong>Cancelled</strong><small>' + day(((o.history || []).filter(function (y) { return y.state === "cancelled"; })[0] || {}).at) + "</small></li>" : "") + "</ol>";
  }
  var REASONS = [["damaged", "Arrived damaged"], ["wrong", "Wrong item sent"], ["missing", "Item missing from the parcel"], ["defective", "Problem with the product"], ["expiry", "Expired or close to expiry"], ["change_of_mind", "I changed my mind"], ["other", "Something else"]];
  function returnForm(o) {
    return '<div class="ac-panel" id="ac-return" data-ac-return hidden><form class="ac-form" data-ac-return-form="' + h(o.id) + '" novalidate><h3 class="ac-h3">Report a problem with this order</h3>' +
      '<fieldset><legend>Which items?</legend>' + o.items.map(function (i, n) {
        return '<div class="ac-ret-item"><label class="ac-check"><input type="checkbox" name="item" value="' + h(i.id) + '"' + (o.items.length === 1 ? " checked" : "") + "> " + h(i.name) + "</label>" + (i.quantity > 1 ? '<label class="ac-inline">Quantity <select name="qty-' + h(i.id) + '">' + Array.apply(null, Array(i.quantity)).map(function (_, k) { return '<option value="' + (k + 1) + '"' + (k + 1 === i.quantity ? " selected" : "") + ">" + (k + 1) + "</option>"; }).join("") + "</select></label>" : '<input type="hidden" name="qty-' + h(i.id) + '" value="1">') + "</div>";
      }).join("") + '<p class="ac-err" id="ac-ret-items-err" hidden></p></fieldset>' +
      '<fieldset><legend>What went wrong?</legend>' + REASONS.map(function (r) { return '<label class="ac-check"><input type="radio" name="reason" value="' + r[0] + '"> ' + r[1] + "</label>"; }).join("") + '<p class="ac-small" data-ac-com-note hidden>Change-of-mind returns haven’t been decided yet. You can still ask and we’ll reply on your case.</p><p class="ac-err" id="ac-ret-reason-err" hidden></p></fieldset>' +
      '<fieldset><legend>What would you prefer?</legend><label class="ac-check"><input type="radio" name="remedy" value="either" checked> Either is fine</label><label class="ac-check"><input type="radio" name="remedy" value="refund"> A refund</label><label class="ac-check"><input type="radio" name="remedy" value="replacement"> A replacement</label></fieldset>' +
      '<div class="ac-field"><label for="ac-ret-msg">Tell us what happened</label><textarea id="ac-ret-msg" name="message" rows="4" maxlength="3000" aria-describedby="ac-ret-msg-err"></textarea><p class="ac-err" id="ac-ret-msg-err" hidden></p></div>' +
      '<div class="ac-field"><label for="ac-ret-photos">Photos <small>(optional, up to 2)</small></label><span class="ac-hint" id="ac-ret-photos-hint">They help, but you don’t need them. JPEG, PNG or WebP, 5 MB each; location details are removed.</span><input id="ac-ret-photos" name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple aria-describedby="ac-ret-photos-hint ac-ret-photos-err"><p class="ac-err" id="ac-ret-photos-err" hidden></p></div>' +
      '<p class="ac-small">If you think a product is unsafe or made someone unwell, <a href="/contact?kind=safety&order=' + h(o.id) + '">report a safety concern</a> instead — it’s handled first.</p>' +
      '<div class="ac-row"><button type="submit" class="ac-btn">Send request</button><button type="button" class="ac-quiet" data-ac-problem-close>Cancel</button></div><p class="ac-err" role="alert" data-ac-ret-error hidden></p></form></div>';
  }
  function orderPage(v, ctx, o) {
    var u = ctx.user, a = ctx.account || {}, signed = isCustomer(u);
    if (!o) return '<div class="ac ac-' + v.key + '" data-ac><header class="ac-head"><p class="ac-k">' + h(v.k("Order")) + '</p><h1 class="ac-h1">Order not found</h1><p class="ac-lede">Orders are visible only to the session or verified account that placed them.</p></header><div class="ac-body"><div class="ac-row">' + (signed ? "" : '<a class="ac-btn" href="' + signInHref(location.pathname) + '">Sign in to find it</a>') + '<a class="ac-quiet" href="/account">Your account</a></div></div></div>';
    var canCancel = ["pending", "paid"].indexOf(o.state) >= 0 && o.payment !== "processing";
    var lots = o.lots || [];
    var reviewed = a.reviews || [];
    var items = o.items.map(function (i) {
      var mine = lots.filter(function (l) { return l.product === i.id; });
      var lotHtml = mine.length ? '<p class="ac-lot">Lot' + (mine.length > 1 ? "s" : "") + " allocated to this order: " + mine.map(function (l) { return '<a href="/reports/' + h(i.id) + "/" + h(l.batch) + '">' + h(l.batch) + "</a>" + (mine.length > 1 ? " (" + l.quantity + ")" : ""); }).join(", ") + "</p>"
        : ["paid", "shipped", "delivered"].indexOf(o.state) >= 0 ? '<p class="ac-lot">No lot allocation is recorded for this item. <a href="/reports?product=' + h(i.id) + '">Look up the lot on your pack</a>.</p>' : "";
      var rv = o.state === "delivered" && signed ? (reviewed.some(function (r) { return r.product === i.id; }) ? chip("Review submitted", "ok") : '<a class="ac-link" href="/products/' + h(i.id) + '#reviews">Write a review →</a>') : "";
      return '<li class="ac-item">' + thumb(i.id) + '<span class="ac-item-main"><strong><a href="/products/' + h(i.id) + '">' + h(i.name) + "</a></strong><small>Quantity " + i.quantity + " · " + money(i.unit_price) + " each (sample)</small>" + lotHtml + rv + '</span><strong class="ac-item-total">' + money(i.unit_price * i.quantity) + "</strong></li>";
    }).join("");
    var track = o.provider ? '<p><strong>' + h(o.provider) + "</strong> · " + h(o.tracking) + '</p><p class="ac-small">Simulated assignment: no shipment was booked, so there’s no carrier tracking link or delivery estimate.</p>' : '<p class="ac-small">' + (o.state === "pending" ? "Tracking starts after payment and shipment." : o.state === "paid" ? "Tracking appears once the order ships. No delivery date is promised in the preview." : o.state === "cancelled" || o.state === "expired" ? "This order won’t ship." : "No tracking is recorded.") + "</p>";
    var acts = [];
    if (o.state === "pending") acts.push('<a class="ac-btn" href="/payment/' + h(o.id) + '">' + (o.payment === "processing" ? "Check payment status" : "Complete payment") + "</a>");
    if (canCancel) acts.push('<button type="button" class="ac-quiet" data-ac-cancel="' + h(o.id) + '" aria-controls="ac-cancel-panel" aria-expanded="false">Cancel order</button>');
    if (o.state === "delivered") acts.push('<button type="button" class="ac-quiet" data-ac-problem aria-controls="ac-return" aria-expanded="false">Report a problem with this order</button>');
    acts.push('<button type="button" class="ac-quiet" data-ac-buyagain="' + h(o.id) + '">Buy again</button>');
    acts.push('<a class="ac-quiet" href="/contact?order=' + h(o.id) + '&kind=' + (o.state === "shipped" ? "delivery" : "general") + '">Get help with this order</a>');
    var why = o.payment === "processing" ? "Cancellation waits until the payment status is confirmed." : o.state === "shipped" ? "This order has been dispatched, so it can’t be cancelled. If it’s late or missing, get help with this order." : o.state === "delivered" ? "Something wrong with an item? Report a problem and choose a refund or replacement." : o.state === "paid" || o.state === "pending" ? "You can cancel until it’s dispatched. You’ll see what happens to your payment before you confirm." : "";
    var mineCases = (a.cases || []).filter(function (c) { return c.order_id === o.id; });
    var linked = mineCases.length ? '<section aria-labelledby="ac-cases-h" id="order-cases"><h2 class="ac-h2" id="ac-cases-h">Support for this order</h2><ul class="ac-cases-mini">' + mineCases.map(function (c) { return '<li><a href="/account/support/' + h(c.id) + '"><strong>' + h(c.id) + "</strong> " + h(c.subject || c.queue || "Support case") + "</a> " + chip(({ open: "Open", investigating: "Investigating", escalated: "Escalated", resolved: "Resolved" })[c.state] || c.state, c.state === "resolved" ? "ok" : "") + "</li>"; }).join("") + "</ul></section>" : "";
    var policyLinks = '<p class="ac-small"><a href="/policies/cancellation">Cancellations</a> · <a href="/policies/returns">Returns & Refunds</a> · <a href="/policies/shipping#tracking">Shipping & Delivery</a></p>';
    return '<div class="ac ac-' + v.key + '" data-ac data-ac-page="order"><header class="ac-head"><p class="ac-k">' + h(v.k("Order " + o.id)) + '</p><h1 class="ac-h1">' + h((o.next && o.next.title) || FUL[o.state] || "Your order") + '</h1><p class="ac-lede">Placed ' + day(o.created) + ". " + h((o.next && o.next.text) || "") + '</p><p class="ac-chips">' + stateChips(o) + "</p></header>" +
      (!signed ? '<div class="ac-callout"><p><strong>Keep this order in an account.</strong> Sign in with the mobile number used at checkout and it will be there next time.</p><a class="ac-btn" href="' + signInHref("/orders/" + o.id) + '">Sign in</a></div>' : "") +
      '<div class="ac-order-grid"><div class="ac-body">' + '<section aria-labelledby="ac-track-h"><h2 class="ac-h2" id="ac-track-h">Progress</h2>' + timeline(o) + track + (o.refund && o.refund !== "none" ? '<p class="ac-small"><strong>Refund:</strong> ' + h(({ pending_refund: "pending refund", refunded_preview: "released (preview — no money moved)" })[o.refund] || o.refund.replace(/_/g, " ")) + '. Refunds are reviewed before release and go back to the original payment method. <a href="/policies/returns#refunds">About refunds</a></p>' : "") + "</section>" +
      '<section aria-labelledby="ac-items-h"><h2 class="ac-h2" id="ac-items-h">Items and lots</h2><ul class="ac-items">' + items + "</ul></section>" +
      '<section aria-labelledby="ac-act-h"><h2 class="ac-h2" id="ac-act-h">What you can do</h2><div class="ac-row">' + acts.join("") + "</div>" + (why ? '<p class="ac-small">' + why + "</p>" : "") + '<div class="ac-panel" id="ac-cancel-panel" data-ac-cancel-panel tabindex="-1" hidden></div>' + (o.state === "delivered" ? returnForm(o) : "") + policyLinks + '<p class="ac-small" role="status" data-ac-order-status></p></section>' + linked + "</div>" +
      '<aside class="ac-summary" aria-labelledby="ac-sum-h"><h2 class="ac-h3" id="ac-sum-h">Summary</h2><div class="ac-sum"><span>Subtotal</span><span>' + money(o.subtotal) + "</span></div>" + (o.discount ? '<div class="ac-sum"><span>Discount ' + h(o.discount_code || "") + "</span><span>−" + money(o.discount) + "</span></div>" : "") + '<div class="ac-sum"><span>Delivery</span><span>' + (o.shipping ? money(o.shipping) : "Free") + '</span></div><div class="ac-sum is-total"><span>Sample total</span><strong>' + money(o.total) + "</strong></div>" +
      '<p class="ac-small">' + h(o.tax_note || "") + '</p><h3 class="ac-h3">Payment</h3><p>' + h(PAY[o.payment] || "—") + ' · prepaid (preview)</p><h3 class="ac-h3">Invoice</h3><p class="ac-small">Not available. GST invoicing isn’t set up in the preview, so no tax invoice has been issued for this order.</p>' +
      '<h3 class="ac-h3">Delivering to</h3><address>' + h(o.contact.name) + "<br>" + h(o.contact.address) + "<br>" + h(o.contact.city) + ", " + h(o.contact.state) + " " + h(o.contact.pincode) + '</address><p class="ac-small">Policy version ' + h(o.policy_version) + "</p></aside></div></div>";
  }

  /* ---------------- payment ---------------- */
  function paymentPage(v, ctx, o) {
    if (!o) return orderPage(v, ctx, null);
    var st = o.state, pay = o.payment, expired = st === "expired" || (st === "pending" && o.expires && o.expires < Date.now() / 1000 && pay !== "processing");
    var head, text, actions = "";
    var sim = function (list) { return '<div class="ac-sim"><p class="ac-k">Payment simulator · nothing is charged</p><div class="ac-row">' + list.map(function (x) { return '<button type="button" class="' + (x[2] || "ac-btn") + '" data-ac-pay="' + x[0] + '" data-id="' + h(o.id) + '">' + x[1] + "</button>"; }).join("") + "</div></div>"; };
    if (st === "paid" || pay === "captured") {
      head = "Payment received"; text = "Preview payment only: no money moved. Your order is being prepared.";
      actions = '<a class="ac-btn" href="/orders/' + h(o.id) + '">View your order</a>' + (isCustomer(ctx.user) ? "" : '<div class="ac-callout"><p><strong>Want to track it later?</strong> Sign in with the mobile number you used at checkout and this order joins your account. Optional.</p><a class="ac-quiet" href="' + signInHref("/orders/" + o.id) + '">Sign in to your account</a></div>');
    } else if (st === "pending" && pay === "processing") {
      head = "Confirming your payment"; text = "We didn’t get a final answer from the payment step. Don’t pay again yet: check the status first, so you aren’t charged twice. Your stock stays reserved meanwhile.";
      actions = '<button type="button" class="ac-btn" data-ac-check="' + h(o.id) + '">Check payment status</button><div class="ac-sim"><p class="ac-k">Preview: simulate the provider’s later answer</p><div class="ac-row"><button type="button" class="ac-quiet" data-ac-reconcile="success" data-id="' + h(o.id) + '">Provider confirms payment</button><button type="button" class="ac-quiet" data-ac-reconcile="failure" data-id="' + h(o.id) + '">Provider reports failure</button></div></div>';
    } else if (expired) {
      head = "Reservation expired"; text = "This order wasn’t paid in time, so its stock was released. Nothing was charged. Your bag is still here if you’d like to check out again.";
      actions = '<a class="ac-btn" href="/cart">Return to your bag</a>';
    } else if (st === "pending") {
      head = pay === "failed" ? "Payment didn’t go through" : pay === "cancelled" ? "Payment cancelled" : "Complete your payment";
      text = pay === "failed" ? "No money moved. You can try again while your stock is reserved." : pay === "cancelled" ? "You left the payment step. Nothing was charged. Try again when you’re ready." : "Your stock is reserved while this step is open. UPI, cards, wallets and net banking are planned with Razorpay; the preview simulates the result.";
      actions = sim([["success", pay === "failed" || pay === "cancelled" ? "Try again: simulate success" : "Simulate successful payment"], ["failure", "Simulate a failed payment", "ac-quiet"], ["cancelled", "Simulate leaving the payment step", "ac-quiet"], ["uncertain", "Simulate an unclear result", "ac-quiet"]]) + '<p class="ac-small reservation-time" data-expires="' + h(o.expires) + '"></p>';
    } else {
      head = "This order isn’t awaiting payment"; text = "Its status is " + (FUL[st] || st) + ".";
      actions = '<a class="ac-btn" href="/orders/' + h(o.id) + '">View order</a>';
    }
    return '<div class="ac ac-' + v.key + '" data-ac data-ac-page="payment"><header class="ac-head"><p class="ac-k">' + h(v.k("Payment · " + o.id)) + '</p><h1 class="ac-h1" tabindex="-1">' + head + '</h1><p class="ac-lede">' + text + '</p></header><div class="ac-order-grid"><div class="ac-body"><p class="ac-amount"><span>Sample total</span><strong>' + money(o.total) + "</strong></p>" + actions + '<p class="ac-small" role="status" data-ac-pay-status></p></div>' +
      '<aside class="ac-summary"><h2 class="ac-h3">Order ' + h(o.id) + "</h2>" + o.items.map(function (i) { return '<div class="ac-sum"><span>' + h(i.name) + " × " + i.quantity + "</span><span>" + money(i.unit_price * i.quantity) + "</span></div>"; }).join("") + (o.discount ? '<div class="ac-sum"><span>Discount</span><span>−' + money(o.discount) + "</span></div>" : "") + '<div class="ac-sum"><span>Delivery</span><span>' + (o.shipping ? money(o.shipping) : "Free") + '</span></div><div class="ac-sum is-total"><span>Sample total</span><strong>' + money(o.total) + "</strong></div></aside></div></div>";
  }
  function signInPage(v, ctx) {
    var next = safeNext(new URL(location.href).searchParams.get("next"));
    if (isCustomer(ctx.user)) return '<div class="ac ac-' + v.key + '" data-ac><header class="ac-head"><p class="ac-k">' + h(v.k("Sign in")) + '</p><h1 class="ac-h1">You’re signed in</h1><p class="ac-lede">Signed in with +91 ••••••' + h(String(ctx.user.mobile).slice(-4)) + '.</p></header><div class="ac-body"><a class="ac-btn" href="' + h(next) + '">Continue to ' + h(taskName(next)) + "</a></div></div>";
    return '<div class="ac ac-' + v.key + ' ac-signpage" data-ac data-ac-page="signin">' + signInBlock(v, next, false) + "</div>";
  }

  /* ---------------- directions ---------------- */
  var V = {
    a: { key: "a", k: function (t) { return "BCC / " + t; } },
    b: { key: "b", k: function (t) { return t; } },
    c: { key: "c", k: function (t) { return "The counter · " + t; } },
    d: { key: "d", k: function (t) { return t + " · after hours"; } },
    e: { key: "e", k: function (t) { return t + " · Body Café Co."; } },
    f: { key: "f", k: function (t) { return "Edition 01 · " + t; } },
    g: { key: "g", k: function (t) { return t + " / frame"; } },
    h: { key: "h", k: function (t) { return "§ " + t; } },
  };
  Object.keys(V).forEach(function (d) {
    if (!S.themes[d]) return;
    var base = S.themes[d], next = {};
    Object.keys(base).forEach(function (k) { next[k] = base[k]; });
    next.account = function (ctx, tab, fx) { return fx && base.account ? base.account(ctx, tab === "overview" ? "orders" : tab, fx) : accountPage(V[d], ctx, tab); };
    next.order = function (ctx, o, fx) { return fx && base.order ? base.order(ctx, o, fx) : orderPage(V[d], ctx, o); };
    next.payment = function (ctx, o, fx) { return fx && base.payment ? base.payment(ctx, o, fx) : paymentPage(V[d], ctx, o); };
    next.signIn = function (ctx) { return signInPage(V[d], ctx); };
    S.themes[d] = next;
  });

  /* ---------------- behaviour ---------------- */
  var cleanup = function () {};
  var timer = 0;
  function enhance() {
    cleanup();
    clearInterval(timer);
    watchSession();
    var abort = new AbortController(), on = function (el, ev, fn, o) { if (el) el.addEventListener(ev, fn, Object.assign({ signal: abort.signal }, o || {})); };
    cleanup = function () { abort.abort(); clearInterval(timer); };
    if (location.pathname === "/checkout") checkoutContinuity(on);
    if (location.pathname === "/contact") contactContinuity(on);
    var root = document.querySelector("[data-ac]");
    if (!root) return;
    var status = root.querySelector("#ac-status") || root.querySelector("[data-ac-pay-status]") || root.querySelector("[data-ac-order-status]");
    var say = function (t) { if (status) status.textContent = t; };
    var si = root.querySelector("[data-ac-signin]");
    if (si) signInBehaviour(si, on);

    on(root, "click", async function (e) {
      var t = e.target.closest("button"); if (!t || !root.contains(t)) return;
      try {
        if (t.hasAttribute("data-ac-edit")) { var slot = t.closest("[data-ac-addr-item]").querySelector("[data-ac-edit-slot]"); slot.hidden = false; slot.querySelector("input").focus(); }
        else if (t.hasAttribute("data-ac-cancel-edit")) { var s2 = t.closest("[data-ac-edit-slot]"); s2.hidden = true; s2.closest("[data-ac-addr-item]").querySelector("[data-ac-edit]").focus(); }
        else if (t.hasAttribute("data-ac-default")) { t.disabled = true; await A().api("/addresses/" + t.getAttribute("data-ac-default") + "/default", {}); await A().rerender(); A().toast("Default address updated."); }
        else if (t.hasAttribute("data-ac-delete")) {
          if (t.getAttribute("data-confirm") !== "1") { t.setAttribute("data-confirm", "1"); t.textContent = "Confirm remove"; say("Select Confirm remove to delete this address."); return; }
          t.disabled = true; await A().api("/addresses/" + t.getAttribute("data-ac-delete") + "/delete", {}); await A().rerender(); A().toast("Address removed.");
        } else if (t.hasAttribute("data-ac-everywhere")) { t.disabled = true; swrite("bcc-signed-out", "1"); await A().api("/logout", { everywhere: true }); await A().session(); A().navigate("/account"); A().toast("Signed out on all devices."); }
        else if (t.hasAttribute("data-ac-buyagain")) await buyAgain(t.getAttribute("data-ac-buyagain"));
        else if (t.hasAttribute("data-ac-cancel")) {
          // Explain eligibility first; nothing changes until the shopper confirms and the server agrees.
          var panel = root.querySelector("[data-ac-cancel-panel]"), oid = t.getAttribute("data-ac-cancel");
          t.disabled = true; panel.hidden = false; panel.innerHTML = '<p class="ac-small">Checking whether this order can be cancelled…</p>';
          var ck;
          try { ck = await A().api("/orders/" + oid + "/cancel-check"); }
          catch (ke) { t.disabled = false; panel.innerHTML = '<p class="ac-err" role="alert">We couldn’t check this order just now: ' + h(ke.message) + ' Nothing has changed.</p>'; panel.focus(); return; }
          t.disabled = false; t.setAttribute("aria-expanded", "true");
          panel.innerHTML = '<h3 class="ac-h3">Cancel order ' + h(oid) + "?</h3><p>" + h(ck.message) + "</p>" + (ck.eligible ? '<p class="ac-small">No cancellation charge applies. The order is cancelled only when this page says so.</p><div class="ac-row"><button type="button" class="ac-btn" data-ac-cancel-confirm="' + h(oid) + '">Yes, cancel this order</button><button type="button" class="ac-quiet" data-ac-cancel-keep>Keep my order</button></div>'
            : '<div class="ac-row">' + (ck.reason === "processing" ? '<a class="ac-btn" href="/payment/' + h(oid) + '">Check payment status</a>' : '<a class="ac-btn" href="/contact?order=' + h(oid) + '&kind=cancellation">Contact support</a>') + '<button type="button" class="ac-quiet" data-ac-cancel-keep>Close</button></div>') + '<p class="ac-err" role="alert" data-ac-cancel-err hidden></p>';
          panel.focus();
        } else if (t.hasAttribute("data-ac-cancel-keep")) {
          var p2 = root.querySelector("[data-ac-cancel-panel]"); p2.hidden = true; p2.innerHTML = "";
          var cb = root.querySelector("[data-ac-cancel]"); if (cb) { cb.setAttribute("aria-expanded", "false"); cb.focus(); }
        } else if (t.hasAttribute("data-ac-cancel-confirm")) {
          var id2 = t.getAttribute("data-ac-cancel-confirm"), errEl = root.querySelector("[data-ac-cancel-err]");
          t.disabled = true; t.textContent = "Cancelling…"; errEl.hidden = true;
          try {
            await A().api("/orders/" + id2 + "/cancel", {});
          } catch (ce) {
            t.disabled = false; t.textContent = "Yes, cancel this order"; errEl.textContent = "Not cancelled: " + ce.message; errEl.hidden = false; return;
          }
          await A().rerender(); focusHead(); A().toast("Order " + id2 + " is cancelled.");
        } else if (t.hasAttribute("data-ac-problem")) {
          var rp = root.querySelector("[data-ac-return]"); rp.hidden = !rp.hidden; t.setAttribute("aria-expanded", String(!rp.hidden));
          if (!rp.hidden) { var first = rp.querySelector("input"); if (first) first.focus(); }
        } else if (t.hasAttribute("data-ac-problem-close")) {
          root.querySelector("[data-ac-return]").hidden = true; var pb = root.querySelector("[data-ac-problem]"); if (pb) { pb.setAttribute("aria-expanded", "false"); pb.focus(); }
        } else if (t.hasAttribute("data-ac-export")) {
          var es = root.querySelector("[data-ac-export-status]"); t.disabled = true; es.textContent = "Preparing your file…";
          try {
            var data = await A().api("/account/export");
            var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), url = URL.createObjectURL(blob), link = document.createElement("a");
            link.href = url; link.download = "body-cafe-co-my-data.json"; document.body.appendChild(link); link.click(); link.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
            es.textContent = "Downloaded body-cafe-co-my-data.json.";
          } catch (xe) { es.textContent = "Couldn’t prepare your file: " + xe.message; }
          t.disabled = false;
        }
        else if (t.hasAttribute("data-ac-pay")) {
          root.querySelectorAll("[data-ac-pay]").forEach(function (b) { b.disabled = true; });
          var r = await A().api("/orders/" + t.getAttribute("data-id") + "/pay", { outcome: t.getAttribute("data-ac-pay") });
          if (r.payment === "captured") paid(t.getAttribute("data-id"));
          await A().rerender(); focusHead();
        } else if (t.hasAttribute("data-ac-check")) {
          t.disabled = true;
          var s = await A().api("/orders/" + t.getAttribute("data-ac-check") + "/status");
          if (s.payment === "captured") paid(s.id);
          await A().rerender(); focusHead();
          say(s.payment === "processing" ? "Still being confirmed. Nothing has changed yet; check again shortly." : "Status updated.");
        } else if (t.hasAttribute("data-ac-reconcile")) {
          t.disabled = true;
          var rc = await A().api("/orders/" + t.getAttribute("data-id") + "/reconcile", { outcome: t.getAttribute("data-ac-reconcile") });
          if (rc.payment === "captured") paid(rc.id);
          await A().rerender(); focusHead();
        }
      } catch (err) {
        say(err.message); A().toast(err.message);
        root.querySelectorAll("button[disabled]").forEach(function (b) { b.disabled = false; });
      }
    });
    var rf = root.querySelector("[data-ac-return-form]");
    if (rf) {
      on(rf, "change", function (e) { if (e.target.name === "reason") rf.querySelector("[data-ac-com-note]").hidden = e.target.value !== "change_of_mind"; });
      on(rf, "submit", async function (e) {
        e.preventDefault(); e.stopPropagation();
        var oid = rf.getAttribute("data-ac-return-form"), btn = rf.querySelector("button[type=submit]"), gen = rf.querySelector("[data-ac-ret-error]");
        var err = function (id, m) { var el = rf.querySelector("#" + id); el.textContent = m || ""; el.hidden = !m; };
        ["ac-ret-items-err", "ac-ret-reason-err", "ac-ret-msg-err", "ac-ret-photos-err"].forEach(function (x) { err(x, ""); }); gen.hidden = true;
        var items = Array.prototype.slice.call(rf.querySelectorAll('input[name="item"]:checked')).map(function (c) { return { id: c.value, quantity: +rf.elements["qty-" + c.value].value }; });
        var reason = (rf.querySelector('input[name="reason"]:checked') || {}).value, msg = rf.elements.message.value.trim();
        var bad = null;
        if (!items.length) { err("ac-ret-items-err", "Choose at least one item."); bad = bad || rf.querySelector('input[name="item"]'); }
        if (!reason) { err("ac-ret-reason-err", "Choose what went wrong."); bad = bad || rf.querySelector('input[name="reason"]'); }
        if (msg.length < 10) { err("ac-ret-msg-err", "Tell us a little more (at least 10 characters)."); bad = bad || rf.elements.message; }
        var files = Array.prototype.slice.call(rf.elements.photos.files || []);
        if (files.length > 2) { err("ac-ret-photos-err", "Attach up to two photos."); bad = bad || rf.elements.photos; }
        if (bad) { bad.focus(); return; }
        btn.disabled = true; btn.textContent = files.length ? "Uploading photos…" : "Sending…";
        try {
          var media = [];
          for (var i = 0; i < files.length; i++) {
            try { media.push(await window.BCCSupport.uploadPhoto(files[i])); } catch (pe) { err("ac-ret-photos-err", pe.message); rf.elements.photos.focus(); throw { handled: true }; }
          }
          var r = await A().api("/orders/" + oid + "/return", { items: items, reason: reason, remedy: (rf.querySelector('input[name="remedy"]:checked') || {}).value || "either", message: msg, media: media });
          await A().rerender();
          A().toast("Request " + r.id + " received. Follow it under Support for this order.");
          var sec = document.getElementById("order-cases"); if (sec) { sec.setAttribute("tabindex", "-1"); sec.focus(); }
        } catch (re) {
          if (re && re.handled) return;
          gen.innerHTML = h(re.message || "That didn’t send. Your answers are still here.") + (re.data && re.data.case ? ' <a href="/account/support/' + h(re.data.case) + '">See the open request</a>.' : "");
          gen.hidden = false;
        } finally { if (btn.isConnected) { btn.disabled = false; btn.textContent = "Send request"; } }
      });
    }
    var pf = root.querySelector("[data-ac-privacy]");
    if (pf) on(pf, "submit", async function (e) {
      e.preventDefault(); e.stopPropagation();
      var st = pf.querySelector("[data-ac-priv-status]"), btn = pf.querySelector("button[type=submit]");
      clearErrors(pf); st.innerHTML = "";
      if (!pf.elements.request.value) { var ke = pf.querySelector("#ac-priv-kind-err"); ke.textContent = "Choose a request."; ke.hidden = false; pf.elements.request.setAttribute("aria-invalid", "true"); pf.elements.request.focus(); return; }
      btn.disabled = true; st.textContent = "Sending…";
      try {
        var r = await A().api("/privacy-requests", { request: pf.elements.request.value, message: pf.elements.message.value });
        st.innerHTML = 'Request <strong>' + h(r.id) + '</strong> received. <a href="/account/support/' + h(r.id) + '">Follow it</a>.';
        pf.reset();
        if (A().keepDesignOnLinks) A().keepDesignOnLinks();
      } catch (pe) {
        st.innerHTML = h("Not sent: " + pe.message) + (pe.data && pe.data.case ? ' <a href="/account/support/' + h(pe.data.case) + '">See the open request</a>.' : "");
        if (pe.data && pe.data.field === "message") { var me = pf.querySelector("#ac-priv-msg-err"); me.textContent = pe.message; me.hidden = false; pf.elements.message.setAttribute("aria-invalid", "true"); pf.elements.message.focus(); }
      } finally { btn.disabled = false; }
    });
    on(root, "submit", async function (e) {
      var f = e.target;
      if (!root.contains(f) || f.closest("[data-ac-signin]")) return;
      if (!(f.matches("[data-ac-address], [data-ac-profile], [data-ac-prefs], [data-ac-order-case]"))) return;
      e.preventDefault(); e.stopPropagation();
      var b = f.querySelector("button[type=submit]"); if (b) b.disabled = true;
      clearErrors(f);
      try {
        if (f.matches("[data-ac-order-case]")) { A().navigate("/contact?order=" + encodeURIComponent(f.elements.order.value) + "&kind=delivery"); return; }
        if (f.matches("[data-ac-address]")) {
          var d = {}; ADDR.forEach(function (x) { d[x[0]] = f.elements[x[0]].value; });
          if (f.getAttribute("data-ac-address")) d.id = f.getAttribute("data-ac-address");
          d["default"] = f.elements["default"].checked;
          await A().api("/addresses", d); await A().rerender(); A().toast("Address saved.");
        } else if (f.matches("[data-ac-profile]")) {
          await A().api("/profile", { name: f.elements.name.value, email: f.elements.email.value }); await A().session(); await A().rerender(); A().toast("Profile saved.");
        } else if (f.matches("[data-ac-prefs]")) {
          var pr = { email: f.elements.email.checked, whatsapp: f.elements.whatsapp.checked };
          if (isCustomer(A().user())) await A().api("/preferences", pr);
          else try { var cur = JSON.parse(localStorage.getItem("bcc-preferences") || "{}"); localStorage.setItem("bcc-preferences", JSON.stringify(Object.assign(cur, pr))); } catch (x) {}
          f.querySelector("[data-ac-prefs-status]").textContent = "Saved. Email " + (pr.email ? "on" : "off") + ", WhatsApp " + (pr.whatsapp ? "on" : "off") + ".";
        }
      } catch (err) {
        showErrors(f, err);
      } finally { if (b && b.isConnected) b.disabled = false; }
    }, { capture: true });
  }
  function focusHead() { var hd = document.querySelector("[data-ac] .ac-h1"); if (hd) { hd.setAttribute("tabindex", "-1"); hd.focus({ preventScroll: true }); } }
  function clearErrors(f) { f.querySelectorAll(".ac-err").forEach(function (x) { x.hidden = true; x.textContent = ""; }); f.querySelectorAll("[aria-invalid]").forEach(function (x) { x.removeAttribute("aria-invalid"); }); }
  function showErrors(f, err) {
    var fields = err.data && (err.data.fields || (err.data.field ? (function () { var o = {}; o[err.data.field] = err.message; return o; })() : null));
    var first = null;
    if (fields) Object.keys(fields).forEach(function (k) {
      var input = f.elements[k]; if (!input) return;
      var box = f.querySelector("#" + input.id + "-err"); if (box) { box.textContent = fields[k]; box.hidden = false; }
      input.setAttribute("aria-invalid", "true"); if (!first) first = input;
    });
    var general = f.querySelector("[data-ac-form-err]");
    if (!first && general) { general.textContent = err.message; general.hidden = false; }
    else if (!first) A().toast(err.message);
    (first || general || f).focus && (first || general).focus && (first || general).focus();
  }
  function paid(oid) {
    A().setCart([]); if (window.BCCBag) window.BCCBag.sync();
    swrite("bcc-checkout-key", ""); swrite("bcc-checkout-draft", ""); swrite("bcc-discount", "");
    A().refreshCatalog().catch(function () {});
  }
  async function buyAgain(oid) {
    var o = (A().account() && A().account().orders || []).filter(function (x) { return x.id === oid; })[0];
    if (!o) return;
    var items = A().cart();
    o.items.forEach(function (i) { var cur = items.filter(function (x) { return x.id === i.id; })[0]; if (cur) cur.quantity = Math.min(10, cur.quantity + i.quantity); else items.push({ id: i.id, quantity: Math.min(10, i.quantity) }); });
    var q = await A().api("/bag/quote", { items: items.map(function (x) { return { id: x.id, quantity: x.quantity }; }) });
    var notes = [];
    o.items.forEach(function (i) {
      var l = q.lines.filter(function (x) { return x.id === i.id; })[0];
      if (!l) return;
      if (l.status === "unavailable") notes.push(i.name + " isn’t available right now, so it wasn’t added");
      else if (l.status === "reduced") notes.push(i.name + " was limited to " + l.payable_quantity + " (available now)");
      if (l.unit_price != null && l.unit_price !== i.unit_price) notes.push(i.name + " is now " + money(l.unit_price) + " (was " + money(i.unit_price) + " on this order)");
    });
    var next = items.map(function (x) { var l = q.lines.filter(function (y) { return y.id === x.id; })[0]; return { id: x.id, quantity: l ? l.payable_quantity : x.quantity, price: l ? l.unit_price : x.price }; }).filter(function (x) { return x.quantity > 0; });
    A().setCart(next); if (window.BCCBag) window.BCCBag.sync();
    swrite("bcc-bag-notice", "Added from order " + oid + (notes.length ? ". " + notes.join("; ") : "") + ". Review your bag before checkout; nothing is ordered or charged automatically.");
    A().navigate("/cart");
  }

  /* Sign-in steps. The pending number and timers survive a refresh; the code itself is never stored outside the page. */
  function signInBehaviour(si, on) {
    var mf = si.querySelector("[data-ac-mobile]"), cf = si.querySelector("[data-ac-code]"), next = si.getAttribute("data-next");
    var pending = JSON.parse(sread("bcc-otp") || "null");
    function err(form, id, msg, input) { var b = form.querySelector("#" + id); b.textContent = msg || ""; b.hidden = !msg; if (input) { if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid"); } }
    function tick() {
      var box = cf.querySelector("[data-ac-timers]"), rs = cf.querySelector("[data-ac-resend]");
      if (!pending) return;
      var now = Date.now() / 1000, left = Math.max(0, Math.round(pending.resend_at - now)), exp = Math.max(0, Math.round(pending.expires_at - now));
      box.textContent = (exp ? "Code valid for " + Math.floor(exp / 60) + ":" + String(exp % 60).padStart(2, "0") + ". " : "This code has expired. Request a new one. ") + (left ? "You can resend in " + left + "s." : "");
      rs.hidden = left > 0;
    }
    function showCode(focus) {
      mf.hidden = true; cf.hidden = false;
      cf.querySelector("[data-ac-dest]").innerHTML = destText(pending);
      var pv = cf.querySelector("[data-ac-preview]");
      pv.hidden = !pending.preview_code; pv.innerHTML = pending.preview_code ? previewText(pending.preview_code) : "";
      tick(); clearInterval(timer); timer = setInterval(tick, 1000);
      if (focus) cf.elements.code.focus();
    }
    async function send(mobile, btn) {
      btn.disabled = true;
      try {
        var r = await A().api("/auth/otp", { mobile: mobile });
        var now = Date.now() / 1000;
        pending = { mobile: mobile, destination: r.destination, mode: r.mode, expires_at: now + r.expires_in, resend_at: now + r.resend_in, preview_code: r.preview_code || "" };
        swrite("bcc-otp", JSON.stringify(Object.assign({}, pending, { preview_code: "" })));
        cf.elements.code.value = ""; err(cf, "ac-code-err", "", cf.elements.code);
        showCode(true);
      } catch (x) {
        var target = cf.hidden ? mf : cf, id = cf.hidden ? "ac-mobile-err" : "ac-code-err";
        var msg = x.data && x.data.reason === "unavailable" ? x.message + " You can still check out as a guest." : x.message;
        err(target, id, msg, cf.hidden ? mf.elements.mobile : null);
      } finally { btn.disabled = false; }
    }
    if (pending) { if (pending.expires_at < Date.now() / 1000 - 600) { pending = null; swrite("bcc-otp", ""); mf.hidden = false; cf.hidden = true; } else showCode(false); }
    on(mf.elements.mobile, "input", function () { var v = mf.elements.mobile.value.replace(/\D/g, ""); if (v.length > 10 && v.indexOf("91") === 0) v = v.slice(-10); mf.elements.mobile.value = v.slice(0, 10); });
    on(mf, "submit", function (e) {
      e.preventDefault(); e.stopPropagation();
      var m = mf.elements.mobile.value.trim();
      if (!/^[6-9][0-9]{9}$/.test(m)) { err(mf, "ac-mobile-err", "Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9.", mf.elements.mobile); mf.elements.mobile.focus(); return; }
      err(mf, "ac-mobile-err", "", mf.elements.mobile);
      send(m, mf.querySelector("button[type=submit]"));
    }, { capture: true });
    on(cf.querySelector("[data-ac-change]"), "click", function () { pending = null; swrite("bcc-otp", ""); clearInterval(timer); cf.hidden = true; mf.hidden = false; mf.elements.mobile.focus(); });
    on(cf.querySelector("[data-ac-resend]"), "click", function (e) { send(pending.mobile, e.currentTarget); });
    on(cf.elements.code, "input", function () { var v = cf.elements.code.value.replace(/\D/g, "").slice(0, 6); if (cf.elements.code.value !== v) cf.elements.code.value = v; if (v.length) err(cf, "ac-code-err", "", cf.elements.code); });
    on(cf, "submit", async function (e) {
      e.preventDefault(); e.stopPropagation();
      var code = cf.elements.code.value.replace(/\D/g, ""), btn = cf.querySelector("button[type=submit]");
      if (code.length !== 6) { err(cf, "ac-code-err", "Enter all 6 digits of the code.", cf.elements.code); cf.elements.code.focus(); return; }
      if (btn.disabled) return;
      btn.disabled = true;
      try {
        var r = await A().api("/auth/verify", { mobile: pending.mobile, code: code });
        swrite("bcc-otp", ""); clearInterval(timer);
        await A().session();
        var merged = window.BCCBag ? await window.BCCBag.afterSignIn() : "";
        if (merged) swrite("bcc-bag-notice", merged);
        swrite("bcc-signed-out", "");
        A().toast((r.created ? "Account created. " : "Welcome back. ") + (r.claimed_orders ? r.claimed_orders + " order" + (r.claimed_orders > 1 ? "s" : "") + " from this browser joined your account. " : "") + (merged ? "Your bag was combined; review it before checkout." : ""));
        A().navigate(next);
      } catch (x) {
        var reason = x.data && x.data.reason;
        err(cf, "ac-code-err", x.message, cf.elements.code);
        if (reason === "locked" || reason === "expired") { cf.querySelector("[data-ac-resend]").hidden = false; if (pending) pending.resend_at = Math.min(pending.resend_at, Date.now() / 1000); }
        cf.elements.code.focus(); cf.elements.code.select();
        btn.disabled = false;
      }
    }, { capture: true });
  }

  /* Checkout: optional sign-in that keeps everything typed, a saved draft, the bag's discount code and one order per submission. */
  function checkoutContinuity(on) {
    var f = document.getElementById("checkout-form");
    if (!f) return;
    var u = A().user(), draft = {};
    try { draft = JSON.parse(sread("bcc-checkout-draft") || "{}"); } catch (e) {}
    ["name", "mobile", "email", "pincode", "address", "city", "state", "gstin", "legal_name"].forEach(function (k) { var el = f.elements[k]; if (el && !el.value && draft[k]) el.value = draft[k]; });
    var acct = A().account && A().account();
    if (isCustomer(u) && acct && acct.addresses && acct.addresses.length && !f.elements.address.value) {
      var def = acct.addresses.filter(function (x) { return x.id === (acct.profile || {}).default_address; })[0] || acct.addresses[0];
      ["name", "address", "city", "state", "pincode"].forEach(function (k) { if (f.elements[k] && !f.elements[k].value) f.elements[k].value = def[k]; });
      if (f.elements.mobile && !f.elements.mobile.value) f.elements.mobile.value = u.mobile;
    }
    if (isCustomer(u) && f.elements.mobile && !f.elements.mobile.value) f.elements.mobile.value = u.mobile;
    // The policies that apply to this order, beside the action that places it (same in every direction).
    var submit = f.querySelector("button[type=submit], button:not([type])");
    if (submit && !f.querySelector(".ac-co-policies")) {
      var pol = document.createElement("p");
      pol.className = "ac-co-policies micro";
      pol.innerHTML = 'Before you place the order: <a href="/policies/shipping">Shipping &amp; Delivery</a> · <a href="/policies/returns">Returns &amp; Refunds</a> · <a href="/policies/cancellation">Cancellations</a>';
      submit.insertAdjacentElement("beforebegin", pol);
      if (A().keepDesignOnLinks) A().keepDesignOnLinks();
    }
    var note = document.createElement("div");
    note.className = "ac-co-note";
    note.innerHTML = isCustomer(u) ? "<p>Signed in with +91 ••••••" + h(String(u.mobile).slice(-4)) + ". This order will be saved to your account.</p>" : '<p><strong>Checking out as a guest.</strong> No account needed. If you have one, you can <a href="' + signInHref("/checkout") + '">sign in</a> first; what you’ve typed here is kept.</p>';
    f.insertBefore(note, f.firstChild);
    on(f, "input", function () { var d = {}; ["name", "mobile", "email", "pincode", "address", "city", "state", "gstin", "legal_name"].forEach(function (k) { if (f.elements[k]) d[k] = f.elements[k].value; }); swrite("bcc-checkout-draft", JSON.stringify(d)); });
    var code = sread("bcc-discount"), input = document.getElementById("discount-code"), apply = document.querySelector('[data-action="discount"]');
    if (code && input && !input.value) { input.value = code; if (apply) apply.click(); }
    if (window.BCCApp.keepDesignOnLinks) window.BCCApp.keepDesignOnLinks();
  }
  /* Support: the unsent message survives sign-in and refresh; signing in is optional. */
  function contactContinuity(on) {
    var f = document.getElementById("case-form");
    if (!f) return;
    var key = "bcc-case-draft", d = {};
    try { d = JSON.parse(sread(key) || "{}"); } catch (e) {}
    if (d.message && !f.elements.message.value) f.elements.message.value = d.message;
    if (d.order_id && f.elements.order_id && !f.elements.order_id.value) f.elements.order_id.value = d.order_id;
    on(f, "input", function () { swrite(key, JSON.stringify({ message: f.elements.message.value, order_id: f.elements.order_id ? f.elements.order_id.value : "" })); });
    if (!isCustomer(A().user()) && !f.querySelector(".ac-co-note")) {
      var here = location.pathname + location.search;
      var note = document.createElement("p");
      note.className = "ac-co-note micro";
      note.innerHTML = 'Optional: <a href="' + signInHref(safeNext(here)) + '">sign in</a> so this case is kept in your account. Your message is saved while you do.';
      f.insertBefore(note, f.firstChild);
      if (window.BCCApp.keepDesignOnLinks) window.BCCApp.keepDesignOnLinks();
    }
  }
  /* If a signed-in session ends on its own (expiry), say so once, and reassure that the bag is safe. */
  function watchSession() {
    var u = A().user(), was = sread("bcc-last-user");
    var now = isCustomer(u) ? "customer" : "guest";
    if (was === "customer" && now === "guest" && !sread("bcc-signed-out")) A().toast("You’ve been signed out because your session ended. Your bag is still here. Sign in again to see your account.");
    if (now === "customer") swrite("bcc-signed-out", "");
    swrite("bcc-last-user", now);
  }

  window.BCCAccount = { enhance: enhance, safeNext: safeNext, signInHref: signInHref, contactSent: function () { swrite("bcc-case-draft", ""); }, signedOut: function () { swrite("bcc-signed-out", "1"); } };
})();
