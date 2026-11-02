# Variant E Story: owner-selected copy, Super Sevens presentation

2 November 2026 · Local implementation only. Nothing committed, pushed or deployed.

Brief: [story-source-2026-11-02/CLAUDE-BRIEF.md](story-source-2026-11-02/CLAUDE-BRIEF.md). Source: `ourStory()` with `boardHTML(true)`, `dayHTML()`, `PRODUCTS` and `BRAND` in the frozen [reference-index.html](story-source-2026-11-02/reference-index.html).

## What changed
| File | Change |
|---|---|
| `web/story-e.js` (new) | E's `/story` renderer. Holds the reference copy verbatim, in source order and with source punctuation. It loads after `super-sevens.js` and replaces `S.themes.e.story` outright. There is no fallback to the earlier "How seven became a system" object story. |
| `web/story-e.css` (new) | Presentation, scoped to `.eh-e .ssy`. |
| `web/index.html` | Loads the two files after `super-sevens.css/js`. |
| `web/super-sevens.js` | Removed the old Story add-on (the 8→7 block and object reveal), which the new page replaces. Exports `cast` so the Story mark gets the cap colours on a direct first load. |
| `design-tools/story-source-text.mjs` (new) | Renders the reference `ourStory()` in Node and prints its visible text. |
| `design-tools/test-story-e-parity.mjs` (new) | Renders `story-e.js` and compares its visible text with the reference, character for character with whitespace ignored. Also checks every link. |

Nothing else changed: other routes and variants A–D and F–H, backend, admin and commerce are untouched. `CLAUDE-SYNC.md` was already modified by someone else and was left alone.

## Content preserved (exactly)
- **Hero:** eyebrow "Our story", the title, and the lede.
- **Chapters I–VII:** each with its numeral, title and all paragraphs, including both pull lines and chapter I's opening line.
- **Chapter III:** the "Today's menu" board in source order, with all seven lines, amounts and sub-lines. It includes L-Theanine's " · supply being confirmed" and the board footnote.
- **Chapter IV:** the four bold-led paragraphs and all six decision-table rows under their three headers.
- **Chapter V:** five beliefs, with curly quotes as in the source.
- **Chapter VI:** six proof items, including the FSSAI licence line built from `BRAND.fssai`.
- **Chapter VII:** prose, the pull line, and the day routine. Morning lists D3+K2, Omega-3, Iron "(before chai)" and Inositol, and omits held L-Theanine as `dayHTML()` does. "Your chosen time" lists Creatine Chews and Night lists Psyllium Husk (Isabgol). The footnote is kept.
- **Manifesto:** all five lines and the tagline.
- **Final CTA:** "Start with one. Read the whole label." with "Explore our products".

## Route mapping
- `data-go="p-<slug>"` maps to `/products/<slug>` for the 7 menu lines and 6 table rows. All slugs exist in the current catalogue. Display text stays the source name, so "Psyllium Husk (Isabgol)" is kept.
- `data-go="products"` ("Explore our products") maps to `/shop`.

## Design (E / Super Sevens)
- **Hero:** the Super Sevens mark plus the seven caps.
- **Chapters:** each takes one cap colour in catalogue order. On desktop (above 1100 px) a sticky rail mark lights one segment per chapter. By chapter III segments a–c form the 7, and by chapter VII all seven are lit. The rail is decorative (`aria-hidden`) and contains no text.
- **Below 1100 px:** each chapter number shows its own segment glyph instead.
- **Menu:** a cream "Today's menu" board with real cap renders and dotted leaders. Every line is a link.
- **Chapter IV:** four step cards, then the decision table. On phones the table becomes one card per product. The header text stays in the DOM, visually hidden, and CSS captions supply the labels.
- **Beliefs:** large type with cap-colour bars.
- **Proof:** cream tiles.
- **Day routine:** morning, chosen-time and night panels.
- **Manifesto:** a full-bleed ink band.
- **CTA:** a pill button.
- **Motion:** entrance reveals run only after the script starts and never under reduced motion. Content is fully visible without them.

## Verification
- `node design-tools/test-story-e-parity.mjs`: **passed**. All 4,953 non-whitespace characters match the reference `ourStory()`, and 14 links are mapped (7 menu, 6 table, 1 CTA).
- The browser `textContent` of the rendered page was inspected and matches the same sequence.
- Browser at 1440 × 900, 1280 × 800, 820 × 1180 and 390 × 844:
  - No horizontal overflow.
  - No console errors.
  - The rail lights 3 segments at chapter III and 7 at chapter VII.
  - Keyboard Tab reaches all 14 links with a visible 2 px focus ring.
  - Title is "Our story — Body Café Co.".
- Other suites:
  - `test_storefront_theme.mjs` and `test-preview-content.mjs` passed.
  - Python app suite passed (100 tests).
  - `deploy/test_hosted_preview.mjs` could not run: the current `dist/` is a connected build without `dist/web/catalog-preview.json`. That's an environment state, unrelated to this change. I did not rebuild `dist/` in the shared checkout.
- Reduced motion was checked in code and CSS, not emulated in the browser. Not tested on physical devices or Safari.

## Data conflicts to resolve (text kept exactly as selected)
1. **Testing and certification claims.** Chapters IV and VI say products are "third-party tested", ingredients "traceable", facilities "GMP-certified", and "Scan the code on any bottle". This Website's Standards and lot-report pages say testing documents are not yet published. The label records establish manufacturers, not lab testing or certification. Supporting evidence, or a copy decision, is needed before launch.
2. **L-Theanine status.** The source marks it held ("supply being confirmed") and leaves it out of the morning routine. The live catalogue shows it published and in stock.
3. **FSSAI licence 10726994000121** for Bluebell Lifecare Pvt. Ltd. is not recorded anywhere else in this Website. The labels confirm Bluebell as marketer, but not this number.
4. **Product names.** The source says "Psyllium Husk (Isabgol)"; the catalogue name is "Psyllium Husk". The source name is shown and links to the catalogue route.
5. **Colours.** The reference accent colours differ from the current cap colours. Presentation uses the live cap colours; no copy is affected.
6. **About page link.** It still labels the Story link "How seven became a system". That is outside this assignment's scope and was left unchanged.
7. **Psyllium fibre figures.** The source `PRODUCTS` says 1600 mg dietary and 400 mg soluble fibre; the label records say 1,578 mg and 1,362 mg. These figures do **not** appear on the Story page, so the page is unaffected. The difference matters only if other source copy is reused.

## Update (same day): conflicts checked against the master label
The supplied `Full Final Label.ai` (read-only text extraction) settles two of the conflicts above:
- **Conflict 1** is partly resolved. Every label prints "THIRD-PARTY TESTED · TRACEABLE INGREDIENTS · NO HIDDEN BLENDS · GMP CERTIFIED" and "SCAN FOR MORE", so the Story wording matches the labels. Supporting reports and certificates are still not published on the site.
- **Conflict 3** is resolved. The labels print "Bluebell Lifecare Pvt. Ltd. … Lic. No. 10726994000121".

See `OTHER-CONTENT-MAP-2026-11-02.md` for the full fact table.
