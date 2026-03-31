import { expect, test } from '@jest/globals'
import { DirentType } from '@lvce-editor/constants'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import { executeListFilesTool } from '../src/parts/ExecuteListFilesTool/ExecuteListFilesTool.ts'

test('executeListFilesTool returns readable entry types', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes': async () => [
      { name: 'package.json', type: DirentType.File },
      { name: 'src', type: DirentType.Directory },
      { name: 'current', type: DirentType.Symlink },
    ],
  })

  const result = await executeListFilesTool({ uri: 'file:///test/workspace' }, {} as never)
  expect(mockRpc.invocations).toEqual([['FileSystem.readDirWithFileTypes', 'file:///test/workspace']])
  expect(result).toEqual({
    entries: [
      { name: 'package.json', type: 'file' },
      { name: 'src', type: 'folder' },
      { name: 'current', type: 'symlink' },
    ],
    uri: 'file:///test/workspace',
  })
})

test('executeListFilesTool rejects placeholder workspace uri with actionable error', async () => {
  const result = await executeListFilesTool({ uri: 'file:///workspace' }, {} as never)
  expect(result).toEqual({
    error: 'Invalid argument: uri must be a real workspace folder URI. Call getWorkspaceUri first and use the returned workspaceUri value.',
    uri: 'file:///workspace',
  })
})
