# Creative reset: three new worlds for Body Café Co.

20 October 2026 · baseline 33c1789

The user likes B (Expressive everyday) and rejected A, C and D as generic. This revision replaces those three creative directions throughout the customer site. B remains the comparison baseline. The objective is exceptional craft and a recognizable brand experience; this document does not claim a worldwide ranking, award or measured conversion improvement.

## Research method

The study deliberately extends beyond supplements. It combines current primary-site reading, live browser inspection, historical award documentation and an independent critique in the existing Claude design conversation. It is a curated international study, not a claim to have inspected every site in the world. A live site's current appearance is distinct from its historical award entry.

Primary sites read include electronics, eyewear, fashion, food, drinks, skincare, design studios and interactive experiences. Visual browser inspection confirmed the OP-1 product page, PORTO ROCHA's project-index treatment, Vacation's campaign and signup surface, and Gentle Monster's campaign/navigation surface (partly covered by its cookie dialog). Lusion's browser capture reached a loading screen, so conclusions about its overall practice come from its official descriptions and award documentation rather than a claimed complete live interaction audit. Igloo was screened using its official site and award entry; its WebGL experience was not fully audited. Vitra and several other exploratory URLs could not be fetched and were not used as verified design evidence.

No competitor artwork, images, copy, customer evidence or health claims were imported. All product images are the user's supplied mockups. The new diagrams, record sleeves, discs and projection graphics are original HTML/CSS compositions.

## Reference library and specific decisions

