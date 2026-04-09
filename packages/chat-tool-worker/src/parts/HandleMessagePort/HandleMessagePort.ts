import { MessagePortRpcClient } from '@lvce-editor/rpc'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import { commandMap } from '../CommandMap/CommandMap.ts'

export const handleMessagePort = async (port: MessagePort, isRendererWorker = false): Promise<void> => {
  const rpc = await MessagePortRpcClient.create({
    commandMap: commandMap,
    messagePort: port,
  })
  if (isRendererWorker) {
    RendererWorker.set(rpc)
  }
}
