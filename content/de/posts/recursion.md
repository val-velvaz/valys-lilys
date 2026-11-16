---
title: Rekursion erklärt mit Treppen
summary: Eine Funktion, die sich selbst aufruft, klingt nach Zauberei. Eigentlich ist es, als würdest du jemanden um Hilfe bitten, der genau wie du ist.
---

## Erklärt wie einem Kind

Du willst die Stufen einer sehr langen Treppe zählen. Du schummelst: Du zählst **eine** und sagst zu deinem Klon „zähl du den Rest“. Dein Klon macht dasselbe… bis jemand oben ankommt und sagt: „hier ist keine mehr übrig: **null**“. Dann zählt jeder Klon seine eine Stufe dazu, und die Antwort wandert die Treppe hinunter.

==Das ist Rekursion: ein großes Problem lösen, indem man dasselbe Problem in klein löst.==

```python
def zaehlen(stufen):
    if stufen == 0:      # Basisfall: keine Stufen mehr
        return 0
    return 1 + zaehlen(stufen - 1)  # eine + der Rest
```

## Die zwei Regeln

1. Ein **Basisfall**, der ohne Hilfe gelöst wird (sonst hören die Klone nie auf).
2. Ein **rekursiver Schritt**, der das Problem *kleiner* macht.

> [!WARNING]
> Wenn du den Basisfall vergisst, ruft sich die Funktion für immer selbst auf und Python beschwert sich mit `RecursionError`.

## Wiederhole mit Karteikarten

```flashcards
Was ist Rekursion? :: Ein Problem mit einer **kleineren** Version desselben Problems lösen.
Was ist der Basisfall? :: Der Fall, der gelöst wird, **ohne** die Funktion erneut aufzurufen.
Was passiert ohne Basisfall? :: Die Funktion ruft sich endlos auf → `RecursionError`.
Lieblingsanalogie :: Stufen zählen, indem man seinen Klon den Rest zählen lässt.
```

## Teste dich

```quiz
? Was braucht eine rekursive Funktion IMMER?
+ Einen Basisfall
- Eine for-Schleife
- Eine globale Variable
> Ohne Basisfall hört die Funktion nie auf, sich selbst aufzurufen.

? zaehlen(3) gibt zurück…
- 1
+ 3
- 0
> 1 + 1 + 1 + 0 = 3
```
