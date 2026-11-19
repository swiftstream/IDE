import * as fs from 'fs'
import * as path from 'path'
import JSON5 from 'json5'
import { ServerStream } from '../serverStream'
import { CloudFeature } from './cloudFeature'
import { extensionContext, projectDirectory, sidebarTreeView } from '../../../extension'
import { commands, TreeItemCollapsibleState, window } from 'vscode'
import { Dependency } from '../../../sidebarTreeView'

export class SFTP extends CloudFeature {
    constructor(stream: ServerStream) {
        super(
            stream,
            {
                name: 'SFTP',
                iconFile: 'sftp2',
                featureRepository: '',
                featureName: '', featureVersion: '', featureParams: {},
                configFile: 'sftp.json',
                binFolder: '/usr/bin',
                binName: 'scp'
            }
        )
    }

    registerCommands() {
        super.registerCommands()
        extensionContext.subscriptions.push(commands.registerCommand(this.addServerMenuItem().id, async () => await this.addServer()))
        extensionContext.subscriptions.push(commands.registerCommand(this.quickDeployMenuItem().id, async () => await this.addServer()))
        for (let i = 0; i < 30; i++) {
            extensionContext.subscriptions.push(commands.registerCommand(this.serverDeployMenuItem(i).id, async () => await this.deploy(`${i}`)))
            extensionContext.subscriptions.push(commands.registerCommand(this.serverQuickDeployMenuItem(i).id, async () => await this.quickDeploy(`${i}`)))
            extensionContext.subscriptions.push(commands.registerCommand(this.serverAddressMenuItem(i).id, async () => await this.editServerAddress(i)))
            extensionContext.subscriptions.push(commands.registerCommand(this.serverPortMenuItem(i).id, async () => await this.editServerPort(i)))
            extensionContext.subscriptions.push(commands.registerCommand(this.serverUsernameMenuItem(i).id, async () => await this.editServerUsername(i)))
            extensionContext.subscriptions.push(commands.registerCommand(this.serverAuthMenuItem(i).id, async () => await this.editServerAuth(i)))
            extensionContext.subscriptions.push(commands.registerCommand(this.serverAuthPassMenuItem(i).id, async () => await this.editServerAuthPass(i)))
            extensionContext.subscriptions.push(commands.registerCommand(this.serverTestConnectionMenuItem(i).id, async () => await this.serverTestConnection(i)))
            extensionContext.subscriptions.push(commands.registerCommand(this.serverFolderMenuItem(i).id, async () => await this.editServerFolder(i)))
            extensionContext.subscriptions.push(commands.registerCommand(this.serverRemoteCommandMenuItem(i).id, async () => await this.editServerRemoteCommand(i)))
        }
    }

    serversMenuItem = () => new Dependency({
        id: `SFTPServers||${this.name}`,
        label: 'Servers',
        version: `${this.configItems().length}`,
        state: TreeItemCollapsibleState.Collapsed,
        icon: 'server',
        skipCommand: true
    })

    addServerMenuItem = () => new Dependency({
        id: `AddSFTPServer||${this.name}`,
        label: 'Add Server',
        icon: 'add'
    })

    deployMenuItem() {
        let item = super.deployMenuItem()
        item.label = this.isLoggingIn ? 'Logging in' : this.isDeploying ? 'Deploying' : 'Full Deploy'
        return item
    }

    quickDeployMenuItem = () => new Dependency({
        id: `QuickDeploy||${this.name}`,
        label: this.isLoggingIn ? 'Logging in' : this.isDeploying ? 'Deploying' : 'Quick Deploy',
        version: this.stream.swift.selectedReleaseTarget ? this.stream.swift.selectedReleaseTarget : '',
        icon: this.isLoggingIn || this.isDeploying ? 'sync~spin' : 'symbol-event'
    })

