# The Super Sevens: creative concept for Variant E

1 November 2026 · Direction proposal (ideas only; no code changed)

## Why E feels generic today

E's colours, type and bottles are all strong. What's generic is how they're arranged. Hero copy sits on the left with a product row on the right. Then come a row of circles, a card grid, accordions and a footer. Every DTC template uses that grammar. Nothing on the page could only belong to Body Café Co. The bottles are photographed as if they were stock items. They don't behave like characters, and the number seven never turns into a device.

**The fix is to give the brand one idea that only it could own, and then let every page play with that idea.**

The theme stays exactly as it is: white/cream surfaces, ink text, Aileron + Lemon Milk, the seven cap colours as product identity, and the bottle as the unit (cap band over cream body).

---

## The big idea: the Seven-Segment Seven

A digital "7" is drawn with exactly **seven segments**, the same number as the range. So each product owns one segment:

```
     ━━━ a ━━━          a  01 Iron Bisglycinate     (rust)
    ┃         ┃         b  02 L-Theanine            (moss)
    f         b         c  03 Vitamin D3 + K2       (indigo)
    ┃         ┃         d  04 Omega-3 Fish Oil      (slate)
     ━━━ g ━━━          e  05 Myo & D-Chiro Inositol(lilac)
    ┃         ┃         f  06 Creatine Chews        (teal)
    e         c         g  07 Psyllium Husk         (olive)
    ┃         ┃
     ━━━ d ━━━
```

(Each segment-to-product assignment is a design choice; tune it so that the segments forming the digit "7" (a, b, c) are three visually striking caps.)

Why it works:

- **It's a true fact, not a claim.** There are seven products and a digit has seven segments. Nothing promises an outcome.
- **It's a whole typeface.** Seven segments can draw every digit 0–9. Prices, pack counts, serving counts, lot numbers, page numbers, the bag count, the 404 and the countdown to launch can all be "written" in the brand's own colours. No other supplement brand has a numeral system made from its own products.
- **It works at every size.** It can be a 900px hero sculpture, a 16px favicon, a loading spinner or a sticker on the shipping box.
- **It turns the range into a cast.** "The Super Sevens" become a line-up of seven members, each with a colour, a number, a segment and a format. That gives you a band, not a catalogue.

Logo lock-up: the Body Café Co. wordmark plus a small segmented 7 in cap colours, with **THE SUPER SEVENS** set in Lemon Milk underneath. Use it as a campaign mark, not as a replacement for the wordmark.

---

## Signature systems (shared across every page)

| System | What it does | Why it's memorable |
|---|---|---|
| **Segment numerals** | Every number on the site renders in segment glyphs. Each segment takes the colour of its product, or of the product currently in focus. | Prices and lot codes become brand moments. |
| **The cap cursor** | On desktop the cursor is a small cap ring in the colour of the current product. Over a bottle it "unscrews" (rotates 90°). | Tactile and ownable; costs almost nothing. |
| **Cap-flood transitions** | Clicking any product scales its cap circle up to fill the screen. The flood settles into the PDP's cap band. Going back, the colour drains into the cap. | Page changes feel like opening a bottle. |
| **The seven-stripe** | The existing header rule becomes a live progress bar. As you scroll a page, segments light up 01→07. | It's already there, so this upgrade is small. |
| **Twist to open** | Drag horizontally on any cap to unscrew it. A "click" (haptic on phones that support it) opens the product. | The one interaction people will show their friends. |
| **Optional sound** | Off by default, with one toggle: a soft cap click, a capsule rattle, a pop. | Recorded from the real bottles. |

---

## Page by page

### 1. Home: "Roll call" (scroll-driven, about 7 acts)

1. **The light-up.** A white screen with one blinking segment. The other six light in sequence, each with a cap click, and form a huge **7**. Headline: *Seven supplements. One colour each.* (keep it). Under it, in Lemon Milk: THE SUPER SEVENS.
2. **The segments become bottles.** On scroll, each segment rotates and extrudes into its 3D bottle (Blender-rendered image sequence). The 7 dissolves into a line-up on a shelf.
3. **Roll call.** One "member" per scroll stop. A giant segment numeral 01…07 sits beside the bottle, which turns 3D. Facts come only from the label: format, pack count, serving basis, the key amount. Each member gets a one-line "role" written from fact, never from benefit. For example: *"04 · The softgel. 60 per pack, one at a time."* The background stays cream; only the cap colour moves.
4. **"Pour one serving."** Tap a bottle and exactly one serving falls out with real physics. Psyllium drops 5 capsules, Inositol 3, Creatine 2 chews, the rest 1. Most people never learn this from a label, and here it's a toy.
5. **Count the pack.** A slider pours the whole pack into a grid: 150 capsules versus 30. It's honest data visualisation made playful.
6. **Turn it over.** The bottle flips to its base and shows the lot code in segment numerals. A link points to the lot report. This is the trust story told visually.
7. **Line-up shelf.** The shop-ready shelf, with a bag tray at the end.

### 2. Shop: "The line-up"
- **Four lenses on one shelf:** *Line-up* (bottles), *Cards* (trading cards, below), *Spectrum* (cap colours as a fan deck you riffle), *Compare* (a table with segment numerals).
- Drag a bottle onto the bag tray, or tap "Add".
- Filters use plain facts only: format (softgel / capsule / chew), serving size, pack size.

