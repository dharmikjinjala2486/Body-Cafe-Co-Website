# Website implementation and launch readiness

16 October 2026

The user initially requested both A and B, using clearly labelled preview data. After requesting a redesign in Claude, the user asked Codex to sync those changes back. Four visual options are available: A/B standalone concepts and C/D connected storefront homepages. C is “Pick a cap”; D is “The morning counter.” They share reviewed homepage content priorities while retaining distinct visual treatments. This delivery is a functional local preview and an operational foundation. The complete production v1 in the working plan is not yet launch-ready.

## Working locally

| Requirement | Implemented behaviour | Production boundary |
|---|---|---|
| Current design system | Claude “pick a cap” redesign; interactive product caps, transparent bottle assets, locally hosted brand fonts, colour transitions and responsive layouts. Earlier A/B concepts remain in `concepts/` and Git history. | Final visual/content sign-off still required |
| Seven-product catalogue | All seven supplied mockups, format filters, search, product detail templates, ingredient guides, related products | Final formula, quantities, pack facts, warnings, claims, prices and rear labels are missing |
| Bundles | Two illustrative combinations, itemised sample totals, all components checked before adding | Approved combinations, rules and savings are pending; no therapeutic combination recommendation |
| Brand and education | Homepage, Standards, Story, learning hub, three guides, seven ingredient pages | Draft copy; no fabricated founder history or certification claims |
| Lot lookup | Product-plus-lot matching; loading, sample match, no-match, unpublished, withdrawn and outage states | No uploaded evidence, signed documents, report-version management or unit authentication |
| Cart and checkout | Guest flow, quantity controls, optional email/GST fields, separate unchecked consent choices, adult attestation, sample discount and totals | COD unavailable pending the ₹150/extra-fee decision; approved GST, shipping and offers missing |
| Inventory | SQLite transactions; released/proof-marked/unexpired batches; FEFO; atomic multi-item reservations; expiry restoration | Sample evidence metadata only; real batch intake, stock adjustments, expiry jobs and warehouse processes remain |
| Payment | Local success/failure simulator; retry and duplicate-capture protection; 15-minute holds | Razorpay adapter, signed webhook ingestion, checkout idempotency keys, late-event recovery, settlement and refund reconciliation missing |
| Order lifecycle | Saved price/policy snapshots, history, pre-shipment cancellation, simulated shipment/delivery, reorder | No real dispatch, label, tracking webhook, courier failure or RTO handling |
| Customer identity | Local hashed OTP with expiry, attempt limit and request cooldown; matching current-session guest order claim; owned account records | Code is displayed for preview; real SMS/email fallback, robust identity recovery, distributed rate limits and session rotation required |
| Addresses | Saved per customer in SQLite | Address edit/delete and selection during checkout remain to implement |
| Support | Case IDs, linked orders, five case categories, customer case list, admin owner/state/history; priority safety cases | No inbound email/WhatsApp/phone ingestion, attachments, timed SLA escalation or external response delivery |
| Returns and replacements | Separate request categories and policy routes | Eligibility decisions, reverse pickup, replacement fulfilment and refund execution are unfinished |
| Safety | Immediate quarantine, blocked sale/capture/dispatch, priority case and audit record | Full recall management, affected-buyer outreach, adverse-event process and real report withdrawal controls unfinished |
| Admin and Viewer | Demo identities; server-enforced roles; approvals for price, publication, stock additions, release, refund and flags | Microsoft SSO/MFA, real organisational provisioning and granular permissions required |
| Different-person approvals | Creator cannot approve; another Admin approves/rejects; replay prevented | No real person identity assurance, notifications, approval expiry or change conflict/version control |
| Audit | Application-level append-only action history | Database administrators can alter records; tamper resistance, backups and retention controls required |
| Reviews | Own delivered order/product required; one review per customer/order/product; pending moderation | Moderation UI and approved public review publishing missing; no invented public reviews |
| Reward/referral | Reserved provisional flag, disabled by default | Rules, anti-abuse controls and reward ledger not implemented |
| Feature flags | Governed local flag storage; ingredient-library visibility follows the flag | Referral/Amazon flags are reserved settings, not working integrations; no experiment assignment/results system |
| First-party analytics | Browser opt-in gates frontend event submission; allowed event names only; local counts | No marketing exports; production consent ledger, attribution, retention and event processing unfinished |
| Delivered contribution | Dashboard clearly marks finance inputs pending | COGS, tax, payment/courier costs, returns/RTO and contribution calculations missing |
| Amazon FBA | Separate integration/readiness information, no shared D2C/FBA stock claim | Agency/API responsibilities, bulk replenishment, data feeds and reconciliation unresolved |
| Policies and preferences | Policy draft pages; browser preference controls | Approved legal/business disclosures and server-managed consent/communication settings required |

