// home.js — home page: syllabus side menu, sections (start here, tools, explanations, diary),
// search and section filters (from content/index.json).
import { initHeader } from './header.js';
import { loadCatalog, el, formatDate, dateLine, norm, SECTIONS, sectionName, postIcon, langTag } from './data.js';
import { renderSyllabus } from './syllabus.js';
import { t } from './i18n.js';
import { getLastOpened, getStreak, getSummary, CHALLENGE } from './progress.js';

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

// The whole card is clickable, but there is only ONE link: the title.
// CSS stretches that link over the card (.card__link::after), so screen readers
// announce just the title instead of reading the whole card as a link.
function card(post, extraClass = '') {
  const tone = SECTIONS[post.section] || 'lav';
  const date = dateLine(post);
  return el('article', { class: `card ${extraClass}` },
    el('div', { class: `card__bar tone--${tone}` }),
    el('div', { class: 'card__body' },
      el('div', { class: 'meta' },
        el('span', { class: 'section-label' }, sectionName(post.section), langTag(post)),
        postIcon(post, 'emoji')),
      el('h3', {}, el('a', { class: 'card__link', href: postUrl(post) }, post.title)),
      date ? el('p', { class: 'date' }, date) : null,
      post.summary ? el('p', { class: 'card__summary' }, post.summary) : null,
      post.tags?.length ? el('ul', { class: 'tags' }, post.tags.map((tag) => el('li', { class: 'tag' }, `#${tag}`))) : null));
}

// Tools are apps, not articles: big icon, title and one line (same single-link pattern)
function toolCard(post) {
  const tone = SECTIONS[post.section] || 'lav';
  return el('li', { class: 'tool-row__item' },
    el('article', { class: 'tool' },
      el('span', { class: `tool__icon tone--${tone}` }, postIcon(post, 'tool__emoji')),
      el('span', { class: 'tool__text' },
        el('h3', { class: 'tool__title' }, el('a', { class: 'card__link', href: postUrl(post) }, post.title), langTag(post)),
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

/* ---------- Progress panel (everything comes from progress.js / localStorage) ---------- */
const panelBody = document.getElementById('panel-body');

function panelBlock(title, ...children) {
  return el('section', { class: 'panel__block' }, el('h3', { class: 'panel__label' }, title), ...children);
}

function renderPanel(all) {
  const bySlug = new Map(all.map((p) => [p.slug, p]));

  // 1. Continue where you left off (or a suggestion the first time)
  const last = getLastOpened();
  const lastPost = last && bySlug.get(last.slug);
  const suggestion = all.find((p) => p.featured) || all[0];
  const continueBlock = lastPost
    ? panelBlock(t('panel_continue'),
      el('a', { class: 'panel__continue', href: postUrl(lastPost) },
        el('span', { class: 'panel__continue-icon', 'aria-hidden': 'true' }, postIcon(lastPost, 'tool__emoji')),
        el('span', {}, el('span', { class: 'panel__continue-title' }, lastPost.title),
          el('span', { class: 'panel__muted' }, sectionName(lastPost.section)))))
    : panelBlock(t('panel_continue'),
      el('p', { class: 'panel__muted' }, t('panel_continue_empty')),
      suggestion ? el('a', { class: 'panel__link', href: postUrl(suggestion) }, `→ ${suggestion.title}`) : null);

  // 2. 30-day challenge streak
  const streak = getStreak();
  const challenge = bySlug.get(CHALLENGE);
  const streakBlock = panelBlock(t('panel_streak'),
    el('p', { class: 'panel__streak' },
      el('span', { class: 'panel__streak-number' }, `🔥 ${streak}`),
      el('span', { class: 'panel__muted' }, t(streak === 1 ? 'panel_streak_day' : 'panel_streak_days'))),
    challenge ? el('a', { class: 'panel__link', href: postUrl(challenge) }, t(streak ? 'panel_streak_go' : 'panel_streak_start')) : null);

  // 3. Summary of topics by state
  const summary = getSummary(all);
  const total = Object.values(summary).reduce((a, b) => a + b, 0) || 1;
  const states = ['dominado', 'en-progreso', 'disponible', 'bloqueado'].filter((s) => s !== 'bloqueado' || summary[s]);
  const summaryBlock = panelBlock(t('panel_summary'),
    el('div', { class: 'panel__bar', role: 'img', 'aria-label': states.map((s) => `${t(`st_${s}`)}: ${summary[s]}`).join(', ') },
      states.map((s) => {
        const seg = el('span', { class: `panel__seg st--${s}` });
        seg.style.width = `${(summary[s] / total) * 100}%`;
        return seg;
      })),
    el('ul', { class: 'panel__states' }, states.map((s) => el('li', {},
      el('span', { class: `panel__dot st--${s}`, 'aria-hidden': 'true' }),
      el('span', {}, t(`st_${s}`)),
      el('strong', {}, String(summary[s]))))));

  // 4. Reserved space for the future topic graph (only the container for now)
  const graphBlock = panelBlock(t('panel_graph'),
    el('div', { class: 'panel__graph', id: 'topic-graph', 'data-graph': 'pending' },
      el('span', { class: 'panel__muted' }, t('panel_graph_soon'))));

  panelBody.replaceChildren(continueBlock, streakBlock, summaryBlock, graphBlock);
}

try {
  const { posts: all, syllabus } = await loadCatalog();
  renderPanel(all);
  const syllabusNav = document.getElementById('syllabus');
  renderSyllabus(syllabusNav, syllabus, all);
  // coming back with the browser's back button shows the page from cache: refresh progress
  window.addEventListener('pageshow', (e) => { if (e.persisted) { renderPanel(all); renderSyllabus(syllabusNav, syllabus, all); } });
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
