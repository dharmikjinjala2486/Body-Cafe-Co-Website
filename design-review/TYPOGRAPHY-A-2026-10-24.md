# Variant A typography polish — 24 October 2026

Screen-only stylesheet `web/typography-a.css`, loaded after the existing design and field styles. Every selector is scoped to `body[data-theme="a"]`; other directions and print styles retain their existing typography.

- Retains Anton display headings, Aileron body text and the existing brand palette.
- Establishes a shared responsive scale for page titles, section headings and product-card titles; reduces oversized secondary headings.
- Uses 17px reading copy on desktop and 16px on mobile, with 1.75 line height and bounded paragraph measures.
- Brings supporting copy to 14px and most functional labels/metadata to 12px with consistent tracking and leading. Compact hero indicators and decorative indexes retain smaller sizes where space is limited.
- Improves navigation/footer links, form-label readability and hero supporting typography while retaining the large opening display composition.
- Prevents the Learn report walkthrough from extending past narrow screens by allowing its nested grid and button to shrink and wrap.
- Preserves product-image normalization, native form behaviour and the complete sticky heading blocks.

Verification:

- 32 customer routes × 1440/768/390/320px: 128 page checks; no JavaScript page errors, page overflow or clipped text controls outside intentional scrollable carousels/navigation.
- All seven product pages included, alongside home, Shop, Standards, About, Story, Learn/guides, Reports, bundles, search, support, policies, account, checkout and bag.
- Isolated Variant A form audit: 68 route/state/viewport combinations, 204 visible fields; prefix/input alignment, field geometry, labels, selects and mobile control text passed.
- Sticky section checks passed at 1440/768px; mobile and short-height layouts retain normal scrolling.
- Desktop/mobile screenshots visually inspected; source whitespace and hosted-preview checks passed. Static preview rebuilt; no deployment.

QA scripts, screenshots and audit output: `.local/typography-a-20261024/` (ignored by Git). Form checks used a separate disposable local database.
