import { PlatformType } from '@lvce-editor/constants'
import { LazyTransferMessagePortRpcParent, WebSocketRpcParent2 } from '@lvce-editor/rpc'
import { RendererWorker, TerminalProcess } from '@lvce-editor/rpc-registry'
import * as CommandMap from '../CommandMap/CommandMap.ts'

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
  const rpc = await WebSocketRpcParent2.create({
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
