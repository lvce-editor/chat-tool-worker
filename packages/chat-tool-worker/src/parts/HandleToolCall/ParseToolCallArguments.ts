import type { ParsedToolArgumentsResult } from './types.ts'

export const parseToolCallArguments = (rawArguments: unknown): ParsedToolArgumentsResult => {
  if (typeof rawArguments !== 'string') {
    return {
      message: 'Tool arguments must be a JSON string.',
      type: 'error',
    }
  }

  try {
    const parsed = JSON.parse(rawArguments) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {
        message: 'Tool arguments must decode to a JSON object.',
        type: 'error',
      }
    }

    return {
      type: 'success',
      value: parsed as Record<string, unknown>,
    }
  } catch {
    return {
      message: 'Tool arguments are not valid JSON.',
      type: 'error',
    }
  }
}
