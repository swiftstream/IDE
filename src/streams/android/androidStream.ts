import * as fs from 'fs'
import * as path from 'path'
import { env } from 'process'
import { commands, ConfigurationChangeEvent, FileDeleteEvent, FileRenameEvent, TextDocument, window } from 'vscode'
import { isBuildingDebug, LogLevel, print, Stream } from '../stream'
import { Dependency, SideTreeItem } from '../../sidebarTreeView'
import { extensionContext, isInContainer, projectDirectory, sidebarTreeView } from '../../extension'
import { pathToCompiledBinary, Swift, SwiftBuildMode } from '../../swift'
import { buildCommand, hotRebuildSwift } from './commands/build'
import { ReadElf } from '../../readelf'
import { AbortHandler } from '../../bash'
import { AndroidStreamConfig, chooseScheme, PackageMode, Scheme, SchemeBuildConfiguration } from '../../androidStreamConfig'
import { Gradle } from '../../gradle'
import { GradleFolder } from '../../enums/GradleFolder'
import { AndroidLibraryProject } from '../../androidLibraryProject'
import { DevContainerConfig } from '../../devContainerConfig'
import { AndroidAppProject } from '../../androidAppProject'

export class AndroidStream extends Stream {
    readelf: ReadElf
    gradleLibrary: Gradle
    gradleApp: Gradle

    isAutoInstallEnabled = false
    isAutoRunEnabled = false
    isGeneratingLibProject = false
    isGeneratingAppProject = false
    isJNILogsEnabled = false

    constructor(overrideConfigure: boolean = false) {
        super(true)
        this.readelf = new ReadElf(this)
        this.gradleLibrary = new Gradle(this, GradleFolder.Library)
        this.gradleApp = new Gradle(this, GradleFolder.Application)
        if (!overrideConfigure) this.configure()
    }

    currentBuildArch?: DroidBuildArch

    configure() {
        super.configure()
    }

    async onDidChangeConfiguration(event: ConfigurationChangeEvent) {
        super.onDidChangeConfiguration(event)

    }

    isDebugBuilt(options: {
        target: string,
        arch: DroidBuildArch,
        androidSDKCompileVersion: string
    }): boolean {
        return fs.existsSync(pathToCompiledBinary({
            target: options.target,
            mode: droidBuildArchToSwiftBuildMode(options.arch),
            release: false,
            androidSDKCompileVersion: options.androidSDKCompileVersion
        }))
    }
    
    isReleaseBuilt(options: {
        target: string,
        arch: DroidBuildArch,
        androidSDKCompileVersion: string
    }): boolean {
        return fs.existsSync(pathToCompiledBinary({
            target: options.target,
            mode: droidBuildArchToSwiftBuildMode(options.arch),
            release: true,
            androidSDKCompileVersion: options.androidSDKCompileVersion
        }))
    }

    registerCommands() {
        super.registerCommands()
        extensionContext.subscriptions.push(commands.registerCommand(this.schemeElement().id, async () => await this.chooseScheme({}) ))
        const types = [GradleFolder.Application, GradleFolder.Library]
        const configurations = [SchemeBuildConfiguration.Debug, SchemeBuildConfiguration.Release]
        for (let t = 0; t < types.length; t++) {
            const type = types[t]
            extensionContext.subscriptions.push(commands.registerCommand(this.generateProjectElement({ type: type }).id, async () => await this.generateGradleProject({ type: type }) ))
            extensionContext.subscriptions.push(commands.registerCommand(this.generateGradleWrapperElement({ type: type }).id, async () => await this.prepareGradleW({ type: type }) ))
            extensionContext.subscriptions.push(commands.registerCommand(this.gradleWAssembleElement({ type: type }).id, async () => await this.gradleWAssemble({ type: type }) ))
            extensionContext.subscriptions.push(commands.registerCommand(this.jniLogsElement().id, async () => await this.switchJNILogs() ))
            for (let c = 0; c < configurations.length; c++) {
                const configuration = configurations[c]
                
            }
        }
    }

