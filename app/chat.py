"""Store assistant for the local preview: the twin of supabase/functions/operations/chat.js.

The rules given to the model, the limits and the Help Centre / policy knowledge are read from the hosted function's
files (chat.js, chat-knowledge.js), so the preview and the live site answer from the same instructions and facts.
The Anthropic API key comes from the ANTHROPIC_API_KEY environment variable and never reaches the browser.
BCC_CHAT_API_URL points the preview at a stand-in service for tests; it defaults to the Anthropic API.
"""
import json
import os
import re
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path

try:
    from app.errors import Error
except ImportError:  # run as a script: python3 app/server.py
    from errors import Error

HOSTED = Path(__file__).resolve().parent.parent / 'supabase/functions/operations'
API_URL = 'https://api.anthropic.com/v1/messages'
UNAVAILABLE = 'The assistant is unavailable right now. Please try again.'


def _hosted():
    """Model, limits, rules and store knowledge exactly as the hosted function defines them."""
    source = (HOSTED / 'chat.js').read_text(encoding='utf-8')
    knowledge = (HOSTED / 'chat-knowledge.js').read_text(encoding='utf-8')
    pick = lambda pattern, text=source: re.search(pattern, text, re.S).group(1)
    limits = {k: int(v) for k, v in re.findall(r'(\w+): (\d+)', pick(r'export const CHAT_LIMITS = \{(.*?)\};'))}
    return {
        'model': pick(r"export const CHAT_MODEL = '([^']+)';"),
        'limits': limits,
        'refusal': json.loads(pick(r'export const CHAT_REFUSAL = (".*?");')),
        'rules': pick(r'export const CHAT_RULES = `(.*?)`;'),
        'knowledge': json.loads(pick(r'export const STORE_KNOWLEDGE = (".*");', knowledge)),
    }


CONFIG = _hosted()
LIMITS = CONFIG['limits']

FIELDS = [('subtitle', 'In brief'), ('format', 'Format'), ('pack_size', 'Pack'), ('category', 'Category'), ('description', 'Description'), ('product_intro', 'About'), ('form_description', 'Form'), ('why_this_form', 'Why this form'), ('amount_per_serving', 'Amount per serving'), ('serving_size', 'Serving size'), ('servings_per_pack', 'Servings per pack'), ('ingredients', 'Ingredients'), ('other_ingredients', 'Other ingredients'), ('flavour_sweeteners', 'Flavour and sweeteners'), ('nutrition_information', 'Nutrition'), ('directions', 'Directions'), ('preparation', 'How to take'), ('keep_in_mind', 'Keep in mind'), ('warnings', 'Cautions'), ('storage', 'Storage'), ('allergens', 'Allergens'), ('dietary_suitability', 'Dietary suitability'), ('age_guidance', 'Age guidance'), ('certifications', 'Quality'), ('quality_note', 'Reports')]
_MAKER = re.compile(r'\b(made|manufactured|produced)\s+(by|at|for)\b|manufacturer', re.I)


def no_maker(text):
    """The site never names the manufacturer, so any sentence that does is left out."""
    parts = re.split(r'(?<=[.!?])\s+', str(text))
    return re.sub(r'\s+', ' ', ' '.join(p for p in parts if not _MAKER.search(p))).strip()


def product_facts(products):
    """The catalogue as plain text for the prompt: customer-facing fields only, no stock counts."""
    out = []
    for p in sorted((p for p in products or [] if p.get('published') is not False), key=lambda p: str(p['id'])):
        lines = [f"## {p['name']} (/products/{p['id']})", f"Price: ₹{p['price']} (MRP, inclusive of all taxes). {'In stock.' if (p.get('stock') or 0) > 0 else 'Out of stock at the moment.'}"]
        for key, label in FIELDS:
            value = no_maker(p[key]) if p.get(key) not in (None, '') else ''
            if value:
                lines.append(f'{label}: {value}')
        timing = p.get('label_timing')
        if isinstance(timing, dict):
            lines.append('When to take it: ' + '; '.join(f'{k}: {no_maker(timing[k])}' for k in ('morning', 'noon', 'night') if timing.get(k)))
        facts = p.get('supplement_facts') if isinstance(p.get('supplement_facts'), dict) else {}
        rows = facts.get('rows') if isinstance(facts.get('rows'), list) else []
        if rows:
            lines.append(f"Supplement facts per {facts.get('serving') or 'serving'}: " + '; '.join(f"{r.get('name')} {r.get('amount')}" + (f" ({r['rda']} RDA)" if r.get('rda') and r['rda'] != '#' else '') for r in rows))
        for f in p.get('faqs') if isinstance(p.get('faqs'), list) else []:
            if isinstance(f, dict) and f.get('question') and f.get('answer'):
                lines.append(f"Q: {no_maker(f['question'])} A: {no_maker(f['answer'])}")
        out.append('\n'.join(lines))
    return '\n\n'.join(out)