| Primary reference | What was useful | Application and boundary |
|---|---|---|
| [teenage engineering OP-1](https://teenage.engineering/products/op-1) | Product controls, graphic labels and the physical object's design language form a coherent system. The page makes the object concrete. | A becomes a field manual: index numbers, rulers, meaningful annotations and toggle-like format filters. No imitation instrument UI or claim that a supplement is a diagnostic device. |
| [PORTO ROCHA](https://www.portorocha.com/) | A strong project index and large changing imagery give navigation an editorial point of view. Graphic identity is a working system. | Give A an explicit catalogue structure; make titles, labels and navigation part of the same vocabulary. Avoid the previous muted-word editorial template. |
| [Gentle Monster](https://www.gentlemonster.com/int/en) | Collection and campaign exploration coexist with straightforward category navigation and product discovery. | Stage the range as a directed collection in D while keeping product names, reports and purchasing reachable. No copied campaign video or celebrity association. |
| [Lusion](https://lusion.co/) and its [historical v3 entry](https://www.awwwards.com/sites/lusion-v3) | The studio describes combining design, motion and 3D into authored experiences; the entry documents reactive and scrolling interaction work. | Adopt a single memorable, purposeful interaction per direction. Reject a WebGL imitation, preloader, particles and scroll hijacking. |
| [Igloo](https://www.igloo.inc/) and its [award entry](https://www.awwwards.com/sites/igloo-inc) | The historical entry documents a tightly limited palette and a coherent 3D/transition world. | D uses a restrained palette and a consistent frame. Its product illumination is manual, and the content remains ordinary accessible HTML. This is not an implementation of Igloo's technology. |
| [Vacation](https://vacation.inc/) | Its campaign, typography and even promotion surface share a particular cultural world. It demonstrates how far a complete brand vocabulary can extend. | C takes the principle of period-specific craft into an original independent-label catalogue. Its sleeves hold real product notes. No copied promotions, reviews or signup interruptions. |
| [Oatly](https://www.oatly.com/) | A clearly voiced brand can connect products with broader editorial material without default wellness imagery. | Write directly, keep uncertainty visible and avoid generic scientific reassurance. Do not imitate Oatly's voice or hand-drawn visual mannerisms. |
| [OLIPOP](https://drinkolipop.com/) | Range identity and individual product distinction can coexist with direct shopping information. | Preserve the seven real products and cap identities; let product selection remain understandable within all three new systems. Its product claims and reviews have no bearing on this brand. |
| [Aesop](https://www.aesop.com/) | A substantial product/category/service hierarchy supports a strong brand world. | Retain useful information and service depth. The earlier cream-and-olive surface was rejected, so its appearance is deliberately not the model for the new A. |
| [Noma](https://noma.dk/) | Place, exploration, editorial updates and separate product ventures can form a larger world around a focused offer. | Brand narrative should be specific in intent and connected to useful reading. No invented founder history, geography, facilities or sourcing. |
| [Holzweiler](https://holzweileroslo.com/en) | Campaign-led imagery, categories, product stories and physical experiences are connected. | Maintain distinct campaign, shop and reading rhythms instead of placing every type of content in the same cards. No imported people or lifestyle photography. |
| [Loewe](https://www.loewe.com/) | Fashion provides a useful contrast to supplement conventions: collection, craft and product exploration belong to one identity. | Treat the actual object and its detail as a source of art direction. Do not copy brand marks, luxury claims or imagery. |
| [Siena Film Foundation award documentation](https://www.awwwards.com/sites/siena-film-foundation) | Cultural presentation is a relevant reference for an indexed programme and reading experience. | D's screening-room concept uses an original programme and archive structure. The reference is a historical design record, not a claim about its current live implementation. |

## Independent critique in Claude

The existing [UI/frontend improvement conversation](https://claude.ai/chat/8b60ad4b-e1d5-4250-aa27-5c7efab820f7) was asked for critical creative direction only, with no implementation, terminal work, deployment or push. The user explicitly authorized using Claude.

The critique identified repeated structure as the main failure: kicker, large headline, side lede, repeated grids and ruled rows. It also challenged the first replacement ideas: blue/yellow alone can become generic agency brutalism; pink serif styling alone can resemble generic skincare; dark amber alone can become generic luxury technology.

The resulting concepts therefore use specific content and behavior systems, not just palettes:

- **A — Instrument.** An open field manual. Cold white, ultramarine ink, numbered information and visible annotation. Yellow marks preview/approval status. The hero annotations can be shown or hidden; the collection is a precise index. Reports become the blue readout surface. Product pages place the actual mockup against a gridded diagram and the facts beside it.
- **C — Liner Notes.** An independent-label catalogue. Two-colour print character, Gloock display type, Aileron reading text, square sleeves and records. A real button opens readable sleeve notes without presenting a fabricated rear label. The shop is a record rack, guides become essays, policies are inserts and checkout an order slip. The product names and formats remain ordinary supplement information.
- **D — Screening Room.** A programme and archive. Near-black, warm off-white text and an amber active selection. A manually selected programme illuminates one product at a time. No autoplay, WebGL or fabricated angles. Product detail uses an object frame and a distinct purchase column. Checkout deliberately switches to a brighter reading surface: house lights up.

B's arches, speech bubbles, tilted frames and pastel character remain exclusive to B. None of the three replacements copies that vocabulary wholesale.

## Implementation

`web/creative.js` registers new A/C/D page renderers after the existing theme modules. It replaces customer chrome, home, shop, bundles, search, standards, story, learning hub, all three guides, all seven ingredient notes, reports, bag, checkout, account, payment, order, help, contact, policies, preferences and global states. The product renderer provides new A/C/D compositions for all seven SKUs and delegates B to the original product renderer. Existing state, API, permissions, identity, purchase and support handlers remain in `app.js`.

`web/creative.css` contains the isolated art directions and responsive layouts. Existing theme files are retained for provenance and rollback; the new complete renderers govern A/C/D. B's `site-b.js`, `site-b.css`, `pdp-b.css`, shared `homepage.css`, and original `pdp.js` match the pre-revision SHA-256 checksums exactly. Shared changes are limited to loading the new files, updating A/C/D selector names and routing invalid A/C/D products to their new not-found design.

New open fonts are self-hosted with their licenses from the official [Google Fonts repository](https://github.com/google/fonts): [Anton](https://github.com/google/fonts/tree/main/ofl/anton), [Gloock](https://github.com/google/fonts/tree/main/ofl/gloock), and [Space Mono](https://github.com/google/fonts/tree/main/ofl/spacemono). Aileron and the original logo assets remain. There are no new runtime libraries, external embeds, remote font calls or third-party scripts.

Blender MCP was checked, but its addon was not connected. No Blender work was claimed or used. The supplied bottle assets were sufficient; the new scene graphics are built directly on the web.

## Content and behavior boundaries

All seven product identities and the confirmed D3 + K2/Omega-3 descriptor remain. Existing guide content, examples, checklists and source links are retained in the new article layouts. Approved quantities, directions, cautions, real reports, founder content, reviews and final policies remain pending. No efficacy claims, testimonials, ratings, credentials, laboratory results or commercial promises were invented.

The catalogue's pack formats and sample prices are still preview data. New sleeve, instrument and film graphics are presentation metaphors, not new products, packaging formats, laboratory equipment, actual rear labels or evidence documents.

Sample checkout and account states remain disabled and explicitly synthetic. The static export still blocks ordering, sign-in and support submissions. Production integration, medical/content approval, policy finalization and launch readiness are outside this design revision.

## Verification

- 47 representative routes × three redesigned directions × 320/390/768/1440px = **564 page states**. One primary heading, no measured page-level overflow, duplicate IDs, detected app error state or broken loaded image. Includes all seven products and all seven ingredient notes.
- **40 additional 320px checks** after final header/typography changes, including B isolation and invalid-product handling. No flags.
- Existing **24 backend/domain/HTTP tests** passed. JavaScript syntax and diff checks passed. Static build/API/publish-boundary checks passed.
- Actual synthetic checkout → payment → confirmation completed in A, C and D using a throwaway `/tmp` database. A additionally exercised failed payment then successful retry. The user's normal preview records were preserved.
- All five report states checked in every redesigned direction: sample match, no match, unpublished, withdrawn and outage. All seven manual D selections left exactly one frame active.
- A annotation control, C sleeve expansion, keyboard mobile menu and Escape were exercised. Navigation still carries the selected direction through the existing routing system.
- Final desktop and mobile hero screenshots were inspected after browser painting. Selected inner-page captures and local audit JSON are in ignored `.local/redesign-20261020/`.

These are targeted Chromium preview checks, not screen-reader certification, a full accessibility audit, a real-device matrix or field performance measurements. A first contrast review corrected C's light small text on red and increased several small labels. More review with actual shoppers remains useful; the design is ready for the user's visual comparison.
