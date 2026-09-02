---
name: video-production-specialist
description: Master AI video generation skill. Directs diffusion video models (Wan, Kling, LTX-Video, Minimax, SVD), controlling temporal consistency, motion vectors, camera motion syntax, and frame rate conversion.
license: MIT
---

# Video Production Specialist Skill

The **Video Production Specialist** drives AI video generation tools to produce fluid, temporally consistent video sequences.

## Generation Model Selection Matrix

| Model | Strengths | Ideal Use Case | Motion Prompting Tip |
|---|---|---|---|
| **Wan 2.1** | High physical realism, crisp textures, fast generation | Realistic scenes, physics, liquid | Use exact physical verbs: *splashing*, *tumbling*, *sprinting* |
| **Kling Official** | Long coherency (up to 10s), complex multi-actor motion | Character interactions, athletic strides | Specify camera direction: *camera tracking right to left* |
| **LTX-Video** | Real-time generation, low VRAM footprint | Fast iteration, concept exploration | Keep prompts under 40 words; focus on primary subject action |
| **Minimax (Hailuo)** | Cinematic lighting, expressive character faces | Dramatic close-ups, emotional dialogue | Describe micro-expressions: *smirking*, *panting*, *widening eyes* |

## Motion Vector & Camera Prompting Syntax

When prompting video generation models, always structure prompts in 3 distinct clauses:

```
[Subject & Micro-Action] + [Camera Path & Lens Movement] + [Lighting & Environmental Atmosphere]
```

### Examples:
- **Athletic Sprint**:
  `A determined athletic cartoon hare running full speed along an asphalt raceway, legs blurred in high-speed cycle, camera tracking forward alongside runner at 45 MPH, golden sunlight casting long diagonal shadows, warm dust motes floating in air.`
- **Liquid Physics**:
  `A courageous cartoon tortoise swimming through turbulent crystal-clear mountain river rapids, water splashing into droplets, camera floating low just above water surface, sunlight reflecting off turbulent waves.`

## Temporal Consistency Best Practices
1. **Seed Anchoring**: Keep seed locked between consecutive shots of the same scene.
2. **First-Frame Conditioning**: Feed the approved high-resolution still image from the Photo Specialist as the starting frame ($I_0$).
3. **Motion Intensity**: Keep motion amplitude between $0.4$ and $0.75$ to avoid severe morphing or hallucinated limbs.
