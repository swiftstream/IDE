# Swift Stream IDE — Agent Governance

## Repository Identity

Swift Stream IDE is a VS Code extension and project-development platform for Swift outside the traditional Xcode-only workflow. It combines extension UI/runtime behavior, containerized Swift environments, project generation, toolchain selection, build/run/debug flows, and optional stream-specific integrations.

Current stream families represented in source are:

- `web`
- `server`
- `android`
- `embedded`
- `pure`

Do not describe a stream, platform, feature, toolchain, or deployment integration as supported merely because a placeholder, asset, TODO, dormant class, or commented registration exists. Current implementation facts come from actual source/configuration plus validation evidence.

## Repository Layout

- `AGENTS.md` — concise governance entrypoint and router.
- `.agent/` — durable governance, architecture, source navigation, work-state routing, and focused operational skills.
- `.artifacts/` — disposable Git-ignored research, plans, execution evidence, reviews, corrections, verification, and chat handoff.
- `src/` — TypeScript production source and VS Code-hosted tests.
- `assets/` — extension media/docs plus project/devcontainer source inputs copied or rendered into generated projects.
- `features/` — source/package material for Dev Container Features.
- `docker-images/` — source/build contexts for Swift Stream container images.
- `schemas/` — JSON schemas contributed by the extension.
- `package.json` — VS Code declarative surface, scripts, extension metadata, and package dependencies.
- `toolchains.json` — repository toolchain catalog consumed by `src/toolchain.ts` and devcontainer generation.

Generated consumer-project files are outputs. They are not repository architecture authority and should not be edited as a substitute for fixing their owning generator/template/config source.

## Authority Hierarchy

When stable documents conflict, higher authority wins:

1. `.agent/SYSTEM_RULES.md` — global invariants and source-of-truth rules.
2. `.agent/WORKFLOW.md`, `.agent/DEVELOPMENT_ORCHESTRATION.md`, `.agent/ARTIFACTS_WORKFLOW.md`, `.agent/COMMIT_RULES.md` — development, delegation, transient-memory, and Git workflow.
3. `.agent/ARCH_INDEX.md` plus the owning `.agent/architecture/*.md` chunk — technical architecture authority.
4. `.agent/STYLE_GUIDELINES.md` and `.agent/TESTING_RULES.md` — implementation and validation policy within architecture boundaries.
5. `.agent/MASTER_PLAN.md` — durable product/roadmap boundary; it may distinguish current facts from reviewed future direction but never overrides implementation reality.
6. `.agent/OPEN_DECISIONS.md` — unresolved choices only.
7. `.agent/PROJECT_MEMORY.md` and `.agent/SOURCE_MAP.md` — durable current-state and navigation facts.
8. `.agent/TASKS.md`, `.agent/REGRESSIONS.md`, `.agent/TODO.md`, `.agent/TECH_DEBT.md`, `.agent/TASKS_ARCHIVE.md` — active work, verified regressions, future ideas, debt, and compact history.
9. `.agent/REFERENCE_PROJECTS.md`, `.agent/CONTEXT_LOADING_RULES.md`, `.agent/SKILL_INDEX.md`, `.agent/skills/**`, `.agent/templates/**` — evidence routing and operational guidance.

`.artifacts/**` is transient evidence/working memory and never outranks stable repository authority.

## Mandatory Workflow

Non-trivial work follows **PLAN -> IMPLEMENT -> AUDIT**.

- PLAN from current Git/source/stable governance, not remembered chat state.
- IMPLEMENT only the reviewed scope and preserve unrelated user work.
- AUDIT actual source/diff/Git and required behavior evidence independently of the implementation report.
- If implementation invalidates a material assumption, stop that path and re-plan rather than silently widening scope.
- Large or multi-behavior work is decomposed into numbered surgical `.artifacts/**` tasks with explicit path allowlists, verification, completion evidence, and stop conditions.
- Executor reports are evidence, never proof.

Small typo/format-only work may skip a formal artifact plan, but scope and final diff still require verification.

For non-trivial iterative work, load `.agent/DEVELOPMENT_ORCHESTRATION.md` and `.agent/ARTIFACTS_WORKFLOW.md`.

## Execution Environment Binding

Stable governance defines roles and capability boundaries abstractly. Concrete model names, agent names, repository-access tools, plugins/apps, local execution-agent names, and current stop/fallback details are transient environment bindings and belong only in `.artifacts/**`.

