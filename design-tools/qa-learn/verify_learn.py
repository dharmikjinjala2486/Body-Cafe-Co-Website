"""Browser verification for Learn across A–H.

    python3 app/server.py --port 4174 --db /tmp/bcc-qa.sqlite3      # disposable QA database
    python3 design-tools/qa-learn/verify_learn.py http://127.0.0.1:4174 [out_dir]

Covers, per direction: the hub flow (search, paths, products, essentials, label explorer, evidence, report walkthrough,
inside, questions, keep exploring), all seven product guides and five foundation guides, the glossary, inline
definitions, the product explorer, save/resume/clear, shared section links, feedback and support paths (real cases on
the local server; disabled on the static preview), print layout, cross-links, images, axe-core, keyboard behaviour
and horizontal overflow at 1440, 768 and 390px.
"""
import asyncio
import json
import os
import sys
import urllib.request
from pathlib import Path

from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:4174"
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else "/tmp/learn-qa")
OUT.mkdir(parents=True, exist_ok=True)
AXE = Path(os.environ.get("AXE_JS", "/tmp/axe.min.js"))
DESIGNS = os.environ.get("DESIGNS", "abcdefgh")
SIZES = [(1440, 900), (768, 1024), (390, 844)]
HUB = ["start", "products", "essentials", "label", "evidence", "inside", "questions", "explore"]
FOUNDATION = ["reading-a-label", "ingredient-forms", "serving-sizes", "understanding-evidence", "understanding-reports"]
PSEC = ["minute", "what", "name", "research", "inside", "label", "use", "records", "questions", "sources", "next"]
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


async def settle(pg):
    await pg.evaluate("async () => { for (let y = 0; y < document.body.scrollHeight; y += 450) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 40)); } await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 3000); }))); scrollTo({ top: 0, behavior: 'instant' }); }")
    await pg.wait_for_timeout(250)


async def common(pg, t, axe_src, shot=None, axe=False):
    info = await pg.evaluate("""() => { const r = document.querySelector('[data-lr]');
      return r ? { h1: document.querySelectorAll('#main h1').length, h1t: document.querySelector('#main h1')?.textContent, overflow: document.scrollingElement.scrollWidth - innerWidth,
        design: [...r.classList].find(c => /^lr-[a-h]$/.test(c)), links: [...r.querySelectorAll('a[href]')].map(a => a.getAttribute('href')) } : null; }""")
    if not info:
        check(False, f"{t} learn root")
        return None
    check(info["h1"] == 1, f"{t} one h1 ({info['h1']})")
    check(info["overflow"] <= 0, f"{t} no horizontal overflow ({info['overflow']})")
    await settle(pg)
    imgs = await pg.evaluate("[...document.querySelectorAll('[data-lr] img')].map(i => [i.getAttribute('src'), i.complete && i.naturalWidth > 0, i.hasAttribute('alt')])")
    check(all(ok and alt for _, ok, alt in imgs), f"{t} images load with alt {[s for s, ok, a in imgs if not (ok and a)]}")
    d = t[1]
    check(all(("design=" + d) in l for l in info["links"] if l.startswith("/")), f"{t} links keep design")
    for l in info["links"]:
        if l.startswith("#"):
            check(await pg.evaluate(f"!!document.getElementById({json.dumps(l[1:])})"), f"{t} anchor {l}")
    if shot:
        await pg.screenshot(path=str(OUT / f"{shot}-fold.jpg"), quality=70)
        if shot.endswith(("1440", "390")):
            await pg.screenshot(path=str(OUT / f"{shot}-full.jpg"), full_page=True, quality=55)
    if axe and axe_src:
        await pg.add_script_tag(content=axe_src)
        ax = await pg.evaluate("async () => (await axe.run(document.querySelector('[data-lr]'), { runOnly: ['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice'] })).violations.map(v => v.id + ':' + v.nodes.length + ':' + v.nodes.slice(0,2).map(n => n.target.join(' ')).join('|'))")
        ax = [v for v in ax if not v.startswith("region:")]
        check(not ax, f"{t} axe {ax}")
    return info


