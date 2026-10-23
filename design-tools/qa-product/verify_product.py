"""Product detail page QA for all eight directions and all seven products.

Usage:
    python3 app/server.py --port 4174 --db /tmp/bcc-clean.sqlite3      # clean QA database
    python3 app/server.py --port 4175 --db /tmp/bcc-seeded.sqlite3     # then: python3 design-tools/qa-product/seed_qa.py http://127.0.0.1:4175
    python3 design-tools/qa-product/verify_product.py [designs] [axe.min.js]

Clean server (4174), every direction × product × width (1440, 768, 390):
  structure and section order, one h1 naming the product, catalogue facts, images loaded with their proportions,
  no horizontal overflow, no page or console errors, related links to real products.
Per direction (one product, 1440 and 390): gallery thumbnails, arrows, keyboard, swipe count, full-screen viewer with
  zoom and focus return; quantity and Add to bag; pincode valid/invalid; prefilled lot lookup; mobile sticky bar;
  empty review state; review eligibility (guest → inline sign-in → no purchase); question submission; axe-core scan.
Seeded server (4175): published reviews, summary, filters, sorting, Load more, photo viewer, helpful, report.
End to end (4174): a real delivered order → review with a photo upload → moderation → publication on the page.
Stock: quarantining a product's lots shows it unavailable with Add to bag disabled.
"""
import asyncio
import http.client
import json
import sys
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from app import test_media_fixtures as fx  # noqa: E402

CLEAN, SEEDED = "http://127.0.0.1:4174", "http://127.0.0.1:4175"
DESIGNS = (sys.argv[1] if len(sys.argv) > 1 else "a,b,c,d,e,f,g,h").split(",")
AXE = sys.argv[2] if len(sys.argv) > 2 else None
PRODUCTS = ["iron-bisglycinate", "l-theanine", "vitamin-d3-k2", "omega-3-fish-oil", "myo-d-chiro-inositol", "creatine-chews", "psyllium-husk"]
NAMES = {"iron-bisglycinate": "Iron Bisglycinate", "l-theanine": "L-Theanine", "vitamin-d3-k2": "Vitamin D3 + K2", "omega-3-fish-oil": "Omega-3 Fish Oil",
         "myo-d-chiro-inositol": "Myo & D-Chiro Inositol", "creatine-chews": "Creatine Chews", "psyllium-husk": "Psyllium Husk"}
FORMATS = {"iron-bisglycinate": "Capsules", "l-theanine": "Capsules", "vitamin-d3-k2": "Softgels", "omega-3-fish-oil": "Softgels", "myo-d-chiro-inositol": "Capsules", "creatine-chews": "Chewable tablets", "psyllium-husk": "Capsules"}
PRICES = {"iron-bisglycinate": "₹799", "l-theanine": "₹899", "vitamin-d3-k2": "₹999", "omega-3-fish-oil": "₹1,199", "myo-d-chiro-inositol": "₹1,299", "creatine-chews": "₹1,099", "psyllium-husk": "₹699"}
ORDER = ["buy", "overview", "ingredients", "use", "quality", "reviews", "questions", "explore"]
fails, passes = [], 0


def check(ok, msg):
    global passes
    if ok:
        passes += 1
    else:
        fails.append(msg)
        print("FAIL", msg)


class Api:
    """A plain HTTP client for arranging records through the real API (Admin actions, orders)."""
    def __init__(self, base):
        from urllib.parse import urlparse
        self.u = urlparse(base); self.cookie = ""; self.csrf = ""
        self.csrf = self.call("GET", "/api/session")["csrf"]

    def call(self, method, path, data=None, raw=None, ctype="application/json"):
        c = http.client.HTTPConnection(self.u.hostname, self.u.port)
        h = {"Content-Type": ctype, "X-CSRF-Token": self.csrf}
        if self.cookie:
            h["Cookie"] = self.cookie
        c.request(method, path, raw if raw is not None else (json.dumps(data) if data is not None else None), h)
        r = c.getresponse(); body = json.loads(r.read())
        if r.getheader("Set-Cookie"):
            self.cookie = r.getheader("Set-Cookie").split(";")[0]
        if r.status != 200:
            raise RuntimeError(f"{path} {r.status} {body}")
        return body

    def admin(self, identity="admin-a"):
        self.call("POST", "/api/demo/login", {"identity": identity}); self.csrf = self.call("GET", "/api/session")["csrf"]; return self


