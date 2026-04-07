import { expect, test } from '@jest/globals'
import { executeOpenEditorTool } from '../src/parts/ExecuteOpenEditorTool/ExecuteOpenEditorTool.ts'

test('executeOpenEditorTool rejects relative path values', async () => {
  const result = await executeOpenEditorTool({ uri: '/test/playground/index.js' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: uri must be an absolute URI.',
    errorCode: 'E_INVALID_URI',
  })
})

test('executeOpenEditorTool returns error payload when renderer worker invocation fails', async () => {
  const uri = 'file:///test/playground/index.js'
  const result = await executeOpenEditorTool({ uri }, {} as never)
  expect(result).toMatchObject({
    error: expect.any(String),
    uri,
  })
})
