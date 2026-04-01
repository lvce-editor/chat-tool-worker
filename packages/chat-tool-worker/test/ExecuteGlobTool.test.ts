import { expect, test } from '@jest/globals'
import { DirentType } from '@lvce-editor/constants'
import { FileSystemWorker } from '@lvce-editor/rpc-registry'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { executeGlobTool } from '../src/parts/ExecuteGlobTool/ExecuteGlobTool.ts'

const baseUri = 'file:///test/workspace'

const executeGlob = (pattern: string): any => {
  return executeGlobTool({ baseUri, pattern }, {} as never)
}

type MockEntryOptions = {
  readonly isFile: boolean
  readonly isSymbolicLink?: boolean
  readonly name: string
}

type MockEntry = {
  readonly name: string
  readonly type: number
}

const getEntryType = ({ isFile, isSymbolicLink = false }: MockEntryOptions): number => {
  if (isSymbolicLink) {
    return DirentType.Symlink
  }
  if (isFile) {
    return DirentType.File
  }
  return DirentType.Directory
}

const mockEntry = (options: MockEntryOptions): MockEntry => ({
  name: options.name,
  type: getEntryType(options),
})

const expectReadDirInvocations = (mockRpc: { readonly invocations: readonly unknown[] }, ...uris: readonly string[]): void => {
  expect(mockRpc.invocations).toEqual(uris.map((uri) => ['FileSystem.readDirWithFileTypes', uri]))
}

test('executeGlobTool validates pattern is a non-empty string', async () => {
  const result = await executeGlobTool({ baseUri }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: pattern must be a non-empty string.',
  })
})

test('executeGlobTool rejects empty string pattern', async () => {
  const result = await executeGlobTool({ baseUri, pattern: '' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: pattern must be a non-empty string.',
  })
})

test('executeGlobTool rejects non-string pattern', async () => {
  const result = await executeGlobTool({ baseUri, pattern: 123 }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: pattern must be a non-empty string.',
  })
})

test('executeGlobTool requires baseUri to be an absolute uri', async () => {
  const result = await executeGlobTool({ pattern: '*.ts' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: baseUri must be an absolute URI.',
  })
})

test('executeGlobTool rejects placeholder workspace uri with actionable error', async () => {
  const result = await executeGlobTool({ baseUri: 'file:///workspace', pattern: '*.ts' }, {} as never)
  expect(result).toEqual({
    baseUri: 'file:///workspace',
    error: 'Invalid argument: baseUri must be a real workspace folder URI. Call getWorkspaceUri first and use the returned workspaceUri value.',
  })
})

test('executeGlobTool matches files with simple * pattern', async () => {
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === `${baseUri}/src`) {
        return [
          mockEntry({ isFile: true, name: 'main.ts' }),
          mockEntry({ isFile: true, name: 'utils.ts' }),
          mockEntry({ isFile: true, name: 'config.json' }),
        ]
      }
      return []
    },
  })

  const result = await executeGlob('src/*.ts')
  expectReadDirInvocations(mockRpc, `${baseUri}/src`)
  const expectedItems = {
    paths: ['src/main.ts', 'src/utils.ts'],
    pattern: 'src/*.ts',
  }
  expect(result).toEqual(expectedItems)
})

test('executeGlobTool matches all files with pattern *', async () => {
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === `${baseUri}/src`) {
        return [
          mockEntry({ isFile: true, name: 'main.ts' }),
          mockEntry({ isFile: true, name: 'utils.ts' }),
          mockEntry({ isFile: true, name: 'config.json' }),
        ]
      }
      return []
    },
  })

  const result = await executeGlob('src/*')
  expectReadDirInvocations(mockRpc, `${baseUri}/src`)
  const expectedItems = {
    paths: ['src/config.json', 'src/main.ts', 'src/utils.ts'],
    pattern: 'src/*',
  }
  expect(result).toEqual(expectedItems)
})

test('executeGlobTool matches with ? single character wildcard', async () => {
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === `${baseUri}/src`) {
        return [mockEntry({ isFile: true, name: 'a.ts' }), mockEntry({ isFile: true, name: 'ab.ts' }), mockEntry({ isFile: true, name: 'b.ts' })]
      }
      return []
    },
  })

  const result = await executeGlob('src/?.ts')
  expectReadDirInvocations(mockRpc, `${baseUri}/src`)
  const expectedItems = {
    paths: ['src/a.ts', 'src/b.ts'],
    pattern: 'src/?.ts',
  }
  expect(result).toEqual(expectedItems)
})

