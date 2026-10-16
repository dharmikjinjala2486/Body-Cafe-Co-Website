# Body Café Co. — independent QA review (Claude)

16 October 2026. Baseline: `design/concepts` @ `23c6bd3`, fresh checkout. All synthetic records were created in an isolated scratch database (`--db`), never in `.local/preview.sqlite3`.

This report covers the local preview only. It does not certify live payments, couriers, production security or WCAG conformance.

## Summary

The preview is in good shape. Codex's 23c6bd3 corrections hold, and I found no layout overflow, broken image or uncaught script error across 112 page/width combinations. I found and fixed:

- one real approvals bug, with a regression test;
- two focus-handling defects affecting keyboard users;
- one unreadable disclaimer on the C and D homepages;
- one cap-contrast rule that picked the weaker text colour.

I also applied a small legibility pass to A/B micro-type. I made no other design changes, because the four directions are visually sound and further changes would be arbitrary.

## Passed checks

**Backend**
- 22 → 23 tests pass, including the new regression test. `node --check` passes for all four JS files.
- Probed over HTTP against the isolated server, all correctly rejected:
  - CSRF mismatch
  - cross-origin `Origin`
  - Viewer writes
  - another customer's order (pay and case)
  - merged quantity over 10
  - unknown product
  - COD
  - reviews on undelivered orders
  - self-approval
  - negative or boolean prices
  - invalid report product
- The `DEMO-OUTAGE` 503 is the intended sample state, not an uncaught error.
- I reviewed FEFO allocation, atomic reservation rollback, expiry restoration, quarantine gates on capture and shipping, OTP attempt and cooldown limits, guest-order claim matching, and the static-file allowlist. No issues beyond the one fixed below.

**Layouts**
- A/B/C/D homepages at 1440, 768, 390 and 320px.
- 24 storefront routes at 1440, 768 and 390px: shop and filters, bundles, all seven PDPs, standards, learn, guide, ingredient, story, reports and a matched lot, empty cart and checkout, account, addresses, cases, help, contact, policy, settings, search with and without results, 404, ops login.
- Pages re-checked after fonts loaded, with lazy images triggered.
- Results: no horizontal overflow, no broken images, no console or page errors, exactly one `h1` per page.

**Interaction**
- C/D cap selection is manual only (no change after 5s idle). Tap and arrow keys work.
- D shows all seven cap labels at 390px.
- Mobile menu: Escape closes it and returns focus to the trigger.
- Search dialog opens and closes with Escape.
- FAQ and example-report accordions work in all four designs, and focus outlines are visible.

**Customer flow** (390px, touch emulation)
- Add from the D menu, change quantity in the cart.
- An invalid discount shows an inline error; PREVIEW10 works, and the checkout total equals the payment total.
- A failed payment followed by a successful retry works and clears the bag.
- OTP sign-in claims the guest order. A saved address shows.
- A linked safety case is flagged priority.
- Admin simulated shipment and delivery shows "At your door" to the customer.
- The review form drops products already reviewed, then shows "Review submitted".

**Operations**
- All ten screens at 1440 and 390px, as Admin and Viewer.
- No overflow. Viewer has no enabled mutating controls; the only enabled buttons are the demo identity switches.
- Different-admin approval works.

## Fixes

