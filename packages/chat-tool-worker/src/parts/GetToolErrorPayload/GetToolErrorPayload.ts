type ToolErrorPayload = {
  readonly error: string
  readonly errorCode?: string
  readonly errorStack?: string
  readonly stack?: string
}

const INVALID_URI_ERROR_CODE = 'E_INVALID_URI'

export const getInvalidUriErrorPayload = (argumentName: string): ToolErrorPayload => {
  return {
    error: `Invalid argument: ${argumentName} must be an absolute URI.`,
    errorCode: INVALID_URI_ERROR_CODE,
  }
}

export const getInvalidUrlErrorPayload = (): ToolErrorPayload => {
  return {
    error: 'Invalid argument: invalid URL.',
    errorCode: INVALID_URI_ERROR_CODE,
  }
}

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
