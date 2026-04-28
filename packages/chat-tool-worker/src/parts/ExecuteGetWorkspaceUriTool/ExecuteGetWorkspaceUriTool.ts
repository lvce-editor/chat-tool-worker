import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { getToolErrorPayload } from '../GetToolErrorPayload/GetToolErrorPayload.ts'
import { normalizeWorkspaceUri } from '../NormalizeWorkspaceUri/NormalizeWorkspaceUri.ts'

export const executeGetWorkspaceUriTool = async (_args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<ToolResponse> => {
  try {
    const workspacePathOrUri = await RendererWorker.getWorkspacePath()
    const workspaceUri = normalizeWorkspaceUri(workspacePathOrUri)
    return { workspaceUri }
  } catch (error) {
    return getToolErrorPayload(error)
  }
}
