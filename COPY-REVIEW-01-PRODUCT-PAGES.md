# Copy review 01 · The seven product pages

**Status:** approved in full by the owner and applied to Content Focus, 17 Nov 2026. The Psyllium headline keeps its current line. Not yet committed or deployed.
**Design:** Content Focus (`?design=e&part=5`). Part 2 keeps its own copy.
**Written against:** `SUPER-SEVENS-COPY-GUIDE.md`. Facts are from `web/label-records.json` and the approved copy of 16 Nov 2026.

**How to mark it up:** next to each proposed line, write ✓ (approve), ✗ (keep the current line) or your own wording.

## What changes, in short
1. **No more saying the same thing twice.** Today the "What it's for" facts line and the support line under the headline both repeat the amount and form. The support line now says *how the product fits your day* (when, with what), so each line has its own job.
2. **The fourth question becomes specific.** "The decision" becomes **"Why on its own?"** on the five single-ingredient products and **"Why together?"** on the two pairs. This makes the Super Sevens structure (five alone, two pairs) visible on every page.
3. **"At a glance" always has four lines:** the signature number, the form, how to take it, and veg / non-veg. (The fifth line, "One bottle lasts … days", is still worked out automatically.)
4. **Google listings get their own words:** a page title with the signature number, and a description that reads like an invitation, not a stock list.
5. **Three lines that hinted at taking more than one** ("Build your routine", "The rest of the seven", "Best value") get neutral wording.

## Where each line is changed
| Text | Changed in |
|---|---|
| What it's for · facts line · headline · support · the four "Why" answers · At a glance | Admin portal → product → **Content Focus copy** (`cf_facts`, `cf_headline`, `cf_support`, `cf_ingredient`, `cf_form`, `cf_amount`, `cf_decision`, `cf_points`), and the defaults in `web/content-focus-e.js` |
| Page title · Google description | Admin portal → product → **SEO title / SEO description** |
| Shared page wording (section names, pack picker, batch block…) | `web/content-focus-e.js`, Content Focus only |
| "What it's for" claim | **Not changed.** It is the front-label Key Benefit, word for word. |
| Gallery image alt text | **Not changed here.** Each alt text repeats the words printed in that image; it changes only if the images change. |

---

## A. Words shared by all seven pages

| # | Where | Now | Proposed | Why |
|---|---|---|---|---|
| A1 | Accordion title | Description | **Why it's made this way** | Says what's inside: the four decisions. "Description" is a generic label. |
| A2 | Question 1 | Why this ingredient? | *Keep* | Clear. |
| A3 | Question 2 | Why this form? | *Keep* | Clear. |
| A4 | Question 3 | Why this amount? | *Keep* | Clear. |
| A5 | Question 4 | The decision | **Why on its own?** (Iron, L-Theanine, Omega-3, Creatine, Psyllium) · **Why together?** (D3 + K2, Inositol) | Asks the fourth of the four decisions plainly, and shows which products are pairs. |
| A6 | Accordion title | Directions for use | **How to take it** | Everyday words. The label's own sentence still follows, word for word. |
| A7 | Timing chips | Morning · Best / Noon · Also fine / Night · Also fine | *Keep* | Label wording. |
| A8 | Pack picker badge | BEST VALUE | **Lowest price a day** | A fact the picker already shows (₹ a day), without "best". |
| A9 | Pack picker note | 2 bottles save 5%, 3 save 10%. The saving is applied in your bag. | **Two bottles save 5%. Three save 10%. You'll see the saving in your bag.** | Two short sentences; numbers spelled the way people say them. |
| A10 | Delivery note | We deliver across India. If we can't reach your pincode, we tell you before you pay. Delivery dates are estimates. | *Keep* | Already clear and reassuring. |
| A11 | Batch block heading | Check the batch printed on your pack. | **Look up the batch in your hand.** | More personal: it's *your* bottle. |
| A12 | Batch block text | A batch report describes the sample tested from one production batch. Records appear as reports are published. | **Type the Batch No. from your pack to see that batch's record. Reports are published batch by batch, from our first production batch.** | Starts with what to do, then the honest status, in the approved testing wording. |
| A13 | Cross-sell heading | Build your routine | **Anything else you came for?** | "Build your routine" suggests stacking products. The new line leaves the choice with the customer. |
| A14 | Cross-sell text | Add one only if you need it. Each has its own timing, so follow every label. | *Keep* | Already right. |
| A15 | Range heading | The rest of the seven. | **Each one, for its own reason.** | "The rest of the seven" reads like a set to complete (house rule 2). |
| A16 | Range eyebrow | Also in the range | *Keep* | Neutral. |
| A17 | Reviews heading | What people say. | *Keep* | Plain. |

