/* Body Café Co. — Direction D, "Still life".
   Each bottle is presented as an object lit on a porcelain plinth in morning window light. The page is set like the
   packaging label: a spec-row strip, a boxed facts panel, a front-label story panel and the bottle "turned over" for lots.
   Cap colours are the only saturated colour, used as accents rather than floods.

   Contract: window.BCCDirectionD(ctx) returns the full homepage HTML string.
   ctx = { list, image, cap, capStyle, escape, money, format, shortName, link, menuBoard, homeLot }
   Shared sections come from window.BCCHome. No inline handlers, no external resources.

   The hero keeps the existing counter markup contract so app.js mounts it unchanged:
   data-counter (+ data-counter-manual), data-counter-ghost, .counter-stage, data-counter-bottle (active one tabbable),
   data-counter-name/sub/format/price/link, .counter-rail and data-counter-pick buttons with aria-pressed.
   Selection is manual only. This file adds ArrowUp/ArrowDown/Home/End for the vertical index (ArrowLeft/Right are
   already handled by the counter). */
(function () {
  "use strict";

  var PLUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  var ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6.5 18.5 12 13 17.5"/></svg>';
  var pad = function (i) {
    return (i < 9 ? "0" : "") + (i + 1);
  };

  function shared(name, arg) {
    var home = window.BCCHome;
    return home && typeof home[name] === "function" ? home[name](arg) : "";
  }

  /* ---------- Hero: masthead + lit stage + product index ---------- */
  function hero(ctx, list, first) {
    var esc = ctx.escape;
    var short = function (p) {
      return esc((ctx.shortName && ctx.shortName[p.id]) || p.name);
    };

    var bottles = list
      .map(function (p) {
        var on = p.id === first.id;
        return (
          '<a class="d-bottle' + (on ? " is-active" : "") + '" data-counter-bottle="' + p.id + '" href="/products/' + p.id + '"' +
          ' tabindex="' + (on ? 0 : -1) + '" aria-hidden="' + (on ? "false" : "true") + '">' + ctx.image(p, "", on) + "</a>"
        );
      })
      .join("");

    var index = list
      .map(function (p, i) {
        var on = p.id === first.id;
        return (
          '<button type="button" class="d-pick" data-counter-pick="' + p.id + '" data-color="' + p.color + '" aria-pressed="' + on + '" style="' + ctx.capStyle(p) + '">' +
            '<span class="d-pick-no" aria-hidden="true">' + pad(i) + "</span>" +
            ctx.cap(p, "d-pick-cap") +
            '<span class="d-pick-name">' + esc(p.name) + "</span>" +
            '<span class="d-pick-format">' + esc(ctx.format[p.id] || "") + "</span>" +
          "</button>"
        );
      })
      .join("");

    return (
      '<section class="d-hero" data-counter data-counter-manual style="' + ctx.capStyle(first) + '" aria-labelledby="d-hero-title">' +
        '<header class="d-mast">' +
          '<p class="d-intro">A collection of seven everyday supplements</p>' +
          '<h1 id="d-hero-title" class="d-title"><span class="d-title-a">Seven everyday essentials.</span> <span class="d-title-b">Pick a cap.</span></h1>' +
          '<div class="d-mast-aside">' +
            '<p class="d-lede">Iron, L-Theanine, Vitamin D3 + K2, Omega-3, Inositol, Creatine and Psyllium, ' +
            "each with its ingredient and format in plain view. Final labels and lot evidence are being prepared.</p>" +
            '<div class="d-actions">' + ctx.link("Shop all seven", "/shop", "button") + ctx.link("Explore our standards", "/standards", "text-link") + "</div>" +
          "</div>" +
        "</header>" +
        '<div class="d-picker">' +
          '<p class="d-picker-hint" id="d-picker-hint">Choose a cap to preview a product.<span class="d-key-hint"> Arrow keys move between caps.</span></p>' +
          '<div class="counter-rail d-index" role="group" aria-label="Choose a product to preview" aria-describedby="d-picker-hint">' + index + "</div>" +
        "</div>" +
        '<div class="counter-stage d-stage">' +
          '<div class="d-room" aria-hidden="true"><span class="d-sun"></span><span class="d-blinds"></span><span class="d-pool"></span><span class="d-grain"></span></div>' +
          '<span class="d-side" aria-hidden="true" data-counter-ghost>' + short(first) + "</span>" +
          '<div class="d-object">' +
            '<div class="d-bottles">' + bottles + "</div>" +
            '<span class="d-cast" aria-hidden="true"></span>' +
            '<span class="d-plinth" aria-hidden="true"></span>' +
          "</div>" +
          '<div class="d-spec" aria-live="polite">' +
            '<p class="d-spec-cell d-spec-top"><span>Now previewing</span><span data-counter-format>' + esc(ctx.format[first.id] || "") + "</span></p>" +
            '<p class="d-spec-cell d-spec-name" data-counter-name>' + esc(first.name) + "</p>" +
            '<p class="d-spec-cell d-spec-sub" data-counter-sub>' + esc(first.subtitle) + "</p>" +
            '<p class="d-spec-cell d-spec-price"><span>Demo price</span><strong data-counter-price>' + ctx.money(first.price) + "</strong></p>" +
            '<a class="d-spec-link" data-counter-link href="/products/' + first.id + '"><span>View product</span>' + ARROW + "</a>" +
          "</div>" +
        "</div>" +
      "</section>"
    );
  }

  /* ---------- Today's menu: all seven bottles on one shelf ---------- */
  function menu(ctx, list) {
    var esc = ctx.escape;
    var items = list
      .map(function (p, i) {
        var off = !p.stock || !p.published;
        return (
          '<li class="d-shelf-item" style="' + ctx.capStyle(p) + '">' +
            '<a class="d-shelf-link" href="/products/' + p.id + '">' +
              '<span class="d-shelf-photo">' + ctx.image(p) + "</span>" +
              '<span class="d-shelf-no" aria-hidden="true">' + pad(i) + "</span>" +
              '<span class="d-shelf-name">' + esc(p.name) + "</span>" +
              '<span class="d-shelf-sub">' + esc(p.subtitle) + "</span>" +
            "</a>" +
            '<p class="d-shelf-meta"><span>' + esc(ctx.format[p.id] || "") + '</span><span class="d-shelf-price"><strong>' + ctx.money(p.price) + "</strong> <small>Demo price</small></span></p>" +
            '<button type="button" class="d-shelf-add" data-add="' + p.id + '" aria-label="Add ' + esc(p.name) + ' to bag"' + (off ? " disabled" : "") + ">" +
              PLUS + "<span>" + (off ? "Unavailable" : "Add") + "</span></button>" +
          "</li>"
        );
      })
      .join("");

    return (
      '<section class="d-menu" id="d-menu" aria-labelledby="d-menu-title">' +
        '<div class="d-menu-head">' +
          '<h2 id="d-menu-title">Today’s menu</h2>' +
          '<div class="d-menu-aside">' +
            "<p>All seven on one board. Open a line for the full product page, or add one straight to your bag.</p>" +
            '<p class="d-note">Prices are demonstrations. Pack sizes, serving amounts, directions and approved product descriptions will appear with the final labels.</p>' +
            ctx.link("Browse the shop", "/shop", "text-link") +
          "</div>" +
        "</div>" +
        '<ul class="d-shelf">' + items + "</ul>" +
      "</section>"
    );
  }

  /* ---------- Lot band: the bottle, turned over ---------- */
  function lot(ctx, first) {
    var band = typeof ctx.homeLot === "function" ? ctx.homeLot() : "";
    if (!band) return "";
    return '<div class="d-lot">' + band + '<div class="d-lot-object" aria-hidden="true"><span class="d-lot-turn">' + ctx.image(first) + "</span></div></div>";
  }

  window.BCCDirectionD = function (ctx) {
    var list = (ctx.list || []).filter(Boolean);
    if (!list.length) return "";
    var first =
      list.filter(function (p) {
        return p.id === "vitamin-d3-k2";
      })[0] || list[0];

    return (
      '<div class="d-home">' +
        hero(ctx, list, first) +
        shared("strip") +
        menu(ctx, list) +
        shared("evidence") +
        shared("voices") +
        lot(ctx, first) +
        shared("story") +
        shared("learn") +
        shared("care") +
      "</div>"
    );
  };

  /* Vertical index keys. The counter already handles ArrowLeft/ArrowRight on .counter-rail;
     this adds ArrowUp/ArrowDown/Home/End by focusing and activating the target button, which
     routes through the app's normal click handler (counter.pick). */
  document.addEventListener("keydown", function (e) {
    var keys = { ArrowUp: -1, ArrowDown: 1, Home: "first", End: "last" };
    if (!(e.key in keys)) return;
    var current = e.target && e.target.closest ? e.target.closest(".d-index [data-counter-pick]") : null;
    if (!current) return;
    var buttons = Array.prototype.slice.call(current.parentNode.querySelectorAll("[data-counter-pick]"));
    var i = buttons.indexOf(current);
    var step = keys[e.key];
    var next = step === "first" ? buttons[0] : step === "last" ? buttons[buttons.length - 1] : buttons[(i + step + buttons.length) % buttons.length];
    if (!next) return;
    e.preventDefault();
    next.focus();
    next.click();
  });
})();
