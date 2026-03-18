import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'

type SearchOptions = {
  readonly value: string
  readonly isRegex: boolean
  readonly matchCase: boolean
  readonly machWholeWord: boolean
  readonly exclude: readonly string[]
}

const getSearchOptions = (args: Readonly<Record<string, unknown>>): SearchOptions | undefined => {
  const { options } = args
  if (!options || typeof options !== 'object') {
    return undefined
  }

  const candidate = options as Record<string, unknown>
  const { exclude, isRegex, machWholeWord, matchCase, value } = candidate
  if (typeof value !== 'string' || typeof isRegex !== 'boolean' || typeof matchCase !== 'boolean' || typeof machWholeWord !== 'boolean') {
    return undefined
  }
  if (!Array.isArray(exclude) || exclude.some((item) => typeof item !== 'string')) {
    return undefined
  }

  return {
    exclude,
    isRegex,
    machWholeWord,
    matchCase,
    value,
  }
}

export const executeSearchTextTool = async (args: Readonly<Record<string, unknown>>, _options: ExecuteToolOptions): Promise<ToolResponse> => {
  const searchOptions = getSearchOptions(args)
  if (!searchOptions) {
    return {
      error:
        'Invalid argument: options must include value (string), isRegex (boolean), matchCase (boolean), machWholeWord (boolean), and exclude (string[]).',
    }
  }

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
    options: searchOptions,
    results,
  }
}
