# Body Café Co. — Variants E–H, creative reset (v2)

22 October 2026 · Proposal for review. No code written yet. Replaces the directions in `RESEARCH-AND-ART-DIRECTION.md` (Cap Index, Rooms, Monolith, Formulary).

Key frames: the "Body Café Co. — E–H creative directions" design canvas (12 artboards: desktop hero, mobile, one inner page per variant).

## 1. What the audit found

| Finding | Consequence |
|---|---|
| E–H exist only as standalone hash-routed files (`variants/variant-x/`, published as artifacts). They are not in the repo or the app. | Rebuild E–H as real themes inside `web/` (`BCCSite.themes.e…h`, `?design=e…h`), reusing live routes, catalogue, bag, checkout, reports and account. |
| E–H show CSS-drawn bottles, not the supplied mockups. | Use `web/media/*.webp` (real renders) everywhere. Monochrome derivatives for G and H. |
| E–H nav lacks Standards, About, Learn, Story, Search and Account. | Shared nav contract below, in every variant. |
| E reads as a card grid; F is ~12,500 px of alternating rooms; G is a dark list; H is a table. | Matches your brief's failure modes. Each concept below replaces the whole grammar, not the colours. |
| No `/about` route exists in the app (only `/story`). | Decision needed (§6). |
| Pushed `main` / `design/concepts` is at 6df6a74 (20 Oct). Today's seven-section homepage work (`home-flow.js`, branch `homepage-flow-a-h`) was committed locally in another chat and is not on GitHub. | Decision needed (§6): implementation must build on the true current baseline. |

## 2. References

Visual observations below are from familiarity with these sites. The reference fetches returned markup, not rendered pages, so layout notes are not measurements.

