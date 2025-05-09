import * as fs from 'fs'
import { currentStream, embeddedStream, ExtensionStream, extensionStream, projectDirectory } from '../extension'
import { buildDevFolder as buildDevWebFolder } from '../streams/web/webStream'
import { isClearedCache, isClearingCache } from '../streams/stream'
import { print, status, StatusType } from '../streams/stream'
import { isBuildingDebug, LogLevel } from '../streams/stream'
import { TimeMeasure } from '../helpers/timeMeasureHelper'
import { createSymlinkFoldersIfNeeded } from '../swift'
import { window } from 'vscode'
import { EmbeddedStreamConfig } from '../embeddedStreamConfig'

enum ClearCacheOption {
	Build = `Project Build Cache`,
	SwiftPM = 'Swift Package Manager Cache',
	Foundation = 'Foundation URL Cache',
	Everything = 'Everything'
}

export async function clearCachesCommand() {
	if (isBuildingDebug) return
	if (isClearingCache || isClearedCache) return
	currentStream?.setClearingCache()
	const selectedItem = await window.showQuickPick(Object.values(ClearCacheOption), {
		placeHolder: `Choose which cache to clear`
	})
	if (!selectedItem) {
		currentStream?.setClearingCache(false)
		return
	}
	await new Promise((x) => setTimeout(x, 100))
	const swiftURLCache = `/root/.cache/org.swift.foundation.URLCache`
	const swiftPMCache = `/root/.cache/org.swift.swiftpm`
	print(`🧹 Clearing Cache`, LogLevel.Detailed)
	function removeBuildCacheFolder() {
		let buildCacheFolders = [`${projectDirectory}/.build`]
		if (extensionStream === ExtensionStream.Embedded && embeddedStream) {
			const bf = embeddedStream.selectedScheme()?.buildFolder ?? 'build'
			buildCacheFolders.push(`${projectDirectory}/${bf}`)
		}
		for (let i = 0; i < buildCacheFolders.length; i++) {
			const folder = buildCacheFolders[i];
			if (fs.existsSync(folder)) {
				for (const entry of fs.readdirSync(folder)) {
					const entryPath = `${folder}/${entry}`
					fs.rmSync(entryPath, { recursive: true, force: true })
				}
			}
		}
		switch (extensionStream) {
			case ExtensionStream.Web:
				const buildDevWebFolderPath = `${projectDirectory}/${buildDevWebFolder}`
				if (fs.existsSync(buildDevWebFolderPath))
					fs.rmSync(buildDevWebFolderPath, { recursive: true, force: true })
				break
			default: break
		}
	}
	const measure = new TimeMeasure()
	switch (selectedItem) {
		case ClearCacheOption.Build:
			removeBuildCacheFolder()
			break
		case ClearCacheOption.SwiftPM:
			if (fs.existsSync(swiftPMCache))
				fs.rmSync(swiftPMCache, { recursive: true, force: true })
			break
		case ClearCacheOption.Foundation:
			if (fs.existsSync(swiftURLCache))
				fs.rmSync(swiftURLCache, { recursive: true, force: true })
			break
		case ClearCacheOption.Everything:
			if (fs.existsSync(swiftURLCache))
				fs.rmSync(swiftURLCache, { recursive: true, force: true })
			if (fs.existsSync(swiftPMCache))
				fs.rmSync(swiftPMCache, { recursive: true, force: true })
			removeBuildCacheFolder()
			break
		default: break
	}
	createSymlinkFoldersIfNeeded()
	measure.finish()
	if (measure.time < 1000) {
		await new Promise((x) => setTimeout(x, 1000))
	}
	currentStream?.setClearingCache(false)
	currentStream?.setClearedCache()
	status('check', `Cleared Cache in ${measure.time}ms`, StatusType.Success)
	print(`🧹 Cleared Cache in ${measure.time}ms`, LogLevel.Detailed)
	await new Promise((x) => setTimeout(x, 1000))
	currentStream?.setClearedCache(false)
}