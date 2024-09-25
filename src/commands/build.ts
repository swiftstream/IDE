import { sidebarTreeView, webber } from "../extension"
import { appTargetName, buildStatus, clearStatus, isBuilding, LogLevel, print, serviceWorkerTargetName, setBuilding, status, StatusType } from "../webber"
import { window } from 'vscode'
import { isString } from '../helpers/isString'
import { TimeMeasure } from '../helpers/timeMeasureHelper'
import { resolveSwiftDependencies } from './build/resolveSwiftDependencies'
import { allSwiftBuildTypes } from '../swift'
import { checkRequiredDependencies } from './build/requiredDependencies'
import { buildExecutableTarget } from './build/buildExecutableTargets'
import { buildJavaScriptKit } from './build/buildJavaScriptKit'
import { buildWebSources } from './build/buildWebSources'
import { proceedServiceWorkerManifest } from './build/proceedServiceWorkerManifest'
import { proceedBundledResources } from "./build/proceedBundledResources"
import { proceedSCSS } from "./build/proceedSCSS"

export async function buildCommand() {
	if (!webber) return
	if (isBuilding) return
	setBuilding(true)
	sidebarTreeView?.refresh()
	const measure = new TimeMeasure()
	try {
		print(`🏗️ Started building debug`, LogLevel.Normal, true)
		print(`💁‍♂️ it will try to build each phase`, LogLevel.Detailed)
		// Phase 1: Resolve Swift dependencies for each build type
		const types = allSwiftBuildTypes()
		for (let i = 0; i < types.length; i++) {
			const type = types[i]
			await resolveSwiftDependencies({
				type: type,
				force: true,
				substatus: (t) => {
					buildStatus(`Resolving dependencies (${type}): ${t}`)
					print(`🔦 Resolving Swift dependencies ${t}`, LogLevel.Detailed)
				}
			})
		}
		// Phase 2: Check if required Swift dependencies present
		const requiredDependencies = await checkRequiredDependencies()
		if (requiredDependencies.missing.length > 0) {
			clearStatus()
			const text = `Missing ${requiredDependencies.missing.map((x) => `\`${x}\``).join(', ')} package${requiredDependencies.missing.length > 1 ? 's' : ''}`
			print(`🙆‍♂️ ${text}`)
			const result = await window.showErrorMessage(text, 'Retry', 'Cancel')
			if (result == 'Retry') {
				print(`Going to retry debug build command`, LogLevel.Verbose)
				buildCommand()
			}
			return
		}
		// Phase 3: Retrieve executable Swift targets
		const targetsDump = await webber.swift.getTargets()
		if (targetsDump.executables.length == 0)
			throw `No targets to build`
		const isPWA = targetsDump.serviceWorkers.length > 0
		if (isPWA) {
			print(`It is PWA since ServiceWorker related targets found`, LogLevel.Verbose)
		} else {
			print(`It's not PWA since ServiceWorker related targets not found`, LogLevel.Verbose)
		}
		// Phase 4: Check that App target name present
		if (!targetsDump.executables.includes(appTargetName))
			throw `${appTargetName} is missing in the Package.swift`
		if (isPWA && !targetsDump.serviceWorkers.includes(serviceWorkerTargetName))
			throw `${serviceWorkerTargetName} is missing in the Package.swift`
		// Phase 5: Build executable targets
		const buildTypes = allSwiftBuildTypes()
		for (let n = 0; n < buildTypes.length; n++) {
			const type = buildTypes[n]
			for (let i = 0; i < targetsDump.executables.length; i++) {
				const target = targetsDump.executables[i]
				await buildExecutableTarget({
					type: type,
					target: target,
					release: false,
					force: true
				})	
			}
		}
		// Phase 6: Build JavaScriptKit TypeScript sources
		buildJavaScriptKit({
			force: true
		})
		// Run phases 7, 8, 9 in parallel
		await Promise.all([
			// Phase 7: Build all the web sources
			Promise.all(targetsDump.executables.map(async (target) => {
				await buildWebSources({
					target: target,
					isServiceWorker: !(target === appTargetName),
					release: false,
					force: true
				})
			})),
			// Phase 8: Retrieve manifest from the Service target
			proceedServiceWorkerManifest({ isPWA: isPWA, release: false }),
			// Phase 9: Copy bundled resources from Swift build folder
			proceedBundledResources({ release: false })
		])
		// Phase 10: Compile SCSS
		await proceedSCSS({ force: true, release: false })
		measure.finish()
		status('check', `Build Succeeded in ${measure.time}ms`, StatusType.Success)
		print(`✅ Build Succeeded in ${measure.time}ms`)
		console.log(`Build Succeeded in ${measure.time}ms`)
		setBuilding(false)
		sidebarTreeView?.refresh()
	} catch (error: any) {
		setBuilding(false)
		sidebarTreeView?.refresh()
		var text = ''
		if (isString(error)) {
			text = error
			print(`❌ ${text}`)
		} else {
			text = `Something went wrong during the build`
			print(`❌ ${text}: ${error}`)
			console.error(error)
		}
		status('error', `Something went wrong during the build (${measure.time}ms)`, StatusType.Error)
	}
}