import type {
  FormattedGrepSearchResult,
  GrepSearchJsonResult,
  GrepSearchMatch,
  GrepSearchOutputFormat,
} from '../ExecuteGrepSearchToolTypes/ExecuteGrepSearchToolTypes.ts'

const escapeXml = (value: string): string => {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

const formatTextMatches = (matches: readonly GrepSearchMatch[]): string => {
  const lines: string[] = []
  for (const match of matches) {
    if (typeof match.lineNumber === 'number') {
      lines.push(`${match.path}:${match.lineNumber}:${match.text}`)
    } else {
      lines.push(`${match.path}: ${match.text}`)
    }
  }
  return lines.join('\n')
}

const formatXmlMatches = (matches: readonly GrepSearchMatch[]): string => {
  const lines = [`${matches.length} matches`]
  for (const match of matches) {
    const attributes = [`path="${escapeXml(match.path)}"`]
    if (typeof match.lineNumber === 'number') {
      attributes.push(`line="${match.lineNumber}"`)
    }
    lines.push(`<match ${attributes.join(' ')}>`)
    lines.push(escapeXml(match.text))
    lines.push('</match>')
  }
  return lines.join('\n')
}

const formatJsonMatches = (matches: readonly GrepSearchMatch[]): GrepSearchJsonResult => {
  return {
    count: matches.length,
    matches: matches.map((match) => ({
      ...(typeof match.lineNumber === 'number' ? { line: match.lineNumber } : {}),
      path: match.path,
      text: match.text,
    })),
    matchesFound: matches.length > 0,
  }
}

const formatStringMatches = (matches: readonly GrepSearchMatch[], outputFormat?: GrepSearchOutputFormat): string => {
  if (matches.length === 0) {
    return 'No matches found.'
  }
  switch (outputFormat) {
    case 'xml':
      return formatXmlMatches(matches)
    default:
      return formatTextMatches(matches)
  }
}

export const formatGrepMatches = (matches: readonly GrepSearchMatch[], outputFormat?: GrepSearchOutputFormat): FormattedGrepSearchResult => {
  if (outputFormat === 'json') {
    return formatJsonMatches(matches)
  }
  return formatStringMatches(matches, outputFormat)
}
