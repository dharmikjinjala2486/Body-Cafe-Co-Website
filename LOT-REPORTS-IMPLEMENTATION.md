# Lot reports — A–H implementation

23 October 2026. Base: `4c28f6c` (Story release). Not pushed or deployed.

## What exists today

No real lot report, laboratory document, laboratory identity, accreditation, lot-number format or lot-location photo exists in the project. So:

- The page, records model, publication workflow and every state are built and tested.
- Publicly, only clearly labelled **demonstration** lots appear (`DEMO-0N-01/02` for each product, plus sample states). They carry no laboratory, result, date or document.
- The results table, documents, laboratory panel, version history and real batch notices are exercised end to end in QA. QA publishes clearly marked fixture records ("QA Fixture Laboratory (test data)") through the real two-Admin workflow on a disposable test database.

## Routes

| Route | Use |
|---|---|
| `/reports` | Lookup, archive, help |
| `/reports?product=<id>` | Product preselected (product pages, Learn and Shop already link here) |
| `/reports?product=<id>&lot=<lot>` | Runs the lookup (home and product-page lot forms) |
| `/reports/<product>/<lot>` | **Stable record link.** Shareable, printable and suitable for a future packaging QR code. The address bar switches to it after an exact match. The design parameter is kept. |

A QR code to this link opens the batch record. It doesn't authenticate a bottle, and the page says so.

## Shared page flow (identical in A–H)

1. **Introduction:** "Your batch. Its record." with the Match → Understand → Inspect model. The lookup sits beside it, so it's in the first view.
2. **Find your lot report:**
   - The product is a native radio group of cap chips, so arrow keys work.
   - Lot field with hint, inline validation (`aria-invalid` and focus), loading state, and a polite status announcement.
3. **Where is my lot number?**
   - States that no approved photo of the lot position exists yet. No location is invented.
   - Explains lot number vs order number vs barcode vs SKU.
4. **The matching record:** appears immediately below the search, and focus moves to its heading. It shows:
   - product, lot, product image and demonstration label;
   - three **separate** statuses: document availability · test assessment · batch notice;
   - any confirmed batch notice, with its approved instructions and a direct Product safety route;
   - record details. Every missing field reads "Not documented".
5. **Results explained:** the reviewed plain-language summary, counts of results that meet / don't meet / aren't assessed, a "published in part" note, and laboratory notes.
6. **Results, documents and laboratory:**
   - **Results table:** test, result as reported, unit, specification with its source, method, assessment and source reference. It becomes one card per result on phones.
   - **Documents:** view or download each PDF, with its kind (original / authorised redacted copy / amendment), redaction note and SHA-256 fingerprint.
   - **Laboratory:** accreditation body, certificate, validity, scope, and whether the scope covers these tests. It notes whether the report was issued within the validity period, and links to the official verification page.
   - **Version history.**
7. **Understand this report:** nine plain-language terms (lot, sample, reported result, ND/LOD/LOQ, specification, assessment, method, accreditation, versions), what a report can't tell you, and links to the Learn guide, the glossary and Standards.
8. **Browse published lots:** product filter and lot search. Published, superseded and withdrawn records are listed with their status. Demonstration lots are listed separately. It notes that the newest lot isn't necessarily what a new order receives.
9. **Questions or a missing report?** Six focused FAQs, plus "Ask about this lot", "Request a missing report" and "Product safety". Each carries the product and lot.

**Other actions:**
- Copy record link.
- **Print summary:** a one-page sheet with product, lot, version, dates, the three statuses, results, document fingerprints, the record address, the print date and "DEMONSTRATION RECORD" where applicable.

### Lookup states

| State | Behaviour |
|---|---|
| Exact match | Record with three statuses |
| No match | Exact matches only; no near-lot suggestions. Suggests checking characters that are easy to confuse. Says a miss isn't evidence about the pack. |
| Different product | Names the product the lot belongs to, with a one-click lookup under it |
| Under review | "Doesn't mean pass or fail" |
| Not available | "That isn't a test result either way" |
| Published in part | Reviewer's note on what's missing |
| Superseded | Current version shown; older versions listed with reasons |
| Report withdrawn | Public reason shown. Explains that withdrawing a report isn't withdrawing the batch. |
| Batch notice | Approved instructions and a Product safety route |
| Service unavailable | Entry kept, Try again |
| Demonstration | Labelled on screen, in the archive and on the printed sheet |

### Lot-number handling

The manufacturer's lot format isn't known, so:
- Only surrounding spaces and letter case are ignored.
- Nothing else is changed (hyphens, inner spaces, O/0, I/1).
- The result says exactly what was searched for.

The rules are in `LOT_RULES` (`app/lots.py`). Adjust them when the real format is confirmed.

### Directions

| | Direction | Treatment |
|---|---|---|
| A | State of Play | Field notice: Anton capitals, bracketed numbers, lime highlighter on the lot number, graph-paper hero, blue help band |
| B | Expressive everyday | Lilac counter with a speech-bubble lookup, tinted status cards, rounded colour-field sections |
| C | Everyday Elsewhere | Turn the bottle over: Gloock serif, stamped roman-numeral steps, red-ringed selection, blue help band |
| D | The Other Side | After-hours record room: gold labels and a lit case around the match |
| E | Fan Deck | The selected product's cap colour runs through the hero band, lookup and match as a swatch |
| F | Edition | Printed certificate page: folio rules, ultralight heads, italic captions, double-ruled match |
| G | Darkroom | Proof sheet: grey caps develop to colour on selection; the record is printed on a white band |
| H | Folio | Reference entry: § labels, ¶ status heads, margin headings, plates |

## Backend

