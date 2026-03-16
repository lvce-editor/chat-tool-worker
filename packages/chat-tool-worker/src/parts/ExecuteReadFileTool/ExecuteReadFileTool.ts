import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { getToolErrorPayload } from '../GetToolErrorPayload/GetToolErrorPayload.ts'
import { isAbsoluteUri } from '../IsAbsoluteUri/IsAbsoluteUri.ts'
import { isPathTraversalAttempt } from '../IsPathTraversalAttempt/IsPathTraversalAttempt.ts'
import { normalizeRelativePath } from '../NormalizeRelativePath/NormalizeRelativePath.ts'

export const executeReadFileTool = async (args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<ToolResponse> => {
  const uri = typeof args.uri === 'string' ? args.uri : ''
  if (uri) {
    if (!isAbsoluteUri(uri)) {
      return { error: 'Invalid argument: uri must be an absolute URI.' }
    }
    try {
      const content = await RendererWorker.readFile(uri)
      return { content, uri }
    } catch (error) {
      return { ...getToolErrorPayload(error), uri }
    }
  }

  const filePath = typeof args.path === 'string' ? args.path : ''
  if (!filePath || isPathTraversalAttempt(filePath)) {
    return { error: 'Access denied: path must be relative and stay within the open workspace folder.' }
  }
  const normalizedPath = normalizeRelativePath(filePath)
  try {
    const content = await RendererWorker.readFile(normalizedPath)
    return { content, path: normalizedPath }
  } catch (error) {
    return { ...getToolErrorPayload(error), path: normalizedPath }
  }
}
