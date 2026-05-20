import { DirentType } from '@lvce-editor/constants'
import { FileSystemWorker } from '@lvce-editor/rpc-registry'
import { matchesGlobPattern } from '../ExecuteGlobTool/MatchesGlobPattern.ts'
import { shouldExcludeDir } from '../ExecuteGlobTool/TraverseDirectory.ts'
import { searchInText, type SearchOptions, type TextSearchResult } from '../SearchInText/SearchInText.ts'

type DirEntry = {
  readonly name: string
  readonly type: number
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

const readDirEntries = async (uri: string, relativePath: string): Promise<readonly DirEntry[] | undefined> => {
  try {
    return (await FileSystemWorker.readDirWithFileTypes(uri)) as readonly DirEntry[]
  } catch (error) {
    if (relativePath === '') {
      throw error
    }
    return undefined
  }
}

const searchFileContents = async (entryUri: string, searchOptions: SearchOptions): Promise<readonly TextSearchResult[]> => {
  try {
    const content = await FileSystemWorker.readFile(entryUri)
    return searchInText(content, entryUri, searchOptions)
  } catch {
    // Ignore unreadable files and continue with remaining matches.
    return []
  }
}

const visitDirEntry = async (
  uri: string,
  relativePath: string,
  dirent: DirEntry,
  searchOptions: SearchOptions,
  visit: (uri: string, relativePath: string) => Promise<void>,
): Promise<readonly TextSearchResult[]> => {
  const entryPath = relativePath ? `${relativePath}/${dirent.name}` : dirent.name
  if (isExcludedPath(entryPath, searchOptions.exclude)) {
    return []
  }

  const entryUri = joinUri(uri, dirent.name)
  if (dirent.type === DirentType.Directory) {
    if (!shouldExcludeDir(dirent.name)) {
      await visit(entryUri, entryPath)
    }
    return []
  }

  if (dirent.type === DirentType.File) {
    return searchFileContents(entryUri, searchOptions)
  }

  return []
}

const sortSearchResults = (results: readonly TextSearchResult[]): TextSearchResult[] => {
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

export const searchTextManual = async (workspaceUri: string, searchOptions: SearchOptions): Promise<readonly TextSearchResult[]> => {
  const results: TextSearchResult[] = []
  const visited = new Set<string>()

  const visit = async (uri: string, relativePath: string): Promise<void> => {
    if (visited.has(uri)) {
      return
    }
    visited.add(uri)

    const dirents = await readDirEntries(uri, relativePath)
    if (!dirents) {
      return
    }

    for (const dirent of dirents) {
      results.push(...(await visitDirEntry(uri, relativePath, dirent, searchOptions, visit)))
    }
  }

  await visit(workspaceUri, '')
  return sortSearchResults(results)
}
