"""Browser verification for the Shop page across A–H.

    python3 app/server.py --port 4174 --db /tmp/bcc-qa.sqlite3      # disposable QA database
    python3 design-tools/qa-shop/verify_shop.py http://127.0.0.1:4174 [out_dir]

Checks every direction at 1440, 768 and 390px against the live catalogue API: product data, filters, counts, sort,
URL state, refresh, Back/Forward, return from a product page, add to bag, unavailable and empty states, links,
keyboard behaviour, image loading, axe-core accessibility and horizontal overflow. Writes results.json.
"""
import asyncio
import json
import sys
import urllib.request
from pathlib import Path

from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:4174"
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else "/tmp/shop-qa")
OUT.mkdir(parents=True, exist_ok=True)
DESIGNS = "abcdefgh"
SIZES = [(1440, 900), (768, 1024), (390, 844)]
AXE = Path(__import__("os").environ.get("AXE_JS", "/tmp/axe.min.js"))
FMT = {"Capsules": "capsules", "Softgels": "softgels", "Chewable tablets": "chews"}

try:
    catalog = json.load(urllib.request.urlopen(BASE + "/api/catalog"))["products"]
except Exception:  # the static Netlify preview serves its catalogue as a file
    catalog = json.load(urllib.request.urlopen(BASE + "/web/catalog-preview.json"))["products"]
published = [p for p in catalog if p["published"]]
results = {"pass": 0, "fail": 0, "failures": [], "notes": []}


def check(ok, label):
    if ok:
        results["pass"] += 1
    else:
        results["fail"] += 1
        results["failures"].append(label)
        print("FAIL", label)


async def state(pg):
    return await pg.evaluate("""() => ({
      visible: [...document.querySelectorAll('[data-sp-item]')].filter(e => !e.hidden).map(e => e.dataset.spItem),
      order: [...document.querySelectorAll('[data-sp-item]')].map(e => e.dataset.spItem),
      count: document.querySelector('[data-sp-count]').textContent,
      chips: [...document.querySelectorAll('[data-sp-chips] button')].map(b => b.textContent),
      pressed: [...document.querySelectorAll('[data-sp-format]')].filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.dataset.spFormat),
      counts: Object.fromEntries([...document.querySelectorAll('[data-sp-format]')].map(b => [b.dataset.spFormat, +b.querySelector('.sp-n').textContent])),
      stock: document.querySelector('[data-sp-stock]').checked,
      sort: document.querySelector('[data-sp-sort]').value,
      empty: !document.querySelector('[data-sp-empty]').hidden,
      url: location.pathname + location.search,
      y: Math.round(scrollY),
    })""")


def expect_visible(formats, stock):
    return [p["id"] for p in published if (not formats or FMT[fmt_of(p)] in formats) and (not stock or p["stock"] > 0)]


FORMAT_OF = {}


def fmt_of(p):
    return FORMAT_OF[p["id"]]


