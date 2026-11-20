import * as assert from 'assert'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import Handlebars from 'handlebars'
import {
    copyServiceImages,
    getServiceImagesPaths,
    makePWAServiceTarget,
    runWebResourceTransportSequence,
    serviceImagesDirectoryName
} from '../streams/web/serviceResourcePackaging'

const repositoryRoot = path.resolve(__dirname, '../..')
const packageTemplatePath = path.join(repositoryRoot, 'assets', 'Sources', 'Package.hbs')

function renderTargets(targets: any[], swiftSettings?: string[]) {
    Handlebars.registerHelper('arrNotEmpty', (value: { length: number } | undefined) => value && value.length > 0)
    const template = Handlebars.compile(fs.readFileSync(packageTemplatePath, 'utf8'))
    return template({
        swiftToolsVersion: '6.0',
        name: 'PackagingTest',
        targets,
        swiftSettings
    })
}

function targetBlock(renderedPackage: string, targetName: string) {
    const start = renderedPackage.indexOf('.executableTarget(\n            name: "' + targetName + '"')
    assert.notStrictEqual(start, -1, 'target was not rendered: ' + targetName)
    const marker = '\n        ),'
    const end = renderedPackage.indexOf(marker, start)
    assert.notStrictEqual(end, -1, 'target block did not terminate: ' + targetName)
    return renderedPackage.slice(start, end + marker.length)
}

function withTemporaryDirectory(callback: (root: string) => void) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'swiftstream-service-resources-'))
    try {
        callback(root)
    } finally {
        fs.rmSync(root, { recursive: true, force: true })
    }
}

