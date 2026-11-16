---
title: Cómo hice esta página
section: projects
date: 2026-11-15
tags: [web, javascript]
summary: HTML, CSS y JavaScript sin frameworks ni scripts externos. Todo el contenido vive en archivos Markdown.
emoji: 🧁
---

## La idea

Una página sencilla: una portada con buscador, filtros por sección y tarjetas, y una página por entrada. Dos temas, **pastel** y **alto contraste**, y la interfaz en inglés, español y alemán.

## Cómo funciona

| Pieza | Archivo |
| --- | --- |
| Colores y fuentes | `assets/css/tokens.css` |
| Portada: búsqueda, filtros y tarjetas | `assets/js/home.js` |
| Markdown → página | `assets/js/markdown.js` |
| Juegos | `assets/js/games.js` |
| Subrayados | `assets/js/highlight.js` |
| Índice de entradas | `scripts/build-index.mjs` |

Cada entrada es un `.md` en `content/es/posts/` con *front matter*:

```markdown
---
title: Mi entrada
section: cs
date: 2026-11-15
tags: [python, feynman]
summary: Una frase que la resume.
emoji: 🌸
---

Aquí va el contenido ✿
```

Después se ejecuta `node scripts/build-index.mjs` para regenerar el índice que usan la portada y el buscador.

> [!NOTE]
> Por seguridad, la página no carga scripts de otros sitios: el Markdown se convierte a HTML con un intérprete propio que nunca usa `innerHTML`.
