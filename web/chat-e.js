/* Body Café Co. — Variant E Part 2 · store assistant (12 Nov 2026).
   The assistant is called Barista (name chosen 12 Nov 2026, "for now"). A chat button in the corner of every Part 2 page (and its Content Focus copy). The customer asks anything; the
   answer is written by Claude on the server (POST /api/chat: supabase/functions/operations/chat.js on the live site,
   app/chat.py in the local preview) and streams into the panel as it is written.
   Only shown when body[data-variant-e-part="2"] (styles: web/chat-e.css, class prefix p2c-). Parts 1, 3 and 4 and the
   static design preview, which has no store API, never show it.
   The conversation is kept in sessionStorage so it survives moving between pages; nothing is stored on the server. */
(function () {
  "use strict";
  if (window.BCCStaticPreview) return;
  var KEY = "bcc-chat-e", MAX_CHARS = 2000, MAX_TOTAL = 14000, MAX_MESSAGES = 23;
  var STARTERS = ["Which one suits mornings?", "How much is delivery?", "What is L-Theanine?"];
  var HELLO = "Hi, I'm Barista, the Body Café AI assistant. Ask me about our seven products, an ingredient, delivery or returns, or anything else you're curious about.";
  var messages = [], busy = false, controller = null, root, log, form, input, send, launcher, panel, status;

  try { messages = JSON.parse(sessionStorage.getItem(KEY) || "[]").filter(function (m) { return m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content; }); } catch (e) { messages = []; }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(messages.slice(-40))); } catch (e) {} }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; }

  // Answers are plain text. Site paths (/products/…) and web addresses become links; nothing is ever set as HTML.
  var LINK = /(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])|(^|[\s(])(\/[a-z][a-z0-9\-\/#]*[a-z0-9])/gi;
  function fill(node, text) {
    node.textContent = "";
    var last = 0, m;
    LINK.lastIndex = 0;
    while ((m = LINK.exec(text))) {
      var href = m[1] || m[3], start = m.index + (m[1] ? 0 : m[2].length);
      if (start > last) node.appendChild(document.createTextNode(text.slice(last, start)));
      var a = el("a", "", href);
      a.href = href;
      if (m[1]) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
      node.appendChild(a);
      last = start + href.length;
    }
    if (last < text.length) node.appendChild(document.createTextNode(text.slice(last)));
  }
  function bubble(role, text) {
    var row = el("div", "p2c-row p2c-" + role), b = el("div", "p2c-bubble");
    fill(b, text);
    row.appendChild(b);
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    return b;
  }
  // The character (web/media/barista/): the whole bottle above the greeting, the face in the button and the header.
  // The drawings are placed inline (not as <img>) so the cap, apron and shoes can take the colour in --p2c-cap.
  var drawings = {}, placed = 0;
  function art(name, cls) {
    var holder = el("span", cls);
    holder.setAttribute("aria-hidden", "true");
    drawings[name] = drawings[name] || fetch("/web/media/barista/" + name + ".svg").then(function (r) { return r.ok ? r.text() : ""; }).then(function (text) {
      var svg = text && new DOMParser().parseFromString(text, "image/svg+xml").documentElement;
      return svg && svg.nodeName === "svg" ? svg : null;
    }).catch(function () { return null; });
    drawings[name].then(function (svg) {
      if (!svg) return;
      // Each copy gets its own gradient ids: the button's copy is hidden while the panel is open, and a gradient
      // inside a hidden drawing would leave every other copy that points at the same id unpainted.
      var copy = document.importNode(svg, true), tag = "-" + (++placed);
      [].forEach.call(copy.querySelectorAll("[id]"), function (n) { n.id += tag; });
      [].forEach.call(copy.querySelectorAll("[fill^='url(#']"), function (n) { n.setAttribute("fill", n.getAttribute("fill").replace(")", tag + ")")); });
      holder.appendChild(copy);
    });
    return holder;
  }
  // The face in the header shows the mood: hello, thinking while an answer is written, unsure when one could not be had.
  var face = null, faceMood = "";
  function mood(name) {
    if (!face || name === faceMood) return;
    faceMood = name;
    var next = art(name === "hello" ? "barista-face" : "barista-face-" + name, "p2c-face");
    face.replaceWith(next);
    face = next;
  }
  // On a product page Barista wears that product's cap colour; everywhere else, the indigo of the proof band.
  function dress() {
    var id = window.BCCProductRoutes && window.BCCProductRoutes.productId(location.pathname), list = window.BCCApp && window.BCCApp.catalog && window.BCCApp.catalog();
    list = Array.isArray(list) ? list : (list && list.products) || [];
    var p = id && list.find(function (x) { return x.id === id; }), color = p && /^#[0-9a-f]{6}$/i.test(p.color || "") ? p.color : "";
    if (color) root.style.setProperty("--p2c-cap", color); else root.style.removeProperty("--p2c-cap");
  }
  function draw() {
    log.textContent = "";
    if (!messages.length) log.appendChild(art("barista", "p2c-hero"));
    bubble("assistant", HELLO);
    messages.forEach(function (m) { bubble(m.role, m.content); });
    if (!messages.length) {
      var chips = el("div", "p2c-chips");
      STARTERS.forEach(function (q) { var c = el("button", "p2c-chip", q); c.type = "button"; c.addEventListener("click", function () { ask(q); }); chips.appendChild(c); });
      log.appendChild(chips);
    }
    log.scrollTop = log.scrollHeight;
  }
  function setBusy(on) {
    busy = on;
    root.classList.toggle("is-busy", on);
    mood(on ? "thinking" : "hello");
    send.textContent = on ? "Stop" : "Send";
    send.setAttribute("aria-label", on ? "Stop the answer" : "Send your question");
    status.textContent = on ? "Barista is writing an answer." : "";
  }
  // What is sent: the most recent turns that fit the server's limits, always starting with a customer message.
  function payload() {
    var out = messages.slice(-MAX_MESSAGES), total = function () { return out.reduce(function (n, m) { return n + m.content.length; }, 0); };
    while (out.length > 1 && (out[0].role !== "user" || total() > MAX_TOTAL)) out.shift();
    return out;
  }

  async function ask(text) {
    text = String(text || "").trim();
    if (!text || busy) return;
    if (text.length > MAX_CHARS) { status.textContent = "Please keep your question under " + MAX_CHARS + " characters."; return; }
    var chips = log.querySelector(".p2c-chips"), hero = log.querySelector(".p2c-hero");
    if (chips) chips.remove();
    if (hero) hero.remove();
    messages.push({ role: "user", content: text });
    save();
    var asked = bubble("user", text).parentNode;
    input.value = "";
    grow();
    var out = bubble("assistant", ""), answer = "";
    out.classList.add("is-waiting");
    setBusy(true);
    controller = new AbortController();
    try {
      var res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": (window.BCCApp && window.BCCApp.csrf()) || "" },
        body: JSON.stringify({ messages: payload() }),
        signal: controller.signal,
      });
      if (!res.ok) {
        var problem = "The assistant is unavailable right now. Please try again.";
        try { problem = (await res.json()).error || problem; } catch (e) {}
        throw new Error(problem);
      }
      var reader = res.body.getReader(), decoder = new TextDecoder();
      for (;;) {
        var part = await reader.read();
        if (part.done) break;
        answer += decoder.decode(part.value, { stream: true });
        out.classList.remove("is-waiting");
        var pinned = log.scrollHeight - log.scrollTop - log.clientHeight < 60;
        fill(out, answer);
        if (pinned) log.scrollTop = log.scrollHeight;
      }
    } catch (e) {
      if (e.name !== "AbortError" && !answer) {
        // Nothing was answered: take the question back out so the next try doesn't send it twice.
        messages.pop();
        save();
        asked.remove();
        out.parentNode.classList.add("p2c-error");
        out.classList.remove("is-waiting");
        fill(out, (e && e.message && !/fetch|network/i.test(e.message) ? e.message : "The assistant couldn't be reached. Check your connection and try again.") + " You can also reach the team at /contact");
        input.value = text;
        grow();
        log.scrollTop = log.scrollHeight;
        setBusy(false);
        mood("unsure");
        return;
      }
    }
    out.classList.remove("is-waiting");
    answer = answer.trim();
    if (answer) { messages.push({ role: "assistant", content: answer }); fill(out, answer); }
    else { messages.pop(); out.parentNode.remove(); }
    save();
    setBusy(false);
    if (root.classList.contains("is-open")) input.focus();
  }

  function grow() { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 120) + "px"; }
  function open(on) {
    root.classList.toggle("is-open", on);
    launcher.setAttribute("aria-expanded", on ? "true" : "false");
    panel.hidden = !on;
    if (on) { log.scrollTop = log.scrollHeight; input.focus(); } else launcher.focus();
  }

  function build() {
    root = el("div", "p2c");
    launcher = el("button", "p2c-launch");
    launcher.type = "button";
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", "p2c-panel");
    launcher.setAttribute("aria-label", "Ask the Barista");
    launcher.title = "Ask the Barista";
    launcher.appendChild(art("barista", "p2c-figure"));

    panel = el("section", "p2c-panel");
    panel.id = "p2c-panel";
    panel.hidden = true;
    panel.setAttribute("aria-label", "Barista, the Body Café assistant");
    var head = el("header", "p2c-head"), title = el("div", "p2c-title");
    title.appendChild(el("strong", "", "Barista"));
    title.appendChild(el("span", "", "AI · not medical advice"));
    var fresh = el("button", "p2c-new", "New chat"), close = el("button", "p2c-close");
    fresh.type = "button";
    close.type = "button";
    close.setAttribute("aria-label", "Close Barista");
    close.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
    face = art("barista-face", "p2c-face"); faceMood = "hello";
    head.appendChild(face); head.appendChild(title); head.appendChild(fresh); head.appendChild(close);

    log = el("div", "p2c-log");
    log.setAttribute("role", "log");
    log.setAttribute("aria-live", "polite");
    log.tabIndex = 0;
    log.setAttribute("aria-label", "Conversation");

    form = el("form", "p2c-form");
    var label = el("label", "sr-only", "Your question");
    label.htmlFor = "p2c-input";
    input = el("textarea", "p2c-input");
    input.id = "p2c-input";
    input.rows = 1;
    input.maxLength = MAX_CHARS;
    input.placeholder = "Ask anything…";
    send = el("button", "p2c-send", "Send");
    send.type = "submit";
    form.appendChild(label); form.appendChild(input); form.appendChild(send);
    status = el("p", "sr-only");
    status.setAttribute("role", "status");
    var note = el("p", "p2c-note", "An AI writes these answers and can be wrong. For your own health, ask your doctor.");

    panel.appendChild(head); panel.appendChild(log); panel.appendChild(form); panel.appendChild(note); panel.appendChild(status);
    root.appendChild(panel); root.appendChild(launcher);
    document.body.appendChild(root);

    launcher.addEventListener("click", function () { open(!root.classList.contains("is-open")); });
    document.addEventListener("click", function (e) { var t = e.target.closest && e.target.closest("[data-p2c-open]"); if (!t || getComputedStyle(root).display === "none") return; e.preventDefault(); e.stopPropagation(); open(true); }, true);
    close.addEventListener("click", function () { open(false); });
    fresh.addEventListener("click", function () { if (controller) controller.abort(); messages = []; save(); setBusy(false); draw(); input.focus(); });
    form.addEventListener("submit", function (e) { e.preventDefault(); if (busy) { if (controller) controller.abort(); } else ask(input.value); });
    input.addEventListener("input", grow);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (!busy) ask(input.value); } });
    root.addEventListener("keydown", function (e) { if (e.key === "Escape" && root.classList.contains("is-open")) open(false); });
    // A link in an answer goes to that page; on a phone the panel covers the page, so it closes first.
    log.addEventListener("click", function (e) { if (e.target.closest("a") && window.matchMedia("(max-width: 640px)").matches) open(false); });
    draw();
    // Follow page changes: the app sets the page title on every route, and redraws #app once the catalogue has loaded.
    var queued = 0, later = function () { clearTimeout(queued); queued = setTimeout(dress, 80); }, watch = new MutationObserver(later);
    [document.querySelector("title"), document.getElementById("app")].forEach(function (node) { if (node) watch.observe(node, { childList: true, characterData: true, subtree: node.nodeName === "TITLE" }); });
    window.addEventListener("popstate", later);
    document.addEventListener("click", function () { setTimeout(dress, 350); });
    dress();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
