# Extension Lifecycle and State

Owner of `EXT-*` architecture rules.

Primary source: `src/extension.ts`. Supporting declarative surface: `package.json`. Stream runtime behavior is owned by `STREAM_RUNTIME.md`; UI contribution/menu coherence is owned by `VSCODE_SURFACE_AND_SIDEBAR.md`.

## `EXT-001` — Activation Is the Runtime Root

`activate(context)` is the extension runtime entrypoint. It establishes the current workspace directory, subscriptions/listeners, common commands, project-state routing, stream activation, and tree view startup.

Changes to activation must account for registration lifetime and repeated event effects; do not create parallel hidden startup paths that bypass this owner.

## `EXT-002` — Host and Container Modes Are Distinct

`isInContainer()` uses VS Code remote state to distinguish container execution from the host/outside-container experience.

Outside the container, the extension primarily validates/configures the project and offers reopen/setup flows. Inside a configured container, it activates the selected stream runtime. A change that affects only one side must not be assumed correct on the other side.

## `EXT-003` — Stream Identity Contract

The generated/configured project records stream identity in `.devcontainer/devcontainer.json` as `containerEnv.S_MODE`; inside the container the extension reads `process.env.S_MODE`, converts it to `ExtensionStream`, and chooses the concrete stream implementation.

Valid current stream enum cases are `Android`, `Server`, `Web`, `Embedded`, `Pure`, plus `Unknown` as a non-operational fallback.

Do not introduce an alternate authoritative stream selector without explicitly reconciling devcontainer generation, activation, and consumer-project compatibility.

## `EXT-004` — Project State Is Separate From Stream Runtime

`ExtensionState`/the `swiftstream.state` context key represent project/setup state used by VS Code UI. `currentStream` and the stream-specific singleton references represent the selected runtime implementation.

Do not conflate a menu/setup state with authoritative stream/domain behavior.

## `EXT-005` — First Workspace Folder Is the Current Project Assumption

Current activation derives `projectDirectory` from the first VS Code workspace folder. Multi-root-workspace support is not an established architecture fact.

Any future multi-root change is cross-cutting and must review activation, global runtime variables, devcontainer/config readers, sidebar state, process working directories, and project generation/open flows rather than changing one lookup in isolation.

## `EXT-006` — Setup Validation Precedes Runtime Activation

Current startup validates the devcontainer contract and, for non-embedded stream paths, the expected Swift package presence before selecting/activating a stream. Invalid/unknown configuration routes to setup/error state rather than inventing a default runtime silently.

Changes to what constitutes a valid configured project also affect generated configuration and UI state and must load the appropriate supporting owners.

## `EXT-007` — Workspace Events Route to the Active Stream

Save/rename/delete/configuration/debug lifecycle callbacks are routed through the active stream or shared runtime where applicable. Adding a new workspace event handler should have one clear owner and must not duplicate the same side effect in both extension root and stream code.

## `EXT-008` — Command Registration Has Two Levels

Common extension/setup/global-key commands are registered by the extension root; stream-specific behavior is registered by the selected stream and its features.

Command IDs and declarative contribution visibility are jointly validated with `UI-*` rules. Registering a runtime command without reconciling its declarative surface when one exists is incomplete.

