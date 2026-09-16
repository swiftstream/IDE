# Master Plan

Durable high-level product boundary for Swift Stream IDE. This file does not invent an active milestone schedule; detailed executable work belongs in `TASKS.md` and `.artifacts/**`.

## Product Direction

Swift Stream IDE aims to provide a consistent, developer-friendly Swift development experience in VS Code for non-Xcode workflows by combining:

- reproducible containerized development environments;
- project creation/bootstrap for distinct Swift streams;
- stream-aware build/run/debug/test/flash workflows;
- toolchain/SDK selection and project configuration;
- optional development/deployment integrations;
- a discoverable VS Code sidebar/command experience.

## Current Stream Boundary

The repository currently models Web, Server, Android, Embedded, and Pure streams. Each stream is allowed to differ where its real platform/toolchain/runtime requires it. The long-term direction is shared UX where semantics are genuinely shared, not forced implementation uniformity.

## Development Principles

- Keep generated projects reproducible and understandable.
- Preserve existing user/project configuration by default.
- Keep stream specialization explicit.
- Prefer vertical real features over speculative frameworks.
- Treat devcontainer/toolchain/process lifecycle as product behavior, not plumbing hidden from review.
- Improve automated regression coverage around dangerous real boundaries as work touches them.
- Keep public documentation aligned with actual supported behavior.

## Roadmap Ownership

No numbered release/milestone roadmap is asserted here unless the maintainer explicitly reviews and adds one. Maintainer instructions define current priority; accepted active executable work is tracked in `TASKS.md` or the current artifact lineage.

