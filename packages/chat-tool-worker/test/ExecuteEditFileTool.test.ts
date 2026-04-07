import { expect, test } from '@jest/globals'
import { executeEditFileTool } from '../src/parts/ExecuteEditFileTool/ExecuteEditFileTool.ts'

test('executeEditFileTool rejects relative path values', async () => {
  const result = await executeEditFileTool({ end: 0, start: 0, text: '', uri: '/test/playground/index.js' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: uri must be an absolute URI.',
    errorCode: 'E_INVALID_URI',
  })
})

test('executeEditFileTool rejects malformed absolute uris', async () => {
  const result = await executeEditFileTool({ end: 0, start: 0, text: '', uri: 'invalid://[' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: invalid URL.',
    errorCode: 'E_INVALID_URI',
  })
})

test('executeEditFileTool validates start offset', async () => {
  const result = await executeEditFileTool({ end: 0, start: -1, text: '', uri: 'file:///test/playground/index.js' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: start must be a non-negative integer.',
  })
})

test('executeEditFileTool validates end offset', async () => {
  const result = await executeEditFileTool({ end: -1, start: 0, text: '', uri: 'file:///test/playground/index.js' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: end must be a non-negative integer.',
  })
})

test('executeEditFileTool validates offset ordering', async () => {
  const result = await executeEditFileTool({ end: 0, start: 1, text: '', uri: 'file:///test/playground/index.js' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: start must be less than or equal to end.',
  })
})
