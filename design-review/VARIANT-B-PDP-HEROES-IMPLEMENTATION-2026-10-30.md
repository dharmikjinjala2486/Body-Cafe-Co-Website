# Variant B — seven PDP hero concepts · prototype handoff

30 October 2026 · Implements `VARIANT-B-PDP-HERO-COMMERCIAL-STRATEGY-2026-10-30.md` (Latest user instructions) for Variant B only. Frontend prototype for team review. Nothing committed, pushed or deployed. Built on `b1734be`.

## Files

| File | Change |
|---|---|
| `web/pdp-hero-b.js` (new) | Rebuilds the B product hero in **preview releases only**. The hero reuses the existing gallery node and the existing quantity/Add to bag/pincode/terms controls, and adds each product's concept. It also contains the concept copy, the sample values and the display-only arithmetic. |
| `web/pdp-hero-b.css` (new) | One hero family: a cap-colour arch stage, the message, value points with a proof cue, the offer module and the buy controls. It includes per-concept treatments, phone ordering, transform-only arrival motion and reduced-motion rules. |
| `web/variant-b.js` | Calls `BCCBPdpHero.enhance()` from the B enhance hook. |
| `web/index.html` | Loads `pdp-hero-b.css` and `pdp-hero-b.js` after the Variant B layer. |

Production releases (`bcc-release=production`), other variants and products without a concept (a generic hero frame from the subtitle) keep working. Ingredients, use, quality/lot, reviews, Q&A and related products remain below the hero, unchanged.

## Routes and concepts

| Route | Concept | Sample values (team review only) |
|---|---|---|
| `/products/iron-bisglycinate?design=b` | Serving cards in the reference hierarchy: servings at left, crossed price and offer price at right, ₹ per serving beneath, filled selected card. 60 servings is preselected. No bottle counts. The image is the same for every selection. | Comparison = listed ₹899 per 30 servings. 30: ~~₹899~~ ₹799 (₹26.63/serving). 60: ~~₹1,798~~ ₹1,499 (₹24.98). 90: ~~₹2,697~~ ₹2,099 (₹23.32). Savings ₹100 / ₹299 / ₹598. |
| `/products/l-theanine?design=b` | Desire-led full price: olive atmosphere and outline type. No offer. | None. ₹1,699 listed. |
| `/products/vitamin-d3-k2?design=b` | Delivered price. Product / delivery today / delivery with offer / delivered total, updating with quantity. | ₹75 delivery (current preview terms, waived from ₹1,499) → ₹0. Qty 1: today ₹1,124, offer ₹1,049. Qty 2: already free, ₹2,098. |
| `/products/omega-3-fish-oil?design=b` | Quiet premium at full price. "What your price covers" shows a per-softgel price, explicitly not per serving. Proof cue is the lot record lookup. | ₹1,949 ÷ 30 softgels (preview pack) = ₹64.97 per softgel. |
| `/products/myo-d-chiro-inositol?design=b` | Next-order credit ticket beside the unchanged "You pay today". | ₹150 credit, added after delivery, use within 60 days on ₹999+, one per customer. Not issued. |
| `/products/creatine-chews?design=b` | "Creatine, without the shaker." Format-led message plus a gift card. | Proposed reusable pocket tin. No flavour or quantity stated. Not included with orders. |
| `/products/psyllium-husk?design=b` | First-order entry offer with eligibility. | 10% off: ₹949 − ₹95 = ₹854. First order, one bottle, not combined. Not applied. |

Each concept has a short message, one sentence and up to three value points. The proof cue is the same genuine one everywhere: the lot record lookup. The rating link remains and shows "No reviews yet". The copy avoids health outcomes and doses, and the label wording on the artwork isn't restated as a claim.

## Integrity

- Every offer module is marked "Sample offer · for review". A note beside the button states that Add to bag adds the standard pack at its listed price.
- The real button keeps app.js behaviour. It shows the true total (quantity × listed price). Verified: Iron with qty 3 added 3 × ₹899 to the bag, and no sample price reached the cart.
- No credit, gift, free delivery, first-order discount, subscription or recurring billing is created, stored or enforced. There are no backend, API, admin, pricing, stock or order changes.

## Checks (local Node preview, catalogue snapshot)

- Desktop 1440px and phone 390 / 320px for all seven: there's no horizontal overflow at 320px. Phone order is message → stage → offer/buy → value points, and the sticky buy bar stays reachable.
- First image: on every product the first slide is `/web/media/bottles-normalized/<id>.svg`, unchanged across all Iron selections. An extra admin image (edge catalogue) still works through thumbnails, count, caption and Enlarge.
- Arithmetic: tier per-serving and savings figures, D3 at qty 1 and 2, Inositol pay-today with quantity and the Psyllium totals all match the table above.
- Keyboard: native radio group (Arrow keys select and move focus), visible focus ring and Enlarge/Escape.
- Motion: one transform-only arrival with no opacity gate, so content never stays hidden. It's disabled under reduced motion, along with tier hover transitions.
- Production mode keeps the standard hero. Variants A and E are unchanged. All JS passes `node --check`, and `app.test_server`/`app.test_http` (32) pass under uv Python 3.10.
- Not done: real devices, screen readers, contrast tooling, performance measurement.

## Deferred backend and business work

Approved benefit copy and product facts (servings per pack, serving size), approved offer prices, eligibility, credit/gift/shipping rules and margins. Server-side enforcement of any chosen offer in quote, checkout and orders. Admin configuration for offers, gift stock and credit issuance/expiry. Delivery serviceability and the real delivery fees. Real review aggregates and lot documents. Any experiment tracking.
