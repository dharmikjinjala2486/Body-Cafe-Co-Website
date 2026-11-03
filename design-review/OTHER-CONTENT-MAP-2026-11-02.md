# Reference content → Variant E: page map, conflicts and recommendations

2 November 2026 · Review only. No site files were changed for this step. Nothing committed, pushed or deployed.

**Inputs**
- Frozen reference: `story-source-2026-11-02/reference-index.html` — `home()`, `products()`, `cardHTML()`, `product()`, `science()`, `sourcing()`, `contact()`, `footerHTML()`, `NOTES`, `PRODUCTS`, `MAKERS`, `BRAND`.
- Current E on http://127.0.0.1:4174/?design=e.
- `web/label-records.json`.
- The supplied master label `../Full FInal Label/Full Final Label.ai`, all seven pages, text extracted read-only with pypdf.

**Already done:** Story is implemented and must stay as it is (see `STORY-E-HANDOFF-2026-11-02.md`).

## 0. Ground rules for any follow-up implementation
1. **The homepage hero is frozen.**
   - The baseline is saved in `story-source-2026-11-02/home-hero-baseline-2026-11-02.json`.
   - The hero reads shared data: catalogue order, **product names**, colours, the published count and `RELEASE.production`. Editorial imports must not change any of them. In particular, do **not** rename the catalogue product "Psyllium Husk" to "Psyllium Husk (Isabgol)"; show "(Isabgol)" only in page-level copy.
   - After any change, re-capture the hero and diff it against the baseline.
2. **The master label is the factual authority.** The reference is the editorial voice. Where the two differ, use the label value and flag the source line (§2).
3. **No stock, admin or commerce changes from editorial copy.** That covers L-Theanine status, prices and the cart.
4. **No fabricated reports, certificates or articles.** A statement printed on the label may be shown *as printed on the label*. A document is shown only once it exists.

## 1. Facts verified against the master label
| Fact | Reference | Master label | Current E | Verdict |
|---|---|---|---|---|
| Label marks | "Third-party tested", "Traceable ingredients", "No hidden blends", "GMP-certified", "Scan for more" | All seven pages print **THIRD-PARTY TESTED · TRACEABLE INGREDIENTS · NO HIDDEN BLENDS · GMP CERTIFIED** plus a **SCAN FOR MORE** code | Standards says "None claimed / No certification is claimed"; testing documents not published | Source is right that the **label states** these. E is right that **no documents are published**. Show both truths together. |
| Marketer licence | Bluebell Lifecare Pvt. Ltd., Ahmedabad 380054, FSSAI Lic. No. 10726994000121 | Same, on every page | Not shown anywhere | **Confirmed.** Resolves Story handoff conflict 3. |
| Manufacturer licences | Asoj 10721024000068, Vebe 10725997000051, U-Liva 10017021002540 | Same | Names and addresses are in the label records; licence numbers are not shown | **Confirmed.** Safe to add. |
| Maker per product | Asoj: D3+K2, Omega-3. Vebe: Iron, Creatine. U-Liva: Psyllium, Inositol, L-Theanine | Same | Same (label records) | Match |
| %RDA | D3 100%, K2 100%, Iron 100% (women, moderate work), added sugar 7.2% | D3 100%, K2 100%, added sugar 7.20%. Iron uses the women-moderate-work reference. Others say men, moderate work | Not shown | Safe to add from the label. Re-confirm iron's % cell visually (text extraction was cut). |
| Psyllium fibre | Dietary 1600 mg, soluble 400 mg | **Dietary fibre 1,578 mg (5.26%), soluble fibre 1,362 mg** | 1,578 / 1,362 mg | **Source is wrong. Do not import.** It appears in the source `chips`, `intro`, `why`, `trust`, `story` and the `amounts` table. |
| Front claims | e.g. "Supports Heart, Brain & Joint Health" | Printed on every front | Not shown as text (visible only in bottle renders) | Printed, but the reference itself says the inositol claim needs FSSAI consultant review before advertising use |
| Timing guidance | Best / Also fine slots | The label prints e.g. "MORNING Best in the morning · NIGHT Also fine" | Directions only | Safe to add as printed |
| Customer care | care@bodycafeco.com, +91-9274248974 | Same | Same (footer, Contact) | Match |
| Price | "MRP is blank on the final labels, so no prices or cart are shown" | M.R.P field blank on the artwork | E shows "current project prices", labelled as preview | Not a copy decision. **Owner decision needed** before launch. |
| L-Theanine | Held: "supply being confirmed" | Final label exists | Catalogue: published, in stock | Commercial status. **Owner decision needed.** Do not change stock from copy. |

## 2. Page and section map
In the Action column:
- **Adopt** = use the source wording as is.
- **Adapt** = keep its substance but fit E's structure, with wording changes marked for owner approval.
- **Covered** = E already says this.
- **Skip** = do not import.

### 2.1 Homepage, below the hero only (hero untouched)
| Reference `home()` section | E destination | Action | E design recommendation |
|---|---|---|---|
| Hero ("Know what you're taking." + menu board) | — | **Skip** | Frozen. Story already shows the menu board. |
| Our belief: "You should always know what you're being served." + 2 paragraphs | About, opening section after the hero | Adopt | Large Aileron light quote. Belief text on the left, the two paragraphs on the right. |
| Why we exist: "The front of the label shouts. The back whispers." + struck-through "More energy. More strength. More glow." + 2 paragraphs | About, after belief | Adopt (keep the strike-through `<s>`) | Strike the three promises in each of the three first cap colours. Overlaps Story chapter II, so put it on About, not Home. |
| Four rules on every bottle (4 rules) | **Home**, new section after Roll call (before Pour) | Adopt | Four tiles with segment numerals 1–4 in cap colours, the same tile used in Story IV. "We show our work" quotes label marks, so keep it as is (label-confirmed). |
| The launch range: "A short menu, made with care." + 7 cards | Covered by Roll call, the deck and Shop | Skip the card grid. Optionally adopt the subhead "Each product earns its place on the shelf, and each one is explained the same way." in Roll call intro | Don't duplicate product grids on Home. |
| Formulation thinking: "The form is part of the product." + 4 form rows (D3+K2, Iron, Omega-3, Inositol) | Home, replacing nothing; candidate place is after Pour | Adopt | Each row as a cap-colour strip linking to `/products/<slug>`. The CTA "Explore every ingredient" maps to `/standards#source`. |
| Sourcing and transparency: makers + "adding the origin of each raw material" | Standards § Where ingredients come from, plus a 2-line teaser on Home in "Behind the colour" | Adopt on Standards | Three maker cards on Standards (see 2.4). Home links to it. |
| Science and quality: 5 proof tiles (Made in Gujarat, Third-party tested, No hidden blends, Scan for more, FSSAI licensed) | Home § "Behind the colour / What you can check today" (existing) | **Adapt**: keep E's three rows, add the label-printed marks as a fourth row "Printed on every label", and keep "Testing documents: not yet published" | Separating label statement from published document is the key honesty point. Proposed row wording is in §3. |
| Everyday life: "A small part of a good day." + lede + paragraph + day routine | Home, before Voices | Adopt the text; the day routine is the same component as Story VII | Reuse `.ssy-day` panels (morning / chosen time / night with caps). The routine follows Story's held-L-Theanine rule until the owner decides (§1). |
| Manifesto ("What we stand for" version) | Home, after Learn and before FAQ, as a full-bleed ink band | Adopt `manifestoHTML()` exactly. It differs from Story's manifesto; both are source text | Same ink band as Story, so Home and Story feel related. |
| Journal: 3 article teasers + "Full articles publish with the journal." | Learn (existing guides) | **Map, don't invent** | Label reading → `/learn/reading-a-label` (exists). Iron/chai timing → `/learn/iron-bisglycinate` (exists). Triglyceride form → `/learn/omega-3-fish-oil` and `/learn/ingredient-forms` (exist). Use the source titles only as link text if the owner wants teasers. |
| finalCTA: tagline, signature, "Start with one product…", "Shop the range" / "Ask us anything" | Home, final section | Adopt | Map to `/shop` and `/contact`, same as Story's CTA band. |

### 2.2 Shop (`products()` + `cardHTML()`)
| Reference | E destination | Action | Notes |
|---|---|---|---|
| "The menu." + lede "Every product below names its form, states its amount and tells you when to take it. Tap any one to see the full label." | Shop header | Adapt: keep the E h1 "Shop all seven" (with its segment count) and use the source lede below it | Shop header isn't the homepage hero, so it's safe. |
| Filters All / Morning / Night / Softgels / Capsules / Chewables | Shop filter bar | Adapt: add **time** filters derived from label directions next to E's existing format filters | Don't break the existing `?format=` URLs, stock filter or sort. |
| Card: dose · pack, headline, 4 chips | Shop cards and deck card back | Adopt headlines and chips for 6 products; **psyllium chips need correcting** ("Fibre 1600 mg" → label 1,578 mg) before use | Headline as the card nickname line, chips as small pills. Keep prices, stock and Add buttons. |
| "Supply being confirmed" tag (L-Theanine) | — | Skip until the owner decides | Conflicts with live stock. |

### 2.3 Product pages, all seven (`product(slug)`)
| Reference block | E PDP section | Action | Notes |
|---|---|---|---|
| Eyebrow (dose · pack) + **headline** | Band subtitle line under the h1 | Adopt the headline | e.g. "Iron first. Chai later." Keep the product name as the h1 and the nickname eyebrow. |
| **intro** | Band lede or "The defining detail" lead | Adopt for 6. Psyllium needs its fibre number corrected | |
| claim ("On the label") | Ingredients & facts, "On the label" row | Adapt: show **as printed**. Inositol claim **held** pending FSSAI consultant review | Text only, no visual emphasis. |
| What's inside table with %RDA | Ingredients & product facts | Adopt %RDA values verified on the label; psyllium values from the label only | Add the RDA reference note per product (iron: women, moderate work). |
| When to take it: Morning / Noon / Night slots + Directions, Keep in mind, Form, Dosage form | "How to use" | Adopt (label-printed) | The three-slot strip in cap colour, "Best" lit as a segment. |
| **why** ("Why this form") | "Turn the bottle" side panel, or a new short section | Adopt for 6; psyllium corrected | |
| **trust** ("How we check it") + Made by, Raw material origin "Being confirmed", Batch report "Scan the code on your pack" | Quality & lot report section | Adapt: keep Made by (+ licence no.) and origin "Being confirmed". **Replace "Batch report: Scan the code on your pack"** with E's real lot lookup, still labelled demonstration where it is | No report invented. |
| **story** (long paragraph) | New "The story" block before Reviews | Adopt for 6; psyllium corrected | Full-width reading measure with a pull quote in cap colour. |
| Full label (other ingredients, caution, storage, not for medicinal use) | Already in E from label records | Covered | Wording is effectively identical. Keep E's label-record source of truth. |
| Prev / next product nav | E sibling caps strip | Covered | |
| L-Theanine banner "supply is being confirmed. This page is shown for review only." | — | Skip until the owner decides | |

### 2.4 Standards (`science()` + `sourcing()`)
| Reference | E destination | Action | Notes |
|---|---|---|---|
| "What we can show you, and what we won't claim." + nutraceutical lede | Standards intro, after the E h1 "Behind every colour, a record." | Adopt the lede | |
| 5 rules: form, made, checked, amounts, claims | Standards "The method, in full" | Adopt 4. **Adapt "How products are checked"** so it adds that reports are not yet published | The source says only "carries the third-party tested mark… a code that leads to more". Add: "Testing reports are not published yet; lot records on this site are demonstrations." |
| "Every label, side by side." table (form, per serving, serving, made by) | Standards, near "Our standards, at a glance" | Adopt; take psyllium per-serving from the label | Cap-dot rows like the Story decision table. |
| Ingredients and sourcing: intro, forms explorer, "Three makers, all in Gujarat." with licences + marketer line | Standards § "Where ingredients come from" | Adopt; supplier and origin stay "Being confirmed" | **Fix the stale E line** "No ingredient origins, processing locations, suppliers or **manufacturer details** have been published yet" (`web/standards.js:125`). Manufacturers *are* published on labels. Origins and suppliers are still pending. |
| E per-product "Certifications: None claimed" (`living-e-pages.js:141`, `product-page.js:245`) | Standards record + PDP | **Correct** | It isn't true that none is claimed: the label prints "GMP CERTIFIED". Show "GMP certified (as printed on the label) · certificate not yet published". This is a data/editorial fix; no certificate is invented. |

