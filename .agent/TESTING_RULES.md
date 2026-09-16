# Testing and Validation Rules

Testing policy for Swift Stream IDE. Architecture-specific expected behavior remains owned by the relevant architecture document.

## Tests Prove Accepted Behavior, Not Architecture Quality

A green test/compile/lint result does not prove ownership, lifecycle, generated-output semantics, stream boundaries, or UX are correct. Review architecture first; use tests/evidence to prove the accepted contract.

Do not add tests whose only purpose is to freeze a workaround or duplicated state introduced by a questionable abstraction. Re-evaluate the implementation first.

## Current Repository Validation Tools

The current package exposes:

```text
npm run compile        # webpack extension compilation
npm run compile-tests  # TypeScript compile for tests
npm run lint           # ESLint over src
npm test               # pretest + VS Code test runner
npm run package        # production webpack bundle
```

`src/test/extension.test.ts` currently provides only a small VS Code-hosted integration suite. It is not a comprehensive regression suite for all streams, generators, containers, devices, features, or external providers.

## Validation Ladder

Use the smallest gate that can invalidate the candidate, then broaden based on risk:

1. **L0 static/source/config/diff inspection** — exact paths, callers, registrations, templates, generated text, configuration compatibility.
2. **L1 compile/lint/focused deterministic probes** — TypeScript/webpack/lint or direct pure/helper behavior.
3. **L2 focused integration/generated branch** — affected generator branch, config mutation, process argument construction, feature package/adaptor boundary.
4. **L3 VS Code-hosted/stream integration** — extension activation/context/commands/UI behavior when required.
5. **L4 external/full gate** — Docker/Dev Container build, browser/debugger, Android/embedded toolchain/device, cloud/deployment/live network, broad packaging/release validation.

Do not automatically run L4 after every task. Broad/expensive gates belong at the coherent integration boundary.

## TypeScript / Extension Changes

For normal `src/**` changes, at minimum choose the relevant combination of TypeScript compile/webpack compile/lint and focused tests. If the change affects runtime command registration/activation/sidebar behavior, a source-only compile may be insufficient; use VS Code-hosted evidence when the behavior cannot be proved statically.

## `package.json` Contribution Changes

Validate exact coherence between declaration and runtime:

- command ID -> registered handler;
- keybinding/menu `when` -> context key producer;
- configuration key/type/default/enum -> runtime reader/updater;
- view ID -> runtime tree provider;
- schema file match -> actual consumer config path;
- task definition -> actual task/provider behavior if used.

## Generator and Template Changes

Every affected generation branch requires representative output evidence.

Validate, as applicable:

- exact generated paths;
- `Package.swift`/Gradle/project file content;
- copied/rendered source;
- devcontainer environment, mounts, ports, extensions, features;
- overwrite/collision behavior;
- stream/subtype-specific differences.

Do not use one stream/variant as evidence for another materially different branch.

## Toolchain / Devcontainer Changes

Use deterministic catalog/selection/config-generation checks first. Cover boundary cases relevant to the change, including version fallback and stream catalog routing where applicable.

When runtime behavior after container rebuild is the claim, generated JSON alone is not final evidence; use a container/runtime gate if the risk requires it.

## Process / Cancellation Changes

Cover success, non-zero/error, and cancellation/stop paths relevant to the change. Validate terminal state and UI/context flags as well as child process/task termination when that behavior changed.

## Feature Integrations

When possible, separate deterministic adapter/package/config tests from live provider/network operations. Live credentials/deployment/remote mutation require explicit task need and authorization; never make them the default proof for local integration code.

## Docker / Platform / Device Work

- Inspect Dockerfiles/scripts before full builds.
- A successful build on one CPU architecture does not automatically prove architecture-specific bundled binaries on another.
- Device flash/hardware/browser/live-cloud validation is executed only when necessary and with explicit side-effect boundaries.
- Preserve primary logs/results for expensive gates when later audit depends on them; do not rerun merely because report formatting failed.

## Regression Discipline

Every independently reproduced dangerous bug should gain the strongest practical durable regression protection before closure.

Examples:

- activation/stream-selection regression;
- stale context/menu state after failure/cancellation;
- wrong generated devcontainer/toolchain URL/version;
- generator branch silently producing invalid project files;
- user config fields lost by an incremental mutation;
- feature adapter/package identity drift;
- process stop command leaving the real process running;
- one stream fix breaking another shared-runtime path.

If an automated test cannot reproduce the real boundary, document an explicit alternative verification gate in the task/audit evidence rather than substituting a weaker unrelated test.

## Existing Behavior Preservation

Do not change unrelated expected output, command IDs, configuration keys, generated file shapes, or stream behavior just to make new tests easier. A test framework or fixture should adapt to the accepted product contract, not redefine it accidentally.

## No Coverage Theater

Test count and coverage percentage are not project goals by themselves. Prefer a small set of tests/probes that protect meaningful lifecycle/configuration/generation boundaries over large volumes of shallow assertions.

