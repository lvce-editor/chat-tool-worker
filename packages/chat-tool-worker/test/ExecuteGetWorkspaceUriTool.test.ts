import { expect, test } from '@jest/globals'
import { executeGetWorkspaceUriTool } from '../src/parts/ExecuteGetWorkspaceUriTool/ExecuteGetWorkspaceUriTool.ts'

test('executeGetWorkspaceUriTool returns error payload when workspace uri lookup fails', async () => {
  const result = await executeGetWorkspaceUriTool({}, {} as never)
  expect(result).toMatchObject({
    error: expect.any(String),
  })
})
