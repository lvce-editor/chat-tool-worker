import type { LegacyMemorySearchResult } from './ExecuteGrepSearchToolTypes.ts'

export const formatLegacyMemorySearchResults = (results: readonly LegacyMemorySearchResult[]): string => {
  const lines: string[] = []
  for (const result of results) {
    const [path, matches] = result
    for (const match of matches) {
      const preview = typeof match?.preview === 'string' ? match.preview : ''
      lines.push(preview ? `${path}: ${preview}` : path)
    }
  }
  if (lines.length === 0) {
    return 'No matches found.'
  }
  return lines.join('\n')
}
