import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { getToolErrorPayload } from '../GetToolErrorPayload/GetToolErrorPayload.ts'
import * as TerminalProcess from '../TerminalProcess/TerminalProcess.ts'

type ExecuteShellCommandSuccessResult = {
  readonly exitCode: number | null
  readonly stderr: string
  readonly stdout: string
}

type ExecuteShellCommandErrorResult = {
  readonly errorCode: string | undefined
  readonly errorMessage: string
  readonly errorStack: string | undefined
}

type ExecuteShellCommandResult = ExecuteShellCommandSuccessResult | ExecuteShellCommandErrorResult

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

  try {
    const workspaceUri = await RendererWorker.getWorkspacePath()
    const result = (await TerminalProcess.invoke('Terminal.executeShellCommand', {
      args: ['-c', runInTerminalOptions.command],
      cwd: workspaceUri,
      toSpawn: runInTerminalOptions.shell,
    })) as ExecuteShellCommandResult
    return result
  } catch (error) {
    return getToolErrorPayload(error)
  }
}
