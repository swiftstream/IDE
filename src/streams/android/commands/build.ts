import { window } from 'vscode'
import { AndroidLibraryProject } from '../../../androidLibraryProject'
import { AndroidStreamConfig, PackageMode, Scheme, SchemeBuildConfiguration } from '../../../androidStreamConfig'
import { resolveSwiftDependencies } from '../../../commands/build/resolveSwiftDependencies'
import { restartLSPCommand } from '../../../commands/restartLSP'
import { DevContainerConfig } from '../../../devContainerConfig'
import { projectDirectory, sidebarTreeView } from '../../../extension'
import { isString } from '../../../helpers/isString'
import { TimeMeasure } from '../../../helpers/timeMeasureHelper'
import { allSwiftDroidBuildTypes, SwiftBuildType } from '../../../swift'
import { buildStatus, clearStatus, isBuildingDebug, isHotBuildingSwift, LogLevel, print, status, StatusType } from '../../stream'
import { AndroidStream, DroidBuildArch } from '../androidStream'
import { buildExecutableTarget } from './build/buildExecutableTarget'
import { GradleFolder } from '../../../enums/GradleFolder'
import { AndroidAppProject } from '../../../androidAppProject'

let hasRestartedLSP = false

export async function buildCommand(stream: AndroidStream, scheme: Scheme) {
    if (isBuildingDebug || stream.isAnyHotBuilding()) { return }
    const measure = new TimeMeasure()
    const abortHandler = stream.setAbortBuildingDebugHandler(() => {
        measure.finish()
        status('circle-slash', `Aborted Build after ${measure.time}ms`, StatusType.Default)
        print(`🚫 Aborted Build after ${measure.time}ms`)
        console.log(`Aborted Build after ${measure.time}ms`)
        stream.setBuildingDebug(false)
        sidebarTreeView?.refresh()
    })
    stream.setBuildingDebug(true)
    sidebarTreeView?.cleanupErrors()
    sidebarTreeView?.refresh()
    try {
        print(`🏗️ Started building debug`, LogLevel.Normal, true)
		print(`💁‍♂️ it will try to build each phase`, LogLevel.Detailed)
        const targets = await stream.swift.getLibraryProducts({
            fresh: true,
            abortHandler: abortHandler
        })
        if (targets.length === 0) {
            window.showErrorMessage(`Unable to find products with type == library in the Package.swift`)
            return abortHandler.abort()
        }
        let phase = 1
        // Phase 1: Resolve Swift dependencies for each build type
        print(`🔳 Phase ${phase}: Resolve Swift dependencies for each build type`, LogLevel.Verbose)
        const buildTypes = allSwiftDroidBuildTypes()
        for (let i = 0; i < buildTypes.length; i++) {
			const type = buildTypes[i]
			await resolveSwiftDependencies({
				type: type,
				force: true,
				substatus: (t) => {
					buildStatus(`Resolving dependencies (${type}): ${t}`)
					print(`🔦 Resolving Swift dependencies ${t}`, LogLevel.Verbose)
				},
				abortHandler: abortHandler
			})
		}
        const streamConfig = new AndroidStreamConfig({ projectPath: projectDirectory! })
        const release = scheme.buildConfiguration == SchemeBuildConfiguration.Release
        // Phase 2: Retrieve Swift targets
        phase += 1
        print(`🔳 Phase ${++phase}: Retrieve Swift targets`, LogLevel.Verbose)
        await stream.chooseTarget({ release: release, abortHandler: abortHandler })
        if (!stream.swift.selectedDebugTarget) 
            throw `Please select Swift target to build`
        // Phase 3: Build preprocessing
        if (streamConfig.config.packageMode == PackageMode.App) {
            phase += 1
            print(`🔳 Phase ${++phase}: Prebuild app to retrieve metadata`, LogLevel.Verbose)
            print({
                detailed: `🧱 Building metadata swift target`,
                verbose: `🧱 Building metadata swift target in ${release ? 'release' : 'debug'} mode`
            })
            buildStatus(`\`metadata\` swift target: building`)
            const metadataMeasure = new TimeMeasure()
            await stream.swift.androidBuildMetadata({ release: release })
            metadataMeasure.finish()
            if (abortHandler.isCancelled) return
            print(`🧱 Built metadata swift target in ${metadataMeasure.time}ms`, LogLevel.Detailed)
            clearStatus()
        }
        // Phase 4: Build executable targets
        const shouldRestartLSP = !hasRestartedLSP || !stream.isDebugBuilt({
            target: stream.swift.selectedDebugTarget,
            arch: DroidBuildArch.Arm64,
            androidSDKCompileVersion: `${streamConfig.config.compileSDK}`
        })
        phase += 1
        print(`🔳 Phase ${phase}: Build executable targets`, LogLevel.Verbose)
        // Only one for current device, or all without device
        const archs = stream.currentBuildArch ? [stream.currentBuildArch] : [DroidBuildArch.Arm64, DroidBuildArch.ArmEabi, DroidBuildArch.x86_64]
        for (let i = 0; i < archs.length; i++) {
			const arch = archs[i]
            await buildExecutableTarget({
                type: SwiftBuildType.Droid,
                target: stream.swift.selectedDebugTarget,
                arch: arch,
                release: release,
                swiftArgs: scheme.swiftArgs,
                androidSDKCompileVersion: `${streamConfig.config.compileSDK}`,
                androidJNILogs: stream.isJNILogsEnabled,
                force: true,
                abortHandler: abortHandler
            })
        }
        // Phase 5: Create or repair Library project
        const swiftVersion = DevContainerConfig.swiftVersion()
        const swiftVersionString = `${swiftVersion.major}.${swiftVersion.minor}.${swiftVersion.patch}`
        phase += 1
        print(`🔳 Phase ${phase}: Create or repair Library project`, LogLevel.Verbose)
        if (!await stream.generateGradleProject({
            type: GradleFolder.Library,
            targets: targets,
            abortHandler: abortHandler
        })) throw `Unable to generate Library project`
        if (streamConfig.config.packageMode == PackageMode.App) {
            if (!await stream.generateGradleProject({
                type: GradleFolder.Application,
                targets: targets,
                abortHandler: abortHandler
            })) throw `Unable to generate Android project`
        }
        // Phase 6: Proceed Gradle targets
        phase += 1
        print(`🔳 Phase ${phase}: Proceed Gradle targets`, LogLevel.Verbose)
        AndroidLibraryProject.proceedTargets({
            projectPath: projectDirectory!,
            targets: targets
        })
        for (let t = 0; t < targets.length; t++) {
            const target = targets[t]
            AndroidLibraryProject.updateSubmodule({
                projectPath: projectDirectory!,
                config: streamConfig,
                swiftVersion: swiftVersionString,
                target: target
            })
        }
        // Phase 7: Copy .so files into Library project
        phase += 1
        print(`🔳 Phase ${phase}: Copy .so files`, LogLevel.Verbose)
        AndroidLibraryProject.copySoFiles({
            projectPath: projectDirectory!,
            release: release,
            targets: targets,
            archs: archs,
            scheme: scheme,
            streamConfig: streamConfig
        })
        // Phase 8: Proceed .so files
        phase += 1
        print(`🔳 Phase ${phase}: Proceed .so files`, LogLevel.Verbose)
        for (let a = 0; a < archs.length; a++) {
            const arch = archs[a]
            await AndroidLibraryProject.proceedSoDependencies(stream, {
                projectPath: projectDirectory!,
                targets: targets,
                arch: arch,
                swiftVersion: swiftVersionString,
                streamConfig: streamConfig,
            })
        }
        AndroidLibraryProject.removeObsoleteSubmodules({
            projectPath: projectDirectory!,
            targets: targets
        })
        // Phase 9: Proceed dependencies
        phase += 1
        print(`🔳 Phase ${phase}: Create or repair Library project`, LogLevel.Verbose)
        if (streamConfig.config.packageMode == PackageMode.App) {
            const droidVersion = stream.swift.findResolvedDroidVersion()
            const gradleDependencies = await stream.swift.androidGetGradleDependencies({ release: release }) ?? []
            if (droidVersion) {
                print(`📦 Current \`droid\` version: ${droidVersion}`, LogLevel.Verbose)
                gradleDependencies.push(`implementation("com.github.swifdroid:droid:${droidVersion}")`)
            }
            if (gradleDependencies.length > 0) {
                AndroidLibraryProject.proceedDependencies(stream, {
                    projectPath: projectDirectory!,
                    streamConfig: streamConfig,
                    dependencies: gradleDependencies
                })
            }
            const manifest = await stream.swift.androidManifest({ release: release })
            AndroidLibraryProject.proceedManifest(stream, {
                projectPath: projectDirectory!,
                streamConfig: streamConfig,
                manifest: manifest
            })
            const activityBodies = await stream.swift.androidGetAllActivityBodies({ release: release })
            AndroidLibraryProject.proceedActivityBodies(stream, {
                projectPath: projectDirectory!,
                streamConfig: streamConfig,
                activityBodies: activityBodies
            })
        }
        if (!stream.gradle(GradleFolder.Application).wrapper.isExists()) {
            print(`🧱 Preparing gradle wrapper`, LogLevel.Detailed)
            buildStatus(`preparing gradle wrapper`)
            const gradlewMeasure = new TimeMeasure()
            await stream.prepareGradleW({
                type: GradleFolder.Application,
                wrapIntoTask: true,
                abortHandler: abortHandler
            })
            gradlewMeasure.finish()
            if (abortHandler.isCancelled) return
            print(`🧱 Prepared gradle wrapper in ${gradlewMeasure.time}ms`, LogLevel.Detailed)
        }
        measure.finish()
        if (abortHandler.isCancelled) return
        status('check', `Build Succeeded in ${measure.time}ms`, StatusType.Success)
        print(`✅ Build Succeeded in ${measure.time}ms`)
        console.log(`Build Succeeded in ${measure.time}ms`)
        stream.setBuildingDebug(false)
        sidebarTreeView?.refresh()
        if (shouldRestartLSP) {
            hasRestartedLSP = true
            restartLSPCommand(true)
        }
    } catch (error: any) {
        stream.setBuildingDebug(false)
        sidebarTreeView?.refresh()
        const text = `Debug Build Failed`
        if (isString(error)) {
            print(`🧯 ${error}`)
        } else {
            const json = JSON.stringify(error)
            const errorText = `${json === '{}' ? error : json}`
            print(`🧯 ${text}: ${errorText}`)
            console.error(error)
        }
        status('error', `${text} (${measure.time}ms)`, StatusType.Error)
    }
}

