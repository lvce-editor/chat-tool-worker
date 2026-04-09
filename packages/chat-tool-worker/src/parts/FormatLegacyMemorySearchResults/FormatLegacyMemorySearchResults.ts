import type { FormattedGrepSearchResult, GrepSearchOutputFormat, LegacyMemorySearchResult } from '../ExecuteGrepSearchToolTypes/ExecuteGrepSearchToolTypes.ts'
import { formatGrepMatches } from '../FormatGrepMatches/FormatGrepMatches.ts'

export const formatLegacyMemorySearchResults = (
  results: readonly LegacyMemorySearchResult[],
  outputFormat?: GrepSearchOutputFormat,
): FormattedGrepSearchResult => {
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
    return formatGrepMatches([], outputFormat)
  }
  return formatGrepMatches(matches, outputFormat)
}
