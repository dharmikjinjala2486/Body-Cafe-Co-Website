// Renders the frozen reference ourStory() (design-review/story-source-2026-11-02/reference-index.html) without a browser
// and prints its visible text, one block per line. Used to check exact copy parity of Variant E's Story page.
import fs from 'node:fs';
import vm from 'node:vm';
const file = process.argv[2] || 'design-review/story-source-2026-11-02/reference-index.html';
const html = fs.readFileSync(file, 'utf8');
const script = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
const pick = (start, end) => script.slice(script.indexOf(start), script.indexOf(end, script.indexOf(start)));
const code = [pick('const BRAND', 'const ROUTES'), pick('const esc', 'function glyph'), pick('function boardHTML', 'function cardHTML'), pick('function dayHTML', 'function manifestoHTML'), pick('function ourStory', 'let filter')].join('\n') + '\nout = ourStory();';
const ctx = { out: '' };
vm.runInNewContext(code, ctx);
const ent = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
const blocks = ctx.out
  .replace(/<(\/)?(p|h1|h2|h3|li|td|th|div|section|button|span class="sub")\b[^>]*>/g, '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&[a-z#0-9]+;/g, (m) => ent[m] ?? m)
  .split('\n').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
process.stdout.write(blocks.join('\n') + '\n');
