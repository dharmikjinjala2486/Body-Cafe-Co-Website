# Body Café Co. — complete website review

26 October 2026 · Local preview · Directions A–H

## The decision

Body Café has a strong visual foundation: recognizable packaging, seven useful product colors, a memorable name, and substantially more supporting information than a typical early commerce prototype. The next step is to make that foundation easier to understand and use.

**My recommendation is B as the primary brand direction, refined with E's shopping clarity and H's reading discipline.** This is an editorial judgment, not a conversion-test result. B most naturally connects the café name, warmth, color, and approachability. E is the strongest alternative if a quieter, product-led shop is the goal. C is the most atmospheric campaign world. A and D are useful sources of distinctive product motion.

The largest opportunities are:

1. Repair mobile navigation and clipped controls.
2. Make product facts and demo status consistent across every surface.
3. Give visitors an immediate shopping path and a concrete reason to care.
4. Make typography, spacing, and interaction behavior coherent across the site.
5. Turn the transparency promise into accessible, product-specific evidence when genuine records are available.

The site does not need more sections before those problems are addressed. It needs stronger decisions within the sections it already has.

## What was reviewed

- **Eight variants, 46 base routes and 30 additional query/state examples:** 608 desktop and 608 mobile page/state observations, or **1,216 observations**. Desktop was 1470 × 730; mobile was 390 × 844 CSS pixels.
- All seven product pages; the shop; two bundle details and the bundle index; About; Story; Standards; Learn; seven product guides, five foundation guides and the glossary; lot lookup; bag; checkout; sign-in; account, addresses and support cases; Help; Contact; Preferences; five policies; Search; and the preview-state index.
- The 30 examples include payment, order, account, contact, checkout, lot-result, filtering and empty-search states. These are designed fixtures, not proof of completed real transactions.
- **144 additional breakpoint observations:** six important routes × eight variants × 320, 768 and 1024 pixels. No page-wide horizontal overflow was found in that sample.
- All **12 shared operations sections**, at desktop and phone width, using the read-only demo Viewer. Operations are shared rather than eight separate designs.
- Full-page captures for 15 principal page families in each variant at desktop and phone width. Visual review used page-family comparisons, homepages, footer comparisons, and focused defect captures.
- Interactive samples included mobile menus, collection filtering and sorting in all eight variants, global search, product accordions, image viewing, and the A hero pause control. A's pause control changed to “Resume motion” with its pressed state set correctly.
- Existing repository tests: **74 passed** with `python3 -B -m unittest discover -s app -p 'test_*.py'` using the bundled Python runtime. Local-port tests required execution outside the filesystem sandbox.
- Source review covered the shared shell, demo-content transformation, product content, asset loading, and motion lifecycle.

This is a structured design, content and usability audit, not a claim that every possible interaction has been exhaustively tested. It does not establish screen-reader conformance, physical-device performance, production Core Web Vitals, payment-provider behavior, or conversion rates. No implementation changes were made. Initial loading snapshots were rechecked when they showed unfinished content; a transient blank account view resolved and is not reported as a persistent defect.

## What already deserves to stay

- Original logo artwork and the seven cap colors give the brand a useful recognition system.
- B's friendly shapes, C's serif atmosphere, A's product sculpture, and E's color index are distinctive ideas.
- Product-page section order is shared across variants, which makes content consistency achievable.
- Format filters, URL state, empty states, and price sorting are useful existing capabilities. The Softgels filter and price-sort URL updates worked in each variant during the interaction sample.
- Learn includes sources, reading time, saved guides, a glossary, and print-oriented actions.
- Lot records distinguish document availability, result status and notices rather than treating every record as a simple “pass.”
- Guest checkout is visible. Support cases and private safety concerns have their own paths.
- Much of the core form labeling and control sizing is already sensible. The broad DOM sweep found no unassociated visible form fields in the captured base/state layouts.
- Motion code includes reduced-motion handling, offscreen/visibility control and resource cleanup. Those are valuable foundations to preserve.

## Confirmed problems to fix first

### 1. A, C and D mobile menus throw an error

