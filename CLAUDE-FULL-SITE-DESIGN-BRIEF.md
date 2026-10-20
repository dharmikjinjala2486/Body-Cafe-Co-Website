# Body Café Co. — four complete website design directions

19 October 2026 • User-authorized design and content assignment

## The request

Create the best design work you can for Body Café Co.: four exceptionally crafted, genuinely different, complete website experiences. We want internationally competitive visual craft, brand character, thoughtful information architecture, excellent mobile layouts and excellent writing. Treat “world best” as an ambition to demonstrate through the quality of the work, not an award or ranking to claim.

This assignment is **design only, including website content and the frontend prototype needed to review it**. Do the design work; do not stop at a critique, moodboard, recommendations or a new homepage hero. Do not build new backend functionality, connect services, change business rules, implement production commerce, deploy, or push commits. Existing working preview behavior must continue to work.

The user's main concern: the homepages differ, but the rest of the website feels the same. Four PDP themes have already been implemented; most other routes still use one shared composition. Complete all four directions across every customer-facing page and state. Improving only colors, type or the homepage does not satisfy this assignment.

## Why we are creating this

Body Café Co. is an India-first supplement brand. Its initial audience is skeptical Indian shoppers aged 18–35. English comes first, with layouts that can accommodate later translation. Customers need a clear way to understand seven products, inspect label and lot information, compare relevant facts, purchase confidently and get useful help afterwards.

Our positioning and voice are playful, clear and evidence-led. The café identity should make browsing inviting, while the product information remains specific and readable. We want the warmth of an everyday brand and the care of a rigorous information system. Avoid generic wellness luxury, intimidating pharmaceutical design, miracle language, fear-based selling and a wall of decorative trust badges.

The design should answer: What is this brand? What does it sell? How do these products differ? What information can I inspect? What does the evidence establish? Who is accountable? What happens when I order or need help?

The larger project contains commerce and operational requirements. They explain the journeys and interface states. They do not authorize backend or integration work in this assignment.

## Source of truth and current state

The attached context archive is a fresh local snapshot of `design/concepts` at `cf8376f` (19 October handoff), repository https://github.com/dharmikjinjala2486/Body-Cafe-Co-Website . This supersedes the previous conversation baseline `fd0a167`. Start from the attached source, or verify a fresh checkout matches it; do not overwrite newer routing or static-preview work with an older copy. The archive is reference material and source, not a request to execute arbitrary scripts in it.

Read this brief first, then README.md, CLAUDE-SYNC.md, IMPLEMENTATION-STATUS.md, Website-Final-Plan.md, Website-Research-and-Plan.md, Homepage-Trust-Research-and-Plan.md, PDP-THEMES.md, DIRECTION-D-STILL-LIFE.md, NETLIFY.md and the QA documents. Read the original requirements decks, including notes/comments, for background. Historical documents may describe superseded designs; the present brief governs this assignment. Distinguish confirmed facts, provisional requirements and demo data.

Current frontend: browser JavaScript/CSS, no framework or package installation required. `web/app.js` handles routes, shared chrome, preview interactions and most page templates. `web/homepage.js` and `.css` hold shared homepage content and differentiated treatments. `web/direction-d.js` and `.css` implement current D. `web/pdp.js`, `.css` and `pdp-a/b/c/d.css` implement four product-page compositions. A/B homepages are currently standalone under `concepts/`; C/D live in `web/`. This split is an implementation detail to resolve cleanly in the frontend if needed, not a reason to leave routes unthemed.

The Python/SQLite preview is localhost only. A Netlify static design export now exists through `deploy/build_netlify.py` and `deploy/hosted-preview.js`. It seeds public demo catalogue data, supports browsing and a sample bag, and blocks real ordering, identity and support submissions. Retain these boundaries. For blocked transactional routes, provide an explicit, navigable, theme-matched **visual demonstration with isolated synthetic fixtures**, if needed to review the design. It must never imply a real order, payment, message or saved account record exists. Preserve existing availability messaging; do not quietly turn disabled services into fake successes. Do not collect personal information on the static export.

