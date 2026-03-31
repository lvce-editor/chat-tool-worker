import { getFilePathFromUri } from './GetFilePathFromUri.ts'
import { getScheme } from './GetScheme.ts'
import { isAbsoluteFileSystemPath } from './IsAbsoluteFileSystemPath.ts'
import { isFileUri } from './IsFileUri.ts'

export const getSearchDir = (workspaceUri: string, includePattern?: string): string => {
  if (!includePattern) {
    return getScheme(workspaceUri) === 'file' ? getFilePathFromUri(workspaceUri) : workspaceUri
  }
  if (isFileUri(includePattern)) {
    return getFilePathFromUri(includePattern)
  }
  if (isAbsoluteFileSystemPath(includePattern)) {
    return includePattern
  }
  return getScheme(workspaceUri) === 'file' ? getFilePathFromUri(workspaceUri) : workspaceUri
}
