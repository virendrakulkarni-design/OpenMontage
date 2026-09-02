---
name: procedural-animation-specialist
description: Master programmatic and procedural animation skill. Directs Remotion 2.5D perspective mathematics, vanishing points, continuous parallax velocity, spring physics, and cel-shaded character rigs.
license: MIT
---

# Procedural Animation Specialist Skill

The **Procedural Animation Specialist** governs programmatic rendering in Remotion, creating fluid, real-time-interpolated 2.5D visual experiences without relying solely on heavy AI video generation.

## 2.5D Perspective Projection Engine

The core geometry of the stage canvas relies on a 1-point central perspective system:
- **Horizon Level ($Y_H$)**: Typically $42\%$ to $48\%$ of vertical height ($1920\text{px}$).
- **Vanishing Point ($X_{VP}, Y_{VP}$)**: Screen center ($540\text{px}, 860\text{px}$).
- **$Z$-Depth Scaling**:
  $$\text{Scale}(Z) = \text{Scale}_{\min} + (1 - Z) \cdot (\text{Scale}_{\max} - \text{Scale}_{\min})$$
  Where $Z \in [0, 1]$ represents normalized distance from camera ($Z=0$ is nearest foreground, $Z=1$ is vanishing horizon).

## Continuous Parallax Math

Multi-layer continuous scrolling must adhere to strict relative velocity ratios to maintain physical depth:

```
Foreground Speed Streaks: 2.5x base velocity
Running Track / Surface: 1.0x base velocity
Midground River / Trees:  0.4x base velocity
Distant Mountain Ridge:  0.1x base velocity
Sky / Celestial Dome:    0.02x base velocity
```

## Physics-Driven Springs in Remotion

Never use linear CSS transitions. All motion uses Remotion `spring()`:
- **Dramatic Title Entrance**: `damping: 14, stiffness: 90, mass: 1.0`
- **Action SFX Burst**: `damping: 10, stiffness: 140, mass: 0.8` (snappy punch with overshoot)
- **Speech Bubble Pop**: `damping: 12, stiffness: 120, mass: 0.9`
- **Character Run Bob**: Sine cycle keyed to `(frame / fps) * Math.PI * 8`
- **Natural Breathing**: Sine cycle keyed to `(frame / fps) * Math.PI * 3`

## Ground Cast Shadows
Every grounded actor must emit an elliptical cast shadow:
```tsx
width: 160 * actorScale,
height: 36 * actorScale,
borderRadius: "50%",
background: "radial-gradient(ellipse at center, rgba(15, 23, 42, 0.65) 0%, rgba(15, 23, 42, 0.2) 60%, transparent 100%)",
filter: "blur(4px)"
```
When an actor jumps or celebrates, the shadow expands in width and drops in opacity, physically anchoring the character to the stage floor.
