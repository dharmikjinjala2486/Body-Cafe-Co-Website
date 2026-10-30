# Variant B — design, content ownership and improvement audit

30 October 2026 · Research and recommendations only · No storefront or admin changes

## User correction — implementation constraint

The user subsequently confirmed: **the first image for every product is intentionally static and must remain unchanged.** This instruction overrides recommendations below to replace the first product image with admin-uploaded media. Preserve the existing first-image artwork and its role across Variant B product displays. Keep later gallery images and their metadata connected to the existing admin workflow. Any image-source refactoring must preserve this static-first behaviour, correct thumbnail/lightbox correspondence and an appropriate fallback for new products. Do not reinterpret static-first images as a defect to remove.

## Assessment and scope

Variant B has a recognisable foundation: Aileron display typography, lilac/indigo colour, cap-colour product identities, pill controls and the Expressive Everyday editorial library. The next step should make these elements behave as one coherent brand experience, with reliable published product data throughout.

Recommended creative direction: **The Curious Everyday**. Treat the collection as a cabinet of objects worth understanding. Visitors can meet a bottle, inspect its label, explore its ingredient context and find its batch record. Preserve Variant B's established identity. Use one memorable product interaction and quieter shopping/reading surfaces.

An Awwwards outcome cannot be guaranteed. This audit proposes a stronger creative and usable website; it does not claim a jury score or certification.

Evidence: inspected the live Variant B homepage and Vitamin D3 + K2 page, including desktop layout and the initial narrow viewport; traced local storefront renderers, admin form schema, hosted catalogue and publication code. This is not a complete route-by-route mobile, accessibility, performance or transactional QA pass. Current database contents and authenticated admin mutations were not audited.

## Content ownership — current implementation

Admin-managed means an existing operations workflow, not merely a field that happens to arrive in an API response. Derived means computed from records. Static means code/assets/configuration maintained through a site change. A hybrid surface combines these sources.

