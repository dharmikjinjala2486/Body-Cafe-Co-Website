# Mobile shopping improvements · 26 October 2026

Implemented locally across variants A–H. No deployment was performed.

## Changes

- Product title, price, quantity and Add to bag now precede the compact mobile gallery. Image enlargement and gallery navigation remain available.
- The sticky product action appears whenever the main purchase controls are outside the phone viewport and disappears at the footer. It uses the original selected quantity.
- A, C and D have a direct “Shop all seven” link near the top of their home hero.
- Mobile checkout uses a compact heading, numbered form sections, concise guest sign-in note and a collapsible order summary before the delivery form. Its visible total follows discount updates.
- Footer link groups collapse into native keyboard-accessible disclosures. Every original link remains in the DOM.
- Functional labels and purchase typography are more readable on phones. Each variant retains its colors and visual identity.
- Desktop restores the original nodes and ordering on resize; inputs, listeners and entered form values are retained.

## Evidence and checks

- `product-checks.json`: all seven products × eight variants × 320px and 390px = 112 observations. One h1, no horizontal overflow and purchase controls within the first screen in every observation.
- `checkout-checks.json`: 32 observations across all eight variants and normal/sample/errors/unavailable states. No horizontal overflow or duplicate IDs; unavailable states remain unavailable. Normal checkout's first delivery input appears at y608–735 on a 390×844 viewport.
- `responsive-checks.json`: keyboard summary expansion, form field preservation and desktop restoration. Variant C initially recorded a resize timing mismatch; a follow-up after the browser state settled confirmed zero mobile wrappers and the restored original heading.
- Keyboard footer expansion verified; all original links retained. Direct home shopping links verified for A/C/D.
- Sticky Add to bag with quantity 2 verified through the actual bag, then the added test product was removed. Original two-item bag restored.
- PREVIEW10 updated both the order total and its collapsed-summary mirror to ₹2,338. C image enlargement opened its dialog correctly.
- Tablet 768px and desktop 1470px spot checks passed. Desktop product title and purchase controls return to their original panel, with no mobile intro or sticky bar.
- 74 Python regression tests passed. Preview-content regression checks, static export build and hosted-preview API/publish-boundary checks passed.

The before/after screenshots and JSON observations are in this folder. `before-after.jpg` compares variant A's product and checkout screens. Sample checkout deliberately retains the disabled-controls notice, which adds height compared with normal checkout.
