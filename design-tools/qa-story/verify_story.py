"""Verify the Story page across all eight directions.

Usage: python3 design-tools/qa-story/verify_story.py BASE [designs] [widths] [--static]
  BASE      e.g. http://127.0.0.1:4200 (app server) or the static preview
  --static  skip the live support-case submission (the static preview disables it)
Set AXE_JS to axe.min.js to include an accessibility scan.

Checks per direction and width: one h1, chapter order, nav ↔ sections, no founder placeholder copy, no overflow,
shared anchors, chapter nav (hash, aria-current, focus), copy link, object tabs (keyboard), image viewer (focus,
arrows, Escape, focus return), progress bar, cross-links, design parameter kept, named controls, About ≠ Story,
"Ask about our story" carries the chapter into the contact form (and creates a real case on the app server),
axe (serious/critical), reduced motion; plus a founder-material fixture (desktop) that must render chapters 2, 6, 7,
the timeline, packaging viewer, changed decision and captioned media in the right order.
"""
import os, re, sys, json
from playwright.sync_api import sync_playwright

args = [a for a in sys.argv[1:] if not a.startswith("--")]
STATIC = "--static" in sys.argv
BASE = args[0].rstrip("/")
DESIGNS = args[1] if len(args) > 1 else "abcdefgh"
WIDTHS = [int(w) for w in (args[2] if len(args) > 2 else "1440,390").split(",")]
AXE = os.environ.get("AXE_JS")

ORDER = ["opening", "before", "question", "name", "collection", "lessons", "founder", "next"]
PUBLIC = ["opening", "question", "name", "collection", "next"]
TITLES = {"opening": "The opening moment", "before": "Before there was a brand", "question": "The question we kept asking", "name": "Becoming Body Café Co.",
          "collection": "Making the first collection", "lessons": "What the journey taught us", "founder": "A note from the founder", "next": "The next chapter"}
BANNED = re.compile(r"\b(TODO|TBD|lorem|placeholder|coming soon|founder'?s? (story|note) (will|is)|in their own words|awaiting founder)\b", re.I)

FIXTURE = {
    "before": {"paragraphs": ["QA fixture paragraph one.", "QA fixture paragraph two."], "photos": [{"src": "/web/media/about/caps-row.webp", "alt": "QA photo", "w": 2340, "h": 360, "caption": "QA caption"}]},
    "lessons": [{"title": "QA lesson", "text": "QA lesson text.", "link": ["/standards", "QA link"]}],
    "changed": {"title": "QA decision", "before": "QA before", "after": "QA after", "why": "QA why"},
    "timeline": [{"date": "QA 1", "title": "One", "text": "a"}, {"date": "QA 2", "title": "Two", "text": "b"}, {"date": "QA 3", "title": "Three", "text": "c"}, {"date": "QA 4", "title": "Four", "text": "d"}],
    "packaging": [{"label": "QA v1", "src": "/web/media/l-theanine.webp", "alt": "QA v1", "w": 774, "h": 1000, "changed": "QA change 1"}, {"label": "QA v2", "src": "/web/media/iron-bisglycinate.webp", "alt": "QA v2", "w": 774, "h": 1000, "changed": "QA change 2"}],
    "note": {"paragraphs": ["QA note."], "name": "QA Name", "role": "QA Role", "portrait": {"src": "/web/media/renders/iron-bisglycinate-cap.webp", "alt": "QA portrait", "w": 400, "h": 400}},
    "media": {"kind": "video", "src": "/web/media/none.mp4", "captions": "/web/media/none.vtt", "transcript": ["QA transcript."]},
    "objects": [],
}

results, fails = [], []
def check(name, ok, detail=""):
    results.append(name)
    if not ok:
        fails.append(f"{name} {detail}".strip())

