"""Verify the Help Centre, Contact, Preferences and policy pages, and the order-aware support actions, across A–H.

Usage: python3 design-tools/qa-support/verify_support.py BASE [designs] [widths]
  BASE  a LOCAL TEST app server on a disposable database (cases, orders, sign-ins and preferences are created).
Set AXE_JS to axe.min.js for an accessibility scan. QA_MOBILE_START sets the first test mobile number.
"""
import json, os, re, struct, sys, zlib
import http.cookiejar, urllib.request
from playwright.sync_api import sync_playwright

args = [a for a in sys.argv[1:] if not a.startswith("--")]
BASE = args[0].rstrip("/")
DESIGNS = args[1] if len(args) > 1 else "abcdefgh"
WIDTHS = [int(w) for w in (args[2] if len(args) > 2 else "1440,390").split(",")]
AXE = os.environ.get("AXE_JS")
results, fails = [], []
MOBILE = [int(os.environ.get("QA_MOBILE_START", "9700000000"))]
FOOTER = [("Help Centre", "/help"), ("Contact", "/contact"), ("Shipping & Delivery", "/policies/shipping"), ("Returns & Refunds", "/policies/returns"),
          ("Cancellations", "/policies/cancellation"), ("Preferences", "/settings"), ("Privacy", "/policies/privacy"), ("Terms", "/policies/terms")]
PAGES = ["/help", "/contact", "/settings", "/policies/shipping", "/policies/returns", "/policies/cancellation", "/policies/privacy", "/policies/terms"]
# Help links that already sat in a header or mobile menu before this work (left as they were, nothing added).
PRE_EXISTING_HEADER = {"c": {"/help"}, "e": {"/help"}, "f": {"/help"}, "g": {"/help"}, "h": {"/help"}}


def mobile():
    MOBILE[0] += 1
    return str(MOBILE[0])


def check(name, ok, detail=""):
    results.append(name)
    if not ok:
        fails.append(f"{name} {detail}".strip())


def png():
    raw = b"".join(b"\x00" + b"\xcc\x88\x44" * 8 for _ in range(8))
    def chunk(t, d): return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xffffffff)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", 8, 8, 8, 2, 0, 0, 0)) + chunk(b"IDAT", zlib.compress(raw)) + chunk(b"IEND", b"")


def axe(pg, tag, what):
    if not AXE:
        return
    pg.add_script_tag(path=AXE)
    v = pg.evaluate("""async()=>{const r=await axe.run(document.querySelector('#main'),{resultTypes:['violations']});return r.violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>v.id+':'+v.nodes.length+':'+v.nodes[0].target.join(' '))}""")
    check(f"{tag} axe {what}", not v, str(v))


def client(who=None):
    jar = http.cookiejar.CookieJar(); op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
    state = {"csrf": ""}
    def req(method, path, body=None):
        r = urllib.request.Request(BASE + path, data=json.dumps(body).encode() if body is not None else None, method=method, headers={"Content-Type": "application/json", "X-CSRF-Token": state["csrf"]})
        try:
            with op.open(r) as res: return json.loads(res.read())
        except urllib.error.HTTPError as e:
            return {"_status": e.code, **json.loads(e.read() or b"{}")}
    state["csrf"] = req("GET", "/api/session")["csrf"]
    if who:
        req("POST", "/api/demo/login", {"identity": who}); state["csrf"] = req("GET", "/api/session")["csrf"]
    return req


ADMIN = {}
def admin():
    if "a" not in ADMIN:
        ADMIN["a"] = client("admin-a"); ADMIN["b"] = client("admin-b")
        for lot in ["DEMO-02-01", "DEMO-02-02", "DEMO-04-01", "DEMO-07-01"]:
            r = ADMIN["a"]("POST", "/api/admin/request", {"kind": "stock", "target": lot, "value": 60, "reason": "QA restock"})
            ADMIN["b"]("POST", "/api/admin/approve", {"id": r["id"], "decision": "approve"})
    return ADMIN["a"]


def browser_api(pg, method, path, body=None):
    return pg.evaluate("""async ([m,p,b]) => { const s = await (await fetch('/api/session')).json();
      const r = await fetch('/api'+p, {method:m, headers:{'Content-Type':'application/json','X-CSRF-Token':s.csrf}, body: b===null?undefined:JSON.stringify(b)});
      return {status:r.status, ...(await r.json())}; }""", [method, path, body])


