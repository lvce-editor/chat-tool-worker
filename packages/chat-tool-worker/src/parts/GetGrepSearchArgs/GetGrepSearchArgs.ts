import type { GrepSearchArgs } from '../ExecuteGrepSearchToolTypes/ExecuteGrepSearchToolTypes.ts'

export const getGrepSearchArgs = (args: Readonly<Record<string, unknown>>): GrepSearchArgs | undefined => {
  const { includeIgnoredFiles, includePattern, isRegexp, maxResults, outputFormat, query } = args
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
  if (outputFormat !== undefined && outputFormat !== 'xml' && outputFormat !== 'json') {
    return undefined
  }
  return {
    ...(includeIgnoredFiles === undefined ? {} : { includeIgnoredFiles }),
    ...(includePattern === undefined ? {} : { includePattern }),
    ...(maxResults === undefined ? {} : { maxResults }),
    ...(outputFormat === undefined ? {} : { outputFormat }),
    isRegexp,
    query,
  }
}
