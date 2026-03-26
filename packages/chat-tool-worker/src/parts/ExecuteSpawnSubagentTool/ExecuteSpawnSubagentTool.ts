import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'

const placeholderResponse = 'Hello From Sub agent - not yet implemented'

export const executeSpawnSubagentTool = async (
  args: Readonly<Record<string, unknown>>,
  _options: ExecuteToolOptions,
): Promise<ToolResponse> => {
  const prompt = typeof args.prompt === 'string' ? args.prompt : ''

  if (!prompt) {
    return { error: 'Missing required argument: prompt' }
  }

  return {
    ok: true,
    prompt,
    response: placeholderResponse,
  }
}