| Content or behaviour | Current source | What should happen during the redesign |
|---|---|---|
| Product ID, SKU, name, subtitle, price, format, category, cap colour | Admin product records; product IDs remain stable | Use published records consistently on all surfaces. |
| Product publication and drafts | Admin explicit draft/preview/publish workflow | Public pages must never expose private drafts. |
| Description and approved purpose statement | Admin product editor | Use product-specific approved copy; avoid generic fallback prose presenting itself as supplied facts. |
| Ingredients/forms, amount per serving, serving size, servings per pack | Admin product editor | Present together with units and clear unavailable states. |
| Pack size, other ingredients, shell/chew base, flavour/sweeteners, nutrition | Admin product editor | Same values in purchase panel, details, cards and FAQs. |
| Allergens, dietary suitability, manufacturer/licence details | Admin product editor | Preserve factual text and readable hierarchy. |
| Directions, preparation, age guidance, suitability, warnings, storage | Admin product editor | Keep cautions beside directions; do not generate dosage or suitability from decorative design. |
| Ingredient note, label checklist, rear-label note, ingredient checks | Admin fields plus static fallback notes/checks | Published fields should take precedence; keep pending states explicit. |
| Quality/sourcing, manufacturer, testing performed, supporting documents, certifications | Admin product fields, with static status/fallback copy | Distinguish descriptive product statements from an actual published batch document. |
| Product FAQs, reference links and related product IDs | Admin product editor, with static defaults when absent | Use selected published products; do not hardcode a seven-item assumption. |
| Product SEO title and description | Admin product editor; applied in client rendering | Preserve fields; add crawlable route metadata and sharing previews. |
| Product photos, alt text, labels, captions, visibility and order | Admin image workflow and published gallery | Respect first/second visible image and full gallery everywhere. Current B overrides are a defect to resolve. |
| Available stock and purchase availability | Derived from eligible inventory batches; admin controls batch records/status | Display derived availability; never replace it with a visual scarcity effect. |
| Inventory, expiry, quarantine/release, receipts and corrections | Admin operations | Preserve backend rules; redesign only customer-facing availability presentation. |
| Lot reports, uploaded PDFs/images, visible sections, laboratory/date/result information, versions and withdrawal | Admin report workflow plus derived lookup states | Public evidence should use published records and visibility settings. |
| Customer reviews and photos | Customer submissions plus admin moderation; public reviews API | Separate authentic published feedback from static demonstration quotes. Hosted submission eligibility remains limited. |
| Published product questions and official answers | Customer questions plus admin replies/publication | Preserve moderation and private/public distinction. |
| Support cases, replies and order-related updates | Customer input plus admin operations | Keep customer-visible replies separate from internal notes. |
| Orders, allocated stock, payment/fulfilment state and tracking | Backend/order records plus admin actions | Present real supported states; provider integrations remain incomplete. |
| Account details, saved addresses and order history | Customer/session data and backend | These are neither static marketing copy nor an admin CMS. |
| Feature switches | Admin feature flags, server-enforced | Design disabled/unavailable states around actual capability. |
| Bundle definitions, IDs, names, descriptions and membership | Backend configuration, not an existing bundle editor; component prices/stock derive from products | Keep as configuration initially or add an explicit bundle publishing workflow. |
| Homepage headline, intro, CTA labels and section titles | Static `site-b.js` and homepage composition layers | Brand copy may remain static; campaign editing would need new CMS work. |
| Homepage product names/prices/availability | Published catalogue, with static image overrides and fixed collection copy | Resolve mixed ownership and count assumptions. |
| Hero image and featured-product destinations | Fixed artwork and product IDs in `editorial-b.js` | Editorial campaign assets can remain curated; make publication/availability and label consistency checks explicit. |
| Homepage trust statements and general FAQs | Static homepage/copy layers with demo substitutions | Replace broad permanent claims with approved copy and record-aware status where needed. |
| Homepage customer-voice carousel | Static placeholder feedback; independent of actual reviews | Use genuine published, permitted feedback or an intentional empty state. |
| Learn hub, articles, glossary, references, artwork mapping | Static `learn-content.js`, `learn.js` and editorial assets | Existing product editor does not edit these articles. Add an editorial CMS only if needed. |
| About, Story and Standards narrative/layout | Static page modules, shared catalogue objects and preview substitutions | Supply original approved narrative; no current general page editor. |
| Help topics, business contact details, service hours, legal/policy wording | Static support content and demo adapter | Confirm business-owned information; add a dedicated settings/editorial model if ongoing admin control is wanted. |
| Delivery charges, thresholds, return/refund timelines and pincode explanation | Mix of backend commerce configuration and static preview examples | One source for configured terms; delivery serviceability is not connected. |
| Search suggestions and some product-guide destinations | Static suggestions/slugs with catalogue-driven search/results | Ensure new products have valid destinations and no missing guide page. |
| Navigation/footer, logo, typography, colour tokens, borders, spacing and icons | Static code and assets | Keep presentation developer-controlled. |
| Animation, easing, transition timing, responsive layout and reduced-motion behaviour | Static CSS/JS | Keep developer-controlled; admin may choose approved media, not arbitrary effects. |
| Design selector, preview banners, design-state links, demo fixtures and noindex | Static preview/release configuration | Separate preview and production release behaviour. |

Important distinction: **support for admin editing exists, but current Variant B does not honour every field consistently.**

## Concrete findings

