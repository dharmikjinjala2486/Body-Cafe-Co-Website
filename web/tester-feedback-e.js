/* Tester feedback (17 Nov 2026): a Feedback button on every page of Part 2 and Content Focus, for people testing the site.
   It shows only after the site is opened once with ?test=1 (remembered on that device; ?test=0 turns it off), so
   customers never see it. Each page has its own form: the page's name, and a list of that page's sections to pick from.
   The panel shows the newest few notes still open on this page; "See all feedback" opens the full table, every page,
   filtered by page and status (Open, In progress, Resolved), where anyone testing can move a note along like a bug.
   Notes are saved and read through /api/tester-feedback (app/server.py locally, core.js on the live site) and also
   appear in the admin page under Tester feedback. */
(function () {
  var KEY = "bcc-tester", NAME = "bcc-tester-name";
  var get = function (k) { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } };
  var set = function (k, v) { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch (e) {} };
  var asked = new URLSearchParams(location.search).get("test");
  if (asked === "1") set(KEY, "1"); else if (asked === "0") set(KEY, "");
  if (get(KEY) !== "1" || location.pathname.indexOf("/ops") === 0) return;

  var STATUS = [["open", "Open"], ["in_progress", "In progress"], ["resolved", "Resolved"]], RECENT = 3;
  var el = function (tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  var when = function (t) { return new Date(t * 1000).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }); };
  var pathOf = function (p) { return String(p || "").split("?")[0]; };
  var label = function (s) { return (STATUS.filter(function (x) { return x[0] === s; })[0] || STATUS[0])[1]; };

  var box = el("div", "tf");
  var X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
  box.innerHTML =
    '<button type="button" class="tf-open" aria-expanded="false" aria-controls="tf-panel"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg><span>Feedback</span><b class="tf-badge" hidden></b></button>' +
    '<form class="tf-panel" id="tf-panel" hidden novalidate>' +
    '<div class="tf-head"><div><p class="tf-eyebrow">Feedback</p><p class="tf-title"><span class="tf-page"></span></p></div><button type="button" class="tf-x tf-close" aria-label="Close feedback">' + X + '</button></div>' +
    '<div class="tf-others" aria-live="polite"></div>' +
    '<button type="button" class="tf-all"><span></span><i aria-hidden="true">→</i></button>' +
    '<p class="tf-eyebrow tf-new">Add a note</p>' +
    '<label for="tf-section">Which part of the page?</label>' +
    '<select id="tf-section" name="section"></select>' +
    '<label for="tf-note">What did you notice?</label>' +
    '<textarea id="tf-note" name="note" rows="3" maxlength="2000" required placeholder="A problem, something confusing, or an idea"></textarea>' +
    '<label for="tf-name">Your name (optional)</label>' +
    '<input id="tf-name" name="name" maxlength="60" autocomplete="name">' +
    '<p class="tf-msg" role="status"></p>' +
    '<button type="submit" class="tf-send">Send note</button>' +
    "</form>" +
    '<dialog class="tf-board" aria-labelledby="tf-board-title">' +
    '<div class="tf-board-head"><div><p class="tf-eyebrow">Tester feedback</p><h2 id="tf-board-title">All feedback</h2></div><button type="button" class="tf-x tf-board-close" aria-label="Close all feedback">' + X + '</button></div>' +
    '<div class="tf-filters"><div class="tf-seg" role="group" aria-label="Filter by status"></div><label class="tf-f-pagewrap"><span>Page</span><select class="tf-f-page"></select></label></div>' +
    '<div class="tf-board-body"></div>' +
    "</dialog>";
  document.body.appendChild(box);

  var open = box.querySelector(".tf-open"), panel = box.querySelector(".tf-panel"), note = panel.elements.note, name = panel.elements.name,
    msg = box.querySelector(".tf-msg"), send = box.querySelector(".tf-send"), section = panel.elements.section, pageName = box.querySelector(".tf-page"),
    others = box.querySelector(".tf-others"), all = box.querySelector(".tf-all"), board = box.querySelector(".tf-board"),
    fPage = box.querySelector(".tf-f-page"), seg = box.querySelector(".tf-seg"), body = box.querySelector(".tf-board-body"), badge = box.querySelector(".tf-badge"), fStatus = "";
  var notes = [];
  name.value = get(NAME);

  /* Each page gets its own form: its name in the title, and its own sections (the page's visible headings) to choose from. */
  function fit() {
    var was = section.value, seen = {}, list = ["Whole page", "Top of the page"];
    [].forEach.call(document.querySelectorAll("#main h2"), function (h) {
      var t = h.textContent.replace(/#\s*$/, "").replace(/\s+/g, " ").trim().slice(0, 80);
      if (t && h.getBoundingClientRect().height > 1 && !seen[t] && list.length < 32) { seen[t] = 1; list.push(t); }
    });
    list.push("Header and menu", "Footer");
    section.textContent = "";
    list.forEach(function (t) { section.appendChild(el("option", "", t)); });
    if (list.indexOf(was) > -1) section.value = was;
    pageName.textContent = (document.title.split(" — ")[0] || "this page").trim();
  }

  /* The panel: how many notes on this page are still open, and the newest few of them. */
  function drawPanel() {
    var here = notes.filter(function (n) { return pathOf(n.page) === location.pathname; }), todo = here.filter(function (n) { return n.status !== "resolved"; });
    badge.hidden = !todo.length; badge.textContent = todo.length;
    open.setAttribute("aria-label", "Feedback" + (todo.length ? ", " + todo.length + " open on this page" : ""));
    others.textContent = "";
    others.appendChild(el("p", "tf-others-h", !here.length ? "No notes on this page yet. Be the first." : todo.length ? "Open on this page · " + todo.length : "Everything on this page is resolved."));
    todo.slice(0, RECENT).forEach(function (n) {
      var item = el("div", "tf-note is-" + n.status), who = el("small");
      who.appendChild(el("i", "tf-dot")); who.appendChild(document.createTextNode((n.name || "No name") + " · " + (n.section || "Whole page")));
      item.appendChild(who); item.appendChild(el("p", "", n.note));
      others.appendChild(item);
    });
    all.firstChild.textContent = notes.length ? "See all feedback (" + notes.length + ")" : "See all feedback";
  }

  /* The table: every note, filtered by page and status. */
  function drawFilters() {
    var was = fPage.value, pages = [], seen = {};
    notes.forEach(function (n) { var p = pathOf(n.page); if (!seen[p]) { seen[p] = 1; pages.push([p, n.page_name || p]); } });
    fPage.textContent = "";
    [["", "All pages"]].concat(pages).forEach(function (p) { var o = el("option", "", p[1]); o.value = p[0]; fPage.appendChild(o); });
    fPage.value = seen[was] || was === "" ? was : "";
  }
  function drawBoard() {
    var onPage = notes.filter(function (n) { return !fPage.value || pathOf(n.page) === fPage.value; });
    var rows = onPage.filter(function (n) { return !fStatus || n.status === fStatus; });
    seg.textContent = "";
    [["", "All"]].concat(STATUS).forEach(function (s) {
      var b = el("button", "tf-seg-b" + (s[0] ? " is-" + s[0] : "")); b.type = "button"; b.setAttribute("aria-pressed", String(fStatus === s[0]));
      if (s[0]) b.appendChild(el("i", "tf-dot"));
      b.appendChild(document.createTextNode(s[1])); b.appendChild(el("b", "", String(onPage.filter(function (n) { return !s[0] || n.status === s[0]; }).length)));
      b.addEventListener("click", function () { fStatus = s[0]; drawBoard(); });
      seg.appendChild(b);
    });
    body.textContent = "";
    if (!rows.length) { body.appendChild(el("p", "tf-empty", notes.length ? "Nothing here. Try another status or page." : "No feedback yet. Notes your team leaves will appear here.")); return; }
    var table = el("table", "tf-table"), head = el("tr"), COLS = ["Status", "Note", "Page", "From"];
    COLS.forEach(function (t) { var th = el("th", "", t); th.scope = "col"; head.appendChild(th); });
    table.appendChild(el("thead")).appendChild(head);
    var tb = table.appendChild(el("tbody"));
    rows.forEach(function (n) {
      var tr = el("tr", "is-" + n.status), pick = el("select", "tf-status");
      pick.setAttribute("aria-label", "Status of this note");
      STATUS.forEach(function (s) { var o = el("option", "", s[1]); o.value = s[0]; pick.appendChild(o); });
      pick.value = n.status;
      pick.addEventListener("change", function () {
        var to = pick.value; pick.disabled = true;
        window.BCCApp.api("/tester-feedback/status", { id: n.id, status: to }).then(function () { n.status = to; drawPanel(); drawBoard(); })
          .catch(function () { pick.value = n.status; pick.disabled = false; });
      });
      var noteCell = el("div"); noteCell.appendChild(el("span", "tf-chip", n.section || "Whole page")); noteCell.appendChild(el("p", "", n.note));
      var link = el("a", "", n.page_name || pathOf(n.page)); link.href = n.page;
      var from = el("div", "tf-from"), who = n.name || "No name"; from.appendChild(el("i", "tf-avatar", n.name ? n.name.trim().charAt(0).toUpperCase() : "?"));
      var fw = el("div"); fw.appendChild(el("b", "", who)); fw.appendChild(el("small", "", when(n.created))); from.appendChild(fw);
      [pick, noteCell, link, from].forEach(function (v, i) {
        var td = el("td", "tf-td-" + i); td.setAttribute("data-label", COLS[i]); td.appendChild(v); tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    body.appendChild(table);
  }

  function load() {
    return window.BCCApp.api("/tester-feedback").then(function (r) {
      notes = (r && r.notes) || [];
      drawPanel(); if (board.open) { drawFilters(); drawBoard(); }
    }).catch(function () { notes = []; drawPanel(); });
  }
  var title = document.querySelector("title");
  if (title && "MutationObserver" in window) new MutationObserver(function () { drawPanel(); if (!panel.hidden) fit(); }).observe(title, { childList: true, characterData: true, subtree: true });

  function show(on) {
    panel.hidden = !on; open.setAttribute("aria-expanded", String(on));
    if (on) { fit(); load(); msg.textContent = ""; msg.classList.remove("is-bad"); note.focus(); } else open.focus();
  }
  open.addEventListener("click", function () { show(panel.hidden); });
  box.querySelector(".tf-close").addEventListener("click", function () { show(false); });
  panel.addEventListener("keydown", function (e) { if (e.key === "Escape") show(false); });
  all.addEventListener("click", function () {
    drawFilters(); fPage.value = notes.some(function (n) { return pathOf(n.page) === location.pathname; }) ? location.pathname : "";
    fStatus = ""; drawBoard(); board.showModal(); load();
  });
  box.querySelector(".tf-board-close").addEventListener("click", function () { board.close(); });
  board.addEventListener("click", function (e) { if (e.target === board) board.close(); });
  fPage.addEventListener("change", drawBoard);

  panel.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = note.value.trim();
    msg.classList.remove("is-bad");
    if (text.length < 3) { msg.textContent = "Write a few words first."; msg.classList.add("is-bad"); note.focus(); return; }
    var q = new URLSearchParams(location.search); q.delete("test");
    var page = (location.pathname + (q.toString() ? "?" + q : "")).slice(0, 200);
    send.disabled = true; msg.textContent = "Sending…";
    window.BCCApp.api("/tester-feedback", {
      note: text, name: name.value.trim(), page: page, page_name: pageName.textContent.slice(0, 80), section: section.value,
      design: document.body.dataset.contentFocus === "1" ? "Content Focus" : "Part 2", screen: innerWidth + "×" + innerHeight
    }).then(function () {
      set(NAME, name.value.trim()); note.value = ""; msg.textContent = "Saved. Thank you.";
      load();
    }).catch(function (err) {
      msg.textContent = (err && err.message) || "That didn’t save. Please try again."; msg.classList.add("is-bad");
    }).then(function () { send.disabled = false; });
  });
  /* The app is a module and starts after this script: wait for it, then show this page's count on the button. */
  (function wait(n) { if (window.BCCApp) load(); else if (n) setTimeout(function () { wait(n - 1); }, 300); })(40);
})();