### 3. The Super Sevens cards (signature collectible)
- Each product gets a **trading-card spec card**. The front shows the cap colour, a big numeral, the bottle and the name. The back is the real label facts in a beautiful layout: pack, serving, amounts, directions, cautions.
- The card flips on hover or tap and tilts with a light sheen (gyroscope on mobile).
- **Downloadable and shareable** as a phone-wallpaper PNG, and printed as a physical card in every shipped box. The website and the unboxing then share one object.
- No stats such as "Energy 87/100". That would be an implied health claim. The card shows only facts.

### 4. Product page: "The bottle is the page"
- The page is built as the bottle's anatomy. The **cap** (cap band) is the hero, the **label** is the reading section and the **base** is the lot/report footer.
- **Read the real label:** scrolling rotates a 3D bottle through 360°, and a magnifier lens follows the cursor over the actual label artwork. Text alternatives come from `label-records.json`.
- **Serving pour** (from Home), sized to this product.
- **Segment price** with the cap colour lighting the right segment.
- **Sibling strip** of the other six caps, each linked with a cap-flood transition.
- Each product gets **its own small personality motion**, true to its format. The softgel wobbles like a gel, the chews bounce, psyllium pours like grain and the D3+K2 softgel catches light.

### 5. Bag & checkout: "The tray"
- The bag is a 7-slot tray. Chosen products sit in their slots, and empty slots are faint outlines.
- The bag icon shows a mini segment-7. A segment lights for each product in the bag.
- **Guardrail:** never say "complete your set" or show a "7/7" reward. That would encourage buying everything, which a supplement brand should not push. The tray reports what you chose and stops there.

### 6. Learn: "Field guides"
- Each guide is an **index card in its cap colour**, filed in a card drawer. Opening one pulls the card out.
- Ingredient explainers use simple line diagrams, with a "label → plain words" annotation layer: hover a label line and get its plain-English meaning.
- A glossary written in segment numerals and cap tags.

### 7. Standards: "The inspection bench"
- A lot's journey is a horizontal conveyor: a bottle travels past stations (label record → batch → report). Each station shows only what is actually documented, and planned items are clearly marked as planned.
- The existing three columns ("Published now / Planned / What we won't do") become three bench drawers.

### 8. Lot reports: "Turn the bottle over"
- Pick a cap, and the bottle flips to its base. Type the lot number and it renders in segment glyphs as you type. On submit the report unfolds like a receipt.

### 9. Story / About: "Why seven, why colour"
- A **chip-book riffle**: the seven colours as paint chips with given names and hex/RGB values, plus the story of choosing each one.
- A "making of" timeline: label drafts, cap colour tests, bottle renders. These are honest behind-the-scenes images, which buyers trust more than polish.

### 10. Small moments that make people screenshot
- **404:** "One of the seven rolled away." Six bottles stand on a shelf, and the missing one hides on the page for you to find.
- **Loader:** segments light in sequence.
- **Footer:** seven caps you can flick and stack with physics.
- **Keyboard:** keys 1–7 jump to each member, and pressing `7` replays the light-up.
- **Empty bag:** an empty tray with a cap-rattle sound (if sound is on).
- **Favicon:** a tiny segment 7 that changes colour per product page.

---

## How we build it (quality *and* speed in India)

- **Blender (MCP)** pre-renders the heavy hero moments: segment→bottle morph, turntables and serving pours. Export them as WebP/AVIF image sequences or short muted MP4s, scrubbed by scroll. That looks cinematic on any phone with no WebGL risk.
- **Real-time 3D** (Three.js + the existing `web/models/*.glb`) appears only on the PDP label-reader and the cards. Compress with Draco/Meshopt; iron and theanine are about 2 MB today and should come down to under 400 KB each.
- **Physics** (pours, footer caps): a small 2D engine (matter.js), loaded only when the user interacts.
- **Codex** can build these systems in parallel because each one is self-contained: segment-numeral component, transitions, cards, PDP label reader.
- **Fallbacks:** `prefers-reduced-motion` gets static, well-composed versions of every scene. All facts stay as real HTML text for SEO and accessibility. Everything stays scoped to `.eh-e`.
- **Performance budget:** home LCP under 2.5 s on a mid-range Android over 4G, with first meaningful content before any 3D loads.

## Compliance guardrails (FSSAI / ASCI)

The concept is creative in *form*, never in *claims*:
- No benefit, disease or "super" performance language. "Super Sevens" names the set; it never says the products are superior.
- No "take all seven", no seven-day regimen, no "complete the set" incentives.
- Every number shown (servings, counts, amounts) comes from the label record. Planned testing is never shown as done.
- Personality comes from **format and colour**, never from implied effects.
- Have the "Super Sevens" mark and card copy reviewed before launch.

## Suggested build order
1. **Signature kit:** segment numerals, cap cursor, cap-flood transitions, live seven-stripe.
2. **Home roll call** with Blender sequences + serving pour.
3. **PDP** (bottle anatomy + label reader) and the **Super Sevens cards**.
4. **Shop lenses + bag tray**.
5. **Learn, Standards, Reports, Story** treatments.
6. **Easter eggs and sound.**

## Decisions needed from you
1. Approve **"The Super Sevens"** as the campaign name, and the **segment-7** as the core device.
2. Product → segment order (which three caps form the digit 7).
3. Sound: include it (off by default) or skip it.
4. Physical cards in the box: yes or no. This affects card design dimensions.
5. Who reviews claims/copy before publication.
