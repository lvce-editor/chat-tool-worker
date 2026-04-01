import { DirentType } from '@lvce-editor/constants'
import { FileSystemWorker } from '@lvce-editor/rpc-registry'

export type DirEntry = {
  readonly name: string
  readonly type: number
}

// cspell:ignore venv
const DEFAULT_EXCLUDE_DIRS = new Set(['.git', 'node_modules', '.cache', '.venv', 'dist', 'build', '.next', '.nuxt'])

export const shouldExcludeDir = (dirName: string): boolean => {
  return DEFAULT_EXCLUDE_DIRS.has(dirName)
}

export const traverseDirectory = async (
  baseUri: string,
  currentPath: string,
  onEntry: (path: string, entry: DirEntry) => Promise<void>,
): Promise<void> => {
  const visited = new Set<string>()

  const visit = async (path: string): Promise<void> => {
    const uri = path === '' ? baseUri : `${baseUri}/${path}`

    if (visited.has(uri)) {
      return
    }
    visited.add(uri)

    try {
      const entries = await FileSystemWorker.readDirWithFileTypes(uri)

      for (const entry of entries) {
        const entryPath = path === '' ? entry.name : `${path}/${entry.name}`
        await onEntry(entryPath, entry)

        if (entry.type === DirentType.Directory && !shouldExcludeDir(entry.name)) {
          await visit(entryPath)
        }
      }
    } catch (error) {
      if (path === '') {
        throw error
      }
      // Ignore unreadable directories and continue with other matches.
    }
  }

  return visit(currentPath)
}
