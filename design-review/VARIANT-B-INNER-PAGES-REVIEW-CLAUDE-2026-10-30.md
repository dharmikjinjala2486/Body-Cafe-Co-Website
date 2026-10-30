# Variant B inner pages — independent design review (Claude)

30 October 2026 · Review and ideas only; no website code changed. Inspected at 1440px on the running local preview (`localhost:4174`, design B): Shop, Omega-3 PDP (sections below the hero), Standards, About, Story, Learn hub, "Read a label" article, Lot reports, Bundles, Help, Bag and Account. I didn't review phone layouts this pass. Constraints respected: static first product artwork unchanged, equal PDP stage corners, readable type, clear mobile shopping, accurate facts only.

## Critique — observed

1. **One page template.** Almost every inner route opens with the same lilac band: pill, heavy headline, paragraph, optional speech bubble. This applies to Shop, Story, Learn, Help, Reports, Bag, Account and Bundles (in sage). After two clicks the brand stops surprising.
2. **One section template.** Below the opening, sections are a rounded tinted panel with a numbered circle, a big question on the left and tiles or a table on the right. Examples: PDP "What is it?", "What's inside?", "How can I check it?" and "What do customers say?"; Shop's formats/standards/help; About's "Why Body Café Co.?" and values; Story chapters; the report glossary. The tint changes but the composition doesn't.
3. **Card monoculture.** Bordered rounded tiles in 2–4-column grids do every job: facts, values, help topics, report glossary terms, format explanations. Content with very different jobs (a definition, a value, an action) looks identical, so nothing is easy to scan.
4. **Inner pages lose the product.** The homepage has bottles, the Cabinet and the hero. Below the PDP hero, and on Standards, About, Story, Reports and Bundles, there is little or no product or label imagery. The pages that explain the bottle never show the bottle.
5. **Art direction is uneven.** Learn and Help use the editorial illustrations well. Standards uses a bottle pair with a speech bubble, which is good. About, Story, Reports, Bag and Account are type-and-tint only. Bundles' first screen shows no products.
6. **Reading pages are clean but flat.** The Learn article has a good table of contents and measure. "Read a label", though, is all prose and bullets about something inherently visual.
7. **Utility pages are generic.** Bag, Account and Help are clear, but read as a stock template with a lilac header. That's fine for clarity, but there's no brand moment where it would cost nothing (empty states, the order summary, the confirmation).
8. **Signature idea underused.** The site's most distinctive thing is product → label → ingredient → lot record. The homepage Cabinet shows it once; the rest of the site doesn't reuse it as a navigational or visual device.

## Ideas — ranked (proposed concepts)

1. **A system of 5–6 section archetypes, assigned per page** (system-wide, highest leverage). Replace the one "numbered panel, title left, tiles right" pattern with distinct, reusable layouts. Rule: no two adjacent sections share an archetype, and each page uses at most one tinted band.
   - *Specimen*: a large static bottle or label crop with annotations.
   - *Ledger*: ruled rows, no boxes, for facts and terms.
   - *Spread*: a full-bleed editorial image with a short essay.
   - *Trail*: the four-step product → label → ingredient → record strip.
   - *Q&A margin*: a question in the margin with the answer in a reading column.
   - *Utility*: plain, for forms.
2. **PDP below the hero as a "label walk"** (PDP).
   - "What's inside?" becomes a two-column specimen: an unchanged label crop or the static first artwork on the left, a ruled fact ledger on the right. Pending fields appear as quiet "awaiting label" rows, not tiles.
   - "How can I check it?" becomes the lot-number moment: a large lot-number field styled like the printed code, with the four-step trail beneath.
   - Reviews and Q&A become a plain reading column.
   - Sections alternate archetypes instead of repeating panels.
3. **Lot reports as the signature page** (Reports).
   - Lead with an oversized lot-number input ("type the number on your pack") on an indigo stage beside the static bottle.
   - Show the result as a document-like record sheet (product, lot, version, status, document link), not tiles.
   - Turn the glossary into a two-column ledger with a sticky term index.
4. **Annotated label explainer for "Read a label"** (Learn article). Add one illustrated label diagram: numbered callouts for name, serving, amount per serving, other ingredients, cautions and the lot number. Use generic illustrated artwork; don't alter or reuse the product labels as claims. The callouts link to the matching paragraphs, and the TOC highlights in sync. This gives the most visual payoff for the least content.
5. **Standards as a "proof ledger" with live status** (Standards).
   - Each standard is one row: practice, what it covers, its record status (published / pending), and a link to the record.
   - Pending states are shown honestly in a consistent badge.
   - Add one full-width spread image to break the rhythm.
   - Retire the repeated card grids.
