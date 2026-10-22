"""Standards page QA for all eight directions.

Usage: python3 design-tools/qa-standards/verify_standards.py [designs] [widths] [axe.min.js]
Run the preview server on 127.0.0.1:4174 first. Exits non-zero on any failure.

Checks per direction and width: page errors and console errors, one h1, the ten sections in the approved order,
unique ids, every in-page anchor resolves, no horizontal overflow, optional expansion (open on wide screens,
collapsed on phones), product picker by mouse and keyboard, and (at 390 and 1440) an axe-core scan of the page.
Once per direction: every internal link on the page renders a real route (not the not-found page), and the
Standards facts are identical across directions (same headings, statuses, FAQs and evidence rows).
"""
import asyncio, json, sys, re
from playwright.async_api import async_playwright

BASE = "http://127.0.0.1:4174"
DESIGNS = (sys.argv[1] if len(sys.argv) > 1 else "a,b,c,d,e,f,g,h").split(",")
WIDTHS = [int(w) for w in (sys.argv[2] if len(sys.argv) > 2 else "320,390,768,1100,1440").split(",")]
AXE = sys.argv[3] if len(sys.argv) > 3 else None
ORDER = ["glance", "formula", "source", "checks", "evidence", "lot", "communicate", "questions", "next"]
fails = []

def fail(msg):
    fails.append(msg)
    print("FAIL", msg)

FACTS_JS = r"""() => {
  const r = document.querySelector('[data-sx]');
  const t = s => [...r.querySelectorAll(s)].map(e => e.textContent.replace(/\s+/g, ' ').trim());
  return { h2: t('section h2'), status: t('.sx-status p:not(.sx-status-k), .sx-sidenote:not(.sx-footnote) p:not(.sx-status-k)'),
    faq: t('.sx-faq'), rows: t('.sx-proves tbody tr'), principles: t('.sx-principles li'), panels: t('.sx-panel'),
    steps: t('.sx-path li'), places: t('.sx-places li'), fields: t('.sx-fields li'), library: t('.sx-libfields div'),
    h1: [...document.querySelectorAll('h1')].map(e => e.innerText.replace(/\s+/g, ' ').trim().toLowerCase()) };
}"""

