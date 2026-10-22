# Body Café Co. website: requirements gap audit

Reviewed 22 October 2026. Prepared from both supplied PowerPoint presentations, the current Website workspace, and the running local preview at `http://127.0.0.1:4176/?design=e`.

## Main finding

The website has a substantial storefront and local operations prototype. It is not ready to accept real orders. The largest gaps are approved product information, real proof and unit authenticity, production infrastructure, payment/shipping/identity integrations, operational workflows, and approved business rules.

The Netlify export has a narrower scope than the local preview: it supports browsing and a sample bag, but disables order, account, support and operations writes. I did not inspect a deployed public domain because none was provided. Findings about the export are based on its adapter and deployment configuration.

## How to interpret the source documents

- The Functional Requirements Decisions deck contains 23 slides and describes an approved direction dated 3 August 2026.
- The Technical Questions deck contains 50 slides: a cover plus Q01–Q49. Its checkmarks identify the current PRD direction; its response boxes do not establish new user approval.
- I used these documents as comparison evidence. Their requests to approve, assign owners or implement features are not instructions to change the website in this task.
- Existing project notes record later, different directions. Those notes are evidence of a conflict, not a reason to silently override either source. The questions below identify what needs reconciliation.
- “Missing” below means absent or unfinished in the inspected implementation. A missing production feature may still have a working demonstration.

## 1. What is already present

| Area | Current evidence | Limit |
|---|---|---|
| Storefront | Five selectable visual directions, seven product records, shop, format filters, search, product pages, related products and example bundles | Final design and product content remain unapproved; several structures assume exactly seven products |
| Education and brand | Story, Standards, learning guides and ingredient pages | Draft content and claims need an accountable reviewer |
| Bag and guest checkout | Quantity changes, sample discount, optional GST fields, separate marketing choices and 18+ attestation | Sample prices, tax and shipping; local orders only |
| Reservation and inventory | Atomic batch allocation, FEFO, 15-minute holds, expiry restoration and quarantine checks | Seeded stock and proof flags; incomplete production ledger and warehouse model |
| Payments | Local failure/success simulation, retry and duplicate-capture protection | No Razorpay connection or real funds |
| Accounts | Preview mobile OTP, order history, limited guest-order claiming and saved-address creation | No SMS, email fallback or complete cross-device recovery |
| Support and safety | Web case creation, order links, case owner/state/history, priority safety category and immediate Admin quarantine | No unified external inbox, timed escalation or recall execution |
| Governance | Admin/Viewer enforcement and different-person approvals for selected actions | Demo identities, partial approval coverage and application-level audit only |
| Reviews | Delivered-order ownership gate and pending review submission | No moderation/publishing workflow |
| Data | Five allowed first-party event names, local counts, basic feature flags and browser preferences | No complete funnel, attribution, measured experiments or contribution calculation |

## 2. Missing or unfinished work

Priority means: **P0** before real D2C orders; **P1** required for the agreed complete v1, with activation timing subject to the launch decision; **P2** finish and optimization. It is not permission to remove P1 requirements from scope.