At 390 pixels, open “Menu +.” A toast reports `Cannot set properties of null (setting 'textContent')`. Selecting a drawer destination can close the drawer without completing the intended navigation. C was reproduced from a product page with the destination URL unchanged.

The active A/D header in `creative.js` and C header in `world.js` use plain button text. `openMenu()` and `closeMenu()` in `app.js` expect a child `span`. This is a shared contract mismatch, not an aesthetic preference.

**Action:** give the controller a stable label target or update the button label safely. Confirm open, close, Escape, first-link navigation, focus return, and scroll restoration on A/C/D. The first tap on a destination should reach it without any error toast.

Evidence: [menu error](defect-c-menu-error.png), [interaction record](interaction-menu.json). The early batched interaction record contains attempts during opening transitions; B/G/H non-navigation entries in that record were investigated separately rather than all being treated as the same JavaScript defect.

### 2. B hides its mobile Shop row under the header

At 390 × 844, at the top of the homepage, B's header occupied approximately y=103.5–175.5. The Shop row occupied y=106–168. The row's center hit-tested to the header search icon. Other rows were visibly below the header.

**Action:** position the drawer below the actual header/preview stack, or design a deliberate full-screen menu with its own header and safe content inset. Test opening it both at the top and after scrolling. Shop must be visible and tappable.

Evidence: [B mobile drawer](defect-b-mobile-menu.png).

### 3. C clips the product Enlarge control

C's arched product-image container clips the top-right Enlarge pill. At phone width the center of that pill hit-tested to the surrounding gallery rather than the button. Clicking the large product image did open the full-screen viewer, so the viewer itself works; the visible pill is the problem.

**Action:** keep controls outside the arch's clipping surface. Preserve a normal rectangular control layer over the decorative image mask. Test all seven products at 320 and 390 pixels.

Evidence: [clipped image control](defect-c-enlarge-clipped.png).

### 4. The same product gives conflicting pack information

Vitamin D3 + K2 displays **“Pack quantity: 60 softgels.”** Its expanded question about pack quantity says the quantity will come from the approved label and the artwork count is not confirmed. Bag rows still say pack size is awaiting an approved label. The demo adapter fills the product facts while other sentences retain the earlier status.

**Action:** model facts as values with a status: approved, demo or unavailable. Render that same fact/status into cards, product pages, bag rows, FAQs and guides. For the preview, “Demo pack: 60 softgels” is clearer than an unqualified count beside an answer that disowns it. Approved production values should replace the whole record, not individual phrases.

### 5. Shipping policy sections receive the wrong sample text

Across the shared policy content, the “Delivery charges” section contains a **3–7 business day delivery estimate**, rather than a charge. “Failed delivery and return to us” receives that same estimate. Some other sections fall back to a generic contact sentence.

The demo adapter matches section IDs/headings against generic keywords; `delivery` can match before the intended shipping entry. This is an actual content-mapping defect even in an illustrative policy.

**Action:** map sample content to exact section IDs. The delivery-charge paragraph should state the applicable sample charge and threshold; estimates should appear under estimates; failed delivery needs its own explanation. Review all five policies after the mapping is corrected.

### 6. Several trust statements contradict their surroundings

- C displays **“NOTHING MADE UP”** next to fictional preview feedback.
- Homepages use **“Real people. Their own words.”** while naming a preview customer and explaining that the feedback is fictional.
- About ends by saying public contact details will be published once confirmed, while the footer and Contact already display email, phone and WhatsApp links.
- The product “Approved label image” heading has no approved rear-label image beneath it; the demo adapter replaces the missing-image explanation with a pack-directed sentence.

**Action:** make headings truthful at the point of reading. Preview sections can say “Customer feedback layout” or “Illustrative feedback.” An absent label should have a direct “Rear label not available in this preview” status. Use one source for contact-channel status.

### 7. H's bag count is almost invisible

The sampled H header count used `rgb(228,233,239)` on white, approximately **1.22:1** contrast. The existing bag contained two items, but the pale count was hard to read.

**Action:** use the primary dark text color, or a solid dark badge with light text, and preserve the accessible bag quantity label. Validate the final color pair, including empty, one-item and multiple-item states.

## Comparing the eight directions

These are qualitative assessments of the current designs, not measured business-performance rankings.

