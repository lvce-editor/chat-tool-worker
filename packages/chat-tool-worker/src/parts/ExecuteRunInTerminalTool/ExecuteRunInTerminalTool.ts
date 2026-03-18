import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'

type RunInTerminalOptions = {
  readonly shell: string
  readonly command: string
}

const getRunInTerminalOptions = (args: Readonly<Record<string, unknown>>): RunInTerminalOptions | undefined => {
  const { options } = args
  if (!options || typeof options !== 'object') {
    return undefined
  }

  const candidate = options as Record<string, unknown>
  const { command, shell } = candidate
  if (typeof command !== 'string' || typeof shell !== 'string') {
    return undefined
  }

  return {
    command,
    shell,
  }
}

export const executeRunInTerminalTool = async (args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<ToolResponse> => {
  const runInTerminalOptions = getRunInTerminalOptions(args)
  if (!runInTerminalOptions) {
    return {
      error: 'Invalid argument: options must include shell (string) and command (string).',
    }
  }

  return {
    output: {
      exitCode: 0,
      stderr: '',
      stdout: `Mock output for "${runInTerminalOptions.command}" using shell "${runInTerminalOptions.shell}"`,
    },
  }
}