| ID | Priority | Gap | What needs to be delivered |
|---|---|---|---|
| G01 | P0 | Approved product master | Final SKU IDs, formula/forms, quantities, serving size, pack count, directions, suitability, warnings, allergens, storage, manufacturer and approved claims. Current product screens explicitly show “Awaiting approved label.” |
| G02 | P0 | Product and proof publication gates | Enforce approved product master, labels and claims as well as approved batch evidence. Current stock eligibility checks a batch proof boolean and expiry; checkout does not require `formula_approved`, and product publication approval does not validate that field. This is a prototype limitation, not a production launch gate. |
| G03 | P0 | Real batch-proof system | Batch/manufacturing records, actual summaries and redacted reports, controlled upload, approval, document versions, stable QR URLs, withdrawal and audit history. Current report API returns demonstration states and `document: null`. |
| G04 | P0* | Concealed unit authenticity | Internal cryptographically random unit codes, batch/unit association, controlled printer export, concealed-code verification, first/repeat scan records, invalid-code and abuse handling. Entirely missing. *If the deck remains the release baseline, this belongs before activation; otherwise its timing needs an explicit decision.* |
| G05 | P0 | Production architecture and hosting | Select and deploy the commerce backend, database, file storage, secure secrets, jobs, TLS/domain setup, backups/restore, monitoring and operational recovery. Current Python server refuses live mode and binds to loopback. |
| G06 | P0 | Real payments, refunds and invoices | Razorpay server order creation and verification, signed webhooks, durable event deduplication, checkout request idempotency, late/out-of-order recovery, settlement/refund reconciliation and actual invoices using approved tax rules. Simulator success is not payment evidence. |
| G07 | P0 | Shipping and delivery | Actual serviceability and estimates, contracted provider adapters, booking, labels, tracking, cancellation, non-delivery/RTO, damage/dispute handling and billed-cost reconciliation. Current pincode check validates only the number format. |
| G08 | P0 | Two-provider experiment | Configurable provider slots, real zone/weight inputs, eligibility/fallback rules, balanced deterministic allocation and comparison metrics. Current code hashes order/pincode/unit-count into two named providers; that does not establish balanced 50/50 allocation by actual shipping zone and weight. |
| G09 | P0 | Warehouse and inventory operations | Location-aware ledger, real batch intake and release, adjustment reasons/approvals, stock movement history, picking/packing, scheduled reservation cleanup and reconciliations. Current batch records have no warehouse/location field. |
| G10 | P0 | Real customer identity | SMS OTP, email magic-link fallback, secure account recovery, session rotation, distributed rate limits and verified ownership for claiming prior guest orders. Current claiming only merges matching orders belonging to the current guest session. |
| G11 | P0 | Real internal identity and complete governance | Microsoft organizational SSO/MFA, real Admin/Viewer provisioning and offboarding; critical approval workflows for claims, evidence/product master and access changes; protected audit retention, change versioning and conflict handling. Existing approvals cover only price, stock additions, release, publication, refunds and flags. |
| G12 | P0 | Unified customer support | WhatsApp/email ingestion and replies tied to web cases, attachments/evidence, approved service hours, SLA timers, escalation and customer notifications. A local case status is not an external response. |
| G13 | P0 | Cancellation/return/replacement execution | Resolve policy mismatches, then implement authorization, eligibility and evidence windows, reverse pickup, replacement stock/dispatch and provider refund outcomes. Current customers can cancel pending/paid orders directly. |
| G14 | P0 | Safety workflow | Dedicated triage, batch/order linkage, affected-customer identification, recall records, notifications/outreach and accountable incident closure. Priority cases and manual quarantine are only the foundation. |
| G15 | P0 | Approved public content and policies | Final prices, delivery fees, terms, returns/cancellation/privacy copy, business disclosures and working support/privacy contacts. Replace draft packaging where required. |
| G16 | P1 | Rules-based offers and final bundles | Approved complementary combinations, explicit eligibility/exclusions, savings, stacking and margin rules. Related-product links and illustrative bundles are not a governed offer engine. |
| G17 | P1 | Lifecycle communication | Order/payment/shipment/delivery/support/refund notifications and approved post-purchase communication using connected senders, retries and delivery tracking. |
| G18 | P1 | Referrals and store credit | Referral attribution, reward amount, delivery plus fraud/return window, anti-abuse checks, credit ledger, redemption, expiry and reversals. A disabled referral flag exists, but no reward engine. |
| G19 | P1 | Public verified reviews | Moderation queue, approve/reject history, policy, published reviews and invitations after delivery. Existing review submissions remain pending. |
| G20 | P1 | Full customer hub | Address edit/delete and checkout selection, secure prior-order claiming beyond the current browser session, real tracking, invoices and message preferences. |
| G21 | P1 / Gate B | Amazon operational sync | SP-API orders, seller-fulfilled and FBA states, returns, fees, inventory, buffers and reconciliation while listing stays in Seller Central. Current operations copy describes FBA-only scope and there is no integration. Shared ledger must distinguish physical/FBA locations and channel availability. |
| G22 | P1 | First-party event foundation | Campaign attribution, event IDs/schema, consent linkage, payment/delivery/support/repeat events, export controls, retention and reproducible reporting. Current event table stores only user, event name and time. |
| G23 | P1 | Server-managed communication consent | Consent history, source/version/time, preference synchronization, withdrawals and suppression across email/WhatsApp/analytics destinations. Browser-only preferences are incomplete. |
| G24 | P1 | Measured feature experiments | Stable assignment, exposure events, outcome attribution, guardrails and reporting. Governed boolean flags alone do not deliver experiments. |
| G25 | P1 | Delivered contribution and repeat reporting | Approved calculation using revenue/tax, discounts, COGS, payment fees, billed freight, refunds, replacements, RTO/returns and channel fees. Current dashboard explicitly awaits finance inputs. |
| G26 | P1 | Catalogue and multilingual foundations | Remove seven-item assumptions, support the intended configurable nine-product structure and approved-only publication, and introduce locale-aware content. Extra languages are not required at launch under the deck's English-first choice. |
| G27 | P1 | Goal-based discovery | Approved non-diagnostic goal tags/navigation and safe copy. Current browsing focuses on ingredients and formats; no distinct goal-discovery system was found. |
| G28 | P2 / launch check | Final design and technical acceptance | Choose one approved design; verify complete mobile/keyboard/screen-reader flows, performance and failure states; remove review-only controls for production. Production SEO needs canonical URLs, metadata, sitemap and deliberate indexing configuration. Current `noindex`/disallow settings are appropriate for the preview. This is launch housekeeping beyond the decks' detailed feature list. |

