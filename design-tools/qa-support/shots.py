"""Screenshot the support pages and states once per design. Usage: shots.py BASE OUT [designs] [widths]
Creates cases and orders: use a disposable database."""
import json, os, re, sys
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(__file__))
ARGV = sys.argv[:]
sys.argv = ARGV[:2]  # verify_support reads only the server address from here
from verify_support import admin, browser_api, order_in_browser  # noqa: E402  (shares the QA helpers)
sys.argv = ARGV

BASE, OUT = sys.argv[1].rstrip("/"), sys.argv[2]
DESIGNS = sys.argv[3] if len(sys.argv) > 3 else "abcdefgh"
WIDTHS = [int(x) for x in (sys.argv[4] if len(sys.argv) > 4 else "1440,390").split(",")]
os.makedirs(OUT, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    for d in DESIGNS:
        for w in WIDTHS:
            ctx = b.new_context(viewport={"width": w, "height": 900}, reduced_motion="reduce")
            pg = ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
            def shot(name, full=True):
                pg.wait_for_timeout(250); pg.screenshot(path=f"{OUT}/{d}-{w}-{name}.jpg", full_page=full, type="jpeg", quality=55)
            def go(path):
                pg.goto(f"{BASE}{path}{'&' if '?' in path else '?'}design={d}", wait_until="networkidle")
            go("/help"); shot("help")
            go("/help?q=refund"); shot("help-search", full=False)
            go("/help/delivery/parcel-problem"); shot("article")
            go("/contact?kind=delivery&from=parcel-problem"); shot("contact")
            pg.click("[data-su-submit]"); shot("contact-errors", full=False)
            pg.fill("#su-name", "Preview Customer"); pg.fill("#su-mobile", "9876543210")
            pg.fill("#su-message", "The parcel arrived with a crushed corner and one tub open.")
            pg.click("[data-su-submit]"); pg.wait_for_selector("[data-su-done]:not([hidden])"); shot("contact-done")
            pg.click("[data-su-done] a.su-btn"); pg.wait_for_load_state("networkidle"); shot("case")
            for k in ["shipping", "returns", "cancellation", "privacy", "terms"]:
                go(f"/policies/{k}"); shot(f"policy-{k}", full=(k == "returns"))
            go("/settings"); shot("settings")
            oid = order_in_browser(pg)
            go(f"/orders/{oid}"); pg.click("[data-ac-cancel]"); pg.wait_for_selector("[data-ac-cancel-confirm]")
            pg.locator("[data-ac-cancel-panel]").scroll_into_view_if_needed(); shot("order-cancel-check", full=False)
            oid = order_in_browser(pg, deliver=True)
            go(f"/orders/{oid}"); pg.click("[data-ac-problem]"); pg.locator("[data-ac-return]").scroll_into_view_if_needed(); shot("order-problem-form", full=False)
            print(d, w, errs)
            ctx.close()
    b.close()