| # | Issue found | Fix | Files |
|---|---|---|---|
| 1 | **Duplicate pending approvals.** The same change (e.g. a refund for one order) could be requested twice. After one was approved, the duplicate stayed "pending" forever and could only fail ("Refund already resolved"). Reproduced over HTTP. | The server rejects a second *pending* request for the same kind and target with HTTP 409. A new request is allowed once the first is resolved. Ops Orders shows a "Refund awaiting approval" badge instead of the request button while one is pending. | `app/server.py`, `web/app.js` |
| 2 | **Regression test** for #1. Fails on 23c6bd3, passes after the fix. Covers refunds and price changes, including re-requesting after a rejection. | `test_duplicate_pending_requests_are_rejected` | `app/test_server.py` |
| 3 | **Focus lost on in-place re-renders.** Cart +/−/Remove, saving an address, ops ship/approve/flag actions and other updates replaced the DOM and dropped keyboard focus to `<body>`, so the next Tab restarted at the top of the page. | Before an in-place render, the app records the focused control by id, `data-*` attributes or form field. Afterwards it restores focus to that control, or to `#main` if the control no longer exists (e.g. after Remove). Navigation behaviour is unchanged. | `web/app.js` |
| 4 | **Focus lost after a form error.** Submit buttons are disabled during requests, which blurs them. A server-side error (e.g. wrong discount code) then left focus on `<body>`. | When the request finishes, focus returns to the submit button if it would otherwise sit on `<body>`. | `web/app.js` |
| 5 | **Unreadable example-report disclaimer in C and D.** On the dark C lot band and the indigo D band, "Demonstration of report structure only…" inherited the storefront's muted grey, measuring about 2.1:1 in C and 1.7:1 in D. | The text now uses the band's light colour, at the same opacity as the existing `dd` text. The wording is unchanged. | `web/homepage.css`, `web/direction-d.css` |
| 6 | **Cap text colour used a fixed brightness cut-off.** For L-Theanine olive (#777d51) this chose ink text at 3.3:1 when light text gives 4.0:1. It affected the C hero, the PDP stage, D tiles and receipts. | `onCap()` now picks whichever of the two existing text colours has the higher contrast ratio. Only L-Theanine changes; the other six caps keep their current colour. | `web/app.js` |
| 7 | **D: two labels just under 4.5:1.** The olive arch-tab text on sage cards measured 4.47:1, and the customer-experiences kicker on lavender 4.37:1. | Both are darkened slightly within the existing palette. | `web/direction-d.css` |
| 8 | **A/B micro-type.** Concept-page captions, product descriptions, notes and footer text were 7–10px on mobile (8px studio label, 9px product descriptions, 8px footer). | A restrained minimum: 10px for decorative labels, 11–12px for informational lines, and taller footer links. The editorial scale and layout are unchanged. | `concepts/style.css` |
| 9 | **Small link targets.** The footer bottom link, the preview-bar Operations link and PDP breadcrumbs were 20–22px tall. | `min-height: 24px` (WCAG 2.5.8). | `web/style.css` |

No marketing or product copy, section order, data, demo labels, prices or content changed. The only new user-facing string is the ops status badge "Refund awaiting approval" (fix #1). The server's new 409 message is "A request for this change is already awaiting approval."

## Observations, not changed

- **Brand cap colours limit contrast in a few places.** Light text on L-Theanine olive reaches 4.0:1 and ink on Omega-3 grey 4.47:1. This affects the C hero lede, PDP breadcrumbs and D tiles. Neither existing text colour reaches 4.5:1 on these Pantone fills. A fix would need a darker hero tint or larger text, which is a brand decision.
- **C hero labels.** C shows only the selected cap's label by design. D shows all seven. I left both as they are.
- **Automated contrast flags on gradient or `color-mix` backgrounds** (C strip numbers on cap discs, the PDP lot callout) were checked by hand and are false positives.
- **Small checkboxes.** Preferences checkboxes are 20px, but each sits inside a larger clickable label.

## Remaining preview and production limits

These are unchanged; see `QA-Review-and-Next-Steps.md`.

- Payments, OTP/SMS, couriers, admin SSO/MFA and messaging are simulated.
- Lot reports are illustrative.
- Prices, labels, policies and reviews await approved inputs.
- There has been no load, security or accessibility certification.

## Changed files

`app/server.py`, `app/test_server.py`, `web/app.js`, `web/style.css`, `web/homepage.css`, `web/direction-d.css`, `concepts/style.css`, and this report.
