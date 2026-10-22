# Product detail page, A–H: implementation notes

22 October 2026. Built on commit `107a933` (the canonical baseline). Not committed, pushed or deployed.

## What changed

**Product page (all eight directions)**
- One content model renders all seven products in the same section order:
  1. Gallery and purchase panel
  2. Overview
  3. Ingredients and product facts
  4. How to use and cautions
  5. Quality, sourcing and lot report
  6. Customer reviews
  7. Questions and answers
  8. Other products to explore
- Each direction keeps its own look:

| | Direction | Look |
|---|---|---|
| A | State of Play | Poster type and a tilted specimen card on blueprint |
| B | Expressive everyday | Rounded colour fields, with the visitor's question in a bubble |
| C | Everyday Elsewhere | Arched postcard gallery and chapter stamps |
| D | The Other Side | Lit vitrine and gold wall labels |
| E | Fan Deck | Cap-colour title band over a cream body |
| F | Edition | Colour-field figure plate and folios |
| G | Darkroom | Black stage beside a white reading column |
| H | Folio | Ruled reference sheet with running heads |

- **Gallery**
  - Thumbnails on desktop.
  - On phones: swipe, a live image count, and arrow buttons.
  - Keyboard arrows move between images.
  - Full-screen viewer:
    - Zoom with buttons, `+`/`-` keys, click or tap, or ctrl/⌘-wheel. Drag to pan when zoomed.
    - Escape closes it and focus returns to the image.
  - Images keep their proportions. Only the first image loads eagerly.
- **Purchase panel**
  - Full name, approved tagline and format.
  - Pack quantity, serving size and servings per pack, each shown as awaiting the approved label.
  - Sample price with the illustrative-tax note.
  - A real rating summary linked to the reviews.
  - Quantity and Add to bag, with actual stock.
  - Pincode check.
  - Delivery, returns, tax and offer terms taken from the working policies.
  - Quick links to the main sections.
- **Mobile sticky purchase bar**
  - Appears once the main controls scroll away and hides at the footer.
  - Pads the page so it never covers content.
  - Shows the current product, price and availability.
- **Reviews**
  - Real summary with average, count and a breakdown you can click.
  - Rating filters; newest, highest and lowest sorting; Load more.
  - Each review shows:
    - Purchase-verification label (re-checked by the server).
    - Disclosure if the product was free or another incentive was received.
    - Customer photos, opening in the viewer.
    - Brand replies, labelled as ours.
  - Helpful votes and reports that persist.
  - An honest empty state when nothing is published.
- **Write a review**
  - Inline sign-in that stays on the page.
  - Server-checked eligibility, with a clear reason when someone isn't eligible and routes to Ask a question or support.
  - The form:
    - Star rating, title, written experience and display name.
    - Incentive disclosure.
    - Up to four photos, each with a progress bar, a server-side error, and a remove button.
    - A focused error summary.
  - Duplicate protection through a request ID and one review per customer per product.
  - Success state, and a pending/published/rejected status shown afterwards.
- **Questions**
  - Product-specific FAQs.
  - Answered questions, each with an official answer labelled as ours.
  - An Ask a question form that creates a private support case. Private order issues are routed to support.
- **Lot report**
  - The lookup form with this product preselected, plus the sample lot.
  - A link to the full lookup, the scope note and a demonstration label.
  - A link to Standards.
- **Product-safety route**: separate from reviews, via `/contact?kind=safety`.

**Backend (`app/server.py`, `app/media.py`)**
- **Eligibility**, enforced on the server: a signed-in customer (OTP-verified) whose own order containing the product was delivered. One review per customer per product.
- **Reviews**
  - Submission validation, including title, display name, incentive declaration and up to 4 photos.
  - An idempotent `request_id`.
- **Photos**
  - Upload size is checked before the body is read (≤ 5 MB).
  - The type is identified from the bytes: JPEG, PNG or WebP only. Animated images and SVG are refused.
  - Metadata is removed: EXIF (including GPS), XMP, IPTC, comments and text chunks. A JPEG's orientation is kept as a one-tag EXIF block.
  - Files are stored outside the web root with `0600` permissions.
  - Photos are served only to their owner, to operations, or publicly once both the photo and its review are approved. Responses carry `nosniff` and a restrictive CSP.
  - Unused uploads expire after 24 hours.
- **Public listing**
  - Only published reviews appear.
  - Summary and breakdown, rating filter, three sort orders and pagination.
  - The verified label is recomputed every time a review is shown.
- **Helpful votes and reports**: helpful votes are limited to one per person and can't be cast on your own review. Reports are limited to one per person and don't hide a review on their own.
- **Moderation** (Admin)
  - Publish or reject with a fixed set of reasons. A low rating isn't one of them.
  - Every photo must be approved or rejected before publishing.
  - Brand replies.
  - All moderation is audit-logged.
- **Product questions**
  - Stored as `product_question` support cases, so they appear in the customer's account cases and in Operations.
  - An official answer can stay private or be published, together with an edited question text.
