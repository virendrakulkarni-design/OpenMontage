---
name: scene-composer
description: Master theatrical staging and spatial blocking skill. Orchestrates 3D depth planes (Z0-Z3), camera kinematics, vanishing-point perspective, lighting atmosphere, and scene transitions in Remotion and video pipelines.
license: MIT
---

# Scene Composer Skill

The **Scene Composer** translates narrative beats into visually stunning, cinematic spatial arrangements.

## The 4 Depth Planes (Z-Depth Staging)

Every cinematic scene must establish clear visual separation across 4 distinct spatial layers:

| Layer | Depth | Role | Visual Elements |
|---|---|---|---|
| **$Z_0$ (Sky & Infinity)** | Deep Background | Horizon & Time of Day | Clouds, mountains, sky gradient, sun flare |
| **$Z_1$ (Midground Stage)** | Running Path | Ground convergence & Track | Asphalt, river rapids, switchback stairs, rails |
| **$Z_2$ (Actor Plane)** | Center Action | Characters & Interactions | Cast shadows, character rigs, speech bubbles, SFX |
| **$Z_3$ (Foreground Frame)** | Near Camera | Immersion & Scale Occlusion | Blurred grass blades, spray droplets, dust, bokeh |

## Camera Kinematics Taxonomy

Never use static cameras for dynamic animation. Choose from 6 cinematic camera behaviors:

1. **Forward Tracking Zoom (`tracking`)**:
   - Camera moves alongside running/moving subjects.
   - Scale: $1.05\times \to 1.18\times$. Subtle vertical tracking with high-speed side streaks.
2. **Floating Orbit (`floating`)**:
   - Gentle sinusoidal floating over liquid or aerial environments.
   - Scale: $1.06\times \to 1.14\times$. Horizontal drift with water ripple distortion.
3. **Crane-Shot Ascent (`crane-up`)**:
   - Upward climbing camera tracking vertical ascents or mountain peaks.
   - Vertical translation: $+25\text{px} \to -35\text{px}$. Drifting clouds beneath the actor.
4. **Vertigo Drop (`vertigo-down`)**:
   - High-angle downward plunge conveying dizzying canyon or slope steepness.
   - Scale: $1.14\times \to 1.05\times$. Gravity streaks and dust kicked up.
5. **Slow Cinema Drift (`ken-burns`)**:
   - Smooth diagonal glide for contemplative, establishing, or takeaway shots.
6. **Lateral Sway (`sway`)**:
   - Rhythmic sway for dialogue exchanges or tension building.

## Scene Transition Guidelines

- **High-Energy Action $\to$ Climax**: Use `flash` transition (12 frames) with white bloom.
- **Narrative Progress / Scene Change**: Use `crossfade` (10-15 frames) with soft alpha dissolve.
- **Action Cut $\to$ Takeaway Card**: Use `zoom-wipe` (12 frames) scaling incoming card from $0.92\times$.
- **Fast-Paced Shorts**: Use `iris-wipe` for classic theatrical or animated transitions.
