# The design house: art-direction study 01

| | |
|---|---|
| Brand | Body Café Co. |
| Variant | Variant 5 (internal E) |
| Date | 21 October 2026 |
| Status | Static visual study for client review. This is not a website: there is no commerce, no forms and no data. |
| Scope | A–D and the storefront source are untouched. Nothing was committed, pushed or deployed. |

## What is in the package

| File | What it is |
|---|---|
| `out/00-art-direction-board.png` | Board: signature campaign, material and detail, product + human, type, colour and material. 3200px wide. |
| `out/01-opening-desktop-1440.png` | Composed desktop opening, 1440 × 900 |
| `out/02-opening-phone-390.png` | Composed phone opening, 390 × 844 at 2× |
| `out/03-follow-on-moment-1440.png` | One follow-on editorial and product moment, 1440 × 900 |
| `study/study.html`, `render.py`, `make_scene.py` | The isolated files that make the study |

**How the images are labelled.** Every image carries one of these tags:

| Tag | Meaning |
|---|---|
| **S** | A supplied file: the seven fronts, the mockup photographs, the logo SVGs, Aileron. |
| **G** | A generated tone block. A flat render that only blocks out colour, light and layout for asset A1. **Not photography.** |
| **C** | A commissioned slot, drawn as a frame. The asset doesn't exist yet. |
| **R** | Reference only, not reproduced. This applies to the brand guideline's third-party photography moodboard. |

No missing image is presented as loaded.

## The idea

A design house for everyday supplements. **Each product lives in a room painted its own cap colour**, at a café counter of brushed steel and enamel, in hard, clear sun. The seven cap colours become seven rooms, released one at a time.

**Luxury comes from authorship and control:**
- one product, one colour, one material and one light per image;
- the exact pack shown at true scale;
- people who pay attention to the jar rather than perform for the camera.

**The interface itself stays black and white.** Colour appears only in photographs, plus one 12px chip beside a product name.

**Brand rules followed:**
- The logo is used only as the supplied artwork, black or white.
- On imagery it appears as the guideline's **circle container signature**, top right by default. The phone opening uses an alternative placement (bottom right) so the headline keeps its space.
- Aileron is the only typeface on screen. The display style is Aileron Bold set in short stacked lines, echoing the stacked logo. Lemon Milk appears only inside the logo.
- Product + human photography is a pillar, as in the guideline.

## What changed from the rejected Daylight

| Daylight | The design house |
|---|---|
| Beige and white restraint with no brand colour. The caps were hidden among neutrals. | The cap colours are the world: one painted room per product. The interface stays black and white. |
| A small centred logo; the guideline's devices were unused. | The guideline's circle signature on imagery; a stacked Aileron Bold display that echoes the logo. |
| Generic soft daylight, limestone and linen, and a hand with a glass. | Hard sun, brushed steel, enamel and painted plaster. A café counter, not a spa. |
| Uniform catalogue tiles carried the products. | The exact front sits in the scene at true scale; detail always appears beside the whole jar. |
| Human presence was only implied (fingertips, linen). | People reading, carrying and setting down the jar. |
| Thin, quiet headings everywhere. | Bold, few words, then lots of space. |

## Briefs for the three original assets

General rules for all three:
- No new label artwork or invented text.
- The product is either the exact supplied front composited at the end, or the real render from the Blender source.
- Adults only. No outcome props: no fitness, clinical or food-as-medicine cues.
- No real or named places, facilities or founders.
- Deliver 16-bit masters plus WebP.
- Hold **L-Theanine** until its artwork matches the supplied mockup.

### A1: Signature scene, "The counter, in its own colour" (Iron Bisglycinate first)

