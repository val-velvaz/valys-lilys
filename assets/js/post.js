// post.js — renders one Markdown post (post.html?p=slug) with games, highlighter and Feynman checklist.
import { initHeader } from './header.js';
import { loadCatalog, el, formatDate, readingTime, isSafeSlug, sectionName, norm, store, postIcon } from './data.js';
import { t } from './i18n.js';
import { renderMarkdown, parseFrontMatter } from './markdown.js';
import { renderGame } from './games.js';
import { initHighlighter } from './highlight.js';

initHeader();

const main = document.getElementById('post');
const slug = new URLSearchParams(location.search).get('p');
const back = el('a', { class: 'back', href: './' }, t('back'));

async function load() {
  if (!isSafeSlug(slug)) throw new Error('not-found');
  const { posts } = await loadCatalog();
  const meta = posts.find((p) => p.slug === slug);
  if (!meta) throw new Error('not-found');
  const res = await fetch(`content/posts/${slug}.md`, { cache: 'no-cache' });
  if (!res.ok) throw new Error('not-found');
  const { data, body } = parseFrontMatter(await res.text());
  // image comes from the index, where build-index.mjs already checked it
  return { ...meta, ...data, image: meta.image, body };
}

try {
  const post = await load();
  document.title = `${post.title} · valy's lilys`;
  const tags = Array.isArray(post.tags) ? post.tags : [];

  const ctx = { slug };
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
  const update = () => { bar.style.width = `${(done.size / 4) * 100}%`; };
  const steps = [1, 2, 3, 4].map((n) => {
    const box = el('input', { type: 'checkbox' });
    box.checked = done.has(n);
    box.addEventListener('change', () => { box.checked ? done.add(n) : done.delete(n); store.set(stepKey, [...done]); update(); });
    return el('li', {}, el('label', {}, box, t(`step_${n}`)));
  });
  update();

  main.replaceChildren(
    back,
    el('article', { class: 'article' },
      el('header', { class: 'article__head' },
        el('span', { class: 'section-label' }, sectionName(post.section)),
        el('h1', { class: 'article__title' }, postIcon(post, 'title-icon'), post.title),
        el('p', { class: 'date' }, `${formatDate(post.date)} · ${readingTime(post.body)} ${t('min_read')}`),
        tags.length ? el('ul', { class: 'tags' }, tags.map((tag) => el('li', { class: 'tag' }, `#${tag}`))) : null),
      content),
    el('section', { class: 'feynman', 'aria-labelledby': 'feynman-title' },
      el('h2', { id: 'feynman-title' }, t('feynman_title')),
      el('ul', { class: 'feynman__steps' }, steps),
      el('div', { class: 'progress' }, bar)));

  const hl = initHighlighter(content, { slug, title: post.title });
  const m = /#hl=([\w-]+)/.exec(location.hash);
  if (m) hl.flash(m[1]);
  else if (location.hash.length > 1) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
} catch (err) {
  if (err.message !== 'not-found') console.error(err);
  main.replaceChildren(back, el('p', { class: 'error' }, err.message === 'not-found' ? t('not_found') : t('error_catalog')));
}