def run_design(b, d, w):
    tag = f"{d} {w}"
    ctx = b.new_context(viewport={"width": w, "height": 900}, bypass_csp=True)
    ctx.grant_permissions(["clipboard-read", "clipboard-write"], origin=BASE)
    pg = ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(f"{BASE}/story?design={d}", wait_until="networkidle")
    pg.wait_for_timeout(300)

    check(f"{tag} one h1", pg.locator("h1").count() == 1)
    check(f"{tag} h1 inside story", pg.locator(".st h1#st-h1").count() == 1)
    ids = pg.eval_on_selector_all(".st-ch", "e=>e.map(x=>x.id)")
    check(f"{tag} chapter order", ids == PUBLIC, str(ids))
    heads = pg.eval_on_selector_all(".st-ch h2", "e=>e.map(x=>x.textContent.trim())")
    check(f"{tag} chapter titles", heads == [TITLES[i] for i in PUBLIC], str(heads))
    navs = pg.eval_on_selector_all("[data-st-nav]", "e=>e.map(x=>x.getAttribute('data-st-nav'))")
    check(f"{tag} nav matches chapters", navs == ids, str(navs))
    check(f"{tag} summary before chapters", pg.evaluate("document.querySelector('.st-summary').compareDocumentPosition(document.querySelector('.st-ch'))&4") > 0)
    text = pg.inner_text(".st")
    m = BANNED.search(text)
    check(f"{tag} no placeholder or founder copy", not m, m.group(0) if m else "")
    check(f"{tag} no invented dates", not re.search(r"\b(19|20)\d\d\b", text), (re.search(r"\b(19|20)\d\d\b", text) or [""])[0])
    check(f"{tag} no overflow", pg.evaluate("document.documentElement.scrollWidth") <= w)
    over = pg.evaluate("""()=>[...document.querySelectorAll('.st *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>innerWidth+1&&!e.closest('.st-nav ol,.st-obj-row')}).slice(0,3).map(e=>e.className||e.tagName)""")
    check(f"{tag} nothing past the edge", not over, str(over))

    # Named controls, real links
    unnamed = pg.evaluate("""()=>[...document.querySelectorAll('.st button,.st a')].filter(e=>!(e.getAttribute('aria-label')||e.textContent.trim()||e.querySelector('img[alt]:not([alt=""])'))).length""")
    check(f"{tag} all controls named", unnamed == 0, str(unnamed))
    dead = pg.evaluate("""()=>[...document.querySelectorAll('.st a')].filter(a=>!a.getAttribute('href')||a.getAttribute('href')==='#').length""")
    check(f"{tag} no dead links", dead == 0, str(dead))
    imgs = pg.evaluate("""()=>[...document.querySelectorAll('.st img')].filter(i=>!i.hasAttribute('alt')).length""")
    check(f"{tag} images have alt", imgs == 0)
    hrefs = pg.eval_on_selector_all(".st a[href]", "e=>e.map(a=>a.getAttribute('href'))")
    for target in ["/about", "/standards", "/learn", "/shop", "/products/"]:
        check(f"{tag} cross-link {target}", any(h.split("?")[0].startswith(target) for h in hrefs))
    if d != "a":
        internal = [h for h in hrefs if h.startswith("/")]
        check(f"{tag} design param kept", internal and all(f"design={d}" in h for h in internal), str([h for h in internal if f"design={d}" not in h][:3]))

    # Broken images
    broken = pg.evaluate("""async()=>{const im=[...document.querySelectorAll('.st img:not([data-st-lb-img])')];im.forEach(i=>i.loading='eager');await Promise.all(im.map(i=>i.decode().catch(()=>0)));return im.filter(i=>!i.naturalWidth).map(i=>i.getAttribute('src'))}""")
    check(f"{tag} images load", not broken, str(broken))

    # Chapter nav: hash, aria-current, focus; sticks below the site header
    pg.click('[data-st-nav="name"]')
    pg.wait_for_timeout(1300)
    check(f"{tag} nav sets hash", pg.evaluate("location.hash") == "#name")
    check(f"{tag} nav keeps design", f"design={d}" in pg.url)
    check(f"{tag} nav aria-current", pg.get_attribute('[data-st-nav="name"]', "aria-current") == "location")
    check(f"{tag} nav focuses heading", pg.evaluate("document.activeElement.id") == "name-t")
    top = pg.evaluate("document.getElementById('name').getBoundingClientRect().top")
    navb = pg.evaluate("document.querySelector('.st-nav').getBoundingClientRect().bottom")
    hdr = pg.evaluate("""()=>{let b=0;document.querySelectorAll('header').forEach(h=>{if(h.closest('.st'))return;const r=h.getBoundingClientRect();if(r.bottom>0&&r.top<5)b=Math.max(b,r.bottom)});return b}""")
    check(f"{tag} chapter lands in view", -2 <= top < 400, str(top))
    heading_top = pg.evaluate("document.getElementById('name-t').getBoundingClientRect().top")
    if not (d == "h" and w > 1100):
        check(f"{tag} heading not under rail", heading_top >= navb - 1, f"{heading_top} {navb}")
        check(f"{tag} rail not under header", pg.evaluate("document.querySelector('.st-nav').getBoundingClientRect().top") >= hdr - 1, f"{hdr}")
    p1 = pg.evaluate("parseFloat((document.querySelector('[data-st-progress]').style.transform.match(/[\\d.]+/)||[0])[0])")
    pg.evaluate("scrollTo({top: document.querySelector('#next').getBoundingClientRect().top + scrollY - 200, behavior: 'instant'})")
    pg.wait_for_timeout(300)
    pg.evaluate("scrollTo({top: document.querySelector('#next').getBoundingClientRect().top + scrollY - 200, behavior: 'instant'})")
    pg.wait_for_timeout(300)
    p2 = pg.evaluate("parseFloat((document.querySelector('[data-st-progress]').style.transform.match(/[\\d.]+/)||[0])[0])")
    check(f"{tag} progress advances", p2 > p1 > 0, f"{p1} {p2}")
    check(f"{tag} spy follows scroll", pg.get_attribute('[data-st-nav="next"]', "aria-current") == "location")

    # Keyboard: focus a nav link and press Enter
    pg.focus('[data-st-nav="question"]'); pg.keyboard.press("Enter"); pg.wait_for_timeout(1200)
    check(f"{tag} keyboard nav", pg.evaluate("location.hash") == "#question" and pg.evaluate("document.activeElement.id") == "question-t")

    # Copy link
    pg.click('[data-st-share="collection"]'); pg.wait_for_timeout(250)
    lab = pg.get_attribute('[data-st-share="collection"]', "aria-label")
    clip = pg.evaluate("navigator.clipboard.readText().catch(()=> '')")
    check(f"{tag} copy link", lab == "Link copied" and clip.endswith("#collection") and "/story" in clip, f"{lab} {clip}")

    # Object tabs with keyboard
    pg.focus('[data-st-obj="cap"]'); pg.keyboard.press("ArrowRight")
    check(f"{tag} objects arrow", pg.get_attribute('[data-st-obj="bottle"]', "aria-selected") == "true" and pg.is_visible("#st-obj-bottle") and not pg.is_visible("#st-obj-cap"))
    pg.keyboard.press("End")
    check(f"{tag} objects End", pg.get_attribute('[data-st-obj="type"]', "aria-selected") == "true" and pg.evaluate("document.activeElement.getAttribute('data-st-obj')") == "type")
    pg.keyboard.press("Home")
    check(f"{tag} objects Home", pg.get_attribute('[data-st-obj="cap"]', "aria-selected") == "true")
    pg.click('[data-st-obj="colours"]')
    check(f"{tag} objects click", pg.is_visible("#st-obj-colours"))

    # Image viewer
    btn = pg.locator("#st-obj-colours [data-st-open]")
    idx = btn.get_attribute("data-st-open")
    btn.click(); pg.wait_for_timeout(150)
    check(f"{tag} viewer opens", pg.evaluate("document.querySelector('[data-st-lightbox]').open"))
    check(f"{tag} viewer focus", pg.evaluate("document.activeElement.hasAttribute('data-st-close')"))
    cap = pg.inner_text("[data-st-lb-cap]")
    check(f"{tag} viewer caption", "Pantone" in cap, cap)
    c1 = pg.inner_text("[data-st-lb-count]"); pg.keyboard.press("ArrowRight"); c2 = pg.inner_text("[data-st-lb-count]")
    check(f"{tag} viewer arrows", c1 != c2 and "of" in c2, f"{c1}|{c2}")
    pg.keyboard.press("ArrowLeft")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(150)
    check(f"{tag} viewer closes", not pg.evaluate("document.querySelector('[data-st-lightbox]').open"))
    check(f"{tag} viewer returns focus", pg.evaluate(f"document.activeElement.getAttribute('data-st-open')") == idx)
    # Focus stays inside the modal while open
    btn.click(); pg.wait_for_timeout(100)
    for _ in range(6): pg.keyboard.press("Tab")
    check(f"{tag} viewer traps focus", pg.evaluate("!!document.activeElement.closest('[data-st-lightbox]')"))
    pg.keyboard.press("Escape")

    # Axe
    if AXE:
        pg.add_script_tag(path=AXE)
        v = pg.evaluate("""async()=>{const r=await axe.run(document.querySelector('.st'),{resultTypes:['violations']});return r.violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>v.id+':'+v.nodes.length+':'+v.nodes[0].target.join(' '))}""")
        check(f"{tag} axe serious/critical", not v, str(v))

    # Ask about our story → contact with the chapter attached
    asks = pg.eval_on_selector_all('.st-ask a', "e=>e.map(a=>a.getAttribute('href'))")
    check(f"{tag} ask per chapter", len(asks) == len(PUBLIC) - 1 and all('topic=%2Fstory%23' in h for h in asks), str(asks[:2]))
    check(f"{tag} closing ask", pg.locator('.st-routes a[href*="topic=%2Fstory"]').count() == 1)
    cur = "collection"
    pg.click('#collection .st-ask a'); pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(300)
    check(f"{tag} ask goes to contact", "/contact" in pg.url and "kind=brand" in pg.url and f"design={d}" in pg.url, pg.url)
    check(f"{tag} ask carries chapter", f"topic=%2Fstory%23{cur}" in pg.url or f"topic=/story#{cur}" in pg.url, f"{cur} {pg.url}")
    form = pg.locator("[data-su-contact]")
    if STATIC:
        # The hosted preview replaces the contact form with an honest "not available in this preview" notice.
        check(f"{tag} static contact renders", pg.locator("main h1").count() == 1)
    else:
        check(f"{tag} contact shows topic", form.count() == 1 and pg.locator("[data-su-context]").count() == 1 and f"/story#{cur}" in pg.inner_text("[data-su-context]"))
        check(f"{tag} contact kind brand", pg.eval_on_selector("#su-topic", "s=>s.value") == "brand")
    if not STATIC and form.count():
        pg.fill("#su-name", "QA Person"); pg.fill("#su-mobile", "9876543210")
        pg.fill("#su-message", "How did the name Body Cafe Co. come about?")
        pg.click("[data-su-submit]")
        pg.wait_for_timeout(1200)
        res = pg.inner_text("[data-su-done]") if pg.locator("[data-su-done]").count() else ""
        cid = re.search(r"CASE-[0-9A-F]{8}", res + pg.inner_text("main"))
        check(f"{tag} case created", bool(cid), res[:120])
        if cid:
            data = pg.evaluate("fetch('/api/account').then(r=>r.json()).catch(()=>null)")
            body = json.dumps(data or {})
            check(f"{tag} case keeps topic", f"/story#{cur}" in body)

    # About and Story are distinct
    pg.goto(f"{BASE}/about?design={d}", wait_until="networkidle")
    check(f"{tag} about distinct", pg.locator(".st").count() == 0 and pg.locator("h1").inner_text() != "Curiosity is a good place to start")
    check(f"{tag} about links to story", pg.locator('a[href^="/story"]').count() > 0)

    # Direct anchor opens at the chapter
    pg.goto(f"{BASE}/story?design={d}#collection", wait_until="networkidle"); pg.wait_for_timeout(500)
    t = pg.evaluate("document.getElementById('collection').getBoundingClientRect().top")
    check(f"{tag} direct anchor", -2 <= t < 300, str(t))

    check(f"{tag} no page errors", not errs, str(errs[:2]))
    ctx.close()

