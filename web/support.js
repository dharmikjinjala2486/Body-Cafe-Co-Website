/* Body Café Co. — Help Centre, Contact, Preferences and the five policies for all eight directions (A–H).

   One behaviour and one set of facts (support-content.js), eight looks (support.css, scoped .su-a … .su-h). Replaces
   each theme's `help`, `contact`, `policy` and `settings` renderers; the synthetic design states (?state=…) still use
   the theme's own renderers.

   Real behaviour only: help feedback, contact cases, photo uploads, case replies, preferences and privacy requests
   all go to the server and are confirmed only from its answer. Nothing claims a message was sent (no messaging
   provider is connected), and no channel is shown as available unless support-content.js marks it live. */
(function () {
  "use strict";
  var S = window.BCCSite, C = window.BCCSupportContent;
  if (!S || !S.themes || !C) return;
  var A = function () { return window.BCCApp; };

  function h(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function day(n) { return n ? new Date(n * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""; }
  function when(n) { return n ? new Date(n * 1000).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : ""; }
  function sread(k) { try { return sessionStorage.getItem(k) || ""; } catch (e) { return ""; } }
  function swrite(k, v) { try { if (v) sessionStorage.setItem(k, v); else sessionStorage.removeItem(k); } catch (e) {} }
  function lread(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function isCustomer(u) { return !!(u && String(u.id).indexOf("customer-") === 0); }
  function isStatic() { return !!(A() && A().staticPreview && A().staticPreview()); }
  function article(id) { return C.ARTICLES.filter(function (a) { return a.id === id; })[0]; }
  function category(id) { return C.CATEGORIES.filter(function (c) { return c.id === id; })[0]; }
  function topic(id) { return C.TOPICS.filter(function (t) { return t.id === id; })[0]; }
  function articleHref(a) { return "/help/" + a.cat + "/" + a.id; }
  function pending(text) { return '<span class="su-chip is-open">' + h(text || "Not yet confirmed") + "</span>"; }

  /* ---------------- shared pieces ---------------- */
  function head(v, kicker, title, lede, after) {
    return '<header class="su-head"><p class="su-k">' + h(v.k(kicker)) + '</p><h1 class="su-h1">' + title + "</h1>" + (lede ? '<p class="su-lede">' + lede + "</p>" : "") + (after || "") + "</header>";
  }
  function crumbs(list) {
    return '<nav class="su-crumbs" aria-label="Breadcrumb"><ol>' + list.map(function (c, i) { return "<li>" + (c[1] && i < list.length - 1 ? '<a href="' + c[1] + '">' + h(c[0]) + "</a>" : '<span aria-current="page">' + h(c[0]) + "</span>") + "</li>"; }).join("") + "</ol></nav>";
  }
  function actions(list, cls) {
    return list && list.length ? '<p class="su-actions' + (cls ? " " + cls : "") + '">' + list.map(function (a, i) { return '<a class="' + (i === 0 ? "su-btn" : "su-link") + '" href="' + h(a.href) + '">' + h(a.label) + "</a>"; }).join("") + "</p>" : "";
  }
  function escalate(fromId, kind) {
    var href = "/contact" + (kind ? "?kind=" + kind : "") + (fromId ? (kind ? "&" : "?") + "from=" + fromId : "");
    return '<aside class="su-escalate" aria-labelledby="su-esc-h"><h2 class="su-h3" id="su-esc-h">Still need help?</h2><p>Contact us and we’ll pick it up from here. You get a case reference straight away.</p><a class="su-btn" href="' + href + '">Contact support</a></aside>';
  }

  /* ---------------- search ---------------- */
  function norm(s) { return String(s || "").toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9₹\s]/g, " "); }
  var INDEX = null;
  function index() {
    if (INDEX) return INDEX;
    INDEX = C.ARTICLES.map(function (a) {
      return { type: "Help · " + category(a.cat).title, title: a.title, text: a.answer, href: articleHref(a), hay: norm([a.title, a.answer, a.body.join(" "), a.words].join(" ")), boost: norm(a.title + " " + a.words) };
    });
    Object.keys(C.POLICIES).forEach(function (k) {
      var p = C.POLICIES[k];
      p.sections.forEach(function (s) {
        var body = (s.p || []).concat(s.list || []).join(" ");
        INDEX.push({ type: "Policy · " + p.title, title: s.h, text: body.slice(0, 180) + (body.length > 180 ? "…" : ""), href: p.path + "#" + s.id, hay: norm(p.title + " " + s.h + " " + body), boost: norm(p.title + " " + s.h) });
      });
    });
    return INDEX;
  }
  function search(q) {
    var words = norm(q).split(/\s+/).filter(function (w) { return w.length > 1; });
    if (!words.length) return [];
    return index().map(function (e) {
      var score = 0, all = true;
      words.forEach(function (w) {
        var stem = w.length > 4 ? w.replace(/(ing|ed|es|s)$/, "") : w;
        var inHay = e.hay.indexOf(stem) >= 0;
        if (!inHay) all = false;
        score += (inHay ? 1 : 0) + (e.boost.indexOf(stem) >= 0 ? 2 : 0);
      });
      return { e: e, score: score + (all ? 3 : 0) };
    }).filter(function (r) { return r.score > 0; }).sort(function (a, b) { return b.score - a.score; }).slice(0, 8).map(function (r) { return r.e; });
  }
  function resultsHTML(q) {
    if (!q) return "";
    var r = search(q);
    if (!r.length) return '<div class="su-results-empty"><p><strong>No results for “' + h(q) + '”.</strong> Try a simpler word, such as “refund”, “delivery” or “cancel”, or browse the topics below.</p><a class="su-link" href="/contact">Ask us instead</a></div>';
    return '<p class="su-small">' + r.length + " result" + (r.length === 1 ? "" : "s") + " for “" + h(q) + '”</p><ul class="su-results-list">' + r.map(function (e) {
      return '<li><a href="' + h(e.href) + '"><span class="su-res-type">' + h(e.type) + "</span><strong>" + h(e.title) + "</strong><span>" + h(e.text) + "</span></a></li>";
    }).join("") + "</ul>";
  }

  /* ---------------- help ---------------- */
  var QUICK = [
    { label: "Track an order", text: "See where your order is.", href: "/account/orders" },
    { label: "Report an issue", text: "Damaged, wrong, missing or late.", href: "/help/returns/something-wrong" },
    { label: "Request cancellation", text: "Cancel before dispatch.", href: "/help/orders/cancel-order" },
    { label: "Contact support", text: "Open a case with us.", href: "/contact" },
  ];
  var POPULAR = ["track-order", "cancel-order", "something-wrong", "refund-status", "delivery-charges", "payment-unclear"];
  function feedback(id) {
    var done = sread("bcc-help-fb-" + id);
    if (isStatic()) return '<div class="su-fb" data-su-fb="' + h(id) + '"><p class="su-small">Answer feedback isn’t collected on this shared preview.</p></div>';
    return '<div class="su-fb" data-su-fb="' + h(id) + '"' + (done ? ' data-done="' + h(done) + '"' : "") + '>' + (done ? fbThanks(done, id) :
      '<fieldset class="su-fb-q"><legend>Did this answer your question?</legend><div class="su-row"><button type="button" class="su-pill" data-su-fb-yes>Yes</button><button type="button" class="su-pill" data-su-fb-no>No</button></div></fieldset>') +
      '<p class="su-small" role="status" data-su-fb-status></p></div>';
  }
  function fbThanks(done, id) {
    return done === "yes" ? '<p class="su-fb-done">Thanks — glad that helped.</p>' :
      '<p class="su-fb-done">Thanks for telling us. <a href="/contact?from=' + h(id) + '">Contact support</a> and we’ll help directly.</p>';
  }
  function fbReasons() {
    return '<fieldset class="su-fb-why"><legend>What was missing? (optional)</legend>' + [["unclear", "It was unclear"], ["incomplete", "It didn’t go far enough"], ["not_my_question", "It wasn’t my question"], ["outdated", "It looks out of date"]].map(function (r) {
      return '<label class="su-check"><input type="radio" name="su-fb-reason" value="' + r[0] + '"> ' + r[1] + "</label>";
    }).join("") + '<button type="button" class="su-btn su-btn-sm" data-su-fb-send>Send</button></fieldset>';
  }
  function faqItem(a) {
    return '<details class="su-faq" id="faq-' + h(a.id) + '"><summary><span>' + h(a.title) + '</span><span class="su-plus" aria-hidden="true"></span></summary><div class="su-faq-body"><p>' + h(a.answer) + "</p>" + actions(a.actions) +
      '<p><a class="su-link" href="' + articleHref(a) + '">Read the full answer</a></p>' + feedback(a.id) + "</div></details>";
  }
  function helpHub(v) {
    var q = new URL(location.href).searchParams.get("q") || "";
    return '<div class="su su-' + v.key + '" data-su data-su-page="help">' +
      head(v, "Help Centre", "How can we help?", "Answers about orders, delivery, returns and your account. Everything here is readable without signing in.",
        '<form class="su-search" role="search" data-su-search action="/help"><label for="su-q">Search help and policies</label><div class="su-search-row"><input id="su-q" name="q" type="search" value="' + h(q) + '" autocomplete="off" placeholder="For example: refund, cancel, pincode" aria-describedby="su-q-hint"><button type="submit" class="su-btn">Search</button></div><p class="su-small" id="su-q-hint">Searches every help answer and policy.</p></form>') +
      '<div class="su-wrap"><div class="su-results" data-su-results aria-live="polite">' + resultsHTML(q) + "</div>" +
      '<section aria-labelledby="su-quick-h"><h2 class="su-h2" id="su-quick-h">Quick actions</h2><ul class="su-quick">' + QUICK.map(function (x) { return '<li><a href="' + x.href + '"><strong>' + h(x.label) + "</strong><span>" + h(x.text) + "</span></a></li>"; }).join("") + "</ul></section>" +
      '<section aria-labelledby="su-cat-h"><h2 class="su-h2" id="su-cat-h">Browse by topic</h2><ul class="su-cats">' + C.CATEGORIES.map(function (c) {
        var n = C.ARTICLES.filter(function (a) { return a.cat === c.id; }).length;
        return '<li><a href="/help/' + c.id + '"><strong>' + h(c.title) + "</strong><span>" + h(c.blurb) + '</span><small>' + n + " answer" + (n === 1 ? "" : "s") + "</small></a></li>";
      }).join("") + "</ul></section>" +
      '<section aria-labelledby="su-faq-h"><h2 class="su-h2" id="su-faq-h">Common questions</h2><div class="su-faqs">' + POPULAR.map(function (id) { return faqItem(article(id)); }).join("") + "</div></section>" +
      '<section aria-labelledby="su-pol-h"><h2 class="su-h2" id="su-pol-h">Policies</h2><ul class="su-pol-list">' + Object.keys(C.POLICIES).map(function (k) { var p = C.POLICIES[k]; return '<li><a href="' + p.path + '">' + h(p.title) + "</a></li>"; }).join("") + "</ul></section>" +
      escalate("", "") + "</div></div>";
  }
  function helpCategory(v, c) {
    var list = C.ARTICLES.filter(function (a) { return a.cat === c.id; });
    return '<div class="su su-' + v.key + '" data-su data-su-page="help">' + head(v, "Help Centre", h(c.title), h(c.blurb), crumbs([["Help Centre", "/help"], [c.title]])) +
      '<div class="su-wrap"><ul class="su-article-list">' + list.map(function (a) { return '<li><a href="' + articleHref(a) + '"><strong>' + h(a.title) + "</strong><span>" + h(a.answer) + "</span></a></li>"; }).join("") + "</ul>" +
      '<nav class="su-cat-nav" aria-label="Other topics"><h2 class="su-h3">Other topics</h2><ul>' + C.CATEGORIES.filter(function (x) { return x.id !== c.id; }).map(function (x) { return '<li><a href="/help/' + x.id + '">' + h(x.title) + "</a></li>"; }).join("") + "</ul></nav>" + escalate("", "") + "</div></div>";
  }
  var CAT_KIND = { orders: "general", delivery: "delivery", returns: "issue", payments: "payment", account: "account", products: "product", reports: "report" };
  function helpArticle(v, a) {
    var c = category(a.cat), related = C.ARTICLES.filter(function (x) { return x.cat === a.cat && x.id !== a.id; }).slice(0, 4);
    return '<div class="su su-' + v.key + '" data-su data-su-page="help">' + head(v, "Help · " + c.title, h(a.title), "", crumbs([["Help Centre", "/help"], [c.title, "/help/" + c.id], [a.title]])) +
      '<div class="su-wrap su-article"><div class="su-article-main"><p class="su-answer">' + h(a.answer) + "</p>" + a.body.map(function (p) { return "<p>" + h(p) + "</p>"; }).join("") + actions(a.actions) + feedback(a.id) + "</div>" +
      '<aside class="su-article-side">' + (related.length ? '<h2 class="su-h3">Related</h2><ul class="su-related">' + related.map(function (x) { return '<li><a href="' + articleHref(x) + '">' + h(x.title) + "</a></li>"; }).join("") + "</ul>" : "") + "</aside></div>" +
      '<div class="su-wrap">' + escalate(a.id, CAT_KIND[a.cat]) + "</div></div>";
  }
  function helpPage(v) {
    var parts = location.pathname.split("/").filter(Boolean); // help, cat, article
    if (parts.length === 1) return helpHub(v);
    var c = category(parts[1]);
    if (c && parts.length === 2) return helpCategory(v, c);
    var a = article(parts[2]);
    if (c && a && a.cat === c.id && parts.length === 3) return helpArticle(v, a);
    return '<div class="su su-' + v.key + '" data-su data-su-page="help">' + head(v, "Help Centre", "We couldn’t find that answer", "It may have moved. Search the Help Centre or browse a topic.") + '<div class="su-wrap">' + actions([{ label: "Help Centre", href: "/help" }, { label: "Contact support", href: "/contact" }]) + "</div></div>";
  }

  /* ---------------- contact ---------------- */
  var CTX_TOPICS = { brand: { id: "brand", label: "About Body Café Co.", kind: "brand" }, learn: { id: "learn", label: "A Learn guide", kind: "learn" } };
  var KIND_TO_TOPIC = { replacement: "issue", "return": "return", delivery: "delivery", cancellation: "cancellation", product: "product", safety: "safety", report: "report", business: "business", general: "general", payment: "payment", account: "account", privacy: "privacy", issue: "issue" };
  function contactContext() {
    var u = new URL(location.href), p = u.searchParams;
    var kind = p.get("kind") || "", from = article(p.get("from") || "");
    var t = CTX_TOPICS[kind] ? kind : KIND_TO_TOPIC[kind] || (from ? CAT_KIND[from.cat] : "") || "";
    return { topic: t, order: (p.get("order") || "").slice(0, 40), pageTopic: (p.get("topic") || "").slice(0, 200), lot: (p.get("lot") || "").slice(0, 120), feedback: p.get("feedback") || "", from: from };
  }
  function channelList() {
    var ch = C.BUSINESS.channels;
    return '<ul class="su-channels">' + Object.keys(ch).map(function (k) {
      var c = ch[k];
      return '<li class="' + (c.live ? "is-live" : "is-off") + '"><strong>' + h(c.label) + "</strong><span>" + h(c.detail) + "</span>" + (c.live ? '<span class="su-chip is-ok">Available</span>' : '<span class="su-chip">Not yet available</span>') + "</li>";
    }).join("") + "</ul>";
  }
  function contactInfo() {
    var B = C.BUSINESS;
    return '<div class="su-contact-info"><section aria-labelledby="su-ch-h"><h2 class="su-h3" id="su-ch-h">Ways to reach us</h2>' + channelList() + "</section>" +
      '<section aria-labelledby="su-hours-h"><h2 class="su-h3" id="su-hours-h">Hours and replies</h2><dl class="su-dl"><div><dt>Support hours</dt><dd>' + (B.hours ? h(B.hours) : pending("To be confirmed")) + '</dd></div><div><dt>Time zone</dt><dd>' + h(B.timezone) + '</dd></div><div><dt>Reply time</dt><dd>' + (B.response ? h(B.response) : pending("To be confirmed")) + ' <small>Product safety concerns are reviewed first.</small></dd></div><div><dt>Where replies appear</dt><dd>On your case page, in this browser or in your account. We can’t send email or SMS replies yet.</dd></div></dl></section>' +
      '<section aria-labelledby="su-biz-h"><h2 class="su-h3" id="su-biz-h">Business details</h2><dl class="su-dl"><div><dt>Brand</dt><dd>' + h(B.brand) + '</dd></div><div><dt>Legal name</dt><dd>' + (B.legalName ? h(B.legalName) : pending("To be confirmed")) + '</dd></div><div><dt>Address</dt><dd>' + (B.address ? h(B.address) : pending("To be confirmed")) + "</dd></div></dl></section>" +
      '<section aria-labelledby="su-gr-h" id="grievances"><h2 class="su-h3" id="su-gr-h">Complaints and grievances</h2><p>Start with a case here. If you’re not satisfied, ask for it to be escalated to our grievance officer.</p><dl class="su-dl"><div><dt>Grievance officer</dt><dd>' + (B.grievanceOfficer ? h(B.grievanceOfficer) : pending("To be confirmed")) + "</dd></div></dl>" +
      '<p class="su-small">You can also contact the National Consumer Helpline: 1915 or 1800-11-4000, or consumerhelpline.gov.in.</p></section></div>';
  }
  function field(id, label, input, hint, err) {
    return '<div class="su-field"><label for="' + id + '">' + label + "</label>" + (hint ? '<span class="su-hint" id="' + id + '-hint">' + hint + "</span>" : "") + input + '<p class="su-err" id="' + id + '-err" hidden></p></div>';
  }
  function contactForm(ctx) {
    var cx = contactContext(), u = A().user(), acct = A().account && A().account(), signed = isCustomer(u);
    var orders = (acct && acct.orders) || [];
    var topics = C.TOPICS.slice();
    if (CTX_TOPICS[cx.topic]) topics.unshift(CTX_TOPICS[cx.topic]);
    var profileName = signed && acct && acct.profile && acct.profile.name && acct.profile.name !== "Customer" ? acct.profile.name : "";
    var aboutLine = cx.from ? "From the help answer “" + h(cx.from.title) + "”." : cx.pageTopic ? "About the page " + h(cx.pageTopic) + (cx.lot ? " · lot " + h(cx.lot) : "") + "." : cx.lot ? "About lot " + h(cx.lot) + "." : "";
    return '<form class="su-form" id="su-contact" data-su-contact novalidate>' +
      (aboutLine ? '<p class="su-context" data-su-context>' + aboutLine + "</p>" : "") +
      field("su-topic", "What’s it about?", '<select id="su-topic" name="topic" required aria-describedby="su-topic-err"><option value="">Choose a topic</option>' + topics.map(function (t) { return '<option value="' + t.id + '"' + (t.id === cx.topic ? " selected" : "") + ">" + h(t.label) + "</option>"; }).join("") + "</select>") +
      '<div class="su-note" data-su-privacy-note hidden><p><strong>Privacy requests are made from your account,</strong> so we know the request comes from you.</p>' + (signed ? '<a class="su-btn" href="/account/profile#privacy">Go to privacy requests</a>' : '<a class="su-btn" href="/sign-in?next=' + encodeURIComponent("/account/profile#privacy") + '">Sign in to continue</a>') + "</div>" +
      '<div class="su-note is-warn" data-su-safety-note hidden><p>If someone needs urgent medical care, contact a doctor or emergency services first. Stop using the product and keep the pack.</p></div>' +
      '<fieldset class="su-fieldset" data-su-body><legend>Your details</legend>' +
      field("su-name", "Name", '<input id="su-name" name="name" autocomplete="name" maxlength="80" value="' + h(profileName) + '" aria-describedby="su-name-err" required>') +
      '<div class="su-two">' + field("su-mobile", "Mobile number" + (signed ? "" : " <small>(or email)</small>"), '<div class="su-phone"><span aria-hidden="true">+91</span><input id="su-mobile" name="mobile" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="10" value="' + h(signed ? u.mobile : "") + '"' + (signed ? " readonly" : "") + ' aria-describedby="su-mobile-hint su-mobile-err"></div>', signed ? "Your verified number." : "10-digit Indian mobile.") +
      field("su-email", "Email <small>(optional)</small>", '<input id="su-email" name="email" type="email" autocomplete="email" maxlength="254" aria-describedby="su-email-err">') + "</div></fieldset>" +
      '<div data-su-order-row>' + field("su-order", "Order reference <small>(optional)</small>", '<input id="su-order" name="order_id" autocomplete="off" maxlength="40" value="' + h(cx.order) + '" list="su-orders" aria-describedby="su-order-hint su-order-err" placeholder="BCC-…">' + (orders.length ? '<datalist id="su-orders">' + orders.map(function (o) { return '<option value="' + h(o.id) + '">' + h(day(o.created)) + "</option>"; }).join("") + "</datalist>" : ""), "From your order confirmation or Your account.") + "</div>" +
      field("su-message", "Your message", '<textarea id="su-message" name="message" rows="6" minlength="10" maxlength="3000" required aria-describedby="su-message-hint su-message-err"></textarea>', "Tell us what happened. Please don’t include card or bank details, or medical records.") +
      '<div data-su-photo-row>' + field("su-photos", "Photos <small>(optional, up to 2)</small>", '<input id="su-photos" name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple aria-describedby="su-photos-hint su-photos-err"><ul class="su-files" data-su-files></ul>', "JPEG, PNG or WebP, 5 MB each. Location and camera details are removed before saving.") + "</div>" +
      '<input type="hidden" name="page_topic" value="' + h(cx.pageTopic || (cx.from ? articleHref(cx.from) : "")) + '"><input type="hidden" name="lot" value="' + h(cx.lot) + '"><input type="hidden" name="feedback" value="' + h(cx.feedback) + '">' +
      '<p class="su-small">We use these details only to handle this case. See <a href="/policies/privacy">Privacy</a>. This form doesn’t sign you up for anything.</p>' +
      '<div class="su-form-error" role="alert" data-su-form-error hidden></div>' +
      '<button type="submit" class="su-btn su-btn-lg" data-su-submit>Send to support</button>' +
      (signed ? "" : '<p class="su-small">You don’t need an account. <a href="/sign-in?next=/contact">Sign in</a> if you’d like the case kept with your orders; what you’ve typed is kept.</p>') +
      "</form><div class=\"su-done\" data-su-done tabindex=\"-1\" hidden></div>";
  }
  function contactPage(v, ctx) {
    var body = isStatic() ? '<div class="su-note"><p><strong>The contact form works in the local preview only.</strong> On this shared preview no case can be opened.</p><a class="su-link" href="/help">Browse the Help Centre</a></div>' : contactForm(ctx);
    return '<div class="su su-' + v.key + '" data-su data-su-page="contact">' + head(v, "Contact", "Contact support", "Tell us what you need and we’ll open a case. Order problems, product questions, safety concerns and business enquiries each go to the right place.") +
      '<div class="su-wrap su-contact-grid"><div class="su-contact-main">' + body + "</div>" + contactInfo() + "</div></div>";
  }
  function doneHTML(c) {
    var safety = c.kind === "safety";
    return '<h2 class="su-h2">Case ' + h(c.id) + " received</h2><p>" + (safety ? "It’s marked as a product safety concern and will be reviewed first." : "It’s with our " + h(c.queue || "support") + " team.") + "</p>" +
      '<dl class="su-dl"><div><dt>Reference</dt><dd><strong>' + h(c.id) + '</strong></dd></div><div><dt>Status</dt><dd>Open</dd></div><div><dt>Reply time</dt><dd>' + (C.BUSINESS.response ? h(C.BUSINESS.response) : safety ? "Priority review" : "To be confirmed") + "</dd></div></dl>" +
      "<p>Replies appear on the case page. We can’t send email or SMS updates yet, so keep the reference or sign in to see it in your account.</p>" +
      actions([{ label: "Follow this case", href: "/account/support/" + c.id }, { label: "Back to Help Centre", href: "/help" }]);
  }

  /* ---------------- case page (inside Account › Support) ---------------- */
  var CASE_STATE = { open: "Open", investigating: "Investigating", escalated: "Escalated", resolved: "Resolved", customer_reply: "You added information" };
  function caseDetail(v, c, signed) {
    if (!c) return '<div class="su-case"><p>We couldn’t find that case in this ' + (signed ? "account" : "browser session") + '. <a href="/account/support">See your cases</a>.</p></div>';
    var hist = c.history || [];
    return '<article class="su-case" data-su-case="' + h(c.id) + '"><p class="su-k">' + h(c.id) + " · " + h(c.queue || "Support") + '</p><h2 class="su-h2">' + h(c.subject || c.queue || "Support case") + "</h2>" +
      '<p><span class="su-chip' + (c.state === "resolved" ? " is-ok" : c.kind === "safety" ? " is-warn" : "") + '">' + h(CASE_STATE[c.state] || c.state) + "</span>" + (c.order_id ? ' <a class="su-link" href="/orders/' + h(c.order_id) + '">Order ' + h(c.order_id) + "</a>" : "") + "</p>" +
      '<div class="su-case-msg"><p class="su-small">Your message</p><p>' + h(c.message) + "</p>" + (c.media && c.media.length ? '<p class="su-small">' + c.media.length + " photo" + (c.media.length === 1 ? "" : "s") + " attached</p>" : "") +
      (c.request && c.request.type === "return" ? '<p class="su-small">Asked for: ' + h({ refund: "a refund", replacement: "a replacement", either: "a refund or replacement" }[c.request.remedy] || "") + " · " + c.request.items.map(function (i) { return h(i.name) + " × " + i.quantity; }).join(", ") + "</p>" : "") + "</div>" +
      '<h3 class="su-h3">Progress</h3><ol class="su-timeline">' + hist.map(function (x) {
        return "<li><strong>" + h(CASE_STATE[x.state] || x.state) + "</strong> <span class=\"su-small\">" + h(when(x.at)) + "</span>" + (x.message ? "<p>" + h(x.message) + "</p>" : "") + (x.note ? '<p class="su-answer-note">' + (x.from ? "<span>" + h(x.from) + ":</span> " : "") + h(x.note) + "</p>" : "") + "</li>";
      }).join("") + "</ol>" +
      '<form class="su-form su-reply" data-su-reply="' + h(c.id) + '" novalidate>' + field("su-reply", c.state === "resolved" ? "Need more help? Reply to reopen" : "Add information", '<textarea id="su-reply" name="message" rows="3" maxlength="3000" aria-describedby="su-reply-err"></textarea>') +
      '<button type="submit" class="su-btn">Send</button><p class="su-small" role="status" data-su-reply-status></p></form></article>';
  }

  /* ---------------- policies ---------------- */
  function policyPage(v, kind) {
    var p = C.POLICIES[kind];
    if (!p) return null;
    var D = C.DOCS;
    return '<div class="su su-' + v.key + ' su-policy" data-su data-su-page="policy">' +
      head(v, "Policies", h(p.title), "", '<p class="su-meta"><span>' + h(D.version) + "</span><span>Last updated " + h(new Date(D.updated).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })) + '</span><span class="su-chip is-open">' + h(D.status) + "</span></p>") +
      '<div class="su-wrap su-policy-grid"><nav class="su-toc" aria-label="On this page"><h2 class="su-h3">On this page</h2><ol><li><a href="#summary">In short</a></li>' + p.sections.map(function (s) { return '<li><a href="#' + s.id + '">' + h(s.h) + "</a></li>"; }).join("") + "</ol>" +
      '<h2 class="su-h3">Other policies</h2><ul>' + Object.keys(C.POLICIES).filter(function (k) { return k !== kind; }).map(function (k) { return '<li><a href="' + C.POLICIES[k].path + '">' + h(C.POLICIES[k].title) + "</a></li>"; }).join("") + '<li><a href="/settings">Preferences</a></li></ul><button type="button" class="su-link su-print" data-su-print>Print this page</button></nav>' +
      '<div class="su-policy-body"><section class="su-summary" id="summary" aria-labelledby="summary-h"><h2 class="su-h2" id="summary-h">In short</h2><ul>' + p.summary.map(function (x) { return "<li>" + h(x) + "</li>"; }).join("") + "</ul>" + actions(p.actions) + "</section>" +
      p.sections.map(function (s) {
        return '<section class="su-sec" id="' + s.id + '" aria-labelledby="' + s.id + '-h"><h2 class="su-h2" id="' + s.id + '-h">' + h(s.h) + ' <a class="su-anchor" href="#' + s.id + '" aria-label="Link to ' + h(s.h) + '">#</a></h2>' + (s.open ? "<p>" + pending() + "</p>" : "") +
          (s.p || []).map(function (x) { return "<p>" + h(x) + "</p>"; }).join("") + (s.list ? "<ul>" + s.list.map(function (x) { return "<li>" + h(x) + "</li>"; }).join("") + "</ul>" : "") + "</section>";
      }).join("") + escalate("", kind === "privacy" ? "privacy" : kind === "returns" ? "return" : kind === "cancellation" ? "cancellation" : kind === "shipping" ? "delivery" : "") + "</div></div></div>";
  }

  /* ---------------- preferences ---------------- */
  function browserPrefs() { try { return JSON.parse(lread("bcc-preferences") || "{}"); } catch (e) { return {}; } }
  function prefsBody(ctx, opts) {
    var u = A().user(), signed = isCustomer(u), acct = A().account && A().account();
    var bp = browserPrefs(), ap = (acct && acct.profile && acct.profile.prefs) || {}, motion = lread("bcc-motion") === "reduce";
    var embedded = opts && opts.embedded, H = embedded ? "su-h3" : "su-h2";
    return '<div class="su-prefs" data-su-prefs>' +
      '<section class="su-pref" aria-labelledby="pf-nec"><h2 class="' + H + '" id="pf-nec">Necessary</h2><p><span class="su-chip is-ok">Always on</span></p><p>A session cookie keeps you signed in and protects forms; your browser stores your bag, saved items, drafts and these choices. The site doesn’t work without them, so there’s no switch.</p></section>' +
      '<form class="su-pref" data-su-pref-browser novalidate aria-labelledby="pf-br"><h2 class="' + H + '" id="pf-br">This browser</h2><p class="su-small">Saved in this browser only. No account needed.</p>' +
      '<label class="su-switch"><input type="checkbox" name="analytics"' + (bp.analytics === true ? " checked" : "") + '><span><strong>Optional analytics</strong><small>Records the names of pages and actions you use on this site, so we can see what’s used. Nothing is sent to other companies. Off unless you turn it on.</small></span></label>' +
      '<label class="su-switch"><input type="checkbox" name="motion"' + (motion ? " checked" : "") + '><span><strong>Reduce motion</strong><small>Turns off animations and moving scenes on this site. Your device’s own reduced-motion setting always applies too.</small></span></label>' +
      '<p class="su-small"><strong>Language:</strong> English is the only language available.</p><button type="submit" class="su-btn">Save browser choices</button><p class="su-small" role="status" data-su-pref-status></p></form>' +
      '<section class="su-pref" aria-labelledby="pf-ads"><h2 class="' + H + '" id="pf-ads">Advertising and personalisation</h2><p><span class="su-chip">Not used</span></p><p>We don’t use advertising, personalisation or third-party tracking technologies, so there’s nothing to switch on or off.</p></section>' +
      (signed ? '<form class="su-pref" data-su-pref-account novalidate aria-labelledby="pf-mk"><h2 class="' + H + '" id="pf-mk">Marketing messages</h2><p class="su-small">Saved to your account (+91 ••••••' + h(String(u.mobile).slice(-4)) + ").</p>" +
        '<label class="su-switch"><input type="checkbox" name="email"' + (ap.email ? " checked" : "") + '><span><strong>Email</strong><small>New products and guides. Needs an email address on your profile.</small></span></label>' +
        '<label class="su-switch"><input type="checkbox" name="whatsapp"' + (ap.whatsapp ? " checked" : "") + '><span><strong>WhatsApp</strong><small>New products and guides.</small></span></label>' +
        '<p class="su-small">Marketing SMS isn’t offered. Order and service messages — about an order you place, a case you open or a safety notice — aren’t marketing and aren’t affected. In this preview no messages are sent at all.</p><button type="submit" class="su-btn">Save marketing choices</button><p class="su-small" role="status" data-su-pref-acct-status></p></form>'
        : '<section class="su-pref" aria-labelledby="pf-mk"><h2 class="' + H + '" id="pf-mk">Marketing messages</h2><p>Email and WhatsApp marketing choices belong to your account, so we ask you to sign in first. They’re off unless you turn them on.</p><a class="su-btn" href="/sign-in?next=' + encodeURIComponent("/account/preferences") + '">Sign in to manage</a></section>') +
      "</div>";
  }
  function settingsPage(v, ctx) {
    return '<div class="su su-' + v.key + '" data-su data-su-page="settings">' + head(v, "Preferences", "Privacy & communication preferences", "What’s always on, what’s optional, and your current choices. Change them any time.") +
      '<div class="su-wrap su-narrow">' + prefsBody(ctx) + '<p class="su-small">More in <a href="/policies/privacy#tracking">Privacy</a>.</p></div></div>';
  }

  /* ---------------- theme overrides ---------------- */
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
    next.help = function (ctx) { return helpPage(V[d], ctx); };
    next.contact = function (ctx, fx) { return fx && base.contact ? base.contact(ctx, fx) : contactPage(V[d], ctx); };
    next.policy = function (ctx, kind) { return policyPage(V[d], kind) || (base.policy ? base.policy(ctx, kind) : null); };
    next.settings = function (ctx) { return settingsPage(V[d], ctx); };
    S.themes[d] = next;
  });

  /* ---------------- behaviour ---------------- */
  var cleanup = function () {};
  function setErr(form, name, msg) {
    var el = form.querySelector("#su-" + name + "-err") || form.querySelector('[id$="-' + name + '-err"]');
    var input = form.elements[name] || form.querySelector("#su-" + name);
    if (el) { el.textContent = msg || ""; el.hidden = !msg; }
    if (input && input.setAttribute) { if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid"); }
  }
  async function uploadPhoto(file) {
    if (file.size > 5 * 1024 * 1024) throw new Error(file.name + " is larger than 5 MB.");
    var res = await fetch("/api/case-media", { method: "POST", headers: { "Content-Type": file.type || "application/octet-stream", "X-CSRF-Token": A().csrf() }, body: file });
    var out = {};
    try { out = await res.json(); } catch (e) {}
    if (!res.ok) throw new Error(out.error || "That photo couldn’t be uploaded.");
    return out.id;
  }
  function draftKey() { return "bcc-case-draft"; }

  function wireContact(on, root) {
    var f = root.querySelector("[data-su-contact]");
    if (!f) return;
    var done = root.querySelector("[data-su-done]"), formErr = f.querySelector("[data-su-form-error]"), btn = f.querySelector("[data-su-submit]");
    var files = [];
    function topicMeta() { var id = f.elements.topic.value; return topic(id) || CTX_TOPICS[id] || null; }
    function sync() {
      var t = topicMeta(), priv = t && t.id === "privacy";
      f.querySelector("[data-su-privacy-note]").hidden = !priv;
      f.querySelector("[data-su-safety-note]").hidden = !(t && t.id === "safety");
      f.querySelector("[data-su-order-row]").hidden = !!(t && !t.order && !f.elements.order_id.value);
      f.querySelector("[data-su-photo-row]").hidden = !(t && ["issue", "safety", "delivery", "return", "product"].indexOf(t.id) >= 0);
      ["[data-su-body]", "[data-su-submit]"].forEach(function (s) { var el = f.querySelector(s); if (el) el.hidden = priv; });
      f.elements.message.closest(".su-field").hidden = priv;
    }
    function renderFiles() {
      var ul = f.querySelector("[data-su-files]");
      ul.innerHTML = files.map(function (x, i) { return "<li>" + h(x.name) + ' <button type="button" class="su-link" data-su-file-remove="' + i + '">Remove<span class="su-sr"> ' + h(x.name) + "</span></button></li>"; }).join("");
    }
    // Draft: survives sign-in, refresh and errors (never the photos).
    var d = {};
    try { d = JSON.parse(sread(draftKey()) || "{}"); } catch (e) {}
    ["name", "email", "order_id", "message"].forEach(function (k) { if (d[k] && f.elements[k] && !f.elements[k].value) f.elements[k].value = d[k]; });
    if (d.mobile && !f.elements.mobile.readOnly && !f.elements.mobile.value) f.elements.mobile.value = d.mobile;
    if (d.topic && !f.elements.topic.value && f.querySelector('option[value="' + d.topic + '"]')) f.elements.topic.value = d.topic;
    sync();
    on(f, "input", function () {
      swrite(draftKey(), JSON.stringify({ topic: f.elements.topic.value, name: f.elements.name.value, mobile: f.elements.mobile.value, email: f.elements.email.value, order_id: f.elements.order_id.value, message: f.elements.message.value }));
    });
    on(f.elements.topic, "change", sync);
    on(f.elements.photos, "change", function () {
      var picked = Array.prototype.slice.call(f.elements.photos.files || []);
      setErr(f, "photos", "");
      picked.forEach(function (x) { if (files.length < 2) files.push(x); });
      if (picked.length + files.length > 2 && files.length === 2) setErr(f, "photos", "You can attach up to two photos.");
      f.elements.photos.value = "";
      renderFiles();
    });
    on(f, "click", function (e) {
      var r = e.target.closest("[data-su-file-remove]");
      if (r) { files.splice(+r.getAttribute("data-su-file-remove"), 1); renderFiles(); f.elements.photos.focus(); }
    });
    on(f, "submit", async function (e) {
      e.preventDefault();
      if (btn.disabled) return;
      ["topic", "name", "mobile", "email", "order_id", "message", "photos"].forEach(function (k) { setErr(f, k === "order_id" ? "order" : k, ""); });
      formErr.hidden = true;
      var t = topicMeta(), msg = f.elements.message.value.trim(), name = f.elements.name.value.trim(), mobile = f.elements.mobile.value.trim(), email = f.elements.email.value.trim();
      var errs = {};
      if (!t) errs.topic = "Choose what it’s about.";
      if (name.length < 2) errs.name = "Enter your name.";
      if (mobile && !/^[6-9][0-9]{9}$/.test(mobile)) errs.mobile = "Enter a 10-digit Indian mobile number.";
      if (!mobile && !email && !isCustomer(A().user())) errs.mobile = "Give a mobile number or an email so we can match replies to you.";
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errs.email = "Enter a valid email address, or leave it blank.";
      if (msg.length < 10) errs.message = "Tell us a little more (at least 10 characters).";
      var keys = Object.keys(errs);
      if (keys.length) {
        keys.forEach(function (k) { setErr(f, k, errs[k]); });
        var first = f.querySelector("#su-" + keys[0]); if (first) first.focus();
        return;
      }
      btn.disabled = true; btn.setAttribute("aria-busy", "true"); var label = btn.textContent; btn.textContent = files.length ? "Uploading photos…" : "Sending…";
      try {
        var media = [];
        for (var i = 0; i < files.length; i++) {
          try { media.push(await uploadPhoto(files[i])); } catch (err) { setErr(f, "photos", err.message); throw { handled: true }; }
        }
        btn.textContent = "Sending…";
        var payload = { kind: t.kind, message: msg, order_id: f.elements.order_id.value.trim(), contact: { name: name, mobile: mobile, email: email } };
        if (media.length) payload.media = media;
        if (f.elements.page_topic.value) payload.topic = f.elements.page_topic.value;
        if (f.elements.lot.value) payload.lot = f.elements.lot.value;
        if (f.elements.feedback.value) payload.feedback = f.elements.feedback.value;
        var c = await A().api("/cases", payload);
        swrite(draftKey(), "");
        if (window.BCCAccount && window.BCCAccount.contactSent) window.BCCAccount.contactSent();
        f.hidden = true;
        done.innerHTML = doneHTML(c); done.hidden = false; done.focus();
        if (A().keepDesignOnLinks) A().keepDesignOnLinks();
      } catch (err) {
        if (!err || !err.handled) {
          var data = (err && err.data) || {}, fields = data.fields || (data.field ? (function () { var o = {}; o[data.field] = err.message; return o; })() : null);
          if (fields) Object.keys(fields).forEach(function (k) { setErr(f, k === "order_id" ? "order" : k === "kind" ? "topic" : k, fields[k]); });
          formErr.textContent = (err instanceof TypeError) || !navigator.onLine ? "You seem to be offline. Your message is still here; try again when you’re connected." : (err && err.message) || "Something went wrong. Your message is still here; please try again.";
          formErr.hidden = false;
        }
        var bad = f.querySelector('[aria-invalid="true"]');
        if (bad) bad.focus(); else if (!formErr.hidden) { formErr.setAttribute("tabindex", "-1"); formErr.focus(); }
      } finally {
        btn.disabled = false; btn.removeAttribute("aria-busy"); btn.textContent = label;
      }
    });
  }

  function wireFeedback(on, root) {
    on(root, "click", async function (e) {
      var box = e.target.closest("[data-su-fb]");
      if (!box) return;
      var id = box.getAttribute("data-su-fb"), status = box.querySelector("[data-su-fb-status]");
      var yes = e.target.closest("[data-su-fb-yes]"), no = e.target.closest("[data-su-fb-no]"), send = e.target.closest("[data-su-fb-send]");
      if (!yes && !no && !send) return;
      if (no && !send) {
        var q = box.querySelector(".su-fb-q"); if (q) q.outerHTML = fbReasons();
        var first = box.querySelector('input[name="su-fb-reason"]'); if (first) first.focus();
        status.textContent = "";
        return;
      }
      var btn = e.target.closest("button"); btn.disabled = true;
      var reasonEl = box.querySelector('input[name="su-fb-reason"]:checked');
      try {
        await A().api("/help/feedback", { article: id, helpful: !!yes, reason: send && reasonEl ? reasonEl.value : undefined });
        swrite("bcc-help-fb-" + id, yes ? "yes" : "no");
        box.innerHTML = fbThanks(yes ? "yes" : "no", id) + '<p class="su-small" role="status" data-su-fb-status>Feedback saved.</p>';
        if (A().keepDesignOnLinks) A().keepDesignOnLinks();
      } catch (err) {
        btn.disabled = false;
        status.textContent = "Your answer wasn’t saved: " + (err.message || "please try again.");
      }
    });
  }

  function wireSearch(on, root) {
    var form = root.querySelector("[data-su-search]");
    if (!form) return;
    var out = root.querySelector("[data-su-results]"), input = form.elements.q, t = 0;
    function run(push) {
      var q = input.value.trim();
      out.innerHTML = resultsHTML(q);
      var u = new URL(location.href);
      if (q) u.searchParams.set("q", q); else u.searchParams.delete("q");
      history.replaceState(history.state, "", u.pathname + u.search + u.hash);
      if (A().routeChanged) A().routeChanged();
      if (A().keepDesignOnLinks) A().keepDesignOnLinks();
      if (push && q) out.setAttribute("tabindex", "-1");
    }
    on(form, "submit", function (e) { e.preventDefault(); run(true); var first = out.querySelector("a"); if (first) first.focus(); });
    on(input, "input", function () { clearTimeout(t); t = setTimeout(function () { run(false); }, 250); });
  }

  function wirePrefs(on, root) {
    var bf = root.querySelector("[data-su-pref-browser]");
    if (bf) on(bf, "submit", function (e) {
      e.preventDefault();
      var st = bf.querySelector("[data-su-pref-status]"), prev = browserPrefs();
      try {
        var next = Object.assign({}, prev, { analytics: bf.elements.analytics.checked });
        localStorage.setItem("bcc-preferences", JSON.stringify(next));
        if (bf.elements.motion.checked) localStorage.setItem("bcc-motion", "reduce"); else localStorage.removeItem("bcc-motion");
        var back = browserPrefs();
        if (back.analytics !== bf.elements.analytics.checked || (lread("bcc-motion") === "reduce") !== bf.elements.motion.checked) throw new Error("not saved");
        if (window.BCCMotion) window.BCCMotion.apply();
        st.textContent = "Saved in this browser. Analytics " + (back.analytics ? "on" : "off") + ", reduce motion " + (bf.elements.motion.checked ? "on" : "off") + ".";
      } catch (err) {
        st.textContent = "Your browser didn’t let us save these choices (storage may be blocked). Nothing was changed.";
      }
    });
    var af = root.querySelector("[data-su-pref-account]");
    if (af) on(af, "submit", async function (e) {
      e.preventDefault();
      var st = af.querySelector("[data-su-pref-acct-status]"), btn = af.querySelector("button[type=submit]");
      btn.disabled = true; st.textContent = "Saving…";
      try {
        var r = await A().api("/preferences", { email: af.elements.email.checked, whatsapp: af.elements.whatsapp.checked });
        var p = (r && r.prefs) || r || {};
        st.textContent = "Saved to your account. Email " + (p.email ? "on" : "off") + ", WhatsApp " + (p.whatsapp ? "on" : "off") + ".";
      } catch (err) {
        st.textContent = "Not saved: " + (err.message || "please try again.") + " Your previous choices still apply.";
      } finally { btn.disabled = false; }
    });
  }

  function wireReply(on, root) {
    var f = root.querySelector("[data-su-reply]");
    if (!f) return;
    on(f, "submit", async function (e) {
      e.preventDefault();
      var id = f.getAttribute("data-su-reply"), st = f.querySelector("[data-su-reply-status]"), btn = f.querySelector("button[type=submit]"), msg = f.elements.message.value.trim();
      setErr(f, "reply", "");
      if (msg.length < 2) { setErr(f, "reply", "Write your message."); f.elements.message.focus(); return; }
      btn.disabled = true; st.textContent = "Sending…";
      try {
        await A().api("/cases/" + id + "/reply", { message: msg });
        await A().rerender();
        A().toast("Added to case " + id + ".");
      } catch (err) {
        btn.disabled = false; st.textContent = "";
        setErr(f, "reply", err.message || "That didn’t send. Your text is still here.");
      }
    });
  }

  function enhance() {
    cleanup();
    var abort = new AbortController(), on = function (el, ev, fn) { if (el) el.addEventListener(ev, fn, { signal: abort.signal }); };
    cleanup = function () { abort.abort(); };
    document.querySelectorAll("[data-su], [data-su-prefs], [data-su-case]").forEach(function (root) {
      wireContact(on, root); wireSearch(on, root); wirePrefs(on, root); wireReply(on, root);
    });
    var sp = document.querySelector("[data-su]");
    if (sp) {
      wireFeedback(on, sp);
      var pr = sp.querySelector("[data-su-print]"); if (pr) on(pr, "click", function () { window.print(); });
    }
    // Section links: scroll to a shared #anchor after render.
    if (location.hash && /^#[a-z0-9-]{1,40}$/.test(location.hash)) {
      var target = document.getElementById(location.hash.slice(1));
      if (target && document.querySelector("[data-su], [data-ac]")) setTimeout(function () { target.scrollIntoView({ block: "start" }); if (target.tagName === "DETAILS") target.open = true; }, 0);
    }
  }

  window.BCCSupport = { enhance: enhance, caseDetail: caseDetail, prefsBody: prefsBody, search: search, uploadPhoto: uploadPhoto, V: V };
})();
