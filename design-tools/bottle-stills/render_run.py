import asyncio, base64, json, sys, os
from playwright.async_api import async_playwright
OUT=sys.argv[1]; os.makedirs(OUT,exist_ok=True)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome",args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=await b.new_page(); pg.set_default_timeout(600000)
    pg.on("console",lambda m:print("console:",m.text))
    await pg.goto("http://127.0.0.1:8765/render.html"+(sys.argv[2] if len(sys.argv)>2 else ""))
    await pg.wait_for_function("window.done===true",timeout=600000)
    err=await pg.evaluate("window.err||''"); print("err",err); print(await pg.evaluate("JSON.stringify(window.log)"))
    res=await pg.evaluate("window.results")
    for k,v in res.items():
      for n,d in v.items():
        open(f"{OUT}/{k}-{n}.png","wb").write(base64.b64decode(d.split(",")[1]))
    await b.close()
asyncio.run(main())
