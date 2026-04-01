import { DirentType } from '@lvce-editor/constants'
import { FileSystemWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
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

export const executeGlobTool = async (args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<ToolResponse> => {
  const pattern = typeof args.pattern === 'string' ? args.pattern : ''
  if (!pattern) {
    return {
      error: 'Invalid argument: pattern must be a non-empty string.',
    }
  }

  const baseUri = typeof args.baseUri === 'string' ? args.baseUri : ''
  if (!baseUri || !isAbsoluteUri(baseUri)) {
    return {
      error: 'Invalid argument: baseUri must be an absolute URI.',
    }
  }
  if (baseUri === PLACEHOLDER_WORKSPACE_URI || baseUri.startsWith(`${PLACEHOLDER_WORKSPACE_URI}/`)) {
    return {
      baseUri,
      error: 'Invalid argument: baseUri must be a real workspace folder URI. Call getWorkspaceUri first and use the returned workspaceUri value.',
    }
  }

  const normalizedPattern = normalizeInputPattern(pattern)
  const { baseDir, globPart, matchDirectories } = normalizePattern(pattern)
  const matches: string[] = []

  try {
    if (matchDirectories) {
      const dirUri = joinUri(baseUri, globPart)
      const entries = await FileSystemWorker.readDirWithFileTypes(dirUri)
      for (const entry of entries) {
        matches.push(globPart ? `${globPart}/${entry.name}` : entry.name)
      }
    } else if (globPart.includes('**')) {
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
    } else {
      const dirUri = joinUri(baseUri, baseDir)
      const entries = await FileSystemWorker.readDirWithFileTypes(dirUri)
      for (const entry of entries) {
        const fullPath = baseDir ? `${baseDir}/${entry.name}` : entry.name
        if (matchesGlobPattern(fullPath, normalizedPattern)) {
          matches.push(fullPath)
        }
      }
    }

    matches.sort()

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