async def hub(pg, d, w, h, axe_src):
    t = f"[{d}]{w} hub"
    await pg.goto(f"{BASE}/learn?design={d}", wait_until="networkidle")
    info = await common(pg, t, axe_src, f"{d}-hub-{w}", axe=w in (1440, 390))
    if not info:
        return
    s = await pg.evaluate("""() => ({ h1: document.querySelector('#main h1').textContent, ids: [...document.querySelectorAll('[data-lr] > section')].map(x => x.id),
      prods: [...document.querySelectorAll('.lr-prod h3 a')].map(a => [a.textContent, a.getAttribute('href')]), guides: [...document.querySelectorAll('.lr-guide-card h3 a')].map(a => a.getAttribute('href').split('?')[0]),
      ev: document.querySelectorAll('.lr-ev').length, inside: [...document.querySelectorAll('.lr-inside a')].map(a => a.getAttribute('href').split('?')[0]), plain: document.querySelectorAll('[data-lr-label] .lr-plain dt').length,
      exampleTags: document.querySelectorAll('.lr-example-tag').length, topics: document.querySelectorAll('.lr-topics a').length, title: document.title })""")
    check(s["h1"] == "A little more knowing.", f"{t} h1")
    check(s["ids"] == HUB, f"{t} section order {s['ids']}")
    check([x[0] for x in s["prods"]] == [p["name"] for p in published] and all(x[1].startswith(f"/learn/{p['id']}?") for x, p in zip(s["prods"], published)), f"{t} seven products")
    check(s["guides"] == ["/learn/" + g for g in FOUNDATION], f"{t} five essentials")
    check(s["ev"] == 4 and s["inside"] == ["/about", "/story", "/about", "/standards"] and s["plain"] == 6 and s["exampleTags"] == 2 and s["topics"] == 9, f"{t} evidence/inside/label/tags {s}")
    if w != 1440:
        return
    # Search: results with excerpts and section links; URL keeps q; no-results and reset; refresh and back
    await pg.fill("#lr-q", "elemental iron")
    await pg.press("#lr-q", "Enter")
    await pg.wait_for_timeout(200)
    r = await pg.evaluate("({ n: document.querySelectorAll('.lr-results li').length, first: document.querySelector('.lr-results a')?.getAttribute('href'), mark: !!document.querySelector('.lr-results mark'), url: location.search, status: document.querySelector('.lr-results-k').textContent })")
    check(r["n"] > 0 and "#" in (r["first"] or "") and r["mark"] and "q=elemental+iron" in r["url"] and f"design={d}" in r["url"] and "result" in r["status"], f"{t} search results {r}")
    await pg.click(".lr-results a")
    await pg.wait_for_timeout(700)
    check("/learn/" in pg.url and "#" in pg.url and await pg.evaluate("!!document.getElementById(location.hash.slice(1))"), f"{t} result opens section {pg.url}")
    await pg.go_back()
    await pg.wait_for_timeout(700)
    check(await pg.evaluate("document.querySelector('#lr-q')?.value") == "elemental iron" and await pg.evaluate("document.querySelectorAll('.lr-results li').length") > 0, f"{t} back restores search")
    for q, expect in [("EPA and DHA", "/learn/omega-3-fish-oil"), ("mcg and IU", "/learn/serving-sizes"), ("Psyllium", "/learn/psyllium-husk"), ("specification", "/learn/glossary")]:
        await pg.fill("#lr-q", q)
        await pg.press("#lr-q", "Enter")
        await pg.wait_for_timeout(150)
        hrefs = await pg.evaluate("[...document.querySelectorAll('.lr-results a')].map(a => a.getAttribute('href'))")
        check(any(x.startswith(expect) for x in hrefs), f"{t} search '{q}' finds {expect}")
    await pg.fill("#lr-q", "xylophone quasar")
    await pg.press("#lr-q", "Enter")
    await pg.wait_for_timeout(150)
    nr = await pg.evaluate("document.querySelector('.lr-noresults') && document.querySelector('.lr-results-k').textContent")
    check(bool(nr) and "No results" in nr, f"{t} no-results state")
    await pg.click("[data-lr-reset]")
    await pg.wait_for_timeout(150)
    check(await pg.evaluate("!location.search.includes('q=') && document.querySelector('#lr-q').value === '' && !document.querySelector('.lr-results-k')"), f"{t} reset clears search")
    await pg.click('[data-lr-try="mcg and IU"]')
    await pg.wait_for_timeout(150)
    check(await pg.evaluate("document.querySelectorAll('.lr-results li').length") > 0, f"{t} example question")
    await pg.goto(f"{BASE}/learn?q=lot+number&design={d}", wait_until="networkidle")
    check(await pg.evaluate("document.querySelectorAll('.lr-results li').length") > 0, f"{t} direct search link")
    # Product explorer: radio group + tabs, keyboard
    await pg.focus('[data-lr-pick]:first-child')
    await pg.keyboard.press("ArrowRight")
    ex = await pg.evaluate("({ checked: document.querySelector('[data-lr-pick][aria-checked=true]').dataset.lrPick, focus: document.activeElement.dataset.lrPick, shown: [...document.querySelectorAll('[data-lr-ex-product]')].filter(x => !x.hidden).map(x => x.dataset.lrExProduct) })")
    check(ex["checked"] == published[1]["id"] and ex["focus"] == published[1]["id"] and ex["shown"] == [published[1]["id"]], f"{t} explorer product by keyboard {ex}")
    pid = published[1]["id"]
    await pg.focus(f"#lr-tab-{pid}-what")
    for _ in range(4):
        await pg.keyboard.press("ArrowRight")
    tab = await pg.evaluate(f"({{ sel: document.querySelector('[data-lr-ex-product=\"{pid}\"] [role=tab][aria-selected=true]').dataset.lrStep, vis: !document.querySelector('#lr-panel-{pid}-records').hidden, href: document.querySelector('#lr-panel-{pid}-records a').getAttribute('href') }})")
    check(tab["sel"] == "records" and tab["vis"] and tab["href"].startswith(f"/reports?product={pid}"), f"{t} explorer steps by keyboard {tab}")
    # Label explorer
    await pg.click('[data-lr-part="allergens"]')
    lb = await pg.evaluate("({ pressed: document.querySelector('[data-lr-part=allergens]').getAttribute('aria-pressed'), detail: document.querySelector('[data-lr-part-detail]').textContent })")
    check(lb["pressed"] == "true" and "allergen" in lb["detail"].lower(), f"{t} label explorer {lb}")
    # Report walkthrough
    for _ in range(3):
        await pg.click('[data-lr-walk="1"]')
    wk = await pg.evaluate("({ count: document.querySelector('[data-lr-walk-count]').textContent, on: document.querySelector('[data-lr-row].is-on th').textContent, text: document.querySelector('[data-lr-walk-text]').textContent, prev: document.querySelector('[data-lr-walk=\"-1\"]').disabled })")
    check(wk["count"] == "Step 4 of 7" and wk["on"] == "Method" and "measured" in wk["text"] and not wk["prev"], f"{t} report walkthrough {wk}")
    # Questions filter
    await pg.fill("[data-lr-qfilter]", "iron")
    qn = await pg.evaluate("[document.querySelectorAll('[data-lr-q]:not([hidden])').length, document.querySelector('[data-lr-qcount]').textContent]")
    check(0 < qn[0] < 10 and "of 10" in qn[1], f"{t} question filter {qn}")
    await pg.fill("[data-lr-qfilter]", "zzzz")
    check(await pg.evaluate("!document.querySelector('[data-lr-qempty]').hidden"), f"{t} question empty state")
    await pg.click("[data-lr-qclear]")
    check(await pg.evaluate("document.querySelectorAll('[data-lr-q]:not([hidden])').length") == 10, f"{t} question reset")