---

## B. Product by product

Each product has the same rows. **Bold** = proposed. *Keep* = the current line stays.

### 01 · Iron Bisglycinate · Why on its own?

| Field | Now | Proposed | Why |
|---|---|---|---|
| What it's for | Supports hemoglobin formation and energy metabolism. | *Keep* (front label) | Fixed by the label. |
| Facts line | Each capsule gives 29 mg iron as Ferrochel® ferrous bisglycinate chelate. | *Keep* | The one place the full form and amount sit together. |
| Headline | Iron first. Chai later. | *Keep* | The model line for the whole site. |
| Support | 29 mg of elemental iron per capsule, as Ferrochel® ferrous bisglycinate chelate. Taken alone, on an empty stomach, away from milk. | **One capsule in the morning, on an empty stomach. Milk and chai wait two hours, before and after.** | Stops repeating the facts line; explains the headline straight away. |
| Why this ingredient? | Iron is an essential mineral. The ICMR daily requirement for adult women is 29 mg, the amount in one capsule. | **Iron is an essential mineral. The body can't make it, so it has to come from your diet. That's why the amount is the first number we print.** | Gives the reason, and leaves the RDA to the amount answer (it was said twice). |
| Why this form? | Ferrous bisglycinate chelate is iron bound to glycine, an amino acid. We use Ferrochel®, a named branded source of this form, and print the brand name on the front so you know exactly which form is inside. | **Iron bound to glycine, an amino acid: ferrous bisglycinate chelate. We use Ferrochel®, a named source of this form, and print its name on the front, so you never have to guess.** | Plain meaning first, then the name. Shorter. |
| Why this amount? | 29 mg of elemental iron: 100% of the ICMR RDA for adult women. We print the iron you actually get, not the weight of the compound it comes in. | **29 mg of elemental iron: 100% of the ICMR RDA for adult women. "Elemental" means the iron itself, not the weight of the compound around it, and that's the number we print.** | Explains the one word people don't know. |
| Why on its own? | Iron stands alone. Calcium in the same meal can reduce how much iron is absorbed, so the directions keep milk and chai two hours away. | *Keep* | Already exact and readable. |
| At a glance | 29 mg elemental iron per capsule · Ferrochel® chelate, neutrally charged · Vegetarian capsule | **29 mg elemental iron per capsule · Ferrochel® bisglycinate, named on the front · One capsule, morning, empty stomach · Vegetarian capsule** | "Neutrally charged" means little to shoppers; how to take it is what people check. |
| SEO title | Iron Bisglycinate | **Iron Bisglycinate · 29 mg per capsule** | Shows the signature number in Google and browser tabs. |
| SEO description | Iron as Ferrochel® ferrous bisglycinate chelate. Each capsule provides 29 mg iron; each bottle contains 60 capsules. | **29 mg elemental iron per capsule, as Ferrochel® ferrous bisglycinate chelate. One capsule each morning on an empty stomach. 60 capsules a bottle.** | Reads like the page, ends with the pack. |

### 02 · L-Theanine · Why on its own?

