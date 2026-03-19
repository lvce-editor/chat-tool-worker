import { expect, test } from '@jest/globals'
import { executeOpenPreviewTool } from '../src/parts/ExecuteOpenPreviewTool/ExecuteOpenPreviewTool.ts'

test('executeOpenPreviewTool rejects relative path values', async () => {
  const result = await executeOpenPreviewTool({ uri: '/test/playground/index.js' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: uri must be an absolute URI.',
  })
})

test('executeOpenPreviewTool returns error payload when renderer worker invocation fails', async () => {
  const uri = 'file:///test/playground/index.js'
  const result = await executeOpenPreviewTool({ uri }, {} as never)
  expect(result).toMatchObject({
    error: expect.any(String),
    uri,
  })
})
