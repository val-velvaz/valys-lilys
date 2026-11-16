---
title: Die Ableitung ist ein Tacho
summary: Vergiss die Grenzwerte für einen Moment. Eine Ableitung sagt dir, wie schnell sich etwas genau jetzt verändert.
---

## Die Idee in einem Satz

==Die Ableitung ist das, was der Tacho anzeigt: wie schnell sich etwas **in diesem Moment** verändert.==

Wenn du Auto fährst, ändert sich deine Position mit der Zeit. Der Tacho sagt dir nicht, wo du bist, sondern **wie schnell** sich deine Position ändert. Das ist die Ableitung der Position.

## Und die Formel?

Miss, wie sehr du dich in einem ganz, ganz kurzen Augenblick veränderst:

```text
Geschwindigkeit ≈ (wo ich danach bin − wo ich vorher war) / (vergangene Zeit)
```

Wenn dieser „Augenblick“ fast null wird, bekommst du die *genaue* Geschwindigkeit des Moments. Mathematiker schreiben das so: `f'(x) = lim (f(x+h) − f(x)) / h`.

| Wenn die Funktion… | ist die Ableitung… | Analogie |
| --- | --- | --- |
| steigt | positiv | Gaspedal |
| fällt | negativ | Rückwärtsgang |
| flach ist | null | stehendes Auto |

> [!FEYNMAN]
> Meine Lücke: Am Anfang verstand ich nicht, *warum* h gegen null geht. Die Tacho-Analogie hat es gelöst: Ich will die Geschwindigkeit von **jetzt**, nicht den Durchschnitt der Fahrt.

```quiz
? Wenn eine Funktion steigt, ist ihre Ableitung…
+ positiv
- negativ
- null

? Die Ableitung einer konstanten Funktion (f(x) = 5) ist…
- 5
+ 0
- 1
> Ein stehendes Auto ändert seine Position nicht: Geschwindigkeit null.
```
