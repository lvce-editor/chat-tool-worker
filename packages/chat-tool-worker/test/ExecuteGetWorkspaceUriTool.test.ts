import { expect, test } from '@jest/globals'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import { executeGetWorkspaceUriTool } from '../src/parts/ExecuteGetWorkspaceUriTool/ExecuteGetWorkspaceUriTool.ts'

test('executeGetWorkspaceUriTool returns the workspace uri when renderer already returns a uri', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'Workspace.getPath': async () => 'file:///tmp/folder',
  })

  const result = await executeGetWorkspaceUriTool({}, {} as never)

  expect(result).toEqual({
    workspaceUri: 'file:///tmp/folder',
  })
  expect(mockRpc.invocations).toEqual([['Workspace.getPath']])
})

test('executeGetWorkspaceUriTool converts absolute file system paths to file uris', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'Workspace.getPath': async () => '/tmp/folder',
  })

  const result = await executeGetWorkspaceUriTool({}, {} as never)

  expect(result).toEqual({
    workspaceUri: 'file:///tmp/folder',
  })
  expect(mockRpc.invocations).toEqual([['Workspace.getPath']])
})

test('executeGetWorkspaceUriTool returns error payload when workspace uri lookup fails', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'Workspace.getPath': async () => {
      throw new Error('Failed to resolve workspace path')
    },
  })

  const result = await executeGetWorkspaceUriTool({}, {} as never)

  expect(result).toMatchObject({
    error: expect.any(String),
  })
  expect(mockRpc.invocations).toEqual([['Workspace.getPath']])
})
