// data.js — catalog access and helpers shared between pages.
import { locale, t } from './i18n.js';

export const CATALOG_URL = 'content/index.json';
export const GITHUB_USER = 'val-velvaz';

// Section → color tone of the card bar (colors live in tokens.css)
export const SECTIONS = {
  math: 'pink', cs: 'mint', games: 'lav', projects: 'sky', challenges: 'peach', blog: 'butter', about: 'peri'
};
export const sectionName = (s) => t(`sec_${s}`) === `sec_${s}` ? s : t(`sec_${s}`);

let catalogPromise;
export function loadCatalog() {
  catalogPromise ??= fetch(CATALOG_URL, { cache: 'no-cache' }).then(async (res) => {
    if (!res.ok) throw new Error(`${CATALOG_URL} (${res.status})`);
    const data = await res.json();
    // Drafts are hidden; newest on top
    data.posts = data.posts.filter((p) => !p.draft).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return data;
  });
  return catalogPromise;
}

// Safe slug: lowercase letters, numbers and hyphens only (no odd paths)
export const isSafeSlug = (s) => typeof s === 'string' && /^[a-z0-9-]+$/.test(s);

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' });
}

export const readingTime = (text) => Math.max(1, Math.round(String(text || '').split(/\s+/).length / 200));

// Lowercase without accents, for search
export const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// localStorage that never throws (private mode, blocked storage…)
export const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(`vl:${key}`); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(`vl:${key}`, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }
};

// Builds elements without innerHTML (safe against JSON and Markdown content)
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

// Downloads a text file (used to export .md)
export function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown' }));
  const a = el('a', { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
