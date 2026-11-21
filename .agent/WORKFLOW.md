# Workflow

Mandatory development workflow for Swift Stream IDE.

## PLAN -> IMPLEMENT -> AUDIT

Every non-trivial task follows three phases.

### 1. PLAN

Restore the current repository state from Git, source, and stable governance. Determine:

- exact user goal and non-goals;
- primary architecture owner and any genuinely required supporting owners;
- affected stream(s), host/container side(s), generated/output surfaces, and external side effects;
- exact mutation path scope;
- current behavior/evidence that the plan relies on;
- validation strategy and stop conditions.

Substantial research and plans live under `.artifacts/planning/<work-slug>/` or another focused planning artifact path described by `ARTIFACTS_WORKFLOW.md`.

A plan is not accepted merely because a planning agent wrote it. For risky/multi-file/cross-owner work, independently audit the plan against actual source/Git/configuration before implementation.

### 2. IMPLEMENT

- Implement only reviewed scope.
- Preserve unrelated user work.
- Follow the owning architecture and applicable style/testing policy.
- For generated behavior, modify the owning source/template/catalog rather than only derived output.
- For large work, execute numbered surgical tasks in order and stop on an out-of-scope blocker.
- If a material premise is false, stop and re-plan instead of improvising a broader architecture.

### 3. AUDIT

Independently inspect actual Git status/diff/source/configuration plus required runtime/build/output evidence.

Check as applicable:

- architecture ownership and stream boundaries;
- command/contribution/context-key coherence;
- generated output for every affected generator branch;
- host/container and rebuild/reopen semantics;
- process/cancellation lifecycle;
- feature adapter/package/config coherence;
- required tests/build/lint/runtime evidence;
- stable documentation impact;
- forbidden/unrelated changes.

If defects remain, create a focused correction wave and re-audit the resulting source. Do not bury a long defect list inside one giant correction prompt.

## When Formal Artifact Planning Is Required

Use a written artifact plan before production mutation when work is multi-file, cross-stream, cross-owner, affects project generation, toolchain/devcontainer contracts, process lifecycle/cancellation, external network/deployment behavior, feature installation/removal, public VS Code commands/settings/config schema, or has meaningful data/destructive side effects.

Small typo/comment/format-only work may skip a formal artifact plan but still requires final scope/diff verification.

## Vertical Development

Prefer a complete narrow user-facing path over speculative subsystem generalization. A real change may cross package contribution -> runtime registration -> stream behavior -> generator/template -> validation when that is the actual feature slice.

Do not require an entire subsystem to be redesigned before one well-bounded behavior can be implemented. Conversely, do not call a change complete when only one layer was updated but the real feature contract spans several owners.

## Generated-Surface Validation

When generator/template/catalog behavior changes, source compilation is necessary but not sufficient. Verify representative generated output at the smallest level that can prove the changed branch.

Examples:

- devcontainer/toolchain change -> inspect generated `.devcontainer/devcontainer.json` plus relevant Dockerfile/config result;
- project wizard change -> generate or deterministically exercise the affected project branch and inspect produced files;
- Handlebars/template change -> render with representative payload and inspect output;
- schema change -> validate representative accepted/rejected configurations;
- feature package + adapter change -> verify package metadata/install shape and TypeScript integration boundary.

## Validation Ladder

Use the cheapest level that can disprove the current candidate, then expand only as risk requires:

```text
L0 source / Git / configuration / generated-text inspection
-> L1 TypeScript compile/lint or focused deterministic probe
-> L2 focused unit/integration behavior or representative generator branch
-> L3 affected VS Code-hosted/integration cluster
-> L4 broad `npm test`, extension packaging, Docker/container/image build, or live external integration only when required
```

Relevant repository commands currently include:

```text
npm run compile
npm run compile-tests
npm run lint
npm test
npm run package
```

Do not run the broadest/most side-effectful validation after every surgical task. Consolidate broad gates at coherent integration checkpoints. A green compile/test does not replace architecture/diff review.

## Release-Phase Canonical Workspace

Once the maintainer declares the repository to be in release-finalization/release-candidate work, the canonical repository checkout becomes the sole authority for release source, build, packaging, acceptance, and publication.

- Finalize the release candidate in place in the canonical checkout. Do not evade unrelated or dirty working-tree state by packaging from another checkout.
- Do not create or use sibling RC directories, exported/archive copies, temporary clones, copied source trees, alternate package workspaces, detached release checkouts, or Git worktrees as release-candidate source/build/package authority.
- Do not build a release package in one workspace and copy it into another workspace to make that other workspace appear authoritative.
- Pre-integration package builds may prove the release pipeline and candidate behavior, but they are acceptance evidence only; they are not the publication artifact when any release-visible repository file changes afterward.
- The publication package must be rebuilt from the canonical checkout only after the final release commit exists, the release tag points to that exact commit, and the final branch plus tag have been pushed and verified. The canonical checkout must still be clean and at that exact tagged commit when the publication build starts.
- The freshly rebuilt publication package becomes the sole artifact eligible for Marketplace/publication upload. Perform a bounded package-integrity gate on that exact file before upload: verify package version/publisher, expected packaged file set, release-visible documentation such as README/CHANGELOG when applicable, and source-to-package hashes for those release-visible files. Re-run broader product/runtime acceptance only if the final tagged source or executable payload changed in a way not already covered by the accepted candidate.
- Once that post-tag publication package is accepted, do not rebuild it again before upload unless the maintainer explicitly replaces the publication candidate and repeats the package-integrity gate.
- If the canonical checkout contains unrelated WIP that prevents a clean release candidate, reconcile that state in the canonical checkout through an explicit maintainer-reviewed source/Git decision. Do not route around it with another checkout or copy.
- `.artifacts/**` remains evidence/planning storage only. It must not become an alternate release source, build root, package root, or shadow checkout.
- External consumer projects, platform/device environments, containers, or fixtures are allowed when they are the actual subject of an integration/runtime test. They must not contain or masquerade as an alternate copy of the repository's release-candidate source.
- Before any release package/build/install/publication gate, verify that the active source/build root is the canonical checkout. If not, stop before execution.

This release-phase rule overrides convenience patterns that may be acceptable during ordinary feature development, experimentation, or isolated research. Once release finalization begins, workspace identity must remain singular and obvious.

## Documentation Synchronization

After accepted implementation/correction, update only stable owners whose durable facts changed: architecture, source map, project memory, open decisions, work state, testing/style policy, skills, or workflow.

Use `skills/documentation-sync/SKILL.md` when durable repository knowledge changed. Documentation self-maintenance is ownership-driven, not a reason to touch unrelated files.

Do not preserve debugging chronology or concrete execution-environment bindings in stable docs. Keep them in `.artifacts/**` if they remain useful at all.

For milestone-level work, stable roadmap/task state must not mark the milestone complete until the final independent conformance review required by `DEVELOPMENT_ORCHESTRATION.md` / `ARTIFACTS_WORKFLOW.md` is clean.

## Git Gate

Follow `COMMIT_RULES.md`. Implementation/audit completion does not authorize stage/commit/push. Those operations require explicit maintainer authorization in IDE.

