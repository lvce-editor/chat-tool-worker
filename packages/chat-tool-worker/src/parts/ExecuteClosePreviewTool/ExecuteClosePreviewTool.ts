import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions } from '../Types/Types.ts'
import { getToolErrorPayload } from '../GetToolErrorPayload/GetToolErrorPayload.ts'

export const executeClosePreviewTool = async (_args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<string> => {
  try {
    await RendererWorker.invoke('Preview.close')
    return JSON.stringify({ ok: true })
  } catch (error) {
    return JSON.stringify(getToolErrorPayload(error))
  }
}