| Field | Now | Proposed | Why |
|---|---|---|---|
| What it's for | Supports a calm mind and clear focus. | *Keep* (front label) | Fixed by the label. |
| Facts line | Each capsule gives 200 mg L-Theanine, the amino acid naturally found in green tea. | *Keep* | Clear. |
| Headline | One amino acid. 200 mg. Nothing else active. | **The green-tea amino acid. 200 mg, on its own.** | Easier to picture (green tea), still exact. "Nothing else active" sounds technical. |
| Support | 200 mg of L-theanine, the amino acid naturally found in green tea, in one vegetarian capsule. | **One capsule in the morning, with or without food. One active ingredient, with its amount printed.** | Stops repeating the facts line; adds how it fits the day. |
| Why this ingredient? | L-theanine is the amino acid that tea is known for. It is a simple, well-characterised single ingredient. | **L-theanine is an amino acid found naturally in green tea. It's a simple, well-characterised ingredient that makes sense on its own.** | Leads into "why on its own". |
| Why this form? | Free-form L-theanine, on its own, so the amount you take is the amount on the label. | **Free-form L-theanine, on its own rather than in a blend, so the 200 mg on the label is 200 mg of L-theanine.** | Puts the number in. |
| Why this amount? | 200 mg, an amount used in published studies. | **200 mg per capsule, an amount used in published studies. One capsule is one serving, so there's nothing to divide.** | Adds the practical point. |
| Why on its own? | One ingredient, one number, one capsule. No blend to divide the dose. | **One ingredient, one number, one capsule. No blend sharing the dose.** | Small rhythm fix. |
| At a glance | 200 mg L-Theanine per capsule · Vegetarian capsule | **200 mg L-Theanine per capsule · Naturally found in green tea · One capsule, morning, with or without food · Vegetarian capsule** | Four lines like the others; the front-label descriptor is included. |
| SEO title | L-Theanine | **L-Theanine · 200 mg per capsule** | Signature number. |
| SEO description | L-Theanine in a capsule format. Each capsule provides 200 mg L-Theanine; each bottle contains 30 capsules. | **200 mg L-Theanine per capsule, the amino acid naturally found in green tea. One capsule each morning, with or without food. 30 capsules a bottle.** | Same pattern as Iron. |

### 03 · Vitamin D3 + K2 · Why together?

| Field | Now | Proposed | Why |
|---|---|---|---|
| What it's for | Supports bone, muscle and heart health. | *Keep* (front label) | Fixed by the label. |
| Facts line | One softgel gives 600 IU vitamin D3, 55 mcg vitamin K2 as MK-7 and 200 mg omega-3. | *Keep* | Clear. |
| Headline | Two fat-soluble vitamins. One oil. On purpose. | *Keep* | Strong; explains the pair in six words. |
| Support | 600 IU vitamin D3 and 55 mcg vitamin K2 as MK-7, dissolved in anchovy fish oil in one softgel. | **Both vitamins dissolve in fat, so they're carried in anchovy fish oil, which adds 200 mg of omega-3. One softgel in the morning, with food.** | Explains "one oil" in the headline and adds when to take it. |
| Why this ingredient? | Vitamin D helps the body absorb calcium, and vitamin K is needed for proteins involved in bone. They are paired because both have roles in bone health. | **Vitamin D helps the body absorb calcium. Vitamin K is needed for proteins involved in bone. Both have roles in bone health, which is why they're paired.** | Same facts, shorter sentences. |
| Why this form? | D3 as cholecalciferol and K2 as MK-7, both fat-soluble, so they are carried in oil rather than pressed into a dry tablet. The oil also adds 200 mg of omega-3. | **D3 as cholecalciferol, the form the body makes in sunlight. K2 as MK-7, named on the front. Both sit in oil, not in a dry tablet, because both dissolve in fat.** | Gives D3 a picture people know (sunlight); the omega-3 moved to the support line. |
| Why this amount? | 600 IU of D3 and 55 mcg of K2, each 100% of the ICMR RDA: a daily amount at the reference level, not a megadose. | *Keep* | Already exact. |
| Why together? | A deliberate combination. Both vitamins dissolve in fat, so one softgel of oil carries both. Take it with a meal. | **One of our two deliberate pairs. D3 and K2 have related roles and the same need for fat, so one softgel carries both, taken with a meal.** | Names it as one of the two pairs (Super Sevens structure). |
| At a glance | 600 IU vitamin D3 · 55 mcg vitamin K2 as MK-7 · 200 mg omega-3: 100 mg EPA and 75 mg DHA | **600 IU vitamin D3 and 55 mcg K2 as MK-7 · 200 mg omega-3 (100 mg EPA, 75 mg DHA) · One softgel, morning, with food · Non-vegetarian: fish oil and gelatin** | Four lines; the veg / non-veg line people look for. |
| SEO title | Vitamin D3 + K2 | **Vitamin D3 + K2 · 600 IU + 55 mcg** | Signature numbers. |
| SEO description | Vitamin D3, Vitamin K2 as MK-7 and Omega-3 as triglycerides, in one softgel. Bottle of 60 softgels. | **600 IU vitamin D3 and 55 mcg K2 as MK-7 in anchovy fish oil, with 200 mg omega-3. One softgel each morning with food. 60 softgels a bottle.** | Same pattern. |

