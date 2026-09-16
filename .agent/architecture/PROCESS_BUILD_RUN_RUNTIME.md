# Process, Build, Run, and Runtime Operations

Owner of `PROC-*` architecture rules.

Primary source includes `src/bash.ts`, `src/swift.ts`, process/tool wrappers such as `src/{gradle,gradlew,npm,webpack,wasm,gzip,brotli,pgrep,readelf}.ts`, `src/embeddedBuildTaskRunner.ts`, shared build commands, and stream-specific `commands/**`.

## `PROC-001` — One Process Boundary, Explicit Results

`Bash.execute` is the main child-process abstraction for executable lookup/spawn, stdout/stderr capture, result/error conversion, working directory/environment, and cancellation integration.

New process execution should reuse an established process/task abstraction when its semantics fit rather than adding ad-hoc untracked child processes.

## `PROC-002` — Cancellation Is Part of the Operation Contract

`AbortHandler` tracks spawned processes and cancellable task runners. Build/run/test/flash flows that claim to be stoppable must register the relevant execution with their cancellation owner and bring UI/runtime flags back to a coherent terminal state.

Cancellation validation must cover the real process/task boundary, not only command invocation or menu-state change.

## `PROC-003` — Swift Owns SwiftPM/SDK Argument Semantics

`src/swift.ts` owns package inspection, Swift targets/products, SwiftPM resolve/update/build/run/test-related mechanics, build path selection, build modes, SDK/triple flags, Android SDK modes, WASI modes, and compiler diagnostic parsing used by the extension.

Stream code should orchestrate Swift operations rather than recreate low-level Swift command construction unless a stream-specific tool genuinely requires a separate mechanism.

## `PROC-004` — Build Modes Are Semantic, Not Display Strings

Native, static Linux, WASI/threads, Android architectures, debug/release, and embedded/device-specific paths can change compiler/linker arguments, artifact locations, and runtime follow-up steps.

Changing a mode requires validating the exact arguments/output path and every stream UI/config value that can select it.

## `PROC-005` — Working Directory and Environment Are Inputs

Process behavior depends on `cwd` and environment values such as `SWIFT_MODE`, stream/toolchain/devcontainer variables, SDK paths, and tool-specific settings.

Do not treat environment mutation as harmless global state. When adding/changing environment values, define which process should observe them and avoid leaking one operation's transient environment into unrelated later work.

## `PROC-006` — Diagnostics Feed Product UI

Compiler/build output is parsed into sidebar-visible errors/warnings/notes. Changes to execution output handling or parsing may affect both terminal/log behavior and the VS Code tree.

Validate representative success and failure output when changing parsing. A build command returning non-zero without surfaced actionable diagnostics is a user-facing regression even if the process layer technically detected failure.

## `PROC-007` — Broad/External Operations Have Explicit Side Effects

Docker/container rebuilds, npm/package operations, cloud/deployment features, device flashing, browser debugging, SSH/SFTP, and hosted VS Code tests may perform network, filesystem, device, UI, or long-running process side effects.

Plans and delegated verification must name those effects and never launch live/destructive operations merely to obtain evidence when a cheaper deterministic boundary proves the change.

## `PROC-008` — Runtime Evidence Is Candidate-Bound

When a build/test/device/live result is used as load-bearing acceptance evidence, record enough source/command/environment identity to know which candidate it validated. If source materially changes afterward, treat old runtime evidence as stale for the changed behavior.