## 3. Conflicts and doubts to clarify with you

These are decisions with a material effect on the build. They do not require re-answering all 49 questions.

| No. | Question for you | Why it needs an answer |
|---|---|---|
| D01 | Should these two presentations be the baseline wherever they differ from later project decisions? Please identify any intentional overrides. | The current workspace records later changes. The deck's “approved” title cannot establish that it overrides your later choices. |
| D02 | Is the catalogue seven products at launch within a nine-product system, or has the nine-product scope changed? If nine, what are the remaining two? | Seven supplied products exist and “all seven” is built into multiple screens. Nine configured does not mean nine must all publish. |
| D03 | Which final visual direction should we carry forward? Is the newer premium direction replacing the deck's playful/evidence-led tone? | Five designs exist; project notes say recent premium work was rejected/unapproved. Design acceptance remains open. |
| D04 | Should support approve every cancellation, as the deck says, or may customers cancel directly before a defined fulfilment point? What is that point? | Current API permits customer cancellation for pending and paid orders. Refund approval is separate from cancellation authorization. |
| D05 | Are returns issue-based only, or do you also allow unopened returns? What reporting window, evidence, shipping responsibility and remedies apply? | The deck chooses issue-based only. Current policy draft includes seven-day unopened returns and unresolved opened-item exceptions. |
| D06 | Is unit authentication required for the first sale, alongside public batch proof? Who owns the concealed-code printing and packaging process? | Deck commits to both; current operations copy says unit-authenticity scope is unresolved. |
| D07 | Does Amazon scope include seller-fulfilled plus FBA with a shared ledger and buffers, or is the later FBA-only/agency approach intentional? Who owns each sync? | Current operations text conflicts with Q39–Q42. |
| D08 | May D2C launch once its own gate passes, or do you want a coordinated public launch with Amazon? | Deck allows independent D2C activation; later project notes request coordination. |
| D09 | Are Vayuvega and Shipneer confirmed contracted providers, or placeholders? Which two vendors occupy the configurable slots? | The deck deliberately leaves provider choice configurable; current source names this pair. |
| D10 | Keep COD modelled but disabled, as the decks specify? If activating it is still intended, how do the previously mentioned ₹150 advance and extra fee work? | Deck does not require customer-visible COD at launch. The preview says a policy decision is pending. Detailed COD rules matter only if you choose activation. |
| D11 | Are referrals/store credit definitely in v1? If yes: reward, minimum order, qualifying window, expiry, stacking and refund reversal rules? | Deck includes them; implementation notes describe rewards as provisional. Loyalty points remain a separate deferred feature. |
| D12 | For Q28, Q44 and Q46–Q49, do the deck's choices now supersede the project's “provisional” status? | Those choices cover education scope, analytics, measured experiments, complete-v1 delivery, deferred extensions and delivered contribution. |
| D13 | What order defines delivered contribution, and which costs/attribution windows must it include? How do you want repeat purchase measured? | Finance inputs alone do not settle reporting definitions. |
| D14 | What is the target D2C date, Amazon date and budget range for hosting/providers? Who approves product, compliance, finance, service, logistics and communication work? | These constraints determine the delivery sequence and access setup. The six owners are named functions in functional slide 14, not assigned people. |

