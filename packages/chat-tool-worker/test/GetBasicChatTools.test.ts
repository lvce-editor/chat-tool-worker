import { expect, test } from '@jest/globals'
import * as GetBasicChatTools from '../src/parts/GetBasicChatTools/GetBasicChatTools.ts'
import type { ChatTool } from '../src/parts/Types/Types.ts'

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
  expect(names).toEqual(['read_file', 'write_file', 'list_files', 'getWorkspaceUri', 'render_html', 'open_preview', 'openEditor', 'close_preview'])
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
