import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { executeClosePreviewTool } from '../ExecuteClosePreviewTool/ExecuteClosePreviewTool.ts'
import { executeCreateDirectoryTool } from '../ExecuteCreateDirectoryTool/ExecuteCreateDirectoryTool.ts'
import { executeEditFileTool } from '../ExecuteEditFileTool/ExecuteEditFileTool.ts'
import { executeGetWorkspaceUriTool } from '../ExecuteGetWorkspaceUriTool/ExecuteGetWorkspaceUriTool.ts'
import { executeGlobTool } from '../ExecuteGlobTool/ExecuteGlobTool.ts'
import { executeGrepSearchTool } from '../ExecuteGrepSearchTool/ExecuteGrepSearchTool.ts'
import { executeListFilesTool } from '../ExecuteListFilesTool/ExecuteListFilesTool.ts'
import { executeOpenEditorTool } from '../ExecuteOpenEditorTool/ExecuteOpenEditorTool.ts'
import { executeOpenPreviewTool } from '../ExecuteOpenPreviewTool/ExecuteOpenPreviewTool.ts'
import { executeReadFileTool } from '../ExecuteReadFileTool/ExecuteReadFileTool.ts'
import { executeRenameTool } from '../ExecuteRenameTool/ExecuteRenameTool.ts'
import { executeRenderHtmlTool } from '../ExecuteRenderHtmlTool/ExecuteRenderHtmlTool.ts'
import { executeRgTool } from '../ExecuteRgTool/ExecuteRgTool.ts'
import { executeRunInTerminalTool } from '../ExecuteRunInTerminalTool/ExecuteRunInTerminalTool.ts'
import { executeSearchTextTool } from '../ExecuteSearchTextTool/ExecuteSearchTextTool.ts'
import { executeUpdateTodoTool } from '../ExecuteUpdateTodoTool/ExecuteUpdateTodoTool.ts'
import { executeWriteFileTool } from '../ExecuteWriteFileTool/ExecuteWriteFileTool.ts'
import { parseToolArguments } from '../ParseToolArguments/ParseToolArguments.ts'

export const executeChatTool = async (name: string, rawArguments: unknown, options: ExecuteToolOptions): Promise<ToolResponse> => {
  const args = parseToolArguments(rawArguments)
  switch (name) {
    case 'close_preview':
      return executeClosePreviewTool(args, options)
    case 'create_directory':
      return executeCreateDirectoryTool(args, options)
    case 'edit_file':
      return executeEditFileTool(args, options)
    case 'getWorkspaceUri':
      return executeGetWorkspaceUriTool(args, options)
    case 'glob':
      return executeGlobTool(args, options)
    case 'grep_search':
      return executeGrepSearchTool(args, options)
    case 'list_files':
      return executeListFilesTool(args, options)
    case 'open_preview':
      return executeOpenPreviewTool(args, options)
    case 'openEditor':
      return executeOpenEditorTool(args, options)
    case 'read_file':
      return executeReadFileTool(args, options)
    case 'rename':
      return executeRenameTool(args, options)
    case 'render_html':
      return executeRenderHtmlTool(args, options)
    case 'rg':
      return executeRgTool(args, options)
    case 'run_in_terminal':
      return executeRunInTerminalTool(args, options)
    case 'search_text':
      return executeSearchTextTool(args, options)
    case 'update_todo':
      return executeUpdateTodoTool(args, options)
    case 'write_file':
      return executeWriteFileTool(args, options)
    default:
      return { error: `Unknown tool: ${name}` }
  }
}