## 4. What I need from you

Provide approved files/data and owner names first. Provider access can follow when the production stack is chosen. Configure credentials in the selected secret manager, rather than pasting secret keys into this report or chat.

| Input pack | Exactly what to supply | Suggested accountable owner |
|---|---|---|
| Products | Launch SKU list; remaining planned SKUs; signed product master; approved front/rear labels; final pack images; formula, doses, formats, servings, warnings, allergens, storage, manufacturer and claims | Product + compliance |
| Batch evidence | Actual batch IDs, manufacture/expiry dates, quantities, manufacturer links, approved lab reports, public redactions/summaries, publication/revision owner and QR/pack artwork requirements | Compliance/quality |
| Authenticity operations | Printer/packaging contact, code placement and concealment method, volume per batch, export recipient/process and scan exception owner | Product + quality + packaging |
| Prices and finance | MRP/selling price, SKU tax/HSN data, COGS, discount/bundle rules, shipping/free-shipping thresholds, packaging/payment/courier costs and contribution definition | Finance |
| Warehouse and logistics | Warehouse dispatch/return address, pickup contact/timing, opening stock by lot, packed weights/dimensions, two provider contracts/rate cards, coverage and escalation contacts | Logistics |
| Service and safety | Support contacts/hours, SLA targets, return/cancellation/refund/replacement decisions, evidence windows, escalation owner and recall/outreach procedure | Service + compliance |
| Identity and administrators | Microsoft tenant owner, named Admins/Viewers, at least two distinct Admins for approvals, SMS/email providers and recovery owner | IT/operations |
| Payment and infrastructure | Domain/DNS and hosting owner, Razorpay merchant readiness, billing owner, chosen environment/access configuration and deployment budget | Finance + IT |
| Communication | Support mailbox, WhatsApp Business account/number, approved sender identity/templates, marketing opt-in copy and privacy contact | Communication + service |
| Amazon | Seller account/agency owner, fulfilment scope, ASIN/SKU mapping, FBA stock/process, SP-API responsibility and fee/return/reconciliation inputs | Marketplace owner |
| Brand and editorial | Approved design choice, brand story, real founder/company facts you want published, claims reviewer, education content owner and image approvals | Brand + product |
| Policies and business identity | Final business name/address/registration details intended for display, reviewed policy text, invoice identity and privacy/data-retention requirements | Business + compliance |
| Growth and reporting | Referral/credit rules, offer combinations/exclusions, lifecycle messages, experiment owners, KPI definitions and reporting cadence | Growth + finance |

## 5. Complete mapping of the 49 technical decisions

All statuses refer to the local implementation. Hosted static export has the narrower scope stated above. “Aligned” can describe an intentional scope choice and does not certify a production capability.

