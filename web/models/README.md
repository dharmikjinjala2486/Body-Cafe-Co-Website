# Browser bottle models

Seven GLB assets exported from the existing Body Café Co. source file:
`assets/source/blender/BCC_Final_Varient_1_Garden_SpotUV_Corrected.blend`.

Each uses the `F_FINAL_<SKU>_ROOT` bottle group, including body, cap, cap logo and actual embedded draft label artwork. These are draft design assets, not approved labels or validated product specifications.

Blender 5.2.1 exports use isolated duplicate objects in a new scene. Parent/basis transforms are reconstructed explicitly because the source groups are excluded from evaluation in the saved view layer. The original blend is never saved or modified. Original mesh geometry and smooth normals are retained to avoid faceting and UV-shell artifacts. Textures are reduced to 2048px wide, and standard PBR materials replace render-only material complexity. Labels keep their original cylindrical UVs. Colour, gloss and spot-UV rendering are approximate in the browser.

Reproduce from the repository root with the installed Blender:

```
/Applications/Blender.app/Contents/MacOS/Blender --background assets/source/blender/BCC_Final_Varient_1_Garden_SpotUV_Corrected.blend --python design-tools/export_web_models.py
```

The script uses `.local/motion-rd/` for intermediate label textures; create that directory before running. Resulting files are approximately 628 KiB–1.9 MiB each, about 8.28 MiB total. The live renderer loads the selected product first, then the remaining six.
