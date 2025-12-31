import * as fs from 'fs'
import * as path from 'path'
import Handlebars from 'handlebars'
import { copyFile, readFile } from './helpers/filesHelper'
import { LogLevel, print } from './streams/stream'
import { AndroidStream, DroidBuildArch, droidBuildArchToSwiftBuildFolder } from './streams/android/androidStream'
import { AndroidStreamConfig, PackageMode, Scheme, SoMode } from './androidStreamConfig'
import { getToolchainsList } from './toolchain'
import { DevContainerConfig } from './devContainerConfig'
import { projectDirectory } from './extension'

export class AndroidLibraryProject {
    static generateIfNeeded(options: {
        projectPath: string,
        package: string,
        name: string,
        targets: string[],
        compileSdk: number,
        minSdk: number,
        javaVersion: number,
        swiftVersion: string,
        isApp: boolean
    }) {
        const libraryPath = path.join(options.projectPath, 'Library')
        const swiftSourcesPath = path.join(options.projectPath, 'Sources')
        if (!fs.existsSync(libraryPath)) {
            print(`Created folder at ${libraryPath}`, LogLevel.Unbearable)
            fs.mkdirSync(libraryPath)
        }
        const copySourceFile = async (from: string, to?: string) => {
            await copyFile(path.join('assets', 'Sources', 'android', 'library', from), path.join(libraryPath, to ?? from))
        }
        const buildGradlePath = path.join(libraryPath, 'build.gradle.kts')
        if (!fs.existsSync(buildGradlePath)) {
            copySourceFile('build.gradle.kts')
        }
        const settingsPayload = {
            androidLibraryVersion: '8.3.1',
            kotlinLibraryVersion: '1.9.22',
            name: options.name,
            targets: options.targets.map(x => x.toLowerCase())
        }
        const settingsGradlePath = path.join(libraryPath, 'settings.gradle.kts')
        if (!fs.existsSync(settingsGradlePath)) {
            fs.writeFileSync(
                settingsGradlePath,
                Handlebars.compile(readFile(path.join('assets', 'Sources', 'android', 'library', 'settings.gradle.kts.hbs')))(settingsPayload)
            )
        }
        const gitignorePath = path.join(libraryPath, '.gitignore')
        if (!fs.existsSync(gitignorePath)) {
            fs.writeFileSync(
                gitignorePath,
                `.idea\n.gradle\nbuild\n.DS_Store\nlocal.properties`
            )
        }
        for (let i = 0; i < options.targets.length; i++) {
            const target = options.targets[i]
            const targetPath = path.join(libraryPath, target.toLowerCase())
            if (!fs.existsSync(targetPath)) {
                fs.mkdirSync(targetPath)
            }
            const consumerRulesPath = path.join(targetPath, 'consumer-rules.pro')
            if (!fs.existsSync(consumerRulesPath)) {
                copySourceFile(path.join('target', 'consumer-rules.pro'), path.join(target, 'consumer-rules.pro'))
            }
            const buildPayload = {
                namespace: `${options.package}.${target.toLowerCase()}`,
                compileSdk: options.compileSdk,
                minSdk: options.minSdk,
                targetName: target,
                javaVersion: options.javaVersion,
                swiftVersion: options.swiftVersion,
                isApp: options.isApp
            }
            const buildGradlePath = path.join(targetPath, 'build.gradle.kts')
            if (!fs.existsSync(buildGradlePath)) {
                fs.writeFileSync(
                    buildGradlePath,
                    Handlebars.compile(readFile(path.join('assets', 'Sources', 'android', 'library', 'target', 'build.gradle.kts.hbs')))(buildPayload)
                )
            }
            const srcPath = path.join(targetPath, 'src')
            if (!fs.existsSync(srcPath)) {
                fs.mkdirSync(srcPath)
            }
            const mainPath = path.join(srcPath, 'main')
            if (!fs.existsSync(mainPath)) {
                fs.mkdirSync(mainPath)
            }
            const javaPath = path.join(mainPath, 'java')
            if (!fs.existsSync(javaPath)) {
                fs.mkdirSync(javaPath)
            }
            const sourcesPath = path.join(javaPath, ...buildPayload.namespace.split('.'))
            if (!fs.existsSync(sourcesPath)) {
                fs.mkdirSync(sourcesPath, { recursive: true })
            }
            if (!options.isApp && !fs.existsSync(path.join(sourcesPath, 'SwiftInterface.kt'))) {
                fs.writeFileSync(
                    path.join(sourcesPath, 'SwiftInterface.kt'),
                    Handlebars.compile(readFile(path.join('assets', 'Sources', 'android', 'library', 'Sources', 'kotlin', 'Library.hbs')))({
                        namespace: buildPayload.namespace,
                        kotlinclassname: 'SwiftInterface',
                        target: buildPayload.targetName,
                        methodname: 'initialize'
                    })
                )
            }
            const jniPathToClass = `${buildPayload.namespace}.SwiftInterface`.split('.').join('_')
            const swiftTargetPath = path.join(swiftSourcesPath, buildPayload.targetName)
            // Replacement logic
            const placeholder = '@_cdecl("Java_path_to_class'
            const replacementPrefix = `@_cdecl("Java_${jniPathToClass}`
            try {
                const swiftTargetFiles = fs.readdirSync(swiftTargetPath)
                for (const swiftTargetFile of swiftTargetFiles) {
                    const fullPath = path.join(swiftTargetPath, swiftTargetFile)
                    if (fs.statSync(fullPath).isFile()) {
                        let content = fs.readFileSync(fullPath, 'utf-8')
                        if (content.includes(placeholder)) {
                            let updatedContent = content.replaceAll(placeholder, replacementPrefix)
                            updatedContent = updatedContent.replaceAll(' // the path will be set automatically on the first build', '')
                            fs.writeFileSync(fullPath, updatedContent, 'utf-8')
                            console.log(`Replaced 'Java_path_to_class' in ${fullPath}`)
                        }
                    }
                }
            } catch (error) {
                console.error(`Error looking for files in ${swiftTargetPath} to replace 'Java_path_to_class':`, error)
            }
            const jniLibsPath = path.join(mainPath, 'jniLibs')
            if (!fs.existsSync(jniLibsPath)) {
                fs.mkdirSync(jniLibsPath)
            }
            const arm64Path = path.join(jniLibsPath, 'arm64-v8a')
            if (!fs.existsSync(arm64Path)) {
                fs.mkdirSync(arm64Path)
            }
            const armPath = path.join(jniLibsPath, 'armeabi-v7a')
            if (!fs.existsSync(armPath)) {
                fs.mkdirSync(armPath)
            }
            const x86Path = path.join(jniLibsPath, 'x86_64')
            if (!fs.existsSync(x86Path)) {
                fs.mkdirSync(x86Path)
            }
        }
    }

