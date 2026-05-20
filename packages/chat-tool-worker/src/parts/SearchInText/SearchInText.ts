const WORD_CHARACTER_REGEX = /\w/

export type TextSearchResult = {
  readonly column: number
  readonly line: number
  readonly text: string
  readonly uri: string
}

export type SearchOptions = {
  readonly value: string
  readonly isRegex: boolean
  readonly matchCase: boolean
  readonly matchWholeWord: boolean
  readonly exclude: readonly string[]
}

const isWholeWordMatch = (text: string, startIndex: number, matchLength: number): boolean => {
  const beforeChar = startIndex > 0 ? text[startIndex - 1] : ' '
  const afterChar = startIndex + matchLength < text.length ? text[startIndex + matchLength] : ' '
  return !WORD_CHARACTER_REGEX.test(beforeChar) && !WORD_CHARACTER_REGEX.test(afterChar)
}

const createSearchResult = (uri: string, lineNumber: number, column: number, text: string): TextSearchResult => {
  return {
    column,
    line: lineNumber,
    text,
    uri,
  }
}

const searchPlainText = (text: string, uri: string, options: SearchOptions): TextSearchResult[] => {
  const results: TextSearchResult[] = []
  const lines = text.split('\n')
  const needle = options.matchCase ? options.value : options.value.toLowerCase()

  if (needle === '') {
    return results
  }

  for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
    const lineText = lines[lineNumber]
    const searchLineText = options.matchCase ? lineText : lineText.toLowerCase()
    let searchStartIndex = 0

    while (searchStartIndex <= searchLineText.length) {
      const matchIndex = searchLineText.indexOf(needle, searchStartIndex)
      if (matchIndex === -1) {
        break
      }
      if (!options.matchWholeWord || isWholeWordMatch(lineText, matchIndex, needle.length)) {
        results.push(createSearchResult(uri, lineNumber + 1, matchIndex + 1, lineText))
      }
      searchStartIndex = matchIndex + needle.length
    }
  }

  return results
}

const searchRegExp = (text: string, uri: string, options: SearchOptions): TextSearchResult[] => {
  const results: TextSearchResult[] = []
  const lines = text.split('\n')
  const flags = options.matchCase ? 'g' : 'gi'
  const regex = new RegExp(options.value, flags)

  for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
    const lineText = lines[lineNumber]
    regex.lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = regex.exec(lineText)) !== null) {
      const matchedText = match[0]
      if (matchedText !== '' && (!options.matchWholeWord || isWholeWordMatch(lineText, match.index, matchedText.length))) {
        results.push(createSearchResult(uri, lineNumber + 1, match.index + 1, lineText))
      }

      if (matchedText === '') {
        regex.lastIndex++
      }
    }
  }

  return results
}

export const searchInText = (text: string, uri: string, options: SearchOptions): TextSearchResult[] => {
  if (options.isRegex) {
    return searchRegExp(text, uri, options)
  }
  return searchPlainText(text, uri, options)
}