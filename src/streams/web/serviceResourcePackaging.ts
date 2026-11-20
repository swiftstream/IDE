import * as fs from 'fs'
import * as path from 'path'

export const serviceImagesDirectoryName = 'images'

export interface ServiceImageCopyRecord {
    relativePath: string,
    overwritten: boolean
}

export interface ServiceImageCopyResult {
    copiedFiles: ServiceImageCopyRecord[],
    skippedEntries: string[]
}

export function makePWAServiceTarget() {
    return {
        type: 'executableTarget',
        name: 'Service',
        dependencies: [
            '.product(name: "ServiceWorker", package: "web")'
        ],
        exclude: [
            serviceImagesDirectoryName
        ]
    }
}

export function getServiceImagesPaths(
    projectDirectory: string,
    serviceWorkerTargetName: string,
    outputFolder: string
) {
    return {
        sourceDirectory: path.join(
            projectDirectory,
            'Sources',
            serviceWorkerTargetName,
            serviceImagesDirectoryName
        ),
        destinationDirectory: path.join(
            projectDirectory,
            outputFolder,
            serviceImagesDirectoryName
        )
    }
}

export function copyServiceImages(
    sourceDirectory: string,
    destinationDirectory: string
): ServiceImageCopyResult {
    const result: ServiceImageCopyResult = {
        copiedFiles: [],
        skippedEntries: []
    }

    let sourceStats: fs.Stats
    try {
        sourceStats = fs.lstatSync(sourceDirectory)
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return result
        throw error
    }

    if (!sourceStats.isDirectory()) {
        result.skippedEntries.push('.')
        return result
    }

    function copyDirectory(currentSourceDirectory: string, currentDestinationDirectory: string) {
        fs.mkdirSync(currentDestinationDirectory, { recursive: true })
        const entries = fs.readdirSync(currentSourceDirectory).sort()
        for (const entry of entries) {
            const sourcePath = path.join(currentSourceDirectory, entry)
            const destinationPath = path.join(currentDestinationDirectory, entry)
            const relativePath = path.relative(sourceDirectory, sourcePath)
            const entryStats = fs.lstatSync(sourcePath)

            if (entryStats.isSymbolicLink()) {
                result.skippedEntries.push(relativePath)
                continue
            }

            if (entryStats.isDirectory()) {
                copyDirectory(sourcePath, destinationPath)
                continue
            }

            if (!entryStats.isFile()) {
                result.skippedEntries.push(relativePath)
                continue
            }

            fs.mkdirSync(path.dirname(destinationPath), { recursive: true })
            let destinationStats: fs.Stats | undefined
            try {
                destinationStats = fs.lstatSync(destinationPath)
            } catch (error) {
                if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
            }
            if (destinationStats && !destinationStats.isFile()) {
                throw new Error('Cannot overwrite non-regular Service image destination: ' + destinationPath)
            }

            fs.copyFileSync(sourcePath, destinationPath)
            result.copiedFiles.push({
                relativePath,
                overwritten: destinationStats !== undefined
            })
        }
    }

    copyDirectory(sourceDirectory, destinationDirectory)
    result.copiedFiles.sort((left, right) => {
        if (left.relativePath < right.relativePath) return -1
        if (left.relativePath > right.relativePath) return 1
        return 0
    })
    result.skippedEntries.sort()
    return result
}

export function runWebResourceTransportSequence(options: {
    transportBundledResources: () => void,
    isCancelled: () => boolean,
    transportServiceImages: () => void
}): 'completed' | 'cancelled' {
    options.transportBundledResources()
    if (options.isCancelled()) return 'cancelled'
    options.transportServiceImages()
    return 'completed'
}