### 2.5 Learn
| Reference | E destination | Action |
|---|---|---|
| 3 journal teasers | Existing guides (see 2.1) | Map only. No new articles. |
| Product `why` texts | Learn product guides already explain form | Covered. Optionally quote `why` as "From the product page" once adopted on PDPs. |

### 2.6 Contact (`contact()`)
| Reference | E destination | Action | Notes |
|---|---|---|---|
| "Ask us anything." + lede ("…we'll tell you where the answer comes from.") | Contact header, replacing "Contact support" + lede | Adopt | Keep the E switchboard and the full working support form below it. |
| Email (copy button), Phone, Address (Bluebell legal entity) | Switchboard "Call or WhatsApp" block + new Address line | Adopt the address | **Fix** `support-content.js:18`, which reads "Bluebell Lifecare Pvt. Ltd. (marketed by on the supplied labels)" (broken phrase). Proposed: "Marketed by Bluebell Lifecare Pvt. Ltd., Ahmedabad, Gujarat 380054, India (as printed on the label)". |
| Medical-advice note | Under the switchboard | Adopt | |

### 2.7 Footer (shared chrome, not the hero)
| Reference `footerHTML()` legal line | E footer legal row | Adapt | Add "Body Café Co. is a brand of Bluebell Lifecare Pvt. Ltd., Ahmedabad… FSSAI Lic. No. 10726994000121" and the standard nutraceutical disclaimer. Keep E's preview disclaimer while in preview. |

### 2.8 Not to import
- The reference `NOTES` list. It contains internal working notes: logo, photography, founder held, missing reports, L-Theanine block, inositol claim, prices.
- The brand feedback page.
- The reference hero.
- The founder perspective, which is held in the source itself.

## 3. Proposed wording where an adaptation is needed (owner to approve)
- **Home "What you can check today" new row:**
  - Title: "Printed on every label"
  - Status: "As printed"
  - Text: "Each label states Third-party tested, Traceable ingredients, No hidden blends and GMP certified, and carries a code to scan. The supporting reports and certificates are not published on this site yet."
- **Standards "How products are checked":** keep the source sentence, then add "Testing reports and certificates are not published yet; lot records on this site are demonstrations until they are."
- **Certifications field:** "GMP certified, as printed on the label. Certificate not yet published."
- **Psyllium corrected source lines.** Only the numbers change, all from the label:
  - chips: "Fibre 1,578 mg"
  - intro: "…2000 mg of psyllium husk and 1,578 mg of dietary fibre."
  - why / trust / story: "1,578 mg of dietary fibre, of which 1,362 mg is soluble"

## 4. Open decisions for the owner
1. L-Theanine: held, or available? This affects Story's day routine, Shop and the PDP banner.
2. Prices: show project prices or none? The label MRP is blank.
3. Front-of-pack claims: show as printed, with inositol held? Or not at all until consultant review?
4. Approve the §3 adaptations: the label-mark row, certification wording and psyllium number corrections.
5. Home additions: the recommended set is Four rules, Formulation thinking, Everyday life + routine, Manifesto, and the final CTA. Approve all of these, or a subset? Home is already long; my recommendation is Four rules + Everyday life + Manifesto + CTA, with Formulation thinking moved to Standards.

## 5. Recommended implementation order (after approval)
1. Data fixes that are pure truth corrections:
   - the Standards manufacturer line
   - the Certifications wording
   - the Contact address phrase
   - maker licences in Standards
2. Standards: science rules, side-by-side table, three makers.
3. PDPs: headline, intro, why, story, %RDA, timing strip, claim per decision, with psyllium corrected.
4. Contact header.
5. About: belief and why-we-exist.
6. Shop: lede and time filters.
7. Home below-hero additions.
8. Footer legal line.

**Checks for each step:**
- Hero baseline diff: must be identical.
- Exact-copy tests for adopted blocks, extending `design-tools/story-source-text.mjs` to other reference functions.
- The Story parity test.
- Label-value test: no "1600 mg" or "400 mg" fibre on any rendered page.
- Overflow and keyboard checks at 1440 / 1280 / 820 / 390 px.
- Existing suites.

## 6. Applied: truth fixes (2 November 2026)
Step 1 of §5 only. Each change states what the supplied master label prints. Nothing claims a document exists.

| File | Change | Reach |
|---|---|---|
| `web/label-records.json` | `manufacturer_details` now adds each maker's Lic. No. (Asoj 10721024000068, Vebe 10725997000051, U-Liva 10017021002540) and Bluebell's Lic. No. 10726994000121. A new `certifications` default reads: "As printed on the label: GMP certified. The label also states third-party tested, traceable ingredients and no hidden blends. The certificate and test reports are not published on this site yet." | Label defaults for all designs. Admin values still take precedence. |
| `web/standards.js` | The source status no longer says manufacturer details are unpublished; it says manufacturers and licence numbers are on every product page, while origins, processing locations and suppliers stay unpublished. The certification FAQ and the evidence-table "today" cells now say the labels state "GMP certified" and "third-party tested", and that the certificate and results are not published. | Standards, all designs |
| `web/living-e-pages.js` | E's Standards record shows "Stated" instead of "Listed" when a certification statement exists. | E only |
| `web/support-content.js` | Legal name changed from the garbled "(marketed by on the supplied labels)" to "(named as marketer on the supplied labels)". `fssai` set to the label-printed 10726994000121; it is not rendered yet. | Support/Contact business details, all designs |

**Verification**
- **Homepage hero:** text and accessible labels are identical to `home-hero-baseline-2026-11-02.json`, and `hero(ctx)` is untouched.
- **Pages checked in the browser:** Standards, Omega-3 PDP and Contact show the new text. Rendered pages no longer say "None claimed" or "No certification is claimed"; those strings remain only as empty-record fallbacks.
- **Test suites:** Story parity, storefront theme, preview content and the Python suite (100 tests) all passed. No console errors.
- **Not changed:** stock, prices, admin records and the L-Theanine status.

## 7. Applied: Standards content (2 November 2026)
Step 2 of §5.

**New files:** `web/standards-e.js` (an E-only wrap of the Standards renderer) and `web/standards-e.css`. Both are loaded after `story-e.*` in `web/index.html`.

| E Standards position | Content | Source |
|---|---|---|
| After the hero: `#science` | Eyebrow, h2 "What we can show you, and what we won't claim.", lede, four rules with segment numerals | `science()`, verbatim. Rule 3 keeps the source sentence and adds the §3 note: "Testing reports and certificates are not published yet; lot records on this site are demonstrations until they are." |
| After the record chain: `#side-by-side` | "Every label, side by side." table (Product, Form, Per serving, Serving, Made by), cap-colour rows linking to `/products/<slug>`, "Ask us anything" → `/contact` | `science()` + `PRODUCTS`, verbatim. Rows follow the catalogue order. |
| After "Where ingredients come from": `#ingredients` | "Every ingredient, and who makes the product." + lede; "Explore the forms." tabs (keyboard arrows, Home and End) with why, form, per serving, maker, and supplier and origin "Being confirmed"; "Three makers, all in Gujarat." with FSSAI licence numbers; marketer line | `sourcing()` + `PRODUCTS` + `MAKERS` + `BRAND`, verbatim, except psyllium fibre |

**Shared truth fix:** `web/standards.js` now shows the "Finished-product manufacturer" place as "Named on every label" instead of "Not yet published". Origin and processing remain "Not yet published". This applies to all designs.

**Deliberate departures from the reference**, recorded in the module's `ADAPTED`:
1. Psyllium fibre uses the label's 1,578 mg / 1,362 mg instead of 1600 / 400 mg, in both the explorer amounts and the "why" text.
2. The fifth rule, "How we write claims", is omitted. It says claims are "reviewed for compliance", while the reference's own notes say the inositol claim still needs consultant review. It waits on owner decision 3.
3. L-Theanine's "Held" tag is omitted until owner decision 1.

**Verification**
- `node design-tools/test-standards-e-content.mjs` passed. 30 page strings were checked verbatim against the reference `science()`/`sourcing()`, all 7 products' name, dose, maker, serving, key, form, amounts and why match the reference except the documented psyllium correction, and the label record was confirmed as the psyllium source.
- **Homepage hero:** identical to the baseline.
- **Standards in the browser:**
  - Widths: checked at 1440, 820 and 390 px, with no page overflow. On phones the table becomes one card per product.
  - Explorer keyboard navigation works.
- **Other designs:** Variant F's Standards renders with the shared fix.
- **Console and test suites:** no console errors, and the Story parity, theme, preview-content and Python suites all pass.

**Open point:** the lede says "Our products are nutraceuticals", but the Iron Bisglycinate label prints "Health Supplement". The source wording is kept verbatim; the owner may want "nutraceuticals and health supplements".

## 8. Applied: product pages (2 November 2026)
Step 3 of §5.

**New files:** `web/pdp-e.js` (an E-only wrap of the product renderer) and `web/pdp-e.css`. Both load after `standards-e.*`.
- **Additive only:** the band, the h1, the admin-editable description, prices, stock and purchase hooks are unchanged. Sections are renumbered after insertion (now / 11).
- **One text, two pages:** "Why this form" and "Form" are read from `standards-e.js`, so Standards and product pages show the same wording.

