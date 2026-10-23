"""Verify the bag, sign-in, checkout continuity, payment states and account across A–H.

Usage: python3 design-tools/qa-account/verify_account.py BASE [designs] [widths]
  BASE  a LOCAL TEST app server on a disposable database (orders, sign-ins and addresses are created).
Set AXE_JS to axe.min.js for an accessibility scan.
"""
import json, os, re, sys
from playwright.sync_api import sync_playwright

args = [a for a in sys.argv[1:] if not a.startswith("--")]
BASE = args[0].rstrip("/")
DESIGNS = args[1] if len(args) > 1 else "abcdefgh"
WIDTHS = [int(w) for w in (args[2] if len(args) > 2 else "1440,390").split(",")]
AXE = os.environ.get("AXE_JS")
results, fails = [], []
MOBILE = [int(os.environ.get("QA_MOBILE_START", "9000000000"))]


def mobile():
    MOBILE[0] += 1
    return str(MOBILE[0])


def check(name, ok, detail=""):
    results.append(name)
    if not ok:
        fails.append(f"{name} {detail}".strip())


def axe(pg, tag, what):
    if not AXE:
        return
    pg.add_script_tag(path=AXE)
    v = pg.evaluate("""async()=>{const r=await axe.run(document.querySelector('#main'),{resultTypes:['violations']});return r.violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>v.id+':'+v.nodes.length+':'+v.nodes[0].target.join(' '))}""")
    check(f"{tag} axe {what}", not v, str(v))


def overflow(pg, tag, what, w):
    check(f"{tag} no overflow {what}", pg.evaluate("document.documentElement.scrollWidth") <= w)


def settle(pg):
    pg.wait_for_function("() => !document.querySelector('[data-bg] .bg-lines[aria-busy=true]') && (document.querySelector('[data-bg] .bg-row.is-total') || document.querySelector('[data-bg] .bg-empty'))", timeout=8000)
    pg.wait_for_timeout(150)


def total(pg):
    t = pg.inner_text("[data-bg] .bg-row.is-total strong")
    return int(re.sub(r"[^0-9]", "", t))


def sign_in(pg, m):
    pg.fill("#ac-mobile", m)
    pg.click("[data-ac-mobile] button[type=submit]")
    pg.wait_for_selector("[data-ac-code]:not([hidden])", timeout=8000)
    code = re.search(r"(\d{6})", pg.inner_text("[data-ac-preview]")).group(1)
    return code


def restock():
    """Each run places orders; top up the demonstration lots through the real two-Admin stock approval."""
    import http.cookiejar, urllib.request
    def client(who):
        jar = http.cookiejar.CookieJar(); op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
        def req(method, path, body=None, csrf=""):
            r = urllib.request.Request(BASE + path, data=json.dumps(body).encode() if body is not None else None, method=method, headers={"Content-Type": "application/json", "X-CSRF-Token": csrf})
            with op.open(r) as res: return json.loads(res.read())
        csrf = req("GET", "/api/session")["csrf"]; req("POST", "/api/demo/login", {"identity": who}, csrf)
        csrf = req("GET", "/api/session")["csrf"]
        return lambda m, p, b=None: req(m, p, b, csrf)
    a, b = client("admin-a"), client("admin-b")
    for lot in ["DEMO-02-01", "DEMO-02-02", "DEMO-04-01", "DEMO-07-01"]:
        r = a("POST", "/api/admin/request", {"kind": "stock", "target": lot, "value": 40, "reason": "QA restock"})
        b("POST", "/api/admin/approve", {"id": r["id"], "decision": "approve"})


def page(ctx):
    pg = ctx.new_page()
    pg.text = lambda sel: pg.inner_text(sel).lower()
    return pg


