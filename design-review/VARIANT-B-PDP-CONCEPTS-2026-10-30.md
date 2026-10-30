# Seven product-page concepts for team review — Variant B

Research: 30 October 2026. Proposal only; no website, pricing, admin, checkout or deployment changes.

## Scope and decision

Give each of the seven Variant B product pages one distinct buying aid. Keep the same recognisable header, static first product image, facts, price location and bag behaviour, so the team compares specific merchandising modules rather than seven unrelated websites. After team review, combine the strongest modules into a shared product-page system.

Iron Bisglycinate is the proposed pilot for the user's Stack-style offer: one, two or three identical standard bottles, with transparent total price, contents and unit economics. Only Iron receives this multipack experiment initially. The six other products receive different concepts in the later prototype stage.

These are hypotheses about reducing purchase friction, not measured conversion improvements. Different products and customers make this a concept review, not an A/B experiment proving which module converts best.

## What was verified on The Stack

The live [Dream On: Glycine page](https://thestack.club/products/dream-on-glycine?variant=46263801544955) presents 30, 60 and 90 servings with displayed effective costs of approximately ₹22, ₹20 and ₹19 per serving. It also presents a 25% promotional-code announcement and separate one-time/subscription controls. These are observed display prices, not verified checkout totals; the relationship between codes and purchase options needs checking before reproducing the arithmetic.

The first product image depicts a bottle labelled 30 servings. The inspected text did not explicitly establish the number of bottles shipped for each selection. The user's three-bottle observation is the starting idea for BCC, not an independently verified fulfilment fact about this merchant.

Important: **capsules/tablets/softgels, servings, and days of supply are different measures.** Use the exact approved label for each. Never copy a competitor's serving size, formulation or timing.

## 1. Iron Bisglycinate — choose your pack

**Buying question:** “What do I receive, and does buying more actually save money?”

- Three large radio cards: **1 bottle / 2 bottles / 3 bottles**. Each shows identical bottle thumbnails, total units, total price and cost per capsule. Servings are an additional verified measure, not an assumed synonym for capsules.
- Show savings against buying that number of single bottles at the current single-bottle selling price. Keep any MRP comparison separately labelled.
- Selecting a card updates a small “Your box contains…” strip and the add-to-bag total. Preserve the original gallery first image; show quantity artwork beside the offer instead.
- Use “Lowest cost per capsule” for the mathematically lowest option. Do not claim “Most popular” without actual sales evidence.
- State “One-time purchase. You receive 3 standard bottles” beside the relevant option. No new bottle size or label is needed.

Reference: [The Stack](https://thestack.club/products/dream-on-glycine?variant=46263801544955). The proposed explicit bottle-count strip improves fulfilment clarity rather than copying the page's appearance.

**Illustration for team discussion only:** assumes 60 capsules per bottle and a ₹899 single-bottle price. The current site's 60-capsule pack entry is a demo, not approval of this pack size. The proposed bundle prices below are not live prices or approved discounts.

| Offer | What arrives | Total | Saving vs separate singles | Cost/capsule |
|---|---|---:|---:|---:|
| 1 bottle | 60 capsules | ₹899 | — | ₹14.98 |
| 2 bottles | 120 capsules | ₹1,599 | ₹199 | ₹13.33 |
| 3 bottles | 180 capsules | ₹2,199 | ₹498 | ₹12.22 |

For this hypothetical pack, if the approved serving were two capsules, the cards could additionally show 30/60/90 servings. If it were one capsule, they would show 60/120/180 servings. Days of supply require approved use frequency too. These are arithmetic examples, not proposed directions or a treatment course.

**Needs:** final unit count/serving facts; approved pack prices; margin/shipping/expiry review; admin offer records; server-side pricing and bottle-quantity allocation. Do not implement discounts only in the browser. Three bottles must consume three bottle units of stock, and price/discount snapshots must remain correct in orders/refunds.

## 2. L-Theanine — see the product before you buy

**Buying question:** “What is the capsule actually like, and what is inside it?”

- A concise “Meet your capsule” card beside purchase: measured length/width, close-up photograph, capsule material and full ingredient list.
- Tap **Size / Inside / Label** to change a secondary detail panel. Always show measurements; a screen illustration cannot promise physical life size across devices.
- Put the three most useful approved product-specific answers near purchase rather than making shoppers search a long FAQ.
- Visually express this with sage backgrounds, large capsule photography and small ingredient annotations.

Reference: [Ritual](https://ritual.com/products/essential-for-women-multivitamin) combines capsule-design explanations with ingredient information; [Momentous L-Theanine](https://www.livemomentous.com/products/l-theanine) pairs capsule imagery, label information and practical FAQs. The proposed tabbed module is our adaptation, not a claim that either site uses these exact tabs.

**Needs:** measured real capsule imagery and approved shell/formulation facts. Do not assume tea extraction, caffeine-free status, delayed release, sedation effects or a specific daily amount.

## 3. Vitamin D3 + K2 — make the supply tangible

**Buying question:** “What is in the box, how much supply is that, and when would I need another?”

- A **Your bottle, explained** card: one standard bottle → total softgels → approved servings → supply duration only where directions allow a valid calculation.
- A compact calendar visualises the approved supply, with the calculation visible underneath.
- Offer an optional local calendar download for reordering. Later, an explicit opt-in reminder can be connected to a provider; no automatic subscription or automatic charge.
- A separate three-part label strip identifies D3, K2 and the omega-3 component actually named in BCC's catalogue, with approved amounts when supplied.

Reference: [Seed DS-01](https://seed.com/daily-synbiotic) explicitly connects capsule counts to supply duration and delivery intervals. Our proposal starts with a one-time bottle and transparent arithmetic, not its subscription model.

**Needs:** verified softgel count, units per serving and approved frequency. Without those, show units/servings without predicting days or a reorder date.

## 4. Omega-3 Fish Oil — inspect the proof

**Buying question:** “What omega-3 content am I buying, and can I inspect the evidence?”

- A **Read the oil** composition card separates total fish oil, total omega-3, EPA and DHA on the same serving basis.
- A **View published lot reports** button sits near the purchase panel. Shoppers can browse real released records without already owning a bottle; existing customers can look up their exact lot.
- Display the test scope, date and document link as a small receipt-like panel; explain the sample/lot limitation.
- Optionally show capsule dimensions and source/allergen facts to answer purchase objections.

Reference: [Puori O3](https://puori.com/products/o3-ultra-pure-fish-oil-capsules) displays constituent amounts and links directly to batch results. Its certification and quality claims belong to Puori and are not claims about BCC.

**Needs:** approved EPA/DHA quantities and real public documents. Never select an arbitrary report and imply it is the customer's future batch; multiple lots may fulfil an order. If none are public, display an honest unavailable state.

## 5. Myo & D-Chiro Inositol — understand the blend

**Buying question:** “What are the two ingredients, and how much of each is present?”

- A **Two ingredients. One clear formula.** interactive composition panel: click Myo or D-Chiro to highlight its name, approved amount and role in the ingredient explanation.
- Keep the full declared serving visible as the common denominator.
- Show a labelled proportional graphic only after the actual amounts are supplied; calculate the actual ratio. Use a separate label image and readable table as the source of truth.
- A comparison checklist explains what to check across labels: both amounts, common serving basis, extra ingredients and verified records. Avoid unsupported “ours is better” rankings.

Reference: [Theralogix Ovasitol](https://theralogix.com/products/ovasitol-inositol-powder) makes both component quantities and its own ratio prominent. Do not copy its 40:1 ratio, serving amounts or clinical claims into BCC.

**Needs:** BCC's approved formulation and explanatory copy. Hide the ratio graphic until actual values exist; do not use an editable ratio or dose slider that suggests changing intake.

## 6. Creatine Chews — demonstrate the format

**Buying question:** “Why choose a chew, and how many chews make the declared serving?”

- A **Meet the chew** visual sequence: one chew → amount in one chew → approved number per serving → total servings per bottle.
- Show real chew texture, dimensions and confirmed flavour/sweetener details. Include a short product demonstration in a secondary gallery position, with user-controlled playback.
- A concise **Chews / Powder** comparison discusses preparation and carrying convenience. Compare price or active content only against an identified, verified product on a matched basis.
- Show cost per approved serving next to price, rather than a cheap-looking per-chew cost that obscures multiple chews per serving.

Reference: [Momentous Creatine Chews](https://www.livemomentous.com/products/creatine-monohydrate-chews) explicitly explains pressed-tablet texture, per-chew quantity and how the format is used. Our chew facts must come from our label and physical product.

**Needs:** confirmed formulation, per-chew quantity, serving, flavour and photography. Do not copy competitor amounts or make superior absorption/stability claims without evidence.

## 7. Psyllium Husk — first-order confidence, easy repeat ordering

**Buying question:** “What should I know before my first order, and can I reorder quickly later?”

- A small **First time / Buying again** presentation toggle on the same SKU and same price.
- First-time mode reveals **What arrives / Read before use / Questions answered**, with an optional downloadable product-information card drawn from the approved label. A visual water/handling step can be included once its instructions are confirmed.
- Repeat mode condenses the explanation and keeps product, pack facts, price and bag action prominent. Prior-order quantity may be offered only when it really exists and stock is rechecked.
- Both modes keep warnings, allergens and the complete label accessible. Do not turn this into a symptom-based suitability quiz.

Reference: [Seed](https://seed.com/daily-synbiotic) distinguishes first-order contents from later replenishment. This proposal borrows the distinction but does not require its welcome-kit gifts, refill packaging or subscription. [Metamucil](https://www.metamucil.com/en-us/products/fiber-capsules) separately organises capsule products by format; its instructions and health claims are not BCC facts.

**Needs:** approved first-use information and later account/reorder integration. Start with a digital guide; do not promise a free shaker, trial pack or printed insert unless the business will supply it.

## Shared product-page ideas worth carrying into every finalist

1. Show the whole payable product amount prominently; keep per-unit/serving economics as supporting information.
2. A selected-offer summary and mobile purchase bar should retain pack choice and show the correct total.
3. Use the existing static first image unchanged; place new explanatory artwork, quantity strips and video outside that slot.
4. Show serving arithmetic transparently; do not assume one unit equals one serving or one day.
5. Put approved label facts, useful Q&A and real evidence near the purchase decision.
6. Keep delivery, returns and one-time/subscription terms clear and backed by real capabilities.
7. If using savings, disclose the comparison basis and whether a coupon is needed. Avoid stacked discounts that silently change the advertised cost.
8. Use real review context when available. Do not fabricate popularity, scarcity, countdowns or outcome testimonials.
9. Make selectors keyboard/touch accessible, maintain predictable mobile layout and respect reduced motion.

## Admin and backend ownership

Existing product facts, later gallery images, FAQs and evidence records stay in their current admin workflows. Existing static first-image assets remain fixed.

New structured offer data for the Iron prototype should include bottle quantity, final pack price, comparison basis and offer availability. Label-derived unit/serving counts need validated numeric fields rather than extracting numbers from arbitrary marketing text. Compute unit cost and savings from the selected offer. Authoritative discount, stock and bag/order totals must come from the backend.

Reminder messaging, subscriptions, new physical gifts and trial-pack SKUs are separate operational features. They should not be presented as working because a mockup shows them. The initial team review can use clearly identified sample values without enabling live orders.

## How to review with the team

Build the seven B-only concepts after selection, with one distinct highlighted module on each page. Label the concept in internal review tooling, not as customer-facing development jargon.

Ask reviewers to score each concept 1–5 for:

- “I understand exactly what I receive.”
- “I can understand the price and any saving.”
- “This answers an important buying question.”
- “I can find the facts I need to trust the offer.”
- “The interaction is clear on my phone.”

Also ask what confused them and which module they would reuse across all products. Do not treat a preference vote as a measured increase in sales. Later, compare the same product/page with and without the chosen module, keeping price and traffic comparable.

Recommended first prototypes: Iron pack-value selector, Creatine format demonstration, Omega-3 evidence panel. They explore three distinct purchase motivations: value, convenience and confidence.
