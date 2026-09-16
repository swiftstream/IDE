# Style Guidelines

Common TypeScript/repository implementation conventions for Swift Stream IDE. Architecture owners remain authoritative for behavior and ownership.

## Preserve Existing Product Behavior by Default

- Make the smallest change required by the accepted task.
- Do not mix feature/fix work with broad formatting, naming modernization, file moves, dependency upgrades, or unrelated cleanup.
- Existing user project compatibility matters: generator/devcontainer/schema changes can affect projects created by older extension versions or user-customized configurations.
- Add a new abstraction only when it has a concrete current owner/lifecycle and reduces real duplication or ambiguity. Avoid speculative managers/factories/protocol-like layers for hypothetical future streams/features.

## TypeScript and Formatting

- Follow the repository's current TypeScript style: tabs are common in source, semicolons are generally omitted, and existing local formatting should be preserved rather than normalized repository-wide.
- `tsconfig.json` uses `strict: true` with `noImplicitAny: false`. Prefer explicit useful types for public/cross-file contracts and new complex data shapes even where existing code uses `any`.
- Do not weaken compiler configuration to make a change compile.
- Use `const` by default when a binding is not reassigned; use `let` only for actual reassignment. Do not rewrite unrelated legacy `var` usage as cleanup.
- Prefer direct readable control flow over compressed clever expressions when lifecycle/filesystem/process behavior is involved.
- Use repository terminology consistently: extension, stream, feature, devcontainer, toolchain, project, build mode, target, scheme, pending rebuild.

## Async / VS Code Lifecycle

- Await operations whose completion/order matters. Do not introduce fire-and-forget async work accidentally, especially around file writes, process execution, VS Code commands, project opening, build state, or generated output.
- Add VS Code event/command/task registrations to the appropriate disposable ownership when their lifetime matches the extension/session.
- When dynamically replacing commands/listeners, dispose the previous registration deliberately.
- Keep UI/context flags coherent across success, error, early return, and cancellation paths.

## Filesystem and Paths

- Use `path`/`Uri` helpers for host filesystem paths instead of manual separators. Remember the extension runs on Windows, Linux, and macOS while many in-container paths are intentionally Linux paths.
- Before destructive replacement/removal of user/project files, define ownership and collision behavior. Never broaden deletion scope for convenience.
- Repository asset paths should be resolved through established extension-relative helpers when running from packaged extension output.
- Do not assume a generated project directory is empty unless the user flow guarantees it.

## Configuration

- JSON/JSON5/devcontainer/stream config mutations should preserve unrelated user-managed fields where the operation is incremental.
- Keep declarative `package.json` settings/commands/menu/context contracts synchronized with runtime readers/handlers.
- Preserve exact enum/string values that cross process/devcontainer/VS Code configuration boundaries unless a migration is explicitly designed.

## Process and Environment Handling

- Pass executable arguments as argument arrays through established process abstractions when possible; avoid shell-string construction for dynamic untrusted values.
- Treat `cwd`, environment, exit code, stdout/stderr, and cancellation as part of the command contract.
- Do not log secrets, credentials, authorization headers, private keys, or tokens.
- Avoid new global `process.env` mutation when an operation-local environment copy can express the required input safely.

## Generator / Template Work

- Find the actual owner of the output before editing: TypeScript programmatic generation, `FileBuilder`, Handlebars template, copied static asset, devcontainer generator, stream config, or root feature package.
- Keep templates simple; nontrivial branching/ownership logic normally belongs in typed TypeScript when practical.
- Validate rendered/copied output after changes; a template compiling as text is not proof of correctness.

## Comments

- Comments explain non-obvious intent, compatibility constraints, lifecycle hazards, or why a surprising operation is necessary.
- Do not narrate obvious syntax or attribute code to an AI/coding agent.
- Preserve useful historical compatibility comments; remove stale comments when changing the behavior they describe.

## Public/Contribution Surface

- Command IDs, setting keys, context keys, schema property names, generated configuration keys, environment keys, and consumer-project filenames are compatibility surfaces. Rename only with an explicit migration/compatibility plan.
- Existing typos in user-visible/public identifiers are not automatically safe to “fix” if projects/config/keybindings may depend on them.

