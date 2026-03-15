export const isAbsoluteUri = (value: string): boolean => {
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value)
}