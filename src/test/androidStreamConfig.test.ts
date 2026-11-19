import * as assert from 'assert'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { AndroidStreamConfig, PackageMode, SoMode } from '../androidStreamConfig'
import { DevContainerConfig } from '../devContainerConfig'
import { window } from 'vscode'
import { AndroidCompatibility, validateAndroidCompatibility } from '../toolchain'

suite('Android stream compatibility configuration', () => {
    const compatibility64: AndroidCompatibility = { ndk: 'r30', min_api: 28, sdk_setup: 'swiftbuild' }
    const compatibility633: AndroidCompatibility = { ndk: 'r27d', min_api: 28, sdk_setup: 'ndk-sysroot' }
    let projectPath: string

    setup(() => {
        projectPath = fs.mkdtempSync(path.join(os.tmpdir(), 'swiftstream-android-config-'))
    })

    teardown(() => {
        fs.rmSync(projectPath, { recursive: true, force: true })
    })

    function writeDevContainerVersion(version: { major: number, minor: number, patch: number }): string {
        const devContainerFolder = path.join(projectPath, '.devcontainer')
        fs.mkdirSync(devContainerFolder, { recursive: true })
        const devContainerPath = path.join(devContainerFolder, 'devcontainer.json')
        fs.writeFileSync(devContainerPath, JSON.stringify({
            containerEnv: {
                S_VERSION_MAJOR: `${version.major}`,
                S_VERSION_MINOR: `${version.minor}`,
                S_VERSION_PATCH: `${version.patch}`
            }
        }))
        return devContainerPath
    }

    test('reads Swift version from an explicit devcontainer path', () => {
        const devContainerPath = writeDevContainerVersion({ major: 6, minor: 4, patch: 2 })

        assert.deepStrictEqual(
            DevContainerConfig.swiftVersion(devContainerPath),
            { major: 6, minor: 4, patch: 2 }
        )
    })

    test('synchronizes SourceKit from the explicit project devcontainer when version override is absent', () => {
        const devContainerPath = writeDevContainerVersion({ major: 6, minor: 4, patch: 2 })
        const originalSwiftVersion = DevContainerConfig.swiftVersion
        ;(DevContainerConfig as any).swiftVersion = (requestedPath?: string) => {
            assert.strictEqual(requestedPath, devContainerPath)
            return originalSwiftVersion(requestedPath)
        }
        try {
            const result = AndroidStreamConfig.synchronizeSourceKitConfig({
                projectPath,
                minSDK: 28,
                compatibility: compatibility64
            })

            assert.strictEqual(result.compatible, true)
            const sourceKitPath = path.join(projectPath, '.sourcekit-lsp', 'config.json')
            const config = JSON.parse(fs.readFileSync(sourceKitPath, 'utf8'))
            assert.deepStrictEqual(config, {
                swiftPM: {
                    swiftSDK: 'aarch64-unknown-linux-android28'
                }
            })
        } finally {
            ;(DevContainerConfig as any).swiftVersion = originalSwiftVersion
        }
    })

    test('synchronizes an Android 6.4/min28 target and preserves user fields', () => {
        const sourceKitFolder = path.join(projectPath, '.sourcekit-lsp')
        fs.mkdirSync(sourceKitFolder, { recursive: true })
        const sourceKitPath = path.join(sourceKitFolder, 'config.json')
        fs.writeFileSync(sourceKitPath, JSON.stringify({
            userRoot: true,
            swiftPM: { configuration: 'debug', userSwiftPM: 'kept' }
        }))

        const result = AndroidStreamConfig.synchronizeSourceKitConfig({
            projectPath,
            minSDK: 28,
            compatibility: compatibility64,
            swiftVersion: { major: 6, minor: 4, patch: 2 }
        })
        assert.strictEqual(result.compatible, true)
        const config = JSON.parse(fs.readFileSync(sourceKitPath, 'utf8'))
        assert.deepStrictEqual(config, {
            userRoot: true,
            swiftPM: { configuration: 'debug', userSwiftPM: 'kept', swiftSDK: 'aarch64-unknown-linux-android28' }
        })
        const firstBytes = fs.readFileSync(sourceKitPath)
        AndroidStreamConfig.synchronizeSourceKitConfig({
            projectPath,
            minSDK: 28,
            compatibility: compatibility64,
            swiftVersion: { major: 6, minor: 4, patch: 2 }
        })
        assert.deepStrictEqual(fs.readFileSync(sourceKitPath), firstBytes)
    })

    test('removes only the owned target while an unsupported min23 config is pending a 6.3.3 switch', () => {
        const sourceKitFolder = path.join(projectPath, '.sourcekit-lsp')
        fs.mkdirSync(sourceKitFolder, { recursive: true })
        const sourceKitPath = path.join(sourceKitFolder, 'config.json')
        fs.writeFileSync(sourceKitPath, JSON.stringify({
            userRoot: 'kept',
            swiftPM: { configuration: 'debug', userSwiftPM: 'kept', swiftSDK: 'aarch64-unknown-linux-android28' }
        }))
        const result = AndroidStreamConfig.synchronizeSourceKitConfig({
            projectPath,
            minSDK: 23,
            compatibility: compatibility633,
            swiftVersion: { major: 6, minor: 3, patch: 3 }
        })
        assert.strictEqual(result.compatible, false)
        assert.match(result.error!.message, /6\.3\.3.*minSDK.*28/)
        const config = JSON.parse(fs.readFileSync(sourceKitPath, 'utf8'))
        assert.deepStrictEqual(config, {
            userRoot: 'kept',
            swiftPM: { configuration: 'debug', userSwiftPM: 'kept' }
        })
        assert.strictEqual(fs.existsSync(path.join(projectPath, '.vscode', 'android-stream.json')), false)
    })

    test('does not create SourceKit config for an incompatible missing-file state', () => {
        const result = AndroidStreamConfig.synchronizeSourceKitConfig({
            projectPath,
            minSDK: 23,
            compatibility: compatibility633,
            swiftVersion: { major: 6, minor: 3, patch: 3 }
        })
        assert.strictEqual(result.compatible, false)
        assert.strictEqual(fs.existsSync(path.join(projectPath, '.sourcekit-lsp', 'config.json')), false)
    })

    test('fails closed for malformed compatibility metadata', () => {
        assert.throws(() => validateAndroidCompatibility(undefined), /metadata is missing/)
        assert.throws(() => validateAndroidCompatibility({ ndk: '', min_api: 28, sdk_setup: 'ndk-sysroot' }), /invalid NDK/)
        assert.throws(() => validateAndroidCompatibility({ ndk: 'r30', min_api: 23.5, sdk_setup: 'swiftbuild' }), /invalid minimum API/)
        assert.throws(() => validateAndroidCompatibility({ ndk: 'r30', min_api: 23, sdk_setup: 'none' }), /invalid SDK setup mode/)
    })

    test('rejects an existing incompatible config using the explicit project devcontainer path', async () => {
        const sourceKitFolder = path.join(projectPath, '.sourcekit-lsp')
        fs.mkdirSync(path.join(projectPath, '.vscode'), { recursive: true })
        fs.mkdirSync(sourceKitFolder, { recursive: true })
        fs.writeFileSync(path.join(projectPath, '.vscode', 'android-stream.json'), JSON.stringify({
            name: '',
            packageName: 'com.example.demo',
            packageMode: PackageMode.Library,
            compileSDK: 35,
            minSDK: 23,
            javaVersion: 11,
            soMode: SoMode.Packed,
            schemes: []
        }))
        const sourceKitPath = path.join(sourceKitFolder, 'config.json')
        fs.writeFileSync(sourceKitPath, JSON.stringify({
            userRoot: 'kept',
            swiftPM: { configuration: 'debug', userSwiftPM: 'kept', swiftSDK: 'aarch64-unknown-linux-android28' }
        }))
        let packageNameCalls = 0
        let surfacedError = ''
        const originalSwiftVersion = DevContainerConfig.swiftVersion
        const originalShowErrorMessage = (window as any).showErrorMessage
        ;(DevContainerConfig as any).swiftVersion = (devContainerPath?: string) => {
            assert.strictEqual(devContainerPath, path.join(projectPath, '.devcontainer', 'devcontainer.json'))
            return { major: 6, minor: 3, patch: 3 }
        }
        ;(window as any).showErrorMessage = async (message: string) => {
            surfacedError = message
            return undefined
        }
        try {
            const result = await AndroidStreamConfig.initializeConfigIfNeeded({
                projectPath,
                stream: {
                    swift: {
                        getPackageName: async () => {
                            packageNameCalls += 1
                            throw new Error('package-name fallback must not run')
                        }
                    }
                } as any
            })
            assert.strictEqual(result, false)
        } finally {
            ;(DevContainerConfig as any).swiftVersion = originalSwiftVersion
            ;(window as any).showErrorMessage = originalShowErrorMessage
        }
        const config = JSON.parse(fs.readFileSync(path.join(projectPath, '.vscode', 'android-stream.json'), 'utf8'))
        const sourceKitConfig = JSON.parse(fs.readFileSync(sourceKitPath, 'utf8'))
        assert.strictEqual(packageNameCalls, 0)
        assert.match(surfacedError, /6\.3\.3.*minSDK.*28/)
        assert.strictEqual(config.minSDK, 23)
        assert.deepStrictEqual(sourceKitConfig, {
            userRoot: 'kept',
            swiftPM: { configuration: 'debug', userSwiftPM: 'kept' }
        })
    })

    test('keeps an existing compatible config synchronized and idempotent', async () => {
        fs.mkdirSync(path.join(projectPath, '.vscode'), { recursive: true })
        fs.mkdirSync(path.join(projectPath, '.sourcekit-lsp'), { recursive: true })
        fs.writeFileSync(path.join(projectPath, '.vscode', 'android-stream.json'), JSON.stringify({
            name: 'Demo',
            packageName: 'com.example.demo',
            packageMode: PackageMode.Library,
            compileSDK: 35,
            minSDK: 28,
            javaVersion: 11,
            soMode: SoMode.Packed,
            schemes: []
        }))
        const sourceKitPath = path.join(projectPath, '.sourcekit-lsp', 'config.json')
        fs.writeFileSync(sourceKitPath, JSON.stringify({
            userRoot: 'kept',
            swiftPM: { configuration: 'debug', userSwiftPM: 'kept' }
        }))
        const originalSwiftVersion = DevContainerConfig.swiftVersion
        ;(DevContainerConfig as any).swiftVersion = () => ({ major: 6, minor: 4, patch: 2 })
        try {
            const stream = { swift: { getPackageName: async () => { throw new Error('package-name fallback must not run') } } } as any
            assert.strictEqual(await AndroidStreamConfig.initializeConfigIfNeeded({ projectPath, stream }), true)
            const firstBytes = fs.readFileSync(sourceKitPath)
            assert.strictEqual(await AndroidStreamConfig.initializeConfigIfNeeded({ projectPath, stream }), true)
            assert.deepStrictEqual(fs.readFileSync(sourceKitPath), firstBytes)
        } finally {
            ;(DevContainerConfig as any).swiftVersion = originalSwiftVersion
        }
        const config = JSON.parse(fs.readFileSync(path.join(projectPath, '.vscode', 'android-stream.json'), 'utf8'))
        const sourceKitConfig = JSON.parse(fs.readFileSync(sourceKitPath, 'utf8'))
        assert.strictEqual(config.minSDK, 28)
        assert.deepStrictEqual(sourceKitConfig, {
            userRoot: 'kept',
            swiftPM: { configuration: 'debug', userSwiftPM: 'kept', swiftSDK: 'aarch64-unknown-linux-android28' }
        })
    })
})
