# Development Orchestration

Stable authority for coordinating non-trivial Swift Stream IDE work with coding agents.

Detailed `.artifacts/**` structure and task/report mechanics are owned by `ARTIFACTS_WORKFLOW.md`.

## Execution Environment Binding — Non-Negotiable

Stable orchestration defines abstract roles, capability boundaries, and delegation rules. It must not persist concrete model names, agent names, repository-access product/tool names, product-specific tools/apps/plugins, or local execution-agent names.

The current concrete execution binding belongs only in `.artifacts/**` and is owned by `ARTIFACTS_WORKFLOW.md`.

### Coordinator / Reviewer

- The coordinator/reviewer performs every repository-local operation supported by its currently bound trusted repository tool surface directly rather than delegating merely for convenience.
- Do not silently substitute another local-access mechanism when that would violate the active transient environment binding.
- If a required operation is outside the bound tool surface's capability, treat it as a genuine capability gap and delegate the smallest required executable operation to the bound execution-capable environment or another environment explicitly authorized by the maintainer.
- A temporary outage of the bound repository tool surface does not itself authorize a fallback unless the transient binding explicitly allows one.
- Reasoning that does not require local repository access may continue, but repository-local claims/mutations wait for the authorized bound path or follow approved delegation.

### Independent Auditor

- Use a fresh independent reviewer/session that did not implement the candidate.
- The auditor follows the current transient environment binding for repository-access tools, stop/fallback policy, and recovery behavior.
- If the binding requires STOP on tool unavailability, obey it exactly; do not improvise a substitute environment.
- After recovery, resume from the last completed checkpoint when the binding requires checkpointed continuation rather than restarting blindly.

### Implementation Executor

- Use the local implementation/execution role defined by the active transient environment binding.
- Do not give an implementation executor one giant implementation/correction prompt containing several independent behaviors or unresolved design choices.
- Split large work into numbered surgical task files with exact allowlists, required mechanics, verification, completion evidence, and stop conditions.
- A wave prompt tells the executor to read and execute those task files strictly one after another. After PASS it continues automatically to the next already-approved task; on a genuine blocker/out-of-scope contradiction it stops the entire wave.
- The executor must not invent architecture, scope, paths, acceptance conditions, or fallback behavior merely to keep the wave moving.

### Stored Prompt Handoff

When the coordinator stores a detailed executor/auditor prompt under `.artifacts/**`, it also gives the maintainer the ready-to-send copy/paste mini-prompt required by `ARTIFACTS_WORKFLOW.md`. Concrete model/tool/app/plugin/local-agent names are taken from the active transient environment binding and remain inside `.artifacts/**` or the user-facing handoff, not stable governance.

## Roles

### Coordinator / Reviewer

The coordinator/reviewer:

- restores current context from real Git/source/stable docs;
- performs focused repository/dependency research;
- identifies architecture owners and exact scope;
- writes and independently audits implementation plans when required;
- decomposes large work into numbered surgical task files;
- gives executors a compact coordinator prompt rather than a duplicated mega-prompt;
- independently inspects actual source/diff/Git after execution;
- converts findings into focused correction tasks;
- synchronizes durable stable documentation after accepted work;
- leaves stage/commit/push to a separately authorized Git gate.

Executor reports are evidence, never proof.

### Implementation Executor

The executor implements an already-reviewed task contract:

- read the next task completely immediately before work;
- inspect the current relevant source/Git facts rather than relying only on the task prose;
- modify only explicit allowed paths;
- follow closed architecture/mechanics without redesigning out of scope;
- run the task's smallest meaningful verification;
- inspect its own actual diff;
- append execution evidence;
- continue automatically to the next already-approved task after PASS;
- stop the whole wave on a genuine out-of-scope blocker.

The executor must not broaden scope just to keep moving.

### Independent Auditor

For high-risk or milestone-level work, use a fresh reviewer/session that did not implement the candidate. The auditor checks the delivered repository state, not the executor's narrative, and returns explicit blockers/non-blockers plus evidence.

## Default Flow

```text
verify current Git/source state
-> focused research
-> reviewed implementation plan
-> independent plan audit when warranted
-> numbered surgical tasks
-> compact executor coordinator prompt
-> sequential implementation + append-only evidence
-> independent source/diff/Git/output audit
-> focused correction wave when needed
-> independent re-audit
-> final milestone conformance audit when closing a milestone
-> durable-doc synchronization
-> separately authorized Git gate
```

## Coordinator-First Capability Boundary

Do not delegate work the coordinator can directly and reliably inspect through its currently bound trusted repository tool surface.

Keep these in the coordinator/reviewer layer when available:

- Git status/diff/history/object identity;
- source/config/template/package inspection;
- exact path/hash/read-back checks;
- architecture/source-map/documentation reconciliation;
- static command/menu/context/schema audits;
- generated text inspection when it can be produced safely without a separate environment;
- existing-log/evidence consistency checks.

