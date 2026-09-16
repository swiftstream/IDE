# Swift Stream IDE Source Map

Navigation aid for locating the smallest relevant source/config/test subset. This file is not an architecture contract; architecture semantics are owned by `ARCH_INDEX.md` and `.agent/architecture/**`.

## Extension Package and Build

- `package.json` — extension identity/metadata; VS Code commands, settings, keybindings, menus, views, welcome content, JSON schema contributions, task definitions; npm scripts/dependencies.
- `tsconfig.json` — TypeScript `Node16` / `ES2022`, `strict: true`, `noImplicitAny: false`, `src` root.
- `.eslintrc.json` — repository ESLint configuration.
- `webpack.config.js` — extension bundling configuration.
- `.vscode-test.mjs` — VS Code test runner configuration.
- `.vscode/` — repository/developer tasks/settings; not architecture authority by itself.
- `dist/`, `out/`, `node_modules/`, `.vscode-test/`, `*.vsix` — derived/local output, not source authority.

## Activation and Extension State

- `src/extension.ts` — extension activation/deactivation; `ExtensionStream`; context keys; project directory; host/container detection; stream selection; common commands; setup/open/reopen flows; top-level event routing; tree-view activation.
- `src/enums/ExtensionState.ts` — setup/project-state values projected to `swiftstream.state`.
- `src/helpers/openProject.ts`, `src/helpers/selectFolderHelper.ts` — project/folder opening helpers.
- `src/commands/reopenInContainer.ts`, `src/commands/rebuildContainer.ts`, `src/commands/sshHostInstructions.ts` — key container/host UX commands.

Architecture owner: `architecture/EXTENSION_LIFECYCLE_AND_STATE.md`.

## VS Code Surface and Sidebar

- `package.json` — declarative VS Code surface.
- `src/sidebarTreeView.ts` — dynamic sidebar tree, error nodes, mounts, settings, feature/recommendation/support sections, expanded-state persistence, dynamic commands.
- `src/streams/stream.ts` — shared command registration and common tree-item providers.
- `src/streams/*/*Stream.ts` — stream-specific command registrations/items.
- `src/streams/*/features/**` and `src/streams/anyFeature.ts` — feature-specific command/items.
- `src/commands/{loggingLevel,hotRebuild,clearLogOnRebuild,toolchain,mountNewItem,restartLSP,resolvePackages,updatePackages,clearCaches}.ts` — common user actions surfaced through sidebar/settings.

Architecture owner: `architecture/VSCODE_SURFACE_AND_SIDEBAR.md`.

## Shared Stream Runtime

- `src/streams/stream.ts` — base `Stream`; shared runtime flags; `Bash`, `Toolchain`, `Swift`, `Pgrep`; common settings/subscriptions/commands; base build/run/test/feature behavior; save handling.
- `src/streams/anyFeature.ts` — shared optional feature lifecycle.

Architecture owner: `architecture/STREAM_RUNTIME.md`.

## Stream Families

### Android

- `src/streams/android/androidStream.ts`
- `src/streams/android/commands/**`
- `src/androidStreamConfig.ts` — `.vscode/android-stream.json`, SDK/package/scheme configuration.
- `src/androidAppProject.ts`, `src/androidLibraryProject.ts`
- `src/gradle.ts`, `src/gradlew.ts`
- `schemas/android-stream.schema.json`

### Embedded

- `src/streams/embedded/embeddedStream.ts`
- `src/streams/embedded/commands/build.ts`
- `src/streams/embedded/commands/flash.ts`
- `src/embeddedStreamConfig.ts`
- `src/embeddedBuildTaskRunner.ts`
- `schemas/embedded-stream.schema.json`

### Pure

- `src/streams/pure/pureStream.ts`
- `src/streams/pure/commands/**`

### Server

- `src/streams/server/serverStream.ts`
- `src/streams/server/features/**` — server feature adapters, including active and dormant/in-progress integrations. `ServerStream.features()` is the current authority for which adapters are actually exposed by the Server stream.

### Web

- `src/streams/web/webStream.ts` — web settings/runtime, ports, hot rebuild/reload, browser debugging, web feature collection.
- `src/streams/web/commands/**` — web build/release/hot-reload/ports/browser/WebSocket/suggestion operations.
- `src/streams/web/features/**` — web hosting/service feature adapters.
- `src/{webpack,npm,wasm,gzip,brotli,crawlServer}.ts` — web build/runtime helpers.

Use the stream tree only after routing the behavior through `ARCH_INDEX.md`; a stream directory is not always the primary architecture owner.

## Process / Swift / Build Runtime

