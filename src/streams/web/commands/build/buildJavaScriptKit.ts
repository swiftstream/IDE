import * as fs from 'fs'
import { projectDirectory, webStream } from '../../../../extension'
import { webSourcesFolder } from '../../../../streams/web/webStream'
import { buildStatus, print } from '../../../../streams/stream'
import { LogLevel } from '../../../../streams/stream'
import { getLastModifiedDate, LastModifiedDateType, saveLastModifiedDateForKey, wasFileModified } from '../../../../helpers/filesHelper'
import { SwiftBuildType } from '../../../../swift'
import { TimeMeasure } from '../../../../helpers/timeMeasureHelper'
import { doesPackageCheckedOut, KnownPackage } from '../../../../commands/build/helpers'
import { AbortHandler } from '../../../../bash'
import {
    getJavaScriptKitBuildActions,
    javaScriptKitFallbackInstallArguments,
    missingJavaScriptKitBuildDependencies
} from './javaScriptKitBuildDependencies'

export async function buildJavaScriptKit(options: {
    force: boolean,
    abortHandler: AbortHandler
}) {
    if (!webStream) throw `webStream is null`
    const jsKitPath = `${projectDirectory}/.build/.${SwiftBuildType.Wasi}/checkouts/JavaScriptKit`
    let packageWasModified = false
    const packageWasCompiled = doesJavaScriptKitCompiled(jsKitPath)
    const measure = new TimeMeasure()
    const doesPackageModulesPresent = () => fs.existsSync(`${jsKitPath}/node_modules`)
    if (doesPackageCheckedOut(KnownPackage.JavaScriptKit)) {
        packageWasModified = wasFileModified({
            path: `${jsKitPath}/package.json`,
            lastModifedTimestampMs: getLastModifiedDate(LastModifiedDateType.JavaScriptKitPackage)
        })
    }
    const buildActions = getJavaScriptKitBuildActions({
        force: options.force,
        packageModulesPresent: doesPackageModulesPresent(),
        runtimePresent: packageWasCompiled,
        packageWasModified
    })
    if (buildActions.shouldSkip) {
        print(`🫖 Skipping JavaScriptKit build since it is been compiled in past`, LogLevel.Detailed)
        return
    }
    if (!packageWasCompiled || !doesPackageModulesPresent()) {
        print(`🫖 Building JavaScriptKit for the first time`, LogLevel.Detailed)
    } else if (packageWasModified) {
        print(`🫖 Rebuilding JavaScriptKit since it's been updated`, LogLevel.Detailed)
    } else {
        print(`🫖 Building JavaScriptKit`, LogLevel.Detailed)
    }
    if (options.abortHandler.isCancelled) return
    buildStatus(`Building JavaScriptKit`)

    if (buildActions.installPackageDependencies) {
        if (!doesPackageModulesPresent()) {
            try {
                print(`Deleting ${jsKitPath}/package-lock.json`, LogLevel.Verbose)
                fs.rmSync(`${jsKitPath}/package-lock.json`, { force: true })
            } catch (error) {
                print(`Error deleting ${jsKitPath}/package.json: ${error}`, LogLevel.Verbose)
            }
        }
        print(`Building JavaScriptKit: npm install`, LogLevel.Verbose)
        buildStatus('Building JavaScriptKit: npm install')
        await webStream.npmJSKit.install([], options.abortHandler)
        if (!doesPackageModulesPresent())
            throw `JavaScriptKit: npm install failed`
    }

    if (buildActions.buildRuntime) {
        const missingBuildDependencies = missingJavaScriptKitBuildDependencies(jsKitPath)
        if (missingBuildDependencies.length > 0) {
            print(`Building JavaScriptKit: installing missing build dependencies ${missingBuildDependencies.join(', ')}`, LogLevel.Verbose)
            buildStatus('Building JavaScriptKit: installing missing build dependencies')
            await webStream.npmJSKit.install(javaScriptKitFallbackInstallArguments(), options.abortHandler)
            const unresolvedBuildDependencies = missingJavaScriptKitBuildDependencies(jsKitPath)
            if (unresolvedBuildDependencies.length > 0)
                throw new Error(`JavaScriptKit: missing build dependencies ${unresolvedBuildDependencies.join(', ')}`)
        }
        print(`Building JavaScriptKit: npm run build`, LogLevel.Verbose)
        buildStatus('Building JavaScriptKit: npm run build')
        await webStream.npmJSKit.run(['build'], options.abortHandler)
        if (!doesJavaScriptKitCompiled(jsKitPath)) {
            print(`Building JavaScriptKit: npm run build (2nd attempt)`, LogLevel.Verbose)
            await webStream.npmJSKit.run(['build'], options.abortHandler)
        }
        if (!doesJavaScriptKitCompiled(jsKitPath))
            throw new Error('JavaScriptKit: npm run build did not produce Runtime/lib/index.d.ts')
    }

    print(`Building JavaScriptKit: checking versions`, LogLevel.Verbose)
    const projectPackageLockPath = `${projectDirectory}/${webSourcesFolder}/package-lock.json`
    const jsKitPackagePath = `${jsKitPath}/package.json`
    if (fs.existsSync(projectPackageLockPath)) {
        const versions = readVersions({ projectLock: projectPackageLockPath, jsKitPackage: jsKitPackagePath })
        if (versions.locked != versions.current) {
            print(`Updating JavaScriptKit v${versions.locked} to v${versions.current} via npm install in WebSources folder`, LogLevel.Verbose)
            buildStatus('Updating JavaScriptKit in web sources')
            await webStream.npmWeb.install([], options.abortHandler)
            const versionsAfterInstall = readVersions({ projectLock: projectPackageLockPath, jsKitPackage: jsKitPackagePath })
            if (versionsAfterInstall.locked != versionsAfterInstall.current) {
                print(`JavaScriptKit installed version mismatch: v${versionsAfterInstall.locked} != v${versionsAfterInstall.current}`, LogLevel.Detailed)
                throw `JavaScriptKit installed version mismatch ${versionsAfterInstall.locked} != ${versionsAfterInstall.current}`
            }
        } else {
            print(`JavaScriptKit v${versions.locked} is up to date in WebSources folder`, LogLevel.Verbose)
        }
    } else {
        print(`Skipping JavaScriptKit versions check since WebSources never been built`, LogLevel.Verbose)
    }
    if (options.abortHandler.isCancelled) return
    saveLastModifiedDateForKey(LastModifiedDateType.JavaScriptKitPackage)
    measure.finish()
    print(`🫖 Built JavaScriptKit in ${measure.fulltime}`, LogLevel.Detailed)
}
function doesJavaScriptKitCompiled(jsKitPath: string): boolean {
	const value = fs.existsSync(`${jsKitPath}/Runtime/lib/index.d.ts`)
	print(`JavaScriptKit ${value ? 'compiled' : 'not compiled'}`, LogLevel.Unbearable)
	return value
}
function readVersions(options: { projectLock: string, jsKitPackage: string }): { current: string, locked: string } {
    const packageLockContent: string = fs.readFileSync(options.projectLock, 'utf8')
    const jsKitPackageContent: string = fs.readFileSync(options.jsKitPackage, 'utf8')
    const packageLock = JSON.parse(packageLockContent)
    const jsKitPackage = JSON.parse(jsKitPackageContent)
    const lockedPackages: any = packageLock.packages
    const lockedKeys = Object.keys(lockedPackages).filter((x) => x.endsWith('/JavaScriptKit'))
    if (lockedKeys.length != 1)
        throw `JavaScriptKit package not installed in WebSources folder`
    const result = {
        current: jsKitPackage.version,
        locked: lockedPackages[lockedKeys[0]].version
    }
    print(`JavaScriptKit: current v${result.current} locked v${result.locked}`, LogLevel.Unbearable)
    return result
}
