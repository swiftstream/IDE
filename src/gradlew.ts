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
        const env = await this.stream.bash.getShellEnv()
        // Filter out problematic variables and create export statements
        const safeEnvEntries = Object.entries(env)
        .filter(([key, value]) => key && value && !key.includes('LESS') && !key.includes('VSCODE_NLS_CONFIG'))
        .map(([key, value]) => `export ${key}='${value?.toString().replace(/'/g, "'\\''")}'`)
        .join('\n')
        const tempEnvFile = `/tmp/gradle_env_${Date.now()}.sh`
        this.assembleTask = new GradleTaskProvider(
            'gradlew assemble',
            `cat > '${tempEnvFile}' << 'EOF'\n${safeEnvEntries}\nEOF\n` +
            `. '${tempEnvFile}' && cd '${this.cwd.replace(/'/g, "'\\''")}'` +
            ` && ${this.binPath} assemble${options.configuration} && rm '${tempEnvFile}'`,
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