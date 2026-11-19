# Changelog
## [1.18.0] - 2026-11-19
### Added
- Added Android support for official Swift 6.3.3 and Swift 6.4.2 toolchains.
### Changed
- Android builds now use toolchain-specific NDK, setup mode, and minimum API compatibility for Swift 6.3.3 and 6.4.2.
- Fresh Android, Server, Web, Pure, and Embedded projects now default to Swift 6.4, resolving to the current Swift 6.4.2 release.
- Android SourceKit and SwiftPM targets now follow the project's minimum Android API, with incompatible saved configurations rejected before SwiftPM work begins.
- Android Swift output discovery now uses authoritative SwiftPM output paths and supports multi-product, multi-ABI packaging.
- Android runtime library selection now follows the exact selected Swift version.
- Retained older Android toolchain environment behavior remains supported.
- Web builds with the official Swift 6 WASM SDK now derive the SDK identifier from the configured artifact and use the correct `wasm32-unknown-wasip1` output path.
- PWA manifest and index extraction now resolve their native debug helper executables through SwiftPM instead of assuming a target-triple build directory.
- Web release optimization now enables non-trapping float-to-int WebAssembly instructions emitted by Swift 6.4.
- Generated Web projects now require SwifWeb from `2.0.0-nightly.12` and use macOS 12 as the generated manifest minimum for Swift 6.4.
- Fixed Android remote extension activation by registering global log and upgrade commands only once.
- Generated Swift 6.4 Android packages now use macOS 12 as the manifest minimum, matching the current PackageDescription baseline.
- Generated Dev Containers now wait for `postStartCommand` before VS Code attaches, so toolchain and SDK setup completes before extensions activate.
- Removed the generated relative `DEVELOPER_DIR=public` Swift setting, which is incompatible with Swift 6.4's default Swift Build search-path validation.
- Generated Dev Containers now disable the official Swift extension's automatic package resolve, while Swift Stream serializes its SwiftPM work behind active package operations without blocking SourceKit-LSP indexing.
- Server and Pure Run/Debug now resolve canonical SwiftPM executable paths for both glibc and Static Linux musl builds instead of relying on hardcoded build directories.
- Server and Pure hot rebuild now performs a quick selected-target rebuild and automatically restarts an already running process after Swift source saves.
- Successful Swift package dumps now tolerate warnings on stderr instead of treating them as fatal errors.
- Generated Android apps keep the historical `@main App` entry point only for Android builds, leaving `AppManifest` as the sole native host entry point for Swift 6.4 metadata builds.
## [1.17.1] - 2026-01-15
### Changed
- Fixed Android Library template by switching to `deleteLocalRefPure`, thanks to @JarWarren
## [1.17.0] - 2025-12-31
### Added
- Android stream: application development mode with three templates
## [1.16.3] - 2025-12-10
### Changed
- Updated link to Swift 6.2.1 in `toolchains.json`
## [1.16.2] - 2025-12-10
### Changed
- Updated `toolchains.json` with Swift 6.2.2
- Removed `6.1-DEVELOPMENT-SNAPSHOT-2025-02-14` from `toolchains.json`
## [1.16.1] - 2025-11-04
### Changed
- Updated `toolchains.json` with Swift 6.2.1
## [1.16.0] - 2025-10-31
### Added
- `Ctrl/Cmd+Shift+R` for debug session
### Changed
- Improve `stop` action
- Debug configuration: `lldb` → `lldb-dap`
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