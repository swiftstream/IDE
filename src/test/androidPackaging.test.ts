import * as assert from 'assert'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { AndroidABIProducts, copyAuthoritativeAndroidProducts } from '../androidLibraryProject'
import { DroidBuildArch } from '../streams/android/androidStream'

suite('Android authoritative JNI packaging', () => {
    let projectPath: string
    const targets = ['LibraryA', 'LibraryB']
    const archs = [DroidBuildArch.Arm64, DroidBuildArch.x86_64]

    setup(() => {
        projectPath = fs.mkdtempSync(path.join(os.tmpdir(), 'swiftstream-android-packaging-'))
        for (const arch of archs) {
            for (const target of targets) {
                fs.mkdirSync(path.join(projectPath, 'Library', target.toLowerCase(), 'src', 'main', 'jniLibs', arch), { recursive: true })
            }
        }
    })

    teardown(() => fs.rmSync(projectPath, { recursive: true, force: true }))

    test('copies every product and ABI from distinct authoritative paths', () => {
        const buildResults: AndroidABIProducts[] = []
        for (const arch of archs) {
            const productPathByProduct: Record<string, string> = {}
            for (const target of targets) {
                const sourcePath = path.join(projectPath, 'authoritative', arch, `lib${target}.so`)
                fs.mkdirSync(path.dirname(sourcePath), { recursive: true })
                fs.writeFileSync(sourcePath, `${target}-${arch}`)
                productPathByProduct[target] = sourcePath
                const destinationFolder = path.join(projectPath, 'Library', target.toLowerCase(), 'src', 'main', 'jniLibs', arch)
                fs.writeFileSync(path.join(destinationFolder, 'consumer-file.txt'), 'preserve')
            }
            buildResults.push({ arch, binPathByProduct: {}, productPathByProduct })
        }
        copyAuthoritativeAndroidProducts({ projectPath, targets, archs, buildResults })
        for (const arch of archs) {
            for (const target of targets) {
                const folder = path.join(projectPath, 'Library', target.toLowerCase(), 'src', 'main', 'jniLibs', arch)
                assert.strictEqual(fs.readFileSync(path.join(folder, `lib${target}.so`), 'utf8'), `${target}-${arch}`)
                assert.strictEqual(fs.existsSync(path.join(folder, 'consumer-file.txt')), true)
            }
        }
    })

    test('fails on missing authoritative source or retained path collision', () => {
        const sourcePath = path.join(projectPath, 'authoritative', 'shared.so')
        fs.mkdirSync(path.dirname(sourcePath), { recursive: true })
        fs.writeFileSync(sourcePath, 'shared')
        const result: AndroidABIProducts = {
            arch: DroidBuildArch.Arm64,
            binPathByProduct: {},
            productPathByProduct: { LibraryA: sourcePath, LibraryB: sourcePath }
        }
        assert.throws(() => copyAuthoritativeAndroidProducts({ projectPath, targets, archs: [DroidBuildArch.Arm64], buildResults: [result] }), /path collision/)
        assert.throws(() => copyAuthoritativeAndroidProducts({
            projectPath,
            targets,
            archs: [DroidBuildArch.Arm64],
            buildResults: [{ ...result, productPathByProduct: { LibraryA: path.join(projectPath, 'missing.so'), LibraryB: sourcePath } }]
        }), /source product missing/)
    })
})
