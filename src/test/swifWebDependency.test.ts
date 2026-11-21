import * as assert from 'assert'
import { swifWebMinimumVersion, swifWebPackageDependency } from '../wizards/swifWebDependency'

suite('Generated Web project SwifWeb dependency', () => {
    test('uses nightly.14 as the generated Package.swift lower bound', () => {
        assert.strictEqual(swifWebMinimumVersion, '2.0.0-nightly.14')
        assert.strictEqual(
            swifWebPackageDependency('https://github.com/swifweb'),
            '.package(url: "https://github.com/swifweb/web", from: "2.0.0-nightly.14")'
        )
    })
})