### 04 · Omega-3 Fish Oil · Why on its own?

| Field | Now | Proposed | Why |
|---|---|---|---|
| What it's for | Supports heart, brain and joint health. | *Keep* (front label) | Fixed by the label. |
| Facts line | Each softgel gives 800 mg omega-3 as triglycerides: 400 mg EPA and 300 mg DHA. | *Keep* | Clear. |
| Headline | Count the omega-3, not the oil. | *Keep* | Strong. |
| Support | 1,000 mg of anchovy fish oil concentrate per softgel, carrying 800 mg of omega-3: 400 mg EPA and 300 mg DHA. | **Every softgel holds 1,000 mg of anchovy oil. 800 mg of it is omega-3, and that's the number on the front.** | Proves the headline in two sentences without repeating EPA / DHA. |
| Why this ingredient? | EPA and DHA are the omega-3 fatty acids people look for in fish oil. The body makes very little of them, so they come mainly from fish. | *Keep* | Already clear. |
| Why this form? | Concentrated anchovy oil, with the omega-3 kept in triglyceride form, the form found in fish. | **Concentrated anchovy oil, with the omega-3 kept as triglycerides, the form it takes in the fish itself.** | Slightly warmer, same fact. |
| Why this amount? | 800 mg of omega-3 per softgel. A typical 1,000 mg fish oil contains about 300 mg of EPA and DHA, so the number that matters is the omega-3, and we print it. | *Keep* | The comparison is the proof. |
| Why on its own? | One softgel, two numbers on the label: the oil and the omega-3 inside it, with EPA and DHA shown separately. | **Fish oil needs no partner. It needs clear numbers: the oil, the omega-3 inside it, and EPA and DHA, each shown separately.** | Answers the new question directly. |
| At a glance | 800 mg omega-3 per softgel · 400 mg EPA and 300 mg DHA · Triglyceride form, from anchovy | **800 mg omega-3 per softgel · 400 mg EPA and 300 mg DHA · Triglyceride form, from anchovy · Non-vegetarian: fish oil and gelatin** | Four lines; the veg / non-veg line. |
| SEO title | Omega-3 Fish Oil | **Omega-3 Fish Oil · 800 mg omega-3** | Signature number. |
| SEO description | Fish oil concentrate with Omega-3 in triglyceride form. Each softgel provides 800 mg total Omega-3, including 400 mg EPA and 300 mg DHA. | **800 mg omega-3 per softgel as triglycerides, with 400 mg EPA and 300 mg DHA, from 1,000 mg anchovy oil. One softgel each morning with food.** | Same pattern. |

### 05 · Myo & D-Chiro Inositol · Why together?

