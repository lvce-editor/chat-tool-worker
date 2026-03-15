import { executeChatTool } from '../ExecuteChatTool/ExecuteChatTool.ts'
import { handleMessagePort } from '../HandleMessagePort/HandleMessagePort.ts'

export const commandMap = {
  'ChatTool.execute': executeChatTool,
  'HandleMessagePort.handleMessagePort': handleMessagePort,
}
