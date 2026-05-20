import { expect, test } from '@jest/globals'
import { DirentType } from '@lvce-editor/constants'
import { FileSystemWorker, RendererWorker } from '@lvce-editor/rpc-registry'
import { executeSearchTextTool } from '../src/parts/ExecuteSearchTextTool/ExecuteSearchTextTool.ts'

type MockEntryOptions = {
  readonly isFile: boolean
  readonly name: string
}

type MockEntry = {
  readonly name: string
  readonly type: number
}

const workspaceUri = 'file:///test/workspace'

const getOptions = (overrides: Record<string, unknown> = {}) => ({
  options: {
    exclude: [],
    isRegex: false,
    matchCase: false,
    matchWholeWord: false,
    value: 'needle',
    ...overrides,
  },
})

const mockEntry = ({ isFile, name }: MockEntryOptions): MockEntry => ({
  name,
  type: isFile ? DirentType.File : DirentType.Directory,
})

test('executeSearchTextTool searches workspace files recursively', async () => {
  using rendererMockRpc = RendererWorker.registerMockRpc({
    'Workspace.getPath': async () => workspaceUri,
  })
  using fileSystemMockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === workspaceUri) {
        return [mockEntry({ isFile: true, name: 'notes.md' }), mockEntry({ isFile: false, name: 'src' })]
      }
      if (uri === `${workspaceUri}/src`) {
        return [mockEntry({ isFile: true, name: 'main.ts' }), mockEntry({ isFile: false, name: 'nested' })]
      }
      if (uri === `${workspaceUri}/src/nested`) {
        return [mockEntry({ isFile: true, name: 'helper.ts' })]
      }
      return []
    },
    'FileSystem.readFile': async (uri: string) => {
      if (uri === `${workspaceUri}/notes.md`) {
        return 'No matches here'
      }
      if (uri === `${workspaceUri}/src/main.ts`) {
        return 'const Needle = 1\nneedle'
      }
      if (uri === `${workspaceUri}/src/nested/helper.ts`) {
        return 'needle helper'
      }
      throw new Error(`unexpected uri: ${uri}`)
    },
  })

  const result = await executeSearchTextTool(
    getOptions(),
    {} as never,
  )

  expect(result).toEqual({
    results: [
      {
        column: 7,
        line: 1,
        text: 'const Needle = 1',
        uri: `${workspaceUri}/src/main.ts`,
      },
      {
        column: 1,
        line: 2,
        text: 'needle',
        uri: `${workspaceUri}/src/main.ts`,
      },
      {
        column: 1,
        line: 1,
        text: 'needle helper',
        uri: `${workspaceUri}/src/nested/helper.ts`,
      },
    ],
  })
  expect(rendererMockRpc.invocations).toEqual([['Workspace.getPath']])
  expect(fileSystemMockRpc.invocations).toEqual([
    ['FileSystem.readDirWithFileTypes', workspaceUri],
    ['FileSystem.readFile', `${workspaceUri}/notes.md`],
    ['FileSystem.readDirWithFileTypes', `${workspaceUri}/src`],
    ['FileSystem.readFile', `${workspaceUri}/src/main.ts`],
    ['FileSystem.readDirWithFileTypes', `${workspaceUri}/src/nested`],
    ['FileSystem.readFile', `${workspaceUri}/src/nested/helper.ts`],
  ])
})

test('executeSearchTextTool validates options object shape', async () => {
  const result = await executeSearchTextTool(
    {
      options: {
        exclude: ['**/node_modules/**'],
        isRegex: false,
        matchCase: false,
        matchWholeWord: false,
      },
    },
    {} as never,
  )

  expect(result).toEqual({
    error:
      'Invalid argument: options must include value (string), isRegex (boolean), matchCase (boolean), matchWholeWord (boolean), and exclude (string[]).',
  })
})

test('executeSearchTextTool respects exclude patterns for files and directories', async () => {
  using rendererMockRpc = RendererWorker.registerMockRpc({
    'Workspace.getPath': async () => workspaceUri,
  })
  using fileSystemMockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === workspaceUri) {
        return [mockEntry({ isFile: false, name: 'ignored' }), mockEntry({ isFile: true, name: 'README.md' }), mockEntry({ isFile: false, name: 'src' })]
      }
      if (uri === `${workspaceUri}/src`) {
        return [mockEntry({ isFile: true, name: 'main.ts' })]
      }
      throw new Error(`unexpected uri: ${uri}`)
    },
    'FileSystem.readFile': async (uri: string) => {
      if (uri === `${workspaceUri}/src/main.ts`) {
        return 'needle'
      }
      throw new Error(`unexpected read: ${uri}`)
    },
  })

  const result = await executeSearchTextTool(
    getOptions({ exclude: ['ignored/**', '**/*.md'] }),
    {} as never,
  )

  expect(result).toEqual({
    results: [
      {
        column: 1,
        line: 1,
        text: 'needle',
        uri: `${workspaceUri}/src/main.ts`,
      },
    ],
  })
  expect(rendererMockRpc.invocations).toEqual([['Workspace.getPath']])
  expect(fileSystemMockRpc.invocations).toEqual([
    ['FileSystem.readDirWithFileTypes', workspaceUri],
    ['FileSystem.readDirWithFileTypes', `${workspaceUri}/src`],
    ['FileSystem.readFile', `${workspaceUri}/src/main.ts`],
  ])
})