6. **About vs Story — give each a different form.**
   - About becomes a short manifesto with the collection lineup, values as a typographic list (big words, one line each), and how we work as the Trail.
   - Story becomes a true long-read: larger serif-free reading column, pull quotes in the margin, chapter numbers in the gutter, one image per chapter. No tinted card panels.
   - Founder content stays hidden until approved.
7. **Shop: one editorial interruption plus a compare strip** (Shop). Keep the product grid as it is (it works). After the fourth card, insert one Cabinet-style row: "Not sure where to start? Compare by format", using a horizontal strip of bottles with format and pack. Replace the three bottom panels with one compact "formats explained" ledger.
8. **Bundles: show the pair first** (Bundles). Open with both static bottles side by side on a shared stand, the names, the total and the action in the first viewport. Move the explanatory note below. The "Not a regimen" disclaimer stays visible but secondary.
9. **Branded utility moments without clutter** (Bag, Account, Help).
   - Bag: the item line uses the cap-colour swatch and static bottle thumbnail; the empty bag shows the shelf of seven caps with "Pick a bottle"; the order summary gets a lot-record reassurance line.
   - Account: illustrated empty states.
   - Help: topics as a ledger with icons instead of cards; the quick actions stay as buttons.
10. **One shared "Trail" navigator across product-related pages** (PDP, Learn product guides, Reports). A slim sticky strip — Product · Label · Ingredient · Lot record — linking the matching sections and routes for the current product. It turns the brand promise into navigation and replaces several "related" card rows.
11. **Typography and colour roles per page type** (system). Keep Aileron, but separate display voice (homepage, hero lines) from page titles (smaller, tighter) and reading text (larger body, longer measure). Assign tints by purpose:
   - Lilac: invitation and openers.
   - Indigo: evidence and records.
   - Sage: education.
   - Peach: care and help.

   That way colour signals where you are, not decoration.
12. **Restrained interactions that explain** (system).
   - Label callouts highlight on hover/focus.
   - The lot-number field formats as you type, using the exact-match rules already in place.
   - Ledger rows expand inline for definitions.
   - Chapter numbers fill as you read on Story.
   - All of it is keyboard-accessible, reduced-motion safe and never required to read content.

## References — what to borrow

| Reference | What to borrow | Status |
|---|---|---|
| [Ritual — Ingredient sourcing](https://ritual.com/pages/ingredient-sourcing) | A big editorial opener, then an ingredient grid where each tile is a visual specimen with origin metadata. A model for a Standards/sourcing destination once BCC has records. | Viewed today |
| [Everlane — About](https://www.everlane.com/pages/about) | Alternating full-bleed image / text spreads with large quiet headings. A model for About/Story pacing. | Viewed today |
| [Graza](https://www.graza.co) | Big serif-led statements alternating with illustration and product. Proof that playful brands can vary section layouts while staying recognisable. | Viewed today (partly loaded) |
| [Patagonia — Our footprint](https://www.patagonia.com/our-footprint/) | Traceability presented as a destination with real records. Inspiration for the lot-record page as a brand pillar. | Link checked; from prior knowledge |
| [Seed DS-01](https://seed.com/daily-synbiotic) | Progressive depth below the hero: formula explorer, then science, then FAQs, each in a different layout. | From prior knowledge; site blocks bots |
| [Aesop](https://www.aesop.com) | Restrained product detail pages: ruled ingredient ledgers, generous whitespace, editorial typography instead of cards. | From prior knowledge; site blocks bots |
| [Stripe Press](https://press.stripe.com) | Long-read art direction: varied chapter layouts, typographic covers, a calm reading column. A model for Story and Learn. | Link checked |
| [Ghia](https://www.drinkghia.com) / [Recess](https://takearecess.com) | Colour-field art direction carried into inner pages with product photography, not just headers. | Links checked |
| [Momentous creatine chews](https://www.livemomentous.com/products/creatine-monohydrate-chews) | Format-led product storytelling below the hero. | Link checked |
| [Apple compare](https://www.apple.com/iphone/compare/) | Side-by-side comparison as a strip/table, for the Shop compare row. | Link checked |

Borrow layout logic and pacing only. Don't borrow claims, certifications, prices, subscription mechanics or imagery.

## Top 3 starting priorities

1. **Section archetype system (idea 1), applied to the PDP below the hero (idea 2).** This fixes the most-visited inner page and creates the reusable parts for every other page.
2. **Lot reports as the signature page, plus the shared Trail navigator (ideas 3 and 10).** This is the brand's most distinctive promise and currently the most generic page.
3. **Annotated label explainer and Standards proof ledger (ideas 4 and 5).** These replace prose and card grids with one strong visual each, using content that already exists.
