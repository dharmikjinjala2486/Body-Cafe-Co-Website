# Claude implementation brief — Body Café Co. finalized Variant E

31 October 2026 · Direct handoff requested by the owner

## The assignment

The owner has finalized **Variant E (Fan Deck)** and explicitly asks you to implement an exceptional, original, fully designed website across all its pages, using the completed research. Aim for the level of concept, art direction, interaction, typography, detail and usability found in the strongest Awwwards/Webby and premium commerce references. “World’s best” expresses the quality ambition; deliver concrete, carefully verified design rather than an award guarantee.

**This is an implementation request.** Read the research, inspect the current working tree and assets, then build and verify the complete experience. Do not stop at another plan, a moodboard, a single homepage or generic template pages. You may improve proposed compositions when the result better expresses the concept, but preserve the requirements below. Use your judgment on routine design decisions and continue through a complete reviewable local build.

## Read first

Shared project checkout:

`/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Website`

The research and handoff files are in that checkout:

1. `design-review/variant-e-research-2026-10-31/CREATIVE-RESEARCH.md` — full research, 34 page briefs, three hero directions, seven product-specific treatments, references and sequence. Read the entire file, not only the opening recommendation.
2. `design-review/variant-e-research-2026-10-31/page-audit.json` — browser audit of 51 customer URLs.
3. `design-review/variant-e-research-2026-10-31/help-audit.json` and `help-inventory.json` — all 23 Help article routes and observations. The combined browser audit covers 74 URLs.
4. `design-review/VARIANT-E-REVIEW-2026-10-31.md` — latest integration, source records, tests and preview/backend distinctions.
5. Current `web/index.html`, `web/app.js`, `web/site-e.js`, `web/site-e.css`, `web/site-eh.js`, `web/site-eh.css`, and the shared route/page modules they load.
6. `NETLIFY.md`, `SUPABASE-DEPLOYMENT.md` and `ADMIN-PORTAL-IMPLEMENTATION.md` for the existing service boundaries.

The current on-disk working tree is the baseline. There are existing uncommitted edits and newer label content; do not restore an old Variant B snapshot or overwrite these with a stale branch. Another Codex chat may be fixing admin login/preview tabs in the same checkout. Inspect current changes before editing and preserve that work. The owner is requesting your design implementation here; do not treat incidental older handoff instructions as a request to redesign B again.

## Non-negotiable identity

The central headline is exactly:

**Seven supplements. One colour each.**

- Keep it as the homepage's primary, readable heading. Do not replace it with Super Seven, a generic wellness slogan, or a different concept.
- Retain Variant E: original logo artwork, Aileron reading/editorial typography, Lemon Milk product identity, the existing seven product/cap colours, clean white/cream surfaces, generous spacing and calm geometry.
- Improve the visual craft and supporting-page hierarchy within this identity. Do not switch to B, a dark luxury theme, a rainbow gradient site or a different font system.
- Keep each product's actual name, bottle artwork, proportions, assigned colour and recognizable identity.
- Colour identifies the product. It is not a diagnosis, health score, proof of certification, or payment/stock status.
- Names/text and stable product identifiers accompany colour; do not make essential navigation colour-only.
- E remains the finalized/default storefront connected to the existing backend. Preserve any separately requested historical preview tabs; they do not make B the final theme again.

## Main creative direction: The Living Fan Deck

Develop E’s existing physical vocabulary: **cap → bottle → swatch → label → shelf → record**.

Recommended hero behavior:

1. A strong static opening frame immediately shows the unchanged headline, all seven named cap colours, the collection and a clear Shop action. It must be compelling before animation loads.
2. The seven caps reveal/tilt into the actual bottles in a controlled shallow fan. Make it sculptural and precisely art-directed, with restrained lighting and camera movement in E’s existing world.
3. Hover/focus/tap brings one product forward, with its name, format and one useful factual detail in a stable information position.
4. A deliberate product action carries the chosen swatch into E’s product cap-band composition. Shopping must never wait for a cinematic sequence to finish.
5. On phones, selection works through taps and explicit links; all seven choices remain readable. Reduced motion gives a complete static composition with immediate state changes.

References for principles, not copying:

