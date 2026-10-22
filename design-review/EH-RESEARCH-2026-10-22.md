# E–H: research and design brief

22 October 2026. Replaces the rejected fifth direction. Design author: Claude, in the owner's existing Body Cafe Co Website project. Local integration and QA: Codex. A–D are retained.

## What the references actually support

Sources were opened during this session. These are observations and design interpretations, not claims that a reference guarantees an award or conversion improvement.

| Reference | Evidence and useful lesson | Application to Body Café Co. |
|---|---|---|
| [Garoa Skincare, Awwwards](https://www.awwwards.com/sites/garoa-skincare) | The award page describes a bespoke ecommerce experience and reports separate design, usability, creativity and content scores. Visual distinction has to coexist with shopping. | Judge the collection, product detail and bag with the same care as the opening. An impressive hero is insufficient. |
| [FRAMA](https://framacph.com/) | The live opening uses two equally large photographic windows with small navigation, followed by another image feature, products and room guides. Browser screenshot inspected. Objects appear in a coherent world rather than an isolated card library. | Carefully framed product imagery, few competing messages and a clear transition from atmosphere into actual products. Do not borrow FRAMA's photographs or furniture aesthetic. |
| [The Row](https://www.therow.com/) | The live information architecture separates collection imagery, product categories, objects and editorial projects. The store still exposes account, saved items and bag. | Let selection and image scale establish confidence; keep utilities direct. Luxury cannot rely on obscuring navigation or purchase information. |
| [Le Labo](https://www.lelabofragrances.com/) | The site distinguishes collection, format, discovery and journal with precise product names. | Use exact supplement names and formats as useful navigation. Avoid arbitrary benefit categories that would require unapproved health claims. |
| [Seed](https://seed.com/) | The live page moves from products to explanatory material and then editorial content. | Place ingredient and label education close to discovery. No transfer of Seed's clinical claims, testimonials or subscription model. |
| [Ritual](https://ritual.com/) | The live catalogue supports category discovery and direct add controls; promotion and subscription terms have explicit wording. | Keep the primary product action visible and label the sample nature of pricing. Do not import subscriptions or demographic recommendations into this project. |
| [AG1](https://drinkag1.com/) | The fetched European storefront provides a detailed nutrition table alongside product browsing. | Depth of information can coexist with a restrained presentation. Product facts belong in readable HTML; unapproved details must remain pending rather than being made up to fill space. |
| [Bang & Olufsen](https://www.bang-olufsen.com/) | The fetched regional home pairs a focused product campaign with a compact product selection and contextual imagery. | A premium opening can feature one subject and still quickly hand visitors to the catalogue. Avoid equating premium with an elaborate animated stage. |

Typology returned a browser-verification page to the research fetch, and the Aesop Aromatique Candles detail page timed out. Aesop's main site yielded a limited/offline response. None is treated here as visually verified evidence. The correct FRAMA design brand is framacph.com; frama.com redirects to a different business and was excluded. The Row's live opening was also inspected in the browser: a full-viewport monochrome photograph, small horizontal utilities and a centred wordmark. This supports studying image-led restraint; it does not justify copying a fashion photograph or hiding supplement information.

## Four different answers to the brief

The colour requirements are fixed by the owner; the following are composition criteria for Claude, not a preselected design to copy.

**E — clean brand colour.** An open, approachable composition with generous light ground, brand ink, precise cap-colour accents and a direct path to seven products. Distinction should come from proportion and a purposeful arrangement of actual objects. Avoid a rainbow dashboard, badge soup or an oversized text block above interchangeable cards.

**F — premium clean brand colour.** Slower editorial pacing, fewer simultaneous objects, more space around information and a strong image-to-caption relationship. Brand colours should remain recognisable rather than becoming generic beige. Premium should be visible in crop, typography and detail hierarchy, not gold rules or decorative luxury language.

**G — very premium monochrome.** Fully black, white and neutral grey, including the visible product/campaign imagery. Use dramatic contrast and sophisticated typographic scale without sacrificing product legibility. Grayscale presentation must preserve original label geometry; it must not imply a newly manufactured black package. The menu, reports, bag and forms belong to the same monochrome system.

**H — clean monochrome.** White-first, compact, legible and quiet. A clear catalogue and informative product sheets can create character through disciplined alignment, whitespace and small interactions. Its page silhouette must differ from both E and G. Clean does not mean an unfinished wireframe.

## Craft criteria

- Each opening should still be recognisable at thumbnail size without its title or palette.
- Use actual logo artwork, actual supplied product imagery and dynamically bound catalogue names.
- Create rhythm through image sizes and information density; avoid repeating the same three-column section all the way down.
- Show product identity, format, sample price and availability before asking for an add-to-bag decision.
- Small type is useful for captions, not as the only means of understanding a product.
- Every essential hover action needs an equivalent visible touch/keyboard control.
- Native scroll; no preloader, custom cursor, mandatory film or blocked product access.
- Respect reduced motion. Content stays available if decorative effects fail.
- Compose narrow screens deliberately: readable product names, uncropped purchase controls, usable menu and selector, no accidental horizontal page scroll.
- Never invent health outcomes, doses, serving quantities, reviews, certifications, laboratory files, founder history or fulfilment promises.

## Integration and retirement

Old Variant 5 registration and its 17 implementation files were removed from the active web directory. A rollback copy is retained only in ignored `.local/retired-variant-5-20261022/`, outside the deployable source. Original product imagery is retained as source material for the new designs. The old overlapping Daylight/Design House/Premium modules must not be reloaded.

Claude received the owner's four design requirements, public references and a request for downloadable responsive design artifacts. A detailed technical handoff was blocked by automatic approval review before submission; it was replaced with a reduced design-only brief. No local catalogue or application implementation was submitted in that reduced prompt. The integration adapter will be authored locally after Claude returns its design files.

## Acceptance

Eight selectable directions A–H, with no fifth-design alias or old implementation in the runtime. E–H get distinct homepages and coherent collection/product presentations; shared transactional and informational pages remain functional and styled. Verify desktop and phone layouts, selectors, navigation, filtering, unavailable products, quantity/add/remove, reports, bag, checkout and reduced motion. Rebuild the local shareable export; do not publish unless separately requested.