## Brand and assets

Use the real supplied logo, typography, colors and seven bottle assets. Ivory bottles and individual cap colors are the visual foundation. Preserve the physical product, logo proportions, clear space and label identity. Aileron is the reading family; Lemon Milk is the logo family and useful for selected short display text. Explore hierarchy, scale, weight and spacing without gratuitous font additions. Check the brand guide and color references supplied in the archive.

- `web/media/`: transparent product WebPs and cropped logo SVGs.
- `web/fonts/`: locally hosted WOFF2 font files already used by the prototype.
- `concepts/media/`: product imagery for A/B.
- `assets/products/mockups/`: all seven original front mockup PNGs.
- `assets/brand/`: logos, guideline PDF, color references and original typography.
- `docs/requirements/`: both original requirements decks.
- `reference-screenshots/`: curated captures of existing homepages and PDPs; these are historical implementation references, not a fresh audit or a quality ceiling.

Large Blender sources and the duplicate original image ZIP are excluded from this handoff because they are unnecessary for frontend design. No database, customer records, credentials, internal runtime state or unrelated chat captures are included. Do not seek SharePoint access. Use supplied assets now; record original photography needs without blocking design completion.

The seven products are exactly:

1. Iron Bisglycinate
2. L-Theanine
3. Vitamin D3 + K2
4. Omega-3 Fish Oil
5. Myo & D-Chiro Inositol
6. Creatine Chews
7. Psyllium Husk

Confirmed detail: Vitamin D3 + K2 includes Omega-3 as triglycerides. Amounts are not approved. Preserve Creatine Chews naming; older render wording is not the authoritative product record. Product render text, sample catalogue fields and competitor claims do not establish approved facts.

## Four visual worlds

Use the current names as coherent anchors, then elevate each into a complete design system. You have creative room to improve layouts, content sequence, navigation and interactions while preserving accurate facts and useful journeys.

| Direction | Character | Carry through every page |
|---|---|---|
| A — Warm editorial | Quiet confidence, warm ivory, olive, strong product photography, generous typography, editorial pacing | Magazine-like shop and story, considered reading layouts, annotated evidence, calm form and service compositions. It should feel composed and human. |
| B — Expressive everyday | Bold cap colors, expressive scale, controlled playfulness, arches or unexpected graphic framing | Inventive product browsing, colorful but readable educational layouts, memorable report/support patterns, disciplined purchase and account surfaces. Avoid using the same bento grid everywhere. |
| C — Pick a cap | The brand's café world, caps as meaningful navigation, menu and counter cues, Lemon Milk accents | Product menu, readable ingredient/standards menus, café-like editorial navigation and service touchpoints. Extend the idea without decorating every control as a receipt. |
| D — Still life | Premium product object, porcelain, light and shadow, restrained cap accents, precise index and label-inspired detail | Gallery-like collections, a distinctive brand essay, indexed learning, structured report documentation and quiet, precise commerce. This is the new D, not the superseded Morning counter. |

Distinctiveness must survive a grayscale screenshot and the removal of the design selector: composition, density, typography, rhythm, imagery framing, navigation details and content treatment should identify the variant. Do not merely reskin one DOM layout. Share accurate content/data and appropriate behavior, but create different page compositions where it matters. Within one variant, headers, footer, controls, article treatment, cards, empty states and mobile navigation must feel like the same brand world.

Preserve and elevate the four existing homepages and 28 product/theme combinations. Every ordinary link must keep the chosen direction. The selector should change direction on the same route/entity/query where an equivalent exists, rather than throwing the visitor back to a homepage. Preserve product IDs, report product/lot context, search terms, anchors and browser back/forward/reload behavior. Explicit shareable design URLs must work in a fresh tab. Fix A/B's return to the shared design as part of the frontend scope.

## Complete page and content coverage

Build a route × variant matrix before implementation and complete every cell. All seven products, three guides, seven ingredient notes and each listed policy are real coverage, not one sample standing in for the rest.

