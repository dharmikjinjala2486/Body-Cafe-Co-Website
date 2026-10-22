"""Trim the transparent margin of each rendered PNG and save the WebP stills used by directions E–H.
usage: python3 to_webp.py <png-dir> <out-dir>   (three-quarter views → 1000px tall, caps → 400×400)"""
import sys, os, glob
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
for f in sorted(glob.glob(os.path.join(src, "*.png"))):
  im = Image.open(f).convert("RGBA")
  im = im.crop(im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox())
  name = os.path.basename(f)[:-4]
  if name.endswith("-cap"):
    s = max(im.size); c = Image.new("RGBA", (s, s)); c.paste(im, ((s - im.width) // 2, (s - im.height) // 2)); im = c.resize((400, 400), Image.LANCZOS)
  else:
    im = im.resize((round(im.width * 1000 / im.height), 1000), Image.LANCZOS)
  im.save(os.path.join(out, name + ".webp"), "WEBP", quality=86, method=6)
  print(name, im.size)
