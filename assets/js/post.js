// post.js — renders one Markdown post (post.html?p=slug) with games, highlighter and Feynman checklist.
import { initHeader } from './header.js';
import { loadCatalog, el, dateLine, isSafeSlug, sectionName, norm, store, postIcon, langTag, pickVersion } from './data.js';
import { LANGS, LANG_NAMES, DEFAULT_LANG } from './langs.js';
import { markOpened, getStatus, setStatus, isTopic } from './progress.js';
import { t, getLang } from './i18n.js';
import { renderMarkdown, parseFrontMatter } from './markdown.js';
import { renderGame } from './games.js';
import { initHighlighter } from './highlight.js';
import { renderSyllabus } from './syllabus.js';

initHeader();

// Side menu with the syllabus; the area of the post being read opens and its topic is marked
const syllabusNav = document.getElementById('syllabus');
async function showSyllabus(current) {
  try {
    const { syllabus, posts } = await loadCatalog();
    renderSyllabus(syllabusNav, syllabus, posts, { current });
  } catch (e) { /* no catalog: the menu simply stays hidden */ }
}

const main = document.getElementById('post');
const params = new URLSearchParams(location.search);
const slug = params.get('p');
// manual language: post.html?p=recursion&lang=en opens the English version,
// whatever the interface language is
const wantedLang = LANGS.includes(params.get('lang')) ? params.get('lang') : null;
const back = el('a', { class: 'back', href: './' }, t('back'));

async function load() {
  if (!isSafeSlug(slug)) throw new Error('not-found');
  const { versions } = await loadCatalog();
  const all = versions.get(slug);
  if (!all) throw new Error('not-found');
  // the language asked for in the URL, else the interface language, else the fallback order
  const chosen = pickVersion(all, wantedLang || getLang());
  const res = await fetch(chosen.file, { cache: 'no-cache' });
  if (!res.ok) throw new Error('not-found');
  const { data, body } = parseFrontMatter(await res.text());
  // image, section and language come from the index, where build-index.mjs already checked them
  return {
    ...chosen, ...data, image: chosen.image, section: chosen.section, lang: chosen.lang,
    foreign: chosen.lang !== getLang(), versions: all, body
  };
}

// "Leer en: ES · EN · DE" — one link per language this post exists in
function languageLinks(post) {
  if (post.versions.length < 2) {
    return post.foreign ? el('p', { class: 'read-in read-in--note' }, t('read_in_note')) : null;
  }
  const ordered = LANGS.map((l) => post.versions.find((v) => v.lang === l)).filter(Boolean);
  return el('nav', { class: 'read-in', 'aria-label': t('read_in') },
    el('span', { class: 'read-in__label' }, t('read_in')),
    ordered.map((v) => el('a', {
      class: 'read-in__lang',
      href: `post.html?p=${encodeURIComponent(slug)}&lang=${v.lang}`,
      hreflang: v.lang, lang: v.lang, title: LANG_NAMES[v.lang] || v.lang,
      'aria-current': v.lang === post.lang ? 'true' : null
    }, v.lang.toUpperCase())));
}

try {
  const post = await load();
  document.title = `${post.title} · valy's lilys`;
  const tags = Array.isArray(post.tags) ? post.tags : [];

  const ctx = { slug, lang: post.lang };
  const content = el('div', { class: 'article__body', id: 'body' });
  // if the post starts with "# <same title>", skip it (the title is already in the header)
  const body = post.body.replace(/^\s*#\s+(.+)\n/, (line, title) => (title.trim() === String(post.title).trim() ? '' : line));
  content.append(renderMarkdown(body, { fence: (lang, code) => renderGame(lang, code, ctx) }));

  // ids on headings so they can be linked
  const used = new Set();
  content.querySelectorAll('h2, h3, h4, h5, h6').forEach((h) => {
    let id = norm(h.textContent).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
    while (used.has(id)) id += '-';
    used.add(id);
    h.id = id;
  });

  // task lists remember their state
  const taskKey = `tasks:${slug}`;
  const tasks = store.get(taskKey, {});
  content.querySelectorAll('li.task input').forEach((box, i) => {
    if (i in tasks) box.checked = tasks[i];
    box.addEventListener('change', () => { tasks[i] = box.checked; store.set(taskKey, tasks); });
  });

  // Feynman checklist (4 steps), saved per post
  const stepKey = `feynman:${slug}`;
  const done = new Set(store.get(stepKey, []));
  const bar = el('div', { class: 'progress__bar' });
  // the 4 steps ticked = topic mastered ("dominado"); unticking one goes back to "en-progreso"
  const update = () => {
    bar.style.width = `${(done.size / 4) * 100}%`;
    if (isTopic(post)) {
      if (done.size === 4) setStatus(slug, 'dominado');
      else if (getStatus(slug) === 'dominado') setStatus(slug, 'en-progreso');
    }
    showSyllabus(slug); // redraw so the dot of this topic shows its new state
  };
  const steps = [1, 2, 3, 4].map((n) => {
    const box = el('input', { type: 'checkbox' });
    box.checked = done.has(n);
    box.addEventListener('change', () => { box.checked ? done.add(n) : done.delete(n); store.set(stepKey, [...done]); update(); });
    return el('li', {}, el('label', {}, box, t(`step_${n}`)));
  });
  markOpened(slug);
  update();

  main.replaceChildren(
    back,
    el('article', { class: 'article' },
      el('header', { class: 'article__head' },
        el('span', { class: 'section-label' }, sectionName(post.section), ' ', langTag(post)),
        el('h1', { class: 'article__title' }, postIcon(post, 'title-icon'), post.title),
        el('p', { class: 'date' }, dateLine(post)),
        languageLinks(post),
        tags.length ? el('ul', { class: 'tags' }, tags.map((tag) => el('li', { class: 'tag' }, `#${tag}`))) : null),
      content),
    el('section', { class: 'feynman', 'aria-labelledby': 'feynman-title' },
      el('h2', { id: 'feynman-title' }, t('feynman_title')),
      el('ul', { class: 'feynman__steps' }, steps),
      el('div', { class: 'progress' }, bar)));

  // each language version keeps its own highlights (the text positions are different)
  // (the default language keeps the plain slug, so highlights saved before still work)
  const hl = initHighlighter(content, { slug: post.lang === DEFAULT_LANG ? slug : `${slug}.${post.lang}`, title: post.title });
  const m = /#hl=([\w-]+)/.exec(location.hash);
  if (m) hl.flash(m[1]);
  else if (location.hash.length > 1) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
} catch (err) {
  if (err.message !== 'not-found') console.error(err);
  main.replaceChildren(back, el('p', { class: 'error' }, err.message === 'not-found' ? t('not_found') : t('error_catalog')));
  showSyllabus(null);
}
