/* Isolate a Claude visual-reference stylesheet inside one existing app theme.
   Usage: node scope_variant_css.mjs input.css e output.css
   No dependencies, network access, or source-code execution. */
import fs from 'node:fs';

const [input, theme, output] = process.argv.slice(2);
if (!input || !output || !['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].includes(theme)) {
  throw new Error('Expected input stylesheet, theme a–h, and output stylesheet.');
}
const root = `body[data-theme="${theme}"]`;

function splitSelectors(value) {
  const parts = [];
  let start = 0, round = 0, square = 0, quote = '';
  for (let i = 0; i < value.length; i++) {
    const c = value[i];
    if (c === '\\') { i++; continue; }
    if (quote) { if (c === quote) quote = ''; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === '(') round++;
    if (c === ')') round--;
    if (c === '[') square++;
    if (c === ']') square--;
    if (c === ',' && !round && !square) { parts.push(value.slice(start, i)); start = i + 1; }
  }
  parts.push(value.slice(start));
  return parts.map(s => s.trim()).filter(Boolean);
}

function selector(value) {
  if (value === 'html' || value === 'body' || value === ':root') return root;
  if (/^html\s+body(?=[\s.#[:]|$)/.test(value)) return value.replace(/^html\s+body/, root);
  if (/^(body|html|:root)(?=[\s.#[:]|$)/.test(value)) return value.replace(/^(body|html|:root)/, root);
  return `${root} ${value}`;
}

function scoped(css) {
  let result = '', start = 0, quote = '', comment = false, round = 0;
  for (let i = 0; i < css.length; i++) {
    const c = css[i], next = css[i + 1];
    if (comment) { if (c === '*' && next === '/') { comment = false; i++; } continue; }
    if (!quote && c === '/' && next === '*') { comment = true; i++; continue; }
    if (c === '\\') { i++; continue; }
    if (quote) { if (c === quote) quote = ''; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === '(') round++;
    if (c === ')') round--;
    if (round) continue;
    if (c === ';') {
      const prelude = css.slice(start, i + 1).replace(/\/\*[\s\S]*?\*\//g, '').trim();
      if (prelude && !/^@charset\b/i.test(prelude)) throw new Error(`Review unsupported statement: ${prelude}`);
      start = i + 1;
    }
    if (c !== '{') continue;
    const prelude = css.slice(start, i).replace(/\/\*[\s\S]*?\*\//g, '').trim();
    let depth = 1, end = i + 1, innerQuote = '', innerComment = false;
    for (; end < css.length && depth; end++) {
      const a = css[end], b = css[end + 1];
      if (innerComment) { if (a === '*' && b === '/') { innerComment = false; end++; } continue; }
      if (!innerQuote && a === '/' && b === '*') { innerComment = true; end++; continue; }
      if (a === '\\') { end++; continue; }
      if (innerQuote) { if (a === innerQuote) innerQuote = ''; continue; }
      if (a === '"' || a === "'") { innerQuote = a; continue; }
      if (a === '{') depth++;
      if (a === '}') depth--;
    }
    if (depth) throw new Error('Unbalanced stylesheet.');
    const body = css.slice(i + 1, end - 1);
    if (/^@(media|supports|container|layer)\b/i.test(prelude)) result += `${prelude}{\n${scoped(body)}}\n`;
    else if (/^@font-face\b/i.test(prelude)) { /* Use the existing brand font declarations. */ }
    else if (/^@keyframes\b/i.test(prelude)) result += `${prelude}{${body}}\n`;
    else if (prelude.startsWith('@')) throw new Error(`Review unsupported at-rule: ${prelude}`);
    else result += `${splitSelectors(prelude).map(selector).join(',\n')}{${body}}\n`;
    start = end;
    i = end - 1;
  }
  return result;
}

const text = fs.readFileSync(input, 'utf8');
fs.writeFileSync(output, `/* Claude visual design, isolated to theme ${theme.toUpperCase()}. */\n${scoped(text)}`);
