export const isAbsoluteFileSystemPath = (value: string): boolean => {
  return value.startsWith('/') || /^[a-zA-Z]:[\\/]/.test(value)
}
