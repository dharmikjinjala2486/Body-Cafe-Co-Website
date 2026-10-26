# Variant F — selective Boon-inspired homepage improvements

Implemented only in `web/site-f.js` and `web/site-f.css`. Existing work in other files was left intact. Reference: https://helloboon.com/business/.

- Clearer hero introduction and primary Shop the collection action.
- Seven product cards with ingredient, format, current catalogue price, Explore product and the existing Add to bag action. Four columns on desktop, two on tablet/phone, one below 361px.
- Three concise routes into Ingredients, Product labels and Testing records, replacing the longer homepage ledger. Dedicated Standards and Learn pages remain the source of detail.
- Accessible inline SVG lot-number illustration, three lookup steps and the existing working lot form. The illustration explicitly discloses that the final code position awaits approved packaging.
- Removed the empty customer-voices section from F's homepage.
- Added format, label, storage and lot FAQs alongside ordering questions.
- Fixed entered lot-code contrast on the dark panel.

No lifestyle photography was supplied, so existing product images remain. Real photography and approved customer reviews can be added when available. No fabricated outcomes, certifications, laboratory documents or customer endorsements were added. The site remains a design preview; no deployment was performed.

## Verification

- `node --check web/site-f.js` and scoped `git diff --check` passed.
- Browser checks at 320, 390, 768 and 1440 CSS pixels: no horizontal document overflow; one main H1.
- Seven product cards and no customer-voices section; no broken loaded homepage images.
- Checked desktop and phone layouts visually, including the lot illustration.
- Ingredient tab selection and FAQ disclosure worked.
- Product card opened Iron Bisglycinate with `design=f` retained.
- Ingredient guide opened `/learn/ingredient-forms?design=f`.
- Selecting Vitamin D3 + K2 and using the demo control filled DEMO-03-01. Submission opened `/reports/vitamin-d3-k2/DEMO-03-01?design=f` with the matching demonstration record.
- Verified the corrected lot input computes to light text on the dark background.
- Browser error log was empty at completion of the interactive checks.
- Screenshot: `design-review/variant-f-boon/lot-guide-desktop.png`.
