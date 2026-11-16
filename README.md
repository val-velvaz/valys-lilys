# ✿ valy's lilys

Blog para **aprender y aplicar el método Feynman** con juegos y entradas personales.
Sitio estático y sencillo: HTML, CSS y JavaScript (módulos), sin frameworks y sin scripts externos.

## Ver la página en local

Las entradas se cargan con `fetch`, así que hay que abrir la página con un servidor:

```bash
python3 -m http.server 8000
```

Después abre <http://localhost:8000>.

## Añadir una entrada

1. Copia `content/es/posts/_plantilla.md` a `content/es/posts/mi-entrada.md`. El nombre del archivo es el *slug* y solo puede tener `a-z`, `0-9` y `-`.
2. Rellena el *front matter*:

   ```markdown
   ---
   title: La integral es una suma de rebanadas
   section: math
   date: 2026-11-20
   tags: [calculo, feynman]
   summary: Una frase que resume la entrada.
   emoji: 🍰
   ---
   ```

   `section` puede ser `math`, `cs`, `games`, `projects`, `challenges`, `blog` o `about`. Con `draft: true` la entrada no se publica.

   **Imagen en lugar del emoji (opcional):** guarda la imagen en `assets/img/posts/` y añade `image:` al front matter. Se muestra en la tarjeta y junto al título; si falta, se usa el emoji.

   ```markdown
   image: assets/img/posts/integrales.png
   ```

   Sirve cualquier `png`, `jpg`, `webp`, `gif`, `svg` o `avif`. Mejor si es cuadrada (por ejemplo 240×240) y pesa poco. También vale una URL `https://…`. `build-index.mjs` avisa si la ruta no existe.

   **Destacar una entrada (opcional):** `destacado: true` la pone en **Empieza aquí**, arriba de la portada (se muestran como mucho 2).

   **Prerrequisitos (opcional):** `requiere: [metodo-feynman, recursion]` dice qué temas conviene leer antes. Se usa para dibujar el **mapa de temas**.
3. Regenera el índice que usan la portada y el buscador:

   ```bash
   node scripts/build-index.mjs
   ```

La entrada queda en `post.html?p=mi-entrada`, y cada sección tiene su propio enlace: `index.html?section=math`.

`build-index.mjs` también calcula los minutos de lectura (solo se muestran desde 3 minutos), el idioma y si la entrada está destacada.

## Idiomas

Todo el contenido está separado por **una carpeta por idioma**:

```
content/
├── es/                      ← español (versión principal)
│   ├── temario.md
│   └── posts/
│       ├── recursion.md
│       └── derivadas.md
├── en/                      ← inglés
│   ├── temario.md
│   └── posts/
│       └── recursion.md     ← mismo nombre = misma entrada, traducida
└── de/                      ← alemán
    ├── temario.md
    └── posts/
        └── derivadas.md
```

**La regla es una sola:** el mismo nombre de archivo en otra carpeta es la misma entrada en otro idioma.

### Traducir una entrada (2 pasos)

1. Crea el archivo de la traducción con el script (copia la versión principal a la carpeta del idioma):

   ```bash
   node scripts/traducir.mjs recursion de
   ```

   Esto crea `content/de/posts/recursion.md` con el texto listo para traducir. En el front matter solo deja `title` y `summary`: la sección, la fecha, los tags, el emoji, la imagen, `destacado` y `requiere` se copian solos de la versión principal. Nunca sobrescribe un archivo que ya existe.

2. Traduce el texto y regenera el índice (o haz push a `main`):

   ```bash
   node scripts/build-index.mjs
   ```

También puedes crear el archivo a mano: copia `content/es/posts/recursion.md` a `content/de/posts/recursion.md` y tradúcelo.

**El temario** se traduce igual: `node scripts/traducir.mjs temario de` crea `content/de/temario.md`. Cambia los nombres y deja igual los `(slug)` de los enlaces.

### Qué ve quien visita la web

- **Botones EN · ES · DE de la cabecera:** cambian la interfaz y muestran cada entrada en ese idioma si existe.
- **Si una entrada no está traducida**, se muestra la versión principal con una etiqueta pequeña (**ES**) y el aviso "Esta entrada aún no está traducida a tu idioma".
- **"Leer en: ES · EN · DE"**: en cada entrada que tiene más de un idioma, estos botones cambian **a mano** el idioma de esa entrada sin tocar el de la interfaz. Equivalen a añadir `&lang=` al enlace: `post.html?p=recursion&lang=en`.
- **Subrayados:** cada versión tiene los suyos, porque el texto es distinto.

### Saber qué falta traducir

`build-index.mjs` lo dice cada vez que se ejecuta:

```
  languages:
    es  12/12 posts
    en  1/12 posts  · missing: hoja-feynman, derivadas, …
    de  1/12 posts  · missing: recursion, …
```

### Versión principal y orden de respaldo

La lista de idiomas vive en **un solo archivo**, `assets/js/langs.js`:

```js
export const LANGS = ['es', 'en', 'de'];     // idiomas del sitio
export const FALLBACK = ['es', 'en', 'de'];  // si falta una traducción, se busca en este orden
export const DEFAULT_LANG = 'es';
```

- La **versión principal** de cada entrada es la primera que exista siguiendo `FALLBACK`. Puedes escribir una entrada solo en inglés (`content/en/posts/…`) y será la principal.
- **Añadir un idioma** (por ejemplo francés): pon `'fr'` en `LANGS` y en `FALLBACK`, crea `content/fr/posts/` y añade sus textos de interfaz en `assets/js/i18n.js`. Mientras no estén, la interfaz usa los del español.

## Portada

- **Empieza aquí**: las entradas con `destacado: true`, en tarjetas grandes.
- **Herramientas**: `games` y `challenges`, en una fila horizontal. El reto de 30 días va aquí porque es algo que *haces* (una lista que marcas), no algo que lees.
- **Explicaciones**: `math`, `cs` y `projects`, en cuadrícula. Los proyectos van aquí porque son artículos largos que se leen.
- **Diario**: `blog`, como lista compacta de fecha y título.
- `about` no se lista: se llega desde el avatar.
- Al buscar o filtrar, las secciones se juntan en una sola lista de resultados.

El reparto está en `GROUPS`, al principio de `assets/js/home.js`.

## Temario (menú lateral)

El menú de la izquierda (en la portada y en cada entrada) sale de **un solo archivo por idioma**: `content/es/temario.md` (y `content/en/temario.md`, `content/de/temario.md`). Tiene tres niveles:

| Nivel | Se escribe | Ejemplo |
| --- | --- | --- |
| 1 · Área | `# ` + emoji opcional + nombre | `# 🛡 Ciberseguridad` |
| 2 · Unidad | `## ` + nombre | `## Pentesting` |
| 3 · Tema | `- ` + nombre | `- Escalada de privilegios` |

```markdown
# ∑ Matemáticas

## Cálculo
- Límites
- [La derivada es un velocímetro](derivadas)
- Integrales
```

- **Tema sin enlace** (`- Límites`): sale en gris con la etiqueta "pronto". Sirve para anunciar lo que vas a escribir.
- **Tema con enlace** (`- [Título](slug)`): el `slug` es el nombre del archivo de la entrada sin `.md` (`derivadas` → `content/es/posts/derivadas.md`). Sale como enlace, con un punto de color según el progreso de quien lo visita: lila = disponible, rosa = en progreso, verde = dominado.
- El emoji o símbolo antes del nombre del área es su icono. Si no pones ninguno, se usa la primera letra.
- Los colores de las áreas se asignan solos, por orden: rosa, menta, azul, lila, melocotón, mantequilla.
- El contador `1/9` de cada área es "temas con entrada / temas en total".
- En una entrada, el menú abre el área de ese tema y lo resalta. En móvil aparece debajo de la entrada, para leer primero.
- El código del menú está en `assets/js/syllabus.js` (lo usan `home.js` y `post.js`).

### Recetas rápidas

- **Publicar un tema que estaba en "pronto":** escribe la entrada (`content/es/posts/integrales.md`) y en el temario cambia `- Integrales` por `- [Integrales](integrales)`.
- **Añadir una unidad:** una línea `## Nombre` debajo del área, y sus temas debajo con `- `.
- **Añadir un área nueva:** una línea `# 🎨 Diseño` al final, con sus `##` y `- `.
- **Cambiar el orden:** mueve las líneas. El menú respeta el orden del archivo.

Después de editar, ejecuta `node scripts/build-index.mjs` (o haz push a `main`, que lo hace solo). El script avisa con `·` de cualquier línea que no entienda o de un enlace a una entrada que no existe, y ese tema sale como "pronto" en vez de romper la página.

**En otros idiomas:** `content/en/temario.md` y `content/de/temario.md`, con la misma estructura (`node scripts/traducir.mjs temario de` lo crea). Si falta el de un idioma, se muestra el español. Los enlaces usan el mismo `slug`, así que llevan a la traducción de la entrada si existe.

## Progreso

El panel **Tu progreso** (a la derecha en pantallas anchas y bajo la cabecera en móvil) lee `assets/js/progress.js`, que guarda todo en el navegador:

| Función | Qué hace |
| --- | --- |
| `getStatus(slug)` / `setStatus(slug, estado)` | Estado de un tema: `bloqueado`, `disponible`, `en-progreso` o `dominado`. |
| `markOpened(slug)` | Guarda la última entrada abierta y la pasa a `en-progreso`. |
| `getLastOpened()` | Para "Continúa donde te quedaste". |
| `getStreak()` | Días seguidos marcados en el Reto de 30 días, desde el día 1. |
| `getSummary(posts)` | Cuántos temas hay en cada estado. |

- Un tema pasa a `dominado` al marcar los 4 pasos Feynman al final de la entrada. Si desmarcas uno, vuelve a `en-progreso`.
- `bloqueado` ya existe, pero aún no hay reglas de desbloqueo: irían en `isUnlocked(post)`.
- **En las tarjetas:** cada tema de la portada lleva una pastilla con su estado (○ disponible, • en progreso, ✓ dominado). Usa icono y texto, no solo color. El diario y "sobre mí" no la llevan porque no son temas.

