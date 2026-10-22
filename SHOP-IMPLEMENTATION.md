# Shop page — A–H implementation

22 October 2026. Built over canonical commit `3eca344` (product pages release). Not pushed or deployed.

## What changed

The Shop page (`/shop`) now has one content model, one section order and one behaviour across all eight directions. Each direction composes it in its own visual language. Before this change, Shop came from five unrelated renderers:

- `creative.js` for A and D
- `site-b.js` for B
- `world.js` for C
- `site-e…h.js` for E–H

`direction-editorial.js` also appended a promotional panel to A–D. Those renderers had different filter URLs, sorting only in E–H, no scroll restoration and toast-only add to bag. They are untouched. `web/shop.js` replaces each theme's `shop` renderer, in the same way `standards.js` and `product-page.js` do for their pages.

### Page flow, in every direction

1. **Compact introduction.** A heading suited to the direction plus the approved one-sentence lede. Products start within the first screen at 1440, 768 and 390px.
2. **Browse controls.**
   - Format toggle buttons: All products, Capsules, Softgels, Chews. Each shows a live count. Selections combine with OR.
   - "In stock only", which combines with format using AND.
   - Sort: Recommended (catalogue order 01–07), Price low→high, Price high→low, Name A–Z.
   - A result count read by screen readers, removable chips for active filters, and Clear all.
   - Counts are faceted: each option shows the result it would give, with the other filter applied.
3. **The collection.** Every published product, in the direction's card design.
4. **Capsules, softgels and chews.** A neutral explanation of each format, with the products in each. Links to the label-reading guide, the ingredient-forms guide and the ingredient notes.
5. **Standards and lot reports.** Links to `/standards`, `/reports` and `/standards#lot`, with the demonstration-record disclosure.
6. **Need a hand?** Links to Contact support and the Help centre, plus the shipping and returns policies, with a note that those terms are still being approved.

### Each product card

- One front-of-pack image. If it fails to load, the card shows the cap colour and the product name instead of a broken image.
- Full name, the approved catalogue subtitle and the format.
- "Pack & servings: Awaiting approved label".
- The sample price.
- The real rating and published-review count from the catalogue, or "No reviews yet".
- Actual stock: In stock or Out of stock. Low-stock counts aren't shown, to avoid false scarcity.
- A View product link and an Add to bag button.
- The product name link covers the card. The image link is out of the tab order, so there are no nested or duplicate tab stops.

The page closes with one shared note: sample prices with illustrative tax, no offers, draft packaging, and pack details still to come from approved labels.

### Directions

| | Shop composition |
|---|---|
| A · State of Play | Product index: giant count, Anton uppercase, graph-paper specimen cells in a ruled grid, lime highlighter shadows, mono controls |
| B · Expressive everyday | Lilac intro band with cap-colour dots, colour-coded pill filters, rounded cards on cap-tinted fields, rounded tinted sections |
| C · Everyday Elsewhere | Butter paper, Gloock serif, a blue "07" stamp, a record rack of arched sleeves in staggered rows, red offset shadows |
| D · The Other Side | Midnight and gold, centred "Now showing", lit vitrines with a cap-colour glow, mono uppercase controls |
| E · Fan Deck | A swatch fan in the intro; each product is a fan-deck card with its cap colour as a numbered band; Lemon Milk names |
| F · Edition | Folio line, ultralight headline, colour-field plates, italic deks; the first visible product leads as a double-size plate |
| G · Darkroom | Giant "Shop", frames on a black wall, information developing in white beneath each frame |
| H · Folio | A ruled reference index: margin labels, roman numerals, small plates, prices and actions in a right-hand column |

On phones (≤560px) every direction switches to one product per row, with the image beside its facts. Name, subtitle, price, stock, View product and Add to bag are all visible without hover. Format controls become a swipeable row.

### State and navigation

- **URL.** `/shop?format=capsules,softgels&stock=in&sort=price-asc&design=e`. Defaults are omitted. The design parameter is always kept.
- **Older links.** `?format=Softgels`, `?format=Chewable%20tablets` and `?sort=catalogue` still work.
- **Unknown formats.** Values such as `?format=gummies` show as a chip marked "not in this range", with the no-results state and a reset.
- **In-place updates.** Filters and sort update the page without a full re-render, which keeps images, focus and scroll. Each change pushes a history entry, so Back and Forward step through Shop states. Refresh and shared links reopen the same view.
- **Returning from a product page.** The Shop history entry stores its scroll position. On Back, the filters, sort and scroll position come back; the card the shopper clicked returns to the same place on screen in all eight directions.

### Add to bag

- Uses the existing cart through `window.BCCApp.addToBag(id)`, which calls `app.js` `add()`. Publication, stock and the 10-per-product / stock limit are enforced there.
- **States:**
  - Adding…
  - Added, with "Added to your bag. View bag (n)" on the card.
  - Error, with the cart's own message, for example the stock limit.
  - Disabled "Out of stock" for unavailable products.
