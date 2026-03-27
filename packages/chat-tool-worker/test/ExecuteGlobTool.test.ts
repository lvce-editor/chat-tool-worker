import { expect, test } from '@jest/globals'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import { executeGlobTool } from '../src/parts/ExecuteGlobTool/ExecuteGlobTool.ts'

// Helper to create a mock directory entry
const mockEntry = (name: string, isFile: boolean, isSymbolicLink = false) => ({
  isDirectory: () => !isFile,
  isFile: () => isFile,
  isSymbolicLink: () => isSymbolicLink,
  name,
})

// ============================================================================
// VALIDATION TESTS
// ============================================================================

test('executeGlobTool validates pattern is a non-empty string', async () => {
  const result = await executeGlobTool({}, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: pattern must be a non-empty string.',
  })
})

test('executeGlobTool rejects empty string pattern', async () => {
  const result = await executeGlobTool({ pattern: '' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: pattern must be a non-empty string.',
  })
})

test('executeGlobTool rejects non-string pattern', async () => {
  const result = await executeGlobTool({ pattern: 123 }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: pattern must be a non-empty string.',
  })
})

// ============================================================================
// SIMPLE GLOB PATTERNS (NO RECURSION)
// ============================================================================

test('executeGlobTool matches files with simple * pattern', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === 'file:///workspace/src') {
        return [mockEntry('main.ts', true), mockEntry('utils.ts', true), mockEntry('config.json', true)]
      }
      return []
    },
  })

  try {
    const result = await executeGlobTool({ pattern: 'src/*.ts' }, {} as never)
    expect(result).toMatchObject({
      paths: expect.arrayContaining(['src/main.ts', 'src/utils.ts']),
      pattern: 'src/*.ts',
    })
    expect((result as { paths: string[] }).paths).not.toContain('src/config.json')
  } finally {
    if (Symbol.dispose in mockRpc) {
      ;(mockRpc as { [Symbol.dispose]: () => void })[Symbol.dispose]()
    }
  }
})

test('executeGlobTool matches all files with pattern *', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === 'file:///workspace/src') {
        return [mockEntry('main.ts', true), mockEntry('utils.ts', true), mockEntry('config.json', true)]
      }
      return []
    },
  })

  try {
    const result = await executeGlobTool({ pattern: 'src/*' }, {} as never)
    expect(result).toMatchObject({
      paths: expect.arrayContaining(['src/main.ts', 'src/utils.ts', 'src/config.json']),
      pattern: 'src/*',
    })
  } finally {
    if (Symbol.dispose in mockRpc) {
      ;(mockRpc as { [Symbol.dispose]: () => void })[Symbol.dispose]()
    }
  }
})

test('executeGlobTool matches with ? single character wildcard', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === 'file:///workspace/src') {
        return [mockEntry('a.ts', true), mockEntry('ab.ts', true), mockEntry('b.ts', true)]
      }
      return []
    },
  })

  try {
    const result = await executeGlobTool({ pattern: 'src/?.ts' }, {} as never)
    expect(result).toMatchObject({
      paths: expect.arrayContaining(['src/a.ts', 'src/b.ts']),
      pattern: 'src/?.ts',
    })
    expect((result as { paths: string[] }).paths).not.toContain('src/ab.ts')
  } finally {
    if (Symbol.dispose in mockRpc) {
      ;(mockRpc as { [Symbol.dispose]: () => void })[Symbol.dispose]()
    }
  }
})

test('executeGlobTool filters directories with * pattern', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === 'file:///workspace/src') {
        return [mockEntry('main.ts', true), mockEntry('utils', false)]
      }
      return []
    },
  })

  try {
    const result = await executeGlobTool({ pattern: 'src/*.ts' }, {} as never)
    expect(result).toMatchObject({
      paths: ['src/main.ts'],
      pattern: 'src/*.ts',
    })
  } finally {
    if (Symbol.dispose in mockRpc) {
      ;(mockRpc as { [Symbol.dispose]: () => void })[Symbol.dispose]()
    }
  }
})

// ============================================================================
// RECURSIVE PATTERNS (**)
// ============================================================================