| Variant | What is strongest | What holds it back | Best next refinement |
|---|---|---|---|
| **A — State of Play** | Memorable electric-blue/lime system, strong poster typography, interactive bottle sculpture | Dense visual energy, very small labels, shopping action low in the introduction, broken mobile menu | Keep the energetic hero; give it a persistent, plain “Shop all seven” action, shorten the intro, enlarge functional labels and calm utility pages |
| **B — Expressive everyday** | Warmest relationship to the café name; friendly type, rounded forms, approachable product colors | Mobile Shop row obscured; some sections repeat the same visual formula; homepage becomes long on phones | Use as the flagship candidate; repair menu layering, vary section rhythm and replace generic curiosity lines with useful product distinctions |
| **C — Everyday Elsewhere** | Most ownable atmosphere, attractive serif/italic pair, warm palette, imaginative visual world | Giant cup/scenery can suggest a café or travel experience; no direct shopping CTA in the opening chapter; clipped zoom pill; menu error | Keep the world but identify supplements immediately, show a recognizable bottle early and add an always-available catalogue path |
| **D — The Other Side** | Premium staging, appealing bottle-and-cap storytelling, dark/gold identity | Longest scroll commitment; small labels and pause text; theatrical metaphors spread into routine tasks; menu error | Reduce the default narrative length, add a direct product/shop route, enlarge controls and use simpler language in checkout/support |
| **E — Fan Deck** | Clearest product-color system; strong catalogue potential; concise shopping labels | First screen emphasizes typography/chips more than the actual product; some caps labels are small; plainness can feel unfinished | Bring a useful bottle composition higher, clarify selected chip states and use warmer product photography while keeping the disciplined layout |
| **F — Edition** | Refined editorial grid, strong art-direction potential, consistent edition/caption language | Ultra-light headings weaken scan speed, extra running heads consume vertical space, mobile product title and buy controls appear late | Strengthen display weight, reserve italics for short accents, remove edition metadata from utility routes and shorten the mobile gallery |
| **G — Darkroom** | Strong monochrome staging; colored packs stand out; clear visual contrast between image and reading panel | Thin type and dark framing create a luxury/gallery tone that can distance an approachable wellness brand; photography metaphors are sometimes obscure | Use heavier functional type and literal evidence terminology; retain dark styling where it supports product photography |
| **H — Folio** | Best information discipline, efficient desktop product list, useful margin-note language | Can feel like a reference document rather than a warm brand; tiny footnotes and pale count; many footer links stack vertically | Use as a model for knowledge/product facts; increase secondary-text legibility and add restrained brand-color cues |

### Length and the first meaningful action

The captured homepages were roughly **6,300–12,800 px tall on desktop** and **8,000–13,500 px on phones**, including the preview controls and footer. D was longest in both samples. Length is not automatically a defect; repetition and delayed useful choices are the problem.

At 390 × 844 on the sampled Vitamin D3 + K2 page, the Add to bag button began approximately at y=988 in H and y=1,159 in F; the other directions were between those values. Every variant put that primary purchase control below the initial viewport. F's product title began around y=792. The existing sticky purchase bar appears only after the main purchase panel has scrolled past; it does not solve the initial discovery gap.

**Target:** in the first mobile viewport, show product identity, a manageable image, price and a clear purchase path. Shorten the gallery or move identity and price above it; allow a compact sticky purchase action when the main action is outside view, with suitable spacing for the phone's safe area. Validate this with real users before treating “above the fold” as a universal rule.

## Design system: typography, color, layout and imagery

### Typography

Use a deliberate type system for the chosen direction. B can use Aileron for functional reading with a controlled brand display face; C can retain Gloock for expressive headlines; A/D can retain condensed poster headlines for short moments. Prices, input labels, button labels, instructions and long articles need a highly readable family and weight.

The sampled homepages include labels at **6–10 px** in some directions. D's phone pause label was around 6 px; C's opening identity line was about 7 px. Those are design values, not browser errors. Increase meaningful metadata to at least 12–13 px as a product-design target, and keep normal body copy around 16–18 px. WCAG does not prescribe one universal minimum font size, so these are readability recommendations.

