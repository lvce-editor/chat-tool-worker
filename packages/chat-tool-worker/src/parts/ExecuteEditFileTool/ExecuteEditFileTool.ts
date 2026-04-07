import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { applyTextEdit } from '../ApplyTextEdit/ApplyTextEdit.ts'
import { getInvalidUriErrorPayload, getInvalidUrlErrorPayload, getToolErrorPayload } from '../GetToolErrorPayload/GetToolErrorPayload.ts'
import { isAbsoluteUri } from '../IsAbsoluteUri/IsAbsoluteUri.ts'

export const executeEditFileTool = async (args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<ToolResponse> => {
  const uri = typeof args.uri === 'string' ? args.uri : ''
  const start = typeof args.start === 'number' ? args.start : -1
  const end = typeof args.end === 'number' ? args.end : -1
  const text = typeof args.text === 'string' ? args.text : ''
  if (!uri || !isAbsoluteUri(uri)) {
    return getInvalidUriErrorPayload('uri')
  }

  try {
    new URL(uri)
  } catch {
    return getInvalidUrlErrorPayload()
  }

  if (!Number.isInteger(start) || start < 0) {
    return { error: 'Invalid argument: start must be a non-negative integer.' }
  }

  if (!Number.isInteger(end) || end < 0) {
    return { error: 'Invalid argument: end must be a non-negative integer.' }
  }

  if (start > end) {
    return { error: 'Invalid argument: start must be less than or equal to end.' }
  }

  try {
    const content = await RendererWorker.readFile(uri)
    const nextContent = applyTextEdit(content, start, end, text)
    await RendererWorker.writeFile(uri, nextContent)
    return { ok: true, uri }
  } catch (error) {
    return { ...getToolErrorPayload(error), uri }
  }
}
