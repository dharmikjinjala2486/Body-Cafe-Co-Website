# Direction D: integration notes

Files: `web/direction-d.js`, `web/direction-d.css`. No new assets; bottles, fonts and logos come from `web/media` and `web/fonts`.
Built and tested against `design/concepts` @ d61c3a7.

1. Load after `homepage.js` / `homepage.css`:
   `<link rel="stylesheet" href="/web/direction-d.css">` and `<script src="/web/direction-d.js"></script>`.
2. Set `document.body.dataset.design = "d"` while D is selected. All D styles are scoped to `body[data-design="d"] .d-home`.
3. In `home()`, when D is selected:
   `return window.BCCDirectionD({ list, image, cap, capStyle, escape, money, format, shortName, link, menuBoard, homeLot });`
4. Manual-only cap selection (required). The current `counter` auto-cycles and picks on mouse hover. D's hero carries `data-counter-manual`. Two changes:
   - `enhance()`: replace `counter.paused = false;` with `counter.paused = !!$("[data-counter-manual]");`
   - `counter.mount()` pointerover handler: add `&& !root.hasAttribute("data-counter-manual")` to the condition.
   Click, tap and arrow keys keep working through the existing handlers.
5. Composition: D hero, `BCCHome.strip()`, D menu (seven products, real `data-add` buttons and `/products/{id}` links), `evidence()`, `voices()`, `ctx.homeLot()`, `story()`, `learn()`, `care()`. No bundles. `menuBoard` is accepted but not used.

## Applied locally

D is integrated at `/?design=d`, with C explicitly selected at `/?design=c`. The selected full-storefront direction is retained in tab session storage across product/cart/support navigation. A/B/C/D remain selectable at the top. Both C and D use manual cap selection; D additionally ignores hover changes. Mobile cap labels were retained beneath all seven controls. The shared homepage hash-navigation fix preserves sections and expanded FAQ state.
