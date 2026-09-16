# Feature Integrations

Owner of `FEAT-*` architecture rules.

Primary source: `src/streams/anyFeature.ts`, stream-specific feature adapters under `src/streams/*/features/**`, root `features/**`, and relevant project/devcontainer configuration.

## `FEAT-001` — Two Feature Layers Must Stay Coherent

Swift Stream feature integrations can involve two distinct layers:

1. TypeScript feature adapters used by the extension/sidebar/runtime;
2. Dev Container Feature source/package material under root `features/**` installed into consumer containers.

They may evolve together but are not the same source tree. A feature is incomplete if runtime code expects a binary/config/install shape that the packaged feature does not provide.

## `FEAT-002` — `AnyFeature` Owns Shared Integration Lifecycle

The base feature abstraction owns common concepts including installed/pending-rebuild/deintegration/login state, project feature directory/config, feature registry insertion/removal, CLI lookup/execution, setup/config menu routing, and common sidebar items.

Concrete feature adapters should specialize only what differs.

## `FEAT-003` — Presence in Source Is Not Product Support

A feature adapter/package may exist but be omitted/commented from a stream's active `features()` collection or otherwise unreachable. Stable docs and UI claims must follow actual registration/availability, not repository presence alone.

## `FEAT-004` — Integration Mutates Devcontainer State

Installing/removing a feature changes consumer devcontainer `features` and commonly requires rebuild before the binary/runtime becomes available.

Current/pending state and rebuild prompting are part of the user contract. Do not mark a feature usable before the runtime prerequisites exist.

## `FEAT-005` — Project Feature Files Are User-Visible State

Feature adapters may create/delete/edit a feature-specific project directory/config file. De-integration can be destructive.

Any new deletion/reset behavior requires an explicit user-facing contract and must scope filesystem removal to the owned feature path. Never use broad cleanup outside it.

## `FEAT-006` — Authentication/External Operations Are Side Effects

Login/logout, hosting/cloud CLI operations, SSH/SFTP, deployment, DNS/network calls, and similar feature actions are external side effects. Tests/audits should prefer deterministic/local validation unless live execution is explicitly required and authorized.

Never capture credentials/secrets in artifacts or logs.

## `FEAT-007` — Feature Identity Must Match Across Layers

Repository/feature name/version, expected binary/config path, menu identity, and package metadata must remain compatible across TypeScript adapter, devcontainer feature reference, and root feature implementation.

Changing identity/versioning requires auditing install, detection, pending-rebuild, and removal behavior.