    serverDeployMenuItem = (index: number) => new Dependency({
        id: `SFTPServerItemDeploy||${index}`,
        label: this.isLoggingIn ? 'Logging in' : this.isDeploying ? 'Deploying' : 'Full Deploy',
        version: this.stream.swift.selectedReleaseTarget ? this.stream.swift.selectedReleaseTarget : '',
        icon: this.isLoggingIn || this.isDeploying ? 'sync~spin' : 'cloud-upload'
    })

    serverQuickDeployMenuItem = (index: number) => new Dependency({
        id: `SFTPServerItemQuickDeploy||${index}`,
        label: this.isLoggingIn ? 'Logging in' : this.isQuicklyDeploying ? 'Deploying Quickly' : 'Quick Deploy',
        version: this.stream.swift.selectedReleaseTarget ? this.stream.swift.selectedReleaseTarget : '',
        icon: this.isLoggingIn || this.isQuicklyDeploying ? 'sync~spin' : 'symbol-event'
    })

    serverAddressMenuItem = (index: number, label?: string) => new Dependency({
        id: `SFTPServerItemAddress||${index}`,
        label: `Address`,
        version: `${label}`,
        icon: 'remote'
    })

    serverPortMenuItem = (index: number, value?: string) => new Dependency({
        id: `SFTPServerItemPort||${index}`,
        label: `Port`,
        version: `${value ?? '22'}`,
        icon: 'plug'
    })

    serverUsernameMenuItem = (index: number, value?: string) => new Dependency({
        id: `SFTPServerItemUsername||${index}`,
        label: `Username`,
        version: `${value}`,
        icon: 'account'
    })

    serverAuthMenuItem = (index: number, label?: string) => new Dependency({
        id: `SFTPServerItemAuth||${index}`,
        label: `Auth Mode`,
        version: `${label}`,
        icon: 'key'
    })

    serverAuthPassMenuItem = (index: number, value?: string) => new Dependency({
        id: `SFTPServerItemAuthPass||${index}`,
        label: `Passphrase`,
        version: `${value}`,
        icon: 'shield'
    })

    testConnectionState = 0 // 0 - not testing, 1 - testing, 2 - ok, 3 - failed
    testConnectionStateIcon = () => {
        switch (this.testConnectionState) {
            case 1: return 'sync~spin::charts.yellow'
            case 2: return 'pass::charts.green'
            case 3: return 'error::charts.red'
            default: return 'sync'
        }
    }
    testConnectionStateLabel = () => {
        switch (this.testConnectionState) {
            case 1: return 'Connecting'
            case 2: return 'Connection Works'
            case 3: return 'Connection Failed'
            default: return 'Test Connection'
        }
    }

    serverTestConnectionMenuItem = (index: number) => new Dependency({
        id: `SFTPServerItemTestConnection||${index}`,
        label: this.testConnectionStateLabel(),
        icon: this.testConnectionStateIcon()
    })

    serverFolderMenuItem = (index: number, value?: string) => new Dependency({
        id: `SFTPServerItemFolder||${index}`,
        label: `Destination Path`,
        version: value && value.length > 0 ? `${value}` : 'not set',
        icon: value && value.length > 0 ? 'folder' : 'folder::charts.red'
    })

    serverRemoteCommandMenuItem = (index: number, value?: string) => new Dependency({
        id: `SFTPServerItemRemoteCommand||${index}`,
        label: `Remote Command`,
        version: `${value}`,
        icon: 'repl'
    })

    async featureMenuItems(): Promise<Dependency[]> {
        let items: Dependency[] = []
        items.push(this.deployMenuItem())
        items.push(this.quickDeployMenuItem())
        items.push(this.serversMenuItem())
        return items
    }

