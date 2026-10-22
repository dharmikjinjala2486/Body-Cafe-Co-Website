# Standards page, A–H: implementation notes

22 October 2026. Built on the verified merged snapshot (`body-cafe-merged-source/runtime-assets-20261022`, 311/311 files matched `_sync/MANIFEST.json`). Not committed, pushed or deployed.

The approved plan is in `design-review/STANDARDS-PAGE-PLAN.md`.

## What changed

**New files:**

| File | Purpose |
|---|---|
| `web/standards.js` | Content model, per-product records, shared builders, eight direction composers, behaviour |
| `web/standards.css` | Shared structure plus one scoped block per direction (`.sx-a` … `.sx-h`) |
| `design-tools/qa-standards/verify_standards.py` | Standards QA across A–H |
| `design-tools/qa-standards/compare_other_routes.py` | Checks every other route is unchanged against a baseline server |
| `design-review/STANDARDS-PAGE-PLAN.md` | The plan the owner approved |

**Edited (wiring only):**
- `web/index.html`: one stylesheet and one script, after `site-h.*` and before `app.js`.
- `web/app.js`: one line in `enhance()`, `window.BCCStandards?.enhance?.();`.

**Not touched:**
- Headers, navigation and footers.
- Every other route.
- The lot lookup, checkout, account and operations.
- The backend.

`standards.js` replaces only the `standards` renderer on each theme. That also retires the old `atelier.js` anatomy block on `/standards`, because `atelier.js` wrapped the old renderer. The previous renderers stay in the code (in `site-a…d.js`, `creative.js` and `site-eh.js`) but no longer render.

## One model, eight compositions

All eight directions read `BCCStandards.model` and `BCCStandards.records`, so section order, wording and facts can't drift between them. `verify_standards.py` checks this: headings, statuses, FAQs, evidence rows, principles, product panels, steps and fields must be identical in all eight.

Section order follows the approved flow:

| | Section | Anchor |
|---|---|---|
| 1 | Hero | — |
| 2 | At a glance | `#glance` |
| 3 | Formula | `#formula` |
| 4 | Sources | `#source` |
| 5 | Quality checks | `#checks` |
| 6 | Evidence | `#evidence` |
| 7 | Your lot | `#lot` (keeps the existing `/standards#lot` links working) |
| 8 | How we communicate | `#communicate` |
| 9 | Questions | `#questions` |
| 10 | Next step | `#next` |

How each direction frames the same content:

| | Direction | Framing |
|---|---|---|
| A | State of Play | Anton poster headlines in electric blue on fog. Scattered bottles. Lime highlighter for every status. Blue closing panel. |
| B | Expressive everyday | Each section opens with the visitor's question in a speech bubble, on its own rounded colour field. Pills and chips. |
| C | Everyday Elsewhere | Chapters with stamps, Gloock serif, a postcard hero and a dashed route for "Follow your lot". Blue closing panel. |
| D | The Other Side | Midnight museum. Room numbers, centred wall text, a lit vitrine and gold placards. |
| E | Fan Deck | Cap-colour band on every section. Seven chips in the hero. Cap-coded principles, product picker and lot links. |
| F | Edition | Feature article. Edition folio, ultralight display, italic deks, Fig. captions, contents index. |
| G | Darkroom | Black stage, spotlit bottle, sections alternating negative and print, Frame NN / 10 markers. Monochrome interface, real-colour bottles. |
| H | Folio | Book page. § running heads in a sticky margin. Every Current status is a numbered sidenote, which becomes a footnote on phones. The evidence comparison is a ruled list. |

## Interactions

Each interaction is here only where it helps inspection. Every one is keyboard-operable, and reduced motion removes all transitions.

