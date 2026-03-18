import { expect, test } from '@jest/globals'
import * as GetBasicChatTools from '../src/parts/GetBasicChatTools/GetBasicChatTools.ts'

test('getBasicChatTools returns all expected tool names in order', () => {
  const tools = GetBasicChatTools.getBasicChatTools()
  const names = tools.map((tool) => tool.function.name)
  expect(names).toEqual(['read_file', 'write_file', 'list_files', 'getWorkspaceUri', 'render_html', 'open_preview', 'close_preview'])
})

test('getBasicChatTools uses function tool type and object schema', () => {
  const tools = GetBasicChatTools.getBasicChatTools()
  for (const tool of tools) {
    expect(tool.type).toBe('function')
    expect(tool.function.parameters.type).toBe('object')
    expect(tool.function.parameters.additionalProperties).toBe(false)
  }
})
