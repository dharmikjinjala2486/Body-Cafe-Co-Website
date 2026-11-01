# Variant E — The Living Fan Deck · implementation handoff

31 October 2026 · Claude. Implements `variant-e-research-2026-10-31/CLAUDE-IMPLEMENTATION-BRIEF.md` and `CREATIVE-RESEARCH.md` on the current working tree. Nothing is committed, pushed, deployed or published.

## Review it

The owner preview on **http://127.0.0.1:4180/?design=e** (`.local/preview.sqlite3`, your existing admin) serves these files directly from the working tree. It was not restarted or modified.

Transaction QA used a separate disposable server: port 4182 on `.local/claude-e-qa.sqlite3`. That server is now stopped; the database file can be deleted.

## Files

| File | Change |
|---|---|
| `web/living-e.js` / `.css` (new) | The E core:<ul><li>Living Fan Deck home.</li><li>The seven label diagrams.</li><li>Product-page "defining detail" section.</li><li>Swatch-to-cap-band transition.</li><li>Behaviour hook. It attaches after the shared modules and falls back to E's own hook when production strips the historical variants.</li></ul> |
| `web/living-e-pages.js` / `.css` (new) | Page families:<ul><li>Shop colour index and comparison.</li><li>About, Story and Standards.</li><li>Learn publication and teaching tools.</li><li>Reports, bundles, bag, 404.</li><li>One editorial headline system.</li></ul> |
| `web/index.html` | Loads the four new files last. |
| `web/app.js` | Page transitions also enabled for E. |
| `web/atelier.js` | One-line guard. Production builds no longer throw on load when themes A–D are absent; this was pre-existing. |
| `web/about.js`, `web/story.js` | Expose their existing approved copy and objects (`BCCAbout.copy`, `BCCStory.objects`) so E reuses them instead of duplicating text. |
| `web/learn.js` | Product guides use the supplied label record for directions, cautions, storage and "Inside our product". The pending wording is kept only when no label record exists. |
| `web/learn-content.js`, `web/site.js`, `web/site-eh.js`, `web/standards.js`, `web/support-content.js` | Stale "approved label not supplied / we don't state a number" copy corrected to the current label facts. |

Preserved and untouched:
- `label-content.js` and `label-records.json`, the gallery and media behaviour, form ids and field names.
- Backend and API code, admin and auth, payments and providers.
- The A–H preview tabs, and the earlier uncommitted work by Codex.

## Design decisions

- **Headline unchanged:** "Seven supplements. One colour each."
- **Living Fan Deck hero:**
  - The static first frame shows the headline, Shop all seven, Find a lot report, a shallow fan of the seven real bottle renders, the selected product's information panel (number, format, name, one label fact, price, stock, View and Add) and seven named cap controls. All of it fits within 1440×900.
  - Bottles rise into the fan once, in about 1 second (CSS, transform only), and are absent under reduced motion.
  - Hover, focus, tap, arrow keys, Home and End all select. Selection never navigates on its own; "View [product]" is a separate action. It carries the cap-colour swatch into the product page's cap band through a shared-element view transition.
  - On phones, the named caps come straight after the headline in a 4 + 3 grid, then the info panel, then the fan.
- **Home below the hero:**
  - "Seven, side by side": cap band over cream body, pack and serving, price, stock, Add.
  - "One colour. One useful detail.": the seven label diagrams.
  - "What you can check today": label facts / origin and testing / lot records, each with a written status.
  - Lot lookup, the Learn invitation and the FAQ. The empty Customer voices block is removed.
- **Seven product diagrams.** Each is drawn from the label record and shown only while the record's amounts still match, so an admin edit hides it rather than leaving it wrong.
  - Iron: 29 mg inside the chelate ring.
  - L-Theanine: 200 mg in one capsule, 30 in a pack.
  - D3 + K2: three unit windows, IU ≠ mcg ≠ mg.
  - Omega-3: 1,000 → 800 → EPA 400 + DHA 300, nested to scale, with the rest marked "not itemised".
  - Inositol: 40 : 1 squares, plus 2,000 + 50 mg per 3 capsules.
  - Creatine: two tablets equal 3,000 mg, plus the "not sugar-free" disclosure and flavour. The tablets are drawn as symbols.
  - Psyllium: husk → dietary fibre → soluble fibre, to scale.
- **Product pages, "One colour, in detail".** E's cap band and cream body are kept. The new diagram is section 02, replacing the generic Overview, with its description retained. Sections renumber /08, and the quick navigation gains "The detail".
- **Shop, "The colour index".**
  - A named index replaces the unlabelled colour bars and jumps to the matching card.
  - Compare up to three products, using label facts only: format, pack, serving, servings, allergens, dietary marks, price and stock, with an explicit "not a suitability guide" note. The selection persists in the session.
  - "Illustrative feedback" is replaced with "No reviews yet". The duplicated Standards panel is removed.
