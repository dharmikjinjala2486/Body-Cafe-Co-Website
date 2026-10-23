"""Screenshot /story in every direction at desktop, tablet and phone widths. Usage: shots.py BASE OUTDIR [designs] [widths]"""
import sys, os
from playwright.sync_api import sync_playwright
base, out = sys.argv[1], sys.argv[2]
designs = sys.argv[3] if len(sys.argv) > 3 else "abcdefgh"
widths = [int(w) for w in (sys.argv[4] if len(sys.argv) > 4 else "1440,390").split(",")]
os.makedirs(out, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    for d in designs:
        for w in widths:
            pg = b.new_page(viewport={"width": w, "height": 900})
            errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.goto(f"{base}/story?design={d}", wait_until="networkidle")
            pg.wait_for_timeout(500)
            pg.evaluate("document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager')")
            pg.evaluate("Promise.all([...document.images].map(i=>i.decode().catch(()=>0)))")
            pg.wait_for_timeout(900)
            sw = pg.evaluate("document.documentElement.scrollWidth")
            pg.screenshot(path=f"{out}/story-{d}-{w}.jpg", full_page=True, type="jpeg", quality=60)
            print(d, w, "scrollWidth", sw, "errors", errs)
            pg.close()
    b.close()
