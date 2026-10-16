# Body Café Co. — QA review and next-stage plan

16 October 2026. Local QA and independent Claude review completed; merged corrections verified.

## Current QA pass

Scope: four homepage variants, shared storefront pages, customer journeys and local backend/operations. A/B remain standalone homepage concepts; C/D share the connected local application. This is verification of the local preview, not certification of live payments, delivery services, production security or accessibility compliance.

Tests run against an isolated QA database and server, so test orders and operations changes do not affect the usual preview data.

Initial checks:

- All 21 existing backend/HTTP tests passed.
- 46 public route states inspected at both 1440px desktop and 390px phone widths, including all seven product and ingredient pages, guides, policies, search/filter states and empty states.
- Four homepage variants checked at 320, 390, 768 and 1440px.
- No application error state or broken loaded image found in the initial public route sweep.
- Added a regression test reproducing malformed nested checkout data returning HTTP 500. Fixed input validation. The final merged suite contains 24 passing tests, including discount rounding and duplicate pending approval regressions.

Verified corrections:

- Long desktop policy heading sizing and wrapping.
- Rotated accordion icon alignment.
- Narrow product-menu text, story-grid sizing and product-title wrapping at 320px.
- C story-heading sizing after brand fonts load at tablet and desktop widths.
- Long payment simulator button wrapping.
- Primary headings in empty checkout and not-found states.
- A/B links now use the current preview origin, preserving the older port-4173-to-4174 comparison workflow.
- Submitted review forms now exclude already reviewed products and show pending moderation when complete.
- Review form controls and the submit button stay inside the padded card at 320px.
- Sample discounts round half rupees consistently between checkout and the backend.
- C selects a published fallback when Vitamin D3 + K2 is unpublished, keeping its active bottle and links consistent.

Completed customer workflow checks: empty-field validation, separate unchecked consents, invalid and valid discount codes, exact sample totals, failed payment and successful retry, mobile OTP/order claim, saved address, linked priority support case, delivered-review submission, duplicate-form prevention, preferences persistence, reorder and unpaid-order cancellation. Test records are confined to the isolated QA database.

Completed operations checks: ten routes at desktop and phone widths; simulated shipment/delivery; blocked self-approval; a second Admin resolving a request; read-only Viewer controls. Existing backend tests cover concurrent allocation, ownership, FEFO, quarantine, expiry, refunds, approval separation, CSRF/origin/Host checks and review eligibility.

Completed navigation/evidence checks: search dialog/results, mobile-menu Escape/focus, A/B report validation and explicit illustrative results, matching/missing/unpublished/withdrawn/unavailable report states, D keyboard cap selection and visible mobile cap labels. All four homepages passed final checks at their affected widths after font loading, including open accordions.

## Independent review and final integration

Claude independently reviewed fresh commit `23c6bd3`, delivered seven changed source files and a [separate report](QA-Independent-Review-Claude.md). Its reported coverage includes 112 page/width combinations, customer/operations flows and HTTP safeguards. Codex inspected its patch and merged it with the later local corrections; the source package was not executed blindly.

Accepted changes prevent duplicate pending approvals, display pending refund status, preserve keyboard focus through in-place updates and errors, improve report-disclaimer contrast, enlarge A/B informational captions and provide taller small link targets. Content, section order, the seven products and all four themes are preserved.

Codex also resolved the cap-text contrast limitation identified in Claude's report: black is used for small text where neither brand ink nor cream reaches 4.5:1; informational text is opaque, and C's product-detail card uses a solid neutral surface. Packaging images and cap colors are unchanged. Calculated contrast for the seven opaque cap/text pairs ranges from 4.65:1 to 10.86:1. This is a targeted correction, not a site-wide compliance claim; [W3C's contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) specifies 4.5:1 for normal text.

Final validation: 24 backend/HTTP tests passed; all four JavaScript modules passed syntax checks; `git diff --check` passed. The merged four homepages were rechecked at 320/390/768/1440px with no measured page overflow, clipped audited headings or broken loaded images. Targeted checks confirmed cart focus retention, discount-error focus, the pending-refund badge without a repeat action, affected product/report layouts and the narrow review card. Both local servers were restarted with the merged backend; the regular preview database was preserved. The isolated QA server is stopped after verification.

Production integrations and missing approved inputs below remain outside this preview QA result.

## Proposed work after this QA pass

### 1. Select the final direction

Review A, B, C and D on desktop and mobile, including product discovery, evidence, brand, learning and service sections. Choose one direction for the production storefront. Preserve the alternatives as design history. Apply the selected system consistently to product pages, cart, checkout, account, support and evidence pages.

Decision criteria: brand fit, readable information, easy product selection, mobile comfort, trustworthy presentation and practical maintenance. A design choice alone does not establish conversion performance.

### 2. Complete the approved content and product dataset

For seven SKUs, obtain approved rear labels, complete formula/serving amounts, directions, cautions/allergens, pack sizes, selling prices, GST and physical shipping details. Prepare real front/back packaging photographs, founder copy/portrait, business/support details and approved learning material.

Add actual released lot reports and clearly scoped quality documents. Add genuine customer feedback only with permission, accurate verification and any required incentive disclosure. Replace preview facts only when their final source is available; retain honest empty states where material is not ready.

### 3. Finalize operating rules and choose the production architecture

Resolve shipping/fees, return timing and eligibility, cancellation boundary, replacement remedies, COD advance/fee mechanics, bundle rules and any reward/referral policies. Retain the six provisional requirements questions until the responsible members clarify them.

Select the commerce engine, hosting and data architecture against the existing requirements: batch inventory, FEFO, quarantine, stock holds, ownership, different-person approvals, finance reconciliation and separate D2C/Amazon responsibilities. The current Python/SQLite localhost preview is a working demonstration, not the selected production service.

### 4. Integrate and validate real providers

Configure domain/hosting, customer authentication, organisational admin authentication, payments, couriers, transactional messaging and monitoring through secure deployment configuration. Keep credentials out of chat and Git.

Implement verified payment webhooks, retry/idempotency behavior, expiry and late-event handling, courier event handling, refunds/reconciliation, role permissions, backups and recovery. Connect only providers whose commercial and operational accounts are ready. Confirm the responsibility split for Amazon/FBA separately from D2C readiness.

### 5. Controlled acceptance and launch

Run real low-value test orders after payment/provider configuration is approved: successful and failed payments, retries, reservations, fulfilment, tracking, cancellation/refund and support. Verify policy consistency, content approval, mobile/keyboard usability and monitoring. Rehearse recovery from provider errors and restore from backup.

Start with a controlled pilot, resolve observed issues, then open sales after operational acceptance. Measure product discovery, checkout completion, delivery outcomes, support issues and delivered contribution using the approved consent approach.

## Inputs to gather while QA continues

1. Your preferred final design direction, after comparing the complete pages.
2. Approved seven-product labels/specifications and final commercial data.
3. Publishable lot/quality evidence and permissions.
4. Original founder/team content and genuine customer feedback if available.
5. Final policy/COD/support decisions from the responsible members.
6. Domain and confirmed provider/account ownership; credentials go into secure configuration later.

No production launch date should be promised before these inputs and provider acceptance are complete.
