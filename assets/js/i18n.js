// i18n.js — interface texts. Posts are written in Markdown, one folder per language (content/<lang>/posts).
import { LANGS, DEFAULT_LANG } from './langs.js';

const STRINGS = {
  es: {
    'meta.home_title': "valy's lilys · aprende a cómo dominar la tecnología",
    'meta.home_description': 'Página personal que sigue mi trayecto de aprendizaje en la tecnología',
    'meta.highlights_title': "Mis subrayados · valy's lilys",
    skip_home: 'Saltar a las entradas', skip_post: 'Saltar a la entrada',
    logo: "valy's lilys", lang_label: 'Idioma',
    theme_to_contrast: '◑ oscuro', theme_to_pastel: '◐ claro',
    nav_highlights: '✎ subrayados',
    hero_before: 'Aprende', hero_accent: 'Tecnología',
    tagline: 'Matemáticas y ciencias de la computación explicadas con palabras sencillas. Si no lo puedo explicar fácil, todavía no lo entiendo.',
    search_label: 'Buscar entradas', search_placeholder: 'busca por título, tema o palabra…',
    filters_label: 'Filtrar por sección', all: 'todo',
    no_results: 'Ninguna entrada coincide con tu búsqueda.', loading: 'Cargando…',
    error_catalog: 'No se pudo cargar el índice de entradas. Abre el sitio con un servidor (ver README).',
    min_read: 'min de lectura', back: '← Volver a todas las entradas',
    not_found: 'Esta entrada no existe (todavía).',
    footer: 'Hecho por y para la educación', footer_post: 'Aprendiendo a aprender',
    home_start: 'Empieza aquí', home_start_desc: 'Lo primero que te recomiendo leer y usar.',
    home_tools: 'Herramientas', home_tools_desc: 'Juegos y retos para practicar el método.',
    home_explanations: 'Explicaciones', home_explanations_desc: 'Temas de matemáticas y computación explicados con palabras sencillas.',
    home_diary: 'Diario', home_diary_desc: 'Lo que voy aprendiendo, semana a semana.',
    panel_title: 'Tu progreso', panel_continue: 'Continúa donde te quedaste',
    panel_continue_empty: 'Aún no has abierto ninguna entrada. Te sugiero empezar por:',
    panel_streak: 'Reto de 30 días', panel_streak_day: 'día seguido', panel_streak_days: 'días seguidos',
    panel_streak_go: 'Seguir con el reto →', panel_streak_start: 'Marca tu primer día →',
    panel_summary: 'Tus temas', 'st_dominado': 'dominados', 'st_en-progreso': 'en progreso', 'st_disponible': 'disponibles', 'st_bloqueado': 'bloqueados',
    panel_graph: 'Mapa de temas', panel_graph_soon: 'Cuando haya temas, aquí verás cómo se conectan.',
    graph_desc: 'Cada punto es un tema; las líneas van de un tema a los que se apoyan en él.', graph_caption: 'Las líneas van del tema que conviene leer antes a los que se apoyan en él. ○ aro = el último que abriste.',
    read_in: 'Leer en:', read_in_note: 'Esta entrada aún no está traducida a tu idioma.',
    syllabus_title: 'Temario', syllabus_ready: 'temas con entrada / temas en total', syllabus_soon: 'pronto',
    'status_dominado': 'dominado', 'status_en-progreso': 'en progreso', 'status_disponible': 'disponible', 'status_bloqueado': 'bloqueado',
    // change section
    sec_math: 'matemáticas', sec_cs: 'computación', sec_games: 'juegos', sec_projects: 'proyectos', sec_ia: 'ia',
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
    'meta.home_title': "valy's lilys · learn how to master technology",
    'meta.home_description': 'A personal site following my learning journey in technology.',
    'meta.highlights_title': "My highlights · valy's lilys",
    skip_home: 'Skip to the posts', skip_post: 'Skip to the post',
    logo: "valy's lilys", lang_label: 'Language',
    theme_to_contrast: '◑ dark', theme_to_pastel: '◐ light',
    nav_highlights: '✎ highlights',
    hero_before: 'Learn', hero_accent: 'Technology',
    tagline: "Math and computer science explained in simple words. If I can't explain it simply, I don't understand it yet.",
    search_label: 'Search posts', search_placeholder: 'search by title, topic or word…',
    filters_label: 'Filter by section', all: 'all',
    no_results: 'No post matches your search.', loading: 'Loading…',
    error_catalog: "Couldn't load the post index. Serve the site over http (see README).",
    min_read: 'min read', back: '← Back to all posts',
    not_found: "This post doesn't exist (yet).",
    footer: 'Made by and for education', footer_post: 'Learning to learn',
    home_start: 'Start here', home_start_desc: 'What I recommend reading and using first.',
    home_tools: 'Tools', home_tools_desc: 'Games and challenges to practise the method.',
    home_explanations: 'Explanations', home_explanations_desc: 'Math and computer science topics explained in simple words.',
    home_diary: 'Diary', home_diary_desc: "What I'm learning, week by week.",
    panel_title: 'Your progress', panel_continue: 'Continue where you left off',
    panel_continue_empty: "You haven't opened any post yet. I suggest starting with:",
    panel_streak: '30-day challenge', panel_streak_day: 'day in a row', panel_streak_days: 'days in a row',
    panel_streak_go: 'Keep going →', panel_streak_start: 'Tick your first day →',
    panel_summary: 'Your topics', 'st_dominado': 'mastered', 'st_en-progreso': 'in progress', 'st_disponible': 'available', 'st_bloqueado': 'locked',
    panel_graph: 'Topic map', panel_graph_soon: 'Once there are topics, you will see here how they connect.',
    graph_desc: 'Each dot is a topic; lines go from a topic to the ones that build on it.', graph_caption: 'Lines go from the topic to read first to the ones that build on it. ○ ring = the last one you opened.',
    syllabus_title: 'Courses', syllabus_ready: 'topics with a post / total topics', syllabus_soon: 'soon',
    read_in: 'Read in:', read_in_note: 'This post is not translated into your language yet.',
    'status_dominado': 'mastered', 'status_en-progreso': 'in progress', 'status_disponible': 'available', 'status_bloqueado': 'locked',
    sec_math: 'math', sec_cs: 'computer science', sec_games: 'games', sec_projects: 'projects', sec_ia: 'ia',
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
    'meta.home_title': "valy's lilys · lerne, Technologie zu meistern",
    'meta.home_description': 'Eine persönliche Seite über meinen Lernweg in der Technologie.',
    'meta.highlights_title': "Meine Markierungen · valy's lilys",
    skip_home: 'Zu den Beiträgen springen', skip_post: 'Zum Beitrag springen',
    logo: "valy's lilys", lang_label: 'Sprache',
    theme_to_contrast: '◑ dunkel', theme_to_pastel: '◐ hell',
    nav_highlights: '✎ Markierungen',
    hero_before: 'Lerne', hero_accent: 'Technologie',
    tagline: 'Mathe und Informatik in einfachen Worten erklärt. Wenn ich es nicht einfach erklären kann, verstehe ich es noch nicht.',
    search_label: 'Beiträge durchsuchen', search_placeholder: 'nach Titel, Thema oder Wort suchen…',
    filters_label: 'Nach Bereich filtern', all: 'alle',
    no_results: 'Kein Beitrag passt zu deiner Suche.', loading: 'Lädt…',
    error_catalog: 'Der Beitragsindex konnte nicht geladen werden (siehe README).',
    min_read: 'Min. Lesezeit', back: '← Zurück zu allen Beiträgen',
    not_found: 'Diesen Beitrag gibt es (noch) nicht.',
    footer: 'Von und für die Bildung gemacht', footer_post: 'Lernen lernen',
    home_start: 'Fang hier an', home_start_desc: 'Was ich dir zuerst zum Lesen und Ausprobieren empfehle.',
    home_tools: 'Werkzeuge', home_tools_desc: 'Spiele und Challenges, um die Methode zu üben.',
    home_explanations: 'Erklärungen', home_explanations_desc: 'Mathe- und Informatikthemen in einfachen Worten.',
    home_diary: 'Tagebuch', home_diary_desc: 'Was ich lerne, Woche für Woche.',
    panel_title: 'Dein Fortschritt', panel_continue: 'Mach weiter, wo du aufgehört hast',
    panel_continue_empty: 'Du hast noch keinen Beitrag geöffnet. Fang am besten hier an:',
    panel_streak: '30-Tage-Challenge', panel_streak_day: 'Tag am Stück', panel_streak_days: 'Tage am Stück',
    panel_streak_go: 'Weitermachen →', panel_streak_start: 'Hak deinen ersten Tag ab →',
    panel_summary: 'Deine Themen', 'st_dominado': 'gemeistert', 'st_en-progreso': 'in Arbeit', 'st_disponible': 'verfügbar', 'st_bloqueado': 'gesperrt',
    panel_graph: 'Themenkarte', panel_graph_soon: 'Sobald es Themen gibt, siehst du hier, wie sie zusammenhängen.',
    graph_desc: 'Jeder Punkt ist ein Thema; Linien führen zu den Themen, die darauf aufbauen.', graph_caption: 'Linien führen vom Thema, das man zuerst lesen sollte, zu denen, die darauf aufbauen. ○ Ring = zuletzt geöffnet.',
    syllabus_title: 'Kurse', syllabus_ready: 'Themen mit Beitrag / Themen insgesamt', syllabus_soon: 'bald',
    'status_dominado': 'gemeistert', 'status_en-progreso': 'in Arbeit', 'status_disponible': 'verfügbar', 'status_bloqueado': 'gesperrt',
    read_in: 'Lesen auf:', read_in_note: 'Dieser Beitrag ist noch nicht in deine Sprache übersetzt.',
    sec_math: 'Mathe', sec_cs: 'Informatik', sec_games: 'Spiele', sec_projects: 'Projekte', sec_ia: 'ki',
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
  return LANGS.includes(nav) ? nav : DEFAULT_LANG;
}

let lang = detect();

export const getLang = () => lang;
// a language listed in langs.js but without texts here falls back to the default language's texts
export const t = (key) => STRINGS[lang]?.[key] ?? STRINGS[DEFAULT_LANG][key] ?? key;
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
