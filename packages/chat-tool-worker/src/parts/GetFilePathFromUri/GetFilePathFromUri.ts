const windowsPathWithLeadingSlashRegex = /^\/[a-zA-Z]:/

export const getFilePathFromUri = (uri: string): string => {
  const url = new URL(uri)
  const decodedPath = decodeURIComponent(url.pathname)
  if (windowsPathWithLeadingSlashRegex.test(decodedPath)) {
    return decodedPath.slice(1)
  }
  return decodedPath
}
