---
name: memory-persistence
description: Memory persistence skill. Guides cross-session context loading, architecture invariant tracking, and state persistence in OpenMontage.
license: MIT
---

# Memory Persistence Skill

Inspired by `everything-claude-code`, this skill ensures that architectural rules, user preferences, and project decisions persist reliably across restarts and conversation truncation checkpoints.

## The Memory File Hierarchy

```
.agents/
├── memory/
│   └── PROJECT_MEMORY.md       # Core invariants, architecture decisions, user preferences
├── rules/
│   └── ENGINE_RULES.md         # Strict coding standards, zero story coupling, TypeScript rules
└── skills/
    ├── strategic-compact/      # Compaction protocols
    └── continuous-learning/    # Pattern extraction protocols
```

## Session Bootstrapping Protocol

At the start of any new session or after a context checkpoint:
1. **Read Project Memory**: View `.agents/memory/PROJECT_MEMORY.md` to restore architectural invariants.
2. **Review Engine Rules**: View `.agents/rules/ENGINE_RULES.md` to avoid introducing regressions.
3. **Check Active Task**: View `task.md` to see current work in flight.
4. **Proceed with Execution**: Adhere strictly to the established conventions without needing the user to re-explain their preferences.
