import { expect, test } from '@jest/globals'
import { executeGrepSearchTool } from '../src/parts/ExecuteGrepSearchTool/ExecuteGrepSearchTool.ts'

test('executeGrepSearchTool returns mock grep output', async () => {
  const result = await executeGrepSearchTool(
    {
      includeIgnoredFiles: true,
      includePattern: 'src/**/*.ts',
      isRegexp: true,
      maxResults: 25,
      query: 'function|method|procedure',
    },
    {} as never,
  )

  expect(result).toEqual({
    arguments: {
      includeIgnoredFiles: true,
      includePattern: 'src/**/*.ts',
      isRegexp: true,
      maxResults: 25,
      query: 'function|method|procedure',
    },
    result: 'No matches found.',
  })
})

test('executeGrepSearchTool validates grep_search argument shape', async () => {
  const result = await executeGrepSearchTool(
    {
      isRegexp: 'true',
      query: 123,
    },
    {} as never,
  )

  expect(result).toEqual({
    error:
      'Invalid argument: grep_search requires query (string), isRegexp (boolean), optional includePattern (string), optional maxResults (number), and optional includeIgnoredFiles (boolean).',
  })
})
