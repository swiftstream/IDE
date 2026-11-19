import { commands, TextDocument, window } from 'vscode'
import { Dependency, SideTreeItem } from '../../sidebarTreeView'
import { defaultServerPort, extensionContext, innerServerPort, isInContainer, projectDirectory, sidebarTreeView } from '../../extension'
import { readServerPortsFromDevContainer } from '../../helpers/readPortsFromDevContainer'
import { Nginx } from './features/nginx'
import { Ngrok } from './features/ngrok'
import { AnyFeature } from '../anyFeature'
import { DevContainerConfig } from '../../devContainerConfig'
import { PureStream } from '../pure/pureStream'
import { FlyIO } from './features/flyio'
import { LogLevel, print } from '../stream'
import { SFTP } from './features/sftp'

export var currentPort: string = `${defaultServerPort}`
export var pendingNewPort: string | undefined

export class ServerStream extends PureStream {
    public nginx: Nginx
    public ngrok: Ngrok
    public flyio: FlyIO
    public sftp: SFTP

    constructor(overrideConfigure: boolean = false) {
        super(true)
        this.nginx = new Nginx(this)
        this.ngrok = new Ngrok(this)
        this.flyio = new FlyIO(this)
        this.sftp = new SFTP(this)
        if (!overrideConfigure) this.configure()
    }

    configure() {
        super.configure()
        const readPorts = readServerPortsFromDevContainer()
        currentPort = `${readPorts.port ?? defaultServerPort}`
    }
        
    setPendingNewPort(value: string | undefined) {
        if (!isInContainer() && value) {
            currentPort = value
            pendingNewPort = undefined
        } else {
            pendingNewPort = value
        }
        sidebarTreeView?.refresh()
    }

    registerCommands() {
		super.registerCommands()
        extensionContext.subscriptions.push(commands.registerCommand(SideTreeItem.Port, async () => { await this.changePort() }))
    }
    
    async onDidSaveTextDocument(document: TextDocument): Promise<boolean> {
		if (await super.onDidSaveTextDocument(document)) return true
		if (!isInContainer) return false
        if (document.uri.scheme === 'file') {
            const devContainerPath = `${projectDirectory}/.devcontainer/devcontainer.json`
            if (document.languageId === 'jsonc' && document.uri.scheme === 'file') {
                // devcontainer.json
                if (document.uri.path == devContainerPath) {
                    print(`ServerStream detected changes in devcontainer file`, LogLevel.Unbearable)
                    const readPorts = readServerPortsFromDevContainer()
                    if (readPorts.portPresent && `${readPorts.port}` != currentPort) {
                        this.setPendingNewPort(`${readPorts.port}`)
                    } else {
                        this.setPendingNewPort(undefined)
                    }
                    return true
                }
            }
        }
        return false
    }

    // MARK: Port

    async changePort() {
        const port = await window.showInputBox({
            value: `${pendingNewPort ? pendingNewPort : currentPort}`,
            placeHolder: 'Please select another port for the app',
            validateInput: text => {
                const value = parseInt(text)
                if (value < 80)
                    return 'Should be >= 80'
                if (value > 65534)
                    return 'Should be < 65535'
                return isNaN(parseInt(text)) ? 'Port should be a number' : null
            }
        })
        if (!port) return
        const portToReplace = pendingNewPort ? pendingNewPort : currentPort
        if (port == portToReplace) return
        DevContainerConfig.transaction((c) => c.addOrChangePort(port, `${innerServerPort}`))
        pendingNewPort = port
        sidebarTreeView?.refresh()
    }

    // MARK: Features

	features(): AnyFeature[] {
        return [
            ...super.features(),
            this.nginx,
            this.ngrok,
            this.flyio,
            // this.sftp
        ]
    }

    // TODO: fix SwifWeb, when getting index and it is not used in the App's declaration it throws error: unwrapping optional value is nil and it is visible in Unbearable log mode at phase 9

    // TODO: not all features should be at the root
    //       some of ThemeColor, like an extension for
    //       lang files automatic generation should stay inside Features

    // TODO: make MULTI stream type
    //       where "target" is at the top of the items
    //       and user should be able to add targets
    //       and build/run any target (pure,server,web,android,embedded)

    // TODO: make sure mimalloc is used for musl (or even glibc?)
    // TODO: Debug menu items: Arguments: additional arguments for build/run
    // TODO: remember about FoundationEssentials to reduce binary size https://github.com/apple/swift-argument-parser/pull/674

    // TODO: deploy by SFTP (конфигурации в JSON)
    // TODO: deploy to fly.io
    // TODO: after login propose to continue to deploy
    // TODO: use swift.org API https://www.swift.org/openapi/
    // TODO: в веб-режиме: RecompileNative/RecompileWASI
    // TODO:               switch normal/wasip16threads

    // TODO: List all TODOs
    // TODO: packages explorer as a dedicated TreeView on the sidebar
    // TODO:                   mode: all packages in list / by dependencies (like in swiftlang extension)
    // TODO:                   right click on package to edit: calls swift package edit <package-name>

    // MARK: Side Bar Tree View Items

    async maintenanceItems(): Promise<Dependency[]> {
        let items: Dependency[] = []
        if (this.nginx.isInUse()) {

        }
        return [...items, ...(await super.maintenanceItems())]
    }
    async settingsItems(): Promise<Dependency[]> {
        return [
            new Dependency({
                id: SideTreeItem.Port,
                label: 'Port',
                version: `${currentPort} ${pendingNewPort && pendingNewPort != currentPort ? `(${pendingNewPort} pending reload)` : ''}`,
                icon: 'radio-tower'
            }),
            ...(await super.settingsItems())
        ]
    }
}