    schemeElement = () => {
        const scheme = AndroidStreamConfig.selectedScheme({ projectPath: projectDirectory! })
        const isDebug = scheme?.buildConfiguration === SchemeBuildConfiguration.Debug
        let details = ''
        if (scheme?.buildConfiguration) {
            details = isDebug ? 'Debug' : 'Release'
        }
        return new Dependency({
            id: SideTreeItem.AndroidTarget,
            label: scheme?.title ?? 'Scheme',
            version: isDebug ? scheme?.title.toLowerCase().includes('debug') === true ? '' : details : scheme?.title.toLowerCase().includes('release') === true ? '' : details,
            tooltip: `${scheme ? scheme.buildConfiguration == SchemeBuildConfiguration.Debug ? 'Debug ' : 'Release ' : ''}Scheme for Build and Run actions`,
            icon: scheme ? scheme.buildConfiguration == SchemeBuildConfiguration.Debug ? 'target::charts.orange' : 'target::charts.green' : 'target'
        })
    }
    generateProjectElement = (options: { type: GradleFolder }) => new Dependency({
        id: options.type === GradleFolder.Library ? SideTreeItem.GradleLibGenerate : SideTreeItem.GradleAppGenerate,
        label: (options.type === GradleFolder.Library ? this.isGeneratingLibProject : this.isGeneratingAppProject) ? 'Generating Project' : 'Generate Project',
        version: '',
        icon: (options.type === GradleFolder.Library ? this.isGeneratingLibProject : this.isGeneratingAppProject) ? 'sync~spin::charts.green' : sidebarTreeView?.fileIcon('hammer')
    })
    generateGradleWrapperElement = (options: { type: GradleFolder }) => new Dependency({
        id: options.type === GradleFolder.Library ? SideTreeItem.GradleLibGenerateGradleW : SideTreeItem.GradleAppGenerateGradleW,
        label: this.gradle(options.type).isGeneratingWrapper ? 'Making Gradle Wrapper' : 'Make Gradle Wrapper',
        version: '',
        icon: this.gradle(options.type).isGeneratingWrapper ? 'sync~spin::charts.green' : sidebarTreeView?.fileIcon('hammer')
    })
    gradleWAssembleElement = (options: { type: GradleFolder }) => new Dependency({
        id: options.type === GradleFolder.Library
            ? SideTreeItem.GradleWLibAssemble
            : SideTreeItem.GradleWAppAssemble,
        label: this.gradle(options.type).wrapper.isAssembling ? 'Assembling' : 'Assemble',
        version: `${this.selectedScheme()?.buildConfiguration ?? ''}`,
        icon: this.gradle(options.type).wrapper.isAssembling ? 'sync~spin::charts.green' : sidebarTreeView?.fileIcon('hammer')
    })
    jniLogsElement = () => new Dependency({
        id: SideTreeItem.JNILogs,
        label: 'JNI logs',
        version: this.isJNILogsEnabled ? 'Enabled' : 'Disabled',
        icon: this.isJNILogsEnabled ? 'pass::charts.green' : 'circle-large-outline'
    })

    onDidRenameFiles(event: FileRenameEvent) {
        super.onDidRenameFiles(event)

    }

    onDidDeleteFiles(event: FileDeleteEvent) {
        super.onDidDeleteFiles(event)
        for (let f = 0; f < event.files.length; f++) {
            const path = event.files[f]
            if (path.path === this.gradleApp.cwd) {
                sidebarTreeView?.refresh()
            } else if (path.path === this.gradleApp.wrapper.cwd) {
                sidebarTreeView?.refresh()
            } else if (path.path === this.gradleLibrary.cwd) {
                sidebarTreeView?.refresh()
            } else if (path.path === this.gradleLibrary.wrapper.cwd) {
                sidebarTreeView?.refresh()
            }
        }
    }
        
    async onDidSaveTextDocument(document: TextDocument): Promise<boolean> {
		if (await super.onDidSaveTextDocument(document)) return true
		if (!isInContainer) return false

        return false
    }
    
    // MARK: Global Keybinding

