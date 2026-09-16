# Artifacts Workflow

Stable authority for how Swift Stream IDE uses transient `.artifacts/**` working memory during research, planning, implementation, correction, review, verification, and chat handoff.

Artifact contents never outrank `AGENTS.md` or stable `.agent/**` authority.

## Core Principle

`.artifacts/**` is disposable working memory.

It may be deleted, missing on another machine, unavailable in a clean clone, or intentionally rebuilt. Therefore:

- `.artifacts/` is Git-ignored;
- stable architecture/workflow must not depend on artifacts existing;
- plans/reports/prompts/task files are evidence and execution instructions, not permanent product authority;
- after accepted durable changes, promote only the lasting fact/rule to its stable `.agent/**` owner;
- if artifacts disappear, reconstruct current context from stable governance + Git + source/configuration and never invent lost historical evidence.

## Mandatory Use for Non-Trivial Iterative Work

Use artifacts when work is substantial enough that research, planning, execution details, or evidence should not live only in one chat context.

Preferred lifecycle:

```text
restore repository context
-> focused research
-> research evidence
-> implementation plan
-> independent plan audit when warranted
-> numbered surgical tasks
-> sequential executor work + append-only reports
-> independent source/diff/Git/output audit
-> focused correction tasks when needed
-> re-validation/re-audit
-> durable-doc synchronization
-> separately authorized Git gate
```

Do not create empty artifacts just to satisfy ceremony.

## One Active Lineage Rule

Keep one clearly active research/plan/task lineage for the current substantial objective.

When a maintainer-approved course correction invalidates an old lineage, remove or compact obsolete task packages instead of leaving multiple plausible executor entry points. Preserve only the smallest rationale/evidence still useful to explain the discarded direction.

## Recommended Structure

Use only directories needed by the current work:

```text
.artifacts/
├── ENVIRONMENT.md
├── NEW_CHAT.md
├── planning/
│   └── <work-slug>/
│       ├── RESEARCH_REPORT.md
│       ├── IMPLEMENTATION_PLAN.md
│       └── PLAN_AUDIT.md
├── implementation/
│   └── <work-slug>/
│       ├── 01-<task>.md
│       ├── 02-<task>.md
│       ├── EXECUTION_REPORT.md
│       └── COORDINATOR_PROMPT.md
├── corrections/
│   └── <work-slug>/
│       ├── 01-<correction>.md
│       ├── EXECUTION_REPORT.md
│       └── COORDINATOR_PROMPT.md
├── reviews/
│   └── <review-slug>/...
├── verification/
│   └── <verification-slug>/...
├── handoff/
│   └── <handoff-slug>/...
├── patches/
│   └── <temporary patch/evidence>
└── archive/
    └── <compact retained historical closure when genuinely useful>
```

Flat artifacts are acceptable for small focused work. The goal is clarity, not directory ceremony.

## Current Execution Environment Binding

Concrete execution-environment identity is transient and belongs only in `.artifacts/**`, never stable `AGENTS.md` / `.agent/**` governance.

Use `.artifacts/ENVIRONMENT.md` as the current binding when non-trivial work depends on delegated execution, independent auditing, or a specific repository-access surface.

The binding may record, as applicable:

- current coordinator/reviewer product/session and model;
- the repository-access tool surface assigned to that role;
- current independent-auditor product/session/model and its local-access boundary;
- current implementation/execution agent or local-agent name and its execution environment;
- concrete product-specific tools, plugins, apps, connectors, MCPs, or other local-access mechanisms;
- stop/fallback/recovery policy when a required tool or environment is unavailable;
- concrete prompt-handoff requirements that depend on those current bindings.

Stable governance owns the abstract roles and rules. `ENVIRONMENT.md` binds those roles to the maintainer's current environment only.

Before substantial delegated execution or independent audit, verify that the binding exists and is still current. If `.artifacts/**` or `ENVIRONMENT.md` is absent, incomplete, or stale, do **not** infer the current model/tool/local-agent setup from old chats, stable docs, or historical artifacts. Ask the maintainer to confirm the current environment/workflow/tooling/model/local-agent bindings, write a fresh transient binding, and only then prepare concrete executor/auditor prompts.

