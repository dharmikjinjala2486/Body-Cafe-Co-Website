"""Browser verification for the About page across A–H.

    python3 app/server.py --port 4174 --db /tmp/bcc-qa.sqlite3      # disposable QA database
    python3 design-tools/qa-about/verify_about.py http://127.0.0.1:4174 [out_dir]

Checks every direction at 1440, 768 and 390px: a distinct /about (not the Story page), /story and /standards still
working, section order and anchors, approved content and catalogue facts, links, the "About the brand" contact
context (and a real case on the local server), the image viewer (keyboard, focus, captions), the people layout with
a QA-only record held in page memory, axe-core accessibility, image loading and horizontal overflow.
On the static Netlify preview, contact submission is skipped (the preview has no support backend).
"""
import asyncio
import json
import os
import sys
import urllib.request
from pathlib import Path

from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:4174"
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else "/tmp/about-qa")
OUT.mkdir(parents=True, exist_ok=True)
AXE = Path(os.environ.get("AXE_JS", "/tmp/axe.min.js"))
SIZES = [(1440, 900), (768, 1024), (390, 844)]
ORDER = ["meet", "why", "name", "people", "values", "collection", "behind", "talk"]
try:
    catalog = json.load(urllib.request.urlopen(BASE + "/api/catalog"))["products"]
    STATIC = False
except Exception:
    catalog = json.load(urllib.request.urlopen(BASE + "/web/catalog-preview.json"))["products"]
    STATIC = True
published = [p for p in catalog if p["published"]]
results = {"pass": 0, "fail": 0, "failures": [], "static": STATIC}


def check(ok, label):
    if ok:
        results["pass"] += 1
    else:
        results["fail"] += 1
        results["failures"].append(label)
        print("FAIL", label)


async def scroll_all(pg):
    await pg.evaluate("async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 60)); } await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 3000); }))); scrollTo({ top: 0, behavior: 'instant' }); }")
    await pg.wait_for_timeout(400)


