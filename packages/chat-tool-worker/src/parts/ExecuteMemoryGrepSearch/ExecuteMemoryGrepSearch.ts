import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { GrepSearchArgs, LegacyMemorySearchResult } from '../ExecuteGrepSearchToolTypes/ExecuteGrepSearchToolTypes.ts'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { formatLegacyMemorySearchResults } from '../FormatLegacyMemorySearchResults/FormatLegacyMemorySearchResults.ts'
import { getScheme } from '../GetScheme/GetScheme.ts'
import { isLegacyMemorySearchResult } from '../IsLegacyMemorySearchResult/IsLegacyMemorySearchResult.ts'

export const executeMemoryGrepSearch = async (
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
    const formattedResult = formatLegacyMemorySearchResults(result.results || [], grepSearchArgs.outputFormat)
    return {
      ...(typeof formattedResult === 'string' ? { result: formattedResult } : formattedResult),
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
    const formattedResult = isLegacyMemorySearchResult(legacyResults)
      ? formatLegacyMemorySearchResults(legacyResults, grepSearchArgs.outputFormat)
      : formatLegacyMemorySearchResults([], grepSearchArgs.outputFormat)
    return {
      ...(typeof formattedResult === 'string' ? { result: formattedResult } : formattedResult),
    }
  }
}
