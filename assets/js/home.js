// home.js — search, section filters and the card grid (from content/index.json).
import { initHeader } from './header.js';
import { loadCatalog, el, formatDate, readingTime, norm, SECTIONS, sectionName, postIcon } from './data.js';
import { t } from './i18n.js';

initHeader();

const grid = document.getElementById('grid');
const filters = document.getElementById('filters');
const search = document.getElementById('search');
const noResults = document.getElementById('no-results');

const params = new URLSearchParams(location.search);
let section = SECTIONS[params.get('section')] ? params.get('section') : '';
search.value = params.get('q') || '';

function card(post) {
  const tone = SECTIONS[post.section] || 'lav';
  return el('a', { class: 'card', href: `post.html?p=${encodeURIComponent(post.slug)}` },
    el('div', { class: `card__bar tone--${tone}` }),
    el('div', { class: 'card__body' },
      el('div', { class: 'meta' },
        el('span', { class: 'section-label' }, sectionName(post.section)),
        postIcon(post, 'emoji')),
      el('h3', {}, post.title),
      el('p', { class: 'date' }, `${formatDate(post.date)} · ${readingTime(post.text)} ${t('min_read')}`),
      post.summary ? el('p', { class: 'card__summary' }, post.summary) : null,
      post.tags?.length ? el('ul', { class: 'tags' }, post.tags.map((tag) => el('li', { class: 'tag' }, `#${tag}`))) : null,
      el('span', { class: 'card__cta' }, t('read'))));
}

try {
  const { posts } = await loadCatalog();
  const present = Object.keys(SECTIONS).filter((s) => posts.some((p) => p.section === s));

  const chip = (value, label) => el('button', {
    type: 'button', class: 'chip', 'aria-pressed': String(section === value),
    onclick: () => { section = value; filters.querySelectorAll('.chip').forEach((c, i) => c.setAttribute('aria-pressed', String((i === 0 ? '' : present[i - 1]) === section))); render(); }
  }, label);
  filters.replaceChildren(chip('', t('all')), ...present.map((s) => chip(s, sectionName(s))));

  function render() {
    const terms = norm(search.value).split(/\s+/).filter(Boolean);
    const list = posts.filter((p) => {
      if (section && p.section !== section) return false;
      const hay = norm([p.title, p.summary, (p.tags || []).join(' '), sectionName(p.section), p.text].join(' '));
      return terms.every((term) => hay.includes(term));
    });
    grid.replaceChildren(...list.map(card));
    noResults.hidden = list.length > 0;
    // keep the filter in the URL so each section has its own link
    const url = new URL(location.href);
    section ? url.searchParams.set('section', section) : url.searchParams.delete('section');
    search.value.trim() ? url.searchParams.set('q', search.value.trim()) : url.searchParams.delete('q');
    history.replaceState(null, '', url);
  }

  search.addEventListener('input', render);
  render();
} catch (err) {
  console.error(err);
  grid.replaceChildren(el('p', { class: 'error' }, t('error_catalog')));
}
