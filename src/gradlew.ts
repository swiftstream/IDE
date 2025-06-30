import fs from 'fs'
import path from 'path'
import { BashResult } from './bash'
import { print } from './streams/stream'
import { LogLevel, Stream } from './streams/stream'
import { projectDirectory, sidebarTreeView } from './extension'
import { SchemeBuildConfiguration } from './androidStreamConfig'
import { GradleFolder } from './enums/GradleFolder'
import { GradleTaskProvider } from './gradle'

export class GradleW {
    binPath: string
    cwd: string

    constructor(
        private stream: Stream,
        type: GradleFolder
    ) {
        this.binPath = path.join(projectDirectory!, `${type}`, 'gradlew')
        this.cwd = path.join(projectDirectory!, `${type}`)
    }

    private async execute(args: string[]): Promise<BashResult> {
        print(`executing gradlew ${args.join(' ')}`, LogLevel.Unbearable)
        const result = await this.stream.bash.execute({
            path: this.binPath,
            description: `gradlew`,
            cwd: this.cwd,
            avoidPrintingError: true
        }, args)
        return result
    }

    isExists = () => fs.existsSync(this.binPath)

    // Assemble

    isAssembling = false
    assembleTask?: GradleTaskProvider | undefined
    async assemble(options: {
        configuration: SchemeBuildConfiguration,
        reveal?: boolean
    }): Promise<boolean> {
        if (this.isAssembling) return false
        this.assembleTask = new GradleTaskProvider(
            'gradlew assemble',
            `cd ${this.cwd} && ${this.binPath} assemble${options.configuration}`,
            {
                onStart: () => {
                    this.isAssembling = true
                    sidebarTreeView?.refresh()
                },
                onError: (code) => {
                    this.isAssembling = false
                    sidebarTreeView?.refresh()
                },
                onSuccess: () => {
                    this.isAssembling = false
                    sidebarTreeView?.refresh()
                }
            }
        )
        try {
            await this.assembleTask?.start()
            if (options?.reveal === true) {
                this.assembleTask?.reveal()
            }
            return true
        } catch (error) {
            return false
        }
    }
}