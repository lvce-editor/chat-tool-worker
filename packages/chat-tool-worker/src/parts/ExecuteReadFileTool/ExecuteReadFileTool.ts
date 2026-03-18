import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { getToolErrorPayload } from '../GetToolErrorPayload/GetToolErrorPayload.ts'
import { resolveToolUri } from '../ResolveToolUri/ResolveToolUri.ts'

export const executeReadFileTool = async (args: Readonly<Record<string, unknown>>, options: ExecuteToolOptions): Promise<ToolResponse> => {
  const rawUri = typeof args.uri === 'string' ? args.uri : ''
  const uriResult = resolveToolUri(rawUri, options.workspaceUri || '')
  if ('error' in uriResult) {
    return { error: uriResult.error }
  }
  const { uri } = uriResult
  try {
    const content = await RendererWorker.readFile(uri)
    return { content, uri }
  } catch (error) {
    return { ...getToolErrorPayload(error), uri }
  }
}