// MARK: Hot Reload

interface HotRebuildSwiftParams {
    target?: string
}

let awaitingHotRebuildSwift: HotRebuildSwiftParams[] = []

export async function hotRebuildSwift(stream: AndroidStream, params: HotRebuildSwiftParams) {
    if (isBuildingDebug || isHotBuildingSwift) {
        if (!isBuildingDebug) {
            if (awaitingHotRebuildSwift.filter((x) => x.target == params.target).length == 0) {
                print(`👉 Delay Swift hot rebuild call`, LogLevel.Verbose)
                awaitingHotRebuildSwift.push(params)
            }
        }
        return
    }
    const measure = new TimeMeasure()
    const abortHandler = stream.setAbortBuildingDebugHandler(() => {
        measure.finish()
        status('circle-slash', `Aborted Hot Rebuilt Swift after ${measure.time}ms`, StatusType.Success)
        print(`🚫 Aborted Hot Rebuilt Swift after ${measure.time}ms`)
        console.log(`Aborted Hot Rebuilt Swift after ${measure.time}ms`)
        stream.setBuildingDebug(false)
        stream.setHotBuildingSwift(false)
        sidebarTreeView?.refresh()
    })
    stream.setBuildingDebug(true)
    stream.setHotBuildingSwift(true)
    sidebarTreeView?.cleanupErrors()
    sidebarTreeView?.refresh()
    print('🔥 Hot Rebuilding Swift', LogLevel.Detailed)
    try {
        
        measure.finish()
        if (abortHandler.isCancelled) return
        status('flame', `Hot Rebuilt Swift in ${measure.time}ms`, StatusType.Success)
        print(`🔥 Hot Rebuilt Swift in ${measure.time}ms`)
        console.log(`Hot Rebuilt Swift in ${measure.time}ms`)
        stream.setBuildingDebug(false)
        stream.setHotBuildingSwift(false)
        sidebarTreeView?.refresh()
        const awaitingParams = awaitingHotRebuildSwift.pop()
        if (awaitingParams) {
            print(`👉 Passing to delayed Swift hot rebuild call`, LogLevel.Verbose)
            hotRebuildSwift(stream, awaitingParams)
        }
    } catch (error) {
        awaitingHotRebuildSwift = []
        stream.setBuildingDebug(false)
        stream.setHotBuildingSwift(false)
        sidebarTreeView?.refresh()
        const text = `Hot Rebuild Swift Failed`
        if (isString(error)) {
            print(`🧯 ${error}`)
        } else {
            const json = JSON.stringify(error)
            const errorText = `${json === '{}' ? error : json}`
            print(`🧯 ${text}: ${errorText}`)
            console.error(error)
        }
        status('error', `${text} (${measure.time}ms)`, StatusType.Error)
    }
}