# Connected Netlify build — Variant E

`netlify.toml` builds `dist` with `python3 -B deploy/build_netlify.py` and supplies:

- `BCC_HOSTED_MODE=connected`
- `BCC_API_ORIGIN=https://dzsglgcagghinjevdbnw.supabase.co/functions/v1/operations`

The connected storefront defaults to Variant E. Local, static and connected previews group the two Variant E versions separately from the seven archived designs. Existing design links and saved variant preferences still work. Admin storefront and product links open E. An explicit production release uses Variant E Part 1.

The first rewrite proxies `/api/*` to the operations Edge Function, before the SPA fallback. The static-preview API adapter is omitted. The public export excludes the local database, backend/SQL source, private uploads, credentials, customer records, Git metadata, Blender originals and QA captures. No Supabase service credential belongs in Netlify or browser assets.

Website: https://body-cafe-co-website.netlify.app . Admin: `/ops`. Username: `bodycafe.com`; use the password privately created for the confirmed Supabase Auth user. The local Python portal retains its separate local credentials and database.

Hosted ordering and customer sign-in remain paused until real payment/OTP providers are integrated. Courier booking, live refunds and external messaging are not connected. Browser-session support cases can still be saved and followed. This is an operational preview, not a completed commerce launch.

## Local verification

The default local export stays a seeded static preview. Run `node deploy/test_hosted_preview.mjs` after `python3 -B deploy/build_netlify.py`. For a connected export, set the two environment variables above before building.

Run `node deploy/test_storefront_theme.mjs` to check A–H preview selection, E default/production selection, admin links and admin-managed homepage images.

Run `npm ci && npm test` in `deploy/supabase-tests` for the database/API suite. See `SUPABASE-DEPLOYMENT.md` for backend rules, verification and remaining launch work.
