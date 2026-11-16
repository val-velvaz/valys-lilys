// langs.js — the ONLY place where the site's languages are listed.
// Used by the browser (i18n.js, data.js) and by scripts/build-index.mjs.
//
// Each language has a folder:  content/<code>/posts/*.md  and  content/<code>/temario.md
// To add one (e.g. French): add it here, create content/fr/, and add its texts in i18n.js.

export const LANGS = ['es', 'en', 'de'];

// Language of the main version of every post: when a post is missing in some language,
// the site falls back to these, in this order.
export const FALLBACK = ['es', 'en', 'de'];

export const DEFAULT_LANG = 'es';

// Name of each language in its own language (shown in "Leer en: …")
export const LANG_NAMES = { es: 'Español', en: 'English', de: 'Deutsch' };
