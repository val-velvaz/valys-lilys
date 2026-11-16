---
title: La recursión explicada con escaleras
date: 2026-11-09
tags: [python, algorithms, feynman]
summary: Una función que se llama a sí misma suena a magia. Es más bien como pedirle ayuda a alguien idéntico a ti.
emoji: 🪜
mood: emocionada
---

## Explicado como a un niño

Quieres contar los escalones de una escalera muy larga. Haces trampa: cuentas **uno** y le dices a tu clon "cuenta tú el resto". Tu clon hace lo mismo… hasta que alguien llega arriba y dice "aquí ya no quedan: **cero**". Entonces cada clon suma su uno y la respuesta baja la escalera.

==Eso es la recursión: resolver un problema grande usando el mismo problema, pero más pequeño.==

```python
def contar(escalones):
    if escalones == 0:      # caso base: ya no quedan
        return 0
    return 1 + contar(escalones - 1)  # uno + el resto
```

## Las dos reglas

1. Un **caso base** que se resuelve sin ayuda (si no, los clones nunca paran).
2. Un **paso recursivo** que hace el problema *más pequeño*.

> [!WARNING]
> Si olvidas el caso base, la función se llama para siempre y Python se queja con `RecursionError`.

## Repasa con tarjetas

```flashcards
¿Qué es la recursión? :: Resolver un problema usando una versión **más pequeña** del mismo problema.
¿Qué es el caso base? :: El caso que se resuelve **sin** volver a llamar a la función.
¿Qué pasa sin caso base? :: La función se llama infinitamente → `RecursionError`.
Analogía favorita :: Contar escalones pidiéndole a tu clon que cuente el resto.
```

## Ponte a prueba

```quiz
? ¿Qué necesita SIEMPRE una función recursiva?
+ Un caso base
- Un bucle for
- Una variable global
> Sin caso base, la función nunca deja de llamarse a sí misma.

? contar(3) devuelve…
- 1
+ 3
- 0
> 1 + 1 + 1 + 0 = 3
```