test('executeGlobTool filters directories with * pattern', async () => {
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === `${baseUri}/src`) {
        return [mockEntry({ isFile: true, name: 'main.ts' }), mockEntry({ isFile: false, name: 'utils' })]
      }
      return []
    },
  })

  const result = await executeGlob('src/*.ts')
  expectReadDirInvocations(mockRpc, `${baseUri}/src`)
  const expectedItems = {
    paths: ['src/main.ts'],
    pattern: 'src/*.ts',
  }
  expect(result).toEqual(expectedItems)
})

test('executeGlobTool recursively matches with ** pattern', async () => {
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === `${baseUri}/src`) {
        return [mockEntry({ isFile: true, name: 'main.ts' }), mockEntry({ isFile: false, name: 'subdir' })]
      }
      if (uri === `${baseUri}/src/subdir`) {
        return [mockEntry({ isFile: true, name: 'index.ts' }), mockEntry({ isFile: false, name: 'nested' })]
      }
      if (uri === `${baseUri}/src/subdir/nested`) {
        return [mockEntry({ isFile: true, name: 'deep.ts' })]
      }
      return []
    },
  })

  const result = await executeGlob('src/**/*.ts')
  expectReadDirInvocations(mockRpc, `${baseUri}/src`, `${baseUri}/src/subdir`, `${baseUri}/src/subdir/nested`)
  const expectedItems = {
    paths: ['src/main.ts', 'src/subdir/index.ts', 'src/subdir/nested/deep.ts'],
    pattern: 'src/**/*.ts',
  }
  expect(result).toEqual(expectedItems)
})

test('executeGlobTool matches with ** at the beginning for deep search', async () => {
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === baseUri) {
        return [mockEntry({ isFile: false, name: 'test' }), mockEntry({ isFile: false, name: 'src' })]
      }
      if (uri === `${baseUri}/test`) {
        return [mockEntry({ isFile: true, name: 'Main.test.ts' })]
      }
      if (uri === `${baseUri}/src`) {
        return [mockEntry({ isFile: true, name: 'main.ts' }), mockEntry({ isFile: false, name: 'utils' })]
      }
      if (uri === `${baseUri}/src/utils`) {
        return [mockEntry({ isFile: true, name: 'search.ts' })]
      }
      return []
    },
  })

  const result = await executeGlob('**/test/*.ts')
  expectReadDirInvocations(mockRpc, baseUri, `${baseUri}/test`, `${baseUri}/src`, `${baseUri}/src/utils`)
  const expectedItems = {
    paths: ['test/Main.test.ts'],
    pattern: '**/test/*.ts',
  }
  expect(result).toEqual(expectedItems)
})

test('executeGlobTool handles ** matching everything recursively', async () => {
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === baseUri) {
        return [mockEntry({ isFile: true, name: 'a.ts' }), mockEntry({ isFile: false, name: 'dir' })]
      }
      if (uri === `${baseUri}/dir`) {
        return [mockEntry({ isFile: true, name: 'b.ts' }), mockEntry({ isFile: false, name: 'nested' })]
      }
      if (uri === `${baseUri}/dir/nested`) {
        return [mockEntry({ isFile: true, name: 'c.ts' })]
      }
      return []
    },
  })

  const result = await executeGlob('**/*.ts')
  expectReadDirInvocations(mockRpc, baseUri, `${baseUri}/dir`, `${baseUri}/dir/nested`)
  const expectedItems = {
    paths: ['a.ts', 'dir/b.ts', 'dir/nested/c.ts'],
    pattern: '**/*.ts',
  }
  expect(result).toEqual(expectedItems)
})

test('executeGlobTool excludes .git directory by default', async () => {
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === baseUri) {
        return [mockEntry({ isFile: false, name: '.git' }), mockEntry({ isFile: true, name: 'main.ts' }), mockEntry({ isFile: false, name: 'src' })]
      }
      if (uri === `${baseUri}/.git`) {
        return [mockEntry({ isFile: false, name: 'config' })]
      }
      if (uri === `${baseUri}/src`) {
        return []
      }
      return []
    },
  })

  const result = await executeGlob('**/*.ts')
  expectReadDirInvocations(mockRpc, baseUri, `${baseUri}/src`)
  const expectedItems = {
    paths: ['main.ts'],
    pattern: '**/*.ts',
  }
  expect(result).toEqual(expectedItems)
})

