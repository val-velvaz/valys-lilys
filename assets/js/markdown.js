// markdown.js — small Markdown → DOM renderer (no innerHTML, no external scripts).
// Supports: front matter, # headings, paragraphs, **bold**, *italic*, ~~strike~~, `code`,
// ==highlight== / =={pink}highlight==, [links](url), ![images](url), > quotes,
// > [!NOTE] / [!TIP] / [!FEYNMAN] / [!WARNING] / [!IMPORTANT] / [!IDEA] callouts,
// - lists, 1. lists, - [ ] tasks, tables, --- and ```code``` blocks.
import { el } from './data.js';

export function parseFrontMatter(src) {
  const m = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/.exec(src);
  if (!m) return { data: {}, body: src };
  const data = {};
  let lastKey = null;
  const clean = (s) => s.trim().replace(/^["']|["']$/g, '');
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const item = /^\s+-\s+(.*)$/.exec(line);
    if (item && lastKey) { (data[lastKey] = Array.isArray(data[lastKey]) ? data[lastKey] : []).push(clean(item[1])); continue; }
    const kv = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
    if (!kv) continue;
    lastKey = kv[1];
    let v = kv[2].trim();
    if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map(clean).filter(Boolean);
    else if (v === '') v = [];
    else if (v === 'true' || v === 'false') v = v === 'true';
    else v = clean(v);
    data[lastKey] = v;
  }
  return { data, body: src.slice(m[0].length) };
}

/* ---------- blocks ---------- */
const FENCE = /^\s*(```+|~~~+)\s*([\w-]*)\s*$/;
const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const HR = /^\s*([-*_])(\s*\1){2,}\s*$/;
const QUOTE = /^\s*>/;
const LIST = /^(\s*)([-*+]|\d+[.)])\s+/;
const TABLE_SEP = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;
const CALLOUT = /^\[!(NOTE|TIP|FEYNMAN|WARNING|IMPORTANT|IDEA)\]\s*(.*)$/i;
const CALLOUT_ICON = { note: '✎', tip: '✿', feynman: '⚛', warning: '⚠', important: '★', idea: '💡' };

const indentOf = (l) => l.match(/^\s*/)[0].replace(/\t/g, '    ').length;
const isTableStart = (lines, i) => lines[i].includes('|') && i + 1 < lines.length && TABLE_SEP.test(lines[i + 1]);
const isBlockStart = (lines, i) => {
  const l = lines[i];
  return FENCE.test(l) || HEADING.test(l) || HR.test(l) || QUOTE.test(l) || LIST.test(l) || isTableStart(lines, i);
};

// opts.fence(lang, code) may return a Node to replace a ``` block (used for games)
export function renderMarkdown(src, opts = {}) {
  const lines = src.replace(/\r\n?/g, '\n').replace(/<!--[\s\S]*?-->/g, '').split('\n');
  return blocks(lines, opts);
}

function blocks(lines, opts) {
  const frag = document.createDocumentFragment();
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    let m;

    if ((m = FENCE.exec(line))) {
      const fence = m[1], lang = m[2].toLowerCase(), buf = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence)) buf.push(lines[i++]);
      i++;
      const code = buf.join('\n');
      frag.append((opts.fence && opts.fence(lang, code)) || codeBlock(lang, code));
      continue;
    }
    if ((m = HEADING.exec(line))) {
      const level = m[1].length;
      frag.append(el(`h${Math.min(level + 1, 6)}`, { class: `md-h${level}` }, inline(m[2])));
      i++;
      continue;
    }
    if (HR.test(line)) { frag.append(el('hr')); i++; continue; }
    if (QUOTE.test(line)) {
      const buf = [];
      while (i < lines.length && QUOTE.test(lines[i])) buf.push(lines[i++].replace(/^\s*>\s?/, ''));
      frag.append(quote(buf, opts));
      continue;
    }
    if (isTableStart(lines, i)) {
      const rows = [line];
      i += 2;
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) rows.push(lines[i++]);
      frag.append(table(rows));
      continue;
    }
    if (LIST.test(line)) {
      const buf = [];
      const continues = (j) => LIST.test(lines[j]) || /^\s{2,}\S/.test(lines[j]);
      while (i < lines.length && (continues(i) || (!lines[i].trim() && i + 1 < lines.length && continues(i + 1)))) buf.push(lines[i++]);
      frag.append(list(buf, opts));
      continue;
    }
    // paragraph
    const buf = [lines[i++].trim()];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines, i)) buf.push(lines[i++].trim());
    frag.append(el('p', {}, inline(buf.join(' '))));
  }
  return frag;
}

