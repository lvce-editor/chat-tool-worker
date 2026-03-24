import type { SearchProcessResult } from './ExecuteGrepSearchToolTypes.ts'

export const formatSearchProcessResults = (results: readonly SearchProcessResult[] | undefined): string => {
  if (!results || results.length === 0) {
    return 'No matches found.'
  }
  let currentFile = ''
  const lines: string[] = []
  for (const result of results) {
    if (result.type === 1) {
      currentFile = result.text
      continue
    }
    if (result.type === 2) {
      if (currentFile) {
        lines.push(`${currentFile}:${result.lineNumber}:${result.text}`)
      } else {
        lines.push(`${result.lineNumber}:${result.text}`)
      }
    }
  }
  if (lines.length === 0) {
    return 'No matches found.'
  }
  return lines.join('\n')
}
