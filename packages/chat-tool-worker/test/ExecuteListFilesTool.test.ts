import { expect, test } from '@jest/globals'
import { executeListFilesTool } from '../src/parts/ExecuteListFilesTool/ExecuteListFilesTool.ts'

test('executeListFilesTool rejects placeholder workspace uri with actionable error', async () => {
  const result = await executeListFilesTool({ uri: 'file:///workspace' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: uri must be a real workspace folder URI. Call getWorkspaceUri first and use the returned workspaceUri value.',
    uri: 'file:///workspace',
  })
})
