---
title: Wie ich diese Seite gebaut habe
summary: HTML, CSS und JavaScript ohne Frameworks oder externe Skripte. Alle Inhalte stehen in Markdown-Dateien.
---

## Die Idee

Eine einfache Seite: eine Startseite mit Suche, Bereichsfiltern und Karten, und eine Seite pro Beitrag. Zwei Designs, **Pastell** und **hoher Kontrast**, und die Oberfläche auf Englisch, Spanisch und Deutsch.

## Wie es funktioniert

| Teil | Datei |
| --- | --- |
| Farben und Schriften | `assets/css/tokens.css` |
| Startseite: Suche, Filter und Karten | `assets/js/home.js` |
| Markdown → Seite | `assets/js/markdown.js` |
| Spiele | `assets/js/games.js` |
| Markierungen | `assets/js/highlight.js` |
| Beitragsindex | `scripts/build-index.mjs` |

Jeder Beitrag ist eine `.md`-Datei in `content/<sprache>/posts/` mit *Front Matter*:

```markdown
---
title: Mein Beitrag
section: cs
date: 2026-11-15
tags: [python, feynman]
summary: Ein Satz, der ihn zusammenfasst.
emoji: 🌸
---

Hier kommt der Inhalt ✿
```

Danach baut `node scripts/build-index.mjs` den Index neu, den die Startseite und die Suche verwenden.

> [!NOTE]
> Aus Sicherheitsgründen lädt die Seite keine Skripte von anderen Seiten: Markdown wird von einem eigenen Parser in HTML umgewandelt, der nie `innerHTML` benutzt.
