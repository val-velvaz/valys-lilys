---
title: A database is a library
summary: Tables, rows and queries explained as shelves, books and librarians.
---

## Explained like to a kid

A database is a **very tidy library**:

- each **table** is a shelf about one topic,
- each **row** is a book,
- each **column** is a piece of data about the book (title, author, year),
- and a **query** (SQL) is asking the librarian for something.

```sql
SELECT title FROM books WHERE author = 'Ada Lovelace';
```

==Translation: "librarian, could you bring me the titles of Ada's books?"==

```flashcards
Table :: A shelf of books of the same kind
Row :: One book
Column :: A piece of data every book has (e.g. the title)
SQL query :: A request to the librarian
```
