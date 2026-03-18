import { expect, test } from '@jest/globals'
import * as ExecuteChatTool from '../src/parts/ExecuteChatTool/ExecuteChatTool.ts'

const options = {
  assetDir: '',
  platform: 0,
}

test('executeChatTool returns unknown tool error', async () => {
  const result = await ExecuteChatTool.executeChatTool('does_not_exist', '{}', options)
  expect(result).toEqual({ error: 'Unknown tool: does_not_exist' })
})

test('executeChatTool dispatches search_text tool', async () => {
  const result = await ExecuteChatTool.executeChatTool(
    'search_text',
    JSON.stringify({
      options: {
        exclude: ['**/dist/**'],
        isRegex: false,
        machWholeWord: true,
        matchCase: true,
        value: 'TODO',
      },
    }),
    options,
  )
  expect(result).toEqual({
    options: {
      exclude: ['**/dist/**'],
      isRegex: false,
      machWholeWord: true,
      matchCase: true,
      value: 'TODO',
    },
    results: [
      {
        column: 12,
        line: 5,
        text: 'Mock match for "TODO" in src/main.ts',
        uri: 'file:///workspace/src/main.ts',
      },
      {
        column: 3,
        line: 18,
        text: 'Mock match for "TODO" in src/utils/search.ts',
        uri: 'file:///workspace/src/utils/search.ts',
      },
    ],
  })
})
