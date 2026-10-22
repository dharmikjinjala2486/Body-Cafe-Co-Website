"""Compare the rendered #app DOM of non-Standards routes between two preview servers (changed :4174, baseline :4175)."""
import asyncio,hashlib,re,sys
from playwright.async_api import async_playwright
ROUTES=['/','/shop','/products/iron-bisglycinate','/products/omega-3-fish-oil','/bundles','/search?q=iron','/story','/about','/learn','/learn/reading-a-label','/learn/iron-bisglycinate','/reports','/reports?product=l-theanine','/cart','/checkout','/account','/help','/contact','/policies/returns','/settings']
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
                    a,ea=await grab(b,'http://127.0.0.1:4174',r,d,w)
                    c,ec=await grab(b,'http://127.0.0.1:4175',r,d,w)
                    n+=1
                    if a!=c or ea!=ec:
                        diffs+=1
                        i=next((k for k in range(min(len(a),len(c))) if a[k]!=c[k]),min(len(a),len(c)))
                        print('DIFF',d,w,r,'errs',ea[:1],ec[:1],'|',a[max(0,i-80):i+80],'||',c[max(0,i-80):i+80])
        await b.close()
    print('compared',n,'route states; differences',diffs)
asyncio.run(main())