async def page(browser, url, w, h=900, **kw):
    pg = await browser.new_page(viewport={"width": w, "height": h}, **kw)
    errs = []
    pg.on("pageerror", lambda e: errs.append("pageerror " + str(e)))
    pg.on("console", lambda m: errs.append("console " + m.text) if m.type == "error" else None)
    await pg.goto(url, wait_until="networkidle")
    await pg.wait_for_timeout(250)
    return pg, errs


STRUCT_JS = """() => {
  const r = document.querySelector('[data-pp]');
  if (!r) return {root: false};
  const imgs = [...r.querySelectorAll('[data-pp-slide] img')];
  const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
  return { root: true, theme: document.body.dataset.theme, product: r.dataset.ppProduct,
    order: [...r.querySelectorAll(':scope > section')].map(s => s.id),
    h1: [...document.querySelectorAll('h1')].map(h => h.textContent.trim()),
    dup: ids.filter((x, i) => ids.indexOf(x) !== i),
    overflow: document.documentElement.scrollWidth > innerWidth,
    format: (r.querySelector('.pp-pack dd') || {}).textContent, price: (r.querySelector('.pp-price-num') || {}).textContent,
    images: imgs.length, imgDims: imgs.every(i => i.getAttribute('width') && i.getAttribute('height')),
    srcs: imgs.map(i => i.getAttribute('src')),
    related: [...r.querySelectorAll('.pp-related a')].map(a => a.getAttribute('href').split('?')[0]),
    hashes: [...r.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href').slice(1)).filter(h => !document.getElementById(h)),
    lotProduct: (r.querySelector('#pdp-lot input[name=product]') || {}).value,
    addId: (r.querySelector('[data-action=add-product]') || {}).dataset?.id,
    qty: !!r.querySelector('#product-quantity'), pincode: !!r.querySelector('#pincode-form'),
    claims: /\\b(clinically|proven|guaranteed|cures?|treats?|certified organic|lab[- ]tested)\\b/i.test(r.innerText),
  };
}"""


async def structure(browser):
    for d in DESIGNS:
        for pid in PRODUCTS:
            for w in (1440, 768, 390):
                pg, errs = await page(browser, f"{CLEAN}/products/{pid}?design={d}", w)
                # Load every image once (lazy ones too) and confirm each decoded with its proportions.
                await pg.evaluate("async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { scrollTo({top: y, behavior: 'instant'}); await new Promise(r => setTimeout(r, 25)); } scrollTo({top: 0, behavior: 'instant'}); }")
                await pg.wait_for_timeout(300)
                s = await pg.evaluate(STRUCT_JS)
                tag = f"{d}/{pid}@{w}"
                check(s["root"], f"{tag} product page root")
                if not s["root"]:
                    await pg.close(); continue
                check(s["theme"] == d and s["product"] == pid, f"{tag} theme/product {s['theme']} {s['product']}")
                check(s["order"] == ORDER, f"{tag} section order {s['order']}")
                check(s["h1"] == [NAMES[pid]], f"{tag} h1 {s['h1']}")
                check(not s["dup"], f"{tag} duplicate ids {s['dup']}")
                check(not s["overflow"], f"{tag} horizontal overflow")
                check(s["format"] == FORMATS[pid] and s["price"] == PRICES[pid], f"{tag} facts {s['format']} {s['price']}")
                check(s["images"] == 2 and s["imgDims"] and s["srcs"] == [f"/web/media/{pid}.webp", f"/web/media/renders/{pid}-cap.webp"], f"{tag} gallery images {s['srcs']}")
                check(len(s["related"]) == 3 and all(r.startswith("/products/") and r != f"/products/{pid}" for r in s["related"]), f"{tag} related {s['related']}")
                check(not s["hashes"], f"{tag} anchors without targets {s['hashes']}")
                check(s["lotProduct"] == pid and s["addId"] == pid and s["qty"] and s["pincode"], f"{tag} commerce contracts")
                check(not s["claims"], f"{tag} contains claim language")
                broken = await pg.evaluate("() => [...document.querySelectorAll('[data-pp] img:not([data-pp-lb-img])')].filter(i => i.complete && i.naturalWidth === 0).map(i => i.src)")
                check(not broken, f"{tag} broken images {broken}")
                check(not errs, f"{tag} errors {errs[:2]}")
                await pg.close()
        print(d, "structure checked")


