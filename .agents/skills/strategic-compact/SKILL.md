---
name: strategic-compact
description: Strategic context compaction skill. Guides when and how to compact conversation context at logical milestone boundaries rather than arbitrary token overflow.
license: MIT
---

# Strategic Compact Skill

Inspired by `everything-claude-code`, this skill establishes best practices for **strategic context compaction** to maintain optimal LLM reasoning, reduce latency, and prevent critical context loss during long production sessions.

## The Context Degradation Problem

Automatic compaction triggers arbitrarily when context limits are reached, frequently:
- Cutting off mid-task during delicate multi-file edits.
- Discarding foundational architecture decisions made in early prompts.
- Causing hallucinated regressions because prior file contents were purged.

## The Strategic Compaction Protocol

Compact context intentionally at **logical task boundaries**:

```
[Phase 1: Research & Discovery]
       │
       ▼ (Strategic Compact: summarize findings, discard raw exploratory outputs)
[Phase 2: Architecture & Implementation Plan]
       │
       ▼ (User Approval Gate)
[Phase 3: Multi-File Execution]
       │
       ▼ (Strategic Compact: prune intermediate diffs & command logs, retain completed files)
[Phase 4: Verification & Delivery]
```

## Compaction Best Practices

1. **Before Compacting**:
   - Write all critical state and decisions to persistent files:
     - Project memory: `.agents/memory/PROJECT_MEMORY.md`
     - Task tracking: `task.md`
     - Summary of changes: `walkthrough.md`
2. **What to Discard**:
   - Large raw terminal command outputs (e.g. hundreds of lines of render progress logs).
   - Temporary JSON schemas and scratchpad code.
   - Truncated file reads that have already been incorporated.
3. **What to Retain**:
   - The user's exact goal and style directives.
   - The architecture and component contracts.
   - The file paths of newly created and modified files.
   - Verification status and test results.