| Field | Now | Proposed | Why |
|---|---|---|---|
| What it's for | Supports hormonal and metabolic balance. | *Keep* (front label) | Fixed by the label. |
| Facts line | Three capsules give 2,000 mg Myo-Inositol and 50 mg D-Chiro Inositol, a 40:1 ratio. | *Keep* | Clear. |
| Headline | Two inositols. One ratio. 40:1, on the front. | **The ratio is the formula. 40:1.** | Shorter and bolder; the ratio is what makes this product. |
| Support | 2,000 mg myo-inositol and 50 mg D-chiro-inositol per serving: a 40:1 ratio, printed on the front. | **40 parts myo-inositol to 1 part D-chiro-inositol, printed on the front and checked in every batch. Three capsules in the morning, with food.** | Explains the ratio in words anyone can follow; adds how to take it. |
| Why this ingredient? | Myo-inositol and D-chiro-inositol are two forms of inositol that the body uses side by side. | *Keep* | Clear. |
| Why this form? | Both forms are included because research has looked at them together, in a defined ratio, rather than either alone. | **Both forms are included because research has looked at them together, in a set ratio, rather than either one alone.** | "Set" is plainer than "defined". |
| Why this amount? | 2,000 mg + 50 mg per three capsules: 40:1, a ratio used in published research. Our specification checks that each batch stays between 36:1 and 44:1. | *Keep* | Exact. |
| Why together? | A deliberate combination where the ratio is the formula, so the ratio goes on the front. | **One of our two deliberate pairs. Either inositol alone would be a different product; the 40:1 balance between them is the point.** | The headline now carries "the ratio is the formula", so this explains *why* it's a pair. |
| At a glance | 2,000 mg Myo-Inositol per serving · 50 mg D-Chiro Inositol per serving · 40:1 Myo-to-D-Chiro ratio | **2,000 mg Myo-Inositol and 50 mg D-Chiro Inositol · 40:1 ratio, checked batch by batch · Three capsules, morning, with food · Vegetarian capsules** | Four lines like the others. |
| SEO title | Myo & D-Chiro Inositol | **Myo & D-Chiro Inositol · 40:1 ratio** | Signature number. |
| SEO description | Myo-Inositol and D-Chiro Inositol in a 40:1 ratio. Each 3-capsule serving provides 2,000 mg Myo-Inositol and 50 mg D-Chiro Inositol. 30 servings per bottle. | **2,000 mg Myo-Inositol and 50 mg D-Chiro Inositol per serving: a 40:1 ratio, printed on the front. Three capsules each morning with food. 30 servings.** | Same pattern. |

### 06 · Creatine Chews · Why on its own?

| Field | Now | Proposed | Why |
|---|---|---|---|
| What it's for | Supports strength and performance. | *Keep* (front label) | Fixed by the label. |
| Facts line | Two orange chewable tablets give 3,000 mg creatine monohydrate, with no powder to mix. | *Keep* | Clear. |
| Headline | 3 grams of creatine. Two chews. Your time. | *Keep* | Strong, and "Your time" matches the label's directions. |
| Support | 3,000 mg of creatine monohydrate in two orange chewable tablets. No powder, no shaker. | **Pick one time of day, morning, noon or night, and keep to it. Chew both tablets; don't swallow them whole.** | Explains "Your time" from the label; stops repeating the facts line. |
| Why this ingredient? | Creatine is one of the most researched sports-nutrition ingredients, and it is meant to be taken every day. | **Creatine is one of the most studied ingredients in sports nutrition, and it's taken once a day, every day, not only on training days.** | Matches the label ("once daily") and how people actually ask about it. |
| Why this form? | Creatine monohydrate, the most studied form. It comes as a chew because a daily habit is easier when nothing needs mixing. | *Keep* | Already right. |
| Why this amount? | 3 g per serving, within the 3–5 g daily intake commonly used in research. | **3,000 mg (3 g) per serving, within the 3–5 g a day commonly used in research.** | Shows the label number next to the grams. |
| Why on its own? | We chose a chewable format for consistency, and we print the sugar it needs: 3.6 g per serving. | **Creatine needs no partner, so the chew holds creatine and what makes it a chew: orange flavour and 3.6 g of sugar per serving, which we print.** | Answers the new question and keeps the honest sugar figure. |
| At a glance | 3,000 mg creatine monohydrate per serving · Orange-flavoured chewable tablets | **3,000 mg creatine monohydrate per serving · Two orange chews, at one time you choose · Not sugar-free: 3.6 g sugar per serving · Vegetarian** | Four lines; the sugar is stated up front. |
| SEO title | Creatine Chews | **Creatine Chews · 3,000 mg per serving** | Signature number. |
| SEO description | Orange-flavoured creatine monohydrate chewable tablets. Each 2-tablet serving provides 3,000 mg creatine monohydrate. 60 tablets, 30 servings. | **3,000 mg creatine monohydrate in two orange chewable tablets, with no powder and no shaker. Once a day, at one time you choose. 30 servings.** | Same pattern. |