async def run(browser, d, axe_src):
    for w, h in SIZES:
        ctx = await browser.new_context(viewport={"width": w, "height": h}, bypass_csp=True)
        pg = await ctx.new_page()
        errors = []
        pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errors.append(str(e)))
        t = f"[{d}]{w}"
        await pg.goto(f"{BASE}/about?design={d}", wait_until="networkidle")
        info = await pg.evaluate("""() => {
          const root = document.querySelector('[data-ab]');
          if (!root) return null;
          return { design: root.dataset.abDesign, cls: root.className, h1: document.querySelectorAll('#main h1').length, h1text: document.querySelector('#main h1').textContent,
            ids: [...root.querySelectorAll(':scope > section')].map(s => s.id), title: document.title,
            nav: [...root.querySelectorAll('[data-ab-nav]')].map(a => a.getAttribute('href')),
            text: root.innerText, overflow: document.scrollingElement.scrollWidth - innerWidth,
            people: root.querySelectorAll('.ab-person').length, empty: !!root.querySelector('.ab-people-empty'),
            caps: [...root.querySelectorAll('.ab-caps a')].map(a => [a.getAttribute('href'), a.textContent.trim(), getComputedStyle(a.querySelector('.ab-cap-dot')).backgroundColor]),
            links: [...root.querySelectorAll('a[href]')].map(a => a.getAttribute('href')),
            headings: [...root.querySelectorAll('h1, h2, h3')].map(x => x.tagName),
            gallery: root.querySelectorAll('[data-ab-open]').length };
        }""")
        check(info is not None, f"{t} about root present")
        if not info:
            await ctx.close()
            continue
        check(info["design"] == d and f"ab-{d}" in info["cls"] and info["h1"] == 1, f"{t} root + one h1")
        check(info["ids"] == ORDER, f"{t} section order {info['ids']}")
        check([n.split("#")[1] for n in info["nav"]] == ORDER, f"{t} section nav")
        check(info["headings"][0] == "H1" and "H1" not in info["headings"][1:] and info["headings"].count("H2") == 7, f"{t} heading outline")
        check(info["overflow"] <= 0, f"{t} no horizontal overflow ({info['overflow']})")
        check(info["title"].startswith("A supplement shop that shows its working"), f"{t} document title {info['title']}")
        txt = info["text"]
        for s in ["seven everyday supplements", "curious, sceptical shoppers in India", "detail you can check comes before badges you can't",
                  "trust first and offers detail later", "There's no café to visit", "Clarity", "Curiosity", "Accountability", "Care",
                  "Records in this preview are demonstrations", "WhatsApp, email and phone details will be published once confirmed"]:
            check(s.lower() in txt.lower(), f"{t} copy: {s}")
        # No invented people while the PEOPLE record is empty
        check(info["people"] == 0 and info["empty"], f"{t} no people published without approved records")
        # Catalogue facts: seven names, real cap colours, format counts
        names = [p["name"] for p in published]
        check([c[1] for c in info["caps"]] == names and all(c[0].startswith(f"/products/{p['id']}") for c, p in zip(info["caps"], published)), f"{t} cap list")
        def rgb(hx):
            hx = hx.lstrip("#")
            return f"rgb({int(hx[0:2], 16)}, {int(hx[2:4], 16)}, {int(hx[4:6], 16)})"
        check([c[2] for c in info["caps"]] == [rgb(p["color"]) for p in published], f"{t} cap dots use real cap colours")
        counts = {}
        for p in published:
            f = {"iron-bisglycinate": "capsules", "l-theanine": "capsules", "myo-d-chiro-inositol": "capsules", "psyllium-husk": "capsules", "vitamin-d3-k2": "softgels", "omega-3-fish-oil": "softgels", "creatine-chews": "chewable tablets"}[p["id"]]
            counts[f] = counts.get(f, 0) + 1
        words = ["zero", "one", "two", "three", "four", "five", "six", "seven"]
        fm = await pg.evaluate("[...document.querySelectorAll('.ab-fmts li')].map(l => l.firstChild.textContent + l.childNodes[1].textContent)")
        check(sorted(x.strip().lower() for x in fm) == sorted(f"{words[n]} {f}" for f, n in counts.items()), f"{t} format counts {fm}")
        check(info["gallery"] == 5, f"{t} gallery items")
        # Links keep the design; anchors resolve
        internal = [l for l in info["links"] if l.startswith("/")]
        check(all(f"design={d}" in l for l in internal), f"{t} links keep design")
        for l in info["links"]:
            if l.startswith("#"):
                check(await pg.evaluate(f"!!document.getElementById('{l[1:]}')"), f"{t} anchor {l}")
        # Images
        await scroll_all(pg)
        imgs = await pg.evaluate("[...document.querySelectorAll('[data-ab] img')].filter(i => i.getAttribute('src')).map(i => [i.getAttribute('src'), i.complete && i.naturalWidth > 0, i.alt !== undefined])")
        check(all(ok for _, ok, _ in imgs) and len(imgs) >= 12, f"{t} images load ({len(imgs)}) {[s for s, ok, _ in imgs if not ok]}")
        await pg.screenshot(path=str(OUT / f"{d}-{w}-fold.jpg"), quality=70)
        if w in (1440, 390):
            await pg.screenshot(path=str(OUT / f"{d}-{w}-full.jpg"), full_page=True, quality=58)
        if axe_src and w in (1440, 390):
            await pg.add_script_tag(content=axe_src)
            ax = await pg.evaluate("async () => (await axe.run(document.querySelector('[data-ab]'), { runOnly: ['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice'] })).violations.map(v => v.id + ':' + v.nodes.length + ':' + v.nodes.slice(0,2).map(n => n.target.join(' ')).join('|'))")
            ax = [v for v in ax if not v.startswith("region:")]
            check(not ax, f"{t} axe {ax}")
        # Section navigation: click updates the address, scrolls and highlights
        await pg.evaluate("scrollTo(0,0)")
        nav = pg.locator('[data-ab-nav="values"]')
        await nav.scroll_into_view_if_needed()
        await nav.click()
        await pg.wait_for_timeout(1200)
        st = await pg.evaluate("""() => ({ hash: location.hash, top: Math.round(document.getElementById('values').getBoundingClientRect().top), cur: document.querySelector('[data-ab-nav=values]').getAttribute('aria-current'), focus: document.activeElement.id, path: location.pathname + location.search })""")
        check(st["hash"] == "#values" and -10 <= st["top"] < h * 0.5 and st["path"] == f"/about?design={d}", f"{t} nav jumps to section {st}")
        check(st["cur"] == "location", f"{t} nav highlights current section {st['cur']}")
        check(st["focus"] == "values-t", f"{t} focus moves to section heading ({st['focus']})")
        # Shareable anchor: a direct link opens at the section
        await pg.goto(f"{BASE}/about?design={d}#people", wait_until="networkidle")
        await pg.wait_for_timeout(500)
        top = await pg.evaluate("Math.round(document.getElementById('people').getBoundingClientRect().top)")
        check(-10 <= top < h * 0.5, f"{t} direct anchor link ({top})")
        if w == 1440:
            await desktop_flows(pg, d, t)
        if w == 390:
            await viewer(pg, d, t, phone=True)
        bad = [e for e in errors if "favicon" not in e]
        check(not bad, f"{t} console errors {bad}")
        await ctx.close()


