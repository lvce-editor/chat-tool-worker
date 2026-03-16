import { expect, test } from '@jest/globals'
import * as GetToolErrorPayload from '../src/parts/GetToolErrorPayload/GetToolErrorPayload.ts'

test('getToolErrorPayload returns error and stack for Error object', () => {
  const error = new Error('boom')
  const payload = GetToolErrorPayload.getToolErrorPayload(error)
  expect(payload.error).toContain('Error: boom')
  expect(payload.errorStack).toBeDefined()
  expect(payload.stack).toBe(payload.errorStack)
})

test('getToolErrorPayload omits stack when missing', () => {
  const payload = GetToolErrorPayload.getToolErrorPayload('failure')
  expect(payload).toEqual({ error: 'failure' })
})

