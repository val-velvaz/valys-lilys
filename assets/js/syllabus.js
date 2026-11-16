// syllabus.js — the side menu built from content/temario.md: area → unit → topic.
// Used by the home page and by every post page.
//
//   renderSyllabus(nav, areas, posts, { current })
//     nav      the <nav class="syllabus"> element (it needs a #syllabus-body inside)
//     areas    catalog.syllabus (already in the active language, see data.js)
//     posts    catalog.posts, to know which topics have a published post
//     current  slug of the post being read: its area opens and the topic is marked
import { el, store } from './data.js';
import { t } from './i18n.js';
import { getStatus } from './progress.js';

const AREA_TONES = ['pink', 'mint', 'sky', 'lav', 'peach', 'butter'];
const OPEN_KEY = 'syllabus-open';

export function renderSyllabus(nav, areas, posts, { current = null } = {}) {
  const body = nav.querySelector('#syllabus-body');
  const known = new Set(posts.map((p) => p.slug));
  // which areas are open is remembered; the first time only the first one is open
  // (on phones all start closed so the menu doesn't push the content down)
  const firstTime = matchMedia('(min-width: 1000px)').matches ? [0] : [];
  const open = new Set(store.get(OPEN_KEY, firstTime));

  body.replaceChildren(...areas.map((area, i) => {
    const topics = area.units.flatMap((u) => u.topics);
    const ready = topics.filter((tp) => tp.slug && known.has(tp.slug)).length;
    const hasCurrent = current && topics.some((tp) => tp.slug === current);
    const details = el('details', { class: 'syllabus__area', open: open.has(i) || hasCurrent },
      el('summary', { class: 'syllabus__summary' },
        el('span', { class: `syllabus__icon tone--${AREA_TONES[i % AREA_TONES.length]}`, 'aria-hidden': 'true' }, area.icon || area.title[0]),
        el('span', { class: 'syllabus__area-title' }, area.title),
        el('span', { class: 'syllabus__count', title: t('syllabus_ready') }, `${ready}/${topics.length}`)),
      area.units.map((unit) => el('div', { class: 'syllabus__unit' },
        el('h3', { class: 'syllabus__unit-title' }, unit.title),
        el('ul', { class: 'syllabus__topics' }, unit.topics.map((topic) => topicItem(topic, known, current))))));
    details.addEventListener('toggle', () => {
      if (details.open) open.add(i); else open.delete(i);
      store.set(OPEN_KEY, [...open]);
    });
    return details;
  }));
  nav.hidden = !areas.length;
}

function topicItem(topic, known, current) {
  if (!topic.slug || !known.has(topic.slug)) {
    return el('li', { class: 'syllabus__topic is-soon' },
      el('span', { class: 'syllabus__dot', 'aria-hidden': 'true' }),
      el('span', {}, topic.title),
      el('span', { class: 'syllabus__soon' }, t('syllabus_soon')));
  }
  const status = getStatus(topic.slug);
  const here = topic.slug === current;
  return el('li', { class: `syllabus__topic${here ? ' is-current' : ''}` },
    el('a', { href: `post.html?p=${encodeURIComponent(topic.slug)}`, 'aria-current': here ? 'page' : null },
      el('span', { class: `syllabus__dot st--${status}`, title: t(`status_${status}`), 'aria-hidden': 'true' }),
      el('span', {}, topic.title),
      el('span', { class: 'visually-hidden' }, ` (${t(`status_${status}`)})`)));
}
