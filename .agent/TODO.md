# Future Ideas

Curated future product/engineering ideas that are not accepted active tasks and are not confirmed technical debt.

No entries are imported automatically from source `TODO` comments. Source TODOs remain local implementation notes until deliberately reviewed and promoted.

## Entry Shape

```text
- IDEA-NNN — short description — relevant owner/stream — rationale
  - Current scaffold: what already exists but is intentionally incomplete/dormant.
  - Source anchors: commit(s) and file(s) that preserve the unfinished work.
  - Completion boundary: concrete work required before the idea may be treated as supported behavior.
```

## Promoted Deferred WIP — 2026-11-19

These entries were deliberately promoted by the maintainer after the IDE 1.18.0 working tree was reconciled and the previously protected WIP was committed separately. A referenced scaffold, class, menu item, placeholder, or comment is not evidence that the capability is currently supported.

- IDEA-001 — Editable build/run arguments for Pure and Server — Pure/Server — preserve the unfinished arguments-control concept without presenting the current placeholder as product behavior.
  - Current scaffold: `PureStream.argsMenuElement()` registers `DebugBuildArguments` with an empty command handler, a hardcoded example value `--static-swift-stdlib -Xlinker -ljemalloc`, and a still-commented menu insertion.
  - Source anchors: commit `fd8c2017037d9bec9c62046d28a2b08d241967a4`; `src/streams/pure/pureStream.ts`.
  - Completion boundary: define whether arguments are build-only, run-only, or both; define debug/release and target scoping; provide editable persisted values instead of the hardcoded example; thread the selected arguments into the actual build/run commands; expose the UI intentionally; add focused tests.

- IDEA-002 — Embedded build-system discovery and orchestration — Embedded — turn the preserved ESP32/Raspberry Pi Pico/STM32/NRF build notes into deterministic project behavior.
  - Current scaffold: comments describe ESP-IDF via `idf.py`, Makefile projects, CMake/Ninja configure-and-build flows, fallback `build.sh`/ELF scripts, board environment variables, build-cache clearing, and prompting for a first build to enable autocomplete.
  - Source anchors: commit `4d60b74d0ff2ae24e382789c5fc9c7078b2a22e1`; `src/streams/embedded/commands/build.ts`.
  - Completion boundary: define deterministic build-system detection priority per Embedded branch; implement configure/build/rebuild/clean execution; handle required board variables such as `PICO_BOARD`, `STM_BOARD`, and NRF board selection; persist the chosen build-system details in project-owned configuration; provide a safe first-build/autocomplete flow; validate each supported branch independently.

- IDEA-003 — Embedded hot rebuild control — Embedded — retain the intended hot-rebuild UX that is currently only a commented sidebar sketch.
  - Current scaffold: `debugOptionItems()` now has an empty mutable items list containing a commented `Hot rebuild` dependency sketch, with an explicit ESP32 exclusion in the draft condition.
  - Source anchors: commit `4d60b74d0ff2ae24e382789c5fc9c7078b2a22e1`; `src/streams/embedded/embeddedStream.ts`.
  - Completion boundary: define which Embedded branches can safely hot rebuild, implement durable enabled/disabled state, connect save/build/runtime behavior, expose the sidebar control only for supported branches, and validate that unsupported branches remain unchanged.

- IDEA-004 — ESP32 component-management actions — Embedded/ESP32 — retain the planned ESP-IDF component workflow beyond ordinary build/flash operations.
  - Current scaffold: source notes preserve `idf.py reconfigure`, `idf.py add-dependency`, an example component dependency, and the ESP Component Registry URL.
  - Source anchors: commit `4d60b74d0ff2ae24e382789c5fc9c7078b2a22e1`; `src/streams/embedded/embeddedStream.ts`.
  - Completion boundary: define sidebar/menu ownership, implement reconfigure and add-dependency actions with input/error handling, provide an explicit registry-opening action, refresh project/build metadata after changes, and add focused validation.

- IDEA-005 — SFTP deployment provider — Server — preserve the substantial but intentionally disabled SFTP deployment implementation until its configuration and deployment flow is complete.
  - Current scaffold: a 307-line `SFTP` `CloudFeature` exists and is constructed by `ServerStream`, but it remains commented out of `features()`. The UI model contains server profiles, address/port/username/auth/passphrase, connection test, destination path, remote command, full deploy, and quick deploy. Several edit/test methods are empty and `deploy`/`quickDeploy` remain TODO-only.
  - Source anchors: commit `bc7ef5f6708530a30c3cfc8e53c24a28dcf63c43`; `src/streams/server/features/sftp.ts`, `src/streams/server/serverStream.ts`.
  - Completion boundary: finish profile creation/edit/removal and config persistence; define authentication handling; implement connection testing; implement full and quick artifact transfer plus optional remote command execution; surface actionable failures; make registration/lifecycle safe; enable the feature in `features()` only after focused tests and live deployment acceptance.

