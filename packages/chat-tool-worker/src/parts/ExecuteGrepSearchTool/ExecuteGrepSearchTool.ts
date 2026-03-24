import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { getToolErrorPayload } from '../GetToolErrorPayload/GetToolErrorPayload.ts'

type GrepSearchArgs = {
  readonly query: string
  readonly isRegexp: boolean
  readonly includePattern?: string
  readonly maxResults?: number
  readonly includeIgnoredFiles?: boolean
}

type SearchProcessResult = {
  readonly end: number
  readonly lineNumber: number
  readonly start: number
  readonly text: string
  readonly type: number
}

type SearchProcessResponse = {
  readonly limitHit?: boolean
  readonly results?: readonly SearchProcessResult[]
}

type LegacyMemoryMatch = {
  readonly absoluteOffset?: number
  readonly preview?: string
}

type LegacyMemorySearchResult = readonly [string, readonly LegacyMemoryMatch[]]

const grepSearchArgumentError =
  'Invalid argument: grep_search requires query (string), isRegexp (boolean), optional includePattern (string), optional maxResults (number), and optional includeIgnoredFiles (boolean).'

const getGrepSearchArgs = (args: Readonly<Record<string, unknown>>): GrepSearchArgs | undefined => {
  const { includeIgnoredFiles, includePattern, isRegexp, maxResults, query } = args
  if (typeof query !== 'string' || typeof isRegexp !== 'boolean') {
    return undefined
  }
  if (includePattern !== undefined && typeof includePattern !== 'string') {
    return undefined
  }
  if (maxResults !== undefined && typeof maxResults !== 'number') {
    return undefined
  }
  if (includeIgnoredFiles !== undefined && typeof includeIgnoredFiles !== 'boolean') {
    return undefined
  }
  return {
    ...(includeIgnoredFiles === undefined ? {} : { includeIgnoredFiles }),
    ...(includePattern === undefined ? {} : { includePattern }),
    ...(maxResults === undefined ? {} : { maxResults }),
    isRegexp,
    query,
  }
}

const getScheme = (uriOrPath: string): string => {
  if (!uriOrPath.includes('://')) {
    return ''
  }
  return new URL(uriOrPath).protocol.slice(0, -1)
}

const getFilePathFromUri = (uri: string): string => {
  const url = new URL(uri)
  const decodedPath = decodeURIComponent(url.pathname)
  if (/^\/[a-zA-Z]:/.test(decodedPath)) {
    return decodedPath.slice(1)
  }
  return decodedPath
}

const isAbsoluteFileSystemPath = (value: string): boolean => {
  return value.startsWith('/') || /^[a-zA-Z]:[\\/]/.test(value)
}

const isFileUri = (value: string): boolean => {
  return value.startsWith('file://')
}

