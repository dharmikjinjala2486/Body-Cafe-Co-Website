# Account and Support release — 23 October 2026

Applied Claude Account/Cart then frozen Support/Policies to `3ad38b1`. Source package hashes are recorded in CLAUDE-SYNC.md. The combined source matches the supplied overlay before these release-document edits.

## Independent checks

- 72 backend tests passed through unittest discovery: all account, support, HTTP, commerce, Lot Reports, reviews and theme-feedback tests.
- All web/deploy JavaScript syntax checks, static export, hosted-preview boundary tests and whitespace checks passed.
- Account/Cart package before Support: 96 layouts (four account/cart routes × A–H × 1440/768/390px), no h1, overflow or boot errors.
- Final combined snapshot: 192 support layouts (Help, Contact, Preferences, five policies × A–H × 1440/768/390px), one h1, valid local anchors and no horizontal overflow.
- Final combined Account/Cart recheck: 64 layouts (Cart, Overview, Profile, Preferences × A–H × desktop/mobile), one h1, no horizontal overflow or boot errors.
- Preview-only sign-in with a sample number and visible local code reaches Account. No SMS sent.
- Bag: add from Shop, increase quantity, save for later, restore and apply PREVIEW10 checked.
- Support: Story chapter context preserved; a sample case returns its actual reference; Follow this case opens the private timeline; a reply is recorded. Help search returns refund answers and policy links.
- All QA data is isolated on port 4197 with ignored `.local/account-support-deploy-20261023/qa.sqlite3`. No real customer data or external message is used.

Claude’s larger supplied browser suites and pending freeze-time runs are documented separately in the downloaded apply notes and implementation reports; they are not claimed as independent coverage here.

## Publication limits

The Python server remains a local preview: payments, OTP and shipping are simulated; a non-preview OTP provider fails until configured. Netlify hosts the static design preview with a working sample bag, readable support/policy pages and honest unavailable states for backend submissions. Existing Netlify theme-feedback collection remains intact.

Every policy is labelled Draft 0.1, not yet in effect. Legal entity, support details, service decisions, provider/retention records and legal approvals remain pending as documented in SUPPORT-POLICIES-IMPLEMENTATION.md. The existing preview cancellation behavior is preserved; this release does not approve a production policy. No QA records are exported. Git and Netlify histories identify the published commit/deployment.