async def run_design(browser, d, axe_src):
    tag = f"[{d}]"
    for w, h in SIZES:
        ctx = await browser.new_context(viewport={"width": w, "height": h}, bypass_csp=True)
        pg = await ctx.new_page()
        errors = []
        pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errors.append(str(e)))
        await pg.goto(f"{BASE}/shop?design={d}", wait_until="networkidle")
        t = f"{tag}{w}"
        # Structure
        info = await pg.evaluate("""() => {
          const root = document.querySelector('[data-sp]');
          const order = [...root.children].map(e => e.className.split(' ')[0]);
          return { h1: document.querySelectorAll('#main h1').length, design: root.dataset.spDesign, rootClass: root.className, order,
            firstCardTop: Math.round(document.querySelector('[data-sp-item]:not([hidden])').getBoundingClientRect().top + scrollY),
            overflow: document.scrollingElement.scrollWidth - innerWidth,
            cards: [...document.querySelectorAll('[data-sp-item]')].map(c => ({ id: c.dataset.spItem,
              name: c.querySelector('.sp-name a').textContent, href: c.querySelector('.sp-name a').getAttribute('href'),
              media: c.querySelector('.sp-media').getAttribute('href'), mediaTab: c.querySelector('.sp-media').tabIndex,
              sub: c.querySelector('.sp-sub').textContent, format: c.querySelector('.sp-format').textContent,
              price: c.querySelector('.sp-price strong').textContent, avail: c.querySelector('.sp-avail').textContent,
              rating: c.querySelector('.sp-rating').textContent, pack: c.querySelector('.sp-facts .is-pending').textContent,
              add: c.querySelector('[data-sp-add]').disabled, view: c.querySelector('.sp-view').getAttribute('href'),
              nameSize: parseFloat(getComputedStyle(c.querySelector('.sp-name')).fontSize), priceSize: parseFloat(getComputedStyle(c.querySelector('.sp-price strong')).fontSize),
              addVisible: c.querySelector('[data-sp-add]').getBoundingClientRect().width > 40,
              addH: c.querySelector('[data-sp-add]').getBoundingClientRect().height })),
            links: [...root.querySelectorAll('a')].map(a => a.getAttribute('href')),
            title: document.title }; }""")
        check(info["h1"] == 1, f"{t} one h1")
        check(info["design"] == d and f"sp-{d}" in info["rootClass"], f"{t} design root")
        check(info["order"][:6] == ["sp-intro", "sp-bar", "sp-state", "sp-collection", "sp-sec", "sp-sec"], f"{t} section order {info['order']}")
        check(info["overflow"] <= 0, f"{t} no horizontal overflow ({info['overflow']})")
        check(info["firstCardTop"] < (h * 1.05 if w > 500 else h * 1.25), f"{t} products near the top ({info['firstCardTop']}px)")
        check(len(info["cards"]) == len(published), f"{t} all published products")
        by = {c["id"]: c for c in info["cards"]}
        for p in published:
            c = by.get(p["id"])
            if not c:
                check(False, f"{t} card {p['id']}")
                continue
            ok = (c["name"] == p["name"] and c["sub"] == p["subtitle"] and c["href"].startswith(f"/products/{p['id']}?design={d}")
                  and c["media"].startswith(f"/products/{p['id']}") and c["mediaTab"] == -1 and c["view"].startswith(f"/products/{p['id']}")
                  and c["price"] == "₹" + f"{p['price']:,}" and c["pack"] == "Awaiting approved label")
            check(ok, f"{t} {p['id']} facts {c}")
            avail = p["stock"] > 0
            check(c["add"] == (not avail) and (("In stock" in c["avail"]) == avail), f"{t} {p['id']} availability")
            r = p.get("rating") or {}
            if r.get("count"):
                check(f"{float(r['average']):.1f}" in c["rating"] and f"{r['count']} review" in c["rating"], f"{t} {p['id']} rating {c['rating']}")
            else:
                check(c["rating"] == "No reviews yet", f"{t} {p['id']} no rating shown")
            check(c["nameSize"] >= 14 and c["priceSize"] >= 16 and c["addVisible"] and c["addH"] >= 40, f"{t} {p['id']} readable + target size")
            FORMAT_OF[p["id"]] = c["format"]
        for href in ["/standards", "/reports", "/standards#lot", "/help", "/contact", "/policies/shipping", "/policies/returns", "/learn/reading-a-label", "/learn/ingredient-forms"]:
            norm = [l.split("?")[0].split("#")[0] + ("#" + l.split("#")[1] if "#" in l else "") for l in info["links"]]
            check(href in norm, f"{t} link {href}")
        check(all(("design=" + d) in l for l in info["links"] if l.startswith("/") and not l.startswith("/web")), f"{t} links keep design")
        check(info["title"].startswith("Shop all seven") or info["title"].split(" — ")[0] != "", f"{t} title")
        # Images: scroll through, then every pack image has loaded
        await pg.evaluate("async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); } scrollTo(0, 0); }")
        await pg.wait_for_timeout(500)
        imgs = await pg.evaluate("[...document.querySelectorAll('.sp-plate img')].map(i => [i.getAttribute('src'), i.complete && i.naturalWidth > 0])")
        check(all(ok for _, ok in imgs) and len(imgs) == len(published), f"{t} images load {imgs}")
        # Screenshots
        await pg.screenshot(path=str(OUT / f"{d}-{w}-fold.jpg"), quality=70)
        if w in (1440, 390):
            await pg.screenshot(path=str(OUT / f"{d}-{w}-full.jpg"), full_page=True, quality=60)
        # axe
        if axe_src and w in (1440, 390):
            await pg.add_script_tag(content=axe_src)
            ax = await pg.evaluate("async () => (await axe.run(document.querySelector('[data-sp]'), { runOnly: ['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice'] })).violations.map(v => v.id + ':' + v.nodes.length + ':' + v.nodes.slice(0,2).map(n=>n.target.join(' ')).join('|'))")
            ax = [v for v in ax if not v.startswith("region:")]
            check(not ax, f"{t} axe {ax}")
        if w == 1440:
            await interactions(pg, d, t)
        if w == 390:
            await phone_interactions(pg, d, t)
        bad = [e for e in errors if "favicon" not in e]
        check(not bad, f"{t} console errors {bad}")
        await ctx.close()


