const windowsDrivePathRegex = /^[a-zA-Z]:[\\/]/

export const isAbsoluteFileSystemPath = (value: string): boolean => {
  return value.startsWith('/') || windowsDrivePathRegex.test(value)
}