async def interactions(browser, d, pid="iron-bisglycinate"):
    # ---------- Desktop ----------
    pg, errs = await page(browser, f"{CLEAN}/products/{pid}?design={d}", 1440)
    tag = f"{d} desktop"
    await pg.click("[data-pp-thumb='1']")
    check(await pg.locator("[data-pp-count]").inner_text() == "2 / 2", f"{tag} thumbnail selects image 2")
    check(await pg.get_attribute("[data-pp-thumb='1']", "aria-pressed") == "true", f"{tag} thumbnail pressed state")
    check("cap colour" in (await pg.locator("[data-pp-caption]").inner_text()).lower(), f"{tag} caption follows image")
    await pg.focus("[data-pp-slides]"); await pg.keyboard.press("ArrowLeft"); await pg.wait_for_timeout(500)
    check(await pg.locator("[data-pp-count]").inner_text() == "1 / 2", f"{tag} arrow key returns to image 1")
    # Full-screen viewer: open, zoom, keyboard, close with Escape, focus returns.
    await pg.click("[data-pp-open='0']")
    check(await pg.evaluate("() => document.querySelector('[data-pp-lightbox]').open"), f"{tag} viewer opens")
    check(await pg.evaluate("() => document.activeElement.hasAttribute('data-pp-lb-stage')"), f"{tag} focus moves into viewer")
    await pg.keyboard.press("+")
    check("scale(2)" in await pg.evaluate("() => document.querySelector('[data-pp-lb-img]').style.transform"), f"{tag} zoom in")
    await pg.keyboard.press("ArrowLeft")
    await pg.keyboard.press("-")
    check("scale(1)" in await pg.evaluate("() => document.querySelector('[data-pp-lb-img]').style.transform"), f"{tag} zoom out")
    await pg.keyboard.press("ArrowRight")
    check(await pg.locator("[data-pp-lb-count]").inner_text() == "2 / 2", f"{tag} viewer next image")
    nat = await pg.evaluate("() => { const i = document.querySelector('[data-pp-lb-img]'); return [i.naturalWidth, i.getBoundingClientRect().width / i.getBoundingClientRect().height]; }")
    check(nat[0] > 0 and abs(nat[1] - 1) < 0.05, f"{tag} viewer keeps cap image proportions {nat}")
    await pg.keyboard.press("Escape"); await pg.wait_for_timeout(100)
    check(not await pg.evaluate("() => document.querySelector('[data-pp-lightbox]').open"), f"{tag} Escape closes viewer")
    check(await pg.evaluate("() => document.activeElement.getAttribute('data-pp-open')") == "0", f"{tag} focus returns to the image")
    # Quantity + Add to bag
    before = int(await pg.locator(".bag-link [data-cart-count], [data-cart-count]").first.inner_text() or 0)
    await pg.select_option("#product-quantity", "2"); await pg.click("[data-action=add-product].pp-add-main")
    await pg.wait_for_timeout(200)
    after = int(await pg.locator("[data-cart-count]").first.inner_text() or 0)
    check(after == before + 2, f"{tag} add to bag {before}->{after}")
    # Pincode
    await pg.fill("#pincode", "012345"); await pg.click("#pincode-form button")
    check("6-digit" in await pg.locator("#pincode-result").inner_text() and await pg.get_attribute("#pincode", "aria-invalid") == "true", f"{tag} invalid pincode")
    await pg.fill("#pincode", "395001"); await pg.click("#pincode-form button")
    res = await pg.locator("#pincode-result").inner_text()
    check("395001" in res and "doesn't promise" in res, f"{tag} valid pincode, no delivery promise")
    # Delivery/returns summary
    await pg.click(".pp-terms summary")
    terms = await pg.locator(".pp-terms").inner_text()
    check("₹75" in terms and "₹1,499" in terms and "haven't been decided" in terms, f"{tag} delivery and returns terms")
    # Empty reviews, honest
    await pg.wait_for_selector("[data-pp-rv-summary] .pp-rv-avg")
    check("no reviews yet" in (await pg.locator("[data-pp-rv-summary]").inner_text()).lower() and "don't add sample or invented" in await pg.locator("[data-pp-rv-summary]").inner_text(), f"{tag} empty review state")
    check((await pg.locator(".pp-panel .pp-rating").inner_text()).lower() == "no reviews yet", f"{tag} panel rating empty state")
    # Eligibility as a guest: inline sign-in, then 'no purchase' (fresh mobile)
    await pg.click("[data-pp-write]")
    await pg.wait_for_selector("[data-pp-otp]")
    check(await pg.get_attribute("[data-pp-write]", "aria-expanded") == "true", f"{tag} write panel expanded")
    mobile = "97" + str(10000000 + DESIGNS.index(d) * 11)[:8]
    await pg.fill("#pp-otp-mobile", "123"); await pg.click("[data-pp-otp] button")
    check("valid 10-digit" in await pg.locator("[data-pp-otp] .pp-form-error").inner_text(), f"{tag} mobile validation")
    await pg.fill("#pp-otp-mobile", mobile); await pg.click("[data-pp-otp] button")
    await pg.wait_for_selector("[data-pp-verify]:not([hidden])")
    code = (await pg.locator("[data-pp-code]").inner_text()).split("code: ")[1][:6]
    await pg.fill("#pp-otp-code", code); await pg.click("[data-pp-verify] button")
    await pg.wait_for_selector("text=Reviews come from verified purchases")
    check(True, f"{tag} signed in inline and told why not eligible")
    check(await pg.locator(".pp-write a[href*='#questions']").count() == 1 and await pg.locator(".pp-write a[href*='/contact']").count() == 1, f"{tag} ineligible routes to question/support")
    # Lot lookup prefilled with this product
    await pg.click("[data-fill-pdp-lot]")
    check(await pg.input_value("#pdp-lot-number") == "DEMO-01-01", f"{tag} sample lot fills")
    await pg.click("#pdp-lot button[type=submit]")
    # Lot reports (web/lots.js) run the lookup, then move to the stable record link /reports/<product>/<lot>.
    await pg.wait_for_url("**/reports**")
    await pg.wait_for_selector("#report-result #lt-match-h", timeout=8000)
    check("demo-01-01" in (await pg.locator("#lt-match-h").inner_text()).lower() and "/reports/iron-bisglycinate/DEMO-01-01" in pg.url, f"{tag} lot lookup result for this product")
    check(not errs, f"{tag} errors {errs[:3]}")
    await pg.close()

    # ---------- Questions (guest) ----------
    pg, errs = await page(browser, f"{CLEAN}/products/l-theanine?design={d}", 1440)
    await pg.fill("#pp-question", "short"); await pg.click("[data-pp-ask] button[type=submit]")
    check("at least 10" in await pg.locator("[data-pp-ask] .pp-form-error").inner_text(), f"{d} question validation")
    await pg.fill("#pp-question", "QA check: is the capsule shell suitable for vegetarians?")
    await pg.click("[data-pp-ask] button[type=submit]")
    await pg.wait_for_selector("[data-pp-ask-result] p")
    res = await pg.locator("[data-pp-ask-result]").inner_text()
    check("CASE-" in res and "answer it privately" in res, f"{d} question submitted as a support case")
    check(not errs, f"{d} question errors {errs[:2]}")
    await pg.close()

    # ---------- Mobile ----------
    pg, errs = await page(browser, f"{CLEAN}/products/{pid}?design={d}", 390, 844)
    tag = f"{d} mobile"
    check(await pg.locator(".pp-thumbs").is_hidden(), f"{tag} thumbnails hidden in favour of swipe")
    await pg.evaluate("() => { const t = document.querySelector('[data-pp-slides]'); t.scrollTo({left: t.scrollWidth}); }")
    await pg.wait_for_timeout(600)
    check(await pg.locator("[data-pp-count]").inner_text() == "2 / 2", f"{tag} swipe updates count")
    check(await pg.locator("[data-pp-sticky]").is_hidden(), f"{tag} sticky bar hidden at top")
    await pg.evaluate("() => scrollTo({top: document.querySelector('#overview').offsetTop + 200, behavior: 'instant'})"); await pg.wait_for_timeout(300)
    check(await pg.locator("[data-pp-sticky]").is_visible(), f"{tag} sticky bar after purchase controls leave view")
    st = await pg.locator("[data-pp-sticky]").inner_text()
    check("Iron Bisglycinate" in st and "₹799" in st and "In stock" in st, f"{tag} sticky bar reflects product {st!r}")
    check(await pg.evaluate("() => document.body.classList.contains('pp-sticky-on') && parseInt(getComputedStyle(document.body).paddingBottom) >= 70"), f"{tag} sticky bar does not cover content")
    before = int(await pg.locator("[data-cart-count]").first.inner_text() or 0)
    await pg.click(".pp-add-sticky"); await pg.wait_for_timeout(200)
    check(int(await pg.locator("[data-cart-count]").first.inner_text() or 0) == before + 1, f"{tag} sticky Add to bag")
    await pg.evaluate("() => scrollTo({top: document.body.scrollHeight, behavior: 'instant'})"); await pg.wait_for_timeout(300)
    check(await pg.locator("[data-pp-sticky]").is_hidden(), f"{tag} sticky bar hides at the footer")
    check(not errs, f"{tag} errors {errs[:2]}")
    await pg.close()

    # ---------- Accessibility ----------
    if AXE:
        for w in (1440, 390):
            pg, errs = await page(browser, f"{SEEDED}/products/{pid}?design={d}", w, bypass_csp=True)
            await pg.wait_for_selector(".pp-review")
            await pg.click("[data-pp-write]"); await pg.wait_for_selector("[data-pp-otp]")
            await pg.add_script_tag(path=AXE)
            res = await pg.evaluate("""async () => (await axe.run('[data-pp]', {resultTypes: ['violations']})).violations.map(v => v.id + ' (' + v.impact + ') x' + v.nodes.length + ': ' + v.nodes.slice(0, 2).map(n => n.target.join(' ') + ' :: ' + (n.failureSummary || '').split('\\n').slice(1, 2).join('')).join(' | '))""")
            for v in res:
                check(False, f"{d}@{w} axe {v}")
            check(True, f"{d}@{w} axe ran")
            await pg.close()


