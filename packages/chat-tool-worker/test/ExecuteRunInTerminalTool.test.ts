import { expect, test } from '@jest/globals'
import { RendererWorker, TerminalProcess } from '@lvce-editor/rpc-registry'
import { executeRunInTerminalTool } from '../src/parts/ExecuteRunInTerminalTool/ExecuteRunInTerminalTool.ts'

test('executeRunInTerminalTool executes the shell command via terminal process', async () => {
  using rendererMockRpc = RendererWorker.registerMockRpc({
    'Workspace.getPath': async () => 'file:///workspace',
  })
  using terminalProcessMockRpc = TerminalProcess.registerMockRpc({
    'Terminal.executeShellCommand': async () => ({
      exitCode: 0,
      stderr: '',
      stdout: 'hello from terminal',
    }),
  })

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
    exitCode: 0,
    stderr: '',
    stdout: 'hello from terminal',
  })
  expect(rendererMockRpc.invocations).toEqual([['Workspace.getPath']])
  expect(terminalProcessMockRpc.invocations).toEqual([
    [
      'Terminal.executeShellCommand',
      {
        args: ['-c', 'ls -la'],
        cwd: 'file:///workspace',
        toSpawn: '/bin/zsh',
      },
    ],
  ])
})

test('executeRunInTerminalTool returns terminal process error results', async () => {
  using rendererMockRpc = RendererWorker.registerMockRpc({
    'Workspace.getPath': async () => 'file:///workspace',
  })
  using terminalProcessMockRpc = TerminalProcess.registerMockRpc({
    'Terminal.executeShellCommand': async () => ({
      errorCode: 'ENOENT',
      errorMessage: 'spawn /bin/missing ENOENT',
      errorStack: 'Error: spawn /bin/missing ENOENT',
    }),
  })

  const result = await executeRunInTerminalTool(
    {
      options: {
        command: 'ls -la',
        shell: '/bin/missing',
      },
    },
    {} as never,
  )

  expect(result).toEqual({
    errorCode: 'ENOENT',
    errorMessage: 'spawn /bin/missing ENOENT',
    errorStack: 'Error: spawn /bin/missing ENOENT',
  })
  expect(rendererMockRpc.invocations).toEqual([['Workspace.getPath']])
  expect(terminalProcessMockRpc.invocations).toEqual([
    [
      'Terminal.executeShellCommand',
      {
        args: ['-c', 'ls -la'],
        cwd: 'file:///workspace',
        toSpawn: '/bin/missing',
      },
    ],
  ])
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
