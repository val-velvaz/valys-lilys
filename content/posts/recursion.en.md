---
title: Recursion explained with stairs
tags: [python, algorithms, feynman]
summary: A function that calls itself sounds like magic. It's more like asking someone identical to you for help.
---

## Explained like to a kid

You want to count the steps of a very long staircase. You cheat: you count **one** and tell your clone "you count the rest". Your clone does the same… until someone reaches the top and says "there are none left here: **zero**". Then every clone adds its one and the answer comes back down the stairs.

==That is recursion: solving a big problem using the same problem, only smaller.==

```python
def count(steps):
    if steps == 0:      # base case: nothing left
        return 0
    return 1 + count(steps - 1)  # one + the rest
```

## The two rules

1. A **base case** that is solved without help (otherwise the clones never stop).
2. A **recursive step** that makes the problem *smaller*.

> [!WARNING]
> If you forget the base case, the function calls itself forever and Python complains with `RecursionError`.

## Review with cards

```flashcards
What is recursion? :: Solving a problem using a **smaller** version of the same problem.
What is the base case? :: The case that is solved **without** calling the function again.
What happens without a base case? :: The function calls itself forever → `RecursionError`.
Favorite analogy :: Counting steps by asking your clone to count the rest.
```

## Test yourself

```quiz
? What does a recursive function ALWAYS need?
+ A base case
- A for loop
- A global variable
> Without a base case, the function never stops calling itself.

? count(3) returns…
- 1
+ 3
- 0
> 1 + 1 + 1 + 0 = 3
```