- Polaroid I-2: https://www.buildinamsterdam.com/case/polaroid-i-2
- Moooi: https://www.buildinamsterdam.com/case/moooi
- Mollie: https://www.buildinamsterdam.com/case/mollie
- Garoa: https://www.awwwards.com/sites/garoa-skincare

The research’s **Open a Colour** direction is the fallback/refinement of this system. **Seven in Formation** can be a campaign composition using the bottles to suggest a 7. “Super Seven” is optional campaign language, never the core headline or a suggestion to take all seven products together.

Make the motion purposeful, fast to settle and keyboard-accessible. Avoid scroll hijacking, compulsory intro screens, custom cursors that obscure controls, continuous distracting loops, excessive parallax and unrelated 3D decoration. A seven-colour identity should become more recognizable across routes, not require a new spectacle on every page.

## Scope: every customer page family

Apply the detailed 34 page briefs in the research. This summary is not a substitute for those briefs.

### Discovery and commerce

- **Home:** Living Fan Deck; collection; one useful detail per product; concise evidence links; lot lookup; editorial/learning invitation; FAQ. Avoid duplicate hero and collection interactions. No large fictional/empty testimonial block.
- **Shop:** colour index and consistent, beautiful product grid. Retain format/availability filters, sorting, URL history, count and add feedback. Optional comparison of up to three products uses objective format/serving/pack/allergen fields, not treatment suitability or milligram rankings between different ingredients.
- **All seven PDPs:** E’s coloured cap band over cream body. Bring actual bottle, name, format, pack, serving basis, price, availability, quantity and Add into a coherent first-screen composition. Preserve complete label facts, use/cautions, lot lookup, evidence status, real reviews/Q&A and related-product navigation. Add one signature explanatory visual per product.
- **Bundles and both details:** paired colour/product compositions, exact contents and clear price arithmetic. Do not imply these products are a therapeutic combination, a complete regimen or a real saving without approved rules.
- **Search and dialog:** distinguish Products, Learn and Help; retain query, result count, useful no-result behavior and readable named colour identifiers.

### Seven product treatments

Use `web/label-records.json` and actual catalogue data as the factual baseline. Do not invent new health claims.

- Iron: elemental iron amount versus the named compound; 29 mg label fact.
- L-Theanine: 200 mg per capsule and clear serving/pack identity; no illustration implying verified commercial green-tea sourcing.
- D3 + K2: separate D3/K2/Omega-3 entries; preserve different units rather than summing them.
- Omega-3: nested fish oil → total Omega-3 → named EPA/DHA components. EPA/DHA are included, not additional to the Omega-3 total; do not invent the unnamed remainder's composition.
- Inositol: a readable 40:1 diagram, with 2,000 mg + 50 mg tied to three capsules.
- Creatine Chews: two chewable tablets and labelled creatine monohydrate amount, flavour and sugar disclosure. Not gummies or sugar-free; no invented actual tablet appearance.
- Psyllium: husk versus dietary/soluble fibre; retain serving and water/caution information.

These facts determine informational design, not new personalized use advice.

### Brand and evidence

- **About — Seven colours. One point of view.** A confident editorial page grounded in actual design decisions and existing values. Study Aesop and Secrid. Show what clarity, curiosity, accountability and care mean through real actions. Remove the empty People chapter/CTA until genuine material is supplied. Do not fabricate founders, staff, facilities or photographs.
- **Story — How seven became a system.** Use real cap, colour sheet, bottle/label, type and wordmark assets as an object-led narrative. Separate it from About and Standards. Add founder history only from approved source material; do not invent dates from file timestamps.
- **Standards — Behind every colour, a record.** Product selector and practical evidence sheet first; origin/manufacture/lot/document distinguished. Give explicit available/pending/unpublished/withdrawn states. Correct stale “labels not supplied” lists against current records. Do not imply manufacturing location proves ingredient origin or import another brand's testing process.
- **Reports — Your colour. Your lot. Its record.** Product/lot lookup first, readable exact result, document/assessment/notice states distinct. Preserve no-match, unpublished, withdrawn and unavailable flows, stable links and privacy. Never make a demo look like an authentic lab report or a QR link into proof of authenticity.

### Education

