# Shop integration verification — 22 October 2026

Imported Claude’s completed Shop A–H package over product release `3eca344`, preserving the preceding Standards and full-site integrations.

Independent checks:

- 33 domain/HTTP/review regression tests passed.
- JavaScript syntax checked for all web and deploy scripts; static export and hosted-preview tests passed; diff whitespace check passed.
- 24 local Shop combinations: A–H at 1440/768/390px. Each displayed seven products, one h1, the shared supporting section order and no horizontal overflow. Softgels filtering returned two products and descending price put Omega-3 before D3+K2 in every combination.
- Additional direction H mobile interactions: OR format selection returned six products; Back restored two; stock filtering persisted; Add to bag produced a success message and updated count; product-page return preserved the filter state; unknown-format empty state reset to all seven.
- QA uses the isolated port 4190 preview database. Local machine-readable results are ignored under `.local/shop-deploy-20261022/`.

The supplied larger QA reports in `SHOP-IMPLEMENTATION.md` are Claude’s checks, separate from these independent checks. Its additional older E–H page sweep was still running at handoff and is not claimed as completed here.

GitHub main auto-publishes to the existing Netlify static preview. Accounts, orders and review submission still require the local Python backend. Final business/product records remain pending as labelled in the interface. Commit and deployment identity are available in Git and Netlify history.
