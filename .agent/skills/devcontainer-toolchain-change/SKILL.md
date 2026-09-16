---
name: devcontainer-toolchain-change
description: Safely change Swift Stream devcontainer generation/mutation, toolchain catalog/selection, SDK/artifact URLs, ports, mounts, feature entries, or rebuild-required state.
---

# Change Devcontainer or Toolchain Behavior

Primary owner: [`DEVCONTAINER_AND_TOOLCHAINS.md`](../../architecture/DEVCONTAINER_AND_TOOLCHAINS.md). Add extension/stream/UI owners only for affected runtime consumers/projections.

1. Inspect `src/devContainerConfig.ts`, `src/toolchain.ts`, the relevant `toolchains.json` entries, and every runtime reader of the field being changed.
2. Determine whether the change affects generation, incremental mutation of existing projects, runtime environment, pending-rebuild UI, or several of these.
3. Preserve unknown/user-managed devcontainer fields for incremental operations.
4. For toolchain catalog changes, validate exact schema and selection boundaries: requested major/minor, fallback behavior, stream catalog routing, URLs/artifact fields.
5. For environment-key changes, trace writer -> container env -> reader. Never update only one side.
6. For mounts/ports/features, preserve unrelated entries and required permanent mounts.
7. Treat config edit and effective in-container state as different phases when rebuild is required.
8. Validate deterministic generated JSON first. Use container rebuild/runtime evidence only when the task's claim crosses that boundary.
9. Do not publish/download/modify remote artifacts merely to prove local catalog/config semantics unless explicitly required.