| Page family and actual routes | Content and design expected in every direction |
|---|---|
| Home `/` and existing A/B concept entry paths | Clear supplement introduction, seven-product discovery, approachable evidence, report explanation, honest customer-experience status, brand introduction, useful reading and service information. Remove repetition; give each section a purpose. |
| Shop `/shop` | Distinct collection composition, all seven products, useful format filters, selection guidance without diagnosis, readable product identity and demo facts, clear detail/purchase paths; filtered/no-match states. |
| Products `/products/:id` for seven IDs | Refine the existing four PDP systems; accurate imagery, readable buying facts, formula/label structure, directions/cautions approval gaps, evidence, service, genuine-review empty state, helpful FAQs, related guides and products. No fake extra gallery angles. |
| Bundles `/bundles`, `/bundles/:id` | Design listing and detail separately, show constituent products and itemized illustrative totals, keep approval/demo status visible. No arbitrary health regimen or invented savings. |
| Search `/search` | Search suggestions based on the actual catalogue, meaningful result hierarchy, query/result count, product/ingredient context and useful no-results recovery. Preserve queries across themes. |
| Standards `/standards` | A substantive explanation of label information, ingredient identity, lot linkage, testing scope and how to read evidence; separate what is planned from what is documented now. Clear report/product/learning links. |
| Story `/story` | A polished brand narrative about clarity, everyday curiosity and the intended customer experience, written as positioning. No invented founder biography, origin date, facilities, personal anecdote or credentials. Provide designed slots for real founder content without pretending stock people are the team. |
| Learning hub `/learn` | An editorial destination, not three bare links: clear introductions, topic navigation, all three guides and seven ingredient-note destinations with useful summaries. |
| Guide articles `/learn/reading-a-label`, `/learn/understanding-reports`, `/learn/ingredient-forms` | Complete, useful articles with opening summaries, clear sections, practical reading/comparison checklists, terminology, examples clearly marked illustrative, related reading and relevant product/report links. Avoid thin two-paragraph filler. Cite reliable primary sources for new substantive technical claims you independently verify. Do not invent an author/reviewer or review date. |
| Ingredient notes `/learn/:product-id` for all seven | Explain what details a shopper should check for this specific ingredient/form, distinguish compound/active quantities where applicable, connect to approved-label gaps and the actual product. Educational information must not become personalized advice or unapproved product benefits. |
| Evidence `/reports?product=:id` | Product-plus-lot input, clear lot-location guidance status, report summary/document hierarchy, what results mean and their limits. Design initial/loading/demo match/no match/unpublished/withdrawn/outage states. Never invent a lab PDF, lab name, certification, passing result or unit-authentication guarantee. |
| Bag `/cart` | Empty and populated compositions, readable quantities and subtotal/discount/delivery/total, clear demo labels and next steps, removal/update/error states and related service links. |
| Checkout `/checkout` | Theme-matched, clear guest contact/address/order summary, optional fields and honest cost/consent messaging; field errors, unavailable service and reviewable synthetic visual state. Preserve existing handlers and validation; no new integration or policy decision. |
| Payment `/payment/:id` | Explicit preview payment pending/failed/retry/success/expired/unavailable visual states and recovery wording. No real payment setup. |
| Order `/orders/:id` | Confirmation and order detail, line items, status/timeline, address display using synthetic data in fixtures, tracking/support/cancellation/refund status and reorder affordances. No real customer data. |
| Account `/account`, `/account/addresses`, `/account/cases` | Sign-in/OTP preview, orders and empty history, saved-address list/forms and case list/details as supported. Give the account surfaces the variant's design. Preserve current identity behavior; additional states may be visual fixtures only. |
| Help `/help`, Contact `/contact` | Useful topic hierarchy, strong FAQs, a clear path to product/order/report help, form context, validation, submission/unavailable states and sensible privacy microcopy. Do not invent support numbers, response SLA, opening hours or claim a message was sent. |
| Policies `/policies/shipping`, `/policies/returns`, `/policies/cancellation`, `/policies/privacy`, `/policies/terms` | Readable policy templates, sections, navigation, plain-language draft summaries and links to help. Preserve approved/draft distinctions and unresolved terms. Do not write fabricated finalized legal commitments. |
| Preferences `/settings` | Legible consent/preferences hierarchy, clear descriptions and theme-matched controls with the existing behavior. |
| Global states | Four coherent headers/footers/mobile menus, selector, breadcrumbs, focus/error/toast styles, not-found/loading/empty/unavailable states; product unavailable/out-of-stock where relevant. |

