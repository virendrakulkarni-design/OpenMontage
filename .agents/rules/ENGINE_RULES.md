# OpenMontage Engine Rules & Coding Standards

Architectural invariants, coding conventions, and guardrails for all AI agents and developers modifying the OpenMontage engine.

---

## 1. Zero Story-Coupling Rule

- **Prohibition**: Never hardcode character names (e.g., "hare", "tortoise", "fox"), story scenarios (e.g., "river_crossing", "mountain_race"), or specific plotlines into TypeScript component names, file names, or Python utility scripts.
- **Enforcement**:
  - Components must accept generalized actor arrays: `actors?: StageActor[]`.
  - Canvases must accept environment descriptors: `environment?: PerspectiveStageCanvasProps`.
  - Scripts must be generic: `render_story_project.py` with `--props` and `--output` flags.

---

## 2. Remotion Strict TypeScript Standards

- **Forbidden**: Do not use CSS transitions (`transition: all 0.3s`) in Remotion components; they are non-deterministic during frame rendering. Use `spring()`, `interpolate()`, or frame-based sine waves.
- **Type Coherence**: Do not duplicate properties in the `Cut` interface in `Explainer.tsx`. All transition properties must use `TransitionType`.
- **Particle Unions**: `ParticleType` is strictly constrained to the union type defined in `ParticleOverlay.tsx`. Adding a new particle requires updating the union, switch statement, and deterministic renderer.

---

## 3. Verification Before Delivery Rule

Every modification to the rendering pipeline must pass:
1. `npx tsc --noEmit` $\to$ Exit code 0.
2. Render test of at least one project props file $\to$ Exit code 0.
3. Automated verification: `python scripts/verify_renders.py` $\to$ Output file exists and exceeds $>5\text{MB}$.

---

## 4. Absolute Zero Dead Code & Zero Unused Imports Rule (Ponytail Principle)

- **Absolute Utility**: Every line of code, imported package, and configuration field must be strictly necessary, actively invoked, and directly affect application behavior.
- **No Unused Imports**: Never leave unused imports, especially packages like `@remotion/google-fonts` whose module initialization executes network requests and triggers timeouts.
- **Zero Network Bottlenecks During Render**: Always use local system font stacks (`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`) for video typography. Video renders must never stall or fail due to external network latency.
- **Purge Obsolete Code**: Do not retain dead code, commented-out experiments, or unused props. Deletion over accumulation.
