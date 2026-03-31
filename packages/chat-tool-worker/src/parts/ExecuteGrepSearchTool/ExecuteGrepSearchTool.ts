import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { getToolErrorPayload } from '../GetToolErrorPayload/GetToolErrorPayload.ts'
import { executeFileGrepSearch } from '../ExecuteFileGrepSearch/ExecuteFileGrepSearch.ts'
import { executeMemoryGrepSearch } from '../ExecuteMemoryGrepSearch/ExecuteMemoryGrepSearch.ts'
import { getGrepSearchArgs } from '../GetGrepSearchArgs/GetGrepSearchArgs.ts'
import { getScheme } from '../GetScheme/GetScheme.ts'
import { grepSearchArgumentError } from '../GrepSearchArgumentError/GrepSearchArgumentError.ts'

export const executeGrepSearchTool = async (args: Readonly<Record<string, unknown>>, options: ExecuteToolOptions): Promise<ToolResponse> => {
  const grepSearchArgs = getGrepSearchArgs(args)
  if (!grepSearchArgs) {
    return {
      error: grepSearchArgumentError,
    }
  }

  try {
    const workspaceUri = await RendererWorker.getWorkspacePath()
    const scheme = getScheme(workspaceUri)
    if (scheme === '' || scheme === 'file') {
      return executeFileGrepSearch(workspaceUri, grepSearchArgs)
    }
    return executeMemoryGrepSearch(workspaceUri, grepSearchArgs, options)
  } catch (error) {
    return {
      ...getToolErrorPayload(error),
      arguments: grepSearchArgs,
    }
  }
}
