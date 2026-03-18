import { expect, test } from '@jest/globals'
import { applyTextEdit } from '../src/parts/ApplyTextEdit/ApplyTextEdit.ts'

test('applyTextEdit replaces the requested range', () => {
  const result = applyTextEdit('hello world', 6, 11, 'chat')
  expect(result).toBe('hello chat')
})

test('applyTextEdit inserts text when start equals end', () => {
  const result = applyTextEdit('hello', 5, 5, ' world')
  expect(result).toBe('hello world')
})

test('applyTextEdit throws for out-of-bounds range', () => {
  expect(() => applyTextEdit('hello', 0, 10, 'x')).toThrow('Invalid argument: edit range is out of bounds.')
})
