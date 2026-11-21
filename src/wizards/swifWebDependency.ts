export const swifWebMinimumVersion = '2.0.0-nightly.14'

export function swifWebPackageDependency(repository: string): string {
    return `.package(url: "${repository}/web", from: "${swifWebMinimumVersion}")`
}