- `src/bash.ts` — child process execution, shell env lookup, result/error model, `AbortHandler`.
- `src/swift.ts` — SwiftPM package inspection, build/run/task mechanics, build modes/SDK flags, diagnostics parsing.
- `src/swiftPackageDump.ts` — Swift package dump/cache interpretation.
- `src/pgrep.ts` — process lookup helper.
- `src/readelf.ts` — binary inspection helper.
- `src/commands/build/**` — shared package/dependency/build helpers.
- stream-specific `src/streams/*/commands/**` — higher-level operation orchestration.

Architecture owner: `architecture/PROCESS_BUILD_RUN_RUNTIME.md`.

## Project Creation and Generation

- `src/wizards/startNewProjectWizard.ts` — current project-creation webview/orchestrator and stream-specific generated project logic.
- `src/helpers/fileBuilder.ts` — programmatic source-file builder used by generation.
- `src/helpers/filesHelper.ts` — extension-relative file reads/copies/checksums/platform helpers.
- `src/helpers/sortLibraryFilePaths.ts` — library asset classification used by web generation.
- `src/androidStreamConfig.ts`, `src/androidAppProject.ts`, `src/androidLibraryProject.ts` — Android generated/configured project semantics.
- `src/embeddedStreamConfig.ts` — embedded project configuration semantics.
- `assets/Sources/**` — generated project source/static/template inputs.
- `assets/Sources/Package.hbs` — shared Swift package manifest template used by several generator branches.

Architecture owner: `architecture/PROJECT_BOOTSTRAP_AND_GENERATION.md`; asset contracts: `architecture/ASSETS_TEMPLATES_AND_SCHEMAS.md`.

## Devcontainer and Toolchains

- `src/devContainerConfig.ts` — consumer devcontainer read/write transaction API and core generator.
- `toolchains.json` — toolchain/artifact catalog.
- `src/toolchain.ts` — catalog lookup/selection and in-container toolchain paths/current/pending state.
- `src/commands/toolchain.ts` — user-facing toolchain change behavior.
- `src/helpers/readPortsFromDevContainer.ts` — runtime port extraction.
- `src/commands/mountNewItem.ts` — devcontainer mount mutation.
- `assets/Devcontainer/**` — copied consumer-project Dockerfiles/scripts by stream/embedded board.

Architecture owner: `architecture/DEVCONTAINER_AND_TOOLCHAINS.md`.

## Optional Feature Integrations

- `src/streams/anyFeature.ts` — shared adapter lifecycle.
- `src/streams/server/features/**` — server adapters.
- `src/streams/web/features/**` — web adapters.
- `features/**` — Dev Container Feature implementation/package source (install scripts/metadata/docs per feature).
- consumer `.devcontainer/devcontainer.json` `features` field — generated/user project state, not repository source authority.

Architecture owner: `architecture/FEATURE_INTEGRATIONS.md`.

## Assets, Docs, Media, and Schemas

- `assets/Sources/**` — consumer-project source/static/template inputs.
- `assets/Devcontainer/**` — consumer-project container inputs.
- `assets/Docs/**` — stream/user documentation opened from the extension.
- `assets/icons/**`, `media/**` — extension/sidebar/webview/public media.
- `schemas/**` — contributed project config schemas.

Architecture owner: `architecture/ASSETS_TEMPLATES_AND_SCHEMAS.md`.

## Docker Image Sources

- `docker-images/base/{focal,noble}/Dockerfile`
- `docker-images/android-dev/**`
- `docker-images/server-{dev,prod}/**`
- `docker-images/web-{dev,prod}/**`
- `docker-images/embedded-{esp32,nrf,raspberry,stm32}/**`
- `docker-images/dev-base.sh`

Architecture owner: `architecture/DOCKER_IMAGES.md`.

## Tests and Validation Entry Points

- `src/test/extension.test.ts` — current small VS Code-hosted integration test suite; do not treat it as comprehensive project coverage.
- `npm run compile` — webpack extension build.
- `npm run compile-tests` — TypeScript test compilation.
- `npm run lint` — ESLint over `src`.
- `npm test` — configured VS Code test workflow (via pretest + `vscode-test`).
- `npm run package` — production webpack bundle used by prepublish.

Generated-project/container/image/device/browser/cloud behavior may require additional focused validation outside this test file. Policy owner: `TESTING_RULES.md`.

## Non-Authority Local State

Editor state, local caches, generated `dist/out`, `node_modules`, test runtime directories, packaged VSIX files, consumer projects created for probes, and `.artifacts/**` are not stable product architecture authority.

