import type { GrepSearchArgs } from '../ExecuteGrepSearchToolTypes/ExecuteGrepSearchToolTypes.ts'
import { isAbsoluteFileSystemPath } from '../IsAbsoluteFileSystemPath/IsAbsoluteFileSystemPath.ts'
import { isFileUri } from '../IsFileUri/IsFileUri.ts'

const defaultExcludeGlobs = ['!**/node_modules/**', '!**/.git/**']

export const getRipGrepArgs = ({ includeIgnoredFiles, includePattern, isRegexp, query, useDefaultExcludes }: GrepSearchArgs): readonly string[] => {
  const ripGrepArgs = ['--hidden', '--no-require-git', '--smart-case', '--stats', '--json', '--threads', '1', '--ignore-case']
  if (includeIgnoredFiles) {
    ripGrepArgs.push('--no-ignore')
  }
  if (useDefaultExcludes) {
    for (const glob of defaultExcludeGlobs) {
      ripGrepArgs.push('--glob', glob)
    }
  }
  if (includePattern && !isFileUri(includePattern) && !isAbsoluteFileSystemPath(includePattern)) {
    ripGrepArgs.push('--glob', includePattern)
  }
  if (isRegexp) {
    ripGrepArgs.push('--regexp', query)
  } else {
    ripGrepArgs.push('--fixed-strings', '--', query)
  }
  ripGrepArgs.push('.')
  return ripGrepArgs
}
