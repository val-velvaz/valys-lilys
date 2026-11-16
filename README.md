# ✿ valy's lilys ✿

Blog educativo para **aprender y aplicar el método Feynman** con juegos y entradas personales.
Layout inspirado en MySpace, estética Y2K y mucha interactividad. Todo está hecho con HTML, CSS y JavaScript, sin frameworks y sin imágenes para los adornos: el encaje, el chorreado, las cuentas con letras, los macarons, las galletas, la espiral y las rayas están dibujados con CSS.

## Ver la página en local

Las entradas se cargan con `fetch`, así que hay que abrir la página con un servidor (si abres el archivo con doble clic no funciona):

```bash
python3 -m http.server 8000
```

Después abre <http://localhost:8000>.

## Añadir una entrada

1. Copia `content/_plantilla.md` a la carpeta de la sección, por ejemplo `content/math/integrales.md`.
2. Rellena el *front matter*:

   ```markdown
   ---
   title: La integral es una suma de rebanadas
   date: 2026-11-20
   tags: [calculo, feynman]
   summary: Una frase que resume la entrada.
   emoji: 🍰
   mood: feliz
   ---
   ```

3. Regenera el índice (lo usan la búsqueda, el calendario y los listados):

   ```bash
   node scripts/build-index.mjs
   ```

Si publicas con GitHub Pages, el workflow `.github/workflows/pages.yml` regenera el índice en cada push a `main`. Para activarlo, ve a *Settings → Pages* y elige **GitHub Actions** como origen.

**Secciones** (cada una tiene su propia página): `math`, `cs`, `games`, `projects`, `challenges`, `portfolio`, `blog`, `more` y `about`.
Las entradas con `draft: true` no aparecen en el sitio.

## Markdown: etiquetas y estilos

Cada etiqueta tiene su propio estilo en `css/markdown.css`:

| Markdown | Estilo |
| --- | --- |
| `# título` / `## título` | Nunito itálica con barra redondeada debajo |
| `### título` | etiqueta lila en Fira Code |
| `#### título` | rosa con ✿ |
| párrafos | Tinos |
| `==texto==` | subrayado tipo marcador (amarillo) |
| `=={rosa}texto==` | subrayado de color: `rosa`/`pink`, `amarillo`/`yellow`, `azul`/`blue`, `verde`/`green`, `lila`/`lilac` |
| `> cita` | papel cuadriculado con cinta |
| `> [!NOTE]`, `[!TIP]`, `[!FEYNMAN]`, `[!WARNING]`, `[!IMPORTANT]`, `[!IDEA]` | callouts de colores |
| listas `-` / `1.` | flores ✿ y números en cuentas |
| `- [ ] tarea` | checkbox con corazón (se guarda el progreso) |
| tablas | encabezados pastel y filas alternas |
| `---` | franja de rayas (las texturas de tus imágenes) |
| ` ```lenguaje ` | ventana de código con botón de copiar |
| `![alt](img.png)` | foto polaroid con cinta (el `alt` es el pie de foto) |
| `<details>` | acordeón menta |

## Juegos dentro del Markdown

Escribe un bloque de código con el nombre del juego:

````markdown
```flashcards
pregunta :: respuesta
```

```memoria
concepto :: pareja
```

```quiz
? ¿Pregunta?
+ respuesta correcta
- respuesta incorrecta
> explicación que aparece al responder
```

```pasos
# título opcional
primer paso
segundo paso
```

```jerga
concepto: ¿qué es un algoritmo?
```

```hoja-feynman
concepto: la recursión
```
````

- **jerga**: detector que puntúa si un niño de 12 años entendería tu explicación.
- **hoja-feynman**: hoja de los 4 pasos que se exporta como `.md`, lista para `content/`.

## Interactividad

- **Buscador en todas las páginas** (pulsa <kbd>/</kbd>): resultados al momento y página `buscar.html` con filtro por sección.
- **Sistema de subrayado**: selecciona texto en una entrada, elige color y añade notas. Todo se reúne en `subrayados.html`, desde donde también se exporta a Markdown.
- **Calendario de cuentas**: los días con entradas tienen anillo; al pulsarlos aparece la lista.
- **Checklist Feynman** e índice en cada entrada, con barra de progreso.
- **Idiomas EN / ES / DE** para la interfaz. Los textos de inicio viven en `content/paginas/*.{es,en}.md`.
- **Fondos** recreados con CSS a partir de tus texturas de rayas (puntos, candy, lila, azul, aqua, menta, salvia y crema), brillitos que siguen al cursor, corazones que explotan, macarons que se abren, un contador de visitas y una entrada al azar.
- **My IDE** (`ide.html`): editor de JS y HTML que corre aislado en un iframe.
- **GitHub widget**: repos recientes y último commit (API pública de GitHub, por https).

> Los subrayados, los comentarios, el progreso y el contador se guardan **solo en el navegador** de cada visitante (localStorage). Para comentarios compartidos haría falta un servicio externo, por ejemplo giscus.

## Personalizar

- `js/config.js`: nombre, versión, foto de perfil, usuario de GitHub, enlaces de `media`, botones, macarons y temas de la columna derecha.
- `js/i18n.js`: textos de la interfaz en cada idioma.
- `css/main.css`: paleta (variables en `:root`) y layout.
- **Foto de perfil sincronizada con GitHub**: con `profileImage: "github"` (por defecto) la página usa tu avatar de `https://github.com/<githubUser>.png`. Lo vuelve a pedir cada `avatarRefreshMinutes` (5 min) y al volver a la pestaña, así que si cambias tu foto en GitHub, la web se actualiza sola y aparece el sello **● live**. Si GitHub no responde, se muestra la lila de `assets/img/perfil.svg`. Para usar otra imagen, pon su ruta en `profileImage`.

## Estructura

```
index.html, math.html, cs.html, …   páginas (cada sección tiene la suya)
entrada.html?id=seccion/archivo     una entrada
buscar.html · tema.html · subrayados.html · ide.html · about.html
css/   main.css · markdown.css · widgets.css
js/    config · i18n · core · layout · widgets · highlight · pages/*
content/<seccion>/*.md              entradas
content/paginas/*.md                textos de inicio e intros de sección
content/index.json                  índice generado
scripts/build-index.mjs             genera el índice
```

Librerías desde CDN (https): [marked](https://marked.js.org) para el Markdown y [DOMPurify](https://github.com/cure53/DOMPurify) para sanearlo. Fuentes: Nunito, Tinos y Fira Code (Google Fonts).
