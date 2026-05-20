import { DirentType } from '@lvce-editor/constants'
import { FileSystemWorker, RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { matchesGlobPattern } from '../ExecuteGlobTool/MatchesGlobPattern.ts'
import { shouldExcludeDir } from '../ExecuteGlobTool/TraverseDirectory.ts'
import { getToolErrorPayload } from '../GetToolErrorPayload/GetToolErrorPayload.ts'
import { searchInText, type SearchOptions } from '../SearchInText/SearchInText.ts'

type DirEntry = {
  readonly name: string
  readonly type: number
}

const getSearchOptions = (args: Readonly<Record<string, unknown>>): SearchOptions | undefined => {
  const { options } = args
  if (!options || typeof options !== 'object') {
    return undefined
  }

  const candidate = options as Record<string, unknown>
  const { exclude, isRegex, matchCase, matchWholeWord, value } = candidate
  if (typeof value !== 'string' || typeof isRegex !== 'boolean' || typeof matchCase !== 'boolean' || typeof matchWholeWord !== 'boolean') {
    return undefined
  }
  if (!Array.isArray(exclude) || exclude.some((item) => typeof item !== 'string')) {
    return undefined
  }

  return {
    exclude,
    isRegex,
    matchCase,
    matchWholeWord,
    value,
  }
}

const joinUri = (baseUri: string, path: string): string => {
  if (!path) {
    return baseUri
  }
  return baseUri.endsWith('/') ? `${baseUri}${path}` : `${baseUri}/${path}`
}

const isExcludedPath = (path: string, exclude: readonly string[]): boolean => {
  return exclude.some((pattern) => matchesGlobPattern(path, pattern))
}

const validateRegex = (searchOptions: SearchOptions): string | undefined => {
  if (!searchOptions.isRegex) {
    return undefined
  }
  try {
    new RegExp(searchOptions.value)
    return undefined
  } catch {
    return 'Invalid argument: options.value must be a valid regular expression.'
  }
}

const sortSearchResults = (results: readonly ReturnType<typeof searchInText>[number][]): ReturnType<typeof searchInText> => {
  return results.toSorted((left, right) => {
    const uriComparison = left.uri.localeCompare(right.uri)
    if (uriComparison !== 0) {
      return uriComparison
    }
    if (left.line !== right.line) {
      return left.line - right.line
    }
    if (left.column !== right.column) {
      return left.column - right.column
    }
    return left.text.localeCompare(right.text)
  })
}

const searchTextManual = async (workspaceUri: string, searchOptions: SearchOptions): Promise<readonly ReturnType<typeof searchInText>[number][]> => {
  const results: ReturnType<typeof searchInText> = []
  const visited = new Set<string>()

  const visit = async (uri: string, relativePath: string): Promise<void> => {
    if (visited.has(uri)) {
      return
    }
    visited.add(uri)

    let dirents: readonly DirEntry[]
    try {
      dirents = (await FileSystemWorker.readDirWithFileTypes(uri)) as readonly DirEntry[]
    } catch (error) {
      if (relativePath === '') {
        throw error
      }
      return
    }

    for (const dirent of dirents) {
      const entryPath = relativePath ? `${relativePath}/${dirent.name}` : dirent.name
      if (isExcludedPath(entryPath, searchOptions.exclude)) {
        continue
      }

      const entryUri = joinUri(uri, dirent.name)
      if (dirent.type === DirentType.Directory) {
        if (!shouldExcludeDir(dirent.name)) {
          await visit(entryUri, entryPath)
        }
        continue
      }

      if (dirent.type !== DirentType.File) {
        continue
      }

      try {
        const content = await FileSystemWorker.readFile(entryUri)
        results.push(...searchInText(content, entryUri, searchOptions))
      } catch {
        // Ignore unreadable files and continue with remaining matches.
      }
    }
  }

  await visit(workspaceUri, '')
  return sortSearchResults(results)
}

export const executeSearchTextTool = async (args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<ToolResponse> => {
  const searchOptions = getSearchOptions(args)
  if (!searchOptions) {
    return {
      error:
        'Invalid argument: options must include value (string), isRegex (boolean), matchCase (boolean), matchWholeWord (boolean), and exclude (string[]).',
    }
  }

  const regexError = validateRegex(searchOptions)
  if (regexError) {
    return {
      error: regexError,
    }
  }

  try {
    const workspaceUri = await RendererWorker.getWorkspacePath()
    const results = await searchTextManual(workspaceUri, searchOptions)
    return {
      results,
    }
  } catch (error) {
    return getToolErrorPayload(error)
  }
}
