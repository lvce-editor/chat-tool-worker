export type ParsedToolArgumentsResult =
  | {
      readonly type: 'success'
      readonly value: Record<string, unknown>
    }
  | {
      readonly type: 'error'
      readonly message: string
    }

export type VerifyToolArgumentsResult =
  | {
      readonly type: 'success'
      readonly value: Record<string, unknown>
    }
  | {
      readonly type: 'error'
      readonly message: string
    }

export type ToolCallResponse = {
  readonly role: 'tool'
  readonly tool_call_id: string
  readonly content: string
}

export type ToolArgumentSchema = {
  readonly properties: Record<string, 'string'>
  readonly required: readonly string[]
  readonly additionalProperties: boolean
}