test('executeGlobTool excludes node_modules directory by default', async () => {
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === baseUri) {
        return [mockEntry({ isFile: false, name: 'node_modules' }), mockEntry({ isFile: true, name: 'main.ts' })]
      }
      if (uri === `${baseUri}/node_modules`) {
        return [mockEntry({ isFile: false, name: 'lodash' })]
      }
      return []
    },
  })

  const result = await executeGlob('**/*.ts')
  expectReadDirInvocations(mockRpc, baseUri)
  const expectedItems = {
    paths: ['main.ts'],
    pattern: '**/*.ts',
  }
  expect(result).toEqual(expectedItems)
})

test('executeGlobTool excludes multiple default ignored directories', async () => {
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === baseUri) {
        return [
          mockEntry({ isFile: false, name: '.git' }),
          mockEntry({ isFile: false, name: 'node_modules' }),
          mockEntry({ isFile: false, name: '.cache' }),
          mockEntry({ isFile: false, name: 'src' }),
        ]
      }
      if (uri === `${baseUri}/src`) {
        return [mockEntry({ isFile: true, name: 'main.ts' })]
      }
      return []
    },
  })

  const result = await executeGlob('**/*.ts')
  expectReadDirInvocations(mockRpc, baseUri, `${baseUri}/src`)
  const expectedItems = {
    paths: ['src/main.ts'],
    pattern: '**/*.ts',
  }
  expect(result).toEqual(expectedItems)
})

test('executeGlobTool does not recursively walk into symlinks', async () => {
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === baseUri) {
        return [mockEntry({ isFile: true, name: 'main.ts' }), mockEntry({ isFile: false, isSymbolicLink: true, name: 'link' })]
      }
      if (uri === `${baseUri}/link`) {
        throw new Error('Should not traverse into symlink')
      }
      return []
    },
  })

  const result = await executeGlob('**/*.ts')
  expectReadDirInvocations(mockRpc, baseUri)
  const expectedItems = {
    paths: ['main.ts'],
    pattern: '**/*.ts',
  }
  expect(result).toEqual(expectedItems)
})

test('executeGlobTool returns empty array when no matches found', async () => {
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === baseUri) {
        return [mockEntry({ isFile: true, name: 'main.js' }), mockEntry({ isFile: true, name: 'config.json' })]
      }
      return []
    },
  })

  const result = await executeGlob('*.ts')
  expectReadDirInvocations(mockRpc, baseUri)
  const expectedItems = {
    paths: [],
    pattern: '*.ts',
  }
  expect(result).toEqual(expectedItems)
})

test('executeGlobTool handles nested pattern with no matches', async () => {
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === `${baseUri}/src`) {
        return [mockEntry({ isFile: true, name: 'main.js' }), mockEntry({ isFile: false, name: 'utils' })]
      }
      if (uri === `${baseUri}/src/utils`) {
        return [mockEntry({ isFile: true, name: 'search.js' })]
      }
      return []
    },
  })

  const result = await executeGlob('src/**/*.ts')
  expectReadDirInvocations(mockRpc, `${baseUri}/src`, `${baseUri}/src/utils`)
  const expectedItems = {
    paths: [],
    pattern: 'src/**/*.ts',
  }
  expect(result).toEqual(expectedItems)
})

test('executeGlobTool handles empty directory', async () => {
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === baseUri) {
        return [mockEntry({ isFile: false, name: 'empty' })]
      }
      if (uri === `${baseUri}/empty`) {
        return []
      }
      return []
    },
  })

  const result = await executeGlob('empty/**/*.ts')
  expectReadDirInvocations(mockRpc, `${baseUri}/empty`)
  const expectedItems = {
    paths: [],
    pattern: 'empty/**/*.ts',
  }
  expect(result).toEqual(expectedItems)
})

test('executeGlobTool handles single file pattern without directory', async () => {
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === baseUri) {
        return [mockEntry({ isFile: true, name: 'README.md' }), mockEntry({ isFile: true, name: 'package.json' })]
      }
      return []
    },
  })

  const result = await executeGlob('*.md')
  expectReadDirInvocations(mockRpc, baseUri)
  const expectedItems = {
    paths: ['README.md'],
    pattern: '*.md',
  }
  expect(result).toEqual(expectedItems)
})

