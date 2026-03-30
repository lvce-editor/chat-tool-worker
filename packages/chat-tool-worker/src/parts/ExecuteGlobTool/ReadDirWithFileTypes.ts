import { RendererWorker } from '@lvce-editor/rpc-registry'
import { readdir } from 'node:fs/promises'
import type { DirEntry } from './TraverseDirectory.ts'
import { getFilePathFromUri } from '../ExecuteGrepSearchTool/GetFilePathFromUri.ts'
import { getScheme } from '../ExecuteGrepSearchTool/GetScheme.ts'

export const readDirWithFileTypes = async (uri: string): Promise<readonly DirEntry[]> => {
  try {
    return (await RendererWorker.invoke('FileSystem.readDirWithFileTypes', uri)) as readonly DirEntry[]
  } catch (error) {
    if (getScheme(uri) !== 'file') {
      throw error
    }
    return readdir(getFilePathFromUri(uri), { withFileTypes: true }) as Promise<readonly DirEntry[]>
  }
}
