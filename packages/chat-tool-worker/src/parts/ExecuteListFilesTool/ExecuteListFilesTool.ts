import { DirentType } from '@lvce-editor/constants'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { getToolErrorPayload } from '../GetToolErrorPayload/GetToolErrorPayload.ts'
import { isAbsoluteUri } from '../IsAbsoluteUri/IsAbsoluteUri.ts'

type DirEntry = {
  readonly name: string
  readonly type: number
}

type ListFilesEntryType = 'file' | 'folder' | 'symlink' | 'unknown'

type ListFilesEntry = {
  readonly name: string
  readonly type: ListFilesEntryType
}

const getEntryType = (type: number): ListFilesEntryType => {
  switch (type) {
    case DirentType.Directory:
      return 'folder'
    case DirentType.File:
      return 'file'
    case DirentType.Symlink:
      return 'symlink'
    default:
      return 'unknown'
  }
}

const mapEntry = (entry: DirEntry): ListFilesEntry => ({
  name: entry.name,
  type: getEntryType(entry.type),
})

export const executeListFilesTool = async (args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<ToolResponse> => {
  const uri = typeof args.uri === 'string' ? args.uri : ''
  if (!uri || !isAbsoluteUri(uri)) {
    return { error: 'Invalid argument: uri must be an absolute URI.' }
  }
  if (uri === 'file:///workspace' || uri.startsWith('file:///workspace/')) {
    return {
      error: 'Invalid argument: uri must be a real workspace folder URI. Call getWorkspaceUri first and use the returned workspaceUri value.',
      uri,
    }
  }
  try {
    const entries = await RendererWorker.invoke('FileSystem.readDirWithFileTypes', uri)
    return { entries: (entries as readonly DirEntry[]).map(mapEntry), uri }
  } catch (error) {
    return { ...getToolErrorPayload(error), uri }
  }
}
