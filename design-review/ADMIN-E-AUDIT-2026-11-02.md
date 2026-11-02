# Admin and Variant E integration audit — 2 November 2026

## Implemented

- Admin always selects Variant E, removes irrelevant `design` queries on `/ops`, and sends storefront links to E. Product links retain the seven printed QR paths. A–H remain available as local design previews; they do not have separate admin databases.
- Product creation is removed from the overview, product list and direct editor route. Both the local backend and hosted API reject creation. The new PostgreSQL migration makes the admin save procedure update existing products only.
- All seven products remain visible in the catalogue editor, including hidden products and saved drafts. Product identifiers stay fixed to protect printed QR codes; SKU, name, price, category, format, colour and pack data remain editable.
- Added editable E headline, introduction, ingredient form, why-this-form explanation, story, quality summary and note, defining-detail title, Super Sevens name and description, and the four-word homepage highlight.
- Added editable pack category, description, claim, diet mark, barcode, badges, customer-care text, pack-printed text, timing and directions tag. Supplement facts have editable ingredient/nutrient rows, amounts, %RDA, indentation, active-ingredient flags, serving and footnotes, with add/remove row controls.
- Existing directions, cautions, allergens, storage, sourcing, manufacturer/licences, FAQs, sources, related products, SEO and image controls remain connected. E-specific sections now use saved product fields rather than unconditional reference constants. Admin defaults load the supplied label records and existing reference content while retaining explicit stored edits and blanks.
- Existing default FAQs, related products and gallery assets are shown in the editor before the first edit. Saving a price change does not silently remove those sections. Draft preview includes the structured pack details and fact table.
- Label diagrams are suppressed when the current amount, serving, pack or directions differ from the label used to draw them. Artwork is not silently rewritten to imply a changed formula.
- Added local and hosted validation for E content, structured label fields, short homepage highlights and image dimensions. Hosted draft saves preserve stored metadata when fields are omitted.
- Removed storefront page transitions from admin navigation; rapid clicks between operational sections now render reliably.

## Verification

| Area | Result |
| --- | --- |
| Full local backend suite | 103 tests passed, using temporary databases and loopback HTTP servers |
| Hosted API/auth/content validation | 46 checks passed against isolated mocked service responses |
| PostgreSQL transactions and migrations | 33 checks passed in PGlite, including rejection of new products and preservation of structured label data |
| Media validation | PNG/JPEG/WebP orientation, dimension, metadata and animation fixtures passed |
| Storefront defaults, E targeting and admin links | Passed |
| Final label records, PDP reference defaults and QR paths | Passed |
| Browser admin navigation | Overview, Orders, Sales, Products, Inventory, Lot reports, Support & safety, Reviews & questions, Channels and Feature flags all loaded |
| Browser product editors | All seven loaded ten editor panels and all 67 label fact rows; no add-product link, direct `product=new` route rejected |
| Browser draft lifecycle | Saved a headline, story, pack description and fact-table footnote in a disposable database; public page stayed unchanged until publish, then E displayed all four edits |
| Browser structured editor | Added and removed a supplement-fact row; saved preview showed the eight iron fact rows and edited footnote |
| Connected preview export | Rebuilt in `dist/` |

The browser QA used a separate disposable server/database on port 4188. It did not publish test content to the user's store. The existing port 4174 local preview was restarted with its original database and administrator account.

## Hosted status and remaining external work

A read-only request to the hosted `/api/health` returned `ok: true`, mode `hosted-preview`, release `20261029-supabase-v1`. The hosted service is reachable, but this audit has **not** deployed the new API code, SQL migration or frontend build.

For the hosted store, deploy `supabase/functions/operations` and apply `supabase/migrations/202611020001_existing_product_editor.sql`, then publish the matching connected frontend export. Authenticated hosted save/publish acceptance must follow deployment; local/browser and mocked hosted tests are not proof of a live deployment.

Live payment capture/refunds, courier booking, external email/WhatsApp delivery and marketplace synchronization remain unconfigured. The portal presents those provider states; this work does not enable them. Local transactional tests exercise preview behavior.
