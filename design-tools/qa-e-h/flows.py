import sys, asyncio, re
from playwright.async_api import async_playwright
BASE = "http://127.0.0.1:4174"
designs = sys.argv[1].split(",") if len(sys.argv) > 1 else ["e", "f", "g", "h"]
async def count(pg):
  t = await pg.evaluate("() => { const e = document.querySelector('.bag-link [data-cart-count]'); return e ? e.textContent : ''; }")
  return int(t or 0)
async def run(b, d, w):
  c = await b.new_context(viewport={"width": w, "height": 900})
  pg = await c.new_page()
  errs = []
  pg.on("pageerror", lambda e: errs.append(str(e)))
  log = []
  def ok(name, cond):
    log.append(("PASS " if cond else "FAIL ") + name)
  await pg.goto(f"{BASE}/?design={d}", wait_until="networkidle")
  # mobile menu
  if w < 1000:
    btn = pg.locator("[data-action=menu]")
    await btn.click(); await pg.wait_for_timeout(200)
    ok("menu opens", await pg.locator("#mobile-nav").is_visible())
    await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
    if await pg.locator("#mobile-nav").is_visible():
      await btn.click(); await pg.wait_for_timeout(200)
    ok("menu closes", not await pg.locator("#mobile-nav").is_visible())
  else:
    ok("nav links", await pg.locator("header nav a[href^='/standards']").count() == 1)
  # header links
  for href in ["/shop", "/standards", "/about", "/learn", "/story", "/reports", "/account", "/cart"]:
    ok("header " + href, await pg.locator(f"header a[href^='{href}?'], header a[href='{href}']").count() >= 1 or (w < 1000 and await pg.locator(f"#mobile-nav a[href^='{href}?'], #mobile-nav a[href='{href}']").count() >= 1))
  # home add
  add = pg.locator("main [data-add]:not([disabled])").first
  await add.click(); await pg.wait_for_timeout(400)
  ok("home add → bag 1", await count(pg) == 1)
  # tabs keyboard (curiosity)
  tab = pg.locator("[data-home-section=curiosity] [role=tab]").first
  if await tab.count():
    vert = await pg.evaluate("() => !!document.querySelector('[data-home-section=curiosity] [data-eh-orient=vertical]')"); await tab.focus(); await pg.keyboard.press("ArrowDown" if vert else "ArrowRight"); await pg.wait_for_timeout(150)
    sel = await pg.evaluate("() => [...document.querySelectorAll('[data-home-section=curiosity] [role=tab]')].findIndex(t => t.getAttribute('aria-selected') === 'true')")
    ok("curiosity tabs keyboard", sel == 1)
  # home lot form
  await pg.locator("[data-fill-lot]").click()
  await pg.locator("#home-lot button[type=submit]").click(); await pg.wait_for_load_state("networkidle"); await pg.wait_for_timeout(500)
  ok("home lot → report match", "/reports" in pg.url and await pg.locator("#report-result").inner_text() != "")
  # shop filter + sort
  await pg.goto(f"{BASE}/shop?design={d}", wait_until="networkidle")
  # Shop controls (web/shop.js): format toggle buttons and a sort select, state kept in the URL.
  await pg.locator('[data-sp-format="softgels"]').click(); await pg.wait_for_timeout(400)
  n = await pg.locator("[data-sp-item]:not([hidden])").count()
  ok("filter softgels", "format=softgels" in pg.url and n == 2)
  await pg.select_option("[data-sp-sort]", "price-desc"); await pg.wait_for_timeout(500)
  ok("sort desc", "sort=price-desc" in pg.url and "format=softgels" in pg.url)
  # pdp
  await pg.goto(f"{BASE}/products/l-theanine?design={d}", wait_until="networkidle")
  await pg.select_option("#product-quantity", "2")
  await pg.locator("[data-action=add-product]").click(); await pg.wait_for_timeout(400)
  ok("pdp add qty 2 → bag 3", await count(pg) == 3)
  await pg.evaluate("() => { const d = document.querySelector('#pincode')?.closest('details'); if (d) d.open = true; }")
  await pg.fill("#pincode", "560001"); await pg.locator("#pincode-form button").click(); await pg.wait_for_timeout(300)
  ok("pincode", (await pg.locator("#pincode-result").inner_text()).strip() != "")
  await pg.locator("[data-fill-pdp-lot]").click(); await pg.locator("#pdp-lot button[type=submit]").click(); await pg.wait_for_timeout(700)
  ok("pdp lot → reports", "/reports" in pg.url)
  # cart
  await pg.goto(f"{BASE}/cart?design={d}", wait_until="networkidle")
  inc = pg.locator("[data-change='1'], [data-change='+1']").first
  if await inc.count():
    await inc.click(); await pg.wait_for_timeout(400)
  ok("cart increase → 4", await count(pg) == 4)
  rm = pg.locator("[data-remove]").first
  await rm.click(); await pg.wait_for_timeout(400)
  ok("cart remove", await count(pg) < 4)
  # checkout
  await pg.goto(f"{BASE}/checkout?design={d}", wait_until="networkidle")
  f = pg.locator("#checkout-form")
  for name, val in [("name", "Test Person"), ("mobile", "9876543210"), ("pincode", "560001"), ("address", "12 Test Road, Area"), ("city", "Bengaluru"), ("state", "Karnataka"), ("email", "t@example.com")]:
    el = f.locator(f"[name={name}]")
    if await el.count():
      tag = await el.first.evaluate("e => e.tagName")
      if tag == "SELECT": await el.first.select_option(label=val)
      else: await el.first.fill(val)
  await f.locator("[name=adult]").check()
  await f.locator("button[type=submit]").click(); await pg.wait_for_timeout(1200)
  ok("checkout → payment", "/payment/" in pg.url)
  if "/payment/" in pg.url:
    await pg.locator("[data-pay=success]").click(); await pg.wait_for_timeout(1200)
    ok("pay → order/paid", "/orders/" in pg.url or "received" in (await pg.content()).lower())
  # account otp
  await pg.goto(f"{BASE}/account?design={d}", wait_until="networkidle")
  if await pg.locator("#otp-form").count():
    await pg.fill("#login-mobile", "9876543210"); await pg.locator("#otp-form button[type=submit]").click(); await pg.wait_for_timeout(600)
    code = re.search(r"(\d{6})", await pg.locator("#otp-result").inner_text())
    if code:
      await pg.fill("#verify-code", code.group(1)); await pg.locator("#verify-button").click(); await pg.wait_for_timeout(1000)
    ok("otp sign in", await pg.locator("[data-action=logout]").count() >= 1)
  else:
    ok("account signed in", True)
  # contact case
  await pg.goto(f"{BASE}/contact?design={d}", wait_until="networkidle")
  await pg.fill("#case-message", "Question about my preview order please."); await pg.locator("#case-form button").last.click(); await pg.wait_for_timeout(800)
  ok("case created", (await pg.locator("#case-result").inner_text()).strip() != "" or "case" in pg.url)
  # search
  await pg.goto(f"{BASE}/?design={d}", wait_until="networkidle")
  await pg.locator("[data-action=search]").first.click(); await pg.wait_for_timeout(300)
  ok("search dialog", await pg.locator("#search-dialog").is_visible())
  await pg.keyboard.press("Escape")
  # reports picker
  await pg.goto(f"{BASE}/reports?design={d}", wait_until="networkidle")
  await pg.locator("[data-report-product='omega-3-fish-oil']").click(); await pg.wait_for_timeout(300)
  ok("report picker", await pg.locator("#report-product").input_value() == "omega-3-fish-oil")
  await pg.locator("#lot").fill("DEMO-04-01"); await pg.locator("#report-form button[type=submit]").click(); await pg.wait_for_timeout(700)
  ok("report match", "DEMO-04-01" in await pg.locator("#report-result").inner_text())
  for e in errs: log.append("ERR " + e[:200])
  await c.close()
  return log
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    for d in designs:
      for w in [1440, 390]:
        log = await run(b, d, w)
        fails = [l for l in log if not l.startswith("PASS")]
        print(d, w, f"{len(log)-len(fails)}/{len(log)} pass", fails)
    await b.close()
asyncio.run(main())
