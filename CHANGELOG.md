# Changelog
## [1.15.8] - 2025-10-31
### Added
- Server: use `0.0.0.0` by default as it is required for port forwarding in devcontainer. It has to be set back to `127.0.0.1` for production in Hummingbird, while in Vapor everything works fine since it is configured in the local `.env` file only.
- Server: add default `.env` file
## [1.15.7] - 2025-10-30
### Changed
- Server: upgrade Vapor template
- Server: fix building logic for `Run` command
- Sidebar: set `skipCommand` on `AdvancedSettings`
## [1.15.6] - 2025-10-30
### Removed
- Removed DevContainer extension from `extensionDependencies`
## [1.15.5] - 2025-10-30
### Added
- Add DevContainer extension in `extensionDependencies`
## [1.15.4] - 2025-10-30
## [1.15.3] - 2025-10-30
### Changed
- Fix `Unable to create project: ENOENT` on Windows
## [1.15.2] - 2025-10-27
### Changed
- Android stream: changed supported API range to `28-35`
## [1.15.1] - 2025-10-10
### Added
- Sidebar: implemented `Update Packages` action
### Changed
- Web-dev container: changed Dockerfile to copy `wasm-strip` and `wasm-opt` binaries for `amd64` and `arm64` separately, based on build argument `TARGETARCH`
- Nginx feature: fixed the script to support current Ubuntu version
## [1.15.0] - 2025-10-03
### Changed
- GradleW: use shell `env` in `assemble` to fix cold start issue
- DevContainerConfig: add `getNDKVersion` method
- StartNewProject: always use `name` in path
- Android lib template: use asterisk in `jniLibs`
- Android: remove hardcoded `core` dependency
- Android: rework `copySoFiles` logic:
    - adopt logic for the new upcoming official SDK
    - use `soFiles` for `Packed` mode
    - implement `PickedAutomatically` mode
    - implement `excludeSoFiles`
    - use `$project`, `$sdk`, `$ndk` prefixes
    - allow absolute paths in `soFiles` for custom libs
    - `$arch` variable for `soFiles`

## [1.14.1] - 2025-10-01
### Removed
- DevContainerConfig: removed predefined editor `fontFamily` and `codeLensFontFamily`

## [1.14.0] - 2025-10-01
### Added
- Android docker image: execute official SDK setup script if present
### Changed
- Android docker image: fix unexpected `apt` issues
- Android 6.2 toolchain: replace finagolfin's SDK with upcoming official SDK
- Android stream: support building with upcoming official SDK since Swift 6.2
- Android stream: changed supported API range to `28-36`
- Android stream UI: fixed `JNI Logs` checkmark

## [1.13.1] - 2025-09-18
### Added
- Android library template: added `fetchAsyncDataWithCallback`

## [1.13.0] - 2025-09-18
### Changed
- Updated project templates to Swift 6.2.0
- Updated `toolchains.json` with Swift 6.2.0