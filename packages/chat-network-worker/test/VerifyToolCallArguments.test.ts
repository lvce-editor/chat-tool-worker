import { expect, test } from '@jest/globals'
import { verifyToolCallArguments } from '../src/parts/HandleToolCall/VerifyToolCallArguments.ts'

test('verifyToolCallArguments should accept valid read_file args', () => {
  const result = verifyToolCallArguments('read_file', {
    uri: 'file:///workspace/src/index.ts',
  })
  expect(result).toEqual({
    type: 'success',
    value: {
      uri: 'file:///workspace/src/index.ts',
    },
  })
})

test('verifyToolCallArguments should reject unknown tools', () => {
  const result = verifyToolCallArguments('unknown_tool', {})
  expect(result).toEqual({
    message: 'Unknown tool: unknown_tool',
    type: 'error',
  })
})

test('verifyToolCallArguments should accept valid getWorkspaceUri args', () => {
  const result = verifyToolCallArguments('getWorkspaceUri', {})
  expect(result).toEqual({
    type: 'success',
    value: {},
  })
})

test('verifyToolCallArguments should reject unexpected getWorkspaceUri args', () => {
  const result = verifyToolCallArguments('getWorkspaceUri', {
    path: '.',
  })
  expect(result).toEqual({
    message: 'Unexpected argument: path',
    type: 'error',
  })
})

test('verifyToolCallArguments should reject missing required args', () => {
  const result = verifyToolCallArguments('write_file', {
    path: 'src/index.ts',
  })
  expect(result).toEqual({
    message: 'Missing required argument: content',
    type: 'error',
  })
})

test('verifyToolCallArguments should reject invalid arg type', () => {
  const result = verifyToolCallArguments('read_file', {
    uri: 123,
  })
  expect(result).toEqual({
    message: 'Invalid argument type for uri: expected string',
    type: 'error',
  })
})

test('verifyToolCallArguments should reject unexpected args', () => {
  const result = verifyToolCallArguments('list_files', {
    extra: true,
  })
  expect(result).toEqual({
    message: 'Unexpected argument: extra',
    type: 'error',
  })
})

test('verifyToolCallArguments should accept valid render_html args', () => {
  const result = verifyToolCallArguments('render_html', {
    css: '.card { color: blue; }',
    html: '<div class="card">Cloudy</div>',
    title: 'Weather',
  })
  expect(result).toEqual({
    type: 'success',
    value: {
      css: '.card { color: blue; }',
      html: '<div class="card">Cloudy</div>',
      title: 'Weather',
    },
  })
})