async def interactions(pg, d, t):
    # Filtering: OR within format, AND with stock, faceted counts, chips, clear
    await pg.click('[data-sp-format="capsules"]')
    s = await state(pg)
    exp = expect_visible(["capsules"], False)
    check(sorted(s["visible"]) == sorted(exp) and "format=capsules" in s["url"] and f"design={d}" in s["url"], f"{t} capsules filter {s}")
    check(s["count"].startswith(f"Showing {len(exp)} of {len(published)}") and s["chips"] and "Capsules" in s["chips"][0] and s["pressed"] == ["capsules"], f"{t} capsules state {s}")
    await pg.click('[data-sp-format="softgels"]')
    s = await state(pg)
    exp = expect_visible(["capsules", "softgels"], False)
    check(sorted(s["visible"]) == sorted(exp) and "format=capsules,softgels" in s["url"], f"{t} OR within format {s}")
    await pg.click('label.sp-stock')
    s = await state(pg)
    exp = expect_visible(["capsules", "softgels"], True)
    check(sorted(s["visible"]) == sorted(exp) and "stock=in" in s["url"] and s["stock"], f"{t} AND with stock {s}")
    check(s["counts"]["capsules"] == len(expect_visible(["capsules"], True)) and s["counts"]["all"] == len(expect_visible([], True)), f"{t} faceted counts {s['counts']}")
    # Sort
    await pg.select_option("[data-sp-sort]", "price-asc")
    s = await state(pg)
    vis = [x for x in s["order"] if x in s["visible"]]
    prices = {p["id"]: p["price"] for p in published}
    check([prices[x] for x in vis] == sorted(prices[x] for x in vis) and "sort=price-asc" in s["url"], f"{t} price asc")
    check("sorted price: low to high" in s["count"], f"{t} sort announced {s['count']}")
    await pg.select_option("[data-sp-sort]", "price-desc")
    s = await state(pg)
    vis = [x for x in s["order"] if x in s["visible"]]
    check([prices[x] for x in vis] == sorted((prices[x] for x in vis), reverse=True), f"{t} price desc")
    await pg.select_option("[data-sp-sort]", "name")
    s = await state(pg)
    names = {p["id"]: p["name"] for p in published}
    check([names[x] for x in s["order"]] == sorted(names.values()), f"{t} name A-Z")
    # Refresh keeps state
    before = await state(pg)
    await pg.reload(wait_until="networkidle")
    after = await state(pg)
    check(before["visible"] == after["visible"] and before["sort"] == after["sort"] and before["url"] == after["url"], f"{t} refresh restores state")
    # Back / Forward through in-place states
    await pg.go_back()
    await pg.wait_for_timeout(200)
    s = await state(pg)
    check(s["sort"] == "price-desc" and "sort=price-desc" in s["url"], f"{t} back restores sort {s['url']}")
    await pg.go_back()
    await pg.wait_for_timeout(200)
    s = await state(pg)
    check(s["sort"] == "price-asc", f"{t} back again {s['url']}")
    await pg.go_forward()
    await pg.wait_for_timeout(200)
    s = await state(pg)
    check(s["sort"] == "price-desc", f"{t} forward {s['url']}")
    # Remove a chip, then clear all
    await pg.click('[data-sp-remove="stock"]')
    s = await state(pg)
    check(not s["stock"] and "stock=in" not in s["url"], f"{t} chip removes filter")
    focus = await pg.evaluate("document.activeElement.closest('[data-sp]') !== null && document.activeElement.tagName")
    check(focus == "BUTTON", f"{t} focus kept after chip removal ({focus})")
    await pg.click(".sp-state [data-sp-clear]")
    s = await state(pg)
    check(len(s["visible"]) == len(published) and s["url"] == f"/shop?design={d}" and not s["chips"] and s["sort"] == "recommended", f"{t} clear all {s['url']}")
    check(s["order"] == [p["id"] for p in published], f"{t} recommended = catalogue order")
    # Return from a product page keeps filters, sort and scroll
    await pg.click('[data-sp-format="softgels"]')
    await pg.select_option("[data-sp-sort]", "price-desc")
    target = (await state(pg))["visible"][-1]
    await pg.evaluate(f"document.querySelector('[data-sp-item=\"{target}\"]').scrollIntoView({{block:'center', behavior:'instant'}})")
    await pg.wait_for_timeout(400)
    rect = "Math.round(document.querySelector('[data-sp-item=\"" + target + "\"]').getBoundingClientRect().top)"
    y0 = await pg.evaluate(rect)
    url0 = (await state(pg))["url"]
    await pg.click(f'[data-sp-item="{target}"] .sp-name a')
    await pg.wait_for_url(f"**/products/{target}**")
    await pg.wait_for_timeout(500)
    check(await pg.evaluate("!!document.querySelector('[data-pp]')"), f"{t} product page opens for {target}")
    await pg.go_back()
    await pg.wait_for_timeout(900)
    s = await state(pg)
    check(s["url"] == url0 and s["sort"] == "price-desc" and s["pressed"] == ["softgels"], f"{t} return keeps filters {s['url']}")
    y1 = await pg.evaluate(rect)
    check(abs(y1 - y0) < 40 and s["y"] > 0, f"{t} return keeps place (card top {y0} → {y1}, scrollY {s['y']})")
    # Image link opens the right product too
    await pg.click(f'[data-sp-item="{target}"] .sp-media')
    await pg.wait_for_url(f"**/products/{target}**")
    await pg.go_back()
    await pg.wait_for_timeout(600)
    # Add to bag: loading, success, count, duplicate protection
    await pg.goto(f"{BASE}/shop?design={d}", wait_until="networkidle")
    await pg.evaluate("localStorage.setItem('bcc-cart','[]')")
    await pg.reload(wait_until="networkidle")
    first = next(p for p in published if p["stock"] > 2)
    btn = f'[data-sp-add="{first["id"]}"]'
    await pg.evaluate(f"document.querySelector('{btn}').scrollIntoView({{block:'center', behavior:'instant'}})")
    await pg.wait_for_timeout(200)
    y_before = await pg.evaluate("scrollY")
    await pg.click(btn)
    busy = await pg.evaluate(f"document.querySelector('{btn}').textContent")
    await pg.click(btn, force=True)  # an accidental second click while busy
    await pg.wait_for_timeout(500)
    res = await pg.evaluate(f"""() => ({{ label: document.querySelector('{btn}').textContent, msg: document.querySelector('#sp-msg-{first["id"]}').textContent,
       cart: JSON.parse(localStorage.getItem('bcc-cart')), count: [...document.querySelectorAll('[data-cart-count]')].map(x => x.textContent),
       announce: document.querySelector('[data-sp-announce]').textContent, path: location.pathname, y: scrollY }})""")
    check("Adding" in busy, f"{t} loading state ({busy})")
    check([{k: x[k] for k in ("id", "quantity")} for x in res["cart"]] == [{"id": first["id"], "quantity": 1}], f"{t} one add despite double click {res['cart']}")
    check(res["count"] and all(c == "1" for c in res["count"]), f"{t} bag count updated {res['count']}")
    check("Added" in res["label"] and "Added to your bag" in res["msg"] and first["name"] in res["announce"], f"{t} success state {res}")
    check(res["path"] == "/shop" and abs(res["y"] - y_before) < 5, f"{t} stays in place after add")
    await pg.wait_for_timeout(1300)
    await pg.click(btn)
    await pg.wait_for_timeout(500)
    cart = await pg.evaluate("JSON.parse(localStorage.getItem('bcc-cart'))")
    check([{k: x[k] for k in ("id", "quantity")} for x in cart] == [{"id": first["id"], "quantity": 2}], f"{t} second deliberate add {cart}")
    # Quantity limit error
    await pg.evaluate(f"localStorage.setItem('bcc-cart', JSON.stringify([{{id:'{first['id']}', quantity:10}}]))")
    await pg.reload(wait_until="networkidle")
    await pg.click(btn)
    await pg.wait_for_timeout(500)
    err = await pg.evaluate(f"[document.querySelector('#sp-msg-{first['id']}').dataset.kind, document.querySelector('#sp-msg-{first['id']}').textContent]")
    check(err[0] == "error" and "stock" in err[1], f"{t} limit error {err}")
    await pg.evaluate("localStorage.setItem('bcc-cart','[]')")
    # No results + reset
    await pg.goto(f"{BASE}/shop?format=gummies&design={d}", wait_until="networkidle")
    s = await state(pg)
    check(s["empty"] and not s["visible"] and any("not in this range" in c for c in s["chips"]), f"{t} no-results state")
    await pg.click("[data-sp-empty] [data-sp-clear]")
    s = await state(pg)
    check(not s["empty"] and len(s["visible"]) == len(published), f"{t} no-results reset")
    # Legacy URL
    await pg.goto(f"{BASE}/shop?format=Chewable%20tablets&sort=catalogue&design={d}", wait_until="networkidle")
    s = await state(pg)
    check(s["pressed"] == ["chews"] and sorted(s["visible"]) == sorted(expect_visible(["chews"], False)), f"{t} legacy format link")
    # Keyboard: Tab reaches the format controls; Space toggles; media links are not tab stops
    await pg.goto(f"{BASE}/shop?design={d}", wait_until="networkidle")
    await pg.focus('[data-sp-format="all"]')
    await pg.keyboard.press("Tab")
    await pg.keyboard.press("Space")
    s = await state(pg)
    check(s["pressed"] == ["capsules"], f"{t} keyboard toggles format {s['pressed']}")
    ring = await pg.evaluate("(() => { const e = document.activeElement, c = getComputedStyle(e); return c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) >= 2; })()")
    check(ring, f"{t} visible focus ring")
    seq = []
    await pg.focus("[data-sp-sort]")
    for _ in range(8):
        await pg.keyboard.press("Tab")
        seq.append(await pg.evaluate("(document.activeElement.className||'') + '|' + (document.activeElement.getAttribute('href')||document.activeElement.dataset.spAdd||'')"))
    check(not any("sp-media" in x for x in seq) and any("sp-view" in x or "sp-add" in x for x in seq), f"{t} tab order {seq}")


