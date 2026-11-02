# Homepage content, compact cards and printed QR routes

Implemented directly in the local checkout. No delegation or publication.

- `web/home-content-e.js` uses the owner's localhost:8000 homepage reference and the current label-enriched catalogue. The hero wording stays unchanged except for removal of the requested review-preview line. Homepage copy covers brand belief, range, servings, label cards, everyday directions, lot lookup, philosophy, manufacturers, learning, FAQs and the closing invitation. Empty testimonial placeholders are replaced with actual product directions. Manufacturing/test marks are described as label statements; unpublished documents are not presented as available.
- `web/shop-e.js` removes repeated subtitles, headlines, ingredient chips, fact lists and empty review lines from E collection cards. Cards retain name, pack, price, stock and actions. Original bottle artwork uses the existing normalized frames; administrator replacement images remain untouched. `web/shop-e.css` aligns desktop cards and fixes the shared first-result enlargement on phones.
- `web/product-routes.js` maps the seven printed QR paths to existing catalogue IDs. `app.js` handles direct entry and internal navigation, canonicalizes legacy links, and preserves query data and anchors. E product URLs omit `design=e`; other design selections remain supported. Existing local-server and Netlify SPA fallbacks serve these routes.

Public paths: `/vitamin-d3k2`, `/creatine-chews`, `/l-theanine`, `/omega3-fishoil`, `/psyllium-husk`, `/iron-bisglycinate`, `/myo-and-dchiro-inositol`.

Validation: route unit checks, label-record checks, product-reference checks, shop-reference checks and JavaScript syntax checks passed. Connected preview export rebuilt successfully. Browser verification opened all seven paths directly and followed a shop product link; legacy `/products/iron-bisglycinate?design=e#detail` reopened as `/iron-bisglycinate#detail`. Desktop cards share a height; all seven cards at 390 px viewport measured 262 px tall with no horizontal overflow. The 12 homepage sections rendered on mobile without empty review cards or the removed hero line.

Domain connection and live deployment are separate; this change does not configure DNS or enable ordering.
