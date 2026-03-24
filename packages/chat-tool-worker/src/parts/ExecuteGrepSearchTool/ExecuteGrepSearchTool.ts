import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'

type GrepSearchArgs = {
  readonly query: string
  readonly isRegexp: boolean
  readonly includePattern?: string
  readonly maxResults?: number
  readonly includeIgnoredFiles?: boolean
}

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

export const executeGrepSearchTool = async (args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<ToolResponse> => {
  const grepSearchArgs = getGrepSearchArgs(args)
  if (!grepSearchArgs) {
    return {
      error:
        'Invalid argument: grep_search requires query (string), isRegexp (boolean), optional includePattern (string), optional maxResults (number), and optional includeIgnoredFiles (boolean).',
    }
  }

  return {
    arguments: grepSearchArgs,
    result: 'No matches found.',
  }
}
