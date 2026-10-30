# Variant B — signature home, motion and transitions

30 October 2026 · Variant B only, frontend only. B's look is unchanged: same palette, Aileron, pills, arches and ink rules, and no new fonts. The photo shoot is deferred. Nothing is committed, pushed or deployed.

## Files

| File | Change |
|---|---|
| `web/signature-b.js` (new) | Home brand manifesto, home composition below the hero, scroll-linked motion, the bottle carry-over between pages, and the hero price-tag edge guard. |
| `web/signature-b.css` (new) | Styles for all of the above, scoped to `body[data-theme="b"]`. |
| `web/pages-b.js` | Exposes its helpers and calls the signature layer from its enhance hook. |
| `web/pages-b.css` | Layout fixes found in this pass (listed below). |
| `web/index.html` | Loads both new files last. |
| `web/app.js` | Two shared router fixes (all variants); see "Router fixes". |

## Home page, top to bottom

1. **Hero:** unchanged. A price tag that would run off the screen edge (at 1024px it did, by 5px) is now nudged back inside.
2. **Collection:** the heading is the first cell of the grid, so the seven bottles fill even rows: 4 + 4 on desktop and 2 + 1 / 3 / 3 on tablet. On phones an odd last card spans the row, with its details aligned beside the photo.
3. **"Why a café?" brand manifesto** (replaces the bottle scene, so the first three sections no longer all show bottles):
   - One lilac section with its heading row, quote and closing row all inside it, aligned to the site's 1320px column.
   - The approved About line ("A good café is an everyday place…") fills in word by word as you scroll. Key words get a B-colour highlight: café, everyday, ask, menu, unhurried, curious, specific.
   - The seven cap-colour dots light up one by one.
   - The closing row arrives at the end: "Detail you can check comes before badges you can't", the four values (Clarity, Curiosity, Accountability, Care) and Meet Body Café Co.
   - The two existing B brand illustrations (arches, the seven-colour discs) float in the side margins only. A measured check hides them whenever they would touch the words.
   - No product bottles and no new claims.
4. **What we can show:** a ruled ledger instead of arched cards.
5. **Lot section:** unchanged.
6. **Customer voices:** the honest note ("Real feedback. When it's real.") replaces the sample quotes in preview too.
7. **FAQ:** unchanged.

Section numbers follow page order.

## Manifesto behaviour (smoothed, second pass)

Everything is driven continuously by scroll. Each value is eased toward the scroll position frame by frame, so wheel steps glide instead of jumping; there are no on/off class switches.

- **Entrance:** the lilac panel arrives as an inset rounded card and opens to the full band. The heading row, quotation mark and illustrations fade and drift in with it.
- **Reading:** a soft reading head about 1.6 words wide passes over the quote. Each word inks in from 22% and settles upward by 0.16em. Highlights sweep across their word just behind the head, and "specific." turns lime as its indigo fills.
- **Cap colours:** the seven dots fill one after another, continuously.
- **Ending:** the closing row rises 22px (12px on phones) and inks in over the last part of the scroll.
- **Composition:**
  - A large indigo quotation mark hangs in the margin on wide screens and drops into the first line on narrower ones.
  - The type is larger: up to 84px, sized by both width and height, with smaller sizes for short wide screens and short phones.
  - The illustrations float against the scroll and rotate slightly.
- **Pins at every size checked:** 1920×1080, 1440×900, 1280×800, 1024×768, 768×1024, 390×844, 375×667 and 320×640.
- **Still mode (normal flow, finished state):** used for reduced motion, screens under 620px tall (for example 1440×600), or whenever the quote would crowd its rows.
- **Safety:** if the browser stops drawing frames (a hidden or throttled view), the animation settles on its final state after 400ms, so words never stay half-filled. This was confirmed with stalled frames: all 34 words were inked and the closing row had arrived.

## Router fixes (`app.js`, shared by all variants)

- The expected "Transition was skipped" rejection is now handled instead of logged as an error.
- **Stale paint guard:** a page update from an interrupted transition can no longer repaint an older page over a newer one. Once, during rapid clicking, the address showed Home while About was on screen.
- **Stress test with the pane visible:** six rapid click sequences in B and three in A, at 40ms apart, all landed on the right page with no errors. Bag quantity changes (an in-place re-render) still work.

## Layout fixes found in this pass

- **Learn hub, phones:** the product guide cards were crushed into side-by-side rows, with images covering the titles. They are now stacked covers.
- **Learn hub, all widths:** cover images were inset 10% by a shared rule (an empty strip at the top, the bottom cut off). They now fill their frames.
- **Product page, phones:** the lot-number field was too narrow and cut off its example. It is now full width, with the button below.
- **Bag, phones:** the round thumbnail was wider than its column and touched the item text. It now fits the column.
- **Footer, phones:** accordion labels stay on one line so paired rows line up. They wrap again at 320px rather than spilling out.

## How it was checked

- **Automated overlap scan:** every visible text, link, button and image box on the page, at 1920, 1440, 1280, 1024, 768, 390, 375 and 320px wide.
  - Home: all widths.
  - Inner pages at 1440, 768 and 390: Shop, three product pages, About, Standards, Reports, Learn hub, Read a Label, Story, Bundles, Help, Bag, Account.
  - Learn was also re-checked at 320 after its fix.
  - Remaining hits are intentional or false alarms: hero price tags and sticker on the photo, the Enlarge button, the Standards sticker, About's lineup, Shop's clustered shelf bottles, wrapped inline links, closed footer accordions, and the fixed phone buy bar.
- **Manifesto geometry** at the start, middle and end of the scroll for each size: no overlap between the quote, heading row, closing row and illustrations, no stage overflow, and no sideways page scroll.
- **Bottle carry-over:** home → product page names the product image during the transition and clears it afterwards.
- **Other variants:** A, C and E show no new classes.
- All `web/*.js` files pass `node --check`; 32 Python tests pass.
- **Not checked:** real devices, screen readers, an actual reduced-motion setting (logic only), and production mode (this server ignores `?release=production`).
- **Note for reviewers:** screenshots from a hidden browser pane freeze CSS transitions. Judge the manifesto in a visible window.

Screenshots are in `design-review/variant-b-signature-2026-10-30/`.

## Still open

- The photo shoot (deferred).
- The collection's even rows are designed for seven products. Other counts fall back to normal wrapping.
- The manifesto line is the existing approved About copy. If the team changes it, edit `MANIFESTO` in `signature-b.js`.
