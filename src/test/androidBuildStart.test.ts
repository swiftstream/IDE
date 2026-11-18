import * as assert from 'assert'
import { AbortHandler } from '../bash'
import { AndroidStreamConfig, PackageMode, SchemeBuildConfiguration } from '../androidStreamConfig'
import { androidBuildNextStep, buildCommand } from '../streams/android/commands/build'
import { window } from 'vscode'

suite('Android build-start compatibility gate', () => {
    test('describes the exact next Gradle assemble action for every Android package/configuration pair', () => {
        assert.strictEqual(
            androidBuildNextStep(PackageMode.App, SchemeBuildConfiguration.Debug),
            '➡️ Next step: Java App Project → Assemble Debug'
        )
        assert.strictEqual(
            androidBuildNextStep(PackageMode.App, SchemeBuildConfiguration.Release),
            '➡️ Next step: Java App Project → Assemble Release'
        )
        assert.strictEqual(
            androidBuildNextStep(PackageMode.Library, SchemeBuildConfiguration.Debug),
            '➡️ Next step: Java Library Project → Assemble Debug'
        )
        assert.strictEqual(
            androidBuildNextStep(PackageMode.Library, SchemeBuildConfiguration.Release),
            '➡️ Next step: Java Library Project → Assemble Release'
        )
    })

    const scheme = {
        title: 'Demo Debug',
        swiftTargets: ['Demo'],
        buildConfiguration: SchemeBuildConfiguration.Debug
    }

    function fakeStream(getLibraryProducts: () => Promise<unknown[]>) {
        return {
            isAnyHotBuilding: () => false,
            setAbortBuildingDebugHandler: (onCancel: () => void) => new AbortHandler(onCancel),
            setBuildingDebug: () => {},
            swift: { getLibraryProducts }
        } as any
    }

    test('stops an incompatible selected-scheme build before package discovery', async () => {
        const events: string[] = []
        let getLibraryProductsCalls = 0
        const originalInitialize = AndroidStreamConfig.initializeConfigIfNeeded
        ;(AndroidStreamConfig as any).initializeConfigIfNeeded = async () => {
            events.push('compatibility-gate')
            return false
        }
        try {
            await buildCommand(fakeStream(async () => {
                getLibraryProductsCalls += 1
                events.push('getLibraryProducts')
                throw new Error('package discovery must not run')
            }), scheme)
        } finally {
            ;(AndroidStreamConfig as any).initializeConfigIfNeeded = originalInitialize
        }
        assert.deepStrictEqual(events, ['compatibility-gate'])
        assert.strictEqual(getLibraryProductsCalls, 0)
    })

    test('allows a compatible selected-scheme build to reach package discovery once', async () => {
        const events: string[] = []
        let getLibraryProductsCalls = 0
        const originalInitialize = AndroidStreamConfig.initializeConfigIfNeeded
        const originalShowErrorMessage = (window as any).showErrorMessage
        ;(AndroidStreamConfig as any).initializeConfigIfNeeded = async () => {
            events.push('compatibility-gate')
            return true
        }
        ;(window as any).showErrorMessage = async () => undefined
        try {
            await buildCommand(fakeStream(async () => {
                getLibraryProductsCalls += 1
                events.push('getLibraryProducts')
                return []
            }), scheme)
        } finally {
            ;(AndroidStreamConfig as any).initializeConfigIfNeeded = originalInitialize
            ;(window as any).showErrorMessage = originalShowErrorMessage
        }
        assert.deepStrictEqual(events, ['compatibility-gate', 'getLibraryProducts'])
        assert.strictEqual(getLibraryProductsCalls, 1)
    })
})
