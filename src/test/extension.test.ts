import * as assert from 'assert'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import * as vscode from 'vscode'
import { DevContainerConfig, EmbeddedBranch, generateDevcontainerJson } from '../devContainerConfig'

const extensionId = "swiftstream.swiftstream"
const extension = vscode.extensions.getExtension(extensionId)
assert.ok(extension, "Extension is not found")

const testGraphExtension = require('../extension') as typeof import('../extension')
let originalTestGraphExtensionContext: unknown

suiteSetup(async () => {
	originalTestGraphExtensionContext = (testGraphExtension as any).extensionContext

	if (!extension.isActive) {
		await extension.activate()
	}
	assert.ok(extension.isActive, "Extension did not activate")

	;(testGraphExtension as any).extensionContext = {
		extensionUri: extension.extensionUri
	}

	assert.strictEqual(
		(testGraphExtension as any).extensionContext.extensionUri.toString(),
		extension.extensionUri.toString()
	)
})

suiteTeardown(() => {
	;(testGraphExtension as any).extensionContext = originalTestGraphExtensionContext
})

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.')

	test('Dev Container Config test', () => {
		const tempDirectory = fs.mkdtempSync(
			path.join(os.tmpdir(), 'swiftstream-devcontainer-config-')
		)
		const configPath = path.join(tempDirectory, 'devcontainer.json')
		try {
			fs.writeFileSync(configPath, JSON.stringify({ features: {} }))
			const config = new DevContainerConfig(configPath)
			assert.strictEqual(config.hasFeature('swiftstream/vsce:latest'), undefined)
		} finally {
			fs.rmSync(tempDirectory, { recursive: true, force: true })
		}
	})

	test('Generated Android Dev Container defaults to Swift 6.4.3 and the official Android SDK', () => {
		const config = generateDevcontainerJson(
			testGraphExtension.ExtensionStream.Android,
			{ major: 6, minor: 4 }
		)
		assert.ok(config)
		assert.strictEqual(config.postStartCommand, 'cmd.sh')
		assert.strictEqual(config.waitFor, 'postStartCommand')
		assert.strictEqual(config.containerEnv.S_VERSION_MAJOR, '6')
		assert.strictEqual(config.containerEnv.S_VERSION_MINOR, '4')
		assert.strictEqual(config.containerEnv.S_VERSION_PATCH, '3')
		assert.strictEqual(config.containerEnv.S_ANDROID_SDK_MIN_API, '28')
		assert.strictEqual(config.containerEnv.S_NDK_VERSION, 'r30')
		assert.strictEqual(config.containerEnv.S_ANDROID_SDK_SETUP, 'swiftbuild')
		assert.strictEqual(
			config.containerEnv.S_ARTIFACT_ANDROID_URL,
			'https://download.swift.org/swift-6.4.3-release/android-sdk/swift-6.4.3-RELEASE/swift-6.4.3-RELEASE_android.artifactbundle.tar.gz'
		)
		assert.strictEqual(
			config.customizations.vscode.settings['swift.path'],
			'/swift/toolchains/6.4.3-RELEASE/usr/bin'
		)
		assert.strictEqual(
			config.customizations.vscode.settings['swift.swiftEnvironmentVariables'],
			undefined
		)
	})

	test('Generated Web Dev Container defaults to Swift 6.4.3 and the official WASM SDK', () => {
		const config = generateDevcontainerJson(
			testGraphExtension.ExtensionStream.Web,
			{ major: 6, minor: 4 }
		)
		assert.ok(config)
		assert.strictEqual(config.postStartCommand, 'cmd.sh')
		assert.strictEqual(config.waitFor, 'postStartCommand')
		assert.strictEqual(config.containerEnv.S_VERSION_MAJOR, '6')
		assert.strictEqual(config.containerEnv.S_VERSION_MINOR, '4')
		assert.strictEqual(config.containerEnv.S_VERSION_PATCH, '3')
		assert.strictEqual(
			config.containerEnv.S_ARTIFACT_WASI_URL,
			'https://download.swift.org/swift-6.4.3-release/wasm-sdk/swift-6.4.3-RELEASE/swift-6.4.3-RELEASE_wasm.artifactbundle.tar.gz'
		)
		assert.strictEqual(
			config.customizations.vscode.settings['swift.path'],
			'/swift/toolchains/6.4.3-RELEASE/usr/bin'
		)
	})

	test('Generated Pure Dev Container defaults to Swift 6.4.3 and the official Static Linux SDK', () => {
		const config = generateDevcontainerJson(
			testGraphExtension.ExtensionStream.Pure,
			{ major: 6, minor: 4 }
		)
		assert.ok(config)
		assert.strictEqual(config.postStartCommand, 'cmd.sh')
		assert.strictEqual(config.waitFor, 'postStartCommand')
		assert.strictEqual(config.containerEnv.S_VERSION_MAJOR, '6')
		assert.strictEqual(config.containerEnv.S_VERSION_MINOR, '4')
		assert.strictEqual(config.containerEnv.S_VERSION_PATCH, '3')
		assert.strictEqual(
			config.containerEnv.S_ARTIFACT_STATIC_LINUX_URL,
			'https://download.swift.org/swift-6.4.3-release/static-sdk/swift-6.4.3-RELEASE/swift-6.4.3-RELEASE_static-linux-0.1.0.artifactbundle.tar.gz'
		)
		assert.strictEqual(
			config.customizations.vscode.settings['swift.path'],
			'/swift/toolchains/6.4.3-RELEASE/usr/bin'
		)
	})

	test('Generated Server Dev Container defaults to Swift 6.4.3 and the official Static Linux SDK', () => {
		const config = generateDevcontainerJson(
			testGraphExtension.ExtensionStream.Server,
			{ major: 6, minor: 4 }
		)
		assert.ok(config)
		assert.strictEqual(config.containerEnv.S_VERSION_MAJOR, '6')
		assert.strictEqual(config.containerEnv.S_VERSION_MINOR, '4')
		assert.strictEqual(config.containerEnv.S_VERSION_PATCH, '3')
		assert.strictEqual(
			config.containerEnv.S_ARTIFACT_STATIC_LINUX_URL,
			'https://download.swift.org/swift-6.4.3-release/static-sdk/swift-6.4.3-RELEASE/swift-6.4.3-RELEASE_static-linux-0.1.0.artifactbundle.tar.gz'
		)
		assert.strictEqual(
			config.customizations.vscode.settings['swift.path'],
			'/swift/toolchains/6.4.3-RELEASE/usr/bin'
		)
	})

	test('Generated Embedded Dev Containers default every branch to Swift 6.4.3', () => {
		for (const branch of [
			EmbeddedBranch.ESP32,
			EmbeddedBranch.STM32,
			EmbeddedBranch.RASPBERRY,
			EmbeddedBranch.NRF
		]) {
			const config = generateDevcontainerJson(
				testGraphExtension.ExtensionStream.Embedded,
				{ major: 6, minor: 4 },
				{ embedded: { branch } }
			)
			assert.ok(config)
			assert.strictEqual(config.containerEnv.S_VERSION_MAJOR, '6')
			assert.strictEqual(config.containerEnv.S_VERSION_MINOR, '4')
			assert.strictEqual(config.containerEnv.S_VERSION_PATCH, '3')
			assert.strictEqual(config.containerEnv.S_EMBEDDED_BRANCH, branch)
			assert.strictEqual(config.containerEnv.S_ARTIFACT_STATIC_LINUX_URL, undefined)
			assert.strictEqual(
				config.customizations.vscode.settings['swift.path'],
				'/swift/toolchains/6.4.3-RELEASE/usr/bin'
			)
		}
	})

	test('Generated Dev Containers disable competing automatic SwiftPM resolve by default', () => {
		for (const stream of [
			testGraphExtension.ExtensionStream.Android,
			testGraphExtension.ExtensionStream.Server,
			testGraphExtension.ExtensionStream.Web,
			testGraphExtension.ExtensionStream.Pure
		]) {
			const config = generateDevcontainerJson(stream, { major: 6, minor: 4 })
			assert.ok(config)
			assert.strictEqual(
				config.customizations.vscode.settings['swift.disableAutoResolve'],
				true
			)
		}

		for (const branch of [
			EmbeddedBranch.ESP32,
			EmbeddedBranch.STM32,
			EmbeddedBranch.RASPBERRY,
			EmbeddedBranch.NRF
		]) {
			const config = generateDevcontainerJson(
				testGraphExtension.ExtensionStream.Embedded,
				{ major: 6, minor: 4 },
				{ embedded: { branch } }
			)
			assert.ok(config)
			assert.strictEqual(
				config.customizations.vscode.settings['swift.disableAutoResolve'],
				true
			)
		}
	})

	test('Android swiftbuild bootstrap accepts API floors newer than its technical minimum', () => {
		const script = fs.readFileSync(
			path.resolve(__dirname, '..', '..', 'docker-images', 'android-dev', 'cmd.sh'),
			'utf8'
		)
		assert.ok(script.includes('10#${S_ANDROID_SDK_MIN_API} < 23'))
		assert.ok(script.includes('minimum API 23 or newer'))
		assert.ok(!script.includes('"${S_ANDROID_SDK_MIN_API}" == "23"'))

		const dockerfile = fs.readFileSync(
			path.resolve(__dirname, '..', '..', 'docker-images', 'android-dev', 'Dockerfile'),
			'utf8'
		)
		assert.ok(dockerfile.includes('ENV S_IMAGE_VERSION=102'))
	})

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5))
		assert.strictEqual(-1, [1, 2, 3].indexOf(0))
	})
})