- **Product picker.** Buttons with `aria-pressed`; arrow keys, Home and End move between products. Each panel shows only confirmed facts, one "Awaiting approved label" line, and the first two checks from that product's sourced ingredient note.
- **Label anatomy.** Hovering or focusing a field lights its zone on the rear-label diagram. The diagram is `aria-hidden`; the list carries the content.
- **Optional expansion** (`<details data-sx-wide-open>`). Open on wide screens, collapsed to a summary on phones. Used for: field descriptions, how to compare products, published/pending lists, what every document will name, and the three kinds of statement.
- **Evidence comparison.** A real table with scoped headers. Up to 1180px it becomes one expandable entry per kind of evidence, with its status visible while collapsed. H uses the list at every width.
- **Section index.** Marks the section being read with `aria-current`.

## Facts kept honest

**What the page publishes:**
- Live catalogue facts: name, ingredient in view and format.
- The existing sourced ingredient notes (NIH ODS) and FSSAI references.
- The existing help answers.
- Demonstration lot states.

**What is labelled:**
- Every pack image is captioned as draft packaging.
- The lot-number figure is labelled as a schematic.
- The rear label is labelled as a diagram, not an approved label.

**Status lines** (one per section):

| Section | Status |
|---|---|
| Formula | Partly published |
| Sources | Not yet published |
| Quality checks | Not yet published |
| Evidence | Not yet published |
| Lot | Demonstration only |
| Communication | No editorial review yet, so no review date |

**Never stated:**
- Suppliers, origins or manufacturers.
- Quality stages or checks.
- Laboratories or results.
- Certifications.
- Reviewers or review dates.
- Benefits or sustainability.

"Quality checks" shows the questions a documented process should answer. They are explicitly framed as questions, not as Body Café Co. practice.

## Filling in records later

All of these live in `web/standards.js`:
- **Formulation:** `RECORDS[productId]` has `label`, `origin`, `processing`, `manufacturer`, `quality`, `documents` and `certifications`, currently null or empty. Creatine Chews also carries `formulation: "pending"`. When records arrive, extend the panel builders to render these fields where they exist.
- **Review date:** `M.reviewed` stays `null` until an editorial review is recorded. Set it to an ISO date and every direction shows "Last reviewed …" in section 10.
- **Wording:** all copy is in `M`. Keep each status line in step with the records.

## Verification (this change)

| Check | Result |
|---|---|
| `python3 -B -m unittest app.test_server app.test_http` | 24 tests pass |
| `node --check web/*.js` | All files pass |
| `deploy/build_netlify.py` + `node deploy/test_hosted_preview.mjs` | Pass; export includes `standards.css` / `standards.js` |
| `design-tools/qa-standards/verify_standards.py` (A–H at 320, 390, 768, 1100, 1440) | 0 failures |
| `design-tools/qa-e-h/flows.py e,f,g,h` (1440 and 390) | All pass: E 26/26 + 27/27, F 26/26 + 27/27, G 26/26 + 27/27, H 25/25 + 26/26 |
| `design-tools/qa-e-h/verify.py e,f,g,h` (69 routes and states, 5 widths) | No problems beyond the 20 expected `DEMO-OUTAGE` 503 console lines (one per direction and width) |
| Every other route compared against the untouched baseline (20 routes × A–H × 1440/390, rendered `#app` DOM with reduced motion) | 320/320 identical |

What `verify_standards.py` covers:
- No page or console errors.
- One `h1`.
- The ten sections in order.
- Unique ids, and every in-page anchor resolves.
- No horizontal overflow, including inside the evidence table.
- Images carry dimensions.
- Optional-expansion state per width.
- Product picker by mouse and keyboard.
- The `#glance` jump lands on its section.
- axe-core 4 on the Standards region at 390 and 1440 (contrast, landmarks, scrollable regions, names).
- Every internal link renders a real route.
- Facts parity across A–H.
- No transitions or animation under `prefers-reduced-motion`.

This is not a full WCAG audit or a field-performance check.

## Applying locally

1. Start from the same merged snapshot.
2. Either:
   - apply `standards-a-h.patch` (`git apply standards-a-h.patch`), or
   - copy the files from the overlay ZIP over the snapshot, keeping their paths.
3. Run the checks above with the server on `127.0.0.1:4174`.
