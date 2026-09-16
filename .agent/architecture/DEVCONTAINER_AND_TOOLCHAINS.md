# Devcontainer and Toolchains

Owner of `DEV-*` architecture rules.

Primary source: `src/devContainerConfig.ts`, `src/toolchain.ts`, `toolchains.json`, commands that mutate toolchain/devcontainer state, and `assets/Devcontainer/**` when files are copied into consumer projects.

## `DEV-001` — Devcontainer Configuration Has Dual Role

Consumer `.devcontainer/devcontainer.json` is both generated project configuration and runtime input for the extension/container environment.

Core fields currently include stream identity, toolchain URLs/version, VS Code extensions/settings, capabilities/security options, mounts, ports, and stream-specific SDK/artifact/environment values.

Changing the generated shape therefore requires reviewing both project creation and runtime readers.

## `DEV-002` — `S_MODE` Is the Stream Bridge

Generation writes `containerEnv.S_MODE`; activation reads `S_MODE` in-container. This is the current bridge between project configuration and selected stream runtime.

Do not rename/change its values in only one layer.

## `DEV-003` — `toolchains.json` Is the Catalog Source

`toolchains.json` contains toolchain/artifact metadata. `src/toolchain.ts` loads it and `findTheRightToolchain(...)` selects a release candidate for the requested stream/Swift major/minor.

Catalog edits must preserve JSON/schema shape expected by readers and must be reviewed together with generated env values/artifact consumers for every affected stream category.

## `DEV-004` — Current Toolchain Selection Fallback Is Behavioral

For matching Swift major versions, current selection chooses the newest release whose minor is not greater than the requested minor, otherwise falls back to the highest release in that major; without a matching major it falls back to the newest release overall.

Changing this algorithm is product behavior, not a refactor. Validate representative exact-match, lower-minor, same-major fallback, and no-major-match cases.

## `DEV-005` — Stream Toolchain Catalog Routing Is Intentional

`getToolchainTags` currently uses dedicated catalog groups for Android and Web while other streams route through the `pure` toolchain group unless separately implemented.

Do not infer a new dedicated stream catalog from directory names alone. A catalog split is cross-layer behavior requiring generated config/runtime validation.

## `DEV-006` — Mounts and Ports Are Mutable Consumer Configuration

`DevContainerConfig` can add/change/remove ports, mounts, and features. Sidebar commands expose some of those mutations and often require a container rebuild before runtime effects appear.

Preserve permanent mounts needed by Swift Stream unless the owning architecture deliberately changes them. Changes that mutate user mounts/ports must avoid deleting unrelated entries.

## `DEV-007` — Pending Rebuild Is a State Boundary

Many devcontainer mutations are not active immediately inside the current container. UI may represent a pending toolchain/port/feature state until rebuild/reopen.

Do not claim runtime state changed merely because `devcontainer.json` was edited. Validate current-vs-pending semantics for affected UI/commands.

## `DEV-008` — Asset Dockerfiles and Image Sources Are Different Owners

`assets/Devcontainer/**` files are copied into generated consumer projects and belong to the generated-project/devcontainer contract. `docker-images/**` builds Swift Stream image artifacts and is owned by `DOCKER_IMAGES.md`.

Changes may span both, but one must not be treated as an automatic mirror of the other.

## `DEV-009` — Configuration Mutations Must Preserve User Extensions

When reading/writing JSON5 consumer configuration, modify only the fields owned by the requested operation. Do not serialize a narrow in-memory replacement that accidentally drops unknown/user-managed fields unless the task explicitly defines a full rewrite/migration.

