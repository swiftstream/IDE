import * as fs from 'fs'
import * as path from 'path'

export const javaScriptKitFallbackTslib = 'tslib@2.8.1'

export interface JavaScriptKitBuildState {
    force: boolean
    packageModulesPresent: boolean
    runtimePresent: boolean
    packageWasModified: boolean
}

export interface JavaScriptKitBuildActions {
    shouldSkip: boolean
    installPackageDependencies: boolean
    buildRuntime: boolean
}

export function getJavaScriptKitBuildActions(state: JavaScriptKitBuildState): JavaScriptKitBuildActions {
    return {
        shouldSkip: !state.force && state.packageModulesPresent && state.runtimePresent && !state.packageWasModified,
        installPackageDependencies: !state.packageModulesPresent || state.packageWasModified,
        buildRuntime: !state.packageModulesPresent || !state.runtimePresent || state.packageWasModified
    }
}

export function missingJavaScriptKitBuildDependencies(jsKitPath: string): string[] {
    return fs.existsSync(path.join(jsKitPath, 'node_modules', 'tslib'))
        ? []
        : [javaScriptKitFallbackTslib]
}

export function javaScriptKitFallbackInstallArguments(): string[] {
    return [javaScriptKitFallbackTslib, '--no-save', '--package-lock=false']
}
