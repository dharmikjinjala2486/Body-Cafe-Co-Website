# Audit coverage

26 October 2026. These are rendered layout/content observations, not 1,216 end-to-end transaction tests. The main report explains the interactive samples and limitations.

## Base routes

| Route | Desktop variants observed | Phone variants observed |
|---|---|---|
| `/` | ABCDEFGH | ABCDEFGH |
| `/shop` | ABCDEFGH | ABCDEFGH |
| `/products/iron-bisglycinate` | ABCDEFGH | ABCDEFGH |
| `/products/l-theanine` | ABCDEFGH | ABCDEFGH |
| `/products/vitamin-d3-k2` | ABCDEFGH | ABCDEFGH |
| `/products/omega-3-fish-oil` | ABCDEFGH | ABCDEFGH |
| `/products/myo-d-chiro-inositol` | ABCDEFGH | ABCDEFGH |
| `/products/creatine-chews` | ABCDEFGH | ABCDEFGH |
| `/products/psyllium-husk` | ABCDEFGH | ABCDEFGH |
| `/bundles` | ABCDEFGH | ABCDEFGH |
| `/bundles/daily-edit` | ABCDEFGH | ABCDEFGH |
| `/bundles/curious-edit` | ABCDEFGH | ABCDEFGH |
| `/standards` | ABCDEFGH | ABCDEFGH |
| `/about` | ABCDEFGH | ABCDEFGH |
| `/story` | ABCDEFGH | ABCDEFGH |
| `/learn` | ABCDEFGH | ABCDEFGH |
| `/learn/glossary` | ABCDEFGH | ABCDEFGH |
| `/learn/iron-bisglycinate` | ABCDEFGH | ABCDEFGH |
| `/learn/l-theanine` | ABCDEFGH | ABCDEFGH |
| `/learn/vitamin-d3-k2` | ABCDEFGH | ABCDEFGH |
| `/learn/omega-3-fish-oil` | ABCDEFGH | ABCDEFGH |
| `/learn/myo-d-chiro-inositol` | ABCDEFGH | ABCDEFGH |
| `/learn/creatine-chews` | ABCDEFGH | ABCDEFGH |
| `/learn/psyllium-husk` | ABCDEFGH | ABCDEFGH |
| `/learn/reading-a-label` | ABCDEFGH | ABCDEFGH |
| `/learn/understanding-evidence` | ABCDEFGH | ABCDEFGH |
| `/learn/ingredient-forms` | ABCDEFGH | ABCDEFGH |
| `/learn/serving-sizes` | ABCDEFGH | ABCDEFGH |
| `/learn/understanding-reports` | ABCDEFGH | ABCDEFGH |
| `/reports` | ABCDEFGH | ABCDEFGH |
| `/cart` | ABCDEFGH | ABCDEFGH |
| `/checkout` | ABCDEFGH | ABCDEFGH |
| `/sign-in` | ABCDEFGH | ABCDEFGH |
| `/account` | ABCDEFGH | ABCDEFGH |
| `/account/addresses` | ABCDEFGH | ABCDEFGH |
| `/account/cases` | ABCDEFGH | ABCDEFGH |
| `/help` | ABCDEFGH | ABCDEFGH |
| `/contact` | ABCDEFGH | ABCDEFGH |
| `/settings` | ABCDEFGH | ABCDEFGH |
| `/policies/shipping` | ABCDEFGH | ABCDEFGH |
| `/policies/returns` | ABCDEFGH | ABCDEFGH |
| `/policies/cancellation` | ABCDEFGH | ABCDEFGH |
| `/policies/privacy` | ABCDEFGH | ABCDEFGH |
| `/policies/terms` | ABCDEFGH | ABCDEFGH |
| `/search` | ABCDEFGH | ABCDEFGH |
| `/preview/states` | ABCDEFGH | ABCDEFGH |

## Additional states

| Route/state | Desktop variants observed | Phone variants observed |
|---|---|---|
| `/checkout?state=sample` | ABCDEFGH | ABCDEFGH |
| `/checkout?state=errors` | ABCDEFGH | ABCDEFGH |
| `/checkout?state=unavailable` | ABCDEFGH | ABCDEFGH |
| `/payment/SAMPLE-1042?state=pending` | ABCDEFGH | ABCDEFGH |
| `/payment/SAMPLE-1042?state=failed` | ABCDEFGH | ABCDEFGH |
| `/payment/SAMPLE-1042?state=paid` | ABCDEFGH | ABCDEFGH |
| `/payment/SAMPLE-1042?state=expired` | ABCDEFGH | ABCDEFGH |
| `/payment/SAMPLE-1042?state=unavailable` | ABCDEFGH | ABCDEFGH |
| `/orders/SAMPLE-1042?state=paid` | ABCDEFGH | ABCDEFGH |
| `/orders/SAMPLE-1042?state=shipped` | ABCDEFGH | ABCDEFGH |
| `/orders/SAMPLE-1042?state=delivered` | ABCDEFGH | ABCDEFGH |
| `/orders/SAMPLE-1042?state=cancelled` | ABCDEFGH | ABCDEFGH |
| `/account?state=signed-out` | ABCDEFGH | ABCDEFGH |
| `/account?state=code` | ABCDEFGH | ABCDEFGH |
| `/account?state=empty` | ABCDEFGH | ABCDEFGH |
| `/account?state=orders` | ABCDEFGH | ABCDEFGH |
| `/account/addresses?state=sample` | ABCDEFGH | ABCDEFGH |
| `/account/cases?state=sample` | ABCDEFGH | ABCDEFGH |
| `/contact?state=errors` | ABCDEFGH | ABCDEFGH |
| `/contact?state=submitted` | ABCDEFGH | ABCDEFGH |
| `/contact?state=unavailable` | ABCDEFGH | ABCDEFGH |
| `/reports?product=vitamin-d3-k2&lot=DEMO-03-01` | ABCDEFGH | ABCDEFGH |
| `/reports?product=vitamin-d3-k2&lot=UNKNOWN` | ABCDEFGH | ABCDEFGH |
| `/reports?product=vitamin-d3-k2&lot=DEMO-UNPUBLISHED` | ABCDEFGH | ABCDEFGH |
| `/reports?product=vitamin-d3-k2&lot=DEMO-WITHDRAWN` | ABCDEFGH | ABCDEFGH |
| `/reports?product=vitamin-d3-k2&lot=DEMO-OUTAGE` | ABCDEFGH | ABCDEFGH |
| `/shop?format=Softgels` | ABCDEFGH | ABCDEFGH |
| `/shop?format=Gummies` | ABCDEFGH | ABCDEFGH |
| `/search?q=omega` | ABCDEFGH | ABCDEFGH |
| `/search?q=xyz` | ABCDEFGH | ABCDEFGH |

## Other checks

- 144 responsive samples: six important routes in A–H at 320, 768 and 1024 pixels.
- 24 operations samples: 12 shared Viewer sections at desktop and phone width.
- 74 existing automated tests passed.
- Initial loading observations were rechecked; see settled-rechecks.json.
- See REPORT.md for what was and was not functionally exercised.
