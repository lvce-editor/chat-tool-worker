/**
 * Matches a string against a glob pattern
 * Supported patterns:
 * - * matches any characters except /
 * - ? matches a single character except /
 * - ** matches any characters including /
 * - [abc] matches a, b, or c
 * - [!abc] matches any character except a, b, c
 * - [a-z] matches any character between a and z
 */

const REGEX_SPECIAL_CHARS_REGEX = /[.*+?^${}()|[\]\\]/g
const LEADING_DOT_SLASH_REGEX = /^\.\//g
const MULTIPLE_SLASHES_REGEX = /\/+/g

const escapeRegExp = (str: string): string => {
  return str.replaceAll(REGEX_SPECIAL_CHARS_REGEX, '\\$&')
}

type CharacterClassRegex = {
  readonly regex: string
  readonly nextIndex: number
}

const getCharacterClassRegex = (classContents: string, negated: boolean): string => {
  if (negated) {
    return `[^${escapeRegExp(classContents)}]`
  }
  return `[${classContents.replaceAll('\\', '\\\\')}]`
}

const readCharacterClass = (segment: string, index: number): CharacterClassRegex | undefined => {
  let classIndex = index + 1
  const negated = segment[classIndex] === '!'
  if (negated) {
    classIndex++
  }
  const closingIndex = segment.indexOf(']', classIndex)
  if (closingIndex === -1) {
    return undefined
  }
  return {
    nextIndex: closingIndex + 1,
    regex: getCharacterClassRegex(segment.slice(classIndex, closingIndex), negated),
  }
}

/*
 * Convert a glob pattern to a regex, but only for segments between separators
 */
const segmentToRegex = (segment: string): RegExp => {
  let regexStr = ''
  let i = 0

  while (i < segment.length) {
    const char = segment[i]

    if (char === '?') {
      regexStr += '[^/]'
      i++
      continue
    }

    if (char === '*') {
      regexStr += '[^/]*'
      i++
      continue
    }

    if (char === '[') {
      const characterClass = readCharacterClass(segment, i)
      if (characterClass) {
        regexStr += characterClass.regex
        i = characterClass.nextIndex
        continue
      }
    }

    regexStr += escapeRegExp(char)
    i++
  }

  return new RegExp(`^${regexStr}$`)
}

const normalizePath = (path: string): string => {
  return path.replaceAll('\\', '/').replaceAll(LEADING_DOT_SLASH_REGEX, '')
}

const normalizePattern = (pattern: string): string => {
  const normalizedPattern = pattern.replaceAll('\\', '/').replaceAll(LEADING_DOT_SLASH_REGEX, '').replaceAll(MULTIPLE_SLASHES_REGEX, '/')
  if (!normalizedPattern.endsWith('/')) {
    return normalizedPattern
  }
  return normalizedPattern.slice(0, -1) + '/*'
}

const matchesSinglePatternPart = (pathPart: string, patternPart: string): boolean => {
  return segmentToRegex(patternPart).test(pathPart)
}

const matchesEmbeddedDoubleStarPattern = (
  pathParts: readonly string[],
  patternParts: readonly string[],
  pathIdx: number,
  patternIdx: number,
): boolean => {
  const patternPart = patternParts[patternIdx]
  const pathPart = pathParts[pathIdx]
  return (
    matchesSinglePatternPart(pathPart, patternPart.replace('**', '')) && matchesPatternParts(pathParts, patternParts, pathIdx + 1, patternIdx + 1)
  )
}

const matchesDoubleStarPattern = (pathParts: readonly string[], patternParts: readonly string[], pathIdx: number, patternIdx: number): boolean => {
  for (let i = pathIdx; i <= pathParts.length; i++) {
    if (matchesPatternParts(pathParts, patternParts, i, patternIdx + 1)) {
      return true
    }
  }
  return false
}

export const matchesGlobPattern = (path: string, pattern: string): boolean => {
  const normalizedPath = normalizePath(path)
  const normalizedPattern = normalizePattern(pattern)
  const patternParts = normalizedPattern.split('/')
  const pathParts = normalizedPath.split('/')

  return matchesPatternParts(pathParts, patternParts, 0, 0)
}

const matchesPatternParts = (pathParts: readonly string[], patternParts: readonly string[], pathIdx: number, patternIdx: number): boolean => {
  if (patternIdx === patternParts.length) {
    return pathIdx === pathParts.length
  }

  if (pathIdx > pathParts.length) {
    return false
  }

  const patternPart = patternParts[patternIdx]
  if (patternPart === '**') {
    return matchesDoubleStarPattern(pathParts, patternParts, pathIdx, patternIdx)
  }

  if (pathIdx === pathParts.length) {
    return false
  }

  if (patternPart.includes('**')) {
    return matchesEmbeddedDoubleStarPattern(pathParts, patternParts, pathIdx, patternIdx)
  }

  const pathPart = pathParts[pathIdx]
  return matchesSinglePatternPart(pathPart, patternPart) && matchesPatternParts(pathParts, patternParts, pathIdx + 1, patternIdx + 1)
}
