import { executeChatTool } from '../ExecuteChatTool/ExecuteChatTool.ts'
import { getBasicChatTools } from '../GetBasicChatTools/GetBasicChatTools.ts'
import { handleMessagePort } from '../HandleMessagePort/HandleMessagePort.ts'
import { initialize } from '../Initialize/Initialize.ts'

export const commandMap = {
  'ChatTool.execute': executeChatTool,
  'ChatTool.getTools': getBasicChatTools,
  'ChatTool.initialize': initialize,
  'HandleMessagePort.handleMessagePort': handleMessagePort,
  initialize: (_: string, port: MessagePort): Promise<void> => handleMessagePort(port, true),
}
