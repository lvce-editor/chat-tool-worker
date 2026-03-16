import { expect, test } from '@jest/globals'
import * as ExecuteChatTool from '../src/parts/ExecuteChatTool/ExecuteChatTool.ts'

const options = {
  assetDir: '',
  platform: 0,
}

test('executeChatTool returns unknown tool error', async () => {
  const result = await ExecuteChatTool.executeChatTool('does_not_exist', '{}', options)
  expect(result).toEqual({ error: 'Unknown tool: does_not_exist' })
})

