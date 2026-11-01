# The Super Sevens: Variant E implementation

1 November 2026 · Local build, not committed or published.

Concept: [SUPER-SEVENS-CREATIVE-CONCEPT-2026-11-01.md](SUPER-SEVENS-CREATIVE-CONCEPT-2026-11-01.md).

## Decisions applied
- **Name:** "The Super Sevens" is approved as the campaign name for the set.
- **Segment order** follows the catalogue: a 01 Iron · b 02 L-Theanine · c 03 D3+K2 · d 04 Omega-3 · e 05 Inositol · f 06 Creatine · g 07 Psyllium. Rust, moss and indigo therefore draw the "7".
- **Sound** is included and off by default. It is synthesised in the browser (Web Audio), so there are no audio files. The choice is remembered per browser.
- **Cards** use a 63 × 88 mm playing-card proportion. Saved images are 1260 × 1760 px. For a print run, add 3 mm bleed (69 × 94 mm) at 300 dpi.
- **Copy review:** the owner reviews all claims and copy before launch.

## Files
| File | Purpose |
|---|---|
| `web/super-sevens.js` | Layer over `living-e.js` / `living-e-pages.js`. Presentation only; ids, forms and commerce hooks are unchanged. |
| `web/super-sevens.css` | Styles, scoped to `.eh-e`. |
| `web/media/spin/*.webp` | 7 × 24 turntable frames, 520 × 860, about 3.6 MB in total. Each frame loads only when its bottle is near the viewport. |
| `design-tools/render_super_sevens_spin.py` | Reproduces the turntables from `web/models/*.glb` in the local Blender (`SPIN_FRAMES` env var for tests). |
| `web/index.html` | Loads the two new files after the E layers. |

## What changed, page by page
- **Everywhere:** the segment numeral system and the mark (a bright 7, with the other four segments as faint colour). There's a "Super Sevens" nav link and a header stripe that lights 01→07 as you scroll. The favicon is the segment-7, and on a product page it lights that product's segment. On desktop a cap-colour cursor follows the pointer. Opening a product floods the screen with its cap colour. The footer has seven caps you can flick and stack, plus the sound toggle.
- **Home:** the hero lights all seven segments (an 8), then four step back to leave the 7. Hovering a segment or its legend entry names the product. **Roll call:** a sticky, scroll-scrubbed line-up gives each member a giant segment number, a bottle that turns as you scroll (or drag), a fact-based nickname, and pack/serving facts. **Pour one serving:** physics drops exactly one labelled serving, or the whole pack (up to 150 pieces) with a segment counter. **Cards:** a fanned deck that flips. **Turn it over:** the lot number appears on a bottle base in segment digits as you type. The trust, Learn and FAQ sections are kept.
- **Product pages:** the band carries the segment number, and the nickname sits in the eyebrow. New "Turn the bottle" section: a 360° view with drag, keyboard control, a desktop magnifier, a "Segment x" explainer and the product card. New "Pour one serving" section for that product.
- **/super-sevens** (new route, rendered through the theme's not-found hook): all seven cards with Save image, digits 0–9 explained by their members, and house rules on what the name never means.
- **Shop:** a "View as" toggle (Line-up or Cards), remembered for the session. The card view follows the active filter. The heading count is set in segments.
- **Bag:** a seven-slot tray with a segment-7 that lights only the products in the bag. It never says "complete your set".
- **Reports:** a bottle base that shows the typed lot number in segments, tinted by the chosen product.
- **About:** the colour book, with seven named chips (Iron Rust, Theanine Moss, D3 Indigo, Omega Slate, Inositol Lilac, Creatine Teal, Psyllium Sand), their hex values and segments.
- **Story:** "Why seven": the 8→7 animation explained.
- **Learn:** a drawer of seven field-guide cards, one per segment.
- **Standards:** each product record is tagged with its segment.
- **404:** "One of the seven rolled away." Find the hidden cap and it rolls back onto the shelf.

## Copy to review
- **Nicknames** (`ROLE` in `super-sevens.js`). Each one is shown only while the label record still matches its fact:
  - The Morning One: label says morning, empty stomach.
  - The Thirty: 30 capsules, 200 mg.
  - The Trio: 600 IU / 55 mcg / 200 mg.
  - The Big Number: 1,000 mg / 800 mg.
  - The Ratio: 40:1, 3 capsules.
  - The Chew: chewable, 2 tablets, orange.
  - The Night One: label says night, 5 capsules.
- **Colour names** (`CHIP_NAMES`).
- **Hero lede, /super-sevens copy and house rules.**

## Verification (local, 4174 preview)
- `node deploy/test_storefront_theme.mjs`, `node design-tools/test-preview-content.mjs`, `node deploy/test_hosted_preview.mjs`: passed.
- Python app suite: 100 tests passed.
- Browser at 1440 × 900, 1280 × 800, 820 × 1180 and 390 × 844. Checked: home (hero, roll call, pour, cards, lot, footer), product pages, /super-sevens, shop card view, bag tray, reports, About, Story, Learn, Standards, 404.
  - No page-level horizontal overflow on 15 routes at 390 px.
  - No console errors from site code.
  - Drag-to-turn, cap-flood navigation, the sound toggle and card PNG export (1260 × 1760) were each exercised.
- Not verified on physical devices. Reduced-motion paths were reviewed in code but not emulated in the browser. Safari/iOS haptics and audio were not tested.

## Known limits / next
- Turntables use the web GLBs, so label rendering in them is approximate. Re-rendering from the source `.blend` would give sharper labels.
- Iron and theanine GLBs are about 2 MB each. They aren't loaded by this layer, but should be compressed before any real-time 3D use.
- Printed cards are not yet in the box. The site makes no claim that they are.

## Round 2 — 1 November 2026
- **Testimonials ("Voices", home):** reads `/api/reviews` for each published product and shows only published reviews. Each one carries its rating (cap dots), a "Verified delivery" badge when the API confirms it, and an incentive disclosure when a reviewer received anything. The totals and average are set in segment digits. With no reviews (true today), the section shows seven honest "first verified review will appear here" slots and explains how reviews are collected. Nothing is written, seeded or hand-picked. Real-review rendering was checked with a browser-only fixture that was never saved.
- **Cards:** the overlapping fan is replaced by a spotlight deck: one large card, an info panel, and a rail of all seven. The rail is a keyboard tablist with arrows, Home and End, and the deal animation respects reduced motion. Every card now flips when tapped and has a flip badge in the corner. The text links became pill buttons (Flip / View / Save). The front and back typography is larger on featured cards.
- **Shop:** the index pills became a lit shelf of all seven bottles with segment numbers and prices. Each still jumps to its product card.
- **About:** an "in numbers" row in segment digits (supplements, cap colours, formats, values), all counted from live data.
- **Story:** chapter numbers in segment digits, and each object opens behind a cap-colour curtain as it scrolls in.
- **Learn guides:** the product's card sits beside the guide headline.
- **Contact:** a switchboard with the phone number in segment digits plus the WhatsApp and email links already on the page. Topic tiles set the real form's topic. Picking a product cap sets "A question about a product" and starts the message.
- Checked at 1440, 1024, 820 (deck) and 390 px: no horizontal overflow on 9 routes at 390 px. All test suites passed again.
