import type { SearchResult } from '@lvce-editor/rpc-registry';
import { DirentType } from '@lvce-editor/constants';
import { FileSystemWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'



const searchInText = (text: string, options: SearchOptions): SearchResult[] => {
  const results: SearchResult[] = []
  const lines = text.split('\n')
  const searchValue = options.matchCase ? options.value : options.value.toLowerCase()

  for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
    const lineText = lines[lineNumber]
    const searchLineText = options.matchCase ? lineText : lineText.toLowerCase()
    let matchIndex = -1

    if (options.isRegex) {
      try {
        const regex = new RegExp(searchValue, options.matchCase ? '' : 'i')
        let match: RegExpExecArray | null
        while ((match = regex.exec(searchLineText)) !== null) {
          if (options.matchWholeWord) {
            const beforeChar = match.index > 0 ? searchLineText[match.index - 1] : ' '
            const afterChar = match.index + match[0].length < searchLineText.length ? searchLineText[match.index + match[0].length] : ' '
            if (!/\w/.test(beforeChar) && !/\w/.test(afterChar)) {
              results.push({
                line: lineNumber + 1,
                column: match.index + 1,
                text: lineText,
                uri: '', // This should be set to the actual file URI
              })
            }
          } else {
            results.push({


              line: lineNumber + 1, column: match.index + 1,
              text: lineText,
              uri: '', // This should be set to the actual file URI
            })
          }
        } catch (error) {
          console.error('Invalid regex pattern:', error)
        }
      } else {
        let searchStartIndex = 0
        while ((matchIndex = searchLineText.indexOf(searchValue, searchStartIndex)) !== -1) {
          if (options.matchWholeWord) {
            const beforeChar = matchIndex > 0 ? searchLineText[matchIndex - 1] : ' '
            const afterChar = matchIndex + searchValue.length < searchLineText.length ? searchLineText[matchIndex + searchValue.length] : ' '
            if (!/\w/.test(beforeChar) && !/\w/.test(afterChar)) {
              results.push({
                line: lineNumber + 1,
                column: matchIndex + 1,
                text: lineText

              })
            }
          } else {
            results.push({
              line: lineNumber + 1,
              column: matchIndex + 1,
              text: lineText,
              uri: '', // This should be set to the actual file URI
            })
          }
          searchStartIndex = matchIndex + searchValue.length
        }
      }
    }

    return results
  }