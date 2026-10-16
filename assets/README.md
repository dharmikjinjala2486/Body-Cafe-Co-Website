# Body Café Co assets

All files were copied from the user-supplied local sources on 16 October 2026. Original files remain untouched. SHA-256 checks verified every copy; extracted mockups match their ZIP members exactly. See `asset-manifest.json` for original paths, sizes and checksums.

## Folder map

| Folder | Contents | Intended use |
|---|---|---|
| `brand/logos/` | Black and white SVG/PNG logo variants | SVG preferred for website display |
| `brand/guidelines/` | Eight-page brand guide PDF | Logo, typography, photography and colour rules |
| `brand/colours/` | Colours.jpg and companion Pantone workbook | Colour references; final screen values require contrast review |
| `brand/fonts/aileron/` | 16 original OTF files | General brand typography |
| `brand/fonts/lemonmilk/` | 6 original OTF files | Logo-family reference and potential short display headings |
| `products/mockups/` | Seven named product PNGs extracted from the supplied ZIP | Current product visual reference |
| `source/` | Original mockup ZIP and Blender source | Production source archive; exclude from website deployment |

## Product mockups

- `iron-bisglycinate.png`
- `l-theanine.png`
- `vitamin-d3-k2.png`
- `omega-3-fish-oil.png`
- `myo-d-chiro-inositol.png`
- `creatine-chews.png`
- `psyllium-husk.png`

Every mockup is 1196 × 1315 pixels, RGB PNG, with a baked background and no transparency. Originals are preserved; responsive website exports will be produced separately. No images have been retouched or upscaled.

The user confirmed that Vitamin D3 + K2 includes Omega-3 as triglycerides. Amounts and full ingredient details still require approved product data.

The supplied Blender file has been copied but has not been opened, rendered or checked for external dependencies. The current mockups take precedence over older illustrated previews for the design direction. Do not publish source archives, Blender files or the complete font library as website downloads. Font delivery and web-use rights need review before production.

Both reviewed PowerPoint decks are stored separately under `../docs/requirements/`. The technical deck retains its original notes and embedded comments.

No SharePoint files are included. The user requested that missing information be requested directly.

## GitHub source storage

At the user's request, the source ZIP, requirements decks, plans, inventory and QA screenshots are included in Git. The Blender source exceeds GitHub's regular individual-file size limit, so its repository copy is a lossless `.blend.gz` archive in the same folder. Decompression reproduces the original file byte for byte; the original local `.blend` is preserved and excluded from Git. Both large production source files and internal documents must still be excluded from any future public website deployment.