For non-trivial delegated execution or independent audit:

- the coordinator/reviewer uses the currently bound trusted repository tool surface for repository-local work and does not silently substitute another local-access mechanism contrary to the active binding;
- genuine capability gaps are delegated to the currently bound execution-capable environment rather than bypassed locally;
- independent audit uses a separate reviewer/session according to the active binding and its stop/recovery policy;
- implementation/execution uses the bound local executor and surgical sequential task waves instead of one large ambiguous prompt;
- detailed executor/auditor prompts and the user-facing mini-prompt may include the concrete transient names from the active artifact binding.

Load `.agent/DEVELOPMENT_ORCHESTRATION.md` and `.agent/ARTIFACTS_WORKFLOW.md` for the abstract role rules and transient-binding mechanics. If the current `.artifacts/**` environment binding is absent or stale, ask the maintainer to confirm the current environment/workflow/tooling/model/local-agent assignments before preparing substantial delegated/audit prompts; do not guess them.

## Architecture Routing

Use `.agent/ARCH_INDEX.md` to find the one primary owner for the behavior being changed. Stream names are an important scope dimension, but they are not themselves the complete architecture: a change may primarily belong to extension lifecycle, process/build runtime, project generation, devcontainer/toolchains, feature integrations, VS Code surface, assets/schemas, or Docker images.

Default context budget:

- 1 primary architecture owner;
- at most 2 supporting architecture owners when genuinely needed;
- at most 1 operational skill by default;
- the smallest relevant source/test/config subset, located through `.agent/SOURCE_MAP.md`.

Cross-cutting governance/architecture audits may deliberately exceed this budget. See `.agent/CONTEXT_LOADING_RULES.md`.

## Stream and Generated-Output Safety

- Do not leak stream-specific behavior into shared runtime merely to avoid a small amount of local code.
- Do not duplicate truly shared behavior separately across streams when `Stream`, shared helpers, or another existing shared owner is the correct authority.
- A multi-stream change must identify which behavior is genuinely common and which behavior remains stream-specific.
- Treat `.devcontainer/devcontainer.json`, generated `Package.swift`, generated Gradle/project files, copied Dockerfiles, generated Swift/JS/HTML/CSS, and other consumer-project output as generated state when produced by the IDE. Fix the source generator/template/catalog unless the task is explicitly about importing or supporting hand-authored consumer configuration.
- Changes to generator source require representative generated-output verification for every affected branch/stream; source compilation alone is not sufficient evidence.

## Documentation Self-Maintenance

- Stable docs describe verified current implementation or reviewed durable rules, not debugging history.
- Each architecture ID has exactly one owner. Routers link to owners instead of restating full rules as competing authority.
- When ownership, routing, durable source locations, current product facts, or unresolved decisions change, update the affected stable owner in the same accepted change.
- Do not touch unrelated docs merely because a generic checklist exists.
- Machine-local reference checkout paths, tool context IDs, transient commit hashes, and execution diaries belong only in `.artifacts/**`.

## Git Safety

Follow `.agent/COMMIT_RULES.md`.

IDE has **no standing authorization to stage, commit, push, amend, rebase, reset, restore, clean, stash, or rewrite history**. Preserve unrelated staged, unstaged, and untracked work. Staging/commit/push require explicit maintainer authorization for the intended scope.

## Task / Decision State

- `TASKS.md` contains active approved executable work that must survive chat/artifact loss.
- `REGRESSIONS.md` contains verified current product regressions that violate previously accepted/expected behavior and are not yet closed.
- Completed tasks enter `TASKS_ARCHIVE.md` only as compact outcomes/references when future agents benefit from knowing the task existed.
- Durable current implementation facts belong in `PROJECT_MEMORY.md` only when useful beyond immediate source/Git inspection.
- Unresolved choices belong in `OPEN_DECISIONS.md`; when resolved, move the durable rule to its real stable owner rather than leaving a dead decision record as authority.
- Low-priority future ideas belong in `TODO.md`; verified intentionally retained implementation debt belongs in `TECH_DEBT.md`.
- Detailed execution mechanics, evidence, prompts, environment bindings, and temporary blockers belong in `.artifacts/**`, not these stable ledgers.

## External Evidence

Route dependency/source/style/governance research through `.agent/REFERENCE_PROJECTS.md` only when it is needed. Stable IDE governance must remain portable and must not require another machine-local checkout or transient execution environment to exist.

