# Theme B website imagery — 28 October 2026

Integrated the approved Expressive Everyday v01 library into the existing website project. Original asset library: ../BCC Branding/Website Image Production/Expressive Everyday v01.

## Placement

- Homepage: art-directed desktop/mobile hero with the exact supplied product labels; existing product destinations retained as image links. Decorative artwork accompanies customer voices and FAQ; review-status copy and existing FAQ controls remain unchanged.
- Bundles: daily edit and curious edit each use their own card and detail composition, preserving product names, prices, links and bag controls from the existing page.
- Learn: illustrated hub header, all seven product cards and guide headers, and all five foundation-guide cards/article headers. The site uses Learn as its editorial/blog route.
- About: original seven-cap illustration in the introduction; curiosity/conversation artwork beside the naming story. No generated team or premises image is used.
- Help: order-help illustration beside the help-centre search, preserving the search and help content.

25 optimized WebP files are held in web/media/editorial-b. The optional wide desktop hero is available as an alternate; the current split layout uses the square panel and portrait mobile source.

editorial-b.js decorates the final theme-B renderer strings before app.js binds existing behaviour. editorial-b.css is scoped to body[data-theme="b"]. Index loads the module after all page renderers and before app.js. Other design directions do not use the new images. Existing cinema edits were not changed.

Images have dimensions and alt text; below-fold artwork is lazy loaded. The hero picture uses an explicit mobile source. Text remains accessible HTML; reviews artwork contains no invented customer testimonial or rating. Ingredient covers are editorial illustrations.

This integration is local. Publication is a separate action.

## Verification

38 route/viewport combinations checked at 1440px desktop and 390px mobile, with no horizontal overflow. All seven product-guide covers and all five foundation-article covers are present. Learn search returns matching results, FAQ accordions open, hero product links keep design=b, and the mobile hero selects its portrait source. No browser error logs were captured. Theme A renders without theme-B editorial images. All 25 source assets match their library and static-export copies byte for byte and return image/webp over HTTP. The static Netlify build completed. Not published.
