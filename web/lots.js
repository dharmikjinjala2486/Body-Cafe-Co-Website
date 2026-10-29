/* Body Café Co. — Lot reports for all eight directions (A–H).

   One information structure, one set of facts and one behaviour; each direction composes it in its own visual language
   (lots.css, scoped .lt-a … .lt-h). Replaces only each theme's `reports` renderer.

   Shared flow: 1 Introduction · 2 Find your lot report · 3 Where is my lot number? · 4 The matching record ·
   5 Results explained · 6 Source documents and laboratory · 7 Understand this report · 8 Browse published lots ·
   9 Questions or a missing report. Functional model: MATCH → UNDERSTAND → INSPECT.

   Routes: /reports, /reports?product=<id>[&lot=<lot>] and the stable record link /reports/<product>/<lot> (suitable for
   a future packaging QR code). Data: GET /api/lots, GET /api/lots/archive, GET /api/lots/documents/<id>.

   Trust rules carried in code: three separate statuses (document availability, test assessment, batch notice);
   results shown exactly as reported; an assessment only where the record states the specification and its source;
   missing fields read "Not documented"; demonstration records are labelled on every view and in print; a lookup never
   authenticates a pack and a miss is never treated as evidence of counterfeiting. */
(function () {
  "use strict";
  var S = window.BCCSite;
  if (!S || !S.themes) return;

  /* ====================================================================================================
     CONTENT
     ==================================================================================================== */
  var C = {
    title: "Your batch. Its record.",
    lede: "Every pack carries a lot number: the code for the manufacturing batch it came from. Choose your product, enter that number and see the record for your batch, what was tested, and the documents behind it.",
    steps: [["match", "Match", "Confirm the exact product and lot."], ["understand", "Understand", "Read the plain-language summary."], ["inspect", "Inspect", "Check the detailed results and original documents."]],
    numbers: [
      ["Lot number", "The code for the manufacturing batch your pack came from. It's what this page looks up. Often printed near the expiry date and marked “Lot”, “LOT” or “Batch”."],
      ["Order number", "Your purchase reference from us, starting with BCC-. It identifies an order, not a batch."],
      ["Barcode", "The scannable product code under the stripes. It's the same on every pack of a product, so it can't identify a batch."],
      ["SKU", "Our internal code for a product and pack size. Also the same for every batch."],
    ],
    whereStatus: "We don't yet have an approved photograph of where the lot number is printed on each of our packs, so we won't guess. Look for a code marked “Lot” or “Batch”, usually near the expiry date. If you can't find it, ask us and add a photo of the pack.",
    terms: [
      ["lot", "Lot (batch)", "Units made together under the same conditions. A report describes one lot, not the product forever."],
      ["sample", "Sample", "The portion of a lot (or of an ingredient) that was actually tested. Results concern that sample and the tests listed."],
      ["result", "Reported result", "Shown exactly as the laboratory wrote it, with its unit. “<0.05” means below 0.05, the lowest level that test could report, not zero."],
      ["nd", "Not detected (ND) and LOD / LOQ", "“Not detected” means below the test's detection limit (LOD). Results below the quantification limit (LOQ) are often written with “<”."],
      ["spec", "Specification", "The stated limit a result is read against, with where that limit comes from. Without one, a result can't be called a pass."],
      ["assessment", "Assessment", "Whether a result meets its stated specification. Shown only when the report or our approved review states the specification and its source."],
      ["method", "Method", "The named procedure used. Different methods can detect different levels."],
      ["accreditation", "Laboratory accreditation", "An independent body's recognition of a laboratory's competence for specific tests (its scope). It applies to the laboratory and those tests, not to Body Café Co. or our products."],
      ["version", "Version and superseded", "If a report is corrected or replaced, the new version is published and the older one stays listed as superseded, with the reason."],
    ],
    limits: ["A report describes a sample from one lot and the tests listed. It doesn't cover tests that weren't done.", "It doesn't authenticate an individual pack. A lot number can be copied; no QR code or lookup on this page proves a bottle is genuine.", "It isn't a diagnosis, a safety guarantee for every person, or a promise of results."],
    faq: [
      ["Do I need an account to see a report?", "No. Reports are public. You don't need to sign in, give an email address or agree to marketing."],
      ["My lot number doesn't match. Is my pack fake?", "Not necessarily. Most misses are a mistyped character (O and 0, I and 1), the wrong product chosen, or a record that hasn't been published yet. A missing match isn't evidence about your pack. Ask us and include a photo of the pack."],
      ["Is the newest lot the one I'll receive?", "Not necessarily. Orders are sent from released stock with the earliest expiry first, so a new order may come from an earlier lot. Check the lot number on the pack you receive."],
      ["Why does a report say “not assessed”?", "Because we only show “meets” or “does not meet” when the specification and its source are stated. A result without a stated limit is shown as reported, without a verdict."],
      ["Can you tell me when a report is published?", "Not yet. There isn't a notification service connected, so we don't offer alerts. Check the record link again, or ask us."],
      ["What if a batch has a problem?", "If there's a confirmed restriction, withdrawal or instruction for a batch, it appears at the top of that lot's record with the approved instructions and a direct route to Product safety support."],
    ],
  };
  var AVAIL = {
    published: ["Published", "The reviewed record and its source documents are public."],
    under_review: ["Under review", "A record exists for this lot, but it hasn't finished review. That says nothing about whether a test passed or failed."],
    unavailable: ["Not available yet", "There's no published report for this lot yet. That isn't a test result either way."],
    withdrawn: ["Report withdrawn", "This report was withdrawn from publication. The reason is given below. Withdrawing a report is not the same as withdrawing the batch: see the batch notice status."],
  };
  var OVERALL = {
    meets: ["Meets the stated specification", "Every reported result has a stated specification, and each one meets it."],
    does_not_meet: ["Does not meet a stated specification", "At least one result is outside its stated specification. Read the batch notice status and the details below."],
    partly_assessed: ["Partly assessed", "Some results have a stated specification and meet it. The others are reported without a verdict."],
    not_assessed: ["Cannot be assessed", "Results are shown as reported, but no specification is stated for them, so no verdict is given."],
    none: ["Cannot be assessed", "No results are transcribed for this record."],
  };
  var SAMPLE = { finished_product: "Finished product", raw_material: "Raw ingredient", other: "Other specified material" };
  var DOCKIND = { original: "Original document", redacted_copy: "Authorised redacted public copy", amendment: "Amendment from the laboratory" };
  var COVERS = {
    all: "The stated accreditation scope covers all the tests reported here.",
    some: "The stated accreditation scope covers some of the tests reported here, not all. Check the scope.",
    none: "The tests reported here are outside the stated accreditation scope.",
    unknown: "We haven't confirmed whether the accreditation scope covers these tests.",
  };

  /* ====================================================================================================
     HELPERS
     ==================================================================================================== */
  function h(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function day(v) {
    if (!v) return "";
    if (typeof v === "number") { var d = new Date(v * 1000); return d.getDate() + " " + MONTHS[d.getMonth()].slice(0, 3) + " " + d.getFullYear(); }
    var m = String(v).match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
    if (!m) return String(v);
    return (m[3] ? +m[3] + " " : "") + MONTHS[+m[2] - 1] + " " + m[1];
  }
  function nd(v, label) { return v ? h(v) : '<span class="lt-nd">' + (label || "Not documented") + "</span>"; }
  function bytes(n) { return n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB"; }
  function catalog() { return (window.BCCApp && window.BCCApp.catalog && window.BCCApp.catalog()) || []; }
  function prod(id, ctx) { return (ctx ? ctx.catalog : catalog()).filter(function (p) { return p.id === id; })[0]; }
  function design() { return new URL(location.href).searchParams.get("design") || ""; }
  function withDesign(href) { var d = design(); if (!d || !href || href.charAt(0) !== "/") return href; var u = new URL(href, location.origin); u.searchParams.set("design", d); return u.pathname + u.search + u.hash; }
  function recordUrl(pid, lot) { return "/reports/" + encodeURIComponent(pid) + "/" + encodeURIComponent(lot); }
  function askHref(kind, pid, lot) {
    var u = new URL("/contact", location.origin);
    u.searchParams.set("kind", kind);
    u.searchParams.set("topic", pid && lot ? recordUrl(pid, lot) : "/reports");
    if (lot) u.searchParams.set("lot", lot);
    return u.pathname + u.search;
  }
  function chip(cls, label) { return '<span class="lt-chip ' + cls + '">' + label + "</span>"; }

  /* ====================================================================================================
     PAGE
     ==================================================================================================== */
  function state(ctx) {
    var parts = location.pathname.split("/").filter(Boolean), q = ctx.query;
    var pid = parts[1] ? decodeURIComponent(parts[1]) : q.get("product") || "";
    var lot = parts[2] ? decodeURIComponent(parts[2]) : q.get("lot") || "";
    if (!prod(pid, ctx)) pid = "";
    return { pid: pid, lot: lot.slice(0, 60) };
  }
  function form(v, ctx, st) {
    return '<form id="lot-form" class="lt-form" novalidate aria-describedby="lt-form-note">' +
      '<fieldset class="lt-products"><legend>1. Your product</legend><div class="lt-caps">' + ctx.published.map(function (p) {
        return '<label class="lt-cap" style="--lt-dot:' + h(p.color) + '"><input type="radio" name="product" value="' + p.id + '"' + (p.id === st.pid ? " checked" : "") + '><span class="lt-cap-dot" aria-hidden="true"></span><span class="lt-cap-name">' + h(p.name) + "</span></label>";
      }).join("") + '</div><p class="lt-error" id="lt-product-error" hidden></p></fieldset>' +
      '<div class="lt-lotfield"><label for="lt-lot">2. Lot number</label><span class="lt-hint" id="lt-lot-hint">Exactly as printed on the pack. Spaces at either end and letter case don’t matter; every other character does.</span>' +
      '<input id="lt-lot" name="lot" value="' + h(st.lot) + '" maxlength="40" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-describedby="lt-lot-hint lt-lot-error"><p class="lt-error" id="lt-lot-error" hidden></p></div>' +
      '<button type="submit" class="lt-submit"><span>Find the record</span><span aria-hidden="true">→</span></button>' +
      '<p class="lt-note" id="lt-form-note">No account, email or marketing consent needed. This preview has demonstration records only: try <button type="button" class="lt-try" data-lt-try="01">DEMO-0N-01</button> for any product, where N is its place in the collection.</p>' +
      '<details class="lt-samples"><summary>Other demonstration states</summary><div>' + [["DEMO-UNPUBLISHED", "Under review"], ["DEMO-NOTICE", "Batch notice"], ["DEMO-SUPERSEDED", "Version history"], ["DEMO-OUTAGE", "Service unavailable"], ["UNKNOWN-123", "No match"]].map(function (x) {
        return '<button type="button" data-lt-sample="' + x[0] + '">' + x[1] + "</button>";
      }).join("") + "</div></details></form>";
  }
  function where() {
    return '<details class="lt-where" id="where"><summary><span>3. Where is my lot number?</span><span class="lt-plus" aria-hidden="true">+</span></summary><div class="lt-where-in"><p>' + C.whereStatus + '</p><dl class="lt-numbers">' +
      C.numbers.map(function (n) { return "<div><dt>" + n[0] + "</dt><dd>" + n[1] + "</dd></div>"; }).join("") + "</dl></div></details>";
  }
  function understand(v) {
    return '<section class="lt-sec lt-understand" id="understand" aria-labelledby="understand-t"><div class="lt-sec-in"><header class="lt-head"><p class="lt-k">' + v.k(7) + '</p><h2 id="understand-t">Understand this report</h2></header><div class="lt-body">' +
      '<dl class="lt-terms">' + C.terms.map(function (t) { return '<div id="term-' + t[0] + '"><dt>' + t[1] + "</dt><dd>" + t[2] + "</dd></div>"; }).join("") + "</dl>" +
      '<div class="lt-limits"><h3>What a report can’t tell you</h3><ul>' + C.limits.map(function (l) { return "<li>" + l + "</li>"; }).join("") + "</ul></div>" +
      '<p class="lt-more"><a class="lt-link" href="/learn/understanding-reports">Read the guide: understanding reports →</a><a class="lt-link" href="/learn/glossary">Glossary →</a><a class="lt-link" href="/standards#lot">How packs link to lots →</a></p></div></div></section>';
  }
  function archive(v, ctx) {
    return '<section class="lt-sec lt-archive" id="archive" aria-labelledby="archive-t"><div class="lt-sec-in"><header class="lt-head"><p class="lt-k">' + v.k(8) + '</p><h2 id="archive-t">Browse published lots</h2></header><div class="lt-body">' +
      '<p>Every lot with a public record, including older and replaced versions with their current status. The newest lot here isn’t necessarily the one a new order will receive.</p>' +
      '<form class="lt-archive-form" id="lt-archive-form" role="search"><label for="lt-arch-product">Product</label><select id="lt-arch-product" name="product"><option value="">All products</option>' + ctx.published.map(function (p) { return '<option value="' + p.id + '">' + h(p.name) + "</option>"; }).join("") +
      '</select><label for="lt-arch-q">Lot contains</label><input id="lt-arch-q" name="q" type="search" maxlength="40" autocomplete="off" spellcheck="false"><button type="submit">Filter</button></form>' +
      '<p class="lt-arch-count" id="lt-arch-count" role="status" aria-live="polite"></p><div id="lt-arch-list" class="lt-arch-list"></div></div></div></section>';
  }
  function help(v) {
    return '<section class="lt-sec lt-help" id="help" aria-labelledby="help-t"><div class="lt-sec-in"><header class="lt-head"><p class="lt-k">' + v.k(9) + '</p><h2 id="help-t">Questions or a missing report?</h2></header><div class="lt-body">' +
      '<div class="lt-faq">' + C.faq.map(function (f) { return '<details><summary><span>' + f[0] + '</span><span class="lt-plus" aria-hidden="true">+</span></summary><p>' + f[1] + "</p></details>"; }).join("") + "</div>" +
      '<div class="lt-asks" id="lt-asks">' + asks("", "") + "</div></div></div></section>";
  }
  function asks(pid, lot) {
    return '<a class="lt-ask" href="' + askHref("report", pid, lot) + '"><strong>' + (lot ? "Ask about this lot" : "Ask about a lot report") + "</strong><span>A support case" + (lot ? " with the product and lot attached" : "") + ". You can add a photo of the pack.</span></a>" +
      '<a class="lt-ask" href="' + askHref("report", pid, lot) + '"><strong>Request a missing report</strong><span>Tell us which product and lot you’re looking for.</span></a>' +
      '<a class="lt-ask is-safety" href="' + askHref("safety", pid, lot) + '"><strong>Product safety</strong><span>For a concern about a product you have. Flagged for priority review.</span></a>';
  }
  function compose(v, ctx) {
    var st = state(ctx);
    return '<div class="lt lt-' + v.key + '" data-lt data-lt-design="' + v.key + '">' +
      '<header class="lt-hero" id="top"><div class="lt-hero-in"><div class="lt-intro"><p class="lt-kicker">' + v.kicker + '</p><h1 class="lt-h1">' + (v.title || C.title) + '</h1><p class="lt-lede">' + C.lede + "</p>" +
      '<ol class="lt-steps" aria-label="How a record reads">' + C.steps.map(function (s, i) { return '<li><span class="lt-step-n" aria-hidden="true">' + v.step(i + 1) + "</span><strong>" + s[1] + "</strong><span>" + s[2] + "</span></li>"; }).join("") + "</ol></div>" +
      '<div class="lt-find" id="find" aria-labelledby="find-t"><h2 id="find-t" class="lt-find-h">' + v.k(2) + " Find your lot report</h2>" + form(v, ctx, st) + where() + "</div></div></header>" +
      '<section class="lt-sec lt-record" id="record" aria-labelledby="record-t" tabindex="-1"><div class="lt-sec-in"><h2 class="lt-sr" id="record-t">The matching record</h2><p class="lt-sr" id="lt-status" role="status"></p><div id="report-result" class="lt-result">' +
      '<p class="lt-idle">' + (st.lot ? "Looking up the record…" : "Your record will appear here, right below the search. You can also browse every published lot further down.") + "</p></div></div></section>" +
      understand(v) + archive(v, ctx) + help(v) + "</div>";
  }

  /* ====================================================================================================
     RESULT
     ==================================================================================================== */
  function statusTrio(r) {
    var a = AVAIL[r.availability] || AVAIL.unavailable, cur = r.current, o = cur && cur.assessment ? OVERALL[cur.assessment.overall] : OVERALL.none;
    if (!cur) o = ["Cannot be assessed", r.availability === "under_review" ? "Results aren't public while the record is in review." : "No published results for this lot."];
    var notice = r.notices && r.notices.length;
    return '<dl class="lt-trio">' +
      '<div class="lt-st lt-st-doc is-' + r.availability + '"><dt>Document</dt><dd><strong>' + a[0] + (r.partial ? " · in part" : "") + "</strong><span>" + a[1] + "</span></dd></div>" +
      '<div class="lt-st lt-st-test is-' + (cur && cur.assessment ? cur.assessment.overall : "none") + '"><dt>Test assessment</dt><dd><strong>' + o[0] + "</strong><span>" + o[1] + "</span></dd></div>" +
      '<div class="lt-st lt-st-notice is-' + (notice ? "active" : "none") + '"><dt>Batch notice</dt><dd><strong>' + (notice ? r.notices.length + (r.notices.length > 1 ? " confirmed notices" : " confirmed notice") : "No confirmed notice") + "</strong><span>" + (notice ? "Read the instructions above." : "There's no confirmed restriction, withdrawal or instruction for this batch.") + "</span></dd></div></dl>";
  }
  function notices(r) {
    if (!r.notices || !r.notices.length) return "";
    return r.notices.map(function (n) {
      return '<aside class="lt-notice" aria-labelledby="lt-notice-' + h(n.id) + '"><p class="lt-notice-k">' + h(n.kind_label) + (n.activated ? " · confirmed " + day(n.activated) : "") + '</p><h3 id="lt-notice-' + h(n.id) + '">' + h(n.title) + "</h3><p>" + h(n.body) + '</p><a class="lt-btn" href="' + askHref("safety", r.product, r.lot) + '">Contact Product safety support</a></aside>';
    }).join("");
  }
  function facts(r, p, rec, cur) {
    if (r.demo && !rec && window.BCCDemo) rec = window.BCCDemo.lotMetadata;
    var d = (rec && rec.dates) || {}, s = (rec && rec.sample) || {};
    var rows = [
      ["Product", h(p ? p.name : r.product)], ["Lot", '<span class="lt-mono">' + h(r.lot) + "</span>"],
      ["Formulation / product version", nd(rec && rec.formulation_version)], ["Manufactured", nd(rec && day(rec.manufactured))], ["Expiry", nd(rec && day(rec.expiry))],
      ["Material tested", rec && s.type ? h(SAMPLE[s.type] || s.type) + (s.description ? "<small>" + h(s.description) + "</small>" : "") : nd()],
      ["Laboratory report number", nd(rec && rec.lab_report_no)], ["Laboratory sample reference", nd(rec && rec.lab_sample_ref)],
      ["Sampled", nd(day(d.sampled))], ["Tested", d.tested_from || d.tested_to ? h(day(d.tested_from) + (d.tested_to && d.tested_to !== d.tested_from ? " – " + day(d.tested_to) : "")) : nd()],
      ["Report issued by the laboratory", nd(day(d.issued))], ["Published here", cur ? h(day(cur.published)) + (cur.version ? " · version " + cur.version : "") : nd(null, "Not published")],
      ["Commissioned by", nd(rec && rec.commissioned_by)],
    ];
    if(rec && rec.presentation){
      var options=rec.presentation;
      rows=rows.filter(function(row){
        if(!options.show_dates && ['Manufactured','Expiry','Sampled','Tested','Report issued by the laboratory'].includes(row[0]))return false;
        if(!options.show_lab && ['Material tested','Laboratory report number','Laboratory sample reference','Commissioned by'].includes(row[0]))return false;
        return true;
      });
    }
    return '<dl class="lt-facts">' + rows.map(function (x) { return "<div><dt>" + x[0] + "</dt><dd>" + x[1] + "</dd></div>"; }).join("") + "</dl>";
  }
  function resultsTable(rec, cur) {
    var rows = (rec && rec.results) || [];
    if (!rows.length) return '<p class="lt-empty">No results are transcribed for this record.</p>';
    var A = { meets: ["Meets", "is-meets"], does_not_meet: ["Does not meet", "is-fail"], not_assessed: ["Not assessed", "is-na"] };
    var groups = [], by = {};
    rows.forEach(function (r) { var g = r.group || ""; if (!by[g]) { by[g] = []; groups.push(g); } by[g].push(r); });
    return '<div class="lt-table-wrap" tabindex="0" role="region" aria-labelledby="lt-results-cap"><table class="lt-table"><caption id="lt-results-cap">Results as reported for lot ' + h(cur ? cur.lot || "" : "") + ", version " + h(cur ? cur.version : "") + '</caption><thead><tr><th scope="col">Test</th><th scope="col">Result</th><th scope="col">Unit</th><th scope="col">Specification</th><th scope="col">Method</th><th scope="col">Assessment</th><th scope="col">Source</th></tr></thead>' +
      groups.map(function (g) {
        return "<tbody>" + (g ? '<tr class="lt-group"><th scope="rowgroup" colspan="7">' + h(g) + "</th></tr>" : "") + by[g].map(function (r) {
          var a = A[r.assessment] || A.not_assessed;
          return '<tr><th scope="row">' + h(r.parameter) + (r.note ? "<small>" + h(r.note) + "</small>" : "") + '</th><td class="lt-res" data-label="Result"><span class="lt-mono">' + h(r.result) + "</span></td><td data-label=\"Unit\">" + nd(r.unit, "—") + '</td><td data-label="Specification">' + (r.spec ? h(r.spec) + (r.spec_source ? "<small>Source: " + h(r.spec_source) + "</small>" : "") : nd(null, "None stated")) + '</td><td data-label="Method">' + nd(r.method, "—") + '</td><td data-label="Assessment"><span class="lt-assess ' + a[1] + '">' + a[0] + '</span></td><td data-label="Source">' + nd(r.ref, "—") + "</td></tr>";
        }).join("") + "</tbody>";
      }).join("") + "</table></div>";
  }
  function documents(r, cur) {
    var docs = (cur && cur.documents) || [];
    if (!docs.length) return '<p class="lt-empty">No public source document for this lot yet.</p>';
    return '<ul class="lt-docs">' + docs.map(function (d) {
      var base = "/api/lots/documents/" + h(d.id); var isImage=(d.mime||"application/pdf").indexOf("image/")===0;
      return '<li class="lt-doc"><div><p class="lt-doc-k">' + h(DOCKIND[d.kind] || "Document") + (isImage ? " · Image · " : " · PDF · ") + bytes(d.bytes) + "</p><h4>" + h(d.title) + "</h4>" + (isImage ? '<figure class="lt-report-image"><a href="'+base+'" target="_blank" rel="noopener"><img src="'+base+'" alt="'+h(d.caption||d.title)+'" loading="lazy"></a>'+(d.caption?'<figcaption>'+h(d.caption)+'</figcaption>':'')+'</figure>' : "") + (d.redacted ? '<p class="lt-redact"><strong>Redacted copy.</strong> ' + h(d.redaction_note || "") + " Scientific results and qualifiers are not altered.</p>" : "") +
        '<details class="lt-hash"><summary>File fingerprint (SHA-256)</summary><code>' + h(d.sha256) + "</code><p>If you download the file, this fingerprint lets you check it's the same file we published.</p></details></div>" +
        '<div class="lt-doc-actions"><a class="lt-btn" href="' + base + '" target="_blank" rel="noopener">' + (isImage ? "View image" : "View PDF") + '<span class="lt-sr"> (' + h(d.title) + ', opens in a new tab)</span></a><a class="lt-btn is-quiet" href="' + base + '?download=1" download>Download<span class="lt-sr"> ' + h(d.title) + "</span></a></div></li>";
    }).join("") + "</ul>";
  }
  function lab(rec) {
    var l = rec && rec.lab;
    if (!l || !l.name) return '<p class="lt-empty">No issuing laboratory is recorded.</p>';
    var a = l.accreditation || {}, issued = rec.dates && rec.dates.issued;
    var within = "";
    if (a.valid_from && a.valid_to && issued) within = issued >= a.valid_from && issued <= a.valid_to ? "The report was issued within the accreditation validity period stated here." : "The report was issued outside the accreditation validity period stated here.";
    return '<div class="lt-lab"><h4>' + h(l.name) + "</h4>" + (l.address ? "<p>" + h(l.address) + "</p>" : "") +
      (a.body || a.certificate ? '<dl class="lt-facts is-compact"><div><dt>Accreditation body</dt><dd>' + nd(a.body) + "</dd></div><div><dt>Certificate</dt><dd>" + nd(a.certificate) + "</dd></div><div><dt>Validity</dt><dd>" + (a.valid_from || a.valid_to ? h(day(a.valid_from) + " – " + day(a.valid_to)) : nd()) + "</dd></div><div><dt>Scope</dt><dd>" + nd(a.scope) + "</dd></div></dl>" +
        (a.covers ? '<p class="lt-covers">' + COVERS[a.covers] + "</p>" : "") + (within ? '<p class="lt-covers">' + within + "</p>" : "") +
        (a.verify_url ? '<p><a class="lt-link" href="' + h(a.verify_url) + '" target="_blank" rel="noopener noreferrer">Verify with the accreditation body →<span class="lt-sr"> (external site, opens in a new tab)</span></a></p>' : "") : '<p class="lt-nd">No accreditation is recorded for this laboratory.</p>') +
      '<p class="lt-small">Accreditation belongs to the laboratory, for the tests in its scope. It isn’t an accreditation of Body Café Co. or of our products.</p></div>';
  }
  function versionHistory(r) {
    if (!r.history || !r.history.length) return "";
    var L = { published: "Current", superseded: "Superseded", withdrawn: "Withdrawn", demo: "Demonstration" };
    return '<div class="lt-history"><h3>Version history</h3><ol>' + r.history.map(function (x) {
      return '<li class="is-' + h(x.state) + '"><p><strong>Version ' + h(x.version) + "</strong> " + chip("is-" + h(x.state), L[x.state] || h(x.state)) + (x.published ? " Published " + day(x.published) + "." : "") + (x.superseded ? " Replaced " + day(x.superseded) + "." : "") + (x.withdrawn ? " Withdrawn " + day(x.withdrawn) + "." : "") + "</p>" +
        (x.change_note ? "<p>" + h(x.change_note) + "</p>" : "") + (x.withdrawn_reason ? "<p><strong>Why it was withdrawn:</strong> " + h(x.withdrawn_reason) + "</p>" : "") + "</li>";
    }).join("") + "</ol></div>";
  }
  function step(v, n, id, title, inner) {
    return '<section class="lt-stage lt-stage-' + id + '" id="' + id + '" aria-labelledby="' + id + '-t"><header class="lt-stage-head"><p class="lt-k">' + v.k(n) + " · " + v.stage[id] + '</p><h3 id="' + id + '-t">' + title + "</h3></header>" + inner + "</section>";
  }
  function renderMatch(v, r) {
    var p = prod(r.product), cur = r.current, rec = cur && cur.record;
    var demo = r.demo ? '<p class="lt-demo" role="note"><strong>Demonstration record.</strong> ' + (cur ? "Entered to show how a published report works. It is not a real laboratory result for this product." : "Batch dates and product version are illustrative design entries. No laboratory result or document is attached.") + "</p>" : "";
    var changed = r.changed ? '<p class="lt-searched">You entered “' + h(r.entered) + "”. We searched for <span class=\"lt-mono\">" + h(r.searched) + "</span> (spaces at either end and letter case ignored).</p>" : "";
    var head = '<div class="lt-match" id="match"><div class="lt-match-id">' + (p ? '<img src="' + window.BCCBottleAssets.url(h(p.id)) + '" alt="" width="720" height="1000" class="lt-pack">' : "") +
      '<div><p class="lt-k">' + v.k(4) + " · " + v.stage.match + '</p><h3 class="lt-match-h" tabindex="-1" id="lt-match-h"><span class="lt-match-p">' + h(p ? p.name : r.product) + '</span><span class="lt-lotno"><span class="lt-sr">Lot </span>' + h(r.lot) + "</span></h3>" + changed + demo +
      '<div class="lt-actions"><button type="button" class="lt-btn is-quiet" data-lt-share>Copy record link</button>' + (cur ? '<button type="button" class="lt-btn is-quiet" data-lt-print>Print summary</button>' : "") + '<a class="lt-btn is-quiet" href="' + askHref("report", r.product, r.lot) + '">Ask about this lot</a></div></div></div>' +
      notices(r) + statusTrio(r) + "</div>";
    if(cur && rec && rec.presentation){
      var options=rec.presentation,sections=head+step(v,4,"record-facts",rec.title ? h(rec.title) : "The record",facts(r,p,rec,cur));
      if(options.show_summary)sections+=step(v,5,"results","Report summary",'<p class="lt-summary">'+h(rec.summary||"")+'</p>'+(rec.partial?'<p class="lt-callout">'+h(rec.partial)+'</p>':""));
      var detail="";
      if(options.show_results)detail+='<h4 class="lt-sub">Results</h4>'+resultsTable(rec,{version:cur.version,lot:r.lot});
      if(options.show_documents)detail+='<h4 class="lt-sub">Source documents</h4>'+documents(r,cur);
      if(options.show_lab)detail+='<h4 class="lt-sub">Issuing laboratory</h4>'+lab(rec)+(rec.lab_notes?'<p>'+h(rec.lab_notes)+'</p>':"");
      sections+=step(v,6,"documents","Report files and details",detail+versionHistory(r));
      return sections;
    }
    var why = r.availability === "withdrawn" && r.history[0] && r.history[0].withdrawn_reason ? '<p class="lt-callout"><strong>Why this report was withdrawn:</strong> ' + h(r.history[0].withdrawn_reason) + "</p>" : "";
    var und = cur ? '<p class="lt-summary">' + nd(rec.summary, "No summary has been reviewed for this record.") + "</p>" + (rec.partial ? '<p class="lt-callout"><strong>Published in part.</strong> ' + h(rec.partial) + "</p>" : "") +
      '<p class="lt-count">' + h(cur.assessment.total) + " result" + (cur.assessment.total === 1 ? "" : "s") + ": " + cur.assessment.meets + " meet" + (cur.assessment.meets === 1 ? "s" : "") + " the stated specification, " + cur.assessment.does_not_meet + " " + (cur.assessment.does_not_meet === 1 ? "does" : "do") + " not, " + cur.assessment.not_assessed + " reported without an assessment.</p>" + (rec.lab_notes ? '<p class="lt-small"><strong>Laboratory notes:</strong> ' + h(rec.lab_notes) + "</p>" : "")
      : "<p>" + (AVAIL[r.availability] || AVAIL.unavailable)[1] + "</p>" + why;
    var insp = '<h4 class="lt-sub">Results</h4>' + resultsTable(rec, cur ? { version: cur.version, lot: r.lot } : null) + '<div class="lt-inspect-grid"><div><h4 class="lt-sub">Source documents</h4>' + documents(r, cur) + '</div><div><h4 class="lt-sub">Issuing laboratory</h4>' + lab(rec) + "</div></div>" + versionHistory(r);
    return head + step(v, 4, "record-facts", "The record", facts(r, p, rec, cur)) + step(v, 5, "results", "Results explained", und) + step(v, 6, "documents", "Results, documents and laboratory", insp);
  }
  function renderMiss(v, r) {
    var p = prod(r.product);
    if (r.state === "other_product") {
      var other = (r.other_products || []).map(function (id) { return prod(id); }).filter(Boolean);
      return '<div class="lt-miss is-other"><p class="lt-k">' + v.k(4) + " · " + v.stage.match + '</p><h3 tabindex="-1" id="lt-match-h">That lot belongs to a different product</h3><p>Lot <span class="lt-mono">' + h(r.searched) + "</span> isn't a " + h(p ? p.name : r.product) + " lot. Our records list it under " + other.map(function (o) { return "<strong>" + h(o.name) + "</strong>"; }).join(" and ") + ". Check which product your pack is.</p>" +
        '<div class="lt-actions">' + other.map(function (o) { return '<button type="button" class="lt-btn" data-lt-switch="' + h(o.id) + '">Look it up under ' + h(o.name) + "</button>"; }).join("") + '<a class="lt-btn is-quiet" href="' + askHref("report", r.product, r.searched) + '">Ask us</a></div></div>';
    }
    return '<div class="lt-miss"><p class="lt-k">' + v.k(4) + " · " + v.stage.match + '</p><h3 tabindex="-1" id="lt-match-h">No record matches that product and lot</h3><p>We searched for <span class="lt-mono">' + h(r.searched) + "</span> under <strong>" + h(p ? p.name : r.product) + "</strong> and found no exact match. We don't suggest similar lots, because a near match isn't your batch.</p>" +
      '<ul class="lt-tips"><li>Check easily confused characters: O and 0, I and 1, S and 5, B and 8.</li><li>Make sure the product above is the one on your pack.</li><li>Use the lot number, not the order number, barcode or SKU (see “Where is my lot number?”).</li></ul>' +
      "<p>Not finding a match doesn't mean your pack isn't genuine. Some lots may not have a public record yet.</p>" +
      '<div class="lt-actions"><a class="lt-btn" href="' + askHref("report", r.product, r.searched) + '">Ask us about this lot</a></div></div>';
  }
  function renderOutage(v, msg) {
    return '<div class="lt-miss is-outage"><p class="lt-k">' + v.k(4) + ' · Lookup status</p><h3 tabindex="-1" id="lt-match-h">The lookup isn’t responding</h3><p>' + h(msg) + '</p><p>Your product and lot are still filled in above.</p><div class="lt-actions"><button type="button" class="lt-btn" data-lt-retry>Try again</button></div></div>';
  }

  /* ====================================================================================================
     PRINT — a one-page summary built from the record on screen
     ==================================================================================================== */
  function printSheet(r) {
    var p = prod(r.product), cur = r.current, rec = cur && cur.record, d = (rec && rec.dates) || {};
    var link = location.origin + recordUrl(r.product, r.lot);
    return '<div class="lt-print"><p class="lt-print-k">Body Café Co. · Lot report summary' + (r.demo ? " · DEMONSTRATION RECORD, NOT A REAL LABORATORY RESULT" : "") + "</p><h1>" + h(p ? p.name : r.product) + " · Lot " + h(r.lot) + "</h1>" +
      '<table><tbody><tr><th>Report version</th><td>' + (cur ? cur.version + (cur.published ? ", published " + day(cur.published) : "") : "None published") + "</td></tr><tr><th>Document</th><td>" + (AVAIL[r.availability] || AVAIL.unavailable)[0] + "</td></tr><tr><th>Test assessment</th><td>" + (cur ? OVERALL[cur.assessment.overall][0] : "Cannot be assessed") + "</td></tr><tr><th>Batch notice</th><td>" + (r.notices.length ? r.notices.map(function (n) { return h(n.title); }).join("; ") : "No confirmed notice") + "</td></tr>" +
      "<tr><th>Manufactured / expiry</th><td>" + h(rec && day(rec.manufactured) || "Not documented") + " / " + h(rec && day(rec.expiry) || "Not documented") + "</td></tr><tr><th>Laboratory</th><td>" + h(rec && rec.lab && rec.lab.name || "Not documented") + (rec && rec.lab_report_no ? ", report " + h(rec.lab_report_no) : "") + "</td></tr><tr><th>Issued</th><td>" + h(day(d.issued) || "Not documented") + "</td></tr></tbody></table>" +
      (rec && rec.summary ? "<p>" + h(rec.summary) + "</p>" : "") +
      (rec && rec.results && rec.results.length ? '<table class="lt-print-res"><thead><tr><th>Test</th><th>Result</th><th>Unit</th><th>Specification</th><th>Assessment</th></tr></thead><tbody>' + rec.results.map(function (x) { return "<tr><td>" + h(x.parameter) + "</td><td>" + h(x.result) + "</td><td>" + h(x.unit || "") + "</td><td>" + h(x.spec || "None stated") + "</td><td>" + ({ meets: "Meets", does_not_meet: "Does not meet" }[x.assessment] || "Not assessed") + "</td></tr>"; }).join("") + "</tbody></table>" : "") +
      (cur && cur.documents.length ? "<p><strong>Source documents:</strong> " + cur.documents.map(function (x) { return h(x.title) + " (SHA-256 " + h(x.sha256.slice(0, 16)) + "…)"; }).join("; ") + "</p>" : "") +
      '<p class="lt-print-foot">Record: ' + h(link) + " · Printed " + day(Math.floor(Date.now() / 1000)) + ". A report describes a sample from one lot and the tests listed. It doesn’t authenticate an individual pack and isn't personal advice.</p></div>";
  }

  /* ====================================================================================================
     DIRECTIONS — same facts, own voice
     ==================================================================================================== */
  var STAGE = { match: "Match", "record-facts": "Record details", results: "Understand", documents: "Inspect" };
  var V = {
    a: { key: "a", kicker: "Lot reports · BCC / your batch", k: function (n) { return "[" + pad(n) + "]"; }, step: function (n) { return "[" + pad(n) + "]"; } },
    b: { key: "b", kicker: "Got a bottle in hand?", k: function (n) { return pad(n); }, step: function (n) { return n; } },
    c: { key: "c", kicker: "Turn the bottle over", k: function (n) { return "No. " + n; }, step: function (n) { return ["I", "II", "III"][n - 1]; }, title: "Your batch. <em>Its record.</em>" },
    d: { key: "d", kicker: "The record room · after hours", k: function (n) { return "Room " + pad(n); }, step: function (n) { return pad(n); }, title: "Your batch. <em>Its record.</em>" },
    e: { key: "e", kicker: "Lot reports · Body Café Co.", k: function (n) { return pad(n); }, step: function (n) { return pad(n); } },
    f: { key: "f", kicker: "Edition 01 · The record", k: function (n) { return "No. " + pad(n); }, step: function (n) { return pad(n); } },
    g: { key: "g", kicker: "Lot reports / proof sheet", k: function (n) { return "Frame " + pad(n); }, step: function (n) { return pad(n); } },
    h: { key: "h", kicker: "Lot reports · Reference", k: function (n) { return "§ " + n; }, step: function (n) { return "§ " + n; } },
  };
  Object.keys(V).forEach(function (d) {
    V[d].stage = STAGE;
    if (!S.themes[d]) return;
    var base = S.themes[d], next = {};
    Object.keys(base).forEach(function (k) { next[k] = base[k]; });
    next.reports = function (ctx) { return compose(V[d], ctx); };
    S.themes[d] = next;
  });

  /* ====================================================================================================
     BEHAVIOUR
     ==================================================================================================== */
  var cleanup = function () {};
  var last = null;
  function api(path) { return window.BCCApp.api(path); }
  function enhance() {
    cleanup();
    var root = document.querySelector("[data-lt]");
    if (!root) return;
    var v = V[root.getAttribute("data-lt-design")] || V.a;
    var abort = new AbortController(), signal = abort.signal;
    var on = function (el, ev, fn, o) { if (el) el.addEventListener(ev, fn, Object.assign({ signal: signal }, o || {})); };
    var form = root.querySelector("#lot-form"), out = root.querySelector("#report-result"), lotIn = root.querySelector("#lt-lot");
    var button = form.querySelector(".lt-submit");
    var pick = function () { var r = form.querySelector('input[name=product]:checked'); return r ? r.value : ""; };
    var setErr = function (id, msg, field) {
      var el = root.querySelector("#" + id); el.textContent = msg || ""; el.hidden = !msg;
      if (field) { if (msg) field.setAttribute("aria-invalid", "true"); else field.removeAttribute("aria-invalid"); }
    };
    var paintProduct = function () {
      var p = prod(pick());
      root.style.cssText = p ? "--lt-cap:" + p.color : "";
    };
    paintProduct();

    async function lookup(focusResult) {
      var pid = pick(), lot = lotIn.value;
      setErr("lt-product-error", pid ? "" : "Choose the product on your pack.", null);
      setErr("lt-lot-error", lot.trim() ? "" : "Enter the lot number printed on your pack.", lotIn);
      if (!pid) { form.querySelector("input[name=product]").focus(); return; }
      if (!lot.trim()) { lotIn.focus(); return; }
      button.disabled = true; button.firstChild.textContent = "Looking up…";
      out.setAttribute("aria-busy", "true");
      var status = root.querySelector("#lt-status"); status.textContent = "Looking up the record…";
      out.innerHTML = '<div class="lt-loading"><span class="lt-spin" aria-hidden="true"></span><p>Looking up the record for this lot…</p></div>';
      if (window.BCCApp.event) window.BCCApp.event("report_lookup");
      try {
        var r = await api("/lots?product=" + encodeURIComponent(pid) + "&lot=" + encodeURIComponent(lot));
        last = r;
        out.innerHTML = r.state === "match" ? renderMatch(v, r) : renderMiss(v, r);
        var href = r.state === "match" ? recordUrl(r.product, r.lot) : "/reports?product=" + encodeURIComponent(pid) + "&lot=" + encodeURIComponent(lot.trim());
        window.history.replaceState(window.history.state, "", withDesign(href));
        root.querySelector("#lt-asks").innerHTML = asks(r.product, r.state === "match" ? r.lot : r.searched);
        var pn = (prod(r.product) || {}).name || r.product;
        status.textContent = r.state === "match" ? "Record found: " + pn + ", lot " + r.lot + ". " + (AVAIL[r.availability] || AVAIL.unavailable)[0] + (r.notices.length ? ". This batch has a confirmed notice." : ".") : r.state === "other_product" ? "That lot belongs to a different product." : "No record matches that product and lot.";
      } catch (e) {
        last = null;
        out.innerHTML = renderOutage(v, e.message || "Please try again.");
        status.textContent = "The lookup isn’t responding. Your entry is kept.";
      } finally {
        out.removeAttribute("aria-busy");
        button.disabled = false; button.firstChild.textContent = "Find the record";
        if (window.BCCApp.keepDesignOnLinks) window.BCCApp.keepDesignOnLinks();
        var hd = root.querySelector("#lt-match-h");
        if (hd && focusResult) { hd.focus({ preventScroll: true }); root.querySelector("#record").scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }
      }
    }
    window.BCCLots.submit = function () { return lookup(true); };
    on(form, "change", function (e) { if (e.target.name === "product") { paintProduct(); setErr("lt-product-error", "", null); } });
    on(lotIn, "input", function () { if (lotIn.value.trim()) setErr("lt-lot-error", "", lotIn); });
    on(root, "click", function (e) {
      var t = e.target.closest("button");
      if (!t || !root.contains(t)) return;
      if (t.hasAttribute("data-lt-try") || t.hasAttribute("data-lt-sample")) {
        var pid = pick() || (catalog()[0] || {}).id;
        if (!pick()) { var first = form.querySelector('input[name=product][value="' + pid + '"]'); if (first) { first.checked = true; paintProduct(); } }
        var idx = catalog().findIndex(function (p) { return p.id === pid; }) + 1;
        lotIn.value = t.getAttribute("data-lt-sample") || "DEMO-" + pad(idx) + "-01";
        lookup(true);
      } else if (t.hasAttribute("data-lt-switch")) {
        var r = form.querySelector('input[name=product][value="' + t.getAttribute("data-lt-switch") + '"]');
        if (r) { r.checked = true; paintProduct(); lookup(true); }
      } else if (t.hasAttribute("data-lt-retry")) lookup(true);
      else if (t.hasAttribute("data-lt-share") && last) {
        var url = location.origin + recordUrl(last.product, last.lot);
        var done = function (ok) { t.textContent = ok ? "Link copied" : "Copy failed: the address bar has the link"; setTimeout(function () { if (t.isConnected) t.textContent = "Copy record link"; }, 2200); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(false); }); else done(false);
      } else if (t.hasAttribute("data-lt-print")) window.print();
    });

    /* Print: a one-page summary of the record on screen (falls back to the page when no record is shown). */
    on(window, "beforeprint", function () {
      if (!last || last.state !== "match") return;
      var node = document.createElement("div"); node.id = "lt-print-root"; node.innerHTML = printSheet(last);
      document.body.appendChild(node); document.documentElement.classList.add("lt-printing");
    });
    on(window, "afterprint", function () { var n = document.getElementById("lt-print-root"); if (n) n.remove(); document.documentElement.classList.remove("lt-printing"); });

    /* Archive. */
    var af = root.querySelector("#lt-archive-form"), list = root.querySelector("#lt-arch-list"), count = root.querySelector("#lt-arch-count"), timer = 0;
    async function loadArchive() {
      var p = af.elements.product.value, q = af.elements.q.value.trim();
      list.setAttribute("aria-busy", "true");
      try {
        var a = await api("/lots/archive?product=" + encodeURIComponent(p) + "&q=" + encodeURIComponent(q));
        var L = { published: "Published", superseded: "Superseded", withdrawn: "Report withdrawn", unavailable: "Not available yet" };
        var real = a.items.filter(function (x) { return !x.demo; }), demo = a.items.filter(function (x) { return x.demo; });
        var row = function (x) {
          var pr = prod(x.product);
          return '<li class="lt-arch-row' + (x.demo ? " is-demo" : "") + '" style="--lt-dot:' + h(pr ? pr.color : "#999") + '"><a href="' + withDesign(recordUrl(x.product, x.lot)) + '"><span class="lt-arch-p">' + h(pr ? pr.name : x.product) + '</span><span class="lt-mono lt-arch-lot">' + h(x.lot) + "</span>" +
            '<span class="lt-arch-meta">' + chip("is-" + x.availability, L[x.availability] || x.availability) + (x.version ? " v" + x.version : "") + (x.published ? " · " + day(x.published) : "") + (x.expiry ? " · exp. " + h(day(x.expiry)) : "") + (x.notice ? " " + chip("is-notice", "Batch notice") : "") + (x.demo ? " " + chip("is-demo", "Demonstration") : "") + '</span><span class="lt-arr" aria-hidden="true">→</span></a></li>';
        };
        count.textContent = real.length ? real.length + " published lot record" + (real.length === 1 ? "" : "s") + (demo.length ? ", plus " + demo.length + " demonstration lots" : "") + "." : "No published lot records yet" + (demo.length ? ". " + demo.length + " demonstration lots are listed so you can try the lookup." : ".");
        list.innerHTML = (real.length ? '<h3 class="lt-arch-h">Published records</h3><ul class="lt-arch-ul">' + real.map(row).join("") + "</ul>" : '<p class="lt-empty">No laboratory reports have been published yet.</p>') +
          (demo.length ? '<h3 class="lt-arch-h">Demonstration lots</h3><p class="lt-small">No laboratory document is connected to these.</p><ul class="lt-arch-ul">' + demo.map(row).join("") + "</ul>" : "");
      } catch (e) {
        count.textContent = "The archive didn’t load. " + (e.message || "") ;
        list.innerHTML = '<button type="button" class="lt-btn" data-lt-arch-retry>Try again</button>';
      } finally { list.removeAttribute("aria-busy"); }
    }
    on(af, "submit", function (e) { e.preventDefault(); e.stopPropagation(); loadArchive(); }, { capture: true });
    on(af.elements.product, "change", loadArchive);
    on(af.elements.q, "input", function () { clearTimeout(timer); timer = setTimeout(loadArchive, 300); });
    on(list, "click", function (e) { if (e.target.closest("[data-lt-arch-retry]")) loadArchive(); });
    on(list, "click", function (e) {
      var a = e.target.closest("a[href^='/reports/']");
      if (!a) return;
      var parts = new URL(a.href).pathname.split("/");
      var r = form.querySelector('input[name=product][value="' + decodeURIComponent(parts[2]) + '"]');
      if (!r) return;
      e.preventDefault(); e.stopPropagation();
      r.checked = true; paintProduct(); lotIn.value = decodeURIComponent(parts[3]);
      lookup(true);
    }, { capture: true });
    loadArchive();

    var st = state({ query: new URL(location.href).searchParams, catalog: catalog() });
    if (st.pid && st.lot) lookup(false);
    cleanup = function () { abort.abort(); last = null; };
  }

  window.BCCLots = { enhance: enhance, content: C, submit: function () {} };
})();