F and G need stronger headline strokes. Very light type may mathematically meet color contrast but still look fragile on smaller or lower-quality displays. Use slightly looser tracking and avoid squeezing long product names. Myo & D-Chiro Inositol is a useful stress case. Keep monospaced uppercase labels short and subordinate.

The About design explanation describes Lemon Milk and Aileron, while the current variants also use Anton, Gloock and SpaceMono. Make the brand typography policy explicit: core reading fonts, permitted campaign display fonts, and where each is used.

### Color

Make the cap colors a consistent product key across cards, filters, product pages, guides, bag items and lot selection. Pair colors with written product names and selected-state indicators. The seven-color system is more valuable than adding more unrelated decorative colors.

Use semantic colors separately: success, error, unavailable and warning should have stable meaning even when the selected product is blue, green or red. Use a written status and icon as well as color. Check actual rendered text/background pairs and interactive focus states.

The contrast scan produced candidates, not a full accessibility certification. It intentionally requires manual checking where images, masks, gradients, hidden text or modern `color()` values are involved. H's count was independently checked. C's small sample-price label on the peach product area is another candidate to correct/verify; the plain computed pair was approximately 3.97:1. Do not treat the raw candidate file as a list of proven failures.

### Space and hierarchy

Use fewer decorative labels around one decision. A page does not need a section number, chapter name, edition number, object index, caption and secondary heading all explaining the same thing. Choose one useful orientation cue.

Establish a repeatable spacing scale for card padding, field gaps, section headers and long-page boundaries. Give Shop, Search, Help, Account and Checkout compact introductions. Reserve the largest display compositions for the homepage and selected brand stories.

### Product images

The bottle renders give the collection coherence, but front image plus cap-top image is a weak buying gallery. Build a reliable image set for each SKU: accurate front, readable rear label, side/scale, actual capsule/softgel/chew, and one relevant everyday setting. Use consistent lighting, pack scale, white balance and cropping. Keep the selected product recognizable across desktop and mobile.

C's imaginary environment is attractive but its enormous cup dominates the first impression. Introduce an actual bottle silhouette or product-focused composition so the scene works as Body Café's world. Use authentic team/process photographs on About and Story when supplied, rather than repeating the same bottle lineup as the only evidence of the business.

## Header and footer

### Header

After the concrete menu fixes, use one reliable interaction contract for all variants. Keep Shop prominent. Consider grouping About and Story, since both currently explain the same philosophy. Standards and Learn should have distinct jobs: proof and education. Give existing customers a clear Lot reports and Help route without making those actions compete equally with the primary shopping task.

Phone navigation should open below the full header stack, scroll independently, provide a visible close state, close on destination selection, and return keyboard focus sensibly. Test at page top and mid-scroll. Preserve visible focus rings and test that background content is not accidentally reachable when a modal navigation treatment is used.

The preview selector occupies significant phone space. It is useful for the current design review; make it collapsible or move it to a reviewer drawer in a separate review mode. For a customer release, serve the chosen direction without the design selector and operations-preview navigation. Evaluate the chosen design again after that change because its first-screen composition will shift.

### Footer

Desktop footers generally have useful groupings and strong brand signatures. Phone footers measured roughly **1,100–1,530 px tall** on the sampled product pages. E/F/G/H especially stack many links and all products before the final legal line.

Use collapsible Shop, Learn/About, Help and Policies groups on small screens; keep Contact, order access and lot lookup directly available. Preserve the original logo artwork. A/C/D's large signature artwork is effective when it has breathing room, but the entire footer should not feel like another homepage chapter. Ensure its links have comfortable hit areas and meaningful labels.

Use one set of public contact details and service-status facts. A future newsletter form should explain what readers receive and be added only when the subscription service works; its absence is not currently a defect.

## Page-by-page improvements

### Homepage

Within the first screen answer: what is sold, what makes this shop useful, and where to begin. A suitable factual draft is: **“Seven everyday supplements. The details within reach.”** Supporting copy can mention capsules, softgels and chews, readable ingredient information and lot records. Main action: **“Shop all seven.”** Secondary action: **“Explore our approach.”** Final wording must reflect the information actually available in the release.

