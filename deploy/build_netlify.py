"""Export a shareable design preview; never publish the local database or source assets."""
from pathlib import Path
import json
import shutil
import sys
import tempfile

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from app.server import Store, BUNDLES


def build():
    out = ROOT / 'dist'
    if out.exists():
        shutil.rmtree(out)
    out.mkdir()
    for folder in ['web', 'concepts']:
        shutil.copytree(ROOT / folder, out / folder, ignore=shutil.ignore_patterns('qa', '.DS_Store', '__pycache__'))
    shutil.copytree(ROOT / 'assets/brand', out / 'assets/brand', ignore=shutil.ignore_patterns('.DS_Store'))
    # Seeded sample records only. Do not read .local/preview.sqlite3 or export customer data.
    with tempfile.TemporaryDirectory() as tmp:
        products = Store(Path(tmp) / 'seed.sqlite3').products()
    catalog = {'products': products, 'bundles': BUNDLES, 'flags': {'ingredient_library': True, 'referrals': False, 'amazon_sync': False}, 'preview': True}
    (out / 'web/catalog-preview.json').write_text(json.dumps(catalog), encoding='utf-8')
    shutil.copy2(ROOT / 'deploy/hosted-preview.js', out / 'web/hosted-preview.js')
    html = (ROOT / 'web/index.html').read_text(encoding='utf-8')
    html = html.replace('<script src="/web/homepage.js">', '<script src="/web/hosted-preview.js"></script>\n<script src="/web/homepage.js">')
    (out / 'index.html').write_text(html, encoding='utf-8')
    (out / 'web/index.html').write_text(html, encoding='utf-8')
    (out / '_redirects').write_text('/* /index.html 200\n', encoding='utf-8')
    (out / 'robots.txt').write_text('User-agent: *\nDisallow: /\n', encoding='utf-8')
    print('Netlify design preview built in dist/ (no customer data or local backend).')


if __name__ == '__main__':
    build()
