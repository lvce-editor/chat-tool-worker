import { MessagePortRpcClient } from '@lvce-editor/rpc'
import * as ToolCommandMap from '../CommandMap/ToolCommandMap.ts'

export const handleMessagePort = async (port: MessagePort): Promise<void> => {
  await MessagePortRpcClient.create({
    commandMap: ToolCommandMap.toolCommandMap,
    messagePort: port,
  })
}
