import type { ToolResponse } from '../Types/Types.ts'

type WriteFileToolArgs = {
  readonly content: string
  readonly uri: string
}

type WriteFileToolValidationResult =
  | {
      readonly args: WriteFileToolArgs
      readonly ok: true
    }
  | {
      readonly ok: false
      readonly response: ToolResponse
    }

export const validateWriteFileToolArgs = (args: unknown): WriteFileToolValidationResult => {
  if (!args || typeof args !== 'object') {
    return {
      ok: false,
      response: {
        error: 'Invalid argument: args must be an object.',
      },
    }
  }

  if (!('uri' in args)) {
    return {
      ok: false,
      response: {
        error: 'Missing required argument: uri',
      },
    }
  }

  if (!('content' in args)) {
    return {
      ok: false,
      response: {
        error: 'Missing required argument: content',
      },
    }
  }

  const candidate = args as Readonly<Record<string, unknown>>
  if (typeof candidate.uri !== 'string') {
    return {
      ok: false,
      response: {
        error: 'Invalid argument: uri must be a string.',
      },
    }
  }

  if (typeof candidate.content !== 'string') {
    return {
      ok: false,
      response: {
        error: 'Invalid argument: content must be a string.',
      },
    }
  }

  return {
    args: {
      content: candidate.content,
      uri: candidate.uri,
    },
    ok: true,
  }
}