| Q | Deck direction | Assessment of current implementation |
|---|---|---|
| 01 | Skeptical Indian shoppers, 18–35 | Partial: evidence/label education supports this audience; final positioning and measurement need acceptance. |
| 02 | Confident first purchase | Partial: browse, learn, proof and bag journeys exist; real proof and production checkout are missing. |
| 03 | Playful, evidence-led | Decision conflict: later premium explorations need final approval. |
| 04 | English first, multilingual foundation | Partial: English exists; copy is embedded in templates and no locale/content foundation was found. |
| 05 | Configure nine; publish approved items | Partial/conflict: seven hard-coded seed products; publication toggle exists, but approved-master gating is missing. |
| 06 | One-time purchases and bundles | Partial: local single-item orders and two sample bundles; no final commercial bundle rules. |
| 07 | Ethical, truthful nudges | Broadly aligned in inspected preview: sample data is disclosed; live claims/offers still require approval. |
| 08 | Rules-based complementary offers | Missing governed offer engine; related items/example bundles are insufficient. |
| 09 | Lifecycle essentials plus referrals | Missing outbound lifecycle system and referrals. |
| 10 | Reward after delivery and fraud/return window | Missing credit ledger, eligibility, reward and reversal logic. |
| 11 | Reviews by buyers with delivered orders | Partial: enforced for local submissions; moderation, invitations and public publishing missing. |
| 12 | Guest-first checkout | Working locally; no hosted transactional backend. |
| 13 | Claimable full account with prior guest orders | Partial: matching orders in current guest session only; complete ownership/recovery/account workflows missing. |
| 14 | Mobile OTP and email magic-link fallback | Partial: displayed preview OTP only; real SMS and email fallback missing. |
| 15 | Model COD; leave disabled | Disabled state aligns with deck. Full COD state model is not demonstrated; later activation notes need reconciliation. |
| 16 | Timed payment reservation | Working locally: atomic 15-minute holds, FEFO, expiry and rollback tests pass. Production payment recovery/jobs missing. |
| 17 | Optional GSTIN and legal name | Fields and basic validation exist; tax calculation and actual invoice generation missing. |
| 18 | Anyone browses; adults purchase | Local server enforces adult attestation; hosted purchase flow unavailable. |
| 19 | Traceability before sale | Partial: released/proof/unexpired batch checks; real approved evidence and product-master gate missing. |
| 20 | Public batch QR plus concealed unit code | Partial: sample product/lot lookup only; real QR publication and concealed-code system missing. |
| 21 | Plain-language summary plus redacted files | Missing real evidence content, files, approval and version management. |
| 22 | Internally generate cryptographically random codes | Missing unit-code generation and lifecycle. Session/order randomness does not fulfil this requirement. |
| 23 | Dedicated safety-event workflow | Partial: priority case and quarantine; triage, recall, outreach and closure missing. |
| 24 | Unified WhatsApp/email/web inbox | Partial: local web cases only; external intake/reply/evidence/SLA system missing. |
| 25 | Support-managed returns/replacements | Partial: cases exist; eligibility, pickup, fulfilment and refund execution missing. |
| 26 | Issue-based returns only | Conflict: policy draft includes seven-day unopened returns. |
| 27 | Support approves cancellations | Conflict: customers can directly cancel pending/paid orders. |
| 28 | Ingredient and proof library | Partial: guides and ingredient pages exist; proof content absent; project marks choice provisional. |
| 29 | Full internal operational core | Partial: operations screens exist; multiple domains are simulated or absent. |
| 30 | Internal inventory ledger | Partial: transactional batch stock/reservations; production movements, locations and channel reconciliation missing. |
| 31 | Admin and read-only Viewer | Server enforcement works for local identities; real provisioning/authentication missing. |
| 32 | Second-person approval for all defined critical changes | Partial: selected changes only; claims, evidence/product master and access changes missing. |
| 33 | Any other Admin approves | Working locally for supported approvals; real identity, expiry and conflict safeguards missing. |
| 34 | Microsoft SSO with MFA | Missing; current identities are explicit demo logins. |
| 35 | Controlled two-provider experiment | Partial illustration only; no provider integrations or measured experiment. |
| 36 | Two configurable provider slots | Conflict/partial: Vayuvega/Shipneer names are hard-coded in simulation/copy. |
| 37 | Deterministic stratified 50/50 allocation | Missing valid implementation: hash split has no per-stratum balance control; zone/weight inputs are illustrative. |
| 38 | One active warehouse, location-aware model | Partial intent only; no warehouse/location model on current batches. |
| 39 | D2C plus Amazon ops sync | Missing Amazon integration; D2C remains local preview. |
| 40 | Amazon orders, fulfilment, returns, fees, inventory | Missing; operations page is informational. |
| 41 | Seller-fulfilled and FBA | Conflict: current operations copy says FBA-only. |
| 42 | Shared internal ledger and configurable buffers | Missing channel buffers/FBA locations and shared reconciliation; current notes describe distinct stock. |
| 43 | Amazon does not block D2C activation | Conflict: later notes describe coordinated launch. |
| 44 | First-party event spine | Partial: five event names/local counts; full schema, attribution, consent propagation and dashboards missing. |
| 45 | Opt-in email and WhatsApp | Partial: separate choices and order consent snapshots exist; sending, durable preference history and suppression missing. |
| 46 | Feature flags and measured experiments | Partial: approved boolean flags; assignment/exposure/outcome system missing. |
| 47 | One complete v1 with two activation gates | Release-policy clarification needed; neither production gate is demonstrated as accepted. |
| 48 | Defer named extensions | Broadly aligned: subscriptions, loyalty points, dynamic personalization and AI health advice are not implemented; no need to add them to close gaps. |
| 49 | Delivered contribution north star | Missing calculation and finance inputs; dashboard labels this explicitly pending. |

