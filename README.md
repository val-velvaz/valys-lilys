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

1. Copia `content/posts/_plantilla.md` a `content/posts/mi-entrada.md`. El nombre del archivo es el *slug* y solo puede tener `a-z`, `0-9` y `-`.
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
3. Regenera el índice que usan la portada y el buscador:

   ```bash
   node scripts/build-index.mjs
   ```

La entrada queda en `post.html?p=mi-entrada`, y cada sección tiene su propio enlace: `index.html?section=math`.

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

- **jerga**: puntúa si un niño de 12 años entendería tu explicación.
- **hoja-feynman**: los 4 pasos del método. Se exporta como una entrada `.md` lista para `content/posts/`.

## Funciones

- **Buscador y filtros** en la portada (por título, tema, tags o palabras dentro de las entradas).
- **Subrayado**: selecciona texto en una entrada, elige color y añade notas. Todo se reúne en `subrayados.html`, desde donde se exporta a Markdown.
- **Lista de los 4 pasos Feynman** al final de cada entrada.
- **Idiomas EN / ES / DE** para la interfaz (`assets/js/i18n.js`).
- **Tema pastel / alto contraste**. El de alto contraste se activa solo si el sistema pide más contraste.
- **Foto de perfil = tu avatar de GitHub**: se vuelve a pedir cada 5 minutos y al volver a la pestaña, así que se actualiza sola. El usuario está en `GITHUB_USER` (`assets/js/data.js`). Si GitHub no responde, se muestra `assets/img/perfil.svg`.

> Los subrayados, las tareas y el progreso se guardan **solo en el navegador** de cada visitante.

## Estructura

```
index.html                portada: buscador, filtros y tarjetas
post.html?p=<slug>        una entrada
subrayados.html           mis subrayados
assets/css/tokens.css     colores y fuentes (el único sitio donde viven)
assets/css/base.css       reset y tipografía
assets/css/components.css piezas: cabecera, tarjetas, entrada, juegos, subrayado
assets/js/                theme · i18n · data · header · markdown · games · highlight · home · post · highlights-page
content/posts/*.md        entradas
content/index.json        índice generado
scripts/build-index.mjs   genera el índice
```

## Seguridad

Cada página tiene una *Content Security Policy*: solo carga scripts propios, estilos propios y Google Fonts, y no usa scripts en línea. El Markdown se convierte con un intérprete propio que crea los elementos uno a uno (sin `innerHTML`) y solo permite enlaces `http(s)`, `mailto` o relativos.

## Publicar en GitHub Pages

El workflow `.github/workflows/pages.yml` regenera el índice y publica en cada push a `main`. Antes hay que activar **Settings → Pages → Source: GitHub Actions**.
