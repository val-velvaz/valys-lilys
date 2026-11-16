#!/usr/bin/env node
/* Builds content/index.json from the Markdown posts.
   Usage:  node scripts/build-index.mjs
   - Reads content/posts/*.md (files starting with "_" are ignored, e.g. the template)
   - Takes the front matter (title, date, section, tags, summary, emoji, image, draft)
   - Stores plain text too, so the home search finds words inside the posts. */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const POSTS = join(ROOT, 'content', 'posts');
const SECTIONS = ['math', 'cs', 'games', 'projects', 'challenges', 'blog', 'about'];

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
  const slug = name.replace(/\.md$/, '');
  if (!/^[a-z0-9-]+$/.test(slug)) { problems.push(`${name}: the file name may only use a-z, 0-9 and "-"`); continue; }
  const { data, body } = parseFrontMatter(await readFile(join(POSTS, name), 'utf8'));
  if (!SECTIONS.includes(data.section)) problems.push(`${name}: section "${data.section}" is not one of ${SECTIONS.join(', ')}`);
  const text = plainText(body);
  posts.push({
    slug,
    section: data.section || 'blog',
    title: data.title || slug,
    date: data.date || '',
    tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
    summary: data.summary || text.slice(0, 160),
    emoji: data.emoji || '',
    image: safeImage(name, data.image),
    draft: data.draft === true,
    text: text.slice(0, 6000)
  });
}
posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));
await writeFile(join(ROOT, 'content', 'index.json'), `${JSON.stringify({ generated: new Date().toISOString(), posts }, null, 1)}\n`);
console.log(`✿ content/index.json: ${posts.length} posts (${posts.filter((p) => p.draft).length} drafts)`);
if (problems.length) { console.warn(problems.map((p) => `  ⚠ ${p}`).join('\n')); process.exitCode = 1; }
