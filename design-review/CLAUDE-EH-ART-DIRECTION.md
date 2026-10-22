# Body Café Co. — Variants E–H: research and art direction

Replaces Variant 5. Four new directions, each with its own composition, navigation and browsing model. Same catalogue, same copy rules, same accessibility floor.

## 1. What the references teach

| Reference | What it does well | What we took |
|---|---|---|
| **Garoa Skincare** (Awwwards Site of the Day, Apr 2021, Studio—BA) | Typography-led commerce, parallax and shader transitions (GSAP, GLSL); palette of brown, white and muted gold. Scored 8.03 on design, but accessibility was its lowest developer score (6.4). | Let type and one product carry the page. Keep motion to one moment, and do not trade accessibility for transitions. |
| **The Row** | Extreme restraint: plain text navigation, one campaign image, no badges or promotions, sparse microcopy ("Your Bag is empty"). | Text-first navigation, no promotional chrome, microcopy that states a fact and stops (G, F). |
| **Frama** | Low-density product cards (image, name, one-line variant, price). Labels only when they carry information ("Sold Out"). Room-based guides alongside the shop. | Cards carry name, format, price, and nothing decorative. Formats work as "rooms" for browsing (E, H). |
| **Seed** | Science shown through specific figures, footnotes and education modules; three-item nav (Shop, Science, Learn); a quiz as the entry point. | A product page that explains what you will and will not find yet, and an honest facts panel (H, E). No figures until the approved labels exist. |
| **Aesop** (added) | "Restraint at scale": small headings, sentence case, 0px radius, no shadows, depth from tonal grounds, a 320ms image cross-fade on hover. | Sentence case throughout, tonal grounds instead of shadows (F, H), slow cross-fades (G). |
| **Ritual, Made Traceable** (added) | One page that gathers proof: "show the receipts" in one place. | Lot reports sit in the header of every variant as a first-class destination, ready for the reports hub. |
| **Grown Alchemist** (added) | Minimal, category-led, shop-forward navigation. | Format filters are top-level navigation in E, F and H. |

Note: The Row and Seed pages came back as markup rather than rendered pages, so those observations rest on their structure and copy, not on measured spacing or colour.

### Principles carried into all four
- One memorable move per variant. Everything around it stays quiet.
- The cap colour is the brand's most specific asset. Use it as information, never as decoration. Each product keeps its own Pantone.
- Sentence case, plain verbs, no claims. Facts that only the approved rear label can supply say so.
- Browsing is useful: format filters, sort, a list or table view, and visible counts in every shop.
- Native controls only: links, buttons, radios, select, number inputs, `details`, `dialog`.
- Motion answers the user (hover, open, add). Reduced motion turns all of it off.

## 2. Brand inputs used
- **Logo:** stacked BODY / CAFE / Co wordmark, inlined from the supplied SVG and set in `currentColor`.
- **Type:** Aileron (UltraLight to Black) for all reading text; LEMON MILK only where a variant needs one deliberate brand moment (edge labels in F, the closing wordmark in G, product codes in H).
- **Colour:** product caps from the Pantone sheet, using the catalogue hex values: Iron 7599 C `#aa472e`, L-Theanine 5763 C `#777d51`, D3 + K2 2372 C `#35306f`, Omega-3 7543 C `#84919b`, Inositol 2572 C `#b184b9`, Creatine 7708 C `#07566a`, Psyllium 2325 C `#9c9274`. Grounds: Cool Gray 1 C, 656 C and bottle white. Text: 4143 C slate and logo black.
- **Copy:** product names, subtitles, ingredient in view, formats and sample prices from the preview catalogue. Status language follows `SITE-COPY-LEDGER.md` ("Awaiting approved label", "Sample price").

## 3. The four directions

