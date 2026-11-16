// graph.js — the topic map in the progress panel.
//
// Each topic (post) is a row. "requiere:" in the front matter draws a line from the
// topic you should read first to the ones that build on it. The indent is the "level":
// how many topics you need before this one. Dots use the progress colors.
//
//   renderTopicGraph(container, posts, { current })
//     posts    catalog.posts (each one has .requires, computed by build-index.mjs)
//     current  slug to ring (the last post you opened)
import { el } from './data.js';
import { t } from './i18n.js';
import { getStatus, isTopic } from './progress.js';

const NS = 'http://www.w3.org/2000/svg';
const ROW = 34, PAD = 16, INDENT = 24, R = 8;

// SVG elements need createElementNS (el() only makes HTML elements)
function svg(tag, attrs = {}, ...children) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined) node.setAttribute(k, v);
  for (const c of children) if (c !== null && c !== undefined) node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return node;
}

// Rows in an order where every topic comes after the ones it requires,
// and each topic sits right under its first prerequisite when possible.
function layout(nodes) {
  const bySlug = new Map(nodes.map((n) => [n.slug, n]));
  const reqs = (n) => (n.requires || []).filter((s) => bySlug.has(s));
  const levels = new Map();
  const level = (n) => {
    if (!levels.has(n.slug)) levels.set(n.slug, reqs(n).length ? 1 + Math.max(...reqs(n).map((s) => level(bySlug.get(s)))) : 0);
    return levels.get(n.slug);
  };
  const byTitle = (a, b) => a.title.localeCompare(b.title);
  const placed = [], done = new Set();
  const visit = (n) => {
    if (done.has(n.slug) || !reqs(n).every((s) => done.has(s))) return;
    done.add(n.slug);
    placed.push(n);
    nodes.filter((c) => reqs(c).includes(n.slug)).sort(byTitle).forEach(visit);
  };
  // roots with more topics hanging from them go first
  const descendants = (slug) => nodes.filter((c) => reqs(c).includes(slug)).length;
  nodes.filter((n) => !reqs(n).length).sort((a, b) => descendants(b.slug) - descendants(a.slug) || byTitle(a, b)).forEach(visit);
  nodes.filter((n) => !done.has(n.slug)).forEach((n) => { done.add(n.slug); placed.push(n); }); // safety net
  return placed.map((n, row) => ({ node: n, row, level: level(n), reqs: reqs(n) }));
}

export function renderTopicGraph(container, posts, { current = null } = {}) {
  const nodes = posts.filter(isTopic);
  if (!nodes.length) { container.replaceChildren(el('span', { class: 'panel__muted' }, t('panel_graph_soon'))); return; }

  const rows = layout(nodes);
  const pos = new Map(rows.map((r) => [r.node.slug, { x: PAD + r.level * INDENT, y: PAD + r.row * ROW }]));
  const width = Math.max(220, Math.round(container.clientWidth || 260));
  const height = PAD * 2 + (rows.length - 1) * ROW;
  const charWidth = 6.6; // ≈ width of one 12px letter, to cut long titles

  // lines: out of the prerequisite, down a "lane" just to its right (so it never crosses
  // other dots of the same column), then a rounded turn into the topic
  const edges = rows.flatMap((r) => r.reqs.map((from) => {
    const a = pos.get(from), b = pos.get(r.node.slug);
    const lane = a.x + R + 2;
    return svg('path', { class: 'graph__edge', d: `M${a.x + 5} ${a.y + 5} L${lane} ${a.y + 12} V${b.y - 4} Q${lane} ${b.y} ${lane + 4} ${b.y} H${b.x - R - 1}` });
  }));

  const dots = rows.map((r) => {
    const { x, y } = pos.get(r.node.slug);
    const status = getStatus(r.node.slug, r.node);
    const maxChars = Math.max(6, Math.floor((width - x - R - 12) / charWidth));
    const label = r.node.title.length > maxChars ? `${r.node.title.slice(0, maxChars - 1)}…` : r.node.title;
    const name = `${r.node.title} — ${t(`status_${status}`)}`;
    return svg('a', { href: `post.html?p=${encodeURIComponent(r.node.slug)}`, class: 'graph__link', 'aria-label': name },
      svg('title', {}, name),
      r.node.slug === current ? svg('circle', { class: 'graph__ring', cx: x, cy: y, r: R + 4 }) : null,
      svg('circle', { class: `graph__node st--${status}`, cx: x, cy: y, r: R }),
      svg('text', { class: 'graph__label', x: x + R + 8, y: y + 4 }, label));
  });

  container.replaceChildren(
    svg('svg', { class: 'graph', viewBox: `0 0 ${width} ${height}`, width, height, 'aria-labelledby': 'graph-title graph-desc' },
      svg('title', { id: 'graph-title' }, t('panel_graph')),
      svg('desc', { id: 'graph-desc' }, t('graph_desc')),
      svg('g', {}, ...edges),
      svg('g', {}, ...dots)),
    el('p', { class: 'graph__caption' }, t('graph_caption')));
}
