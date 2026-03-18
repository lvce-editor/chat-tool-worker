import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { getToolErrorPayload } from '../GetToolErrorPayload/GetToolErrorPayload.ts'
import { resolveToolUri } from '../ResolveToolUri/ResolveToolUri.ts'

export const executeWriteFileTool = async (args: Readonly<Record<string, unknown>>, options: ExecuteToolOptions): Promise<ToolResponse> => {
  const rawUri = typeof args.uri === 'string' ? args.uri : ''
  const content = typeof args.content === 'string' ? args.content : ''
  const uriResult = resolveToolUri(rawUri, options.workspaceUri || '')
  if ('error' in uriResult) {
    return { error: uriResult.error }
  }
  const { uri } = uriResult

  try {
    new URL(uri)
  } catch {
    return { error: 'Invalid argument: invalid URL.' }
  }

  try {
    await RendererWorker.writeFile(uri, content)
    return { ok: true, uri }
  } catch (error) {
    return { ...getToolErrorPayload(error), uri }
  }
}
