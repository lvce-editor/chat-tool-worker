import type { ToolCallResponse } from './types.ts'
import { getToolErrorResponse } from './GetToolErrorResponse.ts'
import { getToolSuccessResponse } from './GetToolSuccessResponse.ts'
import { parseToolCallArguments } from './ParseToolCallArguments.ts'
import { verifyToolCallArguments } from './VerifyToolCallArguments.ts'

export const handleToolCall = async (toolCallId: string, name: string, rawArguments: unknown): Promise<ToolCallResponse> => {
  const parsed = parseToolCallArguments(rawArguments)
  if (parsed.type === 'error') {
    return getToolErrorResponse(toolCallId, parsed.message)
  }

  const verified = verifyToolCallArguments(name, parsed.value)
  if (verified.type === 'error') {
    return getToolErrorResponse(toolCallId, verified.message)
  }

  return getToolSuccessResponse(toolCallId, {
    arguments: verified.value,
    name,
  })
}
