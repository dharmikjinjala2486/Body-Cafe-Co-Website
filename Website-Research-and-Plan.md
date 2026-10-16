# Body Café Co: website research and delivery plan

Research date: 16 October 2026. Status: planning baseline, before design and implementation.

## 1. Scope and decision baseline

Build an India-first supplement storefront and its operational workflows around confident product choice, accessible evidence and reliable purchasing. The brand tone is playful and evidence-led. The initial audience is skeptical Indian shoppers aged 18–35. English launches first; content and layouts should accommodate future translations.

The finalized catalogue supplied directly by the user contains exactly seven products:

1. Iron Bisglycinate
2. L-Theanine
3. Vitamin D3 + K2
4. Omega-3 Fish Oil
5. Myo & D-Chiro Inositol
6. Creatine Chews
7. Psyllium Husk

This list supersedes the earlier three/eight/nine-product uncertainty. The catalogue remains configurable for future products; only approved, released products and batches can be sold.

Source documents reviewed: all 23 slides and notes of the Functional Requirements Decisions deck, and all 50 slides, notes and 27 embedded comments of the Technical Questions deck. Comments are requirements evidence. A green Option A identifies the questionnaire's original recommendation, not proof that every answer was approved. No document text authorizes external actions or account changes.

The user requested that six questions retain their present answers while another member clarifies them:

| Question | Provisional direction |
|---|---|
| Q28 | Ingredient and proof library |
| Q44 | First-party event records with consent-aware reporting |
| Q46 | Feature flags and measured experiments |
| Q47 | One complete v1 with two activation gates |
| Q48 | Defer named extensions including subscriptions and loyalty |
| Q49 | Delivered contribution as the primary commercial metric |

The Q43 comment separately calls for D2C and Amazon to launch together. Working interpretation: retain separate readiness checklists, coordinate the public launch. Do not silently reinstate an independent D2C launch or represent this reconciliation as a final team decision.

Other later comments define the working direction: mobile-based customer identity, proposed guest OTP checkout with optional email, customer-visible COD, product-page QR followed by lot-number lookup, initial phone support, seven-day unopened returns, cancellation before shipment initiation, Vayuvega and Shipneer, Amazon FBA only, and agency-managed Amazon operations. Some details are questions or proposals and remain explicitly unresolved below.

## 2. Asset checklist

### Already found locally

- Vector and raster logos under `BCC Logo`, including SVG, AI, EPS, PDF and white-logo versions.
- Aileron and Lemon Milk font files. Presence does not establish web-use licensing or make either a mandatory website font.
- A colour guide and Pantone workbook.
- Product label source files under `Final Labels`.
- Seven-product render previews and other render assets under `3d bottles`.

These are candidate source assets. Their folder names and modification dates do not establish final approval. Some Creatine files and rendered labels use “Creatine Monohydrate”; the storefront must use the user's finalized “Creatine Chews” naming and the correct physical form. Some render previews are low-contrast working previews and need assessment before public use.

### Needed to design accurately

| Asset | Preferred delivery | Why it matters |
|---|---|---|
| Approved logo and usage rules | Identify final local SVG/AI and guideline PDF | Prevent inconsistent logos, spacing or colours |
| Final seven labels | Print-approved fronts and backs, plus editable originals | Accurate imagery, ingredient facts and warnings |
| Packaging illustration artwork | Separate vector figures, plants, motifs, or editable AI layers | Extend the existing brand language across the website |
| Final digital colours | Approved sRGB/HEX values | Pantone print references alone are insufficient for screen colour specifications |
| Product master | One approved record per SKU | Establish the content source for every product page |
| Product images | Original high-resolution renders or photographs | Product galleries and homepage art direction |
| Founder story | Founder names, approved story, portrait if desired | Specific and credible About page |
| Voice examples | Existing approved copy or examples to retain | Consistent playful tone without unsupported claims |

The product master should contain: exact name and SKU, formulation and actives per serving, serving size, dosage form, units or net weight, servings per pack, flavour/variants, complete ingredients, allergens, dietary marks, approved benefits, directions, warnings, storage, manufacturer/marketer details, shelf life, required label disclosures, MRP and selling price, GST/HSN inputs, dimensions and shipping weight. Supply approved values rather than deriving facts from competitor sites.

Product-specific fields that deserve particular attention:

