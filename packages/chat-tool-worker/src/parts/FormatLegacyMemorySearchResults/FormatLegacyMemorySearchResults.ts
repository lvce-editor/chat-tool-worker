import type { GrepSearchOutputFormat, LegacyMemorySearchResult } from './ExecuteGrepSearchToolTypes.ts'
import { formatGrepMatches } from './FormatGrepMatches.ts'

export const formatLegacyMemorySearchResults = (results: readonly LegacyMemorySearchResult[], outputFormat?: GrepSearchOutputFormat): string => {
  const matches: { path: string; text: string }[] = []
  for (const result of results) {
    const [path, resultMatches] = result
    for (const match of resultMatches) {
      const preview = typeof match?.preview === 'string' ? match.preview : ''
      matches.push(
        preview
          ? {
              path,
              text: preview,
            }
          : {
              path,
              text: '',
            },
      )
    }
  }
  if (matches.length === 0) {
    return 'No matches found.'
  }
  return formatGrepMatches(matches, outputFormat)
}