- **About, "Seven colours. One point of view."** Uses the approved copy:
  - The point of view and why we exist.
  - A name / colour / format / label-line index of the seven.
  - The café idea.
  - The four values, each with real actions.
  - The People chapter is removed until genuine material exists.
- **Story, "How seven became a system."** Told through the genuine objects: cap, Pantone colour sheet, draft bottle, type specimen, wordmark, then the seven caps together. No dates or founder biography. If approved founder material is added to `BCCStory.founder`, the original full story renderer returns automatically.
- **Standards, "Behind every colour, a record."**
  - A product selector and record sheet come first: label facts, named manufacturer, ingredient origin, testing documents, certifications and lot record, each with a written status.
  - Then a four-stage evidence chain explaining what each stage does and doesn't prove.
  - Then the existing method, in full. The duplicate product picker is removed.
- **Learn, "A little more knowing."**
  - The front page has a featured question with an annotated example label, seven ingredient guides on a colour-spined shelf (with readable horizontal labels), five neutral foundations plus the glossary, then the searchable questions.
  - Product guides gain their learning question and the product diagram inside "Inside our product".
  - Foundations each gain a tool: an annotated example label; an example report anatomy with no results; NIH compound-versus-elemental bars; a servings calculator over the real packs (arithmetic only); and the four evidence categories.
- **Reports, bag, 404 and bundles:**
  - Reports is titled "Your colour. Your lot. Its record."
  - The empty bag reads "Your bag is waiting for a colour."
  - The 404 reads "That colour isn't on this shelf.", with the cap row.
  - Bundle details state the plain sum ("₹1,049 + ₹1,949 = ₹2,998"), with no saving applied.
- **Typography.** LEMON MILK stays for product names (product pages and product guides). Every other page title uses E's light Aileron. Service and transaction pages use a calm 60px rather than a poster headline.

## Verified (actually run)

- **Tests and exports:**
  - `node --check` passes for every `web/*.js` file.
  - `node deploy/test_storefront_theme.mjs` passes.
  - All 100 Python tests pass (the command from the brief, using the bundled Python).
  - The static export builds and `test_hosted_preview.mjs` passes.
  - The connected export builds with the E layer and the Supabase proxy runtime.
  - A production export was served locally: the hero, cap selection, product diagram, Shop index and comparison work without the historical variant scripts. The static preview build was restored afterwards.
- **Route sweep.** 79 E routes: home, shop with filter and sort, both bundles, search (hit and miss), About, Story, Standards, Learn, glossary, all 12 guides, reports with a lot, bag, checkout, payment states, order, sign-in, all account subpages, help, all 23 help articles, contact, all 5 policies, settings and 404.
  - Checked at 320, 390, 707, 1100 and 1440px for page overflow, a page heading and script errors.
  - No failures. The only flag was the account tab row, an intentional horizontal scroller at 320 and 390px.
  - 768px was not run separately; 707px sits between the same breakpoints.
- **Interaction checks:**
  - Real keyboard: caps respond to arrows and End, the info panel and fan follow, and Enter on View opens the product.
  - Add to bag from the fan updates the count and shows a confirmation.
  - Shop comparison caps at three, the dialog opens and Escape closes it.
  - Standards selector and Learn calculator work.
- **Guest checkout on the disposable database:** checkout, then payment, then a simulated failure ("Payment didn't go through"), then retry, then "Payment received", and the bag empties.
- **Admin:** `/ops` login renders as before.
- **Screenshots:** `design-review/variant-e-implementation-2026-10-31/`, 11 desktop and phone views.
- **Not done:**
  - An actual OS reduced-motion setting (handled in CSS and JS, but untested).
  - Real phones and screen readers.
  - Contrast tooling and performance scores.
  - Admin flows behind login: the owner's credentials weren't used.

## Genuine outstanding inputs

- Ingredient-origin records, testing documents and any certifications. The record sheets show these as "Not published" or "None claimed" until supplied.
- Publishable lot documents. Lot records remain demonstrations in preview.
- Approved founder and team material and real photographs. People and founder chapters stay hidden.
- Final prices, GST, delivery charges and areas, return windows, policy text, business, grievance and support-hours details.
- Live payment, OTP, courier and messaging providers. These remain paused and labelled; nothing claims they work.
- Approval for each diagram's wording before launch. The diagrams use only label values, but the explanatory sentences are new copy.
