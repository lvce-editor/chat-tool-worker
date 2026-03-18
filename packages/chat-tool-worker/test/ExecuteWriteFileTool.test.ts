import { expect, test } from '@jest/globals'
import { executeWriteFileTool } from '../src/parts/ExecuteWriteFileTool/ExecuteWriteFileTool.ts'

test('executeWriteFileTool rejects relative path values', async () => {
  const result = await executeWriteFileTool({ uri: '/home/simon/Documents/levivilet/lvce-editor/playground/index.js', content: '' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: uri must be an absolute file URI.',
  })
})

test('executeWriteFileTool rejects non-file absolute uris', async () => {
  const result = await executeWriteFileTool({ uri: 'https://example.com/file.txt', content: '' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: uri must be an absolute file URI.',
  })
})
