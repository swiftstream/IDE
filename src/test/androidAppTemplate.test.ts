import * as assert from 'assert'
import * as fs from 'fs'
import * as path from 'path'

suite('Android application template entry points', () => {
    test('keeps App @main only for Android and leaves AppManifest as the host entry point', () => {
        const appTemplate = fs.readFileSync(
            path.resolve(__dirname, '../../assets/Sources/android/app/Sources/swift/App.hbs'),
            'utf8'
        )
        const manifestTemplate = fs.readFileSync(
            path.resolve(__dirname, '../../assets/Sources/android/app/Sources/swift/Manifest.hbs'),
            'utf8'
        )

        assert.ok(appTemplate.includes('#if os(Android)\n@main\n#endif\npublic final class App: DroidApp'))
        assert.ok(manifestTemplate.includes('@main\n/// Proxy target which points to manifest declared in App'))
        assert.ok(manifestTemplate.includes('App.main()'))
    })
})
