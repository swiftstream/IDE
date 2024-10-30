import * as fs from 'fs'
import { SwiftBuildType } from '../../swift'
import { projectDirectory } from '../../extension'
import { buildDevFolder, buildProdFolder, LogLevel, print } from '../../webber'
import { TimeMeasure } from '../../helpers/timeMeasureHelper'

export function proceedBundledResources(options: { release: boolean }) {
    const buildFolder = `${projectDirectory}/.build/.${SwiftBuildType.Wasi}/${options.release ? 'release' : 'debug'}`
    const destPath = `${projectDirectory}/${options.release ? buildProdFolder : buildDevFolder}`
    if (!fs.existsSync(buildFolder)) throw `Unable to copy bundled resources, seems swift project hasn't been built`
    const measure = new TimeMeasure()
    const items = fs.readdirSync(buildFolder)
    const resourceFolders = items.filter((x) => x.endsWith('.resources') && !x.startsWith('JavaScriptKit_JavaScriptKit'))
    print(`📄 Processing bundle resources`, LogLevel.Detailed)
    for (let f = 0; f < resourceFolders.length; f++) {
        const folder = resourceFolders[f]
        const dirPath = `${buildFolder}/${folder}`
        const items = fs.readdirSync(dirPath)
        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            const item = items[itemIndex]
            const fromFile = `${dirPath}/${item}`
            // skip .map files for production
            if (options.release && fromFile.endsWith('.map'))
                continue
            const isFolder = fs.statSync(fromFile).isDirectory()
            const toFile = `${destPath}/${item}`
            print(`📑 Copy ${isFolder ? 'folder' : 'file'} ${folder.replace('.resources', '')}/${item} → ${options.release ? buildProdFolder : buildDevFolder}/${item}`, LogLevel.Verbose)
            if (fs.existsSync(toFile))
                print(`🚨 \`/${item}\` ${isFolder ? 'folder' : 'file'} has been overwritten`, LogLevel.Detailed)
            fs.cpSync(fromFile, toFile, { recursive: true, force: true })
            try {
                if (isFolder) fs.rmSync(fromFile, { recursive: true, force: true })
                else fs.rmSync(fromFile)
            } catch {}
        }
    }
    measure.finish()
    print(`📄 Processed bundle resources in ${measure.time}ms`, LogLevel.Detailed)
}