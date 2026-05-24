import type { ToolErrorPayload } from '../ToolErrorPayload/ToolErrorPayload.ts'

export const getToolErrorPayload = (error: unknown): ToolErrorPayload => {
  const rawCode = error && typeof error === 'object' ? Reflect.get(error, 'code') : undefined
  const rawStack = error && typeof error === 'object' ? Reflect.get(error, 'stack') : undefined
  return {
    error: String(error),
    ...(typeof rawCode === 'string' && rawCode.trim()
      ? {
          errorCode: rawCode,
        }
      : {}),
    ...(typeof rawStack === 'string' && rawStack.trim()
      ? {
          errorStack: rawStack,
          stack: rawStack,
        }
      : {}),
  }
}
