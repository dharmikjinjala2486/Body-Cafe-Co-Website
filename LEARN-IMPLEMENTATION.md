# Learn — A–H implementation

22 October 2026. This builds on `3216b09` plus the About package (`body-cafe-co-about-a-h.zip`). The About package must be applied first. Not pushed or deployed.

## What changed

Learn is now a knowledge hub with linked guides rather than one long page. Every direction shares the same information architecture, facts and behaviour, and each composes it in its own visual language.

| Route | Page |
|---|---|
| `/learn` | Hub, with nine parts (below) |
| `/learn/<product-id>` ×7 | Product guides, 11 sections each |
| `/learn/reading-a-label`, `/learn/ingredient-forms`, `/learn/serving-sizes`, `/learn/understanding-evidence`, `/learn/understanding-reports` | Five foundation guides. Two are new; the three originals keep their content, gaining glossary links, worked examples and versions. |
| `/learn/glossary` | Connected glossary: 29 terms, A–Z, each with its own anchor |

`web/learn.js` replaces each theme's `learn` renderer, the same way Shop, About, Standards and the product pages are handled. The `learnOffline` flag behaviour is unchanged. Unknown `/learn/<slug>` routes fall back to each theme's own handling.

### Hub flow

1. **"A little more knowing."**
   - An introduction with search. The query lives in the address (`?q=`), so it can be shared and survives refresh and Back.
   - Example questions to try, and a topic bar with links to every section and the glossary.
2. **Start here.** Three paths: understand a product, read labels and evidence, or get to know Body Café Co.
3. **Explore all seven products.**
   - Real front-of-pack images (draft packaging), names, formats and actual reading times.
   - A one-line introduction drawn from each guide.
   - The **"Understand this bottle"** explorer: What is it? → Formula → Label → Evidence → Records. Each step links to real guide sections and app routes: the product page `#ingredients`, `/reports?product=…`, and Standards.
4. **The supplement essentials.** The five foundation guides, with reading times.
5. **Look beyond the front label.**
   - An educational example label, clearly marked as such.
   - Six selectable parts: serving size, ingredient amounts, other ingredients, allergens, cautions, lot number.
   - The same information as plain text.
6. **Understand the evidence.**
   - Ingredient research, finished-product testing, certification and lot reports. For each: what it can establish, what it can't, and where Body Café Co. stands today.
   - A step-by-step report walkthrough on a clearly marked example: product, lot, test, method, result, units, specification. It's also available as text, with a separate link to the real lot lookup.
7. **Inside Body Café Co.** Short introductions linking to About, Story, About `#collection` and Standards.
8. **Good questions, clearly answered.**
   - Ten filterable questions, each linked to the guide section that answers it.
   - "Ask a new question" opens a private support case with the page reference attached.
9. **Keep exploring.**
   - Saved guides and "Continue reading", stored in this browser, each with a remove/clear control.
   - A few good starting points. Nothing is labelled "new" or "updated".

### Product guides (all seven, same structure)

1. **In a minute**, followed by a visible **Before you take it** box: the approved care note, any sourced product-specific safety note, and "directions, cautions and storage: awaiting approved label".
2. **What it is** *(About the ingredient · general information)*. Identity only, cited.
3. **Names, forms and terms** *(general)*. The product-specific topics from the brief. Each is cited, with no invented amounts.
4. **What the research says** *(general)*. A status line: a reviewed research summary is being prepared, so no findings or outcomes are summarised yet. It explains why ingredient research isn't evidence about our product, and links to the independent primary sources.
5. **Inside our product** *(In our product · Body Café Co. facts)*:
   - Catalogue name, ingredient in view, format, cap colour, any approved allergen note, and formulation status.
   - The list of items awaiting the approved label.
   - The draft-pack image, captioned.
6. **How to read this label.**
7. **Usage, cautions and storage** *(ours)*. Each one awaits the approved label; we don't suggest a dose.
8. **Quality, sourcing and lot records** *(ours)*:
   - Sourcing: not yet published.
   - Test results: none published.
   - Certifications: none claimed.
   - Lot lookup, with the demonstration-record disclosure and the sample lot.
9. **Common questions.** Linked to sections, and to the product page's moderated Q&A.
10. **Sources and versions.** Numbered sources; written by *Body Café Co. editorial*; review status *Not yet specialist-reviewed*; version 0.1, 22 October 2026 (first version).
11. **Keep going.** Links to the product page, related essentials, the next product guide and support.

Every guide also has:
- Breadcrumbs and one h1.
- A summary and a reading time computed from its own text.
- A sticky table of contents with section highlighting.
- Sources placed next to the claims they support.
- Inline glossary definitions.
- Save, print and copy-link actions.
- A copy-link button for each section.
- Feedback, related guides, and a route back to the hub.

### Interactions

