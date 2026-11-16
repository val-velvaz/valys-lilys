// home.js — home page: sections (start here, tools, explanations, diary),
// search and section filters (from content/index.json).
import { initHeader } from './header.js';
import { loadCatalog, el, formatDate, readingTime, norm, SECTIONS, sectionName, postIcon, langTag } from './data.js';
import { t } from './i18n.js';

initHeader();

const content = document.getElementById('content');
const filters = document.getElementById('filters');
const search = document.getElementById('search');
const noResults = document.getElementById('no-results');

// Which section each category goes to.
// challenges sit with the tools: the 30-day challenge is something you *do* (a checklist), not read.
// projects sit with the explanations: they are long articles you read from start to end.
const GROUPS = {
  tools: ['games', 'challenges'],
  explanations: ['math', 'cs', 'projects'],
  diary: ['blog']
};
const HIDDEN = new Set(['about']); // linked from the avatar, not listed on the home page
const FEATURED_MAX = 2;

const params = new URLSearchParams(location.search);
let section = SECTIONS[params.get('section')] && !HIDDEN.has(params.get('section')) ? params.get('section') : '';
search.value = params.get('q') || '';

const postUrl = (post) => `post.html?p=${encodeURIComponent(post.slug)}`;

function card(post, extraClass = '') {
  const tone = SECTIONS[post.section] || 'lav';
  return el('a', { class: `card ${extraClass}`, href: postUrl(post) },
    el('div', { class: `card__bar tone--${tone}` }),
    el('div', { class: 'card__body' },
      el('div', { class: 'meta' },
        el('span', { class: 'section-label' }, sectionName(post.section), langTag(post)),
        postIcon(post, 'emoji')),
      el('h3', {}, post.title),
      el('p', { class: 'date' }, `${formatDate(post.date)} · ${readingTime(post.text)} ${t('min_read')}`),
      post.summary ? el('p', { class: 'card__summary' }, post.summary) : null,
      post.tags?.length ? el('ul', { class: 'tags' }, post.tags.map((tag) => el('li', { class: 'tag' }, `#${tag}`))) : null,
      el('span', { class: 'card__cta' }, t('read'))));
}

// Tools are apps, not articles: big icon, title and one line
function toolCard(post) {
  const tone = SECTIONS[post.section] || 'lav';
  return el('li', { class: 'tool-row__item' },
    el('a', { class: 'tool', href: postUrl(post) },
      el('span', { class: `tool__icon tone--${tone}` }, postIcon(post, 'tool__emoji')),
      el('span', { class: 'tool__text' },
        el('span', { class: 'tool__title' }, post.title, langTag(post)),
        post.summary ? el('span', { class: 'tool__summary' }, post.summary) : null)));
}

// Diary: compact list, date + title
function diaryItem(post) {
  return el('li', { class: 'diary__item' },
    el('time', { class: 'diary__date', datetime: post.date }, formatDate(post.date)),
    el('a', { class: 'diary__link', href: postUrl(post) }, post.title, langTag(post)));
}

function homeSection(id, items) {
  if (!items.length) return null;
  return el('section', { class: `home-section home-section--${id}`, 'aria-labelledby': `h-${id}` },
    el('div', { class: 'home-section__head' },
      el('h2', { id: `h-${id}` }, t(`home_${id}`)),
      el('p', { class: 'home-section__desc' }, t(`home_${id}_desc`))),
    items);
}

try {
  const { posts: all } = await loadCatalog();
  const posts = all.filter((p) => !HIDDEN.has(p.section));
  const present = Object.keys(SECTIONS).filter((s) => !HIDDEN.has(s) && posts.some((p) => p.section === s));
  const count = (s) => posts.filter((p) => p.section === s).length;

  const chip = (value, label) => el('button', {
    type: 'button', class: 'chip', 'data-section': value, 'aria-pressed': String(section === value),
    onclick: () => {
      section = section === value ? '' : value;
      filters.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.section === section)));
      render();
    }
  }, label);
  filters.replaceChildren(
    chip('', `${t('all')} (${posts.length})`),
    ...present.map((s) => chip(s, `${sectionName(s)} (${count(s)})`)));

  function sections() {
    const featured = posts.filter((p) => p.featured).slice(0, FEATURED_MAX);
    const rest = posts.filter((p) => !featured.includes(p));
    const of = (group) => rest.filter((p) => GROUPS[group].includes(p.section));
    return [
      homeSection('start', featured.length ? [el('div', { class: 'featured' }, featured.map((p) => card(p, 'card--featured')))] : []),
      homeSection('tools', of('tools').length ? [el('ul', { class: 'tool-row' }, of('tools').map(toolCard))] : []),
      homeSection('explanations', of('explanations').length ? [el('div', { class: 'grid' }, of('explanations').map((p) => card(p)))] : []),
      homeSection('diary', of('diary').length ? [el('ul', { class: 'diary' }, of('diary').map(diaryItem))] : [])
    ].filter(Boolean);
  }

  function results(terms) {
    // search looks everywhere (also the about page); the section filter narrows it
    return all.filter((p) => {
      if (section && p.section !== section) return false;
      if (!terms.length) return true;
      const hay = norm([p.title, p.summary, (p.tags || []).join(' '), sectionName(p.section), p.text].join(' '));
      return terms.every((term) => hay.includes(term));
    });
  }

  function render() {
    const terms = norm(search.value).split(/\s+/).filter(Boolean);
    if (!terms.length && !section) {
      content.replaceChildren(...sections());
      noResults.hidden = true;
    } else {
      // while searching or filtering, the sections collapse into one list of results
      const list = results(terms);
      content.replaceChildren(el('div', { class: 'grid grid--results' }, list.map((p) => card(p))));
      noResults.hidden = list.length > 0;
    }
    // keep the filter in the URL so each section has its own link
    const url = new URL(location.href);
    if (section) url.searchParams.set('section', section); else url.searchParams.delete('section');
    if (search.value.trim()) url.searchParams.set('q', search.value.trim()); else url.searchParams.delete('q');
    history.replaceState(null, '', url);
  }

  search.addEventListener('input', render);
  render();
} catch (err) {
  console.error(err);
  content.replaceChildren(el('p', { class: 'error' }, t('error_catalog')));
}
