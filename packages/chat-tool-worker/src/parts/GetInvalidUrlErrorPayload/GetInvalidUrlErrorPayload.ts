import type { ToolErrorPayload } from '../ToolErrorPayload/ToolErrorPayload.ts'
import { INVALID_URI_ERROR_CODE } from '../ErrorCodes/ErrorCodes.ts'

export const getInvalidUrlErrorPayload = (): ToolErrorPayload => {
  return {
    error: 'Invalid argument: invalid URL.',
    errorCode: INVALID_URI_ERROR_CODE,
  }
}
