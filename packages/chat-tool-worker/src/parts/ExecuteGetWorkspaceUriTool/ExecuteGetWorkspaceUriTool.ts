import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { getToolErrorPayload } from '../GetToolErrorPayload/GetToolErrorPayload.ts'
import { isAbsoluteFileSystemPath } from '../IsAbsoluteFileSystemPath/IsAbsoluteFileSystemPath.ts'

const windowsDrivePathRegex = /^[a-zA-Z]:[\\/]/

const normalizeWorkspaceUri = (workspacePathOrUri: string): string => {
  if (!isAbsoluteFileSystemPath(workspacePathOrUri)) {
    return workspacePathOrUri
  }
  const url = new URL('file:///')
  url.pathname = windowsDrivePathRegex.test(workspacePathOrUri) ? `/${workspacePathOrUri.replaceAll('\\', '/')}` : workspacePathOrUri
  return url.href
}

export const executeGetWorkspaceUriTool = async (_args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<ToolResponse> => {
  try {
    const workspacePathOrUri = await RendererWorker.getWorkspacePath()
    const workspaceUri = normalizeWorkspaceUri(workspacePathOrUri)
    return { workspaceUri }
  } catch (error) {
    return getToolErrorPayload(error)
  }
}
