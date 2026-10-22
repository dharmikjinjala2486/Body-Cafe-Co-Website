"""Compare the rendered #app DOM of every non-product route between a changed and a baseline preview server.
Usage: compare_other_routes.py CHANGED_URL BASELINE_URL (each server on its own fresh database)."""
import asyncio,hashlib,re,sys
from playwright.async_api import async_playwright
import sys
CHANGED=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:4174'
BASE=sys.argv[2] if len(sys.argv)>2 else 'http://127.0.0.1:4175'
ROUTES=['/','/shop','/standards','/bundles','/bundles/daily-edit','/search?q=iron','/story','/about','/learn','/learn/reading-a-label','/learn/iron-bisglycinate','/reports','/reports?product=l-theanine','/cart','/checkout','/account','/account/cases','/help','/contact','/policies/returns','/settings','/preview/states']
async def grab(b,base,path,d,w):
    pg=await b.new_page(viewport={'width':w,'height':900},reduced_motion='reduce')
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    sep='&' if '?' in path else '?'
    await pg.goto(f'{base}{path}{sep}design={d}',wait_until='networkidle');await pg.wait_for_timeout(300)
    h=await pg.evaluate("()=>{const a=document.querySelector('#app').cloneNode(true);a.querySelectorAll('[data-cart-count]').forEach(e=>e.textContent='');return a.innerHTML.replace(/design=[a-h]/g,'').replace(/\\s+/g,' ')}")
    await pg.close();return h,errs
async def main():
    diffs=0;n=0
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for d in 'abcdefgh':
            for w in (1440,390):
                for r in ROUTES:
                    a,ea=await grab(b,CHANGED,r,d,w)
                    c,ec=await grab(b,BASE,r,d,w)
                    n+=1
                    if a!=c or ea!=ec:
                        diffs+=1
                        i=next((k for k in range(min(len(a),len(c))) if a[k]!=c[k]),min(len(a),len(c)))
                        print('DIFF',d,w,r,'errs',ea[:1],ec[:1],'|',a[max(0,i-80):i+80],'||',c[max(0,i-80):i+80])
        await b.close()
    print('compared',n,'route states; differences',diffs)
asyncio.run(main())
