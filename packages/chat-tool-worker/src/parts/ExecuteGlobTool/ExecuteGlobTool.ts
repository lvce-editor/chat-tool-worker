import { DirentType } from '@lvce-editor/constants'
import { FileSystemWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { getInvalidUriErrorPayload } from '../GetToolErrorPayload/GetToolErrorPayload.ts'
import { isAbsoluteUri } from '../IsAbsoluteUri/IsAbsoluteUri.ts'
import { matchesGlobPattern } from './MatchesGlobPattern.ts'
import { traverseDirectory } from './TraverseDirectory.ts'

const MULTIPLE_SLASHES_REGEX = /\/+/g
const LEADING_DOT_SLASH_REGEX = /^\.\//g
const PLACEHOLDER_WORKSPACE_URI = 'file:///workspace'

const hasGlobCharacters = (part: string): boolean => {
  return part.includes('*') || part.includes('?') || part.includes('[')
}

const normalizeInputPattern = (pattern: string): string => {
  return pattern.trim().replaceAll('\\', '/').replaceAll(LEADING_DOT_SLASH_REGEX, '').replaceAll(MULTIPLE_SLASHES_REGEX, '/')
}

const normalizePattern = (pattern: string): { baseDir: string; globPart: string; matchDirectories: boolean } => {
  const normalized = normalizeInputPattern(pattern)
  const matchDirectories = normalized.endsWith('/')
  const patternToParse = matchDirectories ? normalized.slice(0, -1) : normalized
  const parts = patternToParse.split('/')

  let firstGlobIndex = -1
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (part && hasGlobCharacters(part)) {
      firstGlobIndex = i
      break
    }
  }

  const globPartIndex = firstGlobIndex === -1 ? Math.max(parts.length - 1, 0) : firstGlobIndex
  const baseDir = parts.slice(0, globPartIndex).join('/')
  const globPart = parts.slice(globPartIndex).join('/')
  return { baseDir, globPart, matchDirectories }
}

const joinUri = (baseUri: string, path: string): string => {
  if (!path) {
    return baseUri
  }
  return baseUri.endsWith('/') ? `${baseUri}${path}` : `${baseUri}/${path}`
}

const isPlaceholderWorkspaceUri = (baseUri: string): boolean => {
  return baseUri === PLACEHOLDER_WORKSPACE_URI || baseUri.startsWith(`${PLACEHOLDER_WORKSPACE_URI}/`)
}

const getPattern = (args: Readonly<Record<string, unknown>>): string | undefined => {
  const pattern = typeof args.pattern === 'string' ? args.pattern : ''
  return pattern || undefined
}

const getBaseUri = (args: Readonly<Record<string, unknown>>): string | undefined => {
  const baseUri = typeof args.baseUri === 'string' ? args.baseUri : ''
  if (!baseUri || !isAbsoluteUri(baseUri) || isPlaceholderWorkspaceUri(baseUri)) {
    return undefined
  }
  return baseUri
}

const getBaseUriError = (args: Readonly<Record<string, unknown>>): ToolResponse | undefined => {
  const baseUri = typeof args.baseUri === 'string' ? args.baseUri : ''
  if (!baseUri || !isAbsoluteUri(baseUri)) {
    return getInvalidUriErrorPayload('baseUri')
  }
  if (isPlaceholderWorkspaceUri(baseUri)) {
    return {
      baseUri,
      error: 'Invalid argument: baseUri must be a real workspace folder URI. Call getWorkspaceUri first and use the returned workspaceUri value.',
    }
  }
  return undefined
}

const getDirectoryMatches = async (baseUri: string, globPart: string): Promise<string[]> => {
  const dirUri = joinUri(baseUri, globPart)
  const entries = await FileSystemWorker.readDirWithFileTypes(dirUri)
  return entries.map((entry) => (globPart ? `${globPart}/${entry.name}` : entry.name))
}

const getRecursiveMatches = async (baseUri: string, baseDir: string, normalizedPattern: string): Promise<string[]> => {
  const matches: string[] = []
  const baseDirUri = joinUri(baseUri, baseDir)
  await traverseDirectory(baseDirUri, '', async (relativePath, entry) => {
    if (entry.type !== DirentType.File) {
      return
    }
    const fullPath = baseDir ? `${baseDir}/${relativePath}` : relativePath
    if (matchesGlobPattern(fullPath, normalizedPattern)) {
      matches.push(fullPath)
    }
  })
  return matches
}

const getDirectMatches = async (baseUri: string, baseDir: string, normalizedPattern: string): Promise<string[]> => {
  const dirUri = joinUri(baseUri, baseDir)
  const entries = await FileSystemWorker.readDirWithFileTypes(dirUri)
  const matches: string[] = []
  for (const entry of entries) {
    const fullPath = baseDir ? `${baseDir}/${entry.name}` : entry.name
    if (matchesGlobPattern(fullPath, normalizedPattern)) {
      matches.push(fullPath)
    }
  }
  return matches
}

const getMatches = async (baseUri: string, pattern: string): Promise<string[]> => {
  const normalizedPattern = normalizeInputPattern(pattern)
  const { baseDir, globPart, matchDirectories } = normalizePattern(pattern)
  if (matchDirectories) {
    return getDirectoryMatches(baseUri, globPart)
  }
  if (globPart.includes('**')) {
    return getRecursiveMatches(baseUri, baseDir, normalizedPattern)
  }
  return getDirectMatches(baseUri, baseDir, normalizedPattern)
}

const sortMatches = (matches: string[]): void => {
  matches.sort((left, right) => left.localeCompare(right))
}

export const executeGlobTool = async (args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<ToolResponse> => {
  const pattern = getPattern(args)
  if (!pattern) {
    return {
      error: 'Invalid argument: pattern must be a non-empty string.',
    }
  }

  const baseUriError = getBaseUriError(args)
  if (baseUriError) {
    return baseUriError
  }

  const baseUri = getBaseUri(args)
  if (!baseUri) {
    return getInvalidUriErrorPayload('baseUri')
  }

  try {
    const matches = await getMatches(baseUri, pattern)
    sortMatches(matches)

    return {
      paths: matches,
      pattern,
    }
  } catch (error) {
    return {
      error: `Failed to glob: ${error instanceof Error ? error.message : String(error)}`,
      pattern,
    }
  }
}
