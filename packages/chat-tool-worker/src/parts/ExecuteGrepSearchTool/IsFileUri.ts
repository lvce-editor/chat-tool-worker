export const isFileUri = (value: string): boolean => {
  return value.startsWith('file://')
}