test('executeGlobTool recursively matches with ** pattern', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === 'file:///workspace/src') {
        return [mockEntry('main.ts', true), mockEntry('subdir', false)]
      }
      if (uri === 'file:///workspace/src/subdir') {
        return [mockEntry('index.ts', true), mockEntry('nested', false)]
      }
      if (uri === 'file:///workspace/src/subdir/nested') {
        return [mockEntry('deep.ts', true)]
      }
      return []
    },
  })

  try {
    const result = await executeGlobTool({ pattern: 'src/**/*.ts' }, {} as never)
    expect(result).toMatchObject({
      paths: expect.arrayContaining(['src/main.ts', 'src/subdir/index.ts', 'src/subdir/nested/deep.ts']),
      pattern: 'src/**/*.ts',
    })
  } finally {
    if (Symbol.dispose in mockRpc) {
      ;(mockRpc as { [Symbol.dispose]: () => void })[Symbol.dispose]()
    }
  }
})

test('executeGlobTool matches with ** at the beginning for deep search', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === 'file:///workspace') {
        return [mockEntry('test', false), mockEntry('src', false)]
      }
    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
      if (uri === 'file:///workspace/test') {
        return [mockEntry('Main.test.ts', true)]
      }
      if (uri === 'file:///workspace/src') {
        return [mockEntry('main.ts', true), mockEntry('utils', false)]
      }
      if (uri === 'file:///workspace/src/utils') {
        return [mockEntry('search.ts', true)]
      }
      return []
    },
    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
  })

  try {
 T  expect(result).toMatchObject({
      paths: expect.arrayContaining(['test/Main.test.ts']),
      pattern: '**/test/*.ts',
    })
  } finally {
    if (Symbol.dispose in mockRpc) {
      ;(mockRpc as { [Symbol.dispose]: () => void })[Symbol.dispose]()
    }
  }
})

test('executeGlobTool handles ** matching everything recursively', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === 'file:///workspace') {
        return [mockEntry('a.ts', true), mockEntry('dir', false)]
      }
    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
      if (uri === 'file:///workspace/dir') {
        return [mockEntry('b.ts', true), mockEntry('nested', false)]
      }
      if (uri === 'file:///workspace/dir/nested') {
        return [mockEntry('c.ts', true)]
      }
      return []
    },
    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
  })

  try
    expect(result).toMatchObject({
      paths: expect.arrayContaining(['a.ts', 'dir/b.ts', 'dir/nested/c.ts']),
      pattern: '**/*.ts',
    })
  } finally {
    if (Symbol.dispose in mockRpc) {
      ;(mockRpc as { [Symbol.dispose]: () => void })[Symbol.dispose]()
    }
  }
})

// ============================================================================
// EXCLUSION TESTS (.git, node_modules)
// ============================================================================

test('executeGlobTool excludes .git directory by default', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === 'file:///workspace') {
        return [mockEntry('.git', false), mockEntry('main.ts', true), mockEntry('src', false)]
      }
      if (uri ==getFilePathFromUri': async (uri: st=ing) => uri.r pl'ce('file://', ''),
    'FileSystem.reafile:///workspace/.git') {
        return [mockEntry('config', false)]
      }
      if (uri === 'file:///workspace/src') {
        return []
      }
      return []
    },
    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
  })

  try {
    expect(result).toMatchObject({
      paths: expect.arrayContaining(['main.ts']),
      pattern: '**/*.ts',
    })
    expect((result as { paths: string[] }).paths.some((p) => p.includes('.git'))).toBe(false)
  } finally {
    if (Symbol.dispose in mockRpc) {
      ;(mockRpc as { [Symbol.dispose]: () => void })[Symbol.dispose]()
    }
  }
})

test('executeGlobTool excludes node_modules directory by default', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === 'file:///workspace') {
        return [mockEntry('node_modules', false), mockEntry('main.ts', true)]
      }
      if (urtem.geiFil PathFro=Uri': async (uri: string) => uri== pl'ce('file://', ''),
    'FileSystem.reafile:///workspace/node_modules') {
        return [mockEntry('lodash', false)]
      }
      return []
    },
    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
  })

  try {
    expect(result).toMatchObject({
      paths: ['main.ts'],
      pattern: '**/*.ts',
    })
    expect((result as { paths: string[] }).paths.some((p) => p.includes('node_modules'))).toBe(false)
  } finally {
    if (Symbol.dispose in mockRpc) {
      ;(mockRpc as { [Symbol.dispose]: () => void })[Symbol.dispose]()
    }
  }
})

