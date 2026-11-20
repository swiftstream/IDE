import * as fs from 'fs'
import * as path from 'path'
import { SwiftBuildType } from '../../../../swift'
import { projectDirectory } from '../../../../extension'
import { buildDevFolder, buildProdFolder, serviceWorkerTargetName } from '../../../../streams/web/webStream'
import {
    copyServiceImages,
    getServiceImagesPaths,
    runWebResourceTransportSequence,
    serviceImagesDirectoryName
} from '../../serviceResourcePackaging'
import { print } from '../../../../streams/stream'
import { LogLevel } from '../../../../streams/stream'
import { TimeMeasure } from '../../../../helpers/timeMeasureHelper'
import { AbortHandler } from '../../../../bash'

export function proceedBundledResources(options: {
    release: boolean,
    abortHandler: AbortHandler
}) {
    const buildFolder = `${projectDirectory}/.build/.${SwiftBuildType.Wasi}/${options.release ? 'release' : 'debug'}`
    const outputFolder = options.release ? buildProdFolder : buildDevFolder
    const destPath = `${projectDirectory}/${outputFolder}`
    if (!fs.existsSync(buildFolder)) throw `Unable to copy bundled resources, seems swift project hasn't been built`
    const measure = new TimeMeasure()
    const disposition = runWebResourceTransportSequence({
        transportBundledResources: () => {
            const items = fs.readdirSync(buildFolder)
            const resourceFolders = items.filter((x) => x.endsWith('.resources') && !x.startsWith('JavaScriptKit_JavaScriptKit'))
            print(`📄 Processing bundle resources`, LogLevel.Detailed)
            for (let f = 0; f < resourceFolders.length; f++) {
                const folder = resourceFolders[f]
                const baseDirPath = `${buildFolder}/${folder}`
                // NOTE: Rewritten from cpFileSync because of EACCESS issue with folders, cause it is copying folder permissions as well
                function proceedFolder(dirPath: string) {
                    const relativePath = dirPath.slice(baseDirPath.length)
                    const newDestPath = path.join(destPath, relativePath)
                    if (!fs.existsSync(newDestPath))
                        fs.mkdirSync(newDestPath, { recursive: true })
                    const items = fs.readdirSync(dirPath)
                    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
                        const item = items[itemIndex]
                        const fromFile = `${dirPath}/${item}`
                        const isFolder = fs.statSync(fromFile).isDirectory()
                        if (isFolder) {
                            proceedFolder(fromFile)
                        } else {
                            // skip .map files for production
                            if (options.release && fromFile.endsWith('.map'))
                                continue
                            const toFile = `${newDestPath}/${item}`
                            print(`📑 Copy file ${folder.replace('.resources', '')}/${item} → ${outputFolder}/${item}`, LogLevel.Verbose)
                            if (fs.existsSync(toFile))
                                print('🚨 `/' + item + '` file has been overwritten', LogLevel.Detailed)
                            let data: Buffer | undefined
                            try {
                                data = fs.readFileSync(fromFile)
                            } catch (error) {
                                print(`🚨 fs.openSync(${fromFile}) failed: ${error}`, LogLevel.Detailed)
                            }
                            if (data) {
                                try {
                                    fs.writeFileSync(toFile, data)
                                } catch (error) {
                                    print(`🚨 fs.writeFileSync(${toFile}) failed: ${error}`, LogLevel.Detailed)
                                }
                                try {
                                    fs.rmSync(fromFile)
                                    print(`🧹 Cleaned up file ${folder.replace('.resources', '')}/${item}`, LogLevel.Verbose)
                                } catch (error) {
                                    print(`🚨 fs.rmSync(${fromFile}) failed: ${error}`, LogLevel.Detailed)
                                }
                            } else {
                                print(`🚨 Skipping ${toFile}: since it is empty`, LogLevel.Detailed)
                            }
                        }
                    }
                }
                proceedFolder(baseDirPath)
            }
        },
        isCancelled: () => options.abortHandler.isCancelled,
        transportServiceImages: () => {
            const imagePaths = getServiceImagesPaths(
                projectDirectory!,
                serviceWorkerTargetName,
                outputFolder
            )
            const result = copyServiceImages(
                imagePaths.sourceDirectory,
                imagePaths.destinationDirectory
            )
            for (const copiedFile of result.copiedFiles) {
                const publicPath = serviceImagesDirectoryName + '/' + copiedFile.relativePath
                print(`📑 Copy Service image ${copiedFile.relativePath} → ${outputFolder}/${publicPath}`, LogLevel.Verbose)
                if (copiedFile.overwritten)
                    print('🚨 `/' + publicPath + '` file has been overwritten', LogLevel.Detailed)
            }
            for (const skippedEntry of result.skippedEntries)
                print(`⏭️ Skipping Service image entry ${skippedEntry}`, LogLevel.Verbose)
        }
    })
    if (disposition === 'cancelled') return
    measure.finish()
    print(`📄 Processed bundle resources in ${measure.fulltime}`, LogLevel.Detailed)
}