- **Search.** Covers product names, ingredient names, glossary terms, guide sections and the hub questions. Results show the type, the guide and section, and an excerpt with the matched words highlighted, and link straight to the section anchor. There's a no-results state with suggestions, a reset, and the example queries.
- **Product explorer.** The products form a radio group and the steps are tabs. Arrow, Home and End keys work in both, and both respond to touch.
- **Inline glossary.** `{{term|text}}` in content becomes a disclosure button (`aria-expanded`/`aria-controls`) that opens a short definition with a link to the full glossary entry. Escape closes it, and only one is open at a time.
- **Two reading depths.** Each guide leads with "In a minute" and the caution box, then the detail. Nothing essential is hidden: the label explorer and report walkthrough also exist as text.
- **Save, resume and clear.** Stored in `localStorage` under `bcc-learn`: up to 20 saved guides, and the last 6 guides with the section you reached. Remove or clear buttons are on the hub. If storage isn't available, the page says so. Nothing is sent to the server, no account is needed, and nothing about health is inferred.
- **Shareable links.** Each section has a copy-link button (the clipboard API, with a visible fallback), and the address updates to the section anchor. Direct links open at the section. The design parameter is always kept.
- **Feedback** (server-backed, with no mock success):
  - *Was this explanation clear?* `POST /api/learn/feedback` stores the page, the section, yes or no, and the session id, and nothing else. A repeat answer replaces the earlier one. Totals per page appear in the Operations snapshot (`learn_feedback`).
  - *Suggest a correction* and *Ask a follow-up* create a **private** support case (`kind: "learn"`) with a validated page or section reference (`topic`) and a subject. You get a real case ID, and the case shows in your account and in Operations. There's validation, an error state and protection against double sends.
  - *Ask a new question* on the hub opens the contact form, where the new "A Learn guide" type and the page reference are pre-set.
  - On the static Netlify preview, all feedback controls are disabled with an honest message.
- **Printable learning sheets.** "Print learning sheet", or Ctrl/Cmd+P on a guide, prints a one-page sheet built from the same content:
  - Product guides include the summary, confirmed facts, what's awaiting the label, what to check, the caution note and sources.
  - Foundation guides include the key points, the checklist and the marked example.
  - Every sheet carries the version, the review status, the page address and "not personal advice or a treatment plan".

## Server and app changes

- **`app/server.py`:**
  - New table `learn_feedback(page, section, clear, session, created)`.
  - New endpoint `POST /api/learn/feedback`, which validates the page reference and section and requires a yes/no answer.
  - Support cases accept `kind: "learn"`, an optional `topic` (validated against `/learn[/slug][#section]`) and `feedback` (`correction` or `followup`).
  - The Operations snapshot adds `learn_feedback` totals.
- **`app/test_server.py`.** Two new tests: Learn cases keep their page reference, and invalid references are rejected; feedback is validated and counted once per session.
- **`web/app.js`:**
  - "A Learn guide" option in the contact forms.
  - `caseTopic()`: a validated page reference from `?topic=`, sent as a hidden field and shown as "About: …".
  - A "Learn guide" label on case cards.
  - `enhance()` calls `BCCLearn.enhance()`.
- **`web/index.html`.** Loads `learn.css`, `learn-content.js` and `learn.js` after `about.*`.

## Files

| File | Change |
|---|---|
| `web/learn-content.js` | New: all Learn content, sources, glossary, examples |
| `web/learn.js` | New: renderers for eight directions, search, behaviour |
| `web/learn.css` | New: shared structure, `.lr-a`…`.lr-h`, print |
| `web/app.js` | Edited |
| `web/index.html` | Edited |
| `app/server.py` | Edited |
| `app/test_server.py` | Edited |
| `design-tools/qa-learn/verify_learn.py` | New |
| `LEARN-REVIEW-PACK.md` | New: draft research summaries for specialist review; not published |

## Content sources used

All sources were accessed on 22 October 2026:
- NIH Office of Dietary Supplements fact sheets:
  - Iron (updated 4 Sep 2025)
  - Vitamin D
  - Vitamin K (updated 29 Mar 2021)
  - Omega-3 Fatty Acids
  - Exercise and Athletic Performance (creatine)
- FSSAI Health Supplements … Regulations, 2016 (FAO FAOLEX copy, version dated 29.09.2021).
- Vuong, Bowyer & Roach 2011, *J Sci Food Agric* 91(11):1931–1939 (L-theanine), and PubChem CID 439378.
- Kiani et al. 2021, *Eur Rev Med Pharmacol Sci* 25(5):2390–2402 (inositol stereoisomers).
- European Medicines Agency, *Plantaginis ovatae seminis tegumentum* (ispaghula husk).
- **Reviewer pack only:**
  - Williams et al. 2020, *Plant Foods Hum Nutr* 75:12–23 (L-theanine systematic review).
  - Showell et al. 2018, Cochrane CD012378 (inositol).
- **Product facts:** the catalogue (`/api/catalog`), `BCCProductPage.toConfirm`, and the approved allergen note for Omega-3 Fish Oil.

## Missing approved facts, assets and review

1. **Approved rear labels for all seven products.** These are needed for:
   - amounts per serving, serving size and units per pack
   - forms (for example the K2 menaquinone and the creatine form), the EPA/DHA split, and inositol amounts and ratio
   - fibre per serving, other ingredients, allergens, directions, cautions, storage, flavour and nutrition (chews)
   - the omega-3 source in D3 + K2, and the fish source
2. **Specialist review** by a qualified reviewer (for example a registered dietitian, pharmacist or physician) of `LEARN-REVIEW-PACK.md`, before any research summary is published. Their name, credentials and review date are needed for the byline.
3. **Regulatory or claims review** of the FSSAI summaries ("Reading a label", "Understanding evidence"), and confirmation of the two sourced safety notes now shown: the iron child-safety note and the vitamin K / warfarin note.
4. **Named authors.** Currently "Body Café Co. editorial".
5. **Images.** A back-label photograph per product, for the label explorer and guides, to replace the educational example once approved. A lot-number location photo per format.
6. **Real lot reports.** Lot records are demonstrations; the report walkthrough uses a marked example.
7. **Site-wide search.** `/search` still searches only the original three guides. Learn has its own full search; merging the two is a possible follow-up.
