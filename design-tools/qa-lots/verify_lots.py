"""Verify Lot Reports across all eight directions.

Usage: python3 design-tools/qa-lots/verify_lots.py BASE [designs] [widths] [--static]
  BASE      a LOCAL TEST app server on a fresh database (fixtures are published through the real workflow), or
            the static Netlify preview with --static (demonstration lots only).
Set AXE_JS to axe.min.js for an accessibility scan.
"""
import json, os, re, sys, tempfile
sys.path.insert(0, os.path.dirname(__file__))
from playwright.sync_api import sync_playwright

args = [a for a in sys.argv[1:] if not a.startswith("--")]
STATIC = "--static" in sys.argv
BASE = args[0].rstrip("/")
DESIGNS = args[1] if len(args) > 1 else "abcdefgh"
WIDTHS = [int(w) for w in (args[2] if len(args) > 2 else "1440,390").split(",")]
AXE = os.environ.get("AXE_JS")
results, fails = [], []


def check(name, ok, detail=""):
    results.append(name)
    if not ok:
        fails.append(f"{name} {detail}".strip())


def setup():
    """Fixtures, published through the same two-Admin API the operations page uses."""
    import fixture as F
    F.BASE = BASE
    a, b = F.Client(), F.Client()
    a.login("admin-a"); b.login("admin-b")

    def publish(product, lot, rec):
        d = a.req("POST", "/api/admin/lot_draft", {"product": product, "lot": lot})
        a.req("POST", "/api/admin/lot_update", {"id": d["id"], "record": rec})
        a.req("POST", f"/api/admin-lot-document?report={d['id']}&title=QA%20fixture%20certificate&kind=original", F.PDF, "application/pdf")
        apr = a.req("POST", "/api/admin/lot_submit", {"id": d["id"]})
        b.req("POST", "/api/admin/approve", {"id": apr["id"], "decision": "approve"})
        return d["id"]
    publish("iron-bisglycinate", "DEMO-01-02", F.RECORD)
    publish("iron-bisglycinate", "DEMO-01-02", dict(F.RECORD, change_note="QA fixture: version 2 corrects a transcription."))
    n = a.req("POST", "/api/admin/lot_notice_request", {"product": "vitamin-d3-k2", "lot": "DEMO-03-02", "kind": "restriction", "title": "QA fixture notice: do not use this batch", "body": "QA fixture instructions: stop using packs from this lot and contact Product safety support."})
    b.req("POST", "/api/admin/approve", {"id": n["id"], "decision": "approve"})
    d = a.req("POST", "/api/admin/lot_draft", {"product": "omega-3-fish-oil", "lot": "DEMO-04-02"})
    a.req("POST", "/api/admin/lot_update", {"id": d["id"], "record": F.RECORD})
    a.req("POST", f"/api/admin-lot-document?report={d['id']}&title=QA%20fixture&kind=original", F.PDF, "application/pdf")
    a.req("POST", "/api/admin/lot_submit", {"id": d["id"]})
    rid = publish("myo-d-chiro-inositol", "DEMO-05-02", F.RECORD)
    w = a.req("POST", "/api/admin/lot_withdraw_request", {"id": rid, "reason": "QA fixture: the laboratory withdrew this certificate."})
    b.req("POST", "/api/admin/approve", {"id": w["id"], "decision": "approve"})


def png():
    from PIL import Image
    f = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
    Image.new("RGB", (40, 30), (170, 71, 46)).save(f.name)
    return f.name


def lo(pg, sel):
    return pg.inner_text(sel).lower()


def lookup(pg, product, lot):
    pg.eval_on_selector(f"#lot-form input[name=product][value='{product}']", "e => e.checked || e.click()")
    pg.fill("#lt-lot", lot)
    pg.evaluate("document.querySelector('#report-result').innerHTML = ''")
    pg.click("#lot-form .lt-submit")
    pg.wait_for_function("() => !document.querySelector('#report-result[aria-busy]') && document.querySelector('#lt-match-h')", timeout=8000)
    pg.wait_for_timeout(150)


