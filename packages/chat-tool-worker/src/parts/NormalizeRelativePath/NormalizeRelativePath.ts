const PATH_SEGMENT_SPLIT_REGEX = /[\\/]/

export const normalizeRelativePath = (path: string): string => {
  const segments = path.split(PATH_SEGMENT_SPLIT_REGEX).filter((segment) => segment && segment !== '.')
  if (segments.length === 0) {
    return '.'
  }
  return segments.join('/')
}
