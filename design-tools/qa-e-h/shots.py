import sys, asyncio, os
from playwright.async_api import async_playwright
BASE = "http://127.0.0.1:4174"
OUT = sys.argv[1]
designs = sys.argv[2].split(",")
ROUTES = [
  ("01-home", "/"), ("02-shop", "/shop"), ("03-shop-filtered", "/shop?format=Softgels&sort=price-desc"), ("04-product", "/products/vitamin-d3-k2"),
  ("05-product-2", "/products/creatine-chews"), ("06-standards", "/standards"), ("07-about", "/about"), ("08-story", "/story"),
  ("09-learn", "/learn"), ("10-guide", "/learn/reading-a-label"), ("11-ingredient-note", "/learn/omega-3-fish-oil"),
  ("12-reports-match", "/reports?product=vitamin-d3-k2&lot=DEMO-03-01"), ("13-reports-nomatch", "/reports?product=vitamin-d3-k2&lot=UNKNOWN"),
  ("14-search", "/search?q=omega"), ("15-cart", "/cart"), ("16-checkout", "/checkout?state=sample"), ("17-payment", "/payment/SAMPLE-1042?state=pending"),
  ("18-order", "/orders/SAMPLE-1042?state=shipped"), ("19-account", "/account?state=orders"), ("20-help", "/help"), ("21-contact", "/contact"),
  ("22-policy", "/policies/returns"), ("23-not-found", "/nope"),
]
async def main():
  os.makedirs(OUT, exist_ok=True)
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    for d in designs:
      for w, tag in [(1440, "desktop"), (390, "mobile")]:
        c = await b.new_context(viewport={"width": w, "height": 900 if w > 500 else 844}, device_scale_factor=1 if w > 500 else 2)
        pg = await c.new_page()
        for name, r in ROUTES:
          if name == "15-cart":
            await pg.goto(f"{BASE}/products/l-theanine?design={d}", wait_until="networkidle")
            await pg.locator("[data-action=add-product]").click(); await pg.wait_for_timeout(300)
            await pg.goto(f"{BASE}/products/omega-3-fish-oil?design={d}", wait_until="networkidle")
            await pg.locator("[data-action=add-product]").click(); await pg.wait_for_timeout(300)
          sep = "&" if "?" in r else "?"
          await pg.goto(f"{BASE}{r}{sep}design={d}", wait_until="networkidle")
          await pg.wait_for_timeout(300)
          await pg.evaluate("""async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); } scrollTo(0, 0); }""")
          await pg.wait_for_timeout(700)
          await pg.screenshot(path=f"{OUT}/{d}/{tag}/{name}.jpg", full_page=True, type="jpeg", quality=72) if os.makedirs(f"{OUT}/{d}/{tag}", exist_ok=True) is None else None
        if w < 1000:
          await pg.goto(f"{BASE}/?design={d}", wait_until="networkidle")
          await pg.locator("[data-action=menu]").click(); await pg.wait_for_timeout(400)
          await pg.screenshot(path=f"{OUT}/{d}/{tag}/24-menu-open.jpg", type="jpeg", quality=72)
        else:
          await pg.goto(f"{BASE}/?design={d}", wait_until="networkidle")
          await pg.locator("[data-action=search]").first.click(); await pg.wait_for_timeout(400)
          await pg.screenshot(path=f"{OUT}/{d}/{tag}/24-search-dialog.jpg", type="jpeg", quality=72)
        await c.close()
      print("done", d, flush=True)
    await b.close()
asyncio.run(main())