test('executeSearchTextTool skips default excluded directories', async () => {
  using rendererMockRpc = RendererWorker.registerMockRpc({
    'Workspace.getPath': async () => workspaceUri,
  })
  using fileSystemMockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === workspaceUri) {
        return [mockEntry({ isFile: false, name: '.git' }), mockEntry({ isFile: false, name: 'src' })]
      }
      if (uri === `${workspaceUri}/src`) {
        return [mockEntry({ isFile: true, name: 'main.ts' })]
      }
      throw new Error(`unexpected uri: ${uri}`)
    },
    'FileSystem.readFile': async () => 'needle',
  })

  const result = await executeSearchTextTool(getOptions(), {} as never)

  expect(result).toEqual({
    results: [
      {
        column: 1,
        line: 1,
        text: 'needle',
        uri: `${workspaceUri}/src/main.ts`,
      },
    ],
  })
  expect(rendererMockRpc.invocations).toEqual([['Workspace.getPath']])
  expect(fileSystemMockRpc.invocations).toEqual([
    ['FileSystem.readDirWithFileTypes', workspaceUri],
    ['FileSystem.readDirWithFileTypes', `${workspaceUri}/src`],
    ['FileSystem.readFile', `${workspaceUri}/src/main.ts`],
  ])
})

test('executeSearchTextTool supports whole-word regex searches', async () => {
  using rendererMockRpc = RendererWorker.registerMockRpc({
    'Workspace.getPath': async () => workspaceUri,
  })
  using fileSystemMockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === workspaceUri) {
        return [mockEntry({ isFile: true, name: 'main.ts' })]
      }
      return []
    },
    'FileSystem.readFile': async () => 'cat scatter cat',
  })

  const result = await executeSearchTextTool(
    getOptions({ isRegex: true, matchWholeWord: true, value: 'cat' }),
    {} as never,
  )

  expect(result).toEqual({
    results: [
      {
        column: 1,
        line: 1,
        text: 'cat scatter cat',
        uri: `${workspaceUri}/main.ts`,
      },
      {
        column: 13,
        line: 1,
        text: 'cat scatter cat',
        uri: `${workspaceUri}/main.ts`,
      },
    ],
  })
  expect(rendererMockRpc.invocations).toEqual([['Workspace.getPath']])
  expect(fileSystemMockRpc.invocations).toEqual([
    ['FileSystem.readDirWithFileTypes', workspaceUri],
    ['FileSystem.readFile', `${workspaceUri}/main.ts`],
  ])
})

test('executeSearchTextTool returns an error for invalid regex input', async () => {
  const result = await executeSearchTextTool(
    getOptions({ isRegex: true, value: '[' }),
    {} as never,
  )

  expect(result).toEqual({
    error: 'Invalid argument: options.value must be a valid regular expression.',
  })
})

test('executeSearchTextTool returns workspace lookup errors', async () => {
  using rendererMockRpc = RendererWorker.registerMockRpc({
    'Workspace.getPath': async () => {
      const error = new Error('failed to resolve workspace') as Error & { code?: string }
      error.code = 'ENOENT'
      throw error
    },
  })

  const result = await executeSearchTextTool(getOptions(), {} as never)

  expect(result).toEqual({
    error: 'Error: failed to resolve workspace',
    errorCode: 'ENOENT',
    errorStack: expect.any(String),
    stack: expect.any(String),
  })
  expect(rendererMockRpc.invocations).toEqual([['Workspace.getPath']])
})

test('executeSearchTextTool continues when reading one file fails', async () => {
  using rendererMockRpc = RendererWorker.registerMockRpc({
    'Workspace.getPath': async () => workspaceUri,
  })
  using fileSystemMockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === workspaceUri) {
        return [mockEntry({ isFile: true, name: 'broken.ts' }), mockEntry({ isFile: true, name: 'main.ts' })]
      }
      return []
    },
    'FileSystem.readFile': async (uri: string) => {
      if (uri === `${workspaceUri}/broken.ts`) {
        throw new Error('failed to read file')
      }
      if (uri === `${workspaceUri}/main.ts`) {
        return 'needle'
      }
      throw new Error(`unexpected read: ${uri}`)
    },
  })

  const result = await executeSearchTextTool(getOptions(), {} as never)

  expect(result).toEqual({
    results: [
      {
        column: 1,
        line: 1,
        text: 'needle',
        uri: `${workspaceUri}/main.ts`,
      },
    ],
  })
  expect(rendererMockRpc.invocations).toEqual([['Workspace.getPath']])
  expect(fileSystemMockRpc.invocations).toEqual([
    ['FileSystem.readDirWithFileTypes', workspaceUri],
    ['FileSystem.readFile', `${workspaceUri}/broken.ts`],
    ['FileSystem.readFile', `${workspaceUri}/main.ts`],
  ])
})
