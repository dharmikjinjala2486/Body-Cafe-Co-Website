# Site copy and approval ledger

This ledger covers the page copy written for the four-direction website (baseline `cf8376f`). The copy itself lives in `web/site.js` (`window.BCCSite`), so every direction carries the same facts and each direction arranges them in its own way. This file sits outside the reading flow. It records where each statement comes from, what is sample data versus approved, and exactly what is still missing.

## How to read status on the site
- **Awaiting approved label**: `BCCSite.STATUS.label`. This appears next to any value that only the approved rear label can supply: amount per serving, serving size, pack count, directions, cautions, allergens, storage and manufacturer.
- **Sample price / sample record / sample state**: illustrative values. They are never presented as final.
- **Policy section tags**:
  - *Working direction*: an intended approach, not final terms.
  - *Unresolved*: an open business decision.
  - *Preview behaviour*: what the prototype actually does.
- **Synthetic fixture**: `?state=` visual states built from `BCCSite.fixtures`. They use fictional names and addresses, and their controls are disabled.

## Sources of factual statements

| Statement area | Source | Used on |
|---|---|---|
| Product names, ingredients in view, formats, cap colours, subtitles, sample prices, stock | Existing catalogue in `app/server.py` and the static `catalog-preview.json` (unchanged) | All shop, product, bundle, bag, note and search surfaces |
| What an Indian health-supplement label carries (name, nutritional information, ingredients, directions, warnings, lot, dates, manufacturer details; the "not for medicinal use" statement) | FSS (Health Supplements, Nutraceuticals…) Regulations, 2016 — FAO FAOLEX copy, version dated 29.09.2021, Reg. 6(3): https://faolex.fao.org/docs/pdf/IND168163.pdf | Guide "Read a label with confidence" |
| Iron compounds differ in elemental iron (ferrous fumarate 33%, ferrous sulfate 20%, ferrous gluconate 12%) | NIH ODS Iron fact sheet: https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/ | Guide "Why ingredient forms matter"; Iron note |
| 1 mcg vitamin D = 40 IU; D2 and D3 forms | NIH ODS Vitamin D: https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/ | Forms guide; Vitamin D3 + K2 note; glossary |
| Vitamin K forms K1 and K2 (MK-4, MK-7) | NIH ODS Vitamin K: https://ods.od.nih.gov/factsheets/VitaminK-HealthProfessional/ | Forms guide; Vitamin D3 + K2 note |
| A typical 1,000 mg fish-oil supplement has about 180 mg EPA and 120 mg DHA; amounts vary; omega-3 forms | NIH ODS Omega-3: https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/ | Forms guide; Omega-3 note |
| Creatine monohydrate is about 88% creatine by weight | NIH ODS Exercise and Athletic Performance: https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/ | Forms guide; Creatine Chews note |
| What a lot report should identify and what it cannot prove | Editorial explanation; no specific laboratory, method or result is named | Reports page, "What a lot report shows" guide, standards |
| Lot lookup states (match, not found, unpublished, withdrawn, outage) | Existing preview behaviour and demo records (unchanged) | Reports in all directions |

No author or reviewer is credited, and no review date is shown. Each guide states that it is general information, not personal advice. The NIH figures are general reference values. They are presented as examples, never as the specification of a Body Café Co. product.

## Page copy written in this pass (all in `web/site.js`)

