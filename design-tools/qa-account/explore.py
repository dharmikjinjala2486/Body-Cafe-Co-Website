"""Walk the main journey once per design and screenshot each page. Usage: explore.py BASE OUT designs widths"""
import sys, os, re
from playwright.sync_api import sync_playwright
BASE, OUT = sys.argv[1], sys.argv[2]
DESIGNS = sys.argv[3] if len(sys.argv) > 3 else "a"
WIDTHS = [int(x) for x in (sys.argv[4] if len(sys.argv) > 4 else "1440").split(",")]
os.makedirs(OUT, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    for d in DESIGNS:
        for w in WIDTHS:
            ctx = b.new_context(viewport={"width": w, "height": 900})
            pg = ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            def shot(name):
                pg.wait_for_timeout(500)
                pg.screenshot(path=f"{OUT}/{d}-{w}-{name}.jpg", full_page=True, type="jpeg", quality=55)
            pg.goto(f"{BASE}/shop?design={d}", wait_until="networkidle")
            pg.evaluate("localStorage.setItem('bcc-cart', JSON.stringify([{id:'l-theanine',quantity:2,price:899},{id:'omega-3-fish-oil',quantity:1,price:1199}]))")
            pg.goto(f"{BASE}/cart?design={d}", wait_until="networkidle"); pg.wait_for_timeout(800); shot("cart")
            pg.click("[data-bg-remove='omega-3-fish-oil']"); pg.wait_for_timeout(600); shot("cart-undo")
            pg.goto(f"{BASE}/sign-in?next=/checkout&design={d}", wait_until="networkidle"); shot("signin")
            pg.fill("#ac-mobile", str(9300000000 + DESIGNS.index(d) * 10 + WIDTHS.index(w) + int(os.environ.get("QA_OFFSET", "0")))); pg.click("[data-ac-mobile] button[type=submit]"); pg.wait_for_timeout(700); shot("signin-code")
            code = re.search(r"(\d{6})", pg.inner_text("[data-ac-preview]")).group(1)
            pg.fill("#ac-code", code); pg.click("[data-ac-code] button[type=submit]"); pg.wait_for_timeout(1500); shot("checkout")
            print(d, w, "after signin url", pg.url)
            for k, v in {"name": "Preview Customer", "pincode": "395001", "address": "123 Sample Street", "city": "Surat", "state": "Gujarat"}.items():
                if pg.locator(f"#checkout-form [name={k}]").count(): pg.fill(f"#checkout-form [name={k}]", v)
            pg.check("#checkout-form [name=adult]")
            pg.click("#checkout-form button[type=submit]"); pg.wait_for_timeout(1500); shot("payment")
            pg.click("[data-ac-pay=uncertain]"); pg.wait_for_timeout(1000); shot("payment-uncertain")
            pg.click("[data-ac-reconcile=success]"); pg.wait_for_timeout(1000); shot("payment-paid")
            pg.click("a.ac-btn"); pg.wait_for_timeout(1200); shot("order")
            for tab in ["", "/orders", "/addresses", "/support", "/reviews", "/profile", "/preferences"]:
                pg.goto(f"{BASE}/account{tab}?design={d}", wait_until="networkidle"); shot("account" + tab.replace("/", "-"))
            print(d, w, "errors", errs[:3])
            ctx.close()
    b.close()