    async customItems(element: Dependency): Promise<Dependency[]> {
        if (element.id == this.serversMenuItem().id) {
            return [
                this.addServerMenuItem(),
                ...this.configItems().map((server, index) => {
                    return new Dependency({
                        id: `SFTPServerItem||${index}`,
                        label: `${server.label ?? server.server ?? `Server ${index + 1}`}`,
                        state: TreeItemCollapsibleState.Collapsed,
                        icon: 'server-environment',
                        skipCommand: true
                    })
                })
            ]
        } else if (element.id.startsWith('SFTPServerItem||')) {
            const index = parseInt(element.id.replace('SFTPServerItem||', ''))
            const server = this.configItems()[index]
            return [
                this.serverDeployMenuItem(index),
                this.serverQuickDeployMenuItem(index),
                this.serverAddressMenuItem(index, server.server), // TODO: values
                this.serverPortMenuItem(index, `${server.port}`),
                this.serverUsernameMenuItem(index, server.username ?? 'root'),
                this.serverAuthMenuItem(index, server.authkey ? `${server.authkey}` : 'without key'),
                this.serverAuthPassMenuItem(index, server.password ? 'provided' : 'not set'),
                this.serverTestConnectionMenuItem(index),
                this.serverFolderMenuItem(index, server.destinationPath ? `${server.destinationPath}` : ''),
                this.serverRemoteCommandMenuItem(index, server.remoteCommand ? `${server.remoteCommand}` : 'not set')
            ]
        }
        return await super.customItems(element)
    }

    configItems(): any[] {
        const content = fs.readFileSync(this.configPath(), 'utf8')
        const config = JSON5.parse(content)
        return config?.items ?? []
    }

    async addServer() {
        window.showInputBox({})
        await window.showQuickPick([], {
            title: 'Enter server label',
            placeHolder: 'e.g. MySuperServer'
        })
    }

    async editServerAddress(index: number) {

    }

    async editServerPort(index: number) {

    }

    async editServerUsername(index: number) {

    }

    async editServerAuth(index: number) {

    }

    async editServerAuthPass(index: number) {

    }

    async editServerFolder(index: number) {

    }

    async editServerRemoteCommand(index: number) {

    }

    async serverTestConnection(index: number) {

    }

    // MARK: Deploy

    isQuicklyDeploying = false
    deployingTo: number | undefined = undefined

    async deploy(selectedProjectId?: string): Promise<boolean | undefined> {
        if (!selectedProjectId) return
        const index = parseInt(selectedProjectId)
        // TODO
    }

    async quickDeploy(selectedProjectId?: string) {
        if (!selectedProjectId) return
        const index = parseInt(selectedProjectId)
        // TODO
    }

    isInUse(): boolean {
        if (!this.isInstalled) return false
        return true
    }

    projectFeatureFolderPath(): string { return this.devcontainerPath() }

    requiresSetup(): boolean { return !this.isConfigPresent() }

    updateIsInstalled() {
        this.isInstalled = this.isConfigPresent()
    }

    async integrate(): Promise<boolean> {
        switch (await window.showQuickPick([ 'Yes', 'No' ], { placeHolder: `Would you like to install ${this.name}?` })) {
        case 'Yes': break
        default: return false
        }
        const data = []
        const content = JSON.stringify(data, null, '\t')
        fs.writeFileSync(this.configPath(), content, 'utf8')
        this.updateIsInstalled()
        sidebarTreeView?.refresh()
        return true
    }

    async deintegrate(): Promise<boolean> {
        if (this.isDeintegrating) return false
        this.isDeintegrating = true
        sidebarTreeView?.refresh()
        const answer = await window.showWarningMessage(`Are you sure you want to deintegrate ${this.name} from the project? This will completely delete the ${this.configFile}`, 'Yes, deintegrate')
        if (answer != 'Yes, deintegrate') {
            this.isDeintegrating = false
            sidebarTreeView?.refresh()
            return false
        }
        const pathToRemove = this.configPath()
        if (fs.existsSync(pathToRemove))
            fs.rmSync(pathToRemove)
        this.updateIsInstalled()
        this.isDeintegrating = false
        sidebarTreeView?.refresh()
        return true
    }
}