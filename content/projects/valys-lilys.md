---
title: Cómo hice esta página
date: 2026-11-15
tags: [web, javascript]
summary: HTML, CSS y JavaScript sin frameworks. Todo el contenido vive en archivos Markdown.
emoji: 🧁
---

## La idea

Un layout tipo **MySpace** (columnas, perfil, botones) con estética **Y2K**: encaje, chorreado de glaseado, cuentas con letras y macarons. Todo dibujado con CSS: ni una sola imagen para los adornos.

## Cómo funciona

| Pieza | Archivo |
| --- | --- |
| Marco, navegación, calendario | `js/layout.js` |
| Markdown, búsqueda, índice | `js/core.js` |
| Juegos | `js/widgets.js` |
| Subrayados | `js/highlight.js` |
| Estilos del Markdown | `css/markdown.css` |

Cada entrada es un `.md` con *front matter*:

```markdown
---
title: Mi entrada
date: 2026-11-15
tags: [python, feynman]
summary: Una frase que la resume.
emoji: 🌸
---

Aquí va el contenido ✿
```

Después se ejecuta `node scripts/build-index.mjs` para regenerar el índice que usa el buscador.
