---
name: patch-review
description: Review a Swift Stream IDE patch/change set against scope, architecture, lifecycle, generated surfaces, validation evidence, documentation impact, and Git preservation.
---

# Patch Review

Use when independently reviewing a patch or coherent change set.

## Checklist

1. **Scope / Git** — changed paths match approved scope; unrelated staged/unstaged/untracked user work is untouched.
2. **Behavior** — inspect actual changed source/config/templates and direct callers/consumers; verify the patch proves the intended behavior rather than only compiling.
3. **Architecture** — affected architecture IDs still have one owner; no duplicate authority, stream leakage, generated-output/source inversion, or hidden mutable state was introduced.
4. **Lifecycle / side effects** — when relevant, check async ordering, cancellation, host/container state, rebuild/pending state, filesystem/network/device effects, secrets, and destructive boundaries.
5. **Declarative/runtime coherence** — when relevant, reconcile `package.json` contributions/settings/context/menu contracts, runtime registrations/readers, stream availability, generator/template/catalog outputs, and root feature/image/package layers.
6. **Validation evidence** — use the smallest meaningful candidate-bound validation; delegated execution reports are evidence, never proof of source/Git state.
7. **Docs** — load `documentation-sync` only when durable knowledge actually changed.
8. **Final state** — inspect final Git status and exact task-scope diff; verify no forbidden or unrelated mutation remains.

Do not review hypothetical future subsystems the patch does not touch. Escalate context only when the actual change crosses those boundaries.
