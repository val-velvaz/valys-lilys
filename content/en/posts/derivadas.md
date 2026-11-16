---
title: The derivative is a speedometer
summary: Forget limits for a moment. A derivative tells you how fast something is changing right now.
---

## The idea in one sentence

==The derivative is what the speedometer shows: how fast something is changing **at this very moment**.==

When you're driving, your position changes over time. The speedometer doesn't tell you where you are, but **how fast** your position is changing. That's the derivative of position.

## And the formula?

Measure how much you change over a very, very short moment:

```text
speed ≈ (where I am after − where I was) / (time that passed)
```

When that "short moment" gets close to zero, you get the *exact* speed at that instant. Mathematicians write it like this: `f'(x) = lim (f(x+h) − f(x)) / h`.

| If the function… | the derivative is… | Analogy |
| --- | --- | --- |
| goes up | positive | gas pedal |
| goes down | negative | reverse gear |
| is flat | zero | parked car |

> [!FEYNMAN]
> My gap: at first I didn't understand *why* h goes to zero. The speedometer analogy solved it: I want the speed **now**, not the average of the whole trip.

```quiz
? If a function is going up, its derivative is…
+ positive
- negative
- zero

? The derivative of a constant function (f(x) = 5) is…
- 5
+ 0
- 1
> A parked car doesn't change position: speed zero.
```
