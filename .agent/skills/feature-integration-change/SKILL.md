---
name: feature-integration-change
description: Add or change a Swift Stream optional integration while keeping TypeScript feature adapters, active stream registration, Dev Container Feature packages, project config, rebuild state, and external side effects coherent.
---

# Add or Change a Feature Integration

Primary owner: [`FEATURE_INTEGRATIONS.md`](../../architecture/FEATURE_INTEGRATIONS.md). Load [`DEVCONTAINER_AND_TOOLCHAINS.md`](../../architecture/DEVCONTAINER_AND_TOOLCHAINS.md) when installation/removal changes devcontainer semantics and the relevant stream owner for availability/menu behavior.

1. Inspect the closest existing feature adapter and root `features/**` package as style evidence, not as a semantic template to copy blindly.
2. Define feature identity across layers: display/name, repository/package reference, version, binary path/name, config folder/file, install params, active stream registration.
3. Implement extension adapter and root feature package only when both are actually required by the feature. Do not create an unused mirror layer for symmetry.
4. Add the feature to the concrete stream's active feature collection only when it is intended to be user-available now.
5. Validate install -> pending rebuild -> available runtime -> setup/config/login/action -> deintegrate/remove lifecycle as applicable.
6. Scope deletion to the feature-owned project path and require explicit UX for destructive removal.
7. Keep credentials/tokens out of logs/artifacts/source. Prefer fake/local/deterministic CLI/config evidence before live provider calls.
8. Validate package metadata/install behavior and TypeScript adapter expectations together.
9. If a live provider/deployment check is truly required, isolate it as an explicitly authorized verification gate after deterministic acceptance.

