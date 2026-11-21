import * as assert from 'assert'
import { getWasiBuildConfiguration } from '../wasiBuild'

suite('Ordinary WASI SDK and output selection', () => {
    test('selects the exact official Swift 6.4.3 full SDK and wasip1 target', () => {
        assert.deepStrictEqual(getWasiBuildConfiguration(false, 'https://download.swift.org/swift-6.4.3-release/wasm-sdk/swift-6.4.3-RELEASE/swift-6.4.3-RELEASE_wasm.artifactbundle.tar.gz'), {
            swiftSDK: 'swift-6.4.3-RELEASE_wasm',
            targetTriple: 'wasm32-unknown-wasip1'
        })
    })

    test('selects the exact official Swift 6.3.3 full SDK and wasip1 target', () => {
        assert.deepStrictEqual(getWasiBuildConfiguration(false, 'https://download.swift.org/swift-6.3.3-release/wasm-sdk/swift-6.3.3-RELEASE_wasm.artifactbundle.tar.gz'), {
            swiftSDK: 'swift-6.3.3-RELEASE_wasm',
            targetTriple: 'wasm32-unknown-wasip1'
        })
    })

    test('preserves the official Swift 6.2 SDK version spelling', () => {
        assert.deepStrictEqual(getWasiBuildConfiguration(false, 'https://mirror.example/swift-6.2-RELEASE_wasm.artifactbundle.zip'), {
            swiftSDK: 'swift-6.2-RELEASE_wasm',
            targetTriple: 'wasm32-unknown-wasip1'
        })
    })

    test('keeps older community SDK artifacts on the legacy selector and target', () => {
        assert.deepStrictEqual(getWasiBuildConfiguration(false, 'https://github.com/swiftwasm/swift/releases/download/swift-6.1.3-RELEASE/swift-6.1.3-RELEASE_wasmwasip1-threads.artifactbundle.tar.gz'), {
            swiftSDK: 'wasm32-unknown-wasi',
            targetTriple: 'wasm32-unknown-wasi'
        })
    })

    test('preserves Swift 5 even when an official modern artifact is configured', () => {
        assert.deepStrictEqual(getWasiBuildConfiguration(true, 'https://download.swift.org/swift-6.3.3-release/wasm-sdk/swift-6.3.3-RELEASE_wasm.artifactbundle.tar.gz'), {
            swiftSDK: 'wasm32-unknown-wasi',
            targetTriple: 'wasm32-unknown-wasi'
        })
    })

    test('preserves legacy selection for missing or unrecognized artifact URLs', () => {
        assert.deepStrictEqual(getWasiBuildConfiguration(false, undefined), {
            swiftSDK: 'wasm32-unknown-wasi',
            targetTriple: 'wasm32-unknown-wasi'
        })
        assert.deepStrictEqual(getWasiBuildConfiguration(false, 'https://example.com/swift-6.3.3-RELEASE_wasm-embedded.artifactbundle.tar.gz'), {
            swiftSDK: 'wasm32-unknown-wasi',
            targetTriple: 'wasm32-unknown-wasi'
        })
        assert.deepStrictEqual(getWasiBuildConfiguration(false, 'not a URL'), {
            swiftSDK: 'wasm32-unknown-wasi',
            targetTriple: 'wasm32-unknown-wasi'
        })
    })

    test('ignores URL query strings when deriving the SDK ID', () => {
        assert.deepStrictEqual(getWasiBuildConfiguration(false, 'https://download.swift.org/swift-6.3.3-RELEASE_wasm.artifactbundle.tar.gz?download=1&token=ignored'), {
            swiftSDK: 'swift-6.3.3-RELEASE_wasm',
            targetTriple: 'wasm32-unknown-wasip1'
        })
    })

    test('does not mistake the embedded artifact for the full-featured SDK', () => {
        assert.notStrictEqual(
            getWasiBuildConfiguration(false, 'https://example.com/swift-6.3.3-RELEASE_wasm.artifactbundle.tar.gz').swiftSDK,
            'swift-6.3.3-RELEASE_wasm-embedded'
        )
    })
})
