// Checks Variant E's footer legal line (web/footer-e.js) against the owner-selected reference footerHTML().
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('design-review/story-source-2026-11-02/reference-index.html', 'utf8');
const script = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
const pick = (start, end) => script.slice(script.indexOf(start), script.indexOf(end, script.indexOf(start)));
const ref = {};
vm.runInNewContext([pick('const BRAND', 'const MAKERS'), pick('const ROUTES', 'const NOTES'), pick('const esc', 'function glyph'), pick('function footerHTML', 'let feedbackBooted'), 'ref.footer = footerHTML();'].join('\n'), { ref });
const text = ref.footer.replace(/<br>/g, '\n').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/[ \t]+/g, ' ');
const window = { BCCSite: { themes: { e: {} } }, BCCLivingE: { esc: (s) => s, wrap() {}, frag() {} } };
vm.runInNewContext(fs.readFileSync('web/footer-e.js', 'utf8'), { window });
const E = window.BCCFooterE;
assert.ok(text.includes(E.LEGAL), 'legal line is verbatim from the reference footer');
assert.ok(text.includes('© 2026 ' + E.OWNER), 'copyright holder matches the reference');
console.log('Footer E content passed: legal line and copyright holder verbatim from the reference footerHTML().');
