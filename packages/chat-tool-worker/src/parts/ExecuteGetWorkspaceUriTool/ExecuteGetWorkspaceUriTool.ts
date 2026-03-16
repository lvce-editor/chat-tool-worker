import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { getToolErrorPayload } from '../GetToolErrorPayload/GetToolErrorPayload.ts'

export const executeGetWorkspaceUriTool = async (_args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<ToolResponse> => {
  try {
    const workspaceUri = await RendererWorker.getWorkspacePath()
    return { workspaceUri }
  } catch (error) {
    return getToolErrorPayload(error)
  }
}