function codeBlock(lang, code) {
  return el('pre', { 'data-lang': lang || null }, el('code', {}, code));
}

function quote(lines, opts) {
  const m = CALLOUT.exec((lines[0] || '').trim());
  if (!m) return el('blockquote', {}, blocks(lines, opts));
  const kind = m[1].toLowerCase();
  const rest = m[2] ? [m[2], ...lines.slice(1)] : lines.slice(1);
  return el('blockquote', { class: `callout callout--${kind}` },
    el('p', { class: 'callout__title' }, `${CALLOUT_ICON[kind]} ${kind}`),
    blocks(rest, opts));
}

function table(rows) {
  const cells = (r) => r.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  const [head, ...body] = rows;
  return el('div', { class: 'table-wrap' },
    el('table', {},
      el('thead', {}, el('tr', {}, cells(head).map((c) => el('th', {}, inline(c))))),
      el('tbody', {}, body.map((r) => el('tr', {}, cells(r).map((c) => el('td', {}, inline(c))))))));
}

function list(lines, opts) {
  const base = indentOf(lines[0]);
  const root = el(/^\s*\d/.test(lines[0]) ? 'ol' : 'ul');
  let item = null, sub = [];
  const flush = () => {
    const nested = sub.filter((l) => l.trim());
    if (item && nested.length) {
      const min = Math.min(...nested.map(indentOf));
      item.append(blocks(sub.map((l) => l.slice(Math.min(min, indentOf(l)))), opts));
    }
    sub = [];
  };
  for (const l of lines) {
    const m = LIST.exec(l);
    if (m && indentOf(l) <= base) {
      flush();
      let text = l.slice(m[0].length);
      item = el('li');
      const task = /^\[([ xX])\]\s+/.exec(text);
      if (task) {
        item.className = 'task';
        const box = el('input', { type: 'checkbox' });
        box.checked = task[1] !== ' ';
        item.append(box, ' ');
        text = text.slice(task[0].length);
      }
      item.append(inline(text));
      root.append(item);
    } else sub.push(l);
  }
  flush();
  return root;
}

/* ---------- inline ---------- */
const HL = { pink: 'pink', rosa: 'pink', yellow: 'yellow', amarillo: 'yellow', blue: 'blue', azul: 'blue', green: 'green', verde: 'green', lilac: 'lilac', lila: 'lilac' };

// Only http(s), mailto and relative links (never javascript: or data:)
const safeUrl = (u) => !/^\s*[a-z][a-z0-9+.-]*:/i.test(u) || /^(https?:|mailto:)/i.test(u.trim());

const RULES = [
  [/\\([\\`*_{}[\]()#+\-.!=~|>])/, (m) => m[1]],
  [/`([^`]+)`/, (m) => el('code', {}, m[1])],
  [/!\[([^\]]*)\]\(([^)\s]+)\)/, (m) => (safeUrl(m[2]) ? el('img', { src: m[2], alt: m[1], loading: 'lazy' }) : m[0])],
  [/\[([^\]]+)\]\(([^)\s]+)\)/, (m) => {
    if (!safeUrl(m[2])) return m[1];
    const ext = /^https?:/i.test(m[2]);
    return el('a', { href: m[2], target: ext ? '_blank' : null, rel: ext ? 'noopener noreferrer' : null }, inline(m[1]));
  }],
  [/==(?:\{([a-z]+)\})?(.+?)==/, (m) => el('mark', { class: `hl hl--${HL[m[1]] || 'yellow'}` }, inline(m[2]))],
  [/\*\*(.+?)\*\*/, (m) => el('strong', {}, inline(m[1]))],
  [/~~(.+?)~~/, (m) => el('del', {}, inline(m[1]))],
  [/(?<![\w*])\*(?![\s*])(.+?)\*(?![\w*])/, (m) => el('em', {}, inline(m[1]))],
  [/(?<!\w)_(?![\s_])(.+?)_(?!\w)/, (m) => el('em', {}, inline(m[1]))]
];

export function inline(text) {
  const frag = document.createDocumentFragment();
  let rest = text;
  while (rest) {
    let best = null;
    for (const [re, make] of RULES) {
      const m = re.exec(rest);
      if (m && (!best || m.index < best.m.index)) best = { m, make };
    }
    if (!best) { frag.append(rest); break; }
    if (best.m.index) frag.append(rest.slice(0, best.m.index));
    const out = best.make(best.m);
    frag.append(out instanceof Node ? out : String(out));
    rest = rest.slice(best.m.index + best.m[0].length);
  }
  return frag;
}
