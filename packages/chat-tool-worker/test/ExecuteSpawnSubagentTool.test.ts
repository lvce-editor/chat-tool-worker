import { expect, test } from '@jest/globals'
import { executeSpawnSubagentTool } from '../src/parts/ExecuteSpawnSubagentTool/ExecuteSpawnSubagentTool.ts'

test('executeSpawnSubagentTool requires prompt', async () => {
  const result = await executeSpawnSubagentTool({}, {} as never)

  expect(result).toEqual({
    error: 'Missing required argument: prompt',
  })
})

test('executeSpawnSubagentTool returns placeholder response', async () => {
  const result = await executeSpawnSubagentTool(
    {
      prompt: 'Review the selected code',
    },
    {} as never,
  )

  expect(result).toEqual({
    ok: true,
    prompt: 'Review the selected code',
    response: 'Hello From Sub agent - not yet implemented',
  })
})