| Page family | What was written |
|---|---|
| Shop | Lede; three-step selection guidance; no-match copy; care note; compare-table title and note |
| Edits (bundles) | Lede; status ("examples, not a recommendation to take together; no bundle rules or savings approved"); three "why edits exist" points. Totals are the plain sum of sample prices. |
| Search | Lede; six catalogue-based hint terms; no-results recovery; report-intent callout |
| Standards | Lede; intro; five pillars (title, summary, body, three points, *Where it stands today*); documented / planned / won't ledger |
| Story | Lede; opening; four chapters (Why a café?, Who it's for, Seven on the counter, Playful never vague); four promises; three refusals; founder slot text and missing inputs. No biography, date, facility or credential. |
| Learn | Lede; intro; four topics; seven-term glossary |
| Guides ×3 | Summary, opening, four or five takeaways, four or five sections, an illustrative worked example (clearly labelled), a checklist, related reading and sources |
| Ingredient notes ×7 | Lead; four "what to check" items per product; a compound/active note where a primary source supports it (iron, D3 + K2, omega-3, creatine); sources |
| Reports | What a report is; three steps; record hierarchy (five parts); five state messages; limits; lot-location status; demo note |
| Bag | Empty state; note; next links |
| Checkout | Lede; step names; three "then what" steps; privacy microcopy; COD status (unresolved, ₹150 mechanism undecided) |
| Account | Lede; sign-in and OTP preview copy |
| Help | Lede; six topics (orders, returns, labels, reports, account, safety); eleven FAQs |
| Contact | Lede; channels marked "to be confirmed"; privacy; safety guidance |
| Policies ×5 | Plain-language summary plus three or four tagged sections each (see below) |
| Preferences | Always-on and optional groups with descriptions |
| 404, unavailable, offline | Recovery copy in every direction |

### Policy drafts: what is and isn't decided

| Policy | Working direction | Unresolved (deliberately not decided) | Preview behaviour |
|---|---|---|---|
| Shipping | One active warehouse; Vayuvega and Shipneer named as the working-plan partners (source: Website-Final-Plan.md, subject to API fit) | Serviceability and delivery estimates; cash on delivery (₹150 advance versus fee plus courier charge) | Illustrative ₹75 charge, waived from a ₹1,499 sample subtotal (stated as not the approved policy) |
| Returns | Requests handled as support cases; safety is always a separate priority case | Eligibility, window, return shipping and remedies. **The historical seven-day proposal is not adopted.** | Refunds need a second admin's approval and move no money |
| Cancellation | Cancellation before shipment is initiated | Exact boundary; self-service versus support approval | Cancel while pending or paid; refunds after cancellation |
| Privacy | Separate, unticked email and WhatsApp choices | Retention schedule, contact details, final notice | Local SQLite storage; use sample data |
| Terms | — | Final terms of sale, disclosures, taxes, product information | Not a live store; nothing real happens |

Rewards, referrals, approved bundles, launch sequencing and the provisional items Q28, Q44, Q46, Q47, Q48 and Q49 are not written up as decisions anywhere.

## Sample versus approved fields

| Field | Status on site |
|---|---|
| Prices | Sample (labelled "Sample price" everywhere) |
| Delivery charge and the "Free" threshold in the summary | Existing prototype sample rule; labelled "Sample delivery". Not a free-shipping promise. |
| Discount `PREVIEW10` | Sample code, existing behaviour |
| Stock | Preview stock |
| Amount per serving, serving size, pack count, directions, cautions, allergens, storage, manufacturer | **Awaiting approved label** |
| Approved product purpose / benefits | Not supplied; not written |
| Lot records `DEMO-0X-01` and other sample lots | Sample records; no laboratory document is connected |
| Orders, payments, cases and addresses in fixtures | Synthetic (SAMPLE-1042, SAMPLE-1037, SAMPLE-CASE-01, fictional "Sample Customer") |
| Support channels (WhatsApp, email, phone) | "To be confirmed"; no numbers or hours given |
| Reviews | None published; an honest empty state is shown |

## Missing approvals and assets (exact requests)

1. **Approved rear labels for all seven products.** Needed for amount per serving, serving size, units per pack, directions, cautions, allergens, storage, manufacturer and FSSAI details.
2. **Approved product purpose statements** for each product, if any are to be made.
3. **Lot-number location guide**: where the lot sits on each pack (a photo or diagram per format).
4. **Real lot reports**: publishable source documents, report versions and the withdrawal-notice process.
5. **Founder story in the founder's own words**, founder and team portraits, and approval to publish names and roles.
6. **Original photography**: product-in-hand, rear-label close-ups, and a consistently framed Vitamin D3 + K2 mockup (it is currently tighter than the other six).
7. **Support contacts**: WhatsApp business number, support email, phone number and hours, and the response-time commitment.
8. **Final policies**: shipping/serviceability and delivery dates, returns (eligibility, window, remedies), cancellation cut-offs, privacy notice and processors, and terms.
9. **COD decision**: ₹150 advance versus fee plus courier charge.
10. **Bundles**: whether edits exist at launch, their rules and any savings.
11. **Rewards and referrals**: undecided; nothing is shown.
12. **Guide review**: a qualified reviewer for the three guides and seven notes, before any author or reviewer credit or date is shown.

## Copy changed for accuracy during this pass
- **Omega-3 note.** The line "This product is not suitable for anyone avoiding fish" was replaced with: "Check these first if you avoid fish or other animal products; the approved label will state them." The original was a suitability claim inferred from the ingredient name.
