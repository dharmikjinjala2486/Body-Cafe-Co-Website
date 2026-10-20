# Integration notes: full-site design (four directions)

- **Baseline:** `design/concepts @ cf8376f` (Add Netlify build and self-contained design preview).
- **Scope:** frontend presentation and content only. No backend, schema, API, integration, deployment or push. `app/` is unchanged.

## Files

| Path | Change |
|---|---|
| `web/site.js` | New. Shared copy, guides, notes, policies, fixtures and helpers (`window.BCCSite`). |
| `web/site.css` | New. Shared themed primitives (scoped to `body[data-theme]`). |
| `web/site-a.js`, `web/site-a.css` | New. Direction A, Warm editorial. |
| `web/site-b.js`, `web/site-b.css` | New. Direction B, Expressive everyday. |
| `web/site-c.js`, `web/site-c.css` | New. Direction C, Pick a cap. |
| `web/site-d.js`, `web/site-d.css` | New. Direction D, Still life. |
| `web/app.js` | Modified (see below). |
| `web/index.html` | Modified. Loads the five stylesheets after `pdp-d.css` and the five scripts after `pdp.js`, before `app.js`. |
| `web/pdp.js` | Modified. One line exposes `BCCProductPage.toConfirm`, so ingredient notes list the same pending label fields as the product pages. |
| `concepts/app.js` | Modified. The old A/B concept entry now forwards to `/?design=a\|b#anchor` and stores the choice in `sessionStorage`. The rest of the file is untouched. |
| `SITE-DESIGN.md`, `SITE-COPY-LEDGER.md`, `QA-Full-Site-Design.md`, `INTEGRATION-SITE.md` | New documentation. |

To apply, either copy the files at the same repository-relative paths, or run `git apply full-site-design.patch` on a clean `cf8376f` checkout. The patch covers the same files.

## What changed in `web/app.js`
- **Home and themes.** `designHome()` is now `/` for all four directions, and the A/B concept homepages render in-app. `theme()` returns `BCCSite.themes[activeDesign]`.
- **Selector.** `designHref(d)` changes only `?design=` on the current path, query and hash. Every option is a `data-design-switch` link, and `previewBar()` is split out of `shell()`.
- **Chrome.** `shell()` uses `theme.chrome(ctx, content)` on customer routes. `/ops` always uses the original chrome.
- **Link persistence.** `keepDesignOnLinks()` runs after every render, after report results and after case results. It adds `?design=` to internal links (skipping `/ops`, `/web`, `/concepts` and `/assets`).
- **Render.** Each route calls `call(name, …)` with the existing template as the fallback. `fixtureState(path)` gates `?state=` to the listed routes and ids. The account API is skipped for fixtures. `/preview/states` is a new index route. On the static preview, a blocked route without a fixture renders the theme's `unavailable` page.
- **Paint.** Sets `body.dataset.theme` (empty on `/ops`) and `body.dataset.concept` (`a`/`b` on `/` only, which reuses the homepage module styles). Scrolls to a hash anchor and sets the document title from the page `h1`.
- **Shared form builders.** `forms.delivery|payment|confirm|summary|otp|codeEntry|address|caseForm|reviewForm|preferences|reportForm|productPicker|search` keep the original element ids and names, so the existing submit, discount, OTP, case, review, preference and report handlers work unchanged. They add field hints, `autocomplete`, `aria-describedby`/`aria-invalid` and a disabled fixture mode.
- **Report result.** `reportResult()` gives one hierarchy for all directions, with product, lot, report version, source document and pack-authentication facts. The loading and outage states have a retry button.
- **Context.** `siteCtx()` exposes data and helpers to the direction modules.

## Behaviour contracts kept
- API calls, payloads, session handling, permissions, OTP, checkout, payment simulation, cancellation, reorder, reviews, cases, preferences, lot lookup and ops workflows are all unchanged.
- Static export: `deploy/build_netlify.py` copies the new files with `web/`. The hosted preview still blocks writes, and checkout, account, orders, payment and contact show a theme-matched unavailable page unless a synthetic `?state=` fixture is requested.
- No external libraries, CDNs or inline handlers. All code is plain ES5/ES2015 IIFEs loaded as ordinary scripts.

## Checks to rerun after integrating
```
python3 -B -m unittest app.test_server app.test_http      # 24 tests, unchanged
for f in web/*.js concepts/app.js; do node --check "$f"; done
python3 -B deploy/build_netlify.py && node deploy/test_hosted_preview.mjs
python3 app/server.py --port 4192 --db /tmp/qa.sqlite3     # then open /?design=a … /preview/states
```

The QA report (`QA-Full-Site-Design.md`) lists what passed, what wasn't checked and the remaining limits.
