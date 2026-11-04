# Body Café Co. — clutter, readability and usability review

3 November 2026 · current local Variant E · audit and recommendations, no storefront edits

[Open screenshots and evidence](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/EVIDENCE.md)

The next improvement should make the existing design easier to read and operate. Keep the cap colours, bottles, visual label explanations and the owner's restored homepage sections. Fix the broken interactions first, then reduce the number of small competing elements and repeated explanations. Cutting more whole sections would repeat the approach the owner already rejected.

## Context used

Read the exact Claude session **Website clutter and readability** (`claude.ai/epitaxy/local_582e7ba2-9026-44f8-a2de-11cfe80f254b`), its Page Flow Plan artifact, the current source, and the dated owner decisions in `OTHER-CONTENT-MAP-2026-11-02.md`, sections 26–44. Claude's final QA had stopped at its usage limit after preparing its audit script.

Constraints carried forward:

- Visual understanding with short, meaningful copy; approved label wording supplies product facts and support lines.
- Preserve **Proof, Voices, and Before you order** on Home, including the owner's preview review treatment.
- Keep plain Shop product cards, the support filter, and the clearer menu labels. Do not restore the removed shelf navigation, view switch, time filter, card stripe or card pack-size line.
- Keep the full Story copy available behind Read controls. Keep product directions, cautions, allergens, records and policy information accessible.
- Preserve the phone 2-column Home card layout and the named product links. Improve readability within that decision.

This review uses `http://127.0.0.1:4174`, not the public deployed site. Production differs from the preview: it removes comparison tooling and sample reviews. A–D/F–H and authenticated operations workflows are outside this customer Variant E review.

## Coverage and evidence

**175 distinct customer route/query states across 84 pathnames × 4 widths = 700 initial-layout checks.** Widths: 320, 390, 768 and 1440 CSS pixels. These include all seven public product URLs, the Learn hub and 12 guides, glossary, all linked Help categories/articles, all five policies, reports and supplied report states, search, bundles, bag, checkout/account/order/payment preview states, settings, contact states and 404.

The sweep found no initial-layout page overflow above one pixel, missing/multiple main H1s, broken visible loaded images, unresolved template text or uncaught JavaScript page exceptions. This is a layout baseline, not proof that all controls work: the interaction tests below found important failures.

Full-page visual captures cover the main page compositions on desktop and phone. Targeted checks cover every product's serving control, Shop filter combinations/reset/reload, expanded content, Quality navigation, mobile menu, text sizing and selected colour contrast. Phone captures labelled `loaded` were scrolled first so lazy-loaded images had a chance to load. Initial desktop overview captures can contain images that had not yet been brought into view; those blank areas are not reported as broken images.

- [coverage.csv](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/coverage.csv): every inspected route and width.
- [desktop.json](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/desktop.json), [390.json](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/390.json), [768.json](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/768.json), [320.json](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/320.json), [extra-routes.json](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/extra-routes.json): raw initial checks and text snapshots.
- [interactions.json](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/interactions.json), [targeted.json](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/targeted.json): reproductions, counts and measurements.
- [facts-normal-motion.json](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/facts-normal-motion.json): additional product checks with normal motion.
- [desktop-contact-sheet.png](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/desktop-contact-sheet.png), [mobile-contact-sheet.png](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/mobile-contact-sheet.png): page overviews; use individual images for legible detail.

Rendered product checks also confirm that all seven pages retain the supplied pack size, serving size, full directions, warnings, allergens, storage and manufacturer strings when details are opened. No expanded product page overflow was detected at 390 px. The serving control remains broken with both normal and reduced motion.

Existing regression checks also pass: **10 design-tool modules and 32 backend/HTTP tests**. Their passing result does not cover the broken serving initializer or the split Shop filter state.

## Fix these before another visual redesign

### 1. All seven product serving demonstrations are disconnected — high priority

**Observed:** click **Pour one serving** on any product. The counter remains at 0. All seven fail the same way.

**Cause:** [web/pdp-v2-e.js:63](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/web/pdp-v2-e.js:63) moves only `.ss-pour-ui` into How to take it and removes the original section. The initializer in [web/super-sevens.js:873](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/web/super-sevens.js:873) searches for `[data-ss-pour]` and reads `[data-ss-pour-data]` inside it. Both the wrapper and data are lost during the move, leaving visible buttons without the behavior that initializes them.

**Change:** move a self-contained serving component with its wrapper/data, or refactor the initializer to accept the relocated component and product data. Preserve each product's serving quantity.

**Acceptance:** one click visibly adds 1, 1, 1, 1, 3, 2 and 5 units respectively for Iron, L-Theanine, D3 + K2, Omega-3, Inositol, Creatine and Psyllium. Whole-pack and Clear work too. Verify normal and reduced motion, then navigate between products and repeat.

