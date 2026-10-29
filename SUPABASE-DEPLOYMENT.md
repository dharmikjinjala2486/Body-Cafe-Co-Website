# Netlify + Supabase operations build

29 October 2026. Supabase project: **Body Cafe Co Website**, reference `dzsglgcagghinjevdbnw`. Target Netlify project: `body-cafe-co-website`. Current API release: `20261029-supabase-v1`.

## Configured

- SQL migrations applied; private bucket `bcc-private` created. Seven current products and fourteen DEMO batches imported with opening physical balances and migration ledger entries. Local demonstration orders, customer records and private cases were not imported; cloud orders start empty.
- The owner confirmed the new Auth user as the sole administrator, mapped to username `bodycafe.com`. `bcc_admin` enforces a singleton. Passwords stay in Auth. No local password/hash, database password or service key was extracted or published.
- All application tables enable RLS. Anonymous/ordinary authenticated clients have no direct table privileges. Mutating RPCs are server-only. The operations Edge Function verifies the caller before using its automatic server credential.
- The owner approved disabling the legacy JWT gateway check for cookie-based application authentication. Public catalog/report reads are accessible; admin/private access still requires the appropriate verified session.
- Admin cookies are HMAC-sealed, HttpOnly, Secure, SameSite Strict and bounded by Auth token expiry. Every request checks Auth and the singleton's session version. Password changes and logout invalidate prior admin cookies. Writes also require the session CSRF token and allowed Origin.
- Images are identified by bytes, limited, stripped of identifying metadata and checked for animation; JPEG orientation is retained. PDFs reject active/encrypted content. Files stay private until their source record is published and are checked against SHA-256 before serving.
- Selected report sections are validated and hidden fields scrubbed from public responses. Publication retains version history; withdrawals retain their reasons.

## Stock and sales

Database transactions handle deterministic locks, FEFO allocation, server-side prices, retry identifiers, expiry and cancellation releases, and damage/on-hand conservation. Capture does not deduct stock twice. The admin fulfillment HTTP API cannot mark orders paid. Real payment capture needs a verified provider adapter; checkout defaults OFF and the hosted API refuses new orders until integration is complete.

Sales use payment capture/refund timestamps in India time and Monday-based weeks. Integer discount, shipping and refund allocations reconcile to order totals. Net sales include shipping and are not profit. DEMO inventory is demonstration content and does not establish real laboratory evidence or real opening stock.

## Verification and status

30 PostgreSQL migration/transaction/access checks and 39 API/auth/catalog/report/sales/session checks pass using synthetic fixtures. JPEG/PNG/WebP tests cover dimensions, orientation, metadata removal and unsupported/animated files. Static and connected exports were checked for routing order, Variant B/admin assets and private-file publication boundaries. The original local Python suite has 100 passing tests.

Live API checks confirmed health, seven-product catalog, configured admin login state, exact product/lot lookup, unauthenticated admin denial and unavailable private files. Final Netlify publication and authenticated browser acceptance are checked during deployment; use the chat's final status for completed acceptance checks. Source modules are under `supabase/functions/operations`; the dashboard bundle concatenates those tested modules and the environment-only entry point.

## Remaining commerce launch work

Payment/refund, phone OTP, courier and external messaging providers remain unconnected. No simulated OTP is exposed online. Hosted ordering remains paused. Returns inspection, partial refunds, warehouse transfers, settlement/profit accounting and automated production backups remain outside this release. Free-plan quotas and inactivity pausing apply; no paid plan or resources were purchased. Keep external backups before using real operational records.