- **Catalogue**: each product carries a `rating` (average and count of published reviews only).

**Application (`web/app.js`)**
- `window.BCCApp` exposes the existing API, sign-in, toast and link helpers to the product page.
- Operations gains a **Reviews & questions** tab: moderation rules, photo decisions, publish/reject with reason, replies, reports and question answers.
- The order-page review form asks guests to sign in first. `?next=` returns them to the order after verification.
- Case cards show the subject and any official answer.

**Static Netlify preview (`deploy/hosted-preview.js`)**
- Reviews and questions return empty lists.
- Eligibility returns `static_preview`, and the page explains that reviews and questions can't be sent there.

## Files

| Status | Files |
|---|---|
| New | `web/product-page.js`, `web/product-page.css`, `app/media.py`, `app/test_reviews.py`, `app/test_media_fixtures.py`, `design-tools/qa-product/verify_product.py`, `design-tools/qa-product/seed_qa.py`, this file |
| Edited | `app/server.py`, `app/test_server.py` (the review test now signs in first), `web/app.js`, `web/index.html` (one stylesheet, one script), `deploy/hosted-preview.js`, `deploy/test_hosted_preview.mjs` |
| Unchanged and still loaded | `web/pdp.js`, which supplies the per-product "label will state" lists and the `[data-fill-pdp-lot]` handler. Its renderers are no longer used. |

## Database and configuration

The schema is created automatically on start (`CREATE TABLE IF NOT EXISTS`), with no migration step:
- `review_media`
- `review_votes`
- `review_reports`

Review fields live in the existing `reviews.data` JSON: title, display name, incentive, media, state, timestamps, reply and request ID.

Review photos are stored in `<database name>-review-media/` beside the database. For the default preview that's `.local/preview-review-media/`, which is git-ignored.

Two new event names are allowed: `review_start` and `question_start`.

No new configuration or dependencies.

## Behaviour change to note

Reviews now require a signed-in customer. A guest who checked out must sign in with the same mobile number, which claims the order, before reviewing. This applies to the order-page form as well as the product page.

## Content kept honest

**Shown:**
- Catalogue facts.
- The sourced ingredient notes, with links to NIH ODS.
- Approved site copy for cautions, delivery and returns.
- Real stock.

**Labelled "Awaiting approved label":** quantities, serving, pack size, other ingredients, nutrition, allergens, dietary marks, manufacturer, directions, storage and suitability.

**Shown as not published:** sourcing, testing, documents and certifications.

**Never stated:** doses, pack counts, benefits, timelines, suitability claims, offers or delivery dates. No reviews, ratings or answers are seeded into the product.

## Missing approved content and image assets

Each item fills a specific slot when it arrives: add facts to `FACTS` and images to `images()` in `web/product-page.js`. Nothing renders empty in the meantime. A missing gallery image simply isn't shown.

**Images (all seven products)**

The gallery currently shows the front mockup and a cap-from-above render, both captioned as draft or studio artwork. Still needed:

1. **Readable approved rear label.** Needs high resolution, at least 2400 px on the long side. The current front artwork is about 1000 px tall, so it softens at 2× zoom.
2. **The actual capsule, softgel or chew,** photographed next to a scale reference.
3. **The bottle held in a hand,** to show scale.
4. **A formula graphic.** This needs approved ingredient forms and amounts first.
5. **Packaging, contents and seal details:** inner seal, desiccant, leaflet, where these apply.
6. **Usage or close-up photography,** or a short video.
7. **A photo showing where the lot number sits on each pack.** This is shared with Standards and the lot report.

**Label artwork conflicts to resolve before approval**

- The 3D three-quarter renders in `web/media/renders/*-three-quarter.webp` print different wording from the 2D front mockups:

| Product | 3D render | 2D mockup |
|---|---|---|
| Creatine Chews | "Berry" | "Orange" |
| Vitamin D3 + K2 | "with Omega-3 (as TG)" | "with Omega-3 as Triglycerides" |
| Omega-3 Fish Oil | "Pure Anchovy from South Pacific" (an unconfirmed sourcing claim) | "as Triglycerides" |

  The product page doesn't use these renders. The E–H shop and home pages still show them, so they need a decision.
- **Pack counts:** the front mockups print counts such as "60 Capsules", "30 Capsules" and "60 Chewable Tablets". The site doesn't state pack counts until they're approved.
- **Benefit lines:** the front mockups print lines such as "Supports Hemoglobin Formation & Energy Metabolism". These are label artwork, not site claims, and need claims review.
- **Other printed statements:** the front mockups also print "40:1 Ratio" (Myo & D-Chiro Inositol), "Naturally Found in Green Tea" (L-Theanine) and "Ferrochel® · Neutrally Charged" (Iron Bisglycinate). All three need confirmation before the label is approved.
- **Category marks:** these vary between "Health Supplement" and "Nutraceutical" across the mockups.

**Product facts (all seven products unless noted)**

