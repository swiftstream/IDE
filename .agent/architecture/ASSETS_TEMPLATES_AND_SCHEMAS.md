# Assets, Templates, and Schemas

Owner of `ASSET-*` architecture rules.

Primary source: `assets/**`, `schemas/**`, and the TypeScript readers/copy/render paths that consume them.

## `ASSET-001` — Classify an Asset Before Editing It

`assets/**` contains several different kinds of source input: generated-project source files/templates, devcontainer Dockerfiles/scripts, docs, extension media/icons, webview content, and other copied resources.

Do not apply one blanket generation rule to every asset. Identify its consumer and whether it is copied byte-for-byte, rendered, parsed, or used only by the extension UI.

## `ASSET-002` — `assets/Sources/**` Owns Generator Inputs

Stream-specific source templates/static files under `assets/Sources/**`, including `Package.hbs`, are repository source for generated consumer projects where the wizard reads/copies/renders them.

Generated consumer copies are evidence, not an alternate source owner.

## `ASSET-003` — `assets/Devcontainer/**` Owns Copied Project Container Files

Stream/board Dockerfiles and command scripts copied into consumer `.devcontainer` directories are source inputs. Their compatibility must be reviewed together with the devcontainer generator/environment values they consume.

They are distinct from root `docker-images/**` image-build sources.

## `ASSET-004` — Handlebars Data Shape Is an Interface

Templates depend on payload keys assembled by TypeScript. Renaming/removing a payload field or helper is a contract change between generator and template.

Validate rendered output for changed template/payload behavior; TypeScript compilation cannot detect semantic Handlebars field drift reliably.

## `ASSET-005` — Schemas Must Match Supported Configuration

`schemas/**` are contributed through `package.json` for specific project configuration files. Schema changes must match the actual reader/writer contract and should validate both accepted and rejected representative input where practical.

Do not document/schema a field as supported merely because a future implementation is planned.

## `ASSET-006` — Docs and Public Examples Are Product Surface

`README.md` and `assets/Docs/**` are public/user-facing guidance. When a durable user workflow, generated configuration, supported stream capability, or command changes, review the directly affected docs. Do not rewrite unrelated public copy as part of implementation cleanup.

## `ASSET-007` — Binary/Media Inputs Are Not Text-Rewrite Targets

Icons, images, certificates/keys used for local development, and bundled tool binaries require format-specific handling. Do not pass them through text-formatting or generic source rewrite tools.