def run(b, d, w):
    tag = f"{d} {w}"
    ctx = b.new_context(viewport={"width": w, "height": 900}, bypass_csp=True)
    pg = page(ctx)
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))

    # ---------- bag ----------
    pg.goto(f"{BASE}/cart?design={d}", wait_until="networkidle"); settle(pg)
    check(f"{tag} empty bag", pg.locator("[data-bg] .bg-empty").count() == 1 and pg.locator("[data-bg] .bg-empty a[href^='/shop']").count() == 1)
    check(f"{tag} one h1 (bag)", pg.locator("h1").count() == 1)
    pg.goto(f"{BASE}/shop?design={d}", wait_until="networkidle")
    pg.evaluate("localStorage.setItem('bcc-cart', JSON.stringify([{id:'l-theanine',quantity:2,price:899},{id:'omega-3-fish-oil',quantity:1,price:1}])); localStorage.removeItem('bcc-saved'); sessionStorage.removeItem('bcc-discount')")
    pg.goto(f"{BASE}/cart?design={d}", wait_until="networkidle"); settle(pg)
    check(f"{tag} lines", pg.locator("[data-bg-line]").count() == 2)
    line = pg.locator("[data-bg-line='l-theanine']")
    check(f"{tag} line facts", all(x.lower() in line.inner_text().lower() for x in ["L-Theanine", "Capsules", "Sample price ₹899", "Available"]) and line.locator("a[href^='/products/l-theanine']").count() >= 1)
    check(f"{tag} price change explained", "price changed" in pg.text("[data-bg]") and "₹1,199" in pg.text("[data-bg]"))
    check(f"{tag} totals", total(pg) == 2 * 899 + 1199)
    check(f"{tag} summary rows", all(x.lower() in pg.text(".bg-summary") for x in ["Subtotal", "Delivery", "Sample total", "GST"]))
    check(f"{tag} one checkout action in summary", pg.locator(".bg-summary .bg-checkout").count() == 1)
    bar = pg.locator(".bg-bar")
    disp = pg.evaluate("getComputedStyle(document.querySelector('.bg-bar')).display")
    check(f"{tag} mobile bar " + ("present" if w <= 900 else "absent"), (disp != "none") == (w <= 900), disp)
    if w <= 900:
        pg.wait_for_timeout(150)
        both = pg.evaluate("""() => { const vis = (el) => { const r = el.getBoundingClientRect(); return getComputedStyle(el).visibility !== 'hidden' && r.bottom > 0 && r.top < innerHeight; };
          return [vis(document.querySelector('.bg-bar')), vis(document.querySelector('.bg-summary .bg-checkout'))]; }""")
        check(f"{tag} exactly one checkout action on screen", both[0] != both[1], both)
    if w <= 900:
        pos = pg.evaluate("getComputedStyle(document.querySelector('.bg-bar')).position")
        check(f"{tag} mobile bar doesn't cover content", pos in ("sticky", "static", "relative"), pos)
    # quantity
    pg.click("[data-bg-qty='l-theanine'][data-d='1']"); settle(pg)
    check(f"{tag} quantity +", pg.inner_text("[data-bg-line='l-theanine'] output") == "3" and total(pg) == 3 * 899 + 1199)
    check(f"{tag} header count", pg.evaluate("[...document.querySelectorAll('[data-cart-count]')].every(x => x.textContent.trim() === '4')"))
    check(f"{tag} update announced", "quantity 3" in pg.text("#bg-status"))
    check(f"{tag} focus kept", pg.evaluate("document.activeElement.getAttribute('data-bg-qty')") == "l-theanine")
    pg.keyboard.press("Enter"); settle(pg)
    check(f"{tag} keyboard quantity", pg.inner_text("[data-bg-line='l-theanine'] output") == "4")
    # remove + undo
    pg.click("[data-bg-remove='omega-3-fish-oil']"); settle(pg)
    check(f"{tag} removed with undo", pg.locator("[data-bg-line]").count() == 1 and pg.locator("[data-bg-undo]").count() == 1 and pg.evaluate("document.activeElement.hasAttribute('data-bg-undo')"))
    pg.click("[data-bg-undo]"); settle(pg)
    check(f"{tag} undo restores", pg.locator("[data-bg-line='omega-3-fish-oil']").count() == 1 and pg.evaluate("JSON.parse(localStorage.getItem('bcc-cart')).length") == 2)
    # save for later
    pg.click("[data-bg-save='omega-3-fish-oil']"); settle(pg)
    check(f"{tag} saved for later", pg.locator(".bg-saved [data-bg-restore='omega-3-fish-oil']").count() == 1 and pg.locator("[data-bg-line]").count() == 1)
    pg.reload(wait_until="networkidle"); settle(pg)
    check(f"{tag} saved survives refresh", pg.locator(".bg-saved [data-bg-restore='omega-3-fish-oil']").count() == 1 and pg.inner_text("[data-bg-line='l-theanine'] output") == "4")
    pg.click("[data-bg-restore='omega-3-fish-oil']"); settle(pg)
    check(f"{tag} move back to bag", pg.locator("[data-bg-line]").count() == 2 and pg.locator(".bg-saved").count() == 0)
    # discount
    pg.locator(".bg-disc summary").click()
    pg.fill("#bg-code", "FREE50"); pg.click("[data-bg-disc] button[type=submit]"); settle(pg)
    check(f"{tag} bad code inline", pg.get_attribute("#bg-code", "aria-invalid") == "true" and pg.locator("#bg-code-err").count() == 1 and pg.locator(".bg-summary .bg-checkout[data-bg-blocked]").count() == 1)
    check(f"{tag} bad code kept", pg.input_value("#bg-code") == "FREE50")
    pg.fill("#bg-code", "preview10"); pg.click("[data-bg-disc] button[type=submit]"); settle(pg)
    sub = 4 * 899 + 1199
    check(f"{tag} sample code applied", "preview10" in pg.text(".bg-summary") and total(pg) == sub - (sub + 5) // 10)
    pg.click("[data-bg-disc-remove]"); settle(pg)
    check(f"{tag} code removed", total(pg) == sub)
    # quantity limit
    pg.evaluate("localStorage.setItem('bcc-cart', JSON.stringify([{id:'l-theanine',quantity:10,price:899}]))")
    pg.reload(wait_until="networkidle"); settle(pg)
    check(f"{tag} max quantity", pg.locator("[data-bg-qty='l-theanine'][data-d='1']").is_disabled())
    # pincode never promises delivery
    pg.locator(".bg-pin summary").click(); pg.fill("#pincode", "560001"); pg.click("#pincode-form button"); pg.wait_for_timeout(200)
    check(f"{tag} pincode honest", "doesn't promise a delivery date" in pg.text("#pincode-result"))
    # back/forward
    pg.evaluate("localStorage.setItem('bcc-cart', JSON.stringify([{id:'l-theanine',quantity:2,price:899}]))")
    pg.goto(f"{BASE}/shop?design={d}", wait_until="networkidle"); pg.go_back(); pg.wait_for_load_state("networkidle"); settle(pg)
    check(f"{tag} back keeps bag", pg.locator("[data-bg-line='l-theanine']").count() == 1)
    overflow(pg, tag, "bag", w)
    axe(pg, tag, "bag")

    # ---------- guest checkout → optional sign-in → back to checkout with details kept ----------
    pg.locator(".bg-summary .bg-checkout").click(); pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(300)
    check(f"{tag} to checkout", "/checkout" in pg.url)
    check(f"{tag} guest note", "checking out as a guest" in pg.text("#checkout-form"))
    pg.fill("#checkout-form [name=name]", "QA Shopper"); pg.fill("#checkout-form [name=address]", "123 Sample Street")
    m1 = mobile()
    pg.click("#checkout-form .ac-co-note a"); pg.wait_for_load_state("networkidle")
    check(f"{tag} sign-in keeps next", "/sign-in" in pg.url and "next=%2Fcheckout" in pg.url)
    check(f"{tag} sign-in explains", all(x.lower() in pg.text("[data-ac-signin]") for x in ["one-time code", "creates your account", "back to checkout"]))
    pg.fill("#ac-mobile", "512"); pg.click("[data-ac-mobile] button[type=submit]")
    check(f"{tag} mobile validation", pg.is_visible("#ac-mobile-err") and pg.get_attribute("#ac-mobile", "aria-invalid") == "true" and pg.input_value("#ac-mobile") == "512")
    code = sign_in(pg, m1)
    dest = pg.inner_text("[data-ac-dest]")
    check(f"{tag} destination shown, honest", m1[-2:] in dest and "no sms" in dest.lower() and "sms sent" not in pg.text("[data-ac-signin]"))
    check(f"{tag} one code field", pg.locator("[data-ac-code] input").count() == 1 and pg.get_attribute("#ac-code", "autocomplete") == "one-time-code")
    check(f"{tag} resend waits", not pg.is_visible("[data-ac-resend]") and "resend in" in pg.text("[data-ac-timers]"))
    wrong = "000000" if code != "000000" else "111111"
    pg.fill("#ac-code", wrong); pg.click("[data-ac-code] button[type=submit]"); pg.wait_for_timeout(500)
    check(f"{tag} wrong code", "4 attempts left" in pg.text("#ac-code-err") and pg.get_attribute("#ac-code", "aria-invalid") == "true")
    pg.click("[data-ac-change]")
    check(f"{tag} change number", pg.is_visible("#ac-mobile") and pg.input_value("#ac-mobile") == m1)
    pg.click("[data-ac-mobile] button[type=submit]"); pg.wait_for_timeout(500)
    check(f"{tag} resend wait enforced", "wait" in pg.text("#ac-mobile-err").lower() or "wait" in pg.text("[data-ac-signin]").lower())
    if not pg.is_visible("[data-ac-code]"):
        pg.evaluate("sessionStorage.setItem('bcc-otp', JSON.stringify({mobile:'%s',destination:'x',mode:'preview',expires_at:Date.now()/1000+300,resend_at:Date.now()/1000}))" % m1)
        pg.reload(wait_until="networkidle")
    pg.evaluate("document.querySelector('#ac-code').focus()")
    pg.keyboard.insert_text(" " + code[:3] + "-" + code[3:] + " ")  # pasted with separators
    pg.click("[data-ac-code] button[type=submit]")
    pg.wait_for_url("**/checkout**", timeout=8000); pg.wait_for_timeout(400)
    check(f"{tag} back to checkout", "/checkout" in pg.url)
    check(f"{tag} checkout details kept", pg.input_value("#checkout-form [name=name]") == "QA Shopper" and pg.input_value("#checkout-form [name=address]") == "123 Sample Street")
    check(f"{tag} bag kept through sign-in", pg.evaluate("JSON.parse(localStorage.getItem('bcc-cart'))[0].quantity") == 2)
    check(f"{tag} signed-in note", "this order will be saved to your account" in pg.text("#checkout-form"))
    for k, val in {"mobile": m1, "pincode": "395001", "city": "Surat", "state": "Gujarat"}.items():
        if pg.locator(f"#checkout-form [name={k}]").count() and not pg.input_value(f"#checkout-form [name={k}]"):
            pg.fill(f"#checkout-form [name={k}]", val)
    pg.check("#checkout-form [name=adult]")
    check(f"{tag} marketing unticked", not pg.is_checked("#checkout-form [name=email_consent]") and not pg.is_checked("#checkout-form [name=whatsapp_consent]"))
    # Two quick submissions create one order.
    pg.evaluate("() => { const f = document.getElementById('checkout-form'); f.requestSubmit(); f.requestSubmit(); }")
    pg.wait_for_url("**/payment/**", timeout=8000); pg.wait_for_timeout(500)
    acct = pg.evaluate("fetch('/api/account').then(r => r.json())")
    check(f"{tag} one order from double submit", len(acct["orders"]) == 1, str(len(acct["orders"])))
    oid = pg.url.split("/payment/")[1].split("?")[0]
    # ---------- payment states ----------
    pg.click("[data-ac-pay=failure]"); pg.wait_for_timeout(600)
    check(f"{tag} failed payment", "didn’t go through" in pg.text("h1") and pg.locator("[data-ac-pay=success]").count() == 1)
    pg.click("[data-ac-pay=uncertain]"); pg.wait_for_timeout(600)
    check(f"{tag} uncertain payment", "confirming" in pg.text("h1") and pg.locator("[data-ac-pay]").count() == 0 and pg.locator("[data-ac-check]").count() == 1)
    r = pg.evaluate(f"""fetch('/api/orders/{oid}/pay',{{method:'POST',headers:{{'Content-Type':'application/json','X-CSRF-Token':''}},body:JSON.stringify({{outcome:'success'}})}}).then(r=>r.status)""")
    check(f"{tag} retry blocked server-side", r in (403, 409))
    pg.click("[data-ac-check]"); pg.wait_for_timeout(600)
    check(f"{tag} status check", "still being confirmed" in pg.text("[data-ac-pay-status]").lower() or "confirming" in pg.text("h1"))
    pg.click("[data-ac-reconcile=success]"); pg.wait_for_timeout(800)
    check(f"{tag} paid", "payment received" in pg.text("h1"))
    check(f"{tag} bag emptied after payment", pg.evaluate("JSON.parse(localStorage.getItem('bcc-cart') || '[]').length") == 0)
    overflow(pg, tag, "payment", w)
    # ---------- order ----------
    pg.goto(f"{BASE}/orders/{oid}?design={d}", wait_until="networkidle")
    t = pg.text("[data-ac]")
    check(f"{tag} order facts", all(x in t for x in [oid.lower(), "payment received", "paid (preview)", "invoice", "not available"]))
    lot = pg.locator(".ac-lot a")
    check(f"{tag} allocated lot link", lot.count() >= 1 and re.match(r"/reports/l-theanine/DEMO-02-0\d", lot.first.get_attribute("href") or ""))
    check(f"{tag} cancel explained", pg.locator("[data-ac-cancel]").count() == 1 and "until it’s dispatched" in t)
    axe(pg, tag, "order")
    overflow(pg, tag, "order", w)
    pg.click(f"[data-ac-buyagain='{oid}']"); pg.wait_for_url("**/cart**", timeout=8000); settle(pg)
    check(f"{tag} buy again → review bag", pg.locator("[data-bg-line='l-theanine']").count() == 1 and "nothing is ordered or charged automatically" in pg.text("[data-bg]"))
    # ---------- account ----------
    pg.goto(f"{BASE}/account?design={d}", wait_until="networkidle")
    check(f"{tag} overview", "active orders" in pg.text("[data-ac]") and oid.lower() in pg.text("[data-ac]"))
    check(f"{tag} account nav", pg.locator(".ac-nav a").count() == 7 and pg.locator(".ac-nav a[aria-current=page]").count() == 1)
    pg.goto(f"{BASE}/account/addresses?design={d}", wait_until="networkidle")
    f = "[data-ac-address='']"
    pg.fill(f"{f} [name=name]", "QA Shopper"); pg.fill(f"{f} [name=address]", "1 Test Road"); pg.fill(f"{f} [name=city]", "Pune"); pg.fill(f"{f} [name=state]", "MH"); pg.fill(f"{f} [name=pincode]", "012345")
    pg.click(f"{f} button[type=submit]"); pg.wait_for_timeout(500)
    check(f"{tag} address field error", pg.is_visible("#ac-a-new-pincode-err") and pg.get_attribute("#ac-a-new-pincode", "aria-invalid") == "true" and pg.input_value(f"{f} [name=city]") == "Pune")
    pg.fill(f"{f} [name=pincode]", "411001"); pg.click(f"{f} button[type=submit]"); pg.wait_for_timeout(800)
    check(f"{tag} address saved as default", pg.locator(".ac-addr").count() == 1 and "default" in pg.text(".ac-addr"))
    pg.fill(f"{f} [name=name]", "QA Two"); pg.fill(f"{f} [name=address]", "2 Test Road"); pg.fill(f"{f} [name=city]", "Pune"); pg.fill(f"{f} [name=state]", "MH"); pg.fill(f"{f} [name=pincode]", "411002")
    pg.click(f"{f} button[type=submit]"); pg.wait_for_timeout(800)
    second = pg.locator(".ac-addr", has_text="2 Test Road").get_attribute("data-ac-addr-item")
    pg.click(f"[data-ac-default='{second}']"); pg.wait_for_timeout(800)
    check(f"{tag} set default", "default" in pg.locator(f"[data-ac-addr-item='{second}']").inner_text().lower())
    pg.click(f"[data-ac-edit='{second}']"); pg.fill(f"[data-ac-address='{second}'] [name=city]", "Mumbai"); pg.click(f"[data-ac-address='{second}'] button[type=submit]"); pg.wait_for_timeout(800)
    check(f"{tag} edit address", "mumbai" in pg.locator(f"[data-ac-addr-item='{second}']").inner_text().lower())
    first = pg.locator(".ac-addr", has_text="1 Test Road").get_attribute("data-ac-addr-item")
    pg.click(f"[data-ac-delete='{first}']"); check(f"{tag} remove asks to confirm", pg.locator(f"[data-ac-addr-item='{first}']").count() == 1)
    pg.click(f"[data-ac-delete='{first}']"); pg.wait_for_timeout(800)
    check(f"{tag} remove address", pg.locator(f"[data-ac-addr-item='{first}']").count() == 0)
    overflow(pg, tag, "addresses", w)
    pg.goto(f"{BASE}/account/profile?design={d}", wait_until="networkidle")
    pg.fill("#ac-name", "QA Shopper"); pg.fill("#ac-email", "not-an-email"); pg.click("[data-ac-profile] button[type=submit]"); pg.wait_for_timeout(500)
    check(f"{tag} profile email error", pg.is_visible("#ac-email-err") and pg.input_value("#ac-name") == "QA Shopper")
    pg.fill("#ac-email", "qa@example.com"); pg.click("[data-ac-profile] button[type=submit]"); pg.wait_for_timeout(800)
    check(f"{tag} profile saved", pg.input_value("#ac-email") == "qa@example.com" and "not verified" in pg.text("[data-ac-profile]"))
    check(f"{tag} security", "verified mobile" in pg.text("[data-ac]") and pg.locator("[data-ac-everywhere]").count() == 1)
    pg.goto(f"{BASE}/account/preferences?design={d}", wait_until="networkidle")
    check(f"{tag} prefs off by default", not pg.is_checked("[data-su-pref-account] [name=email]") and not pg.is_checked("[data-su-pref-account] [name=whatsapp]"))
    pg.check("[data-su-pref-account] [name=email]"); pg.click("[data-su-pref-account] button[type=submit]"); pg.wait_for_timeout(600)
    pg.reload(wait_until="networkidle")
    check(f"{tag} prefs persisted", pg.is_checked("[data-su-pref-account] [name=email]") and not pg.is_checked("[data-su-pref-account] [name=whatsapp]"))
    pg.goto(f"{BASE}/account/support?design={d}", wait_until="networkidle")
    pg.click("[data-ac-order-case] button[type=submit]"); pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(300)
    check(f"{tag} order case context", "/contact" in pg.url and pg.input_value("#su-order") == oid)
    pg.fill("#su-message", "QA: where is my order?")
    pg.reload(wait_until="networkidle"); pg.wait_for_timeout(300)
    check(f"{tag} case draft kept", pg.input_value("#su-message") == "QA: where is my order?")
    pg.goto(f"{BASE}/account/reviews?design={d}", wait_until="networkidle")
    check(f"{tag} reviews empty state", "once an order is delivered" in pg.text("[data-ac]"))
    axe(pg, tag, "account")
    # ---------- unsafe next and cross-customer access ----------
    for bad in ["//evil.example/x", "https://evil.example/", "/ops", "/account/../ops"]:
        pg.goto(f"{BASE}/sign-in?next={bad}&design={d}", wait_until="networkidle")
        href = pg.get_attribute("[data-ac] a.ac-btn", "href") or ""
        check(f"{tag} unsafe next {bad}", href.split("?")[0] == "/account", href)
    other = b.new_context(viewport={"width": w, "height": 900})
    op = page(other)
    op.goto(f"{BASE}/orders/{oid}?design={d}", wait_until="networkidle")
    check(f"{tag} other visitor can't see order", "order not found" in op.text("h1"))
    check(f"{tag} other visitor API denied", op.evaluate(f"fetch('/api/orders/{oid}/status').then(r => r.status)") == 404)
    op.goto(f"{BASE}/sign-in?next=/orders/{oid}&design={d}", wait_until="networkidle")
    c2 = sign_in(op, mobile()); op.fill("#ac-code", c2); op.click("[data-ac-code] button[type=submit]"); op.wait_for_url(f"**/orders/{oid}**", timeout=8000); op.wait_for_timeout(500)
    check(f"{tag} return to requested order, still private", f"/orders/{oid}" in op.url and "order not found" in op.text("h1"))
    other.close()
    # ---------- account bag combination ----------
    pg.evaluate("localStorage.setItem('bcc-cart', JSON.stringify([{id:'l-theanine',quantity:3,price:899}]))")
    pg.evaluate("fetch('/api/session').then(r=>r.json()).then(s=>fetch('/api/bag',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':s.csrf},body:JSON.stringify({items:[{id:'l-theanine',quantity:3,price:899},{id:'psyllium-husk',quantity:1,price:699}]})}))")
    pg.wait_for_timeout(300)
    pg.goto(f"{BASE}/account/profile?design={d}", wait_until="networkidle")
    pg.click("[data-ac] button[data-action=logout]"); pg.wait_for_timeout(800)
    check(f"{tag} signed out, bag kept", "/account" in pg.url and pg.locator("[data-ac-signin]").count() == 1 and pg.evaluate("JSON.parse(localStorage.getItem('bcc-cart')).length") == 1)
    pg.evaluate("localStorage.setItem('bcc-cart', JSON.stringify([{id:'l-theanine',quantity:1,price:899}]))")
    pg.goto(f"{BASE}/sign-in?next=/cart&design={d}", wait_until="networkidle")
    pg.fill("#ac-mobile", m1); pg.click("[data-ac-mobile] button[type=submit]"); pg.wait_for_timeout(600)
    if pg.is_visible("[data-ac-code]") and pg.locator("[data-ac-preview]").inner_text().strip():
        c3 = re.search(r"(\d{6})", pg.inner_text("[data-ac-preview]")).group(1)
        pg.fill("#ac-code", c3); pg.click("[data-ac-code] button[type=submit]"); pg.wait_for_url("**/cart**", timeout=8000); settle(pg)
        bagnow = pg.evaluate("JSON.parse(localStorage.getItem('bcc-cart'))")
        q = {x["id"]: x["quantity"] for x in bagnow}
        check(f"{tag} bags combined without doubling", q == {"l-theanine": 3, "psyllium-husk": 1}, str(q))
        check(f"{tag} combination explained", "combined" in pg.text("[data-bg]") and "the larger of 1 and 3" in pg.text("[data-bg]"))
    else:
        check(f"{tag} second sign-in code", False, pg.inner_text("[data-ac-signin]")[:200])
    # ---------- session ended on its own ----------
    pg.evaluate("fetch('/api/session').then(r=>r.json()).then(s=>fetch('/api/logout',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':s.csrf},body:'{}'}))")
    pg.wait_for_timeout(300)
    pg.goto(f"{BASE}/account?design={d}", wait_until="networkidle"); pg.wait_for_timeout(300)
    check(f"{tag} session end explained", "session ended" in pg.text("#toast"))
    check(f"{tag} no page errors", not errs, str(errs[:2]))
    ctx.close()


with sync_playwright() as p:
    b = p.chromium.launch()
    for d in DESIGNS:
        for w in WIDTHS:
            n = len(fails)
            try:
                restock()
                run(b, d, w)
            except Exception as e:
                fails.append(f"{d} {w} crashed: {str(e)[:400]}")
            print(d, w, "fail" if len(fails) > n else "pass", fails[n:], flush=True)
    b.close()
print(f"{len(results)} checks, {len(fails)} failures")
for f in fails:
    print(" -", f)
sys.exit(1 if fails else 0)
