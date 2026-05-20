import { expect, test } from '@jest/globals'
import { searchInText } from '../src/parts/SearchInText/SearchInText.ts'

const uri = 'file:///workspace/src/example.ts'

const getOptions = (
  overrides: Readonly<Record<string, unknown>> = {},
): {
  readonly exclude: readonly string[]
  readonly isRegex: boolean
  readonly matchCase: boolean
  readonly matchWholeWord: boolean
  readonly value: string
} => ({
  exclude: [],
  isRegex: false,
  matchCase: false,
  matchWholeWord: false,
  value: 'needle',
  ...overrides,
})

test('searchInText finds plain text matches across lines case-insensitively', () => {
  const result = searchInText('Alpha needle\nNeedle needle', uri, getOptions())

  expect(result).toEqual([
    {
      column: 7,
      line: 1,
      text: 'Alpha needle',
      uri,
    },
    {
      column: 1,
      line: 2,
      text: 'Needle needle',
      uri,
    },
    {
      column: 8,
      line: 2,
      text: 'Needle needle',
      uri,
    },
  ])
})

test('searchInText respects matchCase for plain text searches', () => {
  const result = searchInText('needle\nNeedle\nNEEDLE', uri, getOptions({ matchCase: true }))

  expect(result).toEqual([
    {
      column: 1,
      line: 1,
      text: 'needle',
      uri,
    },
  ])
})

test('searchInText filters plain text matches to whole words', () => {
  const result = searchInText('needle needled (needle)', uri, getOptions({ matchWholeWord: true }))

  expect(result).toEqual([
    {
      column: 1,
      line: 1,
      text: 'needle needled (needle)',
      uri,
    },
    {
      column: 17,
      line: 1,
      text: 'needle needled (needle)',
      uri,
    },
  ])
})

test('searchInText finds regex matches across multiple lines', () => {
  const result = searchInText('cat bat\ncatalog cat', uri, getOptions({ isRegex: true, value: '[bc]at' }))

  expect(result).toEqual([
    {
      column: 1,
      line: 1,
      text: 'cat bat',
      uri,
    },
    {
      column: 5,
      line: 1,
      text: 'cat bat',
      uri,
    },
    {
      column: 1,
      line: 2,
      text: 'catalog cat',
      uri,
    },
    {
      column: 9,
      line: 2,
      text: 'catalog cat',
      uri,
    },
  ])
})

test('searchInText applies whole-word filtering to regex matches', () => {
  const result = searchInText('cat scatter cat', uri, getOptions({ isRegex: true, matchWholeWord: true, value: 'cat' }))

  expect(result).toEqual([
    {
      column: 1,
      line: 1,
      text: 'cat scatter cat',
      uri,
    },
    {
      column: 13,
      line: 1,
      text: 'cat scatter cat',
      uri,
    },
  ])
})

test('searchInText returns no matches for an empty query', () => {
  const result = searchInText('needle', uri, getOptions({ value: '' }))

  expect(result).toEqual([])
})

test('searchInText throws for invalid regex input', () => {
  expect(() => searchInText('needle', uri, getOptions({ isRegex: true, value: '[' }))).toThrow(SyntaxError)
})
