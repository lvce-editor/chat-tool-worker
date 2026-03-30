import { expect, test } from '@jest/globals'
import { FileSystemWorker } from '@lvce-editor/rpc-registry'
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
  const content = 'hello\nthere\nworld'
  let called = 0
  let existsCalled = 0
  let readCalled = 0
  let calledWithUri = ''
  let calledWithContent = ''
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.exists': async () => {
      existsCalled++
      return true
    },
    'FileSystem.readFile': async () => {
      readCalled++
      return 'hello\nworld'
    },
    'FileSystem.writeFile': async (uri: string, content: string) => {
      called++
      calledWithUri = uri
      calledWithContent = content
    },
  })
  try {
    const result = await executeWriteFileTool({ content, uri }, {} as never)
    expect(existsCalled).toBe(1)
    expect(readCalled).toBe(1)
    expect(called).toBe(1)
    expect(calledWithUri).toBe(uri)
    expect(calledWithContent).toBe(content)
    expect(result).toEqual({
      addedLines: 1,
      ok: true,
      removedLines: 0,
      uri,
    })
  } finally {
    if (Symbol.dispose in mockRpc) {
      ;(mockRpc as { [Symbol.dispose]: () => void })[Symbol.dispose]()
    }
  }
})

test('executeWriteFileTool returns diff counts when writing a new file', async () => {
  const uri = 'file:///workspace/new-file.txt'
  const content = 'first line\nsecond line'
  let existsCalled = 0
  let readCalled = 0
  let writeCalled = 0
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.exists': async () => {
      existsCalled++
      return false
    },
    'FileSystem.readFile': async () => {
      readCalled++
      return 'should not be read'
    },
    'FileSystem.writeFile': async () => {
      writeCalled++
    },
  })
  try {
    const result = await executeWriteFileTool({ content, uri }, {} as never)
    expect(existsCalled).toBe(1)
    expect(readCalled).toBe(0)
    expect(writeCalled).toBe(1)
    expect(result).toEqual({
      addedLines: 2,
      ok: true,
      removedLines: 0,
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
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.exists': async () => true,
    'FileSystem.readFile': async () => 'before',
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
