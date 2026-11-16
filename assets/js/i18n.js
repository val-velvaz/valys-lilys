// i18n.js — interface texts in EN / ES / DE. Posts are written in Markdown (content/posts).
const LANGS = ['en', 'es', 'de'];

const STRINGS = {
  es: {
    'meta.home_title': "valy's lilys · aprende con el método Feynman",
    'meta.home_description': 'Blog para aprender y aplicar el método Feynman con juegos y entradas personales.',
    'meta.highlights_title': "Mis subrayados · valy's lilys",
    skip_home: 'Saltar a las entradas', skip_post: 'Saltar a la entrada',
    logo: "valy's lilys", lang_label: 'Idioma',
    theme_to_contrast: '◑ alto contraste', theme_to_pastel: '◐ modo pastel',
    nav_highlights: '✎ subrayados',
    hero_before: 'Aprende con el', hero_accent: 'método Feynman',
    tagline: 'Matemáticas y ciencias de la computación explicadas con palabras sencillas. Si no lo puedo explicar fácil, todavía no lo entiendo.',
    search_label: 'Buscar entradas', search_placeholder: '🔍 busca por título, tema o palabra…',
    filters_label: 'Filtrar por sección', all: 'todo',
    no_results: 'Ninguna entrada coincide con tu búsqueda.', loading: 'Cargando…',
    error_catalog: 'No se pudo cargar el índice de entradas. Abre el sitio con un servidor (ver README).',
    read: 'Leer →', min_read: 'min de lectura', back: '← Volver a todas las entradas',
    not_found: 'Esta entrada no existe (todavía).',
    footer: 'Hecho con ♡ y el método Feynman',
    sec_math: 'matemáticas', sec_cs: 'computación', sec_games: 'juegos', sec_projects: 'proyectos',
    sec_challenges: 'retos', sec_blog: 'blog', sec_about: 'sobre mí',
    feynman_title: '⚛ ¿Aplicaste el método Feynman?',
    step_1: 'Elegí un concepto', step_2: 'Lo expliqué como a un niño', step_3: 'Encontré mis lagunas', step_4: 'Lo simplifiqué con una analogía',
    hl_note: '✎ nota', hl_remove: '✕ quitar', hl_save: 'guardar',
    highlights_title: 'Mis', highlights_accent: 'subrayados',
    highlights_tagline: 'Todo lo que subrayaste en las entradas. Selecciona texto en cualquier entrada para añadir más.',
    highlights_empty: 'Aún no has subrayado nada.', export_md: '⬇ exportar .md', go: 'ir ↗',
    g_flashcards: 'flashcards', g_quiz: 'quiz', g_steps: 'ordena los pasos', g_jargon: 'explícaselo a un niño de 12 años', g_sheet: 'hoja feynman',
    g_prev: '‹', g_next: '›', g_flip: 'toca la tarjeta para darle la vuelta', g_reset: 'reiniciar',
    g_check: 'comprobar', g_shuffle: 'barajar', g_up: 'subir', g_down: 'bajar', g_perfect: '¡perfecto! ✿', g_almost: 'casi… revisa los marcados',
    g_analyze: 'analizar', g_write_first: 'escribe algo primero ♡', g_placeholder: 'Escribe tu explicación con palabras sencillas…',
    g_score: 'nivel Feynman', g_sentences: 'frases', g_words_per: 'palabras por frase', g_long: 'palabras muy largas', g_jargon_found: 'palabras de jerga', g_analogies: 'analogías o ejemplos',
    g_concept: '1 · concepto', g_simple: '2 · explicado como a un niño', g_gaps: '3 · mis lagunas', g_analogy: '4 · una analogía',
    g_export: '⬇ exportar como entrada .md', g_clear: 'borrar'
  },
  en: {
    'meta.home_title': "valy's lilys · learn with the Feynman method",
    'meta.home_description': 'A blog to learn and apply the Feynman method with games and personal posts.',
    'meta.highlights_title': "My highlights · valy's lilys",
    skip_home: 'Skip to the posts', skip_post: 'Skip to the post',
    logo: "valy's lilys", lang_label: 'Language',
    theme_to_contrast: '◑ high contrast', theme_to_pastel: '◐ pastel mode',
    nav_highlights: '✎ highlights',
    hero_before: 'Learn with the', hero_accent: 'Feynman method',
    tagline: "Math and computer science explained in simple words. If I can't explain it simply, I don't understand it yet.",
    search_label: 'Search posts', search_placeholder: '🔍 search by title, topic or word…',
    filters_label: 'Filter by section', all: 'all',
    no_results: 'No post matches your search.', loading: 'Loading…',
    error_catalog: "Couldn't load the post index. Serve the site over http (see README).",
    read: 'Read →', min_read: 'min read', back: '← Back to all posts',
    not_found: "This post doesn't exist (yet).",
    footer: 'Made with ♡ and the Feynman method',
    sec_math: 'math', sec_cs: 'computer science', sec_games: 'games', sec_projects: 'projects',
    sec_challenges: 'challenges', sec_blog: 'blog', sec_about: 'about me',
    feynman_title: '⚛ Did you apply the Feynman method?',
    step_1: 'I picked a concept', step_2: 'I explained it like to a kid', step_3: 'I found my gaps', step_4: 'I simplified it with an analogy',
    hl_note: '✎ note', hl_remove: '✕ remove', hl_save: 'save',
    highlights_title: 'My', highlights_accent: 'highlights',
    highlights_tagline: 'Everything you highlighted in the posts. Select text in any post to add more.',
    highlights_empty: "You haven't highlighted anything yet.", export_md: '⬇ export .md', go: 'go ↗',
    g_flashcards: 'flashcards', g_quiz: 'quiz', g_steps: 'put the steps in order', g_jargon: 'explain it to a 12-year-old', g_sheet: 'feynman sheet',
    g_prev: '‹', g_next: '›', g_flip: 'tap the card to flip it', g_reset: 'reset',
    g_check: 'check', g_shuffle: 'shuffle', g_up: 'move up', g_down: 'move down', g_perfect: 'perfect! ✿', g_almost: 'almost… check the marked ones',
    g_analyze: 'analyze', g_write_first: 'write something first ♡', g_placeholder: 'Write your explanation in simple words…',
    g_score: 'Feynman level', g_sentences: 'sentences', g_words_per: 'words per sentence', g_long: 'very long words', g_jargon_found: 'jargon words', g_analogies: 'analogies or examples',
    g_concept: '1 · concept', g_simple: '2 · explained like to a kid', g_gaps: '3 · my gaps', g_analogy: '4 · an analogy',
    g_export: '⬇ export as a .md post', g_clear: 'clear'
  },
  de: {
    'meta.home_title': "valy's lilys · lernen mit der Feynman-Methode",
    'meta.home_description': 'Ein Blog, um die Feynman-Methode mit Spielen und persönlichen Beiträgen zu lernen.',
    'meta.highlights_title': "Meine Markierungen · valy's lilys",
    skip_home: 'Zu den Beiträgen springen', skip_post: 'Zum Beitrag springen',
    logo: "valy's lilys", lang_label: 'Sprache',
    theme_to_contrast: '◑ hoher Kontrast', theme_to_pastel: '◐ Pastellmodus',
    nav_highlights: '✎ Markierungen',
    hero_before: 'Lernen mit der', hero_accent: 'Feynman-Methode',
    tagline: 'Mathe und Informatik in einfachen Worten erklärt. Wenn ich es nicht einfach erklären kann, verstehe ich es noch nicht.',
    search_label: 'Beiträge durchsuchen', search_placeholder: '🔍 nach Titel, Thema oder Wort suchen…',
    filters_label: 'Nach Bereich filtern', all: 'alle',
    no_results: 'Kein Beitrag passt zu deiner Suche.', loading: 'Lädt…',
    error_catalog: 'Der Beitragsindex konnte nicht geladen werden (siehe README).',
    read: 'Lesen →', min_read: 'Min. Lesezeit', back: '← Zurück zu allen Beiträgen',
    not_found: 'Diesen Beitrag gibt es (noch) nicht.',
    footer: 'Gemacht mit ♡ und der Feynman-Methode',
    sec_math: 'Mathe', sec_cs: 'Informatik', sec_games: 'Spiele', sec_projects: 'Projekte',
    sec_challenges: 'Challenges', sec_blog: 'Blog', sec_about: 'über mich',
    feynman_title: '⚛ Hast du die Feynman-Methode angewendet?',
    step_1: 'Ein Konzept gewählt', step_2: 'Wie einem Kind erklärt', step_3: 'Meine Lücken gefunden', step_4: 'Mit einer Analogie vereinfacht',
    hl_note: '✎ Notiz', hl_remove: '✕ entfernen', hl_save: 'speichern',
    highlights_title: 'Meine', highlights_accent: 'Markierungen',
    highlights_tagline: 'Alles, was du in den Beiträgen markiert hast. Markiere Text in einem Beitrag, um mehr hinzuzufügen.',
    highlights_empty: 'Du hast noch nichts markiert.', export_md: '⬇ .md exportieren', go: 'öffnen ↗',
    g_flashcards: 'Karteikarten', g_quiz: 'Quiz', g_steps: 'Schritte ordnen', g_jargon: 'erkläre es einem 12-jährigen Kind', g_sheet: 'Feynman-Blatt',
    g_prev: '‹', g_next: '›', g_flip: 'Karte antippen zum Umdrehen', g_reset: 'zurücksetzen',
    g_check: 'prüfen', g_shuffle: 'mischen', g_up: 'nach oben', g_down: 'nach unten', g_perfect: 'perfekt! ✿', g_almost: 'fast… prüfe die markierten',
    g_analyze: 'analysieren', g_write_first: 'schreib zuerst etwas ♡', g_placeholder: 'Schreib deine Erklärung in einfachen Worten…',
    g_score: 'Feynman-Level', g_sentences: 'Sätze', g_words_per: 'Wörter pro Satz', g_long: 'sehr lange Wörter', g_jargon_found: 'Fachjargon', g_analogies: 'Analogien oder Beispiele',
    g_concept: '1 · Konzept', g_simple: '2 · wie einem Kind erklärt', g_gaps: '3 · meine Lücken', g_analogy: '4 · eine Analogie',
    g_export: '⬇ als .md-Beitrag exportieren', g_clear: 'leeren'
  }
};

