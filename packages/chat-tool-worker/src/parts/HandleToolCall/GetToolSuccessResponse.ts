import type { ToolCallResponse } from './types.ts'

export const getToolSuccessResponse = (toolCallId: string, result: Readonly<Record<string, unknown>>): ToolCallResponse => {
  return {
    content: JSON.stringify({
      result,
      type: 'success',
    }),
    role: 'tool',
    tool_call_id: toolCallId,
  }
}
