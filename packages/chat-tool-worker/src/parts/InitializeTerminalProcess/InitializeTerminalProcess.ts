import { LazyTransferMessagePortRpcParent } from '@lvce-editor/rpc'
// @ts-ignore
import { RendererWorker, TerminalProcess } from '@lvce-editor/rpc-registry'
import * as CommandMap from '../CommandMap/CommandMap.ts'

const send = async (port: MessagePort): Promise<void> => {
  // @ts-ignore
  await RendererWorker.sendMessagePortToTerminalProcess(port)
}

export const initializeTerminalProcess = async (): Promise<void> => {
  const rpc = await LazyTransferMessagePortRpcParent.create({
    commandMap: CommandMap.commandMap,
    send: send,
  })
  TerminalProcess.set(rpc)
}