| PDP position | Added content (reference `product(slug)` / `PRODUCTS`) |
|---|---|
| New §03, after "The defining detail": `#about-product` | Headline as the h2 (e.g. "Iron first. Chai later."), the intro, "Why this form" and "The story" side by side. Also added to the quick nav. |
| Ingredients & product facts | "What's inside" table: Per <serving> · Amount · % RDA, with the RDA reference note. Iron uses "*%RDA as per ICMR 2020 guidelines (women, moderate work)." |
| How to use | "When to take it" strip (Morning / Noon / Night, "Best" in cap colour, others "Also fine") plus "Keep in mind" (when it isn't "—") and "Form" |
| Quality & lot report | "How we check it" (reference `trust`) followed by "Test reports and certificates aren't published on this site yet." |

**Label-based departures** (module `ADAPTED`, enforced by `design-tools/test-pdp-e-content.mjs`):
1. **Psyllium:** 1,578 mg dietary fibre (5.26% RDA, from the label) and 1,362 mg soluble fibre replace 1600 mg and 400 mg in the intro, amounts, trust and story.
2. **Creatine timing:** the label marks Morning "Best" and Noon/Night "Also fine". The reference showed "Pick one" for all three; the label is followed. The story and intro still say "choose one time… and stay consistent", which the label directions also say.
3. **Not shown yet:** label claims ("On the label") and the L-Theanine supply banner, pending owner decisions 1 and 3. "Ask about this product" isn't duplicated; E already has a Questions section and Contact.

**Verification**
- The PDP content test passed for all 7 products. Headline, intro, amounts with %RDA, keep, rdaNote, best slot, trust and story match the reference except the documented corrections.
- At 390 px, all 7 product pages render the new sections with correct row counts and best slot, and have no page overflow. None of them shows the 1600 mg fibre figure, claim text or a held banner.
- Desktop checked on Iron.
- Homepage hero text and aria labels are identical to the baseline. No console errors.
- Standards, Story, theme, preview-content and Python suites all pass.

**Label checks done for this step** (master label, read-only): every label prints the Morning/Noon/Night strip as described; Iron's %RDA is 100%; Psyllium's dietary fibre is 5.26%. Psyllium's night slot text was only partly readable in the extraction; its directions say "at night", so Night is marked Best.

## 9. Applied: Contact and About (2 November 2026)
Steps 4 and 5 of §5. **New files:** `web/about-contact-e.js` and `web/about-contact-e.css`, both E only and loaded after `pdp-e.*`. One small addition was also made to `web/super-sevens.js`: the switchboard now shows the address and note.

**Contact (`/contact`, reference `contact()`, verbatim)**
- The header now reads eyebrow "Contact", h1 "Ask us anything.", and the reference lede. The page title follows: "Ask us anything. — Body Café Co.".
- The switchboard's call/email column adds "Address: Bluebell Lifecare Pvt. Ltd., Ahmedabad, Gujarat 380054, India" and the medical-advice note.
- The reference email and phone were already shown in the switchboard and are not repeated.
- The working support form, topic tiles and product caps are unchanged. Tile → topic was checked.
- Other designs keep "Contact support" (checked on F).

**About (`/about`, reference `home()` sections, verbatim)**
- **"Our belief"** is a new section straight after the About hero: "You should always know what you're being served." with both paragraphs.
- **"Why we exist"** is new, before E's own why-section: "The front of the label shouts. The back whispers." The promises "More energy. More strength. More glow." are struck through in the first three cap colours, followed by both paragraphs.
- **E's existing "Why we exist" section** follows straight on. Its repeated "Why we exist" kicker is visually hidden (still available to screen readers), so the label doesn't appear twice. **None of its text changed.**
- **The About "Keep going" link to Story** now reads "You should always know what you're being served.", the Story page's own headline. It used to read "How seven became a system", which no longer exists.

**Verification**
- `node design-tools/test-about-contact-e.mjs` passed: 16 strings verbatim from the reference `contact()`/`home()`, the strike-through matches the reference, and the Story link matches the Story headline.
- In the browser, About and Contact render correctly at 1440 and 390 px with no page overflow.
- **Homepage hero:** identical to the baseline. No console errors.
- **Test suites:** all passed, including the Python suite (100 tests).

**Remaining from §5:** step 6 (Shop lede and time filters), step 7 (homepage below-hero additions) and step 8 (footer legal line). Owner decisions 1–5 in §4 are still open.

## 10. Applied: Shop (2 November 2026)
Step 6 of §5.

**New files:** `web/shop-e.js` and `web/shop-e.css` (E only, loaded after `about-contact-e.*`). The shared `web/shop.js` gains an optional, design-scoped time filter.

**What changed on E's `/shop`**
- **Lede:** reference `products()` text, verbatim: "Every product below names its form, states its amount and tells you when to take it. Tap any one to see the full label." The E h1 "Shop all seven", with its segment count, is unchanged.
- **Cards (line-up view):** each card adds the product's reference headline and its four reference chips, under the label subtitle. Price, stock, Add to bag, Compare and ratings are unchanged.
- **New "When to take it" filter group:** Any time / Morning / Night.
  - It works with the format filters, "In stock only", sort, the chips, Clear all, the result count and the URL (`?time=morning|night`).
  - Counts are faceted, like the format counts.
  - Morning lists D3+K2, Omega-3, Iron, Inositol, Creatine and L-Theanine; Night lists Psyllium. These follow each label's "Best" slot, the same data as the product-page timing strip.

**Shared `web/shop.js`**
- The time group, its URL parameter and its counts exist only when `window.BCCShopTimes` names the current design (`designs: ["e"]`). Every other design renders and filters exactly as before; checked on F with `?time=night`, which still shows all 7.
- A pre-change copy was kept in the session scratchpad for comparison.

**Departures** (module `ADAPTED`):
1. **Psyllium chip:** "Fibre 1600 mg" shows the label's "Fibre 1,578 mg".
2. **Creatine:** listed under Morning, because its label marks Morning "Best". The reference filters listed it under neither time.
3. **New labels:** "When to take it" (a reference label string from `product()`) and "Any time" name the group; the reference filter row had no legend.

**Verification**
- `node design-tools/test-shop-e-content.mjs` passed: the lede and all 7 headlines and chip sets are verbatim (psyllium corrected), time groups equal each product's label "Best" slot, and the filter is E only.
- In the browser (E, 1440 px):
  - Filters: Morning → 6 of 7, Morning + Softgels → 2, removing the Morning chip → Softgels only, Night → Psyllium only. A direct load of `?time=night` renders filtered.
  - Counts, chips, status text and URL update each time.
  - At 390 px: no overflow.
- **Homepage hero:** identical to the baseline. No console errors.
- **Test suites:** all passed (Python 100 tests).

**Remaining from §5:** step 7 (homepage below-hero additions; owner decision 5 chooses which) and step 8 (footer legal line).

## 11. Applied: footer legal line (2 November 2026)
Step 8 of §5. **New files:** `web/footer-e.js` and `web/footer-e.css` (E only, loaded last).

- **New legal paragraph** above E's footer legal row, verbatim from the reference `footerHTML()`: "Body Café Co. is a brand of Bluebell Lifecare Pvt. Ltd., Ahmedabad, Gujarat 380054, India. FSSAI Lic. No. 10726994000121. Nutraceuticals and health supplements are not for medicinal use… consult a healthcare professional before use."
- **Copyright:** now "© <year> Bluebell Lifecare Pvt. Ltd." (the reference shows © 2026); previously "© 2026 Body Café Co.".
- **Kept as is:** E's preview notice and "Design states" link. Other designs' footers are unchanged (checked on F).

**Verification**
- `node design-tools/test-footer-e.mjs` passed: both strings are verbatim.
- **Homepage hero:** identical to the baseline.
- **Footer:** checked at 1440 and 390 px, with no overflow and no console errors.
- **Test suites:** all passed (Python 100 tests).

**For owner review:** the labels say Bluebell *markets* the products. "Is a brand of" (reference wording) also implies Bluebell owns the brand. Keep it only if that is the legal position.

**Remaining from §5:** only step 7, the homepage below-hero additions. That waits on owner decision 5, along with decisions 1–4.

## 12. Applied: complete label facts on every product page (2 November 2026)
**Owner instruction:** "in label all products ingredients, allergen, when to take, manufacturer details their fssai licence number everything is mentioned in label so according to that add at their respective places in website."

**Sources**
- **Master label `../Full FInal Label/Full Final Label.ai`:** text extracted read-only with pypdf. Saved in `design-review/label-text-2026-11-02/<product>.txt`.
- **The seven supplied label PDFs:** text-free (outlined) artwork, rendered read-only with pypdfium2 and read visually for graphics (barcodes, diet marks). The standalone Inositol PDF is blank, so page 5 of the master label was rendered instead.
- **One correction to my earlier note:** D3 + K2 *does* print "Desiccant inside – DO NOT EAT" (it's visible in the artwork; text extraction missed it), so the site's caution stays as it was.

**Label → website map** (`web/label-records.json` holds the data; E renders it in `web/pdp-e.js`)

| Label element | Record field | Where it appears |
|---|---|---|
| Product type (Nutraceutical / Health Supplement), front description, claim, pack, veg/non-veg mark, "Gelatin food grade" / "Polyols may have laxative effect", barcode (EAN-13) | `label_front`, `label_badges`, `pack_size` | PDP → Ingredients & product facts → "On the front of the label" (claim marked "As printed on the label") |
| Supplement Facts panel (serving size, every nutrition and active row with %RDA, indents, footnotes, including D3's overage note) | `supplement_facts` | PDP → Ingredients & product facts → "Supplement facts" table, replacing the reference-derived "What's inside" table |
| Other ingredients, allergens / caution, desiccant, Not for medicinal use, storage, age | existing fields (unchanged) | PDP → Ingredients and How to use rows (all designs) |
| Directions for use + With food / Empty stomach tag | `directions`, new `directions_tag`, `preparation` (filled for the 5 that showed "Awaiting approved label") | PDP → How to use: tag beside "When to take it", Recommended use, Preparation |
| Morning / Noon / Night strip | `label_timing` ("Best in the morning" / "Best at night" / "Also fine") | PDP → How to use timing strip; Shop time filter |
| Manufactured by + Marketed by, addresses, FSSAI Lic. Nos. | `manufacturer` (now with Lic. No.), `manufacturer_details` | PDP → Manufacturer and licence details; Quality → Manufacturer; Standards record (all designs) |
| Third-party tested · Traceable ingredients · No hidden blends · GMP certified | `certifications` | PDP → Quality; Standards |
| Customer care (phone, email, website) | `customer_care` | PDP → Quality |
| Batch No., Mfg. Date, Exp. Date, M.R.P., U.S.P. (blank on artwork, pack-specific), Scan for more | `pack_printed` | PDP → Quality ("Printed on each pack") |

**Barcodes (EAN-13, read from the artwork)**
- D3 + K2: 8908032859042
- Omega-3: 8908032859059
- Iron: 8908032859035
- L-Theanine: 8908032859073
- Inositol: 8908032859028
- Creatine: 8908032859066
- Psyllium: 8908032859011

**Diet marks:** non-veg on D3 + K2 and Omega-3, veg on the other five. These match the existing dietary-suitability text.

**Claims:** all seven front claims now appear exactly as printed, at the owner's instruction. Earlier note: the reference project flagged the inositol claim ("Supports Hormonal & Metabolic Balance") for FSSAI consultant review before advertising use. The owner should confirm that review.

**Not shown:**
- The artwork code "10810LB01-BC" (a print/artwork reference, not product information).
- The blank MRP/USP values; they are pack-specific and blank on the artwork.

**Verification**
- `node design-tools/test-label-records.mjs` passed: all 67 supplement-facts rows (name, amount, %RDA), notes, serving sizes, front text, claims, directions tags, timing wording, licence numbers, manufacturer names, customer care, badges and other ingredients match the master label text. Barcode format and diet marks are checked for format; they were transcribed visually.
- **All 7 E product pages** at 390 px:
  - Supplement-facts rows match the label (D3 13, Omega 11, Iron 8, L-Theanine 8, Inositol 9, Creatine 8, Psyllium 10).
  - The tag and the "Best …" wording are correct.
  - No "Awaiting approved label" remains, and there is no page overflow.
  - The table keeps all three columns visible on phones.
- **Variant F** product pages show the new Preparation and licence values from the shared records.
- **Homepage hero:** identical to the baseline. No console errors.
- **Test suites:** all passed, including the Python suite (100 tests).

**Owner decision (2 November 2026):** the Inositol claim "Supports Hormonal & Metabolic Balance" has had its FSSAI consultant review and stays on the site as printed. Owner decision 3 in §4 is now settled: all seven front-of-label claims are shown exactly as printed.

## 13. Applied: launch-ready copy and one layout system (2 November 2026)

**Owner direction:** the site speaks as Body Café Co., not as a reviewer of someone else's label. Remove every "preview", "demonstration", "draft" and "as printed on the supplied label" phrase. Use the full width everywhere and keep spacing consistent.

**Copy**
- `web/label-records.json` and 14 page scripts were rewritten in our own voice (91 exact replacements). Backups of the originals are kept in the session scratchpad.
- The footer preview notice and the internal "Design states" link are removed (`web/footer-e.js`).
- In E, the lot lookup hides its sample records, and its archive shows no demonstration lots.
- Story board footer: "Every amount above is printed on the label." becomes "Every amount above is stated in full." This is the one change to the exact Story copy, and `design-tools/test-story-e-parity.mjs` records it.
- **Kept on purpose:** the homepage hero line "Review preview · current project prices · ordering is not live." It sits under the hero hard constraint and is hidden automatically when `BCCRelease.production` is true. Owner decision needed (see below).

**Layout:** `web/e-layout.css` is loaded last.
- Every E page uses the header and footer column, `--pad` (56 to 1384 px at 1440 px, centred beyond that). Each inner page stylesheet used its own 64 px gutter and a 1240 to 1320 px wrapper, so text started at 124 to 164 px.
- One section rhythm (`--ez-sec-y`) and one column gap (`--ez-gap`).
- About "Why café" is now a quote on the left and the explanation on the right.
- About "Why we exist" is now the statement on the left and the paragraphs on the right.
- The Story manifesto is now in two columns: what we don't do, and what we do.
- The footer legal paragraph spans the full column.
- The fanned chip book no longer pushes the page sideways (the About page was 1459 px wide).

**Verified**
- At 1440 px, the main text edge is 56 px on Home, Shop, About, Learn, Standards, Contact and the product pages. Story keeps its chapter rail: rail at 56 px, text at 234 px.
- No horizontal overflow at 1440, 820 or 375 px on any page.
- Homepage hero is identical to the baseline.
- All Node content tests and the Python suite (100 tests) pass.

**Pending before launch (content and decisions only the owner can supply)**
1. Payments (Razorpay live keys), SMS OTP sign-in and courier serviceability are not connected. Checkout, account and OTP screens still describe a simulated flow until they are.
2. Legal policies (Terms, Privacy, Shipping, Returns and Refunds) are Draft 0.1 and need legal approval. Also needed: grievance officer name and contact, support hours, the full registered address, GSTIN and invoice details.
3. Final delivery charge and free-delivery threshold (currently ₹75, free from ₹1,499) and the final return window and conditions.
4. Lot test reports and certificates: real per-batch reports to replace the demonstration lot records, and the GMP certificate. Until these arrive the site says they are "not published on this site yet".
5. Ingredient origin and supplier details (Standards "sourcing" rows that are still pending).
6. L-Theanine: confirm supply. It shows "supply being confirmed" in the Story menu.
7. MRP: the labels leave MRP blank ("printed on each pack"). Confirm that the current project prices are the launch MRPs.
8. Photo of where the lot number sits on each pack (Lot lookup help).
9. Founder story and photography for About, if wanted.
10. Specialist review of Learn articles before they are presented as guidance.
11. Customer reviews: none yet. The rating rows show an empty state.
12. Homepage hero preview line: remove it now, or keep it until `BCCRelease.production` is switched on at launch.

## 14. SharePoint check, prices and signed-out account (2 November 2026)

**Prices:** the owner's MRP list matches the catalogue exactly, so nothing changed:

| Product | MRP |
|---|---|
| Iron | ₹899 |
| L-Theanine | ₹1,699 |
| D3 + K2 | ₹1,049 |
| Fish Oil | ₹1,949 |
| Myo & D-Chiro Inositol | ₹1,499 |
| Creatine | ₹749 |
| Isabgol (Psyllium) | ₹949 |

Magnesium Bisglycinate (₹1,399) and Beetroot (₹1,749) are not in the seven-product range.

**Applied from SharePoint (BodyCafe site)**
- **GST:** GSTIN 24AAOCB2181Q1Z6 and the full registered office (Company and Legal › FSSAI Docx › GST certificate, REG-06): Office No. 202, 2nd Floor, Primate, Opp. Mother Milk Palace, Nr. Judges Bungalows Cross Road, Bodakdev, Ahmedabad, Gujarat 380054.
- **FSSAI:** Central Licence 10726994000121, issued 3 Feb 2026 and valid to 2 Feb 2029. It matches the site.
- **Where it shows:** these now appear in Contact › Business details and in "Who we are" on the Privacy and Terms pages (`web/support-content.js`, `web/support.js`).
- **L-Theanine:** marked "Received" in Material › Material_Tracker_Status.xlsx. The Story "supply being confirmed" hold is removed and it now appears under Morning (`web/story-e.js`; exceptions recorded in `test-story-e-parity.mjs`).
- **Story:** "Timings as printed on each label." becomes "Timings from each product's directions."

**Approved direction, not yet policy text** (CEO Functional Requirements deck, 3 Aug 2026):
- Guest-first prepaid checkout; no cash on delivery in v1.
- Returns are support-managed and issue-based only (damaged, wrong or missing). Cancellation needs support approval.
- GSTIN is optional on invoices.
- Purchasers must be 18 or older.
- Mobile one-time-code sign-in, with email as fallback.
- Reviews from verified buyers only.
- Support through one inbox covering WhatsApp, email and web.

The site's policy drafts already follow this.

**Not found in SharePoint (still open)**
- **Policies and support:** the launch audit (AI Claude_Analysis › BCC_Launch_Audit_ThingsMissed_v1.xlsx) lists the returns policy, support hours and response time, and GST invoicing as undefined. Also missing: the grievance officer, the final delivery charge, and the return window in days.
- **Test reports:** only quotations and request forms (Eurofins, Choksilab) exist. There are no finished-product batch reports and no manufacturer GMP certificates.
- **Sourcing:** Vendors › Raw Material Documents holds several candidate suppliers per ingredient, with raw-material COAs. Nothing records which supplier went into each launch batch.
- **Fish oil:** the raw material is marked "In Transit" (ETA 27 Oct 2026) in the material tracker. Stock records were not changed.

**Signed-out account (Variant E)**
- `/account` now opens on a sign-in screen. The mobile-number form sits on the right on desktop and directly under the heading on phones, next to a list of what an account keeps.
- "No account? You can still" offers checkout as a guest, lot lookup and Contact.
- The empty dashboard tabs show only when this browser has orders or cases.
- On the hosted deployment (`BCCConnectedHosted`), SMS codes are not connected. The card there says sign-in opens with ordering instead of showing a form that cannot send a code.

## 15. Final policies and store copy, Version 1.0 (2 November 2026)

**Owner decisions applied**
- Delivery: ₹75, free from ₹1,499 after discount.
- Returns: issue-based only, reported within 7 days of delivery. Approved refunds are released within 7 business days.
- Support: Monday to Saturday, 10:00–18:00 IST, first reply within one business day.
- Grievance Officer: Nayan Solanki (care@bodycafeco.com, +91-9274248974). Grievances are acknowledged within 48 hours and resolved within one month.

**Policies** (`web/support-content.js`)
- All five policies are now Version 1.0 (updated 2 November 2026). There's no "Draft" chip and no "Not yet confirmed" items (`open` flags removed).
- Terms: an order is a contract on payment confirmation. Courts at Ahmedabad have jurisdiction. Prices are MRP inclusive of taxes. A tax invoice comes from Bluebell Lifecare (GSTIN shown). Payment is through Razorpay, prepaid only.
- Privacy names the processors: Razorpay, courier partners, the SMS provider, Netlify and Supabase. Retention: order and invoice records 8 years; account data until deletion. Data may be processed outside India.
- Shipping says orders are packed Monday to Saturday. It gives no dispatch-time promise.
- Help articles, Contact (hours, reply time, grievance officer, GSTIN, FSSAI) and the policy header (`web/support.js`) are updated.

**Checkout and bag** (`web/app.js`, `web/site.js`, `web/site-eh.js`, `web/bag.js`, `app/account.py`, `app/server.py`)
- No "sample", "preview order" or "illustrative tax" wording remains.
- The order button reads "Place order and pay". Delivery and tax notes are now final.

**Facts used that the owner should confirm with legal review**
- Ahmedabad jurisdiction.
- The 8-year retention period.
- The 48-hour acknowledgement and one-month resolution, which follow E-Commerce Rules 2020 rule 4.
- The processor list.
- The refund timing wording.

**Copy now ahead of the integrations** (each statement is true only once its integration is live)
- Razorpay payment: the payment step is still the local simulator, which offers "Simulate successful payment".
- SMS sign-in codes.
- Courier serviceability and tracking.
- GST invoice generation.
- The local server's top bar ("Local preview · No live payment or dispatch") is environment chrome and is unchanged.

## 16. Full QA pass: storefront, admin and backend (2 November 2026)

**Storefront (Variant E)**
- 29 routes tested at 1440, 820 and 375 px: home, shop, Super Sevens, all seven products, story, about, learn and an article, standards, lot reports, help, contact, five policies, bag, checkout, account, sign-in, settings and 404.
- Checks on each: sideways overflow, text cut off at the screen edge, broken images, one visible h1, error screens and console errors. Everything passes after the fixes below.
- The mobile menu opens and closes.
- **End-to-end purchase** on a throwaway copy of the database (port 4175):
  - add to bag (₹1,049 + ₹75 = ₹1,124), then guest checkout
  - order BCC-7FBA3C6D, simulated successful payment, then the order page
  - admin "Record shipment" with courier and tracking, after which the order shows Shipped

**Admin panel (`/ops`):** tested with a throwaway admin on the QA copy. All 10 sections load at desktop, tablet and phone: Overview, Orders, Sales, Products, Inventory, Lot reports, Support & safety, Reviews & questions, Channels and Feature flags.

**Backend**
- Python suite: 103 tests pass.
- Supabase suites: 33 PostgreSQL migration checks, 46 hosted API/authorization checks, and the media checks all pass.
- All Node content tests pass.
- Unauthenticated admin API calls return 403.

**Fixed in this pass**
1. The signed-out account page linked "Look up a lot" to `/lots`, which is a 404. It now goes to `/reports` (`web/account.js`).
2. About › "Why colour?" on phones: the format column was cut off ("Softgels" clipped at the screen edge). The row grid is rebuilt (`web/living-e-pages.css`).
3. Payment, order and account pages still said "Sample total", "Paid (preview)", "(sample)", "prepaid (preview)", "isn't connected in the preview" and "GST invoicing isn't set up". These now use final wording (`web/account.js`, `app/account.py`).
4. The hosted build (`deploy/build_netlify.py` `_headers`) sent only two security headers. It now adds X-Frame-Options, a frame-ancestors/base-uri/object-src policy, HSTS and a Permissions-Policy. A full content policy is left for a tested hosted deploy.

**Not run:** `deploy/test_hosted_preview.mjs` needs a fresh `dist/` build (not rebuilt here). No real hosted deploy was tested.

## 17. Home and product page flow, About merged into Story (2 November 2026)

**Research:** home and product pages of Thorne, Sports Research, MyProtein, Wellbeing Nutrition and The Ordinary.
- Shop and bestsellers come right after the hero, usually with a short trust bar (Sports Research).
- Proof is grouped in one place: certifications, testing and experts (Thorne, Wellbeing Nutrition, Sports Research).
- Product pages put trust points under the buy button (Sports Research, Thorne).
- Product pages use a sticky section bar (Thorne): overview, ingredients, how to use, quality, reviews, FAQ.

**Home** (`web/home-content-e.js`, `web/home-content-e.css`; hero untouched)
- New order: hero, trust bar, launch range, **Proof, not promises**, lot lookup, everyday, one serving, voices, belief, four rules, sourcing, journal, FAQ, invitation.
- The repeated "Super Sevens cards" section is replaced by Proof, not promises, which has six document cards:
  1. FSSAI Central Licence, with a FoSCoS verify link
  2. Full product labels as PDFs
  3. Lot reports
  4. Manufacturer licences
  5. GST registration, with a GST portal verify link
  6. GMP certificates and test reports, on request
- Label PDFs: six are copied from "Full FInal Label/Pdfs" to `web/media/labels/`. **The Inositol PDF supplied is a blank page**, so that label shows "On request" until a real file is supplied.
- The home lot field placeholder no longer says "DEMO-01-01".

**Product page** (`web/pdp-flow-e.js`, `web/pdp-flow-e.css`)
- A sticky section bar (Overview · Ingredients · How to use · Quality & lot report · Reviews · Questions) highlights the section in view.
- New order: overview, defining detail, ingredients, how to use, one serving, quality, turn the bottle, reviews, questions, more products.
- Under Add to bag: pack length (servings, about N days at one a day) and four trust points.
- Quality has a "Download the full label (PDF)" link.
- The pincode note is final.

**About** (`web/story-about-e.js`)
- Story gains "About Body Café Co.": why we exist, why colour, why café and how we behave, taken from the About renderer.
- `/about` opens Story at #about.
- About is removed from E's navigation and footer, the mobile menu is renumbered, and other About links point to /story#about.
- About's "Our belief", numbers and colour book were not carried over, because they repeat Story and the homepage.

## 18. Curvy segments with a bottle-cap finish (2 November 2026)

**Stakeholder feedback:** the seven-segment "7/8" looked too sharp and edgy. They wanted it curvy, perhaps with a bottle-cap feel.

**Changes** (`web/super-sevens.js`, `web/super-sevens.css`)
- Every segment is now a rounded capsule drawn as an SVG path, with no pointed ends and no 6° slant. Segments are a little thicker (20) with wider gaps (7).
- This applies everywhere the system draws digits: hero, product numbers, proof and rule numerals, the bag tray and Story.
- **Large marks** (hero, Story, closing band) get a bottle-cap finish on each segment: fine ridges like a cap's knurled edge, plus a soft highlight, in its cap colour. Each segment is now a `<g class="ss-ms">`, so the hero hover, focus and replay animations work unchanged (verified).
- Digit width ratio updated from 143/200 to 122/200.

**Unchanged:** hero text and accessible labels.
**Backups:** in the session scratchpad (`super-sevens.before-curvy.*`).

## 19. Bottle-cap hero, minimal launch range, no animation (2 November 2026)

**Stakeholder feedback:**
- Remove the seven-segment hero completely and make something creative with the seven bottle caps, keeping the Super Sevens concept.
- No animations.
- The launch range made people scroll too much, so make it minimal.

**Changes** (`web/home-hero-e.js`, `web/home-hero-e.css`, loaded after `home-content-e`)
- **Hero:** the seven real cap renders (`web/media/renders/*-cap.webp`) laid flat to form the numeral **7**: four caps across the top, three down the stroke.
  - Each cap is a link to its product and shows its number; on desktop the name appears on hover or focus.
  - Caption: "Seven caps. One seven."
  - The segment stage, readout, replay, sound toggle and segment legend are removed.
  - **The hero text is kept exactly**, including the lede, which still describes "a seven-segment seven". Owner decision needed.
- **Launch range:** one row of seven cards, each with cap, number, name, key fact, MRP and Add to bag. It wraps to four per row on tablet and scrolls sideways on phone. Height drops from about 5,750 px of scroll animation to about 790 px.
- "Pour one serving" is removed from the homepage; it stays on product pages.
- **No motion in Variant E:** all CSS animations are off, scroll reveals show their content immediately, and the page-to-page colour flood and the footer play strip (segment mark plus sound) are switched off.

**Verified:** desktop, tablet and phone with no overflow; no hidden text on Story or Standards; no console errors; all tests pass.

## 20. Hero of bottles, shop-card launch range, credible proof section (2 November 2026)

**Feedback:** the trust section did not feel trustworthy, the cap hero was not attractive enough, and the launch range should match the shop cards exactly.

**Changes** (`web/home-hero-e.js`, `web/home-hero-e.css`)
- **Hero:** the seven real bottle renders (`renders/*-three-quarter.webp`), each under its own cap, stand in the shape of a **7**. Four bottles are across the back; three step forward and grow down the stroke.
  - Each bottle has a pool of its cap colour and is a link to its product, with a name tag on hover.
  - The stage is a soft cream rounded panel, with a colour-dot caption: "Seven caps, seven colours, one seven."
  - Static, and the hero text is unchanged.
- **Launch range:** the shop card design. Each card has:
  - a cap-colour band with number and format
  - the bottle image
  - the name in Lemon Milk capitals and the pack size
  - MRP, an in-stock indicator, View product and Add to bag

  Compare isn't included; it's a shop-page feature. The cards scroll sideways on phone (with `contain: paint`, which fixed a 434 px page scroll).
- **Proof: "Licensed. Labelled. Traceable."**
  - **Licence record:** a dark panel with our own seal, holding FSSAI Central Licence, GSTIN, licensee and customer care. IDs are in monospace and there are Verify buttons for FoSCoS, the GST portal and Contact.
  - **Published labels:** a bottle fan plus the PDF list, with Inositol on request.
  - **Checks:** GMP, third-party tested and lot traceable, with Look up your lot (jumps to the lot section) and Ask for a certificate or test report.
  - **Makers:** the three named manufacturers, each with city, FSSAI licence number and the products it makes.

## 21. The cap tower hero (2 November 2026)

**Owner direction:** caps only, no bottles, not just the numeral 7; the main headline should be "The Super Sevens". This supersedes the earlier "keep the hero text exactly" rule for the hero.

**Changes** (`web/home-hero-e.js`, `web/home-hero-e.css`)
- **Copy:**
  - Kicker: "Body Café Co. · Seven everyday supplements"
  - H1: **"The Super Sevens."** (rust full stop)
  - Sub: "Seven caps. Seven colours. One clear label each."
  - Lede about cap colours and readable label facts
  - Buttons: Shop all seven / Meet the Super Sevens, plus a seven-dot colour row
- **Visual:** the seven caps drawn side-on in SVG, stacked into a tower like cups on a café counter.
  - Each cap has its colour, ridged knurling, cylindrical shading, a top highlight and a rim, and each sits slightly askew.
  - Each layer links to its product, with a dotted leader to a label (number chip, name, key fact).
  - Static apart from a small nudge on hover. Phones show the number and name only.
- **Verified:** desktop, tablet and phone with no overflow or overlaps; tests pass.

## 22. "Pick a cap" hero (2 November 2026)

**Owner's choice:** option A, built on the committed top-view cap hero (commit 7b21c81 and later). The team's file is unchanged; this is a separate layer.

**Changes** (`web/home-pick-e.js`, `web/home-pick-e.css`, loaded after `home-hero-e`)
- In the hero only, each cap becomes a button. The closing section keeps its cap links.
- Picking a cap:
  - tints the hero with a soft wash of that cap's colour
  - rings the cap in its colour and keeps its name tag visible, while the other six fade
  - shows a product ticket under the cluster: number, name, PANTONE® reference (from the brand colour sheet), form, amount per serving, when to take it (label timing plus directions tag), pack, MRP, View product and Add to bag
- Picking the same cap again clears it. "Tap a cap to meet it." shows when nothing is picked.
- On desktop the cluster narrows to 400 px so the caps and the ticket share the first screen.
- Instant state changes only, with no animation.
- **PANTONE references:** Iron 7599 C · L-Theanine 5763 C · D3 + K2 2372 C · Omega-3 7543 C · Inositol 2572 C · Creatine 7708 C · Psyllium 2325 C.
- **Verified:** picking, clearing, keyboard, Add to bag (bag count and toast), and desktop, tablet and phone with no overflow; tests pass.

## 23. Hero "wow" layer (2 November 2026)

**Owner feedback:** show cap names by default, put something creative between the text and the caps, and make the first impression "wow".

**Changes** (`web/home-pick-e.js`, `web/home-pick-e.css`, on top of the committed cap hero)
- **Colour sunrise:** seven concentric arcs in the cap colours, drawn behind the cap cluster so the top caps rise above it and the rest sit inside. Static, at 60% opacity, dimmed while a cap is picked.
- **Bridge badge:** a round sticker in the gap between text and caps, tilted -8°.
  - Ring text: "SEVEN CAPS · SEVEN COLOURS · ONE CLEAR LABEL"
  - Centre: a cap split into seven colour slices
  - A dotted curved pointer to the caps with an italic "tap a cap" note
  - On tablet and phone it sits centred between text and caps, without the pointer.
- **Caps:** each sits on a soft glow of its own colour, with an always-visible name pill (number chip plus name) underneath.
- "Pick a cap" still works: colour wash, ring, ticket, Add to bag.
- **Verified:** desktop, tablet and phone with no overflow or cap overlaps; tests pass.

## 24. Hero, cleaned up: caps on a café saucer (2 November 2026)

**Owner feedback:** smoother, better, not cluttered; clean but very creative.

**Removed:** the rainbow arcs, the dotted pointer and "tap a cap" note, the hint line, the per-cap glows, the name pills and the colour-dot row under the buttons.

**Now** (`web/home-pick-e.js`, `web/home-pick-e.css`)
- The seven caps are served on one soft cream **café saucer**: a white centre, a fine rim and a soft shadow.
- The small Super Sevens badge rests on the saucer's edge, tilted like a sticker.
- Names are plain text under each cap: a small coloured number above the name.
- All caps are exactly the same size; names can no longer widen their cells.
- **Smooth picking:** the colour wash fades in over 0.45 s, the other caps fade back over 0.3 s, and caps lift 3 px on hover. These transitions only run on interaction, and are switched off for reduced-motion users.
- **Verified:** desktop, tablet and phone with equal cap sizes, no overlaps and no overflow; tests pass.

## 25. Homepage hero — badge removed, caps open products, left-side touches (2 November 2026)

Layer: `web/home-pick-e.js` + `web/home-pick-e.css`, loaded after the team's `home-hero-e.*` (their files are unchanged).

- Removed the round "Seven caps" badge and the pick-a-cap ticket. Each cap is a plain link to its product page (`/iron-bisglycinate`, `/l-theanine`, `/vitamin-d3k2`, `/omega3-fishoil`, `/myo-and-dchiro-inositol`, `/creatine-chews`, `/psyllium-husk`).
- Right: the seven caps sit on a cream café saucer, numbered 01–07 with the name under each cap. All caps are the same size.
- Left: the headline's full stop is the real Iron cap (screen readers still read "."). "Seven colours." is underlined with seven equal bands, one per cap colour. A facts line sits under the buttons: lowest MRP from the catalogue, "FSSAI licensed" and "Every lot traceable".
- Nothing moves by itself. Caps lift slightly on hover only.
- Checked at 1440, 820 and 375 px: no sideways scroll; clicking a cap opens its product page. All JS and Python tests pass.

## 26. Lighter homepage text (3 November 2026)

**Team feedback:** too much text, not a minimal feel ("khichdi"). A first attempt removed whole sections; the owner rejected that. Every section stays, and only the extra text goes.

Layer: `web/home-minimal-e.js` + `web/home-minimal-e.css`, loaded after every other home layer. The earlier files are unchanged; removing the two lines from `web/index.html` brings the text back.

- **Kept everywhere:** all 13 sections in the same order, every heading and eyebrow, every button and link, product cards, label facts, licence records, maker names, directions, FAQ and the footer legal line.
- **Removed** (the explanation paragraph under a heading):
  - Hero: the paragraph under "Seven caps. Seven colours."
  - Range: "Each product earns its place…" (Open the shop stays)
  - Proof: the intro, and the one-line description under GMP certified, Third-party tested and Every lot traceable
  - Lot: the paragraph explaining a lot report (the link to the guide stays)
  - Everyday: the 47-word intro
  - Voices: the intro, and the sentence under each of the three review rules
  - Belief: both paragraphs (Read our story stays)
  - Four rules: the sentence under each rule (the four rules stay)
  - Sourcing: both intro paragraphs (the maker cards say the same)
  - Learn: the intro and each guide's subtitle
  - Invitation: "Start with one product…"
- **Result:** about 1,640 → 1,170 words on the page.
- **Verified:** 1440 px and 375 px with all 13 sections and no sideways scroll; all 10 design-tools tests and 32 server/HTTP tests pass.

## 27. Lighter text on every page (3 November 2026)

**Owner:** apply the homepage text cut to all pages. Same rule: sections stay, only extra text goes.

Layer: `web/pages-minimal-e.js`, loaded last (after `pdp-flow-e.js`). Earlier files are unchanged.

- **Kept everywhere:** sections, headings, buttons, forms and form hints, product facts, label amounts, directions, cautions, manufacturer and licence records, the Super Sevens rules, review and privacy notices, medical-advice and grievance lines, Learn articles, policies and the Story chapters. A paragraph with a link or control in it is never removed.
- **Removed:** page intros (`.ez-lede`) and section-head descriptions on every page, plus:
  - Shop: intro, price note, the format descriptions and their notes (which products use each format stays)
  - Product pages: the long "story" paragraph, section lead lines, the Super Sevens "segment" sentence, the pour-symbol note
  - Lot reports: intro and the seven-segment typing note
  - Standards: section leads and "meaning" notes
  - Story › About: the "why we exist" paragraphs, which repeated Story chapters 1–2, and the "no café to visit" note
  - Learn: hero intro and the label-tool intro
  - Help and Contact: page intros
- **Words:** Shop 495 → 335 · Super Sevens 984 → 915 · Standards 2,116 → 1,813 · Story 1,710 → 1,586 · Iron product page 1,709 → 1,474 · Learn 734 → 660 · Lot reports 638 → 589 · Help 206 → 191 · Contact 468 → 432.
- **Verified:** all pages at 375 px with no sideways scroll; product page and Standards checked at 1440 px; all 10 design-tools tests and 32 server/HTTP tests pass.

## 28. Bullets instead of paragraphs, and no card stripe (3 November 2026)

**Owner:** people don't read big paragraphs. The site should be understood visually, with short, meaningful text: Amazon-style bullets. Example of clutter to remove: the "CAPSULES" stripe on product cards.

Layer: `web/pages-minimal-e.js` + `web/pages-minimal-e.css` (extends section 27).

- **Long paragraphs → bullets** on Home, Shop, product pages, Standards, Lot reports, Help, Contact, Super Sevens and Bundles:
  - Any plain paragraph or fact value of 20+ words with two or more sentences becomes a list, one sentence per bullet, in the same words. Nothing is reworded or added.
  - Splits never happen after abbreviations (Pvt., Ltd., Lic. No., M.R.P.). A short answer like "Not necessarily." stays joined to its explanation.
  - Paragraphs with links, forms, status notes ("not published yet") and text inside Story chapters, Learn articles and policies keep their prose.
- **Product pages, "About this item"** under Add to bag, built only from the label record: amount per serving · serving, pack and days · each directions sentence · dietary note and format · maker and city. Then **Cautions**: each warning sentence from the label as a bullet. The older "60 servings · one a day" line is removed, since this list covers it.
- **Card stripe removed:** the coloured "01 CAPSULES" band on Home range cards and Shop cards. The format still shows under the name.
- **Verified:** all seven product pages build their list from their own record; no bad splits found across 14 pages; 1440 px and 375 px with no sideways scroll; all 10 design-tools tests and 32 server/HTTP tests pass.

## 29. Visual "at a glance" icons (3 November 2026)

**Owner:** still no visual understanding, only text everywhere.

New `web/glance-e.js` (loaded before `pages-minimal-e.js`) draws one icon set from each product's label record, so every page shows the same facts the same way:
- **When:** sunrise (morning), sun (noon), moon (night); all three for Creatine ("any one time").
- **Dose:** that many capsule, softgel or tablet shapes in the cap colour (Psyllium shows five capsules).
- **Food:** full plate (with food), dashed empty plate (empty stomach), half plate (with or without).
- **Special instruction:** crossed-out milk glass (Iron), glass of water (Psyllium), "chew it" (Creatine).
- **Pack:** calendar with days per pack.
- **Diet:** the FSSAI green veg mark or brown non-veg mark.

**Where it shows**
- **Product pages:** "At a glance" tiles under Add to bag replace the "About this item" bullets: the key fact in the cap colour, then dose, when, food, special instruction, days and diet. Cautions sit in a collapsed "Cautions (n)" row and stay in full in How to use.
- **Homepage cards and Shop line-up cards:** an icon row under the pack size.
- **Homepage "A small part of a good day":** each product's directions sentence is replaced by its icon row.
- Shop's Cards view keeps the Super Sevens playing cards.

**Verified:** all seven products read correctly; 1440 px and 375 px with no sideways scroll; all 10 design-tools tests and 32 server/HTTP tests pass.

## 30. Concept icons on Standards, Lot reports, Story and the homepage rules (3 November 2026)

New `web/visuals-e.js` (styles in `pages-minimal-e.css`): one line-icon set for the ideas the site repeats, placed on list headings in a tinted circle. Each list is matched by selector and item count, so a changed list is left as it was. No copy changes.

- **Standards:**
  - 4 "how we…" boxes: form, factory, check, scale
  - the ingredient → product → lot → document chain: leaf, factory, tag, document
  - four principles: form, pin, check, document
  - three places: pin, gear, factory
  - four quality questions: box, gear, check, hourglass
  - lot path: bottle, tag, document
  - editorial practices: link, flag, no-sign
  - evidence kinds: book, flask, person
- **Lot reports:** Match / Understand / Inspect (search, book, document); lot, order, barcode and SKU numbers (tag, receipt, barcode, box).
- **Story:**
  - chapter 4's form / amount / moment / proof cards each get a large icon
  - the manifesto line "We name the form. We state the amount. We tell you when. We show our work." becomes a 2×2 grid of icon badges, same words
  - About's four values: eye, question, check, heart
- **Homepage:** "Four rules on every bottle" uses the same form / amount / when / document icons as Story, so the idea reads the same everywhere.
- **Verified:** 1440 px and 375 px with no sideways scroll; all 10 design-tools tests and 32 server/HTTP tests pass.

## 31. Home rebuilt to the Page Flow Plan (3 November 2026)

**Plan:** [Body Café Co. — Page Flow Plan](https://claude.ai/artifact/Lv12jWUM1rYCptJDV2E9tr): research-backed flow for every page, with one visual and one headline per section. The owner approved starting with Home.

Layer: `web/home-v2-e.js` + `web/home-v2-e.css`, loaded last. They replace `home-minimal-e.*`, which is removed. `visuals-e.js` now shares its icon set (`BCCVisualsE.icon`). `pages-minimal-e.js` still removes the card stripe and adds icon chips on Home, but no longer turns Home paragraphs into bullets.

| # | Section | Headline | Visual |
| --- | --- | --- | --- |
| 1 | Hero | The Super Sevens. | Caps on the saucer; one button, Shop all seven |
| 2 | Trust strip | (none) | Four icons: FSSAI licensed · GMP certified · Third-party tested · Every lot traceable |
| 3 | The seven | Seven everyday essentials. | Bottle cards with icon chips, price and Add to bag; Shop all link |
| 4 | Your day | When to take each one. | Morning / noon / night columns with icon chips |
| 5 | Check any bottle | Your bottle has a record. | Three icon steps (pack → type it in → record) beside the lot disc and lookup |
| 6 | Close | You should always know what you're being served. | Caps; Shop the range · Read our story |

- **Leaves Home:** trust bar, proof records, belief menu, four rules, sourcing, Learn, FAQ. They now live on Story, Standards, Learn and Help.
- **Reviews:** the section shows by itself once a real review is published, and is hidden while all cards are empty.
- **Removed:** the small all-caps labels above Home headings (the hero keeps its line), plus "View product" and "In stock" on cards (the card and Add to bag remain; "Out of stock" still shows).
- **New lines for owner review:** "Seven everyday essentials." (also the page title), "When to take each one.", "Your bottle has a record.", and the three step labels.
- **Result:** 13 sections become 6, about 1,100 words become 345, and the page is 5,300 px tall instead of 13,000.
- **Verified:** 1440 px and 375 px with no sideways scroll; all 10 design-tools tests and 32 server/HTTP tests pass; product page tiles and Story icons are unaffected.

## 32. Product page rebuilt to the Page Flow Plan (3 November 2026)

Layer: `web/pdp-v2-e.js` + `web/pdp-v2-e.css`, loaded last. It reuses the step style from `home-v2-e.css` and the icons from `visuals-e.js`.

| # | Section | Headline | Visual |
| --- | --- | --- | --- |
| 1 | Buy box | Product name + label subtitle | Gallery; price; Add to bag; four trust icons; At a glance tiles; Cautions (n) on tap |
| 2 | Highlights | The product's own hook (e.g. "Iron first. Chai later.") | Its label diagram beside three short lines; "Why this form?" opens on tap |
| 3 | How to take it | How to take it. | Morning / noon / night slots, the "keep in mind" line, the pour tray |
| 4 | Label facts | Everything on the label. | Supplement facts table open; every other label row (ingredients, amount, allergens, use, cautions, storage, maker) opens on tap; "What to check on your pack" and "Reading this ingredient" fold |
| 5 | Check your bottle | This bottle has a record. | Three icon steps, label PDF, lot lookup; quality and sourcing details fold |
| 6 | Reviews & questions | Reviews & questions | Reviews summary, Write a review, common questions, ask form |
| + | More of the seven | More of the seven. | Other six products |

- **Removed:** section counters ("04 · … / 11"), the hero's "01 / 07 · Capsules · nickname" line and giant number, the pack table (the tiles show format, pack and serving), the key-fact tile (the subtitle states it), the separate "defining detail" section (its diagram moved into Highlights), the Super Sevens card section (lives on /super-sevens), and the "shown for browsing" note.
- **Kept, now on tap:** every label row, caution, storage line, licence and quality status. A row both lists carried (Allergens) shows once.
- **Section bar:** Overview · How to take · Label · Lot record · Reviews.
- **New lines for owner review:** "How to take it.", "Everything on the label.", "This bottle has a record.", "Reviews & questions", "More of the seven.", "Type it in below".
- **Result (Iron):** 11 sections become 6 plus related products, about 1,500 words open become 654, and 13,000 px becomes 8,000 px on desktop.
- **Verified:** all seven products build the new layout with their own diagram and tiles; 1440 px and 375 px with no sideways scroll; all 10 design-tools tests and 32 server/HTTP tests pass.

## 33. Shop rebuilt to the Page Flow Plan (3 November 2026)

Layer: `web/shop-v2-e.js` + `web/shop-v2-e.css`, loaded last. Filter, sort, compare, Cards view and Add to bag behaviour are unchanged.

- **1 · Header:** "07 Shop all seven" and the line-up of seven bottles. The "Shop · 7 products" kicker is removed.
- **2 · Filters and cards:**
  - Each format button shows its shape (capsule, softgel, tablet) and each time button its sun or moon.
  - The "· choose any" hint is removed.
  - The "Showing all 7 products" line is visible only while a filter is on (screen readers always hear it).
  - Plain product cards stay the default; the Super Sevens playing cards remain under "Cards".
  - Cards show bottle, name, pack, icon chips, price, Add to bag and Compare. The "01 · Capsules" line, "View product" and "In stock" are removed ("Out of stock" still shows).
- **3 · Help:** "Not sure which one?" with one **Ask us** button. The help-centre button and policy links are removed; both are in the footer.
- **Removed:** "Capsules, softgels and chews". The filter row now shows the three formats.
- **New lines for owner review:** "Not sure which one?", "Ask us".
- **Result:** 4 sections become 3, 779 words become 234, and 4,077 px becomes 2,692 px on desktop.
- **Verified:** the Softgels filter shows D3 + K2 and Omega-3; Softgels + Night shows none; Clear restores 7. Add to bag updates the bag (local preview bag went 3 → 4 during the test). 1440 px and 375 px with no sideways scroll. All 10 design-tools tests and 32 server/HTTP tests pass.

## 34. Super Sevens page rebuilt to the Page Flow Plan (3 November 2026)

Layer: `web/sevens-v2-e.js` + `web/sevens-v2-e.css`, loaded last. It applies to `/super-sevens` only; the Shop's Cards view is unchanged.

- **1 · Hero:** "The Super Sevens" plus one line, "Seven caps. One number.", beside the caps. The "Body Café Co. presents" label and the intro are removed.
- **2 · Meet the seven:** the seven playing cards. Each card's back now keeps three facts (Pack, Serving, Per serving) plus its "when" line and "Read the full label" note. Format and Servings are removed from the back; the front already shows them.
- **3 · The digit:** the ten numerals stand alone. The "6 of 7 · names…" text under each moves to a hover title and screen-reader text.
- **4 · The rules:** every word kept (required guardrails). Each rule is marked with a no-sign icon instead of a numeral.
- **Removed site-wide on this page:** the small all-caps labels above headings.
- **New lines for owner review:** "Seven caps. One number.", "Meet the seven."
- **Result:** about 170 visible words on the card fronts and page (plan target: under 250). The page is about 4,000 px tall on desktop, down from 4,600.
- **Verified:** card flip shows the 3-fact back; 1440 px and 375 px with no sideways scroll; all 10 design-tools tests and 32 server/HTTP tests pass.

## 35. Owner review of the rebuilt pages (3 November 2026)

**Home** (`home-v2-e.js`). Three sections come back at the owner's request. Each keeps its small label, and the earlier trims (the proof intro, the check descriptions, and the review intro and rule sentences) stay.
- **Proof, not promises** ("Licensed. Labelled. Traceable."): licence record, published labels, checks, makers.
- **Voices** ("Real words, only."): always shown, including while no reviews are published.
- **Before you order** ("Good questions welcome here."): the five questions.
- **New order:** Hero · Trust strip · Seven everyday essentials · When to take each one · Proof, not promises · Your bottle has a record · Voices · Before you order · Close. The page is 8,500 px tall on desktop.

**Product page** (`pdp-v2-e.css`)
- On desktop (wider than 1,000 px), each section's left-hand heading sticks just below the site header and section bar (162 px from the top). It scrolls away when its section ends.
- Tablet and phone stack as before, with no sticky headings.

**Shop** (`shop-v2-e.js`, `shop-v2-e.css`)
- **Title:** "07 Shop all seven" is removed from view (screen readers still get the heading). The page now opens on the seven bottles.
- **View switch:** "View as: Line-up / Cards" is removed. Shop has one view, the product cards; the Super Sevens playing cards remain on /super-sevens.
- **Time filter:** "When to take it" is removed. Format filters remain, and the card chips show the time.
- **Ask us:** right-aligned beside "Not sure which one?", and still on the right when it wraps on phones.
- **Verified:** sticky headings stop at their section's end; Shop shows the cards grid with no title, switch or time filter; 1440 px and 375 px with no sideways scroll; all 10 design-tools tests and 32 server/HTTP tests pass.

## 36. Standards rebuilt to the Page Flow Plan (3 November 2026)

Layer: `web/standards-v2-e.js` + `web/standards-v2-e.css`, loaded last. Nothing is deleted. Each merged section's content sits behind a tap-to-open row, titled with its own heading, under the section it joined. The old anchors `#source`, `#checks`, `#evidence` and `#questions` now point at those rows.

| # | Section | Headline | Visual | Folded in (tap to open) |
| --- | --- | --- | --- | --- |
| 1 | Hero + record | Behind every colour, a record. | Four icon tabs (Formula · Source · Checks · Record), each with its publication status dot; the seven-cap product record picker | "Our standards, at a glance" became the tabs |
| 2 | The chain | Each stage proves something different. | Ingredient → finished product → lot → document, with icons | What we can show you, and what we won't claim · Where ingredients come from · How quality is checked · Published today, and still to come |
| 3 | Makers | Every ingredient, and who makes the product. | The ingredient explorer | Every label, side by side |
| 4 | Your lot | Follow your lot | The lot picture and three steps | (sub-labels removed) |
| 5 | How we communicate | How we communicate responsibly | Three practices with icons; then Explore the collection · Find your lot report | The evidence behind the standard · Good questions about our standards |

- **Removed:** the small labels and section counters ("07 / Your lot / 10"), plus the "How we work, and what is still to come." divider, whose sections are now folded.
- **Folds:** every box starts closed. The two `data-sx-wide-open` boxes no longer auto-open on wide screens.
- **Status dots:** Partly published (amber), Not yet published (grey), Lookup available (green). The words come from the page's own status list.
- **Result:** 13 sections become 5, about 1,800 words become about 700 shown at first, and the page is about 6,800 px tall on desktop instead of 13,000.
- **Verified:** picking a product shows its record; the Record tab jumps to Follow your lot; 1440 px and 375 px with no sideways scroll; all 10 design-tools tests and 32 server/HTTP tests pass.

## 37. Story rebuilt to the Page Flow Plan (3 November 2026)

Layer: `web/story-v2-e.js` + `web/story-v2-e.css`, loaded last. Every chapter and About section is kept word for word behind a **Read** row in the part it belongs to. `/about` still lands on `#about`, which is now part 1.

| # | Part | Headline | Visual | Behind "Read" |
| --- | --- | --- | --- | --- |
| — | Hero | You should always know what you're being served. | Seven-segment caps; "A good café shows you the menu. So do we." | — |
| 1 | The problem | The front of the label shouts. The back whispers. | A dark "Front" card ("More energy, more strength, more glow.") beside a quiet "Back" card in tiny type ("what form the ingredient is in, how much of it you actually get, and when you should take it."). Both lines are taken from chapter II. | Careful people · An opaque shelf · The front of the label shouts… |
| 2 | The idea | A good café never hides the recipe. | Chapter III's café menu board | Why Body Café Co. exists · Why "café" |
| 3 | How | Form. Amount. Moment. Proof. | The four cards with icons | The thinking behind our products · What we believe · What we can demonstrate · Most supplement shopping… · Name, colour, format, label |
| 4 | The promise | (manifesto band) + Four values, each with something to check. | Manifesto icon badges; the four values with icons | Our place in everyday life |
| 5 | Invitation | Start with one. Read the whole label. | Shop all seven | — |

- **Removed:** the chapter rail (its seven ticks no longer match), the small labels (the manifesto tagline stays), and the "Who we are, and how we work." About header. The duplicate milk-packet opening is now behind one tap.
- **Read rows** open with the text already visible (no scroll-in animation inside them).
- **New line for owner review:** "A good café never hides the recipe." is the Home belief line, reused here as a headline.
- **Result:** 14 parts become 5 plus hero and close; about 1,590 words become about 530 visible; about 11,800 px becomes 6,500 px on desktop.
- **Verified:** opening a Read row shows the chapters; /about → /story#about; 1440 px and 375 px with no sideways scroll; all 10 design-tools tests and 32 server/HTTP tests pass.

## 38. Lot reports, Learn, Help and Contact to the Page Flow Plan (3 November 2026)

Layer: `web/support-v2-e.js` + `web/support-v2-e.css`, loaded last. `visuals-e.js` gains three icons (truck, back arrow, card). Forms, lookups, filters and the contact switchboard work as before.

- **Lot reports** (3,060 px desktop)
  - The lookup stays first. The kicker, section counters and the "02" in "Find your lot report" are removed.
  - The result area is hidden until a lookup returns a record (tested: Iron · DEMO-01-01 shows its record).
  - The nine report terms open on tap ("The 9 terms on a report"). What a report can't show stays visible.
- **Learn** (5,000 → 3,340 px desktop)
  - The seven cap-coloured guide cards now carry each guide's question, under a new heading, "Seven product guides."
  - The second list of the same seven guides ("One ingredient. A better question.") is removed.
  - The ten questions open on tap, and the filter still finds them (tested: "iron").
  - Kickers and counters are removed.
- **Help:** every quick action and topic gets an icon:
  - Track an order (truck) · Report an issue (flag) · Request cancellation (no-sign) · Contact support (question)
  - Orders (receipt) · Delivery (truck) · Returns (back arrow) · Payments (card) · Account (person) · Products (bottle) · Lot reports (tag)
  - The kicker is removed.
- **Contact**
  - The phone switchboard and topic picker stay first.
  - "Ways to reach us" repeated them, so CSS hides it once the switchboard is built. It stays in the page because the switchboard reads its links.
  - Business details open on tap. Hours, and the complaints and grievance details, stay open (required information).
- **New line for owner review:** "Seven product guides."
- **Verified:** all four pages at 1440 px and 375 px with no sideways scroll; all 10 design-tools tests and 32 server/HTTP tests pass.

## 39. Product cards and the Shop header (3 November 2026, owner review)

**Product cards on Home and Shop** (`pages-minimal-e.js` card code, `pages-minimal-e.css`)
- The FSSAI veg / non-veg mark now sits at the right end of the product-name line. It is no longer in the chip row.
- Price and **Add to bag** share one row, price on the left and the button on the right, on desktop and phone.
  - The separate "View product / Add to bag" row is gone. The card name still opens the product.
  - The "Out of stock" line is removed; the button already says it.
- The empty gap between the name and the pack size ("30 capsules") is closed. Names had a two-line minimum height (`min-height: 2.4em`); it is now 0.
- On phones, the Shop's mobile CSS stretched the button to full width (`width: 100%`), pushing it out of the card. Inside the buy row the button now sizes to its label.

**Shop header** (`shop-v2-e.js`, `shop-v2-e.css`)
- The line-up of seven bottles with numbers, names and prices is removed.
- A visible heading opens the page instead: **"Shop the seven."** with one line, **"Seven everyday supplements. One cap colour each, every label fact in plain view."** The browser tab title follows it.
- **New lines for owner review:** both of the above.

**Verified:** Add to bag from a Shop card updates the bag (local preview bag 4 → 5 during the test). All seven Shop and Home cards keep the button inside the card at 1440 px and 375 px, with price and button on one row; no sideways scroll. All 10 design-tools tests and 32 server/HTTP tests pass.

## 40. Consistent product cards (3 November 2026, owner review)

`pages-minimal-e.js` card code and `pages-minimal-e.css`; applies to the Home and Shop cards.
- **Pack size removed:** the "60 capsules" line under the name is gone. The dose chip already shows the serving, and the product page shows the pack.
- **Same layout in every card:** bottle, name row (with the veg / non-veg mark), chips straight under the name, then price and Add to bag on the bottom edge.
- **Same height:** on desktop and tablet every card is the same height (`grid-auto-rows: 1fr`), so names and price rows line up across rows. Measured on Home: names at 290 px and price rows at 419 px in all seven cards, every card 505 px tall. On Shop: 236 / 354 / 466 px.
- **One exception:** Myo & D-Chiro Inositol's name wraps to two lines, so its chips start one line lower. Its price row still lines up.
- **Verified:** 1440 px and 375 px with no sideways scroll; every Add to bag button fits inside its card; all 10 design-tools tests and 32 server/HTTP tests pass.

## 41. Home: better "When to take each one" and Voices, and a full mobile pass (3 November 2026)

`home-v2-e.js` and `home-v2-e.css`.

**When to take each one**
- **Three time-of-day cards:**
  - Morning: warm cream, sunrise icon, 5 products.
  - Noon: light, sun icon, Creatine with an "Any one time" tag.
  - Night: dark navy, moon icon, Psyllium.
- **Product rows:** each product shows its cap photo, its name and its label icons (dose shapes, food, veg / non-veg). A row opens the product. The time chip is removed inside a slot, since the slot shows it.
- **Removed:** the sun band and the text columns.
- **Layout by width:** desktop is 1.5 : 1 : 1; tablet puts Morning full width with Noon and Night below; phone stacks the three cards.
- **Slots come from the label directions** (`BCCGlanceE.facts`), the same source as the product page tiles.

**Voices**
- **Empty state:** "0 published reviews" and the status line on the left; the three review rules on the right as icon cards: Delivered first (box), Checked, not chosen (check), Disclosed (flag).
- **Hidden until the first real review:** the seven "first verified review … will appear here" cards and the empty "average out of 5". Both show again by themselves once a real review is published.
- **Height:** 1,135 px becomes 532 px on desktop.

**Mobile pass (375 px phone, 768 px tablet)**
- **Proof, not promises:** on phone the four record cards become one swipeable row, like the product cards. The section is 2,735 px → 1,155 px tall.
- **Voices:** one column on phone and tablet (before, a later desktop rule squeezed it into half the width).
- **Close:** the caps drop their name labels on phone, where the labels overlapped; each cap is still a named link.
- **Headings and hero:** section headings sized for phone; the hero saucer is capped at 360 px.
- **Result:** the phone page is 10,360 px → 8,080 px. An automatic check finds nothing past the screen edge at 375 px or 768 px.

**Verified:** 1440 px, 768 px and 375 px; all 10 design-tools tests and 32 server/HTTP tests pass.

## 42. Voices redesign with sample reviews; 2 × 2 grids on phones (3 November 2026)

Layer: `web/voices-v2-e.js` + `web/voices-v2-e.css`, loaded after `home-v2-e.*`. The old Proof swipe row in `home-v2-e.css` is removed.

**Voices** ("Real words, only.")
- **Desktop layout:** heading and rating summary on the left; product filter and review cards on the right; the three review rules as a slim trust row underneath.
- **Summary:** the average (4.4), stars, 5★→1★ bars with counts, and the note "Sample reviews for the design preview. Real, verified reviews replace them before launch."
- **Filter:** All plus the seven product caps; tapping a cap shows only that product's reviews (tested: Iron shows 2).
- **Cards:** stars, a "Sample" tag, a bold title, the words, then the reviewer's initial in the cap colour, first name · city · month, and a product chip with its cap that opens the product. The first card is featured, larger and full width.
- **Phone:** one column, the first three reviews, then **Show all 8 reviews**.
- **Sample reviews:** eight, preview releases only (the same `BCCRelease.preview` rule as `demo-content.js`). Production never shows them.
  - Each is tagged "Sample"; none says "Verified delivery".
  - None claims a health effect or result. They cover label clarity, format, taste, the veg / non-veg mark, delivery and the lot lookup.
  - Ratings: 5, 5, 4, 4, 5, 5, 3, 4. The 3★ one is kept on purpose: "low ratings are published too".
  - They disappear by themselves when the reviews API returns real reviews (super-sevens.js replaces the list). The live counter then shows, and the sample summary hides.
  - **Before launch:** delete the `SAMPLES` array in `voices-v2-e.js`, or ship as a production release.

**Phones (760 px and below)**
- **Seven everyday essentials:** a 2 × 2 grid instead of the sideways row. Smaller bottle, name, chips, then price (with "MRP") and a short **Add** button on one row.
- **Proof, not promises:** four tiles in a 2 × 2 grid (Licence record · Full labels · Checks · Makers), each with an icon. Tapping a tile opens that record full width; tapping again closes it. The section is 624 px tall on phone.

**Verified:** filter and Show all work; tiles open and close; 1440 px, 768 px and 375 px with no sideways scroll. All 10 design-tools tests and 32 server/HTTP tests pass.

## 43. Voices: sticky summary (3 November 2026, owner review)

`voices-v2-e.js` and `voices-v2-e.css`.
- **On desktop (wider than 1,000 px):** the heading ("Voices · Real words, only.") and the rating summary share one left column (`.vv-side`). The column runs the full height of the reviews, and its content sticks 100 px from the top while the reviews scroll.
- **Where it stops:** the column ends where the reviews end, so the summary scrolls away with the last review and never covers the "Delivered first" rule cards. Measured at five scroll positions: it sat at 100 px through the reviews, then its bottom stayed above the rules' top (225 px vs 261 px, and 25 px vs 61 px).
- **Tablet and phone:** the summary stays in normal flow (not sticky), above the reviews.
- **Verified:** no sideways scroll at 375 px; all 10 design-tools tests and 32 server/HTTP tests pass.

## 44. Shopping journey: reducing uncertainty (Hick's Law ideas), applied to the seven (3 November 2026)

The owner shared five practical ideas: a clear next action, labels that predict their destination, options organised by the shopper's goal, detail shown when it becomes relevant, and routes for people who already know what they want. Owner decisions: use each pack's printed front-label line for goals, and use clearer menu names.

| Idea | What changed | Where |
| --- | --- | --- |
| 1 · Make the next action clear | On product pages, **Add to bag** is the only filled button in the buy box. The pincode **Check** is now an outline button. | `pdp-v2-e.css` |
| 2 · Labels that predict the destination | Menu: Standards → **Quality** · Story → **About us** · Lot report → **Check your lot**, in the header, mobile menu and footer (also Lot reports / Find a lot report → Check your lot). Page addresses are unchanged. | `pages-minimal-e.js` (chrome) |
| 3 · Organise around the shopper's goal | Shop gets **What it supports**: All · Energy metabolism · Calm & focus · Bone, muscle & heart · Heart, brain & joint · Hormonal & metabolic · Strength & performance · Digestive health. Each chip is a short form of one pack's printed front-label line; the full line is the chip's tooltip and is shown on the card. It combines with Format; when both together match nothing, a line says so with "Show all seven". | `shop-v2-e.js`, `shop-v2-e.css` |
| 4 · Detail when relevant | Every product card (Home and Shop) shows the pack's printed front-label line, word for word (for example "Supports Calm Mind & Clear Focus"), under the name. Directions, cautions and ingredients stay on the product page. Pack size stays off the card (owner, section 40). | `pages-minimal-e.js`, `pages-minimal-e.css` |
| 5 · Support people who know what they want | Header search, the two Shop filters, direct product links on every card and cap, and Check your lot in the header. | existing + above |

- **Claim lines used, from `label-records.json` `label_front.claim`:**
  - Iron: Supports Hemoglobin Formation & Energy Metabolism
  - L-Theanine: Supports Calm Mind & Clear Focus
  - D3 + K2: Supports Bone, Muscle & Heart Health
  - Omega-3: Supports Heart, Brain & Joint Health
  - Inositol: Supports Hormonal & Metabolic Balance
  - Creatine: Supports Strength & Performance
  - Psyllium: Supports Digestive Health & Regularity

  No new benefit wording is written. The short chip names abbreviate these lines and are for owner review.
- **Phone:** both Shop filter rows wrap (no sideways scrolling) with compact chips. Home's 2 × 2 cards show the line in smaller type.
- **Verified:**
  - Filters: Calm & focus shows L-Theanine; + Softgels shows the nothing-matches line; Show all seven restores 7.
  - Menu reads Shop · Super Sevens · Quality · Learn · About us · Check your lot.
  - Layout: 1440 px and 375 px with no sideways scroll.
  - Tests: all 10 design-tools tests and 32 server/HTTP tests pass.

## 45. Owner homepage simplification and product review summaries (3 November 2026)

- Hero eyebrow: **Seven everyday supplements**. Hero line: **Seven caps. Seven colours. Seven clear label.** (exact requested wording).
- Removed Home's **When to take each one**, **Proof, not promises / Licensed. Labelled. Traceable.**, and closing **You should always know what you're being served** sections. Home now keeps hero, trust strip, collection, lot lookup, Voices and FAQ.
- L-Theanine's compact food instruction and At a glance tile now say **With or empty stomach**. Full supplied label directions are unchanged. The food chip wraps on narrow cards.
- Removed MRP beside Home/Shop/PDP prices, and from the E comparison table's Price heading. Amounts and label/policy copy are unchanged.
- Voices' selected product now controls average, review count and rating-distribution bars, as well as the cards. All restores the weighted whole-range summary. API summaries cover every published rating, not just the few newest displayed reviews. Preview samples remain clearly identified and production never substitutes samples.
- Review-rule headings: **Verified purchases · Fair moderation · Incentives disclosed**.
- FAQ left copy, following the owner's screenshot: **Good to know · Your questions, answered. · Find more answers**. The five right-hand questions and their answers remain.
- Verified 36 responsive route/width combinations (Home, Shop and all seven products at 320/390/768/1440); 5 preview-review and 5 mocked published-review filter states. The 10 existing frontend check modules pass. Screenshots and QA results: `design-review/home-revision-2026-11-03/`. Local changes only; no commit or deployment.

## 46. Shop support filter removed (3 November 2026)

At the owner's request, removed the entire **What it supports** filter, its secondary card-hiding behavior and its empty-state UI. Removed its unused CSS. Format, stock and sort controls and the product cards retain their existing behavior. Checked desktop and phone: seven products show initially; Softgels shows two; All restores seven; no horizontal overflow.

## 47. Shop stock-only control removed (3 November 2026)

Removed **In stock only** from Variant E Shop at the owner's request. E ignores the retired `stock=in` parameter so an older link cannot leave an invisible stock filter active. Other variants keep their stock controls. Format and sort remain. JavaScript syntax, the Shop content check and phone/desktop browser checks pass.

## 48. Shop cards match Home; four columns on desktop (3 November 2026)

Matched Shop's product cards to Home's **Seven everyday essentials** card dimensions, bottle scale, name typography, label chips, rounded backgrounds and price/Add row. Desktop uses four columns (four products, then the remaining three); tablet adapts and phone uses the same two-column cards as Home. The comparison picker remains available at the top of each card, outside its height calculations. At 1440 px, Home and Shop cards both measure approximately 315.5 × 534.8 px; phone dimensions also match. Checked 320/390/768/1100/1440 px with no page overflow, aligned card sizing and functioning format filters. QA and screenshots: `design-review/home-revision-2026-11-03/shop-card-grid-checks.json` and `shop-grid-desktop.png`.

## 49. Super Sevens compact hero and simplified cards (3 November 2026)

At the owner's request, shortened the `/super-sevens` hero while retaining all seven cap links. Measured hero height: ~177 px at 320, 200 px at 390, and 342 px at 768/1440. In **Meet the seven**, removed the top coloured band, number and segment mark; moved each nickname (e.g. The Morning One) into the coloured bottom strip in place of The Super Sevens; removed the inside flip icon and separate Flip/Save buttons. The View link and both factual faces remain. Cards turn by tap/click and Enter/Space, with accessible pressed state and a visible keyboard focus outline. Verified all seven cards at four widths, no page overflow, correct nickname strips and working turn/product-link controls. Evidence: `design-review/super-sevens-revision-2026-11-03/`.

## 50. Super Sevens hero matches Home height (3 November 2026)

Supersedes section 49's compact-height choice at the owner's request. The Super Sevens hero now matches the rendered homepage hero's height, retaining the updated cards and hero copy. A hidden, inert Home-hero sizing reference uses the same styles and responds to viewport/font changes; it is cleaned up on navigation. Verified exact measured height agreement at widths 320, 390, 768, 960, 1100 and 1440, at two viewport heights and after live resizing; no page overflow. At 1440 × 900 both heroes are 820 px tall. Evidence: `design-review/super-sevens-revision-2026-11-03/hero-height-match.json`.

## 51. Super Sevens hero redesign, number section removed, logo favicon, native cursor (3 November 2026)

At the owner's request, removed the entire **Every number, written in caps** section. Rebuilt the Super Sevens hero with Home's full-size responsive composition: readable heading and short line, seven named caps on the saucer, and a **Meet the seven** action that jumps to the card collection. This replaces the undersized hero artwork and removes the hidden height-measurement reference introduced in section 50; the two heroes now match naturally through shared markup and styles. The simplified nickname-strip cards and rules remain.

The favicon now consistently uses the supplied original `assets/brand/logos/Body Cafe Co logo.svg`, replacing the dynamic segment icon. Removed the custom dot/ring cursor implementation, animation listeners and cursor CSS; native cursors remain throughout E. Verified normal-motion desktop pointer interactions on Home, Shop, Super Sevens and a product page; no custom cursor element is created and the logo favicon persists.

All six width checks (320/390/768/960/1100/1440) show exact Home/Super Sevens hero-height agreement, no horizontal overflow, one H1, seven working cap links/cards, and no removed card controls or sizing probes. Card keyboard turning and Meet the seven navigation pass; favicon SVG responds 200. All 10 existing frontend test modules pass. Screenshots and results: `design-review/super-sevens-revision-2026-11-03/hero-redesign-*`. No commit or deployment.

## 52. Remove only the Super Sevens hero saucer (3 November 2026)

Removed the round saucer behind the seven caps in the Super Sevens hero. Cap artwork, names, links, spacing, copy and other hero content remain. The homepage saucer is unchanged. Phone/desktop checks confirm seven cap links and no overflow. Screenshot: `design-review/super-sevens-revision-2026-11-03/hero-no-saucer.png`.

## 53. Meet the seven: four-column desktop grid (3 November 2026)

The Super Sevens card collection now uses four equal columns from 1100 px upward: four cards in row one and three in row two. Smaller layouts retain their responsive sizing. Verified 390/1100/1440 px, all seven cards present and no page overflow. Screenshot: `design-review/super-sevens-revision-2026-11-03/cards-four-columns.png`.

## 54. Product gallery sticks; Reviews heading scrolls normally (3 November 2026)

On desktop product pages, the left gallery now stays below the header while the right purchase card scrolls and stops at the shared hero grid's end. The purchase panel itself uses normal positioning. Gallery artwork height is capped against viewport height so controls/caption remain reachable on shorter displays. **Reviews & questions** has a non-sticky heading; other section headings retain their existing behavior. Phone/tablet stay stacked with no sticky gallery. Verified all seven products at desktop viewport heights 700 and 900, pin/stop geometry, actual Reviews heading scroll movement, and 390/768 px layouts without overflow or page exceptions. Evidence: `design-review/product-sticky-2026-11-03/`.
