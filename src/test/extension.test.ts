import * as assert from 'assert'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import * as vscode from 'vscode'
import { DevContainerConfig, generateDevcontainerJson } from '../devContainerConfig'

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

	test('Generated Android Dev Container waits for post-start toolchain setup', () => {
		const config = generateDevcontainerJson(
			testGraphExtension.ExtensionStream.Android,
			{ major: 6, minor: 4 }
		)
		assert.ok(config)
		assert.strictEqual(config.postStartCommand, 'cmd.sh')
		assert.strictEqual(config.waitFor, 'postStartCommand')
		assert.strictEqual(config.containerEnv.S_VERSION_MAJOR, '6')
		assert.strictEqual(config.containerEnv.S_VERSION_MINOR, '4')
		assert.strictEqual(config.containerEnv.S_VERSION_PATCH, '2')
		assert.strictEqual(config.containerEnv.S_ANDROID_SDK_MIN_API, '28')
		assert.strictEqual(config.containerEnv.S_NDK_VERSION, 'r30')
		assert.strictEqual(config.containerEnv.S_ANDROID_SDK_SETUP, 'swiftbuild')
		assert.strictEqual(
			config.customizations.vscode.settings['swift.path'],
			'/swift/toolchains/6.4.2-RELEASE/usr/bin'
		)
		assert.strictEqual(
			config.customizations.vscode.settings['swift.swiftEnvironmentVariables'],
			undefined
		)
	})

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5))
		assert.strictEqual(-1, [1, 2, 3].indexOf(0))
	})
})