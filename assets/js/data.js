// data.js — catalog access and helpers shared between pages.
import { locale, t, getLang } from './i18n.js';
import { LANGS, FALLBACK } from './langs.js';

export const CATALOG_URL = 'content/index.json';
export const GITHUB_USER = 'val-velvaz';

// Section → color tone of the card bar (colors live in tokens.css)
export const SECTIONS = {
  math: 'pink', cs: 'mint', games: 'lav', projects: 'sky', challenges: 'peach', blog: 'butter', about: 'peri'
};
export const sectionName = (s) => t(`sec_${s}`) === `sec_${s}` ? s : t(`sec_${s}`);

// Safe path to a post file, as written by build-index.mjs: content/<lang>/posts/<slug>.md
const isSafeFile = (f) => typeof f === 'string' &&
  new RegExp(`^content/(${LANGS.join('|')})/posts/[a-z0-9-]+\\.md$`).test(f);

// Best version of a post for a language: that language, else the FALLBACK order (es → en → de)
export function pickVersion(versions, lang) {
  return versions.find((v) => v.lang === lang) ||
    FALLBACK.map((l) => versions.find((v) => v.lang === l)).find(Boolean) || versions[0];
}

let catalogPromise;
export function loadCatalog() {
  catalogPromise ??= fetch(CATALOG_URL, { cache: 'no-cache' }).then(async (res) => {
    if (!res.ok) throw new Error(`${CATALOG_URL} (${res.status})`);
    const data = await res.json();
    const lang = getLang();
    // every published version, grouped by slug (post.js uses it for "Leer en: ES · EN")
    data.versions = new Map();
    for (const p of data.posts) {
      if (p.draft || !isSafeFile(p.file)) continue;
      if (!data.versions.has(p.slug)) data.versions.set(p.slug, []);
      data.versions.get(p.slug).push(p);
    }
    // One version per slug, in the interface language when it exists.
    // "foreign" marks posts shown in another language (they get a small language tag).
    data.posts = [...data.versions.values()]
      .map((versions) => pickVersion(versions, lang))
      .map((p) => ({ ...p, foreign: p.lang !== lang }))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    // side menu in the active language, or the first one available in FALLBACK order
    const menus = data.syllabus || {};
    data.syllabus = menus[lang] || FALLBACK.map((l) => menus[l]).find(Boolean) || [];
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

// Reading time comes from the index (build-index.mjs). Short posts (< 3 min) don't show it.
export const MIN_MINUTES_SHOWN = 3;
export const minutesLabel = (post) => (post.minutes >= MIN_MINUTES_SHOWN ? `${post.minutes} ${t('min_read')}` : '');
// "date · 5 min read" (or just the date)
export const dateLine = (post) => [formatDate(post.date), minutesLabel(post)].filter(Boolean).join(' · ');

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
