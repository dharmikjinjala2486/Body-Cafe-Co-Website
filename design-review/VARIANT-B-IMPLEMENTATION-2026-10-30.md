# Variant B — The Curious Everyday · implementation handoff

30 October 2026 · Implements `VARIANT-B-IMPROVEMENT-AUDIT-2026-10-30.md` for Variant B only. Nothing committed, pushed or deployed.

## Non-negotiable kept

**The first image of every existing product stays the static studio artwork** (`/web/media/bottles-normalized/<id>.svg`) on every B surface: homepage cards, Cabinet, hero fallback, shop, PDP gallery/thumbnail/enlargement, related products, bundles, Learn, About and bag. Images after the first come from the admin gallery in order, with their own alt text, captions and visibility. A new product without legacy artwork uses its first admin image, or a neutral cap-colour bottle placeholder (no label wording) when it has none.

## What changed

| File | Change |
|---|---|
| `web/variant-b.js` (new) | `BCCBMedia` resolver (static first image, admin images after, placeholder). Wraps every B renderer: editorial catalogue order (admin `sort_order`/`position` if present, then the brand order, then new products), published-only promotion (`ctx.live`), counts restated from the published catalogue ("seven" → live count). New Curiosity Cabinet (radio-group shelf → product / label / ingredient context / lot record trail). Production feedback empty state. Behaviour: one hero entrance, pointer depth (fine pointers only), Cabinet selection with arrows/Home/End, add-to-bag result state, offscreen pause for the feedback loop, canonical/Open Graph/Product JSON-LD per route. |
| `web/variant-b.css` (new) | Hero composition and depth, hotspots, phone/tablet hero, cards (format/pack, availability), Cabinet, bundle notes, long-name PDP title, B-only reveal fix (content never hidden waiting for an observer), reduced-motion overrides. |
| `web/release.js` (new) | `BCCRelease`: `preview` (default) or `production` via `<meta name="bcc-release">`. |
| `web/site-b.js` | Photos via resolver; hero markup split (copy / art / supporting copy) so phones see a product in the first viewport; hero fallback uses published products only; card scan order (name, description, format + pack, MRP, availability, action); sold-out vs unavailable labels; bundles disable "Add both" when a member is unpublished or out of stock; production footer drops preview links; Help in the phone menu. |
| `web/editorial-b.js` | Campaign hero only while both featured bottles are published, with live name/price hotspots; bundle art only while membership and publication match; About lineup omits unpublished bottles; no more first-image overrides (now at source). |
| `web/product-page.js` | B gallery from the resolver (thumbnail/caption/lightbox/ratio now agree); one pack value in purchase panel and Overview (fixes "Demo pack: 60 softgels" vs "Awaiting approved label"); related images via resolver. All guarded to B. |
| `web/shop.js` | B cards use the resolver plus second admin image on hover; B unrated cards say "No reviews yet"; formats added in admin get their own filter option in B only (A, C–H keep the three original options). |
| `web/bottle-assets.js` | In B, shared modules (Learn, About, bag) also get the static first artwork. |
| `web/demo-content.js` | Fixtures load only in preview releases. |
| `web/app.js` | Production: B only, no preview bar/admin link, `/preview/states` → 404. Calls `BCCVariantB.enhance`. |
| `web/index.html` | Loads `release.js`, `variant-b.css`, `variant-b.js`. |
| `deploy/build_netlify.py` | Opt-in `BCC_RELEASE=production` + `BCC_SITE_URL`: indexable robots, release meta, sitemap of static routes, robots.txt, and a B-only entry that drops 15 other-direction files (~790 KB uncompressed). Default build unchanged (preview, noindex). |

## Verification (local, 30 Oct)

Browser QA used a Node static server with the hosted-preview adapter and the public catalogue snapshot (the system Python is an Xcode stub). Using uv's Python 3.10: `app.test_server app.test_http` — 32 tests pass; `build_netlify.py` run in a scratch copy — preview build stays noindex and passes `deploy/test_hosted_preview.mjs`; production build sets index/release meta, robots, sitemap, drops the other-direction files and refuses to run without `BCC_SITE_URL`.
- Codex read-only review: fixed add-to-bag result reading (capture phase), Open Graph timing after route changes, and kept new format filters B-only. Its note that admin image 1 is dropped for existing products is intended: the static artwork takes that slot.

- 1440 / 768 / 390 / 320 px: homepage, Cabinet, shop, PDP, bundles; no horizontal page scroll.
- Edge catalogue: unpublished featured product (hero falls back, bundles flag the gap), sold-out product, new long-named product with a new format and no images (placeholder, filter option, safe guide links, scaled title), extra admin image (gallery, thumbnail, caption, enlargement all agree, focus returns on close).
- Production mode: no preview bar, fixtures or fictional feedback; pending label states consistent; ordering copy follows `checkout_enabled`.
- B-only entry: route-by-route layout signatures matched the full entry.
- Reduced motion (simulated): no entrance, panel animation or reveals; selection still instant. Keyboard: Cabinet arrows/Home/End, menu Escape returns focus.
- A, C–H: home/shop/PDP/Learn render without errors or B artwork.
- Not measured: Core Web Vitals, real Safari/iOS/Android, screen readers, 200% zoom, contrast audit tooling. No scores are claimed.

## Still depends on business content or integrations

Approved rear labels (pack, serving, directions, cautions), approved policies and contact details, real lot documents, real reviews, founder/story material, final prices/GST wording, payment/OTP/courier providers, and the production domain (`BCC_SITE_URL`). Preview fixtures and the labelled placeholder feedback carousel remain in preview mode as approved.

## Not done / follow-ups

- Shop intro, Standards, Story, Learn articles, bag, account and help received the shared fixes above but no bespoke B redesign in this pass.
- Sitemap lists static routes only; product/guide URLs need the release catalogue.
- Rapid route changes log `AbortError: Transition was skipped` from the existing view-transition code (pre-existing, harmless).