test('executeGlobTool excludes multiple default ignored directories', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === 'file:///workspace') {
        return [mockEntry('.git', false), mockEntry('node_modules', false), mockEntry('.cache', false), mockEntry('src', false)]
      }
      if (uri =.getFilePathFromUri': async (uri: string) => uri== pl'ce('file://', ''),
    'FileSystem.reafile:///workspace/src') {
        return [mockEntry('main.ts', true)]
      }
      return []
    },
    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
  })

  try {
    const result = await executeGlobTool({ pattern: '**/*.ts' }, {} as never)
    const paths = (result as { paths: string[] }).paths
    expect(paths).toContain('src/main.ts')
    expect(paths.some((p) => p.includes('.git'))).toBe(false)
    e
    if (Symbol.dispose in mockRpc) {
      ;(mockRpc as { [Symbol.dispose]: () => void })[Symbol.dispose]()
    }
  }
}){}

// ============================================================================
// SYMLINK TESTS
// ============================================================================

test('executeGlobTool does not recursively walk into symlinks', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === 'file:///workspace') {
        return [mockEntry('main.ts', true), mockEntry('link', false, true)] // symlink dir
      }
      if (uri === 'file:///workspace/link' && uri.includes('link')) {
        // This should NOT be called because it's a symlink
        throw new Error('Should not traverse into symlink')
      }
      return []
    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
    },
    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
  })

  try {
    const result = await executeGlobTool({ pattern: '**/*.ts' }, {} as never)
    expect(result).toMatchObject({
      paths: ['main.ts'],
      pattern: '**/*.ts',
    })
  if (Symbol.dispose in mockRpc) {
      ;(mockRpc as { [Symbol.dispose]: () => void })[Symbol.dispose]()
    }
  }
})

// ============================================================================
// EDGE CASES
// ============================================================================

test('executeGlobTool returns empty array when no matches found', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === 'file:///workspace') {
        return [mockEntry('main.js', true), mockEntry('config.json', true)]
      }
      return []
    },
    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
  })

  try {getFilePathFromUri': async (uri: sting) => uri.rplce('file://', ''),
    'FileSystem.rea
    const result = await executeGlobTool({ pattern: '*.ts' }, {} as never)
    expect(result).toMatchObject({
      paths: [],
      pattern: '*.ts',
    }
    if (Symbol.dispose in mockRpc) {
      ;(mockRpc as { [Symbol.dispose]: () => void })[Symbol.dispose]()
    }
  }
})

test('executeGlobTool handles nested pattern with no matches', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === 'file:///workspace/src') {
        return [mockEntry('main.js', true), mockEntry('utils', false)]
      }
      if (uri === 'file:///workspace/src/utils') {
        return [mockEntry('search.js', true)]
      }
      return []
    },
    'FileSystem.getFilePathFromUri': async (uri: stging) => uri.replace('file://', ''),
    'FileSystem.retFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
  })

  try {
    const result = await executeGlobTool({ pattern: 'src/**/*.ts' }, {} as never)
    expect(result).toMatchObject({
      paths: [],
      pattern: 'src/**/*.ts',
    })
    if (Symbol.dispose in mockRpc) {
      ;(mockRpc as { [Symbol.dispose]: () => void })[Symbol.dispose]()
    }
  }
})

test('executeGlobTool handles empty directory', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === 'file:///workspace/empty') {
        return []
      }
      if (uri === 'file:///workspace') {
        return [mockEntry('empty', false)]
      }
      return []
    },
    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
  })

  try {
    const result = await executeGlobTool({ pattern: 'empty/**/*.ts' }, {} as never)
    expect(result).toMatchObject({
      paths: [],
      pattern: 'empty/**/*.ts',
    })
}   if (Symbol.dispose in mockRpc) {
      ;(mockRpc as { [Symbol.dispose]: () => void })[Symbol.dispose]()
    }
  }
})

test('executeGlobTool handles single file pattern without directory', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === 'file:///workspace') {
        return [mockEntry('README.md', true), mockEntry('package.json', true)]
      }
      return []
    },
    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
  })

  try {getFilePathFromUri': async (ui: string) => uri.rplce('file://', ''),
    'FileSystem.rea
    const result = await executeGlobTool({ pattern: '*.md' }, {} as never)
    expect(result).toMatchObject({
      paths: ['README.md'],
      pattern: '*.md',
    }
    if (Symbol.dispose in mockRpc) {
      ;(mockRpc as { [Symbol.dispose]: () => void })[Symbol.dispose]()
    }
  }
})

