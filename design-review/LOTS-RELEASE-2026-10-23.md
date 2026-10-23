# Lot Reports release — 23 October 2026

Claude package base: `4c28f6c`. Local integration base: `5d97e2a`, preserving both feedback-form commits through a clean three-way merge.

## Independent checks

- 52 backend tests passed via unittest discovery, including Lot Reports, private documents, two-admin approvals, exact lookup, case media and feedback-form coverage.
- All web/deploy JavaScript syntax, static export, hosted-preview/publish-boundary and whitespace checks passed.
- 24 report layouts (A–H × 1440/768/390px): correct demo record, one h1, no horizontal page overflow.
- Actual form lookup retains entered case/spaces while displaying the normalized exact match.
- Wrong-product lookup identifies the proper product and switches correctly; a near-match typo returns no record; sample outage keeps the entry and offers retry.
- A clearly labelled QA fixture was published through the real two-admin API on an isolated database. UI preserves <0.05, ND and a range, includes specification sources, marks missing assessments honestly and exposes document links.
- Feedback page still renders its current name-first journey. No real feedback submission was made during these checks.
- QA server uses port 4196 and ignored `.local/lots-deploy-20261023/qa.sqlite3`; fixture records are not exported to Netlify or committed.

Claude’s larger supplied browser/regression reports remain separate in its implementation notes and downloaded QA logs.

## Publication scope

Netlify serves the static design preview with clearly labelled demonstration records and no invented laboratory evidence. PDF uploads, approvals, notices, support photos and other backend operations work in the local Python preview. Real laboratory documents, specifications, approved lab details and production review records remain pending. The latest feedback-form collection/export remains intact. Git and Netlify histories identify the release commit/deployment.
