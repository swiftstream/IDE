---
name: documentation-sync
description: Synchronize only durable Swift Stream IDE governance, architecture, navigation, decisions, work state, debt, and routing facts that actually changed.
---

# Documentation Sync

Use when a task changes durable repository knowledge.

## Principle

Documentation is self-maintaining, but updates are ownership-driven rather than ceremonial. Change only the stable documents whose owned facts, invariants, decisions, debt, ideas, task state, validation policy, or navigation actually changed.

## Checklist

- Architecture boundary changed -> update its single owning chunk; update `ARCH_INDEX.md` only if IDs/ownership/routing changed.
- New architecture owner -> use `templates/architecture_chunk_template.md`, then verify its IDs have exactly one owner and routing remains focused.
- Durable source locations/roles materially changed -> update `SOURCE_MAP.md`.
- A durable current-state fact useful beyond immediate source inspection changed -> update `PROJECT_MEMORY.md`.
- A genuine unresolved choice appeared/resolved -> update `OPEN_DECISIONS.md`; when resolved, move the durable rule to its stable owner.
- A maintainer-approved future idea is worth retaining -> update `TODO.md`.
- Verified debt appeared/resolved -> update `TECH_DEBT.md`.
- Active executable task state changed -> update `TASKS.md`; use `templates/task_template.md` when a structured stable task entry is appropriate.
- A completed task is worth remembering for future agents -> add only a compact outcome/reference to `TASKS_ARCHIVE.md`, not an execution diary.
- Operational skill routing changed -> update `SKILL_INDEX.md`.
- Top-level authority/context/workflow changed -> update root `AGENTS.md` and the relevant stable owner.
- Execution-environment bindings changed -> update only transient `.artifacts/**`; never promote concrete model/agent/tool/plugin/app/local-agent names into stable governance.

Before finishing, verify relevant links resolve, removed docs are no longer referenced, architecture IDs still have one owner, and stable docs contain no transient execution-environment leakage.