async def guide(pg, d, w, slug, axe_src, deep):
    t = f"[{d}]{w} {slug}"
    await pg.goto(f"{BASE}/learn/{slug}?design={d}", wait_until="networkidle")
    info = await common(pg, t, axe_src, f"{d}-{slug}-{w}" if slug in ("iron-bisglycinate", "serving-sizes") else None, axe=deep and w in (1440, 390))
    if not info:
        return
    s = await pg.evaluate("""() => ({ crumbs: [...document.querySelectorAll('.lr-crumbs li')].map(l => l.textContent), toc: [...document.querySelectorAll('[data-lr-toc]')].map(a => a.dataset.lrToc),
      secs: [...document.querySelectorAll('.lr-asec')].map(x => x.id), read: document.querySelector('.lr-meta-line')?.textContent || '', ext: [...document.querySelectorAll('.lr-asec a[target=_blank]')].map(a => a.href),
      summary: document.querySelector('.lr-summary')?.textContent, caution: document.querySelector('.lr-caution')?.textContent || '', tags: [...document.querySelectorAll('.lr-tag')].map(x => x.className),
      related: document.querySelectorAll('.lr-related li').length, back: !!document.querySelector('.lr-related a[href^="/learn?"]'), print: !!document.querySelector('.lr-print'), feedback: !!document.querySelector('[data-lr-feedback]'),
      text: document.querySelector('.lr-abody').innerText })""")
    check(s["crumbs"][0] == "Learn" and len(s["crumbs"]) == 3, f"{t} breadcrumbs {s['crumbs']}")
    check(s["toc"] == s["secs"] and len(s["toc"]) >= 6, f"{t} contents match sections")
    words = len(s["text"].split())
    check("min read" in s["read"] and "Not yet specialist-reviewed" in s["read"] and "22 October 2026" in s["read"], f"{t} meta {s['read']}")
    check(s["summary"] and s["related"] >= 2 and s["back"] and s["print"] and s["feedback"], f"{t} article parts")
    if slug in [p["id"] for p in published]:
        check(s["secs"] == PSEC, f"{t} product guide structure {s['secs']}")
        check("speak with a qualified health professional" in s["caution"] and "awaiting approved label" in s["caution"].lower(), f"{t} caution visible")
        check(any("general" in c for c in s["tags"]) and any("ours" in c for c in s["tags"]), f"{t} general vs ours marked")
        check("reviewed research summary is being prepared" in s["text"], f"{t} research held for review")
        check(len(s["ext"]) >= 2, f"{t} sources near claims ({len(s['ext'])})")
        p = next(x for x in published if x["id"] == slug)
        facts = await pg.evaluate("[...document.querySelectorAll('#inside .lr-facts dd')].map(x => x.textContent)")
        check(p["name"] in facts and p["ingredients"] in facts, f"{t} inside facts from catalogue")
        for banned in ["clinically proven", "certified by", "boosts", "supports immunity", "recommended dose", "take 1", "take 2"]:
            check(banned not in s["text"].lower(), f"{t} no '{banned}'")
    else:
        check(s["secs"][0] == "minute" and s["secs"][-3:] == ["example", "checklist", "sources"], f"{t} foundation structure {s['secs']}")
        check("Fictional example" in s["text"] or "General guide" in s["text"], f"{t} example marked")
    if not deep:
        return
    # Inline glossary
    btn = pg.locator("[data-lr-term]").first
    if await btn.count():
        await btn.scroll_into_view_if_needed()
        await btn.click()
        g = await pg.evaluate("(() => { const b = document.querySelector('[data-lr-term][aria-expanded=true]'); const tip = b && document.getElementById(b.getAttribute('aria-controls')); return b ? { open: !tip.hidden, link: tip.querySelector('a').getAttribute('href') } : null; })()")
        check(g and g["open"] and g["link"].startswith("/learn/glossary"), f"{t} inline definition {g}")
        await pg.keyboard.press("Escape")
        check(await pg.evaluate("!document.querySelector('[data-lr-term][aria-expanded=true]')"), f"{t} Escape closes definition")
    # Section link: copy and URL hash
    await pg.click('[data-lr-share="' + s["secs"][2] + '"]')
    await pg.wait_for_timeout(200)
    msg = await pg.evaluate("[document.querySelector('[data-lr-act-msg]').textContent, location.hash]")
    check(msg[1] == "#" + s["secs"][2] and ("copied" in msg[0].lower() or "copy this link" in msg[0].lower()), f"{t} section link {msg}")
    await pg.goto(f"{BASE}/learn/{slug}?design={d}#{s['secs'][3]}", wait_until="networkidle")
    await pg.wait_for_timeout(400)
    top = await pg.evaluate(f"Math.round(document.getElementById('{s['secs'][3]}').getBoundingClientRect().top)")
    check(-10 <= top < 500, f"{t} direct section link ({top})")
    # Contents link moves focus to the heading
    await pg.click(f'[data-lr-toc="{s["secs"][4]}"]')
    await pg.wait_for_timeout(900)
    check(await pg.evaluate("document.activeElement.id") == s["secs"][4] + "-t", f"{t} contents link focus")
    # Save, resume, remove
    await pg.click("[data-lr-save]")
    sv = await pg.evaluate("[document.querySelector('[data-lr-save]').getAttribute('aria-pressed'), JSON.parse(localStorage.getItem('bcc-learn')||'{}')]")
    check(sv[0] == "true" and any(x["slug"] == slug for x in sv[1].get("saved", [])) and any(x["slug"] == slug for x in sv[1].get("history", [])), f"{t} save + history")
    await pg.goto(f"{BASE}/learn?design={d}", wait_until="networkidle")
    mine = await pg.evaluate(f"({{ saved: [...document.querySelectorAll('[data-lr-mine] [data-lr-unsave]')].map(b => b.dataset.lrUnsave), resume: [...document.querySelectorAll('[data-lr-mine] a')].map(a => a.getAttribute('href')).filter(h => h.split('?')[0] === '/learn/{slug}' && h.includes('#')) }})")
    check(slug in mine["saved"] and mine["resume"], f"{t} hub shows saved + resume {mine}")
    await pg.click(f'[data-lr-unsave="{slug}"]')
    await pg.click('[data-lr-clear="history"]')
    left = await pg.evaluate("JSON.parse(localStorage.getItem('bcc-learn')||'{}')")
    check(not any(x["slug"] == slug for x in left.get("saved", [])) and left.get("history") == [], f"{t} remove + clear history")
    # Print layout: only the learning sheet is visible
    await pg.goto(f"{BASE}/learn/{slug}?design={d}", wait_until="networkidle")
    await pg.emulate_media(media="print")
    await pg.evaluate("window.dispatchEvent(new Event('beforeprint'))")
    pr = await pg.evaluate("({ sheet: !!document.querySelector('#lr-print-root .lr-print') && getComputedStyle(document.querySelector('#lr-print-root .lr-print')).display !== 'none', page: getComputedStyle(document.getElementById('app')).display, text: document.querySelector('#lr-print-root .lr-print').innerText })")
    if d == "e":
        await pg.pdf(path=str(OUT / f"{d}-{slug}-sheet.pdf"))
        pages = (OUT / f"{d}-{slug}-sheet.pdf").read_bytes().count(b"/Type /Page") - (OUT / f"{d}-{slug}-sheet.pdf").read_bytes().count(b"/Type /Pages")
        check(pages <= 2, f"{t} learning sheet fits two pages ({pages})")
    await pg.evaluate("window.dispatchEvent(new Event('afterprint'))")
    check(pr["sheet"] and pr["page"] == "none" and "sources" in pr["text"].lower() and "Version 0.1" in pr["text"] and "not personal advice" in pr["text"], f"{t} print sheet {pr['sheet']} {pr['page']} {pr['text'][-200:]}")
    await pg.emulate_media(media="screen")
    # Feedback
    if STATIC:
        st = await pg.evaluate("[document.querySelector('[data-lr-vote]').disabled, document.querySelector('[data-lr-vote-msg]').textContent]")
        check(st[0] and "can't be sent" in st[1], f"{t} feedback unavailable on static preview {st}")
        return
    await pg.click('[data-lr-vote="yes"]')
    await pg.wait_for_timeout(500)
    vm = await pg.evaluate("document.querySelector('[data-lr-vote-msg]').textContent")
    check("recorded" in vm, f"{t} clarity vote recorded ({vm})")
    det = pg.locator(".lr-fb").first
    await det.locator("summary").click()
    await det.locator("button[type=submit]").click()
    er = await pg.evaluate("document.querySelector('.lr-fb .lr-err').textContent")
    check("10 characters" in er, f"{t} correction validation ({er})")
    await det.locator("select").select_option(s["secs"][2])
    await det.locator("textarea").fill(f"QA test correction for {slug} in design {d}.")
    await det.locator("button[type=submit]").click()
    await pg.wait_for_timeout(700)
    res = await pg.evaluate("document.querySelector('.lr-fb .lr-fb-result').textContent")
    check("CASE-" in res, f"{t} correction creates a private case ({res[:50]})")


