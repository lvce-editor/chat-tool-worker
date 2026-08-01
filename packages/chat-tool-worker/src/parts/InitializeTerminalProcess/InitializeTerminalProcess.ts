import { PlatformType } from '@lvce-editor/constants'
import { LazyTransferMessagePortRpcParent, LazyWebSocketRpcParent2, WebSocketRpcParent } from '@lvce-editor/rpc'
import { RendererWorker, TerminalProcess } from '@lvce-editor/rpc-registry'
import * as CommandMap from '../CommandMap/CommandMap.ts'

const commandNotFoundRegex = /command not found|not found/i

const send = async (port: MessagePort): Promise<void> => {
  await RendererWorker.sendMessagePortToTerminalProcess(port, 0)
}

const initializeTerminalProcessElectron = async (): Promise<void> => {
  const rpc = await LazyTransferMessagePortRpcParent.create({
    commandMap: CommandMap.commandMap,
    send: send,
  })
  TerminalProcess.set(rpc)
}

const initializeTerminalProcessRemote = async (): Promise<void> => {
  try {
    const { protocols, url } = (await RendererWorker.invoke('WebSocketCapability.create', 'terminal-process')) as {
      readonly protocols: string[]
      readonly url: string
    }
    const rpc = await WebSocketRpcParent.create({
      commandMap: CommandMap.commandMap,
      webSocket: new WebSocket(url, protocols),
    })
    TerminalProcess.set(rpc)
    return
  } catch (error) {
    if (
      !(
        error instanceof Error &&
        (error.message.includes('WebSocketCapability.create') || error.message.includes('module WebSocketCapability not found')) &&
        commandNotFoundRegex.test(error.message)
      )
    ) {
      throw error
    }
  }
  const rpc = await LazyWebSocketRpcParent2.create({
    commandMap: CommandMap.commandMap,
    type: 'terminal-process',
  })
  TerminalProcess.set(rpc)
}

export const initializeTerminalProcess = async (platform: number): Promise<void> => {
  if (platform === PlatformType.Electron) {
    return initializeTerminalProcessElectron()
  }
  if (platform === PlatformType.Remote) {
    return initializeTerminalProcessRemote()
  }
}
