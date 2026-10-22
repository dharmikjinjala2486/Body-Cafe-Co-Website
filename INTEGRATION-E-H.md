> Local integration completed by Codex on 22 October 2026. These are Claude’s source handoff notes; the supplied-check claims below refer to Claude’s workspace. Local merge decisions and independent checks are recorded in `design-review/EH-MERGE-2026-10-22.md`. A–D retain their existing themed About-to-Story fallback; E–H use the new dedicated About renderer.

# Directions E–H — integration notes

22 October 2026 · branch `design/variants-e-h` · built on `6df6a74` (the pushed 20 October state).

Four new customer-site directions. A–D, operations and the backend are unchanged apart from the shared wiring listed below.

| | Name | Brief | Signature |
|---|---|---|---|
| E | Fan Deck | Minimal, clean, brand colours, cap colours | The collection as a fan deck of seven cap-colour chips; product page built as cap band over cream body |
| F | Edition | Premium editorial, brand colours | Printed-edition layout: cover, contents, figure plates on cap-colour fields, “close reading” crops |
| G | Darkroom | Very premium, black and white | Monochrome interface; the bottles are the only colour. Spotlight hero with film strip, contact sheet, gallery frames |
| H | Folio | Minimal, black and white | Reference-book page with a margin column for running heads and sidenotes; small real-colour bottle plates |

Open any page with `?design=e` … `?design=h`; the preview bar now lists A–H.

## Files

New:
- `web/site-eh.js`, `web/site-eh.css`: shared engine for E–H. Every customer route, the shared form builders' restyle, tabs behaviour, sort control and the mobile drawer.
- `web/site-e.js/.css` … `web/site-h.js/.css`: one file pair per direction. Each provides chrome, home, shop, product and lot-report pages and overrides shared parts through its kit.
- `web/media/renders/<id>-three-quarter.webp`, `<id>-cap.webp`: static stills rendered from the existing 3D models. There is no 3D in the browser for E–H.
- `web/media/brand-original-white.svg`, `brand-horizontal-white.svg`: white versions of the supplied logos, used by G.
- `web/fonts/aileron-ultralight.woff2`, `aileron-thin.woff2`, `aileron-lightitalic.woff2`, converted from the supplied OTFs.
- `design-tools/bottle-stills/`: render and convert scripts for the stills.
- `design-tools/qa-e-h/`: route, flow and screenshot checks.

Edited (shared wiring only):
- `web/app.js`:
  - `DESIGNS` extended to `e`–`h`, with four selector labels.
  - `detail()` hands the product page to `theme().product` when a theme provides one. Only E–H provide it; A–D still use `pdp.js`.
  - New `/about` route with a generic fallback. A–D render the fallback and don't link to it.
  - `enhance()` calls `BCCEH.enhance()`.
- `web/site.js`: `copy.about`, the shared About copy.
- `web/index.html`: five stylesheets and five scripts added after `atelier.*`, before `app.js`.

## Contracts the E–H markup keeps

These IDs and data attributes are handled by `app.js` and `pdp.js`, so the E–H markup keeps them:
- Bag and products: `data-add`, `data-change`, `data-remove`, `data-bundle`.
- Product page: `#product-quantity` with `data-action="add-product"`, `#pincode-form`, `#pdp-lot` with `data-fill-pdp-lot`.
- Home lot form: `#home-lot` with `data-fill-lot`.
- Lot reports: `data-report-product`, `#report-form`, `#report-result`.
- Checkout, payment and orders: `#checkout-form`, `data-pay`, `data-cancel`, `data-reorder`.
- Account and chrome: `data-action="logout|search|menu"`, `#mobile-nav`, `.bag-link [data-cart-count]`.

E–H don't use the `.r-*` / `.tb-*` classes, so the A/C/D overlay scripts (`creative`, `world`, `cinema`, `live`, `atelier`) never touch them.

## Applying on top of the local snapshot (`design/concepts` + uncommitted work, 22 October)

The local snapshot already contains a separate, earlier E–H implementation (`eh-core.js`, `eh-e…h.*`, `eh-chrome.js`, `eh-integration.*`). The two cannot load together:
- Both define `window.BCCEH`.
- Both answer `?design=e…h`.

To make this set the current E–H:
1. Archive the local `eh-*` files out of `web/`, then remove their `<link>` and `<script>` tags from `web/index.html`. Leave `home-flow`, `direction-motion`, `direction-editorial` and `five-directions-polish` in place for A–D.
2. Apply `0001-*.patch` with `git apply --3way`.
   - The patch touches `web/app.js`, `web/index.html`, `web/site.js` and `IMPLEMENTATION-STATUS.md`; expect overlaps there.
   - Keep the local A–D changes, plus these hunks: `DESIGNS` a–h, the four E–H selector labels, the `theme().product` hand-off in `detail()`, the `/about` route and fallback, and `BCCEH.enhance()` in `enhance()`.
3. In `web/index.html`, load `site-eh.css`, `site-e…h.css` after all A–D stylesheets, and `site-eh.js`, `site-e…h.js` after the A–D scripts and before `app.js`.
4. If `home-flow.js` or `eh-integration`-style code rewrites homepages or chrome for every design, guard it for E–H. These directions build their own chrome and seven `data-home-section` sections. Example guard: `if (/^[e-h]$/.test(document.body.dataset.theme)) return;`
5. Run `python3 -B -m unittest app.test_server app.test_http`, `node --check web/*.js`, and the scripts in `design-tools/qa-e-h/`. Use a fresh preview database: `flows.py` places real preview orders, which use up preview stock.

## Checks run

- `python3 -B -m unittest app.test_server app.test_http`: 24 tests pass.
- `node --check` passes on every `web/*.js` file.
- `node deploy/test_hosted_preview.mjs` passes; the Netlify build includes E–H.
- `design-tools/qa-e-h/verify.py` covers 69 routes and fixture states for E, F, G and H at 320, 390, 768, 1100 and 1440px:
  - Results: no horizontal overflow, one `h1` per page, no page errors.
  - One console line is expected: the deliberate 503 from the `DEMO-OUTAGE` lot state.
- `design-tools/qa-e-h/flows.py` passes 25–27 checks per direction at 1440 and 390px:
  - Menu and header links.
  - Add to bag from the homepage, curiosity tabs by keyboard, and the homepage lot lookup.
  - Shop filter and sort.
  - Product page quantity and add, pincode check and lot lookup.
  - Bag quantity change and remove.
  - Checkout → payment → paid order, OTP sign-in and a support case.
  - Search dialog, lot-report picker and match.
- A–D: screenshots compared before and after this change. Only the preview-bar selector differs; it now lists eight directions.
- One pre-existing issue unrelated to this change: A and D log blob-texture CSP warnings from their 3D scenes (`connect-src 'self'`). The same warnings appear on `6df6a74`.

## Honesty rules kept

- Prices are always marked as samples.
- Packaging is always marked as a draft.
- Lot reports are marked as demonstration records.
- No reviews, ratings, certifications, lab results or health claims anywhere.
- The bottle stills show only the front label.
- G and H interfaces are black and white; the bottles keep their real colours, as requested.
