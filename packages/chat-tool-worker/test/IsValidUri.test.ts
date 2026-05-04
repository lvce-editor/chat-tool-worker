import { expect, test } from '@jest/globals'
import * as IsValidUri from '../src/parts/IsValidUri/IsValidUri.ts'

test('isValidUri returns true for http uri', () => {
  expect(IsValidUri.isValidUri('https://example.com/file.txt')).toBe(true)
})

test('isValidUri returns true for file uri', () => {
  expect(IsValidUri.isValidUri('file:///workspace/src/index.ts')).toBe(true)
})

test('isValidUri returns false for malformed uri', () => {
  expect(IsValidUri.isValidUri('invalid://[')).toBe(false)
})

test('isValidUri returns false for relative path', () => {
  expect(IsValidUri.isValidUri('src/index.ts')).toBe(false)
})