    static async copySoFiles(stream: AndroidStream, options: {
        projectPath: string,
        release: boolean,
        targets: string[],
        archs: DroidBuildArch[],
        scheme: Scheme,
        streamConfig: AndroidStreamConfig
    }) {
        if (options.archs.length == 0) return
        const isLegacySDK = DevContainerConfig.checkIfLegacyAndroidSDK()
        // PART 1: copy target .so files
        for (let a = 0; a < options.archs.length; a++) {
            const arch = options.archs[a]
            for (let i = 0; i < options.targets.length; i++) {
                const target = options.targets[i]
                const fromPath = path.join(droidBuildArchToSwiftBuildFolder({
                    mode: arch,
                    compileSDK: `${options.streamConfig.config.compileSDK}`
                }), options.release ? 'release' : 'debug', `lib${target}.so`)
                const toFolder = path.join(options.projectPath, 'Library', target.toLowerCase(), 'src', 'main', 'jniLibs', arch)
                const oldEntries = fs.readdirSync(toFolder, { withFileTypes: true })
                // - cleanup old .so files
                for (const entry of oldEntries) {
                    if (entry.isFile()) {
                        const fullPath = path.join(toFolder, entry.name)
                        fs.unlinkSync(fullPath)
                    }
                }
                const toPath = path.join(toFolder, `lib${target}.so`)
                fs.cpSync(fromPath, toPath, { force: true })
                print({
                    verbose: `📑 Copied ${target}/.../${arch}/lib${target}.so`,
                    unbearable: `📑 Copied ${toPath}`,
                })
            }
        }
        // Put .so list for each target into this dictionary
        let requiredSO: any = {}
        if ([SoMode.PickedAutomatically].includes(options.streamConfig.config.soMode)) {
            for (let i = 0; i < options.targets.length; i++) {
                const target = options.targets[i]
                const soPath = path.join(options.projectPath, 'Library', target.toLowerCase(), 'src', 'main', 'jniLibs', options.archs[0], `lib${target}.so`)
                if (!fs.existsSync(soPath)) {
                    throw new Error(`Target lib${target}.so not found.`)
                }
                const elfResult = await stream.readelf.neededSoList(soPath)
                if (!elfResult.success) {
                    throw elfResult.error ?? new Error(`Unable to extract dependencies from lib${target}.so`)
                }
                let soToAdd: string[] = []
                function addSoFrom(array: string[]) {
                    for (let a = 0; a < array.length; a++) {
                        const item = array[a]
                        if (!soToAdd.includes(item)) {
                            soToAdd.push(item)
                        }
                    }
                }
                for (let s = 0; s < elfResult.list.length; s++) {
                    const so = elfResult.list[s]
                    if (isLegacySDK && AndroidLibraryProject.compressionLegacy.includes(so)) {
                        addSoFrom(AndroidLibraryProject.compressionLegacy)
                    }
                    if (isLegacySDK) {
                        if (AndroidLibraryProject.coreLegacy.includes(so)) {
                            addSoFrom(AndroidLibraryProject.coreLegacy)
                        }
                    } else {
                        if (AndroidLibraryProject.core.includes(so)) {
                            addSoFrom(AndroidLibraryProject.core)
                        }
                    }
                    if (isLegacySDK) {
                        if (AndroidLibraryProject.foundationLegacy.includes(so)) {
                            addSoFrom(AndroidLibraryProject.foundationLegacy)
                        }
                    } else {
                        if (AndroidLibraryProject.foundation.includes(so)) {
                            addSoFrom(AndroidLibraryProject.foundation)
                        }
                    }
                    if (AndroidLibraryProject.foundationessentials.includes(so)) {
                        addSoFrom(AndroidLibraryProject.foundationessentials)
                    }
                    if (AndroidLibraryProject.i18n.includes(so)) {
                        addSoFrom(AndroidLibraryProject.i18n)
                    }
                    if (isLegacySDK) {
                        if (AndroidLibraryProject.networkingLegacy.includes(so)) {
                            addSoFrom(AndroidLibraryProject.networkingLegacy)
                        }
                    } else {
                        if (AndroidLibraryProject.networking.includes(so)) {
                            addSoFrom(AndroidLibraryProject.networking)
                        }
                    }
                    if (AndroidLibraryProject.testing.includes(so)) {
                        addSoFrom(AndroidLibraryProject.testing)
                    }
                    if (isLegacySDK) {
                        if (AndroidLibraryProject.xmlLegacy.includes(so)) {
                            addSoFrom(AndroidLibraryProject.xmlLegacy)
                        }
                    } else {
                        if (AndroidLibraryProject.xml.includes(so)) {
                            addSoFrom(AndroidLibraryProject.xml)
                        }
                    }
                }
                requiredSO[target] = soToAdd
            }
        }
        // Fill `requiredSO` with targets if needed
        for (let t = 0; t < options.targets.length; t++) {
            const target = options.targets[t]
            if (!requiredSO.hasOwnProperty(target)) {
                requiredSO[target] = []
            }
        }
        enum ProcessAction { Include, Exclude }
        function proceesSoUsing(action: ProcessAction, soObject?: any) {
            if (!soObject) return
            function processArray(array: string[], target: string) {
                for (let s = 0; s < array.length; s++) {
                    let so = array[s]
                    if (action === ProcessAction.Include) {
                        if (!requiredSO[target].includes(so)) {
                            requiredSO[target].push(so)
                        }
                    } else {
                        if (requiredSO[target].includes(so)) {
                            requiredSO[target].splice(requiredSO[target].indexOf(so), 1)
                        }
                    }
                }
            }
            if (Array.isArray(soObject)) {
                for (let t = 0; t < options.targets.length; t++) {
                    const target = options.targets[t]
                    processArray(soObject, target)
                }
            } else if (typeof soObject === 'object' && soObject !== null) {
                for (let t = 0; t < options.targets.length; t++) {
                    const target = options.targets[t]
                    const array = soObject[target]
                    if (array !== null && Array.isArray(array)) {
                        processArray(array, target)
                    }
                }
            }
        }
        proceesSoUsing(ProcessAction.Exclude, options.streamConfig.config.excludeSoFiles)
        proceesSoUsing(ProcessAction.Include, options.streamConfig.config.soFiles)
        // PART 2: copy runtime .so files
        for (let a = 0; a < options.archs.length; a++) {
            const arch = options.archs[a]
            for (let i = 0; i < options.targets.length; i++) {
                const target = options.targets[i]
                const toFolder = path.join(options.projectPath, 'Library', target.toLowerCase(), 'src', 'main', 'jniLibs', arch)
                const sdkSOFilesPath = AndroidLibraryProject.sdkSOFilesPath(arch)
                const ndkSOFilesPath = AndroidLibraryProject.ndkSOFilesPath(arch)
                function copyRelativeSOItem(soItem: string) {
                    if (!soItem.includes('$arch')) {
                        print(`⚠️ Skipped copying ${soItem} because its path does not contain $arch`)
                        return
                    }
                    const soFile = path.basename(soItem)
                    const fromProjectPath = path.join(projectDirectory!, soItem.replace('$arch', arch).replace('$project/', ''))
                    const toPath = path.join(toFolder, soFile)
                    if (fs.existsSync(fromProjectPath)) {
                        fs.cpSync(fromProjectPath, toPath, { force: true })
                        print({
                            verbose: `📑 Copied ${target}/.../${arch}/${soFile}`,
                            unbearable: `📑 Copied from Project ${fromProjectPath} to ${toPath}`,
                        })
                    } else {
                        print(`⚠️ Unable to copy '${soFile}': not found in the Project folder`, LogLevel.Normal)
                        print(`   Tried: ${fromProjectPath}`, LogLevel.Unbearable)
                    }
                }
                function copyAbsoluteSOItem(soItem: string) {
                    if (!soItem.includes('$arch')) {
                        print(`⚠️ Skipped copying ${soItem} because its path does not contain $arch`)
                        return
                    }
                    const soFile = path.basename(soItem)
                    const fromProjectPath = soItem.replace('$arch', arch)
                    const toPath = path.join(toFolder, path.basename(soItem))
                    if (fs.existsSync(fromProjectPath)) {
                        fs.cpSync(fromProjectPath, toPath, { force: true })
                        print({
                            verbose: `📑 Copied ${target}/.../${arch}/${soFile}`,
                            unbearable: `📑 Copied from ${fromProjectPath} to ${toPath}`,
                        })
                    } else {
                        print(`⚠️ Unable to copy '${soFile}': not found in the Project folder`, LogLevel.Normal)
                        print(`   Tried: ${fromProjectPath}`, LogLevel.Unbearable)
                    }
                }
                function copySOFromSDK(soItem: string) {
                    const soFile = path.basename(soItem)
                    const fromSDKPath = path.join(sdkSOFilesPath, soItem.replace('$sdk/', ''))
                    const toPath = path.join(toFolder, soFile)
                    if (fs.existsSync(fromSDKPath)) {
                        fs.cpSync(fromSDKPath, toPath, { force: true })
                        print({
                            verbose: `📑 Copied ${target}/.../${arch}/${soFile}`,
                            unbearable: `📑 Copied from SDK ${fromSDKPath} to ${toPath}`,
                        })
                    } else {
                        print(`⚠️ Unable to copy '${soFile}': not found in the SDK folder`, LogLevel.Normal)
                        print(`   Tried: ${fromSDKPath}`, LogLevel.Unbearable)
                    }
                }
                function copySOFromNDK(soItem: string) {
                    const soFile = path.basename(soItem)
                    const fromNDKPath = path.join(ndkSOFilesPath, soItem.replace('$ndk/', ''))
                    const toPath = path.join(toFolder, soFile)
                    if (fs.existsSync(fromNDKPath)) {
                        fs.cpSync(fromNDKPath, toPath, { force: true })
                        print({
                            verbose: `📑 Copied ${target}/.../${arch}/${soFile}`,
                            unbearable: `📑 Copied from NDK ${fromNDKPath} to ${toPath}`,
                        })
                    } else {
                        print(`⚠️ Unable to copy '${soFile}': not found in the NDK folder`, LogLevel.Normal)
                        print(`   Tried: ${fromNDKPath}`, LogLevel.Unbearable)
                    }
                }
                // in `Packed` mode we have to take only custom .so files
                if ([SoMode.Packed].includes(options.streamConfig.config.soMode)) {
                    // let's filter out .so
                    const filteredSO = requiredSO[target].filter(x => x.startsWith('/') || x.startsWith('$project/'))
                    for (let s = 0; s < filteredSO.length; s++) {
                        const soItem = filteredSO[s]
                        // relative to project
                        if (soItem.startsWith('$project/')) {
                            copyRelativeSOItem(soItem)
                        }
                        // absolute path
                        else {
                            copyAbsoluteSOItem(soItem)
                        }
                    }
                }
                // in `Picked` modes we have to take all
                else if ([SoMode.PickedAutomatically, SoMode.PickedManually].includes(options.streamConfig.config.soMode)) {
                    let soItems: string[] = requiredSO[target]
                    proceesSoUsing(ProcessAction.Exclude, options.scheme.excludeSoFiles)
                    proceesSoUsing(ProcessAction.Include, options.scheme.soFiles)
                    for (let s = 0; s < soItems.length; s++) {
                        const soItem = soItems[s]
                        // relative to project
                        if (soItem.startsWith('$project/')) {
                            copyRelativeSOItem(soItem)
                        }
                        // absolute path
                        else if (soItem.startsWith('/')) {
                            copyAbsoluteSOItem(soItem)
                        }
                        // exactly from SDK
                        else if (soItem.startsWith('$sdk/')) {
                            copySOFromSDK(soItem)
                        }
                        // exactly from NDK
                        else if (soItem.startsWith('$ndk/')) {
                            copySOFromNDK(soItem)
                        }
                        // search in project, then in sdk, then in ndk
                        else {
                            const soFile = path.basename(soItem)
                            const fromProjectPath = path.join(projectDirectory!, soItem.replace('$arch', arch))
                            const fromSDKPath = path.join(sdkSOFilesPath, soItem)
                            const fromNDKPath = path.join(ndkSOFilesPath, soItem)
                            const toPath = path.join(toFolder, soFile)
                            if (fs.existsSync(fromProjectPath)) {
                                if (soItem.includes('$arch')) {
                                    fs.cpSync(fromProjectPath, toPath, { force: true })
                                    print({
                                        verbose: `📑 Copied ${target}/.../${arch}/${soFile}`,
                                        unbearable: `📑 Copied from Project ${fromProjectPath} to ${toPath}`,
                                    })
                                } else {
                                    print(`⚠️ Skipped copying ${soItem} because its path does not contain $arch`)
                                }
                            } else if (fs.existsSync(fromSDKPath)) {
                                fs.cpSync(fromSDKPath, toPath, { force: true })
                                print({
                                    verbose: `📑 Copied ${target}/.../${arch}/${soFile}`,
                                    unbearable: `📑 Copied from SDK ${fromSDKPath} to ${toPath}`,
                                })
                            } else if (fs.existsSync(fromNDKPath)) {
                                fs.cpSync(fromNDKPath, toPath, { force: true })
                                print({
                                    verbose: `📑 Copied ${target}/.../${arch}/${soFile}`,
                                    unbearable: `📑 Copied from SDK ${fromNDKPath} to ${toPath}`,
                                })
                            } else {
                                print(`⚠️ Unable to copy '${soFile}': not found in either project root or the SDK or the NDK folders`, LogLevel.Normal)
                                print(`   Tried project: ${fromProjectPath}`, LogLevel.Unbearable)
                                print(`   Tried SDK: ${fromSDKPath}`, LogLevel.Unbearable)
                                print(`   Tried NDK: ${fromNDKPath}`, LogLevel.Unbearable)
                            }
                        }
                    }
                }
            }
        }
    }

