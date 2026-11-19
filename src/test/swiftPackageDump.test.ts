import * as assert from 'assert'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { BashResult } from '../bash'
import { SwiftPackageDump } from '../swiftPackageDump'

const extensionModule = require('../extension') as typeof import('../extension')

suite('Swift package dump compatibility', () => {
    test('accepts a successful package dump that emits warnings on stderr', async () => {
        const projectPath = fs.mkdtempSync(path.join(os.tmpdir(), 'swiftstream-package-dump-'))
        fs.writeFileSync(path.join(projectPath, 'Package.swift'), '// swift-tools-version: 6.4\n')

        const originalProjectDirectory = (extensionModule as any).projectDirectory
        ;(extensionModule as any).projectDirectory = projectPath

        const stdout = JSON.stringify({
            name: 'Demo',
            dependencies: [],
            products: [{
                name: 'AppUI',
                targets: ['AppUI'],
                type: { library: ['dynamic'] }
            }],
            targets: []
        })

        const stream = {
            bash: {
                which: async () => '/swift/toolchains/6.4.2-RELEASE/usr/bin/swift',
                execute: async () => new BashResult(
                    '/swift/toolchains/6.4.2-RELEASE/usr/bin/swift',
                    1,
                    0,
                    "warning: 'v10_15' is deprecated: macOS 12.0 is the oldest supported version",
                    stdout,
                    'swift package dump'
                )
            }
        } as any

        try {
            const dump = new SwiftPackageDump(stream)
            await dump.dump({ fresh: true, type: 'native' as any })

            assert.strictEqual(dump.content.name, 'Demo')
            assert.deepStrictEqual(
                dump.content.products.map(product => ({
                    name: product.name,
                    isLibrary: product.isLibrary
                })),
                [{ name: 'AppUI', isLibrary: true }]
            )
        } finally {
            ;(extensionModule as any).projectDirectory = originalProjectDirectory
            fs.rmSync(projectPath, { recursive: true, force: true })
        }
    })
})
