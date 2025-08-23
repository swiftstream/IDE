import * as fs from 'fs'
import { AbortHandler, BashResult } from './bash'
import { WebStream } from './streams/web/webStream'
import { print } from './streams/stream'
import { LogLevel } from './streams/stream'
import { TimeMeasure } from './helpers/timeMeasureHelper'
import { humanFileSize } from './helpers/filesHelper'

export class Gzip {
    private binPath?: string

    constructor(private webStream: WebStream) {}

    private async execute(args: string[], cwd: string, abortHandler: AbortHandler): Promise<BashResult> {
        if (!this.binPath)
            this.binPath = await this.webStream.bash.which('gzip')
        if (!this.binPath)
            throw 'Path to gzip is undefined'
        print(`executing gzip ${args.join(' ')}`, LogLevel.Verbose)
        const result = await this.webStream.bash.execute({
            path: this.binPath!,
            description: `gzip`,
            cwd: cwd,
            abortHandler: abortHandler
        }, args)
        return result
    }

    async compress(options: {
        level?: number,
        filename: string,
        path: string,
        abortHandler: AbortHandler
    }): Promise<BashResult | undefined> {
        const measure = new TimeMeasure()
        print(`🧳 Gzipping ${options.filename}`, LogLevel.Detailed)
        const originalPath = `${options.path}/${options.filename}`
        print(`🧳 Gzipping originalPath: ${originalPath}`, LogLevel.Unbearable)
        const tmpPath = `/tmp/${options.filename}`
        print(`🧳 Gzipping tmpPath: ${tmpPath}`, LogLevel.Unbearable)
        fs.copyFileSync(originalPath, tmpPath)
        print(`🧳 Gzipping copyFileSync: ${originalPath} -> ${tmpPath}`, LogLevel.Unbearable)
        const gzTmpFilePath = `${tmpPath}.gz`
        print(`🧳 Gzipping gzTmpFilePath: ${gzTmpFilePath}`, LogLevel.Unbearable)
        const gzDestFilePath = `${originalPath}.gz`
        print(`🧳 Gzipping gzDestFilePath: ${gzDestFilePath}`, LogLevel.Unbearable)
        const originalSize = fs.statSync(originalPath).size
        const result = await this.execute([options.level ? `-${options.level}` : '-2', '-f', '--keep', tmpPath], '/tmp', options.abortHandler)
        fs.copyFileSync(gzTmpFilePath, gzDestFilePath)
        print(`🧳 Gzipping copyFileSync: ${gzTmpFilePath} -> ${gzDestFilePath}`, LogLevel.Unbearable)
        fs.rmSync(tmpPath)
        fs.rmSync(gzTmpFilePath)
        print(`🧳 Gzipping rmSync: ${gzTmpFilePath}`, LogLevel.Unbearable)
        const newSize = fs.statSync(gzDestFilePath).size
        measure.finish()
        if (options.abortHandler.isCancelled) return undefined
        print(`🧳 Gzipped ${options.filename} ${humanFileSize(originalSize)} → ${humanFileSize(newSize)} in ${measure.time}ms`, LogLevel.Detailed)
        return result
    }
}