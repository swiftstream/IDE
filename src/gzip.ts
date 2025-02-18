import * as fs from 'fs'
import { BashResult } from './bash'
import { WebStream } from './streams/web/webStream'
import { print } from './streams/stream'
import { LogLevel } from './streams/stream'
import { TimeMeasure } from './helpers/timeMeasureHelper'
import { humanFileSize } from './helpers/filesHelper'

export class Gzip {
    private binPath?: string

    constructor(private webStream: WebStream) {}

    private async execute(args: string[], cwd: string): Promise<BashResult> {
        if (!this.binPath)
            this.binPath = await this.webStream.bash.which('gzip')
        if (!this.binPath)
            throw 'Path to gzip is undefined'
        print(`executing gzip ${args.join(' ')}`, LogLevel.Verbose)
        const result = await this.webStream.bash.execute({
            path: this.binPath!,
            description: `gzip`,
            cwd: cwd,
            isCancelled: () => false
        }, args)
        return result
    }

    async compress(options: {
        level?: number,
        filename: string,
        path: string
    }): Promise<BashResult> {
        const measure = new TimeMeasure()
        print(`🧳 Gzipping ${options.filename}`, LogLevel.Detailed)
        const filePath = `${options.path}/${options.filename}`
        const gzFilePath = `${options.path}/${options.filename}.gz`
        const originalSize = fs.statSync(filePath).size
        const result = await this.execute([options.level ? `-${options.level}` : '-2', '-f', '--keep', options.filename], options.path)
        const newSize = fs.statSync(gzFilePath).size
        measure.finish()
        print(`🧳 Gzipped ${options.filename} ${humanFileSize(originalSize)} → ${humanFileSize(newSize)} in ${measure.time}ms`, LogLevel.Detailed)
        return result
    }
}