def run(b, d, w):
    tag = f"{d} {w}"
    ctx = b.new_context(viewport={"width": w, "height": 900}, bypass_csp=True)
    ctx.grant_permissions(["clipboard-read", "clipboard-write"], origin=BASE)
    pg = ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(f"{BASE}/reports?design={d}", wait_until="networkidle"); pg.wait_for_timeout(300)

    check(f"{tag} one h1", pg.locator("h1").count() == 1 and "your batch" in lo(pg, "h1").lower() and "record" in lo(pg, "h1").lower())
    order = pg.evaluate("() => ['find','where','record','understand','archive','help'].map(id => document.getElementById(id)).every((e, i, a) => e && (!i || (a[i-1].compareDocumentPosition(e) & 4)))")
    check(f"{tag} section order", order)
    top = pg.evaluate("document.getElementById('lt-lot').getBoundingClientRect().top")
    check(f"{tag} lookup near the top", top < (900 if w > 1000 else 1700), str(top))
    check(f"{tag} no overflow", pg.evaluate("document.documentElement.scrollWidth") <= w)
    text = lo(pg, ".lt")
    for bad in ["100% safe", "toxin-free", "clinically proven", "guaranteed"]:
        check(f"{tag} no '{bad}' claim", bad not in text.lower())
    check(f"{tag} no notification control", pg.locator(".lt input[type=email], .lt [data-notify]").count() == 0)

    # Validation
    pg.click("#lot-form .lt-submit"); pg.wait_for_timeout(150)
    check(f"{tag} product required", pg.is_visible("#lt-product-error") and pg.evaluate("document.activeElement.name") == "product")
    pg.eval_on_selector("#lot-form input[name=product][value='iron-bisglycinate']", "e => e.checked || e.click()")
    pg.click("#lot-form .lt-submit"); pg.wait_for_timeout(150)
    check(f"{tag} lot required", pg.is_visible("#lt-lot-error") and pg.get_attribute("#lt-lot", "aria-invalid") == "true" and pg.evaluate("document.activeElement.id") == "lt-lot")

    # Where is my lot number
    pg.locator("#where summary").click()
    check(f"{tag} where: four definitions, no invented photo", pg.locator("#where dt").count() == 4 and pg.locator("#where img").count() == 0)

    # Demonstration match with trimmed, case-folded entry
    lookup(pg, "iron-bisglycinate", "  demo-01-01 ")
    check(f"{tag} match heading", "demo-01-01" in lo(pg, "#lt-match-h") and pg.evaluate("document.activeElement.id") == "lt-match-h")
    check(f"{tag} searched note", "we searched for" in lo(pg, "#report-result"))
    check(f"{tag} demo labelled", pg.locator("#report-result .lt-demo").count() == 1)
    check(f"{tag} stable url", "/reports/iron-bisglycinate/DEMO-01-01" in pg.url and f"design={d}" in pg.url, pg.url)
    check(f"{tag} entries kept", pg.input_value("#lt-lot") == "  demo-01-01 ")
    check(f"{tag} three statuses", pg.locator(".lt-trio .lt-st").count() == 3 and "not available yet" in lo(pg, ".lt-st-doc") and "cannot be assessed" in lo(pg, ".lt-st-test") and "no confirmed notice" in lo(pg, ".lt-st-notice"))
    check(f"{tag} status announced", "record found" in lo(pg, "#lt-status"))

    # No match: exact only
    lookup(pg, "iron-bisglycinate", "DEMO-01-0O")
    t = lo(pg, "#report-result")
    check(f"{tag} no match", "no record matches" in t and "demo-01-01" not in t and "isn't genuine" in t)
    # Other product
    lookup(pg, "vitamin-d3-k2", "DEMO-01-01")
    check(f"{tag} other product", "different product" in lo(pg, "#lt-match-h"))
    pg.evaluate("document.querySelector('#lt-match-h').removeAttribute('id')")
    pg.click("[data-lt-switch='iron-bisglycinate']")
    pg.wait_for_function("() => document.querySelector('#lt-match-h')?.innerText.toLowerCase().includes('iron')", timeout=8000)
    check(f"{tag} switch product", pg.evaluate("document.querySelector('#lot-form input[name=product]:checked').value") == "iron-bisglycinate")
    # Outage keeps the entry
    lookup(pg, "iron-bisglycinate", "DEMO-OUTAGE")
    check(f"{tag} outage", "isn’t responding" in lo(pg, "#lt-match-h") and pg.input_value("#lt-lot") == "DEMO-OUTAGE" and pg.locator("[data-lt-retry]").count() == 1)
    # Demonstration notice
    lookup(pg, "iron-bisglycinate", "DEMO-NOTICE")
    check(f"{tag} demo notice", pg.locator(".lt-notice").count() == 1 and "demonstration" in lo(pg, ".lt-notice").lower() and "kind=safety" in pg.get_attribute(".lt-notice a", "href"))
    lookup(pg, "iron-bisglycinate", "DEMO-SUPERSEDED")
    check(f"{tag} demo history", pg.locator(".lt-history li").count() == 2)
    lookup(pg, "iron-bisglycinate", "DEMO-UNPUBLISHED")
    check(f"{tag} under review (demo)", "under review" in lo(pg, ".lt-st-doc"))

    if not STATIC:
        lookup(pg, "iron-bisglycinate", "DEMO-01-02")
        res = lo(pg, "#results") + lo(pg, "#documents")
        for v in ["<0.05", "ND (LOD 0.01)", "95.1–98.0", "Source: QA fixture spec v1", "None stated"]:
            check(f"{tag} result kept: {v}", v.lower() in res)
        check(f"{tag} assessments", pg.locator(".lt-assess.is-meets").count() == 2 and pg.locator(".lt-assess.is-na").count() == 2)
        check(f"{tag} partly assessed", "partly assessed" in lo(pg, ".lt-st-test") and "published" in lo(pg, ".lt-st-doc"))
        check(f"{tag} table semantics", pg.locator("#documents table caption").count() == 1 and pg.locator("#documents thead th[scope=col]").count() == 7 and pg.locator("#documents tbody th[scope=row]").count() == 4)
        href = pg.get_attribute(".lt-doc a.lt-btn", "href")
        r = pg.request.get(BASE + href)
        check(f"{tag} document served", r.status == 200 and r.headers.get("content-type") == "application/pdf" and r.body()[:5] == b"%PDF-")
        check(f"{tag} download link", pg.locator(".lt-doc a[download]").count() == 1 and "download=1" in pg.get_attribute(".lt-doc a[download]", "href"))
        check(f"{tag} fingerprint", len(pg.eval_on_selector(".lt-hash code", "e => e.textContent").strip()) == 64)
        lab = lo(pg, ".lt-lab")
        check(f"{tag} lab + scope disclaimer", "qa fixture laboratory" in lab and "isn’t an accreditation of body café co." in lab and "some of the tests" in lab)
        check(f"{tag} external verify link", pg.get_attribute(".lt-lab a[target=_blank]", "rel") == "noopener noreferrer")
        hist = lo(pg, ".lt-history")
        check(f"{tag} versions", "version 2" in hist and "version 1" in hist and "superseded" in hist and "corrects a transcription" in hist)
        check(f"{tag} demo label on rehearsal record", pg.locator("#report-result .lt-demo").count() == 1)
        # Share and print
        pg.click("[data-lt-share]"); pg.wait_for_timeout(200)
        clip = pg.evaluate("navigator.clipboard.readText().catch(() => '')")
        check(f"{tag} copy link", clip.endswith("/reports/iron-bisglycinate/DEMO-01-02"), clip)
        pg.evaluate("dispatchEvent(new Event('beforeprint'))"); pg.emulate_media(media="print")
        sheet = lo(pg, "#lt-print-root") if pg.locator("#lt-print-root").count() else ""
        check(f"{tag} print summary", all(x.lower() in sheet for x in ["DEMO-01-02", "Report version", "2, published", "Printed", "DEMONSTRATION RECORD", "<0.05"]), sheet[:120])
        check(f"{tag} print hides page", pg.evaluate("getComputedStyle(document.querySelector('#app')).display") == "none")
        pg.emulate_media(media="screen"); pg.evaluate("dispatchEvent(new Event('afterprint'))")
        # Real (fixture) notice, review and withdrawal
        lookup(pg, "vitamin-d3-k2", "DEMO-03-02")
        check(f"{tag} notice", "qa fixture notice" in lo(pg, ".lt-notice") and "1 confirmed notice" in lo(pg, ".lt-st-notice") and "not available yet" in lo(pg, ".lt-st-doc"))
        lookup(pg, "omega-3-fish-oil", "DEMO-04-02")
        check(f"{tag} under review", "under review" in lo(pg, ".lt-st-doc") and pg.locator("#documents table").count() == 0)
        lookup(pg, "myo-d-chiro-inositol", "DEMO-05-02")
        check(f"{tag} withdrawn report", "report withdrawn" in lo(pg, ".lt-st-doc") and "withdrew this certificate" in lo(pg, "#report-result") and "no confirmed notice" in lo(pg, ".lt-st-notice") and pg.locator(".lt-doc").count() == 0)
        if AXE:
            lookup(pg, "iron-bisglycinate", "DEMO-01-02")
            pg.add_script_tag(path=AXE)
            v = pg.evaluate("""async()=>{const r=await axe.run(document.querySelector('.lt'),{resultTypes:['violations']});return r.violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>v.id+':'+v.nodes.length+':'+v.nodes[0].target.join(' '))}""")
            check(f"{tag} axe serious/critical (record)", not v, str(v))

    # Archive
    pg.wait_for_function("() => document.querySelector('#lt-arch-count')?.textContent.length > 0", timeout=8000)
    if not STATIC:
        row = pg.locator(".lt-arch-row", has_text="DEMO-01-02")
        check(f"{tag} archive lists the published version", row.count() == 1 and "published" in row.inner_text().lower() and "v2" in row.inner_text().lower() and "demonstration" in row.inner_text().lower())
        check(f"{tag} archive keeps withdrawn", "report withdrawn" in pg.locator(".lt-arch-row", has_text="DEMO-05-02").inner_text().lower())
    pg.select_option("#lt-arch-product", "l-theanine"); pg.wait_for_timeout(500)
    rows = pg.eval_on_selector_all(".lt-arch-row .lt-arch-p", "e => e.map(x => x.textContent)")
    check(f"{tag} archive filter", rows and all(r == "L-Theanine" for r in rows), str(rows))
    pg.select_option("#lt-arch-product", ""); pg.fill("#lt-arch-q", "05-02"); pg.wait_for_timeout(700)
    check(f"{tag} archive search", pg.locator(".lt-arch-row").count() >= 1 and all("05-02" in x for x in pg.eval_on_selector_all(".lt-arch-lot", "e => e.map(x => x.textContent)")))
    check(f"{tag} archive caveat", "isn’t necessarily the one a new order will receive" in lo(pg, "#archive"))
    pg.locator(".lt-arch-row a").first.click()
    pg.wait_for_function("() => document.querySelector('#lt-match-h')?.innerText.includes('05-02')", timeout=8000)
    check(f"{tag} archive opens record", "/reports/myo-d-chiro-inositol/DEMO-05-02" in pg.url)

    # Cross-links and design parameter
    hrefs = pg.eval_on_selector_all(".lt a[href^='/']", "e => e.map(a => a.getAttribute('href'))")
    for target in ["/learn/understanding-reports", "/learn/glossary", "/standards#lot", "/contact?kind=report"]:
        check(f"{tag} link {target}", any(h.startswith(target.split('#')[0]) and (('#' not in target) or target.split('#')[1] in h) for h in hrefs))
    if d != "a":
        check(f"{tag} design kept", all(f"design={d}" in h for h in hrefs if not h.startswith("/api/")), str([h for h in hrefs if f"design={d}" not in h and not h.startswith('/api/')][:3]))
    unnamed = pg.evaluate("() => [...document.querySelectorAll('.lt button, .lt a')].filter(e => !(e.getAttribute('aria-label') || e.textContent.trim())).length")
    check(f"{tag} controls named", unnamed == 0)
    check(f"{tag} images have alt", pg.evaluate("() => [...document.querySelectorAll('.lt img')].every(i => i.hasAttribute('alt'))"))
    if AXE and STATIC:
        pg.add_script_tag(path=AXE)
        v = pg.evaluate("""async()=>{const r=await axe.run(document.querySelector('.lt'),{resultTypes:['violations']});return r.violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>v.id+':'+v.nodes.length+':'+v.nodes[0].target.join(' '))}""")
        check(f"{tag} axe serious/critical", not v, str(v))
    check(f"{tag} no overflow after results", pg.evaluate("document.documentElement.scrollWidth") <= w)

    # Keyboard: product radios follow arrow keys
    pg.goto(f"{BASE}/reports?product=l-theanine&design={d}", wait_until="networkidle"); pg.wait_for_timeout(300)
    check(f"{tag} product preselected", pg.evaluate("document.querySelector('#lot-form input[name=product]:checked')?.value") == "l-theanine")
    pg.focus("#lot-form input[name=product]:checked"); pg.keyboard.press("ArrowRight")
    check(f"{tag} radio keyboard", pg.evaluate("document.querySelector('#lot-form input[name=product]:checked').value") == "vitamin-d3-k2")
    # Direct record link
    pg.goto(f"{BASE}/reports/iron-bisglycinate/DEMO-01-01?design={d}", wait_until="networkidle")
    pg.wait_for_function("() => document.querySelector('#lt-match-h')", timeout=8000)
    check(f"{tag} direct link", "demo-01-01" in lo(pg, "#lt-match-h") and pg.input_value("#lt-lot") == "DEMO-01-01")

    # Ask about this lot → contact with context (+ photo and a real case on the app server)
    href = pg.get_attribute("#lt-asks a.lt-ask", "href")
    check(f"{tag} ask context", "kind=report" in href and "topic=%2Freports%2Firon-bisglycinate%2FDEMO-01-01" in href and "lot=DEMO-01-01" in href, href)
    if not STATIC:
        pg.click("#lt-asks a.lt-ask"); pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(300)
        check(f"{tag} contact topic", "/reports/iron-bisglycinate/demo-01-01" in lo(pg, "[data-su-context]") and "lot demo-01-01" in lo(pg, "[data-su-context]") and pg.eval_on_selector("#su-topic", "s => s.value") == "report")
        check(f"{tag} photo field", pg.locator("#su-photos").count() == 1)
        if w > 1000:
            pg.set_input_files("#su-photos", png())
            pg.fill("#su-name", "QA Person"); pg.fill("#su-mobile", "9876543210")
            pg.fill("#su-message", "I can't find the report for my pack.")
            pg.click("[data-su-submit]"); pg.wait_for_timeout(1500)
            cid = re.search(r"CASE-[0-9A-F]{8}", pg.inner_text("[data-su-done]"))
            check(f"{tag} case created", bool(cid), lo(pg, "[data-su-done]")[:120])
            acct = pg.evaluate("fetch('/api/account').then(r => r.json())")
            case = next((c for c in acct["cases"] if cid and c["id"] == cid.group(0)), {})
            check(f"{tag} case context", case.get("topic") == "/reports/iron-bisglycinate/DEMO-01-01" and case.get("lot") == "DEMO-01-01" and len(case.get("media", [])) == 1, json.dumps(case)[:200])

    check(f"{tag} no page errors", not errs, str(errs[:2]))
    ctx.close()


