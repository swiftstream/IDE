import { currentStream, sidebarTreeView } from '../extension'
import { buildStatus, isUpdatingPackages, LogLevel, print, status, StatusType } from '../streams/stream'
import { updateSwiftDependencies } from './build/updateSwiftDependencies'
import { TimeMeasure } from '../helpers/timeMeasureHelper'
import { restartLSPCommand } from './restartLSP'

export async function updatePackagesCommand() {
    if (isUpdatingPackages) return
    const measure = new TimeMeasure()
    const abortHandler = currentStream?.setAbortBuildingDebugHandler(() => {
        measure.finish()
        status('circle-slash', `Aborted Updating Packages after ${measure.fulltime}`, StatusType.Default)
        print(`🚫 Aborted Updating Packages after ${measure.fulltime}`)
        console.log(`Aborted Updating Packages after ${measure.fulltime}`)
        sidebarTreeView?.refresh()
    })
    if (!abortHandler) return
    currentStream?.setUpdatingPackages()
    await updateSwiftDependencies({
        force: true,
        substatus: (t) => {
            buildStatus(`Updating dependencies: ${t}`)
            print(`🔦 Updating Swift dependencies ${t}`, LogLevel.Verbose)
        },
        abortHandler: abortHandler
    })
    status('check', `Updated Packages in ${measure.fulltime}`, StatusType.Success)
    await new Promise((x) => setTimeout(x, 1000))
    currentStream?.setUpdatingPackages(false)
    restartLSPCommand()
}