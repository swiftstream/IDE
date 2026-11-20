# Project Bootstrap and Generation

Owner of `GEN-*` architecture rules.

Primary source: `src/wizards/startNewProjectWizard.ts`, stream/project configuration classes, project helpers, and the repository-owned inputs routed through `ASSETS_TEMPLATES_AND_SCHEMAS.md` and `DEVCONTAINER_AND_TOOLCHAINS.md`.

## `GEN-001` — Repository Inputs, Consumer Outputs

Swift Stream generates or copies files into user-selected consumer project directories. Repository-owned TypeScript/template/catalog/assets are source authority; generated consumer files are outputs/evidence.

Do not fix a generator bug by editing one generated project and calling the repository fixed.

## `GEN-002` — Wizard Is the Current Orchestrator

`startNewProjectWizard()` owns the current webview-based project-creation interaction and `createNewProjectFiles(...)` orchestrates stream-specific creation.

The current implementation is large and branch-heavy. Refactoring it may be valuable, but no new abstraction is justified merely by file size; any split must preserve output semantics and user prompts branch-by-branch.

## `GEN-003` — Generated Stream Branches Are Independent Compatibility Surfaces

Current generation includes separate paths for web, server, Android, embedded, and pure projects, with further sub-choices such as web app/library style, server framework, Android package mode, and embedded board family.

A generation change must enumerate affected branches. Validate each changed branch; do not infer untouched variants from one successful project.

## `GEN-004` — Devcontainer Generation Is Delegated to the DEV Owner

The wizard uses `generateAndWriteDevcontainerJson(...)` rather than owning the core devcontainer shape. Stream-specific project creation may subsequently adjust ports or copy the appropriate Dockerfile/source assets.

If a generation task changes core devcontainer/toolchain semantics, `DEVCONTAINER_AND_TOOLCHAINS.md` is a supporting owner and its validations apply.

## `GEN-005` — Assets and Programmatic Generation May Coexist

Some consumer files are copied from `assets/**`, some rendered through Handlebars, and some written programmatically with `FileBuilder`, object serialization, or direct strings.

Before changing a generated file type, identify its actual owner path rather than assuming every generated file is a Handlebars template.

## `GEN-006` — User Data/Overwrite Behavior Must Be Deliberate

The wizard may create directories and may prompt before overwriting an existing `Package.swift`. Any change that can replace existing consumer configuration/source must explicitly define collision behavior, backup/prompt semantics, and partial-failure consequences.

Do not silently expand overwrite scope.

## `GEN-007` — Partial Creation Is a Real Failure Mode

Project creation performs many filesystem operations. A mid-generation failure can leave a partially created directory. New multi-step generation behavior must make failure boundaries understandable and avoid deleting pre-existing user content as rollback unless explicitly designed and authorized.

## `GEN-008` — Generation Validation Uses Produced Files

For changed generation behavior, acceptance evidence includes representative output, not only TypeScript compilation. Inspect exact generated files/fields/paths relevant to the change.

Where a branch invokes platform/external tooling after initial file generation, separate deterministic file-generation validation from expensive/live follow-up execution.

## `GEN-009` — PWA Service Images Are Web Assets, Not SwiftPM Resources

Generated PWA Service images under `Sources/<ServiceTarget>/images/**` must be excluded from the SwiftPM target resource set and transported directly by the IDE web resource phase into the public output tree.

Do not reintroduce those images as SwiftPM target resources: SwiftPM resource accessor generation adds a Foundation-backed WASM size/ICU dependency edge that this packaging boundary intentionally avoids.

