import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { getToolErrorPayload } from '../GetToolErrorPayload/GetToolErrorPayload.ts'
import { isAbsoluteUri } from '../IsAbsoluteUri/IsAbsoluteUri.ts'

export const executeListFilesTool = async (args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<ToolResponse> => {
  const uri = typeof args.uri === 'string' ? args.uri : ''
  if (!uri || !isAbsoluteUri(uri)) {
    return { error: 'Invalid argument: uri must be an absolute URI.' }
  }
  try {
    const entries = await RendererWorker.invoke('FileSystem.readDirWithFileTypes', uri)
    return { entries, uri }
  } catch (error) {
    return { ...getToolErrorPayload(error), uri }
  }
}
