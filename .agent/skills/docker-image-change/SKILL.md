---
name: docker-image-change
description: Change Swift Stream root docker-images build sources safely, preserving Dockerfile/startup-script/tool payload compatibility and avoiding accidental conflation with generated consumer devcontainer assets.
---

# Change Docker Image Sources

Primary owner: [`DOCKER_IMAGES.md`](../../architecture/DOCKER_IMAGES.md). Load [`DEVCONTAINER_AND_TOOLCHAINS.md`](../../architecture/DEVCONTAINER_AND_TOOLCHAINS.md) only if generated consumer devcontainers/toolchain catalogs must change too.

1. Identify the exact image family and architecture(s) affected.
2. Inspect its Dockerfile, associated `cmd.sh`/nginx/config/tool payloads, base image relationship, and any generator/catalog references to the image contract.
3. Do not automatically mirror the change into `assets/Devcontainer/**`; prove the consumer-project contract actually needs it.
4. For bundled binaries, validate CPU architecture and executable/runtime compatibility separately.
5. Use static Dockerfile/script review and focused checks before a full Docker build.
6. When a full build is required, preserve candidate-bound logs/evidence and avoid repeated builds for unchanged source solely to regenerate a summary.
7. Local build does not authorize remote push/tag/publication.
8. Never expose registry credentials or secrets in source/artifacts/logs.

