import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'

export const executeGlobTool = async (args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<ToolResponse> => {
  const pattern = typeof args.pattern === 'string' ? args.pattern : ''
  if (!pattern) {
    return {
      error: 'Invalid argument: pattern must be a non-empty string.',
    }
  }

  const paths = ['./src/main.ts', './src/utils/search.ts', './test/Main.test.ts']
  return {
    paths,
    pattern,
  }
}
