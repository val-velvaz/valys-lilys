// header.js — shared by every page: texts, language, theme button and GitHub avatar.
import { applyI18n, setupLangSwitch } from './i18n.js';
import { GITHUB_USER } from './data.js';

export function initHeader() {
  applyI18n();
  setupLangSwitch();
  setupThemeToggle();
  setupAvatar();
}

function setupThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const root = document.documentElement;
  const sync = () => btn.setAttribute('aria-pressed', String(root.dataset.theme === 'contrast'));
  sync();
  btn.addEventListener('click', () => {
    const next = root.dataset.theme === 'contrast' ? 'pastel' : 'contrast';
    if (next === 'contrast') root.dataset.theme = 'contrast'; else delete root.dataset.theme;
    try { localStorage.setItem('vl:theme', next); } catch (e) { /* private mode */ }
    sync();
  });
}

// Profile photo = GitHub avatar. It is asked for again every few minutes and when the
// tab comes back, so changing the photo on GitHub updates the site by itself.
const REFRESH_MS = 5 * 60 * 1000;
function setupAvatar() {
  const img = document.getElementById('avatar-img');
  const live = document.getElementById('avatar-live');
  if (!img) return;
  const load = () => {
    // "v" changes every interval to skip the browser cache
    const url = `https://github.com/${encodeURIComponent(GITHUB_USER)}.png?size=240&v=${Math.floor(Date.now() / REFRESH_MS)}`;
    const probe = new Image();
    probe.onload = () => {
      if (img.src !== probe.src) img.src = probe.src;
      if (live) live.hidden = false;
    };
    probe.onerror = () => { if (live) live.hidden = true; };
    probe.src = url;
  };
  load();
  setInterval(load, REFRESH_MS);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) load(); });
}