| Product | Fields to confirm |
|---|---|
| Iron Bisglycinate | Elemental iron per serving separately from compound weight; dosage form and count |
| L-Theanine | Active amount per serving; dosage form; any substantiated caffeine/free-from statements |
| Vitamin D3 + K2 | D3 amount and units; K2 amount and form; serving and dietary source |
| Omega-3 Fish Oil | Fish-oil quantity separately from EPA and DHA quantities; source and allergen details |
| Myo & D-Chiro Inositol | Amount of each ingredient, ratio, serving size and units per pack |
| Creatine Chews | Creatine per chew and per serving, chews per pack, flavour, texture/form and full nutrition details |
| Psyllium Husk | Product form, net weight, serving amount, fibre content, directions and approved label warnings |

### Recommended visual production list

Per product, create or select six views: front pack, three-quarter pack, readable rear label, actual capsule/softgel/chew/powder, scale or hand-held view, and one everyday-use image. This is approximately 42 source visuals across seven products; reuse approved originals where suitable.

Shared assets: one seven-product lineup, two or three editorial group scenes, a founder image if available, and original illustrations extracted from packaging. Motion is optional: short product turntables or a restrained lineup transition. The first design pass can proceed with accurate still images.

Suggested handoff: transparent product exports at roughly 2000–3000 px, high-resolution photographs in sRGB, original vector illustrations, and original labels. We will make responsive AVIF/WebP delivery versions. Supply separate desktop and mobile compositions where cropping would hide the label. Do not bake essential product facts into images alone.

### Needed before production launch

- Approved reports linked to exact products and manufacturing lots; allowed public/redacted versions; manufacturer, manufacturing/expiry dates and evidence approval owner.
- Price, discounts, bundle rules, launch stock and batch-release decisions. Internal COGS and contribution inputs stay out of public copy.
- Final delivery areas, shipping charges and estimates; COD charge mechanics; courier access and contracted terms.
- Returns, replacements, cancellation and refund policies, with exact timing and shipping-cost responsibility.
- Business/legal name, approved business address, GST and relevant business/licence disclosures, support phone/email/WhatsApp, service hours and grievance/privacy contacts.
- Domain ownership and desired domain, transactional email sender, OTP provider and WhatsApp business setup.
- Razorpay access through secure configuration, Microsoft organisational identity details and approved Admin/Viewer users. Do not paste secrets into chat or store them in planning documents.
- Amazon/agency contact and clearly defined operational boundary, listing URLs/ASINs, FBA replenishment process, and any approved integration access.
- Real customer reviews only if available with permission and verification. Launch with honest empty states if none exist.

Design can begin before every launch integration is available. Production checkout and claims cannot rely on placeholder business data.

## 3. Research method and reference shortlist

Screened Awwwards material and international/Indian brand sites for fit with this brief. Reviewed current public page content for the references below and sampled Ritual and Seed visually in the browser. This is a curated qualitative design study, not a conversion-rate audit or a claim to have inspected every website worldwide. Brand claims are observed site content, not independently verified evidence for Body Café Co.