If the maintainer changes a concrete model, tool surface, plugin/app, local agent, or stop/fallback rule, update the transient binding rather than promoting that product-specific name into stable governance.

## Planning Artifacts

### `RESEARCH_REPORT.md`

Record verified facts needed by later work:

- Git/source/configuration baseline;
- current APIs/owners/stream behavior;
- generator/template/catalog relationships;
- dependency/external documentation when time-sensitive;
- host/container/toolchain/runtime constraints;
- known unknowns;
- facts later tasks should not rediscover from chat memory.

Separate verified facts from conclusions/recommendations.

### `IMPLEMENTATION_PLAN.md`

An implementation-ready plan normally states:

- exact goal/non-goals;
- architecture ownership;
- affected streams and runtime sides;
- allowed/forbidden paths;
- behavior/lifecycle/configuration/generated-output mechanics;
- external side effects;
- validation strategy;
- stop conditions.

### `PLAN_AUDIT.md`

When risk warrants an independent plan audit, record the review against actual repository facts. A planner's own confidence is not plan acceptance evidence.

## Mandatory Large-Task Decomposition

Split work into numbered task files when any of these is true:

- more than one independently verifiable behavior changes;
- more than one architecture owner or stream is involved in materially different ways;
- implementation and validation have several distinct phases;
- generator/runtime/configuration changes must be sequenced;
- a failed middle step should block later mutations;
- a single executor prompt would become long or cognitively dense.

Prefer precise tasks without destroying locality. One task should represent one tightly coupled behavior group with one meaningful verification gate.

## Surgical Task Contract

This transient executor-task contract is owned here. Do not confuse it with `.agent/templates/task_template.md`, which is for durable structured entries in stable `TASKS.md`.

Use this shape when applicable:

```text
# Task NN - Title

## Goal
## Preconditions
## Allowed paths
## Required implementation
## Ownership / lifecycle / generation rules
## Explicitly forbidden work
## Verification
## Completion report
## Stop conditions
```

Exact path allowlists are strongly preferred. If a task discovers a contradiction requiring broader scope, stop rather than silently expanding.

## Autonomous Executor Loop

```text
read Task NN completely
-> inspect required current Git/source facts
-> mutate only Task NN allowlist
-> run Task NN verification
-> inspect actual diff
-> append Task NN result to EXECUTION_REPORT.md
-> PASS: continue to next already-approved task
-> BLOCKED: append blocker and stop the wave
```

The executor does not ask for confirmation between already-approved tasks unless the task contract itself requires a maintainer decision.

## Append-Only Execution Evidence

`EXECUTION_REPORT.md` sections are append-only. Each task attempt should record:

- actual paths changed;
- implementation facts;
- exact validation/probe commands/actions and outcomes;
- generated/runtime/host-container evidence actually observed;
- Git state;
- deviations/blockers.

Never rewrite a failed/stopped attempt to make it disappear. A resumed attempt appends a clearly named new section.

Executor reports are never proof by themselves; the coordinator independently audits repository state afterward.

## Verification Delegation

When the coordinator lacks a capability required for a real gate, create a focused verification artifact, for example:

```text
.artifacts/verification/<slug>/
├── VERIFICATION_TASK.md
├── VERIFICATION_REPORT.md
└── COORDINATOR_PROMPT.md   # only if delegation benefits from it
```

The task should state exact actions/commands, environment assumptions, expected observations, side-effect limits, mutation/Git prohibitions, and report format. Read-only verification remains read-only unless mutation is explicitly authorized.

## Immutable Primary Evidence

For expensive or load-bearing execution, preserve enough primary evidence to bind a result to the candidate when practical:

```text
source/snapshot identity
exact command/action
working directory/environment facts that matter
complete relevant stdout/stderr or raw result
true exit/result status
hash/identity of preserved evidence when required
```

Derived summaries/parsers/manifests may be recomputed from valid immutable primary evidence without rerunning an expensive build/test/container/device/live gate. A report-format defect does not automatically make valid primary execution stale.

