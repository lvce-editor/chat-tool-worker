import { expect, test } from '@jest/globals'
import { executeGlobTool } from '../src/parts/ExecuteGlobTool/ExecuteGlobTool.ts'

test('executeGlobTool returns mock relative paths for a valid pattern', async () => {
  const result = await executeGlobTool(
    {
      pattern: 'packages/e2e/src/*.ts',
    },
    {} as never,
  )

  expect(result).toEqual({
    paths: ['./src/main.ts', './src/utils/search.ts', './test/Main.test.ts'],
    pattern: 'packages/e2e/src/*.ts',
  })
})

test('executeGlobTool validates pattern is a non-empty string', async () => {
  const result = await executeGlobTool({}, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: pattern must be a non-empty string.',
  })
})
