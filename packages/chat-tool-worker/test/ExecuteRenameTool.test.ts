import { expect, test } from '@jest/globals'
import { executeRenameTool } from '../src/parts/ExecuteRenameTool/ExecuteRenameTool.ts'

test('executeRenameTool rejects relative source uri values', async () => {
  const result = await executeRenameTool({ newUri: 'file:///workspace/new.ts', oldUri: '/workspace/old.ts' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: oldUri must be an absolute URI.',
    errorCode: 'E_INVALID_URI',
  })
})

test('executeRenameTool rejects relative target uri values', async () => {
  const result = await executeRenameTool({ newUri: '/workspace/new.ts', oldUri: 'file:///workspace/old.ts' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: newUri must be an absolute URI.',
    errorCode: 'E_INVALID_URI',
  })
})

test('executeRenameTool rejects malformed absolute uris', async () => {
  const result = await executeRenameTool({ newUri: 'invalid://[', oldUri: 'file:///workspace/old.ts' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: invalid URL.',
    errorCode: 'E_INVALID_URI',
  })
})