async def phone_interactions(pg, d, t):
    await pg.click('[data-sp-format="chews"]')
    s = await state(pg)
    check(sorted(s["visible"]) == sorted(expect_visible(["chews"], False)), f"{t} phone filter")
    info = await pg.evaluate("""() => { const c = document.querySelector('[data-sp-item]:not([hidden])'); const r = c.getBoundingClientRect();
      const add = c.querySelector('[data-sp-add]').getBoundingClientRect(), price = c.querySelector('.sp-price').getBoundingClientRect();
      return { overflow: document.scrollingElement.scrollWidth - innerWidth, cardH: r.height, addIn: add.right <= innerWidth && add.left >= 0, priceIn: price.right <= innerWidth }; }""")
    check(info["overflow"] <= 0 and info["addIn"] and info["priceIn"], f"{t} phone layout {info}")
    check(info["cardH"] < 560, f"{t} phone card compact ({info['cardH']:.0f}px)")
    await pg.screenshot(path=str(OUT / f"{d}-390-filtered.jpg"), quality=70)


async def main():
    axe_src = AXE.read_text() if AXE.exists() else ""
    if not axe_src:
        results["notes"].append("axe-core not found at /tmp/axe.min.js; accessibility scan skipped")
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for d in DESIGNS:
            await run_design(browser, d, axe_src)
            print(d, "done", results["pass"], results["fail"])
        # Reduced motion: no transitions on cards
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
        pg = await ctx.new_page()
        await pg.goto(f"{BASE}/shop?design=e", wait_until="networkidle")
        tr = await pg.evaluate("getComputedStyle(document.querySelector('.sp-plate img')).transitionDuration")
        check(tr in ("0s", "0s, 0s"), f"reduced motion transitions off ({tr})")
        await ctx.close()
        await browser.close()
    (OUT / "results.json").write_text(json.dumps(results, indent=1))
    print(json.dumps({k: results[k] for k in ("pass", "fail")}), "\n".join(results["failures"][:60]))


asyncio.run(main())