async def seeded_reviews(browser, d):
    pg, errs = await page(browser, f"{SEEDED}/products/iron-bisglycinate?design={d}", 1440)
    tag = f"{d} reviews"
    await pg.wait_for_selector(".pp-review")
    summ = await pg.locator("[data-pp-rv-summary]").inner_text()
    check("4.2" in summ and "6 published reviews" in summ, f"{tag} summary {summ[:60]!r}")
    check(await pg.locator(".pp-panel .pp-rating").inner_text() == "4.2 · 6 reviews", f"{tag} panel rating links to reviews")
    check(await pg.locator(".pp-review").count() == 5, f"{tag} first page of 5")
    check(await pg.locator(".pp-review", has_text="QA test: pending example").count() == 0 and await pg.locator(".pp-review", has_text="rejected example").count() == 0, f"{tag} pending and rejected reviews hidden")
    check(await pg.locator(".pp-verified").count() == 5, f"{tag} verified purchase labels")
    check(await pg.locator(".pp-incentive").count() >= 1, f"{tag} incentive disclosed")
    check(await pg.locator(".pp-reply", has_text="Reply from Body Café Co.").count() == 1, f"{tag} brand reply identified")
    await pg.click("[data-pp-more]"); await pg.wait_for_timeout(500)
    check(await pg.locator(".pp-review").count() == 6 and await pg.locator("[data-pp-more]").is_hidden(), f"{tag} load more")
    await pg.click(".pp-rv-filter [data-pp-rating='5']"); await pg.wait_for_timeout(500)
    stars = await pg.evaluate("() => [...document.querySelectorAll('.pp-review .pp-stars')].map(s => s.getAttribute('aria-label'))")
    check(len(stars) == 3 and all(s.startswith("5 ") for s in stars), f"{tag} 5-star filter {stars}")
    await pg.click(".pp-rv-filter [data-pp-rating='']"); await pg.select_option("[data-pp-sort]", "lowest"); await pg.wait_for_timeout(500)
    first = await pg.locator(".pp-review .pp-stars").first.get_attribute("aria-label")
    check(first.startswith("2 "), f"{tag} lowest first {first}")
    await pg.select_option("[data-pp-sort]", "highest"); await pg.wait_for_timeout(500)
    check((await pg.locator(".pp-review .pp-stars").first.get_attribute("aria-label")).startswith("5 "), f"{tag} highest first")
    # Customer photo opens in the viewer.
    photo = pg.locator("[data-pp-photo]").first
    await photo.click()
    check(await pg.evaluate("() => document.querySelector('[data-pp-lightbox]').open") and "Customer photo" in await pg.locator("[data-pp-lb-caption]").inner_text(), f"{tag} customer photo viewer")
    await pg.keyboard.press("Escape")
    # Helpful persists; report form submits.
    btn = pg.locator("[data-pp-helpful]").first
    await btn.click(); await pg.wait_for_timeout(300)
    check("Marked helpful" in await btn.inner_text(), f"{tag} helpful")
    await pg.reload(wait_until="networkidle"); await pg.wait_for_selector(".pp-review")
    check(await pg.locator(".pp-linkbtn:has-text('Marked helpful')").count() >= 1, f"{tag} helpful persists after reload")
    rep = pg.locator("[data-pp-report]").first
    await rep.click()
    await pg.locator(".pp-reportform button").click()
    check("Choose a reason" in await pg.locator(".pp-reportform .pp-form-error").inner_text(), f"{tag} report needs reason")
    await pg.select_option(".pp-reportform select", "spam"); await pg.locator(".pp-reportform button").click()
    await pg.wait_for_timeout(300)
    check(await pg.locator("text=Your report is with our moderators").count() == 1, f"{tag} report sent")
    # Answered question
    check(await pg.locator(".pp-qa-items li").count() == 1 and await pg.locator(".pp-ans-k", has_text="Answer from Body Café Co.").count() == 1, f"{tag} official answer shown")
    check(not errs, f"{tag} errors {errs[:2]}")
    await pg.close()