def order_in_browser(pg, deliver=False):
    o = browser_api(pg, "POST", "/orders", {"adult": True, "method": "prepaid", "items": [{"id": "l-theanine", "quantity": 2}],
                    "contact": {"name": "QA Person", "mobile": "9876543210", "address": "1 QA Street", "city": "Surat", "state": "Gujarat", "pincode": "395001"}})
    browser_api(pg, "POST", "/orders/" + o["id"] + "/pay", {"outcome": "success"})
    if deliver:
        a = admin(); a("POST", "/api/admin/ship", {"id": o["id"]}); a("POST", "/api/admin/ship", {"id": o["id"]})
    return o["id"]


def go(pg, path, d):
    sep = "&" if "?" in path else "?"
    pg.goto(f"{BASE}{path}{sep}design={d}", wait_until="networkidle")
    pg.wait_for_timeout(150)


def run(b, d, w, full):
    tag = f"{d} {w}"
    ctx = b.new_context(viewport={"width": w, "height": 900}, bypass_csp=True, accept_downloads=True)
    pg = ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))

    # ---------- routes, footer, header ----------
    for path in PAGES:
        go(pg, path, d)
        check(f"{tag} {path} one h1", pg.locator("#main h1").count() == 1)
        check(f"{tag} {path} rendered by the support module", pg.locator("[data-su]").count() == 1)
        check(f"{tag} {path} no overflow", pg.evaluate("document.documentElement.scrollWidth <= innerWidth"))
        foot = pg.evaluate("() => [...document.querySelectorAll('footer a')].map(a => [a.textContent.replace(/[↗→]/g, '').trim(), new URL(a.href).pathname])")
        for label, href in FOOTER:
            check(f"{tag} {path} footer link {label}", [label, href] in foot, str(foot)[:200])
        if path == "/help":
            hdr = set(pg.evaluate("() => [...document.querySelectorAll('header a, #mobile-nav a')].map(a => new URL(a.href).pathname)"))
            added = (hdr & {h for _, h in FOOTER}) - PRE_EXISTING_HEADER.get(d, set())
            check(f"{tag} no support/policy links added to header or menu", not added, str(added))
            groups = pg.evaluate("() => [...document.querySelectorAll('footer h2, footer h3')].map(h => h.textContent.trim())")
            check(f"{tag} footer groups", all(g in groups for g in ["Customer care", "Orders & delivery", "Privacy & legal"]), str(groups))
            check(f"{tag} design kept on footer links", pg.evaluate(f"() => [...document.querySelectorAll('footer a[href*=\"/policies/\"]')].every(a => a.href.includes('design={d}'))"))
        if w in (1440, 390) and path in ("/help", "/contact", "/settings", "/policies/privacy"):
            axe(pg, tag, path)
    if not full:
        check(f"{tag} no page errors", not errs, str(errs[:3])); ctx.close(); return

    # ---------- help: search, categories, article, feedback ----------
    go(pg, "/help", d)
    pg.fill("#su-q", "refund"); pg.press("#su-q", "Enter"); pg.wait_for_timeout(300)
    res = pg.locator("[data-su-results] li a")
    check(f"{tag} search finds refund answers", res.count() >= 3)
    check(f"{tag} search covers policies", any("/policies/" in (res.nth(i).get_attribute("href") or "") for i in range(res.count())))
    check(f"{tag} search is shareable", "q=refund" in pg.url)
    pg.fill("#su-q", "zzqqxx"); pg.press("#su-q", "Enter"); pg.wait_for_timeout(300)
    check(f"{tag} search empty state", "no results" in pg.inner_text("[data-su-results]").lower())
    check(f"{tag} seven categories", pg.locator(".su-cats li").count() == 7)
    check(f"{tag} four quick actions", pg.locator(".su-quick li").count() == 4)
    go(pg, "/help/returns", d)
    check(f"{tag} category page lists answers", pg.locator(".su-article-list li").count() >= 3)
    go(pg, "/help/delivery/parcel-problem", d)
    check(f"{tag} article readable as guest", "late, lost, damaged" in pg.inner_text("#main h1").lower())
    pg.click("[data-su-fb-no]"); pg.wait_for_timeout(100)
    pg.check("input[name=su-fb-reason][value=incomplete]"); pg.click("[data-su-fb-send]"); pg.wait_for_timeout(500)
    check(f"{tag} answer feedback saved", "feedback saved" in pg.inner_text("[data-su-fb]").lower())
    snap = admin()("GET", "/api/admin")
    check(f"{tag} feedback reaches operations", any(f["article"] == "parcel-problem" and f["no"] >= 1 for f in snap.get("help_feedback", [])))
    # escalation keeps the context
    pg.click(".su-escalate a"); pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(200)
    check(f"{tag} escalation preselects topic", pg.eval_on_selector("#su-topic", "s => s.value") == "delivery")
    check(f"{tag} escalation shows the article context", "late, lost" in pg.inner_text("[data-su-context]").lower())

    # ---------- contact: validation keeps input, photo, confirmation, case page, reply ----------
    pg.fill("#su-message", "Short")
    pg.fill("#su-name", "")
    pg.click("[data-su-submit]"); pg.wait_for_timeout(200)
    check(f"{tag} contact field errors shown", pg.locator('#su-name[aria-invalid="true"]').count() == 1 and pg.locator('#su-message[aria-invalid="true"]').count() == 1)
    check(f"{tag} contact keeps typed message", pg.input_value("#su-message") == "Short")
    check(f"{tag} focus moves to first error", pg.evaluate("document.activeElement.id") == "su-name")
    pg.fill("#su-name", "QA Person"); pg.fill("#su-mobile", "9876543210")
    pg.fill("#su-message", "The parcel arrived with a crushed corner and one tub open.")
    pg.set_input_files("#su-photos", files=[{"name": "parcel.png", "mimeType": "image/png", "buffer": png()}])
    check(f"{tag} photo listed", "parcel.png" in pg.inner_text("[data-su-files]"))
    pg.click("[data-su-submit]")
    pg.wait_for_selector("[data-su-done]:not([hidden])", timeout=8000)
    done = pg.inner_text("[data-su-done]")
    cid = re.search(r"CASE-[0-9A-F]{8}", done).group(0)
    check(f"{tag} real case reference", bool(cid))
    check(f"{tag} confirmation doesn't claim a message was sent", "sms" in done.lower() and "can’t send" in done.lower())
    pg.click("[data-su-done] a.su-btn"); pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(200)
    check(f"{tag} case page shows progress", "crushed corner" in pg.inner_text("[data-su-case]") and "1 photo attached" in pg.inner_text("[data-su-case]"))
    pg.fill("#su-reply", "Adding: the lot number is DEMO-02-01."); pg.click("[data-su-reply] button[type=submit]"); pg.wait_for_timeout(700)
    check(f"{tag} case reply recorded", "you added information" in pg.inner_text("[data-su-case]").lower())
    # another browser can't see it
    other = b.new_context(viewport={"width": w, "height": 900}).new_page()
    other.goto(f"{BASE}/account/support/{cid}?design={d}", wait_until="networkidle")
    check(f"{tag} case private to its owner", "couldn’t find that case" in other.inner_text("#main").lower())
    other.context.close()
    # order context from the order page + privacy topic routing
    oid = order_in_browser(pg)
    go(pg, f"/contact?order={oid}&kind=delivery", d)
    check(f"{tag} order reference carried", pg.input_value("#su-order") == oid)
    pg.select_option("#su-topic", "privacy")
    check(f"{tag} privacy topic routes to verified requests", pg.locator("[data-su-privacy-note]:not([hidden])").count() == 1 and pg.locator("[data-su-submit]").is_hidden())
    pg.select_option("#su-topic", "safety")
    check(f"{tag} safety guidance shown", pg.locator("[data-su-safety-note]:not([hidden])").count() == 1)

    # ---------- preferences: real analytics switch, reduce motion ----------
    go(pg, "/settings", d)
    pg.check("[data-su-pref-browser] input[name=analytics]"); pg.check("[data-su-pref-browser] input[name=motion]")
    pg.click("[data-su-pref-browser] button[type=submit]"); pg.wait_for_timeout(200)
    check(f"{tag} browser choices saved", "saved in this browser" in pg.inner_text("[data-su-pref-status]").lower())
    check(f"{tag} reduce motion applied", pg.evaluate("document.documentElement.dataset.motion") == "reduce")
    check(f"{tag} scripts see reduced motion", pg.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches"))
    sent = []
    pg.on("request", lambda r: sent.append(r.url) if r.url.endswith("/api/events") else None)
    go(pg, "/shop", d); pg.evaluate("window.BCCApp.event('qa_probe')"); pg.wait_for_timeout(300)
    check(f"{tag} analytics on records events", len(sent) >= 1)
    go(pg, "/settings", d)
    check(f"{tag} preferences show current state", pg.is_checked("[data-su-pref-browser] input[name=analytics]"))
    pg.uncheck("[data-su-pref-browser] input[name=analytics]"); pg.uncheck("[data-su-pref-browser] input[name=motion]")
    pg.click("[data-su-pref-browser] button[type=submit]"); pg.wait_for_timeout(200)
    sent.clear(); go(pg, "/shop", d); pg.evaluate("window.BCCApp.event('qa_probe')"); pg.wait_for_timeout(300)
    check(f"{tag} analytics off records nothing", not sent, str(sent))
    go(pg, "/settings", d)
    check(f"{tag} marketing needs sign-in", "sign in to manage" in pg.inner_text("#main").lower())

    # ---------- signed in: marketing, cancellation, problem report, privacy ----------
    m = mobile()
    go(pg, "/sign-in?next=/account/preferences", d)
    pg.fill("#ac-mobile", m); pg.click("[data-ac-mobile] button[type=submit]"); pg.wait_for_selector("[data-ac-code]:not([hidden])")
    code = re.search(r"(\d{6})", pg.inner_text("[data-ac-preview]")).group(1)
    pg.fill("#ac-code", code); pg.click("[data-ac-code] button[type=submit]"); pg.wait_for_url(re.compile(r"/account/preferences"), timeout=8000); pg.wait_for_timeout(300)
    pg.check("[data-su-pref-account] input[name=whatsapp]"); pg.click("[data-su-pref-account] button[type=submit]"); pg.wait_for_timeout(500)
    check(f"{tag} marketing saved to account", "saved to your account" in pg.inner_text("[data-su-pref-acct-status]").lower())
    go(pg, "/settings", d)
    check(f"{tag} marketing state persists", pg.is_checked("[data-su-pref-account] input[name=whatsapp]") and not pg.is_checked("[data-su-pref-account] input[name=email]"))
    # cancellation: eligibility first, then the server's answer
    oid = order_in_browser(pg)
    go(pg, f"/orders/{oid}", d)
    pg.click("[data-ac-cancel]"); pg.wait_for_selector("[data-ac-cancel-confirm]", timeout=6000)
    panel = pg.inner_text("[data-ac-cancel-panel]").lower()
    check(f"{tag} cancellation explains refund first", "full amount" in panel and "no cancellation charge" in panel)
    check(f"{tag} order not cancelled before confirming", browser_api(pg, "GET", f"/orders/{oid}/status")["state"] == "paid")
    pg.click("[data-ac-cancel-confirm]"); pg.wait_for_timeout(900)
    check(f"{tag} cancellation confirmed by server", browser_api(pg, "GET", f"/orders/{oid}/status")["state"] == "cancelled" and "cancelled" in pg.inner_text("#main h1").lower())
    # report a problem on a delivered order
    oid = order_in_browser(pg, deliver=True)
    go(pg, f"/orders/{oid}", d)
    check(f"{tag} delivered order can't be cancelled", pg.locator("[data-ac-cancel]").count() == 0)
    pg.click("[data-ac-problem]")
    pg.click("[data-ac-return-form] button[type=submit]"); pg.wait_for_timeout(150)
    check(f"{tag} problem form explains missing answers", pg.locator("#ac-ret-reason-err:not([hidden])").count() == 1)
    pg.check("[data-ac-return-form] input[name=reason][value=damaged]"); pg.check("[data-ac-return-form] input[name=remedy][value=replacement]")
    pg.fill("#ac-ret-msg", "One tub arrived cracked and the powder spilled.")
    pg.click("[data-ac-return-form] button[type=submit]"); pg.wait_for_selector("#order-cases", timeout=8000)
    check(f"{tag} problem report linked to the order", "arrived damaged" in pg.inner_text("#order-cases").lower())
    # privacy: download and a tracked request
    go(pg, "/account/profile", d)
    with pg.expect_download() as dl:
        pg.click("[data-ac-export]")
    data = json.loads(open(dl.value.path()).read())
    check(f"{tag} data download is this customer's", data["account"]["mobile"] == m)
    pg.select_option("#ac-priv-kind", "erasure"); pg.click("[data-ac-privacy] button[type=submit]"); pg.wait_for_timeout(600)
    st = pg.inner_text("[data-ac-priv-status]")
    check(f"{tag} privacy request acknowledged", bool(re.search(r"CASE-[0-9A-F]{8}", st)))
    check(f"{tag} no page errors", not errs, str(errs[:3]))
    ctx.close()


if __name__ == "__main__":
    with sync_playwright() as p:
        b = p.chromium.launch()
        for d in DESIGNS:
            for w in WIDTHS:
                before = len(fails)
                try:
                    run(b, d, w, full=w != 768)
                except Exception as e:
                    fails.append(f"{d} {w} crashed: {type(e).__name__}: {str(e)[:300]}")
                print(d, w, "pass" if len(fails) == before else "fail", [f[:160] for f in fails[before:][:30]], flush=True)
        b.close()
    print(f"{len(results)} checks, {len(fails)} failures")
    sys.exit(1 if fails else 0)
