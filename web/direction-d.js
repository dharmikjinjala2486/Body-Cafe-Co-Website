/* Body Café Co. — Direction D, "The morning counter".
   A synthesis of A (warm, calm editorial reading), B (lavender / sage / indigo colour rhythm, arches)
   and C (Pick a cap counter, menu clarity).

   Contract: window.BCCDirectionD(ctx) returns the full homepage HTML string.
   ctx = { list, image, cap, capStyle, escape, money, format, shortName, link, menuBoard, homeLot }
   Shared sections come from window.BCCHome. No inline handlers, no external resources.

   The hero reuses the existing counter markup contract (data-counter, data-counter-ghost, .counter-stage,
   data-counter-bottle, data-counter-name/sub/format/price/link, .counter-rail, data-counter-pick + aria-pressed).
   It carries data-counter-manual: selection must only change on click, tap or arrow keys.
   See INTEGRATION-D.md for the two-line counter change this needs in app.js. */
(function () {
  "use strict";

  var PLUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';

  function shared(name, arg) {
    var home = window.BCCHome;
    return home && typeof home[name] === "function" ? home[name](arg) : "";
  }

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
    var caps = list
      .map(function (p) {
        var on = p.id === first.id;
        return (
          '<button type="button" class="d-cap" data-counter-pick="' + p.id + '" data-color="' + p.color + '" aria-pressed="' + on + '"' +
          ' aria-label="' + esc(p.name) + '">' + ctx.cap(p, "d-cap-disc") + '<span class="d-cap-label" aria-hidden="true">' + short(p) + "</span></button>"
        );
      })
      .join("");

    return (
      '<section class="d-hero" data-counter data-counter-manual style="' + ctx.capStyle(first) + '" aria-labelledby="d-hero-title">' +
        '<div class="d-hero-copy">' +
          '<p class="d-intro">A collection of seven everyday supplements</p>' +
          '<h1 id="d-hero-title" class="d-title">Seven everyday essentials. <span>Pick a cap.</span></h1>' +
          '<p class="d-lede">Iron, L-Theanine, Vitamin D3 + K2, Omega-3, Inositol, Creatine and Psyllium, ' +
          "each with its ingredient and format in plain view. Final labels and lot evidence are being prepared.</p>" +
          '<div class="d-actions">' + ctx.link("Shop all seven", "/shop", "button") + ctx.link("Explore our standards", "/standards", "text-link") + "</div>" +
        "</div>" +
        '<div class="d-picker">' +
          '<p class="d-picker-hint" id="d-picker-hint">Choose a cap to preview a product.<span class="d-key-hint"> Arrow keys move between caps.</span></p>' +
          '<div class="counter-rail d-rail" role="group" aria-label="Choose a product to preview" aria-describedby="d-picker-hint">' + caps + "</div>" +
        "</div>" +
        '<div class="counter-stage d-stage">' +
          '<div class="d-window">' +
            '<span class="d-ghost" aria-hidden="true" data-counter-ghost>' + short(first) + "</span>" +
            '<div class="d-bottles">' + bottles + "</div>" +
          "</div>" +
          '<div class="d-receipt" aria-live="polite">' +
            '<p class="d-receipt-top"><span>Now previewing</span><span data-counter-format>' + esc(ctx.format[first.id] || "") + "</span></p>" +
            '<p class="d-receipt-name" data-counter-name>' + esc(first.name) + "</p>" +
            '<p class="d-receipt-sub" data-counter-sub>' + esc(first.subtitle) + "</p>" +
            '<p class="d-receipt-line"><span>Demo price</span><span class="d-leader" aria-hidden="true"></span><strong data-counter-price>' + ctx.money(first.price) + "</strong></p>" +
            '<a class="d-receipt-link" data-counter-link href="/products/' + first.id + '">View product</a>' +
          "</div>" +
        "</div>" +
      "</section>"
    );
  }

  function menu(ctx, list) {
    var esc = ctx.escape;
    var rows = list
      .map(function (p) {
        var off = !p.stock || !p.published;
        return (
          '<li class="d-item" style="' + ctx.capStyle(p) + '">' +
            '<a class="d-item-link" href="/products/' + p.id + '">' +
              '<span class="d-item-thumb">' + ctx.image(p) + "</span>" +
              '<span class="d-item-text"><span class="d-item-name">' + esc(p.name) + '</span><span class="d-item-sub">' + esc(p.subtitle) + "</span></span>" +
              '<span class="d-item-format">' + esc(ctx.format[p.id] || "") + "</span>" +
              '<span class="d-item-price"><strong>' + ctx.money(p.price) + "</strong><small>Demo price</small></span>" +
            "</a>" +
            '<button type="button" class="d-item-add" data-add="' + p.id + '" aria-label="Add ' + esc(p.name) + ' to bag"' + (off ? " disabled" : "") + ">" +
              PLUS + "<span>" + (off ? "Unavailable" : "Add") + "</span></button>" +
          "</li>"
        );
      })
      .join("");

    return (
      '<section class="d-menu" id="d-menu" aria-labelledby="d-menu-title">' +
        '<div class="d-menu-head">' +
          '<h2 id="d-menu-title">Today’s menu</h2>' +
          "<p>All seven on one board. Open a line for the full product page, or add one straight to your bag.</p>" +
          '<p class="d-note">Prices are demonstrations. Pack sizes, serving amounts, directions and approved product descriptions will appear with the final labels.</p>' +
          ctx.link("Browse the shop", "/shop", "text-link") +
        "</div>" +
        '<ul class="d-menu-list">' + rows + "</ul>" +
      "</section>"
    );
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
        (typeof ctx.homeLot === "function" ? ctx.homeLot() : "") +
        shared("story") +
        shared("learn") +
        shared("care") +
      "</div>"
    );
  };
})();
