// theme.js — runs before paint so the saved theme never flashes.
// Pastel by default; high contrast when chosen or when the system asks for more contrast.
(function () {
  var saved = null;
  try { saved = localStorage.getItem('vl:theme'); } catch (e) { /* private mode */ }
  var theme = saved || (window.matchMedia && matchMedia('(prefers-contrast: more)').matches ? 'contrast' : 'pastel');
  if (theme === 'contrast') document.documentElement.setAttribute('data-theme', 'contrast');
})();
