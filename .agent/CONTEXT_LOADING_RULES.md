# Context Loading Rules

Mandatory progressive-loading discipline for Swift Stream IDE agents.

## Default Budget

For normal work:

- load **1 primary architecture owner**;
- load **at most 2 supporting architecture owners** when genuinely needed;
- load **at most 1 operational skill** by default;
- inspect the **smallest relevant source/config/test subset**;
- external dependency/reference repositories are **0 by default**.

Do not bulk-load `.agent/architecture/**`, `.agent/skills/**`, all stream folders, or external repositories.

## Loading Sequence

1. Read root `AGENTS.md`.
2. For non-trivial iterative work, load `DEVELOPMENT_ORCHESTRATION.md` and `ARTIFACTS_WORKFLOW.md`. These do not consume architecture-owner slots. If the current step requires delegated execution or independent audit, also load the transient `.artifacts/ENVIRONMENT.md` binding when it exists; if it is absent/incomplete/stale, follow `ARTIFACTS_WORKFLOW.md` and ask the maintainer for the current concrete environment/workflow/tooling/model/local-agent binding rather than guessing.
3. Use `ARCH_INDEX.md` to identify the primary architecture owner.
4. Load that owner.
5. Add at most two supporting owners only when the task crosses their boundaries.
6. Load `STYLE_GUIDELINES.md` for production/test/config/template edits and `TESTING_RULES.md` when validation/test design is relevant. Policy docs do not consume architecture slots.
7. Use `SOURCE_MAP.md` before broad source discovery; inspect exact source/config/assets/tests needed by the task.
8. Use `SKILL_INDEX.md` only when a concrete operational procedure applies.
9. Route external dependency/reference research through `REFERENCE_PROJECTS.md` only when needed. Stable docs may not rely on persisted machine-local checkout paths.
10. Stop loading once ownership, scope, and required evidence are clear.

## Stream Scope Is Supporting Context, Not a Separate Documentation Tax

Determine affected stream(s) from the actual task/source. Do not load every stream merely because the base `Stream` class is involved.

- Shared-runtime work normally loads the shared owner plus only stream implementations needed to prove compatibility.
- One-stream work loads that stream's source plus supporting shared owner(s) it actually uses.
- Multi-stream work may sample or inspect all affected stream implementations when necessary to prove a shared contract, but architecture-owner count still reflects conceptual owners rather than number of directories.

## Generated-Project Tasks

For generator/template changes, load the project-generation owner and only the stream-specific template/config branches affected. Add devcontainer/toolchain or asset/schema owners only if those contracts change.

Do not inspect generated consumer projects as stable architecture authority. Use them as validation evidence.

## Cross-Cutting Exception

Governance rebuilds, architecture migrations, complete source-map audits, and other genuinely cross-cutting reviews may exceed the normal budget deliberately. State why, inspect systematically, then restore focused progressive loading for ordinary follow-up work.

The budget is a discipline against irrelevant context, not permission to ignore a clearly relevant owner.