Evidence: [interactions.json](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/interactions.json), [facts-normal-motion.json](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/facts-normal-motion.json), [evidence-serving-control.png](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/evidence-serving-control.png).

### 2. Shop has two independent filter systems — high priority

**Reproduction:** select **Calm & focus**, then **Softgels**, then **Clear all**.

**Observed:** Clear all resets the original format state but leaves Calm & focus selected. Only L-Theanine is visible, while the result text says **Showing all 7 products**. The new empty-state message can also remain visible after a matching product returns. Selecting a support goal alone does not expose the original Clear all button or update its count. Reloading loses the support selection.

**Cause:** [web/shop-v2-e.js:72–98](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/web/shop-v2-e.js:72) hides cards with a CSS class outside `shop.js`'s shared filter, count, URL and reset logic. The empty-state updater listens to clicks in `.sp-bar`, while reset controls can be outside that bar.

**Change:** include support in the same parsed filter state as format/stock/sort. Calculate one visible set, one count and one empty state. Reset, URL history and return-to-Shop restoration must use that same state.

**Acceptance:** goal-only counts and announcements agree with visible cards; Clear all restores seven; empty messages disappear when products return; reload/back/forward retain the selected goal; invalid goal values recover safely.

Evidence: [interactions.json](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/interactions.json), [targeted.json](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/targeted.json), [evidence-shop-count.png](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/evidence-shop-count.png).

### 3. Some mobile hero text is almost the same brightness as its background — high priority

On Iron's phone hero, **MRP** and **No reviews yet** inherit `rgb(93, 88, 83)` against the solid cap background `rgb(170, 71, 46)`. The measured contrast is approximately **1.22:1**. The price itself is legible; these secondary labels are not.

**Change:** give text on a cap-coloured background an explicit accessible foreground token. Check every cap colour, including muted, visited and hover states. Prefer moving nonessential empty-review text out of the purchase row rather than giving it more prominence.

