import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { getInvalidUriErrorPayload, getToolErrorPayload } from '../GetToolErrorPayload/GetToolErrorPayload.ts'
import { isAbsoluteUri } from '../IsAbsoluteUri/IsAbsoluteUri.ts'

export const executeOpenPreviewTool = async (args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<ToolResponse> => {
  const uri = typeof args.uri === 'string' ? args.uri : ''
  if (!uri || !isAbsoluteUri(uri)) {
    return getInvalidUriErrorPayload('uri')
  }
  try {
    await RendererWorker.invoke('Preview.open', uri)
    return { ok: true, uri }
  } catch (error) {
    return { ...getToolErrorPayload(error), uri }
  }
}
