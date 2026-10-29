/* Body Café Co. — Operations › Lot reports.

   Choose a product, then one of its batches. For that lot: create a draft, attach the laboratory PDF and/or images,
   choose which sections the public lot record shows, fill only the fields those sections need, then Save draft or
   Publish. Publishing is direct: there is no review or approval step. Published versions stay in the history;
   a correction starts a new draft version, and a published report can be withdrawn with a public reason.
   Drafts and their documents stay private until published. */
(function () {
  "use strict";
  var A = function () { return window.BCCApp; };
  function h(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function when(n) { return n ? new Date(n * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "—"; }
  function tag(t, tone) { return '<span class="op-tag op-tag-' + (tone || "neutral") + '">' + h(t) + "</span>"; }
  function q() { return new URLSearchParams(location.search); }
  function copy(o) { return JSON.parse(JSON.stringify(o || {})); }

  var SAMPLE = [["", "Choose…"], ["finished_product", "Finished product"], ["raw_material", "Raw ingredient"], ["other", "Other specified material"]];
  var COVERS = [["", "Not stated"], ["all", "Covers all reported tests"], ["some", "Covers some reported tests"], ["none", "Covers none of the reported tests"], ["unknown", "Not confirmed"]];
  var ASSESS = [["not_assessed", "Not assessed"], ["meets", "Meets"], ["does_not_meet", "Does not meet"]];
  var KINDS = [["original", "Original laboratory document"], ["redacted_copy", "Authorised redacted public copy"], ["amendment", "Amendment from the laboratory"]];
  var KIND_LABEL = { original: "Original", redacted_copy: "Redacted copy", amendment: "Amendment", image: "Image" };
  /* Old "in_review" records are treated as editable drafts. */
  var STATE = { draft: ["Draft", "warning"], in_review: ["Draft", "warning"], published: ["Published", "success"], superseded: ["Superseded", "neutral"], withdrawn: ["Withdrawn", "danger"] };
  var SECTIONS = [
    ["show_documents", "Documents", "The uploaded PDF or images, for customers to open."],
    ["show_summary", "Plain-language summary", "A short reviewed summary shown first."],
    ["show_results", "Results table", "Tests transcribed exactly as reported."],
    ["show_lab", "Laboratory details", "Who issued the report and what was tested."],
    ["show_dates", "Key dates", "When the report was issued, and testing dates."],
  ];
  var DATE_RE = /^\d{4}-\d{2}(-\d{2})?$/;
  var last = null, dirty = false, uid = 0;
  function nid(p) { return "lr-" + p + "-" + (++uid); }
  var isDraft = function (r) { return r.state === "draft" || r.state === "in_review"; };

  function opts(list, v) { return list.map(function (o) { return '<option value="' + h(o[0]) + '"' + (String(o[0]) === String(v == null ? "" : v) ? " selected" : "") + ">" + h(o[1]) + "</option>"; }).join(""); }
  function req(r) { return r ? ' <b class="op-req">Required to publish</b>' : ""; }
  function input(name, label, v, o) {
    o = o || {}; var id = o.id || nid("f");
    return '<div class="op-field' + (o.wide ? " op-wide" : "") + '"><label for="' + id + '">' + h(label) + req(o.req) + '</label><input id="' + id + '" name="' + h(name) + '" value="' + h(v || "") + '"' + (o.attrs || "") + (o.help ? ' aria-describedby="' + id + '-h"' : "") + (o.dis || "") + ">" + (o.help ? '<small class="op-help" id="' + id + '-h">' + o.help + "</small>" : "") + "</div>";
  }
  function text(name, label, v, o) {
    o = o || {}; var id = o.id || nid("t");
    return '<div class="op-field op-wide"><label for="' + id + '">' + h(label) + req(o.req) + '</label><textarea id="' + id + '" name="' + h(name) + '" rows="' + (o.rows || 3) + '" maxlength="' + (o.max || 1500) + '"' + (o.help ? ' aria-describedby="' + id + '-h"' : "") + (o.dis || "") + ">" + h(v || "") + "</textarea>" + (o.help ? '<small class="op-help" id="' + id + '-h">' + o.help + "</small>" : "") + "</div>";
  }
  function sel(name, label, list, v, o) {
    o = o || {}; var id = o.id || nid("s");
    return '<div class="op-field' + (o.wide ? " op-wide" : "") + '"><label for="' + id + '">' + h(label) + req(o.req) + '</label><select id="' + id + '" name="' + h(name) + '"' + (o.attrs || "") + (o.dis || "") + ">" + opts(list, v) + "</select></div>";
  }
  function dateIn(name, label, v, o) { o = o || {}; o.attrs = ' placeholder="YYYY-MM-DD" inputmode="numeric" maxlength="10" spellcheck="false"'; o.help = o.help || "YYYY-MM or YYYY-MM-DD, as on the report."; return input(name, label, v, o); }

  function productsOf(o) { return (o.products && o.products.length ? o.products : (A().catalog() || [])); }
  function lotsOf(o, pid) { return (o.batches || []).filter(function (b) { return b.product === pid; }).sort(function (a, b) { return (b.expiry || 0) - (a.expiry || 0); }); }
  function reportsFor(o, pid, lot) { return (o.lot_reports || []).filter(function (r) { return r.product === pid && r.lot === lot; }).sort(function (a, b) { return b.version - a.version; }); }
  function reportStatus(o, pid, lot) {
    var rs = reportsFor(o, pid, lot);
    if (rs.some(isDraft)) return "Draft in progress";
    if (rs.some(function (r) { return r.state === "published"; })) return "Report published";
    if (rs.some(function (r) { return r.state === "withdrawn"; })) return "Report withdrawn";
    return "No report";
  }
  function presentation(d) {
    if (d.presentation) return Object.assign({ show_documents: true, show_summary: true, show_results: false, show_lab: false, show_dates: false }, d.presentation);
    return { show_documents: true, show_summary: true, show_results: !!(d.results && d.results.length), show_lab: !!(d.lab && d.lab.name), show_dates: !!(d.dates && d.dates.issued) };
  }
  var visibleDocs = function (r) { return (r.documents || []).filter(function (d) { return d.visible !== false; }); };

  /* ---------------------------------------------------------------- picker */
  function picker(o, pid, lot, dis) {
    var prods = productsOf(o), lots = pid ? lotsOf(o, pid) : [];
    var lotHelp = !pid ? "Choose a product first." : lots.length ? lots.length + " batch" + (lots.length === 1 ? "" : "es") + " for this product." : "This product has no batches yet.";
    return '<section class="op-card op-lot-picker" aria-label="Choose a product and lot"><div class="op-form-grid">' +
      '<div class="op-field"><label for="lot-pick-product">Product</label><select id="lot-pick-product" data-lot-pick="product"' + dis + '><option value="">Choose a product…</option>' + prods.map(function (p) { return '<option value="' + h(p.id) + '"' + (p.id === pid ? " selected" : "") + ">" + h(p.name) + "</option>"; }).join("") + "</select></div>" +
      '<div class="op-field"><label for="lot-pick-lot">Lot</label><select id="lot-pick-lot" data-lot-pick="lot" aria-describedby="lot-pick-h"' + (pid && lots.length ? "" : " disabled") + dis + '><option value="">' + (pid ? (lots.length ? "Choose a lot…" : "No batches") : "Choose a product first") + "</option>" +
      lots.map(function (b) { return '<option value="' + h(b.id) + '"' + (b.id === lot ? " selected" : "") + ">" + h(b.id + " · exp " + when(b.expiry) + " · " + reportStatus(o, pid, b.id)) + "</option>"; }).join("") +
      '</select><small class="op-help" id="lot-pick-h">' + lotHelp + "</small></div></div></section>";
  }

  /* ---------------------------------------------------------------- documents */
  function docItem(d, r, dis) {
    var isImg = /^image\//.test(d.mime || "") || d.kind === "image", url = "/api/lots/documents/" + encodeURIComponent(d.id);
    return '<li class="op-doc">' + (isImg ? '<img src="' + url + '" alt="' + h(d.caption || d.title) + '" loading="lazy">' : '<span class="op-doc-icon" aria-hidden="true">PDF</span>') +
      '<div><strong>' + h(d.title) + "</strong><small>" + h(KIND_LABEL[d.kind] || d.kind || (isImg ? "Image" : "Document")) + (d.bytes ? " · " + Math.max(1, Math.round(d.bytes / 1024)) + " KB" : "") + (d.sha256 ? ' · SHA-256 <code>' + h(d.sha256.slice(0, 12)) + "…</code>" : "") + "</small>" +
      (d.caption ? "<small>" + h(d.caption) + "</small>" : "") + (d.redaction_note ? "<small>Redaction: " + h(d.redaction_note) + "</small>" : "") + "</div>" +
      '<div class="op-row-actions"><a class="op-btn op-small" href="' + url + '" target="_blank" rel="noopener">Open<span class="sr-only"> ' + h(d.title) + "</span></a>" +
      (isDraft(r) ? '<button type="button" class="op-btn op-small op-danger" data-lot-docremove="' + h(d.id) + '" data-report="' + h(r.id) + '"' + dis + ">Remove<span class=\"sr-only\"> " + h(d.title) + "</span></button>" : "") + "</div></li>";
  }
  function docList(r, dis) {
    var list = r.documents || [];
    return list.length ? '<ul class="op-docs">' + list.map(function (d) { return docItem(d, r, dis); }).join("") + "</ul>" : '<p class="op-muted">No documents attached yet.</p>';
  }
  function uploader(r, dis) {
    var id = h(r.id);
    return '<form class="op-lot-upload" data-lot-ops="upload" data-id="' + id + '"><div class="op-form-grid">' +
      '<div class="op-field op-wide"><label for="up-' + id + '">File</label><input id="up-' + id + '" name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required data-lot-file aria-describedby="up-' + id + '-h"' + dis + '><small class="op-help" id="up-' + id + '-h">PDF up to 15 MB, or a JPEG, PNG or WebP image up to 5 MB. Files stay private until you publish.</small></div>' +
      '<div class="op-lot-filepreview op-wide" data-lot-preview hidden></div>' +
      input("title", "Document title", "", { attrs: ' maxlength="160" required', wide: true, dis: dis }) +
      '<div class="op-wide" data-for-kind="pdf" hidden><div class="op-form-grid">' + sel("kind", "This PDF is", KINDS, "original", { dis: dis, attrs: " data-lot-pdfkind" }) + '<div data-for-redacted hidden>' + input("note", "What was removed and why (shown publicly)", "", { attrs: ' maxlength="400"', dis: dis }) + "</div></div></div>" +
      '<div class="op-wide" data-for-kind="image" hidden>' + input("caption", "Caption (shown publicly)", "", { attrs: ' maxlength="300"', wide: true, dis: dis, help: "Describe what the image shows, e.g. “Page 1 of the certificate of analysis”." }) + "</div>" +
      '</div><div class="op-error" role="alert"></div><div class="op-form-actions"><button class="op-btn" type="submit"' + dis + ">Upload privately</button></div></form>";
  }

  /* ---------------------------------------------------------------- editor */
  function resultRow(id, i, r, dis) {
    r = r || {};
    function cell(k, label, w) { return '<td><label class="sr-only" for="' + id + "-r" + i + "-" + k + '">' + label + " (row " + (i + 1) + ')</label><input id="' + id + "-r" + i + "-" + k + '" name="r.' + i + "." + k + '" value="' + h(r[k] || "") + '" size="' + w + '"' + dis + "></td>"; }
    return '<tr data-lot-row="' + i + '">' + cell("group", "Group", 8) + cell("parameter", "Test", 14) + cell("result", "Result as reported", 9) + cell("unit", "Unit", 6) + cell("spec", "Specification", 10) + cell("spec_source", "Specification source", 10) + cell("method", "Method", 10) +
      '<td><label class="sr-only" for="' + id + "-r" + i + '-assessment">Assessment (row ' + (i + 1) + ')</label><select id="' + id + "-r" + i + '-assessment" name="r.' + i + '.assessment"' + dis + ">" + opts(ASSESS, r.assessment || "not_assessed") + "</select></td>" + cell("ref", "Source reference", 6) + cell("note", "Note", 10) + "</tr>";
  }
  function section(key, title, body, pres) {
    return '<fieldset class="op-fieldset op-lot-section" data-pres-section="' + key + '"' + (pres[key] ? "" : " hidden") + "><legend>" + title + "</legend>" + body + "</fieldset>";
  }
  function editor(r, dis) {
    var d = r.record || {}, id = "lr-" + r.id, dt = d.dates || {}, lab = d.lab || {}, acc = lab.accreditation || {}, smp = d.sample || {}, pres = presentation(d);
    var rows = (d.results || []).concat([{}]);
    var docsN = visibleDocs(r).length;
    return '<section class="op-card" aria-labelledby="' + id + '-docs"><div class="op-card-title"><h2 id="' + id + '-docs"><span class="op-step">1</span> Documents</h2>' + tag(docsN + " attached", docsN ? "success" : "warning") + '</div><p class="op-intro">Attach the laboratory PDF, images of it, or both. A report needs at least one document to publish; an image or PDF on its own is enough without transcribing every result.</p>' + docList(r, dis) + uploader(r, dis) + "</section>" +
      '<form class="op-lot-editor" data-lot-ops="update" data-id="' + h(r.id) + '" novalidate>' +
      '<section class="op-card" aria-labelledby="' + id + '-pub"><div class="op-card-title"><h2 id="' + id + '-pub"><span class="op-step">2</span> Public record</h2></div>' +
      input("title", "Report title", d.title, { attrs: ' maxlength="160"', req: true, wide: true, dis: dis, id: id + "-title", help: "e.g. “Certificate of analysis, finished product”." }) +
      '<fieldset class="op-fieldset"><legend>Show on the public lot record</legend><div class="op-pres">' + SECTIONS.map(function (s) {
        var cid = id + "-" + s[0];
        return '<label class="op-pres-item" for="' + cid + '"><input type="checkbox" id="' + cid + '" name="pres.' + s[0] + '" data-lot-pres="' + s[0] + '"' + (pres[s[0]] ? " checked" : "") + dis + "><span><strong>" + s[1] + "</strong><small>" + s[2] + "</small></span></label>";
      }).join("") + "</div></fieldset></section>" +
      '<section class="op-card" aria-labelledby="' + id + '-det"><div class="op-card-title"><h2 id="' + id + '-det"><span class="op-step">3</span> Details</h2></div><p class="op-intro" data-lot-noextra' + (pres.show_summary || pres.show_results || pres.show_lab || pres.show_dates ? " hidden" : "") + '>No extra details needed: only the documents will be shown.</p>' +
      (r.version > 1 ? text("change_note", "What changed from the previous version, and why (public)", d.change_note, { max: 600, rows: 2, dis: dis, req: true }) : "") +
      section("show_summary", "Plain-language summary", text("summary", "Reviewed summary (shown first)", d.summary, { req: true, rows: 4, dis: dis, id: id + "-summary" }) + text("partial", "If only part of the report is published, say what’s missing", d.partial, { max: 600, rows: 2, dis: dis }), pres) +
      section("show_results", "Results, exactly as reported" + req(true), '<p class="op-help">Type results as the laboratory wrote them, including &lt;, &gt;, “ND”, ranges and words. An assessment needs both the specification and its source.</p><div class="op-table-wrap"><table class="op-table op-results"><thead><tr><th scope="col">Group</th><th scope="col">Test</th><th scope="col">Result</th><th scope="col">Unit</th><th scope="col">Specification</th><th scope="col">Spec. source</th><th scope="col">Method</th><th scope="col">Assessment</th><th scope="col">Ref.</th><th scope="col">Note</th></tr></thead><tbody id="' + id + '-results">' + rows.map(function (x, i) { return resultRow(id, i, x, dis); }).join("") + '</tbody></table></div><button type="button" class="op-btn op-small" data-lot-addrow' + dis + ">＋ Add a row</button>", pres) +
      section("show_lab", "Laboratory", '<div class="op-form-grid">' + input("lab.name", "Laboratory name", lab.name, { req: true, dis: dis, id: id + "-labname" }) + input("lab_report_no", "Laboratory report number", d.lab_report_no, { req: true, dis: dis, id: id + "-repno" }) + sel("sample.type", "Material tested", SAMPLE, smp.type, { req: true, dis: dis, id: id + "-stype" }) + input("sample.description", "Sample description, as on the report", smp.description, { dis: dis }) + "</div>" +
        '<details class="op-advanced"><summary>Advanced laboratory metadata (optional)</summary><div class="op-form-grid">' + input("lab.address", "Laboratory address", lab.address, { dis: dis, wide: true }) + input("lab_sample_ref", "Laboratory sample reference", d.lab_sample_ref, { dis: dis }) + input("commissioned_by", "Commissioned / submitted by", d.commissioned_by, { dis: dis }) +
        input("acc.body", "Accreditation body", acc.body, { dis: dis }) + input("acc.certificate", "Certificate / reference", acc.certificate, { dis: dis }) + dateIn("acc.valid_from", "Accreditation valid from", acc.valid_from, { dis: dis }) + dateIn("acc.valid_to", "Accreditation valid to", acc.valid_to, { dis: dis }) +
        input("acc.verify_url", "Official verification link", acc.verify_url, { dis: dis, attrs: ' type="url" placeholder="https://"', help: "https links only." }) + sel("acc.covers", "Does the scope cover these tests?", COVERS, acc.covers, { dis: dis }) + "</div>" + text("acc.scope", "Accreditation scope, as stated", acc.scope, { max: 600, rows: 2, dis: dis }) + text("lab_notes", "Laboratory notes, verbatim", d.lab_notes, { rows: 3, dis: dis }) + "</details>", pres) +
      section("show_dates", "Dates", '<div class="op-form-grid">' + dateIn("dates.issued", "Report issued", dt.issued, { req: true, dis: dis, id: id + "-issued" }) + dateIn("dates.sampled", "Sampled", dt.sampled, { dis: dis }) + dateIn("dates.received", "Received by laboratory", dt.received, { dis: dis }) + dateIn("dates.tested_from", "Testing started", dt.tested_from, { dis: dis }) + dateIn("dates.tested_to", "Testing finished", dt.tested_to, { dis: dis }) + "</div>", pres) +
      '<details class="op-advanced"><summary>Lot identity (optional)</summary><div class="op-form-grid">' + input("formulation_version", "Formulation / product version", d.formulation_version, { dis: dis }) + dateIn("manufactured", "Manufactured", d.manufactured, { dis: dis }) + dateIn("expiry", "Expiry", d.expiry, { dis: dis }) + "</div></details>" +
      "</section>" +
      '<section class="op-card op-lot-actions" aria-label="Save or publish"><div class="op-error-summary" data-lot-errors tabindex="-1" role="alert"></div><div class="op-form-grid">' + input("publish_note", "Publish note (optional, internal)", "", { attrs: ' maxlength="600"', wide: true, dis: dis }) + '</div><div class="op-error" role="alert"></div><div class="op-form-actions"><button class="op-btn" type="submit" name="intent" value="save"' + dis + '>Save draft</button><button class="op-btn op-primary" type="submit" name="intent" value="publish"' + dis + '>Publish</button><button class="op-btn op-danger op-push" type="button" data-lot-discard="' + h(r.id) + '"' + dis + ">Discard draft</button></div><p class=\"op-help\">Publish saves your edits and makes this version public now" + (r.version > 1 ? ", replacing the current published version, which stays in the history as superseded" : "") + ".</p></section></form>";
  }

  /* ---------------------------------------------------------------- published & history */
  function publishedCard(r, dis, hasDraft) {
    var d = r.record || {}, pres = presentation(d), shown = SECTIONS.filter(function (s) { return pres[s[0]]; }).map(function (s) { return s[1]; });
    return '<section class="op-card" aria-labelledby="pub-' + h(r.id) + '"><div class="op-card-title"><h2 id="pub-' + h(r.id) + '">' + h(d.title || "Version " + r.version) + "</h2>" + tag("Published", "success") + "</div>" +
      '<p class="op-muted">Version ' + r.version + " · published " + when(r.published) + (r.approved_by || r.published_by ? " by " + h(r.published_by || r.approved_by) : "") + " · shows " + h(shown.join(", ") || "documents") + "</p>" +
      (pres.show_summary && d.summary ? '<p class="op-lot-summary">' + h(d.summary) + "</p>" : "") + docList(r, dis) +
      '<div class="op-form-actions"><a class="op-btn" href="/reports/' + encodeURIComponent(r.product) + "/" + encodeURIComponent(r.lot) + '" target="_blank" rel="noopener">View public record ↗</a>' +
      (hasDraft ? "" : '<form class="op-inline-form" data-lot-ops="draft"><input type="hidden" name="product" value="' + h(r.product) + '"><input type="hidden" name="lot" value="' + h(r.lot) + '"><button class="op-btn" type="submit"' + dis + ">Start a corrected version</button><div class=\"op-error\" role=\"alert\"></div></form>") + "</div>" +
      '<details class="op-advanced op-withdraw"><summary>Withdraw this report</summary><form data-lot-ops="withdraw" data-id="' + h(r.id) + '"><p class="op-help">The lot record shows that this report was withdrawn, with your reason. Use this when the report no longer applies; for a correction, start a corrected version instead.</p>' +
      '<div class="op-field op-wide"><label for="wd-' + h(r.id) + '">Public reason</label><textarea id="wd-' + h(r.id) + '" name="reason" rows="2" minlength="10" maxlength="600" required' + dis + '></textarea></div><div class="op-error" role="alert"></div><div class="op-form-actions"><button class="op-btn op-danger" type="submit"' + dis + ">Withdraw now</button></div></form></details></section>";
  }
  function history(list) {
    if (!list.length) return "";
    return '<details class="op-card op-history"><summary>Version history (' + list.length + ")</summary><ol>" + list.map(function (r) {
      var s = STATE[r.state] || [r.state, "neutral"], d = r.record || {};
      return "<li><strong>Version " + r.version + "</strong> " + tag(s[0], s[1]) + " <span class=\"op-muted\">" + h(d.title || "") + " · created " + when(r.created) + (r.published ? " · published " + when(r.published) : "") + (r.withdrawn_reason ? " · withdrawn: " + h(r.withdrawn_reason) : "") + (d.change_note ? " · " + h(d.change_note) : "") + "</span>" + (r.documents && r.documents.length ? '<div class="op-history-docs">' + r.documents.map(function (x) { return '<a href="/api/lots/documents/' + encodeURIComponent(x.id) + '" target="_blank" rel="noopener">' + h(x.title) + "</a>"; }).join(" · ") + "</div>" : "") + "</li>";
    }).join("") + "</ol></details>";
  }

  /* ---------------------------------------------------------------- render */
  function render(o, viewer) {
    last = o; dirty = false; uid = 0;
    var dis = viewer ? " disabled" : "", pid = q().get("product") || "", lot = q().get("lot") || "";
    var prods = productsOf(o), product = prods.filter(function (p) { return p.id === pid; })[0];
    var out = picker(o, pid, lot, dis);
    if (!pid) return out + '<section class="op-card op-steps-card"><h2>Publish a lot report</h2><ol class="op-steps"><li><strong>Choose the product and lot</strong><span>Only that product’s batches are listed.</span></li><li><strong>Attach the document</strong><span>The laboratory PDF, images of it, or both.</span></li><li><strong>Choose what to show</strong><span>Then fill only the fields those sections need.</span></li><li><strong>Save or publish</strong><span>Drafts stay private. Publishing is immediate.</span></li></ol></section>';
    if (!product) return out + '<div class="op-empty"><h2>Product not found</h2><p>Choose a product from the list.</p></div>';
    var lots = lotsOf(o, pid);
    if (!lots.length) return out + '<div class="op-empty"><h2>No batches for ' + h(product.name) + '</h2><p>Lot reports attach to a batch. Add the batch in Inventory first.</p><a class="op-btn op-primary" href="/ops/inventory?new=1&product=' + encodeURIComponent(pid) + '">＋ Add a batch</a></div>';
    if (!lot) return out + '<section class="op-card op-flush"><div class="op-card-title op-pad"><h2>' + h(product.name) + " batches</h2></div><div class=\"op-table-wrap\"><table class=\"op-table\"><caption class=\"sr-only\">Batches and report status</caption><thead><tr><th scope=\"col\">Lot</th><th scope=\"col\">Expiry</th><th scope=\"col\">Batch</th><th scope=\"col\">Report</th><th scope=\"col\"></th></tr></thead><tbody>" +
      lots.map(function (b) { var st = reportStatus(o, pid, b.id); return "<tr><td><strong>" + h(b.id) + "</strong></td><td>" + when(b.expiry) + "</td><td>" + tag(b.state, b.state === "released" ? "success" : "warning") + "</td><td>" + tag(st, st === "Report published" ? "success" : st === "No report" ? "neutral" : st === "Report withdrawn" ? "danger" : "warning") + '</td><td><a class="op-btn op-small" href="/ops/lots?product=' + encodeURIComponent(pid) + "&lot=" + encodeURIComponent(b.id) + '">Open<span class="sr-only"> ' + h(b.id) + "</span></a></td></tr>"; }).join("") + "</tbody></table></div></section>";
    var batch = lots.filter(function (b) { return b.id === lot; })[0];
    if (!batch) return out + '<div class="op-empty"><h2>' + h(lot) + " isn’t a batch of " + h(product.name) + "</h2><p>Choose a lot from the list above.</p></div>";

    var rs = reportsFor(o, pid, lot), draft = rs.filter(isDraft)[0], pub = rs.filter(function (r) { return r.state === "published"; })[0];
    var others = rs.filter(function (r) { return r !== draft && r !== pub; });
    out += '<div class="op-lot-head"><div><p class="op-eyebrow">' + h(product.name) + "</p><h2>Lot " + h(lot) + '</h2><p class="op-muted">Batch ' + h(batch.state) + " · expires " + when(batch.expiry) + "</p></div><div>" + (draft ? tag("Version " + draft.version + " draft", "warning") : "") + (pub ? tag("Version " + pub.version + " published", "success") : "") + "</div></div>";
    if (!rs.length) out += '<div class="op-empty"><h2>No report for this lot yet</h2><p>Create a private draft, then attach the laboratory document.</p><form data-lot-ops="draft"><input type="hidden" name="product" value="' + h(pid) + '"><input type="hidden" name="lot" value="' + h(lot) + '"><div class="op-error" role="alert"></div><button class="op-btn op-primary" type="submit"' + dis + ">Create draft report</button></form></div>";
    if (!draft && !pub && rs.length) out += '<div class="op-empty"><h2>No active report</h2><p>Earlier versions are in the history below.</p><form data-lot-ops="draft"><input type="hidden" name="product" value="' + h(pid) + '"><input type="hidden" name="lot" value="' + h(lot) + '"><div class="op-error" role="alert"></div><button class="op-btn op-primary" type="submit"' + dis + ">Start a new version</button></form></div>";
    if (draft) out += (pub ? '<div class="op-notice">Version ' + pub.version + " is public. You’re editing version " + draft.version + ". It stays private until you publish it.</div>" : "") + editor(draft, dis);
    if (pub) out += (draft ? '<h2 class="op-section-h">Currently public</h2>' : "") + publishedCard(pub, dis, !!draft);
    return out + history(others);
  }

  /* ---------------------------------------------------------------- collect & validate */
  function find(id) { return ((last && last.lot_reports) || []).filter(function (r) { return r.id === id; })[0]; }
  function collect(form) {
    var r = find(form.dataset.id), base = copy(r && r.record);
    var rec = Object.assign({}, base);
    rec.sample = Object.assign({}, base.sample); rec.dates = Object.assign({}, base.dates);
    rec.lab = Object.assign({}, base.lab); rec.lab.accreditation = Object.assign({}, base.lab && base.lab.accreditation);
    rec.presentation = presentation(base);
    var rows = {};
    [].slice.call(form.elements).forEach(function (el) {
      if (!el.name || el.type === "button" || el.type === "submit" || el.type === "file" || el.name === "publish_note" || el.name === "intent") return;
      var n = el.name, v = typeof el.value === "string" ? el.value.trim() : el.value, m = n.match(/^r\.(\d+)\.(\w+)$/);
      if (m) { (rows[m[1]] = rows[m[1]] || {})[m[2]] = v; return; }
      if (n.indexOf("pres.") === 0) rec.presentation[n.slice(5)] = !!el.checked;
      else if (n.indexOf("acc.") === 0) rec.lab.accreditation[n.slice(4)] = v;
      else if (n.indexOf("lab.") === 0) rec.lab[n.slice(4)] = v;
      else if (n.indexOf("sample.") === 0) rec.sample[n.slice(7)] = v;
      else if (n.indexOf("dates.") === 0) rec.dates[n.slice(6)] = v;
      else rec[n] = v;
    });
    if (Object.keys(rows).length) rec.results = Object.keys(rows).sort(function (a, b) { return a - b; }).map(function (k) { return rows[k]; }).filter(function (x) { return Object.keys(x).some(function (k) { return k !== "assessment" && x[k]; }); });
    return rec;
  }
  function validate(rec, r, form) {
    var e = [], p = rec.presentation || {}, id = "lr-" + r.id;
    var f = function (sel, msg) { e.push([sel, msg]); };
    if (!rec.title) f(id + "-title", "Add a report title.");
    if (!visibleDocs(r).length) f("up-" + r.id, "Attach at least one document.");
    else if (!p.show_documents) f(id + "-show_documents", "Show the documents: a published report needs at least one visible document.");
    if (p.show_summary && !rec.summary) f(id + "-summary", "Write the plain-language summary, or stop showing it.");
    if (p.show_results && !(rec.results || []).length) f(id + "-r0-parameter", "Add at least one result row, or stop showing results.");
    if (p.show_results) (rec.results || []).forEach(function (x, i) { if (x.assessment && x.assessment !== "not_assessed" && (!x.spec || !x.spec_source)) f(id + "-r" + i + "-spec", "Row " + (i + 1) + ": an assessment needs a specification and its source."); });
    if (p.show_lab) { if (!rec.lab.name) f(id + "-labname", "Add the laboratory name."); if (!rec.lab_report_no) f(id + "-repno", "Add the laboratory report number."); if (!rec.sample.type) f(id + "-stype", "Choose the material tested."); }
    if (p.show_dates && !rec.dates.issued) f(id + "-issued", "Add the date the report was issued.");
    [].slice.call(form.querySelectorAll('[placeholder="YYYY-MM-DD"]')).forEach(function (el) { if (el.value.trim() && !DATE_RE.test(el.value.trim())) f(el.id, (el.labels && el.labels[0] ? el.labels[0].firstChild.textContent.trim() : "Date") + ": use YYYY-MM or YYYY-MM-DD."); });
    var url = rec.lab.accreditation.verify_url; if (url && !/^https:\/\/\S+$/.test(url)) f("", "The verification link must start with https://.");
    return e;
  }
  function showErrors(form, errors) {
    var box = form.querySelector("[data-lot-errors]");
    if (!errors.length) { box.innerHTML = ""; return; }
    box.innerHTML = "<p><strong>Before publishing, fix " + (errors.length === 1 ? "this" : "these " + errors.length) + ":</strong></p><ul>" + errors.map(function (x) { return "<li>" + (x[0] ? '<a href="#' + h(x[0]) + '" data-lot-jump="' + h(x[0]) + '">' + h(x[1]) + "</a>" : h(x[1])) + "</li>"; }).join("") + "</ul>";
    box.focus();
  }

  /* ---------------------------------------------------------------- actions */
  async function upload(form, data) {
    var file = form.elements.file.files[0], id = form.dataset.id;
    if (!file) throw new Error("Choose a PDF or image.");
    var isPdf = file.type === "application/pdf", isImg = ["image/jpeg", "image/png", "image/webp"].indexOf(file.type) >= 0;
    if (!isPdf && !isImg) throw new Error("Use a PDF, or a JPEG, PNG or WebP image.");
    if (file.size > (isPdf ? 15 : 5) * 1024 * 1024) throw new Error(isPdf ? "PDFs can be up to 15 MB." : "Images can be up to 5 MB.");
    if (!data.title || !data.title.trim()) throw new Error("Add a document title.");
    var editorForm = document.querySelector('form[data-lot-ops="update"][data-id="' + CSS.escape(id) + '"]');
    if (editorForm && dirty) await A().api("/admin/lot_update", { id: id, record: collect(editorForm) });
    var url = isPdf
      ? "/api/admin-lot-document?" + new URLSearchParams({ report: id, title: data.title.trim(), kind: data.kind || "original", redacted: data.kind === "redacted_copy" ? "1" : "0", note: data.note || "" })
      : "/api/admin/lot-image?" + new URLSearchParams({ report: id, title: data.title.trim(), caption: data.caption || "" });
    var res = await fetch(url, { method: "POST", headers: { "Content-Type": file.type, "X-CSRF-Token": A().csrf() }, body: file });
    var out = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(out.error || "Upload failed.");
    dirty = false;
    await A().rerender();
    A().toast((isPdf ? "PDF" : "Image") + " stored privately" + (out.sha256 ? " · SHA-256 " + out.sha256.slice(0, 12) + "…" : "") + ".");
  }
  async function submit(form, data, submitter) {
    var kind = form.dataset.lotOps, id = form.dataset.id, intent = (submitter && submitter.value) || data.intent;
    if (kind === "draft") { dirty = false; return A().opsAction("lot_draft", { product: data.product, lot: data.lot }); }
    if (kind === "update") {
      var rec = collect(form), r = find(id);
      if (intent === "publish") {
        var errors = validate(rec, r, form); showErrors(form, errors);
        if (errors.length) return;
        await A().api("/admin/lot_update", { id: id, record: rec });
        dirty = false;
        return A().opsAction("lot_publish", { id: id, remarks: (data.publish_note || "").trim() });
      }
      dirty = false;
      return A().opsAction("lot_update", { id: id, record: rec });
    }
    if (kind === "discard") { dirty = false; return A().opsAction("lot_discard", { id: id }); }
    if (kind === "withdraw") return A().opsAction("lot_withdraw", { id: id, reason: (data.reason || "").trim() });
    if (kind === "upload") return upload(form, data);
  }

  /* Lot forms are handled here (capture phase) so the shared app handler never processes them twice. */
  document.addEventListener("submit", async function (e) {
    var f = e.target;
    if (!(f instanceof HTMLFormElement) || !f.matches("[data-lot-ops]")) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var btns = [].slice.call(f.querySelectorAll("button")), err = f.querySelector(".op-error");
    if (err) err.textContent = "";
    btns.forEach(function (b) { b.disabled = true; });
    try { await submit(f, Object.fromEntries(new FormData(f)), e.submitter); }
    catch (x) { if (err) err.textContent = x.message; else A().toast(x.message); }
    finally { btns.forEach(function (b) { if (b.isConnected) b.disabled = false; }); }
  }, true);

  document.addEventListener("click", async function (e) {
    var add = e.target.closest("[data-lot-addrow]");
    if (add) {
      var form = add.closest("form"), body = form.querySelector("tbody"), i = body.rows.length;
      body.insertAdjacentHTML("beforeend", resultRow("lr-" + form.dataset.id, i, {}, ""));
      body.rows[i].querySelector("input[name$=parameter]").focus(); dirty = true;
      return;
    }
    var jump = e.target.closest("[data-lot-jump]");
    if (jump) { e.preventDefault(); var el = document.getElementById(jump.dataset.lotJump); if (el) { var det = el.closest("details"); if (det) det.open = true; el.focus(); } return; }
    var rm = e.target.closest("[data-lot-docremove]");
    if (rm) {
      if (!confirm("Remove this document from the draft?")) return;
      try { await A().opsAction("lot_document_remove", { report: rm.dataset.report, id: rm.dataset.lotDocremove }); } catch (x) { A().toast(x.message); }
      return;
    }
    var disc = e.target.closest("[data-lot-discard]");
    if (disc) {
      if (!confirm("Discard this draft and its uploaded documents? Published versions aren’t affected.")) return;
      try { dirty = false; await A().opsAction("lot_discard", { id: disc.dataset.lotDiscard }); } catch (x) { A().toast(x.message); }
    }
  });

  document.addEventListener("change", function (e) {
    var t = e.target;
    var pick = t.closest && t.closest("[data-lot-pick]");
    if (pick) {
      if (dirty && !confirm("Leave this draft? Unsaved changes will be lost.")) { var pv = q().get(pick.dataset.lotPick) || ""; pick.value = pv; return; }
      dirty = false;
      var p = pick.dataset.lotPick === "product" ? t.value : q().get("product"), l = pick.dataset.lotPick === "lot" ? t.value : "";
      A().navigate("/ops/lots" + (p ? "?product=" + encodeURIComponent(p) + (l ? "&lot=" + encodeURIComponent(l) : "") : ""));
      return;
    }
    if (t.matches("[data-lot-pres]")) {
      var form = t.closest("form"), box = form.querySelector('[data-pres-section="' + t.dataset.lotPres + '"]');
      if (box) box.hidden = !t.checked;
      var any = ["show_summary", "show_results", "show_lab", "show_dates"].some(function (k) { var c = form.querySelector('[data-lot-pres="' + k + '"]'); return c && c.checked; });
      var note = form.querySelector("[data-lot-noextra]"); if (note) note.hidden = any;
      dirty = true; return;
    }
    if (t.matches("[data-lot-file]")) {
      var up = t.closest("form"), file = t.files[0], prev = up.querySelector("[data-lot-preview]");
      var isPdf = file && file.type === "application/pdf", isImg = file && /^image\/(jpeg|png|webp)$/.test(file.type);
      up.querySelector('[data-for-kind="pdf"]').hidden = !isPdf; up.querySelector('[data-for-kind="image"]').hidden = !isImg;
      if (prev._url) URL.revokeObjectURL(prev._url);
      prev.hidden = !file;
      if (file) {
        prev._url = isImg ? URL.createObjectURL(file) : "";
        prev.innerHTML = (isImg ? '<img src="' + prev._url + '" alt="Preview of the selected image">' : '<span class="op-doc-icon" aria-hidden="true">' + (isPdf ? "PDF" : "?") + "</span>") + "<p><strong>" + h(file.name) + "</strong><small>" + Math.max(1, Math.round(file.size / 1024)) + " KB" + (!isPdf && !isImg ? " · this file type can’t be uploaded" : "") + "</small></p>";
        var title = up.elements.title; if (!title.value) title.value = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").slice(0, 160);
      }
      return;
    }
    if (t.matches("[data-lot-pdfkind]")) { var red = t.closest("form").querySelector("[data-for-redacted]"); red.hidden = t.value !== "redacted_copy"; return; }
    if (t.closest && t.closest('form[data-lot-ops="update"]')) dirty = true;
  });
  document.addEventListener("input", function (e) { if (e.target.closest && e.target.closest('form[data-lot-ops="update"]')) dirty = true; });
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href]");
    if (!dirty || !a || a.getAttribute("href").charAt(0) === "#" || a.target === "_blank" || !document.querySelector('form[data-lot-ops="update"]')) return;
    if (!confirm("Leave this draft? Unsaved changes will be lost.")) { e.preventDefault(); e.stopImmediatePropagation(); } else dirty = false;
  }, true);
  window.addEventListener("beforeunload", function (e) { if (dirty && document.querySelector('form[data-lot-ops="update"]')) { e.preventDefault(); e.returnValue = ""; } });

  window.BCCLotsOps = { render: render, submit: submit, collect: collect };
})();