Rerun primary execution when the source/command/selection changed or the primary evidence itself is invalid/incomplete.

## Mandatory Probe Cleanup and End-of-Prompt Sweep

Every execution agent owns the disposable machine output it creates. Cleanup is part of the same task/prompt completion contract, not later maintenance.

After each individual probe, compiler invocation, test run, package/build step, disposable clone/workspace operation, or similar isolated execution step, once required evidence has been safely captured and read back/hashed when required, remove reproducible prompt-owned residue that no later step in the same accepted pass needs.

Default rule:

```text
prompt-local + reproducible + disposable + no longer needed
=> remove immediately after evidence capture
```

Evidence ordering is mandatory:

```text
run step
-> capture/copy required raw/text evidence
-> read back/hash/verify evidence when required
-> remove disposable output no later step needs
-> continue
```

Examples include task-local build trees under `.artifacts/**`, disposable clones/workspaces, temporary native build/index roots, generated dependency checkouts, temporary work roots, compiler scratch state, temporary caches/fixture repositories, and other reconstructible prompt-local machine output.

A reusable project-local cache/build root may be intentionally preserved while later gates in the same accepted pass still need it. Delete prompt-owned disposable state after the final dependent gate, not prematurely.

Before the final response, perform an end-of-prompt sweep over every temporary location owned by the prompt and remove remaining disposable residue whether the run ends PASS, BLOCKED, STOPPED, or another terminal result.

### Reusable Project-Local Exception

Do not delete normal project-local reusable build/cache state merely to satisfy cleanup unless the task explicitly owns and authorizes its removal.

A build tree, clone, checkout, cache, or temporary workspace nested under `.artifacts/**` or another task-owned disposable location is disposable unless the maintainer explicitly asks to preserve it or a later step in the same pass still needs it.

### Cleanup Safety

Never use broad destructive cleanup against unknown paths. Remove only paths the executing agent created or whose disposable ownership it independently established.

Never delete unrelated temporary data, user-authored evidence, unrelated untracked files, dependency repositories, reusable project caches, or project-root state merely because they are large. If ownership is ambiguous, preserve and report instead of destructive cleanup.

Every execution prompt that can create substantial build/temp output must restate the relevant cleanup responsibility. Read-only auditors need not manufacture cleanup work but remain responsible for disposable temporary data they themselves create.

## Diagnostic Artifact Retention

Excluded/diagnostic attempts preserve the smallest evidence sufficient to explain the exclusion or blocker, not complete reconstructible machine state.

Normally retain only what is needed, such as:

- an exclusion/blocker note;
- the relevant immutable primary log or necessary command/header/exit snippet;
- compact parser/wrapper failure evidence;
- source/snapshot identity and hashes needed for reconstruction.

Do not preserve entire disposable repository clones, object databases, native build result bundles, dependency checkouts, build products, index stores, or other reconstructible runtime trees inside `.artifacts/**` merely because an attempt was diagnostic.

If a diagnostic source snapshot is reproducible from frozen Git identity, preserve the identity and minimal evidence, then delete the disposable snapshot itself.

## Final Milestone Conformance Review

After implementation, correction waves, required validation, and any required live/runtime acceptance have passed, run one final independent milestone review under `.artifacts/reviews/` before stable task/roadmap documentation marks the milestone complete.

The final reviewer/session must be independent from the implementation executor and, where practical, from the primary coordinator that designed the work. Review the entire delivered milestone against the current roadmap and relevant stable owners, not only the latest diff or correction wave.

The review must re-check the complete delivered contract that matters to the milestone: mechanics, ownership, lifecycle/state, generated/configuration behavior, UI/runtime behavior, external side effects, validation evidence, and deferred scope as applicable.

A clean final conformance verdict is required before marking the milestone complete. Findings reopen a focused correction wave; do not bury them inside the final review prompt.

## Correction Waves

After independent audit, group defects into the smallest coherent corrections. Write numbered correction tasks with exact allowlists and validation, run them sequentially, then independently re-audit actual source.

Do not grow one old correction prompt forever. A materially distinct new issue gets a new focused correction wave.

## Compact Coordinator Prompt