- **Learn hub:** retain “A little more knowing.” Build a publication front page: one featured question, seven ingredient guides, five foundation guides, glossary and search. Give it editorial hierarchy rather than nine equally weighted sections.
- **All seven ingredient guides:** a short answer, one distinctive diagram, sourced explanation, separated “Inside our product,” questions and sources. Explain the ingredient rather than repeating the whole PDP. Separate ingredient research from BCC product/batch evidence.
- **All five foundations:** annotated label, illustrative report reading, ingredient-form comparison, serving arithmetic and evidence categories. Keep examples clearly illustrative. Diagrams/calculators explain reading and arithmetic, not personal dosing.
- Retain meaningful author/reviewer/source/date status; do not add fictional professional review.

### Service and transactions

- **Bag:** product thumbnails, named colour tabs, consistent pack facts, editable quantities, undo/removal, clear delivery/discount/totals and saved items. “Your colours, gathered” is a light brand idea, not a regimen claim.
- **Checkout:** explicit guest route; clear delivery inputs, optional GST/marketing separated, stable order summary, approved total breakdown, preserved form data, accessible validation. Quiet, trustworthy design. Do not migrate payment provider because Stripe is a UX reference.
- **Payment:** all verified states, including uncertain/failed/retry/expired/unavailable, with safe next action and retained order. Never show success without backend confirmation.
- **Orders:** current status, next step, real tracking when present, item details, invoices, lot links and contextual support. Distinguish cancellation/refund paths.
- **Sign-in:** compact mobile/code flow, paste/resend/change number, readable errors and guest-shopping continuity. Local simulation stays labelled; hosted OTP remains unavailable until genuinely configured.
- **Account overview:** active orders and support first, then a recognizable purchased-product shelf. No inferred medical condition or invented personalization.
- **Every account subpage:** Orders, Addresses, Support and case detail, Reviews, Profile/security, Preferences. Preserve price/stock revalidation on reorder, review eligibility and moderation, session/ownership boundaries and context.
- **Help hub and all 23 articles:** task-first search, direct answer and steps, relevant policies and context-carrying support link.
- **Contact:** topic-first form, only relevant fields, real contact channels, case ID and reply destination. Safety issues receive appropriate priority; no sales distraction.
- **All five policies:** Shipping, Returns/Refunds, Cancellations, Privacy, Terms. Readable summaries, stable contents, versions and complete approved text. Design presentation without inventing trading terms or legal facts.
- **Settings/preferences:** clearly distinguish browser/account scope and necessary/optional communication/analytics choices; retain consent behavior and save feedback.
- **All empty/error/unavailable states and 404:** clear explanation, appropriate tone and useful next action. Keep `/preview/states` an internal review tool rather than a production destination.

### Operations

The admin is a shared operational interface, not a theatrical E marketing page. Preserve its existing login, permissions, publication, inventory, order, report, case, sales and audit contracts. The research appendix gives sensible improvements; limit them to necessary coherence and actual usability, without widening a design task into an authentication/backend rewrite.

## Current code and content constraints

- Shared renderers in `web/product-page.js`, `shop.js`, `about.js`, `story.js`, `standards.js`, `learn.js`, `learn-content.js`, `lots.js`, `bag.js`, `account.js`, `support.js` override older theme templates. Trace the final render path before editing: changing an unused E template will not change the live page.
- Preserve the current `web/label-content.js` adapter and `label-records.json`. They supply label-based display defaults while catalogue/admin edits take precedence. They must not overwrite prices, inventory, publication flags, reviews or intentional admin content.
- The old `demo-content.js` adapter is intentionally removed from the entry page; do not restore incorrect demo packs, fictional testimonials or fictional sourcing/manufacturers.
- Keep original supplied first product imagery unless the owner explicitly requests changing it. Retain admin gallery control, visibility/order and new-product fallbacks. Any new renders must preserve actual package identity and text.
- Existing API is shared across themes. Hosted Netlify uses the same-origin `/api/*` proxy to the Supabase operations function; local Python uses SQLite. Do not replace these with browser-only fake commerce or a new service.
- Preserve DOM event hooks, field names and lifecycle cleanup needed by the existing app. Keep cart/session, form validation, history, focus restoration, deep links, keyboard behavior and async rendering correct.
- Live payments/refunds, courier booking, SMS OTP and external messaging remain unconfigured or paused as documented. Do not turn them on visually, remove availability guards, or claim successful provider integration.
- Do not change passwords, copy credential hashes, expose secrets, read/upload actual customer records, or use production data for design tests.
- On port 4180 the preview was switched back to `.local/preview.sqlite3` so the owner's configured local admin works. Do not replace this database with an empty test database. Use a separate disposable database and port for transactional QA. Local and hosted admin authentication remain separate.