    private static sdkSOFilesPath(arch: DroidBuildArch): string {
        const version = DevContainerConfig.swiftVersion()
        const toolchain = getToolchainsList().android.find((x) => x.version.major === version.major && x.version.minor === version.minor && x.version.patch === version.patch)!
        const androidSDKFolderName1 = toolchain.artifact_url.split('/').pop()!.replace(/\.tar\.gz$/, '')
        const sdkPath1 = path.join('/swift/sdks', androidSDKFolderName1)
        if (DevContainerConfig.checkIfLegacyAndroidSDK()) {
            const androidSDKFolderName2 = fs.readdirSync(sdkPath1, { withFileTypes: true }).find(x => x.isDirectory() && x.name.startsWith('swift-') && x.name.endsWith('-sdk'))!.name
            const sdkPath2 = path.join(sdkPath1, androidSDKFolderName2)
            const androidSDKSysrootFolderName = fs.readdirSync(sdkPath2, { withFileTypes: true }).find(x => x.isDirectory() && x.name.startsWith('android-') && x.name.endsWith('-sysroot'))!.name
            const legacySDKArchFolder = () => {
                switch (arch) {
                    case DroidBuildArch.Arm64: return 'aarch64-linux-android'
                    case DroidBuildArch.ArmEabi: return 'arm-linux-androideabi'
                    case DroidBuildArch.x86_64: return 'x86_64-linux-android'
                }
            }
            return path.join(sdkPath2, androidSDKSysrootFolderName, 'usr', 'lib', legacySDKArchFolder())
        } else {
            const sdkArchFolder = () => {
                switch (arch) {
                    case DroidBuildArch.Arm64: return 'swift-aarch64'
                    case DroidBuildArch.ArmEabi: return 'swift-armv7'
                    case DroidBuildArch.x86_64: return 'swift-x86_64'
                }
            }
            return path.join(sdkPath1, 'swift-android', 'swift-resources', 'usr', 'lib', sdkArchFolder(), 'android')
        }
    }

