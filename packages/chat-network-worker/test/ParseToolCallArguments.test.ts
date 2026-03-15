import { expect, test } from '@jest/globals'
import { parseToolCallArguments } from '../src/parts/HandleToolCall/ParseToolCallArguments.ts'

test('parseToolCallArguments should parse object json', () => {
  const result = parseToolCallArguments('{"path":"src/index.ts"}')
  expect(result).toEqual({
    type: 'success',
    value: {
      path: 'src/index.ts',
    },
  })
})

test('parseToolCallArguments should return error for invalid json', () => {
  const result = parseToolCallArguments('{')
  expect(result).toEqual({
    message: 'Tool arguments are not valid JSON.',
    type: 'error',
  })
})

test('parseToolCallArguments should return error for non-string', () => {
  const result = parseToolCallArguments({ path: 'src/index.ts' })
  expect(result).toEqual({
    message: 'Tool arguments must be a JSON string.',
    type: 'error',
  })
})
