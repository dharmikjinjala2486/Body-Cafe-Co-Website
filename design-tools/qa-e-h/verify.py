import sys, asyncio, json
from playwright.async_api import async_playwright
designs = sys.argv[1].split(",") if len(sys.argv) > 1 else ["e", "f", "g", "h"]
widths = [int(w) for w in (sys.argv[2] if len(sys.argv) > 2 else "320,390,768,1100,1440").split(",")]
BASE = "http://127.0.0.1:4174"
CORE = ["/", "/shop", "/shop?sort=price-desc", "/shop?view=list", "/bundles", "/standards", "/about", "/story", "/learn",
        "/learn/reading-a-label", "/learn/understanding-reports", "/learn/ingredient-forms", "/learn/iron-bisglycinate",
        "/reports", "/cart", "/checkout", "/account", "/help", "/contact", "/settings", "/search", "/preview/states",
        "/policies/shipping", "/policies/returns", "/policies/cancellation", "/policies/privacy", "/policies/terms", "/nope", "/products/nope"]
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    ctx = await b.new_context(viewport={"width": 1440, "height": 900})
    pg = await ctx.new_page()
    await pg.goto(BASE + "/?design=e", wait_until="networkidle")
    extra = await pg.evaluate("() => [].concat(...BCCSite.states.map(s => s[1].map(x => x[0]))).concat((window.__ids = BCCSite) && [])")
    ids = await pg.evaluate("async () => (await (await fetch('/api/catalog')).json()).products?.map(p=>p.id) || []")
    if not ids: ids = ["iron-bisglycinate","l-theanine","vitamin-d3-k2","omega-3-fish-oil","myo-d-chiro-inositol","creatine-chews","psyllium-husk"]
    bundles = await pg.evaluate("async () => { try { const r = await (await fetch('/api/catalog')).json(); return (r.bundles||[]).map(b=>b.id); } catch(e) { return []; } }")
    routes = CORE + ["/products/" + i for i in ids] + ["/bundles/" + x for x in bundles] + extra + ["/search?q=iron"]
    await ctx.close()
    bad = 0
    for d in designs:
      for w in widths:
        c = await b.new_context(viewport={"width": w, "height": 900})
        pg = await c.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append("PAGEERROR " + str(e)))
        pg.on("console", lambda m: errs.append("CONSOLE " + m.text) if m.type == "error" else None)
        for r in routes:
          errs.clear()
          sep = "&" if "?" in r else "?"
          await pg.goto(f"{BASE}{r}{sep}design={d}", wait_until="networkidle")
          await pg.wait_for_timeout(120)
          info = await pg.evaluate("""() => ({ ov: document.documentElement.scrollWidth - innerWidth, h1: document.querySelectorAll('main h1').length, eh: !!document.querySelector('.eh-' + document.body.dataset.theme), wide: [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 1 && getComputedStyle(e).position !== 'fixed' && !e.closest('[style*="overflow"], .g-strip, .h-plate ol, .f-ask-tabs, .x-mnav') }).slice(0,3).map(e => e.className || e.tagName) })""")
          problems = []
          if info["ov"] > 0: problems.append(f"overflow {info['ov']} {info['wide']}")
          if info["h1"] != 1: problems.append(f"h1={info['h1']}")
          if not info["eh"]: problems.append("no eh wrapper")
          for e in errs:
            if "404" in e and ("/products/nope" in r or "/nope" in r): continue
            problems.append(e[:200])
          if problems:
            bad += 1
            print(d, w, r, "|", "; ".join(problems))
        await c.close()
      print("done", d, flush=True)
    print("routes", len(routes), "problems", bad)
    await b.close()
asyncio.run(main())
