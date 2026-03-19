import { expect, test } from '@jest/globals'
import { executeRgTool } from '../src/parts/ExecuteRgTool/ExecuteRgTool.ts'

test('executeRgTool returns mock rg output', async () => {
  const result = await executeRgTool(
    {
      '-n': true,
      output_mode: 'content',
      path: '/workspace/README.md',
      pattern: 'read_file|write_file',
    },
    {} as never,
  )

  expect(result).toEqual({
    arguments: {
      '-n': true,
      output_mode: 'content',
      path: '/workspace/README.md',
      pattern: 'read_file|write_file',
    },
    result: 'No matches found.',
  })
})

test('executeRgTool validates rg argument shape', async () => {
  const result = await executeRgTool(
    {
      output_mode: 'invalid',
      pattern: 123,
    },
    {} as never,
  )

  expect(result).toEqual({
    error:
      'Invalid argument: rg requires pattern (string), optional path (string), optional output_mode ("content" | "files_with_matches" | "count"), and optional -n (boolean).',
  })
})
