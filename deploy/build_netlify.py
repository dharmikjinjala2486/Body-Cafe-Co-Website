"""Export a shareable design preview; never publish the local database or source assets."""
from pathlib import Path
import json
import os
from urllib.parse import urlparse
import hashlib
import re
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


OTHER_DIRECTIONS = ['site-a', 'site-c', 'site-d', 'direction-d', 'pdp-a', 'pdp-c', 'pdp-d', 'cinema', 'live', 'site-b', 'pdp-b', 'editorial-b', 'variant-b', 'pdp-hero-b', 'pages-b', 'signature-b',
                    'site-f', 'site-g', 'site-h', 'typography-a']


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


STYLE = re.compile(r'<link rel="stylesheet" href="/web/([\w.-]+\.css)">')
SCRIPT = re.compile(r'<script src="/web/([\w.-]+\.js)"></script>')


def bundle(html, out):
    """One request instead of many (13 Nov 2026): each run of neighbouring style sheets, and each run of neighbouring
    classic scripts, becomes a single file in web/b/ named by its content, so it can be cached for good. The files, their
    order and what they do are unchanged; the originals stay in web/ for the local preview. A script that opens with
    "use strict" stays on its own, because joined to others it would lose that mode or give it to them."""
    (out / 'web/b').mkdir()

    def write(parts, ext, joiner):
        text = joiner.join(parts)
        name = 'site-' + hashlib.sha256(text.encode('utf-8')).hexdigest()[:12] + ext
        (out / 'web/b' / name).write_text(text, encoding='utf-8')
        return '/web/b/' + name

    lines, done, run, kind = html.split('\n'), [], [], None

    def flush():
        nonlocal run, kind
        if len(run) > 1:
            parts = [(out / 'web' / n).read_text(encoding='utf-8') for n in run]
            if kind == 'css':
                for n, t in zip(run, parts):
                    bare = re.sub(r'/\*.*?\*/|"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'', '', t, flags=re.S)
                    if bare.count('{') != bare.count('}') or '@import' in bare or '@charset' in bare:
                        raise ValueError(n + ' cannot be joined to the other style sheets (unbalanced braces, @import or @charset).')
                done.append('<link rel="stylesheet" href="' + write(parts, '.css', '\n') + '">')
            else:
                done.append('<script src="' + write(parts, '.js', '\n;\n') + '"></script>')
        elif run:
            done.append(('<link rel="stylesheet" href="/web/%s">' if kind == 'css' else '<script src="/web/%s"></script>') % run[0])
        run, kind = [], None

    for line in lines:
        css, js = STYLE.fullmatch(line.strip()), SCRIPT.fullmatch(line.strip())
        strict = bool(js) and re.match(r'\s*(?:/\*.*?\*/\s*|//[^\n]*\n\s*)*["\']use strict["\']', (out / 'web' / js.group(1)).read_text(encoding='utf-8'), re.S)
        if css or (js and not strict):
            k = 'css' if css else 'js'
            if kind != k:
                flush()
            kind = k
            run.append((css or js).group(1))
        else:
            flush()
            done.append(line)
    flush()
    return '\n'.join(done)


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
    # Every build carries the static design preview (seed catalogue, never local customer records).
    with tempfile.TemporaryDirectory() as tmp:
        products = Store(Path(tmp) / 'seed.sqlite3').products()
    catalog = {'products': products, 'bundles': BUNDLES, 'flags': {'ingredient_library': True, 'referrals': False, 'amazon_sync': False}, 'preview': True}
    (out / 'web/catalog-preview.json').write_text(json.dumps(catalog), encoding='utf-8')
    shutil.copy2(ROOT / 'deploy/hosted-preview.js', out / 'web/hosted-preview.js')
    if target:
        # Connected: only Variant E Part 2 and /ops use the API; connected-runtime.js decides before the preview loads.
        shutil.copy2(ROOT / 'deploy/connected-runtime.js', out / 'web/connected-runtime.js')
        html = html.replace('<script src="/web/homepage.js">', '<script src="/web/connected-runtime.js"></script>\n<script src="/web/hosted-preview.js"></script>\n<script src="/web/homepage.js">')
    else:
        html = html.replace('<script src="/web/homepage.js">', '<script src="/web/hosted-preview.js"></script>\n<script src="/web/homepage.js">')
    if site:
        # Variant E only, no fixtures or design switcher, indexable. Payments and providers are unaffected.
        html = html.replace('<meta name="robots" content="noindex,nofollow">', '<meta name="robots" content="index,follow">\n<meta name="bcc-release" content="production">')
        html = html.replace('<meta name="description" content="Explore seven everyday supplements from Body Café Co. Preview product information, ingredient guides and the lot-report experience.">',
                            '<meta name="description" content="Everyday supplements from Body Café Co., with ingredient guides, clear product details and a lot-record lookup.">')
        # E-only entry: keep both the shared E–H engine and E templates/styles.
        # Shared modules (world/creative/atelier/home-flow) stay loaded.
        html = '\n'.join(line for line in html.split('\n')
                          if not any('/web/' + name + ext + '"' in line for name in OTHER_DIRECTIONS for ext in ('.css', '.js')))
    html = bundle(html, out)
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
    (out / '_headers').write_text('/web/b/*\n  Cache-Control: public, max-age=31536000, immutable\n/api/*\n  Cache-Control: no-store\n/ops*\n  Cache-Control: no-store\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: same-origin\n  X-Frame-Options: DENY\n  Content-Security-Policy: frame-ancestors \'none\'; base-uri \'self\'; object-src \'none\'\n  Strict-Transport-Security: max-age=31536000\n  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(self)\n', encoding='utf-8')
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
