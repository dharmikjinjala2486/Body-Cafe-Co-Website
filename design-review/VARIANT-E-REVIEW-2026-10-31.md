# Variant E review build — 31 October 2026

Variant E (Fan Deck) is the finalized storefront in local, static, connected and production builds. Old design URLs and session preferences resolve to E. Historical design assets remain in source. The existing Supabase proxy, records and operations authentication are unchanged. This work is local and has not been published.

## Completed

- Reviewed the existing E design and retained its Aileron/Lemon Milk typography, cap colours, white/cream surfaces and responsive layouts across customer routes.
- Completed the content pass across the homepage, seven product pages, Shop, About, Story, Standards and ingredient guides. Account, cart, checkout, reports, support, preferences and policy layouts already existed and were verified in E.
- Added `web/label-records.json` and `web/label-content.js`: one set of display defaults transcribed from the supplied final master label artwork. Backend product edits take precedence. Prices, stock, publication flags, customer records and provider capabilities are never populated or changed by this content adapter.
- Corrected pack sizes, serving bases, ingredient amounts, other ingredients, nutrition, directions, cautions, allergens, storage and named manufacturers. Label facts do not establish lab testing, certifications or ingredient-origin claims.
- Removed the design-only content adapter from the entry page, including fictional feedback, incorrect demo pack counts, fictional manufacturing entries and demo business information.
- Corrected the contact number to +91-9274248974 from all seven supplied labels. Email remains care@bodycafeco.com. The marketer/address is identified explicitly as printed on the labels; GST, grievance officer, support hours and reply targets remain unconfirmed.
- Admin storefront and product links open E. Shared homepage media helpers support uploaded catalogue images and new products without generating nonexistent render paths. Existing cap artwork is retained.
- Cart pack information now comes from the catalogue, consistent with product pages.

## Source record

Primary: `../Full FInal Label/Full Final Label.ai`, a seven-page PDF-compatible master. Its text was extracted read-only with pypdf. The standalone PDFs contain no extractable label text; the standalone Inositol reference is blank. Existing production label reference images and gallery README records were cross-checked. Inositol uses master page 5, also transcribed in its production reference text. No source artwork was modified.

| Product | Master page | Pack | Serving basis |
|---|---:|---|---|
| Vitamin D3 + K2 | 1 | 60 softgels | 1 softgel |
| Omega-3 Fish Oil | 2 | 60 softgels | 1 softgel |
| L-Theanine | 3 | 30 capsules | 1 capsule |
| Iron Bisglycinate | 4 | 60 capsules | 1 capsule |
| Myo & D-Chiro Inositol | 5 | 90 capsules | 3 capsules |
| Creatine Chews | 6 | 60 chewable tablets | 2 tablets |
| Psyllium Husk | 7 | 150 capsules | 5 capsules |

The displayed prices remain the current project price sheet. The artwork leaves MRP variable, so it does not independently confirm selling prices or tax rates.

## Verification

- 100 Python tests passed: domain, HTTP, operations, account, support, lots, catalogue prices, commerce, identity, reviews, feedback and media.
- Finalized-theme, admin-link, catalogue-media and label-default regression checks passed. Checks verify that admin edits and commerce fields survive enrichment and that the original API objects are not mutated.
- All frontend JavaScript syntax checks passed.
- Static export and hosted-preview API/publish-boundary checks passed.
- Connected export built successfully with E, sourced label content and the existing Supabase API proxy, without the static API adapter or design-only content adapter.
- Browser: 28 routes at 320, 390, 768 and 1440 pixels (112 combinations), then 14 targeted content/commerce rechecks. No horizontal overflow or heading-count failures; no broken sourced images in the initial sweep. Browser console error/warning capture was empty at the checked point.
- Browser flows: product quantity; add to bag; server-quoted cart increase/removal; guest checkout with synthetic details; simulated failed payment and successful retry; order confirmation; mobile menu and Escape; softgel filter and descending price sort; product search; product/lot lookup; support case creation; local OTP verification and guest order/case recovery into an account.
- Populated mobile cart and checkout also checked for overflow. E storefront screenshots saved in `.local/variant-e-review/` alongside detailed browser results. All transactional browser tests use a separate `.local/variant-e-review.sqlite3` database, not the existing preview database or hosted records.

## Review preview and launch boundary

Run the bundled Python or another working Python 3.9+ runtime:

```sh
python3 -B app/server.py --port 4180 --db .local/variant-e-review.sqlite3
```

Review: http://127.0.0.1:4180/?design=e . The server is running for this review. The browser was left on the homepage, signed out, with an empty bag.

Live payments, SMS OTP and courier booking remain unconfigured; local transactions are explicitly simulated. The connected export retains hosted ordering/sign-in restrictions. Final price/GST/shipping rules, COD, policy text, full business/grievance details, publishable lot documents and any certifications still require business/provider inputs. No invented final trading terms were added. This is a review build, not a completed commerce launch.

## Admin review follow-up

The isolated QA database has no admin credentials. After completing transactional tests, the running server on port 4180 was switched to `.local/preview.sqlite3` so the existing local `bodycafe.com` admin account and records are available. The admin session endpoint returns `configured: true`. No password was changed or copied. Hosted Supabase authentication remains separate. To reproduce the interactive admin preview, run the command above with `--db .local/preview.sqlite3`; retain the isolated database for disposable transaction tests.