### Mapa de temas

El último bloque del panel (`assets/js/graph.js`) dibuja cómo se conectan los temas:

```
● ¿Qué es el método Feynman?
│  ● La recursión explicada con escaleras
│  │  ● Estructuras de datos con analogías
│  ● Mi hoja Feynman
│  │  ● Reto de 30 días Feynman
● Cómo hice esta página
```

- Cada tema es una fila con un punto del color de su estado. Haz clic en él para abrir la entrada.
- El **sangrado** es el nivel: cuántos temas hay que leer antes.
- Las **líneas** salen del campo `requiere:` de cada entrada y van del tema previo a los que se apoyan en él.
- El aro marca el último tema que abriste.

**Para conectar temas** solo añade `requiere:` al front matter del tema que va *después*:

```markdown
---
title: Estructuras de datos con analogías
requiere: [recursion]
---
```

`build-index.mjs` revisa estos enlaces: ignora (con un aviso `·`) los que apuntan a entradas que no existen y rompe los bucles (A requiere B y B requiere A). Nunca para la publicación. Una traducción usa siempre los prerrequisitos del original.

## Markdown que se puede usar

| Markdown | Resultado |
| --- | --- |
| `#` … `####` | títulos, un color por nivel |
| `**negrita**`, `*itálica*`, `~~tachado~~`, `` `código` `` | texto |
| `==texto==` / `=={rosa}texto==` | subrayado (`rosa`, `amarillo`, `azul`, `verde`, `lila`) |
| `[texto](url)`, `![alt](imagen.png)` | enlaces e imágenes |
| `> cita` | cita |
| `> [!NOTE]`, `[!TIP]`, `[!FEYNMAN]`, `[!WARNING]`, `[!IMPORTANT]`, `[!IDEA]` | avisos de colores |
| `- lista`, `1. lista`, `- [ ] tarea` | listas (las tareas guardan su estado) |
| tablas con `\|` | tablas |
| `---` | separador |
| ` ```lenguaje ` | bloque de código |

No se admite HTML dentro del Markdown: así ningún contenido puede inyectar código en la página.

## Juegos dentro de una entrada

````markdown
```flashcards
pregunta :: respuesta
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

- **jerga**: puntúa si un niño de 12 años entendería tu explicación. Usa las palabras del **idioma de la entrada** (jerga, analogías y largo de palabra en `WORDS`, al principio de `assets/js/games.js`): para mejorar la lista de un idioma, edítala ahí.
- **hoja-feynman**: los 4 pasos del método. Se exporta como una entrada `.md` en el idioma de la página, lista para `content/<idioma>/posts/`.

## Funciones

- **Buscador y filtros** en la portada (por título, tema, tags o palabras dentro de las entradas). Cada filtro muestra cuántas entradas tiene.
- **Subrayado**: selecciona texto en una entrada, elige color y añade notas. Todo se reúne en `subrayados.html`, desde donde se exporta a Markdown.
- **Lista de los 4 pasos Feynman** al final de cada entrada.
- **Idiomas EN / ES / DE** para la interfaz (`assets/js/i18n.js`).
- **Tema pastel / alto contraste**. El de alto contraste se activa solo si el sistema pide más contraste.
- **Foto de perfil = tu avatar de GitHub**: se vuelve a pedir cada 5 minutos y al volver a la pestaña, así que se actualiza sola. El usuario está en `GITHUB_USER` (`assets/js/data.js`). Si GitHub no responde, se muestra `assets/img/perfil.svg`.

> Los subrayados, las tareas y el progreso se guardan **solo en el navegador** de cada visitante.

## Estructura

```
index.html                portada: temario, secciones, buscador, filtros y panel de progreso
post.html?p=<slug>        una entrada
subrayados.html           mis subrayados
assets/css/tokens.css     colores y fuentes (el único sitio donde viven)
assets/css/base.css       reset y tipografía
assets/css/components.css piezas: cabecera, tarjetas, entrada, juegos, subrayado
assets/js/                theme · i18n · data · header · markdown · games · highlight · progress · syllabus · graph · home · post · highlights-page
content/<idioma>/posts/   entradas (es, en, de)
content/<idioma>/temario.md  menú lateral de temas
content/index.json        índice generado
scripts/build-index.mjs   genera el índice
scripts/traducir.mjs      crea el archivo de una traducción
assets/js/langs.js        lista de idiomas (el único sitio)
```

## Seguridad

Cada página tiene una *Content Security Policy*: solo carga scripts propios, estilos propios y Google Fonts, y no usa scripts en línea. El Markdown se convierte con un intérprete propio que crea los elementos uno a uno (sin `innerHTML`) y solo permite enlaces `http(s)`, `mailto` o relativos.

## Publicar en GitHub Pages

El workflow `.github/workflows/pages.yml` regenera el índice y publica en cada push a `main`. Antes hay que activar **Settings → Pages → Source: GitHub Actions**.
