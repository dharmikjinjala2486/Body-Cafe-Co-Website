"""Pack existing turntable frames into one request per bottle.
Run: uv run --with pillow python design-tools/build-spin-atlases.py
"""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'web/media/spin'
for front in sorted(root.glob('*-00.webp')):
    slug = front.name[:-8]
    sheet = Image.new('RGBA', (520 * 6, 860 * 4))
    for frame in range(24):
        with Image.open(root / f'{slug}-{frame:02}.webp') as source:
            assert source.size == (520, 860)
            sheet.paste(source, ((frame % 6) * 520, (frame // 6) * 860))
    target = root / f'{slug}-atlas.webp'
    sheet.save(target, 'WEBP', quality=82, method=6)
    print(target.name, target.stat().st_size)