Internal `/ops` routes remain functional reference context and are outside this customer-website design assignment. Preserve them; do not redesign their workflows or implement operations. A shared global-style change must not damage them. If a necessary visual adjustment touches them, document it as compatibility only.

## Content standard: do the writing too

Write strong content for every customer page: headings, opening copy, explanations, sections, FAQs, useful links, form labels, hints, success/error/empty/unavailable states. Do not leave generic lorem ipsum, repetitive slogans, vague “science-backed” paragraphs or an entire site of “coming soon” panels. Facts may remain shared across variants; adapt voice, organization, headline treatment and page storytelling to the direction without changing truth.

For missing approved facts, write all useful surrounding content and place a concise, precise status beside the missing field. Keep an approval ledger outside the primary reading flow. A missing founder biography must not stop a compelling brand-positioning page; a missing lab report must not stop a useful explanation of what a report should identify. Conversely, beautiful presentation must never make invented details look verified.

Do not invent doses, ratios, pack counts, benefits, medical suitability, reviews/stars/sales, before-and-after results, certifications, endorsements, ingredient sources, team identities, free shipping, delivery dates or guarantees. Do not infer these from front render text. Keep sample prices/sample records explicitly illustrative. Do not suggest taking all seven or prescribe combinations. Do not claim the whole range is vegan when fish oil is present.

Founder/team photos, original product-in-hand/rear-label photography, approved records, real reports, service contacts and final terms remain missing inputs. Use honest visual placeholders for these only where necessary and document the exact requested assets. Never represent generated people as real customers/founders.

Unresolved business rules include COD ₹150 advance versus fee plus courier charge; final delivery/returns/cancellation wording; rewards/referrals; approved bundles; launch sequencing; production identity and services. Retain Q28/Q44/Q46/Q47/Q48/Q49 as provisional background. Do not resolve any of these by writing confident marketing copy. Do not adopt the historical seven-day return proposal as a final policy.

## References — study principles, create original work

The full historical research, exact observations and additional links are in the two research plans. Those observations were recorded on 16 October and are not a claim of a fresh audit today. Study references where useful and distinguish current live pages from historical Awwwards entries. Borrow principles, never competitor facts, text, claims or an identifiable whole layout.

- Ritual: https://ritual.com/ , https://ritual.com/pages/ingredient-sourcing , https://ritual.com/pages/our-standards — legible ingredient transparency and evidence hierarchy.
- Seed: https://seed.com/ , https://seed.com/daily-synbiotic — product presentation, progressive scientific detail and education.
- Momentous: https://www.livemomentous.com/products/creatine-monohydrate-chews — clear format/product facts, without borrowing their formula.
- OLIPOP: https://drinkolipop.com/ — distinct product colors and cohesive range browsing.
- The Whole Truth: https://thewholetruthfoods.com/ — direct transparency and Indian consumer context.
- Wellbeing Nutrition: https://wellbeingnutrition.com/ — local supplement navigation and education.
- Jones Road: https://www.jonesroadbeauty.com/ — photography, categories and kits.
- Huel: https://uk.huel.com/ — product-format discovery and separate science depth.
- AG1: https://drinkag1.com/ ; Thorne: https://www.thorne.com/ ; IM8: https://im8health.com/ — study how information and purchase reassurance are organized; no imported endorsements or claims.
- Nutrabay: https://nutrabay.com/ ; What's Up Wellness: https://www.whatsupwellness.in/ — local commerce clarity and readable product cards.
- Feel: https://wearefeel.com/ ; Heights: https://www.heights.com/ — distinguish experience, educational expertise and evidence.
- Awwwards ecommerce: https://www.awwwards.com/websites/e-commerce/ — craft, typography, art direction and interaction.
- SPYLT historical entry: https://www.awwwards.com/sites/spylt-milk ; Moringa Vinga: https://www.awwwards.com/sites/moringa-vinga — historical visual references, not claims about their current storefronts.
- Digitron navigation: https://www.awwwards.com/inspiration/easy-search-and-navigation-digitron-3d-immersive-site — retain discoverable navigation in expressive work.
- D's earlier design study referenced Yamê, YAMA MATCHA, NOMOS Glashütte shop and Capsules® for precise grids, lit objects, typographic indexes and material restraint. Treat these as historical named references; verify sources before claiming current observations.
- Research/UX reference links: https://baymard.com/research-articles/ecommerce-homepage-ux , https://baymard.com/research-articles/user-ratings-distribution-summary , https://baymard.com/research-articles/respond-to-negative-user-reviews , https://www.nngroup.com/articles/trustworthy-design/ .
- Accessibility/performance design targets: https://www.w3.org/WAI/WCAG22/quickref/ , https://web.dev/articles/vitals .
- Content-review background links retained in the historical research: https://www.fssai.gov.in/upload/uploadfiles/files/Compendium_Advertising_Claims_Regulations_14_12_2022.pdf and https://www.ascionline.in/the-asci-code-guidelines/ . These are context, not a completed or current legal assessment. Verify current primary material if new regulatory wording becomes necessary; legal drafting is not the task.