Keep the café personality in the headline and visual world, then become specific. Reduce repeated uses of curiosity, everyday, clear details, labels and lots when they do not add new information. Show the range earlier. Make each later section answer a different question: choosing, ingredients, evidence, real customer experience, delivery/help.

The ingredient cabinet currently asks essentially the same question for multiple ingredients. Replace those prompts with meaningful editorial questions for each product, with a short answer before the link. Preserve the shared seven-section structure if it remains a project requirement; tighten content within it.

### Shop and bundle pages

Format filters are a useful foundation. For seven products, an uncomplicated catalogue is sufficient. Improve comparison at a glance: product name, accurate pack quantity, format, approved short description, price, availability and a visible action. Stronger evidence of value is more useful than “Get to know your everyday ingredient.”

“Recommended” sorting does not explain its basis. Use “Featured” when the order is editorial, or explain the ranking. Keep selection and result counts obvious, and preserve Back behavior. Consider format or product comparison before adding a complex medical-style quiz.

The bundle pages currently make arbitrary example pairings with no approved savings or joint-use recommendation. Their title and purpose should make that clear. An intentional “Compare these products” experience may be more useful until genuine bundle rules, pricing and content exist. Show individual prices and the exact total consistently.

### All seven product pages

The shared eight-section structure is sound. The first screen needs faster product recognition and decision support. Prioritize product identity, approved purpose/description, format, serving/pack facts, price, availability and the purchase action. Follow with readable ingredients and cautions, then evidence, reviews and questions.

“Refer to your pack” is understandable in a preview, but a prospective shopper does not yet own the pack. For a customer release, publish the approved label facts in readable text and as an enlargeable label image. Keep pending facts clearly unavailable until supplied.

| Product | Specific information needed for a useful final page |
|---|---|
| Iron Bisglycinate | Elemental iron amount and unit, exact form, serving/pack quantity, full ingredients and shell, approved directions and cautions |
| L-Theanine | Exact form and amount, serving and pack facts, source/suitability where substantiated, approved description and full ingredient list |
| Vitamin D3 + K2 | Make the included omega-3 clear in the product identity; state the separate amounts/units/forms, ingredient sources, allergens and complete label |
| Omega-3 Fish Oil | Separate total oil from EPA/DHA amounts; clarify form, source, full allergen statement, serving and pack facts, and relevant genuine quality records |
| Myo & D-Chiro Inositol | State each ingredient's amount and relationship/ratio where approved; full formulation and label; keep the long name readable |
| Creatine Chews | Confirm the formulation, creatine form and amount per chew/serving, chew base, sweeteners/flavor and pack quantity; distinguish chews from gummies |
| Psyllium Husk | Explain this capsule format clearly; publish husk/fiber amounts as approved, capsule ingredients, serving/pack facts and label instructions |

These are content requirements, not suggested doses or health claims. Keep product-specific claims tied to approved records and distinguish ingredient research from evidence about the finished product.

The pincode tool currently validates formatting without serviceability or an ETA. Rename it to **“Check pincode format”** during preview, or replace it with a genuine delivery check for release. A shopper should not need to read a disclaimer to discover what a prominent utility can do.

The gallery zoom and keyboard functionality are good foundations. Add the missing rear label, keep controls outside masks, and preserve focus on closing. Hide or compact empty review and question sections when appropriate while keeping the route to ask a question. Fictional feedback belongs in a clearly marked reviewer example, separate from actual social proof.

### Standards and lot reports

The Standards page contains around **1,900 words** in the sampled C render, with explanations of formulas, origins, quality processes and evidence types. It often teaches the reader what a good evidence system would contain. A stronger hierarchy is: **what is actually available → what it supports → supporting document → further explanation.**

Use a compact evidence index, product scope and clear dates. Keep the educational material available through details or Learn links. Status labels such as “Demo record” should not visually resemble verified evidence badges. Replace fictional manufacturing/origin entries with supplied records before using them as brand proof.

Lot lookup should be useful immediately on phones. Put product selection and the lot input ahead of the lengthy explanation, remember the product when coming from its page, and show a real label-location diagram when one is available. Give a compact result summary first: exact product/lot match, document state, test/result state, notice state and next action. Preserve the richer explanations below.

