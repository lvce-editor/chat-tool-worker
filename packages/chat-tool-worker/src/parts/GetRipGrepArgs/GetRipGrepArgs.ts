import type { GrepSearchArgs } from './ExecuteGrepSearchToolTypes.ts'
import { isAbsoluteFileSystemPath } from './IsAbsoluteFileSystemPath.ts'
import { isFileUri } from './IsFileUri.ts'

export const getRipGrepArgs = ({ includeIgnoredFiles, includePattern, isRegexp, query }: GrepSearchArgs): readonly string[] => {
  const ripGrepArgs = ['--hidden', '--no-require-git', '--smart-case', '--stats', '--json', '--threads', '1', '--ignore-case']
  if (includeIgnoredFiles) {
    ripGrepArgs.push('--no-ignore')
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
