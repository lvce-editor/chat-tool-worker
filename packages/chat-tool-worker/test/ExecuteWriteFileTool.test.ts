import { expect, test } from '@jest/globals'
import { executeWriteFileTool } from '../src/parts/ExecuteWriteFileTool/ExecuteWriteFileTool.ts'

test('executeWriteFileTool rejects relative path values', async () => {
  const result = await executeWriteFileTool({ uri: '/home/simon/Documents/levivilet/lvce-editor/playground/index.js', content: '' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: uri must be an absolute URI.',
  })
})

test('executeWriteFileTool rejects malformed absolute uris', async () => {
  const result = await executeWriteFileTool({ uri: 'invalid://[', content: '' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: invalid URL.',
  })
})