async def viewer(pg, d, t, phone=False):
    await pg.goto(f"{BASE}/about?design={d}", wait_until="networkidle")
    btn = pg.locator('[data-ab-open="0"]')
    await btn.scroll_into_view_if_needed()
    await btn.click()
    await pg.wait_for_timeout(300)
    s = await pg.evaluate("""() => { const dl = document.querySelector('[data-ab-lightbox]'), i = dl.querySelector('img');
      return { open: dl.open, focus: document.activeElement.getAttribute('aria-label'), count: dl.querySelector('[data-ab-lb-count]').textContent,
        title: dl.querySelector('[data-ab-lb-title]').textContent, cap: dl.querySelector('[data-ab-lb-cap]').textContent, alt: i.alt, src: i.getAttribute('src'),
        fits: i.getBoundingClientRect().right <= innerWidth && i.getBoundingClientRect().bottom <= innerHeight + 2, scrollLocked: getComputedStyle(document.body).overflow === 'hidden' } }""")
    check(s["open"] and s["focus"] == "Close" and s["count"] == "Image 1 of 5" and s["title"] and s["cap"] and s["alt"], f"{t} viewer opens {s}")
    check(s["fits"], f"{t} viewer image fits the screen")
    await pg.wait_for_timeout(300)
    loaded = await pg.evaluate("(() => { const i = document.querySelector('[data-ab-lb-img]'); return i.complete && i.naturalWidth > 0; })()")
    check(loaded, f"{t} viewer image loads")
    await pg.keyboard.press("ArrowRight")
    c2 = await pg.evaluate("document.querySelector('[data-ab-lb-count]').textContent")
    check(c2 == "Image 2 of 5", f"{t} viewer next by keyboard ({c2})")
    await pg.keyboard.press("ArrowLeft")
    await pg.keyboard.press("ArrowLeft")
    c3 = await pg.evaluate("document.querySelector('[data-ab-lb-count]').textContent")
    check(c3 == "Image 5 of 5", f"{t} viewer wraps backwards ({c3})")
    # Tab stays inside the modal dialog
    inside = []
    for _ in range(5):
        await pg.keyboard.press("Tab")
        inside.append(await pg.evaluate("!!document.activeElement.closest('[data-ab-lightbox]') || document.activeElement === document.body"))
    check(all(inside), f"{t} focus contained in viewer {inside}")
    await pg.keyboard.press("Escape")
    await pg.wait_for_timeout(200)
    after = await pg.evaluate("[document.querySelector('[data-ab-lightbox]').open, document.activeElement.getAttribute('data-ab-open')]")
    check(after == [False, "4"], f"{t} Escape closes and returns focus {after}")
    if not phone:
        await pg.click('[data-ab-open="1"]')
        await pg.click("[data-ab-next]")
        c = await pg.evaluate("document.querySelector('[data-ab-lb-count]').textContent")
        await pg.click("[data-ab-close]")
        check(c == "Image 3 of 5" and not await pg.evaluate("document.querySelector('[data-ab-lightbox]').open"), f"{t} viewer buttons")


