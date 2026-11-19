export interface WasiBuildConfiguration {
    swiftSDK: string
    targetTriple: string
}

const legacyWasiBuildConfiguration: WasiBuildConfiguration = {
    swiftSDK: 'wasm32-unknown-wasi',
    targetTriple: 'wasm32-unknown-wasi'
}

export function getWasiBuildConfiguration(v5Mode: boolean, artifactURL: string | undefined): WasiBuildConfiguration {
    if (v5Mode || !artifactURL) return legacyWasiBuildConfiguration

    let artifactName: string
    try {
        artifactName = pathBasename(new URL(artifactURL).pathname)
    } catch {
        return legacyWasiBuildConfiguration
    }

    const match = /^(swift-.+_wasm)\.artifactbundle\.(?:tar\.gz|zip)$/.exec(artifactName)
    if (!match) return legacyWasiBuildConfiguration

    return {
        swiftSDK: match[1],
        targetTriple: 'wasm32-unknown-wasip1'
    }
}

function pathBasename(pathname: string): string {
    return pathname.slice(pathname.lastIndexOf('/') + 1)
}
