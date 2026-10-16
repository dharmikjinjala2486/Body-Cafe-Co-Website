# Body Café Co. Website

The current storefront uses the “pick a cap” redesign created in Claude and imported into this repository on 16 October 2026. It includes all seven products, interactive cap selection, transparent bottle images, locally hosted Lemon Milk/Aileron fonts, café menu layouts and the existing connected commerce/support preview. See `CLAUDE-SYNC.md` for provenance and verification.

## Run the complete preview

Python 3.9+ is required. No additional packages are needed.

```sh
python3 -B app/server.py --port 4174
```

Open [direction D — Still life](http://127.0.0.1:4174/?design=d). The top selector preserves A (Warm editorial), B (Expressive everyday), C (Claude design) and D (Still life). A/B are standalone concepts with links to the working storefront; C/D share the connected commerce preview. All four homepages include the researched trust, customer-experience status, brand, learning and service content. C is explicitly selected at `/?design=c`; D at `/?design=d`. All seven products now have distinct A/B/C/D detail pages. Product URLs carry `?design=a|b|c|d`; the selector changes theme while keeping the same product. The chosen direction persists within the tab, and A/B product home links return to their matching concept homepage. See `PDP-THEMES.md` for integration and content gaps. Old `?theme=` parameters no longer select a design. [Operations preview](http://127.0.0.1:4174/ops) offers explicit Admin A, Admin B and Viewer identities.

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