All five sample lookup states were included in the route sweep. They are demo records without laboratory documents, so the audit does not assert that any product has passed tests. Add a shareable record link, accessible printable summary and original document only when supported by the published record. Measure lookup completion and unsuccessful searches when analytics is appropriately enabled.

### About and Story

About should explain the present business: people, purpose, responsibilities and how the shop works. Story should explain the origin: a real event, decision, turning point and the people involved. The current pages repeat the label/curiosity philosophy and packaging artwork, while the founder material is intentionally missing.

Until genuine material arrives, shorten the absent-people section and avoid a prominent “Meet the people” destination that has no people to introduce. Add names, roles, portraits and a specific origin story when supplied. Prefer concrete examples of a decision over a long list of generic values. Connect promises to the relevant evidence and support routes.

### Learn, all guides and the glossary

Keep the sources, plain-language terms, reading time and saved-reading capability. Make the hub's first choices simpler: **Understand a product · Read a label · Understand evidence.** The current many-section index can be a secondary tool.

On mobile, the guide heading, metadata, three utility buttons and full table of contents occupy the first screen before the article starts. Put the short takeaway first, make the contents collapsible, and group secondary actions under a compact menu. Maintain a readable line length and body line-height. Use real label diagrams and worked examples to break up long explanation.

Complete specialist review and show an identifiable editorial/reviewer record when genuine review is available. “Not yet specialist-reviewed” is honestly disclosed today; it is a content-readiness dependency, not an error to conceal.

Unify global and Learn search. In the global “omega” interaction, the results showed two products and an ingredient-forms guide, while the dedicated Omega-3 guide was not present in that result set. Index all product guides, foundation guides, glossary terms and help entries with sensible result grouping and synonyms. Validate the intended ranking with representative queries.

### Bag, checkout, payment and orders

Bag rows must agree with product-page pack facts. Keep the price breakdown understandable, including any discount, delivery charge and threshold after discount. Show a concise amount remaining for the delivery threshold if genuine. Preserve stable focus and clear feedback when quantity changes. Save-for-later should explain that it is stored in this browser if that remains its scope.

Checkout is a task page. Reduce the oversized introduction, keep progress labels literal and short, bring the first field higher, and make the order total available through an accessible mobile summary. B's decorative progress sequence and the A/C/D narrative labels add interpretation without helping someone complete a form. Use **Delivery → Payment → Confirmation** consistently.

The fixture error, pending, failed, expired, unavailable, confirmed, shipped, delivered and cancelled/refund states provide a useful review surface. Make each state lead with what happened and the next useful action. Display an understandable remaining reservation time only when it reflects actual server state. Ensure retry and refresh do not create duplicate orders through integration testing when providers are connected.

No real purchase, payment, refund, shipment or customer sign-in was performed for this audit. Their fixture layouts and existing automated tests should not be confused with real provider validation.

### Account, sign-in, addresses and support cases

Make orders and support status the first visible content after a compact greeting. Use literal order statuses and dates. Keep order details, tracking, invoice/receipt access where available, and issue reporting together. Avoid large editorial headlines consuming the screen before the tasks.

Sign-in should state the mobile-number format, what the code does, expiry/resend state and how to change the number. Clearly distinguish the preview's on-screen code from a future SMS flow. Addresses need useful labels and predictable edit/cancel behavior. Support case lists benefit from last update, owner/status, related order and the next expected step. Keep all these treatments consistent across variants.

### Help, Contact, Preferences and policies

Help's quick actions are a good pattern. Prioritize delivery, order problems, cancellation and product questions; keep the search box obvious and show direct answers before requiring a support case. Test useful synonyms and queries that return no match.

Contact currently lists all channels as “Available,” while response hours and targets are marked as demos and the site says it cannot send email/SMS replies. Clarify whether “available” means a working contact link, staffed support, or the local case function. Keep email/phone alternatives direct, and show the practical reply route. The form is reasonably concise; use conditional fields for order references and issue-specific details.

Preferences has a good separation between necessary storage, optional analytics, motion and account marketing choices. Preserve that clarity. Verify the saved motion preference on every animated scene and every new navigation, and preserve the user's device setting.

