# Variant A bottle consistency

All seven full-bottle images now share a transparent 720 × 1040 frame, with equal visible bottle heights and centered artwork. Original artwork and bottle proportions are preserved. The shared framing removes the uneven transparent padding in the source files.

`web/bottle-assets.js` selects these assets at render time only for Variant A. Homepage cards and cabinet, Shop, product galleries and enlargement, related products, bundles, About, Story, Learn, Standards, reports, account/order views and bag imagery use this shared selection. Existing image slots retain the size appropriate to their context; a cart thumbnail remains smaller than a product gallery. Cap details and intentional editorial close-ups retain their original artwork.

Regenerate the SVG frames with `node design-tools/normalize_bottle_art.mjs`. The generated SVGs embed the original WebP images without modifying their pixels. Source-image bounds in that script must be updated if source artwork changes.

Validation: 84 page/viewport combinations across 21 routes at 1440, 768, 390 and 320 pixels; full-bottle images loaded at the shared dimensions, with no page overflow or JavaScript errors. Pixel bounds show only a one-pixel difference in visible height across the seven images and centers within one pixel. Desktop/mobile gallery enlargement, zoom and close passed. Variant B continues to use its original images.