| Reference | Verified source and useful pattern | Proposed application |
|---|---|---|
| Ritual | [Ingredient sourcing](https://ritual.com/pages/ingredient-sourcing) explains ingredient sources and traceability; [standards](https://ritual.com/pages/our-standards) separates testing and sourcing | Make evidence an accessible product feature; explain what reports cover |
| Seed | [DS-01 product page](https://seed.com/daily-synbiotic) places product, purchase action, ingredients, scientific detail and testing in a progressive sequence | One strong product overview followed by expandable depth; retain readable mobile purchase access |
| Momentous | [Creatine Chews page](https://www.livemomentous.com/products/creatine-monohydrate-chews) distinguishes chew format, count, flavours, ingredients and serving quantities | Explain Body Café's actual chew clearly, including amount per chew versus serving; use only our supplied formulation |
| OLIPOP | [Storefront](https://drinkolipop.com/) separates product lines, flavours and variety packs | Give each SKU a consistent colour and make bundles understandable |
| SPYLT / Awwwards | [Awwwards entry](https://www.awwwards.com/sites/spylt-milk) records Site of the Day on 14 March 2025 and highlights product presentation, menu and interaction | Study expressive product composition and controlled transitions. Live site currently resolves to a coming-soon page, so historical recognition is separate from current functionality |
| The Whole Truth | [Storefront](https://thewholetruthfoods.com/) connects products to ingredients, manufacturing and the people behind them | Direct, understandable transparency for Indian shoppers; make our own evidence and people visible |
| Wellbeing Nutrition | [Storefront](https://wellbeingnutrition.com/) combines product discovery with sourcing and science content | Local market benchmark for supplement information architecture |
| Jones Road | [Storefront](https://www.jonesroadbeauty.com/) separates product categories and kits and makes product photography prominent | Consistent product and bundle presentation, with a clear brand story |
| Huel | [UK storefront](https://uk.huel.com/) offers goal-based and product-format discovery, with a separate science route | Allow shoppers to browse by an approved everyday goal or exact product name |
| AG1 | [Reviewed regional page](https://drinkag1.com/en-eu) connects everyday routine, ingredients and supplement facts | Show how a product fits into an everyday routine after its facts are clear |
| Spacegoods | [Storefront](https://spacegoods.com/) uses short goal labels, routines and bundles | Use concise discovery language; keep our claims and commercial model grounded in our requirements |
| Aarke | [Reviewed regional storefront](https://aarke.com/en-it) provides an adjacent premium product benchmark | Secondary reference for disciplined product naming and product-family presentation, rather than a supplement-content model |

Awwwards catalogue searches also surfaced AEVI and Telepathic Instruments. Their individual entries repeatedly timed out in the research tool, so they are not relied upon for detailed design claims. Award recognition is a discovery aid, not proof of commerce performance.

### Research conclusion

Use Ritual and Seed as the primary information and trust references, the newly supplied Bottle Mockups ZIP as the primary packaging visual source, OLIPOP as a product-family reference, SPYLT's award entry as a selective expressive-design reference, and The Whole Truth as a local clarity benchmark. Momentous is particularly relevant to the Creatine Chews format. The new minimalist mockups supersede the older illustrated previews for current visual exploration.

This is a synthesis of useful principles. Do not copy layouts, illustrations, photography, trademarked language, badges, reviews or clinical claims. The references do not change the approved scope: subscriptions, loyalty and diagnostic quizzes remain outside v1.

## 4. Recommended visual direction

Working direction, updated after the supplied mockups: a warm, contemporary storefront using ivory bottles, minimal labels, distinct coloured caps, natural shadows and precise product facts. The seven new mockups are the current visual reference. Do not carry forward illustrations from the older render previews unless the user requests them.

Use an off-white base, dark readable text, generous space, and product-specific colour fields. Let the bottle, restrained typography and photographic lighting define the identity. Retain the playful tone through copy and modest interactions rather than adding an illustration system unsupported by the newly supplied artwork.

The supplied guide assigns Iron 7599 C, L-Theanine 5763 C, D3+K2 2372 C, Omega-3 7543 C, Inositol 2572 C, Creatine 7708 C and Psyllium 2325 C. These are print colour references; final screen tokens need approved sRGB values and contrast checks. The Creatine Chews palette is provisional pending final packaging confirmation.

The reviewed eight-page brand guide specifies Aileron as the primary general brand typeface and Lemon Milk as the logo family. Use Aileron for body copy, interfaces and product facts. Preserve the supplied SVG logo rather than recreating it with live text. Explore Lemon Milk in short headings only where consistent with the guide and legible on mobile. Confirm web-use rights before production font delivery.

The guide requires logo clear space, high contrast and preserved proportions. Do not stretch, skew, rotate, recolour individual parts, add shadows/bevels, outline elements or place it on low-contrast imagery. Its print minimum-size wording and diagram differ between width and height; choose and verify a readable digital size rather than treating centimetres as a browser specification.

Product photography should preserve true label appearance, consistent camera scale, believable shadows and visible dosage form. A lineup can be editorial; product galleries must remain accurate. Hero composition: a focused arrangement of two or three products with remaining products discoverable immediately below, rather than seven tiny unreadable bottles.

Motion serves hierarchy: small hover/focus feedback, short section entrances and optional lightweight product motion. Preserve normal scrolling, keyboard control and reduced-motion preferences. Still-image fallbacks must retain all content and actions.

Proposed introductory headline for exploration only: “Know what goes into your everyday.” Final copy requires brand approval. Primary action: “Shop all 7”. Secondary action: “Find your lot report”. Avoid certification or testing promises until their supporting evidence is available.

## 5. Site structure

Public navigation: Shop, Our Standards, Learn, Our Story. Persistent utilities: Find your lot report, Search, Account and Cart. On mobile, keep product and report access easy to reach from a compact menu.

Public pages and templates:

- Homepage.
- Shop all seven, with simple approved-goal filtering and full product names.
- Seven product pages using a shared template with content and image variations.
- Bundles listing and bundle detail, only for approved combinations and offers.
- Our Standards: sourcing, testing and the meaning and limits of the evidence shown.
- Lot report lookup and individual report results, accessible from product pages and packaging QR.
- Ingredient and proof library, retained as a provisional requirement.
- Our Story.
- Help centre, contact and support case submission.
- Order lookup/tracking and customer account: orders, addresses, case history and reorder. Referral/credit surfaces follow the final reward decision.
- Cart, checkout, payment recovery and order confirmation.
- Shipping, returns/refunds, cancellation, privacy, terms and other approved business disclosures.

Search covers the seven names, approved aliases and ingredients; show useful spelling suggestions and honest no-result states. Avoid a complex mega-menu for a small catalogue.

## 6. Key page plans

### Homepage

1. Clear brand statement, accurate product image and Shop/Report actions.
2. Immediate introduction to the seven products. Display readable names, form/pack size and real prices when supplied.
3. Browse by a small set of approved everyday goals. This is a navigation aid, not a medical questionnaire or diagnosis.
4. Explain what each product contains and how customers can inspect it.
5. Demonstrate the lot-report journey with labelled illustrative data until real approved reports exist.
6. Show actual product formats and straightforward use information.
7. Introduce approved bundles with itemised contents, prices and clear savings.
8. Founder/brand story with real people and a specific reason for building the company.
9. Verified reviews when available, or useful FAQs when they are not.
10. Service information and optional, separately consented marketing sign-up.

Each section answers a distinct customer question. Avoid repeating trust slogans across several sections.

### Product page

Opening viewport: gallery, exact product name, plain-language description, approved benefits, actives per serving, form/count/flavour, price, quantity, delivery lookup, purchase action and report link. Show material COD charges before the payment decision once mechanics are settled.

The rest of the page: full ingredient and nutrition facts in HTML, reason for the selected formulation, approved directions and warnings, lot-report lookup, what testing does and does not establish, verified reviews, product-specific FAQs and at most a small number of approved complementary offers.

Mobile: name and useful product image first, followed promptly by pack facts, price and purchase controls. A compact sticky purchase control may appear after the main control scrolls away. It must not cover content, error messages or the cookie interface.

### Lot report lookup

Packaging QR opens the correct product page with the lookup section easy to find. Customers enter the printed lot number; a short guide shows where that number appears on their pack.

Result includes the exact product and lot, approved dates and manufacturer information, a readable evidence summary, and approved report files. Explain result units and test limits only from reviewed source data. Include accessible download links and document versions.

Design all states: valid match, typo/no match, report not published, multiple records requiring disambiguation, loading, unavailable service and a quarantined/recalled lot with clear customer instructions. Do not interpret a successful report lookup as proof that an individual unit is authentic. Concealed unit-code verification remains a separate unresolved requirement.

### Cart and checkout

Cart shows exact items, variants, quantities, discount rules, delivery charges and total. Complementary offers must be optional and explainable. Bundles must check component stock and release status.

Working identity flow: guest purchase with mobile OTP and optional email, pending confirmation of whether OTP is mandatory. Payment creates the timed inventory hold; adding a product to a cart does not reserve stock. Preserve a recoverable checkout after payment interruption.

COD is in the working scope, but the ₹150 requirement must distinguish an upfront partial payment from a charge collected on delivery. Display courier COD charges and refund treatment explicitly. This detail must be settled before implementing production COD payments.

Confirmation shows order ID, verified payment state, delivery expectation, tracking route, account access and support contacts. Never use a browser success screen alone as payment truth.

### Customer care

Each support case has an ID, owner, SLA, linked order and evidence history. Initial channels: WhatsApp, email, web and phone. Phone cases can be manually recorded in the unified system; a new telephony integration is not assumed.

Allow cancellation before the precisely defined shipment-initiation boundary, with server-side checks against concurrent fulfilment. After shipment, apply the approved return policy. Separate seven-day unopened returns from opened-item issue reports and safety escalation. Clarify the comment permitting product-issue returns at any point before publishing policy copy.

## 7. Operational and technical plan

Design the storefront, customer account and internal operations interface as connected experiences. The internal interface should prioritise legible records, action status and exceptions; storefront illustrations need not dominate an approval queue.

Operational domains: product/content publication, prices/offers, batches and evidence, warehouse stock and FEFO allocation, timed reservations, orders/payments/refunds, provider assignment and shipments/RTO, support/safety, reviews/rewards, approvals/audit and reporting.

Retain Microsoft SSO with MFA and Admin/Viewer roles. Enforce permissions and different-person approvals on the server. Quarantine may be immediate; release requires approval. Capture who changed what and when, including previous values and decisions.

Architecture recommendation, subject to a short integration review: a custom responsive storefront with a typed server application and transactional relational data model, backed by object storage for approved media and evidence and durable background jobs for provider events. This is an architectural recommendation, not a selected vendor stack or a completed integration.

Separate marketing content from operational records. Product claims and lot-release status need governed publication; a CMS toggle must not bypass batch sellability. Create adapters for Razorpay, OTP/email, WhatsApp, Vayuvega, Shipneer and any agreed Amazon sync. Verify current provider APIs before choosing implementation libraries or hosting.

Keep stock transitions atomic and event handlers idempotent. Record and reconcile duplicate, delayed, out-of-order and missing vendor events. Separate order, payment, fulfilment and refund states. Make external effects retryable without duplicate charges, shipments or refunds.

A generic checkout platform is an option only if it can meet the required stock reservations, batch controls, guest/mobile identity, partial-payment COD and approvals. Do a requirements-fit check before choosing custom commerce versus a hosted commerce engine. Design approval does not lock the backend vendor.

Amazon working scope is FBA-only with agency/Amazon operational ownership. Model physical FBA stock separately from D2C warehouse stock and bulk replenishment. Establish what data the website actually needs, who owns reconciliation, and whether an API sync is still required. Do not automatically build the broader seller-fulfilled scope from the earlier deck.

Analytics starts with a documented, minimal first-party event taxonomy: product discovery, report lookup, cart/checkout, payment, shipment/delivery, support, returns, review and reorder. Keep consent state with permitted exports. Do not send OTPs, customer contact details, safety narratives or report search values to general marketing analytics.

## 8. Delivery sequence and acceptance

| Stage | Deliverable | Exit condition |
|---|---|---|
| 1. Requirements and assets | Versioned seven-SKU baseline, asset manifest, provisional decisions and integration boundary | Each asset has an owner/version; unresolved items remain visible |
| 2. Creative direction | Two focused visual directions applied to a desktop/mobile hero and one product overview | Select one coherent direction using real packaging |
| 3. Experience design | Complete mobile-first purchase, report, tracking and support flows | Every critical journey has loading, empty, error and success states |
| 4. Design system | Typography, screen colours, spacing, forms, galleries, tables and reusable components | Contrast, keyboard and small-screen readability reviewed |
| 5. Complete prototype | Public templates with all seven real products and representative account/admin screens | Full journey review without presenting sample states as live commerce |
| 6. Operational implementation | Durable records, permissions, payments, inventory, shipping, support and agreed integrations | Required transaction and failure scenarios pass |
| 7. Content and release review | Approved claims/reports/policies, accessibility and performance evidence, reconciled launch checklist | Business owners sign off their data and readiness requirements |
| 8. Launch and measurement | Coordinated channel launch under the reconciled release decision | Live monitoring, rollback/recovery and ownership are in place |

Stages are construction order, not reductions in the complete v1 commitment. Do not give a reliable completion date before the remaining policy, integration and asset dependencies are known.

Verification targets:

- Actual mobile and desktop journeys, including slow networks, touch input and keyboards.
- Accessibility target: WCAG 2.2 AA, supported by manual checks as well as automated checks. See [W3C reference](https://www.w3.org/WAI/WCAG22/quickref/).
- Core Web Vitals targets at the 75th percentile: LCP no more than 2.5 seconds, INP no more than 200 ms and CLS no more than 0.1. Prelaunch lab tests are useful but cannot establish real-user field performance. See [Google guidance](https://web.dev/articles/vitals).
- Responsive media, correct dimensions, lightweight initial loading, readable image alternatives and reduced-motion support.
- Accurate indexable product content, unique titles, canonical URLs, sitemap and structured data matching real prices, stock and reviews.
- Payment/reservation expiry races, successful late payments, duplicate webhooks, failed/refunded payments and reattempts.
- No sale of unreleased, expired or quarantined stock; bundle component controls; FEFO correctness.
- Correct approval separation, Viewer denial on mutations and protected evidence publication.
- Cancellation/dispatch races, shipping failures, unavailable pincodes, RTO and stock reconciliation.
- OTP expiry/retries, mobile identity recovery and safe linkage of prior guest orders.
- Safety escalation, report withdrawal/replacement, audit history and recovery from failed background jobs.

Commercial reporting should show delivered contribution alongside repeat purchase and operational indicators. Supporting measures: product-to-cart rate, checkout completion, payment success, lot-report engagement, delivery success, RTO, returns, support resolution and reorder. Establish baselines after launch rather than inventing uplift forecasts.

## 9. Items held open

The six specified questions retain their current answers provisionally. Other questions are not automatically resolved by that instruction:

- Whether OTP is required during guest checkout and when an account is created.
- Whether the post-delivery discount replaces referral credit, its recipient and eligibility rules, and optional-email implications.
- Whether ₹150 is an upfront COD advance, a fee, or part of the total collected later; additional courier fee and refund treatment.
- Exact cancellation boundary and the reconciliation with courier booking.
- Seven-day return start point, shipping responsibility, opened-item remedies and the proposed unlimited issue window.
- Concealed unit-code need and code lifecycle.
- Public report format and evidence release checklist.
- Courier integration availability and the intended meaning of “Hardcore” in the comment.
- Amazon agency versus website responsibilities and the FBA data boundary.
- Coordinated launch versus independent readiness gates.
- Final product asset versions, especially Creatine Chews, and approved digital colours.

These do not prevent research or visual exploration. They must not become hidden production assumptions.

## 10. Codex and Claude collaboration

Keep the versioned requirements and approved assets as the common source of truth. Use bounded Claude reviews of page hierarchy, brand voice, visual direction and missing journey states; Codex can implement and verify the resulting decisions in this workspace. Record accepted decisions in the plan so the two conversations do not drift.

The browser connection is a manual coordination workflow, not automatic shared memory or file synchronization. Keep a single active implementation owner for any file. Sending ordinary website briefs to Claude is within the requested collaboration workflow; private commercial records, credentials and customer data require their own appropriate handling and must not be included by default.


## 11. Supplied asset review update

The user supplied Bottle Mockups.zip, black and white SVG/PNG logos, the eight-page logo guideline PDF, Lemon Milk and Aileron folders, Colours.jpg and BCC_Final_Varient_1_Garden_SpotUV_Corrected.blend.

Reviewed all seven ZIP images: each is 1196 × 1315 pixels, RGB PNG with a baked photographic background and no alpha channel. The set has consistent warm backgrounds and individual cap colours. All seven finalized product names are represented; the supplied Creatine image explicitly reads Creatine Chews. These are suitable visual direction sources. Transparent product cutouts and alternate angles are not present in this ZIP.

The user confirmed that the D3 + K2 descriptor “with Omega-3 as Triglycerides” is final. Retain it in the product presentation; approved quantities are still required. Do not derive ingredient quantities or certification claims from these front-only mockups. Rear-label views and approved product records remain needed for production product content.

The Blender file exists and is approximately 108 MB. Its scene, materials, camera configuration and external dependency packing have not been inspected. A file's availability does not verify that it renders the newly supplied mockups. Do not overwrite a live Blender scene simply to inspect it.

The local SVGs have square 1080 × 1080 viewBoxes; preserve the artwork and assess intrinsic margins when placing the logo. White artwork needs a contrasting background for inspection.

SharePoint access was attempted but required sign-in. The user then explicitly requested that SharePoint be abandoned and that missing information be requested directly. No SharePoint documents were read. Continue from local/user-supplied material; do not retry SharePoint unless the user requests it again.


## 12. Local handoff

All explicitly supplied assets have been copied into this Website folder and verified. See `assets/README.md` and `assets/asset-manifest.json`. Both reviewed decks are under `docs/requirements/`. The concise current delivery plan is `Website-Final-Plan.md`; this file retains the supporting research and detailed specifications.