### 07 · Psyllium Husk · Why on its own?

| Field | Now | Proposed | Why |
|---|---|---|---|
| What it's for | Supports digestive health and regularity. | *Keep* (front label) | Fixed by the label. |
| Facts line | Five capsules give 2,000 mg psyllium husk (isabgol), with 1,578 mg dietary fibre. | *Keep* | Clear. |
| Headline | The isabgol you know, measured in capsules. | *Keep* · or option **The isabgol you know. Nothing to stir.** | The current line is good; the option is punchier. Your choice. |
| Support | 2,000 mg of psyllium husk in five capsules, giving 1,578 mg of dietary fibre, 1,362 mg of it soluble. | **Five capsules at night, with food and a full glass of water. The same isabgol, with nothing to stir.** | Stops repeating the facts line; adds the label's routine. |
| Why this ingredient? | Psyllium (isabgol) is a familiar source of soluble fibre in most Indian homes. | *Keep* | Warm and true. |
| Why this form? | Whole psyllium husk in capsules: the same ingredient, with nothing to stir. | **Whole psyllium husk, filled into vegetarian capsules: the same ingredient as the isabgol at home, in a measured amount.** | "Nothing to stir" moved to the support line. |
| Why this amount? | 2,000 mg per serving, a measured daily top-up of fibre. We print both the husk weight and the fibre it gives, because they are different numbers. | **2,000 mg of husk per serving, giving 1,578 mg of fibre, 1,362 mg of it soluble. We print both, because husk weight and fibre aren't the same number.** | Puts both numbers in, so the point is proven, not just stated. |
| Why on its own? | Isabgol, measured. Always with a full glass of water. | **Isabgol needs nothing added. What it does need is water, so every serving comes with a full glass.** | Answers the new question; keeps the water rule. |
| At a glance | 2,000 mg psyllium husk per serving · 1,578 mg dietary fibre, of which 1,362 mg soluble · Vegetarian capsules | **2,000 mg psyllium husk per serving · 1,578 mg dietary fibre, 1,362 mg soluble · Five capsules, at night, with a full glass of water · Vegetarian capsules** | Four lines; the night routine is what sets it apart. |
| SEO title | Psyllium Husk | **Psyllium Husk (Isabgol) · 2,000 mg husk** | People search "isabgol". |
| SEO description | Psyllium Husk (Isabgol) in capsules. Each 5-capsule serving provides 2,000 mg husk with 1,578 mg dietary fibre, including 1,362 mg soluble fibre. | **Isabgol in capsules: 2,000 mg psyllium husk with 1,578 mg dietary fibre per serving. Five capsules at night with a full glass of water. 30 servings.** | Same pattern. |

---

## C. Checked against the guide
- "What it's for" claims are unchanged, word for word from the front labels.
- Every number is from `label-records.json` or the approved copy: 29 mg, 100% ICMR RDA, 200 mg, 600 IU, 55 mcg, 200 / 100 / 75 mg, 1,000 / 800 / 400 / 300 mg, 2,000 + 50 mg, 36:1–44:1, 3,000 mg, 3.6 g, 2,000 / 1,578 / 1,362 mg.
- Every "how to take it" line follows the label's directions.
- No condition names, no "best", "proven" or "boost", no "manufactur…", no laboratory names, nothing that suggests taking several.
- Lengths: headlines ≤ 8 words; support lines ≤ 25; answers ≤ 35; At a glance lines ≤ 10; SEO titles ≤ 60 characters with " — Body Café Co." added; descriptions ≤ 155 characters.

## D. Questions for you
1. **A5:** are you happy for the fourth question to change from "The decision" to "Why on its own?" / "Why together?"?
2. **A13 and A15** replace two lines approved on 16 Nov ("Build your routine", "The rest of the seven"). Agree?
3. **Psyllium headline:** keep it, or take the "Nothing to stir." option?
4. **Live admin:** if anyone has edited this copy in the live admin portal since 16 Nov, those edits win over the code defaults. Please check before I publish.
