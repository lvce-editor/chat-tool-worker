import { LazyTransferMessagePortRpcParent } from '@lvce-editor/rpc'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import * as CommandMap from '../CommandMap/CommandMap.ts'
import * as TerminalProcess from '../TerminalProcess/TerminalProcess.ts'

const send = async (port: MessagePort): Promise<void> => {
  await RendererWorker.sendMessagePortToTerminalProcess(port, 0)
}

export const initializeTerminalProcess = async (): Promise<void> => {
  const rpc = await LazyTransferMessagePortRpcParent.create({
    commandMap: CommandMap.commandMap,
    send: send,
  })
  TerminalProcess.set(rpc)
}