The six provisional answers Q28, Q44, Q46, Q47, Q48 and Q49 remain provisional. The later coordinated-launch request is retained alongside independent D2C/Amazon readiness checks. No channel has passed production acceptance.

## Technical foundation and remaining selection

The local implementation uses browser JavaScript, CSS, Python's standard-library HTTP server and SQLite. This makes the complete preview runnable without package installation and demonstrates reservation, permissions and approval rules. It is deliberately bound to localhost and refuses live mode; the explicit demo login must never be exposed as real authentication.

The production commerce engine and hosting stack have not been selected. Assess any candidate against atomic batch-level holds, FEFO and quarantine, mobile identity, separate COD advance/fee mechanics, governed publication and different-person approval, signed payment webhooks, independent D2C/FBA stock, and finance reconciliation. A theme or ordinary cart plugin alone does not demonstrate these capabilities. Retain the frontend/design work while selecting an appropriate production service/data architecture after the unresolved rules and provider interfaces are available.

Before implementation of external services, define durable provider event IDs, signature checks, retries, duplicate/late/out-of-order handling, reconciliation queues, immutable financial records, operator recovery and integration contract tests. The preview's simulated payment success is not a verified provider event. Its hash-based courier choice is illustrative and does not implement the planned controlled experiment.

## Inputs needed for the next production stage

1. Approved rear labels and product records for all seven SKUs: quantities, serving/pack details, allergens, warnings, storage and approved claims.
2. Final selling prices, GST, bundle rules, weights/dimensions, stock and delivery fees.
3. Lot-linked approved public reports, evidence ownership and publication/version rules.
4. Decisions on COD ₹150 collection and extra charge, rewards/referrals, returns/opened-item issues, replacement remedies and cancellation boundary.
5. Domain, business/support contacts, founder content and reviewed policy copy.
6. Secure configuration for Razorpay, identity/OTP, Microsoft tenant, courier accounts, messaging and confirmed Amazon agency responsibilities. Keep credentials out of chat and Git; configure them through the chosen deployment's secret management.

No SharePoint access is needed. Ask the user directly when these inputs become necessary.

## Verification performed

- 21 passing Python domain/HTTP tests plus JavaScript syntax validation.
- Concurrent checkout test: six requests for ten units against forty units permit exactly four reservations, without overselling.
- FEFO, rollback, duplicate payment, failed-payment retry, expired holds, quarantine, missing proof and expired-before-dispatch checks.
- Customer ownership, mobile guest-order claim, delivery-gated reviews, cancellation boundary, refund approval and read-only Viewer checks.
- HTTP checks for encoded SVG paths, request contract, CSRF, cross-origin denial, untrusted Host denial and report states.
- Browser: public and operations route checks, seven product pages, both designs, 390px mobile layouts, no page-level overflow or missing images in inspected views, guest checkout, failed/successful preview payment, OTP order claim, priority case creation, report failure states and simulated shipment/delivery.
- Local captures: `web/qa/desktop-a.jpg`, `web/qa/desktop-b.jpg`, `web/qa/mobile-b.jpg` (ignored by Git).

WCAG conformance, field Core Web Vitals, production security, load/availability, disaster recovery and live provider acceptance have not been certified by these checks.

## Claude redesign sync

Imported and verified on 16 October 2026. See `CLAUDE-SYNC.md`. The backend remains unchanged and all production boundaries listed above still apply. The comparison selector preserves A/B/C/D; C/D share the connected application.

## Full preview QA pass — 16 October 2026

See `QA-Review-and-Next-Steps.md` for the current scope, verified fixes and production sequence. The backend suite now contains 22 passing tests, including malformed nested checkout validation. The public route sweep covered 46 route states at desktop and phone sizes, plus all four homepages at four widths and ten operations routes at two widths. Customer/order/support/approval workflows were exercised on an isolated QA database. Corrections address text/icon layout, small-screen grid sizing, primary headings, review-submission state and comparison-link origins. Claude's independent review is the next gate.
