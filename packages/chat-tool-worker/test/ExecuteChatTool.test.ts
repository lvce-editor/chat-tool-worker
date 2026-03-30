import { expect, test } from '@jest/globals'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import * as ExecuteChatTool from '../src/parts/ExecuteChatTool/ExecuteChatTool.ts'

const options = {
  assetDir: '',
  platform: 0,
}

test('executeChatTool returns unknown tool error', async () => {
  const result = await ExecuteChatTool.executeChatTool('does_not_exist', '{}', options)
  expect(result).toEqual({ error: 'Unknown tool: does_not_exist' })
})

test('executeChatTool dispatches search_text tool', async () => {
  const result = await ExecuteChatTool.executeChatTool(
    'search_text',
    JSON.stringify({
      options: {
        exclude: ['**/dist/**'],
        isRegex: false,
        machWholeWord: true,
        matchCase: true,
        value: 'TODO',
      },
    }),
    options,
  )
  expect(result).toEqual({
    options: {
      exclude: ['**/dist/**'],
      isRegex: false,
      machWholeWord: true,
      matchCase: true,
      value: 'TODO',
    },
    results: [
      {
        column: 12,
        line: 5,
        text: 'Mock match for "TODO" in src/main.ts',
        uri: 'file:///workspace/src/main.ts',
      },
      {
        column: 3,
        line: 18,
        text: 'Mock match for "TODO" in src/utils/search.ts',
        uri: 'file:///workspace/src/utils/search.ts',
      },
    ],
  })
})

test('executeChatTool dispatches rename tool', async () => {
  const result = await ExecuteChatTool.executeChatTool(
    'rename',
    JSON.stringify({
      newUri: '/workspace/new-name.ts',
      oldUri: '/workspace/old-name.ts',
    }),
    options,
  )
  expect(result).toEqual({
    error: 'Invalid argument: oldUri must be an absolute URI.',
  })
})

test('executeChatTool dispatches edit_file tool', async () => {
  const result = await ExecuteChatTool.executeChatTool(
    'edit_file',
    JSON.stringify({
      end: 0,
      start: 0,
      text: 'hello',
      uri: '/not/an/absolute/uri',
    }),
    options,
  )
  expect(result).toEqual({
    error: 'Invalid argument: uri must be an absolute URI.',
  })
})

test('executeChatTool dispatches run_in_terminal tool', async () => {
  const result = await ExecuteChatTool.executeChatTool(
    'run_in_terminal',
    JSON.stringify({
      options: {
        command: 'echo hello',
        shell: '/bin/bash',
      },
    }),
    options,
  )
  expect(result).toEqual({
    output: {
      exitCode: 0,
      stderr: '',
      stdout: 'Mock output for "echo hello" using shell "/bin/bash"',
    },
  })
})

test('executeChatTool dispatches spawn_subagent tool', async () => {
  const result = await ExecuteChatTool.executeChatTool(
    'spawn_subagent',
    JSON.stringify({
      prompt: 'Summarize the current file',
    }),
    options,
  )
  expect(result).toEqual({
    ok: true,
    prompt: 'Summarize the current file',
    response: 'Hello From Sub agent - not yet implemented',
  })
})

test('executeChatTool dispatches glob tool', async () => {
  const result = await ExecuteChatTool.executeChatTool(
    'glob',
    JSON.stringify({
      pattern: 'packages/e2e/src/*.ts',
    }),
    options,
  )
  expect(result).toEqual({
    error: "Failed to glob: Cannot read properties of undefined (reading 'invoke')",
    pattern: 'packages/e2e/src/*.ts',
  })
})

test('executeChatTool dispatches rg tool', async () => {
  const result = await ExecuteChatTool.executeChatTool(
    'rg',
    JSON.stringify({
      '-n': true,
      output_mode: 'content',
      path: '/workspace/README.md',
      pattern: 'render_html|search_text',
    }),
    options,
  )
  expect(result).toEqual({
    arguments: {
      '-n': true,
      output_mode: 'content',
      path: '/workspace/README.md',
      pattern: 'render_html|search_text',
    },
    result: 'No matches found.',
  })
})