async def glossary(pg, d, w, axe_src):
    t = f"[{d}]{w} glossary"
    await pg.goto(f"{BASE}/learn/glossary?design={d}", wait_until="networkidle")
    info = await common(pg, t, axe_src, f"{d}-glossary-{w}", axe=w == 1440)
    if not info:
        return
    n = await pg.evaluate("document.querySelectorAll('[data-lr-gterm]').length")
    check(n >= 25, f"{t} terms ({n})")
    await pg.fill("[data-lr-gfilter]", "omega")
    f = await pg.evaluate("[document.querySelectorAll('[data-lr-gterm]:not([hidden])').length, document.querySelector('[data-lr-gcount]').textContent]")
    check(0 < f[0] < n and "of" in f[1], f"{t} filter {f}")
    await pg.fill("[data-lr-gfilter]", "qqqq")
    check(await pg.evaluate("!document.querySelector('[data-lr-gempty]').hidden"), f"{t} empty")
    await pg.click("[data-lr-gclear]")
    check(await pg.evaluate("document.querySelectorAll('[data-lr-gterm]:not([hidden])').length") == n, f"{t} reset")


async def crawl(pg):
    """Every internal link on the hub, all guides and the glossary renders, keeps its anchor target and isn't a 404."""
    pages = ["/learn", "/learn/glossary"] + ["/learn/" + p["id"] for p in published] + ["/learn/" + g for g in FOUNDATION]
    links = set()
    for p in pages:
        await pg.goto(f"{BASE}{p}?design=e", wait_until="networkidle")
        links |= set(await pg.evaluate("[...document.querySelectorAll('#main a[href^=\"/\"]')].map(a => a.getAttribute('href'))"))
        ext = await pg.evaluate("[...document.querySelectorAll('[data-lr] a[href^=\"http\"]')].map(a => a.href)")
        check(all(e.startswith("https://") for e in ext), f"crawl external links are https on {p}")
    for l in sorted(links):
        await pg.goto(BASE + l, wait_until="networkidle")
        r = await pg.evaluate("({ h1: document.querySelectorAll('#main h1').length, nf: /not found|can't find|doesn't exist/i.test((document.querySelector('#main')?.innerText || '').slice(0, 300)), target: location.hash ? !!document.getElementById(decodeURIComponent(location.hash.slice(1))) : true })")
        check(r["h1"] == 1 and not r["nf"] and r["target"], f"crawl {l} {r}")
    print("crawled", len(links), "links")


