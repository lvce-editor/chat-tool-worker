import { isAbsoluteFileSystemPath } from '../IsAbsoluteFileSystemPath/IsAbsoluteFileSystemPath.ts'

const windowsDrivePathRegex = /^[a-zA-Z]:[\\/]/

export const normalizeWorkspaceUri = (workspacePathOrUri: string): string => {
  if (!isAbsoluteFileSystemPath(workspacePathOrUri)) {
    return workspacePathOrUri
  }
  const url = new URL('file:///')
  url.pathname = windowsDrivePathRegex.test(workspacePathOrUri) ? `/${workspacePathOrUri.replaceAll('\\', '/')}` : workspacePathOrUri
  return url.href
}
