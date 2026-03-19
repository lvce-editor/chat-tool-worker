import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'

type RgArgs = {
  readonly pattern: string
  readonly path?: string
  readonly output_mode?: 'content' | 'files_with_matches' | 'count'
  readonly ['-n']?: boolean
}

const getRgArgs = (args: Readonly<Record<string, unknown>>): RgArgs | undefined => {
  const { pattern, path, output_mode, '-n': lineNumbers } = args
  if (typeof pattern !== 'string') {
    return undefined
  }
  if (typeof path !== 'undefined' && typeof path !== 'string') {
    return undefined
  }
  if (typeof output_mode !== 'undefined' && output_mode !== 'content' && output_mode !== 'files_with_matches' && output_mode !== 'count') {
    return undefined
  }
  if (typeof lineNumbers !== 'undefined' && typeof lineNumbers !== 'boolean') {
    return undefined
  }
  return {
    '-n': lineNumbers,
    output_mode,
    path,
    pattern,
  }
}

export const executeRgTool = async (args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<ToolResponse> => {
  const rgArgs = getRgArgs(args)
  if (!rgArgs) {
    return {
      error:
        'Invalid argument: rg requires pattern (string), optional path (string), optional output_mode ("content" | "files_with_matches" | "count"), and optional -n (boolean).',
    }
  }

  return {
    arguments: rgArgs,
    result: 'No matches found.',
  }
}
