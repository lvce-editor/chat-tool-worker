import { expect, test } from '@jest/globals'
import * as ValidateWriteFileToolArgs from '../src/parts/ValidateWriteFileToolArgs/ValidateWriteFileToolArgs.ts'

test('validateWriteFileToolArgs rejects non-object args', () => {
  expect(ValidateWriteFileToolArgs.validateWriteFileToolArgs(null)).toEqual({
    ok: false,
    response: {
      error: 'Invalid argument: args must be an object.',
    },
  })
})

test('validateWriteFileToolArgs rejects missing uri', () => {
  expect(ValidateWriteFileToolArgs.validateWriteFileToolArgs({ content: '' })).toEqual({
    ok: false,
    response: {
      error: 'Missing required argument: uri',
    },
  })
})

test('validateWriteFileToolArgs rejects missing content', () => {
  expect(ValidateWriteFileToolArgs.validateWriteFileToolArgs({ uri: 'file:///workspace/file.txt' })).toEqual({
    ok: false,
    response: {
      error: 'Missing required argument: content',
    },
  })
})

test('validateWriteFileToolArgs rejects non-string uri', () => {
  expect(ValidateWriteFileToolArgs.validateWriteFileToolArgs({ content: '', uri: 42 })).toEqual({
    ok: false,
    response: {
      error: 'Invalid argument: uri must be a string.',
    },
  })
})

test('validateWriteFileToolArgs rejects non-string content', () => {
  expect(ValidateWriteFileToolArgs.validateWriteFileToolArgs({ content: 42, uri: 'file:///workspace/file.txt' })).toEqual({
    ok: false,
    response: {
      error: 'Invalid argument: content must be a string.',
    },
  })
})

test('validateWriteFileToolArgs returns parsed args for valid input', () => {
  expect(ValidateWriteFileToolArgs.validateWriteFileToolArgs({ content: 'hello', uri: 'file:///workspace/file.txt' })).toEqual({
    args: {
      content: 'hello',
      uri: 'file:///workspace/file.txt',
    },
    ok: true,
  })
})