import * as fs from 'fs'
import * as path from 'path'
import JSON5 from 'json5'
import { sidebarTreeView } from './extension'
import { window } from 'vscode'
import { AbortHandler } from './bash'
import { AndroidStream } from './streams/android/androidStream'
import { LogLevel, print } from './streams/stream'

export class AndroidStreamConfig {
    static defaultPath(options: { projectPath: string }): string { return `${options.projectPath}/.vscode/android-stream.json` }

    public static transaction(options: {
        projectPath: string,
        process: (config: AndroidStreamConfig) => void
    }) {
        let config = new AndroidStreamConfig({ projectPath: options.projectPath })
        options.process(config)
        config.save()
    }

    /// Should be called from the NewProjectWizard
    public static async createInitialConfig(options: {
        projectPath: string,
        projectName: string,
        packageMode: PackageMode
    }): Promise<Config | undefined> {
        let x = new AndroidStreamConfig({ projectPath: options.projectPath })
        x.config.name = options.projectName
        const packageName = await AndroidStreamConfig.askForJavaLibraryNamespace()
        if (!packageName || packageName.length === 0) {
            return undefined
        } 
        x.config.packageName = packageName
        const minSDK = await AndroidStreamConfig.askForMinSDK()
        if (!minSDK) {
            return undefined
        }
        x.config.minSDK = parseInt(minSDK)
        const compileSDK = await AndroidStreamConfig.askForCompileSDK()
        if (!compileSDK) {
            return undefined
        }
        x.config.compileSDK = parseInt(compileSDK)
        const javaVersion = await AndroidStreamConfig.askForJavaVersion()
        if (!javaVersion) {
            return undefined
        }
        x.config.javaVersion = parseInt(javaVersion)
        x.config.soMode = SoMode.Packed
        x.config.packageMode = options.packageMode
        x.config.schemes = [{
            title: `${options.projectName} Debug`,
            swiftTargets: [options.projectName],
            buildConfiguration: SchemeBuildConfiguration.Debug
        }, {
            title: `${options.projectName} Release`,
            swiftTargets: [options.projectName],
            buildConfiguration: SchemeBuildConfiguration.Release
        }]
        x.save()
        return x.config
    }

    static async askForJavaLibraryNamespace(): Promise<string | undefined> {
        return await window.showInputBox({
            title: 'Java Namespace',
            value: '',
            placeHolder: 'e.g. com.my.lib',
            prompt: 'Choose the namespace for your java project'
        })
    }

    static async askForMinSDK(): Promise<string | undefined> {
        return await window.showQuickPick([
            '28', '29', '30', '31', '32', '33', '34', '35'
        ], {
            title: 'Android Min SDK Version',
            placeHolder: `Choose Android Min SDK Version`
        })
    }

    static async askForCompileSDK(): Promise<string | undefined> {
        return await window.showQuickPick([
            '35', '34', '33', '32', '31', '30', '29', '28'
        ], {
            title: 'Android Compile SDK Version',
            placeHolder: `Choose Android Compile SDK Version`
        })
    }

    static async askForJavaVersion(): Promise<string | undefined> {
        const values = [
            '11'
        ]
        if (values.length == 1) {
            return values[0]
        }
        return await window.showQuickPick(values, {
            title: 'Java Version',
            placeHolder: `Choose Java Version`
        })
    }

