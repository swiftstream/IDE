import * as assert from 'assert'
import {
    AndroidBuildIdentity,
    SwiftBuildMode,
    androidBuildIdentityKey,
    androidShowBinPathArgs,
    makeAndroidBuildIdentity,
    validateAndroidSwiftArgs
} from '../swift'

suite('Android Swift build identity and structural arguments', () => {
    const swift633 = { major: 6, minor: 3, patch: 3 }
    const swift642 = { major: 6, minor: 4, patch: 2 }
    const swift613 = { major: 6, minor: 1, patch: 3 }

    test('uses minSDK for supported triples independently of compileSDK', () => {
        const identity633 = makeAndroidBuildIdentity({
            mode: SwiftBuildMode.AndroidArm64,
            release: false,
            targetName: 'Demo',
            targetAPI: 28,
            swiftArgs: [],
            swiftVersion: swift633
        })
        const identity642 = makeAndroidBuildIdentity({
            mode: SwiftBuildMode.AndroidArm64,
            release: false,
            targetName: 'Demo',
            targetAPI: 28,
            swiftArgs: [],
            swiftVersion: swift642
        })
        assert.strictEqual(identity633.swiftSDK, 'aarch64-unknown-linux-android28')
        assert.strictEqual(identity642.swiftSDK, 'aarch64-unknown-linux-android28')
        assert.strictEqual(androidBuildIdentityKey(identity633), androidBuildIdentityKey({ ...identity633 }))
        assert.notStrictEqual(androidBuildIdentityKey(identity633), androidBuildIdentityKey({ ...identity633, targetAPI: 35, swiftSDK: 'aarch64-unknown-linux-android35' }))
    })

    test('preserves the legacy armv7 spelling', () => {
        const identity = makeAndroidBuildIdentity({
            mode: SwiftBuildMode.AndroidArmEabi,
            release: false,
            targetName: 'Demo',
            targetAPI: 28,
            swiftArgs: [],
            swiftVersion: swift613
        })
        assert.strictEqual(identity.swiftSDK, 'armv7-unknown-linux-androideabi28')
    })

    test('uses the community Swift 6.2 ABI/minSDK target triple selector', () => {
        const identity = makeAndroidBuildIdentity({
            mode: SwiftBuildMode.AndroidArm64,
            release: false,
            targetName: 'Demo',
            targetAPI: 28,
            swiftArgs: [],
            swiftVersion: { major: 6, minor: 2, patch: 0 }
        })
        assert.strictEqual(identity.swiftSDK, 'aarch64-unknown-linux-android28')
    })

    test('rejects targets below the official Android API 28 floor before build identity creation', () => {
        for (const swiftVersion of [swift633, swift642]) {
            assert.throws(() => makeAndroidBuildIdentity({
                mode: SwiftBuildMode.AndroidArm64,
                release: false,
                targetName: 'Demo',
                targetAPI: 23,
                swiftArgs: [],
                swiftVersion
            }), (error: unknown) => `${error}`.includes('minimum API floor is 28'))
        }
    })

    test('rejects every Android-owned structural option and accepts forwarding options', () => {
        const reserved = [
            '-c', '--configuration', '--build-path', '--scratch-path', '-C', '--chdir',
            '--package-path', '--swift-sdk', '--swift-sdks-path', '--experimental-swift-sdk',
            '--experimental-swift-sdks-path', '--triple', '--destination', '--toolset', '--sdk',
            '--toolchain', '--build-system', '--product', '--target', '--arch'
        ]
        for (const token of reserved) {
            assert.throws(() => validateAndroidSwiftArgs([token]), (error: unknown) => `${error}`.includes(token))
            if (token.startsWith('--')) {
                assert.throws(() => validateAndroidSwiftArgs([`${token}=value`]), (error: unknown) => `${error}`.includes(token))
            }
        }
        assert.throws(() => validateAndroidSwiftArgs(['--']), (error: unknown) => `${error}`.includes('--'))
        assert.doesNotThrow(() => validateAndroidSwiftArgs(['-Xswiftc', '-DTRACE', '-Xcc', '-DANDROID', '-Xcxx', '-std=c++17', '-Xlinker', '-z']))
    })

    test('bin-path query shares only typed output identity', () => {
        const identity: AndroidBuildIdentity = makeAndroidBuildIdentity({
            mode: SwiftBuildMode.Androidx86_64,
            release: true,
            targetName: 'Demo',
            targetAPI: 28,
            swiftArgs: ['-Xswiftc', '-DTRACE'],
            swiftVersion: swift642
        })
        assert.deepStrictEqual(androidShowBinPathArgs(identity), [
            'build', '--show-bin-path', '-c', 'release', '--build-path', './.build/.droid',
            '--swift-sdk', 'x86_64-unknown-linux-android28'
        ])
        assert.strictEqual(androidShowBinPathArgs(identity).includes('Demo'), false)
        assert.strictEqual(androidShowBinPathArgs(identity).includes('-DTRACE'), false)
    })

    test('cache identities coexist for products and ABIs', () => {
        const base = makeAndroidBuildIdentity({
            mode: SwiftBuildMode.AndroidArm64,
            release: false,
            targetName: 'LibraryA',
            targetAPI: 28,
            swiftArgs: [],
            swiftVersion: swift642
        })
        const otherProduct = { ...base, productName: 'LibraryB' }
        const otherABI = { ...base, arch: 'x86_64', swiftSDK: 'x86_64-unknown-linux-android28' }
        assert.notStrictEqual(androidBuildIdentityKey(base), androidBuildIdentityKey(otherProduct))
        assert.notStrictEqual(androidBuildIdentityKey(base), androidBuildIdentityKey(otherABI))
        assert.notStrictEqual(androidBuildIdentityKey(base), androidBuildIdentityKey({ ...base, swiftArgs: ['-Xswiftc', '-DTRACE'] }))
    })
})
