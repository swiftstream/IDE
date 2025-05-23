import * as fs from 'fs'
import JSON5 from 'json5'
import { Uri } from 'vscode'
import { extensionContext, ExtensionStream, isInContainer, sidebarTreeView } from './extension'
import { Stream } from './streams/stream'
import { isWin } from './helpers/filesHelper'

export var currentToolchain: string = `${getToolchainNameFromURL()}`
export var pendingNewToolchain: string | undefined

export function getToolchainNameFromURL(url: string | undefined = undefined): string | undefined {
    const value: string | undefined = url ?? process.env.S_TOOLCHAIN_URL_X86
    if (!value) return 'undefined'
    return value.split('/').pop()
        ?.replace(/^swift-/, '')
        .replace(/(\.tar\.gz|\.zip)$/, '')
        .replace(/(-ubuntu\d+\.\d+|-aarch64|_x86_64|_aarch64|-a)/g, '')
}

export function setPendingNewToolchain(value: string | undefined) {
    if (!isInContainer() && value) {
        currentToolchain = value
        pendingNewToolchain = undefined
    } else {
        pendingNewToolchain = value
    }
    sidebarTreeView?.refresh()
}

export class Toolchain {
    private path: string = `/swift/toolchains/${currentToolchain}`

    get binPath(): string { return `${this.path}/usr/bin` }
    get libPath(): string { return `${this.path}/usr/lib` }
    get swiftPath(): string { return `${this.binPath}/swift` }

    constructor(private stream: Stream) {}

    async prepare() {

    }

    async checkVersion() {
        const result = await this.stream.bash.execute({
            path: this.swiftPath,
            description: 'check swift toolchain version'
        }, ['--version'])
        const version = result.stdout
        if (version.length == 0)
            throw result.error({ noDetails: true })
        var components = version.split(' version ')
        const right = components[components.length - 1]
        components = right.split(' ')
        // const version = components[0]
    }
}

export function getToolchainsList(): any {
    const path = Uri.joinPath(extensionContext.extensionUri, 'toolchains.json')
    const stringData = fs.readFileSync(isWin ? path.fsPath : path.path, 'utf8')
    return JSON5.parse(stringData)
}

export function getToolchainTags(stream: ExtensionStream): any[] {
    const json = getToolchainsList()
    let key: string = `${stream}`.toLowerCase()
    switch (stream) {
        case ExtensionStream.Android: break
        case ExtensionStream.Web: break
        default: key = 'pure'
    }
    const filtered = json[key]
    return filtered
}

export function findTheRightToolchain(stream: ExtensionStream, swiftVersion: { major: number, minor: number }): {
    name: string,
    version: { major: number, minor: number, patch: number },
    android_version?: string,
    toolchain_urls: {
        aarch64: string,
        x86_64: string
    },
    artifact_url?: string,
    artifact_urls?: {
        wasi: string,
        wasip1_threads: string
    }
} {
    const tags = getToolchainTags(stream).map((x) => {
        x.numberVersion = parseInt(`${x.version.major}${x.version.minor}${x.version.patch}`)
        return x
    })

    const releaseTags = tags.filter((x) => x.name.includes('-RELEASE'))

    // First, try to find matching major version tags
    const matchingMajorTags = releaseTags.filter((x) => x.version.major === swiftVersion.major)

    if (matchingMajorTags.length > 0) {
        // Sort descending by version
        matchingMajorTags.sort((a, b) => b.numberVersion - a.numberVersion)

        // Find the highest minor that fits
        for (const tag of matchingMajorTags) {
            if (tag.version.minor <= swiftVersion.minor) {
                return tag
            }
        }

        // Otherwise fallback to the highest of that major
        return matchingMajorTags[0]
    } else {
        // No matching major: fallback to newest available release tag
        const sortedAllTags = releaseTags.sort((a, b) => b.numberVersion - a.numberVersion)
        return sortedAllTags[0] ?? null
    }
}