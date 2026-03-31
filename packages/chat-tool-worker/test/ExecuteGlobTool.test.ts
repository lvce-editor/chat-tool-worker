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
  void mockRpc

  const result = await executeGlob('src/*.ts')
  expect(result).toMatchObject({
    paths: expect.arrayContaining(['src/main.ts', 'src/utils.ts']),
    pattern: 'src/*.ts',
  })
  expect((result as { paths: string[] }).paths).not.toContain('src/config.json')
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
  void mockRpc

  const result = await executeGlob('src/*')
  expect(result).toMatchObject({
    paths: expect.arrayContaining(['src/main.ts', 'src/utils.ts', 'src/config.json']),
    pattern: 'src/*',
  })
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
  void mockRpc

  const result = await executeGlob('src/?.ts')
  expect(result).toMatchObject({
    paths: expect.arrayContaining(['src/a.ts', 'src/b.ts']),
    pattern: 'src/?.ts',
  })
  expect((result as { paths: string[] }).paths).not.toContain('src/ab.ts')
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
  void mockRpc

  const result = await executeGlob('src/*.ts')
  expect(result).toMatchObject({
    paths: ['src/main.ts'],
    pattern: 'src/*.ts',
  })
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
  void mockRpc

  const result = await executeGlob('src/**/*.ts')
  expect(result).toMatchObject({
    paths: expect.arrayContaining(['src/main.ts', 'src/subdir/index.ts', 'src/subdir/nested/deep.ts']),
    pattern: 'src/**/*.ts',
  })
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
  void mockRpc

  const result = await executeGlob('**/test/*.ts')
  expect(result).toMatchObject({
    paths: ['test/Main.test.ts'],
    pattern: '**/test/*.ts',
  })
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
  void mockRpc

  const result = await executeGlob('**/*.ts')
  expect(result).toMatchObject({
    paths: expect.arrayContaining(['a.ts', 'dir/b.ts', 'dir/nested/c.ts']),
    pattern: '**/*.ts',
  })
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
  void mockRpc

  const result = await executeGlob('**/*.ts')
  expect(result).toMatchObject({
    paths: expect.arrayContaining(['main.ts']),
    pattern: '**/*.ts',
  })
  expect((result as { paths: string[] }).paths.some((path) => path.includes('.git'))).toBe(false)
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
  void mockRpc

  const result = await executeGlob('**/*.ts')
  expect(result).toMatchObject({
    paths: ['main.ts'],
    pattern: '**/*.ts',
  })
  expect((result as { paths: string[] }).paths.some((path) => path.includes('node_modules'))).toBe(false)
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
  void mockRpc

  const result = await executeGlob('**/*.ts')
  const { paths } = result as { paths: string[] }
  expect(paths).toContain('src/main.ts')
  expect(paths.some((path) => path.includes('.git'))).toBe(false)
  expect(paths.some((path) => path.includes('node_modules'))).toBe(false)
  expect(paths.some((path) => path.includes('.cache'))).toBe(false)
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
  void mockRpc

  const result = await executeGlob('**/*.ts')
  expect(result).toMatchObject({
    paths: ['main.ts'],
    pattern: '**/*.ts',
  })
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
  void mockRpc

  const result = await executeGlob('*.ts')
  expect(result).toMatchObject({
    paths: [],
    pattern: '*.ts',
  })
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
  void mockRpc

  const result = await executeGlob('src/**/*.ts')
  expect(result).toMatchObject({
    paths: [],
    pattern: 'src/**/*.ts',
  })
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
  void mockRpc

  const result = await executeGlob('empty/**/*.ts')
  expect(result).toMatchObject({
    paths: [],
    pattern: 'empty/**/*.ts',
  })
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
  void mockRpc

  const result = await executeGlob('*.md')
  expect(result).toMatchObject({
    paths: ['README.md'],
    pattern: '*.md',
  })
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
  void mockRpc

  const result = await executeGlob('*.ts')
  expect(result).toMatchObject({
    paths: ['a.ts', 'b.ts', 'c.ts'],
    pattern: '*.ts',
  })
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
  void mockRpc

  const result = await executeGlob('[ab].ts')
  expect(result).toMatchObject({
    paths: ['a.ts', 'b.ts'],
    pattern: '[ab].ts',
  })
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
  void mockRpc

  const result = await executeGlob('*.ts')
  expect(result).toMatchObject({
    paths: ['main.ts'],
    pattern: '*.ts',
  })
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
  void mockRpc

  const result = await executeGlob('src//main.ts')
  expect(result).toMatchObject({
    paths: ['src/main.ts'],
    pattern: 'src//main.ts',
  })
})

test('executeGlobTool returns pattern in response', async () => {
  using mockRpc = FileSystemWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async () => [mockEntry({ isFile: true, name: 'test.ts' })],
  })
  void mockRpc

  const pattern = '*.ts'
  const result = await executeGlob(pattern)
  expect(result).toHaveProperty('pattern', pattern)
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
  void mockRpc

  const result = await executeGlob('src/')
  expect(result).toMatchObject({
    paths: expect.arrayContaining(['src/main.ts', 'src/nested']),
    pattern: 'src/',
  })
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
    expect(result).toMatchObject({
      error: expect.stringContaining('Failed to glob:'),
      pattern: '**/*',
    })
  } finally {
    await rm(tempDir, { force: true, recursive: true })
  }
})
