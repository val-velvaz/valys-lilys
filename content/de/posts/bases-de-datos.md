---
title: Eine Datenbank ist eine Bibliothek
summary: Tabellen, Zeilen und Abfragen erklärt als Regale, Bücher und Bibliothekarinnen.
---

## Erklärt wie einem Kind

Eine Datenbank ist eine **sehr ordentliche Bibliothek**:

- jede **Tabelle** ist ein Regal zu einem Thema,
- jede **Zeile** ist ein Buch,
- jede **Spalte** ist eine Angabe zum Buch (Titel, Autorin, Jahr),
- und eine **Abfrage** (SQL) ist eine Bitte an die Bibliothekarin.

```sql
SELECT titel FROM buecher WHERE autorin = 'Ada Lovelace';
```

==Übersetzung: „Bibliothekarin, bringst du mir die Titel von Adas Büchern?“==

```flashcards
Tabelle :: Ein Regal mit Büchern derselben Art
Zeile :: Ein Buch
Spalte :: Eine Angabe, die jedes Buch hat (z. B. der Titel)
SQL-Abfrage :: Eine Bitte an die Bibliothekarin
```
