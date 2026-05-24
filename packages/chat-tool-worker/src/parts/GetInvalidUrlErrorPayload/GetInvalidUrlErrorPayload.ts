import { INVALID_URI_ERROR_CODE } from '../ErrorCodes/ErrorCodes.ts'
import type { ToolErrorPayload } from '../ToolErrorPayload/ToolErrorPayload.ts'

export const getInvalidUrlErrorPayload = (): ToolErrorPayload => {
  return {
    error: 'Invalid argument: invalid URL.',
    errorCode: INVALID_URI_ERROR_CODE,
  }
}