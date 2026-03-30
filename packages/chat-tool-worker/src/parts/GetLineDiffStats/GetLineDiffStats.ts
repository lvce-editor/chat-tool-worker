const carriageReturnNewLineRegex = /\r\n/g

const toLines = (content: string): readonly string[] => {
  if (content === '') {
    return []
  }
  const normalizedContent = content.replace(carriageReturnNewLineRegex, '\n')
  const lines = normalizedContent.split('\n')
  if (lines.at(-1) === '') {
    lines.pop()
  }
  return lines
}

const getLongestCommonSubsequenceLength = (beforeLines: readonly string[], afterLines: readonly string[]): number => {
  if (beforeLines.length === 0 || afterLines.length === 0) {
    return 0
  }

  const outerLines = beforeLines.length >= afterLines.length ? beforeLines : afterLines
  const innerLines = beforeLines.length >= afterLines.length ? afterLines : beforeLines
  let previousRow = new Uint32Array(innerLines.length + 1)
  for (let i = 1; i <= outerLines.length; i++) {
    const currentRow = new Uint32Array(innerLines.length + 1)
    const outerLine = outerLines[i - 1]
    for (let j = 1; j <= innerLines.length; j++) {
      if (outerLine === innerLines[j - 1]) {
        currentRow[j] = previousRow[j - 1] + 1
      } else {
        currentRow[j] = Math.max(previousRow[j], currentRow[j - 1])
      }
    }
    previousRow = currentRow
  }
  return previousRow[innerLines.length]
}

export const getLineDiffStats = (beforeContent: string, afterContent: string): { readonly addedLines: number; readonly removedLines: number } => {
  const beforeLines = toLines(beforeContent)
  const afterLines = toLines(afterContent)
  const longestCommonSubsequenceLength = getLongestCommonSubsequenceLength(beforeLines, afterLines)
  return {
    addedLines: afterLines.length - longestCommonSubsequenceLength,
    removedLines: beforeLines.length - longestCommonSubsequenceLength,
  }
}