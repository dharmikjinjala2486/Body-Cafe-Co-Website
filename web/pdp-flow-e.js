/* Body Café Co. — Variant E · product page flow (owner request, 2 November 2026).
   Benchmarked against Thorne, Sports Research, MyProtein, Wellbeing Nutrition and The Ordinary product pages:
   buy box with trust points under the button → a sticky section bar → overview → ingredient facts → how to use →
   quality and lot report → reviews → questions → more products. The visual extras (turn the bottle, pour one
   serving) follow the facts instead of coming before them. Nothing here adds a claim: every trust point is a fact
   already on the site (FSSAI licence, GMP and third-party testing from the label, the lot lookup). */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE;
  if (!S || !S.themes || !S.themes.e || !L) return;
  var esc = L.esc;
  var ORDER = ["#about-product", "#detail", "#ingredients", "#use", ".ss-pour.is-single", "#quality", "#turn", "#reviews", "#questions", "#explore"];
  var TABS = [["#about-product", "Overview"], ["#ingredients", "Ingredients"], ["#use", "How to use"], ["#quality", "Quality & lot report"], ["#reviews", "Reviews"], ["#questions", "Questions"]];
  var LABEL_PDF = { "iron-bisglycinate": 1, "l-theanine": 1, "vitamin-d3-k2": 1, "omega-3-fish-oil": 1, "creatine-chews": 1, "psyllium-husk": 1 };
  var TRUST = [["FSSAI licensed", "Lic. No. 10726994000121"], ["GMP certified", "Made in GMP-certified facilities"], ["Third-party tested", "Every product"], ["Lot lookup", "Trace the lot on your pack"]];

  function renumber(pp) {
    var secs = pp.querySelectorAll(".pp-sec"), total = secs.length + 1;
    secs.forEach(function (sec, k) { var n = sec.querySelector(".pp-k-n"), of = sec.querySelector(".pp-k-of"); if (n) n.textContent = L.pad(k + 2); if (of) of.textContent = "/ " + L.pad(total); });
  }

  L.wrap("product", function (root, ctx, args) {
    var p = args[0], pp = root.querySelector(".pp-e"); if (!pp || !p) return;
    // 1 · Reorder the sections after the buy box.
    var nodes = ORDER.map(function (sel) { return pp.querySelector(sel); }).filter(Boolean);
    var anchor = nodes[0] && nodes[0].previousElementSibling;
    if (anchor) { var after = anchor; nodes.forEach(function (n) { after.after(n); after = n; }); }
    renumber(pp);
    // 2 · Trust points and pack length under Add to bag.
    var add = pp.querySelector("#buy .pp-add");
    if (add) {
      // Every product in the range is taken once a day, so the pack length in days equals its servings.
      var servings = parseInt(p.servings_per_pack || "", 10);
      var lasts = servings ? '<p class="ppf-lasts"><strong>' + servings + " servings</strong> · one a day, about " + servings + " days</p>" : "";
      var trust = '<ul class="ppf-trust" aria-label="Quality">' + TRUST.map(function (t) { return '<li><span class="ppf-tick" aria-hidden="true"></span><span><strong>' + t[0] + "</strong><small>" + t[1] + "</small></span></li>"; }).join("") + "</ul>";
      var host = add.closest(".pp-actions, .pp-buy-row, form, div") || add;
      host.after(L.frag(lasts + trust));
    }
    // 2b · The full printed label as a PDF, in Quality (six of seven supplied; Inositol's file was blank).
    var q = pp.querySelector("#quality .pp-body");
    if (q && LABEL_PDF[p.id]) {
      var ql = q.querySelector(".pp-lead");
      var link = '<p class="ppf-label"><a class="x-link" href="/web/media/labels/' + esc(p.id) + '.pdf" target="_blank" rel="noopener" download>Download the full label (PDF)</a></p>';
      if (ql) ql.after(L.frag(link)); else q.insertAdjacentHTML("afterbegin", link);
    }
    // 3 · A sticky section bar replaces the plain quick links. It sits between the buy box and the sections (not
    //     inside the buy box), so it can stay at the top for the rest of the page.
    var quick = pp.querySelector(".pp-quick"); if (quick) quick.remove();
    var bar = '<nav class="ppf-tabs" aria-label="On this page" data-ppf-tabs><div class="ppf-tabs-in">' + TABS.filter(function (t) { return pp.querySelector(t[0]); }).map(function (t) {
      return '<a href="' + t[0] + '" data-ppf-tab="' + t[0] + '">' + esc(t[1]) + "</a>";
    }).join("") + "</div></nav>";
    var buy = pp.querySelector("#buy"); if (buy) buy.after(L.frag(bar));
  });

  // Highlight the section in view.
  L.onEnhance(function (main, signal) {
    var bar = main.querySelector("[data-ppf-tabs]"); if (!bar || !("IntersectionObserver" in window)) return;
    var links = [].slice.call(bar.querySelectorAll("[data-ppf-tab]"));
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = "#" + e.target.id;
        links.forEach(function (a) { var on = a.getAttribute("data-ppf-tab") === id; a.classList.toggle("is-on", on); if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); if (on && a.scrollIntoView && bar.scrollWidth > bar.clientWidth) a.parentElement.scrollLeft = a.offsetLeft - 24; });
      });
    }, { rootMargin: "-140px 0px -60% 0px" });
    links.forEach(function (a) { var t = main.querySelector(a.getAttribute("data-ppf-tab")); if (t) io.observe(t); });
    signal.addEventListener("abort", function () { io.disconnect(); });
  });

  window.BCCPdpFlowE = { ORDER: ORDER, TABS: TABS, TRUST: TRUST };
})();