def messages(raw):
    """The conversation the browser sent: alternating user / assistant text, ending with the customer's question."""
    if not isinstance(raw, list) or not raw or len(raw) > LIMITS['messages']:
        raise Error('Start a new chat to keep going.')
    out, total = [], 0
    for i, m in enumerate(raw):
        role = 'assistant' if i % 2 else 'user'
        text = m['content'].strip() if isinstance(m, dict) and isinstance(m.get('content'), str) else ''
        if not isinstance(m, dict) or m.get('role') != role or not text:
            raise Error('Invalid conversation.')
        if role == 'user' and len(text) > LIMITS['messageChars']:
            raise Error(f"Keep your message under {LIMITS['messageChars']} characters.", 413)
        total += len(text)
        out.append({'role': role, 'content': text})
    if len(out) % 2 == 0:
        raise Error('Invalid conversation.')
    if total > LIMITS['totalChars']:
        raise Error('This chat has got long. Start a new chat to keep going.', 413)
    return out


def request_body(msgs, products):
    return {
        'model': CONFIG['model'],
        'max_tokens': 4000,
        'stream': True,
        'output_config': {'effort': 'low'},
        'fallbacks': 'default',
        'system': [
            {'type': 'text', 'text': CONFIG['rules'] + '\n\n# Store facts\n\n' + CONFIG['knowledge']},
            {'type': 'text', 'text': '# The seven products\n\n' + product_facts(products), 'cache_control': {'type': 'ephemeral'}},
        ],
        'messages': msgs,
    }


_hits, _lock = {}, threading.Lock()


def allow(key, now=None):
    """Hourly limit per visitor and daily limit for the store, held in memory (the hosted API keeps these in the database)."""
    now = int(now or time.time())
    hour, day = now // 3600, now // 86400
    with _lock:
        for k in [k for k in _hits if k[1] < (day if k[0] == 'all' else hour)]:
            del _hits[k]
        _hits[('all', day)] = _hits.get(('all', day), 0) + 1
        if _hits[('all', day)] > LIMITS['perDay']:
            raise Error('The assistant has answered all it can today. Please contact us instead.', 429)
        _hits[(key, hour)] = _hits.get((key, hour), 0) + 1
        if _hits[(key, hour)] > LIMITS['perHour']:
            raise Error('You have asked a lot in the last hour. Please try again a little later.', 429)


def stream(msgs, products, key, url=None, opener=urllib.request.urlopen):
    """Calls Claude and yields the answer's text as it arrives. Raises Error before the first piece when the
    service can't be reached, so the browser gets an ordinary JSON error it can show."""
    req = urllib.request.Request(url or os.getenv('BCC_CHAT_API_URL') or API_URL, data=json.dumps(request_body(msgs, products)).encode(), method='POST', headers={'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2026-10-21', 'anthropic-beta': 'server-side-fallback-2026-07-01'})
    try:
        response = opener(req, timeout=120)
    except urllib.error.HTTPError as e:
        print('Chat upstream error:', e.code, flush=True)
        raise Error('The assistant is busy. Please try again in a moment.' if e.code in (429, 529) else UNAVAILABLE, 503)
    except (urllib.error.URLError, OSError):
        raise Error(UNAVAILABLE, 503)

    def pieces():
        sent = False
        with response:
            for raw in response:
                line = raw.decode('utf-8', 'replace').strip()
                if not line.startswith('data:'):
                    continue
                try:
                    event = json.loads(line[5:])
                except ValueError:
                    continue
                delta = event.get('delta') or {}
                if event.get('type') == 'content_block_delta' and delta.get('type') == 'text_delta' and delta.get('text'):
                    sent = True
                    yield delta['text']
                elif event.get('type') == 'message_delta' and delta.get('stop_reason') == 'refusal' and not sent:
                    sent = True
                    yield CONFIG['refusal']
        if not sent:
            yield 'Sorry, I could not finish that answer. Please ask again.'
    return pieces()
