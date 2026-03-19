/* eslint-disable @cspell/spellchecker */
/* eslint-disable e18e/prefer-url-canparse */
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
  try {
    new URL(oldUri)
    new URL(newUri)
  } catch {
    return { error: 'Invalid argument: invalid URL.' }
  }
  try {
    await RendererWorker.invoke('FileSystem.rename', oldUri, newUri)
    return { newUri, ok: true, oldUri }
  } catch (error) {
    return { ...getToolErrorPayload(error), newUri, oldUri }
  }
}
