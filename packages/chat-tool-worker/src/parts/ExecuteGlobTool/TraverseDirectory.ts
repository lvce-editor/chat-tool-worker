import { FileSystemWorker } from '@lvce-editor/rpc-registry'

export type DirEntry = {
  name: string
  direntType: number
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
  visited: Set<string> = new Set(),
): Promise<void> => {
  const uri = currentPath === '' ? baseUri : `${baseUri}/${currentPath}`

  if (visited.has(uri)) {
    return
  }
  visited.add(uri)

  try {
    const entries = await FileSystemWorker.readDirWithFileTypes(uri)

    for (const entry of entries) {
      const entryPath = currentPath === '' ? entry.name : `${currentPath}/${entry.name}`
      await onEntry(entryPath, entry)

      if (entry.isDirectory() && !entry.isSymbolicLink() && !shouldExcludeDir(entry.name)) {
        await traverseDirectory(baseUri, entryPath, onEntry, visited)
      }
    }
  } catch (error) {
    if (currentPath === '') {
      throw error
    }
    // Ignore unreadable directories and continue with other matches.
  }
}
