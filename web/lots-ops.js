/* Body Café Co. — Operations: lot-report publication workflow (Operations › Lot reports).

   Draft a version for a product-and-lot in the batch register → attach the laboratory PDF (checked from its bytes,
   hashed, stored privately) → transcribe exactly as reported → submit. A different Admin approves or rejects it in
   Approvals. Corrections are new versions; withdrawals and batch notices are two-person requests too. Viewers see
   everything read-only. Nothing here is public until its version is published. */
(function () {
  "use strict";
  function h(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function b(t, k) { return '<span class="badge ' + (k || "") + '">' + h(t) + "</span>"; }
  function when(n) { return n ? new Date(n * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"; }
  var SAMPLE = [["", "Choose…"], ["finished_product", "Finished product"], ["raw_material", "Raw ingredient"], ["other", "Other specified material"]];
  var COVERS = [["", "Not stated"], ["all", "Covers all reported tests"], ["some", "Covers some reported tests"], ["none", "Covers none of the reported tests"], ["unknown", "Not confirmed"]];
  var ASSESS = [["not_assessed", "Not assessed"], ["meets", "Meets"], ["does_not_meet", "Does not meet"]];
  var KINDS = [["original", "Original document"], ["redacted_copy", "Authorised redacted public copy"], ["amendment", "Amendment from the laboratory"]];
  var NOTICE = [["restriction", "Release restriction"], ["withdrawal", "Batch withdrawal"], ["instruction", "Instruction for this batch"]];
  var STATE = { draft: ["Draft", ""], in_review: ["Awaiting approval", "warning"], published: ["Published", "success"], superseded: ["Superseded", ""], withdrawn: ["Withdrawn", "warning"] };

  function opts(list, v) { return list.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === (v || "") ? " selected" : "") + ">" + h(o[1]) + "</option>"; }).join(""); }
  function field(id, name, label, v, attrs) { return '<div class="lot-f"><label for="' + id + '">' + label + '</label><input id="' + id + '" name="' + name + '" value="' + h(v || "") + '"' + (attrs || "") + "></div>"; }
  function area(id, name, label, v, n) { return '<label for="' + id + '">' + label + '</label><textarea id="' + id + '" name="' + name + '" maxlength="' + (n || 1500) + '">' + h(v || "") + "</textarea>"; }
  function sel(id, name, label, list, v) { return '<div class="lot-f"><label for="' + id + '">' + label + '</label><select id="' + id + '" name="' + name + '">' + opts(list, v) + "</select></div>"; }
  function names(o) { var m = {}; (window.BCCApp.catalog() || []).forEach(function (p) { m[p.id] = p.name; }); return m; }

  function resultRow(id, i, r, dis) {
    r = r || {};
    var cell = function (k, label, w) { return '<td><label class="sr-only" for="' + id + "-r" + i + "-" + k + '">' + label + " (row " + (i + 1) + ')</label><input id="' + id + "-r" + i + "-" + k + '" name="r.' + i + "." + k + '" value="' + h(r[k] || "") + '"' + (w ? ' size="' + w + '"' : "") + dis + "></td>"; };
    return '<tr data-lot-row="' + i + '">' + cell("group", "Group", 8) + cell("parameter", "Test", 14) + cell("result", "Result as reported", 9) + cell("unit", "Unit", 6) + cell("spec", "Specification", 10) + cell("spec_source", "Specification source", 10) + cell("method", "Method", 10) +
      '<td><label class="sr-only" for="' + id + "-r" + i + '-assessment">Assessment (row ' + (i + 1) + ')</label><select id="' + id + "-r" + i + '-assessment" name="r.' + i + '.assessment"' + dis + ">" + opts(ASSESS, r.assessment) + "</select></td>" + cell("ref", "Source reference", 6) + cell("note", "Note", 10) + "</tr>";
  }
  function editor(r, dis) {
    var d = r.record || {}, id = "lr-" + r.id, dt = d.dates || {}, lab = d.lab || {}, acc = lab.accreditation || {}, smp = d.sample || {};
    var rows = (d.results || []).concat([{}]);
    return '<details class="lot-edit"><summary>Edit transcription</summary><form class="form-panel lot-form" data-lot-ops="update" data-id="' + h(r.id) + '"><fieldset' + dis + '><legend>Identity and dates</legend><div class="lot-grid">' +
      field(id + "-fv", "formulation_version", "Formulation / product version", d.formulation_version) + field(id + "-mf", "manufactured", "Manufactured (YYYY-MM[-DD])", d.manufactured) + field(id + "-ex", "expiry", "Expiry (YYYY-MM[-DD])", d.expiry) +
      field(id + "-rn", "lab_report_no", "Laboratory report number", d.lab_report_no) + field(id + "-sr", "lab_sample_ref", "Laboratory sample reference", d.lab_sample_ref) +
      sel(id + "-st", "sample.type", "Material tested", SAMPLE, smp.type) + field(id + "-sd", "sample.description", "Sample description, as on the report", smp.description) +
      field(id + "-ds", "dates.sampled", "Sampled", dt.sampled) + field(id + "-dr", "dates.received", "Received by laboratory", dt.received) + field(id + "-df", "dates.tested_from", "Testing started", dt.tested_from) + field(id + "-dt", "dates.tested_to", "Testing finished", dt.tested_to) + field(id + "-di", "dates.issued", "Report issued", dt.issued) +
      field(id + "-cb", "commissioned_by", "Commissioned / submitted by", d.commissioned_by) + "</div></fieldset>" +
      "<fieldset" + dis + "><legend>Issuing laboratory</legend><div class=\"lot-grid\">" + field(id + "-ln", "lab.name", "Laboratory name", lab.name) + field(id + "-la", "lab.address", "Address", lab.address) +
      field(id + "-ab", "acc.body", "Accreditation body", acc.body) + field(id + "-ac", "acc.certificate", "Certificate / reference", acc.certificate) + field(id + "-vf", "acc.valid_from", "Valid from", acc.valid_from) + field(id + "-vt", "acc.valid_to", "Valid to", acc.valid_to) +
      field(id + "-vu", "acc.verify_url", "Official verification link (https)", acc.verify_url) + sel(id + "-cv", "acc.covers", "Does the scope cover these tests?", COVERS, acc.covers) + "</div>" + area(id + "-as", "acc.scope", "Accreditation scope, as stated", acc.scope, 600) + "</fieldset>" +
      "<fieldset" + dis + '><legend>Results, exactly as reported</legend><p class="micro">Type results as the laboratory wrote them, including &lt;, &gt;, “ND”, ranges and words. An assessment needs both the specification and its source.</p><div class="table-scroll"><table class="lot-results"><thead><tr><th>Group</th><th>Test</th><th>Result</th><th>Unit</th><th>Specification</th><th>Spec. source</th><th>Method</th><th>Assessment</th><th>Ref.</th><th>Note</th></tr></thead><tbody>' +
      rows.map(function (x, i) { return resultRow(id, i, x, dis); }).join("") + '</tbody></table></div><button type="button" class="small-button" data-lot-addrow' + dis + ">Add a row</button></fieldset>" +
      "<fieldset" + dis + "><legend>Plain-language summary and notes</legend>" + area(id + "-su", "summary", "Reviewed plain-language summary (shown first)", d.summary) + area(id + "-nt", "lab_notes", "Laboratory notes, verbatim", d.lab_notes) +
      area(id + "-pa", "partial", "If only part of the report is published, say what's missing", d.partial, 600) + (r.version > 1 ? area(id + "-cn", "change_note", "What changed from the previous version, and why (public)", d.change_note, 600) : "") + "</fieldset>" +
      '<div class="form-error" role="alert"></div><button class="small-button"' + dis + ">Save draft</button></form></details>";
  }
  function docs(r, dis) {
    var list = (r.documents || []).map(function (d) {
      return "<li><strong>" + h(d.title) + "</strong> · " + h({ original: "Original", redacted_copy: "Redacted copy", amendment: "Amendment" }[d.kind] || d.kind) + " · " + Math.max(1, Math.round(d.bytes / 1024)) + ' KB · <code title="SHA-256">' + h(d.sha256.slice(0, 12)) + '…</code> <a class="small-link" href="/api/lots/documents/' + h(d.id) + '" target="_blank" rel="noopener">Open</a>' +
        (r.state === "draft" ? ' <button type="button" class="small-button" data-lot-docremove="' + h(d.id) + '" data-report="' + h(r.id) + '"' + dis + ">Remove</button>" : "") + (d.redaction_note ? "<small>Redaction: " + h(d.redaction_note) + "</small>" : "") + "</li>";
    }).join("");
    var up = r.state === "draft" ? '<form class="form-panel lot-form lot-upload" data-lot-ops="upload" data-id="' + h(r.id) + '"><fieldset' + dis + '><legend>Attach a laboratory document</legend><div class="lot-grid">' +
      '<div class="lot-f"><label for="up-' + h(r.id) + '">PDF (max 15 MB)</label><input id="up-' + h(r.id) + '" name="file" type="file" accept="application/pdf" required></div>' + field("upt-" + r.id, "title", "Document title", "", ' required maxlength="160"') + sel("upk-" + r.id, "kind", "This file is", KINDS, "original") +
      '</div><label for="upn-' + h(r.id) + '">If redacted: what was removed and why (shown publicly)</label><input id="upn-' + h(r.id) + '" name="note" maxlength="400"></fieldset><div class="form-error" role="alert"></div><button class="small-button"' + dis + ">Upload privately</button></form>" : "";
    return '<div class="lot-docs"><h4>Documents</h4>' + (list ? "<ul>" + list + "</ul>" : '<p class="micro">No document attached.</p>') + up + "</div>";
  }
  function card(r, o, dis, nm) {
    var s = STATE[r.state] || [r.state, ""];
    var pending = (o.approvals || []).filter(function (a) { return a.target === r.id && a.state === "pending"; })[0];
    var actions = "";
    if (r.state === "draft") actions = '<form class="lot-inline" data-lot-ops="submit" data-id="' + h(r.id) + '"><div class="form-error" role="alert"></div><button class="small-button"' + dis + '>Submit for review</button></form><form class="lot-inline" data-lot-ops="discard" data-id="' + h(r.id) + '"><div class="form-error" role="alert"></div><button class="small-button"' + dis + ">Discard draft</button></form>";
    if (r.state === "published") actions = '<form class="lot-inline" data-lot-ops="draft"><input type="hidden" name="product" value="' + h(r.product) + '"><input type="hidden" name="lot" value="' + h(r.lot) + '"><div class="form-error" role="alert"></div><button class="small-button"' + dis + '>Start a corrected version</button></form>' +
      (pending ? b("Withdrawal awaiting approval", "warning") : '<form class="lot-inline" data-lot-ops="withdraw" data-id="' + h(r.id) + '"><label for="wd-' + h(r.id) + '">Public reason for withdrawal</label><input id="wd-' + h(r.id) + '" name="reason" minlength="10" maxlength="600" required' + dis + '><div class="form-error" role="alert"></div><button class="small-button"' + dis + ">Request withdrawal</button></form>");
    if (r.state === "in_review") actions = '<p class="micro">A different Admin approves or returns it in <a href="/ops/approvals">Approvals</a>.</p>';
    return '<article class="lot-card"><header><p class="kicker">' + h(nm[r.product] || r.product) + " · " + h(r.lot) + (r.lot.toUpperCase().indexOf("DEMO-") === 0 ? " · demonstration lot" : "") + "</p><h3>Version " + r.version + " " + b(s[0], s[1]) + "</h3>" +
      '<p class="micro">Drafted by ' + h(r.created_by) + " " + when(r.created) + (r.submitted_by ? " · submitted by " + h(r.submitted_by) : "") + (r.approved_by ? " · approved by " + h(r.approved_by) + " " + when(r.published) : "") + (r.withdrawn_reason ? " · withdrawn: " + h(r.withdrawn_reason) : "") + (r.review_note ? " · " + h(r.review_note) : "") + "</p></header>" +
      (r.state === "draft" ? editor(r, dis) : "") + docs(r, dis) + '<div class="lot-actions">' + actions + '<a class="small-link" href="/reports/' + encodeURIComponent(r.product) + "/" + encodeURIComponent(r.lot) + '">Public record</a></div></article>';
  }
  function render(o, viewer) {
    var dis = viewer ? " disabled" : "", nm = names(), reports = o.lot_reports || [], notices = o.lot_notices || [];
    var batches = (o.batches || []).map(function (x) { return [x.id, x.id + " · " + (nm[x.product] || x.product)]; });
    return '<p>Reports are published only after a different Admin approves them. Uploaded PDFs are checked from their bytes, fingerprinted and stored privately until their version is published. Corrections create a new version; the previous one stays public as superseded, with the reason. Quarantine (Inventory) stays internal: customers see a batch notice only once one is approved here.</p>' +
      '<div class="lot-start"><form class="form-panel lot-form" data-lot-ops="draft"><fieldset' + dis + '><legend>Start a report version</legend><div class="lot-grid">' + sel("lot-new-p", "product", "Product", [["", "Choose…"]].concat((window.BCCApp.catalog() || []).map(function (p) { return [p.id, p.name]; })), "") +
      sel("lot-new-l", "lot", "Lot (from the batch register)", [["", "Choose…"]].concat(batches), "") + '</div></fieldset><div class="form-error" role="alert"></div><button class="small-button"' + dis + ">Create draft</button></form>" +
      '<form class="form-panel lot-form" data-lot-ops="notice"><fieldset' + dis + '><legend>Request a batch notice</legend><p class="micro">Only for a confirmed restriction, withdrawal or instruction. A second Admin must approve it before it appears on the lot record.</p><div class="lot-grid">' +
      sel("lot-n-p", "product", "Product", [["", "Choose…"]].concat((window.BCCApp.catalog() || []).map(function (p) { return [p.id, p.name]; })), "") + sel("lot-n-l", "lot", "Lot", [["", "Choose…"]].concat(batches), "") + sel("lot-n-k", "kind", "Kind", NOTICE, "restriction") + field("lot-n-t", "title", "Title", "", ' maxlength="160" required') + "</div>" +
      area("lot-n-b", "body", "Approved customer instructions", "", 2000) + '</fieldset><div class="form-error" role="alert"></div><button class="small-button"' + dis + ">Request notice</button></form></div>" +
      "<h2>Report versions</h2>" + (reports.length ? reports.map(function (r) { return card(r, o, dis, nm); }).join("") : '<p class="micro">No report versions yet. Laboratory documents haven’t been supplied for any lot.</p>') +
      "<h2>Batch notices</h2>" + (notices.length ? '<div class="table-scroll"><table><thead><tr><th>Lot</th><th>Notice</th><th>State</th><th>Action</th></tr></thead><tbody>' + notices.map(function (n) {
        return "<tr><td>" + h(n.lot) + "<small>" + h(nm[n.product] || n.product) + "</small></td><td><strong>" + h(n.title) + "</strong><small>" + h(n.body) + "</small></td><td>" + b(n.state, n.state === "active" ? "warning" : "") + "<small>approved by " + h(n.approved_by || "—") + "</small></td><td>" +
          (n.state === "active" ? '<form class="lot-inline" data-lot-ops="retire" data-id="' + h(n.id) + '"><label for="rt-' + h(n.id) + '">Reason</label><input id="rt-' + h(n.id) + '" name="reason" minlength="10" maxlength="600" required' + dis + '><div class="form-error" role="alert"></div><button class="small-button"' + dis + ">Request retirement</button></form>" : h(n.retired_reason || "")) + "</td></tr>";
      }).join("") + "</tbody></table></div>" : '<p class="micro">No batch notices.</p>') +
      '<p class="micro">Report-availability alerts need a notification service, which isn’t connected, so no subscription is offered to customers.</p>';
  }
  function collect(form) {
    var rec = { sample: {}, dates: {}, lab: { accreditation: {} }, results: [] };
    var rows = {};
    [].slice.call(form.elements).forEach(function (el) {
      if (!el.name || el.type === "button" || el.type === "submit") return;
      var n = el.name, v = el.value;
      var m = n.match(/^r\.(\d+)\.(\w+)$/);
      if (m) { (rows[m[1]] = rows[m[1]] || {})[m[2]] = v; return; }
      if (n.indexOf("acc.") === 0) rec.lab.accreditation[n.slice(4)] = v;
      else if (n.indexOf("lab.") === 0) rec.lab[n.slice(4)] = v;
      else if (n.indexOf("sample.") === 0) rec.sample[n.slice(7)] = v;
      else if (n.indexOf("dates.") === 0) rec.dates[n.slice(6)] = v;
      else rec[n] = v;
    });
    rec.results = Object.keys(rows).sort(function (a, b) { return a - b; }).map(function (k) { return rows[k]; }).filter(function (r) { return Object.keys(r).some(function (k) { return k !== "assessment" && r[k]; }); });
    return rec;
  }
  async function submit(form, data) {
    var A = window.BCCApp, kind = form.dataset.lotOps, id = form.dataset.id;
    if (kind === "draft") return A.opsAction("lot_draft", { product: data.product, lot: data.lot });
    if (kind === "update") return A.opsAction("lot_update", { id: id, record: collect(form) });
    if (kind === "submit") return A.opsAction("lot_submit", { id: id });
    if (kind === "discard") return A.opsAction("lot_discard", { id: id });
    if (kind === "withdraw") return A.opsAction("lot_withdraw_request", { id: id, reason: data.reason });
    if (kind === "notice") return A.opsAction("lot_notice_request", { product: data.product, lot: data.lot, kind: data.kind, title: data.title, body: data.body });
    if (kind === "retire") return A.opsAction("lot_notice_retire_request", { id: id, reason: data.reason });
    if (kind === "upload") {
      var file = form.elements.file.files[0];
      if (!file) throw new Error("Choose a PDF.");
      var q = new URLSearchParams({ report: id, title: data.title || "", kind: data.kind || "", redacted: data.kind === "redacted_copy" ? "1" : "0", note: data.note || "" });
      var res = await fetch("/api/admin-lot-document?" + q, { method: "POST", headers: { "Content-Type": "application/pdf", "X-CSRF-Token": A.csrf() }, body: file });
      var out = await res.json();
      if (!res.ok) throw new Error(out.error || "Upload failed.");
      await A.rerender();
      A.toast("Document stored privately. SHA-256 " + out.sha256.slice(0, 12) + "…");
    }
  }
  document.addEventListener("click", async function (e) {
    var add = e.target.closest("[data-lot-addrow]");
    if (add) {
      var body = add.closest("fieldset").querySelector("tbody"), form = add.closest("form"), i = body.rows.length;
      body.insertAdjacentHTML("beforeend", resultRow("lr-" + form.dataset.id, i, {}, ""));
      body.rows[i].querySelector("input[name$=parameter]").focus();
      return;
    }
    var rm = e.target.closest("[data-lot-docremove]");
    if (rm) {
      try { await window.BCCApp.opsAction("lot_document_remove", { report: rm.dataset.report, id: rm.dataset.lotDocremove }); }
      catch (err) { window.BCCApp.toast(err.message); }
    }
  });
  window.BCCLotsOps = { render: render, submit: submit, collect: collect };
})();