def run_reduced(b, d):
    ctx = b.new_context(viewport={"width": 1200, "height": 900}, reduced_motion="reduce")
    pg = ctx.new_page()
    pg.goto(f"{BASE}/story?design={d}", wait_until="networkidle")
    anim = pg.evaluate("getComputedStyle(document.querySelector('.st-caps span')).animationName")
    pg.click('[data-st-nav="next"]'); pg.wait_for_timeout(120)
    t = pg.evaluate("document.getElementById('next').getBoundingClientRect().top")
    check(f"{d} reduced motion: no animation", anim == "none", anim)
    check(f"{d} reduced motion: instant jump", t < 300, str(t))
    ctx.close()

def run_fixture(b, d):
    ctx = b.new_context(viewport={"width": 1440, "height": 900})
    ctx.add_init_script("window.BCCStory = { founder: " + json.dumps(FIXTURE) + " };")
    pg = ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(f"{BASE}/story?design={d}", wait_until="networkidle"); pg.wait_for_timeout(300)
    ids = pg.eval_on_selector_all(".st-ch", "e=>e.map(x=>x.id)")
    check(f"{d} fixture: eight chapters in order", ids == ORDER, str(ids))
    check(f"{d} fixture: nav lists eight", pg.locator("[data-st-nav]").count() == 8)
    check(f"{d} fixture: timeline", pg.locator(".st-timeline li").count() == 4)
    check(f"{d} fixture: changed decision", pg.locator(".st-changed").count() == 1)
    check(f"{d} fixture: media with captions", pg.locator(".st-media video[controls][preload=none] track[kind=captions]").count() == 1)
    check(f"{d} fixture: no autoplay", pg.locator(".st video[autoplay], .st audio[autoplay]").count() == 0)
    pg.click(".st-transcript summary")
    check(f"{d} fixture: transcript", pg.is_visible("text=QA transcript."))
    pg.focus("#st-pv-0"); pg.keyboard.press("ArrowRight")
    check(f"{d} fixture: packaging viewer", pg.is_visible("#st-pp-1") and not pg.is_visible("#st-pp-0"))
    check(f"{d} fixture: founder signature", "QA Name" in pg.inner_text("#founder"))
    check(f"{d} fixture: no overflow", pg.evaluate("document.documentElement.scrollWidth") <= 1440)
    check(f"{d} fixture: no page errors", not errs, str(errs[:2]))
    # Timeline needs 4+ documented milestones
    ctx.close()
    ctx = b.new_context(viewport={"width": 1440, "height": 900})
    few = dict(FIXTURE, timeline=FIXTURE["timeline"][:3], packaging=FIXTURE["packaging"][:1])
    ctx.add_init_script("window.BCCStory = { founder: " + json.dumps(few) + " };")
    pg = ctx.new_page(); pg.goto(f"{BASE}/story?design={d}", wait_until="networkidle")
    check(f"{d} fixture: <4 milestones hides timeline", pg.locator(".st-timeline").count() == 0)
    check(f"{d} fixture: one version hides viewer", pg.locator("[data-st-pack]").count() == 0)
    ctx.close()

with sync_playwright() as p:
    b = p.chromium.launch()
    for d in DESIGNS:
        for w in WIDTHS:
            n = len(fails)
            try:
                run_design(b, d, w)
            except Exception as e:
                fails.append(f"{d} {w} crashed: {e}")
            print(d, w, "fail" if len(fails) > n else "pass", fails[n:], flush=True)
        n = len(fails)
        try:
            run_reduced(b, d); run_fixture(b, d)
        except Exception as e:
            fails.append(f"{d} fixture crashed: {e}")
        print(d, "fixture/reduced", "fail" if len(fails) > n else "pass", fails[n:], flush=True)
    b.close()
print(f"{len(results)} checks, {len(fails)} failures")
for f in fails: print(" -", f)
sys.exit(1 if fails else 0)
