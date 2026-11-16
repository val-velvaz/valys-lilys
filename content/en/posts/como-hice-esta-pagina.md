---
title: How I made this site
summary: HTML, CSS and JavaScript with no frameworks or external scripts. All the content lives in Markdown files.
---

## The idea

A simple site: a home page with search, section filters and cards, and one page per post. Two themes, **pastel** and **high contrast**, and the interface in English, Spanish and German.

## How it works

| Piece | File |
| --- | --- |
| Colors and fonts | `assets/css/tokens.css` |
| Home: search, filters and cards | `assets/js/home.js` |
| Markdown → page | `assets/js/markdown.js` |
| Games | `assets/js/games.js` |
| Highlights | `assets/js/highlight.js` |
| Post index | `scripts/build-index.mjs` |

Every post is a `.md` file in `content/<language>/posts/` with *front matter*:

```markdown
---
title: My post
section: cs
date: 2026-11-15
tags: [python, feynman]
summary: One sentence that sums it up.
emoji: 🌸
---

The content goes here ✿
```

Then `node scripts/build-index.mjs` rebuilds the index used by the home page and the search.

> [!NOTE]
> For security, the site doesn't load scripts from other sites: Markdown is turned into HTML by its own parser, which never uses `innerHTML`.
