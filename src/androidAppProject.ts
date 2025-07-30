import * as fs from 'fs'
import * as path from 'path'
import Handlebars from 'handlebars'
import { LogLevel, print } from './streams/stream'
import { copyFile, readFile } from './helpers/filesHelper'

export class AndroidAppProject {
    static generateIfNeeded(options: {
        projectPath: string,
        package: string,
        name: string,
        targets: string[],
        compileSdk: number,
        minSdk: number,
        javaVersion: number,
        swiftVersion: string
    }) {
        const applicationPath = path.join(options.projectPath, 'Application')
        const swiftSourcesPath = path.join(options.projectPath, 'Sources')
        if (!fs.existsSync(applicationPath)) {
            print(`Created folder at ${applicationPath}`, LogLevel.Unbearable)
            fs.mkdirSync(applicationPath)
        }
        const copySourceFile = async (from: string, to?: string) => {
            await copyFile(path.join('assets', 'Sources', 'android', 'app', from), path.join(applicationPath, to ?? from))
        }
        const buildGradlePath = path.join(applicationPath, 'build.gradle.kts')
        if (!fs.existsSync(buildGradlePath)) {
            copySourceFile('build.gradle.kts')
        }
        const gradlePropertiesPath = path.join(applicationPath, 'gradle.properties')
        if (!fs.existsSync(gradlePropertiesPath)) {
            copySourceFile('gradle.properties')
        }
        const settingsPayload = {
            name: options.name
        }
        const settingsGradlePath = path.join(applicationPath, 'settings.gradle.kts')
        if (!fs.existsSync(settingsGradlePath)) {
            fs.writeFileSync(
                settingsGradlePath,
                Handlebars.compile(readFile(path.join('assets', 'Sources', 'android', 'app', 'settings.gradle.kts.hbs')))(settingsPayload)
            )
        }
        const targetGradlePath = path.join(applicationPath, 'gradle')
        if (!fs.existsSync(targetGradlePath)) {
            fs.mkdirSync(targetGradlePath)
        }
        const gradleLibsVersionsPath = path.join(targetGradlePath, 'libs.versions.toml')
        if (!fs.existsSync(gradleLibsVersionsPath)) {
            copySourceFile('libs.versions.toml', path.join('gradle', 'libs.versions.toml'))
        }
        const target = 'androidapp'
        const targetPath = path.join(applicationPath, target.toLowerCase())
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath)
        }
        const proguardRulesPath = path.join(targetPath, 'proguard-rules.pro')
        if (!fs.existsSync(proguardRulesPath)) {
            copySourceFile(path.join('target', 'proguard-rules.pro'), path.join(target, 'proguard-rules.pro'))
        }
        const nameSpaceWithTarget = `${options.package}.${target.toLowerCase()}`
        const buildPayload = {
            namespace: nameSpaceWithTarget,
            compileSdk: options.compileSdk,
            minSdk: options.minSdk,
            javaVersion: options.javaVersion
        }
        const targetBuildGradlePath = path.join(targetPath, 'build.gradle.kts')
        if (!fs.existsSync(targetBuildGradlePath)) {
            fs.writeFileSync(
                targetBuildGradlePath,
                Handlebars.compile(readFile(path.join('assets', 'Sources', 'android', 'app', 'target', 'build.gradle.kts.hbs')))(buildPayload)
            )
        }
        const targetSrcPath = path.join(targetPath, 'src')
        if (!fs.existsSync(targetSrcPath)) {
            fs.mkdirSync(targetSrcPath)
        }
        const targetSrcAndroidTestPath = path.join(targetSrcPath, 'androidTest')
        if (!fs.existsSync(targetSrcAndroidTestPath)) {
            fs.mkdirSync(targetSrcAndroidTestPath)
        }
        const androidTestFileRootPath = AndroidAppProject.createFolderStructureIfNeeded(targetSrcAndroidTestPath, nameSpaceWithTarget)
        const targetSrcAndroidTestFilePath = path.join(androidTestFileRootPath, 'ExampleInstrumentedTest.kt')
        if (!fs.existsSync(targetSrcAndroidTestFilePath)) {
            fs.writeFileSync(
                targetSrcAndroidTestFilePath,
                Handlebars.compile(readFile(path.join('assets', 'Sources', 'android', 'app', 'target', 'ExampleInstrumentedTest.kt.hbs')))(buildPayload)
            )
        }
        const targetSrcTestPath = path.join(targetSrcPath, 'test')
        if (!fs.existsSync(targetSrcTestPath)) {
            fs.mkdirSync(targetSrcTestPath)
        }
        const testFileRootPath = AndroidAppProject.createFolderStructureIfNeeded(targetSrcTestPath, nameSpaceWithTarget)
        const targetSrcTestFilePath = path.join(testFileRootPath, 'ExampleUnitTest.kt')
        if (!fs.existsSync(targetSrcTestFilePath)) {
            fs.writeFileSync(
                targetSrcTestFilePath,
                Handlebars.compile(readFile(path.join('assets', 'Sources', 'android', 'app', 'target', 'ExampleUnitTest.kt.hbs')))(buildPayload)
            )
        }
        const targetSrcMainPath = path.join(targetSrcPath, 'main')
        if (!fs.existsSync(targetSrcMainPath)) {
            fs.mkdirSync(targetSrcMainPath)
        }
        const targetSrcMainAndroidManifestPath = path.join(targetSrcMainPath, 'AndroidManifest.xml')
        if (!fs.existsSync(targetSrcMainAndroidManifestPath)) {
            copySourceFile(path.join('target', 'AndroidManifest.xml'), path.join(target, 'src', 'main', 'AndroidManifest.xml'))
        }
        const targetSrcMainJavaPath = path.join(targetSrcMainPath, 'java')
        if (!fs.existsSync(targetSrcMainJavaPath)) {
            fs.mkdirSync(targetSrcMainJavaPath)
        }
        const javaFilesRootPath = AndroidAppProject.createFolderStructureIfNeeded(targetSrcMainJavaPath, options.package)
        const placeholderFilePath = path.join(javaFilesRootPath, 'Placeholder.kt')
        if (!fs.existsSync(placeholderFilePath)) {
            fs.writeFileSync(
                placeholderFilePath,
                Handlebars.compile(readFile(path.join('assets', 'Sources', 'android', 'app', 'target', 'Placeholder.kt.hbs')))(buildPayload)
            )
        }
        const targetSrcMainResPath = path.join(targetSrcMainPath, 'res')
        if (!fs.existsSync(targetSrcMainResPath)) {
            fs.mkdirSync(targetSrcMainResPath)
        }
        const resFolders = ['drawable', 'mipmap-anydpi-v26', 'mipmap-hdpi', 'mipmap-mdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi', 'values', 'xml']
        for (let i = 0; i < resFolders.length; i++) {
            const resFolderPath = path.join(targetSrcMainResPath, resFolders[i])
            if (!fs.existsSync(resFolderPath)) {
                fs.mkdirSync(resFolderPath)
            }
        }
    }

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