async def desktop_flows(pg, d, t):
    await viewer(pg, d, t)
    # Story and Standards are separate pages that still work
    for path, marker in [("/story", "[data-ab]"), ("/standards", "[data-ab]")]:
        await pg.goto(f"{BASE}{path}?design={d}", wait_until="networkidle")
        s = await pg.evaluate(f"({{ ab: !!document.querySelector('{marker}'), h1: document.querySelectorAll('#main h1').length, h1t: document.querySelector('#main h1')?.textContent || '' }})")
        check(not s["ab"] and s["h1"] == 1 and "shows its working" not in s["h1t"], f"{t} {path} is its own page {s}")
    # About is reachable from the site navigation
    await pg.goto(f"{BASE}/story?design={d}", wait_until="networkidle")
    has_nav = await pg.evaluate("[...document.querySelectorAll('header a, nav a')].some(a => (a.getAttribute('href')||'').startsWith('/about'))")
    check(has_nav, f"{t} About in site navigation")
    # Every distinct page linked from About renders (no 404s)
    await pg.goto(f"{BASE}/about?design={d}", wait_until="networkidle")
    links = sorted(set(await pg.evaluate("[...document.querySelectorAll('[data-ab] a[href^=\"/\"]')].map(a => a.getAttribute('href'))")))
    for l in links:
        await pg.goto(BASE + l, wait_until="networkidle")
        r = await pg.evaluate("""() => ({ h1: document.querySelectorAll('#main h1').length, nf: /not found|can't find|cannot find|doesn't exist/i.test(document.querySelector('#main')?.innerText.slice(0, 400) || ''), hash: location.hash,
          target: location.hash ? !!document.getElementById(location.hash.slice(1)) : true })""")
        check(r["h1"] == 1 and not r["nf"] and r["target"], f"{t} link {l} {r}")
    # Ask the team: contact form opens with "About the brand" selected; on the local server, a real case is created
    await pg.goto(f"{BASE}/about?design={d}", wait_until="networkidle")
    ask = pg.locator('[data-ab] a[href^="/contact?kind=brand"]').first
    await ask.scroll_into_view_if_needed()
    await ask.click()
    await pg.wait_for_url("**/contact?**")
    await pg.wait_for_timeout(400)
    if STATIC:
        check("kind=brand" in pg.url, f"{t} ask-the-team link (static preview shows contact as unavailable)")
    else:
        sel = await pg.evaluate("[document.querySelector('#case-kind')?.value, document.querySelector('#case-kind')?.selectedOptions[0]?.textContent]")
        check(sel == ["brand", "About the brand"] and f"design={d}" in pg.url, f"{t} contact context preselected {sel} {pg.url}")
        await pg.fill("#case-message", f"QA test from the About page ({d}): what does the name mean?")
        await pg.click("#case-form button")
        await pg.wait_for_timeout(800)
        res = await pg.evaluate("document.querySelector('#case-result')?.innerText || ''")
        check("CASE-" in res, f"{t} brand case created ({res[:60]})")
        await pg.goto(f"{BASE}/account/cases?design={d}", wait_until="networkidle")
        listed = await pg.evaluate("document.querySelector('#main').innerText")
        # Themed account pages print case types as their codes (as for "general"); the shared card shows the label.
        check("about the brand" in listed.lower() or "brand" in listed.lower(), f"{t} case listed in the account")
    # People layout, using a QA-only record held in page memory (never saved, never published)
    await pg.goto(f"{BASE}/about?design={d}", wait_until="networkidle")
    await pg.evaluate("""() => { window.BCCAbout.people = [{ name: 'QA Person', role: 'QA role', intro: 'QA introduction text for layout checks only.',
        bio: 'QA longer biography text for the expandable section.', note: 'QA founder note text.', portrait: { src: '/web/media/about/logo-clear-space.webp', alt: 'QA portrait placeholder', w: 1000, h: 1024 } }]; }""")
    await pg.evaluate("document.querySelector('header a[href^=\"/about\"], nav a[href^=\"/about\"]').click()")
    await pg.wait_for_timeout(700)
    p = await pg.evaluate("""() => { const r = document.querySelector('[data-ab]'); const det = r.querySelector('.ab-bio');
      return { people: r.querySelectorAll('.ab-person').length, h3: r.querySelector('.ab-person h3')?.textContent, role: r.querySelector('.ab-role')?.textContent,
        bio: !!det && !det.open, note: r.querySelector('.ab-founder blockquote')?.textContent, empty: !!r.querySelector('.ab-people-empty'), img: !!r.querySelector('.ab-portrait img[alt]') }; }""")
    check(p["people"] == 1 and p["h3"] == "QA Person" and p["role"] == "QA role" and p["bio"] and p["note"] == "QA founder note text." and not p["empty"] and p["img"], f"{t} people layout {p}")
    await pg.click(".ab-bio summary")
    check(await pg.evaluate("document.querySelector('.ab-bio').open"), f"{t} biography expands")
    await pg.evaluate("delete window.BCCAbout.people")


async def main():
    axe_src = AXE.read_text() if AXE.exists() else ""
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        for d in "abcdefgh":
            await run(browser, d, axe_src)
            print(d, "done", results["pass"], results["fail"])
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
        pg = await ctx.new_page()
        await pg.goto(f"{BASE}/about?design=g", wait_until="networkidle")
        tr = await pg.evaluate("getComputedStyle(document.querySelector('.ab-open img')).transitionDuration")
        check(tr in ("0s", "0s, 0s"), f"reduced motion ({tr})")
        await browser.close()
    (OUT / "results.json").write_text(json.dumps(results, indent=1))
    print(json.dumps({k: results[k] for k in ("pass", "fail", "static")}), "\n".join(results["failures"][:60]))


asyncio.run(main())