suite('PWA Service resource packaging', () => {
    test('Service target factory excludes images without SwiftPM resources', () => {
        const target = makePWAServiceTarget()
        assert.strictEqual(target.type, 'executableTarget')
        assert.strictEqual(target.name, 'Service')
        assert.deepStrictEqual(target.dependencies, [
            '.product(name: "ServiceWorker", package: "web")'
        ])
        assert.deepStrictEqual(target.exclude, [serviceImagesDirectoryName])
        assert.strictEqual(Object.prototype.hasOwnProperty.call(target, 'resources'), false)
    })

    test('actual Package template renders the PWA Service exclude shape', () => {
        const rendered = renderTargets([makePWAServiceTarget()])
        const service = targetBlock(rendered, 'Service')
        assert.ok(service.includes('            exclude: [\n                "images",\n            ]'))
        assert.ok(service.includes('.product(name: "ServiceWorker", package: "web")'))
        assert.strictEqual(service.includes('resources:'), false)
        assert.strictEqual(service.includes('.copy("images'), false)
    })

    test('no-exclude targets preserve pre-change resources and swiftSettings blocks', () => {
        const dependency = '.product(name: "Example", package: "example")'
        const resourceTarget = {
            type: 'executableTarget',
            name: 'ResourceTarget',
            dependencies: [dependency],
            resources: ['.copy("favicon.ico")']
        }
        const resourceBlock = targetBlock(renderTargets([resourceTarget]), 'ResourceTarget')
        const expectedResourceBlock = [
            '.executableTarget(',
            '            name: "ResourceTarget",',
            '            dependencies: [',
            '                .product(name: "Example", package: "example"),',
            '            ],',
            '            resources: [',
            '                .copy("favicon.ico"),',
            '            ]',
            '        ),'
        ].join('\n')
        assert.strictEqual(resourceBlock, expectedResourceBlock)
        assert.strictEqual(resourceBlock.includes('exclude:'), false)

        const settingsTarget = {
            type: 'executableTarget',
            name: 'SettingsTarget',
            dependencies: [dependency],
            swiftSettings: true
        }
        const settingsBlock = targetBlock(
            renderTargets([settingsTarget], ['.enableUpcomingFeature("Example")']),
            'SettingsTarget'
        )
        const expectedSettingsBlock = [
            '.executableTarget(',
            '            name: "SettingsTarget",',
            '            dependencies: [',
            '                .product(name: "Example", package: "example"),',
            '            ],',
            '            swiftSettings: swiftSettings',
            '',
            '        ),'
        ].join('\n')
        assert.strictEqual(settingsBlock, expectedSettingsBlock)
        assert.strictEqual(settingsBlock.includes('exclude:'), false)
    })

    test('direct copy preserves nested file paths and bytes and reports overwrites', () => {
        withTemporaryDirectory((root) => {
            const source = path.join(root, 'Sources', 'Service', 'images')
            const destination = path.join(root, 'DistPublic', 'images')
            const nestedSource = path.join(source, 'nested', 'icon.bin')
            const rootBytes = Buffer.from([0, 1, 2, 255])
            const nestedBytes = Buffer.from([9, 8, 7, 0])
            fs.mkdirSync(path.dirname(nestedSource), { recursive: true })
            fs.writeFileSync(path.join(source, 'favicon.ico'), rootBytes)
            fs.writeFileSync(nestedSource, nestedBytes)
            const nestedDestination = path.join(destination, 'nested', 'icon.bin')
            fs.mkdirSync(path.dirname(nestedDestination), { recursive: true })
            fs.writeFileSync(nestedDestination, Buffer.from('old'))

            const result = copyServiceImages(source, destination)
            assert.deepStrictEqual(
                result.copiedFiles.map((file) => file.relativePath),
                ['favicon.ico', path.join('nested', 'icon.bin')]
            )
            assert.strictEqual(
                result.copiedFiles.find((file) => file.relativePath === 'favicon.ico')?.overwritten,
                false
            )
            assert.strictEqual(
                result.copiedFiles.find((file) => file.relativePath === path.join('nested', 'icon.bin'))?.overwritten,
                true
            )
            assert.deepStrictEqual(fs.readFileSync(path.join(destination, 'favicon.ico')), rootBytes)
            assert.deepStrictEqual(fs.readFileSync(nestedDestination), nestedBytes)
            assert.deepStrictEqual(fs.readFileSync(path.join(source, 'favicon.ico')), rootBytes)
            assert.deepStrictEqual(fs.readFileSync(nestedSource), nestedBytes)
        })
    })

    test('production sequence transports generic resources before Service collision bytes', () => {
        withTemporaryDirectory((root) => {
            const paths = getServiceImagesPaths(root, 'CustomService', 'DistPublic')
            const outputPath = path.join(paths.destinationDirectory, 'icon.png')
            const serviceBytes = Buffer.from('service')
            const events: string[] = []
            fs.mkdirSync(paths.sourceDirectory, { recursive: true })
            fs.writeFileSync(path.join(paths.sourceDirectory, 'icon.png'), serviceBytes)

            const disposition = runWebResourceTransportSequence({
                transportBundledResources: () => {
                    events.push('generic')
                    fs.mkdirSync(paths.destinationDirectory, { recursive: true })
                    fs.writeFileSync(outputPath, Buffer.from('generic'))
                },
                isCancelled: () => {
                    events.push('cancellation-check')
                    return false
                },
                transportServiceImages: () => {
                    events.push('service')
                    copyServiceImages(paths.sourceDirectory, paths.destinationDirectory)
                }
            })

            assert.deepStrictEqual(events, ['generic', 'cancellation-check', 'service'])
            assert.strictEqual(disposition, 'completed')
            assert.deepStrictEqual(fs.readFileSync(outputPath), serviceBytes)
        })
    })

    test('cancelled production sequence skips direct Service output', () => {
        withTemporaryDirectory((root) => {
            const genericOutput = path.join(root, 'DistPublic', 'generic.txt')
            const serviceOutput = path.join(root, 'DistPublic', 'service.txt')
            const events: string[] = []
            const disposition = runWebResourceTransportSequence({
                transportBundledResources: () => {
                    events.push('generic')
                    fs.mkdirSync(path.dirname(genericOutput), { recursive: true })
                    fs.writeFileSync(genericOutput, 'generic')
                },
                isCancelled: () => {
                    events.push('cancellation-check')
                    return true
                },
                transportServiceImages: () => {
                    events.push('service')
                    fs.writeFileSync(serviceOutput, 'service')
                }
            })

            assert.deepStrictEqual(events, ['generic', 'cancellation-check'])
            assert.strictEqual(disposition, 'cancelled')
            assert.strictEqual(fs.existsSync(genericOutput), true)
            assert.strictEqual(fs.existsSync(serviceOutput), false)
        })
    })

    test('missing Service image source is a no-op', () => {
        withTemporaryDirectory((root) => {
            const source = path.join(root, 'missing', 'images')
            const destination = path.join(root, 'DistPublic', 'images')
            const result = copyServiceImages(source, destination)
            assert.deepStrictEqual(result.copiedFiles, [])
            assert.deepStrictEqual(result.skippedEntries, [])
            assert.strictEqual(fs.existsSync(destination), false)
        })
    })

    test('symlinked files and directories are skipped without following targets', () => {
        withTemporaryDirectory((root) => {
            const source = path.join(root, 'Sources', 'Service', 'images')
            const destination = path.join(root, 'DistPublic', 'images')
            const externalDirectory = path.join(root, 'external')
            const outsideFile = path.join(root, 'outside.png')
            fs.mkdirSync(source, { recursive: true })
            fs.mkdirSync(externalDirectory)
            fs.writeFileSync(path.join(source, 'regular.png'), Buffer.from('regular'))
            fs.writeFileSync(outsideFile, Buffer.from('outside-file'))
            fs.writeFileSync(path.join(externalDirectory, 'secret.png'), Buffer.from('outside-directory'))
            fs.symlinkSync(outsideFile, path.join(source, 'linked-file.png'), 'file')
            fs.symlinkSync(
                externalDirectory,
                path.join(source, 'linked-directory'),
                process.platform === 'win32' ? 'junction' : 'dir'
            )

            const result = copyServiceImages(source, destination)
            assert.deepStrictEqual(result.copiedFiles.map((file) => file.relativePath), ['regular.png'])
            assert.deepStrictEqual(result.skippedEntries, ['linked-directory', 'linked-file.png'])
            assert.deepStrictEqual(fs.readFileSync(path.join(destination, 'regular.png')), Buffer.from('regular'))
            assert.strictEqual(fs.existsSync(path.join(destination, 'linked-file.png')), false)
            assert.strictEqual(fs.existsSync(path.join(destination, 'linked-directory')), false)
            assert.strictEqual(fs.existsSync(path.join(destination, 'linked-directory', 'secret.png')), false)
            assert.deepStrictEqual(fs.readFileSync(outsideFile), Buffer.from('outside-file'))
            assert.deepStrictEqual(
                fs.readFileSync(path.join(externalDirectory, 'secret.png')),
                Buffer.from('outside-directory')
            )
        })
    })

    test('Service paths honor a configured target name', () => {
        withTemporaryDirectory((root) => {
            const paths = getServiceImagesPaths(root, 'CustomService', 'DistPublic')
            assert.strictEqual(
                paths.sourceDirectory,
                path.join(root, 'Sources', 'CustomService', 'images')
            )
            assert.strictEqual(paths.sourceDirectory.includes(path.join('Sources', 'Service', 'images')), false)
            assert.strictEqual(paths.destinationDirectory, path.join(root, 'DistPublic', 'images'))
        })
    })
})
