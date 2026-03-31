import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { GrepSearchArgs, LegacyMemorySearchResult } from '../ExecuteGrepSearchToolTypes/ExecuteGrepSearchToolTypes.ts'
import { formatLegacyMemorySearchResults } from '../FormatLegacyMemorySearchResults/FormatLegacyMemorySearchResults.ts'
import { getScheme } from '../GetScheme/GetScheme.ts'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
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
    return {
      arguments: grepSearchArgs,
      result: formatLegacyMemorySearchResults(result.results || [], grepSearchArgs.outputFormat),
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
      result: isLegacyMemorySearchResult(legacyResults)
        ? formatLegacyMemorySearchResults(legacyResults, grepSearchArgs.outputFormat)
        : 'No matches found.',
      workspaceUri,
    }
  }
}
