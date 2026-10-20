> Current implementation supersedes the D orbit below. See [REFINEMENT-20261020.md](REFINEMENT-20261020.md) for the four-chapter cap story, original logo treatment, current model sizes, render budgets and verification. The research and earlier implementation record below are historical.

# Motion research and live A / D landing pages

20 October 2026. The user rejected image-led scenes and asked for deeper motion research and more ambitious A/D landing pages. This pass replaces both home-page heroes with real-time 3D compositions using the original product geometry. C/B retain their previous experiences.

## Research findings

The following are design conclusions drawn from creator-authored case studies and live references, rather than claims that any single effect guarantees an award-winning website.

| Primary reference | What was studied | Applied decision |
| --- | --- | --- |
| [Exat / Studio Size case study](https://tympanus.net/codrops/2026/04/10/the-exat-microsite-pushing-a-typography-showcase-to-new-creative-extremes/) and [live microsite](https://exat.hottype.co/) | Type as an interactive system, proximity response, pacing, and simplified touch presentation. The live opening was visually inspected. | A’s oversized letter-built headline shares its rhythm with the sculpture. Mobile prioritizes a short headline and direct object controls. |
| [INK Games / ToyFight case study](https://tympanus.net/codrops/2025/11/21/one-canvas-to-rule-them-all-how-ink-games-new-site-handles-complex-3d/) | Shared-canvas rendering, 3D/DOM layering, visibility-driven animation and model optimization. | One renderer per active landing page; real meshes coexist with accessible HTML controls. Release the renderer on route changes and stop its loop when hidden/off-screen. |
| [Lusion’s Abduction experiment](https://exp-abduction.lusion.co/) | A live real-time scene that responds to direct manipulation rather than relying on passive image motion. The running WebGL scene was visually inspected. | Horizontal drag changes the actual object/exhibition orientation. Controls produce visible changes to the scene’s arrangement. No graphics or code were copied from the reference. |
| [Adrien Vanderpotte’s creator spotlight](https://tympanus.net/codrops/2026/05/27/whooshes-snaps-and-shaders-adrien-vanderpotte-and-the-feeling-of-the-interface/) | Motion chosen to express a project’s identity: optical transitions, organic movement and tactile interactions. | A uses a restrained spring response for scatter/gather and inertial rotation. D uses an orbital exhibition, repeating depth geometry and camera movement. |
| [Lusion’s Synthetic Human case](https://lusion.co/projects/synthetic_human/) | Procedural effects and optimization as part of the original creative work. | Model and geometry preparation are part of the design process, with real source bottles and original procedural ribbons/portals. |
| [Three.js renderer documentation](https://threejs.org/docs/pages/WebGLRenderer), [material documentation](https://threejs.org/docs/pages/MeshPhysicalMaterial.html) | Animation-loop management, disposal, physically based material costs and environment lighting. | Local pinned library, modest geometry and pixel ratios, explicit pause/cleanup, environment-based lighting without expensive transmission or post-processing. |

## A: State of Play

A bright, tactile product sculpture. A real 3D bottle sits inside animated metallic ribbons with small orbiting objects. Horizontal dragging turns the bottle; release adds decaying inertia. “Let it loose” expands the sculpture into the seven actual product models, and “Bring it together” gathers them. Scrolling changes the composition and reveals the next statement. Numbered HTML controls select a product and update its product-page link.

Motion language: spring-driven expansion (stiffness 55, damping 11, time-based integration), damped pointer following, slow ribbon deformation, gentle floating and a short inertial tail. The scene responds to input instead of playing a canned video.

## D: The Other Side

A dark spatial exhibition. Real bottles occupy a three-dimensional orbit inside a sequence of illuminated metal rings. Dragging rotates the exhibition and settles to an object; selecting a number brings that object forward. “Expand the orbit” changes both the arrangement and camera distance. Scroll changes the camera’s depth and the exhibition’s perspective. Pointer position creates a small camera offset.

Motion language: controlled angular movement, gradual camera travel, slowly changing portal orientations and quiet object suspension. It uses a distinct palette, geometry and composition from A.

## Implementation and performance boundaries

- `web/live.js`: homepage compositions, accessible selector fallback and lazy renderer loading.
- `web/live-scene.js`: Three.js geometry, model loading, interaction and lifecycle.
- `web/live.css`: layout, layered typography and responsive composition.
- `web/models/`: seven GLBs derived from the source blend, approximately 355–450 KiB each (about 2.7 MiB total). Selected product first, then the remaining six.
- `design-tools/export_web_models.py`: reproducible isolated Blender export. Original source file never saved or modified.
- `web/vendor/three/`: pinned Three.js r186 / npm 0.186.0, official MIT-licensed files with local import paths. No runtime CDN dependency.
- One WebGL canvas is mounted only on A/D homepages. Geometry, textures, observers, event handlers and the context are released on navigation.
- Pixel ratio capped at 1.25 on phones and 1.75 on larger screens. Rendering pauses when the scene is outside the viewport or the tab is hidden.
- A visible pause button freezes ambient motion. OS reduced motion (also reviewable with `&motion=reduce`) removes the pinned scroll sequence and starts with a static 3D composition. Product controls remain usable.
- The image selector and product links work before the renderer loads, and remain available when WebGL cannot start. These are the existing draft images in the fallback, not substitutes presented as 3D.
- No measured frame-rate promise is made. Packaging materials approximate the source render; draft label notices and sample-price labels remain visible.

No reference-site imagery was copied. No new raster backdrop was generated for either hero in this pass. These are live geometry compositions using the project’s existing source artwork and objects.

## Verification completed

- Fourteen product selections across A/D: matching names, one pressed selector and correct product destination each time.
- Direct horizontal drag in D selected the adjacent object; orbit expansion and A scatter/gather exercised.
- Pause state verified; the same controls work with reduced motion enabled. Reduced-motion mode removes the long pinned sequence.
- Renderer state verified as `offscreen` after leaving the scene, and `running` on return.
- Product-page handoff removes the live canvas during normal internal navigation.
- Forty homepage/collection/product/cart/checkout layout combinations at 320, 390, 768 and 1440 CSS pixels: no horizontal overflow; no live canvas on inner pages.
- Seven exported GLBs checked for four expected meshes/materials each and corrected cap/label parent transforms.
- Existing backend suite: 24 tests pass. JavaScript syntax checks and static preview build pass.
- QA evidence: `.local/live-20261020/` (ignored in Git). These checks do not constitute a measured frame-rate benchmark.

The website remains running locally on port 4174. This pass is local and uncommitted; nothing was deployed.
