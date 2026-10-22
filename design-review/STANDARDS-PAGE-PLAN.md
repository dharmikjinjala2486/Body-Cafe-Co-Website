# Standards page redesign: plan for review

22 October 2026 · Proposal only. No code written.

## 0. What I inspected

- **Repo:** `design/concepts` @ `6df6a74` (GitHub). Only `main` and `design/concepts` are pushed.
- **Active Standards render path (A–D):**
  - `app.js` `/standards` → `call("standards")` → `S.themes[d].standards`.
  - B: `site-b.js` `standards()`.
  - A, C, D: `site-a/c/d.js` versions are **overridden** by `creative.js` (`r-standards`, "An open book").
  - All four: `atelier.js` then injects an "anatomy" layers block after the header.
  - Copy for every variant: `site.js` → `copy.standards` (lede, intro, five pillars, documented/planned/won't lists).
- **E–H: not in this repo.** Two unmerged sets exist (per `SYNC-2026-10-22-LOCAL-SNAPSHOT.md`):
  - Local snapshot: Cap Index / Rooms / Monolith / Formulary (`eh-*.js`).
  - Cloud branch `design/variants-e-h`: Fan Deck / Edition / Darkroom / Folio (`site-e…h.js`). Branch not pushed.
- **Local uncommitted A–D work** (13 patched files, `home-flow`, `five-directions-polish`, `direction-editorial`) is also not on GitHub and may add further Standards overrides.
- **Product data** (`app/server.py`): 7 SKUs with name, ingredient line, sample price, cap colour. Creatine Chews formulation "pending". No forms, amounts, serving sizes, allergens or directions.
- **Lot lookup** (`/api/reports`): demo lots only (`DEMO-xx-01`, `DEMO-UNPUBLISHED`, `DEMO-WITHDRAWN`, `DEMO-OUTAGE`); returns `document: null` and "Illustrative record only".
- **Requirements decks:** confirm *intent* (summary + redacted files per batch, batch QR + concealed unit code, traceability required before sale, two-person approval of claims/proof). Intent is not practice; none of it is live.
- **Records found:** no rear labels, supplier/origin data, manufacturer name or licence, QC procedure, CoAs, lab names, certifications, lot-number photo, editorial review log or last-reviewed date.

## 1. Research: useful patterns (not claims)

| Reference | Pattern worth using | Caution |
|---|---|---|
| Ritual — ingredient sourcing | One directory card per ingredient: name, form/descriptor, location; quality checkpoints summarised above the directory. | Cards show one location line, so origin vs. processing vs. final manufacture blurs. We separate them explicitly. |
| Thorne — quality | Testing told as ordered stages (raw materials → in-process → finished product → stability). Each certification sits alone, states its scope (facility vs. specific products) and links its certificate. | Third-party testing is mentioned without saying which stage it covers. We name the performer per stage or say it's unconfirmed. |
| Seed | Ingredient-level precision (named strains/forms) and research linked to registered studies rather than summarised as outcomes. | Separate "research on an ingredient" from "testing of our product". |
| NSF public listings | Certification is checkable: search by product or manufacturer on the certifier's own site. | Any future certification line must link to the certifier's listing, never only to our page. |

Takeaways applied: stage-by-stage structure, scope stated on every record, verification links leave our site, and a clear four-way split of evidence types.

## 2. Final content outline (identical across A–H)

Every evidence-led section uses: **What we mean → How it works → What you can check → Current status.** Status is one compact line plus an optional disclosure, never a block.

1. **Hero — "The detail behind the bottle."**
   - One-sentence approach: specific detail you can check, and plain status where records aren't ready.
   - Real mockups from `web/media/*.webp`, captioned "Draft packaging".
   - Actions: Explore our standards (`#glance`) · Find a lot report (`/reports`).
   - Compact index of sections 2–9 (sticky desktop, horizontal scroller mobile).
2. **Our standards, at a glance** — four principles, each one line + link:
   - Know the formula → §3 · Know the source → §4 · Understand the checks → §5–6 · Read the record → §7.
3. **What goes into the formula**
   - Confirmed: product names, ingredients in view, formats for all seven (Creatine Chews: "complete formulation pending").
   - Teach comparison: full name + form, amount per serving, serving size, units per pack, other ingredients and their roles, allergens, directions, cautions.
   - Annotated rear-label diagram: **schematic** of label fields (clearly a diagram, not our label) until approved labels exist.
   - Per-product selector (7 cap colours) showing confirmed fields and "Awaiting approved label" for the rest.
   - Link: `/learn/reading-a-label`, `/learn/ingredient-forms`.
4. **Where ingredients come from**
   - Three explicit terms: ingredient origin · processing location · finished-product manufacturer.
   - Per-product table uses those three columns. Today every cell is unconfirmed → render one honest status line per product group, not 21 "pending" cells.
5. **How quality is checked**
   - Show only substantiated stages. Today: none documented → short statement that the documented process and who performs each check will be published; no stage diagram until data exists.
   - When data arrives: stages (ingredient receipt, manufacturing controls, finished-product review, packaging/release, shelf-life) each with performer (manufacturer QC / named external lab / Body Café Co.).
6. **The evidence behind the standard**
   - "What does this prove?" comparison of four evidence types: ingredient research · finished-product testing · certification · lot report. Columns: what it checks · what it covers · what it can't tell you · where to verify.
   - Document library: designed and wired, shown only when records exist. Each record: product/lot, source, date/version, scope, verification link. Today: one line stating none published.
   - FSSAI note: a licence is a regulatory permission, not a quality certification; shown only once licence details are supplied.
7. **Follow your lot**
   - Choose the product → locate its lot number → open its record (`/reports?product=:id`).
   - Lot-location photo when supplied; until then a labelled schematic.
   - Scope note: one tested sample of one batch; doesn't authenticate an individual pack; no health outcome.
   - Demo records stay labelled "Demonstration record".
8. **How we communicate responsibly**
   - Only what's real today: Learn guides cite primary sources (NIH ODS, FSSAI 2016 regulations) linked inline; content rules from `site.js` (no invented doses, claims, reviews, certifications).
   - Distinguish ingredient research · product testing · customer experience.
   - Route to ask or report a correction: `/contact` (existing support case flow).
   - No reviewers, boards or review procedure until provided.
9. **Good questions about our standards** — 6 FAQs drawn from existing help copy: sourcing, testing, certifications, allergens, lot reports (incl. "Does a report prove my bottle is genuine?"), "Why isn't a document available yet?". Link `/help`, `/contact`.
10. **A clear next step** — Explore the collection (`/shop`) · Find your lot report (`/reports`) · Ask a question (`/contact`). Last-reviewed date shown only once an editorial review is recorded.

Linked, not duplicated: `/story` (founder), `/learn/*` (long guides), `/reports` (records).

## 3. Implementation shape (for parity)

- One content model in `site.js`: `copy.standards` v2 + `standardsRecords[productId]` with per-field `{ value | status }`. All eight variants read it, so facts can't drift.
- Shared semantic builders (index, disclosure, product selector, comparison, lot path); each variant supplies its own markup/CSS around them.
- A–D: register the new `standards` at the last layer and exclude `standards` from `atelier.js` injection. Other routes untouched.
- Native `<details>`, `<button>` hotspots with list fallback, one `h1`, visible focus, `prefers-reduced-motion` removes motion; comparison becomes stacked definitions under 600px.

## 4. Visual approach per variant

| | Direction | Standards expression | Signature (only where it aids understanding) | Mobile |
|---|---|---|---|---|
| A | State of Play — playful, LEMON MILK caps, metallic | A curiosity "machine" for the label: bold uppercase section stamps, big numerals 01–10 | Tap-to-inspect label anatomy (hotspots ↔ list) | Hotspots become a numbered list under the diagram |
| B | Expressive everyday — sage/lilac/lime/peach chips, bubbles | A conversation: each section opens with the visitor's question in a bubble, answer below | Principles as four colour chips; FAQ as bubble pairs | Single column, chips scroll horizontally |
| C | Everyday Elsewhere — little world, stamps, chapters | A journey: chapters with passport stamps; Follow your lot as a three-stop route | Route map for product → lot → record | Vertical route line |
| D | The Other Side — night museum, exhibition | Exhibition with wall text and museum labels; evidence types as four placards | Label anatomy in a lit vitrine | Placards stack; reduced glow |
| E | Fan Deck — cap chips, cream bodies, 01–07 | Each section headed by a cap-colour band; product selector is the fan of seven chips | Chip opens to that product's formula/source status | Stacked bands, first open |
| F | Edition — printed edition, folios, figures | A feature article: contents strip, Fig. captions, close-reading crop of the rear-label slot, sidebars for status | Figure crops; margin sidebar | Sidebars fold under paragraphs |
| G | Darkroom — black stage, contact sheets | Sections invert black↔white; evidence library as a contact sheet of numbered frames | Comparison as a lightbox you step through | Frames in one column |
| H | Folio — book, margin sidenotes | Running heads § 1–10; every "Current status" is a numbered marginal note | Sidenotes; ruled tables | Sidenotes become footnotes per block |

E–H descriptions follow the Fan Deck / Edition / Darkroom / Folio set. If the Cap Index / Rooms / Monolith / Formulary set is canonical, I'll restate them before coding.

## 5. Needed before accurate content

**Blocking build:**
1. Which E–H set is canonical, and its code (push `design/variants-e-h` or the local branch / zip).
2. The current local A–D baseline (13 uncommitted files) so overrides aren't lost.

**Business records (each unlocks a section; page ships honestly without them):**
- Approved rear labels for all 7: forms, amounts, serving size, units/pack, other ingredients, allergens, directions, cautions, storage. Creatine Chews formulation.
- Manufacturer name, location and FSSAI licence number per product.
- Ingredient origin and processing location per ingredient, with what you're willing to name publicly.
- Documented QC process: stages and who performs each (manufacturer QC, external lab name and accreditation).
- Any CoA / test reports per lot: date, version, scope, publishable/redacted copy.
- Any certifications: exact scope and certifier verification link.
- A photo of where the lot number sits on each pack.
- Editorial practice for claims/content (who reviews, how corrections are logged) and the date of the first review.
- Preferred correction channel (keep `/contact` or a dedicated address).