- IDEA-006 — Coolify deployment provider — Server — retain the provider slot without implying an implemented Coolify integration.
  - Current scaffold: `src/streams/server/features/coolify.ts` is intentionally only an empty placeholder.
  - Source anchors: commit `bc7ef5f6708530a30c3cfc8e53c24a28dcf63c43`; `src/streams/server/features/coolify.ts`.
  - Completion boundary: first define the supported Coolify deployment/authentication contract and project mapping, then implement the provider, configuration UI, deployment lifecycle, errors/status, tests, and live acceptance before registering it as a Server feature.

- IDEA-007 — Complete Fly.io deployment/environment UX — Server/Fly.io — retain follow-up work around the existing Fly.io feature.
  - Current scaffold: source notes call for an Environment Variables action, completing deploy-to-Fly.io behavior, and continuing naturally from successful login into deployment.
  - Source anchors: commit `bc7ef5f6708530a30c3cfc8e53c24a28dcf63c43`; `src/streams/server/features/flyio.ts`, `src/streams/server/serverStream.ts`.
  - Completion boundary: implement environment-variable management, define login-to-deploy continuation, close the intended full deployment flow, and validate status/error behavior against a real Fly.io project.

- IDEA-008 — Multi-stream target model — Core/Streams — explore a project model where target selection is above a single stream and one workspace can add/build/run targets of different Swift Stream types.
  - Current scaffold: `ServerStream` contains the preserved design note for a `MULTI` stream with a top-level target selector and add-target flow covering Pure, Server, Web, Android, and Embedded.
  - Source anchors: commit `bc7ef5f6708530a30c3cfc8e53c24a28dcf63c43`; `src/streams/server/serverStream.ts`.
  - Completion boundary: define ownership of project/target configuration, how per-target stream state is isolated, sidebar/navigation semantics, build/run command routing, and migration/backward compatibility before implementation.

- IDEA-009 — Server/static runtime size and allocator optimization — Server/Pure — retain the ideas to evaluate allocator choice and reduce static binary size without asserting either optimization is currently required.
  - Current scaffold: source notes mention evaluating `mimalloc` for musl/glibc and using `FoundationEssentials` where practical to reduce binary size.
  - Source anchors: commit `bc7ef5f6708530a30c3cfc8e53c24a28dcf63c43`; `src/streams/server/serverStream.ts`.
  - Completion boundary: measure current glibc/musl binary size and runtime behavior first; prove compatibility/performance benefit for any allocator change; determine where `FoundationEssentials` is dependency-compatible; only then make product changes with reproducible before/after evidence.

- IDEA-010 — Web native/WASI recompilation and WASI-mode controls — Web — retain the planned explicit controls for rebuilding native vs WASI products and switching ordinary WASI vs threaded WASI modes.
  - Current scaffold: `ServerStream` preserves notes for `RecompileNative`, `RecompileWASI`, and switching normal/wasip1-threads behavior; no user-visible implementation is asserted.
  - Source anchors: commit `bc7ef5f6708530a30c3cfc8e53c24a28dcf63c43`; `src/streams/server/serverStream.ts`.
  - Completion boundary: move ownership to the Web stream, define mode persistence and availability from the selected toolchain/SDK, implement explicit native/WASI rebuild actions, integrate threaded-WASI selection with build/output discovery, and validate both modes.

- IDEA-011 — Packages Explorer TreeView — SwiftPM/Core UI — retain the planned package-focused sidebar independent from the existing stream trees.
  - Current scaffold: source notes describe a dedicated Packages Explorer with flat and dependency-tree presentation plus a right-click `swift package edit <package-name>` action.
  - Source anchors: commit `bc7ef5f6708530a30c3cfc8e53c24a28dcf63c43`; `src/streams/server/serverStream.ts`.
  - Completion boundary: define package graph source/refresh lifecycle, flat vs dependency-tree UI, edited-package state, safe invocation of `swift package edit`, error handling, and regression coverage for package graph changes.

- IDEA-012 — Feature hierarchy cleanup — Core/Sidebar — retain the design note that not every capability should appear as a root feature.
  - Current scaffold: `ServerStream` notes that some capabilities, with ThemeColor/language-file generation given as an example, should remain nested under Features rather than becoming root-level items.
  - Source anchors: commit `bc7ef5f6708530a30c3cfc8e53c24a28dcf63c43`; `src/streams/server/serverStream.ts`.
  - Completion boundary: inventory current root/nested feature ownership, define a stable hierarchy rule, migrate only after preserving command IDs/state and sidebar behavior, and validate extension activation/menu compatibility.

- IDEA-013 — Investigate the preserved SwifWeb phase-9 unused-index failure note — Web — retain the report without promoting it to a verified regression prematurely.
  - Current scaffold: `ServerStream` contains a note that obtaining an index which is not used in the app declaration can surface an optional-unwrapping failure visible around phase 9 in Unbearable logging.
  - Source anchors: commit `bc7ef5f6708530a30c3cfc8e53c24a28dcf63c43`; `src/streams/server/serverStream.ts`.
  - Completion boundary: reproduce the failure in a minimal Web project, identify the owning source path and exact trigger, add a focused regression test or approved live reproducer, and move it to `.agent/REGRESSIONS.md` only if independently verified.