test('executeGlobTool preserves path order consistency', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === 'file:///workspace') {
        return [mockEntry('a.ts', true), mockEntry('b.ts', true), mockEntry('c.ts', true)]
      }
      return []
    },
    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
  })

    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
  try {
    const result = await executeGlobTool({ pattern: '*.ts' }, {} as never)
    expect(result).toMatchObject({
      paths: expect.arrayContaining(['a.ts', 'b.ts', 'c.ts']),
      pattern: '*.ts',
    }
    if (Symbol.dispose in mockRpc) {
      ;(mockRpc as { [Symbol.dispose]: () => void })[Symbol.dispose]()
    }
  }
})

test('executeGlobTool handles paths with brackets in pattern', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === 'file:///workspace') {
        return [mockEntry('a.ts', true), mockEntry('b.ts', true), mockEntry('c.js', true)]
      }
      return []
    },
    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
  })

  try {getFilePathFromUi': async (uri: string) => uri.rplce('file://', ''),
    'FileSystem.rea
    const result = await executeGlobTool({ pattern: '[ab].ts' }, {} as never)
    expect(result).toMatchObject({
      paths: expect.arrayContaining(['a.ts', 'b.ts']),
      pattern: '[ab].ts',
    }
  } finally {
    if (Symbol.dispose in mockRpc) {
      ;(mockRpc as { [Symbol.dispose]: () => void })[Symbol.dispose]()
    }
  }
})

test('executeGlobTool handles case sensitivity in extensions', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === 'file:///workspace') {
        return [mockEntry('main.ts', true), mockEntry('config.TS', true), mockEntry('test.Ts', true)]
      }
      return []
    },
    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
  })

  try {tem.geFilPathFroUri': async (uri: string) => uriplce('file://', ''),
    'FileSystem.rea
    const result = await executeGlobTool({ pattern: '*.ts' }, {} as never)
    // Should match only lowercase .ts
    expect(result).toMatchObject({
      paths: ['main.ts'],
      pattern: '*.ts',
} finally {
    if (Symbol.dispose in mockRpc) {
      ;(mockRpc as { [Symbol.dispose]: () => void })[Symbol.dispose]()
    }
  }
})

test('executeGlobTool handles multiple consecutive slashes', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === 'file:///workspace/src') {
        return [mockEntry('main.ts', true)]
      }
      if (uri === 'file:///workspace') {
        return [mockEntry('src', false)]
      }
      return []
    },
    'FileSystem.getFilePathFromUgi': async (uri: string) => uri.repltce('file://', ''),
    'FileSystem.reaFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
  })

  try {
    const result = await executeGlobTool({ pattern: 'src//main.ts' }, {} as never)
    expect(result).toMatchObject({
      paths: expect.arrayContaining(['src/main.ts']),
      pattern: 'src//main.ts',
    })
    if (Symbol.dispose in mockRpc) {
      ;(mockRpc as { [Symbol.dispose]: () => void })[Symbol.dispose]()
    }
  }
})

test('executeGlobTool returns pattern in response', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => [mockEntry('test.ts', true)],
    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
  })

  try {
    const pattern = 'src/**/*.test.ts'
    const result = await executeGlobTool({ pattern }, {} as never)
    expect(result).toHaveProperty('pattern', pattern)
  } finally {
    if (Symbol.dgs ockRPathFromUriui.replacefil://''
      ;(mockRpc rsadDirWi h{ [eTypSsse]: () => void })[Symbol.[mockEntoytst.tstrue]
    }
  }
})

test('executeGlobTool handles pattern with trailing slash', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async (uri: string) => {
      if (uri === 'file:///workspace/src') {
        return [mockEntry('main.ts', true)]
      }
      if (uri === 'file:///workspace') {
        return [mockEntry('src', false)]
      }
      return []
    },
    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
    'FileSystem.getFilePathFromUri': async (uri: string) => uri.replace('file://', ''),
  })

  try {
    const result = await executeGlobTool({ pattern: 'src/' }, {} as never)
    // Should match all items in src directory
    expect(result).toMatchObject({
      paths: expect.arrayContaining(['src/main.ts']),
     
  } finally {
    if (Symbol.dispose in mockRpc) {
      ;(mockRpc as { [Symbol.dispose]: () => void })[Symbol.dispose]()
    }
  }
})
