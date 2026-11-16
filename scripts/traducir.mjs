#!/usr/bin/env node
/* Creates the file for a translation, ready to translate.

   Usage:
     node scripts/traducir.mjs <slug> <lang>      e.g.  node scripts/traducir.mjs recursion de
     node scripts/traducir.mjs temario <lang>     e.g.  node scripts/traducir.mjs temario de

   - Copies the main version (first language found in FALLBACK order, see assets/js/langs.js)
     to content/<lang>/posts/<slug>.md  (or content/<lang>/temario.md).
   - In a post it keeps only what needs translating in the front matter (title, summary);
     section, date, emoji, image, destacado and requiere are taken from the main version.
   - Never overwrites a file that already exists. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGS, FALLBACK } from '../assets/js/langs.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const [slug, lang] = process.argv.slice(2);

function fail(msg) {
  console.error(`✗ ${msg}`);
  console.error('  usage: node scripts/traducir.mjs <slug|temario> <lang>   (languages: ' + LANGS.join(', ') + ')');
  process.exit(1);
}

if (!slug || !lang) fail('missing arguments');
if (!/^[a-z0-9-]+$/.test(slug)) fail(`"${slug}" is not a valid slug (a-z, 0-9 and "-")`);
if (!LANGS.includes(lang)) fail(`"${lang}" is not a language from assets/js/langs.js`);

const isSyllabus = slug === 'temario';
const pathFor = (l) => (isSyllabus ? join(ROOT, 'content', l, 'temario.md') : join(ROOT, 'content', l, 'posts', `${slug}.md`));

const target = pathFor(lang);
const rel = (p) => p.slice(ROOT.length);
if (existsSync(target)) fail(`${rel(target)} already exists (nothing changed)`);

const sourceLang = FALLBACK.find((l) => l !== lang && existsSync(pathFor(l)));
if (!sourceLang) fail(`no version of "${slug}" found to translate from`);
const source = await readFile(pathFor(sourceLang), 'utf8');

let out;
if (isSyllabus) {
  out = `<!-- TRADUCIR desde ${sourceLang}/temario.md: cambia los nombres, deja los (slug) de los enlaces igual -->\n\n` +
    source.replace(/^<!--[\s\S]*?-->\s*/, '');
} else {
  const m = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/.exec(source);
  const fm = m ? m[1] : '';
  const body = m ? source.slice(m[0].length) : source;
  const keep = (key) => (new RegExp(`^${key}\\s*:.*$`, 'm').exec(fm) || [`${key}: `])[0];
  out = [
    '---',
    keep('title'),
    keep('summary'),
    `# ← traduce estas dos líneas. Sección, fecha, emoji, imagen, destacado y requiere`,
    `#   se copian solos de ${sourceLang}/posts/${slug}.md (puedes añadirlos aquí para cambiarlos).`,
    '---',
    '',
    `<!-- TRADUCIR desde content/${sourceLang}/posts/${slug}.md -->`,
    '',
    body.trimStart()
  ].join('\n');
}

await mkdir(dirname(target), { recursive: true });
await writeFile(target, out);
console.log(`✿ created ${rel(target)} (copied from ${sourceLang})`);
console.log('  1. translate it   2. run: node scripts/build-index.mjs');
