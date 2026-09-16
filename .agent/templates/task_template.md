# Task Template

Use for a structured durable active task when a compact sentence in `TASKS.md` is insufficient. Detailed implementation mechanics belong in transient numbered `.artifacts/**` task files governed by `ARTIFACTS_WORKFLOW.md`, not here.

```markdown
## TASK-NNN — Title

- **Status:** planned | in-progress | blocked | review
- **Goal:** Concrete user-visible/runtime/repository outcome
- **Scope:** Stable approved behavior/path boundary
- **Primary owner:** Relevant `ARCH_INDEX.md` owner
- **Streams/runtime sides:** Affected stream(s)/host/container side(s), when relevant
- **Plan:** Reviewed implementation outline or transient artifact lineage when currently available
- **Completion evidence:** Concrete verifiable closure condition
- **Blocker / next gate:** Only when relevant
```

Rules:

- `TASKS.md` contains active approved executable work only.
- Do not put ideas or unresolved architecture debates here; use `TODO.md` / `OPEN_DECISIONS.md`.
- Do not duplicate full implementation plans, executor prompts, or execution reports into stable task state.
- Artifact paths are optional transient pointers, never authority; the stable task entry must remain understandable if `.artifacts/**` disappears.
- On completion, remove the active entry. Add a compact `TASKS_ARCHIVE.md` outcome/reference only when future agents benefit from knowing the task existed.
