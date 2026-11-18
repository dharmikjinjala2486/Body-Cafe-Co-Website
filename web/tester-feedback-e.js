/* Tester feedback (17 Nov 2026): a Feedback button on every page of Part 2 and Content Focus, for people testing the site.
   It shows only after the site is opened once with ?test=1 (remembered on that device; ?test=0 turns it off), so
   customers never see it. Each page has its own form: the page's name, and a text field for the part of the page the note is about.
   The panel shows the newest few notes still open on this page; "See all feedback" opens the full table for this page
   only (18 Nov 2026, owner: a page shows its own notes, never another page's), filtered by status (Open, In progress,
   Resolved), where anyone testing can move a note along like a bug. Every page's notes together are in the admin page.
   A note can also be pinned to a spot on the page, like a comment on a PDF: see "Comments pinned to the page" below.
   Notes are saved and read through /api/tester-feedback (app/server.py locally, core.js on the live site) and also
   appear in the admin page under Tester feedback. */
(function () {
  var KEY = "bcc-tester", NAME = "bcc-tester-name", SHOW = "bcc-tester-pins";
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
    '<button type="button" class="tf-pinmode"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.2"/></svg><span><b>Comment on the page</b><small>Click any part, or highlight text first</small></span></button>' +
    '<label class="tf-toggle"><input type="checkbox" class="tf-showpins"><span>Show comments on the page</span></label>' +
    '<p class="tf-eyebrow tf-new">Or add a general note</p>' +
    '<label for="tf-section">Which part of the page?</label>' +
    '<input id="tf-section" name="section" maxlength="80" autocomplete="off" placeholder="For example: Header, pack cards, footer">' +
    '<label for="tf-note">What did you notice?</label>' +
    '<textarea id="tf-note" name="note" rows="3" maxlength="2000" required placeholder="A problem, something confusing, or an idea"></textarea>' +
    '<label for="tf-name">Your name (optional)</label>' +
    '<input id="tf-name" name="name" maxlength="60" autocomplete="name">' +
    '<p class="tf-msg" role="status"></p>' +
    '<button type="submit" class="tf-send">Send note</button>' +
    "</form>" +
    '<dialog class="tf-board" aria-labelledby="tf-board-title">' +
    '<div class="tf-board-head"><div><p class="tf-eyebrow tf-board-page"></p><h2 id="tf-board-title">Feedback on this page</h2></div><button type="button" class="tf-x tf-board-close" aria-label="Close all feedback">' + X + '</button></div>' +
    '<div class="tf-filters"><div class="tf-seg" role="group" aria-label="Filter by status"></div></div>' +
    '<div class="tf-board-body"></div>' +
    "</dialog>";
  document.body.appendChild(box);

  var open = box.querySelector(".tf-open"), panel = box.querySelector(".tf-panel"), note = panel.elements.note, name = panel.elements.name,
    msg = box.querySelector(".tf-msg"), send = box.querySelector(".tf-send"), section = panel.elements.section, pageName = box.querySelector(".tf-page"),
    others = box.querySelector(".tf-others"), all = box.querySelector(".tf-all"), board = box.querySelector(".tf-board"),
    seg = box.querySelector(".tf-seg"), body = box.querySelector(".tf-board-body"), badge = box.querySelector(".tf-badge"), fStatus = "";
  var notes = [];
  name.value = get(NAME);
  var design = function () { return document.body.dataset.contentFocus === "1" ? "Content Focus" : "Part 2"; };
  var pageTitle = function () { return (document.title.split(" — ")[0] || "this page").trim(); };

  /* Each page gets its own form: its name in the title. The part of the page is typed (18 Nov 2026, owner; it was a
     list of the page's headings); left empty, the note is about the whole page. */
  var at = location.pathname;
  function fit() {
    if (at !== location.pathname) { at = location.pathname; section.value = ""; }
    pageName.textContent = pageTitle();
  }

  function onThisPage() { return notes.filter(function (n) { return pathOf(n.page) === location.pathname; }); }
  /* The panel: how many notes on this page are still open, and the newest few of them. */
  function drawPanel() {
    var here = onThisPage(), todo = here.filter(function (n) { return n.status !== "resolved"; });
    badge.hidden = !todo.length; badge.textContent = todo.length;
    open.setAttribute("aria-label", "Feedback" + (todo.length ? ", " + todo.length + " open on this page" : ""));
    others.textContent = "";
    others.appendChild(el("p", "tf-others-h", !here.length ? "No notes on this page yet. Be the first." : todo.length ? "Open on this page · " + todo.length : "Everything on this page is resolved."));
    todo.slice(0, RECENT).forEach(function (n) {
      var item = el("div", "tf-note is-" + n.status), who = el("small");
      who.appendChild(el("i", "tf-dot")); who.appendChild(document.createTextNode((n.name || "No name") + " · " + (n.section || "Whole page")));
      item.appendChild(who);
      if (n.pin && n.pin.hl && n.pin.text) item.appendChild(el("blockquote", "tf-quote", n.pin.text));
      item.appendChild(el("p", "", n.note));
      if (n.pin && pins[n.id]) {
        who.insertBefore(el("b", "tf-no", String(n.no)), who.firstChild); item.classList.add("is-pinned"); item.tabIndex = 0; item.setAttribute("role", "button");
        item.addEventListener("click", function () { go(n.id); });
        item.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(n.id); } });
      }
      others.appendChild(item);
    });
    if (lost) others.appendChild(el("p", "tf-lost", lost + (lost === 1 ? " pinned comment has" : " pinned comments have") + " lost its place because the page changed. Find " + (lost === 1 ? "it" : "them") + " in the list below."));
    all.firstChild.textContent = here.length ? "See all feedback on this page (" + here.length + ")" : "See all feedback on this page";
  }

  /* The table: every note on this page, filtered by status. */
  function drawBoard() {
    var onPage = onThisPage();
    box.querySelector(".tf-board-page").textContent = pageTitle();
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
    if (!rows.length) { body.appendChild(el("p", "tf-empty", onPage.length ? "Nothing with this status on this page." : "No feedback on this page yet. Notes your team leaves here will appear.")); return; }
    var table = el("table", "tf-table"), head = el("tr"), COLS = ["Status", "Note", "From"];
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
      var noteCell = el("div"); noteCell.appendChild(el("span", "tf-chip", n.section || "Whole page"));
      if (n.pin) noteCell.appendChild(el("span", "tf-chip tf-chip-pin", "Pinned"));
      if (n.pin && n.pin.hl && n.pin.text) noteCell.appendChild(el("blockquote", "tf-quote", n.pin.text));
      noteCell.appendChild(el("p", "", n.note));
      if (n.pin && pins[n.id]) {
        var see = el("button", "tf-see", "Show on the page"); see.type = "button";
        see.addEventListener("click", function () { board.close(); go(n.id); });
        noteCell.appendChild(see);
      }
      var from = el("div", "tf-from"), who = n.name || "No name"; from.appendChild(el("i", "tf-avatar", n.name ? n.name.trim().charAt(0).toUpperCase() : "?"));
      var fw = el("div"); fw.appendChild(el("b", "", who)); fw.appendChild(el("small", "", when(n.created))); from.appendChild(fw);
      [pick, noteCell, from].forEach(function (v, i) {
        var td = el("td", "tf-td-" + i); td.setAttribute("data-label", COLS[i]); td.appendChild(v); tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    body.appendChild(table);
  }

  function load() {
    return window.BCCApp.api("/tester-feedback").then(function (r) {
      notes = (r && r.notes) || [];
      number(); draw(true);
      drawPanel(); if (board.open) drawBoard();
    }).catch(function () { notes = []; draw(true); drawPanel(); });
  }
  var title = document.querySelector("title");
  if (title && "MutationObserver" in window) new MutationObserver(function () { shut(); draw(true); drawPanel(); if (!panel.hidden) fit(); if (board.open) drawBoard(); }).observe(title, { childList: true, characterData: true, subtree: true });

  function show(on) {
    panel.hidden = !on; open.setAttribute("aria-expanded", String(on));
    if (on) { fit(); load(); msg.textContent = ""; msg.classList.remove("is-bad"); note.focus(); } else open.focus();
  }
  open.addEventListener("click", function () { show(panel.hidden); });
  box.querySelector(".tf-close").addEventListener("click", function () { show(false); });
  panel.addEventListener("keydown", function (e) { if (e.key === "Escape") show(false); });
  all.addEventListener("click", function () {
    fStatus = ""; drawBoard(); board.showModal(); load();
  });
  box.querySelector(".tf-board-close").addEventListener("click", function () { board.close(); });
  board.addEventListener("click", function (e) { if (e.target === board) board.close(); });

  panel.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = note.value.trim();
    msg.classList.remove("is-bad");
    if (text.length < 3) { msg.textContent = "Write a few words first."; msg.classList.add("is-bad"); note.focus(); return; }
    send.disabled = true; msg.textContent = "Sending…";
    post(text, name.value.trim(), section.value.replace(/\s+/g, " ").trim()).then(function () {
      note.value = ""; section.value = ""; msg.textContent = "Saved. Thank you.";
    }).catch(function (err) {
      msg.textContent = (err && err.message) || "That didn’t save. Please try again."; msg.classList.add("is-bad");
    }).then(function () { send.disabled = false; });
  });
  /* Save a note for this page; "pin" is where it sits when it was placed on the page itself. */
  function post(text, who, sec, pin) {
    var q = new URLSearchParams(location.search); q.delete("test");
    var body = { note: text, name: who, page: (location.pathname + (q.toString() ? "?" + q : "")).slice(0, 200), page_name: pageTitle().slice(0, 80), section: sec,
      design: design(), screen: innerWidth + "×" + innerHeight };
    if (pin) body.pin = pin;
    return window.BCCApp.api("/tester-feedback", body).then(function () { set(NAME, who); name.value = who; return load(); });
  }

  /* ---- Comments pinned to the page (18 Nov 2026), like comments on a PDF or a design file. ----
     "Comment on the page" turns on comment mode: click any part of the page, or highlight some text first, and a pin
     drops there with a box for the note. A pin remembers the element it sits on (a selector), where inside it (0 to 1)
     and the words it quotes, never a screen position, so it lands in the same place on a phone and a desktop. Every
     tester sees the pins of notes that are not resolved, for the design they are looking at; highlighted words are
     marked with the CSS Custom Highlight API, which changes nothing in the page. If the element is gone the note
     stays in the list with its quote. */
  var mode = false, draft = null, pins = {}, lost = 0, frame = 0, later = 0;
  var layer = el("div", "tf-pins"), hover = el("div", "tf-hover"), pop = el("div", "tf-pop"), bar = el("div", "tf-bar");
  hover.hidden = pop.hidden = bar.hidden = true;
  bar.innerHTML = '<p><b>Comment mode</b><span>Click any part of the page, or highlight text first.</span></p><button type="button" class="tf-done">Done</button>';
  layer.appendChild(hover); layer.appendChild(pop); document.body.appendChild(layer); box.appendChild(bar);
  var showPins = box.querySelector(".tf-showpins");
  showPins.checked = get(SHOW) !== "0";

  function norm(s) { return String(s || "").replace(/\s+/g, " ").trim(); }
  function clamp(v) { return Math.round(Math.max(0, Math.min(1, v)) * 1000) / 1000; }
  function inside(t) { return !!(t && t.closest && t.closest(".tf, .tf-pins")); }
  function pinned() { return notes.filter(function (n) { return n.pin && pathOf(n.page) === location.pathname && (n.design || "") === design(); }); }
  function number() { pinned().slice().reverse().forEach(function (n, i) { n.no = i + 1; }); }

  /* The element's address: from the nearest ancestor with an id of its own, then tag and position at each step. */
  function path(e) {
    var parts = [];
    for (; e && e.nodeType === 1 && e !== document.body; e = e.parentElement) {
      if (e.id && /^[A-Za-z][\w-]{0,60}$/.test(e.id) && document.querySelectorAll("#" + e.id).length === 1) { parts.unshift("#" + e.id); return parts.join(" > "); }
      var i = 1, s = e; while ((s = s.previousElementSibling)) if (s.localName === e.localName) i++;
      parts.unshift(e.localName + ":nth-of-type(" + i + ")");
    }
    parts.unshift("body");
    return parts.join(" > ");
  }
  /* The smallest element in the page that holds these words. */
  function byText(t) {
    var cur = document.querySelector("#main") || document.body;
    if (t.length < 8 || norm(cur.textContent).indexOf(t) < 0) return null;
    for (;;) {
      var next = null;
      for (var c = cur.firstElementChild; c; c = c.nextElementSibling) if (!inside(c) && norm(c.textContent).indexOf(t) > -1) { next = c; break; }
      if (!next) return cur;
      cur = next;
    }
  }
  /* Where a pin belongs now: its element if it is still there holding the same words, else wherever the words went. */
  function locate(pin) {
    var e = null;
    if (pin.sel) try { e = document.querySelector(pin.sel); } catch (x) {}
    if (e && inside(e)) e = null;
    if (pin.text && !(e && norm(e.textContent).indexOf(pin.text) > -1)) e = byText(pin.text) || e;
    return e;
  }
  /* The highlighted words inside an element, as a range, whatever the spacing between its pieces. */
  function rangeFor(root, text) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), s = "", map = [], node, gap = true;
    while ((node = w.nextNode())) for (var i = 0, d = node.data; i < d.length; i++) {
      if (/\s/.test(d[i])) { if (gap) continue; gap = true; s += " "; } else { gap = false; s += d[i]; }
      map.push([node, i]);
    }
    var at = s.indexOf(text);
    if (at < 0 || !text) return null;
    var a = map[at], b = map[at + text.length - 1], r = document.createRange();
    r.setStart(a[0], a[1]); r.setEnd(b[0], b[1] + 1);
    return r;
  }
  /* Inside something fixed or sticky (the header): such a pin follows the window, not the page. */
  function stuck(e) {
    for (; e && e !== document.body && e.nodeType === 1; e = e.parentElement) { var p = getComputedStyle(e).position; if (p === "fixed" || p === "sticky") return true; }
    return false;
  }
  function paint(ranges) {
    if (!(window.Highlight && window.CSS && CSS.highlights)) return;
    if (draft && draft.range) ranges.push(draft.range);
    if (!ranges.length) { CSS.highlights.delete("tf-hl"); return; }
    var h = new Highlight(); ranges.forEach(function (r) { h.add(r); });
    CSS.highlights.set("tf-hl", h);
  }
  function seatPin(b, x, y, fixed) {
    b.classList.toggle("is-fixed", fixed);
    b.style.left = Math.max(4, Math.min(x, document.documentElement.clientWidth - 34)) + (fixed ? 0 : scrollX) + "px";
    b.style.top = Math.max(34, y) + (fixed ? 0 : scrollY) + "px";
  }
  /* Put every pin where its element is now. "fresh" looks the elements up again (after the page redraws). */
  function draw(fresh) {
    var on = mode || get(SHOW) !== "0", ranges = [], live = {};
    lost = 0;
    if (fresh) number();
    pinned().forEach(function (n) {
      if (n.status === "resolved" || !on) return;
      if (fresh || !n._el || !n._el.isConnected) {
        n._el = locate(n.pin); n._fixed = !!n._el && stuck(n._el);
        n._range = n._el && n.pin.hl && n.pin.text ? rangeFor(n._el, n.pin.text) : null;
      }
      if (!n._el) { lost++; return; }
      if (n._range) ranges.push(n._range);
      var r = n._el.getBoundingClientRect(), q = n._range && n._range.getClientRects()[0];
      if ((r.width < 1 && r.height < 1) || (n._el.checkVisibility && !n._el.checkVisibility({ visibilityProperty: true }))) return;
      var b = pins[n.id];
      if (!b) {
        b = pins[n.id] = el("button", "tf-pin"); b.type = "button";
        b.addEventListener("click", function () { view(n.id); });
        layer.appendChild(b);
      }
      b.className = "tf-pin is-" + n.status; b.textContent = n.no;
      b.setAttribute("aria-label", "Comment " + n.no + " from " + (n.name || "a tester"));
      seatPin(b, q ? q.left : r.left + r.width * n.pin.x, q ? q.top : r.top + r.height * n.pin.y, n._fixed);
      live[n.id] = 1;
    });
    Object.keys(pins).forEach(function (id) { if (!live[id]) { pins[id].remove(); delete pins[id]; } });
    paint(ranges);
  }
  function soon(fresh) {
    if (fresh) { if (!later) later = setTimeout(function () { later = 0; draw(true); if (!panel.hidden) drawPanel(); }, 250); return; }
    if (!frame) frame = requestAnimationFrame(function () { frame = 0; draw(false); });
  }

  /* The box beside a pin: a new comment being written, or a saved one being read. */
  function seatPop(x, y) {
    pop.hidden = false;
    var w = pop.offsetWidth, h = pop.offsetHeight, left = Math.max(scrollX + 12, Math.min(x + 14, scrollX + document.documentElement.clientWidth - 12 - w)), top = y + 12;
    if (top + h > scrollY + innerHeight - 12 && y - 46 - h > scrollY + 12) top = y - 46 - h;
    pop.style.left = left + "px"; pop.style.top = top + "px";
  }
  function shut() {
    pop.hidden = true; pop.textContent = ""; pop.removeAttribute("data-kind");
    if (draft) { draft.pin.remove(); draft = null; draw(false); }
  }
  function quoteOf(pin) { return pin.hl && pin.text ? el("blockquote", "tf-quote", pin.text) : null; }
  function sectionOf(t) {
    var main = document.querySelector("#main");
    if (!main || !main.contains(t)) return t.closest("header") ? "Header and menu" : t.closest("footer") ? "Footer" : "Whole page";
    for (var e = t; e && main && main.contains(e); e = e.parentElement) {
      var h = e.matches("h2") ? e : e.querySelector("h2");
      if (h) return h.textContent.replace(/#\s*$/, "").replace(/\s+/g, " ").trim().slice(0, 80) || "Whole page";
      if (e === main) break;
    }
    return "Whole page";
  }
  function compose(t, cx, cy, range, quote, under) {
    if (t.ownerSVGElement) t = t.ownerSVGElement;
    var typed = draft ? pop.querySelector("textarea").value : "";
    shut();
    var r = t.getBoundingClientRect(), sel = path(t);
    var pin = { sel: sel.length <= 400 ? sel : "", x: clamp((cx - r.left) / (r.width || 1)), y: clamp((cy - r.top) / (r.height || 1)),
      text: (quote || norm(t.getAttribute("alt") || t.textContent).slice(0, 120)).replace(/[<>]/g, " ").trim(), hl: !!quote };
    var mark = el("button", "tf-pin is-draft", "+"); mark.type = "button"; mark.tabIndex = -1; mark.setAttribute("aria-hidden", "true");
    layer.appendChild(mark); seatPin(mark, cx, cy, false);
    draft = { pin: mark, range: range || null };
    hover.hidden = true; paint(pinned().map(function (n) { return n._range; }).filter(Boolean));

    pop.setAttribute("data-kind", "new");
    pop.appendChild(el("p", "tf-eyebrow", "New comment"));
    var q = quoteOf(pin); if (q) pop.appendChild(q);
    var ta = el("textarea"), who = el("input"), m = el("p", "tf-msg"), row = el("div", "tf-pop-row"), no = el("button", "tf-pop-no", "Cancel"), yes = el("button", "tf-send", "Save comment");
    ta.rows = 3; ta.maxLength = 2000; ta.placeholder = "What did you notice here?"; ta.setAttribute("aria-label", "Your comment"); ta.value = typed;
    who.maxLength = 60; who.placeholder = "Your name (optional)"; who.setAttribute("aria-label", "Your name (optional)"); who.autocomplete = "name"; who.value = get(NAME);
    m.setAttribute("role", "status"); no.type = yes.type = "button";
    row.appendChild(no); row.appendChild(yes);
    [ta, who, m, row].forEach(function (x) { pop.appendChild(x); });
    function save() {
      var text = ta.value.trim();
      m.classList.remove("is-bad");
      if (text.length < 3) { m.textContent = "Write a few words first."; m.classList.add("is-bad"); ta.focus(); return; }
      yes.disabled = true; m.textContent = "Saving…";
      post(text, who.value.trim(), sectionOf(t), pin).then(shut).catch(function (err) {
        m.textContent = (err && err.message) || "That didn’t save. Please try again."; m.classList.add("is-bad"); yes.disabled = false;
      });
    }
    yes.addEventListener("click", save); no.addEventListener("click", shut);
    ta.addEventListener("keydown", function (e) { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save(); });
    seatPop(cx + scrollX, (under || cy) + scrollY);
    ta.focus({ preventScroll: true });
  }
  function view(id) {
    var n = notes.filter(function (x) { return x.id === id; })[0], b = pins[id];
    if (!n || !b) return;
    shut();
    pop.setAttribute("data-kind", "view");
    var head = el("div", "tf-pop-head"), who = el("div", "tf-from"), fw = el("div"), x = el("button", "tf-x"), pick = el("select", "tf-status");
    who.appendChild(el("i", "tf-avatar", n.name ? n.name.trim().charAt(0).toUpperCase() : "?"));
    fw.appendChild(el("b", "", n.name || "No name")); fw.appendChild(el("small", "", when(n.created))); who.appendChild(fw);
    x.type = "button"; x.setAttribute("aria-label", "Close comment"); x.innerHTML = X; x.addEventListener("click", function () { shut(); b.focus(); });
    head.appendChild(who); head.appendChild(x); pop.appendChild(head);
    var q = quoteOf(n.pin); if (q) pop.appendChild(q);
    pop.appendChild(el("p", "tf-pop-note", n.note));
    pick.setAttribute("aria-label", "Status of this comment");
    STATUS.forEach(function (s) { var o = el("option", "", s[1]); o.value = s[0]; pick.appendChild(o); });
    pick.value = n.status; pop.classList.remove("is-open", "is-in_progress", "is-resolved"); pop.classList.add("is-" + n.status);
    pick.addEventListener("change", function () {
      var to = pick.value; pick.disabled = true;
      window.BCCApp.api("/tester-feedback/status", { id: n.id, status: to }).then(function () {
        n.status = to; if (to === "resolved") shut(); else { pick.disabled = false; pop.classList.remove("is-open", "is-in_progress"); pop.classList.add("is-" + to); }
        draw(false); drawPanel(); if (board.open) drawBoard();
      }).catch(function () { pick.value = n.status; pick.disabled = false; });
    });
    pop.appendChild(pick);
    var r = b.getBoundingClientRect();
    seatPop(r.left + scrollX, r.bottom + scrollY);
  }
  /* Bring a pin into view and open it (from the panel's list, or from "See all feedback on this page"). */
  function go(id) {
    var b = pins[id];
    if (!b) return;
    if (!panel.hidden) show(false);
    var r = b.getBoundingClientRect();
    if (r.top < 90 || r.bottom > innerHeight - 90) scrollTo({ top: Math.max(0, r.top + scrollY - innerHeight / 2), behavior: "auto" });
    draw(false); view(id);
  }
  function comment(on) {
    if (on && !panel.hidden) show(false);
    mode = on; shut();
    document.body.classList.toggle("tf-commenting", on);
    bar.hidden = !on; open.hidden = on; hover.hidden = true;
    if (on) bar.querySelector(".tf-done").focus(); else open.focus();
    draw(true);
  }
  box.querySelector(".tf-pinmode").addEventListener("click", function () { comment(true); });
  bar.querySelector(".tf-done").addEventListener("click", function () { comment(false); });
  showPins.addEventListener("change", function () { set(SHOW, showPins.checked ? "1" : "0"); if (!showPins.checked) shut(); draw(true); });

  /* In comment mode a click anywhere on the page places a comment and does nothing else: no links, no buttons. */
  window.addEventListener("click", function (e) {
    var t = e.target && e.target.nodeType === 1 ? e.target : e.target && e.target.parentElement;
    if (!mode) { if (pop.getAttribute("data-kind") === "view" && !inside(t)) shut(); return; }
    if (!t || inside(t)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var s = window.getSelection && getSelection(), range = s && s.rangeCount && !s.isCollapsed ? s.getRangeAt(0) : null, quote = range ? norm(range.toString()).slice(0, 200).trim() : "";
    if (range && quote.length > 1) {
      var c = range.commonAncestorContainer, host = c.nodeType === 1 ? c : c.parentElement, first = range.getClientRects()[0];
      if (host && !inside(host) && first) {
        var kept = rangeFor(host, quote);
        s.removeAllRanges();
        compose(host, first.left, first.top, kept, quote, first.bottom); return;
      }
    }
    compose(t, e.clientX, e.clientY, null, "");
  }, true);
  window.addEventListener("pointermove", function (e) {
    if (!mode || e.pointerType !== "mouse" || !pop.hidden) { hover.hidden = true; return; }
    var t = e.target && e.target.nodeType === 1 ? e.target : null;
    if (!t || inside(t) || t === document.body || t === document.documentElement) { hover.hidden = true; return; }
    if (t.ownerSVGElement) t = t.ownerSVGElement;
    var r = t.getBoundingClientRect();
    hover.hidden = false; hover.style.left = r.left + "px"; hover.style.top = r.top + "px"; hover.style.width = r.width + "px"; hover.style.height = r.height + "px";
  }, true);
  window.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || board.open) return;
    if (!pop.hidden) { e.stopPropagation(); shut(); } else if (mode) { e.stopPropagation(); comment(false); }
  }, true);
  window.addEventListener("scroll", function () { hover.hidden = true; soon(false); }, { passive: true, capture: true });
  window.addEventListener("resize", function () { soon(false); });
  window.addEventListener("load", function () { soon(true); }, true);
  /* The pages redraw themselves: look the pins' elements up again whenever anything outside this tool changes. */
  if ("MutationObserver" in window) new MutationObserver(function (list) {
    if (list.some(function (m) { return !inside(m.target.nodeType === 1 ? m.target : m.target.parentElement); })) soon(true);
  }).observe(document.body, { childList: true, subtree: true, characterData: true });

  /* The app is a module and starts after this script: wait for it, then show this page's count on the button. */
  (function wait(n) { if (window.BCCApp) load(); else if (n) setTimeout(function () { wait(n - 1); }, 300); })(40);
})();
