# System Rules

Global invariants for Swift Stream IDE development.

## Verified Reality First

- Stable documentation must describe verified implementation state or explicitly reviewed future direction.
- A file, class, template, feature package, commented registration, TODO, or menu label does not by itself prove a user-visible capability is supported.
- Planned architecture and intended support must never be written as already implemented behavior.
- Current source, repository configuration, Git state, and actual execution evidence outrank stale prose about implementation facts.

## Single Authority Per Rule

- Every architecture rule/ID has exactly one authoritative owner under `.agent/architecture/**`.
- `.agent/ARCH_INDEX.md` is the authoritative architecture router and ID-family map.
- Routers/overviews link to the owner rather than duplicating a complete rule as alternate authority.
- Operational skills describe procedures; they do not own architecture semantics.

## Source of Truth vs Generated Output

- Repository-owned generator/template/catalog inputs are authoritative for files Swift Stream creates in consumer projects.
- Do not repair generated consumer output while leaving the owning generator broken.
- When consumer files may also be legitimately hand-authored, distinguish generated defaults from supported user customization before changing overwrite/update behavior.
- `dist/`, `out/`, packaged `.vsix` files, test runtime output, build products, and generated consumer projects are derived evidence, not source authority.

## Stream Ownership

- Shared behavior belongs in an established shared owner only when semantics are genuinely common across relevant streams.
- Stream-specific behavior stays in its owning stream/config/generator path.
- A multi-stream feature must preserve stream-specific differences in SDKs, build modes, runtime tools, generated project shape, and feature availability.
- Do not introduce a generic abstraction solely because several files look similar. First prove the behavior and lifecycle are actually shared.

## Container and Configuration Boundaries

- Host/outside-container behavior and in-container behavior are distinct runtime states and must be reviewed separately when affected.
- `.devcontainer/devcontainer.json` is both generated project configuration and runtime input. Changing its schema, environment keys, mounts, ports, extensions, features, or toolchain URLs can affect project creation, activation, runtime state, and rebuild semantics.
- Container rebuild/reopen requirements are part of behavior, not incidental UI text.
- Do not silently destroy user configuration when mutating a consumer project's devcontainer or stream config.

## External Process and Side-Effect Safety

- Shell/Swift/Gradle/npm/Docker/container commands can create processes, files, downloads, caches, network traffic, and user-visible VS Code/UI side effects. Validation plans must state which side effects are expected.
- Cancellation/abort semantics are first-class behavior for build/run/flash/test operations.
- Do not claim a command stopped/cancelled successfully from UI state alone; validate the relevant process/task boundary when the change concerns cancellation.
- Never expose secrets/tokens in logs, artifacts, source, or stable documentation.

## Vertical, Non-Speculative Development

- Prefer the smallest real implementation that delivers and validates the requested behavior.
- Do not prebuild speculative managers/factories/protocol layers for hypothetical future streams or providers.
- If implementation proves a reviewed assumption materially wrong, stop the affected path and re-plan.

## Documentation and Transient Evidence

- Debugging notes, raw logs, temporary plans, model prompts, local paths, and execution reports belong in `.artifacts/**`.
- Concrete coding-agent execution bindings also belong only in `.artifacts/**`: current model names, agent names, repository-access tool/product names, product-specific tools/plugins/apps/connectors, local execution-agent names, context IDs, and current stop/fallback/recovery details.
- Stable governance describes execution roles and capability boundaries abstractly. It may name a tool/product only when that identity is part of Swift Stream IDE itself, a real repository dependency/integration, or another durable product/domain fact rather than the current coding-agent environment.
- Durable source/navigation facts belong in `SOURCE_MAP.md` or `PROJECT_MEMORY.md` only when useful beyond immediate source inspection.
- Documentation maintenance is targeted: change only owners whose durable contract actually changed.
- Documentation/governance audits must verify routing/link coherence, single architecture ownership, and absence of transient execution-environment leakage into stable docs.

## Cross-Cutting Review Hazards

When relevant, explicitly audit for:

- duplicate sources of truth between `package.json`, TypeScript command registration, stream classes, templates, and generated output;
- host/container state divergence;
- stream leakage into shared runtime;
- stale VS Code context keys/menu conditions;
- process cancellation/race/lifecycle errors;
- generator/template/config drift;
- toolchain catalog vs generated devcontainer mismatch;
- feature adapter vs root Dev Container Feature package mismatch;
- hidden network/destructive filesystem effects;
- tests that validate a fixture path different from the production path.

