# Docker Images

Owner of `IMG-*` architecture rules.

Primary source: `docker-images/**`.

## `IMG-001` — Image Build Sources Are Separate From Consumer Devcontainer Assets

`docker-images/**` contains source/build contexts for Swift Stream base/dev/prod images. `assets/Devcontainer/**` contains files copied into generated consumer projects. They may reference compatible conventions but have separate ownership and validation.

Never assume a change in one tree automatically updates or validates the other.

## `IMG-002` — Current Image Families Are Explicit

Repository image-source families currently include:

- base Ubuntu variants (`base/focal`, `base/noble`);
- Android development;
- server development/production;
- web development/production;
- embedded ESP32, NRF, Raspberry, and STM32 variants.

Directory presence proves source exists, not that every image is currently published/supported. Publication status requires separate evidence.

## `IMG-003` — Dockerfile/Startup Script Compatibility Is One Contract

An image's Dockerfile and associated `cmd.sh`/nginx/tool payloads form one runtime contract. Environment paths, installed tools, startup behavior, architectures, and copied binaries must remain mutually compatible.

## `IMG-004` — Architecture-Specific Binaries Require Exact Validation

Where an image bundles architecture-specific executables (for example web tooling), changing versions/paths must preserve correct amd64/arm64 selection and executable/runtime compatibility.

Do not validate one host architecture and claim the other is covered without direct or otherwise sufficient evidence.

## `IMG-005` — Image Builds Are Expensive/Side-Effectful Gates

Docker image builds may download dependencies and consume substantial time/storage. Use static Dockerfile/script inspection and cheaper deterministic probes first. Run full image builds only when the change requires them, and do not repeat broad builds for an unchanged candidate merely because derived reporting failed.

## `IMG-006` — Published/Remote Effects Need Explicit Authorization

Building locally does not authorize pushing/tagging images or altering registries. Image publication, remote tag mutation, and credentials are separate maintainer-controlled operations.

