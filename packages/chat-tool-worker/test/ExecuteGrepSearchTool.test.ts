import { expect, test } from '@jest/globals'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import { executeGrepSearchTool } from '../src/parts/ExecuteGrepSearchTool/ExecuteGrepSearchTool.ts'

const options = {
  assetDir: '',
  platform: 0,
}

test('executeGrepSearchTool uses search-process for file workspaces', async () => {
  let called = 0
  let calledWithMethod = ''
  let calledWithOptions
  using mockRpc = RendererWorker.registerMockRpc({
    'SearchProcess.invoke': async (method: string, options: unknown) => {
      called++
      calledWithMethod = method
      calledWithOptions = options
      return {
        limitHit: false,
        results: [
          {
            end: 0,
            lineNumber: 0,
            start: 0,
            text: 'src/main.ts',
            type: 1,
          },
          {
            end: 20,
            lineNumber: 12,
            start: 6,
            text: 'const searchText = true',
            type: 2,
          },
        ],
      }
    },
    'Workspace.getPath': async () => 'file:///workspace',
  })
  const result = await executeGrepSearchTool(
    {
      includeIgnoredFiles: true,
      includePattern: 'src/**/*.ts',
      isRegexp: true,
      maxResults: 25,
      query: 'function|method|procedure',
    },
    options,
  )

  expect(called).toBe(1)
  expect(calledWithMethod).toBe('TextSearch.search')
  expect(calledWithOptions).toEqual({
    maxSearchResults: 25,
    ripGrepArgs: [
      '--hidden',
      '--no-require-git',
      '--smart-case',
      '--stats',
      '--json',
      '--threads',
      '1',
      '--ignore-case',
      '--no-ignore',
      '--glob',
      '!**/node_modules/**',
      '--glob',
      '!**/.git/**',
      '--glob',
      'src/**/*.ts',
      '--regexp',
      'function|method|procedure',
      '.',
    ],
    searchDir: '/workspace',
  })
  expect(mockRpc.invocations).toEqual([
    ['Workspace.getPath'],
    [
      'SearchProcess.invoke',
      'TextSearch.search',
      {
        maxSearchResults: 25,
        ripGrepArgs: [
          '--hidden',
          '--no-require-git',
          '--smart-case',
          '--stats',
          '--json',
          '--threads',
          '1',
          '--ignore-case',
          '--no-ignore',
          '--glob',
          '!**/node_modules/**',
          '--glob',
          '!**/.git/**',
          '--glob',
          'src/**/*.ts',
          '--regexp',
          'function|method|procedure',
          '.',
        ],
        searchDir: '/workspace',
      },
    ],
  ])
  expect(result).toEqual({
    result: 'src/main.ts:12:const searchText = true',
  })
})

test('executeGrepSearchTool formats file workspace results as xml', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'SearchProcess.invoke': async () => {
      return {
        limitHit: false,
        results: [
          {
            end: 0,
            lineNumber: 0,
            start: 0,
            text: '/workspace/src/main.ts',
            type: 1,
          },
          {
            end: 20,
            lineNumber: 12,
            start: 6,
            text: 'const searchText = true',
            type: 2,
          },
        ],
      }
    },
    'Workspace.getPath': async () => 'file:///workspace',
  })
  const result = await executeGrepSearchTool(
    {
      isRegexp: false,
      outputFormat: 'xml',
      query: 'searchText',
    },
    options,
  )

  expect(mockRpc.invocations).toEqual([
    ['Workspace.getPath'],
    [
      'SearchProcess.invoke',
      'TextSearch.search',
      {
        maxSearchResults: undefined,
        ripGrepArgs: [
          '--hidden',
          '--no-require-git',
          '--smart-case',
          '--stats',
          '--json',
          '--threads',
          '1',
          '--ignore-case',
          '--glob',
          '!**/node_modules/**',
          '--glob',
          '!**/.git/**',
          '--fixed-strings',
          '--',
          'searchText',
          '.',
        ],
        searchDir: '/workspace',
      },
    ],
  ])
  expect(result).toEqual({
    result: '1 matches\n<match path="/workspace/src/main.ts" line="12">\nconst searchText = true\n</match>',
  })
})

test('executeGrepSearchTool formats memory workspace results as json', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'ExtensionHostTextSearch.textSearchMemory2': async () => {
      return {
        limitHit: false,
        results: [['src/main.ts', [{ preview: 'const fromMemory = true' }]]],
      }
    },
    'Workspace.getPath': async () => 'memfs:///workspace',
  })
  const result = await executeGrepSearchTool(
    {
      isRegexp: false,
      outputFormat: 'json',
      query: 'fromMemory',
    },
    options,
  )

  expect(mockRpc.invocations).toEqual([
    ['Workspace.getPath'],
    [
      'ExtensionHostTextSearch.textSearchMemory2',
      'memfs',
      'memfs:///workspace',
      'fromMemory',
      {
        exclude: '',
        include: '',
        isCaseSensitive: false,
        query: 'fromMemory',
        root: 'memfs:///workspace',
        scheme: 'memfs',
        threads: 1,
        useRegularExpression: false,
      },
      '',
    ],
  ])
  expect(result).toEqual({
    count: 1,
    matches: [
      {
        path: 'src/main.ts',
        text: 'const fromMemory = true',
      },
    ],
    matchesFound: true,
  })
})