test('executeChatTool dispatches grep_search tool', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'SearchProcess.invoke': async () => ({
      limitHit: false,
      results: [],
    }),
    'Workspace.getPath': async () => 'file:///workspace',
  })
  try {
    const result = await ExecuteChatTool.executeChatTool(
      'grep_search',
      JSON.stringify({
        includeIgnoredFiles: false,
        includePattern: 'packages/chat-tool-worker/src/**/*.ts',
        isRegexp: false,
        query: 'search text',
      }),
      options,
    )
    expect(result).toEqual({
      arguments: {
        includeIgnoredFiles: false,
        includePattern: 'packages/chat-tool-worker/src/**/*.ts',
        isRegexp: false,
        query: 'search text',
      },
      result: 'No matches found.',
      workspaceUri: 'file:///workspace',
    })
  } finally {
    if (Symbol.dispose in mockRpc) {
      ;(mockRpc as { [Symbol.dispose]: () => void })[Symbol.dispose]()
    }
  }
})

test('executeChatTool dispatches update_todo tool', async () => {
  const result = await ExecuteChatTool.executeChatTool(
    'update_todo',
    JSON.stringify({
      todos: '- [ ] Inspect\n- [ ] Implement',
    }),
    options,
  )

  expect(result).toEqual({
    message: 'TODO list updated',
    ok: true,
    previousTodos: '',
    storage: 'memory',
    todos: '- [ ] Inspect\n- [ ] Implement',
  })
})

test('executeChatTool dispatches close_preview tool', async () => {
  const result = await ExecuteChatTool.executeChatTool('close_preview', JSON.stringify({}), options)
  expect(result).toMatchObject({
    error: expect.any(String),
  })
})

test('executeChatTool dispatches create_directory tool', async () => {
  const result = await ExecuteChatTool.executeChatTool(
    'create_directory',
    JSON.stringify({
      uri: '/test/playground/newdir',
    }),
    options,
  )

  expect(result).toEqual({
    error: 'Invalid argument: uri must be an absolute URI.',
  })
})

test('executeChatTool dispatches getWorkspaceUri tool', async () => {
  const result = await ExecuteChatTool.executeChatTool('getWorkspaceUri', JSON.stringify({}), options)
  expect(result).toMatchObject({
    error: expect.any(String),
  })
})

test('executeChatTool dispatches list_files tool', async () => {
  const result = await ExecuteChatTool.executeChatTool(
    'list_files',
    JSON.stringify({
      uri: 'file:///workspace',
    }),
    options,
  )

  expect(result).toEqual({
    error: 'Invalid argument: uri must be a real workspace folder URI. Call getWorkspaceUri first and use the returned workspaceUri value.',
    uri: 'file:///workspace',
  })
})

test('executeChatTool dispatches open_preview tool', async () => {
  const result = await ExecuteChatTool.executeChatTool(
    'open_preview',
    JSON.stringify({
      uri: '/test/playground/index.js',
    }),
    options,
  )

  expect(result).toEqual({
    error: 'Invalid argument: uri must be an absolute URI.',
  })
})

test('executeChatTool dispatches openEditor tool', async () => {
  const result = await ExecuteChatTool.executeChatTool(
    'openEditor',
    JSON.stringify({
      uri: '/test/playground/index.js',
    }),
    options,
  )

  expect(result).toEqual({
    error: 'Invalid argument: uri must be an absolute URI.',
  })
})

test('executeChatTool dispatches read_file tool', async () => {
  const result = await ExecuteChatTool.executeChatTool(
    'read_file',
    JSON.stringify({
      uri: '/test/playground/index.js',
    }),
    options,
  )

  expect(result).toEqual({
    error: 'Invalid argument: uri must be an absolute URI.',
  })
})

test('executeChatTool dispatches render_html tool', async () => {
  const result = await ExecuteChatTool.executeChatTool('render_html', JSON.stringify({}), options)
  expect(result).toEqual({
    error: 'Missing required argument: html',
  })
})

test('executeChatTool dispatches write_file tool', async () => {
  const result = await ExecuteChatTool.executeChatTool(
    'write_file',
    JSON.stringify({
      content: '',
      uri: '/test/playground/index.js',
    }),
    options,
  )

  expect(result).toEqual({
    error: 'Invalid argument: uri must be an absolute URI.',
  })
})
