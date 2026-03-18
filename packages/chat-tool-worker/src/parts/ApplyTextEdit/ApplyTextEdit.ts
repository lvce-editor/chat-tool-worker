export const applyTextEdit = (content: string, start: number, end: number, text: string): string => {
  if (start > content.length || end > content.length) {
    throw new Error('Invalid argument: edit range is out of bounds.')
  }
  return `${content.slice(0, start)}${text}${content.slice(end)}`
}
