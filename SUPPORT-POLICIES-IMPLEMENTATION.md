# Support and policies: implementation record (A–H)

| | |
|---|---|
| **Base** | `3ad38b1` plus the Account and Cart A–H package (`body-cafe-co-account-cart-a-h.zip`). Apply that package first. |
| **Status** | Built and verified locally. Not committed, pushed or deployed. |
| **Policy status on the site** | Every policy says "Draft 0.1 — draft for review, not yet in effect". Nothing is labelled as legally approved. |

## Summary

Eight pages now form one connected support system, with the same facts, structure and behaviour in A–H. Each direction keeps its own type, colour and layout through `su-a…su-h`.

**Footer**
- Every footer has the same three groups and the same eight labels:
  - **Customer care:** Help Centre, Contact, plus Your account.
  - **Orders & delivery:** Shipping & Delivery, Returns & Refunds, Cancellations.
  - **Privacy & legal:** Preferences, Privacy, Terms.
- Each group is written into the direction's own footer markup.
- No header or main-menu links were added. Directions C and E–H already had a Help link in the header or mobile menu before this work. It's left as it was; remove it if you want footer-only.

**Contextual links**
- Checkout: Shipping & Delivery, Returns & Refunds and Cancellations sit directly above the order button.
- Bag summary: Shipping & Delivery, Returns & Refunds and Help Centre.
- Contact form: a Privacy link beside the form.
- Order page: links to the relevant policies.
- Help answers: link to the matching policy sections.

### Help Centre (`/help`, `/help/<topic>`, `/help/<topic>/<answer>`)
- Search covers all 23 answers and every policy section, and the URL can be shared (`?q=`). There's an empty state with a way out.
- Seven topics: Orders, Delivery, Returns, Payments, Account, Products and Lot Reports.
- Four quick actions: Track an order, Report an issue, Request cancellation and Contact support.
- Common questions open in place, with their actions.
- "Did this answer your question?" is stored on the server, one answer per browser session per article. A "No" asks why (optional) and offers Contact. Results appear in Operations › Cases.
- Every answer is readable without signing in.
- "Still need help?" opens Contact with the topic preselected and the answer named.

### Contact
- **Channels:** only the contact form is shown as available. Email, WhatsApp and phone show "Not yet available".
- **Shown as "To be confirmed":** support hours, reply time, legal name, address and grievance officer.
- **Shown:** time zone (IST) and the National Consumer Helpline.
- **The form asks for:**
  - Topic, with 12 options routed to queues: order delivery, item problem, return/refund, cancellation, payment, product question, product safety (priority), lot reports, account, privacy, business enquiry, other.
  - Name, plus a mobile number or email. Signed-in customers use their verified number.
  - Optional order reference, with a list of your orders when signed in.
  - Message.
  - Up to two optional photos, using the existing safe upload: re-encoded, with location and camera data removed.
- **Behaviour:**
  - Errors appear beside each field and keep what was typed.
  - The submit button shows a loading state and won't double-submit.
  - An offline error keeps the message.
  - The draft survives refresh and sign-in.
- **After sending:** the confirmation shows the real case reference and doesn't claim that any email or SMS was sent.
- **Case page (`/account/support/CASE-…`):** progress timeline, Operations replies, and "Add information", which reopens a resolved case. Only the session or account that opened the case can see it.
- **Privacy topic:** sends you to the verified request form instead of the open form.
- **Safety topic:** shows urgent-care guidance.
- **Context carried over:** `?kind`, `?order`, `?topic` and `?lot` from About, Story, Learn, Lot Reports and product pages still arrive with their context (lot and page included).

### Preferences (`/settings`, also Account › Preferences)
- **Necessary:** always on, with an explanation.
- **This browser (no account needed):**
  - **Optional analytics:** the same switch the existing first-party event recorder checks. Off means no `/api/events` calls.
  - **Reduce motion:** CSS motion stops, and scripts asking `prefers-reduced-motion` are told "reduce".
  - **Language:** English only, stated plainly.
- **Advertising and personalisation:** "Not used". There's no switch, because no such technology exists on the site.
- **Marketing email and WhatsApp:** account only, after a verified sign-in. Saved on the server and confirmed only from the server's answer. Marketing SMS isn't offered.
- **Order and service messages:** shown as separate from marketing. Nothing is bundled with purchases or support.

### Shipping & Delivery, Returns & Refunds, Cancellations, Privacy, Terms
- Each page has:
  - an "In short" summary, then full sections with shareable `#anchors` and an on-page contents list;
  - the version, date and draft status;
  - cross-links, and print styles that hide navigation.
