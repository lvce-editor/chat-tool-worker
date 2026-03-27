import type { ChatTool } from '../../Types/Types.ts'

export const getSpawnSubagentTool = (): ChatTool => {
  return {
    function: {
      description:
        'Spawn a subagent for a focused subtask. For now this tool is a stub and returns a fixed placeholder response while the integration is being built.',
      name: 'spawn_subagent',
      parameters: {
        additionalProperties: false,
        properties: {
          prompt: {
            description: 'Short task prompt to send to the subagent.',
            type: 'string',
          },
        },
        required: ['prompt'],
        type: 'object',
      },
    },
    type: 'function',
  }
}
