/* Body Café Co. — Variant E Part 2 · Account (5 Nov 2026).
   Only active when body[data-variant-e-part="2"]; Parts 1, 3 and 4 keep the account from web/account.js.
   Signed out: sign in (mobile or email; a one-time code or a password) or create an account (name and mobile; email and
   password optional), beside a cap-tinted panel with the bottle, like the product page. Signed in: a hello, a side menu with
   counts, and orders, up to five labelled addresses (Home, Office, Other), up to five saved cards, support, reviews, profile
   and security, preferences. Order and payment pages keep account.js's markup and behaviour.
   Cards: the full number never leaves the browser. Only network, credit or debit, last four digits, expiry and names are
   sent; in the live store the card is saved as a token by the payment provider (RBI card-on-file rules).
   ?state=signed-out | code | empty | orders | sample shows the design with synthetic data and every control disabled. */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE, P = window.BCCPart2E;
  if (!S || !S.themes || !S.themes.e || !L || !P) return;
  var esc = L.esc, A = function () { return window.BCCApp; }, AC = function () { return window.BCCAccount || {}; };
  function on2() { return document.body.dataset.variantEPart === "2"; }
  function part2(name, fn) {
    var base = S.themes.e[name];
    if (typeof base !== "function") return;
    L.replace(name, function () { return on2() ? fn.apply(this, [base].concat([].slice.call(arguments))) : base.apply(this, arguments); });
  }
  function sread(k) { try { return sessionStorage.getItem(k) || ""; } catch (e) { return ""; } }
  function swrite(k, v) { try { if (v) sessionStorage.setItem(k, v); else sessionStorage.removeItem(k); } catch (e) {} }
  function day(n) { return n ? new Date(n * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""; }
  function money(n) { return "₹" + Number(n || 0).toLocaleString("en-IN"); }
  function isCustomer(u) { return !!(u && String(u.id).indexOf("customer-") === 0); }
  function eb(t) { return '<p class="p2-eyebrow">' + t + "</p>"; }
  function cap(p) { return "--cap:" + esc((p && p.color) || "#8a8f98"); }
  var ICON = {
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11 12 4l8 7v8.5a.5.5 0 0 1-.5.5H15v-6H9v6H4.5a.5.5 0 0 1-.5-.5z"/></svg>',
    office: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V6.5L13 4v16M13 9h7v11M7 9h2M7 13h2M7 17h2M16 13h1M16 17h1M2 20h20"/></svg>',
    other: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>',
  };
  function field(o) {
    var id = "p2a-" + o.id, desc = [o.hint ? id + "-hint" : "", id + "-err"].filter(Boolean).join(" ");
    return '<div class="p2a-field' + (o.wide ? " is-wide" : "") + (o.cls ? " " + o.cls : "") + '"' + (o.hidden ? " hidden" : "") + '><label for="' + id + '">' + o.label + (o.optional ? " <small>Optional</small>" : "") + "</label>" +
      (o.html || ('<div class="p2a-input' + (o.prefix ? " has-prefix" : "") + (o.reveal ? " has-reveal" : "") + '">' + (o.prefix ? '<span class="p2a-prefix" aria-hidden="true">' + o.prefix + "</span>" : "") +
      "<input id=\"" + id + '" name="' + (o.name || o.id) + '" type="' + (o.type || "text") + '"' + (o.ac ? ' autocomplete="' + o.ac + '"' : "") + (o.mode ? ' inputmode="' + o.mode + '"' : "") + (o.max ? ' maxlength="' + o.max + '"' : "") + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : "") + ' value="' + esc(o.value || "") + '" aria-describedby="' + desc + '"' + (o.dis ? " disabled" : "") + (o.extra || "") + ">" +
      (o.reveal ? '<button type="button" class="p2a-reveal" data-p2a-reveal aria-pressed="false"' + (o.dis ? " disabled" : "") + ">Show</button>" : "") + "</div>")) +
      (o.hint ? '<span class="p2a-hint" id="' + id + '-hint">' + o.hint + "</span>" : "") +
      '<p class="p2a-err" id="' + id + '-err" data-err-for="' + (o.name || o.id) + '" hidden></p></div>';
  }
  function chip(t, kind) { return '<span class="p2a-chip' + (kind ? " is-" + kind : "") + '">' + esc(t) + "</span>"; }
  var FUL = { pending: "Awaiting payment", paid: "Preparing", shipped: "On its way", delivered: "Delivered", cancelled: "Cancelled", expired: "Expired" };
  var PAY = { pending: "Not paid yet", captured: "Paid", failed: "Payment failed", cancelled: "Payment cancelled", processing: "Being confirmed" };
  var STATES = ["Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
  var LABELS = [["home", "Home"], ["office", "Office"], ["other", "Other"]];
  var NETWORKS = { visa: "Visa", mastercard: "Mastercard", rupay: "RuPay", amex: "American Express", diners: "Diners Club" };
  var MAX = 5;
  // Saved cards stay hidden until the payment provider is connected (they will be its tokens; we store nothing). Owner, 6 Nov 2026.
  var CARDS = false;
  function labelOf(a) { return a.label === "other" ? a.label_name || "Other" : (LABELS.filter(function (x) { return x[0] === (a.label || "home"); })[0] || LABELS[0])[1]; }
  function sampleBanner(t, label) { return '<p class="p2a-sample" role="note"><b>' + (label || "Sample") + "</b>" + t + "</p>"; }
  function thumbs(ctx, items) { return '<span class="p2a-thumbs" aria-hidden="true">' + items.slice(0, 3).map(function (i) { var p = ctx.product(i.id); return p ? '<span style="' + cap(p) + '">' + P.bottle(p, { alt: "", cls: "p2a-thumb" }) + "</span>" : ""; }).join("") + "</span>"; }

  /* ---------- Synthetic data for the design states (never saved) ---------- */
  function sampleAccount(ctx, fx) {
    var c = ctx.catalog || [], id = function (i) { return (c[i] || c[0] || {}).id; }, nm = function (i) { return (c[i] || c[0] || {}).name; }, pr = function (i) { return (c[i] || c[0] || {}).price || 0; };
    var now = Math.floor(Date.now() / 1000), order = function (oid, st, items, ago) {
      var sub = items.reduce(function (t, x) { return t + pr(x[0]) * x[1]; }, 0);
      return { id: oid, state: st, payment: st === "pending" ? "pending" : st === "cancelled" ? "cancelled" : "captured", created: now - ago * 86400, total: sub + (sub >= 1499 ? 0 : 75), items: items.map(function (x) { return { id: id(x[0]), name: nm(x[0]), quantity: x[1], unit_price: pr(x[0]) }; }), next: st === "shipped" ? { title: "On its way", text: "With the courier. Expected in 2 days." } : st === "paid" ? { title: "Being packed", text: "We’re packing it now. It ships within a day." } : null };
    };
    var orders = fx === "empty" ? [] : [order("SAMPLE-1042", "shipped", [[0, 1], [3, 2]], 2), order("SAMPLE-1031", "delivered", [[6, 1]], 19), order("SAMPLE-1017", "delivered", [[1, 1], [2, 1]], 41)];
    var y = new Date().getFullYear();
    return {
      sample: true, orders: orders, reviews: [], sessions: 2,
      cases: fx === "sample" ? [{ id: "SAMPLE-CASE-01", kind: "delivery", state: "investigating", message: "When will order SAMPLE-1042 arrive?", owner: "Support", sla: "Reply within one working day", order_id: "SAMPLE-1042" }] : [],
      addresses: fx === "empty" ? [] : [
        { id: "ADDR-sample0001", label: "home", name: "Asha Patel", mobile: "9876543210", address: "B-402, Sunrise Residency, Ring Road", landmark: "Opposite the city library", city: "Surat", state: "Gujarat", pincode: "395001" },
        { id: "ADDR-sample0002", label: "office", name: "Asha Patel", mobile: "", address: "7th floor, Trade Centre, Athwa Gate", landmark: "", city: "Surat", state: "Gujarat", pincode: "395007" },
        { id: "ADDR-sample0003", label: "other", label_name: "Parents", name: "Ramesh Patel", mobile: "9123456780", address: "14, Shanti Nagar Society, Navrangpura", landmark: "Near the Jain temple", city: "Ahmedabad", state: "Gujarat", pincode: "380009" }],
      cards: fx === "empty" ? [] : [
        { id: "CARD-sample0001", network: "visa", kind: "credit", last4: "4242", exp_month: 8, exp_year: y + 3, name: "Asha Patel", nickname: "Everyday" },
        { id: "CARD-sample0002", network: "rupay", kind: "debit", last4: "6011", exp_month: 2, exp_year: y + 2, name: "Asha Patel", nickname: "Salary account" }],
      profile: { name: "Asha Patel", mobile: "9876543210", email: "asha@example.com", email_verified: true, has_password: fx !== "empty", pw_updated: now - 40 * 86400, default_address: "ADDR-sample0001", default_card: "CARD-sample0001", prefs: { email: true, whatsapp: false } },
    };
  }

  /* ---------- Preview account (preview builds only; never in production) ----------
     Lets anyone reviewing the design sign in and try everything, on the hosted preview too, where the real API has no
     customer sign-in. Everything is kept in this browser tab (sessionStorage) and nothing is sent anywhere.
     · The preview account: mobile 99999 99999 or preview@bodycafeco.com, password preview123 (or any one-time code shown).
     · On the hosted preview every sign-in and sign-up goes here; on the local server only the preview account does. */
  var DEMO = { mobile: "9999999999", email: "preview@bodycafeco.com", password: "preview123" }, DKEY = "bcc-p2-preview";
  function demoAllowed() { return !(window.BCCRelease && window.BCCRelease.production); }
  // Both the local server and the hosted API now sign customers in for real (hosted: email code or password, 6 Nov 2026).
  function realBackend() { return !window.BCCStaticPreview; }
  // The hosted API has no text-message provider yet: sign-in and sign-up are by email there.
  function emailOnly() { return !!window.BCCConnectedHosted; }
  function dstore() { try { return JSON.parse(sessionStorage.getItem(DKEY) || "null") || { accts: {}, current: "", codes: {}, pending: {} }; } catch (e) { return { accts: {}, current: "", codes: {}, pending: {} }; } }
  function dsave(st) { try { sessionStorage.setItem(DKEY, JSON.stringify(st)); } catch (e) {} }
  function demoCurrent() { if (!demoAllowed()) return null; var st = dstore(); return st.current && st.accts[st.current] ? st.accts[st.current] : null; }
  function presetAccount() {
    var a = sampleAccount({ catalog: A().catalog() || [] }, "sample");
    a.profile.mobile = DEMO.mobile; a.profile.email = DEMO.email; a.sample = false; a.preview = true;
    return { pw: DEMO.password, account: a };
  }
  function ensurePreset(st) { if (!st.accts[DEMO.mobile]) st.accts[DEMO.mobile] = presetAccount(); return st; }
  function normId(v) { v = String(v || "").trim().toLowerCase(); var d = v.replace(/\D/g, ""); if (/^[+\d\s()-]+$/.test(v)) { if (d.length === 12 && d.indexOf("91") === 0) d = d.slice(2); return d; } return v; }
  function routeDemo(path, data) {
    if (!demoAllowed()) return false;
    if (demoCurrent() && /^\/(profile|addresses|cards|logout)/.test(path)) return true;
    if (/^\/auth\//.test(path)) {
      if (!realBackend()) return true;
      var id = normId(data.mobile || data.email || data.identifier);
      return id === DEMO.mobile || id === DEMO.email;
    }
    return false;
  }
  function api(path, data) { return routeDemo(path, data || {}) ? demoApi(path, data || {}) : A().api(path, data); }
  function fail(msg, extra) { var e = new Error(msg); e.data = Object.assign({ error: msg }, extra || {}); return Promise.reject(e); }
  function mask(key) { if (/^\d{10}$/.test(key)) return "+91 " + key.slice(0, 2) + "••••••" + key.slice(-2); var e = key.replace(/^(email|confirm):/, ""), x = e.split("@"); return x[0].slice(0, 2) + "•••@" + x[1]; }
  function issue(st, key) {
    var now = Date.now() / 1000, prev = st.codes[key];
    if (prev && now - prev.sent < 20) return fail("Please wait " + Math.ceil(20 - (now - prev.sent)) + " seconds before requesting another code.", { reason: "resend_wait" });
    var code = String(Math.floor(100000 + Math.random() * 900000));
    st.codes[key] = { code: code, sent: now, exp: now + 300, tries: 0 }; dsave(st);
    return Promise.resolve({ expires_in: 300, resend_in: 20, destination: mask(key), mode: "preview", preview_code: code, channel: /^\d{10}$/.test(key) ? "sms" : "email", preview_account: true });
  }
  function check(st, key, code) {
    var c = st.codes[key], now = Date.now() / 1000;
    if (!c) return "That code has expired or was replaced. Request a new code.";
    if (c.exp < now) return "That code has expired. Request a new code.";
    if (c.tries >= 5) return "Too many incorrect attempts. Request a new code.";
    if (c.code !== String(code).replace(/\D/g, "")) { c.tries++; dsave(st); var left = 5 - c.tries; return left ? "That code doesn’t match. " + left + " attempt" + (left === 1 ? "" : "s") + " left." : "That code doesn’t match, and no attempts are left. Request a new code."; }
    delete st.codes[key]; return "";
  }
  function byEmail(st, email) { for (var m in st.accts) { var p = st.accts[m].account.profile; if (p.email && p.email.toLowerCase() === email && p.email_verified) return m; } return ""; }
  function blank(name, mobile, email, pw) {
    return { pw: pw || "", account: { preview: true, orders: [], cases: [], reviews: [], addresses: [], cards: [], sessions: 1,
      profile: { name: name || "Customer", mobile: mobile, email: email || "", email_verified: false, has_password: !!pw, pw_updated: pw ? Math.floor(Date.now() / 1000) : null, default_address: null, default_card: null, prefs: { email: false, whatsapp: false } } } };
  }
  function signedIn(st, mobile, r) { st.current = mobile; dsave(st); return Promise.resolve(Object.assign({ ok: true, claimed_orders: 0, preview: true }, r || {})); }
  function demoApi(path, d) {
    var st = ensurePreset(dstore()), cur = st.current && st.accts[st.current], a = cur && cur.account, p = a && a.profile, m;
    var mob = function (v) { return /^[6-9]\d{9}$/.test(v); }, mailOk = function (v) { return /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/.test(v); };
    if (path === "/auth/otp") {
      if (d.email != null) { var em = String(d.email).trim().toLowerCase(); if (!mailOk(em)) return fail("Enter a valid email address.", { reason: "email" }); if (!byEmail(st, em)) return fail("No account uses this email yet. Sign in with your mobile number, or create an account.", { reason: "unknown_email" }); return issue(st, "email:" + em); }
      if (!mob(String(d.mobile))) return fail("Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9.", { reason: "mobile" });
      return issue(st, String(d.mobile));
    }
    if (path === "/auth/verify") {
      var em2 = String(d.email || "").trim().toLowerCase(), key = em2 ? "email:" + em2 : String(d.mobile), bad = check(st, key, d.code);
      if (bad) { dsave(st); return fail(bad, { reason: /expired|no attempts|Too many/.test(bad) ? "expired" : "mismatch" }); }
      if (em2) return signedIn(st, byEmail(st, em2), { created: false });
      var mm = String(d.mobile), created = !st.accts[mm], su = st.pending[mm];
      if (created) st.accts[mm] = su ? blank(su.name, mm, su.email, su.pw) : blank("", mm);
      delete st.pending[mm];
      return signedIn(st, mm, { created: created, email_pending: created && su && su.email ? su.email : "" });
    }
    if (path === "/auth/signup") {
      var f = {}; if (!String(d.name || "").trim()) f.name = "Enter your name."; if (!mob(d.mobile)) f.mobile = "Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9.";
      if (d.email && !mailOk(d.email)) f.email = "Enter a valid email address, or leave it blank.";
      if (Object.keys(f).length) return fail("Check the highlighted fields.", { fields: f });
      if (st.accts[d.mobile]) return fail(d.mobile === DEMO.mobile ? "This is the preview account. Sign in instead." : "This number already has an account. Sign in instead.", { reason: "exists", fields: { mobile: "This number already has an account." } });
      if (d.email && byEmail(st, String(d.email).toLowerCase())) return fail("Check the highlighted fields.", { fields: { email: "Another account already uses this email." } });
      st.pending[d.mobile] = { name: String(d.name).trim(), email: String(d.email || "").trim().toLowerCase(), pw: d.password || "" };
      return issue(st, d.mobile).then(function (r) { r.signup = true; return r; });
    }
    if (path === "/auth/password") {
      var id = normId(d.identifier), who = mob(id) ? id : byEmail(st, id), acct = who && st.accts[who];
      if (!acct || !acct.pw || acct.pw !== d.password) return fail("That password doesn’t match, or this account has no password yet. Try a one-time code instead.", { reason: "mismatch" });
      return signedIn(st, who, { created: false });
    }
    if (!a) return fail("Sign in first.", { reason: "signed_out" });
    if (path === "/logout") { st.current = ""; dsave(st); return Promise.resolve({ ok: true }); }
    if (path === "/profile") {
      var ne = String(d.email || "").trim().toLowerCase();
      if (ne !== String(p.email || "").toLowerCase()) p.email_verified = false;
      p.name = String(d.name || "").trim(); p.email = ne; dsave(st); return Promise.resolve({ ok: true });
    }
    if (path === "/profile/email-code") { var ce = String(d.email || "").trim().toLowerCase(); if (!mailOk(ce)) return fail("Enter a valid email address.", { field: "email" }); return issue(st, "confirm:" + ce); }
    if (path === "/profile/email-verify") {
      var ve = String(d.email || "").trim().toLowerCase(), vb = check(st, "confirm:" + ve, d.code);
      if (vb) { dsave(st); return fail(vb); }
      p.email = ve; p.email_verified = true; dsave(st); return Promise.resolve({ ok: true });
    }
    if (path === "/profile/password") {
      if (cur.pw && d.current !== cur.pw) return fail("Your current password doesn’t match.", { field: "current" });
      cur.pw = d.password; p.has_password = true; p.pw_updated = Math.floor(Date.now() / 1000); dsave(st); return Promise.resolve({ ok: true });
    }
    if (path === "/addresses") {
      var rec = { label: d.label || "home", label_name: d.label === "other" ? d.label_name : "", name: d.name, mobile: d.mobile || "", address: d.address, landmark: d.landmark || "", city: d.city, state: d.state, pincode: d.pincode };
      if (d.id) { var ex = a.addresses.filter(function (x) { return x.id === d.id; })[0]; if (!ex) return fail("Address not found."); Object.assign(ex, rec); }
      else { if (a.addresses.length >= MAX) return fail("You can save up to 5 addresses. Remove one to add another."); rec.id = "ADDR-" + Math.random().toString(16).slice(2, 12); a.addresses.push(rec); d.id = rec.id; }
      if (d["default"] || a.addresses.length === 1) p.default_address = d.id;
      dsave(st); return Promise.resolve({ id: d.id });
    }
    if ((m = path.match(/^\/addresses\/([^/]+)\/(delete|default)$/))) {
      if (m[2] === "default") p.default_address = m[1];
      else { a.addresses = a.addresses.filter(function (x) { return x.id !== m[1]; }); if (p.default_address === m[1]) p.default_address = a.addresses[0] ? a.addresses[0].id : null; }
      dsave(st); return Promise.resolve({ ok: true });
    }
    if (path === "/cards") {
      if (a.cards.length >= MAX) return fail("You can save up to 5 cards. Remove one to add another.");
      if (a.cards.some(function (c) { return c.network === d.network && c.last4 === d.last4 && c.exp_month === d.exp_month && c.exp_year === d.exp_year; })) return fail("Check the highlighted fields.", { fields: { number: "This card is already saved." } });
      var card = { id: "CARD-" + Math.random().toString(16).slice(2, 12), network: d.network, kind: d.kind, last4: d.last4, exp_month: d.exp_month, exp_year: d.exp_year, name: d.name, nickname: d.nickname || "" };
      a.cards.push(card); if (d["default"] || a.cards.length === 1) p.default_card = card.id;
      dsave(st); return Promise.resolve({ id: card.id });
    }
    if ((m = path.match(/^\/cards\/([^/]+)\/(delete|default)$/))) {
      if (m[2] === "default") p.default_card = m[1];
      else { a.cards = a.cards.filter(function (x) { return x.id !== m[1]; }); if (p.default_card === m[1]) p.default_card = a.cards[0] ? a.cards[0].id : null; }
      dsave(st); return Promise.resolve({ ok: true });
    }
    return fail("Not available in the preview account.");
  }
  function previewBox(hosted) {
    return '<div class="p2a-previewacct" role="note"><p><b>Preview account</b>Try a full account without signing up. It’s kept in this browser tab only; real accounts work as normal.</p>' +
      '<dl>' + (emailOnly() ? "" : "<div><dt>Mobile</dt><dd>99999 99999</dd></div>") + "<div><dt>" + (emailOnly() ? "Email" : "or email") + "</dt><dd>" + DEMO.email + '</dd></div><div><dt>Password</dt><dd>' + DEMO.password + "</dd></div></dl>" +
      '<button type="button" class="p2a-textbtn" data-p2a-fill>Fill these in for me</button></div>';
  }

  /* ---------- Signed out: sign in, or create an account ---------- */
  var WORDS = { signin: ["Welcome back.", "Sign in to see your orders, addresses and support cases."], signup: ["Create your account.", "Save your delivery addresses once, and checkout is quicker every time."] };
  function authPage(ctx, o) {
    o = o || {};
    var list = ctx.published.length ? ctx.published : ctx.catalog, a = list[0] || {};
    var next = AC().safeNext ? AC().safeNext(o.next || ctx.query.get("next") || (ctx.path.indexOf("/account") === 0 ? ctx.path : "/account")) : "/account";
    var task = AC().taskName ? AC().taskName(next) : "your account";
    var mode = o.mode || (ctx.query.get("mode") === "signup" ? "signup" : "signin"), dis = !!o.sample, hosted = !!window.BCCConnectedHosted && !o.sample;
    var pending = o.code ? { destination: "+91 98••••••10", preview_code: "482913" } : null;
    var tab = function (m, t) { return '<button type="button" role="tab" id="p2a-tab-' + m + '" aria-controls="p2a-panel-' + m + '" aria-selected="' + (mode === m) + '" tabindex="' + (mode === m ? 0 : -1) + '" data-p2a-mode="' + m + '">' + t + "</button>"; };

    var signin =
      '<div class="p2a-panel" role="tabpanel" id="p2a-panel-signin" aria-labelledby="p2a-tab-signin"' + (mode === "signin" ? "" : " hidden") + ">" +
      '<form class="p2a-form" data-p2a-signin novalidate' + (pending ? " hidden" : "") + ">" +
      field({ id: "si-id", name: "identifier", label: emailOnly() ? "Email" : "Mobile number or email", hint: emailOnly() ? "We’ll email you a code, or you can use your password." : "Type either. We’ll know which.", type: emailOnly() ? "email" : "text", ac: emailOnly() ? "email" : "username", max: 254, dis: dis, extra: ' spellcheck="false" autocapitalize="off"' }) +
      '<fieldset class="p2a-choice"><legend>How would you like to sign in?</legend><label><input type="radio" name="method" value="code" checked' + (dis ? " disabled" : "") + '><span><b>One-time code</b><small>' + (emailOnly() ? "Sent to your email" : "By SMS or email") + '</small></span></label><label><input type="radio" name="method" value="password"' + (dis ? " disabled" : "") + "><span><b>Password</b><small>If you’ve set one</small></span></label></fieldset>" +
      field({ id: "si-pw", name: "password", label: "Password", type: "password", ac: "current-password", max: 128, reveal: true, dis: dis, hidden: true, cls: "p2a-pw" }) +
      '<p class="p2a-err" data-p2a-form-err hidden></p><button type="submit" class="p2-btn p2a-submit"' + (dis ? " disabled" : "") + ' data-p2a-submit-label>Send code</button>' +
      '<p class="p2a-alt" data-p2a-forgot hidden>Forgot your password? <button type="button" class="p2a-textbtn" data-p2a-use-code>Sign in with a code instead</button>, then set a new one in Profile and security.</p>' +
      '<p class="p2a-alt">New to Body Café Co.? <button type="button" class="p2a-textbtn" data-p2a-mode="signup">Create an account</button></p></form>' +
      codeStep("signin", pending, dis) + "</div>";

    var signup =
      '<div class="p2a-panel" role="tabpanel" id="p2a-panel-signup" aria-labelledby="p2a-tab-signup"' + (mode === "signup" ? "" : " hidden") + ">" +
      '<form class="p2a-form" data-p2a-signup novalidate><ol class="p2a-steps" aria-label="Step 1 of 2"><li class="is-on">Your details</li><li>' + (emailOnly() ? "Confirm your email" : "Confirm your number") + '</li></ol>' +
      '<div class="p2a-grid">' + field({ id: "su-name", name: "name", label: "Your name", ac: "name", max: 80, dis: dis, wide: true }) +
      (emailOnly()
        ? field({ id: "su-email", name: "email", label: "Email", hint: "We’ll send a code to confirm it. You sign in with it.", type: "email", ac: "email", max: 254, dis: dis, wide: true, extra: ' spellcheck="false" autocapitalize="off"' }) +
          field({ id: "su-mobile", name: "mobile", label: "Mobile number", optional: true, hint: "For delivery updates.", prefix: "+91", type: "tel", mode: "numeric", ac: "tel-national", max: 10, dis: dis, wide: true })
        : field({ id: "su-mobile", name: "mobile", label: "Mobile number", hint: "We’ll send a code to confirm it. Your orders are linked to it.", prefix: "+91", type: "tel", mode: "numeric", ac: "tel-national", max: 10, dis: dis, wide: true }) +
          field({ id: "su-email", name: "email", label: "Email", optional: true, hint: "Confirm it once and you can sign in with it too.", type: "email", ac: "email", max: 254, dis: dis, wide: true, extra: ' spellcheck="false" autocapitalize="off"' })) +
      field({ id: "su-pw", name: "password", label: "Password", optional: true, hint: "At least 8 characters, with a letter and a number. Or skip it and sign in with codes.", type: "password", ac: "new-password", max: 128, reveal: true, dis: dis, wide: true }) + "</div>" +
      '<div class="p2a-meter" data-p2a-meter aria-hidden="true"><i></i><i></i><i></i></div>' +
      '<p class="p2a-err" data-p2a-form-err hidden></p><button type="submit" class="p2-btn p2a-submit"' + (dis ? " disabled" : "") + ">Create account</button>" +
      '<p class="p2a-alt">By creating an account you accept the <a href="/policies/terms">terms</a> and <a href="/policies/privacy">privacy policy</a>. No marketing unless you turn it on.</p>' +
      '<p class="p2a-alt">Already have an account? <button type="button" class="p2a-textbtn" data-p2a-mode="signin">Sign in</button></p></form>' +
      codeStep("signup", null, dis) +
      '<form class="p2a-form" data-p2a-email-step novalidate hidden><div class="p2a-done">' + ICON.check + '<p><b>Account created.</b> One more thing: confirm your email so you can sign in with it.</p></div><p class="p2a-dest" data-p2a-email-dest></p><div class="p2a-preview" data-p2a-preview hidden role="status"></div>' +
      field({ id: "em-code", name: "code", label: "6-digit code", ac: "one-time-code", mode: "numeric", max: 6, cls: "p2a-codefield", extra: ' spellcheck="false"' }) +
      '<button type="submit" class="p2-btn p2a-submit">Confirm email</button><p class="p2a-alt"><button type="button" class="p2a-textbtn" data-p2a-skip-email>Skip for now</button>. You can confirm it later in Profile and security.</p></form></div>';

    return '<div class="p2a p2a-auth" data-ac data-p2a-auth data-next="' + esc(next) + '"' + (dis ? " data-p2a-sample" : "") + ">" +
      // A focused page: the site header, footer and nav are hidden (part2-account-e.css). Only the mark and a way back stay.
      '<header class="p2a-bar"><a class="p2a-bar-logo" href="/" aria-label="Body Café Co. home"><img src="/web/media/brand-original.svg" alt="" width="456" height="443"></a>' +
      '<a class="p2a-bar-back" href="' + esc(next !== "/account" ? next : "/") + '"><span aria-hidden="true">←</span> ' + (next !== "/account" ? "Back to " + esc(task) : "Back to the store") + "</a></header>" +
      (o.sample ? sampleBanner("Design state. Nothing you type is sent, and no code is issued.") : "") +
      '<section class="p2a-top" data-p2a-block style="' + cap(a) + '"><div class="p2a-center">' +
      '<header class="p2a-center-head"><h1 tabindex="-1" data-p2a-word>' + WORDS[mode][0] + '</h1><p class="p2a-center-sub" data-p2a-sub>' + (next !== "/account" ? "Sign in and you’ll go straight back to " + esc(task) + "." : WORDS[mode][1]) + "</p></header>" +
      '<div class="p2a-card p2a-authcard">' +
      '<div class="p2a-tabs" role="tablist" aria-label="Sign in or create an account">' + tab("signin", "Sign in") + tab("signup", "Create account") + "</div>" +
      (demoAllowed() && !dis ? previewBox(hosted) : "") +
      signin + signup +
      '<p class="p2a-guest">Just buying? You don’t need an account. <a href="/checkout">Check out as a guest</a>, then sign in later with the same number and the order joins your account.</p></div></div></section>' +
      '<p class="sr-only" role="status" id="ac-status"></p></div>';
  }
  function codeStep(flow, pending, dis) {
    return '<form class="p2a-form p2a-code" data-p2a-code="' + flow + '" novalidate' + (pending ? "" : " hidden") + ">" +
      (flow === "signup" ? '<ol class="p2a-steps" aria-label="Step 2 of 2"><li class="is-done">Your details</li><li class="is-on">' + (emailOnly() ? "Confirm your email" : "Confirm your number") + '</li></ol>' : "") +
      '<h2 class="p2a-h">Enter your code</h2><p class="p2a-dest" data-p2a-dest>' + (pending ? "Sent to <strong>" + esc(pending.destination) + "</strong>." : "") + "</p>" +
      '<div class="p2a-preview" data-p2a-preview role="status"' + (pending && pending.preview_code ? "" : " hidden") + ">" + (pending && pending.preview_code ? previewText(pending.preview_code, "sms") : "") + "</div>" +
      field({ id: flow + "-code", name: "code", label: "6-digit code", hint: "You can paste the whole code.", ac: "one-time-code", mode: "numeric", max: 6, cls: "p2a-codefield", dis: dis, extra: ' spellcheck="false"' }) +
      '<button type="submit" class="p2-btn p2a-submit"' + (dis ? " disabled" : "") + ">Verify and continue</button>" +
      '<p class="p2a-timers" data-p2a-timers aria-live="off"></p>' +
      '<div class="p2a-row"><button type="button" class="p2a-textbtn" data-p2a-resend hidden>Send a new code</button><button type="button" class="p2a-textbtn" data-p2a-back' + (dis ? " disabled" : "") + ">" + (flow === "signup" ? "Change my details" : "Use a different number or email") + "</button></div></form>";
  }
  function previewText(code, channel) { return "<p>Preview only. In the live store this code arrives by " + (channel === "email" ? "email" : "SMS") + '.</p><p class="p2a-preview-code">Your code <strong>' + esc(code) + "</strong></p>"; }
  function states() {
    if (window.BCCRelease && window.BCCRelease.production) return "";
    var l = [["/account?state=signed-out", "Sign in"], ["/account?state=code", "Code entry"], ["/account?state=empty", "New account"], ["/account?state=sample", "Signed in"], ["/account/addresses?state=sample", "Addresses"], ["/account/profile?state=sample", "Security"]];
    return '<nav class="p2-wrap p2a-states" aria-label="Design states"><span>Design states</span>' + l.map(function (x) { return '<a href="' + x[0] + '">' + x[1] + "</a>"; }).join("") + "</nav>";
  }

  /* ---------- Signed in ---------- */
  var TABS = [["overview", "Overview", "/account"], ["orders", "Orders", "/account/orders"], ["addresses", "Addresses", "/account/addresses"]].concat(CARDS ? [["cards", "Saved cards", "/account/cards"]] : []).concat([ ["support", "Support", "/account/support"], ["reviews", "Reviews", "/account/reviews"], ["profile", "Profile and security", "/account/profile"], ["preferences", "Preferences", "/account/preferences"]]);
  function statusChips(o) {
    var kind = o.state === "delivered" ? "ok" : o.state === "cancelled" || o.state === "expired" ? "muted" : o.state === "pending" ? "warn" : "on";
    return chip(FUL[o.state] || o.state, kind) + (o.state === "pending" || o.payment === "failed" || o.payment === "processing" ? chip(PAY[o.payment] || "", o.payment === "failed" ? "bad" : "warn") : "");
  }
  function orderRow(ctx, o, sample) {
    var n = o.items.reduce(function (t, i) { return t + i.quantity; }, 0), first = ctx.product((o.items[0] || {}).id) || ctx.catalog[0];
    return '<li class="p2a-order" style="' + cap(first) + '"><a href="/orders/' + esc(o.id) + (sample ? "?state=" + (o.state === "shipped" ? "shipped" : o.state === "delivered" ? "delivered" : "paid") : "") + '">' + thumbs(ctx, o.items) +
      '<span class="p2a-order-main"><b>' + o.items.map(function (i) { return esc(i.name); }).join(", ") + "</b><small>" + esc(o.id) + " · " + day(o.created) + " · " + n + " item" + (n === 1 ? "" : "s") + "</small></span>" +
      '<span class="p2a-order-st">' + statusChips(o) + '</span><span class="p2a-order-total">' + money(o.total) + '</span><span class="p2a-go" aria-hidden="true">→</span></a></li>';
  }
  function secHead(id, title, side) { return '<header class="p2a-sec-head"><h2 id="' + id + '">' + title + "</h2>" + (side || "") + "</header>"; }
  function overview(ctx, a, sample) {
    var active = a.orders.filter(function (o) { return ["pending", "paid", "shipped"].indexOf(o.state) >= 0; });
    var openCases = (a.cases || []).filter(function (c) { return c.state !== "resolved"; });
    var cs = ctx.catalog, q = sample ? "?state=sample" : "";
    var tiles = [["/account/addresses", "Addresses", a.addresses.length ? a.addresses.length + " of " + MAX + " saved" : "Add home, office and more", "home"], ["/account/support", "Support", openCases.length ? openCases.length + " open case" + (openCases.length === 1 ? "" : "s") : "Ask us anything", "other"], ["/account/profile", "Profile and security", a.profile && a.profile.has_password ? "Code or password" : "Add a password", "check"]];
    return '<section class="p2a-sec" aria-labelledby="p2a-active">' + secHead("p2a-active", "Active orders", a.orders.length ? '<a class="p2-link" href="/account/orders' + q + '">All orders</a>' : "") +
      (active.length ? '<ul class="p2a-actives">' + active.map(function (o) {
        var act = o.state === "pending" ? (o.payment === "processing" ? ["Check payment", "/payment/" + o.id] : ["Complete payment", "/payment/" + o.id]) : ["Track order", "/orders/" + o.id + (sample ? "?state=" + o.state : "")];
        var first = ctx.product((o.items[0] || {}).id) || cs[0], steps = ["paid", "shipped", "delivered"], at = steps.indexOf(o.state);
        return '<li class="p2a-active" style="' + cap(first) + '"><div class="p2a-active-art">' + thumbs(ctx, o.items) + '</div><div class="p2a-active-body"><p class="p2a-active-k">' + esc(o.id) + " · " + day(o.created) + "</p><h3>" + esc(o.next ? o.next.title : FUL[o.state]) + "</h3><p>" + esc(o.next ? o.next.text : "") + "</p>" +
          '<ol class="p2a-track" aria-label="Progress">' + ["Confirmed", "Shipped", "Delivered"].map(function (s, i) { return '<li class="' + (i <= at ? "is-done" : "") + (i === at ? " is-now" : "") + '">' + s + "</li>"; }).join("") + "</ol>" +
          '<div class="p2a-active-foot"><b>' + money(o.total) + '</b><a class="p2-btn p2-btn-sm" href="' + act[1] + '">' + act[0] + "</a></div></div></li>";
      }).join("") + "</ul>" : '<div class="p2a-empty"><p>Nothing on its way right now. When you order, it shows here until it reaches you.</p><a class="p2-btn" href="/shop">Shop</a></div>') + "</section>" +
      '<ul class="p2a-tiles">' + tiles.map(function (t, i) { return '<li style="' + cap(cs[(i * 2 + 1) % cs.length] || cs[0]) + '"><a href="' + t[0] + q + '"><i class="p2a-tile-ic">' + ICON[t[3]] + "</i><strong>" + t[1] + "</strong><span>" + t[2] + '</span><span class="p2a-go" aria-hidden="true">→</span></a></li>'; }).join("") + "</ul>" +
      (a.orders.some(function (o) { return o.state === "delivered"; }) ? '<section class="p2a-sec" aria-labelledby="p2a-recent">' + secHead("p2a-recent", "Recently delivered", '<a class="p2-link" href="/account/reviews' + q + '">Write a review</a>') + '<ul class="p2a-orders">' + a.orders.filter(function (o) { return o.state === "delivered"; }).slice(0, 2).map(function (o) { return orderRow(ctx, o, sample); }).join("") + "</ul></section>" : "");
  }
  function orders(ctx, a, sample) {
    return '<section class="p2a-sec" aria-labelledby="p2a-orders-h">' + secHead("p2a-orders-h", "Orders", '<span class="p2a-count">' + a.orders.length + " in all</span>") +
      (a.orders.length ? '<ul class="p2a-orders">' + a.orders.map(function (o) { return orderRow(ctx, o, sample); }).join("") + "</ul>" : '<div class="p2a-empty"><p>No orders yet. Orders you place show here, with their payment and delivery status and the lot in each bottle.</p><a class="p2-btn" href="/shop">Shop</a></div>') +
      '<p class="p2a-fine">Each paid order lists the lots it was packed from, with a link to each lot record.</p></section>';
  }
  function addressForm(a, dis) {
    a = a || {}; var id = a.id || "new", lbl = a.label || "home", pre = "ad-" + id + "-";
    return '<form class="p2a-form p2a-card p2a-addr-form" data-p2a-address="' + esc(a.id || "") + '" novalidate><h3 class="p2a-h3">' + (a.id ? "Edit address" : "Add an address") + "</h3>" +
      '<fieldset class="p2a-choice p2a-labels"><legend>Save as</legend>' + LABELS.map(function (x) { return '<label><input type="radio" name="label" value="' + x[0] + '"' + (lbl === x[0] ? " checked" : "") + (dis ? " disabled" : "") + "><span>" + ICON[x[0]] + "<b>" + x[1] + "</b></span></label>"; }).join("") + '<p class="p2a-err" data-err-for="label" hidden></p></fieldset>' +
      '<div class="p2a-grid">' + field({ id: pre + "label_name", name: "label_name", label: "Name this address", hint: "For example Parents, Gym or Studio.", max: 24, value: a.label_name, dis: dis, hidden: lbl !== "other", cls: "p2a-labelname", wide: true }) +
      field({ id: pre + "name", name: "name", label: "Full name", ac: "name", max: 200, value: a.name, dis: dis }) +
      field({ id: pre + "mobile", name: "mobile", label: "Phone for delivery", optional: !emailOnly(), prefix: "+91", type: "tel", mode: "numeric", ac: "tel-national", max: 10, value: a.mobile, dis: dis }) +
      field({ id: pre + "address", name: "address", label: "House or flat, building, street and area", ac: "street-address", max: 200, value: a.address, dis: dis, wide: true }) +
      field({ id: pre + "landmark", name: "landmark", label: "Landmark", optional: true, max: 120, value: a.landmark, dis: dis, wide: true }) +
      field({ id: pre + "pincode", name: "pincode", label: "Pincode", mode: "numeric", ac: "postal-code", max: 6, value: a.pincode, dis: dis }) +
      field({ id: pre + "city", name: "city", label: "City or town", ac: "address-level2", max: 200, value: a.city, dis: dis }) +
      field({ id: pre + "state", name: "state", label: "State", html: '<div class="p2a-input"><select id="p2a-' + pre + 'state" name="state" autocomplete="address-level1" aria-describedby="p2a-' + pre + 'state-err"' + (dis ? " disabled" : "") + '><option value="">Choose a state</option>' + STATES.map(function (s) { return "<option" + (s === a.state ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select></div>", wide: true }) + "</div>" +
      '<label class="p2a-check"><input type="checkbox" name="default"' + (a.isDefault ? " checked disabled" : "") + (dis ? " disabled" : "") + "><span>Use as my default delivery address</span></label>" +
      '<p class="p2a-err" data-p2a-form-err hidden></p><div class="p2a-row"><button type="submit" class="p2-btn"' + (dis ? " disabled" : "") + ">Save address</button><button type=\"button\" class=\"p2-btn p2-btn-ghost\" data-p2a-close>Cancel</button></div></form>";
  }
  function addresses(ctx, a, sample) {
    // The local server keeps the default on the profile; the hosted API marks the address itself (default: true).
    var def = (a.profile && a.profile.default_address) || (a.addresses.filter(function (x) { return x.default === true; })[0] || {}).id, n = a.addresses.length, cs = ctx.catalog;
    var list = a.addresses.slice().sort(function (x, y) { return (y.id === def) - (x.id === def); });
    return '<section class="p2a-sec" aria-labelledby="p2a-addr-h">' + secHead("p2a-addr-h", "Addresses", '<span class="p2a-count">' + n + " of " + MAX + " saved</span>") +
      '<p class="p2a-intro">Save where we deliver: home, office, or somewhere you name yourself. Your default is filled in at checkout, and you can pick another there.</p>' +
      '<ul class="p2a-addrs">' + list.map(function (x, i) {
        var isDef = x.id === def;
        return '<li class="p2a-addr' + (isDef ? " is-default" : "") + '" data-p2a-addr-item="' + esc(x.id) + '" style="' + cap(cs[(i * 2) % cs.length] || cs[0]) + '"><div class="p2a-addr-card"><div class="p2a-addr-top"><span class="p2a-addr-ic">' + ICON[x.label === "office" ? "office" : x.label === "other" ? "other" : "home"] + "</span><h3>" + esc(labelOf(x)) + "</h3>" + (isDef ? chip("Default", "on") : "") + "</div>" +
          "<address><b>" + esc(x.name) + "</b><br>" + esc(x.address) + (x.landmark ? "<br><span>" + esc(x.landmark) + "</span>" : "") + "<br>" + esc(x.city) + ", " + esc(x.state) + " " + esc(x.pincode) + "</address>" + (x.mobile ? '<p class="p2a-addr-ph">+91 ' + esc(x.mobile.slice(0, 5) + " " + x.mobile.slice(5)) + "</p>" : "") +
          '<div class="p2a-row p2a-actions"><button type="button" class="p2a-textbtn" data-p2a-edit' + (sample ? " disabled" : "") + ">Edit</button>" + (isDef ? "" : '<button type="button" class="p2a-textbtn" data-p2a-addr-default="' + esc(x.id) + '"' + (sample ? " disabled" : "") + ">Make default</button>") + '<button type="button" class="p2a-textbtn" data-p2a-addr-delete="' + esc(x.id) + '"' + (sample ? " disabled" : "") + ">Remove</button></div></div>" +
          '<div class="p2a-slot" data-p2a-slot hidden>' + addressForm(Object.assign({ isDefault: isDef }, x), sample) + "</div></li>";
      }).join("") +
      (n < MAX ? '<li class="p2a-addr is-new"><button type="button" class="p2a-new" data-p2a-open="new-address"' + (sample ? " disabled" : "") + '><span class="p2a-plus" aria-hidden="true">+</span><b>Add an address</b><small>' + (MAX - n) + " more you can save</small></button></li>" : "") + "</ul>" +
      (n < MAX ? '<div class="p2a-slot p2a-slot-new" data-p2a-slot="new-address" hidden>' + addressForm({ isDefault: !n }, sample) + "</div>" : '<p class="p2a-fine">You’ve saved five addresses, the most an account keeps. Remove one to add another.</p>') + "</section>";
  }
  function cardFace(ctx, c, i, def, sample) {
    var cs = ctx.catalog, p = cs[(i * 2 + 1) % cs.length] || cs[0], isDef = c.id === def, mm = String(c.exp_month).padStart(2, "0"), yy = String(c.exp_year).slice(-2);
    var soon = new Date(c.exp_year, c.exp_month, 0) - Date.now() < 60 * 864e5;
    return '<li class="p2a-pcard' + (isDef ? " is-default" : "") + '" data-p2a-card-item="' + esc(c.id) + '" style="' + cap(p) + '"><div class="p2a-cardface"><div class="p2a-cf-top"><span class="p2a-cf-nick">' + esc(c.nickname || (c.kind === "debit" ? "Debit card" : "Credit card")) + '</span><b class="p2a-cf-net">' + esc(NETWORKS[c.network] || c.network) + "</b></div>" +
      '<span class="p2a-cf-chip" aria-hidden="true"></span><p class="p2a-cf-num" aria-label="Card ending ' + esc(c.last4) + '"><span aria-hidden="true">••••&nbsp; ••••&nbsp; ••••&nbsp;</span>' + esc(c.last4) + "</p>" +
      '<div class="p2a-cf-foot"><span><small>Name</small>' + esc(c.name) + "</span><span><small>Valid thru</small>" + mm + "/" + yy + "</span></div></div>" +
      '<div class="p2a-card-meta"><span>' + (c.kind === "debit" ? "Debit" : "Credit") + (isDef ? " · " + chip("Default", "on") : "") + (soon ? " " + chip("Expires soon", "warn") : "") + '</span><div class="p2a-row">' + (isDef ? "" : '<button type="button" class="p2a-textbtn" data-p2a-card-default="' + esc(c.id) + '"' + (sample ? " disabled" : "") + ">Make default</button>") + '<button type="button" class="p2a-textbtn" data-p2a-card-delete="' + esc(c.id) + '"' + (sample ? " disabled" : "") + ">Remove</button></div></div></li>";
  }
  function cards(ctx, a, sample) {
    var list = a.cards || [], def = a.profile && a.profile.default_card, n = list.length, dis = sample;
    return '<section class="p2a-sec" aria-labelledby="p2a-cards-h">' + secHead("p2a-cards-h", "Saved cards", '<span class="p2a-count">' + n + " of " + MAX + " saved</span>") +
      '<div class="p2a-safe">' + ICON.lock + "<p><b>We never see or keep your full card number or CVV.</b> Each card is saved as a secure token by our payment provider, as RBI rules require. At checkout you choose the card and enter its CVV; your bank may ask you to confirm the first time.</p></div>" +
      '<ul class="p2a-pcards">' + list.map(function (c, i) { return cardFace(ctx, c, i, def, sample); }).join("") +
      (n < MAX ? '<li class="p2a-pcard is-new"><button type="button" class="p2a-new" data-p2a-open="new-card"' + (dis ? " disabled" : "") + '><span class="p2a-plus" aria-hidden="true">+</span><b>Add a card</b><small>Credit or debit · Visa, Mastercard, RuPay, Amex, Diners</small></button></li>' : "") + "</ul>" +
      (n < MAX ? '<div class="p2a-slot p2a-slot-new" data-p2a-slot="new-card" hidden><form class="p2a-form p2a-card p2a-card-form" data-p2a-card novalidate autocomplete="on"><h3 class="p2a-h3">' + ICON.lock + "Add a card</h3>" +
        '<div class="p2a-cardform"><div class="p2a-cardlive" aria-hidden="true" data-p2a-cardlive><span class="p2a-cl-top"><span>Secure card</span><b data-p2a-cl-net>Card</b></span><span class="p2a-cf-chip"></span><span class="p2a-cl-num" data-p2a-cl-num>•••• •••• •••• ••••</span><span class="p2a-cl-foot"><span data-p2a-cl-name>Name on card</span><span data-p2a-cl-exp>MM/YY</span></span></div><div>' +
        '<fieldset class="p2a-choice p2a-kind"><legend>Card type</legend><label><input type="radio" name="kind" value="credit" checked' + (dis ? " disabled" : "") + '><span><b>Credit</b></span></label><label><input type="radio" name="kind" value="debit"' + (dis ? " disabled" : "") + '><span><b>Debit</b></span></label><p class="p2a-err" data-err-for="kind" hidden></p></fieldset>' +
        '<div class="p2a-grid">' + field({ id: "cd-number", name: "cardnumber", label: "Card number", type: "text", mode: "numeric", ac: "cc-number", max: 23, dis: dis, wide: true, extra: ' spellcheck="false" data-err-alias="number"' }) +
        field({ id: "cd-exp", name: "expiry", label: "Expiry", ph: "MM/YY", mode: "numeric", ac: "cc-exp", max: 5, dis: dis }) +
        field({ id: "cd-name", name: "ccname", label: "Name on card", ac: "cc-name", max: 60, dis: dis, extra: ' data-err-alias="name"' }) +
        field({ id: "cd-nick", name: "nickname", label: "Nickname", optional: true, hint: "For example Everyday or Travel.", max: 24, dis: dis, wide: true }) + "</div></div></div>" +
        '<label class="p2a-check"><input type="checkbox" name="default"' + (n ? "" : " checked disabled") + (dis ? " disabled" : "") + "><span>Use as my default card</span></label>" +
        '<p class="p2a-fine">No CVV here: you enter it each time you pay. In this preview the full number stays in your browser; only the last four digits, the network and the expiry are saved.</p>' +
        '<p class="p2a-err" data-p2a-form-err hidden></p><div class="p2a-row"><button type="submit" class="p2-btn"' + (dis ? " disabled" : "") + ">Save card</button><button type=\"button\" class=\"p2-btn p2-btn-ghost\" data-p2a-close>Cancel</button></div></form></div>" : '<p class="p2a-fine">You’ve saved five cards, the most an account keeps. Remove one to add another.</p>') +
      '<p class="p2a-fine">UPI, wallets and net banking are chosen at checkout each time, so there’s nothing to save for them.</p></section>';
  }
  function profile(ctx, a, u, sample) {
    var p = Object.assign({}, a.profile || {}), dis = sample, m = String(p.mobile || (u && u.mobile) || "");
    // The hosted account record carries name and mobile; the email (already confirmed by its sign-in code) comes from the session.
    if (!p.email && u && u.email) { p.email = u.email; p.email_verified = true; }
    var pwKnown = p.has_password !== undefined;
    var em = p.email ? (p.email_verified ? chip("Confirmed", "ok") : chip("Not confirmed", "warn")) : "";
    var row = function (title, value, note) { return '<li><span class="p2a-m-t">' + title + '</span><span class="p2a-m-v">' + value + "</span>" + (note ? '<span class="p2a-m-n">' + note + "</span>" : "") + "</li>"; };
    return '<section class="p2a-sec" aria-labelledby="p2a-prof-h">' + secHead("p2a-prof-h", "Profile") +
      '<form class="p2a-form p2a-card" data-p2a-profile data-email="' + esc(p.email || "") + '" novalidate><div class="p2a-grid">' + field({ id: "pf-name", name: "name", label: "Name", ac: "name", max: 80, value: p.name === "Customer" ? "" : p.name, dis: dis }) +
      field({ id: "pf-email", name: "email", label: "Email", optional: !emailOnly(), hint: emailOnly() ? "You sign in with this. If you change it, we’ll send a code to the new address." : "For receipts and replies. Confirm it to sign in with it.", type: "email", ac: "email", max: 254, value: p.email, dis: dis, extra: ' spellcheck="false" autocapitalize="off"' }) + "</div>" +
      '<p class="p2a-err" data-p2a-form-err hidden></p><div class="p2a-row"><button type="submit" class="p2-btn"' + (dis ? " disabled" : "") + ">Save profile</button></div></form></section>" +
      '<section class="p2a-sec" aria-labelledby="p2a-sec-h">' + secHead("p2a-sec-h", "Sign-in and security") +
      '<ul class="p2a-card p2a-methods">' +
      (m ? row("Mobile", "+91 " + esc(m.slice(0, 2)) + "••••••" + esc(m.slice(-2)) + (emailOnly() ? "" : " " + chip("Confirmed", "ok")), emailOnly() ? "Used for delivery updates." : 'Your orders are linked to this number. To change it, <a href="/contact?kind=general">contact us</a>.') : "") +
      row("Email", (p.email ? esc(p.email) + " " + em : "Not added"), p.email && !p.email_verified ? '<button type="button" class="p2a-textbtn" data-p2a-email-confirm' + (dis ? " disabled" : "") + ">Send a code to confirm it</button>" : p.email ? "You can sign in with this email." : "Add one above to sign in with it.") +
      row("Password", !pwKnown ? "Optional" : p.has_password ? "Set" + (p.pw_updated ? " · changed " + day(p.pw_updated) : "") : "Not set", '<button type="button" class="p2a-textbtn" data-p2a-open="password"' + (dis ? " disabled" : "") + ">" + (!pwKnown ? "Add or change your password" : p.has_password ? "Change password" : "Add a password") + "</button>" + (p.has_password ? "" : " You can keep signing in with codes.")) +
      row("Signed in", esc(a.sessions || 1) + " device" + ((a.sessions || 1) === 1 ? "" : "s"), "A signed-in session lasts up to eight hours.") + "</ul>" +
      '<form class="p2a-form p2a-card" data-p2a-email-code-form novalidate hidden><p class="p2a-dest" data-p2a-dest></p><div class="p2a-preview" data-p2a-preview hidden role="status"></div>' + field({ id: "pe-code", name: "code", label: "6-digit code", ac: "one-time-code", mode: "numeric", max: 6, cls: "p2a-codefield" }) + '<div class="p2a-row"><button type="submit" class="p2-btn">Confirm email</button><button type="button" class="p2-btn p2-btn-ghost" data-p2a-close>Cancel</button></div></form>' +
      '<div class="p2a-slot" data-p2a-slot="password" hidden><form class="p2a-form p2a-card" data-p2a-password novalidate><h3 class="p2a-h3">' + (!pwKnown ? "Your password" : p.has_password ? "Change password" : "Add a password") + '</h3><div class="p2a-grid">' + (p.has_password || !pwKnown ? field({ id: "pw-current", name: "current", label: "Current password", optional: !pwKnown, hint: pwKnown ? "" : "Leave blank if you’ve never set one.", type: "password", ac: "current-password", max: 128, reveal: true }) : "") +
      field({ id: "pw-new", name: "password", label: "New password", hint: "At least 8 characters, with a letter and a number.", type: "password", ac: "new-password", max: 128, reveal: true }) + '</div><div class="p2a-meter" data-p2a-meter aria-hidden="true"><i></i><i></i><i></i></div><p class="p2a-err" data-p2a-form-err hidden></p><div class="p2a-row"><button type="submit" class="p2-btn">Save password</button><button type="button" class="p2-btn p2-btn-ghost" data-p2a-close>Cancel</button></div></form></div>' +
      '<div class="p2a-row"><button type="button" class="p2-btn p2-btn-ghost" data-action="logout"' + (dis ? " disabled" : "") + '>Sign out</button><button type="button" class="p2a-textbtn" data-ac-everywhere' + (dis ? " disabled" : "") + ">Sign out on all devices</button></div></section>" +
      (AC().sections && !sample ? '<div class="p2a-reuse p2a-card">' + AC().sections.privacy() + "</div>" : "");
  }
  function reused(name, ctx, a, u) {
    var X = AC().sections; if (!X || !X[name]) return "";
    return '<div class="p2a-reuse">' + X[name](a, u, { key: "e", k: function (t) { return t; } }) + "</div>";
  }
  function dashboard(ctx, tab, a, u, sample, preview) {
    var p = a.profile || {}, first = p.name && p.name !== "Customer" ? p.name.split(" ")[0] : "", cs = ctx.catalog, q = sample ? "?state=sample" : "";
    var openCases = (a.cases || []).filter(function (c) { return c.state !== "resolved"; }).length;
    var count = { orders: a.orders.length, addresses: a.addresses.length, cards: CARDS ? (a.cards || []).length : "", support: openCases || "" };
    var body = tab === "orders" ? orders(ctx, a, sample) : tab === "addresses" ? addresses(ctx, a, sample) : tab === "cards" && CARDS ? cards(ctx, a, sample) : tab === "profile" ? profile(ctx, a, u, sample)
      : tab === "support" ? reused("support", ctx, a, u) : tab === "reviews" ? reused("reviews", ctx, a, u) : tab === "preferences" ? reused("prefs", ctx, a, u) : overview(ctx, a, sample);
    var since = a.orders.length ? a.orders[a.orders.length - 1].created : 0;
    return ('<div class="p2a p2a-dash" data-ac data-ac-page="account"' + (sample ? " data-p2a-sample" : "") + ">" +
      (preview ? sampleBanner("Preview account. Everything you change is kept in this browser tab only; nothing is sent.", "Preview") : "") +
      (sample ? sampleBanner("Synthetic account for reviewing the design. Controls are disabled and nothing is saved.") : "") +
      '<header class="p2-wrap p2a-hello"><div>' + eb("Your account") + '<h1 tabindex="-1">' + (first ? "Hello, " + esc(first) + "." : "Hello again.") + "</h1>" +
      '<p class="p2a-hello-sub">+91 ••••••' + esc(String(p.mobile || (u && u.mobile) || "").slice(-4)) + ((p.email || (u && u.email)) ? " · " + esc(p.email || u.email) : "") + (since ? " · Ordering since " + new Date(since * 1000).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "") + "</p></div>" +
      '<span class="p2a-hello-caps" aria-hidden="true">' + cs.map(function (c) { return P.capImg(c, "p2a-capimg"); }).join("") + "</span></header>" +
      '<div class="p2-wrap p2a-layout"><nav class="p2a-nav" aria-label="Account"><ul>' + TABS.map(function (t) {
        var c = count[t[0]];
        return '<li><a href="' + t[2] + q + '"' + (t[0] === tab ? ' aria-current="page"' : "") + "><span>" + t[1] + "</span>" + (c !== undefined && c !== "" ? "<small>" + c + "</small>" : "") + "</a></li>";
      }).join("") + '</ul><button type="button" class="p2a-textbtn p2a-nav-out" data-action="logout"' + (sample ? " disabled" : "") + ">Sign out</button></nav>" +
      '<div class="p2a-body" id="ac-body">' + body + "</div></div>" + (sample ? states() : "") + '<p class="sr-only" role="status" id="ac-status"></p></div>')
      // The preview account signs out here, not through the real API.
      .replace(preview ? /data-action="logout"|data-ac-everywhere/g : /$^/, "data-p2a-logout");
  }

  function loadingDash(ctx, tab, u) {
    var a = { orders: [], addresses: [], cases: [], reviews: [], cards: [], profile: { mobile: u.mobile, name: u.name } };
    return dashboard(ctx, tab, a, u, false).replace('<div class="p2a-body" id="ac-body">', '<div class="p2a-body is-loading" id="ac-body" aria-busy="true"><div class="p2a-skel" role="status"><span class="sr-only">Loading your account…</span><i></i><i></i><i></i></div><div hidden>');
  }

  /* Speed: the page draws at once. The app (web/app.js) asks BCCAccountFast whether to wait for the account record:
     the sign-in screen and the preview account need none; a signed-in customer sees what is already held and it
     refreshes in the background. After a save, refresh() makes the next draw wait for the new record. */
  var forceNext = false, heldFor = "", waitingFor = "";
  function refresh() { forceNext = true; return A().rerender(); }
  window.BCCAccountFast = function (path, user, acct) {
    if (!on2() || !/^\/account(\/|$)/.test(path)) return "";
    if (forceNext) { forceNext = false; heldFor = user && user.id; waitingFor = ""; return ""; }
    if (demoCurrent() || !isCustomer(user)) return "skip";
    if (user.id !== heldFor) { heldFor = user.id; waitingFor = user.id; return "load"; }
    waitingFor = "";
    return "stale";
  };

  part2("account", function (base, ctx, tab, fx) {
    var map = { orders: "orders", addresses: "addresses", cards: "cards", support: "support", cases: "support", reviews: "reviews", profile: "profile", security: "profile", preferences: "preferences" };
    tab = map[tab] || "overview";
    if (fx === "signed-out") return authPage(ctx, { sample: true, next: "/account" });
    if (fx === "code") return authPage(ctx, { sample: true, code: true, next: "/account" });
    if (fx) return dashboard(ctx, tab, sampleAccount(ctx, fx), { id: "customer-sample", mobile: "9876543210" }, true);
    var dc = demoCurrent();
    if (dc) return dashboard(ctx, tab, dc.account, { id: "customer-preview", mobile: dc.account.profile.mobile }, false, true);
    var u = ctx.user;
    // Signed in but the account record hasn't arrived yet (it loads in the background): a quiet placeholder, never a wait.
    if (isCustomer(u) && (waitingFor === u.id || !(ctx.account && ctx.account.profile))) return loadingDash(ctx, tab, u);
    var a = ctx.account || { orders: [], addresses: [], cases: [], reviews: [], cards: [] };
    if (!a.cards) a.cards = [];
    if (!isCustomer(u)) {
      // The sign-in screen stays focused: guest orders and cases from this browser join the account once signed in.
      return authPage(ctx, { next: tab === "overview" ? "/account" : (TABS.filter(function (t) { return t[0] === tab; })[0] || TABS[0])[2] });
    }
    return dashboard(ctx, tab, a, u, false);
  });
  part2("signIn", function (base, ctx) {
    if (isCustomer(ctx.user) || demoCurrent()) {
      var next = AC().safeNext ? AC().safeNext(ctx.query.get("next")) : "/account";
      return '<div class="p2a"><header class="p2-wrap p2-page-head">' + eb("Your account") + '<h1>You’re signed in.</h1><p class="p2-lede">Signed in with +91 ••••••' + esc(String((demoCurrent() ? demoCurrent().account.profile : ctx.user).mobile).slice(-4)) + '.</p><div class="p2a-row"><a class="p2-btn" href="' + esc(next) + '">Continue to ' + esc(AC().taskName ? AC().taskName(next) : "your account") + "</a></div></header></div>";
    }
    return authPage(ctx, {});
  });

  /* ---------- Behaviour ---------- */
  var timer = 0;
  function errs(form, fields, general) {
    form.querySelectorAll(".p2a-err").forEach(function (e) { e.hidden = true; e.textContent = ""; });
    form.querySelectorAll("[aria-invalid]").forEach(function (e) { e.removeAttribute("aria-invalid"); });
    var firstBad = null;
    Object.keys(fields || {}).forEach(function (n) {
      var input = form.querySelector('[name="' + n + '"]') || form.querySelector('[data-err-alias="' + n + '"]');
      var box = form.querySelector('[data-err-for="' + n + '"]') || (input && form.querySelector('[data-err-for="' + input.name + '"]'));
      if (box) { box.textContent = fields[n]; box.hidden = false; }
      if (input) { input.setAttribute("aria-invalid", "true"); firstBad = firstBad || input; }
    });
    var g = form.querySelector("[data-p2a-form-err]");
    if (g && general) { g.textContent = general; g.hidden = false; }
    if (firstBad) firstBad.focus(); else if (g && general) g.setAttribute("tabindex", "-1");
    return !!(firstBad || general);
  }
  function fromError(form, x) {
    var d = x && x.data || {}, f = d.fields || (d.field ? (function () { var o = {}; o[d.field] = x.message; return o; })() : null);
    errs(form, f, f && !d.fields ? "" : x.message);
  }
  async function busy(btn, label, fn) {
    var old = btn ? btn.textContent : ""; if (btn) { btn.disabled = true; btn.textContent = label; }
    try { return await fn(); } finally { if (btn && btn.isConnected) { btn.disabled = false; btn.textContent = old; } }
  }
  function digits(v) { return String(v || "").replace(/\D/g, ""); }
  function identify(raw) {
    var v = String(raw || "").trim(), d = digits(v);
    if (/^[+\d\s()-]+$/.test(v)) { if (d.length === 12 && d.indexOf("91") === 0) d = d.slice(2); if (d.length === 11 && d[0] === "0") d = d.slice(1); return /^[6-9]\d{9}$/.test(d) ? { mobile: d } : { bad: "Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9." }; }
    return /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/.test(v) ? { email: v.toLowerCase() } : { bad: v ? "Enter a mobile number or an email address." : "Enter your mobile number or email." };
  }
  function strength(pw) { var s = 0; if (pw.length >= 8) s++; if (/[A-Za-z]/.test(pw) && /\d/.test(pw)) s++; if (pw.length >= 12 || /[^A-Za-z0-9]/.test(pw)) s++; return pw ? s : 0; }
  function network(d) {
    if (/^3[47]/.test(d)) return "amex";
    if (/^3(0[0-5]|[689])/.test(d)) return "diners";
    if (/^(508[5-9]|60(69|7[0-9]|8[0-5])|6521|6522|81|82|353|356)/.test(d)) return "rupay";
    if (/^4/.test(d)) return "visa";
    if (/^(5[1-5]|2(2[2-9]|[3-6]|7[01]|720))/.test(d)) return "mastercard";
    return "";
  }
  function luhn(d) { var s = 0, alt = false; for (var i = d.length - 1; i >= 0; i--) { var n = +d[i]; if (alt) { n *= 2; if (n > 9) n -= 9; } s += n; alt = !alt; } return s % 10 === 0; }
  async function finish(root, r) {
    swrite("bcc-p2-otp", ""); clearInterval(timer);
    if (!r.preview) await A().session();
    var merged = window.BCCBag && !r.preview ? await window.BCCBag.afterSignIn() : "";
    if (merged) swrite("bcc-bag-notice", merged);
    swrite("bcc-signed-out", "");
    A().toast((r.created ? "Account created. " : "Welcome back. ") + (r.claimed_orders ? r.claimed_orders + " order" + (r.claimed_orders > 1 ? "s" : "") + " from this browser joined your account. " : "") + (merged ? "Your bag was combined; review it before checkout." : ""));
    go(root.getAttribute("data-next") || "/account");
  }
  // navigate() to the page already open does not always redraw it; sign-in and sign-out must.
  function go(href) { var u = new URL(href, location.origin); if (u.pathname === location.pathname) { var q = new URL(location.href); q.searchParams.delete("mode"); history.replaceState(history.state, "", q.pathname + q.search); refresh(); window.scrollTo(0, 0); } else A().navigate(href); }

  function mountAuth(root, signal) {
    var on = function (el, ev, fn) { if (el) el.addEventListener(ev, fn, { signal: signal }); };
    var sample = root.hasAttribute("data-p2a-sample"), hosted = !!window.BCCConnectedHosted && !sample;
    var block = root.querySelector("[data-p2a-block]");
    var pending = JSON.parse(sread("bcc-p2-otp") || "null");
    var sub = root.querySelector("[data-p2a-sub]"), custom = root.getAttribute("data-next") !== "/account";
    function setMode(m, focus) {
      root.querySelectorAll("[data-p2a-mode][role=tab]").forEach(function (t) { var s = t.dataset.p2aMode === m; t.setAttribute("aria-selected", String(s)); t.tabIndex = s ? 0 : -1; if (s && focus) t.focus(); });
      root.querySelectorAll(".p2a-panel").forEach(function (p) { p.hidden = p.id !== "p2a-panel-" + m; });
      root.querySelector("[data-p2a-word]").textContent = WORDS[m][0];
      if (sub && !custom) sub.textContent = WORDS[m][1];
      root.querySelectorAll(".p2a-bottle").forEach(function (s) { s.classList.toggle("is-on", s.classList.contains("p2a-bottle-" + m)); });
      var st = block.getAttribute("data-cap-" + m); if (st) block.style.setProperty("--cap", st.replace(/^--cap:/, ""));
      var u = new URL(location.href); if (m === "signup") u.searchParams.set("mode", "signup"); else u.searchParams.delete("mode"); history.replaceState(history.state, "", u.pathname + u.search + u.hash);
      if (A().routeChanged) A().routeChanged();
    }
    root.addEventListener("click", function (e) {
      var t = e.target.closest("button"); if (!t || !root.contains(t)) return;
      if (t.dataset.p2aMode) { setMode(t.dataset.p2aMode, t.getAttribute("role") === "tab"); if (t.getAttribute("role") !== "tab") { var f = root.querySelector("#p2a-panel-" + t.dataset.p2aMode + " input:not([type=radio])"); if (f) f.focus(); } }
    }, { signal: signal });
    var tabs = [].slice.call(root.querySelectorAll("[role=tab]"));
    tabs.forEach(function (t, i) { on(t, "keydown", function (e) { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); var n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length]; setMode(n.dataset.p2aMode, true); } }); });
    root.querySelectorAll("[data-p2a-reveal]").forEach(function (b) { on(b, "click", function () { var i = b.parentNode.querySelector("input"), show = i.type === "password"; i.type = show ? "text" : "password"; b.textContent = show ? "Hide" : "Show"; b.setAttribute("aria-pressed", String(show)); }); });
    root.querySelectorAll("[data-p2a-meter]").forEach(function (m) { var i = m.parentNode.querySelector('input[name="password"]'); on(i, "input", function () { m.dataset.level = strength(i.value); }); });
    if (sample) { root.addEventListener("submit", function (e) { e.preventDefault(); }, { signal: signal }); return; }

    var si = root.querySelector("[data-p2a-signin]"), su = root.querySelector("[data-p2a-signup]"), es = root.querySelector("[data-p2a-email-step]");
    var codes = { signin: root.querySelector('[data-p2a-code="signin"]'), signup: root.querySelector('[data-p2a-code="signup"]') };
    var method = function () { return (si.querySelector("input[name=method]:checked") || {}).value || "code"; };
    function syncMethod() {
      var pw = method() === "password";
      si.querySelector(".p2a-pw").hidden = !pw; si.querySelector("[data-p2a-forgot]").hidden = !pw;
      si.querySelector("[data-p2a-submit-label]").textContent = pw ? "Sign in" : "Send code";
    }
    si.querySelectorAll("input[name=method]").forEach(function (r) { on(r, "change", syncMethod); });
    on(root.querySelector("[data-p2a-fill]"), "click", function () { setMode("signin"); si.hidden = false; si.elements.identifier.value = emailOnly() ? DEMO.email : "99999 99999"; si.querySelector('input[value="password"]').checked = true; syncMethod(); si.elements.password.value = DEMO.password; si.querySelector("button[type=submit]").focus(); });
    on(si.querySelector("[data-p2a-use-code]"), "click", function () { si.querySelector('input[value="code"]').checked = true; syncMethod(); si.elements.identifier.focus(); });
    on(su.elements.mobile, "input", function () { var v = digits(su.elements.mobile.value); if (v.length > 10 && v.indexOf("91") === 0) v = v.slice(-10); su.elements.mobile.value = v.slice(0, 10); });

    function tick() {
      if (!pending) return;
      var cf = codes[pending.flow], now = Date.now() / 1000, left = Math.max(0, Math.round(pending.resend_at - now)), exp = Math.max(0, Math.round(pending.expires_at - now));
      cf.querySelector("[data-p2a-timers]").textContent = (exp ? "Code valid for " + Math.floor(exp / 60) + ":" + String(exp % 60).padStart(2, "0") + "." : "This code has expired. Send a new one.") + (left ? " New code in " + left + "s." : "");
      cf.querySelector("[data-p2a-resend]").hidden = left > 0;
    }
    function showCode(focus) {
      var cf = codes[pending.flow], form = pending.flow === "signup" ? su : si;
      form.hidden = true; cf.hidden = false;
      cf.querySelector("[data-p2a-dest]").innerHTML = "Sent to <strong>" + esc(pending.destination) + "</strong>" + (pending.mode === "preview" ? ". Preview: nothing is actually sent." : ".");
      var pv = cf.querySelector("[data-p2a-preview]"); pv.hidden = !pending.preview_code; pv.innerHTML = pending.preview_code ? previewText(pending.preview_code, pending.channel) : "";
      tick(); clearInterval(timer); timer = setInterval(tick, 1000);
      if (focus) cf.elements.code.focus();
    }
    function remember(flow, who, r) {
      var now = Date.now() / 1000;
      pending = { flow: flow, who: who, destination: r.destination, mode: r.mode, channel: r.channel, expires_at: now + r.expires_in, resend_at: now + r.resend_in, preview_code: r.preview_code || "" };
      swrite("bcc-p2-otp", JSON.stringify(Object.assign({}, pending, { preview_code: "" })));
    }
    if (pending && codes[pending.flow]) { if (pending.expires_at < Date.now() / 1000 - 600) { pending = null; swrite("bcc-p2-otp", ""); } else { if (pending.flow === "signup") setMode("signup"); showCode(false); } }

    on(si, "submit", async function (e) {
      e.preventDefault(); e.stopPropagation();
      var who = identify(si.elements.identifier.value), btn = si.querySelector("button[type=submit]");
      if (emailOnly() && who.mobile && who.mobile !== DEMO.mobile) who = { bad: "Sign in with your email address for now. Codes by text message come later." };
      if (who.bad) { errs(si, { identifier: who.bad }); return; }
      if (method() === "password") {
        if (!si.elements.password.value) { errs(si, { password: "Enter your password." }); return; }
        errs(si, {});
        try { var r = await busy(btn, "Signing in…", function () { return api("/auth/password", { identifier: who.mobile || who.email, password: si.elements.password.value }); }); await finish(root, r); }
        catch (x) { errs(si, {}, x.message); si.querySelector("[data-p2a-forgot]").hidden = false; }
        return;
      }
      errs(si, {});
      try { var o = await busy(btn, "Sending…", function () { return api("/auth/otp", who); }); remember("signin", who, o); codes.signin.elements.code.value = ""; showCode(true); }
      catch (x) { errs(si, x.data && x.data.reason === "unknown_email" ? { identifier: x.message } : {}, x.data && x.data.reason === "unknown_email" ? "" : x.message); }
    });
    on(su, "submit", async function (e) {
      e.preventDefault(); e.stopPropagation();
      var d = { name: su.elements.name.value.trim(), mobile: digits(su.elements.mobile.value), email: su.elements.email.value.trim(), password: su.elements.password.value }, bad = {};
      if (!d.name) bad.name = "Enter your name.";
      var mailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email);
      if (emailOnly()) {
        if (!mailOk) bad.email = "Enter your email address. Your code is sent there.";
        if (d.mobile && !/^[6-9]\d{9}$/.test(d.mobile)) bad.mobile = "Enter a 10-digit Indian mobile number, or leave it blank.";
      } else {
        if (!/^[6-9]\d{9}$/.test(d.mobile)) bad.mobile = "Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9.";
        if (d.email && !mailOk) bad.email = "Enter a valid email address, or leave it blank.";
      }
      if (d.password && strength(d.password) < 2) bad.password = "Use at least 8 characters, with a letter and a number.";
      if (errs(su, bad)) return;
      try { var o = await busy(su.querySelector("button[type=submit]"), "Creating…", function () { return api("/auth/signup", d); }); remember("signup", emailOnly() ? { email: d.email.toLowerCase() } : { mobile: d.mobile }, o); codes.signup.elements.code.value = ""; showCode(true); }
      catch (x) {
        if (x.data && x.data.reason === "exists") { errs(su, x.data.fields || {}, ""); var key = Object.keys(x.data.fields || {})[0] || (emailOnly() ? "email" : "mobile"), box = su.querySelector('[data-err-for="' + key + '"]'); box.hidden = false; box.innerHTML = esc(x.message) + ' <button type="button" class="p2a-textbtn" data-p2a-mode="signin">Sign in</button>'; si.elements.identifier.value = key === "email" ? d.email : d.mobile; }
        else fromError(su, x);
      }
    });
    Object.keys(codes).forEach(function (flow) {
      var cf = codes[flow];
      on(cf.elements.code, "input", function () { var v = digits(cf.elements.code.value).slice(0, 6); if (cf.elements.code.value !== v) cf.elements.code.value = v; if (v.length === 6 && !cf.dataset.auto) { cf.dataset.auto = "1"; cf.requestSubmit ? cf.requestSubmit() : cf.querySelector("button[type=submit]").click(); } if (v.length < 6) delete cf.dataset.auto; });
      on(cf.querySelector("[data-p2a-back]"), "click", function () { pending = null; swrite("bcc-p2-otp", ""); clearInterval(timer); cf.hidden = true; var f = flow === "signup" ? su : si; f.hidden = false; (flow === "signup" ? su.elements.mobile : si.elements.identifier).focus(); });
      on(cf.querySelector("[data-p2a-resend]"), "click", async function (e) {
        var b = e.currentTarget;
        try { var o = await busy(b, "Sending…", function () { return api("/auth/otp", pending.who); }); remember(flow, pending.who, o); cf.elements.code.value = ""; errs(cf, {}); showCode(true); }
        catch (x) { errs(cf, {}, x.message); }
      });
      on(cf, "submit", async function (e) {
        e.preventDefault(); e.stopPropagation();
        var code = digits(cf.elements.code.value), btn = cf.querySelector("button[type=submit]");
        if (code.length !== 6) { errs(cf, { code: "Enter all 6 digits of the code." }); return; }
        if (btn.disabled || !pending) return;
        errs(cf, {});
        try {
          var r = await busy(btn, "Checking…", function () { return api("/auth/verify", Object.assign({ code: code }, pending.who)); });
          if (flow === "signup" && r.email_pending) {
            swrite("bcc-p2-otp", ""); clearInterval(timer);
            await A().session();
            cf.hidden = true; es.hidden = false; es.dataset.email = r.email_pending; es.dataset.result = JSON.stringify(r);
            try {
              var ec = await api("/profile/email-code", { email: r.email_pending });
              es.querySelector("[data-p2a-email-dest]").innerHTML = "We sent a code to <strong>" + esc(ec.destination) + "</strong>" + (ec.mode === "preview" ? ". Preview: nothing is actually sent." : ".");
              var pv = es.querySelector("[data-p2a-preview]"); pv.hidden = !ec.preview_code; pv.innerHTML = ec.preview_code ? previewText(ec.preview_code, "email") : "";
            } catch (x2) { es.querySelector("[data-p2a-email-dest]").textContent = x2.message; }
            es.elements.code.focus();
            return;
          }
          await finish(root, r);
        } catch (x) {
          var reason = x.data && x.data.reason;
          errs(cf, { code: x.message });
          if (reason === "locked" || reason === "expired") { cf.querySelector("[data-p2a-resend]").hidden = false; if (pending) pending.resend_at = Math.min(pending.resend_at, Date.now() / 1000); }
          cf.elements.code.select(); delete cf.dataset.auto;
        }
      });
    });
    on(es.elements.code, "input", function () { es.elements.code.value = digits(es.elements.code.value).slice(0, 6); });
    on(es, "submit", async function (e) {
      e.preventDefault(); e.stopPropagation();
      var code = digits(es.elements.code.value);
      if (code.length !== 6) { errs(es, { code: "Enter all 6 digits of the code." }); return; }
      try { await busy(es.querySelector("button[type=submit]"), "Checking…", function () { return api("/profile/email-verify", { email: es.dataset.email, code: code }); }); await finish(root, JSON.parse(es.dataset.result || "{}")); }
      catch (x) { errs(es, { code: x.message }); }
    });
    on(es.querySelector("[data-p2a-skip-email]"), "click", function () { finish(root, JSON.parse(es.dataset.result || "{}")); });
  }

  function mountDash(root, signal) {
    var on = function (el, ev, fn) { if (el) el.addEventListener(ev, fn, { signal: signal }); };
    if (root.hasAttribute("data-p2a-sample")) { root.addEventListener("submit", function (e) { if (e.target.closest(".p2a-sec, .p2a-reuse")) e.preventDefault(); }, { signal: signal, capture: true }); return; }
    var say = function (t) { var s = root.querySelector("#ac-status"); if (s) s.textContent = t; };
    function open(slot, focus) { if (!slot) return; slot.hidden = false; var f = slot.querySelector("input:not([type=radio]):not([disabled]), select"); if (focus !== false && f) f.focus(); slot.scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }
    root.addEventListener("click", async function (e) {
      var t = e.target.closest("button"); if (!t || !root.contains(t) || t.disabled) return;
      var d = t.dataset;
      try {
        if (t.hasAttribute("data-p2a-logout")) { t.disabled = true; await api("/logout", {}); go("/account"); A().toast("Signed out of the preview account."); }
        else if (d.p2aOpen) { open(root.querySelector('[data-p2a-slot="' + d.p2aOpen + '"]')); if (t.closest(".is-new")) t.closest(".is-new").hidden = true; }
        else if (t.hasAttribute("data-p2a-close")) { var sl = t.closest("[data-p2a-slot], [data-p2a-email-code-form]"); sl.hidden = true; var nw = root.querySelector(".is-new"); if (nw) nw.hidden = false; }
        else if (t.hasAttribute("data-p2a-edit")) open(t.closest("[data-p2a-addr-item]").querySelector("[data-p2a-slot]"));
        else if (d.p2aAddrDefault) { t.disabled = true; await api("/addresses/" + d.p2aAddrDefault + "/default", {}); await refresh(); A().toast("Default address updated."); }
        else if (d.p2aCardDefault) { t.disabled = true; await api("/cards/" + d.p2aCardDefault + "/default", {}); await refresh(); A().toast("Default card updated."); }
        else if (d.p2aAddrDelete || d.p2aCardDelete) {
          if (t.getAttribute("data-confirm") !== "1") { t.setAttribute("data-confirm", "1"); t.textContent = "Confirm remove"; t.classList.add("is-confirm"); say("Select Confirm remove to delete it."); return; }
          t.disabled = true; await api((d.p2aAddrDelete ? "/addresses/" + d.p2aAddrDelete : "/cards/" + d.p2aCardDelete) + "/delete", {}); await refresh(); A().toast(d.p2aAddrDelete ? "Address removed." : "Card removed.");
        } else if (t.hasAttribute("data-p2a-email-confirm")) {
          var ef = root.querySelector("[data-p2a-email-code-form]");
          var r = await busy(t, "Sending…", function () { return api("/profile/email-code", { email: (root.querySelector('[name="email"]') || {}).value || "" }); });
          ef.hidden = false; ef.dataset.email = root.querySelector('[name="email"]').value;
          ef.querySelector("[data-p2a-dest]").innerHTML = "Code sent to <strong>" + esc(r.destination) + "</strong>" + (r.mode === "preview" ? ". Preview: nothing is actually sent." : ".");
          var pv = ef.querySelector("[data-p2a-preview]"); pv.hidden = !r.preview_code; pv.innerHTML = r.preview_code ? previewText(r.preview_code, "email") : "";
          ef.elements.code.focus();
        }
      } catch (x) { t.disabled = false; A().toast(x.message); }
    }, { signal: signal });
    root.querySelectorAll("[data-p2a-reveal]").forEach(function (b) { on(b, "click", function () { var i = b.parentNode.querySelector("input"), show = i.type === "password"; i.type = show ? "text" : "password"; b.textContent = show ? "Hide" : "Show"; b.setAttribute("aria-pressed", String(show)); }); });
    root.querySelectorAll("[data-p2a-meter]").forEach(function (m) { var i = m.parentNode.querySelector('input[name="password"]'); on(i, "input", function () { m.dataset.level = strength(i.value); }); });
    // Addresses: the label chooser shows the name field for Other.
    root.querySelectorAll("[data-p2a-address]").forEach(function (f) {
      f.querySelectorAll("input[name=label]").forEach(function (r) { on(r, "change", function () { var o = f.querySelector(".p2a-labelname"); o.hidden = f.elements.label.value !== "other"; if (!o.hidden) o.querySelector("input").focus(); }); });
      ["mobile", "pincode"].forEach(function (n) { on(f.elements[n], "input", function () { f.elements[n].value = digits(f.elements[n].value).slice(0, n === "pincode" ? 6 : 10); }); });
      on(f, "submit", async function (e) {
        e.preventDefault(); e.stopPropagation();
        var v = function (n) { return (f.elements[n] && f.elements[n].value || "").trim(); }, data = { label: v("label") || "home", label_name: v("label_name"), name: v("name"), mobile: v("mobile"), address: v("address"), landmark: v("landmark"), city: v("city"), state: v("state"), pincode: v("pincode"), "default": f.elements["default"].checked }, bad = {};
        if (f.dataset.p2aAddress) data.id = f.dataset.p2aAddress;
        if (data.label === "other" && !data.label_name) bad.label_name = "Name this address, for example Parents or Gym.";
        if (data.name.length < 2) bad.name = "Enter the full name.";
        if ((data.mobile || emailOnly()) && !/^[6-9]\d{9}$/.test(data.mobile)) bad.mobile = emailOnly() ? "Enter a 10-digit mobile number for the courier." : "Enter a 10-digit mobile number, or leave it blank.";
        if (data.address.length < 5) bad.address = "Enter the house or flat, street and area.";
        if (data.address.length < 2) bad.address = "Enter the house or flat, street and area.";
        if (!/^[1-9]\d{5}$/.test(data.pincode)) bad.pincode = "Enter a 6-digit pincode that doesn’t start with 0.";
        if (data.city.length < 2) bad.city = "Enter the city or town.";
        if (!data.state) bad.state = "Choose a state.";
        if (errs(f, bad)) return;
        try { await busy(f.querySelector("button[type=submit]"), "Saving…", function () { return api("/addresses", data); }); await refresh(); A().toast("Address saved."); }
        catch (x) { fromError(f, x); }
      });
    });
    // Cards: the number is formatted and checked here and never sent; only its last four digits and network are.
    var cf = root.querySelector("[data-p2a-card]");
    if (cf) {
      var live = cf.querySelector("[data-p2a-cardlive]"), set = function (sel, t) { live.querySelector(sel).textContent = t; };
      on(cf.elements.cardnumber, "input", function () {
        var d = digits(cf.elements.cardnumber.value).slice(0, 19), net = network(d), groups = net === "amex" ? [4, 6, 5] : [4, 4, 4, 4, 3], out = [], i = 0;
        groups.forEach(function (g) { if (i < d.length) { out.push(d.slice(i, i + g)); i += g; } });
        cf.elements.cardnumber.value = out.join(" ");
        set("[data-p2a-cl-net]", net ? NETWORKS[net] : "Card"); set("[data-p2a-cl-num]", d ? "•••• •••• •••• " + (d.length >= 4 ? d.slice(-4) : "••••") : "•••• •••• •••• ••••");
        live.dataset.net = net;
      });
      on(cf.elements.expiry, "input", function (e) { var d = digits(cf.elements.expiry.value).slice(0, 4); if (d.length === 1 && +d > 1) d = "0" + d; cf.elements.expiry.value = d.length > 2 || (d.length === 2 && e.inputType !== "deleteContentBackward") ? d.slice(0, 2) + "/" + d.slice(2) : d; set("[data-p2a-cl-exp]", cf.elements.expiry.value || "MM/YY"); });
      on(cf.elements.ccname, "input", function () { set("[data-p2a-cl-name]", cf.elements.ccname.value || "Name on card"); });
      on(cf, "submit", async function (e) {
        e.preventDefault(); e.stopPropagation();
        var d = digits(cf.elements.cardnumber.value), net = network(d), ex = digits(cf.elements.expiry.value), mm = +ex.slice(0, 2), yy = 2000 + +ex.slice(2, 4), bad = {};
        var now = new Date();
        if (d.length < 12 || !luhn(d)) bad.number = "Check the card number.";
        else if (!net) bad.number = "We accept Visa, Mastercard, RuPay, American Express and Diners Club.";
        if (ex.length !== 4 || mm < 1 || mm > 12 || yy < now.getFullYear() || (yy === now.getFullYear() && mm < now.getMonth() + 1)) bad.expiry = "Enter a valid expiry date (MM/YY) that hasn’t passed.";
        if (cf.elements.ccname.value.trim().length < 2) bad.name = "Enter the name on the card.";
        if (errs(cf, bad)) return;
        var data = { network: net, kind: cf.elements.kind.value, last4: d.slice(-4), exp_month: mm, exp_year: yy, name: cf.elements.ccname.value.trim(), nickname: cf.elements.nickname.value.trim(), "default": cf.elements["default"].checked };
        cf.elements.cardnumber.value = "•••• •••• •••• " + data.last4; d = "";
        try { await busy(cf.querySelector("button[type=submit]"), "Saving…", function () { return api("/cards", data); }); await refresh(); A().toast("Card ending " + data.last4 + " saved."); }
        catch (x) { cf.elements.cardnumber.value = ""; fromError(cf, x); }
      });
    }
    var pf = root.querySelector("[data-p2a-profile]"), ef = root.querySelector("[data-p2a-email-code-form]");
    on(pf, "submit", async function (e) {
      e.preventDefault(); e.stopPropagation();
      var name = pf.elements.name.value.trim(), email = pf.elements.email.value.trim();
      if (errs(pf, name ? (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? { email: "Enter a valid email address, or leave it blank." } : {}) : { name: "Enter your name." })) return;
      var was = pf.dataset.email || "", change = emailOnly() && !demoCurrent() && email && email.toLowerCase() !== was.toLowerCase();
      if (emailOnly() && !email) { errs(pf, { email: "Enter your email address. You sign in with it." }); return; }
      try {
        await busy(pf.querySelector("button[type=submit]"), "Saving…", function () { return api("/profile", { name: name, email: change ? was : email }); });
        if (change) {
          // Hosted: the new address is confirmed with a code before it replaces the old one.
          var r = await api("/profile/email-code", { email: email });
          ef.hidden = false; ef.dataset.email = email;
          ef.querySelector("[data-p2a-dest]").innerHTML = "To change your email, enter the code we sent to <strong>" + esc(r.destination) + "</strong>.";
          var pv = ef.querySelector("[data-p2a-preview]"); pv.hidden = !r.preview_code; pv.innerHTML = r.preview_code ? previewText(r.preview_code, "email") : "";
          ef.elements.code.focus(); A().toast("Name saved. Check your new email for the code."); return;
        }
        await A().session(); await refresh(); A().toast("Profile saved.");
      }
      catch (x) { fromError(pf, x); }
    });
    on(ef, "submit", async function (e) {
      e.preventDefault(); e.stopPropagation();
      var code = digits(ef.elements.code.value);
      if (code.length !== 6) { errs(ef, { code: "Enter all 6 digits of the code." }); return; }
      try { await busy(ef.querySelector("button[type=submit]"), "Checking…", function () { return api("/profile/email-verify", { email: ef.dataset.email, code: code }); }); await A().session(); await refresh(); A().toast("Email confirmed. You can sign in with it now."); }
      catch (x) { errs(ef, { code: x.message }); }
    });
    var pw = root.querySelector("[data-p2a-password]");
    on(pw, "submit", async function (e) {
      e.preventDefault(); e.stopPropagation();
      var v = pw.elements.password.value, bad = {};
      if (pw.elements.current && !pw.elements.current.value && !pw.querySelector("#p2a-pw-current-hint")) bad.current = "Enter your current password.";
      if (strength(v) < 2) bad.password = "Use at least 8 characters, with a letter and a number.";
      if (errs(pw, bad)) return;
      try { await busy(pw.querySelector("button[type=submit]"), "Saving…", function () { return api("/profile/password", { password: v, current: pw.elements.current ? pw.elements.current.value : "" }); }); await refresh(); A().toast("Password saved. You can sign in with it or with a code."); }
      catch (x) { fromError(pw, x); }
    });
  }
  L.onEnhance(function (main, signal) {
    if (!on2()) return;
    var auth = main.querySelector("[data-p2a-auth]"); if (auth) mountAuth(auth, signal);
    var dash = main.querySelector(".p2a-dash"); if (dash) mountDash(dash, signal);
    if (signal) signal.addEventListener("abort", function () { clearInterval(timer); });
  });
})();
