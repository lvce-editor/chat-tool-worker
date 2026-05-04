import type { GrepSearchArgs } from '../ExecuteGrepSearchToolTypes/ExecuteGrepSearchToolTypes.ts'

const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean'
}

const isNumber = (value: unknown): value is number => {
  return typeof value === 'number'
}

const isString = (value: unknown): value is string => {
  return typeof value === 'string'
}

const isOptional = <T>(value: unknown, predicate: (value: unknown) => value is T): value is T | undefined => {
  return value === undefined || predicate(value)
}

const isOutputFormat = (value: unknown): value is GrepSearchArgs['outputFormat'] => {
  return value === 'xml' || value === 'json'
}

export const getGrepSearchArgs = (args: Readonly<Record<string, unknown>>): GrepSearchArgs | undefined => {
  const { includeIgnoredFiles, includePattern, isRegexp, maxResults, outputFormat, query, useDefaultExcludes } = args
  if (!isString(query) || !isBoolean(isRegexp)) {
    return undefined
  }
  if (!isOptional(includePattern, isString)) {
    return undefined
  }
  if (!isOptional(maxResults, isNumber)) {
    return undefined
  }
  if (!isOptional(includeIgnoredFiles, isBoolean)) {
    return undefined
  }
  if (!isOptional(useDefaultExcludes, isBoolean)) {
    return undefined
  }
  if (!isOptional(outputFormat, isOutputFormat)) {
    return undefined
  }
  return {
    ...(includeIgnoredFiles === undefined ? {} : { includeIgnoredFiles }),
    ...(includePattern === undefined ? {} : { includePattern }),
    ...(maxResults === undefined ? {} : { maxResults }),
    ...(outputFormat === undefined ? {} : { outputFormat }),
    isRegexp,
    query,
    useDefaultExcludes: useDefaultExcludes === undefined ? true : useDefaultExcludes,
  }
}
