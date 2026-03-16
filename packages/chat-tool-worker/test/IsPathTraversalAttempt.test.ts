import { expect, test } from '@jest/globals'
import * as IsPathTraversalAttempt from '../src/parts/IsPathTraversalAttempt/IsPathTraversalAttempt.ts'

test('isPathTraversalAttempt returns false for safe relative path', () => {
  expect(IsPathTraversalAttempt.isPathTraversalAttempt('src/index.ts')).toBe(false)
})

test('isPathTraversalAttempt returns true for parent traversal', () => {
  expect(IsPathTraversalAttempt.isPathTraversalAttempt('../secret.txt')).toBe(true)
})

test('isPathTraversalAttempt returns true for absolute unix path', () => {
  expect(IsPathTraversalAttempt.isPathTraversalAttempt('/etc/passwd')).toBe(true)
})

test('isPathTraversalAttempt returns true for absolute windows path', () => {
  expect(IsPathTraversalAttempt.isPathTraversalAttempt('C:\\Windows\\system32')).toBe(true)
})

test('isPathTraversalAttempt returns true for file uri', () => {
  expect(IsPathTraversalAttempt.isPathTraversalAttempt('file:///workspace/file.txt')).toBe(true)
})

