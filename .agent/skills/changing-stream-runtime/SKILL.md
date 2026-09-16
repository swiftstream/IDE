---
name: changing-stream-runtime
description: Change shared or stream-specific runtime behavior in Swift Stream while preserving ownership, lifecycle flags, command routing, process cancellation, and unaffected streams.
---

# Change Stream Runtime Behavior

Primary owner is usually [`STREAM_RUNTIME.md`](../../architecture/STREAM_RUNTIME.md). Add [`PROCESS_BUILD_RUN_RUNTIME.md`](../../architecture/PROCESS_BUILD_RUN_RUNTIME.md) when process/build/run/test/debug/flash mechanics change and [`VSCODE_SURFACE_AND_SIDEBAR.md`](../../architecture/VSCODE_SURFACE_AND_SIDEBAR.md) when user-visible command/context/menu state changes.

1. Identify whether behavior is truly shared or belongs to one concrete stream.
2. Inspect the base method plus all affected overrides/callers before choosing the mutation site.
3. For shared changes, explicitly inspect representative affected concrete streams for override/order assumptions.
4. For stream-only changes, keep specialization in that stream unless a reviewed common contract exists.
5. Map runtime flags/context keys for start, success, failure, cancellation, and early-return paths.
6. If external processes/tasks are involved, verify `AbortHandler`/task lifecycle and working-directory/environment inputs.
7. If file-save handling changes, ensure one save cannot trigger duplicate rebuilds through base + concrete handlers.
8. Run the smallest focused compile/probe first, then stream/runtime integration only when required.
9. Audit unaffected streams when a shared owner changed; do not declare cross-stream safety from one stream's success.

