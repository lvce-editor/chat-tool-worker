import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { executeClosePreviewTool } from '../ExecuteClosePreviewTool/ExecuteClosePreviewTool.ts'
import { executeEditFileTool } from '../ExecuteEditFileTool/ExecuteEditFileTool.ts'
import { executeGetWorkspaceUriTool } from '../ExecuteGetWorkspaceUriTool/ExecuteGetWorkspaceUriTool.ts'
import { executeListFilesTool } from '../ExecuteListFilesTool/ExecuteListFilesTool.ts'
import { executeOpenEditorTool } from '../ExecuteOpenEditorTool/ExecuteOpenEditorTool.ts'
import { executeOpenPreviewTool } from '../ExecuteOpenPreviewTool/ExecuteOpenPreviewTool.ts'
import { executeReadFileTool } from '../ExecuteReadFileTool/ExecuteReadFileTool.ts'
import { executeRenderHtmlTool } from '../ExecuteRenderHtmlTool/ExecuteRenderHtmlTool.ts'
import { executeSearchTextTool } from '../ExecuteSearchTextTool/ExecuteSearchTextTool.ts'
import { executeWriteFileTool } from '../ExecuteWriteFileTool/ExecuteWriteFileTool.ts'
import { parseToolArguments } from '../ParseToolArguments/ParseToolArguments.ts'

export const executeChatTool = async (name: string, rawArguments: unknown, options: ExecuteToolOptions): Promise<ToolResponse> => {
  const args = parseToolArguments(rawArguments)
  if (name === 'read_file') {
    return executeReadFileTool(args, options)
  }

  if (name === 'write_file') {
    return executeWriteFileTool(args, options)
  }

  if (name === 'edit_file') {
    return executeEditFileTool(args, options)
  }

  if (name === 'list_files') {
    return executeListFilesTool(args, options)
  }

  if (name === 'getWorkspaceUri') {
    return executeGetWorkspaceUriTool(args, options)
  }

  if (name === 'render_html') {
    return executeRenderHtmlTool(args, options)
  }

  if (name === 'open_preview') {
    return executeOpenPreviewTool(args, options)
  }

  if (name === 'openEditor') {
    return executeOpenEditorTool(args, options)
  }

  if (name === 'close_preview') {
    return executeClosePreviewTool(args, options)
  }

  if (name === 'search_text') {
    return executeSearchTextTool(args, options)
  }

  return { error: `Unknown tool: ${name}` }
}
