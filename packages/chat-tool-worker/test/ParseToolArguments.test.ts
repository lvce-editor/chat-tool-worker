import { expect, test } from '@jest/globals'
import * as ParseToolArguments from '../src/parts/ParseToolArguments/ParseToolArguments.ts'

test('parseToolArguments parses object json', () => {
  expect(ParseToolArguments.parseToolArguments('{"uri":"file:///x"}')).toEqual({ uri: 'file:///x' })
})

test('parseToolArguments returns empty object for non-string input', () => {
  expect(ParseToolArguments.parseToolArguments(42)).toEqual({})
})

test('parseToolArguments returns empty object for invalid json', () => {
  expect(ParseToolArguments.parseToolArguments('{')).toEqual({})
})

test('parseToolArguments returns parsed array for array json', () => {
  expect(ParseToolArguments.parseToolArguments('[1,2,3]')).toEqual([1, 2, 3])
})
