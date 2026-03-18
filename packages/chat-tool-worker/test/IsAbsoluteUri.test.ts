import { expect, test } from '@jest/globals'
import * as IsAbsoluteUri from '../src/parts/IsAbsoluteUri/IsAbsoluteUri.ts'

test('isAbsoluteUri returns true for http uri', () => {
  expect(IsAbsoluteUri.isAbsoluteUri('https://example.com/file.txt')).toBe(true)
})

test('isAbsoluteUri returns true for file uri', () => {
  expect(IsAbsoluteUri.isAbsoluteUri('file:///workspace/src/index.ts')).toBe(true)
})

test('isAbsoluteUri returns false for relative path', () => {
  expect(IsAbsoluteUri.isAbsoluteUri('src/index.ts')).toBe(false)
})

test('isAbsoluteUri returns false for malformed uri', () => {
  expect(IsAbsoluteUri.isAbsoluteUri('://missing-scheme')).toBe(false)
})