    async globalKeyRun() {
        window.showErrorMessage(`Run key binding not assigned`)
    }

    // MARK: Gradle

    async generateGradleProject(options: {
        type: GradleFolder,
        targets?: string[],
        abortHandler?: AbortHandler
    }): Promise<boolean> {
        switch (options.type) {
            case GradleFolder.Application:
                if (this.isGeneratingAppProject) {
                    options.abortHandler?.abort()
                    return false
                }
                this.isGeneratingAppProject = true
                sidebarTreeView?.refresh()
                break
            case GradleFolder.Library:
                if (this.isGeneratingLibProject) {
                    options.abortHandler?.abort()
                    return false
                }
                this.isGeneratingLibProject = true
                sidebarTreeView?.refresh()
                break
            default:
                options.abortHandler?.abort()
                return false
        }
        const swiftVersion = DevContainerConfig.swiftVersion()
        const swiftVersionString = `${swiftVersion.major}.${swiftVersion.minor}.${swiftVersion.patch}`
        const targets = options.targets ?? await this.swift.getLibraryProducts({
            fresh: true,
            abortHandler: options.abortHandler
        })
        if (targets.length === 0) {
            window.showErrorMessage(`Unable to find products with type == library in the Package.swift`)
            options.abortHandler?.abort()
            return false
        }
        const streamConfig = new AndroidStreamConfig({ projectPath: projectDirectory! })
        switch (options.type) {
            case GradleFolder.Application:
                AndroidAppProject.generateIfNeeded({
                    projectPath: projectDirectory!,
                    package: streamConfig.config.packageName,
                    name: streamConfig.config.name,
                    targets: targets,
                    compileSdk: streamConfig.config.compileSDK,
                    minSdk: streamConfig.config.minSDK,
                    javaVersion: streamConfig.config.javaVersion,
                    swiftVersion: swiftVersionString
                })
                this.isGeneratingAppProject = false
                sidebarTreeView?.refresh()
                return true
            case GradleFolder.Library:
                AndroidLibraryProject.generateIfNeeded({
                    projectPath: projectDirectory!,
                    package: streamConfig.config.packageName,
                    name: streamConfig.config.name,
                    targets: targets,
                    compileSdk: streamConfig.config.compileSDK,
                    minSdk: streamConfig.config.minSDK,
                    javaVersion: streamConfig.config.javaVersion,
                    swiftVersion: swiftVersionString,
                    isApp: streamConfig.config.packageMode == PackageMode.App
                })
                this.isGeneratingLibProject = false
                sidebarTreeView?.refresh()
                return true
            default:
                window.showErrorMessage(`generateGradleProject was called for unknown type: ${options.type}`)
                options.abortHandler?.abort()
                return false
        }
    }

    async prepareGradleW(options: {
        type: GradleFolder,
        wrapIntoTask?: boolean,
        abortHandler?: AbortHandler
    }) {
        await this.gradle(options.type).generateWrapper({ reveal: true, wrapIntoTask: options.wrapIntoTask })
    }
    
    // MARK: GradleW

    async gradleWAssemble(options: {
        type: GradleFolder,
        abortHandler?: AbortHandler
    }) {
        let configuration = this.selectedScheme()?.buildConfiguration
        if (!configuration) {
            configuration = (await this.getSelectedSchemeOrChoose({}))?.buildConfiguration
        }
        if (!configuration) return
        await this.gradle(options.type).wrapper.assemble({ configuration: configuration })
    }

    async switchJNILogs() {
        this.isJNILogsEnabled = !this.isJNILogsEnabled
        sidebarTreeView?.refresh()
    }

    // MARK: Scheme

    async chooseScheme(options: {
        abortHandler?: AbortHandler
    }): Promise<Scheme | undefined> {
        const scheme = await chooseScheme({
            projectPath: projectDirectory!,
            stream: this,
            abortHandler: options.abortHandler
        })
        if (!scheme) return undefined
        AndroidStreamConfig.transaction({
            projectPath: projectDirectory!,
            process: x => {
                x.setSelectedScheme(scheme)
            }
        })
        sidebarTreeView?.refresh()
    }

