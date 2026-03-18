import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { getToolErrorPayload } from '../GetToolErrorPayload/GetToolErrorPayload.ts'
import { isAbsoluteUri } from '../IsAbsoluteUri/IsAbsoluteUri.ts'

export const executeWriteFileTool = async (args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<ToolResponse> => {
  const uri = typeof args.uri === 'string' ? args.uri : ''
  const content = typeof args.content === 'string' ? args.content : ''
  if (!uri || !isAbsoluteUri(uri)) {
    return { error: 'Invalid argument: uri must be an absolute file URI.' }
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(uri)
  } catch {
    return { error: 'Invalid argument: invalid URL.' }
  }

  if (parsedUrl.protocol !== 'file:') {
    return { error: 'Invalid argument: uri must be an absolute file URI.' }
  }
  if (!parsedUrl.pathname || !parsedUrl.pathname.startsWith('/')) {
    return { error: 'Invalid argument: uri must be an absolute file URI.' }
  }

  try {
    await RendererWorker.writeFile(uri, content)
    return { ok: true, uri }
  } catch (error) {
    return { ...getToolErrorPayload(error), uri }
  }
}
