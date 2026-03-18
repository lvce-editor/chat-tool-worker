import { isAbsoluteUri } from '../IsAbsoluteUri/IsAbsoluteUri.ts'
import { isPathTraversalAttempt } from '../IsPathTraversalAttempt/IsPathTraversalAttempt.ts'
import { normalizeRelativePath } from '../NormalizeRelativePath/NormalizeRelativePath.ts'

type ResolveToolUriResult =
  | {
      readonly uri: string
    }
  | {
      readonly error: string
    }

const addTrailingSlash = (uri: string): string => {
  return uri.endsWith('/') ? uri : `${uri}/`
}

export const resolveToolUri = (uri: string, workspaceUri: string): ResolveToolUriResult => {
  if (!uri) {
    return { error: 'Invalid argument: uri must be an absolute URI.' }
  }

  if (isAbsoluteUri(uri)) {
    return { uri }
  }

  if (!workspaceUri || !isAbsoluteUri(workspaceUri)) {
    return { error: 'Invalid argument: uri must be an absolute URI.' }
  }

  if (isPathTraversalAttempt(uri)) {
    return { error: 'Access denied: path must be relative and stay within the open workspace folder.' }
  }

  const normalizedPath = normalizeRelativePath(uri)
  try {
    const resolvedUri = new URL(normalizedPath, addTrailingSlash(workspaceUri)).toString()
    return { uri: resolvedUri }
  } catch {
    return { error: 'Invalid argument: uri must be an absolute URI.' }
  }
}