    selectedScheme = (): Scheme | undefined => AndroidStreamConfig.selectedScheme({ projectPath: projectDirectory! })
    
    async getSelectedSchemeOrChoose(options: {
        abortHandler?: AbortHandler
    }): Promise<Scheme | undefined> {
        const selectedScheme = this.selectedScheme()
        if (selectedScheme) return selectedScheme
        return await chooseScheme({
            projectPath: projectDirectory!,
            stream: this,
            abortHandler: options.abortHandler
        })
    }

    // MARK: Building

    async buildDebug() {
		await super.buildDebug()
        const scheme = await this.getSelectedSchemeOrChoose({})
        if (!scheme) return
        await buildCommand(this, scheme)
    }

    async hotRebuildSwift(params?: { target?: string }) {
        hotRebuildSwift(this, {
            target: params?.target
        })
    }

    async buildRelease(successCallback?: any) {
        await super.buildRelease()
        print('stream.buildRelease not implemented', LogLevel.Detailed)
    }

    // MARK: Side Bar Tree View Items

    async defaultDebugActionItems(): Promise<Dependency[]> {
		let items = await super.defaultDebugActionItems()
        items.push(this.schemeElement())
        return items
	}
    async debugActionItems(): Promise<Dependency[]> {
        let items = await super.debugActionItems()
        const packageMode = AndroidStreamConfig.packageMode({ projectPath: projectDirectory! })
        if (packageMode === PackageMode.App) {
            items.push(new Dependency({
                id: SideTreeItem.ADBDevice,
                label: 'Device',
                version: 'Not selected',
                icon: 'device-mobile'
            }))
        }
        items.push(new Dependency({
            id: SideTreeItem.BuildDebug,
            tooltip: 'Cmd+B or Ctrl+B',
            label: isBuildingDebug || this.isAnyHotBuilding() ? this.isAnyHotBuilding() ? 'Hot Rebuilding' : 'Building' : 'Build',
            icon: isBuildingDebug || this.isAnyHotBuilding() ? this.isAnyHotBuilding() ? 'sync~spin::charts.orange' : 'sync~spin::charts.green' : sidebarTreeView?.fileIcon('hammer')
        }))
        if (packageMode === PackageMode.App) {
            items.push(new Dependency({
                id: SideTreeItem.AndroidAppInstall,
                label: 'Install',
                version: '',
                icon: 'remote'
            }))
            items.push(new Dependency({
                id: SideTreeItem.AndroidAppRun,
                label: 'Run',
                version: '',
                icon: 'run'
            }))
            items.push(new Dependency({
                id: SideTreeItem.AndroidAppInstallAndRun,
                label: 'Install & Run',
                version: '',
                icon: 'run-above'
            }))
        }
        return items
    }
    
    async debugOptionItems(): Promise<Dependency[]> {
        let items = await super.debugOptionItems()
        const packageMode = AndroidStreamConfig.packageMode({ projectPath: projectDirectory! })
        if (packageMode === PackageMode.App) {
            items.push(new Dependency({
                id: SideTreeItem.AutoInstall,
                label: 'Install after build',
                version: this.isAutoInstallEnabled ? 'Enabled' : 'Disabled',
                icon: this.isAutoInstallEnabled ? 'pass::charts.green' : 'circle-large-outline'
            }))
            items.push(new Dependency({
                id: SideTreeItem.AutoRun,
                label: 'Run after install',
                version: this.isAutoRunEnabled ? 'Enabled' : 'Disabled',
                icon: this.isAutoRunEnabled ? 'pass::charts.green' : 'circle-large-outline'
            }))
        }
        items.push(this.jniLogsElement())
        return items
    }
    async releaseItems(): Promise<Dependency[]> { return [] }
    
    gradle = (type: GradleFolder) => type === GradleFolder.Application ? this.gradleApp : this.gradleLibrary

