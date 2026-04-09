import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { GrepSearchArgs, SearchProcessResponse } from '../ExecuteGrepSearchToolTypes/ExecuteGrepSearchToolTypes.ts'
import type { ToolResponse } from '../Types/Types.ts'
import { formatSearchProcessResults } from '../FormatSearchProcessResults/FormatSearchProcessResults.ts'
import { getRipGrepArgs } from '../GetRipGrepArgs/GetRipGrepArgs.ts'
import { getSearchDir } from '../GetSearchDir/GetSearchDir.ts'

export const executeFileGrepSearch = async (workspaceUri: string, grepSearchArgs: GrepSearchArgs): Promise<ToolResponse> => {
  const result = (await RendererWorker.invoke('SearchProcess.invoke', 'TextSearch.search', {
    maxSearchResults: grepSearchArgs.maxResults,
    ripGrepArgs: getRipGrepArgs(grepSearchArgs),
    searchDir: getSearchDir(workspaceUri, grepSearchArgs.includePattern),
  })) as SearchProcessResponse
  const formattedResult = formatSearchProcessResults(result.results, grepSearchArgs.outputFormat)
  return {
    ...(typeof formattedResult === 'string' ? { result: formattedResult } : formattedResult),
    ...(result.limitHit ? { warning: 'Search result limit reached.' } : {}),
  }
}
