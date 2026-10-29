"""Export a shareable design preview; never publish the local database or source assets."""
from pathlib import Path
import json
import os
from urllib.parse import urlparse
import shutil
import sys
import tempfile

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from app.server import Store, BUNDLES


def api_target(mode, origin):
    if mode not in ('static', 'connected'):
        raise ValueError('BCC_HOSTED_MODE must be static or connected.')
    if mode == 'static':
        return None
    parsed = urlparse(origin or '')
    if (parsed.scheme != 'https' or not parsed.hostname or parsed.username or parsed.password
            or parsed.query or parsed.fragment or parsed.port is not None
            or parsed.path != '/functions/v1/operations'
            or not parsed.hostname.endswith('.supabase.co')):
        raise ValueError('Set BCC_API_ORIGIN to the HTTPS operations Edge Function URL.')
    return origin.rstrip('/')


def build():
    mode = os.getenv('BCC_HOSTED_MODE', 'static')
    target = api_target(mode, os.getenv('BCC_API_ORIGIN'))
    out = ROOT / 'dist'
    if out.exists():
        shutil.rmtree(out)
    out.mkdir()
    for folder in ['web', 'concepts']:
        shutil.copytree(ROOT / folder, out / folder, ignore=shutil.ignore_patterns('qa', '.DS_Store', '__pycache__'))
    shutil.copytree(ROOT / 'assets/brand', out / 'assets/brand', ignore=shutil.ignore_patterns('.DS_Store'))
    html = (ROOT / 'web/index.html').read_text(encoding='utf-8')
    if target:
        shutil.copy2(ROOT / 'deploy/connected-runtime.js', out / 'web/connected-runtime.js')
        html = html.replace('<script src="/web/homepage.js">', '<script src="/web/connected-runtime.js"></script>\n<script src="/web/homepage.js">')
    else:
        # The static preview never exports local customer records.
        with tempfile.TemporaryDirectory() as tmp:
            products = Store(Path(tmp) / 'seed.sqlite3').products()
        catalog = {'products': products, 'bundles': BUNDLES, 'flags': {'ingredient_library': True, 'referrals': False, 'amazon_sync': False}, 'preview': True}
        (out / 'web/catalog-preview.json').write_text(json.dumps(catalog), encoding='utf-8')
        shutil.copy2(ROOT / 'deploy/hosted-preview.js', out / 'web/hosted-preview.js')
        html = html.replace('<script src="/web/homepage.js">', '<script src="/web/hosted-preview.js"></script>\n<script src="/web/homepage.js">')
    (out / 'index.html').write_text(html, encoding='utf-8')
    (out / 'web/index.html').write_text(html, encoding='utf-8')
    feedback = (ROOT / 'web/feedback.html').read_text(encoding='utf-8')
    feedback = feedback.replace('id="theme-feedback"', 'id="theme-feedback" data-submission-mode="netlify"')
    (out / 'feedback').mkdir()
    (out / 'feedback/index.html').write_text(feedback, encoding='utf-8')
    # Keep only one form definition for Netlify's static HTML detection.
    (out / 'web/feedback.html').unlink()
    redirects = ('/api/* ' + target + '/api/:splat 200!\n') if target else ''
    redirects += '/feedback /feedback/index.html 200\n/feedback/ /feedback/index.html 200\n/* /index.html 200\n'
    (out / '_redirects').write_text(redirects, encoding='utf-8')
    (out / '_headers').write_text('/api/*\n  Cache-Control: no-store\n/ops*\n  Cache-Control: no-store\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: same-origin\n', encoding='utf-8')
    (out / 'robots.txt').write_text('User-agent: *\nDisallow: /\n', encoding='utf-8')
    print('Netlify ' + mode + ' build in dist/ (no database, credentials or customer data exported).')


if __name__ == '__main__':
    build()
