import { expect, test } from '@jest/globals'
import type { ChatTool } from '../src/parts/Types/Types.ts'
import { getBasicChatTools } from '../src/parts/GetBasicChatTools/GetBasicChatTools.ts'

const getTool = (name: string): ChatTool => {
  for (const tool of getBasicChatTools()) {
    if (tool.function.name === name) {
      return tool
    }
  }

  throw new Error(`Expected tool to exist: ${name}`)
}

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
