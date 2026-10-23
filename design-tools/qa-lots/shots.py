"""Screenshot lot-report states. Usage: shots.py BASE OUTDIR [designs] [widths] [paths]"""
import sys, os
from playwright.sync_api import sync_playwright
base, out = sys.argv[1], sys.argv[2]
designs = sys.argv[3] if len(sys.argv) > 3 else "abcdefgh"
widths = [int(w) for w in (sys.argv[4] if len(sys.argv) > 4 else "1440,390").split(",")]
paths = (sys.argv[5] if len(sys.argv) > 5 else "/reports/iron-bisglycinate/DEMO-01-01").split(",")
os.makedirs(out, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    for d in designs:
        for w in widths:
            for k, path in enumerate(paths):
                pg = b.new_page(viewport={"width": w, "height": 900})
                errs = []
                pg.on("pageerror", lambda e: errs.append(str(e)))
                pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
                pg.goto(f"{base}{path}{'&' if '?' in path else '?'}design={d}", wait_until="networkidle")
                pg.wait_for_timeout(900)
                pg.evaluate("window.scrollTo(0,0)")
                sw = pg.evaluate("document.documentElement.scrollWidth")
                pg.screenshot(path=f"{out}/lots-{d}-{w}-{k}.jpg", full_page=True, type="jpeg", quality=60)
                print(d, w, path, "scrollWidth", sw, "errors", errs[:3])
                pg.close()
    b.close()
