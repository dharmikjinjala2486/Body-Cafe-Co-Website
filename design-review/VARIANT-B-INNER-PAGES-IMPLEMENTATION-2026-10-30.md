# Variant B inner pages — implementation handoff

30 October 2026 · Variant B only, frontend only. Implements the approved combined direction from `VARIANT-B-INNER-PAGES-REVIEW-CLAUDE-2026-10-30.md` and adds section-bounded sticky left columns. Nothing is committed, pushed or deployed.

## What changed

| File | Change |
|---|---|
| `web/pages-b.js` (new) | A B-only layer wrapping each B renderer. It adds a page class, explanatory figures and a few structural wrappers. All existing markup, data hooks and behaviours stay intact. It also runs the sticky-column system. |
| `web/pages-b.css` (new) | The shared layout set (open typography, ruled ledger, annotated specimen, editorial spread, trail, utility) plus every page composition, responsive rules, reduced-motion rules and the footer fix. |
| `web/variant-b.js` | Calls `BCCBPages.enhance()` from the B enhance hook (alongside the PDP hero). |
| `web/index.html` | Loads `pages-b.css` and `pages-b.js` last. |

Earlier, still-uncommitted work in the tree (`pdp-hero-b.*`, Codex's `shop.js` secondary-image fix and the 32px/26px PDP stage corners) is preserved.

## Pages

- **Product page, below the hero**
  - A four-step trail: product → label → ingredient context → lot record.
  - **Overview:** an open statement, a formula drawing that names the parts only (the three-part composition for D3 + K2 comes from the catalogue ingredients; it shows no ratios or amounts), the existing editorial ingredient illustration (tea leaves for L-Theanine) and a ruled fact ledger.
  - **Ingredients:** the unchanged static first image as an annotated specimen. Pins sit on the bottle's edges; the rear label is stated as not pictured.
  - **Use:** a reading column with a caution margin and numbered checks.
  - **Quality:** the one indigo chapter, with the lot desk.
  - **Reviews and Q&A:** plain reading, no panels. Explore becomes a shelf.
  - Numbered pills are replaced by running chapter labels.
- **Lot reports:** an indigo stage with the selected product's static bottle (it follows the product choice) and a printed-code lot field. On phones the form comes straight after the title. Results are a single typeset record sheet (header, status trio with state dots, ruled facts, documents). The glossary is a two-column ledger, and the archive and help are utility lists. Every state renders: match, under review, notice, superseded, outage, not found and other-product.
- **Learn hub:** a masthead, a numbered contents line, and a lead guide spread (from the first essentials guide). A tools row links to the existing explorer, label section and report walkthrough. Product guides form an issue shelf; essentials are a numbered reading list; evidence is four open columns. Sage marks the label section only.
- **Read a Label article:** an annotated educational example label drawn in HTML. It is tagged "Example label · not a Body Café Co. product" and shows no real amounts. Callouts link to the matching sections and highlight their part on hover or focus.
- **Standards:** Formula → Source → Checks → Record as an illustrated process strip, using the existing accurate status chips. Sources become a three-stop route, checks a vertical timeline, and evidence an indigo ledger (the only band). Status notes are ruled lines with state dots.
- **Shop:** a shelf of the seven static bottles, the grid unchanged, and a side-by-side table (format, pack, MRP, availability) built from the same facts as the cards. Rows stack on phones. Formats are open columns, the duplicated Standards panel is removed and help is a slim line.
- **About:** a short manifesto with the lineup spread, a large "why" line, a quote without a bubble, values as large one-word lines, and an honest people placeholder. Chapter chips, the collection and behind-the-scenes sections were removed; that material lives in Shop and Story.
- **Story:** a dark cover; chapters with outlined gutter numbers, a reading column, breakout pull quotes, wide artefacts and a dark artefact board. Odd and even chapters alternate in tone.
- **Bundles:** the listing alternates editorial spreads with ruled contents and totals. The detail page keeps both bottles, contents, total and action in the first screen, and its art now loads eagerly.
- **Help, contact, policies, bag, account**
  - Help is a peach service desk with a large search, quick actions in a row and a topic ledger.
  - The bag is a receipt (dashed rules, monospace figures, a perforated edge) with circular cap-colour thumbnails.
  - Account leads with progress: ruled tabs, a dashed empty state and a lot-record strip.
- **Footer:** five link groups now auto-fit instead of colliding, long links wrap, and the sticker is moved clear of the headline.

## Section-bounded sticky left columns

**How it works:** each left heading, intro or image is marked as a candidate and aligned to the top of its row. It pins only when all of these hold:
- it sits beside right-hand content in the same grid,
- that content runs at least 48px further down,
- the column fits the visible height below the header.

Pinned columns use `position: sticky` with `top` set to the measured sticky header (plus Story's chapter bar when present) plus 24px, which is 112px with the current header. The containing block is the column's own section grid, so a column always releases before the next section. Everything is recalculated on resize, content changes, image loads, accordion toggles and font loading. There is no `position: fixed` and no scroll hijacking.

**Where it applies:**

| Page | Pinned columns |
|---|---|
| Product page | Use, Quality, Reviews, Questions and Explore heads; the ingredients specimen when it fits |
| Lot reports | Glossary, archive and help heads (the hero intro stays in flow because it is taller than the form) |
| Learn | Article and guide contents lists |
| Standards | Section heads in two-column sections (the glance and evidence sections are full-width by design) |
| About | All section heads |
| Shop | Format and help heads, comparison header |
| Bundle detail | The bottle pair |
| Policies | The contents list |
| Home | The "Before you order" heading. The trust heading and the lot copy stay in flow because they are either not beside longer content or are too tall. |

**Exceptions by design:**
- Story chapter heads are full-width rows (number plus title above the reading column), so nothing pins.
- The Learn hub section heads are full-width rows.
- On Help the content is full width.
- The product overview is a balanced two-column composition rather than a heading beside long content.

**Checks** (scrolled through the start, middle and end of each section):
- **Desktop 1440×900:** every pinned column holds at 112px mid-section and never extends past its section's bottom. Measured on the PDP directions section (the reference): 276 → 112 → 112 → released.
- **Short 1440×600:** over-tall columns, such as the 751px specimen, stay in normal flow.
- **Stacked layouts:** 768px pins only the Shop sections that are still side by side; 390px pins nothing.
- **200% zoom:** behaves like the short or stacked cases, so it falls back to normal flow.

## Verification

- **Responsive sweep:** 17 routes at 1440, 768, 390 and 320px. There is no horizontal page overflow. Intentional horizontal scrollers remain (the Shop format filter row and the explorer picks).
- **Fixes the sweeps found:**
  - label-diagram overlap on phones
  - Lot Reports step contrast
  - specimen pins covering label wording
  - About value words breaking mid-word
  - Story chapter-head grid
  - comparison table clipping at 320px
  - footer collisions
- **Edge-case catalogue (Node preview on 4175):**
  - An unpublished product is excluded from the shelf, the table, reports and bundles, and its bundle shows "can't be added as a set".
  - A sold-out product is labelled.
  - A new long-named product with a new format and no images gets a placeholder bottle, a generic guide link, no fake illustration, an "Awaiting approved label" pack and wraps without overflow.
- **Lot lookups:** all demonstration states render, focus moves to the result heading, and the bottle follows the selected product.
- **Other variants:** A, C, E and H render with no `bz` classes and no errors. 32 Python tests pass under uv Python 3.10, and every `web/*.js` file passes `node --check`.
- **Not measured:** real iOS or Android, screen readers, contrast tooling, performance scores.

**Screenshots** are in `design-review/variant-b-inner-pages-2026-10-30/` (1440px, 0.8 scale): PDP formula, specimen and sticky directions; Lot Reports stage and record sheet; Learn lead; label diagram; Standards process; Shop shelf; Story chapter; About values.

## Remaining limitations

- **Missing genuine assets:** no original photography, founder or people material, process or facility documentation, ingredient-sourcing imagery, a real lot-number location photo or rear labels. Story and About use existing studio renders and brand-guide artefacts only.
- **Formula drawings:** these show named parts and will need updating to approved amounts only if the team wants quantities shown (they currently say amounts come from the label).
- **Fragile coupling:** the layer post-processes shared renderers' markup, so large class or structure changes in `product-page.js`, `lots.js`, `learn.js`, `standards.js`, `about.js`, `story.js`, `shop.js` or `support.js` may need matching updates in `pages-b.*`.
- **Server bugs found:** the local Python server (Codex's sample database) was not modified. Rapid in-page route changes still log the pre-existing "Transition was skipped" error.
