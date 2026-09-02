---
name: continuous-learning
description: Continuous learning and pattern extraction skill. Automatically extracts reusable development patterns, error resolutions, and user preferences into persistent rules and skills.
license: MIT
---

# Continuous Learning Skill

Inspired by `everything-claude-code`, this skill establishes how the system continuously learns from session interactions, bug fixes, and user feedback.

## What Triggers Pattern Extraction?

1. **User Corrections**: When the user corrects a behavior (e.g. *"code should not have storyname files"* or *"make them cinematic, not basic"*), immediately convert the correction into a permanent rule in `.agents/rules/ENGINE_RULES.md`.
2. **Error Resolution**: When a tricky bug is resolved (e.g. duplicate TypeScript declarations in `Explainer.tsx`, Windows cp1252 stdout reconfigure, Remotion deterministic pseudo-random seeds), document the fix so it is never repeated.
3. **Workflow Optimizations**: When an improved pipeline is discovered (e.g., universal render CLI, word-by-word highlighted captions, 2.5D perspective vanishing points), record the pattern in `.agents/skills/`.

## Extraction Protocol

At the conclusion of any major milestone or session:
1. Identify if any new reusable patterns emerged.
2. Check if the pattern is already documented.
3. If new, append to `.agents/memory/PROJECT_MEMORY.md` or create a focused skill under `.agents/skills/learned/`.
4. Ensure all future subagents read the learned rules before executing tasks.
