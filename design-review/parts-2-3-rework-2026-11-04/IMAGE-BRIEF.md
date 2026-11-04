# Image brief — Variant E Parts 2 and 3

4 November 2026 · For: Codex (Blender MCP renders) or Claude Design · Owner reviews every image before use.

## Why new images

Parts 2 and 3 currently use images from `web/media/editorial-b/`. They were made for archived Variant B: lilac and indigo arches, surreal pastel sculptures, a dark-purple palette. They don't match Variant E, which uses warm cream and white, ink type, and the seven cap colours as the only colour. Every image below replaces them, and the `editorial-b` images are no longer used in E.

## The look (applies to every image)

- **Ground:** warm cream `#F7F4EE`, or white `#FFFFFF`. Seamless studio sweep or a matte plaster or linen surface. No pastel sets, no arches, no purple.
- **Colour:** only the seven cap colours, used exactly. Iron `#A5442E` · L-Theanine `#6F7A4A` · Vitamin D3 + K2 `#2E2A6E` · Omega-3 `#9AA3AD` · Myo & D-Chiro Inositol `#B58DB8` · Creatine Chews `#1F5467` · Psyllium `#9C8F70` (Pantone references in `assets/brand/colours/Colours.jpg`). One cap colour per image, as an accent, never as a full backdrop except where specified.
- **Light:** soft north-window daylight from the left, a gentle fall-off, long soft shadows. No hard flash, no coloured gels, no glow.
- **Feeling:** calm, precise, honest. "A pharmacist's shelf, styled by a design studio." Generous negative space; the product is always the subject.
- **Composition:** leave clean space on one side for type (noted per image). Eye-level or a 10–15° high angle.

## Rules (hard)

1. **Never regenerate the bottle or the label with AI.** Generated labels warp text. Use the real renders: `web/media/premium/front-<id>.webp`, `web/media/renders/<id>-three-quarter.webp`, the 24-frame spins in `web/media/spin/`, or render fresh from the Blender source in `assets/source/blender/` (decompress the `.blend.gz`). Composite them into scenes with matched light and shadow.
2. **No manufacturer names.** The rear labels in `web/media/labels/*.pdf` print the manufacturer and licence numbers. Any rear-label image must crop out or cleanly mask that block. Body Café Co. and the marketer (Bluebell Lifecare) may appear.
3. **No health claims in the picture.** No before and after, no bodies "performing", no medical props (stethoscopes, pill organisers, hospital white).
4. **No invented people for testimonials.** Faces next to reviews would read as real customers. Hands only (natural Indian skin tones, short clean nails, no jewellery branding).
5. **Product facts must be true.** Capsule, softgel and chew colour and count must match the label: L-Theanine and Inositol are HPMC capsules, Omega-3 and D3 + K2 are amber softgels, Creatine is orange chewable tablets, Psyllium is capsules (5 per serving), Inositol is 3 capsules per serving, and Creatine is 2 chews per serving.

## Delivery

WebP (quality 82), sRGB, plus a 2× PNG master. Save to `web/media/e/` using the file names below. Every image needs alt text (one sentence) in `web/media/e/ALT.md`.

---

## A · Homepage

| File | Size | Used in | Brief |
|---|---|---|---|
| `home-hero-lineup.webp` | 2400 × 1350 (and `-mobile` 1080 × 1350) | Part 2 hero | All seven bottles, front-facing, standing in one gentle line on a cream seamless sweep, in catalogue order. Soft shadows fall to the right. Caps must read clearly. Clear space above for the headline. |
| `home-hero-<id>.webp` × 7 | 1600 × 1600 | Part 2 / Part 3 hero (per-product state) | One bottle centred on cream, a large flat disc of its cap colour behind it (about 70 % of the frame, like a cap seen from above), and a soft contact shadow. Identical framing across all seven so they cross-fade cleanly. |
| `home-caps-row.webp` | 2400 × 600 | Part 3 hero / trust stripe | The seven caps seen from directly above on cream, evenly spaced, catalogue order, soft top light. Clean and graphic. |
| `home-transparency.webp` | 1600 × 1100 | "Trust build / transparency" section | One bottle (Vitamin D3 + K2) turned three-quarters to show the rear label in sharp detail, beside its open cap and one softgel on cream. The manufacturer block is masked. Clear space on the left. |
| `home-lot-base.webp` | 1600 × 1100 | "Lot record" section | Macro of the bottle base and lower label with the printed lot and expiry code (use `LOT DEMO-01-01 · EXP 09/2028`), in crisp focus with a shallow depth of field. |
| `home-lot-phone.webp` | 1200 × 1500 | "Lot record" section (alternative) | A hand holding a phone that shows the site's lot-record screen (supply a real screenshot of `/reports`), with the bottle out of focus behind. |

## B · Product pages (one set per product: 7 × 4 images)

| File | Size | Brief |
|---|---|---|
| `pdp-<id>-front.webp` | 1600 × 1600 | Front packshot on cream, centred, soft shadow. Matches the other six exactly in scale and light. |
| `pdp-<id>-contents.webp` | 1600 × 1600 | **One serving**, out of the bottle, beside the open cap on cream. The exact count and true format: 1 capsule, 2 chews, 3 capsules, 5 capsules, or 1 softgel. Cap colour accent only. |
| `pdp-<id>-label.webp` | 1600 × 1600 | Rear label, straight on, sharp and readable (supplement facts, directions). Manufacturer block masked. |
| `pdp-<id>-hand.webp` | 1600 × 1600 | A hand holding the bottle for scale, cream background, natural light. Hands only. |

Optional, one per product, for "Why this form" (keep real and quiet, no fantasy props):

| Product | Still life |
|---|---|
| Iron Bisglycinate | A capsule beside a cup of chai set slightly apart. The routine is "iron first, chai later". |
| L-Theanine | A capsule beside a few fresh green-tea leaves on linen |
| Vitamin D3 + K2 | A softgel catching window light on a breakfast table |
| Omega-3 Fish Oil | A softgel with a single drop of golden oil on stone |
| Myo & D-Chiro Inositol | Three capsules in a neat row on cream |
| Creatine Chews | Two orange chews beside a slice of orange |
| Psyllium Husk | A small ceramic bowl of husk, five capsules beside it, and a full glass of water |

File: `pdp-<id>-why.webp`, 1600 × 1100, clear space on the right.

## C · Other pages

| File | Size | Page | Brief |
|---|---|---|---|
| `story-seven.webp` | 2400 × 1000 | Story | The seven bottles from above, caps only visible, arranged as a loose colour palette on linen. |
| `standard-form.webp`, `standard-dose.webp`, `standard-tested.webp`, `standard-hidden.webp` | 1600 × 1100 | Our standard (Part 2 only) | Macro crops of real label areas: the form name on the front, the per-serving amounts in the supplement facts panel, the lot code on the base, and the rear ingredient list. Shallow depth of field, cream light. |
| `help-hands.webp` | 1600 × 1000 | Help (Part 2 only) | Hands unpacking a parcel and lifting out one bottle; kraft box and tissue. |

## Usage limits

- **Part 2:** may use all of A, B and C.
- **Part 3:** home uses only `home-hero-<id>` (or the bottle renders) plus `home-transparency`. Product pages use `front`, `contents` and `label`. Story uses `story-seven`. No other page uses an image.

## Hand-back checklist

- [ ] Bottles and labels are real renders (no AI text)
- [ ] No manufacturer name visible anywhere
- [ ] Cap colours match the hex values
- [ ] Serving counts and formats match the labels
- [ ] Same light and scale across each set of seven
- [ ] WebP + PNG master + alt text supplied
