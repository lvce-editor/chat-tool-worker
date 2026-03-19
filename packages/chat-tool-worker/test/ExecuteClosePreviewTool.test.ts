import { expect, test } from '@jest/globals'
import { executeClosePreviewTool } from '../src/parts/ExecuteClosePreviewTool/ExecuteClosePreviewTool.ts'

test('executeClosePreviewTool returns error payload when preview close fails', async () => {
  const result = await executeClosePreviewTool({}, {} as never)
  expect(result).toMatchObject({
    error: expect.any(String),
  })
})
