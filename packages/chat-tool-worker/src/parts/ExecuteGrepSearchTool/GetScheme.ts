export const getScheme = (uriOrPath: string): string => {
  if (!uriOrPath.includes('://')) {
    return ''
  }
  return new URL(uriOrPath).protocol.slice(0, -1)
}
