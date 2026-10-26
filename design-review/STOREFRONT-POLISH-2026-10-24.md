# Storefront polish — 24 October 2026

Requested scope: equal bottle sizes on Variant A's Shop, padding around its active header link, supplied MRPs, real contact details, and dummy content across all customer-facing pages.

## Catalogue and contacts

| Existing product | MRP |
|---|---:|
| Iron Bisglycinate | ₹899 |
| L-Theanine | ₹1,699 |
| Vitamin D3 + K2 | ₹1,049 |
| Omega-3 Fish Oil | ₹1,949 |
| Myo & D-Chiro Inositol | ₹1,499 |
| Creatine Chews | ₹749 |
| Psyllium Husk / Isabgol | ₹949 |

Source: the user's uploaded price sheet. Magnesium Bisglycinate (₹1,399) and Beetroot (₹1,749) are not added: they are not existing catalogue products and have no supplied product artwork in this implementation.

The catalogue seed and a versioned one-time migration update existing preview product prices while preserving other record fields, old order snapshots and subsequent Operations edits. Static exports seed the same prices. Contact: +91-8457125489 and care@bodycafeco.com, with native tel/mailto links on Contact and all themed footers. The supplied phone is not assumed to be a WhatsApp channel.

## Visual changes

Shop reuses the transparent-image bounds normalization from the existing A product cards. Bottles have matching visible heights without stretching their proportions. The active A header link gains 18px horizontal padding and a 9px index/label gap. Earlier product-card and Curiosity Cabinet fixes remain.

## Dummy content

`web/demo-content.js` centralizes removable design fixtures for pack counts, fictional customer feedback, sourcing entries, demonstration batch metadata, business information, support hours and policies. Real contacts and supplied prices remain distinct from invented fixture content. A single top preview notice identifies dummy content and simulated checkout. Fictional feedback is explicitly labelled and never inserted into review records or represented as verified purchases. No clinical doses, laboratory assessments, certifications or licence numbers are invented. Operational API guards remain intact.

The presentation adapter replaces exact placeholder phrases in text nodes, excludes scripts, styles, code and input content, and fills nonclinical definition-list fields. Interactive Shop rendering and asynchronous product feedback use the fixtures directly. Remove the fixture adapter and supply approved records before production launch.

## Verification

- 44 catalogue, commerce, bag/account and HTTP tests passed. New tests cover uploaded MRPs and idempotent updates of existing catalogue records; existing totals/rounding checks use the new prices.
- Browser audit of 16 customer routes: no page JavaScript errors or horizontal overflow; targeted placeholder wording removed.
- Shop, product and contact checks at 1440, 768, 390 and 320px passed: equal visible bottle heights, header padding, new-price sorting, dummy pack details/feedback and native contact links.
- JavaScript syntax checks, diff whitespace checks and hosted-preview API/publish-boundary checks passed.
- Static export rebuilt. No deployment performed.

Local QA scripts, audits and screenshots: `.local/storefront-20261024/` (ignored by Git).
