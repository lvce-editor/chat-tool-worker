import { expect, test } from '@jest/globals'
import { executeRunInTerminalTool } from '../src/parts/ExecuteRunInTerminalTool/ExecuteRunInTerminalTool.ts'

test('executeRunInTerminalTool returns mock terminal output', async () => {
  const result = await executeRunInTerminalTool(
    {
      options: {
        command: 'ls -la',
        shell: '/bin/zsh',
      },
    },
    {} as never,
  )

  expect(result).toEqual({
    output: {
      exitCode: 0,
      stderr: '',
      stdout: 'Mock output for "ls -la" using shell "/bin/zsh"',
    },
  })
})

test('executeRunInTerminalTool validates options object shape', async () => {
  const result = await executeRunInTerminalTool(
    {
      options: {
        shell: '/bin/bash',
      },
    },
    {} as never,
  )

  expect(result).toEqual({
    error: 'Invalid argument: options must include shell (string) and command (string).',
  })
})