| | |
|---|---|
| **Purpose** | Opening image. It leaves deliberate space for the exact supplied front, composited at the end. |
| **Set** | A clean café back-counter corner. The wall is smooth painted plaster in **Pantone 7599 C**, matched with a physical paint drawdown, in an eggshell finish with no visible brush texture. The counter is **brushed stainless steel** with a slightly rounded front edge: top surface 15% of frame height, front face below. No other objects in the first version. A plain white enamel cup can be tested as an option, kept out of the product zone. |
| **Light** | Hard late-morning sun from camera right, at about 35° elevation and 45° azimuth. It casts a crisp shadow of a four-pane window (thin mullions) across the left-centre of the wall, ending at about 55% of the width. Penumbra is 1–2cm at the wall. Use a white bounce from camera left so the wall's shadow side holds colour, about 1.5 stops under the sunlit patch. Daylight-balanced at 5200K. No haze. |
| **Camera** | 50mm full-frame equivalent at f/8, level, lens height 8cm above the counter top, square to the wall, 1.4m from it. No keystone. |
| **Frames** | Desktop 2880 × 1500 (counter edge at **66%** of height). Phone 1170 × 1560 (counter edge at **70%**). Shot separately rather than cropped. |
| **Product zone** | Desktop: centred at **69% of the width**, foot on the counter top 4cm behind the front edge. Phone: centred at **25%**. The product is rendered or shot at true scale from the source, with a matching contact shadow and the sun's cast shadow falling left. |
| **Type field** | The left 45% × upper 55% of the wall stays an even, flat colour. Nothing under the headline. |
| **Signature zone** | A clear 150px circle top right (desktop) and bottom right (phone). |
| **Then** | One room per product in that product's own cap Pantone: 5763 C, 2372 C, 7543 C, 2572 C, 7708 C, 2325 C. Same camera and light, so the series reads as one. |

### A2: Product + human, "Reading the jar" (Vitamin D3 + K2)

| | |
|---|---|
| **Purpose** | A natural interaction at truthful scale: attention, not performance. |
| **Scene** | An adult seated at a white enamel café table, shot over the shoulder or three-quarter from behind. They hold the jar in two hands and turn it to read the label. The **front faces the camera at a slight angle** so the real artwork is recognisable; the label they are reading is not legible, so no text is invented. A navy element in **Pantone 2372 C** sits behind them, for example a painted wall or a tiled counter panel. Natural clothing in white, ecru or denim, with no logos. |
| **Light** | Soft directional window light from the left, plus a hard sun slice crossing the table edge. 5000K. |
| **Camera** | 50mm at f/4. Focus on the jar's front. Hands sharp; face soft or out of frame. |
| **Scale** | The jar is about **1/6 of frame height** at 4:5 (1600 × 2000). Hands are the true size relative to the jar. |
| **Avoid** | Smiling at the camera, holding the jar up to the camera, gym or clinical cues, swallowing or dosing gestures, more than one product in frame. |
| **Composite** | If the human plate is photographed with a stand-in jar, replace it with the source render matched for perspective and light. |

### A3: Material macro (Myo & D-Chiro Inositol)

| | |
|---|---|
| **Purpose** | Prove the object is real, and stay beside the whole jar. |
| **Frame** | From the cap's lower third through the seam to the "CO" of the printed mark. The mark sits left of centre; the right edge falls away into the curving body. 1800 × 2400 for desktop and 900 × 2400 for a strip-safe phone crop. |
| **Source** | Rendered from the Blender source: original geometry, the 6485px label texture and the matte cap material. **Never** the benefit lines, pack counts or any claim text. |
| **Light** | One large soft key from upper left at 45°. Raking enough to show the matte cap grain and the label paper. Seam shadow visible. No gloss, no rim light. |
| **Lens** | Macro equivalent with focus on the printed mark; the cap edge falls slightly soft. Must be sharp at 100%. |
| **Ground** | Out-of-focus enamel white `#F1F0EC`. No floating capsules or splashes. |
| **Stand-in** | Until it exists, the study uses the supplied mockup crop, which is low-res and labelled. |

## Rhythm proven in the previews
1. **The opening (A1).** Room colour, the stacked bold headline on the flat wall, a white button, the product at true scale, the circle signature, and a caption that keeps the draft packaging and sample price truthful.
2. **The follow-on moment** shows how products are explained. The macro (A3) fills one side. The other side is set entirely in black and white: the cap Pantone chip, the stacked product name, the subtitle, the factual "In view / Format / Sample price", one action, the label link, and the whole jar small for scale.

Not drawn: the full homepage, catalogue, product page, bag, checkout and forms. Those wait for review.

## Three visual questions for the client
1. **Colour as rooms.** Each product owns a painted room in its own cap colour, one at a time. Is that the right amount of colour, or should rooms be shared neutral spaces with colour only in a single object?
2. **People.** For product + human imagery, do you want faces visible (warmer, more personal) or hands and partial figures (more editorial, puts the product first)?
3. **Logo placement.** Should the circle signature on imagery be the main logo moment on the site, with only a small plain logo in the header? Or do you want the full stacked logo in the header as well?