function detect() {
  try {
    const saved = localStorage.getItem('vl:lang');
    if (LANGS.includes(saved)) return saved;
  } catch (e) { /* private mode */ }
  const nav = (navigator.language || 'es').slice(0, 2).toLowerCase();
  return LANGS.includes(nav) ? nav : 'es';
}

let lang = detect();

export const getLang = () => lang;
export const t = (key) => STRINGS[lang][key] ?? STRINGS.es[key] ?? key;
export const locale = () => ({ en: 'en-GB', es: 'es-ES', de: 'de-DE' })[lang];

// Fills [data-i18n] (text), [data-i18n-attr="attr:key;attr:key"] and <body data-i18n-title>
export function applyI18n(root = document) {
  document.documentElement.lang = lang;
  root.querySelectorAll('[data-i18n]').forEach((n) => { n.textContent = t(n.dataset.i18n); });
  root.querySelectorAll('[data-i18n-attr]').forEach((n) => {
    n.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (attr && key) n.setAttribute(attr, t(key));
    });
  });
  const titleKey = document.body.dataset.i18nTitle;
  if (titleKey) document.title = t(titleKey);
}

// EN / ES / DE buttons; changing language reloads so every text is redrawn
export function setupLangSwitch() {
  const box = document.getElementById('lang-switch');
  if (!box) return;
  for (const code of LANGS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'lang-switch__btn';
    b.textContent = code.toUpperCase();
    b.setAttribute('aria-pressed', String(code === lang));
    b.addEventListener('click', () => {
      if (code === lang) return;
      try { localStorage.setItem('vl:lang', code); } catch (e) { /* private mode */ }
      location.reload();
    });
    box.append(b);
  }
}
