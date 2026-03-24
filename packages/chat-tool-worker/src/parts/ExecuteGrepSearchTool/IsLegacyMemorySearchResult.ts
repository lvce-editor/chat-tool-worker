import type { LegacyMemorySearchResult } from './ExecuteGrepSearchToolTypes.ts'

export const isLegacyMemorySearchResult = (value: unknown): value is readonly LegacyMemorySearchResult[] => {
  return Array.isArray(value)
}
