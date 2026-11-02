/* Body Café Co. — Variant E · About merged into Story (owner decision, 2 November 2026).
   Story keeps its exact copy and gains an "About Body Café Co." part, built from the About renderer itself so its
   content stays in one place: why we exist, why colour (the colour index), why "café" and how we behave.
   About's own "Our belief" and numbers repeat Story chapters, and its colour book repeats the homepage cards, so they
   are not carried over. /about now shows Story at #about, and E's links to About point there. */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE;
  if (!S || !S.themes || !S.themes.e || !L) return;
  var ABOUT = S.themes.e.about; // the real About renderer, captured before /about is pointed at Story
  var KEEP = [".sca-why", ".eza-why", ".eza-colour", ".eza-name", ".eza-values"];

  function aboutPart(ctx) {
    if (typeof ABOUT !== "function") return null;
    var html = ABOUT(ctx);
    if (typeof html !== "string") return null;
    var src = L.frag(html), out = document.createElement("div");
    out.className = "x-page eza ssy-about";
    out.id = "about";
    out.setAttribute("aria-labelledby", "ssy-about-t");
    out.appendChild(L.frag('<header class="ssy-about-head"><p class="ez-k">About Body Café Co.</p><h2 id="ssy-about-t">Who we are, and how we work.</h2></header>'));
    KEEP.forEach(function (sel) { var el = src.querySelector(sel); if (el) out.appendChild(el); });
    return out.children.length > 1 ? out : null;
  }

  L.wrap("story", function (root, ctx) {
    var final = root.querySelector(".ssy-final"), part = aboutPart(ctx);
    if (!part) return;
    if (final) final.before(part); else (root.querySelector(".ssy") || root.firstElementChild || root).appendChild(part);
  });

  // /about shows Story, scrolled to the About part.
  var story = S.themes.e.story;
  L.replace("about", function (ctx) {
    try { history.replaceState(history.state, "", "/story" + location.search + "#about"); } catch (e) {}
    return story.apply(this, arguments);
  });

  // Navigation and footer: no About item; any other About link goes to Story's About part.
  function relink(scope) {
    scope.querySelectorAll('a[href="/about"], a[href^="/about?"], a[href^="/about#"]').forEach(function (a) {
      var inNav = a.closest("nav, .e-nav, #mobile-nav, footer, .e-footer");
      var siblingStory = inNav && inNav.querySelector('a[href="/story"]');
      if (inNav && siblingStory) { (a.closest("li") && a.closest("li").parentElement === inNav.querySelector("ul, ol") ? a.closest("li") : a).remove(); return; }
      a.setAttribute("href", "/story#about");
    });
  }
  // Menus that number their items (01, 02 …) are renumbered so removing About leaves no gap.
  function renumberMenus(scope) {
    scope.querySelectorAll("#mobile-nav ul, #mobile-nav ol, nav ul, nav ol").forEach(function (list) {
      var k = 0;
      [].slice.call(list.children).forEach(function (li) {
        var n = [].slice.call(li.querySelectorAll("span, b, small, i")).filter(function (x) { return /^\d{2}$/.test(x.textContent.trim()); })[0];
        if (n) { k += 1; n.textContent = (k < 10 ? "0" : "") + k; }
      });
    });
  }
  L.wrap("chrome", function (root) { relink(root); renumberMenus(root); });
  L.onEnhance(function (main) {
    relink(main);
    if (location.pathname === "/story" && location.hash === "#about") {
      var t = main.querySelector("#about");
      if (t) setTimeout(function () { t.scrollIntoView({ block: "start" }); }, 60);
    }
  });

  window.BCCStoryAboutE = { KEEP: KEEP };
})();
