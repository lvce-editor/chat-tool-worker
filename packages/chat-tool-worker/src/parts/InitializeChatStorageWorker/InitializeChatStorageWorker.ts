import { LazyTransferMessagePortRpcParent } from '@lvce-editor/rpc'
import { ChatStorageWorker, RendererWorker } from '@lvce-editor/rpc-registry'
import * as CommandMap from '../CommandMap/CommandMap.ts'

const send = async (port: MessagePort): Promise<void> => {
  await RendererWorker.sendMessagePortToChatStorageWorker(port)
}

export const initializeChatStorageWorker = async (): Promise<void> => {
  const rpc = await LazyTransferMessagePortRpcParent.create({
    commandMap: CommandMap.commandMap,
    send: send,
  })
  ChatStorageWorker.set(rpc)
}
