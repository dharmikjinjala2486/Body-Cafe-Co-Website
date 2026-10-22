# Variant 5 — art-direction study 01

A research-led study for review, designed by Claude and assembled/visually checked by Codex. This does not implement or replace the storefront. A–D remain frozen. Variant 5 remains one direction.

## Review files

- `board.png`: complete direction including campaign, human image, materials, type and colour.
- `desktop.png`: 1440 × 900 opening composition.
- `mobile.png`: 390 × 844 opening composition.
- `detail.png`: 1440 × 900 follow-on product-detail composition.
- `source/study.html`: editable, isolated static study; all imagery and fonts are local.
- `CLAUDE-STUDY.md`: original Claude rationale and production brief; descriptions of unmade placeholders in that original handoff are superseded by this assembly and ASSET-PROVENANCE.md.

## What gives this direction its character

Iron-red painted architecture and brushed steel establish a physical place. White controls and short, bold Aileron headlines follow the packaging identity. Human editorial imagery shows attention to the product; close-up CGI shows its material construction. Cap colours inform separate photographic rooms rather than decorative gradients in the interface.

The image treatments are concept art. Product artwork remains draft. Sample prices, nutrition information and label claims need catalogue approval before implementation. No nutrition amounts have been invented for this study.

## Homepage sequence proposed for the next design stage

1. Architectural opening: one clear message and collection action.
2. Human editorial moment: reading, carrying or setting down a jar; generous image area.
3. Clean collection overview with seven products and simple product facts.
4. Material-detail feature, paired with the whole jar for context.
5. Ingredient/label education with verified information and restrained iconography.
6. Quiet brand/service close and useful footer.

Claude should refine the full-page design after this visual direction is reviewed. Codex then integrates one Variant 5 and checks desktop, mobile, accessibility and interactions. A–D receive only separately justified improvements.

## Balanced motion specification for implementation

- Opening: single opacity/12px translation entrance, 500–650ms; no repeated hero animation.
- Editorial imagery: optional short original campaign clip with poster and pause control; muted, plays inline, no autoplay on reduced-motion/data-saving preference. No usable original video is currently available, so this study does not pretend to include one.
- Scroll: one-time section reveal, 350–450ms, displacement no more than 16px. Content remains visible without JavaScript.
- Product hover: image scale no more than 1.025 over 280ms; identical keyboard focus affordance.
- Buttons: 160–200ms colour/underline transitions; no magnetic cursor or exaggerated movement.
- No scroll hijacking or forced horizontal scrolling. Honour prefers-reduced-motion throughout.

## Verification

Desktop, mobile, follow-on detail and board were inspected in-browser. All visible board assets loaded. Storefront SHA-256 verification is recorded in `storefront-verification.json`. Asset sources, generated-image prompts and limits are in `ASSET-PROVENANCE.md`.
