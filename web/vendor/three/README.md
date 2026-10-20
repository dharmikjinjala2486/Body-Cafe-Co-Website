# Three.js r186 / npm 0.186.0

Official Three.js distribution, MIT license retained in LICENSE.

Source: https://github.com/mrdoob/three.js/releases/tag/r186
Files downloaded from the pinned npm distribution through jsDelivr:
- build/three.module.min.js
- build/three.core.min.js
- examples/jsm/loaders/GLTFLoader.js
- examples/jsm/utils/BufferGeometryUtils.js
- examples/jsm/utils/SkeletonUtils.js

Only module import paths are adapted to these local files. The runtime makes no CDN requests. These dependencies are dynamically imported only for A/D’s live homepage. B/C and inner pages do not mount a WebGL renderer.
