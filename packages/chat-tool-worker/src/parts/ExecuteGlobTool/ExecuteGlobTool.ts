import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { matchesGlobPattern } from './MatchesGlobPattern.ts'
import { traverseDirectory } from './TraverseDirectory.ts'

const normalizePattern = (pattern: string): { baseDir: string; globPart: string; matchDirectories: boolean } => {
  // Convert backslashes to forward slashes
  let normalized = pattern.replaceAll('\\', '/')
  // Remove leading ./
  const withoutLeadingDot = normalized.startsWith('./') ? normalized.slice(2) : normalized
  // Collapse consecutive slashes
  normalized = withoutLeadingDot.replaceAll(/\/+/g, '/')
  // Check if pattern ends with /
  const matchDirectories = normalized.endsWith('/')

  // Remove trailing slash for parsing
  const patternToParse = normalized.endsWith('/') ? normalized.slice(0, -1) : normalized

  // Split into parts
  const parts = patternToParse.split('/')

  // Find the first part with glob characters
  let firstGlobIndex = -1
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].includes('*') || parts[i].includes('?') || parts[i].includes('[')) {
      firstGlobIndex = i
      break
    }
  }

  // If no glob characters found, treat the last part as the pattern
  const globPartIndex = firstGlobIndex === -1 ? parts.length - 1 : firstGlobIndex

  // baseDir is everything before the glob part
  const baseDir = parts.slice(0, globPartIndex).join('/')

  // globPart is from the glob character onwards
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

  // Normalize whitespace and slashes
  const normalizedInput = pattern.trim().replaceAll('\\', '/')
  const { baseDir, globPart, matchDirectories } = normalizePattern(pattern)

  const matches: string[] = []
  const baseUri = 'file:///workspace'

  try {
    // Set to track visited directories (for symlink detection)
    const visited = new Set<string>()

    if (matchDirectories || !globPart) {
      // Pattern is for a directory (has trailing /) or is a literal path
      // When trailing /, we want to match all items in that directory
      const dirUri = matchDirectories ? `${baseUri}/${globPart}` : baseDir ? `${baseUri}/${baseDir}` : baseUri

      try {
        const entries = (await RendererWorker.invoke('FileSystem.readDirWithFileTypes', dirUri)) as Array<{
          name: string
          isFile: () => boolean
          isDirectory: () => boolean
          isSymbolicLink: () => boolean
        }>

        for (const entry of entries) {
          let fullPath = ''
          if (matchDirectories) {
            fullPath = globPart ? `${globPart}/${entry.name}` : entry.name
          } else {
            fullPath = baseDir ? `${baseDir}/${entry.name}` : entry.name
          }

          // When matchDirectories, match all items; otherwise match against pattern
          if (matchDirectories) {
            matches.push(fullPath)
          } else if (matchesGlobPattern(fullPath, normalizedInput)) {
            matches.push(fullPath)
          }
        }
      } catch {
        // Directory not found or not readable
      }
    } else {
      // Recursive traversal needed (has glob characters with **)
      const baseDirUri = baseDir ? `${baseUri}/${baseDir}` : baseUri

      await traverseDirectory(
        baseDirUri,
        '',
        async (relativePath, entry) => {
          // Build the full path to check against pattern
          const fullPath =b&&
          // Only match files, not directories
              if (matchesGlobPattern(fullPath, normalizedInput)) {
              matches.push(fullPath)
            }
          }
        },
        visited,
      )
    }

    // Sort for consistent results
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
