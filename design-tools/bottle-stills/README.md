# Bottle stills for directions E–H

Static images rendered once from the existing 3D bottle models (`web/models/*.glb`). Nothing 3D runs in the browser for E–H.

Output (committed): `web/media/renders/<id>-three-quarter.webp` (1000px tall) and `web/media/renders/<id>-cap.webp` (400×400).

## Re-render

1. Make a working folder with `render.html` plus symlinks `vendor -> web/vendor` and `models -> web/models`.
2. Serve it: `python3 -m http.server 8765` from that folder.
3. Render PNGs: `python3 render_run.py <png-dir> "?front=0&tq=0.16"` (Playwright + Chromium with SwiftShader).
4. Convert: `python3 to_webp.py <png-dir> web/media/renders`.

Settings: rotation 0.16 rad, elevation 0.30, NeutralToneMapping at exposure 0.85, PMREM studio environment, raking lights for caps.
The angle shows only the front label; the draft rear-label text is never visible in the stills.
