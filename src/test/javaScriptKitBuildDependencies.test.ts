import * as assert from 'assert'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import {
    getJavaScriptKitBuildActions,
    javaScriptKitFallbackTslib,
    javaScriptKitFallbackInstallArguments,
    missingJavaScriptKitBuildDependencies
} from '../streams/web/commands/build/javaScriptKitBuildDependencies'

suite('JavaScriptKit build dependency fallback', () => {
    test('requests exact tslib fallback when JavaScriptKit does not install it', () => {
        const jsKitPath = fs.mkdtempSync(path.join(os.tmpdir(), 'swiftstream-jskit-'))
        try {
            assert.deepStrictEqual(
                missingJavaScriptKitBuildDependencies(jsKitPath),
                [javaScriptKitFallbackTslib]
            )
            assert.strictEqual(javaScriptKitFallbackTslib, 'tslib@2.8.1')
            assert.deepStrictEqual(javaScriptKitFallbackInstallArguments(), [
                'tslib@2.8.1',
                '--no-save',
                '--package-lock=false'
            ])
        } finally {
            fs.rmSync(jsKitPath, { recursive: true, force: true })
        }
    })

    test('does not inject fallback when JavaScriptKit already provides tslib', () => {
        const jsKitPath = fs.mkdtempSync(path.join(os.tmpdir(), 'swiftstream-jskit-'))
        try {
            fs.mkdirSync(path.join(jsKitPath, 'node_modules', 'tslib'), { recursive: true })
            assert.deepStrictEqual(missingJavaScriptKitBuildDependencies(jsKitPath), [])
        } finally {
            fs.rmSync(jsKitPath, { recursive: true, force: true })
        }
    })

    test('retries the runtime build when output is missing but node_modules exists', () => {
        assert.deepStrictEqual(getJavaScriptKitBuildActions({
            force: false,
            packageModulesPresent: true,
            runtimePresent: false,
            packageWasModified: false
        }), {
            shouldSkip: false,
            installPackageDependencies: false,
            buildRuntime: true
        })
    })

    test('skips a complete clean runtime when not forced', () => {
        assert.deepStrictEqual(getJavaScriptKitBuildActions({
            force: false,
            packageModulesPresent: true,
            runtimePresent: true,
            packageWasModified: false
        }), {
            shouldSkip: true,
            installPackageDependencies: false,
            buildRuntime: false
        })
    })

    test('installs dependencies and builds a fresh checkout', () => {
        assert.deepStrictEqual(getJavaScriptKitBuildActions({
            force: false,
            packageModulesPresent: false,
            runtimePresent: false,
            packageWasModified: false
        }), {
            shouldSkip: false,
            installPackageDependencies: true,
            buildRuntime: true
        })
    })

    test('updates dependencies and rebuilds a modified checkout', () => {
        assert.deepStrictEqual(getJavaScriptKitBuildActions({
            force: false,
            packageModulesPresent: true,
            runtimePresent: true,
            packageWasModified: true
        }), {
            shouldSkip: false,
            installPackageDependencies: true,
            buildRuntime: true
        })
    })

    test('a forced routine syncs packages without rebuilding a clean runtime', () => {
        assert.deepStrictEqual(getJavaScriptKitBuildActions({
            force: true,
            packageModulesPresent: true,
            runtimePresent: true,
            packageWasModified: false
        }), {
            shouldSkip: false,
            installPackageDependencies: false,
            buildRuntime: false
        })
    })
})
