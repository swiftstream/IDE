# Changelog

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