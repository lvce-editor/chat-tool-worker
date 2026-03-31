import type { GrepSearchOutputFormat, SearchProcessResult } from '../ExecuteGrepSearchToolTypes/ExecuteGrepSearchToolTypes.ts'
import { formatGrepMatches } from '../FormatGrepMatches/FormatGrepMatches.ts'

export const formatSearchProcessResults = (results: readonly SearchProcessResult[] | undefined, outputFormat?: GrepSearchOutputFormat): string => {
  if (!results || results.length === 0) {
    return 'No matches found.'
  }
  let currentFile = ''
  const matches = []
  for (const result of results) {
    if (result.type === 1) {
      currentFile = result.text
      continue
    }
    if (result.type === 2) {
      if (currentFile) {
        matches.push({
          lineNumber: result.lineNumber,
          path: currentFile,
          text: result.text,
        })
      } else {
        matches.push({
          lineNumber: result.lineNumber,
          path: '',
          text: result.text,
        })
      }
    }
  }
  if (matches.length === 0) {
    return 'No matches found.'
  }
  return formatGrepMatches(matches, outputFormat)
}