    private static ndkSOFilesPath(arch: DroidBuildArch): string {
        const ndkVersion = DevContainerConfig.getNDKVersion()
        const ndkArchFolderPrefix = () => {
            switch (arch) {
                case DroidBuildArch.Arm64: return 'aarch64-linux-android'
                case DroidBuildArch.ArmEabi: return 'arm-linux-androideabi'
                case DroidBuildArch.x86_64: return 'x86_64-linux-android'
            }
        }
        return path.join('/opt', 'android', 'ndk', ndkVersion, 'toolchains', 'llvm', 'prebuilt', 'linux-x86_64', 'sysroot', 'usr', 'lib', ndkArchFolderPrefix())
    }

    static proceedTargets(options: {
        projectPath: string,
        targets: string[]
    }) {
        const begin = '// managed by swiftstreamide: includes-begin'
        const end = '// managed by swiftstreamide: includes-end'
        const settingsGradlePath = path.join(options.projectPath, 'Library', 'settings.gradle.kts')
        const settingsGradleFile = fs.readFileSync(settingsGradlePath, 'utf8')
        if (!settingsGradleFile.includes(begin) || !settingsGradleFile.includes(end)) {
            print(`⚠️ Skipped setting includes in settings.gradle.kts since special tag is missing`, LogLevel.Detailed)
            return
        }
        const before = settingsGradleFile.split(begin)[0]
        const after = settingsGradleFile.split(end)[1]
        let newContent = before
        newContent += begin
        for (let t = 0; t < options.targets.length; t++) {
            const target = options.targets[t]
            newContent += `\ninclude(":${target.toLowerCase()}")`
        }
        newContent += '\n' + end
        newContent += after
        fs.writeFileSync(settingsGradlePath, newContent, 'utf8')
    }

