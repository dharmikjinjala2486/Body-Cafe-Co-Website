# About and Learn release — 23 October 2026

Source: Claude About package followed by frozen Learn snapshot over `3216b09`. Existing Shop, product, Standards and A–H work is preserved. Imported source overlays match byte for byte before release-document edits.

## Independent validation

- 36 domain/HTTP/review tests passed, including new brand cases, Learn case-reference validation and feedback replacement/aggregation.
- All web/deploy JavaScript syntax checks passed; Netlify static build, hosted-preview tests and whitespace checks passed.
- About: 24 combinations (A–H × 1440/768/390px), each with one h1, ordered eight sections, five gallery controls and no horizontal overflow. Viewer next/Escape and contact kind=brand verified. All five gallery images loaded on the inspected E page.
- Learn: 336 combinations (14 routes × A–H × 1440/768/390px), each with one h1, no horizontal overflow and no missing local anchor targets.
- Direction E interactions: search returns five elemental-iron results; Creatine explorer changes to Label; guide save and inline glossary expand; feedback records successfully on the isolated backend; glossary no-results reset restores 29 terms.
- QA uses an isolated database on port 4192. Machine-readable checks and screenshots remain ignored under `.local/about-learn-deploy-20261023/`.

## Content and publication limits

Learn discloses that specialist review and approved rear labels are pending. Outcome/research drafts remain in `LEARN-REVIEW-PACK.md`, which the static export does not serve. The two existing general safety cautions were checked against the cited NIH primary sources: [Iron](https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/) and [Vitamin K](https://ods.od.nih.gov/factsheets/VitaminK-HealthProfessional/). This check does not replace specialist or regulatory review.

Claude’s larger supplied verification and pending full-sweep status are documented separately in the Learn package apply notes, held locally. They are not claimed as independent checks here. The frozen package was imported unchanged; no new features were requested from Claude during sync.

Netlify remains a static design preview: feedback, support submissions, account and commerce services require the Python backend. Final brand records, team introductions and other outstanding approvals remain labelled in the UI. Git and Netlify history identify the published commit/deployment.
