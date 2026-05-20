import { expect, test } from '@jest/globals'
import { executeSearchTextTool } from '../src/parts/ExecuteSearchTextTool/ExecuteSearchTextTool.ts'

test('executeSearchTextTool returns mock search results', async () => {
  const result = await executeSearchTextTool(
    {
      options: {
        exclude: ['**/node_modules/**', '**/*.min.js'],
        isRegex: false,
        matchCase: false,
        matchWholeWord: false,
        value: 'needle',
      },
    },
    {} as never,
  )

  expect(result).toEqual({

    results: [
      {
        column: 12,
        line: 5,
        text: 'Mock match for "needle" in src/main.ts',
        uri: 'file:///workspace/src/main.ts',
      },
      {
        column: 3,
        line: 18,
        text: 'Mock match for "needle" in src/utils/search.ts',
        uri: 'file:///workspace/src/utils/search.ts',
      },
    ],
  })
})

test('executeSearchTextTool validates options object shape', async () => {
  const result = await executeSearchTextTool(
    {
      options: {
        exclude: ['**/node_modules/**'],
        isRegex: false,
        matchCase: false,
        matchWholeWord: false,
      },
    },
    {} as never,
  )

  expect(result).toEqual({
    error:
      'Invalid argument: options must include value (string), isRegex (boolean), matchCase (boolean), matchWholeWord (boolean), and exclude (string[]).',
  })
})
