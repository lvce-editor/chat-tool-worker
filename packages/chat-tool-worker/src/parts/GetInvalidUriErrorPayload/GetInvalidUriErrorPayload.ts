import type { ToolErrorPayload } from '../ToolErrorPayload/ToolErrorPayload.ts'
import { INVALID_URI_ERROR_CODE } from '../ErrorCodes/ErrorCodes.ts'

export const getInvalidUriErrorPayload = (argumentName: string): ToolErrorPayload => {
  return {
    error: `Invalid argument: ${argumentName} must be an absolute URI.`,
    errorCode: INVALID_URI_ERROR_CODE,
  }
}