1. `web/bottle-assets.js:6` already prefers `BCCCatalogImages`, populated from published gallery records in `web/app.js:1211`. However, `web/editorial-b.js:42` replaces homepage collection/cabinet images with fixed normalised SVGs; `web/editorial-b.js:71` similarly replaces the first product-gallery image and thumbnail. This can disagree with the admin image order/caption and the enlargement gallery.
2. `web/shop.js:160` directly chooses a fixed SVG path for B, and `web/product-page.js:280` does the same for related products. New admin-created product IDs may have no corresponding fixed SVG.
3. `web/editorial-b.js:121` constructs a fixed seven-product About lineup, while hero images/links and bundle artwork also refer to particular supplied products. These are campaign compositions, not automatically updated catalogue views.
4. `web/app.js` refreshes format mappings from catalogue data. Format is therefore partially dynamic, even though the initial defaults are hardcoded. New format categories still need deliberate filtering behaviour.
5. `web/demo-content.js` supplies fixture contacts, pack quantities, origin/manufacturer entries, policy examples and phrase substitutions. Some are explicitly labelled, but the site has multiple competing sources for product and policy presentation.
6. Live Vitamin D3 + K2 shows “Demo pack: 60 softgels” near purchase and “Awaiting approved label” for pack size in Overview. That is a visible inconsistency to eliminate.
7. Homepage feedback uses named placeholder quotes and a moving carousel; PDP also includes fictional feedback. These do not establish real customer evidence.
8. Homepage copy, fixed imagery and Cabinet wording assume seven products. The hosted catalogue orders by product ID, so displayed numbering follows retrieval order rather than a dedicated editorial sort field.
9. `web/index.html` loads styles and scripts for A–H and multiple historical design layers. This is a concrete optimisation opportunity; its actual performance impact needs measurement.
10. The live customer site still presents the design switcher, an admin portal link and preview-only surfaces. They interrupt the intended brand opening and should move to preview tooling for production.
11. `web/index.html` has `noindex,nofollow`, a preview description and client-side route rendering. Production SEO needs an intentional release configuration and crawlable route content/metadata.
12. Current project configuration keeps payments/customer OTP and other provider-backed operations unavailable. A visually finished buy flow must reflect those actual capabilities until integrations are verified.

## Improvements — complete work inventory

Priority: P0 = correctness/foundation; P1 = main experience; P2 = refinement. These are proposed changes, not completed fixes.