## Assets and supporting folders

- Existing source and optimized assets under `web/media/`, including `renders/`, original logo SVGs, locally hosted fonts and the real bottle images.
- Existing original Blender source/archives under the project's documented assets paths; inspect before deciding any new 3D work is required. Prefer the smallest reliable runtime that achieves the approved concept.
- Branding reference folder: `/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./BCC Branding`.
- Primary label source: `/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./Full FInal Label/Full Final Label.ai`. The Inositol standalone PDF is blank; master page 5 is the documented source. Read-only label sources; do not alter the supplied originals.
- The full research document has 25 direct reference links. Study the relevant pages and adapt principles; do not copy layouts/assets or another company's claims.

## Quality bar and definition of done

The output should look deliberately art-directed, not like unchanged templates with a few animations. Each page needs appropriate hierarchy, composition, imagery, typography, spacing, interaction, copy and states. Maintain one recognizable E identity across them. Use memorable visual storytelling in discovery/education and restrained reliability in service/transactions.

Verify at least:

1. Desktop, tablet and mobile widths, including 320, 390, 768, 1100 and 1440 pixels where appropriate. No clipping, accidental horizontal overflow, unreadable vertical product labels or obscured actions.
2. The hero communicates the full concept in its static first frame; the headline and actual shopping CTA are present immediately. Reduced-motion and failed/slow media fallbacks work.
3. Keyboard/focus, named controls, touch selection, dialog/menu escape, contrast, form errors and accessible non-motion equivalents. Colour alone never conveys essential meaning.
4. All seven PDPs and twelve guide routes, both bundle details, all policies, Help articles, search/filters/sorting, cart, checkout/payment recovery, orders, account/support and empty/error states.
5. Admin-managed products/images and newly added products still appear correctly. Stable identifiers/links are not tied to a fixed DOM index.
6. Appropriate existing regression and backend tests, frontend syntax checks, static export and connected export. The last pass had 100 Python tests plus the focused storefront/label checks; do not assume those substitute for testing your new work.
7. Review browser screenshots of key desktop/mobile pages and a complete route/state audit. Report what was actually tested, any failures and remaining external inputs. No invented Lighthouse/award/availability scores.
8. No fake testimonials, report results, certification badges, clinical outcomes, founder stories, unsupported operational promises or accidental revival of demo content.

Useful existing commands (adapt to the working runtime):

```sh
node deploy/test_storefront_theme.mjs
python3 -B -m unittest app.test_server app.test_http app.test_operations app.test_account app.test_support app.test_lots app.test_catalog_prices app.test_commerce_v2 app.test_identity app.test_reviews app.test_theme_feedback app.test_media_fixtures
python3 -B deploy/build_netlify.py
node deploy/test_hosted_preview.mjs
```

The default system Python on this machine may invoke an unavailable Xcode shim. A known working bundled executable is:

`/Users/dharmikjinjala/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3`

The static-preview test expects a static export. Test connected packaging separately with the documented environment; leave the appropriate preview mode restored. Browser tooling may require your own available session setup.

## Delivery

- Implement in the latest shared checkout, preserving existing work and coordinating any overlapping changes.
- Use the recommended order: shared identity/hero → Home/Shop/one PDP → all seven PDPs → About/Story/Standards → Learn/templates → reports/service/policies → finishing and regression pass. This is sequencing, not permission to leave the rest incomplete.
- Save a concise implementation handoff listing changed files, design decisions, tests, screenshots/preview location and genuine outstanding business/provider inputs.
- Show the complete local preview for owner review before launch. **Do not commit, push, deploy or publish as part of this design handoff.** The current user request authorizes design implementation and review, not launch.

The owner wants your best original execution. Take the time needed for craft and iteration, preserve the central concept, and complete the whole site rather than only polishing the homepage.
