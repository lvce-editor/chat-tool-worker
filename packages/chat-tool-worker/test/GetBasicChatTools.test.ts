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
    'edit_file',
    'list_files',
    'getWorkspaceUri',
    'render_html',
    'open_preview',
    'openEditor',
    'close_preview',
    'search_text',
    'run_in_terminal',
    'create_directory',
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

test('update_todo defines todos string argument for checklist updates', () => {
  const updateTodoTool = getTool('update_todo')
  const { parameters } = updateTodoTool.function
  expect(parameters.required).toEqual(['todos'])
  const todosProperty = parameters.properties.todos as {
    readonly type: string
  }
  expect(todosProperty.type).toBe('string')
})
