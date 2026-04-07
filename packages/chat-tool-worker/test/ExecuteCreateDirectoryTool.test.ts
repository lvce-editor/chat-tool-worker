import { expect, test } from '@jest/globals'
import { executeCreateDirectoryTool } from '../src/parts/ExecuteCreateDirectoryTool/ExecuteCreateDirectoryTool.ts'

test('executeCreateDirectoryTool rejects relative path values', async () => {
  const result = await executeCreateDirectoryTool({ uri: '/test/playground/newdir' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: uri must be an absolute URI.',
    errorCode: 'E_INVALID_URI',
  })
})

test('executeCreateDirectoryTool rejects malformed absolute uris', async () => {
  const result = await executeCreateDirectoryTool({ uri: 'invalid://[' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: invalid URL.',
    errorCode: 'E_INVALID_URI',
  })
})
