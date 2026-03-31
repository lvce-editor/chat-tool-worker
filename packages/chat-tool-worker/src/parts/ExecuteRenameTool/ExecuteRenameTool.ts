/* eslint-disable @cspell/spellchecker */
import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { getToolErrorPayload } from '../GetToolErrorPayload/GetToolErrorPayload.ts'
import { isAbsoluteUri } from '../IsAbsoluteUri/IsAbsoluteUri.ts'

export const executeRenameTool = async (args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<ToolResponse> => {
  const oldUri = typeof args.oldUri === 'string' ? args.oldUri : ''
  const newUri = typeof args.newUri === 'string' ? args.newUri : ''
  if (!oldUri || !isAbsoluteUri(oldUri)) {
    return { error: 'Invalid argument: oldUri must be an absolute URI.' }
  }
  if (!newUri || !isAbsoluteUri(newUri)) {
    return { error: 'Invalid argument: newUri must be an absolute URI.' }
  }
  if (!URL.canParse(oldUri) || !URL.canParse(newUri)) {
    return { error: 'Invalid argument: invalid URL.' }
  }
  const oldUrl = new URL(oldUri)
  const newUrl = new URL(newUri)
  try {
    await RendererWorker.invoke('FileSystem.rename', oldUrl.toString(), newUrl.toString())
    return { newUri: newUrl.toString(), ok: true, oldUri: oldUrl.toString() }
  } catch (error) {
    return { ...getToolErrorPayload(error), newUri: newUrl.toString(), oldUri: oldUrl.toString() }
  }
}
