import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { getInvalidUriErrorPayload, getInvalidUrlErrorPayload, getToolErrorPayload } from '../GetToolErrorPayload/GetToolErrorPayload.ts'
import { isAbsoluteUri } from '../IsAbsoluteUri/IsAbsoluteUri.ts'
import { isValidUri } from '../IsValidUri/IsValidUri.ts'

export const executeCreateDirectoryTool = async (args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<ToolResponse> => {
  const uri = typeof args.uri === 'string' ? args.uri : ''
  if (!uri || !isAbsoluteUri(uri)) {
    return getInvalidUriErrorPayload('uri')
  }

  if (!isValidUri(uri)) {
    return getInvalidUrlErrorPayload()
  }

  try {
    await RendererWorker.invoke('FileSystem.mkdir', uri)
    return { ok: true, uri }
  } catch (error) {
    return { ...getToolErrorPayload(error), uri }
  }
}
