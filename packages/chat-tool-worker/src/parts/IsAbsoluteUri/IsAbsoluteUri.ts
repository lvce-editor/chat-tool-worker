const ABSOLUTE_URI_REGEX = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//

export const isAbsoluteUri = (value: string): boolean => {
  return ABSOLUTE_URI_REGEX.test(value)
}
