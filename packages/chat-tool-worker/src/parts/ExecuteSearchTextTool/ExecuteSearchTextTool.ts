import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExecuteToolOptions, ToolResponse } from '../Types/Types.ts'
import { getToolErrorPayload } from '../GetToolErrorPayload/GetToolErrorPayload.ts'
import { type SearchOptions } from '../SearchInText/SearchInText.ts'
import { searchTextManual } from '../SearchTextManual/SearchTextManual.ts'

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

const validateRegex = (searchOptions: SearchOptions): string | undefined => {
  if (!searchOptions.isRegex) {
    return undefined
  }
  try {
    new RegExp(searchOptions.value)
    return undefined
  } catch {
    return 'Invalid argument: options.value must be a valid regular expression.'
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

  const regexError = validateRegex(searchOptions)
  if (regexError) {
    return {
      error: regexError,
    }
  }

  try {
    const workspaceUri = await RendererWorker.getWorkspacePath()
    const results = await searchTextManual(workspaceUri, searchOptions)
    return {
      results,
    }
  } catch (error) {
    return getToolErrorPayload(error)
  }
}
