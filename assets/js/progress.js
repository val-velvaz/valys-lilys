// progress.js — what the visitor has learned, saved only in this browser (localStorage).
//
//   getStatus(slug)          → 'bloqueado' | 'disponible' | 'en-progreso' | 'dominado'
//   setStatus(slug, estado)
//   markOpened(slug)         → remembers the last post and moves it to 'en-progreso'
//   getLastOpened()          → { slug, at } or null
//   getStreak()              → consecutive days ticked in the 30-day challenge
//   getSummary(posts)        → how many topics are in each state
//
// Every read/write is wrapped in try/catch: with blocked storage or an empty browser
// everything still works and simply starts from zero.

export const STATES = ['bloqueado', 'disponible', 'en-progreso', 'dominado'];
const KEY = 'vl:progress';
const CHALLENGE_SLUG = 'reto-30-dias';
const NOT_TOPICS = new Set(['blog', 'about']);

function read() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || '{}');
    return {
      statuses: data && typeof data.statuses === 'object' && data.statuses ? data.statuses : {},
      last: data && data.last && typeof data.last.slug === 'string' ? data.last : null
    };
  } catch (e) {
    return { statuses: {}, last: null };
  }
}

function write(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* storage full or blocked */ }
}

// A "topic" is any post you can learn and master (not the diary or the about page)
export const isTopic = (post) => !NOT_TOPICS.has(post.section);

// Unlock rules will live here (e.g. "requires: recursion" in the front matter).
// For now everything is unlocked.
export function isUnlocked(post) {
  return Boolean(post);
}

export function getStatus(slug, post) {
  if (post && !isUnlocked(post)) return 'bloqueado';
  const saved = read().statuses[slug];
  return STATES.includes(saved) && saved !== 'bloqueado' ? saved : 'disponible';
}

export function setStatus(slug, estado) {
  if (!STATES.includes(estado)) return;
  const data = read();
  if (estado === 'disponible') delete data.statuses[slug];
  else data.statuses[slug] = estado;
  write(data);
}

export function markOpened(slug) {
  const data = read();
  data.last = { slug, at: new Date().toISOString() };
  if (data.statuses[slug] !== 'dominado') data.statuses[slug] = 'en-progreso';
  write(data);
}

export function getLastOpened() {
  return read().last;
}

// Days in a row ticked in the 30-day challenge, from day 1.
// The checkboxes are the task list of that post (saved by post.js as "vl:tasks:<slug>").
export function getStreak() {
  try {
    const tasks = JSON.parse(localStorage.getItem(`vl:tasks:${CHALLENGE_SLUG}`) || '{}') || {};
    let streak = 0;
    while (tasks[streak] === true) streak++;
    return streak;
  } catch (e) {
    return 0;
  }
}
export const CHALLENGE = CHALLENGE_SLUG;

export function getSummary(posts) {
  const summary = { bloqueado: 0, disponible: 0, 'en-progreso': 0, dominado: 0 };
  for (const p of posts) if (isTopic(p)) summary[getStatus(p.slug, p)]++;
  return summary;
}
