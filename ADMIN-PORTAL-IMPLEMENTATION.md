# Variant B operations portal — local build, revision 2

28 October 2026. Variant B is the active storefront. Claude designed the revised admin UI in the **Body Cafe Co Website** project; Codex integrated it with the existing Python/SQLite backend and verified the workflows.

## Access and persistence

Open `http://127.0.0.1:4192/ops`. The sole admin login is `bodycafe.com`; the supplied password is stored only as a scrypt hash. Customer and admin sessions are separate HttpOnly/SameSite cookies. Login rotates sessions, failed attempts are rate limited, and changing the password revokes existing admin sessions. No admin signup or second account exists.

Run `python -B app/server.py --port 4192 --db .local/preview.sqlite3` with Python 3.12. The development server binds to loopback and refuses live mode. Local credential recovery: stop the server and run `app/admin_setup.py --username bodycafe.com --reset`, entering the replacement password privately. `app/admin_backup.py` backs up the database and uploaded assets with an integrity check.

## Connected workflows

- Navigation: Overview, Orders, Sales, Products, Inventory, Lot reports, Support & safety, Reviews & questions, Channels, Feature flags. Analytics redirects users to Sales. Audit history and Approvals pages, queues and mutation endpoints are removed. Old private database records are preserved for recovery; pending approval requests are retired without applying them.
- Products: create products and edit the full product page content through eight form tabs, including price, name, description, purpose, ingredients/label facts, serving information, directions, suitability, warnings, quality/sourcing, FAQs, reference links, related products and search metadata. Save private drafts, preview and publish explicitly. Product IDs remain stable. Purchased product names/prices remain historical snapshots.
- Images: upload JPEG/PNG/WebP; set alt text, labels and captions; reorder or hide images. The first visible image is the website primary image, the second is the shop alternate image. The product gallery uses the visible order. New publication requires at least one visible image; draft uploads remain private.
- Lot reports: choose Product then Lot; the second selector lists only that product’s batches. Upload PDFs, images or both. Choose the public document/summary/results/laboratory/date sections and fill only the selected sections’ required fields. Direct publish, versioned corrections, source-file integrity checks and reasoned withdrawal are supported. Files remain private until publication. Batch-notice requests are removed. DEMO lots remain labelled demonstrations.
- Inventory: product-grouped batches with on-hand, reserved, available and unsellable counts; low-stock thresholds, expiry alerts, storage labels, quarantine/release, receipts, damage, write-offs and physical-count corrections with remarks. Contextual stock movements remain available. Damaged units remain physically on hand and cannot be sold. Multiple warehouses/transfers and returned-goods inspection are not implemented.
- Orders: persistent list/detail, customer and address, purchased-price snapshot, allocated batches, payment/fulfillment, remarks, courier/tracking and validated status transitions. Customer-visible updates and internal notes are separate. Cancelled paid orders can receive a full simulated refund; partial and live refunds are unsupported.
- Checkout reserves stock atomically by earliest eligible expiry, prevents overselling, excludes expired/quarantined/unreleased batches, releases expired unpaid reservations and restores cancelled allocations exactly once. Payment capture does not deduct stock twice. Shipping removes committed allocations from physical on-hand stock.
- Sales: daily, Monday-based weekly and monthly groups, inclusive India-time date filters, product filters, paid order totals, units, discounts, shipping, refunds, average order value, chart and aggregate CSV exports. Unpaid/failed payments are excluded. Receipts count at payment capture; completed refunds count on the refund date. Net sales = gross item value − discounts + shipping − refunds; it is not profit. Integer allocations reconcile product totals, including discount/shipping/refund rounding.
- Support, safety, review/photo moderation, questions and replies retain their existing workflows. Feature switches enforce checkout and submission restrictions on the server. Channels accurately report disconnected integrations.

## Verification and limits

100 automated tests pass, covering credentials, sessions, authorization/CSRF, product publication and drafts, content validation, report privacy/publication and files, stock conservation, concurrency/idempotency, purchased-price preservation and sales/refund date/rounding rules. Eight changed JavaScript files pass syntax checks. Browser checks used an isolated disposable database for product publication, storefront content, image report upload/publication and stock adjustment; responsive inventory, products, reports and sales were checked at 390px and normal desktop sizing. QA records are not copied into the working database.

Payments/refunds remain simulated. Real payment gateways, courier booking/webhooks, OTP delivery, messaging and marketplace synchronization need selected providers and server credentials. Production hosting/HTTPS, scheduled backups, tax/settlement accounting, returns inspection, partial refunds and real opening stock/approved labels/lab evidence remain launch work. No Git push or deployment is performed.

Claude UI conversation: https://claude.ai/chat/9d9f26c0-dcfe-4695-9f5a-b2a884ac1af5 . Only authorized frontend source and the design brief were shared; no credentials, database or customer records were shared.
