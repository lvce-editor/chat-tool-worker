import { expect, test } from '@jest/globals'
import * as NormalizeRelativePath from '../src/parts/NormalizeRelativePath/NormalizeRelativePath.ts'

test('normalizeRelativePath keeps normal path', () => {
  expect(NormalizeRelativePath.normalizeRelativePath('src/file.ts')).toBe('src/file.ts')
})

test('normalizeRelativePath removes dot segments', () => {
  expect(NormalizeRelativePath.normalizeRelativePath('./src/./file.ts')).toBe('src/file.ts')
})

test('normalizeRelativePath normalizes windows separators', () => {
  expect(NormalizeRelativePath.normalizeRelativePath('src\\nested\\file.ts')).toBe('src/nested/file.ts')
})

test('normalizeRelativePath returns dot for empty normalized path', () => {
  expect(NormalizeRelativePath.normalizeRelativePath('./')).toBe('.')
})

