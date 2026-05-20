import type { SearchResult } from '@lvce-editor/rpc-registry';
import { DirentType } from '@lvce-editor/constants';
import { FileSystemWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'

type SearchOptions = {
  readonly value: string
  readonly isRegex: boolean
  readonly matchCase: boolean
  readonly matchWholeWord: boolean
  readonly exclude: readonly string[]
}

const getSearchOptions = (args: Readonly<Record<string, unknown>>): SearchOptions | undefined => {
  const { options } = args
  if (!options || typeof options !== 'object') {
    return undefined
  }

  const candidate = options as Record<string, unknown>
  const { exclude, isRegex, matchCase, matchWholeWord, value } = candidate
  if (typeof value !== 'string' || typeof isRegex !== 'boolean' || typeof matchCase !== 'boolean' || typeof matchWholeWord !== 'boolean') {
    return undefined
  }
  if (!Array.isArray(exclude) || exclude.some((item) => typeof item !== 'string')) {
    return undefined
  }

  return {
    exclude,
    isRegex,
    matchCase,
    matchWholeWord,
    value,
  }
}


const searchTextManual = async (uri: string, options: any): Promise<readonly SearchResult[]> => {
  console.log({ uri })
  const results: SearchResult[] = []
  try {

    const dirents = await FileSystemWorker.readDirWithFileTypes(uri)

    for (const dirent of dirents) {
      if (dirent.type === DirentType.File) {
        const content = await FileSystemWorker.readFile(`${uri}/${dirent.name}`)
        console.log({ content })
      }
    }
    console.log({ dirents })
    return []
  } catch (error) {
    console.error('Error reading directory:', error)
    return []
  }
}

export const executeSearchTextTool = async (args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<ToolResponse> => {
  const searchOptions = getSearchOptions(args)
  if (!searchOptions) {
    return {
      error:
        'Invalid argument: options must include value (string), isRegex (boolean), matchCase (boolean), matchWholeWord (boolean), and exclude (string[]).',
    }
  }

  if ('uri' in args && typeof args.uri === 'string' && args.uri.startsWith('file://')) {
    // TODO use ripgrep
  }

  const r = await searchTextManual(args.uri, searchOptions)
  // TODO use manual search,


  const results = [
    {
      column: 12,
      line: 5,
      text: `Mock match for "${searchOptions.value}" in src/main.ts`,
      uri: 'file:///workspace/src/main.ts',
    },
    {
      column: 3,
      line: 18,
      text: `Mock match for "${searchOptions.value}" in src/utils/search.ts`,
      uri: 'file:///workspace/src/utils/search.ts',
    },
  ]

  return {
    results,
  }
}
