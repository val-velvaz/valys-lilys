#!/usr/bin/env node
/* Builds content/index.json from the Markdown posts.
   Usage:  node scripts/build-index.mjs

   One folder per language (the list lives in assets/js/langs.js):
     content/es/posts/recursion.md   content/es/temario.md
     content/en/posts/recursion.md   content/en/temario.md
     content/de/posts/…              content/de/temario.md
   The same file name in two folders = the same post in two languages (same slug).

   - Files starting with "_" are ignored (e.g. the template)
   - Takes the front matter (title, date, section, tags, summary, emoji, image, destacado, requiere, draft)
   - The "main" version of each post is the first one found in FALLBACK order (es → en → de).
     Other languages only need title, summary and the text: the rest is copied from the main one.
   - Computes fields so the browser doesn't have to: lang, featured, minutes, langs (available languages)
   - Stores plain text too, so the home search finds words inside the posts.
   - Prints how many posts each language has and which ones are missing. */
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGS, FALLBACK, DEFAULT_LANG } from '../assets/js/langs.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTENT = join(ROOT, 'content');
const SECTIONS = ['math', 'cs', 'games', 'projects', 'challenges', 'blog', 'about', 'ia', 'os'];
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
const warnings = [];

// folders inside content/ that are not a known language (e.g. a typo like "content/ed/")
for (const name of await readdir(CONTENT)) {
  if ((await stat(join(CONTENT, name))).isDirectory() && !LANGS.includes(name)) {
    warnings.push(`content/${name}/ is not a language from assets/js/langs.js (${LANGS.join(', ')}), ignored`);
  }
}

const posts = [];
for (const lang of FALLBACK) {
  const dir = join(CONTENT, lang, 'posts');
  if (!existsSync(dir)) continue;
  for (const name of (await readdir(dir)).sort()) {
    if (!name.endsWith('.md') || name.startsWith('_')) continue;
    const rel = `content/${lang}/posts/${name}`;
    const m = /^([a-z0-9-]+)\.md$/.exec(name);
    if (!m) { problems.push(`${rel}: the file name may only use a-z, 0-9 and "-"`); continue; }
    const slug = m[1];
    const { data, body } = parseFrontMatter(await readFile(join(dir, name), 'utf8'));
    if (data.section && !SECTIONS.includes(data.section)) problems.push(`${rel}: section "${data.section}" is not one of ${SECTIONS.join(', ')}`);
    const text = plainText(body);
    posts.push({
      slug,
      lang,
      // the first version found (FALLBACK order) is the main one
      original: !posts.some((p) => p.slug === slug),
      file: rel,
    section: data.section || '',
    title: data.title || slug,
    date: data.date || '',
    tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
    summary: data.summary || text.slice(0, 160),
    emoji: data.emoji || '',
    image: safeImage(name, data.image),
    featured: data.destacado === true,
    // "requiere: [slug, slug]" → topics to learn before this one (used by the topic map)
    requires: (Array.isArray(data.requiere) ? data.requiere : data.requiere ? [data.requiere] : []).map(String),
    draft: data.draft === true,
    minutes: Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE)),
    text: text.slice(0, 6000)
    });
  }
}

// Other languages inherit what they don't set from the main version (section, date, emoji, image…)
const originals = new Map(posts.filter((p) => p.original).map((p) => [p.slug, p]));
for (const p of posts) {
  const base = originals.get(p.slug);
  if (!p.original) {
    for (const key of ['section', 'date', 'emoji', 'image']) if (!p[key]) p[key] = base[key];
    if (!p.tags.length) p.tags = base.tags;
    p.featured = p.featured || base.featured;
    p.draft = p.draft || base.draft;
  }
  if (!p.section) { problems.push(`${p.file}: missing "section"`); p.section = 'blog'; }
  p.langs = posts.filter((q) => q.slug === p.slug).map((q) => q.lang);
}
posts.sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.slug.localeCompare(b.slug));

/* ---------- Syllabus (side menu): content/<lang>/temario.md ----------
   # Área          → level 1 (an emoji or symbol before the name becomes its icon)
   ## Unidad       → level 2
   - Tema          → level 3, "coming soon"
   - [Tema](slug)  → level 3, links to the post
   Mistakes here are warnings only: a broken link just shows as "coming soon". */
const published = new Set(posts.filter((p) => !p.draft).map((p) => p.slug));

/* ---------- Prerequisites ("requiere:") ----------
   Only links between published posts are kept. Translations always use the original's list.
   A loop (A requires B and B requires A) can't be drawn as a map, so the link that
   closes it is dropped with a warning. Like the syllabus, mistakes here never stop the build. */
const requiresOf = new Map();
for (const p of posts.filter((q) => q.original)) {
  const valid = [...new Set(p.requires)].filter((slug) => {
    if (slug === p.slug) { warnings.push(`${p.file}: a post can't require itself`); return false; }
    if (!published.has(slug)) { warnings.push(`${p.file}: requiere "${slug}", which is not a published post`); return false; }
    return true;
  });
  requiresOf.set(p.slug, valid);
}
const state = new Map(); // 1 = visiting, 2 = done
function visit(slug) {
  state.set(slug, 1);
  for (const dep of [...(requiresOf.get(slug) || [])]) {
    if (state.get(dep) === 1) {
      warnings.push(`${slug}: "requiere: ${dep}" makes a loop, ignored`);
      requiresOf.set(slug, requiresOf.get(slug).filter((s) => s !== dep));
    } else if (!state.has(dep)) visit(dep);
  }
  state.set(slug, 2);
}
for (const slug of requiresOf.keys()) if (!state.has(slug)) visit(slug);
for (const p of posts) p.requires = requiresOf.get(p.slug) || [];

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
  const name = `${lang}/temario.md`;
  const path = join(CONTENT, lang, 'temario.md');
  if (existsSync(path)) syllabus[lang] = parseSyllabus(`content/${name}`, await readFile(path, 'utf8'));
}

await writeFile(join(CONTENT, 'index.json'), `${JSON.stringify({ generated: new Date().toISOString(), syllabus, posts }, null, 1)}\n`);
const topics = Object.values(syllabus[DEFAULT_LANG] || []).flatMap((a) => a.units.flatMap((u) => u.topics));
console.log(`✿ content/index.json: ${posts.length} posts (${posts.filter((p) => p.draft).length} drafts), ` +
  `syllabus: ${(syllabus[DEFAULT_LANG] || []).length} areas, ${topics.length} topics (${topics.filter((t) => t.slug).length} with a post)`);

// Translation coverage: which posts each language still lacks
const slugs = [...new Set(posts.filter((p) => !p.draft).map((p) => p.slug))];
console.log('  languages:');
for (const lang of LANGS) {
  const has = new Set(posts.filter((p) => p.lang === lang && !p.draft).map((p) => p.slug));
  const missing = slugs.filter((s) => !has.has(s));
  console.log(`    ${lang}  ${has.size}/${slugs.length} posts${syllabus[lang] ? '' : ', no temario.md'}` +
    (missing.length && missing.length < slugs.length ? `  · missing: ${missing.join(', ')}` : ''));
}
if (warnings.length) console.warn(warnings.map((w) => `  · ${w}`).join('\n'));
if (problems.length) { console.warn(problems.map((p) => `  ⚠ ${p}`).join('\n')); process.exitCode = 1; }
