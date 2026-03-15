import { executeChatTool } from '../ExecuteChatTool/ExecuteChatTool.ts'
import { getBasicChatTools } from '../GetBasicChatTools/GetBasicChatTools.ts'
import { handleMessagePort } from '../HandleMessagePort/HandleMessagePort.ts'

export const commandMap = {
  'ChatTool.execute': executeChatTool,
  'ChatTool.getTools': getBasicChatTools,
  'HandleMessagePort.handleMessagePort': handleMessagePort,
}
