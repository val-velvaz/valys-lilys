#!/usr/bin/env node
/* ✿ Genera content/index.json a partir de los archivos Markdown ✿
   Uso:  node scripts/build-index.mjs
   - Lee content/<seccion>/*.md (ignora content/paginas y archivos que empiezan con "_")
   - Extrae el front matter (title, date, tags, summary, emoji, mood, draft…)
   - Guarda el texto plano para que la búsqueda funcione en todas las páginas. */
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CONTENT = join(ROOT, "content");
const SKIP_DIRS = new Set(["paginas"]);

function parseFrontMatter(src) {
  const m = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/.exec(src);
  if (!m) return { data: {}, body: src };
  const data = {};
  let lastKey = null;
  const clean = (s) => s.trim().replace(/^["']|["']$/g, "");
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const item = /^\s+-\s+(.*)$/.exec(line);
    if (item && lastKey) {
      if (!Array.isArray(data[lastKey])) data[lastKey] = [];
      data[lastKey].push(clean(item[1]));
      continue;
    }
    const kv = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
    if (!kv) continue;
    lastKey = kv[1];
    let v = kv[2].trim();
    if (v.startsWith("[") && v.endsWith("]")) v = v.slice(1, -1).split(",").map(clean).filter(Boolean);
    else if (v === "") v = [];
    else if (v === "true" || v === "false") v = v === "true";
    else v = clean(v);
    data[lastKey] = v;
  }
  return { data, body: src.slice(m[0].length) };
}

function plainText(md) {
  return md
    .replace(/```[\w-]*\n([\s\S]*?)```/g, (_, code) => " " + code.replace(/^[?+\->#]\s*/gm, "").replace(/::/g, " ") + " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/==(\{[a-z]+\})?/g, "")
    .replace(/^\s{0,3}(#{1,6}|>|\s*[-*+]|\s*\d+\.)\s*/gm, "")
    .replace(/\[!(NOTE|TIP|FEYNMAN|WARNING|IMPORTANT|IDEA)\]/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/[*_~|]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function walk(dir) {
  const out = [];
  for (const name of await readdir(dir)) {
    const p = join(dir, name);
    const s = await stat(p);
    if (s.isDirectory()) { if (!SKIP_DIRS.has(name)) out.push(...(await walk(p))); }
    else if (name.endsWith(".md") && !name.startsWith("_")) out.push(p);
  }
  return out;
}

const files = await walk(CONTENT);
const entries = [];
for (const file of files) {
  const rel = relative(ROOT, file).split(sep).join("/");
  const parts = relative(CONTENT, file).split(sep);
  if (parts.length < 2) continue; // archivos sueltos en content/ no son entradas
  const section = parts[0];
  const slug = parts.slice(1).join("/").replace(/\.md$/, "");
  const { data, body } = parseFrontMatter(await readFile(file, "utf8"));
  const tags = Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [];
  const firstHeading = /^#\s+(.+)$/m.exec(body);
  entries.push({
    id: `${section}/${slug}`,
    section,
    file: rel,
    title: data.title || (firstHeading && firstHeading[1]) || slug,
    date: data.date || "",
    tags,
    summary: data.summary || plainText(body).slice(0, 160),
    emoji: data.emoji || "",
    mood: data.mood || "",
    lang: data.lang || "es",
    draft: data.draft === true,
    text: plainText(body).slice(0, 6000)
  });
}
entries.sort((a, b) => String(b.date).localeCompare(String(a.date)));
await writeFile(join(CONTENT, "index.json"), JSON.stringify({ generated: new Date().toISOString(), entries }, null, 1) + "\n");
console.log(`✿ index.json: ${entries.length} entradas (${entries.filter((e) => e.draft).length} borradores)`);