| Priority | Area | Improvement | Source/ownership |
|---|---|---|---|
| P0 | Product consistency | Shared published product/media resolver for homepage, shop, gallery, related items, bag, search and About product views. | Admin data + static presentation |
| P0 | New/unpublished products | Valid image fallback, dynamic count/order, safe featured-product fallback, working guide links; no unpublished product promotion. | Admin/config + code |
| P0 | Preview fixtures | Isolate demonstration mode; remove placeholder feedback and unsupported facts from production output. | Release code + approved business content |
| P0 | Product facts | Resolve conflicting pack/serving/directions copy; use explicit factual pending states. | Admin |
| P0 | Evidence | Derive report availability from published records instead of blanket “no documents connected” marketing text. | Reports API + static explanation |
| P0 | Commerce | Align button labels, notices and success states with configured ordering/sign-in/service capabilities. | Backend + code |
| P1 | Creative concept | Extend the Curiosity Cabinet into a consistent product → label → ingredient → report journey. | Static design |
| P1 | Hero | Integrate headline and product scene with controlled depth, better shared baseline and one dominant shopping action. | Static campaign design; featured products validated |
| P1 | First viewport | Keep a meaningful product view and useful action visible on compact screens; reduce opening chrome. | Static responsive design |
| P1 | Typography | Define display, page-title, section-title, body and utility scales; tune wrapping and long product names. | Static tokens |
| P1 | Colour | Give each colour a stable role; retain cap identity without recolouring logos/labels. | Static tokens + admin cap colour |
| P1 | Geometry | Use arches/pills/stickers selectively; reduce repetition of thick outlines and rounded panels. | Static design |
| P1 | Page rhythm | Alternate product scenes, editorial layouts and readable information; reduce repeated introductions. | Static design/copy |
| P1 | Imagery | Consistent bottle scale, shadows, light direction, crop and floor contact; authentic readable labels. | Admin photos + static editorial assets |
| P1 | Homepage | Edit the seven-section sequence for clear progression and shorter copy; avoid repeating the whole collection without a new purpose. | Static composition + catalogue |
| P1 | Collection | Clear scan order: name, approved short description, format/pack, price, availability, action. | Admin + derived stock |
| P1 | Cabinet | Selecting a bottle changes meaningful ingredient context and a valid next step; touch/keyboard equivalent to pointer. | Catalogue + approved editorial content |
| P1 | Shop | Compact introduction, accessible filters/sort, stable card height, selection counts and useful no-results state. | Catalogue + code |
| P1 | Product page | Gallery/purchase balance, readable ingredient facts, grouped cautions, useful section navigation and unobstructed mobile buy access. | Admin + code |
| P1 | Report lookup | Show where the lot number is using approved rear-label imagery; clear document/version/withdrawal states and PDF access. | Admin reports/photos + code |
| P1 | About/Story | Give the two routes distinct purposes, or simplify navigation; publish real founder intent/process and original photography. | Business-supplied static/editorial content |
| P1 | Standards | Explain concrete practices with links to available supporting records; remove decorative repetition and unsupported reassurance. | Approved narrative + report/product data |
| P1 | Learn | Better topic hierarchy, readable article width, summaries, sources, author/review status, date and related reading. | Static editorial; optional future CMS |
| P1 | Bundles | Explain contents and total clearly; no implied combination advice; keep visuals accurate when membership changes. | Config + catalogue |
| P1 | Search | Useful instant product results, empty state, keyboard controls and destinations generated from available content. | Catalogue + editorial index |
| P1 | Bag | Clear line items, quantity feedback, stock/price-change handling and server quote. | Customer cart + backend |
| P1 | Checkout/account | Concise forms, inline errors, preserved entries, helpful unavailable/retry states and truthful order status. | Customer/backend |
| P1 | Help/policies | Confirm contact routes and terms; avoid conflicting demo timelines; keep case tracking understandable. | Business content + support backend |
| P1 | Reviews | Show only authentic moderated feedback, accurate counts and product context; preserve an attractive empty state. | Customer + admin moderation |
| P1 | Navigation | Shop, Learn, brand information, reports and care with clear priorities; visible focus and robust mobile menu. | Static structure |
| P1 | Footer | Useful link grouping, confirmed contacts, policies and brand sign-off; relocate preview controls. | Static + approved business settings |
| P1 | Performance | Ship the B customer entry separately from other variants/admin; optimise fonts, images and route loading after baseline measurement. | Build/code |
| P1 | Accessibility | Keyboard/focus, zoom/reflow, text contrast, controls, dialogs, errors and motion alternatives. | Code + image alt text |
| P1 | SEO/sharing | Canonicals, route titles/descriptions, real social previews, sitemap and accurate Product/Article/Breadcrumb data. | Admin fields + server/build output |
| P2 | Small interactions | One coherent button, card, accordion, tab, filter and toast vocabulary. | Static motion |
| P2 | Reading continuity | Restore list position, preserve filters, maintain deliberate route focus and Back behaviour. | Code |
| P2 | Editorial CMS | Optional page/campaign/settings editor, with draft preview, publication and revision controls. | New backend/admin work |
| P2 | Measurement | Define product-view → add → checkout events and report lookup/search outcomes; measure errors and real performance. | Application/backend, approved analytics setup |

## Motion specification proposal

The main event should be product discovery. Other motion should explain changes and maintain continuity. Durations below are starting design values to validate on devices, not research-derived performance guarantees.

| Moment | Proposed movement | Touch/reduced-motion behaviour |
|---|---|---|
| First entrance | Short headline/scene entrance, 400–650 ms, once; content available immediately. | Opacity-only or immediate render. |
| Hero scene | Small depth response on precise pointers; no bottle-label distortion. | Static scene with normal product links. |
| Cabinet selection | Selected bottle moves forward and ingredient panel changes, about 300–450 ms. | Tap/keyboard selection; instant content change when motion reduced. |
| Product card | Subtle image movement or admin second image on pointer/focus where useful, 150–220 ms. | No hidden information or hover-only action. |
| Add to bag | Pending → added confirmation tied to actual result; count changes once. | Announced status; no animation requirement. |
| Filters | Brief rearrangement/opacity transition without losing focus or scroll context. | Immediate update and result count. |
| Sections | Small one-time reveals below fold; text never dependent on a successful animation. | Immediately visible. |
| Navigation/dialog | Controlled open/close, 180–280 ms; focus containment/restoration where appropriate. | Immediate equivalent. |
| Product image viewing | Simple gallery slide/crossfade; preserve alt/caption/source alignment and zoom controls. | Direct image switching. |
| Report lookup | Clear loading → found/not found/unavailable state without delaying results. | Same accessible status change. |
| Route continuity | Short optional transition; preserve deep links, focus and browser history. | Normal navigation. |
| Long-lived movement | Avoid unnecessary loops; pause any retained moving content offscreen and provide control. | Stopped. |

