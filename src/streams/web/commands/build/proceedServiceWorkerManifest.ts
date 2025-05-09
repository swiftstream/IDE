import * as fs from 'fs'
import JSON5 from 'json5'
import { buildDevFolder, buildProdFolder, serviceWorkerTargetName, webSourcesFolder } from '../../../../streams/web/webStream'
import { print } from '../../../../streams/stream'
import { LogLevel } from '../../../../streams/stream'
import { projectDirectory, currentStream } from '../../../../extension'
import { TimeMeasure } from '../../../../helpers/timeMeasureHelper'
import { AbortHandler } from '../../../../bash'

export async function proceedServiceWorkerManifest(options: {
    isPWA: boolean,
    release: boolean,
    abortHandler: AbortHandler
}): Promise<any> {
    if (!currentStream) throw `webStream is null`
    if (!options.isPWA) {
        print(`💨 Skipping manifest retrieval since it is not PWA app`, LogLevel.Verbose)
        return
    }
    const timeMeasure = new TimeMeasure()
    print(`📜 Getting service worker manifest`, LogLevel.Detailed)
    let generatedManifest = await currentStream.swift.grabPWAManifest({
        serviceWorkerTarget: serviceWorkerTargetName,
        abortHandler: options.abortHandler
    })
    if (options.abortHandler.isCancelled) return
    const webManifestFileName = generatedManifest.file_name ?? 'site'
    const staticManifest = getStaticManifest(webManifestFileName)
    if (staticManifest) {
        // override generated manifest data with the static one
        generatedManifest = {...generatedManifest, ...staticManifest}
    }
    const outputDir = `${projectDirectory}/${options.release ? buildProdFolder : buildDevFolder}`
    const pathToSaveManifest = `${outputDir}/${webManifestFileName}.webmanifest`
    if (!fs.existsSync(outputDir))
        fs.mkdirSync(outputDir, { recursive: true })
    fs.writeFileSync(pathToSaveManifest, JSON.stringify(generatedManifest, null, '\t'))
    timeMeasure.finish()
    print(`📜 Got manifest in ${timeMeasure.time}ms`, LogLevel.Detailed)
    return generatedManifest
}
function getStaticManifest(fileName: string): any | undefined {
    if (!fs.existsSync(`${projectDirectory}/${webSourcesFolder}/${fileName}.webmanifest`))
        return undefined
    try {
        return JSON5.parse(fs.readFileSync(`${projectDirectory}/${webSourcesFolder}/${fileName}.webmanifest`, 'utf8'))
    } catch (error) {
        console.dir({parseStaticManifestError:error})
        return undefined
    }
}