import { handleMessagePort } from '../HandleMessagePort/HandleMessagePort.ts'
import * as ToolCommandMap from './ToolCommandMap.ts'

export const commandMap = {
  ...ToolCommandMap.toolCommandMap,
  'HandleMessagePort.handleMessagePort': handleMessagePort,
}