For the five policies, repair the sample section mapping first. Then provide a useful short summary plus a well-structured full policy. Keep delivery charges/timelines, returns, cancellations and refunds consistent with product pages and checkout. The current illustrative policies are not live trading terms; approve the actual business decisions before presenting them as such.

### Shared operations

The 12 Viewer sections cover overview, orders, inventory/batches, products/prices, support/safety, reviews/questions, lot reports, approvals, audit, analytics, integrations and flags. No page-wide overflow was found in the phone sample; individual tables can still require horizontal scrolling.

Improve operational scan speed with visible status counts, search/filter controls, consistent dates/currency, sticky table headings where helpful and explicit empty states. Give safety cases and withdrawn lots greater hierarchy than routine notices. For small screens, prioritize a record summary and drill-down rather than shrinking every table column. Keep production identity, integration and approval behavior as separate release work; read-only visual review did not validate administrative mutations.

## Motion and performance

Use motion to explain or acknowledge: switching a product, opening a cap, revealing a fact, adding to the bag. Keep one primary moving focal point at a time. A's sculpture and D's cap sequence have potential because the motion relates to a product object. C's landscape should remain optional atmosphere rather than a prerequisite to finding the range.

Suggested design budgets: 120–180 ms for small feedback, 200–300 ms for menus/panels, and short, skippable narrative transitions. These are proposed interaction guidelines, not measured current durations. Respect pause and reduced-motion preferences, retain a usable static first frame, and avoid hiding essential content behind reveal completion.

The shared HTML references **38 stylesheets and 38 scripts**, totaling approximately **1.09 MB CSS + 1.27 MB JavaScript uncompressed**, before further dependencies and media. The seven GLB model files total approximately **8.7 MB** on disk; the scene loader loads the selected model and then requests the remaining six. These are source/asset measurements, not transferred bytes or a Lighthouse score.

Load the chosen direction and required page modules instead of the entire design laboratory. Defer 3D assets until useful, prioritize the selected bottle, and consider loading other models on intent or idle capacity. Compress/optimize meshes and textures, use sensible resolution limits and retain the fallback. Consolidate overlapping legacy styles after a direction is chosen; the menu issue is evidence of the maintenance cost of multiple shell layers.

Measure on a realistic device/network and then set release gates. Google's current good-experience thresholds are **LCP ≤2.5 s, INP ≤200 ms and CLS ≤0.1 at the 75th percentile**, assessed separately for mobile and desktop. [Google Web Vitals](https://web.dev/articles/vitals)

## Accessibility, discoverability and quality checks

