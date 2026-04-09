export type GrepSearchOutputFormat = 'json' | 'xml'

export type GrepSearchArgs = {
  readonly query: string
  readonly isRegexp: boolean
  readonly includePattern?: string
  readonly maxResults?: number
  readonly includeIgnoredFiles?: boolean
  readonly outputFormat?: GrepSearchOutputFormat
}

export type GrepSearchMatch = {
  readonly path: string
  readonly lineNumber?: number
  readonly text: string
}

export type GrepSearchJsonMatch = {
  readonly path: string
  readonly line?: number
  readonly text: string
}

export type GrepSearchJsonResult = {
  readonly count: number
  readonly matches: readonly GrepSearchJsonMatch[]
  readonly matchesFound: boolean
}

export type FormattedGrepSearchResult = string | GrepSearchJsonResult

export type SearchProcessResult = {
  readonly end: number
  readonly lineNumber: number
  readonly start: number
  readonly text: string
  readonly type: number
}

export type SearchProcessResponse = {
  readonly limitHit?: boolean
  readonly results?: readonly SearchProcessResult[]
}

export type LegacyMemoryMatch = {
  readonly absoluteOffset?: number
  readonly preview?: string
}

export type LegacyMemorySearchResult = readonly [string, readonly LegacyMemoryMatch[]]
