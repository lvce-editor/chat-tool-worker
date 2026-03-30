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

/*
 * Convert a glob pattern to a regex, but only for segments between separators
 */
const segmentToRegex = (segment: string): RegExp => {
  let regexStr = ''
  let i = 0

  while (i < segment.length) {
    const char = segment[i]

    switch (char) {
      case '?': {
        regexStr += '[^/]'
        i++
        break
      }
      case '[': {
        let j = i + 1
        let negated = false
        if (j < segment.length && segment[j] === '!') {
          negated = true
          j++
        }
        let classStr = ''
        while (j < segment.length && segment[j] !== ']') {
          classStr += segment[j]
          j++
        }
        if (j < segment.length) {
          if (negated) {
            regexStr += `[^${escapeRegExp(classStr)}]`
          } else {
            regexStr += `[${classStr.replaceAll('\\', '\\\\')}]`
          }
          i = j + 1
        } else {
          regexStr += escapeRegExp(char)
          i++
        }
        break
      }
      case '*': {
        regexStr += '[^/]*'
        i++
        break
      }
      default: {
        regexStr += escapeRegExp(char)
        i++
      }
    }
  }

  return new RegExp(`^${regexStr}$`)
}

export const matchesGlobPattern = (path: string, pattern: string): boolean => {
  const normalizedPath = path.replaceAll('\\', '/').replaceAll(LEADING_DOT_SLASH_REGEX, '')
  let normalizedPattern = pattern.replaceAll('\\', '/').replaceAll(LEADING_DOT_SLASH_REGEX, '').replaceAll(MULTIPLE_SLASHES_REGEX, '/')

  if (normalizedPattern.endsWith('/')) {
    normalizedPattern = normalizedPattern.slice(0, -1) + '/*'
  }

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
  if (patternPart === undefined) {
    return false
  }

  if (patternPart === '**') {
    for (let i = pathIdx; i <= pathParts.length; i++) {
      if (matchesPatternParts(pathParts, patternParts, i, patternIdx + 1)) {
        return true
      }
    }
    return false
  }

  if (pathIdx === pathParts.length) {
    return false
  }

  if (patternPart.includes('**')) {
    const regex = segmentToRegex(patternPart.replace('**', ''))
    const pathPart = pathParts[pathIdx]
    if (pathPart !== undefined && regex.test(pathPart)) {
      return matchesPatternParts(pathParts, patternParts, pathIdx + 1, patternIdx + 1)
    }
    return false
  }

  const regex = segmentToRegex(patternPart)
  const pathPart = pathParts[pathIdx]
  if (pathPart !== undefined && regex.test(pathPart)) {
    return matchesPatternParts(pathParts, patternParts, pathIdx + 1, patternIdx + 1)
  }

  return false
}