- Treat the confirmed menu, clipping and count problems as functional accessibility issues.
- Check text contrast against actual backgrounds. WCAG AA uses 4.5:1 for normal text and 3:1 for large text, with specified exceptions. [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- Aim for comfortable 44–48 px important touch controls. WCAG 2.2 AA's target-size criterion is 24 × 24 CSS px or qualifying spacing/exceptions; it is not a blanket 44 px rule. [W3C target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- Test keyboard-only navigation, mobile drawer focus behavior, image viewer Escape/focus return, filter announcements, field-error summaries, and zoom/reflow at 200% and 400%. These require a focused accessibility pass beyond this audit.
- Keep reduced-motion content fully understandable, including a static view of the selected product and normal links to shop/details.
- The preview deliberately uses `noindex,nofollow`. Preserve that for the preview. A production release needs an explicit indexing decision, canonical URLs, per-route metadata, social-sharing images, a sitemap and accurate product/organization structured data where applicable. No ratings or facts should be invented for metadata.
- The app initially serves a JavaScript shell. Consider pre-rendering/server rendering for important product and guide pages to improve the first response and resilience. Assess the actual hosting setup before selecting an implementation.
- Verify the 404 route, browser Back, copied deep links, direct-load states, empty cart, unavailable product, failed asset, unavailable API and restored form drafts. Useful fixture coverage already exists; expand it around the confirmed interaction regressions.

## Comparison with leading reference websites

“World's best” depends on the job: editorial beauty, commerce clarity, product education and accessibility are different tests. These six live reference sites were used for specific patterns; none is treated as flawless or as proof of superior conversion. Several also interrupt the first visit with region or cookie overlays, which is a reason to be selective about what to borrow.

| Reference | Observed pattern worth studying | Application to Body Café |
|---|---|---|
| [Seed](https://seed.com/) | Product imagery, a direct category proposition, prominent next actions, and product-linked educational storytelling | Make the product and route forward obvious before the atmospheric introduction; connect any animation to a useful fact |
| [Ritual](https://ritual.com/) | Sourcing/science entry points, named people, shopping by need and clear product/price presentation | Turn “shows its working” into specific records and accountable people; use meaningful product distinctions once substantiated |
| [AG1 quality standards](https://drinkag1.com/quality-standards) | A dedicated standards hierarchy with named testing/certification scopes and links to analysis reports | Place genuine evidence one click from the claim; retain scope and dates; avoid borrowing their certifications or claims |
| [Aesop](https://www.aesop.com/) | Restrained neutral palette, consistent imagery and a recognizably coherent retail world | Reduce decorative competition and maintain image/type/space discipline; its larger-catalogue navigation is not necessary for seven SKUs |
| [Apple iPhone](https://www.apple.com/iphone/) | Product lineup, explicit comparison, and clear shopping/learning paths | Give shoppers immediate access to the range and useful comparison alongside storytelling |
| [OLIPOP](https://drinkolipop.com/) | Playful color and character stay connected to the visible product and concrete product copy | Keep B/C's warmth and imagination while making the bottle, format and practical choice clear |

References were viewed on 26 October 2026. Brand pages change by region, campaign and time. Their health or efficacy claims are not independently assessed or recommended here.

## Recommended sequence of work

### First: repair and reconcile

Fix A/C/D's menu contract, B's drawer offset, C's zoom-control clipping and H's count. Replace keyword-based policy substitutions. Reconcile pack counts, prices, contact status and testimonial headings. Add targeted regression checks for these concrete failures.

**Acceptance:** all first-tap menu journeys work at top/mid-scroll on 320/390/768; all visible controls can be hit; each fact has the same value/status across surfaces; policy paragraphs answer their own headings; no runtime exception appears in these flows.

### Next: choose and refine the primary direction

Refine B and E as two concrete candidates, using the same actual product content. Compare them on a phone with people who have not seen the brand. Ask what the shop sells, what makes the products different, what a lot report means, and how to find delivery information. Measure task success, comprehension, time and errors. A visual vote alone will not choose the better shop.

**Acceptance:** a first-time visitor can identify supplements, open a product, understand the basic product facts and find the next action without an explanation from the team.

### Then: build useful product and evidence content

Collect approved labels and product descriptions, accurate image sets, real business/team material, genuine evidence and finalized service rules. Use structured content records so each variant receives the same facts. Complete guide review. Write short, helpful copy that answers actual shopper questions.

**Acceptance:** all seven product records are complete enough to make an informed choice; evidence links support the associated statements; customer support and policy promises match the operational capability.

### Finally: optimize and validate the release

Load only required assets/modules, benchmark on real devices, complete accessibility testing, connect and test the intended services, and validate indexing and analytics for the chosen release mode.

**Acceptance:** measured performance meets agreed budgets; key journeys pass keyboard and touch testing; real integrations are verified separately from fixtures; analytics can answer whether visitors reach products, use evidence, add to bag and complete checkout without collecting unnecessary personal detail.

## Evidence files

- [Visual evidence index](index.html): browse page-family comparisons, the seven confirmed issue groups, and original captures.
- [Coverage table](COVERAGE.md): every base route and extra state in the desktop/mobile sweep.
- `audit-desktop-*.json` and `audit-mobile-*.json`: raw rendered content and structural observations, with `settled-rechecks.json` for incomplete initial observations.
- `breakpoint-checks.json`: actual recorded viewport widths for the smaller breakpoint sample.
- `detail-metrics.json`: sampled mobile purchase placement and footer dimensions.
- `style-audit.json` and `contrast-candidates.json`: typography/color observations and preliminary contrast candidates. Candidates are not certification findings.
- `operations-audit.json`: shared Viewer layouts only.

The next design improvement should be judged by how much easier it makes choosing and understanding a product. The packaging and personality already provide enough material to make that experience distinctive.
