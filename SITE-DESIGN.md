# Latest refinement — 20 October 2026

Current directions: A **State of Play**, B **Expressive everyday**, C **Everyday Elsewhere**, D **The Other Side**. A retains its sculpture with smooth source bottles/caps; D now tells a four-chapter bottle-and-cap scroll story. All four themes gain interactive sections and original, unrecoloured header/footer logo artwork. Read [REFINEMENT-20261020.md](REFINEMENT-20261020.md) for the current scope, implementation and checks. Older entries below are historical snapshots.

# Current direction update — 20 October 2026

A/C/D are replaced by **Instrument**, **Liner Notes** and **Screening Room** across all customer page families and all seven product detail pages. B (**Expressive everyday**) is preserved. The new implementation is in `web/creative.js` and `web/creative.css`. Read `CREATIVE-RESET-RESEARCH.md` for current decisions, coverage and checks. The document below describes the superseded 19 October designs and is retained for history.

# Body Café Co. — four complete website directions

Baseline: `design/concepts @ cf8376f`. Frontend design and content only. No backend, schema, integration, deployment or pushes.

Every customer route now renders in all four directions. The selected direction persists on every internal link, across reload, back and forward, and in fresh tabs that carry `?design=`. The design selector switches direction on the same route, entity, query and anchor. `/ops` keeps the shared operations chrome (`body[data-theme=""]`), so no themed style reaches it.

## How it is built

| Layer | File | Role |
|---|---|---|
| Shared content | `web/site.js` | `window.BCCSite`: all page copy, three guides, seven ingredient notes, five policy drafts, synthetic fixtures, design-state index, source lists. One source of truth; facts are identical in every direction. |
| Shared primitives | `web/site.css` | Field hints and errors, summary rows, report-result hierarchy, loading spinner, preference rows. Scoped to `body[data-theme]`. |
| Direction modules | `web/site-a.js` … `web/site-d.js` | Each registers `BCCSite.themes.x` with `chrome`, `shop`, `bundles`, `search`, `standards`, `story`, `learn` (hub, guide, note), `reports`, `cart`, `checkout`, `payment`, `order`, `account`, `help`, `contact`, `policy`, `settings`, `notFound`, `unavailable`, `states` and `learnOffline`. A and B also provide `home`; C and D keep their existing homepages. |
| Direction styles | `web/site-a.css` … `web/site-d.css` | Scoped to `body[data-theme="x"]`. |
| App wiring | `web/app.js` | Calls `theme[name](ctx, …)` with a fallback to the existing template. Also handles `?design=` persistence, the selector, `?state=` fixtures, shared form builders (same ids and names, so existing handlers and validation still apply), report-result markup and the static-preview unavailable route. |
| Old concept URLs | `concepts/app.js` | `/concepts/index.html?concept=a|b#anchor` forwards to `/?design=a|b#anchor` in the shared site. |

### Synthetic fixtures

`?state=` applies only on the routes below. Fixture data comes from `BCCSite.fixtures`. Every fixture field and action is disabled, and no API call is made. `/preview/states` lists them all.

| Route | Fixture states |
|---|---|
| `/checkout` | `sample`, `errors`, `unavailable` |
| `/payment/SAMPLE-1042` | `pending`, `failed`, `paid`, `expired`, `unavailable` |
| `/orders/SAMPLE-1042` | `paid`, `shipped`, `delivered`, `cancelled` |
| `/account`, `/account/addresses`, `/account/cases` | `signed-out`, `code`, `empty`, `orders`, `sample` |
| `/contact` | `errors`, `submitted`, `unavailable` |

## The four visual grammars

Each grammar is defined by composition, type, density, framing and navigation, not by colour alone. The grayscale contact sheet with the selector hidden is in `screenshots/sheets/`.

