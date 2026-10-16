# Product pages for all four design directions

Baseline: `design/concepts` @ `919c8f8`. All four directions now have their own product detail page (PDP), applied to all seven products. Product data, commerce and backend are unchanged and shared.

## Changed and new files

| File | Change |
|---|---|
| `web/pdp.js` | **New.** One content model for the PDP and four compositions (`pdp-a`, `pdp-b`, `pdp-c`, `pdp-d`). Also C's detail tabs, the mobile purchase bar and the sample-lot fill. |
| `web/pdp.css` | **New.** Shared PDP primitives and A/B/D chrome palette on product routes only (`body[data-route="products"][data-design=…]`). |
| `web/pdp-a.css` … `web/pdp-d.css` | **New.** One stylesheet per direction, scoped to `.pdp-a` … `.pdp-d`. D uses an `sl-` prefix so the D homepage rules (`body[data-design="d"] .d-*`) never leak in. |
| `web/app.js` | Design routing for a/b/c/d. `detail()` delegates to `BCCProductPage`. Product-linked lot form. The pincode check no longer promises "3 to 7 business days". The tab title is the product name. |
| `web/index.html` | Loads the five stylesheets and `pdp.js`. |
| `concepts/app.js` | A/B product links carry `?design=a|b`, and the page records the direction in `sessionStorage`. |

There are no backend or schema changes, no new dependencies and no external resources. The only `data:` asset is the existing D grain SVG.

## Routing and persistence

- **Selecting the direction.** The storefront accepts `?design=a|b|c|d`. Precedence is the URL parameter, then this tab's `sessionStorage['bcc-design']`, then C. `syncDesign()` runs on every render, so back and forward always follow the URL.
- **Product URLs.**
  - Product pages always carry their direction in the URL: `/products/:id?design=x`. If the parameter is missing or stale, it is added with `replaceState`.
  - Reload, back/forward and shared links therefore reopen the same design.
  - A bare `/products/:id` in a fresh tab opens C.
- **Entry from each homepage.**
  - A/B concept product links open `/products/:id?design=a|b`.
  - C/D homepage links are in-app and inherit the session.
  - Related products and the C cap rail are in-app links, so they keep the theme.
- **Home and collection links.** For A/B, "home" is the concept homepage: the logo and the Home breadcrumb go to `/concepts/index.html?concept=a|b`, and "The collection" goes to its `#shop`. If `/` is requested while A/B is active, the app uses `location.replace` to load the concept homepage. Links to `/concepts/` always load as full pages.
- **Theme selector.** On a PDP, the four selector links are `/products/<same id>?design=x`, handled in-app. Elsewhere they behave as before: A/B go to the concepts, C/D go to `/?design=c|d`. The current option has `aria-current`, including A/B.
- **Other routes.** Shop, cart, checkout and the other routes keep the shared storefront look in every direction, as before. Only product pages are themed.

## The four art directions

All four share one buying order: purchase first, then facts, formula and label, use and care, the lot record, delivery and help, customer experiences, FAQs, learning links, then related products. Each direction lays this out differently.

- **A, Warm editorial.**
  - The concept photograph fills the left; the editorial buy column sits on the right.
  - An "at a glance" spec row, then numbered spreads (01–08) with olive emphasis and hairline lines.
  - A sand-coloured lot spread, a framed customer-experience card, field-note cards and photo cards for related products.
- **B, Expressive everyday.**
  - A cap-tinted information block beside a solid cap-colour panel with a tilted framed photograph and a lime stamp.
  - A dark jump strip, a bento of colour tiles for the quick facts, a speech-bubble "Still to confirm" card and four colour arches for use and care.
  - An indigo lot band, pill FAQs and arch photo cards with add buttons.
- **C, Pick a cap.**
  - A sticky cap-colour stage with the vertical ghost name; LEMON MILK titles.
  - A cap rail linking all seven products, an "On the label" café-menu board with dotted leaders, and accessible detail tabs (arrow keys, Home and End).
  - The dark "Turn the bottle over" band and an "Also on the menu" list.
