import { expect, test } from '@jest/globals'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import { executeReadFileTool } from '../src/parts/ExecuteReadFileTool/ExecuteReadFileTool.ts'

test('executeReadFileTool rejects relative path values', async () => {
  const result = await executeReadFileTool({ uri: '/test/playground/index.js' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: uri must be an absolute URI.',
    errorCode: 'E_INVALID_URI',
  })
})

test('executeReadFileTool returns file content', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.readFile': async () => 'const value = 1\n',
  })

  const result = await executeReadFileTool({ uri: 'file:///test/playground/index.js' }, {} as never)

  expect(result).toEqual({
    content: 'const value = 1\n',
  })
  expect(mockRpc.invocations).toEqual([['FileSystem.readFile', 'file:///test/playground/index.js']])
})

test('executeReadFileTool returns error payload when renderer worker read fails', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.readFile': async () => {
      const error = new Error('failed to read file') as Error & { code?: string }
      error.code = 'ENOENT'
      throw error
    },
  })

  const result = await executeReadFileTool({ uri: 'file:///test/playground/index.js' }, {} as never)

  expect(result).toEqual({
    error: 'Error: failed to read file',
    errorCode: 'ENOENT',
    errorStack: expect.any(String),
    stack: expect.any(String),
  })
  expect(mockRpc.invocations).toEqual([['FileSystem.readFile', 'file:///test/playground/index.js']])
})