    public static async initializeConfigIfNeeded(options: {
        projectPath: string,
        stream: AndroidStream
    }): Promise<boolean> {
        const configExists = AndroidStreamConfig.exists({ projectPath: options.projectPath })
        let x = new AndroidStreamConfig({ projectPath: options.projectPath })
        let startedInspection = false
        const startInspection = () => {
            if (!startedInspection) {
                startedInspection = true
                print(`🕵️ Checking stream config`, LogLevel.Detailed)
            }
        }
        if (!configExists) startInspection()
        if (!x.config.name) {
            startInspection()
            let swiftPackageName = ''
            try {
                swiftPackageName = await options.stream.swift.getPackageName({ fresh: false })
            } catch {
                swiftPackageName = path.basename(options.projectPath)
            }
            const name = await window.showInputBox({
                title: 'Project Name',
                value: swiftPackageName,
                placeHolder: 'How would you name it?',
                prompt: 'Choose the name for your project'
            })
            if (!name || name.length === 0) {
                return false
            } 
            x.config.name = name
        }
        if (!x.config.packageName) {
            startInspection()
            const packageName = await AndroidStreamConfig.askForJavaLibraryNamespace()
            if (!packageName || packageName.length === 0) {
                return false
            } 
            x.config.packageName = packageName
        }
        if (x.config.minSDK === 0) {
            startInspection()
            const minSDK = await AndroidStreamConfig.askForMinSDK()
            if (!minSDK) {
                return false
            }
            x.config.minSDK = parseInt(minSDK)
        }
        if (x.config.compileSDK === 0) {
            startInspection()
            const compileSDK = await AndroidStreamConfig.askForCompileSDK()
            if (!compileSDK) {
                return false
            }
            x.config.compileSDK = parseInt(compileSDK)
        }
        if (x.config.javaVersion === 0) {
            startInspection()
            const javaVersion = await AndroidStreamConfig.askForJavaVersion()
            if (!javaVersion) {
                return false
            }
            x.config.javaVersion = parseInt(javaVersion)
        }
        if (!configExists) {
            startInspection()
            const soMode = await window.showQuickPick([{
                label: 'Packed',
                detail: 'automatically based on imports in Swift'
            }, {
                label: 'PickedManually',
                detail: 'manually, you will pick it from the list yourself'
            }], {
                title: 'How to process .so files?',
                placeHolder: `Choose which way you want to process .so files`
            })
            if (!soMode) {
                return false
            }
            x.config.soMode = soMode.label === 'Packed' ? SoMode.Packed : SoMode.PickedManually
            const packageMode = await window.showQuickPick([{
                label: 'App'
            }, {
                label: 'Library'
            }], {
                title: 'Project Mode',
                placeHolder: `Choose App or Library mode`
            })
            if (!packageMode) {
                return false
            }
            x.config.packageMode = packageMode.label === 'App' ? PackageMode.App : PackageMode.Library
        }
        x.save()
        return true
    }
    
    private path: string
    config: Config

    static createIfNeeded(options: {
        projectPath: string
    }) {
        if (!AndroidStreamConfig.exists({ projectPath: options.projectPath })) {
            AndroidStreamConfig.transaction({
                projectPath: options.projectPath,
                process: () => {}
            })
        }
    }

    projectPath: string
    
    constructor(options: { projectPath: string }) {
        this.projectPath = options.projectPath
        this.path = AndroidStreamConfig.defaultPath({ projectPath: options.projectPath })
        if (!AndroidStreamConfig.exists({ projectPath: options.projectPath })) {
            this.config = {
                name: '',
                packageName: '',
                packageMode: PackageMode.Library,
                compileSDK: 0,
                minSDK: 0,
                javaVersion: 0,
                soMode: SoMode.Packed,
                schemes: []
            }
        } else {
            this.config = JSON5.parse(fs.readFileSync(this.path, 'utf8'))
        }
    }

    public transaction(process: (config: AndroidStreamConfig) => void) {
        process(this)
        this.save()
    }

    public save() {
        if (!fs.existsSync(`${this.projectPath}/.vscode`)) {
            fs.mkdirSync(`${this.projectPath}/.vscode`)
        }
        const devContainerContent = JSON.stringify(this.config, null, '\t')
        fs.writeFileSync(this.path, devContainerContent, 'utf8')
    }

    public static exists(options: {
        projectPath: string
    }): boolean {
        return fs.existsSync(AndroidStreamConfig.defaultPath({ projectPath: options.projectPath }))
    }

    public static packageMode(options: {
        projectPath: string
    }): PackageMode | undefined {
        let config = new AndroidStreamConfig({ projectPath: options.projectPath })
        return config.config?.packageMode
    }

    public static schemes(options: {
        projectPath: string
    }): Scheme[] {
        let config = new AndroidStreamConfig({ projectPath: options.projectPath })
        return config.config?.schemes ?? []
    }
    
    public autoselectScheme(): boolean {
        if (!this.config?.selectedScheme && this.config?.schemes && this.config.schemes.length > 0) {
            this.config.selectedScheme = this.config.schemes[0].title
            return this.config.selectedScheme !== undefined
        }
        return false
    }

    public static selectedScheme(options: {
        projectPath: string
    }): Scheme | undefined {
        let config = new AndroidStreamConfig({ projectPath: options.projectPath })
        if (!config.config?.selectedScheme) return undefined
        return config.config.schemes?.find(x => x.title === config.config?.selectedScheme)
    }

    setSelectedScheme(scheme: Scheme) {
        if (this.config) {
            this.config.selectedScheme = scheme.title
        }
    }
}