Keep native scrolling. Do not make users wait for a loader, scroll through prolonged pinned scenes, or chase controls with a custom cursor. A WebGL hero is optional and should earn its cost after a lighter prototype establishes the idea. Do not use old bottle renders with inaccurate label text merely to add rotation.

## Proposed content model additions

Existing admin fields should remain the source for product facts. Keep typography, layout, responsive rules and motion in code.

If ongoing editing is wanted, add structured published records for: campaign title/body/CTAs; featured product IDs/order; separate desktop/mobile campaign assets and alt text; collection order; bundle definitions; editorial articles/review dates; business contacts/hours; approved policy content. This requires backend validation and publication controls, not just frontend inputs.

Avoid adding an unrestricted page builder at this stage. A small set of designed sections and validated fields will preserve visual quality and make content updates predictable.

## Build order and acceptance

1. **Correctness:** resolve data/media overrides, demo conflicts, new-product handling and publication-aware references.
2. **Creative prototype:** finalise one B hero, one collection card and the Cabinet interaction at desktop and phone sizes.
3. **Full customer journey:** apply the visual/motion system to shop, PDP, report lookup, editorial, bag, account and care routes.
4. **Release quality:** verify accessibility, loading/interaction performance, SEO, supported commerce states and approved content.

Acceptance criteria:

- Changing and publishing product name, price, format, image order and pack information updates every applicable B surface; draft changes stay private.
- Adding a product without a supplied legacy SVG or article produces working cards, images and appropriate destinations.
- Unpublishing a featured product leaves no stale shopping link or misleading campaign promotion.
- No conflicting pack sizes, invented feedback, fabricated sourcing or unlabelled fixture policy terms in production.
- Test long names, long captions, sold-out products, one/many images, missing optional facts, API failures and report withdrawal.
- Check 320/390/768/1440px layouts, keyboard-only use, reduced motion and 200% zoom; include real Safari/iOS and Android checks before launch.
- Target WCAG 2.2 AA; manual checks are necessary alongside automated checks.
- Target Core Web Vitals at the 75th percentile: LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1, separately on mobile/desktop. Lab testing guides development; field data establishes real-user performance.
- No arbitrary Awwwards readiness score or Lighthouse score claimed without measurement.

## Research and sources

The recommendations above are my synthesis of the repository audit and the reference material. Competitor statements, health claims, reviews and certifications are not transferable to Body Café Co.

- [OLIPOP storefront](https://drinkolipop.com/): clear separation of product families, individual products and variety packs. Useful for catalogue organisation; not a source of BCC product claims.
- [Seed DS-01 product page](https://seed.com/daily-synbiotic): product overview/purchase context followed by formula and supporting detail. Useful for progressive information depth, not evidence about BCC products.
- [Ritual ingredient sourcing](https://ritual.com/pages/ingredient-sourcing): a dedicated sourcing destination linked to products. Useful for making provenance discoverable when BCC records exist.
- [Google Web Vitals](https://web.dev/articles/vitals): current metrics, thresholds, 75th-percentile evaluation and lab/field distinction.
- [W3C WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/): accessibility requirements and implementation checks.
- [Awwwards evaluation page](https://www.awwwards.com/about-evaluation/) and [SPYLT entry](https://www.awwwards.com/sites/spylt-milk): direct retrieval timed out during this audit. Earlier repository research records SPYLT as a creative reference, but this audit does not present it as freshly inspected or use unverified current award details.

No code, assets, admin records or deployment were changed by this research pass.
