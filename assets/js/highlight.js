// highlight.js — select text in a post → pick a color → it is saved in this browser.
// Each highlight is stored as start/end positions in the post's text.
import { el, store } from './data.js';
import { t } from './i18n.js';

export const COLORS = ['pink', 'yellow', 'blue', 'green', 'lilac'];
const KEY = 'highlights';
export const loadAll = () => store.get(KEY, {});
export const saveAll = (all) => store.set(KEY, all);

// Text nodes inside the post, skipping games and other .no-hl parts
function textNodes(root) {
  const out = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement.closest('.no-hl') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)
  });
  for (let n = walker.nextNode(); n; n = walker.nextNode()) out.push(n);
  return out;
}

function offsetOf(root, node, offset) {
  const probe = document.createRange();
  probe.setStart(node, offset);
  let acc = 0;
  for (const tn of textNodes(root)) {
    if (tn === node) return acc + offset;
    if (probe.comparePoint(tn, 0) >= 0) return acc;
    acc += tn.length;
  }
  return acc;
}

function wrap(root, item) {
  let acc = 0;
  const jobs = [];
  for (const tn of textNodes(root)) {
    const start = acc, end = acc + tn.length;
    acc = end;
    if (end > item.start && start < item.end) jobs.push([tn, Math.max(0, item.start - start), Math.min(tn.length, item.end - start)]);
  }
  for (const [tn, a, b] of jobs) {
    if (b <= a) continue;
    let mid = a > 0 ? tn.splitText(a) : tn;
    if (b - a < mid.length) mid.splitText(b - a);
    if (!mid.data.trim()) continue;
    const mark = el('mark', { class: `hl hl--${item.color}`, 'data-hl': item.id, 'data-note': item.note ? '1' : null, title: item.note || null });
    mid.replaceWith(mark);
    mark.append(mid);
  }
}

function unwrapAll(root) {
  root.querySelectorAll('mark[data-hl]').forEach((m) => {
    const parent = m.parentNode;
    m.replaceWith(...m.childNodes);
    parent.normalize();
  });
}

export function initHighlighter(root, post) {
  const all = loadAll();
  const items = () => (all[post.slug] ??= { title: post.title, items: [] }).items;

  const apply = () => {
    unwrapAll(root);
    const rec = all[post.slug];
    if (rec) [...rec.items].sort((a, b) => a.start - b.start).forEach((it) => wrap(root, it));
  };
  const save = () => {
    const rec = all[post.slug];
    if (rec && !rec.items.length) delete all[post.slug];
    else if (rec) rec.title = post.title;
    saveAll(all);
    apply();
  };

  const bar = el('div', { class: 'hl-toolbar no-hl', role: 'toolbar', 'aria-label': 'subrayar', hidden: true });
  document.body.append(bar);
  let pending = null, editing = null;

  const hide = () => { bar.hidden = true; bar.classList.remove('hl-toolbar--note'); pending = editing = null; };
  const place = (rect) => {
    bar.hidden = false;
    bar.style.top = `${Math.max(window.scrollY + 6, rect.top + window.scrollY - bar.offsetHeight - 10)}px`;
    const half = Math.min(140, document.documentElement.clientWidth / 2);
    bar.style.left = `${Math.min(Math.max(rect.left + rect.width / 2, half), document.documentElement.clientWidth - half) + window.scrollX}px`;
  };
  const swatches = (current) => COLORS.map((c) => el('button', {
    type: 'button', class: `hl-swatch hl--${c}`, 'aria-label': c, 'aria-pressed': String(c === current),
    onclick: () => pick(c)
  }));

  function pick(color) {
    if (editing) { editing.color = color; save(); hide(); return; }
    if (!pending) return;
    items().push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ...pending, color, note: '' });
    getSelection().removeAllRanges();
    save();
    hide();
  }
  function showNote(item) {
    bar.replaceChildren();
    bar.classList.add('hl-toolbar--note');
    const area = el('textarea', { rows: '3', 'aria-label': t('hl_note') });
    area.value = item.note || '';
    bar.append(area, el('button', { type: 'button', class: 'btn btn--primary', onclick: () => { item.note = area.value.trim(); save(); hide(); } }, t('hl_save')));
    area.focus();
  }

  function onSelect() {
    const sel = getSelection();
    if (!sel.rangeCount || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    if (!root.contains(range.commonAncestorContainer)) return;
    const start = offsetOf(root, range.startContainer, range.startOffset);
    const end = offsetOf(root, range.endContainer, range.endOffset);
    const text = textNodes(root).map((n) => n.data).join('').slice(start, end).trim();
    if (end - start < 2 || !text) return;
    pending = { start, end, text };
    editing = null;
    bar.classList.remove('hl-toolbar--note');
    bar.replaceChildren(...swatches(), el('button', {
      type: 'button', class: 'btn', onclick: () => { pick('yellow'); const it = items().at(-1); editing = it; showNote(it); place(root.querySelector(`mark[data-hl="${it.id}"]`).getBoundingClientRect()); }
    }, t('hl_note')));
    place(range.getBoundingClientRect());
  }

  root.addEventListener('mouseup', () => setTimeout(onSelect, 10));
  root.addEventListener('keyup', (e) => { if (e.shiftKey) onSelect(); });
  root.addEventListener('touchend', () => setTimeout(onSelect, 350));
  root.addEventListener('click', (e) => {
    const mark = e.target.closest('mark[data-hl]');
    if (!mark || !getSelection().isCollapsed) return;
    editing = items().find((i) => i.id === mark.dataset.hl);
    if (!editing) return;
    const item = editing;
    bar.classList.remove('hl-toolbar--note');
    bar.replaceChildren(...swatches(item.color),
      el('button', { type: 'button', class: 'btn', onclick: () => { editing = item; showNote(item); } }, t('hl_note')),
      el('button', { type: 'button', class: 'btn', onclick: () => { all[post.slug].items = items().filter((i) => i !== item); save(); hide(); } }, t('hl_remove')));
    place(mark.getBoundingClientRect());
  });
  document.addEventListener('mousedown', (e) => { if (!bar.contains(e.target) && !e.target.closest('mark[data-hl]')) hide(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });

  apply();
  return {
    flash(id) {
      const marks = root.querySelectorAll(`mark[data-hl="${CSS.escape(id)}"]`);
      if (!marks.length) return;
      marks[0].scrollIntoView({ block: 'center' });
      marks.forEach((m) => m.classList.add('is-flash'));
      setTimeout(() => marks.forEach((m) => m.classList.remove('is-flash')), 2000);
    }
  };
}
