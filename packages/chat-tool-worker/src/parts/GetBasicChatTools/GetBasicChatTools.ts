import type { ChatTool } from '../Types/Types.ts'
import { getClosePreviewTool } from './tools/getClosePreviewTool.ts'
import { getCreateDirectoryTool } from './tools/getCreateDirectoryTool.ts'
import { getEditFileTool } from './tools/getEditFileTool.ts'
import { getGetWorkspaceUriTool } from './tools/getGetWorkspaceUriTool.ts'
import { getGlobTool } from './tools/getGlobTool.ts'
import { getGrepSearchTool } from './tools/getGrepSearchTool.ts'
import { getListFilesTool } from './tools/getListFilesTool.ts'
import { getOpenEditorTool } from './tools/getOpenEditorTool.ts'
import { getOpenPreviewTool } from './tools/getOpenPreviewTool.ts'
import { getReadFileTool } from './tools/getReadFileTool.ts'
import { getRenameTool } from './tools/getRenameTool.ts'
import { getRenderHtmlTool } from './tools/getRenderHtmlTool.ts'
import { getRgTool } from './tools/getRgTool.ts'
import { getRunInTerminalTool } from './tools/getRunInTerminalTool.ts'
import { getSearchTextTool } from './tools/getSearchTextTool.ts'
import { getUpdateTodoTool } from './tools/getUpdateTodoTool.ts'
import { getWriteFileTool } from './tools/getWriteFileTool.ts'

export const getBasicChatTools = (): readonly ChatTool[] => {
  return [
    getReadFileTool(),
    getWriteFileTool(),
    getRenameTool(),
    getEditFileTool(),
    getListFilesTool(),
    getGetWorkspaceUriTool(),
    getRenderHtmlTool(),
    getOpenPreviewTool(),
    getOpenEditorTool(),
    getClosePreviewTool(),
    getSearchTextTool(),
    getRgTool(),
    getGrepSearchTool(),
    getRunInTerminalTool(),
    getCreateDirectoryTool(),
    getGlobTool(),
    getUpdateTodoTool(),
  ]
}