**Acceptance:** ordinary informative text meets the 4.5:1 contrast target; large text has the applicable 3:1 target. These thresholds come from [W3C's contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). This focused measurement is not a full accessibility audit.

Evidence: [targeted.json](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/targeted.json); [iron-bisglycinate-mobile-detail.png](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/iron-bisglycinate-mobile-detail.png).

### 4. Quality's Source and Checks controls lead to the same generic destination — medium priority

Both controls point to `#chain` in [web/standards-v2-e.js:18](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/web/standards-v2-e.js:18). Clicking Checks leaves `#checks` closed; the shopper must locate and expand **How quality is checked** manually.

**Change:** Source should target and open `#source`; Checks should target and open `#checks`. Opening via a URL should also reveal any enclosing details and align below the sticky header. Formula can continue to target the ingredient explorer if that is the intended destination, but its name and destination should be consistent.

**Acceptance:** each control reveals the promised information in one action. Browser back and direct bookmarked links behave predictably.

Evidence: [targeted.json](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/targeted.json) → `checksLink`; [interactions.json](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/interactions.json) → `quality`.

### 5. Legacy time-filter URLs still apply an invisible filter — medium priority

`/shop?time=night&design=e` shows only Psyllium even though the owner removed the time-filter controls. The old filter state is still parsed. A visible result chip/reset may give a way out, but the page no longer offers the control that generated the state.

**Change:** explicitly migrate or remove the retired `time` parameter for E. Keep it working for variants that still expose the time filter. Review obsolete format values such as `Gummies` in old preview links as part of the same migration.

**Acceptance:** an old E URL reaches a comprehensible supported filter state, without silently narrowing the catalogue by a retired control.

Evidence: [interactions.json](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/interactions.json) → `removedTimeQuery`; [evidence-hidden-time-filter.png](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/evidence-hidden-time-filter.png).

### 6. Direct Story chapter links leave the chapter hidden — medium priority

Opening `/story?design=e#chapter-4` finds the chapter element, but its enclosing Read disclosure stays closed and the page remains at the top. The old chapter IDs survive the restructure, but their visibility does not.

**Change:** reveal enclosing disclosures before aligning a hash target. Apply the same behavior after in-page navigation and history changes, with focus positioned appropriately for keyboard users.

**Acceptance:** direct links to all seven chapters expose the requested chapter and scroll below the sticky header. No content needs to be copied out of the full Story narrative.

Evidence: [facts-normal-motion.json](/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website/design-review/readability-2026-11-03/facts-normal-motion.json) → `chapterLink`.

## The most useful design improvements

### Home: give the cards enough room to be read

The owner-approved layout now has a coherent sequence. Its weakest area is the phone product grid: it squeezes the full support sentence, product name, three fact chips, diet mark, price, MRP and Add into a narrow card.

Measured at 390 px: support lines are **11.5 px**, dose/time/food chip text **10.5 px**, and Add buttons **34 px high**. Iron's full support line wraps to three lines. The cap image helps identification, but the important words require close reading.

Keep the two columns. Increase the support line to a readable 13–14 px; use at least 12 px for secondary chip labels; raise Add toward a comfortable 44 px touch height. Let the cards grow slightly. Prefer fewer decorative chip containers or a consistent compact facts row over shrinking text. Keep the approved support line word for word and keep card pack sizes removed.

Home and Shop should share type, icon and button conventions even though their phone layouts differ. The current Shop list cards are much easier to read than the Home cards.

A 44 px control is a comfort target here, not a claim that every current smaller control fails WCAG. [W3C's minimum target guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) uses 24 px with specified exceptions; larger targets help important controls.

### Home: tighten repeated trust content within the retained sections

Keep Proof, Voices and Before you order. The trust strip and Proof still repeat the same three certification/traceability assertions. Let the strip identify the topics and take people to the relevant proof; let Proof display the actual licence, label, document and maker information.

Keep Voices' preview label conspicuous and keep the production empty state concise. Sample ratings are not customer evidence. The existing preview-only gate is useful and should be preserved.

The desktop page is roughly **8,776 px** tall; phone approximately **9,381 px**. The big desktop contributors are the collection (~1,443 px), Proof (~1,569 px) and Voices (~1,630 px). This suggests reducing internal padding and repeated framing before deleting another section.

### Shop: reach products sooner on a phone

The first product card starts around **740 px** down the current 390 px preview. Intro, eight support choices, format, stock and sort use most of the first screen. Production removes the preview toolbar, so that exact position is not a production measurement, but the filter block remains substantial.

Keep the support choices the owner requested. Compress the introduction and use a compact Filters control for secondary format/stock options, with sort alongside it. Show the active support choice and a reliable reset next to the result count. Do not replace one cluttered area with a new comparison wizard.

The actual product list is comparatively clear. Keep its larger names, readable support line, visible price and direct Add action.

### All product pages: group label details instead of making every field a separate task

Iron has a very long sequence of individual expandable label rows: ingredients, amount, serving size, servings per pack, other ingredients, allergens, dietary suitability, manufacturer, directions, preparation, age, suitability, cautions and storage, plus additional folds. The nutrition table remains open, but the stack of closed rows is still visually long.

Group them into a few clearly named disclosures such as:

1. Ingredients and allergens.
2. Serving and pack facts.
3. Directions and preparation.
4. Cautions and suitability.
5. Storage.
6. Manufacturer and licence details.

Keep the nutrition table immediately readable and keep all original label wording inside the groups. Surface a short label-derived allergen/diet statement where it helps the buying decision. Do not remove detailed cautions to save space.

This applies [progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/) to meaningful groups instead of giving every field its own interaction.

### All product pages: establish a clearer reading rhythm

The price and Add action are easy to find, and the first product image is clear. Keep that. Further down, repeated full-height spacing, coloured dividers, heading columns, diagram text, label folds, reviews and question forms make a supposedly six-section page feel much longer.

Iron is about **8,065 px on desktop and 9,527 px on phone** before opening all details. Start by tightening the Label and Reviews & questions sections. On desktop those are about **1,856 px and 1,247 px** respectively.

Keep the existing sticky section headings. In Highlights, make the visual number/form explanation the focal point, followed by the short label-based explanation; fold only the deeper explanation. Keep direct lot lookup and label PDF access together.

### Quality: finish the restructuring already started

The record picker with explicit publication states is valuable. Keep it. The page still shows the transitional heading **How we work, and what is still to come.**, although the new layer's comment says that divider should have been removed. It adds an extra pause between the chain and maker information.

Keep one clear information sequence: selected product's record → chain → maker → lot lookup → communication principles. Fix the Source/Checks links first. Shorten repeated explanations of what is not published by using the existing explicit row statuses, with detail available on tap. Retain the actual gaps and the distinction between a maker's address and ingredient origin.

At approximately **9,354 px on phone**, this is still one of the heaviest pages. Avoid another set of all-caps micro-labels inside every record; several remain **10 px**.

### Story/About: preserve the narrative, simplify the framing

The new problem → café idea → form/amount/moment/proof sequence is much clearer. Preserve the full original chapters behind Read. The longest visible areas are the café menu, the four explanatory cards, and the four values; reduce their repeated framing and vertical padding before cutting the narrative.

Use disclosure labels that tell the reader what opens. **Read: Careful people + 2 more** is less clear than a concise description of the chapters it reveals. Confirm direct chapter links open the enclosing Read group.

A small **2 px page overflow** appears on the 390 px layout when the first Story disclosure is opened; the initial closed-page sweep does not catch it. Fix the expanded layout too. This is a minor geometry issue, separate from the larger readability work.

### Super Sevens: keep the play, make the back of a card legible

This is the appropriate home for the playing cards. Keep them off the purchase page. Preserve the no-complete-the-set/individual-choice rules.

On phone, the seven cards create a long vertical run, and the back retains small typography, including 8 px labels and 11.5 px fact text. Increase the readable facts and keep the front/back interaction obvious. Check that the back's longer D3 + K2 and Omega-3 amounts fit without clipping. Do not use a low visible word count as the sole success measure: flip faces and screen-reader-only descriptions affect DOM text counts.

### Learn hub and guides: retain useful reading, remove true repetition

The hub's questions and product guide cards are useful. Keep the search first and let the guide cards' questions do the explaining.

The product guides remain a long, older composition. Iron repeats its opening explanation in the hero and again under **In a minute**, then carries a playing card, an 11-entry contents list, product facts, usage facts, FAQs, related guides and several follow-up actions. Its phone page is about **11,191 px**.

Use one short opening, a concise contents control on phone, and a clearly labelled product-facts panel. Keep sources, specialist-review status, general education and product-specific facts distinguishable. Preserve actual educational prose; converting every explanatory paragraph into a bullet list would harm reading here.

### Help and all linked help articles: keep the task-led structure

The Help hub is already one of the better pages: search, quick actions, topic cards, questions and policies. The linked category/article routes passed the four-width checks. Avoid adding another decorative intro.

Keep category names, breadcrumbs and contact links consistent with the new global navigation. Use one clear end-of-article support action. A dedicated article should answer the question before presenting adjacent topics.

### Contact: readable channel and product choices

The phone/WhatsApp/email switchboard works as a clear first step, and hours/grievance information remains available. Product names under the cap picker are only **8.5 px**. Increase them or put the selected product's full name in readable text next to the picker; retain accessible labels on every cap.

Use the topic picker to prefill the form with a visible selection. Avoid presenting the same topic as separate competing controls. Keep the existing business details fold, contact information and grievance information intact.

### Reports: make the first successful lookup self-explanatory

The lookup-first arrangement is sound. Empty, missing, unpublished, withdrawn and outage states were included in the route sweep. Keep product+lot matching, retained entries on errors, visible record status and the glossary on tap.

The next useful visual improvement is a real, legible crop of the lot's position on a pack, replacing the schematic when source photography exists. Use **Lot number** as the stable term throughout. Keep guidance near the input short, and link to the longer explanation. Do not add another introductory section above the task.

### Bag, checkout, account, orders and payment states

The empty bag has an obvious way back to Shop. These routes and the supplied transactional states passed the layout sweep. Keep actual totals, quantities, delivery charges, errors and next actions visually dominant. The seven-slot brand tray should remain secondary to the user's items and total.

Customer-signed-in behavior and real payment/provider completion were not exercised. Do not treat the fixture pages or passing layout checks as verification of those services.

### Policies, settings, search, bundles and 404

Keep policy reading layouts, summaries, section navigation, version information and print access. These are reading pages; do not apply the homepage's short-copy rule blindly to them. All five policy routes passed layout checks.

Search hit/miss states, preferences, both bundle detail routes and 404 were covered. Preserve visible recovery actions and stable product links. Use the clearer navigation vocabulary in suggested searches and secondary links where it still differs, without changing canonical addresses.

## Implementation order

1. Repair serving initialization, unified Shop filter state, cap-background text contrast, Quality destinations and hidden Story chapter links. Add behavioral checks for these failures.
2. Improve Home card and Contact picker typography. Make key mobile actions comfortably sized. Keep the owner-approved layouts.
3. Group PDP label disclosures, tighten Label/Reviews sections, and compact secondary Shop controls.
4. Finish Quality/Story cleanup; simplify guide opening/contents; improve playing-card back typography.
5. Consolidate the settled E implementation instead of adding another override layer. The local preview loaded **68 CSS resources and 73 JavaScript resources**, approximately **1.52 MB CSS + 1.86 MB JavaScript decoded**. These are local preview measurements, not compressed network transfer sizes or a public-site speed score. The production builder already strips some other-direction files; measure that build separately before proposing further bundling. Preserve the multi-design preview.

After changes, repeat the four-width sweep **and** meaningful interactions: reset/reload/back, per-product serving quantities, opened details, named navigation targets, menu keyboard access and actual rendered label facts. Source-copy tests alone cannot confirm that the new page wrappers preserve functionality.

No storefront source, backend records, deployment settings or publication state was changed by this audit. Existing uncommitted Claude edits were left intact.
