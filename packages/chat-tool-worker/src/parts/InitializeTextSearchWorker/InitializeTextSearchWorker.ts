import { LazyTransferMessagePortRpcParent } from '@lvce-editor/rpc'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import * as CommandMap from '../CommandMap/CommandMap.ts'

const send = (port: MessagePort): Promise<void> => {
  // TODO
  return RendererWorker.sendMessagePortToTextMeasurementWorker(port)
}
export const initializeTextSearchWorker = async (): Promise<void> => {
  await LazyTransferMessagePortRpcParent.create({
    commandMap: CommandMap.commandMap,
    send,
  })
  // TODO
  // RendererWorker.set(rpc)
}
