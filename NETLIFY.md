# Netlify design preview

The repository uses a Python/SQLite localhost API. Publishing its root or only `web/` does not deploy that server. The repository root also has no application `index.html`. Netlify needs a built publish folder with an entry page and a fallback for client-side routes.

`netlify.toml` builds a self-contained **design preview**:

- Production branch: `main` (or the branch containing this fix).
- Base directory: repository root; leave empty in Netlify.
- Build command: `python3 -B deploy/build_netlify.py`.
- Publish directory: `dist`.
- Framework preset: none / other.

The committed configuration supplies the build command and publish directory. Redeploy the latest commit after changing settings. If the old 404 persists, check the deploy log for the command above and confirm the deployed commit contains `netlify.toml`.

## What works

All eight homepages and all seven product pages per theme, theme routing/reloads, shop/search, guides, policies, the browser sample bag, pincode format checks and illustrative lot matches/error states. A generated seeded catalogue supplies public preview data without requiring `/api`.

## What requires the hosted backend

Checkout/orders/payments, sign-in/accounts, saved addresses, support submissions, reviews and operations are not enabled on this static export. Their routes show a design-preview explanation instead of collecting input or pretending to save it. Local Python functionality remains unchanged. This export is not a production commerce deployment.

The build never reads `.local/preview.sqlite3`. It publishes web files, concept files and brand assets only; databases, backend code, source documents, Blender files and QA screenshots are excluded.

## Local verification

```sh
python3 -B deploy/build_netlify.py
node deploy/test_hosted_preview.mjs
```

Export checks cover the seeded catalogue/session, product-scoped report matching and demo error states, rejected writes, root entry/fallback rule and publish boundary. The existing 24 Python tests pass. Browser checks verified static root/product loading, all eight PDP themes, sample add-to-bag and unavailable checkout messaging without the application API.

References: [Netlify 404 troubleshooting](https://docs.netlify.com/resources/troubleshooting/page-not-found-error-guide/) and [SPA routing](https://docs.netlify.com/build/configure-builds/javascript-spas/).
