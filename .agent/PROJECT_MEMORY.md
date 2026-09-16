# Project Memory

Durable, verified current-state facts that are useful across tasks and not obvious enough to rediscover every time. This is not a roadmap, task list, or execution diary.

## Product

- Package name: `swiftstream`; display name: `Swift Stream IDE`.
- The repository builds a VS Code extension whose bundled entrypoint is `dist/extension.js`.
- Current declared extension version in `package.json`: `1.18.0`.
- The extension is intended for containerized Swift development across Windows/Linux/macOS hosts, with development tools running in Dev Containers or related remote/container workflows.
- Current source stream families are Web, Server, Android, Embedded, and Pure.

## Runtime Shape

- `src/extension.ts` is the activation/root orchestrator.
- `src/streams/stream.ts` is the shared stream runtime base; concrete streams live under `src/streams/<stream>/`.
- Consumer devcontainer `containerEnv.S_MODE` becomes in-container `S_MODE` and selects the active stream.
- Current project selection assumes the first VS Code workspace folder; multi-root support is not established.
- `src/sidebarTreeView.ts` is the central dynamic sidebar projection/router.

## Build / Toolchain Shape

- Toolchain catalog data lives in `toolchains.json`; selection/runtime paths are implemented in `src/toolchain.ts`.
- Core consumer devcontainer generation and mutation live in `src/devContainerConfig.ts`.
- Shared child-process execution/cancellation lives in `src/bash.ts`; SwiftPM/build-mode mechanics live primarily in `src/swift.ts`.

## Project Generation

- `src/wizards/startNewProjectWizard.ts` is the current large project-generation orchestrator.
- Generated project inputs are a mix of programmatic TypeScript generation, `FileBuilder`, Handlebars rendering, and copied files from `assets/Sources/**` / `assets/Devcontainer/**`.
- Generated consumer projects are not repository source authority.

## Features and Images

- `src/streams/anyFeature.ts` is the shared extension-side optional feature lifecycle owner.
- Root `features/**` contains Dev Container Feature source/package material and is a different layer from TypeScript feature adapters.
- Root `docker-images/**` owns Swift Stream image build contexts and is distinct from consumer project `assets/Devcontainer/**`.

## Validation Reality

- TypeScript is configured with `strict: true`, target/lib ES2022, Node16 modules, and `noImplicitAny: false`.
- Repository scripts include webpack compile/package, TypeScript test compile, ESLint, and VS Code-hosted tests.
- The current `src/test/extension.test.ts` suite is small and does not provide comprehensive coverage of streams/generation/container/device/external integrations.

## Agent Workflow

- `.artifacts/` is intentionally Git-ignored disposable working memory.
- Stable governance is rooted at `AGENTS.md` and `.agent/**`; artifacts never become permanent architecture authority.
- IDE staging/commit/push are maintainer-controlled and are not standing-authorized for agents.

