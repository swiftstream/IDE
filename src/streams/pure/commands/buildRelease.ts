import { resolveSwiftDependencies } from '../../../commands/build/resolveSwiftDependencies'
import { sidebarTreeView } from '../../../extension'
import { TimeMeasure } from '../../../helpers/timeMeasureHelper'
import { buildStatus, isBuildingRelease, LogLevel, print, status, StatusType } from '../../stream'
import { PureBuildMode, PureStream } from '../pureStream'
import { buildExecutableTarget } from './build/buildExecutableTarget'
import { isString } from '../../../helpers/isString'

export async function buildRelease(stream: PureStream, buildMode: PureBuildMode, successCallback?: any) {
    if (isBuildingRelease) { return }
    const measure = new TimeMeasure()
    const abortHandler = stream.setAbortBuildingReleaseHandler(() => {
        measure.finish()
        status('circle-slash', `Aborted Release Build after ${measure.fulltime}`, StatusType.Default)
        print(`🚫 Aborted Release Build after ${measure.fulltime}`)
        console.log(`Aborted Release Build after ${measure.fulltime}`)
        stream.setBuildingRelease(false)
        sidebarTreeView?.refresh()
    })
    stream.setBuildingRelease(true)
    sidebarTreeView?.cleanupErrors()
    sidebarTreeView?.refresh()
    try {
        print({
            normal: `🏗️ Started building release`,
            detailed: `🏗️ Started building release for ${buildMode}`
        }, LogLevel.Normal, true)
        // Phase 1: Resolve Swift dependencies for each build type
        print('🔳 Phase 1: Resolve Swift dependencies for each build type', LogLevel.Verbose)
        await resolveSwiftDependencies({
            force: true,
            substatus: (t) => {
                buildStatus(`Resolving dependencies: ${t}`)
                print(`🔦 Resolving Swift dependencies ${t}`, LogLevel.Verbose)
            },
            abortHandler: abortHandler
        })
        // Phase 2: Retrieve Swift targets
        print('🔳 Phase 2: Retrieve Swift targets', LogLevel.Verbose)
        await stream.chooseTarget({ release: true, abortHandler: abortHandler })
        if (!stream.swift.selectedReleaseTarget) 
            throw `Please select Swift target to build`
        // Phase 3: Build executable targets
        print('🔳 Phase 3: Build executable targets', LogLevel.Verbose)
        await buildExecutableTarget({
            target: stream.swift.selectedReleaseTarget,
            mode: buildMode,
            release: true,
            force: true,
            abortHandler: abortHandler
        })
        measure.finish()
        if (abortHandler.isCancelled) return
        status('check', `Release Build Succeeded in ${measure.fulltime}`, StatusType.Success)
        print(`✅ Release Build Succeeded in ${measure.fulltime}`)
        console.log(`Release Build Succeeded in ${measure.fulltime}`)
        stream.setBuildingRelease(false)
        sidebarTreeView?.refresh()
        if (successCallback) successCallback()
    } catch (error: any) {
        stream.setBuildingRelease(false)
        sidebarTreeView?.refresh()
        const text = `Release Build Failed`
        if (isString(error)) {
            print(`🧯 ${error}`)
        } else {
            const json = JSON.stringify(error)
            const errorText = `${json === '{}' ? error : json}`
            print(`🧯 ${text}: ${errorText}`)
            console.error(error)
        }
        status('error', `${text} (${measure.fulltime})`, StatusType.Error)
    }
}