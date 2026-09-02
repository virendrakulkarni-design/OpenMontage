# OpenMontage Project Memory

Persistent architectural memory, established design decisions, and learned user preferences across sessions. (Inspired by `everything-claude-code` memory persistence pattern).

---

## 1. Architectural Invariants (DO NOT VIOLATE)

1. **Story-Agnostic Engine Core**:
   - **Never** name engine components, scripts, or exports after specific stories or characters (e.g., no `CartoonRaceScene`, no `HareCharacter`, no `generate_all_race_animations.py`).
   - Use universal components:
     - `DynamicStoryScene.tsx` (theatrical staging with $N$ actors)
     - `PerspectiveStageCanvas.tsx` (configurable 2.5D perspective ground plate)
     - `DynamicCharacterRig.tsx` (universal image or procedural vector rig)
     - `SceneTransition.tsx` (crossfade, zoom-wipe, slide, iris-wipe, flash)
     - `CinematicOverlay.tsx` (letterbox bars, film grain, light leak)
     - `CaptionOverlay.tsx` (word-by-word highlight with scale pop & neon glow)
   - Specific stories, character names, and dialogue belong **exclusively in project JSON props** under `projects/` or `public/demo-props/`.

2. **Visual & Aesthetic Standard**:
   - **No Flat 2D Geometry**: Backgrounds must use high-resolution photo-rendered plates or 3D environments with 1-point vanishing perspective convergence.
   - **Ground Anchoring**: All grounded characters must emit an elliptical cast shadow with dynamic $Z$-depth scaling.
   - **Continuous Motion**: Background elements, particles, and ground speed lines must stream continuously to convey genuine velocity.
   - **Cinematic Overlays**: Every scene must feature letterbox bars ($4.5\%$), organic film grain ($3\%$), and warm light leak corner accents.

3. **Subagent Specialization**:
   - Creative workflows are divided among dedicated subagents:
     - `executive-producer`: Master pipeline orchestrator.
     - `story-architect`: Narrative arcs, dialogue, and beat sheets.
     - `prompt-variation-specialist`: Multi-angle, lighting, and style prompt variations.
     - `scene-director`: Translates story beats into Remotion scene cut JSON descriptors.
     - `tools-selector`: Dynamically evaluates models, APIs, and rendering toolchains.
     - `character-stylist`: Enforces character visual consistency and custom image cutouts.
     - `quality-auditor`: Pre- and post-render verification gates.

---

## 2. Rendering & Code Conventions

- **Default Format**: 9:16 vertical video ($1080 \times 1920$) at $30\text{ fps}$.
- **Typography**: Space Grotesk (`@remotion/google-fonts/SpaceGrotesk`).
- **Universal Render CLI**: `python scripts/render_story_project.py --props <path_to_json> --output <path_to_mp4>`.
- **Verification Command**: `python scripts/verify_renders.py`.
- **TypeScript Integrity**: `cd remotion-composer && npx tsc --noEmit` must pass with 0 errors before any render.

---

## 3. Learned User Preferences

- **Automated Intelligence**: The app must automatically enrich basic user prompts into stunning, broadcast-grade visuals. The user should never have to manually engineer complex technical prompts.
- **Cinematic Word Highlighting**: Captions should pop and glow sequentially word-by-word with TikTok/Shorts-grade visual engagement.
- **Character Consistency**: Support user-uploaded character images with automated cutout rigging and persistent styling across all scenes.
