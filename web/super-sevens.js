/* Body Café Co. — Variant E · The Super Sevens.
   A seven-segment digit has exactly seven segments, and the range has exactly seven products. Each product owns one
   segment, in catalogue order: a 01 · b 02 · c 03 · d 04 · e 05 · f 06 · g 07. Segments a, b and c draw the "7".
   The segments double as a numeral system: counts, prices, lot codes and page numbers are written in cap colours.

   This layer sits on top of living-e.js / living-e-pages.js and changes presentation only. Facts shown here come from
   the catalogue and the supplied label records; a fact-based line is shown only while the label still matches it.
   No benefit claims, no "take all seven", no complete-the-set incentives. */
(function () {
  "use strict";
  var L = window.BCCLivingE, S = window.BCCSite, EH = window.BCCEH;
  if (!L || !S || !EH) return;
  var esc = L.esc, pad = L.pad, frag = L.frag, h = EH.h;
  var RELEASE = window.BCCRelease || {};

  function reduced() { return matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function fine() { return matchMedia("(hover: hover) and (pointer: fine)").matches; }
  function local(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function session(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }
  function int(s) { var m = String(s || "").replace(/,/g, "").match(/\d+/); return m ? Number(m[0]) : 0; }
  var LETTERS = "abcdefg";
  var SPIN = { "iron-bisglycinate": 1, "l-theanine": 1, "vitamin-d3-k2": 1, "omega-3-fish-oil": 1, "myo-d-chiro-inositol": 1, "creatine-chews": 1, "psyllium-husk": 1 };
  var FRAMES = 24;

  /* The cast: segment colours follow the catalogue. Kept current on every render so behaviour code can use it. */
  var CAST = { colors: [], byId: {}, list: [] };
  function cast(ctx) {
    CAST.list = ctx.catalog.slice(0, 7);
    CAST.colors = CAST.list.map(function (p) { return p.color; });
    CAST.byId = {};
    ctx.catalog.forEach(function (p, i) { CAST.byId[p.id] = { color: p.color, ink: ctx.onCap(p.color), i: i, name: p.name }; });
    return CAST;
  }
  function segOf(ctx, p) { var i = ctx.catalog.indexOf(p); return i >= 0 && i < 7 ? i : -1; }

  /* ====================================================================== 1. Seven-segment glyphs */
  var W = 120, H = 200, T = 18, G = 4.5, SKEW = 21;
  function hSeg(x0, x1, y) { var t = T / 2; return [[x0, y], [x0 + t, y - t], [x1 - t, y - t], [x1, y], [x1 - t, y + t], [x0 + t, y + t]]; }
  function vSeg(x, y0, y1) { var t = T / 2; return [[x, y0], [x + t, y0 + t], [x + t, y1 - t], [x, y1], [x - t, y1 - t], [x - t, y0 + t]]; }
  var X0 = T / 2, X1 = W - T / 2, Y0 = T / 2, YM = H / 2, Y1 = H - T / 2;
  var GEO = [
    hSeg(X0 + G, X1 - G, Y0), vSeg(X1, Y0 + G, YM - G), vSeg(X1, YM + G, Y1 - G), hSeg(X0 + G, X1 - G, Y1),
    vSeg(X0, YM + G, Y1 - G), vSeg(X0, Y0 + G, YM - G), hSeg(X0 + G, X1 - G, YM),
  ].map(function (pts) { return pts.map(function (q) { return q[0].toFixed(1) + "," + q[1].toFixed(1); }).join(" "); });
  var MAP = {
    "0": "abcdef", "1": "bc", "2": "abdeg", "3": "abcdg", "4": "bcfg", "5": "acdfg", "6": "acdefg", "7": "abc", "8": "abcdefg", "9": "abcdfg",
    "-": "g", "_": "d", A: "abcefg", B: "cdefg", C: "adef", D: "bcdeg", E: "adefg", F: "aefg", G: "acdef", H: "bcefg", I: "ef", J: "bcde",
    K: "bcefg", L: "def", M: "aceg", N: "ceg", O: "abcdef", P: "abefg", Q: "abcfg", R: "eg", S: "acdfg", T: "defg", U: "bcdef", V: "cde",
    W: "bdf", X: "bcefg", Y: "bcdfg", Z: "abdeg",
  };
  /* o.color: one colour for every lit segment; otherwise each lit segment takes its product's cap colour.
     o.ghost: "cast" draws unlit segments faintly in their own colours, true draws them as a faint rule. */
  function glyph(ch, o) {
    o = o || {};
    var on = MAP[String(ch).toUpperCase()] || "";
    var only = o.only == null ? -1 : o.only;
    var polys = GEO.map(function (pts, i) {
      var lit = only >= 0 ? i === only : on.indexOf(LETTERS[i]) !== -1;
      if (!lit && !o.ghost) return "";
      var c = o.color || CAST.colors[i] || "currentColor";
      return '<polygon class="ss-s' + (lit ? " is-on" : " is-off") + (o.ghost === "cast" ? " is-cast" : "") + '" data-seg="' + i + '" points="' + pts + '" style="--c:' + c + '"/>';
    }).join("");
    return '<svg class="ss-g' + (o.cls ? " " + o.cls : "") + '" viewBox="0 0 ' + (W + SKEW + 2) + " " + H + '" aria-hidden="true" focusable="false"><g transform="translate(' + (SKEW + 1) + ' 0) skewX(-6)">' + polys + "</g></svg>";
  }
  /* A string in segments. Characters with no segment form (₹ , . / ·) are set as type beside the glyphs. */
  function num(str, o) {
    o = o || {};
    str = String(str);
    var html = str.split("").map(function (ch) {
      if (ch === " ") return '<span class="ss-sp"></span>';
      return MAP[ch.toUpperCase()] !== undefined ? glyph(ch, o) : '<span class="ss-sym">' + esc(ch) + "</span>";
    }).join("");
    return '<span class="ss-num' + (o.numCls ? " " + o.numCls : "") + '"' + (o.label === false ? ' aria-hidden="true"' : ' role="img" aria-label="' + esc(o.label || str) + '"') + ">" + html + "</span>";
  }
  /* The mark: the 7 bright, the four other members present as faint colour. */
  function mark(o) {
    o = o || {};
    var polys = GEO.map(function (pts, i) {
      var c = CAST.colors[i] || "#2d2926", in7 = i < 3;
      return '<polygon class="ss-ms' + (in7 ? " is-seven" : "") + '" data-ss-seg="' + i + '" points="' + pts + '" style="--c:' + c + ";--d:" + i + '"/>';
    }).join("");
    return '<svg class="ss-mark' + (o.cls ? " " + o.cls : "") + '" viewBox="0 0 ' + (W + SKEW + 2) + " " + H + '" aria-hidden="true" focusable="false"><g transform="translate(' + (SKEW + 1) + ' 0) skewX(-6)">' + polys + "</g></svg>";
  }
  function markSVGString(lit) {
    var polys = GEO.map(function (pts, i) {
      var c = CAST.colors[i] || "#2d2926", on = lit == null ? i < 3 : i === lit;
      return '<polygon points="' + pts + '" fill="' + c + '" opacity="' + (on ? 1 : 0.2) + '"/>';
    }).join("");
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + (W + SKEW + 2) + " " + H + '"><g transform="translate(' + (SKEW + 1) + ' 0) skewX(-6)">' + polys + "</g></svg>";
  }
  function segName(i) { return "Segment " + LETTERS[i]; }

  /* ====================================================================== 2. Fact-based roles (shown only while the label matches) */
  function amount(p) { return String(p.amount_per_serving || ""); }
  function dir(p) { return String(p.directions || ""); }
  var ROLE = {
    "iron-bisglycinate": { nick: "The Morning One", line: "One capsule in the morning, on an empty stomach, as the label directs.", ok: function (p) { return /morning/i.test(dir(p)) && /empty stomach/i.test(dir(p)); } },
    "l-theanine": { nick: "The Thirty", line: "Thirty capsules to a pack, 200 mg L-Theanine in each.", ok: function (p) { return /200 mg/.test(amount(p)) && int(p.pack_size) === 30; } },
    "vitamin-d3-k2": { nick: "The Trio", line: "Three nutrient entries in one softgel: D3, K2 and Omega-3.", ok: function (p) { return /600 IU/.test(amount(p)) && /55 mcg/.test(amount(p)) && /200 mg/.test(amount(p)); } },
    "omega-3-fish-oil": { nick: "The Big Number", line: "1,000 mg of fish oil concentrate, read down to 800 mg Omega-3.", ok: function (p) { return /1,000 mg/.test(amount(p)) && /800 mg/.test(amount(p)); } },
    "myo-d-chiro-inositol": { nick: "The Ratio", line: "Two inositols at 40 : 1, in a three-capsule serving.", ok: function (p) { return /40:1/.test(amount(p).replace(/\s/g, "")) && int(p.serving_size) === 3; } },
    "creatine-chews": { nick: "The Chew", line: "The only chewable of the seven. Orange flavour, two tablets a serving.", ok: function (p) { return /chew/i.test(p.format || "") && int(p.serving_size) === 2 && /orange/i.test(JSON.stringify(p)); } },
    "psyllium-husk": { nick: "The Night One", line: "Five capsules at night, with food and a full glass of water, as the label directs.", ok: function (p) { return /night/i.test(dir(p)) && int(p.serving_size) === 5; } },
  };
  function role(p) { var r = ROLE[p.id]; return r && r.ok(p) ? r : null; }
  function serving(p) {
    var n = int(p.serving_size) || 1, pack = int(p.pack_size), unit = String(p.serving_size || p.format || "").replace(/^[\d\s]+/, "").trim();
    var kind = /softgel/i.test(p.format || p.serving_size || "") ? "softgel" : /chew|tablet/i.test(p.format || p.serving_size || "") ? "chew" : "capsule";
    return { n: n, pack: pack, unit: unit || kind + "s", kind: kind, servings: int(p.servings_per_pack) || (pack && n ? Math.floor(pack / n) : 0) };
  }

  /* ====================================================================== 3. Sound (off by default) */
  var Sound = (function () {
    var ac = null, on = local("ss-sound") === "on";
    function ctx() { if (!ac) { var A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ac = new A(); } if (ac.state === "suspended") ac.resume(); return ac; }
    function env(g, t, a, d, peak) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
    function click(pitch) {
      if (!on) return; var c = ctx(); if (!c) return; var t = c.currentTime;
      var len = Math.floor(c.sampleRate * 0.03), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      var src = c.createBufferSource(); src.buffer = buf;
      var bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 2600 * (pitch || 1); bp.Q.value = 1.4;
      var g = c.createGain(); env(g, t, 0.002, 0.05, 0.35);
      src.connect(bp).connect(g).connect(c.destination); src.start(t);
      var o = c.createOscillator(), g2 = c.createGain(); o.type = "sine"; o.frequency.value = 1800 * (pitch || 1); env(g2, t, 0.002, 0.04, 0.06);
      o.connect(g2).connect(c.destination); o.start(t); o.stop(t + 0.08);
    }
    function tick(pitch) {
      if (!on) return; var c = ctx(); if (!c) return; var t = c.currentTime;
      var o = c.createOscillator(), g = c.createGain(); o.type = "triangle"; o.frequency.setValueAtTime(900 * (pitch || 1), t); o.frequency.exponentialRampToValueAtTime(380 * (pitch || 1), t + 0.05);
      env(g, t, 0.002, 0.06, 0.05); o.connect(g).connect(c.destination); o.start(t); o.stop(t + 0.1);
    }
    function pop() {
      if (!on) return; var c = ctx(); if (!c) return; var t = c.currentTime;
      var o = c.createOscillator(), g = c.createGain(); o.type = "sine"; o.frequency.setValueAtTime(620, t); o.frequency.exponentialRampToValueAtTime(140, t + 0.11);
      env(g, t, 0.004, 0.12, 0.22); o.connect(g).connect(c.destination); o.start(t); o.stop(t + 0.18);
    }
    function set(v) {
      on = !!v; local("ss-sound", on ? "on" : "off");
      document.querySelectorAll("[data-ss-sound]").forEach(sync);
      if (on) { ctx(); pop(); }
    }
    function sync(b) { b.setAttribute("aria-pressed", String(on)); var l = b.querySelector("[data-ss-sound-l]"); if (l) l.textContent = on ? "Sound on" : "Sound off"; }
    return { click: click, tick: tick, pop: pop, set: set, sync: sync, get on() { return on; } };
  })();
  var SPEAKER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path class="ss-wave" d="M15.5 9.2a4 4 0 0 1 0 5.6M18 7a7 7 0 0 1 0 10"/></svg>';
  function soundBtn(cls) { return '<button type="button" class="ss-sound ' + (cls || "") + '" data-ss-sound aria-pressed="' + Sound.on + '">' + SPEAKER + '<span data-ss-sound-l>' + (Sound.on ? "Sound on" : "Sound off") + "</span></button>"; }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-ss-sound]");
    if (b) Sound.set(!Sound.on);
  });

  /* ====================================================================== 4. A small 2D physics world (circles) */
  function World(canvas, o) {
    o = o || {};
    var ctx2 = canvas.getContext("2d"), bodies = [], raf = 0, last = 0, still = 0, dpr = 1, w = 0, hgt = 0, drag = null, self = this;
    var gravity = o.gravity || 2200, rest = o.restitution == null ? 0.28 : o.restitution, floorPad = o.floorPad || 0;
    function size() {
      var r = canvas.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.max(1, r.width); hgt = Math.max(1, r.height);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(hgt * dpr);
      ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
      bodies.forEach(function (b) { b.x = Math.min(Math.max(b.x, b.r), w - b.r); b.y = Math.min(b.y, hgt - b.r - floorPad); });
      draw();
    }
    function step(dt) {
      var i, j, a, b, n = bodies.length;
      for (i = 0; i < n; i++) {
        a = bodies[i];
        if (a === drag) continue;
        a.vy += gravity * dt; a.x += a.vx * dt; a.y += a.vy * dt; a.ang += a.va * dt;
        a.vx *= 0.999; a.va *= 0.985;
        var floor = hgt - a.r - floorPad;
        if (a.y > floor) { if (a.vy > 260 && o.onHit) o.onHit(a, a.vy); a.y = floor; a.vy = -a.vy * rest; a.vx *= 0.86; a.va = a.vx / a.r; if (Math.abs(a.vy) < 40) a.vy = 0; }
        if (a.x < a.r) { a.x = a.r; a.vx = Math.abs(a.vx) * rest; }
        if (a.x > w - a.r) { a.x = w - a.r; a.vx = -Math.abs(a.vx) * rest; }
        if (o.ceiling && a.y < a.r) { a.y = a.r; a.vy = Math.abs(a.vy) * rest; }
      }
      for (var it = 0; it < 2; it++) for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) {
        a = bodies[i]; b = bodies[j];
        var dx = b.x - a.x, dy = b.y - a.y, rr = a.r + b.r, d2 = dx * dx + dy * dy;
        if (d2 >= rr * rr || d2 === 0) continue;
        var d = Math.sqrt(d2), nx = dx / d, ny = dy / d, over = rr - d;
        var ma = a === drag ? 0 : 1 / (a.r * a.r), mb = b === drag ? 0 : 1 / (b.r * b.r), ms = ma + mb; if (!ms) continue;
        a.x -= nx * over * ma / ms; a.y -= ny * over * ma / ms; b.x += nx * over * mb / ms; b.y += ny * over * mb / ms;
        var vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (vn < 0) {
          var jn = -(1 + rest) * vn / ms;
          a.vx -= jn * nx * ma; a.vy -= jn * ny * ma; b.vx += jn * nx * mb; b.vy += jn * ny * mb;
          var tx = -ny, ty = nx, vt = (b.vx - a.vx) * tx + (b.vy - a.vy) * ty, jt = -vt * 0.12 / ms;
          a.vx -= jt * tx * ma; a.vy -= jt * ty * ma; b.vx += jt * tx * mb; b.vy += jt * ty * mb;
          a.va -= vt * 0.02; b.va += vt * 0.02;
          if (-vn > 420 && o.onHit) o.onHit(b, -vn);
        }
      }
    }
    function draw() {
      ctx2.clearRect(0, 0, w, hgt);
      for (var i = 0; i < bodies.length; i++) o.draw(ctx2, bodies[i]);
    }
    function loop(t) {
      raf = 0;
      var dt = Math.min(0.033, last ? (t - last) / 1000 : 0.016); last = t;
      var spawning = !!(o.spawn && o.spawn());
      var sub = 3; for (var s = 0; s < sub; s++) step(dt / sub);
      draw();
      var moving = bodies.some(function (b) { return Math.abs(b.vx) + Math.abs(b.vy) > 6; });
      still = moving || drag ? 0 : still + dt;
      if (still < 0.6 || spawning) raf = requestAnimationFrame(loop); else last = 0;
    }
    this.wake = function () { if (!raf) { still = 0; raf = requestAnimationFrame(loop); } };
    this.add = function (b) { b.vx = b.vx || 0; b.vy = b.vy || 0; b.va = b.va || 0; b.ang = b.ang || 0; bodies.push(b); this.wake(); return b; };
    this.clear = function () { bodies.length = 0; draw(); };
    this.bodies = bodies;
    this.size = size;
    this.dims = function () { return { w: w, h: hgt }; };
    this.stop = function () { if (raf) cancelAnimationFrame(raf); raf = 0; };
    if (o.draggable) {
      var px = 0, py = 0, pt = 0, vx = 0, vy = 0;
      canvas.addEventListener("pointerdown", function (e) {
        var r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        for (var i = bodies.length - 1; i >= 0; i--) { var b = bodies[i]; if ((b.x - x) * (b.x - x) + (b.y - y) * (b.y - y) < b.r * b.r * 1.3) { drag = b; break; } }
        if (!drag) return;
        canvas.setPointerCapture(e.pointerId); e.preventDefault();
        px = x; py = y; pt = performance.now(); drag.vx = drag.vy = 0; Sound.tick(1.3); self.wake();
      });
      canvas.addEventListener("pointermove", function (e) {
        if (!drag) return;
        var r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, t = performance.now(), dt = Math.max(8, t - pt) / 1000;
        vx = (x - px) / dt; vy = (y - py) / dt; px = x; py = y; pt = t;
        drag.x = Math.min(Math.max(x, drag.r), w - drag.r); drag.y = Math.min(Math.max(y, drag.r), hgt - drag.r - floorPad); drag.ang += vx * 0.0006;
      });
      function release() { if (!drag) return; drag.vx = Math.max(-2600, Math.min(2600, vx)); drag.vy = Math.max(-2600, Math.min(2600, vy)); drag.va = drag.vx / drag.r; drag = null; vx = vy = 0; self.wake(); }
      canvas.addEventListener("pointerup", release);
      canvas.addEventListener("pointercancel", release);
    }
  }

  /* Piece drawings. These are symbols for a format, never a picture of the product. */
  function rr(c, x, y, w2, h2, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w2, y, x + w2, y + h2, r); c.arcTo(x + w2, y + h2, x, y + h2, r); c.arcTo(x, y + h2, x, y, r); c.arcTo(x, y, x + w2, y, r); c.closePath(); }
  function drawPiece(c, b) {
    c.save(); c.translate(b.x, b.y); c.rotate(b.ang);
    var r = b.r;
    c.shadowColor = "rgba(45,41,38,0.18)"; c.shadowBlur = r * 0.35; c.shadowOffsetY = r * 0.12;
    if (b.kind === "capsule") {
      var L2 = r * 1.9, Wd = r * 1.04;
      rr(c, -L2 / 2, -Wd / 2, L2, Wd, Wd / 2); c.fillStyle = "#f4efe6"; c.fill(); c.shadowColor = "transparent";
      c.save(); c.clip(); c.fillStyle = b.color; c.fillRect(-L2 / 2, -Wd / 2, L2 / 2, Wd); c.restore();
      rr(c, -L2 / 2, -Wd / 2, L2, Wd, Wd / 2); c.strokeStyle = "rgba(45,41,38,0.18)"; c.lineWidth = 1; c.stroke();
      c.fillStyle = "rgba(255,255,255,0.55)"; rr(c, -L2 / 2 + Wd * 0.3, -Wd * 0.34, L2 - Wd * 0.6, Wd * 0.16, Wd * 0.08); c.fill();
    } else if (b.kind === "softgel") {
      c.beginPath(); c.ellipse(0, 0, r * 0.98, r * 0.66, 0, 0, Math.PI * 2); c.fillStyle = b.color; c.globalAlpha = 0.92; c.fill(); c.globalAlpha = 1; c.shadowColor = "transparent";
      var gr = c.createRadialGradient(-r * 0.3, -r * 0.25, r * 0.05, 0, 0, r); gr.addColorStop(0, "rgba(255,255,255,0.75)"); gr.addColorStop(0.35, "rgba(255,255,255,0.12)"); gr.addColorStop(1, "rgba(0,0,0,0.12)");
      c.fillStyle = gr; c.fill();
    } else {
      c.beginPath(); c.arc(0, 0, r * 0.94, 0, Math.PI * 2); c.fillStyle = b.color; c.fill(); c.shadowColor = "transparent";
      c.strokeStyle = "rgba(255,255,255,0.45)"; c.lineWidth = Math.max(1, r * 0.08); c.beginPath(); c.moveTo(-r * 0.55, 0); c.lineTo(r * 0.55, 0); c.stroke();
      c.beginPath(); c.arc(0, 0, r * 0.94, 0, Math.PI * 2); c.strokeStyle = "rgba(45,41,38,0.16)"; c.lineWidth = 1; c.stroke();
    }
    c.restore();
  }

  /* ====================================================================== 5. Shared pieces of markup */
  function img(src, alt, w2, h2, o) { o = o || {}; return '<img src="' + src + '" alt="' + esc(alt || "") + '" width="' + w2 + '" height="' + h2 + '" decoding="async"' + (o.eager ? ' fetchpriority="high"' : ' loading="lazy"') + (o.cls ? ' class="' + o.cls + '"' : "") + ">"; }
  function tq(ctx, p, o) {
    if (SPIN[p.id]) return img("/web/media/renders/" + esc(p.id) + "-three-quarter.webp", "", /iron|theanine|vitamin/.test(p.id) ? 629 : 517, 1000, o);
    return h.front(ctx, p, { alt: "" });
  }
  function capImg(ctx, p, cls) { return L.cap(ctx, p, cls || "ss-capimg"); }
  function spin(ctx, p, o) {
    o = o || {};
    if (!SPIN[p.id]) return '<div class="ss-spin is-static">' + h.front(ctx, p, { alt: esc(p.name) + ", front of the bottle (draft packaging)" }) + "</div>";
    return '<div class="ss-spin' + (o.cls ? " " + o.cls : "") + '" data-ss-spin="' + esc(p.id) + '" tabindex="0" role="slider" aria-label="Turn the ' + esc(p.name) + ' bottle" aria-valuemin="0" aria-valuemax="345" aria-valuenow="0" aria-valuetext="Front of the bottle">' +
      img("/web/media/spin/" + esc(p.id) + "-00.webp", "", 520, 860, { eager: o.eager }) + (o.lens ? '<span class="ss-lens" data-ss-lens aria-hidden="true"></span>' : "") +
      (o.hint === false ? "" : '<span class="ss-spin-hint" aria-hidden="true"><i></i>Drag to turn</span>') + "</div>";
  }
  function addBtn(ctx, p, cls, label) { return h.addBtn(ctx, p, cls || "x-btn", label); }

  /* The Super Sevens card: 63 × 88 mm (standard playing-card proportion). Both faces are real text. */
  function card(ctx, p, o) {
    o = o || {};
    var i = segOf(ctx, p), r = role(p), s = serving(p), no = pad(ctx.catalog.indexOf(p) + 1), total = pad(Math.max(7, ctx.catalog.length));
    var facts = [["Format", ctx.format[p.id] || p.format], ["Pack", p.pack_size], ["Serving", p.serving_size], ["Servings", p.servings_per_pack], ["Per serving", p.amount_per_serving]].filter(function (x) { return x[1]; });
    return '<article class="ss-card' + (o.cls ? " " + o.cls : "") + '" style="' + ctx.capStyle(p) + '" data-ss-card="' + esc(p.id) + '" aria-label="' + esc(p.name) + ' card">' +
      '<div class="ss-card-in">' +
      '<div class="ss-card-face ss-card-front">' +
        '<div class="ss-card-band"><span class="ss-card-no">' + num(no, { color: "var(--on-cap)", label: "Number " + no }) + "</span>" + (i >= 0 ? '<span class="ss-card-seg" title="' + segName(i) + '">' + glyph("8", { only: i, ghost: true, color: "var(--on-cap)", cls: "ss-g-mini" }) + "</span>" : "") + "</div>" +
        '<p class="ss-card-nick">' + (r ? esc(r.nick) : esc(ctx.format[p.id] || "")) + "</p>" +
        '<div class="ss-card-art">' + tq(ctx, p) + "</div>" +
        '<h3 class="ss-card-name e-name">' + esc(p.name) + "</h3>" +
        '<p class="ss-card-meta">' + esc([ctx.format[p.id], p.pack_size].filter(Boolean).join(" · ")) + "</p>" +
        '<p class="ss-card-foot"><span>The Super Sevens</span><span>' + no + " / " + total + "</span></p>" +
      "</div>" +
      '<div class="ss-card-face ss-card-back">' +
        '<p class="ss-card-k">' + (i >= 0 ? segName(i) + " · " : "") + no + " / " + total + "</p>" +
        '<h3 class="ss-card-name e-name">' + esc(p.name) + "</h3>" +
        (r ? '<p class="ss-card-line">' + esc(r.line) + "</p>" : "") +
        '<dl class="ss-card-facts">' + facts.map(function (f) { return "<div><dt>" + f[0] + "</dt><dd>" + esc(f[1]) + "</dd></div>"; }).join("") + "</dl>" +
        '<p class="ss-card-src">From the supplied label. Read the full label before use.</p>' +
        '<p class="ss-card-foot"><span>Body Café Co.</span><span>' + (s.servings ? s.servings + " servings" : "") + "</span></p>" +
      "</div>" +
      '<span class="ss-card-corner" aria-hidden="true">' + ICON.flip + "</span></div>" +
      (o.acts === false ? "" : '<div class="ss-card-acts">' + flipBtn() +
      (o.link ? '<a class="ss-pill is-solid" href="/products/' + esc(p.id) + '"><span>View</span>' + ICON.arrow + "</a>" : "") +
      (o.save === false ? "" : '<button type="button" class="ss-pill" data-ss-save="' + esc(p.id) + '">' + ICON.save + "<span>Save</span></button>") + "</div>") + "</article>";
  }
  var ICON = {
    flip: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 14-5.3"/><path d="M18 3v4h-4"/><path d="M20 12a8 8 0 0 1-14 5.3"/><path d="M6 21v-4h4"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13"/><path d="m13 6 6 6-6 6"/></svg>',
    save: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></svg>',
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>',
  };
  function flipBtn(label) { return '<button type="button" class="ss-pill" data-ss-flip aria-pressed="false">' + ICON.flip + "<span>" + (label || "Flip") + "</span></button>"; }

  /* ====================================================================== 6. Home */
  function hero(ctx) {
    var list = CAST.list, n = ctx.published.length;
    return '<section class="ss-hero" data-home-section="hero" aria-labelledby="ss-hero-t">' +
      '<div class="ss-hero-copy"><p class="ez-k ss-kicker">The Super Sevens · Body Café Co.</p>' +
      '<h1 id="ss-hero-t">Seven supplements. <span>One colour each.</span></h1>' +
      '<p class="ez-lede">A seven-segment seven has exactly seven parts. So do we. Each supplement owns one segment, in its own cap colour, with every label fact in readable text.</p>' +
      '<div class="ez-actions"><a class="x-btn" href="/shop"><span>Shop all ' + (n === 7 ? "seven" : n) + '</span></a><a class="x-link" href="/super-sevens">Meet the Super Sevens</a></div>' +
      (RELEASE.production ? "" : '<p class="ez-small">Review preview · current project prices · ordering is not live.</p>') + "</div>" +
      '<div class="ss-hero-stage" data-ss-hero>' +
        '<div class="ss-hero-markwrap"><div class="ss-hero-mark" data-ss-hero-mark>' + mark({ cls: "is-hero" }) + '</div>' +
        '<p class="ss-readout" data-ss-readout aria-hidden="true"><span data-ss-readout-k>Seven segments</span><strong data-ss-readout-v>Seven supplements</strong></p>' +
        '<button type="button" class="ss-replay" data-ss-replay aria-label="Replay the light-up"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12a7 7 0 1 0 2.1-5"/><path d="M5 4v4h4"/></svg></button></div>' +
        '<ol class="ss-legend" aria-label="The Super Sevens, one segment each">' + list.map(function (p, i) {
          return '<li style="' + ctx.capStyle(p) + '"><a href="/products/' + esc(p.id) + '" data-ss-seg-link="' + i + '"><span class="ss-legend-g">' + glyph("8", { only: i, ghost: true }) + '</span><span class="ss-legend-no">' + LETTERS[i] + " · " + pad(i + 1) + '</span><span class="ss-legend-name">' + esc(p.name) + "</span></a></li>";
        }).join("") + "</ol>" +
        soundBtn("ss-hero-sound") + "</div></section>";
  }

  function roll(ctx) {
    var list = ctx.published;
    return '<section class="ss-roll" data-ss-roll data-home-section="collection" id="collection" aria-labelledby="ss-roll-t" style="--n:' + list.length + '">' +
      '<header class="ss-roll-head ez-sec-head"><p class="ez-k">Roll call</p><h2 id="ss-roll-t">Meet the Super Sevens.</h2><p>One segment, one colour and one format each. Scroll through the line-up, or drag any bottle to turn it.</p></header>' +
      '<div class="ss-roll-track" data-ss-roll-track><div class="ss-roll-stage">' +
      '<ol class="ss-roll-dots" aria-label="Jump to a member">' + list.map(function (p, i) { return '<li><button type="button" data-ss-roll-go="' + i + '" style="' + ctx.capStyle(p) + '" aria-label="' + pad(i + 1) + " " + esc(p.name) + '"><span></span></button></li>'; }).join("") + "</ol>" +
      list.map(function (p, i) {
        var r = role(p), si = segOf(ctx, p), on = L.avail(p);
        return '<article class="ss-member" data-ss-member="' + i + '" style="' + ctx.capStyle(p) + '"' + (i === 0 ? " data-on" : "") + ' aria-labelledby="ss-m-' + esc(p.id) + '">' +
          '<div class="ss-member-num" aria-hidden="true">' + num(pad(i + 1), { ghost: true, color: "var(--cap)", label: false }) + (si >= 0 ? '<span class="ss-member-seg">' + glyph("8", { only: si, ghost: true, color: "var(--cap)", cls: "ss-g-mini" }) + segName(si) + "</span>" : "") + "</div>" +
          '<div class="ss-member-art">' + spin(ctx, p, { hint: i === 0 }) + '<span class="ss-member-shadow" aria-hidden="true"></span></div>' +
          '<div class="ss-member-facts"><p class="ez-k">' + pad(i + 1) + " / " + pad(list.length) + " · " + esc(ctx.format[p.id] || "") + "</p>" +
          (r ? '<p class="ss-member-nick">' + esc(r.nick) + "</p>" : "") +
          '<h3 class="e-name" id="ss-m-' + esc(p.id) + '"><a href="/products/' + esc(p.id) + '">' + esc(p.name) + "</a></h3>" +
          '<p class="ss-member-line">' + esc(r ? r.line : p.subtitle || "") + "</p>" +
          '<dl class="ss-member-dl">' + [["Pack", p.pack_size], ["Serving", p.serving_size], ["Servings", p.servings_per_pack]].filter(function (x) { return x[1]; }).map(function (x) { return "<div><dt>" + x[0] + "</dt><dd>" + esc(x[1]) + "</dd></div>"; }).join("") + "</dl>" +
          '<div class="ss-member-buy"><p class="ss-member-price">' + ctx.money(p.price) + " <small>" + (on ? "MRP" : "Unavailable") + '</small></p><a class="x-btn" href="/products/' + esc(p.id) + '"><span>View ' + esc(p.name) + "</span></a>" + addBtn(ctx, p, "x-link ez-add", "Add to bag") + "</div></div></article>";
      }).join("") + "</div></div></section>";
  }

  function pour(ctx, only) {
    var list = only ? [only] : ctx.published, first = list[0], s = serving(first);
    var data = list.map(function (p) { var v = serving(p); return { id: p.id, name: p.name, color: p.color, n: v.n, pack: v.pack, unit: v.unit, kind: v.kind, servings: v.servings, serving: p.serving_size || "", packText: p.pack_size || "" }; });
    return '<section class="ss-pour' + (only ? " is-single pp-sec" : "") + '" data-ss-pour' + (only ? "" : ' data-home-section="pour"') + ' aria-labelledby="ss-pour-t" style="' + ctx.capStyle(first) + '">' +
      (only ? '<div class="pp-sec-in"><header class="pp-head"><p class="pp-k"><span class="pp-k-n">00</span><span class="pp-k-l">One serving</span><span class="pp-k-of">/ 00</span></p><h2 id="ss-pour-t">Pour one serving.</h2></header><div class="pp-body">'
        : '<header class="ez-sec-head"><p class="ez-k">Pour one serving</p><h2 id="ss-pour-t">How much is one serving?</h2><p>Pick a cap, then pour. One pour drops exactly one serving as printed on that label. Or pour the whole pack and watch it count.</p></header>') +
      '<div class="ss-pour-ui">' +
      (only ? "" : '<div class="ss-pour-picks" role="group" aria-label="Choose a product">' + list.map(function (p, i) { return '<button type="button" data-ss-pour-pick="' + i + '" aria-pressed="' + (i === 0) + '" style="' + ctx.capStyle(p) + '">' + capImg(ctx, p, "ss-pour-cap") + '<span>' + esc(p.name) + "</span></button>"; }).join("") + "</div>") +
      '<div class="ss-pour-tray"><canvas data-ss-pour-canvas aria-hidden="true"></canvas>' +
        '<div class="ss-pour-count"><span data-ss-pour-n>' + num("0", { color: "var(--cap)", ghost: true, label: "0" }) + '</span><span class="ss-pour-unit" data-ss-pour-unit>' + esc(s.unit) + "</span></div>" +
        '<p class="ss-pour-empty" data-ss-pour-empty>The tray is empty.</p></div>' +
      '<div class="ss-pour-acts"><button type="button" class="x-btn" data-ss-pour-one><span>Pour one serving</span></button><button type="button" class="x-link ez-linkbtn" data-ss-pour-pack>Pour the whole pack</button><button type="button" class="x-link ez-linkbtn" data-ss-pour-clear>Clear</button></div>' +
      '<p class="ss-pour-cap-t" data-ss-pour-caption aria-live="polite"></p>' +
      '<p class="ez-small">Shapes are symbols for each format, not the actual appearance. Serving and pack sizes are from the label.</p></div>' +
      '<script type="application/json" data-ss-pour-data>' + JSON.stringify(data).replace(/</g, "\\u003c") + "</script>" +
      (only ? "</div></div>" : "") + "</section>";
  }

  /* The deck: one card in the spotlight, all seven always visible in the rail below. */
  function cards(ctx) {
    var list = ctx.published;
    return '<section class="ss-cards-sec" data-home-section="cards" aria-labelledby="ss-cards-t"><header class="ez-sec-head"><p class="ez-k">The Super Sevens cards</p><h2 id="ss-cards-t">Seven cards. All facts.</h2><p>Every member has a card. The front is the colour and the bottle; the back is the label, in plain type. Pick one, tap it to flip, or save it.</p></header>' +
      '<div class="ss-deck" data-ss-deck>' +
      '<div class="ss-deck-stage">' + list.map(function (p, i) { return '<div class="ss-deck-slot" data-ss-deck-card="' + i + '"' + (i ? " hidden" : "") + ">" + card(ctx, p, { cls: "is-feature", acts: false }) + "</div>"; }).join("") + "</div>" +
      '<div class="ss-deck-info">' + list.map(function (p, i) {
        var r = role(p), si = segOf(ctx, p);
        return '<div class="ss-deck-panel" data-ss-deck-panel="' + i + '" style="' + ctx.capStyle(p) + '"' + (i ? " hidden" : "") + ">" +
          '<p class="ez-k">' + pad(i + 1) + " / " + pad(list.length) + (si >= 0 ? " · " + segName(si) : "") + "</p>" +
          '<p class="ss-deck-nick">' + esc(r ? r.nick : ctx.format[p.id] || "") + "</p>" +
          '<h3 class="e-name">' + esc(p.name) + "</h3>" +
          '<p class="ss-deck-line">' + esc(r ? r.line : p.subtitle || "") + "</p>" +
          '<div class="ss-deck-acts">' + flipBtn("Flip card") + '<button type="button" class="ss-pill" data-ss-save="' + esc(p.id) + '">' + ICON.save + '<span>Save image</span></button></div>' +
          '<div class="ss-deck-buy"><p>' + ctx.money(p.price) + ' <small>MRP</small></p><a class="ss-pill is-solid is-big" href="/products/' + esc(p.id) + '"><span>View ' + esc(p.name) + "</span>" + ICON.arrow + "</a></div></div>";
      }).join("") + "</div>" +
      '<div class="ss-deck-rail" role="tablist" aria-label="Choose a card">' + list.map(function (p, i) {
        return '<button type="button" role="tab" data-ss-deck-pick="' + i + '" aria-selected="' + (i === 0) + '" tabindex="' + (i ? -1 : 0) + '" style="' + ctx.capStyle(p) + '"><span class="ss-rail-band">' + num(pad(i + 1), { color: "var(--on-cap)", label: false }) + '</span><span class="ss-rail-art">' + tq(ctx, p) + '</span><span class="ss-rail-name">' + esc(p.name) + "</span></button>";
      }).join("") + "</div></div>" +
      '<p class="ez-sec-foot"><a class="x-link" href="/super-sevens">See every card on one page</a></p></section>';
  }

  /* Testimonials: only real, published, verified reviews from the reviews API. Never written or chosen by us. */
  function voices(ctx) {
    var list = ctx.published;
    return '<section class="ss-voices" data-ss-voices data-home-section="voices" aria-labelledby="ss-voices-t">' +
      '<header class="ez-sec-head"><p class="ez-k">Voices</p><h2 id="ss-voices-t">Real words, only.</h2><p>Reviews come from customers whose order was delivered. Moderators check each one and publish it whatever the rating. We never write, buy or hand-pick them.</p></header>' +
      '<div class="ss-voices-stats" data-ss-voices-stats><div><span class="ss-voices-n" data-ss-v-count>' + num("0", { ghost: true, label: "0" }) + '</span><span class="ez-k">published reviews</span></div><div><span class="ss-voices-n" data-ss-v-avg>' + num("-.-", { ghost: true, label: "No average yet" }) + '</span><span class="ez-k">average out of 5</span></div><p class="ss-voices-status" data-ss-v-status aria-live="polite">Looking for published reviews…</p></div>' +
      '<ol class="ss-voices-list" data-ss-voices-list>' + list.map(function (p) {
        return '<li class="ss-quote is-empty" style="' + ctx.capStyle(p) + '"><span class="ss-quote-mark" aria-hidden="true">“</span><p class="ss-quote-text">The first verified review of <strong>' + esc(p.name) + "</strong> will appear here.</p>" +
          '<p class="ss-quote-who"><span class="ez-chip-dot" aria-hidden="true"></span>' + esc(p.name) + "</p></li>";
      }).join("") + "</ol>" +
      '<ol class="ss-voices-how">' + [["Delivered first", "Only customers whose order with that product was delivered can review it."], ["Checked, not chosen", "Moderators check for privacy and safety, not for praise. Low ratings are published too."], ["Disclosed", "If a reviewer ever received anything in return, the review says so."]].map(function (x, i) {
        return '<li><span class="ss-voices-step">' + num(String(i + 1), { label: String(i + 1) }) + "</span><div><strong>" + x[0] + "</strong><p>" + x[1] + "</p></div></li>";
      }).join("") + "</ol>" +
      '<p class="ez-sec-foot"><a class="x-link" href="/account">Received your order? Review it from your account</a></p></section>';
  }

  function base(lot, color) {
    return '<div class="ss-base" aria-hidden="true" style="--cap:' + (color || "var(--ink)") + '"><div class="ss-base-disc"><span class="ss-base-ring"></span><span class="ss-base-k">Lot</span><span class="ss-base-lot" data-ss-base-lot>' + num(lot || "--------", { color: "var(--cap)", ghost: true, label: false }) + '</span><span class="ss-base-k ss-base-k2">Printed on every pack</span></div></div>';
  }
  function turn(ctx) {
    var c = S.copy.reports;
    return '<section class="ez-lot ss-turn" data-home-section="lot" aria-labelledby="ss-turn-t"><div class="ez-lot-copy"><p class="ez-k">Turn it over</p><h2 id="ss-turn-t">Every bottle has a lot number.</h2><p>' + c.what + '</p><p class="ez-small"><a class="x-link" href="/learn/understanding-reports">What a lot report shows, and what it can’t</a></p></div>' +
      '<div class="ss-turn-in">' + base("", CAST.colors[0]) + '<div class="ez-lot-form">' + h.homeLotForm(ctx, "x-lotform e-lotform") + "</div></div></section>";
  }

  L.replace("home", (function (prev) {
    return function (ctx) {
      cast(ctx);
      if (!ctx.published.length) return prev(ctx);
      var old = frag(prev(ctx)), keep = ["trust", "learn", "faq"].map(function (k) { var el = old.querySelector('[data-home-section="' + k + '"]'); return el ? el.outerHTML : ""; }).join("");
      return '<div class="ss-home">' + hero(ctx) + roll(ctx) + pour(ctx) + cards(ctx) + voices(ctx) + turn(ctx) + keep + "</div>";
    };
  })(S.themes.e.home));

  /* ====================================================================== 7. The Super Sevens page (/super-sevens) and 404 */
  function superPage(ctx) {
    var list = ctx.published;
    var digits = "0123456789".split("");
    return '<div class="x-page ss-page">' +
      '<header class="ss-page-head"><div><p class="ez-k">Body Café Co. presents</p><h1>The Super Sevens</h1><p class="ez-lede">Seven supplements, seven segments, seven cards. The name is for the set; it isn’t a promise about results, and nobody needs all seven.</p></div><div class="ss-page-mark">' + mark({ cls: "is-page" }) + "</div></header>" +
      '<section class="ss-page-cards" aria-labelledby="ss-pc-t"><header class="ez-sec-head"><p class="ez-k">The cards</p><h2 id="ss-pc-t">Flip, tilt, save.</h2><p>Each card is 63 × 88 mm, the size of a playing card. Saved images are 1260 × 1760 pixels.</p></header>' +
      '<ol class="ss-card-grid">' + list.map(function (p) { return "<li>" + card(ctx, p, { link: true }) + "</li>"; }).join("") + "</ol></section>" +
      '<section class="ss-page-seg" aria-labelledby="ss-ps-t"><header class="ez-sec-head"><p class="ez-k">How the segments work</p><h2 id="ss-ps-t">Every number, written in caps.</h2><p>A digit lights the segments it needs, and each segment keeps its owner’s colour. Prices, counts and lot numbers across the site are set this way.</p></header>' +
      '<ol class="ss-digits">' + digits.map(function (d) {
        var on = MAP[d], who = on.split("").map(function (l) { var p = CAST.list[LETTERS.indexOf(l)]; return p ? p.name : ""; }).filter(Boolean);
        return '<li><span class="ss-digit-g">' + glyph(d, { ghost: true }) + '</span><span class="ss-digit-k">' + d + '</span><span class="ss-digit-who">' + who.length + " of 7 · " + esc(who.join(", ")) + "</span></li>";
      }).join("") + "</ol></section>" +
      '<section class="ss-page-rules" aria-labelledby="ss-pr-t"><header class="ez-sec-head"><p class="ez-k">House rules</p><h2 id="ss-pr-t">What “Super Sevens” never means.</h2></header><ol class="ss-rules">' +
      ["It doesn’t mean the products are superior, stronger or clinically better.", "It isn’t a seven-day plan or a reason to take all seven. Choose what suits you, and ask a healthcare professional if you’re unsure.", "Nicknames come from facts on each label, such as format, pack size or directions. They never describe effects.", "The cards repeat label facts. The full label on your pack comes first."].map(function (x, i) { return '<li><span class="ss-rule-n">' + num(String(i + 1), { label: String(i + 1) }) + "</span><p>" + x + "</p></li>"; }).join("") +
      "</ol></section>" +
      '<nav class="x-next" aria-label="Keep going"><a class="x-link" href="/shop">Shop the line-up</a><a class="x-link" href="/about">About Body Café Co.</a><a class="x-link" href="/reports">Find a lot report</a></nav></div>';
  }
  function lost(ctx) {
    var list = CAST.list, miss = Math.floor(Math.random() * list.length);
    return '<div class="x-page ss-404" data-ss-404>' +
      '<header class="ss-404-head"><p class="ez-k">404 · Page not found</p><h1>One of the seven rolled away.</h1><p class="ez-lede">This page isn’t here. While you’re looking, one cap is hiding somewhere on this page.</p></header>' +
      '<ol class="ss-404-shelf" aria-label="The shelf">' + list.map(function (p, i) { return '<li style="' + ctx.capStyle(p) + '"' + (i === miss ? " data-ss-404-slot" : "") + ">" + (i === miss ? '<span class="ss-404-ghost" aria-hidden="true"></span>' : capImg(ctx, p, "ss-404-cap")) + "</li>"; }).join("") + "</ol>" +
      '<div class="ss-404-field"><button type="button" class="ss-404-lost" data-ss-404-lost style="' + ctx.capStyle(list[miss]) + '" aria-label="Found it: the missing ' + esc(list[miss].name) + ' cap">' + capImg(ctx, list[miss], "ss-404-cap") + "</button></div>" +
      '<p class="ss-404-found" data-ss-404-found aria-live="polite"></p>' +
      '<nav class="x-next" aria-label="Where to go next"><a class="x-link" href="/shop">Shop all seven</a><a class="x-link" href="/super-sevens">Meet the Super Sevens</a><a class="x-link" href="/help">Help centre</a><a class="x-link" href="/">Home</a></nav></div>';
  }
  L.replace("notFound", (function (prev) {
    return function (ctx) {
      cast(ctx);
      if (location.pathname.replace(/\/$/, "") === "/super-sevens" && ctx.published.length) return superPage(ctx);
      return ctx.catalog.length >= 7 ? lost(ctx) : prev(ctx);
    };
  })(S.themes.e.notFound));

  /* ====================================================================== 8. Chrome: nav link, live stripe, footer playground */
  L.wrap("chrome", function (root, ctx) {
    cast(ctx);
    var nav = root.querySelector(".e-nav");
    if (nav && !nav.querySelector('[href="/super-sevens"]')) {
      var shop = nav.querySelector('[href="/shop"]');
      var a = frag('<a href="/super-sevens"' + (ctx.path === "/super-sevens" ? ' aria-current="page"' : "") + ' class="ss-navlink"><span class="ss-navmark" aria-hidden="true">' + glyph("7", {}) + "</span>Super Sevens</a>");
      if (shop) shop.after(a); else nav.prepend(a);
    }
    var mol = root.querySelector(".e-mnav ol");
    if (mol) mol.insertAdjacentHTML("afterbegin", '<li><a href="/super-sevens"><span>' + "7" + "</span>The Super Sevens</a></li>");
    var stripe = root.querySelector(".e-stripe-head");
    if (stripe) { stripe.setAttribute("data-ss-stripe", ""); stripe.classList.add("ss-stripe"); }
    var foot = root.querySelector(".e-footer");
    if (foot) {
      foot.insertAdjacentHTML("afterbegin", '<section class="ss-play" aria-label="The Super Sevens"><div class="ss-play-copy"><span class="ss-play-mark">' + mark({ cls: "is-foot" }) + '</span><p><strong>The Super Sevens.</strong> Seven segments, seven supplements. Go on, flick the caps.</p>' + soundBtn("ss-foot-sound") + '</div><div class="ss-play-floor"><canvas data-ss-play aria-hidden="true"></canvas></div></section>');
      var brand = foot.querySelector(".e-foot-brand p");
      if (brand) brand.textContent = "The Super Sevens: seven everyday supplements, one cap colour each.";
    }
  });

  /* ====================================================================== 9. Product page */
  L.wrap("product", function (root, ctx, args) {
    var p = args[0]; if (!p) return;
    cast(ctx);
    var pp = root.querySelector(".pp-e"); if (!pp) return;
    pp.classList.add("ssp");
    var i = segOf(ctx, p), r = role(p), no = pad(ctx.catalog.indexOf(p) + 1);
    var band = pp.querySelector(".pp-band");
    if (band) band.insertAdjacentHTML("beforeend", '<div class="ss-band-no" aria-hidden="true">' + num(no, { color: "var(--on-cap)", ghost: true, label: false }) + "</div>");
    var eyebrow = pp.querySelector(".pp-eyebrow");
    if (eyebrow && r) eyebrow.insertAdjacentHTML("beforeend", '<span class="ss-eyebrow-nick">' + esc(r.nick) + "</span>");
    var turnSec = '<section class="pp-sec ss-turnsec" id="turn" aria-labelledby="turn-t"><div class="pp-sec-in"><header class="pp-head"><p class="pp-k"><span class="pp-k-n">00</span><span class="pp-k-l">Turn the bottle</span><span class="pp-k-of">/ 00</span></p><h2 id="turn-t">' + (r ? esc(r.nick) + "." : "Every side of the label.") + "</h2></header>" +
      '<div class="pp-body ss-turn-grid"><figure class="ss-turn-fig">' + spin(ctx, p, { lens: true, cls: "is-big" }) + "<figcaption>Rendered from the 3D bottle model, 24 views. " + h.MOCKUP + ' Drag, or use the arrow keys, to turn it. ' + (fine() ? "Hover to magnify." : "") + "</figcaption></figure>" +
      '<div class="ss-turn-side">' + (i >= 0 ? '<div class="ss-whoami"><span class="ss-whoami-g">' + glyph("8", { only: i, ghost: true }) + '</span><p><strong>' + segName(i) + " of the Super Sevens.</strong> " + esc(p.name) + " is member " + no + ". Its cap colour draws this segment in every number on the site.</p></div>" : "") +
      (r ? '<p class="pp-lead">' + esc(r.line) + "</p>" : "") + card(ctx, p, { cls: "is-pdp" }) + "</div></div></div></section>";
    var buy = pp.querySelector("#buy");
    var detail = pp.querySelector("#detail");
    if (detail) detail.after(frag(turnSec + pour(ctx, p))); else if (buy) buy.after(frag(turnSec + pour(ctx, p)));
    var secs = pp.querySelectorAll(".pp-sec"), total = secs.length + 1;
    secs.forEach(function (sec, k) {
      var n = sec.querySelector(".pp-k-n"), of = sec.querySelector(".pp-k-of");
      if (n) n.textContent = pad(k + 2);
      if (of) of.textContent = "/ " + pad(total);
    });
    var quick = pp.querySelector(".pp-quick");
    if (quick) quick.insertAdjacentHTML("beforeend", '<a href="#turn">Turn the bottle</a><a href="#ss-pour-t">One serving</a>');
    var sibs = root.querySelector(".e-sibs");
    if (sibs) sibs.classList.add("ss-sibs");
  });

  /* ====================================================================== 10. Shop, bag, reports, about */
  L.wrap("shop", function (root, ctx) {
    cast(ctx);
    var page = root.querySelector(".ezs"); if (!page) return;
    var view = session("ss-shop-view") === "cards" ? "cards" : "line";
    var idx = page.querySelector(".ez-index");
    if (idx) {
      var shelf = '<nav class="ss-shelfnav" aria-label="The line-up"><ol>' + ctx.published.map(function (p) {
        var n = pad(ctx.catalog.indexOf(p) + 1);
        return '<li style="' + ctx.capStyle(p) + '"><a href="/products/' + esc(p.id) + '" data-ez-jump="' + esc(p.id) + '"><span class="ss-shelfnav-b">' + tq(ctx, p, { eager: true }) + '</span><span class="ss-shelfnav-tag"><span class="ss-shelfnav-n">' + num(n, { color: "var(--cap)", label: false }) + "</span><b>" + esc(p.name) + "</b><i>" + ctx.money(p.price) + "</i></span></a></li>";
      }).join("") + '</ol><span class="ss-shelfnav-board" aria-hidden="true"></span></nav>';
      var nidx = frag(shelf).firstChild; idx.replaceWith(nidx); idx = nidx;
    }
    var lens = '<div class="ss-lens-bar" role="group" aria-label="View as"><span class="ez-k">View as</span><button type="button" data-ss-view="line" aria-pressed="' + (view === "line") + '">Line-up</button><button type="button" data-ss-view="cards" aria-pressed="' + (view === "cards") + '">Cards</button></div>';
    if (idx) idx.after(frag(lens)); else page.insertAdjacentHTML("afterbegin", lens);
    var shown = [].map.call(page.querySelectorAll(".sp-card[data-sp-item]"), function (li) { return li.getAttribute("data-sp-item"); });
    var picks = shown.length ? shown.map(ctx.product).filter(Boolean) : ctx.published;
    var grid = '<ol class="ss-card-grid ss-shop-cards" data-ss-shop-cards' + (view === "cards" ? "" : " hidden") + ">" + picks.map(function (p) { return "<li>" + card(ctx, p, { link: true, save: false }) + '<div class="ss-shop-buy"><p>' + ctx.money(p.price) + "</p>" + addBtn(ctx, p, "x-btn e-add", "Add") + "</div></li>"; }).join("") + "</ol>";
    var list = page.querySelector(".sp-grid, .sp-list, ol.sp-cards, .sp-results") || (page.querySelector(".sp-card") && page.querySelector(".sp-card").parentNode);
    if (list) { list.setAttribute("data-ss-shop-line", ""); if (view === "cards") list.hidden = true; list.after(frag(grid)); }
    var head = page.querySelector("h1");
    if (head && !head.querySelector(".ss-h-num")) head.insertAdjacentHTML("afterbegin", '<span class="ss-h-num">' + num(pad(ctx.published.length), { ghost: true, label: ctx.published.length + " products" }) + "</span>");
  });

  L.wrap("reports", function (root, ctx) {
    cast(ctx);
    var page = root.querySelector(".lt") || root.querySelector(".e-reports") || root.querySelector(".report-page"); if (!page) return;
    var copy = page.querySelector(".lt-intro") || page.querySelector(".e-rep-copy");
    var lotIn = page.querySelector("input[name=lot]"), sel = page.querySelector("input[name=product]:checked, select[name=product]");
    var p = sel ? ctx.product(sel.value) : null;
    var html = '<div class="ss-rep-base"><p class="ez-k">Turn the bottle over</p>' + base(lotIn ? lotIn.getAttribute("value") || "" : "", p ? p.color : CAST.colors[0]) + '<p class="ez-small">Your lot number appears here as you type, written in the seven segments.</p></div>';
    var lede = copy && copy.classList.contains("lt-intro") && copy.querySelector("h1 + p, .lt-lede");
    if (lede) lede.insertAdjacentHTML("afterend", html); else if (copy) copy.insertAdjacentHTML("afterbegin", html);
  });

  var CHIP_NAMES = { "iron-bisglycinate": "Iron Rust", "l-theanine": "Theanine Moss", "vitamin-d3-k2": "D3 Indigo", "omega-3-fish-oil": "Omega Slate", "myo-d-chiro-inositol": "Inositol Lilac", "creatine-chews": "Creatine Teal", "psyllium-husk": "Psyllium Sand" };
  function chipbook(ctx) {
    return '<section class="ss-chips" aria-labelledby="ss-chips-t"><header class="ez-sec-head"><p class="ez-k">The colour book</p><h2 id="ss-chips-t">Seven chips, seven segments.</h2><p>Each cap colour has a name, a segment and a job: to tell you which bottle is which at a glance.</p></header>' +
      '<ol class="ss-chipbook" data-ss-chipbook>' + CAST.list.map(function (p, i) {
        return '<li style="' + ctx.capStyle(p) + ";--i:" + i + '"><a href="/products/' + esc(p.id) + '"><span class="ss-chip-field"><span class="ss-chip-g">' + glyph("8", { only: i, ghost: true, color: "var(--on-cap)" }) + '</span></span><span class="ss-chip-txt"><strong>' + esc(CHIP_NAMES[p.id] || p.name) + "</strong><span>" + esc(p.name) + "</span><code>" + esc(String(p.color).toUpperCase()) + " · " + segName(i) + "</code></span></a></li>";
      }).join("") + "</ol></section>";
  }
  L.wrap("about", function (root, ctx) {
    cast(ctx);
    var col = root.querySelector(".eza-colour");
    if (col && CAST.list.length === 7) col.before(frag(chipbook(ctx)));
    var A = window.BCCAbout && window.BCCAbout.copy, fmts = {};
    ctx.published.forEach(function (p) { if (ctx.format[p.id]) fmts[ctx.format[p.id]] = 1; });
    var stats = [[ctx.published.length, "supplements", "One per segment of the seven."], [CAST.list.length, "cap colours", "So the bottles read apart at a glance."], [Object.keys(fmts).length, "formats", Object.keys(fmts).join(", ") + "."], [A && A.values ? A.values.length : 0, "values", "Each with something you can check."]].filter(function (x) { return x[0]; });
    var heroA = root.querySelector(".eza-hero");
    if (heroA) heroA.after(frag('<section class="ss-numbers" aria-label="Body Café Co. in numbers"><ol>' + stats.map(function (x) { return '<li><span class="ss-numbers-n">' + num(pad(x[0]), { ghost: true, label: String(x[0]) }) + "</span><strong>" + x[1] + "</strong><p>" + esc(x[2]) + "</p></li>"; }).join("") + "</ol></section>"));
  });
  L.wrap("story", function (root, ctx) {
    cast(ctx);
    var objs = root.querySelectorAll(".ezst-obj");
    objs.forEach(function (li, k) {
      li.setAttribute("data-ss-reveal", ""); li.style.setProperty("--wipe", CAST.colors[k % 7] || "#2d2926");
      var n = li.querySelector(".ezst-n");
      if (n) n.innerHTML = '<span class="ss-story-n">' + num(pad(k + 1), { color: CAST.colors[k % 7], ghost: true, label: "Chapter " + (k + 1) }) + "</span><span>of " + pad(objs.length) + "</span>";
    });
    var page = root.querySelector(".x-page") || root.firstElementChild;
    if (!page || CAST.list.length !== 7) return;
    var first = page.querySelector("header");
    var block = '<section class="ss-eight" aria-labelledby="ss-eight-t"><div class="ss-eight-g" data-ss-eight>' + mark({ cls: "is-eight" }) + '</div><div><p class="ez-k">Why seven</p><h2 id="ss-eight-t">Light every segment and you get an eight. Step four back and the seven remains.</h2><p>That is the whole system: seven products, each with one place in one figure. Everything else, from the cards to the lot numbers, is written with it.</p><a class="x-link" href="/super-sevens">Meet the Super Sevens</a></div></section>';
    if (first) first.after(frag(block)); else page.insertAdjacentHTML("afterbegin", block);
  });

  /* Learn: the seven product guides as a drawer of index cards. */
  L.wrap("learn", function (root, ctx, args) {
    cast(ctx);
    var gp = args[0] && ctx.product(args[0]);
    if (gp) {
      var ah = root.querySelector(".lr-ahead");
      if (ah) { ah.classList.add("ss-has-card"); ah.style.setProperty("--cap", gp.color); ah.insertAdjacentHTML("beforeend", '<aside class="ss-guide-card" aria-label="Product card">' + card(ctx, gp, { link: true, save: false }) + "</aside>"); }
      return;
    }
    if (args[0] || CAST.list.length !== 7) return;
    var hero = root.querySelector("header, .x-head"); if (!hero) return;
    var drawer = '<section class="ss-drawer" aria-labelledby="ss-drawer-t"><p class="ez-k" id="ss-drawer-t">Seven field guides, one per segment</p><ol>' + CAST.list.map(function (p, i) {
      return '<li style="' + ctx.capStyle(p) + ";--i:" + i + '"><a href="/learn/' + esc(p.id) + '"><span class="ss-drawer-tab">' + glyph("8", { only: i, ghost: true, color: "var(--on-cap)" }) + "<b>" + pad(i + 1) + '</b></span><span class="ss-drawer-body"><strong class="e-name">' + esc(p.name) + "</strong><span>" + (role(p) ? esc(role(p).nick) : esc(ctx.format[p.id] || "")) + "</span></span></a></li>";
    }).join("") + "</ol></section>";
    hero.after(frag(drawer));
  });
  /* Standards: each product record carries its segment. */
  L.wrap("standards", function (root, ctx) {
    cast(ctx);
    CAST.list.forEach(function (p, i) {
      var h2 = root.querySelector("#ezr-t-" + CSS.escape(p.id)), k = h2 && h2.previousElementSibling;
      if (k && k.classList.contains("ez-k")) k.insertAdjacentHTML("beforeend", '<span class="ss-k-seg">' + glyph("8", { only: i, ghost: true, color: "var(--cap)" }) + segName(i) + "</span>");
    });
  });

  /* ====================================================================== 11. Card image (canvas) */
  function loadImg(src) { return new Promise(function (res, rej) { var im = new Image(); im.onload = function () { res(im); }; im.onerror = rej; im.src = src; }); }
  function wrapText(c, text, x, y, maxW, lh, maxLines) {
    var words = String(text).split(/\s+/), line = "", lines = 0;
    for (var i = 0; i < words.length; i++) {
      var t = line ? line + " " + words[i] : words[i];
      if (c.measureText(t).width > maxW && line) { c.fillText(line, x, y); y += lh; line = words[i]; if (++lines >= maxLines - 1) { line = words.slice(i).join(" "); break; } }
      else line = t;
    }
    if (line) { while (c.measureText(line).width > maxW && line.length > 4) line = line.slice(0, -2); c.fillText(line, x, y); }
    return y + lh;
  }
  function drawGlyph(c, ch, x, y, hgt, color, ghost) {
    var sc = hgt / H, on = MAP[ch] || "";
    c.save(); c.translate(x, y); c.scale(sc, sc); c.translate(SKEW + 1, 0); c.transform(1, 0, Math.tan(-6 * Math.PI / 180), 1, 0, 0);
    GEO.forEach(function (pts, i) {
      var lit = on.indexOf(LETTERS[i]) !== -1; if (!lit && !ghost) return;
      c.beginPath(); pts.split(" ").forEach(function (q, k) { var xy = q.split(","); k ? c.lineTo(+xy[0], +xy[1]) : c.moveTo(+xy[0], +xy[1]); }); c.closePath();
      c.globalAlpha = lit ? 1 : 0.16; c.fillStyle = color; c.fill();
    });
    c.restore();
    return (W + SKEW + 2) * sc;
  }
  function saveCard(p, ctxLike) {
    var cw = 1260, ch = 1760, cv = document.createElement("canvas"); cv.width = cw; cv.height = ch;
    var c = cv.getContext("2d"), info = CAST.byId[p.id] || { color: p.color, ink: "#fff", i: 0 }, r = role(p);
    return Promise.all([document.fonts ? document.fonts.load('700 80px "Lemon Milk"') : 0, document.fonts ? document.fonts.load('300 60px "Aileron"') : 0, SPIN[p.id] ? loadImg("/web/media/renders/" + p.id + "-three-quarter.webp") : Promise.resolve(null)]).then(function (res) {
      var im = res[2];
      c.fillStyle = "#f6f3ec"; c.fillRect(0, 0, cw, ch);
      c.fillStyle = info.color; c.fillRect(0, 0, cw, 300);
      var no = pad(info.i + 1), x = 70;
      for (var k = 0; k < no.length; k++) x += drawGlyph(c, no[k], x, 60, 180, info.ink, true) + 10;
      c.fillStyle = info.ink; c.font = '400 30px "Lemon Milk", sans-serif'; c.textAlign = "right"; c.fillText("THE SUPER SEVENS", cw - 70, 110);
      c.font = '400 30px "Lemon Milk", sans-serif'; c.fillText(info.i < 7 ? "SEGMENT " + LETTERS[info.i].toUpperCase() : "", cw - 70, 160);
      c.textAlign = "left"; c.fillStyle = "#2d2926"; c.font = '300 64px "Aileron", sans-serif'; c.fillText(r ? r.nick : (p.format || ""), 70, 400);
      if (im) { var ih = 860, iw = im.width * ih / im.height; c.drawImage(im, (cw - iw) / 2, 450, iw, ih); }
      c.font = '700 74px "Lemon Milk", sans-serif'; c.fillStyle = "#2d2926"; var y = wrapText(c, p.name.toUpperCase(), 70, 1420, cw - 140, 84, 2);
      c.font = '400 38px "Aileron", sans-serif'; c.fillStyle = "#5d5853"; wrapText(c, [p.format, p.pack_size].filter(Boolean).join(" · "), 70, y + 6, cw - 140, 48, 1);
      c.fillStyle = info.color; c.fillRect(70, ch - 120, cw - 140, 4);
      c.font = '400 26px "Lemon Milk", sans-serif'; c.fillStyle = "#2d2926"; c.fillText("BODY CAFÉ CO.", 70, ch - 70); c.textAlign = "right"; c.fillText(no + " / 07", cw - 70, ch - 70);
      return new Promise(function (res2) { cv.toBlob(res2, "image/png"); });
    }).then(function (blob) {
      if (!blob) return;
      var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "super-sevens-" + p.id + ".png";
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    });
  }

  /* ====================================================================== 12. Behaviour */
  var frameCache = {};
  function frames(id) {
    if (frameCache[id]) return frameCache[id];
    var list = []; for (var i = 0; i < FRAMES; i++) { var im = new Image(); im.decoding = "async"; im.src = "/web/media/spin/" + id + "-" + pad(i) + ".webp"; list.push(im); }
    return (frameCache[id] = list);
  }
  function setFrame(el, f) {
    f = ((Math.round(f) % FRAMES) + FRAMES) % FRAMES;
    if (el._f === f) return; el._f = f;
    var id = el.getAttribute("data-ss-spin"), im = el.querySelector("img"); if (!im) return;
    var src = "/web/media/spin/" + id + "-" + pad(f) + ".webp";
    var cached = frameCache[id] && frameCache[id][f];
    if (!cached || cached.complete) im.src = src;
    el.setAttribute("aria-valuenow", String(f * 15));
    el.setAttribute("aria-valuetext", f ? "Turned " + f * 15 + " degrees from the front" : "Front of the bottle");
    var lens = el.querySelector("[data-ss-lens]"); if (lens) lens.style.backgroundImage = 'url("' + src + '")';
  }
  function spinBehaviour(main, signal) {
    var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { frames(e.target.getAttribute("data-ss-spin")); io.unobserve(e.target); } }); }, { rootMargin: "300px" }) : null;
    signal.addEventListener("abort", function () { if (io) io.disconnect(); });
    main.querySelectorAll("[data-ss-spin]").forEach(function (el) {
      el._f = 0;
      if (io) io.observe(el); else frames(el.getAttribute("data-ss-spin"));
      var down = null;
      el.addEventListener("pointerdown", function (e) { if (e.button) return; down = { x: e.clientX, f: el._f || 0, id: e.pointerId, moved: false }; frames(el.getAttribute("data-ss-spin")); }, { signal: signal });
      el.addEventListener("pointermove", function (e) {
        if (down && e.pointerId === down.id) {
          var dx = e.clientX - down.x;
          if (!down.moved && Math.abs(dx) > 6) { down.moved = true; try { el.setPointerCapture(e.pointerId); } catch (x) {} el.classList.add("is-dragging"); el.classList.add("is-touched"); }
          if (down.moved) { var before = el._f; setFrame(el, down.f - dx / Math.max(14, el.clientWidth / 18)); if (before !== el._f && el._f % 3 === 0) Sound.tick(0.8); }
        }
        var lens = el.querySelector("[data-ss-lens]");
        if (lens && fine() && !down) {
          var r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, z = 2.2;
          lens.style.left = x + "px"; lens.style.top = y + "px";
          lens.style.backgroundSize = r.width * z + "px " + r.height * z + "px";
          lens.style.backgroundPosition = (-x * z + lens.offsetWidth / 2) + "px " + (-y * z + lens.offsetHeight / 2) + "px";
          if (!lens.style.backgroundImage) lens.style.backgroundImage = 'url("' + el.querySelector("img").src + '")';
        }
      }, { signal: signal });
      function up() { down = null; el.classList.remove("is-dragging"); }
      el.addEventListener("pointerup", up, { signal: signal });
      el.addEventListener("pointercancel", up, { signal: signal });
      el.addEventListener("keydown", function (e) {
        var k = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
        if (e.key === "Home") { e.preventDefault(); setFrame(el, 0); return; }
        if (k === undefined) return;
        e.preventDefault(); frames(el.getAttribute("data-ss-spin")); setFrame(el, (el._f || 0) + k); el.classList.add("is-touched");
      }, { signal: signal });
      // Auto-play one slow turn once on the product page, so the hint is obvious. Stops on any touch.
      if (el.classList.contains("is-big") && !reduced()) {
        var t0 = 0, played = false;
        var ob = "IntersectionObserver" in window && new IntersectionObserver(function (es) {
          if (!es[0].isIntersecting || played) return; played = true; ob.disconnect();
          var list = frames(el.getAttribute("data-ss-spin"));
          (function go(t) { if (signal.aborted || el.classList.contains("is-touched")) return; if (!t0) t0 = t; var f = (t - t0) / 90; if (f >= FRAMES) { setFrame(el, 0); return; } if (list[Math.floor(f)] && list[Math.floor(f)].complete) setFrame(el, f); else t0 += 16; requestAnimationFrame(go); })(0);
        }, { threshold: 0.6 });
        if (ob) { ob.observe(el); signal.addEventListener("abort", function () { ob.disconnect(); }); }
      }
    });
  }

  function heroBehaviour(main, signal) {
    var stage = main.querySelector("[data-ss-hero]"); if (!stage) return;
    var segs = [].slice.call(stage.querySelectorAll("[data-ss-seg]")), links = [].slice.call(stage.querySelectorAll("[data-ss-seg-link]"));
    var k = stage.querySelector("[data-ss-readout-k]"), v = stage.querySelector("[data-ss-readout-v]"), timers = [];
    signal.addEventListener("abort", function () { timers.forEach(clearTimeout); });
    function rest() { stage.removeAttribute("data-focus"); segs.forEach(function (s) { s.classList.remove("is-focus"); }); links.forEach(function (a) { a.classList.remove("is-focus"); }); k.textContent = "Seven segments"; v.textContent = "Seven supplements"; }
    function focus(i) {
      stage.setAttribute("data-focus", String(i));
      segs.forEach(function (s) { s.classList.toggle("is-focus", Number(s.getAttribute("data-ss-seg")) === i); });
      links.forEach(function (a) { a.classList.toggle("is-focus", Number(a.getAttribute("data-ss-seg-link")) === i); });
      var p = CAST.list[i]; if (!p) return;
      k.textContent = segName(i) + " · " + pad(i + 1); v.textContent = p.name;
    }
    function play() {
      timers.forEach(clearTimeout); timers = [];
      stage.classList.remove("is-lit", "is-eight", "is-seven"); void stage.offsetWidth;
      if (reduced()) { stage.classList.add("is-lit", "is-seven"); return; }
      stage.classList.add("is-lit");
      segs.forEach(function (s, i) { s.classList.remove("is-on"); timers.push(setTimeout(function () { s.classList.add("is-on"); Sound.click(1 + i * 0.06); }, 260 + i * 170)); });
      timers.push(setTimeout(function () { stage.classList.add("is-eight"); k.textContent = "All seven lit"; v.textContent = "That’s an eight"; }, 260 + 7 * 170 + 120));
      timers.push(setTimeout(function () { stage.classList.add("is-seven"); Sound.pop(); rest(); }, 260 + 7 * 170 + 1100));
    }
    segs.forEach(function (s) {
      var i = Number(s.getAttribute("data-ss-seg"));
      s.addEventListener("pointerenter", function () { focus(i); Sound.tick(1 + i * 0.08); }, { signal: signal });
      s.addEventListener("pointerleave", rest, { signal: signal });
      s.addEventListener("click", function () { var a = links[i]; if (a) a.click(); }, { signal: signal });
    });
    links.forEach(function (a) {
      var i = Number(a.getAttribute("data-ss-seg-link"));
      a.addEventListener("pointerenter", function () { focus(i); }, { signal: signal });
      a.addEventListener("pointerleave", rest, { signal: signal });
      a.addEventListener("focus", function () { focus(i); }, { signal: signal });
      a.addEventListener("blur", rest, { signal: signal });
    });
    stage.querySelector("[data-ss-replay]").addEventListener("click", play, { signal: signal });
    play();
  }

  function rollBehaviour(main, signal) {
    var sec = main.querySelector("[data-ss-roll]"); if (!sec) return;
    var track = sec.querySelector("[data-ss-roll-track]"), members = [].slice.call(sec.querySelectorAll("[data-ss-member]")), dots = [].slice.call(sec.querySelectorAll("[data-ss-roll-go]"));
    var n = members.length, cur = -1;
    var scrub = !reduced();
    sec.classList.toggle("is-scrub", scrub);
    function show(i) {
      if (i === cur) return; cur = i;
      members.forEach(function (m, k) { if (k === i) m.setAttribute("data-on", ""); else m.removeAttribute("data-on"); m.classList.toggle("is-past", k < i); });
      dots.forEach(function (d, k) { d.setAttribute("aria-current", String(k === i)); });
      sec.style.setProperty("--cap", members[i].style.getPropertyValue("--cap"));
      var sp = members[i].querySelector("[data-ss-spin]"); if (sp) frames(sp.getAttribute("data-ss-spin"));
      var nx = members[i + 1] && members[i + 1].querySelector("[data-ss-spin]"); if (nx) frames(nx.getAttribute("data-ss-spin"));
      Sound.click(0.9 + i * 0.05);
    }
    function onScroll() {
      if (!scrub) return;
      var r = track.getBoundingClientRect(), span = r.height - window.innerHeight;
      var p = Math.min(0.9999, Math.max(0, -r.top / Math.max(1, span)));
      var f = p * n, i = Math.floor(f), local2 = f - i;
      show(i);
      var sp = members[i].querySelector("[data-ss-spin]");
      if (sp && !sp.classList.contains("is-dragging")) setFrame(sp, local2 * FRAMES);
      sec.style.setProperty("--p", local2.toFixed(3));
    }
    dots.forEach(function (d) {
      d.addEventListener("click", function () {
        var i = Number(d.getAttribute("data-ss-roll-go"));
        if (!scrub) { show(i); members[i].scrollIntoView({ block: "center" }); return; }
        var top = track.getBoundingClientRect().top + window.scrollY, span = track.offsetHeight - window.innerHeight;
        window.scrollTo({ top: top + span * (i + 0.02) / n, behavior: reduced() ? "auto" : "smooth" });
      }, { signal: signal });
    });
    if (scrub) { window.addEventListener("scroll", onScroll, { passive: true, signal: signal }); window.addEventListener("resize", onScroll, { signal: signal }); onScroll(); }
    else show(0);
  }

  function pourBehaviour(main, signal) {
    main.querySelectorAll("[data-ss-pour]").forEach(function (sec) {
      var data; try { data = JSON.parse(sec.querySelector("[data-ss-pour-data]").textContent); } catch (e) { return; }
      var canvas = sec.querySelector("[data-ss-pour-canvas]"), countEl = sec.querySelector("[data-ss-pour-n]"), unitEl = sec.querySelector("[data-ss-pour-unit]");
      var cap = sec.querySelector("[data-ss-pour-caption]"), empty = sec.querySelector("[data-ss-pour-empty]"), picks = [].slice.call(sec.querySelectorAll("[data-ss-pour-pick]"));
      var cur = 0, count = 0, queue = [], mode = "", lastHit = 0;
      var world = new World(canvas, {
        draw: drawPiece, restitution: 0.22,
        onHit: function () { var t = performance.now(); if (t - lastHit > 45) { lastHit = t; Sound.tick(1 + Math.random() * 0.4); } },
        spawn: function () { if (!queue.length) return false; for (var k = 0; k < (mode === "pack" ? 3 : 1); k++) { var b = queue.shift(); if (!b) break; world.add(b); setCount(count + 1); } return true; },
      });
      function d() { return data[cur]; }
      function setCount(c) { count = c; countEl.innerHTML = num(String(c), { color: "var(--cap)", ghost: true }); empty.hidden = c > 0; }
      function caption() {
        var x = d();
        cap.textContent = x.name + ": one serving is " + (x.serving || x.n + " " + x.unit) + (x.packText ? ". A pack holds " + x.packText + (x.servings ? ", " + x.servings + " servings." : ".") : ".");
        unitEl.textContent = x.unit;
      }
      function radius(n) { var dm = world.dims(); var area = dm.w * dm.h * 0.42; return Math.max(6, Math.min(dm.h * 0.12, 38, Math.sqrt(area / (Math.max(1, n) * Math.PI)))); }
      function piece(r) {
        var dm = world.dims(), x = d();
        return { x: dm.w * (0.35 + Math.random() * 0.3), y: -r * 2, r: r, vx: (Math.random() - 0.5) * 220, vy: 120 + Math.random() * 200, va: (Math.random() - 0.5) * 8, ang: Math.random() * Math.PI, kind: x.kind, color: x.color };
      }
      function clear() { queue = []; world.clear(); setCount(0); mode = ""; }
      function drop(n, m) {
        if (reduced()) { // place the pieces without animation
          if (m !== mode) clear(); mode = m;
          var r = radius(m === "pack" ? d().pack : 12), dm = world.dims(), perRow = Math.max(1, Math.floor(dm.w / (r * 2.2)));
          for (var k = 0; k < n; k++) { var idx = count; world.bodies.push({ x: r * 1.1 + (idx % perRow) * r * 2.2, y: dm.h - r * 1.1 - Math.floor(idx / perRow) * r * 2, r: r, vx: 0, vy: 0, va: 0, ang: 0, kind: d().kind, color: d().color }); setCount(count + 1); }
          world.size(); return;
        }
        if (m !== mode || (m === "one" && count + n > 60)) clear();
        mode = m;
        var r2 = radius(m === "pack" ? d().pack : 12);
        for (var k2 = 0; k2 < n; k2++) queue.push(piece(r2));
        world.wake();
      }
      function select(i) {
        cur = i; clear();
        picks.forEach(function (b, k) { b.setAttribute("aria-pressed", String(k === i)); });
        sec.style.setProperty("--cap", data[i].color);
        caption(); Sound.click();
      }
      picks.forEach(function (b, i) { b.addEventListener("click", function () { select(i); }, { signal: signal }); });
      sec.querySelector("[data-ss-pour-one]").addEventListener("click", function () { drop(d().n, "one"); Sound.pop(); }, { signal: signal });
      sec.querySelector("[data-ss-pour-pack]").addEventListener("click", function () { clear(); drop(Math.min(d().pack || 30, 200), "pack"); }, { signal: signal });
      sec.querySelector("[data-ss-pour-clear]").addEventListener("click", clear, { signal: signal });
      var ro = "ResizeObserver" in window ? new ResizeObserver(function () { world.size(); }) : null;
      if (ro) ro.observe(canvas); else world.size();
      signal.addEventListener("abort", function () { world.stop(); if (ro) ro.disconnect(); });
      world.size(); caption(); setCount(0);
    });
  }

  function cardBehaviour(main, signal) {
    main.addEventListener("click", function (e) {
      var f = e.target.closest && e.target.closest("[data-ss-flip]");
      var face = !f && e.target.closest && !e.target.closest("a, button") && e.target.closest(".ss-card-in");
      if (f || face) {
        var c = f ? f.closest(".ss-card") : face.closest(".ss-card");
        if (!c) { var deck = f.closest("[data-ss-deck]"), slot = deck && deck.querySelector("[data-ss-deck-card]:not([hidden])"); c = slot && slot.querySelector(".ss-card"); }
        if (c) flipCard(c, !c.classList.contains("is-flipped"));
        return;
      }
      var s = e.target.closest && e.target.closest("[data-ss-save]");
      if (s) {
        var p = (CAST.list.concat(window.BCCSuperSevensCatalog || [])).find(function (x) { return x.id === s.getAttribute("data-ss-save"); });
        if (!p) return;
        s.disabled = true; var lbl = s.querySelector("span"), was = lbl.textContent; lbl.textContent = "Preparing…";
        saveCard(p).catch(function () {}).then(function () { s.disabled = false; lbl.textContent = was; });
      }
    }, { signal: signal });
    if (!fine() || reduced()) return;
    main.querySelectorAll(".ss-card").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.setProperty("--rx", (-y * 10).toFixed(2) + "deg"); c.style.setProperty("--ry", (x * 12).toFixed(2) + "deg");
        c.style.setProperty("--gx", ((x + 0.5) * 100).toFixed(1) + "%"); c.style.setProperty("--gy", ((y + 0.5) * 100).toFixed(1) + "%");
      }, { signal: signal });
      c.addEventListener("pointerleave", function () { c.style.removeProperty("--rx"); c.style.removeProperty("--ry"); }, { signal: signal });
    });
  }

  function flipCard(c, on) {
    c.classList.toggle("is-flipped", on);
    var btns = [].slice.call(c.querySelectorAll("[data-ss-flip]")), deck = c.closest("[data-ss-deck]");
    if (deck) { var panel = deck.querySelector("[data-ss-deck-panel]:not([hidden])"); if (panel) btns = btns.concat([].slice.call(panel.querySelectorAll("[data-ss-flip]"))); }
    btns.forEach(function (b) { b.setAttribute("aria-pressed", String(on)); var l = b.querySelector("span"); if (l) l.textContent = on ? (deck ? "Show front" : "Front") : (deck ? "Flip card" : "Flip"); });
    Sound.click(on ? 1.2 : 0.9);
  }

  function deckBehaviour(main, signal) {
    var deck = main.querySelector("[data-ss-deck]"); if (!deck) return;
    var picks = [].slice.call(deck.querySelectorAll("[data-ss-deck-pick]")), slots = [].slice.call(deck.querySelectorAll("[data-ss-deck-card]")), panels = [].slice.call(deck.querySelectorAll("[data-ss-deck-panel]"));
    var cur = 0;
    function show(i, focus) {
      if (i === cur) { if (focus) picks[i].focus(); return; }
      var dir = i > cur ? 1 : -1, old = slots[cur];
      cur = i;
      picks.forEach(function (b, k) { b.setAttribute("aria-selected", String(k === i)); b.tabIndex = k === i ? 0 : -1; });
      panels.forEach(function (pn, k) { pn.hidden = k !== i; });
      slots.forEach(function (sl, k) { if (k !== i && sl !== old) sl.hidden = true; });
      var c = slots[i].querySelector(".ss-card"); if (c && c.classList.contains("is-flipped")) flipCard(c, false);
      slots[i].hidden = false;
      if (!reduced()) {
        old.classList.add("is-leaving"); old.style.setProperty("--dir", dir);
        slots[i].classList.remove("is-entering"); void slots[i].offsetWidth; slots[i].style.setProperty("--dir", dir); slots[i].classList.add("is-entering");
        setTimeout(function () { old.classList.remove("is-leaving"); if (slots.indexOf(old) !== cur) old.hidden = true; }, 420);
      } else old.hidden = true;
      deck.style.setProperty("--cap", panels[i].style.getPropertyValue("--cap"));
      if (focus) picks[i].focus();
      Sound.click(0.9 + i * 0.05);
    }
    picks.forEach(function (b, i) {
      b.addEventListener("click", function () { show(i); }, { signal: signal });
      b.addEventListener("keydown", function (e) {
        var k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (e.key === "Home") { e.preventDefault(); show(0, true); return; }
        if (e.key === "End") { e.preventDefault(); show(picks.length - 1, true); return; }
        if (k === undefined) return; e.preventDefault(); show((cur + k + picks.length) % picks.length, true);
      }, { signal: signal });
    });
    deck.style.setProperty("--cap", panels[0].style.getPropertyValue("--cap"));
  }

  /* Reads published reviews for each product. Nothing is shown that the reviews API did not return. */
  function voicesBehaviour(main, signal) {
    var sec = main.querySelector("[data-ss-voices]"); if (!sec) return;
    var listEl = sec.querySelector("[data-ss-voices-list]"), status = sec.querySelector("[data-ss-v-status]");
    var ids = CAST.list.filter(function (p) { return p.published; }).map(function (p) { return p.id; });
    if (window.BCCStaticPreview) { status.textContent = "Reviews aren’t connected in this design preview."; return; }
    Promise.all(ids.map(function (id) {
      return fetch("/api/reviews?product=" + encodeURIComponent(id) + "&sort=newest&size=3", { credentials: "same-origin", signal: signal }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    })).then(function (res) {
      if (signal.aborted) return;
      var ok = res.filter(Boolean);
      if (!ok.length) { status.textContent = "Reviews couldn’t be loaded just now."; return; }
      var total = 0, sum = 0, items = [];
      ok.forEach(function (r) {
        var s = r.summary || {}; total += s.count || 0; sum += (s.average || 0) * (s.count || 0);
        (r.reviews || []).forEach(function (v) { items.push({ v: v, p: CAST.byId[r.product], id: r.product }); });
      });
      sec.querySelector("[data-ss-v-count]").innerHTML = num(String(total), { ghost: true, label: String(total) });
      if (total) sec.querySelector("[data-ss-v-avg]").innerHTML = num((sum / total).toFixed(1), { ghost: true, label: (sum / total).toFixed(1) + " out of 5" });
      if (!items.length) { status.textContent = "No reviews are published yet. The first ones arrive after verified deliveries."; return; }
      items.sort(function (a, b) { return (b.v.published || b.v.created || 0) - (a.v.published || a.v.created || 0); });
      status.textContent = total + " published review" + (total === 1 ? "" : "s") + ". Showing the newest.";
      listEl.innerHTML = items.slice(0, 6).map(function (x) {
        var v = x.v, c = x.p || { color: "#2d2926", ink: "#fff", name: "" }, stars = "";
        for (var k = 1; k <= 5; k++) stars += '<i class="' + (k <= v.rating ? "is-on" : "") + '"></i>';
        return '<li class="ss-quote" style="--cap:' + c.color + ";--on-cap:" + c.ink + '"><span class="ss-quote-mark" aria-hidden="true">“</span>' +
          '<p class="ss-quote-stars" role="img" aria-label="' + v.rating + ' out of 5">' + stars + "</p>" + (v.title ? '<p class="ss-quote-title">' + esc(v.title) + "</p>" : "") +
          '<blockquote class="ss-quote-text"><p>' + esc(v.text) + "</p></blockquote>" +
          '<p class="ss-quote-who"><span class="ez-chip-dot" aria-hidden="true"></span>' + esc(v.display_name || "Verified customer") + (v.verified ? ' · <span class="ss-quote-v">Verified delivery</span>' : "") + '<br><a href="/products/' + esc(x.id) + '#reviews">' + esc(c.name) + "</a></p>" +
          (v.incentive && v.incentive !== "none" ? '<p class="ss-quote-inc">This reviewer received something in return. See the product page for details.</p>' : "") + "</li>";
      }).join("");
    });
  }

  /* Contact: a switchboard over the existing support form. Topic tiles set the form's own select. */
  var TOPIC_TILES = [["product", "A product question"], ["delivery", "Delivery or tracking"], ["issue", "Damaged, wrong or missing"], ["return", "Return or refund"], ["report", "Lot reports"], ["safety", "Safety concern"], ["general", "Something else"]];
  function contactBehaviour(main, signal) {
    var page = main.querySelector(".su-e"), head = page && page.querySelector(".su-head"), sel = page && page.querySelector("#su-topic");
    if (!head || !sel || page.querySelector(".ss-switch")) return;
    var links = {}; page.querySelectorAll("a[href]").forEach(function (a) { var hr = a.getAttribute("href"); if (/^tel:/.test(hr)) links.tel = hr; else if (/^mailto:/.test(hr)) links.mail = hr; else if (/wa\.me/.test(hr)) links.wa = hr; });
    var tiles = TOPIC_TILES.filter(function (t) { return sel.querySelector('option[value="' + t[0] + '"]'); });
    var phone = links.tel ? links.tel.replace(/^tel:/, "") : "";
    var digits = phone.replace(/^\+91/, "");
    var html = '<section class="ss-switch" aria-label="Ways to reach us">' +
      (phone ? '<div class="ss-switch-line"><p class="ez-k">Call or WhatsApp</p><a class="ss-switch-phone" href="' + esc(links.tel) + '" aria-label="Call ' + esc(phone) + '"><span class="ss-switch-cc">+91</span>' + num(digits.slice(0, 5) + " " + digits.slice(5), { label: false }) + "</a>" +
        '<p class="ss-switch-alt">' + (links.wa ? '<a class="ss-pill" href="' + esc(links.wa) + '" target="_blank" rel="noopener">WhatsApp</a>' : "") + (links.mail ? '<a class="ss-pill" href="' + esc(links.mail) + '">' + esc(links.mail.replace(/^mailto:/, "")) + "</a>" : "") + "</p></div>" : "") +
      '<div class="ss-switch-topics"><p class="ez-k">Or open a case: what is it about?</p><ol>' + tiles.map(function (t, i) { return '<li><button type="button" data-ss-topic="' + t[0] + '" style="--cap:' + (CAST.colors[i % 7] || "#2d2926") + '"><span class="ss-topic-n">' + num(pad(i + 1), { color: "var(--cap)", label: false }) + "</span><span>" + t[1] + "</span></button></li>"; }).join("") + "</ol>" +
      (CAST.list.length ? '<p class="ez-k ss-switch-k2">Asking about a product? Pick its cap</p><div class="ss-switch-caps">' + CAST.list.map(function (p) { return '<button type="button" data-ss-about="' + esc(p.id) + '" style="--cap:' + p.color + '" title="' + esc(p.name) + '"><img src="/web/media/renders/' + esc(p.id) + '-cap.webp" alt="" width="400" height="400"><span>' + esc(p.name) + "</span></button>"; }).join("") + "</div>" : "") + "</div></section>";
    head.appendChild(frag(html));
    var sw = page.querySelector(".ss-switch");
    function choose(v, btn) {
      sel.value = v; sel.dispatchEvent(new Event("change", { bubbles: true })); sel.dispatchEvent(new Event("input", { bubbles: true }));
      sw.querySelectorAll("[data-ss-topic]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-ss-topic") === v)); });
      Sound.click();
      sel.scrollIntoView({ block: "center", behavior: reduced() ? "auto" : "smooth" });
      setTimeout(function () { var f = page.querySelector('textarea[name="message"]') || sel; if (btn && btn.hasAttribute("data-ss-about") && f.tagName === "TEXTAREA" && !f.value) f.value = "About " + btn.getAttribute("title") + ": "; f.focus({ preventScroll: true }); }, reduced() ? 0 : 450);
    }
    sw.addEventListener("click", function (e) {
      var t = e.target.closest("[data-ss-topic]"); if (t) { choose(t.getAttribute("data-ss-topic"), t); return; }
      var c = e.target.closest("[data-ss-about]"); if (c && sel.querySelector('option[value="product"]')) choose("product", c);
    }, { signal: signal });
  }

  function revealBehaviour(main, signal) {
    var els = main.querySelectorAll("[data-ss-reveal]"); if (!els.length) return;
    if (reduced() || !("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }); }, { threshold: 0.25 });
    els.forEach(function (el) { io.observe(el); });
    signal.addEventListener("abort", function () { io.disconnect(); });
  }

  function baseBehaviour(main, signal) {
    main.querySelectorAll("[data-ss-base-lot]").forEach(function (out) {
      var scope = out.closest(".lt, section, .x-page, .e-reports") || main;
      var input = scope.querySelector('input[name="lot"]'), baseEl = out.closest(".ss-base");
      function sel() { return scope.querySelector('input[name="product"]:checked, select[name="product"]'); }
      function paint() {
        var v = (input && input.value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 12)) || "--------";
        out.innerHTML = num(v, { color: "var(--cap)", ghost: true, label: false });
        var sv = sel(), p = sv && CAST.byId[sv.value]; if (p) baseEl.style.setProperty("--cap", p.color);
      }
      if (input) input.addEventListener("input", function () { paint(); Sound.tick(1.4); }, { signal: signal });
      scope.addEventListener("change", function (e) { if (e.target.name === "product") paint(); }, { signal: signal });
      scope.addEventListener("click", function (e) { if (e.target.closest("[data-fill-lot], [data-sample-lot], [data-report-product]")) setTimeout(paint, 30); }, { signal: signal });
      paint();
    });
  }

  function shopBehaviour(main, signal) {
    var page = main.querySelector(".ezs"); if (!page) return;
    page.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-ss-view]"); if (!b) return;
      var v = b.getAttribute("data-ss-view");
      session("ss-shop-view", v);
      page.querySelectorAll("[data-ss-view]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      var line = page.querySelector("[data-ss-shop-line]"), cardsEl = page.querySelector("[data-ss-shop-cards]");
      if (line) line.hidden = v === "cards"; if (cardsEl) cardsEl.hidden = v !== "cards";
      Sound.click();
    }, { signal: signal });
  }

  /* Bag: a seven-slot tray. bag.js paints the lines after render, so the tray follows the lines it finds. */
  function trayBehaviour(main, signal) {
    var root = main.querySelector("[data-bg]"); if (!root || CAST.list.length < 7) return;
    var head = root.querySelector(".bg-head"), body = root.querySelector("#bg-body"); if (!head || !body) return;
    var tray = document.createElement("section"); tray.className = "ss-tray"; tray.setAttribute("aria-label", "Your tray");
    head.appendChild(tray);
    var last = "";
    function paint() {
      var q = {}; body.querySelectorAll("[data-bg-line]").forEach(function (li) { var o = li.querySelector("output"); q[li.getAttribute("data-bg-line")] = (q[li.getAttribute("data-bg-line")] || 0) + (o ? int(o.textContent) || 1 : 1); });
      var key = JSON.stringify(q); if (key === last) return; last = key;
      var any = Object.keys(q).length;
      var polys = GEO.map(function (pts, i) { var p = CAST.list[i]; return '<polygon class="ss-s ' + (p && q[p.id] ? "is-on" : "is-off") + '" points="' + pts + '" style="--c:' + (CAST.colors[i] || "#2d2926") + '"/>'; }).join("");
      tray.innerHTML = '<div class="ss-tray-g"><svg class="ss-g" viewBox="0 0 ' + (W + SKEW + 2) + " " + H + '" aria-hidden="true"><g transform="translate(' + (SKEW + 1) + ' 0) skewX(-6)">' + polys + "</g></svg></div>" +
        '<ol class="ss-tray-slots">' + CAST.list.map(function (p) { var n = q[p.id]; return '<li style="--cap:' + p.color + '"' + (n ? " data-in" : "") + ">" + (n ? '<img class="ss-tray-cap" src="/web/media/renders/' + esc(p.id) + '-cap.webp" alt="" width="400" height="400">' + (n > 1 ? '<span class="ss-tray-q">×' + n + "</span>" : "") : '<span class="ss-tray-ghost" aria-hidden="true"></span>') + '<span class="sr-only">' + esc(p.name) + (n ? ", " + n + " in your bag" : ", not in your bag") + "</span></li>"; }).join("") + "</ol>" +
        '<p class="ss-tray-t">' + (any ? "Your tray lights the segment of each product you chose." : "Your tray is empty. Each product you add lights its own segment.") + "</p>";
    }
    var mo = new MutationObserver(paint); mo.observe(body, { childList: true, subtree: true, characterData: true });
    signal.addEventListener("abort", function () { mo.disconnect(); });
    paint();
  }

  function lostBehaviour(main, signal) {
    var page = main.querySelector("[data-ss-404]"); if (!page) return;
    var btn = page.querySelector("[data-ss-404-lost]"), slot = page.querySelector("[data-ss-404-slot]"), msg = page.querySelector("[data-ss-404-found]");
    var pr = page.getBoundingClientRect();
    btn.style.left = (4 + Math.random() * 88).toFixed(1) + "%";
    btn.style.top = (8 + Math.random() * 70).toFixed(1) + "%";
    btn.addEventListener("click", function () {
      var a = btn.getBoundingClientRect(), b = slot.getBoundingClientRect();
      var cap2 = btn.querySelector("img, span");
      Sound.pop();
      if (!reduced() && btn.animate) {
        btn.animate([{ transform: "translate(0,0) rotate(0)" }, { transform: "translate(" + (b.left - a.left + (b.width - a.width) / 2) + "px," + (b.top - a.top + (b.height - a.height) / 2) + "px) rotate(720deg)" }], { duration: 900, easing: "cubic-bezier(.3,.7,.2,1)" }).onfinish = settle;
      } else settle();
      function settle() { slot.innerHTML = ""; if (cap2) slot.appendChild(cap2); slot.classList.add("is-back"); btn.remove(); msg.textContent = "All seven are back on the shelf. Now, where were you headed?"; Sound.click(1.3); }
    }, { signal: signal, once: true });
    void pr;
  }

  function playBehaviour(signal) {
    var canvas = document.querySelector("[data-ss-play]"); if (!canvas) return;
    var imgs = CAST.list.map(function (p) { var im = new Image(); im.src = "/web/media/renders/" + p.id + "-cap.webp"; return im; });
    var world = new World(canvas, {
      draggable: true, restitution: 0.42, gravity: 2000, ceiling: true,
      onHit: function (b, v) { if (v > 500) Sound.tick(0.7 + b.i * 0.08); },
      draw: function (c, b) {
        c.save(); c.translate(b.x, b.y); c.rotate(b.ang);
        c.shadowColor = "rgba(45,41,38,0.22)"; c.shadowBlur = 10; c.shadowOffsetY = 4;
        var im = imgs[b.i];
        if (im && im.complete && im.naturalWidth) c.drawImage(im, -b.r * 1.08, -b.r * 1.08, b.r * 2.16, b.r * 2.16);
        else { c.beginPath(); c.arc(0, 0, b.r, 0, Math.PI * 2); c.fillStyle = b.color; c.fill(); }
        c.restore();
      },
    });
    function seed() {
      world.size(); world.clear();
      var dm = world.dims(), r = Math.max(18, Math.min(34, dm.w / 26));
      CAST.list.forEach(function (p, i) { world.add({ x: dm.w * (0.18 + i * 0.11) + (Math.random() - 0.5) * 10, y: -r - i * r * 1.4, r: r, i: i, color: p.color, vx: (Math.random() - 0.5) * 80 }); });
    }
    var started = false;
    var io = "IntersectionObserver" in window && new IntersectionObserver(function (es) { if (es[0].isIntersecting && !started) { started = true; if (reduced()) { world.size(); var dm = world.dims(), r = Math.max(18, Math.min(34, dm.w / 26)); CAST.list.forEach(function (p, i) { world.bodies.push({ x: dm.w * (0.18 + i * 0.11), y: dm.h - r, r: r, i: i, color: p.color, vx: 0, vy: 0, va: 0, ang: 0 }); }); world.size(); } else seed(); } }, { threshold: 0.3 });
    if (io) io.observe(canvas); else seed();
    var ro = "ResizeObserver" in window ? new ResizeObserver(function () { world.size(); }) : null; if (ro) ro.observe(canvas);
    signal.addEventListener("abort", function () { world.stop(); if (io) io.disconnect(); if (ro) ro.disconnect(); });
  }

  function stripeBehaviour(signal) {
    var stripe = document.querySelector("[data-ss-stripe]"); if (!stripe) return;
    var spans = [].slice.call(stripe.children), n = spans.length;
    function on() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 40 ? window.scrollY / max : 1, lit = Math.max(1, Math.ceil(p * n - 0.0001));
      spans.forEach(function (s, i) { s.classList.toggle("is-lit", i < lit); });
    }
    window.addEventListener("scroll", on, { passive: true, signal: signal }); window.addEventListener("resize", on, { signal: signal });
    on();
  }

  function favicon() {
    var path = location.pathname, m = path.match(/^\/products\/([^/]+)/), info = m && CAST.byId[m[1]];
    var svg = markSVGString(info ? info.i : null);
    var link = document.querySelector("link[data-ss-icon]");
    if (!link) { link = document.createElement("link"); link.rel = "icon"; link.type = "image/svg+xml"; link.setAttribute("data-ss-icon", ""); document.head.appendChild(link); document.querySelectorAll('link[rel="icon"]:not([data-ss-icon])').forEach(function (l) { l.setAttribute("data-ss-was-icon", l.getAttribute("href")); l.removeAttribute("rel"); }); }
    link.href = "data:image/svg+xml," + encodeURIComponent(svg);
  }

  /* Cursor: a small cap that follows the pointer and takes the colour of whatever product it is over. */
  var cursor = null;
  function cursorSetup() {
    if (cursor || !fine() || reduced()) return;
    cursor = document.createElement("div"); cursor.className = "ss-cursor"; cursor.setAttribute("aria-hidden", "true"); document.body.appendChild(cursor);
    var x = -100, y = -100, tx = -100, ty = -100, raf = 0;
    function loop() { x += (tx - x) * 0.28; y += (ty - y) * 0.28; cursor.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)"; raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(loop) : 0; }
    document.addEventListener("pointermove", function (e) { if (e.pointerType !== "mouse") return; tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(loop); }, { passive: true });
    document.addEventListener("pointerover", function (e) {
      if (document.body.dataset.theme !== "e") { cursor.hidden = true; return; } cursor.hidden = false;
      var t = e.target, el = t.closest && t.closest("[style*='--cap']");
      var c = el ? getComputedStyle(el).getPropertyValue("--cap").trim() : "";
      cursor.style.setProperty("--c", c || "var(--ss-ink)");
      cursor.classList.toggle("is-hot", !!(t.closest && t.closest("a, button, [data-ss-spin], [role=slider], label, select, summary, canvas[data-ss-play]")));
      cursor.classList.toggle("is-grab", !!(t.closest && t.closest("[data-ss-spin], canvas[data-ss-play]")));
    });
    document.addEventListener("pointerdown", function () { cursor.classList.add("is-down"); });
    document.addEventListener("pointerup", function () { cursor.classList.remove("is-down"); });
    document.documentElement.addEventListener("pointerleave", function () { tx = ty = -100; if (!raf) raf = requestAnimationFrame(loop); });
  }

  /* Cap-flood: opening a product fills the screen with its cap colour, which settles into the product page band. */
  var flood = null, floodAt = 0;
  window.addEventListener("click", function (e) {
    if (document.body.dataset.theme !== "e" || reduced() || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest("a[href^='/products/']");
    if (!a || a.target || a.hasAttribute("download") || a.__ssGo) return;
    var id = (a.getAttribute("href") || "").split(/[?#]/)[0].split("/")[2], info = CAST.byId[id];
    if (!info || location.pathname === "/products/" + id) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var x = e.clientX || window.innerWidth / 2, y = e.clientY || window.innerHeight / 2;
    if (!flood) { flood = document.createElement("div"); flood.className = "ss-flood"; flood.setAttribute("aria-hidden", "true"); document.body.appendChild(flood); }
    flood.style.setProperty("--c", info.color); flood.style.setProperty("--x", x + "px"); flood.style.setProperty("--y", y + "px");
    flood.className = "ss-flood"; void flood.offsetWidth; flood.className = "ss-flood is-in";
    floodAt = Date.now(); Sound.pop();
    setTimeout(function () { a.__ssGo = true; a.click(); a.__ssGo = false; }, 380);
    setTimeout(drain, 2600);
  }, true);
  function drain() { if (flood && flood.classList.contains("is-in")) { flood.className = "ss-flood is-out"; } }

  var run = { abort: null };
  L.onEnhance(function (main) {
    if (run.abort) run.abort.abort();
    run.abort = new AbortController();
    var signal = run.abort.signal;
    document.body.classList.add("ss-on");
    var head = document.querySelector(".e-header"), top = 0;
    if (head && /sticky|fixed/.test(getComputedStyle(head).position)) { top = head.offsetHeight; var st = document.querySelector(".e-stripe-head"); if (st && /sticky|fixed/.test(getComputedStyle(st).position)) top += st.offsetHeight; }
    document.documentElement.style.setProperty("--ss-top", top + "px");
    document.querySelectorAll("[data-ss-sound]").forEach(Sound.sync);
    if (flood && Date.now() - floodAt < 2600) setTimeout(drain, 60);
    [heroBehaviour, rollBehaviour, spinBehaviour, pourBehaviour, cardBehaviour, deckBehaviour, voicesBehaviour, contactBehaviour, revealBehaviour, baseBehaviour, shopBehaviour, lostBehaviour, trayBehaviour].forEach(function (fn) { try { fn(main, signal); } catch (e) { if (window.console) console.warn("Super Sevens:", e); } });
    try { stripeBehaviour(signal); playBehaviour(signal); favicon(); cursorSetup(); } catch (e) { if (window.console) console.warn("Super Sevens:", e); }
    if (location.pathname === "/super-sevens") document.title = "The Super Sevens — Body Café Co.";
  });

  window.BCCSuperSevens = { glyph: glyph, num: num, mark: mark, role: role, serving: serving, sound: Sound, CAST: CAST };
})();