| | **E · Cap Index** | **F · Rooms** | **G · Monolith** | **H · Formulary** |
|---|---|---|---|---|
| Brief | Minimal, clean, brand colours | Premium, minimal, brand colours | Very premium, black and white | Minimal, clean, black and white |
| Idea | The cap, seen from above, is the key to the range. | Each product gets a room of its own colour. | An index of names; the bottle answers. | The range as a ruled table, set like a label. |
| Memorable move | A tray of seven knurled caps. Pointing at one tints the hero and updates a readout. | Full cap-colour fields that hold the bottle like a gallery mat, with a side index that tracks the room. | Seven names in UltraLight down a black column; the grayscale bottle cross-fades as you move. Header uses a difference blend to read on black and white. | Seven tiles with two-letter product codes in LEMON MILK, plus a "Product facts" panel with heavy label rules. |
| Ground | White, 656 C mist tint, slate text | Cool Gray 1 C, white panels, black ink | True black and true white only | White paper, black rules, one grey |
| Type | Aileron Light display, Regular text | Aileron UltraLight display at up to 12rem | Aileron UltraLight names; LEMON MILK closing wordmark | Aileron Regular and SemiBold; Black for the facts title |
| Home | Cap tray → range grid → shop by format → what a product page holds | Opening statement → seven alternating rooms → the set as swatches | Split index with sticky stage → white statement → formats as giant inverting rows | Tile table with a key → format table with codes → specimen facts panel |
| Collection | Sticky sidebar (format radios with counts, sort select), grid or list | Underlined format tabs, staggered two-column swatch book, or a catalogue table | Typographic list on white that inverts per row, with a pointer-following preview; or a grid | Searchable, column-sortable table (`aria-sort`), format chips, or tiles; empty state with reset |
| Product page | Split: tinted image plate and Pantone swatch; sticky buy column with stepper and accordions | Full-bleed colour band with title and bottle; sticky white purchase card; "next in the set" band | Black gallery (pack, rear-label slot, cap from above) beside a white sticky reading column | Bordered image with code stamp; key-value list; facts panel beside accordions; other entries table |
| Mobile | Copy first, caps 4 + 3, filters in a disclosure | Field above text in every room, side index hidden | Stage above the index; gallery becomes a swipe strip | Table rows reflow to image, name, price and add |
| Motion | Cap lift and hero tint on hover or focus | One load moment (headline rises), field bottle scale on hover | Stage cross-fade, row inversion, drawer slide | None beyond focus and state changes |

## 4. Content guardrails
- No testimonials, ratings, certifications, health or benefit claims, or invented specifications.
- Serving size, amounts, units per pack, directions, cautions, allergens, storage and manufacturer show "Awaiting approved label".
- Prices are labelled as samples. Delivery and returns point to policies that are being finalised.
- The supplied mockups print benefit lines on the pack (for example "Supports Heart, Brain & Joint Health"). That is label artwork, not site copy; check it against the approved claims before launch.
- H's two-letter codes are the product's initials and say so on the page, so nobody reads "CC" or "IB" as a chemical symbol.

## 5. Accessibility and motion
- Skip link, landmarks, one `h1` per view, focus moved to the `h1` on route change.
- Bag and menu are native `dialog` elements: Escape and backdrop close them, and focus returns to the opener.
- Filters are radio groups with legends; sort is a native `select`; quantities are native number inputs with labelled step buttons.
- Bag changes are announced through a polite live region.
- `prefers-reduced-motion` removes transitions and animations; G's pointer preview only runs for fine pointers with motion allowed.
- Single-theme by design (each direction commits to its own ground), with colours set explicitly.

## 6. Recommendation
- **F** if the brand should feel premium while keeping its colour system. It makes the Pantone set the experience.
- **E** as the everyday store. It is the most useful for repeat buyers who recognise their cap.
- **G** for a launch or editorial moment; it trades colour recognition for gravitas.
- **H** pairs well with the lot-report and label work. Its facts panel can be reused inside any of the others.

## Sources
- [Garoa Skincare on Awwwards](https://www.awwwards.com/sites/garoa-skincare)
- [The Row](https://www.therow.com/)
- [Frama](https://framacph.com/)
- [Seed](https://seed.com/)
- [Aesop design system summary, webdesignhot](https://www.webdesignhot.com/design.md/aesop/)
- [Ritual's Made Traceable page, Glossy](https://www.glossy.co/beauty/ritual-vitamins-wants-traceability-to-become-the-new-transparency)
- [Grown Alchemist, ecomm.design](https://ecomm.design/?p=39755)