- The header bag count updates immediately. A polite live region announces "<Product> added to your bag. Your bag has n items."
- Clicks are ignored while busy and for 1.4s afterwards, which prevents accidental duplicate adds. The shopper stays at the same scroll position.

## Shared changes (`web/app.js`)

- **`add()`.** Now returns `{ ok, message, count }` and accepts `{ quiet }` to skip the toast. If saving to `localStorage` fails, the add is rolled back. Existing callers are unchanged.
- **`BCCApp` additions.** `addToBag`, `bagCount` and `routeChanged`.
- **`popstate`.** Shop-to-Shop changes are handled in place by `BCCShop.popstate()`. Every other route renders exactly as before.
- **Shop scroll memory.** The scroll position is written into the `/shop` history entry. Restoring is only attempted for `/shop` entries that hold a saved position; other routes still scroll to the top.
- **`enhance()`.** Calls `BCCShop.enhance()`.

`web/index.html` loads `shop.css` and `shop.js` after `product-page.*`, before `app.js`.

The A–D "Everyday studies" campaign panel no longer appears on Shop. The brief asks for no repetitive promotional sections. It is unchanged on the homepages and product pages.

## Files

- `web/shop.js` (new): content model, eight compositions and behaviour.
- `web/shop.css` (new): shared structure plus `.sp-a` … `.sp-h`.
- `web/app.js`, `web/index.html` (edited).
- `design-tools/qa-shop/verify_shop.py` (new): browser verification.
- `design-tools/qa-shop/compare_other_routes.py` (new): DOM comparison of every non-Shop route against a baseline server.
- `design-tools/qa-e-h/flows.py` (edited): the Shop step targets the new controls. Its intent is the same: Softgels shows 2 products, then sort high-to-low.

No database, API or server changes. The rating shown on cards is the catalogue's existing `rating` field, which counts published reviews only.

## Verification

| Check | Result |
|---|---|
| `verify_shop.py`, live preview server (QA database: one product out of stock, one published review) | 1,433 passed, 0 failed |
| `verify_shop.py`, static Netlify export (`dist/`) | 1,433 passed, 0 failed |
| Non-Shop routes vs `3eca344` baseline (22 routes incl. two product pages × A–H × 1440/390) | 368 identical, 0 differences |
| E–H end-to-end flows (`qa-e-h/flows.py`) | 8/8 runs pass (25–27 checks each) |
| Backend tests (`app.test_server`, `app.test_http`, `app.test_reviews`) | 33 passed |
| JS syntax (`web/*.js`, `deploy/*.js`), `git diff --check` | Pass |
| `deploy/build_netlify.py` + `deploy/test_hosted_preview.mjs` | Pass |

`verify_shop.py` covers, for each direction at 1440, 768 and 390px:

- **Page structure.** One h1, the section order, products near the top, no horizontal overflow.
- **Card data against the catalogue API.** Every published product's name, subtitle, format, price, pack status, rating, availability, links and disabled state.
- **Images.** All load.
- **Links.** Standards, lot reports, Standards `#lot`, help, contact, shipping, returns and the guides are present and keep the design.
- **Accessibility and readability.** axe-core (WCAG 2.1 AA + best practice) at 1440 and 390, readable type and 40px+ targets, no console errors.
- **Desktop interactions:**
  - Format OR, stock AND and faceted counts.
  - All three sorts, with the sort announced.
  - Refresh, then Back/Back/Forward.
  - Chip removal keeping focus, and Clear all.
  - Recommended order matching the catalogue.
  - Return from a product page restoring the URL, filters, sort and the clicked card's on-screen position; the image link opens the same product.
  - Add to bag loading → success, one add despite a double click, a later deliberate second add, the bag count, the announcement, staying in place, and the quantity-limit error.
  - No-results state with reset, and legacy URLs.
  - Keyboard toggling, a visible focus ring, and a tab order with no image-link stops.
- **Phone.** Filtering, compact cards, and price and Add to bag within the viewport.
- **Reduced motion.** Transitions turn off.

## Missing approved content and assets

1. **Pack quantity, serving size and servings per pack** for all seven products. The cards show "Awaiting approved label" until approved rear labels supply them.
2. **Approved short product descriptions.** The cards use the approved catalogue subtitles, which are brand lines rather than descriptions of purpose. No purpose or benefit statements have been supplied.
3. **Final prices, GST treatment and any offers.** Prices are samples and no offers are shown.
4. **Capsule shell material, and the chew's flavour and full formulation.** The formats section says these will come from the approved labels.
5. **Return terms and delivery charges** are still pending approval; the Shop links to the working policy pages.
6. **Lot reports** are demonstration records. No laboratory documents are connected.
7. **Imagery.** One front-of-pack draft mockup per product is used. As on the product pages, the 3D three-quarter renders are not used, because their printed wording conflicts with the approved front mockups. An approved alternate view (for example the back label) can be added later as an optional second image.
8. **No genuine data for "Highest rated", "Best selling" or "Newest"**, so those sorts are not offered.
