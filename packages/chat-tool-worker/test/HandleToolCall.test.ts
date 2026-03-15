import { expect, test } from '@jest/globals'
import { handleToolCall } from '../src/parts/HandleToolCall/HandleToolCall.ts'

test('handleToolCall should return success response for valid args', async () => {
  const result = await handleToolCall('tool-1', 'read_file', '{"uri":"file:///workspace/src/index.ts"}')
  expect(result).toEqual({
    content: '{"result":{"arguments":{"uri":"file:///workspace/src/index.ts"},"name":"read_file"},"type":"success"}',
    role: 'tool',
    tool_call_id: 'tool-1',
  })
})

test('handleToolCall should return parse error response', async () => {
  const result = await handleToolCall('tool-2', 'read_file', '{')
  expect(result).toEqual({
    content: '{"error":"Tool arguments are not valid JSON.","type":"error"}',
    role: 'tool',
    tool_call_id: 'tool-2',
  })
})

test('handleToolCall should return validation error response', async () => {
  const result = await handleToolCall('tool-3', 'write_file', '{"path":"src/index.ts"}')
  expect(result).toEqual({
    content: '{"error":"Missing required argument: content","type":"error"}',
    role: 'tool',
    tool_call_id: 'tool-3',
  })
})

test('handleToolCall should support getWorkspaceUri without arguments', async () => {
  const result = await handleToolCall('tool-4', 'getWorkspaceUri', '{}')
  expect(result).toEqual({
    content: '{"result":{"arguments":{},"name":"getWorkspaceUri"},"type":"success"}',
    role: 'tool',
    tool_call_id: 'tool-4',
  })
})

test('handleToolCall should support render_html', async () => {
  const result = await handleToolCall('tool-5', 'render_html', '{"html":"<div>Sunny</div>","css":"div{color:orange}","title":"Weather"}')
  expect(result).toEqual({
    content: '{"result":{"arguments":{"html":"<div>Sunny</div>","css":"div{color:orange}","title":"Weather"},"name":"render_html"},"type":"success"}',
    role: 'tool',
    tool_call_id: 'tool-5',
  })
})
