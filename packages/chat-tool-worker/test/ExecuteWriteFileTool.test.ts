import { expect, test } from '@jest/globals'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import { executeWriteFileTool } from '../src/parts/ExecuteWriteFileTool/ExecuteWriteFileTool.ts'

test('executeWriteFileTool rejects relative path values', async () => {
  const result = await executeWriteFileTool({ content: '', uri: '/test/playground/index.js' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: uri must be an absolute URI.',
  })
})

test('executeWriteFileTool rejects malformed absolute uris', async () => {
  const result = await executeWriteFileTool({ content: '', uri: 'invalid://[' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: invalid URL.',
  })
})

test('executeWriteFileTool writes file and returns ok payload', async () => {
  const uri = 'file:///workspace/file.txt'
  const content = 'hello world'
  let called = 0
  let calledWithUri = ''
  let calledWithContent = ''
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.writeFile': async (uri: string, content: string) => {
      called++
      calledWithUri = uri
      calledWithContent = content
    },
  })
  try {
    const result = await executeWriteFileTool({ content, uri }, {} as never)
    expect(called).toBe(1)
    expect(calledWithUri).toBe(uri)
    expect(calledWithContent).toBe(content)
    expect(result).toEqual({
      ok: true,
      uri,
    })
  } finally {
    if (Symbol.dispose in mockRpc) {
      ;(mockRpc as { [Symbol.dispose]: () => void })[Symbol.dispose]()
    }
  }
})

test('executeWriteFileTool returns error payload when renderer worker write fails', async () => {
  const uri = 'file:///workspace/file.txt'
  let called = 0
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.writeFile': async () => {
      called++
      throw new Error('write failed')
    },
  })
  try {
    const result = await executeWriteFileTool({ content: 'x', uri }, {} as never)
    expect(called).toBe(1)
    expect(result).toMatchObject({
      error: expect.any(String),
      uri,
    })
  } finally {
    if (Symbol.dispose in mockRpc) {
      ;(mockRpc as { [Symbol.dispose]: () => void })[Symbol.dispose]()
    }
  }
})
