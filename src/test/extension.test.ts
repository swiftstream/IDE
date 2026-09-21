import * as assert from 'assert'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import * as vscode from 'vscode'
import { DevContainerConfig } from '../devContainerConfig'

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

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5))
		assert.strictEqual(-1, [1, 2, 3].indexOf(0))
	})
})
