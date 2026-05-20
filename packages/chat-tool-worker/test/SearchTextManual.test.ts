import { expect, test } from '@jest/globals'
import { DirentType } from '@lvce-editor/constants'
import { FileSystemWorker } from '@lvce-editor/rpc-registry'
import { searchTextManual } from '../src/parts/SearchTextManual/SearchTextManual.ts'

type MockEntry = {
  readonly name: string
  readonly type: number
}

const workspaceUri = 'file:///test/workspace'

const searchOptions = {
  exclude: [],
  isRegex: false,
  matchCase: false,
  matchWholeWord: false,
  value: 'needle',
} as const

const mockFile = (name: string): MockEntry => {
  return {
    name,
    type: DirentType.File,
  }
}

const mockDirectory = (name: string): MockEntry => {
  return {
    name,
    type: DirentType.Directory,
  }
}

test('searchTextManual returns sorted results across nested files', async () => {
  using fileSystemMockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === workspaceUri) {
        return [mockDirectory('src'), mockFile('zeta.ts')]
      }
      if (uri === `${workspaceUri}/src`) {
        return [mockFile('alpha.ts')]
      }
      throw new Error(`unexpected uri: ${uri}`)
    },
    'FileSystem.readFile': async (uri: string) => {
      if (uri === `${workspaceUri}/zeta.ts`) {
        return 'needle on second file'
      }
      if (uri === `${workspaceUri}/src/alpha.ts`) {
        return 'Needle first\nneedle second'
      }
      throw new Error(`unexpected read: ${uri}`)
    },
  })

  const result = await searchTextManual(workspaceUri, searchOptions)

  expect(result).toEqual([
    {
      column: 1,
      line: 1,
      text: 'Needle first',
      uri: `${workspaceUri}/src/alpha.ts`,
    },
    {
      column: 1,
      line: 2,
      text: 'needle second',
      uri: `${workspaceUri}/src/alpha.ts`,
    },
    {
      column: 1,
      line: 1,
      text: 'needle on second file',
      uri: `${workspaceUri}/zeta.ts`,
    },
  ])
  expect(fileSystemMockRpc.invocations).toEqual([
    ['FileSystem.readDirWithFileTypes', workspaceUri],
    ['FileSystem.readDirWithFileTypes', `${workspaceUri}/src`],
    ['FileSystem.readFile', `${workspaceUri}/src/alpha.ts`],
    ['FileSystem.readFile', `${workspaceUri}/zeta.ts`],
  ])
})

test('searchTextManual respects excludes and ignores unreadable nested directories', async () => {
  using fileSystemMockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === workspaceUri) {
        return [mockDirectory('ignored'), mockDirectory('src'), mockDirectory('.git'), mockFile('README.md')]
      }
      if (uri === `${workspaceUri}/src`) {
        return [mockDirectory('broken'), mockFile('main.ts')]
      }
      if (uri === `${workspaceUri}/src/broken`) {
        throw new Error('failed to read directory')
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

  const result = await searchTextManual(workspaceUri, {
    ...searchOptions,
    exclude: ['ignored/**', '**/*.md'],
  })

  expect(result).toEqual([
    {
      column: 1,
      line: 1,
      text: 'needle',
      uri: `${workspaceUri}/src/main.ts`,
    },
  ])
  expect(fileSystemMockRpc.invocations).toEqual([
    ['FileSystem.readDirWithFileTypes', workspaceUri],
    ['FileSystem.readDirWithFileTypes', `${workspaceUri}/src`],
    ['FileSystem.readDirWithFileTypes', `${workspaceUri}/src/broken`],
    ['FileSystem.readFile', `${workspaceUri}/src/main.ts`],
  ])
})

test('searchTextManual returns root directory errors', async () => {
  using fileSystemMockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async () => {
      throw new Error('failed to read workspace')
    },
  })

  await expect(searchTextManual(workspaceUri, searchOptions)).rejects.toThrow('failed to read workspace')
  expect(fileSystemMockRpc.invocations).toEqual([['FileSystem.readDirWithFileTypes', workspaceUri]])
})