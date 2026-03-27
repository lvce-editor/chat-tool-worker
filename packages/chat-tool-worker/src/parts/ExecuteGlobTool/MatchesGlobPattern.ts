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

const escapeRegExp = (str: string): string => {
  return str.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')
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
        // ? matches any single character except /
        regexStr += '[^/]'
        i++

        break
      }
      case '[': {
        // Character class [abc] or [!abc] or [a-z]
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
            // For character class, we need to preserve the range syntax
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
        // * matches anything except /
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
  // Normalize slashes and remove leading ./
  const normalizedPath = path.replaceAll('\\', '/').replace(/^\.\//, '')
  let normalizedPattern = pattern.replaceAll('\\', '/').replace(/^\.\//, '').replaceAll(/\/+/g, '/')

  // Handle trailing slash (matches any content in that directory)
  if (normalizedPattern.endsWith('/')) {
    normalizedPattern = normalizedPattern.slice(0, -1) + '/*'
  }

  // Split pattern by /
  const patternParts = normalizedPattern.split('/')
  const pathParts = normalizedPath.split('/')

  return matchesPatternParts(pathParts, patternParts, 0, 0)
}

function matchesPatternParts(pathParts: string[], patternParts: string[], pathIdx: number, patternIdx: number): boolean {
  // Base cases
  if (patternIdx === patternParts.length) {
    return pathIdx === pathParts.length
  }

  if (pathIdx > pathParts.length) {
    return false
  }

  const patternPart = patternParts[patternIdx]

  // Handle **
  if (patternPart === '**') {
    // ** can match zero or more path segments
    // Try matching the rest of the pattern at different positions
    for (let i = pathIdx; i <= pathParts.length; i++) {
      if (matchesPatternParts(pathParts, patternParts, i, patternIdx + 1)) {
        return true
      }
    }
    return false
  }

  // Handle .**/pattern (** followed by more patterns)
  if (patternIdx < patternParts.length - 1 && patternParts[patternIdx] && patternParts[patternIdx].includes('**')) {
    // This shouldn't happen if we split by /, but just in case
    const regex = segmentToRegex(patternPart.replace('**', ''))
    if (regex.test(pathParts[pathIdx])) {
      return matchesPatternParts(pathParts, patternParts, pathIdx + 1, patternIdx + 1)
    }
    return false
  }

  // Regular segment matching
  const regex = segmentToRegex(patternPart)
  if (regex.test(pathParts[pathIdx])) {
    return matchesPatternParts(pathParts, patternParts, pathIdx + 1, patternIdx + 1)
  }

  return false
}