    private async gradleItems(options: { type: GradleFolder }): Promise<Dependency[]> {
        const gradle = this.gradle(options.type)
        let items: Dependency[] = []
        if (!gradle.isFolderExists()) {
            items.push(this.generateProjectElement({ type: options.type }))
        } else if (!gradle.wrapper.isExists()) {
            items.push(this.generateGradleWrapperElement({ type: options.type }))
        } else {
            items.push(this.gradleWAssembleElement({ type: options.type }))
        }
        return items
    }
    
    async androidLibraryItems(): Promise<Dependency[]> {
		let items: Dependency[] = []
		items.push(...(await this.gradleItems({ type: GradleFolder.Library })))
		return items
	}
    async androidAppItems(): Promise<Dependency[]> {
		let items: Dependency[] = []
        const packageMode = AndroidStreamConfig.packageMode({ projectPath: projectDirectory! })
        if (packageMode === PackageMode.App) {
            items.push(...(await this.gradleItems({ type: GradleFolder.Application })))
        }
		return items
	}
    async androidADBItems(): Promise<Dependency[]> {
		let items: Dependency[] = []
        const packageMode = AndroidStreamConfig.packageMode({ projectPath: projectDirectory! })
        if (packageMode !== PackageMode.App) { return items }
        items.push(new Dependency({
            id: SideTreeItem.ADBMode,
            label: 'Mode',
            version: 'Not selected',
            icon: 'arrow-swap'
        }))
        items.push(new Dependency({
            id: SideTreeItem.ADBPairDevice,
            label: 'Pair device',
            version: '',
            icon: 'clippy'
        }))
        items.push(new Dependency({
            id: SideTreeItem.ADBEmulators,
            label: 'Emulators',
            version: '',
            icon: 'server-environment'
        }))
        items.push(new Dependency({
            id: SideTreeItem.ADBDevices,
            label: 'Devices',
            version: '',
            icon: 'device-mobile'
        }))
		return items
	}
    async projectItems(): Promise<Dependency[]> { return [] }
    async maintenanceItems(): Promise<Dependency[]> { return [] }
    async settingsItems(): Promise<Dependency[]> { return [] }
    async isThereAnyRecommendation(): Promise<boolean> { return false }
    async recommendationsItems(): Promise<Dependency[]> { return [] }
    async customItems(element: Dependency): Promise<Dependency[]> { return await super.customItems(element) }
}

export enum DroidBuildArch {
    Arm64 = 'arm64-v8a',
    ArmEabi = 'armeabi-v7a',
    x86_64 = 'x86_64'
}
export function droidBuildArchToSwiftBuildMode(mode: DroidBuildArch): SwiftBuildMode {
    switch (mode) {
        case DroidBuildArch.Arm64:
            return SwiftBuildMode.AndroidArm64
        case DroidBuildArch.ArmEabi:
            return SwiftBuildMode.AndroidArmEabi
        case DroidBuildArch.x86_64:
            return SwiftBuildMode.Androidx86_64
        default:
            return SwiftBuildMode.Standard
    }
}
export function droidBuildArchToSwiftBuildFolder(options: {
    mode: DroidBuildArch,
    compileSDK: string
}): string {
    switch (options.mode) {
        case DroidBuildArch.Arm64:
            return path.join(projectDirectory!, '.build', '.droid', `aarch64-unknown-linux-android${options.compileSDK ?? env.S_SDK_VERSION ?? Swift.defaultAndroidSDK}`)
        case DroidBuildArch.ArmEabi:
            if (DevContainerConfig.checkIfLegacyAndroidSDK()) {
                return path.join(projectDirectory!, '.build', '.droid', `armv7-unknown-linux-androideabi${options.compileSDK ?? env.S_SDK_VERSION ?? Swift.defaultAndroidSDK}`)
            } else {
                return path.join(projectDirectory!, '.build', '.droid', `armv7-unknown-linux-android${options.compileSDK ?? env.S_SDK_VERSION ?? Swift.defaultAndroidSDK}`)
            }
        case DroidBuildArch.x86_64:
            return path.join(projectDirectory!, '.build', '.droid', `x86_64-unknown-linux-android${options.compileSDK ?? env.S_SDK_VERSION ?? Swift.defaultAndroidSDK}`)
    }
}