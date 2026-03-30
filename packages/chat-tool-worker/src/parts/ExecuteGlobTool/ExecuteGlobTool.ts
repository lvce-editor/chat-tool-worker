import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { matchesGlobPattern } from './MatchesGlobPattern.ts'
import { traverseDirectory } from './TraverseDirectory.ts'

const MULTIPLE_SLASHES_REGEX = /\/+/g
const LEADING_DOT_SLASH_REGEX = /^\.\//g

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

export const executeGlobTool = async (args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<ToolResponse> => {
  const pattern = typeof args.pattern === 'string' ? args.pattern : ''
  if (!pattern) {
    return {
      error: 'Invalid argument: pattern must be a non-empty string.',
    }
  }

  const normalizedPattern = normalizeInputPattern(pattern)
  const { baseDir, globPart, matchDirectories } = normalizePattern(pattern)
  const baseUri = 'file:///workspace'
  const matches: string[] = []

  try {
    if (matchDirectories) {
      const dirUri = globPart ? `${baseUri}/${globPart}` : baseUri
      const entries = (await RendererWorker.invoke('FileSystem.readDirWithFileTypes', dirUri)) as Array<{
        name: string
      }>
      for (const entry of entries) {
        matches.push(globPart ? `${globPart}/${entry.name}` : entry.name)
      }
    } else if (globPart.includes('**')) {
      const baseDirUri = baseDir ? `${baseUri}/${baseDir}` : baseUri
      const visited = new Set<string>()
      await traverseDirectory(
        baseDirUri,
        '',
        async (relativePath, entry) => {
          if (!entry.isFile()) {
            return
          }
          const fullPath = baseDir ? `${baseDir}/${relativePath}` : relativePath
          if (matchesGlobPattern(fullPath, normalizedPattern)) {
            matches.push(fullPath)
          }
        },
        visited,
      )
    } else {
      const dirUri = baseDir ? `${baseUri}/${baseDir}` : baseUri
      const entries = (await RendererWorker.invoke('FileSystem.readDirWithFileTypes', dirUri)) as Array<{
        name: string
      }>
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
