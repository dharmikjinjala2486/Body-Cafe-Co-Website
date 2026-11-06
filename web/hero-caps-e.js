/* Body Café Co. — Variant E Part 1 home hero. Part 2's hero with the cap alone: no bottle.
   Opens on the first product; each cap in turn swells to fill the stage and says one thing, a word or two,
   with its name in a small arc above. Styles: web/hero-caps-e.css. */
(function () {
  "use strict";
  var L = window.BCCLivingE;
  if (!L) return;
  var esc = L.esc;
  function on() { return document.body.dataset.variantEPart === "1"; }
  function capSrc(id) { return "/web/media/renders/" + id + "-cap.webp"; }
  function line(id) { var C = window.BCCPdpE; return (C && C.P && C.P[id] && C.P[id].headline) || ""; }
  function fact(id) { var H = window.BCCHomeHeroE; return (H && H.FACT && H.FACT[id]) || ""; }

  function hero(ctx) {
    return '<div class="p2-hc-copy"><p class="p2-eyebrow ez-k">The Super Sevens</p>' +
      '<h1 id="ss-hero-t"><b>Seven supplements.</b> <span><b>One uncompromising</b> <b>standard.</b></span></h1>' +
      '<div class="p2-actions"><a class="x-btn" href="/shop"><span>Shop the seven</span></a><a class="x-link" href="/standards">Our standard</a></div></div>' +
      '<ul class="p2-hc-caps" aria-label="The seven">' + ctx.published.slice(0, 7).map(function (p, i) {
        return '<li style="--cap:' + esc(p.color) + ";--i:" + i + '"><a href="/products/' + esc(p.id) + '" data-p2-pick data-id="' + esc(p.id) + '" data-name="' + esc(p.name) + '" data-fact="' + esc(fact(p.id)) + '" data-color="' + esc(p.color) + '" data-on="' + esc(ctx.onCap(p.color)) + '" aria-label="' + esc(p.name) + '">' +
          '<img src="' + capSrc(esc(p.id)) + '" alt="" width="400" height="400" decoding="async"><span class="p2-hc-name">' + esc(p.name) + "</span></a></li>";
      }).join("") + "</ul>" +
      '<p class="p2-hc-now" aria-hidden="true"><strong data-p2-now-name></strong><small data-p2-now-fact></small></p>';
  }

  // One thought per cap, a word or two, with the name in a small arc above it. Every one comes from the label or the
  // product page: an amount, a ratio, a direction, or the last turn of the headline. A product not listed uses its headline's last sentence.
  var PHRASE = {
    "omega-3-fish-oil": ["800 mg."],
    "vitamin-d3-k2": ["Nothing", "hidden."],
    "creatine-chews": ["Just", "chew."],
    "iron-bisglycinate": ["Chai", "later."],
    "l-theanine": ["Green", "tea."],
    "myo-d-chiro-inositol": ["40:1."],
    "psyllium-husk": ["Isabgol."]
  };
  function phrase(id) { return PHRASE[id] || [line(id).split(/(?<=[.,])\s+/).pop()]; }
  var arcs = 0, FONT = '300 100px "Aileron"';
  function arc(name) {
    var id = "p2-hc-arc-" + (++arcs);
    return '<svg class="p2-hc-arc" viewBox="0 0 200 200"><defs><path id="' + id + '" d="M17 100a83 83 0 0 1 166 0"/></defs>' +
      '<text text-anchor="middle"><textPath href="#' + id + '" startOffset="50%">' + esc(name.toUpperCase()) + "</textPath></text></svg>";
  }

  function fill(a, b) {
    var img = new Image();
    a.style.setProperty("--on-cap", b.dataset.on);
    img.className = "p2-hc-disc"; img.alt = ""; img.decoding = "async"; img.src = capSrc(b.dataset.id);
    a.appendChild(img);
    a.insertAdjacentHTML("beforeend", '<span class="p2-hc-face">' + arc(b.dataset.name) + '<span class="p2-hc-words">' + phrase(b.dataset.id).map(function (t, i) {
      return '<span class="p2-hc-l" style="--n:' + i + '">' + esc(t) + "</span>";
    }).join("") + "</span></span>");
  }

  // The phrase takes the largest size that keeps its widest line well inside the cap; short ones get very large.
  function fitAll(stage, d) {
    var fonts = document.fonts && document.fonts.load ? document.fonts.load(FONT) : Promise.resolve();
    fonts.catch(function () {}).then(function () {
      var ctx = document.createElement("canvas").getContext("2d"); ctx.font = FONT;
      stage.querySelectorAll(".p2-hc-words").forEach(function (el) {
        var w = Math.max.apply(null, [].map.call(el.querySelectorAll(".p2-hc-l"), function (l) { return ctx.measureText(l.textContent).width / 100; }));
        el.style.fontSize = Math.min(d * .26, d * .66 / w).toFixed(1) + "px";
      });
      // The name stays readable on a small cap: never under 11px on screen.
      stage.style.setProperty("--p2-hc-arc", Math.max(5, 11 * 200 / d).toFixed(2) + "px");
    });
  }

  L.wrap("home", function (root, ctx) {
    if (!on()) return;
    var sec = root.querySelector('[data-home-section="hero"]');
    if (!sec || !ctx.published.length) return;
    sec.className = "p2-hero2c"; sec.setAttribute("data-p2-hero", ""); sec.setAttribute("aria-labelledby", "ss-hero-t");
    sec.innerHTML = ""; sec.appendChild(L.frag(hero(ctx)));
  });

  L.onEnhance(function (main, signal) {
    if (!on() || !window.BCCHeroShow) return;
    var sec = main.querySelector("[data-p2-hero]");
    if (sec) window.BCCHeroShow.mount(sec, signal, fill, fitAll);
  });
})();
