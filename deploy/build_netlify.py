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


OTHER_DIRECTIONS = ['site-a', 'site-c', 'site-d', 'direction-d', 'pdp-a', 'pdp-c', 'pdp-d', 'cinema', 'live', 'site-eh',
                    'site-e', 'site-f', 'site-g', 'site-h', 'typography-a']


def release_target(release, site_url):
    """Preview (the default) stays noindex with design tooling. Production is an explicit, deliberate opt-in."""
    if release not in ('preview', 'production'):
        raise ValueError('BCC_RELEASE must be preview or production.')
    if release == 'preview':
        return None
    parsed = urlparse(site_url or '')
    if parsed.scheme != 'https' or not parsed.hostname or parsed.path not in ('', '/') or parsed.query or parsed.fragment:
        raise ValueError('Set BCC_SITE_URL to the production https:// origin before a production release.')
    return site_url.rstrip('/')


def build():
    mode = os.getenv('BCC_HOSTED_MODE', 'static')
    target = api_target(mode, os.getenv('BCC_API_ORIGIN'))
    site = release_target(os.getenv('BCC_RELEASE', 'preview'), os.getenv('BCC_SITE_URL'))
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
    if site:
        # Variant B only, no fixtures or design switcher, indexable. Payments and providers are unaffected.
        html = html.replace('<meta name="robots" content="noindex,nofollow">', '<meta name="robots" content="index,follow">\n<meta name="bcc-release" content="production">')
        html = html.replace('<meta name="description" content="Explore seven everyday supplements from Body Café Co. Preview product information, ingredient guides and the lot-report experience.">',
                            '<meta name="description" content="Everyday supplements from Body Café Co., with ingredient guides, clear product details and a lot-record lookup.">')
        # B-only entry: drop stylesheets/scripts that only serve other design directions (about 790 KB uncompressed).
        # Verified to render B routes identically; shared modules (world/creative/atelier/home-flow) stay loaded.
        html = '\n'.join(line for line in html.split('\n')
                          if not any('/web/' + name + ext + '"' in line for name in OTHER_DIRECTIONS for ext in ('.css', '.js')))
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
    if site:
        routes = ['/', '/shop', '/bundles', '/standards', '/about', '/story', '/learn', '/reports', '/help', '/contact',
                  '/policies/shipping', '/policies/returns', '/policies/cancellation', '/policies/privacy', '/policies/terms']
        # Product and guide URLs follow the live catalogue; add them here once the release catalogue is fixed.
        urls = ''.join('  <url><loc>' + site + r + '</loc></url>\n' for r in routes)
        (out / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + '</urlset>\n', encoding='utf-8')
        (out / 'robots.txt').write_text('User-agent: *\nDisallow: /ops\nDisallow: /api/\nSitemap: ' + site + '/sitemap.xml\n', encoding='utf-8')
    else:
        (out / 'robots.txt').write_text('User-agent: *\nDisallow: /\n', encoding='utf-8')
    print('Netlify ' + mode + ' ' + ('production' if site else 'preview') + ' build in dist/ (no database, credentials or customer data exported).')


if __name__ == '__main__':
    build()