### A — Warm editorial
- **Character.** A magazine about seven products: composed, human and unhurried.
- **Type.** Aileron Regular set large and tight (−0.055em), with olive emphasis words. Small tracked uppercase eyebrows. No heavy weights.
- **Surface.** Warm ivory paper (#f6f3ec) with sand panels, hairline rules, square corners and square controls.
- **Composition.** Numbered editorial spreads with a sticky left column and long right column. Mastheads with an aside. A lead-product grid on the shop. A drop-cap story opening. Footnote-style annotations. A margin box ("Where it stands today") on standards.
- **Imagery.** Full-bleed product photography (`/concepts/media`) cropped as editorial plates.
- **Navigation.** Text nav with an underline for the current page. "Find your lot report ↗" as a text link. A numbered mobile menu. A light footer with an oversized wordmark.
- **Commerce.** Quiet ruled tables. The summary is a bordered paper card. The checkout steps are numbered spreads.

### B — Expressive everyday
- **Character.** Bold, friendly and colourful, with discipline on purchase surfaces.
- **Type.** Aileron Bold at −0.07em, very large, with indigo emphasis. Pills for every label.
- **Surface.** Colour fields in lilac, sage, lime, peach and indigo. Two-pixel ink outlines. Radii of 26–40px.
- **Composition.** Arch-framed product cards (radius 200px top). Tilted photo cards, stickers and speech bubbles. Coloured section bands. A format switcher of big coloured tiles with cap dots. Overlapping duo photos for edits. Pillar bands with rotated number badges. A mega-type manifesto with a lime highlighter word.
- **Imagery.** Photography inside arches and tilted frames.
- **Navigation.** A pill navigation capsule. A lilac "Lot reports" pill. An ink bag pill with a lime count. A mobile menu with coloured number discs. A peach footer with a lime sticker and a giant wordmark.
- **Commerce.** Paper panels, ink pill buttons, a plain summary card and pill progress steps. Colour is held back where people enter details.

### C — Pick a cap
- **Character.** The café counter. The cap seen from above is the key to everything.
- **Type.** LEMON MILK uppercase display everywhere, with small tracked uppercase kickers that start with a dot.
- **Surface.** Cool Pantone 656 paper (#e4e9ef) with bottle-white tiles.
- **Composition.** Café menu boards with dotted leaders: the shop menu is grouped by format, and rows sit on a dotted leader to the price. Standards are an accordion of "house rules" that floods with the cap colour. Learn has a chalkboard "Today's specials" board.
- **Bands.** Full-bleed cap-colour bands with oversized watermark numerals or names (story chapters, guide and note headers, payment states).
- **Receipts.** Perforated order tickets are reserved for the bag, checkout summary, payment and order.
- **Imagery.** Cut-out bottles (`/web/media`) on cap-tinted tiles, with a hover peek on the menu.
- **Navigation.** The shared storefront header and footer, extended with a clickable cap row, cap rails (jump to a product or note) and cap pickers on reports.

### D — Still life
- **Character.** A gallery and the packaging's own documents: precise, quiet and premium.
- **Type.** Aileron Light (300) at display sizes with muted second clauses. LEMON MILK only for small tracked labels (catalogue numbers, section labels).
- **Surface.** Porcelain (#f5f2ec), plus roast-dark rooms (#1f1915) where the bottle is "turned over".
- **Imagery.** Every product is an object on a CSS porcelain plinth in morning window light, with blinds, a cast shadow and vertical side text. A museum wall label ("No. 04 of 07 · Softgels") sits beneath each object. Empty plinths stand in for no-match, empty bag, 404 and the founder slot.
- **Documents.** Boxed facts panels with heavy rules (8px and 4px) are used for contents, summaries, report anatomy, promises and approval gaps. Standards and policies are set as a contents-indexed document.
- **Learning.** Learn is an A–D index.
- **Story.** A centred brand essay with the seven on one shelf.
- **Navigation.** A centred logo, LEMON MILK small-caps nav, and "Bag (0)" in text with a ring count. A roast footer with the catalogue list of seven.

## Route × direction completion matrix

✓ means the route is designed in that direction with direction-specific composition. Every cell was smoke-tested at 320, 390, 768, 1100 and 1440px; the QA report has the results.

| Route | States covered | A | B | C | D |
|---|---|---|---|---|---|
| `/` | Hero, collection, evidence, honest reviews status, lot band, story, learn, care | ✓ new in-app | ✓ new in-app | ✓ existing (kept) | ✓ existing Still life (kept) |
| `/concepts/index.html?concept=a\|b#…` | Redirect into the shared site with anchor | ✓ | ✓ | n/a | n/a |
| `/shop` | All, `?format=Capsules\|Softgels\|Chewable tablets`, unknown format (no-match), guidance, compare table, care note | ✓ | ✓ | ✓ | ✓ |
| `/products/:id` ×7 | Existing four PDP systems (unchanged in this pass) | ✓ | ✓ | ✓ | ✓ |
| `/bundles`, `/bundles/daily-edit`, `/bundles/curious-edit`, unknown id → 404 | List, detail, itemised sample total, status | ✓ | ✓ | ✓ | ✓ |
| `/search` | Empty (hints), results by type, report-intent callout, no results | ✓ | ✓ | ✓ | ✓ |
| `/standards` | Five pillars, "now" status each, documented / planned / won't ledger, anchors | ✓ | ✓ | ✓ | ✓ |
| `/story` | Opening, four chapters, promises and refusals, founder slot and missing inputs | ✓ | ✓ | ✓ | ✓ |
| `/learn` | Topics, three guides, seven notes, glossary; offline state | ✓ | ✓ | ✓ | ✓ |
| `/learn/reading-a-label`, `/understanding-reports`, `/ingredient-forms` | Summary, takeaways, TOC, sections, illustrative example, checklist, sources, related | ✓ | ✓ | ✓ | ✓ |
| `/learn/:product-id` ×7 | Lead, what to check, compound/active note, awaiting-label list, sources, other notes | ✓ | ✓ | ✓ | ✓ |
| `/reports?product=:id&lot=` | Initial, loading, sample match, not found, unpublished, withdrawn, outage / unavailable with retry | ✓ | ✓ | ✓ | ✓ |
| `/cart` | Empty, populated, quantity update, remove, next links | ✓ | ✓ | ✓ | ✓ |
| `/checkout` | Live (from bag), empty, `?state=sample`, `errors`, `unavailable`, static-preview unavailable | ✓ | ✓ | ✓ | ✓ |
| `/payment/:id` | pending, failed, paid, expired, unavailable, inactive (live and fixture) | ✓ | ✓ | ✓ | ✓ |
| `/orders/:id` | paid, shipped, delivered (with review form), cancelled, not found, refund and tracking notes | ✓ | ✓ | ✓ | ✓ |
| `/account`, `/account/addresses`, `/account/cases` | Signed out (OTP), code entry, empty, orders, sample addresses, sample cases | ✓ | ✓ | ✓ | ✓ |
| `/help` | Six topics (safety distinct), FAQs by topic, contact CTA | ✓ | ✓ | ✓ | ✓ |
| `/contact` | Form, `?kind=` / `?order=` prefill, errors, submitted, unavailable | ✓ | ✓ | ✓ | ✓ |
| `/policies/shipping\|returns\|cancellation\|privacy\|terms` | Plain summary; sections tagged Working direction / Unresolved / Preview behaviour | ✓ | ✓ | ✓ | ✓ |
| `/settings` | Always-on and optional groups, save | ✓ | ✓ | ✓ | ✓ |
| `/preview/states` | Index of every synthetic fixture | ✓ | ✓ | ✓ | ✓ |
| Unknown route | 404 with recovery links | ✓ | ✓ | ✓ | ✓ |
| Static build blocked routes | Theme-matched "not available" plus links to fixtures | ✓ | ✓ | ✓ | ✓ |
| Global chrome | Header, mobile menu, footer, selector, focus, breadcrumbs | ✓ | ✓ | ✓ (shared storefront chrome, extended) | ✓ |

### Genuine limits
- **PDPs.** The 28 product × direction pages are the systems integrated at fd0a167. This pass did not redesign them; they are still covered by the persistence and smoke checks.
- **C chrome.** C keeps the shared storefront header and footer, which are C's native chrome, extended with clickable caps and policy titles. It is not a separate new header.
- **Shared overlays.** The search dialog and toasts use the shared storefront styling in every direction.
- **Product imagery.** The Vitamin D3 + K2 mockup is framed tighter than the other six; D scales it down on plinths and shelves. No new photography exists: there is no rear label, product-in-hand or founder imagery.
- **Out-of-stock.** The out-of-stock / unavailable add state is designed (disabled "Unavailable" control) but appears only when catalogue stock is 0. No fixture forces it on the listing pages.

### Latest A/D homepage direction

A: State of Play. D: The Other Side. Both are real-time product geometry experiences, superseding the earlier Instrument / Curiosity Machine and Screening Room / Night Museum homepages. See `MOTION-RESEARCH.md` for reference analysis and implementation details. The final override loads from `live.js` after the world/cinema layers.