Delegate only a genuine capability gap in the currently bound repository tool surface that truly requires another environment, such as hosted tests, container rebuilds, device flashing, rendered browser/debugger behavior, platform-specific compilers, image publication, or live external providers. Follow the active transient environment binding rather than substituting an unapproved local-access mechanism inside the coordinator session.

## Large-Task Delegation Rule

Do not send one executor a single huge prompt containing several independent behaviors or a whole audit's worth of corrections.

Instead:

1. group work into tightly coupled independently verifiable behavior groups;
2. store mechanics, allowlists, validation, and stop conditions in numbered `.artifacts/**` tasks;
3. give the executor one compact prompt that points to those files and defines the autonomous loop.

If the coordinator prompt repeats every task's implementation detail, fix the decomposition.

## Broad Validation Placement

Default wave shape:

```text
Task 01 -> surgical verification -> report
Task 02 -> surgical verification -> report
...
Final integration task -> broad compile/test/package/container/live gate only if required
```

Do not repeatedly run the same expensive hosted suite, image/container build, device flash, external deployment, or other broad gate for one unchanged candidate.

## Expensive-Gate Retry Boundary

Before the first expensive hosted/full runtime gate, validate cheap wrapper mechanics, selectors, evidence destinations, parser/report plumbing, cleanup ownership, and other deterministic preconditions as far as practical.

For one unchanged candidate, the default expensive-attempt budget is one unless the task explicitly reviews a different budget.

After an expensive gate has produced valid immutable primary evidence, do not replay that gate merely because a later derived-evidence step fails. Formatting/parser/manifest/report/aggregate defects should use the preserved primary evidence or a focused evidence-only correction.

Replay the expensive primary execution only when that execution is invalid or stale, for example because source/command/selection changed, required primary provenance is missing, true exit/result status is unknown or failing, or the runtime/build itself genuinely failed.

## Planning Gate

Before non-trivial production mutation, the plan must close:

- scope/non-goals;
- primary/supporting architecture owners;
- stream/host/container/generated-output impact;
- exact allowed/forbidden paths;
- lifecycle/state/cancellation/configuration mechanics where relevant;
- external side effects/network/destructive operations;
- verification strategy;
- stop conditions.

Known plan defects are corrected before implementation.

## Independent Audit Gate

After executor work, inspect as applicable:

- complete changed-path set and baseline preservation;
- actual implementation and direct callers/consumers;
- `package.json` declarative surface when commands/settings/views/keybindings are involved;
- architecture and stream ownership;
- generator/template/config/catalog output coherence;
- process/cancellation and pending-rebuild lifecycle;
- feature adapter / root feature package boundaries;
- required compile/lint/test/runtime/generated-output evidence;
- deferred/forbidden scope;
- stable documentation impact.

If required execution cannot be performed through the coordinator's currently bound repository tool surface, create a focused verification artifact/prompt for the bound execution-capable role or the explicitly required external environment. Delegated execution evidence fills a capability gap; it does not replace the coordinator's direct inspection of every repository/source/Git fact its bound tool surface can verify.

## Milestone Completion Audit

A milestone is not complete merely because its implementation tasks, correction waves, builds/tests, and required runtime acceptance passed.

Before stable roadmap/task documentation marks a milestone complete, run one additional independent conformance audit using a fresh reviewer/session that did not implement the candidate and, where practical, did not design the work as the primary coordinator.

That reviewer audits the complete delivered milestone against the current roadmap and relevant stable owners, including implemented mechanics, ownership/lifecycle/state, generated/configuration behavior, UI/runtime behavior, external side effects, validation evidence, and explicitly deferred scope as applicable.

Record the final milestone audit under `.artifacts/reviews/`. Any blocker reopens a focused correction wave. Only a clean final conformance verdict permits stable milestone/task documentation to mark the milestone complete.

## Prompt Rules

Agent prompts are written in English unless the maintainer explicitly requests otherwise.

Every delegated prompt should identify repository/context, role, exact scope or artifact task files, mutation permissions, side-effect boundaries, Git prohibitions, stop conditions, cleanup duties when applicable, and required evidence/report shape.

When a detailed prompt is stored in `.artifacts/**` for the maintainer to send to another session/model, also return a ready-to-send mini-prompt with the exact artifact path and SHA-256 as described in `ARTIFACTS_WORKFLOW.md`.

## Context Discipline

Do not bulk-load all architecture files, task files, or skills. The coordinator loads only what the current planning/audit step needs; an executor reads one numbered task immediately before executing it. Architecture loading follows `CONTEXT_LOADING_RULES.md`.

## Git Boundary

Normal executors do not stage, commit, push, amend, reset, restore, clean, stash, rebase, or rewrite history. A later explicit maintainer authorization may open a narrow Git gate after independent acceptance.

