# Skill Index

Operational skill router. Skills are focused procedures, not architecture authority. Load at most one by default after routing the task through `ARCH_INDEX.md`; load a second only when the task genuinely performs two distinct operational procedures.

| Skill | Use when |
| --- | --- |
| `skills/documentation-sync/SKILL.md` | durable governance/architecture/navigation/decision/debt/task/routing knowledge changed |
| `skills/patch-review/SKILL.md` | independently reviewing a patch/change set against scope, architecture, validation, docs, and Git preservation |
| `skills/adding-vscode-command/SKILL.md` | adding/renaming/removing a contributed command, keybinding/menu/context-driven action, or related sidebar entry |
| `skills/changing-stream-runtime/SKILL.md` | changing shared/concrete stream behavior, stream settings/actions/save handling, or build/run orchestration at stream level |
| `skills/project-generation-change/SKILL.md` | changing the new-project wizard, generated project files, templates/payloads, or stream-specific project bootstrap |
| `skills/devcontainer-toolchain-change/SKILL.md` | changing devcontainer generation/mutation, toolchain catalog/selection, SDK/artifact URLs, ports/mounts/rebuild state |
| `skills/feature-integration-change/SKILL.md` | adding/changing an optional server/web feature adapter and/or root Dev Container Feature package |
| `skills/docker-image-change/SKILL.md` | changing root `docker-images/**` Dockerfiles/scripts/runtime payloads |

Do not create a new skill for a one-off task. Add a skill only when the procedure is reusable, nontrivial, and materially safer than following the architecture/workflow directly.