| Reference | What it contributes | Used in |
|---|---|---|
| [Aesop](https://www.aesop.com/) | Restraint at scale: small type, tonal grounds, slow image cross-fades, no badges. Product as object, never as a promotion. | F, H |
| [Le Labo](https://www.lelabofragrances.com/) | Label typography as identity: names set exactly as on the pack (caps + number), plain unit-based sizes, quiet copy. | E (product names in LEMON MILK, as printed) |
| [Teenage Engineering](https://teenage.engineering/products) | Products as a coded system: model numbers, colour as function, precise small type, nothing decorative. | E |
| [Minimalist (India)](https://beminimalist.co/) | Ingredient-first naming that Indian buyers already read fluently; shop by ingredient and format. Also a warning: promo bars and badges dilute a premium read. | E, H (formats and ingredients as navigation; no badges) |
| [Seed](https://seed.com/) | Three-word nav (Shop, Science, Learn) and education as a first-class route. Counter-lesson: unsourced figures — we show "awaiting approved label" instead. | All (Learn, Standards) |
| [SSENSE Editorial](https://www.ssense.com/en-us/editorial) | Editorial and shopping in one system: stories link straight to products, magazine furniture around commerce. | F |
| [Toteme](https://www.toteme.com/) | Editorial tiles instead of product grids on the landing; campaign image leads, catalogue follows. | F |
| [Saint Laurent](https://www.ysl.com/) | Monochrome luxury: full-bleed black, extreme type scale, one image per screen. | G |
| [The Row](https://www.therow.com/) | Text-only navigation, microcopy that states a fact and stops. | G, H |
| [Lemaire](https://www.lemaire.fr/) | Plain white product photography, lowercase menus, calm catalogue depth. | H |
| [Ritual — Made Traceable](https://www.glossy.co/beauty/ritual-vitamins-wants-traceability-to-become-the-new-transparency) | One place that gathers proof. | All (lot report as a first-class button) |
| [Cubitts shop (Awwwards element)](https://www.awwwards.com/inspiration/black-and-white-e-commerce) | Award-listed black-and-white e-commerce grid with clear thumbnails. | G (contact-sheet shop) |

## 3. Shared contract (all four)

- **Header:** logo → `/`, Shop, Standards, About, Learn, Story, Search, Lot report button, Account icon, Bag icon. Mobile: logo · search · account · bag · menu; Lot report is the first menu item and a hero CTA.
- **Homepage order:** 1 Hero · 2 Meet the collection · 3 Generate curiosity · 4 Trust and transparency · 5 Lot report · 6 Customer voices · 7 Before you order ("Good questions welcome here."). Every section carries `data-home-section`.
- **Content:** only `BCCSite.copy`, `SITE-COPY-LEDGER.md` and the catalogue. "Sample price", "Draft packaging", "Awaiting approved label", demonstration report states kept verbatim. No reviews, ratings, certifications, results or benefit claims. Pack-printed benefit lines are label artwork, never site copy.
- **Fonts:** Aileron and LEMON MILK only (brand files). **Logo:** supplied SVG, proportions untouched.
- **Accessibility:** native controls, one `h1`, focus to `h1` on route change, dialogs return focus, 4.5:1 text (dark text on light caps: Omega, Inositol, Psyllium), `prefers-reduced-motion` removes all motion.
- **Scope:** every customer route in `SITE-DESIGN.md`'s matrix, PDPs included. `/ops` untouched. A–D untouched.

## 4. The four directions

### E · Fan Deck — minimal, brand colours
- **Idea:** each bottle is a swatch — coloured cap over a cream body. The interface is built from that one unit: a cap band on top, a body below.
- **Signature move:** the homepage hero *is* the collection. Seven full-height chips stand side by side like a paint fan deck; choosing one opens it to show the real bottle, name, price and Add to bag. Mobile: seven stacked bands, first one open.
- **Type:** product names in LEMON MILK Bold uppercase, exactly as printed on the pack; Aileron Light display, Regular/SemiBold UI. Numbered 01–07 throughout.
- **Colour:** white ground, cream bodies (#f2f0eb), ink #2d2926. Cap colours only as information (chips, rules, line items, the 7-stripe index).
- **Product page:** the page is the bottle — a full-width cap-colour band holds header and name; the cream body below holds the buy card; the bottle photo straddles the seam. Sibling stripes at the foot switch products.
- **Shop:** format filter as segmented chips with counts; sort; cards are mini chips (cap band + body). **Cart/checkout:** each line led by its cap tick; progress as a 3-segment cap bar.
- **Inner pages:** Standards/Story/Learn use a single cap-colour rule per section; lot reports pick the product by its cap.
- **Motion:** chip opening (flex, 420 ms). Reduced motion: instant.
- **Different from previous E:** no grid-first home, no separate cap tray; the deck is the shop.

### F · Edition — premium editorial, brand colours
- **Idea:** the site reads like a printed edition about seven supplements. Paper (#f3f0ea, the bottle body), ink, folios, figure captions.
- **Signature move:** "close reading" — large cropped bottle photography on a cap-colour field, captioned as figures (Fig. 05), with detail crops (cap, wordmark, rear-label slot) on product pages.
- **Type:** Aileron UltraLight display at 84–104 px, Aileron Light Italic deks and captions, LEMON MILK 10 px folios ("Edition 01", "No. 05 of 07").
- **Homepage:** a cover (one bottle, one headline) then a seven-column Contents strip — the whole range above the fold's edge, not seven tall rooms. Curiosity is one question spread you can flip; trust and lot report set as a two-column article.
- **Product page:** split spread — colour field with figure left; folio, title, dek, price, quantity and Add to bag right; then close-reading crops and "Next · No. 06".
- **Shop:** Contents table plus an editorial grid with a 1-large / 2-small rhythm; filters as section tabs. **Learn:** true articles with drop caps and margin captions.
- **Motion:** one load moment per page (headline rises 12 px); figure crops ease in on hover. Reduced motion: none.
- **Different from E:** narrative and spread-based vs. systematic and modular; italic, folios and crops vs. chips and stripes.

### G · Darkroom — very premium, black and white
- **Idea:** a photographic darkroom. Black stage, grayscale prints, negatives, contact sheets.
- **Signature move:** a film strip of seven negatives (inverted thumbnails) under a huge monochrome bottle. Choosing a frame "develops" it into the print above.
- **Type:** Aileron UltraLight at 120–140 px against Aileron SemiBold uppercase controls; LEMON MILK 8–10 px as film edge markings (Frame 03 / 07).
- **Contrast control:** pure black and pure white for interface; greys appear only inside photographs and the soft spotlight behind the bottle.
- **Shop:** a white contact sheet — numbered black frames, loupe outline on focus, Frames/List toggle, filter and sort bar.
- **Product page:** black gallery (front, cap from above, rear-label slot) beside a white reading column; sections invert black↔white as you scroll.
- **Optional:** the existing GLB bottle models could be rendered once into new grayscale stills (three-quarter, top-down) for the gallery. No runtime 3D.
- **Motion:** 600 ms develop cross-fade; section inversion. Reduced motion: instant swaps.
- **Different from previous G:** scale and photography lead, not a list of names.

### H · Folio — minimal, black and white
- **Idea:** a well-set book. White page, strict grid, and a working margin.
- **Signature move:** the left margin carries running heads (§ 1 Hero, § 2 Meet the collection), a folio, and true sidenotes. Disclosures become numbered marginal notes — "₹799¹ → ¹ Prices are samples while the store is in preview." Pointing at an index entry shows its bottle in the margin.
- **Type:** Aileron Light 56–62 px headings, Regular 15–17 px text, tabular figures; no LEMON MILK.
- **Imagery:** small, precise monochrome bottles with museum-label captions. Restraint is the luxury.
- **Shop:** a two-column index (number, name, format, price) with filter links and counts; entries open to a ruled product page with sidenotes.
- **Lot report:** the strongest H page — underlined form fields, a ruled record, "what a report can't tell you" beside it.
- **Mobile:** sidenotes collapse into footnotes at the end of each block.
- **Motion:** none beyond focus and state.
- **Different from G:** white, small scale, typographic and quiet vs. black, huge scale and photographic. Different from previous H: no data table, no tiles.

## 5. Imagery plan
- Real mockups only (`web/media`). G/H use grayscale derivatives (contrast +25%, alpha kept).
- Detail crops are CSS crops of the same files.
- Optional: render new stills from the existing GLB models (top-down caps for E, three-quarter grayscale for G). No invented lifestyle or founder imagery; A–D's generated scenes are not reused.

## 6. Decisions needed before coding
1. **Approve, or redirect any of E–H.**
2. **About:** add a real `/about` route (short brand overview from existing copy, linking to Story and Standards), rendered for E–H only — or point the About link to `/story`.
3. **Baseline:** push `homepage-flow-a-h` (or send the zip) so E–H build on today's state, or build on pushed `design/concepts` @ 6df6a74.
4. **3D stills for G (and E caps):** yes or no.

## 7. Implementation plan (after approval)
- New files: `web/site-e.js…site-h.js`, `web/site-e.css…site-h.css`, `web/pdp-e.css…pdp-h.css`, `web/media/mono/*.webp`; small wiring in `web/app.js` / `index.html` for `?design=e…h` and the selector. A–D files unchanged.
- Verification: every route × E–H at 320/390/768/1100/1440; nav, filters, sort, PDP add, cart, checkout states, payment/order fixtures, search, reports (all states), account/OTP; homepage order check via `data-home-section`; backend tests; desktop and mobile screenshots per variant.
- Delivery: patch/zip against the agreed baseline plus integration notes.
