---
name: project-generation-change
description: Change Swift Stream project creation or generated consumer files safely across wizard branches, programmatic generation, Handlebars templates, copied assets, and devcontainer inputs.
---

# Change Project Generation

Primary owner: [`PROJECT_BOOTSTRAP_AND_GENERATION.md`](../../architecture/PROJECT_BOOTSTRAP_AND_GENERATION.md). Load [`ASSETS_TEMPLATES_AND_SCHEMAS.md`](../../architecture/ASSETS_TEMPLATES_AND_SCHEMAS.md) for assets/templates/schemas and [`DEVCONTAINER_AND_TOOLCHAINS.md`](../../architecture/DEVCONTAINER_AND_TOOLCHAINS.md) only when that contract changes.

1. Identify every affected generation branch: stream plus subtype/board/framework/package mode as applicable.
2. For each output being changed, find its real source owner:
   - programmatic TypeScript / `FileBuilder`;
   - Handlebars template + payload;
   - copied `assets/Sources/**` file;
   - devcontainer generator + copied `assets/Devcontainer/**` file;
   - stream config/project helper.
3. Never edit one generated consumer project as the repository fix.
4. Preserve collision/overwrite behavior. If the change can replace existing user files, plan the prompt/backup/partial-failure semantics explicitly.
5. Keep stream-specific dependencies/SDKs/generated shape local rather than creating a false universal template.
6. Compile/lint the generator changes, but do not stop there.
7. Produce representative generated output for every materially changed branch and inspect exact paths/content/config fields.
8. Separate deterministic generation validation from later expensive container/build/device/network validation.
9. If changing a shared template/payload, audit all generator branches that consume it.