    static updateRootProjectName(options: {
        projectPath: string,
        name: string
    }) {
        const settingsGradlePath = path.join(options.projectPath, 'Library', 'settings.gradle.kts')
        let settingsGradleFile = fs.readFileSync(settingsGradlePath, 'utf8')
        settingsGradleFile = settingsGradleFile.replace(
            /^rootProject\.name\s*=\s*["'].*["']/m,
            `rootProject.name = "${options.name}"`
        )
        fs.writeFileSync(settingsGradlePath, settingsGradleFile, 'utf8')
    }

    static updateSubmodule(options: {
        projectPath: string,
        config: AndroidStreamConfig,
        swiftVersion: string,
        target: string
    }) {
        const buildGradlePath = path.join(options.projectPath, 'Library', options.target.toLowerCase(), 'build.gradle.kts')
        print({
            verbose: `Updating "${options.target.toLowerCase()}" gradle submodule`,
            unbearable: `Updating "${options.target.toLowerCase()}" gradle submodule at ${buildGradlePath}`
        })
        let buildGradleFile = fs.readFileSync(buildGradlePath, 'utf8')
        const newNamespace = 
            (options.config.config.packageMode == PackageMode.App)
            ? `${AndroidStreamConfig.DroidPackage}.${options.target.toLowerCase()}`
            : `${options.config.config.packageName}.${options.target.toLowerCase()}`
        buildGradleFile = buildGradleFile.replace(
            /^(\s*)namespace\s*=\s*["'][^"']*["']/m,
            `$1namespace = "${newNamespace}"`
        )
        print(`    setting "namespace" to: ${newNamespace}`, LogLevel.Verbose)
        const newCompileSDK = options.config.config.compileSDK
        buildGradleFile = buildGradleFile.replace(
            /^(\s*)compileSdk\s*=\s*\d+/m,
            `$1compileSdk = ${newCompileSDK}`
        )
        print(`    setting "compileSdk" to: ${newCompileSDK}`, LogLevel.Verbose)
        const newMinSDK = options.config.config.minSDK
        buildGradleFile = buildGradleFile.replace(
            /^(\s*)minSdk\s*=\s*\d+/m,
            `$1minSdk = ${newMinSDK}`
        )
        print(`    setting "minSdk" to: ${newMinSDK}`, LogLevel.Verbose)
        const newJavaVersion = options.config.config.javaVersion
        buildGradleFile = buildGradleFile.replace(
            /^(\s*)sourceCompatibility\s*=\s*JavaVersion\.VERSION_\d+/m,
            `$1sourceCompatibility = JavaVersion.VERSION_${newJavaVersion}`
        )
        buildGradleFile = buildGradleFile.replace(
            /^(\s*)targetCompatibility\s*=\s*JavaVersion\.VERSION_\d+/m,
            `$1targetCompatibility = JavaVersion.VERSION_${newJavaVersion}`
        )
        buildGradleFile = buildGradleFile.replace(
            /^(\s*)jvmTarget\s*=\s*["'][^"']*["']/m,
            `$1jvmTarget = "${newJavaVersion}"`
        )
        print(`    setting Java version to: ${newJavaVersion}`, LogLevel.Verbose)
        const isProblematic6_2_0 = DevContainerConfig.swiftVersion6_2_0()
        let versionSuffix = ''
        if (isProblematic6_2_0) {
            versionSuffix = '-16kb'
        }
        buildGradleFile = buildGradleFile.replace(
            /(implementation\(["']com\.github\.swifdroid\.runtime-libs:core:)([^"']+)(["']\))/,
            `$1${options.swiftVersion}${versionSuffix}$3`
        )
        print(`    setting Swift in "core" dependency to: ${options.swiftVersion}`, LogLevel.Verbose)
        fs.writeFileSync(buildGradlePath, buildGradleFile, 'utf8')
    }

    static removeObsoleteSubmodules(options: {
        projectPath: string,
        targets: string[]
    }) {
        const libraryPath = path.join(options.projectPath, 'Library')
        const allEntries = fs.readdirSync(libraryPath, { withFileTypes: true })
        const subfolders = allEntries
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name)
        // Determine which folders should be removed
        const foldersToRemove = subfolders.filter(folder => ![...options.targets.map(x => x.toLowerCase()), 'gradle', 'build', '.git', '.gradle'].includes(folder))
        if (foldersToRemove.length > 0) {
            print(`🧹 Removing obsolete submodules`)
            // Delete redundant folders
            for (const folder of foldersToRemove) {
                const fullPath = path.join(libraryPath, folder)
                fs.rmSync(fullPath, { recursive: true, force: true })
                print(`    removed "${folder}"`, LogLevel.Detailed)
            }
        }
    }

