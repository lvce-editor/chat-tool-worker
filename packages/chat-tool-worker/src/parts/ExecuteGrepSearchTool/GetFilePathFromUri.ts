export const getFilePathFromUri = (uri: string): string => {
  const url = new URL(uri)
  const decodedPath = decodeURIComponent(url.pathname)
  if (/^\/[a-zA-Z]:/.test(decodedPath)) {
    return decodedPath.slice(1)
  }
  return decodedPath
}