`COORDINATOR_PROMPT.md` contains orchestration, not duplicated implementation detail:

```text
repository / role
baseline expectations
ordered task files
read each task immediately before execution
append report after each task
continue automatically after PASS
stop on blocker
side-effect and Git boundaries
cleanup requirement
final report shape
```

If the prompt restates every task in full, decomposition has failed.

For prompts that can launch expensive hosted/full tests, builds, container/image work, device operations, or live integrations, also state the expensive-attempt budget and retry boundary. The default for one unchanged final integration candidate is one expensive attempt; cheap pre-runtime wrapper/dry-run corrections may iterate before that attempt begins.

## User-Facing Mini-Prompt Handoff

When a detailed executor/auditor prompt is stored in an artifact and the maintainer is expected to send it to another model/session, the coordinator's user-facing response must also include a ready-to-send mini-prompt. Concrete target/model/tool/local-agent values come from the current transient `ENVIRONMENT.md` binding rather than stable governance.

The mini-prompt contains:

- target/model role;
- repository;
- exact main artifact path;
- finalized artifact SHA-256 when available;
- required local-tool boundary;
- high-level mutation/read-only/Git constraints;
- instruction to execute the artifact exactly and return its required verdict/report.

Do not duplicate the full artifact prompt. If the artifact changes, its old SHA/mini-prompt is stale.

## `NEW_CHAT.md`

`.artifacts/NEW_CHAT.md` is transient continuity for the next coordinator/reviewer conversation, not stable governance.

Refresh it after continuity-critical transitions such as accepted audit/correction results, new active artifact sets, branch/HEAD phase changes, blockers, dependency prerequisites, or a changed next action. Keep a current snapshot, not an ever-growing transcript.

A useful snapshot includes:

```text
repository/environment identity
active ENVIRONMENT.md binding status
current branch/HEAD/status
active objective and phase
relevant stable owners
verified accepted work that constrains continuation
uncommitted changes/preservation rules
active artifact index
blockers/unknowns
exact next intended action
tool/orchestration constraints
```

Machine-local paths and tool IDs are allowed here because the file is transient.

## Recovery When Artifacts Are Missing

If `.artifacts/`, `ENVIRONMENT.md`, or `NEW_CHAT.md` is absent or the current binding is stale:

1. read `AGENTS.md` and minimum relevant stable governance;
2. inspect current Git branch/HEAD/status;
3. inspect relevant work-state/current-fact docs only as needed;
4. inspect actual source/configuration/recent relevant history;
5. identify the current phase from verified evidence and maintainer instruction;
6. before substantial delegated execution or independent audit, ask the maintainer to confirm the current environment/workflow/tooling/model/local-agent bindings rather than guessing them;
7. recreate only the artifact directories needed now;
8. write a fresh `.artifacts/ENVIRONMENT.md` from the maintainer-confirmed current binding when orchestration depends on concrete execution roles/tools;
9. write a fresh `NEW_CHAT.md` from verified current facts when continuity needs it;
10. recreate research/plan/tasks rather than pretending deleted transient plans still exist;
11. never infer lost uncommitted evidence or lost concrete environment bindings that are no longer present.

## Promotion to Stable Documentation

Promote only durable knowledge:

- architecture rule -> owning architecture document;
- workflow rule -> workflow/orchestration/artifacts/commit owner;
- navigation fact -> `SOURCE_MAP.md`;
- durable current-state fact -> `PROJECT_MEMORY.md`;
- unresolved choice -> `OPEN_DECISIONS.md`;
- active executable work -> `TASKS.md`;
- verified regression -> `REGRESSIONS.md`;
- future idea -> `TODO.md`;
- accepted technical debt -> `TECH_DEBT.md`.

Do not promote execution diaries, concrete model/agent names, product-specific tool/plugin/app/connector/MCP names, local tool IDs, temporary hashes/logs, machine-local reference paths, or giant reports. Those concrete execution bindings remain transient under `.artifacts/**`.

## Git Rule

`.artifacts/` must remain ignored by `.gitignore`. Do not stage/commit artifacts just because they were useful locally unless the maintainer explicitly changes this policy.

