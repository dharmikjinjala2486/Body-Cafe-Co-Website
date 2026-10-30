# Variant B sync verification — 30 October 2026

Integrated Claude's completed local changes in the shared Website repository. The user authorised syncing to GitHub and the connected Netlify preview. This update retains preview mode, existing API routing, design directions and integration restrictions.

Verification performed by Codex:

- JavaScript syntax checks passed for the affected/new JavaScript files and `git diff --check` passed.
- 32 backend/HTTP tests passed using the installed uv Python and a temporary loopback test server.
- Static export rebuilt; `deploy/test_hosted_preview.mjs` passed the preview API and publication-boundary checks.
- Final export rebuilt in connected preview mode with the existing configured Supabase API origin; no production-release opt-in.
- Browser check: Cabinet selection correctly changes the selected product and information panel.
- All seven homepage product images loaded from the original normalised artwork paths.
- All seven product routes show their original static SVG first images; purchase-panel and Overview pack values agree. No horizontal overflow at the default desktop viewport.
- Homepage and Shop checked at 390px: seven Cabinet choices/seven shop cards, loaded hero imagery and no horizontal page overflow.
- No tracked bottle artwork changes relative to HEAD.

Existing implementation limits are documented in `VARIANT-B-IMPLEMENTATION-2026-10-30.md`. Several secondary routes received shared improvements rather than a bespoke redesign. No real-device, screen-reader or Core Web Vitals field-performance claim is made.

The separate `SUPABASE-OTP-RESEARCH.md` and handoff screenshot are excluded from this sync commit.