- An approved description or purpose statement.
- The full ingredient list, with forms and amounts per serving.
- Serving size, servings per pack and pack quantity.
- Other ingredients and the capsule, softgel or chew base.
- **Creatine Chews only:** the complete formulation, flavour, sweeteners and nutrition facts.
- Nutrition information, where applicable.
- Allergen statement and dietary marks (veg/non-veg). The Vitamin D3 + K2 omega-3 source is still to be confirmed.
- Manufacturer name, address and FSSAI licence.
- Directions, preparation, cautions, interactions, age and suitability, and storage.
- Ingredient sourcing, testing performed, supporting documents and any certifications (with scope and a verification link).

**Commercial and operational**

- Final prices and GST, any real offers, the approved shipping rules and serviceability, and the returns policy.
- A real OTP/SMS provider for review sign-in. In the preview, the code appears on screen.
- Moderation guidelines approved by the business, an owner for brand replies, and a response target for product questions.
- Production photo storage: object storage, a retention period and malware scanning. The preview stores files locally.

## Verification

**Backend**
- `python3 -B -m unittest app.test_server app.test_http app.test_reviews`: 33 tests pass, 9 of them new. They cover:
  - eligibility states;
  - validation, duplicates and idempotence;
  - moderation, including that a low rating is publishable and that photos need decisions;
  - listing filters, sorting, pagination and product isolation;
  - helpful votes and reports;
  - metadata stripping (EXIF/GPS, comments, PNG text, WebP EXIF), with orientation kept;
  - refusal of GIF, APNG, SVG, fake and oversize files;
  - photo access control;
  - product questions;
  - the HTTP flow end to end: CSRF, 415/413, private and public media headers, and catalogue ratings.

**Frontend and build**
- `node --check web/*.js`: all files pass.
- `python3 deploy/build_netlify.py && node deploy/test_hosted_preview.mjs`: passes. Static review and question endpoints were added to the test. The exported product pages render in all eight directions with no errors and explain that reviews and questions are unavailable there.

**`design-tools/qa-product/verify_product.py`**: 2,834 checks, 0 failures.

| Scope | What was checked |
|---|---|
| 7 products × 8 directions × 1440 / 768 / 390 | Section order; one `h1` with the product name; format and price; both images loaded with dimensions and no broken images; 3 related links to real products; anchors resolve; commerce contracts; no claim language; no horizontal overflow; no page or console errors |
| Each direction | Gallery thumbnails, arrow keys and caption sync; swipe count on phones; viewer opens with focus inside, zooms in and out, moves to the next image, keeps proportions, and closes on Escape with focus returned |
| Each direction | Quantity and Add to bag; invalid and valid pincode (no delivery promise); delivery and returns terms; honest empty review state |
| Each direction | Write-review panel: mobile validation, inline OTP sign-in, then the "not a verified purchase" explanation with links to questions and support |
| Each direction | Sample lot fills, and the lookup opens with this product |
| Each direction | Question validation, then submission as a support case |
| Each direction (phone) | Sticky bar appears after the controls, reflects product, price and stock, pads the page, hides at the footer, and its Add to bag works |
| Each direction | axe-core scan at 1440 and 390, with published reviews and the write panel open |
| Seeded QA server (records created through the real API) | Summary 4.2 / 6; panel rating link; first page of 5; pending and rejected reviews hidden; verified labels; incentive disclosure; brand reply; Load more; 5-star filter; lowest-first and highest-first sorting; customer photo opens in the viewer; Helpful persists after reload; report needs a reason, then sends; official answer shown |
| End to end | Inline sign-in; a real order that is "shipped, not delivered" shows that state; after delivery, the form's error summary takes focus; one photo uploads with progress while a fake file gets the server's type error; submission succeeds with focus on the result; the pending state is shown on reopening; Admin publishes with the photo approved; the review appears verified, with its photo, and its owner can't vote on it |
| Stock | Quarantining both Psyllium Husk lots shows out of stock, disables Add to bag, quantity and the sticky button, in all eight directions |

**Regression**
- `design-tools/qa-e-h/flows.py e,f,g,h`: all pass, including product-page quantity, add, pincode and lot lookup.
  - E: 26/26 at 1440, 27/27 at 390.
  - F: 26/26 at 1440, 27/27 at 390.
  - G: 26/26 at 1440, 27/27 at 390.
  - H: 25/25 at 1440, 26/26 at 390.
- `design-tools/qa-product/compare_other_routes.py` against an untouched `107a933` server: 352 of 352 non-product route states identical (22 routes × 8 directions × 2 widths).
- The Operations Reviews & questions tab, used through its own forms:
  - rejecting without a reason is refused with the moderation rule;
  - publishing moves a review to published;
  - a question's official answer saves.

**Not covered:** this isn't a full WCAG audit, load test or production security review. The OTP is a preview code shown on screen.

## Applying

Start from `107a933`. Apply `product-page-a-h.patch` with `git apply`, or copy the overlay files over the tree keeping their paths. Then run the checks above.

For browser QA, use two servers: a clean database on port 4174, and a seeded one on 4175 created with `seed_qa.py`. The seeded records are labelled "QA" and must never be loaded into a shared preview.