async def main():
    axe_src = AXE.read_text() if AXE.exists() else ""
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        for d in DESIGNS:
            for w, h in SIZES:
                ctx = await browser.new_context(viewport={"width": w, "height": h}, bypass_csp=True)
                await ctx.grant_permissions(["clipboard-read", "clipboard-write"], origin=BASE)
                pg = await ctx.new_page()
                errors = []
                pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
                pg.on("pageerror", lambda e: errors.append(str(e)))
                await hub(pg, d, w, h, axe_src)
                slugs = [p["id"] for p in published] + FOUNDATION
                for s in slugs:
                    deep = w == 1440 or (w == 390 and s in ("omega-3-fish-oil", "understanding-reports"))
                    await guide(pg, d, w, s, axe_src, deep)
                await glossary(pg, d, w, axe_src)
                bad = [e for e in errors if "favicon" not in e]
                check(not bad, f"[{d}]{w} console errors {bad[:3]}")
                await ctx.close()
            print(d, "done", results["pass"], results["fail"])
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        pg = await ctx.new_page()
        await crawl(pg)
        await ctx.close()
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
        pg = await ctx.new_page()
        await pg.goto(f"{BASE}/learn?design=g", wait_until="networkidle")
        tr = await pg.evaluate("getComputedStyle(document.querySelector('.lr-prod-media img')).transitionDuration")
        check(tr in ("0s", "0s, 0s"), f"reduced motion ({tr})")
        await browser.close()
    (OUT / "results.json").write_text(json.dumps(results, indent=1))
    print(json.dumps({k: results[k] for k in ("pass", "fail", "static")}), "\n".join(results["failures"][:80]))


asyncio.run(main())
