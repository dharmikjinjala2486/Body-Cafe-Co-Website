# About page — A–H implementation

22 October 2026. Built over canonical commit `3216b09` (Shop release). Not pushed or deployed.

## What changed

- **Before:** `/about` fell back to each theme's `story` renderer, so About and Story showed the same content.
- **Now:** `/about` is a dedicated page in all eight directions. It has one content model, one section order and one behaviour. Each direction composes it in its own visual language.
- **Unchanged:** `/story` (the founder's journey) and `/standards` (ingredients, quality and evidence). About summarises and links to both, and doesn't repeat Story's chapters.
- **Mechanism:** `web/about.js` replaces only each theme's `about` renderer. The route already called `about` before falling back to `story`, so no routing code changed.

### Page flow

| # | Anchor | Section | Content |
|---|---|---|---|
| 1 | `#meet` | Meet Body Café Co. | What we make, who it's for, our point of view. The seven-bottle line-up (draft packaging, captioned). Buttons to People and Values. |
| 2 | `#why` | Why we exist | The problem (trust first, detail later) and the experience we want. Approved Story copy, condensed. |
| 3 | `#name` | Why "Body Café Co."? | The approved café idea, plus "There's no café to visit." Links to the fuller Story. |
| 4 | `#people` | The people behind the brand | Built from the `PEOPLE` record in `about.js`, which is empty. Until approved introductions exist, the page shows one honest line, a link to Story and "Ask the team a question". |
| 5 | `#values` | Values in practice | Clarity, Curiosity, Accountability and Care. Each is tied to a working feature and two working links. |
| 6 | `#collection` | Our approach to the collection | Seven products, format counts computed from the catalogue, the cap-colour list (links to each product) and draft-packaging status. Links to Shop and Standards. |
| 7 | `#behind` | Behind the scenes | Five captioned brand and packaging images, with an enlargeable viewer. |
| 8 | `#talk` | Keep the conversation going | Ask the team (`/contact?kind=brand`), Story, Standards and Shop. Contact channels are stated as not yet confirmed. |

#### Values in practice

Each value links to a feature that works today:

| Value | Feature it's tied to | Links |
|---|---|---|
| Clarity | Product pages separate what's confirmed now from what the approved label will add | Iron Bisglycinate `#ingredients`, and the label guide |
| Curiosity | Guides and glossary, and moderated product questions | `/learn`, and Omega-3 `#questions` |
| Accountability | Lot lookup, and status shown where approvals are pending; demonstration records are disclosed | `/standards#lot`, `/reports` |
| Care | Support cases with IDs, with safety cases flagged as a priority | `/contact`, `/help` |

### Directions

| | About composition |
|---|---|
| A · State of Play | Anton capitals, bracketed numbers, a lime highlight on the point of view, the line-up on graph paper, single-column poster sections, a blue closing band |
| B · Expressive everyday | Lilac intro with the line-up in an arched window, numbered discs, each section a rounded colour field, the café quote as a speech bubble, tilted gallery cards |
| C · Everyday Elsewhere | Butter paper, Gloock serif with a red italic, the line-up in a sunset arch, numbered "chapters", a centred serif quote for the name, stamped value numbers, a blue closing band |
| D · The Other Side | Midnight and gold, centred titles, the line-up in a lit vitrine, gold rules, alternating rooms |
| E · Fan Deck | Lemon Milk capitals, a seven-colour band over the line-up, each section opening with its own cap-colour band, value cards topped in cap colours |
| F · Edition | Folio line, ultralight headline, indigo figure plate, a drop cap in "Why we exist", a ruled pull quote, "Fig." captions |
| G · Darkroom | Black and white sections in turn, frame-numbered contact-sheet gallery (greyscale until hovered or focused) |
| H · Folio | A reference page: § numbering, sticky section heads in the margin, ruled value entries, "Plate." captions |

### Behaviour

- **Section navigation.** Eight links with shareable anchors.
  - Clicking one smooth-scrolls (instant with reduced motion), updates the address and moves focus to the section heading.
  - The current section is marked with `aria-current="location"` as you scroll.
  - Direct links such as `/about#people` open at that section.
  - On phones, the navigation is a swipeable row.
- **Image viewer.**
  - A native modal `<dialog>`: focus stays inside it, Escape closes it, and focus returns to the image that was last shown.
  - Arrow keys or buttons move between images, wrapping at the ends. A live count reads "Image n of 5".
  - Each image has a title, a caption and alt text. There is no scroll locking and no autoplay.
- **People.**
  - When approved entries are added to `PEOPLE`, the page renders portraits, names, roles and introductions automatically, with an expandable biography (`<details>`) and the founder's note.
  - This path was verified with a QA-only record held in browser memory. It was never saved or published.
- **Ask the team.** Opens the existing contact form with a new case type, "About the brand" (`brand`), already selected. The case is saved through the existing `/api/cases` flow and appears in the customer's account and in Operations.
- **Video.** None, because there is no authentic footage, so no player was added.

### Imagery

All images are the brand's own design files or packaging renders. Captions say which.

| Image | Source |
|---|---|
| The pack, up close | `web/media/premium/iron-bisglycinate-detail.webp` (existing studio render of the draft pack; wordmark and cap only, no label claims) |
| Seven caps, seen from above | `web/media/about/caps-row.webp`, composed from the seven existing cap renders |
| The cap-colour sheet | `web/media/about/cap-colours.webp`, cropped from `assets/brand/colours/Colours.jpg` to the seven products in the range (the sheet also lists unreleased products) |
| Room to breathe | `web/media/about/logo-clear-space.webp`, from page 2 of the logo guideline PDF |
| Two typefaces | `web/media/about/type-specimen.webp`, from page 7 of the logo guideline PDF |

Not used:
- The campaign images and videos, which are staged art direction.
- The brand guide's "Photography" page, which is stock reference imagery.
- The 3D three-quarter renders, whose label wording conflicts with the approved front mockups.

## Shared changes

- **`app/server.py`.** The support case types now include `brand`. This is the only server change.
- **`web/app.js`:**
  - "About the brand" added to the shared and fallback contact forms.
  - A `caseKind()` label used on the shared case card and the Operations case list. It also shows "Product question" instead of the raw code on the Operations list.
  - `enhance()` calls `BCCAbout.enhance()`.
- **`web/index.html`.** Loads `about.css` and `about.js` after `shop.*`.

The themed account pages for A–H print case types as their raw codes, for example "general" or "delivery", so a brand case appears there as "brand". Those templates were left unchanged.

## Files

| File | Change |
|---|---|
| `web/about.js` | New |
| `web/about.css` | New |
| `web/media/about/cap-colours.webp` | New |
| `web/media/about/caps-row.webp` | New |
| `web/media/about/logo-clear-space.webp` | New |
| `web/media/about/type-specimen.webp` | New |
| `web/app.js` | Edited |
| `web/index.html` | Edited |
| `app/server.py` | Edited |
| `app/test_server.py` | New test: `test_case_kinds_include_about_the_brand` |
| `design-tools/qa-about/verify_about.py` | New |
| `design-tools/qa-about/compare_other_routes.py` | New |

## Verification

The results are recorded in the delivery message.

`verify_about.py` covers each direction at 1440, 768 and 390px:
- **Page and routing:** a distinct `/about`; `/story` and `/standards` as separate working pages; About in the site navigation.
- **Structure:** section order, heading outline (one h1, seven h2s) and document title.
- **Content:** approved copy, no published people, catalogue names, real cap colours and computed format counts.
- **Links:** design preserved on every link, every anchor resolves, and every linked page renders, including the `#ingredients` and `#questions` targets.
- **Contact:** context preselected, and on the local server a real case is created and listed.
- **Navigation and viewer:** section navigation (address, scroll, highlight, focus); direct anchor links; the image viewer (open, focus, caption, keyboard next and previous with wrap, focus kept inside, Escape returning focus, buttons, fits the screen).
- **People and quality:** the people layout and expandable biography (QA record in memory only), images loading, axe-core (WCAG 2.1 AA and best practice), horizontal overflow, console errors and reduced motion.

## Missing approved content and assets

Everything below is needed before the People section and Behind the scenes can be completed. Nothing here is shown on the page as a placeholder.

1. **Founder introduction.** Each of these must be approved for publication:
   - Name as it should appear, and role or title.
   - A 2–3 sentence introduction in the founder's own words.
   - Optionally, a longer biography (one paragraph) for the expandable section.
   - Only experience and credentials the founder approves for publication.
2. **Founder's note.** A short personal note (2–4 sentences) for the founder's-note block.
3. **Portraits.** An original photograph of each person shown, at least 1200 × 1500 px (4:5), with permission to publish and agreed alt text.
4. **Other team members.** For each: name, role and short introduction, only if they agree to be named publicly.
5. **Behind-the-scenes photography.** Original photographs of real work, for example label proofs, sampling, packaging on the desk or product-in-hand shots. Each needs a one-line description of what it shows.
6. **Founder video (optional).** Authentic footage with captions (WebVTT) and a written transcript. A click-to-play player will be added only once these exist.
7. **Business and contact details.** Registered business name and address (if they are to be published), support email, WhatsApp number, phone number and service hours.
8. **Fuller Story content.** The founder's journey, origins and any dated milestones, so `/story` can take that role. It currently carries the brand essay, which About now summarises.
9. **Approval to publish the brand-guide excerpts:** the logo clear-space page, the type page and the seven-colour cap sheet.