async def end_to_end(browser):
    """A delivered order → review with a photo via the page → moderation → publication."""
    pid, mobile = "omega-3-fish-oil", "9300000001"
    pg, errs = await page(browser, f"{CLEAN}/products/{pid}?design=f", 1440)
    # Sign in inline from the review panel, then place, pay and (as Admin) deliver an order for this customer.
    await pg.click("[data-pp-write]"); await pg.fill("#pp-otp-mobile", mobile); await pg.click("[data-pp-otp] button")
    await pg.wait_for_selector("[data-pp-verify]:not([hidden])")
    code = (await pg.locator("[data-pp-code]").inner_text()).split("code: ")[1][:6]
    await pg.fill("#pp-otp-code", code); await pg.click("[data-pp-verify] button")
    await pg.wait_for_selector("text=Reviews come from verified purchases")
    cookies = {c["name"]: c["value"] for c in await pg.context.cookies()}
    cust = Api(CLEAN); cust.cookie = "bcc_session=" + cookies["bcc_session"]; cust.csrf = cust.call("GET", "/api/session")["csrf"]
    o = cust.call("POST", "/api/orders", {"adult": True, "method": "prepaid", "contact": {"name": "QA", "mobile": mobile, "address": "QA address", "city": "Surat", "state": "Gujarat", "pincode": "395001"}, "items": [{"id": pid, "quantity": 1}]})
    cust.call("POST", f"/api/orders/{o['id']}/pay", {"outcome": "success"})
    admin = Api(CLEAN).admin()
    admin.call("POST", "/api/admin/ship", {"id": o["id"]})
    await pg.reload(wait_until="networkidle")
    await pg.click("[data-pp-write]")
    await pg.wait_for_selector("text=Your order hasn't been delivered yet")
    check(True, "e2e shipped-not-delivered state")
    admin.call("POST", "/api/admin/ship", {"id": o["id"]})
    await pg.click("[data-pp-write]"); await pg.click("[data-pp-write]")
    await pg.wait_for_selector("[data-pp-reviewform]")
    await pg.click("[data-pp-submit]")
    summary = await pg.locator("[data-pp-summary]").inner_text()
    check("Choose an overall rating" in summary and "review title" in summary and await pg.evaluate("() => document.activeElement.hasAttribute('data-pp-summary')"), "e2e validation summary focused")
    await pg.click("label[for=pp-r4]")
    await pg.fill("#pp-title", "QA end to end"); await pg.fill("#pp-text", "QA end-to-end review submitted from the product page."); await pg.fill("#pp-name", "QA E2E")
    tmp = ROOT / ".local" / "qa-photo.jpg"; tmp.parent.mkdir(exist_ok=True); tmp.write_bytes(fx.JPEG)
    bad = ROOT / ".local" / "qa-not-image.png"; bad.write_bytes(b"not really a png")
    await pg.set_input_files("#pp-files", [str(tmp), str(bad)])
    await pg.wait_for_function("() => [...document.querySelectorAll('[data-pp-uploads] li')].every(li => li.dataset.state !== 'uploading')")
    states = await pg.evaluate("() => [...document.querySelectorAll('[data-pp-uploads] li')].map(li => li.dataset.state + ':' + li.textContent)")
    check(any(s.startswith("done") for s in states) and any(s.startswith("error") and "JPEG, PNG or WebP" in s for s in states), f"e2e upload success and server-side type error {states}")
    await pg.click("[data-pp-uploads] li[data-state=error] [data-pp-remove]")
    await pg.click("[data-pp-submit]")
    await pg.wait_for_selector(".pp-success")
    check(await pg.evaluate("() => document.activeElement.classList.contains('pp-success')"), "e2e success message focused")
    # Duplicate guard: opening the form again explains the review is pending.
    await pg.click("[data-pp-write]"); await pg.click("[data-pp-write]")
    await pg.wait_for_selector("text=already reviewed")
    check("waiting for moderation" in await pg.locator(".pp-write").inner_text(), "e2e pending state shown")
    snap = admin.call("GET", "/api/admin")
    rev = [r for r in snap["reviews"] if r["product"] == pid][0]
    check(len(rev["media"]) == 1, "e2e photo attached for moderation")
    admin.call("POST", "/api/admin/review", {"id": rev["id"], "decision": "publish", "media": {rev["media"][0]: "approve"}})
    await pg.reload(wait_until="networkidle"); await pg.wait_for_selector(".pp-review")
    text = await pg.locator("[data-pp-rv-list]").inner_text()
    check("QA end to end" in text and "Verified purchase" in text.title() or "VERIFIED PURCHASE" in text.upper(), "e2e published review visible")
    check(await pg.locator(".pp-rv-photos img").count() == 1, "e2e approved photo visible")
    check(await pg.locator(".pp-review", has_text="Your review").count() == 1, "e2e own review cannot be voted on")
    tmp.unlink(); bad.unlink()
    # The deliberately invalid upload produces one expected 415 response.
    errs = [e for e in errs if "415" not in e]
    check(not errs, f"e2e errors {errs[:2]}")
    await pg.close()