    static async proceedManifest(stream: AndroidStream, options: {
        projectPath: string,
        streamConfig: AndroidStreamConfig,
        manifest: string | undefined
    }) {
        if (options.streamConfig.config.packageMode != PackageMode.App) { return }
        if (!options.manifest) { return }
        const target = 'appui'
        const libraryManifestPath = path.join(options.projectPath, 'Library', target, 'src', 'main', 'AndroidManifest.xml')
        const newContent = options.manifest.replace('__TARGET_NAME__', options.streamConfig.config.name)
        fs.writeFileSync(libraryManifestPath, newContent, 'utf8')
    }

    static async proceedActivityBodies(stream: AndroidStream, options: {
        projectPath: string,
        streamConfig: AndroidStreamConfig,
        activityBodies: Record<string, string> | undefined
    }) {
        if (options.streamConfig.config.packageMode != PackageMode.App) { return }
        if (!options.activityBodies) { return }
        const libraryPath = path.join(options.projectPath, 'Library')
        const target = 'appui'
        const nameSpaceWithTarget = `${AndroidStreamConfig.DroidPackage}.${target.toLowerCase()}`
        const targetPath = path.join(libraryPath, target)
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath)
        }
        const activityNames = Object.keys(options.activityBodies)
        const targetSrcPath = path.join(targetPath, 'src')
        if (!fs.existsSync(targetSrcPath)) {
            fs.mkdirSync(targetSrcPath)
        }
        const targetSrcMainPath = path.join(targetSrcPath, 'main')
        if (!fs.existsSync(targetSrcMainPath)) {
            fs.mkdirSync(targetSrcMainPath)
        }
        const targetSrcMainJavaPath = path.join(targetSrcMainPath, 'java')
        if (!fs.existsSync(targetSrcMainJavaPath)) {
            fs.mkdirSync(targetSrcMainJavaPath)
        }
        const javaFilesRootPath = AndroidLibraryProject.createFolderStructureIfNeeded(targetSrcMainJavaPath, nameSpaceWithTarget)
        const existingFiles = fs.readdirSync(javaFilesRootPath)
        for (const existingFile of existingFiles) {
            if (existingFile.endsWith('Activity.kt')) {
                const fullPath = path.join(javaFilesRootPath, existingFile)
                if (fs.statSync(fullPath).isFile()) {
                    fs.unlinkSync(fullPath)
                }
            }
        }
        for (let i = 0; i < activityNames.length; i++) {
            const activityName = activityNames[i]
            const encodedActivity = options.activityBodies[activityName]
            const decodedActivity = atob(encodedActivity)
            const newContent = `package ${nameSpaceWithTarget}\n\n${decodedActivity}`
            const activityPath = path.join(javaFilesRootPath, `${activityName}.kt`)
            fs.writeFileSync(activityPath, newContent, 'utf8')
        }
    }

    static async proceedFragmentBodies(stream: AndroidStream, options: {
        projectPath: string,
        streamConfig: AndroidStreamConfig,
        fragmentBodies: Record<string, string> | undefined
    }) {
        if (options.streamConfig.config.packageMode != PackageMode.App) { return }
        if (!options.fragmentBodies) { return }
        const libraryPath = path.join(options.projectPath, 'Library')
        const target = 'appui'
        const nameSpaceWithTarget = `${AndroidStreamConfig.DroidPackage}.${target.toLowerCase()}`
        const targetPath = path.join(libraryPath, target)
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath)
        }
        const fragmentNames = Object.keys(options.fragmentBodies)
        const targetSrcPath = path.join(targetPath, 'src')
        if (!fs.existsSync(targetSrcPath)) {
            fs.mkdirSync(targetSrcPath)
        }
        const targetSrcMainPath = path.join(targetSrcPath, 'main')
        if (!fs.existsSync(targetSrcMainPath)) {
            fs.mkdirSync(targetSrcMainPath)
        }
        const targetSrcMainJavaPath = path.join(targetSrcMainPath, 'java')
        if (!fs.existsSync(targetSrcMainJavaPath)) {
            fs.mkdirSync(targetSrcMainJavaPath)
        }
        const javaFilesRootPath = AndroidLibraryProject.createFolderStructureIfNeeded(targetSrcMainJavaPath, nameSpaceWithTarget)
        const existingFiles = fs.readdirSync(javaFilesRootPath)
        for (const existingFile of existingFiles) {
            if (existingFile.endsWith('Fragment.kt')) {
                const fullPath = path.join(javaFilesRootPath, existingFile)
                if (fs.statSync(fullPath).isFile()) {
                    fs.unlinkSync(fullPath)
                }
            }
        }
        for (let i = 0; i < fragmentNames.length; i++) {
            const fragmentName = fragmentNames[i]
            const encodedFragment = options.fragmentBodies[fragmentName]
            const decodedFragment = atob(encodedFragment)
            const newContent = `package ${nameSpaceWithTarget}\n\n${decodedFragment}`
            const fragmentPath = path.join(javaFilesRootPath, `${fragmentName}.kt`)
            fs.writeFileSync(fragmentPath, newContent, 'utf8')
        }
    }

    static async proceedDependencies(stream: AndroidStream, options: {
        projectPath: string,
        streamConfig: AndroidStreamConfig,
        dependencies: string[]
    }) {
        if (options.streamConfig.config.packageMode != PackageMode.App) { return }
        const target = 'appui'
        const begin = '// managed by swiftstreamide: dependencies-begin'
        const end = '// managed by swiftstreamide: dependencies-end'
        const buildGradlePath = path.join(options.projectPath, 'Library', target.toLowerCase(), 'build.gradle.kts')
        const buildGradleFile = fs.readFileSync(buildGradlePath, 'utf8')
        if (!buildGradleFile.includes(begin) || !buildGradleFile.includes(end)) {
            print(`⚠️ Skipped setting dependencies since special tag is missing`, LogLevel.Detailed)
            return
        }
        const before = buildGradleFile.split(begin)[0]
        const after = buildGradleFile.split(end)[1]
        let newContent = before
        newContent += begin
        if (options.streamConfig.config.soMode === SoMode.Packed) {
            const deps = options.dependencies.sort((a, b) => a.localeCompare(b))
            for (let d = 0; d < deps.length; d++) {
                newContent += `\n    ${deps[d]}`
            }
        }
        newContent += '\n    ' + end
        newContent += after
        fs.writeFileSync(buildGradlePath, newContent, 'utf8')
    }

    private static removeLinesWithPattern(filePath: string, pattern: string) {
        const content = fs.readFileSync(filePath, 'utf-8')
        const lines = content.split('\n')
        const filteredLines = lines.filter(line => !line.includes(pattern))
        fs.writeFileSync(filePath, filteredLines.join('\n'))
    }

    static async proceedSoDependencies(stream: AndroidStream, options: {
        projectPath: string,
        targets: string[],
        arch: DroidBuildArch,
        swiftVersion: string,
        streamConfig: AndroidStreamConfig
    }) {
        const begin = '// managed by swiftstreamide: so-dependencies-begin'
        const end = '// managed by swiftstreamide: so-dependencies-end'
        for (let i = 0; i < options.targets.length; i++) {
            const target = options.targets[i]
            const soPath = path.join(options.projectPath, 'Library', target.toLowerCase(), 'src', 'main', 'jniLibs', options.arch, `lib${target}.so`)
            const elfResult = await stream.readelf.neededSoList(soPath)
            if (!elfResult.success) {
                throw elfResult.error ?? new Error(`Unable to extract dependencies from lib${target}.so`)
            }
            const buildGradlePath = path.join(options.projectPath, 'Library', target.toLowerCase(), 'build.gradle.kts')
            // Cleanup file from any old records
            AndroidLibraryProject.removeLinesWithPattern(buildGradlePath, 'com.github.swifdroid.runtime-libs:')
            const buildGradleFile = fs.readFileSync(buildGradlePath, 'utf8')
            if (options.streamConfig.config.soMode === SoMode.Packed) {
                if (!buildGradleFile.includes(begin) || !buildGradleFile.includes(end)) {
                    print(`⚠️ Skipped setting dependencies for lib${target}.so since special tag is missing`, LogLevel.Detailed)
                    continue
                }
            } else {
                print(`Skipped setting so-dependencies for lib${target}.so since mode is not 'Packed'`, LogLevel.Unbearable)
                continue
            }
            const isLegacySDK = DevContainerConfig.checkIfLegacyAndroidSDK()
            let dependencies: string[] = []
            if (options.streamConfig.config.soMode === SoMode.Packed) {
                dependencies.push('core')
                for (let s = 0; s < elfResult.list.length; s++) {
                    const so = elfResult.list[s]
                    if (isLegacySDK && AndroidLibraryProject.compressionLegacy.includes(so) && !dependencies.includes('compression')) {
                        dependencies.push('compression')
                    }
                    if (isLegacySDK) {
                        if (AndroidLibraryProject.foundationLegacy.includes(so) && !dependencies.includes('foundation')) {
                            dependencies.push('foundation')
                        }
                    } else {
                        if (AndroidLibraryProject.foundation.includes(so) && !dependencies.includes('foundation')) {
                            dependencies.push('foundation')
                        }
                    }
                    if (AndroidLibraryProject.foundationessentials.includes(so) && !dependencies.includes('foundationessentials')) {
                        dependencies.push('foundationessentials')
                    }
                    if (AndroidLibraryProject.i18n.includes(so) && !dependencies.includes('i18n')) {
                        dependencies.push('i18n')
                    }
                    if (isLegacySDK) {
                        if (AndroidLibraryProject.networkingLegacy.includes(so) && !dependencies.includes('networking')) {
                            dependencies.push('networking')
                        }
                    } else {
                        if (AndroidLibraryProject.networking.includes(so) && !dependencies.includes('networking')) {
                            dependencies.push('networking')
                        }
                    }
                    if (AndroidLibraryProject.testing.includes(so) && !dependencies.includes('testing')) {
                        dependencies.push('testing')
                    }
                    if (isLegacySDK) {
                        if (AndroidLibraryProject.xmlLegacy.includes(so) && !dependencies.includes('xml')) {
                            dependencies.push('xml')
                        }
                    } else {
                        if (AndroidLibraryProject.xml.includes(so) && !dependencies.includes('xml')) {
                            dependencies.push('xml')
                        }
                    }
                }
            }
            const isProblematic6_2_0 = DevContainerConfig.swiftVersion6_2_0()
            let versionSuffix = ''
            if (isProblematic6_2_0) {
                versionSuffix = '-16kb'
            }
            const before = buildGradleFile.split(begin)[0]
            const after = buildGradleFile.split(end)[1]
            let newContent = before
            newContent += begin
            if (options.streamConfig.config.soMode === SoMode.Packed) {
                for (let d = 0; d < dependencies.length; d++) {
                    const dependency = dependencies[d]
                    newContent += `\n    implementation("com.github.swifdroid.runtime-libs:${dependency}:${options.swiftVersion}${versionSuffix}")`
                }
            }
            newContent += '\n    ' + end
            newContent += after
            fs.writeFileSync(buildGradlePath, newContent, 'utf8')
        }
    }
    static compressionLegacy: string[] = [
        'liblzma.so',
        'libz.so'
    ]
    static coreLegacy: string[] = [
        'libandroid-execinfo.so',
        'libandroid-spawn.so',
        'libBlocksRuntime.so',
        'libc++_shared.so',
        'libcharset.so',
        'libdispatch.so',
        'libswift_Builtin_float.so',
        'libswift_Concurrency.so',
        'libswift_Differentiation.so',
        'libswift_math.so',
        'libswift_RegexParser.so',
        'libswift_StringProcessing.so',
        'libswift_Volatile.so',
        'libswiftAndroid.so',
        'libswiftCore.so',
        'libswiftDispatch.so',
        'libswiftDistributed.so',
        'libswiftObservation.so',
        'libswiftRegexBuilder.so',
        'libswiftSwiftOnoneSupport.so',
        'libswiftSynchronization.so'
    ]
    static core: string[] = [
        'libBlocksRuntime.so',
        'libc++_shared.so',
        'libdispatch.so',
        'libswift_Builtin_float.so',
        'libswift_Concurrency.so',
        'libswift_Differentiation.so',
        'libswift_math.so',
        'libswift_RegexParser.so',
        'libswift_StringProcessing.so',
        'libswift_Volatile.so',
        'libswiftAndroid.so',
        'libswiftCore.so',
        'libswiftDispatch.so',
        'libswiftDistributed.so',
        'libswiftObservation.so',
        'libswiftRegexBuilder.so',
        'libswiftSwiftOnoneSupport.so',
        'libswiftSynchronization.so'
    ]
    static foundationLegacy: string[] = [
        'lib_FoundationICU.so',
        'libFoundation.so',
        'libiconv.so'
    ]
    static foundation: string[] = [
        'lib_FoundationICU.so',
        'libFoundation.so',
    ]
    static foundationessentials: string[] = [
        'libFoundationEssentials.so'
    ]
    static i18n: string[] = [
        'libFoundationInternationalization.so'
    ]
    static networkingLegacy: string[] = [
        'libcrypto.so',
        'libcurl.so',
        'libFoundationNetworking.so',
        'libnghttp2.so',
        'libnghttp3.so',
        'libssh2.so',
        'libssl.so'
    ]
    static networking: string[] = [
        'libFoundationNetworking.so'
    ]
    static testing: string[] = [
        'libTesting.so',
        'libXCTest.so'
    ]
    static xmlLegacy: string[] = [
        'libFoundationXML.so',
        'libxml2.so'
    ]
    static xml: string[] = [
        'libFoundationXML.so'
    ]

    static createFolderStructureIfNeeded(baseDir: string, dottedPath: string): string {
        const parts = dottedPath.split('.')
        let currentPath = baseDir
        for (const part of parts) {
            currentPath = path.join(currentPath, part)
            if (!fs.existsSync(currentPath)) {
                fs.mkdirSync(currentPath)
            }
        }
        return path.join(baseDir, ...dottedPath.split('.'))
    }
}
