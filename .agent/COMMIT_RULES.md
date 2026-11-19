# Commit Rules

Git and working-tree safety rules for Swift Stream IDE.

## Baseline and Final Checks

Before mutation, inspect complete Git status including untracked files. Record enough baseline information to distinguish task-owned changes from pre-existing user work.

After work, inspect complete status and the exact task-scope diff. Confirm unrelated files were not changed, staged, deleted, reformatted, or otherwise disturbed.

## Preservation Rules

- Preserve unrelated staged, unstaged, and untracked work.
- Never stage unrelated changes.
- Never overwrite an unexpected user edit in a task-owned path. If current content conflicts with the reviewed plan, stop/re-plan from the actual file rather than restoring an assumed baseline.
- Do not use reset, restore, checkout, clean, stash, rebase, amend, squash, force-push, or other history/worktree rewriting without explicit maintainer authorization.
- Never use destructive cleanup as a shortcut for understanding a dirty working tree.

## Release-Phase Worktree Rule

During release-finalization/release-candidate work, follow the canonical-workspace rule in `WORKFLOW.md`.

- Do not create or use Git worktrees, sibling checkouts, temporary clones, exported source copies, or alternate RC/package directories as release-candidate authority.
- A dirty canonical checkout is a state to reconcile explicitly, not a reason to route release work through another working tree.
- Git worktrees may still be used during ordinary development only when the maintainer/workflow explicitly allows them; they are forbidden once release finalization is active.

## Mutation Scope

- Every non-trivial task defines its approved path scope before mutation.
- Modify only paths required by that scope.
- Generated/build output may be created for validation only when the workflow permits it; do not accidentally include it as source change.
- Formatting or cleanup outside the task scope is unrelated work, even when mechanically easy.

## Logical Commit Boundaries

A task/audit lineage may legitimately own several related repository changes without requiring them to be committed together. Commit boundaries follow the repository's logical history and review value, not artifact lineage or the fact that changes were discovered in the same audit.

- Prefer the smallest coherent commit whose staged contents have one clear primary intent.
- A companion/supporting change may be committed separately when the earlier commit remains valid, understandable, and non-broken without it.
- Configuration/metadata/housekeeping files such as `.gitignore`, package metadata, changelog/version files, generated ignore/exclude lists, CI/support configuration, or similar low-coupling files may be split into their own focused commit when doing so produces clearer per-file Git/GitHub history and does not create a materially invalid intermediate repository state.
- Documentation and source corrections discovered by the same audit do not belong in one commit merely because they share an audit lineage. Keep them separate when they express different logical changes.
- Do not force a file into a commit solely because stable documentation already mentions the resulting repository state, provided the temporary intermediate state is harmless, obvious, and intentionally closed by a separate follow-up commit.
- Conversely, do not split changes when one commit would be misleading, uncompilable, behaviorally broken, destructive, or materially inconsistent without the other change. In that case the files form one atomic commit boundary.
- When choosing between combined vs separate commits, optimize for durable Git history: future readers should be able to understand why each file changed without unrelated commit messages lingering on that file's history.

## Commit Message Style

Swift Stream IDE uses a stable canonical commit-message style. Follow this style first; use Git history only as supporting evidence for edge cases or to confirm an unfamiliar category.

Canonical subject shape:

`<emoji> <concise imperative subject>`

When a change has a clear subsystem/area, use:

`<emoji> <Area>: <concise imperative subject>`

Canonical rules:

- exactly one leading category emoji followed by one space;
- concise English subject, normally imperative/action-oriented;
- no trailing period;
- use `Area:` when it materially improves scannability, using the repository's existing area naming style such as `Sidebar:` or `Toolchains list:`;
- use backticks around code identifiers, commands, flags, versions, filenames, or literals when they are being referred to as code/text tokens;
- do not use Conventional Commits prefixes such as `feat:`, `fix:`, `docs:`, `chore:`, or another external commit-message convention;
- do not add coding-agent attribution unless the maintainer explicitly requests it.

Canonical category prefixes:

- `📖` — documentation, comments, changelog, explanatory/template text;
- `📦` — release/version/package/dependency/distribution metadata changes;
- `🔧` — focused fixes, configuration/toolchain adjustments, small behavioral corrections, maintenance changes;
- `🛠️` — implementation changes, behavioral improvements, refactors, runtime/project logic changes;
- `🪚` — substantial new feature/target/capability implementation.

Choose the narrowest category that describes the commit's primary intent. Commit boundaries should already be narrow enough that one primary category is clear.

Repository history is secondary evidence, not the source of the rule. Inspect relevant history when a new/unlisted category may be needed, an area name is uncertain, or the canonical categories do not clearly fit. Do not silently redefine the canonical style from whichever commits happen to be newest.

## Stage / Commit / Push Policy

IDE has no standing authorization for Git history mutations.

- Do not stage unless the maintainer explicitly authorizes staging for a stated scope.
- Do not commit unless the maintainer explicitly authorizes a commit or has clearly requested completion including commit.
- Do not push unless explicitly authorized.
- Commit authorization never implies push authorization.
- Push authorization never implies force-push/history rewrite authorization.
- Review exact staged contents immediately before any authorized commit.
- Apply the canonical commit-message style above immediately before composing the final authorized commit message; inspect Git history only when the canonical rules leave a material ambiguity.
- Keep logical behavior/architecture/correction boundaries as commit boundaries; do not create catch-all commits from unrelated dirty work.
- Do not add coding-agent attribution to source headers or commit messages unless the maintainer explicitly requests it.

## Concurrent Work

Never stage/commit while another executor is actively mutating the same repository without first reconciling its state. If user/agent changes appear unexpectedly in a path required by the current task, treat them as protected current state and reassess before writing.

