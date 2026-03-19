import { expect, test } from '@jest/globals'
import { executeReadFileTool } from '../src/parts/ExecuteReadFileTool/ExecuteReadFileTool.ts'

test('executeReadFileTool rejects relative path values', async () => {
  const result = await executeReadFileTool({ uri: '/test/playground/index.js' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: uri must be an absolute URI.',
  })
})

test('executeReadFileTool returns error payload when renderer worker read fails', async () => {
  const uri = 'file:///test/playground/index.js'
  const result = await executeReadFileTool({ uri }, {} as never)
  expect(result).toMatchObject({
    error: expect.any(String),
    uri,
  })
})
