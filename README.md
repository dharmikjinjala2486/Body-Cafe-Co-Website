# Body Café Co. Website

Both visual directions expanded into a connected, responsive website preview using the supplied brand assets and all seven products. The same local application and records power A (warm editorial) and B (expressive everyday).

## Run the complete preview

Python 3.9+ is required. No additional packages are needed.

```sh
python3 -B app/server.py --port 4174
```

Open [Direction A](http://127.0.0.1:4174/?theme=a) or [Direction B](http://127.0.0.1:4174/?theme=b). The toolbar switches designs on every page and remembers the choice in this browser. [Operations preview](http://127.0.0.1:4174/ops) offers explicit Admin A, Admin B and Viewer identities.

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

The 21 tests cover concurrent allocation, FEFO, atomic rollback, payment retry/idempotence, expiry, evidence and quarantine gates, dispatch expiry, cancellation/refunds, different-person approval, ownership, verified-delivery reviews, OTP claiming, HTTP contract, CSRF/origin/Host checks and Viewer enforcement. Browser QA exercised desktop and 390px layouts, both themes, route loading, image loading, guest checkout/payment, mobile sign-in, a safety case, report error states and simulated fulfilment. This is not a full accessibility or production load audit.

## Assets and repository

Original supplied assets live under `assets/`; optimized delivery images live under `concepts/media/`. The early standalone concepts remain in `concepts/` for reference. No SharePoint documents were used. Runtime records, secrets, operating-system metadata and new local QA captures are excluded from Git.

The Blender source is stored losslessly as `assets/source/blender/BCC_Final_Varient_1_Garden_SpotUV_Corrected.blend.gz` to fit GitHub's individual-file size limit. The original `.blend` remains untouched locally. Restore after cloning with:

```sh
gunzip -k assets/source/blender/BCC_Final_Varient_1_Garden_SpotUV_Corrected.blend.gz
```

Repository: [Body-Cafe-Co-Website](https://github.com/dharmikjinjala2486/Body-Cafe-Co-Website), branch `design/concepts`.
