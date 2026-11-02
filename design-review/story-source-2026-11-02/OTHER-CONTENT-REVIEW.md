# Other reference content — 2 November 2026

Owner follow-up: check other content for other pages/sections; do not change ANY content in the homepage hero. First ensure the website runs locally.

The existing Website preview is running on http://127.0.0.1:4174/?design=e and returned HTTP 200. The reference stays on port 8000. These are different sites.

## Protected homepage hero

Preserve the complete current E homepage hero, including kicker, “Seven supplements. One colour each.”, lede, CTAs, stage captions, readouts, sound labels and accessible copy. Do not import the reference hero (“Know what you're taking.”), and do not change shared text/data in a way that indirectly changes hero content. Current primary renderer is `hero(ctx)` in web/super-sevens.js. Compare the entire rendered hero before and after any later changes.

## Content checked and candidate destinations

| Reference source | Existing destination | Review scope |
| --- | --- | --- |
| home(), below its first hero section | E homepage below hero / About | Belief, unclear labels, four bottle rules, formulation thinking, sourcing, everyday life, manifesto and closing CTA. Preserve the existing E design and avoid duplicating full Story chapters. |
| products() + cardHTML() | /shop | Menu introduction and product summaries. Preserve real catalogue prices, stock, filters and purchase hooks. |
| product(slug), PRODUCTS | Seven /products/:slug pages | Introductions, product stories, why this form, directions, label details, manufacturer and cautions. Compare source values against current final-label records before importing facts. |
| science() | /standards | Science/quality editorial copy and checkable standards. Distinguish label statements from actual published documents. |
| ingredients() | /standards and relevant Learn/product sections | Ingredient forms, maker assignments, sourcing explanation. Keep ingredient supplier/origin explicitly pending where not supplied. No new page necessary just to mirror a source URL. |
| contact() | /contact | Plain-language introduction, label questions, email/phone/address. Keep the working contact/support form. |
| home() journal cards | /learn | Candidate label-reading, iron/chai and omega-3-form topics; the reference explicitly says full articles are not published. Do not invent articles. |

## Findings requiring reconciliation

The existing Standards copy says no manufacturer details have been published, while the source names three makers and label records already exist. Review actual current records and E rendering before deciding which statements are stale. Source claims of third-party testing/GMP/traceability do not mean that downloadable batch reports or certificates are available; preserve accurate record availability. The reference holds L-Theanine supply while the live preview catalogue is published/in stock; do not alter stock or admin records from editorial copy. The Story handoff also flags psyllium fibre values differing from final labels; do not propagate those values across product pages without reconciliation. Contact details in the existing footer match the source email/phone.

Claude should check these candidates in the established E design context and provide a concrete content map and conflict list. The immediate instruction is to check other content; homepage hero content is frozen. The separate exact Story implementation is already completed in the shared checkout per Claude's handoff and must be retained.
