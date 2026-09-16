# Reference Projects and External Evidence

Policy for inspecting dependencies, external repositories, platform docs, and maintainer-designated reference projects.

## Default

External repositories are **not loaded by default**. Start from IDE source/configuration and official documentation for the technology whose current behavior matters.

## Valid Reasons to Inspect External Source

- verify an upstream API/toolchain/container/VS Code behavior not established locally;
- understand a dependency implementation boundary required by the current bug/feature;
- compare a maintainer-designated sibling project for workflow/style/architecture patterns;
- verify current platform/tool behavior when local assumptions may be stale.

External code is evidence, not automatic authority over IDE architecture.

## Portability Rule

Stable `.agent/**` documentation must never require a machine-local sibling checkout path to exist. If a maintainer gives a local path for research, keep that path and exact snapshot identity in `.artifacts/**` only.

Stable docs may name a public project/package/official documentation source when the identity itself is durable and useful.

## Reference Hierarchy

For semantic/tool/platform facts, prefer:

1. current official specification/documentation/source for the component;
2. exact dependency/tool version actually used by IDE;
3. reproducible local/runtime evidence;
4. maintainer-designated reference repository patterns;
5. general examples/blogs only as supporting context.

Do not copy project-specific rules from another repository when IDE's source/lifecycle differs.

## Maintainer-Designated Style / Governance Evidence Protocol

Use this protocol when the maintainer explicitly asks to learn or refine coding, workflow, governance, architecture-documentation, or review approaches from additional repositories.

### Evidence Hierarchy

Evaluate evidence in this order:

1. explicit current maintainer statements;
2. accepted stable Swift Stream IDE governance/guidelines;
3. repeated patterns across multiple maintainer-designated evidence repositories supplied for the current task;
4. strong repeated patterns within one substantial maintainer-designated evidence repository;
5. isolated examples as hypotheses only.

Generated, vendor, framework-forced, unreviewed, transitional, and one-off content does not become authority automatically. Newly generated or unreviewed IDE governance/source is candidate material to audit, not evidence of the maintainer's preference merely because it exists.

### Candidate Classification

Classify candidate rules before promotion. Useful classes include:

- `COMMON` — portable across the repository/workflow;
- `IDE-SPECIFIC` — appropriate to this extension/project model;
- `STREAM/DOMAIN-SPECIFIC` — belongs only to a routed stream/domain owner;
- `PLATFORM-SPECIFIC` — tied to a real host/container/platform boundary;
- `LEGACY-BUT-INFORMATIVE` — historical evidence that should not become a current rule unchanged;
- `FRAMEWORK/TOOL-CONSTRAINED` — caused by an external interface rather than a maintainer preference;
- `ACCIDENTAL/ONE-OFF` — insufficient evidence;
- `CONFLICTING` — contradicts accepted guidance or other strong evidence and requires adjudication.

### Controlled Refinement

```text
maintainer supplies reference/evidence repositories for the current task
-> planning-only representative evidence pass
-> transient provenance/examples in .artifacts/**
-> extract candidate principles
-> classify scope/status
-> compare with accepted IDE governance/guidelines
-> propose ADD / STRENGTHEN / NARROW / MOVE / SUPERSEDE / REJECT
-> independent review + maintainer approval when material
-> documentation-only promotion of portable rules
-> duplication/link/context-budget audit
-> optional later source-compliance/refactor work
```

Do not mutate stable guidance during the evidence-discovery pass merely because a pattern looked appealing. Separate evidence collection from rule promotion unless the maintainer explicitly authorizes a narrower direct edit.

### Promotion Rule

A promoted stable rule must stand on its own on another machine with none of the evidence repositories present.

Concrete evidence-repository names, machine-local paths, sampled files, commit identities, competing examples, extraction notes, and current model/tool execution details stay in `.artifacts/**` unless a repository/product/dependency identity is itself a durable IDE domain fact.

Stable docs record the accepted self-contained rule, not “follow repository X”.

### Conflicts

Do not silently replace an accepted rule. Distinguish temporal evolution, domain specificity, framework/tool constraint, repository-specific necessity, and a genuine maintainer preference change. Keep competing evidence transient and supersede stable guidance only after the conflict is actually resolved.

### Consolidation

After material additions, audit for duplicated rules, over-generalization, rules that should move up/down in scope, obsolete toolchain/framework assumptions, unnecessary tiny guides/skills, and context-budget inflation.

The goal is progressively better fidelity with a small coherent self-contained governance system, not indefinite accumulation or permanent dependence on reference repositories.

