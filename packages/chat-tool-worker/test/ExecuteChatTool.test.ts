import { expect, test } from '@jest/globals'
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