test('executeGrepSearchTool returns empty structured json results when no matches are found', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'SearchProcess.invoke': async () => {
      return {
        limitHit: false,
        results: [],
      }
    },
    'Workspace.getPath': async () => 'file:///workspace',
  })

  const result = await executeGrepSearchTool(
    {
      isRegexp: false,
      outputFormat: 'json',
      query: 'missing',
    },
    options,
  )

  expect(mockRpc.invocations).toEqual([
    ['Workspace.getPath'],
    [
      'SearchProcess.invoke',
      'TextSearch.search',
      {
        maxSearchResults: undefined,
        ripGrepArgs: [
          '--hidden',
          '--no-require-git',
          '--smart-case',
          '--stats',
          '--json',
          '--threads',
          '1',
          '--ignore-case',
          '--glob',
          '!**/node_modules/**',
          '--glob',
          '!**/.git/**',
          '--fixed-strings',
          '--',
          'missing',
          '.',
        ],
        searchDir: '/workspace',
      },
    ],
  ])
  expect(result).toEqual({
    count: 0,
    matches: [],
    matchesFound: false,
  })
})

test('executeGrepSearchTool uses memory search for non-file workspaces', async () => {
  let fallbackCalled = 0
  using mockRpc = RendererWorker.registerMockRpc({
    'ExtensionHostTextSearch.textSearchMemory': async () => {
      fallbackCalled++
      return [['src/main.ts', [{ preview: 'const fromMemory = true' }]]]
    },
    'ExtensionHostTextSearch.textSearchMemory2': async () => {
      throw new Error('new api not supported')
    },
    'Workspace.getPath': async () => 'memfs:///workspace',
  })
  const result = await executeGrepSearchTool(
    {
      includePattern: 'src/**/*.ts',
      isRegexp: false,
      query: 'fromMemory',
    },
    options,
  )

  expect(fallbackCalled).toBe(1)
  expect(mockRpc.invocations).toEqual([
    ['Workspace.getPath'],
    [
      'ExtensionHostTextSearch.textSearchMemory2',
      'memfs',
      'memfs:///workspace',
      'fromMemory',
      {
        exclude: '',
        include: 'src/**/*.ts',
        isCaseSensitive: false,
        query: 'fromMemory',
        root: 'memfs:///workspace',
        scheme: 'memfs',
        threads: 1,
        useRegularExpression: false,
      },
      '',
    ],
    [
      'ExtensionHostTextSearch.textSearchMemory',
      'memfs',
      'memfs:///workspace',
      'fromMemory',
      {
        exclude: '',
        include: 'src/**/*.ts',
        isCaseSensitive: false,
        query: 'fromMemory',
        root: 'memfs:///workspace',
        scheme: 'memfs',
        threads: 1,
        useRegularExpression: false,
      },
      '',
    ],
  ])
  expect(result).toEqual({
    result: 'src/main.ts: const fromMemory = true',
  })
})

test('executeGrepSearchTool validates grep_search argument shape', async () => {
  const result = await executeGrepSearchTool(
    {
      isRegexp: 'true',
      query: 123,
    },
    {} as never,
  )

  expect(result).toEqual({
    error:
      'Invalid argument: grep_search requires query (string), isRegexp (boolean), optional includePattern (string), optional maxResults (number), optional includeIgnoredFiles (boolean), optional useDefaultExcludes (boolean), and optional outputFormat ("xml" | "json").',
  })
})

test('executeGrepSearchTool rejects unsupported outputFormat values', async () => {
  const result = await executeGrepSearchTool(
    {
      isRegexp: false,
      outputFormat: 'text',
      query: 'searchText',
    },
    {} as never,
  )

  expect(result).toEqual({
    error:
      'Invalid argument: grep_search requires query (string), isRegexp (boolean), optional includePattern (string), optional maxResults (number), optional includeIgnoredFiles (boolean), optional useDefaultExcludes (boolean), and optional outputFormat ("xml" | "json").',
  })
})

test('executeGrepSearchTool can disable default excludes', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'SearchProcess.invoke': async () => {
      return {
        limitHit: false,
        results: [],
      }
    },
    'Workspace.getPath': async () => 'file:///workspace',
  })

  const result = await executeGrepSearchTool(
    {
      isRegexp: false,
      query: 'node_modules',
      useDefaultExcludes: false,
    },
    options,
  )

  expect(mockRpc.invocations).toEqual([
    ['Workspace.getPath'],
    [
      'SearchProcess.invoke',
      'TextSearch.search',
      {
        maxSearchResults: undefined,
        ripGrepArgs: [
          '--hidden',
          '--no-require-git',
          '--smart-case',
          '--stats',
          '--json',
          '--threads',
          '1',
          '--ignore-case',
          '--fixed-strings',
          '--',
          'node_modules',
          '.',
        ],
        searchDir: '/workspace',
      },
    ],
  ])
  expect(result).toEqual({
    result: 'No matches found.',
  })
})