test('executeGlobTool preserves path order consistency', async () => {
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === baseUri) {
        return [mockEntry({ isFile: true, name: 'c.ts' }), mockEntry({ isFile: true, name: 'a.ts' }), mockEntry({ isFile: true, name: 'b.ts' })]
      }
      return []
    },
  })

  const result = await executeGlob('*.ts')
  expectReadDirInvocations(mockRpc, baseUri)
  const expectedItems = {
    paths: ['a.ts', 'b.ts', 'c.ts'],
    pattern: '*.ts',
  }
  expect(result).toEqual(expectedItems)
})

test('executeGlobTool handles paths with brackets in pattern', async () => {
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === baseUri) {
        return [mockEntry({ isFile: true, name: 'a.ts' }), mockEntry({ isFile: true, name: 'b.ts' }), mockEntry({ isFile: true, name: 'c.js' })]
      }
      return []
    },
  })

  const result = await executeGlob('[ab].ts')
  expectReadDirInvocations(mockRpc, baseUri)
  const expectedItems = {
    paths: ['a.ts', 'b.ts'],
    pattern: '[ab].ts',
  }
  expect(result).toEqual(expectedItems)
})

test('executeGlobTool handles case sensitivity in extensions', async () => {
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === baseUri) {
        return [
          mockEntry({ isFile: true, name: 'main.ts' }),
          mockEntry({ isFile: true, name: 'config.TS' }),
          mockEntry({ isFile: true, name: 'test.Ts' }),
        ]
      }
      return []
    },
  })

  const result = await executeGlob('*.ts')
  expectReadDirInvocations(mockRpc, baseUri)
  const expectedItems = {
    paths: ['main.ts'],
    pattern: '*.ts',
  }
  expect(result).toEqual(expectedItems)
})

test('executeGlobTool handles multiple consecutive slashes', async () => {
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === `${baseUri}/src`) {
        return [mockEntry({ isFile: true, name: 'main.ts' })]
      }
      return []
    },
  })

  const result = await executeGlob('src//main.ts')
  expectReadDirInvocations(mockRpc, `${baseUri}/src`)
  const expectedItems = {
    paths: ['src/main.ts'],
    pattern: 'src//main.ts',
  }
  expect(result).toEqual(expectedItems)
})

test('executeGlobTool returns pattern in response', async () => {
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async () => [mockEntry({ isFile: true, name: 'test.ts' })],
  })

  const pattern = '*.ts'
  const result = await executeGlob(pattern)
  expectReadDirInvocations(mockRpc, baseUri)
  const expectedItems = {
    paths: ['test.ts'],
    pattern,
  }
  expect(result).toEqual(expectedItems)
})

test('executeGlobTool handles pattern with trailing slash', async () => {
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === `${baseUri}/src`) {
        return [mockEntry({ isFile: true, name: 'main.ts' }), mockEntry({ isFile: false, name: 'nested' })]
      }
      return []
    },
  })

  const result = await executeGlob('src/')
  expectReadDirInvocations(mockRpc, `${baseUri}/src`)
  const expectedItems = {
    paths: ['src/main.ts', 'src/nested'],
    pattern: 'src/',
  }
  expect(result).toEqual(expectedItems)
})

test('executeGlobTool returns an error when file uris are used without a file system worker rpc', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'execute-glob-tool-'))
  await mkdir(join(tempDir, 'src'))
  await mkdir(join(tempDir, 'src', 'nested'))
  await writeFile(join(tempDir, 'README.md'), '# test\n')
  await writeFile(join(tempDir, 'src', 'main.ts'), 'export const main = true\n')
  await writeFile(join(tempDir, 'src', 'nested', 'deep.ts'), 'export const deep = true\n')

  try {
    const tempUri = pathToFileURL(tempDir).href
    const result = await executeGlobTool({ baseUri: tempUri, pattern: '**/*' }, {} as never)
    const expectedItems = {
      error: expect.stringContaining('Failed to glob:'),
      pattern: '**/*',
    }
    expect(result).toEqual(expectedItems)
  } finally {
    await rm(tempDir, { force: true, recursive: true })
  }
})