const getSearchDir = (workspaceUri: string, includePattern?: string): string => {
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

const getRipGrepArgs = ({ includeIgnoredFiles, includePattern, isRegexp, query }: GrepSearchArgs): readonly string[] => {
  const ripGrepArgs = ['--hidden', '--no-require-git', '--smart-case', '--stats', '--json', '--threads', '1', '--ignore-case']
  if (includeIgnoredFiles) {
    ripGrepArgs.push('--no-ignore')
  }
  if (includePattern && !isFileUri(includePattern) && !isAbsoluteFileSystemPath(includePattern)) {
    ripGrepArgs.push('--glob', includePattern)
  }
  if (isRegexp) {
    ripGrepArgs.push('--regexp', query)
  } else {
    ripGrepArgs.push('--fixed-strings', '--', query)
  }
  ripGrepArgs.push('.')
  return ripGrepArgs
}

const formatSearchProcessResults = (results: readonly SearchProcessResult[] | undefined): string => {
  if (!results || results.length === 0) {
    return 'No matches found.'
  }
  let currentFile = ''
  const lines: string[] = []
  for (const result of results) {
    if (result.type === 1) {
      currentFile = result.text
      continue
    }
    if (result.type === 2) {
      if (currentFile) {
        lines.push(`${currentFile}:${result.lineNumber}:${result.text}`)
      } else {
        lines.push(`${result.lineNumber}:${result.text}`)
      }
    }
  }
  if (lines.length === 0) {
    return 'No matches found.'
  }
  return lines.join('\n')
}

const isLegacyMemorySearchResult = (value: unknown): value is readonly LegacyMemorySearchResult[] => {
  return Array.isArray(value)
}

const formatLegacyMemorySearchResults = (results: readonly LegacyMemorySearchResult[]): string => {
  const lines: string[] = []
  for (const result of results) {
    const [path, matches] = result
    for (const match of matches) {
      const preview = typeof match?.preview === 'string' ? match.preview : ''
      lines.push(preview ? `${path}: ${preview}` : path)
    }
  }
  if (lines.length === 0) {
    return 'No matches found.'
  }
  return lines.join('\n')
}

const executeFileGrepSearch = async (workspaceUri: string, grepSearchArgs: GrepSearchArgs): Promise<ToolResponse> => {
  const result = (await RendererWorker.invoke('SearchProcess.invoke', 'TextSearch.search', {
    maxSearchResults: grepSearchArgs.maxResults,
    ripGrepArgs: getRipGrepArgs(grepSearchArgs),
    searchDir: getSearchDir(workspaceUri, grepSearchArgs.includePattern),
  })) as SearchProcessResponse
  return {
    arguments: grepSearchArgs,
    result: formatSearchProcessResults(result.results),
    workspaceUri,
    ...(result.limitHit ? { warning: 'Search result limit reached.' } : {}),
  }
}

const executeMemoryGrepSearch = async (
  workspaceUri: string,
  grepSearchArgs: GrepSearchArgs,
  options: ExecuteToolOptions,
): Promise<ToolResponse> => {
  const searchOptions = {
    exclude: '',
    include: grepSearchArgs.includePattern || '',
    isCaseSensitive: false,
    query: grepSearchArgs.query,
    root: workspaceUri,
    scheme: getScheme(workspaceUri),
    threads: 1,
    useRegularExpression: grepSearchArgs.isRegexp,
  }
  try {
    const result = (await RendererWorker.invoke(
      'ExtensionHostTextSearch.textSearchMemory2',
      searchOptions.scheme,
      workspaceUri,
      grepSearchArgs.query,
      searchOptions,
      options.assetDir,
    )) as { readonly limitHit?: boolean; readonly results?: readonly LegacyMemorySearchResult[] }
    return {
      arguments: grepSearchArgs,
      result: formatLegacyMemorySearchResults(result.results || []),
      workspaceUri,
      ...(result.limitHit ? { warning: 'Search result limit reached.' } : {}),
    }
  } catch {
    const legacyResults = (await RendererWorker.invoke(
      'ExtensionHostTextSearch.textSearchMemory',
      searchOptions.scheme,
      workspaceUri,
      grepSearchArgs.query,
      searchOptions,
      options.assetDir,
    )) as unknown
    return {
      arguments: grepSearchArgs,
      result: isLegacyMemorySearchResult(legacyResults) ? formatLegacyMemorySearchResults(legacyResults) : 'No matches found.',
      workspaceUri,
    }
  }
}

export const executeGrepSearchTool = async (args: Readonly<Record<string, unknown>>, options: ExecuteToolOptions): Promise<ToolResponse> => {
  const grepSearchArgs = getGrepSearchArgs(args)
  if (!grepSearchArgs) {
    return {
      error: grepSearchArgumentError,
    }
  }

  try {
    const workspaceUri = await RendererWorker.getWorkspacePath()
    const scheme = getScheme(workspaceUri)
    if (scheme === '' || scheme === 'file') {
      return executeFileGrepSearch(workspaceUri, grepSearchArgs)
    }
    return executeMemoryGrepSearch(workspaceUri, grepSearchArgs, options)
  } catch (error) {
    return {
      ...getToolErrorPayload(error),
      arguments: grepSearchArgs,
    }
  }
}
