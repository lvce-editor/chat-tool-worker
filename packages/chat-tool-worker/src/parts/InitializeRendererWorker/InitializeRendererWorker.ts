import { WebWorkerRpcClient2 } from '@lvce-editor/rpc'
import * as CommandMap from '../CommandMap/CommandMap.ts'

export const initializeRendererWorker = async (): Promise<void> => {
  await WebWorkerRpcClient2.create({
    commandMap: CommandMap.commandMap,
  })
}