- **D, Still life.**
  - A masthead, then a lit porcelain plinth stage with a museum spec band, next to a numbered 01–04 purchase panel.
  - A contents index, numbered sticky section heads and a packaging facts panel (heavy rules, pending amounts).
  - A dark band with the bottle lying on its side for lot lookup, hairline FAQs and a shelf of related products.

Every direction:

- shows the gallery as a single image, using real supplied assets only (the concept photograph for A/B, the cutout for C/D);
- shows no thumbnails, rear labels, angles or certificates;
- shows the mobile purchase bar only after the main add button has scrolled away, and hides it while the footer is in view;
- raises the toast and the focus scroll padding above the bar while it is showing.

## Content rules applied

- **Reused.** Name, subtitle, ingredients, format, collection, price and stock come from the catalogue. Copy is reused from the existing PDP, standards, FAQ, policy and homepage text.
- **"Still to confirm".** These lists come from the per-product fields in `Website-Research-and-Plan.md`.
- **New text.** It is limited to status and interface lines, for example: "Awaiting approved label", "No reviews have been published for X yet", "Front-of-pack design mockup. Wording printed on this render is a draft, not the approved label." and the pincode result.
- **Not added.**
  - No doses, purpose or benefit claims, allergen statements, dietary marks, delivery dates or return windows.
  - No ratings, reviews, certificates or bundles.
- **Mockup label text.** Wording printed on the bottle mockups (for example "40:1 Ratio", "Supports Hormonal & Metabolic Balance", capsule counts and the green dietary mark) is not transcribed, and the caption says it is a draft.

## QA

The checks below were run against an isolated database (`--db` in the scratchpad, not `.local/preview.sqlite3`).

- **Backend and syntax:** 24 of 24 unit tests pass. `node --check` passes on the five JS files.
- **Sweep:** all 28 product/design pairs at 1440, 1100, 768, 390 and 320px (140 page states).
  - Every state has one h1, no horizontal overflow, no broken visible images and no console or page errors.
  - The URL carries the design, and no control is smaller than 24px.
  - Text contrast is at least 4.5:1, or 3:1 for large text, on solid backgrounds (computed); 0 issues.
- **Flows:** 78 of 78 checks pass.
  - **Theme entry:** from the A and B concepts, the C menu, the D shelf and the shop.
  - **Navigation:** returning home from the logo and breadcrumb; switching A→B→C→D on the same product; back, forward and reload.
  - **Related products** keep the theme in all four directions.
  - **Defaults:** a bare direct link opens C, and `/` while A is active opens the A homepage.
  - **Purchase:**
    - quantity 2 is added in all four directions;
    - the existing 10-unit and stock limit is kept;
    - unpublished and out-of-stock states, including disabled related add buttons, work in all four directions;
    - the mobile purchase bar is hidden at the top, appears after the buy row, hides at the footer and adds the selected quantity.
  - **Forms:**
    - pincode: an invalid entry shows an inline error and `aria-invalid`, and a valid one promises no date;
    - lot lookup: the sample lot fills in and is matched;
    - policy links work.
  - **Accessibility:**
    - C tabs work with arrow keys, Home and End;
    - focus is visible in all four directions;
    - reduced motion removes the bottle animations.
  - **Isolation:** the A/B/C/D homepages and the cart are unaffected.

These are targeted preview checks, not a WCAG or performance certification.

## Content gaps (unchanged and still needed)

- **Approved rear labels for all seven SKUs:**
  - serving size, units and servings per pack, amounts per serving;
  - full ingredient list, allergens, storage, directions, cautions and warnings;
  - manufacturer details and permitted purpose or benefit wording.
- **Real gallery views:** readable rear label, close-up of the format, pack in hand.
- **Prices and delivery:** final prices, GST and courier serviceability, so the pincode check can return real availability and dates.
- **Policies and contacts:** approved shipping, returns and cancellation rules, and public support contacts.
- **Evidence:** approved lot reports and source documents.
- **Reviews:** a public review publishing and moderation UI. Submission stays delivery-gated and moderated, as before.
