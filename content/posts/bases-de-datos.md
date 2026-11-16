---
title: Una base de datos es una biblioteca
section: cs
date: 2026-11-07
tags: [databases, feynman]
summary: Tablas, filas y consultas explicadas como estanterías, libros y bibliotecarias.
emoji: 📚
---

## Explicado como a un niño

Una base de datos es una **biblioteca muy ordenada**:

- cada **tabla** es una estantería con un tema,
- cada **fila** es un libro,
- cada **columna** es un dato del libro (título, autora, año),
- y una **consulta** (SQL) es pedirle algo a la bibliotecaria.

```sql
SELECT titulo FROM libros WHERE autora = 'Ada Lovelace';
```

==Traducción: "bibliotecaria, ¿me traes los títulos de los libros de Ada?"==

```flashcards
Tabla :: Una estantería con libros del mismo tipo
Fila :: Un libro
Columna :: Un dato que tienen todos los libros (p. ej. el título)
Consulta SQL :: Una petición a la bibliotecaria
```
