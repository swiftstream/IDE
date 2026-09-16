# VS Code Surface and Sidebar

Owner of `UI-*` architecture rules.

Primary source: `package.json`, `src/sidebarTreeView.ts`, `src/extension.ts`, `Stream.registerCommands()`, concrete stream command registration, and feature command registration.

## `UI-001` — Declarative and Runtime Command Surfaces Must Agree

`package.json` contributes commands, keybindings, menus, settings, views, welcome content, schemas, and task definitions. Runtime TypeScript registers the handlers and sets context values.

When adding/removing/renaming a contributed command or context-controlled surface, audit both declarative and runtime sides. Do not leave dead menu/keybinding entries or registered-but-unreachable user commands unintentionally.

## `UI-002` — Context Keys Are Product-State Projections

`ContextKey` values drive `when` conditions and navigation/menu visibility. They project runtime/configuration state; they must not become a second independent authority.

Set/reset keys at lifecycle boundaries so stale UI does not claim a build/debug/run/flash capability remains active after failure/cancellation/stream change.

## `UI-003` — Sidebar Is a Router/Projection, Not Domain Authority

`SidebarTreeView` builds dynamic sections and items from stream/runtime/config state and registers some dynamic commands. Its labels/icons/expanded state are presentation.

Business/runtime semantics belong to the relevant stream/process/devcontainer/feature owner. Do not put hidden authoritative state in tree items solely because the tree needs to display it.

## `UI-004` — Dynamic Commands Need Lifecycle Cleanup

The sidebar creates dynamic commands for errors/mounts and tracks disposables. When changing dynamic registration, ensure old handlers are disposed/replaced correctly and subscriptions do not grow indefinitely through refreshes.

## `UI-005` — Settings Have Declarative Defaults and Runtime Readers

Settings under `contributes.configuration` are consumed by runtime code. A setting change must reconcile key name, type/enum/default, runtime reader/update logic, sidebar display, and affected behavior.

Do not change only the UI declaration or only the reader.

## `UI-006` — Keybindings Are Global User-Facing Behavior

Swift Stream remaps important shortcuts such as build/run/debug/stop/test. Changes can conflict with built-in VS Code commands and apply outside a narrow sidebar interaction.

Keybinding changes require explicit scope/UX review and validation of `when` conditions/removal entries.

## `UI-007` — Outside-Container and In-Container Trees Differ

The sidebar intentionally presents setup/reopen behavior outside a configured container and richer stream/runtime actions inside it. UI changes must validate the correct mode rather than assuming one tree shape.

## `UI-008` — Error Presentation Depends on Process Diagnostics

Sidebar error/warning/note nodes are populated by build diagnostic parsing. Changes to either UI projection or parser behavior should preserve file/line navigation and avoid stale dynamic commands after errors are replaced.

