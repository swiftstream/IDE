# Architecture Index

Authoritative technical-architecture router for Swift Stream IDE. Every architecture ID family has exactly one owner. Supporting documents may reference an owner but must not redefine its complete contract.

## Architecture Owners

| ID family | Sole owner | Concept |
| --- | --- | --- |
| `EXT-*` | `architecture/EXTENSION_LIFECYCLE_AND_STATE.md` | VS Code activation, host/container mode, extension state, stream selection, event lifecycle |
| `STREAM-*` | `architecture/STREAM_RUNTIME.md` | shared `Stream` runtime and stream-specific ownership/boundaries |
| `PROC-*` | `architecture/PROCESS_BUILD_RUN_RUNTIME.md` | subprocess/task execution, Swift/build/run/test/debug/flash lifecycle, cancellation and diagnostics |
| `GEN-*` | `architecture/PROJECT_BOOTSTRAP_AND_GENERATION.md` | new-project wizard, project bootstrap, generated consumer-project ownership and overwrite behavior |
| `DEV-*` | `architecture/DEVCONTAINER_AND_TOOLCHAINS.md` | devcontainer config/generation, stream environment, toolchain catalog/resolution, mounts/ports/rebuild semantics |
| `FEAT-*` | `architecture/FEATURE_INTEGRATIONS.md` | optional feature lifecycle, stream adapters, Dev Container Feature packages, project feature config |
| `UI-*` | `architecture/VSCODE_SURFACE_AND_SIDEBAR.md` | `package.json` contributions, commands, context keys, tree view, settings/menu coherence |
| `ASSET-*` | `architecture/ASSETS_TEMPLATES_AND_SCHEMAS.md` | repository assets/templates/docs/schemas and source-vs-generated boundaries |
| `IMG-*` | `architecture/DOCKER_IMAGES.md` | `docker-images/**` source/build contexts and image compatibility boundaries |

Do not create a new owner merely because a new directory/file appears. Add an owner only when a distinct durable architecture boundary exists.

## Task Routing

- Extension activation, workspace/open-folder state, outside-vs-inside-container behavior, `S_MODE`, stream instance selection, workspace event wiring: `EXTENSION_LIFECYCLE_AND_STATE.md` primary.
- Common `Stream` behavior, stream overrides, stream-specific settings/actions/features/save handling: `STREAM_RUNTIME.md` primary.
- Swift/Gradle/npm/process execution, build modes, task providers, cancellation, compile diagnostics, run/debug/flash/test lifecycle: `PROCESS_BUILD_RUN_RUNTIME.md` primary; add the relevant stream owner as supporting context when orchestration changes.
- New project wizard, package/source generation, stream-specific project shape, overwrite/create semantics: `PROJECT_BOOTSTRAP_AND_GENERATION.md` primary; add `ASSETS_TEMPLATES_AND_SCHEMAS.md` when template/assets change and `DEVCONTAINER_AND_TOOLCHAINS.md` when generated container/toolchain semantics change.
- `.devcontainer` fields, ports/mounts/features, Swift version/toolchain choice, `toolchains.json`, SDK/artifact URLs, rebuild-required mutations: `DEVCONTAINER_AND_TOOLCHAINS.md` primary.
- Optional hosting/tool integration, `AnyFeature`, stream feature classes, root `features/**` package content, integrate/setup/login/deintegrate behavior: `FEATURE_INTEGRATIONS.md` primary; add `DEVCONTAINER_AND_TOOLCHAINS.md` if feature insertion/removal semantics change.
- Command IDs, keybindings, settings, menus, `when` clauses, context keys, activity/sidebar tree rendering and menu routing: `VSCODE_SURFACE_AND_SIDEBAR.md` primary; add the behavior owner that actually executes the command.
- `assets/Sources/**`, `assets/Devcontainer/**`, docs/media copied into projects, Handlebars input, contributed JSON schemas: `ASSETS_TEMPLATES_AND_SCHEMAS.md` primary; generation owner supports when output behavior changes.
- Base/dev/prod container-image Dockerfiles/scripts/nginx/tool binaries under `docker-images/**`: `DOCKER_IMAGES.md` primary; add `DEVCONTAINER_AND_TOOLCHAINS.md` only when generated devcontainer inputs or catalog contracts also change.
- Tests only: route to the owner of the behavior under test, with `TESTING_RULES.md` as policy.
- Cross-cutting stream feature: choose the owner of the behavior itself, then load only affected stream implementations and up to two supporting architecture owners by default.

## Operational Owners

These are stable workflow/policy docs, not architecture-ID owners:

- development phases and validation ladder: `WORKFLOW.md`;
- coordinator/executor/auditor roles: `DEVELOPMENT_ORCHESTRATION.md`;
- disposable `.artifacts/**` mechanics: `ARTIFACTS_WORKFLOW.md`;
- Git/worktree safety: `COMMIT_RULES.md`;
- progressive context: `CONTEXT_LOADING_RULES.md`;
- source navigation: `SOURCE_MAP.md`;
- implementation conventions: `STYLE_GUIDELINES.md`;
- test/validation policy: `TESTING_RULES.md`;
- operational procedures: `SKILL_INDEX.md` and `.agent/skills/**`.

Operational policy docs do not consume architecture-owner slots.

