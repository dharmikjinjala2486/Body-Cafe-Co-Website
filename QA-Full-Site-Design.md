# QA: full-site design, four directions

- **Baseline:** `cf8376f` plus this design pass.
- **Server:** local server `python3 app/server.py --port 4192` with an isolated QA database in a scratch folder (not the repository database).
- **Browser:** Playwright with headless Chromium.
- **Fixtures:** every transactional state uses synthetic fixtures. No real order, payment, message or account was created outside the throwaway QA database.

## What passed

| Check | Scope | Result |
|---|---|---|
| Route sweep | 76 distinct URLs × 4 directions × 5 widths (320, 390, 768, 1100, 1440) = 1,520 page loads. Covers every customer route, all 7 PDPs, all 7 ingredient notes, all 3 guides, `/reports?product=` for all 7, both edits plus an unknown edit, every fixture state, all 5 policies, settings, states index and 404. | **0 flagged.** Each page had no page errors, no console errors, exactly one `h1`, no horizontal page overflow, the correct `data-theme`, and no internal link inside `main` missing `?design=`. Wide tables scroll inside their own container by design. |
| Selector persistence | 6 start URLs × 4 targets (learn note with `#sources`, shop with format filter, search query, payment fixture, PDP, policy) | Pass. Path, entity, query and anchor were kept; only `design` changed. |
| Link persistence | Every internal link on `/standards` in B; following a link | Pass |
| Back / forward / reload | C, shop → product → back → forward → reload | Pass |
| Fresh tabs | `/learn?design=a\|b\|c\|d` | Pass |
| Session memory | `/story?design=d` then `/help` with no query | Pass (stays D) |
| Old A/B entry | `/concepts/index.html?concept=a\|b#shop` | Pass. Redirects to `/?design=a\|b#shop` in the shared site. |
| Filters and search | A capsules filter; D search submit | Pass |
| Report states | Each direction: sample match, not found, unpublished, withdrawn, outage | Pass. All render the shared `.rr` hierarchy. |
| Bag and checkout | B add, populated bag, quantity +1; A checkout from bag, native validation blocks an empty submit; C and D remove-to-empty | Pass |
| Keyboard | Each direction: 40 Tab stops on `/shop`, `/help`, `/reports`, `/checkout?state=errors`; FAQ opens with Enter; format filter via keyboard; report picker via keyboard; mobile menu opens by keyboard and closes on Escape | Pass. Every focused element had a visible outline or ring. No visible mobile target under 24px in header or main. |
| axe-core 4.10.2 (WCAG 2.0–2.2 A/AA rules; QA-only, not shipped) | 25 routes × 4 directions × 2 widths = 200 pages | **199 clean.** One finding remains (below). The first run found 16 colour-contrast issues; all were fixed: B muted text on lilac/peach, B order progress, A home lot copy, C note-card captions. |
| Static export | `python3 -B deploy/build_netlify.py`, `node deploy/test_hosted_preview.mjs` | Pass |
| Static boundaries | Built `dist/` served locally, × 4 directions: checkout, contact, account and orders show the theme's unavailable page; `?state=` fixtures render with no live inputs; `/ops` shows the notice; shop, guide and report lookup work | 52/52. No non-GET requests, no page errors. |
| Backend regression (unchanged) | `python3 -B -m unittest app.test_server app.test_http` | 24 tests OK |
| Syntax | `node --check` on every `web/*.js` and `concepts/app.js` | Pass |
| `/ops` | `/ops?design=a…d` | Base chrome, no theme classes, `data-theme=""`. Unchanged. |
| Reduced motion | Gallery captured with `prefers-reduced-motion: reduce` | Transitions and animations are disabled in all four direction stylesheets. No direction has autoplaying motion, preloaders or scroll hijacking. |

## Remaining findings and limits
- **B PDP, 390px.** axe flags `target-size` on one `.link-button`: the fixed sticky purchase bar partially covers whichever inline link sits under it at load. This comes from the PDP sticky bar (fd0a167 package), not the new pages. A bottom padding equal to the bar height on B PDPs would resolve it.
- **Contrast.** Contrast was verified by axe on the 200 pages above. It was not checked by hand for every cap colour in every hover state (for example, C menu rows flood with the cap colour and use the existing `onCap` text colour).
- **Not checked:**
  - real screen readers (VoiceOver, NVDA, TalkBack);
  - Safari, Firefox and real mobile devices;
  - 200% text zoom;
  - Windows high-contrast mode;
  - RTL;
  - field performance or Core Web Vitals (no claims are made);
  - print styles.
- **Live paths.** Live (non-fixture) payment, order and account states were exercised only through existing flows indirectly. The persistence check visits PDPs and checkout. The full order → payment → order loop was not rerun per direction in this pass; the shared handlers are unchanged and covered by the 24 backend tests.
- **Out-of-stock.** The disabled "Unavailable" add control exists in every direction's cards. No catalogue item is out of stock, so it was not visually reviewed on listings.
- **Shared overlays.** The search dialog and toasts use the shared storefront styling in all directions.
- **Imagery.** The Vitamin D3 + K2 mockup is framed tighter than the others; D compensates on plinths. Rear-label, product-in-hand and founder imagery do not exist yet.
- **PDPs.** The 28 PDP combinations come from the fd0a167 package. They now sit inside the new direction chrome and were covered by the sweeps, but they were not redesigned in this pass.

## Review artefacts
- `screenshots/index.html`: gallery of 20 routes × 4 directions, each at 1440 and 390 (full page).
- `screenshots/sheets/contact-sheet-colour.jpg`: first viewport, selector visible.
- `screenshots/sheets/contact-sheet-grayscale-no-selector.jpg`: grayscale, selector hidden. This is the distinctiveness check.
