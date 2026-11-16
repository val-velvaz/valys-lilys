#!/usr/bin/env node
/* Builds content/index.json from the Markdown posts.
   Usage:  node scripts/build-index.mjs
   - Reads content/posts/*.md (files starting with "_" are ignored, e.g. the template)
   - Takes the front matter (title, date, section, tags, summary, emoji, image, destacado, lang, draft)
   - Stores plain text too, so the home search finds words inside the posts.
   - Computes fields so the browser doesn't have to:
       lang     "recursion.en.md" is the English version of "recursion.md" (same slug);
                a file without suffix is the original, Spanish unless it says "lang: en|de"
       featured "destacado: true" in the front matter
       minutes  reading time of the whole post
       langs    every language available for that slug
   - Reads the side-menu syllabus from content/temario.md (+ temario.en.md / temario.de.md) */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const POSTS = join(ROOT, 'content', 'posts');
const SECTIONS = ['math', 'cs', 'games', 'projects', 'challenges', 'blog', 'about'];
const LANGS = ['es', 'en', 'de'];
const DEFAULT_LANG = 'es';
const WORDS_PER_MINUTE = 200;

function parseFrontMatter(src) {
  const m = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/.exec(src);
  if (!m) return { data: {}, body: src };
  const data = {};
  let lastKey = null;
  const clean = (s) => s.trim().replace(/^["']|["']$/g, '');
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const item = /^\s+-\s+(.*)$/.exec(line);
    if (item && lastKey) { (data[lastKey] = Array.isArray(data[lastKey]) ? data[lastKey] : []).push(clean(item[1])); continue; }
    const kv = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
    if (!kv) continue;
    lastKey = kv[1];
    let v = kv[2].trim();
    if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map(clean).filter(Boolean);
    else if (v === '') v = [];
    else if (v === 'true' || v === 'false') v = v === 'true';
    else v = clean(v);
    data[lastKey] = v;
  }
  return { data, body: src.slice(m[0].length) };
}

function plainText(md) {
  return md
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/```[\w-]*\n([\s\S]*?)```/g, (_, code) => ` ${code.replace(/^[?+\->#]\s*/gm, '').replace(/::/g, ' ')} `)
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/==(\{[a-z]+\})?/g, '')
    .replace(/\[!(NOTE|TIP|FEYNMAN|WARNING|IMPORTANT|IDEA)\]/gi, '')
    .replace(/^\s{0,3}(#{1,6}|>|\s*[-*+]|\s*\d+\.)\s*/gm, '')
    .replace(/[*_~|]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const problems = [];

// image: a file inside the repo (e.g. assets/img/posts/recursion.png) or an https:// URL
function safeImage(file, value) {
  if (!value || typeof value !== 'string') return '';
  const v = value.trim();
  if (/^https:\/\/[^\s"'<>]+$/i.test(v)) return v;
  if (/^[\w./-]+\.(png|jpe?g|gif|webp|svg|avif)$/i.test(v) && !v.includes('..') && !v.startsWith('/')) {
    if (!existsSync(join(ROOT, v))) problems.push(`${file}: image "${v}" does not exist`);
    return v;
  }
  problems.push(`${file}: image "${v}" must be a repo path like assets/img/posts/name.png or an https:// URL`);
  return '';
}
const posts = [];
for (const name of (await readdir(POSTS)).sort()) {
  if (!name.endsWith('.md') || name.startsWith('_')) continue;
  // "slug.md" (original) or "slug.<lang>.md" (translation)
  const m = /^([a-z0-9-]+)(?:\.([a-z]{2}))?\.md$/.exec(name);
  if (!m) { problems.push(`${name}: the file name may only use a-z, 0-9 and "-" (plus an optional .en/.de/.es before .md)`); continue; }
  const [, slug, suffix] = m;
  if (suffix && !LANGS.includes(suffix)) { problems.push(`${name}: language "${suffix}" is not one of ${LANGS.join(', ')}`); continue; }
  const { data, body } = parseFrontMatter(await readFile(join(POSTS, name), 'utf8'));
  const lang = suffix || (LANGS.includes(data.lang) ? data.lang : DEFAULT_LANG);
  if (data.lang && !LANGS.includes(data.lang)) problems.push(`${name}: lang "${data.lang}" is not one of ${LANGS.join(', ')}`);
  if (data.section && !SECTIONS.includes(data.section)) problems.push(`${name}: section "${data.section}" is not one of ${SECTIONS.join(', ')}`);
  const text = plainText(body);
  posts.push({
    slug,
    lang,
    original: !suffix,
    file: `content/posts/${name}`,
    section: data.section || '',
    title: data.title || slug,
    date: data.date || '',
    tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
    summary: data.summary || text.slice(0, 160),
    emoji: data.emoji || '',
    image: safeImage(name, data.image),
    featured: data.destacado === true,
    draft: data.draft === true,
    minutes: Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE)),
    text: text.slice(0, 6000)
  });
}

// Translations inherit what they don't set from the original (section, date, emoji, image…)
const originals = new Map(posts.filter((p) => p.original).map((p) => [p.slug, p]));
for (const p of posts) {
  const base = originals.get(p.slug);
  if (!p.original && !base) problems.push(`${p.file}: translation without an original ${p.slug}.md`);
  if (!p.original && base) {
    for (const key of ['section', 'date', 'emoji', 'image']) if (!p[key]) p[key] = base[key];
    if (!p.tags.length) p.tags = base.tags;
    p.featured = p.featured || base.featured;
    p.draft = p.draft || base.draft;
  }
  if (!p.section) { problems.push(`${p.file}: missing "section"`); p.section = 'blog'; }
  p.langs = posts.filter((q) => q.slug === p.slug).map((q) => q.lang);
}
posts.sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.slug.localeCompare(b.slug));

/* ---------- Syllabus (side menu): content/temario.md and temario.<lang>.md ----------
   # Área          → level 1 (an emoji or symbol before the name becomes its icon)
   ## Unidad       → level 2
   - Tema          → level 3, "coming soon"
   - [Tema](slug)  → level 3, links to the post
   Mistakes here are warnings only: a broken link just shows as "coming soon". */
const warnings = [];
const published = new Set(posts.filter((p) => !p.draft).map((p) => p.slug));

function parseSyllabus(file, src) {
  const areas = [];
  let area = null, unit = null;
  const text = src.replace(/<!--[\s\S]*?-->/g, '');
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    let m;
    if ((m = /^#\s+(.+)$/.exec(line))) {
      // "∑ Matemáticas" → icon "∑", title "Matemáticas" (icon = first word if it has no letters)
      const [first, ...rest] = m[1].split(/\s+/);
      const hasIcon = rest.length && !/\p{L}/u.test(first);
      area = { title: hasIcon ? rest.join(' ') : m[1], icon: hasIcon ? first : '', units: [] };
      unit = null;
      areas.push(area);
    } else if ((m = /^##\s+(.+)$/.exec(line))) {
      if (!area) return warnings.push(`${file}:${i + 1}: "## ${m[1]}" needs a "# Área" above it`);
      unit = { title: m[1], topics: [] };
      area.units.push(unit);
    } else if ((m = /^[-*]\s+(.+)$/.exec(line))) {
      if (!unit) return warnings.push(`${file}:${i + 1}: "- ${m[1]}" needs a "## Unidad" above it`);
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)\s*$/.exec(m[1]);
      let slug = link ? link[2] : null;
      if (slug && !published.has(slug)) {
        warnings.push(`${file}:${i + 1}: "${slug}" is not a published post (shown as "coming soon")`);
        slug = null;
      }
      unit.topics.push({ title: link ? link[1] : m[1], slug });
    } else {
      warnings.push(`${file}:${i + 1}: line ignored (use "# ", "## " or "- ")`);
    }
  });
  return areas;
}

const syllabus = {};
for (const lang of LANGS) {
  const name = lang === DEFAULT_LANG ? 'temario.md' : `temario.${lang}.md`;
  const path = join(ROOT, 'content', name);
  if (existsSync(path)) syllabus[lang] = parseSyllabus(name, await readFile(path, 'utf8'));
}

await writeFile(join(ROOT, 'content', 'index.json'), `${JSON.stringify({ generated: new Date().toISOString(), syllabus, posts }, null, 1)}\n`);
const topics = Object.values(syllabus[DEFAULT_LANG] || []).flatMap((a) => a.units.flatMap((u) => u.topics));
console.log(`✿ content/index.json: ${posts.length} posts (${posts.filter((p) => p.draft).length} drafts), ` +
  `syllabus: ${(syllabus[DEFAULT_LANG] || []).length} areas, ${topics.length} topics (${topics.filter((t) => t.slug).length} with a post)`);
if (warnings.length) console.warn(warnings.map((w) => `  · ${w}`).join('\n'));
if (problems.length) { console.warn(problems.map((p) => `  ⚠ ${p}`).join('\n')); process.exitCode = 1; }