- Undecided items carry a "Not yet confirmed" marker. They're never filled with guesses.

### Order-aware actions
- **Cancellation:**
  - The order page asks the server first (`/cancel-check`) and explains the outcome before you confirm: full refund or nothing to refund, no charge.
  - "Cancelled" appears only after the server confirms.
  - Payments still being confirmed, dispatched orders and failures are each explained.
  - The server now also refuses to cancel while a payment is still being confirmed.
- **Report a problem (delivered orders):**
  - You choose the items and quantities, the reason (including "I changed my mind", marked as undecided), and whether you'd prefer a refund, a replacement or either.
  - Message and optional photos.
  - This creates a case linked to the order, shown under "Support for this order".
  - A duplicate open request is refused, with a link to the existing one.
- **Refunds:** status shown on the order page as "being reviewed" or "released (preview — no money moved)".
- **Tracking:** no courier is connected, so the order page shows the status timeline and says so.

### Privacy requests (Account › Profile & security › Your data and privacy)
- **Download my data:** an immediate JSON copy of this customer's account, addresses, orders, cases, reviews and preferences.
- **Requests:** access, correction, erasure, withdraw consent, nominate, complaint and other.
- Each request needs a verified sign-in, gets a case reference, appears under Support and lands in the "Privacy requests" queue. A duplicate open request is refused.

## Files

**New**
- `app/support.py`: SupportMixin covering help feedback, case view and reply, cancel check, return requests, privacy requests and data export.
- `app/test_support.py`: 7 tests.
- `web/support-content.js`: every fact, answer, topic, policy and footer label. This is the single source.
- `web/support.js` and `web/support.css`: the pages, the case page and the preferences component.
- `web/motion-pref.js`: the reduce-motion preference, loaded first.
- `design-tools/qa-support/verify_support.py`: browser QA.
- `SUPPORT-POLICIES-IMPLEMENTATION.md`: this record.

**Modified**
- `app/server.py`:
  - support mixin and routes;
  - new case kinds `product`, `business`, `cancellation`;
  - contact details on cases;
  - queue routing;
  - "Response time not yet confirmed" replaces the invented "Preview target: 1 business day";
  - case topics accepted from help, policy and product pages;
  - case-order errors point at the order field;
  - cancel guard for payments still being confirmed;
  - Operations case replies (`note`);
  - help feedback in the Operations snapshot.
- `web/app.js`:
  - `/help/*` routes;
  - account data loaded on `/contact` and `/settings`;
  - Contact readable on the shared preview;
  - support enhance hook;
  - link interceptor ignores `download` and `blob:` links;
  - old Preferences code guarded;
  - Operations cases show queue, contact and request details with a reply field, plus a help-feedback table.
- `web/account.js`: case page in Support, shared preferences, privacy section, order-page cancellation check, problem report, linked cases, checkout policy links.
- `web/bag.js`: bag policy labels.
- `web/site.js`: policy titles match the footer labels; `careGroups()`.
- `web/site-b.js`, `site-e.js`, `site-f.js`, `site-g.js`, `site-h.js`, `creative.js` (A and D), `world.js` (C): footer groups.
- `web/index.html`: new scripts and styles.
- `deploy/test_hosted_preview.mjs`: the static preview refuses the new saves.
- QA suites moved to the new contact form and order markup: `design-tools/qa-account/verify_account.py`, `qa-about/verify_about.py`, `qa-story/verify_story.py`, `qa-lots/verify_lots.py`, `qa-e-h/flows.py`.

## Database and configuration
- **New table:** `help_feedback(session, article, helpful, reason, created)`, created on start.
- **Case records gain optional fields:** `contact`, `queue`, `request` (return or privacy) and history entries with `note`/`from` (Operations replies) or `customer_reply`.
- **New case kinds:** `product`, `business`, `cancellation`. Privacy requests use kind `privacy` through their own endpoint.
- **Existing rows** are unchanged and still render.
- **No new configuration.** Business details live in `BUSINESS` in `web/support-content.js`. Fill them in there and every page updates.

### API
- GET:
  - `/api/cases/CASE-XXXXXXXX`
  - `/api/orders/BCC-XXXXXXXX/cancel-check`
  - `/api/account/export`
- POST:
  - `/api/cases/CASE-XXXXXXXX/reply`
  - `/api/orders/BCC-XXXXXXXX/return`
  - `/api/privacy-requests`
  - `/api/help/feedback`
- `/api/cases` also accepts `contact`.

