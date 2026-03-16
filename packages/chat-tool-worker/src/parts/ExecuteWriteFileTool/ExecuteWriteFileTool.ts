import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions } from '../Types/Types.ts'
import { getToolErrorPayload } from '../GetToolErrorPayload/GetToolErrorPayload.ts'
import { isAbsoluteUri } from '../IsAbsoluteUri/IsAbsoluteUri.ts'

export const executeWriteFileTool = async (args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<string> => {
  const uri = typeof args.uri === 'string' ? args.uri : ''
  const content = typeof args.content === 'string' ? args.content : ''
  if (!uri || !isAbsoluteUri(uri)) {
    return JSON.stringify({ error: 'Invalid argument: uri must be an absolute URI.' })
  }

  try {
    new URL(uri)
  } catch {
    return JSON.stringify({ error: 'Invalid argument: invalid URL.' })
  }

  try {
    await RendererWorker.writeFile(uri, content)
    return JSON.stringify({ ok: true, uri })
  } catch (error) {
    return JSON.stringify({ ...getToolErrorPayload(error), uri })
  }
}