**`app/lots.py`** (new; mixed into `Store`).

**Tables**
- `lot_reports` (versioned; state draft / in_review / published / superseded / withdrawn)
- `lot_documents` (private PDFs outside the web root, SHA-256)
- `lot_notices`

**Transcription rules** (`validate_record`)
- Results are text, so `<`, `>`, ND, ranges and words are kept exactly.
- An assessment needs a specification **and** its source; otherwise the row is "not assessed".
- Missing results are never zero or a pass.
- Dates are checked for order.
- An accreditation certificate needs its body, the verification link must be https, and scope coverage is stated as all / some / none / unknown.

**Workflow**
1. Draft (the lot must be in the batch register for that product).
2. Upload PDF: checked from its bytes (`%PDF-` … `%%EOF`), max 15 MB. Kind is original / redacted copy / amendment; a redaction needs a public note.
3. Transcribe.
4. Submit. This requires a document, laboratory, report number, issue date, material tested, summary, a change note for versions after 1, and a scope-coverage statement when there's a certificate.
5. A **different Admin** approves or returns it through the existing approvals ledger.

Publishing a new version supersedes the old one, which stays public with its reason. Withdrawals (with a public reason) and batch notices, plus retiring a notice, are also two-person approvals. Everything is audited.

**Public API**
- `GET /api/lots`
- `GET /api/lots/archive`
- `GET /api/lots/documents/<id>` (only published or superseded versions; `Content-Security-Policy: sandbox`, nosniff, integrity re-checked before serving)

**Admin API**
- `POST /api/admin/lot_*`
- `POST /api/admin-lot-document` (raw PDF, Admin and CSRF only)

**Other server changes**
- The old `/api/reports` sample endpoint is removed. It showed internal quarantine as "withdrawn"; quarantine now stays internal.
- **Support cases:**
  - new kind `report` ("A lot report");
  - `topic` may be `/reports/<product>/<lot>`, with an optional `lot`;
  - up to two pack photos via `POST /api/case-media`, cleaned by the existing `media.sanitise` (metadata removed) and visible only to the customer and support.

**Operations › Lot reports** (`web/lots-ops.js`): start versions, attach PDFs, transcribe (row editor), submit, discard, request withdrawal, start a corrected version, and request or retire batch notices. Viewers see everything read-only. Cases show the lot topic and pack-photo links.

**Notifications:** no notification service exists, so no "notify me" control is shown. The FAQ says so, and Operations notes the dependency.

## Files

| File | Change |
|---|---|
| `app/lots.py` | New: model, rules, workflow, lookup, archive, documents |
| `app/server.py` | Mixin, routes, approvals hook, case topic / lot / photos, case-media upload |
| `app/test_lots.py` | New: 10 tests |
| `app/test_http.py` | Lookup states, document privacy and headers, upload validation (replaces the old reports test) |
| `web/lots.js`, `web/lots.css` | New: page for A–H, print sheet, Operations styles |
| `web/lots-ops.js` | New: Operations workflow |
| `web/app.js` | `/reports/<p>/<lot>` route, form hooks, case kind / topic / photo, Operations tab, `BCCApp.catalog/opsAction/rerender` |
| `web/index.html` | Loads the new files |
| `deploy/hosted-preview.js`, `deploy/test_hosted_preview.mjs` | Static preview: demonstration lots with the same exact-match rules |
| `design-tools/qa-lots/*` | New: `verify_lots.py`, `fixture.py`, `shots.py`, `compare_other_routes.py` |
| `design-tools/qa-e-h/flows.py`, `design-tools/qa-product/verify_product.py` | Report-lookup steps updated for the new form and the stable record link |

## Needed before real records can be published

1. **Laboratory documents** per product and lot: the original PDF, or an authorised redacted public copy with what was redacted and why.
2. **Laboratory details:** name and address, accreditation body, certificate number, scope (and which tests it covers), validity dates, the official verification link, and permission to use any accreditation mark (none is shown).
3. **Specifications per product** (limits and their source and version), to support any "meets / does not meet" assessment. Otherwise results stay "not assessed".
4. **The lot-number format** from the manufacturer (characters, case sensitivity, length), to finalise `LOT_RULES`.
5. **A photo or diagram of where the lot number is printed** on each pack or format.
6. **Formulation / product version identifiers**, plus manufacturing and expiry dates per lot.
7. **Who commissions testing,** and the sampling process (finished product vs raw ingredient).
8. **A named reviewer and approver** in production identity (Microsoft SSO is not connected), and the approved wording for batch notices.
9. **Optional:** a notification service, if report-availability alerts are wanted.

## Verification (23 October 2026, against base `4c28f6c`)

| Check | Result |
|---|---|
| Lot reports, live server with QA fixtures: A–H × 1440 / 768 / 390, reduced motion, Operations (Admin + Viewer), axe serious/critical | 1682 checks, 0 failures |
| Lot reports, static Netlify build (demonstration lots), A–H × 1440 / 390, axe | 710 checks, 0 failures (after fixing one B contrast issue found by axe) |
| Backend tests (unittest discover over `app/`) | 48 passed (10 new lot tests, 2 rewritten HTTP tests) |
| Hosted-preview API test | Passed |
| Other routes vs `4c28f6c` (23 routes × A–H × 2 widths; Lot reports and Contact excluded as intentionally changed) | 368 states, 1 difference: an image-load counter on the A home page at 390px, which matched when rechecked (timing, not a change) |
| About / Shop / Story / Learn suites | 1313 / 1433 / 996 / 10412 passed, 0 failures |
| Product page suite (A–H, clean and seeded) | 2818 passed, 0 failures |
| E–H flows | 8/8 |
