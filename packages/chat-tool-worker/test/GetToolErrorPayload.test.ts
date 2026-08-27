import { expect, test } from '@jest/globals'
import * as GetToolErrorPayload from '../src/parts/GetToolErrorPayload/GetToolErrorPayload.ts'

test('getToolErrorPayload returns error and stack for Error object', () => {
  const error = new Error('boom')
  const payload = GetToolErrorPayload.getToolErrorPayload(error)
  expect(payload.error).toContain('Error: boom')
  expect(payload.errorStack).toBeDefined()
  expect(payload.stack).toBe(payload.errorStack)
})

test('getToolErrorPayload returns error code when present', () => {
  const error = new Error('boom') as Error & { code?: string }
  error.code = 'ENOENT'
  const payload = GetToolErrorPayload.getToolErrorPayload(error)
  expect(payload).toMatchObject({
    error: 'Error: boom',
    errorCode: 'ENOENT',
  })
})

test('getToolErrorPayload omits stack when missing', () => {
  const payload = GetToolErrorPayload.getToolErrorPayload('failure')
  expect(payload).toEqual({ error: 'failure' })
})

test('getInvalidUriErrorPayload returns absolute URI error payload', () => {
  const payload = GetToolErrorPayload.getInvalidUriErrorPayload('uri')
  expect(payload).toEqual({
    error: 'Invalid argument: uri must be an absolute URI.',
    errorCode: 'E_INVALID_URI',
  })
})

test('getInvalidUrlErrorPayload returns invalid URL payload', () => {
  const payload = GetToolErrorPayload.getInvalidUrlErrorPayload()
  expect(payload).toEqual({
    error: 'Invalid argument: invalid URL.',
    errorCode: 'E_INVALID_URI',
  })
})