## Official sources consulted
- **Consumer Protection (E-Commerce) Rules, 2020** (G.S.R. 462(E), 23 July 2020), consumeraffairs.gov.in:
  - Rule 4(2): identity and contact disclosure.
  - Rule 4(4)–(5): grievance officer; acknowledge within 48 hours, resolve within one month.
  - Rule 4(8): no unnecessary cancellation charges.
  - Rule 4(9): explicit consent.
  - Rule 4(10): refunds on time.
  - Rule 7(1): inventory-entity disclosures.
  - Rule 7(4): no refusing returns or refunds for defective, deficient, spurious, misdescribed or late goods.
- **Consumer Protection (E-Commerce) (Amendment) Rules, 2026**, notified 9 September 2026, in force 1 January 2027, consumeraffairs.gov.in:
  - copy of the recorded complaint to the customer;
  - best-before / use-before disclosure (food subject to FSS rules);
  - annual dark-pattern self-audit and certificate;
  - prior-price display;
  - mandatory National Consumer Helpline convergence.
- **Digital Personal Data Protection Act, 2023**:
  - Commencement notification G.S.R. 843(E), 13 November 2025.
  - DPDP Rules, 2025, G.S.R. 846(E), 13 November 2025, with corrigendum G.S.R. 892(E).
  - Board provisions are in force now. Consent-manager rule from 13 November 2026.
  - Notice, consent, security, breach, children's data and rights obligations from 13 May 2027.
  - A proposal to shorten the 18-month period has not been notified, as far as could be found.
- **IT (Reasonable Security Practices… SPDI) Rules, 2011** (G.S.R. 313(E)): Rule 4 privacy policy; Rule 5(7) withdrawal; Rule 5(9) grievance officer, one month. These apply now; section 43A is omitted when DPDP section 44(2) commences.
- **National Consumer Helpline:** 1915 / 1800-11-4000, consumerhelpline.gov.in.
- **CCPA Guidelines for Prevention and Regulation of Dark Patterns, 2023.**
- **FSS (Health Supplements, Nutraceuticals…) Regulations:** "NOT FOR MEDICINAL USE", recommended-usage and cautionary statements. These informed the product-use section in Terms. Label wording still depends on the approved labels.

## Outstanding before production publication

**Business details**
- Legal entity name, registered and principal address (and branches), GSTIN, FSSAI licence.
- Grievance officer: name, designation, email and phone.
- Privacy / data-protection contact.

**Support operations**
- Which channels go live (email, WhatsApp, phone) and their numbers and addresses.
- Support hours.
- A first-response target.
- A process that meets the statutory 48-hour acknowledgement and one-month resolution.
- Integration with the National Consumer Helpline convergence process, mandatory from 1 January 2027.

**Shipping**
- Serviceable pincodes (needs courier API).
- Processing time.
- Final delivery charge and threshold.
- How estimates are worded.
- Courier attempts and return-to-origin handling.
- Address-change rules after dispatch.

**Returns**
- Whether change-of-mind returns are accepted, with conditions and windows.
- Collection versus customer shipping, and who pays.
- Refund processing timelines.
- Treatment of delivery charges and discounts on part-refunds.
- Opened-item remedies.
- Note: the decision deck lists "Issue-based only / support-managed", but the ledger leaves eligibility open. The draft follows issue-based handling and marks change-of-mind as undecided.

**Cancellations**
- The exact cut-off ("dispatch" versus "packing started").
- Self-service versus support approval. The decision deck says support approval only; the current preview, and this draft, use self-service before dispatch. Please choose one.
- Confirm no cancellation fee.

**COD**
- Still not offered: the ₹150 mechanism and courier charge remain undecided.

**Privacy**
- Processors and vendors (payments, OTP/SMS, email, courier, hosting).
- Hosting location and cross-border transfers.
- A retention schedule.
- The breach-notification process.
- Children's-data handling (verifiable parental consent from May 2027 if minors are ever processed).
- Notice and consent artefacts for DPDP Rule 3 before 13 May 2027.

**Terms**
- When the contract forms.
- Jurisdiction and courts.
- Product classification and label statements (health supplement or nutraceutical).
- Final pricing and tax wording.
- Review licence wording.
- Dark-pattern self-audit certificate (from 1 January 2027).

**Integrations**
- SMS/OTP, Razorpay (payments, refunds, webhooks), courier tracking and serviceability, an email or WhatsApp sender (order and case updates), and GST invoicing.

**Legal approval**
- All five policies and the Contact disclosures need legal review. They are drafts written to the current preview's actual behaviour.
