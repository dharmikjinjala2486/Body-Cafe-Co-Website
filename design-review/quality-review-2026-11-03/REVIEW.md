# Quality page review — 3 November 2026

Reviewed deployed `/standards?design=e` at 1440 × 900 and 390 × 900, all seven record selections, Checks navigation, and expanded disclosures. This is an audit; no website source was changed.

## Direction

Match the simpler Home, Shop, product and Super Sevens pages: useful facts first, one product selection, shorter headings, fewer decorative labels and repeated explanations. Retain honest distinctions between label statements and published supporting evidence.

## Confirmed findings and recommendations

| Priority | Finding | Recommended improvement |
|---|---|---|
| High | The FAQ says approved labels have not been published, while the product record says label facts are published. It also says capsule/softgel materials are unconfirmed. | Reconcile FAQ with each current approved label. Link to that product's actual allergens, other ingredients and dietary information. |
| High | Clicking Checks navigates to `#chain`; `details#checks` stays closed. Source uses the same generic destination. | Link directly to the intended disclosure and open it, with the heading visible below the site header. |
| High | Selecting any of the other six products changes the top record, but the ingredient explorer stays on Creatine Chews. | Use one shared product selection or merge the ingredient facts into the main product record. |
| High | Formula says “Partly published” even though the selected record says its label facts are published. Certification rows mix label claims with unpublished certificates. | Distinguish label facts, manufacturer, ingredient origin, reports and certificates consistently. State “Label states GMP certified; certificate not published” rather than an ambiguous status. |
| Medium | Label amounts, manufacturer, origin status and lot explanations appear multiple times. | Keep one concise product record; link to full label directions on the product page. Put supporting detail in disclosures. |
| Medium | “How we work, and what is still to come.” occupies a separate divider between sections without its own content. | Remove this divider. |
| Medium | Four numbered stages, four disclosures, a second explorer and three numbered communication principles create a long reading task. | Compress the chain to a small visual or disclosure; remove decorative numbering and repeated captions; move communication principles into a short FAQ/disclosure. |
| Medium | Lot section uses a schematic and promises a future final-label photograph. It repeats three steps and all seven product links. | Use a verified annotated pack image when available; otherwise use short accurate instructions. Carry the selected product into one “Check your lot” action. Do not imply reports exist merely because lookup is available. |
| Medium | Many tiny uppercase metadata labels, long manufacturer/licence lines and multiple status panels compete with the main facts. | Use readable sentence-case labels, one consistent card style and spacing; make licence numbers secondary but accessible. |

## Suggested page flow

1. Short hero: “Know what’s in your bottle.” Supporting line: “Label facts, makers and available lot records.”
2. One product selector and one product record: ingredient form/amount, maker, published label link and explicit document status.
3. Makers: three concise cards; licence information on expansion.
4. Check your lot: concise instructions and one action carrying the selected product.
5. Short Quality FAQ: sourcing, testing, certification and lot-report scope. Supporting explanations on demand.

Keep the site's seven-colour identity and named makers. Do not replace unavailable documents with badges or claims. Preserve access to material label facts while reducing repeated prose.

## Evidence

- Full page height including site header/footer: 6,610 px desktop; 9,331 px phone.
- No horizontal document overflow at either tested width.
- All seven top selectors show exactly one matching record; lower selector remains independently on Creatine Chews.
- `audit.json` records rendered text, headings, disclosure titles and interaction results.
- Screenshots: `quality-1440.png`, `quality-390.png`, `quality-expanded-1440.png`.

Source note: the intended obsolete divider cleanup in `web/standards-v2-e.js` targets `.ezx-method`, while the rendered divider uses `.ezx-method-t`. No fix applied during this review.
