// data.js — catalog access and helpers shared between pages.
import { locale, t, getLang } from './i18n.js';

export const CATALOG_URL = 'content/index.json';
export const GITHUB_USER = 'val-velvaz';

// Section → color tone of the card bar (colors live in tokens.css)
export const SECTIONS = {
  math: 'pink', cs: 'mint', games: 'lav', projects: 'sky', challenges: 'peach', blog: 'butter', about: 'peri'
};
export const sectionName = (s) => t(`sec_${s}`) === `sec_${s}` ? s : t(`sec_${s}`);

// Safe path to a post file, as written by build-index.mjs
const isSafeFile = (f) => typeof f === 'string' && /^content\/posts\/[a-z0-9-]+(\.[a-z]{2})?\.md$/.test(f);

let catalogPromise;
export function loadCatalog() {
  catalogPromise ??= fetch(CATALOG_URL, { cache: 'no-cache' }).then(async (res) => {
    if (!res.ok) throw new Error(`${CATALOG_URL} (${res.status})`);
    const data = await res.json();
    const lang = getLang();
    // One version per slug: the active language if it exists, otherwise the original.
    // "foreign" marks posts shown in another language (they get a small language tag).
    const bySlug = new Map();
    for (const p of data.posts) {
      if (p.draft || !isSafeFile(p.file)) continue;
      const current = bySlug.get(p.slug);
      if (!current || p.lang === lang || (current.lang !== lang && p.original)) bySlug.set(p.slug, p);
    }
    data.posts = [...bySlug.values()]
      .map((p) => ({ ...p, foreign: p.lang !== lang }))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return data;
  });
  return catalogPromise;
}

// Small "ES" / "EN" tag for posts shown in a language other than the interface
export const langTag = (post) => (post.foreign ? el('span', { class: 'lang-tag', title: post.lang }, post.lang.toUpperCase()) : null);

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

// Post icon: the image from the front matter if there is one, otherwise the emoji
export function postIcon(post, className) {
  if (post.image) return el('img', { class: `${className} ${className}--img`, src: post.image, alt: '', loading: 'lazy', decoding: 'async' });
  if (post.emoji) return el('span', { class: className, 'aria-hidden': 'true' }, post.emoji);
  return null;
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
