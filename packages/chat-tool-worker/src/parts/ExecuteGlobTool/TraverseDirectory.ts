import { RendererWorker } from '@lvce-editor/rpc-registry'

export type DirEntry = {
  name: string
  isFile: () => boolean
  isDirectory: () => boolean
  isSymbolicLink: () => boolean
}

const DEFAULT_EXCLUDE_DIRS = new Set(['.git', 'node_modules', '.cache', '.venv', 'dist', 'build', '.next', '.nuxt'])

export const shouldExcludeDir = (dirName: string, commonlyIgnored = true): boolean => {
  if (
    dirName.startsWith('.') && // Exclude dot files/dirs by default (like .git, .cache, etc.)
    commonlyIgnored &&
    DEFAULT_EXCLUDE_DIRS.has(dirName)
  ) {
    return true
  }
  return false
}

export const traverseDirectory = async (
  baseUri: string,
  currentPath: string,
  onEntry: (path: string, entry: DirEntry) => Promise<void>,
  visited: Set<string> = new Set(),
): Promise<void> => {
  const uri = currentPath === '' ? baseUri : `${baseUri}${currentPath === '' ? '' : '/'}${currentPath}`

  // Prevent infinite loops from symlinks
  if (visited.has(uri)) {
    return
  }
  visited.add(uri)

  try {
    const entries = (await RendererWorker.invoke('FileSystem.readDirWithFileTypes', uri)) as DirEntry[]

    for (const entry of entries) {
      const entryPath = currentPath === '' ? entry.name : `${currentPath}/${entry.name}`

      // Process the entry through callback
      await onEntry(entryPath, entry)

      // Recursively traverse directories (but not symlinks)
      if (entry.isDirectory() && !entry.isSymbolicLink() && !shouldExcludeDir(entry.name)) {
        await traverseDirectory(baseUri, entryPath, onEntry, visited)
      }
    }
  } catch {
    // Silently ignore errors reading directories
  }
}
