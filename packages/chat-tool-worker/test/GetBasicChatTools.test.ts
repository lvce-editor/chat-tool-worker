import { expect, test } from '@jest/globals'
import type { ChatTool } from '../src/parts/Types/Types.ts'
import * as GetBasicChatTools from '../src/parts/GetBasicChatTools/GetBasicChatTools.ts'

const getTool = (name: string): ChatTool => {
  for (const tool of GetBasicChatTools.getBasicChatTools()) {
    if (tool.function.name === name) {
      return tool
    }
  }

  throw new Error(`Expected tool to exist: ${name}`)
}

test('getBasicChatTools returns all expected tool names in order', () => {
  const tools = GetBasicChatTools.getBasicChatTools()
  const names = tools.map((tool) => tool.function.name)
  expect(names).toEqual([
    'read_file',
    'write_file',
    'rename',
    'edit_file',
    'list_files',
    'getWorkspaceUri',
    'render_html',
    'open_preview',
    'openEditor',
    'close_preview',
    'search_text',
    'rg',
    'grep_search',
    'run_in_terminal',
    'spawn_subagent',
    'create_directory',
    'glob',
    'update_todo',
  ])
})

test('getBasicChatTools uses function tool type and object schema', () => {
  const tools = GetBasicChatTools.getBasicChatTools()
  for (const tool of tools) {
    expect(tool.type).toBe('function')
    expect(tool.function.parameters.type).toBe('object')
    expect(tool.function.parameters.additionalProperties).toBe(false)
  }
})

test('edit_file tool defines uri and range edit arguments', () => {
  const editFileTool = getTool('edit_file')
  const { parameters } = editFileTool.function
  expect(parameters.required).toEqual(['uri', 'start', 'end', 'text'])
  expect(parameters.properties).toHaveProperty('uri')
  expect(parameters.properties).toHaveProperty('start')
  expect(parameters.properties).toHaveProperty('end')
  expect(parameters.properties).toHaveProperty('text')
})

test('rename tool defines oldUri and newUri arguments', () => {
  const renameTool = getTool('rename')
  const { parameters } = renameTool.function
  expect(parameters.required).toEqual(['oldUri', 'newUri'])
  expect(parameters.properties).toHaveProperty('oldUri')
  expect(parameters.properties).toHaveProperty('newUri')
})

test('list_files description tells model to call getWorkspaceUri first when uri is unknown', () => {
  const listFilesTool = getTool('list_files')
  expect(listFilesTool.function.description).toContain('call getWorkspaceUri first')
  expect(listFilesTool.function.description).toContain('file:///workspace')
})

test('list_files uri parameter description tells model to use returned workspaceUri value', () => {
  const listFilesTool = getTool('list_files')
  const uriProperty = listFilesTool.function.parameters.properties.uri as { readonly description: string }
  const uriDescription = uriProperty.description
  expect(uriDescription).toContain('call getWorkspaceUri first')
  expect(uriDescription).toContain('workspaceUri')
})

test('getWorkspaceUri description explains it is a prerequisite for file tools', () => {
  const getWorkspaceUriTool = getTool('getWorkspaceUri')
  expect(getWorkspaceUriTool.function.description).toContain('Call this first before using list_files')
})

test('search_text defines options object arguments for text search', () => {
  const searchTextTool = getTool('search_text')
  const { parameters } = searchTextTool.function
  expect(parameters.required).toEqual(['options'])
  const optionsProperty = parameters.properties.options as {
    readonly type: string
    readonly required: readonly string[]
    readonly properties: Readonly<Record<string, unknown>>
  }
  expect(optionsProperty.type).toBe('object')
  expect(optionsProperty.required).toEqual(['value', 'isRegex', 'matchCase', 'machWholeWord', 'exclude'])
  expect(optionsProperty.properties).toHaveProperty('value')
  expect(optionsProperty.properties).toHaveProperty('isRegex')
  expect(optionsProperty.properties).toHaveProperty('matchCase')
  expect(optionsProperty.properties).toHaveProperty('machWholeWord')
  expect(optionsProperty.properties).toHaveProperty('exclude')
})

test('run_in_terminal defines options object arguments for shell execution', () => {
  const runInTerminalTool = getTool('run_in_terminal')
  const { parameters } = runInTerminalTool.function
  expect(parameters.required).toEqual(['options'])
  const optionsProperty = parameters.properties.options as {
    readonly type: string
    readonly required: readonly string[]
    readonly properties: Readonly<Record<string, unknown>>
  }
  expect(optionsProperty.type).toBe('object')
  expect(optionsProperty.required).toEqual(['shell', 'command'])
  expect(optionsProperty.properties).toHaveProperty('shell')
  expect(optionsProperty.properties).toHaveProperty('command')
})

test('glob defines baseUri and pattern arguments for file matching', () => {
  const globTool = getTool('glob')
  const { parameters } = globTool.function
  expect(parameters.required).toEqual(['baseUri', 'pattern'])
  const baseUriProperty = parameters.properties.baseUri as {
    readonly type: string
    readonly description: string
  }
  const patternProperty = parameters.properties.pattern as {
    readonly type: string
    readonly description: string
  }
  expect(baseUriProperty.type).toBe('string')
  expect(baseUriProperty.description).toContain('getWorkspaceUri')
  expect(patternProperty.type).toBe('string')
  expect(patternProperty.description).toContain('Glob pattern')
})

test('rg defines ripgrep-style arguments for workspace search', () => {
  const rgTool = getTool('rg')
  const { parameters } = rgTool.function
  expect(parameters.required).toEqual(['pattern'])
  expect(parameters.properties).toHaveProperty('pattern')
  expect(parameters.properties).toHaveProperty('path')
  expect(parameters.properties).toHaveProperty('output_mode')
  expect(parameters.properties).toHaveProperty('-n')
})

test('grep_search defines vscode-style grep arguments for workspace search', () => {
  const grepSearchTool = getTool('grep_search')
  const { parameters } = grepSearchTool.function
  expect(parameters.required).toEqual(['query', 'isRegexp'])
  expect(parameters.properties).toHaveProperty('query')
  expect(parameters.properties).toHaveProperty('isRegexp')
  expect(parameters.properties).toHaveProperty('includePattern')
  expect(parameters.properties).toHaveProperty('maxResults')
  expect(parameters.properties).toHaveProperty('includeIgnoredFiles')
})

test('update_todo defines todos string argument for checklist updates', () => {
  const updateTodoTool = getTool('update_todo')
  const { parameters } = updateTodoTool.function
  expect(parameters.required).toEqual(['todos'])
  const todosProperty = parameters.properties.todos as {
    readonly type: string
  }
  expect(todosProperty.type).toBe('string')
})

test('spawn_subagent defines prompt string argument for subagent task delegation', () => {
  const spawnSubagentTool = getTool('spawn_subagent')
  const { parameters } = spawnSubagentTool.function
  expect(parameters.required).toEqual(['prompt'])
  const promptProperty = parameters.properties.prompt as {
    readonly type: string
    readonly description: string
  }
  expect(promptProperty.type).toBe('string')
  expect(promptProperty.description).toContain('subagent')
})
