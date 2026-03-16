import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { getToolErrorPayload } from '../GetToolErrorPayload/GetToolErrorPayload.ts'

export const executeClosePreviewTool = async (_args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<ToolResponse> => {
  try {
    await RendererWorker.invoke('Preview.close')
    return { ok: true }
  } catch (error) {
    return getToolErrorPayload(error)
  }
}
