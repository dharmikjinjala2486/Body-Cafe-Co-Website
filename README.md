# Body Café Co. Website

Two responsive design concepts using the supplied brand assets and seven product mockups.

## Local preview

From this folder, run:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173/concepts/?concept=a` for Warm editorial or `http://127.0.0.1:4173/concepts/?concept=b` for Expressive everyday. The toolbar switches between both concepts.

## Scope

The preview includes homepage layouts, all seven products, a product overview that updates when a product is selected, mobile navigation, ingredient accordions and an illustrative lot-report form. It is not a live shop. Prices, full formulations, serving details and approved reports remain pending. No payment or customer data is collected.

Original supplied assets live under `assets/`; optimized preview images live under `concepts/media/`. The repository includes the original mockup ZIP, requirements decks, plans, asset inventory and QA screenshots. No SharePoint documents were used. Operating-system metadata, dependencies and environment secrets are excluded.

The Blender source is stored losslessly as `assets/source/blender/BCC_Final_Varient_1_Garden_SpotUV_Corrected.blend.gz` to fit GitHub's individual-file size limit. The original `.blend` remains untouched locally. After cloning, restore it with:

```sh
gunzip -k assets/source/blender/BCC_Final_Varient_1_Garden_SpotUV_Corrected.blend.gz
```

The current local branch is `design/concepts`, based on `origin/main` from `https://github.com/dharmikjinjala2486/Body-Cafe-Co-Website.git`.
