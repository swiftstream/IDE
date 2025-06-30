import fs from 'fs'
import path from 'path'
import { BashResult } from './bash'
import { print } from './streams/stream'
import { LogLevel, Stream } from './streams/stream'
import { projectDirectory, sidebarTreeView } from './extension'
import { GradleFolder } from './enums/GradleFolder'
import { GradleW } from './gradlew'
import { ShellExecution, Task, TaskExecution, TaskProvider, tasks, TaskScope, Terminal, window } from 'vscode'

export class Gradle {
    private binPath?: string
    cwd: string
    wrapper: GradleW
    
    constructor(
        private stream: Stream,
        private type: GradleFolder
    ) {
        this.cwd = path.join(projectDirectory!, `${type}`)
        this.wrapper = new GradleW(stream, type)
    }

    private async execute(args: string[]): Promise<BashResult> {
        if (!this.binPath)
            this.binPath = await this.stream.bash.which('gradle')
        if (!this.binPath)
            throw 'Path to gradle is undefined'
        print(`executing readelf ${args.join(' ')}`, LogLevel.Unbearable)
        const result = await this.stream.bash.execute({
            path: this.binPath,
            description: `gradle`,
            cwd: this.cwd,
            avoidPrintingError: true
        }, args)
        return result
    }

    isFolderExists = () => fs.existsSync(this.cwd)

    isGeneratingWrapper = false
    generateWrapperTask?: GradleTaskProvider | undefined
    async generateWrapper(options?: { reveal?: boolean }): Promise<boolean> {
        if (!projectDirectory) return false
        if (this.isGeneratingWrapper) return false
        this.generateWrapperTask = new GradleTaskProvider(
            'gradle wrapper',
            `cd ${this.cwd} && gradle wrapper`,
            {
                onStart: () => {
                    this.isGeneratingWrapper = true
                    sidebarTreeView?.refresh()
                },
                onError: (code) => {
                    this.isGeneratingWrapper = false
                    sidebarTreeView?.refresh()
                },
                onSuccess: () => {
                    this.isGeneratingWrapper = false
                    sidebarTreeView?.refresh()
                }
            }
        )
        try {
            await this.generateWrapperTask?.start()
            if (options?.reveal === true) {
                this.generateWrapperTask?.reveal()
            }
            return true
        } catch (error) {
            return false
        }
    }
}

export class GradleTaskProvider implements TaskProvider {
    private taskExecution: TaskExecution | undefined
    private terminal: Terminal | undefined
    task: Task
    
    constructor(
        private name: string,
        private command: string,
        private handlers: {
            onStart?: () => void,
            onError?: (code: number) => void,
            onSuccess?: () => void
        }
    ) {
        this.task = new Task(
            { type: this.name },
            TaskScope.Workspace,
            `Run ${this.name}`,
            this.name,
            new ShellExecution(this.command),
            []
        )
    }

    public provideTasks(): Task[] | undefined {
        return [this.task]
    }

    public resolveTask(_task: Task): Task | undefined {
        return undefined
    }

    public async start(): Promise<{ pid: number }> {
        return new Promise((resolve, reject) => {
            tasks.executeTask(this.task).then(() => {}, (reason) => {
                print(`🕵️‍♂️ Unable to run ${this.name}: ${reason}`, LogLevel.Verbose)
                reject(reason)
            })
            tasks.onDidStartTaskProcess((e) => {
                if (e.execution.task.name === this.task.name) {
                    if (this.handlers.onStart)
                        this.handlers.onStart()
                    this.taskExecution = e.execution
                    this.terminal = window.terminals.find((x) => x.name.includes(this.task.name))
                    resolve({ pid: e.processId })
                }
            })
            tasks.onDidEndTaskProcess((e) => {
                if (e.execution.task.name === this.task.name) {
                    if (e.exitCode === 0) {
                        if (this.handlers.onSuccess)
                            this.handlers.onSuccess()
                    } else {
                        if (this.handlers.onError)
                            this.handlers.onError(e.exitCode ?? -1)
                    }
                }
            })
        })
    }

    public reveal() {
        this.terminal?.show(true)
    }

    public terminate() {
        if (this.taskExecution) {
            this.taskExecution.terminate()
            this.taskExecution = undefined
        } else if (this.terminal) {
            this.terminal.dispose()
            this.terminal = undefined
        }
    }
}