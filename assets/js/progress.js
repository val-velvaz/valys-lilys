// progress.js — what the visitor has learned, saved only in this browser (localStorage).
// Used by the status pills on the home cards, the syllabus dots and the Feynman checklist.
//
//   getStatus(slug)          → 'bloqueado' | 'disponible' | 'en-progreso' | 'dominado'
//   setStatus(slug, estado)
//   markOpened(slug)         → moves the topic to 'en-progreso' (unless it is already 'dominado')
//
// Every read/write is wrapped in try/catch: with blocked storage or an empty browser
// everything still works and simply starts from zero.

export const STATES = ['bloqueado', 'disponible', 'en-progreso', 'dominado'];
const KEY = 'vl:progress';
const NOT_TOPICS = new Set(['blog', 'about']);

function read() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { statuses: data && typeof data.statuses === 'object' && data.statuses ? data.statuses : {} };
  } catch (e) {
    return { statuses: {} };
  }
}

function write(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* storage full or blocked */ }
}

// A "topic" is any post you can learn and master (not the diary or the about page)
export const isTopic = (post) => !NOT_TOPICS.has(post.section);

// Unlock rules will live here (e.g. "requiere: recursion" in the front matter).
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
  if (data.statuses[slug] !== 'dominado') data.statuses[slug] = 'en-progreso';
  write(data);
}
