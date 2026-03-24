import { LazyTransferMessagePortRpcParent } from '@lvce-editor/rpc'
import { FileSystemWorker, RendererWorker } from '@lvce-editor/rpc-registry'
import * as CommandMap from '../CommandMap/CommandMap.ts'

const send = async (port: MessagePort): Promise<void> => {
  await RendererWorker.sendMessagePortToFileSystemWorker(port, 0)
}

export const initializeFileSystemWorker = async (): Promise<void> => {
  const rpc = await LazyTransferMessagePortRpcParent.create({
    commandMap: CommandMap.commandMap,
    send: send,
  })
  FileSystemWorker.set(rpc)
}
