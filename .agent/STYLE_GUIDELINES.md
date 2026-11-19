# Style Guidelines

Swift Stream IDE implementation style. Architecture files define behavior and ownership; this file defines how code should look. Local file style wins over generic preferences unless correctness requires otherwise.

## Core TypeScript Style

- Preserve surrounding formatting. Do not reindent/reformat unrelated code.
- Semicolons are generally omitted.
- Prefer single quotes in new TypeScript; use template literals for interpolation and existing path/log patterns.
- Keep opening braces on the declaration/control-flow line.
- Prefer early returns and direct control flow over deep nesting.
- Compact guards are normal when obvious: `if (!projectDirectory) return`.
- Existing indentation is mixed historically (tabs and spaces). Match the touched block/file; never normalize whole files.
- Do not run broad Prettier/formatting cleanup as part of focused work.

## Bindings, Types, APIs

- Use `const` when not reassigned, `let` for reassignment.
- Do not rewrite unrelated legacy `var` merely as modernization.
- Prefer explicit interfaces/type aliases for cross-file contracts and nontrivial data.
- Inline typed `options: { ... }` objects are preferred when several related parameters travel together.
- `any` is acceptable at existing legacy/test/integration boundaries, but do not spread it when a useful type is easy to express.
- Keep `strict: true`; never weaken compiler settings to land a change.
- Small getters/helpers may remain one-line when that matches the file.
- Add abstractions only for a concrete current owner or real duplication; avoid speculative manager/factory layers.

## Naming and Imports

- Types/classes/interfaces/enums: `PascalCase`.
- Functions/methods/variables/properties: `camelCase`.
- Preserve established domain spelling: `DevContainer`, `SourceKit`, `SwiftPM`, `NDK`, `SDK`, `ABI`, `Droid`.
- Public/config/environment identifiers are compatibility surface; preserve exact spelling/casing.
- Use extensionless relative imports.
- Do not reorder unrelated imports or introduce barrel layers just for style.
- Prefer importing the concrete owner directly.

## Equality, Errors, Async

- Prefer `===` / `!==` in new validation and identity-sensitive code.
- Do not mass-convert existing `==` / `!=` during unrelated work.
- New validation/fail-closed boundaries should normally throw `new Error(...)` with a concrete reason.
- Do not rewrite unrelated historical string throws solely for modernization.
- Await work when completion/order matters.
- Do not remove `await` / `return await` only as stylistic cleanup.
- Avoid accidental fire-and-forget work around build state, processes, filesystem writes, generation, VS Code commands, and cleanup.

## Semicolonless ASI Safety

When a statement must begin with `(`, use the repository's defensive leading semicolon instead of adding semicolons everywhere:

```ts
const original = DevContainerConfig.swiftVersion
;(DevContainerConfig as any).swiftVersion = () => ({ major: 6, minor: 4, patch: 0 })
try {
    // ...
} finally {
    ;(DevContainerConfig as any).swiftVersion = original
}
```

## Paths and Configuration

- Use established `path` / `Uri` helpers for new host-path-sensitive code.
- Preserve intentional Linux/container path strings.
- Lexical and canonical paths can have different contracts; canonicalize only when identity requires it.
- Incremental JSON/JSON5/devcontainer/config edits must preserve unrelated user-owned fields.
- Keep schema keys, generated config keys, environment keys, and runtime readers synchronized.

## Tests

- Use the existing Mocha surface: `suite`, `test`, `setup`, `teardown`.
- Use Node `assert` directly.
- Test names are descriptive sentence-style strings.
- Use deterministic temporary directories and explicit cleanup.
- Monkey-patched static/module APIs must be restored in `finally`.
- Assert exact ordering, bytes, objects, or paths when those are the contract.
- Prefer `assert.match` for stable semantic error fragments.
- Tests should prove the failed boundary, not merely duplicate implementation logic.

## Logging and Comments

- Reuse existing `print`, `status`, `buildStatus`, and `LogLevel` abstractions.
- Preserve the existing concise emoji/status vocabulary when extending a flow.
- Use low-level `console.log` / `console.dir` only where it matches the local diagnostic pattern.
- Never log secrets/tokens/credentials.
- Comments explain phase boundaries, compatibility constraints, lifecycle hazards, or surprising operations.
- Long orchestrations may use `// Phase N: ...`.
- Shell sections may use `# MARK: ...`.
- Keep TODOs concrete; do not add speculative essays or AI/coding-agent narration.

## JavaScript, JSON, Bash, Docker

- JavaScript config keeps its existing CommonJS/file-local style; do not convert it just for modernization.
- JSON/JSON Schema indentation is file-local; do not globally normalize or reorder unrelated keys.
- Schema descriptions should be concrete and consumer-facing; public property/enum spellings are compatibility contracts.
- Bash: quote variable expansions, prefer existing `[[ ... ]]` / fail-closed `case` patterns, preserve `# MARK:` sections and status glyphs (`➤`, `→`, `✓`, `✗`).
- Dockerfiles should remain straightforward and readable; preserve compatibility comments and avoid unrelated base/package upgrades.

## Change Hygiene

- Make the smallest coherent change required by the task.
- Do not mix behavior changes with broad formatting, renaming, dependency upgrades, or cleanup.
- Preserve user/project compatibility unless migration is explicitly part of the task.
- Generated `out/**` / `dist/**` files are not source-style authority.
- When legacy local style conflicts with these defaults, preserve local consistency unless correctness, safety, or an accepted contract requires otherwise.
