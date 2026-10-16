# Direction D, "Still life": design and integration note

Baseline: `design/concepts` @ `d2da26c`. This replaces the earlier "Morning counter" D, which shared C's arch, bottle and cap-row silhouette.

## Changed files

- `web/direction-d.js`: rewritten, same `window.BCCDirectionD(ctx)` contract.
- `web/direction-d.css`: rewritten. Every rule is scoped to `body[data-design="d"]`.

No changes to `app.js`, the backend, shared homepage content (`homepage.js` / `homepage.css`), A/B/C, routes, data or assets. There are no external resources. The only new asset is an inline `data:` SVG grain texture, which the existing CSP allows. Drop the two files in; no integration code is needed.

## References and the resulting direction

I studied current Awwwards product and e-commerce honourees for principles rather than layouts: Yamê, YAMA MATCHA, the NOMOS Glashütte shop and Capsules®. They share:

- precise grids;
- the product treated as a lit physical object;
- typographic indexes rather than carousels;
- restrained neutral materials that let product colour carry meaning.

The Body Café Co. idea is **the bottle as a still-life object, and the page set like its label**:

- **Material and light.** A porcelain ground taken from the bottle body. Each product stands on a porcelain plinth in morning window light (sun, café-blind light bands, a long cast shadow and a light pool in the selected cap's colour). Cap colours are the only saturated colour, used as accents rather than C's full-section floods.
- **Type.** Aileron Light at display sizes. LEMON MILK only where the packaging uses it: product names, numbers and labels.
- **Silhouette.** A full-width masthead headline sits above a lit stage and a numbered typographic product index. This replaces the arch, receipt and cap row. A museum-style spec band under the object carries the live product facts.
- **Sections derived from the pack:**
  - Trust strip as a spec row.
  - *Today's menu* as one shelf with all seven bottles at equal width on a single line.
  - Evidence as a boxed, heavy-ruled facts panel.
  - Customer experiences as a quiet, honest stone section.
  - Lot lookup as "the bottle, turned over": the real D3 + K2 bottle lying on its side on a dark roast counter.
  - Story as the front label unrolled: the cylinder-shaded panel with a seven-cap band and the stacked wordmark.
  - Learn as a contents page.
  - Before you order as hairline questions.

## Behaviour and accessibility

- **Counter contract.** The hero keeps the existing contract, so `app.js` mounts it unchanged: `data-counter`, `data-counter-manual`, `data-counter-ghost` (now the vertical side text), `.counter-stage`, `data-counter-bottle` (only the active one is tabbable), `data-counter-name/sub/format/price/link`, `.counter-rail` and `data-counter-pick` with `aria-pressed`.
- **Manual selection only.** Selection happens by click or tap; there is no cycling and no hover selection.
- **Keyboard.** ArrowLeft and ArrowRight come from the counter. The D script adds ArrowUp, ArrowDown, Home and End for the vertical index; they route through the normal click handler.
- **Labels.** All seven product names and formats are always visible: as a vertical list at 1100px and up, and as a two-column grid below that.
- **Commerce.** Shelf items keep `/products/{id}` links and real `data-add` buttons. `ctx.homeLot()` is used unchanged, so the lot form, sample-lot fill and lookup work as before.
- **Motion.** One subtle scroll-linked "settle" of the shelf bottles via CSS `animation-timeline: view()`. It runs on native scroll, never hides content (it starts at 0.7 opacity) and is skipped where unsupported. A small pointer-driven light and shadow parallax reuses the existing `tilt()` and is fine-pointer only. Both are off under reduced motion. There is no preloader, autoplay or scroll hijacking.
- **D-only header change.** On the D homepage only, the shared header takes a porcelain background (`body[data-design="d"][data-route="home"]`).

## Content

All existing D homepage copy, product data, demo labels ("Demo price", demonstration notes) and every shared section (strip, evidence, voices, lot, story, learn, care) are unchanged and in the same order. No reviews, ratings, certifications, claims, founder facts, prices or marketing copy were added.

## Checks run

On a fresh `d2da26c` server with an isolated database:

- **Tests:** 24 of 24 backend tests pass. `node --check` passes for all four JS files.
- **Layout:** 1920, 1440, 1100, 1024, 768, 390 and 320px. No horizontal overflow, one `h1`, no page errors, every image loaded.
- **Interaction:**
  - no auto-cycle;
  - hover doesn't select;
  - click and tap select and update the spec band, side text, link and price;
  - all arrow keys plus Home/End work and wrap;
  - one tabbable bottle;
  - visible focus;
  - seven visible labels at every width;
  - the key hint is hidden on touch;
  - touch targets are at least 44px;
  - reduced motion turns the animations off.
- **Commerce:** shelf add-to-bag works, all seven shelf links navigate, the lot lookup matches, and the FAQ and example-report accordions open. The disclaimer is readable on the roast band.
- **Isolation:** A and C are unaffected, and other routes render normally while D is selected.

These are targeted preview checks, not a WCAG or performance certification.
