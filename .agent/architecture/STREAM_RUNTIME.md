# Stream Runtime

Owner of `STREAM-*` architecture rules.

Primary source: `src/streams/stream.ts` and `src/streams/{android,embedded,pure,server,web}/**`.

## `STREAM-001` — `Stream` Owns Genuinely Shared Runtime Behavior

The base `Stream` owns behavior intended to be common across active stream families: shared process/toolchain/Swift helpers, common settings, common command registration, common sidebar item providers, package/test maintenance, feature plumbing, and base build/run/test hooks.

Do not move stream-specific semantics into `Stream` solely to remove duplication. Shared code must have shared behavior and lifecycle, not merely similar syntax.

## `STREAM-002` — Concrete Streams Own Their Specialization

Current concrete owners are:

- `src/streams/android/androidStream.ts`
- `src/streams/embedded/embeddedStream.ts`
- `src/streams/pure/pureStream.ts`
- `src/streams/server/serverStream.ts`
- `src/streams/web/webStream.ts`

Their command folders and feature folders are part of the same stream-specific boundary.

Stream-specific SDKs, build/run/debug/flash behavior, ports, generated/project assumptions, recommendations, feature availability, and file-save handling stay with that stream unless a reviewed common contract is established.

## `STREAM-003` — Override/Configure Ordering Is Behavioral

Several concrete streams construct stream-specific helpers before running their effective configuration sequence. Base/concrete constructor and `configure()` ordering can therefore affect subscriptions, settings, feature startup, and UI state.

Do not refactor constructor/configuration order as cosmetic cleanup without validating concrete streams that depend on it.

## `STREAM-004` — Runtime Flags Are UI-Observable State

Build/test/hot-rebuild/cache/LSP and stream-specific flags are currently module-level/runtime state consumed by the sidebar and commands. Their lifecycle is externally visible through menus/context/status.

When changing one of these operations, verify state transitions on success, failure, and cancellation. Do not add a second mutable flag representing the same authoritative condition in another layer.

## `STREAM-005` — Global Key Actions Delegate to the Active Stream

Common keyboard command IDs invoke the active stream's `globalKeyBuild`, `globalKeyRun`, `globalKeyDebug`, `globalKeyStop`, and `globalKeyTest` behavior. Concrete streams may specialize them.

Changing a global key action requires checking both runtime dispatch and `package.json` keybinding/menu declarations.

## `STREAM-006` — Save/Rename/Delete Handling Is Progressive

The base stream may handle a file event first; a concrete stream may add more specific handling. Concrete handlers should preserve base behavior when it applies and should return/short-circuit deliberately.

Avoid registering duplicate expensive rebuilds for one file event through multiple layers.

## `STREAM-007` — Feature Availability Is a Stream Contract

`features(): AnyFeature[]` and related item builders determine which optional integrations are actually active/available for a stream. A feature class existing in source or being commented out in the returned collection is not proof that it is supported in the product.

Feature lifecycle details are owned by `FEATURE_INTEGRATIONS.md`.

## `STREAM-008` — Multi-Stream Changes Must Prove Commonality

For a change spanning multiple streams:

1. state which behavior is truly shared;
2. keep divergent SDK/config/runtime behavior local;
3. inspect each affected concrete stream's override/caller boundary;
4. validate representative behavior per affected branch rather than assuming the base-class change covers all streams.