## Interaction and visual quality

Design first for small screens, then deliberately compose tablet and desktop. Check 320, 390, 768, 1100 and 1440px. A mobile page must feel designed, not a desktop pile of shrunken cards. Ensure clear headings, comfortable line lengths, readable copy, robust contrast across every cap color, generous touch targets, visible keyboard focus and useful semantic structure.

Motion should improve orientation and product understanding. Use touch/keyboard-accessible interactions, user-controlled product switching and reduced-motion alternatives. Keep ordinary scrolling. Essential content cannot depend on hover or animation completion. Avoid preloaders, involuntary bottle cycling, scroll hijacking and decorative 3D that blocks purchase/report access. Typography and color restraint matter as much as animation.

Aim for WCAG 2.2 AA as a design target; report actual checks without claiming certification. Prioritize image sizing, local fonts and stable layouts; do not claim field performance scores from a prototype. Reuse optimized assets, keep external resources/dependencies out unless necessary and explicitly justified.

## Deliverables and acceptance

1. A complete runnable frontend design prototype with all four variants across all customer routes, not just images or a plan. Keep current API/data/commerce/permission contracts intact. Frontend modules and presentation refactors are allowed; backend/schema/integration changes are not.
2. A concise explanation of each direction and its visual grammar, plus a route × A/B/C/D completion matrix with exact routes, state coverage and any genuine limits. No quietly unthemed pages.
3. A content document/ledger covering new and revised page copy, source of factual statements, sample versus approved fields, and precise missing approvals/assets. Deliver useful page text, not only instructions for someone else to write it.
4. A review gallery showing desktop and mobile for each direction across home, shop, PDP, standards, story, learning hub/article, reports, cart, checkout visualization and help/contact, plus representative account/policy states. A comparison contact sheet should make non-homepage differences obvious.
5. A ZIP with only new/changed source files at repository-relative paths, integration notes naming baseline `cf8376f`, and screenshots. Include a patch if useful. Keep runtime records, databases, secrets, generated build output and unrelated files out. Do not push or deploy.
6. Verify responsive layouts, missing assets, console errors, keyboard controls, selector persistence on the same route, fresh-tab links, browser back/forward/reload, all seven products, filters/search, report states and relevant existing cart/checkout preview interactions. Verify the static build still exposes the designs honestly. Record exactly what passed, what was not checked and any remaining design limitation. Existing backend regression checks may be run unchanged to catch frontend-contract regressions; do not expand into backend work.

Completion means a visitor can move through an entire coherent A, B, C or D website with excellent content and distinctly designed inner pages. If execution has to span messages, keep a coverage checklist and continue through the whole scope; do not call the assignment finished after the homepage or a few representative routes.
