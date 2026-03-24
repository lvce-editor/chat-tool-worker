export type GrepSearchArgs = {
  readonly query: string
  readonly isRegexp: boolean
  readonly includePattern?: string
  readonly maxResults?: number
  readonly includeIgnoredFiles?: boolean
}

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
