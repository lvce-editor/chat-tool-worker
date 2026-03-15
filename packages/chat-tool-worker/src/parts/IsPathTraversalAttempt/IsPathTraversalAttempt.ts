const WINDOWS_ABSOLUTE_PATH_REGEX = /^[a-zA-Z]:[\\/]/
const PATH_SEGMENT_SPLIT_REGEX = /[\\/]/

export const isPathTraversalAttempt = (path: string): boolean => {
  if (!path) {
    return false
  }
  if (path.startsWith('/') || path.startsWith('\\')) {
    return true
  }
  if (path.startsWith('file://')) {
    return true
  }
  if (WINDOWS_ABSOLUTE_PATH_REGEX.test(path)) {
    return true
  }
  const segments = path.split(PATH_SEGMENT_SPLIT_REGEX)
  return segments.includes('..')
}
