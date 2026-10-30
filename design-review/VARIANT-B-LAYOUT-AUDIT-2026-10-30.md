# Variant B layout audit — 30 October 2026

Audited the latest local website at `http://127.0.0.1:4174`, using `?design=b`. This describes the local working tree, not a verification of the deployed Netlify build. No website code, backend, product artwork, prices or commerce behavior was changed during this audit.

## Coverage

43 routes checked at 1440×900, 768×1024, 390×844 and 320×640: 172 baseline layout measurements, plus focused screenshots and interaction checks. Additional short-screen PDP inspection used 1440×600.

Routes included Home, Shop, all seven PDPs, Standards, About, Story, Learn hub, five general Learn articles, seven ingredient guides, Reports, Bundles and both bundle details, Help, Contact, five policy pages, Cart, Checkout, Account, Addresses, Cases, Settings and Search. Navigation/menu, search dialog and one PDP section's sticky lifecycle were also inspected.

Measurements and screenshots are in [the local evidence folder](variant-b-layout-audit-2026-10-30/). Selected evidence is included in the repository; additional local captures remain in `.local/layout-audit-20261030/`. The baseline checks cover route rendering and geometry; they do not establish that every possible authenticated, validation, backend or purchase state is defect-free.

## Confirmed findings and recommended fixes

### 1. High priority — mobile Learn product cards collide and become too narrow

**Where:** `/learn`, confirmed at 320 and 390 px wide.

The featured Iron image crowds/overlaps its title and description. The remaining cards have a two-column outer grid and retain a horizontal image/text grid inside each card. This leaves extremely narrow text columns, forces product names and paragraphs into many short lines, and reduces the media area to tiny shapes. The screenshot's unloaded offscreen thumbnails are not being counted as broken images; the actual problem is the grid geometry.

**Fix:** At phone widths use one card per row, or use vertical image-above-text cards within the two-column layout. Explicitly reset the featured card's internal grid and image sizing. Maintain a readable text width and a real gap between image and copy.

**Source:** `web/pages-b.css:324–328,390–392` combined with `web/learn.css:271–274`.

**Evidence:** [390 px](variant-b-layout-audit-2026-10-30/learn-grid-390.png), [320 px](variant-b-layout-audit-2026-10-30/learn-grid-320.png).

### 2. High priority — product hero content pushes the main purchase control too far down

**Where:** Six of seven desktop PDPs at 1440×900.

The product heading, descriptive copy, benefit points, offer concept and utility information stack above the standard purchase control. Its approximate document top is:

| Product | Main purchase control top |
| --- | ---: |
| Iron Bisglycinate | 1,187 px |
| L-Theanine | 782 px |
| Vitamin D3 + K2 | 1,097 px |
| Omega-3 Fish Oil | 975 px |
| Myo & D-Chiro Inositol | 1,058 px |
| Creatine Chews | 1,026 px |
| Psyllium Husk | 1,043 px |

Small differences can occur as transitions settle. The layout issue is the same: six primary controls start below the initial 900 px viewport, while the hero occupies roughly 1,300–1,550 px on several products.

**Fix:** Compress the purchase hierarchy to product name → short value statement → offer selection → price → purchase control. Move extended explanation and utility details below this group. Keep Iron's **30 / 60 / 90 Servings** presentation and preserve every product's static first image. A fixed mobile purchase bar already exists, so mobile purchase access is not absent.

Iron also visually separates the selected illustrative offer from the standard-price purchase control. Make the prototype/sample explanation apparent beside the selector and clearly associate the purchase action with its applicable price. This is a frontend hierarchy recommendation; implementing discounts or backend pricing is outside this audit.

**Source:** `web/pdp-hero-b.css` `.bxh-grid`, `.bxh-value`, `.bxh-buy`; `web/pdp-hero-b.js` offer markup.

**Evidence:** [Iron desktop hero](variant-b-layout-audit-2026-10-30/iron-hero-desktop.png), [desktop measurements](variant-b-layout-audit-2026-10-30/hero-metrics-desktop.json), [mobile measurements](variant-b-layout-audit-2026-10-30/hero-metrics-mobile.json).

### 3. Medium priority — sticky product image panel cannot fit a short laptop viewport

**Where:** PDP image stage at 1440×600; shared stage styling affects all seven products.

The approximately 625 px tall image panel pins at about 104 px from the viewport top. Its bottom extends to approximately 730 px, outside the 600 px viewport. In the tested pinned state, Enlarge starts around 621 px and the caption around 687 px, so these controls/content cannot be seen while the panel remains pinned.

**Fix:** Constrain the stage to the available viewport height, scale the surrounding stage, or disable sticky when the complete panel cannot fit. Apply the same fit check used for the newer section-bound sticky headings. Keep the bottle artwork itself unchanged.

**Source:** `web/pdp-hero-b.css:12` `.bxh-stage { position: sticky; top: 104px; }`.

**Evidence:** [Short-screen pinned stage](variant-b-layout-audit-2026-10-30/pdp-short-screen.png).

### 4. Medium priority — Learn report walkthrough is internally clipped on a narrow phone

**Where:** `/learn`, “Walk through a report”, 320 px wide.

The available content width is 288 px, but the walkthrough/evidence child grows to approximately 307 px. Its right edge reaches approximately x323, beyond both the intended x304 content boundary and the viewport. The report table loses its right border/content. Outer clipping masks this from the whole-page overflow check.