## 6. Suggested delivery sequence

1. Reconcile D01–D12 and assign the six business owners. Confirm budget and launch dates.
2. Supply approved product, pricing, batch-proof, policy and warehouse packs. Agree QR/unit-code packaging before printing.
3. Select production architecture, then implement real identity, publication gates, evidence/authenticity, payments, inventory, shipping and service/safety operations.
4. Complete the committed growth, review, consent and reporting features. Accept D2C against its agreed gate using sandbox providers and operational failure scenarios, then production acceptance.
5. Activate Amazon against its own acceptance gate if independent activation remains the decision. Otherwise coordinate launch dates while retaining separate safety/readiness checks.
6. Publish the approved design with final content and production indexing only after acceptance. The preview selector, sample prices and demo identities must not become the public commerce experience.

## 7. Evidence and verification limits

- Read text from every slide in both original supplied PPTX files. No source documents were changed.
- Inspected current `app/server.py`, `web/app.js`, active entry point and templates, static preview adapter/build configuration, README and implementation/design status notes. Implementation claims above were checked against current code rather than relying solely on older status reports.
- Browser spot-check: current E homepage, Vitamin D3 + K2 product page, its label fields and delivery/returns disclosure. This was a focused functional audit, not a fresh visual audit of every route or every design.
- Ran the existing tests: 17 commerce/domain tests passed. The initial HTTP run could not bind under sandbox restrictions; rerunning the seven HTTP tests with loopback permission passed. Total: 24 existing tests passed.
- Passing tests verify the local prototype's existing rules, including direct customer cancellation. They do not prove those rules match the deck, nor validate real provider integrations, live payment movement, production security, load, accessibility or recovery.
- No live domain, provider accounts, approved laboratory evidence or production infrastructure were available for verification. Features outside this workspace may exist elsewhere; they are not verified by this audit.
- Website source and deployment were not modified. Only this audit report was added.

### Source files

- Functional deck: `/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./BCC Presentation/Body-Cafe-Co-Functional-Requirements-Decisions.pptx`
- Technical deck: `/Users/dharmikjinjala/Documents/Dharmik/Work/Body Cafe Co./BCC Presentation/Body-Cafe-Co-Technical-Questions.pptx`
- Functional slides 5–13 and 15–23 provide the main gates and decision summary. Technical Q01–Q49 map one-for-one to the table above; Qn is on slide n+1.
- Code evidence: `app/server.py` (`Store.__init__`, `order`, `cancel`, `admin`, `verify`, report endpoint); `web/app.js` (`shop`, policies, contact, operations, pincode handler); `deploy/hosted-preview.js`; `deploy/build_netlify.py`; `web/index.html`.