async def stock_states(browser):
    admin = Api(CLEAN).admin()
    for lot in ("DEMO-07-01", "DEMO-07-02"):
        admin.call("POST", "/api/admin/quarantine", {"batch": lot, "reason": "QA unavailable state check"})
    for d in DESIGNS:
        pg, errs = await page(browser, f"{CLEAN}/products/psyllium-husk?design={d}", 1440)
        stock = await pg.locator(".pp-stock").inner_text()
        disabled = await pg.evaluate("() => [...document.querySelectorAll('[data-action=add-product], [data-pp-sticky-add]')].every(b => b.disabled) && document.querySelector('#product-quantity').disabled")
        check("out of stock" in stock.lower() and disabled, f"{d} unavailable state {stock!r} disabled={disabled}")
        check("unavailable" in (await pg.locator("[data-pp-sticky]").inner_text()).lower(), f"{d} sticky bar shows unavailable")
        await pg.close()


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        await structure(b)
        for d in DESIGNS:
            await interactions(b, d)
            await seeded_reviews(b, d)
            print(d, "interactions checked")
        await end_to_end(b)
        await stock_states(b)
        await b.close()
    print(json.dumps({"designs": DESIGNS, "checks_passed": passes, "failures": len(fails)}))
    sys.exit(1 if fails else 0)


asyncio.run(main())