export async function chooseScheme(options: {
    projectPath: string,
    stream: AndroidStream,
    abortHandler?: AbortHandler
}): Promise<Scheme | undefined> {
    if (await AndroidStreamConfig.initializeConfigIfNeeded({
        projectPath: options.projectPath,
        stream: options.stream
    }) === false) {
        return undefined
    }
    const streamConfig = new AndroidStreamConfig({ projectPath: options.projectPath })
    const schemes = AndroidStreamConfig.schemes({ projectPath: options.projectPath })
    if (schemes.length > 0) {
        const selectedTitle = await window.showQuickPick(schemes.map(x => x.title), {
            placeHolder: `Select scheme`
        })
        if (!selectedTitle) return undefined
        const selectedScheme = schemes.find(x => x.title === selectedTitle)
        if (!selectedScheme) return undefined
        AndroidStreamConfig.transaction({
            projectPath: options.projectPath,
            process: (x) => {
                x.setSelectedScheme(selectedScheme)
                sidebarTreeView?.refresh()
            }
        })
        return selectedScheme
    } else {
        if (await window.showQuickPick(['Yes', 'No'], {
            placeHolder: 'Would you like to create a build scheme?'
        }) !== 'Yes') return undefined
        const swiftTargets = await options.stream.swift.getLibraryProducts({
            fresh: false,
            abortHandler: undefined
        })
        const selectedTargets = await window.showQuickPick(swiftTargets, {
            title: 'Swift Targets for Build Scheme',
            placeHolder: `Choose which Swift targets to include into scheme`,
            canPickMany: true
        })
        if (!selectedTargets || selectedTargets.length == 0) return undefined
        const _buildConfiguration = await window.showQuickPick([{
            label: 'Debug'
        }, {
            label: 'Release'
        }], {
            title: 'Build Scheme Configuration',
            placeHolder: `Choose Debug or Release`
        })
        if (!_buildConfiguration) return undefined
        const buildConfiguration: SchemeBuildConfiguration | undefined = _buildConfiguration.label === 'Debug' ? SchemeBuildConfiguration.Debug : SchemeBuildConfiguration.Release
        let title: string | undefined
        title = await window.showInputBox({
            title: 'Build Scheme Name',
            value: '',
            placeHolder: 'How would you name it?',
            prompt: 'Choose the name for your scheme'
        })
        if (!title || title.length == 0) return undefined
        const newScheme = {
            title: title,
            swiftTargets: selectedTargets,
            buildConfiguration: buildConfiguration,
            soFiles: streamConfig.config.soMode === SoMode.Packed ? undefined : [
                'libandroid-execinfo.so',
                'libandroid-spawn.so',
                'libc++_shared.so',
                'libcharset.so',
                'libswift_Builtin_float.so',
                'libswift_Concurrency.so',
                'libswift_Differentiation.so',
                'libswift_math.so',
                'libswift_RegexParser.so',
                'libswift_StringProcessing.so',
                'libswift_Volatile.so',
                'libswiftAndroid.so',
                'libswiftCore.so',
                'libswiftDistributed.so',
                'libswiftObservation.so',
                'libswiftRegexBuilder.so',
                'libswiftSwiftOnoneSupport.so',
                'libswiftSynchronization.so'
            ]
        }
        AndroidStreamConfig.transaction({
            projectPath: options.projectPath,
            process: (x) => {
                x.config?.schemes?.push(newScheme)
                x.setSelectedScheme(newScheme)
                sidebarTreeView?.refresh()
            }
        })
        return newScheme
    }
}

export interface Scheme {
    title: string
    swiftTargets: string[]
    buildConfiguration: SchemeBuildConfiguration
    excludeSoFiles?: string[] | Record<string, string[]>
    soFiles?: string[] | Record<string, string[]>
    swiftArgs?: string[] | Record<string, string[]>
}

export enum SchemeBuildConfiguration {
    Debug = 'Debug',
    Release = 'Release'
}

export enum PackageMode {
    App = 'App',
    Library = 'Library'
}

export enum SoMode {
    Packed = 'Packed', // automatic from jitpack based on imports
    PickedAutomatically = 'PickedAutomatically', // automatic locally based on imports and manual picks
    PickedManually = 'PickedManually' // manually picked from the list
}

export interface Config {
    name: string
    packageMode: PackageMode
    packageName: string
    soMode: SoMode
    excludeSoFiles?: string[] | Record<string, string[]>
    soFiles?: string[] | Record<string, string[]>
    minSDK: number
    compileSDK: number
    javaVersion: number
    selectedScheme?: string
    schemes?: Scheme[]
}