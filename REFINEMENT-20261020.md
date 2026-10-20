# Bottle motion, brand artwork and four-theme refinement

20 October 2026. Current implementation, superseding earlier direction names and orbital D descriptions.

## Current behavior

- A / State of Play keeps the acid-yellow/cobalt live sculpture. Source bottle, cap and label geometry retain their original smooth normals and UV shell. Aggressive mesh decimation was removed after visual artifacts were found. The selected product is initially Vitamin D3 + K2.
- D / The Other Side is now a four-chapter native-scroll story: first impression, curiosity, label detail, and the record for a particular lot. One selected source bottle follows the story; its original cap and cap-logo meshes lift, turn and return. Chapter controls scroll to the corresponding pose; dragging turns the bottle. The cap button also opens/closes it directly. Scrolling resumes the narrative pose.
- All four themes gain a seven-product curiosity cabinet on the homepage, collection and reading-room index. Selected bottles link to their real ingredient notes. Standards, story and reports gain interactive educational diagrams; tabs support arrow keys, Home and End.
- Reading sections gain chapter navigation built from actual headings. Existing product, cart, checkout, account, support and policy layouts gain theme-specific section furniture, reveal-once motion and material treatments. Themes, route contracts, forms and backend behavior are preserved. B is included in this refinement at the user's explicit request.
- Headers use original SVG path artwork and its exact #2e2926 fill, without CSS recolouring. The SVG viewport removes only empty outer margins. Footer marks reuse those same original glyph paths in a horizontal arrangement, including the exact rounded underline beneath the last O. Light brand panels preserve visibility on dark/strong backgrounds.

## Runtime boundaries

The renderer caches typography nodes and dimensions, caps DPR at 1.0 on phones / 1.35 on larger screens, and drops to 1.0 if the sampled frame interval is slow. It stops when hidden/offscreen and disposes on navigation. No heavy post-processing. Real source geometry increases all seven models together to 8.28 MiB; textures remain 2048px JPEGs. The selected model loads first. Static fallback images and links remain usable without WebGL.

OS reduced motion removes pinning and presents all four D chapters in reading order. The same scene mode is reviewable with `&motion=reduce`. Product controls remain available. The local D sample measured approximately 16.5 ms between frames on this machine; this is not a cross-device performance guarantee.

## Verification

- 92 route/layout checks: 36 desktop states and 56 mobile states at 390px, across A/B/C/D. One h1, original header/footer assets, no duplicate IDs or horizontal overflow in audited states.
- Fourteen A/D product selections: matching names, one pressed selector, exact product links and separate cap/cap-logo parts.
- Eight cabinet / keyboard-tab interaction checks across all four themes.
- D scroll chapters, cap framing, direct cap control, pause and reduced-motion chapter visibility checked visually.
- Existing backend suite: 24 pass. JavaScript syntax checks and static preview build pass.
- Evidence: `.local/refinement-20261020/` (ignored).

Current files: `web/live.js`, `web/live-scene.js`, `web/live.css`, `web/atelier.js`, `web/atelier.css`, theme chrome files, original-derived SVG assets and source GLBs. Original Blender and logo source files are unmodified. No production deployment was performed.