async def main():
    facts = {}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for d in DESIGNS:
            routes_checked = False
            for w in WIDTHS:
                pg = await b.new_page(viewport={"width": w, "height": 900}, bypass_csp=True)
                errs = []
                pg.on("pageerror", lambda e: errs.append("pageerror " + str(e)))
                pg.on("console", lambda m: errs.append("console " + m.text) if m.type == "error" else None)
                await pg.goto(f"{BASE}/standards?design={d}", wait_until="networkidle")
                tag = f"{d}@{w}"
                info = await pg.evaluate("""() => {
                  const r = document.querySelector('[data-sx]');
                  const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
                  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
                  const hashes = r ? [...r.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href').slice(1)) : [];
                  return { root: !!r, theme: document.body.dataset.theme, h1: document.querySelectorAll('h1').length,
                    order: r ? [...r.querySelectorAll(':scope > section')].map(s => s.id) : [], dup,
                    missing: hashes.filter(h => !document.getElementById(h)),
                    overflow: document.documentElement.scrollWidth > innerWidth,
                    tableOverflow: (() => { const t = r && r.querySelector('.sx-proves-wrap'); return t && t.offsetParent ? t.scrollWidth - t.clientWidth : 0; })(),
                    wideOpen: r ? [...r.querySelectorAll('[data-sx-wide-open]')].map(x => x.open) : [],
                    navCurrent: !!document.querySelector('header a[href^="/standards"][aria-current], .mobile-nav a[href^="/standards"][aria-current], nav a[href^="/standards"][aria-current]'),
                    imgs: r ? [...r.querySelectorAll('img')].filter(i => !i.getAttribute('width') || !i.getAttribute('height')).length : -1 };
                }""")
                if not info["root"]: fail(f"{tag} Standards root missing"); await pg.close(); continue
                if info["theme"] != d: fail(f"{tag} theme is {info['theme']}")
                if info["h1"] != 1: fail(f"{tag} h1 count {info['h1']}")
                if info["order"] != ORDER: fail(f"{tag} section order {info['order']}")
                if info["dup"]: fail(f"{tag} duplicate ids {info['dup']}")
                if info["missing"]: fail(f"{tag} anchors without targets {info['missing']}")
                if info["overflow"]: fail(f"{tag} horizontal overflow")
                if info["tableOverflow"] > 2: fail(f"{tag} evidence table needs {info['tableOverflow']}px of sideways scrolling")
                if info["imgs"]: fail(f"{tag} images without dimensions {info['imgs']}")
                want = w >= 761
                if any(o != want for o in info["wideOpen"]): fail(f"{tag} optional expansion state {info['wideOpen']}")
                # Product picker: mouse, then keyboard.
                btns = pg.locator("[data-sx-pick]")
                if await btns.count() != 7: fail(f"{tag} picker has {await btns.count()} products")
                await btns.nth(2).click()
                vis = await pg.evaluate("() => [...document.querySelectorAll('[data-sx-panel]')].filter(p => !p.hidden).map(p => p.dataset.sxPanel)")
                pressed = await pg.evaluate("() => [...document.querySelectorAll('[data-sx-pick][aria-pressed=true]')].map(b => b.dataset.sxPick)")
                if vis != ["vitamin-d3-k2"] or pressed != ["vitamin-d3-k2"]: fail(f"{tag} picker click {vis} {pressed}")
                await btns.nth(2).focus(); await pg.keyboard.press("ArrowRight")
                vis = await pg.evaluate("() => [...document.querySelectorAll('[data-sx-panel]')].filter(p => !p.hidden).map(p => p.dataset.sxPanel)")
                focused = await pg.evaluate("() => document.activeElement.dataset.sxPick")
                if vis != ["omega-3-fish-oil"] or focused != "omega-3-fish-oil": fail(f"{tag} picker keyboard {vis} {focused}")
                # In-page anchor from the hero lands on its section.
                await pg.click(".sx-hero-actions a[href='#glance']")
                await pg.wait_for_timeout(1200)
                top = await pg.evaluate("() => document.getElementById('glance').getBoundingClientRect().top")
                if not (-5 < top < 200): fail(f"{tag} '#glance' jump landed at {top}")
                if AXE and w in (390, 1440):
                    await pg.add_script_tag(path=AXE)
                    res = await pg.evaluate("""async () => { const r = await axe.run('[data-sx]', { resultTypes: ['violations'] });
                      return r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, t: v.nodes.slice(0, 3).map(x => x.target.join(' ') + ' :: ' + (x.failureSummary || '').split('\\n').slice(1, 2).join('')) })); }""")
                    for v in res:
                        fail(f"{tag} axe {v['id']} ({v['impact']}) x{v['n']}: {v['t']}")
                if w == 1440:
                    facts[d] = await pg.evaluate(FACTS_JS)
                if errs: fail(f"{tag} errors {errs[:3]}")
                if not routes_checked:
                    routes_checked = True
                    hrefs = await pg.evaluate("() => [...new Set([...document.querySelectorAll('[data-sx] a[href^=\"/\"]')].map(a => a.getAttribute('href').split('#')[0]))]")
                    for h in hrefs:
                        q = await b.new_page(viewport={"width": 1100, "height": 800})
                        qerr = []
                        q.on("pageerror", lambda e: qerr.append(str(e)))
                        await q.goto(BASE + h, wait_until="networkidle")
                        r = await q.evaluate("""() => ({ h1: (document.querySelector('h1') || {}).textContent || '', nf: /not found|page (is )?missing|nothing here|lost/i.test((document.querySelector('h1') || {}).textContent || '') })""")
                        if not r["h1"].strip() or r["nf"] or qerr: fail(f"{d} link {h} -> h1 '{r['h1'].strip()[:40]}' notfound={r['nf']} {qerr[:1]}")
                        await q.close()
                    print(d, "links ok" if not any(f.startswith(f"{d} link") for f in fails) else "links FAIL", len(hrefs))
                await pg.close()
                print(tag, "checked")
        # Reduced motion: page renders and no transitions are declared on Standards elements.
        pg = await b.new_page(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
        for d in DESIGNS:
            await pg.goto(f"{BASE}/standards?design={d}", wait_until="networkidle")
            moving = await pg.evaluate("() => [...document.querySelectorAll('[data-sx] *')].filter(e => { const s = getComputedStyle(e); return parseFloat(s.transitionDuration) > 0 || s.animationName !== 'none'; }).length")
            if moving: fail(f"{d} reduced motion: {moving} elements still transition or animate")
        await b.close()
    # Facts parity across directions.
    if facts:
        ref_d = DESIGNS[0]
        for d, f in facts.items():
            for k in f:
                if k in ("h2",):
                    continue
                if f[k] != facts[ref_d][k]:
                    fail(f"parity {d} vs {ref_d}: {k} differs")
            if f["h2"] != facts[ref_d]["h2"]: fail(f"parity {d} vs {ref_d}: section titles differ {f['h2']}")
    print(json.dumps({"designs": DESIGNS, "widths": WIDTHS, "failures": len(fails)}))
    sys.exit(1 if fails else 0)

asyncio.run(main())