**Fix:** Add appropriate `min-width: 0` constraints and allow table cells/content to wrap. If the table genuinely needs more width, use a clearly scrollable table container rather than hidden clipping. Preserve the phone gutter.

**Source:** `.lr-evidence`, `.lr-walk-grid`, `.lr-walk-table`; `web/learn.css:120,139–141` and the Variant B evidence layout.

**Evidence:** [Walkthrough at 320 px](variant-b-layout-audit-2026-10-30/learn-walkthrough-320.png).

### 5. Medium priority — About's “Accountability” heading consumes the column gap

**Where:** `/about`, values section, 1440 px wide.

The heading column is about 362 px wide, but “Accountability” renders about 402 px wide. It extends into the 40 px gutter and nearly meets the description beginning at x953. The text does not overflow the whole page, but the intended separation between heading and body disappears.

**Fix:** Size long value headings to the actual column width, widen the heading column, or stack the value before this collision occurs. Verify all four value rows at intermediate desktop widths as well.

**Source:** `web/pages-b.css` `.bza .ab-value` and `.ab-value h3`, including the later overrides around lines 738–740. Confirmed against the current rendered cascade.

**Evidence:** [About values](variant-b-layout-audit-2026-10-30/about-values-desktop.png).

### 6. Medium priority — Standards hero text obscures bottle artwork

**Where:** `/standards`, desktop hero.

“What's on the back?” overlaps the bottle's upper artwork/logo region. The caption competes with the product rather than labelling it from a separate area.

**Fix:** Reserve a text area outside the bottle silhouette, or move the caption into a separate row. Keep decorative labels clear of the cap, logo and product name at all responsive sizes.

**Source:** `.sx-bubble`, including `web/pages-b.css:422` and its inherited positioning from `web/standards.css`.

**Evidence:** [Standards hero](variant-b-layout-audit-2026-10-30/standards-hero-desktop.png).

### 7. Medium priority — bundle card crop cuts off the top of a bottle

**Where:** `/bundles`, Daily Edit card.

The source image is square and contains the full bottle cap. Rendering it in a 4:3 frame with `object-fit: cover` removes the top of the composition and chops the bottle. This is a placement/cropping problem, not a missing or damaged source asset.

**Fix:** Preserve the square composition, use `contain` with a suitable surrounding background, or adjust the frame/object position after checking that every bottle fits. Avoid replacing the product's static first image.

**Source:** `web/pages-b.css:658`, `.bzb-list .bi-bundle-art img`.

**Evidence:** [Bundle listing](variant-b-layout-audit-2026-10-30/bundles-hero-desktop.png). Source inspected: `web/media/editorial-b/bundle/daily-edit-card.webp`.

### 8. Medium priority — checkout chapter navigation presents the wrong hierarchy

**Where:** `/checkout`, strip below the hero.

The generated chapter strip displays “01 / 1Delivery”, “02 / 2Payment”, “03 / 3Confirm”, then promotes “We hold your items”, “You complete payment” and “You can sign in later” into steps 04–06. This duplicates numbering and makes explanatory content look like additional checkout stages. The 10 px link treatment also makes this critical hierarchy difficult to scan.

**Fix:** Give checkout a dedicated Delivery / Payment / Confirm indicator. Keep the explanatory headings within their own content area; exclude them from the automatic article chapter generator. Use one numbering system and normal readable spacing.

**Source:** `web/atelier.js:49–52` includes both `.tb-steps>li` and `#checkout-form>section`; `.atelier-reading-trail` in `web/atelier.css:60–61`.

**Evidence:** [Checkout strip](variant-b-layout-audit-2026-10-30/checkout-desktop-top.png).

### 9. Low priority — account telephone field has a nested capsule outline

**Where:** `/account`, sign-in panel, desktop.

The telephone wrapper has its own rounded border, while the input inside receives another rounded outline. The inner capsule begins immediately after +91, creating a pinched, double-bordered field rather than one continuous input.

**Fix:** Keep one border/radius on the wrapper and reset the nested input's border/radius in the final Variant B cascade. Retain a clear focus indicator on the combined field.

**Source:** `.ac-phone` / `.ac-phone input`, `web/account.css:79–81`, plus later global/Variant B input rules.

**Evidence:** [Account field](variant-b-layout-audit-2026-10-30/account-desktop-top.png).

## Checks that passed / limits

- No whole-document horizontal overflow was measured on the 43 routes at the four baseline sizes. This does not exclude internal clipping, as the Learn table demonstrates.
- The tested Iron “How do I take it?” left heading pins beneath the header and releases at its section boundary on desktop. It does not continue into the next section.
- Normal desktop and phone PDP first-image framing did not show stretched artwork. The short-height sticky issue is separate.
- The 320 px mobile menu and search dialog fit their content in the inspected state.
- The settled homepage bottle/record scene was visually coherent. Screenshots taken mid-transition were excluded as defects.
- Lazy images in full-page captures were not treated as broken images without a separate confirmation. No authenticated user-data or live transaction flows were exercised.

## Recommended order

1. Repair Learn card geometry and the clipped report walkthrough.
2. Rebalance all seven PDP purchase panels and add a short-height stage rule.
3. Correct Standards caption placement, About heading width and bundle image crop.
4. Replace checkout's generic chapter strip and clean up the account input.
5. Recheck the affected pages at 320, 390, 768, 1024 and 1440 px, including 600 px height for PDP sticky behavior. Keep all changes scoped to Variant B and preserve static first product images.
