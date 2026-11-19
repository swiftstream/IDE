import * as assert from 'assert'
import { pureAttachDebuggerConfig, pureDebugConfig } from '../helpers/createDebugConfigIfNeeded'
import { SwiftBuildMode, swiftPMShowBinPathArguments } from '../swift'

suite('SwiftPM runnable binary path selection', () => {
    test('queries the debug bin path from SwiftPM instead of hardcoding the target triple layout', () => {
        assert.deepStrictEqual(swiftPMShowBinPathArguments(false), [
            'build',
            '--show-bin-path',
            '-c', 'debug',
            '--build-path', './.build'
        ])
    })

    test('queries the release bin path from SwiftPM instead of hardcoding the target triple layout', () => {
        assert.deepStrictEqual(swiftPMShowBinPathArguments(true), [
            'build',
            '--show-bin-path',
            '-c', 'release',
            '--build-path', './.build'
        ])
    })

    test('queries the arm64 Static Linux bin path with the exact SDK identity', () => {
        assert.deepStrictEqual(swiftPMShowBinPathArguments(false, SwiftBuildMode.StaticLinuxArm), [
            'build',
            '--show-bin-path',
            '-c', 'debug',
            '--build-path', './.build',
            '--swift-sdk', 'aarch64-swift-linux-musl',
            '--static-swift-stdlib'
        ])
    })

    test('queries the x86_64 Static Linux bin path with the exact SDK identity', () => {
        assert.deepStrictEqual(swiftPMShowBinPathArguments(true, SwiftBuildMode.StaticLinuxX86), [
            'build',
            '--show-bin-path',
            '-c', 'release',
            '--build-path', './.build',
            '--swift-sdk', 'x86_64-swift-linux-musl',
            '--static-swift-stdlib'
        ])
    })

    test('passes the resolved SwiftPM executable path to launch and attach debug configs', () => {
        const program = '/workspaces/App/.build/custom-bin/debug/App'
        assert.strictEqual(pureDebugConfig({
            target: 'App',
            args: [],
            program
        }).program, program)
        assert.strictEqual(pureAttachDebuggerConfig({
            target: 'App',
            pid: 123,
            program
        }).program, program)
    })
})
