# Account, Cart, Support and Policies — 23 October 2026

Claude’s Account/Cart and Support/Policies packages are integrated across A–H. They add a server-quoted bag, preview sign-in and account journeys, Help search, contextual private cases and replies, preferences, and clearly marked draft policies. Netlify keeps backend-dependent actions unavailable. See [Account/Cart](ACCOUNT-CART-IMPLEMENTATION.md), [Support/Policies](SUPPORT-POLICIES-IMPLEMENTATION.md) and [independent release checks](design-review/ACCOUNT-SUPPORT-RELEASE-2026-10-23.md).

# Lot Reports across A–H — 23 October 2026

Claude’s Lot Reports rebuild is integrated over the latest feedback-form release. It adds exact product/lot lookup, stable record links, separate document/test/notice states and a two-admin publishing workflow in the local backend. Netlify displays demonstration records; no real laboratory reports are supplied. See [implementation](LOT-REPORTS-IMPLEMENTATION.md) and [release checks](design-review/LOTS-RELEASE-2026-10-23.md).

# Story across A–H — 23 October 2026

Claude’s dedicated Story page is integrated across all eight designs, with shared chapters, object tabs, image viewer, reading progress and chapter-linked support. Five chapters use available brand copy; founder chapters and historical components remain hidden until genuine approved material is supplied. See [implementation](STORY-IMPLEMENTATION.md) and [release checks](design-review/STORY-RELEASE-2026-10-23.md).

# About and Learn across A–H — 23 October 2026

Claude’s dedicated About page and Learn knowledge hub are integrated across all eight designs. Learn includes seven product guides, five foundation guides, a glossary, search, local saved reading and preview-backend feedback. The hosted static preview disables server-dependent submissions. See [About](ABOUT-IMPLEMENTATION.md), [Learn](LEARN-IMPLEMENTATION.md) and [independent release checks](design-review/ABOUT-LEARN-RELEASE-2026-10-23.md). Guides disclose their pending specialist review; research findings remain in the internal review pack.

# Shop across A–H — 22 October 2026

Claude’s shared Shop rebuild is integrated across all eight designs, including format/stock filters, sorting, URL history, return-position restoration and inline Add to bag feedback. See [implementation](SHOP-IMPLEMENTATION.md) and [independent release checks](design-review/SHOP-RELEASE-2026-10-22.md).

# Product pages across A–H — 22 October 2026

Claude’s product-page rebuild is integrated for all seven products and eight directions. One shared model supplies the eight sections. The local Python preview supports verified-delivery reviews, private photo uploads and moderation. Netlify remains a static design preview; review and question submissions require the backend and are unavailable there. See [implementation](PRODUCT-PAGE-IMPLEMENTATION.md) and [verification](design-review/PRODUCT-RELEASE-2026-10-22.md).

# Standards across A–H — 22 October 2026

Claude’s approved Standards redesign is integrated across all eight variants, with one shared content model and eight distinct presentations. It preserves the existing headers, other pages and commerce handlers. See [implementation](STANDARDS-IMPLEMENTATION.md) and [local release verification](design-review/RELEASE-2026-10-22.md). Approved business records remain pending and are labelled in the page.

# E–H merged redesign — 22 October 2026

Claude’s completed full-site directions are now merged into the local application:

| Variant | Direction | Local preview |
|---|---|---|
| E | Fan Deck — minimal, brand colours | [Open E](http://127.0.0.1:4180/?design=e) |
| F | Edition — premium editorial, brand colours | [Open F](http://127.0.0.1:4180/?design=f) |
| G | Darkroom — luxury monochrome interface, real-colour bottles | [Open G](http://127.0.0.1:4180/?design=g) |
| H | Folio — quiet monochrome interface, real-colour bottles | [Open H](http://127.0.0.1:4180/?design=h) |

All four cover the existing customer routes and states, including a dedicated About page, collection filter/sort, all seven product pages, bag, checkout, account, reports, help and policies. They retain the common seven-section homepage order. A–D keep their local designs, homepage-flow, navigation and motion improvements. The earlier Cap Index / Rooms / Monolith / Formulary implementation is archived locally and is no longer loaded.

See [local merge and verification](design-review/EH-MERGE-2026-10-22.md) and [Claude’s integration notes](INTEGRATION-E-H.md). The static export has been rebuilt; see the Git history and Netlify deploy history for publication status. Historical notes below describe earlier snapshots.

# Latest refinement — 20 October 2026

Current directions: A **State of Play**, B **Expressive everyday**, C **Everyday Elsewhere**, D **The Other Side**. A retains its sculpture with smooth source bottles/caps; D now tells a four-chapter bottle-and-cap scroll story. All four themes gain interactive sections and original, unrecoloured header/footer logo artwork. Read [REFINEMENT-20261020.md](REFINEMENT-20261020.md) for the current scope, implementation and checks. Older entries below are historical snapshots.

# Body Café Co. Website

The current customer-site directions are A (**State of Play**), B (**Expressive everyday**, preserved), C (**Everyday Elsewhere**) and D (**The Other Side**). On 20 October 2026, A/C/D were rebuilt across the customer site and all seven product pages after the user rejected their earlier designs. B's original design files are unchanged. A/D now have live 3D landing pages built from the original Blender product models; see `MOTION-RESEARCH.md` for motion research, interaction design and verification. `CREATIVE-RESET-RESEARCH.md` records the earlier full-site redesign. Earlier design documents remain as historical records.

## Run the complete preview

Python 3.9+ is required. No additional packages are needed.

```sh
python3 -B app/server.py --port 4174
```

Open [direction C — Everyday Elsewhere](http://127.0.0.1:4174/?design=c). Use the top selector to switch A–H on the current page. Every customer route retains the selected direction, including shop, products, brand, learning, reports, bag, checkout, account, support and policies. Old A/B concept entry URLs redirect into the main app. All seven products have new A/C/D detail-page compositions; B retains its existing design. [Design states](http://127.0.0.1:4174/preview/states?design=d) lists clearly labelled synthetic transactional examples with disabled controls. [Operations preview](http://127.0.0.1:4174/ops) retains its existing shared interface.

This server binds to loopback only, rejects other Host headers, and refuses a non-preview `BCC_MODE`. It is not a production commerce server. Use sample information: the checkout, addresses and support forms persist their input in a local SQLite file, `.local/preview.sqlite3`, which is excluded from Git. No money, SMS, email, courier booking or external analytics transmission occurs.

## Explore the journeys

- Shop all seven products, filter formats, search products and ingredients, and inspect each product page.
- Add individual products or an illustrative bundle to the bag. Use `PREVIEW10` to exercise a sample discount. Prices, tax and delivery terms are illustrative.
- Complete guest checkout with sample details. Simulate payment failure and retry, or success. Orders reserve released, unexpired stock for 15 minutes.
- Sign in through Account with an Indian-format sample mobile number. The preview code appears on screen; no SMS is sent. Matching orders from the current guest session can be claimed.
- Review order history, save addresses, reorder and open linked support cases. Product safety creates a priority case, without initiating external outreach.
- Look up a product's displayed `DEMO-xx-01` lot. Expand the sample states to explore unknown, unpublished, withdrawn and service-unavailable results. No actual laboratory document is attached.
- Enter Operations as Admin A, request a critical change, then leave and enter as Admin B to approve it. The initiator cannot approve their own request. Viewer mutations are denied by the server.
- Simulate shipment and delivery from Operations → Orders. Only the purchasing customer can submit a review after delivery. Review submissions remain pending moderation; public review publishing is not implemented.

Switching to an operations identity changes the current session. Leave operations and sign in again using the same preview mobile to recover previously claimed customer orders. Unclaimed guest records remain associated with their original guest identity.

## Pages and implementation

| Area | Routes |
|---|---|
| Collection | `/`, `/shop`, `/products/:id`, `/bundles`, `/bundles/:id`, `/search` |
| Brand and education | `/standards`, `/story`, `/learn`, `/learn/:slug` |
| Evidence | `/reports?product=:id` |
| Commerce | `/cart`, `/checkout`, `/payment/:id`, `/orders/:id` |
| Account and support | `/account`, `/account/addresses`, `/account/cases`, `/contact`, `/help`, `/settings` |
| Policy drafts | `/policies/shipping`, `/policies/returns`, `/policies/cancellation`, `/policies/privacy`, `/policies/terms` |
| Operations | `/ops`, `/ops/orders`, `/ops/inventory`, `/ops/products`, `/ops/cases`, `/ops/approvals`, `/ops/audit`, `/ops/analytics`, `/ops/channels`, `/ops/flags` |

`web/` contains the frontend. `app/server.py` contains the local HTTP API and SQLite transactions. `IMPLEMENTATION-STATUS.md` separates working preview behaviour from unfinished production requirements. `Website-Final-Plan.md` and `Website-Research-and-Plan.md` retain the requirements and research.

## Verification

```sh
node --check web/app.js
python3 -B -m unittest app.test_server app.test_http -v
```

The 24 tests cover concurrent allocation, FEFO, atomic rollback, payment retry/idempotence, expiry, evidence and quarantine gates, dispatch expiry, cancellation/refunds, different-person approval, ownership, verified-delivery reviews, OTP claiming, HTTP contract, CSRF/origin/Host checks and Viewer enforcement. Initial browser QA exercised both earlier themes, mobile sign-in, a safety case, report error states and simulated fulfilment. After the Claude import, browser QA additionally checked 19 desktop routes, seven routes at 390px, asset loading, cap switching, homepage lot lookup, guest checkout, failed payment and successful retry. The final four-variant QA and independent Claude review are recorded in `QA-Review-and-Next-Steps.md`, including malformed checkout, discount rounding, duplicate approval, focus and responsive layout corrections. This is not a full accessibility or production load audit.

## Assets and repository

Original supplied assets live under `assets/`; optimized delivery images live under `concepts/media/`. The early standalone concepts remain in `concepts/` for reference. No SharePoint documents were used. Runtime records, secrets, operating-system metadata and new local QA captures are excluded from Git.

The Blender source is stored losslessly as `assets/source/blender/BCC_Final_Varient_1_Garden_SpotUV_Corrected.blend.gz` to fit GitHub's individual-file size limit. The original `.blend` remains untouched locally. Restore after cloning with:

```sh
gunzip -k assets/source/blender/BCC_Final_Varient_1_Garden_SpotUV_Corrected.blend.gz
```

Repository: [Body-Cafe-Co-Website](https://github.com/dharmikjinjala2486/Body-Cafe-Co-Website), branch `design/concepts`.


## Netlify deployment

See [NETLIFY.md](NETLIFY.md). The committed configuration builds `dist/` with a root entry page, SPA fallback and a seeded, read-only design-preview adapter. All eight designs and product pages work without the local Python API. Account, ordering, support submissions and operations require a hosted backend and show an explicit unavailable state on this export. Local functionality is unchanged.
