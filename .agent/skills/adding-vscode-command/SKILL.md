---
name: adding-vscode-command
description: Add, rename, remove, or rewire a Swift Stream VS Code command/keybinding/menu/sidebar action while keeping package.json contributions, runtime registration, context keys, and behavior ownership coherent.
---

# Add or Change a VS Code Command

Primary owner: [`VSCODE_SURFACE_AND_SIDEBAR.md`](../../architecture/VSCODE_SURFACE_AND_SIDEBAR.md). Load the architecture owner of the command's actual behavior as supporting context.

1. Inspect `package.json`, the current command registration, `SideTreeItem`/sidebar usage if any, and the actual behavior handler before planning.
2. Decide whether the command is:
   - root/common (`src/extension.ts`),
   - shared stream (`Stream.registerCommands()`),
   - concrete-stream specific, or
   - feature specific.
   Register it at the narrowest correct lifecycle owner.
3. If it is contributed in `package.json`, keep command ID/title/icon, menu/keybinding `when` clauses, settings/context keys, and runtime registration coherent.
4. Reuse an existing command ID only when preserving the exact user-facing contract. Renaming an existing public ID is a compatibility change.
5. Do not add hidden authoritative state to `SidebarTreeView`; the tree projects the owning runtime/config state.
6. Ensure dynamic command registrations are disposed/replaced correctly.
7. Validate at L0 by tracing declaration -> registration -> handler -> state/context projection. Compile/lint as applicable.
8. Use a VS Code-hosted runtime check when static inspection cannot prove activation/menu/context behavior.
9. If removing a command, search for all package/menu/keybinding/tree/executeCommand references before closure.

