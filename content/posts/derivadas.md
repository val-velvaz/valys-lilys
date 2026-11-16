---
title: La derivada es un velocímetro
section: math
date: 2026-11-05
tags: [calculo, feynman]
summary: Olvida los límites por un momento. Una derivada te dice qué tan rápido cambia algo justo ahora.
emoji: 🏎
---

## La idea en una frase

==La derivada es lo que marca el velocímetro: qué tan rápido cambia algo **en este instante**.==

Si vas en coche, la posición cambia con el tiempo. El velocímetro no te dice dónde estás, sino **qué tan rápido** cambia tu posición. Eso es la derivada de la posición.

## ¿Y la fórmula?

Mide cuánto cambias en un ratito muy, muy pequeño:

```text
velocidad ≈ (dónde estoy después − dónde estaba) / (tiempo que pasó)
```

Cuando ese "ratito" se hace casi cero, obtienes la velocidad *exacta* del momento. Los matemáticos lo escriben así: `f'(x) = lim (f(x+h) − f(x)) / h`.

| Si la función… | La derivada es… | Analogía |
| --- | --- | --- |
| sube | positiva | acelerador |
| baja | negativa | marcha atrás |
| está plana | cero | coche parado |

> [!FEYNMAN]
> Mi laguna: al principio no entendía *por qué* h tiende a cero. La analogía del velocímetro me lo resolvió: quiero la velocidad de **ahora**, no la media del viaje.

```quiz
? Si una función está subiendo, su derivada es…
+ positiva
- negativa
- cero

? La derivada de una función constante (f(x) = 5) es…
- 5
+ 0
- 1
> Un coche parado no cambia de posición: velocidad cero.
```
