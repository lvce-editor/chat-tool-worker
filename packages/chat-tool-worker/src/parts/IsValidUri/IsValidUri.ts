export const isValidUri = (value: string): boolean => {
  return URL.canParse(value)
}