def run_reduced(b, d):
    ctx = b.new_context(viewport={"width": 1200, "height": 900}, reduced_motion="reduce")
    pg = ctx.new_page()
    pg.goto(f"{BASE}/reports/iron-bisglycinate/DEMO-01-01?design={d}", wait_until="networkidle")
    pg.wait_for_function("() => document.querySelector('#lt-match-h')", timeout=8000)
    check(f"{d} reduced motion", pg.evaluate("getComputedStyle(document.querySelector('.lt-plus')).transitionDuration") in ("0s", "0s, 0s"))
    ctx.close()


def run_ops(b):
    ctx = b.new_context(viewport={"width": 1440, "height": 900})
    pg = ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    for who in ["admin-a", "viewer"]:
        pg.goto(f"{BASE}/ops", wait_until="networkidle")
        if pg.locator("[data-demo-login]").count() == 0:
            pg.evaluate("fetch('/api/logout',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':''}})")
        pg.evaluate(f"""async()=>{{const s=await (await fetch('/api/session')).json();await fetch('/api/demo/login',{{method:'POST',headers:{{'Content-Type':'application/json','X-CSRF-Token':s.csrf}},body:JSON.stringify({{identity:'{who}'}})}})}}""")
        pg.goto(f"{BASE}/ops/lots", wait_until="networkidle"); pg.wait_for_timeout(300)
        check(f"ops {who}: versions listed", pg.locator(".lot-card").count() >= 4)
        disabled = pg.evaluate("() => [...document.querySelectorAll('[data-lot-ops] button')].every(b => b.disabled)")
        check(f"ops {who}: write controls", disabled if who == "viewer" else not disabled)
    check("ops: no page errors", not errs, str(errs[:2]))
    ctx.close()


if not STATIC and not os.environ.get('LOTS_SKIP_SETUP'):
    setup()
with sync_playwright() as p:
    b = p.chromium.launch()
    for d in DESIGNS:
        for w in WIDTHS:
            n = len(fails)
            try:
                run(b, d, w)
            except Exception as e:
                fails.append(f"{d} {w} crashed: {str(e)[:300]}")
            print(d, w, "fail" if len(fails) > n else "pass", fails[n:], flush=True)
        n = len(fails)
        try:
            run_reduced(b, d)
        except Exception as e:
            fails.append(f"{d} reduced crashed: {e}")
        print(d, "reduced", "fail" if len(fails) > n else "pass", fails[n:], flush=True)
    if not STATIC:
        n = len(fails)
        try:
            run_ops(b)
        except Exception as e:
            fails.append(f"ops crashed: {e}")
        print("ops", "fail" if len(fails) > n else "pass", fails[n:], flush=True)
    b.close()
print(f"{len(results)} checks, {len(fails)} failures")
for f in fails:
    print(" -", f)
sys.exit(1 if fails else 0)
