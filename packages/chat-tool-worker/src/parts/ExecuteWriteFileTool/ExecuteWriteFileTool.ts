import { FileSystemWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { getLineDiffStats } from '../GetLineDiffStats/GetLineDiffStats.ts'
import { getInvalidUriErrorPayload, getInvalidUrlErrorPayload, getToolErrorPayload } from '../GetToolErrorPayload/GetToolErrorPayload.ts'
import { isAbsoluteUri } from '../IsAbsoluteUri/IsAbsoluteUri.ts'
import { isValidUri } from '../IsValidUri/IsValidUri.ts'

export const executeWriteFileTool = async (args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<ToolResponse> => {
  const uri = typeof args.uri === 'string' ? args.uri : ''
  const content = typeof args.content === 'string' ? args.content : ''
  if (!uri || !isAbsoluteUri(uri)) {
    return getInvalidUriErrorPayload('uri')
  }

  if (!isValidUri(uri)) {
    return getInvalidUrlErrorPayload()
  }

  try {
    const exists = await FileSystemWorker.exists(uri)
    const previousContent = exists ? await FileSystemWorker.readFile(uri) : ''
    const { addedLines, removedLines } = getLineDiffStats(previousContent, content)
    await FileSystemWorker.writeFile(uri, content)
    return { addedLines, ok: true, removedLines, uri }
  } catch (error) {
    return { ...getToolErrorPayload(error), uri }
  }
}
