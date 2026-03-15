import type { ToolCallResponse } from './types.ts'

export const getToolErrorResponse = (toolCallId: string, error: string): ToolCallResponse => {
  return {
    content: JSON.stringify({
      error,
      type: 'error',
    }),
    role: 'tool',
    tool_call_id: toolCallId,
  }
}
