import type { GrepSearchArgs } from './ExecuteGrepSearchToolTypes.ts'

export const getGrepSearchArgs = (args: Readonly<Record<string, unknown>>): GrepSearchArgs | undefined => {
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
